# 🔄 Mudanças Pós-Pull - O que fazer no PC de casa

## Resumo
Depois de fazer `git pull`, você precisa fazer 3 coisas no PC de casa:

---

## 1️⃣ Instalar Novas Dependências (OBRIGATÓRIO)

```bash
# Backend
cd BackEnd
npm install

# Frontend  
cd ../FrontEnd
npm install
```

**O que foi adicionado:**
- Backend: `form-data`, `pinata`, `cross-env`
- Frontend: `@pinata/sdk`, `pinata-web3`

---

## 2️⃣ Aplicar Scripts SQL no Banco (OBRIGATÓRIO)

Execute no psql ou use o script auxiliar:

### Opção A - Via psql diretamente:
```powershell
$env:PGPASSWORD="SUA_SENHA"; & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -p 5432 -U postgres -d atrivium-database -f "setup-atrivium-database.sql"
```

### Opção B - Via script .bat (mais fácil):
```powershell
.\run-sql-scripts.bat
```

**Scripts aplicados:**
- ✅ 06-add-user-role.sql (sistema de roles)
- ✅ 07-add-nft-price.sql (preços nos NFTs)
- ✅ 07-nft-favorites.sql (favoritos/likes)
- ✅ 08-create-wallets-system.sql (carteiras virtuais)

---

## 3️⃣ Atualizar .env com Novas Variáveis (OBRIGATÓRIO)

Adicione no `BackEnd/.env`:

```env
# JWT Secret
JWT_SECRET=seu_segredo_jwt_aqui_mude_em_producao

# Pinata/IPFS (credenciais do time - usar as mesmas)
PINATA_API_KEY=ae6800530260b95f25c5
PINATA_SECRET_API_KEY=357911e2387b9cdc5aad64ea1aa5d4abf967ba02236302779a96e0d414632928
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIxMGU0YmUzYi04ZTc1LTQ3OTEtYjFhZi1mZjkwN2EzMmIwNzAiLCJlbWFpbCI6Im1hcmNpb2JjYXZhbGNhbnRpanVuaW9yQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJhZTY4MDA1MzAyNjBiOTVmMjVjNSIsInNjb3BlZEtleVNlY3JldCI6IjM1NzkxMWUyMzg3YjljZGM1YWFkNjRlYTFhYTVkNGFiZjk2N2JhMDIyMzYzMDI3NzlhOTZlMGQ0MTQ2MzI5MjgiLCJleHAiOjE3OTM2NDc0NjV9.DMbBCmm3hA_0AwiktsLQA678nG5wekXzkgLhMkFlgiI
PINATA_GATEWAY=sapphire-added-junglefowl-919.mypinata.cloud
```

**Ajuste também (se necessário):**
- `DB_PASSWORD` para a senha do seu PostgreSQL local
- `PORT` para 3001 (ou 3002 se der conflito)

---

## ✅ O que NÃO precisa fazer:

❌ Não precisa criar arquivos auxiliares (já estão no Git)  
❌ Não precisa alterar código (já veio no pull)  
❌ Não precisa recriar estrutura de pastas  

---

## 🎯 Checklist Rápido:

- [ ] `git pull origin dev-hiago`
- [ ] `npm install` no Backend
- [ ] `npm install` no Frontend
- [ ] Adicionar variáveis novas no `.env`
- [ ] Executar scripts SQL no banco
- [ ] Testar: `npm run dev` (backend e frontend)

---

## 🐛 Troubleshooting:

### Erro: "relação nft_favorites não existe"
**Solução:** Você não executou os scripts SQL. Execute `setup-atrivium-database.sql`

### Erro: "Failed to fetch" no frontend
**Solução:** Backend não está rodando ou porta errada. Verifique se PORT no `.env` bate com `api.js`

### Erro: Porta 3001 não funciona
**Solução:**
1. Mude `PORT=3002` no `.env`
2. Mude `FrontEnd/src/config/api.js` para `http://localhost:3002`

---

## 📦 Novos Arquivos Criados (já no Git):

- ✅ `setup-atrivium-database.sql` - Aplica todos os scripts SQL
- ✅ `clean-db.sql` - Limpa dados do banco
- ✅ `run-sql-scripts.bat` - Script Windows para aplicar migrations
- ✅ `start.bat` - Reinicia backend facilmente
- ✅ `docs/ATUALIZACOES-PULL.md` - Documentação completa das mudanças

---

**Criado em:** 3 de novembro de 2025  
**Válido para:** Branch `dev-hiago` após pull do dia 03/11/2025
