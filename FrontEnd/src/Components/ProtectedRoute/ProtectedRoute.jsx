import { useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px 20px;
`;

const Icon = styled.div`
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.6;
`;

const Title = styled.h2`
  color: white;
  font-size: 1.8em;
  margin-bottom: 12px;
  font-weight: 600;
`;

const Message = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1em;
  text-align: center;
  max-width: 500px;
  margin-bottom: 30px;
`;

const LoginButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 8px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ProtectedRoute = ({ children, requireAuth = true, onRequireLogin }) => {
  useEffect(() => {
    // Verificar se o usuário está logado
    const token = localStorage.getItem('token');
    
    if (requireAuth && !token) {
      // Se require auth e não está logado, não fazer nada
      // O componente vai mostrar a tela de "precisa logar"
      return;
    }
  }, [requireAuth]);

  // Verificar se o usuário está logado
  const token = localStorage.getItem('token');
  
  if (requireAuth && !token) {
    return (
      <Container>
        <Icon>🔒</Icon>
        <Title>Login Necessário</Title>
        <Message>
          Você precisa estar logado para acessar esta funcionalidade.
          Faça login para continuar.
        </Message>
        <LoginButton onClick={onRequireLogin}>
          Fazer Login
        </LoginButton>
      </Container>
    );
  }

  return children;
};

export default ProtectedRoute;
