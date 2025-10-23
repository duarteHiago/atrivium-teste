import { useState, useRef, useEffect } from 'react'
import './App.css'
import styled from 'styled-components'
import BarraSuperior from './Components/BarraSuperior';
import BarraLateral from './Components/BarraLateral';

const MainContent = styled.main`
padding-top: 80px;
padding-left: 20px;
`;

function App() {

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const menuRef = useRef(null);
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  }

  // Close sidebar when clicking outside menu button and sidebar
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

  return (
    <>
      {/* 4. Passe a função para a BarraSuperior */}
  <BarraSuperior onMenuClick={toggleSidebar} isOpen={isSidebarOpen} menuRef={menuRef} />

      {/* 5. Passe o estado para a BarraLateral */}
  <BarraLateral isOpen={isSidebarOpen} sidebarRef={sidebarRef} />

      {/* 6. Envolva seu conteúdo para estilização */}
      <MainContent isSidebarOpen={isSidebarOpen}>
        <h1>Welcome to Artrivium NFT</h1>
        {/* O resto do seu site virá aqui */}
      </MainContent>
    </>
  )
}

export default App
