# Migração de API Backend → Cloudflare Worker

## ✅ Endpoints Implementados no Worker (D1)

### Autenticação
- `POST /api/auth/register` - Cadastro de usuários
- `POST /api/auth/login` - Login e geração de JWT
- `GET /api/auth/me` - Dados do usuário autenticado

### Usuários
- `GET /api/users/me` - Perfil do usuário autenticado
- `PATCH /api/users/me` - Atualização de perfil (suporta JSON e multipart)
- `GET /api/users/me/profile` - Perfil completo com contagem de NFTs
- `GET /api/users/:id/public-profile` - Perfil público de qualquer usuário

### NFTs
- `GET /api/leonardo/list` - Lista todos os NFTs disponíveis
- `GET /api/leonardo/:id` - Detalhes de um NFT específico
- `GET /api/users/me/nfts` - NFTs do usuário autenticado
- `GET /api/users/me/gallery` - Galeria do usuário

### Coleções
- `GET /api/collections/list` - Lista coleções (suporta `?mine=true`)
- `POST /api/collections` - Cria nova coleção

### Favoritos
- `GET /api/nft/:id/favorites` - Estatísticas de favoritos de um NFT
- `POST /api/nft/:id/favorite` - Adiciona/remove favorito (toggle)

### Histórico
- `GET /api/nft/:id/history` - Histórico de transações de um NFT
- `GET /api/users/me/activity` - Atividades recentes do usuário

### Assets
- `POST /api/upload` - Upload de arquivos para R2
- `GET /assets/*` - Serve arquivos do R2 via CDN global

---

## 🔄 Componentes Atualizados (FrontEnd)

### ✅ Já migrados para WORKER_BASE:
1. **SignUpForm.jsx** - Cadastro
2. **LoginForm.jsx** - Login
3. **Settings.jsx** - Configurações de usuário
4. **Activity.jsx** - Página de atividades
5. **EditProfileModal.jsx** - Modal de edição rápida
6. **CollectionModal.jsx** - Modal de criação/seleção de coleções

### ⏳ Pendentes de migração:
7. **Profile.jsx** - Perfil do usuário
8. **PublicProfile.jsx** - Perfil público
9. **Gallery.jsx** - Galeria de NFTs
10. **Marketplace.jsx** - Marketplace principal
11. **NftDetail.jsx** - Detalhes de NFT
12. **NftGallery.jsx** - Galeria de NFTs
13. **FavoriteButton.jsx** - Botão de favoritar
14. **NftHistory.jsx** - Histórico de NFT
15. **NftOffers.jsx** - Sistema de ofertas (COMPLEXO - manter no backend)
16. **CreateNFT.jsx** - Criação de NFT (Leonardo AI - manter no backend)
17. **Collections.jsx** - Listagem de coleções
18. **CollectionDetail.jsx** - Detalhes de coleção
19. **CollectionBanner.jsx** - Banner de coleções
20. **CollectionCarousel.jsx** - Carrossel de coleções

---

## 🚧 Endpoints que Permanecem no Backend Express

### Criação de NFT (Leonardo AI)
- `POST /api/leonardo/generate-and-save` - Gera NFT com IA e salva

### Sistema de Ofertas (Complexo)
- `GET /api/nft/:id/offers` - Lista ofertas de um NFT
- `POST /api/nft/:id/offers` - Cria nova oferta
- `PUT /api/nft/offers/:id/accept` - Aceita oferta
- `PUT /api/nft/offers/:id/reject` - Rejeita oferta
- `DELETE /api/nft/offers/:id` - Cancela oferta

### Compra de NFT (Wallet System)
- `POST /api/nft/:id/purchase` - Compra NFT
- `PATCH /api/nft/:id/price` - Atualiza preço do NFT
- `GET /api/wallet/balance` - Saldo da carteira
- `GET /api/nft/:id/suggested-price` - Preço sugerido
- `GET /api/nft/:id/popularity` - Popularidade do NFT
- `GET /api/nft/:id/favorites/history` - Histórico de favoritos

### IPFS/Pinata
- `POST /api/ipfs/upload` - Upload para IPFS via Pinata

---

## 📝 Como Atualizar Componentes Restantes

Para cada componente na lista "Pendentes", faça:

### 1. Atualizar o import
```javascript
// DE:
import { API_BASE } from '../../config/api';

// PARA:
import { WORKER_BASE } from '../../config/api';
```

### 2. Substituir todas as ocorrências
```javascript
// DE:
fetch(`${API_BASE}/api/...

// PARA:
fetch(`${WORKER_BASE}/api/...
```

### 3. Endpoints que NÃO devem ser migrados (manter API_BASE):
- `/api/leonardo/generate-and-save`
- `/api/nft/:id/purchase`
- `/api/nft/:id/price`
- `/api/wallet/balance`
- `/api/nft/:id/suggested-price`
- `/api/nft/:id/popularity`
- `/api/nft/:id/favorites/history`
- `/api/nft/:id/offers` (todos os métodos)
- `/api/ipfs/upload`

---

## 🚀 Status do Deploy

**Worker URL:** https://worker.hiagofdss900.workers.dev
**Última versão:** 068fec7f-9372-400d-adc8-8eb3cb40a933
**Deploy:** 04/11/2025 15:50:27

### Teste Rápido:
```bash
# Health Check
curl https://worker.hiagofdss900.workers.dev/api/health

# Listar NFTs
curl https://worker.hiagofdss900.workers.dev/api/leonardo/list

# Listar Coleções
curl https://worker.hiagofdss900.workers.dev/api/collections/list
```

---

## 📊 Arquitetura Híbrida Atual

```
FrontEnd (React)
    ↓
    ├── WORKER (Cloudflare) ← Leituras, Auth, Favoritos, Histórico
    │   ├── D1 (SQLite) ← Dados estruturados
    │   └── R2 (Object Storage) ← Imagens/Assets
    │
    └── Backend Express ← IA, Compras, Ofertas, IPFS
        └── PostgreSQL ← Dados transacionais complexos
```

### Benefícios desta Arquitetura:
- **Worker:** Baixa latência global (CDN), leituras rápidas, sem cold start
- **Backend:** Lógica complexa, transações, integrações com APIs externas
- **Gradual:** Migração incremental sem quebrar o sistema existente

---

## ⚠️ Observações Importantes

1. **JWT Simplificado:** O Worker usa JWT básico. Para produção, considere usar bibliotecas robustas.

2. **CORS:** Já configurado no Worker com `access-control-allow-origin: *`

3. **Multipart vs JSON:** O Worker aceita ambos em PATCH /api/users/me, mas preferir JSON + URLs pré-carregadas.

4. **D1 vs PostgreSQL:** Schemas sincronizados, mas tipos diferentes (DECIMAL→REAL, BOOLEAN→INTEGER).

5. **Uploads:** Fluxo atual: FrontEnd → Worker /api/upload → R2 → URL → Backend → PostgreSQL

---

## 📅 Próximos Passos

1. ✅ Implementar endpoints principais no Worker
2. ✅ Deploy do Worker
3. ⏳ Atualizar componentes do FrontEnd (parcial)
4. ⏳ Testar fluxo completo end-to-end
5. ⏳ Sincronização de dados PostgreSQL ↔ D1 (se necessário)
6. ⏳ Migrar sistema de ofertas para Worker (opcional)
7. ⏳ Implementar cache avançado no Worker
8. ⏳ Monitoramento e logs (Cloudflare Analytics)

---

**Última atualização:** 04/11/2025 15:53
