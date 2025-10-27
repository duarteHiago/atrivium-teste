const express = require('express');
const router = express.Router();
const nftController = require('../controllers/nft.controller');

/**
 * Rotas para operações de NFT
 */

// Gerar preview de imagem com IA
router.post('/generate-preview', nftController.generatePreview.bind(nftController));

// Criar NFT completo com tokenização
router.post('/create', nftController.createNFT.bind(nftController));

// Listar NFTs (com filtros opcionais)
router.get('/list', nftController.listNFTs.bind(nftController));

// Buscar NFT específico por token ID
router.get('/:tokenId', nftController.getNFT.bind(nftController));

// Listar estilos disponíveis
router.get('/ai/styles', nftController.getStyles.bind(nftController));

module.exports = router;
