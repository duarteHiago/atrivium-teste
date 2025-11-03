/**
 * Serviço de Integração com Pinata IPFS
 * Responsável por fazer upload de imagens para o IPFS via Pinata
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class IPFSService {
    constructor() {
        this.apiKey = process.env.PINATA_API_KEY;
        this.secretApiKey = process.env.PINATA_SECRET_API_KEY;
        this.pinataApiUrl = 'https://api.pinata.cloud';
        this.pinataGateway = process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs';
        
        if (!this.apiKey || !this.secretApiKey) {
            console.warn('⚠️  Pinata API keys não configuradas. Upload IPFS desabilitado.');
        }
    }

    /**
     * Verifica se o serviço está configurado
     */
    isConfigured() {
        return !!(this.apiKey && this.secretApiKey);
    }

    /**
     * Testa a autenticação com Pinata
     */
    async testAuthentication() {
        try {
            const response = await axios.get(`${this.pinataApiUrl}/data/testAuthentication`, {
                headers: {
                    pinata_api_key: this.apiKey,
                    pinata_secret_api_key: this.secretApiKey
                }
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao testar autenticação Pinata:', error.response?.data || error.message);
            throw new Error('Falha na autenticação com Pinata');
        }
    }

    /**
     * Faz upload de um arquivo para o IPFS via Pinata
     * @param {string} filePath - Caminho do arquivo local
     * @param {object} metadata - Metadados do arquivo (nome, descrição, etc)
     * @returns {Promise<object>} - Dados do arquivo no IPFS (hash, URL, etc)
     */
    async uploadFile(filePath, metadata = {}) {
        if (!this.isConfigured()) {
            throw new Error('Pinata não está configurado. Verifique as variáveis de ambiente.');
        }

        try {
            // Verifica se o arquivo existe
            if (!fs.existsSync(filePath)) {
                throw new Error(`Arquivo não encontrado: ${filePath}`);
            }

            // Prepara o FormData
            const formData = new FormData();
            formData.append('file', fs.createReadStream(filePath));

            // Adiciona metadados
            const pinataMetadata = {
                name: metadata.name || path.basename(filePath),
                keyvalues: {
                    ...metadata,
                    uploadedAt: new Date().toISOString()
                }
            };
            formData.append('pinataMetadata', JSON.stringify(pinataMetadata));

            // Opções de pinning (garantir que o arquivo permaneça no IPFS)
            const pinataOptions = {
                cidVersion: 1
            };
            formData.append('pinataOptions', JSON.stringify(pinataOptions));

            // Faz o upload
            const response = await axios.post(
                `${this.pinataApiUrl}/pinning/pinFileToIPFS`,
                formData,
                {
                    headers: {
                        ...formData.getHeaders(),
                        pinata_api_key: this.apiKey,
                        pinata_secret_api_key: this.secretApiKey
                    },
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity
                }
            );

            const ipfsHash = response.data.IpfsHash;
            const ipfsUrl = `${this.pinataGateway}/${ipfsHash}`;

            console.log(`✅ Arquivo enviado para IPFS: ${ipfsHash}`);

            return {
                success: true,
                ipfsHash: ipfsHash,
                ipfsUrl: ipfsUrl,
                pinSize: response.data.PinSize,
                timestamp: response.data.Timestamp,
                metadata: pinataMetadata
            };

        } catch (error) {
            console.error('Erro ao fazer upload para Pinata:', error.response?.data || error.message);
            throw new Error(`Falha ao enviar arquivo para IPFS: ${error.message}`);
        }
    }

    /**
     * Faz upload de um buffer (dados em memória) para o IPFS
     * @param {Buffer} buffer - Dados do arquivo
     * @param {string} fileName - Nome do arquivo
     * @param {object} metadata - Metadados
     */
    async uploadBuffer(buffer, fileName, metadata = {}) {
        if (!this.isConfigured()) {
            throw new Error('Pinata não está configurado. Verifique as variáveis de ambiente.');
        }

        try {
            const formData = new FormData();
            const fileOpts = { filename: fileName };
            if (metadata && typeof metadata.contentType === 'string') {
                fileOpts.contentType = metadata.contentType;
            }
            formData.append('file', buffer, fileOpts);

            const pinataMetadata = {
                name: metadata.name || fileName,
                keyvalues: {
                    ...metadata,
                    uploadedAt: new Date().toISOString()
                }
            };
            formData.append('pinataMetadata', JSON.stringify(pinataMetadata));

            const pinataOptions = {
                cidVersion: 1
            };
            formData.append('pinataOptions', JSON.stringify(pinataOptions));

            const response = await axios.post(
                `${this.pinataApiUrl}/pinning/pinFileToIPFS`,
                formData,
                {
                    headers: {
                        ...formData.getHeaders(),
                        pinata_api_key: this.apiKey,
                        pinata_secret_api_key: this.secretApiKey
                    },
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity
                }
            );

            const ipfsHash = response.data.IpfsHash;
            const ipfsUrl = `${this.pinataGateway}/${ipfsHash}`;

            console.log(`✅ Buffer enviado para IPFS: ${ipfsHash}`);

            return {
                success: true,
                ipfsHash: ipfsHash,
                ipfsUrl: ipfsUrl,
                pinSize: response.data.PinSize,
                timestamp: response.data.Timestamp
            };

        } catch (error) {
            console.error('Erro ao fazer upload de buffer para Pinata:', error.response?.data || error.message);
            throw new Error(`Falha ao enviar buffer para IPFS: ${error.message}`);
        }
    }

    /**
     * Remove um arquivo do IPFS (unpin)
     * @param {string} ipfsHash - Hash IPFS do arquivo
     */
    async unpinFile(ipfsHash) {
        if (!this.isConfigured()) {
            throw new Error('Pinata não está configurado.');
        }

        try {
            await axios.delete(
                `${this.pinataApiUrl}/pinning/unpin/${ipfsHash}`,
                {
                    headers: {
                        pinata_api_key: this.apiKey,
                        pinata_secret_api_key: this.secretApiKey
                    }
                }
            );

            console.log(`🗑️  Arquivo removido do IPFS: ${ipfsHash}`);
            return { success: true };

        } catch (error) {
            console.error('Erro ao remover arquivo do IPFS:', error.response?.data || error.message);
            throw new Error(`Falha ao remover arquivo do IPFS: ${error.message}`);
        }
    }

    /**
     * Lista arquivos fixados no Pinata
     */
    async listPinnedFiles(limit = 10) {
        if (!this.isConfigured()) {
            throw new Error('Pinata não está configurado.');
        }

        try {
            const response = await axios.get(
                `${this.pinataApiUrl}/data/pinList?status=pinned&pageLimit=${limit}`,
                {
                    headers: {
                        pinata_api_key: this.apiKey,
                        pinata_secret_api_key: this.secretApiKey
                    }
                }
            );

            return response.data;

        } catch (error) {
            console.error('Erro ao listar arquivos:', error.response?.data || error.message);
            throw new Error(`Falha ao listar arquivos: ${error.message}`);
        }
    }

    /**
     * Gera URL pública do arquivo IPFS
     * @param {string} ipfsHash - Hash IPFS do arquivo
     * @returns {string} - URL pública
     */
    getPublicUrl(ipfsHash) {
        // Garantir que o gateway tenha https://
        let gateway = this.pinataGateway;
        if (!gateway.startsWith('http://') && !gateway.startsWith('https://')) {
            gateway = `https://${gateway}`;
        }
        
        // Remover /ipfs do final se já estiver presente
        gateway = gateway.replace(/\/ipfs\/?$/, '');
        
        return `${gateway}/ipfs/${ipfsHash}`;
    }
    
    /**
     * Obtém múltiplas URLs de gateway para fallback
     * @param {string} ipfsHash - Hash do arquivo no IPFS
     */
    getGatewayUrls(ipfsHash) {
        if (!ipfsHash) return [];
        
        const gateways = [
            process.env.PINATA_GATEWAY || 'gateway.pinata.cloud',
            'ipfs.io',
            'cloudflare-ipfs.com',
            'dweb.link'
        ];
        
        if (process.env.PINATA_SUBDOMAIN) {
            gateways.unshift(process.env.PINATA_SUBDOMAIN);
        }
        
        return gateways.map(gw => `https://${gw}/ipfs/${ipfsHash}`);
    }
}

module.exports = new IPFSService();
