/**
 * Componente para exibir imagens do Pinata na página Discover
 */

import React from 'react';
import styled from 'styled-components';
import { useAutoPinataImages } from '../../hooks/useAutoPinataImages';

const Section = styled.section`
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const SectionTitle = styled.h2`
  color: white;
  font-size: 1.8rem;
  margin-bottom: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CardRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 20px;
`;

const ImageCard = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 220px;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${ImageCard}:hover & {
    transform: scale(1.05);
  }
`;

const CardImagePlaceholder = styled.div`
  width: 100%;
  height: 220px;
  background: linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.05) 75%, transparent 75%);
  background-size: 20px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.3);
`;

const CardInfo = styled.div`
  padding: 20px;
`;

const CardTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  font-size: 0.85rem;
`;

const CardSize = styled.span`
  color: rgba(255, 255, 255, 0.6);
`;

const CardDate = styled.span`
  color: rgba(255, 255, 255, 0.5);
`;

const CardHash = styled.div`
  font-family: monospace;
  font-size: 0.75rem;
  color: rgba(39, 174, 96, 0.8);
  margin-top: 8px;
  background: rgba(39, 174, 96, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.6);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.6);
`;

const SyncIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: rgba(39, 174, 96, 0.8);
  margin-bottom: 10px;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.syncing ? '#f39c12' : '#27ae60'};
  animation: ${props => props.syncing ? 'pulse 1.5s infinite' : 'none'};
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const PinataDiscoverSection = ({ maxImages = 8 }) => {
  const {
    loading,
    isEmpty,
    isAutoSyncing,
    totalCached,
    getFeaturedImages
  } = useAutoPinataImages();

  // Pega as imagens em destaque (ranking por relevância)
  const displayImages = getFeaturedImages(maxImages);
  
  // Placeholders para quando está carregando
  const placeholderItems = Array.from({ length: maxImages }, (_, i) => i);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    });
  };

  const handleImageClick = (image) => {
    // Abre a imagem em nova aba
    window.open(image.url, '_blank');
  };

  return (
    <Section>
      <SectionTitle>
        🌐 Galeria IPFS
        {isAutoSyncing && (
          <SyncIndicator>
            <StatusDot syncing={loading} />
            {loading ? 'Sincronizando...' : `${totalCached} imagens disponíveis`}
          </SyncIndicator>
        )}
      </SectionTitle>

      <CardRow>
        {loading ? (
          // Mostra placeholders enquanto carrega
          placeholderItems.map((item) => (
            <ImageCard key={`placeholder-${item}`}>
              <CardImagePlaceholder>
                🔄 Carregando...
              </CardImagePlaceholder>
              <CardInfo>
                <CardTitle>Sincronizando imagens...</CardTitle>
                <CardMeta>
                  <CardSize>IPFS</CardSize>
                  <CardDate>Pinata</CardDate>
                </CardMeta>
              </CardInfo>
            </ImageCard>
          ))
        ) : displayImages.length > 0 ? (
          // Mostra as imagens do Pinata
          displayImages.map((image) => (
            <ImageCard 
              key={image.hash} 
              onClick={() => handleImageClick(image)}
            >
              <CardImage 
                src={image.url} 
                alt={image.name}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div style={{ 
                display: 'none', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '220px', 
                background: 'rgba(231,76,60,0.1)',
                color: '#e74c3c' 
              }}>
                ❌ Erro ao carregar
              </div>
              
              <CardInfo>
                <CardTitle>{image.name}</CardTitle>
                
                <CardMeta>
                  <CardSize>{formatFileSize(image.size)}</CardSize>
                  <CardDate>{formatDate(image.uploadedAt)}</CardDate>
                </CardMeta>
                
                <CardHash>
                  🔗 {image.hash}
                </CardHash>
              </CardInfo>
            </ImageCard>
          ))
        ) : isEmpty ? (
          // Estado vazio
          <div style={{ gridColumn: '1 / -1' }}>
            <EmptyState>
              <h3>🌐 Nenhuma imagem IPFS encontrada</h3>
              <p>As imagens do Pinata aparecerão aqui automaticamente quando a sincronização for concluída.</p>
            </EmptyState>
          </div>
        ) : (
          // Placeholders quando não há imagens
          placeholderItems.map((item) => (
            <ImageCard key={`empty-${item}`}>
              <CardImagePlaceholder>
                📁 Vazio
              </CardImagePlaceholder>
              <CardInfo>
                <CardTitle>Aguardando sincronização...</CardTitle>
                <CardMeta>
                  <CardSize>IPFS</CardSize>
                  <CardDate>Pinata</CardDate>
                </CardMeta>
              </CardInfo>
            </ImageCard>
          ))
        )}
      </CardRow>
    </Section>
  );
};

export default PinataDiscoverSection;