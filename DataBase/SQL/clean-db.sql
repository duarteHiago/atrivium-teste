-- Script para limpar todos os dados do banco atrivium-database
-- Mantém a estrutura das tabelas (schema)

\echo 'Limpando todas as tabelas...'
\echo ''

-- Limpar em ordem para respeitar foreign keys
TRUNCATE TABLE transactions CASCADE;
TRUNCATE TABLE wallets CASCADE;
TRUNCATE TABLE nft_favorites CASCADE;
TRUNCATE TABLE nft_transfers CASCADE;
TRUNCATE TABLE nfts CASCADE;
TRUNCATE TABLE collections CASCADE;
TRUNCATE TABLE users CASCADE;

\echo ''
\echo 'Dados limpos com sucesso!'
\echo ''

-- Verificar contagem
SELECT 'users' as tabela, COUNT(*) as registros FROM users
UNION ALL SELECT 'nfts', COUNT(*) FROM nfts
UNION ALL SELECT 'collections', COUNT(*) FROM collections
UNION ALL SELECT 'wallets', COUNT(*) FROM wallets
UNION ALL SELECT 'nft_favorites', COUNT(*) FROM nft_favorites
UNION ALL SELECT 'nft_transfers', COUNT(*) FROM nft_transfers
UNION ALL SELECT 'transactions', COUNT(*) FROM transactions;
