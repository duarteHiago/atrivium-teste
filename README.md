# Artrivium - E-Commerce de NFT com Geração por IA

O **Artrivium** é uma aplicação web moderna desenvolvida como projeto acadêmico. O sistema combina tecnologias web (React, Node.js) com inteligência artificial para geração automática de imagens exclusivas, que são tokenizadas em NFTs e comercializadas dentro da própria plataforma.

A plataforma oferecerá um ciclo completo para o artista digital:

* **Criação:** Uma interface intuitiva onde qualquer pessoa, independentemente da habilidade técnica, pode descrever uma ideia (prompt) e ver a IA transformá-la em uma imagem digital.
* **Tokenização (Minting):** A capacidade de transformar a arte gerada em um Token Não Fungível (NFT) em uma blockchain, garantindo autenticidade e propriedade.
* **Comercialização:** Um marketplace integrado onde os criadores podem listar seus NFTs para venda e colecionadores podem adquirir obras únicas.

## 2. Tecnologias Utilizadas

A arquitetura do projeto foi desenhada utilizando um stack de tecnologias modernas, robustas e escaláveis, separando as responsabilidades entre o backend, o frontend e a infraestrutura.

| Categoria | Tecnologia |
| :--- | :--- |
| **Frontend** | React (Vite), JavaScript, HTML5, CSS3, Styled-Components |
| **Backend** | Node.js, Express, API REST |
| **Banco de Dados** | PostgreSQL |
| **Armazenamento** | IPFS (Pinata) - Descentralizado |
| **Infraestrutura** | Docker, Docker Compose |
| **IA Generativa** | Leonardo AI, HuggingFace |
| **Blockchain (Planejado)**| Solidity (Smart Contracts), Ethers.js |
| **Segurança** | Autenticação (JWT), Criptografia (pgcrypto) |

## 3. Status Atual do Projeto

O projeto está em desenvolvimento ativo e organizado em fases:

-   [x] **Fase 1: Configuração do Ambiente** - Estrutura do monorepo (Frontend, Backend, DataBase, Docker) e setup do container PostgreSQL com Docker Compose.
-   [x] **Fase 2: Frontend** - Interface de usuário completa com React (Autenticação, Galeria de NFTs, Criação de NFTs, Perfil de Usuário, Coleções).
-   [x] **Fase 3: Backend (API)** - Endpoints REST implementados (Autenticação, NFTs, Coleções, Usuários).
-   [x] **Fase 4: Integração com IA** - Sistema de geração de imagens com Leonardo AI e HuggingFace.
-   [x] **Fase 5: Tokenização** - Sistema de tokenização única com hash SHA-256 e certificados digitais.
-   [x] **Fase 6: Armazenamento IPFS** - Integração com Pinata para armazenamento descentralizado de imagens NFT.
-   [x] **Fase 6.1: Sistema de Administração IPFS** - Controle de acesso administrativo para IPFS Manager e sincronização automática de imagens Pinata.
-   [ ] **Fase 7: Integração com Blockchain** - Implementação de smart contracts e minting (Planejado).

## 4. Arquitetura Planejada

A arquitetura planejada segue um modelo de serviços desacoplados para garantir escalabilidade.

```
+----------------+       +------------------+       +------------------------+
|                |       |                  |       |                        |
|   Frontend     |-----> |   API Gateway    |-----> |   Backend Principal    |
|   (React)      |       | (e.g., NGINX)    |       |   (Node.js)            |
|                |       |                  |       |                        |
+----------------+       +--------+---------+       +-----------+------------+
                                  |                             |
                                  |                             |
         +------------------------+-------------------------+
         |                        |                         |
+--------v----------+  +---------v---------+  +------------v----------+
|                   |  |                   |  |                       |
|   Serviço de IA   |  |  Banco de Dados   |  |  Serviço Blockchain   |
|  (API Externa)    |  |  (PostgreSQL)     |  | (Nó / Smart Contract) |
|                   |  |                   |  |                       |
+-------------------+  +-------------------+  +-----------------------+
```

* **Frontend:** Uma Single-Page Application (SPA) em React que consome as APIs do backend.
* **Backend Principal:** Uma API RESTful em Node.js, responsável pela lógica de negócio (usuários, NFTs, transações).
* **Banco de Dados:** PostgreSQL rodando em Docker, para persistência de dados.
* **Serviços Externos:** Integrações com APIs de IA para geração de arte e com a Blockchain para minting.

## 5. Pré-requisitos (Requisitos Técnicos)

Para configurar e executar este projeto, você precisará ter as seguintes ferramentas instaladas:

* **Node.js (LTS)** e **npm**
* **Docker e Docker Compose**
* **Git** para controle de versão
* Uma IDE (recomendado: Visual Studio Code).
* Um cliente de banco de dados (recomendado: DBeaver, DataGrip).

## 6. Como Executar (Ambiente de Dev)

### 🚀 Início Rápido (Recomendado)

A maneira mais rápida de começar é usar nosso script de automação:

```bash
# 1. Clone o repositório
git clone https://github.com/duarteHiago/atrivium-teste.git
cd atrivium-teste

# 2. Configure o ambiente (primeira vez)
# Copie o arquivo de exemplo
cd config/environments
cp .env.example .env.development

# Edite .env.development e adicione suas API keys:
# LEONARDO_API_KEY=sua_chave_aqui
# ou HUGGINGFACE_API_KEY=sua_chave_aqui

# 3. Volte para a raiz e inicie tudo
cd ../..
chmod +x start.sh   # Apenas Linux/Mac
./start.sh          # Inicia Docker + Database + Backend + Frontend
```

**URLs Disponíveis:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5433

**Para parar:**
```bash
./close.sh
```

📖 **Para mais detalhes, veja:** [docs/SETUP-RAPIDO.md](docs/SETUP-RAPIDO.md)

---

### 🔧 Setup Manual (Alternativo)

Siga os passos para iniciar o ambiente de desenvolvimento local manualmente.

#### 1. Clonar o Repositório

```bash
git clone https://github.com/duarteHiago/atrivium-teste.git
cd atrivium-teste
```

#### 2. Iniciar o Banco de Dados (PostgreSQL)

O container Docker do banco é gerenciado pela pasta Docker.

```bash
cd Docker
docker-compose up -d
```

* Conexão: Seu banco estará disponível em:
	* Host: localhost
	* Porta: 5433
	* Usuário: admin
	* Senha: devpassword
	* Database: atrivium-database

#### 3. Configurar Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cd ../config/environments
cp .env.example .env.development

# Edite .env.development com suas credenciais
# APIs necessárias:
# LEONARDO_API_KEY=sua_chave_leonardo_aqui
# HUGGINGFACE_API_KEY=sua_chave_huggingface_aqui  
# PINATA_API_KEY=sua_chave_pinata_aqui
# PINATA_SECRET_API_KEY=sua_chave_secreta_pinata_aqui
```

#### 4. Iniciar o Backend (Node.js)

```bash
cd ../../BackEnd
npm install
npm run dev
```

Backend disponível em: http://localhost:3001

#### 5. Iniciar o Frontend (React)

Em um novo terminal:

```bash
cd FrontEnd
npm install
npm run dev
```

Frontend disponível em: http://localhost:5173

## 7. Estrutura de Pastas (Monorepo)

```
atrivium-teste/
├── BackEnd/               # API Node.js + Express
│   ├── src/
│   │   ├── controllers/   # Lógica de negócio
│   │   ├── routes/        # Definição de rotas
│   │   ├── services/      # Serviços (IA, Criptografia, Tokenização)
│   │   └── middleware/    # Upload, Autenticação
│   ├── uploads/           # Armazenamento de imagens
│   └── server.js          # Entry point
├── FrontEnd/              # React + Vite
│   ├── src/
│   │   ├── Components/    # Componentes React
│   │   ├── assets/        # Imagens e recursos
│   │   └── config/        # Configurações
│   └── index.html
├── DataBase/              # Scripts SQL
│   └── SQL/               # Migrações e schemas
├── Docker/                # Configurações Docker
│   ├── docker-compose.yaml
│   ├── BackEnd/           # Dockerfile do backend
│   └── FrontEnd/          # Dockerfile do frontend
├── config/                # Configurações do projeto
│   └── environments/      # Arquivos .env por ambiente
└── docs/                  # Documentação
    ├── SETUP-RAPIDO.md    # Guia de início rápido
    ├── NFT-SYSTEM-SETUP.md
    └── archived/          # Documentação histórica
```

## 8. Funcionalidades Implementadas

### 🔐 Sistema de Administração e IPFS

#### Controle de Acesso Administrativo
- **IPFS Manager restrito a Admins**: O menu "IPFS Manager" no sidebar só aparece para usuários com role de admin
- **Indicador de Status Pinata**: Botão de teste IPFS disponível apenas para admins na barra superior
- **Sincronização Automática**: Sistema de sync entre Pinata e banco de dados local

#### Integração IPFS/Pinata
- **CID como Token ID**: NFTs do IPFS usam o CID (Content Identifier) como token_id
- **Metadata ERC-721**: Estrutura de metadata compatível com padrão ERC-721
- **Gateway Descentralizado**: Imagens acessíveis via gateway Pinata
- **Identificação Visual**: NFTs do IPFS têm badge 🌐 na interface

#### Arquivos Modificados (04/11/2025)
- `FrontEnd/src/Components/BarraSuperior/index.jsx`: Adicionado controle admin e testes IPFS
- `FrontEnd/src/Components/BarraLateral/index.jsx`: IPFS Manager restrito a admins  
- `BackEnd/src/services/pinataSync.service.js`: Serviço de sincronização Pinata
- `BackEnd/src/routes/pinataSync.routes.js`: Endpoints de sincronização
- `BackEnd/src/routes/testNft.routes.js`: Endpoints de teste IPFS com CID como token
- `FrontEnd/src/services/nftMerged.service.js`: Serviço para mesclar NFTs locais e IPFS

### 🧪 Endpoints de Teste (Desenvolvimento)
- `GET /api/test/create-ipfs-nft`: Criar NFT de teste do IPFS
- `GET /api/test/simple-nfts`: Listar NFTs simplificado
- `GET /api/test/check-ipfs-nfts`: Verificar NFTs IPFS
- `POST /api/pinata-sync/sync`: Sincronizar imagens do Pinata (Admin apenas)

## 9. Troubleshooting (Solução de Problemas)

* **Problemas com `npm` no PowerShell (ExecutionPolicy):**
    * Se o PowerShell bloquear scripts `npm`, reabra o terminal como **Administrador** e execute:
    * `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
    * Ou use o `cmd` (Prompt de Comando).

* **Docker:**
    * Se o container do Postgres não subir, verifique os logs: `docker-compose logs postgres` (execute de dentro da pasta `Docker`).

## 9. Contribuindo

Para contribuir com o projeto, siga estes passos:

1.  Faça um Fork do repositório.
2.  Crie uma branch para sua feature (`feature/nova-feature`, `fix/bug-layout`).
3.  Faça commits pequenos e descritivos.
4.  Abra um Pull Request (PR) com a descrição das mudanças.

## 10. Conclusão

O Artrivium representa um passo ambicioso na intersecção entre arte, tecnologia e finanças descentralizadas. Com uma base técnica sólida e uma visão clara, o projeto está bem posicionado para se tornar uma plataforma de referência para a criação e negociação de arte gerada por IA.
