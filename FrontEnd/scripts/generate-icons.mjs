#!/usr/bin/env node
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Diretórios
const publicDir = path.join(__dirname, '..', 'public');
const logoPath = path.join(publicDir, 'logo.png');

// Tamanhos de ícones para gerar
const iconSizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 64, name: 'favicon-64x64.png' },
  { size: 96, name: 'favicon-96x96.png' },
  { size: 128, name: 'favicon-128x128.png' },
  { size: 192, name: 'favicon-192x192.png' },
  { size: 256, name: 'favicon-256x256.png' },
  { size: 512, name: 'favicon-512x512.png' },
];

// Tamanhos especiais
const appleTouchIcon = { size: 180, name: 'apple-touch-icon.png' };

async function generateIcons() {
  try {
    console.log('🎨 Iniciando geração de ícones...');
    
    // Verificar se o logo existe
    const logoExists = await fs.access(logoPath).then(() => true).catch(() => false);
    if (!logoExists) {
      console.error(`❌ Logo não encontrado em: ${logoPath}`);
      return;
    }

    console.log(`📁 Usando logo: ${logoPath}`);
    
    // Gerar ícones de diferentes tamanhos
    for (const icon of iconSizes) {
      const outputPath = path.join(publicDir, icon.name);
      
      await sharp(logoPath)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Fundo transparente
        })
        .png({ quality: 100, compressionLevel: 6 })
        .toFile(outputPath);
        
      console.log(`✅ Gerado: ${icon.name} (${icon.size}x${icon.size})`);
    }
    
    // Gerar Apple Touch Icon
    const appleIconPath = path.join(publicDir, appleTouchIcon.name);
    await sharp(logoPath)
      .resize(appleTouchIcon.size, appleTouchIcon.size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({ quality: 100, compressionLevel: 6 })
      .toFile(appleIconPath);
      
    console.log(`🍎 Gerado: ${appleTouchIcon.name} (${appleTouchIcon.size}x${appleTouchIcon.size})`);
    
    // Gerar favicon.ico (múltiplos tamanhos em um arquivo)
    const icoPath = path.join(publicDir, 'favicon.ico');
    
    // Criar buffers para diferentes tamanhos
    const ico16 = await sharp(logoPath).resize(16, 16).png().toBuffer();
    const ico32 = await sharp(logoPath).resize(32, 32).png().toBuffer();
    const ico48 = await sharp(logoPath).resize(48, 48).png().toBuffer();
    
    // Para o favicon.ico, vamos usar apenas o 32x32 por simplicidade
    await sharp(logoPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(icoPath.replace('.ico', '-temp.png'));
      
    console.log(`🔵 Gerado: favicon base (será convertido para .ico)`);
    
    console.log('\n🎉 Todos os ícones foram gerados com sucesso!');
    console.log('\n📋 Ícones criados:');
    iconSizes.forEach(icon => {
      console.log(`   - ${icon.name} (${icon.size}x${icon.size}px)`);
    });
    console.log(`   - ${appleTouchIcon.name} (${appleTouchIcon.size}x${appleTouchIcon.size}px)`);
    console.log(`   - favicon base para conversão ICO`);
    
    console.log('\n🚀 Execute agora: npm run icons:update-html');
    
  } catch (error) {
    console.error('❌ Erro ao gerar ícones:', error);
    process.exit(1);
  }
}

generateIcons();