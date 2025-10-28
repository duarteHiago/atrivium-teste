import { useState } from 'react';
import styled from 'styled-components';
import { API_BASE } from '../../config/api';

const Container = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 30px;
  background: rgba(30, 30, 31, 0.8);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h2`
  font-size: 2em;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 30px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
`;

const Input = styled.input`
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 1em;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #667eea;
    background: rgba(255, 255, 255, 0.08);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const TextArea = styled.textarea`
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 1em;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #667eea;
    background: rgba(255, 255, 255, 0.08);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const Button = styled.button`
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 40px;
`;

const LoadingText = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1em;
  margin-top: 16px;
`;

const Spinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ResultContainer = styled.div`
  margin-top: 30px;
  padding: 20px;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
`;

const ResultImage = styled.img`
  width: 100%;
  border-radius: 8px;
  margin-top: 16px;
`;

const ResultInfo = styled.div`
  margin-top: 16px;
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.7);

  p {
    margin: 8px 0;
  }

  strong {
    color: rgba(255, 255, 255, 0.9);
  }
`;

const ErrorMessage = styled.div`
  padding: 16px;
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 8px;
  color: #ff6b6b;
  margin-top: 20px;
`;

function CreateNFT() {
  const [formData, setFormData] = useState({
    prompt: '',
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/api/leonardo/generate-and-save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao gerar NFT');
      }

      setResult(data.nft);
      setFormData({ prompt: '', name: '', description: '' });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>🎨 Gerar NFT com IA</Title>
      <Subtitle>Crie arte única usando inteligência artificial</Subtitle>

      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Label htmlFor="prompt">Prompt (Descrição da imagem) *</Label>
          <TextArea
            id="prompt"
            name="prompt"
            value={formData.prompt}
            onChange={handleChange}
            placeholder="Ex: A majestic dragon flying over mountains at sunset, digital art, detailed, vibrant colors"
            required
            disabled={loading}
          />
        </InputGroup>

        <InputGroup>
          <Label htmlFor="name">Nome do NFT</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ex: Dragon Sunset #1"
            disabled={loading}
          />
        </InputGroup>

        <InputGroup>
          <Label htmlFor="description">Descrição</Label>
          <TextArea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descrição opcional do seu NFT"
            disabled={loading}
            style={{ minHeight: '80px' }}
          />
        </InputGroup>

        <Button type="submit" disabled={loading || !formData.prompt}>
          {loading ? 'Gerando...' : 'Gerar NFT'}
        </Button>
      </Form>

      {loading && (
        <LoadingContainer>
          <Spinner />
          <LoadingText>
            Gerando seu NFT... Isso pode levar alguns minutos.
          </LoadingText>
        </LoadingContainer>
      )}

      {error && (
        <ErrorMessage>
          ❌ {error}
        </ErrorMessage>
      )}

      {result && (
        <ResultContainer>
          <h3>✅ NFT Gerado com Sucesso!</h3>
          <ResultImage src={result.imageUrl} alt={result.name} />
          <ResultInfo>
            <p><strong>Nome:</strong> {result.name}</p>
            <p><strong>Token ID:</strong> {result.tokenId}</p>
            <p><strong>Prompt:</strong> {result.prompt}</p>
            <p><strong>Criado em:</strong> {new Date(result.createdAt).toLocaleString('pt-BR')}</p>
          </ResultInfo>
        </ResultContainer>
      )}
    </Container>
  );
}

export default CreateNFT;