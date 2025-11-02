// Rotas para gerenciamento de Coleções de NFTs
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { upload, ensureDir } = require('../middleware/upload');
const { v4: uuidv4 } = require('uuid');

// Configuração do banco de dados
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Middleware local para exigir admin neste arquivo de rotas
async function adminAuth(req, res, next) {
  try {
    const auth = req.headers['authorization'] || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Token ausente.' });
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me');
    req.user = payload;
    const rAdmins = await pool.query(`SELECT COUNT(*)::int AS c FROM users WHERE role = 'admin'`);
    if ((rAdmins.rows?.[0]?.c || 0) === 0) return next(); // bootstrap
    const r = await pool.query('SELECT role FROM users WHERE user_id = $1', [payload.sub]);
    if ((r.rows?.[0]?.role || 'user') !== 'admin') {
      return res.status(403).json({ message: 'Acesso restrito a administradores.' });
    }
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Token inválido.' });
  }
}

// --- ENDPOINT 1: Criar nova coleção ---
router.post('/create', upload.single('banner'), async (req, res) => {
  try {
    const { name, description, banner_image, creator_id } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Nome da coleção é obrigatório'
      });
    }

    let bannerUrl = banner_image || null;

    // Se veio arquivo, processa e salva como banner
    if (req.file && req.file.buffer) {
      try {
        const uploadDir = path.join(process.cwd(), 'uploads', 'collections', 'banners');
        ensureDir(uploadDir);
        const id = uuidv4();
        const filename = `${id}.webp`;
        const targetPath = path.join(uploadDir, filename);

        // Redimensiona para um tamanho adequado de banner (cover)
        await sharp(req.file.buffer)
          .resize({ width: 1600, height: 520, fit: 'cover', position: 'attention' })
          .toFormat('webp')
          .toFile(targetPath);

        const baseUrl = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
        bannerUrl = `${baseUrl}/uploads/collections/banners/${filename}`;
      } catch (imgErr) {
        console.error('Erro ao processar banner:', imgErr);
        return res.status(400).json({ success: false, message: 'Falha ao processar imagem do banner.' });
      }
    }

    const insertQuery = `
      INSERT INTO collections (name, description, banner_image, creator_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [name, description || null, bannerUrl, creator_id || null];
    const result = await pool.query(insertQuery, values);

    res.json({
      success: true,
      message: 'Coleção criada com sucesso!',
      collection: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao criar coleção:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({
        success: false,
        message: 'Já existe uma coleção com este nome'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro ao criar coleção',
      error: error.message
    });
  }
});

// --- ENDPOINT 2: Listar todas as coleções ---
router.get('/list', async (req, res) => {
  try {
    const { featured } = req.query;

    let query = `
      SELECT 
        c.*,
        COUNT(n.nft_id) as nfts_count,
        u.cpf as creator_cpf
      FROM collections c
      LEFT JOIN nfts n ON c.collection_id = n.collection_id
      LEFT JOIN users u ON c.creator_id = u.user_id
    `;

    if (featured === 'true') {
      query += ` WHERE c.is_featured = TRUE`;
    }

    query += `
      GROUP BY c.collection_id, u.cpf
      ORDER BY c.created_at DESC
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      collections: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('Erro ao listar coleções:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar coleções',
      error: error.message
    });
  }
});

// --- ENDPOINT 3: Buscar coleção em destaque com NFTs ---
router.get('/featured', async (req, res) => {
  try {
    // Busca a primeira coleção marcada como destaque
    const collectionQuery = `
      SELECT 
        c.*,
        COUNT(n.nft_id) as nfts_count,
        u.cpf as creator_cpf
      FROM collections c
      LEFT JOIN nfts n ON c.collection_id = n.collection_id
      LEFT JOIN users u ON c.creator_id = u.user_id
      WHERE c.is_featured = TRUE
      GROUP BY c.collection_id, u.cpf
      ORDER BY c.created_at DESC
      LIMIT 1
    `;

    const collectionResult = await pool.query(collectionQuery);

    if (collectionResult.rows.length === 0) {
      return res.json({
        success: true,
        collection: null,
        nfts: []
      });
    }

    const collection = collectionResult.rows[0];

    // Busca os NFTs dessa coleção (limite de 4 para preview)
    const nftsQuery = `
      SELECT nft_id, token_id, name, image_url, created_at
      FROM nfts
      WHERE collection_id = $1
      ORDER BY created_at DESC
      LIMIT 4
    `;

    const nftsResult = await pool.query(nftsQuery, [collection.collection_id]);

    res.json({
      success: true,
      collection: collection,
      nfts: nftsResult.rows
    });

  } catch (error) {
    console.error('Erro ao buscar coleção em destaque:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar coleção em destaque',
      error: error.message
    });
  }
});

// --- ENDPOINT 3b: Listar até 4 coleções em destaque (carrossel) com previews ---
router.get('/featured-list', async (req, res) => {
  try {
    const collectionsQuery = `
      SELECT c.*, COUNT(n.nft_id) as nfts_count, u.cpf as creator_cpf
      FROM collections c
      LEFT JOIN nfts n ON c.collection_id = n.collection_id
      LEFT JOIN users u ON c.creator_id = u.user_id
      WHERE c.is_featured = TRUE
      GROUP BY c.collection_id, u.cpf
      ORDER BY c.featured_order NULLS LAST, c.updated_at DESC
      LIMIT 4
    `;
    const collectionsRes = await pool.query(collectionsQuery);
    const collections = collectionsRes.rows;

    // Busca previews (até 3) para cada coleção — aleatórios
    const previewsByCollection = {};
    for (const col of collections) {
      const r = await pool.query(
        `SELECT nft_id, name, image_url FROM nfts WHERE collection_id = $1 ORDER BY random() LIMIT 3`,
        [col.collection_id]
      );
      previewsByCollection[col.collection_id] = r.rows;
    }

    res.json({ success: true, collections, previews: previewsByCollection });
  } catch (error) {
    console.error('Erro ao listar coleções em destaque:', error);
    res.status(500).json({ success: false, message: 'Erro ao listar destaques' });
  }
});

// --- ADMIN: Definir coleções em destaque (redundante ao server.js para evitar 404) ---
router.post('/admin/featured-set', adminAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { collectionIds } = req.body || {};
    if (!Array.isArray(collectionIds)) {
      return res.status(400).json({ message: 'collectionIds deve ser um array.' });
    }
    const ids = collectionIds.filter(id => typeof id === 'string').slice(0, 4);

    await client.query('BEGIN');
    await client.query(`UPDATE collections SET is_featured = FALSE, featured_order = NULL WHERE is_featured = TRUE`);
    for (let i = 0; i < ids.length; i++) {
      await client.query(
        `UPDATE collections SET is_featured = TRUE, featured_order = $1 WHERE collection_id = $2`,
        [i + 1, ids[i]]
      );
    }
    await client.query('COMMIT');
    res.json({ success: true, message: 'Coleções em destaque atualizadas.', featured: ids });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Erro ao definir destaques (router):', e);
    res.status(500).json({ success: false, message: 'Erro ao definir destaques.' });
  } finally {
    client.release();
  }
});

// --- ENDPOINT 4: Buscar coleção específica ---
router.get('/:collectionId', async (req, res) => {
  try {
    const { collectionId } = req.params;

    const query = `
      SELECT 
        c.*,
        COUNT(n.nft_id) as nfts_count,
        u.cpf as creator_cpf
      FROM collections c
      LEFT JOIN nfts n ON c.collection_id = n.collection_id
      LEFT JOIN users u ON c.creator_id = u.user_id
      WHERE c.collection_id = $1
      GROUP BY c.collection_id, u.cpf
    `;

    const result = await pool.query(query, [collectionId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Coleção não encontrada'
      });
    }

    res.json({
      success: true,
      collection: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao buscar coleção:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar coleção',
      error: error.message
    });
  }
});

// --- ENDPOINT 5: Buscar NFTs de uma coleção ---
router.get('/:collectionId/nfts', async (req, res) => {
  try {
    const { collectionId } = req.params;

    const query = `
      SELECT nft_id, token_id, name, description, image_url, prompt, status, created_at
      FROM nfts
      WHERE collection_id = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [collectionId]);

    res.json({
      success: true,
      nfts: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('Erro ao buscar NFTs da coleção:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar NFTs da coleção',
      error: error.message
    });
  }
});

// --- ENDPOINT 6: Atualizar coleção ---
router.put('/:collectionId', async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { name, description, banner_image, is_featured } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (banner_image !== undefined) {
      updates.push(`banner_image = $${paramCount++}`);
      values.push(banner_image);
    }
    if (is_featured !== undefined) {
      updates.push(`is_featured = $${paramCount++}`);
      values.push(is_featured);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum campo para atualizar'
      });
    }

    values.push(collectionId);

    const query = `
      UPDATE collections
      SET ${updates.join(', ')}
      WHERE collection_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Coleção não encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Coleção atualizada com sucesso!',
      collection: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao atualizar coleção:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar coleção',
      error: error.message
    });
  }
});

// --- ENDPOINT 7: Deletar coleção ---
router.delete('/:collectionId', async (req, res) => {
  try {
    const { collectionId } = req.params;

    const result = await pool.query(
      'DELETE FROM collections WHERE collection_id = $1 RETURNING *',
      [collectionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Coleção não encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Coleção deletada com sucesso!',
      collection: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao deletar coleção:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar coleção',
      error: error.message
    });
  }
});

module.exports = router;
