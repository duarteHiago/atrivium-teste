import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { API_BASE } from '../../config/api';

const Box = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 56px 1fr 100px 90px 90px;
  gap: 12px;
  align-items: center;
  padding: 10px 8px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  &:first-child { font-weight: 600; opacity: 0.9; }
`;

const Thumb = styled.div`
  width: 48px; height: 48px; border-radius: 8px; overflow: hidden;
  background: ${p => p.$img ? `url(${p.$img}) center/cover no-repeat` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
`;

const Toggle = styled.input``;

const OrderInput = styled.input`
  width: 64px; padding: 6px 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.06); color: #fff; text-align: center;
`;

const Button = styled.button`
  background: #3f80ea; color: #fff; border: none; border-radius: 8px; padding: 8px 12px; cursor: pointer;
  &:disabled { opacity: .6; }
`;

const Msg = styled.div`
  margin-top: 10px; color: ${p => p.error ? '#ff6b6b' : '#9BE69B'};
`;

export default function FeaturedCollections(){
  const [collections, setCollections] = useState([]);
  const [selected, setSelected] = useState({}); // id -> true
  const [order, setOrder] = useState({});       // id -> 1..4
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  async function load(){
    setLoading(true); setErr(''); setMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/collections/list`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao carregar coleções');
      const cols = data.collections || [];
      setCollections(cols);
      // Pré-popula seleção/ordem a partir do backend
      const sel = {}; const ord = {};
      cols.filter(c => c.is_featured).forEach(c => { sel[c.collection_id] = true; ord[c.collection_id] = c.featured_order || 1; });
      setSelected(sel); setOrder(ord);
    } catch(e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const selectedOrdered = useMemo(() => {
    return Object.entries(selected)
      .filter(([,v]) => v)
      .map(([id]) => ({ id, ord: Number(order[id] || 1) }))
      .sort((a,b) => a.ord - b.ord)
      .slice(0,4)
      .map(x => x.id);
  }, [selected, order]);

  async function save(){
    setSaving(true); setErr(''); setMsg('');
    try {
  // usa a rota do módulo de coleções para evitar 404 se o server não recarregou
  const res = await fetch(`${API_BASE}/api/collections/admin/featured-set`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ collectionIds: selectedOrdered })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao salvar destaques');
      setMsg('Destaques atualizados com sucesso.');
      load();
    } catch(e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <h3 style={{margin:0}}>Coleções em Destaque (máx. 4)</h3>
        <Button onClick={save} disabled={saving}>Salvar</Button>
      </div>
      <Row>
        <div>Banner</div>
        <div>Nome</div>
        <div>Destacar?</div>
        <div>Ordem (1-4)</div>
        <div>Itens</div>
      </Row>
      {loading ? (
        <div style={{padding:12}}>Carregando...</div>
      ) : (
        collections.map(c => (
          <Row key={c.collection_id}>
            <Thumb $img={c.banner_image} />
            <div>
              <div style={{fontWeight:600}}>{c.name}</div>
              <div style={{opacity:.7, fontSize:'.9em'}}>{c.description || '—'}</div>
            </div>
            <div>
              <Toggle type="checkbox" checked={!!selected[c.collection_id]} onChange={e => setSelected(s => ({...s, [c.collection_id]: e.target.checked}))} />
            </div>
            <div>
              <OrderInput type="number" min={1} max={4} value={order[c.collection_id] || ''} onChange={e => setOrder(o => ({...o, [c.collection_id]: e.target.value}))} disabled={!selected[c.collection_id]} />
            </div>
            <div>{c.nft_count || 0}</div>
          </Row>
        ))
      )}
      {(msg || err) && <Msg error={!!err}>{err || msg}</Msg>}
    </Box>
  )
}
