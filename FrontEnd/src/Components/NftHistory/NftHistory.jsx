import { useState, useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { API_BASE } from '../../config/api';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  margin-top: 32px;
  margin-bottom: 32px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  
  &:hover {
    opacity: 0.8;
  }
`;

const Title = styled.h3`
  margin: 0;
  color: white;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ToggleIcon = styled.span`
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.5rem;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0)'};
`;

const Content = styled.div`
  max-height: ${props => props.$isOpen ? '2000px' : '0'};
  overflow: hidden;
  transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: ${props => props.$isOpen ? '28px' : '0'};
  opacity: ${props => props.$isOpen ? '1' : '0'};
  transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), 
              opacity 0.4s ease,
              margin-top 0.5s cubic-bezier(0.4, 0, 0.2, 1);
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HistoryItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 16px;
  align-items: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(102, 126, 234, 0.3);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const UsersFlow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateX(2px);
  }
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${props => props.$hasImage 
    ? `url(${props.$src}) center/cover` 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  font-size: 0.9rem;
`;

const UserName = styled.span`
  color: white;
  font-weight: 600;
  font-size: 0.9rem;

  &:hover {
    color: #a8b5ff;
  }
`;

const Arrow = styled.span`
  color: rgba(255, 255, 255, 0.4);
  font-size: 1.2rem;

  @media (max-width: 768px) {
    transform: rotate(90deg);
  }
`;

const PriceBox = styled.div`
  text-align: right;

  @media (max-width: 768px) {
    text-align: left;
  }
`;

const Price = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #10b981;
  margin-bottom: 2px;
`;

const PriceUSD = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
`;

const DateBox = styled.div`
  text-align: right;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;

  @media (max-width: 768px) {
    text-align: left;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.95rem;
`;

const Loading = styled.div`
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.6);
`;

function NftHistory({ nftId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && history.length === 0) {
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/nft/${nftId}/history`);
      const data = await response.json();

      if (data.success) {
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return diffMins <= 1 ? 'Agora' : `Há ${diffMins} minutos`;
      }
      return `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    }
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getUserInitial = (user) => {
    if (!user || !user.name) return '?';
    return user.name.charAt(0).toUpperCase();
  };

  return (
    <Container>
      <Header onClick={() => setIsOpen(!isOpen)}>
        <Title>
          📜 Histórico de Transações
          {history.length > 0 && (
            <span style={{ 
              fontSize: '0.85rem', 
              color: 'rgba(255, 255, 255, 0.5)', 
              fontWeight: 400 
            }}>
              ({history.length})
            </span>
          )}
        </Title>
        <ToggleIcon $isOpen={isOpen}>▼</ToggleIcon>
      </Header>

      <Content $isOpen={isOpen}>
        {loading ? (
          <Loading>Carregando histórico...</Loading>
        ) : history.length === 0 ? (
          <EmptyState>
            Nenhuma transação registrada ainda
          </EmptyState>
        ) : (
          <HistoryList>
            {history.map((item) => (
              <HistoryItem key={item.transaction_id}>
                <UsersFlow>
                  {item.from_user && (
                    <UserInfo onClick={() => navigate(`/users/${item.from_user.user_id}`)}>
                      <Avatar 
                        $hasImage={!!item.from_user.avatar_url}
                        $src={item.from_user.avatar_url}
                      >
                        {!item.from_user.avatar_url && getUserInitial(item.from_user)}
                      </Avatar>
                      <UserName>{item.from_user.name}</UserName>
                    </UserInfo>
                  )}

                  <Arrow>→</Arrow>

                  {item.to_user && (
                    <UserInfo onClick={() => navigate(`/users/${item.to_user.user_id}`)}>
                      <Avatar 
                        $hasImage={!!item.to_user.avatar_url}
                        $src={item.to_user.avatar_url}
                      >
                        {!item.to_user.avatar_url && getUserInitial(item.to_user)}
                      </Avatar>
                      <UserName>{item.to_user.name}</UserName>
                    </UserInfo>
                  )}
                </UsersFlow>

                <PriceBox>
                  <Price>{item.amount_eth.toFixed(4)} ETH</Price>
                  <PriceUSD>≈ ${(item.amount_eth * 2000).toFixed(2)}</PriceUSD>
                </PriceBox>

                <DateBox>
                  {formatDate(item.created_at)}
                </DateBox>
              </HistoryItem>
            ))}
          </HistoryList>
        )}
      </Content>
    </Container>
  );
}

NftHistory.propTypes = {
  nftId: PropTypes.string.isRequired
};

export default NftHistory;
