import { useState, useRef, useEffect } from 'react'
import './App.css'
import styled from 'styled-components'
import BarraSuperior from './Components/BarraSuperior';
import BarraLateral from './Components/BarraLateral';
import Cms from './Components/Cms/Cms';
import { Routes, Route, useNavigate } from 'react-router-dom';

// 1. Importe os novos componentes
import Modal from './Components/Modal/Modal';
import AuthModal from './Components/AuthModal/AuthModal';
import WalletModal from './Components/WalletModal/WalletModal';
import ProfileDropdown from './Components/ProfileDropdown/ProfileDropdown';
import CreateNFT from './Components/CreateNFT/CreateNFT';
import NftGallery from './Components/NftGallery/NftGallery';

// 2. ATUALIZE OS ESTILOS PARA O EFEITO DE BLUR
// Adiciona 'filter' e 'transition' quando um modal está aberto
const PageContainer = styled.div`
  filter: ${props => props.$isModalOpen ? 'blur(4px)' : 'none'};
  transition: filter 0.2s ease-out;
`;

const MainContent = styled.main`
  padding-top: 80px;
  transition: padding-left 0.3s ease-in-out;
  padding-left: ${props => props.$isSidebarOpen ? '260px' : '0'};
`;

// ... (Componentes de Layout: HeroSection, Section, NftCard, etc...)
const HeroSection = styled.section`
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const HeroPlaceholder = styled.div`
  height: 400px;
  width: 100%;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 1.5em;
  font-weight: 500;
`;

const Section = styled.section`
  padding: 32px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.5em;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 20px;
`;

const CardRow = styled.div`
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 15px;

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const NftCard = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background-color: rgba(30, 30, 31, 1);
  min-width: 280px;
  max-width: 280px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  }`

const CardImagePlaceholder = styled.div`
  width: 100%;
  height: 250px;
  background-color: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const CardImage = styled.img`
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const CardInfo = styled.div`
  padding: 16px;
`;

const CardTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 1.1em;
  font-weight: 600;
  color: white;
`;

const CardDescription = styled.p`
  margin: 0;
  font-size: 0.9em;
  color: rgba(255, 255, 255, 0.6);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PlaceholderText = styled.div`
  background-color: rgba(255, 255, 255, 0.2);
  height: ${props => props.height || '20px'};
  border-radius: 4px;
  margin-bottom: 10px;
  width: ${props => props.width || '80%'};
`;


function App() {

  // --- NOVOS ESTADOS GLOBAIS ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Estamos logados?
  const [isAdmin, setIsAdmin] = useState(false); // FLAG simples enquanto não há sistema de usuários
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // Modal de autenticação
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false); // Modal de carteira
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false); // Menu do perfil
  const [recentNfts, setRecentNfts] = useState([]);
  const [loadingNfts, setLoadingNfts] = useState(true);
  
  const menuRef = useRef(null);
  const sidebarRef = useRef(null);
  
  // Variável para o efeito de blur
  const isAnyModalOpen = isLoginModalOpen || isWalletModalOpen;

  // --- NOVAS FUNÇÕES HANDLER ---

  const toggleSidebar = () => {
    closeAllModals()
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const closeAllModals = () => {
    setIsLoginModalOpen(false);
    setIsWalletModalOpen(false);
    setIsProfileDropdownOpen(false);
  }
  
  // Lógica do botão de Perfil
  const handleProfileClick = () => {
    closeAllModals()
    if (isLoggedIn) {
      setIsProfileDropdownOpen(!isProfileDropdownOpen); // Abre o dropdown
    } else {
      setIsLoginModalOpen(true); // Abre o modal de login
    }
  };

  // Lógica do botão de Carteira
  const handleWalletClick = () => {
    closeAllModals()
    setIsWalletModalOpen(true); // Abre o modal de carteira
  };
  
  // Lógica de Login (simulada)
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setIsLoginModalOpen(false)
  };
  
  // Lógica de Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsProfileDropdownOpen(false);
  };

  // Router navigation (usado por openCms)
  const navigate = useNavigate();

  // Função para abrir a rota /admin — só navega se for admin
  const openCms = () => {
    closeAllModals();
    if (isAdmin) navigate('/admin');
  }

  // Função para fechar CMS — volta para a raiz
  const closeCms = () => {
    navigate('/');
  }

  // Função para ir para a home (página principal)
  const goHome = () => {
    closeAllModals();
    navigate('/');
  }

  // Lógica para fechar a sidebar
  useEffect(() => {
    if (!isSidebarOpen) return;
    const onDocClick = (e) => {
      const target = e.target;
      const insideMenu = menuRef.current && menuRef.current.contains(target);
      const insideSidebar = sidebarRef.current && sidebarRef.current.contains(target);
      if (!insideMenu && !insideSidebar) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [isSidebarOpen]);

  // Buscar NFTs recentes do backend
  useEffect(() => {
    const fetchRecentNfts = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/leonardo/list');
        const data = await response.json();
        if (data.success) {
          // Pegar apenas os 5 mais recentes
          setRecentNfts(data.nfts.slice(0, 5));
        }
      } catch (error) {
        console.error('Erro ao buscar NFTs recentes:', error);
      } finally {
        setLoadingNfts(false);
      }
    };
    
    fetchRecentNfts();
  }, []);

  const placeholderItems = [1, 2, 3, 4, 5];

  return (
    <>
      {/* 3. Renderiza os Modais (eles ficam escondidos por padrão) */}
      <Modal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)}> {/* ADICIONE ESTE BLOCO */}
        <AuthModal onAuthSuccess={handleLoginSuccess} />
      </Modal>

      <Modal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)}>
        <WalletModal />
      </Modal>
      
      {/* O Dropdown do Perfil (não usa o Modal, é um menu simples) */}
      {isLoggedIn && isProfileDropdownOpen && (
        <ProfileDropdown onLogout={handleLogout} />
      )}
      
      {/* 4. Aplica o blur no container da página */}
      <PageContainer $isModalOpen={isAnyModalOpen}>
        <BarraSuperior 
          onMenuClick={toggleSidebar} 
          $isOpen={isSidebarOpen}
          menuRef={menuRef}
          isLoggedIn={isLoggedIn}
          onWalletClick={handleWalletClick}
          onProfileClick={handleProfileClick}
          isAdmin={isAdmin}
          setIsAdmin={setIsAdmin}
        />
        <BarraLateral $isOpen={isSidebarOpen} sidebarRef={sidebarRef} onOpenCms={openCms} isAdmin={isAdmin} onGoHome={goHome} />

        <MainContent $isSidebarOpen={isSidebarOpen}>
          <Routes>
            <Route path="/admin" element={<Cms onClose={closeCms} />} />
            <Route path="/create-nft" element={<CreateNFT />} />
            <Route path="/gallery" element={<NftGallery />} />
            <Route path="/" element={(
              <>
                {/* ... (Todo o seu conteúdo da página Discover) ... */}
                <HeroSection>
                  <HeroPlaceholder>NFTs em Destaque (Carrossel)</HeroPlaceholder>
                </HeroSection>
                <Section>
                  <SectionTitle>Coleções em Destaque</SectionTitle>
                  <CardRow>
                    {placeholderItems.map((item) => (
                      <NftCard key={item}>
                        <CardImagePlaceholder />
                        <CardInfo>
                          <PlaceholderText width="60%" />
                          <PlaceholderText width="40%" height="16px" />
                        </CardInfo>
                      </NftCard>
                    ))}
                  </CardRow>
                </Section>
                <Section>
                  <SectionTitle>🎨 NFTs Gerados Recentemente</SectionTitle>
                  <CardRow>
                    {loadingNfts ? (
                      // Mostra placeholders enquanto carrega
                      placeholderItems.map((item) => (
                        <NftCard key={item}>
                          <CardImagePlaceholder />
                          <CardInfo>
                            <PlaceholderText width="60%" />
                            <PlaceholderText width="40%" height="16px" />
                          </CardInfo>
                        </NftCard>
                      ))
                    ) : recentNfts.length > 0 ? (
                      // Mostra os NFTs reais
                      recentNfts.map((nft) => (
                        <NftCard key={nft.nft_id}>
                          <CardImage src={nft.image_url} alt={nft.name || 'NFT'} />
                          <CardInfo>
                            <CardTitle>{nft.name || 'NFT sem nome'}</CardTitle>
                            <CardDescription>
                              {nft.description || nft.prompt || 'Gerado com IA'}
                            </CardDescription>
                          </CardInfo>
                        </NftCard>
                      ))
                    ) : (
                      // Mostra cards vazios quando não tem NFTs
                      placeholderItems.map((item) => (
                        <NftCard key={item}>
                          <CardImagePlaceholder />
                          <CardInfo>
                            <PlaceholderText width="60%" />
                            <PlaceholderText width="40%" height="16px" />
                          </CardInfo>
                        </NftCard>
                      ))
                    )}
                  </CardRow>
                </Section>
                <Section>
                  <SectionTitle>Trending Tokens</SectionTitle>
                   <CardRow>
                    {placeholderItems.map((item) => (
                      <NftCard key={item}>
                        <CardImagePlaceholder />
                        <CardInfo>
                          <PlaceholderText width="60%" />
                          <PlaceholderText width="40%" height="16px" />
                        </CardInfo>
                      </NftCard>
                    ))}
                  </CardRow>
                </Section>
                <Section>
                  <SectionTitle>Featured Drops</SectionTitle>
                   <CardRow>
                    {placeholderItems.map((item) => (
                      <NftCard key={item}>
                        <CardImagePlaceholder />
                        <CardInfo>
                          <PlaceholderText width="60%" />
                          <PlaceholderText width="40%" height="16px" />
                        </CardInfo>
                      </NftCard>
                    ))}
                  </CardRow>
                </Section>
              </>
            )} />
          </Routes>
        </MainContent>
      </PageContainer>
    </>
  )
}

export default App