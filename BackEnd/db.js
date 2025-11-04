// Configuração da conexão com o banco de dados PostgreSQL
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin123',
  database: process.env.DB_DATABASE || 'atrivium-database',
});

// Teste de conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao pool do PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro no pool do PostgreSQL:', err);
});

module.exports = pool;
