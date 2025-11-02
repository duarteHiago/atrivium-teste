import React, { useEffect, useState } from 'react';
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
  grid-template-columns: 1.2fr 1fr 0.8fr 0.6fr;
  gap: 12px;
  align-items: center;
  padding: 10px 8px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  &:first-child { font-weight: 600; opacity: 0.9; }
`;

const Select = styled.select`
  background: rgba(255,255,255,0.06);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 8px 10px;
`;

const Button = styled.button`
  background: #3f80ea;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const Message = styled.div`
  margin-top: 10px;
  color: ${p => p.error ? '#ff6b6b' : '#9BE69B'};
  font-size: 0.95rem;
`;

export default function UserManagement(){
  const [users, setUsers] = useState([]);
  const [saving, setSaving] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  async function loadUsers(){
    setError(''); setMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Falha ao carregar usuários');
      setUsers(data.users || []);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => { loadUsers(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, []);

  const onChangeRole = (id, role) => {
    setUsers(prev => prev.map(u => u.user_id === id ? { ...u, role } : u));
  };

  const saveRole = async (id, role) => {
    setSaving(s => ({ ...s, [id]: true })); setError(''); setMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao atualizar role');
      setMessage('Role atualizada com sucesso.');
    } catch (e) {
      setError(e.message);
      // reload para restaurar
      loadUsers();
    } finally {
      setSaving(s => ({ ...s, [id]: false }));
    }
  };

  return (
    <Box>
      <Row>
        <div>Usuário</div>
        <div>Email</div>
        <div>Role</div>
        <div>Ação</div>
      </Row>
      {users.map(u => (
        <Row key={u.user_id}>
          <div>{u.first_name} {u.last_name}</div>
          <div>{u.email}</div>
          <div>
            <Select value={u.role || 'user'} onChange={e => onChangeRole(u.user_id, e.target.value)}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </Select>
          </div>
          <div>
            <Button onClick={() => saveRole(u.user_id, u.role || 'user')} disabled={!!saving[u.user_id]}>Salvar</Button>
          </div>
        </Row>
      ))}
      {(message || error) && <Message error={!!error}>{error || message}</Message>}
    </Box>
  );
}
