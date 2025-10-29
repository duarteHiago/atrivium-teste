import React from 'react';
import styled from 'styled-components';

// Container do dropdown
const DropdownMenu = styled.div`
  position: fixed; /* fixa relativo à viewport */
  /* Abaixo da BarraSuperior (80px) com um pequeno gap */
  top: calc(80px + 6px);
  right: 20px;
  width: 240px; /* mais compacto */
  background-color: #1c1c1e;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  z-index: 1300; /* acima do overlay e do header, mas posicionado abaixo visualmente (top > 80px) */
  padding: 8px 0;
  color: white;

  /* Animação de abertura */
  transform-origin: top right;
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
  animation: dropdownIn 160ms ease-out forwards;

  @keyframes dropdownIn {
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: transparent; /* apenas captura o clique */
  z-index: 1200; /* abaixo do menu, acima do header/conteúdo */
`;

// Itens do menu
const MenuItem = styled.a`
  display: block;
  padding: 10px 16px; /* mais compacto */
  text-decoration: none;
  color: white;
  font-weight: 500;
  font-size: 0.95rem;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const MenuSeparator = styled.hr`
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  margin: 6px 0;
`;

const ProfileDropdown = ({ onLogout, onGoProfile, onGoSettings, onClose }) => {
  return (
    <>
      <Backdrop onClick={onClose} />
      <DropdownMenu role="menu" aria-label="Profile menu">
  <MenuItem as="button" onClick={onGoProfile} style={{ textAlign: 'left', width: '100%', background: 'transparent', border: 'none', cursor: 'pointer' }}>Profile</MenuItem>
        <MenuItem as="button" onClick={() => { window.history.pushState({}, '', '/gallery'); window.dispatchEvent(new PopStateEvent('popstate')); }} style={{ textAlign: 'left', width: '100%', background: 'transparent', border: 'none', cursor: 'pointer' }}>Galleries</MenuItem>
        <MenuItem href="#">NFTs</MenuItem>
      <MenuItem href="#">Listings</MenuItem>
      <MenuItem href="#">Portfolio</MenuItem>
      <MenuSeparator />
  <MenuItem as="button" onClick={onGoSettings} style={{ textAlign: 'left', width: '100%', background: 'transparent', border: 'none', cursor: 'pointer' }}>Settings</MenuItem>
      <MenuItem href="#" onClick={onLogout}>
        Sair (Logout)
      </MenuItem>
      </DropdownMenu>
    </>
  );
};

export default ProfileDropdown;