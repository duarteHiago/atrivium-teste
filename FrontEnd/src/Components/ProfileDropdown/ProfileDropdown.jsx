import React from 'react';
import styled from 'styled-components';

// Container do dropdown
const DropdownMenu = styled.div`
  position: absolute;
  top: 70px; /* Abaixo da BarraSuperior */
  right: 20px;
  width: 280px;
  background-color: #1c1c1e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  z-index: 1100; /* Acima da BarraSuperior */
  padding: 10px 0;
  color: white;
`;

// Itens do menu
const MenuItem = styled.a`
  display: block;
  padding: 12px 20px;
  text-decoration: none;
  color: white;
  font-weight: 500;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const MenuSeparator = styled.hr`
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 8px 0;
`;

const ProfileDropdown = ({ onLogout }) => {
  return (
    <DropdownMenu>
      <MenuItem href="#">Profile</MenuItem>
      <MenuItem href="#">Galleries</MenuItem>
      <MenuItem href="#">NFTs</MenuItem>
      <MenuItem href="#">Listings</MenuItem>
      <MenuItem href="#">Portfolio</MenuItem>
      <MenuSeparator />
      <MenuItem href="#">Settings</MenuItem>
      <MenuItem href="#" onClick={onLogout}>
        Sair (Logout)
      </MenuItem>
    </DropdownMenu>
  );
};

export default ProfileDropdown;