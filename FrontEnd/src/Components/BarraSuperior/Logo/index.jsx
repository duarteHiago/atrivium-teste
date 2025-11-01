import styled from 'styled-components';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LogoImg from '../../../assets/logo.png'

const LogoContainer = styled.div`
   display: flex;
   align-items: center;
   padding: 0 20px;
   margin: 0;
   line-height: 0; /* Remove espaço extra da linha */
    a { display: inline-flex; align-items: center; text-decoration: none; }
    img {
       width: auto;
       height: 80px;
       display: block; /* Remove espaço extra da imagem */
         cursor: pointer;
         transition: opacity .2s ease;
     }
     img:hover {
         opacity: .9;
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
            </Link>
        </LogoContainer>
    );
};

export default Logo;