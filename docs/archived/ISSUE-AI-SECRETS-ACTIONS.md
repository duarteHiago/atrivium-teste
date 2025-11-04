    # Issue: API Key da IA + GitHub Secrets + Actions

    **Labels:** `security`, `devops`, `ci/cd`  
    **Assignees:** @duarteHiago

    ---

    ## 📋 Descrição
    Configurar a chave da API de IA (Hugging Face), salvar com segurança no GitHub Secrets e disponibilizar no GitHub Actions para build/deploy.

    ---

    ## ✅ Implementado
    - Gerado token em https://huggingface.co/settings/tokens (escopo: Read)
    - Adicionado no repo em Settings → Secrets and variables → Actions
    - HUGGINGFACE_API_KEY
    - DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE (opcional para CI/CD)
    - Atualizado `.env.example` com portas/credenciais do Docker
    - Documentado setup local em `docs/SETUP-DOCKER-SECRETS.md`
    - Exemplo de uso no GitHub Actions (injeção dos secrets em runtime)

    ---

    ## ▶️ Exemplo de uso no Actions
    ```yaml
    - name: Setup env
    run: |
        echo "HUGGINGFACE_API_KEY=${{ secrets.HUGGINGFACE_API_KEY }}" >> .env
        echo "DB_HOST=${{ secrets.DB_HOST }}" >> .env
        echo "DB_PORT=${{ secrets.DB_PORT }}" >> .env
    ```

    ---

    ## ✅ Critérios de Aceite
    - Secrets criados e testados no repositório
    - Pipeline injeta variáveis no ambiente de execução
    - Sem exposição de chaves no código/commits

    ---

    **Status:** ✅ Concluído - 27/10/2025