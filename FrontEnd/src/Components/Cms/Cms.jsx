import React from 'react';
import styled from 'styled-components';

const CmsContainer = styled.div`
  padding: 24px;
  min-height: calc(100vh - 80px);
  background: linear-gradient(180deg, rgba(30,30,31,1) 0%, rgba(18,18,19,1) 100%);
  color: #fff;
`;

const CmsHeader = styled.div`
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 1.4rem;
  margin: 0;
`;

const BackButton = styled.button`
  background: transparent;
  color: rgba(255,255,255,0.9);
  border: 1px solid rgba(255,255,255,0.08);
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;

  &:hover { opacity: 0.9 }
`;

const Placeholder = styled.div`
  border-radius: 8px;
  padding: 18px;
  background: rgba(255,255,255,0.02);
  border: 1px dashed rgba(255,255,255,0.04);
`;

const Cms = ({ onClose }) => {
  return (
    <CmsContainer>
      <CmsHeader>
        <Title>CMS — Gerenciamento da Web</Title>
        <BackButton onClick={onClose}>Voltar</BackButton>
      </CmsHeader>

      <Placeholder>
        <p style={{ marginTop: 0 }}>
          Aqui você pode construir a interface de gerenciamento (páginas, posts, menus, etc.).
        </p>
        <ul>
          <li>Gerenciar páginas</li>
          <li>Gerenciar conteúdo estático</li>
          <li>Gerenciar menus e links</li>
          <li>Logs de publicação</li>
        </ul>
        <p>
          Observação: permissões de usuário ainda não implementadas — por enquanto o botão CMS ficará
          disponível/funcional dependendo do estado `isAdmin` passado pela aplicação.
        </p>
      </Placeholder>
    </CmsContainer>
  );
};

export default Cms;
