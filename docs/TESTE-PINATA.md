# 🧪 Como Testar a Integração Pinata

## ⚠️ Problema Conhecido

O PowerShell `Invoke-RestMethod` e `curl` travam o servidor Node quando usado com nodemon. Use uma das alternativas abaixo:

## ✅ Opções de Teste

### 1. **Navegador (Mais Fácil)**

Abra no seu navegador:

```
http://localhost:3001/api/ipfs/ping
http://localhost:3001/api/ipfs/test
```

**Resultado esperado em `/test`:**
```json
{
  "success": true,
  "message": "Pinata conectado com sucesso",
  "data": {
    "message": "Congratulations! You are communicating with the Pinata API!"
  }
}
```

### 2. **Postman / Insomnia**

Importe as requisições:

```
GET http://localhost:3001/api/ipfs/test
GET http://localhost:3001/api/ipfs/list
```

### 3. **Frontend**

Teste direto do React:

```javascript
fetch('http://localhost:3001/api/ipfs/test')
  .then(r => r.json())
  .then(data => console.log(data));
```

### 4. **Node.js Script**

Crie `test-pinata.js`:

```javascript
const axios = require('axios');

axios.get('http://localhost:3001/api/ipfs/test')
  .then(r => console.log('✅ Sucesso:', r.data))
  .catch(e => console.error('❌ Erro:', e.message));
```

Execute:
```bash
node test-pinata.js
```

## 🎨 Teste Completo: Gerar NFT com IPFS

### Via Postman/Browser:

```http
POST http://localhost:3001/api/leonardo/generate-and-save
Content-Type: application/json
Authorization: Bearer SEU_TOKEN_JWT

{
  "prompt": "cyberpunk neon cat with sunglasses",
  "name": "Cool Cat NFT"
}
```

**O que acontece:**
1. ✅ Leonardo gera a imagem
2. ✅ Backend baixa a imagem
3. ✅ **Upload automático para Pinata IPFS**
4. ✅ Salva `ipfs_hash` no banco
5. ✅ Define `network='ipfs'`
6. ✅ `image_url` vira `https://gateway.pinata.cloud/ipfs/QmXxx...`

**Resposta esperada:**
```json
{
  "success": true,
  "nft": {
    "id": "uuid-aqui",
    "imageUrl": "https://gateway.pinata.cloud/ipfs/QmXxx...",
    "ipfsHash": "QmXxx...",
    "network": "ipfs"
  }
}
```

## ✅ Confirmação Manual (PowerShell)

Se precisar testar via terminal, **feche o nodemon primeiro**:

```powershell
# 1. Parar nodemon
Get-Process -Name node | Stop-Process -Force

# 2. Iniciar em modo normal (não-watch)
cd BackEnd
node server.js
```

Em **outro terminal**:
```powershell
curl http://localhost:3001/api/ipfs/test
```

## 📊 Verificar no Pinata Dashboard

1. Acesse: https://app.pinata.cloud/pinmanager
2. Veja seus arquivos pinados
3. Cada NFT gerado aparecerá listado

## 🔍 Verificar no Banco de Dados

```sql
SELECT nft_id, name, ipfs_hash, network, image_url
FROM nfts
WHERE ipfs_hash IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
```

Você verá:
- `ipfs_hash`: QmXxx... (CID do IPFS)
- `network`: 'ipfs'
- `image_url`: https://gateway.pinata.cloud/ipfs/QmXxx...

---

✅ **Integração Funcionando!** 

O teste direto via Node.js já confirmou que Pinata está conectado:
```
OK: { message: 'Congratulations! You are communicating with the Pinata API!' }
```
