/**
 * Componente de Status da Sincronização Automática
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import PinataAutoSync from '../../services/pinataAutoSync.service';

const StatusContainer = styled.div`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
`;

const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const StatusTitle = styled.h3`
  color: white;
  margin: 0;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
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

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
`;

const StatItem = styled.div`
  background: rgba(255,255,255,0.03);
  border-radius: 6px;
  padding: 8px;
  text-align: center;
`;

const StatValue = styled.div`
  color: #27ae60;
  font-weight: bold;
  font-size: 1.1rem;
`;

const StatLabel = styled.div`
  color: rgba(255,255,255,0.7);
  font-size: 0.8rem;
  margin-top: 2px;
`;

const ControlButton = styled.button`
  background: ${props => props.variant === 'danger' ? '#e74c3c' : '#27ae60'};
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const TimeDisplay = styled.div`
  color: rgba(255,255,255,0.6);
  font-size: 0.85rem;
  margin-top: 8px;
`;

const SyncStatus = ({ onSyncForce }) => {
  const [stats, setStats] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  // Atualiza estatísticas
  useEffect(() => {
    const updateStats = () => {
      const currentStats = PinataAutoSync.getStats();
      setStats(currentStats);
      
      // Calcula tempo para próxima sincronização
      if (currentStats.nextSync) {
        const now = new Date();
        const next = new Date(currentStats.nextSync);
        const diff = next.getTime() - now.getTime();
        
        if (diff > 0) {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        } else {
          setTimeLeft('Sincronizando...');
        }
      } else {
        setTimeLeft('Não agendado');
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 1000);

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

  const handleForceSync = async () => {
    setSyncing(true);
    await PinataAutoSync.syncNow();
    if (onSyncForce) onSyncForce();
  };

  const handleToggleSync = () => {
    if (stats?.isRunning) {
      PinataAutoSync.stop();
    } else {
      PinataAutoSync.start();
    }
    setStats(PinataAutoSync.getStats());
  };

  if (!stats) return null;

  const getStatusType = () => {
    if (syncing) return 'syncing';
    if (stats.isRunning) return 'connected';
    return 'offline';
  };

  const getStatusText = () => {
    if (syncing) return 'Sincronizando...';
    if (stats.isRunning) return 'Sincronização Ativa';
    return 'Sincronização Pausada';
  };

  const formatDate = (date) => {
    if (!date) return 'Nunca';
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <StatusContainer>
      <StatusHeader>
        <StatusTitle>
          <StatusIndicator status={getStatusType()} />
          {getStatusText()}
        </StatusTitle>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <ControlButton
            onClick={handleForceSync}
            disabled={syncing}
          >
            {syncing ? '🔄' : '↻'} Sincronizar
          </ControlButton>
          
          <ControlButton
            onClick={handleToggleSync}
            variant={stats.isRunning ? 'danger' : 'primary'}
          >
            {stats.isRunning ? '⏸️ Pausar' : '▶️ Iniciar'}
          </ControlButton>
        </div>
      </StatusHeader>

      <StatusGrid>
        <StatItem>
          <StatValue>{stats.totalCached || 0}</StatValue>
          <StatLabel>Imagens em Cache</StatLabel>
        </StatItem>
        
        <StatItem>
          <StatValue>{Math.floor(stats.syncInterval / 60000)}min</StatValue>
          <StatLabel>Intervalo</StatLabel>
        </StatItem>
        
        <StatItem>
          <StatValue>{formatDate(stats.lastSync)}</StatValue>
          <StatLabel>Última Sync</StatLabel>
        </StatItem>
        
        <StatItem>
          <StatValue>{timeLeft || '--'}</StatValue>
          <StatLabel>Próxima em</StatLabel>
        </StatItem>
      </StatusGrid>

      {stats.lastSync && (
        <TimeDisplay>
          💾 Cache atualizado há {
            Math.floor((new Date() - new Date(stats.lastSync)) / 60000)
          } minutos
        </TimeDisplay>
      )}
    </StatusContainer>
  );
};

export default SyncStatus;