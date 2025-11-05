-- Add price column to nfts table
-- This allows NFTs to have a listed price for sale

ALTER TABLE nfts 
ADD COLUMN IF NOT EXISTS price DECIMAL(18, 8);

-- Add index for price queries
CREATE INDEX IF NOT EXISTS idx_nfts_price ON nfts(price) WHERE price IS NOT NULL;

-- Comment
COMMENT ON COLUMN nfts.price IS 'Current listing price in ETH (null if not for sale)';
