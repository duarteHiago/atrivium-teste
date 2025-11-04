-- Tabela de carteiras dos usuários
CREATE TABLE IF NOT EXISTS wallets (
    wallet_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    balance_eth DECIMAL(18, 8) DEFAULT 0.00000000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Tabela de transações (histórico)
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id SERIAL PRIMARY KEY,
    from_user_id UUID,
    to_user_id UUID,
    amount_eth DECIMAL(18, 8) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'admin_deposit', 'nft_purchase', 'nft_sale', 'transfer'
    nft_id INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transaction_from FOREIGN KEY (from_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_transaction_to FOREIGN KEY (to_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_transaction_nft FOREIGN KEY (nft_id) REFERENCES nfts(nft_id) ON DELETE SET NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_from ON transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_to ON transactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_nft ON transactions(nft_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_wallet_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_wallet_timestamp
BEFORE UPDATE ON wallets
FOR EACH ROW
EXECUTE FUNCTION update_wallet_timestamp();

-- Criar carteiras para usuários existentes (iniciar com 0 ETH)
INSERT INTO wallets (user_id, balance_eth)
SELECT user_id, 0.00000000
FROM users
WHERE user_id NOT IN (SELECT user_id FROM wallets)
ON CONFLICT (user_id) DO NOTHING;

COMMENT ON TABLE wallets IS 'Carteiras virtuais dos usuários com saldo em ETH';
COMMENT ON TABLE transactions IS 'Histórico de todas as transações (depósitos, compras, vendas)';
COMMENT ON COLUMN transactions.transaction_type IS 'Tipos: admin_deposit, nft_purchase, nft_sale, transfer';
