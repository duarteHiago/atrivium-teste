import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import CollectionModal from '../CollectionModal/CollectionModal';
import FavoriteButton from '../FavoriteButton/FavoriteButton';
import { API_BASE } from '../../config/api';
import { useTheme } from '../../contexts/ThemeContext';

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
  color: ${props => props.theme.text.secondary};
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

const CollectionTag = styled.div`
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
  max-width: 70%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NftImage = styled.img`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
`;

const NftInfo = styled.div`
  padding: 16px;
`;

const NftFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px 16px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
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

// Removido: Toast e botões de dropdown/alteração de coleção (coleção é imutável após criação)

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
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [collectionNames, setCollectionNames] = useState({}); // { [collection_id]: name }

  const fetchNfts = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        setError('Você precisa estar logado para ver seus NFTs');
        setLoading(false);
        return;
      }

      const url = `${API_BASE}/api/users/me/gallery`;
      console.log('📡 Fazendo requisição para:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      console.log('📦 Dados recebidos:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao carregar NFTs');
      }

      setNfts(Array.isArray(data) ? data : (data.nfts || []));
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

  // Carrega nomes das coleções para mostrar no selo do card
  useEffect(() => {
    let active = true;
    async function loadNames() {
      try {
  const res = await fetch(`${API_BASE}/api/collections/list`);
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
      <Subtitle theme={theme}>
        {nfts.length} NFT{nfts.length !== 1 ? 's' : ''} que você possui
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
          Você ainda não possui nenhum NFT.
        </EmptyState>
      )}

      <Grid>
        {nfts.map((nft) => (
          <NftCard key={nft.nft_id} onClick={() => navigate(`/nft/${nft.nft_id}`)}>
            <NftImage src={nft.image_url} alt={nft.name} />
            {nft.collection_id && (
              <CollectionTag title={collectionNames[nft.collection_id] || 'Coleção'}>
                📂 {collectionNames[nft.collection_id] || 'Coleção'}
              </CollectionTag>
            )}
            <NftInfo>
              <NftName>{nft.name}</NftName>
              <NftPrompt>{nft.prompt}</NftPrompt>
            </NftInfo>
            <NftFooter>
              <NftDate>
                {new Date(nft.created_at).toLocaleDateString('pt-BR')}
              </NftDate>
              <div onClick={(e) => e.stopPropagation()}>
                <FavoriteButton 
                  nftId={nft.nft_id}
                  initialCount={nft.favorites_count || 0}
                  initialIsFavorited={nft.is_favorited || false}
                  showCount={true}
                  compact={true}
                />
              </div>
            </NftFooter>
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

    </Container>
  );
}

export default NftGallery;
