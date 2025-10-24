# Projeto Artrivium — FrontEnd (React + Vite)

Este repositório contém o front-end do projeto Artrivium, criado com Vite + React. Este README traz instruções completas em português (pt-BR) para configurar, desenvolver e executar o projeto localmente, além de executar o banco Postgres via Docker para desenvolvimento.

## Sumário

- Visão geral
- Pré-requisitos
- Configuração rápida (desenvolvimento)
- Scripts disponíveis
- Banco de dados com Docker (Postgres)
- Variáveis/Configurações importantes
- Debugging e troubleshooting
- Build e deploy
- Contribuindo

---

## Visão geral

O front-end usa React (v19) com Vite (configurado para o runtime JSX automático) e styled-components para estilos. O projeto foi preparado para desenvolvimento local com HMR (hot-reload).

Estrutura principal (diretório `FrontEnd`):

- `src/` - código-fonte do React
- `public/` - assets públicos
- `package.json` - scripts e dependências
- `vite.config.js` - configuração do Vite

## Pré-requisitos

- Node.js (recomenda-se LTS). Baixe em https://nodejs.org/ ou instale com `winget` no Windows:

```powershell
winget install OpenJS.NodeJS.LTS -e
```

- npm (vem com Node.js) ou yarn/pnpm se preferir — os comandos abaixo usam `npm`.
- (Opcional) Docker Desktop, se quiser rodar o Postgres localmente com Docker.

## Configuração rápida (desenvolvimento)

1. Instale dependências do frontend:

```powershell
cd c:/project/atrivium-teste/FrontEnd
npm install
```

2. Inicie o servidor de desenvolvimento:

```powershell
npm run dev
```

3. Abra o endereço exibido pelo Vite (por padrão: http://localhost:5173).

Observações:
- Se o PowerShell bloquear a execução de scripts do `npm` (erro sobre `ExecutionPolicy`), você pode:
	- Reabrir o terminal como administrador e executar `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` para permitir scripts assinados/localmente.
	- Ou executar os comandos via CMD: `cmd /c "npm run dev"`.

## Scripts úteis (`package.json`)

- `npm run dev` — inicia o servidor de desenvolvimento (HMR)
- `npm run build` — gera a build de produção em `dist/`
- `npm run preview` — roda uma versão de preview da build
- `npm run lint` — executa linter (ESLint)

## Banco de dados com Docker (Postgres)

O repositório inclui um `docker-compose.yaml` que configura um container Postgres para desenvolvimento.

1. Verifique a configuração atual no arquivo `docker-compose.yaml` — por padrão neste projeto:

```yaml
services:
	postgres:
		image: 'postgres:16'
		environment:
			- 'POSTGRES_DB=atrivium'
			- 'POSTGRES_PASSWORD=devpassword'
			- 'POSTGRES_USER=admin'
		ports:
			- '5433:5432'
		restart: unless-stopped
		volumes:
			- './postgres-data:/var/lib/postgresql/data'
```

2. Subir o Postgres (com Docker Desktop em execução):

```powershell
cd c:/project/atrivium-teste
docker-compose up -d
```

3. Conectar-se ao banco: `localhost:5433`, usuário `admin`, senha `devpassword`, database `atrivium`.

Obs: o mapeamento `5433:5432` significa que o Postgres dentro do container escuta na porta 5432, e no seu host ele fica disponível na porta 5433.

## Variáveis e arquivos de configuração

- `docker-compose.yaml` — configura o Postgres para desenvolvimento local.
- `FrontEnd/.env` — (se existir) conterá variáveis de ambiente usadas pelo front-end. No estado atual do projeto, não há `.env` obrigatório; adicione se necessário.

## Debugging e troubleshooting

- Erro `React is not defined` ao abrir a aplicação no navegador:
	- Causa comum: remover `import React from 'react'` sem importar hooks usados via `React.useState`. A correção é usar `import { useState } from 'react'` ou manter o import default.
	- No projeto atual eu já corrigi esses casos.

- Problemas com `npm` no PowerShell (ExecutionPolicy):
	- Execute `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` no PowerShell (administrador) ou rode scripts via `cmd`.

- Docker:
	- Se o container não subir: verifique `docker-compose logs postgres` e se a pasta `postgres-data` tem permissões corretas.

## Build e deploy

- Para gerar a build de produção localmente:

```powershell
cd c:/project/atrivium-teste/FrontEnd
npm run build
```

- A saída ficará em `FrontEnd/dist/`. Você pode servir com um servidor estático ou usar `npm run preview` para testar localmente.

## Contribuindo

- Abra issues para problemas e PRs para mudanças. Siga estes passos:
	1. Fork do repositório
	2. Crie uma branch com uma descrição curta (`feature/ajuste-logo`, `fix/bug-navbar`)
	3. Faça commits pequenos e descritivos
	4. Abra PR com descrição e passos para reproduzir/testar

## Contatos e notas finais

Se preferir, posso:
- Gerar um `setup.ps1` para automatizar a instalação e startup do ambiente no Windows;
- Extrair a cor exata do logo e aplicar ao botão de menu (para combinar tonalidade);
- Adicionar instruções de integração backend (endpoints esperados) se me fornecer o backend ou contratos API.

---

README atualizado em pt-BR com instruções completas.
