// src/components/ChibiSystem/PathRecorderV2.jsx
import React, { useState, useRef, useEffect } from 'react';

// Types de modes d'enregistrement
const RECORDING_MODES = {
  CONTINUOUS: 'continuous',     // Mode 1: Tracer continu (clic début/fin)
  WAYPOINT: 'waypoint',        // Mode 2: Points clés uniquement
  PATTERN: 'pattern'           // Mode 3: Patterns (loops, patrouilles, etc.)
};

// Types de nœuds spéciaux
const NODE_TYPES = {
  NORMAL: 'normal',
  WAYPOINT: 'waypoint',
  INTERSECTION: 'intersection',
  SPAWN: 'spawn',
  LOOP_START: 'loop_start',
  LOOP_END: 'loop_end'
};

// Styles
const styles = {
  container: {
    position: 'fixed',
    top: '10px',
    right: '10px',
    background: 'rgba(20, 20, 40, 0.95)',
    border: '2px solid #8a2be2',
    color: 'white',
    padding: '20px',
    borderRadius: '12px',
    zIndex: 10000,
    minWidth: '300px',
    fontFamily: 'monospace'
  },
  title: {
    margin: '0 0 15px 0',
    color: '#8a2be2'
  },
  modeSelector: {
    display: 'flex',
    gap: '5px',
    marginBottom: '10px'
  },
  modeButton: {
    flex: 1,
    padding: '8px',
    background: '#333',
    border: '1px solid #666',
    color: 'white',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '12px'
  },
  modeButtonActive: {
    flex: 1,
    padding: '8px',
    background: '#8a2be2',
    border: '1px solid #a555ec',
    color: 'white',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '12px'
  },
  input: {
    width: '100%',
    padding: '8px',
    marginBottom: '10px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid #8a2be2',
    borderRadius: '4px',
    color: 'white',
    boxSizing: 'border-box'
  },
  modeInfo: {
    background: 'rgba(0, 0, 0, 0.3)',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '10px',
    fontSize: '12px'
  },
  finishButton: {
    marginTop: '10px',
    padding: '6px 12px',
    background: '#00ff41',
    border: 'none',
    borderRadius: '4px',
    color: 'black',
    cursor: 'pointer',
    fontWeight: 'bold',
    display: 'block',
    width: '100%'
  },
  shortcuts: {
    background: 'rgba(0, 0, 0, 0.3)',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '10px',
    fontSize: '12px'
  },
  stats: {
    display: 'flex',
    justifyContent: 'space-between',
    background: 'rgba(0, 0, 0, 0.3)',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '10px',
    fontSize: '12px'
  },
  exportButton: {
    width: '100%',
    padding: '8px',
    background: '#00ff41',
    color: 'black',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginBottom: '5px'
  },
  clearButton: {
    width: '100%',
    padding: '8px',
    background: '#ff4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};

export const PathRecorderV2 = ({ canvasRef }) => {
  const [mode, setMode] = useState(RECORDING_MODES.CONTINUOUS);
  const [isRecording, setIsRecording] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [paths, setPaths] = useState({});
  const [intersections, setIntersections] = useState([]);
  const [spawnPoints, setSpawnPoints] = useState([]);
  const [pathName, setPathName] = useState('');
  
  const overlayRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const intervalRef = useRef(null);

  // Créer l'overlay de visualisation
  useEffect(() => {
    if (canvasRef.current && !overlayRef.current) {
      const canvas = canvasRef.current;
      const overlay = document.createElement('canvas');
      overlay.width = canvas.width;
      overlay.height = canvas.height;
      overlay.style.position = 'absolute';
      overlay.style.top = canvas.offsetTop + 'px';
      overlay.style.left = canvas.offsetLeft + 'px';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '1001';
      canvas.parentElement.appendChild(overlay);
      overlayRef.current = overlay;
    }

    return () => {
      if (overlayRef.current) {
        overlayRef.current.remove();
        overlayRef.current = null;
      }
    };
  }, [canvasRef.current]);

  // Setup des event listeners
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    const clickHandler = (e) => {
      console.log('🖱️ Click détecté!');
      handleClick(e);
    };
    
    const moveHandler = (e) => {
      handleMouseMove(e);
    };
    
    canvas.addEventListener('click', clickHandler);
    canvas.addEventListener('mousemove', moveHandler);
    
    console.log('✅ PathRecorderV2: Event listeners ajoutés');
    
    return () => {
      canvas.removeEventListener('click', clickHandler);
      canvas.removeEventListener('mousemove', moveHandler);
    };
  }, [canvasRef.current, mode, isRecording, currentPath]);

  // Dessiner la visualisation
  useEffect(() => {
    if (!overlayRef.current) return;
    
    const ctx = overlayRef.current.getContext('2d');
    ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
    
    // Dessiner les chemins existants
    Object.entries(paths).forEach(([name, path]) => {
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      
      ctx.beginPath();
      path.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
    });
    
    // Dessiner le chemin en cours
    if (currentPath.length > 0) {
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      
      ctx.beginPath();
      currentPath.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
        
        // Dessiner les différents types de nœuds
        ctx.save();
        switch (point.type) {
          case NODE_TYPES.WAYPOINT:
            ctx.fillStyle = 'yellow';
            ctx.beginPath();
            ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
            ctx.fill();
            break;
            
          case NODE_TYPES.INTERSECTION:
            ctx.fillStyle = 'orange';
            ctx.fillRect(point.x - 10, point.y - 10, 20, 20);
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.strokeRect(point.x - 10, point.y - 10, 20, 20);
            break;
            
          case NODE_TYPES.SPAWN:
            ctx.fillStyle = 'lime';
            ctx.beginPath();
            ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.fillText('S', point.x - 4, point.y + 4);
            break;
        }
        ctx.restore();
      });
      ctx.stroke();
    }
    
    // Dessiner toutes les intersections
    intersections.forEach(inter => {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 165, 0, 0.5)';
      ctx.fillRect(inter.x - 15, inter.y - 15, 30, 30);
      ctx.strokeStyle = 'orange';
      ctx.lineWidth = 3;
      ctx.strokeRect(inter.x - 15, inter.y - 15, 30, 30);
      ctx.restore();
    });
    
    // Dessiner les points de spawn
    spawnPoints.forEach((spawn, index) => {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
      ctx.beginPath();
      ctx.arc(spawn.x, spawn.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'black';
      ctx.font = 'bold 10px Arial';
      ctx.fillText('S' + (index + 1), spawn.x - 6, spawn.y + 3);
      ctx.restore();
    });
    
  }, [currentPath, paths, intersections, spawnPoints]);

  // Gestion de la souris
  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    mousePos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  // Gestion des clics selon le mode
  const handleClick = (e) => {
    console.log('🖱️ Click dans handleClick!');
    
    if (!canvasRef.current) {
      console.error('❌ Canvas ref non trouvé');
      return;
    }
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    console.log('📍 Position:', { x, y, mode, isRecording });
    
    // Si on tient Shift, on ajoute une intersection
    if (e.shiftKey) {
      addIntersection(x, y);
      return;
    }
    
    // Si on tient Ctrl, on ajoute un spawn point
    if (e.ctrlKey) {
      addSpawnPoint(x, y);
      return;
    }
    
    switch (mode) {
      case RECORDING_MODES.CONTINUOUS:
        handleContinuousClick(x, y);
        break;
        
      case RECORDING_MODES.WAYPOINT:
        handleWaypointClick(x, y);
        break;
        
      case RECORDING_MODES.PATTERN:
        handlePatternClick(x, y, e);
        break;
    }
  };

  // Mode 1: Continu (clic début/fin)
  const handleContinuousClick = (x, y) => {
    if (!isRecording) {
      // Premier clic: démarrer
      startContinuousRecording(x, y);
    } else {
      // Second clic: arrêter
      stopRecording();
    }
  };

  // Mode 2: Waypoints seulement
  const handleWaypointClick = (x, y) => {
    const point = {
      x: x,
      y: y,
      type: NODE_TYPES.WAYPOINT,
      connections: []
    };
    
    setCurrentPath(prev => [...prev, point]);
    
    if (!isRecording) {
      setIsRecording(true);
    }
    
    console.log('🎯 Waypoint ajouté:', point);
  };

  // Mode 3: Patterns
  const handlePatternClick = (x, y, e) => {
    let type = NODE_TYPES.NORMAL;
    
    if (e.altKey && e.shiftKey) {
      type = NODE_TYPES.LOOP_END;
    } else if (e.altKey) {
      type = NODE_TYPES.LOOP_START;
    }
    
    const point = {
      x: x,
      y: y,
      type: type
    };
    
    setCurrentPath(prev => [...prev, point]);
    
    if (!isRecording) {
      setIsRecording(true);
    }
  };

  // Démarrer l'enregistrement continu
  const startContinuousRecording = (startX, startY) => {
    setIsRecording(true);
    setCurrentPath([{
      x: startX,
      y: startY,
      type: NODE_TYPES.NORMAL
    }]);
    
    // Enregistrer la position toutes les 100ms
    intervalRef.current = setInterval(() => {
      if (mousePos.current.x && mousePos.current.y) {
        setCurrentPath(prev => [...prev, {
          x: mousePos.current.x,
          y: mousePos.current.y,
          type: NODE_TYPES.NORMAL
        }]);
      }
    }, 100);
    
    console.log('🔴 Enregistrement continu démarré');
  };

  // Arrêter l'enregistrement
  const stopRecording = () => {
    setIsRecording(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Sauvegarder le chemin
    if (currentPath.length > 1) {
      const name = pathName || 'path_' + Date.now();
      const optimized = optimizePath(currentPath);
      
      setPaths(prev => ({
        ...prev,
        [name]: optimized
      }));
      
      console.log(`✅ Chemin "${name}" sauvegardé avec ${optimized.length} points`);
    }
    
    setCurrentPath([]);
    setPathName('');
  };

  // Ajouter une intersection
  const addIntersection = (x, y) => {
    const intersection = {
      id: 'inter_' + Date.now(),
      x: x,
      y: y,
      connections: [],
      weights: {}
    };
    
    setIntersections(prev => [...prev, intersection]);
    console.log('🔶 Intersection ajoutée:', intersection);
  };

  // Ajouter un point de spawn
  const addSpawnPoint = (x, y) => {
    const spawn = {
      id: 'spawn_' + Date.now(),
      x: x,
      y: y,
      usedBy: []
    };
    
    setSpawnPoints(prev => [...prev, spawn]);
    console.log('🟢 Spawn point ajouté:', spawn);
  };

  // Optimiser le chemin
  const optimizePath = (path) => {
    if (path.length < 3) return path;
    
    const optimized = [path[0]];
    const tolerance = 5;
    
    for (let i = 1; i < path.length - 1; i++) {
      const prev = optimized[optimized.length - 1];
      const curr = path[i];
      const next = path[i + 1];
      
      // Toujours garder les points spéciaux
      if (curr.type !== NODE_TYPES.NORMAL) {
        optimized.push(curr);
        continue;
      }
      
      const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
      const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
      const angleDiff = Math.abs((angle2 - angle1) * 180 / Math.PI);
      
      if (angleDiff > tolerance) {
        optimized.push(curr);
      }
    }
    
    optimized.push(path[path.length - 1]);
    return optimized;
  };

  // Exporter tout le système
  const exportSystem = () => {
    const systemData = {
      paths: paths,
      intersections: intersections,
      spawnPoints: spawnPoints,
      metadata: {
        canvasWidth: canvasRef.current?.width || 1800,
        canvasHeight: canvasRef.current?.height || 600,
        recordedAt: new Date().toISOString()
      }
    };
    
    console.log('🗺️ EXPORT SYSTÈME COMPLET:');
    console.log(JSON.stringify(systemData, null, 2));
    
    navigator.clipboard.writeText(JSON.stringify(systemData, null, 2))
      .then(() => console.log('✅ Système copié dans le presse-papier!'))
      .catch(err => console.error('❌ Erreur:', err));
  };

  // UI
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>🛤️ Path Recorder V2</h3>
      
      {/* Sélection du mode */}
      <div style={styles.modeSelector}>
        <button 
          style={mode === RECORDING_MODES.CONTINUOUS ? styles.modeButtonActive : styles.modeButton}
          onClick={() => setMode(RECORDING_MODES.CONTINUOUS)}
        >
          📍 Continu
        </button>
        <button 
          style={mode === RECORDING_MODES.WAYPOINT ? styles.modeButtonActive : styles.modeButton}
          onClick={() => setMode(RECORDING_MODES.WAYPOINT)}
        >
          🎯 Waypoints
        </button>
        <button 
          style={mode === RECORDING_MODES.PATTERN ? styles.modeButtonActive : styles.modeButton}
          onClick={() => setMode(RECORDING_MODES.PATTERN)}
        >
          🔄 Patterns
        </button>
      </div>
      
      <input
        type="text"
        value={pathName}
        onChange={(e) => setPathName(e.target.value)}
        placeholder="Nom du chemin"
        style={styles.input}
      />
      
      {/* Actions selon le mode */}
      <div style={styles.modeInfo}>
        {mode === RECORDING_MODES.CONTINUOUS && (
          <div>
            {!isRecording ? 
              '📍 Cliquez pour commencer le tracé' : 
              '🔴 Cliquez pour terminer le tracé'
            }
          </div>
        )}
        
        {mode === RECORDING_MODES.WAYPOINT && (
          <div>
            🎯 Cliquez pour ajouter des waypoints
            {currentPath.length > 0 && (
              <button onClick={stopRecording} style={styles.finishButton}>
                ✅ Terminer ({currentPath.length} points)
              </button>
            )}
          </div>
        )}
        
        {mode === RECORDING_MODES.PATTERN && (
          <div>
            <div>🔄 Alt+Click = Début de boucle</div>
            <div>🔄 Alt+Shift+Click = Fin de boucle</div>
            {currentPath.length > 0 && (
              <button onClick={stopRecording} style={styles.finishButton}>
                ✅ Terminer Pattern
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Raccourcis */}
      <div style={styles.shortcuts}>
        <h4 style={{ margin: '10px 0 5px 0', color: '#8a2be2', fontSize: '12px' }}>
          Raccourcis :
        </h4>
        <div>🔶 Shift+Click = Intersection</div>
        <div>🟢 Ctrl+Click = Point de spawn</div>
      </div>
      
      {/* Stats */}
      <div style={styles.stats}>
        <div>Chemins: {Object.keys(paths).length}</div>
        <div>Intersections: {intersections.length}</div>
        <div>Spawns: {spawnPoints.length}</div>
      </div>
      
      {/* Export */}
      <button onClick={exportSystem} style={styles.exportButton}>
        📤 Exporter le système
      </button>
      
      {/* Clear */}
      <button 
        onClick={() => {
          setCurrentPath([]);
          setPaths({});
          setIntersections([]);
          setSpawnPoints([]);
        }} 
        style={styles.clearButton}
      >
        🗑️ Tout effacer
      </button>
    </div>
  );
};