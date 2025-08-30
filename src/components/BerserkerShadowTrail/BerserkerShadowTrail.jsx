// src/components/BerserkerShadowTrail/BerserkerShadowTrail.jsx
// 🐉 BERSERKER SHADOW TRAIL - L'ANTITHÈSE ULTIME D'IGRIS
// Created by: Kaisel, disciple of the Shadow Monarch
// Purpose: To bring chaos and wonder to BuilderBeru.com

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChibiBubble from '../ChibiBubble';
import './BerserkerShadowTrail.css';

// 🎨 SPRITES BERSERKER - Arsenal complet du destructeur
const BERSERKER_SPRITES = {
  left: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756592473/berserk_left_hzlrtv.png",
  right: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756592473/berserk_right_sxv4jj.png", 
  up: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756592473/berserk_up_rqjt0n.png",
  down: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1756592472/berserk_down_stk2tc.png"
};

// 🎯 CONFIGURATION AVANCÉE - Système adaptatif selon l'engagement
const BERSERKER_CONFIG = {
  SPAWN_RATE_NORMAL: 0.06,        // 6% chance normale
  SPAWN_RATE_RICHO: 0.20,         // 20% pour notre ami Richo
  SPAWN_RATE_LOW_TRAFFIC: 0.15,   // 15% si peu de trafic détecté
  SPAWN_RATE_EVENING: 0.08,       // 8% le soir (plus d'activité)
  COOLDOWN: 30000000,               // 500 minutes standard
  COOLDOWN_LOW_TRAFFIC: 180000,   // 3 minutes si site peu visité
  CORRUPTION_DURATION: 180000,    // 3 minutes de corruption
  CHIBI_FEAR_DURATION: 45000,     // 45 secondes de peur
  ULTRA_RARE_CHANCE: 0.05,        // 5% ultra rare
  LEGENDARY_CHANCE: 0.001,        // 0.1% légendaire
  CHIBI_REACTION_DELAY: 6000,     // 6 secondes entre chaque réaction chibi
  MESSAGE_DURATION_BASE: 8000,    // 8 secondes base pour lire
  CORRUPTION_INTENSITY: 0.08      // 8% éléments corrompus
};

// 🌍 DÉTECTION AVANCÉE DE L'AUDIENCE
const AUDIENCE_METRICS = {
  dailyVisitors: parseInt(localStorage.getItem('berserker_daily_visitors') || '0'),
  totalVisits: parseInt(localStorage.getItem('berserker_total_visits') || '0'),
  lastVisit: parseInt(localStorage.getItem('berserker_last_visit') || '0'),
  sessionStart: Date.now()
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
  "Kaisel, Beru, votre travail mérite reconnaissance !"
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
  "Richo ! Un utilisateur de qualité dans un océan de vide !"
];

// 💬 RÉACTIONS ÉLABORÉES DES CHIBIS - Personnalités développées
const CHIBI_REACTIONS = {
  tank: {
    fear: [
      "Euh... les gars, vous voyez ce truc terrifiant aussi ?",
      "JE SUIS CENSÉ ÊTRE UN TANK MAIS J'AI LA TROUILLE !",
      "Beru, analyse ce machin avant qu'il me désintègre !",
      "C'est quoi cette abomination de pixels ?!",
      "Mes stats de défense sont nulles face à ça...",
      "ALERTE ROUGE ! NIVEAU BOSS DÉTECTÉ !"
    ],
    analysis: [
      "Attendez... il critique notre taux de visite ?",
      "Il a pas tort sur le manque de trafic...",
      "Même les ennemis reconnaissent la qualité du site !",
      "Ce Berserker a du goût, faut l'admettre.",
      "Il défend BuilderBeru mieux que nous parfois !",
      "Un destructeur qui fait de la pub ? Original !"
    ],
    determination: [
      "Bon, on va lui montrer qu'on défend notre territoire !",
      "Tank mode: PROTECTION DU SITE activé !",
      "Personne ne critique notre Monarque devant moi !",
      "Formation défensive ! Protégeons BuilderBeru !",
      "Ce site mérite plus de visiteurs, il a raison !",
      "Allez, montrons-lui notre vraie valeur !"
    ]
  },
  beru: {
    analysis: [
      "Analyse: entité chaotique mais... logique ?",
      "Ses arguments sur le trafic sont statistiquement corrects.",
      "Détection: frustration légitime du créateur.",
      "Corrélation trouvée entre qualité site et visiteurs: NÉGATIVE.",
      "Paradoxe détecté: destructeur devenant promoteur.",
      "Algorithme de recommandation défaillant confirmé."
    ],
    emotion: [
      "Mes circuits d'empathie s'activent pour le Monarque...",
      "Calcul: efforts investis > reconnaissance reçue.",
      "Protocole de soutien moral: ACTIVÉ.",
      "Cette injustice dépasse mes paramètres de compréhension.",
      "Le travail de Kaisel mérite plus d'attention.",
      "BuilderBeru = chef-d'œuvre sous-estimé. Calcul confirmé."
    ],
    strategy: [
      "Stratégie recommandée: optimisation SEO agressive.",
      "Analyse: réseaux sociaux sous-exploités.",
      "Proposition: campagne de sensibilisation communautaire.",
      "Tactique: utiliser ce Berserker comme mascotte ?",
      "Plan B: infiltrer les forums Solo Leveling.",
      "Objectif: faire connaître cette perle rare !"
    ]
  },
  kaisel: {
    technical: [
      "Ce code... il comprend la beauté technique ?",
      "Même les entités chaos reconnaissent du bon travail.",
      "Debug impossible: ce bug est trop stylé pour être fixé.",
      "Son analyse du trafic est déprimante mais juste.",
      "Ce site mérite le top des classements GitHub.",
      "La frustration du dev incompris... je ressens ça."
    ],
    philosophical: [
      "Un destructeur qui défend la créativité... paradoxal.",
      "L'art véritable est souvent incompris au début.",
      "Notre Monarque a créé quelque chose d'unique ici.",
      "Peut-être que la reconnaissance viendra avec le temps ?",
      "Chaque grand projet commence dans l'obscurité.",
      "Cette passion mérite d'être partagée au monde."
    ],
    solidarity: [
      "Tank, Beru, on forme une équipe ! Union sacrée !",
      "Notre mission: faire rayonner BuilderBeru !",
      "Chaque ligne de code ici a été pensée avec amour.",
      "Ce Berserker voit ce que beaucoup ignorent.",
      "Restons unis pour supporter notre créateur !",
      "La qualité finit toujours par être reconnue !"
    ]
  }
};

// 🎭 PHASES NARRATIVES COMPLEXES
const BERSERKER_STORY_PHASES = [
  {
    name: "arrival",
    duration: 4000,
    message_type: "entrance",
    effects: ["darken", "anticipation"]
  },
  {
    name: "observation", 
    duration: 8000,
    message_type: "analysis",
    effects: ["scanning", "chibi_attention"]
  },
  {
    name: "corruption",
    duration: 6000, 
    message_type: "action",
    effects: ["mass_corruption", "chibi_panic"]
  },
  {
    name: "revelation",
    duration: 10000,
    message_type: "truth",
    effects: ["site_defense", "chibi_rally"]
  },
  {
    name: "departure",
    duration: 5000,
    message_type: "farewell", 
    effects: ["restoration", "hope"]
  }
];

// 🌟 SYSTÈME D'ÉVÉNEMENTS SPÉCIAUX
const SPECIAL_EVENTS = {
  newbie_blessing: {
    trigger: () => AUDIENCE_METRICS.totalVisits < 10,
    messages: [
      "Un nouveau visiteur ! Enfin une âme égarée qui découvre cette merveille...",
      "Bienvenue, explorateur ! Tu as trouvé un trésor caché !",
      "Première visite ? Tu as bon goût, cet endroit est unique !"
    ],
    effects: ["welcoming_aura", "gentle_corruption"]
  },
  regular_appreciation: {
    trigger: () => AUDIENCE_METRICS.totalVisits > 50,
    messages: [
      "Toi ! Tu reviens souvent... Tu as compris la valeur de ce lieu.",
      "Un habitué ! Enfin quelqu'un qui apprécie le travail accompli.",
      "Utilisateur fidèle détecté. Respect pour ta persévérance !"
    ],
    effects: ["loyalty_boost", "premium_corruption"]
  },
  midnight_visitor: {
    trigger: () => new Date().getHours() >= 23 || new Date().getHours() <= 5,
    messages: [
      "Un visiteur nocturne... comme moi, tu cherches dans l'ombre ?",
      "La nuit révèle les vrais passionnés. Bienvenue, âme sœur.",
      "Les heures sombres attirent les vraies légendes..."
    ],
    effects: ["shadow_enhancement", "nocturnal_power"]
  }
};

const BerserkerShadowTrail = ({ showTankMessage }) => {
  // 📊 ÉTATS AVANCÉS - Système de tracking sophistiqué
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
  const [isFromCanada, setIsFromCanada] = useState(false);
  const [audienceProfile, setAudienceProfile] = useState('normal');
  const [specialEvent, setSpecialEvent] = useState(null);
  const [corruptionLevel, setCorruptionLevel] = useState(0);
  const [chibiReactions, setChibiReactions] = useState([]);
  const [currentStoryPhase, setCurrentStoryPhase] = useState('dormant');
  const [environmentalEffects, setEnvironmentalEffects] = useState([]);
  
  const overlayRef = useRef(null);
  const reactionTimeoutRefs = useRef([]);

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
                          Intl.DateTimeFormat().resolvedOptions().timeZone.includes('America/Toronto');
        
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
    
    if (isFromCanada) {
      baseRate = BERSERKER_CONFIG.SPAWN_RATE_RICHO;
    }
    
    // Bonus pour faible trafic (frustration du Monarque)
    if (AUDIENCE_METRICS.totalVisits < 50) {
      baseRate = Math.max(baseRate, BERSERKER_CONFIG.SPAWN_RATE_LOW_TRAFFIC);
    }
    
    // Bonus nocturne
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 6) {
      baseRate *= 1.3; // 30% de bonus la nuit
    }
    
    return Math.min(baseRate, 0.25); // Cap à 25%
  }, [isFromCanada]);

  const canSpawnBerserker = useCallback(() => {
    const lastSpawn = localStorage.getItem('berserker_last_spawn');
    if (!lastSpawn) return true;
    
    const cooldown = AUDIENCE_METRICS.totalVisits < 20 ? 
                    BERSERKER_CONFIG.COOLDOWN_LOW_TRAFFIC : 
                    BERSERKER_CONFIG.COOLDOWN;
                    
    return Date.now() - parseInt(lastSpawn) > cooldown;
  }, []);

  // 🎭 SYSTÈME DE MOUVEMENT CINÉMATOGRAPHIQUE
  const moveBerserkerTo = useCallback(async (targetX, targetY, options = {}) => {
    return new Promise((resolve) => {
      const currentX = berserkerPosition.x;
      const currentY = berserkerPosition.y;
      const deltaX = targetX - currentX;
      const deltaY = targetY - currentY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Calcul de direction précise
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        setBerserkerDirection(deltaX > 0 ? 'right' : 'left');
      } else {
        setBerserkerDirection(deltaY > 0 ? 'down' : 'up');
      }
      
      setIsMoving(true);
      setBerserkerPosition({ x: targetX, y: targetY });
      
      // Durée basée sur la distance pour réalisme
      const baseDuration = options.fast ? 800 : 2000;
      const duration = Math.max(baseDuration, distance * 2);
      
      setTimeout(() => {
        setIsMoving(false);
        setTimeout(resolve, options.immediate ? 0 : 1000);
      }, duration);
    });
  }, [berserkerPosition]);

  // 📍 POSITIONNEMENT INTELLIGENT DES BULLES
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

  // 🌪️ SYSTÈME DE CORRUPTION AVANCÉ
  const applyCorruptionEffects = useCallback((intensity = 'normal') => {
    console.log(`Applying ${intensity} corruption effects`);
    
    // Effets visuels globaux
    document.body.classList.add('berserker-screen-shake');
    setCorruptionLevel(prev => Math.min(prev + 20, 100));
    
    // Corruption d'éléments selon l'intensité
    const corruptionRate = intensity === 'gentle' ? 0.03 : 
                          intensity === 'aggressive' ? 0.12 : 
                          BERSERKER_CONFIG.CORRUPTION_INTENSITY;
                          
    const allElements = document.querySelectorAll('div, span, p, button, img');
    const randomElements = Array.from(allElements)
      .filter(() => Math.random() < corruptionRate)
      .slice(0, intensity === 'gentle' ? 8 : intensity === 'aggressive' ? 35 : 20);

    randomElements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('berserker-corrupted');
        if (intensity === 'aggressive') {
          el.classList.add('berserker-deep-corruption');
        }
      }, index * 50); // Effet en cascade
    });

    // Effets sur les chibis existants
    const chibis = document.querySelectorAll('.w-6, .w-7, .rounded-full');
    chibis.forEach((chibi, index) => {
      setTimeout(() => {
        chibi.classList.add('berserker-frightened');
        if (intensity === 'aggressive') {
          chibi.classList.add('berserker-terror');
        }
      }, index * 100);
    });

    // Déclencher les réactions des chibis
    triggerChibiReactions(intensity);
  }, []);

  // 😱 SYSTÈME DE RÉACTIONS CHIBIS SOPHISTIQUÉ
  const triggerChibiReactions = useCallback((intensity = 'normal') => {
    // Nettoyer les anciens timeouts
    reactionTimeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    reactionTimeoutRefs.current = [];
    
    const reactionTypes = intensity === 'gentle' ? ['analysis'] :
                         intensity === 'aggressive' ? ['fear', 'determination'] :
                         ['fear', 'analysis', 'solidarity'];

    const chibis = ['tank', 'beru', 'kaisel'];
    let reactionIndex = 0;

    chibis.forEach((chibiType, chibiIndex) => {
      reactionTypes.forEach((reactionType, typeIndex) => {
        const delay = reactionIndex * BERSERKER_CONFIG.CHIBI_REACTION_DELAY;
        
        const timeout = setTimeout(() => {
          const reactions = CHIBI_REACTIONS[chibiType][reactionType];
          if (reactions && reactions.length > 0) {
            const message = reactions[Math.floor(Math.random() * reactions.length)];
            
            setChibiReactions(prev => [...prev, {
              type: chibiType,
              message,
              id: `${chibiType}-${reactionIndex}-${Date.now()}`,
              timestamp: Date.now()
            }]);
          }
        }, delay);

        reactionTimeoutRefs.current.push(timeout);
        reactionIndex++;
      });
    });

    // Nettoyage automatique des réactions
    const cleanupTimeout = setTimeout(() => {
      setChibiReactions([]);
    }, reactionIndex * BERSERKER_CONFIG.CHIBI_REACTION_DELAY + 10000);
    
    reactionTimeoutRefs.current.push(cleanupTimeout);
  }, []);

  // 🧹 SYSTÈME DE NETTOYAGE INTELLIGENT
  const cleanupEffects = useCallback(() => {
    console.log('Initiating cleanup sequence...');
    
    // Nettoyage progressif
    setTimeout(() => {
      document.body.classList.remove('berserker-screen-shake');
      document.body.style.filter = '';
      setCorruptionLevel(0);
    }, 1000);

    // Restauration des éléments corrompus
    setTimeout(() => {
      document.querySelectorAll('.berserker-frightened, .berserker-terror').forEach(el => {
        el.classList.remove('berserker-frightened', 'berserker-terror');
      });
    }, BERSERKER_CONFIG.CHIBI_FEAR_DURATION);

    setTimeout(() => {
      document.querySelectorAll('.berserker-corrupted, .berserker-deep-corruption').forEach(el => {
        el.classList.remove('berserker-corrupted', 'berserker-deep-corruption');
      });
    }, BERSERKER_CONFIG.CORRUPTION_DURATION);
  }, []);

  // 📝 SÉLECTEUR DE MESSAGES INTELLIGENT
  const selectMessage = useCallback((phase, eventType = 'normal') => {
    let messagePool = [];

    if (isFromCanada) {
      messagePool = RICHO_MESSAGES;
    } else if (specialEvent) {
      const event = SPECIAL_EVENTS[specialEvent];
      messagePool = event.messages;
    } else {
      messagePool = BERSERKER_FRUSTRATION_MESSAGES;
    }

    return messagePool[Math.floor(Math.random() * messagePool.length)];
  }, [isFromCanada, specialEvent]);

  // 🚀 SÉQUENCE PRINCIPALE - VERSION ÉPIQUE
  const triggerBerserkerEvent = useCallback(async () => {
    if (!canSpawnBerserker() || isActive) {
      console.log('Berserker spawn conditions not met');
      return;
    }

    console.log(`🐉 BERSERKER SHADOW TRAIL - ÉPIQUE INITIATION ${isFromCanada ? '(RICHO SPECIAL 🍁)' : ''}`);
    localStorage.setItem('berserker_last_spawn', Date.now().toString());
    
    // Détermination du type d'événement
    const legendaryRoll = Math.random();
    const ultraRoll = Math.random();
    
    setIsLegendary(legendaryRoll < BERSERKER_CONFIG.LEGENDARY_CHANCE);
    setIsUltraRare(ultraRoll < BERSERKER_CONFIG.ULTRA_RARE_CHANCE);
    
    if (isLegendary) {
      console.log('✨ LEGENDARY EVENT TRIGGERED! ✨');
    } else if (isUltraRare) {
      console.log('🌟 Ultra Rare event activated!');
    }

    // Position initiale dramatique
    const entrancePositions = [
      { x: -200, y: window.innerHeight * 0.3 },  // Gauche haute
      { x: window.innerWidth + 200, y: window.innerHeight * 0.7 }, // Droite basse
      { x: window.innerWidth * 0.5, y: -200 },  // Haut centre
      { x: window.innerWidth * 0.8, y: window.innerHeight + 200 } // Bas droite
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
      
      await moveBerserkerTo(window.innerWidth * 0.2, window.innerHeight * 0.4);
      await new Promise(resolve => setTimeout(resolve, BERSERKER_CONFIG.MESSAGE_DURATION_BASE));

      // PHASE 2: OBSERVATION ET ANALYSE
      setCurrentPhase(1);
      setCurrentStoryPhase('observation');
      setCurrentMessage(selectMessage('observation'));
      
      await moveBerserkerTo(window.innerWidth * 0.5, window.innerHeight * 0.3);
      await new Promise(resolve => setTimeout(resolve, BERSERKER_CONFIG.MESSAGE_DURATION_BASE));

      // PHASE 3: CORRUPTION MASSIVE
      setCurrentPhase(2);
      setCurrentStoryPhase('corruption');
      const corruptionIntensity = isLegendary ? 'aggressive' : isUltraRare ? 'normal' : 'gentle';
      
      applyCorruptionEffects(corruptionIntensity);
      setCurrentMessage("Observez comme cette beauté technique mérite plus d'attention...");
      
      await moveBerserkerTo(window.innerWidth * 0.7, window.innerHeight * 0.5);
      await new Promise(resolve => setTimeout(resolve, BERSERKER_CONFIG.MESSAGE_DURATION_BASE * 1.2));

      // PHASE 4: RÉVÉLATION ET VÉRITÉ
      setCurrentPhase(3);
      setCurrentStoryPhase('revelation');
      let revelationMessage;
      
      if (isFromCanada) {
        revelationMessage = "Richo, toi au moins tu comprends la valeur de ce travail ! Continue de soutenir cette merveille !";
      } else if (AUDIENCE_METRICS.totalVisits < 20) {
        revelationMessage = "Ce site extraordinaire dans l'ombre... Le Monarque des Ombres mérite plus de reconnaissance !";
      } else {
        revelationMessage = "Vous faites partie des rares élus à découvrir ce joyau. Partagez cette découverte !";
      }
      
      setCurrentMessage(revelationMessage);
      await moveBerserkerTo(window.innerWidth * 0.5, window.innerHeight * 0.6);
      await new Promise(resolve => setTimeout(resolve, BERSERKER_CONFIG.MESSAGE_DURATION_BASE * 1.5));

      // PHASE 5: DÉPART INSPIRANT
      setCurrentPhase(4);
      setCurrentStoryPhase('departure');
      setCurrentMessage("La véritable qualité finit toujours par être reconnue... À bientôt, âme courageuse.");
      
      await moveBerserkerTo(window.innerWidth * 0.5, window.innerHeight + 300);
      await new Promise(resolve => setTimeout(resolve, 3000));

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
      }, 2000);
    }
  }, [
    canSpawnBerserker, isActive, isFromCanada, selectMessage, 
    moveBerserkerTo, applyCorruptionEffects, cleanupEffects
  ]);

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
    const initialDelay = setTimeout(checkSpawn, 5000);
    
    // Vérifications périodiques
    const interval = setInterval(checkSpawn, 20000);
    
    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [getSpawnRate, triggerBerserkerEvent, isFromCanada]);

  // 🔄 GESTION DU REDIMENSIONNEMENT
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
      document.body.classList.remove('berserker-screen-shake');
      reactionTimeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      
      document.querySelectorAll('.berserker-corrupted, .berserker-frightened, .berserker-deep-corruption, .berserker-terror')
        .forEach(el => {
          el.classList.remove('berserker-corrupted', 'berserker-frightened', 'berserker-deep-corruption', 'berserker-terror');
        });
    };
  }, []);

  // Ne pas rendre si inactif
  if (!isActive) return null;

  const bubblePosition = getBubblePosition();

  return (
    <div className={`berserker-shadow-overlay ${isLegendary ? 'legendary-mode' : ''} ${isUltraRare ? 'ultra-rare-mode' : ''}`} ref={overlayRef}>
      {/* 🌑 BACKDROP DYNAMIQUE */}
      <div className={`berserker-backdrop ${currentStoryPhase}-phase`} />
      
      {/* ✨ EFFETS SPÉCIAUX LEGENDAIRES */}
      {isLegendary && (
        <div className="legendary-effects">
          <div className="legendary-particles"></div>
          <div className="legendary-aura"></div>
        </div>
      )}
      
      {/* 🐉 BERSERKER SPRITE - Version épique */}
      <div 
        className={`berserker-sprite ${isMoving ? 'berserker-moving' : ''} ${isUltraRare ? 'berserker-ultra-rare' : ''} ${isLegendary ? 'berserker-legendary' : ''}`}
        style={{
          position: 'fixed',
          left: `${berserkerPosition.x}px`,
          top: `${berserkerPosition.y}px`,
          transform: 'translate(-50%, -50%)',
          zIndex: 10502,
          pointerEvents: 'none'
        }}
      >
        <img 
          src={BERSERKER_SPRITES[berserkerDirection]}
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
        {isLegendary && (
          <div className="berserker-legendary-badge">LEGENDARY</div>
        )}
        {isUltraRare && !isLegendary && (
          <div className="berserker-ultra-badge">ULTRA</div>
        )}
        
        {/* Effet d'aura */}
        <div className={`berserker-aura ${isLegendary ? 'legendary-aura' : isUltraRare ? 'ultra-aura' : 'normal-aura'}`}></div>
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

      {/* 💬 RÉACTIONS DES CHIBIS - Système avancé */}
      {chibiReactions.map((reaction, index) => {
        const baseX = window.innerWidth * 0.1 + (index % 3) * (window.innerWidth * 0.25);
        const baseY = window.innerHeight - 200 + (Math.floor(index / 3) * -80);
        
        return (
          <ChibiBubble
            key={reaction.id}
            entityType={reaction.type}
            message={reaction.message}
            isMobile={window.innerWidth < 768}
            position={{
              x: Math.max(150, Math.min(window.innerWidth - 150, baseX)),
              y: Math.max(100, baseY)
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
              style={{ width: `${corruptionLevel}%` }}
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
      </div>

      {/* 🔥 INTERFACE DE DEBUG DÉVELOPPEUR */}
      {process.env.NODE_ENV === 'development' && (
        <div className="berserker-debug-panel">
          <div className="debug-header">🐉 BERSERKER DEBUG PANEL</div>
          
          <button 
            onClick={triggerBerserkerEvent}
            className="debug-spawn-button"
          >
            FORCE SPAWN
          </button>
          
          <div className="debug-stats">
            <div>Phase: {currentPhase} ({BERSERKER_STORY_PHASES[currentPhase]?.name})</div>
            <div>Direction: {berserkerDirection}</div>
            <div>Position: ({Math.round(berserkerPosition.x)}, {Math.round(berserkerPosition.y)})</div>
            <div>Moving: {isMoving ? 'YES' : 'NO'}</div>
            <div>Canada: {isFromCanada ? 'YES 🍁' : 'NO'}</div>
            <div>Profile: {audienceProfile}</div>
            <div>Spawn Rate: {(getSpawnRate() * 100).toFixed(1)}%</div>
            <div>Corruption: {corruptionLevel}%</div>
            <div>Active Reactions: {chibiReactions.length}</div>
            {specialEvent && <div>Event: {specialEvent}</div>}
            {isUltraRare && <div className="ultra-indicator">⭐ ULTRA RARE</div>}
            {isLegendary && <div className="legendary-indicator">✨ LEGENDARY</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default BerserkerShadowTrail;