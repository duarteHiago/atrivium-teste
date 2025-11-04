# Sistema de Ofertas e Compra Imediata (Buy Now)

## 📋 Resumo

Implementado sistema completo de ofertas/lances para NFTs com opção de compra imediata automática.

## 🎯 Features Implementadas

### 1. Sistema de Ofertas (Lances)
- Usuários podem fazer ofertas em NFTs à venda
- Ofertas têm validade configurável (em horas)
- Mensagem opcional na oferta
- Dono do NFT pode aceitar ou rejeitar ofertas
- Comprador pode cancelar oferta pendente
- Ofertas automaticamente rejeitadas quando uma é aceita

### 2. Compra Imediata (Buy Now Price)
- Donos podem configurar preço de compra imediata opcional
- Compra automática se alguém pagar o `buy_now_price`
- Não precisa aprovação do dono (venda instantânea)
- Pode coexistir com sistema de ofertas

### 3. Fluxos Suportados

**Cenário A: Apenas Ofertas**
```
price = 1.0 ETH (base)
buy_now_price = NULL
→ Aceita ofertas, dono aprova/rejeita
```

**Cenário B: Ofertas + Compra Imediata**
```
price = 1.0 ETH (base para ofertas)
buy_now_price = 1.8 ETH
→ Aceita ofertas OU compra direta por 1.8 ETH (automática)
```

**Cenário C: Só Compra Direta**
```
price = 1.8 ETH
buy_now_price = 1.8 ETH
→ Só vende por compra direta
```

## 🗄️ Banco de Dados

### Nova Tabela: `nft_offers`
```sql
CREATE TABLE nft_offers (
    offer_id SERIAL PRIMARY KEY,
    nft_id INTEGER REFERENCES nfts(nft_id),
    buyer_id UUID REFERENCES users(user_id),
    amount_eth DECIMAL(18, 8) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending/accepted/rejected/expired/cancelled
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    accepted_at TIMESTAMP,
    rejected_at TIMESTAMP
);
```

### Nova Coluna em `nfts`
```sql
ALTER TABLE nfts 
ADD COLUMN buy_now_price DECIMAL(18, 8);
```

## 🔌 API Endpoints

### Ofertas

#### POST `/api/nft/:nftId/offers`
Criar oferta para um NFT
```json
{
  "amount": 1.5,
  "message": "Adoro este NFT!",
  "expiresInHours": 24
}
```

#### GET `/api/nft/:nftId/offers`
Listar ofertas de um NFT
- Retorna todas as ofertas se for dono
- Retorna apenas pendentes + próprias se não for dono

#### PATCH `/api/offers/:offerId/accept`
Aceitar oferta (apenas dono)
- Transfere ETH e propriedade
- Rejeita outras ofertas pendentes automaticamente

#### PATCH `/api/offers/:offerId/reject`
Rejeitar oferta (apenas dono)

#### DELETE `/api/offers/:offerId`
Cancelar oferta (apenas comprador)

### Compra

#### POST `/api/nft/:nftId/purchase`
Comprar NFT
- Prioriza `buy_now_price` se disponível
- Senão usa `price` (se compra direta habilitada)
- Retorna erro se só aceita ofertas

#### PATCH `/api/nft/:nftId/price`
Atualizar preços do NFT
```json
{
  "price": 1.0,
  "buy_now_price": 1.8,
  "status": "for_sale"
}
```

## 🎨 Frontend

### Componentes Criados

#### `NftOffers.jsx`
- Lista ofertas pendentes e históricas
- Botão "Fazer Oferta" para compradores
- Botões "Aceitar" / "Rejeitar" para donos
- Modal com formulário de oferta (valor, mensagem, validade)

### Modificações em `NftDetail.jsx`
- Botão "⚡ Compra Imediata" (verde) se `buy_now_price` configurado
- Botão "💎 Fazer Oferta" se apenas ofertas
- Modal de listagem expandido:
  - Campo "Preço Base" (para ofertas)
  - Campo "Compra Imediata" (opcional)
  - Validação: buy_now > price base

## 🔒 Segurança

1. **Validação de Saldo**: Verifica ETH antes de criar oferta ou comprar
2. **Lock de Transações**: Usa `BEGIN...COMMIT` com locks para evitar race conditions
3. **Permissões**: Apenas dono aceita/rejeita; apenas comprador cancela própria oferta
4. **Expiração**: Ofertas podem ter validade (evita ofertas eternas)
5. **Rejeição Automática**: Outras ofertas rejeitadas ao aceitar uma

## 📝 Migration

### Aplicar no Banco
```powershell
$env:PGPASSWORD="SUA_SENHA"; & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -p 5432 -U postgres -d atrivium-database -f "DataBase\SQL\09-create-offers-system.sql"
```

### Testar Backend
```bash
npm run dev
```

### Testar Frontend
```bash
cd FrontEnd
npm run dev
```

## 🧪 Teste Manual

1. **Criar Oferta**:
   - Logar como User A
   - Acessar NFT de User B (à venda)
   - Clicar "Fazer Oferta"
   - Preencher valor e mensagem
   - Confirmar

2. **Aceitar Oferta**:
   - Logar como User B (dono)
   - Ver ofertas no NFT
   - Clicar "Aceitar" na oferta desejada
   - Verificar saldo e propriedade transferidos

3. **Compra Imediata**:
   - User B lista NFT com `buy_now_price`
   - User A vê botão verde "⚡ Compra Imediata"
   - Clica e confirma
   - Venda automática (sem aprovação)

## 💡 Próximas Melhorias

- [ ] Notificações em tempo real quando recebe oferta
- [ ] Dashboard com todas as ofertas do usuário (enviadas/recebidas)
- [ ] Histórico completo de ofertas aceitas/rejeitadas
- [ ] Ofertas em lote (múltiplos NFTs da mesma coleção)
- [ ] Job para expirar ofertas antigas automaticamente
- [ ] Analytics: ofertas médias por NFT/coleção

## 📦 Arquivos Modificados

### Backend
- `DataBase/SQL/09-create-offers-system.sql` ⭐ NOVO
- `BackEnd/src/routes/nft.routes.js` ✏️ MODIFICADO
  - +7 novos endpoints de ofertas
  - Refatorado `/purchase` para suportar buy_now_price
  - Atualizado `/price` para aceitar buy_now_price

### Frontend
- `FrontEnd/src/Components/NftOffers/NftOffers.jsx` ⭐ NOVO
- `FrontEnd/src/Components/NftDetail/NftDetail.jsx` ✏️ MODIFICADO
  - Integrado componente NftOffers
  - Botões dinâmicos (Compra Imediata vs Fazer Oferta)
  - Modal de listagem com campo buy_now_price

---

**Data**: 3 de novembro de 2025  
**Feature**: Sistema de Ofertas + Compra Imediata  
**Status**: ✅ Completo e testável
