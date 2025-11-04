-- Adiciona suporte para criptografia
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Altera a tabela users para incluir campos criptografados
ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS encrypted_cpf bytea,
    ADD COLUMN IF NOT EXISTS encrypted_address bytea,
    ADD COLUMN IF NOT EXISTS encrypted_phone bytea;

-- Remove constraints NOT NULL dos campos que serão criptografados
ALTER TABLE users ALTER COLUMN cpf DROP NOT NULL;
ALTER TABLE users ALTER COLUMN address DROP NOT NULL;

-- Função para criptografar dados usando AES-256
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data text, key text)
RETURNS bytea AS $$
BEGIN
    RETURN pgp_sym_encrypt(data, key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para descriptografar dados
CREATE OR REPLACE FUNCTION decrypt_sensitive_data(encrypted_data bytea, key text)
RETURNS text AS $$
BEGIN
    RETURN pgp_sym_decrypt(encrypted_data, key);
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL; -- Retorna NULL em caso de erro de descriptografia
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criptografar dados antes de inserir/atualizar
CREATE OR REPLACE FUNCTION encrypt_sensitive_data_trigger()
RETURNS TRIGGER AS $$
DECLARE 
    encryption_key text;
BEGIN
    -- Usa uma chave fixa para desenvolvimento (DEVE SER ALTERADA EM PRODUÇÃO via configuração)
    encryption_key := 'dev_encryption_key_32_bytes_change_prod';
    
    -- Tenta pegar a chave das configurações customizadas, se não existir usa a padrão
    BEGIN
        SELECT current_setting('app.encryption_key', true) INTO encryption_key;
        IF encryption_key IS NULL OR encryption_key = '' THEN
            encryption_key := 'dev_encryption_key_32_bytes_change_prod';
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            encryption_key := 'dev_encryption_key_32_bytes_change_prod';
    END;
    
    -- Criptografa CPF
    IF NEW.cpf IS NOT NULL THEN
        NEW.encrypted_cpf = encrypt_sensitive_data(NEW.cpf, encryption_key);
        NEW.cpf = NULL; -- Remove o CPF em texto plano
    END IF;

    -- Criptografa endereço
    IF NEW.address IS NOT NULL THEN
        NEW.encrypted_address = encrypt_sensitive_data(NEW.address, encryption_key);
        NEW.address = NULL; -- Remove o endereço em texto plano
    END IF;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao criptografar dados sensíveis: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger
CREATE TRIGGER encrypt_sensitive_data_trigger
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION encrypt_sensitive_data_trigger();

-- Criar view segura para acesso aos dados descriptografados
CREATE OR REPLACE VIEW user_safe_view AS
SELECT 
    user_id,
    first_name,
    last_name,
    email,
    decrypt_sensitive_data(encrypted_cpf, current_setting('app.encryption_key')) as cpf,
    decrypt_sensitive_data(encrypted_address, current_setting('app.encryption_key')) as address,
    decrypt_sensitive_data(encrypted_phone, current_setting('app.encryption_key')) as phone,
    birth_date,
    created_at,
    updated_at
FROM users;

-- Revogar acesso direto à tabela users e conceder acesso à view
REVOKE SELECT, INSERT, UPDATE ON users FROM public;
GRANT SELECT ON user_safe_view TO public;