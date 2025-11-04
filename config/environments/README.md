# 📁 Gerenciamento de Variáveis de Ambiente

Este diretório contém todos os arquivos de configuração de ambiente para o projeto Atrivium.

## 📋 Estrutura dos Arquivos

```
config/environments/
├── .env.example         # Template com todas as variáveis (commitar no Git)
├── .env.development     # Configurações de desenvolvimento (NÃO commitar)
├── .env.staging         # Configurações de homologação (NÃO commitar)
├── .env.production      # Configurações de produção (NÃO commitar)
├── .env.test            # Configurações de testes (NÃO commitar)
└── README.md            # Esta documentação
```

## 🔒 Segurança

⚠️ **IMPORTANTE**: Apenas o arquivo `.env.example` deve ser commitado no Git!

Todos os outros arquivos `.env.*` estão no `.gitignore` para proteger informações sensíveis:
- Senhas de banco de dados
- API keys
- Tokens de autenticação
- Certificados SSL

## 🚀 Como Usar

### 1️⃣ Primeira Configuração

Copie o arquivo de exemplo para criar seu ambiente de desenvolvimento:

```bash
# Windows PowerShell
Copy-Item config/environments/.env.example config/environments/.env.development

# Linux/Mac
cp config/environments/.env.example config/environments/.env.development
```

### 2️⃣ Configure as Variáveis

Edite o arquivo `.env.development` e adicione suas credenciais reais:

```bash
# Exemplo: Configure sua API key do Leonardo AI
LEONARDO_API_KEY=sua_chave_real_aqui
```

### 3️⃣ Selecione o Ambiente

O sistema carrega automaticamente o ambiente correto baseado em `NODE_ENV`:

```bash
# Desenvolvimento
NODE_ENV=development npm start

# Staging
NODE_ENV=staging npm start

# Produção
NODE_ENV=production npm start

# Testes
NODE_ENV=test npm test
```

## 📚 Variáveis Disponíveis

### 🖥️ Servidor
- `PORT` - Porta do servidor backend
- `NODE_ENV` - Ambiente de execução

### 🗄️ Banco de Dados
- `DB_HOST` - Host do PostgreSQL
- `DB_PORT` - Porta do PostgreSQL
- `DB_USER` - Usuário do banco
- `DB_PASSWORD` - Senha do banco
- `DB_DATABASE` - Nome do banco

### 🔐 Segurança
- `JWT_SECRET` - Chave secreta para tokens JWT
- `JWT_EXPIRES_IN` - Tempo de expiração do token
- `ENCRYPTION_KEY` - Chave para criptografia de dados

### 🤖 APIs Externas
- `LEONARDO_API_KEY` - Leonardo AI para geração de imagens
- `HUGGINGFACE_API_KEY` - HuggingFace para IA
- `NGROK_TOKEN` - Ngrok para túneis HTTP (opcional)

### 🌐 CORS e Upload
- `CORS_ORIGIN` - URL permitida para CORS
- `UPLOAD_MAX_SIZE` - Tamanho máximo de upload
- `UPLOAD_DIR` - Diretório de uploads

### 📊 Rate Limiting
- `RATE_LIMIT_WINDOW_MS` - Janela de tempo (ms)
- `RATE_LIMIT_MAX_REQUESTS` - Máximo de requisições

### 📝 Logs
- `LOG_LEVEL` - Nível de log (debug, info, error)

### 🎨 Frontend
- `VITE_API_BASE` - URL base da API para o Vite

### 🔗 Outros
- `PUBLIC_BASE_URL` - URL pública do servidor

## 🌍 Ambientes

### 🛠️ Development
- **Porta**: 3001
- **Database**: Docker local (porta 5433)
- **Log Level**: debug
- **Rate Limiting**: 100 req/15min

### 🧪 Staging
- **Porta**: 3001
- **Database**: staging-db.atrivium.com
- **Log Level**: info
- **Rate Limiting**: 50 req/15min

### 🚀 Production
- **Porta**: 3000
- **Database**: production-db.atrivium.com
- **Log Level**: error
- **Rate Limiting**: 20 req/15min
- **Extra**: Redis, SSL, Monitoramento (Sentry, New Relic)

### 🧪 Test
- **Porta**: 3002
- **Database**: Docker local (porta 5434)
- **Log Level**: debug
- **Rate Limiting**: Desativado

## 🔄 Atualização

Quando novas variáveis forem adicionadas:

1. Atualize o `.env.example` primeiro
2. Atualize todos os outros arquivos `.env.*`
3. Documente neste README
4. Notifique a equipe sobre as novas variáveis

## 📞 Suporte

Em caso de dúvidas sobre configuração de ambiente:
1. Consulte este README
2. Verifique o `.env.example`
3. Entre em contato com a equipe de DevOps
