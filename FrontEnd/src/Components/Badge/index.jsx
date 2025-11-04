/**
 * Badge para indicar origem dos NFTs (IPFS/regular)
 */

import styled from 'styled-components';

const BadgeContainer = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: ${props => props.variant === 'ipfs' ? 
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
    'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
  };
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 2;

  @media (max-width: 768px) {
    font-size: 0.65rem;
    padding: 3px 6px;
  }
`;

const Badge = ({ variant, children }) => {
  if (!variant) return null;
  
  return (
    <BadgeContainer variant={variant}>
      {variant === 'ipfs' && '🌐'}
      {variant === 'regular' && '⚡'}
      {children}
    </BadgeContainer>
  );
};

export default Badge;