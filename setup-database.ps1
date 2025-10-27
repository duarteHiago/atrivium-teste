# Script de Setup do Banco de Dados
# Execute este arquivo após iniciar o container Docker

Write-Host "🚀 Setup do Banco de Dados - Atrivium NFT" -ForegroundColor Green
Write-Host ""

# Verificar se o Docker está rodando
Write-Host "📦 Verificando Docker..." -ForegroundColor Yellow
docker ps | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker não está rodando. Inicie o Docker Desktop primeiro!" -ForegroundColor Red
    exit 1
}

# Verificar se o container PostgreSQL está rodando
Write-Host "🔍 Procurando container PostgreSQL..." -ForegroundColor Yellow
$container = docker ps --filter "ancestor=postgres:16" --format "{{.ID}}" | Select-Object -First 1

if (-not $container) {
    Write-Host "❌ Container PostgreSQL não encontrado!" -ForegroundColor Red
    Write-Host "Execute primeiro: cd Docker && docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Container encontrado: $container" -ForegroundColor Green
Write-Host ""

# Executar script user.sql
Write-Host "📊 Criando tabela 'users'..." -ForegroundColor Yellow
Get-Content ".\DataBase\SQL\user.sql" | docker exec -i $container psql -U admin -d atrivium-database
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Tabela 'users' criada com sucesso!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Tabela 'users' pode já existir (isso é normal)" -ForegroundColor Yellow
}

Write-Host ""

# Executar script nfts.sql
Write-Host "📊 Criando tabela 'nfts'..." -ForegroundColor Yellow
Get-Content ".\DataBase\SQL\nfts.sql" | docker exec -i $container psql -U admin -d atrivium-database
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Tabela 'nfts' criada com sucesso!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Tabela 'nfts' pode já existir (isso é normal)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Setup concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Configure o arquivo BackEnd/.env com suas variáveis"
Write-Host "2. Adicione sua HUGGINGFACE_API_KEY"
Write-Host "3. Execute: cd BackEnd && npm run dev"
Write-Host "4. Execute: cd FrontEnd && npm run dev"
Write-Host ""
Write-Host "💡 Para conectar ao banco:" -ForegroundColor Cyan
Write-Host "   Host: localhost"
Write-Host "   Port: 5433"
Write-Host "   Database: atrivium-database"
Write-Host "   User: admin"
Write-Host "   Password: devpassword"
