const express = require('express');
const router = express.Router();
const nftController = require('../controllers/nft.controller');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Helper para extrair userId do token
function getUserIdFromToken(req) {
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

/**
 * Rotas para operações de NFT
 */

// Gerar preview de imagem com IA
router.post('/generate-preview', nftController.generatePreview.bind(nftController));

// Criar NFT completo com tokenização
router.post('/create', nftController.createNFT.bind(nftController));

// Listar NFTs (com filtros opcionais)
router.get('/list', nftController.listNFTs.bind(nftController));

// Buscar NFT específico por token ID
router.get('/:tokenId', nftController.getNFT.bind(nftController));

// Listar estilos disponíveis
router.get('/ai/styles', nftController.getStyles.bind(nftController));

// ==================== ROTAS DE FAVORITOS ====================

// GET /api/nfts/favorites/my - Listar NFTs favoritados pelo usuário (ANTES das rotas com :nftId)
router.get('/favorites/my', async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Não autenticado.' });
    }

    const query = `
      SELECT 
        n.*,
        f.created_at as favorited_at,
        COUNT(f2.favorite_id) as total_favorites,
        COALESCE(u.nickname, u.first_name || ' ' || u.last_name) as creator_name,
        u.avatar_url as creator_avatar
      FROM nft_favorites f
      INNER JOIN nfts n ON f.nft_id = n.nft_id
      LEFT JOIN users u ON n.creator_id = u.user_id
      LEFT JOIN nft_favorites f2 ON n.nft_id = f2.nft_id
      WHERE f.user_id = $1
      GROUP BY n.nft_id, f.created_at, u.nickname, u.first_name, u.last_name, u.avatar_url
      ORDER BY f.created_at DESC
    `;

    const result = await pool.query(query, [userId]);

    res.json({
      success: true,
      favorites: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('Erro ao listar favoritos:', error);
    res.status(500).json({ success: false, message: 'Erro ao listar favoritos' });
  }
});

// POST /api/nfts/:nftId/favorite - Favoritar um NFT
router.post('/:nftId/favorite', async (req, res) => {
  try {
    const { nftId } = req.params;
    const userId = getUserIdFromToken(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Não autenticado.' });
    }

    // Verifica se NFT existe
    const nftCheck = await pool.query('SELECT 1 FROM nfts WHERE nft_id = $1', [nftId]);
    if (nftCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'NFT não encontrado.' });
    }

    // Insere favorito (UNIQUE evita duplicatas)
    const insertQuery = `
      INSERT INTO nft_favorites (nft_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (nft_id, user_id) DO NOTHING
      RETURNING *
    `;
    
    const result = await pool.query(insertQuery, [nftId, userId]);

    // Conta total de favoritos do NFT
    const countQuery = 'SELECT COUNT(*)::int as total FROM nft_favorites WHERE nft_id = $1';
    const countResult = await pool.query(countQuery, [nftId]);

    res.json({
      success: true,
      message: result.rows.length > 0 ? 'NFT favoritado!' : 'Já estava nos favoritos',
      alreadyFavorited: result.rows.length === 0,
      totalFavorites: countResult.rows[0].total
    });

  } catch (error) {
    console.error('Erro ao favoritar NFT:', error);
    res.status(500).json({ success: false, message: 'Erro ao favoritar NFT' });
  }
});

// DELETE /api/nfts/:nftId/favorite - Desfavoritar um NFT
router.delete('/:nftId/favorite', async (req, res) => {
  try {
    const { nftId } = req.params;
    const userId = getUserIdFromToken(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Não autenticado.' });
    }

    const deleteQuery = 'DELETE FROM nft_favorites WHERE nft_id = $1 AND user_id = $2 RETURNING *';
    const result = await pool.query(deleteQuery, [nftId, userId]);

    // Conta total de favoritos do NFT
    const countQuery = 'SELECT COUNT(*)::int as total FROM nft_favorites WHERE nft_id = $1';
    const countResult = await pool.query(countQuery, [nftId]);

    res.json({
      success: true,
      message: result.rows.length > 0 ? 'Removido dos favoritos' : 'Não estava nos favoritos',
      totalFavorites: countResult.rows[0].total
    });

  } catch (error) {
    console.error('Erro ao desfavoritar NFT:', error);
    res.status(500).json({ success: false, message: 'Erro ao desfavoritar NFT' });
  }
});

// GET /api/nfts/:nftId/favorites - Obter informações de favoritos de um NFT
router.get('/:nftId/favorites', async (req, res) => {
  try {
    const { nftId } = req.params;
    const userId = getUserIdFromToken(req);

    // Conta total de favoritos
    const countQuery = 'SELECT COUNT(*)::int as total FROM nft_favorites WHERE nft_id = $1';
    const countResult = await pool.query(countQuery, [nftId]);

    // Verifica se o usuário atual favoritou (se estiver autenticado)
    let isFavorited = false;
    if (userId) {
      const checkQuery = 'SELECT 1 FROM nft_favorites WHERE nft_id = $1 AND user_id = $2';
      const checkResult = await pool.query(checkQuery, [nftId, userId]);
      isFavorited = checkResult.rows.length > 0;
    }

    res.json({
      success: true,
      totalFavorites: countResult.rows[0].total,
      isFavorited: isFavorited
    });

  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar favoritos' });
  }
});

// GET /api/nft/:nftId/favorites/history - Série histórica simples de favoritos (últimos 14 dias)
router.get('/:nftId/favorites/history', async (req, res) => {
  try {
    const { nftId } = req.params;
    // últimos 14 dias incluindo hoje
    const q = `
      WITH days AS (
        SELECT generate_series((CURRENT_DATE - INTERVAL '13 day')::date, CURRENT_DATE::date, INTERVAL '1 day')::date AS d
      ), favs AS (
        SELECT date_trunc('day', created_at)::date AS d, COUNT(*)::int AS c
        FROM nft_favorites
        WHERE nft_id = $1 AND created_at >= (CURRENT_DATE - INTERVAL '13 day')
        GROUP BY 1
      )
      SELECT d.d AS day, COALESCE(f.c, 0)::int AS count
      FROM days d
      LEFT JOIN favs f ON f.d = d.d
      ORDER BY d.d
    `;
    const r = await pool.query(q, [nftId]);

    // Gera série acumulada para indicar crescimento
    let acc = 0;
    const series = r.rows.map(row => {
      acc += row.count;
      return { day: row.day, value: acc };
    });
    const first = series[0]?.value || 0;
    const last = series[series.length - 1]?.value || 0;
    const base = Math.max(first, 1);
    const growthPercent = ((last - first) / base) * 100;

    res.json({ success: true, series, growthPercent });
  } catch (error) {
    console.error('Erro ao buscar histórico de favoritos do NFT:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar histórico' });
  }
});

// GET /api/nft/:nftId/popularity - Calcula popularidade dinâmica baseada em favoritos recentes
router.get('/:nftId/popularity', async (req, res) => {
  try {
    const { nftId } = req.params;
    
    // Popularidade dinâmica com janelas curtas para a apresentação em aula
    // Critérios graduais (assumidos para demo):
    // - hot (🔥): ≥2 curtidas nos últimos 5–10 minutos
    // - popular (⭐): total ≥5 e ≥2 curtidas nos últimos 10 minutos
    // - trending (💎): total ≥10 e ≥2 curtidas nos últimos 15 minutos
    // - legendary (👑): total ≥15 e ≥3 curtidas nos últimos 20 minutos
    // Se não bater a meta na janela, o nível decai automaticamente
    const query = `
      SELECT 
        COUNT(*)::int                                          AS total_favorites,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '5 minutes')::int  AS fav_5m,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '10 minutes')::int AS fav_10m,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '15 minutes')::int AS fav_15m,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '20 minutes')::int AS fav_20m
      FROM nft_favorites
      WHERE nft_id = $1
    `;
    
    const result = await pool.query(query, [nftId]);
    const { total_favorites, fav_5m, fav_10m, fav_15m, fav_20m } = result.rows[0];
    
    // Lógica de popularidade dinâmica com janelas específicas
    
    let level = null;
    let icon = null;
    let label = null;
    
    // Sistema de níveis com requisito de curtidas recentes para manter o status
    if (total_favorites >= 15 && fav_20m >= 3) {
      level = 'legendary';
      icon = '👑';
      label = 'Lendário';
    } else if (total_favorites >= 10 && fav_15m >= 2) {
      level = 'trending';
      icon = '💎';
      label = 'Trending';
    } else if (total_favorites >= 5 && fav_10m >= 2) {
      level = 'popular';
      icon = '⭐';
      label = 'Popular';
    } else if (fav_5m >= 2 || fav_10m >= 2) {
      // Aquecendo: precisa de pelo menos 2 curtidas recentes (janela curta)
      level = 'hot';
      icon = '🔥';
      label = 'Aquecendo';
    }
    
    res.json({
      success: true,
      totalFavorites: total_favorites,
      // Mantém compatibilidade: expõe um agregado simples e as janelas detalhadas
      recentFavorites: Math.max(fav_5m, fav_10m, fav_15m, fav_20m),
      windows: { fav_5m, fav_10m, fav_15m, fav_20m },
      popularity: level ? { level, icon, label } : null
    });
    
  } catch (error) {
    console.error('Erro ao calcular popularidade:', error);
    res.status(500).json({ success: false, message: 'Erro ao calcular popularidade' });
  }
});

// GET /api/nft/:nftId/suggested-price - Calcula preço sugerido com base em sinais recentes
router.get('/:nftId/suggested-price', async (req, res) => {
  try {
    const { nftId } = req.params;

    // Busca informações básicas do NFT
    const nftQ = await pool.query(
      `SELECT nft_id, collection_id, creator_id, price, status FROM nfts WHERE nft_id = $1`,
      [nftId]
    );
    if (nftQ.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'NFT não encontrado' });
    }
    const nft = nftQ.rows[0];

    // Favoritos recentes (24h e 24-48h) para growth simples
    const favsQ = await pool.query(
      `SELECT 
         COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours')::int       AS fav_24h,
         COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '48 hours' AND created_at < NOW() - INTERVAL '24 hours')::int AS fav_prev_24h
       FROM nft_favorites WHERE nft_id = $1`,
      [nftId]
    );
    const { fav_24h, fav_prev_24h } = favsQ.rows[0];
    const basePrev = Math.max(parseInt(fav_prev_24h) || 0, 1);
    const growthPercent = ((parseInt(fav_24h) || 0) - (parseInt(fav_prev_24h) || 0)) / basePrev * 100;

    // Floor price da coleção (se existir)
    let floorPrice = null;
    if (nft.collection_id) {
      const floorQ = await pool.query(
        `SELECT MIN(price)::float AS floor
         FROM nfts
         WHERE collection_id = $1 AND price IS NOT NULL AND price > 0 AND status IN ('listed','for_sale')`,
        [nft.collection_id]
      );
      floorPrice = floorQ.rows[0]?.floor || null;
    }

    // Reputação do criador (favoritos últimos 14 dias em todos os NFTs dele)
    const repQ = await pool.query(
      `SELECT COUNT(*)::int AS fav_14d
       FROM nft_favorites f
       JOIN nfts n ON n.nft_id = f.nft_id
       WHERE n.creator_id = $1 AND f.created_at >= NOW() - INTERVAL '14 days'`,
      [nft.creator_id]
    );
    const creatorFav14d = repQ.rows[0]?.fav_14d || 0;

    // Âncora de preço
    const baseAnchor = parseFloat(nft.price) > 0 ? parseFloat(nft.price) : (floorPrice || 0.1);

    // Fatores ajustados conforme especificação:
    // - Popularidade: +3% por like nas últimas 24h, cap 40%
    const popularityFactor = 1 + Math.min(0.40, (parseInt(fav_24h) || 0) * 0.03);
    
    // - Crescimento: clamp entre -20% e +40%
    const growthFactor = 1 + Math.max(-0.20, Math.min(0.40, (growthPercent / 100)));
    
    // - Reputação: +4% a cada 20 favs em 14d, cap 24% (6 * 20 favs = 120 favs → 24%)
    const reputationFactor = 1 + Math.min(0.24, (creatorFav14d / 20) * 0.04);

    const suggested = baseAnchor * popularityFactor * growthFactor * reputationFactor;
    const suggestedRounded = Math.max(0.01, Math.round(suggested * 1000) / 1000); // 3 casas decimais

    res.json({
      success: true,
      nftId: nft.nft_id,
      suggestedPrice: suggestedRounded,
      currency: 'ETH',
      breakdown: {
        baseAnchor,
        floorPrice,
        popularityFactor,
        growthPercent,
        growthFactor,
        reputationFactor,
        fav_24h: parseInt(fav_24h) || 0,
        fav_prev_24h: parseInt(fav_prev_24h) || 0,
        creatorFav14d
      }
    });
  } catch (error) {
    console.error('Erro ao calcular preço sugerido:', error);
    res.status(500).json({ success: false, message: 'Erro ao calcular preço sugerido' });
  }
});

// PATCH /api/nft/:nftId/price - Atualiza preço (e opcionalmente status) do NFT
router.patch('/:nftId/price', async (req, res) => {
  try {
    const { nftId } = req.params;
    const { price, status } = req.body || {};
    const userId = getUserIdFromToken(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Não autenticado.' });
    }

    const nftQ = await pool.query('SELECT nft_id, creator_id, current_owner_id, price, status FROM nfts WHERE nft_id = $1', [nftId]);
    if (nftQ.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'NFT não encontrado' });
    }
    const nft = nftQ.rows[0];

    // Permite editar se for criador ou dono atual
    if (String(nft.creator_id) !== String(userId) && String(nft.current_owner_id) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Sem permissão para alterar este NFT.' });
    }

    const newPrice = parseFloat(price);
    if (!Number.isFinite(newPrice) || newPrice < 0) {
      return res.status(400).json({ success: false, message: 'Preço inválido.' });
    }

    let newStatus = nft.status;
    if (status && ['for_sale','listed','draft','none','sold'].includes(status)) {
      newStatus = status === 'none' ? null : status;
    }

    const upd = await pool.query(
      `UPDATE nfts 
         SET price = $1, status = COALESCE($2, status)
       WHERE nft_id = $3
       RETURNING nft_id, price, status`,
      [newPrice, newStatus, nftId]
    );

    res.json({ success: true, nft: upd.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar preço do NFT:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar preço' });
  }
});

// POST /api/nft/:nftId/purchase - Comprar NFT
router.post('/:nftId/purchase', async (req, res) => {
  const client = await pool.connect();
  try {
    const { nftId } = req.params;
    const buyerId = getUserIdFromToken(req);

    if (!buyerId) {
      return res.status(401).json({ success: false, message: 'Não autenticado.' });
    }

    await client.query('BEGIN');

    // 1. Buscar NFT e validar que está à venda (lock para evitar corrida)
    const nftQ = await client.query(
      'SELECT nft_id, name, price, status, creator_id, current_owner_id FROM nfts WHERE nft_id = $1 FOR UPDATE',
      [nftId]
    );
    if (nftQ.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'NFT não encontrado' });
    }
    const nft = nftQ.rows[0];

    if (!['for_sale', 'listed'].includes(nft.status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'NFT não está à venda' });
    }

    if (String(nft.current_owner_id) === String(buyerId)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Você já é o proprietário deste NFT' });
    }

    const price = parseFloat(nft.price);
    if (!price || price <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Preço inválido' });
    }

    // 2. Verificar saldo do comprador (lock na carteira)
    const buyerWalletQ = await client.query(
      'SELECT balance_eth FROM wallets WHERE user_id = $1 FOR UPDATE',
      [buyerId]
    );
    if (buyerWalletQ.rowCount === 0) {
      // Criar carteira se não existir
      await client.query(
        'INSERT INTO wallets (user_id, balance_eth) VALUES ($1, 0.00000000)',
        [buyerId]
      );
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Saldo insuficiente' });
    }

    const buyerBalance = parseFloat(buyerWalletQ.rows[0].balance_eth);
    if (buyerBalance < price) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: `Saldo insuficiente. Você tem ${buyerBalance.toFixed(8)} ETH e precisa de ${price.toFixed(8)} ETH` 
      });
    }

    const sellerId = nft.current_owner_id;

    // 3. Transferir ETH: comprador → vendedor
    const debitQ = await client.query(
      'UPDATE wallets SET balance_eth = balance_eth - $1 WHERE user_id = $2 AND balance_eth >= $1 RETURNING balance_eth',
      [price, buyerId]
    );
    if (debitQ.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Saldo insuficiente no momento da compra' });
    }

    // Garantir que vendedor tem carteira
    await client.query(
      'INSERT INTO wallets (user_id, balance_eth) VALUES ($1, 0.00000000) ON CONFLICT (user_id) DO NOTHING',
      [sellerId]
    );
    // lock carteira do vendedor
    await client.query('SELECT balance_eth FROM wallets WHERE user_id = $1 FOR UPDATE', [sellerId]);

    await client.query(
      'UPDATE wallets SET balance_eth = balance_eth + $1 WHERE user_id = $2',
      [price, sellerId]
    );

    // 4. Atualizar NFT: transferir propriedade e remover da venda
    await client.query(
      `UPDATE nfts 
       SET current_owner_id = $1, status = 'sold', price = $2
       WHERE nft_id = $3`,
      [buyerId, price, nftId]
    );

    // 5. Registrar transações
    await client.query(
      `INSERT INTO transactions (from_user_id, to_user_id, amount_eth, transaction_type, nft_id, description)
       VALUES ($1, $2, $3, 'nft_purchase', $4, $5)`,
      [buyerId, sellerId, price, nftId, `Compra do NFT "${nft.name}"`]
    );

    await client.query(
      `INSERT INTO transactions (from_user_id, to_user_id, amount_eth, transaction_type, nft_id, description)
       VALUES ($1, $2, $3, 'nft_sale', $4, $5)`,
      [sellerId, buyerId, price, nftId, `Venda do NFT "${nft.name}"`]
    );

    await client.query('COMMIT');

    res.json({ 
      success: true, 
      message: 'NFT comprado com sucesso!',
      nft: {
        nft_id: nft.nft_id,
        name: nft.name,
        new_owner_id: buyerId,
        price: price
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao comprar NFT:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar compra' });
  } finally {
    client.release();
  }
});

module.exports = router;
