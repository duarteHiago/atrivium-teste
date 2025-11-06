@echo off
cd /d "C:\dev\atrivium-teste"
echo ========================================
echo Limpando dados do banco de dados
echo (mantendo estrutura das tabelas)
echo ========================================
echo.

set PGPASSWORD=Zqkwd10011$
set PSQL="C:\Program Files\PostgreSQL\17\bin\psql.exe"

echo Limpando dados...
%PSQL% -h localhost -p 5432 -U postgres -d postgres -c "TRUNCATE TABLE transactions CASCADE;"
%PSQL% -h localhost -p 5432 -U postgres -d postgres -c "TRUNCATE TABLE wallets CASCADE;"
%PSQL% -h localhost -p 5432 -U postgres -d postgres -c "TRUNCATE TABLE nft_favorites CASCADE;"
%PSQL% -h localhost -p 5432 -U postgres -d postgres -c "TRUNCATE TABLE nft_transfers CASCADE;"
%PSQL% -h localhost -p 5432 -U postgres -d postgres -c "TRUNCATE TABLE nfts CASCADE;"
%PSQL% -h localhost -p 5432 -U postgres -d postgres -c "TRUNCATE TABLE collections CASCADE;"
%PSQL% -h localhost -p 5432 -U postgres -d postgres -c "TRUNCATE TABLE users CASCADE;"

echo.
echo ========================================
echo Dados limpos com sucesso!
echo ========================================
echo.
echo Verificando tabelas vazias...
%PSQL% -h localhost -p 5432 -U postgres -d postgres -c "SELECT 'users' as tabela, COUNT(*) as registros FROM users UNION ALL SELECT 'nfts', COUNT(*) FROM nfts UNION ALL SELECT 'collections', COUNT(*) FROM collections UNION ALL SELECT 'wallets', COUNT(*) FROM wallets UNION ALL SELECT 'nft_favorites', COUNT(*) FROM nft_favorites UNION ALL SELECT 'transactions', COUNT(*) FROM transactions;"
echo.

pause
