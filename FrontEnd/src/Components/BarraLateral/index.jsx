import React from 'react';
import styled from 'styled-components';

const NavContainer = styled.nav`
  position: fixed;
  top: 60px; /* Abaixo da BarraSuperior */
  left: 0;
  height: calc(100vh - 60px); /* Altura total menos a barra superior */
  width: 260px; /* Largura da barra */
  background-color: rgba(20, 20, 21, 1); /* Fundo escuro */
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
  z-index: 900; /* Abaixo da barra superior (1000) mas acima do resto */
  
  padding: 20px 0;
  
  /* A mágica da animação */
  transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(-100%)'};
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
  /* Adicionar espaço para ícones depois */
  /* svg { margin-right: 15px; } */
`;

// 1. O componente recebe 'isOpen'
const BarraLateral = ({ isOpen, sidebarRef }) => {
  return (
    // 2. O 'isOpen' é passado para o styled-component
    <NavContainer ref={sidebarRef} isOpen={isOpen}>
      {/* Itens de menu inspirados no OpenSea */}
      <MenuItem href="#">Discover</MenuItem>
      <MenuItem href="#">Collections</MenuItem>
      <MenuItem href="#">Tokens</MenuItem>
      <MenuItem href="#">Drops</MenuItem>
      <MenuItem href="#">Activity</MenuItem>
      {/* Adicione mais itens... */}
    </NavContainer>
  );
};

export default BarraLateral;