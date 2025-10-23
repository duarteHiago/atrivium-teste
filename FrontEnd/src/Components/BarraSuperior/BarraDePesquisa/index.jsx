import styled from 'styled-components';

const BarraDePesquisaContainer = styled.div`
   display: flex;
   align-items: center;
   width: 300px; /* Ocupa todo o espaço disponível */
   margin-left: 15px;
   padding: 0 10px;
   background-color: rgba(255, 255, 255, 0.1);
   border-radius: 5px;
   
   input {
       width: 100%; /* Input ocupa todo o espaço do container */
       border: none;
       outline: none;
       background: transparent;
       color: white;
       padding: 8px 12px;
       border-radius: 5px;
       &::placeholder {
           color: rgba(255, 255, 255, 0.5);
       }
   }
`;

const BarraDePesquisa = () => {
    return (
        <BarraDePesquisaContainer>
            <input type="text" placeholder="Pesquisar..." />
        </BarraDePesquisaContainer>
    );
}

export default BarraDePesquisa;