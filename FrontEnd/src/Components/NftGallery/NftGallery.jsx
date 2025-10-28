import { useState, useEffect } from 'react';
import styled from 'styled-components';

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

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
    border-color: #667eea;
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

function NftGallery() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNfts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/leonardo/list');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao carregar NFTs');
      }

      setNfts(data.nfts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNfts();
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
      <Title>🖼️ Galeria de NFTs</Title>
      <Subtitle>
        {nfts.length} NFT{nfts.length !== 1 ? 's' : ''} gerado{nfts.length !== 1 ? 's' : ''}
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
          Nenhum NFT encontrado. Gere seu primeiro NFT!
        </EmptyState>
      )}

      <Grid>
        {nfts.map((nft) => (
          <NftCard key={nft.nft_id}>
            <NftImage src={nft.image_url} alt={nft.name} />
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
    </Container>
  );
}

export default NftGallery;
