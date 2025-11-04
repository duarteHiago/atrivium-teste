-- Adiciona a coluna role na tabela users se não existir
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Atualiza usuários existentes para terem role 'user'
UPDATE users SET role = 'user' WHERE role IS NULL;
