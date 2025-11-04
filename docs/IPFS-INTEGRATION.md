# 🌐 Integração IPFS com Pinata - Documentação

## 📋 Visão Geral

O sistema Atrivium agora suporta armazenamento descentralizado de imagens NFT usando **IPFS (InterPlanetary File System)** através do serviço **Pinata**.

### Benefícios do IPFS

- ✅ **Descentralização**: Imagens não dependem de um servidor central
- ✅ **Imutabilidade**: Conteúdo é identificado por hash criptográfico
- ✅ **Disponibilidade**: Arquivos replicados em múltiplos nós
- ✅ **Preparação para Blockchain**: Compatível com padrões Web3
- ✅ **Economia**: Sem custos de armazenamento em servidor próprio

## 🔧 Configuração

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis no arquivo `.env`:

```env
# Pinata IPFS - Armazenamento Descentralizado
PINATA_API_KEY=sua_pinata_api_key_aqui
PINATA_SECRET_API_KEY=sua_pinata_secret_key_aqui
PINATA_JWT=                         # Opcional
```

### 2. Obter Credenciais Pinata

1. Acesse [https://pinata.cloud](https://pinata.cloud)
2. Crie uma conta gratuita (1GB grátis)
3. Acesse **API Keys** no painel
4. Clique em **New Key**
5. Dê permissões de `pinFileToIPFS` e `pinJSONToIPFS`
6. Copie `API Key` e `API Secret`

## 📁 Estrutura de Arquivos

```
BackEnd/
├── src/
│   ├── services/
│   │   └── ipfs.service.js       # Serviço de integração com Pinata
│   ├── routes/
│   │   └── ipfs.routes.js        # Rotas de teste e gerenciamento IPFS
│   └── controllers/
│       └── nft.controller.js     # Atualizado para usar IPFS
└── server.js                      # Rotas IPFS registradas
```

## 🚀 Funcionalidades

### Serviço IPFS (`ipfs.service.js`)

#### Métodos Disponíveis

| Método | Descrição |
|--------|-----------|
| `isConfigured()` | Verifica se Pinata está configurado |
| `testAuthentication()` | Testa conexão com Pinata |
| `uploadFile(filePath, metadata)` | Faz upload de arquivo local |
| `uploadBuffer(buffer, fileName, metadata)` | Upload de buffer em memória |
| `unpinFile(ipfsHash)` | Remove arquivo do IPFS |
| `listPinnedFiles(limit)` | Lista arquivos fixados |
| `getPublicUrl(ipfsHash)` | Gera URL pública do arquivo |

#### Exemplo de Uso

```javascript
const ipfsService = require('./services/ipfs.service');

// Upload de arquivo
const result = await ipfsService.uploadFile('./image.png', {
  name: 'Meu NFT',
  description: 'Uma obra de arte única',
  creator: 'artist@example.com'
});

console.log(result.ipfsHash);  // QmXxxx...
console.log(result.ipfsUrl);   // https://gateway.pinata.cloud/ipfs/QmXxxx...
```

### Rotas API

#### 1. Testar Conexão
```
GET /api/ipfs/test
```

**Resposta:**
```json
{
  "success": true,
  "message": "Conexão com Pinata IPFS está funcionando!",
  "data": {
    "message": "Congratulations! You are communicating with the Pinata API!"
  }
}
```

#### 2. Listar Arquivos Fixados
```
GET /api/ipfs/list?limit=10
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "count": 5,
    "rows": [
      {
        "ipfs_pin_hash": "QmXxxx...",
        "size": 123456,
        "date_pinned": "2025-10-31T10:00:00.000Z",
        "metadata": {
          "name": "NFT Image"
        }
      }
    ]
  }
}
```

#### 3. Obter URL Pública
```
GET /api/ipfs/url/:hash
```

**Exemplo:**
```
GET /api/ipfs/url/QmXxxx...
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "ipfsHash": "QmXxxx...",
    "publicUrl": "https://gateway.pinata.cloud/ipfs/QmXxxx..."
  }
}
```

## 🎨 Criação de NFT com IPFS

Quando um NFT é criado, o sistema:

1. **Gera a imagem** com IA (Leonardo ou HuggingFace)
2. **Salva temporariamente** no servidor local
3. **Faz upload para IPFS** via Pinata
4. **Armazena IPFS hash** no banco de dados
5. **Retorna URL pública** do IPFS

### Fluxo de Upload

```
┌─────────────┐      ┌──────────────┐      ┌──────────┐
│   Cliente   │─────>│   Backend    │─────>│  Pinata  │
└─────────────┘      └──────────────┘      └──────────┘
                            │                     │
                            │   Upload Image      │
                            │────────────────────>│
                            │                     │
                            │   IPFS Hash +       │
                            │   Public URL        │
                            │<────────────────────│
                            │                     │
                     ┌──────▼──────┐              │
                     │  PostgreSQL │              │
                     │  (ipfs_hash)│              │
                     └─────────────┘              │
```

### Exemplo de Resposta

```json
{
  "success": true,
  "data": {
    "nft": {
      "id": 1,
      "tokenId": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Cosmic Dragon",
      "description": "A majestic dragon in space",
      "imageUrl": "https://gateway.pinata.cloud/ipfs/QmXxxx...",
      "ipfsHash": "QmXxxx...",
      "imageHash": "a7f3c9...",
      "status": "created",
      "network": "ipfs",
      "createdAt": "2025-10-31T10:00:00.000Z"
    },
    "certificate": { ... },
    "metadata": { ... }
  },
  "message": "NFT criado e armazenado no IPFS com sucesso!"
}
```

## 💾 Banco de Dados

### Migração Aplicada

O arquivo `06-ipfs-support.sql` adiciona:

- Coluna `ipfs_hash` na tabela `nfts`
- Índice para busca por IPFS hash
- View `v_nfts_with_ipfs` com URLs públicas
- Suporte para `network = 'ipfs'`

### Consultar NFTs com IPFS

```sql
-- Ver todos os NFTs com informação IPFS
SELECT * FROM v_nfts_with_ipfs;

-- NFTs armazenados no IPFS
SELECT * FROM nfts WHERE ipfs_hash IS NOT NULL;

-- NFTs apenas locais
SELECT * FROM nfts WHERE ipfs_hash IS NULL;
```

## 🔄 Fallback Automático

Se o Pinata não estiver configurado ou falhar:

1. Sistema detecta a falha
2. Salva imagem **localmente** em `/uploads`
3. Define `network = 'off-chain'`
4. Continua funcionando normalmente

**Log de exemplo:**
```
⚠️  Erro ao fazer upload para IPFS: Authentication failed
💾 Usando armazenamento local como fallback...
```

## 🔐 Segurança

### Boas Práticas

1. **Nunca commitar** API keys no Git
2. Usar **variáveis de ambiente** diferentes por ambiente
3. Rotacionar chaves regularmente
4. Configurar **limites de upload** no Pinata
5. Monitorar uso e custos

### Limites do Plano Gratuito

- 1 GB de armazenamento
- 100 requests/mês para API
- Gateway público ilimitado

## 📊 Monitoramento

### Verificar Status

```bash
curl http://localhost:3001/api/ipfs/test
```

### Logs do Servidor

```
✅ Arquivo enviado para IPFS: QmXxxx...
🌐 URL pública: https://gateway.pinata.cloud/ipfs/QmXxxx...
```

## 🐛 Troubleshooting

### Erro: "Pinata não está configurado"

**Solução:** Verifique as variáveis `PINATA_API_KEY` e `PINATA_SECRET_API_KEY` no `.env`

### Erro: "Authentication failed"

**Solução:** Verifique se as credenciais estão corretas no painel do Pinata

### Erro: "Rate limit exceeded"

**Solução:** Aguarde ou faça upgrade do plano no Pinata

### Imagens não carregam

**Solução:** Use a URL completa do IPFS Gateway:
```
https://gateway.pinata.cloud/ipfs/QmXxxx...
```

## 🚀 Próximos Passos

- [ ] Implementar cache de URLs IPFS
- [ ] Adicionar suporte para metadata JSON no IPFS
- [ ] Integrar com outras gateways IPFS (Infura, Cloudflare)
- [ ] Implementar upload direto do frontend
- [ ] Adicionar progresso de upload
- [ ] Implementar garbage collection para arquivos não usados

## 📚 Referências

- [Pinata Docs](https://docs.pinata.cloud/)
- [IPFS Docs](https://docs.ipfs.tech/)
- [ERC-721 Standard](https://eips.ethereum.org/EIPS/eip-721)

---

## 🔁 Novidades (01/11/2025)

### Novos Endpoints de Operação

- POST `/api/ipfs/pin-from-url`
  - body: `{ url: string, name?: string, description?: string, useLeonardoAuth?: boolean }`
  - Baixa qualquer URL (com headers adequados para Leonardo quando `useLeonardoAuth=true`) e envia ao Pinata.

- POST `/api/ipfs/backfill-nfts`
  - body: `{ limit?: number, dryRun?: boolean, onlyLocal?: boolean }`
  - Pina em lote os NFTs sem `ipfs_hash` (tanto imagens locais `/uploads` quanto remotas). Atualiza `ipfs_hash`, `image_url` (gateway) e `network='ipfs'`.

- POST `/api/ipfs/pin-nft/:id`
  - `:id` pode ser `nft_id` ou `token_id`. body: `{ force?: boolean }`
  - Útil para pin individual de um NFT específico.

### Melhorias no Fluxo Leonardo → IPFS

- Download da imagem do Leonardo com headers: `Authorization: Bearer <LEONARDO_API_KEY>`, `Referer`, `User-Agent` e `Accept`.
- Detecção do `content-type` para definir extensão correta do arquivo (png/jpg/webp).
- Upload com duas tentativas: `uploadBuffer` e fallback via arquivo temporário com `uploadFile`.
- Resposta ao cliente inclui `ipfsHash` quando sucesso.

### Frontend: Fallback de Gateways

- A Gallery e o Discover utilizam componentes de imagem com fallback de gateways:
  1. `image_url` armazenada no NFT
  2. `https://gateway.pinata.cloud/ipfs/<CID>`
  3. `https://ipfs.io/ipfs/<CID>`
  4. `https://cloudflare-ipfs.com/ipfs/<CID>`
  5. (opcional) `https://<VITE_PINATA_SUBDOMAIN>/ipfs/<CID>`

- Para habilitar seu subdomínio do Pinata no front:
  ```env
  VITE_PINATA_SUBDOMAIN=sapphire-added-junglefowl-919.mypinata.cloud
  ```

### Leonardo List: Campos extras

- A rota de listagem agora inclui `ipfs_hash` e `network` para facilitar diagnósticos no cliente.

---

**Última atualização:** 01 de Novembro de 2025
