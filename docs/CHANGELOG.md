# 📜 Changelog — Atrivium

Registro detalhado de mudanças aplicadas recentemente. Este arquivo complementa o README e serve como referência técnica (back-end, front-end e infraestrutura).

> Data de atualização: 01/11/2025

---

## 2025-10-29 → 2025-11-01 — Estabilização e IPFS

### Ambiente e Infra
- Padronização de `.env` por ambiente em `config/environments/`.
- `BackEnd/server.js`: correção do caminho do dotenv para carregar `.env.development` por padrão.
- Docker Compose: serviços `postgres`, `backend`, `frontend` (hot-reload) — sem alteração de APIs, mas verificados.

### Banco de Dados e Segurança
- `DataBase/SQL/04-encrypt-sensitive-data.sql`:
  - Ajuste da estrutura do trigger (posição do `DECLARE`).
  - Remoção de referência a campo inexistente (telefone).
  - Chave de fallback via `current_setting`.
  - Remoção de `NOT NULL` em campos plaintext (cpf/address) para evitar bloqueios no cadastro.

### IPFS (Pinata)
- Serviço `BackEnd/src/services/ipfs.service.js`:
  - `uploadFile`, `uploadBuffer`, `unpinFile`, `listPinnedFiles`, `testAuthentication`, `getPublicUrl`.
  - `uploadBuffer` agora envia `contentType` no form-data (compatibilidade com certos uploads).

- Rotas `BackEnd/src/routes/ipfs.routes.js`:
  - GET `/api/ipfs/test` — autenticação Pinata.
  - GET `/api/ipfs/list` — listar pins.
  - GET `/api/ipfs/url/:hash` — URL pública.
  - NOVO: POST `/api/ipfs/pin-from-url` — pin direto a partir de uma URL (headers de Leonardo opcionais).
  - NOVO: POST `/api/ipfs/backfill-nfts` — pin em lote de NFTs sem `ipfs_hash` (local e remoto), atualizando DB.
  - NOVO: POST `/api/ipfs/pin-nft/:id` — pin individual por `nft_id` ou `token_id` (com `force`).

### Leonardo → Geração e Salvamento
- `BackEnd/src/routes/leonardo.routes.js`:
  - `trimPrompt` e retry automático se exceder limite da Leonardo.
  - Polling robusto até COMPLETE/FAILED/timeout.
  - Download da imagem do Leonardo com headers (`Authorization`, `Referer`, `User-Agent`, `Accept`).
  - Detecção do `content-type` (png/jpg/webp) e nome adequado.
  - Upload IPFS com duas tentativas: `uploadBuffer` e fallback por arquivo temporário (`uploadFile`).
  - DB agora salva `ipfs_hash` e usa URL de gateway como `image_url`; `network=('ipfs'|'off-chain')`.
  - Resposta inclui `ipfsHash` no payload.
  - Rota de listagem passou a expor `ipfs_hash` e `network`.
  - Fallback local (Hugging Face/local) permanece com tentativa de pin no IPFS.

### Coleções
- `BackEnd/src/routes/collection.routes.js`:
  - Uso de `cover_image_url` (em vez de `banner_image`).
  - Geração de `slug` único automática.
  - `creator_id` obtido do JWT quando presente.

### Front-End (Vite/React)
- Gallery (`FrontEnd/src/Components/NftGallery/NftGallery.jsx`):
  - Adicionado `FallbackImage` com resolução por múltiplos gateways: `image_url` → Pinata → ipfs.io → Cloudflare → subdomínio Pinata (opcional `VITE_PINATA_SUBDOMAIN`).
  - Fallback de listagem: se o usuário não tiver NFTs, busca geral.

- Discover/Home (`FrontEnd/src/App.jsx`):
  - Seção “NFTs Gerados Recentemente” agora usa `DiscoverFallbackImage` com a mesma estratégia de gateways.
  - Consumo de `/api/leonardo/list` com os novos campos.

### Documentação
- `docs/IPFS-INTEGRATION.md` atualizado com:
  - Novos endpoints (`pin-from-url`, `backfill-nfts`, `pin-nft/:id`).
  - Melhoria de headers/fluxo Leonardo.
  - Fallback de gateways no front.

---

## Execução e Operação

### Backfill de NFTs sem CID
```http
POST /api/ipfs/backfill-nfts
{ "limit": 50, "dryRun": false, "onlyLocal": false }
```

### Pin individual por ID
```http
POST /api/ipfs/pin-nft/:id
{ "force": false }
```

### Diagnóstico de URL específica
```http
POST /api/ipfs/pin-from-url
{ "url": "https://cdn.leonardo.ai/.../image.png", "useLeonardoAuth": true }
```

### Variáveis de Ambiente Relevantes
- Pinata: `PINATA_API_KEY`, `PINATA_SECRET_API_KEY`, `PINATA_JWT` (opcional).
- Leonardo: `LEONARDO_API_KEY`.
- Front (opcional): `VITE_PINATA_SUBDOMAIN` (ex.: `sapphire-added-junglefowl-919.mypinata.cloud`).

---

## Notas e Considerações
- “Set Index File” no subdomínio do Pinata não remove arquivos; apenas altera a página raiz. A UI agora usa fallback de gateways e não depende de uma única raiz.
- Para itens antigos sem `ipfs_hash`, rode o backfill em lotes (repeat até zerar).
- Logs do backend agora exibem mensagens detalhadas dos erros do Pinata/Leonardo, facilitando troubleshooting.
