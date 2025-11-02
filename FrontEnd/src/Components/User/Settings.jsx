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
`;

const Title = styled.h2`
  margin-top: 0;
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
`;

const TextArea = styled.textarea`
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  color: #fff;
  border-radius: 8px;
  padding: 10px 12px;
  min-height: 90px;
`;

const Select = styled.select`
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  color: #fff;
  border-radius: 8px;
  padding: 10px 12px;
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

const DropZone = styled.div`
  border: 2px dashed rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  padding: 14px;
  background: rgba(255,255,255,0.04);
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: border-color .2s ease, background .2s ease;
  &:hover { border-color: rgba(255,255,255,0.45); background: rgba(255,255,255,0.055); }
`;

const BannerPreview = styled.div`
  width: 100%;
  aspect-ratio: 1600 / 520;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  img { width: 100%; height: 100%; object-fit: cover; display: block; }
`;

const AvatarPreview = styled.div`
  width: 128px; height: 128px; border-radius: 50%; overflow: hidden; border: 2px solid rgba(255,255,255,0.2);
  img { width: 100%; height: 100%; object-fit: cover; display: block; }
`;

export default function Settings({ onRequireLogin }) {
  const [form, setForm] = useState({ first_name: '', last_name: '', nickname: '', bio: '', cep: '', address: '', gender: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  const token = useMemo(() => {
    try { return localStorage.getItem('token'); } catch { return null; }
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('Você precisa estar logado para acessar configurações.');
      if (typeof onRequireLogin === 'function') onRequireLogin();
      return;
    }

    const load = async () => {
      setLoading(true); setError(''); setMessage('');
      try {
        const r = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        const d = await r.json();
        if (!r.ok) throw new Error(d.message || 'Falha ao carregar dados');
        setForm({
          first_name: d.user.first_name || '',
          last_name: d.user.last_name || '',
          nickname: d.user.nickname || '',
          bio: d.user.bio || '',
          cep: d.user.cep || '',
          address: d.user.address || '',
          gender: d.user.gender || ''
        });
        setAvatarPreview(d.user.avatar_url || null);
        setBannerPreview(d.user.banner_url || null);
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

  const pickFile = (id) => document.getElementById(id)?.click();
  const onAvatarChange = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f));
  };
  const onBannerChange = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    setBannerFile(f); setBannerPreview(URL.createObjectURL(f));
  };
  const onDrop = (setterFile, setterPreview) => (e) => {
    e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (!f) return;
    setterFile(f); setterPreview(URL.createObjectURL(f));
  };
  const prevent = (e) => e.preventDefault();

  const onSave = async (e) => {
    e.preventDefault(); setSaving(true); setError(''); setMessage('');
    try {
      const fd = new FormData();
      fd.append('first_name', form.first_name);
      fd.append('last_name', form.last_name);
      if (form.nickname) fd.append('nickname', form.nickname);
      if (form.bio) fd.append('bio', form.bio);
      if (form.cep) fd.append('cep', form.cep);
      if (form.address) fd.append('address', form.address);
      if (form.gender) fd.append('gender', form.gender);
      if (avatarFile) fd.append('avatar', avatarFile);
      if (bannerFile) fd.append('banner', bannerFile);

      const r = await fetch(`${API_BASE}/api/users/me`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || 'Falha ao salvar');
      setMessage('Configurações atualizadas!');
    } catch (e) {
      setError(e.message);
    } finally { setSaving(false); }
  };

  if (loading) return <Container><p>Carregando...</p></Container>;

  return (
    <Container>
      <Title>Configurações</Title>
      {error && <Message error>{error}</Message>}
      {message && <Message>{message}</Message>}
      <form onSubmit={onSave}>
        <Field>
          <Label>Banner</Label>
          <DropZone onClick={() => pickFile('banner-input')} onDrop={onDrop(setBannerFile, setBannerPreview)} onDragOver={prevent}>
            <BannerPreview>
              {bannerPreview ? <img src={bannerPreview} alt="Banner" /> : <div style={{opacity:.7}}>Arraste uma imagem 1600x520 ou clique</div>}
            </BannerPreview>
            <input id="banner-input" type="file" accept="image/*" onChange={onBannerChange} style={{ display: 'none' }} />
          </DropZone>
        </Field>

        <Field>
          <Label>Avatar</Label>
          <DropZone onClick={() => pickFile('avatar-input')} onDrop={onDrop(setAvatarFile, setAvatarPreview)} onDragOver={prevent}>
            <AvatarPreview>
              {avatarPreview ? <img src={avatarPreview} alt="Avatar" /> : <div style={{opacity:.7,display:'grid',placeItems:'center',height:'100%'}}>Arraste um avatar quadrado</div>}
            </AvatarPreview>
            <input id="avatar-input" type="file" accept="image/*" onChange={onAvatarChange} style={{ display: 'none' }} />
          </DropZone>
        </Field>

        <Grid>
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
            <Label htmlFor="cep">CEP</Label>
            <Input id="cep" name="cep" value={form.cep} onChange={onChange} />
          </Field>
          <Field>
            <Label htmlFor="address">Endereço</Label>
            <Input id="address" name="address" value={form.address} onChange={onChange} />
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
        <Field>
          <Label htmlFor="bio">Bio</Label>
          <TextArea id="bio" name="bio" value={form.bio} onChange={onChange} placeholder="Fale um pouco sobre você" />
        </Field>

        <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar Alterações'}</Button>
      </form>
    </Container>
  );
}
