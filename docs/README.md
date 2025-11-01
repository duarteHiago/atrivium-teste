# Documentação — Atrivium

Bem-vindo ao diretório de documentação. Aqui você encontra guias práticos, histórico de mudanças e instruções de operação sobre as principais integrações e fluxos do projeto.

> Última atualização: 01/11/2025

---

## Índice
- IPFS/Pinata: `docs/IPFS-INTEGRATION.md`
- Histórico de mudanças (detalhado): `docs/CHANGELOG.md`
- Setup Docker e segredos: `docs/SETUP-DOCKER-SECRETS.md` e `docs/SETUP-RAPIDO.md`

---

## Visão Geral
- Integração robusta com IPFS via Pinata (upload por buffer com detecção de content-type e fallback por arquivo temporário).
- Fluxo de geração com Leonardo aprimorado: headers corretos, retry por limite de prompt e salvamento em DB com `ipfs_hash`/`network`.
- Front-end resiliente com fallback de múltiplos gateways para exibir imagens (Gallery e Discover).
- Endpoints operacionais para diagnosticar e recuperar itens legados: `pin-from-url`, `backfill-nfts`, `pin-nft/:id`.

---

## Endpoints Operacionais
- POST `/api/ipfs/backfill-nfts` — pin em lote de NFTs sem `ipfs_hash` (parâmetros: `limit`, `dryRun`, `onlyLocal`).
- POST `/api/ipfs/pin-nft/:id` — pin individual por `nft_id` ou `token_id` (parâmetro: `force`).
- POST `/api/ipfs/pin-from-url` — pin de uma URL arbitrária (opção `useLeonardoAuth`).

Mais detalhes e exemplos de uso em `docs/CHANGELOG.md` e `docs/IPFS-INTEGRATION.md`.

---

## Variáveis de Ambiente
- Pinata: `PINATA_API_KEY`, `PINATA_SECRET_API_KEY` (ou `PINATA_JWT`).
- Leonardo: `LEONARDO_API_KEY`.
- Front-end (opcional): `VITE_PINATA_SUBDOMAIN` para priorizar subdomínio do Pinata.

---

## Próximos Passos (sugestões)
- Proteger endpoints operacionais com escopo/admin simples (header secreto ou role JWT).
- Unificar shape de resposta entre `/api/leonardo/list` e `/api/nft/list`.
- Badge visual “IPFS” no card quando `network === 'ipfs'`.
