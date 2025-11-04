/**
 * Endpoint para criar NFT de teste do IPFS (apenas para desenvolvimento)
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

console.log('🚀 Arquivo testNft.routes.js carregado!');

/**
 * GET /api/test/create-ipfs-nft
 * Cria um NFT de teste simulando sincronização do IPFS (GET para facilitar teste)
 */
router.get('/create-ipfs-nft', async (req, res) => {
    try {
        const pool = req.app?.locals?.pool;
        if (!pool) {
            return res.status(500).json({ success: false, message: 'Banco de dados não disponível' });
        }

        // Dados de teste - CID será o token_id
        const fakeIPFSHash = 'QmTest' + Math.random().toString(36).substring(2, 15);
        const tokenId = fakeIPFSHash; // CID como token_id
        const imageHash = crypto.createHash('sha256').update(fakeIPFSHash).digest('hex');
        const certificateHash = crypto.createHash('sha256').update(tokenId + imageHash).digest('hex');
        
        const testImageUrl = `https://gateway.pinata.cloud/ipfs/${fakeIPFSHash}`;
        const name = `IPFS Test NFT ${Date.now()}`;
        const description = `NFT de teste sincronizado do IPFS. Hash: ${fakeIPFSHash}`;
        
        // Metadata ERC-721 compatível
        const metadata = {
            name,
            description,
            image: testImageUrl,
            external_url: testImageUrl,
            attributes: [
                { trait_type: "Source", value: "IPFS/Pinata" },
                { trait_type: "File Size", value: "150 KB" },
                { trait_type: "MIME Type", value: "image/png" },
                { trait_type: "Sync Date", value: new Date().toISOString() },
                { trait_type: "Test", value: "true" }
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
            'Imagem de teste do IPFS',
            'ipfs-sync',
            imageHash,
            certificateHash,
            testImageUrl,
            fakeIPFSHash,
            JSON.stringify(metadata),
            null, // creator_id
            null, // current_owner_id
            'ipfs',
            'created',
            true,
            new Date()
        ];

        const result = await pool.query(insertQuery, values);
        const nft = result.rows[0];

        res.json({
            success: true,
            message: 'NFT de teste IPFS criado com sucesso',
            nft: {
                id: nft.nft_id,
                tokenId: nft.token_id,
                name: nft.name,
                description: nft.description,
                imageUrl: nft.image_url,
                ipfsHash: nft.ipfs_hash,
                isTest: true
            }
        });

    } catch (error) {
        console.error('Erro ao criar NFT de teste:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar NFT de teste',
            error: error.message
        });
    }
});

/**
 * GET /api/test/simple-nfts
 * Endpoint simplificado para testar busca de NFTs (sem autenticação)
 */
router.get('/simple-nfts', async (req, res) => {
    try {
        const pool = req.app?.locals?.pool;
        if (!pool) {
            return res.json({ success: false, message: 'Pool não disponível', nfts: [] });
        }

        // Buscar NFTs do IPFS de forma simples
        const query = `
            SELECT 
                nft_id, token_id, name, description, image_url, 
                ipfs_hash, network, style, created_at
            FROM nfts 
            WHERE network = 'ipfs' AND style = 'ipfs-sync'
            ORDER BY created_at DESC
            LIMIT 10
        `;
        
        const result = await pool.query(query);
        
        return res.json({
            success: true,
            nfts: result.rows,
            total: result.rows.length,
            message: `${result.rows.length} NFTs IPFS encontrados`
        });

    } catch (error) {
        console.error('Erro em simple-nfts:', error);
        return res.json({
            success: false,
            nfts: [],
            error: error.message,
            message: 'Erro ao buscar NFTs'
        });
    }
});

/**
 * GET /api/test/check-ipfs-nfts
 * Verifica quantos NFTs do IPFS existem no banco
 */
router.get('/check-ipfs-nfts', async (req, res) => {
    try {
        const pool = req.app?.locals?.pool;
        if (!pool) {
            return res.status(500).json({ success: false, message: 'Banco de dados não disponível' });
        }

        // Contar NFTs do IPFS
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM nfts 
            WHERE network = 'ipfs' AND style = 'ipfs-sync'
        `;
        const countResult = await pool.query(countQuery);

        // Buscar alguns NFTs de exemplo
        const listQuery = `
            SELECT nft_id, token_id, name, image_url, created_at, ipfs_hash
            FROM nfts 
            WHERE network = 'ipfs' AND style = 'ipfs-sync'
            ORDER BY created_at DESC
            LIMIT 5
        `;
        const listResult = await pool.query(listQuery);

        res.json({
            success: true,
            totalIPFSNfts: parseInt(countResult.rows[0].total),
            sampleNfts: listResult.rows,
            message: `Encontrados ${countResult.rows[0].total} NFTs do IPFS no banco`
        });

    } catch (error) {
        console.error('Erro ao verificar NFTs IPFS:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao verificar NFTs IPFS',
            error: error.message
        });
    }
});

/**
 * GET /api/test
 * Rota de teste simples
 */
router.get('/', (req, res) => {
    res.json({ message: 'Servidor funcionando!' });
});

/**
 * GET /api/test/hello
 * Rota de teste adicional
 */
router.get('/hello', (req, res) => {
    console.log('🔥 Rota /hello foi chamada!');
    res.json({ message: 'Hello from test routes!' });
});

module.exports = router;