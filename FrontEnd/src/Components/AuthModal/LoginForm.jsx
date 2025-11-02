import React, { useState } from 'react';
import styled from 'styled-components';
import { API_BASE } from '../../config/api';

// Reutilizando alguns estilos do formulário de cadastro
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Input = styled.input`
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 15px;
  color: white;
  font-size: 1rem;
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const SubmitButton = styled.button`
  background-color: #3f80ea;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #5a9aff;
  }
`;

const OptionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 5px;
`;

const LinkStyled = styled.a`
  color: #5a9aff;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const LoginForm = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Falha no login');
  // Salva token e user localmente
      localStorage.setItem('token', data.token);
      if (data.user?.user_id) localStorage.setItem('creatorId', data.user.user_id);
  if (data.user?.role) localStorage.setItem('role', data.user.role);
      onAuthSuccess?.(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
  <Input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
  <Input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
      <OptionsRow>
        <label>
          <input type="checkbox" /> Remember me
        </label>
        <LinkStyled href="#">Forgot Password?</LinkStyled>
      </OptionsRow>
      {error && <p style={{color:'#ff6b6b',margin:0}}>{error}</p>}
  <SubmitButton type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Login'}</SubmitButton>
    </Form>
  );
};

export default LoginForm;