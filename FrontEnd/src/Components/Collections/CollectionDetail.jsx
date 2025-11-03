import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { API_BASE } from '../../config/api';
import FavoriteButton from '../FavoriteButton/FavoriteButton';
import EditCollectionModal from './EditCollectionModal';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 30px 60px;
`;

const BackButton = styled.button`
  background: transparent;
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.8);
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 16px;
  &:hover { border-color: rgba(255,255,255,0.3); }
`;

const Actions = styled.div`
  display: flex; gap: 10px; align-items: center; margin-left: auto;
`;

const ActionBtn = styled.button`
  padding: 8px 12px; border-radius: 8px; cursor: pointer; border: 1px solid rgba(255,255,255,0.15);
  color: #fff; background: ${p => p.$variant === 'danger' ? 'rgba(239,68,68,0.18)' : 'rgba(255,255,255,0.08)'};
  &:hover { border-color: ${p => p.$variant === 'danger' ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.35)'}; }
`;

const Banner = styled.div`
  position: relative;
  height: 300px;
  border-radius: 16px;
  overflow: hidden;
  background: ${p => p.$imageUrl ? `url(${p.$imageUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  z-index: 1;
`;

const BannerOverlay = styled.div`
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.1));
`;

// Conteúdo que fica por cima do banner (título e descrição)
const BannerContent = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  /* alinhar topo do texto com o topo do avatar (banner 300px - overlap 60px = 240px) */
  top: 240px;
  z-index: 2;
  padding: 0 20px;
  /* alinhamento horizontal com o avatar (120 + borda 8 + gap ~20 + padding 8) */
  padding-left: 156px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const BannerLeft = styled.div`
  flex: 1;
`;

const BannerRight = styled.div`
  text-align: right;
  padding-top: 4px;
`;

const CreatorLabel = styled.div`
  font-size: 0.85em;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
`;

const CreatorName = styled.div`
  font-size: 1.1em;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 600;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
`;

const Header = styled.div`
  position: relative;
  z-index: 3; /* acima do conteúdo do banner */
  display: flex;
  align-items: flex-end;
  gap: 20px;
  margin-top: -60px; /* sobrepõe o banner intencionalmente */
  padding: 0 8px;
  pointer-events: none; /* evita bloquear cliques no conteúdo do banner */
`;

const Avatar = styled.div`
  width: 120px; height: 120px;
  border-radius: 16px;
  border: 4px solid #121212;
  background: ${p => p.$imageUrl ? `url(${p.$imageUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  box-shadow: 0 10px 24px rgba(0,0,0,0.35);
`;

/* Removed: TitleBlock não é mais necessário pois o título/descrição ficam no Banner */

const Title = styled.h1`
  margin: 0;
  /* fonte menor para caber no banner mantendo alinhamento */
  font-size: 1.8em;
  line-height: 1.1;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
`;

const Description = styled.p`
  color: rgba(255,255,255,0.7);
  margin-top: 2px; /* encosta melhor entre título e base do banner */
  font-size: 0.9em; /* levemente menor para garantir que caiba */
  line-height: 1.1;
  white-space: nowrap; /* mantém em uma linha */
  overflow: hidden; /* evita transbordar abaixo do banner */
  text-overflow: ellipsis; /* adiciona reticências se necessário */
  max-width: 900px;
`;

const Stats = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 16px;
  padding-bottom: 8px;
`;

// Linha de stats posicionada abaixo do banner e alinhada com o avatar
const StatsBelow = styled(Stats)`
  margin-top: 0;
  /* remove padding esquerdo para alinhar exatamente com o título/descrição */
  padding: 8px 0 0 0;
  margin-left: 156px; /* mesmo offset do BannerContent */
  position: relative;
  /* base dos stats alinhada à base do avatar */
  transform: translateY(calc(-100% - 8px));
`;

const Stat = styled.div`
  display: flex; flex-direction: column; gap: 4px;
`;

const StatLabel = styled.span`
  color: rgba(255,255,255,0.5); font-size: 0.8em;
`;

const StatValue = styled.span`
  color: #fff; font-weight: 600;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  margin-top: 24px;
  padding-top: 20px; /* Espaço para animação não ser cortada */
`;

const Card = styled.div`
  background: rgba(30,30,31,1);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  transform-style: preserve-3d;
  perspective: 1000px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(102, 126, 234, 0.1) 0%,
      rgba(118, 75, 162, 0.1) 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: 12px;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-12px) rotateX(5deg) scale(1.02);
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.4),
      0 0 20px rgba(102, 126, 234, 0.3);
    border-color: rgba(102, 126, 234, 0.5);
  }

  &:hover::before {
    opacity: 1;
  }

  &:active {
    transform: translateY(-8px) rotateX(2deg) scale(1.01);
  }
`;

const Img = styled.img`
  width: 100%; aspect-ratio: 1; object-fit: cover;
`;

const CardInfo = styled.div`
  padding: 12px;
`;

const CardFooter = styled.div`
  position: absolute;
  right: 10px;
  bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  border-top: none; /* remove a linha do footer */
  background: transparent;
`;

const FavoriteBadge = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 8px 14px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  gap: 6px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  z-index: 2;
  
  span { color: #ff4b64; }
`;

const Loading = styled.div`
  padding: 60px; text-align: center; color: rgba(255,255,255,0.8);
`;

const ErrorBox = styled.div`
  padding: 16px; margin: 16px 0; color: #ff6b6b; border: 1px solid rgba(255,0,0,0.3); border-radius: 8px; background: rgba(255,0,0,0.08);
`;

function CollectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

  const canManage = useMemo(() => {
    try {
      const role = localStorage.getItem('role');
      const me = localStorage.getItem('creatorId');
      if (role === 'admin') return true;
      if (collection?.creator_id && me && collection.creator_id === me) return true;
    } catch { /* ignore */ }
    return false;
  }, [collection]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true); setError(null);
        const [cRes, nRes] = await Promise.all([
          fetch(`${API_BASE}/api/collections/${id}`),
          fetch(`${API_BASE}/api/collections/${id}/nfts`)
        ]);
        const cData = await cRes.json();
        const nData = await nRes.json();
        if (!cRes.ok) throw new Error(cData.message || 'Erro ao carregar coleção');
        if (!nRes.ok) throw new Error(nData.message || 'Erro ao carregar NFTs da coleção');
        if (!active) return;
        setCollection(cData.collection || cData);
        setNfts(nData.nfts || []);
      } catch (e) {
        if (!active) return; setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [id]);

  if (loading) return <Loading>Carregando coleção...</Loading>;
  if (error) return <Container><BackButton onClick={() => navigate(-1)}>← Voltar</BackButton><ErrorBox>❌ {error}</ErrorBox></Container>;
  if (!collection) return <Container><BackButton onClick={() => navigate(-1)}>← Voltar</BackButton><ErrorBox>Coleção não encontrada.</ErrorBox></Container>;

  const items = (collection.nft_count ?? nfts.length);
  const floor = parseFloat(collection.floor_price || 0);
  const volume = parseFloat(collection.total_volume || 0);
  const rawDesc = collection.description || '';
  const shortDesc = rawDesc.length > 100 ? rawDesc.slice(0, 100).trimEnd() + '…' : rawDesc;

  return (
    <Container>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <BackButton onClick={() => navigate(-1)}>← Voltar</BackButton>
        {canManage && (
          <Actions>
            <ActionBtn onClick={() => setEditOpen(true)}>✏️ Editar</ActionBtn>
            <ActionBtn $variant="danger" onClick={async () => {
              if (!window.confirm('Tem certeza que deseja excluir esta coleção? Esta ação não pode ser desfeita.')) return;
              try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                const res = await fetch(`${API_BASE}/api/collections/${collection.collection_id}`, {
                  method: 'DELETE',
                  headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                  }
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok || data.success === false) throw new Error(data.message || 'Falha ao excluir coleção');
                navigate('/collections');
              } catch (e) {
                alert(e.message);
              }
            }}>🗑️ Excluir</ActionBtn>
          </Actions>
        )}
      </div>
      <Banner $imageUrl={collection.banner_image}>
        {collection.total_favorites > 0 && (
          <FavoriteBadge>
            <span>❤️</span> {collection.total_favorites}
          </FavoriteBadge>
        )}
        <BannerOverlay />
        <BannerContent>
          <BannerLeft>
            <Title>{collection.name}</Title>
            {collection.description && (
              <Description title={rawDesc}>{shortDesc}</Description>
            )}
          </BannerLeft>
          <BannerRight>
            <CreatorLabel>Criado por</CreatorLabel>
            <CreatorName>
              {collection.creator_name || collection.creator_cpf || 'Desconhecido'}
            </CreatorName>
          </BannerRight>
        </BannerContent>
      </Banner>
      <Header>
        <Avatar $imageUrl={collection.banner_image} />
      </Header>

      <StatsBelow>
        <Stat>
          <StatLabel>Items</StatLabel>
          <StatValue>{items}</StatValue>
        </Stat>
        <Stat>
          <StatLabel>Floor</StatLabel>
          <StatValue>{floor.toFixed(2)} ETH</StatValue>
        </Stat>
        <Stat>
          <StatLabel>Volume</StatLabel>
          <StatValue>{volume.toFixed(2)} ETH</StatValue>
        </Stat>
      </StatsBelow>

      {nfts.length === 0 ? (
        <Loading style={{marginTop: 20}}>Nenhum NFT nesta coleção ainda.</Loading>
      ) : (
        <Grid>
          {nfts.map(nft => (
            <Card key={nft.nft_id} onClick={() => navigate(`/nft/${nft.nft_id}`)}>
              <Img src={nft.image_url} alt={nft.name || 'NFT'} />
              <CardInfo>
                <div style={{fontWeight:600}}>{nft.name || 'Sem nome'}</div>
                <div style={{opacity:.7, fontSize:'.9em'}}>{new Date(nft.created_at).toLocaleDateString('pt-BR')}</div>
              </CardInfo>
              <CardFooter>
                <div onClick={(e) => e.stopPropagation()}>
                  <FavoriteButton 
                    nftId={nft.nft_id}
                    initialCount={nft.favorites_count || 0}
                    initialIsFavorited={nft.is_favorited || false}
                    compact={true}
                    showCount={true}
                  />
                </div>
              </CardFooter>
            </Card>
          ))}
        </Grid>
      )}

      <EditCollectionModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        collection={collection}
        onSaved={(updated) => {
          setCollection(prev => ({ ...prev, ...(updated || {}) }));
        }}
      />
    </Container>
  );
}

export default CollectionDetail;
