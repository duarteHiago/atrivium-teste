import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import Logo from './Logo'
import BarraDePesquisa from './BarraDePesquisa'
import PinataIndicator from '../PinataIndicator'
import IPFSManager from '../IPFSManager'
import { API_BASE } from '../../config/api'
// Removido import do usuarioIcon - agora usando componente SVG inline

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
   overflow: visible; /* Permite que o efeito de hover se expanda */
`
const Spacer = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
`

const MenuButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  width: 48px;
  height: 48px;
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

const CreateNFTButton = styled.button`
  background-color: #27ae60;
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
`;

const UserIcon = styled.svg`
  width: 22px;
  height: 22px;
  color: white;
  stroke: white;
  fill: white;
  opacity: 1;
  flex-shrink: 0;
`;

const AdminToggle = styled.button`
  background: ${props => props.active ? '#9be3b8' : 'transparent'};
  border: 1px solid rgba(255,255,255,0.08);
  color: ${props => props.active ? 'rgba(0,0,0,0.8)' : 'white'};
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
  const [ipfsModalOpen, setIpfsModalOpen] = useState(false);
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
      <div style={{ marginLeft: -8, position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', height: '80px' }}>
        <Logo />
      </div>
      <BarraDePesquisa />
      <Spacer /> 
      
      <HeaderButtonGroup>
        {isAdmin && <PinataIndicator onClick={() => setIpfsModalOpen(true)} />}
        {isAdmin && (
          <button 
            style={{ padding: '8px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
            onClick={async () => {
              try {
                console.log('🔄 Criando NFT de teste...');
                const response = await fetch('http://localhost:3001/api/test/create-ipfs-nft', {
                  method: 'GET'
                });
                
                console.log('📡 Response status:', response.status);
                console.log('📡 Response headers:', response.headers.get('content-type'));
                
                if (!response.ok) {
                  throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                  const text = await response.text();
                  console.error('❌ Resposta não é JSON:', text);
                  throw new Error('Servidor retornou resposta inválida');
                }
                
                const data = await response.json();
                console.log('✅ NFT teste criado:', data);
                alert('NFT de teste criado com sucesso! Recarregando...');
                setTimeout(() => window.location.reload(), 1000);
              } catch (error) {
                console.error('❌ Erro completo:', error);
                alert('Erro ao criar NFT teste: ' + error.message);
              }
            }}
          >
            Teste IPFS
          </button>
        )}
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
          <UserIcon viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="12" cy="9" r="2.5" fill="currentColor"/>
            <path d="M7.5 18.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </UserIcon>
        </ProfileButton>
      </HeaderButtonGroup>
      
      {isAdmin && (
        <IPFSManager 
          isOpen={ipfsModalOpen} 
          onClose={() => setIpfsModalOpen(false)} 
        />
      )}
    </BarraEstilizada>
  )
}
export default BarraSuperior