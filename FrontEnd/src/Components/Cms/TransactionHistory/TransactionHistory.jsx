import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { API_BASE } from '../../../config/api';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  padding: 40px;
  max-width: 1600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  color: white;
  font-size: 2rem;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  font-size: 1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, ${props => props.$gradient});
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const StatValue = styled.div`
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
`;

const TableContainer = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Thead = styled.thead`
  background: rgba(255, 255, 255, 0.05);
`;

const Th = styled.th`
  padding: 16px;
  text-align: left;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  white-space: nowrap;
`;

const Tbody = styled.tbody``;

const Tr = styled.tr`
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
`;

const Td = styled.td`
  padding: 16px;
  color: rgba(255, 255, 255, 0.9);
  vertical-align: middle;
`;

const NftCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateX(2px);
  }
`;

const NftImage = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background: ${props => `url(${props.$src}) center/cover`};
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const NftInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const NftName = styled.div`
  color: white;
  font-weight: 600;
  font-size: 0.95rem;

  &:hover {
    color: #a8b5ff;
  }
`;

const NftCollection = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
`;

const UserCell = styled.div`
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
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$hasImage 
    ? `url(${props.$src}) center/cover` 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  font-size: 0.75rem;
  flex-shrink: 0;
`;

const UserName = styled.span`
  color: white;
  font-weight: 500;

  &:hover {
    color: #a8b5ff;
  }
`;

const PriceCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const PriceETH = styled.div`
  color: #10b981;
  font-weight: 700;
  font-size: 1rem;
`;

const PriceUSD = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
`;

const AppreciationBadge = styled.div`
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: ${props => props.$value > 0 
    ? 'rgba(34, 197, 94, 0.2)' 
    : props.$value < 0 
      ? 'rgba(239, 68, 68, 0.2)' 
      : 'rgba(156, 163, 175, 0.2)'};
  color: ${props => props.$value > 0 
    ? '#22c55e' 
    : props.$value < 0 
      ? '#ef4444' 
      : '#9ca3af'};
  border: 1px solid ${props => props.$value > 0 
    ? 'rgba(34, 197, 94, 0.4)' 
    : props.$value < 0 
      ? 'rgba(239, 68, 68, 0.4)' 
      : 'rgba(156, 163, 175, 0.4)'};
`;

const DateCell = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
`;

const PageButton = styled.button`
  padding: 8px 16px;
  background: ${props => props.$active 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : 'rgba(255, 255, 255, 0.05)'};
  color: white;
  border: 1px solid ${props => props.$active 
    ? 'transparent' 
    : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.$active 
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
      : 'rgba(255, 255, 255, 0.1)'};
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
`;

const Loading = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: rgba(255, 255, 255, 0.5);
  
  h3 {
    color: white;
    font-size: 1.3rem;
    margin-bottom: 8px;
  }
`;

function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${API_BASE}/api/nft/transactions/all?page=${currentPage}&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalTransactions(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserInitial = (user) => {
    if (!user || !user.name) return '?';
    return user.name.charAt(0).toUpperCase();
  };

  const calculateAppreciation = (transaction) => {
    // Se não temos o preço original, não podemos calcular
    if (!transaction.nft?.original_price || transaction.nft.original_price === 0) {
      return null;
    }

    const originalPrice = parseFloat(transaction.nft.original_price);
    const currentPrice = parseFloat(transaction.amount_eth);
    const appreciation = ((currentPrice - originalPrice) / originalPrice) * 100;
    
    return appreciation;
  };

  const calculateStats = () => {
    if (transactions.length === 0) {
      return {
        totalVolume: 0,
        avgPrice: 0,
        avgAppreciation: 0
      };
    }

    const totalVolume = transactions.reduce((sum, t) => sum + parseFloat(t.amount_eth), 0);
    const avgPrice = totalVolume / transactions.length;
    
    const appreciations = transactions
      .map(t => calculateAppreciation(t))
      .filter(a => a !== null);
    
    const avgAppreciation = appreciations.length > 0
      ? appreciations.reduce((sum, a) => sum + a, 0) / appreciations.length
      : 0;

    return { totalVolume, avgPrice, avgAppreciation };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <Container>
        <Loading>Carregando histórico de transações...</Loading>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>📊 Histórico de Transações</Title>
        <Subtitle>
          Acompanhe todas as vendas e compras de NFTs na plataforma
        </Subtitle>
      </Header>

      <StatsGrid>
        <StatCard $gradient="rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.4)">
          <StatLabel>Total de Transações</StatLabel>
          <StatValue>{totalTransactions}</StatValue>
        </StatCard>

        <StatCard $gradient="rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.4)">
          <StatLabel>Volume Total</StatLabel>
          <StatValue>{stats.totalVolume.toFixed(2)} ETH</StatValue>
        </StatCard>

        <StatCard $gradient="rgba(168, 85, 247, 0.2), rgba(147, 51, 234, 0.4)">
          <StatLabel>Preço Médio</StatLabel>
          <StatValue>{stats.avgPrice.toFixed(4)} ETH</StatValue>
        </StatCard>

        <StatCard $gradient="rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.4)">
          <StatLabel>Valorização Média</StatLabel>
          <StatValue>
            {stats.avgAppreciation > 0 ? '+' : ''}
            {stats.avgAppreciation.toFixed(1)}%
          </StatValue>
        </StatCard>
      </StatsGrid>

      <TableContainer>
        <TableWrapper>
          <Table>
            <Thead>
              <tr>
                <Th>NFT</Th>
                <Th>Criador</Th>
                <Th>Vendedor</Th>
                <Th>Comprador</Th>
                <Th>Valor</Th>
                <Th>Valorização</Th>
                <Th>Data</Th>
              </tr>
            </Thead>
            <Tbody>
              {transactions.length === 0 ? (
                <tr>
                  <Td colSpan="7">
                    <EmptyState>
                      <h3>Nenhuma transação encontrada</h3>
                      <p>Ainda não há transações registradas no sistema</p>
                    </EmptyState>
                  </Td>
                </tr>
              ) : (
                transactions.map((transaction) => {
                  const appreciation = calculateAppreciation(transaction);
                  
                  return (
                    <Tr key={transaction.transaction_id}>
                      <Td>
                        <NftCell onClick={() => navigate(`/nft/${transaction.nft?.nft_id}`)}>
                          <NftImage $src={transaction.nft?.image_url} />
                          <NftInfo>
                            <NftName>{transaction.nft?.name || 'NFT sem nome'}</NftName>
                            <NftCollection>
                              {transaction.nft?.collection_name || 'Sem coleção'}
                            </NftCollection>
                          </NftInfo>
                        </NftCell>
                      </Td>

                      <Td>
                        {transaction.creator && (
                          <UserCell onClick={() => navigate(`/users/${transaction.creator.user_id}`)}>
                            <Avatar 
                              $hasImage={!!transaction.creator.avatar_url}
                              $src={transaction.creator.avatar_url}
                            >
                              {!transaction.creator.avatar_url && getUserInitial(transaction.creator)}
                            </Avatar>
                            <UserName>{transaction.creator.name}</UserName>
                          </UserCell>
                        )}
                      </Td>

                      <Td>
                        {transaction.from_user && (
                          <UserCell onClick={() => navigate(`/users/${transaction.from_user.user_id}`)}>
                            <Avatar 
                              $hasImage={!!transaction.from_user.avatar_url}
                              $src={transaction.from_user.avatar_url}
                            >
                              {!transaction.from_user.avatar_url && getUserInitial(transaction.from_user)}
                            </Avatar>
                            <UserName>{transaction.from_user.name}</UserName>
                          </UserCell>
                        )}
                      </Td>

                      <Td>
                        {transaction.to_user && (
                          <UserCell onClick={() => navigate(`/users/${transaction.to_user.user_id}`)}>
                            <Avatar 
                              $hasImage={!!transaction.to_user.avatar_url}
                              $src={transaction.to_user.avatar_url}
                            >
                              {!transaction.to_user.avatar_url && getUserInitial(transaction.to_user)}
                            </Avatar>
                            <UserName>{transaction.to_user.name}</UserName>
                          </UserCell>
                        )}
                      </Td>

                      <Td>
                        <PriceCell>
                          <PriceETH>{parseFloat(transaction.amount_eth).toFixed(4)} ETH</PriceETH>
                          <PriceUSD>
                            ≈ ${(parseFloat(transaction.amount_eth) * 2000).toFixed(2)}
                          </PriceUSD>
                        </PriceCell>
                      </Td>

                      <Td>
                        {appreciation !== null ? (
                          <AppreciationBadge $value={appreciation}>
                            {appreciation > 0 ? '📈' : appreciation < 0 ? '📉' : '➖'}
                            {appreciation > 0 ? '+' : ''}
                            {appreciation.toFixed(1)}%
                          </AppreciationBadge>
                        ) : (
                          <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>—</span>
                        )}
                      </Td>

                      <Td>
                        <DateCell>{formatDate(transaction.created_at)}</DateCell>
                      </Td>
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>
        </TableWrapper>

        {totalPages > 1 && (
          <Pagination>
            <PageButton 
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1}
            >
              ← Anterior
            </PageButton>
            
            <PageInfo>
              Página {currentPage} de {totalPages}
            </PageInfo>
            
            <PageButton 
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === totalPages}
            >
              Próxima →
            </PageButton>
          </Pagination>
        )}
      </TableContainer>
    </Container>
  );
}

export default TransactionHistory;
