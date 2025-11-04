// Carrega variáveis de ambiente do arquivo .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // Driver do PostgreSQL
const bcrypt = require('bcrypt'); // Para hash de senha
const jwt = require('jsonwebtoken'); // Para gerar tokens JWT
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { upload, ensureDir } = require('./src/middleware/upload');

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Importar rotas
const nftRoutes = require('./src/routes/nft.routes');
const leonardoRoutes = require('./src/routes/leonardo.routes'); // Rotas da API Leonardo
const collectionRoutes = require('./src/routes/collection.routes'); // Rotas de Coleções
const ipfsRoutes = require('./src/routes/ipfs.routes'); // Rotas IPFS/Pinata
const walletRoutes = require('./src/routes/wallet.routes'); // Rotas de Carteira

// Middlewares
app.use(cors()); // Permite requisições do frontend
app.use(express.json({ limit: '10mb' })); // Habilita o parsing de JSON (aumenta limite para imagens)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos (imagens dos NFTs)
app.use('/uploads', express.static('uploads'));

// Usar rotas
app.use('/api/leonardo', leonardoRoutes); // Rotas da API Leonardo
app.use('/api/collections', collectionRoutes); // Rotas de Coleções
console.log('📍 Registrando rotas IPFS em /api/ipfs');
app.use('/api/ipfs', ipfsRoutes); // Rotas IPFS/Pinata
console.log('✅ Rotas IPFS registradas');
app.use('/api/wallet', walletRoutes); // Rotas de Carteira
console.log('✅ Rotas de Carteira registradas');

// Rota de teste simples
app.get('/api/test', (req, res) => {
  res.json({ message: 'Servidor funcionando!' });
});

// Configuração da Conexão com o Banco de Dados (lê do .env)
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Teste de Conexão com o DB (opcional)
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.stack);
  } else {
    console.log('Conectado ao banco de dados:', res.rows[0].now);
  }
});

// Garantir que a coluna 'role' exista em users (admin/user)
(async () => {
  try {
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';`);
    // Suporte a destaque de coleções em carrossel
    await pool.query(`ALTER TABLE collections ADD COLUMN IF NOT EXISTS featured_order SMALLINT;`);
    // Campos de perfil do usuário
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname VARCHAR(50);`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS banner_url TEXT;`);

    // Garantir colunas necessárias em collections
    await pool.query(`ALTER TABLE collections ADD COLUMN IF NOT EXISTS cover_image_url VARCHAR(500);`);
    await pool.query(`ALTER TABLE collections ADD COLUMN IF NOT EXISTS slug VARCHAR(100);`);
    await pool.query(`ALTER TABLE collections ADD COLUMN IF NOT EXISTS floor_price DECIMAL(18,8) DEFAULT 0;`);
    await pool.query(`ALTER TABLE collections ADD COLUMN IF NOT EXISTS total_volume DECIMAL(18,8) DEFAULT 0;`);
    await pool.query(`ALTER TABLE collections ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;`);

    // Índices/constraints idempotentes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_collections_featured ON collections(is_featured);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_collections_creator ON collections(creator_id);`);

    // Relacionamento em nfts para collection (se ainda não existir)
    await pool.query(`ALTER TABLE nfts ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES collections(collection_id) ON DELETE SET NULL;`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_nfts_collection ON nfts(collection_id);`);

    // Campos IPFS em nfts
    await pool.query(`ALTER TABLE nfts ADD COLUMN IF NOT EXISTS ipfs_hash VARCHAR(100);`);
    await pool.query(`ALTER TABLE nfts ADD COLUMN IF NOT EXISTS network VARCHAR(20) DEFAULT 'off-chain';`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_nfts_ipfs ON nfts(ipfs_hash);`);
  } catch (e) {
    console.error('Erro ao ajustar schema de users (role):', e.message);
  }
})();

// Seed: garante um usuário admin padrão em ambientes de dev/build
async function ensureDefaultAdmin() {
  try {
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    const ADMIN_FIRST = process.env.ADMIN_FIRST_NAME || 'Admin';
    const ADMIN_LAST = process.env.ADMIN_LAST_NAME || 'User';
    const ADMIN_BIRTH_DATE = process.env.ADMIN_BIRTH_DATE || '1990-01-01';
    const RAW_ADMIN_CPF = (process.env.ADMIN_CPF || '').trim();

    // Garante um CPF válido para o schema (NOT NULL) no seed do admin
    let ADMIN_CPF;
    if (RAW_ADMIN_CPF) {
      // Aproveita a função de formatação já utilizada no cadastro
      ADMIN_CPF = formatCPF(RAW_ADMIN_CPF);
    } else {
      // Gera um CPF placeholder único (apenas formato e unicidade no banco; não valida DV)
      const digits = (Date.now().toString() + '00000000000').slice(0, 11);
      ADMIN_CPF = formatCPF(digits);
      console.log(`⚠️ ADMIN_CPF não informado; usando CPF gerado para seed: ${ADMIN_CPF}`);
    }

    // Verifica se já existe usuário com este email
    const rs = await pool.query('SELECT user_id, role FROM users WHERE email = $1 LIMIT 1', [ADMIN_EMAIL]);
    if (rs.rows.length > 0) {
      // Se já existe, garante que role seja admin
      if (rs.rows[0].role !== 'admin') {
        await pool.query('UPDATE users SET role = $1 WHERE user_id = $2', ['admin', rs.rows[0].user_id]);
        console.log(`👑 Promovido usuário existente a admin: ${ADMIN_EMAIL}`);
      } else {
        console.log(`✅ Admin padrão já existe: ${ADMIN_EMAIL}`);
      }
      return;
    }

    // Cria novo admin com senha hash
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);

    await pool.query(
      `INSERT INTO users (first_name, last_name, cpf, birth_date, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, $6, 'admin')`,
      [ADMIN_FIRST, ADMIN_LAST, ADMIN_CPF, ADMIN_BIRTH_DATE, ADMIN_EMAIL, password_hash]
    );
    console.log(`✅ Admin padrão criado: ${ADMIN_EMAIL}`);
  } catch (e) {
    console.error('Erro ao garantir admin padrão:', e.message);
  }
}

// Invoca seed de admin após inicialização do app
ensureDefaultAdmin();


// Armazena o pool no app para acesso nos controllers
app.locals.pool = pool;

// --- ROTAS ---

// Rotas de NFT
app.use('/api/nft', nftRoutes);


// --- LÓGICA DE VALIDAÇÃO ---

// Regex para validar email
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Regex para validar formato CPF
const cpfFormatRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

// Função para formatar CPF
function formatCPF(cpf) {
  // Remove tudo que não for dígito
  const digitsOnly = cpf.replace(/\D/g, '');
  // Aplica a formatação se tiver 11 dígitos
  if (digitsOnly.length === 11) {
    return digitsOnly.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return cpf; // Retorna original se não for válido para formatação
}

// --- ENDPOINT DE CADASTRO ---
app.post('/api/auth/register', async (req, res) => {
  const {
    firstName,    // 'Nome' do SignUpForm.jsx
    lastName,     // 'Sobrenome' do SignUpForm.jsx
    cpf,          // 'CPF' do SignUpForm.jsx
    birthDate,    // 'Data de Nascimento' do SignUpForm.jsx
    email,        // 'E-mail' do SignUpForm.jsx
    password,     // 'Senha' do SignUpForm.jsx
    cep,          // 'CEP' do SignUpForm.jsx
    address,      // 'Endereço' do SignUpForm.jsx
    gender        // 'gender' do SignUpForm.jsx
  } = req.body;

  // --- VALIDAÇÕES ---

  // 1. Validação do Email (Formato)
  if (!emailRegex.test(email)) {
    // Usamos return para parar a execução aqui
    return res.status(400).json({ message: 'Formato de e-mail inválido.' });
  }

  // 2. Formatação e Validação do CPF
  const formattedCPF = formatCPF(cpf);
  if (!cpfFormatRegex.test(formattedCPF)) {
    return res.status(400).json({ message: 'Formato de CPF inválido. Use apenas números ou o formato XXX.XXX.XXX-XX.' });
  }
  // TODO: Adicionar validação de CPF real (verificar dígitos verificadores - existem libs para isso)

  // 3. Validação Idade Mínima (já feita no frontend, mas bom validar no backend também)
  const dob = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  if (age < 18) {
    return res.status(400).json({ message: 'Você deve ter pelo menos 18 anos para se cadastrar.' });
  }

  // --- VERIFICAÇÃO DE UNICIDADE E SEGURANÇA ---
  try {
    // 4. Verificar se Email ou CPF já existem (SEGURANÇA: Usando query parametrizada)
    // Usamos $1, $2 como placeholders. O driver 'pg' substitui de forma segura, prevenindo SQL Injection.
    const checkUserQuery = 'SELECT email, cpf FROM users WHERE email = $1 OR cpf = $2';
    const checkUserResult = await pool.query(checkUserQuery, [email, formattedCPF]);

    if (checkUserResult.rows.length > 0) {
      const existing = checkUserResult.rows[0];
      if (existing.email === email) {
        return res.status(409).json({ message: 'Este e-mail já está cadastrado.' }); // 409 Conflict
      }
      if (existing.cpf === formattedCPF) {
        return res.status(409).json({ message: 'Este CPF já está cadastrado.' }); // 409 Conflict
      }
    }

    // 5. Gerar Hash da Senha (SEGURANÇA: Nunca salvar senha pura)
    const saltRounds = 10; // Fator de custo para o bcrypt (quanto maior, mais lento e seguro)
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // --- INSERÇÃO NO BANCO DE DADOS ---
    // (SEGURANÇA: Usando query parametrizada novamente)
    const insertUserQuery = `
      INSERT INTO users (first_name, last_name, cpf, birth_date, email, password_hash, cep, address, gender)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING user_id, email, first_name, last_name, role; -- Retorna o ID e email do usuário criado
    `;
    const values = [
      firstName, lastName, formattedCPF, birthDate, email,
      passwordHash, cep || null, address || null, gender || null
    ];

    const newUserResult = await pool.query(insertUserQuery, values);

    // Retorna sucesso
    res.status(201).json({ // 201 Created
      message: 'Usuário cadastrado com sucesso!',
      user: newUserResult.rows[0] // Envia os dados do usuário criado (sem a senha!)
    });

  } catch (error) {
    console.error('Erro ao registrar usuário:', error.stack);
    res.status(500).json({ message: 'Erro interno do servidor ao tentar registrar o usuário.' });
  }
});


// Endpoint de Login (a ser implementado)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    const userQuery = `
      SELECT user_id, first_name, last_name, email, password_hash, role
      FROM users WHERE email = $1 LIMIT 1
    `;
    const result = await pool.query(userQuery, [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { sub: user.user_id, email: user.email, name: `${user.first_name} ${user.last_name}` , role: user.role || 'user'},
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      message: 'Login realizado com sucesso.',
      token,
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role || 'user'
      }
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ message: 'Erro interno no login.' });
  }
});

// Middleware simples para validar JWT
function authMiddleware(req, res, next) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Token ausente.' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // sub = user_id
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Token inválido.' });
  }
}

// Endpoint para obter dados do usuário autenticado
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.sub;
    const q = `SELECT user_id, first_name, last_name, email, role, cep, address, gender, nickname, bio, avatar_url, banner_url FROM users WHERE user_id = $1`;
    const r = await pool.query(q, [userId]);
    if (r.rows.length === 0) return res.status(404).json({ message: 'Usuário não encontrado.' });
    res.json({ user: r.rows[0] });
  } catch (err) {
    console.error('Erro no /me:', err);
    res.status(500).json({ message: 'Erro interno.' });
  }
});

// Atualizar perfil do usuário autenticado
app.patch('/api/users/me', authMiddleware, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), async (req, res) => {
  try {
    const userId = req.user.sub;
    const { first_name, last_name, cep, address, gender, nickname, bio } = req.body || {};

    const fields = [];
    const values = [];
    let idx = 1;
    if (typeof first_name === 'string') { fields.push(`first_name = $${idx++}`); values.push(first_name); }
    if (typeof last_name === 'string')  { fields.push(`last_name = $${idx++}`); values.push(last_name); }
    if (typeof cep === 'string')        { fields.push(`cep = $${idx++}`); values.push(cep); }
    if (typeof address === 'string')    { fields.push(`address = $${idx++}`); values.push(address); }
    if (typeof gender === 'string')     { fields.push(`gender = $${idx++}`); values.push(gender); }
    if (typeof nickname === 'string')   { fields.push(`nickname = $${idx++}`); values.push(nickname); }
    if (typeof bio === 'string')        { fields.push(`bio = $${idx++}`); values.push(bio); }

    // Processar URLs diretas (R2 via Worker) OU uploads locais
    const baseUrl = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;

    // Se o frontend já subiu no Worker e enviou avatar_url/banner_url, priorize esses valores
    if (req.body?.avatar_url) {
      fields.push(`avatar_url = $${idx++}`); values.push(req.body.avatar_url);
    } else if (req.files?.avatar?.[0]?.buffer) {
      const uploadDir = path.join(process.cwd(), 'uploads', 'users', 'avatars');
      ensureDir(uploadDir);
      const filename = `${userId}-avatar.webp`;
      const target = path.join(uploadDir, filename);
      await sharp(req.files.avatar[0].buffer)
        .resize({ width: 320, height: 320, fit: 'cover', position: 'attention' })
        .toFormat('webp')
        .toFile(target);
      const url = `${baseUrl}/uploads/users/avatars/${filename}`;
      fields.push(`avatar_url = $${idx++}`); values.push(url);
    }

    if (req.body?.banner_url) {
      fields.push(`banner_url = $${idx++}`); values.push(req.body.banner_url);
    } else if (req.files?.banner?.[0]?.buffer) {
      const uploadDir = path.join(process.cwd(), 'uploads', 'users', 'banners');
      ensureDir(uploadDir);
      const filename = `${userId}-banner.webp`;
      const target = path.join(uploadDir, filename);
      await sharp(req.files.banner[0].buffer)
        .resize({ width: 1600, height: 520, fit: 'cover', position: 'attention' })
        .toFormat('webp')
        .toFile(target);
      const url = `${baseUrl}/uploads/users/banners/${filename}`;
      fields.push(`banner_url = $${idx++}`); values.push(url);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'Nenhum campo para atualizar.' });
    }

  const updateSql = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE user_id = $${idx} RETURNING user_id, first_name, last_name, email, role, cep, address, gender, nickname, bio, avatar_url, banner_url`;
    values.push(userId);
    const r = await pool.query(updateSql, values);
    res.json({ message: 'Perfil atualizado com sucesso.', user: r.rows[0] });
  } catch (e) {
    console.error('Erro ao atualizar perfil:', e);
    res.status(500).json({ message: 'Erro ao atualizar perfil.' });
  }
});

// Perfil enriquecido do usuário autenticado (dados + contagens + coleções)
app.get('/api/users/me/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.sub;

    // 1) Tenta buscar usuário com campos estendidos; se falhar por coluna ausente, faz fallback
    let userRow;
    try {
      const u = await pool.query(
        `SELECT user_id, first_name, last_name, email, role, nickname, bio, avatar_url, banner_url
         FROM users WHERE user_id = $1`, [userId]);
      userRow = u.rows[0];
    } catch (err) {
      if (err.code === '42703') { // undefined_column
        const u2 = await pool.query(
          `SELECT user_id, first_name, last_name, email, role
           FROM users WHERE user_id = $1`, [userId]);
        userRow = u2.rows[0];
      } else {
        throw err;
      }
    }
    if (!userRow) return res.status(404).json({ message: 'Usuário não encontrado.' });

    // 2) Contagens básicas (tabelas antigas ainda suportam estas colunas)
    const createdCount = await pool.query(`SELECT COUNT(*)::int AS c FROM nfts WHERE creator_id = $1`, [userId]);
    const ownedCount = await pool.query(`SELECT COUNT(*)::int AS c FROM nfts WHERE current_owner_id = $1`, [userId]);

    // 3) Coleções do usuário — tenta com cover_image_url; se falhar, usa fallback sem a coluna
    let collectionsRows = [];
    try {
      const r = await pool.query(
        `SELECT c.collection_id, c.name, c.cover_image_url AS banner_url, c.created_at, 
                COUNT(DISTINCT n.nft_id)::int AS nfts_count,
                COALESCE(SUM(fav_counts.total), 0)::int AS total_favorites
         FROM collections c
         LEFT JOIN nfts n ON n.collection_id = c.collection_id
         LEFT JOIN (
           SELECT nft_id, COUNT(*)::int AS total 
           FROM nft_favorites 
           GROUP BY nft_id
         ) fav_counts ON fav_counts.nft_id = n.nft_id
         WHERE c.creator_id = $1
         GROUP BY c.collection_id
         ORDER BY c.created_at DESC`, [userId]);
      collectionsRows = r.rows;
    } catch (err) {
      if (err.code === '42703' || err.code === '42P01') { // undefined_column ou relation does not exist
        const r2 = await pool.query(
          `SELECT c.collection_id, c.name, c.created_at, COUNT(n.nft_id)::int AS nfts_count
           FROM collections c
           LEFT JOIN nfts n ON n.collection_id = c.collection_id
           WHERE c.creator_id = $1
           GROUP BY c.collection_id
           ORDER BY c.created_at DESC`, [userId]);
        // Compat: banner_url ausente
        collectionsRows = r2.rows.map(row => ({ ...row, banner_url: null }));
      } else {
        throw err;
      }
    }

    return res.json({
      user: userRow,
      stats: {
        created: createdCount.rows[0]?.c ?? 0,
        owned: ownedCount.rows[0]?.c ?? 0,
        collections: collectionsRows.length,
        transactions: 0
      },
      collections: collectionsRows
    });
  } catch (e) {
    console.error('Erro no profile enriquecido:', e);
    res.status(500).json({ message: 'Erro ao carregar perfil.' });
  }
});

// Atividade do usuário autenticado (compras, vendas e criações)
app.get('/api/users/me/activity', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.sub;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const offset = (page - 1) * limit;

    // Consulta unificada: transações (compras/vendas) + criações
    // 1) Transações em que o usuário participou (compras/vendas)
    const txQuery = `
      SELECT 
        t.transaction_id,
        t.created_at,
        t.amount_eth,
        t.from_user_id,
        t.to_user_id,
        n.nft_id,
        n.name AS nft_name,
        n.image_url AS nft_image_url,
        c.name AS collection_name,
        fu.first_name AS from_first_name,
        fu.last_name AS from_last_name,
        fu.nickname AS from_nickname,
        fu.avatar_url AS from_avatar,
        tu.first_name AS to_first_name,
        tu.last_name AS to_last_name,
        tu.nickname AS to_nickname,
        tu.avatar_url AS to_avatar
      FROM transactions t
      LEFT JOIN nfts n ON n.nft_id = t.nft_id
      LEFT JOIN collections c ON n.collection_id = c.collection_id
      LEFT JOIN users fu ON fu.user_id = t.from_user_id
      LEFT JOIN users tu ON tu.user_id = t.to_user_id
      WHERE t.transaction_type = 'nft_sale'
        AND (t.from_user_id = $1::uuid OR t.to_user_id = $1::uuid)
      ORDER BY t.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const txResult = await pool.query(txQuery, [userId, limit, offset]);

    const txItems = txResult.rows.map(row => ({
      event_type: String(row.from_user_id) === String(userId) ? 'sold' : 'bought',
      created_at: row.created_at,
      transaction_id: row.transaction_id,
      amount_eth: row.amount_eth !== null ? parseFloat(row.amount_eth) : null,
      nft: row.nft_id ? {
        nft_id: row.nft_id,
        name: row.nft_name,
        image_url: row.nft_image_url,
        collection_name: row.collection_name || null
      } : null,
      from_user: row.from_user_id ? {
        user_id: row.from_user_id,
        name: row.from_nickname || `${row.from_first_name || ''} ${row.from_last_name || ''}`.trim(),
        avatar_url: row.from_avatar || null
      } : null,
      to_user: row.to_user_id ? {
        user_id: row.to_user_id,
        name: row.to_nickname || `${row.to_first_name || ''} ${row.to_last_name || ''}`.trim(),
        avatar_url: row.to_avatar || null
      } : null
    }));

    // 2) Criações do usuário (sem paginação aqui; paginaremos após merge)
    const createdQuery = `
      SELECT n.nft_id, n.name AS nft_name, n.image_url AS nft_image_url, n.created_at,
             c.name AS collection_name
      FROM nfts n
      LEFT JOIN collections c ON n.collection_id = c.collection_id
      WHERE n.creator_id = $1::uuid
      ORDER BY n.created_at DESC
      LIMIT 200
    `;
    const createdRes = await pool.query(createdQuery, [userId]);
    const createdItems = createdRes.rows.map(row => ({
      event_type: 'created',
      created_at: row.created_at,
      transaction_id: null,
      amount_eth: null,
      nft: {
        nft_id: row.nft_id,
        name: row.nft_name,
        image_url: row.nft_image_url,
        collection_name: row.collection_name || null
      },
      from_user: null,
      to_user: null
    }));

    // 3) Merge, ordenar e paginar
    const merged = [...txItems, ...createdItems]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const activity = merged.slice(offset, offset + limit);

    res.json({ success: true, activity, pagination: { page, limit } });
  } catch (e) {
    console.error('Erro ao carregar atividade do usuário:', e?.message || e);
    res.status(500).json({ success: false, message: 'Erro ao carregar atividade.' });
  }
});

// Perfil público por ID (somente campos não sensíveis)
app.get('/api/users/:id/public-profile', async (req, res) => {
  try {
    const targetId = req.params.id;
    if (!targetId) return res.status(400).json({ message: 'ID do usuário é obrigatório.' });

    // Busca dados públicos do usuário
    let userRow;
    try {
      const u = await pool.query(
        `SELECT user_id, first_name, last_name, email, nickname, bio, avatar_url, banner_url
         FROM users WHERE user_id = $1`, [targetId]);
      userRow = u.rows[0];
    } catch (err) {
      if (err.code === '42703') {
        const u2 = await pool.query(
          `SELECT user_id, first_name, last_name, email
           FROM users WHERE user_id = $1`, [targetId]);
        userRow = u2.rows[0];
      } else {
        throw err;
      }
    }
    if (!userRow) return res.status(404).json({ message: 'Usuário não encontrado.' });

    // Contagens básicas
    const createdCount = await pool.query(`SELECT COUNT(*)::int AS c FROM nfts WHERE creator_id = $1`, [targetId]);
    const ownedCount = await pool.query(`SELECT COUNT(*)::int AS c FROM nfts WHERE current_owner_id = $1`, [targetId]);

    // Coleções do usuário (público)
    let collectionsRows = [];
    try {
      const r = await pool.query(
        `SELECT c.collection_id, c.name, c.cover_image_url AS banner_url, c.created_at, 
                COUNT(DISTINCT n.nft_id)::int AS nfts_count,
                COALESCE(SUM(fav_counts.total), 0)::int AS total_favorites
         FROM collections c
         LEFT JOIN nfts n ON n.collection_id = c.collection_id
         LEFT JOIN (
           SELECT nft_id, COUNT(*)::int AS total 
           FROM nft_favorites 
           GROUP BY nft_id
         ) fav_counts ON fav_counts.nft_id = n.nft_id
         WHERE c.creator_id = $1
         GROUP BY c.collection_id
         ORDER BY c.created_at DESC`, [targetId]);
      collectionsRows = r.rows;
    } catch (err) {
      if (err.code === '42703' || err.code === '42P01') {
        const r2 = await pool.query(
          `SELECT c.collection_id, c.name, c.created_at, COUNT(n.nft_id)::int AS nfts_count
           FROM collections c
           LEFT JOIN nfts n ON n.collection_id = c.collection_id
           WHERE c.creator_id = $1
           GROUP BY c.collection_id
           ORDER BY c.created_at DESC`, [targetId]);
        collectionsRows = r2.rows.map(row => ({ ...row, banner_url: null }));
      } else {
        throw err;
      }
    }

    // NFTs criados
    const createdNfts = await pool.query(
      `SELECT n.nft_id, n.token_id, n.name, n.description, n.image_url, n.prompt, n.status, n.created_at,
              COUNT(f.favorite_id)::int as favorites_count
       FROM nfts n
       LEFT JOIN nft_favorites f ON n.nft_id = f.nft_id
       WHERE n.creator_id = $1
       GROUP BY n.nft_id
       ORDER BY n.created_at DESC
       LIMIT 20`, [targetId]);

    // NFTs possuídos
    const ownedNfts = await pool.query(
      `SELECT n.nft_id, n.token_id, n.name, n.description, n.image_url, n.prompt, n.status, n.created_at,
              COUNT(f.favorite_id)::int as favorites_count
       FROM nfts n
       LEFT JOIN nft_favorites f ON n.nft_id = f.nft_id
       WHERE n.current_owner_id = $1
       GROUP BY n.nft_id
       ORDER BY n.created_at DESC
       LIMIT 20`, [targetId]);

    return res.json({
      user: userRow,
      stats: {
        created: createdCount.rows[0]?.c ?? 0,
        owned: ownedCount.rows[0]?.c ?? 0,
        collections: collectionsRows.length
      },
      collections: collectionsRows,
      created: createdNfts.rows,
      owned: ownedNfts.rows
    });
  } catch (e) {
    console.error('Erro no perfil público:', e);
    res.status(500).json({ message: 'Erro ao carregar perfil público.' });
  }
});

// NFTs do usuário autenticado (criadas/possuídas)
app.get('/api/users/me/nfts', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.sub;
    const type = (req.query.type || '').toLowerCase();
    let created = [], owned = [];
    if (!type || type === 'created') {
      const r1 = await pool.query(
        `SELECT nft_id, token_id, name, description, image_url, prompt, status, created_at
         FROM nfts WHERE creator_id = $1 ORDER BY created_at DESC`, [userId]);
      created = r1.rows;
    }
    if (!type || type === 'owned') {
      const r2 = await pool.query(
        `SELECT nft_id, token_id, name, description, image_url, prompt, status, created_at
         FROM nfts WHERE current_owner_id = $1 ORDER BY created_at DESC`, [userId]);
      owned = r2.rows;
    }
    res.json({ created, owned });
  } catch (e) {
    console.error('Erro ao listar NFTs do usuário:', e);
    res.status(500).json({ message: 'Erro ao listar NFTs.' });
  }
});

// Galeria do usuário (apenas NFTs que possui atualmente)
app.get('/api/users/me/gallery', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.sub;
    // Apenas NFTs que o usuário possui atualmente (current_owner_id)
    const r = await pool.query(
      `SELECT nft_id, token_id, name, description, image_url, prompt, style, status, created_at, creator_id, current_owner_id, collection_id
       FROM nfts 
       WHERE current_owner_id = $1 
       ORDER BY created_at DESC`, [userId]);
    res.json({ nfts: r.rows, total: r.rows.length });
  } catch (e) {
    console.error('Erro ao listar galeria:', e);
    res.status(500).json({ message: 'Erro ao listar galeria.' });
  }
});

// Middleware: requer admin
async function requireAdmin(req, res, next) {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: 'Não autenticado.' });
    // bootstrap: se não houver nenhum admin no sistema, liberar acesso
    const admins = await pool.query(`SELECT COUNT(*)::int AS c FROM users WHERE role = 'admin'`);
    if ((admins.rows?.[0]?.c || 0) === 0) {
      return next();
    }
    const r = await pool.query('SELECT role FROM users WHERE user_id = $1', [userId]);
    const role = r.rows?.[0]?.role || 'user';
    if (role !== 'admin') return res.status(403).json({ message: 'Acesso restrito a administradores.' });
    next();
  } catch (e) {
    return res.status(500).json({ message: 'Erro ao verificar permissões.' });
  }
}

// --- ENDPOINTS ADMIN ---
// Listar usuários
app.get('/api/admin/users', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT user_id, first_name, last_name, email, role, created_at
      FROM users
      ORDER BY created_at DESC
    `);
    res.json({ users: r.rows });
  } catch (e) {
    console.error('Erro ao listar usuários:', e);
    res.status(500).json({ message: 'Erro ao listar usuários.' });
  }
});

// Alterar role de um usuário
app.patch('/api/admin/users/:id/role', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const targetId = req.params.id;
    const { role } = req.body || {};
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role inválida. Use "user" ou "admin".' });
    }
    // opcional: impedir auto-revogação
    // if (req.user.sub === targetId) return res.status(400).json({ message: 'Não é permitido alterar sua própria role.' });
    const r = await pool.query('UPDATE users SET role = $1 WHERE user_id = $2 RETURNING user_id, role', [role, targetId]);
    if (r.rowCount === 0) return res.status(404).json({ message: 'Usuário não encontrado.' });
    res.json({ message: 'Role atualizada com sucesso.', user: r.rows[0] });
  } catch (e) {
    console.error('Erro ao atualizar role:', e);
    res.status(500).json({ message: 'Erro ao atualizar role.' });
  }
});

// --- ADMIN: Definir coleções em destaque (carrossel de até 4) ---
app.post('/api/admin/collections/featured-set', authMiddleware, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const { collectionIds } = req.body || {};
    if (!Array.isArray(collectionIds)) {
      return res.status(400).json({ message: 'collectionIds deve ser um array.' });
    }
    const ids = collectionIds.filter(id => typeof id === 'string').slice(0, 4);

    await client.query('BEGIN');
    // Zera destaques atuais
    await client.query(`UPDATE collections SET is_featured = FALSE, featured_order = NULL WHERE is_featured = TRUE`);

    // Define novos destaques preservando a ordem informada
    for (let i = 0; i < ids.length; i++) {
      await client.query(
        `UPDATE collections SET is_featured = TRUE, featured_order = $1 WHERE collection_id = $2`,
        [i + 1, ids[i]]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Coleções em destaque atualizadas.', featured: ids });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Erro ao definir destaques:', e);
    res.status(500).json({ message: 'Erro ao definir coleções em destaque.' });
  } finally {
    client.release();
  }
});

// Inicia o servidor
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor backend rodando na porta ${port}`);
  console.log(`Acesse: http://localhost:${port}/api/test`);
});

server.on('error', (err) => {
  console.error('Erro ao iniciar servidor:', err);
  process.exit(1);
});