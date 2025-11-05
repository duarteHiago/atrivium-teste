# Script para aplicar atualizacoes do banco de dados
# Executa os scripts SQL na ordem correta

$psqlPath = "C:\Program Files\PostgreSQL\17\bin\psql.exe"
$dbHost = "localhost"
$dbPort = "5432"
$dbUser = "postgres"
$dbName = "postgres"

Write-Host "Aplicando atualizacoes do banco de dados..." -ForegroundColor Cyan
Write-Host ""

# Aplicar scripts SQL em ordem (incluindo extensoes)
$scripts = @(
    "00-extensions.sql",
    "DataBase\SQL\01-user.sql",
    "DataBase\SQL\02-nfts.sql",
    "DataBase\SQL\03-collections.sql",
    "DataBase\SQL\04-featured-collections.sql"
)

foreach ($script in $scripts) {
    $scriptName = Split-Path $script -Leaf
    Write-Host "Aplicando $scriptName..." -ForegroundColor Yellow
    
    & $psqlPath -h $dbHost -p $dbPort -U $dbUser -d $dbName -f $script
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "$scriptName aplicado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "$scriptName pode ja estar aplicado (isso e normal)" -ForegroundColor Yellow
    }
    Write-Host ""
}

Write-Host "Atualizacoes do banco de dados concluidas!" -ForegroundColor Green
Write-Host ""
Write-Host "Verificar tabelas criadas:" -ForegroundColor Cyan
& $psqlPath -h $dbHost -p $dbPort -U $dbUser -d $dbName -c "\dt"
