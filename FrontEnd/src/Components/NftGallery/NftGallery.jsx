import { useState, useEffect } from 'react';
import styled from 'styled-components';
import CollectionModal from '../CollectionModal/CollectionModal';

const Container = styled.div`
  max-width: 1200px;
  margin: 40px auto;
  padding: 30px;
`;

const Title = styled.h2`
  font-size: 2em;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 30px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`;

const NftCard = styled.div`
  background: rgba(30, 30, 31, 0.8);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  position: relative;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
    border-color: #667eea;
  }
`;

const AddCollectionButton = styled.button`
  position: absolute;
  left: 12px;
  bottom: 12px;
  padding: 8px 10px;
  font-size: 0.85em;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.2);
  color: white;
  background: rgba(0,0,0,0.35);
  backdrop-filter: blur(6px);
  cursor: pointer;
  transition: all .2s;

  &:hover {
    background: rgba(0,0,0,0.5);
    border-color: rgba(255,255,255,0.35);
  }
`;

const CollectionTagButton = styled(AddCollectionButton)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 70%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DropdownMenu = styled.div`
  position: absolute;
  left: 12px;
  bottom: 50px;
  background: rgba(20,20,21,0.98);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  min-width: 200px;
  box-shadow: 0 10px 24px rgba(0,0,0,0.35);
  z-index: 101;
  overflow: hidden;
`;

const DropdownItem = styled.button`
  display: block;
  width: 100%;
  padding: 10px 12px;
  background: transparent;
  color: rgba(255,255,255,0.9);
  border: none;
  text-align: left;
  font-size: 0.95em;
  cursor: pointer;

  &:hover {
    background: rgba(255,255,255,0.06);
  }
`;

const NftImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
`;

const NftInfo = styled.div`
  padding: 16px;
`;

const NftName = styled.h3`
  font-size: 1.2em;
  margin: 0 0 8px 0;
  color: white;
`;

const NftPrompt = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9em;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const NftDate = styled.p`
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.8em;
  margin: 0;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 60px;
`;

const Spinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.1em;
`;

const ErrorMessage = styled.div`
  padding: 16px;
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 8px;
  color: #ff6b6b;
  margin: 20px 0;
`;

const Toast = styled.div`
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  background: ${p => p.$type === 'error' ? 'rgba(255, 77, 77, 0.15)' : 'rgba(16, 185, 129, 0.15)'};
  border: 1px solid ${p => p.$type === 'error' ? 'rgba(255, 77, 77, 0.4)' : 'rgba(16, 185, 129, 0.4)'};
  color: ${p => p.$type === 'error' ? '#ff6b6b' : '#34d399'};
  padding: 10px 16px;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.35);
  z-index: 200;
`;

const RefreshButton = styled.button`
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 20px;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const FloatingButton = styled.button`
  position: fixed;
  bottom: 32px;
  right: 32px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 100;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.6);
  }

  &:active {
    transform: translateY(-2px);
  }
`;

function NftGallery() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedNft, setSelectedNft] = useState(null);
  const [openDropdownNftId, setOpenDropdownNftId] = useState(null);
  const [collectionNames, setCollectionNames] = useState({}); // { [collection_id]: name }
  const [toast, setToast] = useState(null); // { message, type }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2200);
  };

  const fetchNfts = async () => {
    setLoading(true);
    setError(null);

    try {
      const userId = localStorage.getItem('creatorId');
      
      console.log('🔍 User ID do localStorage:', userId);
      
      if (!userId) {
        setError('Você precisa estar logado para ver seus NFTs');
        setLoading(false);
        return;
      }

      const url = `http://localhost:3001/api/leonardo/list?userId=${userId}`;
      console.log('📡 Fazendo requisição para:', url);
      
      let response = await fetch(url);
      let data = await response.json();

      console.log('📦 Dados recebidos:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao carregar NFTs');
      }

      // Se não há NFTs do usuário, mostra todos como fallback (melhor UX)
      if ((data.nfts || []).length === 0) {
        console.log('⚠️ Nenhum NFT do usuário. Buscando todos para exibir...');
        response = await fetch('http://localhost:3001/api/leonardo/list');
        data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Erro ao carregar NFTs');
      }

      setNfts(data.nfts || []);
    } catch (err) {
      console.error('❌ Erro ao buscar NFTs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNfts();
  }, []);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const onDocClick = () => setOpenDropdownNftId(null);
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  // Carrega nomes das coleções para mostrar no selo do card
  useEffect(() => {
    let active = true;
    async function loadNames() {
      try {
        const res = await fetch('http://localhost:3001/api/collections/list');
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erro ao carregar coleções');
        if (!active) return;
        const map = {};
        (data.collections || []).forEach(c => { map[c.collection_id] = c.name; });
        setCollectionNames(map);
      } catch {
        // silencioso
      }
    }
    loadNames();
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <Spinner />
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Title>🖼️ Minha Galeria</Title>
      <Subtitle>
        {nfts.length} NFT{nfts.length !== 1 ? 's' : ''} criado{nfts.length !== 1 ? 's' : ''} por você
      </Subtitle>

      <RefreshButton onClick={fetchNfts}>
        🔄 Atualizar
      </RefreshButton>

      {error && (
        <ErrorMessage>
          ❌ {error}
        </ErrorMessage>
      )}

      {nfts.length === 0 && !error && (
        <EmptyState>
          Você ainda não criou nenhum NFT. Comece agora!
        </EmptyState>
      )}

      <Grid>
        {nfts.map((nft) => (
          <NftCard key={nft.nft_id}>
            <FallbackImage nft={nft} />
            {nft.collection_id ? (
              <>
                <CollectionTagButton
                  type="button"
                  title={collectionNames[nft.collection_id] || 'Coleção'}
                  onClick={(e) => { e.stopPropagation(); setOpenDropdownNftId(prev => prev === nft.nft_id ? null : nft.nft_id); }}
                >
                  📂 {collectionNames[nft.collection_id] || 'Coleção'} ▾
                </CollectionTagButton>
                {openDropdownNftId === nft.nft_id && (
                  <DropdownMenu onClick={(e) => e.stopPropagation()}>
                    <DropdownItem onClick={() => { setOpenDropdownNftId(null); setSelectedNft(nft); setIsAssignModalOpen(true); }}>
                      Alterar coleção…
                    </DropdownItem>
                    <DropdownItem onClick={async () => {
                      try {
                        setOpenDropdownNftId(null);
                        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                        const res = await fetch(`http://localhost:3001/api/leonardo/${nft.nft_id}/collection`, {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                          },
                          body: JSON.stringify({ collection_id: null })
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.message || 'Erro ao remover da coleção');
                        await fetchNfts();
                        showToast('Removido da coleção');
                      } catch (err) {
                        setError(err.message);
                        showToast(err.message, 'error');
                      }
                    }}>
                      Remover da coleção
                    </DropdownItem>
                  </DropdownMenu>
                )}
              </>
            ) : (
              <AddCollectionButton
                type="button"
                title="Adicionar a uma coleção"
                onClick={(e) => { e.stopPropagation(); setSelectedNft(nft); setIsAssignModalOpen(true); }}
              >
                ➕ Coleção
              </AddCollectionButton>
            )}
            <NftInfo>
              <NftName>{nft.name}</NftName>
              <NftPrompt>{nft.prompt}</NftPrompt>
              <NftDate>
                {new Date(nft.created_at).toLocaleDateString('pt-BR')}
              </NftDate>
            </NftInfo>
          </NftCard>
        ))}
      </Grid>

      <FloatingButton onClick={() => setIsCollectionModalOpen(true)}>
        ➕ Criar Coleção
      </FloatingButton>

      <CollectionModal 
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        onSelect={(collection) => {
          console.log('Coleção criada:', collection);
          setIsCollectionModalOpen(false);
        }}
      />

      {/* Modal para atribuir um NFT a uma coleção */}
      <CollectionModal
        isOpen={isAssignModalOpen}
        onClose={() => { setIsAssignModalOpen(false); setSelectedNft(null); }}
        onSelect={async (collection) => {
          try {
            if (!selectedNft) return;
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const res = await fetch(`http://localhost:3001/api/leonardo/${selectedNft.nft_id}/collection`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              },
              body: JSON.stringify({ collection_id: collection?.collection_id || null })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Erro ao atribuir coleção');
            console.log('✅ NFT adicionado à coleção:', data);
            setIsAssignModalOpen(false);
            setSelectedNft(null);
            setOpenDropdownNftId(null);
            // Recarrega a galeria para refletir na aba Collections também
            await fetchNfts();
            if (collection?.collection_id && collection?.name) {
              setCollectionNames(prev => ({ ...prev, [collection.collection_id]: collection.name }));
              showToast(`Adicionado à coleção: ${collection.name}`);
            } else {
              showToast('Coleção atualizada');
            }
          } catch (err) {
            console.error('❌ Falha ao adicionar à coleção:', err);
            setError(err.message);
            showToast(err.message, 'error');
          }
        }}
      />

      {toast && (
        <Toast $type={toast.type}>{toast.message}</Toast>
      )}
    </Container>
  );
}

export default NftGallery;

// --- Utilidades de imagem com fallback de gateways ---
function extractCidFromUrl(url) {
  try {
    if (!url) return null;
    // ipfs://CID
    if (url.startsWith('ipfs://')) {
      return url.replace('ipfs://', '').split('/')[0];
    }
    const u = new URL(url, window.location.origin);
    // Formatos comuns: https://gateway.pinata.cloud/ipfs/CID[/path]
    const parts = u.pathname.split('/').filter(Boolean);
    const ipfsIdx = parts.indexOf('ipfs');
    if (ipfsIdx >= 0 && parts.length > ipfsIdx + 1) {
      return parts[ipfsIdx + 1];
    }
    // custom gateways podem usar /ipfs/ também; acima cobre.
    return null;
  } catch {
    return null;
  }
}

function buildCandidateUrls(nft) {
  const urls = [];
  const base = import.meta?.env?.VITE_API_BASE || 'http://localhost:3001';
  const img = nft?.image_url || nft?.imageUrl || '';

  // Se for caminho local
  if (img && img.startsWith('/uploads/')) {
    urls.push(`${base}${img}`);
  }

  // Se já for uma URL absoluta, tenta como primeira opção
  if (img && /^https?:\/\//i.test(img)) {
    urls.push(img);
  }

  // Se conseguirmos extrair o CID, gera gateways alternativos
  const cid = extractCidFromUrl(img) || nft?.ipfs_hash || nft?.ipfsHash || null;
  if (cid) {
    urls.push(
      `https://gateway.pinata.cloud/ipfs/${cid}`,
      `https://ipfs.io/ipfs/${cid}`,
      `https://cloudflare-ipfs.com/ipfs/${cid}`
    );
    // Se o usuário tiver um subdomínio mypinata.cloud, podemos tentar também
    const custom = import.meta?.env?.VITE_PINATA_SUBDOMAIN; // ex: sapphire-added-...mypinata.cloud
    if (custom) {
      urls.push(`https://${custom}/ipfs/${cid}`);
    }
  }

  // Remove duplicados preservando ordem
  return Array.from(new Set(urls.filter(Boolean)));
}

function FallbackImage({ nft }) {
  const candidates = buildCandidateUrls(nft);
  const [idx, setIdx] = useState(0);
  const src = candidates[idx] || '';

  return (
    <NftImage
      src={src}
      alt={nft?.name || 'NFT'}
      onError={() => {
        // Avança para o próximo candidato se houver erro
        setIdx((i) => (i + 1 < candidates.length ? i + 1 : i));
      }}
    />
  );
}
