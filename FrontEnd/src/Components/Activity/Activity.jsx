import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { API_BASE } from '../../config/api';

const Container = styled.div`
  padding: 24px;
`;

const Title = styled.h1`
  font-size: 1.6em;
  margin: 0 0 16px 0;
`;

const Tabs = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
`;

const TabButton = styled.button`
  background: ${p => p.$active ? 'rgba(255,255,255,0.14)' : 'transparent'};
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  color: white;
  padding: 8px 12px;
  cursor: pointer;
  font-weight: 500;
  &:hover { background: rgba(255,255,255,0.08); }
`;

const List = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
`;

const Item = styled.div`
  display: grid;
  grid-template-columns: 64px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  background: rgba(30,30,31,1);
`;

const Thumb = styled.img`
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
  background: rgba(255,255,255,0.06);
`;

const Meta = styled.div`
  display: grid;
  gap: 4px;
`;

const Line = styled.div`
  color: rgba(255,255,255,0.9);
`;

const Sub = styled.div`
  color: rgba(255,255,255,0.6);
  font-size: 0.9em;
`;

const Amount = styled.div`
  font-weight: 600;
`;

const formatDateTime = (iso) => {
  const date = new Date(iso);
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
}

const typeLabel = {
  bought: 'Você comprou',
  sold: 'Você vendeu',
  created: 'Você criou'
};

export default function Activity() {
  const [active, setActive] = useState('all'); // all | bought | sold | created
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const r = await fetch(`${API_BASE}/api/users/me/activity?page=1&limit=50`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await r.json();
        if (!r.ok || data.success === false) throw new Error(data.message || 'Erro ao carregar atividade');
        setItems(data.activity || []);
      } catch (e) {
        console.error('Erro ao carregar atividade:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  const filtered = useMemo(() => {
    if (active === 'all') return items;
    return items.filter(i => i.event_type === active);
  }, [items, active]);

  return (
    <Container>
      <Title>Activity</Title>

      <Tabs>
        {['all','bought','sold','created'].map(key => (
          <TabButton key={key} $active={active === key} onClick={() => setActive(key)}>
            {key === 'all' ? 'Tudo' : key === 'bought' ? 'Compras' : key === 'sold' ? 'Vendas' : 'Criações'}
          </TabButton>
        ))}
      </Tabs>

      {loading && <div>Carregando…</div>}
      {error && <div style={{color:'#f55'}}>Erro: {error}</div>}

      {!loading && !error && (
        <List>
          {filtered.length === 0 ? (
            <div style={{ opacity: .7 }}>Nenhuma atividade encontrada.</div>
          ) : (
            filtered.map((it, idx) => (
              <Item key={it.transaction_id || `${it.event_type}-${it.nft?.nft_id}-${idx}`}>
                <Thumb src={it.nft?.image_url} alt={it.nft?.name || 'NFT'} />
                <Meta>
                  <Line>
                    {typeLabel[it.event_type] || it.event_type} <strong>{it.nft?.name || 'NFT'}</strong>
                    {it.nft?.collection_name ? ` · ${it.nft.collection_name}` : ''}
                  </Line>
                  <Sub>{formatDateTime(it.created_at)}</Sub>
                </Meta>
                <Amount>
                  {it.amount_eth ? `${it.amount_eth.toFixed(4)} ETH` : ''}
                </Amount>
              </Item>
            ))
          )}
        </List>
      )}
    </Container>
  );
}
