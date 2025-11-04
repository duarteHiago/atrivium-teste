-- Adiciona suporte para IPFS nas tabelas de NFT
-- Executar após os scripts 01, 02 e 03

-- Adiciona coluna ipfs_hash na tabela nfts
ALTER TABLE nfts ADD COLUMN IF NOT EXISTS ipfs_hash VARCHAR(100);

-- Adiciona índice para busca por IPFS hash
CREATE INDEX IF NOT EXISTS idx_nfts_ipfs_hash ON nfts(ipfs_hash);

-- Comentários nas colunas
COMMENT ON COLUMN nfts.ipfs_hash IS 'Hash IPFS da imagem armazenada no Pinata';

-- Atualiza a coluna network para suportar 'ipfs'
-- (Se já existirem registros com 'off-chain', mantém. Novos podem ser 'ipfs')

COMMENT ON COLUMN nfts.network IS 'Rede: off-chain, ipfs, ethereum, polygon, etc';

-- Visualização de NFTs com informação IPFS
CREATE OR REPLACE VIEW v_nfts_with_ipfs AS
SELECT 
    n.nft_id,
    n.token_id,
    n.name,
    n.description,
    n.image_url,
    n.ipfs_hash,
    CASE 
        WHEN n.ipfs_hash IS NOT NULL THEN CONCAT('https://gateway.pinata.cloud/ipfs/', n.ipfs_hash)
        ELSE n.image_url
    END AS public_image_url,
    n.image_hash,
    n.network,
    n.status,
    n.created_at,
    u_creator.email AS creator_email,
    u_owner.email AS owner_email
FROM nfts n
LEFT JOIN users u_creator ON n.creator_id = u_creator.user_id
LEFT JOIN users u_owner ON n.current_owner_id = u_owner.user_id;

-- Adiciona coluna ipfs_hash na tabela collections (banners podem estar no IPFS)
ALTER TABLE collections ADD COLUMN IF NOT EXISTS banner_ipfs_hash VARCHAR(100);

COMMENT ON COLUMN collections.banner_ipfs_hash IS 'Hash IPFS do banner da coleção (se armazenado no IPFS)';

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '✅ Suporte IPFS adicionado com sucesso às tabelas!';
END $$;
