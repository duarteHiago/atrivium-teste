# 🎨 Sistema de Criação de NFTs - Atrivium

Sistema completo de criação de NFTs com tokenização única, geração de imagens por IA e preparado para integração blockchain.

## ✨ Características

### ✅ Implementado
- **Tokenização Única**: Cada imagem recebe um UUID e hash SHA-256 único
- **IA Generativa**: Integração com Hugging Face (gratuito)
- **Certificado Digital**: Cada NFT possui um certificado verificável
- **Metadata ERC-721**: Formato compatível com padrões blockchain
- **Banco de Dados**: Armazena propriedade e histórico
- **Interface Completa**: Formulário de criação com preview em tempo real

### 🚧 Preparado para Futuro
- Integração com blockchain (Polygon/Ethereum)
- Upload para IPFS
- Carteiras Web3
- Marketplace

---

## 🚀 Como Rodar

### 1. Configurar Banco de Dados

```bash
# Execute o script SQL para criar as tabelas
psql -U postgres -d atrivium -f DataBase/SQL/nfts.sql
```

### 2. Configurar Backend

```bash
cd BackEnd

# Copie o arquivo de configuração
copy .env.example .env

# Edite o .env e adicione:
# - Credenciais do PostgreSQL
# - API Key do Hugging Face (https://huggingface.co/settings/tokens)

# Instale as dependências (se ainda não instalou)
npm install

# Inicie o servidor
npm run dev
```

O backend estará rodando em `http://localhost:3001`

### 3. Obter API Key do Hugging Face (GRATUITO)

1. Acesse: https://huggingface.co/
2. Crie uma conta (gratuita)
3. Vá em Settings → Access Tokens
4. Clique em "New token"
5. Dê um nome (ex: "atrivium-nft")
6. Selecione "Read"
7. Copie o token e cole no `.env`:

```
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxx
```

### 4. Iniciar Frontend

```bash
cd FrontEnd
npm run dev
```

O frontend estará em `http://localhost:5173`

---

## 📖 Como Usar

### Criar um NFT

1. Clique no botão **"+ Your NFT"** na barra superior
2. Preencha os campos:
   - **Nome**: Nome do seu NFT
   - **Descrição**: Descrição detalhada
   - **Prompt**: Descrição para a IA gerar a imagem
   - **Estilo**: Escolha o estilo de arte
3. Clique em **"🎨 Gerar Preview"**
4. Aguarde a IA gerar a imagem (10-30 segundos)
5. Se gostar do resultado, clique em **"✨ Criar NFT"**
6. Pronto! Seu NFT foi criado com token único

### O que acontece ao criar um NFT?

1. **Geração de Imagem**: IA cria imagem baseada no prompt
2. **Hash Único**: SHA-256 da imagem garante unicidade
3. **Token ID**: UUID único é gerado
4. **Certificado**: Certificado digital é criado
5. **Metadata**: Dados no formato ERC-721
6. **Banco de Dados**: Tudo é salvo no PostgreSQL
7. **Prova de Propriedade**: Você é registrado como criador e dono

---

## 🔐 Sistema de Tokenização

### Identificadores Únicos

Cada NFT possui 3 identificadores únicos:

1. **Token ID** (UUID v4)
   ```
   Exemplo: 123e4567-e89b-12d3-a456-426614174000
   ```

2. **Image Hash** (SHA-256)
   ```
   Exemplo: 5d41402abc4b2a76b9719d911017c592ae5f8e8d...
   ```

3. **Certificate Hash** (SHA-256 do certificado completo)
   ```
   Exemplo: 9c56cc51b374c3ba189210d5b6d4bf57790d351c...
   ```

### Verificação de Unicidade

- Antes de criar um NFT, o sistema verifica se o hash da imagem já existe
- Impossível criar dois NFTs com a mesma imagem
- Garante autenticidade e escassez

### Certificado Digital

Cada NFT possui um certificado que inclui:

```json
{
  "tokenId": "uuid-aqui",
  "imageHash": "sha256-hash",
  "certificateHash": "sha256-hash-completo",
  "timestamp": "2025-10-27T...",
  "version": "1.0",
  "contractAddress": null,
  "network": "off-chain",
  "verified": true,
  "metadata": {
    "name": "Nome do NFT",
    "description": "Descrição",
    "creator": "ID do criador"
  }
}
```

---

## 📦 Estrutura do Banco de Dados

### Tabela: `nfts`

Armazena informações completas dos NFTs:

- Identificadores únicos (token_id, image_hash, certificate_hash)
- Metadata no formato ERC-721
- Informações de propriedade (creator, owner)
- Preparado para blockchain (contract_address, network, etc.)
- Timestamps e status

### Tabela: `nft_transfers`

Histórico de transferências:

- Rastreamento de propriedade
- Registro de todas as transferências
- Preparado para transações blockchain

---

## 🎨 Estilos de IA Disponíveis

### 1. Digital Art (Stable Diffusion)
- Estilo: Arte digital moderna
- Modelo: `stabilityai/stable-diffusion-2-1`
- Melhor para: Arte conceitual, ilustrações

### 2. Anime
- Estilo: Anime japonês
- Modelo: `Linaqruf/animagine-xl-3.1`
- Melhor para: Personagens anime, mangá

### 3. Realistic
- Estilo: Fotorealista
- Modelo: `SG161222/Realistic_Vision_V5.1_noVAE`
- Melhor para: Fotos realistas, retratos

---

## 🔄 Preparado para Blockchain

### Arquitetura Flexível

O sistema foi projetado para fácil migração para blockchain:

#### Campos preparados no banco:
- `contract_address`: Endereço do contrato
- `token_id_blockchain`: ID na blockchain
- `network`: Nome da rede (polygon, ethereum)
- `transaction_hash`: Hash da transação
- `block_number`: Número do bloco
- `minted_at`: Timestamp do mint

#### Metadata ERC-721 Compliant:
```json
{
  "name": "Nome do NFT",
  "description": "Descrição",
  "image": "ipfs://QmHash...",
  "attributes": [...],
  "properties": {...}
}
```

#### Próximos Passos para Blockchain:
1. Desenvolver smart contract ERC-721
2. Deploy em testnet (Polygon Mumbai)
3. Integrar Web3.js/Ethers.js no frontend
4. Implementar função de mint
5. Migrar imagens para IPFS
6. Atualizar registros no banco

---

## 🛠️ API Endpoints

### POST `/api/nft/generate-preview`
Gera preview de imagem com IA

**Body:**
```json
{
  "prompt": "a futuristic cat",
  "style": "stable-diffusion"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "image": "data:image/png;base64,...",
    "prompt": "enhanced prompt",
    "style": "stable-diffusion"
  }
}
```

### POST `/api/nft/create`
Cria NFT completo com tokenização

**Body:**
```json
{
  "name": "My NFT",
  "description": "Description",
  "prompt": "prompt used",
  "style": "stable-diffusion",
  "imageBase64": "data:image/png;base64,...",
  "creatorId": 1,
  "attributes": []
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "nft": {...},
    "certificate": {...},
    "metadata": {...}
  }
}
```

### GET `/api/nft/list`
Lista NFTs criados

**Query params:**
- `creatorId`: Filtrar por criador
- `ownerId`: Filtrar por dono atual
- `status`: Filtrar por status
- `limit`: Limite de resultados (padrão: 50)
- `offset`: Offset para paginação

### GET `/api/nft/:tokenId`
Busca NFT específico pelo token ID

---

## 💰 Custos

### Atual (Off-chain)
- **Hugging Face API**: GRATUITO (com limites)
- **Armazenamento**: Local (0 custo)
- **Banco de Dados**: PostgreSQL local

### Futuro (Com Blockchain)
- **Polygon Mint**: ~$0.01-0.10 por NFT
- **IPFS (Pinata)**: Gratuito até 1GB
- **Gas Fees**: Variável (usar Layer 2)

---

## 📝 TODO

- [ ] Implementar autenticação real (atualmente usa creatorId fixo)
- [ ] Adicionar galeria de NFTs criados
- [ ] Implementar sistema de busca
- [ ] Adicionar mais estilos de IA
- [ ] Melhorar tratamento de erros
- [ ] Adicionar testes unitários
- [ ] Implementar upload de imagem base (image-to-image)
- [ ] Sistema de atributos customizáveis

---

## 🤝 Contribuindo

Este é um projeto em desenvolvimento. Sugestões e melhorias são bem-vindas!

---

## 📄 Licença

Projeto Atrivium - 2025
