# 🎨 Integração Pinata IPFS - Atrivium

## ✅ Implementação Concluída

A integração com Pinata (IPFS) foi implementada com sucesso! Agora todas as imagens de NFTs gerados pelo Leonardo AI são automaticamente enviadas para IPFS.

## 📦 Arquivos Criados/Modificados

### Backend
- ✅ `src/services/ipfs.service.js` - Serviço de upload/download IPFS
- ✅ `src/routes/ipfs.routes.js` - Endpoints REST para IPFS
- ✅ `src/routes/leonardo.routes.js` - Integrado upload automático para IPFS
- ✅ `server.js` - Registrou rotas `/api/ipfs` e migrations de schema

### Frontend
- ✅ `src/Components/FallbackImage/FallbackImage.jsx` - Componente com fallback de múltiplos gateways IPFS

### Database
- ✅ Colunas `ipfs_hash` e `network` adicionadas automaticamente na tabela `nfts` via migration

## 🔧 Configuração

### 1. Obter Credenciais Pinata

Acesse: https://app.pinata.cloud/developers/api-keys

Crie uma API Key com permissões:
- ✅ `pinFileToIPFS`
- ✅ `pinByHash`
- ✅ `unpin`
- ✅ `pinList`

### 2. Configurar Variáveis de Ambiente

Edite `BackEnd/.env`:

```bash
# Pinata (IPFS)
PINATA_API_KEY=sua-pinata-api-key-aqui
PINATA_SECRET_API_KEY=sua-pinata-secret-api-key-aqui

# Opcional: Gateway customizado
# PINATA_GATEWAY=gateway.pinata.cloud
# PINATA_SUBDOMAIN=seu-subdominio.mypinata.cloud
```

### 3. Reiniciar Backend

```powershell
cd BackEnd
npm run dev
```

As migrations serão aplicadas automaticamente ao iniciar.

## 🚀 Como Usar

### Upload Automático (Leonardo → IPFS)

Quando você gerar um NFT via `/api/leonardo/generate-and-save`, o sistema:

1. ✅ Gera a imagem no Leonardo AI
2. ✅ Baixa a imagem
3. ✅ Faz upload para Pinata IPFS
4. ✅ Salva `ipfs_hash` no banco
5. ✅ Define `network='ipfs'`
6. ✅ Atualiza `image_url` para gateway Pinata

**Exemplo de resposta:**
```json
{
  "success": true,
  "nft": {
    "id": "uuid",
    "imageUrl": "https://gateway.pinata.cloud/ipfs/QmXxx...",
    "ipfsHash": "QmXxx...",
    "network": "ipfs"
  }
}
```

### Endpoints IPFS Disponíveis

#### Testar Conexão
```http
GET /api/ipfs/test
```

#### Listar Pins
```http
GET /api/ipfs/list?pageLimit=10
```

#### Obter URLs de Gateway
```http
GET /api/ipfs/url/:hash
```

Resposta:
```json
{
  "primaryUrl": "https://gateway.pinata.cloud/ipfs/QmXxx",
  "fallbackUrls": [
    "https://gateway.pinata.cloud/ipfs/QmXxx",
    "https://ipfs.io/ipfs/QmXxx",
    "https://cloudflare-ipfs.com/ipfs/QmXxx"
  ]
}
```

#### Pin de URL Externa
```http
POST /api/ipfs/pin-from-url
Content-Type: application/json

{
  "url": "https://exemplo.com/imagem.png",
  "name": "minha-imagem",
  "useLeonardoAuth": false
}
```

#### Pin Individual de NFT
```http
POST /api/ipfs/pin-nft/:nftId
Content-Type: application/json

{
  "force": false
}
```

#### Backfill em Lote (NFTs Antigos)
```http
POST /api/ipfs/backfill-nfts
Content-Type: application/json

{
  "limit": 50,
  "dryRun": false,
  "onlyLocal": false
}
```

Use para enviar NFTs antigos (sem `ipfs_hash`) para IPFS.

#### Remover Pin
```http
DELETE /api/ipfs/unpin/:hash
```

## 🎨 Frontend - FallbackImage

Use o componente `FallbackImage` para exibir imagens com fallback automático de gateways:

```jsx
import FallbackImage from '../Components/FallbackImage/FallbackImage';

<FallbackImage
  src={nft.image_url}
  ipfsHash={nft.ipfs_hash}
  alt={nft.name}
  objectFit="cover"
/>
```

**Funcionamento:**
1. Tenta carregar de `src` (URL original)
2. Se falhar, tenta `gateway.pinata.cloud`
3. Se falhar, tenta `ipfs.io`
4. Se falhar, tenta `cloudflare-ipfs.com`
5. Se falhar, tenta `dweb.link`
6. Se todos falharem, exibe mensagem de erro

### Configurar Gateway Customizado (Opcional)

Edite `FrontEnd/.env`:

```bash
VITE_PINATA_SUBDOMAIN=seu-subdominio.mypinata.cloud
```

## 📊 Schema do Banco

```sql
-- Colunas adicionadas automaticamente via migration
ALTER TABLE nfts ADD COLUMN IF NOT EXISTS ipfs_hash VARCHAR(100);
ALTER TABLE nfts ADD COLUMN IF NOT EXISTS network VARCHAR(20) DEFAULT 'off-chain';
CREATE INDEX IF NOT EXISTS idx_nfts_ipfs ON nfts(ipfs_hash);
```

**Valores de `network`:**
- `off-chain` - Imagem hospedada externamente (Leonardo, servidor local)
- `ipfs` - Imagem armazenada em IPFS via Pinata

## 🔍 Verificação

### 1. Testar Conexão com Pinata

```bash
curl http://localhost:3001/api/ipfs/test
```

Resposta esperada:
```json
{
  "success": true,
  "message": "Pinata conectado com sucesso"
}
```

### 2. Gerar NFT de Teste

```bash
curl -X POST http://localhost:3001/api/leonardo/generate-and-save \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "prompt": "cyberpunk cat",
    "name": "Teste IPFS"
  }'
```

Verifique na resposta:
- ✅ `ipfsHash` presente
- ✅ `network: "ipfs"`
- ✅ `imageUrl` apontando para gateway Pinata

### 3. Listar Pins no Pinata

```bash
curl http://localhost:3001/api/ipfs/list
```

## 🚨 Troubleshooting

### Erro: "Pinata não configurado"

**Causa:** Variáveis de ambiente não definidas.

**Solução:**
1. Verifique se `PINATA_API_KEY` e `PINATA_SECRET_API_KEY` estão no `.env`
2. Reinicie o servidor backend

### Erro ao fazer upload

**Causa:** API Key sem permissões.

**Solução:**
1. Acesse Pinata Dashboard
2. Crie nova API Key com permissões de `pinFileToIPFS`
3. Atualize `.env`

### Imagens não carregam no frontend

**Causa:** Gateway IPFS lento ou indisponível.

**Solução:**
- O componente `FallbackImage` tentará automaticamente outros gateways
- Configure `VITE_PINATA_SUBDOMAIN` para gateway dedicado (mais rápido)

## 📈 Próximos Passos (Opcional)

1. **Metadata JSON no IPFS**
   - Atualmente só a imagem é enviada
   - Pode-se criar metadata JSON (ERC-721) e fazer pin também

2. **Subdomain Pinata Dedicado**
   - Mais rápido que gateways públicos
   - Configure em Pinata Dashboard → Dedicated Gateways

3. **Cleanup Automático**
   - Script para remover pins de NFTs deletados
   - Economizar espaço no plano Pinata

## 📚 Referências

- [Pinata Documentation](https://docs.pinata.cloud/)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [ERC-721 Metadata Standard](https://eips.ethereum.org/EIPS/eip-721)

---

**Status:** ✅ Produção pronta  
**Autor:** GitHub Copilot  
**Data:** 02/11/2025
