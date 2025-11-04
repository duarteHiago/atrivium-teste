const express = require('express');
const router = express.Router();
const ipfsService = require('../services/ipfs.service');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

/**
 * Testa a configuração e autenticação do IPFS/Pinata
 * GET /api/ipfs/test
 */
router.get('/test', async (req, res) => {
    try {
        if (!ipfsService.isConfigured()) {
            return res.status(503).json({
                success: false,
                message: 'IPFS (Pinata) não está configurado. Verifique as variáveis de ambiente PINATA_API_KEY e PINATA_SECRET_API_KEY.'
            });
        }

        const authResult = await ipfsService.testAuthentication();
        
        res.json({
            success: true,
            message: 'Conexão com Pinata IPFS está funcionando!',
            data: authResult
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao testar conexão com Pinata',
            error: error.message
        });
    }
});

/**
 * Lista arquivos fixados no Pinata
 * GET /api/ipfs/list
 */
router.get('/list', async (req, res) => {
    try {
        if (!ipfsService.isConfigured()) {
            return res.status(503).json({
                success: false,
                message: 'IPFS não configurado'
            });
        }

        const limit = parseInt(req.query.limit) || 10;
        const files = await ipfsService.listPinnedFiles(limit);

        res.json({
            success: true,
            data: files
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao listar arquivos',
            error: error.message
        });
    }
});

/**
 * Obtém URL pública de um hash IPFS
 * GET /api/ipfs/url/:hash
 */
router.get('/url/:hash', (req, res) => {
    const { hash } = req.params;
    const url = ipfsService.getPublicUrl(hash);

    res.json({
        success: true,
        data: {
            ipfsHash: hash,
            publicUrl: url
        }
    });
});

/**
 * Remove um arquivo do Pinata (unpin)
 * DELETE /api/ipfs/unpin/:hash
 */
router.delete('/unpin/:hash', async (req, res) => {
    try {
        if (!ipfsService.isConfigured()) {
            return res.status(503).json({
                success: false,
                message: 'IPFS não configurado'
            });
        }

        const { hash } = req.params;
        
        if (!hash || hash.length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Hash IPFS inválido'
            });
        }

        const result = await ipfsService.unpinFile(hash);

        res.json({
            success: true,
            message: `Arquivo ${hash} removido com sucesso`,
            data: result
        });

    } catch (error) {
        console.error('Erro ao remover arquivo:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao remover arquivo',
            error: error.message
        });
    }
});

module.exports = router;

/**
 * Pina um arquivo diretamente a partir de uma URL
 * POST /api/ipfs/pin-from-url
 * body: { url: string, name?: string, description?: string, useLeonardoAuth?: boolean }
 */
router.post('/pin-from-url', async (req, res) => {
    try {
        if (!ipfsService.isConfigured()) {
            return res.status(503).json({ success: false, message: 'IPFS (Pinata) não está configurado.' });
        }

        const { url, name, description, useLeonardoAuth } = req.body || {};
        if (!url) return res.status(400).json({ success: false, message: 'url é obrigatória' });

        const headers = { 'Accept': '*/*', 'User-Agent': 'atrivium-backend/1.0 (+node-fetch)' };
        if (useLeonardoAuth && process.env.LEONARDO_API_KEY) {
            headers['Authorization'] = `Bearer ${process.env.LEONARDO_API_KEY}`;
            headers['Referer'] = 'https://cloud.leonardo.ai/';
        }

        const r = await fetch(url, { headers });
        if (!r.ok) {
            const text = await r.text().catch(() => '');
            return res.status(502).json({ success: false, message: `Falha ao baixar URL: ${r.status} ${r.statusText}`, body: text.slice(0, 500) });
        }

        const ct = (r.headers.get('content-type') || '').toLowerCase();
        const ab = await r.arrayBuffer();
        const buf = Buffer.from(ab);
        if (!buf || buf.length === 0) {
            return res.status(502).json({ success: false, message: 'Buffer vazio ao baixar a URL.' });
        }

        let ext = 'png';
        if (ct.includes('jpeg') || ct.includes('jpg')) ext = 'jpg';
        else if (ct.includes('webp')) ext = 'webp';
        else if (ct.includes('png')) ext = 'png';

        const fileName = `${crypto.randomUUID()}.${ext}`;
        const up = await ipfsService.uploadBuffer(buf, fileName, {
            name: name || 'Pinned from URL',
            description: description || url,
            source: 'pin-from-url',
            contentType: ct
        });

        return res.json({ success: true, data: up });
    } catch (error) {
        console.error('Erro no /pin-from-url:', error.response?.data || error.message || error);
        return res.status(500).json({ success: false, message: 'Erro ao pin-ar a URL', error: error.message });
    }
});

/**
 * Backfill: envia para o Pinata todas as imagens de NFTs sem ipfs_hash.
 * POST /api/ipfs/backfill-nfts
 * body: { limit?: number, dryRun?: boolean, onlyLocal?: boolean }
 * - limit: máximo de registros para processar (default 25)
 * - dryRun: apenas simula, sem subir para IPFS ou alterar o banco (default false)
 * - onlyLocal: processa somente imagens cujo image_url é local (/uploads/) (default false)
 */
router.post('/backfill-nfts', async (req, res) => {
    try {
        if (!ipfsService.isConfigured()) {
            return res.status(503).json({ success: false, message: 'IPFS (Pinata) não está configurado.' });
        }

        const pool = req.app?.locals?.pool;
        if (!pool) {
            return res.status(500).json({ success: false, message: 'Pool de conexão com DB indisponível.' });
        }

        const { limit = 25, dryRun = false, onlyLocal = false } = req.body || {};

        const q = `
            SELECT nft_id, token_id, name, image_url
            FROM nfts
            WHERE (ipfs_hash IS NULL OR ipfs_hash = '')
                AND image_url IS NOT NULL
            ORDER BY created_at ASC
            LIMIT $1
        `;
        const { rows } = await pool.query(q, [Math.max(1, Math.min(500, Number(limit) || 25))]);

        const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:3001';
        const results = [];
        let success = 0, failed = 0;

        for (const row of rows) {
            const { nft_id, token_id, name, image_url } = row;
            try {
                // Filtragem opcional para somente locais
                if (onlyLocal && !(image_url || '').startsWith('/uploads/')) {
                    results.push({ nft_id, token_id, skipped: true, reason: 'non-local-image' });
                    continue;
                }

                if (dryRun) {
                    results.push({ nft_id, token_id, simulated: true, image_url });
                    continue;
                }

                let ipfsRes;
                // Caso local (/uploads/...), faz upload via arquivo para melhor compatibilidade
                if ((image_url || '').startsWith('/uploads/')) {
                    const localPath = path.join(process.cwd(), image_url.replace(/^\/+/, ''));
                    if (!fs.existsSync(localPath)) {
                        throw new Error(`Arquivo local não encontrado: ${localPath}`);
                    }
                    ipfsRes = await ipfsService.uploadFile(localPath, {
                        name: name || token_id || path.basename(localPath),
                        source: 'backfill-local',
                    });
                } else {
                    // Remoto: baixa com headers genéricos
                    const headers = { 'Accept': '*/*', 'User-Agent': 'atrivium-backend/1.0 (+node-fetch)' };
                    // Se for URL da Leonardo e precisarmos, podemos tentar header de auth — heurística simples
                    if ((image_url || '').includes('leonardo.ai') && process.env.LEONARDO_API_KEY) {
                        headers['Authorization'] = `Bearer ${process.env.LEONARDO_API_KEY}`;
                        headers['Referer'] = 'https://cloud.leonardo.ai/';
                    }
                    const r = await fetch(image_url.startsWith('http') ? image_url : `${baseUrl}${image_url}`, { headers });
                    if (!r.ok) throw new Error(`Falha ao baixar imagem: ${r.status} ${r.statusText}`);
                    const ct = (r.headers.get('content-type') || '').toLowerCase();
                    const buf = Buffer.from(await r.arrayBuffer());
                    if (!buf || buf.length === 0) throw new Error('Buffer vazio');
                    let ext = 'png';
                    if (ct.includes('jpeg') || ct.includes('jpg')) ext = 'jpg';
                    else if (ct.includes('webp')) ext = 'webp';
                    else if (ct.includes('png')) ext = 'png';
                    const fileName = `${token_id || crypto.randomUUID()}.${ext}`;
                    ipfsRes = await ipfsService.uploadBuffer(buf, fileName, {
                        name: name || fileName,
                        description: image_url,
                        source: 'backfill-remote',
                        contentType: ct
                    });
                }

                const cid = ipfsRes.ipfsHash;
                const newUrl = ipfsRes.ipfsUrl;
                await pool.query(
                    `UPDATE nfts SET ipfs_hash = $1, image_url = $2, network = 'ipfs', updated_at = NOW() WHERE nft_id = $3`,
                    [cid, newUrl, nft_id]
                );
                results.push({ nft_id, token_id, ipfsHash: cid, image_url: newUrl });
                success++;
            } catch (err) {
                failed++;
                results.push({ nft_id, token_id, error: err.response?.data || err.message || String(err) });
            }
        }

        return res.json({
            success: true,
            total: rows.length,
            processed: success + failed,
            successCount: success,
            failedCount: failed,
            results
        });
    } catch (error) {
        console.error('Erro no backfill-nfts:', error.response?.data || error.message || error);
        return res.status(500).json({ success: false, message: 'Erro no backfill', error: error.message });
    }
});

/**
 * Pinar um NFT específico (por nft_id ou token_id)
 * POST /api/ipfs/pin-nft/:id
 * body: { force?: boolean }
 */
router.post('/pin-nft/:id', async (req, res) => {
    try {
        if (!ipfsService.isConfigured()) {
            return res.status(503).json({ success: false, message: 'IPFS (Pinata) não está configurado.' });
        }
        const pool = req.app?.locals?.pool;
        if (!pool) {
            return res.status(500).json({ success: false, message: 'Pool de conexão com DB indisponível.' });
        }
        const { id } = req.params;
        const { force = false } = req.body || {};
        const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:3001';

        const r = await pool.query(
            `SELECT nft_id, token_id, name, image_url, ipfs_hash
             FROM nfts WHERE nft_id::text = $1 OR token_id = $1 LIMIT 1`,
            [String(id)]
        );
        if (r.rows.length === 0) return res.status(404).json({ success: false, message: 'NFT não encontrado' });
        const nft = r.rows[0];
        if (nft.ipfs_hash && !force) {
            return res.json({ success: true, message: 'NFT já possui ipfs_hash', nft });
        }

        const image_url = nft.image_url || '';
        let ipfsRes;
        if (image_url.startsWith('/uploads/')) {
            const localPath = path.join(process.cwd(), image_url.replace(/^\/+/, ''));
            if (!fs.existsSync(localPath)) throw new Error(`Arquivo local não encontrado: ${localPath}`);
            ipfsRes = await ipfsService.uploadFile(localPath, { name: nft.name || nft.token_id || path.basename(localPath), source: 'pin-nft-local' });
        } else {
            const headers = { 'Accept': '*/*', 'User-Agent': 'atrivium-backend/1.0 (+node-fetch)' };
            if ((image_url || '').includes('leonardo.ai') && process.env.LEONARDO_API_KEY) {
                headers['Authorization'] = `Bearer ${process.env.LEONARDO_API_KEY}`;
                headers['Referer'] = 'https://cloud.leonardo.ai/';
            }
            const resp = await fetch(image_url.startsWith('http') ? image_url : `${baseUrl}${image_url}`, { headers });
            if (!resp.ok) throw new Error(`Falha ao baixar imagem: ${resp.status} ${resp.statusText}`);
            const ct = (resp.headers.get('content-type') || '').toLowerCase();
            const buf = Buffer.from(await resp.arrayBuffer());
            if (!buf || buf.length === 0) throw new Error('Buffer vazio');
            let ext = 'png'; if (ct.includes('jpeg')||ct.includes('jpg')) ext='jpg'; else if (ct.includes('webp')) ext='webp'; else if (ct.includes('png')) ext='png';
            const fileName = `${nft.token_id || crypto.randomUUID()}.${ext}`;
            ipfsRes = await ipfsService.uploadBuffer(buf, fileName, { name: nft.name || fileName, description: image_url, source: 'pin-nft-remote', contentType: ct });
        }
        const cid = ipfsRes.ipfsHash; const newUrl = ipfsRes.ipfsUrl;
        const upd = await pool.query(
            `UPDATE nfts SET ipfs_hash = $1, image_url = $2, network = 'ipfs', updated_at = NOW() WHERE nft_id = $3 RETURNING *`,
            [cid, newUrl, nft.nft_id]
        );
        return res.json({ success: true, nft: upd.rows[0] });
    } catch (error) {
        console.error('Erro no /pin-nft:', error.response?.data || error.message || error);
        return res.status(500).json({ success: false, message: 'Erro ao pin-ar NFT', error: error.message });
    }
});
