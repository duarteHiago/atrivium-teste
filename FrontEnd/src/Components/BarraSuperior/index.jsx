import { useState, useEffect } from 'react'
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

const MenuButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  /* make the button area larger so any click inside the 3-bars area toggles */
  width: 48px;
  height: 44px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;

  /* center the bars and keep pseudo elements inside the button box */
  .bar {
    width: 20px;
    height: 2px;
    background-color: white;
    position: relative;
    transition: width 0.18s ease, background-color 0.18s ease, transform 0.18s ease;
    display: block;
  }
  .bar::before,
  .bar::after {
    content: '';
    position: absolute;
    left: 0;
    width: 20px;
    height: 2px;
    background-color: inherit; /* match the middle bar color */
    transition: width 0.18s ease, transform 0.18s ease;
  }
  .bar::before { transform: translateY(-8px); }
  .bar::after { transform: translateY(8px); }
  `

const BarraSuperior = ({onMenuClick, isOpen, menuRef}) => {
  const [hovered, setHovered] = useState(false);
  // ensure hover state resets when menu is closed (e.g., clicking outside)
  useEffect(() => {
    if (!isOpen) setHovered(false);
  }, [isOpen]);
  // color that matches the logo — adjust or compute if needed
  const activeColor = '#9be3b8';

  return (
    <BarraEstilizada>
      <MenuButton
        ref={menuRef}
        onClick={onMenuClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="menu-button"
      >
        <span
          className="bar"
          style={{
            width: hovered ? 26 : 20,
            backgroundColor: isOpen || hovered ? activeColor : 'white',
          }}
        />
      </MenuButton>
      <div style={{ marginLeft: -14 /* bring logo closer to button */ }}>
        <Logo />
      </div>
      <BarraDePesquisa />
      <Spacer /> {/* Quando criar seus componentes de perfil e carteira */}
    </BarraEstilizada>
  )
}
export default BarraSuperior