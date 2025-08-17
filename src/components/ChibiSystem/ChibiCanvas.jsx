// src/components/ChibiSystem/ChibiCanvas.jsx
import React, { useRef, useEffect, useState } from 'react';
import ChibiEntity from './ChibiEntity';

const ChibiCanvas = ({ worldData, activeChibiEntities, onChibiClick }) => {
  const canvasRef = useRef(null);
  const [chibiPositions, setChibiPositions] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
const [waterfallPos, setWaterfallPos] = useState({ top: 32, left: 15 });
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Charger la map de fond
    const bgImage = new Image();
    bgImage.src = worldData.background;
    
    bgImage.onload = () => {
      const animate = (time) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        requestAnimationFrame(animate);
      };
      
      animate();
    };
  }, [worldData]);

  // Générer des positions mieux réparties sur toute la map
  useEffect(() => {
    const positions = {};
    
    activeChibiEntities.forEach((chibiEntity, index) => {
      if (!chibiPositions[chibiEntity.id]) {
        // GRILLE DE ZONES ÉTENDUE POUR COUVRIR TOUTE LA MAP
        const zones = [
          // Ligne du haut
          { x: 150, y: 150 },   // Haut gauche
          { x: 400, y: 120 },   // Haut centre-gauche
          { x: 600, y: 150 },   // Haut centre
          { x: 800, y: 120 },   // Haut centre-droit
          { x: 1050, y: 150 },  // Haut droit
          
          // Ligne du milieu-haut
          { x: 200, y: 250 },   // Milieu-haut gauche
          { x: 500, y: 280 },   // Milieu-haut centre
          { x: 700, y: 250 },   // Milieu-haut centre-droit
          { x: 1000, y: 280 },  // Milieu-haut droit
          
          // Ligne centrale
          { x: 100, y: 350 },   // Centre gauche
          { x: 350, y: 380 },   // Centre gauche-milieu
          { x: 600, y: 350 },   // Centre
          { x: 850, y: 380 },   // Centre droit-milieu
          { x: 1100, y: 350 },  // Centre droit
          
          // Ligne du milieu-bas
          { x: 250, y: 450 },   // Milieu-bas gauche
          { x: 450, y: 480 },   // Milieu-bas centre-gauche
          { x: 750, y: 450 },   // Milieu-bas centre-droit
          { x: 950, y: 480 },   // Milieu-bas droit
          
          // Ligne du bas
          { x: 150, y: 530 },   // Bas gauche
          { x: 400, y: 550 },   // Bas centre-gauche
          { x: 600, y: 530 },   // Bas centre
          { x: 800, y: 550 },   // Bas centre-droit
          { x: 1050, y: 530 }   // Bas droit
        ];
        
        // Sélectionner une zone de manière cyclique mais avec variation
        const zoneIndex = (index * 5 + Math.floor(Math.random() * 3)) % zones.length;
        const baseZone = zones[zoneIndex];
        
        // Ajouter une variation aléatoire plus petite pour éviter l'alignement parfait
        positions[chibiEntity.id] = {
          x: baseZone.x + (Math.random() - 0.5) * 80,
          y: baseZone.y + (Math.random() - 0.5) * 60,
          targetX: 0,
          targetY: 0,
          speed: 0.5 + Math.random() * 0.5
        };
      } else {
        positions[chibiEntity.id] = chibiPositions[chibiEntity.id];
      }
    });
    
    setChibiPositions(positions);
    setIsInitialized(true);
  }, [activeChibiEntities.length, chibiPositions]);

  const handleChibiClick = (chibiEntity, realPosition) => {
    onChibiClick(chibiEntity, realPosition);
  };

 return (
  
  <div className="chibi-canvas-wrapper">
    <canvas 
      ref={canvasRef}
      width={1200}
      height={600}
      className="chibi-world-canvas"
    />
    
    {/* Cascade animée avec l'image de Béru */}
    <div className="waterfall-beru-container">
      {/* Image de la cascade */}
      <img 
        src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755432424/cascada_lrr6lv.png"
        alt="Cascade"
        className="waterfall-beru-image"
      />
      
      {/* Overlay animé pour l'effet de mouvement */}
      <div className="waterfall-motion-overlay">
        <div className="water-motion-layer layer-1"></div>
        <div className="water-motion-layer layer-2"></div>
        <div className="water-motion-layer layer-3"></div>
      </div>
      
      {/* Particules d'écume animées */}
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
      
      {/* Effet de brume à la base */}
      <div className="waterfall-beru-mist"></div>
    </div>
    
    <div className="chibi-entities-layer">
        {isInitialized && activeChibiEntities.map(chibiEntity => (
          <ChibiEntity
            key={chibiEntity.id}
            chibiEntity={chibiEntity}
            position={chibiPositions[chibiEntity.id]}
            onClick={handleChibiClick}
          />
        ))}
      </div>
      {debugMode && (
  <div style={{
    position: 'fixed',
    top: 10,
    right: 10,
    background: 'rgba(0,0,0,0.8)',
    color: 'white',
    padding: '10px',
    borderRadius: '5px',
    zIndex: 1000
  }}>
    <h4>Position Cascade</h4>
    <label>
      Top: {waterfallPos.top}%
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={waterfallPos.top}
        onChange={(e) => setWaterfallPos(prev => ({...prev, top: e.target.value}))}
      />
    </label>
    <br/>
    <label>
      Left: {waterfallPos.left}%
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={waterfallPos.left}
        onChange={(e) => setWaterfallPos(prev => ({...prev, left: e.target.value}))}
      />
    </label>
    <br/>
    <button onClick={() => navigator.clipboard.writeText(`top: ${waterfallPos.top}%; left: ${waterfallPos.left}%;`)}>
      Copier CSS
    </button>
  </div>
)}

{/* Cascade avec position dynamique en debug */}
<div 
  className="waterfall-container"
  style={debugMode ? {
    top: `${waterfallPos.top}%`,
    left: `${waterfallPos.left}%`,
    border: '2px solid red' // Pour voir le container
  } : {}}
>
  {/* ... reste du code cascade */}
</div>
    </div>
  );
};

export default ChibiCanvas;