// src/components/ChibiSystem/ChibiEntity.jsx
import React, { useEffect, useState } from 'react';
import { CHIBI_DATABASE, RARITY_COLORS } from './ChibiData';

const ChibiEntity = ({ chibiId, position, onClick }) => {
  const [currentPos, setCurrentPos] = useState(position || { x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  
  // Récupérer les données du chibi
  const chibiData = CHIBI_DATABASE[chibiId] || {
    name: 'Unknown',
    sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414699/beru_face_w2rdyn.png',
    rarity: 'Commun',
    messages: ["..."]
  };

  // Animation de mouvement aléatoire
  useEffect(() => {
    if (!position) return;
    
    const moveRandomly = () => {
      const newX = position.x + (Math.random() - 0.5) * 100;
      const newY = position.y + (Math.random() - 0.5) * 50;
      
      setIsMoving(true);
      setCurrentPos({
        x: Math.max(50, Math.min(1150, newX)),
        y: Math.max(50, Math.min(550, newY))
      });
      
      setTimeout(() => setIsMoving(false), 800);
    };
    
    const interval = setInterval(moveRandomly, 3000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [position]);

  // Messages automatiques
  useEffect(() => {
    const showRandomMessage = () => {
      if (chibiData.messages && chibiData.messages.length > 0) {
        const randomMsg = chibiData.messages[Math.floor(Math.random() * chibiData.messages.length)];
        setCurrentMessage(randomMsg);
        setShowMessage(true);
        
        // Faire disparaître après 3 secondes
        setTimeout(() => {
          setShowMessage(false);
        }, 3000);
      }
    };
    
    // Premier message après 2-5 secondes
    const firstTimeout = setTimeout(showRandomMessage, 2000 + Math.random() * 3000);
    
    // Messages périodiques toutes les 10-20 secondes
    const interval = setInterval(showRandomMessage, 10000 + Math.random() * 10000);
    
    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
    };
  }, [chibiData.messages]);

  // Gestion du clic
  const handleClick = () => {
    // Afficher un message au clic
    if (chibiData.messages && chibiData.messages.length > 0) {
      const randomMsg = chibiData.messages[Math.floor(Math.random() * chibiData.messages.length)];
      setCurrentMessage(randomMsg);
      setShowMessage(true);
      
      setTimeout(() => {
        setShowMessage(false);
      }, 3000);
    }
    
    // Appeler le callback parent
    if (onClick) onClick();
  };

  return (
    <div
      className="chibi-entity"
      style={{
        left: `${currentPos.x}px`,
        top: `${currentPos.y}px`,
        transition: isMoving ? 'all 0.8s ease-in-out' : 'none'
      }}
      onClick={handleClick}
    >
      {/* Message bulle */}
      {showMessage && (
        <div 
          className="chibi-message-bubble"
          style={{
            position: 'absolute',
            bottom: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(20, 20, 40, 0.95)',
            border: `2px solid ${RARITY_COLORS[chibiData.rarity]}`,
            borderRadius: '12px',
            padding: '8px 12px',
            whiteSpace: 'nowrap',
            fontSize: '12px',
            color: 'white',
            boxShadow: `0 4px 12px rgba(0,0,0,0.5)`,
            animation: 'fadeInUp 0.3s ease-out',
            zIndex: 10
          }}
        >
          {currentMessage}
          {/* Petite flèche pointant vers le chibi */}
          <div style={{
            position: 'absolute',
            bottom: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: `8px solid ${RARITY_COLORS[chibiData.rarity]}`
          }} />
        </div>
      )}
      
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
      <img loading="lazy" 
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