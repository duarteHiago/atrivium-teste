import React from 'react';
import styled from 'styled-components';

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
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica de login (simulada)
    // ... (chamada para API do backend) ...
    onAuthSuccess(); // Simula sucesso
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Input type="email" placeholder="Email" required />
      <Input type="password" placeholder="Password" required />
      <OptionsRow>
        <label>
          <input type="checkbox" /> Remember me
        </label>
        <LinkStyled href="#">Forgot Password?</LinkStyled>
      </OptionsRow>
      <SubmitButton type="submit">Login</SubmitButton>
    </Form>
  );
};

export default LoginForm;