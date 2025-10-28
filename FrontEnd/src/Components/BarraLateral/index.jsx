import React from 'react';
import styled from 'styled-components';

const NavContainer = styled.nav`
  position: fixed;
  top: 80px; /* AJUSTE: Mudei de 60px para 80px para corresponder à altura da BarraSuperior */
  left: 0;
  height: calc(100vh - 80px); /* AJUSTE: Mudei de 60px para 80px */
  width: 260px;
  background-color: rgba(20, 20, 21, 1);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
  z-index: 900;
  
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px 0;
  
  /* 1. ADICIONE O $ AQUI */
  transform: ${props => props.$isOpen ? 'translateX(0)' : 'translateX(-100%)'};
  transition: transform 0.3s ease-in-out;
`;

const MenuItem = styled.a`
  display: flex;
  align-items: center;
  padding: 14px 24px;
  color: white;
  text-decoration: none;
  cursor: pointer;
  font-size: 1.1em;
  font-weight: 500;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

// Texto simples (sem fundo) — usado para o item Discover quando deve aparecer como texto
const MenuText = styled.button`
  display: flex;
  align-items: center;
  padding: 14px 24px;
  color: white;
  background: transparent;
  border: none;
  text-decoration: none;
  font-size: 1.1em;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: transparent;
    text-decoration: underline;
  }
`;

const AdminButton = styled.button`
  display: flex;
  align-items: center;
  padding: 20px 24px;
  color: white;
  background: transparent;
  border: none;
  width: 100%;
  font-size: 1.1em;
  font-weight: 500;
  text-align: left;

  ${props => props.disabled ? `
    opacity: 0.45;
    cursor: not-allowed;
  ` : `
    cursor: pointer;
    &:hover { background-color: rgba(255, 255, 255, 0.1); }
  `}
`;

const MenuList = styled.div`
  display: flex;
  flex-direction: column;
`;

const Footer = styled.div`
  padding: 12px 0 8px 0;
`;

// 2. RECEBA A PROP COM $
// Recebe também uma prop para abrir a aba CMS e o flag isAdmin
const BarraLateral = ({ $isOpen, sidebarRef, onOpenCms, isAdmin = false, onGoHome }) => {
  return (
    // 3. PASSE A PROP COM $
    <NavContainer ref={sidebarRef} $isOpen={$isOpen}>
      <MenuList>
        <MenuText onClick={() => { if (typeof onGoHome === 'function') onGoHome(); }}>Discover</MenuText>
        <MenuItem href="#">Collections</MenuItem>
        <MenuItem href="#">Tokens</MenuItem>
        <MenuItem href="#">Drops</MenuItem>
        <MenuItem href="#">Activity</MenuItem>
  <MenuItem as="button" onClick={() => { try { window.location.hash = ''; } catch { /* ignore */ } window.history.pushState({}, '', '/profile'); window.dispatchEvent(new PopStateEvent('popstate')); }}>Profile</MenuItem>
      </MenuList>

      {/* Footer com o botão CMS somente para admin */}
      {isAdmin && (
        <Footer>
          <div style={{ marginTop: 6, borderTop: '1px solid rgba(255,255,255,0.04)' }} />
          <AdminButton
            onClick={() => { if (typeof onOpenCms === 'function') onOpenCms(); }}
            title="Abrir CMS"
          >
            CMS — Gerenciamento
          </AdminButton>
        </Footer>
      )}
    </NavContainer>
  );
};

export default BarraLateral;