-- Tabela para sistema de favoritos/likes de NFTs
CREATE TABLE IF NOT EXISTS nft_favorites (
  favorite_id SERIAL PRIMARY KEY,
  nft_id INTEGER NOT NULL REFERENCES nfts(nft_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Garante que um usuário só pode favoritar um NFT uma vez
  UNIQUE(nft_id, user_id)
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_favorites_nft ON nft_favorites(nft_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON nft_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created ON nft_favorites(created_at);

-- Função para calcular valor sugerido baseado em favoritos
-- Fórmula: Valor Base + ((favoritos / 5) * 0.08 * Valor Base)
-- Exemplo: 10 favoritos em NFT de 1 ETH = 1 + (10/5 * 0.08 * 1) = 1.16 ETH (+16%)
CREATE OR REPLACE FUNCTION calculate_reputation_bonus(base_price NUMERIC, favorites_count INTEGER)
RETURNS NUMERIC AS $$
BEGIN
  IF base_price IS NULL OR base_price = 0 THEN
    RETURN 0;
  END IF;
  
  -- Bônus = (favoritos / 5) * 8% * Valor Base
  RETURN ROUND((favorites_count::NUMERIC / 5.0) * 0.08 * base_price, 4);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Exemplo de uso:
-- SELECT 
--   name,
--   price as base_price,
--   favorites_count,
--   calculate_reputation_bonus(price, favorites_count) as bonus,
--   price + calculate_reputation_bonus(price, favorites_count) as suggested_price
-- FROM nfts;
