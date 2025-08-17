// src/components/ChibiSystem/ChibiEntity.jsx
import React, { useEffect, useState, useRef } from 'react';
import { CHIBI_RARITIES } from './ChibiDataStructure';

const ChibiEntity = ({ chibiEntity, position, onClick }) => {
  const [currentPos, setCurrentPos] = useState(position || { x: 500, y: 300 });
  const [isMoving, setIsMoving] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [direction, setDirection] = useState('down'); // Direction actuelle
  const entityRef = useRef(null);
  const lastPosRef = useRef(currentPos);
  
  // Vérifier que c'est bien une entité ChibiEntity
  if (!chibiEntity || !chibiEntity.id) {
    console.error('ChibiEntity component requires a valid ChibiEntity instance');
    return null;
  }
  
  // Obtenir la couleur de rareté
  const rarityColor = CHIBI_RARITIES[chibiEntity.rarity.toUpperCase()]?.color || '#9CA3AF';

  // Mise à jour de la position quand elle change
  useEffect(() => {
    if (position && position.x && position.y) {
      setCurrentPos(position);
    }
  }, [position]);

  // Animation de mouvement aléatoire avec direction
  useEffect(() => {
    if (!currentPos) return;
    
    const moveRandomly = () => {
      const newX = currentPos.x + (Math.random() - 0.5) * 80;
      const newY = currentPos.y + (Math.random() - 0.5) * 40;
      
      // Calculer la direction du mouvement
      const deltaX = newX - currentPos.x;
      const deltaY = newY - currentPos.y;
      
      // Déterminer la direction principale
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Mouvement horizontal dominant
        setDirection(deltaX > 0 ? 'right' : 'left');
      } else {
        // Mouvement vertical dominant
        setDirection(deltaY > 0 ? 'down' : 'up');
      }
      
      setIsMoving(true);
      setCurrentPos({
        x: Math.max(100, Math.min(1100, newX)),
        y: Math.max(100, Math.min(500, newY))
      });
      
      setTimeout(() => setIsMoving(false), 800);
    };
    
    const interval = setInterval(moveRandomly, 4000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, [currentPos]);

  // Messages automatiques basés sur l'humeur (RÉDUITS DE 90%)
  useEffect(() => {
    const showRandomMessage = () => {
      // 10% de chance seulement de parler
      if (Math.random() > 0.1) return;
      
      if (chibiEntity.canInteract()) {
        const message = chibiEntity.getMessage();
        setCurrentMessage(message);
        setShowMessage(true);
        
        setTimeout(() => {
          setShowMessage(false);
        }, 3000);
      }
    };
    
    // Premier message après 10-30 secondes (au lieu de 2-5)
    const firstTimeout = setTimeout(showRandomMessage, 10000 + Math.random() * 20000);
    
    // Messages périodiques toutes les 60-120 secondes (au lieu de 15-30)
    const interval = setInterval(showRandomMessage, 60000 + Math.random() * 60000);
    
    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
    };
  }, [chibiEntity]);

  // Handler de clic
  const handleClick = () => {
    if (entityRef.current && onClick) {
      const rect = entityRef.current.getBoundingClientRect();
      const realPosition = {
        x: rect.left + rect.width / 2,
        y: rect.top - 50
      };
      
      // Afficher un message immédiat
      const message = chibiEntity.getMessage();
      setCurrentMessage(message);
      setShowMessage(true);
      
      setTimeout(() => {
        setShowMessage(false);
      }, 3000);
      
      onClick(chibiEntity, realPosition);
    }
  };
  
  // Obtenir le sprite selon la direction
  const getSprite = () => {
    // Déterminer quel sprite utiliser selon la direction
    let spriteUrl = chibiEntity.sprites?.idle;
    
    if (chibiEntity.sprites) {
      switch(direction) {
        case 'left':
          spriteUrl = chibiEntity.sprites.left || chibiEntity.sprites.idle;
          break;
        case 'right':
          spriteUrl = chibiEntity.sprites.right || chibiEntity.sprites.idle;
          break;
        case 'up':
          spriteUrl = chibiEntity.sprites.up || chibiEntity.sprites.idle;
          break;
        case 'down':
          spriteUrl = chibiEntity.sprites.down || chibiEntity.sprites.idle;
          break;
        default:
          spriteUrl = chibiEntity.sprites.idle;
      }
    }
    
    if (spriteUrl) {
      return (
        <img 
          src={spriteUrl}
          alt={chibiEntity.name}
          className="chibi-sprite"
          style={{
            width: '60px',
            height: '60px',
            filter: `drop-shadow(0 0 10px ${rarityColor})`,
            position: 'relative',
            zIndex: 2,
            cursor: 'pointer',
            transform: isMoving ? 'scale(1.1)' : 'scale(1)',
            transition: 'transform 0.3s ease'
          }}
        />
      );
    }
    
    // Fallback emoji
    const emojiMap = {
      'beru': '🐜',
      'tank': '🛡️',
      'kaisel': '⚔️',
      'raven': '🐦‍⬛',
      'lil': '🐉',
      'okami': '🐺'
    };
    
    const type = chibiEntity.id.split('_')[1];
    const emoji = emojiMap[type] || '👾';
    
    return (
      <div className="chibi-sprite emoji-sprite" style={{
        fontSize: '40px',
        filter: `drop-shadow(0 0 10px ${rarityColor})`,
        position: 'relative',
        zIndex: 2,
        cursor: 'pointer',
        transform: `${isMoving ? 'scale(1.1)' : 'scale(1)'} ${direction === 'left' ? 'scaleX(-1)' : ''}`,
        transition: 'transform 0.3s ease'
      }}>
        {emoji}
      </div>
    );
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
            border: `2px solid ${rarityColor}`,
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
          <div style={{
            position: 'absolute',
            bottom: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: `8px solid ${rarityColor}`
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
          background: `radial-gradient(circle, ${rarityColor}40 0%, transparent 70%)`,
          top: '-10px',
          left: '-10px',
          animation: 'pulse 2s infinite'
        }}
      />
      
      {/* Sprite du chibi */}
      {getSprite()}
      
      {/* Infos du chibi */}
      <div className="chibi-info" style={{
        position: 'absolute',
        bottom: '-25px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        pointerEvents: 'none'
      }}>
        {/* Nom */}
        <div style={{
          fontSize: '10px',
          fontWeight: 'bold',
          color: rarityColor,
          whiteSpace: 'nowrap',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
        }}>
          {chibiEntity.name}
        </div>
        
        {/* Level et humeur */}
        <div style={{
          fontSize: '8px',
          color: '#9ca3af',
          marginTop: '2px'
        }}>
          Lv.{chibiEntity.level} • {chibiEntity.currentMood}
        </div>
      </div>
    </div>
  );
};

export default ChibiEntity;