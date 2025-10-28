const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

/**
 * Serviço de Geração de Imagens com IA
 * Usa Hugging Face Inference API (gratuito com limites)
 */

class AIService {
  constructor() {
    this.apiKey = process.env.HUGGINGFACE_API_KEY;
    this.baseURL = 'https://api-inference.huggingface.co/models';

    // Conjunto de candidatos por estilo (primeiro preferido, demais são fallbacks)
    // Escolhemos modelos amplamente suportados pela Inference API para evitar 404/licenças
    this.modelCandidates = {
      'stable-diffusion': [
        'stabilityai/stable-diffusion-2-1',
        'runwayml/stable-diffusion-v1-5'
      ],
      'anime': [
        'Linaqruf/animagine-xl-3.1',
        'hakurei/waifu-diffusion'
      ],
      'realistic': [
        // Alguns modelos realistas são privados/gated e retornam 404/403.
        // Tente estes em ordem; sd-turbo é rápido e costuma funcionar.
        'SG161222/Realistic_Vision_V5.1_noVAE',
        'stabilityai/sd-turbo',
        'stabilityai/stable-diffusion-2-1'
      ]
    };
  }

  /**
   * Gera uma imagem usando IA
   * @param {string} prompt - Descrição da imagem desejada
   * @param {string} style - Estilo do modelo (stable-diffusion, anime, realistic)
   * @returns {Promise<Buffer>} Buffer da imagem gerada
   */
  async generateImage(prompt, style = 'stable-diffusion') {
    const candidates = this.modelCandidates[style] || this.modelCandidates['stable-diffusion'];
    const errors = [];

    for (const model of candidates) {
      try {
        console.log(`Gerando imagem com modelo: ${model}`);
        console.log(`Prompt: ${prompt}`);

        const response = await axios.post(
          `${this.baseURL}/${model}`,
          {
            inputs: prompt,
            options: { wait_for_model: true }
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer',
            timeout: 60000
          }
        );

        return Buffer.from(response.data);
      } catch (error) {
        const status = error?.response?.status;
        const detail = error?.response?.data?.toString?.() || error.message;
        console.error('Erro da API Hugging Face:', status);
        console.error('Detalhes:', detail);

        // 503 = modelo carregando -> pequeno retry no MESMO modelo
        if (status === 503) {
          console.log('Modelo está carregando, tentando novamente em 5s...');
          await new Promise(r => setTimeout(r, 5000));
          // retry simples uma vez
          try {
            const response = await axios.post(
              `${this.baseURL}/${model}`,
              { inputs: prompt, options: { wait_for_model: true } },
              {
                headers: {
                  'Authorization': `Bearer ${this.apiKey}`,
                  'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer',
                timeout: 60000
              }
            );
            return Buffer.from(response.data);
          } catch (e2) {
            errors.push({ model, status: e2?.response?.status, message: e2.message });
            continue; // tenta próximo candidato
          }
        }

        // 404/403 normalmente indica modelo privado/gated/indisponível -> tentar próximo
        if (status === 404 || status === 403) {
          console.log(`Modelo ${model} indisponível (${status}). Tentando próximo candidato...`);
          errors.push({ model, status, message: detail });
          continue;
        }

        // Outros erros: registra e tenta próximo
        errors.push({ model, status, message: detail });
        continue;
      }
    }

    // Se chegou aqui, todos candidatos falharam: gerar um placeholder para não travar o fluxo
    const summary = errors.map(e => `${e.model} -> ${e.status || 'ERR'}: ${e.message}`).join(' | ');
    console.warn('Nenhum modelo respondeu com sucesso. Gerando imagem placeholder local com Sharp.');
    return this.generatePlaceholderImage(prompt, style, summary);
  }

  /**
   * Gera uma imagem placeholder local (SVG -> PNG via sharp) quando a IA não está disponível
   * Isso evita quebrar o fluxo de teste/local
   */
  async generatePlaceholderImage(prompt, style, reason = '') {
    const width = 1024;
    const height = 1024;
      const safe = (s = '') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
      const promptText = safe((prompt || '').slice(0, 240));
    const reasonText = safe((reason || '').slice(0, 160));

    // Wrap prompt text into multiple lines to ensure it influences the image hash
    const wrap = (text, max = 48, maxLines = 4) => {
      const words = text.split(/\s+/);
      const out = [];
      let cur = '';
      for (const w of words) {
        const next = cur ? cur + ' ' + w : w;
        if (next.length > max) {
          if (cur) out.push(cur);
          cur = w;
          if (out.length >= maxLines - 1) break;
        } else {
          cur = next;
        }
      }
      if (out.length < maxLines && cur) out.push(cur);
      return out;
    };
    const lines = wrap(promptText, 48, 4);

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f2027"/>
      <stop offset="50%" stop-color="#203a43"/>
      <stop offset="100%" stop-color="#2c5364"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <g fill="#ffffff" font-family="Segoe UI, Roboto, Arial" text-anchor="middle">
    <text x="50%" y="140" font-size="48" font-weight="bold">Placeholder Preview</text>
    <text x="50%" y="210" font-size="28">IA indisponível – usando imagem local</text>
    <text x="50%" y="270" font-size="22">style: ${safe(style)}</text>
  </g>
    <g fill="#ffffff" font-family="Segoe UI, Arial" font-size="26" opacity="0.9">
      ${lines.map((ln, idx) => `<text x="100" y="${360 + idx * 36}">${ln}</text>`).join('')}
    </g>
  <g fill="#d0d8dc" font-family="Consolas, Menlo, monospace" font-size="18">
    <text x="40" y="980">${reasonText}</text>
  </g>
  <rect x="60" y="360" width="904" height="360" fill="none" stroke="#9bb1bd" stroke-width="2" opacity="0.35"/>
  <circle cx="912" cy="140" r="10" fill="#27ae60"/>
  <text x="934" y="146" fill="#27ae60" font-family="Consolas, monospace" font-size="18">OK</text>
  <text x="60" y="940" fill="#9bb1bd" font-family="Consolas, monospace" font-size="18">tokenization-ready</text>
  <text x="60" y="910" fill="#9bb1bd" font-family="Consolas, monospace" font-size="18">atrivium-teste</text>
  <text x="60" y="880" fill="#9bb1bd" font-family="Consolas, monospace" font-size="18">preview generated locally</text>
</svg>`;

    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
    return pngBuffer;
  }

  /**
   * Salva a imagem gerada no disco
   * @param {Buffer} imageBuffer - Buffer da imagem
   * @param {string} filename - Nome do arquivo
   * @returns {Promise<string>} Caminho do arquivo salvo
   */
  async saveImage(imageBuffer, filename) {
    const uploadsDir = path.join(__dirname, '../../uploads');
    const filepath = path.join(uploadsDir, filename);

    // Garante que o diretório existe
    await fs.mkdir(uploadsDir, { recursive: true });

    // Salva o arquivo
    await fs.writeFile(filepath, imageBuffer);

    return filepath;
  }

  /**
   * Gera um prompt melhorado baseado na descrição do usuário
   * @param {string} userPrompt - Prompt do usuário
   * @param {string} style - Estilo desejado
   * @returns {string} Prompt otimizado
   */
  enhancePrompt(userPrompt, style) {
    const styleEnhancements = {
      'stable-diffusion': 'high quality, detailed, 4k, digital art',
      'anime': 'anime style, highly detailed, vibrant colors, masterpiece',
      'realistic': 'photorealistic, highly detailed, professional photography, 8k'
    };

    const enhancement = styleEnhancements[style] || styleEnhancements['stable-diffusion'];
    return `${userPrompt}, ${enhancement}`;
  }

  /**
   * Lista os estilos disponíveis
   * @returns {Array} Lista de estilos
   */
  getAvailableStyles() {
    return Object.keys(this.modelCandidates).map(key => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1).replace('-', ' '),
      model: this.modelCandidates[key][0] // modelo preferido
    }));
  }
}

module.exports = new AIService();
