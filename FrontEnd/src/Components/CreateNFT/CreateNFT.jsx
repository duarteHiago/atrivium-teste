import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 80px);
  padding: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: white;
`;

const Description = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  max-width: 600px;
  margin-bottom: 2rem;
`;

const PlaceholderBox = styled.div`
  width: 100%;
  max-width: 800px;
  height: 400px;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 1.2rem;
  font-weight: 500;
`;

const CreateNFT = () => {
  return (
    <Container>
      <Title>Criar seu NFT</Title>
      <Description>
        Em breve você poderá criar seu próprio NFT aqui usando IA generativa!
      </Description>
      <PlaceholderBox>
        🎨 Área de criação de NFT (em desenvolvimento)
      </PlaceholderBox>
    </Container>
  );
};

export default CreateNFT;
