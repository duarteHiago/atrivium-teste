/**
 * Seletor de Imagens do Pinata com Cache Automático
 * Componente para selecionar imagens já sincronizadas
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useAutoPinataImages } from '../../hooks/useAutoPinataImages';

const SelectorContainer = styled.div`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const Title = styled.h3`
  color: white;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
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

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255,255,255,0.1);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.3);
    border-radius: 4px;
    
    &:hover {
      background: rgba(255,255,255,0.5);
    }
  }
`;

const ImageItem = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid ${props => props.selected ? '#27ae60' : 'transparent'};
  
  &:hover {
    transform: scale(1.05);
    border-color: ${props => props.selected ? '#27ae60' : 'rgba(255,255,255,0.3)'};
  }
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.selected ? 'rgba(39,174,96,0.3)' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  opacity: ${props => props.selected ? 1 : 0};
  transition: opacity 0.2s ease;
`;

const ImageName = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 4px 8px;
  font-size: 0.7rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: rgba(255,255,255,0.6);
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: rgba(255,255,255,0.7);
`;

const SelectedInfo = styled.div`
  margin-top: 15px;
  padding: 10px;
  background: rgba(39,174,96,0.1);
  border: 1px solid rgba(39,174,96,0.2);
  border-radius: 6px;
  color: #27ae60;
`;

const PinataImageSelector = ({ 
  category = null, 
  onImageSelect, 
  selectedImage = null,
  placeholder = "Selecione uma imagem do IPFS" 
}) => {
  const {
    images,
    loading,
    searchImages,
    isEmpty,
    totalCached
  } = useAutoPinataImages(category);

  const [searchQuery, setSearchQuery] = useState('');

  // Filtra imagens baseado na busca
  const filteredImages = searchQuery ? searchImages(searchQuery) : images;

  const handleImageSelect = (image) => {
    if (onImageSelect) {
      onImageSelect(image);
    }
  };

  const isSelected = (image) => {
    return selectedImage && selectedImage.hash === image.hash;
  };

  return (
    <SelectorContainer>
      <Header>
        <Title>
          🖼️ {placeholder}
          {totalCached > 0 && (
            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
              ({totalCached} no cache)
            </span>
          )}
        </Title>
        
        {!isEmpty && (
          <SearchInput
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        )}
      </Header>

      {loading && (
        <LoadingState>
          🔄 Carregando imagens do cache...
        </LoadingState>
      )}

      {!loading && isEmpty && (
        <EmptyState>
          📁 Nenhuma imagem disponível
          <div style={{ fontSize: '0.9rem', marginTop: '5px' }}>
            A sincronização automática irá buscar as imagens em breve
          </div>
        </EmptyState>
      )}

      {!loading && filteredImages.length > 0 && (
        <>
          <ImageGrid>
            {filteredImages.map((image) => (
              <ImageItem
                key={image.hash}
                selected={isSelected(image)}
                onClick={() => handleImageSelect(image)}
              >
                <Image
                  src={image.url}
                  alt={image.name}
                  loading="lazy"
                />
                <ImageOverlay selected={isSelected(image)}>
                  {isSelected(image) && '✓'}
                </ImageOverlay>
                <ImageName>{image.name}</ImageName>
              </ImageItem>
            ))}
          </ImageGrid>

          {selectedImage && (
            <SelectedInfo>
              ✅ Selecionado: {selectedImage.name}
              <div style={{ fontSize: '0.8rem', marginTop: '3px' }}>
                {selectedImage.url}
              </div>
            </SelectedInfo>
          )}
        </>
      )}

      {searchQuery && filteredImages.length === 0 && !loading && !isEmpty && (
        <EmptyState>
          🔍 Nenhuma imagem encontrada para "{searchQuery}"
        </EmptyState>
      )}
    </SelectorContainer>
  );
};

export default PinataImageSelector;