-- Migration: Initial Schema for D1 (SQLite)
-- Adapatado do schema PostgreSQL para SQLite

-- ==========================================
-- TABELA: users
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(6)))),
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    cpf TEXT,
    birth_date TEXT,
    cep TEXT,
    address TEXT,
    gender TEXT,
    role TEXT DEFAULT 'user' NOT NULL,
    nickname TEXT,
    bio TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ==========================================
-- TABELA: collections
-- ==========================================
CREATE TABLE IF NOT EXISTS collections (
    collection_id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(6)))),
    name TEXT NOT NULL,
    description TEXT,
    banner_image TEXT,
    cover_image_url TEXT,
    slug TEXT,
    floor_price REAL DEFAULT 0,
    total_volume REAL DEFAULT 0,
    is_featured INTEGER DEFAULT 0,
    featured_order INTEGER,
    creator_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_featured ON collections(is_featured);
CREATE INDEX IF NOT EXISTS idx_collections_creator ON collections(creator_id);

-- ==========================================
-- TABELA: nfts
-- ==========================================
CREATE TABLE IF NOT EXISTS nfts (
    nft_id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(6)))),
    token_id INTEGER,
    name TEXT,
    description TEXT,
    image_url TEXT,
    prompt TEXT,
    style TEXT,
    status TEXT DEFAULT 'draft',
    price REAL,
    buy_now_price REAL,
    creator_id TEXT,
    current_owner_id TEXT,
    collection_id TEXT,
    ipfs_hash TEXT,
    network TEXT DEFAULT 'off-chain',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (current_owner_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (collection_id) REFERENCES collections(collection_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_nfts_creator ON nfts(creator_id);
CREATE INDEX IF NOT EXISTS idx_nfts_owner ON nfts(current_owner_id);
CREATE INDEX IF NOT EXISTS idx_nfts_collection ON nfts(collection_id);
CREATE INDEX IF NOT EXISTS idx_nfts_status ON nfts(status);
CREATE INDEX IF NOT EXISTS idx_nfts_ipfs ON nfts(ipfs_hash);
CREATE INDEX IF NOT EXISTS idx_nfts_created ON nfts(created_at);

-- ==========================================
-- TABELA: transactions
-- ==========================================
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(6)))),
    transaction_type TEXT NOT NULL,
    from_user_id TEXT,
    to_user_id TEXT,
    nft_id TEXT,
    amount_eth REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (to_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (nft_id) REFERENCES nfts(nft_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_transactions_from ON transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_to ON transactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_nft ON transactions(nft_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);

-- ==========================================
-- TABELA: nft_favorites
-- ==========================================
CREATE TABLE IF NOT EXISTS nft_favorites (
    favorite_id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(6)))),
    user_id TEXT NOT NULL,
    nft_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (nft_id) REFERENCES nfts(nft_id) ON DELETE CASCADE,
    UNIQUE(user_id, nft_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON nft_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_nft ON nft_favorites(nft_id);

-- ==========================================
-- TABELA: wallets
-- ==========================================
CREATE TABLE IF NOT EXISTS wallets (
    wallet_id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(6)))),
    user_id TEXT UNIQUE NOT NULL,
    balance_eth REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);

-- ==========================================
-- TABELA: offers
-- ==========================================
CREATE TABLE IF NOT EXISTS offers (
    offer_id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(2)) || '-' || hex(randomblob(6)))),
    nft_id TEXT NOT NULL,
    from_user_id TEXT NOT NULL,
    amount_eth REAL NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending',
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nft_id) REFERENCES nfts(nft_id) ON DELETE CASCADE,
    FOREIGN KEY (from_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_offers_nft ON offers(nft_id);
CREATE INDEX IF NOT EXISTS idx_offers_from ON offers(from_user_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);

-- ==========================================
-- TABELA: _health (já existe, mas garante)
-- ==========================================
CREATE TABLE IF NOT EXISTS _health (
    k TEXT PRIMARY KEY,
    v TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
