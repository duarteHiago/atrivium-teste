-- Aplicar todos os scripts SQL no banco atrivium-database

-- 06: Add user role
\echo '=== [1/4] Aplicando 06-add-user-role.sql ==='
\i 'C:/dev/atrivium-teste/DataBase/SQL/06-add-user-role.sql'

-- 07a: Add NFT price
\echo '=== [2/4] Aplicando 07-add-nft-price.sql ==='
\i 'C:/dev/atrivium-teste/DataBase/SQL/07-add-nft-price.sql'

-- 07b: NFT favorites
\echo '=== [3/4] Aplicando 07-nft-favorites.sql ==='
\i 'C:/dev/atrivium-teste/DataBase/SQL/07-nft-favorites.sql'

-- 08: Wallets system
\echo '=== [4/4] Aplicando 08-create-wallets-system.sql ==='
\i 'C:/dev/atrivium-teste/DataBase/SQL/08-create-wallets-system.sql'

\echo ''
\echo '=== Scripts aplicados com sucesso! ==='
\echo ''
\dt
