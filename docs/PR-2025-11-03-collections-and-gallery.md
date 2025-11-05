# PR: Coleção clicável no NFT, Galeria por posse e imutabilidade de coleções

## Resumo
Este PR entrega melhorias de usabilidade e regras de negócio alinhadas ao pedido:
- Exibir a coleção do NFT de forma clara e clicável (selo no topo e card em “Propriedades”).
- Galeria passa a listar apenas NFTs que o usuário possui atualmente (não inclui os já vendidos).
- Coleções tornam-se imutáveis após a criação do NFT (sem alterar/remover via UI e API bloqueada).

## Changes principais

### Frontend
- NftDetail (`FrontEnd/src/Components/NftDetail/NftDetail.jsx`)
  - Selo de coleção acima do título agora é clicável e navega para `/collections/:id`.
  - Em “✨ Propriedades”, o card “Coleção” exibe o nome da coleção e é clicável (card inteiro). 
  - Nome da coleção com reticências quando muito longo (ellipsis) e title com nome completo.
  - Seção “Propriedades” agora renderiza também quando só há coleção/prompt/IPFS (não apenas `style`).

- NftGallery (`FrontEnd/src/Components/NftGallery/NftGallery.jsx`)
  - Busca alterada para usar `GET /api/users/me/gallery` (autenticado) e listar somente NFTs que o usuário possui (`current_owner_id`).
  - UI de atribuição/alteração/remoção de coleção removida (coleção é imutável após criação).
    - Removidos: dropdown, botões de “Alterar/Remover/Adicionar à coleção”, modal de atribuição e estados relacionados.
  - Adicionado selo de coleção somente leitura no card, quando existir.
  - Mensagens ajustadas: subtítulo “NFTs que você possui” e estado vazio “Você ainda não possui nenhum NFT”.
  - Limpeza: remoção de toasts e styled-components não utilizados.

- App Router (`FrontEnd/src/App.jsx`)
  - Rota de coleção já existente: `/collections/:id` (usada pelos cliques acima).

### Backend
- NFTs / detalhe e listagem (`BackEnd/src/routes/leonardo.routes.js`)
  - GET `/api/leonardo/:nftId`: inclui `collection_name` via `LEFT JOIN collections c ON n.collection_id = c.collection_id`.
  - GET `/api/leonardo/list`: inclui `collection_name` para consistência em listagens.

- Galeria do usuário (`BackEnd/server.js`)
  - GET `/api/users/me/gallery`: retorna apenas NFTs cujo `current_owner_id = userId`.

- Imutabilidade de coleção
  - PATCH `/api/leonardo/:nftId/collection`: desabilitado, agora retorna 403 com mensagem de regra de negócio (“coleção só no momento da criação”).

### Popularidade e favoritos
- Frontend
  - NftDetail usa `<FavoriteButton>` com `initialCount` e `initialIsFavorited` para refletir curtidas atuais do usuário e total.
  - Badge “Trending” dinâmico: consome `GET /api/nft/:id/popularity` e exibe nível (🔥 Aquecendo, ⭐ Popular, 💎 Trending, 👑 Lendário) com base em janelas curtas de curtidas recentes.
  - Em várias telas (Galeria, Perfis), o contador de favoritos aparece junto aos cards (quando > 0).
- Backend (`BackEnd/src/routes/nft.routes.js`)
  - GET `/api/nft/:nftId/popularity`: calcula janelas de curtidas (5, 10, 15, 20 minutos) e total; determina nível se bater metas recentes.
  - GET `/api/nft/:nftId/history/favorites` (quando usado): séries diárias acumuladas (últimos 14 dias) para gráficos de crescimento.

### Precificação sugerida
- Frontend
  - NftDetail e Marketplace consultam `GET /api/nft/:id/suggested-price` para exibir/preencher preço sugerido.
  - Quando o preço sugerido supera o preço base, um destaque visual indica “bônus” (hasBonus).
- Backend (`BackEnd/src/routes/nft.routes.js`)
  - GET `/api/nft/:nftId/suggested-price` combina fatores:
    - Âncora: preço do próprio NFT (se > 0) ou floor price da coleção (quando listado) — fallback 0.1 ETH.
    - Popularidade: +3% por favorito nas últimas 24h (cap 40%).
    - Crescimento: variação 24h vs 24–48h (clamp −20% a +40%).
    - Reputação do criador: +4% a cada 20 favs em 14 dias (cap 24%).
  - Retorna também breakdown com `baseAnchor`, `floorPrice`, `fav_24h`, `growthPercent`, `reputationFactor`, etc.

#### Lógica de preço (base + fator de favoritos)
- Preço base: é o preço definido pelo dono no momento de listar o NFT (campo `price`). O dono pode optar por usar o preço sugerido como ponto de partida, mas o valor final listado é sempre uma escolha explícita do dono.
- Preço sugerido (dinâmico): calculado pela API somando fatores de popularidade recente e reputação ao preço âncora. Ele NÃO altera automaticamente o preço listado; serve como recomendação em tempo real para apoiar a decisão do dono.
- Exibição no front:
  - NftDetail usa `displayPrice = suggestedPrice || price` — quando o sugerido está disponível, ele é exibido como referência (com indicador de bônus quando maior que o base).
  - O botão no modal de listagem permite “preencher” o campo com o sugerido, mas o envio/confirmar é do usuário.
- Fórmula (simplificada):
  - `suggested = baseAnchor * popularityFactor * growthFactor * reputationFactor`
  - Onde:
    - `baseAnchor = price_definido_pelo_dono (>0) || floor_price_da_colecao || 0.1`
    - `popularityFactor = 1 + min(0.40, fav_24h * 0.03)`
    - `growthFactor = 1 + clamp((growthPercent/100), -0.20, 0.40)`
    - `reputationFactor = 1 + min(0.24, (creatorFav14d/20) * 0.04)`
  - Resultado arredondado para 3 casas: `max(0.01, round(suggested, 3))`
- Dinâmica: conforme o número de favoritos recentes muda, o endpoint de preço sugerido retorna um novo valor. O preço listado só muda se o dono relistar/atualizar aceitando o novo sugerido.

## Motivações e regras de negócio
- “Galeria somente por posse”: usuários não devem ver na galeria NFTs que já venderam.
- “Coleções imutáveis”: um NFT pertence a uma única coleção, definida no momento da criação, sem alteração posterior.
- “Descoberta de coleções”: facilitar que o usuário encontre a página da coleção a partir do NFT (selo e propriedades clicáveis).

## Como testar
1) Pré-requisitos
   - Backend rodando (Docker ou local) e frontend no ar.
   - Usuário autenticado (token no `localStorage`).

2) Galeria por posse
   - Acesse `/gallery` autenticado.
   - Verifique que aparecem apenas NFTs com `current_owner_id` igual ao seu usuário.
   - Verifique que o subtítulo diz “NFTs que você possui” e que o estado vazio está atualizado.

3) NFT Detail – Coleção clicável
   - Abra um NFT que tenha `collection_id` em `/nft/:id`.
   - No topo (abaixo da imagem), clique no selo “🎨 Coleção” e confirme que navega para `/collections/:id`.
   - Em “✨ Propriedades”, verifique o card “Coleção”: 
     - O nome aparece; se muito longo, é truncado com “...”.
     - Clique no card e confirme que navega para `/collections/:id`.

4) Imutabilidade de coleção
   - Na Galeria, confirme que não existem botões de “Adicionar/Alterar/Remover coleção”.
   - (Opcional) Tente chamar manualmente PATCH `/api/leonardo/:id/collection` e espere HTTP 403.

5) Popularidade e favoritos
  - No NftDetail, verifique o badge de popularidade aparecendo quando o endpoint retornar nível (🔥/⭐/💎/👑).
  - Curtidas recentes (ao favoritar/desfavoritar) devem refletir no contador e influenciar o nível após breve intervalo.

6) Preço sugerido
  - No NftDetail (modal de listagem) use o botão de “usar preço sugerido” e valide que o campo é preenchido.
  - No Marketplace, verifique que cards listados podem exibir preço sugerido quando disponível.

## Considerações de UX
- Ellipsis aplicado ao nome da coleção no card “Propriedades” (title mantém texto completo em hover).
- Selo de coleção no topo também é um atalho clicável.

## Impacto de API/DB
- Sem migrações de schema.
- Endpoints ajustados para incluir `collection_name` (JOIN em `collections`).
- Nova dependência de autenticação na galeria: requer Bearer Token.

## Checklist de QA
- [ ] Galeria lista somente NFTs do usuário (não inclui vendidos).
- [ ] Selo “Coleção” no topo do NftDetail navega corretamente para `/collections/:id`.
- [ ] Card “Coleção” em Propriedades navega corretamente para `/collections/:id`.
- [ ] Nome de coleção longo é truncado e exibe `title` completo no hover.
- [ ] Não há mais ações de alterar/remover/atribuir coleção na UI.
- [ ] PATCH `/api/leonardo/:id/collection` retorna 403.
- [ ] Sem regressões em marketplace, busca e favoritos.
- [ ] Badge de popularidade aparece conforme nível retornado pela API.
- [ ] Preço sugerido pode ser consultado e aplicado no NftDetail/Marketplace.
- [ ] “Bônus” aparece quando o sugerido > preço base; preço final listado permanece sob controle do dono.

## Qualidade (sessão)
- Build: PASS (sem mudanças em dependências).
- Lint/Typecheck: PASS para arquivos alterados.
- Testes: Não há testes automatizados novos; validação manual conforme “Como testar”.

## Observações e próximos passos
- Opcional: fallback no NftDetail para buscar `GET /api/collections/:id` quando `collection_name` não vier do backend (dados antigos); atualmente o backend já envia o nome, então é opcional.
- Considerar badges de coleção padronizados em outras telas (ex.: marketplace).

## Rollback
- Reverter alterações em:
  - `FrontEnd/src/Components/NftDetail/NftDetail.jsx`
  - `FrontEnd/src/Components/NftGallery/NftGallery.jsx`
  - `BackEnd/src/routes/leonardo.routes.js`
  - (opcional) `BackEnd/server.js` – endpoint da galeria
