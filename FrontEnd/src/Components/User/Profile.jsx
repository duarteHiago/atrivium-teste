import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { API_BASE } from '../../config/api';

const Container = styled.div`
  max-width: 960px;
  margin: 24px auto;
  padding: 20px;
  background: rgba(30, 30, 31, 0.8);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  color: #fff;
  overflow: hidden; /* evita vazamento visual */
`;

const Title = styled.h2`
  margin-top: 0;
`;

const Section = styled.div`
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(255,255,255,0.08);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;

  @media (max-width: 720px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0; /* permite encolher dentro do grid */
`;

const Label = styled.label`
  font-size: 0.95rem;
  color: rgba(255,255,255,0.85);
`;

const Input = styled.input`
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  color: #fff;
  border-radius: 8px;
  padding: 10px 12px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box; /* evita exceder a largura do container */
  display: block;
`;

const Select = styled.select`
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  color: #fff;
  border-radius: 8px;
  padding: 10px 12px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  display: block;
`;

const Button = styled.button`
  background: #3f80ea;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 14px;
  margin-top: 10px;
  cursor: pointer;
  &:disabled { opacity: 0.6; cursor: not-allowed; }
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
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', cep: '', address: '', gender: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [created, setCreated] = useState([]);
  const [owned, setOwned] = useState([]);

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
      setLoading(true); setError(''); setMessage('');
      try {
        const r = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        const d = await r.json();
        if (!r.ok) throw new Error(d.message || 'Falha ao carregar dados');
        setUser(d.user);
        setForm({
          first_name: d.user.first_name || '',
          last_name: d.user.last_name || '',
          cep: d.user.cep || '',
          address: d.user.address || '',
          gender: d.user.gender || ''
        });

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

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setMessage('');
    try {
      const r = await fetch(`${API_BASE}/api/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || 'Falha ao salvar');
      setUser(d.user);
      setMessage('Perfil atualizado!');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Container><p>Carregando...</p></Container>;

  return (
    <Container>
      <Title>Seu Perfil</Title>

      {error && <Message error>{error}</Message>}
      {message && <Message>{message}</Message>}

      {user && (
        <>
          <p><strong>Nome:</strong> {user.first_name} {user.last_name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>

          <Section>
            <h3>Editar Perfil</h3>
            <form onSubmit={onSave}>
              <Grid>
                <Field>
                  <Label htmlFor="first_name">Nome</Label>
                  <Input id="first_name" name="first_name" value={form.first_name} onChange={onChange} placeholder="Nome" />
                </Field>
                <Field>
                  <Label htmlFor="last_name">Sobrenome</Label>
                  <Input id="last_name" name="last_name" value={form.last_name} onChange={onChange} placeholder="Sobrenome" />
                </Field>
                <Field>
                  <Label htmlFor="cep">CEP</Label>
                  <Input id="cep" name="cep" value={form.cep} onChange={onChange} placeholder="CEP" />
                </Field>
                <Field>
                  <Label htmlFor="address">Endereço</Label>
                  <Input id="address" name="address" value={form.address} onChange={onChange} placeholder="Endereço" />
                </Field>
                <Field>
                  <Label htmlFor="gender">Gênero</Label>
                  <Select id="gender" name="gender" value={form.gender} onChange={onChange}>
                    <option value="">Selecione...</option>
                    <option value="female">Feminino</option>
                    <option value="male">Masculino</option>
                  </Select>
                </Field>
              </Grid>
              <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar Alterações'}</Button>
            </form>
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
  );
}
