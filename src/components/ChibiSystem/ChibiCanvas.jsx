// src/components/ChibiSystem/ChibiCanvas.jsx
import React, { useRef, useEffect, useState } from 'react';
import ChibiEntity from './ChibiEntity';
// import { PathRecorderV2 } from './PathRecorder'; // Commenté temporairement
import { PATH_DATA } from './pathData';

const ChibiCanvas = ({ worldData, activeChibiEntities = [], onChibiClick }) => {
  const canvasRef = useRef(null);
  const [chibiPositions, setChibiPositions] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  // Vérifier le mode debug
  useEffect(() => {
    const checkHash = () => {
      const isDebug = window.location.hash === '#debug';
      setDebugMode(isDebug);
      console.log('Debug mode:', isDebug);
    };
    
    checkHash();
    window.addEventListener('hashchange', checkHash);
    
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);
  
  // Dessiner le background et les chemins (en debug)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const bgImage = new Image();
    bgImage.src = worldData.background;
    
    bgImage.onload = () => {
      const animate = (time) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        
        // Dessiner les chemins en mode debug
        if (debugMode && PATH_DATA) {
          // Dessiner les chemins
          ctx.save();
          Object.entries(PATH_DATA.paths || {}).forEach(([name, path]) => {
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            
            ctx.beginPath();
            path.forEach((point, i) => {
              if (i === 0) ctx.moveTo(point.x, point.y);
              else ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
            
            // Afficher le nom du chemin au début
            if (path[0]) {
              ctx.fillStyle = 'white';
              ctx.font = 'bold 12px Arial';
              ctx.fillText(name, path[0].x, path[0].y - 5);
            }
          });
          
          // Dessiner les spawns
          (PATH_DATA.spawnPoints || []).forEach((spawn, index) => {
            ctx.fillStyle = 'rgba(0, 255, 0, 0.6)';
            ctx.beginPath();
            ctx.arc(spawn.x, spawn.y, 8, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'white';
            ctx.font = '10px Arial';
            ctx.fillText('S' + (index + 1), spawn.x - 6, spawn.y + 3);
          });
          
          // Dessiner les intersections
          (PATH_DATA.intersections || []).forEach(inter => {
            ctx.fillStyle = 'rgba(255, 165, 0, 0.6)';
            ctx.fillRect(inter.x - 10, inter.y - 10, 20, 20);
            ctx.strokeStyle = 'orange';
            ctx.lineWidth = 2;
            ctx.strokeRect(inter.x - 10, inter.y - 10, 20, 20);
          });
          
          ctx.restore();
        }
        
        requestAnimationFrame(animate);
      };
      
      animate();
    };
  }, [worldData, debugMode]);

  // Générer des positions pour les chibis
  useEffect(() => {
    if (!activeChibiEntities || activeChibiEntities.length === 0) {
      setIsInitialized(true);
      return;
    }

    const zones = [
      { x: 150, y: 150 }, { x: 400, y: 120 }, { x: 600, y: 150 }, { x: 800, y: 120 }, { x: 1050, y: 150 },
      { x: 200, y: 250 }, { x: 500, y: 280 }, { x: 700, y: 250 }, { x: 1000, y: 280 },
      { x: 100, y: 350 }, { x: 350, y: 380 }, { x: 600, y: 350 }, { x: 850, y: 380 }, { x: 1100, y: 350 },
      { x: 250, y: 450 }, { x: 450, y: 480 }, { x: 750, y: 450 }, { x: 950, y: 480 },
      { x: 150, y: 530 }, { x: 400, y: 550 }, { x: 600, y: 530 }, { x: 800, y: 550 }, { x: 1050, y: 530 }
    ];

    setChibiPositions(prevPositions => {
      const newPositions = { ...prevPositions };
      
      activeChibiEntities.forEach((chibiEntity, index) => {
        if (chibiEntity && chibiEntity.id && !newPositions[chibiEntity.id]) {
          const zoneIndex = (index * 5 + Math.floor(Math.random() * 3)) % zones.length;
          const baseZone = zones[zoneIndex];
          
          newPositions[chibiEntity.id] = {
            x: baseZone.x + (Math.random() - 0.5) * 80,
            y: baseZone.y + (Math.random() - 0.5) * 60,
            targetX: 0,
            targetY: 0,
            speed: 0.5 + Math.random() * 0.5
          };
        }
      });
      
      return newPositions;
    });
    
    setIsInitialized(true);
  }, [activeChibiEntities.length]);

  const handleChibiClick = (chibiEntity, realPosition) => {
    if (!chibiEntity || !onChibiClick) return;
    onChibiClick(chibiEntity, realPosition);
  };

  return (
    <div className="chibi-canvas-wrapper">
      <canvas 
        ref={canvasRef}
        width={1800}
        height={600}
        className="chibi-world-canvas"
        style={{
          width: '100%',
          height: 'auto',
          objectFit: 'contain'
        }}
      />
      
      {/* Cascade animée */}
      <div className="waterfall-beru-container">
        <img 
          src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755432424/cascada_lrr6lv.png"
          alt="Cascade"
          className="waterfall-beru-image"
        />
        
        <div className="waterfall-motion-overlay">
          <div className="water-motion-layer layer-1"></div>
          <div className="water-motion-layer layer-2"></div>
          <div className="water-motion-layer layer-3"></div>
        </div>
        
        <div className="waterfall-beru-foam">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className="beru-foam-particle"
              style={{
                left: `${30 + Math.random() * 40}%`,
                top: `${60 + Math.random() * 30}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${1.5 + Math.random() * 1.5}s`
              }}
            />
          ))}
        </div>
        
        <div className="waterfall-beru-mist"></div>
      </div>
      
      {/* Chibis */}
<div className="chibi-entities-layer">
  {isInitialized && activeChibiEntities
    .filter(chibiEntity => chibiEntity && chibiEntity.id)
    .map(chibiEntity => (
      <ChibiEntity
        key={chibiEntity.id}
        chibiEntity={chibiEntity}
        position={chibiPositions[chibiEntity.id]}
        onClick={handleChibiClick}
        canvasRef={canvasRef} // AJOUTE CETTE LIGNE !
      />
    ))}
</div>

      {/* Interface debug simple */}
      {debugMode && (
        <div style={{
          position: 'fixed', 
          top: 10, 
          right: 10, 
          background: 'rgba(20, 20, 40, 0.95)',
          border: '2px solid #8a2be2',
          color: 'white', 
          padding: '20px',
          borderRadius: '12px',
          zIndex: 10000,
          minWidth: '300px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#8a2be2' }}>
            🛤️ Debug Info
          </h3>
          
          <div style={{ fontSize: '12px' }}>
            <div>✅ Mode Debug Actif</div>
            <div style={{ marginTop: '10px' }}>
              📊 Stats:
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                <li>Chemins: {PATH_DATA ? Object.keys(PATH_DATA.paths || {}).length : 0}</li>
                <li>Spawns: {PATH_DATA ? (PATH_DATA.spawnPoints || []).length : 0}</li>
                <li>Intersections: {PATH_DATA ? (PATH_DATA.intersections || []).length : 0}</li>
                <li>Chibis actifs: {activeChibiEntities.length}</li>
              </ul>
            </div>
            
            <div style={{ marginTop: '10px', fontSize: '10px', color: '#8a2be2' }}>
              💡 Les chemins sont visibles sur la map:<br/>
              - Lignes rouges: Chemins<br/>
              - Cercles verts: Spawns<br/>
              - Carrés orange: Intersections
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChibiCanvas;