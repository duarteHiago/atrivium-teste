const aiService = require('../services/ai.service');
const tokenizationService = require('../services/tokenization.service');
const path = require('path');

/**
 * Controller para operações de NFT
 */

class NFTController {
  /**
   * Gera uma imagem com IA (preview antes de criar o NFT)
   * POST /api/nft/generate-preview
   */
  async generatePreview(req, res) {
    try {
      const { prompt, style = 'stable-diffusion' } = req.body;

      if (!prompt) {
        return res.status(400).json({
          success: false,
          message: 'Prompt é obrigatório'
        });
      }

      // Melhora o prompt
      const enhancedPrompt = aiService.enhancePrompt(prompt, style);

      // Gera a imagem
      const imageBuffer = await aiService.generateImage(enhancedPrompt, style);

      // Converte para base64 para enviar ao frontend
      const base64Image = imageBuffer.toString('base64');

      res.json({
        success: true,
        data: {
          image: `data:image/png;base64,${base64Image}`,
          prompt: enhancedPrompt,
          style
        }
      });

    } catch (error) {
      console.error('Erro ao gerar preview:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao gerar imagem'
      });
    }
  }

  /**
   * Cria um NFT completo com tokenização
   * POST /api/nft/create
   */
  async createNFT(req, res) {
    const pool = req.app.locals.pool; // Pool de conexão com o DB

    try {
      const {
        name,
        description,
        prompt,
        style = 'stable-diffusion',
        imageBase64, // Imagem já gerada enviada como base64
        creatorId,
        attributes = []
      } = req.body;

      // Validações
      if (!name || !description || !prompt || !imageBase64) {
        return res.status(400).json({
          success: false,
          message: 'Campos obrigatórios: name, description, prompt, imageBase64'
        });
      }

      // Converte base64 para buffer
      const imageBuffer = Buffer.from(
        imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        'base64'
      );

      // Gera hash da imagem
      const imageHash = tokenizationService.generateImageHash(imageBuffer);

      // Verifica se a imagem já existe (unicidade)
      const isUnique = await tokenizationService.verifyImageUniqueness(imageHash, pool);
      if (!isUnique) {
        return res.status(409).json({
          success: false,
          message: 'Esta imagem já foi tokenizada como NFT'
        });
      }

      // Gera token ID único
      const tokenId = tokenizationService.generateTokenId();

      // Salva a imagem no disco
      const filename = `${tokenId}.png`;
      const filepath = await aiService.saveImage(imageBuffer, filename);
      const imageUrl = `/uploads/${filename}`; // URL relativa

      // Normaliza creatorId (opcional). Se vier vazio/undefined, mantém null
      const creatorIdValue = creatorId && String(creatorId).trim() !== '' ? creatorId : null;

      // Gera certificado digital
      const certificate = tokenizationService.generateCertificate({
        tokenId,
        imageHash,
        name,
        description,
        creator: creatorIdValue,
        createdAt: new Date()
      });

      // Gera metadata no formato ERC-721
      const metadata = tokenizationService.generateMetadata({
        tokenId,
        name,
        description,
        imageUrl,
        imageHash,
        creator: creatorIdValue,
        attributes
      });

      // Insere no banco de dados
      const insertQuery = `
        INSERT INTO nfts (
          token_id, name, description, prompt, style,
          image_hash, certificate_hash, image_url,
          metadata, creator_id, current_owner_id,
          network, status, is_verified
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `;

      const values = [
        tokenId,
        name,
        description,
        prompt,
        style,
        imageHash,
        certificate.certificateHash,
        imageUrl,
        JSON.stringify(metadata),
        creatorIdValue,
        creatorIdValue, // Owner inicial é o creator (se fornecido)
        'off-chain',
        'created',
        true
      ];

      const result = await pool.query(insertQuery, values);
      const nft = result.rows[0];

      // Registra a criação no histórico de transferências (apenas se houver creatorId)
      if (creatorIdValue) {
        const transferQuery = `
          INSERT INTO nft_transfers (nft_id, to_user_id, transfer_type)
          VALUES ($1, $2, $3)
        `;
        await pool.query(transferQuery, [nft.nft_id, creatorIdValue, 'mint']);
      }

      // Retorna o NFT criado com o certificado
      res.status(201).json({
        success: true,
        data: {
          nft: {
            id: nft.nft_id,
            tokenId: nft.token_id,
            name: nft.name,
            description: nft.description,
            imageUrl: nft.image_url,
            imageHash: nft.image_hash,
            status: nft.status,
            createdAt: nft.created_at
          },
          certificate,
          metadata
        },
        message: 'NFT criado com sucesso!'
      });

    } catch (error) {
      console.error('Erro ao criar NFT:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao criar NFT'
      });
    }
  }

  /**
   * Lista todos os NFTs ou filtrados
   * GET /api/nft/list
   */
  async listNFTs(req, res) {
    const pool = req.app.locals.pool;

    try {
      const { creatorId, ownerId, status, limit = 50, offset = 0 } = req.query;

      let query = `
        SELECT 
          n.*,
          u1.first_name as creator_name,
          u2.first_name as owner_name
        FROM nfts n
        LEFT JOIN users u1 ON n.creator_id = u1.user_id
        LEFT JOIN users u2 ON n.current_owner_id = u2.user_id
        WHERE 1=1
      `;
      const values = [];
      let paramCount = 0;

      if (creatorId) {
        paramCount++;
        query += ` AND n.creator_id = $${paramCount}`;
        values.push(creatorId);
      }

      if (ownerId) {
        paramCount++;
        query += ` AND n.current_owner_id = $${paramCount}`;
        values.push(ownerId);
      }

      if (status) {
        paramCount++;
        query += ` AND n.status = $${paramCount}`;
        values.push(status);
      }

      query += ` ORDER BY n.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      values.push(limit, offset);

      const result = await pool.query(query, values);

      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length
      });

    } catch (error) {
      console.error('Erro ao listar NFTs:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao listar NFTs'
      });
    }
  }

  /**
   * Busca um NFT específico pelo token ID
   * GET /api/nft/:tokenId
   */
  async getNFT(req, res) {
    const pool = req.app.locals.pool;

    try {
      const { tokenId } = req.params;

      const query = `
        SELECT 
          n.*,
          u1.first_name || ' ' || u1.last_name as creator_name,
          u1.email as creator_email,
          u2.first_name || ' ' || u2.last_name as owner_name
        FROM nfts n
        LEFT JOIN users u1 ON n.creator_id = u1.user_id
        LEFT JOIN users u2 ON n.current_owner_id = u2.user_id
        WHERE n.token_id = $1
      `;

      const result = await pool.query(query, [tokenId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'NFT não encontrado'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Erro ao buscar NFT:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar NFT'
      });
    }
  }

  /**
   * Lista estilos disponíveis de IA
   * GET /api/nft/styles
   */
  async getStyles(req, res) {
    try {
      const styles = aiService.getAvailableStyles();
      res.json({
        success: true,
        data: styles
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new NFTController();
