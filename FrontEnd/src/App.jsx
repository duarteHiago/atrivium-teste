import { useState, useRef, useEffect } from 'react'
import './App.css'
import styled, { createGlobalStyle } from 'styled-components'
import { useTheme } from './contexts/ThemeContext'
import BarraSuperior from './Components/BarraSuperior';
import BarraLateral from './Components/BarraLateral';
import Cms from './Components/Cms/Cms';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

// 1. Importe os novos componentes
import Modal from './Components/Modal/Modal';
import AuthModal from './Components/AuthModal/AuthModal';
import WalletModal from './Components/WalletModal/WalletModal';
import ProfileDropdown from './Components/ProfileDropdown/ProfileDropdown';
import CreateNFT from './Components/CreateNFT/CreateNFT';
import NftGallery from './Components/NftGallery/NftGallery';
import CollectionBanner from './Components/CollectionBanner/CollectionBanner';
import CollectionCarousel from './Components/CollectionBanner/CollectionCarousel';
import Profile from './Components/User/Profile';
import Settings from './Components/User/Settings';
import Collections from './Components/Collections/Collections';
import CollectionDetail from './Components/Collections/CollectionDetail';
import Marketplace from './Components/Marketplace/Marketplace';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';
import NftDetail from './Components/NftDetail/NftDetail';
import FavoriteButton from './Components/FavoriteButton/FavoriteButton';
import PublicProfile from './Components/User/PublicProfile';
import { API_BASE } from './config/api';
import Activity from './Components/Activity/Activity';

// Global Styles for Theme
const GlobalStyle = createGlobalStyle`
  body {
    background: ${props => props.theme.background.primary};
    color: ${props => props.theme.text.primary};
    transition: background 0.3s ease, color 0.3s ease;
  }
`;

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
  overflow: visible; /* Permite que a animação ultrapasse os limites */
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
  padding-top: 20px; /* Espaço para a animação não ser cortada */

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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  transform-style: preserve-3d;
  perspective: 1000px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(102, 126, 234, 0.1) 0%,
      rgba(118, 75, 162, 0.1) 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: 12px;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-12px) rotateX(5deg) scale(1.02);
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.4),
      0 0 20px rgba(102, 126, 234, 0.3);
    border-color: rgba(102, 126, 234, 0.5);
  }

  &:hover::before {
    opacity: 1;
  }

  &:active {
    transform: translateY(-8px) rotateX(2deg) scale(1.01);
  }
`

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

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
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

  const { theme } = useTheme();

  // --- NOVOS ESTADOS GLOBAIS ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Estamos logados?
  const [isAdmin, setIsAdmin] = useState(false); // FLAG simples enquanto não há sistema de usuários
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // Modal de autenticação
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false); // Modal de carteira
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false); // Menu do perfil
  const [recentNfts, setRecentNfts] = useState([]);
  const [loadingNfts, setLoadingNfts] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Key para forçar refresh
  
  const menuRef = useRef(null);
  const sidebarRef = useRef(null);
  const location = useLocation();
  
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
    closeAllModals();
    if (isLoggedIn) {
      setIsProfileDropdownOpen(v => !v); // volta a exibir menu suspenso
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
    // Ajusta isAdmin com base na role do usuário salva no localStorage
    try {
      const role = localStorage.getItem('role');
      setIsAdmin(role === 'admin');
    } catch {
      /* ignore */
    }
    setIsLoginModalOpen(false);
    
    // Se estiver na página Discover, recarregar NFTs
    if (location.pathname === '/') {
      setRefreshKey(prev => prev + 1);
    }
  };
  
  // Lógica de Logout
  const handleLogout = () => {
    // Limpar dados do localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    
    setIsLoggedIn(false);
    setIsAdmin(false);
    setIsProfileDropdownOpen(false);
    
    // Recarregar a página atual para limpar dados do usuário
    setRefreshKey(prev => prev + 1);
    
    // Redirecionar para home
    navigate('/');
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

  // Inicializa estado de login/admin baseado no localStorage (melhor UX)
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (token) {
          setIsLoggedIn(true);
          setIsAdmin(role === 'admin');
        } else {
          setIsLoggedIn(false);
          setIsAdmin(false);
        }
      } catch {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    };
    
    checkAuth();
  }, []);

  // Buscar NFTs recentes do backend
  useEffect(() => {
    const fetchRecentNfts = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/leonardo/list`);
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
  }, [refreshKey]); // Recarrega quando refreshKey muda

  // Detectar quando voltar para a página Discover (/)
  useEffect(() => {
    if (location.pathname === '/') {
      // Forçar refresh dos NFTs
      setLoadingNfts(true);
      setRefreshKey(prev => prev + 1);
    }
  }, [location.pathname]);

  const placeholderItems = [1, 2, 3, 4, 5];

  return (
    <>
      <GlobalStyle theme={theme} />
      
      {/* 3. Renderiza os Modais (eles ficam escondidos por padrão) */}
      <Modal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)}> {/* ADICIONE ESTE BLOCO */}
        <AuthModal onAuthSuccess={handleLoginSuccess} />
      </Modal>

      <Modal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)}>
        <WalletModal />
      </Modal>
      
      {/* O Dropdown do Perfil (não usa o Modal, é um menu simples) */}
      {isLoggedIn && isProfileDropdownOpen && (
        <ProfileDropdown 
          onLogout={handleLogout}
          onGoProfile={() => { setIsProfileDropdownOpen(false); navigate('/profile'); }}
          onGoSettings={() => { setIsProfileDropdownOpen(false); navigate('/settings'); }}
          onClose={() => setIsProfileDropdownOpen(false)}
        />
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
            <Route path="/profile" element={
              <ProtectedRoute requireAuth={true} onRequireLogin={() => setIsLoginModalOpen(true)}>
                <Profile onRequireLogin={() => setIsLoginModalOpen(true)} />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute requireAuth={true} onRequireLogin={() => setIsLoginModalOpen(true)}>
                <Settings onRequireLogin={() => setIsLoginModalOpen(true)} />
              </ProtectedRoute>
            } />
            <Route path="/users/:id" element={<PublicProfile />} />
            <Route path="/create-nft" element={<CreateNFT />} />
            <Route path="/gallery" element={<NftGallery />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/collections" element={
              <ProtectedRoute requireAuth={true} onRequireLogin={() => setIsLoginModalOpen(true)}>
                <Collections />
              </ProtectedRoute>
            } />
            <Route path="/activity" element={
              <ProtectedRoute requireAuth={true} onRequireLogin={() => setIsLoginModalOpen(true)}>
                <Activity />
              </ProtectedRoute>
            } />
            <Route path="/collections/:id" element={<CollectionDetail />} />
            <Route path="/nft/:id" element={<NftDetail />} />
            <Route path="/" element={(
              <>
                {/* ... (Todo o seu conteúdo da página Discover) ... */}
                <HeroSection>
                  <CollectionCarousel />
                </HeroSection>
                {/* Coleções em Destaque removido. NFTs Gerados Recentemente agora é a primeira seção. */}
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
                        <NftCard key={nft.nft_id} onClick={(e) => {
                          // Evita navegação se clicar no botão de favorito
                          if (e.target.closest('button')) return;
                          navigate(`/nft/${nft.nft_id}`);
                        }}>
                          <CardImage src={nft.image_url} alt={nft.name || 'NFT'} />
                          <CardInfo>
                            <CardTitle>{nft.name || 'NFT sem nome'}</CardTitle>
                            <CardDescription>
                              {nft.description || nft.prompt || 'Gerado com IA'}
                            </CardDescription>
                            <CardFooter>
                              <div style={{ fontSize: '0.85em', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '2px' }}
                                onClick={(e) => { e.stopPropagation(); navigate(`/users/${nft.creator_id}`); }}>
                                Por {nft.creator_name || 'Desconhecido'}
                              </div>
                              <div onClick={(e) => e.stopPropagation()}>
                                <FavoriteButton 
                                  nftId={nft.nft_id}
                                  initialCount={nft.favorites_count || 0}
                                  initialIsFavorited={nft.is_favorited || false}
                                  showCount={true}
                                  compact={true}
                                />
                              </div>
                            </CardFooter>
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