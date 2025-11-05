import { useState, useEffect } from 'react';
import styled from 'styled-components';

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: ${props => props.$objectFit || 'cover'};
  transition: opacity 0.3s ease;
  opacity: ${props => props.$loaded ? 1 : 0};
`;

const Placeholder = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
`;

const ErrorMessage = styled.div`
  width: 100%;
  height: 100%;
  background: #1a1a2e;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 12px;
  padding: 10px;
  text-align: center;
`;

/**
 * Componente que tenta carregar imagem de múltiplos gateways IPFS
 * com fallback automático
 */
const FallbackImage = ({ 
  src, 
  ipfsHash, 
  alt = 'NFT Image', 
  objectFit = 'cover',
  className,
  onLoad,
  onError
}) => {
  const [currentSrc, setCurrentSrc] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [attemptIndex, setAttemptIndex] = useState(0);

  // Configurar gateways IPFS com fallback
  const getImageSources = () => {
    const sources = [];

    // 1. URL original (se fornecida e não for ipfs://)
    if (src && !src.startsWith('ipfs://')) {
      sources.push(src);
    }

    // 2. Se tiver ipfsHash, adicionar múltiplos gateways
    if (ipfsHash) {
      const hash = ipfsHash.replace('ipfs://', '');
      const pinataSubdomain = import.meta.env.VITE_PINATA_SUBDOMAIN;
      
      // Gateway customizado do Pinata (se configurado)
      if (pinataSubdomain) {
        sources.push(`https://${pinataSubdomain}/ipfs/${hash}`);
      }
      
      // Gateways públicos IPFS
      sources.push(`https://gateway.pinata.cloud/ipfs/${hash}`);
      sources.push(`https://ipfs.io/ipfs/${hash}`);
      sources.push(`https://cloudflare-ipfs.com/ipfs/${hash}`);
      sources.push(`https://dweb.link/ipfs/${hash}`);
    }

    // 3. Se src for ipfs://, adicionar gateways
    if (src && src.startsWith('ipfs://')) {
      const hash = src.replace('ipfs://', '');
      sources.push(`https://gateway.pinata.cloud/ipfs/${hash}`);
      sources.push(`https://ipfs.io/ipfs/${hash}`);
      sources.push(`https://cloudflare-ipfs.com/ipfs/${hash}`);
    }

    // Remover duplicatas
    return [...new Set(sources)];
  };

  const sources = getImageSources();

  useEffect(() => {
    setLoaded(false);
    setError(false);
    setAttemptIndex(0);
    
    if (sources.length > 0) {
      setCurrentSrc(sources[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, ipfsHash]);

  const handleImageLoad = () => {
    setLoaded(true);
    setError(false);
    if (onLoad) onLoad();
  };

  const handleImageError = () => {
    // Tentar próximo gateway
    const nextIndex = attemptIndex + 1;
    
    if (nextIndex < sources.length) {
      console.log(`⚠️ Falha ao carregar de ${currentSrc}, tentando gateway ${nextIndex + 1}/${sources.length}`);
      setAttemptIndex(nextIndex);
      setCurrentSrc(sources[nextIndex]);
      setLoaded(false);
    } else {
      console.error(`❌ Falha ao carregar imagem de todos os ${sources.length} gateways`);
      setError(true);
      if (onError) onError();
    }
  };

  if (!currentSrc && !error) {
    return (
      <Placeholder className={className}>
        <span>🖼️ Sem imagem</span>
      </Placeholder>
    );
  }

  if (error) {
    return (
      <ErrorMessage className={className}>
        <span style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</span>
        <span>Imagem não disponível</span>
        <span style={{ fontSize: '10px', marginTop: '4px', opacity: 0.6 }}>
          Tentou {sources.length} gateway{sources.length > 1 ? 's' : ''}
        </span>
      </ErrorMessage>
    );
  }

  return (
    <ImageContainer className={className}>
      {!loaded && (
        <Placeholder>
          <span>⏳ Carregando...</span>
        </Placeholder>
      )}
      <StyledImage
        src={currentSrc}
        alt={alt}
        $objectFit={objectFit}
        $loaded={loaded}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </ImageContainer>
  );
};

export default FallbackImage;
