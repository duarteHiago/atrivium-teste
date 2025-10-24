import React, { useState } from 'react';
import styled from 'styled-components';

// Estilos para o conteúdo do modal
const ModalContent = styled.div`
  padding: 30px 40px;
  color: white;
  h2 {
    text-align: center;
    margin-top: 0;
    margin-bottom: 25px;
  }
`;

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
  background-color: #3f80ea; /* Cor de botão principal */
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

const ErrorText = styled.p`
  color: #ff4d4d;
  font-size: 0.9rem;
  text-align: center;
  margin: 0;
`;

const LoginModal = ({ onLoginSuccess }) => {
  const [error, setError] = useState('');

  // Checagem de idade (simplificada)
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
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (error) return; // Não envia se houver erro de idade
    
    // Lógica de cadastro (simulada)
    // ... (aqui iria a chamada para a API do backend) ...
    
    // Simula sucesso e chama a função do App.jsx
    onLoginSuccess();
  };

  return (
    <ModalContent>
      <h2>Criar sua Conta</h2>
      <Form onSubmit={handleSubmit}>
        <Input type="text" placeholder="Nome completo" required />
        <Input type="text" placeholder="CPF" required />
        <Input type="date" placeholder="Data de Nascimento" required onChange={handleBirthDateChange} />
        <Input type="email" placeholder="E-mail" required />
        <Input type="password" placeholder="Senha" required />
        <Input type="text" placeholder="CEP" required />
        <Input type="text" placeholder="Endereço" required />
        
        {error && <ErrorText>{error}</ErrorText>}
        
        <SubmitButton type="submit" disabled={!!error}>
          Cadastrar
        </SubmitButton>
      </Form>
    </ModalContent>
  );
};

export default LoginModal;