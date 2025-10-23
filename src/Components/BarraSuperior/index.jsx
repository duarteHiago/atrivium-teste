import React from 'react'
import styled from 'styled-components'
import Logo from './Logo'
import BarraDePesquisa from './BarraDePesquisa'

const BarraEstilizada = styled.header`
   position: fixed;
   top: 0;  
   left: 0;
   right: 0;
   height: 80px;
   background-color: rgba(20, 20, 21, 1);
   display: flex;
   align-items: center;
   padding: 0;
   margin: 0;
   box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
   z-index: 1000;
   gap: 0;
`
const Spacer = styled.div`
  flex-grow: 1;
`

const BarraSuperior = () => {
  return (
    <BarraEstilizada>
      <Logo />
      <BarraDePesquisa />
      <Spacer /> {/* Quando criar seus componentes de perfil e carteira */}
    </BarraEstilizada>
  )
}
export default BarraSuperior