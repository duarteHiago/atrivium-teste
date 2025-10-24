import React from 'react';
import styled from 'styled-components';

// Estilos baseados no screenshot
const ModalContent = styled.div`
  padding: 24px;
  color: white;
  text-align: center;
`;

const Title = styled.h2`
  margin-top: 10px;
  margin-bottom: 25px;
`;

// O logo do OpenSea (simulado)
const LogoPlaceholder = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #3f80ea;
  margin: 0 auto 10px;
`;

const WalletList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const WalletButton = styled.button`
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const WalletModal = () => {
  // Lista de carteiras do screenshot
  const wallets = [
    'MetaMask', 'Coinbase Wallet', 'Glyph', 
    'WalletConnect', 'Abstract', 'VeeFriends Wallet'
  ];

  return (
    <ModalContent>
      <LogoPlaceholder />
      <Title>Connect with Artrivium</Title>
      <WalletList>
        {wallets.map(wallet => (
          <WalletButton key={wallet}>
            {/* Adicionar ícones aqui depois */}
            {wallet}
          </WalletButton>
        ))}
      </WalletList>
    </ModalContent>
  );
};

export default WalletModal;