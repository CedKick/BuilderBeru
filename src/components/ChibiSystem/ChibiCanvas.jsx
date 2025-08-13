// src/components/ChibiSystem/ChibiCanvas.jsx
import React, { useRef, useEffect, useState } from 'react';
import ChibiEntity from './ChibiEntity';

const ChibiCanvas = ({ worldData, activeChibis, onChibiClick }) => {
  const canvasRef = useRef(null);
  const [chibiPositions, setChibiPositions] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  
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

  // Générer des positions vraiment aléatoires
  useEffect(() => {
    const positions = {};
    
    activeChibis.forEach((chibiId, index) => {
      if (!chibiPositions[chibiId]) {
        // POSITIONS MIEUX RÉPARTIES SUR LA MAP
        const zones = [
          { x: 200, y: 350 },  // Zone gauche près du dragon
          { x: 600, y: 450 },  // Zone centre
          { x: 900, y: 300 },  // Zone droite
          { x: 400, y: 200 },  // Zone haute
          { x: 800, y: 500 }   // Zone basse
        ];
        
        // Prendre une zone de base
        const baseZone = zones[index % zones.length];
        
        // Ajouter un décalage aléatoire
        positions[chibiId] = {
          x: baseZone.x + (Math.random() - 0.5) * 200,
          y: baseZone.y + (Math.random() - 0.5) * 100,
          targetX: 0,
          targetY: 0,
          speed: 0.5 + Math.random() * 0.5
        };
      } else {
        positions[chibiId] = chibiPositions[chibiId];
      }
    });
    
    setChibiPositions(positions);
    setIsInitialized(true);
  }, [activeChibis.length]); // Dépendance sur la longueur seulement

  const handleChibiClick = (chibiId, realPosition) => {
    onChibiClick(chibiId, realPosition);
  };

  return (
    <div className="chibi-canvas-wrapper">
      <canvas 
        ref={canvasRef}
        width={1200}
        height={600}
        className="chibi-world-canvas"
      />
      
      <div className="chibi-entities-layer">
        {isInitialized && activeChibis.map(chibiId => (
          <ChibiEntity
            key={chibiId}
            chibiId={chibiId}
            position={chibiPositions[chibiId]}
            onClick={(realPos) => handleChibiClick(chibiId, realPos)}
          />
        ))}
      </div>
    </div>
  );
};

export default ChibiCanvas;