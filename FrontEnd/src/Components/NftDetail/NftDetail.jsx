import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { API_BASE } from '../../config/api';
import FavoriteButton from '../FavoriteButton/FavoriteButton';
import NftOffers from '../NftOffers/NftOffers';
import NftHistory from '../NftHistory/NftHistory';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px;
  min-height: 100vh;
`;

const BackButton = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 30px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.4);
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: start;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

const ImageSection = styled.div`
  position: sticky;
  top: 100px;
`;

const NftImageContainer = styled.div`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const NftImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const InfoSection = styled.div`
  color: white;
`;

const CollectionTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(102, 126, 234, 0.15);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #a8b5ff;
  margin-bottom: 16px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, #fff 0%, #a8b5ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const TrendingBadge = styled.div`
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${p => {
    if (p.$level === 'legendary') return 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2))';
    if (p.$level === 'trending') return 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.2))';
    if (p.$level === 'popular') return 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))';
    return 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))';
  }};
  border: 1px solid ${p => {
    if (p.$level === 'legendary') return 'rgba(251, 191, 36, 0.5)';
    if (p.$level === 'trending') return 'rgba(139, 92, 246, 0.5)';
    if (p.$level === 'popular') return 'rgba(59, 130, 246, 0.5)';
    return 'rgba(239, 68, 68, 0.5)';
  }};
  color: ${p => {
    if (p.$level === 'legendary') return '#fbbf24';
    if (p.$level === 'trending') return '#a78bfa';
    if (p.$level === 'popular') return '#60a5fa';
    return '#f87171';
  }};
  box-shadow: 0 4px 12px ${p => {
    if (p.$level === 'legendary') return 'rgba(251, 191, 36, 0.2)';
    if (p.$level === 'trending') return 'rgba(139, 92, 246, 0.2)';
    if (p.$level === 'popular') return 'rgba(59, 130, 246, 0.2)';
    return 'rgba(239, 68, 68, 0.2)';
  }};
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
`;

const Creator = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(102, 126, 234, 0.4);
  }
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
`;

const CreatorInfo = styled.div`
  flex: 1;
`;

const CreatorLabel = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 2px;
`;

const CreatorName = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: white;
  text-decoration: underline;
  text-underline-offset: 3px;
`;

const PriceSection = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
`;

const PriceLabel = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
`;

const PriceValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const UsdValue = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 30px;
`;

const BuyButton = styled.button`
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(102, 126, 234, 0.6);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const OfferButton = styled.button`
  flex: 1;
  background: transparent;
  color: white;
  border: 2px solid rgba(102, 126, 234, 0.5);
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    border-color: rgba(102, 126, 234, 0.8);
  }

  &:active {
    background: rgba(102, 126, 234, 0.2);
  }
`;

// Modal de listagem para venda
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalCard = styled.div`
  width: 420px;
  max-width: calc(100% - 32px);
  background: rgba(30,30,31,0.98);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
`;

const ModalTitle = styled.h4`
  margin: 0 0 12px;
  color: #fff;
`;

const ModalRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin: 12px 0 8px;
`;

const ModalInput = styled.input`
  flex: 1;
  padding: 12px 14px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 10px;
  color: #fff;
`;

const ModalButton = styled.button`
  padding: 12px 16px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  min-width: 140px;
  &:disabled { opacity: .6; cursor: not-allowed; }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 16px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 30px;
`;

const InfoCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
`;

const InfoLabel = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 6px;
`;

const InfoValue = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: white;
`;

const Description = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
`;

const PropertiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
`;

const PropertyCard = styled.div`
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 10px;
  padding: 12px;
  text-align: center;
`;

const PropertyLabel = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PropertyValue = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: white;
`;

const ClickablePropertyCard = styled(PropertyCard)`
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.18);
    border-color: rgba(102, 126, 234, 0.5);
    transform: translateY(-2px);
  }
`;

const EllipsisText = styled.span`
  display: block;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  background: ${props => {
    switch(props.$type) {
      case 'ipfs': return 'rgba(34, 197, 94, 0.15)';
      case 'minted': return 'rgba(59, 130, 246, 0.15)';
      case 'off-chain': return 'rgba(251, 191, 36, 0.15)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  color: ${props => {
    switch(props.$type) {
      case 'ipfs': return '#4ade80';
      case 'minted': return '#60a5fa';
      case 'off-chain': return '#fbbf24';
      default: return '#fff';
    }
  }};
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-left: 8px;
`;

const Loading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: white;
  font-size: 1.2rem;
`;

const SparklineWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const GrowthText = styled.span`
  font-weight: 700;
  color: ${p => (p.$positive ? '#22c55e' : '#ef4444')};
`;

const NftDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nft, setNft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState([]);
  const [growthPercent, setGrowthPercent] = useState(null);
  const [popularity, setPopularity] = useState(null);
  const [showListModal, setShowListModal] = useState(false);
  const [priceInput, setPriceInput] = useState('');
  const [buyNowInput, setBuyNowInput] = useState('');
  const [listLoading, setListLoading] = useState(false);
  const [tipLoading, setTipLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [suggestedPrice, setSuggestedPrice] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [userBalance, setUserBalance] = useState(null);

  // Decodifica o token JWT para obter o user_id do usuário autenticado
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload?.sub || null);
      }
    } catch {
      setCurrentUserId(null);
    }
  }, []);

  useEffect(() => {
    const fetchNft = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        // Adiciona timestamp para evitar cache
        const timestamp = new Date().getTime();
        const response = await fetch(`${API_BASE}/api/leonardo/${id}?_t=${timestamp}`, { 
          headers,
          cache: 'no-cache'
        });
        const data = await response.json();
        
        if (data.success && data.nft) {
          setNft(data.nft);
        }
      } catch (error) {
        console.error('Erro ao buscar NFT:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNft();
  }, [id]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/nft/${id}/favorites/history`);
        const data = await res.json();
        if (res.ok && data.success) {
          setSeries((data.series || []).map(p => p.value));
          setGrowthPercent(typeof data.growthPercent === 'number' ? data.growthPercent : null);
        }
      } catch {
        /* silent */
      }
    };
    if (id) fetchHistory();
  }, [id]);

  useEffect(() => {
    const fetchPopularity = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/nft/${id}/popularity`);
        const data = await res.json();
        if (res.ok && data.success && data.popularity) {
          setPopularity({
            ...data.popularity,
            count: data.totalFavorites,
            recentFavorites: data.recentFavorites
          });
        }
      } catch {
        /* silent */
      }
    };
    if (id) fetchPopularity();
  }, [id]);

  useEffect(() => {
    const fetchSuggestedPrice = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/nft/${id}/suggested-price`);
        const data = await res.json();
        if (res.ok && data.success && typeof data.suggestedPrice === 'number') {
          setSuggestedPrice(data.suggestedPrice);
        }
      } catch {
        /* silent */
      }
    };
    if (id) fetchSuggestedPrice();
  }, [id]);

  // Buscar saldo do usuário
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

  const res = await fetch(`${API_BASE}/api/wallet/balance`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUserBalance(parseFloat(data.balance_eth || 0));
        }
      } catch (err) {
        console.error('Erro ao buscar saldo:', err);
      }
    };

    if (currentUserId) {
      fetchBalance();
    }
  }, [currentUserId]);

  // Função para comprar NFT
  const handlePurchase = async () => {
    try {
      setPurchaseLoading(true);
      setModalError('');

      const token = localStorage.getItem('token');
      if (!token) {
        setModalError('Você precisa estar logado para comprar');
        return;
      }

      const res = await fetch(`${API_BASE}/api/nft/${id}/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert('NFT comprado com sucesso! 🎉');
        setShowPurchaseModal(false);
        // Avisar o header para atualizar o saldo
  try { window.dispatchEvent(new Event('wallet:refresh')); } catch { /* noop */ }
        // Recarregar a página para atualizar os dados
        window.location.reload();
      } else {
        setModalError(data.message || 'Erro ao comprar NFT');
      }
    } catch (err) {
      console.error('Erro ao comprar NFT:', err);
      setModalError('Erro ao processar compra');
    } finally {
      setPurchaseLoading(false);
    }
  };

  const buildPath = (values = [], width = 160, height = 50) => {
    if (!values || values.length === 0) return '';
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = Math.max(max - min, 1);
    const stepX = width / Math.max(values.length - 1, 1);
    return values.map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / span) * height;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');
  };

  if (loading) {
    return <Loading>Carregando NFT...</Loading>;
  }

  if (!nft) {
    return (
      <Container>
        <BackButton onClick={() => navigate(-1)}>
          ← Voltar
        </BackButton>
        <Loading>NFT não encontrado</Loading>
      </Container>
    );
  }

  const isForSale = nft.status === 'listed' || nft.status === 'for_sale';
  const price = nft.price || '0.5'; // Preço placeholder
  const isIPFS = nft.network === 'ipfs';
  
  // Verifica se o usuário atual é dono do NFT (apenas current_owner_id importa)
  const isOwner = currentUserId && String(nft.current_owner_id) === String(currentUserId);

  // Prioriza buy_now_price, depois sugerido, depois base
  const buyNowPrice = nft.buy_now_price ? parseFloat(nft.buy_now_price) : null;
  const basePrice = parseFloat(price);
  const displayPrice = buyNowPrice || suggestedPrice || basePrice;
  const hasBuyNow = buyNowPrice && buyNowPrice > 0;

  return (
    <Container>
      <BackButton onClick={() => navigate(-1)}>
        ← Voltar
      </BackButton>

      <ContentGrid>
        {/* Seção da Imagem */}
        <ImageSection>
          <NftImageContainer>
            <NftImage src={nft.image_url} alt={nft.name} />
          </NftImageContainer>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
            <FavoriteButton 
              nftId={nft.nft_id} 
              initialCount={nft.favorites_count || 0}
              initialIsFavorited={nft.is_favorited || false}
            />
          </div>
        </ImageSection>

        {/* Seção de Informações */}
        <InfoSection>
          {nft.collection_id && (
            <CollectionTag onClick={() => navigate(`/collections/${nft.collection_id}`)} style={{ cursor: 'pointer' }} title="Ver coleção">
              🎨 {nft.collection_name || 'Coleção'}
            </CollectionTag>
          )}

          <Title>
            {nft.name || 'NFT sem nome'}
            {popularity && (
              <TrendingBadge $level={popularity.level}>
                <span>{popularity.icon}</span>
                <span>{popularity.label}</span>
                <span>• {popularity.count} ❤️</span>
              </TrendingBadge>
            )}
          </Title>

          <Creator onClick={(e) => {
            e.stopPropagation();
            console.log('Clicou no criador - creator_id:', nft.creator_id);
            navigate(`/users/${nft.creator_id}`);
          }}>
            <Avatar>
              {nft.creator_avatar ? (
                <img src={nft.creator_avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                nft.creator_name?.[0]?.toUpperCase() || '?'
              )}
            </Avatar>
            <CreatorInfo>
              <CreatorLabel>Criado por</CreatorLabel>
              <CreatorName>{nft.creator_name || 'Criador Desconhecido'}</CreatorName>
            </CreatorInfo>
          </Creator>

          {/* Dono atual */}
          {nft.current_owner_id && (
            <Creator onClick={(e) => {
              e.stopPropagation();
              console.log('Clicou no dono - current_owner_id:', nft.current_owner_id);
              navigate(`/users/${nft.current_owner_id}`);
            }}>
              <Avatar>
                {nft.owner_avatar ? (
                  <img src={nft.owner_avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  nft.owner_name?.[0]?.toUpperCase() || '👑'
                )}
              </Avatar>
              <CreatorInfo>
                <CreatorLabel>Dono atual</CreatorLabel>
                <CreatorName>{nft.owner_name || 'Dono Desconhecido'}</CreatorName>
              </CreatorInfo>
            </Creator>
          )}

          {/* Seção de Preços e Ofertas Unificada */}
          <PriceSection>
            <SectionTitle style={{ margin: '0 0 20px 0', fontSize: '1.5rem' }}>
              💰 Preços e Ofertas
            </SectionTitle>

            {/* Explicação do Sistema */}
            {isForSale && (
              <div style={{ 
                background: 'rgba(102, 126, 234, 0.1)',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '12px', 
                padding: '16px', 
                marginBottom: '20px',
                fontSize: '0.9rem',
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: '1.6'
              }}>
                <div style={{ fontWeight: 600, marginBottom: '8px', color: '#a8b5ff' }}>
                  ℹ️ Como funciona:
                </div>
                <div style={{ marginBottom: '6px' }}>
                  • <strong>Preço Base ({basePrice.toFixed(4)} ETH):</strong> Valor mínimo do NFT - Use como referência para fazer ofertas
                </div>
                <div style={{ marginBottom: '6px' }}>
                  • <strong>Fazer Oferta:</strong> Ofereça um valor <u>acima</u> de {basePrice.toFixed(4)} ETH e aguarde aprovação do dono
                </div>
                {hasBuyNow && (
                  <div>
                    • <strong>Compra Imediata ({buyNowPrice.toFixed(4)} ETH):</strong> Pague este valor e receba o NFT instantaneamente sem concorrência
                  </div>
                )}
              </div>
            )}

            {!isForSale && !isOwner && (
              <div style={{ 
                background: 'rgba(251, 191, 36, 0.1)', 
                border: '1px solid rgba(251, 191, 36, 0.3)', 
                borderRadius: '12px', 
                padding: '16px', 
                marginBottom: '20px',
                fontSize: '0.9rem',
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: '1.6'
              }}>
                <div style={{ fontWeight: 600, marginBottom: '8px', color: '#fbbf24' }}>
                  💡 Este NFT não está listado para venda
                </div>
                <div>
                  Você ainda pode fazer uma oferta ao proprietário e aguardar aprovação.
                </div>
              </div>
            )}

            {/* Grid de Preços */}
            {isForSale && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: hasBuyNow ? '1fr 1fr' : '1fr', 
                gap: '16px', 
                marginBottom: '24px' 
              }}>
                {/* Preço Base */}
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: '12px', 
                  padding: '20px' 
                }}>
                  <div style={{ 
                    fontSize: '0.85rem', 
                    color: 'rgba(255, 255, 255, 0.6)', 
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    💎 Preço Base (Ofertas)
                  </div>
                  <div style={{ 
                    fontSize: '1.8rem', 
                    fontWeight: 700, 
                    color: '#a8b5ff',
                    marginBottom: '4px'
                  }}>
                    {basePrice.toFixed(4)} ETH
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                    ≈ ${(basePrice * 2000).toFixed(2)} USD
                  </div>
                </div>

                {/* Preço de Compra Imediata */}
                {hasBuyNow && (
                  <div style={{ 
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15))', 
                    border: '2px solid rgba(16, 185, 129, 0.4)', 
                    borderRadius: '12px', 
                    padding: '20px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(16, 185, 129, 0.3)',
                      color: '#10b981',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      ⚡ INSTANTÂNEO
                    </div>
                    <div style={{ 
                      fontSize: '0.85rem', 
                      color: 'rgba(16, 185, 129, 0.9)', 
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      🚀 Compra Imediata
                    </div>
                    <div style={{ 
                      fontSize: '1.8rem', 
                      fontWeight: 700, 
                      color: '#10b981',
                      marginBottom: '4px'
                    }}>
                      {buyNowPrice.toFixed(4)} ETH
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(16, 185, 129, 0.8)' }}>
                      ≈ ${(buyNowPrice * 2000).toFixed(2)} USD
                    </div>
                    <div style={{ 
                      marginTop: '12px', 
                      fontSize: '0.8rem', 
                      color: 'rgba(255, 255, 255, 0.7)',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      +{(((buyNowPrice / basePrice) - 1) * 100).toFixed(0)}% acima do preço base
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mini gráfico de valorização (14d) */}
            {series.length > 1 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>
                  📈 Valorização (últimos 14 dias)
                </div>
                <SparklineWrap>
                  <svg width="160" height="50" viewBox="0 0 160 50">
                    <path 
                      d={buildPath(series, 160, 50)} 
                      fill="none" 
                      stroke={
                        growthPercent >= 40 ? '#10b981' :
                        growthPercent >= 20 ? '#22c55e' :
                        growthPercent >= 0 ? '#84cc16' :
                        growthPercent >= -10 ? '#f59e0b' :
                        '#ef4444'
                      }
                      strokeWidth="2" 
                    />
                  </svg>
                  {typeof growthPercent === 'number' && (
                    <GrowthText $positive={growthPercent >= 0}>
                      {growthPercent >= 0 ? '+' : ''}{growthPercent.toFixed(1)}%
                    </GrowthText>
                  )}
                </SparklineWrap>
              </div>
            )}

            {/* Botões de Ação */}
            <ActionButtons>
              {isForSale ? (
                <>
                  {!isOwner ? (
                    <>
                      {hasBuyNow && (
                        <BuyButton 
                          onClick={() => setShowPurchaseModal(true)} 
                          style={{ 
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            flex: hasBuyNow ? 1 : undefined
                          }}
                        >
                          ⚡ Comprar Agora
                        </BuyButton>
                      )}
                      <OfferButton style={{ flex: 1 }} onClick={() => {
                        const offersSection = document.getElementById('offers-section');
                        if (offersSection) {
                          offersSection.scrollIntoView({ behavior: 'smooth' });
                          const makeOfferBtn = offersSection.querySelector('button');
                          if (makeOfferBtn) {
                            setTimeout(() => makeOfferBtn.click(), 300);
                          }
                        }
                      }}>
                        💎 Fazer Oferta
                      </OfferButton>
                    </>
                  ) : (
                    <BuyButton disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                      👑 Você é o dono
                    </BuyButton>
                  )}
                </>
              ) : (
                <>
                  {!isOwner && (
                    <OfferButton style={{ flex: 1 }} onClick={() => {
                      const offersSection = document.getElementById('offers-section');
                      if (offersSection) {
                        offersSection.scrollIntoView({ behavior: 'smooth' });
                        const makeOfferBtn = offersSection.querySelector('button');
                        if (makeOfferBtn) {
                          setTimeout(() => makeOfferBtn.click(), 300);
                        }
                      }
                    }}>
                      💎 Fazer Oferta
                    </OfferButton>
                  )}
                  {isOwner && (
                    <BuyButton style={{ flex: 1 }} onClick={() => setShowListModal(true)}>
                      📈 Listar para venda
                    </BuyButton>
                  )}
                </>
              )}
            </ActionButtons>

            {/* Sistema de Ofertas Integrado - só aparece se NFT estiver for_sale ou listed */}
            {['for_sale', 'listed'].includes(nft.status) && (
              <div id="offers-section" style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <NftOffers 
                  nftId={nft.nft_id} 
                  isOwner={isOwner}
                  currentUserId={currentUserId}
                  basePrice={basePrice}
                />
              </div>
            )}
          </PriceSection>

          {/* Histórico de Transações */}
          <NftHistory nftId={nft.nft_id} />

          {/* Informações Rápidas */}
          <InfoGrid>
            <InfoCard>
              <InfoLabel>Network</InfoLabel>
              <InfoValue>
                {nft.network || 'Ethereum'}
                {isIPFS && <Badge $type="ipfs">IPFS</Badge>}
              </InfoValue>
            </InfoCard>
            <InfoCard>
              <InfoLabel>Status</InfoLabel>
              <InfoValue>
                {nft.status === 'minted' ? 'Mintado' : 'Criado'}
                <Badge $type={nft.status}>{nft.status}</Badge>
              </InfoValue>
            </InfoCard>
            <InfoCard>
              <InfoLabel>Token ID</InfoLabel>
              <InfoValue>{nft.token_id?.substring(0, 8)}...</InfoValue>
            </InfoCard>
            <InfoCard>
              <InfoLabel>Data de Criação</InfoLabel>
              <InfoValue>
                {new Date(nft.created_at).toLocaleDateString('pt-BR')}
              </InfoValue>
            </InfoCard>
          </InfoGrid>

          {/* Descrição */}
          {(nft.description || nft.prompt) && (
            <Section>
              <SectionTitle>📝 Descrição</SectionTitle>
              <Description>
                {nft.description || `Gerado com IA usando o prompt: "${nft.prompt}"`}
              </Description>
            </Section>
          )}

          {/* Propriedades */}
          {(nft.style || nft.prompt || nft.ipfs_hash || nft.collection_id) && (
            <Section>
              <SectionTitle>✨ Propriedades</SectionTitle>
              <PropertiesGrid>
                {nft.style && (
                  <PropertyCard>
                    <PropertyLabel>Estilo</PropertyLabel>
                    <PropertyValue>{nft.style}</PropertyValue>
                  </PropertyCard>
                )}
                {nft.collection_id && (
                  <ClickablePropertyCard
                    onClick={() => navigate(`/collections/${nft.collection_id}`)}
                    title={nft.collection_name || 'Coleção'}
                    aria-label="Abrir página da coleção"
                  >
                    <PropertyLabel>Coleção</PropertyLabel>
                    <PropertyValue>
                      <EllipsisText>{nft.collection_name || 'Coleção'}</EllipsisText>
                    </PropertyValue>
                  </ClickablePropertyCard>
                )}
                {nft.prompt && (
                  <PropertyCard>
                    <PropertyLabel>IA Generated</PropertyLabel>
                    <PropertyValue>Leonardo AI</PropertyValue>
                  </PropertyCard>
                )}
                {nft.ipfs_hash && (
                  <PropertyCard>
                    <PropertyLabel>Armazenamento</PropertyLabel>
                    <PropertyValue>IPFS</PropertyValue>
                  </PropertyCard>
                )}
              </PropertiesGrid>
            </Section>
          )}

          {/* Hash IPFS */}
          {nft.ipfs_hash && (
            <Section>
              <SectionTitle>🔗 Blockchain & IPFS</SectionTitle>
              <InfoCard>
                <InfoLabel>IPFS Hash</InfoLabel>
                <InfoValue style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}>
                  {nft.ipfs_hash}
                </InfoValue>
              </InfoCard>
            </Section>
          )}
        </InfoSection>
      </ContentGrid>

      {showListModal && (
        <ModalOverlay onClick={() => !listLoading && setShowListModal(false)}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Listar para venda</ModalTitle>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '.92rem', marginBottom: 16 }}>
              Configure o preço base (para ofertas) e opcionalmente um preço de compra imediata.
            </div>
            
            <label style={{ display: 'block', marginBottom: 8, color: 'rgba(255,255,255,0.8)', fontSize: '.9rem' }}>
              Preço Base (ETH) *
            </label>
            <ModalRow>
              <ModalInput
                type="number"
                step="0.001"
                min="0"
                placeholder="Ex: 0.250"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                disabled={listLoading}
              />
              <ModalButton
                type="button"
                onClick={async () => {
                  try {
                    setTipLoading(true);
                    const res = await fetch(`${API_BASE}/api/nft/${id}/suggested-price`);
                    const data = await res.json();
                    if (res.ok && data.success && typeof data.suggestedPrice === 'number') {
                      setPriceInput(data.suggestedPrice.toFixed(3));
                    }
                  } finally {
                    setTipLoading(false);
                  }
                }}
                disabled={listLoading || tipLoading}
              >
                {tipLoading ? 'Calculando...' : 'Sugerido'}
              </ModalButton>
            </ModalRow>

            <label style={{ display: 'block', marginTop: 16, marginBottom: 8, color: 'rgba(255,255,255,0.8)', fontSize: '.9rem' }}>
              Compra Imediata (ETH) - Opcional
            </label>
            <ModalInput
              type="number"
              step="0.001"
              min="0"
              placeholder="Ex: 0.500 (deixe vazio para desabilitar)"
              value={buyNowInput}
              onChange={(e) => setBuyNowInput(e.target.value)}
              disabled={listLoading}
            />
            <div style={{ fontSize: '.8rem', color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>
              💡 Se alguém pagar este valor, a venda é automática (sem sua aprovação)
            </div>
            
            {modalError && (
              <div style={{ color: '#f87171', fontSize: '.9rem', marginTop: 12, padding: 8, background: 'rgba(239,68,68,0.1)', borderRadius: 6 }}>
                {modalError}
              </div>
            )}
            <ModalActions>
              <button
                onClick={() => setShowListModal(false)}
                disabled={listLoading}
                style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 14px', borderRadius: 10, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <ModalButton
                onClick={async () => {
                  setModalError('');
                  const p = parseFloat(priceInput);
                  if (!Number.isFinite(p) || p < 0.001) {
                    setModalError('Informe um preço base válido (mín. 0.001 ETH).');
                    return;
                  }

                  // Valida buy_now_price se informado
                  const buyNow = buyNowInput ? parseFloat(buyNowInput) : null;
                  if (buyNow !== null && (!Number.isFinite(buyNow) || buyNow <= 0)) {
                    setModalError('Preço de compra imediata inválido.');
                    return;
                  }
                  if (buyNow !== null && buyNow <= p) {
                    setModalError('Preço de compra imediata deve ser maior que o preço base.');
                    return;
                  }

                  try {
                    setListLoading(true);
                    const token = localStorage.getItem('token');
                    const res = await fetch(`${API_BASE}/api/nft/${id}/price`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                      },
                      body: JSON.stringify({ 
                        price: p, 
                        buy_now_price: buyNow,
                        status: 'for_sale' 
                      })
                    });
                    const data = await res.json();
                    if (!res.ok || !data.success) {
                      throw new Error(data.message || 'Falha ao atualizar preço');
                    }
                    // Atualiza estado local
                    setNft(prev => ({ 
                      ...prev, 
                      price: data.nft.price, 
                      buy_now_price: data.nft.buy_now_price,
                      status: data.nft.status 
                    }));
                    setShowListModal(false);
                    setPriceInput('');
                    setBuyNowInput('');
                  } catch (e) {
                    setModalError(e.message);
                  } finally {
                    setListLoading(false);
                  }
                }}
                disabled={listLoading}
              >
                {listLoading ? 'Listando...' : 'Listar agora'}
              </ModalButton>
            </ModalActions>
          </ModalCard>
        </ModalOverlay>
      )}

      {showPurchaseModal && (
        <ModalOverlay onClick={() => !purchaseLoading && setShowPurchaseModal(false)}>
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Confirmar Compra</ModalTitle>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '.92rem', marginBottom: 20 }}>
              Você está prestes a comprar <strong>{nft.name}</strong>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 8, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>Preço:</span>
                <span style={{ fontSize: '1.1em', fontWeight: 600 }}>{displayPrice.toFixed(4)} ETH</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>Seu saldo:</span>
                <span style={{ fontSize: '1.1em', fontWeight: 600, color: userBalance >= displayPrice ? '#10b981' : '#ef4444' }}>
                  {userBalance !== null ? `${userBalance.toFixed(4)} ETH` : 'Carregando...'}
                </span>
              </div>
              {userBalance !== null && userBalance < displayPrice && (
                <div style={{ color: '#ef4444', fontSize: '.85em', marginTop: 12, padding: 8, background: 'rgba(239, 68, 68, 0.1)', borderRadius: 6 }}>
                  ⚠️ Saldo insuficiente! Você precisa de mais {(displayPrice - userBalance).toFixed(4)} ETH
                </div>
              )}
            </div>

            {modalError && (
              <div style={{ color: '#f87171', fontSize: '.9rem', marginBottom: 12, padding: 8, background: 'rgba(248, 113, 113, 0.1)', borderRadius: 6 }}>
                {modalError}
              </div>
            )}

            <ModalActions>
              <button
                onClick={() => setShowPurchaseModal(false)}
                disabled={purchaseLoading}
                style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 14px', borderRadius: 10, cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <ModalButton
                onClick={handlePurchase}
                disabled={purchaseLoading || !userBalance || userBalance < displayPrice}
                style={{ 
                  opacity: (!userBalance || userBalance < displayPrice) ? 0.5 : 1,
                  cursor: (!userBalance || userBalance < displayPrice) ? 'not-allowed' : 'pointer'
                }}
              >
                {purchaseLoading ? 'Processando...' : '🛒 Confirmar Compra'}
              </ModalButton>
            </ModalActions>
          </ModalCard>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default NftDetail;
