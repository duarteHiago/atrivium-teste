#!/usr/bin/env node
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createOptimizedLogoFavicon() {
  try {
    const publicDir = path.join(__dirname, '..', 'public');
    const logoPath = path.join(publicDir, 'logo.png');
    const faviconSvgPath = path.join(publicDir, 'logo-favicon.svg');
    
    console.log('🎨 Criando SVG favicon com logo otimizada...');
    
    // Redimensionar logo para tamanho específico de favicon
    const optimizedBuffer = await sharp(logoPath)
      .resize(96, 96, { 
        fit: 'contain', 
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        kernel: sharp.kernel.lanczos3
      })
      .png({ quality: 100, compressionLevel: 1 })
      .toBuffer();
      
    const base64 = optimizedBuffer.toString('base64');
    
    // Criar SVG com logo embedada e dimensões forçadas para favicon
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <image width="96" height="96" href="data:image/png;base64,${base64}"/>
</svg>`;
    
    await fs.writeFile(faviconSvgPath, svgContent);
    
    console.log('✅ SVG favicon com logo criado!');
    console.log('📏 Dimensões: 96x96px (otimizado para máxima visibilidade)');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

createOptimizedLogoFavicon();