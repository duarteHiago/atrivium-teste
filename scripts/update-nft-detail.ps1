# Script para atualizar NftDetail.jsx com a nova estrutura de preços e ofertas

$filePath = "c:\dev\atrivium-teste\FrontEnd\src\Components\NftDetail\NftDetail.jsx"

# Ler o conteúdo do arquivo
$content = Get-Content -Path $filePath -Raw -Encoding UTF8

# Substituir a seção antiga de Sistema de Ofertas (que está separada) por vazio
$content = $content -replace "(?s)          /\* Sistema de Ofertas \*/\s+\{nft\.status && \['for_sale', 'listed'\]\.includes\(nft\.status\) && \(\s+<NftOffers\s+nftId=\{nft\.nft_id\}\s+isOwner=\{isOwner\}\s+currentUserId=\{currentUserId\}\s+/>\s+\)\}", ""

# Salvar alterações
$content | Set-Content -Path $filePath -Encoding UTF8 -NoNewline

Write-Host "Primeira parte concluída - Sistema de ofertas separado removido"

# Agora vamos substituir a seção de Preço e Botões pela nova estrutura unificada
$oldPriceSection = @"
          {/* Preço e Botões */}
          <PriceSection>
            <PriceLabel>{\hasBonus \? 'Valor Sugerido' : 'Preço atual'}</PriceLabel>
"@

$newUnifiedSection = @'
          {/* Seção de Preços e Ofertas Unificada */}
          <PriceSection>
            <SectionTitle style={{ margin: '0 0 20px 0', fontSize: '1.5rem' }}>
              💰 Preços e Ofertas
            </SectionTitle>

            {/* Explicação do Sistema */}
            {isForSale && (
              <div style={{ 
                background: 'rgba(102, 126, 234, 0.1)', 
                border: '1px solid rgba(102, 126, 234, 0.3)', 
                borderRadius: '12px', 
                padding: '16px', 
                marginBottom: '20px',
                fontSize: '0.9rem',
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: '1.6'
              }}>
                <div style={{ fontWeight: 600, marginBottom: '8px', color: '#a8b5ff' }}>
                  ℹ️ Como funciona:
                </div>
                <div style={{ marginBottom: '6px' }}>
                  • <strong>Preço Base ({basePrice.toFixed(4)} ETH):</strong> Valor mínimo do NFT - Use como referência para fazer ofertas
                </div>
                <div style={{ marginBottom: '6px' }}>
                  • <strong>Fazer Oferta:</strong> Ofereça um valor <u>acima</u> de {basePrice.toFixed(4)} ETH e aguarde aprovação do dono
                </div>
                {hasBuyNow && (
                  <div>
                    • <strong>Compra Imediata ({buyNowPrice.toFixed(4)} ETH):</strong> Pague este valor e receba o NFT instantaneamente sem concorrência
                  </div>
                )}
              </div>
            )}

            {!isForSale && !isOwner && (
              <div style={{ 
                background: 'rgba(251, 191, 36, 0.1)', 
                border: '1px solid rgba(251, 191, 36, 0.3)', 
                borderRadius: '12px', 
                padding: '16px', 
                marginBottom: '20px',
                fontSize: '0.9rem',
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: '1.6'
              }}>
                <div style={{ fontWeight: 600, marginBottom: '8px', color: '#fbbf24' }}>
                  💡 Este NFT não está listado para venda
                </div>
                <div>
                  Você ainda pode fazer uma oferta ao proprietário e aguardar aprovação.
                </div>
              </div>
            )}

            {/* Grid de Preços */}
            {isForSale && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: hasBuyNow ? '1fr 1fr' : '1fr', 
                gap: '16px', 
                marginBottom: '24px' 
              }}>
                {/* Preço Base */}
                <div style={{ 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: '12px', 
                  padding: '20px' 
                }}>
                  <div style={{ 
                    fontSize: '0.85rem', 
                    color: 'rgba(255, 255, 255, 0.6)', 
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    💎 Preço Base (Ofertas)
                  </div>
                  <div style={{ 
                    fontSize: '1.8rem', 
                    fontWeight: 700, 
                    color: '#a8b5ff',
                    marginBottom: '4px'
                  }}>
                    {basePrice.toFixed(4)} ETH
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                    ≈ ${(basePrice * 2000).toFixed(2)} USD
                  </div>
                </div>

                {/* Preço de Compra Imediata */}
                {hasBuyNow && (
                  <div style={{ 
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15))', 
                    border: '2px solid rgba(16, 185, 129, 0.4)', 
                    borderRadius: '12px', 
                    padding: '20px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(16, 185, 129, 0.3)',
                      color: '#10b981',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      ⚡ INSTANTÂNEO
                    </div>
                    <div style={{ 
                      fontSize: '0.85rem', 
                      color: 'rgba(16, 185, 129, 0.9)', 
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      🚀 Compra Imediata
                    </div>
                    <div style={{ 
                      fontSize: '1.8rem', 
                      fontWeight: 700, 
                      color: '#10b981',
                      marginBottom: '4px'
                    }}>
                      {buyNowPrice.toFixed(4)} ETH
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(16, 185, 129, 0.8)' }}>
                      ≈ ${(buyNowPrice * 2000).toFixed(2)} USD
                    </div>
                    <div style={{ 
                      marginTop: '12px', 
                      fontSize: '0.8rem', 
                      color: 'rgba(255, 255, 255, 0.7)',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      +{(((buyNowPrice / basePrice) - 1) * 100).toFixed(0)}% acima do preço base
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mini gráfico de valorização (14d) */}
            {series.length > 1 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>
                  📈 Valorização (últimos 14 dias)
                </div>
                <SparklineWrap>
'@

Write-Host "Script preparado - Execute manualmente as substituições no VS Code"
