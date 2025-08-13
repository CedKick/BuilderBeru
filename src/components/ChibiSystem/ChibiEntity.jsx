// src/components/ChibiSystem/ChibiEntity.jsx
import React, { useEffect, useState, useRef } from 'react';
import { CHIBI_DATABASE, RARITY_COLORS } from './ChibiData';

const ChibiEntity = ({ chibiId, position, onClick }) => {
  const [currentPos, setCurrentPos] = useState(position || { x: 500, y: 300 });
  const [isMoving, setIsMoving] = useState(false);
  const entityRef = useRef(null);
  
  // Récupérer les données du chibi
  const chibiData = CHIBI_DATABASE[chibiId] || {
    name: 'Unknown',
    sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414699/beru_face_w2rdyn.png',
    rarity: 'Commun'
  };

  // Mise à jour de la position quand elle change
  useEffect(() => {
    if (position && position.x && position.y) {
      setCurrentPos(position);
    }
  }, [position]);

// Dans ChibiEntity.jsx, améliore les limites de mouvement
useEffect(() => {
  if (!currentPos) return;
  
  const moveRandomly = () => {
    // Limites plus strictes pour éviter de sortir
    const newX = currentPos.x + (Math.random() - 0.5) * 80;
    const newY = currentPos.y + (Math.random() - 0.5) * 40;
    
    setIsMoving(true);
    setCurrentPos(prev => ({
      x: Math.max(100, Math.min(1100, newX)), // Marges plus grandes
      y: Math.max(100, Math.min(500, newY))    // Éviter le haut
    }));
    
    setTimeout(() => setIsMoving(false), 800);
  };
  
  const interval = setInterval(moveRandomly, 4000 + Math.random() * 4000);
  return () => clearInterval(interval);
}, []);

  // Handler de clic avec position réelle
  const handleClick = () => {
    if (entityRef.current && onClick) {
      const rect = entityRef.current.getBoundingClientRect();
      const realPosition = {
        x: rect.left + rect.width / 2,
        y: rect.top - 50 // Au-dessus de la tête
      };
      onClick(realPosition);
    }
  };

  return (
    <div
      ref={entityRef}
      className="chibi-entity"
      style={{
        position: 'absolute',
        left: `${currentPos.x}px`,
        top: `${currentPos.y}px`,
        transition: isMoving ? 'all 0.8s ease-in-out' : 'none'
      }}
      onClick={handleClick}
    >
      {/* Aura de rareté */}
      <div 
        className="chibi-aura"
        style={{
          position: 'absolute',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${RARITY_COLORS[chibiData.rarity]}40 0%, transparent 70%)`,
          top: '-10px',
          left: '-10px',
          animation: 'pulse 2s infinite'
        }}
      />
      
      {/* Sprite du chibi */}
      <img 
        src={chibiData.sprite}
        alt={chibiData.name}
        className="chibi-sprite"
        style={{
          width: '60px',
          height: '60px',
          filter: `drop-shadow(0 0 10px ${RARITY_COLORS[chibiData.rarity]})`,
          position: 'relative',
          zIndex: 2,
          cursor: 'pointer'
        }}
      />
      
      {/* Nom du chibi */}
      <div className="chibi-name" style={{
        position: 'absolute',
        bottom: '-20px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '10px',
        fontWeight: 'bold',
        color: RARITY_COLORS[chibiData.rarity],
        whiteSpace: 'nowrap',
        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
        pointerEvents: 'none'
      }}>
        {chibiData.name}
      </div>
    </div>
  );
};

export default ChibiEntity;