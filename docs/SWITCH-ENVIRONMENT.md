# 🔄 Como Alternar Entre Ambientes

## 🏠 Modo LOCAL (Desenvolvimento)

### FrontEnd/.env.local:
```bash
VITE_API_BASE_URL=http://localhost:3002
VITE_WORKER_BASE_URL=http://localhost:3002  # ← Ambos apontam para localhost
```

### O que é necessário:
1. ✅ PostgreSQL rodando
2. ✅ Backend Express rodando (`node server.js` na porta 3002)
3. ✅ FrontEnd rodando (`npm run dev`)

### Vantagens:
- 🔧 Debug fácil com console.log
- 🗄️ Acesso direto ao banco PostgreSQL
- 🚫 Não consome quota do Cloudflare
- 💾 Dados ficam no banco local

---

## ☁️ Modo PRODUÇÃO (Cloudflare Worker)

### FrontEnd/.env.local:
```bash
VITE_API_BASE_URL=http://localhost:3002  # Backend ainda local (IA, compras, ofertas)
VITE_WORKER_BASE_URL=https://worker.hiagofdss900.workers.dev  # Worker na nuvem
```

### O que é necessário:
1. ✅ Worker deployado no Cloudflare
2. ✅ Backend Express rodando (para rotas não migradas)
3. ✅ FrontEnd rodando

### Vantagens:
- 🌍 CDN global (baixa latência)
- 📈 Escalabilidade automática
- 💰 Plano gratuito generoso
- 🗄️ D1 + R2 (banco e storage na nuvem)

---

## 🔄 Comandos Rápidos

### Alternar para LOCAL:
```powershell
# 1. Editar FrontEnd/.env.local
$env = Get-Content "FrontEnd\.env.local" -Raw
$env = $env -replace 'VITE_WORKER_BASE_URL=https://worker.hiagofdss900.workers.dev', 'VITE_WORKER_BASE_URL=http://localhost:3002'
Set-Content "FrontEnd\.env.local" -Value $env

# 2. Reiniciar FrontEnd
cd FrontEnd
# Ctrl+C no terminal do Vite
npm run dev
```

### Alternar para PRODUÇÃO:
```powershell
# 1. Editar FrontEnd/.env.local
$env = Get-Content "FrontEnd\.env.local" -Raw
$env = $env -replace 'VITE_WORKER_BASE_URL=http://localhost:3002', 'VITE_WORKER_BASE_URL=https://worker.hiagofdss900.workers.dev'
Set-Content "FrontEnd\.env.local" -Value $env

# 2. Reiniciar FrontEnd
cd FrontEnd
# Ctrl+C no terminal do Vite
npm run dev
```

---

## 📊 Arquitetura Atual

### Modo LOCAL:
```
FrontEnd → http://localhost:3002 (Backend Express) → PostgreSQL Local
```

### Modo HÍBRIDO (Recomendado):
```
FrontEnd
    ↓
    ├── https://worker.hiagofdss900.workers.dev (Leituras, Auth, Assets)
    │   ├── D1 (SQLite na nuvem)
    │   └── R2 (Storage na nuvem)
    │
    └── http://localhost:3002 (Backend Express - IA, Compras, Ofertas)
        └── PostgreSQL Local
```

---

## ⚠️ Observações Importantes

### 1. **Dados Separados:**
- **Local:** PostgreSQL (seu banco de desenvolvimento)
- **Produção:** D1 (banco na nuvem)
- ⚠️ **Não estão sincronizados!** Cadastros feitos em um não aparecem no outro.

### 2. **Uploads:**
- **Local:** Salvos em `BackEnd/uploads/`
- **Produção:** Salvos no R2 (Cloudflare)

### 3. **JWT:**
- Tokens gerados no Worker NÃO funcionam no Backend Express (e vice-versa)
- Se alternar ambiente, precisará fazer login novamente

### 4. **Backend Express Sempre Necessário:**
Mesmo em modo produção, o backend Express precisa rodar para:
- Leonardo AI (`/api/leonardo/generate-and-save`)
- Sistema de compras (`/api/nft/:id/purchase`)
- Sistema de ofertas (`/api/nft/:id/offers/*`)
- Carteira (`/api/wallet/*`)

---

## 🎯 Recomendação

Para desenvolvimento, use **MODO LOCAL** (atual):
- Mais fácil de debugar
- Sem dependência de internet
- Sem consumir quota do Cloudflare

Para testes de performance/produção, use **MODO HÍBRIDO**:
- Teste a latência global
- Valide integração com D1/R2
- Simule ambiente real

---

**Última atualização:** 04/11/2025
