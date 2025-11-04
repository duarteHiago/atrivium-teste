import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { API_BASE } from '../../config/api';

const heartBeat = keyframes`
  0% { transform: scale(1); }
  25% { transform: scale(1.3); }
  50% { transform: scale(1.1); }
  75% { transform: scale(1.25); }
  100% { transform: scale(1); }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: ${p => p.$compact ? '4px' : '8px'};
  padding: ${p => p.$compact ? '6px 10px' : '10px 16px'};
  background: ${p => p.$isFavorited 
    ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(239, 68, 68, 0.2))' 
    : 'rgba(255, 255, 255, 0.05)'
  };
  border: 1px solid ${p => p.$isFavorited 
    ? 'rgba(239, 68, 68, 0.5)' 
    : 'rgba(255, 255, 255, 0.15)'
  };
  border-radius: ${p => p.$compact ? '6px' : '8px'};
  color: white;
  cursor: pointer;
  font-size: ${p => p.$compact ? '0.85em' : '1em'};
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: ${p => p.$isFavorited 
      ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.3), rgba(239, 68, 68, 0.3))' 
      : 'rgba(255, 255, 255, 0.1)'
    };
    border-color: ${p => p.$isFavorited 
      ? 'rgba(239, 68, 68, 0.7)' 
      : 'rgba(255, 255, 255, 0.3)'
    };
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const HeartIcon = styled.span`
  font-size: ${p => p.$compact ? '1em' : '1.2em'};
  transition: transform 0.3s ease;
  animation: ${p => p.$animate ? heartBeat : 'none'} 0.5s ease;
  color: ${p => p.$isFavorited ? '#ef4444' : 'rgba(255, 255, 255, 0.7)'};
`;

const Count = styled.span`
  font-size: ${p => p.$compact ? '0.9em' : '0.95em'};
  color: ${p => p.$isFavorited ? '#ef4444' : 'rgba(255, 255, 255, 0.8)'};
  font-variant-numeric: tabular-nums;
`;

function FavoriteButton({ nftId, initialCount = 0, initialIsFavorited = false, showCount = true, compact = false }) {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Carrega estado inicial do servidor
    async function loadFavoriteState() {
      try {
        const res = await fetch(`${API_BASE}/api/nft/${nftId}/favorites`);
        const data = await res.json();
        
        if (data.success) {
          setCount(data.totalFavorites);
          setIsFavorited(data.isFavorited);
        }
      } catch (error) {
        console.error('Erro ao carregar estado de favorito:', error);
      }
    }
    
    loadFavoriteState();
  }, [nftId]);

  async function toggleFavorite() {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Faça login para favoritar NFTs');
      return;
    }

    setLoading(true);
    
    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const res = await fetch(`${API_BASE}/api/nft/${nftId}/favorite`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Erro ao atualizar favorito');
      }

      // Atualiza estado local
      setIsFavorited(!isFavorited);
      setCount(data.totalFavorites);
      
      // Trigger animação
      setAnimate(true);
      setTimeout(() => setAnimate(false), 500);

    } catch (error) {
      console.error('Erro ao favoritar:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button 
      onClick={toggleFavorite} 
      disabled={loading}
      $isFavorited={isFavorited}
      $compact={compact}
      title={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <HeartIcon $isFavorited={isFavorited} $animate={animate} $compact={compact}>
        {isFavorited ? '❤️' : '🤍'}
      </HeartIcon>
      {showCount && <Count $isFavorited={isFavorited} $compact={compact}>{count}</Count>}
    </Button>
  );
}

export default FavoriteButton;
