/**
 * Página de Gerenciamento de Imagens IPFS
 * Combina upload e visualização automática de imagens do Pinata
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import AutoPinataGallery from '../Components/AutoPinataGallery';
import PinataUpload from '../Components/PinataUpload';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  padding-top: 100px; /* Account for header */
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  color: white;
  font-size: 2.5rem;
  margin-bottom: 10px;
  background: linear-gradient(45deg, #27ae60, #2ecc71);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  color: rgba(255,255,255,0.7);
  font-size: 1.1rem;
  margin-bottom: 30px;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
`;

const TabButton = styled.button`
  padding: 12px 24px;
  border: 1px solid rgba(255,255,255,0.2);
  background: ${props => props.active ? 'rgba(39,174,96,0.2)' : 'transparent'};
  color: ${props => props.active ? '#27ae60' : 'white'};
  border-color: ${props => props.active ? '#27ae60' : 'rgba(255,255,255,0.2)'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:first-child {
    border-radius: 6px 0 0 6px;
  }
  
  &:last-child {
    border-radius: 0 6px 6px 0;
    border-left: none;
  }
  
  &:hover {
    background: rgba(39,174,96,0.1);
    color: #27ae60;
  }
`;

const TabContent = styled.div`
  min-height: 500px;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #27ae60;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: rgba(255,255,255,0.7);
  font-size: 0.9rem;
`;

const IPFSManager = () => {
  const [activeTab, setActiveTab] = useState('gallery');
  const [uploadCount, setUploadCount] = useState(0);
  
  // Mock stats - você pode implementar com dados reais
  const stats = [
    { label: 'Total de Imagens', value: '24' },
    { label: 'Espaço Usado', value: '156 MB' },
    { label: 'Uploads Hoje', value: uploadCount.toString() },
    { label: 'NFTs Criados', value: '8' }
  ];

  const handleUploadSuccess = (results) => {
    setUploadCount(prev => prev + results.length);
    // Força refresh da galeria se estiver na aba ativa
    if (activeTab === 'gallery') {
      // A galeria vai se atualizar automaticamente via hook
    }
  };

  return (
    <Container>
      <ContentWrapper>
        <PageHeader>
          <Title>🌐 IPFS Manager</Title>
          <Subtitle>
            Gerencie suas imagens descentralizadas com Pinata IPFS
          </Subtitle>
        </PageHeader>

        <StatsContainer>
          {stats.map((stat, index) => (
            <StatCard key={index}>
              <StatNumber>{stat.value}</StatNumber>
              <StatLabel>{stat.label}</StatLabel>
            </StatCard>
          ))}
        </StatsContainer>

        <TabContainer>
          <TabButton
            active={activeTab === 'gallery'}
            onClick={() => setActiveTab('gallery')}
          >
            📁 Galeria
          </TabButton>
          <TabButton
            active={activeTab === 'upload'}
            onClick={() => setActiveTab('upload')}
          >
            📤 Upload
          </TabButton>
        </TabContainer>

        <TabContent>
          {activeTab === 'gallery' && (
            <AutoPinataGallery
              title="Suas Imagens IPFS (Auto-Sync)"
              category={null}
            />
          )}

          {activeTab === 'upload' && (
            <div>
              <PinataUpload
                onUploadSuccess={handleUploadSuccess}
                category="general"
              />
              
              {uploadCount > 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: '#27ae60',
                  fontSize: '1.1rem'
                }}>
                  ✅ {uploadCount} imagem(ns) enviada(s) nesta sessão
                </div>
              )}
            </div>
          )}
        </TabContent>
      </ContentWrapper>
    </Container>
  );
};

export default IPFSManager;