import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { API_BASE } from '../../config/api';

const Container = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 40px 30px 60px;
`;

const Header = styled.div`
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 2.5em;
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.1em;
  margin: 0;
`;

const FiltersBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 32px;
  padding: 20px;
  background: rgba(30, 30, 31, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 250px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: white;
  font-size: 1em;

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:focus {
    outline: none;
    border-color: rgba(102, 126, 234, 0.6);
    background: rgba(255, 255, 255, 0.08);
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: white;
  font-size: 1em;
  cursor: pointer;
  min-width: 160px;

  option {
    background: #1a1a1b;
    color: white;
  }

  &:focus {
    outline: none;
    border-color: rgba(102, 126, 234, 0.6);
  }
`;

const Stats = styled.div`
  display: flex;
  gap: 32px;
  margin-bottom: 32px;
  padding: 20px;
  background: rgba(30, 30, 31, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const StatLabel = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.span`
  color: white;
  font-size: 1.5em;
  font-weight: 700;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding-top: 20px;
`;

const Card = styled.div`
  background: rgba(30, 30, 31, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: visible; /* permitir que tooltips transbordem o card */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  transform-style: preserve-3d;
  perspective: 1000px;
  isolation: isolate; /* criar novo contexto de empilhamento */

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(102, 126, 234, 0.15) 0%,
      rgba(118, 75, 162, 0.15) 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: 16px;
    pointer-events: none;
    z-index: 1;
  }

  &:hover {
    transform: translateY(-12px) rotateX(5deg) scale(1.02);
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.5),
      0 0 30px rgba(102, 126, 234, 0.4);
    border-color: rgba(102, 126, 234, 0.6);
    z-index: 10; /* eleva o card inteiro quando hover, antes do tooltip aparecer */
  }

  &:hover::before {
    opacity: 1;
  }

  &:active {
    transform: translateY(-8px) rotateX(2deg) scale(1.01);
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a1b 0%, #2a2a2b 100%);
  border-radius: 16px 16px 0 0;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  ${Card}:hover & {
    transform: scale(1.08);
  }
`;

const ForSaleBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  background: rgba(34, 197, 94, 0.9);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  font-size: 0.75em;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
`;

const OwnerBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  background: rgba(102, 126, 234, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  font-size: 0.75em;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PopularityBadge = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 6px 12px;
  background: ${p => {
    if (p.$level === 'legendary') return 'linear-gradient(135deg, rgba(251, 191, 36, 0.95), rgba(245, 158, 11, 0.95))';
    if (p.$level === 'trending') return 'linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(124, 58, 237, 0.95))';
    if (p.$level === 'popular') return 'linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(37, 99, 235, 0.95))';
    return 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))';
  }};
  backdrop-filter: blur(8px);
  border-radius: 20px;
  font-size: 0.7em;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TrendBadge = styled.div`
  position: absolute;
  bottom: 12px;
  left: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 8px;
  z-index: 3;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
`;

const TrendLabel = styled.span`
  font-size: 0.55rem;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.8);
`;

const TrendText = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  color: ${p => (p.$positive ? '#22c55e' : '#ef4444')};
  opacity: .95;
`;

const CardInfo = styled.div`
  padding: 16px;
  position: relative;
  z-index: 2;
`;

const CardTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 1.1em;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CardCreator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9em;
`;

const CreatorAvatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${p => p.$imageUrl 
    ? `url(${p.$imageUrl}) center/cover no-repeat` 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  border: 2px solid rgba(255, 255, 255, 0.2);
`;

const CreatorName = styled.span`
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
`;

const PriceSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const PriceLabel = styled.span`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85em;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PriceValue = styled.span`
  color: white;
  font-size: 1.2em;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const RightCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
`;

const BuyButton = styled.button`
  padding: 8px 12px;
  font-size: 0.85em;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #10b981, #22c55e);
  border: 1px solid rgba(34, 197, 94, 0.5);
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease, filter 0.2s ease;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.25);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(34, 197, 94, 0.35);
    filter: brightness(1.05);
  }

  &:active {
    transform: translateY(0);
  }
`;

// Tooltip de breakdown do preço sugerido
const PriceWithInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
`;

const InfoIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 0.75em;
  font-weight: 800;
  color: rgba(255,255,255,0.9);
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  cursor: default;
`;

const Tooltip = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 280px;
  background: rgba(17,17,18,0.96);
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 12px;
  padding: 12px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-4px);
  transition: all 0.16s ease;
  z-index: 9999;

  ${PriceWithInfo}:hover & {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;

const TipTitle = styled.div`
  font-size: 0.85em;
  font-weight: 700;
  color: #cfd4ff;
  margin-bottom: 8px;
`;

const TipRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px dashed rgba(255,255,255,0.08);

  &:last-child { border-bottom: 0; }
`;

const TipKey = styled.span`
  color: rgba(255,255,255,0.6);
  font-size: 0.85em;
`;

const TipVal = styled.span`
  color: rgba(255,255,255,0.9);
  font-size: 0.9em;
  font-weight: 600;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: rgba(255, 255, 255, 0.5);
`;

const EmptyIcon = styled.div`
  font-size: 4em;
  margin-bottom: 16px;
  opacity: 0.3;
`;

const EmptyText = styled.p`
  font-size: 1.2em;
  margin: 0;
`;

const Loading = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1em;
`;

function Marketplace() {
  const navigate = useNavigate();
  const [nfts, setNfts] = useState([]);
  const [filteredNfts, setFilteredNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ownershipFilter, setOwnershipFilter] = useState('all'); // 'all', 'mine', 'available'
  const [currentUserId, setCurrentUserId] = useState(null);
  const [trendData, setTrendData] = useState({}); // { nft_id: { spark, growth } }
  const [popularityData, setPopularityData] = useState({}); // { nft_id: { level, icon, label, recentFavorites } }
  const [suggestedData, setSuggestedData] = useState({}); // { nft_id: { suggestedPrice, breakdown } }

  // Função para construir o path do SVG
  const buildPath = (values = [], width = 40, height = 14) => {
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

  // Função para calcular valor sugerido baseado em favoritos (fallback local - usa novos pesos)
  function calculateSuggestedPrice(basePrice, favoritesCount) {
    // Se não houver preço, usa 0.1 ETH como base para demonstração
    const base = parseFloat(basePrice) || 0.1;
    
    const count = parseInt(favoritesCount) || 0;
    // Novos pesos: +3% por like, cap 40%
    const popularityBonus = Math.min(0.40, count * 0.03);
    return base * (1 + popularityBonus);
  }

  useEffect(() => {
    async function loadNfts() {
      try {
        setLoading(true);
        
        // Pega o ID do usuário logado
        const userId = localStorage.getItem('creatorId');
        setCurrentUserId(userId);
        
        const res = await fetch(`${API_BASE}/api/leonardo/list`);
        const data = await res.json();
        
        if (data.nfts && Array.isArray(data.nfts)) {
          setNfts(data.nfts);
          
          // Carregar dados de trend e popularidade para cada NFT
          const trends = {};
          const popularity = {};
          const suggested = {};
          await Promise.all(
            data.nfts.slice(0, 50).map(async (nft) => { // Limita a 50 para não sobrecarregar
              try {
                // Busca histórico de trend
                const trendRes = await fetch(`${API_BASE}/api/nft/${nft.nft_id}/favorites/history`);
                if (trendRes.ok) {
                  const trendData = await trendRes.json();
                  if (trendData.series && trendData.series.length > 1) {
                    trends[nft.nft_id] = {
                      spark: trendData.series.map(s => s.value),
                      growth: trendData.growthPercent
                    };
                  }
                }
                
                // Busca popularidade dinâmica
                const popRes = await fetch(`${API_BASE}/api/nft/${nft.nft_id}/popularity`);
                if (popRes.ok) {
                  const popData = await popRes.json();
                  if (popData.popularity) {
                    popularity[nft.nft_id] = {
                      ...popData.popularity,
                      recentFavorites: popData.recentFavorites,
                      totalFavorites: popData.totalFavorites
                    };
                  }
                }

                // Busca preço sugerido
                const priceRes = await fetch(`${API_BASE}/api/nft/${nft.nft_id}/suggested-price`);
                if (priceRes.ok) {
                  const priceData = await priceRes.json();
                  if (priceData.success && typeof priceData.suggestedPrice === 'number') {
                    suggested[nft.nft_id] = {
                      suggestedPrice: priceData.suggestedPrice,
                      breakdown: priceData.breakdown
                    };
                  }
                }
              } catch {
                // Ignora erros individuais
              }
            })
          );
          setTrendData(trends);
          setPopularityData(popularity);
          setSuggestedData(suggested);
        }
      } catch (error) {
        console.error('Erro ao carregar NFTs:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadNfts();
  }, []);

  useEffect(() => {
    function applyFilters() {
      let filtered = [...nfts];

      // Filtro de propriedade (novo)
      if (ownershipFilter === 'mine') {
        // Mostra apenas NFTs do usuário
        filtered = filtered.filter(nft => nft.current_owner_id === currentUserId);
      } else if (ownershipFilter === 'available') {
        // Mostra apenas NFTs que NÃO são do usuário (disponíveis para compra)
        filtered = filtered.filter(nft => nft.current_owner_id !== currentUserId);
      }

      // Filtro de status
      if (statusFilter === 'sale') {
        filtered = filtered.filter(nft => nft.status === 'for_sale');
      } else if (statusFilter === 'sold') {
        filtered = filtered.filter(nft => nft.status === 'sold');
      }

      // Filtro de busca
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(nft => 
          nft.name?.toLowerCase().includes(term) ||
          nft.description?.toLowerCase().includes(term) ||
          nft.creator_name?.toLowerCase().includes(term)
        );
      }

      // Ordenação
      switch (sortBy) {
        case 'price-low':
          filtered.sort((a, b) => (parseFloat(a.price || 0) - parseFloat(b.price || 0)));
          break;
        case 'price-high':
          filtered.sort((a, b) => (parseFloat(b.price || 0) - parseFloat(a.price || 0)));
          break;
        case 'recent':
          filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          break;
        case 'oldest':
          filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          break;
        case 'trending':
          // Ordena por crescimento de valor (growth percent) - maior primeiro
          filtered.sort((a, b) => {
            const growthA = trendData[a.nft_id]?.growth || 0;
            const growthB = trendData[b.nft_id]?.growth || 0;
            return growthB - growthA;
          });
          break;
        default:
          break;
      }

      setFilteredNfts(filtered);
    }

    applyFilters();
  }, [nfts, searchTerm, sortBy, statusFilter, ownershipFilter, currentUserId, trendData, popularityData]);

  const totalItems = nfts.length;
  const forSale = nfts.filter(n => n.status === 'for_sale').length;
  const avgPrice = nfts.length > 0 
    ? (nfts.reduce((sum, n) => sum + parseFloat(n.price || 0), 0) / nfts.length).toFixed(2)
    : '0.00';

  if (loading) {
    return (
      <Container>
        <Loading>🔄 Carregando marketplace...</Loading>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>🛒 Marketplace</Title>
        <Subtitle>Descubra, compre e venda NFTs únicos</Subtitle>
      </Header>

      <Stats>
        <Stat>
          <StatLabel>Total de Itens</StatLabel>
          <StatValue>{totalItems}</StatValue>
        </Stat>
        <Stat>
          <StatLabel>À Venda</StatLabel>
          <StatValue>{forSale}</StatValue>
        </Stat>
        <Stat>
          <StatLabel>Preço Médio</StatLabel>
          <StatValue>{avgPrice} ETH</StatValue>
        </Stat>
      </Stats>

      <FiltersBar>
        <SearchInput
          type="text"
          placeholder="🔍 Buscar NFTs, artistas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <Select value={ownershipFilter} onChange={(e) => setOwnershipFilter(e.target.value)}>
          <option value="all">Todos os NFTs</option>
          <option value="available">🛒 Disponíveis para comprar</option>
          <option value="mine">👤 Meus NFTs</option>
        </Select>
        
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">Todos os status</option>
          <option value="sale">À venda</option>
          <option value="sold">Vendidos</option>
        </Select>

        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="recent">Mais recentes</option>
          <option value="oldest">Mais antigos</option>
          <option value="price-low">Menor preço</option>
          <option value="price-high">Maior preço</option>
          <option value="trending">Maior crescimento</option>
        </Select>
      </FiltersBar>

      {filteredNfts.length === 0 ? (
        <EmptyState>
          <EmptyIcon>🔍</EmptyIcon>
          <EmptyText>
            {searchTerm || statusFilter !== 'all' 
              ? 'Nenhum NFT encontrado com esses filtros' 
              : 'Nenhum NFT disponível no momento'}
          </EmptyText>
        </EmptyState>
      ) : (
        <Grid>
          {filteredNfts.map(nft => {
            const isMyNft = nft.current_owner_id === currentUserId;
            const popularity = popularityData[nft.nft_id]; // Usa dados dinâmicos da API
            const basePrice = parseFloat(nft.price) || 0.1; // Preço base de demonstração
            const suggestedPrice = suggestedData[nft.nft_id]?.suggestedPrice ?? calculateSuggestedPrice(basePrice, nft.favorites_count);
            const hasBonus = suggestedPrice > basePrice;
            const trend = trendData[nft.nft_id];
            
            return (
              <Card key={nft.nft_id} onClick={() => navigate(`/nft/${nft.nft_id}`)}>
                <ImageWrapper>
                  <Image src={nft.image_url} alt={nft.name} />
                  {popularity && (
                    <PopularityBadge $level={popularity.level}>
                      <span>{popularity.icon}</span>
                      <span>{popularity.label}</span>
                    </PopularityBadge>
                  )}
                  {trend && trend.spark && trend.spark.length > 1 && (
                    <TrendBadge>
                      <TrendLabel>trend</TrendLabel>
                      <svg width="40" height="14" viewBox="0 0 40 14">
                        <path 
                          d={buildPath(trend.spark, 40, 14)} 
                          fill="none" 
                          stroke={
                            trend.growth >= 40 ? '#10b981' :  // Verde escuro: crescimento máximo (≥40%)
                            trend.growth >= 20 ? '#22c55e' :  // Verde: crescimento alto
                            trend.growth >= 0 ? '#84cc16' :   // Verde claro: crescimento positivo
                            trend.growth >= -10 ? '#f59e0b' : // Laranja: queda moderada
                            '#ef4444'                          // Vermelho: queda acentuada
                          }
                          strokeWidth="1.4" 
                          strokeLinecap="round" 
                        />
                      </svg>
                      {typeof trend.growth === 'number' && (
                        <TrendText $positive={trend.growth >= 0}>
                          {trend.growth >= 0 ? '↑ ' : '↓ '}{trend.growth >= 0 ? '+' : ''}{trend.growth.toFixed(0)}%
                        </TrendText>
                      )}
                    </TrendBadge>
                  )}
                  {isMyNft ? (
                    <OwnerBadge>
                      <span>👤</span>
                      <span>Meu NFT</span>
                    </OwnerBadge>
                  ) : (
                    (nft.status === 'for_sale' || nft.status === 'listed') && <ForSaleBadge>À Venda</ForSaleBadge>
                  )}
                </ImageWrapper>
                
                <CardInfo>
                  <CardTitle>{nft.name || 'Sem título'}</CardTitle>
                  
                  <CardCreator>
                    <CreatorAvatar $imageUrl={nft.creator_avatar} />
                    <CreatorName onClick={(e) => { e.stopPropagation(); navigate(`/users/${nft.creator_id}`);}}>
                      {nft.creator_name || 'Artista Desconhecido'}
                    </CreatorName>
                  </CardCreator>

                  <PriceSection>
                    <div>
                      <PriceLabel>{hasBonus ? 'Valor Sugerido' : 'Preço Base'}</PriceLabel>
                      <PriceWithInfo>
                        <PriceValue>
                          {suggestedPrice.toFixed(3)} ETH
                        </PriceValue>
                        <InfoIcon title="Detalhes do cálculo">i</InfoIcon>
                        <Tooltip>
                          {suggestedData[nft.nft_id]?.breakdown ? (
                            <>
                              <TipTitle>Preço sugerido — breakdown</TipTitle>
                              <TipRow>
                                <TipKey>Âncora</TipKey>
                                <TipVal>{(suggestedData[nft.nft_id].breakdown.baseAnchor || 0).toFixed(3)} ETH</TipVal>
                              </TipRow>
                              {typeof suggestedData[nft.nft_id].breakdown.floorPrice === 'number' && (
                                <TipRow>
                                  <TipKey>Floor da coleção</TipKey>
                                  <TipVal>{suggestedData[nft.nft_id].breakdown.floorPrice.toFixed(3)} ETH</TipVal>
                                </TipRow>
                              )}
                              <TipRow>
                                <TipKey>Popularidade 24h</TipKey>
                                <TipVal>
                                  {(suggestedData[nft.nft_id].breakdown.fav_24h || 0)} likes → x{suggestedData[nft.nft_id].breakdown.popularityFactor.toFixed(2)}
                                </TipVal>
                              </TipRow>
                              <TipRow>
                                <TipKey>Crescimento</TipKey>
                                <TipVal>
                                  {(suggestedData[nft.nft_id].breakdown.growthPercent >= 0 ? '+' : '')}{(suggestedData[nft.nft_id].breakdown.growthPercent || 0).toFixed(1)}% → x{suggestedData[nft.nft_id].breakdown.growthFactor.toFixed(2)}
                                </TipVal>
                              </TipRow>
                              <TipRow>
                                <TipKey>Reputação do criador</TipKey>
                                <TipVal>
                                  {(suggestedData[nft.nft_id].breakdown.creatorFav14d || 0)} likes/14d → x{suggestedData[nft.nft_id].breakdown.reputationFactor.toFixed(2)}
                                </TipVal>
                              </TipRow>
                            </>
                          ) : (
                            <>
                              <TipTitle>Preço sugerido — estimativa local</TipTitle>
                              <TipRow>
                                <TipKey>Âncora</TipKey>
                                <TipVal>{basePrice.toFixed(3)} ETH</TipVal>
                              </TipRow>
                              <TipRow>
                                <TipKey>Heurística</TipKey>
                                <TipVal>(favoritos/5) × 8% do base</TipVal>
                              </TipRow>
                              <div style={{marginTop:8, fontSize:'.8em', color:'rgba(255,255,255,0.6)'}}>
                                Dica: interaja com o item para o backend gerar sinais e liberar o breakdown completo.
                              </div>
                            </>
                          )}
                        </Tooltip>
                      </PriceWithInfo>
                      {hasBonus && (
                        <div style={{ fontSize: '0.75em', color: 'rgba(34, 197, 94, 0.8)', marginTop: '4px' }}>
                          +{(((suggestedPrice / basePrice) - 1) * 100).toFixed(1)}% por popularidade
                        </div>
                      )}
                    </div>
                    <RightCol>
                      {nft.favorites_count > 0 && (
                        <div style={{ fontSize: '0.85em', color: 'rgba(255, 255, 255, 0.6)' }}>
                          ❤️ {nft.favorites_count}
                        </div>
                      )}
                      {(nft.status === 'for_sale' || nft.status === 'listed') && (
                        <BuyButton
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/nft/${nft.nft_id}`);
                          }}
                          aria-label={`Comprar ${nft.name}`}
                          title="Ir para a página e concluir a compra"
                        >
                          Comprar
                        </BuyButton>
                      )}
                    </RightCol>
                  </PriceSection>
                </CardInfo>
              </Card>
            );
          })}
        </Grid>
      )}
    </Container>
  );
}

export default Marketplace;
