#!/usr/bin/env node
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createLargeFaviconSvg() {
  try {
    const publicDir = path.join(__dirname, '..', 'public');
    const logoPath = path.join(publicDir, 'logo.png');
    const faviconSvgPath = path.join(publicDir, 'favicon.svg');
    
    console.log('🔧 Criando SVG favicon GRANDE...');
    
    // Ler o PNG e redimensionar para ter certeza do tamanho
    const resizedBuffer = await sharp(logoPath)
      .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
      
    const base64 = resizedBuffer.toString('base64');
    
    // Criar SVG otimizado especificamente para favicon
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <image width="64" height="64" href="data:image/png;base64,${base64}"/>
</svg>`;
    
    await fs.writeFile(faviconSvgPath, svgContent);
    
    console.log('✅ Favicon SVG otimizado criado!');
    console.log('📏 Dimensões: 64x64px fixas');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

createLargeFaviconSvg();