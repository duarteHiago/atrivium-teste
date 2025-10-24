import React from 'react';
import styled from 'styled-components';

// O fundo escuro/borrado
const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px); /* O efeito de "borrado" */
  z-index: 1900; /* Abaixo do modal, acima de tudo */
`;

// O container do modal em si
const ModalContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(28, 28, 30, 0.85); /* Cor escura do modal */
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  z-index: 2000; /* Acima do backdrop */
  min-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  overflow-x: hidden;
`;

// Botão 'X' para fechar
const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
  z-index: 10;
`;

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <>
      <Backdrop onClick={onClose} />
      <ModalContainer>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        {children}
      </ModalContainer>
    </>
  );
};

export default Modal;