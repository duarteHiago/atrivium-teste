import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { API_BASE } from '../../config/api';

const Container = styled.div`
  max-width: 1200px;
  margin: 24px auto;
  padding: 20px;
  color: #fff;
`;

const Title = styled.h1`
  margin: 0 0 10px 0;
  font-size: 2em;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  margin: 0 0 30px 0;
  color: rgba(255,255,255,0.6);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const Card = styled.div`
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(30, 30, 31, 0.8);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  }
`;

const CardImg = styled.img`
  width: 100%;
  height: 250px;
  object-fit: cover;
  display: block;
`;

const CardBody = styled.div`
  padding: 16px;
`;

const CardTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 1.1em;
  font-weight: 600;
  color: white;
`;

const CardDescription = styled.p`
  margin: 0;
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.6);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const Message = styled.p`
  color: ${p => p.error ? '#ff6b6b' : 'rgba(255,255,255,0.7)'};
  text-align: center;
  padding: 40px 20px;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.8em;
  font-weight: 600;
  margin-top: 8px;
  background: ${p => p.type === 'creator' ? 'rgba(102, 126, 234, 0.2)' : 'rgba(118, 75, 162, 0.2)'};
  color: ${p => p.type === 'creator' ? '#667eea' : '#764ba2'};
`;

export default function Gallery() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('Você precisa estar logado para ver sua galeria.');
      return;
    }

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/api/users/me/gallery`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Falha ao carregar galeria');
        setNfts(data.nfts || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  if (loading) return <Container><Message>Carregando galeria...</Message></Container>;
  if (error) return <Container><Message error>{error}</Message></Container>;

  return (
    <Container>
      <Title>🖼️ Minha Galeria</Title>
      <Subtitle>Seus NFTs criados e em propriedade</Subtitle>

      {nfts.length === 0 ? (
        <Message>Você ainda não possui NFTs. Crie seu primeiro NFT agora!</Message>
      ) : (
        <Grid>
          {nfts.map(nft => {
            const userId = localStorage.getItem('creatorId');
            const isCreator = nft.creator_id === userId;
            const isOwner = nft.current_owner_id === userId;

            return (
              <Card key={nft.nft_id}>
                <CardImg src={nft.image_url} alt={nft.name || 'NFT'} />
                <CardBody>
                  <CardTitle>{nft.name || 'NFT sem nome'}</CardTitle>
                  <CardDescription>
                    {nft.description || nft.prompt || 'Gerado com IA'}
                  </CardDescription>
                  <div style={{ marginTop: 8 }}>
                    {isCreator && <Badge type="creator">Criador</Badge>}
                    {isOwner && !isCreator && <Badge type="owner">Proprietário</Badge>}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </Grid>
      )}
    </Container>
  );
}
