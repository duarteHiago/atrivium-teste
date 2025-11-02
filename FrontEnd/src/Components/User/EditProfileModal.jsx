import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { API_BASE } from '../../config/api';

const Wrap = styled.div`
  width: min(720px, 92vw);
  padding: 20px;
`;

const Title = styled.h2`
  margin: 6px 0 14px 0; color: #fff;
`;

const Grid = styled.div`
  display: grid; gap: 14px; grid-template-columns: 1fr 1fr;
  @media (max-width: 760px) { grid-template-columns: 1fr; }
`;

const Field = styled.div`
  display: flex; flex-direction: column; gap: 6px;
`;

const Label = styled.label`
  color: rgba(255,255,255,.9);
`;

const Input = styled.input`
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  color: #fff; border-radius: 8px; padding: 10px 12px;
`;

const TextArea = styled.textarea`
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  color: #fff; border-radius: 8px; padding: 10px 12px; min-height: 90px;
`;

const DropZone = styled.div`
  border: 2px dashed rgba(255, 255, 255, 0.25);
  border-radius: 12px; padding: 12px; background: rgba(255,255,255,0.04);
  cursor: pointer; transition: border-color .2s ease, background .2s ease;
  &:hover { border-color: rgba(255,255,255,0.45); background: rgba(255,255,255,0.055); }
`;

const BannerPreview = styled.div`
  width: 100%; aspect-ratio: 1600 / 520; border-radius: 10px; overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04);
  img { width: 100%; height: 100%; object-fit: cover; display: block; }
`;

const AvatarPreview = styled.div`
  width: 128px; height: 128px; border-radius: 50%; overflow: hidden; border: 2px solid rgba(255,255,255,0.2);
  img { width: 100%; height: 100%; object-fit: cover; display: block; }
`;

const Row = styled.div`
  display: flex; gap: 12px; align-items: center; justify-content: flex-end; margin-top: 12px;
`;

const Button = styled.button`
  background: ${p => p.$variant==='ghost' ? 'transparent' : '#3f80ea'};
  color: #fff; border: ${p => p.$variant==='ghost' ? '1px solid rgba(255,255,255,0.25)' : 'none'};
  border-radius: 8px; padding: 10px 14px; cursor: pointer;
`;

export default function EditProfileModal({ initialUser, onClose, onSaved }) {
  const token = useMemo(() => { try { return localStorage.getItem('token'); } catch { return null; } }, []);

  const [form, setForm] = useState({
    first_name: initialUser?.first_name || '',
    last_name: initialUser?.last_name || '',
    nickname: initialUser?.nickname || '',
    bio: initialUser?.bio || ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(initialUser?.avatar_url || null);
  const [bannerPreview, setBannerPreview] = useState(initialUser?.banner_url || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const pickFile = (id) => document.getElementById(id)?.click();
  const onAvatarChange = (e) => { const f = e.target.files?.[0]; if (!f) return; setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)); };
  const onBannerChange = (e) => { const f = e.target.files?.[0]; if (!f) return; setBannerFile(f); setBannerPreview(URL.createObjectURL(f)); };
  const onDrop = (setterFile, setterPreview) => (e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (!f) return; setterFile(f); setterPreview(URL.createObjectURL(f)); };
  const prevent = (e) => e.preventDefault();

  const onSave = async () => {
    setSaving(true); setError('');
    try {
      const fd = new FormData();
      fd.append('first_name', form.first_name);
      fd.append('last_name', form.last_name);
      if (form.nickname) fd.append('nickname', form.nickname);
      if (form.bio) fd.append('bio', form.bio);
      if (avatarFile) fd.append('avatar', avatarFile);
      if (bannerFile) fd.append('banner', bannerFile);

      const r = await fetch(`${API_BASE}/api/users/me`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body: fd });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || 'Falha ao salvar');
      if (typeof onSaved === 'function') onSaved();
      onClose?.();
    } catch (e) {
      setError(e.message);
    } finally { setSaving(false); }
  };

  return (
    <Wrap>
      <Title>Editar Perfil</Title>
      {error && <div style={{ color: '#ff6b6b', marginBottom: 8 }}>{error}</div>}
      <Field>
        <Label>Banner</Label>
        <DropZone onClick={() => pickFile('edit-banner-input')} onDrop={onDrop(setBannerFile, setBannerPreview)} onDragOver={prevent}>
          <BannerPreview>
            {bannerPreview ? <img src={bannerPreview} alt="Banner" /> : <div style={{opacity:.7,display:'grid',placeItems:'center',height:'100%'}}>Arraste 1600x520 ou clique</div>}
          </BannerPreview>
          <input id="edit-banner-input" type="file" accept="image/*" onChange={onBannerChange} style={{ display: 'none' }} />
        </DropZone>
      </Field>

      <Field style={{ marginTop: 10 }}>
        <Label>Avatar</Label>
        <DropZone onClick={() => pickFile('edit-avatar-input')} onDrop={onDrop(setAvatarFile, setAvatarPreview)} onDragOver={prevent}>
          <AvatarPreview>
            {avatarPreview ? <img src={avatarPreview} alt="Avatar" /> : <div style={{opacity:.7,display:'grid',placeItems:'center',height:'100%'}}>Arraste um avatar quadrado</div>}
          </AvatarPreview>
          <input id="edit-avatar-input" type="file" accept="image/*" onChange={onAvatarChange} style={{ display: 'none' }} />
        </DropZone>
      </Field>

      <Grid style={{ marginTop: 10 }}>
        <Field>
          <Label htmlFor="first_name">Nome</Label>
          <Input id="first_name" name="first_name" value={form.first_name} onChange={onChange} />
        </Field>
        <Field>
          <Label htmlFor="last_name">Sobrenome</Label>
          <Input id="last_name" name="last_name" value={form.last_name} onChange={onChange} />
        </Field>
        <Field>
          <Label htmlFor="nickname">Nick</Label>
          <Input id="nickname" name="nickname" value={form.nickname} onChange={onChange} placeholder="ex: @hiago" />
        </Field>
        <Field>
          <Label htmlFor="bio">Bio</Label>
          <TextArea id="bio" name="bio" value={form.bio} onChange={onChange} placeholder="Fale sobre você" />
        </Field>
      </Grid>

      <Row>
        <Button $variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button onClick={onSave} disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</Button>
      </Row>
    </Wrap>
  );
}
