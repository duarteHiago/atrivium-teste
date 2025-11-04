/**
 * Serviço de Sincronização Automática do Pinata
 * Sincroniza imagens automaticamente em intervalos regulares
 */

import PinataService from './pinata.service';

class PinataAutoSync {
  constructor() {
    this.syncInterval = 5 * 60 * 1000; // 5 minutos
    this.isRunning = false;
    this.lastSync = null;
    this.cache = new Map();
    this.listeners = new Set();
    this.intervalId = null;
    
    // Configurações
    this.config = {
      autoStart: true,
      maxRetries: 3,
      categories: ['nft', 'avatar', 'collection', 'general'],
      maxImagesPerCategory: 100
    };

    // Inicia automaticamente se habilitado
    if (this.config.autoStart) {
      this.start();
    }
  }

  /**
   * Inicia a sincronização automática
   */
  start() {
    if (this.isRunning) return;
    
    console.log('🔄 Iniciando sincronização automática do Pinata...');
    this.isRunning = true;
    
    // Sincronização inicial
    this.syncNow();
    
    // Configura intervalo
    this.intervalId = setInterval(() => {
      this.syncNow();
    }, this.syncInterval);
    
    // Sincroniza quando a aba voltar ao foco
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.shouldSync()) {
        this.syncNow();
      }
    });
  }

  /**
   * Para a sincronização automática
   */
  stop() {
    if (!this.isRunning) return;
    
    console.log('⏹️ Parando sincronização automática do Pinata...');
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Força uma sincronização imediata
   */
  async syncNow() {
    if (!this.isRunning) return;
    
    console.log('🔄 Sincronizando imagens do Pinata...');
    
    try {
      // Testa conexão primeiro
      const connectionTest = await PinataService.testConnection();
      if (!connectionTest.success) {
        throw new Error('Falha na conexão com Pinata');
      }

      const syncResults = {
        timestamp: new Date(),
        totalImages: 0,
        newImages: 0,
        updatedImages: 0,
        categories: {},
        errors: []
      };

      // Sincroniza cada categoria
      for (const category of this.config.categories) {
        try {
          const images = await this.syncCategory(category);
          syncResults.categories[category] = images;
          syncResults.totalImages += images.length;
          
          // Conta novas e atualizadas
          images.forEach(image => {
            const cacheKey = `${category}_${image.hash}`;
            if (!this.cache.has(cacheKey)) {
              syncResults.newImages++;
            } else if (this.cache.get(cacheKey).uploadedAt !== image.uploadedAt) {
              syncResults.updatedImages++;
            }
            this.cache.set(cacheKey, image);
          });
          
        } catch (error) {
          console.error(`Erro ao sincronizar categoria ${category}:`, error);
          syncResults.errors.push(`${category}: ${error.message}`);
        }
      }

      this.lastSync = syncResults.timestamp;
      this.notifyListeners('sync_complete', syncResults);
      
      console.log('✅ Sincronização concluída:', {
        total: syncResults.totalImages,
        novas: syncResults.newImages,
        atualizadas: syncResults.updatedImages
      });

    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      this.notifyListeners('sync_error', error);
    }
  }

  /**
   * Sincroniza uma categoria específica
   */
  async syncCategory(category) {
    const images = await PinataService.getImagesByCategory(category);
    
    // Armazena no cache local para acesso rápido
    const cacheKey = `category_${category}`;
    this.cache.set(cacheKey, {
      images,
      timestamp: new Date(),
      category
    });

    return images;
  }

  /**
   * Obtém imagens do cache (acesso rápido)
   */
  getCachedImages(category = null) {
    if (category) {
      const cached = this.cache.get(`category_${category}`);
      return cached ? cached.images : [];
    }
    
    // Retorna todas as categorias
    const allImages = [];
    for (const cat of this.config.categories) {
      const cached = this.cache.get(`category_${cat}`);
      if (cached) {
        allImages.push(...cached.images);
      }
    }
    return allImages;
  }

  /**
   * Obtém imagens em destaque para o Discover
   * Prioriza imagens maiores e mais recentes
   */
  getFeaturedImages(limit = 8) {
    const allImages = this.getCachedImages();
    
    // Ordena por relevância: tamanho + data recente
    const sortedImages = allImages.sort((a, b) => {
      const scoreA = this.calculateImageScore(a);
      const scoreB = this.calculateImageScore(b);
      return scoreB - scoreA;
    });

    return sortedImages.slice(0, limit);
  }

  /**
   * Calcula pontuação de uma imagem para ranking
   */
  calculateImageScore(image) {
    let score = 0;
    
    // Pontuação por tamanho (imagens maiores são mais interessantes)
    const sizeMB = image.size / (1024 * 1024);
    score += Math.min(sizeMB * 10, 50); // Max 50 pontos por tamanho
    
    // Pontuação por data (mais recentes são melhores)
    const daysSinceUpload = (Date.now() - new Date(image.uploadedAt).getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 30 - daysSinceUpload); // Max 30 pontos, decresce com tempo
    
    // Bonificação por categoria
    const category = image.metadata?.keyvalues?.category || 'general';
    switch (category) {
      case 'nft':
        score += 20;
        break;
      case 'collection':
        score += 15;
        break;
      case 'avatar':
        score += 10;
        break;
      default:
        score += 5;
    }
    
    // Bonificação por nome descritivo
    if (image.name && image.name.length > 10) {
      score += 5;
    }
    
    return score;
  }

  /**
   * Verifica se deve sincronizar baseado no tempo
   */
  shouldSync() {
    if (!this.lastSync) return true;
    const timeSinceLastSync = Date.now() - this.lastSync.getTime();
    return timeSinceLastSync > this.syncInterval;
  }

  /**
   * Adiciona um listener para eventos de sincronização
   */
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notifica todos os listeners
   */
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Erro em listener:', error);
      }
    });
  }

  /**
   * Obtém estatísticas da sincronização
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      lastSync: this.lastSync,
      totalCached: this.cache.size,
      syncInterval: this.syncInterval,
      categories: this.config.categories,
      nextSync: this.lastSync 
        ? new Date(this.lastSync.getTime() + this.syncInterval)
        : null
    };
  }

  /**
   * Configura o intervalo de sincronização
   */
  setSyncInterval(minutes) {
    this.syncInterval = minutes * 60 * 1000;
    
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  /**
   * Limpa o cache
   */
  clearCache() {
    this.cache.clear();
    this.notifyListeners('cache_cleared');
  }

  /**
   * Adiciona uma imagem ao cache (quando fizer upload)
   */
  addToCache(image, category = 'general') {
    const cacheKey = `${category}_${image.hash}`;
    this.cache.set(cacheKey, image);
    
    // Atualiza cache da categoria
    const categoryKey = `category_${category}`;
    const cached = this.cache.get(categoryKey);
    if (cached) {
      cached.images.unshift(image); // Adiciona no início
      this.cache.set(categoryKey, cached);
    }
    
    this.notifyListeners('image_added', { image, category });
  }

  /**
   * Remove uma imagem do cache
   */
  removeFromCache(hash) {
    // Remove da cache individual
    for (const [key] of this.cache) {
      if (key.endsWith(`_${hash}`)) {
        this.cache.delete(key);
      }
    }
    
    // Remove das categorias
    for (const category of this.config.categories) {
      const categoryKey = `category_${category}`;
      const cached = this.cache.get(categoryKey);
      if (cached) {
        cached.images = cached.images.filter(img => img.hash !== hash);
        this.cache.set(categoryKey, cached);
      }
    }
    
    this.notifyListeners('image_removed', { hash });
  }
}

// Singleton instance
export default new PinataAutoSync();