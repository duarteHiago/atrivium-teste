/**
 * Componente de Upload para Pinata IPFS
 */

import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { usePinataImages } from '../../hooks/usePinataImages';

const UploadContainer = styled.div`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
`;

const DropZone = styled.div`
  border: 2px dashed ${props => props.isDragOver ? '#27ae60' : 'rgba(255,255,255,0.3)'};
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  background: ${props => props.isDragOver ? 'rgba(39,174,96,0.1)' : 'transparent'};
  
  &:hover {
    border-color: #27ae60;
    background: rgba(39,174,96,0.05);
  }
`;

const UploadText = styled.div`
  color: white;
  margin-bottom: 10px;
  
  .main {
    font-size: 1.2rem;
    margin-bottom: 8px;
  }
  
  .sub {
    font-size: 0.9rem;
    color: rgba(255,255,255,0.7);
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const MetadataForm = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 20px;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  background: rgba(255,255,255,0.1);
  color: white;
  
  &::placeholder {
    color: rgba(255,255,255,0.5);
  }
  
  &:focus {
    outline: none;
    border-color: #27ae60;
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  background: rgba(255,255,255,0.1);
  color: white;
  
  option {
    background: #1a1a1a;
    color: white;
  }
`;

const Textarea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  background: rgba(255,255,255,0.1);
  color: white;
  min-height: 80px;
  resize: vertical;
  
  &::placeholder {
    color: rgba(255,255,255,0.5);
  }
  
  &:focus {
    outline: none;
    border-color: #27ae60;
  }
`;

const UploadButton = styled.button`
  background: #27ae60;
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 15px;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #2ecc71;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PreviewContainer = styled.div`
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const PreviewItem = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.2);
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: rgba(231, 76, 60, 0.8);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  
  &:hover {
    background: #e74c3c;
  }
`;

const UploadStatus = styled.div`
  margin-top: 15px;
  padding: 10px;
  border-radius: 6px;
  
  ${props => {
    switch (props.type) {
      case 'success':
        return 'background: rgba(39, 174, 96, 0.2); color: #27ae60; border: 1px solid rgba(39, 174, 96, 0.3);';
      case 'error':
        return 'background: rgba(231, 76, 60, 0.2); color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.3);';
      case 'loading':
        return 'background: rgba(255, 193, 7, 0.2); color: #f39c12; border: 1px solid rgba(255, 193, 7, 0.3);';
      default:
        return 'background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2);';
    }
  }}
`;

const PinataUpload = ({ onUploadSuccess, category = 'general' }) => {
  const { uploadImage, loading } = usePinataImages(null, false);
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [metadata, setMetadata] = useState({
    category: category,
    description: '',
    tags: ''
  });
  const [uploadStatus, setUploadStatus] = useState(null);
  
  const fileInputRef = useRef();

  const handleFileSelect = (files) => {
    const validFiles = Array.from(files).filter(file => {
      const isImage = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isImage && isValidSize;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e) => {
    handleFileSelect(e.target.files);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploadStatus({ type: 'loading', message: 'Fazendo upload das imagens...' });

    try {
      const uploadPromises = selectedFiles.map(file => {
        const fileMetadata = {
          name: file.name,
          category: metadata.category,
          description: metadata.description,
          tags: metadata.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          contentType: file.type
        };

        return uploadImage(file, fileMetadata);
      });

      const results = await Promise.all(uploadPromises);
      
      setUploadStatus({
        type: 'success',
        message: `${results.length} imagem(ns) enviada(s) com sucesso!`
      });

      // Limpa o formulário
      setSelectedFiles([]);
      setMetadata({
        category: category,
        description: '',
        tags: ''
      });

      // Chama callback se fornecido
      if (onUploadSuccess) {
        onUploadSuccess(results);
      }

      // Remove status após 3 segundos
      setTimeout(() => setUploadStatus(null), 3000);

    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: `Erro no upload: ${error.message}`
      });
    }
  };

  return (
    <UploadContainer>
      <DropZone
        isDragOver={isDragOver}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <UploadText>
          <div className="main">📁 Clique ou arraste imagens aqui</div>
          <div className="sub">
            Suporte para JPG, PNG, GIF, WebP (máx. 10MB por arquivo)
          </div>
        </UploadText>
      </DropZone>

      <HiddenInput
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleInputChange}
      />

      {selectedFiles.length > 0 && (
        <PreviewContainer>
          {selectedFiles.map((file, index) => (
            <PreviewItem key={index}>
              <PreviewImage
                src={URL.createObjectURL(file)}
                alt={file.name}
              />
              <RemoveButton onClick={() => removeFile(index)}>
                ×
              </RemoveButton>
            </PreviewItem>
          ))}
        </PreviewContainer>
      )}

      {selectedFiles.length > 0 && (
        <MetadataForm>
          <InputGroup>
            <Label>Categoria</Label>
            <Select
              value={metadata.category}
              onChange={(e) => setMetadata(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="general">Geral</option>
              <option value="nft">NFT</option>
              <option value="avatar">Avatar</option>
              <option value="collection">Coleção</option>
              <option value="banner">Banner</option>
            </Select>
          </InputGroup>

          <InputGroup>
            <Label>Tags (separadas por vírgula)</Label>
            <Input
              type="text"
              placeholder="arte, digital, nft..."
              value={metadata.tags}
              onChange={(e) => setMetadata(prev => ({ ...prev, tags: e.target.value }))}
            />
          </InputGroup>

          <InputGroup style={{ gridColumn: '1 / -1' }}>
            <Label>Descrição</Label>
            <Textarea
              placeholder="Descrição da imagem..."
              value={metadata.description}
              onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
            />
          </InputGroup>
        </MetadataForm>
      )}

      {selectedFiles.length > 0 && (
        <UploadButton
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? '🔄 Enviando...' : `📤 Enviar ${selectedFiles.length} imagem(ns)`}
        </UploadButton>
      )}

      {uploadStatus && (
        <UploadStatus type={uploadStatus.type}>
          {uploadStatus.message}
        </UploadStatus>
      )}
    </UploadContainer>
  );
};

export default PinataUpload;