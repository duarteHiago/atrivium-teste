# Issue: Estrutura de Banco de Dados para NFTs

**Labels:** `database`, `backend`  
**Assignees:** @duarteHiago

---

## 📋 Descrição

Criar schema completo do banco de dados PostgreSQL para armazenar NFTs tokenizados, incluindo sistema de propriedade e histórico de transferências. Preparado para futura integração com blockchain.

---

## ✅ Implementado

### Tabelas Criadas

**1. Tabela `nfts`**
- Identificadores únicos: `token_id` (UUID), `image_hash` (SHA-256), `certificate_hash`
- Dados do NFT: nome, descrição, prompt, estilo
- Metadata no formato ERC-721 (JSON)
- Propriedade: `creator_id`, `current_owner_id` (FK para `users`)
- Campos blockchain preparados: `contract_address`, `network`, `transaction_hash`, etc.
- Status e timestamps

**2. Tabela `nft_transfers`**
- Histórico completo de transferências
- Rastreamento de propriedade (from/to user)
- Tipo de transferência: mint, transfer, sale
- Preparada para transações blockchain

**Recursos:**
- Índices para performance em buscas
- Trigger para atualizar `updated_at` automaticamente
- Foreign keys com tabela `users`
- Constraints de unicidade (image_hash, token_id)

---

## 📝 Arquivo

```sql
✅ DataBase/SQL/nfts.sql
```

**Executar uma vez:**
```bash
psql -U admin -d atrivium-database -f DataBase/SQL/nfts.sql
```

---

**Status:** ✅ Concluído - 27/10/2025
