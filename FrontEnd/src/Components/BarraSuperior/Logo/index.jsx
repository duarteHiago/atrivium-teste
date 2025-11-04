import styled from 'styled-components';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LogoImg from '../../../assets/logo.png'

const LogoContainer = styled.div`
   display: flex;
   align-items: center;
   justify-content: center;
   padding: 0 20px;
   margin: 0;
   line-height: 0; /* Remove espaço extra da linha */
    a { 
      display: inline-flex; 
      flex-direction: column;
      align-items: center; 
      text-decoration: none;
      perspective: 1000px; /* Adiciona perspectiva 3D */
      gap: 4px;
      position: relative;
    }
    img {
       width: auto;
       height: 44px; /* Ajustado para ficar proporcional ao menu hamburguer (48px) e barra de pesquisa */
       display: block; /* Remove espaço extra da imagem */
       cursor: pointer;
       transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
       filter: drop-shadow(0 0 8px rgba(102, 126, 234, 0.4)) 
               drop-shadow(0 0 15px rgba(102, 126, 234, 0.2));
       transform-style: preserve-3d;
     }
     img:hover {
         opacity: 1;
         transform: scale(1.12) translateZ(20px);
         filter: drop-shadow(0 0 12px rgba(102, 126, 234, 0.6)) 
                 drop-shadow(0 0 25px rgba(102, 126, 234, 0.4))
                 drop-shadow(0 0 35px rgba(118, 75, 162, 0.3));
    }
`;

const LogoText = styled.span`
  font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #ffffff;
  opacity: 0;
  transform: translateY(-8px);
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: absolute;
  top: 100%;
  margin-top: 2px;
  white-space: nowrap;
  text-shadow: 
    0 0 10px rgba(102, 126, 234, 0.8),
    0 0 20px rgba(102, 126, 234, 0.6),
    0 0 30px rgba(118, 75, 162, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.5);
  
  ${LogoContainer} a:hover & {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Logo = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleClick = (e) => {
        e.preventDefault();
        if (location.pathname === '/') {
            // Já está na Discover: apenas rola para o topo
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Vai para a Discover e garante rolagem ao topo após navegar
            navigate('/');
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'auto' }), 0);
        }
    };

    return (
        <LogoContainer>
            <Link to="/" onClick={handleClick} aria-label="Ir para Discover">
                <img src={LogoImg} alt="Atrivium" />
                <LogoText>Artrivium</LogoText>
            </Link>
        </LogoContainer>
    );
};

export default Logo;