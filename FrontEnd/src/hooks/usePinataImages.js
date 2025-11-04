/**
 * Hook personalizado para gerenciar imagens do Pinata
 */

import { useState, useEffect, useCallback } from 'react';
import PinataService from '../services/pinata.service';

export const usePinataImages = (category = null, autoLoad = true) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('unknown'); // unknown, connected, error

  /**
   * Carrega imagens do Pinata
   */
  const loadImages = useCallback(async (limit = 50) => {
    try {
      setLoading(true);
      setError(null);
      
      let imageList;
      
      if (category) {
        switch (category) {
          case 'nft':
            imageList = await PinataService.getNFTImages();
            break;
          case 'avatar':
            imageList = await PinataService.getAvatarImages();
            break;
          case 'collection':
            imageList = await PinataService.getCollectionImages();
            break;
          default:
            imageList = await PinataService.getImagesByCategory(category);
        }
      } else {
        imageList = await PinataService.listImages(limit);
      }
      
      setImages(imageList);
      setConnectionStatus('connected');
    } catch (err) {
      console.error('Erro ao carregar imagens:', err);
      setError(err.message);
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  }, [category]);

  /**
   * Testa conexão com Pinata
   */
  const testConnection = useCallback(async () => {
    try {
      setConnectionStatus('unknown');
      const result = await PinataService.testConnection();
      setConnectionStatus(result.success ? 'connected' : 'error');
      return result;
    } catch (err) {
      setConnectionStatus('error');
      setError('Falha na conexão com Pinata');
      throw err;
    }
  }, []);

  /**
   * Adiciona uma nova imagem
   */
  const addImage = useCallback((newImage) => {
    setImages(prev => [newImage, ...prev]);
  }, []);

  /**
   * Remove uma imagem
   */
  const removeImage = useCallback(async (hash) => {
    try {
      setLoading(true);
      await PinataService.removeImage(hash);
      setImages(prev => prev.filter(img => img.hash !== hash));
      return true;
    } catch (err) {
      setError('Erro ao remover imagem');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Faz upload de nova imagem
   */
  const uploadImage = useCallback(async (file, metadata = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await PinataService.uploadImage(file, metadata);
      addImage(result);
      
      return result;
    } catch (err) {
      setError('Erro ao fazer upload da imagem');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addImage]);

  /**
   * Recarrega as imagens
   */
  const refresh = useCallback(() => {
    loadImages();
  }, [loadImages]);

  /**
   * Busca imagens por nome
   */
  const searchImages = useCallback((query) => {
    if (!query.trim()) return images;
    
    return images.filter(image => 
      image.name.toLowerCase().includes(query.toLowerCase()) ||
      (image.metadata?.description || '').toLowerCase().includes(query.toLowerCase())
    );
  }, [images]);

  // Carrega imagens automaticamente
  useEffect(() => {
    if (autoLoad) {
      loadImages();
    }
  }, [loadImages, autoLoad]);

  // Testa conexão na inicialização
  useEffect(() => {
    testConnection();
  }, [testConnection]);

  return {
    // Estado
    images,
    loading,
    error,
    connectionStatus,
    
    // Ações
    loadImages,
    testConnection,
    addImage,
    removeImage,
    uploadImage,
    refresh,
    searchImages,
    
    // Helpers
    isConnected: connectionStatus === 'connected',
    hasError: connectionStatus === 'error' || !!error,
    isEmpty: !loading && images.length === 0
  };
};