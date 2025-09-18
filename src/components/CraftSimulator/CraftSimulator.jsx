import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AlertCircle, Dice1, Target, Sparkles, TrendingUp, Zap, Calculator, RefreshCw, RotateCcw, DollarSign, Skull } from 'lucide-react';
import ChibiBubble from '../ChibiBubble';

// 🎯 Configuration exacte des artefacts avec les vraies règles
const ARTIFACT_TYPES = {
  // ITEMS GAUCHE (L) 
  'Helmet': {
    side: 'L',
    mainStats: ['Attack %', 'Additional Attack', 'Defense %', 'Additional Defense', 'HP %', 'Additional HP'],
    excludedSubstats: ['Critical Hit Damage'],
    icon: '⛑️'
  },
  'Armor': {
    side: 'L',
    mainStats: ['Defense %', 'Additional Defense'],
    excludedSubstats: ['Critical Hit Damage'],
    icon: '🛡️'
  },
  'Gloves': {
    side: 'L',
    mainStats: ['Attack %', 'Additional Attack'],
    excludedSubstats: ['Critical Hit Damage'],
    icon: '🧤'
  },
  'Boots': {
    side: 'L',
    mainStats: [ 'Defense %', 'HP %', 'Defense Penetration', 'Critical Hit Rate', 'Healing Given Increase (%)'],
    excludedSubstats: ['Critical Hit Damage'],
    icon: '👢'
  },
  // ITEMS DROITE (R)
  'Necklace': {
    side: 'R',
    mainStats: [ 'HP %', 'Additional HP'],
    excludedSubstats: ['Critical Hit Rate'],
    icon: '📿'
  },
  'Ring': {
    side: 'R',
    mainStats: ['Attack %', 'Defense %', 'HP %', 'Damage Increase', 'Damage Reduction'],
    excludedSubstats: ['Critical Hit Rate'],
    icon: '💍'
  },
  'Earrings': {
    side: 'R',
    mainStats: ['Additional MP'],
    excludedSubstats: ['Critical Hit Rate'],
    icon: '💎'
  },
  'Bracelet': {
    side: 'R',
    mainStats: ['Fire', 'Wind', 'Light', 'Dark', 'Water'],
    excludedSubstats: ['Critical Hit Rate'],
    icon: '⌚'
  }
};

const ALL_SUBSTATS = [
  'Attack %', 'Additional Attack', 'Defense %', 'Additional Defense',
  'HP %', 'Additional HP', 'Defense Penetration', 'Damage Increase',
  'Critical Hit Rate', 'Critical Hit Damage', 'Damage Reduction',
  'MP Consumption Reduction', 'Additional MP', 'MP Recovery Rate Increase (%)'
];

// 🎨 Sets disponibles
const SETS = [
  // Sets 4 pièces
  'Guardian', 'Armed', 'Berserker', 'Champion On The Field',
  'Concentration Of Firepower', 'Destroyer', 'Destructive Instinct',
  'Executionner', 'Expert', 'Iron Will', 'Noble Sacrifice',
  'One Hit-kill', 'Outstanding Ability', 'Outstanding Connection',
  'Shining Star', 'Solid Analysis', 'Solid Foundation',
  'Sylph\'s Blessing', 'Toughness', 'Warmonger', 'Angel White',
  // Sets 8 pièces
  'Burning Blessing', 'Burning Curse', 'Burning Greed',
  'Chaotic Desire', 'Chaotic Infamy', 'Chaotic Wish'
];

// 👀 Configuration Miergo
const MIERGO_CONFIG = {
  originalRolls: 3400,
  hammersSpent: 17000,
  hammersPerRoll: 5,
  probability: 1/715, // 0.14%
  expectedRolls: 715
};

// 🎲 Moteur de calcul probabiliste EXACT
const calculateCraftProbability = (availableStats, mustHave, niceToHave) => {
  const n = availableStats.length;
  const k = 4; // On tire toujours 4 substats
  const m = mustHave.length;
  
  if (m > k || m > n) return 0;
  
  // Calcul combinatoire : C(n,k)
  const combinations = (n, k) => {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    let result = 1;
    for (let i = 1; i <= k; i++) {
      result = result * (n - k + i) / i;
    }
    return result;
  };
  
  // Probabilité exacte d'avoir tous les must-have
  const probMustHave = combinations(n - m, k - m) / combinations(n, k);
  
  return probMustHave;
};

// 🎭 Messages des Chibis
const CHIBI_MESSAGES = {
  tank: {
    click: ["Hey! Pas touche!", "Tu cherches les ennuis?", "Une pomme? 🍎", "Bobby m'a dit de surveiller ici..."],
    lowRolls: ["Tout va bien se passer!", "Garde espoir!", "La chance arrive!"],
    mediumRolls: ["Ça commence à piquer...", "Tu veux une pomme pour la chance?", "Reste fort!"],
    highRolls: ["Oh non... tant de marteaux...", "Bobby ne serait pas content...", "*mange une pomme tristement*"],
    miergoLevel: ["MIERGO?! C'EST TOI?!", "*offre toutes ses pommes*", "La légende... elle est réelle..."]
  },
  beru: {
    click: ["Analyse en cours...", "Intéressant.", "Les probabilités sont contre toi.", "Le Monarque approuverait-il?"],
    lowRolls: ["Probabilité respectée. Normal.", "Conforme aux attentes statistiques."],
    mediumRolls: ["Déviation notable détectée.", "Variance inquiétante..."],
    highRolls: ["Anomalie statistique majeure!", "Impossible selon mes calculs!", "Erreur dans la matrice?"],
    miergoLevel: ["ERREUR 404: LUCK NOT FOUND", "Tu défies les mathématiques!", "Même le SERN n'explique pas ça..."]
  },
  kaisel: {
    click: ["Debug mode: ON", "Performance: suboptimale", "Refactor nécessaire.", "Stack overflow imminent."],
    lowRolls: ["Efficacité optimale.", "Clean RNG."],
    mediumRolls: ["Performance dégradée détectée.", "Memory leak dans ta chance."],
    highRolls: ["Critical failure!", "System.luck.exe has stopped working"],
    miergoLevel: ["KERNEL PANIC", "Universe.random() = null", "Reboot reality.exe"]
  },
  bobbyJones: {
    click: ["Vraiment ces stats?", "F2P ou whale?", "Montre tes factures!", "Les marteaux c'est pas gratuit!"],
    lowRolls: ["Bien! Tu économises tes marteaux. Vrai F2P! 🎖️", "Pas plus de 10 rolls. Respect."],
    mediumRolls: ["Hmmm... beaucoup de marteaux ça...", "T'as acheté un pack avoue..."],
    highRolls: ["WHALE ALERT! 🐋", "Tant de marteaux... ton portefeuille pleure!"],
    miergoLevel: ["17000 MARTEAUX?! IMPOSSIBLE SANS PAYER!", "*a quitté le serveur*", "Screenshot ou fake!"]
  }
};

// Messages spontanés des chibis
const SPONTANEOUS_MESSAGES = {
  tank: [
    "Une pomme, ça vous dit? 🍎",
    "Je surveille le simulateur, tout va bien!",
    "Bobby m'a dit de rester vigilant...",
    "*mange une pomme en silence*",
    "Les artefacts, c'est de la RNG pure...",
    "Vous savez que j'ai 9000 de DEF?",
    "Parfois je me demande si Béru m'apprécie..."
  ],
  beru: [
    "Probabilité de réussite: négligeable.",
    "Les mathématiques ne mentent jamais.",
    "Intéressant... très intéressant.",
    "Le Monarque serait déçu de ces stats.",
    "Analyse en cours... résultats décevants.",
    "L'efficacité de ce build est questionnable.",
    "Mes calculs suggèrent un changement de stratégie."
  ],
  kaisel: [
    "Performance: sous-optimale.",
    "Un refactor serait nécessaire ici.",
    "Memory leak détecté dans votre chance.",
    "Stack overflow imminent si vous continuez.",
    "Ce code... je veux dire, ce build a besoin d'optimisation.",
    "Debug mode: toujours actif.",
    "Exception non gérée: Luck.NotFound"
  ],
  bobbyJones: [
    "Vraiment? Ces stats? Sérieusement?",
    "Un vrai F2P n'aurait jamais fait ça.",
    "Whale détecté! 🐋",
    "Combien de packs tu as acheté?",
    "Les marteaux, c'est pas gratuit tu sais...",
    "Screenshot ou c'est fake!",
    "Mon detector de P2W s'affole!"
  ]
};

// Dialogues d'interaction entre chibis
const CHIBI_INTERACTIONS = [
  {
    initiator: 'tank',
    target: 'beru',
    messages: [
      { from: 'tank', text: "Béru, tu penses que j'ai une chance aujourd'hui?" },
      { from: 'beru', text: "Statistiquement? Non. Mais continue d'espérer, Tank." }
    ]
  },
  {
    initiator: 'beru',
    target: 'kaisel',
    messages: [
      { from: 'beru', text: "Kaisel, tes optimisations ont cassé quelque chose?" },
      { from: 'kaisel', text: "Négatif. Le problème est situé entre la chaise et le clavier." }
    ]
  },
  {
    initiator: 'tank',
    target: 'bobbyJones',
    messages: [
      { from: 'tank', text: "Bobby! J'ai gardé une pomme pour toi!" },
      { from: 'bobbyJones', text: "Garde-la Tank. Tu en auras besoin avec ces rolls..." }
    ]
  },
  {
    initiator: 'kaisel',
    target: 'bobbyJones',
    messages: [
      { from: 'kaisel', text: "Détection: Utilisation excessive de ressources." },
      { from: 'bobbyJones', text: "C'est ce que je dis! WHALE ALERT! 🐋" }
    ]
  },
  {
    initiator: 'beru',
    target: 'tank',
    messages: [
      { from: 'beru', text: "Tank, arrête de manger pendant le service." },
      { from: 'tank', text: "*cache sa pomme* Je mange pas! 😳" }
    ]
  }
];

// 🎭 Classe pour gérer les chibis sur le canvas
class ChibiEntity {
  constructor(type, canvas, ctx) {
    this.type = type;
    this.canvas = canvas;
    this.ctx = ctx;
    this.x = Math.random() * (canvas.width - 60) + 30;
    this.y = canvas.height - 80;
    this.size = 60;
    this.speedX = 0;
    this.speedY = 0;
    this.direction = 'idle';
    this.img = new Image();
    this.isWandering = false;
    this.clickCount = 0;
    
    this.sprites = this.getSprites();
    this.img.src = this.sprites.idle;
  }
  
  getSprites() {
    switch(this.type) {
      case 'tank':
        return {
          idle: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604465/tank_face_n9kxrh.png',
          left: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748294466/tank_run_left_lxr3km.png',
          right: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748294466/tank_run_right_2_zrf0y1.png',
          up: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604462/tank_dos_bk6poi.png',
          down: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604465/tank_face_n9kxrh.png'
        };
      case 'beru':
        return {
          idle: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414699/beru_face_w2rdyn.png',
          left: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414823/beru_left_bvtyba.png',
          right: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414822/beru_right_ofwvy5.png',
          up: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414738/beru_dos_dtk5ln.png',
          down: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414699/beru_face_w2rdyn.png'
        };
      case 'kaisel':
        return {
          idle: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750768929/Kaisel_face_dm9394.png',
          left: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750768929/Kaisel_left_m8qkyi.png',
          right: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750768929/Kaisel_right_hmgppo.png',
          up: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750772247/Kaisel_dos_dstl0d.png',
          down: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750768929/Kaisel_face_dm9394.png'
        };
      case 'bobbyJones':
        return {
          idle: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604465/tank_face_n9kxrh.png', // Utilise Tank sprite avec pomme
          left: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748294466/tank_run_left_lxr3km.png',
          right: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748294466/tank_run_right_2_zrf0y1.png',
          up: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604462/tank_dos_bk6poi.png',
          down: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604465/tank_face_n9kxrh.png'
        };
      default:
        return {};
    }
  }
  
  update() {
    // Mouvement aléatoire
    if (!this.isWandering && Math.random() < 0.003) {
      this.startWander();
    }
    
    if (this.isWandering) {
      const speed = this.type === 'kaisel' ? 0.8 : 0.5;
      switch(this.direction) {
        case 'left':
          this.x -= speed;
          this.img.src = this.sprites.left;
          break;
        case 'right':
          this.x += speed;
          this.img.src = this.sprites.right;
          break;
        case 'up':
          this.y -= speed * 0.5;
          this.img.src = this.sprites.up;
          break;
        case 'down':
          this.y += speed * 0.5;
          this.img.src = this.sprites.down;
          break;
      }
    }
    
    // Limites du canvas
    this.x = Math.max(30, Math.min(this.canvas.width - 30, this.x));
    this.y = Math.max(this.canvas.height / 2, Math.min(this.canvas.height - 30, this.y));
  }
  
  startWander() {
    const directions = ['left', 'right', 'up', 'down'];
    this.direction = directions[Math.floor(Math.random() * directions.length)];
    this.isWandering = true;
    
    setTimeout(() => {
      this.isWandering = false;
      this.direction = 'idle';
      this.img.src = this.sprites.idle;
    }, 2000 + Math.random() * 3000);
  }
  
  draw() {
    if (this.img.complete) {
      // Effet d'ombre pour Bobby (F2P aura)
      if (this.type === 'bobbyJones') {
        this.ctx.save();
        this.ctx.shadowColor = '#FFD700';
        this.ctx.shadowBlur = 10;
        this.ctx.drawImage(this.img, this.x - this.size/2, this.y - this.size, this.size, this.size);
        this.ctx.restore();
      } else {
        this.ctx.drawImage(this.img, this.x - this.size/2, this.y - this.size, this.size, this.size);
      }
    }
  }
}

// 🎮 Component Principal
const ArtifactCraftSimulator = () => {
  const [set, setSet] = useState('');
  const [artifactType, setArtifactType] = useState('');
  const [mainStat, setMainStat] = useState('');
  const [mustHaveStats, setMustHaveStats] = useState([]);
  const [niceToHaveStats, setNiceToHaveStats] = useState(new Map());
  const [isRolling, setIsRolling] = useState(false);
  const [rollResults, setRollResults] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [currentRoll, setCurrentRoll] = useState([]);
  const [autoRollActive, setAutoRollActive] = useState(false);
  const [uiTheme, setUiTheme] = useState('normal');
  
  // Chibi system amélioré
  const [chibiMessage, setChibiMessage] = useState('');
  const [currentChibi, setCurrentChibi] = useState('beru');
  const [showChibiBubble, setShowChibiBubble] = useState(false);
  const [chibiPos, setChibiPos] = useState({ x: 0, y: 0 });
  const [bubbleId, setBubbleId] = useState(Date.now());
  const isSpeaking = useRef(false);
  const messageQueue = useRef([]);
  const currentTimeout = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const chibisRef = useRef([]);
  const screen = useResponsive();

  // Ajoute ça juste après les useState au début du component
useEffect(() => {
  window.debugChibi = () => {
    console.log('=== DEBUG CHIBI SYSTEM ===');
    console.log('Canvas exists:', !!canvasRef.current);
    console.log('Canvas rect:', canvasRef.current?.getBoundingClientRect());
    console.log('Chibis loaded:', chibisRef.current.map(c => ({
      type: c.type,
      x: c.x,
      y: c.y,
      size: c.size
    })));
    console.log('Show bubble:', showChibiBubble);
    console.log('Bubble position:', chibiPos);
    console.log('Current message:', chibiMessage);
    console.log('Current speaker:', currentChibi);
  };
  
  window.testBubble = () => {
    console.log('--- TEST DIRECT ---');
    const testPos = { x: window.innerWidth / 2, y: 200 };
    console.log('Setting position:', testPos);
    setChibiPos(testPos);
    setShowChibiBubble(true);
    setChibiMessage("TEST MESSAGE DIRECT!");
    setCurrentChibi('tank');
  };
}, [showChibiBubble, chibiPos, chibiMessage, currentChibi]);

function useResponsive() {
  const [screen, setScreen] = React.useState(() => {
    const w = window.innerWidth;
    return { isPhone: w < 640, isTablet: w >= 640 && w < 1024, isDesktop: w >= 1024 };
  });
  React.useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setScreen({ isPhone: w < 640, isTablet: w >= 640 && w < 1024, isDesktop: w >= 1024 });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return screen;
}

  // Stats disponibles (exclure mainStat et respecter les exclusions par type)
  const availableSubstats = useMemo(() => {
    let pool = ALL_SUBSTATS.filter(stat => 
      stat !== mainStat && 
      !mustHaveStats.includes(stat) &&
      !Array.from(niceToHaveStats.keys()).includes(stat)
    );
    
    if (artifactType && ARTIFACT_TYPES[artifactType]) {
      const exclusions = ARTIFACT_TYPES[artifactType].excludedSubstats || [];
      pool = pool.filter(stat => !exclusions.includes(stat));
    }
    
    return pool;
  }, [mainStat, mustHaveStats, niceToHaveStats, artifactType]);

  // Calcul de probabilité avec exclusions
  const probability = useMemo(() => {
    if (!mainStat || mustHaveStats.length === 0 || !artifactType) return 0;
    
    let pool = ALL_SUBSTATS.filter(s => s !== mainStat);
    
    if (ARTIFACT_TYPES[artifactType]) {
      const exclusions = ARTIFACT_TYPES[artifactType].excludedSubstats || [];
      pool = pool.filter(s => !exclusions.includes(s));
    }
    
    return calculateCraftProbability(pool, mustHaveStats, niceToHaveStats);
  }, [mainStat, mustHaveStats, niceToHaveStats, artifactType]);

  // Calcul du Miergo Score (z-score)
  const miergoScore = useMemo(() => {
    if (!probability || attempts === 0) return 0;
    const expected = 1 / probability;
    const stdDev = Math.sqrt((1 - probability) / (probability * probability));
    return (attempts - expected) / stdDev;
  }, [probability, attempts]);

  // Calcul du Miergo Scale
  const miergoScale = useMemo(() => {
    const miergoEquivalent = attempts / MIERGO_CONFIG.originalRolls;
    
    if (miergoEquivalent < 0.1) return { text: "Béni des RNG Gods", color: "text-green-500" };
    if (miergoEquivalent < 0.3) return { text: "Chanceux normal", color: "text-green-400" };
    if (miergoEquivalent < 0.5) return { text: "Légèrement poissé", color: "text-yellow-400" };
    if (miergoEquivalent < 0.7) return { text: "Malchance notable", color: "text-orange-400" };
    if (miergoEquivalent < 0.9) return { text: "Pré-Miergo (fuis!)", color: "text-red-400" };
    if (miergoEquivalent < 1.0) return { text: "QUASI-MIERGO 😱", color: "text-red-500" };
    if (miergoEquivalent === 1.0) return { text: "🔿 MIERGO HIMSELF 🔿", color: "text-purple-500 animate-pulse" };
    return { text: "AU-DELÀ DE MIERGO (IMPOSSIBLE)", color: "text-purple-600 animate-bounce" };
  }, [attempts]);

// Fonction corrigée pour obtenir la position d'un chibi
const getChibiScreenPosition = (entityType) => {
  if (!canvasRef.current) {
    return { 
      x: window.innerWidth / 2, 
      y: window.innerHeight / 3, 
      visible: false,
      canvasId: null 
    };
  }
  
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();
  const chibi = chibisRef.current.find(c => c.type === entityType);
  
  if (!chibi) {
    return { 
      x: window.innerWidth / 2, 
      y: window.innerHeight / 3, 
      visible: false,
      canvasId: null 
    };
  }
  
  // Position exacte du chibi dans le canvas
  const scaleX = rect.width / canvas.width;
  const scaleY = rect.height / canvas.height;
  
  // Centre du chibi à l'écran
  const screenX = rect.left + (chibi.x * scaleX);
  const screenY = rect.top + (chibi.y * scaleY) - (chibi.size * scaleY); // Top du sprite
  
  // Vérifier si visible
  const isVisible = (
    rect.top < window.innerHeight && 
    rect.bottom > 0 &&
    screenX > -50 && 
    screenX < window.innerWidth + 50
  );
  
  return {
    x: screenX,
    y: screenY,
    visible: isVisible,
    canvasId: 'craftsim-canvas'
  };
};

const showChibiMessage = (message, entityType = 'tank', priority = false) => {
  try {
    if (!message || typeof message !== 'string') return;
    
    if (isSpeaking.current && !priority) {
      messageQueue.current.push({ message, entityType });
      return;
    }
    
    if (priority && isSpeaking.current && currentTimeout.current) {
      clearTimeout(currentTimeout.current);
    }
    
    isSpeaking.current = true;
    setShowChibiBubble(false);
    setBubbleId(Date.now());
    setCurrentChibi(entityType);
    
    const canvas = canvasRef.current;
    const chibi = chibisRef.current.find(c => c.type === entityType);
    
    if (canvas && chibi) {
      const rect = canvas.getBoundingClientRect();
      
      // Position exacte du chibi à l'écran
      const screenX = rect.left + (chibi.x / canvas.width) * rect.width;
      const screenY = rect.top + (chibi.y / canvas.height) * rect.height;
      
      // Compenser pour le fait que ChibiBubble soustrait 120 en X
      setChibiPos({
        x: screenX + 120,
        y: screenY - chibi.size - 50  // Au-dessus du chibi
      });
    } else {
      setChibiPos({ 
        x: window.innerWidth / 2 + 120, 
        y: 150 
      });
    }
    
    setShowChibiBubble(true);
    setChibiMessage(message);
    
    const displayDuration = Math.min(Math.max(4000, message.length * 80), 20000);
    
    currentTimeout.current = setTimeout(() => {
      setShowChibiBubble(false);
      isSpeaking.current = false;
      
      if (messageQueue.current.length > 0) {
        const next = messageQueue.current.shift();
        setTimeout(() => {
          showChibiMessage(next.message, next.entityType);
        }, 100);
      }
      
      currentTimeout.current = null;
    }, displayDuration);
    
  } catch (error) {
    console.error("Erreur:", error);
    isSpeaking.current = false;
  }
};
  // Ajoute ceci juste après la déclaration de showChibiMessage dans le component
useEffect(() => {
  // Exposer les fonctions de test dans la console
  window.testChibi = {
    // Tester un message direct
    speak: (message = "Test message!", entity = 'tank') => {
      console.log(`🎮 Testing chibi speak: ${entity} says "${message}"`);
      showChibiMessage(message, entity, true);
    },
    
    // Vérifier l'état des chibis
    status: () => {
      console.log('📊 Chibi System Status:');
      console.log('- Canvas exists:', !!canvasRef.current);
      console.log('- Chibis loaded:', chibisRef.current.length);
      console.log('- Is speaking:', isSpeaking.current);
      console.log('- Message queue:', messageQueue.current);
      console.log('- Show bubble:', showChibiBubble);
      console.log('- Current chibi:', currentChibi);
      console.log('- Chibi positions:', chibisRef.current.map(c => ({
        type: c.type,
        x: c.x,
        y: c.y
      })));
    },
    
    // Forcer un message spontané
    triggerSpontaneous: () => {
      const types = ['tank', 'beru', 'kaisel', 'bobbyJones'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const messages = SPONTANEOUS_MESSAGES[randomType];
      const msg = messages[Math.floor(Math.random() * messages.length)];
      console.log(`🎲 Triggering spontaneous: ${randomType} says "${msg}"`);
      showChibiMessage(msg, randomType, true);
    },
    
    // Tester une interaction
    triggerInteraction: () => {
      const interaction = CHIBI_INTERACTIONS[0]; // Tank -> Beru
      console.log('🤝 Triggering interaction:', interaction);
      interaction.messages.forEach((msg, idx) => {
        setTimeout(() => {
          showChibiMessage(msg.text, msg.from, idx === 0);
        }, idx * 3500);
      });
    },
    
    // Debug complet
    debug: () => {
      console.log('🔍 Full Debug Info:');
      window.testChibi.status();
      console.log('- Attempts:', attempts);
      console.log('- Show bubble element exists:', !!document.querySelector('[style*="position: fixed"]'));
      console.log('- getChibiScreenPosition test:', getChibiScreenPosition('tank'));
    }
  };
  
  console.log('✅ Chibi debug tools loaded! Use:');
  console.log('- window.testChibi.speak("Hello!", "tank")');
  console.log('- window.testChibi.status()');
  console.log('- window.testChibi.triggerSpontaneous()');
  console.log('- window.testChibi.triggerInteraction()');
  console.log('- window.testChibi.debug()');
}, [showChibiMessage, showChibiBubble, currentChibi, attempts]);

  const handleCloseBubble = () => {
    setShowChibiBubble(false);
    isSpeaking.current = false;

    if (currentTimeout.current) {
      clearTimeout(currentTimeout.current);
      currentTimeout.current = null;
    }

    if (messageQueue.current.length > 0) {
      const next = messageQueue.current.shift();
      setTimeout(() => {
        showChibiMessage(next.message, next.entityType);
      }, 100);
    }
  };

  // Messages contextuels basés sur les attempts
  const triggerContextualMessage = () => {
    if (attempts === 100) {
      showChibiMessage("100 essais... Tu veux une pomme pour la chance? 🍎", 'tank', true);
    } else if (attempts === 500) {
      showChibiMessage("500... Statistiquement inquiétant. Anomalie détectée.", 'beru', true);
    } else if (attempts === 1000) {
      showChibiMessage("1000 essais. Tu approches du territoire de Miergo...", 'beru', true);
      setTimeout(() => {
        showChibiMessage("System.luck.exe has stopped working", 'kaisel');
      }, 3000);
    } else if (attempts === 2000) {
      showChibiMessage("2000?! Même mes algorithmes ne comprennent pas!", 'beru', true);
      setTimeout(() => {
        showChibiMessage("*pleure en mangeant des pommes*", 'tank');
      }, 3000);
    } else if (attempts === 3000) {
      showChibiMessage("Tu... tu es l'élu de la malchance...", 'beru', true);
      setTimeout(() => {
        showChibiMessage("Miergo-sama... c'est toi?", 'tank');
      }, 3000);
    } else if (attempts === 3400) {
      // MIERGO LEVEL ATTEINT!
      showChibiMessage("🔿 MIERGO LEVEL ATTEINT! TU ES UNE LÉGENDE! 🔿", 'beru', true);
      setTimeout(() => {
        showChibiMessage("*offre toutes ses pommes en signe de respect*", 'tank');
      }, 3000);
      setTimeout(() => {
        showChibiMessage("Screenshot ou c'est fake!", 'bobbyJones');
      }, 6000);
      setTimeout(() => {
        showChibiMessage("KERNEL PANIC - REALITY.EXE HAS STOPPED", 'kaisel');
      }, 9000);
      triggerMiergoAnimation();
    } else if (attempts > 3400) {
      showChibiMessage("...Pourquoi tu continues? Tu as déjà dépassé Miergo...", 'beru', true);
    }
    
    // Messages de Bobby sur les marteaux
    if (attempts % 200 === 0 && attempts > 0) {
      const hammers = attempts * 5;
      if (hammers < 100) {
        showChibiMessage(`${hammers} marteaux utilisés. Un vrai F2P!`, 'bobbyJones');
      } else if (hammers < 500) {
        showChibiMessage(`${hammers} marteaux... T'as craqué sur un pack hein?`, 'bobbyJones');
      } else {
        showChibiMessage(`${hammers} MARTEAUX?! WHALE CONFIRMÉ! 🐋`, 'bobbyJones');
      }
    }
  };

  // Animation spéciale Miergo
  const triggerMiergoAnimation = () => {
    setUiTheme('miergo-achieved');
    
    // Effet visuel spécial
    document.body.style.filter = 'hue-rotate(180deg)';
    setTimeout(() => {
      document.body.style.filter = 'none';
    }, 3000);
    
    // Easter egg secret
    console.log("🦶 Miergo's reward unlocked... 💕");
  };

  // 🎲 Roll unique avec exclusions
  const rollOnce = () => {
    if (!artifactType || !mainStat || mustHaveStats.length === 0) return false;
    
    let pool = ALL_SUBSTATS.filter(s => s !== mainStat);
    const exclusions = ARTIFACT_TYPES[artifactType].excludedSubstats || [];
    pool = pool.filter(s => !exclusions.includes(s));
    
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const rolled = shuffled.slice(0, 4);
    setCurrentRoll(rolled);
    setAttempts(prev => prev + 1);
    
    const hasAllMustHave = mustHaveStats.every(stat => rolled.includes(stat));
    if (hasAllMustHave) {
      setRollResults({
        success: true,
        stats: rolled,
        attempts: attempts + 1
      });
      setAutoRollActive(false);
      
      // Message de succès
      if (attempts < 10) {
        showChibiMessage("Premier try?! SUS! Montre ta facture Google Play!", 'bobbyJones', true);
      } else if (attempts < 50) {
        showChibiMessage(`Succès en ${attempts + 1} essais! GG!`, 'beru', true);
      } else if (attempts < 200) {
        showChibiMessage(`${attempts + 1} essais... Respect pour la persévérance!`, 'tank', true);
      } else {
        showChibiMessage(`ENFIN! Après ${attempts + 1} essais! Un vrai warrior!`, 'beru', true);
      }
      
      return true;
    }
    
    // Trigger messages contextuels
    triggerContextualMessage();
    
    return false;
  };

  // Evolution du thème UI selon les rolls
  useEffect(() => {
    if (attempts < 500) setUiTheme('normal');
    else if (attempts < 1000) setUiTheme('darker');
    else if (attempts < 1500) setUiTheme('despair');
    else if (attempts < 2000) setUiTheme('void');
    else if (attempts < 2500) setUiTheme('abyss');
    else if (attempts < 3000) setUiTheme('miergo-approach');
    else if (attempts < 3400) setUiTheme('final-countdown');
    else if (attempts === 3400) setUiTheme('miergo-achieved');
    else setUiTheme('beyond-miergo');
  }, [attempts]);

  // Auto-roll
  useEffect(() => {
    if (autoRollActive && !rollResults?.success) {
      const timer = setTimeout(() => {
        rollOnce();
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [autoRollActive, attempts, rollResults]);

  // Réactions aux changements de configuration
  useEffect(() => {
    if (artifactType) {
      const comments = {
        'Helmet': ["Un casque? Protection maximale!", "Bonne défense en perspective.", "Le casque, c'est la base!"],
        'Armor': ["L'armure! Mon préféré!", "Défense assurée avec ça.", "Une bonne armure vaut mille potions."],
        'Gloves': ["Des gants pour l'attaque!", "Force brute incoming.", "Les gants, pour frapper fort!"],
        'Boots': ["Des bottes? Vitesse et style!", "Mobilité optimale.", "Les bottes, souvent sous-estimées..."],
        'Necklace': ["Un collier pour les HP!", "Survie garantie.", "Le collier, c'est vital."],
        'Ring': ["L'anneau polyvalent!", "Beaucoup d'options ici.", "Un anneau pour les gouverner tous..."],
        'Earrings': ["Les boucles d'oreilles MP!", "Pour les lanceurs de sorts.", "MP infini? Presque!"],
        'Bracelet': ["Bracelet élémentaire!", "Dégâts élémentaires boost.", "Le bracelet fait la différence."]
      };
      
      if (comments[artifactType]) {
        const msg = comments[artifactType][Math.floor(Math.random() * comments[artifactType].length)];
        const speakers = ['tank', 'beru', 'kaisel'];
        showChibiMessage(msg, speakers[Math.floor(Math.random() * speakers.length)]);
      }
    }
  }, [artifactType]);

  // Réactions aux stats obligatoires
  useEffect(() => {
    if (mustHaveStats.length > 0) {
      const lastStat = mustHaveStats[mustHaveStats.length - 1];
      
      if (lastStat.includes('Critical')) {
        showChibiMessage("Du crit! Tu vises le jackpot!", 'tank');
      } else if (lastStat.includes('Attack')) {
        showChibiMessage("Plus d'attaque? Approche agressive détectée.", 'beru');
      } else if (lastStat.includes('Defense') || lastStat.includes('HP')) {
        showChibiMessage("Build défensif. Sage décision.", 'kaisel');
      }
      
      if (mustHaveStats.length === 4) {
        showChibiMessage("4 stats obligatoires?! Tu aimes souffrir!", 'bobbyJones');
      }
    }
  }, [mustHaveStats]);

  // Canvas avec chibis et système d'interaction
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let lastInteractionTime = Date.now();
    let lastSpontaneousTime = Date.now();
    
    const mapImage = new Image();
    mapImage.onload = () => {
      // Créer les 4 chibis
      chibisRef.current = [
        new ChibiEntity('tank', canvas, ctx),
        new ChibiEntity('beru', canvas, ctx),
        new ChibiEntity('kaisel', canvas, ctx),
        new ChibiEntity('bobbyJones', canvas, ctx)
      ];
      
      // Positionner les chibis
      if (chibisRef.current[0]) {
        chibisRef.current[0].x = canvas.width * 0.15;
        chibisRef.current[0].y = canvas.height - 60;
      }
      if (chibisRef.current[1]) {
        chibisRef.current[1].x = canvas.width * 0.4;
        chibisRef.current[1].y = canvas.height - 60;
      }
      if (chibisRef.current[2]) {
        chibisRef.current[2].x = canvas.width * 0.6;
        chibisRef.current[2].y = canvas.height - 60;
      }
      if (chibisRef.current[3]) {
        chibisRef.current[3].x = canvas.width * 0.85;
        chibisRef.current[3].y = canvas.height - 60;
      }
      
      // Messages de bienvenue après 2 secondes
      setTimeout(() => {
        showChibiMessage("Bienvenue dans le simulateur! Teste ta chance!", 'tank', true);
        setTimeout(() => {
          showChibiMessage("Les probabilités sont contre toi, comme toujours.", 'beru');
        }, 3000);
      }, 2000);
    };
    mapImage.src = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1758046144/canvasmap_xdbcyc.png';
    
    // Animation loop avec interactions
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (mapImage.complete) {
        ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
        
        // Effet selon le niveau Miergo
        if (attempts > 2000) {
          ctx.fillStyle = `rgba(138, 43, 226, ${Math.min(attempts / 10000, 0.3)})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
      
      // Update et vérification des interactions
      const now = Date.now();
      
      // Messages spontanés toutes les 15-30 secondes
      if (now - lastSpontaneousTime > (15000 + Math.random() * 15000) && !isSpeaking.current) {
        lastSpontaneousTime = now;
        
        // Choisir un chibi aléatoire
        const randomChibi = chibisRef.current[Math.floor(Math.random() * chibisRef.current.length)];
        if (randomChibi && SPONTANEOUS_MESSAGES[randomChibi.type]) {
          const messages = SPONTANEOUS_MESSAGES[randomChibi.type];
          const msg = messages[Math.floor(Math.random() * messages.length)];
          showChibiMessage(msg, randomChibi.type);
        }
      }
      
      // Vérifier les proximités pour les interactions (toutes les 20-40 secondes)
      if (now - lastInteractionTime > (20000 + Math.random() * 20000) && !isSpeaking.current) {
        lastInteractionTime = now;
        
        // Chercher deux chibis proches
        for (let i = 0; i < chibisRef.current.length; i++) {
          for (let j = i + 1; j < chibisRef.current.length; j++) {
            const chibi1 = chibisRef.current[i];
            const chibi2 = chibisRef.current[j];
            const distance = Math.sqrt((chibi1.x - chibi2.x) ** 2 + (chibi1.y - chibi2.y) ** 2);
            
            // S'ils sont proches (< 100 pixels)
            if (distance < 100) {
              // Trouver une interaction correspondante
              const interaction = CHIBI_INTERACTIONS.find(inter => 
                (inter.initiator === chibi1.type && inter.target === chibi2.type) ||
                (inter.initiator === chibi2.type && inter.target === chibi1.type)
              );
              
              if (interaction) {
                // Jouer l'interaction
                interaction.messages.forEach((msg, idx) => {
                  setTimeout(() => {
                    showChibiMessage(msg.text, msg.from, idx === 0);
                  }, idx * 3500);
                });
                break;
              }
            }
          }
        }
      }
      
      // Update et draw des chibis
      chibisRef.current.forEach(chibi => {
        chibi.update();
        chibi.draw();
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Gestion des clics sur les chibis
    const handleCanvasClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * (canvas.width / rect.width);
      const y = (event.clientY - rect.top) * (canvas.height / rect.height);
      
      chibisRef.current.forEach(chibi => {
        const distance = Math.sqrt((x - chibi.x) ** 2 + (y - chibi.y) ** 2);
        if (distance < chibi.size) {
          chibi.clickCount++;
          
          // Vérifier que le type existe dans CHIBI_MESSAGES
          if (CHIBI_MESSAGES[chibi.type] && CHIBI_MESSAGES[chibi.type].click) {
            const messages = CHIBI_MESSAGES[chibi.type].click;
            const msg = messages[Math.floor(Math.random() * messages.length)];
            showChibiMessage(msg, chibi.type, true);
            
            // Easter eggs sur multi-clics
            if (chibi.type === 'tank' && chibi.clickCount === 10) {
              showChibiMessage("Arrête! J'ai plus de pommes! 😭", 'tank', true);
            } else if (chibi.type === 'bobbyJones' && chibi.clickCount === 5) {
              showChibiMessage("Les vrais F2P ne spamment pas les clics!", 'bobbyJones', true);
            } else if (chibi.type === 'beru' && chibi.clickCount === 7) {
              showChibiMessage("Ta persistance est... illogique.", 'beru', true);
            } else if (chibi.type === 'kaisel' && chibi.clickCount === 8) {
              showChibiMessage("ClickEventException: Too many requests", 'kaisel', true);
            }
          }
        }
      });
    };
    
    canvas.addEventListener('click', handleCanvasClick);
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      canvas.removeEventListener('click', handleCanvasClick);
      if (currentTimeout.current) clearTimeout(currentTimeout.current);
    };
  }, [attempts]);

  const startAutoRoll = () => {
    if (!artifactType || !mainStat || mustHaveStats.length === 0) {
      showChibiMessage("Configure d'abord ton craft!", 'tank', true);
      return;
    }
    setRollResults(null);
    setAutoRollActive(true);
    showChibiMessage("Auto-roll activé! Que la RNG soit avec toi!", 'beru');
  };

  const stopAutoRoll = () => {
    setAutoRollActive(false);
    const hammers = attempts * 5;
    if (hammers > 500) {
      showChibiMessage(`${hammers} marteaux dépensés... Whale spotted!`, 'bobbyJones');
    }
  };

  const resetAll = () => {
    setAttempts(0);
    setRollResults(null);
    setCurrentRoll([]);
    setAutoRollActive(false);
    setUiTheme('normal');
    showChibiMessage("Reset complet. Prêt pour un nouveau cycle de souffrance.", 'kaisel');
  };

  const resetConfig = () => {
    setSet('');
    setArtifactType('');
    setMainStat('');
    setMustHaveStats([]);
    setNiceToHaveStats(new Map());
    setAttempts(0);
    setRollResults(null);
    setCurrentRoll([]);
    setAutoRollActive(false);
    setUiTheme('normal');
  };

  const isMobile = window.innerWidth < 768;

  // Classes dynamiques selon le thème
  const getThemeClasses = () => {
    switch(uiTheme) {
      case 'darker': return 'bg-gray-950';
      case 'despair': return 'bg-black animate-pulse';
      case 'void': return 'bg-black opacity-90';
      case 'abyss': return 'bg-black grayscale';
      case 'miergo-approach': return 'bg-purple-950/20 sepia';
      case 'final-countdown': return 'bg-red-950/20 animate-pulse';
      case 'miergo-achieved': return 'bg-purple-900/30 animate-bounce';
      case 'beyond-miergo': return 'bg-gradient-to-r from-purple-900 to-red-900 animate-gradient';
      default: return 'bg-[#0a0a15]';
    }
  };

  return (
    <div className={`min-h-screen text-white relative overflow-hidden transition-all duration-1000 ${getThemeClasses()}`}>
      {/* Canvas Background avec effet évolutif */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'url(https://res.cloudinary.com/dbg7m8qjd/image/upload/v1758046144/canvasmap_xdbcyc.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: `brightness(${Math.max(0.3, 1 - attempts/5000)}) blur(${Math.min(5, attempts/1000)}px)`
        }}
      />

      {/* Chibi Bubble */}
     {showChibiBubble && chibiMessage && (
  <ChibiBubble
    key={`bubble-${bubbleId}`}
    message={chibiMessage}
    position={chibiPos}
    entityType={currentChibi}
    isMobile={screen}   // ← on passe un vrai objet responsive
    onClose={handleCloseBubble}
  />
)}
      <div className="relative z-10 max-w-7xl mx-auto p-4">
        {/* Header avec Miergo Scale */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            🎲 Artifact Craft Simulator
          </h1>
          <p className="text-gray-400 text-sm md:text-base">Test ton RNG avant de gaspiller tes marteaux!</p>
          
          {attempts > 0 && (
            <div className={`mt-2 text-sm ${miergoScale.color}`}>
              Miergo Scale: {miergoScale.text}
            </div>
          )}
        </div>

        {/* Configuration Steps */}
        <div className={`bg-gray-900/80 backdrop-blur rounded-lg p-4 mb-6 ${isMobile ? 'space-y-4' : ''} ${attempts > 2000 ? 'animate-shake' : ''}`}>
          <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-3 gap-4'}`}>
            {/* Step 1: Set */}
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-semibold">
                Étape 1: Set
              </label>
              <select 
                value={set}
                onChange={(e) => setSet(e.target.value)}
                className="w-full bg-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Sélectionner un set...</option>
                {SETS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Step 2: Artifact Type */}
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-semibold">
                Étape 2: Type d'artefact
              </label>
              <select 
                value={artifactType}
                onChange={(e) => {
                  setArtifactType(e.target.value);
                  setMainStat('');
                }}
                disabled={!set}
                className="w-full bg-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">Sélectionner...</option>
                {Object.entries(ARTIFACT_TYPES).map(([type, config]) => (
                  <option key={type} value={type}>
                    {config.icon} {type} ({config.side})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 3: Main Stat */}
            <div>
              <label className="block text-xs text-gray-400 mb-1 font-semibold">
                Étape 3: Main Stat
              </label>
              <select 
                value={mainStat}
                onChange={(e) => setMainStat(e.target.value)}
                disabled={!artifactType}
                className="w-full bg-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                <option value="">Sélectionner...</option>
                {artifactType && ARTIFACT_TYPES[artifactType]?.mainStats.map(stat => (
                  <option key={stat} value={stat}>{stat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset Config Button */}
          <div className="mt-3 flex justify-end">
            <button
              onClick={resetConfig}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Config
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Substats Configuration */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gray-900/80 backdrop-blur rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-green-400" />
                Substats Configuration
              </h2>
              
              {/* Must Have Stats */}
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">
                  Stats obligatoires (max 4) - Doivent TOUTES apparaître
                </label>
                <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
                  {mustHaveStats.map(stat => (
                    <span 
                      key={stat}
                      className="bg-red-900/50 border border-red-500 px-2 py-1 rounded-full text-xs cursor-pointer hover:bg-red-800/50"
                      onClick={() => setMustHaveStats(prev => prev.filter(s => s !== stat))}
                    >
                      {stat} ✕
                    </span>
                  ))}
                </div>
                <select 
                  value=""
                  onChange={(e) => {
                    if (e.target.value && mustHaveStats.length < 4) {
                      setMustHaveStats(prev => [...prev, e.target.value]);
                    }
                  }}
                  disabled={!mainStat || mustHaveStats.length >= 4}
                  className="w-full bg-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  <option value="">Ajouter une stat obligatoire...</option>
                  {availableSubstats.map(stat => (
                    <option key={stat} value={stat}>{stat}</option>
                  ))}
                </select>
              </div>

              {/* Nice to Have Stats */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Stats optionnelles (bonus, pas obligatoires)
                </label>
                <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
                  {Array.from(niceToHaveStats.entries()).map(([stat, score]) => (
                    <span 
                      key={stat}
                      className="bg-blue-900/50 border border-blue-500 px-2 py-1 rounded-full text-xs cursor-pointer hover:bg-blue-800/50"
                      onClick={() => {
                        const newMap = new Map(niceToHaveStats);
                        newMap.delete(stat);
                        setNiceToHaveStats(newMap);
                      }}
                    >
                      {stat} ✕
                    </span>
                  ))}
                </div>
                <select 
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      const newMap = new Map(niceToHaveStats);
                      newMap.set(e.target.value, 3);
                      setNiceToHaveStats(newMap);
                    }
                  }}
                  disabled={!mainStat}
                  className="w-full bg-gray-800 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="">Ajouter une stat optionnelle...</option>
                  {availableSubstats.map(stat => (
                    <option key={stat} value={stat}>{stat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Current Roll Display */}
            {currentRoll.length > 0 && (
              <div className={`bg-gray-900/80 backdrop-blur rounded-lg p-4 ${attempts > 1000 ? 'animate-pulse' : ''}`}>
                <h3 className="text-sm font-semibold mb-2">Dernier roll:</h3>
                <div className="grid grid-cols-4 gap-2">
                  {currentRoll.map((stat, idx) => {
                    const isMustHave = mustHaveStats.includes(stat);
                    const isNiceToHave = niceToHaveStats.has(stat);
                    
                    return (
                      <div 
                        key={idx}
                        className={`p-2 rounded text-center text-xs ${
                          isMustHave ? 'bg-green-900/50 border border-green-500' :
                          isNiceToHave ? 'bg-blue-900/50 border border-blue-500' :
                          'bg-gray-700'
                        }`}
                      >
                        {stat}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Analysis & Controls Panel */}
          <div className="space-y-4">
            {/* Probability Display */}
            <div className="bg-gray-900/80 backdrop-blur rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-purple-400" />
                Analyse
              </h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400">Probabilité par essai</p>
                  <p className="text-2xl font-bold text-green-400">
                    {(probability * 100).toFixed(2)}%
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-400">Essais moyens attendus</p>
                  <p className="text-xl font-semibold">
                    ~{probability > 0 ? Math.ceil(1 / probability) : '∞'}
                  </p>
                </div>
                
                {attempts > 0 && (
                  <>
                    <div className="border-t border-gray-700 pt-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-400">Tentatives actuelles</p>
                        <div className="flex items-center gap-1">
                          <img 
                            src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1758047311/hammer_tez64c.png"
                            alt="hammer"
                            className="w-4 h-4"
                          />
                          <span className={`text-xs ${attempts * 5 > 500 ? 'text-red-400' : 'text-yellow-400'}`}>
                            {attempts * 5}
                          </span>
                        </div>
                      </div>
                      <p className="text-xl font-semibold">{attempts}</p>
                    </div>
                    
                    {/* Hammer Cost Analysis */}
                    <div className="bg-red-900/20 border border-red-600/50 p-2 rounded">
                      <div className="text-xs space-y-1">
                        <p>🔨 {attempts * 5} marteaux utilisés</p>
                        {attempts * 5 < 50 && (
                          <p className="text-green-400">True F2P! Respect! 🎖️</p>
                        )}
                        {attempts * 5 >= 50 && attempts * 5 < 200 && (
                          <p className="text-yellow-400">Beaucoup de marteaux... 🤔</p>
                        )}
                        {attempts * 5 >= 200 && attempts * 5 < 1000 && (
                          <p className="text-orange-400">T'as acheté un pack hein? 👛</p>
                        )}
                        {attempts * 5 >= 1000 && (
                          <p className="text-red-400 font-bold animate-pulse">WHALE ALERT! 🐋</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-400">Miergo Score (σ)</p>
                      <div className="flex items-center gap-2">
                        <p className={`text-lg font-bold ${
                          miergoScore < -2 ? 'text-green-500' :
                          miergoScore > 2 ? 'text-red-500' :
                          'text-yellow-500'
                        }`}>
                          {miergoScore.toFixed(2)}σ
                        </p>
                        {miergoScore < -2 && <span className="text-xs text-green-400">BLESSED!</span>}
                        {miergoScore > 2 && <span className="text-xs text-red-400">MIERGOTED!</span>}
                        </div>
                      
                      {/* Miergo Progress Bar */}
                      <div className="mt-2">
                        <div className="bg-gray-700 rounded-full h-3 overflow-hidden relative">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              attempts < 715 ? 'bg-green-500' :
                              attempts < 1430 ? 'bg-yellow-500' :
                              attempts < 2145 ? 'bg-orange-500' :
                              attempts < 3000 ? 'bg-red-500' :
                              'bg-purple-500 animate-pulse'
                            }`}
                            style={{ width: `${Math.min((attempts / 3400) * 100, 100)}%` }}
                          />
                          {/* Miergo Marker */}
                          <div 
                            className="absolute top-0 h-full w-1 bg-purple-600"
                            style={{ left: `${(3400 / 3400) * 100}%` }}
                          >
                            <span className="absolute -top-5 -left-6 text-[10px] text-purple-400">
                              Miergo
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 text-center">
                          {attempts}/3400 (Miergo Level: {((attempts/3400) * 100).toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-900/80 backdrop-blur rounded-lg p-4 space-y-2">
              <button
                onClick={rollOnce}
                disabled={!mainStat || mustHaveStats.length === 0 || rollResults?.success}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:opacity-50 px-4 py-2 rounded transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
              >
                <Dice1 className="w-4 h-4" />
                Roll une fois
              </button>
              
              {!autoRollActive ? (
                <button
                  onClick={startAutoRoll}
                  disabled={!mainStat || mustHaveStats.length === 0}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:opacity-50 px-4 py-2 rounded transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
                >
                  <Zap className="w-4 h-4" />
                  Auto-roll (jusqu'au succès)
                </button>
              ) : (
                <button
                  onClick={stopAutoRoll}
                  className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition-colors flex items-center justify-center gap-2 text-sm font-semibold animate-pulse"
                >
                  ⏸️ Stop Auto-roll ({attempts})
                </button>
              )}
              
              {(attempts > 0 || rollResults) && (
                <button
                  onClick={resetAll}
                  className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset ({attempts * 5} 🔨)
                </button>
              )}
            </div>

            {/* Success Message */}
            {rollResults?.success && (
              <div className="bg-green-900/30 border border-green-500 rounded-lg p-4 animate-pulse">
                <h3 className="text-lg font-semibold text-green-400 mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Succès!
                </h3>
                <p className="text-sm">
                  Obtenu en {rollResults.attempts} essais!
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Coût: {rollResults.attempts * 5} marteaux
                </p>
                {rollResults.attempts < 10 && (
                  <p className="text-xs text-red-400 mt-2">
                    Bobby: "Moins de 10 essais? Whale détecté! 🐋"
                  </p>
                )}
                {rollResults.attempts > 1000 && (
                  <p className="text-xs text-purple-400 mt-2 animate-pulse">
                    Tu as rejoint la confrérie de Miergo!
                  </p>
                )}
                <div className="mt-2 text-xs text-gray-300">
                  {rollResults.stats.join(' • ')}
                </div>
              </div>
            )}

            {/* Miergo Achievement */}
            {attempts === 3400 && (
              <div className="bg-purple-900/50 border-2 border-purple-500 rounded-lg p-4 animate-bounce">
                <h3 className="text-xl font-bold text-purple-400 mb-2 text-center">
                  🏆 MIERGO LEVEL ACHIEVED! 🏆
                </h3>
                <p className="text-sm text-center">
                  Tu es maintenant une légende vivante!
                </p>
                <p className="text-xs text-gray-400 text-center mt-2">
                  17000 marteaux... La souffrance incarnée...
                </p>
                <p className="text-[10px] text-purple-300 text-center mt-3 italic">
                  "Les pieds valaient la peine..." - Miergo
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 🗺️ Canvas Map avec Chibis */}
        <div className="w-full mt-8">
          <div className={`bg-gray-900/80 backdrop-blur rounded-lg p-4 ${attempts > 2500 ? 'border-2 border-purple-500 animate-pulse' : ''}`}>
            <h3 className="text-center text-purple-300 text-sm font-semibold mb-3">
              🗺️ Artifact Realm - Les gardiens observent ton calvaire
            </h3>
            
            <div className="relative w-full">
              <canvas
                ref={canvasRef}
                width="800"
                height="200"
                className="w-full h-auto rounded-lg shadow-lg bg-black/50 cursor-pointer"
                style={{
                  imageRendering: 'crisp-edges',
                  border: attempts > 3000 ? '3px solid rgba(147, 51, 234, 0.8)' : '2px solid rgba(139, 92, 246, 0.3)',
                  animation: attempts > 3000 ? 'pulse 2s infinite' : 'none'
                }}
              />
              
              {/* Miergo Ghost overlay */}
              {attempts > 3000 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-purple-400 text-6xl opacity-20 animate-pulse">
                    👻
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-center text-xs text-gray-400 mt-2">
              Tank, Beru, Kaisel et BobbyJones {attempts > 2000 ? 'contemplent ta descente aux enfers...' : 'explorent le royaume des artefacts'}
            </p>
          </div>
        </div>

        {/* Wall of Miergo (si attempts > 1000) */}
        {attempts > 1000 && (
          <div className="mt-8 bg-purple-950/30 border border-purple-600/50 rounded-lg p-4">
            <h3 className="text-center text-purple-400 font-bold mb-3">
              🪦 Approche du Cimetière de Miergo 🪦
            </h3>
            <div className="text-center">
              <p className="text-sm text-gray-400">
                Distance jusqu'à Miergo: {3400 - attempts} rolls
              </p>
              <p className="text-xs text-purple-300 mt-2">
                {attempts < 1500 && "Tu peux encore t'échapper..."}
                {attempts >= 1500 && attempts < 2000 && "Le point de non-retour approche..."}
                {attempts >= 2000 && attempts < 2500 && "Tu sens l'aura de Miergo..."}
                {attempts >= 2500 && attempts < 3000 && "Miergo t'attend..."}
                {attempts >= 3000 && attempts < 3400 && "Presque... Tu y es presque..."}
                {attempts >= 3400 && "Tu l'as fait. Tu ES Miergo maintenant."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Easter Egg Secret à 3400 */}
      {attempts === 3400 && (
        <div className="fixed bottom-0 right-0 p-4 animate-bounce">
          <span className="text-6xl">🦶</span>
        </div>
      )}
    </div>
  );
};

export default ArtifactCraftSimulator;