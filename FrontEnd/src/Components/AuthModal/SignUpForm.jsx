import React, { useState } from 'react';
import styled from 'styled-components';
import { API_BASE } from '../../config/api';

// Reutilizando estilos...
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
  &:hover { background-color: #5a9aff; }
  &:disabled { background-color: #555; cursor: not-allowed; }
`;

const ErrorText = styled.p`
  color: #ff4d4d;
  font-size: 0.9rem;
  text-align: center;
  margin: 0;
`;

// Estilo para agrupar campos (ex: Nome e Sobrenome)
const FieldGroup = styled.div`
  display: flex;
  gap: 5px;
  & > input {
     width: calc(50% - 5px); /* 5px é metade do gap de 10px */
  }
`;

// Estilo para a seleção de gênero
const GenderLabel = styled.label`
  display: block;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 5px;
`;

const GenderOptions = styled.div`
  display: flex;
  justify-content: space-around;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 10px;
`;

const GenderOption = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;


const SignUpForm = ({ onAuthSuccess }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', cpf: '', birthDate: '',
    email: '', password: '', cep: '', address: '', gender: ''
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Mesma checagem de idade de antes
  const handleBirthDateChange = (e) => {
    const dob = new Date(e.target.value);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    if (age < 18) {
      setError('Você deve ter pelo menos 18 anos para se cadastrar.');
    } else {
      setError('');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (error) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Falha no cadastro');
      // Auto-login após cadastro
      const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password })
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.message || 'Falha no login após cadastro');
  localStorage.setItem('token', loginData.token);
  if (loginData.user?.user_id) localStorage.setItem('creatorId', loginData.user.user_id);
  if (loginData.user?.role) localStorage.setItem('role', loginData.user.role);
      onAuthSuccess?.(loginData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* Estrutura inspirada no Facebook */}
      <FieldGroup>
        <Input type="text" name="firstName" placeholder="Nome" value={form.firstName} onChange={onChange} required />
        <Input type="text" name="lastName" placeholder="Sobrenome" value={form.lastName} onChange={onChange} required />
      </FieldGroup>
      <Input type="text" name="cpf" placeholder="CPF" value={form.cpf} onChange={onChange} required />
      <Input type="date" name="birthDate" placeholder="Data de Nascimento" value={form.birthDate} required onChange={(e)=>{onChange(e); handleBirthDateChange(e);}} />
      <Input type="email" name="email" placeholder="E-mail" value={form.email} onChange={onChange} required />
      <Input type="password" name="password" placeholder="Senha" value={form.password} onChange={onChange} required />
      <Input type="text" name="cep" placeholder="CEP" value={form.cep} onChange={onChange} required />
      <Input type="text" name="address" placeholder="Endereço" value={form.address} onChange={onChange} required />
      
      <div>
        <GenderLabel>Gênero</GenderLabel>
        <GenderOptions>
          <GenderOption>
            Feminino
            <input type="radio" name="gender" value="female" checked={form.gender==='female'} onChange={onChange} required />
          </GenderOption>
          <GenderOption>
            Masculino
            <input type="radio" name="gender" value="male" checked={form.gender==='male'} onChange={onChange} required />
          </GenderOption>
        </GenderOptions>
      </div>

      {error && <ErrorText>{error}</ErrorText>}
      
      <SubmitButton type="submit" disabled={!!error || loading}>
        {loading ? 'Enviando...' : 'Cadastrar (Sign Up)'}
      </SubmitButton>
    </Form>
  );
};

export default SignUpForm;