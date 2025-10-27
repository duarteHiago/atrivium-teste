import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 80px);
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: white;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const FormSection = styled.div`
  background-color: rgba(30, 30, 31, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
`;

const PreviewSection = styled.div`
  background-color: rgba(30, 30, 31, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  color: white;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #27ae60;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #27ae60;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #27ae60;
  }
  
  option {
    background-color: rgba(20, 20, 21, 1);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 1rem;
  background-color: ${props => props.variant === 'primary' ? '#27ae60' : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  border: 1px solid ${props => props.variant === 'primary' ? '#27ae60' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: ${props => props.marginTop || '0'};
  
  &:hover {
    background-color: ${props => props.variant === 'primary' ? '#2ecc71' : 'rgba(255, 255, 255, 0.2)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 500px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const PlaceholderBox = styled.div`
  width: 100%;
  height: 400px;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.1rem;
  text-align: center;
  padding: 2rem;
`;

const LoadingSpinner = styled.div`
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top: 3px solid #27ae60;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SuccessMessage = styled.div`
  background-color: rgba(39, 174, 96, 0.2);
  border: 1px solid #27ae60;
  border-radius: 8px;
  padding: 1rem;
  color: #27ae60;
  margin-top: 1rem;
  text-align: center;
`;

const ErrorMessage = styled.div`
  background-color: rgba(231, 76, 60, 0.2);
  border: 1px solid #e74c3c;
  border-radius: 8px;
  padding: 1rem;
  color: #e74c3c;
  margin-top: 1rem;
`;

const TokenInfo = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  font-size: 0.9rem;
  
  strong {
    color: #27ae60;
  }
  
  code {
    background-color: rgba(0, 0, 0, 0.3);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-family: monospace;
    display: block;
    margin-top: 0.5rem;
    word-break: break-all;
  }
`;

const CreateNFT = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prompt: '',
    style: 'stable-diffusion'
  });
  const [creatorId, setCreatorId] = useState(() => {
    try {
      return localStorage.getItem('creatorId') || '';
    } catch {
      return '';
    }
  });
  
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [nftData, setNftData] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleGeneratePreview = async () => {
    if (!formData.prompt) {
      setError('Por favor, insira uma descrição para gerar a imagem');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/nft/generate-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: formData.prompt,
          style: formData.style
        })
      });

      const data = await response.json();

      if (data.success) {
        setPreviewImage(data.data.image);
      } else {
        setError(data.message || 'Erro ao gerar imagem');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNFT = async () => {
    if (!formData.name || !formData.description || !previewImage) {
      setError('Por favor, preencha todos os campos e gere uma imagem');
      return;
    }

    // creatorId é opcional; se vazio, o backend criará sem associação de usuário

    setCreating(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/nft/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          prompt: formData.prompt,
          style: formData.style,
          imageBase64: previewImage,
          creatorId: creatorId, // opcional; backend trata vazio como null
          attributes: []
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setNftData(data.data);
        
        // Limpa o formulário após 3 segundos
        setTimeout(() => {
          setFormData({ name: '', description: '', prompt: '', style: 'stable-diffusion' });
          setPreviewImage(null);
          setSuccess(false);
          setNftData(null);
        }, 10000);
      } else {
        setError(data.message || 'Erro ao criar NFT');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Container>
      <Title>Criar seu NFT</Title>
      <Subtitle>
        Crie NFTs únicos usando IA generativa. Cada imagem é tokenizada de forma única e verificável.
      </Subtitle>

      <ContentGrid>
        <FormSection>
          <FormGroup>
            <Label>Nome do NFT *</Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ex: Cyberpunk Cat"
              disabled={loading || creating}
            />
          </FormGroup>

          <FormGroup>
            <Label>Descrição *</Label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Descreva seu NFT..."
              disabled={loading || creating}
            />
          </FormGroup>

          <FormGroup>
            <Label>Prompt para IA *</Label>
            <TextArea
              name="prompt"
              value={formData.prompt}
              onChange={handleInputChange}
              placeholder="Ex: A futuristic cat with neon lights, cyberpunk style, detailed"
              disabled={loading || creating}
            />
          </FormGroup>

          <FormGroup>
            <Label>Creator ID (UUID do usuário)</Label>
            <Input
              type="text"
              name="creatorId"
              value={creatorId}
              onChange={(e) => {
                setCreatorId(e.target.value);
                try { localStorage.setItem('creatorId', e.target.value); } catch { void 0; }
              }}
              placeholder="Cole aqui o UUID do usuário criador"
              disabled={loading || creating}
            />
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Dica: crie um usuário de teste e cole o <code>user_id</code> aqui. O valor fica salvo no navegador.
            </p>
          </FormGroup>

          <FormGroup>
            <Label>Estilo de Arte</Label>
            <Select
              name="style"
              value={formData.style}
              onChange={handleInputChange}
              disabled={loading || creating}
            >
              <option value="stable-diffusion">Digital Art</option>
              <option value="anime">Anime</option>
              <option value="realistic">Realistic</option>
            </Select>
          </FormGroup>

          <Button
            variant="secondary"
            onClick={handleGeneratePreview}
            disabled={loading || creating || !formData.prompt}
          >
            {loading ? 'Gerando...' : '🎨 Gerar Preview'}
          </Button>

          {previewImage && (
            <Button
              variant="primary"
              marginTop="1rem"
              onClick={handleCreateNFT}
              disabled={creating || !formData.name || !formData.description}
            >
              {creating ? 'Criando NFT...' : '✨ Criar NFT'}
            </Button>
          )}

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && (
            <SuccessMessage>
              ✅ NFT criado com sucesso! Seu token foi gerado.
            </SuccessMessage>
          )}
        </FormSection>

        <PreviewSection>
          {loading ? (
            <>
              <LoadingSpinner />
              <p>Gerando imagem com IA...</p>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                Isso pode levar alguns segundos
              </p>
            </>
          ) : previewImage ? (
            <>
              <PreviewImage src={previewImage} alt="Preview do NFT" />
              {nftData && (
                <TokenInfo>
                  <strong>Token ID:</strong>
                  <code>{nftData.nft.tokenId}</code>
                  <strong style={{ display: 'block', marginTop: '1rem' }}>Image Hash:</strong>
                  <code>{nftData.nft.imageHash}</code>
                  <strong style={{ display: 'block', marginTop: '1rem' }}>Certificado:</strong>
                  <code>{nftData.certificate.certificateHash}</code>
                </TokenInfo>
              )}
            </>
          ) : (
            <PlaceholderBox>
              <span style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎨</span>
              <p>Sua imagem gerada por IA aparecerá aqui</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Preencha o prompt e clique em "Gerar Preview"
              </p>
            </PlaceholderBox>
          )}
        </PreviewSection>
      </ContentGrid>
    </Container>
  );
};

export default CreateNFT;
