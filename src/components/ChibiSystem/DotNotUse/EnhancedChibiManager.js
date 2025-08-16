// 🎮 ENHANCED CHIBI MANAGER
// Version améliorée du gestionnaire de Chibis avec support multi-sprites
// Par Kaisel 🐉 pour le Monarque des Ombres

import { CHIBI_SPRITES, CHIBI_PERSONALITIES, getChibiConfig } from './ChibiSpritesConfig';

export class EnhancedChibiManager {
  constructor() {
    this.entities = new Map();
    this.canvasContexts = new Map();
    this.backgroundImages = new Map();
    this.messageIntervals = new Map();
    this.wanderTimers = new Map();
    this.animationId = null;
    this.callbacks = {};
    this.isTutorialActive = false;
    
    // 🎮 Nouveaux systèmes
    this.interactions = new Map(); // Interactions entre chibis
    this.specialStates = new Map(); // États spéciaux des chibis
    this.chibiRelationships = new Map(); // Relations entre chibis
  }

  // 🚀 INITIALISATION
  init(canvasIds, callbacks) {
    this.callbacks = callbacks;
    
    canvasIds.forEach(canvasId => {
      const canvas = document.getElementById(canvasId);
      if (canvas) {
        const ctx = canvas.getContext('2d');
        this.canvasContexts.set(canvasId, ctx);
        
        // Créer et charger l'image de fond
        const bgImg = new Image();
        bgImg.onload = () => {
          this.backgroundImages.set(canvasId, bgImg);
        };
        bgImg.src = `data:image/svg+xml,${encodeURIComponent(this.generateCanvasBackground(canvas))}`;
      }
    });
    
    this.setupRelationships();
    this.startAnimation();
  }

  // 🎨 GÉNÉRATION DE FOND
  generateCanvasBackground(canvas) {
    const svg = `
      <svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="grad">
            <stop offset="0%" style="stop-color:rgba(138,43,226,0.1)"/>
            <stop offset="100%" style="stop-color:transparent"/>
          </radialGradient>
        </defs>
        <rect width="${canvas.width}" height="${canvas.height}" fill="url(#grad)"/>
      </svg>
    `;
    return svg;
  }

  // 🌟 SPAWN ENTITY AMÉLIORÉ
  spawnEntity(entityType, customConfig = {}) {
    const config = getChibiConfig(entityType);
    if (!config) {
      console.error(`🚫 Type de chibi inconnu: ${entityType}`);
      return;
    }

    // Vérifier si l'entité existe déjà
    if (this.entities.has(entityType)) {
      console.log(`⚠️ ${config.name} est déjà présent`);
      return;
    }

    // Sélectionner le canvas
    let targetCanvas;
    if (config.preferredCanvas === 'random') {
      const canvasIds = Array.from(this.canvasContexts.keys());
      targetCanvas = canvasIds[Math.floor(Math.random() * canvasIds.length)];
    } else {
      targetCanvas = config.preferredCanvas;
    }

    const canvas = document.getElementById(targetCanvas);
    if (!canvas) return;

    // Créer l'entité
    const entity = {
      id: entityType,
      type: entityType,
      name: config.name,
      size: config.size,
      x: Math.random() * (canvas.width - config.size),
      y: canvas.height / 2 + Math.random() * (canvas.height / 2 - config.size),
      speedX: 0,
      speedY: 0,
      direction: null,
      isWandering: false,
      moveSpeed: config.moveSpeed,
      messageInterval: config.messageInterval,
      personality: config.personality,
      sprites: config.sprites,
      color: config.color,
      phrases: customConfig.phrases || [],
      img: new Image(),
      spawnCanvas: canvas,
      currentCanvas: targetCanvas,
      isActive: true,
      currentState: 'idle',
      stateTimer: 0,
      targetEntity: null,
      lastInteraction: 0
    };

    // Charger l'image initiale
    entity.img.onload = () => {
      this.entities.set(entityType, entity);
      this.startEntityMessages(entity);
      
      // Message de bienvenue
      const welcomeMsg = this.getWelcomeMessage(entityType);
      this.showEntityMessage(entityType, welcomeMsg);
    };
    
    entity.img.src = config.sprites.idle || config.icon;
  }

  // 💬 MESSAGES DE BIENVENUE PERSONNALISÉS
  getWelcomeMessage(entityType) {
    const messages = {
      tank: "🛡️ Tank est là ! Prêt à protéger ce builder !",
      beru: "🧠 Béru analyse la situation... Intéressant.",
      kaisel: "🐉 Kaisel.exe initialized. Scanning for bugs...",
      igris: "⚔️ Igris se met en position de garde.",
      igrisk: "⚔️ Igr... *tousse* ...is est arrivé ! Tout va bien !",
      cerbere: "🔥 Cerbère grogne... Qui ose approcher ?"
    };
    return messages[entityType] || `${this.entities.get(entityType)?.name} est arrivé !`;
  }

  // 🤝 SETUP DES RELATIONS ENTRE CHIBIS
  setupRelationships() {
    // Tank a peur de BobbyJones
    this.chibiRelationships.set('tank-bobby', {
      type: 'fear',
      distance: 200,
      reaction: 'flee'
    });
    
    // Béru et Kaisel travaillent ensemble
    this.chibiRelationships.set('beru-kaisel', {
      type: 'cooperation',
      distance: 150,
      reaction: 'coordinate'
    });
    
    // Igris protège tout le monde
    this.chibiRelationships.set('igris-all', {
      type: 'protective',
      distance: 300,
      reaction: 'guard'
    });
  }

  // 🎯 UPDATE ENTITY AMÉLIORÉ
  updateEntity(entity) {
    const personality = CHIBI_PERSONALITIES[entity.personality];
    
    // Mouvement de base
    entity.x += entity.speedX;
    entity.y += entity.speedY;
    
    // Friction
    const friction = 0.9;
    entity.speedX *= friction;
    entity.speedY *= friction;
    
    // Vérifier les interactions
    this.checkInteractions(entity);
    
    // Comportement selon la personnalité
    switch (entity.personality) {
      case 'defensive_funny':
        this.handleTankBehavior(entity, personality);
        break;
      case 'strategic_analyst':
        this.handleBeruBehavior(entity, personality);
        break;
      case 'efficient_debugger':
        this.handleKaiselBehavior(entity, personality);
        break;
      case 'noble_warrior':
        this.handleIgrisBehavior(entity, personality);
        break;
      case 'tank_disguised':
        this.handleIgriskBehavior(entity, personality);
        break;
      case 'fierce_guardian':
        this.handleCerbereBehavior(entity, personality);
        break;
    }
    
    // Mise à jour du sprite selon la direction
    this.updateEntitySprite(entity);
    
    // Limites du canvas
    this.enforceCanvasBounds(entity);
  }

  // 🎨 MISE À JOUR DU SPRITE
  updateEntitySprite(entity) {
    if (!entity.sprites) return;
    
    // Sprite selon l'état spécial
    if (entity.currentState !== 'idle' && entity.sprites[entity.currentState]) {
      entity.img.src = entity.sprites[entity.currentState];
      return;
    }
    
    // Sprite selon la direction
    if (entity.direction && entity.sprites[entity.direction]) {
      entity.img.src = entity.sprites[entity.direction];
    } else if (entity.sprites.idle) {
      entity.img.src = entity.sprites.idle;
    }
  }

  // 🛡️ COMPORTEMENT DE TANK
  handleTankBehavior(entity, personality) {
    // Tank bouge souvent et fait des blagues
    if (!entity.isWandering && Math.random() < personality.wanderChance) {
      this.startWandering(entity);
    }
    
    // Réaction si BobbyJones est mentionné
    if (this.callbacks.lastMessage?.includes('Bobby')) {
      entity.currentState = 'scared';
      this.showEntityMessage('tank', "😰 B-Bobby ? Je... je dois y aller !");
      this.fleeFromPosition(entity, entity.x + 200, entity.y);
    }
  }

  // 🧠 COMPORTEMENT DE BÉRU
  handleBeruBehavior(entity, personality) {
    // Béru analyse et bouge peu
    if (!entity.isWandering && Math.random() < personality.wanderChance) {
      entity.currentState = 'analyzing';
      this.startWandering(entity, true); // Mouvement lent et réfléchi
    }
    
    // Collaboration avec Kaisel
    const kaisel = this.entities.get('kaisel');
    if (kaisel && this.calculateDistance(entity, kaisel) < 150) {
      if (Date.now() - entity.lastInteraction > 30000) {
        this.showEntityMessage('beru', "📊 Kaisel, j'ai trouvé une optimisation intéressante.");
        entity.lastInteraction = Date.now();
      }
    }
  }

  // 🐉 COMPORTEMENT DE KAISEL
  handleKaiselBehavior(entity, personality) {
    // Kaisel est efficace et rapide
    if (!entity.isWandering && Math.random() < personality.wanderChance) {
      entity.currentState = 'scanning';
      this.startWandering(entity);
    }
    
    // Évite Béru pour ne pas se chevaucher
    const beru = this.entities.get('beru');
    if (beru && this.calculateDistance(entity, beru) < 100) {
      this.avoidEntity(entity, beru);
    }
  }

  // ⚔️ COMPORTEMENT D'IGRIS
  handleIgrisBehavior(entity, personality) {
    // Igris patrouille noblement
    if (!entity.isWandering && Math.random() < personality.wanderChance) {
      entity.currentState = 'patrol';
      this.startPatrol(entity);
    }
  }

  // 🎭 COMPORTEMENT D'IGRISK (Tank déguisé)
  handleIgriskBehavior(entity, personality) {
    // Igrisk essaie d'imiter Igris mais glitch parfois
    if (!entity.isWandering && Math.random() < personality.wanderChance) {
      entity.currentState = 'patrol';
      this.startPatrol(entity);
    }
    
    // Glitch occasionnel qui révèle sa vraie nature
    if (Math.random() < 0.001) {
      entity.currentState = 'exposed';
      this.showEntityMessage('igrisk', "Je suis Igr-- *BZZT* TANK.EXE A CESSÉ DE-- Je veux dire... En garde !");
      setTimeout(() => {
        entity.currentState = 'idle';
      }, 3000);
    }
  }

  // 🔥 COMPORTEMENT DE CERBÈRE
  handleCerbereBehavior(entity, personality) {
    // Cerbère garde son territoire
    if (!entity.isWandering && Math.random() < personality.wanderChance) {
      entity.currentState = 'guarding';
      this.guardArea(entity);
    }
  }

  // 🚶 DÉMARRER L'ERRANCE
  startWandering(entity, slow = false) {
    const directions = ['left', 'right', 'up', 'down'];
    entity.direction = directions[Math.floor(Math.random() * directions.length)];
    entity.isWandering = true;
    
    const baseDuration = slow ? 4000 : 2000;
    const wanderDuration = baseDuration + Math.random() * 2000;
    
    const timer = setTimeout(() => {
      entity.isWandering = false;
      entity.direction = null;
      entity.currentState = 'idle';
    }, wanderDuration);
    
    this.wanderTimers.set(entity.id, timer);
  }

  // 🛡️ PATROUILLE (pour Igris)
  startPatrol(entity) {
    entity.isWandering = true;
    let patrolStep = 0;
    const patrolPattern = ['right', 'down', 'left', 'up'];
    
    const patrolInterval = setInterval(() => {
      entity.direction = patrolPattern[patrolStep % 4];
      patrolStep++;
      
      if (patrolStep >= 8) {
        clearInterval(patrolInterval);
        entity.isWandering = false;
        entity.direction = null;
        entity.currentState = 'idle';
      }
    }, 1000);
  }

  // 🏃 FUIR D'UNE POSITION
  fleeFromPosition(entity, fromX, fromY) {
    const dx = entity.x - fromX;
    const dy = entity.y - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      entity.speedX = (dx / distance) * 2;
      entity.speedY = (dy / distance) * 2;
    }
  }

  // 🚫 ÉVITER UNE AUTRE ENTITÉ
  avoidEntity(entity, otherEntity) {
    const dx = entity.x - otherEntity.x;
    const dy = entity.y - otherEntity.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 150 && distance > 0) {
      entity.speedX += (dx / distance) * 0.5;
      entity.speedY += (dy / distance) * 0.5;
    }
  }

  // 🛡️ GARDER UNE ZONE
  guardArea(entity) {
    const centerX = entity.spawnCanvas.width / 2;
    const centerY = entity.spawnCanvas.height * 0.75;
    
    const dx = centerX - entity.x;
    const dy = centerY - entity.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 100) {
      entity.speedX = (dx / distance) * 0.3;
      entity.speedY = (dy / distance) * 0.3;
      entity.isWandering = true;
      
      setTimeout(() => {
        entity.isWandering = false;
        entity.speedX = 0;
        entity.speedY = 0;
      }, 2000);
    }
  }

  // 🤝 VÉRIFIER LES INTERACTIONS
  checkInteractions(entity) {
    this.entities.forEach((otherEntity, otherId) => {
      if (entity.id === otherId) return;
      
      const distance = this.calculateDistance(entity, otherEntity);
      const relationKey = `${entity.id}-${otherId}`;
      const reverseKey = `${otherId}-${entity.id}`;
      
      const relation = this.chibiRelationships.get(relationKey) || 
                      this.chibiRelationships.get(reverseKey);
      
      if (relation && distance < relation.distance) {
        this.handleRelationship(entity, otherEntity, relation);
      }
    });
  }

  // 💭 GÉRER LES RELATIONS
  handleRelationship(entity1, entity2, relation) {
    switch (relation.type) {
      case 'fear':
        this.fleeFromPosition(entity1, entity2.x, entity2.y);
        break;
      case 'cooperation':
        // Les deux entités se rapprochent légèrement
        if (this.calculateDistance(entity1, entity2) > 150) {
          const dx = entity2.x - entity1.x;
          const dy = entity2.y - entity1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          entity1.speedX += (dx / dist) * 0.1;
          entity1.speedY += (dy / dist) * 0.1;
        }
        break;
      case 'protective':
        // L'entité protectrice se positionne entre les menaces
        entity1.currentState = 'guarding';
        break;
    }
  }

  // 📏 CALCULER LA DISTANCE
  calculateDistance(entity1, entity2) {
    const dx = entity1.x - entity2.x;
    const dy = entity1.y - entity2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // 🎨 DESSINER L'ENTITÉ
  drawEntity(entity) {
    const ctx = this.canvasContexts.get(entity.currentCanvas);
    if (!ctx || !entity.img.complete) return;
    
    ctx.save();
    
    // Effets visuels selon l'état
    if (entity.currentState === 'analyzing') {
      ctx.shadowColor = '#8a2be2';
      ctx.shadowBlur = 20;
    } else if (entity.currentState === 'scanning') {
      ctx.shadowColor = '#00ff41';
      ctx.shadowBlur = 15;
    } else if (entity.currentState === 'exposed') {
      // Effet glitch pour Igrisk
      ctx.filter = `hue-rotate(${Math.random() * 360}deg)`;
    }
    
    // Échelle en fonction de la position Y (perspective)
    const scale = ((entity.y / 2) / entity.spawnCanvas.height) * 4;
    
    ctx.translate(entity.x, entity.y);
    ctx.scale(scale, scale);
    ctx.drawImage(entity.img, -entity.size / 2, -entity.size, entity.size, entity.size);
    
    // Badge ou indicateur d'état
    if (entity.currentState !== 'idle') {
      ctx.fillStyle = entity.color;
      ctx.font = '12px monospace';
      ctx.fillText(entity.currentState, -entity.size / 2, -entity.size - 10);
    }
    
    ctx.restore();
  }

  // 🎮 BOUCLE D'ANIMATION
  animate = () => {
    // Clear tous les canvas
    this.canvasContexts.forEach((ctx, canvasId) => {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Redessiner le fond
      const bgImg = this.backgroundImages.get(canvasId);
      if (bgImg) {
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      }
    });
    
    // Update et draw chaque entité
    this.entities.forEach((entity) => {
      if (entity.isActive) {
        this.updateEntity(entity);
        this.drawEntity(entity);
      }
    });
    
    this.animationId = requestAnimationFrame(this.animate);
  };

  // 🚀 DÉMARRER L'ANIMATION
  startAnimation() {
    if (this.animationId) return;
    this.animate();
  }

  // 💬 SYSTÈME DE MESSAGES
  showEntityMessage(entityId, message) {
    const entity = this.entities.get(entityId);
    if (!entity || !this.callbacks.showMessage) return;
    
    const prefix = {
      tank: '🛡️ ',
      beru: '🧠 ',
      kaisel: '🐉 ',
      igris: '⚔️ ',
      igrisk: '🎭 ',
      cerbere: '🔥 '
    }[entityId] || '';
    
    this.callbacks.showMessage(prefix + message, false, entityId);
  }

  // ⏰ DÉMARRER LES MESSAGES AUTOMATIQUES
  startEntityMessages(entity) {
    if (this.messageIntervals.has(entity.id)) return;
    
    const interval = setInterval(() => {
      if (this.isTutorialActive) return;
      
      if (entity.phrases && entity.phrases.length > 0 && Math.random() < 0.33) {
        const msg = entity.phrases[Math.floor(Math.random() * entity.phrases.length)];
        this.showEntityMessage(entity.id, msg);
      }
    }, entity.messageInterval);
    
    this.messageIntervals.set(entity.id, interval);
  }

  // 🎮 CONTRÔLES CLAVIER
  setupKeyboardControls() {
    const handleKeyDown = (e) => {
      const tank = this.entities.get('tank');
      if (!tank || tank.currentState === 'scared') return;
      
      switch(e.key) {
        case 'ArrowLeft':
          tank.speedX = -1.2;
          tank.direction = 'left';
          break;
        case 'ArrowRight':
          tank.speedX = 1.2;
          tank.direction = 'right';
          break;
        case 'ArrowUp':
          tank.speedY = -0.3;
          tank.direction = 'up';
          break;
        case 'ArrowDown':
          tank.speedY = 0.3;
          tank.direction = 'down';
          break;
      }
    };
    
    const handleKeyUp = (e) => {
      const tank = this.entities.get('tank');
      if (!tank) return;
      
      if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
        tank.speedX = 0;
      }
      if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
        tank.speedY = 0;
      }
      
      if (tank.speedX === 0 && tank.speedY === 0) {
        tank.direction = null;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }

  // 🔧 LIMITES DU CANVAS
  enforceCanvasBounds(entity) {
    const canvas = entity.spawnCanvas;
    if (!canvas) return;
    
    entity.x = Math.max(entity.size / 2, Math.min(canvas.width - entity.size / 2, entity.x));
    entity.y = Math.max(canvas.height / 2, Math.min(canvas.height - entity.size / 2, entity.y));
  }

  // 🧹 NETTOYAGE
  cleanup() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    this.messageIntervals.forEach(interval => clearInterval(interval));
    this.messageIntervals.clear();
    
    this.wanderTimers.forEach(timer => clearTimeout(timer));
    this.wanderTimers.clear();
    
    this.entities.clear();
    this.canvasContexts.clear();
    this.backgroundImages.clear();
    this.interactions.clear();
    this.specialStates.clear();
  }

  // 🎯 API PUBLIQUE
  
  // Obtenir la position d'un chibi
  getEntityPosition(entityId) {
    const entity = this.entities.get(entityId);
    if (!entity) return null;
    
    return {
      x: entity.x,
      y: entity.y,
      canvas: entity.currentCanvas
    };
  }
  
  // Faire parler un chibi
  makeEntitySpeak(entityId, message) {
    this.showEntityMessage(entityId, message);
  }
  
  // Changer l'état d'un chibi
  setEntityState(entityId, state) {
    const entity = this.entities.get(entityId);
    if (entity) {
      entity.currentState = state;
    }
  }
  
  // Activer/Désactiver le mode tutoriel
  setTutorialMode(active) {
    this.isTutorialActive = active;
  }
}

// 🌟 EXPORT PAR DÉFAUT
export default EnhancedChibiManager;