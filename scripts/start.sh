#!/bin/bash
# Script para iniciar o ambiente de desenvolvimento completo do Atrivium

# --- 0. Verificando se está na raiz do projeto ---
if [ ! -f "README.md" ] || [ ! -d "Docker" ] || [ ! -d "BackEnd" ]; then
    echo "❌ Erro: Este script deve ser executado da raiz do projeto."
    echo "   Certifique-se de estar no diretório atrivium-teste/"
    echo "   Uso correto: ./scripts/start.sh"
    exit 1
fi

echo "🚀 Iniciando ambiente Atrivium (Dev)..."
echo ""

# --- 1. Verificando Docker ---
echo "📦 Verificando se o Docker está rodando..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Erro: Docker não está rodando."
    echo "   Por favor, inicie o Docker Desktop primeiro."
    exit 1
fi
echo "✅ Docker está rodando."
echo ""

# --- 2. Subindo os Containers ---
echo "🐳 Subindo os containers (Postgres, Backend, Frontend) com Docker Compose..."
# Usamos o -f para especificar o caminho do arquivo, caso o script seja chamado de outro lugar
docker-compose -f Docker/docker-compose.yaml up -d

if [ $? -ne 0 ]; then
    echo "❌ Falha ao iniciar os containers."
    echo "   Verifique os logs com: docker-compose -f Docker/docker-compose.yaml logs"
    exit 1
fi
echo "✅ Containers iniciados em background."
echo ""

# --- 3. Aguardando o Banco de Dados ---
# O docker-compose já tem um healthcheck, mas vamos verificar explicitamente
echo "⏳ Aguardando o PostgreSQL (atrivium-postgres) ficar saudável..."
echo "   (Isso pode levar alguns segundos na primeira vez...)"

# O container 'backend' já tem 'depends_on: service_healthy',
# mas o 'docker-compose up -d' retorna antes do backend estar pronto.
# Vamos esperar pelo 'postgres' diretamente.
while [ "$(docker inspect -f '{{.State.Health.Status}}' atrivium-postgres 2>/dev/null)" != "healthy" ]; do
    sleep 2
    echo -n "."
done

echo ""
echo "✅ Banco de dados PostgreSQL está saudável."
echo ""

# --- 4. Setup do Banco de Dados ---
# Esta é a lógica do antigo setup-database.ps1
# Rodamos isso toda vez para garantir que as tabelas existam (os scripts usam 'IF NOT EXISTS')
echo "📊 Executando setup das tabelas SQL..."

echo "   -> Criando tabela 'users'..."
cat DataBase/SQL/01-user.sql | docker exec -i atrivium-postgres psql -U admin -d atrivium-database

echo "   -> Criando tabelas 'nfts' e 'nft_transfers'..."
cat DataBase/SQL/02-nfts.sql | docker exec -i atrivium-postgres psql -U admin -d atrivium-database

echo "   -> Criando tabela 'collections' e atualizando 'nfts'..."
cat DataBase/SQL/03-collections.sql | docker exec -i atrivium-postgres psql -U admin -d atrivium-database

echo "✅ Setup do banco de dados concluído."
echo ""

# --- 5. Conclusão ---
echo "🎉 Ambiente pronto!"
echo ""
echo "Acesse:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3001"
echo ""
echo "💡 Para ver os logs de todos os serviços, execute em outro terminal:"
echo "   docker-compose -f Docker/docker-compose.yaml logs -f"
echo ""
echo "👉 Para parar tudo, execute: ./scripts/close.sh"