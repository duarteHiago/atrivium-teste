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
  font-size: 1.1em;
  font-weight: 500;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

// 2. RECEBA A PROP COM $
const BarraLateral = ({ $isOpen, sidebarRef }) => {
  return (
    // 3. PASSE A PROP COM $
    <NavContainer ref={sidebarRef} $isOpen={$isOpen}>
      <MenuItem href="#">Discover</MenuItem>
      <MenuItem href="#">Collections</MenuItem>
      <MenuItem href="#">Tokens</MenuItem>
      <MenuItem href="#">Drops</MenuItem>
      <MenuItem href="#">Activity</MenuItem>
      <MenuItem href="#">Profile</MenuItem> 
    </NavContainer>
  );
};

export default BarraLateral;