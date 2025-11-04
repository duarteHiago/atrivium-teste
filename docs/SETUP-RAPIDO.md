# ⚡ Setup Rápido - Atrivium (Ambiente Docker)

Este guia usa os novos scripts de automação (`start.sh` e `close.sh`) e remove a necessidade do script PowerShell. Siga os passos *na ordem correta*.

## 🎯 O que você precisa fazer AGORA:

### 1. Obter sua Chave de API (Obrigatório)

Antes de iniciar, você precisa de uma chave de API para a geração de IA.

1.  Acesse: https://huggingface.co/settings/tokens (Recomendado) ou https://app.leonardo.ai/settings
2.  Crie um token (ex: `hf_...` ou `seu-token-leonardo...`).
3.  Copie este token.

### 2. Criar arquivo .env no Backend (Obrigatório)

O backend precisa deste arquivo *antes* de iniciar pela primeira vez.

1.  Navegue até a pasta `BackEnd`:
    ```bash
    cd BackEnd
    ```
2.  Copie o arquivo de exemplo para criar o seu `.env`:
    ```bash
    # Se estiver no Linux/Mac/Git Bash
    cp .env.example .env
    
    # Se estiver no CMD (Windows)
    copy .env.example .env
    ```
3.  Abra o novo arquivo `BackEnd/.env` e cole sua chave de API:

    ```env
    # ... (outras variáveis) ...
    
    # Cole sua chave aqui
    LEONARDO_API_KEY=SEU_TOKEN_LEONARDO_AQUI
    
    # OU (se estiver usando Hugging Face)
    # HUGGINGFACE_API_KEY=SEU_TOKEN_HUGGINGFACE_AQUI
    ```
4.  Volte para a raiz do projeto:
    ```bash
    cd ..
    ```

### 3. Dar Permissão aos Scripts (Apenas na primeira vez)

No seu terminal (Linux, macOS ou Git Bash no Windows), dê permissão de execução:
```bash
chmod +x start.sh
chmod +x close.sh
```

### 4. Iniciar TODO o Ambiente
Agora você pode iniciar o projeto. Este comando fará tudo:

1. Subir os contêineres do Docker (Postgres, Backend, Frontend).
2. Esperar o banco de dados ficar saudável.
3. Criar as tabelas users e nfts automaticamente.

```
./start.sh
```

Após o script terminar, seu ambiente estará pronto! 

Frontend: http://localhost:5173 <br>
Backend: http://localhost:3001

### 5. Como Parar o Ambiente
Para parar e remover todos os contêineres:

```bash
./close.sh
```

---

## 🎉 Pronto! Seu Ambiente Está Rodando

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- Clique em **"+ Your NFT"** para criar seu primeiro NFT!

---

## 🧪 Setup Manual (Sem Docker)

Se preferir executar sem Docker:

### Passo 1: Banco de Dados

```bash
# Executar o script SQL
psql -U postgres -d atrivium -f DataBase/SQL/01-user.sql
psql -U postgres -d atrivium -f DataBase/SQL/02-nfts.sql
psql -U postgres -d atrivium -f DataBase/SQL/03-collections.sql
```

### Passo 2: Backend

```bash
cd BackEnd

# Criar arquivo .env
copy config\environments\.env.example config\environments\.env.development

# Editar .env.development e adicionar:
# LEONARDO_API_KEY=sua_key_aqui (ou HUGGINGFACE_API_KEY)

# Instalar dependências
npm install

# Iniciar servidor
npm run dev
```

### Passo 3: Frontend

```bash
cd FrontEnd

# Instalar dependências
npm install

# Iniciar servidor
npm run dev
```

---

## 🔧 Como Funciona

1. **Gerar Preview**: IA cria imagem baseada em descrição
2. **Criar NFT**: Sistema gera token único (UUID + SHA-256)
3. **Certificado Digital**: Cada NFT recebe certificado verificável
4. **Banco de Dados**: Tudo salvo no PostgreSQL

## 🔐 Tokenização Única

✅ Cada imagem = Hash SHA-256 único  
✅ Impossível duplicar  
✅ Certificado digital verificável  
✅ Preparado para blockchain (futuro)

---

## 📚 Mais Informações

Para detalhes técnicos completos, veja: [NFT-SYSTEM-SETUP.md](./NFT-SYSTEM-SETUP.md)