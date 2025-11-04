-- Sistema de Ofertas para NFTs
-- Permite que usuários façam lances em NFTs e donos aceitem/rejeitem

-- Tabela de ofertas
CREATE TABLE IF NOT EXISTS nft_offers (
    offer_id SERIAL PRIMARY KEY,
    nft_id INTEGER NOT NULL REFERENCES nfts(nft_id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    amount_eth DECIMAL(18, 8) NOT NULL CHECK (amount_eth > 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'cancelled')),
    message TEXT, -- mensagem opcional do comprador
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP, -- oferta pode ter validade
    accepted_at TIMESTAMP,
    rejected_at TIMESTAMP,
    CONSTRAINT unique_active_offer UNIQUE (nft_id, buyer_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- Adiciona buy_now_price à tabela nfts (preço para compra imediata)
ALTER TABLE nfts 
ADD COLUMN IF NOT EXISTS buy_now_price DECIMAL(18, 8) CHECK (buy_now_price IS NULL OR buy_now_price > 0);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_offers_nft ON nft_offers(nft_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer ON nft_offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON nft_offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_created ON nft_offers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nfts_buy_now ON nfts(buy_now_price) WHERE buy_now_price IS NOT NULL;

-- Trigger para expirar ofertas automaticamente (pode ser executado por job/cron)
CREATE OR REPLACE FUNCTION expire_old_offers()
RETURNS void AS $$
BEGIN
    UPDATE nft_offers
    SET status = 'expired'
    WHERE status = 'pending'
      AND expires_at IS NOT NULL
      AND expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON TABLE nft_offers IS 'Sistema de ofertas/lances para NFTs - buyers fazem ofertas, owners aceitam/rejeitam';
COMMENT ON COLUMN nft_offers.amount_eth IS 'Valor da oferta em ETH';
COMMENT ON COLUMN nft_offers.status IS 'pending (aguardando), accepted (aceita pelo dono), rejected (recusada), expired (expirou), cancelled (cancelada pelo comprador)';
COMMENT ON COLUMN nft_offers.expires_at IS 'Data de expiração da oferta (NULL = sem expiração)';
COMMENT ON COLUMN nfts.buy_now_price IS 'Preço para compra imediata sem aprovação do dono (NULL = apenas ofertas, > 0 = aceita compra imediata)';

-- Exemplos de uso:
-- 1. NFT só aceita ofertas: price = 1.0 ETH (base), buy_now_price = NULL
-- 2. NFT aceita ofertas OU compra imediata: price = 1.0, buy_now_price = 1.8 (compra direta)
-- 3. NFT só vende direto: price = 1.8, buy_now_price = 1.8 (mesmo valor)
