import React, { useState } from 'react';
import styled from 'styled-components';

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
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (error) return;
    // Lógica de cadastro (simulada)
    onAuthSuccess();
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* Estrutura inspirada no Facebook */}
      <FieldGroup>
        <Input type="text" placeholder="Nome" required />
        <Input type="text" placeholder="Sobrenome" required />
      </FieldGroup>
      <Input type="text" placeholder="CPF" required />
      <Input type="date" placeholder="Data de Nascimento" required onChange={handleBirthDateChange} />
      <Input type="email" placeholder="E-mail" required />
      <Input type="password" placeholder="Senha" required />
      <Input type="text" placeholder="CEP" required />
      <Input type="text" placeholder="Endereço" required />
      
      <div>
        <GenderLabel>Gênero</GenderLabel>
        <GenderOptions>
          <GenderOption>
            Feminino
            <input type="radio" name="gender" value="female" required />
          </GenderOption>
          <GenderOption>
            Masculino
            <input type="radio" name="gender" value="male" required />
          </GenderOption>
        </GenderOptions>
      </div>

      {error && <ErrorText>{error}</ErrorText>}
      
      <SubmitButton type="submit" disabled={!!error}>
        Cadastrar (Sign Up)
      </SubmitButton>
    </Form>
  );
};

export default SignUpForm;