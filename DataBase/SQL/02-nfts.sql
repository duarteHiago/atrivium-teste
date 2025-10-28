-- NFTs table for the platform
-- Stores off-chain tokenization info
-- Prepared for future blockchain integration

CREATE TABLE IF NOT EXISTS nfts (
    -- Unique identifiers
    nft_id SERIAL PRIMARY KEY,
    token_id VARCHAR(255) UNIQUE NOT NULL, -- UUID gerado pelo sistema
    
    -- NFT information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    prompt TEXT, -- Prompt used to generate the image
    style VARCHAR(50), -- AI style used
    
    -- Tokenization and verification
    image_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 of the image
    certificate_hash VARCHAR(64) UNIQUE NOT NULL, -- Hash of the digital certificate
    image_url VARCHAR(500) NOT NULL, -- Stored image URL
    
    -- Metadata (ERC-721 compatible JSON)
    metadata JSONB,
    
    -- Ownership (relates to users)
    -- users.user_id is UUID, so FKs must be UUID too
    creator_id UUID REFERENCES users(user_id),
    current_owner_id UUID REFERENCES users(user_id),
    
    -- Blockchain (future integration)
    contract_address VARCHAR(42), -- Contract address (null for now)
    token_id_blockchain VARCHAR(100), -- Token ID on blockchain
    network VARCHAR(50) DEFAULT 'off-chain', -- 'polygon', 'ethereum', etc.
    transaction_hash VARCHAR(66), -- Mint transaction hash
    block_number BIGINT, -- Block number
    
    -- Status
    status VARCHAR(50) DEFAULT 'created', -- created, minted, listed, sold
    is_verified BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    minted_at TIMESTAMP, -- Quando for mintado na blockchain
    
    -- Indexes for better performance
    CONSTRAINT unique_image_hash UNIQUE (image_hash)
);

-- Additional indexes
CREATE INDEX IF NOT EXISTS idx_nfts_token_id ON nfts(token_id);
CREATE INDEX IF NOT EXISTS idx_nfts_creator ON nfts(creator_id);
CREATE INDEX IF NOT EXISTS idx_nfts_owner ON nfts(current_owner_id);
CREATE INDEX IF NOT EXISTS idx_nfts_status ON nfts(status);
CREATE INDEX IF NOT EXISTS idx_nfts_created_at ON nfts(created_at DESC);

-- Transfer history table (ownership tracking)
CREATE TABLE IF NOT EXISTS nft_transfers (
    transfer_id SERIAL PRIMARY KEY,
    nft_id INTEGER REFERENCES nfts(nft_id) ON DELETE CASCADE,
    -- users.user_id é UUID, ajustar tipos dos FKs
    from_user_id UUID REFERENCES users(user_id),
    to_user_id UUID REFERENCES users(user_id),
    transfer_type VARCHAR(50), -- 'mint', 'transfer', 'sale'
    price DECIMAL(18, 8), -- Transaction price (if any)
    transaction_hash VARCHAR(66), -- Blockchain transaction hash (future)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transfers_nft ON nft_transfers(nft_id);
CREATE INDEX IF NOT EXISTS idx_transfers_from ON nft_transfers(from_user_id);
CREATE INDEX IF NOT EXISTS idx_transfers_to ON nft_transfers(to_user_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at
CREATE TRIGGER update_nfts_updated_at BEFORE UPDATE ON nfts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table comments (ASCII only to avoid Windows encoding issues)
COMMENT ON TABLE nfts IS 'Stores NFTs created on the platform with off-chain tokenization; blockchain-ready';
COMMENT ON COLUMN nfts.token_id IS 'System-generated unique UUID (main identifier)';
COMMENT ON COLUMN nfts.image_hash IS 'SHA-256 hash of the image to ensure uniqueness';
COMMENT ON COLUMN nfts.certificate_hash IS 'Full digital certificate hash';
COMMENT ON COLUMN nfts.metadata IS 'ERC-721 style metadata (JSON)';
COMMENT ON COLUMN nfts.network IS 'Blockchain network (off-chain, polygon, ethereum, etc.)';
