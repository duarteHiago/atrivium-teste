-- Tabela de histórico de transações (vendas, compras, transferências)
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    to_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    nft_id UUID REFERENCES nfts(nft_id) ON DELETE SET NULL,
    amount_eth DECIMAL(18, 8) NOT NULL DEFAULT 0,
    transaction_type VARCHAR(50) NOT NULL, -- 'nft_sale', 'nft_purchase', 'transfer', 'deposit', 'withdrawal'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_transactions_from_user ON transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_to_user ON transactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_nft ON transactions(nft_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(created_at DESC);

-- Comentários
COMMENT ON TABLE transactions IS 'Histórico completo de transações do sistema';
COMMENT ON COLUMN transactions.transaction_type IS 'Tipos: nft_sale, nft_purchase, transfer, deposit, withdrawal';
COMMENT ON COLUMN transactions.amount_eth IS 'Valor da transação em ETH';
