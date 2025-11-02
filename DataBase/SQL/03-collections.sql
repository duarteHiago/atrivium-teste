-- Tabela de Coleções de NFTs
CREATE TABLE IF NOT EXISTS collections (
    collection_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    banner_image TEXT, -- URL da imagem de banner da coleção
    creator_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    floor_price DECIMAL(18, 8) DEFAULT 0,
    total_volume DECIMAL(18, 8) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_featured BOOLEAN DEFAULT FALSE, -- Se é coleção em destaque
    UNIQUE(name)
);

-- Adicionar coluna collection_id na tabela nfts
ALTER TABLE nfts ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES collections(collection_id) ON DELETE SET NULL;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_nfts_collection ON nfts(collection_id);
CREATE INDEX IF NOT EXISTS idx_collections_creator ON collections(creator_id);
CREATE INDEX IF NOT EXISTS idx_collections_featured ON collections(is_featured);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_collections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_collections_updated_at
    BEFORE UPDATE ON collections
    FOR EACH ROW
    EXECUTE FUNCTION update_collections_updated_at();
