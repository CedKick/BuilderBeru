// src/components/SpaceMarineShadowTrail/SpaceMarineShadowTrail.jsx
// 🚀 SPACEMARINE SHADOW TRAIL - INTERACTIVE DESTRUCTION EDITION
// ⚔️ Created by Kaisel for the Shadow Monarch
// 🎯 Regional exclusive: Île-de-France & Auvergne-Rhône-Alpes only!
// 💥 WARNING: This component features advanced DOM destruction capabilities

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './SpaceMarineShadowTrail.css';

// 🎨 SPRITES DU SPACE MARINE
const SPACEMARINE_SPRITES = {
  down: "https://api.builderberu.com/cdn/images/spacemarine_down_ltt8cs.webp",
  left: "https://api.builderberu.com/cdn/images/spacemarine_left_ya1o1o.webp",
  right: "https://api.builderberu.com/cdn/images/spacemarine_right_iobccn.webp",
  up: "https://api.builderberu.com/cdn/images/spacemarine_up_sprcwc.webp"
};

// 🎯 CONFIGURATION
const MARINE_CONFIG = {
  SPEED: 2,
  PATROL_RADIUS: 300,
  LASER_RANGE: 500,
  LASER_DAMAGE: 100,
  SHIELD_DURATION: 5000,
  PLASMA_COOLDOWN: 3000,
  DESTRUCTION_THRESHOLD: 0.3,
  ALLOWED_REGIONS: ['Auvergne-Rhône-Alpes'],
  SPAWN_DELAY: 3000,
  INTERACTION_DISTANCE: 50,
  INVASION_CHANCE: 0.01,
  INVASION_CHECK_INTERVAL: 30000,
  MAX_ENEMIES: 5,
  ENEMY_SPEED: 1.5
};

// 👾 TYPES D'ENNEMIS
const ENEMY_TYPES = [
  {
    id: 'chaos_spawn',
    name: 'Chaos Spawn',
    emoji: '👹',
    health: 50,
    speed: 1,
    damage: 10,
    color: '#ff0066',
    behavior: 'aggressive',
    deathMessage: 'Chaos spawn éliminé !'
  },
  {
    id: 'tyranid',
    name: 'Tyranide',
    emoji: '🦗',
    health: 30,
    speed: 2,
    damage: 5,
    color: '#00ff00',
    behavior: 'swarm',
    deathMessage: 'Xenos purgé !'
  },
  {
    id: 'ork',
    name: 'Ork',
    emoji: '👺',
    health: 80,
    speed: 0.8,
    damage: 15,
    color: '#228b22',
    behavior: 'chaotic',
    deathMessage: 'WAAAGH terminé !'
  },
  {
    id: 'necron',
    name: 'Necron',
    emoji: '💀',
    health: 100,
    speed: 0.5,
    damage: 20,
    color: '#c0c0c0',
    behavior: 'systematic',
    deathMessage: 'Machine détruite !'
  },
  {
    id: 'daemon',
    name: 'Démon du Warp',
    emoji: '😈',
    health: 60,
    speed: 1.5,
    damage: 12,
    color: '#9400d3',
    behavior: 'teleport',
    deathMessage: 'Démon banni !'
  }
];

// 💬 MESSAGES D'INVASION
const INVASION_MESSAGES = {
  start: [
    "🚨 ALERTE ! DÉTECTION D'ACTIVITÉ HOSTILE !",
    "⚠️ BRÈCHE WARP DÉTECTÉE ! INVASION IMMINENTE !",
    "🛡️ PROTOCOLE DE DÉFENSE ACTIVÉ ! ENNEMIS EN APPROCHE !",
    "☠️ ILS ARRIVENT ! PRÉPAREZ-VOUS AU COMBAT !",
    "🔴 CODE ROUGE ! XENOS DÉTECTÉS SUR LE SITE !"
  ],
  during: [
    "Pour l'Empereur ! Aucun ne passera !",
    "Purifiez les hérétiques !",
    "Tenez la ligne ! Protégez BuilderBeru !",
    "La mort plutôt que le déshonneur !",
    "AUCUNE PITIÉ ! AUCUN RÉPIT !"
  ],
  victory: [
    "✨ Victoire ! Les envahisseurs ont été repoussés !",
    "🎖️ Site sécurisé ! Gloire au Monarque des Ombres !",
    "💪 Aucun ennemi n'a survécu ! BuilderBeru est sauvé !",
    "🏆 Invasion repoussée avec succès !",
    "⭐ L'Empereur serait fier ! Site défendu !"
  ]
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
  const [enemies, setEnemies] = useState([]);
  const [invasionActive, setInvasionActive] = useState(false);
  const [enemiesDestroyed, setEnemiesDestroyed] = useState(0);
  
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const patrolPathRef = useRef([]);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const invasionCheckRef = useRef(null);

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
    
    setTimeout(() => {
      setShieldActive(false);
      setHudData(prev => ({ ...prev, shield: 0 }));
    }, MARINE_CONFIG.SHIELD_DURATION);
  }, [shieldActive, showDialogue]);

  // 🔫 SYSTÈME DE TIR LASER - Déclaré en premier
  const fireLaser = useCallback((targetX, targetY) => {
    setCurrentAction('combat');
    showDialogue('combat');
    
    // Orienter le marine vers la cible
    const newDirection = getDirection(position, { x: targetX, y: targetY });
    setDirection(newDirection);
    
    // Position de départ du laser selon la direction
    let startX = position.x + 75;
    let startY = position.y + 75;
    
    // Ajuster le point de départ selon la direction
    switch(newDirection) {
      case 'up':
        startY = position.y + 30;
        break;
      case 'down':
        startY = position.y + 120;
        break;
      case 'left':
        startX = position.x + 30;
        break;
      case 'right':
        startX = position.x + 120;
        break;
    }
    
    const laserData = {
      id: Date.now(),
      startX,
      startY,
      endX: targetX,
      endY: targetY,
      angle: Math.atan2(targetY - startY, targetX - startX) * 180 / Math.PI
    };
    
    setLasers(prev => [...prev, laserData]);
    
    setTimeout(() => {
      setImpacts(prev => [...prev, { id: Date.now(), x: targetX, y: targetY }]);
      
      // Pendant une invasion, ne détruire que les ennemis
      if (!invasionActive) {
        const element = document.elementFromPoint(targetX, targetY);
        if (element && !element.classList.contains('spacemarine-container') && !element.classList.contains('enemy-container')) {
          element.classList.add('element-disintegrating');
          setDestroyedElements(prev => new Set([...prev, element]));
          setHudData(prev => ({ ...prev, kills: prev.kills + 1 }));
          
          setTimeout(() => {
            element.style.display = 'none';
          }, 1000);
        }
      }
      
      setTimeout(() => {
        setLasers(prev => prev.filter(l => l.id !== laserData.id));
        setImpacts(prev => prev.filter(i => i.id !== laserData.id));
      }, 500);
    }, 200);
    
    setHudData(prev => ({ ...prev, ammo: Math.max(0, prev.ammo - 1) }));
  }, [position, showDialogue, getDirection, invasionActive]);

  // 💥 GRENADE PLASMA
  const throwPlasmaGrenade = useCallback((targetX, targetY) => {
    if (plasmaCooldown) return;
    
    setPlasmaCooldown(true);
    setCurrentAction('combat');
    showDialogue('combat');
    
    const plasma = document.createElement('div');
    plasma.className = 'plasma-burn';
    plasma.style.left = `${targetX - 50}px`;
    plasma.style.top = `${targetY - 50}px`;
    document.body.appendChild(plasma);
    
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
    
    targets.forEach((el, index) => {
      setTimeout(() => {
        const rect = el.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2;
        const targetY = rect.top + rect.height / 2;
        
        fireLaser(targetX, targetY);
        
        const effects = ['disintegrating', 'glitching'];
        const effect = effects[Math.floor(Math.random() * effects.length)];
        el.classList.add(`element-${effect}`);
        
        if (Math.random() > 0.5) {
          el.style.transform = `rotate(${Math.random() * 720 - 360}deg) scale(0)`;
        }
        
        setHudData(prev => ({ ...prev, kills: prev.kills + 1 }));
      }, index * 100);
    });
    
    setTimeout(() => {
      document.body.classList.remove('site-under-attack');
      setCurrentAction('idle');
      showDialogue('idle');
    }, 10000);
  }, [fireLaser, showDialogue]);

  // 👾 SYSTÈME D'INVASION
  const damageEnemy = useCallback((enemyId, damage) => {
    setEnemies(prev => prev.map(enemy => {
      if (enemy.id === enemyId) {
        const newHealth = enemy.health - damage;
        if (newHealth <= 0) {
          setEnemiesDestroyed(count => count + 1);
          setHudData(prev => ({ ...prev, kills: prev.kills + 1 }));
          setDialogue(enemy.type.deathMessage);
          
          const deathEffect = document.createElement('div');
          deathEffect.className = 'enemy-death-effect';
          deathEffect.style.left = `${enemy.x}px`;
          deathEffect.style.top = `${enemy.y}px`;
          deathEffect.innerHTML = '💥';
          document.body.appendChild(deathEffect);
          
          setTimeout(() => deathEffect.remove(), 1000);
          
          return null;
        }
        return { ...enemy, health: newHealth };
      }
      return enemy;
    }).filter(Boolean));
  }, []);

  const spawnEnemy = useCallback(() => {
    const enemyType = ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)];
    const side = Math.floor(Math.random() * 4);
    let x, y;
    
    switch(side) {
      case 0: x = Math.random() * window.innerWidth; y = -50; break;
      case 1: x = window.innerWidth + 50; y = Math.random() * window.innerHeight; break;
      case 2: x = Math.random() * window.innerWidth; y = window.innerHeight + 50; break;
      case 3: x = -50; y = Math.random() * window.innerHeight; break;
    }
    
    const enemy = {
      id: Date.now() + Math.random(),
      type: enemyType,
      x,
      y,
      health: enemyType.health,
      maxHealth: enemyType.health,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2,
      lastTeleport: 0
    };
    
    setEnemies(prev => [...prev, enemy]);
  }, []);

  const startInvasion = useCallback(() => {
    setInvasionActive(true);
    setCurrentAction('combat');
    
    const alertMsg = INVASION_MESSAGES.start[Math.floor(Math.random() * INVASION_MESSAGES.start.length)];
    showDialogue('destruction');
    setDialogue(alertMsg);
    
    document.body.classList.add('site-under-attack');
    
    const enemyCount = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < enemyCount; i++) {
      setTimeout(() => spawnEnemy(), i * 500);
    }
    
    let spawnInterval = setInterval(() => {
      if (enemies.length < MARINE_CONFIG.MAX_ENEMIES && Math.random() < 0.3) {
        spawnEnemy();
      }
    }, 3000);
    
    // Stocker l'interval dans une variable locale
    const checkVictory = setInterval(() => {
      // Vérifier si tous les ennemis sont morts
      if (enemies.length === 0 && invasionActive) {
        clearInterval(spawnInterval);
        clearInterval(checkVictory);
        setInvasionActive(false);
        document.body.classList.remove('site-under-attack');
        
        const victoryMsg = INVASION_MESSAGES.victory[Math.floor(Math.random() * INVASION_MESSAGES.victory.length)];
        setDialogue(victoryMsg);
        setCurrentAction('idle');
        
        // Bonus de munitions après victoire
        setHudData(prev => ({ ...prev, ammo: Math.min(100, prev.ammo + 20) }));
      }
    }, 1000);
    
    // Durée maximale de l'invasion
    setTimeout(() => {
      clearInterval(spawnInterval);
      clearInterval(checkVictory);
      if (invasionActive) {
        setInvasionActive(false);
        document.body.classList.remove('site-under-attack');
        setCurrentAction('idle');
      }
    }, 60000); // 1 minute max
  }, [spawnEnemy, showDialogue, enemies.length, invasionActive]);

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
        const currentTarget = patrolPathRef.current[0];
        const distance = getDistance(position, currentTarget);
        
        if (distance < 10) {
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

  // 🎯 DOUBLE CLICK TO MOVE
  useEffect(() => {
    const handleDoubleClick = (e) => {
      if (!isActive || e.target.closest('.spacemarine-container')) return;
      
      setTargetPosition({ x: e.clientX - 75, y: e.clientY - 75 });
      setIsPatrolling(false);
    };
    
    window.addEventListener('dblclick', handleDoubleClick);
    return () => window.removeEventListener('dblclick', handleDoubleClick);
  }, [isActive]);

  // 🎮 CHECK PÉRIODIQUE D'INVASION
  useEffect(() => {
    if (!isActive || invasionActive) return;
    
    const checkInvasion = () => {
      if (Math.random() < MARINE_CONFIG.INVASION_CHANCE) {
        startInvasion();
      }
    };
    
    invasionCheckRef.current = setInterval(checkInvasion, MARINE_CONFIG.INVASION_CHECK_INTERVAL);
    
    return () => {
      if (invasionCheckRef.current) {
        clearInterval(invasionCheckRef.current);
      }
    };
  }, [isActive, invasionActive, startInvasion]);

  // 🎯 MOUVEMENT DES ENNEMIS
  useEffect(() => {
    if (enemies.length === 0) return;
    
    const moveEnemies = () => {
      setEnemies(prev => prev.map(enemy => {
        if (!enemy) return null;
        
        let newX = enemy.x;
        let newY = enemy.y;
        
        switch(enemy.type.behavior) {
          case 'aggressive':
            const dxToMarine = position.x + 75 - enemy.x;
            const dyToMarine = position.y + 75 - enemy.y;
            const distToMarine = Math.sqrt(dxToMarine * dxToMarine + dyToMarine * dyToMarine);
            
            if (distToMarine > 10) {
              newX += (dxToMarine / distToMarine) * enemy.type.speed * MARINE_CONFIG.ENEMY_SPEED;
              newY += (dyToMarine / distToMarine) * enemy.type.speed * MARINE_CONFIG.ENEMY_SPEED;
            }
            break;
            
          case 'swarm':
            const dxToCenter = window.innerWidth / 2 - enemy.x;
            const dyToCenter = window.innerHeight / 2 - enemy.y;
            const distToCenter = Math.sqrt(dxToCenter * dxToCenter + dyToCenter * dyToCenter);
            
            if (distToCenter > 100) {
              newX += (dxToCenter / distToCenter) * enemy.type.speed * MARINE_CONFIG.ENEMY_SPEED;
              newY += (dyToCenter / distToCenter) * enemy.type.speed * MARINE_CONFIG.ENEMY_SPEED;
            }
            break;
            
          case 'chaotic':
            newX += (Math.random() - 0.5) * enemy.type.speed * MARINE_CONFIG.ENEMY_SPEED * 4;
            newY += (Math.random() - 0.5) * enemy.type.speed * MARINE_CONFIG.ENEMY_SPEED * 4;
            break;
            
          case 'systematic':
            const gridSize = 50;
            const targetGridX = Math.round(position.x / gridSize) * gridSize;
            const targetGridY = Math.round(position.y / gridSize) * gridSize;
            
            newX += Math.sign(targetGridX - enemy.x) * enemy.type.speed * MARINE_CONFIG.ENEMY_SPEED;
            newY += Math.sign(targetGridY - enemy.y) * enemy.type.speed * MARINE_CONFIG.ENEMY_SPEED;
            break;
            
          case 'teleport':
            if (Date.now() - enemy.lastTeleport > 5000 && Math.random() < 0.02) {
              newX = Math.random() * window.innerWidth;
              newY = Math.random() * window.innerHeight;
              enemy.lastTeleport = Date.now();
              
              const teleportEffect = document.createElement('div');
              teleportEffect.className = 'teleport-effect';
              teleportEffect.style.left = `${enemy.x}px`;
              teleportEffect.style.top = `${enemy.y}px`;
              document.body.appendChild(teleportEffect);
              setTimeout(() => teleportEffect.remove(), 500);
            } else {
              const dx = position.x - enemy.x;
              const dy = position.y - enemy.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              
              if (dist > 10) {
                newX += (dx / dist) * enemy.type.speed * MARINE_CONFIG.ENEMY_SPEED;
                newY += (dy / dist) * enemy.type.speed * MARINE_CONFIG.ENEMY_SPEED;
              }
            }
            break;
        }
        
        newX = Math.max(0, Math.min(window.innerWidth - 50, newX));
        newY = Math.max(0, Math.min(window.innerHeight - 50, newY));
        
        const distanceToMarine = getDistance({ x: newX, y: newY }, { x: position.x + 75, y: position.y + 75 });
        if (distanceToMarine < 50 && !shieldActive) {
          setHudData(prev => ({ 
            ...prev, 
            health: Math.max(0, prev.health - enemy.type.damage) 
          }));
          
          const pushbackAngle = Math.atan2(enemy.y - position.y, enemy.x - position.x);
          newX += Math.cos(pushbackAngle) * 50;
          newY += Math.sin(pushbackAngle) * 50;
        }
        
        return { ...enemy, x: newX, y: newY };
      }).filter(Boolean));
    };
    
    const enemyMoveInterval = setInterval(moveEnemies, 50);
    
    return () => clearInterval(enemyMoveInterval);
  }, [enemies, position, shieldActive, getDistance]);

  // 🔫 AUTO-DÉFENSE
  useEffect(() => {
    if (!invasionActive || enemies.length === 0 || currentAction === 'destruction') return;
    
    const autoDefend = () => {
      let closestEnemy = null;
      let closestDistance = Infinity;
      
      enemies.forEach(enemy => {
        const distance = getDistance(
          { x: enemy.x + 25, y: enemy.y + 25 }, 
          { x: position.x + 75, y: position.y + 75 }
        );
        if (distance < closestDistance) {
          closestDistance = distance;
          closestEnemy = enemy;
        }
      });
      
      if (closestEnemy && closestDistance < MARINE_CONFIG.LASER_RANGE && hudData.ammo > 0) {
        fireLaser(closestEnemy.x + 25, closestEnemy.y + 25);
        damageEnemy(closestEnemy.id, MARINE_CONFIG.LASER_DAMAGE);
      }
    };
    
    const defendInterval = setInterval(autoDefend, 1000);
    
    return () => clearInterval(defendInterval);
  }, [invasionActive, enemies, currentAction, position, hudData.ammo, getDistance, fireLaser, damageEnemy]);

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
        // Pendant une invasion, viser l'ennemi le plus proche
        if (invasionActive && enemies.length > 0) {
          let closestEnemy = null;
          let closestDistance = Infinity;
          
          enemies.forEach(enemy => {
            const distance = getDistance(
              { x: enemy.x + 25, y: enemy.y + 25 }, 
              { x: position.x + 75, y: position.y + 75 }
            );
            if (distance < closestDistance) {
              closestDistance = distance;
              closestEnemy = enemy;
            }
          });
          
          if (closestEnemy) {
            fireLaser(closestEnemy.x + 25, closestEnemy.y + 25);
            damageEnemy(closestEnemy.id, MARINE_CONFIG.LASER_DAMAGE);
          }
        } else {
          // Tirer vers une position aléatoire
          const laserTargetX = Math.random() * window.innerWidth;
          const laserTargetY = Math.random() * window.innerHeight;
          fireLaser(laserTargetX, laserTargetY);
        }
        break;
      case 'plasma':
        throwPlasmaGrenade(mousePositionRef.current.x, mousePositionRef.current.y);
        break;
      case 'destruction':
        if (invasionActive) {
          alert('⚠️ IMPOSSIBLE ! Défendez le site contre l\'invasion d\'abord !');
        } else if (window.confirm('⚠️ ATTENTION: Cette action va détruire 30% du site! Continuer?')) {
          totalDestruction();
        }
        break;
      default:
        break;
    }
  }, [startPatrol, scanDOM, activateShield, fireLaser, throwPlasmaGrenade, totalDestruction]);

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
          // Pendant une invasion, viser l'ennemi le plus proche de la souris
          if (invasionActive && enemies.length > 0) {
            let closestEnemy = null;
            let closestDistance = Infinity;
            
            enemies.forEach(enemy => {
              const distance = getDistance(
                { x: enemy.x + 25, y: enemy.y + 25 }, 
                mousePositionRef.current
              );
              if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
              }
            });
            
            if (closestEnemy) {
              fireLaser(closestEnemy.x + 25, closestEnemy.y + 25);
              damageEnemy(closestEnemy.id, MARINE_CONFIG.LASER_DAMAGE);
            }
          } else {
            // Tirer vers la souris normalement
            fireLaser(mousePositionRef.current.x, mousePositionRef.current.y);
          }
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
          <img loading="lazy" 
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
          <div style={{
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
            boxShadow: '0 0 20px rgba(0, 149, 255, 0.6)',
            zIndex: 10650
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
        <div className="hud-line" style={{ fontSize: '12px', opacity: 0.7 }}>
          <span>DOUBLE-CLIC pour déplacer</span>
        </div>
        {invasionActive && (
          <div className="hud-line" style={{ marginTop: '10px', color: '#ff0000', fontWeight: 'bold' }}>
            <span>⚠️ INVASION EN COURS ⚠️</span>
          </div>
        )}
      </div>
      
      {/* ENNEMIS */}
      {enemies.map(enemy => (
        <div
          key={enemy.id}
          className="enemy-container"
          style={{
            left: `${enemy.x}px`,
            top: `${enemy.y}px`,
            '--enemy-color': enemy.type.color
          }}
        >
          <div className="enemy-sprite">
            {enemy.type.emoji}
          </div>
          <div className="enemy-health-bar">
            <div 
              className="enemy-health-fill" 
              style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
            />
          </div>
        </div>
      ))}
      
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