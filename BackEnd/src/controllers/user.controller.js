const encryptionService = require('../services/encryption.service');
const { Pool } = require('pg');
const pool = new Pool();

class UserController {
    async createUser(req, res) {
        const { first_name, last_name, email, password, cpf, address, phone, birth_date } = req.body;

        try {
            // Campos sensíveis que precisam ser criptografados
            const sensitiveFields = ['cpf', 'address', 'phone'];
            
            // Criptografa os dados sensíveis
            const encryptedData = encryptionService.encryptObject(
                { cpf, address, phone },
                sensitiveFields
            );

            // Query para inserir usuário com dados criptografados
            const query = `
                INSERT INTO users (
                    first_name, last_name, email, password_hash,
                    encrypted_cpf, encrypted_address, encrypted_phone,
                    cpf_iv, address_iv, phone_iv,
                    cpf_auth, address_auth, phone_auth,
                    birth_date
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                RETURNING user_id, first_name, last_name, email, birth_date
            `;

            const values = [
                first_name,
                last_name,
                email,
                password, // Assume-se que já está hasheado
                encryptedData.encrypted_cpf,
                encryptedData.encrypted_address,
                encryptedData.encrypted_phone,
                encryptedData.cpf_iv,
                encryptedData.address_iv,
                encryptedData.phone_iv,
                encryptedData.cpf_auth,
                encryptedData.address_auth,
                encryptedData.phone_auth,
                birth_date
            ];

            const result = await pool.query(query, values);
            
            res.status(201).json({
                success: true,
                message: 'Usuário criado com sucesso',
                user: result.rows[0]
            });

        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao criar usuário',
                error: error.message
            });
        }
    }

    async getUserById(req, res) {
        const { userId } = req.params;

        try {
            // Query para buscar usuário com dados criptografados
            const query = `
                SELECT 
                    user_id, first_name, last_name, email, birth_date,
                    encrypted_cpf, encrypted_address, encrypted_phone,
                    cpf_iv, address_iv, phone_iv,
                    cpf_auth, address_auth, phone_auth
                FROM users 
                WHERE user_id = $1
            `;

            const result = await pool.query(query, [userId]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado'
                });
            }

            const user = result.rows[0];

            // Descriptografa os dados sensíveis
            const decryptedData = encryptionService.decryptObject(
                {
                    encrypted_cpf: user.encrypted_cpf,
                    cpf_iv: user.cpf_iv,
                    cpf_auth: user.cpf_auth,
                    encrypted_address: user.encrypted_address,
                    address_iv: user.address_iv,
                    address_auth: user.address_auth,
                    encrypted_phone: user.encrypted_phone,
                    phone_iv: user.phone_iv,
                    phone_auth: user.phone_auth
                },
                ['cpf', 'address', 'phone']
            );

            // Remove os campos criptografados da resposta
            const sanitizedUser = {
                user_id: user.user_id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                birth_date: user.birth_date,
                cpf: decryptedData.cpf,
                address: decryptedData.address,
                phone: decryptedData.phone
            };

            res.json({
                success: true,
                user: sanitizedUser
            });

        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar usuário',
                error: error.message
            });
        }
    }
}

module.exports = new UserController();