import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { API_BASE } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import Modal from '../Modal/Modal';
import EditProfileModal from './EditProfileModal';
import FavoriteButton from '../FavoriteButton/FavoriteButton';
import { useTheme } from '../../contexts/ThemeContext';

const Container = styled.div`
  max-width: 1100px;
  margin: 24px auto;
  color: ${props => props.theme.text.primary};
  background: ${p => p.$bgColor || 'none'};
  border-radius: 16px;
`;

const Banner = styled.div`
  position: relative;
  height: 260px;
  border-radius: 12px;
  overflow: hidden;
  background: ${p => p.$img ? `url(${p.$img}) center/cover no-repeat` : 'linear-gradient(135deg,#667eea,#764ba2)'};
`;

const EditOverlayBtn = styled.button`
  position: absolute;
  right: 16px;
  bottom: 16px;
  background: ${props => props.theme.mode === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.35)'};
  color: ${props => props.theme.mode === 'light' ? props.theme.text.primary : '#fff'};
  border: 1px solid ${props => props.theme.border.primary};
  border-radius: 10px;
  padding: 10px 14px;
  cursor: pointer;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: background .2s ease, transform .1s ease;
  &:hover { 
    background: ${props => props.theme.mode === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.5)'};
  }
  &:active { transform: translateY(1px); }
`;

const AvatarWrap = styled.div`
  position: relative; height: 0;
`;

const Avatar = styled.div`
  width: 140px; height: 140px; border-radius: 50%; overflow: hidden; 
  border: 4px solid ${props => props.theme.background.primary};
  position: relative; top: -70px; margin-left: 24px; 
  box-shadow: ${props => props.theme.shadow.lg};
  background: ${props => props.theme.background.hover};
  img { width: 100%; height: 100%; object-fit: cover; display: block; }
`;

const Header = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-top: -60px;
  padding: 0 24px 0;
  padding-left: 180px; /* empurra o nome para a frente do avatar */
  @media (max-width: 720px) {
    margin-top: 0;
    padding-left: 24px;
  }
`;

const Info = styled.div`
  display: flex; flex-direction: column; gap: 2px;
`;

const Name = styled.h2`
  margin: 0; font-size: 1.8rem; line-height: 1.1;
  color: ${props => props.theme.text.primary};
`;

const Nick = styled.div`
  opacity: .8;
  color: ${props => props.theme.text.secondary};
`;

const Bio = styled.div`
  padding: 0 24px;
  margin-top: 32px;
  opacity: .9;
  max-width: 720px;
  color: ${props => props.theme.text.secondary};
`;

/* Botão antigo removido do header; agora usamos o EditOverlayBtn sobre o banner */

const Title = styled.h2`
  margin-top: 0;
`;

const Section = styled.div`
  margin-top: 28px; padding: 0 24px;
`;

const Stats = styled.div`
  display: flex;
  gap: 12px;
  padding: 8px 24px 0;
  margin-top: 8px;
  justify-content: flex-end;
  flex-wrap: wrap;
`;

const Stat = styled.div`
  background: ${props => props.theme.mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.06)'};
  border: 1px solid ${props => props.theme.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'};
  border-radius: 10px;
  padding: 8px 10px;
  min-width: 100px;
  span { display:block; font-size: .72rem; color: ${props => props.theme.text.primary}; }
  b { display:block; font-size: 1rem; color: ${props => props.theme.text.primary}; }
`;

const Message = styled.p`
  color: ${p => p.error ? '#ff6b6b' : '#9BE69B'};
`;

const NftGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding-top: 20px; /* Espaço para animação não ser cortada */
  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

const Card = styled.div`
  border: 1px solid ${props => props.theme.mode === 'light' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)'};
  border-radius: 12px;
  overflow: hidden;
  background: rgba(30, 30, 31, 1);
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

const CardImg = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
`;

const CardBody = styled.div`
  padding: 10px;
  color: #ffffff;
  
  div:first-child {
    color: #ffffff;
  }
  
  span {
    color: rgba(255, 255, 255, 0.9);
  }
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 10px 10px 10px; /* padding-top aumentado para dar respiro da linha */
  margin-top: 8px;
  border-top: 1px solid ${props => props.theme.mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'};
  
  div {
    color: rgba(255, 255, 255, 0.9);
  }
`;

export default function Profile({ onRequireLogin }) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [created, setCreated] = useState([]);
  const [owned, setOwned] = useState([]);
  const [collections, setCollections] = useState([]);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const token = useMemo(() => {
    try { return localStorage.getItem('token'); } catch { return null; }
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('Você precisa estar logado para acessar o perfil.');
      if (typeof onRequireLogin === 'function') onRequireLogin();
      return;
    }

    const load = async () => {
      setLoading(true); setError('');
      try {
        const r = await fetch(`${API_BASE}/api/users/me/profile`, { headers: { Authorization: `Bearer ${token}` } });
        const d = await r.json();
        if (!r.ok) throw new Error(d.message || 'Falha ao carregar dados');
        setUser(d.user);
        setProfile({ stats: d.stats });
        setCollections(d.collections || []);

        const n = await fetch(`${API_BASE}/api/users/me/nfts`, { headers: { Authorization: `Bearer ${token}` } });
        const nd = await n.json();
        if (!n.ok) throw new Error(nd.message || 'Falha ao carregar NFTs');
        setCreated(nd.created || []);
        setOwned(nd.owned || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token, onRequireLogin]);

  const reload = async () => {
    try {
      const r = await fetch(`${API_BASE}/api/users/me/profile`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      if (r.ok) {
        setUser(d.user);
        setProfile({ stats: d.stats });
        setCollections(d.collections || []);
      }
    } catch { /* ignore */ }
  };

  // Exemplo: cor predominante do banner (pode ser extraída via lib ou lógica própria)
  // Aqui, só para exemplo, se o banner for escuro, usa um fundo escuro; senão, transparente.
  let bgColor = 'none';
  if (user?.banner_url && typeof user.banner_url === 'string' && user.banner_url.match(/black|preto|dark|escuro/)) {
    bgColor = '#18181a';
  }

  if (loading) return <Container theme={theme} $bgColor={bgColor}><p>Carregando...</p></Container>;

  return (
    <>
  <Container theme={theme} $bgColor={bgColor}>
      {error && <Message error>{error}</Message>}

      {user && (
        <>
          <Banner $img={user.banner_url}>
            <EditOverlayBtn theme={theme} onClick={() => setIsEditOpen(true)}>Editar Perfil</EditOverlayBtn>
          </Banner>
          <AvatarWrap>
            <Avatar theme={theme}>
              {user.avatar_url ? <img src={user.avatar_url} alt="Avatar" /> : null}
            </Avatar>
          </AvatarWrap>
          {/* Stats agora ficam logo abaixo do banner, alinhados à direita */}
          <Stats>
            <Stat theme={theme}><span>NFTs criados</span><b>{profile?.stats?.created ?? created.length}</b></Stat>
            <Stat theme={theme}><span>NFTs em propriedade</span><b>{profile?.stats?.owned ?? owned.length}</b></Stat>
            <Stat theme={theme}><span>Coleções</span><b>{profile?.stats?.collections ?? 0}</b></Stat>
            <Stat theme={theme}><span>Transações</span><b>{profile?.stats?.transactions ?? 0}</b></Stat>
          </Stats>
          <Header>
            <Info>
              <Name theme={theme}>{user.first_name} {user.last_name}</Name>
              <Nick theme={theme}>{user.nickname ? `@${user.nickname.replace(/^@/, '')}` : user.email}</Nick>
            </Info>
          </Header>



          {user.bio && (
            <Bio theme={theme}>
              {user.bio.length > 60
                ? user.bio.slice(0, 60) + '...'
                : user.bio}
            </Bio>
          )}

          <Section>
            <h3>Coleções</h3>
            {collections.length === 0 ? <p>Nenhuma coleção criada ainda.</p> : (
              <NftGrid>
                {collections.map(c => (
                  <Card theme={theme} key={c.collection_id} onClick={() => navigate(`/collections/${c.collection_id}`)}>
                    <CardImg src={c.banner_url || '/default-collection.png'} alt={c.name} />
                    <CardBody>
                      <div style={{fontWeight:600}}>{c.name}</div>
                      <div style={{display:'flex', alignItems:'center', gap:'8px', marginTop:'4px'}}>
                        <span style={{opacity:0.8, fontSize:'0.9rem'}}>{c.nfts_count || 0} NFT(s)</span>
                        {c.total_favorites > 0 && (
                          <CollectionFavBadge>
                            <span>❤️</span> {c.total_favorites}
                          </CollectionFavBadge>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </NftGrid>
            )}
          </Section>

          <Section>
            <h3>NFTs Criados</h3>
            {created.length === 0 ? <p>Nenhum NFT criado ainda.</p> : (
              <NftGrid>
                {created.map(n => (
                  <Card theme={theme} key={n.nft_id} onClick={() => navigate(`/nft/${n.nft_id}`)}>
                    <CardImg src={n.image_url} alt={n.name || 'NFT'} />
                    <CardBody>
                      <div style={{fontWeight:600}}>{n.name || 'Sem nome'}</div>
                      <div style={{opacity:0.8, fontSize:'0.9rem'}}>{n.description || n.prompt || ''}</div>
                    </CardBody>
                    <CardFooter theme={theme}>
                      <div style={{fontSize:'0.85rem', opacity:0.7}}>
                        {new Date(n.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <FavoriteButton 
                          nftId={n.nft_id} 
                          initialCount={n.favorites_count || 0}
                          initialIsFavorited={n.is_favorited || false}
                          compact={true}
                          showCount={true}
                        />
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </NftGrid>
            )}
          </Section>

          <Section>
            <h3>NFTs em Propriedade</h3>
            {owned.length === 0 ? <p>Nenhum NFT em propriedade.</p> : (
              <NftGrid>
                {owned.map(n => (
                  <Card theme={theme} key={n.nft_id} onClick={() => navigate(`/nft/${n.nft_id}`)}>
                    <CardImg src={n.image_url} alt={n.name || 'NFT'} />
                    <CardBody>
                      <div style={{fontWeight:600}}>{n.name || 'Sem nome'}</div>
                      <div style={{opacity:0.8, fontSize:'0.9rem'}}>{n.description || n.prompt || ''}</div>
                    </CardBody>
                    <CardFooter theme={theme}>
                      <div style={{fontSize:'0.85rem', opacity:0.7}}>
                        {new Date(n.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <FavoriteButton 
                          nftId={n.nft_id} 
                          initialCount={n.favorites_count || 0}
                          initialIsFavorited={n.is_favorited || false}
                          compact={true}
                          showCount={true}
                        />
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </NftGrid>
            )}
          </Section>
        </>
      )}
    </Container>

    <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
      <EditProfileModal initialUser={user} onClose={() => setIsEditOpen(false)} onSaved={reload} />
    </Modal>
  </>
  );
}

const CollectionFavBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(255, 75, 100, 0.15);
  border: 1px solid rgba(255, 75, 100, 0.3);
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #ff4b64;
  
  span {
    font-size: 0.9rem;
  }
`;
