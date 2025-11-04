/**
 * Galeria Automática do Pinata com Sincronização
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useAutoPinataImages } from '../../hooks/useAutoPinataImages';
import SyncStatus from '../SyncStatus';
import PinataService from '../../services/pinata.service';

const GalleryContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
`;

const Title = styled.h2`
  color: white;
  margin: 0;
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  background: rgba(255,255,255,0.1);
  color: white;
  width: 200px;
  
  &::placeholder {
    color: rgba(255,255,255,0.5);
  }
  
  &:focus {
    outline: none;
    border-color: #27ae60;
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  background: rgba(255,255,255,0.1);
  color: white;
  
  option {
    background: #1a1a1a;
    color: white;
  }
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const ImageCard = styled.div`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    border-color: rgba(255,255,255,0.2);
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${ImageCard}:hover & {
    transform: scale(1.05);
  }
`;

const ImageInfo = styled.div`
  padding: 15px;
`;

const ImageName = styled.h3`
  color: white;
  margin: 0 0 8px 0;
  font-size: 1rem;
  word-break: break-word;
`;

const ImageMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.7);
`;

const ImageActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 6px 12px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 4px;
  background: transparent;
  color: white;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255,255,255,0.1);
  }
  
  &.danger {
    color: #e74c3c;
    border-color: rgba(231, 76, 60, 0.3);
    
    &:hover {
      background: rgba(231, 76, 60, 0.1);
    }
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: rgba(255,255,255,0.7);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: rgba(255,255,255,0.7);
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.2);
  border-radius: 8px;
  margin: 20px 0;
`;

const SyncInfo = styled.div`
  background: rgba(39, 174, 96, 0.1);
  border: 1px solid rgba(39, 174, 96, 0.2);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  color: #27ae60;
  text-align: center;
`;

const AutoPinataGallery = ({ 
  category = null, 
  title = "Galeria IPFS (Auto-Sync)"
}) => {
  const {
    images,
    loading,
    error,
    removeImage,
    forceSync,
    searchImages,
    isEmpty,
    isAutoSyncing,
    lastSyncTime,
    totalCached
  } = useAutoPinataImages(category);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');

  // Filtra imagens baseado na busca
  const filteredImages = searchQuery ? searchImages(searchQuery) : images;

  const handleRemoveImage = async (hash, name) => {
    if (window.confirm(`Tem certeza que deseja remover "${name}"?`)) {
      await removeImage(hash);
    }
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    // Pode adicionar toast de confirmação aqui
  };

  return (
    <GalleryContainer>
      <Header>
        <Title>{title}</Title>
        <Controls>
          <SearchInput
            type="text"
            placeholder="Buscar imagens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Todas</option>
            <option value="nft">NFTs</option>
            <option value="avatar">Avatares</option>
            <option value="collection">Coleções</option>
            <option value="general">Geral</option>
          </Select>
        </Controls>
      </Header>

      {/* Status da Sincronização Automática */}
      <SyncStatus onSyncForce={forceSync} />

      {/* Informação sobre sincronização automática */}
      {isAutoSyncing && (
        <SyncInfo>
          🔄 Sincronização automática ativa - {totalCached} imagens em cache
          {lastSyncTime && (
            <div style={{ fontSize: '0.9rem', marginTop: '5px' }}>
              Última atualização: {new Date(lastSyncTime).toLocaleTimeString('pt-BR')}
            </div>
          )}
        </SyncInfo>
      )}

      {error && (
        <ErrorState>
          <h3>Erro ao carregar imagens</h3>
          <p>{error}</p>
          <ActionButton onClick={forceSync}>Tentar novamente</ActionButton>
        </ErrorState>
      )}

      {loading && (
        <LoadingSpinner>
          <div>🔄 Carregando imagens...</div>
        </LoadingSpinner>
      )}

      {!loading && isEmpty && (
        <EmptyState>
          <h3>📁 Nenhuma imagem encontrada</h3>
          <p>
            {searchQuery 
              ? `Nenhuma imagem encontrada para "${searchQuery}"`
              : 'Nenhuma imagem no cache. A sincronização automática irá buscar as imagens.'
            }
          </p>
          <ActionButton onClick={forceSync} style={{ 
            background: '#27ae60', 
            marginTop: '10px',
            width: 'auto',
            padding: '10px 20px'
          }}>
            🔄 Sincronizar Agora
          </ActionButton>
        </EmptyState>
      )}

      {!loading && filteredImages.length > 0 && (
        <ImageGrid>
          {filteredImages.map((image) => (
            <ImageCard key={image.hash}>
              <ImageWrapper>
                <Image
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
                  height: '100%', 
                  background: 'rgba(0,0,0,0.8)',
                  color: 'white' 
                }}>
                  ❌ Erro ao carregar
                </div>
              </ImageWrapper>
              
              <ImageInfo>
                <ImageName>{image.name}</ImageName>
                
                <ImageMeta>
                  <div>📊 {PinataService.formatFileSize(image.size)}</div>
                  <div>📅 {PinataService.formatDate(image.uploadedAt)}</div>
                  <div>🔗 {image.hash.substring(0, 12)}...</div>
                  {image.metadata?.keyvalues?.category && (
                    <div>🏷️ {image.metadata.keyvalues.category}</div>
                  )}
                </ImageMeta>
                
                <ImageActions>
                  <ActionButton onClick={() => handleCopyUrl(image.url)}>
                    📋 Copiar
                  </ActionButton>
                  
                  <ActionButton onClick={() => window.open(image.url, '_blank')}>
                    🔗 Abrir
                  </ActionButton>
                  
                  <ActionButton
                    className="danger"
                    onClick={() => handleRemoveImage(image.hash, image.name)}
                  >
                    🗑️
                  </ActionButton>
                </ImageActions>
              </ImageInfo>
            </ImageCard>
          ))}
        </ImageGrid>
      )}
    </GalleryContainer>
  );
};

export default AutoPinataGallery;