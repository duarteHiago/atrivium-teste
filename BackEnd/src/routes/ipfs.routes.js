const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const ipfsService = require('../services/ipfs.service');

console.log('🔧 ipfs.routes.js sendo carregado');

// Configuração do banco de dados
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

console.log('🛣️ Definindo rotas IPFS...');

/**
 * GET /api/ipfs/ping
 * Teste básico de rota (sem chamar Pinata)
 */
router.get('/ping', (req, res) => {
  console.log('📍 GET /api/ipfs/ping chamado');
  res.json({ 
    success: true, 
    message: 'Rota IPFS funcionando!',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/ipfs/test
 * Testa autenticação com Pinata
 */
router.get('/test', async (req, res) => {
  console.log('🔍 GET /api/ipfs/test - Iniciando');
  try {
    console.log('📡 Chamando ipfsService.testAuthentication()');
    const result = await ipfsService.testAuthentication();
    console.log('✅ Resultado:', result);
    
    res.json({
      success: true,
      message: 'Pinata conectado com sucesso',
      data: result
    });
  } catch (error) {
    console.error('Erro no teste de autenticação Pinata:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao testar conexão com Pinata',
      error: error.message
    });
  }
});

/**
 * GET /api/ipfs/list
 * Lista todos os arquivos pinados
 */
router.get('/list', async (req, res) => {
  try {
    const { status, pageLimit, pageOffset } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (pageLimit) filters.pageLimit = parseInt(pageLimit);
    if (pageOffset) filters.pageOffset = parseInt(pageOffset);
    
    const result = await ipfsService.listPinnedFiles(filters);
    
    res.json({
      success: true,
      count: result.count,
      pins: result.rows
    });
  } catch (error) {
    console.error('Erro ao listar pins:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar arquivos no IPFS',
      error: error.message
    });
  }
});

/**
 * GET /api/ipfs/url/:hash
 * Retorna URLs públicas para acessar arquivo no IPFS
 */
router.get('/url/:hash', (req, res) => {
  try {
    const { hash } = req.params;
    const { gateway } = req.query;
    
    const primaryUrl = ipfsService.getPublicUrl(hash, gateway);
    const fallbackUrls = ipfsService.getGatewayUrls(hash);
    
    res.json({
      success: true,
      ipfsHash: hash,
      primaryUrl,
      fallbackUrls
    });
  } catch (error) {
    console.error('Erro ao gerar URL do IPFS:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar URL',
      error: error.message
    });
  }
});

/**
 * POST /api/ipfs/pin-from-url
 * Faz pin de imagem a partir de URL
 * Body: { url, name }
 */
router.post('/pin-from-url', async (req, res) => {
  try {
    const { url, name } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL da imagem é obrigatória'
      });
    }
    
    // Baixar a imagem primeiro
    const axios = require('axios');
    const imageResponse = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(imageResponse.data);
    
    // Upload do buffer para IPFS
    const result = await ipfsService.uploadBuffer(
      buffer,
      name || `image-${Date.now()}.png`,
      { source: 'api-upload' }
    );
    
    res.json({
      success: true,
      message: 'Imagem enviada para IPFS com sucesso',
      ipfsHash: result.ipfsHash,
      publicUrl: ipfsService.getPublicUrl(result.ipfsHash),
      pinSize: result.pinSize
    });
  } catch (error) {
    console.error('Erro ao fazer pin de URL:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer upload da imagem para IPFS',
      error: error.message
    });
  }
});

/**
 * POST /api/ipfs/pin-nft/:id
 * Faz pin individual de NFT por ID ou token_id
 * Body: { force }
 */
router.post('/pin-nft/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { force } = req.body;
    
    // Buscar NFT no banco
    const nftQuery = `
      SELECT nft_id, token_id, name, image_url, ipfs_hash, network
      FROM nfts
      WHERE nft_id = $1 OR token_id = $1
    `;
    const nftResult = await pool.query(nftQuery, [id]);
    
    if (nftResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'NFT não encontrado'
      });
    }
    
    const nft = nftResult.rows[0];
    
    // Verificar se já tem ipfs_hash e não é force
    if (nft.ipfs_hash && !force) {
      return res.json({
        success: true,
        message: 'NFT já possui IPFS hash',
        nftId: nft.nft_id,
        ipfsHash: nft.ipfs_hash,
        skipped: true
      });
    }
    
    // Verificar se tem image_url
    if (!nft.image_url) {
      return res.status(400).json({
        success: false,
        message: 'NFT não possui image_url para fazer upload'
      });
    }
    
    // Baixar imagem e fazer upload para IPFS
    const axios = require('axios');
    const imageResponse = await axios.get(nft.image_url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(imageResponse.data);
    
    const uploadResult = await ipfsService.uploadBuffer(
      buffer,
      `${nft.name || nft.token_id}-${nft.nft_id}.png`,
      { 
        name: nft.name,
        nft_id: nft.nft_id,
        token_id: nft.token_id
      }
    );
    
    // Atualizar banco de dados
    const updateQuery = `
      UPDATE nfts
      SET ipfs_hash = $1,
          network = 'ipfs',
          image_url = $2
      WHERE nft_id = $3
      RETURNING *
    `;
    const publicUrl = ipfsService.getPublicUrl(uploadResult.ipfsHash);
    const updateResult = await pool.query(updateQuery, [
      uploadResult.ipfsHash,
      publicUrl,
      nft.nft_id
    ]);
    
    res.json({
      success: true,
      message: 'NFT enviado para IPFS com sucesso',
      nft: updateResult.rows[0],
      ipfsHash: uploadResult.ipfsHash,
      publicUrl
    });
  } catch (error) {
    console.error('Erro ao fazer pin de NFT:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar NFT para IPFS',
      error: error.message
    });
  }
});

/**
 * POST /api/ipfs/backfill-nfts
 * Faz pin em lote de NFTs sem ipfs_hash
 * Body: { limit, dryRun, onlyLocal }
 */
router.post('/backfill-nfts', async (req, res) => {
  try {
    const { limit = 50, dryRun = false, onlyLocal = false } = req.body;
    
    // Buscar NFTs sem ipfs_hash
    let query = `
      SELECT nft_id, token_id, name, image_url, ipfs_hash, network
      FROM nfts
      WHERE ipfs_hash IS NULL AND image_url IS NOT NULL
    `;
    
    if (onlyLocal) {
      query += ` AND (image_url LIKE '/uploads/%' OR image_url LIKE 'http://localhost%')`;
    }
    
    query += ` LIMIT $1`;
    
    const nftsResult = await pool.query(query, [limit]);
    const nfts = nftsResult.rows;
    
    if (nfts.length === 0) {
      return res.json({
        success: true,
        message: 'Nenhum NFT sem IPFS hash encontrado',
        processed: 0,
        errors: []
      });
    }
    
    if (dryRun) {
      return res.json({
        success: true,
        message: `Modo dry-run: ${nfts.length} NFTs seriam processados`,
        nfts: nfts.map(n => ({
          nft_id: n.nft_id,
          name: n.name,
          image_url: n.image_url
        })),
        dryRun: true
      });
    }
    
    // Processar cada NFT
    const results = [];
    const errors = [];
    
    for (const nft of nfts) {
      try {
        // Baixar imagem
        const axios = require('axios');
        const imageResponse = await axios.get(nft.image_url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(imageResponse.data);
        
        // Upload para IPFS
        const uploadResult = await ipfsService.uploadBuffer(
          buffer,
          `${nft.name || nft.token_id}-${nft.nft_id}.png`,
          {
            name: nft.name,
            nft_id: nft.nft_id,
            token_id: nft.token_id
          }
        );
        
        const publicUrl = ipfsService.getPublicUrl(uploadResult.ipfsHash);
        
        await pool.query(
          `UPDATE nfts SET ipfs_hash = $1, network = 'ipfs', image_url = $2 WHERE nft_id = $3`,
          [uploadResult.ipfsHash, publicUrl, nft.nft_id]
        );
        
        results.push({
          nft_id: nft.nft_id,
          name: nft.name,
          ipfsHash: uploadResult.ipfsHash,
          success: true
        });
        
        console.log(`✅ NFT ${nft.nft_id} enviado para IPFS: ${uploadResult.ipfsHash}`);
      } catch (error) {
        console.error(`❌ Erro ao processar NFT ${nft.nft_id}:`, error.message);
        errors.push({
          nft_id: nft.nft_id,
          name: nft.name,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: `Processados ${results.length} de ${nfts.length} NFTs`,
      processed: results.length,
      total: nfts.length,
      results,
      errors
    });
  } catch (error) {
    console.error('Erro no backfill de NFTs:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar NFTs em lote',
      error: error.message
    });
  }
});

/**
 * DELETE /api/ipfs/unpin/:hash
 * Remove pin de um arquivo do IPFS
 */
router.delete('/unpin/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    
    const result = await ipfsService.unpinFile(hash);
    
    res.json({
      success: true,
      message: 'Pin removido com sucesso',
      ipfsHash: hash
    });
  } catch (error) {
    console.error('Erro ao remover pin:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao remover pin do IPFS',
      error: error.message
    });
  }
});

module.exports = router;
