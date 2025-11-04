/**
 * Serviço para sincronizar imagens do Pinata com banco de dados local
 * Converte imagens IPFS em NFTs no sistema local
 */

const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

class PinataSyncService {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });

        this.apiKey = process.env.PINATA_API_KEY;
        this.secretApiKey = process.env.PINATA_SECRET_API_KEY;
        this.pinataApiUrl = 'https://api.pinata.cloud';
        this.pinataGateway = 'https://gateway.pinata.cloud/ipfs';
    }

    /**
     * Verifica se o serviço está configurado
     */
    isConfigured() {
        return !!(this.apiKey && this.secretApiKey);
    }

    /**
     * Busca imagens do Pinata que ainda não estão no banco local
     */
    async fetchNewPinataImages() {
        if (!this.isConfigured()) {
            throw new Error('Pinata não configurado');
        }

        try {
            // Busca todas as imagens no Pinata
            const axios = require('axios');
            const response = await axios.get(`${this.pinataApiUrl}/data/pinList?status=pinned&pageLimit=100`, {
                headers: {
                    'pinata_api_key': this.apiKey,
                    'pinata_secret_api_key': this.secretApiKey
                }
            });

            const data = response.data;
            
            if (!data.rows) {
                return [];
            }

            // Filtrar apenas imagens (por tipo de arquivo ou metadata)
            const images = data.rows.filter(item => {
                const isImage = item.mime_type && item.mime_type.startsWith('image/');
                const hasValidSize = item.size && item.size > 0;
                return isImage && hasValidSize;
            });

            // Verificar quais já estão no banco
            const existingHashes = await this.getExistingIPFSHashes();
            
            // Retornar apenas as novas
            const newImages = images.filter(img => !existingHashes.has(img.ipfs_pin_hash));

            console.log(`🔍 Encontradas ${images.length} imagens no Pinata, ${newImages.length} são novas`);
            
            return newImages;

        } catch (error) {
            console.error('Erro ao buscar imagens do Pinata:', error);
            throw error;
        }
    }

    /**
     * Busca hashes IPFS que já existem no banco
     */
    async getExistingIPFSHashes() {
        try {
            const query = 'SELECT DISTINCT ipfs_hash FROM nfts WHERE ipfs_hash IS NOT NULL';
            const result = await this.pool.query(query);
            
            return new Set(result.rows.map(row => row.ipfs_hash));
        } catch (error) {
            console.error('Erro ao buscar hashes existentes:', error);
            return new Set();
        }
    }

    /**
     * Sincroniza uma imagem do Pinata para o banco local como NFT
     */
    async syncImageToDatabase(imageData) {
        try {
            // Usar o CID (ipfs_pin_hash) como token_id
            const tokenId = imageData.ipfs_pin_hash;
            const imageHash = crypto.createHash('sha256').update(imageData.ipfs_pin_hash).digest('hex');
            const certificateHash = crypto.createHash('sha256').update(tokenId + imageHash).digest('hex');
            
            // URL da imagem via gateway Pinata
            const imageUrl = `${this.pinataGateway}/${imageData.ipfs_pin_hash}`;
            
            // Nome baseado no arquivo original ou hash
            const name = imageData.metadata?.name || 
                        imageData.metadata?.originalname || 
                        `IPFS Image ${imageData.ipfs_pin_hash.substring(0, 8)}`;
            
            // Descrição baseada em metadata disponível
            const description = `Imagem sincronizada do IPFS. Hash: ${imageData.ipfs_pin_hash}`;
            
            // Metadata ERC-721 compatível
            const metadata = {
                name,
                description,
                image: imageUrl,
                external_url: imageUrl,
                attributes: [
                    { trait_type: "Source", value: "IPFS/Pinata" },
                    { trait_type: "File Size", value: Math.round(imageData.size / 1024) + " KB" },
                    { trait_type: "MIME Type", value: imageData.mime_type || "image/unknown" },
                    { trait_type: "Sync Date", value: new Date().toISOString() }
                ]
            };

            // Inserir no banco
            const insertQuery = `
                INSERT INTO nfts (
                    token_id, name, description, prompt, style,
                    image_hash, certificate_hash, image_url, ipfs_hash,
                    metadata, creator_id, current_owner_id,
                    network, status, is_verified, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                RETURNING *
            `;

            const values = [
                tokenId,
                name,
                description,
                'Imagem do IPFS', // prompt genérico
                'ipfs-sync', // style específico para identificar origem
                imageHash,
                certificateHash,
                imageUrl,
                imageData.ipfs_pin_hash,
                JSON.stringify(metadata),
                null, // creator_id - null pois vem do IPFS
                null, // current_owner_id - null pois vem do IPFS
                'ipfs', // network
                'created', // status
                true, // is_verified
                imageData.date_pinned || new Date() // created_at
            ];

            const result = await this.pool.query(insertQuery, values);
            const nft = result.rows[0];

            console.log(`✅ NFT criado a partir do IPFS: ${nft.name} (${nft.token_id})`);

            return {
                success: true,
                nft: {
                    id: nft.nft_id,
                    tokenId: nft.token_id,
                    name: nft.name,
                    description: nft.description,
                    imageUrl: nft.image_url,
                    ipfsHash: nft.ipfs_hash,
                    metadata: nft.metadata
                },
                originalPinataData: imageData
            };

        } catch (error) {
            console.error('Erro ao sincronizar imagem para banco:', error);
            throw error;
        }
    }

    /**
     * Executa sincronização completa do Pinata para o banco
     */
    async performFullSync() {
        try {
            console.log('🔄 Iniciando sincronização completa Pinata -> Banco');
            
            const newImages = await this.fetchNewPinataImages();
            
            if (newImages.length === 0) {
                console.log('✅ Nenhuma imagem nova encontrada');
                return {
                    success: true,
                    message: 'Nenhuma imagem nova para sincronizar',
                    synced: 0,
                    total: 0
                };
            }

            const results = {
                success: 0,
                failed: 0,
                details: []
            };

            // Processar imagens em lotes para não sobrecarregar
            for (const imageData of newImages) {
                try {
                    const result = await this.syncImageToDatabase(imageData);
                    results.success++;
                    results.details.push({
                        ipfsHash: imageData.ipfs_pin_hash,
                        nftId: result.nft.id,
                        status: 'success'
                    });
                    
                    // Pequena pausa entre processamentos
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                } catch (error) {
                    console.error(`❌ Erro ao sincronizar ${imageData.ipfs_pin_hash}:`, error.message);
                    results.failed++;
                    results.details.push({
                        ipfsHash: imageData.ipfs_pin_hash,
                        status: 'failed',
                        error: error.message
                    });
                }
            }

            console.log(`✅ Sincronização concluída: ${results.success} sucessos, ${results.failed} falhas`);

            return {
                success: true,
                message: `Sincronização concluída`,
                synced: results.success,
                failed: results.failed,
                total: newImages.length,
                details: results.details
            };

        } catch (error) {
            console.error('Erro na sincronização completa:', error);
            throw error;
        }
    }

    /**
     * Obtém estatísticas da sincronização
     */
    async getSyncStats() {
        try {
            const ipfsNftsQuery = `
                SELECT COUNT(*) as total, 
                       MAX(created_at) as last_sync
                FROM nfts 
                WHERE network = 'ipfs' AND style = 'ipfs-sync'
            `;
            
            const result = await this.pool.query(ipfsNftsQuery);
            const stats = result.rows[0];

            return {
                totalSyncedNfts: parseInt(stats.total),
                lastSyncDate: stats.last_sync,
                isConfigured: this.isConfigured()
            };
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            return {
                totalSyncedNfts: 0,
                lastSyncDate: null,
                isConfigured: this.isConfigured()
            };
        }
    }
}

module.exports = new PinataSyncService();