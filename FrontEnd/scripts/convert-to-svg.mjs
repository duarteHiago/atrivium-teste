#!/usr/bin/env node
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertToSvg() {
  try {
    const publicDir = path.join(__dirname, '..', 'public');
    const logoPath = path.join(publicDir, 'logo.png');
    const svgPath = path.join(publicDir, 'logo.svg');
    
    console.log('🔄 Convertendo PNG para SVG...');
    
    // Ler o PNG como buffer
    const pngBuffer = await sharp(logoPath).png().toBuffer();
    const base64 = pngBuffer.toString('base64');
    
    // Criar SVG com o PNG embedado
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     width="500" height="500" viewBox="0 0 500 500">
  <image width="500" height="500" xlink:href="data:image/png;base64,${base64}"/>
</svg>`;
    
    // Salvar SVG
    await fs.writeFile(svgPath, svgContent);
    
    console.log('✅ Logo convertido para SVG com sucesso!');
    console.log('📁 Arquivo criado: logo.svg');
    
    return svgPath;
    
  } catch (error) {
    console.error('❌ Erro ao converter:', error);
    throw error;
  }
}

convertToSvg();