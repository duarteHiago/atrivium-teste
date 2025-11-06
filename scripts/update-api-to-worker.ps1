# Script para substituir API_BASE por WORKER_BASE nos componentes do FrontEnd

$files = @(
    "FrontEnd\src\Components\Activity\Activity.jsx",
    "FrontEnd\src\Components\Gallery\Gallery.jsx",
    "FrontEnd\src\Components\User\Profile.jsx",
    "FrontEnd\src\Components\User\PublicProfile.jsx",
    "FrontEnd\src\Components\User\EditProfileModal.jsx",
    "FrontEnd\src\Components\NftDetail\NftDetail.jsx",
    "FrontEnd\src\Components\Marketplace\Marketplace.jsx",
    "FrontEnd\src\Components\NftGallery\NftGallery.jsx",
    "FrontEnd\src\Components\FavoriteButton\FavoriteButton.jsx",
    "FrontEnd\src\Components\NftHistory\NftHistory.jsx",
    "FrontEnd\src\Components\CollectionModal\CollectionModal.jsx"
)

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
    if (Test-Path $fullPath) {
        Write-Host "Atualizando $file..." -ForegroundColor Green
        $content = Get-Content $fullPath -Raw
        
        # Substituir import API_BASE por WORKER_BASE
        $content = $content -replace "import \{ API_BASE \} from '../../config/api';", "import { WORKER_BASE } from '../../config/api';"
        $content = $content -replace "import \{ API_BASE \} from '../../../config/api';", "import { WORKER_BASE } from '../../../config/api';"
        
        # Substituir API_BASE, WORKER_BASE por apenas WORKER_BASE
        $content = $content -replace "import \{ API_BASE, WORKER_BASE \} from '../../config/api';", "import { WORKER_BASE } from '../../config/api';"
        
        # Substituir todas as ocorrências de ${API_BASE} por ${WORKER_BASE}
        $content = $content -replace '\$\{API_BASE\}', '${WORKER_BASE}'
        
        Set-Content $fullPath -Value $content -NoNewline
        Write-Host "✓ $file atualizado" -ForegroundColor Cyan
    } else {
        Write-Host "✗ $file não encontrado" -ForegroundColor Red
    }
}

Write-Host "`nAtualização concluída!" -ForegroundColor Yellow
