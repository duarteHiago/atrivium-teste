#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const indexHtmlPath = path.join(__dirname, '..', 'index.html');

// HTML otimizado para ícones
const iconHtmlBlock = `  <!-- Favicons otimizados para máxima visibilidade -->
  <link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png">
  <link rel="icon" type="image/png" sizes="256x256" href="/favicon-256x256.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png">
  <link rel="icon" type="image/png" sizes="128x128" href="/favicon-128x128.png">
  <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png">
  <link rel="icon" type="image/png" sizes="64x64" href="/favicon-64x64.png">
  <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  
  <!-- Apple Touch Icon -->
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  
  <!-- Favicon clássico -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  
  <!-- Configurações adicionais para PWA -->
  <meta name="theme-color" content="#000000">
  <meta name="msapplication-TileColor" content="#000000">
  <meta name="msapplication-TileImage" content="/favicon-192x192.png">`;

async function updateHtmlFavicons() {
  try {
    console.log('📝 Atualizando HTML com novos favicons...');
    
    // Ler o arquivo HTML atual
    let htmlContent = await fs.readFile(indexHtmlPath, 'utf-8');
    
    // Encontrar e remover os favicons existentes
    const faviconRegex = /\s*<!--.*favicons?.*-->\s*[\s\S]*?(?=\s*<meta name="viewport"|<title>|<\/head>)/gi;
    const linkIconRegex = /\s*<link[^>]*(?:rel="icon"|rel="apple-touch-icon")[^>]*>\s*/gi;
    const metaThemeRegex = /\s*<meta[^>]*(?:name="theme-color"|name="msapplication-TileColor"|name="msapplication-TileImage")[^>]*>\s*/gi;
    
    // Remover favicons existentes
    htmlContent = htmlContent.replace(faviconRegex, '');
    htmlContent = htmlContent.replace(linkIconRegex, '');
    htmlContent = htmlContent.replace(metaThemeRegex, '');
    
    // Encontrar onde inserir os novos favicons (antes do </head>)
    const headCloseIndex = htmlContent.indexOf('</head>');
    if (headCloseIndex === -1) {
      throw new Error('Tag </head> não encontrada no HTML');
    }
    
    // Inserir os novos favicons
    const beforeHead = htmlContent.substring(0, headCloseIndex);
    const afterHead = htmlContent.substring(headCloseIndex);
    
    const updatedContent = beforeHead + '\n' + iconHtmlBlock + '\n' + afterHead;
    
    // Salvar o arquivo atualizado
    await fs.writeFile(indexHtmlPath, updatedContent, 'utf-8');
    
    console.log('✅ HTML atualizado com sucesso!');
    console.log('\n📋 Favicons adicionados:');
    console.log('   - 9 tamanhos PNG (16px a 512px)');
    console.log('   - 1 Apple Touch Icon (180px)');
    console.log('   - 1 Favicon ICO (clássico)');
    console.log('   - Meta tags PWA');
    
    console.log('\n🎯 Ordem de prioridade (maior → menor):');
    console.log('   512px → 256px → 192px → 128px → 96px → 64px → 48px → 32px → 16px');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar HTML:', error);
    process.exit(1);
  }
}

updateHtmlFavicons();