import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../config/api';

const CarouselWrap = styled.div`
  position: relative; height: 520px; border-radius: 16px; overflow: hidden; background: rgba(255,255,255,0.02);
`;

const Track = styled.div`
  display: flex; height: 100%; width: 100%; transition: transform .6s ease-in-out;
  transform: translateX(${p => `-${p.$index * 100}%`});
`;

const Slide = styled.div`
  position: relative; flex: 0 0 100%; height: 100%;
  cursor: pointer;
  transition: opacity 0.3s ease;
  
  &:hover {
    opacity: 0.95;
  }
`;

const Banner = styled.div`
  position: absolute; inset: 0; background: ${p => p.$img ? `url(${p.$img}) center/cover no-repeat` : 'linear-gradient(135deg,#667eea,#764ba2)'};
  filter: brightness(.72);
`;

const Gradient = styled.div`
  position: absolute; inset: 0; background: linear-gradient(180deg,rgba(0,0,0,.15) 0%, rgba(0,0,0,.7) 100%);
`;

const Content = styled.div`
  position: relative; z-index: 2; height: 100%; padding: 40px; display: flex; flex-direction: column; justify-content: flex-end;
`;

const Info = styled.div`
  display: flex; flex-direction: column; gap: 8px; max-width: 65%;
`;

const Title = styled.h2`
  margin: 0; font-size: 2.4rem; color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,.5); line-height: 1.2;
`;

const Desc = styled.p`
  margin: 0; color: rgba(255,255,255,.85); font-size: 0.95rem;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
`;

const StatsBox = styled.div`
  margin-top: 16px; margin-bottom: 75px; display: inline-flex; gap: 0; 
  background: rgba(0,0,0,.4); backdrop-filter: blur(10px);
  border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,.1);
  width: fit-content;
`;

const StatItem = styled.div`
  padding: 12px 20px; display: flex; flex-direction: column; gap: 4px;
  border-right: 1px solid rgba(255,255,255,.1);
  &:last-child { border-right: none; }
  
  span { 
    display: block; font-size: .7rem; opacity: .7; 
    text-transform: uppercase; letter-spacing: .5px; color: rgba(255,255,255,.8);
  }
  b { 
    display: block; font-size: 1rem; font-weight: 600; color: #fff;
  }
`;

const RightThumbs = styled.div`
  position: absolute; right: 28px; bottom: 24px; display: flex; gap: 14px; z-index: 3;
`;

const Thumb = styled.div`
  width: 80px; height: 80px; border-radius: 12px; overflow: hidden; border: 3px solid rgba(255,255,255,.4);
  box-shadow: 0 4px 12px rgba(0,0,0,.3);
  cursor: pointer; transition: all .3s ease;
  
  &:hover {
    transform: scale(1.08);
    border-color: rgba(255,255,255,.75);
    box-shadow: 0 6px 20px rgba(0,0,0,.5);
  }
  
  img { width:100%; height:100%; object-fit: cover; transition: filter .3s ease; }
  
  &:hover img {
    filter: brightness(1.15);
  }
`;

const Dots = styled.div`
  position: absolute; bottom: 16px; left: 0; right: 0; display: flex; justify-content: center; gap: 6px; z-index: 4;
`;

const Dot = styled.button`
  width: ${p => p.$active ? 32 : 20}px; 
  height: 2.5px !important; 
  border-radius: 2px; 
  border: none; 
  cursor: pointer;
  background: ${p => p.$active ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.25)'};
  transition: all .25s ease;
  padding: 0;
  
  &:hover {
    background: rgba(255,255,255,.65);
    height: 3px !important;
  }
`;

const TrendBox = styled.div`
  position: absolute;
  top: 16px; /* deslocado um pouco para baixo; mantém respiro até o badge */
  right: 24px; /* mesmo right do badge para bordas alinhadas */
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 12px;
  z-index: 4; /* acima do badge */
  box-shadow: 0 2px 10px rgba(0,0,0,0.25);
`;

const TrendLabel = styled.span`
  font-size: 0.65rem;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.85);
`;

const TrendText = styled.span`
  font-size: 0.8rem;
  font-weight: 700;
  color: ${p => (p.$positive ? '#22c55e' : '#ef4444')};
  opacity: .9;
`;

export default function CollectionCarousel(){
  const navigate = useNavigate();
  const [items, setItems] = useState([]); // [{collection, previews}]
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    let stop = false;
    async function load(){
      try {
        const res = await fetch(`${API_BASE}/api/collections/featured-list`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erro ao carregar destaques');
        const collections = data.collections || [];
        const previews = data.previews || {};
        const spark = data.spark || {};
        const growth = data.growth || {};
        const normalized = collections.map(c => ({ 
          collection: c, 
          previews: previews[c.collection_id] || [],
          spark: spark[c.collection_id] || [],
          growth: typeof growth[c.collection_id] === 'number' ? growth[c.collection_id] : null
        }));
        if (!stop) setItems(normalized);
      } catch(e) { console.error(e); }
    }
    load();
    return () => { stop = true; }
  }, []);

  // Auto-play
  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % items.length), 6000);
    return () => clearInterval(t);
  }, [items.length]);

  const go = (i) => setIdx(i);

  const buildPath = (values = [], width = 120, height = 40) => {
    if (!values || values.length === 0) return '';
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = Math.max(max - min, 1);
    const stepX = width / Math.max(values.length - 1, 1);
    return values.map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / span) * height; // invertido
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');
  };

  if (items.length === 0) return <CarouselWrap />;

  return (
    <CarouselWrap>
      <Track $index={idx}>
        {items.map((it) => (
          <Slide key={it.collection.collection_id} onClick={() => navigate(`/collections/${it.collection.collection_id}`)}>
            <Banner $img={it.collection.banner_image} />
            {it.collection.total_favorites > 0 && (
              <FavoriteBadge>
                <span>❤️</span> {it.collection.total_favorites}
              </FavoriteBadge>
            )}
            {it.spark && it.spark.length > 1 && (
              <TrendBox>
                <TrendLabel>trend</TrendLabel>
                <svg width="56" height="18" viewBox="0 0 56 18">
                  <path 
                    d={buildPath(it.spark, 56, 18)} 
                    fill="none" 
                    stroke={
                      it.growth >= 40 ? '#10b981' :    // Verde escuro: crescimento máximo (≥40%)
                      it.growth >= 20 ? '#22c55e' :    // Verde: crescimento alto
                      it.growth >= 0 ? '#84cc16' :     // Verde claro: crescimento positivo
                      it.growth >= -10 ? '#f59e0b' :   // Laranja: queda moderada
                      '#ef4444'                         // Vermelho: queda acentuada
                    }
                    strokeWidth="1.6" 
                    strokeLinecap="round" 
                  />
                </svg>
                {typeof it.growth === 'number' && (
                  <TrendText $positive={it.growth >= 0}>
                    {it.growth >= 0 ? '↑ ' : '↓ '}{it.growth >= 0 ? '+' : ''}{it.growth.toFixed(1)}%
                  </TrendText>
                )}
              </TrendBox>
            )}
            <Gradient />
            <Content>
              <Info>
                <Title>{it.collection.name}</Title>
                {it.collection.description && (<Desc title={it.collection.description}>{it.collection.description}</Desc>)}
                <StatsBox>
                  <StatItem>
                    <span>FLOOR PRICE</span>
                    <b>{parseFloat(it.collection.floor_price || 0).toFixed(2)} ETH</b>
                  </StatItem>
                  <StatItem>
                    <span>ITEMS</span>
                    <b>{it.collection.nfts_count || 0}</b>
                  </StatItem>
                  <StatItem>
                    <span>TOTAL VOLUME</span>
                    <b>{parseFloat(it.collection.total_volume || 0).toFixed(2)} ETH</b>
                  </StatItem>
                  <StatItem>
                    <span>LISTED</span>
                    <b>1.2%</b>
                  </StatItem>
                </StatsBox>
              </Info>
            </Content>
            <RightThumbs>
              {it.previews.map(n => (
                <Thumb 
                  key={n.nft_id} 
                  onClick={(e) => {
                    e.stopPropagation(); // Evita clicar no slide inteiro
                    navigate(`/nft/${n.nft_id}`);
                  }}
                >
                  <img src={n.image_url} alt={n.name || 'nft'} />
                </Thumb>
              ))}
            </RightThumbs>
          </Slide>
        ))}
      </Track>
      <Dots>
        {items.map((_, i) => (
          <Dot key={i} $active={i===idx} onClick={() => go(i)} />
        ))}
      </Dots>
    </CarouselWrap>
  )
}

const FavoriteBadge = styled.div`
  position: absolute;
  top: 50px; /* desce na mesma proporção do TrendBox para manter o respiro */
  right: 24px;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  gap: 6px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  z-index: 3;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.65);
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(255, 75, 100, 0.3);
  }
  
  span {
    color: #ff4b64;
    font-size: 1.1rem;
  }
`;
