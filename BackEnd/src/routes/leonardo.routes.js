// Rotas para geração de NFTs usando Leonardo AI
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

// Configuração do banco de dados
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// URL base da API do Leonardo
const LEONARDO_API_URL = 'https://cloud.leonardo.ai/api/rest/v1';

// Função auxiliar para gerar hash SHA-256
function generateHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Função auxiliar para chamar a API do Leonardo
async function callLeonardoAPI(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${process.env.LEONARDO_API_KEY}`,
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${LEONARDO_API_URL}${endpoint}`, options);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Leonardo API Error: ${JSON.stringify(error)}`);
  }

  return await response.json();
}

// Helper: extrai userId (UUID) do JWT Bearer (se presente)
function getUserIdFromAuthHeader(req) {
  try {
    const auth = req.headers['authorization'] || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return null;
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me');
    return payload?.sub || null;
  } catch (e) {
    return null;
  }
}

// --- ENDPOINT 1: Testar conexão com a API ---
router.get('/test-connection', async (req, res) => {
  try {
    // Tenta buscar informações do usuário da API
    const data = await callLeonardoAPI('/me');
    
    res.json({
      success: true,
      message: 'Conexão com Leonardo AI estabelecida!',
      user: data.user_details?.[0] || data
    });
  } catch (error) {
    console.error('Erro ao conectar com Leonardo AI:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao conectar com Leonardo AI',
      error: error.message
    });
  }
});

// --- ENDPOINT 2: Gerar imagem ---
router.post('/generate', async (req, res) => {
  try {
    const { prompt, style, numImages = 1 } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt é obrigatório'
      });
    }

    // Parâmetros para geração
    const generationParams = {
      prompt: prompt,
      num_images: numImages,
      width: 512,
      height: 512,
      guidance_scale: 7,
      // Adicione outros parâmetros conforme necessário
    };

    // Se tiver style/modelo específico, adicione aqui
    if (style) {
      generationParams.modelId = style;
    }

    console.log('Gerando imagem com Leonardo AI:', generationParams);

    // Inicia a geração
    const result = await callLeonardoAPI('/generations', 'POST', generationParams);

    res.json({
      success: true,
      message: 'Geração iniciada!',
      generationId: result.sdGenerationJob?.generationId,
      data: result
    });

  } catch (error) {
    console.error('Erro ao gerar imagem:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar imagem',
      error: error.message
    });
  }
});

// --- ENDPOINT 3: Verificar status da geração ---
router.get('/generation/:generationId', async (req, res) => {
  try {
    const { generationId } = req.params;

    const result = await callLeonardoAPI(`/generations/${generationId}`);

    const generation = result.generations_by_pk;

    res.json({
      success: true,
      status: generation.status,
      images: generation.generated_images || [],
      data: generation
    });

  } catch (error) {
    console.error('Erro ao buscar status da geração:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar status da geração',
      error: error.message
    });
  }
});

// --- ENDPOINT 4: Listar modelos disponíveis ---
router.get('/models', async (req, res) => {
  try {
    const result = await callLeonardoAPI('/platformModels');

    res.json({
      success: true,
      models: result.custom_models || [],
      data: result
    });

  } catch (error) {
    console.error('Erro ao listar modelos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar modelos',
      error: error.message
    });
  }
});

// --- ENDPOINT 5: Gerar imagem COM POLLING e salvar no banco ---
router.post('/generate-and-save', async (req, res) => {
  try {
    const { prompt, name, description, style, collection_id } = req.body;
    const userId = getUserIdFromAuthHeader(req); // opcional

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt é obrigatório'
      });
    }

    // Parâmetros para geração
    const generationParams = {
      prompt: prompt,
      num_images: 1,
      width: 512,
      height: 512,
      guidance_scale: 7,
    };

    if (style) {
      generationParams.modelId = style;
    }

    console.log('Iniciando geração de NFT:', generationParams);

    // Inicia a geração
    const initResult = await callLeonardoAPI('/generations', 'POST', generationParams);
    const generationId = initResult.sdGenerationJob?.generationId;

    if (!generationId) {
      throw new Error('Não foi possível obter generationId da API');
    }

    console.log(`Geração iniciada. ID: ${generationId}`);

    // Polling: verificar status até completar (máximo 60 tentativas = 5 minutos)
    let attempts = 0;
    const maxAttempts = 60;
    let generationComplete = false;
    let imageData = null;

    while (attempts < maxAttempts && !generationComplete) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Espera 5 segundos
      attempts++;

      console.log(`Verificando status... Tentativa ${attempts}/${maxAttempts}`);

      const statusResult = await callLeonardoAPI(`/generations/${generationId}`);
      const generation = statusResult.generations_by_pk;

      if (generation.status === 'COMPLETE') {
        generationComplete = true;
        imageData = generation.generated_images?.[0];
        console.log('Geração completa!', imageData);
      } else if (generation.status === 'FAILED') {
        throw new Error('Geração falhou na API do Leonardo');
      }
    }

    if (!generationComplete) {
      throw new Error('Timeout: geração demorou mais de 5 minutos');
    }

    if (!imageData || !imageData.url) {
      throw new Error('Imagem não encontrada na resposta da API');
    }

    // Gerar hashes
    const imageHash = generateHash(imageData.url + Date.now());
    const certificateHash = generateHash(imageHash + prompt);
    const tokenId = crypto.randomUUID();

    // Salvar no banco de dados
    const insertQuery = `
      INSERT INTO nfts (
        token_id, name, description, prompt, style,
        image_hash, certificate_hash, image_url,
        status, network,
        creator_id, current_owner_id, collection_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const values = [
      tokenId,
      name || `NFT - ${prompt.substring(0, 30)}`,
      description || `Generated with prompt: ${prompt}`,
      prompt,
      style || 'default',
      imageHash,
      certificateHash,
      imageData.url,
      'created',
      'off-chain',
      userId,
      userId,
      collection_id || null
    ];

    const dbResult = await pool.query(insertQuery, values);
    const nft = dbResult.rows[0];

    console.log('NFT salvo no banco:', nft.nft_id);

    res.json({
      success: true,
      message: 'NFT gerado e salvo com sucesso!',
      nft: {
        id: nft.nft_id,
        tokenId: nft.token_id,
        name: nft.name,
        description: nft.description,
        imageUrl: nft.image_url,
        prompt: nft.prompt,
        imageHash: nft.image_hash,
        certificateHash: nft.certificate_hash,
        createdAt: nft.created_at
      }
    });

  } catch (error) {
    console.error('Erro ao gerar e salvar NFT:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar e salvar NFT',
      error: error.message
    });
  }
});

// --- ENDPOINT 6: Listar todos os NFTs ---
router.get('/list', async (req, res) => {
  try {
    const { userId } = req.query;
    
    console.log('🔍 GET /list - userId recebido:', userId);
    
    let query = 'SELECT nft_id, token_id, name, description, image_url, prompt, status, created_at, creator_id, collection_id FROM nfts';
    let queryParams = [];
    
    if (userId) {
      query += ' WHERE creator_id = $1';
      queryParams.push(userId);
      console.log('✅ Filtrando por creator_id:', userId);
    } else {
      console.log('⚠️ Nenhum userId fornecido, retornando todos os NFTs');
    }
    
    query += ' ORDER BY created_at DESC';
    
    console.log('📝 Query SQL:', query);
    console.log('📝 Parâmetros:', queryParams);
    
    const result = await pool.query(query, queryParams);

    console.log('📦 NFTs encontrados:', result.rows.length);

    res.json({
      success: true,
      nfts: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('Erro ao listar NFTs:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar NFTs',
      error: error.message
    });
  }
});

// --- ENDPOINT 7: Buscar NFT por ID ---
router.get('/:nftId', async (req, res) => {
  try {
    const { nftId } = req.params;

    const result = await pool.query(
      'SELECT * FROM nfts WHERE nft_id = $1 OR token_id = $1',
      [nftId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'NFT não encontrado'
      });
    }

    res.json({
      success: true,
      nft: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao buscar NFT:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar NFT',
      error: error.message
    });
  }
});

// Atualizar/definir a coleção de um NFT
router.patch('/:nftId/collection', async (req, res) => {
  try {
    const { nftId } = req.params;
    const { collection_id } = req.body; // pode ser null para remover
    const userId = getUserIdFromAuthHeader(req);

    // Buscar NFT
    const nftRes = await pool.query(
      `SELECT nft_id, token_id, creator_id, current_owner_id
       FROM nfts
       WHERE nft_id::text = $1 OR token_id = $1
       LIMIT 1`,
      [String(nftId)]
    );

    if (nftRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'NFT não encontrado' });
    }

    const nft = nftRes.rows[0];

    // Autorização básica: se houver userId, deve ser criador ou dono atual
    if (userId && userId !== nft.creator_id && userId !== nft.current_owner_id) {
      return res.status(403).json({ success: false, message: 'Sem permissão para alterar este NFT' });
    }

    // Validar collection opcionalmente (se fornecida)
    if (collection_id) {
      const colRes = await pool.query('SELECT 1 FROM collections WHERE collection_id = $1', [collection_id]);
      if (colRes.rows.length === 0) {
        return res.status(400).json({ success: false, message: 'Coleção inválida' });
      }
    }

    const upd = await pool.query(
      'UPDATE nfts SET collection_id = $1, updated_at = NOW() WHERE nft_id = $2 RETURNING *',
      [collection_id || null, nft.nft_id]
    );

    return res.json({ success: true, message: 'Coleção atualizada', nft: upd.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar coleção do NFT:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar coleção', error: error.message });
  }
});

module.exports = router;
