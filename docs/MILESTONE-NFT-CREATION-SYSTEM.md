# Milestone: Sistema de Criação de NFTs

**Status:** 🚧 Em Progresso  
**Data:** 27/10/2025  
**Responsável:** @duarteHiago

---

## 🎯 Objetivo

Criar sistema para geração de NFTs usando IA generativa, com integração blockchain e armazenamento descentralizado.

---

## 📊 Progresso

```
Fase 1: Interface Base      ████████████████████ 100% ✅
Fase 2: IA Generativa       ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Fase 3: Blockchain          ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Fase 4: IPFS                ░░░░░░░░░░░░░░░░░░░░   0% ⏳

Total:                      █████░░░░░░░░░░░░░░░  25%
```

---

## 📋 Fases

### ✅ Fase 1: Interface Base
**Concluída em 27/10/2025**

**Entregas:**
- ✅ Botão "+ Your NFT" na barra superior
- ✅ Página `/create-nft` com placeholder
- ✅ Navegação configurada
- ✅ Design responsivo

**Arquivos:**
- `FrontEnd/src/Components/CreateNFT/CreateNFT.jsx`
- `FrontEnd/src/Components/BarraSuperior/index.jsx`
- `FrontEnd/src/App.jsx`

**Doc:** [ISSUE-CREATE-NFT-BUTTON.md](./ISSUE-CREATE-NFT-BUTTON.md)

---

### ⏳ Fase 2: IA Generativa

**Tarefas:**
- [ ] Escolher API de IA (DALL-E / Stable Diffusion / Midjourney)
- [ ] Integrar API no backend
- [ ] Criar formulário de prompt
- [ ] Implementar preview de imagem
- [ ] Adicionar sistema de regeneração

---

### ⏳ Fase 3: Blockchain

**Tarefas:**
- [ ] Escolher blockchain (Polygon recomendado)
- [ ] Desenvolver smart contract ERC-721
- [ ] Integrar Web3.js/Ethers.js
- [ ] Conectar com MetaMask
- [ ] Implementar minting de NFT

**Contratos:**
- `NFTFactory.sol` - Criação de NFTs
- `Marketplace.sol` - Compra/venda (futuro)

---

### ⏳ Fase 4: IPFS

**Tarefas:**
- [ ] Configurar serviço de pinning (Pinata/NFT.Storage)
- [ ] Implementar upload de imagem
- [ ] Gerar metadata JSON
- [ ] Obter CID do IPFS
- [ ] Validar integridade

**Metadata ERC-721:**
```json
{
  "name": "NFT Name",
  "description": "Description",
  "image": "ipfs://QmHash...",
  "attributes": []
}
```

---

## 🛠️ Stack Técnica

**Frontend:**
- React 19.1.1
- React Router 6.14.0
- Styled Components 6.1.19
- Web3.js (a adicionar)

**Backend:**
- Node.js + Express
- PostgreSQL
- API de IA

**Blockchain:**
- Solidity (Smart Contracts)
- Polygon/Ethereum
- IPFS (Pinata)

---

## 📅 Próximos Passos

1. Definir API de IA a ser usada
2. Implementar backend para processar requisições
3. Criar formulário de criação no frontend
4. Desenvolver smart contracts
5. Integrar IPFS

---

**Última Atualização:** 27/10/2025
