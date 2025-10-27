# 🚀 Setup com Docker e GitHub Secrets

## 📋 Pré-requisitos

- Docker instalado
- Conta no Hugging Face (gratuita)
- Repositório no GitHub

---

## 1️⃣ Iniciar Container PostgreSQL

### Passo 1: Subir o container

```bash
cd Docker
docker-compose up -d
```

Isso vai criar:
- **Container PostgreSQL** rodando na porta **5433**
- **Banco de dados:** atrivium-database
- **Usuário:** admin
- **Senha:** devpassword

### Passo 2: Verificar se está rodando

```bash
docker ps
```

Deve aparecer algo como:
```
CONTAINER ID   IMAGE         PORTS                    STATUS
xxxxx          postgres:16   0.0.0.0:5433->5432/tcp   Up
```

### Passo 3: Criar as tabelas

```bash
# Conectar ao container e executar o SQL
docker exec -i <CONTAINER_ID> psql -U admin -d atrivium-database < ../DataBase/SQL/user.sql
docker exec -i <CONTAINER_ID> psql -U admin -d atrivium-database < ../DataBase/SQL/nfts.sql
```

Ou use pgAdmin/DBeaver para conectar:
- **Host:** localhost
- **Port:** 5433
- **Database:** atrivium-database
- **Username:** admin
- **Password:** devpassword

---

## 2️⃣ Configurar GitHub Secrets

### Passo 1: Obter Hugging Face API Key

1. Acesse: https://huggingface.co/
2. Crie uma conta (gratuita)
3. Vá em **Settings** → **Access Tokens**
4. Clique em **"New token"**
5. Nome: `atrivium-nft`
6. Type: **Read**
7. Copie o token: `hf_xxxxxxxxxxxxxxxxxxxxx`

### Passo 2: Adicionar no GitHub Secrets

1. Vá no seu repositório: https://github.com/duarteHiago/atrivium-teste
2. **Settings** → **Secrets and variables** → **Actions**
3. Clique em **"New repository secret"**
4. Adicione:

```
Name: HUGGINGFACE_API_KEY
Value: hf_xxxxxxxxxxxxxxxxxxxxx (seu token)
```

### Passo 3: Adicionar outros secrets (se necessário)

Para desenvolvimento local, você pode adicionar:

```
Name: DB_HOST
Value: localhost

Name: DB_PORT
Value: 5433

Name: DB_USER
Value: admin

Name: DB_PASSWORD
Value: devpassword

Name: DB_DATABASE
Value: atrivium-database
```

---

## 3️⃣ Configurar Ambiente Local

### Opção A: Usar arquivo .env (Desenvolvimento Local)

Crie o arquivo `BackEnd/.env`:

```env
# Servidor
PORT=3001

# PostgreSQL (Docker)
DB_HOST=localhost
DB_PORT=5433
DB_USER=admin
DB_PASSWORD=devpassword
DB_DATABASE=atrivium-database

# Hugging Face API (Cole seu token aqui)
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxx
```

⚠️ **IMPORTANTE:** Adicione `.env` no `.gitignore` para não commitar!

### Opção B: Usar secrets localmente (Produção)

Se quiser simular o ambiente de produção localmente, use variáveis de ambiente:

**Windows (PowerShell):**
```powershell
$env:DB_HOST="localhost"
$env:DB_PORT="5433"
$env:DB_USER="admin"
$env:DB_PASSWORD="devpassword"
$env:DB_DATABASE="atrivium-database"
$env:HUGGINGFACE_API_KEY="hf_xxxxxxxxxxxxxxxxxxxxx"
$env:PORT="3001"

# Depois rode:
cd BackEnd
npm run dev
```

**Windows (CMD):**
```cmd
set DB_HOST=localhost
set DB_PORT=5433
set DB_USER=admin
set DB_PASSWORD=devpassword
set DB_DATABASE=atrivium-database
set HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxx
set PORT=3001

cd BackEnd
npm run dev
```

---

## 4️⃣ Iniciar o Sistema

### Terminal 1: Backend
```bash
cd BackEnd
npm run dev
```

Deve aparecer:
```
Servidor backend rodando na porta 3001
Conectado ao banco de dados: 2025-10-27...
```

### Terminal 2: Frontend
```bash
cd FrontEnd
npm run dev
```

Acesse: http://localhost:5173

---

## 5️⃣ Testar a Criação de NFT

1. Clique em **"+ Your NFT"**
2. Preencha:
   - **Nome:** Cyber Cat
   - **Descrição:** A futuristic cat
   - **Prompt:** A cyberpunk cat with neon lights, detailed, digital art
   - **Estilo:** Digital Art
3. Clique em **"🎨 Gerar Preview"**
4. Aguarde 10-30 segundos
5. Clique em **"✨ Criar NFT"**
6. Sucesso! 🎉

---

## 6️⃣ Verificar no Banco de Dados

```bash
# Conectar ao PostgreSQL no container
docker exec -it <CONTAINER_ID> psql -U admin -d atrivium-database

# Listar NFTs criados
SELECT token_id, name, image_hash FROM nfts;

# Sair
\q
```

---

## 🔧 Troubleshooting

### Erro: "Cannot connect to database"

**Solução:**
```bash
# Verificar se o container está rodando
docker ps

# Ver logs do container
docker logs <CONTAINER_ID>

# Reiniciar container
docker-compose restart
```

### Erro: "ECONNREFUSED localhost:5433"

**Solução:** Verifique se a porta no `.env` está correta:
```env
DB_PORT=5433  # Não 5432!
```

### Erro: "Invalid API key"

**Solução:** 
1. Verifique se copiou o token completo do Hugging Face
2. Token deve começar com `hf_`
3. Verifique se não tem espaços extras

### Erro: "Model is loading"

**Solução:** 
- É normal na primeira vez
- Aguarde 5-10 segundos
- O sistema tenta novamente automaticamente

---

## 📦 Estrutura Completa

```
atrivium-teste/
├── BackEnd/
│   ├── .env                    # Suas variáveis locais (NÃO commitar!)
│   ├── .env.example            # Exemplo para outros devs
│   └── ...
├── Docker/
│   └── docker-compose.yaml     # Container PostgreSQL
├── DataBase/
│   ├── SQL/
│   │   ├── user.sql           # Tabela de usuários
│   │   └── nfts.sql           # Tabela de NFTs
│   └── postgres-data/         # Dados do PostgreSQL (Docker volume)
└── FrontEnd/
    └── ...
```

---

## 🔐 GitHub Actions (Futuro - CI/CD)

Quando quiser fazer deploy automático, crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup environment
        run: |
          echo "HUGGINGFACE_API_KEY=${{ secrets.HUGGINGFACE_API_KEY }}" >> .env
          echo "DB_HOST=${{ secrets.DB_HOST }}" >> .env
          echo "DB_PORT=${{ secrets.DB_PORT }}" >> .env
          # ... outros secrets
      
      - name: Deploy
        run: |
          # Seus comandos de deploy aqui
```

---

## ✅ Checklist Final

- [ ] Docker instalado e rodando
- [ ] Container PostgreSQL iniciado (`docker-compose up -d`)
- [ ] Tabelas criadas (user.sql + nfts.sql)
- [ ] Hugging Face API Key obtida
- [ ] Arquivo `.env` criado no BackEnd com todas as variáveis
- [ ] Backend rodando (`npm run dev` na porta 3001)
- [ ] Frontend rodando (`npm run dev`)
- [ ] Teste de criação de NFT funcionando

---

**Pronto! Sistema 100% operacional com Docker e preparado para GitHub Secrets!** 🚀
