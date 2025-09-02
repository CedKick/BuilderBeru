// src/components/SpaceMarineShadowTrail/SpaceMarineShadowTrail.jsx
// 🚀 SPACEMARINE SHADOW TRAIL - INTERACTIVE DESTRUCTION EDITION
// ⚔️ Created by Kaisel for the Shadow Monarch
// 🎯 Regional exclusive: Île-de-France & Auvergne-Rhône-Alpes only!
// 💥 WARNING: This component features advanced DOM destruction capabilities

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './SpaceMarineShadowTrail.css';

// 🎨 SPRITES DU SPACE MARINE
const SPACEMARINE_SPRITES = {
  down: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756838889/spacemarine_down_ltt8cs.png",
  left: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756838888/spacemarine_left_ya1o1o.png",
  right: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756838889/spacemarine_right_iobccn.png",
  up: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756838888/spacemarine_up_sprcwc.png"
};

// 🎯 CONFIGURATION
const MARINE_CONFIG = {
  SPEED: 2,
  PATROL_RADIUS: 300,
  LASER_RANGE: 500,
  LASER_DAMAGE: 100,
  SHIELD_DURATION: 5000,
  PLASMA_COOLDOWN: 3000,
  DESTRUCTION_THRESHOLD: 0.3, // 30% du DOM max
  ALLOWED_REGIONS: ['Île-de-France', 'Auvergne-Rhône-Alpes'],
  SPAWN_DELAY: 3000,
  INTERACTION_DISTANCE: 50
};

// 💬 DIALOGUES DU SPACE MARINE
const MARINE_DIALOGUES = {
  greeting: [
    "Space Marine Shadow Unit reportant pour le devoir !",
    "Bonjour citoyen. Ce site est sous ma protection.",
    "Pour le Monarque des Ombres !",
    "Protocole de patrouille activé.",
    "BuilderBeru.com - Secteur sécurisé."
  ],
  combat: [
    "Élimination des éléments hostiles !",
    "Lasers armés et prêts !",
    "Le DOM sera purifié !",
    "Aucune pitié pour le code mal optimisé !",
    "Destruction autorisée par le Monarque !"
  ],
  idle: [
    "Scan du périmètre...",
    "Aucune menace détectée.",
    "Ce site mérite plus de visiteurs.",
    "Qualité technique exceptionnelle confirmée.",
    "En attente d'ordres..."
  ],
  destruction: [
    "PROTOCOLE DESTRUCTION TOTALE ACTIVÉ !",
    "LE DOM NE SURVIVRA PAS !",
    "PURIFICATION PAR LE FEU !",
    "POUR L'EMPEREUR... EUH, LE MONARQUE !",
    "AUCUN ÉLÉMENT NE SERA ÉPARGNÉ !"
  ]
};

// 🎮 ACTIONS INTERACTIVES
const MARINE_ACTIONS = [
  {
    id: 'patrol',
    label: '🚶 Patrouiller',
    description: 'Le marine patrouille le site',
    type: 'normal'
  },
  {
    id: 'scan',
    label: '📡 Scanner',
    description: 'Analyse les éléments du DOM',
    type: 'normal'
  },
  {
    id: 'shield',
    label: '🛡️ Bouclier',
    description: 'Active le bouclier énergétique',
    type: 'normal'
  },
  {
    id: 'laser',
    label: '🔫 Tir laser',
    description: 'Tire des lasers sur des cibles',
    type: 'combat'
  },
  {
    id: 'plasma',
    label: '💥 Grenade plasma',
    description: 'Lance une grenade plasma',
    type: 'combat'
  },
  {
    id: 'destruction',
    label: '☠️ DESTRUCTION TOTALE',
    description: 'Détruit 30% du site !',
    type: 'danger'
  }
];

const SpaceMarineShadowTrail = () => {
  // 🎯 ÉTATS
  const [isActive, setIsActive] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [direction, setDirection] = useState('down');
  const [currentAction, setCurrentAction] = useState('idle');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hudData, setHudData] = useState({
    health: 100,
    shield: 100,
    ammo: 50,
    kills: 0,
    region: 'Unknown'
  });
  const [dialogue, setDialogue] = useState('');
  const [targetPosition, setTargetPosition] = useState(null);
  const [lasers, setLasers] = useState([]);
  const [impacts, setImpacts] = useState([]);
  const [isPatrolling, setIsPatrolling] = useState(false);
  const [destroyedElements, setDestroyedElements] = useState(new Set());
  const [plasmaCooldown, setPlasmaCooldown] = useState(false);
  const [shieldActive, setShieldActive] = useState(false);
  
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const patrolPathRef = useRef([]);
  const mousePositionRef = useRef({ x: 0, y: 0 });

  // 🌍 DÉTECTION RÉGIONALE
  useEffect(() => {
    const checkRegion = async () => {
      let authorized = false;
      let detectedRegion = 'Unknown';
      
      try {
        // Option 2: ipinfo.io
        try {
          const response2 = await fetch('https://ipinfo.io/json');
          const data2 = await response2.json();
          
          const region = data2.region || data2.city || data2.regionName;
          
          if (region && MARINE_CONFIG.ALLOWED_REGIONS.some(allowed => region.includes(allowed) || allowed.includes(region))) {
            authorized = true;
            detectedRegion = region;
          }
        } catch (error) {
          console.error('ipinfo.io failed:', error);
        }
        
        // Option 3: geolocation-db.com
        if (!authorized) {
          try {
            const response3 = await fetch('https://geolocation-db.com/json/');
            const data3 = await response3.json();
            
            const state = data3.state || data3.region_name || data3.state_prov;
            
            if (state && MARINE_CONFIG.ALLOWED_REGIONS.some(allowed => state.includes(allowed) || allowed.includes(state))) {
              authorized = true;
              detectedRegion = state;
            }
          } catch (error) {
            console.error('geolocation-db failed:', error);
          }
        }
        
        setIsAuthorized(authorized);
        setHudData(prev => ({ ...prev, region: detectedRegion }));
        
        if (authorized) {
          setTimeout(() => setIsActive(true), MARINE_CONFIG.SPAWN_DELAY);
        }
        
      } catch (error) {
        console.error('Critical error in region detection:', error);
      }
    };
    
    checkRegion();
  }, []);

  // 🖱️ TRACKING SOURIS
  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 🎯 CALCULS UTILITAIRES
  const getDistance = useCallback((pos1, pos2) => {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const getDirection = useCallback((from, to) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    if (angle >= -45 && angle < 45) return 'right';
    if (angle >= 45 && angle < 135) return 'down';
    if (angle >= -135 && angle < -45) return 'up';
    return 'left';
  }, []);

  // 💬 SYSTÈME DE DIALOGUE
  const showDialogue = useCallback((type) => {
    const messages = MARINE_DIALOGUES[type];
    const message = messages[Math.floor(Math.random() * messages.length)];
    setDialogue(message);
    
    setTimeout(() => setDialogue(''), 3000);
  }, []);

  // 🚶 SYSTÈME DE PATROUILLE
  const startPatrol = useCallback(() => {
    setIsPatrolling(true);
    setCurrentAction('patrol');
    showDialogue('greeting');
    
    // Générer un chemin de patrouille
    const points = [];
    const numPoints = 5;
    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: Math.random() * (window.innerWidth - 200) + 100,
        y: Math.random() * (window.innerHeight - 200) + 100
      });
    }
    patrolPathRef.current = points;
  }, [showDialogue]);

  // 📡 SCAN DU DOM
  const scanDOM = useCallback(() => {
    setCurrentAction('scan');
    showDialogue('idle');
    
    // Effet visuel de scan
    const elements = document.querySelectorAll('div, button, img, p, h1, h2, h3');
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.style.outline = '2px solid #00aaff';
        el.style.outlineOffset = '2px';
        setTimeout(() => {
          el.style.outline = '';
          el.style.outlineOffset = '';
        }, 500);
      }, index * 50);
    });
    
    setTimeout(() => setCurrentAction('idle'), 3000);
  }, [showDialogue]);

  // 🛡️ ACTIVATION BOUCLIER
  const activateShield = useCallback(() => {
    if (shieldActive) return;
    
    setShieldActive(true);
    setCurrentAction('shield');
    showDialogue('combat');
    setHudData(prev => ({ ...prev, shield: 100 }));
    
    // Désactivation après durée
    setTimeout(() => {
      setShieldActive(false);
      setHudData(prev => ({ ...prev, shield: 0 }));
    }, MARINE_CONFIG.SHIELD_DURATION);
  }, [shieldActive, showDialogue]);

  // 🔫 SYSTÈME DE TIR LASER
  const fireLaser = useCallback((targetX, targetY) => {
    setCurrentAction('combat');
    showDialogue('combat');
    
    const laserData = {
      id: Date.now(),
      startX: position.x + 75,
      startY: position.y + 75,
      endX: targetX,
      endY: targetY,
      angle: Math.atan2(targetY - position.y, targetX - position.x) * 180 / Math.PI
    };
    
    setLasers(prev => [...prev, laserData]);
    
    // Impact
    setTimeout(() => {
      setImpacts(prev => [...prev, { id: Date.now(), x: targetX, y: targetY }]);
      
      // Détruire l'élément le plus proche
      const element = document.elementFromPoint(targetX, targetY);
      if (element && !element.classList.contains('spacemarine-container')) {
        element.classList.add('element-disintegrating');
        setDestroyedElements(prev => new Set([...prev, element]));
        setHudData(prev => ({ ...prev, kills: prev.kills + 1 }));
        
        setTimeout(() => {
          element.style.display = 'none';
        }, 1000);
      }
      
      // Nettoyage
      setTimeout(() => {
        setLasers(prev => prev.filter(l => l.id !== laserData.id));
        setImpacts(prev => prev.filter(i => i.id !== laserData.id));
      }, 500);
    }, 200);
    
    setHudData(prev => ({ ...prev, ammo: Math.max(0, prev.ammo - 1) }));
  }, [position]);

  // 💥 GRENADE PLASMA
  const throwPlasmaGrenade = useCallback((targetX, targetY) => {
    if (plasmaCooldown) return;
    
    setPlasmaCooldown(true);
    setCurrentAction('combat');
    showDialogue('combat');
    
    // Créer l'effet plasma
    const plasma = document.createElement('div');
    plasma.className = 'plasma-burn';
    plasma.style.left = `${targetX - 50}px`;
    plasma.style.top = `${targetY - 50}px`;
    document.body.appendChild(plasma);
    
    // Destruction en zone
    const blastRadius = 150;
    const elements = document.querySelectorAll('*');
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const elX = rect.left + rect.width / 2;
      const elY = rect.top + rect.height / 2;
      
      if (getDistance({ x: elX, y: elY }, { x: targetX, y: targetY }) < blastRadius) {
        if (!el.classList.contains('spacemarine-container')) {
          el.classList.add('element-glitching');
          setTimeout(() => {
            el.classList.add('element-disintegrating');
            setDestroyedElements(prev => new Set([...prev, el]));
          }, 500);
        }
      }
    });
    
    // Nettoyage
    setTimeout(() => {
      plasma.remove();
      setPlasmaCooldown(false);
    }, MARINE_CONFIG.PLASMA_COOLDOWN);
  }, [plasmaCooldown, getDistance, showDialogue]);

  // ☠️ DESTRUCTION TOTALE
  const totalDestruction = useCallback(() => {
    setCurrentAction('destruction');
    showDialogue('destruction');
    document.body.classList.add('site-under-attack');
    
    // Sélection aléatoire de 30% des éléments
    const allElements = Array.from(document.querySelectorAll('*'));
    const targetCount = Math.floor(allElements.length * MARINE_CONFIG.DESTRUCTION_THRESHOLD);
    const targets = [];
    
    while (targets.length < targetCount) {
      const randomEl = allElements[Math.floor(Math.random() * allElements.length)];
      if (!targets.includes(randomEl) && 
          !randomEl.classList.contains('spacemarine-container') &&
          !randomEl.tagName.match(/^(HTML|HEAD|BODY|SCRIPT|STYLE)$/)) {
        targets.push(randomEl);
      }
    }
    
    // Destruction séquentielle épique
    targets.forEach((el, index) => {
      setTimeout(() => {
        // Tir laser sur l'élément
        const rect = el.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2;
        const targetY = rect.top + rect.height / 2;
        
        fireLaser(targetX, targetY);
        
        // Effets variés
        const effects = ['disintegrating', 'glitching'];
        const effect = effects[Math.floor(Math.random() * effects.length)];
        el.classList.add(`element-${effect}`);
        
        if (Math.random() > 0.5) {
          el.style.transform = `rotate(${Math.random() * 720 - 360}deg) scale(0)`;
        }
        
        setHudData(prev => ({ ...prev, kills: prev.kills + 1 }));
      }, index * 100);
    });
    
    // Arrêt après 10 secondes
    setTimeout(() => {
      document.body.classList.remove('site-under-attack');
      setCurrentAction('idle');
      showDialogue('idle');
    }, 10000);
  }, [fireLaser, showDialogue]);

  // 🎮 GESTIONNAIRE D'ACTIONS
  const handleAction = useCallback((actionId) => {
    setIsMenuOpen(false);
    
    switch (actionId) {
      case 'patrol':
        startPatrol();
        break;
      case 'scan':
        scanDOM();
        break;
      case 'shield':
        activateShield();
        break;
      case 'laser':
        // Tirer vers une position aléatoire
        const laserTargetX = Math.random() * window.innerWidth;
        const laserTargetY = Math.random() * window.innerHeight;
        fireLaser(laserTargetX, laserTargetY);
        break;
      case 'plasma':
        // Lancer vers la souris
        throwPlasmaGrenade(mousePositionRef.current.x, mousePositionRef.current.y);
        break;
      case 'destruction':
        if (window.confirm('⚠️ ATTENTION: Cette action va détruire 30% du site! Continuer?')) {
          totalDestruction();
        }
        break;
      default:
        break;
    }
  }, [startPatrol, scanDOM, activateShield, fireLaser, throwPlasmaGrenade, totalDestruction]);

  // 🎯 MOUVEMENT AUTOMATIQUE
  useEffect(() => {
    if (!isActive) return;
    
    const moveToTarget = () => {
      if (targetPosition) {
        const dx = targetPosition.x - position.x;
        const dy = targetPosition.y - position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
          const moveX = (dx / distance) * MARINE_CONFIG.SPEED;
          const moveY = (dy / distance) * MARINE_CONFIG.SPEED;
          
          setPosition(prev => ({
            x: prev.x + moveX,
            y: prev.y + moveY
          }));
          
          setDirection(getDirection(position, targetPosition));
        } else {
          setTargetPosition(null);
        }
      } else if (isPatrolling && patrolPathRef.current.length > 0) {
        // Patrouille automatique
        const currentTarget = patrolPathRef.current[0];
        const distance = getDistance(position, currentTarget);
        
        if (distance < 10) {
          // Atteint le point, passer au suivant
          patrolPathRef.current.push(patrolPathRef.current.shift());
        } else {
          setTargetPosition(currentTarget);
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(moveToTarget);
    };
    
    animationFrameRef.current = requestAnimationFrame(moveToTarget);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, position, targetPosition, isPatrolling, getDistance, getDirection]);

  // 🎯 CLICK TO MOVE
  useEffect(() => {
    const handleClick = (e) => {
      if (!isActive || e.target.closest('.spacemarine-container')) return;
      
      setTargetPosition({ x: e.clientX - 75, y: e.clientY - 75 });
      setIsPatrolling(false);
    };
    
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isActive]);

  // 🎮 RACCOURCIS CLAVIER
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isActive) return;
      
      switch(e.key.toLowerCase()) {
        case 'p':
          startPatrol();
          break;
        case 's':
          scanDOM();
          break;
        case 'b':
          activateShield();
          break;
        case 'l':
          fireLaser(mousePositionRef.current.x, mousePositionRef.current.y);
          break;
        case 'g':
          throwPlasmaGrenade(mousePositionRef.current.x, mousePositionRef.current.y);
          break;
        case 'd':
          if (e.shiftKey) {
            totalDestruction();
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isActive, startPatrol, scanDOM, activateShield, fireLaser, throwPlasmaGrenade, totalDestruction]);

  // Ne pas afficher si non autorisé ou inactif
  if (!isAuthorized || !isActive) return null;

  return (
    <>
      {/* CONTENEUR PRINCIPAL */}
      <div 
        ref={containerRef}
        className={`spacemarine-container spacemarine-${currentAction} ${shieldActive ? 'spacemarine-shielded' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`
        }}
        onMouseEnter={() => setIsMenuOpen(true)}
        onMouseLeave={() => setIsMenuOpen(false)}
      >
        {/* SPRITE */}
        <div className="spacemarine-sprite">
          <img 
            src={SPACEMARINE_SPRITES[direction]}
            alt="Space Marine"
            className="spacemarine-image"
          />
          
          {/* Bouclier */}
          {shieldActive && <div className="marine-shield"></div>}
          
          {/* Particules d'énergie */}
          {currentAction === 'combat' && (
            <div className="energy-particles">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="energy-particle" 
                  style={{
                    '--particle-x': `${(Math.random() - 0.5) * 100}px`,
                    animationDelay: `${i * 0.3}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* MENU D'INTERACTION */}
        <div className={`spacemarine-menu ${isMenuOpen ? 'open' : ''}`}>
          {MARINE_ACTIONS.map(action => (
            <button
              key={action.id}
              className={`marine-action-btn ${action.type === 'danger' ? 'danger' : ''}`}
              onClick={() => handleAction(action.id)}
              disabled={action.id === 'plasma' && plasmaCooldown}
            >
              {action.label}
            </button>
          ))}
        </div>
        
        {/* BULLE DE DIALOGUE */}
        {dialogue && (
          <div className="marine-dialogue" style={{
            position: 'absolute',
            bottom: '120%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.9)',
            color: '#00aaff',
            padding: '10px 15px',
            borderRadius: '10px',
            border: '1px solid #00aaff',
            whiteSpace: 'nowrap',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 0 20px rgba(0, 149, 255, 0.6)'
          }}>
            {dialogue}
          </div>
        )}
      </div>
      
      {/* HUD TACTIQUE */}
      <div className={`marine-hud ${currentAction !== 'idle' ? 'active' : ''}`}>
        <div className="hud-line">
          <span>REGION:</span>
          <span className="hud-value">{hudData.region}</span>
        </div>
        <div className="hud-line">
          <span>SANTÉ:</span>
          <span className="hud-value">{hudData.health}%</span>
        </div>
        <div className="hud-line">
          <span>BOUCLIER:</span>
          <span className="hud-value">{hudData.shield}%</span>
        </div>
        <div className="hud-line">
          <span>MUNITIONS:</span>
          <span className="hud-value">{hudData.ammo}</span>
        </div>
        <div className="hud-line">
          <span>ÉLIMINATIONS:</span>
          <span className="hud-value">{hudData.kills}</span>
        </div>
        <div className="hud-line" style={{ marginTop: '10px', fontSize: '12px', opacity: 0.7 }}>
          <span>COMMANDES: P(atrouille) S(can) B(ouclier) L(aser) G(renade)</span>
        </div>
      </div>
      
      {/* EFFETS LASER */}
      {lasers.map(laser => (
        <div
          key={laser.id}
          className="laser-beam"
          style={{
            left: `${laser.startX}px`,
            top: `${laser.startY}px`,
            width: `${Math.sqrt(Math.pow(laser.endX - laser.startX, 2) + Math.pow(laser.endY - laser.startY, 2))}px`,
            transform: `rotate(${laser.angle}deg)`
          }}
        />
      ))}
      
      {/* IMPACTS */}
      {impacts.map(impact => (
        <div
          key={impact.id}
          className="laser-impact"
          style={{
            left: `${impact.x - 30}px`,
            top: `${impact.y - 30}px`
          }}
        />
      ))}
    </>
  );
};

export default SpaceMarineShadowTrail;