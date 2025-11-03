import { useState, useEffect } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { API_BASE } from '../../config/api';

const Container = styled.div`
  background: rgba(30, 30, 31, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  margin-top: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  margin: 0;
  color: white;
  font-size: 1.2em;
`;

const MakeOfferButton = styled.button`
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const OffersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const OfferCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const OfferInfo = styled.div`
  flex: 1;
`;

const OfferAmount = styled.div`
  font-size: 1.3em;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 4px;
`;

const OfferMeta = styled.div`
  font-size: 0.85em;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const OfferStatus = styled.span`
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch(props.$status) {
      case 'accepted': return 'rgba(34, 197, 94, 0.2)';
      case 'rejected': return 'rgba(239, 68, 68, 0.2)';
      case 'expired': return 'rgba(156, 163, 175, 0.2)';
      case 'cancelled': return 'rgba(156, 163, 175, 0.2)';
      default: return 'rgba(251, 191, 36, 0.2)';
    }
  }};
  color: ${props => {
    switch(props.$status) {
      case 'accepted': return '#22c55e';
      case 'rejected': return '#ef4444';
      case 'expired': return '#9ca3af';
      case 'cancelled': return '#9ca3af';
      default: return '#fbbf24';
    }
  }};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: 1px solid;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.$variant === 'accept' && `
    background: rgba(34, 197, 94, 0.15);
    border-color: rgba(34, 197, 94, 0.4);
    color: #22c55e;
    
    &:hover {
      background: rgba(34, 197, 94, 0.25);
      border-color: #22c55e;
    }
  `}
  
  ${props => props.$variant === 'reject' && `
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.4);
    color: #ef4444;
    
    &:hover {
      background: rgba(239, 68, 68, 0.25);
      border-color: #ef4444;
    }
  `}
  
  ${props => props.$variant === 'cancel' && `
    background: rgba(156, 163, 175, 0.15);
    border-color: rgba(156, 163, 175, 0.4);
    color: #9ca3af;
    
    &:hover {
      background: rgba(156, 163, 175, 0.25);
      border-color: #9ca3af;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.5);
`;

const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: #1e1e1f;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 100%;
`;

const ModalTitle = styled.h3`
  margin: 0 0 20px 0;
  color: white;
  font-size: 1.5em;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 1em;
  margin-bottom: 12px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 0.95em;
  resize: vertical;
  min-height: 80px;
  margin-bottom: 12px;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

const ModalButton = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  ${props => props.$primary ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    &:hover { transform: translateY(-2px); }
  ` : `
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.8);
    &:hover { background: rgba(255, 255, 255, 0.08); }
  `}
`;

function NftOffers({ nftId, isOwner, currentUserId, basePrice }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [offerExpiry, setOfferExpiry] = useState('24');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nftId]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/nft/${nftId}/offers`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await response.json();
      if (data.success) {
        setOffers(data.offers || []);
      }
    } catch (error) {
      console.error('Erro ao buscar ofertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeOffer = async () => {
    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      alert('Digite um valor válido');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/nft/${nftId}/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          amount: parseFloat(offerAmount),
          message: offerMessage || null,
          expiresInHours: offerExpiry ? parseInt(offerExpiry) : null
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erro ao fazer oferta');
      }

      alert('Oferta enviada com sucesso!');
      setShowModal(false);
      setOfferAmount('');
      setOfferMessage('');
      fetchOffers();
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    if (!window.confirm('Tem certeza que deseja aceitar esta oferta? O NFT será vendido imediatamente.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/nft/offers/${offerId}/accept`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      const data = await response.json();
      
      // Se a oferta já foi processada, remove da lista
      if (!response.ok && data.message && data.message.includes('já foi')) {
        setOffers([]);
        return;
      }
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erro ao aceitar oferta');
      }

      alert('Oferta aceita! NFT vendido com sucesso. A página será atualizada.');
      
      // Atualizar estado local imediatamente - remove todas as ofertas
      setOffers([]);
      
      // Recarregar página após 1.5 segundos
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleRejectOffer = async (offerId) => {
    if (!window.confirm('Tem certeza que deseja rejeitar esta oferta?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/nft/offers/${offerId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erro ao rejeitar oferta');
      }

      alert('Oferta rejeitada.');
      
      // Remover oferta rejeitada imediatamente do estado
      setOffers(prev => prev.filter(offer => offer.offer_id !== offerId));
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCancelOffer = async (offerId) => {
    if (!window.confirm('Tem certeza que deseja cancelar sua oferta?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/nft/offers/${offerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erro ao cancelar oferta');
      }

      alert('Oferta cancelada.');
      
      // Remover oferta cancelada imediatamente do estado
      setOffers(prev => prev.filter(offer => offer.offer_id !== offerId));
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return <Container><EmptyState>Carregando ofertas...</EmptyState></Container>;
  }

  const pendingOffers = offers.filter(o => o.status === 'pending');
  const otherOffers = offers.filter(o => o.status !== 'pending');

  return (
    <Container>
      <Header>
        <Title>💰 Ofertas {pendingOffers.length > 0 && `(${pendingOffers.length})`}</Title>
        {!isOwner && currentUserId && (
          <MakeOfferButton onClick={() => setShowModal(true)}>
            Fazer Oferta
          </MakeOfferButton>
        )}
      </Header>

      <OffersList>
        {pendingOffers.map(offer => (
          <OfferCard key={offer.offer_id}>
            <OfferInfo>
              <OfferAmount>{parseFloat(offer.amount_eth).toFixed(4)} ETH</OfferAmount>
              <OfferMeta>
                <span>De: {offer.buyer_name}</span>
                <span>•</span>
                <span>{new Date(offer.created_at).toLocaleDateString('pt-BR')}</span>
                {offer.expires_at && (
                  <>
                    <span>•</span>
                    <span>Expira: {new Date(offer.expires_at).toLocaleDateString('pt-BR')}</span>
                  </>
                )}
              </OfferMeta>
              {offer.message && (
                <div style={{ marginTop: '8px', fontSize: '0.9em', color: 'rgba(255,255,255,0.7)' }}>
                  💬 {offer.message}
                </div>
              )}
            </OfferInfo>
            <ActionButtons>
              {isOwner ? (
                <>
                  <ActionButton $variant="accept" onClick={() => handleAcceptOffer(offer.offer_id)}>
                    ✓ Aceitar
                  </ActionButton>
                  <ActionButton $variant="reject" onClick={() => handleRejectOffer(offer.offer_id)}>
                    ✕ Rejeitar
                  </ActionButton>
                </>
              ) : (
                String(offer.buyer_id) === String(currentUserId) && (
                  <ActionButton $variant="cancel" onClick={() => handleCancelOffer(offer.offer_id)}>
                    Cancelar
                  </ActionButton>
                )
              )}
            </ActionButtons>
          </OfferCard>
        ))}

        {otherOffers.map(offer => (
          <OfferCard key={offer.offer_id} style={{ opacity: 0.6 }}>
            <OfferInfo>
              <OfferAmount>{parseFloat(offer.amount_eth).toFixed(4)} ETH</OfferAmount>
              <OfferMeta>
                <span>De: {offer.buyer_name}</span>
                <span>•</span>
                <span>{new Date(offer.created_at).toLocaleDateString('pt-BR')}</span>
                <span>•</span>
                <OfferStatus $status={offer.status}>{offer.status}</OfferStatus>
              </OfferMeta>
            </OfferInfo>
          </OfferCard>
        ))}

        {offers.length === 0 && (
          <EmptyState>
            {isOwner 
              ? 'Nenhuma oferta recebida ainda.' 
              : 'Seja o primeiro a fazer uma oferta!'}
          </EmptyState>
        )}
      </OffersList>

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Fazer Oferta</ModalTitle>
            
            {basePrice && (
              <div style={{ 
                background: 'rgba(102, 126, 234, 0.1)', 
                border: '1px solid rgba(102, 126, 234, 0.3)', 
                borderRadius: '8px', 
                padding: '12px', 
                marginBottom: '16px',
                fontSize: '0.9rem',
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                💡 <strong>Preço Base:</strong> {basePrice.toFixed(4)} ETH
                <div style={{ fontSize: '0.85rem', marginTop: '4px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Sua oferta deve ser maior que este valor para ser competitiva
                </div>
              </div>
            )}
            
            <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.8)' }}>
              Valor da oferta (ETH) *
            </label>
            <Input
              type="number"
              step="0.0001"
              placeholder={basePrice ? `Ex: ${(basePrice * 1.1).toFixed(4)}` : "Ex: 1.5"}
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
            />

            <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.8)' }}>
              Mensagem (opcional)
            </label>
            <TextArea
              placeholder="Explique por que você quer este NFT..."
              value={offerMessage}
              onChange={(e) => setOfferMessage(e.target.value)}
            />

            <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255,255,255,0.8)' }}>
              Validade da oferta (horas)
            </label>
            <Input
              type="number"
              placeholder="24"
              value={offerExpiry}
              onChange={(e) => setOfferExpiry(e.target.value)}
            />

            <ModalButtons>
              <ModalButton onClick={() => setShowModal(false)}>
                Cancelar
              </ModalButton>
              <ModalButton $primary onClick={handleMakeOffer} disabled={submitting}>
                {submitting ? 'Enviando...' : 'Enviar Oferta'}
              </ModalButton>
            </ModalButtons>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
}

NftOffers.propTypes = {
  nftId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  isOwner: PropTypes.bool.isRequired,
  currentUserId: PropTypes.string,
  basePrice: PropTypes.number
};

export default NftOffers;
