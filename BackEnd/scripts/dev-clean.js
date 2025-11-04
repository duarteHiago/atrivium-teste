require('dotenv').config();
const { Pool } = require('pg');

async function main() {
  const mode = (process.argv[2] || 'soft').toLowerCase();
  const confirm = process.env.DEV_CLEAN_CONFIRM === 'YES';
  if (!confirm) {
    console.error('Proteção ativa: defina DEV_CLEAN_CONFIRM=YES para permitir limpeza.');
    process.exit(1);
  }

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  const client = await pool.connect();
  try {
    console.log(`Iniciando limpeza de banco (modo: ${mode})...`);
    await client.query('BEGIN');

    if (mode === 'soft') {
      // Mantém usuários; limpa vínculos e dados de coleções/NFTs
      await client.query('UPDATE nfts SET collection_id = NULL');
      await client.query('DELETE FROM nft_transfers');
      await client.query('DELETE FROM nfts');
      await client.query('DELETE FROM collections');
      // Opcional: limpar campos de perfil visuais (mantém role e nomes)
      await client.query('UPDATE users SET nickname = NULL, bio = NULL, avatar_url = NULL, banner_url = NULL');
    } else if (mode === 'hard') {
      // Limpa coleções/NFTs e reinicia sequências; mantém tabela users
      await client.query('TRUNCATE TABLE nft_transfers RESTART IDENTITY CASCADE');
      await client.query('TRUNCATE TABLE nfts RESTART IDENTITY CASCADE');
      await client.query('TRUNCATE TABLE collections RESTART IDENTITY CASCADE');
      await client.query('UPDATE users SET nickname = NULL, bio = NULL, avatar_url = NULL, banner_url = NULL');
    } else if (mode === 'full' || mode === 'users') {
      // Limpa tudo, incluindo usuários (ordem cuidadosa para respeitar FKs)
      await client.query('TRUNCATE TABLE nft_transfers RESTART IDENTITY CASCADE');
      await client.query('TRUNCATE TABLE nfts RESTART IDENTITY CASCADE');
      await client.query('TRUNCATE TABLE collections RESTART IDENTITY CASCADE');
      await client.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
    } else {
      throw new Error(`Modo inválido: ${mode}. Use soft, hard ou full.`);
    }

    await client.query('COMMIT');
    console.log('✅ Limpeza concluída com sucesso.');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Falha durante limpeza:', e.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
