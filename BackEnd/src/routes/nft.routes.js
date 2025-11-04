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

// PATCH /api/nft/:nftId/price - Atualiza preço (e opcionalmente status e buy_now_price) do NFT
router.patch('/:nftId/price', async (req, res) => {
  try {
    const { nftId } = req.params;
    const { price, buy_now_price, status } = req.body || {};
    const userId = getUserIdFromToken(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Não autenticado.' });
    }

    const nftQ = await pool.query('SELECT nft_id, creator_id, current_owner_id, price, buy_now_price, status FROM nfts WHERE nft_id = $1', [nftId]);
    if (nftQ.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'NFT não encontrado' });
    }
    const nft = nftQ.rows[0];

    // Permite editar se for criador ou dono atual
    if (String(nft.creator_id) !== String(userId) && String(nft.current_owner_id) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Sem permissão para alterar este NFT.' });
    }

    const updates = [];
    const values = [];
    let idx = 1;

    if (price !== undefined) {
      const newPrice = parseFloat(price);
      if (!Number.isFinite(newPrice) || newPrice < 0) {
        return res.status(400).json({ success: false, message: 'Preço base inválido.' });
      }
      updates.push(`price = $${idx++}`);
      values.push(newPrice);
    }

    if (buy_now_price !== undefined) {
      const newBuyNow = buy_now_price === null ? null : parseFloat(buy_now_price);
      if (newBuyNow !== null && (!Number.isFinite(newBuyNow) || newBuyNow <= 0)) {
        return res.status(400).json({ success: false, message: 'Preço de compra imediata inválido.' });
      }
      updates.push(`buy_now_price = $${idx++}`);
      values.push(newBuyNow);
    }

    if (status && ['for_sale','listed','draft','none','sold'].includes(status)) {
      const newStatus = status === 'none' ? null : status;
      updates.push(`status = $${idx++}`);
      values.push(newStatus);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Nenhum campo para atualizar.' });
    }

    values.push(nftId);

    const upd = await pool.query(
      `UPDATE nfts 
         SET ${updates.join(', ')}
       WHERE nft_id = $${idx}
       RETURNING nft_id, price, buy_now_price, status`,
      values
    );

    res.json({ success: true, nft: upd.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar preço do NFT:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar preço' });
  }
});

// ==================== ROTAS DE OFERTAS ====================

// POST /api/nft/:nftId/offers - Criar oferta para um NFT
router.post('/:nftId/offers', async (req, res) => {
  try {
    const { nftId } = req.params;
    const { amount, message, expiresInHours } = req.body;
    const buyerId = getUserIdFromToken(req);

    if (!buyerId) {
      return res.status(401).json({ success: false, message: 'Não autenticado.' });
    }

    const amountEth = parseFloat(amount);
    if (!amountEth || amountEth <= 0) {
      return res.status(400).json({ success: false, message: 'Valor da oferta inválido.' });
    }

    // Verifica se NFT existe e está à venda
    const nftQ = await pool.query(
      'SELECT nft_id, name, status, current_owner_id, price, buy_now_price FROM nfts WHERE nft_id = $1',
      [nftId]
    );
    if (nftQ.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'NFT não encontrado.' });
    }
    const nft = nftQ.rows[0];

    if (!['for_sale', 'listed'].includes(nft.status)) {
      return res.status(400).json({ success: false, message: 'NFT não está disponível para ofertas.' });
    }

    if (String(nft.current_owner_id) === String(buyerId)) {
      return res.status(400).json({ success: false, message: 'Você não pode fazer oferta no seu próprio NFT.' });
    }

    // Verifica saldo do comprador
    const walletQ = await pool.query('SELECT balance_eth FROM wallets WHERE user_id = $1', [buyerId]);
    const balance = walletQ.rowCount > 0 ? parseFloat(walletQ.rows[0].balance_eth) : 0;
    if (balance < amountEth) {
      return res.status(400).json({ 
        success: false, 
        message: `Saldo insuficiente. Você tem ${balance.toFixed(4)} ETH e precisa de ${amountEth.toFixed(4)} ETH.` 
      });
    }

    // Calcula expiração (se fornecida)
    let expiresAt = null;
    if (expiresInHours && expiresInHours > 0) {
      expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    }

    // Cancela ofertas pendentes anteriores deste comprador para este NFT
    await pool.query(
      `UPDATE nft_offers SET status = 'cancelled' WHERE nft_id = $1 AND buyer_id = $2 AND status = 'pending'`,
      [nftId, buyerId]
    );

    // Cria nova oferta
    const insertQ = await pool.query(
      `INSERT INTO nft_offers (nft_id, buyer_id, amount_eth, message, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING offer_id, amount_eth, status, created_at`,
      [nftId, buyerId, amountEth, message || null, expiresAt]
    );

    res.json({
      success: true,
      message: 'Oferta enviada com sucesso!',
      offer: insertQ.rows[0]
    });

  } catch (error) {
    console.error('Erro ao criar oferta:', error);
    res.status(500).json({ success: false, message: 'Erro ao criar oferta.' });
  }
});

// GET /api/nft/:nftId/offers - Listar ofertas de um NFT (públicas ou do dono)
router.get('/:nftId/offers', async (req, res) => {
  try {
    const { nftId } = req.params;
    const userId = getUserIdFromToken(req);

    // Busca NFT para validar propriedade e status
    const nftQ = await pool.query('SELECT current_owner_id, status FROM nfts WHERE nft_id = $1', [nftId]);
    if (nftQ.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'NFT não encontrado.' });
    }
    
    const nft = nftQ.rows[0];
    const isOwner = userId && String(nft.current_owner_id) === String(userId);
    
    // Se NFT já foi vendido (status 'sold'), não retorna ofertas
    if (nft.status === 'sold') {
      return res.json({
        success: true,
        offers: [],
        isOwner
      });
    }

    // Se for dono, mostra todas pendentes; senão, só as públicas (pending) ou as próprias
    let query = `
      SELECT o.*, 
             u.first_name, u.last_name, u.avatar_url,
             COALESCE(u.first_name || ' ' || u.last_name, u.cpf) AS buyer_name
      FROM nft_offers o
      JOIN users u ON o.buyer_id = u.user_id
      WHERE o.nft_id = $1
    `;
    const params = [nftId];

    if (!isOwner) {
      if (userId) {
        query += ` AND (o.status = 'pending' OR o.buyer_id = $2)`;
        params.push(userId);
      } else {
        query += ` AND o.status = 'pending'`;
      }
    } else {
      // Dono vê apenas ofertas pendentes
      query += ` AND o.status = 'pending'`;
    }

    query += ` ORDER BY o.created_at DESC`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      offers: result.rows,
      isOwner
    });

  } catch (error) {
    console.error('Erro ao listar ofertas:', error);
    res.status(500).json({ success: false, message: 'Erro ao listar ofertas.' });
  }
});

// PATCH /api/offers/:offerId/accept - Dono aceita oferta
router.patch('/offers/:offerId/accept', async (req, res) => {
  const client = await pool.connect();
  try {
    const { offerId } = req.params;
    const ownerId = getUserIdFromToken(req);

    console.log(`\n🔔 Tentativa de aceitar oferta ${offerId} pelo usuário ${ownerId}`);

    if (!ownerId) {
      console.log('❌ Usuário não autenticado');
      return res.status(401).json({ success: false, message: 'Não autenticado.' });
    }

    await client.query('BEGIN');

    // Busca oferta com lock
    const offerQ = await client.query(
      `SELECT o.offer_id, o.buyer_id, o.amount_eth, o.status as offer_status,
              n.nft_id, n.name, n.current_owner_id, n.status as nft_status
       FROM nft_offers o
       JOIN nfts n ON n.nft_id = o.nft_id
       WHERE o.offer_id = $1
       FOR UPDATE OF o`,
      [offerId]
    );

    if (offerQ.rowCount === 0) {
      await client.query('ROLLBACK');
      console.log('❌ Oferta não encontrada');
      return res.status(404).json({ success: false, message: 'Oferta não encontrada.' });
    }

    const offer = offerQ.rows[0];
    console.log('📋 Oferta encontrada:', {
      offer_id: offer.offer_id,
      offer_status: offer.offer_status,
      nft_status: offer.nft_status,
      current_owner_id: offer.current_owner_id,
      buyer_id: offer.buyer_id
    });

    // Valida propriedade
    if (String(offer.current_owner_id) !== String(ownerId)) {
      await client.query('ROLLBACK');
      console.log('❌ Usuário não é o dono do NFT');
      return res.status(403).json({ success: false, message: 'Apenas o dono pode aceitar ofertas.' });
    }

    // Valida status da oferta
    if (offer.offer_status !== 'pending') {
      await client.query('ROLLBACK');
      console.log(`❌ Oferta já foi ${offer.offer_status}`);
      return res.status(400).json({ success: false, message: `Oferta já foi ${offer.offer_status}.` });
    }

    // Valida NFT disponível
    if (!['for_sale', 'listed'].includes(offer.nft_status)) {
      await client.query('ROLLBACK');
      console.log(`❌ NFT não está à venda (status: ${offer.nft_status})`);
      return res.status(400).json({ success: false, message: 'NFT não está mais à venda.' });
    }

    const amount = parseFloat(offer.amount_eth);
    const buyerId = offer.buyer_id;
    const sellerId = ownerId;

    // Verifica saldo do comprador
    const buyerWalletQ = await client.query(
      'SELECT balance_eth FROM wallets WHERE user_id = $1 FOR UPDATE',
      [buyerId]
    );
    if (buyerWalletQ.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Comprador sem carteira.' });
    }

    const buyerBalance = parseFloat(buyerWalletQ.rows[0].balance_eth);
    if (buyerBalance < amount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: `Comprador não tem saldo suficiente (tem ${buyerBalance.toFixed(4)} ETH).` 
      });
    }

    // Transfere ETH
    await client.query(
      'UPDATE wallets SET balance_eth = balance_eth - $1 WHERE user_id = $2',
      [amount, buyerId]
    );

    await client.query(
      'INSERT INTO wallets (user_id, balance_eth) VALUES ($1, 0) ON CONFLICT (user_id) DO NOTHING',
      [sellerId]
    );
    await client.query('SELECT 1 FROM wallets WHERE user_id = $1 FOR UPDATE', [sellerId]);
    await client.query(
      'UPDATE wallets SET balance_eth = balance_eth + $1 WHERE user_id = $2',
      [amount, sellerId]
    );

    // Transfere propriedade do NFT
    const updateNftResult = await client.query(
      `UPDATE nfts SET current_owner_id = $1, status = 'sold', price = $2 WHERE nft_id = $3 RETURNING nft_id, current_owner_id, status`,
      [buyerId, amount, offer.nft_id]
    );
    
    console.log('NFT atualizado:', updateNftResult.rows[0]);

    // Atualiza oferta
    await client.query(
      `UPDATE nft_offers SET status = 'accepted', accepted_at = CURRENT_TIMESTAMP WHERE offer_id = $1`,
      [offerId]
    );

    // Rejeita outras ofertas pendentes
    const rejectResult = await client.query(
      `UPDATE nft_offers SET status = 'rejected' WHERE nft_id = $1 AND status = 'pending' AND offer_id != $2 RETURNING offer_id`,
      [offer.nft_id, offerId]
    );
    
    console.log(`Ofertas rejeitadas: ${rejectResult.rowCount}`);

    // Registra transação (apenas uma - vendedor recebe de comprador)
    await client.query(
      `INSERT INTO transactions (from_user_id, to_user_id, amount_eth, transaction_type, nft_id, description)
       VALUES ($1, $2, $3, 'nft_sale', $4, $5)`,
      [sellerId, buyerId, amount, offer.nft_id, `Venda via oferta do NFT "${offer.name}"`]
    );

    await client.query('COMMIT');
    
    console.log(`✅ Oferta ${offerId} aceita com sucesso. NFT ${offer.nft_id} vendido para ${buyerId}`);

    res.json({
      success: true,
      message: 'Oferta aceita! NFT vendido com sucesso.',
      offer: { offer_id: offerId, amount_eth: amount, buyer_id: buyerId },
      nft: { nft_id: offer.nft_id, new_owner_id: buyerId, status: 'sold' }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao aceitar oferta:', error);
    res.status(500).json({ success: false, message: 'Erro ao aceitar oferta.' });
  } finally {
    client.release();
  }
});

// PATCH /api/offers/:offerId/reject - Dono rejeita oferta
router.patch('/offers/:offerId/reject', async (req, res) => {
  try {
    const { offerId } = req.params;
    const ownerId = getUserIdFromToken(req);

    if (!ownerId) {
      return res.status(401).json({ success: false, message: 'Não autenticado.' });
    }

    const offerQ = await pool.query(
      `SELECT o.offer_id, o.status, n.current_owner_id
       FROM nft_offers o
       JOIN nfts n ON n.nft_id = o.nft_id
       WHERE o.offer_id = $1`,
      [offerId]
    );

    if (offerQ.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Oferta não encontrada.' });
    }

    const offer = offerQ.rows[0];

    if (String(offer.current_owner_id) !== String(ownerId)) {
      return res.status(403).json({ success: false, message: 'Apenas o dono pode rejeitar ofertas.' });
    }

    if (offer.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Oferta já foi ${offer.status}.` });
    }

    await pool.query(
      `UPDATE nft_offers SET status = 'rejected', rejected_at = CURRENT_TIMESTAMP WHERE offer_id = $1`,
      [offerId]
    );

    res.json({
      success: true,
      message: 'Oferta rejeitada.'
    });

  } catch (error) {
    console.error('Erro ao rejeitar oferta:', error);
    res.status(500).json({ success: false, message: 'Erro ao rejeitar oferta.' });
  }
});

// DELETE /api/offers/:offerId - Comprador cancela própria oferta
router.delete('/offers/:offerId', async (req, res) => {
  try {
    const { offerId } = req.params;
    const userId = getUserIdFromToken(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Não autenticado.' });
    }

    const offerQ = await pool.query(
      'SELECT offer_id, buyer_id, status FROM nft_offers WHERE offer_id = $1',
      [offerId]
    );

    if (offerQ.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Oferta não encontrada.' });
    }

    const offer = offerQ.rows[0];

    if (String(offer.buyer_id) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Você só pode cancelar suas próprias ofertas.' });
    }

    if (offer.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Oferta já foi ${offer.status}.` });
    }

    await pool.query(
      `UPDATE nft_offers SET status = 'cancelled' WHERE offer_id = $1`,
      [offerId]
    );

    res.json({
      success: true,
      message: 'Oferta cancelada.'
    });

  } catch (error) {
    console.error('Erro ao cancelar oferta:', error);
    res.status(500).json({ success: false, message: 'Erro ao cancelar oferta.' });
  }
});

// ==================== COMPRA DIRETA (buy_now_price) ====================

// POST /api/nft/:nftId/purchase - Comprar NFT (buy_now_price ou price)
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
      'SELECT nft_id, name, price, buy_now_price, status, creator_id, current_owner_id FROM nfts WHERE nft_id = $1 FOR UPDATE',
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

    // Prioriza buy_now_price se existir, senão usa price
    const buyNowPrice = parseFloat(nft.buy_now_price);
    const basePrice = parseFloat(nft.price);
    
    let finalPrice;
    let purchaseType;

    if (buyNowPrice && buyNowPrice > 0) {
      // Compra imediata disponível
      finalPrice = buyNowPrice;
      purchaseType = 'buy_now';
    } else if (basePrice && basePrice > 0) {
      // Compra direta pelo preço base (se não houver buy_now)
      finalPrice = basePrice;
      purchaseType = 'direct';
    } else {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'NFT não tem preço de compra direta. Faça uma oferta.' });
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
    if (buyerBalance < finalPrice) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: `Saldo insuficiente. Você tem ${buyerBalance.toFixed(8)} ETH e precisa de ${finalPrice.toFixed(8)} ETH` 
      });
    }

    const sellerId = nft.current_owner_id;

    // 3. Transferir ETH: comprador → vendedor
    const debitQ = await client.query(
      'UPDATE wallets SET balance_eth = balance_eth - $1 WHERE user_id = $2 AND balance_eth >= $1 RETURNING balance_eth',
      [finalPrice, buyerId]
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
      [finalPrice, sellerId]
    );

    // 4. Atualizar NFT: transferir propriedade e remover da venda
    await client.query(
      `UPDATE nfts 
       SET current_owner_id = $1, status = 'sold', price = $2
       WHERE nft_id = $3`,
      [buyerId, finalPrice, nftId]
    );

    // 5. Registrar transação (apenas uma - vendedor recebe de comprador)
    const description = purchaseType === 'buy_now' 
      ? `Compra imediata (Buy Now) do NFT "${nft.name}"`
      : `Compra direta do NFT "${nft.name}"`;

    await client.query(
      `INSERT INTO transactions (from_user_id, to_user_id, amount_eth, transaction_type, nft_id, description)
       VALUES ($1, $2, $3, 'nft_sale', $4, $5)`,
      [sellerId, buyerId, finalPrice, nftId, description]
    );

    await client.query('COMMIT');

    res.json({ 
      success: true, 
      message: purchaseType === 'buy_now' ? 'Compra imediata realizada!' : 'NFT comprado com sucesso!',
      nft: {
        nft_id: nft.nft_id,
        name: nft.name,
        new_owner_id: buyerId,
        price: finalPrice,
        purchase_type: purchaseType
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

// GET /api/nft/:nftId/history - Histórico de transações de um NFT
router.get('/:nftId/history', async (req, res) => {
  try {
    const { nftId } = req.params;

    const historyQuery = `
      SELECT 
        t.transaction_id,
        t.amount_eth,
        t.transaction_type,
        t.description,
        t.created_at,
        t.from_user_id,
        t.to_user_id,
        from_user.first_name AS from_first_name,
        from_user.last_name AS from_last_name,
        from_user.nickname AS from_nickname,
        from_user.avatar_url AS from_avatar,
        to_user.first_name AS to_first_name,
        to_user.last_name AS to_last_name,
        to_user.nickname AS to_nickname,
        to_user.avatar_url AS to_avatar
      FROM transactions t
      LEFT JOIN users from_user ON t.from_user_id = from_user.user_id
      LEFT JOIN users to_user ON t.to_user_id = to_user.user_id
      WHERE t.nft_id = $1
        AND t.transaction_type = 'nft_sale'
      ORDER BY t.created_at DESC
    `;

    const result = await pool.query(historyQuery, [nftId]);

    // Formatar dados
    const history = result.rows.map(row => ({
      transaction_id: row.transaction_id,
      amount_eth: parseFloat(row.amount_eth),
      transaction_type: row.transaction_type,
      description: row.description,
      created_at: row.created_at,
      from_user: row.from_user_id ? {
        user_id: row.from_user_id,
        name: row.from_nickname || `${row.from_first_name} ${row.from_last_name}`,
        avatar_url: row.from_avatar
      } : null,
      to_user: row.to_user_id ? {
        user_id: row.to_user_id,
        name: row.to_nickname || `${row.to_first_name} ${row.to_last_name}`,
        avatar_url: row.to_avatar
      } : null
    }));

    res.json({
      success: true,
      history,
      total: history.length
    });

  } catch (error) {
    console.error('Erro ao buscar histórico do NFT:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar histórico' });
  }
});

// GET /api/nft/transactions/all - Histórico completo de transações (para CMS)
router.get('/transactions/all', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const historyQuery = `
      SELECT 
        t.transaction_id,
        t.amount_eth,
        t.transaction_type,
        t.description,
        t.created_at,
        t.from_user_id,
        t.to_user_id,
        t.nft_id,
        n.name AS nft_name,
        n.image_url AS nft_image,
        n.price AS nft_original_price,
        n.creator_id AS nft_creator_id,
        c.name AS collection_name,
        creator.first_name AS creator_first_name,
        creator.last_name AS creator_last_name,
        creator.nickname AS creator_nickname,
        creator.avatar_url AS creator_avatar,
        from_user.first_name AS from_first_name,
        from_user.last_name AS from_last_name,
        from_user.nickname AS from_nickname,
        from_user.avatar_url AS from_avatar,
        to_user.first_name AS to_first_name,
        to_user.last_name AS to_last_name,
        to_user.nickname AS to_nickname,
        to_user.avatar_url AS to_avatar
      FROM transactions t
      LEFT JOIN nfts n ON t.nft_id = n.nft_id
      LEFT JOIN collections c ON n.collection_id = c.collection_id
      LEFT JOIN users creator ON n.creator_id = creator.user_id
      LEFT JOIN users from_user ON t.from_user_id = from_user.user_id
      LEFT JOIN users to_user ON t.to_user_id = to_user.user_id
      WHERE t.transaction_type = 'nft_sale'
      ORDER BY t.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM transactions
      WHERE transaction_type = 'nft_sale'
    `;

    const [result, countResult] = await Promise.all([
      pool.query(historyQuery, [limit, offset]),
      pool.query(countQuery)
    ]);

    const total = countResult.rows[0]?.total || 0;

    // Formatar dados com valorização
    const history = result.rows.map(row => ({
      transaction_id: row.transaction_id,
      amount_eth: parseFloat(row.amount_eth),
      transaction_type: row.transaction_type,
      description: row.description,
      created_at: row.created_at,
      nft: row.nft_id ? {
        nft_id: row.nft_id,
        name: row.nft_name,
        image_url: row.nft_image,
        original_price: row.nft_original_price ? parseFloat(row.nft_original_price) : null,
        collection_name: row.collection_name
      } : null,
      creator: row.nft_creator_id ? {
        user_id: row.nft_creator_id,
        name: row.creator_nickname || `${row.creator_first_name} ${row.creator_last_name}`,
        avatar_url: row.creator_avatar
      } : null,
      from_user: row.from_user_id ? {
        user_id: row.from_user_id,
        name: row.from_nickname || `${row.from_first_name} ${row.from_last_name}`,
        avatar_url: row.from_avatar
      } : null,
      to_user: row.to_user_id ? {
        user_id: row.to_user_id,
        name: row.to_nickname || `${row.to_first_name} ${row.to_last_name}`,
        avatar_url: row.to_avatar
      } : null
    }));

    res.json({
      success: true,
      transactions: history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar histórico completo:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar histórico' });
  }
});

module.exports = router;

