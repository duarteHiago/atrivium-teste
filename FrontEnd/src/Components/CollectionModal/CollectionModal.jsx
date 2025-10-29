import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { API_BASE } from '../../config/api';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: rgba(30, 30, 31, 0.95);
  border-radius: 16px;
  padding: 32px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 1.8em;
  color: white;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.5em;
  cursor: pointer;
  padding: 8px;
  transition: color 0.2s;

  &:hover {
    color: white;
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Tab = styled.button`
  background: none;
  border: none;
  padding: 12px 24px;
  color: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.5)'};
  font-size: 1em;
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: pointer;
  border-bottom: 2px solid ${props => props.$active ? '#667eea' : 'transparent'};
  transition: all 0.2s;

  &:hover {
    color: white;
  }
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
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-size: 0.95em;
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
  min-height: 100px;
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
  background: ${props => props.$variant === 'secondary' ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1em;
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

const DropZone = styled.div`
  border: 2px dashed rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  padding: 14px;
  background: rgba(255,255,255,0.04);
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: border-color .2s ease, background .2s ease;

  &:hover {
    border-color: rgba(255,255,255,0.45);
    background: rgba(255,255,255,0.055);
  }
`;

const DropHint = styled.div`
  color: rgba(255,255,255,0.75);
  font-size: 0.95em;
`;

const Hint = styled.div`
  color: rgba(255,255,255,0.5);
  font-size: 0.85em;
`;

const BannerPreview = styled.div`
  width: 100%;
  aspect-ratio: 1600 / 520;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  img { width: 100%; height: 100%; object-fit: cover; display: block; }
`;

const CollectionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
`;

const CollectionItem = styled.div`
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid ${props => props.$selected ? '#667eea' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: #667eea;
  }
`;

const CollectionName = styled.h3`
  margin: 0 0 8px 0;
  color: white;
  font-size: 1.1em;
`;

const CollectionMeta = styled.div`
  display: flex;
  gap: 16px;
  font-size: 0.85em;
  color: rgba(255, 255, 255, 0.6);
`;

const SuccessMessage = styled.div`
  background: rgba(39, 174, 96, 0.2);
  border: 1px solid #27ae60;
  border-radius: 8px;
  padding: 16px;
  color: #27ae60;
  text-align: center;
  margin-bottom: 16px;
`;

const ErrorMessage = styled.div`
  background: rgba(231, 76, 60, 0.2);
  border: 1px solid #e74c3c;
  border-radius: 8px;
  padding: 16px;
  color: #e74c3c;
  margin-top: 16px;
`;

function CollectionModal({ isOpen, onClose, onSelect }) {
  const [activeTab, setActiveTab] = useState('select'); // 'select' ou 'create'
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    banner_image: ''
  });

  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  useEffect(() => {
    if (isOpen && activeTab === 'select') {
      fetchCollections();
    }
  }, [isOpen, activeTab]);

  const fetchCollections = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/collections/list`);
      const data = await response.json();
      if (data.success) {
        setCollections(data.collections);
      }
    } catch (err) {
      console.error('Erro ao buscar coleções:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(null);
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      let body;
      let headers;
      if (bannerFile) {
        const fd = new FormData();
        fd.append('name', formData.name);
        if (formData.description) fd.append('description', formData.description);
        // Preferência pelo arquivo; se quiser permitir URL alternativa, envia também
        if (formData.banner_image) fd.append('banner_image', formData.banner_image);
        fd.append('banner', bannerFile);
        body = fd;
        headers = undefined; // fetch define o boundary
      } else {
        headers = { 'Content-Type': 'application/json' };
        body = JSON.stringify(formData);
      }

      const response = await fetch(`${API_BASE}/api/collections/create`, {
        method: 'POST',
        headers,
        body
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setFormData({ name: '', description: '', banner_image: '' });
        setBannerFile(null);
        setBannerPreview(null);
        setTimeout(() => {
          onSelect(data.collection);
          onClose();
        }, 1500);
      } else {
        setError(data.message || 'Erro ao criar coleção');
      }
    } catch {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const onPickBanner = () => {
    document.getElementById('banner-input')?.click();
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    const url = URL.createObjectURL(file);
    setBannerPreview(url);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setBannerFile(file);
    const url = URL.createObjectURL(file);
    setBannerPreview(url);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const handleSelectCollection = (collection) => {
    setSelectedCollection(collection);
  };

  const handleConfirmSelection = () => {
    if (selectedCollection) {
      onSelect(selectedCollection);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>Gerenciar Coleções</Title>
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>

        <TabContainer>
          <Tab 
            $active={activeTab === 'select'} 
            onClick={() => setActiveTab('select')}
          >
            Selecionar Coleção
          </Tab>
          <Tab 
            $active={activeTab === 'create'} 
            onClick={() => setActiveTab('create')}
          >
            Criar Nova
          </Tab>
        </TabContainer>

        {activeTab === 'select' ? (
          <>
            <CollectionList>
              <CollectionItem
                $selected={selectedCollection === null}
                onClick={() => handleSelectCollection(null)}
              >
                <CollectionName>📂 Sem coleção</CollectionName>
                <CollectionMeta>
                  <span>NFT independente</span>
                </CollectionMeta>
              </CollectionItem>

              {collections.map((collection) => (
                <CollectionItem
                  key={collection.collection_id}
                  $selected={selectedCollection?.collection_id === collection.collection_id}
                  onClick={() => handleSelectCollection(collection)}
                >
                  <CollectionName>{collection.name}</CollectionName>
                  <CollectionMeta>
                    <span>{collection.nfts_count || 0} NFTs</span>
                    <span>•</span>
                    <span>Floor: {collection.floor_price || '0'} ETH</span>
                  </CollectionMeta>
                </CollectionItem>
              ))}
            </CollectionList>

            <Button 
              onClick={handleConfirmSelection}
              style={{ marginTop: '20px' }}
            >
              Confirmar Seleção
            </Button>
          </>
        ) : (
          <Form onSubmit={handleCreateCollection}>
            {success && (
              <SuccessMessage>
                ✅ Coleção criada com sucesso!
              </SuccessMessage>
            )}

            <InputGroup>
              <Label htmlFor="name">Nome da Coleção *</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Cyberpunk Dreams"
                required
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
                placeholder="Descreva sua coleção..."
                disabled={loading}
              />
            </InputGroup>

            <InputGroup>
              <Label>Banner da Coleção</Label>
              <DropZone onClick={onPickBanner} onDrop={onDrop} onDragOver={onDragOver}>
                {bannerPreview ? (
                  <BannerPreview>
                    <img src={bannerPreview} alt="Pré-visualização do banner" />
                  </BannerPreview>
                ) : (
                  <>
                    <DropHint>Arraste e solte uma imagem aqui, ou clique para selecionar</DropHint>
                    <Hint>Tamanho recomendado: 1600 x 520 px • Formatos: JPG, PNG, WEBP • Máx: 8MB</Hint>
                  </>
                )}
                <input id="banner-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />
              </DropZone>

              <Hint style={{ marginTop: 8 }}>Ou informe uma URL (opcional)</Hint>
              <Input
                type="text"
                id="banner_image"
                name="banner_image"
                value={formData.banner_image}
                onChange={handleChange}
                placeholder="https://..."
                disabled={loading}
              />
            </InputGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <Button type="submit" disabled={loading || !formData.name}>
              {loading ? 'Criando...' : 'Criar Coleção'}
            </Button>
          </Form>
        )}
      </ModalContent>
    </ModalOverlay>
  );
}

export default CollectionModal;
