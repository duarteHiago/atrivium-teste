-- Active: 1761325149874@@127.0.0.1@5433@atrivium-database
-- Active: 1741488527156@@Localhost@3306
-- Criação da tabela de usuários (users)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Habilita a geração de UUIDs

CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Chave primária UUID gerada automaticamente
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL, -- CPF único (formato XXX.XXX.XXX-XX)
    birth_date DATE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL, -- Email único
    password_hash VARCHAR(255) NOT NULL, -- Armazena o hash da senha, NUNCA a senha pura
    cep VARCHAR(9), -- CEP (formato XXXXX-XXX)
    address TEXT,
    gender VARCHAR(10), -- 'female', 'male'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Data de criação
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Data da última atualização
);

-- (Opcional) Trigger para atualizar 'updated_at' automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at BEFORE UPDATE
    ON users FOR EACH ROW EXECUTE FUNCTION
    update_updated_at_column();

-- Adicionar índices para otimizar buscas por email e cpf
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf);
