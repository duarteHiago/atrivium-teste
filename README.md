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
| **Backend (Planejado)** | Node.js (Express/NestJS), TypeScript, API REST |
| **Banco de Dados** | PostgreSQL |
| **Infraestrutura** | Docker, Docker Compose |
| **Blockchain (Planejado)**| Solidity (Smart Contracts), Ethers.js |
| **Geração de Arte (Planejado)**| Integração com APIs de IA (ex: OpenAI DALL-E) |
| **Segurança (Planejado)** | Autenticação (JWT), Gerenciamento de Chaves |

## 3. Status Atual do Projeto

O projeto está em desenvolvimento ativo e organizado em fases:

-   [x] **Fase 1: Configuração do Ambiente** - Estrutura do monorepo (Frontend, Backend, DataBase, Docker) e setup do container PostgreSQL com Docker Compose.
-   [x] **Fase 2: Frontend (em andamento)** - Construção da interface de usuário base com React (Barra Superior, Barra Lateral, Logo).
-   [ ] **Fase 3: Backend (API)** - Desenvolvimento das entidades, repositórios e endpoints REST com Node.js.
-   [ ] **Fase 4: Integração com IA** - Conexão com API para geração de imagens.
-   [ ] **Fase 5: Integração com Blockchain** - Implementação de smart contracts e minting.

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

Siga os passos para iniciar o ambiente de desenvolvimento local.

### 1. Clonar o Repositório

No local que ficará os arquivos, clica com o botão direito do mouse e abre o terminar e cola o comando a baixo.

```bash
git clone [https://github.com/duarteHiago/atrivium-teste.git](https://github.com/duarteHiago/atrivium-teste.git)
cd atrivium-teste
```

### 2. Iniciar o Banco de Dados (PostgreSQL)

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
	* Database: atrivium (ou o nome que definiu no seu .yaml)

### 3. Iniciar o Frontend (React)

Em um novo terminal, navegue até a pasta FrontEnd.

```bash
cd FrontEnd
npm install
npm run dev
```

* Abra o endereço exibido (padrão: http://localhost:5173).

### 4. Iniciar o Backend (Node.js)

Em um novo terminal, navegue até a pasta FrontEnd.

```bash
cd BackEnd
npm install
npm run dev
```

## 7. Estrutura de Pastas (Monorepo)

O projeto está organizado em uma estrutura de monorepo para separar as responsabilidades:

* `/BackEnd/`: Conterá toda a lógica da API (Node.js).
* `/DataBase/`: Pode conter scripts `.sql` de migração, diagramas ER, etc.
* `/Docker/`: Contém os arquivos `docker-compose.yaml` para serviços de infraestrutura (ex: Postgres).
* `/FrontEnd/`: Contém o projeto React (Vite).
    * `src/`: Código-fonte do React.
    * `public/`: Assets públicos.
    * `package.json`: Scripts e dependências do front-end.

## 8. Troubleshooting (Solução de Problemas)

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