/**
 * Serviço para buscar NFTs mesclando dados regulares + sincronizados do Pinata
 */

import { API_BASE } from '../config/api';

export class NFTMergedService {
  /**
   * Busca NFTs recentes mesclando NFTs regulares com os sincronizados do Pinata
   * @param {number} limit - Número máximo de NFTs para retornar
   * @returns {Promise<Array>} Lista mesclada de NFTs
   */
  static async getRecentNFTs(limit = 10) {
    try {
      console.log('🔄 Iniciando busca de NFTs mesclados...');
      
      // Buscar NFTs regulares (Leonardo/criados no sistema)
      const [regularResponse, pinataResponse] = await Promise.all([
        fetch(`${API_BASE}/api/leonardo/list?limit=${Math.ceil(limit * 0.7)}`), // 70% regulares
        fetch(`${API_BASE}/api/test/simple-nfts`) // NFTs IPFS via endpoint simplificado
      ]);

      console.log('📡 Respostas recebidas:', { 
        regularOk: regularResponse.ok, 
        pinataOk: pinataResponse.ok,
        regularStatus: regularResponse.status,
        pinataStatus: pinataResponse.status
      });

      let regularNfts = [];
      let pinataNfts = [];

      // Processar NFTs regulares
      if (regularResponse.ok) {
        const regularData = await regularResponse.json();
        if (regularData.success) {
          regularNfts = regularData.nfts.map(nft => ({
            ...nft,
            source: 'regular',
            isIPFS: false
          }));
        }
      }

      // Processar NFTs do Pinata (apenas se disponível - não falha se endpoint não existir)
      try {
        if (pinataResponse.ok) {
          const pinataData = await pinataResponse.json();
          console.log('🌐 Dados do Pinata recebidos:', pinataData);
          if (pinataData.success) {
            pinataNfts = pinataData.nfts.map(nft => ({
              ...nft,
              source: 'pinata',
              isIPFS: true,
              // Ajustar campos para compatibilidade
              creator_name: 'Sistema IPFS',
              creator_id: null
            }));
            console.log('✅ NFTs do Pinata processados:', pinataNfts.length);
          } else {
            console.log('⚠️ Resposta do Pinata sem sucesso:', pinataData);
          }
        } else {
          console.log('❌ Resposta do Pinata não OK:', pinataResponse.status, pinataResponse.statusText);
        }
      } catch (error) {
        console.log('💡 Erro ao processar NFTs do Pinata:', error.message);
      }

      // Mesclar e ordenar por data de criação
      const allNfts = [...regularNfts, ...pinataNfts]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit);

      console.log(`🎨 NFTs carregados: ${regularNfts.length} regulares + ${pinataNfts.length} IPFS = ${allNfts.length} total`);
      console.log('📋 Detalhes dos NFTs:', { regularNfts: regularNfts.length, pinataNfts: pinataNfts.length, merged: allNfts.length });
      if (pinataNfts.length > 0) {
        console.log('🌐 Primeiros NFTs IPFS:', pinataNfts.slice(0, 2));
      }

      return allNfts;

    } catch (error) {
      console.error('Erro ao buscar NFTs mesclados:', error);
      
      // Fallback: tentar apenas NFTs regulares
      try {
        const response = await fetch(`${API_BASE}/api/leonardo/list?limit=${limit}`);
        const data = await response.json();
        if (data.success) {
          return data.nfts.map(nft => ({
            ...nft,
            source: 'regular',
            isIPFS: false
          }));
        }
      } catch (fallbackError) {
        console.error('Erro no fallback:', fallbackError);
      }

      return [];
    }
  }

  /**
   * Busca estatísticas dos NFTs (totais, fontes, etc.)
   */
  static async getNFTStats() {
    try {
      const [regularResponse, pinataResponse] = await Promise.all([
        fetch(`${API_BASE}/api/leonardo/list?limit=1`), // Só para verificar disponibilidade
        fetch(`${API_BASE}/api/pinata-sync/stats`) // Estatísticas específicas do Pinata
      ]);

      const stats = {
        regularAvailable: false,
        pinataAvailable: false,
        pinataStats: null
      };

      if (regularResponse.ok) {
        stats.regularAvailable = true;
      }

      try {
        if (pinataResponse.ok) {
          const pinataData = await pinataResponse.json();
          if (pinataData.success) {
            stats.pinataAvailable = true;
            stats.pinataStats = pinataData.stats;
          }
        }
      } catch {
        // Pinata não disponível - não é erro crítico
      }

      return stats;

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        regularAvailable: true, // Assumir que regular funciona
        pinataAvailable: false,
        pinataStats: null
      };
    }
  }

  /**
   * Força uma sincronização do Pinata (apenas para admins)
   */
  static async triggerPinataSync() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch(`${API_BASE}/api/pinata-sync/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('Erro ao forçar sincronização:', error);
      throw error;
    }
  }
}

export default NFTMergedService;