const ngrok = require('ngrok');
const { spawn } = require('child_process');
require('dotenv').config();

async function start() {
  console.log('🚀 Iniciando backend...\n');
  
  // Inicia o servidor backend
  const server = spawn('node', ['server.js'], { 
    stdio: 'inherit',
    env: { ...process.env }
  });

  // Aguarda o servidor subir
  await new Promise(resolve => setTimeout(resolve, 3000));

  try {
    // Configuração do ngrok
    const ngrokConfig = {
      addr: process.env.PORT || 3001,
      authtoken: process.env.NGROK_TOKEN // opcional
    };

    console.log('🌐 Criando túnel ngrok...\n');
    const url = await ngrok.connect(ngrokConfig);

    console.log('✅ Backend disponível em:');
    console.log(`   🏠 Local:  http://localhost:${ngrokConfig.addr}`);
    console.log(`   🌍 Ngrok:  ${url}`);
    console.log('\n📝 Use a URL do Ngrok no frontend para acessar de qualquer lugar.');
    console.log('💡 Dica: Adicione NGROK_TOKEN no .env para usar recursos premium.\n');

    // Cleanup ao fechar (Ctrl+C)
    process.on('SIGINT', async () => {
      console.log('\n\n🛑 Encerrando servidor e túnel ngrok...');
      await ngrok.kill();
      server.kill();
      process.exit(0);
    });

    // Se o servidor backend cair
    server.on('exit', async (code) => {
      console.log(`\n⚠️  Backend encerrado com código ${code}`);
      await ngrok.kill();
      process.exit(code);
    });

  } catch (error) {
    console.error('❌ Erro ao criar túnel ngrok:', error.message);
    server.kill();
    process.exit(1);
  }
}

// Inicia tudo
start().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
