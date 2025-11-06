#!/bin/bash
# Script para parar e remover o ambiente de desenvolvimento do Atrivium

echo "🛑 Parando e removendo containers Atrivium (Dev)..."
echo ""

docker-compose -f Docker/docker-compose.yaml down

echo ""
echo "✅ Ambiente parado."