# Scripts de Utilitários

Este diretório contém scripts auxiliares para gerenciamento do ambiente Atrivium.

## Scripts de Inicialização/Parada

### start.sh
Script principal para iniciar todo o ambiente de desenvolvimento (Linux/macOS/Git Bash):
- Inicia os containers Docker (Postgres, Backend, Frontend)
- Aguarda o banco de dados ficar saudável
- Executa setup automático das tabelas SQL

**Uso:**
```bash
./scripts/start.sh
```

### close.sh
Para e remove todos os containers do ambiente de desenvolvimento.

**Uso:**
```bash
./scripts/close.sh
```

### start.bat
Script simplificado para iniciar o backend no Windows (CMD).

**Uso:**
```cmd
.\scripts\start.bat
```

## Scripts de Banco de Dados

### apply-db-updates.ps1
Script PowerShell para aplicar atualizações do banco de dados na ordem correta.
Aplica scripts SQL incluindo extensões e migrations.

**Uso:**
```powershell
.\scripts\apply-db-updates.ps1
```

### run-sql-scripts.bat
Script Windows (Batch) para aplicar scripts SQL de migration no banco de dados.

**Uso:**
```cmd
.\scripts\run-sql-scripts.bat
```

### clean-db-data.bat
Limpa todos os dados do banco de dados mantendo a estrutura das tabelas.

**Uso:**
```cmd
.\scripts\clean-db-data.bat
```

## Scripts de Atualização/Manutenção

### update-api-to-worker.ps1
Substitui referências de API_BASE por WORKER_BASE nos componentes do FrontEnd.

**Uso:**
```powershell
.\scripts\update-api-to-worker.ps1
```

### update-nft-detail.ps1
Script de atualização específico para detalhes de NFTs.

**Uso:**
```powershell
.\scripts\update-nft-detail.ps1
```

## Notas

- Scripts `.sh` são para Linux/macOS/Git Bash
- Scripts `.bat` são para Windows CMD
- Scripts `.ps1` são para Windows PowerShell
- Execute os scripts a partir da **raiz do projeto** para garantir que os caminhos relativos funcionem corretamente
