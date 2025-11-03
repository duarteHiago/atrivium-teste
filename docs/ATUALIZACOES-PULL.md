# Atualizações do Pull - 3 de Novembro de 2025

## 🗄️ Banco de Dados - Novos Scripts SQL

### 06-add-user-role.sql
- Adiciona coluna `role` na tabela `users` (valores: 'user', 'admin')
- Permite controle de permissões e acesso ao CMS

### 07-add-nft-price.sql
- Adiciona coluna `price` na tabela `nfts` (DECIMAL)
- Permite listar NFTs para venda com preço em ETH
- Índice para queries por preço

### 07-nft-favorites.sql
- Nova tabela `nft_favorites` (relacionamento NFT ↔ User)
- Sistema de likes/favoritos para NFTs
- Função `calculate_reputation_bonus()` - calcula valor sugerido baseado em favoritos
- Fórmula: Valor Base + ((favoritos / 5) * 0.08 * Valor Base)

### 08-create-wallets-system.sql
- Nova tabela `wallets` - carteira virtual de cada usuário (saldo em ETH)
- Nova tabela `transactions` - histórico de transações
- Tipos de transação: admin_deposit, nft_purchase, nft_sale, transfer
- Auto-criação de carteiras para usuários existentes

---

## 🎨 Frontend - Novos Componentes

### Marketplace.jsx
- **Local:** `FrontEnd/src/Components/Marketplace/`
- **Função:** Marketplace completo de NFTs
- **Features:**
  - Listagem de NFTs à venda
  - Filtros (status, busca, ordenação)
  - Cálculo de preço sugerido baseado em popularidade
  - Gráfico sparkline de tendências
  - Badges de popularidade (🔥 Trending, ⭐ Popular, 🌟 Rising Star)
  - Sistema de favoritos integrado

### WalletManagement.jsx
- **Local:** `FrontEnd/src/Components/Cms/`
- **Função:** Painel admin para gerenciar carteiras
- **Features:**
  - Listar todas as carteiras de usuários
  - Depositar ETH em carteiras (apenas admin)
  - Ver saldo e histórico

### NftDetail.jsx
- **Local:** `FrontEnd/src/Components/NftDetail/`
- **Função:** Página de detalhes de um NFT específico
- **Features:**
  - Visualização completa do NFT (imagem, descrição, metadados)
  - Botão de compra (se estiver à venda)
  - Sistema de favoritos
  - Informações do criador/proprietário
  - Histórico de transferências

### PublicProfile.jsx
- **Local:** `FrontEnd/src/Components/User/`
- **Função:** Perfil público de um usuário
- **Features:**
  - Ver NFTs criados/possuídos por outro usuário
  - Informações públicas (avatar, banner, bio, nickname)

### FavoriteButton.jsx
- **Local:** `FrontEnd/src/Components/FavoriteButton/`
- **Função:** Botão de favoritar NFT (coração)
- **Reutilizável** em qualquer componente

### ProtectedRoute.jsx
- **Local:** `FrontEnd/src/Components/ProtectedRoute/`
- **Função:** Wrapper para rotas que exigem autenticação
- Redireciona para login se não autenticado

---

## 🔧 Backend - Novos Endpoints

### Wallet Routes (`/api/wallet/`)

#### Usuário Autenticado:
- `GET /api/wallet/balance` - Ver saldo da carteira
- `GET /api/wallet/transactions` - Histórico de transações

#### Admin:
- `GET /api/wallet/admin/all` - Listar todas as carteiras
- `POST /api/wallet/admin/deposit` - Depositar ETH em carteira de usuário
  ```json
  { "userId": "uuid", "amount": 1.5 }
  ```

### IPFS/Pinata Routes (`/api/ipfs/`)
- `POST /api/ipfs/upload` - Upload de imagem para IPFS via Pinata
- Retorna: `{ ipfsHash, pinataUrl, gateway_url }`

### NFT Routes - Atualizadas
- `GET /api/nfts/marketplace` - NFTs à venda (com price)
- `POST /api/nfts/:id/favorite` - Favoritar/desfavoritar NFT
- `GET /api/nfts/:id/favorites` - Contar favoritos de um NFT

### Collection Routes - Atualizadas
- Suporte a `slug`, `cover_image_url`, `featured_order`
- Endpoints para coleções em destaque

---

## 📦 Novas Dependências

### Backend
- **form-data** (^4.0.4) - Envio de formulários multipart
- **pinata** (^2.5.1) - SDK oficial Pinata para IPFS
- **cross-env** (^7.0.3) - Scripts multiplataforma

### Frontend
- **@pinata/sdk** (^2.1.0) - SDK Pinata (deprecated, mas funcional)
- **pinata-web3** (^0.5.4) - Cliente web3 Pinata (deprecated)

⚠️ **Nota:** Os pacotes Pinata estão deprecated. Considere migrar para a nova SDK oficial no futuro.

---

## 🔐 Variáveis de Ambiente Necessárias

Adicione ao `BackEnd/.env`:

```env
# JWT Secret (para autenticação)
JWT_SECRET=seu_segredo_jwt_aqui_mude_em_producao

# Pinata/IPFS (para armazenamento de imagens)
PINATA_API_KEY=sua_pinata_api_key_aqui
PINATA_SECRET_API_KEY=sua_pinata_secret_key_aqui
PINATA_JWT=seu_pinata_jwt_aqui
```

**Para obter credenciais Pinata:**
1. Crie conta em: https://pinata.cloud
2. Vá em API Keys → New Key
3. Permita pinning e unpinning
4. Copie as credenciais

---

## 🚀 Próximos Passos

1. ✅ Aplicar scripts SQL (06, 07, 07, 08)
2. ✅ Configurar variáveis de ambiente (.env)
3. ⏳ Iniciar backend: `cd BackEnd && npm run dev`
4. ⏳ Iniciar frontend: `cd FrontEnd && npm run dev`
5. ⏳ Testar funcionalidades:
   - Criar NFT com preço
   - Favoritar NFTs
   - Ver marketplace
   - Depositar ETH (admin)
   - Comprar NFT

---

## 🎯 Principais Features Adicionadas

✅ **Sistema de Carteiras** - Saldo virtual em ETH  
✅ **Marketplace** - Compra/venda de NFTs  
✅ **Sistema de Favoritos** - Likes em NFTs  
✅ **Preço Sugerido** - Baseado em popularidade  
✅ **IPFS Integration** - Upload via Pinata  
✅ **Perfis Públicos** - Ver NFTs de outros usuários  
✅ **Gestão Admin** - Depósito de fundos  

---

## 🐛 Problemas Conhecidos

- Pacotes Pinata estão deprecated (funciona, mas considere migrar)
- 2 vulnerabilidades de alta severidade no frontend (dependências transitivas)
- Workflow GitHub Actions tem avisos de secrets (não afeta desenvolvimento local)

---

**Última atualização:** 3 de novembro de 2025
