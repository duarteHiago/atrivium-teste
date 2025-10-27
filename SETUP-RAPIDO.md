# ⚡ Setup Rápido - Docker + GitHub Secrets

## 🎯 O que você precisa fazer AGORA:

### 1. Iniciar o PostgreSQL no Docker

```powershell
cd Docker
docker-compose up -d
```

### 2. Criar as tabelas no banco

**Opção A - Script Automático (Recomendado):**
```powershell
# Na raiz do projeto
.\setup-database.ps1
```

**Opção B - Manual:**
```powershell
# Pegar ID do container
docker ps

# Executar os SQLs
Get-Content .\DataBase\SQL\user.sql | docker exec -i <CONTAINER_ID> psql -U admin -d atrivium-database
Get-Content .\DataBase\SQL\nfts.sql | docker exec -i <CONTAINER_ID> psql -U admin -d atrivium-database
```

### 3. Obter API Key do Hugging Face

1. https://huggingface.co/ → Criar conta (GRATUITO)
2. Settings → Access Tokens → New Token
3. Nome: `atrivium-nft`, Type: Read
4. Copiar token: `hf_xxxxxxxxxxxxxxxxxxxxx`

### 4. Criar arquivo .env no Backend

```powershell
cd BackEnd
copy .env.example .env
```

Edite o `.env` e cole seu token do Hugging Face:
```env
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxx
```

As outras variáveis já estão corretas para o Docker!

### 5. Iniciar Backend e Frontend

**Terminal 1:**
```powershell
cd BackEnd
npm run dev
```

**Terminal 2:**
```powershell
cd FrontEnd
npm run dev
```

### 6. Testar!

1. Abra http://localhost:5173
2. Clique em **"+ Your NFT"**
3. Crie seu primeiro NFT! 🎨

---

## 🔐 GitHub Secrets (Para Deploy Futuro)

Quando for fazer deploy/CI-CD, adicione no GitHub:

**Settings → Secrets → New secret:**

```
HUGGINGFACE_API_KEY = hf_xxxxxxxxxxxxxxxxxxxxx
DB_HOST = seu_host_producao
DB_PORT = 5432
DB_USER = seu_usuario
DB_PASSWORD = sua_senha
DB_DATABASE = atrivium-database
```

---

## 📦 Comandos Úteis Docker

```powershell
# Ver containers rodando
docker ps

# Ver logs do PostgreSQL
docker logs <CONTAINER_ID>

# Parar container
docker-compose down

# Reiniciar container
docker-compose restart

# Conectar ao PostgreSQL
docker exec -it <CONTAINER_ID> psql -U admin -d atrivium-database
```

---

## ✅ Checklist

- [ ] Docker Desktop instalado e rodando
- [ ] `docker-compose up -d` executado
- [ ] Script `setup-database.ps1` rodou com sucesso
- [ ] Conta Hugging Face criada
- [ ] API Key copiada
- [ ] Arquivo `BackEnd/.env` criado com o token
- [ ] Backend iniciado (porta 3001)
- [ ] Frontend iniciado (porta 5173)
- [ ] Teste de criação de NFT funcionando

---

**Pronto! Tudo configurado! 🚀**

Veja documentação completa em: `docs/SETUP-DOCKER-SECRETS.md`
