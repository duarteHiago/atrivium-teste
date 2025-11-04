/**
 * Serviço para gerenciar imagens do Pinata IPFS
 */

import { API_BASE } from '../config/api';

class PinataService {
  constructor() {
    this.baseUrl = `${API_BASE}/api/ipfs`;
  }

  /**
   * Testa a conexão com Pinata
   */
  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/test`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao testar conexão Pinata:', error);
      throw error;
    }
  }

  /**
   * Lista todas as imagens salvas no Pinata
   * @param {number} limit - Limite de imagens a buscar (padrão: 50)
   * @returns {Promise<Array>} Lista de imagens
   */
  async listImages(limit = 50) {
    try {
      const response = await fetch(`${this.baseUrl}/list?limit=${limit}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        // Filtra apenas arquivos de imagem
        const images = data.data.rows?.filter(file => {
          const name = file.metadata?.name || '';
          return this.isImageFile(name);
        }).map(file => ({
          id: file.id,
          hash: file.ipfs_pin_hash,
          name: file.metadata?.name || 'Sem nome',
          size: file.size,
          url: this.getPublicUrl(file.ipfs_pin_hash),
          uploadedAt: file.date_pinned,
          metadata: file.metadata
        })) || [];

        return images;
      }
      
      return [];
    } catch (error) {
      console.error('Erro ao listar imagens:', error);
      throw error;
    }
  }

  /**
   * Busca imagens por categoria ou tags
   * @param {string} category - Categoria a buscar
   * @returns {Promise<Array>} Lista de imagens filtradas
   */
  async getImagesByCategory(category) {
    try {
      const allImages = await this.listImages(100);
      return allImages.filter(image => {
        const metadata = image.metadata?.keyvalues || {};
        return metadata.category === category || 
               metadata.tags?.includes(category) ||
               image.name.toLowerCase().includes(category.toLowerCase());
      });
    } catch (error) {
      console.error('Erro ao buscar imagens por categoria:', error);
      throw error;
    }
  }

  /**
   * Busca imagens de NFTs
   * @returns {Promise<Array>} Lista de imagens de NFT
   */
  async getNFTImages() {
    return this.getImagesByCategory('nft');
  }

  /**
   * Busca imagens de avatares
   * @returns {Promise<Array>} Lista de imagens de avatar
   */
  async getAvatarImages() {
    return this.getImagesByCategory('avatar');
  }

  /**
   * Busca imagens de coleções
   * @returns {Promise<Array>} Lista de imagens de coleção
   */
  async getCollectionImages() {
    return this.getImagesByCategory('collection');
  }

  /**
   * Obtém URL pública de um hash IPFS
   * @param {string} hash - Hash IPFS
   * @returns {string} URL pública
   */
  getPublicUrl(hash) {
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }

  /**
   * Faz upload de uma nova imagem
   * @param {File} file - Arquivo de imagem
   * @param {Object} metadata - Metadados da imagem
   * @returns {Promise<Object>} Dados da imagem uploadada
   */
  async uploadImage(file, metadata = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Adiciona metadados
      if (metadata.name) formData.append('name', metadata.name);
      if (metadata.description) formData.append('description', metadata.description);
      if (metadata.category) formData.append('category', metadata.category);

      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        return {
          hash: data.ipfsHash,
          url: data.ipfsUrl,
          name: metadata.name || file.name,
          ...data
        };
      }
      
      throw new Error(data.message || 'Erro no upload');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw error;
    }
  }

  /**
   * Remove uma imagem do Pinata
   * @param {string} hash - Hash IPFS da imagem
   * @returns {Promise<boolean>} Sucesso da operação
   */
  async removeImage(hash) {
    try {
      const response = await fetch(`${this.baseUrl}/unpin/${hash}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      throw error;
    }
  }

  /**
   * Verifica se um arquivo é uma imagem
   * @param {string} filename - Nome do arquivo
   * @returns {boolean} Se é imagem
   */
  isImageFile(filename) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return imageExtensions.includes(ext);
  }

  /**
   * Formata o tamanho do arquivo
   * @param {number} bytes - Tamanho em bytes
   * @returns {string} Tamanho formatado
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Formata a data de upload
   * @param {string} dateString - Data em string
   * @returns {string} Data formatada
   */
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

export default new PinataService();