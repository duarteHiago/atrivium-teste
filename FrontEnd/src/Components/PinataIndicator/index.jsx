/**
 * Indicador compacto de sincronização do Pinata
 * Para mostrar na barra superior
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import PinataAutoSync from '../../services/pinataAutoSync.service';

const IndicatorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
  color: white;
  font-size: 0.85rem;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255,255,255,0.12);
  }

  @media (max-width: 768px) {
    padding: 4px 8px;
    font-size: 0.8rem;
  }
`;

const StatusDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${props => {
    switch (props.status) {
      case 'syncing': return '#f39c12';
      case 'connected': return '#27ae60';
      case 'error': return '#e74c3c';
      default: return '#95a5a6';
    }
  }};
  animation: ${props => props.status === 'syncing' ? 'pulse 1.5s infinite' : 'none'};
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const PinataIndicator = ({ onClick }) => {
  const [stats, setStats] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // Atualiza estatísticas
  useEffect(() => {
    const updateStats = () => {
      const currentStats = PinataAutoSync.getStats();
      setStats(currentStats);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // A cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  // Listener para eventos de sincronização
  useEffect(() => {
    const handleSyncEvent = (event) => {
      switch (event) {
        case 'sync_complete':
          setSyncing(false);
          setStats(PinataAutoSync.getStats());
          break;
        case 'sync_error':
          setSyncing(false);
          break;
        default:
          break;
      }
    };

    const unsubscribe = PinataAutoSync.addListener(handleSyncEvent);
    return unsubscribe;
  }, []);

  if (!stats) return null;

  const getStatusType = () => {
    if (syncing) return 'syncing';
    if (stats.isRunning) return 'connected';
    return 'offline';
  };

  const getStatusText = () => {
    if (syncing) return 'Sync...';
    if (stats.totalCached > 0) return `${stats.totalCached} IPFS`;
    if (stats.isRunning) return 'IPFS OK';
    return 'IPFS Off';
  };

  return (
    <IndicatorContainer onClick={onClick} title="Clique para abrir IPFS Manager">
      <StatusDot status={getStatusType()} />
      <span>{getStatusText()}</span>
    </IndicatorContainer>
  );
};

export default PinataIndicator;