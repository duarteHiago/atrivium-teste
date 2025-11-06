#!/bin/bash
# Script para parar e remover o ambiente de desenvolvimento do Atrivium

# Verificando se está na raiz do projeto
if [ ! -f "README.md" ] || [ ! -d "Docker" ]; then
    echo "❌ Erro: Este script deve ser executado da raiz do projeto."
    echo "   Uso correto: ./scripts/close.sh"
    exit 1
fi

echo "🛑 Parando e removendo containers Atrivium (Dev)..."
echo ""

docker-compose -f Docker/docker-compose.yaml down

echo ""
echo "✅ Ambiente parado."