# PR: Atualizações da branch `dev-hiago` (Resumo para merge)

Resumo
-----
Este PR reúne as mudanças realizadas na branch `dev-hiago` desde o último trabalho integrado ao repositório. Ele fecha as issues listadas abaixo e contém melhorias no frontend, estruturação do backend, dockerização e documentação da API.

Issues que serão fechadas
------------------------
- #26 — BE-002: Implementar Endpoints CRUD para NFTs  
  - Tipo: Feature / Backend / API Design  
  - O que foi feito (resumo): Implementados e estruturados endpoints CRUD para NFTs (POST, GET com paginação, GET by id, PUT, DELETE) com validações básicas e preparo para autenticação.

- #50 — API-003: Documentar Endpoints CRUD de NFTs com OpenAPI/Swagger  
  - Tipo: Documentation / Backend / API Design  
  - O que foi feito (resumo): Documentação OpenAPI/Swagger criada para os endpoints CRUD de NFTs (métodos, parâmetros, requestBody, responses, securitySchemes) e disponível via Swagger UI.

- #16 — FE-002: Implementar Exibição de NFTs Reais (Substituir Placeholders)  
  - Tipo: Feature / Frontend  
  - O que foi feito (resumo): Página "Discover" atualizada para exibir dados reais (mock inicialmente) em vez de placeholders. Componente `NftCard` adaptado para exibir imagem, nome, preço e props reutilizáveis.

- #52 — API-005: Definir Contrato da API para Geração de Imagem IA  
  - Tipo: Documentation / API Design / Research  
  - O que foi feito (resumo): Contrato da API definido para geração de imagens por IA (endpoint(s), formato de request `{ prompt, style, aspectRatio }`, decisão sobre fluxo síncrono vs. assíncrono e endpoints de status), documentado em OpenAPI.

- #49 — API-002: Definir Padrões de Resposta da API  
  - Tipo: Documentation / Chore / API Design  
  - O que foi feito (resumo): Padronização do formato JSON de respostas (sucesso e erro), com esquema sugerido `{ status, data }` para sucesso e `{ status, message, code, details }` para erros; documentação no README/backend e integração ao middleware de erro.

- #48 — API-001: Documentar API de Autenticação (Login/Registro) usando OpenAPI/Swagger  
  - Tipo: Documentation / Backend / API Design  
  - O que foi feito (resumo): Documentação OpenAPI para `/api/auth/register` e `/api/auth/login`, incluindo request/response, exemplos e rota para Swagger UI (`/api-docs`).

- #55 — Infra-001: Dockerizar Aplicação Backend (Node.js)  
  - Tipo: Feature / Infra / Docker  
  - O que foi feito (resumo): Adicionado `Dockerfile` na pasta BackEnd com base node apropriada, COPY de package.json, instalação de dependências, definição de WORKDIR e CMD; `.dockerignore` criado.

- #33 — BE-009: Configurar Roteamento e Estrutura de Controllers/Services  
  - Tipo: Feature / Backend / Chore  
  - O que foi feito (resumo): Refatoração do backend para separar `routes`, `controllers` e `services`; `server.js` simplificado e roteadores importados.

- #56 — Infra-002: Integrar Serviço backend ao docker-compose.yaml  
  - Tipo: Feature / Infra / Docker  
  - O que foi feito (resumo): `docker-compose.yaml` atualizado para incluir serviço `backend` (build via Dockerfile, depends_on postgres, mapeamento de portas e variáveis de ambiente), permitindo orquestrar backend + bd com um único comando.

Commits / merges relevantes (referência)
----------------------------------------
- PR #12 — feat: Implementação Inicial do CMS e Melhoria na Navegação — merge: 8f240058bfed61a17617d70b9898797e32f91dde (merged_at: 2025-10-26T16:49:17Z)  
- PR #9 — feat: Initialize backend, setup DB connection, and implement register — merge: af4494d31c25cefa99b2144db565ed7fbaaac8f2 (merged_at: 2025-10-24T18:38:05Z)  
- PR #2 — feat: Enhance project structure and implement initial frontend layout — merge: dd697e5a53b9cfed7d6361a23c12293602908cb2 (merged_at: 2025-10-24T13:26:15Z)  
- PR #1 — docs(readme): documentação + ajustes frontend e docker-compose — merge: 3ecf99eb185a6895c8dd84e7ade0b79e425ad850 (merged_at: 2025-10-24T01:09:22Z)

Principais arquivos / áreas alteradas
------------------------------------
- Frontend:
  - src/Components/CMS/ (adição do módulo CMS)
  - src/Components/BarraLateral/ (atualização do botão Discover)
  - src/App.jsx (integração estado CMS e Discover)
  - Componentes `NftCard`, `LoginModal`, `WalletModal`, `ProfileDropdown`

- Backend:
  - BackEnd/Dockerfile (novo)
  - BackEnd/routes/ (novas rotas para NFTs, auth)
  - BackEnd/controllers/ (controllers separados)
  - BackEnd/services/ (acesso a BD, lógica)
  - Documentação OpenAPI gerada (ex: /api-docs)

- Infra:
  - Docker/docker-compose.yaml (integração do serviço backend com postgres)
  - BackEnd/.dockerignore

Atualizações de documentação (issues marcadas com Documentation)
---------------------------------------------------------------
- Issue #50 — Documentar Endpoints CRUD de NFTs  
  - Resumo sucinto: Documentação OpenAPI criada cobrindo todos os endpoints CRUD de NFTs (métodos, parâmetros de rota/query, requestBody para POST/PUT, schemas, segurança JWT e exemplos de respostas). Permite testar via Swagger UI.

- Issue #52 — Definir Contrato da API para Geração de Imagem IA  
  - Resumo sucinto: Contrato de API especificado (endpoints de geração e status), com esquema de request e resposta e recomendação de abordagem assíncrona por jobId. Documentado para facilitar integração frontend ↔ backend.

- Issue #49 — Definir Padrões de Resposta da API  
  - Resumo sucinto: Padrões JSON definidos e documentados; erros possuem `code` e `details` para facilitar tratamento e traduções no cliente; middleware de erro adaptado para seguir o padrão.

- Issue #48 — Documentar API de Autenticação (Login/Registro)  
  - Resumo sucinto: Endpoints `/api/auth/register` e `/api/auth/login` documentados com exemplos de payload, códigos de status e formatos de resposta (sucesso e erro); disponível em `/api-docs`.

---

## Integração com leonardo.ai (inserido nesta descrição)

Esta seção descreve o contrato da API para geração de imagens usando a API do leonardo.ai, o formato de request/responses que o backend deverá expor ao frontend e como o padrão de respostas globais da API foi adaptado para suportar fluxos síncronos e assíncronos de geração.

Observação: as URLs da API externa, chaves e modelos devem ser definidas em variáveis de ambiente (ex.: LEONARDO_API_KEY, LEONARDO_API_BASE_URL). Substitua os placeholders pelos valores reais.

### Endpoints expostos no backend
- POST /api/v1/generate/image — solicita geração (sync ou async)
- GET  /api/v1/generate/image/status/:jobId — consulta status/resultados (async)

### Variáveis de ambiente recomendadas
- LEONARDO_API_KEY — chave de API (Bearer) para leonardo.ai
- LEONARDO_API_BASE_URL — base URL da API (ex: https://api.leonardo.ai)
- LEO_DEFAULT_MODEL — modelo padrão a usar (ex: "leonardo-v1")
- GENERATION_MAX_WAIT_MS — tempo máximo de espera para modo síncrono (opcional)

### Contrato: POST /api/v1/generate/image
- Descrição: solicita a geração de uma imagem a partir de um prompt. O cliente escolhe se quer comportamento síncrono (backend aguarda até o resultado pronto, se for rápido) ou assíncrono (backend retorna jobId imediatamente).
- Método: POST
- Path: /api/v1/generate/image
- Body (exemplo):
{  
  "prompt": "A futuristic cityscape at sunset, cinematic lighting, ultra-detailed",  
  "style": "digital-painting",  
  "width": 1024,  
  "height": 1024,  
  "model": "leonardo-v1",  
  "quality": "high",  
  "seed": null,  
  "async": true
}

- Respostas:
  - 201 Accepted (async): { "status": "success", "data": { "jobId": "job_abc123", "provider": "leonardo.ai", "message": "Generation started", "etaSeconds": 25 } }
  - 200 OK (sync, resultado pronto): { "status": "success", "data": { "imageUrl": "https://cdn.leonardo.ai/outputs/....png", "thumbnailUrl": "https://cdn.leonardo.ai/outputs/thumb_....jpg", "providerJobId": "gen_12345", "provider": "leonardo.ai" } }
  - 400 Bad Request (payload inválido): { "status": "error", "message": "Campo 'prompt' é obrigatório e deve ter entre 10 e 2000 caracteres.", "code": "INVALID_INPUT", "details": [{ "field": "prompt", "issue": "missing_or_too_short" }], "requestId": "req_XXXXX" }

Obs: Em modo async, o backend deve enfileirar/registrar o job (jobId interno) e enviar a requisição ao leonardo.ai; deve armazenar mapping job interno ↔ providerJobId para futuras consultas/callbacks.

### Contrato: GET /api/v1/generate/image/status/:jobId
- Descrição: consulta o status do job de geração.
- Método: GET
- Path params: jobId (id interno gerado pelo backend)
- Resposta (exemplos):
  - Em processamento: { "status": "success", "data": { "jobId": "job_abc123", "providerJobId": "gen_12345", "state": "processing", "progress": 0.45, "etaSeconds": 18 } }
  - Concluído: { "status": "success", "data": { "jobId": "job_abc123", "providerJobId": "gen_12345", "state": "completed", "result": { "imageUrl": "https://cdn.leonardo.ai/outputs/....png", "thumbnailUrl": "https://cdn.leonardo.ai/outputs/thumb_....jpg", "mimeType": "image/png", "sizeBytes": 345678 } } }
  - Falha: { "status": "error", "message": "Falha no provider ao gerar imagem", "code": "PROVIDER_GENERATION_FAILED", "details": [{ "providerCode": "GEN_FAILED", "providerMessage": "Invalid model parameter" }], "requestId": "req_XXXXX" }

### Padrão Global de Resposta (API-002) — atualização
- Sucesso padrão: { "status": "success", "data": { ... } }
- Erro padrão (unificado): { "status": "error", "message": "Descrição human-readable curta", "code": "INTERNAL_ERROR | INVALID_INPUT | AUTH_ERROR | PROVIDER_RATE_LIMIT | PROVIDER_GENERATION_FAILED | ...", "details": [ { "field": "prompt", "issue": "too_short" } ], "requestId": "req_YYYYMMDD_HHMMSS_<random>" }

### Regras de mapeamento de erros do provider para códigos internos
- 401/403 do provider → code: AUTH_ERROR
- 429 do provider → code: PROVIDER_RATE_LIMIT
- 5xx do provider → code: PROVIDER_INTERNAL_ERROR
- provider response contendo erro detalhado → include providerCode/providerMessage em details

### Exemplo de implementação Node.js (axios)
// Exemplo ilustrativo (implementar em BackEnd/services/aiService.js)
const axios = require('axios');

const LEONARDO_BASE = process.env.LEONARDO_API_BASE_URL || 'https://api.leonardo.ai';
const LEONARDO_KEY = process.env.LEONARDO_API_KEY;

async function callLeonardoGenerate(prompt, opts = {}) {
  const body = {
    model: opts.model || process.env.LEO_DEFAULT_MODEL || 'leonardo-v1',
    prompt,
    width: opts.width || 1024,
    height: opts.height || 1024,
    quality: opts.quality || 'high',
  };

  const res = await axios.post(`${LEONARDO_BASE}/v1/generate`, body, {
    headers: {
      'Authorization': `Bearer ${LEONARDO_KEY}`,
      'Content-Type': 'application/json'
    },
    timeout: 60000
  });

  return {
    providerJobId: res.data.id || res.data.jobId || null,
    providerRaw: res.data
  };
}

### Curl de exemplo (direto para o backend)
- Solicitar async:
curl -X POST 'http://localhost:3001/api/v1/generate/image' \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"a colorful portrait of a cyberpunk cat","async":true}'

- Consultar status:
curl 'http://localhost:3001/api/v1/generate/image/status/job_abc123'

### OpenAPI / Swagger — snippet (exemplo simplificado)
paths:
  /api/v1/generate/image:
    post:
      summary: Gerar imagem via leonardo.ai
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                prompt:
                  type: string
                model:
                  type: string
                width:
                  type: integer
                height:
                  type: integer
                async:
                  type: boolean
              required: [prompt]
      responses:
        '201':
          description: Job aceito (async)
        '200':
          description: Resultado pronto (sync)
        '400':
          description: Requisição inválida

---

Instruções de validação / QA
---------------------------
- Rodar containers: (a partir da pasta Docker)  
  - docker-compose up -d  
  - Verificar serviços: backend e postgres rodando

- Backend:
  - Verificar rota Swagger UI (`/api-docs`) e testar endpoints de auth e NFTs.
  - Testar endpoints CRUD de NFTs (POST, GET list/pagination, GET by id, PUT, DELETE).
  - Testar middleware de erros: enviar payload inválido e confirmar formato padrão de erro.

- Frontend:
  - Abrir app (porta padrão do front-end) e acessar página Discover: confirmar exibição de cards de NFTs (imagem, nome, preço).
  - Abrir CMS via toggle e validar comportamento do botão Discover na barra lateral.

Checklist (pré-merge)
---------------------
- [ ] Todos os testes automáticos e CI passam.  
- [ ] Swagger UI acessível e endpoints documentados.  
- [ ] Dockerfile e docker-compose funcionais (construir imagem e iniciar containers).  
- [ ] Revisão de código completa para as mudanças em routes/controllers/services.  
- [ ] Issues listadas atualizadas com referências de PR/commit (serão fechadas automaticamente pelo merge se mencionadas).

Notas finais
-----------
Este documento reúne os pontos essenciais para revisão do PR que fecha as issues listadas. Caso queira que eu gere também um CHANGELOG com a lista detalhada de commits (SHA + arquivos alterados), posso criar e adicionar esse arquivo ao repositório igualmente.