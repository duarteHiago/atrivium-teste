import styled from 'styled-components';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LogoImg from '../../../assets/logo.png'

const LogoContainer = styled.div`
   display: flex;
   align-items: center;
   padding: 0 18px;
   margin: 0;
   line-height: 0;
   position: relative;
   height: 80px;
   
    a { 
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-decoration: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        transform-origin: center;
        height: 70px; /* Altura um pouco menor que a barra */
        width: 60px; /* Largura fixa para controlar o espaço */
    }
    
    a:hover {
        transform: scale(1.05);
    }
    
    .logo-image {
       width: auto;
       height: 48px; /* Tamanho proporcional às três barras e pesquisa */
       display: block;
       cursor: pointer;
       transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
       filter: drop-shadow(0 2px 6px rgba(76, 175, 80, 0.3));
       margin-bottom: 1px; /* Menos espaço entre logo e texto */
     }
     
     a:hover .logo-image {
         height: 52px; /* Expande proporcionalmente no hover */
         filter: drop-shadow(0 4px 10px rgba(76, 175, 80, 0.6));
    }
    
    .logo-text {
        position: absolute;
        bottom: 6px; /* Próximo ao fundo mas com espaço adequado */
        left: 50%;
        transform: translateX(-50%) scale(0.8);
        font-size: 11px; /* Texto maior */
        font-weight: 700;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        text-align: center;
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        color: #4CAF50;
        white-space: nowrap;
        z-index: 1001;
        pointer-events: none;
        line-height: 1;
    }
    
    a:hover .logo-text {
        opacity: 1;
        transform: translateX(-50%) scale(0.9);
        transition-delay: 0.15s;
    }
    
    /* Efeito de brilho sutil */
    a:hover::before {
        content: '';
        position: absolute;
        top: -10px;
        left: -10px;
        right: -10px;
        bottom: -10px;
        background: radial-gradient(circle, rgba(76, 175, 80, 0.1) 0%, transparent 70%);
        border-radius: 50%;
        z-index: -1;
        opacity: 1;
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
            opacity: 0.3;
        }
        50% {
            transform: scale(1.1);
            opacity: 0.1;
        }
    }
    
    /* Responsividade */
    @media (max-width: 768px) {
        padding: 0 12px;
        
        a {
            width: 50px;
            height: 60px;
        }
        
        .logo-image {
            height: 28px;
        }
        
        a:hover .logo-image {
            height: 30px;
        }
        
        .logo-text {
            font-size: 7px;
            bottom: 2px;
        }
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
                <img src={LogoImg} alt="Artrivium" className="logo-image" />
                <div className="logo-text">ARTRIVIUM</div>
            </Link>
        </LogoContainer>
    );
};

export default Logo;