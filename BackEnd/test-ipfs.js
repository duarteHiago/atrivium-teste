// Script para testar endpoints IPFS sem travar o servidor
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testar() {
  console.log('🧪 Testando integração Pinata IPFS\n');
  
  try {
    // Teste 1: Ping
    console.log('1️⃣ Testando /api/ipfs/ping...');
    const ping = await axios.get(`${BASE_URL}/api/ipfs/ping`);
    console.log('✅ Ping:', ping.data);
    console.log('');
    
    // Teste 2: Autenticação Pinata
    console.log('2️⃣ Testando /api/ipfs/test...');
    const test = await axios.get(`${BASE_URL}/api/ipfs/test`);
    console.log('✅ Pinata conectado:', test.data);
    console.log('');
    
    // Teste 3: Listar pins
    console.log('3️⃣ Testando /api/ipfs/list...');
    const list = await axios.get(`${BASE_URL}/api/ipfs/list`);
    console.log(`✅ Arquivos pinados: ${list.data.count} encontrados`);
    console.log('');
    
    console.log('🎉 Todos os testes passaram com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Verificar se servidor está rodando
axios.get(`${BASE_URL}/api/ipfs/ping`)
  .then(() => testar())
  .catch(() => {
    console.error('❌ Servidor não está rodando em http://localhost:3001');
    console.log('\n📌 Inicie o servidor primeiro:');
    console.log('   cd BackEnd');
    console.log('   npm run dev');
    process.exit(1);
  });
