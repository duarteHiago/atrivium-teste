-- ATENÇÃO: Este script tem problemas conhecidos
-- NÃO EXECUTE este script até que seja corrigido

-- PROBLEMA:
-- O trigger encrypt_sensitive_data_trigger tenta definir NEW.cpf = NULL
-- após criptografar, mas a coluna cpf tem constraint NOT NULL,
-- causando erro ao tentar inserir usuários.

-- SOLUÇÕES POSSÍVEIS:
-- 1. Remover constraint NOT NULL do CPF e usar apenas encrypted_cpf
-- 2. Não remover o CPF do registro (manter ambos cpf e encrypted_cpf)
-- 3. Usar uma abordagem diferente onde a criptografia é feita na aplicação

-- TEMPORARIAMENTE DESABILITADO:
-- Para habilitar o cadastro de usuários, o trigger foi removido com:
-- DROP TRIGGER IF EXISTS encrypt_sensitive_data_trigger ON users;

-- A implementação de criptografia precisa ser revisada antes de reativar.
