// src/components/ChibiSystem/ChibiEntity.jsx
import React, { useEffect, useState, useRef } from 'react';
import { CHIBI_RARITIES } from './ChibiDataStructure';
import { PATH_DATA } from './pathData';

const ChibiEntity = ({ chibiEntity, position, onClick, canvasRef }) => {
  // État initial avec position du spawn
  const [currentPos, setCurrentPos] = useState(() => {
    // Utiliser un spawn point aléatoire de pathData
    if (PATH_DATA.spawnPoints && PATH_DATA.spawnPoints.length > 0) {
      const randomSpawn = PATH_DATA.spawnPoints[Math.floor(Math.random() * PATH_DATA.spawnPoints.length)];
      return { x: randomSpawn.x, y: randomSpawn.y };
    }
    return position || { x: 500, y: 300 };
  });
  
  const [isMoving, setIsMoving] = useState(false);
  const [direction, setDirection] = useState('down');
  const [currentSprite, setCurrentSprite] = useState('idle'); // État pour le sprite actuel
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [currentPath, setCurrentPath] = useState(null);
  const [targetPoint, setTargetPoint] = useState(null);
  const [nextMoveTime, setNextMoveTime] = useState(null);
  const [movementPhase, setMovementPhase] = useState('idle'); // 'idle', 'moving', 'paused'
  const [pauseAtWaypoint, setPauseAtWaypoint] = useState(false); // Pour les pauses aux waypoints
  
  const entityRef = useRef(null);
  const animationRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());
  const moveTimeoutRef = useRef(null);
  
  // Dimensions du canvas
  const CANVAS_WIDTH = 1800;
  const CANVAS_HEIGHT = 600;
  
  // Vérifier que c'est bien une entité ChibiEntity
  if (!chibiEntity || !chibiEntity.id) {
    console.error('ChibiEntity component requires a valid ChibiEntity instance');
    return null;
  }
  
  // Obtenir la couleur de rareté
  const rarityColor = CHIBI_RARITIES[chibiEntity.rarity.toUpperCase()]?.color || '#9CA3AF';

  // Fonction pour calculer l'échelle selon la position Y (perspective)
  const calculateScale = (y) => {
    const minScale = 0.5;  // En haut de la map
    const maxScale = 1.2;  // En bas de la map
    return minScale + ((y / CANVAS_HEIGHT) * (maxScale - minScale));
  };

  // Fonction pour convertir les coordonnées canvas en coordonnées écran
  const getScreenPosition = () => {
    if (!canvasRef?.current) return currentPos;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Ratio unique pour garder les proportions (on prend le plus petit pour éviter la déformation)
    const scale = Math.min(rect.width / CANVAS_WIDTH, rect.height / CANVAS_HEIGHT);
    
    // Centrer si nécessaire
    const offsetX = (rect.width - CANVAS_WIDTH * scale) / 2;
    const offsetY = (rect.height - CANVAS_HEIGHT * scale) / 2;
    
    return {
      x: currentPos.x * scale + offsetX,
      y: currentPos.y * scale + offsetY,
      screenScale: scale // On retourne aussi le scale pour l'utiliser ailleurs
    };
  };

  // Fonction pour planifier le prochain mouvement
  const scheduleNextMovement = () => {
    // Pause entre 20 secondes et 2 minutes
    const minPause = 20000;  // 20 secondes
    const maxPause = 120000; // 2 minutes
    const pauseDuration = minPause + Math.random() * (maxPause - minPause);
    
    
    moveTimeoutRef.current = setTimeout(() => {
      startMovement();
    }, pauseDuration);
    
    setNextMoveTime(Date.now() + pauseDuration);
  };

  // Fonction pour démarrer un mouvement
  const startMovement = () => {
    if (!currentPath || currentPath.length === 0) return;
    
    setMovementPhase('moving');
    setIsMoving(true);
    
    // Durée du mouvement : entre 10 et 30 secondes
    const moveDuration = 10000 + Math.random() * 20000;
    
    // Arrêter le mouvement après la durée
    setTimeout(() => {
      if (isMoving) {
        stopMovement();
      }
    }, moveDuration);
  };

  // Fonction pour arrêter le mouvement
  const stopMovement = () => {
    setIsMoving(false);
    setMovementPhase('idle');
    setCurrentSprite('idle'); // Retour au sprite idle
    scheduleNextMovement();
  };

  // Initialiser un chemin au démarrage
  useEffect(() => {
    
    // Trouver un chemin proche du spawn
    if (PATH_DATA.paths) {
      const paths = Object.entries(PATH_DATA.paths);
      if (paths.length > 0) {
        // Choisir un chemin aléatoire
        const [pathName, pathPoints] = paths[Math.floor(Math.random() * paths.length)];
        
        // Trouver le point le plus proche sur ce chemin
        let closestIndex = 0;
        let closestDist = Infinity;
        
        pathPoints.forEach((point, index) => {
          const dist = Math.sqrt(
            Math.pow(point.x - currentPos.x, 2) + 
            Math.pow(point.y - currentPos.y, 2)
          );
          if (dist < closestDist) {
            closestDist = dist;
            closestIndex = index;
          }
        });
        
        // Simplifier le chemin (prendre 1 point sur 4 pour fluidité)
        const simplifiedPath = pathPoints.filter((_, index) => index % 4 === 0);
        if (simplifiedPath.length > 0 && !simplifiedPath.includes(pathPoints[pathPoints.length - 1])) {
          simplifiedPath.push(pathPoints[pathPoints.length - 1]);
        }
        
        setCurrentPath(simplifiedPath);
        setCurrentPathIndex(Math.floor(closestIndex / 4));
        
        // Définir le premier point cible
        if (simplifiedPath.length > 0) {
          const firstTarget = simplifiedPath[Math.floor(closestIndex / 4)];
          setTargetPoint(firstTarget);
          
          // Planifier le premier mouvement
          // 40% de chance de bouger rapidement au démarrage
          const isEarlyMover = Math.random() < 0.4;
          const initialDelay = isEarlyMover ? 
            1000 + Math.random() * 5000 :   // 1-6 secondes pour les actifs
            10000 + Math.random() * 30000;  // 10-40 secondes pour les autres
          
          moveTimeoutRef.current = setTimeout(() => {
            startMovement();
          }, initialDelay);
          
        }
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }
    };
  }, [chibiEntity.id]);

  // Boucle d'animation pour le mouvement fluide
  useEffect(() => {
    if (!isMoving || !currentPath || !targetPoint) {
      return;
    }

    const animate = () => {
      const now = Date.now();
      const deltaTime = Math.min(now - lastUpdateRef.current, 50);
      lastUpdateRef.current = now;

      setCurrentPos(prevPos => {
        if (!targetPoint) return prevPos;

        const dx = targetPoint.x - prevPos.x;
        const dy = targetPoint.y - prevPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Arrivé au point cible ?
        if (distance < 5) {
          // 20% de chance de faire une pause à ce waypoint
          if (!pauseAtWaypoint && Math.random() < 0.2) {
            setPauseAtWaypoint(true);
            setIsMoving(false);
            setCurrentSprite('idle'); // Retour au sprite idle
            
            // Reprendre après 2-5 secondes
            setTimeout(() => {
              setPauseAtWaypoint(false);
              setIsMoving(true);
              // Passer au point suivant
              const nextIndex = (currentPathIndex + 1) % currentPath.length;
              setCurrentPathIndex(nextIndex);
              setTargetPoint(currentPath[nextIndex]);
            }, 2000 + Math.random() * 3000);
            
            return prevPos;
          }
          
          // Passer au point suivant sans pause
          const nextIndex = (currentPathIndex + 1) % currentPath.length;
          setCurrentPathIndex(nextIndex);
          setTargetPoint(currentPath[nextIndex]);
          
          return prevPos;
        }

        // Calculer la vitesse (plus lente pour un effet plus calme)
        const baseSpeed = 0.8; // Vitesse légèrement augmentée
        const speed = baseSpeed * (deltaTime / 16);
        const moveDistance = Math.min(speed, distance);
        
        // Calculer la nouvelle position
        const moveX = (dx / distance) * moveDistance;
        const moveY = (dy / distance) * moveDistance;
        
        // Mettre à jour la direction ET le sprite
        const newDirection = Math.abs(dx) > Math.abs(dy) ? 
          (dx > 0 ? 'right' : 'left') : 
          (dy > 0 ? 'down' : 'up');
        
        if (newDirection !== direction) {
          setDirection(newDirection);
          setCurrentSprite(newDirection); // IMPORTANT : mettre à jour le sprite !
        }
        
        return {
          x: prevPos.x + moveX,
          y: prevPos.y + moveY
        };
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isMoving, currentPath, targetPoint, currentPathIndex, direction, pauseAtWaypoint]);

  // Handler de clic
  const handleClick = () => {
    if (entityRef.current && onClick) {
      const rect = entityRef.current.getBoundingClientRect();
      const realPosition = {
        x: rect.left + rect.width / 2,
        y: rect.top - 50
      };
      
      onClick(chibiEntity.id, realPosition);
      
      // 50% de chance de commencer à bouger après le clic
      if (!isMoving && Math.random() < 0.5) {
        // Annuler le timeout en cours
        if (moveTimeoutRef.current) {
          clearTimeout(moveTimeoutRef.current);
        }
        // Démarrer le mouvement dans 1-3 secondes
        setTimeout(() => {
          startMovement();
        }, 1000 + Math.random() * 2000);
      }
    }
  };
  
  // Obtenir le sprite selon la direction
  const getSprite = () => {
    let spriteUrl = chibiEntity.sprites?.idle;
    
    // DEBUG : afficher quel sprite on utilise
    if (window.location.hash === '#debug') {
    }
    
    if (chibiEntity.sprites) {
      // Utiliser currentSprite au lieu de direction
      switch(currentSprite) {
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
        <img loading="lazy" 
          src={spriteUrl}
          alt={chibiEntity.name}
          className="chibi-sprite"
          style={{
            width: 'auto',
            height: 'auto',
            maxWidth: '80px', // Limite max pour pas que ça devienne trop grand
            filter: `drop-shadow(0 0 10px ${rarityColor})`,
            position: 'relative',
            zIndex: 2,
            cursor: 'pointer',
            imageRendering: 'pixelated'
          }}
        />
      );
    }
    
    // Fallback emoji
    const emojiMap = {
      'beru': '🐜',
      'tank': '🛡️',
      'kaisel': '⚔️',
      'raven': '🦅',
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
        transform: direction === 'left' ? 'scaleX(-1)' : 'none'
      }}>
        {emoji}
      </div>
    );
  };

  const scale = calculateScale(currentPos.y);
  const screenData = getScreenPosition();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Détecter les changements de zoom
  useEffect(() => {
    const handleResize = () => {
      setIsTransitioning(true);
      // Masquer pendant la transition
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={entityRef}
      className="chibi-entity"
      style={{
        position: 'absolute',
        left: `${screenData.x}px`,
        top: `${screenData.y}px`,
        transform: `translate(-50%, -50%) scale(${scale})`, // Scale FIXE basé uniquement sur Y
        zIndex: Math.floor(currentPos.y),
        opacity: isTransitioning ? 0 : (movementPhase === 'idle' ? 0.9 : 1),
        transformOrigin: 'center center',
        transition: isTransitioning ? 'opacity 0.1s' : 'none',
        willChange: 'transform'
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
          background: `radial-gradient(circle, ${rarityColor}40 0%, transparent 70%)`,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: movementPhase === 'moving' ? 'pulse 2s infinite' : 'pulse 4s infinite'
        }}
      />
      
      {/* Sprite du chibi */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }}>
        {getSprite()}
      </div>
      
      {/* Infos du chibi */}
      <div className="chibi-info" style={{
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginTop: '5px',
        textAlign: 'center',
        pointerEvents: 'none',
        whiteSpace: 'nowrap'
      }}>
        {/* Nom */}
        <div style={{
          fontSize: '12px',
          fontWeight: 'bold',
          color: rarityColor,
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
        }}>
          {chibiEntity.name}
        </div>
        
        {/* Level et humeur */}
        <div style={{
          fontSize: '10px',
          color: '#9ca3af',
          marginTop: '2px'
        }}>
          Lv.{chibiEntity.level} • {chibiEntity.currentMood}
        </div>
      </div>
      
      {/* Debug info en mode debug */}
      {window.location.hash === '#debug' && (
        <div style={{
          position: 'absolute',
          top: '-50px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '10px',
          color: 'yellow',
          background: 'rgba(0,0,0,0.7)',
          padding: '2px 4px',
          borderRadius: '3px',
          whiteSpace: 'nowrap'
        }}>
          {movementPhase} | Pos: {Math.round(currentPos.x)},{Math.round(currentPos.y)} | Scale: {scale.toFixed(2)}
        </div>
      )}
    </div>
  );
};

// CSS pour les animations
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
    50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
  }
  
  .chibi-entity {
    pointer-events: auto;
    backface-visibility: hidden;
    -webkit-font-smoothing: antialiased;
  }
`;
if (!document.getElementById('chibi-entity-styles')) {
  style.id = 'chibi-entity-styles';
  document.head.appendChild(style);
}

export default ChibiEntity;