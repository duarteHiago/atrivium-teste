#!/usr/bin/env node
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');
const logoPath = path.join(publicDir, 'logo.png');

async function createLargeFavicon() {
  try {
    console.log('🔧 Criando favicon GRANDE...');
    
    // Criar um favicon.ico de 64x64 (maior que o padrão de 32x32)
    const icoPath = path.join(publicDir, 'favicon.ico');
    
    await sharp(logoPath)
      .resize(64, 64, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(icoPath.replace('.ico', '.png'));
      
    // Copiar como .ico também
    await sharp(logoPath)
      .resize(48, 48, {
        fit: 'contain', 
        background: { r: 255, g: 255, b: 255, alpha: 1 } // Fundo branco para .ico
      })
      .png()
      .toFile(icoPath);
      
    console.log('✅ Favicon grande criado!');
    
    // Criar também uma versão EXTRA grande como fallback
    await sharp(logoPath)
      .resize(128, 128, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({ quality: 100, compressionLevel: 1 })
      .toFile(path.join(publicDir, 'favicon-xl.png'));
      
    console.log('✅ Favicon XL criado (128x128)!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

createLargeFavicon();