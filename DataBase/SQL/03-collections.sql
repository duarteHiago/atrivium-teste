-- Arquivo: DataBase/SQL/03-collections.sql
-- Sistema de Coleções do Atrivium

-- 1. Cria a tabela base 'collections' se não existir
CREATE TABLE IF NOT EXISTS collections (
    collection_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_image_url VARCHAR(500),
    cover_image_url VARCHAR(500),
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name)
);

-- 2. Adiciona novas colunas de forma segura
DO $$
BEGIN
    -- Adiciona coluna floor_price se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='collections' AND column_name='floor_price'
    ) THEN
        ALTER TABLE collections ADD COLUMN floor_price DECIMAL(18, 8) DEFAULT 0;
    END IF;

    -- Adiciona coluna total_volume se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='collections' AND column_name='total_volume'
    ) THEN
        ALTER TABLE collections ADD COLUMN total_volume DECIMAL(18, 8) DEFAULT 0;
    END IF;

    -- Adiciona coluna is_featured se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='collections' AND column_name='is_featured'
    ) THEN
        ALTER TABLE collections ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 2. Adiciona coluna collection_id na tabela nfts (com verificação segura)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='nfts' AND column_name='collection_id'
    ) THEN
        ALTER TABLE nfts 
        ADD COLUMN collection_id UUID REFERENCES collections(collection_id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Criação de índices para otimização
CREATE INDEX IF NOT EXISTS idx_nfts_collection ON nfts(collection_id);
CREATE INDEX IF NOT EXISTS idx_collections_creator ON collections(creator_id);
CREATE INDEX IF NOT EXISTS idx_collections_featured ON collections(is_featured);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);

-- 4. Trigger para atualização automática do updated_at
-- Reutiliza a função existente do 01-user.sql
CREATE TRIGGER update_collections_updated_at 
    BEFORE UPDATE ON collections
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Documentação
COMMENT ON TABLE collections IS 'Armazena coleções de NFTs criadas por usuários.';
COMMENT ON COLUMN collections.collection_id IS 'Identificador único da coleção';
COMMENT ON COLUMN collections.creator_id IS 'ID do usuário que criou a coleção';
COMMENT ON COLUMN collections.slug IS 'Identificador amigável para URLs (ex: meus-nfts)';
COMMENT ON COLUMN collections.floor_price IS 'Menor preço atual de NFT na coleção';
COMMENT ON COLUMN collections.total_volume IS 'Volume total de vendas da coleção';
COMMENT ON COLUMN collections.is_featured IS 'Indica se a coleção está em destaque';
COMMENT ON COLUMN collections.is_public IS 'Controla a visibilidade pública da coleção';
COMMENT ON COLUMN nfts.collection_id IS 'Referência à coleção à qual o NFT pertence';