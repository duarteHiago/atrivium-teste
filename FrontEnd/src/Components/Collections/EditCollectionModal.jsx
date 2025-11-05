import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { API_BASE } from '../../config/api';

const Overlay = styled.div`
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
`;

const Modal = styled.div`
  width: 100%; max-width: 560px; max-height: 90vh; overflow: auto;
  background: rgba(30,30,31,0.96);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px; padding: 22px;
`;

const Header = styled.div`
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;
`;

const Title = styled.h3`
  margin: 0; color: #fff;
`;

const Close = styled.button`
  background: transparent; border: none; color: rgba(255,255,255,0.7); font-size: 20px; cursor: pointer;
`;

const Group = styled.div`
  display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px;
`;

const Label = styled.label`
  color: rgba(255,255,255,0.85); font-size: 0.95em;
`;

const Input = styled.input`
  padding: 10px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.05); color: #fff;
`;

const TextArea = styled.textarea`
  padding: 10px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.05); color: #fff; min-height: 100px; resize: vertical;
`;

const Row = styled.div`
  display: flex; gap: 10px; justify-content: flex-end; margin-top: 12px;
`;

const Button = styled.button`
  padding: 10px 16px; border-radius: 8px; border: 1px solid transparent; cursor: pointer; font-weight: 600;
  color: #fff; background: ${p => p.$variant === 'danger' ? 'rgba(239,68,68,0.9)' : 'linear-gradient(135deg,#667eea,#764ba2)'};
  opacity: ${p => p.disabled ? 0.6 : 1};
`;

const Error = styled.div`
  color: #ff6b6b; background: rgba(255,0,0,0.08); border: 1px solid rgba(255,0,0,0.3);
  border-radius: 8px; padding: 10px; margin-top: 8px;
`;

export default function EditCollectionModal({ open, onClose, collection, onSaved }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && collection) {
      setName(collection.name || '');
      setDescription(collection.description || '');
      setCoverUrl(collection.banner_image || collection.cover_image_url || '');
      setIsFeatured(Boolean(collection.is_featured));
      setError(null);
    }
  }, [open, collection]);

  if (!open) return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true); setError(null);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${API_BASE}/api/collections/${collection.collection_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: name || undefined,
          description: description || '',
          cover_image_url: coverUrl || null,
          is_featured: isFeatured
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Falha ao atualizar coleção');
      const updated = { ...(data.collection || {}), banner_image: (data.collection?.cover_image_url ?? data.collection?.banner_image ?? null) };
      onSaved?.(updated);
      onClose?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Editar Coleção</Title>
          <Close onClick={onClose}>×</Close>
        </Header>
        <form onSubmit={onSubmit}>
          <Group>
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Cyberpunk Dreams" required />
          </Group>
          <Group>
            <Label>Descrição</Label>
            <TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição da coleção" />
          </Group>
          <Group>
            <Label>Imagem de capa (URL)</Label>
            <Input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." />
          </Group>
          <Group style={{display:'flex',flexDirection:'row',alignItems:'center',gap:8}}>
            <input id="isfeat" type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
            <Label htmlFor="isfeat">Marcar como destaque</Label>
          </Group>
          {error && <Error>❌ {error}</Error>}
          <Row>
            <Button type="button" $variant="danger" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Salvar alterações'}</Button>
          </Row>
        </form>
      </Modal>
    </Overlay>
  );
}
