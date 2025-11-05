-- Script consolidado para aplicar todas as atualizações SQL do pull
-- Execute este arquivo dentro do psql: \i 'C:/dev/atrivium-teste/apply-new-db-scripts.sql'

-- 06: Adicionar role aos usuários
\echo '=== Aplicando 06-add-user-role.sql ==='
\i 'C:/dev/atrivium-teste/DataBase/SQL/06-add-user-role.sql'

-- 07a: Adicionar preço aos NFTs
\echo '=== Aplicando 07-add-nft-price.sql ==='
\i 'C:/dev/atrivium-teste/DataBase/SQL/07-add-nft-price.sql'

-- 07b: Sistema de favoritos
\echo '=== Aplicando 07-nft-favorites.sql ==='
\i 'C:/dev/atrivium-teste/DataBase/SQL/07-nft-favorites.sql'

-- 08: Sistema de carteiras (wallets)
\echo '=== Aplicando 08-create-wallets-system.sql ==='
\i 'C:/dev/atrivium-teste/DataBase/SQL/08-create-wallets-system.sql'

\echo ''
\echo '=== Atualizações concluídas! ==='
\echo ''
\echo 'Verificando tabelas criadas:'
\dt

\echo ''
\echo 'Verificando estrutura da tabela users (role adicionado):'
\d users

\echo ''
\echo 'Verificando estrutura da tabela nfts (price adicionado):'
\d nfts
