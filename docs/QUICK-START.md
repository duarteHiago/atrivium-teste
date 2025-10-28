# 🚀 Setup Rápido - Sistema de NFTs

## Passo 1: Banco de Dados

```bash
# Executar o script SQL
psql -U postgres -d atrivium -f DataBase/SQL/nfts.sql
```

## Passo 2: Backend

```bash
cd BackEnd

# Criar arquivo .env
copy .env.example .env

# Editar .env e adicionar:
# HUGGINGFACE_API_KEY=sua_key_aqui (obtenha em https://huggingface.co/settings/tokens)

# Iniciar servidor
npm run dev
```

## Passo 3: Frontend

```bash
cd FrontEnd
npm run dev
```

## Passo 4: Obter API Key Hugging Face (GRATUITO)

1. https://huggingface.co/ → Criar conta
2. Settings → Access Tokens → New Token
3. Copiar e colar no `.env`

## Pronto! 🎉

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Clique em **"+ Your NFT"** para criar seu primeiro NFT!

---

## Como Funciona

1. **Gerar Preview**: IA cria imagem baseada em descrição
2. **Criar NFT**: Sistema gera token único (UUID + SHA-256)
3. **Certificado Digital**: Cada NFT recebe certificado verificável
4. **Banco de Dados**: Tudo salvo no PostgreSQL

## Tokenização Única

✅ Cada imagem = Hash SHA-256 único
✅ Impossível duplicar
✅ Certificado digital verificável
✅ Preparado para blockchain (futuro)

---

Para mais detalhes, veja: [NFT-SYSTEM-SETUP.md](./NFT-SYSTEM-SETUP.md)
