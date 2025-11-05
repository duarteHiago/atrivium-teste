import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import Logo from './Logo'
import BarraDePesquisa from './BarraDePesquisa'
import { API_BASE } from '../../config/api'

const BarraEstilizada = styled.header`
   position: fixed;
   top: 0;  
   left: 0;
   right: 0;
   height: 80px;
   background-color: var(--bg-card, rgba(20, 20, 21, 1));
   display: flex;
   align-items: center;
   padding: 0;
   margin: 0;
   box-shadow: var(--shadow-md, 0 2px 5px rgba(0, 0, 0, 0.2));
   z-index: 1000;
   gap: 0;
   border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
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
    background-color: var(--text-primary, white);
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

const BalanceBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.18);
  color: #9be3b8;
  font-weight: 600;
  font-size: 0.95rem;
  white-space: nowrap;

  @media (max-width: 860px) {
    padding: 6px 10px;
    font-size: 0.85rem;
  }

  @media (max-width: 640px) {
    display: none;
  }
`;

const WalletButton = styled.button`
  background-color: var(--bg-hover, rgba(255, 255, 255, 0.1));
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.2));
  color: var(--text-primary, white);
  font-weight: 600;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--bg-secondary, rgba(255, 255, 255, 0.2));
  }
`;

const CreateNFTButton = styled.button`
  background-color: #27ae60;
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.2));
  color: white;
  font-weight: 600;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #2ecc71;
  }
`;

const ProfileButton = styled.button`
  background-color: var(--bg-hover, rgba(255, 255, 255, 0.1));
  border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.2));
  color: var(--text-primary, white);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: var(--bg-secondary, rgba(255, 255, 255, 0.2));
  }
`;

const AdminToggle = styled.button`
  background: ${props => props.active ? '#9be3b8' : 'var(--bg-hover, transparent)'};
  border: 1px solid var(--border-primary, rgba(255,255,255,0.08));
  color: ${props => props.active ? 'rgba(0,0,0,0.8)' : 'var(--text-primary, white)'};
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
`;

const BarraSuperior = ({
  onMenuClick, 
  $isOpen, // Recebe com $
  menuRef, 
  isLoggedIn, 
  onWalletClick, 
  onProfileClick,
  isAdmin,
  setIsAdmin
}) => {
  
  const [hovered, setHovered] = useState(false);
  const [balance, setBalance] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!$isOpen) setHovered(false); // Usa com $
  }, [$isOpen]); // Usa com $

  // Buscar saldo da carteira quando logar e quando solicitar refresh
  useEffect(() => {
    const load = async () => {
      try {
        if (!isLoggedIn) { setBalance(null); return; }
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${API_BASE}/api/wallet/balance`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const b = parseFloat(data.balance_eth || 0);
          if (!Number.isNaN(b)) setBalance(b);
        }
      } catch {
        // silencioso
      }
    };

    load();

    const onRefresh = () => load();
    window.addEventListener('wallet:refresh', onRefresh);
    return () => window.removeEventListener('wallet:refresh', onRefresh);
  }, [isLoggedIn]);
  
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
      <Logo />
      <BarraDePesquisa />
      <Spacer /> 
      
      <HeaderButtonGroup>
        {balance !== null && (
          <BalanceBadge title="Seu saldo em carteira">
            <span>💰</span>
            <span>{balance.toFixed(4)} ETH</span>
          </BalanceBadge>
        )}
        {/* Toggle dev-only para simular admin (não afeta backend) */}
        <AdminToggle
          active={isAdmin}
          onClick={() => setIsAdmin && setIsAdmin(v => !v)}
          title="Alternar admin (dev)"
        >
          {isAdmin ? 'ADMIN' : 'dev'}
        </AdminToggle>
        <CreateNFTButton onClick={() => navigate('/create-nft')}>
          + Your NFT
        </CreateNFTButton>
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