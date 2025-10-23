import styled from 'styled-components';
import LogoImg from '../../../assets/logo.png'

const LogoContainer = styled.div`
   display: flex;
   align-items: center;
   padding: 0 20px;
   margin: 0;
   line-height: 0; /* Remove espaço extra da linha */
    img {
       width: auto;
       height: 80px;
       display: block; /* Remove espaço extra da imagem */
    }
`;

const Logo = () => {

    return (
        <LogoContainer>
            <img src={LogoImg} alt="Logo" />
        </LogoContainer>
    );
};

export default Logo;