import React from 'react';
import styled from 'styled-components';

const LogoContainer = styled.div`
   display: flex;
   align-items: center;
   padding: 0;
   margin: 0;
   line-height: 0; /* Remove espaço extra da linha */
    img {
       max-width: 15%;
       height: auto;
       display: block; /* Remove espaço extra da imagem */
    }
`;

const Logo = () => {

    return (
        <LogoContainer>
            <img src="src/assets/logo.png" alt="Logo" />
        </LogoContainer>
    );
};

export default Logo;