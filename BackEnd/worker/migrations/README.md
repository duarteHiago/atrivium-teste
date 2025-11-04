# Migração D1 - Schema Inicial

## ✅ Status: Concluído

### 📊 Resumo da Migração

- **Data:** 4 de novembro de 2025
- **Database:** artrivium-db (0920c717-a989-4677-a4d0-ed541599101c)
- **Arquivo:** `migrations/0001_initial_schema.sql`
- **Queries Executadas:** 30
- **Rows Written:** 46
- **Database Size:** 0.19 MB

### 📋 Tabelas Criadas

1. **users** - Usuários da plataforma
   - Campos: user_id, first_name, last_name, email, password_hash, cpf, birth_date, cep, address, gender, role, nickname, bio, avatar_url, banner_url, created_at, updated_at
   - Índices: email, role

2. **collections** - Coleções de NFTs
   - Campos: collection_id, name, description, banner_image, cover_image_url, slug, floor_price, total_volume, is_featured, featured_order, creator_id, created_at, updated_at
   - Índices: slug, featured, creator

3. **nfts** - Tokens NFT
   - Campos: nft_id, token_id, name, description, image_url, prompt, style, status, price, buy_now_price, creator_id, current_owner_id, collection_id, ipfs_hash, network, created_at, updated_at
   - Índices: creator, owner, collection, status, ipfs, created

4. **transactions** - Histórico de transações
   - Campos: transaction_id, transaction_type, from_user_id, to_user_id, nft_id, amount_eth, created_at
   - Índices: from, to, nft, type, created

5. **nft_favorites** - Favoritos dos usuários
   - Campos: favorite_id, user_id, nft_id, created_at
   - Índices: user, nft
   - Constraint: UNIQUE(user_id, nft_id)

6. **wallets** - Carteiras dos usuários
   - Campos: wallet_id, user_id, balance_eth, created_at, updated_at
   - Índices: user
   - Constraint: user_id UNIQUE

7. **offers** - Ofertas em NFTs
   - Campos: offer_id, nft_id, from_user_id, amount_eth, message, status, expires_at, created_at, updated_at
   - Índices: nft, from, status

8. **_health** - Controle de saúde do sistema
   - Campos: k, v, created_at

### 🔍 Total de Índices: 22

- idx_users_email, idx_users_role
- idx_collections_slug, idx_collections_featured, idx_collections_creator
- idx_nfts_creator, idx_nfts_owner, idx_nfts_collection, idx_nfts_status, idx_nfts_ipfs, idx_nfts_created
- idx_transactions_from, idx_transactions_to, idx_transactions_nft, idx_transactions_type, idx_transactions_created
- idx_favorites_user, idx_favorites_nft
- idx_wallets_user
- idx_offers_nft, idx_offers_from, idx_offers_status

### 🔄 Diferenças SQLite vs PostgreSQL

#### UUIDs
- **PostgreSQL:** Tipo nativo `UUID` com função `gen_random_uuid()`
- **SQLite/D1:** Tipo `TEXT` com função customizada usando `randomblob()` e `hex()`
  ```sql
  lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' ||
        hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' ||
        hex(randomblob(6)))
  ```

#### Tipos de Dados
- **DECIMAL/NUMERIC** → **REAL** (valores ETH: price, balance_eth, amount_eth)
- **BOOLEAN** → **INTEGER** (is_featured: 0 = false, 1 = true)
- **TIMESTAMP** → **DATETIME** (created_at, updated_at)

#### Foreign Keys
- SQLite suporta foreign keys, mas precisa ser habilitado via `PRAGMA foreign_keys = ON`
- D1 habilita automaticamente

### 📝 Como Aplicar Futuras Migrações

#### Local (Desenvolvimento)
```bash
cd c:\dev\atrivium-teste\BackEnd\worker
node node_modules/wrangler/bin/wrangler.js d1 execute artrivium-db --file=migrations/XXXX_nome.sql
```

#### Remoto (Produção)
```bash
cd c:\dev\atrivium-teste\BackEnd\worker
node node_modules/wrangler/bin/wrangler.js d1 execute artrivium-db --remote --file=migrations/XXXX_nome.sql
```

### 🔧 Comandos Úteis

#### Listar Tabelas
```bash
node node_modules/wrangler/bin/wrangler.js d1 execute artrivium-db --remote --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
```

#### Ver Estrutura de uma Tabela
```bash
node node_modules/wrangler/bin/wrangler.js d1 execute artrivium-db --remote --command="PRAGMA table_info(users)"
```

#### Listar Índices
```bash
node node_modules/wrangler/bin/wrangler.js d1 execute artrivium-db --remote --command="SELECT name, tbl_name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name"
```

#### Contar Registros
```bash
node node_modules/wrangler/bin/wrangler.js d1 execute artrivium-db --remote --command="SELECT COUNT(*) as total FROM users"
```

### ⚠️ Notas Importantes

1. **Backup antes de migrar:** D1 faz backup automático antes de executar queries DDL
2. **Rollback automático:** Se a migração falhar, o banco retorna ao estado anterior
3. **Bookmark:** Cada migração bem-sucedida gera um bookmark único para rastreamento
4. **Downtime:** Migrações bloqueiam o banco temporariamente (avisar usuários em produção)

### 🚀 Próximos Passos

1. ✅ Schema básico criado
2. ⏳ Implementar endpoints de leitura no Worker usando D1
3. ⏳ Migrar endpoints críticos (auth, NFT listing) para o Worker
4. ⏳ Sincronização de dados PostgreSQL → D1 (se necessário manter ambos)

### 📊 Performance

- **Tamanho do banco:** 0.19 MB (apenas schema, sem dados)
- **Tempo de execução:** ~0.01 segundos
- **Queries executadas:** 30 (CREATE TABLE + CREATE INDEX)

---

**Última atualização:** 2025-11-04 15:10 BRT
