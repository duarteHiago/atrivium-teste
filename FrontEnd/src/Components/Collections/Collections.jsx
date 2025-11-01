import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import CollectionModal from '../CollectionModal/CollectionModal';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 30px;
`;

const Header = styled.div`
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 3em;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.2em;
  margin-bottom: 20px;
`;

const Stats = styled.div`
  display: flex;
  gap: 32px;
  margin-bottom: 20px;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatLabel = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.span`
  color: white;
  font-size: 1.5em;
  font-weight: 600;
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  gap: 16px;
  flex-wrap: wrap;
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 10px 20px;
  background: ${props => props.$active ? 'rgba(102, 126, 234, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.$active ? '#667eea' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  color: ${props => props.$active ? '#667eea' : 'rgba(255, 255, 255, 0.7)'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(102, 126, 234, 0.15);
    border-color: #667eea;
    color: #667eea;
  }
`;

const CreateButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
`;

const CollectionCard = styled.div`
  background: rgba(30, 30, 31, 0.8);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
    border-color: #667eea;
  }
`;

const BannerImage = styled.div`
  width: 100%;
  height: 180px;
  background: ${props => props.$imageUrl 
    ? `url(${props.$imageUrl})` 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: linear-gradient(to top, rgba(30, 30, 31, 1), transparent);
  }
`;

const CollectionInfo = styled.div`
  padding: 20px;
`;

const CollectionName = styled.h3`
  font-size: 1.5em;
  margin: 0 0 8px 0;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const VerifiedBadge = styled.span`
  color: #2e7cf6;
  font-size: 0.8em;
`;

const CollectionDescription = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95em;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 40px;
`;

const CollectionStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const CollectionStat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatName = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8em;
  text-transform: uppercase;
`;

const StatValueSmall = styled.span`
  color: white;
  font-weight: 600;
  font-size: 0.95em;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 80px 20px;
`;

const Spinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
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

function Collections() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, mine, featured
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalNFTs, setTotalNFTs] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);

  const fetchCollections = async () => {
    setLoading(true);
    setError(null);

    try {
      const userId = localStorage.getItem('creatorId');
      let url = 'http://localhost:3001/api/collections/list';
      
      if (filter === 'featured') {
        url += '?featured=true';
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao carregar coleções');
      }

      let filteredCollections = data.collections || [];

      // Filtro adicional no frontend para "minhas coleções"
      if (filter === 'mine' && userId) {
        filteredCollections = filteredCollections.filter(c => c.creator_id === userId);
      }

      setCollections(filteredCollections);
      
      // Calcular estatísticas
      const nftCount = filteredCollections.reduce((sum, c) => sum + (c.nft_count || 0), 0);
      const volume = filteredCollections.reduce((sum, c) => sum + parseFloat(c.total_volume || 0), 0);
      
      setTotalNFTs(nftCount);
      setTotalVolume(volume);

    } catch (err) {
      console.error('Erro ao buscar coleções:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleCreateCollection = () => {
    setIsModalOpen(false);
    fetchCollections(); // Recarregar lista
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <Spinner />
          <p>Carregando coleções...</p>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>📚 Collections</Title>
        <Subtitle>Explore, crie e gerencie suas coleções de NFTs</Subtitle>
        
        <Stats>
          <StatItem>
            <StatLabel>Total de Coleções</StatLabel>
            <StatValue>{collections.length}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Total de NFTs</StatLabel>
            <StatValue>{totalNFTs}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Volume Total</StatLabel>
            <StatValue>{totalVolume.toFixed(2)} ETH</StatValue>
          </StatItem>
        </Stats>
      </Header>

      <ActionBar>
        <FilterButtons>
          <FilterButton 
            $active={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            Todas
          </FilterButton>
          <FilterButton 
            $active={filter === 'mine'}
            onClick={() => setFilter('mine')}
          >
            Minhas Coleções
          </FilterButton>
          <FilterButton 
            $active={filter === 'featured'}
            onClick={() => setFilter('featured')}
          >
            ⭐ Em Destaque
          </FilterButton>
        </FilterButtons>

        <CreateButton onClick={() => setIsModalOpen(true)}>
          ➕ Criar Nova Coleção
        </CreateButton>
      </ActionBar>

      {error && (
        <ErrorMessage>
          ❌ {error}
        </ErrorMessage>
      )}

      {collections.length === 0 && !error && (
        <EmptyState>
          {filter === 'mine'
            ? 'Você ainda não criou nenhuma coleção. Comece agora!'
            : 'Nenhuma coleção encontrada.'}
        </EmptyState>
      )}

      <Grid>
        {collections.map((collection) => (
          <CollectionCard key={collection.collection_id} onClick={() => navigate(`/collections/${collection.collection_id}`)}>
            <BannerImage $imageUrl={collection.banner_image} />
            <CollectionInfo>
              <CollectionName>
                {collection.name}
                {collection.is_featured && <VerifiedBadge>✓</VerifiedBadge>}
              </CollectionName>
              <CollectionDescription>
                {collection.description || 'Sem descrição'}
              </CollectionDescription>
              
              <CollectionStats>
                <CollectionStat>
                  <StatName>Items</StatName>
                  <StatValueSmall>{collection.nft_count || 0}</StatValueSmall>
                </CollectionStat>
                <CollectionStat>
                  <StatName>Floor</StatName>
                  <StatValueSmall>{parseFloat(collection.floor_price || 0).toFixed(2)} ETH</StatValueSmall>
                </CollectionStat>
                <CollectionStat>
                  <StatName>Volume</StatName>
                  <StatValueSmall>{parseFloat(collection.total_volume || 0).toFixed(2)} ETH</StatValueSmall>
                </CollectionStat>
              </CollectionStats>
            </CollectionInfo>
          </CollectionCard>
        ))}
      </Grid>

      <CollectionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleCreateCollection}
      />
    </Container>
  );
}

export default Collections;
