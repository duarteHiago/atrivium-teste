# 🌐 Sistema de Gerenciamento de Imagens IPFS

Este sistema permite fazer upload, visualizar e gerenciar imagens armazenadas no IPFS via Pinata.

## 🚀 Como Usar

### 1. Acessar o IPFS Manager
- Navegue para `/ipfs` no aplicativo
- Ou use o link "🌐 IPFS Manager" na barra lateral

### 2. Fazer Upload de Imagens
1. Clique na aba "📤 Upload"
2. Arraste e solte imagens ou clique para selecionar
3. Preencha os metadados (categoria, tags, descrição)
4. Clique em "📤 Enviar"

### 3. Visualizar Galeria
1. Clique na aba "📁 Galeria"
2. Use a busca para encontrar imagens específicas
3. Filtre por categoria (NFT, Avatar, Coleção, etc.)
4. Clique em ações para copiar URL, abrir ou remover

## 🔧 Funcionalidades

### Frontend
- **PinataService**: Serviço para comunicação com API
- **usePinataImages**: Hook para gerenciar estado das imagens
- **PinataGallery**: Componente de galeria com busca e filtros
- **PinataUpload**: Componente de upload com drag & drop
- **IPFSManager**: Página completa combinando upload e galeria

### Backend (já existente)
- **Upload**: `/api/ipfs/upload`
- **Listar**: `/api/ipfs/list`
- **Remover**: `/api/ipfs/unpin/:hash`
- **Testar**: `/api/ipfs/test`

## 📋 Exemplos de Uso

### Usando o Serviço Diretamente

```javascript
import PinataService from '../services/pinata.service';

// Listar todas as imagens
const images = await PinataService.listImages(50);

// Buscar NFTs
const nftImages = await PinataService.getNFTImages();

// Upload de imagem
const file = document.getElementById('fileInput').files[0];
const result = await PinataService.uploadImage(file, {
  name: 'Minha NFT',
  category: 'nft',
  description: 'Uma NFT incrível'
});

// Remover imagem
await PinataService.removeImage('QmHashDaImagem');
```

### Usando o Hook

```javascript
import { usePinataImages } from '../hooks/usePinataImages';

function MeuComponente() {
  const {
    images,
    loading,
    error,
    uploadImage,
    removeImage,
    refresh
  } = usePinataImages('nft'); // Filtra apenas NFTs

  // Componente automaticamente carrega e gerencia estado
}
```

### Integrando com Outros Componentes

```javascript
// Seletor de imagem para criar NFT
<PinataGallery
  category="nft"
  onImageSelect={(image) => {
    setNftImage(image.url);
  }}
/>

// Upload rápido
<PinataUpload
  category="avatar"
  onUploadSuccess={(results) => {
    console.log('Imagens enviadas:', results);
  }}
/>
```

## 🎨 Categorias Suportadas

- **general**: Imagens gerais
- **nft**: Imagens de NFT
- **avatar**: Avatares de usuário
- **collection**: Imagens de coleções
- **banner**: Banners e capas

## 🔒 Configuração Necessária

Certifique-se de que as variáveis de ambiente estejam configuradas no backend:

```env
PINATA_API_KEY=sua_chave_api
PINATA_SECRET_API_KEY=sua_chave_secreta
PINATA_JWT=seu_jwt_token
```

## 📊 Estatísticas

O IPFS Manager exibe estatísticas em tempo real:
- Total de imagens
- Espaço usado
- Uploads da sessão atual
- NFTs criados

## 🎯 Próximas Funcionalidades

- [ ] Categorização automática por AI
- [ ] Compressão de imagens antes do upload
- [ ] Backup automático para outros gateways IPFS
- [ ] Integração com MetaMask para assinatura de uploads
- [ ] Sistema de tags avançado
- [ ] Histórico de uploads por usuário

## 🐛 Troubleshooting

### Imagens não carregam
1. Verifique se o Pinata está configurado corretamente
2. Teste a conexão na aba de status
3. Verifique se as chaves API estão válidas

### Upload falha
1. Verifique o tamanho do arquivo (máx. 10MB)
2. Confirme que é um formato de imagem suportado
3. Verifique a conexão com internet

### Performance lenta
1. Reduza o limite de imagens na galeria
2. Use filtros para reduzir o número de resultados
3. Considere usar imagens menores