import { useState, useEffect } from 'react';
import styled from 'styled-components';

const BannerContainer = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  margin-bottom: 40px;
`;

const BannerImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${props => props.$image});
  background-size: cover;
  background-position: center;
  filter: brightness(0.7);
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const BannerOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%);
`;

const BannerContent = styled.div`
  position: relative;
  z-index: 2;
  padding: 40px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const CollectionInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const CollectionTitle = styled.h1`
  font-size: 3em;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: white;
  text-shadow: 0 2px 8px rgba(0,0,0,0.5);
`;

const CreatorBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 20px;
  margin-bottom: 16px;
  width: fit-content;

  span {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9em;
  }

  strong {
    color: white;
    font-weight: 600;
  }
`;

const CollectionDescription = styled.p`
  font-size: 1.1em;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 20px 0;
  max-width: 600px;
  text-shadow: 0 1px 4px rgba(0,0,0,0.5);
`;

const StatsRow = styled.div`
  display: flex;
  gap: 32px;
  align-items: center;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  span {
    font-size: 0.85em;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  strong {
    font-size: 1.4em;
    color: white;
    font-weight: 700;
  }
`;

const PreviewNFTs = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 12px;
  z-index: 3;
`;

const PreviewCard = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: transform 0.2s ease, border-color 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-5px);
    border-color: rgba(102, 126, 234, 0.8);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PlaceholderBanner = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.2em;
  text-align: center;
  padding: 40px;

  span {
    font-size: 3em;
    margin-bottom: 16px;
  }
`;

const LoadingSpinner = styled.div`
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

function CollectionBanner() {
  const [collection, setCollection] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedCollection = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/collections/featured');
        const data = await response.json();

        if (data.success) {
          setCollection(data.collection);
          setNfts(data.nfts || []);
        }
      } catch (error) {
        console.error('Erro ao buscar coleção em destaque:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCollection();
  }, []);

  if (loading) {
    return (
      <BannerContainer>
        <PlaceholderBanner>
          <LoadingSpinner />
          <p style={{ marginTop: '20px' }}>Carregando coleção em destaque...</p>
        </PlaceholderBanner>
      </BannerContainer>
    );
  }

  if (!collection) {
    return (
      <BannerContainer>
        <PlaceholderBanner>
          <span>🎨</span>
          <p>Nenhuma coleção em destaque no momento</p>
          <p style={{ fontSize: '0.9em', marginTop: '8px' }}>
            Crie sua primeira coleção e marque-a como destaque!
          </p>
        </PlaceholderBanner>
      </BannerContainer>
    );
  }

  return (
    <BannerContainer>
      {collection.banner_image && <BannerImage $image={collection.banner_image} />}
      <BannerOverlay />
      <BannerContent>
        <CollectionInfo>
          <CreatorBadge>
            <span>✓</span>
            <strong>{collection.creator_cpf ? `By ${collection.creator_cpf}` : 'Artrivium Collection'}</strong>
          </CreatorBadge>

          <CollectionTitle>{collection.name}</CollectionTitle>

          {collection.description && (
            <CollectionDescription>{collection.description}</CollectionDescription>
          )}

          <StatsRow>
            <StatItem>
              <span>Floor Price</span>
              <strong>{collection.floor_price || '0'} ETH</strong>
            </StatItem>
            <StatItem>
              <span>Total Volume</span>
              <strong>{collection.total_volume || '0'} ETH</strong>
            </StatItem>
            <StatItem>
              <span>Items</span>
              <strong>{collection.nfts_count || 0}</strong>
            </StatItem>
            <StatItem>
              <span>Listed</span>
              <strong>2%</strong>
            </StatItem>
          </StatsRow>
        </CollectionInfo>
      </BannerContent>

      {nfts.length > 0 && (
        <PreviewNFTs>
          {nfts.map((nft) => (
            <PreviewCard key={nft.nft_id}>
              <img src={nft.image_url} alt={nft.name} />
            </PreviewCard>
          ))}
        </PreviewNFTs>
      )}
    </BannerContainer>
  );
}

export default CollectionBanner;
