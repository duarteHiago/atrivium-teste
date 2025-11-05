# Correção do Erro de Cadastro de Usuário

## Problema Identificado
O erro 500 (Internal Server Error) ao cadastrar usuário ocorria devido a:
1. A coluna `role` não existia na tabela `users`
2. Campos opcionais (cep, address, gender) não estavam sendo tratados como nullable
3. **PRINCIPAL**: O trigger `encrypt_sensitive_data_trigger` estava tentando criptografar CPF e definir como NULL, mas a coluna CPF é NOT NULL, causando erro de constraint

## Alterações Realizadas

### 1. BackEnd/server.js
- Atualizado o RETURNING do INSERT para incluir `first_name`, `last_name` e `role`
- Campos opcionais agora são convertidos para `null` quando vazios

### 2. DataBase/SQL/01-user.sql
- Adicionada coluna `role VARCHAR(20) DEFAULT 'user'` na tabela users

### 3. DataBase/SQL/06-add-user-role.sql (NOVO)
- Script de migração para adicionar a coluna role em bancos existentes

### 4. Remoção do Trigger Problemático
- Removido o trigger `encrypt_sensitive_data_trigger` que causava conflito com a constraint NOT NULL do CPF
- O sistema atualmente não está usando criptografia no banco, apenas hashing de senha

## Como Aplicar a Correção

### Se o banco de dados já existe (Docker):

```bash
# 1. Adicionar coluna role (se não existir)
docker exec -i atrivium-postgres psql -U admin -d atrivium-database -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';"

# 2. Remover trigger problemático
docker exec -i atrivium-postgres psql -U admin -d atrivium-database -c "DROP TRIGGER IF EXISTS encrypt_sensitive_data_trigger ON users;"

# 3. Reiniciar backend para aplicar mudanças no código
docker restart atrivium-backend
```

### Se for criar o banco do zero:
O script 01-user.sql já está atualizado com a coluna role. Lembre-se de NÃO executar o script 04-encrypt-sensitive-data.sql até que a implementação de criptografia seja corrigida.

## Testando

1. Inicie o backend:
```bash
cd BackEnd
npm start
```

2. Teste o cadastro de usuário com todos os campos
3. Teste o cadastro de usuário com campos opcionais vazios (cep, address, gender)

## Campos Obrigatórios
- firstName
- lastName
- cpf
- birthDate
- email
- password

## Campos Opcionais
- cep
- address
- gender

## Resposta de Sucesso
```json
{
  "message": "Usuário cadastrado com sucesso!",
  "user": {
    "user_id": "uuid-gerado",
    "email": "email@exemplo.com",
    "first_name": "Nome",
    "last_name": "Sobrenome",
    "role": "user"
  }
}
```
