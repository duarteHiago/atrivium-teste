import React, { useState } from 'react';
import styled from 'styled-components';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

// Container para os botões de alternância e os formulários
const ModalContent = styled.div`
  padding: 50px 40px 30px 40px; /* Reduzido padding inferior */
  color: white;
  position: relative;
  overflow: hidden; /* Mantém para esconder animação */
  display: flex; /* Volta a usar flex */
  flex-direction: column; /* Organiza título, botões e form em coluna */
  /* Define uma altura máxima geral, mas permite rolagem interna */
  max-height: 85vh; /* Ajuste se necessário, menor que os 90vh do Modal.jsx */
`;

const Title = styled.h2`
  text-align: center;
  margin-top: 0;
  margin-bottom: 30px;
  font-size: 1.8em;
  font-weight: 600;
  flex-shrink: 0; /* Impede que encolha */
`;

// Botões para alternar entre Login e Cadastro
const ToggleButtons = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 25px; /* Reduzido um pouco */
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0; /* Impede que encolha */
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.$active ? '#FFF' : 'rgba(255, 255, 255, 0.5)'};
  padding: 10px 20px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  border-bottom: ${props => props.$active ? '2px solid #3f80ea' : '2px solid transparent'};
  transition: color 0.2s, border-bottom 0.2s;

  &:hover {
    color: #FFF;
  }
`;

// Container para os formulários com animação
const FormContainer = styled.div`
  position: relative; /* Mantém para posicionar os FormWrappers */
  width: 100%;
  flex-grow: 1; /* Ocupa o espaço restante */
  overflow-y: auto; /* ADICIONA O SCROLL VERTICAL AQUI */
  /* Adiciona um padding para a barra de rolagem não colar */
  padding-right: 5px; 
  margin-right: -5px; /* Compensa o padding */

  /* Estilização da barra de rolagem (opcional, para Webkit/Firefox) */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent; /* Firefox */
`;

// Wrapper para animação - AJUSTADO
const FormWrapper = styled.div`
  /* Não é mais 'absolute', animação precisa ser ajustada */
  /* position: absolute; */ 
  width: 100%;
  
  /* Ajuste da animação sem position:absolute */
  transform: ${props => props.$show ? 'translateX(0)' : (props.$isSignUp ? 'translateX(100%)' : 'translateX(-100%)')};
  opacity: ${props => props.$show ? 1 : 0};
  transition: transform 0.4s ease-in-out, opacity 0.4s ease-in-out;
  
  /* Esconde visualmente E impede interação quando não está ativo */
  visibility: ${props => props.$show ? 'visible' : 'hidden'};
  height: ${props => props.$show ? 'auto' : '0'}; /* Evita ocupar espaço quando escondido */
  overflow: ${props => props.$show ? 'visible' : 'hidden'}; /* Garante que não apareça */
  
  /* Para posicionar corretamente quando escondido */
  position: ${props => props.$show ? 'relative' : 'absolute'};
  top: 0; /* Garante alinhamento quando absoluto */
  left: 0; /* Garante alinhamento quando absoluto */
`;


const AuthModal = ({ onAuthSuccess }) => {
  const [isSigningUp, setIsSigningUp] = useState(false); // Começa mostrando Login

  return (
    <ModalContent>
      <Title>Welcome Artrivium</Title>
      <ToggleButtons>
        <ToggleButton 
          $active={!isSigningUp} 
          onClick={() => setIsSigningUp(false)}
        >
          Entrar (Sign In)
        </ToggleButton>
        <ToggleButton 
          $active={isSigningUp} 
          onClick={() => setIsSigningUp(true)}
        >
          Cadastrar (Sign Up)
        </ToggleButton>
      </ToggleButtons>

      <FormContainer>
        {/* Formulário de Login */}
        <FormWrapper $show={!isSigningUp} $isSignUp={false}>
          <LoginForm onAuthSuccess={onAuthSuccess} />
        </FormWrapper>

        {/* Formulário de Cadastro */}
        <FormWrapper $show={isSigningUp} $isSignUp={true}>
          <SignUpForm onAuthSuccess={onAuthSuccess} />
        </FormWrapper>
      </FormContainer>
    </ModalContent>
  );
};

export default AuthModal;