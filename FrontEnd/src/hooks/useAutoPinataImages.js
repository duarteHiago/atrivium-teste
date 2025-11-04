/**
 * Hook para usar imagens do Pinata com sincronização automática
 */

import { useState, useEffect, useCallback } from 'react';
import PinataAutoSync from '../services/pinataAutoSync.service';
import PinataService from '../services/pinata.service';

export const useAutoPinataImages = (category = null) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncStats, setSyncStats] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  /**
   * Carrega imagens do cache ou força sincronização
   */
  const loadImages = useCallback(() => {
    try {
      setLoading(true);
      const cachedImages = PinataAutoSync.getCachedImages(category);
      setImages(cachedImages);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar imagens:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category]);

  /**
   * Força uma nova sincronização
   */
  const forceSync = useCallback(async () => {
    setLoading(true);
    await PinataAutoSync.syncNow();
    loadImages();
  }, [loadImages]);

  /**
   * Faz upload de nova imagem e adiciona ao cache
   */
  const uploadImage = useCallback(async (file, metadata = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const uploadCategory = metadata.category || category || 'general';
      const result = await PinataService.uploadImage(file, {
        ...metadata,
        category: uploadCategory
      });
      
      // Adiciona ao cache automaticamente
      PinataAutoSync.addToCache(result, uploadCategory);
      
      // Recarrega imagens se for da categoria atual
      if (!category || category === uploadCategory) {
        loadImages();
      }
      
      return result;
    } catch (err) {
      setError('Erro ao fazer upload da imagem');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [category, loadImages]);

  /**
   * Remove imagem
   */
  const removeImage = useCallback(async (hash) => {
    try {
      setLoading(true);
      await PinataService.removeImage(hash);
      
      // Remove do cache
      PinataAutoSync.removeFromCache(hash);
      
      // Recarrega imagens
      loadImages();
      return true;
    } catch (err) {
      setError('Erro ao remover imagem');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadImages]);

  /**
   * Busca imagens por query
   */
  const searchImages = useCallback((query) => {
    if (!query.trim()) return images;
    
    return images.filter(image => 
      image.name.toLowerCase().includes(query.toLowerCase()) ||
      (image.metadata?.description || '').toLowerCase().includes(query.toLowerCase()) ||
      (image.metadata?.keyvalues?.tags || []).some(tag => 
        tag.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [images]);

  /**
   * Obtém imagens em destaque (para Discover)
   */
  const getFeaturedImages = useCallback((limit = 8) => {
    return PinataAutoSync.getFeaturedImages(limit);
  }, []);

  /**
   * Obtém estatísticas da sincronização
   */
  const getStats = useCallback(() => {
    return PinataAutoSync.getStats();
  }, []);

  // Carrega imagens iniciais
  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // Listener para eventos de sincronização
  useEffect(() => {
    const handleSyncEvent = (event, data) => {
      switch (event) {
        case 'sync_complete':
          setSyncStats(data);
          loadImages();
          break;
        case 'sync_error':
          setError('Erro na sincronização automática');
          break;
        case 'image_added':
          if (!category || category === data.category) {
            loadImages();
          }
          break;
        case 'image_removed':
          loadImages();
          break;
        case 'cache_cleared':
          setImages([]);
          break;
        default:
          break;
      }
    };

    const unsubscribe = PinataAutoSync.addListener(handleSyncEvent);
    
    return unsubscribe;
  }, [category, loadImages]);

  // Atualiza estatísticas periodicamente
  useEffect(() => {
    const updateStats = () => {
      setSyncStats(PinataAutoSync.getStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 30000); // A cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  return {
    // Estado
    images,
    loading,
    error,
    syncStats,
    lastUpdate,
    
    // Ações
    uploadImage,
    removeImage,
    forceSync,
    searchImages,
    getFeaturedImages,
    getStats,
    
    // Helpers
    isEmpty: !loading && images.length === 0,
    isAutoSyncing: syncStats?.isRunning || false,
    lastSyncTime: syncStats?.lastSync,
    nextSyncTime: syncStats?.nextSync,
    totalCached: syncStats?.totalCached || 0
  };
};