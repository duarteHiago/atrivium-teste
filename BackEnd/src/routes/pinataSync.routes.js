/**
 * Rotas para sincronização de imagens do Pinata com banco local
 */

const express = require('express');
const router = express.Router();
const pinataSyncService = require('../services/pinataSync.service');
const jwt = require('jsonwebtoken');

// Helper para verificar se é admin
function requireAdmin(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Token não fornecido' });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        
        // Verificar se é admin (ajuste conforme sua lógica de usuário)
        if (!decoded.isAdmin) {
            return res.status(403).json({ success: false, message: 'Acesso negado. Apenas admins.' });
        }

        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token inválido' });
    }
}

/**
 * GET /api/pinata-sync/stats
 * Obtém estatísticas da sincronização
 */
router.get('/stats', requireAdmin, async (req, res) => {
    try {
        const stats = await pinataSyncService.getSyncStats();
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao obter estatísticas',
            error: error.message
        });
    }
});

/**
 * POST /api/pinata-sync/sync
 * Executa sincronização manual das imagens do Pinata
 */
router.post('/sync', requireAdmin, async (req, res) => {
    try {
        const result = await pinataSyncService.performFullSync();
        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Erro na sincronização:', error);
        res.status(500).json({
            success: false,
            message: 'Erro na sincronização',
            error: error.message
        });
    }
});

/**
 * GET /api/pinata-sync/check-new
 * Verifica quantas imagens novas existem no Pinata sem sincronizar
 */
router.get('/check-new', requireAdmin, async (req, res) => {
    try {
        const newImages = await pinataSyncService.fetchNewPinataImages();
        res.json({
            success: true,
            newImagesCount: newImages.length,
            newImages: newImages.map(img => ({
                hash: img.ipfs_pin_hash,
                name: img.metadata?.name || 'Sem nome',
                size: img.size,
                type: img.mime_type,
                datePinned: img.date_pinned
            }))
        });
    } catch (error) {
        console.error('Erro ao verificar novas imagens:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao verificar novas imagens',
            error: error.message
        });
    }
});

/**
 * GET /api/pinata-sync/nfts
 * Lista NFTs criados a partir da sincronização do Pinata
 */
router.get('/nfts', async (req, res) => {
    try {
        const pool = req.app?.locals?.pool;
        if (!pool) {
            return res.status(500).json({ success: false, message: 'Banco de dados não disponível' });
        }

        const { limit = 20, offset = 0 } = req.query;

        const query = `
            SELECT 
                nft_id,
                token_id,
                name,
                description,
                image_url,
                ipfs_hash,
                metadata,
                created_at
            FROM nfts 
            WHERE network = 'ipfs' AND style = 'ipfs-sync'
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
        `;

        const result = await pool.query(query, [limit, offset]);
        
        // Contar total
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM nfts 
            WHERE network = 'ipfs' AND style = 'ipfs-sync'
        `;
        const countResult = await pool.query(countQuery);

        res.json({
            success: true,
            nfts: result.rows,
            total: parseInt(countResult.rows[0].total),
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

    } catch (error) {
        console.error('Erro ao listar NFTs sincronizados:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao listar NFTs sincronizados',
            error: error.message
        });
    }
});

module.exports = router;