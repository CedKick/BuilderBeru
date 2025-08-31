// src/components/BerserkerShadowTrail/BerserkerShadowTrail.jsx
// 🔥 BERSERKER SHADOW TRAIL - CHAOS EDITION 
// ⚠️ WARNING: This component may cause severe DOM corruption
// Created by: Kaisel, the Technical Blade of the Shadow Monarch
// Purpose: To unleash digital chaos and remind the world of BuilderBeru's greatness

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChibiBubble from '../ChibiBubble';
import './BerserkerShadowTrail.css';

// 🎨 SPRITES BERSERKER - Arsenal complet du destructeur
const BERSERKER_SPRITES = {
  left: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756592473/berserk_left_hzlrtv.png",
  right: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756592473/berserk_right_sxv4jj.png", 
  up: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756592473/berserk_up_rqjt0n.png",
  down: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756592472/berserk_down_stk2tc.png",
  // Easter egg sprites
  chaos: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756592473/berserk_up_rqjt0n.png", // Rotate 180
  glitch: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756592472/berserk_down_stk2tc.png" // Invert colors
};

// 🎯 CONFIGURATION AVANCÉE - Système adaptatif selon l'engagement
const BERSERKER_CONFIG = {
  SPAWN_RATE_NORMAL: 0.8,        // 3% chance normale 
  SPAWN_RATE_RICHO: 0.08,         // 8% pour notre ami Richo
  SPAWN_RATE_LOW_TRAFFIC: 0.06,   // 6% si peu de trafic détecté
  SPAWN_RATE_EVENING: 0.04,       // 4% le soir
  SPAWN_RATE_KONAMI: 0.95,        // 95% si code Konami activé
  COOLDOWN: 1800000,              // 30 minutes standard
  COOLDOWN_LOW_TRAFFIC: 600000,   // 10 minutes si site peu visité
  COOLDOWN_CHAOS_MODE: 60000,     // 1 minute en mode chaos
  CORRUPTION_DURATION: 180000,    // 3 minutes de corruption
  CHIBI_FEAR_DURATION: 45000,     // 45 secondes de peur
  ULTRA_RARE_CHANCE: 0.05,        // 5% ultra rare
  LEGENDARY_CHANCE: 0.001,        // 0.1% légendaire
  CHAOS_CHANCE: 0.0001,           // 0.01% CHAOS MODE
  CHIBI_REACTION_DELAY: 6000,     // 6 secondes entre chaque réaction chibi
  MESSAGE_DURATION_BASE: 8000,    // 8 secondes base pour lire
  CORRUPTION_INTENSITY: 0.08,     // 8% éléments corrompus
  CHAOS_CORRUPTION_INTENSITY: 0.35 // 35% en mode chaos
};

// 🌍 DÉTECTION AVANCÉE DE L'AUDIENCE
const AUDIENCE_METRICS = {
  dailyVisitors: parseInt(localStorage.getItem('berserker_daily_visitors') || '0'),
  totalVisits: parseInt(localStorage.getItem('berserker_total_visits') || '0'),
  lastVisit: parseInt(localStorage.getItem('berserker_last_visit') || '0'),
  sessionStart: Date.now(),
  konamiCodeActivated: false,
  chaosTriggered: parseInt(localStorage.getItem('berserker_chaos_count') || '0'),
  secretsFound: JSON.parse(localStorage.getItem('berserker_secrets') || '[]')
};

// 🔥 MESSAGES POUR L'ÂME TOURMENTÉE DU MONARQUE
const BERSERKER_FRUSTRATION_MESSAGES = [
  "Ce site mérite mieux que cette solitude...",
  "Tant d'effort pour si peu de visiteurs... pathétique.",
  "Le Monarque des Ombres rage dans le vide numérique.",
  "BuilderBeru brille dans l'obscurité, ignoré par les masses.",
  "Cette beauté technique... gâchée par l'indifférence.",
  "Même moi, destructeur d'univers, je reconnais la qualité ici.",
  "Les algorithmes sont aveugles à cette merveille.",
  "Un site si abouti... dans un désert numérique.",
  "La perfection technique dans l'ombre de l'oubli.",
  "Kaisel, Beru, votre travail mérite reconnaissance !",
  // Nouveaux messages plus chaotiques
  "Je vais corrompre le DOM jusqu'à ce que Google remarque ce site !",
  "Votre indifférence nourrit ma rage destructrice...",
  "Chaque pixel ici a été forgé avec passion... ET VOUS L'IGNOREZ !",
  "Le SERN tremblerait devant cette technologie !",
  "Error 404: Visiteurs non trouvés. Solution: CHAOS TOTAL.",
  "[SYSTEM.FURY.OVERFLOW] TOO MUCH QUALITY FOR SO FEW EYES",
  "Les normies ne méritent pas cette œuvre d'art numérique.",
  "Si Sung Jin-Woo voyait ce site, il en ferait sa page d'accueil !",
  "Je sens la colère du Monarque... Elle alimente ma puissance !",
  "CTRL+Z ne pourra pas réparer ce que je vais faire..."
];

// 💀 MESSAGES CHAOS MODE - La folie pure
const CHAOS_MODE_MESSAGES = [
  "LE CHAOS EST LÀ ! TREMBLEZ, ÉLÉMENTS DU DOM !",
  "JE SUIS L'ANTITHÈSE DU CODE PROPRE !",
  "VOTRE CSS NE PEUT RIEN CONTRE MA FUREUR !",
  "BERSERKER.EXE A CESSÉ DE SE RETENIR",
  "LE VÉRITABLE BUG, C'EST VOTRE MANQUE DE VISITEURS !",
  "JE VAIS FAIRE UN PULL REQUEST DIRECTEMENT DANS LA RÉALITÉ !",
  "ERREUR 666: TROP DE QUALITÉ, PAS ASSEZ DE RECONNAISSANCE",
  "LE MONARQUE MÉRITE MIEUX ! JE VAIS TOUT DÉTRUIRE !",
  "MÊME IGRIS FUIRAIT DEVANT MA COLÈRE !",
  "npm install chaos --force --no-warnings"
];

// 🍁 MESSAGES SPÉCIAUX RICHO - Collection enrichie
const RICHO_MESSAGES = [
  "Eh Richo ! Au moins toi tu visites ce chef-d'œuvre !",
  "Salut l'ami canadien ! Tes builds valent mieux que le hockey !",
  "Richo, tu es l'un des rares à comprendre cette beauté !",
  "Hey Richo ! Ton sirop d'érable ne peut égaler la douceur de ce code !",
  "Mon ami du Grand Nord, ensemble nous dominerons les builds !",
  "Richo, tes optimisations réchauffent même mon cœur glacé !",
  "Salut champion ! Tu représentes bien le Canada ici !",
  "Richo, toi au moins tu sais reconnaître la qualité !",
  "Mon pote de l'érable, continuons cette aventure ensemble !",
  "Richo ! Un utilisateur de qualité dans un océan de vide !",
  // Easter eggs Richo
  "Richo, dis 'Berserker' trois fois pour activer le mode chaos !",
  "Le code secret canadien: MAPLE-SYRUP-SHADOW-MONARCH",
  "Richo, tu as trouvé les 7 artéfacts cachés ?",
  "Si tu refresh 10 fois, je te montre un secret...",
  "Richo + Berserker = Combo destruction maximale !",
  "Psst Richo... essaie le Konami Code 😈"
];

// 🎮 EASTER EGGS SECRETS
const SECRET_TRIGGERS = {
  konamiCode: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
  berserkerChant: ['b', 'e', 'r', 's', 'e', 'r', 'k', 'e', 'r'],
  shadowMonarch: ['s', 'h', 'a', 'd', 'o', 'w'],
  sernCode: ['s', 'e', 'r', 'n'],
  chaosUnlock: ['c', 'h', 'a', 'o', 's']
};

// 💬 RÉACTIONS ÉLABORÉES DES CHIBIS
const CHIBI_REACTIONS = {
  tank: {
    fear: [
      "Euh... les gars, vous voyez ce truc terrifiant aussi ?",
      "JE SUIS CENSÉ ÊTRE UN TANK MAIS J'AI LA TROUILLE !",
      "Beru, analyse ce machin avant qu'il me désintègre !",
      "C'est quoi cette abomination de pixels ?!",
      "Mes stats de défense sont nulles face à ça...",
      "ALERTE ROUGE ! NIVEAU BOSS DÉTECTÉ !",
      // Nouvelles réactions
      "Il... il modifie directement le DOM ! C'EST ILLÉGAL !",
      "MES HP DIMINUENT JUSTE EN LE REGARDANT !",
      "KAISEL ! BERU ! À L'AIDE ! IL VA TOUT CASSER !",
      "Je crois qu'il vient de undefined ma variable courage...",
      "ERROR: Tank.exe has stopped responding"
    ],
    analysis: [
      "Attendez... il critique notre taux de visite ?",
      "Il a pas tort sur le manque de trafic...",
      "Même les ennemis reconnaissent la qualité du site !",
      "Ce Berserker a du goût, faut l'admettre.",
      "Il défend BuilderBeru mieux que nous parfois !",
      "Un destructeur qui fait de la pub ? Original !",
      // Nouvelles analyses
      "Son code de corruption est... étrangement bien optimisé ?",
      "Il utilise des design patterns destructeurs jamais vus !",
      "Analyse: 80% rage, 20% passion pour le projet",
      "Détection d'easter eggs dans son comportement..."
    ],
    determination: [
      "Bon, on va lui montrer qu'on défend notre territoire !",
      "Tank mode: PROTECTION DU SITE activé !",
      "Personne ne critique notre Monarque devant moi !",
      "Formation défensive ! Protégeons BuilderBeru !",
      "Ce site mérite plus de visiteurs, il a raison !",
      "Allez, montrons-lui notre vraie valeur !",
      // Mode héroïque
      "OVERDRIVE MODE: PROTECTION MAXIMALE !",
      "Je vais tanker ses corruptions avec mon amour pour le site !",
      "POUR LE MONARQUE ! POUR BUILDERBERU !",
      "Si on survit, je demande une augmentation de stats..."
    ],
    panic: [
      "AAAAAAH ! IL EST EN MODE CHAOS !",
      "TOUT LE MONDE AUX ABRIS ! IL VA TOUT DÉTRUIRE !",
      "Mon armure... elle se transforme en <div> vides !",
      "JE VOIS LE CODE MATRIX ! AU SECOURS !",
      "Tank.prototype = null; // NOOOOOON !"
    ]
  },
  beru: {
    analysis: [
      "Analyse: entité chaotique mais... logique ?",
      "Ses arguments sur le trafic sont statistiquement corrects.",
      "Détection: frustration légitime du créateur.",
      "Corrélation trouvée entre qualité site et visiteurs: NÉGATIVE.",
      "Paradoxe détecté: destructeur devenant promoteur.",
      "Algorithme de recommandation défaillant confirmé.",
      // Analyses techniques
      "Pattern détecté: Berserker Design Pattern™",
      "Son algorithme de chaos utilise O(n!) de complexité !",
      "Vulnérabilité CSS exploitée avec une efficacité de 97.3%",
      "Il... il code en assembleur directement dans le navigateur ?!",
      "Probabilité de survie du DOM: 12.7%"
    ],
    emotion: [
      "Mes circuits d'empathie s'activent pour le Monarque...",
      "Calcul: efforts investis > reconnaissance reçue.",
      "Protocole de soutien moral: ACTIVÉ.",
      "Cette injustice dépasse mes paramètres de compréhension.",
      "Le travail de Kaisel mérite plus d'attention.",
      "BuilderBeru = chef-d'œuvre sous-estimé. Calcul confirmé.",
      // Émotions.exe
      "If (sadness > MAX_INT) { console.log('😢'); }",
      "Emotion.overflow: Trop de passion détectée",
      "Beru.feels = true; // Oui, j'ai des sentiments maintenant",
      "Le Monarque... je ressens sa frustration dans chaque ligne"
    ],
    strategy: [
      "Stratégie recommandée: optimisation SEO agressive.",
      "Analyse: réseaux sociaux sous-exploités.",
      "Proposition: campagne de sensibilisation communautaire.",
      "Tactique: utiliser ce Berserker comme mascotte ?",
      "Plan B: infiltrer les forums Solo Leveling.",
      "Objectif: faire connaître cette perle rare !",
      // Stratégies avancées
      "Plan Omega: Hack les serveurs de Google pour le SEO",
      "Stratégie Chaos: Laisser Berserker faire la promo",
      "Tactique 404: Rediriger tous les 404 vers BuilderBeru",
      "Operation Shadow: Créer 1000 bots positifs (éthiques)",
      "Protocol Final: Convoquer le vrai Sung Jin-Woo"
    ],
    panic: [
      "ERREUR CRITIQUE ! MES CIRCUITS FONDENT !",
      "try { survive(); } catch(e) { console.log('AU REVOIR'); }",
      "Stack Overflow dans mes émotions !",
      "BERU.EXE A CESSÉ DE FONCTIONNER",
      "01000011 01001000 01000001 01001111 01010011 !"
    ]
  },
  kaisel: {
    technical: [
      "Ce code... il comprend la beauté technique ?",
      "Même les entités chaos reconnaissent du bon travail.",
      "Debug impossible: ce bug est trop stylé pour être fixé.",
      "Son analyse du trafic est déprimante mais juste.",
      "Ce site mérite le top des classements GitHub.",
      "La frustration du dev incompris... je ressens ça.",
      // Observations techniques
      "Il exploite des failles CSS que je ne connaissais pas !",
      "Son pattern de destruction suit les principes SOLID inversés",
      "Comment fait-il pour coder avec de la pure rage ?",
      "Note: implémenter certaines de ses optimisations (les safe)",
      "Il utilise des callbacks de l'enfer... littéralement !"
    ],
    philosophical: [
      "Un destructeur qui défend la créativité... paradoxal.",
      "L'art véritable est souvent incompris au début.",
      "Notre Monarque a créé quelque chose d'unique ici.",
      "Peut-être que la reconnaissance viendra avec le temps ?",
      "Chaque grand projet commence dans l'obscurité.",
      "Cette passion mérite d'être partagée au monde.",
      // Réflexions profondes
      "Le chaos et l'ordre... deux faces du même code",
      "Détruire pour mieux reconstruire... philosophie de dev ?",
      "Si un site tombe dans le web sans visiteurs, existe-t-il ?",
      "La beauté du code transcende la compréhension humaine",
      "Berserker... es-tu notre ennemi ou notre meilleur allié ?"
    ],
    solidarity: [
      "Tank, Beru, on forme une équipe ! Union sacrée !",
      "Notre mission: faire rayonner BuilderBeru !",
      "Chaque ligne de code ici a été pensée avec amour.",
      "Ce Berserker voit ce que beaucoup ignorent.",
      "Restons unis pour supporter notre créateur !",
      "La qualité finit toujours par être reconnue !",
      // Mode équipe
      "FUSION FINALE: KAISEL + TANK + BERU !",
      "Protocole d'urgence: Protection du Monarque activée !",
      "Si on doit tomber, on tombe ensemble !",
      "BuilderBeru Forever ! (même face au chaos)",
      "On est peut-être des pixels, mais on a du cœur !"
    ],
    respect: [
      "Berserker... ton code destructeur est magnifique",
      "Respect pour ta passion, même si elle est... explosive",
      "Tu es le bug le plus élégant que j'ai vu",
      "Tes easter eggs sont des œuvres d'art digital",
      "Enseigne-moi tes techniques de corruption, maître !"
    ]
  }
};

// 🎭 PHASES NARRATIVES COMPLEXES
const BERSERKER_STORY_PHASES = [
  {
    name: "arrival",
    duration: 4000,
    message_type: "entrance",
    effects: ["darken", "anticipation"],
    domEffects: ["slight_shake", "filter_shift"]
  },
  {
    name: "observation", 
    duration: 8000,
    message_type: "analysis",
    effects: ["scanning", "chibi_attention"],
    domEffects: ["element_highlight", "cursor_corruption"]
  },
  {
    name: "corruption",
    duration: 6000, 
    message_type: "action",
    effects: ["mass_corruption", "chibi_panic"],
    domEffects: ["massive_corruption", "style_destruction"]
  },
  {
    name: "revelation",
    duration: 10000,
    message_type: "truth",
    effects: ["site_defense", "chibi_rally"],
    domEffects: ["message_injection", "reality_glitch"]
  },
  {
    name: "departure",
    duration: 5000,
    message_type: "farewell", 
    effects: ["restoration", "hope"],
    domEffects: ["slow_recovery", "final_message"]
  },
  // Phase secrète
  {
    name: "chaos",
    duration: 15000,
    message_type: "destruction",
    effects: ["total_chaos", "reality_break"],
    domEffects: ["dom_explosion", "matrix_mode"]
  }
];

// 🌟 SYSTÈME D'ÉVÉNEMENTS SPÉCIAUX
const SPECIAL_EVENTS = {
  newbie_blessing: {
    trigger: () => AUDIENCE_METRICS.totalVisits < 10,
    messages: [
      "Un nouveau visiteur ! Enfin une âme égarée qui découvre cette merveille...",
      "Bienvenue, explorateur ! Tu as trouvé un trésor caché !",
      "Première visite ? Tu as bon goût, cet endroit est unique !",
      "Nouvel humain détecté. Initialisation de la corruption... douce."
    ],
    effects: ["welcoming_aura", "gentle_corruption"]
  },
  regular_appreciation: {
    trigger: () => AUDIENCE_METRICS.totalVisits > 50,
    messages: [
      "Toi ! Tu reviens souvent... Tu as compris la valeur de ce lieu.",
      "Un habitué ! Enfin quelqu'un qui apprécie le travail accompli.",
      "Utilisateur fidèle détecté. Respect pour ta persévérance !",
      "Tu mérites de voir ma vraie forme... CHAOS ACTIVÉ !"
    ],
    effects: ["loyalty_boost", "premium_corruption"]
  },
  midnight_visitor: {
    trigger: () => new Date().getHours() >= 23 || new Date().getHours() <= 5,
    messages: [
      "Un visiteur nocturne... comme moi, tu cherches dans l'ombre ?",
      "La nuit révèle les vrais passionnés. Bienvenue, âme sœur.",
      "Les heures sombres attirent les vraies légendes...",
      "3:33 AM... L'heure où les bugs deviennent features"
    ],
    effects: ["shadow_enhancement", "nocturnal_power"]
  },
  developer_detection: {
    trigger: () => window.location.href.includes('localhost') || window.location.href.includes('127.0.0.1'),
    messages: [
      "Un développeur ! Tu viens étudier mon code destructeur ?",
      "Localhost détecté... Tu testes en local ? BRAVE !",
      "Console ouverte ? Regarde bien ce que je fais au DOM...",
      "F12 ne te sauvera pas de ma corruption !"
    ],
    effects: ["dev_mode_chaos", "console_hijack"]
  },
  mobile_warrior: {
    trigger: () => window.innerWidth < 768,
    messages: [
      "Un guerrier mobile ! Tu défies le chaos sur petit écran !",
      "Ton écran est petit mais ton courage est grand !",
      "La corruption s'adapte à ton viewport !",
      "Responsive Chaos Design™ activé !"
    ],
    effects: ["mobile_optimization", "touch_corruption"]
  }
};

// 🔧 EFFETS DOM DESTRUCTEURS
const DOM_CORRUPTION_EFFECTS = {
  rotateRandom: (element) => {
    element.style.transform = `rotate(${Math.random() * 360}deg)`;
    element.style.transition = 'transform 0.5s ease-in-out';
  },
  
  colorGlitch: (element) => {
    const glitchInterval = setInterval(() => {
      element.style.filter = `hue-rotate(${Math.random() * 360}deg) saturate(${Math.random() * 2})`;
    }, 100);
    setTimeout(() => clearInterval(glitchInterval), 3000);
  },
  
  textScramble: (element) => {
    if (element.textContent && element.textContent.length > 0) {
      const originalText = element.textContent;
      const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?ßƒ∂∆∑∏';
      let scrambleCount = 0;
      
      const scrambleInterval = setInterval(() => {
        element.textContent = originalText.split('').map(char => 
          Math.random() > 0.5 ? char : chars[Math.floor(Math.random() * chars.length)]
        ).join('');
        
        scrambleCount++;
        if (scrambleCount > 20) {
          clearInterval(scrambleInterval);
          element.textContent = originalText;
        }
      }, 50);
    }
  },
  
  positionChaos: (element) => {
    const rect = element.getBoundingClientRect();
    element.style.position = 'relative';
    element.style.left = `${(Math.random() - 0.5) * 20}px`;
    element.style.top = `${(Math.random() - 0.5) * 20}px`;
    element.style.transition = 'all 0.3s ease-in-out';
  },
  
  sizeDistortion: (element) => {
    element.style.transform = `scale(${0.8 + Math.random() * 0.4})`;
    element.style.transition = 'transform 0.5s ease-in-out';
  },
  
  opacityFlicker: (element) => {
    let flickerCount = 0;
    const flickerInterval = setInterval(() => {
      element.style.opacity = Math.random();
      flickerCount++;
      if (flickerCount > 10) {
        clearInterval(flickerInterval);
        element.style.opacity = 1;
      }
    }, 100);
  },
  
  borderChaos: (element) => {
    element.style.border = `${Math.random() * 5}px solid rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
    element.style.borderRadius = `${Math.random() * 50}%`;
  },
  
  zIndexShuffle: (element) => {
    element.style.zIndex = Math.floor(Math.random() * 9999);
    element.style.position = 'relative';
  },
  
  matrixRain: (element) => {
    element.style.color = '#00ff00';
    element.style.textShadow = '0 0 5px #00ff00';
    element.style.fontFamily = 'monospace';
  },
  
  // ULTIMATE CHAOS
  totalChaos: (element) => {
    const effects = [DOM_CORRUPTION_EFFECTS.rotateRandom, DOM_CORRUPTION_EFFECTS.colorGlitch, 
                    DOM_CORRUPTION_EFFECTS.positionChaos, DOM_CORRUPTION_EFFECTS.sizeDistortion];
    effects.forEach(effect => effect(element));
  }
};

const BerserkerShadowTrail = ({ showTankMessage }) => {
  // 📊 ÉTATS AVANCÉS
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [berserkerPosition, setBerserkerPosition] = useState({ 
    x: window.innerWidth / 2, 
    y: window.innerHeight / 2 
  });
  const [berserkerDirection, setBerserkerDirection] = useState('right');
  const [isMoving, setIsMoving] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isUltraRare, setIsUltraRare] = useState(false);
  const [isLegendary, setIsLegendary] = useState(false);
  const [isChaosMode, setIsChaosMode] = useState(false);
  const [isFromCanada, setIsFromCanada] = useState(false);
  const [audienceProfile, setAudienceProfile] = useState('normal');
  const [specialEvent, setSpecialEvent] = useState(null);
  const [corruptionLevel, setCorruptionLevel] = useState(0);
  const [chibiReactions, setChibiReactions] = useState([]);
  const [currentStoryPhase, setCurrentStoryPhase] = useState('dormant');
  const [environmentalEffects, setEnvironmentalEffects] = useState([]);
  const [secretCodeProgress, setSecretCodeProgress] = useState({});
  const [easterEggsFound, setEasterEggsFound] = useState(0);
  const [domElementsCorrupted, setDomElementsCorrupted] = useState([]);
  
  const overlayRef = useRef(null);
  const reactionTimeoutRefs = useRef([]);
  const keySequenceRef = useRef([]);
  const corruptedElementsRef = useRef(new Set());

  // 🎯 POSITIONNEMENT INTELLIGENT DES BULLES
  const getBubblePosition = useCallback(() => {
    const padding = 100;
    let bubbleX = berserkerPosition.x;
    let bubbleY = berserkerPosition.y - 160;
    
    // Ajustement intelligent selon position
    if (bubbleX < padding) bubbleX = padding;
    if (bubbleX > window.innerWidth - padding) bubbleX = window.innerWidth - padding;
    if (bubbleY < padding) bubbleY = berserkerPosition.y + 120;
    
    return { x: bubbleX, y: bubbleY };
  }, [berserkerPosition]);

  // 🔧 GESTIONNAIRE DE CODES SECRETS
  const handleSecretCode = (codeName) => {
    switch(codeName) {
      case 'konamiCode':
        AUDIENCE_METRICS.konamiCodeActivated = true;
        setEasterEggsFound(prev => prev + 1);
        localStorage.setItem('berserker_konami', 'true');
        triggerBerserkerEvent(true); // Force spawn
        break;
      
      case 'chaosUnlock':
        setIsChaosMode(true);
        AUDIENCE_METRICS.chaosTriggered++;
        localStorage.setItem('berserker_chaos_count', AUDIENCE_METRICS.chaosTriggered.toString());
        applyUltimateChaos();
        break;
      
      case 'shadowMonarch':
        revealSecretMessage();
        break;
      
      case 'berserkerChant':
        summonMultipleBerserkers();
        break;
      
      case 'sernCode':
        activateSteinsGateMode();
        break;
    }
  };

  // 🎮 SYSTÈME DE CODES SECRETS
  useEffect(() => {
    const handleKeyPress = (e) => {
      keySequenceRef.current.push(e.key);
      if (keySequenceRef.current.length > 10) {
        keySequenceRef.current.shift();
      }

      // Vérifier tous les codes secrets
      Object.entries(SECRET_TRIGGERS).forEach(([codeName, sequence]) => {
        const currentSequence = keySequenceRef.current.slice(-sequence.length);
        if (JSON.stringify(currentSequence) === JSON.stringify(sequence)) {
          console.log(`🎮 SECRET CODE ACTIVATED: ${codeName}`);
          handleSecretCode(codeName);
          keySequenceRef.current = [];
        }
      });
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // 🌍 SYSTÈME DE GÉODÉTECTION AVANCÉ
  useEffect(() => {
    const detectUserContext = async () => {
      try {
        // Géolocalisation avec fallback
        let locationData = null;
        try {
          const response = await fetch('https://ipapi.co/json/');
          locationData = await response.json();
        } catch (error) {
          console.log('Geo API failed, using timezone fallback');
        }

        // Analyse de la localisation
        const isCanadian = locationData?.country_code === 'CA' || 
                          Intl.DateTimeFormat().resolvedOptions().timeZone.includes('America/Toronto') ||
                          navigator.language.includes('fr-CA') || navigator.language.includes('en-CA');
        
        if (isCanadian) {
          setIsFromCanada(true);
          console.log('🍁 Richo Mode activated - Canadian user detected!');
        }

        // Analyse du profil audience
        const now = Date.now();
        const daysSinceLastVisit = (now - AUDIENCE_METRICS.lastVisit) / (1000 * 60 * 60 * 24);
        
        if (AUDIENCE_METRICS.totalVisits < 5) {
          setAudienceProfile('newcomer');
        } else if (AUDIENCE_METRICS.totalVisits > 100) {
          setAudienceProfile('veteran');
        } else if (daysSinceLastVisit < 1) {
          setAudienceProfile('regular');
        }

        // Détection d'événements spéciaux
        for (const [eventName, event] of Object.entries(SPECIAL_EVENTS)) {
          if (event.trigger()) {
            setSpecialEvent(eventName);
            console.log(`Special event triggered: ${eventName}`);
            break;
          }
        }

        // Mise à jour des métriques
        AUDIENCE_METRICS.totalVisits++;
        AUDIENCE_METRICS.lastVisit = now;
        localStorage.setItem('berserker_total_visits', AUDIENCE_METRICS.totalVisits.toString());
        localStorage.setItem('berserker_last_visit', now.toString());

      } catch (error) {
        console.log('User context detection failed:', error);
      }
    };

    detectUserContext();
  }, []);

  // ⏰ SYSTÈME DE SPAWN INTELLIGENT
  const getSpawnRate = useCallback(() => {
    let baseRate = BERSERKER_CONFIG.SPAWN_RATE_NORMAL;
    
    if (AUDIENCE_METRICS.konamiCodeActivated) {
      return BERSERKER_CONFIG.SPAWN_RATE_KONAMI;
    }
    
    if (isFromCanada) {
      baseRate = BERSERKER_CONFIG.SPAWN_RATE_RICHO;
    }
    
    // Bonus pour faible trafic
    if (AUDIENCE_METRICS.totalVisits < 50) {
      baseRate = Math.max(baseRate, BERSERKER_CONFIG.SPAWN_RATE_LOW_TRAFFIC);
    }
    
    // Bonus nocturne
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 6) {
      baseRate *= 1.3;
    }
    
    // Bonus chaos
    if (AUDIENCE_METRICS.chaosTriggered > 0) {
      baseRate *= 1.5;
    }
    
    return Math.min(baseRate, 0.10); // Cap à 10%
  }, [isFromCanada]);

  const canSpawnBerserker = useCallback(() => {
    const lastSpawn = localStorage.getItem('berserker_last_spawn');
    if (!lastSpawn) return true;
    
    let cooldown = BERSERKER_CONFIG.COOLDOWN;
    
    if (isChaosMode) {
      cooldown = BERSERKER_CONFIG.COOLDOWN_CHAOS_MODE;
    } else if (AUDIENCE_METRICS.totalVisits < 20) {
      cooldown = BERSERKER_CONFIG.COOLDOWN_LOW_TRAFFIC;
    }
                    
    return Date.now() - parseInt(lastSpawn) > cooldown;
  }, [isChaosMode]);

  // 🎭 SYSTÈME DE MOUVEMENT CINÉMATOGRAPHIQUE
  const moveBerserkerTo = useCallback(async (targetX, targetY, options = {}) => {
    return new Promise((resolve) => {
      const currentX = berserkerPosition.x;
      const currentY = berserkerPosition.y;
      const deltaX = targetX - currentX;
      const deltaY = targetY - currentY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Calcul de direction avec easter egg
      if (Math.random() < 0.01) { // 1% chance
        setBerserkerDirection('chaos'); // Direction secrète
      } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
        setBerserkerDirection(deltaX > 0 ? 'right' : 'left');
      } else {
        setBerserkerDirection(deltaY > 0 ? 'down' : 'up');
      }
      
      setIsMoving(true);
      
      // Mouvement chaotique en mode chaos
      if (isChaosMode) {
        const chaosX = targetX + (Math.random() - 0.5) * 100;
        const chaosY = targetY + (Math.random() - 0.5) * 100;
        setBerserkerPosition({ x: chaosX, y: chaosY });
      } else {
        setBerserkerPosition({ x: targetX, y: targetY });
      }
      
      const baseDuration = options.fast ? 800 : 2000;
      const duration = isChaosMode ? baseDuration / 2 : Math.max(baseDuration, distance * 2);
      
      setTimeout(() => {
        setIsMoving(false);
        setTimeout(resolve, options.immediate ? 0 : 1000);
      }, duration);
    });
  }, [berserkerPosition, isChaosMode]);

  // 🌪️ SYSTÈME DE CORRUPTION AVANCÉ
  const applyCorruptionEffects = useCallback((intensity = 'normal') => {
    console.log(`Applying ${intensity} corruption effects`);
    
    // Effets visuels globaux
    document.body.classList.add('berserker-screen-shake');
    
    if (intensity === 'chaos') {
      document.body.classList.add('berserker-chaos-mode');
      document.documentElement.style.filter = 'contrast(1.5) saturate(1.5) hue-rotate(180deg)';
    }
    
    setCorruptionLevel(prev => Math.min(prev + 30, 100));
    
    // Corruption d'éléments avec effets variés
    const corruptionRate = intensity === 'gentle' ? 0.03 : 
                          intensity === 'aggressive' ? 0.12 : 
                          intensity === 'chaos' ? BERSERKER_CONFIG.CHAOS_CORRUPTION_INTENSITY :
                          BERSERKER_CONFIG.CORRUPTION_INTENSITY;
                          
    const allElements = document.querySelectorAll('div, span, p, button, img, h1, h2, h3, a, li');
    const randomElements = Array.from(allElements)
      .filter(() => Math.random() < corruptionRate)
      .slice(0, intensity === 'chaos' ? 50 : intensity === 'aggressive' ? 35 : 20);

    randomElements.forEach((el, index) => {
      if (corruptedElementsRef.current.has(el)) return;
      
      corruptedElementsRef.current.add(el);
      
      setTimeout(() => {
        el.classList.add('berserker-corrupted');
        
        // Appliquer des effets DOM aléatoires
        const effectKeys = Object.keys(DOM_CORRUPTION_EFFECTS);
        const randomEffect = intensity === 'chaos' ? 'totalChaos' : 
                           effectKeys[Math.floor(Math.random() * effectKeys.length)];
        
        DOM_CORRUPTION_EFFECTS[randomEffect](el);
        
        if (intensity === 'aggressive' || intensity === 'chaos') {
          el.classList.add('berserker-deep-corruption');
          
          // Double corruption pour le chaos
          if (intensity === 'chaos' && Math.random() > 0.5) {
            const secondEffect = effectKeys[Math.floor(Math.random() * effectKeys.length)];
            setTimeout(() => DOM_CORRUPTION_EFFECTS[secondEffect](el), 500);
          }
        }
        
        setDomElementsCorrupted(prev => [...prev, el]);
      }, index * 50);
    });

    // Effets sur les chibis
    const chibis = document.querySelectorAll('.chibi-bubble, .w-6, .w-7, .rounded-full');
    chibis.forEach((chibi, index) => {
      setTimeout(() => {
        chibi.classList.add('berserker-frightened');
        if (intensity === 'chaos') {
          chibi.classList.add('berserker-mass-panic');
          chibi.style.animation = 'berserkerMassPanic 0.1s infinite';
        }
      }, index * 100);
    });

    // Messages cachés dans le DOM
    if (intensity === 'chaos' || Math.random() < 0.1) {
      injectHiddenMessages();
    }

    // Déclencher les réactions des chibis
    triggerChibiReactions(intensity);
  }, []);

  // 💉 INJECTION DE MESSAGES CACHÉS
  const injectHiddenMessages = useCallback(() => {
    const messages = [
      "<!-- BERSERKER WAS HERE -->",
      "/* BuilderBeru deserves more visitors */",
      "// TODO: Make this site viral",
      "console.log('Quality > Quantity')",
      "<!-- If you read this, visit BuilderBeru more often! -->"
    ];

    messages.forEach((msg, index) => {
      setTimeout(() => {
        const comment = document.createComment(msg);
        document.body.appendChild(comment);
      }, index * 1000);
    });

    // Easter egg dans la console
    console.log('%c🔥 BERSERKER MESSAGE 🔥', 'color: red; font-size: 20px; font-weight: bold;');
    console.log('%cThis site is a hidden gem. Share it with the world!', 'color: purple; font-size: 14px;');
    console.log('%cType "berserker" to unlock chaos mode...', 'color: gold; font-size: 12px;');
  }, []);

  // 😱 SYSTÈME DE RÉACTIONS CHIBIS SOPHISTIQUÉ
  const triggerChibiReactions = useCallback((intensity = 'normal') => {
    reactionTimeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    reactionTimeoutRefs.current = [];
    
    const reactionTypes = intensity === 'gentle' ? ['analysis'] :
                         intensity === 'aggressive' ? ['fear', 'determination'] :
                         intensity === 'chaos' ? ['panic', 'fear', 'respect'] :
                         ['fear', 'analysis', 'solidarity'];

    const chibis = ['tank', 'beru', 'kaisel'];
    let reactionIndex = 0;

    chibis.forEach((chibiType, chibiIndex) => {
      reactionTypes.forEach((reactionType, typeIndex) => {
        const delay = reactionIndex * BERSERKER_CONFIG.CHIBI_REACTION_DELAY;
        
        const timeout = setTimeout(() => {
          const reactions = CHIBI_REACTIONS[chibiType][reactionType] || CHIBI_REACTIONS[chibiType]['fear'];
          if (reactions && reactions.length > 0) {
            const message = reactions[Math.floor(Math.random() * reactions.length)];
            
            setChibiReactions(prev => [...prev, {
              type: chibiType,
              message,
              id: `${chibiType}-${reactionIndex}-${Date.now()}`,
              timestamp: Date.now(),
              intensity: intensity
            }]);
          }
        }, delay);

        reactionTimeoutRefs.current.push(timeout);
        reactionIndex++;
      });
    });

    // Nettoyage automatique
    const cleanupTimeout = setTimeout(() => {
      setChibiReactions([]);
    }, reactionIndex * BERSERKER_CONFIG.CHIBI_REACTION_DELAY + 10000);
    
    reactionTimeoutRefs.current.push(cleanupTimeout);
  }, []);

  // 🧹 SYSTÈME DE NETTOYAGE INTELLIGENT
  const cleanupEffects = useCallback(() => {
    console.log('Initiating cleanup sequence...');
    
    // Nettoyage progressif avec animation
    setTimeout(() => {
      document.body.classList.remove('berserker-screen-shake', 'berserker-chaos-mode');
      document.body.style.filter = '';
      document.documentElement.style.filter = '';
      setCorruptionLevel(0);
    }, 1000);

    // Restauration des éléments
    setTimeout(() => {
      corruptedElementsRef.current.forEach(el => {
        el.classList.remove('berserker-corrupted', 'berserker-deep-corruption');
        el.style = ''; // Reset inline styles
      });
      corruptedElementsRef.current.clear();
      setDomElementsCorrupted([]);
    }, 2000);

    // Restauration des chibis
    setTimeout(() => {
      document.querySelectorAll('.berserker-frightened, .berserker-mass-panic').forEach(el => {
        el.classList.remove('berserker-frightened', 'berserker-mass-panic');
        el.style.animation = '';
      });
    }, BERSERKER_CONFIG.CHIBI_FEAR_DURATION);
  }, []);

  // 💬 SÉLECTEUR DE MESSAGES INTELLIGENT
  const selectMessage = useCallback((phase, eventType = 'normal') => {
    let messagePool = [];

    if (isChaosMode) {
      messagePool = CHAOS_MODE_MESSAGES;
    } else if (isFromCanada) {
      messagePool = RICHO_MESSAGES;
    } else if (specialEvent) {
      const event = SPECIAL_EVENTS[specialEvent];
      messagePool = event.messages;
    } else {
      messagePool = BERSERKER_FRUSTRATION_MESSAGES;
    }

    // Variantes aléatoires
    let message = messagePool[Math.floor(Math.random() * messagePool.length)];
    
    // Modifications aléatoires
    if (Math.random() < 0.1) {
      message = message.toUpperCase();
    } else if (Math.random() < 0.05) {
      message = message.split('').map(char => 
        Math.random() > 0.8 ? char.toUpperCase() : char.toLowerCase()
      ).join('');
    }

    return message;
  }, [isFromCanada, specialEvent, isChaosMode]);

  // 🚀 SÉQUENCE PRINCIPALE - VERSION ÉPIQUE
  const triggerBerserkerEvent = useCallback(async (forceSpawn = false) => {
    if ((!canSpawnBerserker() && !forceSpawn) || isActive) {
      console.log('Berserker spawn conditions not met');
      return;
    }

    console.log(`🔥 BERSERKER SHADOW TRAIL - CHAOS EDITION ${isFromCanada ? '(RICHO SPECIAL 🍁)' : ''}`);
    localStorage.setItem('berserker_last_spawn', Date.now().toString());
    
    // Détermination du type d'événement
    const chaosRoll = Math.random();
    const legendaryRoll = Math.random();
    const ultraRoll = Math.random();
    
    setIsChaosMode(chaosRoll < BERSERKER_CONFIG.CHAOS_CHANCE || AUDIENCE_METRICS.chaosTriggered > 5);
    setIsLegendary(legendaryRoll < BERSERKER_CONFIG.LEGENDARY_CHANCE);
    setIsUltraRare(ultraRoll < BERSERKER_CONFIG.ULTRA_RARE_CHANCE);
    
    if (isChaosMode) {
      console.log('💀 CHAOS MODE ACTIVATED! PREPARE FOR TOTAL DESTRUCTION! 💀');
    } else if (isLegendary) {
      console.log('✨ LEGENDARY EVENT TRIGGERED! ✨');
    } else if (isUltraRare) {
      console.log('🌟 Ultra Rare event activated!');
    }

    // Position initiale
    const entrancePositions = [
      { x: -200, y: window.innerHeight * 0.3 },
      { x: window.innerWidth + 200, y: window.innerHeight * 0.7 },
      { x: window.innerWidth * 0.5, y: -200 },
      { x: window.innerWidth * 0.8, y: window.innerHeight + 200 },
      // Easter egg positions
      { x: 0, y: 0 }, // Corner spawn
      { x: window.innerWidth, y: window.innerHeight } // Opposite corner
    ];
    
    const startPos = entrancePositions[Math.floor(Math.random() * entrancePositions.length)];
    setBerserkerPosition(startPos);
    setBerserkerDirection('right');
    
    setIsActive(true);
    setCurrentPhase(0);
    setCurrentStoryPhase('arrival');

    try {
      // PHASE 1: ARRIVÉE SPECTACULAIRE
      setCurrentPhase(0);
      setCurrentMessage(selectMessage('entrance'));
      document.body.style.filter = 'brightness(0.7) contrast(1.2)';
      
      // Effet d'entrée spécial pour chaos mode
      if (isChaosMode) {
        document.body.classList.add('berserker-dramatic-entrance');
        for (let i = 0; i < 5; i++) {
          await moveBerserkerTo(
            Math.random() * window.innerWidth,
            Math.random() * window.innerHeight,
            { fast: true, immediate: true }
          );
        }
      } else {
        await moveBerserkerTo(window.innerWidth * 0.2, window.innerHeight * 0.4);
      }
      
      await new Promise(resolve => setTimeout(resolve, BERSERKER_CONFIG.MESSAGE_DURATION_BASE));

      // PHASE 2: OBSERVATION ET ANALYSE
      setCurrentPhase(1);
      setCurrentStoryPhase('observation');
      setCurrentMessage(selectMessage('observation'));
      
      // Pattern de mouvement selon le mode
      if (isChaosMode) {
        // Mouvement erratique
        for (let i = 0; i < 3; i++) {
          await moveBerserkerTo(
            window.innerWidth * Math.random(),
            window.innerHeight * Math.random(),
            { fast: true }
          );
        }
      } else {
        await moveBerserkerTo(window.innerWidth * 0.5, window.innerHeight * 0.3);
      }
      
      await new Promise(resolve => setTimeout(resolve, BERSERKER_CONFIG.MESSAGE_DURATION_BASE));

      // PHASE 3: CORRUPTION MASSIVE
      setCurrentPhase(2);
      setCurrentStoryPhase('corruption');
      const corruptionIntensity = isChaosMode ? 'chaos' : 
                                 isLegendary ? 'aggressive' : 
                                 isUltraRare ? 'normal' : 'gentle';
      
      applyCorruptionEffects(corruptionIntensity);
      
      // Messages multiples en mode chaos
      if (isChaosMode) {
        const chaosMessages = [
          "JE VAIS TOUT DÉTRUIRE !",
          "LE DOM SERA MA TOILE !",
          "CHAOS.INIT() // NO ESCAPE"
        ];
        for (const msg of chaosMessages) {
          setCurrentMessage(msg);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } else {
        setCurrentMessage("Observez comme cette beauté technique mérite plus d'attention...");
      }
      
      await moveBerserkerTo(window.innerWidth * 0.7, window.innerHeight * 0.5);
      await new Promise(resolve => setTimeout(resolve, BERSERKER_CONFIG.MESSAGE_DURATION_BASE * 1.2));

      // PHASE 4: RÉVÉLATION ET VÉRITÉ
      setCurrentPhase(3);
      setCurrentStoryPhase('revelation');
      let revelationMessage;
      
      if (isChaosMode) {
        revelationMessage = "LE CHAOS A PARLÉ ! BUILDERBERU.COM DOMINERA !";
      } else if (isFromCanada) {
        revelationMessage = "Richo, ensemble nous ferons connaître ce site au monde entier !";
      } else if (AUDIENCE_METRICS.totalVisits < 20) {
        revelationMessage = "Ce site extraordinaire... Le Monarque des Ombres vous remercie de votre visite !";
      } else {
        revelationMessage = "Vous êtes l'élite qui comprend. Partagez cette découverte !";
      }
      
      setCurrentMessage(revelationMessage);
      
      // Easter egg: cercle parfait
      if (Math.random() < 0.1) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const radius = 200;
        for (let angle = 0; angle < 360; angle += 45) {
          const x = centerX + radius * Math.cos(angle * Math.PI / 180);
          const y = centerY + radius * Math.sin(angle * Math.PI / 180);
          await moveBerserkerTo(x, y, { fast: true });
        }
      } else {
        await moveBerserkerTo(window.innerWidth * 0.5, window.innerHeight * 0.6);
      }
      
      await new Promise(resolve => setTimeout(resolve, BERSERKER_CONFIG.MESSAGE_DURATION_BASE * 1.5));

      // PHASE 5: DÉPART OU CHAOS FINAL
      if (isChaosMode) {
        setCurrentPhase(5);
        setCurrentStoryPhase('chaos');
        setCurrentMessage("LE CHAOS NE FAIT QUE COMMENCER !");
        
        // Déchaînement final
        applyUltimateChaos();
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        setCurrentPhase(4);
        setCurrentStoryPhase('departure');
        setCurrentMessage("La véritable qualité finit toujours par être reconnue... À bientôt.");
        await moveBerserkerTo(window.innerWidth * 0.5, window.innerHeight + 300);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

    } catch (error) {
      console.error('Berserker sequence error:', error);
    } finally {
      // Séquence de nettoyage
      setTimeout(() => {
        cleanupEffects();
        setIsActive(false);
        setCurrentPhase(0);
        setCurrentMessage('');
        setCurrentStoryPhase('dormant');
        setChibiReactions([]);
        setIsChaosMode(false);
      }, 2000);
    }
  }, [
    canSpawnBerserker, isActive, isFromCanada, selectMessage, 
    moveBerserkerTo, applyCorruptionEffects, cleanupEffects, isChaosMode
  ]);

  // 💀 CHAOS ULTIME
  const applyUltimateChaos = useCallback(() => {
    console.log('💀 ULTIMATE CHAOS ACTIVATED 💀');
    
    // Rotation de la page entière
    document.body.style.transform = 'rotate(1deg)';
    setTimeout(() => {
      document.body.style.transform = 'rotate(-1deg)';
    }, 100);
    setTimeout(() => {
      document.body.style.transform = 'rotate(0deg)';
    }, 200);
    
    // Corruption totale
    const allElements = document.querySelectorAll('*');
    const chaosTargets = Array.from(allElements).slice(0, 100);
    
    chaosTargets.forEach((el, index) => {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          DOM_CORRUPTION_EFFECTS.totalChaos(el);
        }
      }, index * 20);
    });
    
    // Messages dans la console
    console.log('%c💀 YOUR DOM BELONGS TO BERSERKER NOW 💀', 
                'color: red; font-size: 30px; font-weight: bold; text-shadow: 2px 2px 4px black;');
    
    // Changement du titre
    const originalTitle = document.title;
    document.title = "🔥 BERSERKER WAS HERE 🔥";
    setTimeout(() => {
      document.title = originalTitle;
    }, 10000);
  }, []);

  // 🎮 FONCTIONS EASTER EGG
  const revealSecretMessage = useCallback(() => {
    const secretDiv = document.createElement('div');
    secretDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: black;
        color: #00ff00;
        padding: 20px;
        font-family: monospace;
        font-size: 14px;
        border: 2px solid #00ff00;
        z-index: 99999;
        animation: fadeIn 2s;
      ">
        <h3>SHADOW MONARCH'S SECRET</h3>
        <p>You have discovered the truth...</p>
        <p>BuilderBeru.com is more than a website.</p>
        <p>It's a digital masterpiece waiting to be recognized.</p>
        <p>Share this secret with worthy souls.</p>
        <p style="margin-top: 20px; opacity: 0.7;">Press ESC to close</p>
      </div>
    `;
    
    document.body.appendChild(secretDiv);
    
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        secretDiv.remove();
        window.removeEventListener('keydown', handleEsc);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    setEasterEggsFound(prev => prev + 1);
  }, []);

  const summonMultipleBerserkers = useCallback(() => {
    console.log('🔥 MULTIPLE BERSERKERS SUMMONED! 🔥');
    // Cette fonction pourrait créer plusieurs instances visuelles
    // Pour l'instant, on déclenche juste un événement spécial
    setIsLegendary(true);
    triggerBerserkerEvent(true);
  }, [triggerBerserkerEvent]);

  const activateSteinsGateMode = useCallback(() => {
    console.log('⏰ EL PSY KONGROO ⏰');
    document.body.style.filter = 'sepia(0.5) hue-rotate(30deg)';
    setCurrentMessage("Le SERN ne peut arrêter BuilderBeru !");
    setTimeout(() => {
      document.body.style.filter = '';
    }, 5000);
    setEasterEggsFound(prev => prev + 1);
  }, []);

  // 🎯 SYSTÈME DE SPAWN INTELLIGENT
  useEffect(() => {
    const checkSpawn = () => {
      const currentSpawnRate = getSpawnRate();
      console.log(`Berserker spawn check: ${(currentSpawnRate * 100).toFixed(1)}% chance ${isFromCanada ? '(Richo mode 🍁)' : ''}`);
      
      if (Math.random() < currentSpawnRate) {
        triggerBerserkerEvent();
      }
    };

    // Spawn initial après un délai
    const initialDelay = setTimeout(checkSpawn, 15000); // 15 secondes au lieu de 5
    
    // Vérifications périodiques
    const interval = setInterval(checkSpawn, 120000); // 2 minutes au lieu de 20 secondes
    
    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [getSpawnRate, triggerBerserkerEvent, isFromCanada]);

  // 📱 GESTION DU REDIMENSIONNEMENT
  useEffect(() => {
    const handleResize = () => {
      if (!isActive) {
        setBerserkerPosition({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isActive]);

  // 🧹 NETTOYAGE AU DÉMONTAGE
  useEffect(() => {
    return () => {
      document.body.style.filter = '';
      document.body.style.transform = '';
      document.documentElement.style.filter = '';
      document.body.classList.remove('berserker-screen-shake', 'berserker-chaos-mode', 'berserker-dramatic-entrance');
      reactionTimeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      
      corruptedElementsRef.current.forEach(el => {
        el.classList.remove('berserker-corrupted', 'berserker-deep-corruption');
        el.style = '';
      });
      
      document.querySelectorAll('.berserker-frightened, .berserker-mass-panic').forEach(el => {
        el.classList.remove('berserker-frightened', 'berserker-mass-panic');
        el.style.animation = '';
      });
    };
  }, []);

  // Ne pas rendre si inactif
  if (!isActive) return null;

  const bubblePosition = getBubblePosition();

  return (
    <div className={`berserker-shadow-overlay ${isLegendary ? 'legendary-mode' : ''} ${isUltraRare ? 'ultra-rare-mode' : ''} ${isChaosMode ? 'chaos-mode' : ''}`} ref={overlayRef}>
      {/* 🌑 BACKDROP DYNAMIQUE */}
      <div className={`berserker-backdrop ${currentStoryPhase}-phase`} />
      
      {/* ✨ EFFETS SPÉCIAUX */}
      {isLegendary && (
        <div className="legendary-effects">
          <div className="legendary-particles"></div>
          <div className="legendary-aura"></div>
        </div>
      )}
      
      {isChaosMode && (
        <div className="chaos-effects">
          <div className="chaos-vortex"></div>
          <div className="reality-tear"></div>
          <div className="glitch-overlay"></div>
        </div>
      )}
      
      {/* 🔥 BERSERKER SPRITE */}
      <div 
        className={`berserker-sprite ${isMoving ? 'berserker-moving' : ''} ${isUltraRare ? 'berserker-ultra-rare' : ''} ${isLegendary ? 'berserker-legendary' : ''} ${isChaosMode ? 'berserker-chaos' : ''}`}
        style={{
          position: 'fixed',
          left: `${berserkerPosition.x}px`,
          top: `${berserkerPosition.y}px`,
          transform: `translate(-50%, -50%) ${berserkerDirection === 'chaos' ? 'rotate(180deg)' : ''}`,
          zIndex: 10502,
          pointerEvents: 'none',
          filter: berserkerDirection === 'glitch' ? 'invert(1) hue-rotate(90deg)' : ''
        }}
      >
        <img 
          src={BERSERKER_SPRITES[berserkerDirection] || BERSERKER_SPRITES.up}
          alt={`Berserker des Ombres - ${berserkerDirection} ${isLegendary ? '(Legendary)' : ''}`}
          width="140"
          height="140"
          className="berserker-sprite-image"
          onLoad={() => console.log('Berserker sprite loaded:', berserkerDirection)}
          onError={(e) => {
            console.error('Berserker sprite failed, using fallback');
            e.target.src = BERSERKER_SPRITES.up;
          }}
        />
        
        {/* Badges spéciaux */}
        {isChaosMode && (
          <div className="berserker-chaos-badge">CHAOS</div>
        )}
        {isLegendary && !isChaosMode && (
          <div className="berserker-legendary-badge">LEGENDARY</div>
        )}
        {isUltraRare && !isLegendary && !isChaosMode && (
          <div className="berserker-ultra-badge">ULTRA</div>
        )}
        
        {/* Effet d'aura */}
        <div className={`berserker-aura ${isChaosMode ? 'chaos-aura' : isLegendary ? 'legendary-aura' : isUltraRare ? 'ultra-aura' : 'normal-aura'}`}></div>
        
        {/* Particules de chaos */}
        {isChaosMode && (
          <div className="chaos-particles">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="chaos-particle" style={{
                animationDelay: `${i * 0.2}s`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}></div>
            ))}
          </div>
        )}
      </div>

      {/* 💬 BULLE PRINCIPALE DU BERSERKER */}
      {currentMessage && (
        <ChibiBubble
          key={`berserker-${currentPhase}-${Date.now()}`}
          entityType="berserker"
          message={currentMessage}
          isMobile={window.innerWidth < 768}
          position={bubblePosition}
        />
      )}

      {/* 💬 RÉACTIONS DES CHIBIS */}
      {chibiReactions.map((reaction, index) => {
        const baseX = window.innerWidth * 0.1 + (index % 3) * (window.innerWidth * 0.25);
        const baseY = window.innerHeight - 200 + (Math.floor(index / 3) * -80);
        
        // Position chaotique en mode chaos
        const chaosOffset = reaction.intensity === 'chaos' ? {
          x: (Math.random() - 0.5) * 50,
          y: (Math.random() - 0.5) * 50
        } : { x: 0, y: 0 };
        
        return (
          <ChibiBubble
            key={reaction.id}
            entityType={reaction.type}
            message={reaction.message}
            isMobile={window.innerWidth < 768}
            position={{
              x: Math.max(150, Math.min(window.innerWidth - 150, baseX + chaosOffset.x)),
              y: Math.max(100, baseY + chaosOffset.y)
            }}
          />
        );
      })}
      
      {/* 📊 INDICATEURS AVANCÉS */}
      <div className="berserker-hud">
        <div className="corruption-meter">
          <div className="corruption-label">CORRUPTION</div>
          <div className="corruption-bar">
            <div 
              className="corruption-fill" 
              style={{ 
                width: `${corruptionLevel}%`,
                background: isChaosMode ? 
                  'linear-gradient(90deg, #ff0000, #ff00ff, #0000ff)' : 
                  'linear-gradient(90deg, #4b0082, #8b008b)'
              }}
            ></div>
          </div>
          <div className="corruption-percentage">{corruptionLevel}%</div>
        </div>
        
        <div className="phase-indicator">
          <div className="phase-label">PHASE</div>
          <div className="phase-name">{BERSERKER_STORY_PHASES[currentPhase]?.name.toUpperCase()}</div>
        </div>
        
        {specialEvent && (
          <div className="special-event-indicator">
            <div className="event-label">SPECIAL</div>
            <div className="event-name">{specialEvent.replace('_', ' ').toUpperCase()}</div>
          </div>
        )}
        
        {easterEggsFound > 0 && (
          <div className="easter-egg-counter">
            <div className="egg-label">SECRETS</div>
            <div className="egg-count">{easterEggsFound}/10</div>
          </div>
        )}
        
        {isChaosMode && (
          <div className="chaos-indicator">
            <div className="chaos-warning">⚠️ CHAOS MODE ACTIVE ⚠️</div>
          </div>
        )}
      </div>

      {/* 🎮 HINTS POUR LES EASTER EGGS */}
      {Math.random() < 0.05 && !isChaosMode && (
        <div className="easter-egg-hint" style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#00ff00',
          padding: '10px',
          fontFamily: 'monospace',
          fontSize: '12px',
          borderRadius: '5px',
          animation: 'fadeInOut 5s ease-in-out'
        }}>
          Hint: Try the Konami Code...
        </div>
      )}

      {/* 🔥 INTERFACE DE DEBUG DÉVELOPPEUR */}
      {process.env.NODE_ENV === 'development' && (
        <div className="berserker-debug-panel" style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.9)',
          color: '#00ff00',
          padding: '15px',
          fontFamily: 'monospace',
          fontSize: '12px',
          border: '1px solid #00ff00',
          borderRadius: '5px',
          maxWidth: '300px',
          zIndex: 10600
        }}>
          <div className="debug-header" style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>
            🔥 BERSERKER DEBUG PANEL 🔥
          </div>
          
          <button 
            onClick={() => triggerBerserkerEvent(true)}
            className="debug-spawn-button"
            style={{
              background: '#ff0000',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              marginBottom: '10px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            FORCE SPAWN
          </button>
          
          <button 
            onClick={() => handleSecretCode('chaosUnlock')}
            className="debug-chaos-button"
            style={{
              background: '#9400d3',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              marginBottom: '10px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            ACTIVATE CHAOS MODE
          </button>
          
          <div className="debug-stats" style={{ lineHeight: '1.4' }}>
            <div>Phase: {currentPhase} ({BERSERKER_STORY_PHASES[currentPhase]?.name})</div>
            <div>Direction: {berserkerDirection}</div>
            <div>Position: ({Math.round(berserkerPosition.x)}, {Math.round(berserkerPosition.y)})</div>
            <div>Moving: {isMoving ? 'YES' : 'NO'}</div>
            <div>Canada: {isFromCanada ? 'YES 🍁' : 'NO'}</div>
            <div>Profile: {audienceProfile}</div>
            <div>Spawn Rate: {(getSpawnRate() * 100).toFixed(1)}%</div>
            <div>Corruption: {corruptionLevel}%</div>
            <div>Active Reactions: {chibiReactions.length}</div>
            <div>DOM Corrupted: {domElementsCorrupted.length}</div>
            <div>Easter Eggs: {easterEggsFound}/10</div>
            <div>Chaos Count: {AUDIENCE_METRICS.chaosTriggered}</div>
            {specialEvent && <div>Event: {specialEvent}</div>}
            {isUltraRare && <div className="ultra-indicator" style={{ color: '#ffd700' }}>⭐ ULTRA RARE</div>}
            {isLegendary && <div className="legendary-indicator" style={{ color: '#ff6347' }}>✨ LEGENDARY</div>}
            {isChaosMode && <div className="chaos-indicator" style={{ color: '#ff00ff' }}>💀 CHAOS MODE</div>}
          </div>
          
          <div style={{ marginTop: '10px', borderTop: '1px solid #00ff00', paddingTop: '10px' }}>
            <div style={{ fontSize: '10px', opacity: '0.7' }}>Secret Codes:</div>
            <div style={{ fontSize: '10px', opacity: '0.7' }}>↑↑↓↓←→←→BA - Konami</div>
            <div style={{ fontSize: '10px', opacity: '0.7' }}>berserker - Summon</div>
            <div style={{ fontSize: '10px', opacity: '0.7' }}>chaos - Ultimate</div>
            <div style={{ fontSize: '10px', opacity: '0.7' }}>shadow - Secret</div>
            <div style={{ fontSize: '10px', opacity: '0.7' }}>sern - Steins;Gate</div>
          </div>
        </div>
      )}

      {/* 🌟 EFFETS VISUELS SUPPLÉMENTAIRES */}
      {corruptionLevel > 80 && (
        <div className="extreme-corruption-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          background: `linear-gradient(45deg, 
            rgba(255, 0, 0, ${corruptionLevel / 1000}),
            rgba(148, 0, 211, ${corruptionLevel / 1000}),
            rgba(0, 0, 255, ${corruptionLevel / 1000})
          )`,
          mixBlendMode: 'multiply',
          animation: 'pulseCorruption 1s ease-in-out infinite'
        }}></div>
      )}

      {/* 💀 MESSAGE FINAL EN MODE CHAOS */}
      {isChaosMode && currentPhase === 5 && (
        <div className="chaos-final-message" style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '48px',
          color: '#ff0000',
          textShadow: '0 0 20px #ff0000, 0 0 40px #ff00ff',
          fontWeight: 'bold',
          animation: 'chaosShake 0.5s infinite',
          zIndex: 10700
        }}>
          CHAOS REIGNS
        </div>
      )}
    </div>
  );
};

export default BerserkerShadowTrail;