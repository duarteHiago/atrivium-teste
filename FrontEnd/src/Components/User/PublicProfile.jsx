import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE } from '../../config/api';

const Container = styled.div`
  max-width: 1100px;
  margin: 24px auto;
  color: #fff;
`;

const Banner = styled.div`
  position: relative;
  height: 260px;
  border-radius: 12px;
  overflow: hidden;
  background: ${p => p.$img ? `url(${p.$img}) center/cover no-repeat` : 'linear-gradient(135deg,#667eea,#764ba2)'};
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
  padding-left: 180px;
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

const Section = styled.div`
  margin-top: 28px; padding: 0 24px;
`;

const NftGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding-top: 20px;
  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

const Card = styled.div`
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(30, 30, 31, 1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
    border-color: rgba(102, 126, 234, 0.4);
  }
`;

const CardImg = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
`;

const CardBody = styled.div`
  padding: 12px;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  margin-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [collections, setCollections] = useState([]);
  const [created, setCreated] = useState([]);
  const [owned, setOwned] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const r = await fetch(`${API_BASE}/api/users/${id}/public-profile`);
        const d = await r.json();
        if (!r.ok) throw new Error(d.message || 'Falha ao carregar perfil público');
        setUser(d.user);
        setStats(d.stats);
        setCollections(d.collections || []);
        setCreated(d.created || []);
        setOwned(d.owned || []);
      } catch {
        // Navega para home se não encontrou
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id, navigate]);

  if (loading) return <Container><p>Carregando...</p></Container>;
  if (!user) return <Container><p>Perfil não encontrado.</p></Container>;

  return (
    <Container>
      <Banner $img={user.banner_url} />
      <AvatarWrap>
        <Avatar>
          {user.avatar_url ? <img src={user.avatar_url} alt="Avatar" /> : null}
        </Avatar>
      </AvatarWrap>
      <Stats>
        <Stat><span>NFTs criados</span><b>{stats?.created ?? 0}</b></Stat>
        <Stat><span>NFTs em propriedade</span><b>{stats?.owned ?? 0}</b></Stat>
        <Stat><span>Coleções</span><b>{stats?.collections ?? 0}</b></Stat>
      </Stats>
      <Header>
        <Info>
          <Name>{user.first_name} {user.last_name}</Name>
          <Nick>{user.nickname ? `@${user.nickname.replace(/^@/, '')}` : user.email}</Nick>
        </Info>
      </Header>

      <Section>
        <h3>Coleções</h3>
        {collections.length === 0 ? <p>Nenhuma coleção criada ainda.</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {collections.map(c => (
              <div key={c.collection_id} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden', background: 'rgba(30,30,31,1)', cursor: 'pointer' }} onClick={() => navigate(`/collections/${c.collection_id}`)}>
                <img src={c.banner_url || '/default-collection.png'} alt={c.name} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                <div style={{ padding: 12 }}>
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                  <div style={{ opacity: 0.8, fontSize: '.9rem' }}>{c.nfts_count || 0} NFT(s)</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section>
        <h3>NFTs Criados</h3>
        {created.length === 0 ? <p>Nenhum NFT criado ainda.</p> : (
          <NftGrid>
            {created.map(n => (
              <Card key={n.nft_id} onClick={() => navigate(`/nft/${n.nft_id}`)}>
                <CardImg src={n.image_url} alt={n.name || 'NFT'} />
                <CardBody>
                  <div style={{fontWeight:600}}>{n.name || 'Sem nome'}</div>
                  <div style={{opacity:0.8, fontSize:'0.9rem'}}>{n.description || n.prompt || ''}</div>
                </CardBody>
                <CardFooter>
                  <div style={{fontSize:'0.85rem', opacity:0.7}}>
                    {new Date(n.created_at).toLocaleDateString('pt-BR')}
                  </div>
                  {n.favorites_count > 0 && (
                    <div style={{ fontSize: '0.85em', color: 'rgba(255, 255, 255, 0.6)' }}>
                      ❤️ {n.favorites_count}
                    </div>
                  )}
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
              <Card key={n.nft_id} onClick={() => navigate(`/nft/${n.nft_id}`)}>
                <CardImg src={n.image_url} alt={n.name || 'NFT'} />
                <CardBody>
                  <div style={{fontWeight:600}}>{n.name || 'Sem nome'}</div>
                  <div style={{opacity:0.8, fontSize:'0.9rem'}}>{n.description || n.prompt || ''}</div>
                </CardBody>
                <CardFooter>
                  <div style={{fontSize:'0.85rem', opacity:0.7}}>
                    {new Date(n.created_at).toLocaleDateString('pt-BR')}
                  </div>
                  {n.favorites_count > 0 && (
                    <div style={{ fontSize: '0.85em', color: 'rgba(255, 255, 255, 0.6)' }}>
                      ❤️ {n.favorites_count}
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </NftGrid>
        )}
      </Section>
    </Container>
  );
}
