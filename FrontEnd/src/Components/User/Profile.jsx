import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { API_BASE } from '../../config/api';
// import { useNavigate } from 'react-router-dom';
import Modal from '../Modal/Modal';
import EditProfileModal from './EditProfileModal';

const Container = styled.div`
  max-width: 1100px;
  margin: 24px auto;
  color: #fff;
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
  background: rgba(0,0,0,0.35);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 10px;
  padding: 10px 14px;
  cursor: pointer;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  transition: background .2s ease, transform .1s ease;
  &:hover { background: rgba(0,0,0,0.5); }
  &:active { transform: translateY(1px); }
`;

const AvatarWrap = styled.div`
  position: relative; height: 0;
`;

const Avatar = styled.div`
  width: 140px; height: 140px; border-radius: 50%; overflow: hidden; border: 4px solid #1e1e1f;
  position: relative; top: -70px; margin-left: 24px; box-shadow: 0 8px 24px rgba(0,0,0,.35);
  background: rgba(255,255,255,0.06);
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
`;

const Nick = styled.div`
  opacity: .8;
`;

const Bio = styled.div`
  padding: 0 24px;
  margin-top: 32px;
  opacity: .9;
  max-width: 720px;
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
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 8px 10px;
  min-width: 100px;
  span { display:block; font-size: .72rem; opacity: .8 }
  b { display:block; font-size: 1rem; }
`;

const Message = styled.p`
  color: ${p => p.error ? '#ff6b6b' : '#9BE69B'};
`;

const NftGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

const Card = styled.div`
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  overflow: hidden;
  background: rgba(255,255,255,0.03);
`;

const CardImg = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
`;

const CardBody = styled.div`
  padding: 10px;
`;

export default function Profile({ onRequireLogin }) {
  // const navigate = useNavigate();
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

  if (loading) return <Container $bgColor={bgColor}><p>Carregando...</p></Container>;

  return (
    <>
  <Container $bgColor={bgColor}>
      {error && <Message error>{error}</Message>}

      {user && (
        <>
          <Banner $img={user.banner_url}>
            <EditOverlayBtn onClick={() => setIsEditOpen(true)}>Editar Perfil</EditOverlayBtn>
          </Banner>
          <AvatarWrap>
            <Avatar>
              {user.avatar_url ? <img src={user.avatar_url} alt="Avatar" /> : null}
            </Avatar>
          </AvatarWrap>
          {/* Stats agora ficam logo abaixo do banner, alinhados à direita */}
          <Stats>
            <Stat><span>NFTs criados</span><b>{profile?.stats?.created ?? created.length}</b></Stat>
            <Stat><span>NFTs em propriedade</span><b>{profile?.stats?.owned ?? owned.length}</b></Stat>
            <Stat><span>Coleções</span><b>{profile?.stats?.collections ?? 0}</b></Stat>
            <Stat><span>Transações</span><b>{profile?.stats?.transactions ?? 0}</b></Stat>
          </Stats>
          <Header>
            <Info>
              <Name>{user.first_name} {user.last_name}</Name>
              <Nick>{user.nickname ? `@${user.nickname.replace(/^@/, '')}` : user.email}</Nick>
            </Info>
          </Header>



          {user.bio && (
            <Bio>
              {user.bio.length > 60
                ? user.bio.slice(0, 60) + '...'
                : user.bio}
            </Bio>
          )}

          <Section>
            <h3>Suas Coleções</h3>
            {collections.length === 0 ? <p>Nenhuma coleção criada.</p> : (
              <NftGrid>
                {collections.map(c => (
                  <Card key={c.collection_id}>
                    <CardImg src={c.banner_image} alt={c.name} />
                    <CardBody>
                      <div style={{fontWeight:600}}>{c.name}</div>
                      <div style={{opacity:0.8, fontSize:'0.9rem'}}>{c.nfts_count} itens</div>
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
                  <Card key={n.nft_id}>
                    <CardImg src={n.image_url} alt={n.name || 'NFT'} />
                    <CardBody>
                      <div style={{fontWeight:600}}>{n.name || 'Sem nome'}</div>
                      <div style={{opacity:0.8, fontSize:'0.9rem'}}>{n.description || n.prompt || ''}</div>
                    </CardBody>
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
                  <Card key={n.nft_id}>
                    <CardImg src={n.image_url} alt={n.name || 'NFT'} />
                    <CardBody>
                      <div style={{fontWeight:600}}>{n.name || 'Sem nome'}</div>
                      <div style={{opacity:0.8, fontSize:'0.9rem'}}>{n.description || n.prompt || ''}</div>
                    </CardBody>
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
