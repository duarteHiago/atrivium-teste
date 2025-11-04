const express = require('express');
const router = express.Router();
const pool = require('../../db');
const jwt = require('jsonwebtoken');

// Helper: Extrair userId do token JWT
function getUserIdFromToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me');
    return decoded?.sub || null;
  } catch (err) {
    return null;
  }
}

// Helper: Verificar se o usuário é admin
async function isAdmin(userId) {
  try {
    const result = await pool.query('SELECT role FROM users WHERE user_id = $1', [userId]);
    return result.rows.length > 0 && result.rows[0].role === 'admin';
  } catch (err) {
    return false;
  }
}

// GET /api/wallet/balance - Obter saldo da carteira do usuário autenticado
router.get('/balance', async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ error: 'Token inválido ou não fornecido' });
    }

    const result = await pool.query(
      'SELECT balance_eth, updated_at FROM wallets WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // Criar carteira se não existir
      await pool.query(
        'INSERT INTO wallets (user_id, balance_eth) VALUES ($1, 0.00000000) ON CONFLICT (user_id) DO NOTHING',
        [userId]
      );
      return res.json({ balance_eth: '0.00000000', updated_at: new Date() });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao obter saldo da carteira:', err);
    res.status(500).json({ error: 'Erro ao obter saldo' });
  }
});

// GET /api/wallet/transactions - Obter histórico de transações do usuário autenticado
router.get('/transactions', async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ error: 'Token inválido ou não fornecido' });
    }

    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const result = await pool.query(
      `SELECT 
        t.transaction_id,
        t.from_user_id,
        t.to_user_id,
        t.amount_eth,
        t.transaction_type,
        t.nft_id,
        t.description,
        t.created_at,
        u_from.first_name || ' ' || u_from.last_name AS from_user_name,
        u_to.first_name || ' ' || u_to.last_name AS to_user_name,
        n.name AS nft_name,
        n.image_url AS nft_image
      FROM transactions t
      LEFT JOIN users u_from ON t.from_user_id = u_from.user_id
      LEFT JOIN users u_to ON t.to_user_id = u_to.user_id
      LEFT JOIN nfts n ON t.nft_id = n.nft_id
      WHERE t.from_user_id = $1 OR t.to_user_id = $1
      ORDER BY t.created_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao obter transações:', err);
    res.status(500).json({ error: 'Erro ao obter histórico' });
  }
});

// POST /api/wallet/admin/deposit - Admin deposita ETH na carteira de um usuário
router.post('/admin/deposit', async (req, res) => {
  try {
    const adminId = getUserIdFromToken(req);
    if (!adminId) {
      return res.status(401).json({ error: 'Token inválido ou não fornecido' });
    }

    // Verificar se é admin
    const adminCheck = await isAdmin(adminId);
    if (!adminCheck) {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem depositar ETH.' });
    }

    const { targetUserId, amount, description } = req.body;

    if (!targetUserId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'userId e amount (positivo) são obrigatórios' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verificar se a carteira do usuário existe, senão criar
      await client.query(
        'INSERT INTO wallets (user_id, balance_eth) VALUES ($1, 0.00000000) ON CONFLICT (user_id) DO NOTHING',
        [targetUserId]
      );

      // Adicionar saldo
      const updateResult = await client.query(
        'UPDATE wallets SET balance_eth = balance_eth + $1 WHERE user_id = $2 RETURNING balance_eth',
        [amount, targetUserId]
      );

      // Registrar transação
      await client.query(
        `INSERT INTO transactions (from_user_id, to_user_id, amount_eth, transaction_type, description)
         VALUES (NULL, $1, $2, 'admin_deposit', $3)`,
        [targetUserId, amount, description || `Depósito administrativo de ${amount} ETH`]
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        newBalance: updateResult.rows[0].balance_eth,
        message: `${amount} ETH depositado com sucesso`
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Erro ao depositar ETH:', err);
    res.status(500).json({ error: 'Erro ao processar depósito' });
  }
});

// GET /api/wallet/admin/all - Admin lista todas as carteiras
router.get('/admin/all', async (req, res) => {
  try {
    const adminId = getUserIdFromToken(req);
    if (!adminId) {
      return res.status(401).json({ error: 'Token inválido ou não fornecido' });
    }

    const adminCheck = await isAdmin(adminId);
    if (!adminCheck) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const result = await pool.query(
      `SELECT 
        w.wallet_id,
        w.user_id,
        w.balance_eth,
        w.updated_at,
        u.first_name,
        u.last_name,
        u.email
      FROM wallets w
      INNER JOIN users u ON w.user_id = u.user_id
      ORDER BY w.balance_eth DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar carteiras:', err);
    res.status(500).json({ error: 'Erro ao listar carteiras' });
  }
});

module.exports = router;
