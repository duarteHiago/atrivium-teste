# Issue: Integração com API de IA Generativa

**Labels:** `backend`, `api`, `ai`  
**Assignees:** @duarteHiago

---

## 📋 Descrição

Integrar Hugging Face API para geração de imagens com IA, implementando sistema de tokenização única com hashes criptográficos e certificados digitais para cada NFT criado.

---

## ✅ Implementado

### 1. Serviço de IA (`ai.service.js`)
- Integração com Hugging Face Inference API (gratuito)
- 3 modelos disponíveis: Stable Diffusion, Anime, Realistic
- Melhoria automática de prompts
- Salva imagens localmente em `uploads/`
- Retry automático se modelo estiver carregando

### 2. Serviço de Tokenização (`tokenization.service.js`)
- Gera UUID único (Token ID)
- Cria hash SHA-256 da imagem (garante unicidade)
- Gera certificado digital verificável
- Metadata formato ERC-721 (preparado para blockchain)
- Verifica duplicatas no banco

### 3. Controller (`nft.controller.js`)
- `POST /api/nft/generate-preview` - Preview de imagem
- `POST /api/nft/create` - Cria NFT completo com tokenização
- `GET /api/nft/list` - Lista NFTs
- `GET /api/nft/:tokenId` - Busca NFT específico

### 4. Rotas (`nft.routes.js`)
- Configura endpoints REST
- Integrado no `server.js`

---

## 🔐 Tokenização Única

Cada NFT recebe:
- **Token ID**: UUID v4 único
- **Image Hash**: SHA-256 (impossível duplicar)
- **Certificate Hash**: Hash do certificado completo
- **Metadata**: Formato ERC-721 (blockchain-ready)

---

## 📝 Arquivos

```
✅ BackEnd/src/services/ai.service.js
✅ BackEnd/src/services/tokenization.service.js
✅ BackEnd/src/controllers/nft.controller.js
✅ BackEnd/src/routes/nft.routes.js
✅ BackEnd/server.js (MODIFICADO)
```

**Configuração necessária:**
```env
HUGGINGFACE_API_KEY=hf_xxxxx  # Obter em https://huggingface.co/settings/tokens
```

---

**Status:** ✅ Concluído - 27/10/2025
