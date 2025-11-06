@echo off
cd /d "C:\dev\atrivium-teste"
echo ========================================
echo Aplicando scripts SQL no PostgreSQL
echo ========================================
echo.

set PGPASSWORD=Zqkwd10011$
set PSQL="C:\Program Files\PostgreSQL\17\bin\psql.exe"
set DB_NAME=atrivium-database

echo Conectando ao banco: %DB_NAME%
echo.

echo [1/4] Aplicando 06-add-user-role.sql...
%PSQL% -h localhost -p 5432 -U postgres -d %DB_NAME% -f "DataBase\SQL\06-add-user-role.sql"
if %ERRORLEVEL% NEQ 0 (
    echo ERRO ao aplicar script 06
    pause
    exit /b 1
)
echo OK!
echo.

echo [2/4] Aplicando 07-add-nft-price.sql...
%PSQL% -h localhost -p 5432 -U postgres -d %DB_NAME% -f "DataBase\SQL\07-add-nft-price.sql"
if %ERRORLEVEL% NEQ 0 (
    echo ERRO ao aplicar script 07-price
    pause
    exit /b 1
)
echo OK!
echo.

echo [3/4] Aplicando 07-nft-favorites.sql...
%PSQL% -h localhost -p 5432 -U postgres -d %DB_NAME% -f "DataBase\SQL\07-nft-favorites.sql"
if %ERRORLEVEL% NEQ 0 (
    echo ERRO ao aplicar script 07-favorites
    pause
    exit /b 1
)
echo OK!
echo.

echo [4/4] Aplicando 08-create-wallets-system.sql...
%PSQL% -h localhost -p 5432 -U postgres -d %DB_NAME% -f "DataBase\SQL\08-create-wallets-system.sql"
if %ERRORLEVEL% NEQ 0 (
    echo ERRO ao aplicar script 08
    pause
    exit /b 1
)
echo OK!
echo.

echo ========================================
echo Todos os scripts aplicados com sucesso!
echo ========================================
echo.
echo Verificando tabelas criadas...
%PSQL% -h localhost -p 5432 -U postgres -d %DB_NAME% -c "\dt"
echo.

pause
