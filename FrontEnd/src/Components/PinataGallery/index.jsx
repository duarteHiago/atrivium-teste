/**
 * Componente de Galeria de Imagens do Pinata
 * Exibe imagens salvas no IPFS via Pinata
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { usePinataImages } from '../../hooks/usePinataImages';
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

const Button = styled.button`
  padding: 8px 16px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  background: rgba(255,255,255,0.1);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255,255,255,0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 20px;
  
  ${props => {
    switch (props.status) {
      case 'connected':
        return 'background: rgba(39, 174, 96, 0.2); border: 1px solid rgba(39, 174, 96, 0.3);';
      case 'error':
        return 'background: rgba(231, 76, 60, 0.2); border: 1px solid rgba(231, 76, 60, 0.3);';
      default:
        return 'background: rgba(255, 193, 7, 0.2); border: 1px solid rgba(255, 193, 7, 0.3);';
    }
  }}
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  
  ${props => {
    switch (props.status) {
      case 'connected': return 'background: #27ae60;';
      case 'error': return 'background: #e74c3c;';
      default: return 'background: #f39c12;';
    }
  }}
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

const PinataGallery = ({ category = null, title = "Galeria IPFS" }) => {
  const {
    images,
    loading,
    error,
    connectionStatus,
    removeImage,
    refresh,
    searchImages,
    isConnected,
    hasError,
    isEmpty
  } = usePinataImages(category);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');

  // Filtra imagens baseado na busca
  const filteredImages = searchQuery ? searchImages(searchQuery) : images;

  const handleCategoryChange = (newCategory) => {
    setSelectedCategory(newCategory);
    // Aqui você pode implementar lógica para recarregar com nova categoria
  };

  const handleRemoveImage = async (hash, name) => {
    if (window.confirm(`Tem certeza que deseja remover "${name}"?`)) {
      await removeImage(hash);
    }
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    // Aqui você pode adicionar um toast de confirmação
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return `✅ Conectado ao Pinata (${images.length} imagens)`;
      case 'error':
        return '❌ Erro de conexão com Pinata';
      default:
        return '🔄 Testando conexão...';
    }
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
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="all">Todas</option>
            <option value="nft">NFTs</option>
            <option value="avatar">Avatares</option>
            <option value="collection">Coleções</option>
          </Select>
          
          <Button onClick={refresh} disabled={loading}>
            {loading ? '🔄' : '↻'} Atualizar
          </Button>
        </Controls>
      </Header>

      <StatusIndicator status={connectionStatus}>
        <StatusDot status={connectionStatus} />
        <span>{getStatusText()}</span>
      </StatusIndicator>

      {hasError && (
        <ErrorState>
          <h3>Erro ao carregar imagens</h3>
          <p>{error}</p>
          <Button onClick={refresh}>Tentar novamente</Button>
        </ErrorState>
      )}

      {loading && (
        <LoadingSpinner>
          <div>🔄 Carregando imagens...</div>
        </LoadingSpinner>
      )}

      {!loading && isEmpty && isConnected && (
        <EmptyState>
          <h3>📁 Nenhuma imagem encontrada</h3>
          <p>
            {searchQuery 
              ? `Nenhuma imagem encontrada para "${searchQuery}"`
              : 'Nenhuma imagem salva no Pinata ainda.'
            }
          </p>
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
                </ImageMeta>
                
                <ImageActions>
                  <ActionButton onClick={() => handleCopyUrl(image.url)}>
                    📋 Copiar URL
                  </ActionButton>
                  
                  <ActionButton onClick={() => window.open(image.url, '_blank')}>
                    🔗 Abrir
                  </ActionButton>
                  
                  <ActionButton
                    className="danger"
                    onClick={() => handleRemoveImage(image.hash, image.name)}
                  >
                    🗑️ Remover
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

export default PinataGallery;