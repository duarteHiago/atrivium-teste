# Issue: Componente de Criação de NFTs no Frontend

**Labels:** `enhancement`, `frontend`, `ui/ux`  
**Assignees:** @duarteHiago

---

## 📋 Descrição

Implementar interface completa para criação de NFTs com geração de imagens por IA, incluindo formulário, preview em tempo real e exibição de dados de tokenização.

---

## ✅ Implementado

### Componente: `CreateNFT.jsx`

**Funcionalidades:**
- Formulário com campos: nome, descrição, prompt e estilo de arte
- Botão "Gerar Preview" → chama API e exibe imagem gerada
- Botão "Criar NFT" → tokeniza e salva no banco
- Estados de loading e feedback visual
- Exibição de Token ID, Image Hash e Certificate Hash após criação
- Design responsivo (grid 2 colunas desktop, 1 coluna mobile)

**Integrações:**
- `POST /api/nft/generate-preview` - Gera imagem com IA
- `POST /api/nft/create` - Cria NFT tokenizado
- Rota `/create-nft` configurada no React Router
- Botão "+ Your NFT" na BarraSuperior

---

## 📝 Arquivos

```
✅ FrontEnd/src/Components/CreateNFT/CreateNFT.jsx (CRIADO)
✅ FrontEnd/src/Components/BarraSuperior/index.jsx (MODIFICADO)
✅ FrontEnd/src/App.jsx (MODIFICADO)
```

---

**Status:** ✅ Concluído - 27/10/2025
