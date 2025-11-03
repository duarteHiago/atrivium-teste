import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { API_BASE } from '../../config/api';

const Container = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9em;
  font-weight: 600;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const Button = styled.button`
  background: #10b981;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9em;
  font-weight: 500;

  &:hover {
    background: #059669;
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
  }
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.9em;
  width: 120px;
  margin-right: 8px;

  &:focus {
    outline: none;
    border-color: #10b981;
  }
`;

const BalanceCell = styled.div`
  font-size: 1em;
  font-weight: 600;
  color: #10b981;
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.9em;
  margin-top: 12px;
`;

const SuccessMessage = styled.div`
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.9em;
  margin-top: 12px;
`;

const WalletManagement = () => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [depositAmounts, setDepositAmounts] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processingUserId, setProcessingUserId] = useState(null);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token não encontrado');
        return;
      }

  const res = await fetch(`${API_BASE}/api/wallet/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setWallets(data);
      } else {
        const data = await res.json();
        setError(data.error || 'Erro ao carregar carteiras');
      }
    } catch (err) {
      console.error('Erro ao buscar carteiras:', err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (userId) => {
    try {
      setError('');
      setSuccess('');
      setProcessingUserId(userId);

      const amount = parseFloat(depositAmounts[userId] || 0);
      if (!amount || amount <= 0) {
        setError('Digite um valor válido maior que zero');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Token não encontrado');
        return;
      }

  const res = await fetch(`${API_BASE}/api/wallet/admin/deposit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetUserId: userId,
          amount: amount,
          description: `Depósito administrativo de ${amount} ETH`
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(`${amount} ETH depositado com sucesso!`);
        setDepositAmounts({ ...depositAmounts, [userId]: '' });
        // Recarregar lista
        fetchWallets();
      } else {
        setError(data.error || 'Erro ao processar depósito');
      }
    } catch (err) {
      console.error('Erro ao depositar:', err);
      setError('Erro ao processar depósito');
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleAmountChange = (userId, value) => {
    setDepositAmounts({
      ...depositAmounts,
      [userId]: value
    });
  };

  if (loading) {
    return <Container>Carregando carteiras...</Container>;
  }

  return (
    <Container>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2em' }}>💰 Gerenciamento de Carteiras</h3>
      <p style={{ margin: '0 0 16px 0', color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9em' }}>
        Deposite ETH diretamente nas carteiras dos usuários. Isso simula uma injeção de fundos administrativos.
      </p>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      {wallets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255, 255, 255, 0.5)' }}>
          Nenhuma carteira encontrada
        </div>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Usuário</Th>
              <Th>Email</Th>
              <Th>Saldo Atual</Th>
              <Th>Depositar</Th>
              <Th>Ação</Th>
            </tr>
          </thead>
          <tbody>
            {wallets.map((wallet) => (
              <tr key={wallet.wallet_id}>
                <Td>{wallet.first_name} {wallet.last_name}</Td>
                <Td style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{wallet.email}</Td>
                <Td>
                  <BalanceCell>{parseFloat(wallet.balance_eth).toFixed(4)} ETH</BalanceCell>
                </Td>
                <Td>
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="0.100"
                    value={depositAmounts[wallet.user_id] || ''}
                    onChange={(e) => handleAmountChange(wallet.user_id, e.target.value)}
                    disabled={processingUserId === wallet.user_id}
                  />
                </Td>
                <Td>
                  <Button
                    onClick={() => handleDeposit(wallet.user_id)}
                    disabled={processingUserId === wallet.user_id}
                  >
                    {processingUserId === wallet.user_id ? 'Processando...' : '💸 Depositar'}
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default WalletManagement;
