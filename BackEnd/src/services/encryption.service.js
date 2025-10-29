const crypto = require('crypto');

class EncryptionService {
    constructor() {
        if (!process.env.ENCRYPTION_KEY) {
            throw new Error('ENCRYPTION_KEY não configurada nas variáveis de ambiente');
        }
        this.algorithm = 'aes-256-gcm';
        this.key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
    }

    /**
     * Criptografa dados sensíveis
     * @param {string} text - Texto para criptografar
     * @returns {Object} - Objeto com dados criptografados e IV
     */
    encrypt(text) {
        try {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
            
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            const authTag = cipher.getAuthTag();
            
            return {
                encrypted: encrypted,
                iv: iv.toString('hex'),
                authTag: authTag.toString('hex')
            };
        } catch (error) {
            console.error('Erro ao criptografar:', error);
            throw new Error('Falha na criptografia dos dados');
        }
    }

    /**
     * Descriptografa dados sensíveis
     * @param {string} encrypted - Texto criptografado
     * @param {string} iv - Vetor de inicialização
     * @param {string} authTag - Tag de autenticação
     * @returns {string} - Texto descriptografado
     */
    decrypt(encrypted, iv, authTag) {
        try {
            const decipher = crypto.createDecipheriv(
                this.algorithm,
                this.key,
                Buffer.from(iv, 'hex')
            );
            
            decipher.setAuthTag(Buffer.from(authTag, 'hex'));
            
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            console.error('Erro ao descriptografar:', error);
            throw new Error('Falha na descriptografia dos dados');
        }
    }

    /**
     * Criptografa um objeto com dados sensíveis
     * @param {Object} data - Objeto com dados para criptografar
     * @param {Array} sensitiveFields - Array com nomes dos campos sensíveis
     * @returns {Object} - Objeto com dados criptografados
     */
    encryptObject(data, sensitiveFields) {
        const encryptedData = { ...data };
        
        for (const field of sensitiveFields) {
            if (data[field]) {
                const encrypted = this.encrypt(data[field]);
                encryptedData[`encrypted_${field}`] = encrypted.encrypted;
                encryptedData[`${field}_iv`] = encrypted.iv;
                encryptedData[`${field}_auth`] = encrypted.authTag;
                delete encryptedData[field];
            }
        }
        
        return encryptedData;
    }

    /**
     * Descriptografa um objeto com dados sensíveis
     * @param {Object} data - Objeto com dados criptografados
     * @param {Array} sensitiveFields - Array com nomes dos campos sensíveis
     * @returns {Object} - Objeto com dados descriptografados
     */
    decryptObject(data, sensitiveFields) {
        const decryptedData = { ...data };
        
        for (const field of sensitiveFields) {
            const encrypted = data[`encrypted_${field}`];
            const iv = data[`${field}_iv`];
            const authTag = data[`${field}_auth`];
            
            if (encrypted && iv && authTag) {
                decryptedData[field] = this.decrypt(encrypted, iv, authTag);
                delete decryptedData[`encrypted_${field}`];
                delete decryptedData[`${field}_iv`];
                delete decryptedData[`${field}_auth`];
            }
        }
        
        return decryptedData;
    }
}

module.exports = new EncryptionService();