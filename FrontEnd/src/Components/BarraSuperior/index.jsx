import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Logo from './Logo'
import BarraDePesquisa from './BarraDePesquisa'

const BarraEstilizada = styled.header`
   position: fixed;
   top: 0;  
   left: 0;
   right: 0;
   height: 80px;
   background-color: rgba(20, 20, 21, 1);
   display: flex;
   align-items: center;
   padding: 0;
   margin: 0;
   box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
   z-index: 1000;
   gap: 0;
`
const Spacer = styled.div`
  flex-grow: 1;
`

const MenuButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  width: 48px;
  height: 44px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;

  .bar {
    width: 20px;
    height: 2px;
    background-color: white;
    position: relative;
    transition: width 0.18s ease, background-color 0.18s ease, transform 0.18s ease;
    display: block;
  }
  .bar::before,
  .bar::after {
    content: '';
    position: absolute;
    left: 0;
    width: 20px;
    height: 2px;
    background-color: inherit;
    transition: width 0.18s ease, transform 0.18s ease;
  }
  .bar::before { transform: translateY(-8px); }
  .bar::after { transform: translateY(8px); }
`

const HeaderButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding-right: 20px;
`;

const WalletButton = styled.button`
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 600;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const ProfileButton = styled.button`
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const BarraSuperior = ({
  onMenuClick, 
  $isOpen, // Recebe com $
  menuRef, 
  isLoggedIn, 
  onWalletClick, 
  onProfileClick
}) => {
  
  const [hovered, setHovered] = useState(false);
  
  useEffect(() => {
    if (!$isOpen) setHovered(false); // Usa com $
  }, [$isOpen]); // Usa com $
  
  const activeColor = '#9be3b8';

  return (
    <BarraEstilizada>
      <MenuButton
        ref={menuRef}
        onClick={onMenuClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="menu-button"
      >
        <span
          className="bar"
          style={{
            width: hovered ? 26 : 20,
            backgroundColor: $isOpen || hovered ? activeColor : 'white', // Usa com $
          }}
        />
      </MenuButton>
      <div style={{ marginLeft: -14 }}>
        <Logo />
      </div>
      <BarraDePesquisa />
      <Spacer /> 
      
      <HeaderButtonGroup>
        <WalletButton onClick={onWalletClick}>
          Connect Wallet
        </WalletButton>
        <ProfileButton onClick={onProfileClick}>
          {isLoggedIn ? '👤' : '🚪'} {/* Usa isLoggedIn */}
        </ProfileButton>
      </HeaderButtonGroup>
    </BarraEstilizada>
  )
}
export default BarraSuperior