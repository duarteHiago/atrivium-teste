/**
 * Modal para gerenciar configurações do IPFS/Pinata
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAutoPinataImages } from '../../hooks/useAutoPinataImages';
import PinataAutoSync from '../../services/pinataAutoSync.service';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px;
  max-width: 500px;
  width: 100%;
  color: white;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h2 {
    margin: 0;
    font-size: 1.4rem;
    color: #9be3b8;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #999;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: white;
  }
`;

const StatusSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
`;

const StatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .label {
    color: #aaa;
  }
  
  .value {
    color: white;
    font-weight: 600;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: ${props => props.variant === 'primary' ? '#9be3b8' : 'rgba(255,255,255,0.1)'};
  color: ${props => props.variant === 'primary' ? 'black' : 'white'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.variant === 'primary' ? '#8fd4a5' : 'rgba(255,255,255,0.15)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RecentImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 16px;
`;

const ImagePreview = styled.div`
  aspect-ratio: 1;
  border-radius: 6px;
  background: rgba(255,255,255,0.1);
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  border: 1px solid rgba(255,255,255,0.2);
`;

const IPFSManager = ({ isOpen, onClose }) => {
  const { images, totalCached, forceSync } = useAutoPinataImages();
  const [stats, setStats] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStats(PinataAutoSync.getStats());
    }
  }, [isOpen]);

  const handleForceSync = async () => {
    setSyncing(true);
    try {
      await forceSync();
    } finally {
      setSyncing(false);
      setStats(PinataAutoSync.getStats());
    }
  };

  const handleClearCache = () => {
    PinataAutoSync.clearCache();
    setStats(PinataAutoSync.getStats());
  };

  const handleDatabaseSync = async () => {
    setSyncing(true);
    try {
      // Importar o serviço dinâmicamente para evitar problemas de dependência circular
      const { default: NFTMergedService } = await import('../../services/nftMerged.service');
      const result = await NFTMergedService.triggerPinataSync();
      
      console.log('🎉 Sincronização concluída:', result);
      alert(`Sincronização concluída! ${result.synced || 0} NFTs sincronizados.`);
      
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      alert(`Erro na sincronização: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  if (!isOpen) return null;

  const recentImages = images.slice(0, 8);

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <h2>🌐 IPFS Manager</h2>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <StatusSection>
          <StatusRow>
            <span className="label">Status:</span>
            <span className="value">
              {syncing ? 'Sincronizando...' : (stats?.isRunning ? 'Conectado' : 'Offline')}
            </span>
          </StatusRow>
          <StatusRow>
            <span className="label">Imagens em cache:</span>
            <span className="value">{totalCached}</span>
          </StatusRow>
          <StatusRow>
            <span className="label">Última sincronização:</span>
            <span className="value">
              {stats?.lastSync ? new Date(stats.lastSync).toLocaleTimeString() : 'Nunca'}
            </span>
          </StatusRow>
          <StatusRow>
            <span className="label">Próxima sincronização:</span>
            <span className="value">
              {stats?.isRunning ? 'Em 5 minutos' : 'Desabilitado'}
            </span>
          </StatusRow>
        </StatusSection>

        <ActionButtons>
          <ActionButton 
            variant="primary" 
            onClick={handleForceSync}
            disabled={syncing}
          >
            {syncing ? 'Sincronizando...' : 'Sincronizar Cache'}
          </ActionButton>
          <ActionButton 
            onClick={handleDatabaseSync}
            disabled={syncing}
          >
            Sincronizar Banco
          </ActionButton>
          <ActionButton onClick={handleClearCache}>
            Limpar Cache
          </ActionButton>
        </ActionButtons>

        {recentImages.length > 0 && (
          <>
            <h3 style={{ marginTop: '24px', marginBottom: '12px', color: '#aaa' }}>
              Imagens Recentes ({recentImages.length})
            </h3>
            <RecentImagesGrid>
              {recentImages.map((image, index) => (
                <ImagePreview 
                  key={image.hash || index}
                  src={image.url}
                  title={`${image.name || 'Sem nome'} - ${image.size ? (image.size / 1024).toFixed(1) + 'KB' : 'Tamanho desconhecido'}`}
                />
              ))}
            </RecentImagesGrid>
          </>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default IPFSManager;