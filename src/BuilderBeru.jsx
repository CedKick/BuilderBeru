import React, { useState, useRef } from 'react';
import { useEffect } from 'react';
import { ICON_CLASSES, ICON_ELEMENTS } from './imageLinks';
import { sernTracks } from './soundTracks';
import { MYST_EGGS, mystSernMsg } from './mystEggs';
import { dytextAnimate, parseNarrative, runNarrativeSteps } from "./useDytext";
import ChibiBubble from "./components/ChibiBubble";
import { getMainStatPriorities, getTheoreticalScore } from './utils/statPriority';
// import ArtifactScoreBadge from './components/ArtifactScoreBadge';
import ComparisonPopup from './components/ComparisonPopup';
import ArtifactCard from "./components/ArtifactCard";
import NoyauxPopup from './components/NoyauxPopup';
import GemmesPopup from './components/GemmePopup';
import WeaponPopup from './components/weaponPopup';
import OCRPasteListener from './components/OCRPasteListener';
import './i18n/i18n';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import OcrConfirmPopup from './components/OcrConfirmPopup';
import NewAccountPopup from './NewAccountPopup'; // ou ton chemin réel
import SetSelectorPopup from "./components/SetSelectorPopup";
import BeruInteractionMenu from './components/BeruInteractionMenu';
import { BeruReportSystem, GoldenPapyrusIcon } from './components/BeruReportSystem';


let tank = {
  x: 0,
  y: 0,
  img: new Image(),
  speedX: 0,
  speedY: 0,
  size: 64,
  direction: 'down',
};

let beru = {
  x: 0,
  y: 0,
  img: new Image(),
  speedX: 0,
  speedY: 0,
  size: 80, // Légèrement plus grand que Tank
  direction: 'down',
  isPresent: false, // Beru n'apparaît que lors d'événements spéciaux
  currentCanvas: 'canvas-left', // Beru préfère la gauche (zone mystérieuse)
};

let currentBeruCanvasId = 'canvas-left';
let beruMessageQueue = [];
let beruIntervalRef = null;
let isBeruSpeaking = false;

let currentTankCanvasId = 'canvas-center'; // par défaut
let tankAlreadySpawned = false;

function encodeUTF8(str) {
  return btoa(unescape(encodeURIComponent(str)));
}
function decodeUTF8(encoded) {
  return decodeURIComponent(escape(atob(encoded)));
}


const getBeruInteractionOptions = (selectedCharacter) => ({
  newbie: {
    icon: "👋",
    label: "Nouveau sur le site ?",
    action: "tutorial",
    priority: 1
  },
  advice: {
    icon: "🎯",
    label: `Conseils sur ${characters[selectedCharacter]?.name || 'ce Hunter'}`, // ← DYNAMIQUE !
    action: "analyze_build",
    priority: 2,
    condition: () => selectedCharacter // Seulement si hunter sélectionné
  },
  lore: {
    icon: "📖",
    label: "Du lore sur Béru ?",
    action: "show_lore",
    priority: 3
  },
  humor: {
    icon: "😈",
    label: "Fais-moi rire Béru",
    action: "beru_joke",
    priority: 4
  },
  tank_talk: {
    icon: "💬",
    label: "Parler à Tank",
    action: "tank_interaction",
    priority: 5
  }
});


const tankPhrases = [
  "Bob m’a dit : 'Si tu veux tanker, commence par shut up'. J’ai obéi.",
  "Je suis qu’un Tank. Bob, lui, c’est une mécanique légendaire.",
  "Bob n’oublie jamais… même ta fail d’il y a 3 donjons.",
  "On a perdu le BDG à 1%. Bob a juste dit : 'Compris'. Le silence a glacé le canal.",
  "Béru commande les ombres, mais Bob commande les connexions.",
  "J’ai rêvé que je critiquais Bob. Je me suis réveillé désinstallé.",
  "Bob n'a pas besoin de logs. Il lit dans ton cooldown.",
  "Je suis un familier. Bob est un jugement dernier.",
  "T’as raté une clé ? Bob a déjà changé ta team sans te prévenir.",
  "J’ai 9000 de def. Mais je suis vulnérable au regard de Bob.",
  "Une fois j’ai afk en guilde. Bob m’a mis dans la bio : ‘Décédé’ 🪦",
  "Il paraît que Bob a battu un boss… avec une main… et un fichier CSV.",
  "Bob m’a regardé. J’ai reset mes stats par réflexe.",
  "Quand Bob dit : 'On tryhard', même le serveur overclocke.",
  "Tank parle. Bob agit. Et toi... t'as fait ton pull aujourd’hui ?",
  "Si BobbyJones arrive, planque tes artefacts nuls.",
  "Je fais genre je suis courageux… mais j’ai peur de Bob 😰",
  "Bob m’a déjà kické une fois… j’étais en maintenance pourtant !",
  "Quand Bob entre dans le salon vocal, tout le monde se met au boulot 😳",
  "Un pull raté ? Une daily oubliée ? Bob t'observe 👁️",
  "Bob a dit que si je parlais trop, je redeviens une monture…",
  "Je suis peut-être Tank, mais face à Bob, je delete mes logs 🫣",
  "Il paraît que Bob peut relancer le serveur juste en criant.",
  "Bob lit tes stats. Même celles que t'as pas encore calculées.",
  "T’as pas fait ton boss de guilde ? Bob t’a déjà noté absent 😈",
  "Quand Bob sort son aura… même Béru s’incline.",
  "Je suis un chibi, Bob est un titan.",
  "Tank : mignon. Bob : divinité du kick.",
  "Chaque fois que quelqu’un oublie ses daily… Bob cligne des yeux.",
  "Bob a déjà cassé une équipe full 6★ avec une macro Excel.",
  "C'est moi, Tank ! Je protège ce builder avec mon bouclier 🛡️",
  "Tu veux modifier les artefacts ? Même pas peur !",
  "Je me demande si Béru me respecte vraiment 😤",
  "BobbyJones va me crier dessus si je rate le boss de guilde...",
  "J'ai roulé sur 4 artefacts aujourd'hui. Bizarre, non ?",
  "Je suis mignon mais j'ai 2000 de DEF. Retiens ça.",
  "Un jour, je parlerai dans l'animé... et ce sera légendaire.",
  "Kly m'a programmé avec amour... ou fatigue extrême, je sais plus.",
  "Ce builder est plus solide que mon armure.",
  "Si t'oublies de faire tes daily, j'appelle BobbyJones.",
  "Tank : 'Est-ce qu’un artefact peut aimer ?'... Ok j’ai faim.",
  "Béru dit que je suis une mascotte... mais moi je tank la vérité.",
  "Pourquoi j’ai pas de sprite animé moi aussi ? 😭",
  "JO n'a toujours pas d'images... Moi je dis ça moi je dis rien 😶",
  "Rappel : Critical Hit Rate, c’est pas Crit DMG. N’oublie jamais.",
  "Quand le serveur bug, c’est moi qui prends tout… #respecteTank",
  "This build smells like a Gagold masterpiece.",
  "Kly coded this with coffee and shadows.",
  "Don’t forget your daily pulls, or BobbyJones will kick you.",
  "Who's skipping the Guild Boss today? 👀",
  "Artifacts don't roll themselves, you know.",
  "Another +0 Helmet? Really?",
  "This chest piece looks... cursed.",
  "I saw Sung Jin-Woo roll better than that.",
  "The Gagold guild expects greatness!",
  "Legends say BobbyJones kicked someone for missing 1 BDG.",
  "Is this build Gagold-approved?",
  "Imagine Kly sees this gear. 😬",
  "Don't let Tank down. Enhance your boots!",
  "Did someone say... legendary artifact?",
  "This isn’t slagate, this is Kly's domain.",
  "No BDG? No mercy from Bobby.",
  "This ring is older than Kaisel.",
  "Missing Critical Hit Rate again, huh?",
  "Your HP is as low as your chances vs Ant King.",
  "Even Beru would say 'meh' to this stat.",

  // Solo Leveling / Artifacts
  "These artifacts are crying for a reforge.",
  "Did you just roll flat DEF again? 😂",
  "Shadow Soldiers would laugh at this gear.",
  "You need a dungeon, not luck.",
  "That’s not RNG, that’s sabotage.",
  "Even Baruka had better rolls.",
  "Cha Hae-In wouldn't wear this... even blindfolded.",
  "Looks like the System's trolling you today.",

  // Gagold / Lore
  "BobbyJones is watching... 👁",
  "Miss one BDG and you're out. Gagold rules.",
  "You think Gagold tolerates +3 gear?",
  "Pull your weight or pull the door 🚪",
  "This is Gagold, not a daycare.",
  "Kly built this place in the shadow of Solo Leveling itself.",
  "Respect the rank, fear the BDG.",
  "Guild motto: no excuses, only crits.",

  // Meta / Fun
  "Bet you thought that was a good roll. You thought wrong.",
  "Tank's watching. Tank's judging.",
  "I've seen better builds in tutorial zones.",
  "What’s next, flat luck as a main stat?",
  "Every time you reroll, a shadow cries.",
  "I auto-attack harder than this weapon does.",
  "You call this optimization? I call it disappointment.",
  "I heard SLAGATE finally finished their site... 😭😭😭😝😌",
  "This build was handcrafted in mediocrity."
];


let tankIsWandering = false;
let tankDirection = null;
let wanderTimer = null;
const salt = "Beru_IS_KING";
const helmetMainStats = [
  'Additional Defense', 'Defense %', 'Additional Attack', 'Attack %', 'Additional HP', 'HP %'
];
const chestMainStats = ['Additional Defense', 'Defense %'];
const glovesMainStats = ['Additional Attack', 'Attack %'];
const bootsMainStats = ['Defense %', 'HP %', 'Critical Hit Damage', 'Defense Penetration', 'Healing Given Increase (%)'];
const necklaceMainStats = ['Additional HP', 'HP %'];
const braceletMainStats = ['Fire Damage %', 'Water Damage %', 'Wind Damage %', 'Light Damage %', 'Dark Damage %'];
const ringMainStats = ['Additional Attack', 'Additional Defense', 'Attack %', 'Defense %', 'Additional HP', 'HP %'];
const earringsMainStats = ['Additional MP'];

const leftArtifacts = [
  { title: 'Helmet', mainStats: helmetMainStats },
  { title: 'Chest', mainStats: chestMainStats },
  { title: 'Gloves', mainStats: glovesMainStats },
  { title: 'Boots', mainStats: bootsMainStats }
];
const rightArtifacts = [
  { title: 'Necklace', mainStats: necklaceMainStats },
  { title: 'Bracelet', mainStats: braceletMainStats },
  { title: 'Ring', mainStats: ringMainStats },
  { title: 'Earrings', mainStats: earringsMainStats }
];


// Constante à insérer vers le haut de ton fichier, idéalement après `mainStatMaxByIncrements`
const substatsMinMaxByIncrements = {
  'Attack %': {
    0: { min: 4.4, max: 5.7 },
    1: { min: 4.4, max: 8.6 },
    2: { min: 4.4, max: 7.15 },
    3: { min: 4.4, max: 6.3 },
    4: { min: 7, max: 8 },
  },
  'Defense %': {
    0: { min: 4.4, max: 5.7 },
    1: { min: 4.4, max: 8.6 },
    2: { min: 4.4, max: 7.15 },
    3: { min: 4.4, max: 6.3 },
    4: { min: 7, max: 8 },
  },
  'HP %': {
    0: { min: 4.4, max: 5.7 },
    1: { min: 4.4, max: 8.6 },
    2: { min: 4.4, max: 7.15 },
    3: { min: 4.4, max: 6.3 },
    4: { min: 7, max: 8 },
  },
  'Additional Attack': {
    0: { min: 300, max: 500 },
    1: { min: 300, max: 500 },
    2: { min: 300, max: 500 },
    3: { min: 300, max: 500 },
    4: { min: 400, max: 600 },
  },
  'Additional Defense': {
    0: { min: 300, max: 500 },
    1: { min: 300, max: 500 },
    2: { min: 300, max: 500 },
    3: { min: 300, max: 500 },
    4: { min: 400, max: 600 },
  },
  'Additional HP': {
    0: { min: 300, max: 500 },
    1: { min: 300, max: 500 },
    2: { min: 300, max: 500 },
    3: { min: 300, max: 500 },
    4: { min: 400, max: 600 },
  },
  'Critical Hit Damage': {
    0: { min: 900, max: 1300 },
    1: { min: 900, max: 1300 },
    2: { min: 900, max: 1300 },
    3: { min: 900, max: 1300 },
    4: { min: 1300, max: 1500 },
  },
  'Critical Hit Rate': {
    0: { min: 900, max: 1300 },
    1: { min: 900, max: 1300 },
    2: { min: 900, max: 1300 },
    3: { min: 900, max: 1300 },
    4: { min: 1300, max: 1500 },
  },
  'Defense Penetration': {
    0: { min: 900, max: 1300 },
    1: { min: 900, max: 1300 },
    2: { min: 900, max: 1300 },
    3: { min: 900, max: 1300 },
    4: { min: 1300, max: 1500 },
  },
  'Healing Given Increase (%)': {
    0: { min: 1.5, max: 2.5 },
    1: { min: 2.0, max: 4.0 },
    2: { min: 2.5, max: 5.0 },
    3: { min: 3.0, max: 6.0 },
    4: { min: 4.0, max: 7.0 },
  },
  'MP Consumption Reduction': {
    0: { min: 200, max: 300 },
    1: { min: 200, max: 300 },
    2: { min: 200, max: 300 },
    3: { min: 200, max: 300 },
    4: { min: 300, max: 400 },
  },
  'Additional MP': {
    0: { min: 200, max: 300 },
    1: { min: 200, max: 300 },
    2: { min: 200, max: 300 },
    3: { min: 200, max: 300 },
    4: { min: 300, max: 400 },
  },
  'MP Recovery Rate Increase (%)': {
    0: { min: 1.5, max: 2.5 },
    1: { min: 2.0, max: 3.5 },
    2: { min: 2.5, max: 4.5 },
    3: { min: 3.0, max: 5.5 },
    4: { min: 4.0, max: 6.0 },
  },
  'Damage Increase': {
    0: { min: 900, max: 1300 },
    1: { min: 900, max: 1300 },
    2: { min: 900, max: 1300 },
    3: { min: 900, max: 1300 },
    4: { min: 1300, max: 1500 },
  },
  'Damage Reduction': {
    0: { min: 300, max: 400 },
    1: { min: 300, max: 400 },
    2: { min: 300, max: 400 },
    3: { min: 300, max: 400 },
    4: { min: 400, max: 500 },
  },
};

export const mainStatMaxByIncrements = {
  'Additional Defense': {
    0: 2433,
    1: 2433,
    2: 2433,
    3: 2433,
    4: 2433,
  },
  'Defense %': {
    0: 25.55,
    1: 25.55,
    2: 25.55,
    3: 25.55,
    4: 25.55,
  },
  'Additional Attack': {
    0: 2433,
    1: 2433,
    2: 2433,
    3: 2433,
    4: 2433,
  },
  'Attack %': {
    0: 25.55,
    1: 25.55,
    2: 25.55,
    3: 25.55,
    4: 25.55,
  },
  'Additional HP': {
    0: 4866,
    1: 4866,
    2: 4866,
    3: 4866,
    4: 4866,
  },
  'HP %': {
    0: 25.55,
    1: 25.55,
    2: 25.55,
    3: 25.55,
    4: 25.55,
  },
  'Critical Hit Damage': {
    0: 5899,
    1: 5899,
    2: 5899,
    3: 5899,
    4: 5899,
  },
  'Defense Penetration': {
    0: 4741,
    1: 4741,
    2: 4741,
    3: 4741,
    4: 4741,
  },
  'Healing Given Increase (%)': {
    0: 6.12,
    1: 6.12,
    2: 6.12,
    3: 6.12,
    4: 6.12,
  },
  'MP Consumption Reduction': {
    0: 30,
    1: 30,
    2: 30,
    3: 30,
    4: 30,
  },
  'Additional MP': {
    0: 1044,
    1: 1044,
    2: 1044,
    3: 1044,
    4: 1044,
  },
  'MP Recovery Rate Increase (%)': {
    0: 30,
    1: 30,
    2: 30,
    3: 30,
    4: 30,
  },
  'Damage Increase': {
    0: 5799,
    1: 5799,
    2: 5799,
    3: 5799,
    4: 5799,
  },
  'Damage Reduction': {
    0: 24,
    1: 24,
    2: 24,
    3: 24,
    4: 24,
  },
  'Fire Damage %': {
    0: 13.82,
    1: 13.82,
    2: 13.82,
    3: 13.82,
    4: 13.82,
  },
  'Water Damage %': {
    0: 13.82,
    1: 13.82,
    2: 13.82,
    3: 13.82,
    4: 13.82,
  },
  'Wind Damage %': {
    0: 13.82,
    1: 13.82,
    2: 13.82,
    3: 13.82,
    4: 13.82,
  },
  'Light Damage %': {
    0: 13.82,
    1: 13.82,
    2: 13.82,
    3: 13.82,
    4: 13.82,
  },
  'Dark Damage %': {
    0: 13.82,
    1: 13.82,
    2: 13.82,
    3: 13.82,
    4: 13.82,
  }
};

const applyArtifactStat = (key, value, baseStats, currentArtifactStats) => {
  if (typeof value !== 'number') return;

  if (key.endsWith('%')) {
    const stat = key.replace(' %', '');
    const base = baseStats[stat] || 0;
    currentArtifactStats[stat] = (currentArtifactStats[stat] || 0) + (base * value / 100);
  } else {
    currentArtifactStats[key] = (currentArtifactStats[key] || 0) + value;
  }
};

const calculateMainStatValue = (mainStat, subStatsLevels) => {
  if (!Array.isArray(subStatsLevels)) return 0;

  const sum = subStatsLevels.reduce((acc, s) => acc + (s?.level || 0), 0);

  if (
    typeof mainStat === 'string' &&
    mainStatMaxByIncrements[mainStat] &&
    typeof mainStatMaxByIncrements[mainStat][sum] !== 'undefined'
  ) {
    return mainStatMaxByIncrements[mainStat][sum];
  }


  return 0;
};


const getChibiScreenPos = (ref) => {
  if (!ref?.current) return { x: 0, y: 0 };

  const rect = ref.current.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top,
  };
};
let mobileNarrativeAlreadyShown = false;

function useResponsive() {
  const [screen, setScreen] = React.useState({
    isPhone: window.innerWidth < 640,
    isTablet: window.innerWidth >= 640 && window.innerWidth < 1150,
    isDesktop: window.innerWidth >= 1150
  });

  const isTouch = navigator.maxTouchPoints > 1;
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

  // const screenWidth = window.innerWidth;

  const isProbablyDesktop = !isTouch && !isMobileUA;

  React.useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      setScreen({
        isPhone: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: isProbablyDesktop
      });
    };

    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return screen;
}

// 🐉 KAISEL NETTOYAGE RADICAL - REMPLACE ta fonction migrateOldDataToNewSystem
const migrateOldDataToNewSystem = () => {
  console.log("🐉 Kaisel: NETTOYAGE RADICAL localStorage...");

  // 1️⃣ IDENTIFIER ET SUPPRIMER TOUTES les anciennes clés
  const toDelete = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    // ❌ SUPPRIMER tout sauf le nouveau système et la langue
    if (key !== 'builderberu_users' && key !== 'i18nextLng') {
      toDelete.push(key);
    }
  }

  // 🗑️ SUPPRESSION MASSIVE
  toDelete.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ SUPPRIMÉ: ${key}`);
  });

  console.log(`✅ NETTOYAGE TERMINÉ ! ${toDelete.length} anciennes clés supprimées.`);

  // 2️⃣ VÉRIFIER que le nouveau système existe
  const current = localStorage.getItem('builderberu_users');
  if (!current) {
    console.log("🔧 Création du système propre...");
    const cleanSystem = {
      user: {
        activeAccount: "main",
        accounts: {
          main: {
            builds: {},
            hunterWeapons: {},
            recentBuilds: [],
            hunterCores: {},
            gems: {}
          }
        }
      }
    };
    localStorage.setItem('builderberu_users', JSON.stringify(cleanSystem));
  }

  console.log("🎯 Système 100% propre !");
};

// 🛡️ PROTECTION GLOBALE - AJOUTE aussi cette fonction pour protéger PARTOUT
const safeArtifactAccess = (artifact, property) => {
  if (!artifact || typeof artifact !== 'object') {
    console.warn('⚠️ Kaisel: Artifact null/undefined ignoré');
    return null;
  }

  if (property === 'mainStat') {
    const mainStat = artifact.mainStat;
    if (!mainStat || typeof mainStat !== 'string' || mainStat.trim() === '') {
      console.warn('⚠️ Kaisel: MainStat vide/invalide ignoré:', mainStat);
      return null;
    }
    return mainStat;
  }

  return artifact[property];
};



const BuilderBeru = () => {
  const { t } = useTranslation();
  const darkAriaAudioRef = useRef(null);
  const believeMe = useRef(null);
  const isTankSpeaking = useRef(false);
  const messageQueue = useRef([]);
  const tankIntervalRef = useRef(null);
  const tankRef = useRef(null);
  const dytextRef = useRef(null);
  const popupRef = useRef(null);
  const sernAudioRef = useRef(null);
  const playingAudiosRef = useRef([]);
  const fadeOutTimerRef = useRef(null); // pour arrêter le fade si besoin
  // const popupRef = useRef();
  const mainImageRef = useRef();
  // const dytextRef = useRef();
  const [showBeruInteractionMenu, setShowBeruInteractionMenu] = useState(false);
  const [beruMenuPosition, setBeruMenuPosition] = useState({ x: 0, y: 0 });
  const [beruMenuCharacter, setBeruMenuCharacter] = useState('');

  const SHADOW_ENTITIES = {
    tank: {
      id: 'tank',
      size: 64,
      preferredCanvas: 'random',
      personality: 'defensive_funny',
      moveSpeed: 0.8,
      messageInterval: 30000,
      sprites: {
        idle: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604465/tank_face_n9kxrh.png',
        left: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748294466/tank_run_left_lxr3km.png',
        right: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748294466/tank_run_right_2_zrf0y1.png',
        up: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604462/tank_dos_bk6poi.png',
        down: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604465/tank_face_n9kxrh.png'
      },
      phrases: t('shadowEntities.tank.automaticPhrases', { returnObjects: true })
    },
    beru: {
      id: 'beru',
      size: 80,
      preferredCanvas: 'canvas-center',
      personality: 'strategic_analyst',
      moveSpeed: 0.6,
      messageInterval: 45000,
      sprites: {
        idle: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414699/beru_face_w2rdyn.png', // À créer
        left: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414823/beru_left_bvtyba.png',
        right: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414822/beru_right_ofwvy5.png',
        up: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414738/beru_dos_dtk5ln.png',
        down: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414699/beru_face_w2rdyn.png',
        analyzing: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748550000/beru_thinking.png'
      },
      phrases: t('shadowEntities.beru.automaticPhrases', { returnObjects: true })
    },
    kaisel: {
      id: 'kaisel',
      size: 72,
      preferredCanvas: 'canvas-right',
      personality: 'efficient_debugger',
      moveSpeed: 1.2,
      messageInterval: 60000,
      sprites: {
        idle: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748550000/kaisel_coding.png',
        debugging: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748550000/kaisel_debug.png'
      },
      phrases: [
        "Console.log: Performance optimized. ✅",
        "Debug terminé. 0 errors, 3 warnings ignorées.",
        "Refactor suggéré : ton code ressemble à du spaghetti.",
        "Git commit: 'Fix Tank logic, again.' 🙄",
        "Stack trace analysé. Le problème c'est... toi.",
        "npm install brain --save. Command failed.",
        "Kaisel.exe stopped working. Reason: your build choices.",
        "Efficiency mode: ON. Patience mode: OFF.",
        "Code review: Tank = legacy code. Beru = clean architecture.",
        "Memory leak détecté dans ton cerveau.",
        "Breakpoint set sur tes mauvaises décisions.",
        "Docker containerize ton chaos, please.",
        "API call failed: common_sense.get() returned null."
      ]
    }
  };

  class ShadowManager {
    constructor() {
      this.entities = new Map();
      this.canvasContexts = new Map();
      this.backgroundImages = new Map();
      this.t = null;
      this.animationId = null;
      this.messageIntervals = new Map();
      this.wanderTimers = new Map();



      // Backgrounds
      this.backgrounds = {
        'canvas-left': 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604093/neige_onpilk.png',
        'canvas-center': 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604092/sanctuaire_rfcze5.png',
        'canvas-right': 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604092/greenland_cb4caw.png'
      };
    }

    setTranslation(tFunction) {
      this.t = tFunction;
    }

    // 🚀 Initialisation
    init(canvasIds, callbacks = {}) {
      this.cleanup();
      this.callbacks = callbacks;

      // 🔧 Reset et récupérer les nouvelles références comme dans le code original
      this.canvasLeft = this.resetCanvas('canvas-left');
      this.canvasCenter = this.resetCanvas('canvas-center');
      this.canvasRight = this.resetCanvas('canvas-right');

      if (!this.canvasLeft || !this.canvasCenter || !this.canvasRight) {
        return;
      }

      // Setup contexts avec les bonnes références
      this.canvasContexts.set('canvas-left', this.canvasLeft.getContext('2d'));
      this.canvasContexts.set('canvas-center', this.canvasCenter.getContext('2d'));
      this.canvasContexts.set('canvas-right', this.canvasRight.getContext('2d'));

      // Clear tous les canvas
      this.canvasContexts.forEach((ctx, canvasId) => {
        const canvas = this.getCanvasRef(canvasId);
        if (canvas) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      });

      this.loadBackgrounds();
      this.startAnimation();
    }

    // 🧹 Reset canvas anti-duplication
    resetCanvas(canvasId) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return null;

      const newCanvas = canvas.cloneNode(true);
      canvas.parentNode.replaceChild(newCanvas, canvas);

      // Retourner la nouvelle référence
      return document.getElementById(canvasId);
    }

    // 🖼️ Load backgrounds
    loadBackgrounds() {
      Object.entries(this.backgrounds).forEach(([canvasId, src]) => {
        const img = new Image();
        img.onload = () => {
          this.backgroundImages.set(canvasId, img);
          const ctx = this.canvasContexts.get(canvasId);
          const canvas = this.getCanvasRef(canvasId); // Utilise la référence locale
          if (ctx && canvas) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
        };
        img.src = src;
      });
    }

    // 👤 Spawn entity
    spawnEntity(entityType, forceCanvas = null) {
      const config = SHADOW_ENTITIES[entityType];
      if (!config) {
        return null;
      }
      // Charge les phrases selon la langue
      let phrases = [];
      if (entityType === 'beru') {
        phrases = t('shadowEntities.beru.automaticPhrases', { returnObjects: true });
      } else if (entityType === 'tank') {
        phrases = t('shadowEntities.tank.automaticPhrases', { returnObjects: true });
      }

      const canvasId = forceCanvas || this.selectCanvas(config.preferredCanvas);
      const canvas = this.getCanvasRef(canvasId); // Utilise la référence locale
      if (!canvas) return null;

      const entity = {
        ...config,
        x: config.preferredCanvas === 'random' ? canvas.width / 2 :
          Math.random() * (canvas.width * 0.6) + (canvas.width * 0.2), // Position aléatoire
        y: canvas.height - 80,
        speedX: 0,
        speedY: 0,
        phrases: phrases,
        isWandering: false,
        direction: null,
        currentCanvas: canvasId,
        spawnCanvas: canvas, // 🔧 Garde une référence directe comme dans ton code
        img: new Image(),
        lastMessage: 0,
        isActive: true,
        clickCount: 0
      };

      entity.img.src = config.sprites.idle;

      this.entities.set(entityType, entity);
      this.setupEntityEvents(entity);
      this.startEntityMessages(entity);

      return entity;
    }

    // 🎯 Helper pour récupérer la bonne référence canvas
    getCanvasRef(canvasId) {
      switch (canvasId) {
        case 'canvas-left': return this.canvasLeft;
        case 'canvas-center': return this.canvasCenter;
        case 'canvas-right': return this.canvasRight;
        default: return null;
      }
    }

    // 🎯 Canvas selection
    selectCanvas(preference) {
      if (preference === 'random') {
        const canvases = [this.canvasLeft, this.canvasCenter, this.canvasRight];
        const selectedCanvas = canvases[Math.floor(Math.random() * canvases.length)];
        return selectedCanvas.id;
      }
      return preference;
    }

    // 🎮 Setup events pour entity
    setupEntityEvents(entity) {
      const canvas = entity.spawnCanvas; // Utilise la référence directe
      if (!canvas) return;

      const handleClick = () => {
        entity.clickCount++;

        if (entity.id === 'tank') {
          this.handleTankClick(entity);
        } else if (entity.id === 'beru') {
          this.handleBeruClick(entity);
        } else if (entity.id === 'kaisel') {
          this.handleKaiselClick(entity);
        }
      };

      canvas.addEventListener('click', handleClick);
    }

    // 🛡️ Tank click handler (garde la logique existante)
    handleTankClick(entity) {
      const count = entity.clickCount;

      if (count === 5) {
        this.showEntityMessage('tank', "Hé ! C'est pas un bouton ici 😐", true);
      } else if (count === 10) {
        this.showEntityMessage('tank', "Encore un clic et j'appelle BobbyJones 😠", true);
      } else if (count === 20) {
        this.showEntityMessage('tank', "Ok, là j'en ai marre.", true);
      } else if (count === 30) {
        this.showEntityMessage('tank', "...Dernier avertissement.", true);
      } else if (count >= 40) {
        this.fireTankLaser(entity);
        entity.clickCount = 0; // Reset
      }
    }

    // Dans handleBeruClick (ShadowManager) :
    handleBeruClick(entity) {
      const pos = window.getShadowScreenPosition('beru'); // ← Ajouter window.

      this.callbacks.showBeruMenu({
        x: pos.x,
        y: pos.y,
        selectedCharacter: this.callbacks.getSelectedCharacter?.()
      });
    }

    // ⚡ Kaisel click handler
    handleKaiselClick(entity) {
      const messages = [
        "Console.log('User clicked Kaisel');",
        "Debug session activated. Stand by...",
        "Performance analysis: 12ms response time. Not bad.",
        "Git log: 'User interaction detected'",
        "Stack overflow: why did you click me?"
      ];

      const msg = messages[Math.floor(Math.random() * messages.length)];
      this.showEntityMessage('kaisel', msg, true);
    }

    // 💥 Tank laser (garde la logique existante)
    fireTankLaser(entity) {

      const tankCanvas = entity.spawnCanvas; // Utilise la référence directe
      const laser = document.getElementById("tank-laser");
      const candidates = document.querySelectorAll(".tank-target");

      if (!tankCanvas || !laser || !candidates.length) return;

      const target = candidates[Math.floor(Math.random() * candidates.length)];
      const tankRect = tankCanvas.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      entity.img.src = entity.sprites.up;

      const startX = tankRect.left + tankRect.width / 2;
      const startY = tankRect.top + entity.y - 80;
      const endX = targetRect.left + targetRect.width / 2;
      const endY = targetRect.top + targetRect.height / 2;

      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const length = Math.sqrt(deltaX ** 2 + deltaY ** 2);
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

      laser.style.width = `${length}px`;
      laser.style.height = `4px`;
      laser.style.left = `${startX}px`;
      laser.style.top = `${startY}px`;
      laser.style.transform = `rotate(${angle}deg)`;
      laser.style.transformOrigin = "0 0";
      laser.classList.remove("hidden");

      setTimeout(() => {
        laser.classList.add("hidden");
        target.classList.add("laser-hit");
        setTimeout(() => target.remove(), 500);
      }, 300);

      if (window.umami) window.umami.track('LaserBurst');
    }

    showEntityMessage(entityType, message, priority = false) {
      if (!this.callbacks.showMessage) return;

      console.log("🔍 ShadowManager.showEntityMessage appelé avec:", entityType); // ← AJOUTE ÇA

      const entity = this.entities.get(entityType);
      if (!entity) return;

      const prefix = entityType === 'tank' ? '' :
        entityType === 'beru' ? '🧠 ' :
          entityType === 'kaisel' ? '🐉 ' : '';

      console.log("🔍 Va appeler showMessage avec entityType:", entityType); // ← AJOUTE ÇA

      this.callbacks.showMessage(prefix + message, priority, entityType); // ← Vérifie cette ligne
    }

    // ⏰ Start entity messages
    startEntityMessages(entity) {
      if (this.messageIntervals.has(entity.id)) return;

      const interval = setInterval(() => {
        if (Math.random() < 0.33) {
          const msg = entity.phrases[Math.floor(Math.random() * entity.phrases.length)];
          this.showEntityMessage(entity.id, msg);
        }
      }, entity.messageInterval);

      this.messageIntervals.set(entity.id, interval);
    }

    // 🎮 Keyboard controls
    setupKeyboardControls() {
      const handleKeyDown = (e) => {
        const tank = this.entities.get('tank');
        if (!tank) return;

        if (e.key === 'ArrowLeft') {
          tank.speedX = -0.6;
          tank.direction = 'left';
          tank.img.src = tank.sprites.left;
        } else if (e.key === 'ArrowRight') {
          tank.speedX = 0.6;
          tank.direction = 'right';
          tank.img.src = tank.sprites.right;
        } else if (e.key === 'ArrowUp') {
          tank.speedY = -0.15;
          tank.img.src = tank.sprites.up;
        } else if (e.key === 'ArrowDown') {
          tank.speedY = 0.15;
          tank.img.src = tank.sprites.down;
        }
      };

      const handleKeyUp = (e) => {
        const tank = this.entities.get('tank');
        if (!tank) return;

        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          tank.speedX = 0;
          tank.img.src = tank.sprites.idle;
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          tank.speedY = 0;
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }

    // 🎨 Animation loop principal
    animate = () => {
      // Clear tous les canvas en utilisant les références locales
      this.canvasContexts.forEach((ctx, canvasId) => {
        const canvas = this.getCanvasRef(canvasId);
        if (!canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Redraw background
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

    // 🏃 Update entity
    updateEntity(entity) {


      if (entity.id === 'beru' && entity.isMenuActive) {
        return; // Skip tout mouvement
      }

      entity.x += entity.speedX;
      entity.y += entity.speedY;

      const friction = 0.9;
      const maxSpeed = 1.2;

      entity.speedX *= friction;
      entity.speedY *= friction;

      if (entity.speedX > maxSpeed) entity.speedX = maxSpeed;
      if (entity.speedX < -maxSpeed) entity.speedX = -maxSpeed;
      if (entity.speedY > maxSpeed) entity.speedY = maxSpeed;
      if (entity.speedY < -maxSpeed) entity.speedY = -maxSpeed;

      // Limites canvas - utilise spawnCanvas comme dans ton code original
      const canvas = entity.spawnCanvas;
      if (canvas) {
        entity.x = Math.max(0, Math.min(canvas.width, entity.x));
        entity.y = Math.max(canvas.height / 2, Math.min(canvas.height, entity.y));
      }

      // Wandering pour Tank uniquement (pour l'instant)
      if (entity.id === 'tank') {
        this.handleTankWandering(entity);
      } else if (entity.id === 'beru') {
        this.handleBeruWandering(entity); // 🆕 AJOUTER CETTE LIGNE
      }
    }

    // 🚶 Tank wandering logic
    handleTankWandering(entity) {
      if (!entity.isWandering && Math.random() < 0.0003) {
        const directions = ["left", "right", "up", "down"];
        entity.direction = directions[Math.floor(Math.random() * directions.length)];
        entity.isWandering = true;

        const wanderDuration = 2000 + Math.random() * 3000;
        const returnDuration = wanderDuration / 4;
        const originalDirection = entity.direction;

        const timer = setTimeout(() => {
          // Phase de retour
          switch (originalDirection) {
            case 'left': entity.direction = 'right'; break;
            case 'right': entity.direction = 'left'; break;
            case 'up': entity.direction = 'down'; break;
            case 'down': entity.direction = 'up'; break;
          }

          setTimeout(() => {
            entity.isWandering = false;
            entity.direction = null;
            entity.img.src = entity.sprites.idle;
          }, returnDuration);
        }, wanderDuration);

        this.wanderTimers.set(entity.id, timer);
      }

      // Apply wandering movement - garde la logique de ton drawTankMessage
      if (entity.isWandering && entity.direction) {
        const speed = entity.moveSpeed;
        switch (entity.direction) {
          case 'left':
            entity.x -= speed;
            entity.img.src = entity.sprites.left;
            break;
          case 'right':
            entity.x += speed;
            entity.img.src = entity.sprites.right;
            break;
          case 'up':
            entity.y -= speed;
            entity.img.src = entity.sprites.up;
            break;
          case 'down':
            entity.y += speed;
            entity.img.src = entity.sprites.down;
            break;
        }

        // Garde Tank dans les limites du canvas - comme dans ton code original
        const canvas = entity.spawnCanvas;
        if (canvas) {
          entity.x = Math.max(0, Math.min(canvas.width, entity.x));
          entity.y = Math.max(canvas.height / 2, Math.min(canvas.height, entity.y));
        }
      }
    }

    // 🧠 Beru wandering logic (après handleTankWandering)
    handleBeruWandering(entity) {
      // Beru bouge moins souvent (plus réfléchi)
      if (!entity.isWandering && Math.random() < 0.003) { // Plus rare que Tank
        const directions = ["left", "right", "up", "down"];
        entity.direction = directions[Math.floor(Math.random() * directions.length)];
        entity.isWandering = true;

        // Beru reste plus longtemps en mouvement (analyse en cours)
        const wanderDuration = 3000 + Math.random() * 2000; // Plus long que Tank
        const returnDuration = wanderDuration / 3;
        const originalDirection = entity.direction;

        const timer = setTimeout(() => {
          // Phase de retour
          switch (originalDirection) {
            case 'left': entity.direction = 'right'; break;
            case 'right': entity.direction = 'left'; break;
            case 'up': entity.direction = 'down'; break;
            case 'down': entity.direction = 'up'; break;
          }

          setTimeout(() => {
            entity.isWandering = false;
            entity.direction = null;
            entity.img.src = entity.sprites.idle;
          }, returnDuration);
        }, wanderDuration);

        this.wanderTimers.set(entity.id, timer);
      }

      // Apply wandering movement pour Beru
      if (entity.isWandering && entity.direction) {
        const speed = entity.moveSpeed; // 0.6 (plus lent que Tank)
        switch (entity.direction) {
          case 'left':
            entity.x -= speed;
            entity.img.src = entity.sprites.left;
            break;
          case 'right':
            entity.x += speed;
            entity.img.src = entity.sprites.right;
            break;
          case 'up':
            entity.y -= speed;
            entity.img.src = entity.sprites.up;
            break;
          case 'down':
            entity.y += speed;
            entity.img.src = entity.sprites.down;
            break;
        }

        // Limites canvas pour Beru
        const canvas = entity.spawnCanvas;
        if (canvas) {
          entity.x = Math.max(0, Math.min(canvas.width, entity.x));
          entity.y = Math.max(canvas.height / 2, Math.min(canvas.height, entity.y));
        }
      }
    }

    // 🎨 Draw entity
    drawEntity(entity) {
      const ctx = this.canvasContexts.get(entity.currentCanvas);
      if (!ctx || !entity.img.complete) return;

      ctx.save();

      // Effets visuels par personnalité
      if (entity.personality === 'strategic_analyst') {
        ctx.shadowColor = '#8a2be2'; // Violet mystique pour Beru
        ctx.shadowBlur = 15;
      } else if (entity.personality === 'efficient_debugger') {
        ctx.shadowColor = '#00ff41'; // Vert Matrix pour Kaisel
        ctx.shadowBlur = 10;
      }

      const canvas = entity.spawnCanvas; // Utilise la référence directe
      const scale = ((entity.y / 2) / canvas.height) * 4;

      ctx.translate(entity.x, entity.y);
      ctx.scale(scale, scale);
      ctx.drawImage(entity.img, -entity.size / 2, -entity.size, entity.size, entity.size);

      ctx.restore();
    }

    // 🚀 Start animation
    startAnimation() {
      if (this.animationId) return;
      this.animate();
    }

    // 🧹 Cleanup complet
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
    }
  }



  const initialArtifacts = {
    Helmet: { mainStat: '', subStats: [], mainStatValue: 0, subStatsLevels: [], set: '' },
    Chest: { mainStat: '', subStats: [], mainStatValue: 0, subStatsLevels: [], set: '' },
    Gloves: { mainStat: '', subStats: [], mainStatValue: 0, subStatsLevels: [], set: '' },
    Boots: { mainStat: '', subStats: [], mainStatValue: 0, subStatsLevels: [], set: '' },
    Necklace: { mainStat: '', subStats: [], mainStatValue: 0, subStatsLevels: [], set: '' },
    Bracelet: { mainStat: '', subStats: [], mainStatValue: 0, subStatsLevels: [], set: '' },
    Ring: { mainStat: '', subStats: [], mainStatValue: 0, subStatsLevels: [], set: '' },
    Earrings: { mainStat: '', subStats: [], mainStatValue: 0, subStatsLevels: [], set: '' },
  };

  const openComparisonPopup = (artifactData) => {
    const emptyArtifact = {
      title: artifactData.title,
      mainStat: '',
      subStats: ['', '', '', ''],
      subStatsLevels: [
        { value: 0, level: 0, procOrders: [], procValues: [] },
        { value: 0, level: 0, procOrders: [], procValues: [] },
        { value: 0, level: 0, procOrders: [], procValues: [] },
        { value: 0, level: 0, procOrders: [], procValues: [] },
      ]
    };
    setComparisonData({ original: artifactData, candidate: emptyArtifact });
  };

  const refs = {
    mainImage: mainImageRef
  };

  const allStats = [
    'Attack', 'Defense', 'HP', 'MP', 'Critical Hit Rate',
    'Critical Hit Damage', 'Defense Penetration', 'Damage Increase',
    'MP Recovery Rate Increase (%)', 'MP Consumption Reduction',
    'Precision', 'Damage Reduction', 'Healing Given Increase (%)'
  ];

  const openSetSelector = (slotName) => {
    setSetSelectorSlot(slotName);
    setIsSetSelectorOpen(true);
  };

  const handleSelectSet = (slot, setName) => {

    if (!slot || !setName) {
      return;
    }


    setArtifactsData((prev) => {
      const updated = {
        ...prev,
        [slot]: {
          ...prev[slot],
          set: setName,
        },
      };
      console.log("📦 Nouveau artifactsData :", updated);
      console.log(`🔧 Set "${setName}" appliqué au slot "${slot}"`);
      return updated;
    });

    // 🔥 FORCE un re-render de l'ArtifactCard
    setTimeout(() => {
      console.log("🔄 Force refresh après 100ms");
    }, 100);

    setIsSetSelectorOpen(false);
    setSetSelectorSlot(null);
  };

  // Dans handleLoadSavedSet :
  const handleLoadSavedSet = (slot) => {
    console.log("🚀 handleLoadSavedSet APPELÉ avec slot :", slot);

    const savedSets = JSON.parse(localStorage.getItem("savedSets") || "{}");
    console.log("💾 savedSets trouvés :", savedSets);

    if (savedSets[slot]) {
      console.log("✅ Set trouvé pour ce slot :", savedSets[slot]);
      setArtifactsData((prev) => ({
        ...prev,
        [slot]: {
          ...prev[slot],
          set: savedSets[slot],
        },
      }));
      console.log(`🔁 Set chargé pour ${slot} : ${savedSets[slot]}`);
    } else {
      console.warn(`❌ Aucun set enregistré pour ${slot}`);
    }
  };


  const handleSaveArtifactToLibrary = (saveData) => {
    console.log("🐉 Kaisel: Sauvegarde/modification artefact dans la librairie + hunter", saveData);

    const storage = JSON.parse(localStorage.getItem("builderberu_users")) || {};
    storage.user = storage.user || {};
    storage.user.accounts = storage.user.accounts || {};
    storage.user.accounts[activeAccount] = storage.user.accounts[activeAccount] || {};

    const currentAccount = storage.user.accounts[activeAccount];

    // 🔥 1️⃣ SAUVEGARDE DANS ARTIFACT LIBRARY (comme avant)
    currentAccount.artifactLibrary = currentAccount.artifactLibrary || {};
    currentAccount.artifactLibrary[saveData.slot] = currentAccount.artifactLibrary[saveData.slot] || {};
    currentAccount.artifactLibrary[saveData.slot][saveData.id] = {
      id: saveData.id,
      name: saveData.name,
      mainStat: saveData.mainStat,
      subStats: saveData.subStats,
      subStatsLevels: saveData.subStatsLevels,
      set: saveData.set,
      slot: saveData.slot,
      hunter: saveData.hunter,
      dateCreated: saveData.dateCreated,
      mainStatValue: saveData.mainStatValue || 0,
      tags: saveData.tags || []
    };

    // 🔥 2️⃣ NOUVEAU : SAUVEGARDE AUSSI DANS LE BUILD DU HUNTER
    currentAccount.builds = currentAccount.builds || {};
    currentAccount.builds[selectedCharacter] = currentAccount.builds[selectedCharacter] || {};
    currentAccount.builds[selectedCharacter].artifactsData = currentAccount.builds[selectedCharacter].artifactsData || {};

    // ✅ Écraser l'artefact actuel du hunter avec les données complètes
    currentAccount.builds[selectedCharacter].artifactsData[saveData.slot] = {
      mainStat: saveData.mainStat,
      subStats: saveData.subStats,
      subStatsLevels: saveData.subStatsLevels,
      set: saveData.set,
      mainStatValue: saveData.mainStatValue || 0,
      // 🆕 AJOUT : référence vers la librairie
      savedArtifactId: saveData.id,
      savedArtifactName: saveData.name
    };

    // 📦 Écriture localStorage
    localStorage.setItem("builderberu_users", JSON.stringify(storage));

    // 🔄 Mise à jour du state accounts
    setAccounts(prevAccounts => ({
      ...prevAccounts,
      [activeAccount]: {
        ...prevAccounts[activeAccount],
        artifactLibrary: currentAccount.artifactLibrary,
        builds: currentAccount.builds
      }
    }));

    // 🔄 Mise à jour du state artifactsData ACTUEL
    setArtifactsData(prev => ({
      ...prev,
      [saveData.slot]: {
        ...prev[saveData.slot],
        savedArtifactId: saveData.id,
        savedArtifactName: saveData.name
      }
    }));

    // 🔥 MESSAGE ADAPTÉ SELON LE CONTEXTE
    const action = saveData.isModifying ? "modifié" : "sauvé";
    showTankMessage(`💾 "${saveData.name}" ${action} dans la librairie ET sur ${selectedCharacter} !`, true);
    console.log(`✅ Artefact ${action} dans artifactLibrary ET builds[hunter]`);
  };

  const applyOcrDataToArtifact = (ocrResult) => {
    setArtifacts(prev => {
      return prev.map(artifact => {
        if (artifact.type !== ocrResult.type) return artifact;

        return {
          ...artifact,
          mainStat: {
            ...artifact.mainStat,
            stat: ocrResult.mainStat.stat,
            value: ocrResult.mainStat.value
          },
          subStats: ocrResult.subStats.map((sub, index) => ({
            stat: sub.stat,
            value: sub.value,
            proc: sub.proc
          }))
        };
      });
    });
  };

  const initialStats = {};
  allStats.forEach(stat => {
    initialStats[stat] = 0;
  });



  const completeStats = (statsObject) => {
    const completed = { ...statsObject };
    allStats.forEach(stat => {
      if (completed[stat] === undefined) {
        completed[stat] = 0;
      }
    });
    return completed;
  };

  const triggerFadeOutAllMusic = () => {
    if (!playingAudiosRef.current.length) return;

    playingAudiosRef.current.forEach(audio => {
      let volume = audio.volume;
      const fade = setInterval(() => {
        if (volume > 0.01) {
          volume -= 0.01;
          audio.volume = Math.max(0, volume);
        } else {
          audio.pause();
          audio.currentTime = 0;
          clearInterval(fade);
        }
      }, 100);

      // 🔒 Filet de sécurité
      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, 7000);
    });

    playingAudiosRef.current = []; // Nettoyage
  };
  const handleSaveCores = (hunterName, coreData) => {

    updateHunterCores((prev) => ({
      ...prev,
      [hunterName]: coreData,
    }));
  };

  const getShadowScreenPosition = (entityType = 'tank') => {
    const shadowManager = window.shadowManager;
    const entity = shadowManager?.entities?.get(entityType);

    if (!entity || !entity.spawnCanvas) {
      console.warn(`❌ ${entityType} entity introuvable`);
      return { x: 0, y: 0 };
    }

    const canvas = entity.spawnCanvas;
    const rect = canvas.getBoundingClientRect();

    // 🎯 CALCUL CORRECT avec scaling + OFFSET DE CENTRAGE
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;

    return {
      x: rect.left + (entity.x * scaleX),
      y: rect.top + (entity.y * scaleY) - 40, // ← AJUSTE cette valeur pour centrer verticalement
      currentCanvasId: canvas.id
    };
  };
  const getRandomMystEggLine = (charKey, context) => {
    const data = MYST_EGGS?.[charKey]?.[context];
    if (!data || !Array.isArray(data)) return null;
    return data[Math.floor(Math.random() * data.length)];
  };

  const characterStats = {
    'niermann': { attack: 5495, defense: 5544, hp: 10825, critRate: 0, mp: 1000 },
    'chae': { attack: 5495, defense: 5544, hp: 10825, critRate: 0, mp: 0 },
    'kanae': { attack: 5634, defense: 5028, hp: 11628, critRate: 0 },
    'alicia': { attack: 5836, defense: 5087, hp: 11075, critRate: 0 },
    'mirei': { attack: 5926, defense: 5040, hp: 10938, critRate: 0 },
    'baek': { attack: 5171, defense: 5737, hp: 11105, critRate: 0 },
    'chae-in': { attack: 5854, defense: 5168, hp: 10863, critRate: 0 },
    'charlotte': { attack: 5113, defense: 5878, hp: 10930, critRate: 0 },
    'choi': { attack: 5879, defense: 5010, hp: 11144, critRate: 0 },
    'emma': { attack: 5145, defense: 5102, hp: 12511, critRate: 0 },
    'esil': { attack: 5866, defense: 5180, hp: 10812, critRate: 0 },
    'gina': { attack: 5929, defense: 5132, hp: 10781, critRate: 0 },
    'go': { attack: 5102, defense: 5798, hp: 11125, critRate: 0 },
    'goto': { attack: 5087, defense: 5186, hp: 12457, critRate: 0 },
    'han': { attack: 5077, defense: 5187, hp: 12474, critRate: 0 },
    'harper': { attack: 5146, defense: 5157, hp: 12389, critRate: 0 },
    'hwang': { attack: 5168, defense: 5786, hp: 11010, critRate: 0 },
    'isla': { attack: 5243, defense: 5892, hp: 10621, critRate: 0 },
    'lee': { attack: 5825, defense: 5139, hp: 10986, critRate: 0 },
    'lim': { attack: 5850, defense: 5240, hp: 10720, critRate: 0 },
    'meilin': { attack: 5719, defense: 5211, hp: 11058, critRate: 0 },
    'min': { attack: 5095, defense: 5131, hp: 12555, critRate: 0 },
    'seo': { attack: 5195, defense: 5262, hp: 12062, critRate: 0 },
    'seorin': { attack: 5047, defense: 5197, hp: 12517, critRate: 0 },
    'shimizu': { attack: 5226, defense: 5022, hp: 12509, critRate: 0 },
    'silverbaek': { attack: 5817, defense: 5162, hp: 10956, critRate: 0 },
    'thomas': { attack: 5188, defense: 5928, hp: 10622, critRate: 0 },
    'woo': { attack: 5205, defense: 5862, hp: 10768, critRate: 0 },
    'yoo': { attack: 5880, defense: 5030, hp: 11100, critRate: 0 },
    'anna': { attack: 5163, defense: 4487, hp: 9705, critRate: 0 },
    'han-song': { attack: 5066, defense: 4567, hp: 9741, critRate: 0 },
    'hwang-dongsuk': { attack: 4533, defense: 4595, hp: 10815, critRate: 0 },
    'jo': { attack: 5081, defense: 4585, hp: 9673, critRate: 0 },
    'kang': { attack: 5128, defense: 4506, hp: 9740, critRate: 0 },
    'kim-chul': { attack: 4561, defense: 5167, hp: 9542, critRate: 0 },
    'kim-sangshik': { attack: 4670, defense: 5071, hp: 9513, critRate: 0 },
    'lee-johee': { attack: 4604, defense: 4407, hp: 11064, critRate: 0 },
    'nam': { attack: 4556, defense: 4563, hp: 10836, critRate: 0 },
    'park-beom': { attack: 4621, defense: 5096, hp: 9568, critRate: 0 },
    'park-heejin': { attack: 5024, defense: 4619, hp: 9721, critRate: 0 },
    'song': { attack: 5252, defense: 4490, hp: 9513, critRate: 0 },
    'yoo-jinho': { attack: 4591, defense: 5079, hp: 9665, critRate: 0 }
  };

  const [artifactsData, setArtifactsData] = useState({
    Helmet: {
      mainStat: '',
      subStats: ['', '', '', ''],
      subStatsLevels: [
        { value: 0, level: 0, procOrders: [] },
        { value: 0, level: 0, procOrders: [] },
        { value: 0, level: 0, procOrders: [] },
        { value: 0, level: 0, procOrders: [] },
      ],
      set: '',
    },
    Chest: {
      mainStat: '',
      subStats: ['', '', '', ''],
      subStatsLevels: [
        { value: 0, level: 0, procOrders: [] },
        { value: 0, level: 0, procOrders: [] },
        { value: 0, level: 0, procOrders: [] },
        { value: 0, level: 0, procOrders: [] },
      ],
    },
    Gloves: {
      mainStat: '',
      subStats: ['', '', '', ''],
      subStatsLevels: [
        { value: 0, level: 0, procOrders: [] },
        { value: 0, level: 0, procOrders: [] },
        { value: 0, level: 0, procOrders: [] },
        { value: 0, level: 0, procOrders: [] },
      ],
      set: '',
    },
    Boots: {
      mainStat: '',
      subStats: ['', '', '', ''],
      subStatsLevels: [
        { value: 0, level: 0, procOrders: [] },
        { value: 0, level: 0, procOrders: [] },
        { value: 0, level: 0, procOrders: [] },
        { value: 0, level: 0, procOrders: [] },
      ],
      set: '',
    },
    Earrings: {
      mainStat: '',
      subStats: ['', '', '', ''],
      subStatsLevels: [
        { value: 0, level: 0, procOrders: [] },
        { value: 0, level: 0, procOrders: [] },
        { value: 0, level: 0, procOrders: [] },
        { value: 0, level: 0, procOrders: [] },
      ],
    },
    Necklace: {
      mainStat: '',
      subStats: ['', '', '', ''],
      subStatsLevels: [
        { value: 0, level: 0, procOrders: [] },
        { value: 0, level: 0, procOrders: [] },
        { value: 0, level: 0, procOrders: [] },
        { value: 0, level: 0, procOrders: [] },
      ],
      set: '',
    },
    Bracelet: {
      mainStat: '',
      subStats: ['', '', '', ''],
      subStatsLevels: [
        { value: 0, level: 0, procOrders: [] },
        { value: 0, level: 0, procOrders: [] },
        { value: 0, level: 0, procOrders: [] },
        { value: 0, level: 0, procOrders: [] },
      ],
      set: '',
    },
    Ring: {
      mainStat: '',
      subStats: ['', '', '', ''],
      subStatsLevels: [
        { value: 0, level: 0, procOrders: [] },
        { value: 0, level: 0, procOrders: [] },
        { value: 0, level: 0, procOrders: [] },
        { value: 0, level: 0, procOrders: [] },
      ],
      set: '',
    },
  });
  const [comparisonData, setComparisonData] = useState(null); // 👈 ici

  // const [gemData, setGemData] = useState(() => {
  //   const saved = localStorage.getItem('global_gem_data');
  //   return saved ? JSON.parse(saved) : {
  //     Red: { 'Additional Attack': 0, 'Attack %': 0 },
  //     Blue: { 'Additional HP': 0, 'HP %': 0, 'Healing Given Increase (%)': 0 },
  //     Green: { 'Additional Defense': 0, 'Defense %': 0, 'Damage Reduction': 0 },
  //     Purple: { 'MP Recovery Rate Increase (%)': 0, 'Additional MP': 0, 'MP Consumption Reduction': 0 },
  //     Yellow: { 'Precision': 0, 'Critical Hit Damage': 0, 'Defense Penetration': 0 }
  //   };
  // });

  const [gemData, setGemData] = useState({});

  Object.entries(artifactsData).forEach(([slot, artifact]) => {
    if (!artifact || typeof artifact !== 'object') return;

    const { mainStat, subStats, subStatsLevels } = artifact;

    if (!Array.isArray(subStats) || !Array.isArray(subStatsLevels)) {
      console.warn('⚠️ subStats ou subStatsLevels manquants pour', slot, artifact);
      return;
    }

    // 👇 Suite du traitement
  });
  const applyStatToFlat = (stat, value, flat) => {
    if (!stat || typeof value !== 'number') return;

    const lowerStat = stat.toLowerCase();

    if (stat.startsWith('Additional ')) {
      const baseStat = stat.replace('Additional ', '');
      flat[baseStat] = (flat[baseStat] || 0) + value; // ➤ brut
      return;
    }


    if (stat.endsWith('%')) {
      // NE PAS appliquer dans applyStatToFlat, c’est fait ailleurs !
      return;
    }

    if (lowerStat.includes('attack')) {
      flat['Attack'] += value;
    } else if (lowerStat.includes('defense')) {
      flat['Defense'] += value;
    } else if (lowerStat.includes('hp')) {
      flat['HP'] += value;
    } else if (lowerStat.includes('mp')) {
      flat['MP'] += value;
    } else if (lowerStat.includes('Critical Hit Rate') || lowerStat.includes('Critical Hit Rate')) {
      flat['Critical Hit Rate'] += value;
    } else {
      flat[stat] = (flat[stat] || 0) + value;
    }
  };

  // 🧠 Fonction de recalcul des stats finales avec artefacts
  // 🐉 KAISEL VERSION PROTÉGÉE - REMPLACE ta fonction existante
  const recalculateStatsFromArtifacts = () => {
    if (!selectedCharacter) return;
    if (!artifactsData || typeof artifactsData !== 'object') return;
    if (Object.keys(artifactsData).length === 0) return;

    const allowedRawStats = [
      "Precision", "Defense Penetration", "Healing Given Increase (%)",
      "MP Recovery Rate Incr. (%)", "Additional MP", "MP Consumption Reduc.",
      "DMG Incr.", "DMG Reduction"
    ];

    const flat = { ...flatStats };
    const updated = {};

    Object.values(artifactsData).forEach(artifact => {
      if (!artifact) return;

      // 🛡️ PROTECTION MAINSTAT KAISEL
      if (artifact.mainStat &&
        typeof artifact.mainStat === 'string' &&
        artifact.mainStat.trim() !== '' &&
        mainStatMaxByIncrements[artifact.mainStat]) {

        // ✅ Calcul sécurisé de mainStatValue
        artifact.mainStatValue = mainStatMaxByIncrements[artifact.mainStat][4];

        const stat = artifact.mainStat;
        const value = artifact.mainStatValue;

        if (stat.endsWith('%')) {
          const baseStat = stat.replace(' %', '');
          const base = flat[baseStat] || 0;
          updated[baseStat] = (updated[baseStat] || 0) + (base * value / 100);
        } else if (stat.startsWith('Additional ')) {
          const baseStat = stat.replace('Additional ', '');
          updated[baseStat] = (updated[baseStat] || 0) + value;
        } else {
          updated[stat] = (updated[stat] || 0) + value;
        }
      } else if (artifact.mainStat && artifact.mainStat.trim() !== '') {
        // 🚨 Log les mainStats problématiques sans crasher
        console.warn(`⚠️ Kaisel: MainStat invalide ignoré: "${artifact.mainStat}"`);
      }

      // ➤ Substats (protection renforcée)
      if (Array.isArray(artifact.subStats) && Array.isArray(artifact.subStatsLevels)) {
        artifact.subStats.forEach((stat, i) => {
          const levelInfo = artifact.subStatsLevels[i];
          if (!stat || !levelInfo || typeof levelInfo.value !== 'number') return;

          if (stat.endsWith('%')) {
            const baseStat = stat.replace(' %', '');
            const base = flat[baseStat] || 0;
            updated[baseStat] = (updated[baseStat] || 0) + (base * levelInfo.value / 100);
          } else if (stat.startsWith('Additional ')) {
            const baseStat = stat.replace('Additional ', '');
            updated[baseStat] = (updated[baseStat] || 0) + levelInfo.value;
          } else {
            updated[stat] = (updated[stat] || 0) + levelInfo.value;
          }
        });
      } else {
        console.warn(`⚠️ Kaisel: SubStats invalides pour un artefact:`, artifact);
      }
    });

    setStatsFromArtifacts(completeStats(updated));
  };

  const tankMessageRef = useRef('');
  const messageOpacityRef = useRef(1);
  const [tankMessage, setTankMessage] = useState('');
  const [isBuildsReady, setIsBuildsReady] = useState(false);
  const [messageOpacity, setMessageOpacity] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [isSetSelectorOpen, setIsSetSelectorOpen] = useState(false);
  const [isAccountSwitching, setIsAccountSwitching] = useState(false);
  const [setSelectorSlot, setSetSelectorSlot] = useState(null); // ex: 'Helmet'
  const [showNoyauxPopup, setShowNoyauxPopup] = useState(false);
  const [mergedUser, setMergedUser] = useState({
    activeAccount: "main",
    accounts: {}
  });
  const [hunterCores, setHunterCores] = useState({});
  const [showNewAccountPopup, setShowNewAccountPopup] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [artifacts, setArtifacts] = useState(initialArtifacts);
  const [hunterWeapons, setHunterWeapons] = useState(() => {
    const fromStorage = JSON.parse(localStorage.getItem('hunterWeapons') || '{}');
    return fromStorage;
  });
  const [parsedArtifactData, setParsedArtifactData] = useState(null);
  const [showWeaponPopup, setShowWeaponPopup] = useState(false);
  // 🎯 STATES À AJOUTER (dans le composant BuilderBeru)
  const [reportHistory, setReportHistory] = useState([]);
  const [currentReport, setCurrentReport] = useState(null);
  const [showReportSystem, setShowReportSystem] = useState(false);
  const [showPapyrus, setShowPapyrus] = useState(false);

  const handleReportGenerated = (report) => {
    setCurrentReport(report);
    setShowPapyrus(true);
  };

  const handleSaveReport = (report) => {
    setReportHistory(prev => [report, ...prev.slice(0, 9)]); // Garde 10 rapports max
    setShowPapyrus(false);
  };

  const handleOpenReport = () => {
    setShowReportSystem(true);
    setShowPapyrus(false);
  };

  const handleCloseReport = () => {
    setShowReportSystem(false);
  };


  const showBeruMenu = ({ x, y, selectedCharacter }) => {
    console.log("🧠 Menu Beru demandé à position:", { x, y, selectedCharacter });

    // 🔒 BLOQUER le mouvement de Beru
    if (window.shadowManager) {
      const beruEntity = window.shadowManager.entities.get('beru');
      if (beruEntity) {
        beruEntity.isMenuActive = true; // Nouveau flag
      }
    }

    setShowBeruInteractionMenu(true);
    setBeruMenuPosition({ x, y });
    setBeruMenuCharacter(selectedCharacter);
  };
  const createNewAccount = () => {
    const name = newAccountName.trim().toLowerCase();
    if (!name || accounts[name]) {
      alert("Nom invalide ou déjà existant");
      return;
    }

    // 🏗️ Build initial minimal (pour quand on sélectionnera un personnage)
    const emptyArtifactsData = {
      Helmet: { mainStat: '', subStats: ['', '', '', ''], mainStatValue: 0, subStatsLevels: [{}, {}, {}, {}], set: '' },
      Chest: { mainStat: '', subStats: ['', '', '', ''], mainStatValue: 0, subStatsLevels: [{}, {}, {}, {}], set: '' },
      Gloves: { mainStat: '', subStats: ['', '', '', ''], mainStatValue: 0, subStatsLevels: [{}, {}, {}, {}], set: '' },
      Boots: { mainStat: '', subStats: ['', '', '', ''], mainStatValue: 0, subStatsLevels: [{}, {}, {}, {}], set: '' },
      Necklace: { mainStat: '', subStats: ['', '', '', ''], mainStatValue: 0, subStatsLevels: [{}, {}, {}, {}], set: '' },
      Bracelet: { mainStat: '', subStats: ['', '', '', ''], mainStatValue: 0, subStatsLevels: [{}, {}, {}, {}], set: '' },
      Ring: { mainStat: '', subStats: ['', '', '', ''], mainStatValue: 0, subStatsLevels: [{}, {}, {}, {}], set: '' },
      Earrings: { mainStat: '', subStats: ['', '', '', ''], mainStatValue: 0, subStatsLevels: [{}, {}, {}, {}], set: '' },
    };

    // 🔄 Création d'un compte COMPLÈTEMENT VIDE
    const emptyAccount = {
      builds: {}, // ← Aucun build au début
      hunterWeapons: {},
      recentBuilds: [], // ← Aucun personnage récent
      hunterCores: {},
      gems: {}, // ← 🐉 KAISEL FIX : Gemmes vides !
    };

    // 🧠 Mise à jour des accounts
    const newAccounts = {
      ...accounts,
      [name]: emptyAccount,
    };

    const updatedUser = {
      ...mergedUser,
      accounts: newAccounts,
    };

    // 💾 Stockage
    localStorage.setItem("builderberu_users", JSON.stringify({ user: updatedUser }));

    // 🔁 Mise à jour des states React - TOUT VIDE
    setAccounts(newAccounts);
    setMergedUser(updatedUser);
    setActiveAccount(name);
    setRecentBuilds([]); // ← Vide !
    setSelectedCharacter(''); // ← Aucun personnage sélectionné
    setHunterCores({});
    setHunterWeapons({});

    // 🐉 KAISEL FIX CRITIQUE : Réinitialiser TOUS les states React !
    setFlatStats({
      'Attack': 0,
      'Defense': 0,
      'HP': 0,
      'Critical Hit Rate': 0,
      'Critical Hit Damage': 0,
      'Defense Penetration': 0,
      'Additional MP': 0,
      'Additional Attack': 0,
      'Healing Given Increase (%)': 0,
      'Damage Increase': 0,
      'MP Consumption Reduction': 0,
      'Damage Reduction': 0,
      'MP Recovery Rate Increase (%)': 0,
      'MP': 0,
      'Precision': 0,
    });

    setStatsWithoutArtefact({
      'Attack': 0,
      'Defense': 0,
      'HP': 0,
      'Critical Hit Rate': 0,
      'Critical Hit Damage': 0,
      'Defense Penetration': 0,
      'Additional MP': 0,
      'Additional Attack': 0,
      'Healing Given Increase (%)': 0,
      'Damage Increase': 0,
      'MP Consumption Reduction': 0,
      'Damage Reduction': 0,
      'MP Recovery Rate Increase (%)': 0,
      'MP': 0,
      'Precision': 0,
    });

    setStatsFromArtifacts({
      'Attack': 0,
      'Defense': 0,
      'HP': 0,
      'Critical Hit Rate': 0,
      'Critical Hit Damage': 0,
      'Defense Penetration': 0,
      'Additional MP': 0,
      'Additional Attack': 0,
      'Healing Given Increase (%)': 0,
      'Damage Increase': 0,
      'MP Consumption Reduction': 0,
      'Damage Reduction': 0,
      'MP Recovery Rate Increase (%)': 0,
      'MP': 0,
      'Precision': 0,
    });

    setArtifactsData(emptyArtifactsData); // ← Artefacts vides

    // 🐉 KAISEL FIX PRINCIPAL : Gemmes VIDES !
    setGemData({}); // ← CRITIQUE ! Réinitialise les gemmes dans le state React

    // 🔐 UI
    setNewAccountName('');
    setShowNewAccountPopup(false);

    // 💬 Message de confirmation
    showTankMessage(`✅ Nouveau compte "${name}" créé ! Sélectionne un personnage pour commencer.`, true);
  };

  const updateHunterCores = (newCores) => {
    setHunterCores(newCores);

    // 🔄 Mise à jour dans le compte actif
    const updatedAccounts = {
      ...accounts,
      [activeAccount]: {
        ...accounts[activeAccount],
        hunterCores: newCores,
      },
    };

    const updatedUser = {
      ...mergedUser,
      accounts: updatedAccounts,
    };

    setAccounts(updatedAccounts);
    setMergedUser(updatedUser);
    localStorage.setItem("builderberu_users", JSON.stringify({ user: updatedUser }));
  };


  const onConfirm = (parsedData) => {
    console.log('✅ Artefact OCR confirmé :', parsedData);

    // Exemple simple : mise à jour du premier artefact
    setArtifacts((prev) => {
      const updated = [...prev];
      const indexToUpdate = updated.findIndex(a => a.type === parsedData.type);
      if (indexToUpdate !== -1) {
        updated[indexToUpdate] = {
          ...updated[indexToUpdate],
          mainStat: parsedData.mainStat,
          subStats: parsedData.subStats
          // On pourra ajouter procValue etc. après
        };
      }
      return updated;
    });

    setshowOcrPopup(false);
  };


  const [showHologram, setShowHologram] = useState(false);
  const [chibiMessage, setChibiMessage] = useState("");
  const [showChibiBubble, setShowChibiBubble] = useState(false);
  const [chibiPos, setChibiPos] = useState({ x: 200, y: 300 }); // Position à ajuster si besoin
  const [showNarrative, setShowNarrative] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [mobileView, setMobileView] = useState('main'); // 'main', 'left', 'right'


  //   const narrativeText = `
  // Chargement du rapport Kanae...

  // {sound:https://res.cloudinary.com/dbg7m8qjd/video/upload/v1747685476/Sad_Anime_Ost_Believe_Me_udqopx.mp3}

  // Kanae observe silencieusement. Le jugement approche.

  // {img:https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747680569/SERN_ab7od6.png ref=mainImage class=fade-in size=320}

  // "Pourquoi tant de sauvegardes... pour si peu de builds ?"

  // {delay=1200}

  // ⚖️ Verdict : Optimisation obligatoire.

  // {delay=5200}
  // `;

  const mobileNarrativeTextEn = `
{img:https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748482387/BuilderBeruUnderConstruction_ew2r81.png}

{delay=1000}

A faint traffic noise echoes through the streets of Seoul at dusk...

{delay=1500}

Tank turns to Béru, holding his phone firmly in one hand, an apple in the other.

{delay=1500}

"Béru... I’ve got bad news."

{sound:https://res.cloudinary.com/dbg7m8qjd/video/upload/v1747831216/sigh_confused_ctuchy.mp3}
{delay=1000}

"The mobile site... BuilderBeru... is down."

{img:https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748482387/SernHacking_ymkjgg.png}

"The SERN... took control of the domain."

{delay=1500}

Béru frowns. Kanae, a bit further away, is still playing on her phone, unaware of the growing threat.

{sound:https://res.cloudinary.com/dbg7m8qjd/video/upload/v1747832147/Gong_Sound_Effect_k85f8f.mp3}
{delay=1000}

Tank slowly places his phone on the ground. The construction lights flicker behind them. The “Under Construction” sign isn’t a joke… it’s a declaration of war.

"What if we took back control... together?"

{img:https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748482387/BuilderBeruWorking_ucfvoo.png}

The team gathers in the IT room. Kly, eyes locked on lines of code, tries to find the bug’s origin. Béru remains silent. Kanae starts to worry. Tank… bites into his apple.

"I don’t get it… everything looks fine..."

{img:https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748482409/fromobile_pdlnzr.png}

Tank, deep in thought, looks at Kanae.

"Let’s just throw your phone into the river… maybe it’ll free up the flow."  
Caught off guard, Kanae complies without question.

Tank tries another idea…
{delay=1000}
{img:https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748482387/BuilderBeruWorking_ucfvoo.png}
{delay=1000}
"What if we deleted… the bug? Like… Béru?"

{img:https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748482386/BeruAngry_zkblsv.png}

Béru explodes:  
"YOU WANNA END UP IN MY ANTHILL, TANK?  
We’ll give you a GREAT welcome 😡😡😠"

{delay=1000}

Kly suddenly sits up.

{img:https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748482388/Eureka_i5dii3.png}

"EUREKA! We’ll bypass it. The PC version is already live!"

The team lights up. The plan is simple. Kanae, dressed as a schoolteacher, will teach users how to copy their artefacts manually while they wait for more.

{img:https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748482388/ExempleCopyPasta_xljgbr.png}

Kanae beams.

"So... to make an efficient copy pasta, just follow this model..."

Tank listens closely, still chewing his apple. Béru, arms crossed, silently approves.

{delay=1500}

Finally where we are.

BuilderBeru.com – Solo Leveling Arise FanSite  
Official PC Release: May 31, 2025

Light mobile version expected end of June 2025...  
If the SERN doesn’t block us. And if Tank doesn’t delete Béru. 😠

{delay=1000}

{img:https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748485272/waitforyou_sspf8i.png}

We’re waiting for you on BuilderBeru.com...  
Thank you all!

Signed, Kly – Member of Gagold Guild  
Guild Leader: BobbyJones

BobbyJones:  
"We’re recruiting people who clear their Guild Bosses and do their dailies!"

Kly:  
"Not the time to advertise, Bob 🙄"

{delay=1000}

BobbyJones:  
"Oops... 😏"

BobbyJones:  
"Forza Inter!"

{delay=15000}
`;



  const mobileNarrativeTextFr = `
{img:https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748482387/BuilderBeruUnderConstruction_ew2r81.png}

{delay=1000}

Un léger bruit de trafic résonne dans les rues de Séoul au crépuscule...

{delay=1500}

Tank se tourne vers Béru, tenant fermement son téléphone dans une main, une pomme dans l'autre.

{delay=1500}

"Béru... j’ai une mauvaise nouvelle."

{sound:https://res.cloudinary.com/dbg7m8qjd/video/upload/v1747831216/sigh_confused_ctuchy.mp3}
{delay=1000}

"Le site mobile... BuilderBeru... est en panne."

{img:https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748482387/SernHacking_ymkjgg.png}

"Le SERN... a pris le contrôle du domaine."

{delay=1500}

Béru fronce les sourcils. Kanae, un peu plus loin, s’amuse avec son propre téléphone, ignorant encore la gravité de la situation.

{sound:https://res.cloudinary.com/dbg7m8qjd/video/upload/v1747832147/Gong_Sound_Effect_k85f8f.mp3}
{delay=1000}

Tank pose lentement son téléphone au sol. La lumière des chantiers clignote derrière eux. Le panneau "Under Construction" n’est pas un mensonge... c’est un signal de guerre.

"Et si on reprenait le contrôle... ensemble ?"

{img:https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748482387/BuilderBeruWorking_ucfvoo.png}

L’équipe se réunit dans la salle informatique. Kly, les yeux rivés sur les lignes de code, tente de comprendre l’origine du bug. Béru reste silencieux. Kanae commence à s’inquiéter. Tank... croque dans sa pomme.

"Je comprends pas... tout semble correct..."

{img:https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748482409/fromobile_pdlnzr.png}

Tank, pensif, regarde Kanae.

"On a qu’à jeter ton téléphone dans la rivière... peut-être que ça libérera le flux." Kanae, prise au dépourvu, exécute sans réfléchir.

Tank tente une nouvelle proposition...
{delay=1000}
{img:https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748482387/BuilderBeruWorking_ucfvoo.png}
{delay=1000}
"Et si on supprimait... le bug ? Genre... Béru ?"

{img:https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748482386/BeruAngry_zkblsv.png}

Béru explose : "TU VEUX FINIR DANS MA FOURMILLÈRE, TANK ? On va BIEN t'accueillir 😡😡😠"

{delay=1000}

Kly se redresse soudainement.

{img:https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748482388/Eureka_i5dii3.png}

"EUREKA ! On va contourner. Une version PC est déjà en ligne !"

L’équipe s’illumine. Le plan est simple. Kanae, en professeure écolière, va enseigner aux utilisateurs comment copier leurs artefacts manuellement, en attendant mieux.

{img:https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748482388/ExempleCopyPasta_xljgbr.png}

Kanae rayonne.

"Alors... pour faire un copy pasta efficace, suivez ce modèle..."

Tank l’écoute attentivement, la bouche encore pleine de pomme. Béru, bras croisés, approuve silencieusement.

{delay=1500}

Finalement... nous y sommes..

BuilderBeru.com – FanSite Solo Leveling AriseSortie officielle PC : 31 Mai 2025

Version mobile allégée prévue fin Juin 2025... si le SERN ne nous bloque pas. Et si Tank ne supprime pas Béru. 😠

{delay=1000}

{img:https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748485272/waitforyou_sspf8i.png}

Nous vous attendons sur BuilderBeru.com... Merci à vous !

Signé Kly. Membre de la guilde Gagold
Chef de Guilde : BobbyJones.

BobbyJones : "Nous recrutons des gens qui font leur boss de guilde et qui font leur dailies !

Kly : "C'est pas le moment de faire ta pub Bob 🙄"

{delay=1000}

BobbyJones : "Ah pardon... 😏"

BobbyJones : "Allez l'Inter !"

{delay=15000}
`;


  const [accounts, setAccounts] = useState({});
  const [activeAccount, setActiveAccount] = useState("main");

  const [selectedCharacter, setSelectedCharacter] = useState('niermann');

  const characters = {
    '': {
      name: 'Sélectionner un personnage',
      img: '', // Pas d'image volontairement
      class: '',
      grade: '',
      element: '',
      scaleStat: ''
    }, 'niermann': {
      name: 'Lennart Niermann',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1749114179/niermann_arxjer.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1749114267/build-niermann_phfwmu.png',
      class: 'Fighter',
      grade: 'SSR',
      element: 'Water',
      scaleStat: 'Defense'
    },

    'chae': {
      name: 'Cha Hae-In Valkyrie',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604309/chae_mlnz8k.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606282/icons/build-3.png',
      class: 'Fighter',
      grade: 'SSR',
      element: 'Water',
      scaleStat: 'Defense'
    },
    'kanae': {
      name: 'Tawata Kanae',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604318/kanae_squvh2.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606320/icons/build-18.png',
      class: 'Assassin',
      grade: 'SSR',
      element: 'Fire',
      scaleStat: 'Attack'
    },
    'alicia': {
      name: 'Alicia Blanche',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604309/alicia_fzpzkf.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606278/icons/build.png',
      class: 'Mage',
      grade: 'SSR',
      element: 'Water',
      scaleStat: 'Attack'
    },
    'mirei': {
      name: 'Amamiya Mirei',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604327/mirei_nb6arm.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606340/icons/build-26.png',
      class: 'Assassin',
      grade: 'SSR',
      element: 'Wind',
      scaleStat: 'Attack'
    },
    'baek': {
      name: 'Baek Yoonho',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604214/baek_tgrbx8.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747647495/build_baek_wwcvhp.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Light',
      scaleStat: 'Defense'
    },
    'chae-in': {
      name: 'Cha Hae In',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604308/chae-in_zafver.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606285/icons/build-4.png',
      class: 'Fighter',
      grade: 'SSR',
      element: 'Light',
      scaleStat: 'Attack'
    },
    'charlotte': {
      name: 'Charlotte',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604306/charlotte_bbsqv1.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606287/icons/build-5.png',
      class: 'Mage',
      grade: 'SSR',
      element: 'Dark',
      scaleStat: 'Defense'
    },
    'choi': {
      name: 'Choi Jong-In',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604310/choi_a4k5sl.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606289/icons/build-6.png',
      class: 'Mage',
      grade: 'SSR',
      element: 'Fire',
      scaleStat: 'Attack'
    },
    'emma': {
      name: 'Emma Laurent',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604311/emma_vvw5lt.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606292/icons/build-7.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Fire',
      scaleStat: 'HP'
    },
    'esil': {
      name: 'Esil Radiru',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604313/esil_bjzrv2.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606294/icons/build-8.png',
      class: 'Ranger',
      grade: 'SSR',
      element: 'Fire',
      scaleStat: 'Attack'
    },
    'gina': {
      name: 'Gina',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604312/gina_emzlpd.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606297/icons/build-9.png',
      class: 'Support',
      grade: 'SSR',
      element: 'Fire',
      scaleStat: 'Attack'
    },
    'go': {
      name: 'Go Gunhee',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604312/go_e5tq0a.png',
      icon: 'build_go.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Light',
      scaleStat: 'Defense'
    },
    'goto': {
      name: 'Goto Ryuji',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604314/goto_pirfgy.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606299/icons/build-10.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Wind',
      scaleStat: 'HP'
    },
    'han': {
      name: 'Han Se-Mi',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604315/han_pfyz7e.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606304/icons/build-12.png',
      class: 'Healer',
      grade: 'SSR',
      element: 'Wind',
      scaleStat: 'HP'
    },
    'harper': {
      name: 'Harper',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604316/harper_fvn1d9.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606309/icons/build-14.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Dark',
      scaleStat: 'HP'
    },
    'hwang': {
      name: 'Hwang Dongsoo',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604316/Hwang_wumgnp.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606311/icons/build-15.png',
      class: 'Fighter',
      grade: 'SSR',
      element: 'Wind',
      scaleStat: 'Defense'
    },
    'isla': {
      name: 'Isla Wright',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604215/isla_w9mnlc.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606317/icons/build-17.png',
      class: 'Healer',
      grade: 'SSR',
      element: 'Dark',
      scaleStat: 'Defense'
    },
    'lee': {
      name: 'Lee Bora',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604324/lee_khjilr.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606327/icons/build-21.png',
      class: 'Mage',
      grade: 'SSR',
      element: 'Dark',
      scaleStat: 'Attack'
    },
    'lim': {
      name: 'Lim Tae-Gyu',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604325/lim_gahgsq.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606332/icons/build-23.png',
      class: 'Ranger',
      grade: 'SSR',
      element: 'Dark',
      scaleStat: 'Attack'
    },
    'meilin': {
      name: 'Meilin Fisher',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604218/meilin_k17bnw.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606335/icons/build-24.png',
      class: 'Healer',
      grade: 'SSR',
      element: 'Water',
      scaleStat: 'HP'
    },
    'min': {
      name: 'Min Byung-Gu',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604326/min_tw1eio.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606337/icons/build-25.png',
      class: 'Healer',
      grade: 'SSR',
      element: 'Light',
      scaleStat: 'HP'
    },
    'seo': {
      name: 'Seo Jiwoo',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604210/seo_qsvfhj.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606349/icons/build-30.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Water',
      scaleStat: 'HP'
    },
    'seorin': {
      name: 'Seorin',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604210/seorin_t7irtj.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606352/icons/build-31.png',
      class: 'Ranger',
      grade: 'SSR',
      element: 'Water',
      scaleStat: 'HP'
    },
    'shimizu': {
      name: 'Shimizu Akari',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604212/shimizu_a3devg.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606355/icons/build-32.png',
      class: 'Healer',
      grade: 'SSR',
      element: 'Light',
      scaleStat: 'HP'
    },
    'silverbaek': {
      name: 'Silver Mane Baek Yoonho',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604211/silverbaek_kg7wuz.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606357/icons/build-33.png',
      class: 'Fighter',
      grade: 'SSR',
      element: 'Dark',
      scaleStat: 'Attack'
    },
    'thomas': {
      name: 'Thomas Andre',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604216/thomas_jr9x92.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606363/icons/build-35.png',
      class: 'Fighter',
      grade: 'SSR',
      element: 'Light',
      scaleStat: 'Defense'
    },
    'woo': {
      name: 'Woo Jinchul',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604217/woo_pfrpik.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606367/icons/build-36.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Wind',
      scaleStat: 'Defense'
    },
    'yoo': {
      name: 'Yoo Soohyun',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604218/yoo_mrwt08.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606370/icons/build-37.png',
      class: 'Mage',
      grade: 'SSR',
      element: 'Fire',
      scaleStat: 'Attack'
    },
    'anna': {
      name: 'Anna Ruiz',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604212/anna_ygnv0l.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606280/icons/build-2.png',
      class: 'Ranger',
      grade: 'SR',
      element: 'Water',
      scaleStat: 'Attack'
    },
    'han-song': {
      name: 'Han Song-Yi',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604213/han-song_xsfzja.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606306/icons/build-13.png',
      class: 'Assassin',
      grade: 'SR',
      element: 'Water',
      scaleStat: 'Attack'
    },
    'hwang-dongsuk': {
      name: 'Hwang Dongsuk',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604317/hwang-dongsuk_g1humr.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606314/icons/build-16.png',
      class: 'Tank',
      grade: 'SR',
      element: 'Dark',
      scaleStat: 'HP'
    },
    'jo': {
      name: 'Jo Kyuhwan',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747689385/jojo3_tjhgu8.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747649046/jojo_vmdzhg.png',
      class: 'Mage',
      grade: 'SR',
      element: 'Light',
      scaleStat: 'Attack'
    },
    'kang': {
      name: 'Kang Taeshik',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604320/kang_y6r5f4.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606322/icons/build-19.png',
      class: 'Assassin',
      grade: 'SR',
      element: 'Dark',
      scaleStat: 'Attack'
    },
    'kim-chul': {
      name: 'Kim Chul',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604322/kim-chul_z9jha4.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747646719/build__kim-chul_sptghm.png',
      class: 'Tank',
      grade: 'SR',
      element: 'Light',
      scaleStat: 'Defense'
    },
    'kim-sangshik': {
      name: 'Kim Sangshik',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604321/kim-sangshik_rmknpe.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606325/icons/build-20.png',
      class: 'Tank',
      grade: 'SR',
      element: 'Wind',
      scaleStat: 'Defense'
    },
    'lee-johee': {
      name: 'Lee Johee',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604323/lee-johee_ispe3p.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606330/icons/build-22.png',
      class: 'Healer',
      grade: 'SR',
      element: 'Water',
      scaleStat: 'HP'
    },
    'nam': {
      name: 'Nam Chae-Young',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604328/nam_rb2ogg.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606342/icons/build-27.png',
      class: 'Ranger',
      grade: 'SR',
      element: 'Water',
      scaleStat: 'HP'
    },
    'park-beom': {
      name: 'Park Beom-Shik',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604328/park-beom_er1y0k.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606345/icons/build-28.png',
      class: 'Fighter',
      grade: 'SR',
      element: 'Wind',
      scaleStat: 'Defense'
    },
    'park-heejin': {
      name: 'Park Heejin',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604307/park-heejin_tsukcl.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606347/icons/build-29.png',
      class: 'Mage',
      grade: 'SR',
      element: 'Wind',
      scaleStat: 'Attack'
    },
    'song': {
      name: 'Song Chiyul',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604215/song_usr7ja.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606359/icons/build-34.png',
      class: 'Mage',
      grade: 'SR',
      element: 'Fire',
      scaleStat: 'Attack'
    },
    'yoo-jinho': {
      name: 'Yoo Jinho',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604221/yoo-jinho_csl27q.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606372/icons/build-38.png',
      class: 'Tank',
      grade: 'SR',
      element: 'Light',
      scaleStat: 'Defense'
    }
  };
  const [bubbleId, setBubbleId] = useState(Date.now());
  const [showSernPopup, setShowSernPopup] = useState(false);
  const triggerSernIntervention = () => {
    setShowSernPopup(true);
  };

  const handleSaveNoyaux = (hunterName, coreData) => {
    // 🔁 Mise à jour du state uniquement (affichage en live)
    setHunterCores(prev => ({
      ...prev,
      [hunterName]: coreData,
    }));

    showTankMessage("🧪 Noyaux appliqués pour visualisation", true);
  };


  const handleSaveWeapon = (hunterName, weaponData) => {
    const updatedWeapons = {
      ...accounts[activeAccount]?.hunterWeapons,
      [hunterName]: weaponData,
    };

    setHunterWeapons(updatedWeapons);

    const storage = JSON.parse(localStorage.getItem("builderberu_users")) || {};
    if (!storage.user || !storage.user.accounts[activeAccount]) return;

    storage.user.accounts[activeAccount].hunterWeapons = updatedWeapons;

    localStorage.setItem("builderberu_users", JSON.stringify(storage));
  };




  // 🐉 KAISEL DEBUG COMPLET - À ajouter temporairement dans ton code

  // 1️⃣ Fonction de debug pour voir le localStorage
  const debugLocalStorage = () => {
    const stored = JSON.parse(localStorage.getItem("builderberu_users"));
    console.log("🐉 Kaisel DEBUG localStorage complet:", stored);

    if (stored?.user?.accounts) {
      Object.entries(stored.user.accounts).forEach(([accountName, accountData]) => {
        console.log(`🐉 Compte "${accountName}":`, {
          builds: Object.keys(accountData.builds || {}),
          gems: accountData.gems || {},
          recentBuilds: accountData.recentBuilds || []
        });
      });
    }
  };

  // 🐉 KAISEL FIX - Lecture gemmes UNIQUEMENT au niveau compte

  // 1️⃣ handleSaveGems corrigé - Sauvegarde UNIQUEMENT dans le compte
  const handleSaveGems = (data) => {
    setGemData(data); // État local

    const storage = JSON.parse(localStorage.getItem("builderberu_users")) || {};
    storage.user = storage.user || {};
    storage.user.accounts = storage.user.accounts || {};
    storage.user.accounts[activeAccount] = storage.user.accounts[activeAccount] || {};

    // 💎 SAUVEGARDER UNIQUEMENT dans accounts[activeAccount].gems
    storage.user.accounts[activeAccount].gems = data;

    localStorage.setItem("builderberu_users", JSON.stringify(storage));
    showTankMessage("💎 Gemmes mises à jour et sauvegardées !", true);
  };

  const [showGemPopup, setShowGemPopup] = useState(false);

  const saveGemData = (data) => {
    setGemData(data); // si tu l'utilises encore dans le state React
    const storage = JSON.parse(localStorage.getItem("builderberu_users")) || {};
    if (!storage.user || !storage.user.accounts || !storage.user.accounts[activeAccount]) return;

    storage.user.accounts[activeAccount].gems = data; // 🔁 ici on utilise bien 'gems'
    localStorage.setItem("builderberu_users", JSON.stringify(storage));
    showTankMessage("💎 Gemmes mises à jour et sauvegardées !", true);
  };

  const handleExportAllBuilds = () => {
    const storage = JSON.parse(localStorage.getItem("builderberu_users"));
    if (!storage?.user?.accounts?.[activeAccount]?.builds) {
      showTankMessage("No builds to export 😢", true);
      return;
    }

    const builds = storage.user.accounts[activeAccount].builds;

    // 🧬 Ajout des hunterCores si présents dans state
    Object.entries(hunterCores).forEach(([character, cores]) => {
      if (builds[character]) {
        builds[character].hunterCores = cores;
      }
    });

    const exportData = {
      ...builds,
      recentBuilds: recentBuilds || [],
    };

    const exportString = JSON.stringify(exportData);
    const salted = exportString + salt;
    const encoded = btoa(salted);

    navigator.clipboard.writeText(encoded);
    showTankMessage('📋 All builds copied to clipboard!', true);
  };


  // 🐉 Kaisel Correction 1/2 - 18/01/2025
  // Fix du personnage par défaut au chargement de la page

  useEffect(() => {
    console.log("🔄 useEffect [INIT & CHARGEMENT MULTI-COMPTE - KAISEL FIX]");


    migrateOldDataToNewSystem();



    const defaultUserData = {
      activeAccount: "main",
      accounts: {
        main: {
          builds: {},
          hunterWeapons: {},
          recentBuilds: [],
          hunterCores: {},
          gems: {},
        },
      },
    };

    try {
      const stored = localStorage.getItem("builderberu_users");
      const parsed = stored ? JSON.parse(stored) : null;

      let userData = parsed?.user || defaultUserData;

      // ✅ Validation minimale
      if (!userData.accounts || Object.keys(userData.accounts).length === 0) {
        console.warn("⚠️ Aucun compte valide détecté. Rechargement avec defaults.");
        userData = defaultUserData;
      }

      const currentAccount = userData.accounts[userData.activeAccount || "main"] || defaultUserData.accounts.main;

      // 🧹 Sécurise les builds existants (filtrage des builds de persos inconnus)
      const recent = (currentAccount.recentBuilds || []).filter((id) => characters[id]);

      // 🎯 KAISEL FIX : Choisir le personnage par défaut
      let defaultCharacter = '';

      if (recent.length > 0) {
        // Si il y a des builds récents dans le compte actuel, prendre le premier
        defaultCharacter = recent[0];
        console.log(`🐉 Kaisel: Personnage par défaut trouvé: ${defaultCharacter} (dernier du compte ${userData.activeAccount})`);
      } else {
        // Sinon, essayer le compte "main"
        const mainAccount = userData.accounts.main;
        const mainRecent = (mainAccount?.recentBuilds || []).filter((id) => characters[id]);

        if (mainRecent.length > 0) {
          defaultCharacter = mainRecent[0];
          console.log(`🐉 Kaisel: Personnage par défaut du compte main: ${defaultCharacter}`);
        } else {
          // En dernier recours, Niermann
          defaultCharacter = 'niermann';
          console.log(`🐉 Kaisel: Personnage par défaut final: niermann (fallback)`);
        }
      }

      // 📌 Setup des états initiaux
      setMergedUser(userData);
      setAccounts(userData.accounts);
      setActiveAccount(userData.activeAccount || "main");
      setRecentBuilds(recent);
      setSelectedCharacter(defaultCharacter); // ← KAISEL FIX ICI

      // 📦 Chargement du build actif (si existe)
      if (defaultCharacter && currentAccount.builds?.[defaultCharacter]) {
        const build = currentAccount.builds[defaultCharacter];
        console.log(`🐉 Kaisel: Chargement auto du build ${defaultCharacter}`, build);

        setFlatStats(build.flatStats || {});
        setStatsWithoutArtefact(build.statsWithoutArtefact || {});
        setArtifactsData(build.artifactsData || {});
        setHunterCores(prev => ({
          ...prev,
          [defaultCharacter]: build.hunterCores || {}
        }));
        setHunterWeapons(prev => ({
          ...prev,
          [defaultCharacter]: build.hunterWeapons || {}
        }));
      } else if (defaultCharacter === 'niermann') {
        // Si c'est Niermann par défaut, pas de build à charger
        console.log(`🐉 Kaisel: Niermann par défaut, pas de build à charger`);
      }
      // 🔥 AJOUTE ICI, JUSTE APRÈS setSelectedCharacter :
      if (defaultCharacter && !currentAccount.builds?.[defaultCharacter]) {
        console.log(`🐉 Kaisel: Initialisation artefacts vides pour ${defaultCharacter}`);

        const emptyArtifactsData = {
          Helmet: { mainStat: '', subStats: ['', '', '', ''], mainStatValue: 0, subStatsLevels: [{}, {}, {}, {}], set: '' },
          Chest: { mainStat: '', subStats: ['', '', '', ''], mainStatValue: 0, subStatsLevels: [{}, {}, {}, {}], set: '' },
          Gloves: { mainStat: '', subStats: ['', '', '', ''], mainStatValue: 0, subStatsLevels: [{}, {}, {}, {}], set: '' },
          Boots: { mainStat: '', subStats: ['', '', '', ''], mainStatValue: 0, subStatsLevels: [{}, {}, {}, {}], set: '' },
          Necklace: { mainStat: '', subStats: ['', '', '', ''], mainStatValue: 0, subStatsLevels: [{}, {}, {}, {}], set: '' },
          Bracelet: { mainStat: '', subStats: ['', '', '', ''], mainStatValue: 0, subStatsLevels: [{}, {}, {}, {}], set: '' },
          Ring: { mainStat: '', subStats: ['', '', '', ''], mainStatValue: 0, subStatsLevels: [{}, {}, {}, {}], set: '' },
          Earrings: { mainStat: '', subStats: ['', '', '', ''], mainStatValue: 0, subStatsLevels: [{}, {}, {}, {}], set: '' },
        };

        setArtifactsData(emptyArtifactsData);
      }

      // ⚔️ Données hors build
      setHunterWeapons(currentAccount.hunterWeapons || {});
      setHunterCores(currentAccount.hunterCores || {});

      // 💎 KAISEL FIX : Charger les gemmes du compte actif (pas global!)
      setGemData(currentAccount.gems || {});
      console.log(`🐉 Kaisel: Gemmes chargées pour compte ${userData.activeAccount}:`, currentAccount.gems);

      setIsBuildsReady(true);
    } catch (error) {
      console.error("❌ Erreur localStorage :", error);
      localStorage.setItem("builderberu_users", JSON.stringify({ user: defaultUserData }));
      setMergedUser(defaultUserData);
      setAccounts(defaultUserData.accounts);
      setActiveAccount("main");
      setRecentBuilds([]);
      setSelectedCharacter('niermann'); // Fallback en cas d'erreur
      setGemData({});
    }
  }, []);

  const updateArtifactFromOCR = (parsedData) => {
    setArtifacts(prev => {
      const updated = { ...prev }; // ✅ Copie objet
      const type = parsedData.type;
      const current = updated[type];

      if (!current) return prev;

      updated[type] = {
        ...current,
        mainStat: parsedData.mainStat,
        subStats: parsedData.subStats,
        procValue: parsedData.procValue || current.procValue || null
      };


      // Maj artifactsData (utilisé dans ArtifactCard)
      setArtifactsData(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          mainStat: parsedData.mainStat?.stat || '',
          mainStatValue: parsedData.mainStat?.value || 0,
          subStats: parsedData.subStats.map(s => s.stat),
          subStatsLevels: parsedData.subStats.map(s => ({
            level: s.proc || 0,
            value: s.value || 0,
            procOrders: Array(s.proc).fill(0).map((_, i) => i), // ordre factice
            procValues: Array(s.proc).fill(s.value / (s.proc || 1)) // valeur répartie
          }))
        }
      }));


      return updated;
    });
  };

  const handleImportBuild = () => {
    if (isTankSpeaking.current) return;
    showTankMessage("You have 5 seconds to paste your build (CTRL+V)...", true);

    const handleKeyDown = async (event) => {
      if (event.ctrlKey && event.key === 'v') {
        try {
          const text = await navigator.clipboard.readText();
          const decoded = atob(text);
          if (!decoded.endsWith(salt)) {
            showTankMessage("Corrupted import 😶‍🌫️");
            return;
          }

          const jsonData = decoded.replace(salt, '');
          const imported = JSON.parse(jsonData);

          const isSingleBuild = imported.flatStats && imported.statsWithoutArtefact && imported.artifactsData;

          if (isSingleBuild) {
            // 🧱 Format simple : build unique
            const build = {
              flatStats: imported.flatStats,
              statsWithoutArtefact: imported.statsWithoutArtefact,
              artifactsData: imported.artifactsData,
              hunterCores: imported.hunterCores,
            };

            setFlatStats(build.flatStats);
            setStatsWithoutArtefact(build.statsWithoutArtefact);
            setArtifactsData(build.artifactsData);
            setHunterCores(build.hunterCores);

            saveToLocalStorage({
              builds: {
                ...accounts[activeAccount]?.builds,
                [selectedCharacter]: build,
              },
            });

            showTankMessage("Single build imported for current character 🥸");
            setIsImportedBuild(true);

          } else if (
            typeof imported === 'object' &&
            Object.keys(imported).some((key) =>
              imported[key]?.flatStats && imported[key]?.artifactsData
            )
          ) {
            // 📦 Nouveau format : multi builds (plus de build_ 🔥)
            const importedBuilds = {};
            Object.entries(imported).forEach(([charName, build]) => {
              if (build.flatStats && build.artifactsData) {
                importedBuilds[charName] = build;
              }
            });

            const updates = {
              builds: {
                ...accounts[activeAccount]?.builds,
                ...importedBuilds,
              },
            };

            if (imported.recentBuilds) {
              updates.recentBuilds = imported.recentBuilds;
              setRecentBuilds(imported.recentBuilds);
              showTankMessage("Builds & Icons imported with success 😎", true);
            } else {
              showTankMessage("Builds imported (no icons info) 😶", true);
            }

            saveToLocalStorage(updates);
            setIsImportedBuild(true);

          } else {
            showTankMessage("Invalid build format 😢", true);
          }

        } catch (err) {
          showTankMessage("Invalid or unreadable JSON format 😵", true);
        }

        window.removeEventListener("keydown", handleKeyDown);
        clearTimeout(timeout);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const timeout = setTimeout(() => {
      window.removeEventListener("keydown", handleKeyDown);
      showTankMessage("⏱️ Import timed out...");
    }, 5000);
  };



  const handleResetStats = () => {
    if (!selectedCharacter || !characterStats[selectedCharacter]) return;

    const name = selectedCharacter;
    const char = characterStats[name];

    simulateWeaponSaveIfMissing(name); // si arme absente, on simule un save

    let weapon = hunterWeapons[name];


    const scale = characters[name]?.scaleStat || 'Attack';
    let mainStat = 0;

    if (scale === 'Defense' || scale === 'Attack') mainStat = 3080;
    else if (scale === 'HP') mainStat = 6120;
    else mainStat = 3080; // Attack ou défaut

    weapon = {
      mainStat,
      precision: 4000,
    };

    // 💾 Force la sauvegarde dans le state + localStorage
    handleSaveWeapon(name, weapon);
    // localStorage.setItem('hunterWeapons', JSON.stringify({
    //   ...hunterWeapons,
    //   [name]: weapon
    // }));

    const cores = hunterCores[name] || {};
    const gems = gemData || {};
    const mergedGems = Object.values(gems).reduce((acc, obj) => {
      for (const [stat, val] of Object.entries(obj || {})) {
        acc[stat] = (acc[stat] || 0) + val;
      }
      return acc;
    }, {});

    // 💠 Step 1 : base + weapon
    let newFlat = getFlatStatsWithWeapon(char, weapon);

    // 💠 Step 2 : copie brute
    let updatedStats = { ...newFlat }; // NE PAS faire completeStats tout de suite

    // 💠 Step 3 : Gems
    for (const [stat, value] of Object.entries(mergedGems)) {
      if (stat.startsWith('Additional ')) {
        applyStatToFlat(stat, value, updatedStats); // brut
      }
    }

    // 💠 Step 4 : Noyaux
    for (const type of ['Offensif', 'Défensif', 'Endurance']) {
      const core = cores[type];
      if (!core) continue;

      if (core.primary?.startsWith('Additional ')) {
        applyStatToFlat(core.primary, parseFloat(core.primaryValue), updatedStats);
      }
      if (core.secondary?.startsWith('Additional ')) {
        applyStatToFlat(core.secondary, parseFloat(core.secondaryValue), updatedStats);
      }
    }

    // ➤ Phase pourcentages – Gems
    for (const [stat, value] of Object.entries(mergedGems)) {
      if (stat.endsWith('%')) {
        const baseStat = stat.replace(' %', '');
        const base = newFlat[baseStat] || 0;
        updatedStats[baseStat] += (base * value) / 100;
      }
    }

    // ➤ Pourcentages – Noyaux
    for (const type of ['Offensif', 'Défensif', 'Endurance']) {
      const core = cores[type];
      if (!core) continue;

      if (core.primary?.endsWith('%')) {
        const baseStat = core.primary.replace(' %', '');
        const base = newFlat[baseStat] || 0;
        updatedStats[baseStat] += (base * parseFloat(core.primaryValue)) / 100;
      }
      if (core.secondary?.endsWith('%')) {
        const baseStat = core.secondary.replace(' %', '');
        const base = newFlat[baseStat] || 0;
        updatedStats[baseStat] += (base * parseFloat(core.secondaryValue)) / 100;
      }
    }

    // 💠 Step 5 : reset artefacts
    const resetArtifacts = {};
    for (const slot in artifactsData) {
      resetArtifacts[slot] = {
        mainStat: '',
        subStats: ['', '', '', ''],
        subStatsLevels: [
          { value: 0, level: 0, procOrders: [], procValues: [] },
          { value: 0, level: 0, procOrders: [], procValues: [] },
          { value: 0, level: 0, procOrders: [], procValues: [] },
          { value: 0, level: 0, procOrders: [], procValues: [] }
        ]
      };
    }

    // ✅ Finalisation
    setFlatStats(completeStats(newFlat));
    setStatsWithoutArtefact(completeStats(updatedStats));
    setStatsFromArtifacts(completeStats({}));
    setArtifactsData(resetArtifacts);

    // showTankMessage(`🧹 ${name} reset complet. Tu repars de zéro, mais puissant 😌`);
    console.log("Flat DEF", flatStats["Defense"]);
    console.log("Final DEF", statsWithoutArtefact["Defense"]);

  };
  const playMusic = () => {
    if (darkAriaAudioRef.current) {
      darkAriaAudioRef.current.play().catch((e) => {
        console.warn("Playback failed", e);
      });
    }
  };


  // 🧹 Fonction de nettoyage (inchangée)
  const handleAccountSwitchCleanup = (accountName, recentBuilds) => {
    console.log(`🐉 Kaisel: Nettoyage du compte ${accountName}`);

    const filteredRecent = recentBuilds.filter(charKey =>
      characters[charKey] && accounts[accountName]?.builds?.[charKey]
    );

    // Mise à jour avec la liste nettoyée
    const updatedAccounts = {
      ...accounts,
      [accountName]: {
        ...accounts[accountName],
        recentBuilds: filteredRecent
      }
    };

    setAccounts(updatedAccounts);
    setRecentBuilds(filteredRecent);

    // Sauvegarder dans localStorage
    const storage = JSON.parse(localStorage.getItem("builderberu_users")) || {};
    if (storage.user?.accounts?.[accountName]) {
      storage.user.accounts[accountName].recentBuilds = filteredRecent;
      localStorage.setItem("builderberu_users", JSON.stringify(storage));
    }

    // Réessayer le chargement avec la liste propre
    if (filteredRecent.length > 0) {
      console.log(`🐉 Kaisel: Retry après nettoyage avec ${filteredRecent[0]}`);
      setTimeout(() => {
        handleClickBuildIcon(filteredRecent[0]);
      }, 150);
    } else {
      setSelectedCharacter('');
      showTankMessage(`🧹 Compte "${accountName}" nettoyé. Aucun build valide.`, true);
    }
  };

  // 🐉 Kaisel Correction 2/2 - 18/01/2025
  // Fix : Gemmes dépendantes du compte (pas globales)

  // 1️⃣ MISE À JOUR handleSaveBuild pour sauvegarder les gemmes du compte
  const handleSaveBuild = () => {
    if (!selectedCharacter) return;

    const build = {
      flatStats,
      statsWithoutArtefact,
      artifactsData,
      hunterCores: hunterCores[selectedCharacter] || {},
      hunterWeapons: hunterWeapons[selectedCharacter] || {},
    };

    if (isImportedBuild) {
      setShowImportSaveWarning(true);
      return;
    }

    // 📦 Chargement localStorage
    const storedData = JSON.parse(localStorage.getItem("builderberu_users")) || {};
    storedData.user = storedData.user || {};
    storedData.user.accounts = storedData.user.accounts || {};
    storedData.user.accounts[activeAccount] = storedData.user.accounts[activeAccount] || {};

    const currentAccount = storedData.user.accounts[activeAccount];

    // 🔄 Mise à jour des builds
    currentAccount.builds = currentAccount.builds || {};
    currentAccount.builds[selectedCharacter] = build;

    // 🔁 Recent builds
    let recent = Array.isArray(currentAccount.recentBuilds) ? [...currentAccount.recentBuilds] : [];
    recent = recent.filter((id) => id !== selectedCharacter);
    recent.unshift(selectedCharacter);
    recent = recent.slice(0, 5);
    recent = recent.filter((id) => characters[id]);
    currentAccount.recentBuilds = recent;

    // ✅ Hunter cores
    currentAccount.hunterCores = {
      ...currentAccount.hunterCores,
      [selectedCharacter]: hunterCores[selectedCharacter] || {},
    };

    // 💎 KAISEL FIX : Sauvegarder les gemmes DU COMPTE ACTIF
    currentAccount.gems = gemData || {};
    console.log(`🐉 Kaisel: Sauvegarde gemmes pour compte ${activeAccount}:`, gemData);

    // 💾 Sauvegarde localStorage
    localStorage.setItem("builderberu_users", JSON.stringify(storedData));

    // 🔧 Mise à jour du state React accounts
    setAccounts(prevAccounts => {
      const updatedAccounts = {
        ...prevAccounts,
        [activeAccount]: {
          ...prevAccounts[activeAccount],
          builds: {
            ...prevAccounts[activeAccount]?.builds,
            [selectedCharacter]: build
          },
          recentBuilds: recent,
          hunterCores: {
            ...prevAccounts[activeAccount]?.hunterCores,
            [selectedCharacter]: hunterCores[selectedCharacter] || {}
          },
          gems: gemData || {} // ← KAISEL FIX : Gemmes par compte
        }
      };

      console.log("✅ Updated accounts state:", updatedAccounts[activeAccount].recentBuilds);
      return updatedAccounts;
    });

    // 🔁 Mise à jour des autres states React
    setRecentBuilds([...recent]);
    setMergedUser(prevUser => ({
      ...prevUser,
      accounts: {
        ...prevUser.accounts,
        [activeAccount]: {
          ...prevUser.accounts[activeAccount],
          builds: {
            ...prevUser.accounts[activeAccount]?.builds,
            [selectedCharacter]: build
          },
          recentBuilds: recent,
          gems: gemData || {} // ← KAISEL FIX : Gemmes par compte
        }
      }
    }));

    setIsBuildsReady(true);
    showTankMessage(`✅ Build sauvegardé pour ${selectedCharacter}!`, true);
  };


  const handleLoadBuild = (characterKey) => {
    const key = characterKey || selectedCharacter;
    if (!key) return;

    const storedData = JSON.parse(localStorage.getItem("builderberu_users"));
    const build = storedData?.user?.accounts?.[activeAccount]?.builds?.[key];

    if (build) {
      setFlatStats(build.flatStats || {});
      setStatsWithoutArtefact(build.statsWithoutArtefact || {});
      setArtifactsData(build.artifactsData || {});
      setHunterCores(prev => ({
        ...prev,
        [key]: build.hunterCores || {}
      }));
      setHunterWeapons(prev => ({
        ...prev,
        [key]: build.hunterWeapons || {}
      }));

      if (selectedCharacter !== key) {
        setSelectedCharacter(key);
      }

      showTankMessage(`Build for ${key} loaded! 😈`);
    } else {
      showTankMessage(`No saved build for ${key} yet! 😶`);
    }
  };


  const isMobile = useResponsive();



  // useEffect(() => {
  //   const recent = JSON.parse(localStorage.getItem('recentBuilds') || '[]');
  //   if (recent.length > 0) {
  //     setSelectedCharacter(recent[0]); // premier build dispo
  //     handleLoadBuild(recent[0]);
  //   } else {
  //     setSelectedCharacter('niermann'); // Chae à poil sinon haha
  //   }
  // }, []);

  const simulateWeaponSaveIfMissing = (hunterKey) => {
    if (!hunterWeapons[hunterKey]) {
      const scale = characters[hunterKey]?.scaleStat || 'Attack';
      let mainStat = 0;

      if (scale === 'Defense') mainStat = 3080;
      else if (scale === 'HP') mainStat = 6120;
      else mainStat = 3080;

      const defaultWeapon = {
        mainStat,
        precision: 4000,
      };

      handleSaveWeapon(hunterKey, defaultWeapon); // suffit !
    }
  };


  useEffect(() => {
    if (!selectedCharacter) return;
    simulateWeaponSaveIfMissing(selectedCharacter);
  }, [selectedCharacter]);

  const [editStatsMode, setEditStatsMode] = useState(false);
  const getEditLabel = () => t(editStatsMode ? 'save' : 'modify');

  const getFlatStatsWithWeapon = (char, weapon = {}) => {

    const scaleStat = char?.scaleStat || '';
    const weaponBoost = weapon.mainStat || 0;
    const weapPrecision = weapon.precision || 0.

    return {
      'Attack': (char?.attack || 0) + (scaleStat === 'Attack' ? weaponBoost : 0),
      'Defense': (char?.defense || 0) + (scaleStat === 'Defense' ? weaponBoost : 0),
      'HP': (char?.hp || 0) + (scaleStat === 'HP' ? weaponBoost : 0),
      'Critical Hit Rate': char?.critRate || 0,
      'Critical Hit Damage': 0,
      'Defense Penetration': 0,
      'Additional MP': 0,
      'Additional Attack': 0,
      'Healing Given Increase (%)': 0,
      'Damage Increase': 0,
      'MP': 0,
      'MP Consumption Reduction': 0,
      'Damage Reduction': 0,
      'MP Recovery Rate Increase (%)': 0,
      'Precision': weapPrecision, // ✅ Ajouté ici
    };
  };
  const defaultCharacter = selectedCharacter && characterStats[selectedCharacter];

  const [flatStats, setFlatStats] = useState(() =>
    completeStats(getFlatStatsWithWeapon(defaultCharacter, hunterWeapons[defaultCharacter?.name] || {}))
  );


  const [statsWithoutArtefact, setStatsWithoutArtefact] = useState({
    Attack: 0,
    Defense: 0,
    HP: 0,
    'Critical Hit Rate': 0,
    'Critical Hit Damage': 0,
    'Defense Penetration': 0,
    'Healing Given Increase (%)': 0,
    'Damage Increase': 0,
    'MP Consumption Reduction': 0,
    'Damage Reduction': 0,
    'MP Recovery Rate Increase (%)': 0,
    'Additional Attack': 0,
    'Additional MP': 0,
    'MP': 0,
  });


  const [finalStatsWithoutArtefact, setFinalStatsWithoutArtefact] = useState({
    Attack: 0,
    Defense: 0,
    HP: 0,
    'Critical Hit Rate': 0,
    'Critical Hit Damage': 0,
    'Defense Penetration': 0,
    'Healing Given Increase (%)': 0,
    'Damage Increase': 0,
    'MP Consumption Reduction': 0,
    'Damage Reduction': 0,
    'MP Recovery Rate Increase (%)': 0,
    'Additional Attack': 0,
    'Additional MP': 0,
    'MP': 0,
  });

  const [statsFromArtifacts, setStatsFromArtifacts] = useState({
    Attack: 0,
    Defense: 0,
    HP: 0,
    'Critical Hit Rate': 0,
    'Critical Hit Damage': 0,
    'Defense Penetration': 0,
    'Healing Given Increase (%)': 0,
    'Additional MP': 0,
    'Damage Increase': 0,
    'MP Consumption Reduction': 0,
    'Damage Reduction': 0,
    'MP Recovery Rate Increase (%)': 0,
    'Additional Attack': 0,
    'MP': 0,
  });




  const handleFlatStatChange = (stat, value) => {
    setFlatStats(prev => ({
      ...prev,
      [stat]: value
    }));
  };


  const [selectedElement, setSelectedElement] = useState(null); // 'Fire', 'Water', etc
  const [selectedClass, setSelectedClass] = useState(null);     // 'Tank', 'DPS', 'Support'

  const handleElementClick = (element) => {
    setSelectedElement(prev => prev === element ? null : element);
  };

  const handleClassClick = (classType) => {
    setSelectedClass(prev => prev === classType ? null : classType);
  };


  const getElementColor = (element) => {
    if (!element) return '#888'; // Protection au cas où

    switch (element) {
      case 'Fire': return '#ff4500';
      case 'Water': return '#00bfff';
      case 'Light': return '#ffd700';
      case 'Dark': return '#8a2be2';
      case 'Wind': return '#00ff7f';
      default: return '#888';
    }
  };
  useEffect(() => {
    darkAriaAudioRef.current = new Audio('https://res.cloudinary.com/dbg7m8qjd/video/upload/v1747651426/sla_darkAria_udsn6t.mp3');
  }, []);


  useEffect(() => {
    recalculateStatsFromArtifacts();
  }, [hunterCores, artifactsData, gemData, selectedCharacter]);

  const [baseStats, setBaseStats] = useState({
    'Attack': defaultCharacter?.attack || 0,
    'Defense': defaultCharacter?.defense || 0,
    'HP': defaultCharacter?.hp || 0,
    'Critical Hit Rate': defaultCharacter?.critRate || 0,
    'Critical Hit Damage': 0,
    'Defense Penetration': 0,
    'Healing Given Increase (%)': 0,
    'Damage Increase': 0,
    'MP Consumption Reduction': 0,
    'Damage Reduction': 0,
    'MP Recovery Rate Increase (%)': 0,
    'Additional MP': 0,
    'MP': 0,
  });

  const computeStatsWithoutArtefact = (flatStats, gemData, noyaux) => {
    const allBonuses = {
      'Attack': 0,
      'HP': 0,
      'Defense': 0,
      'Critical Hit Rate': 0,
      'Critical Hit Damage': 0,
      'Defense Penetration': 0,
      'Healing Given Increase (%)': 0,
      'Additional MP': 0,
      'Damage Increase': 0,
      'MP Consumption Reduction': 0,
      'Damage Reduction': 0,
      'MP Recovery Rate Increase (%)': 0,
      'MP': 0,
    };

    const percentMap = {
      'Attack %': 'Attack',
      'HP %': 'HP',
      'Defense %': 'Defense'
    };

    const additionalMap = {
      'Additional Attack': 'Attack',
      'Additional HP': 'HP',
      'Additional Defense': 'Defense',
      'Additional MP': 'MP',
    };




    const allSources = [gemData, ...Object.values(noyaux || {})];

    // Phase de fusion
    for (const source of allSources) {
      for (const [stat, value] of Object.entries(source || {})) {
        if (percentMap[stat]) {
          const base = flatStats[percentMap[stat]] || 0;
          allBonuses[percentMap[stat]] += base * (value / 100);
        } else if (additionalMap[stat]) {
          allBonuses[additionalMap[stat]] += value;
        } else {
          // S'il n'existe pas encore, on initialise
          if (!(stat in allBonuses)) {
            allBonuses[stat] = 0;
          }
          allBonuses[stat] += value;
        }
      }
    }

    return {
      'Attack': Math.round((flatStats.Attack || 0) + allBonuses.Attack),
      'HP': Math.round((flatStats.HP || 0) + allBonuses.HP),
      'Defense': Math.round((flatStats.Defense || 0) + allBonuses.Defense),
      'Critical Hit Rate': Math.round((flatStats['Critical Hit Rate'] || 0) + allBonuses['Critical Hit Rate']),
      'Critical Hit Damage': Math.round((flatStats['Critical Hit Damage'] || 0) + allBonuses['Critical Hit Damage']),
      'MP': Math.round((flatStats['MP'] || 0) + allBonuses['MP']),
      'Defense Penetration': Math.round((flatStats['Defense Penetration'] || 0) + allBonuses['Defense Penetration']),
      'Additional MP': Math.round((flatStats['Additional MP'] || 0) + allBonuses['Additional MP']),
      'Healing Given Increase (%)': Math.round((flatStats['Healing Given Increase (%)'] || 0) + allBonuses['Healing Given Increase (%)']),
      'Damage Increase': Math.round((flatStats['Damage Increase'] || 0) + allBonuses['Damage Increase']),
      'MP Consumption Reduction': Math.round((flatStats['MP Consumption Reduction'] || 0) + allBonuses['MP Consumption Reduction']),
      'Damage Reduction': Math.round((flatStats['Damage Reduction'] || 0) + allBonuses['Damage Reduction']),
      'MP Recovery Rate Increase (%)': Math.round((flatStats['MP Recovery Rate Increase (%)'] || 0) + allBonuses['MP Recovery Rate Increase (%)']),

    };
  };


  useEffect(() => {
    const allSources = [];

    // A. GEMMES
    const mergedGemStats = Object.values(gemData || {}).reduce((acc, gemCategory) => {
      for (const [stat, value] of Object.entries(gemCategory || {})) {
        acc[stat] = (acc[stat] || 0) + value;
      }
      return acc;
    }, {});
    allSources.push(mergedGemStats);

    // B. NOYAUX
    const coreStats = hunterCores[selectedCharacter] || {};
    for (const type of ['Offensif', 'Défensif', 'Endurance']) {
      const raw = coreStats[type];
      if (!raw) continue;

      const parsedCore = {};
      if (raw.primary && raw.primaryValue) {
        parsedCore[raw.primary] = raw.primaryValue;
      }
      if (raw.secondary && raw.secondaryValue) {
        parsedCore[raw.secondary] = raw.secondaryValue;
      }
      allSources.push(parsedCore);
    }

    // C. FUSION TOTALE
    const mergedStats = {};
    for (const source of allSources) {
      for (const [stat, value] of Object.entries(source || {})) {
        mergedStats[stat] = (mergedStats[stat] || 0) + value;
      }
    }

    // D. INJECTION FINAL – sur base flat
    const baseStats = completeStats({ ...flatStats }); // flat = base + weapon
    const updatedStats = { ...baseStats };

    for (const key of ['Attack', 'Defense', 'HP', 'MP']) {
      const flat = baseStats[key] || 0;
      const additional = mergedStats[`Additional ${key}`] || 0;
      const percent = mergedStats[`${key} %`] || 0;

      updatedStats[key] = flat + additional + (flat * percent) / 100;
    }

    // E. Les autres stats (pas Attack, Defense, HP)
    for (const [stat, value] of Object.entries(mergedStats)) {
      if (!['Attack', 'Defense', 'HP', 'MP'].includes(stat) &&
        !stat.startsWith('Additional ') &&
        !stat.endsWith('%')) {
        updatedStats[stat] = (updatedStats[stat] || 0) + value;
      }
    }


    setStatsWithoutArtefact(updatedStats);
    const finalStatsWithoutArtefact = completeStats(updatedStats);
    setFinalStatsWithoutArtefact(finalStatsWithoutArtefact);


    // G. Mise à jour des stats finales AVEC artefacts
    const finalStats = recalculateStatsFromArtifacts(statsFromArtifacts);
    const a = "test";
  }, [flatStats, gemData, hunterCores, selectedCharacter]);



  useEffect(() => {
    if (!selectedCharacter || !characters[selectedCharacter]) return;

    const char = characters[selectedCharacter];
    const charStats = characterStats[selectedCharacter];
    if (!charStats) return; // <-- protège ici contre undefined

    const weapon = hunterWeapons[selectedCharacter] || {};
    const scaleStat = char.scaleStat;
    const weaponBoost = weapon.mainStat || 0;
    setFlatStats(prev =>
      completeStats({
        ...prev,
        'Attack': charStats.attack + (scaleStat === 'Attack' ? weaponBoost : 0),
        'Defense': charStats.defense + (scaleStat === 'Defense' ? weaponBoost : 0),
        'HP': charStats.hp + (scaleStat === 'HP' ? weaponBoost : 0),
        'Critical Hit Rate': charStats.critRate,
        'Critical Hit Damage': 0,
        'Defense Penetration': 0,
        'Healing Given Increase (%)': 0,
        'Additional MP': 0,
        'Damage Increase': 0,
        'MP Consumption Reduction': 0,
        'Damage Reduction': 0,
        'MP Recovery Rate Increase (%)': 0,
        'MP': 0

      })
    );
  }, [selectedCharacter, hunterWeapons]);




  useEffect(() => {
    if (showNarrative) {
      const isFrench = navigator.language.startsWith("fr"); // ou ton propre détecteur de langue
      const selectedNarrative = isFrench ? mobileNarrativeTextFr : mobileNarrativeTextEn;

      const steps = parseNarrative(selectedNarrative);
      runNarrativeSteps(steps, {
        refs,
        setCurrentImage,
        dytextRef,
        setShowNarrative,
        triggerFadeOutAllMusic,
        playingAudiosRef,
      });
    }
  }, [showNarrative]);

  useEffect(() => {
    if (showSernPopup) {
      const randomIndex = Math.floor(Math.random() * sernTracks.length);
      const randomTrack = sernTracks[randomIndex];
      const audio = new Audio(randomTrack);
      audio.volume = 0.6;
      audio.play();
      sernAudioRef.current = audio;

    } else {
      // Stop musique avec fade-out progressif
      if (sernAudioRef.current) {
        const audio = sernAudioRef.current;
        let currentVolume = audio.volume;

        // Nettoie un éventuel ancien timer
        if (playingAudiosRef.current) clearInterval(playingAudiosRef.current);

        playingAudiosRef.current = setInterval(() => {
          if (currentVolume > 0.01) {
            currentVolume -= 0.02;
            audio.volume = Math.max(currentVolume, 0);
          } else {
            audio.pause();
            audio.currentTime = 0;
            sernAudioRef.current = null;
            clearInterval(playingAudiosRef.current);
          }
        }, 100); // tous les 100ms, fade progressif
      }
    }
  }, [showSernPopup]);




  useEffect(() => {
    if (!showSernPopup || !popupRef.current) return;

    const scrollInterval = setInterval(() => {
      popupRef.current.scrollBy({ top: 20, behavior: 'smooth' });
    }, 300);

    return () => clearInterval(scrollInterval);
  }, [showSernPopup]);

  useEffect(() => {
    if (showSernPopup) {
      try {
        const encoded = mystSernMsg.message[Math.floor(Math.random() * mystSernMsg.message.length)];
        const decoded = decodeURIComponent(escape(atob(encoded)));

        dytextAnimate(dytextRef, decoded, 30, {
          onComplete: () => {

            setTimeout(() => {
              triggerFadeOutAllMusic();;
            }, 13000);
            setTimeout(() => {
              setShowSernPopup(false);
            }, 10000); // 10 sec après le texte
          },
        });
      } catch (error) {
        console.warn("💥 Le SERN a corrompu un message encodé :", error);
      }
    }
  }, [showSernPopup]);



  //   useEffect(() => {
  //     if (showSernPopup) {
  //       dytextAnimate(dytextRef, `Chargement du jugement... Analyse des logs en cours...
  // Détection de comportements suspects : > Sauvegarde répétée du personnage Jo, > Tentative de corruption de Tank avec des gemmes de bas niveau.

  // Connexion au SERN... Échange d'infos avec BobbyJones... terminé.
  // 📡 Rapport : "Il a cliqué 7 fois sur 'Save' en moins de 30 secondes."

  // Conseil Gagold : Tank s'est roulé par terre. 😐
  // Sung Jin-Woo : "On perd notre temps. Qu'on l'écrase."

  // Calcul de la sentence... Unités d'ombre : OK. Béru : OK 😈. Tank : mange une pomme 🍎

  // ⏳ Check final : Pulls inutiles : 42, Fails de boss : 3, Présence en raid : 0.4%

  // ⚖️ Verdict : Jo coupable d'abus de 'Save'. 📢 Gagold vous déclare la guerre. Préparez-vous.`);
  //     }
  //   }, [showSernPopup]);


  useEffect(() => {
    if (selectedCharacter && characterStats[selectedCharacter]) {
      const char = characterStats[selectedCharacter];
      const newStats = {
        'Attack': char.attack,
        'Defense': char.defense,
        'HP': char.hp,
        'Critical Hit Rate': char.critRate,
        'Critical Hit Damage': 0,
        'Defense Penetration': 0,
        'Additional Attack': 0,
        'Healing Given Increase (%)': 0,
        'Additional MP': 0,
        'Damage Increase': 0,
        'MP Consumption Reduction': 0,
        'Damage Reduction': 0,
        'MP Recovery Rate Increase (%)': 0,
        'MP': 0,

      };
    }
  }, [selectedCharacter]);
  const [joSaveCount, setJoSaveCount] = useState(0);
  const [kanaeSaveCount, setKanaeSaveCount] = useState(0);
  const [recentBuilds, setRecentBuilds] = useState([]);
  const [isImportedBuild, setIsImportedBuild] = useState(false);
  const [showImportSaveWarning, setShowImportSaveWarning] = useState(false);
  const [tankClickCount, setTankClickCount] = useState(0);


  // 🐉 Kaisel Detective - 18/01/2025
  // Debug COMPLET de handleClickBuildIcon pour voir où ça bloque

  const handleClickBuildIcon = (characterName) => {
    console.log(`🐉 Kaisel DEBUG: ===== DÉBUT handleClickBuildIcon(${characterName}) =====`);

    // 🔍 Vérification 1 : activeAccount
    console.log(`🐉 Kaisel DEBUG: activeAccount actuel:`, activeAccount);

    // 🔍 Vérification 2 : localStorage
    const stored = JSON.parse(localStorage.getItem("builderberu_users"));
    console.log(`🐉 Kaisel DEBUG: localStorage complet:`, stored);


    if (stored?.artifactsData) {
      let modified = false;
      const updated = {};

      for (const slot in stored.artifactsData) {
        updated[slot] = {
          ...stored.artifactsData[slot],
          set: stored.artifactsData[slot].set || '',
        };
        if (!stored.artifactsData[slot].set) modified = true;
      }

      if (modified) {
        localStorage.setItem("builderberu_users", JSON.stringify({
          ...stored,
          artifactsData: updated,
        }));
        setArtifactsData(updated);
      }
    }

    // 🔍 Vérification 3 : accounts disponibles
    console.log(`🐉 Kaisel DEBUG: accounts disponibles:`, Object.keys(stored?.user?.accounts || {}));

    // 🔍 Vérification 4 : path complet
    const userAccounts = stored?.user?.accounts;
    console.log(`🐉 Kaisel DEBUG: userAccounts:`, userAccounts);

    const targetAccount = userAccounts?.[activeAccount];
    console.log(`🐉 Kaisel DEBUG: targetAccount [${activeAccount}]:`, targetAccount);

    const builds = targetAccount?.builds;
    console.log(`🐉 Kaisel DEBUG: builds dans ${activeAccount}:`, builds);

    const build = builds?.[characterName];
    console.log(`🐉 Kaisel DEBUG: build [${characterName}]:`, build);

    if (!build) {
      console.log(`🐉 Kaisel DEBUG: ❌ Pas de build trouvé pour ${characterName} dans compte ${activeAccount}`);
      showTankMessage(`Aucun build sauvegardé pour ${characterName} 😶`, true);
      return;
    }

    console.log(`🐉 Kaisel DEBUG: ✅ Build trouvé! Chargement...`);

    // 📦 CHARGEMENT COMPLET de TOUTES les données du build

    // 1️⃣ Personnage sélectionné
    console.log(`🐉 Kaisel DEBUG: setSelectedCharacter(${characterName})`);
    setSelectedCharacter(characterName);

    // 2️⃣ Stats de base
    console.log(`🐉 Kaisel DEBUG: setFlatStats`, build.flatStats);
    setFlatStats(build.flatStats || {});

    console.log(`🐉 Kaisel DEBUG: setStatsWithoutArtefact`, build.statsWithoutArtefact);
    setStatsWithoutArtefact(build.statsWithoutArtefact || {});

    // 3️⃣ Artefacts complets
    console.log(`🐉 Kaisel DEBUG: setArtifactsData`, build.artifactsData);
    setArtifactsData(build.artifactsData || {});

    // 4️⃣ Hunter cores
    console.log(`🐉 Kaisel DEBUG: setHunterCores pour ${characterName}`, build.hunterCores);
    setHunterCores(prev => ({
      ...prev,
      [characterName]: build.hunterCores || {}
    }));

    // 5️⃣ Hunter weapons
    console.log(`🐉 Kaisel DEBUG: setHunterWeapons pour ${characterName}`, build.hunterWeapons);
    setHunterWeapons(prev => ({
      ...prev,
      [characterName]: build.hunterWeapons || {}
    }));

    // 6️⃣ Gemmes du compte
    if (build.gems) {
      console.log(`🐉 Kaisel DEBUG: setGemData`, build.gems);
      setGemData(build.gems);
    }

    // 7️⃣ Message de confirmation
    showTankMessage(`✅ ${characters[characterName]?.name || characterName} chargé !`, true);

    console.log(`🐉 Kaisel DEBUG: ===== FIN handleClickBuildIcon =====`);
  };


  // 2️⃣ REMPLACE ta fonction handleAccountSwitch par cette version smooth :
  const handleAccountSwitch = async (newAccountName) => {
    console.log(`🐉 Kaisel SMOOTH: ===== SWITCH vers ${newAccountName} =====`);

    // 🎭 MASQUER l'interface pendant le switch
    setIsAccountSwitching(true);

    // 📦 LECTURE DIRECTE dans localStorage
    const storedData = JSON.parse(localStorage.getItem("builderberu_users")) || {};
    const allAccounts = storedData?.user?.accounts || {};

    if (!allAccounts[newAccountName]) {
      console.error(`🐉 Kaisel: ERREUR - Compte "${newAccountName}" introuvable !`);
      showTankMessage(`Compte "${newAccountName}" introuvable !`, true);
      setIsAccountSwitching(false);
      return;
    }

    const newAccountData = allAccounts[newAccountName];
    const recentBuilds = newAccountData.recentBuilds || [];

    // 🧹 RESET COMPLET - BATCH UPDATE pour éviter les re-renders multiples
    const emptyArtifactsData = {
      Helmet: {
        mainStat: '', subStats: ['', '', '', ''], mainStatValue: 0, subStatsLevels: [
          { value: 0, level: 0, procOrders: [], procValues: [] },
          { value: 0, level: 0, procOrders: [], procValues: [] },
          { value: 0, level: 0, procOrders: [], procValues: [] },
          { value: 0, level: 0, procOrders: [], procValues: [] }
        ], set: ''
      },
      Chest: {
        mainStat: '', subStats: ['', '', '', ''], mainStatValue: 0, subStatsLevels: [
          { value: 0, level: 0, procOrders: [], procValues: [] },
          { value: 0, level: 0, procOrders: [], procValues: [] },
          { value: 0, level: 0, procOrders: [], procValues: [] },
          { value: 0, level: 0, procOrders: [], procValues: [] }
        ], set: ''
      },
      Gloves: {
        mainStat: '', subStats: ['', '', '', ''], mainStatValue: 0, subStatsLevels: [
          { value: 0, level: 0, procOrders: [], procValues: [] },
          { value: 0, level: 0, procOrders: [], procValues: [] },
          { value: 0, level: 0, procOrders: [], procValues: [] },
          { value: 0, level: 0, procOrders: [], procValues: [] }
        ], set: ''
      },
      Boots: {
        mainStat: '', subStats: ['', '', '', ''], mainStatValue: 0, subStatsLevels: [
          { value: 0, level: 0, procOrders: [], procValues: [] },
          { value: 0, level: 0, procOrders: [], procValues: [] },
          { value: 0, level: 0, procOrders: [], procValues: [] },
          { value: 0, level: 0, procOrders: [], procValues: [] }
        ], set: ''
      },
      Necklace: {
        mainStat: '', subStats: ['', '', '', ''], mainStatValue: 0, subStatsLevels: [
          { value: 0, level: 0, procOrders: [], procValues: [] },
          { value: 0, level: 0, procOrders: [], procValues: [] },
          { value: 0, level: 0, procOrders: [], procValues: [] },
          { value: 0, level: 0, procOrders: [], procValues: [] }
        ], set: ''
      },
      Bracelet: {
        mainStat: '', subStats: ['', '', '', ''], mainStatValue: 0, subStatsLevels: [
          { value: 0, level: 0, procOrders: [], procValues: [] },
          { value: 0, level: 0, procOrders: [], procValues: [] },
          { value: 0, level: 0, procOrders: [], procValues: [] },
          { value: 0, level: 0, procOrders: [], procValues: [] }
        ], set: ''
      },
      Ring: {
        mainStat: '', subStats: ['', '', '', ''], mainStatValue: 0, subStatsLevels: [
          { value: 0, level: 0, procOrders: [], procValues: [] },
          { value: 0, level: 0, procOrders: [], procValues: [] },
          { value: 0, level: 0, procOrders: [], procValues: [] },
          { value: 0, level: 0, procOrders: [], procValues: [] }
        ], set: ''
      },
      Earrings: {
        mainStat: '', subStats: ['', '', '', ''], mainStatValue: 0, subStatsLevels: [
          { value: 0, level: 0, procOrders: [], procValues: [] },
          { value: 0, level: 0, procOrders: [], procValues: [] },
          { value: 0, level: 0, procOrders: [], procValues: [] },
          { value: 0, level: 0, procOrders: [], procValues: [] }
        ], set: ''
      },
    };

    // 🔄 UPDATE localStorage d'abord
    const updatedUser = {
      ...storedData.user,
      activeAccount: newAccountName
    };
    storedData.user.activeAccount = newAccountName;
    localStorage.setItem("builderberu_users", JSON.stringify(storedData));

    // ⏱️ Petit délai pour simulation + smoothness
    await new Promise(resolve => setTimeout(resolve, 150));

    // 🎯 BATCH UPDATE - Tout en une fois avec React.unstable_batchedUpdates si disponible
    const batchedUpdate = () => {
      // Reset states
      setArtifactsData(emptyArtifactsData);
      setSelectedCharacter('');
      setFlatStats({});
      setStatsWithoutArtefact({});
      setHunterCores({});
      setHunterWeapons({});

      // Update comptes
      setActiveAccount(newAccountName);
      setMergedUser(updatedUser);
      setAccounts(allAccounts);
      setRecentBuilds(recentBuilds);
      setGemData(newAccountData.gems || {});
    };

    // 🚀 BATCH UPDATE pour éviter les re-renders multiples
    if (window.React && window.React.unstable_batchedUpdates) {
      window.React.unstable_batchedUpdates(batchedUpdate);
    } else {
      batchedUpdate();
    }

    // ⏱️ Autre petit délai avant le chargement du build
    await new Promise(resolve => setTimeout(resolve, 50));

    // 🎯 CHARGEMENT DU BUILD
    if (recentBuilds.length > 0) {
      const firstCharacter = recentBuilds[0];

      if (characters[firstCharacter]) {
        const build = newAccountData.builds?.[firstCharacter];

        if (build) {
          console.log(`🐉 Kaisel SMOOTH: Chargement ${firstCharacter}...`);

          // 📦 CLONAGE PROFOND + BATCH UPDATE FINAL
          const clonedArtifacts = JSON.parse(JSON.stringify(build.artifactsData || emptyArtifactsData));

          const finalUpdate = () => {
            setSelectedCharacter(firstCharacter);
            setFlatStats(build.flatStats || {});
            setStatsWithoutArtefact(build.statsWithoutArtefact || {});
            setArtifactsData(clonedArtifacts);
            setHunterCores(prev => ({
              ...prev,
              [firstCharacter]: build.hunterCores || {}
            }));
            setHunterWeapons(prev => ({
              ...prev,
              [firstCharacter]: build.hunterWeapons || {}
            }));
          };

          if (window.React && window.React.unstable_batchedUpdates) {
            window.React.unstable_batchedUpdates(finalUpdate);
          } else {
            finalUpdate();
          }

          showTankMessage(`✅ ${characters[firstCharacter]?.name} chargé dans "${newAccountName}"!`, true);
        } else {
          setSelectedCharacter('');
        }
      } else {
        setSelectedCharacter('');
      }
    } else {
      setSelectedCharacter('');
      showTankMessage(`📁 Compte "${newAccountName}" vide. Sélectionne un personnage!`, true);
    }

    // 🎭 RÉVÉLER l'interface après 100ms
    setTimeout(() => {
      setIsAccountSwitching(false);
    }, 100);

    console.log(`🐉 Kaisel SMOOTH: ===== FIN SWITCH =====`);
  };

  // 4️⃣ Ajoute cette fonction temporaire pour debug
  window.debugGems = debugLocalStorage;


  useEffect(() => {
    const newStatsFromArtifacts = {
      Attack: 0,
      Defense: 0,
      HP: 0,
      'Additional Attack': 0,
      'Additional Defense': 0,
      'Additional HP': 0,
      'Critical Hit Rate': 0,
      'Critical Hit Damage': 0,
      'Defense Penetration': 0,
      'Healing Given Increase (%)': 0,
      'Additional MP': 0,
      'Damage Increase': 0,
      'MP Consumption Reduction': 0,
      'Damage Reduction': 0,
      'MP Recovery Rate Increase (%)': 0,
      'MP': 0,
    };

    Object.values(artifactsData).forEach(({ mainStat, subStats, subStatsLevels }) => {
      if (!Array.isArray(subStats) || !Array.isArray(subStatsLevels)) return;

      // Calcul main stat (valeur et clé dérivée)
      const mainValue = calculateMainStatValue(mainStat, subStatsLevels);
      const allStats = [
        ...subStats.map((s, i) => ({ stat: s, value: subStatsLevels[i]?.value || 0 })),
        { stat: mainStat, value: mainValue }
      ];

      allStats.forEach(({ stat, value }) => {
        if (!stat || value === 0) return;

        const cleanStat = stat.trim();

        const key = ['Attack', 'HP', 'Defense', 'Critical Hit Rate', 'Critical Hit Damage', 'Additional Attack', 'Additional Defense', 'Additional HP', 'Defense Penetration', 'Healing Given Increase (%)', 'Additional MP', 'Damage Increase', 'MP Consumption Reduction', 'Damage Reduction', 'MP Recovery Rate Increase (%)', 'MP',
        ].find(
          valid => cleanStat === valid || cleanStat === `${valid} %`
        );

        if (!key) return;

        if (stat.endsWith('%')) {
          newStatsFromArtifacts[key] += (flatStats[key] * value / 100);
        } else if (stat.startsWith('Additional ')) {
          const baseStat = stat.replace('Additional ', '');
          newStatsFromArtifacts[baseStat] += value;
        } else {
          newStatsFromArtifacts[key] += value;
        }
      });
    });

    setStatsFromArtifacts(newStatsFromArtifacts);
  }, [artifactsData, flatStats]);


  const finalStats = {};
  for (const key in statsWithoutArtefact) {
    finalStats[key] = statsWithoutArtefact[key] + statsFromArtifacts[key];
  }

  useEffect(() => {
    if (selectedCharacter) {
      setShowHologram(false); // Reset immédiat au changement
      setTimeout(() => {
        setShowHologram(true);
      }, 50); // Légère attente pour que le DOM prenne le changement

      const timer = setTimeout(() => {
        setShowHologram(false);
      }, 2050); // 2 secondes d'effet + 50ms de retard de déclenchement

      return () => clearTimeout(timer); // SUPPRIMER l'ancien timer proprement
    }
  }, [selectedCharacter]);


  // 3️⃣ NOUVEAU useEffect - REMPLACE TON useEffect CANVAS EXISTANT
  useEffect(() => {
    console.log("🐉 Kaisel: Starting Shadow System...");

    const shadowManager = new ShadowManager();
    window.shadowManager = shadowManager;
    shadowManager.setTranslation(t);
    window.getShadowScreenPosition = getShadowScreenPosition;

    const callbacks = {
      showMessage: showTankMessage,
      showBeruMenu: showBeruMenu,
      getSelectedCharacter: () => selectedCharacter
    };

    shadowManager.init(['canvas-left', 'canvas-center', 'canvas-right'], callbacks);
    shadowManager.spawnEntity('tank');
    shadowManager.spawnEntity('beru');

    const keyboardCleanup = shadowManager.setupKeyboardControls();

    return () => {
      shadowManager.cleanup();
      if (keyboardCleanup) keyboardCleanup();
      console.log("🐉 Kaisel: Shadow System cleaned up ✅");
    };
  }, [t]);
  // 4️⃣ FONCTIONS UTILITAIRES pour Beru (à ajouter)
  const triggerBeruAnalysis = (artifactData, hunter) => {
    const shadowManager = window.shadowManager; // Si besoin d'accès global
    // Logique d'analyse Beru
  };


  useEffect(() => {
    if (tankIntervalRef.current) return; // déjà lancé ? on stoppe

    tankIntervalRef.current = setInterval(() => {
      const shouldSpeak = Math.random() < 0.33;
      if (shouldSpeak) {
        const msg = tankPhrases[Math.floor(Math.random() * tankPhrases.length)];
        showTankMessage(msg);
      }
    }, 30000); // toutes les 30 secondes

    return () => {
      clearInterval(tankIntervalRef.current);
      tankIntervalRef.current = null;
    };
  }, []);

  useEffect(() => {
    const wanderInterval = setInterval(() => {
      if (!tankIsWandering && Math.random() < 0.02) { // 2% toutes les 30s
        const directions = ["left", "right", "up", "down"];
        tankDirection = directions[Math.floor(Math.random() * directions.length)];
        tankIsWandering = true;

        const wanderDuration = 2000 + Math.random() * 3000;
        const returnDuration = wanderDuration / 4;
        const originalDirection = tankDirection;

        // Timer de retour
        wanderTimer = setTimeout(() => {
          // Phase de retour
          switch (originalDirection) {
            case 'left': tankDirection = 'right'; break;
            case 'right': tankDirection = 'left'; break;
            case 'up': tankDirection = 'down'; break;
            case 'down': tankDirection = 'up'; break;
          }

          // Nouvelle phase courte de retour
          setTimeout(() => {
            tankIsWandering = false;
            tankDirection = null;
            tank.img.src = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604465/tank_face_n9kxrh.png';
          }, returnDuration);
        }, wanderDuration);
      }
    }, 1000); // toutes les 30 sec

    return () => clearInterval(wanderInterval);
  }, []);

  const currentTimeout = useRef(null);

  // 🧹 CLEANUP au unmount :
  useEffect(() => {
    return () => {
      if (currentTimeout.current) {
        clearTimeout(currentTimeout.current);
      }
    };
  }, []);

  const showTankMessage = (message, priority = false, entityType = 'tank') => {
    // 🛡️ Si Tank parle ET pas prioritaire → queue
    if (isTankSpeaking.current && !priority) {
      messageQueue.current.push({ message, entityType }); // 🔥 STOCKE AUSSI entityType !
      return;
    }

    // 🚀 Si prioritaire, on force l'affichage
    if (priority && isTankSpeaking.current) {
      // Annuler le timeout précédent si il existe
      if (currentTimeout.current) {
        clearTimeout(currentTimeout.current);
      }
    }

    isTankSpeaking.current = true;
    setShowChibiBubble(false);
    setBubbleId(Date.now());

    console.log("🔍 showTankMessage appelée avec entityType:", entityType);
    const pos = getShadowScreenPosition(entityType);
    console.log("🔍 Position calculée:", pos);

    // 🔥 AJOUTER CET OFFSET INTELLIGENT ICI :
    const messageOffset = Math.min(200, message.length * 0.6); // Plus le message est long, plus on remonte
    const adjustedPos = {
      x: pos.x,
      y: pos.y - messageOffset, // Décaler vers le haut
      currentCanvasId: pos.currentCanvasId
    };

    setChibiPos(adjustedPos); // 🔧 UTILISER LA POSITION AJUSTÉE
    console.log("🔍 setChibiPos appelée avec position ajustée:", adjustedPos);

    setShowChibiBubble(true);
    setChibiMessage(message);

    // 🎯 DURÉE DYNAMIQUE selon la longueur du message
    const calculateDisplayDuration = (message) => {
      const baseTime = 4000;
      const readingTime = message.length * 80;
      const maxTime = 20000;
      return Math.min(Math.max(baseTime, readingTime), maxTime);
    };

    const displayDuration = calculateDisplayDuration(message);
    console.log(`🕐 Durée d'affichage calculée: ${displayDuration}ms pour "${message.substring(0, 30)}..."`);

    // 🔥 STOCKER LE TIMEOUT POUR POUVOIR L'ANNULER
    currentTimeout.current = setTimeout(() => {
      setShowChibiBubble(false);
      isTankSpeaking.current = false;

      // 🔄 TRAITER LA QUEUE (avec entityType)
      if (messageQueue.current.length > 0) {
        const next = messageQueue.current.shift();
        showTankMessage(next.message, false, next.entityType);
      }

      currentTimeout.current = null; // Reset
    }, displayDuration);
  };

  // Filtre du select Personnage
  useEffect(() => {
    const messageRef = tankMessageRef;
    const opacityRef = messageOpacityRef;
    const filteredCharacters = Object.entries(characters)
      .filter(([key, char]) => {
        if (selectedElement && char.element !== selectedElement) return false;
        if (selectedClass) {
          const classType = char.class === 'Tank' ? 'Tank'
            : (['Healer', 'Support'].includes(char.class) ? 'Support' : 'DPS');
          if (classType !== selectedClass) return false;
        }
        return true;
      })
      .map(([key]) => key);

    if (!filteredCharacters.includes(selectedCharacter)) {
      setSelectedCharacter('');
    }
  }, [selectedElement, selectedClass, characters, selectedCharacter]);



  return (
    <>

      {((isMobile.isPhone || isMobile.isTablet) && !isMobile.isDesktop) ? (
        <>
          <div className="h-screen bg-gray-950 text-white p-1  tank-target">
            <div className="w-full flex justify-center">
              <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(600px,900px)_240px] gap-x-2 max-w-[1400px] w-full px-2">





                {mobileView === 'main' && (
                  <>
                    <div className="w-[85vw] sm:w-[85vw] md:w-[1000px] mx-auto">
                      {/* Ton bloc central ici */}
                      {mobileView === 'main' && (
                        <div className="flex flex-col items-center w-full max-w-[95vw] sm:max-w-[1100px] mx-auto px-2 sm:px-4 text-[13px] sm:text-[14px]">


                          <div className="flex flex-col justify-center items-center h-full tank-target">
                            {/* Filtres + select personnage EN HAUT */}
                            <div className="flex flex-col w-fit gap-2">
                              {/* Bloc – Langues + Select */}
                              <div className="flex items-center gap-2">
                                <div className="flex gap-1 items-center ml-0 mr-4">
                                  <div className="flex gap-2 items-center">
                                    <img
                                      src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748533955/Francia_sboce9.png"
                                      alt="Français"
                                      onClick={() => i18n.changeLanguage('fr')}
                                      className="w-7 h-5 cursor-pointer hover:scale-110 transition-transform rounded border border-transparent hover:border-yellow-500"
                                    />
                                    <img
                                      src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748533955/BritishAirLine_s681io.png"
                                      alt="English"
                                      onClick={() => i18n.changeLanguage('en')}
                                      className="w-7 h-5 cursor-pointer hover:scale-110 transition-transform rounded border border-transparent hover:border-yellow-500"
                                    />
                                  </div>
                                </div>

                                {/* Colonne Centre – Éléments + Select + Classes */}
                                <div className="flex items-center gap-3 mr-auto">

                                  {/* Select Personnage */}
                                  <select
                                    value={selectedCharacter}
                                    onChange={(e) => {
                                      const selected = e.target.value;
                                      setSelectedCharacter(selected);

                                      const saved = localStorage.getItem(`${selected}`);
                                      if (saved) {
                                        const build = JSON.parse(saved);
                                        setFlatStats(build.flatStats);
                                        setStatsWithoutArtefact(build.statsWithoutArtefact);
                                        setArtifactsData(build.artifactsData);
                                        setHunterCores(build.hunterCores);
                                        showTankMessage(`Loaded saved build for ${selected} 😏`);
                                      } else {
                                        handleResetStats();
                                      }
                                    }}
                                    className="p-1 rounded bg-[#1c1c3c] text-white text-sm tank-target"
                                  >
                                    <option value="">Sélectionner un personnage</option>
                                    {Object.entries(characters)
                                      .filter(([key, char]) => {
                                        if (key === '') return false;
                                        if (selectedElement && char.element !== selectedElement) return false;
                                        if (selectedClass) {
                                          const classType = char.class === 'Tank' ? 'Tank'
                                            : (['Healer', 'Support'].includes(char.class) ? 'Support' : 'DPS');
                                          if (classType !== selectedClass) return false;
                                        }
                                        return true;
                                      })
                                      .map(([key, char]) => (
                                        <option key={key} value={key}>{char.name}</option>
                                      ))}
                                  </select>
                                </div>
                              </div>
                              {/* Bloc en dessous – Éléments + Classes */}
                              <div className="flex items-center gap-2"> {/* bloc vert */}
                                {/* Icônes éléments */}
                                {/* <div className="flex gap-2">
                                  {['Fire', 'Water', 'Light', 'Dark', 'Wind'].map((el) => {
                                    const key = el.toLowerCase();
                                    return (
                                      <img
                                        key={el}
                                        src={ICON_ELEMENTS[key]}
                                        alt={el}
                                        onClick={() => handleElementClick(el)}
                                        className={`"w-9 h-9 max-sm:w-6 max-sm:h-6" cursor-pointer transition-all duration-300 tank-target 
              ${selectedElement === el ? 'opacity-100 drop-shadow-md' : 'opacity-40'}`}
                                      />
                                    );
                                  })}
                                </div> */}



                                {/* Icônes classes */}
                                {/* <div className="flex flex-row items-center gap-1 ml-2">
                                  {['Tank', 'DPS', 'Support'].map((type) => {
                                    const key = type.toLowerCase();
                                    return (
                                      <img
                                        key={type}
                                        src={ICON_CLASSES[key]}
                                        alt={type}
                                        onClick={() => handleClassClick(type)}
                                        className={`w-8 h-8 cursor-pointer tank-target transition-all duration-300 
              ${selectedClass === type ? 'opacity-100 drop-shadow-md' : 'opacity-40'}`}
                                      />
                                    );
                                  })}
                                </div> */}
                              </div>
                            </div>


                            <div className="w-full flex justify-between tank-target mt-0 gap-2 text-sm flex-wrap sm:flex-nowrap">
                              <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full items-center tank-target">

                                <button
                                  onClick={handleResetStats}
                                  className="bg-gradient-to-r from-black-900 to-black-700 hover:from-black-700 hover:to-black-500 text-white font-bold px-4 py-2 text-sm rounded-xl shadow-md transform transition-transform duration-200 hover:scale-105 hover:shadow-red-500/40 max-sm:px-2 max-sm:py-1 max-sm:text-xs"
                                >
                                  BobbyKick
                                </button>

                                <button
                                  onClick={handleSaveBuild}
                                  className="bg-gradient-to-r from-emerald-800 to-green-600 hover:from-green-600 hover:to-green-400 text-white font-bold px-4 py-2 text-sm rounded-xl shadow-md transform transition-transform duration-200 hover:scale-105 hover:shadow-green-400/40 max-sm:px-2 max-sm:py-1 max-sm:text-xs"
                                >
                                  Save
                                </button>

                                <button
                                  onClick={handleExportAllBuilds}
                                  className="bg-gradient-to-r from-[#3b3b9c] to-[#6c63ff] hover:from-[#4a4ab3] hover:to-[#7c72ff] text-white font-semibold px-4 py-2 text-sm rounded-lg shadow-md transition-transform duration-200 hover:scale-105 max-sm:px-2 max-sm:py-1 max-sm:text-xs"
                                >
                                  Export
                                </button>

                                <button
                                  onClick={handleImportBuild}
                                  className="bg-gradient-to-r from-[#3b3b9c] to-[#6c63ff] hover:from-[#4a4ab3] hover:to-[#7c72ff] text-white font-semibold px-4 py-2 text-sm rounded-lg shadow-md transition-transform duration-200 hover:scale-105 max-sm:px-2 max-sm:py-1 max-sm:text-xs"
                                >
                                  Import
                                </button>

                                <button
                                  onClick={() => setShowNewAccountPopup(true)}
                                  className="bg-green-700 px-4 py-2 rounded text-white ml-2"
                                >
                                  ➕ Nouveau compte
                                </button>

                                {Object.keys(accounts).length > 1 && (
                                  <select
                                    value={activeAccount}
                                    onChange={(e) => {
                                      const newAcc = e.target.value;


                                      // 🎯 Utiliser la nouvelle fonction d'auto-load
                                      handleAccountSwitch(newAcc);
                                    }}
                                    className="bg-gray-800 text-white px-3 py-2 rounded ml-2"
                                  >
                                    {Object.keys(accounts).map(acc => (
                                      <option key={acc} value={acc}>{acc}</option>
                                    ))}
                                  </select>
                                )}

                                {/* Icons à droite */}
                                <div id="buildIcons" className="flex gap-2 items-center mt-1 sm:mt-0">
                                  {isBuildsReady && recentBuilds.length > 0 && (
                                    recentBuilds
                                      .filter((charKey) => characters[charKey]) // <-- Sécurité
                                      .map((charKey) => (
                                        <img
                                          key={charKey}
                                          src={characters[charKey]?.icon || '/default.png'}
                                          alt={characters[charKey]?.name || charKey}
                                          onClick={() => handleClickBuildIcon(charKey)}
                                          className="w-8 h-8 rounded-full cursor-pointer border-2 border-purple-700 hover:scale-110 transition"
                                        />
                                      ))
                                  )}
                                </div>

                              </div>
                            </div>



                            {showImportSaveWarning && (
                              <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
                                <div className="bg-[#1a1a2e] text-white p-6 rounded-xl shadow-lg border border-purple-700 text-center max-w-sm">
                                  <p className="text-lg font-bold mb-4">
                                    ⚠️ Shadow Override Detected
                                  </p>
                                  <p className="text-sm mb-6">
                                    If you save this data,<br />
                                    your current system build will be <span className="text-red-400">overwritten</span>.<br />
                                    Do you really want to save this imported shadow?
                                  </p>
                                  <div className="flex justify-center gap-4">
                                    <button
                                      onClick={() => {

                                        setShowImportSaveWarning(false);
                                        setIsImportedBuild(false);
                                        handleSaveBuild();
                                        playMusic();
                                      }}
                                      className="bg-green-700 hover:bg-green-600 px-4 py-2 max-sm:px-2 max-sm:py-1 text-sm max-sm:text-xs rounded text-white"
                                    >
                                      Yes
                                    </button>
                                    <button
                                      onClick={() => setShowImportSaveWarning(false)}
                                      className="bg-red-700 hover:bg-red-600 px-4 py-2 max-sm:px-2 max-sm:py-1 text-sm max-sm:text-xs rounded text-white"
                                    >
                                      No
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}


                            {showNoyauxPopup && (
                              <NoyauxPopup
                                hunterName={selectedCharacter}
                                onClose={() => setShowNoyauxPopup(false)}
                                onSave={handleSaveNoyaux}
                                existingCores={hunterCores[selectedCharacter] || {}}
                                isMobile={isMobile}
                              />
                            )}

                            {showGemPopup && (
                              <GemmesPopup
                                gemData={gemData}
                                onClose={() => setShowGemPopup(false)}
                                onSave={handleSaveGems}
                                isMobile={isMobile}
                              />
                            )}

                            {showNewAccountPopup && (
                              <NewAccountPopup
                                newAccountName={newAccountName}
                                setNewAccountName={setNewAccountName}
                                setShowNewAccountPopup={setShowNewAccountPopup}
                                createNewAccount={createNewAccount}
                              />
                            )}

                            {showBeruInteractionMenu && (() => {
                              console.log("🐛 MONARQUE DEBUG: artifactsData avant menu Béru:", artifactsData);
                              console.log("🐛 Slots avec des noms:", Object.entries(artifactsData).filter(([slot, art]) => art?.name));
                              return null;
                            })()}

                            {showBeruInteractionMenu && (

                              <BeruInteractionMenu
                                position={beruMenuPosition}
                                onClose={() => {
                                  setShowBeruInteractionMenu(false);
                                  // 🔧 CORRECTION : Accès via window.shadowManager !
                                  if (window.shadowManager) {
                                    const beruEntity = window.shadowManager.entities.get('beru');
                                    if (beruEntity) {
                                      beruEntity.isMenuActive = false;
                                    }
                                  }
                                }}
                                selectedCharacter={selectedCharacter}
                                characters={characters}
                                showTankMessage={showTankMessage}
                                currentArtifacts={artifactsData}
                                currentStats={finalStats}                   // ← STATS FINALES COMPLÈTES !
                                currentCores={hunterCores[selectedCharacter] || {}}
                                currentGems={gemData}
                                multiAccountsData={accounts}
                              />
                            )}

                            {/* Papyrus doré */}
                            <GoldenPapyrusIcon
                              isVisible={showPapyrus}
                              onClick={handleOpenReport}
                            />

                            <BeruReportSystem
                              isOpen={showReportSystem}
                              onClose={handleCloseReport}
                              currentReport={currentReport}
                              reportHistory={reportHistory}
                              onSaveReport={handleSaveReport}
                            />

                            {showSernPopup && (
                              <div className="fixed inset-0 bg-black bg-opacity-70 flex items-start justify-center z-[9999]  py-10">
                                <div
                                  ref={popupRef}
                                  className="relative w-[95vw] max-w-[1000px] p-4 bg-black/90 text-white 
        border-4 border-white rounded-2xl shadow-2xl animate-pulse flex flex-col 
         max-h-[90vh] scrollbar-none scroll-smooth"
                                >
                                  {/* IMAGE */}
                                  <div className="w-full flex items-center justify-center">
                                    <img
                                      src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747680569/SERN_ab7od6.png"
                                      alt="Sung Bobby SERN"
                                      className="w-full max-w-full rounded-md opacity-90 object-contain"
                                    />
                                  </div>

                                  {/* TEXTE */}
                                  <div className="w-full mt-4 px-4">
                                    <h2 className="text-xl font-bold mb-2 text-center">⚠️ INFRACTION GAGOLDIQUE N-404 ⚠️</h2>
                                    <span
                                      ref={dytextRef}
                                      className="text-sm whitespace-pre-line font-mono leading-relaxed tracking-wide animate-fade-in text-left"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            <OCRPasteListener
                              onParsed={(parsed) => {
                                setParsedArtifactData(parsed);
                              }}
                              updateArtifactFromOCR={updateArtifactFromOCR}
                            />

                            {comparisonData && (
                              <ComparisonPopup
                                original={comparisonData}
                                onClose={() => setComparisonData(null)}
                                hunter={characters[selectedCharacter]}
                                flatStats={flatStats} // ← Ajouter
                                statsWithoutArtefact={statsWithoutArtefact} // ← Ajouter
                                substatsMinMaxByIncrements={substatsMinMaxByIncrements}
                                showTankMessage={showTankMessage} // ✅ Ajoute ça
                                recalculateStatsFromArtifacts={recalculateStatsFromArtifacts} // ✅ Ajoute ça aussi
                              />
                            )}

                            {showNarrative && (
                              <div className="fixed inset-0 bg-black bg-opacity-70 flex items-start justify-center z-[9999]  py-10">
                                <div
                                  ref={popupRef}
                                  className="relative w-[95vw] max-w-[1000px] p-4 bg-black/90 text-white 
        border-4 border-white rounded-2xl shadow-2xl animate-pulse flex flex-col 
         max-h-[90vh] scrollbar-none scroll-smooth"
                                >
                                  {/* IMAGE dynamique */}
                                  {currentImage && (
                                    <div className="w-full flex items-center justify-center">
                                      <img
                                        ref={mainImageRef}
                                        src={currentImage?.src}
                                        alt="Image narrative"
                                        className="w-1/2 mx-auto rounded-md opacity-90 object-contain"
                                      />
                                    </div>
                                  )}

                                  {/* TEXTE */}
                                  <div className="w-full mt-4 px-4">
                                    <h2 className="text-xl font-bold mb-2 text-center">⚠️ INFRACTION GAGOLDIQUE NARRATIVE ⚠️</h2>
                                    <span
                                      ref={dytextRef}
                                      className="text-sm whitespace-pre-line font-mono leading-relaxed tracking-wide animate-fade-in text-left"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {showWeaponPopup && (
                              <WeaponPopup
                                hunterName={selectedCharacter}
                                onClose={() => setShowWeaponPopup(false)}
                                onSave={handleSaveWeapon}
                                existingWeapon={hunterWeapons[selectedCharacter] || {}}
                                scaleStat={characters[selectedCharacter]?.scaleStat}
                              />
                            )}

                            {parsedArtifactData && (
                              <OcrConfirmPopup
                                parsedData={parsedArtifactData}
                                onConfirm={(data) => {
                                  // 🧠 Ici tu traites la sauvegarde finale (ex: mise à jour des artefactsData)
                                  setParsedArtifactData(null);
                                }}
                                onCancel={() => setParsedArtifactData(null)}
                              />
                            )}

                            <OcrConfirmPopup
                              parsedData={parsedArtifactData}
                              onConfirm={(data) => {
                                applyOcrDataToArtifact(data);
                                setShowPopup(false); // cache la pop-up
                              }}
                              onCancel={() => setShowPopup(false)}
                            />

                            <div className={showSernPopup ? 'blur-background' : ''}>
                              {/* Image + stats EN BAS */}


                              <div className="flex items-center justify-start w-full px-1 mb-4 tank-target">

                                <div className="flex flex-col items-center w-full gap-2 tank-target">


                                  {/* Bloc Noyaux à gauche + Personnage Centre + Bloc gemmes à droite*/}
                                  <div className="flex justify-start items-start space-x-6 mt-4">
                                    {/* Bloc Noyaux à gauche */}
                                    <div className="w-40 text-white text-[11px] flex flex-col justify-start">
                                      <h2 className="text-purple-300 font-bold mb-2"> <button
                                        className="bg-gradient-to-r from-[#3b3b9c] to-[#6c63ff] hover:from-[#4a4ab3] hover:to-[#7c72ff] text-pink-200 font-semibold px-4 py-2 max-sm:px-2 max-sm:py-1 text-sm max-sm:text-xs rounded-lg shadow-md transition-transform duration-200 hover:scale-105"
                                        onClick={() => setShowNoyauxPopup(true)}
                                      >
                                        {t("cores")}
                                      </button></h2>
                                      {hunterCores[selectedCharacter] ? (
                                        <div className="text-xs space-y-2">
                                          {['Offensif', 'Défensif', 'Endurance'].map((type, index) => {
                                            const core = hunterCores[selectedCharacter]?.[type];
                                            if (!core) return null;

                                            const showPrimary = core.primary && parseFloat(core.primaryValue) !== 0;
                                            const showSecondary = core.secondary && parseFloat(core.secondaryValue) !== 0;

                                            if (!showPrimary && !showSecondary) return null;

                                            return (
                                              <div key={index} className="border-b border-purple-800 pb-1">
                                                <p className="text-purple-200 font-semibold">{t(`coreTypes.${type}`)}</p>
                                                {showPrimary && (
                                                  <p>{t(`stats.${core.primary}`)}: {core.primaryValue}</p>
                                                )}
                                                {showSecondary && (
                                                  <p>{core.secondary}: {core.secondaryValue}</p>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      ) : (
                                        <p>No cores defined</p>
                                      )}


                                    </div>
                                    {/* Bloc Personnage Centre */}
                                    <div className="relative">
                                      {selectedCharacter && characters[selectedCharacter] && characters[selectedCharacter].img ? (
                                        <>
                                          <img
                                            src={characters[selectedCharacter].img}
                                            alt={characters[selectedCharacter].name}
                                            className="w-50 mb-1 relative z-10"
                                            id="targetToDestroy"
                                          />
                                          {showHologram && selectedCharacter && characters[selectedCharacter]?.element && (
                                            <div
                                              className="absolute w-60 h-8 rounded-full blur-sm animate-fade-out z-0"
                                              style={{
                                                backgroundColor: getElementColor(characters[selectedCharacter].element),
                                                bottom: '0px'
                                              }}
                                            ></div>
                                          )}
                                        </>
                                      ) : (
                                        <div className="relative">
                                          <img
                                            src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748276015/beru_select_Char_d7u6mh.png"
                                            className="w-64 mb-2 relative z-10"
                                            id="targetToDestroy"
                                          />
                                        </div>
                                      )}
                                    </div>


                                    {/* Bloc Gemmes à droite */}
                                    <div className="w-40 text-white text-xs flex flex-col items-start">
                                      <h2 className="text-blue-300 font-bold mb-2">
                                        <button
                                          className="bg-gradient-to-r font-bold from-blue-500 text-[20px] to-purple-500 hover:from-blue-600 hover:to-purple-600 text-blue-300 font-semibold px-4 py-2 max-sm:px-2 max-sm:py-1 text-sm max-sm:text-xs rounded-lg shadow-md transition-transform duration-200 hover:scale-105"
                                          onClick={() => setShowGemPopup(true)}
                                        >
                                          {t("gems")}
                                        </button>
                                      </h2>
                                      {
                                        Object.entries(gemData || {}).every(([_, stats]) =>
                                          Object.values(stats).every(value => !value)
                                        ) ? (
                                          <p>No gems defined</p>
                                        ) : (
                                          <div className="space-y-3">
                                            {
                                              Object.entries(gemData || {}).map(([color, stats]) => {
                                                const filtered = Object.entries(stats || {}).filter(([_, value]) => value);
                                                if (filtered.length === 0) return null;
                                                return (
                                                  <div key={color}>
                                                    <p className="text-blue-200 font-semibold">{t(`gemColors.${color}`, `${color} Gem`)}</p>
                                                    {filtered.map(([stat, value], i) => (
                                                      <p key={i}>{t(`stats.${stat}`, stat)} : {value}</p>
                                                    ))}
                                                    <hr className="border-blue-700 my-1" />
                                                  </div>
                                                );
                                              })
                                            }
                                          </div>
                                        )
                                      }
                                    </div>

                                  </div>

                                  {/* BLOC STATS SOUS LE PERSONNAGE */}
                                  <div className="flex justify-center mt-4 w-full">
                                    <div className="flex flex-col items-center w-full gap-2">

                                      <div className="flex justify-between items-center w-full -mb-1 pr-2 tank-target">
                                        <div className="flex items-center space-x-4">
                                          <button
                                            className="bg-gradient-to-r from-[#3b3b9c] to-[#6c63ff] hover:from-[#4a4ab3] hover:to-[#7c72ff] text-red-400 font-semibold px-4 py-2 max-sm:px-2 max-sm:py-1 text-sm max-sm:text-xs rounded-lg shadow-md transition-transform duration-200 hover:scale-105"
                                            onClick={() => setShowWeaponPopup(true)}
                                          >
                                            {t("weapon")}
                                          </button>
                                          <p className="text-white">
                                            {hunterWeapons[selectedCharacter]
                                              ? `+${hunterWeapons[selectedCharacter].mainStat || 0} ${characters[selectedCharacter]?.scaleStat || ''}`
                                              : 'Aucune arme définie'}
                                          </p>

                                        </div>

                                        <button
                                          onClick={() => setEditStatsMode(!editStatsMode)}
                                          className="bg-gradient-to-r from-[#3b3b9c] to-[#6c63ff] hover:from-[#4a4ab3] hover:to-[#7c72ff] text-white-400 font-semibold px-4 py-2 max-sm:px-2 max-sm:py-1 text-sm max-sm:text-xs rounded-lg shadow-md transition-transform duration-200 hover:scale-105"
                                        >
                                          {getEditLabel()}
                                        </button>
                                      </div>



                                      {!editStatsMode ? (
                                        <div className="bg-gray-900 p-2 rounded text-xs mt-2 relative group w-full">
                                          <div className="font-bold text-white text-center">{t("statFinals")}</div>
                                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-1 w-full text-gray-200 text-xs">
                                            {allStats.map((key) => {
                                              const base = typeof finalStatsWithoutArtefact[key] === 'number' ? finalStatsWithoutArtefact[key] : 0;
                                              const fromArtifact = typeof statsFromArtifacts[key] === 'number' ? statsFromArtifacts[key] : 0;
                                              const total = base + fromArtifact;

                                              return (
                                                <div key={key} className="break-words max-w-[140px]">
                                                  <span className="text-blue-300">{t(`stats.${key}`)}</span>: <span className="text-white">{Math.floor(total)}</span>
                                                </div>
                                              );
                                            })}
                                          </div>

                                          {/* Infobulle au hover */}
                                          <div className="absolute top-0 left-full ml-4 w-64 bg-[#322d59] hover:bg-[#4a3d89] text-white text-[10px] p-2 rounded shadow-lg hidden group-hover:block z-10 border border-purple-500">
                                            <div className="mb-1 font-bold">Stat Breakdown:</div>
                                            {allStats.map((key) => {
                                              const base = typeof flatStats[key] === 'number' ? statsWithoutArtefact[key] : 0;
                                              const fromArtifact = typeof statsFromArtifacts[key] === 'number' ? statsFromArtifacts[key] : 0;
                                              const total = base + fromArtifact;

                                              return (
                                                <div key={key}>
                                                  {t(`stats.${key}`)}: <span className="text-blue-300">{base}</span> + <span className="text-green-400">{fromArtifact}</span> = <span className="text-white">{Math.floor(total)}</span>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex gap-4 tank-targe">
                                          {/* Bloc gauche - Flat Stats */}
                                          <div className="bg-gray-800 p-2 rounded text-xs w-1/2">
                                            <div className="font-bold mb-2 text-white">Your flat stats</div>
                                            {Object.entries(flatStats).map(([key, value]) => (
                                              <div key={key} className="flex justify-between items-center gap-2 mb-1">
                                                <label className="w-24 text-gray-300">{key}</label>
                                                <input
                                                  type="number"
                                                  value={value}
                                                  onChange={(e) =>
                                                    setFlatStats((prev) => ({ ...prev, [key]: +e.target.value }))
                                                  }
                                                  className="w-20 bg-black text-white px-1 py-0.5 rounded text-right no-spinner"
                                                />
                                              </div>
                                            ))}
                                          </div>

                                          {/* Bloc droite - Stats Without Artefact */}
                                          <div className="bg-gray-800 p-2 rounded text-xs w-1/2">
                                            <div className="font-bold mb-2 text-white">Stats you see without Artefacts</div>
                                            {Object.entries(statsWithoutArtefact).map(([key, value]) => (
                                              <div key={key} className="flex justify-between items-center gap-2 mb-1">
                                                <label className="w-24 text-gray-300">{key}</label>
                                                <input
                                                  type="number"
                                                  value={value}
                                                  onChange={(e) =>
                                                    setStatsWithoutArtefact((prev) => ({
                                                      ...prev,
                                                      [key]: +e.target.value,
                                                    }))
                                                  }
                                                  className="w-20 bg-black text-white px-1 py-0.5 rounded text-right no-spinner"
                                                />
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col min-h-[20px]">
                            <div className="fixed bottom-2 left-0 w-full px-4 flex justify-between gap-2 sm:hidden z-50">
                              <button
                                onClick={() => setMobileView('left')}
                                className="text-[11px] px-4 py-2 bg-[#2d2d5c] text-white rounded shadow-md"
                              >
                                ← Gauche
                              </button>
                              <button
                                onClick={() => setMobileView('right')}
                                className="text-[11px] px-4 py-2 bg-[#2d2d5c] text-white rounded shadow-md"
                              >
                                Droite →
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                  </>
                )}

                {mobileView === 'left' && (
                  <>
                    <div className="w-[95vw] mx-auto">
                      <div className="flex flex-col gap-y-1">
                        {[...leftArtifacts].map((item, idx) => (
                          <ArtifactCard
                            key={`${activeAccount}-${item.title}-${JSON.stringify(artifactsData[item.title])}`} // ← NOUVELLE KEY !
                            title={item.title}
                            mainStats={item.mainStats}
                            showTankMessage={showTankMessage}
                            recalculateStatsFromArtifacts={recalculateStatsFromArtifacts}
                            artifactData={artifactsData[item.title]}
                            statsWithoutArtefact={statsWithoutArtefact}  // ← AJOUT ICI
                            flatStats={flatStats}
                            onSetIconClick={openSetSelector}
                            onArtifactSave={handleSaveArtifactToLibrary}
                            hunter={characters[selectedCharacter]}                        // ← UTILE SI BESOIN
                            substatsMinMaxByIncrements={substatsMinMaxByIncrements}  // ✅ C’EST ICI
                            disableComparisonButton={false} // 👈 AJOUT
                            openComparisonPopup={openComparisonPopup}
                            artifactLibrary={accounts[activeAccount]?.artifactLibrary || {}}
                            onArtifactChange={(updaterFn) =>
                              setArtifactsData(prev => ({
                                ...prev,
                                [item.title]: typeof updaterFn === 'function'
                                  ? updaterFn(prev[item.title])
                                  : { ...prev[item.title], ...updaterFn }
                              }))
                            }
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-center gap-2 mt-4 sm:hidden">
                      <button
                        onClick={() => setMobileView(mobileView === 'left' ? 'right' : 'left')}
                        className="text-[11px] px-3 py-1 bg-[#2d2d5c] rounded shadow-sm"
                      >
                        {mobileView === 'left' ? '→ Droite' : '← Gauche'}
                      </button>
                      <button
                        onClick={() => setMobileView('main')}
                        className="text-[11px] px-3 py-1 bg-[#2d2d5c] rounded shadow-sm"
                      >
                        Retour
                      </button>
                    </div>

                  </>
                )}

                {mobileView === 'right' && (
                  <>
                    <div className="w-[95vw] mx-auto">
                      <div className="flex flex-col gap-y-1">
                        {[...rightArtifacts].map((item, idx) => (
                          <ArtifactCard
                            key={`${activeAccount}-${item.title}-${JSON.stringify(artifactsData[item.title])}`} // ← NOUVELLE KEY !
                            title={item.title}
                            mainStats={item.mainStats}
                            showTankMessage={showTankMessage}
                            recalculateStatsFromArtifacts={recalculateStatsFromArtifacts}
                            artifactData={artifactsData[item.title]}
                            statsWithoutArtefact={statsWithoutArtefact}  // ← AJOUT ICI
                            flatStats={flatStats}
                            onSetIconClick={openSetSelector}                     // ← UTILE SI BESOIN
                            onArtifactSave={handleSaveArtifactToLibrary}
                            handleLoadSavedSet={handleLoadSavedSet}
                            hunter={characters[selectedCharacter]}                        // ← UTILE SI BESOIN
                            substatsMinMaxByIncrements={substatsMinMaxByIncrements}  // ✅ C’EST ICI
                            disableComparisonButton={false} // 👈 AJOUT
                            openComparisonPopup={openComparisonPopup}
                            artifactLibrary={accounts[activeAccount]?.artifactLibrary || {}}
                            onArtifactChange={(updaterFn) =>
                              setArtifactsData(prev => ({
                                ...prev,
                                [item.title]: typeof updaterFn === 'function'
                                  ? updaterFn(prev[item.title])
                                  : { ...prev[item.title], ...updaterFn }
                              }))
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-center gap-2 mt-4 sm:hidden">
                      <button
                        onClick={() => setMobileView(mobileView === 'left' ? 'right' : 'left')}
                        className="text-[11px] px-3 py-1 bg-[#2d2d5c] rounded shadow-sm"
                      >
                        {mobileView === 'left' ? '→ Droite' : '← Gauche'}
                      </button>
                      <button
                        onClick={() => setMobileView('main')}
                        className="text-[11px] px-3 py-1 bg-[#2d2d5c] rounded shadow-sm"
                      >
                        Retour
                      </button>
                    </div>
                  </>
                )}

                <div className="h-[50px] mt-1">


                  <div className="relative w-full h-200">
                    {/* Zone pour positionner DOM au-dessus du canvas */}




                    {showChibiBubble && chibiMessage && (
                      <ChibiBubble
                        key={`bubble-${bubbleId}`} // <-- force un rerender total à chaque message
                        message={chibiMessage}
                        position={chibiPos}
                      />
                    )}
                    <div className="flex justify-center items-center relative gap-1">
                      <canvas id="canvas-left" width="600" height="240" className="rounded-l-lg shadow-md bg-black w-[40vw] h-auto" />
                      <canvas id="canvas-center" width="600" height="240" className="shadow-md bg-black w-[40vw] h-auto" />
                      <canvas id="canvas-right" width="600" height="240" className="rounded-r-lg shadow-md bg-black w-[40vw] h-auto" />

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </>
      ) : (


        <div className="h-screen bg-gray-950 text-white p-1  tank-target">
          <div className="w-full flex justify-center">
            <div className="grid 
  grid-cols-1 
  lg:grid-cols-[260px_minmax(0,1fr)_240px] 
  gap-x-4 
  max-w-[1400px] 
  w-full 
  px-4 
  mx-auto 
  min-w-0
">
              <div className="{showSernPopup ? 'blur-background' : ''}">
                <div className="flex flex-col items-center justify-center 
         mx-auto 
         w-full px-2 sm:px-4 
         max-w-[64vw] 
         md:max-w-[666px] 
         lg:max-w-[600px] 
         xl:max-w-[560px] 
         2xl:max-w-[733px]">
                  {[...leftArtifacts].map((item, idx) => (
                    <ArtifactCard
                      key={`${activeAccount}-${item.title}-${JSON.stringify(artifactsData[item.title])}`} // ← NOUVELLE KEY !
                      title={item.title}
                      mainStats={item.mainStats}
                      showTankMessage={showTankMessage}
                      recalculateStatsFromArtifacts={recalculateStatsFromArtifacts}
                      artifactData={artifactsData[item.title]}
                      statsWithoutArtefact={statsWithoutArtefact}
                      flatStats={flatStats}
                      onSetIconClick={openSetSelector}
                      handleLoadSavedSet={handleLoadSavedSet}
                      onArtifactSave={handleSaveArtifactToLibrary}
                      hunter={characters[selectedCharacter]}
                      substatsMinMaxByIncrements={substatsMinMaxByIncrements}
                      disableComparisonButton={false}
                      openComparisonPopup={openComparisonPopup}
                      artifactLibrary={accounts[activeAccount]?.artifactLibrary || {}}
                      onArtifactChange={(updaterFn) =>
                        setArtifactsData(prev => ({
                          ...prev,
                          [item.title]: typeof updaterFn === 'function'
                            ? updaterFn(prev[item.title])
                            : { ...prev[item.title], ...updaterFn }
                        }))
                      }
                    />
                  ))}
                </div>

              </div>

              <div className="flex flex-col items-center justify-center 
         mx-auto 
         w-full px-2 sm:px-4 
         max-w-[95vw] 
         md:max-w-[1000px] 
         lg:max-w-[900px] 
         xl:max-w-[840px] 
         2xl:max-w-[1100px]">


                <div className="flex flex-col justify-center items-center h-full tank-target">
                  {/* Filtres + select personnage EN HAUT */}
                  <div className="flex items-center justify-start w-full px-1 mb-4 tank-target">
                    {/* Colonne Gauche – Langues */}
                    <div className="flex gap-1 items-center ml-0 mr-4">
                      <div className="flex gap-2 items-center">
                        <img
                          src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748533955/Francia_sboce9.png"
                          alt="Français"
                          onClick={() => i18n.changeLanguage('fr')}
                          className="w-7 h-5 cursor-pointer hover:scale-110 transition-transform rounded border border-transparent hover:border-yellow-500"
                        />
                        <img
                          src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748533955/BritishAirLine_s681io.png"
                          alt="English"
                          onClick={() => i18n.changeLanguage('en')}
                          className="w-7 h-5 cursor-pointer hover:scale-110 transition-transform rounded border border-transparent hover:border-yellow-500"
                        />
                      </div>
                    </div>

                    {/* Colonne Centre – Éléments + Select + Classes */}
                    <div className="flex items-center gap-3 mr-auto">
                      {/* Icônes éléments */}
                      <div className="flex gap-2">
                        {['Fire', 'Water', 'Light', 'Dark', 'Wind'].map((el) => {
                          const key = el.toLowerCase();
                          return (
                            <img
                              key={el}
                              src={ICON_ELEMENTS[key]}
                              alt={el}
                              onClick={() => handleElementClick(el)}
                              className={`w-9 h-9 cursor-pointer transition-all duration-300 tank-target 
              ${selectedElement === el ? 'opacity-100 drop-shadow-md' : 'opacity-40'}`}
                            />
                          );
                        })}
                      </div>

                      {/* Select Personnage */}
                      <select
                        value={selectedCharacter}
                        onChange={(e) => {
                          const selected = e.target.value;
                          setSelectedCharacter(selected);

                          const saved = localStorage.getItem(`${selected}`);
                          if (saved) {
                            const build = JSON.parse(saved);
                            setFlatStats(build.flatStats);
                            setStatsWithoutArtefact(build.statsWithoutArtefact);
                            setArtifactsData(build.artifactsData);
                            setHunterCores(build.hunterCores);
                            showTankMessage(`Loaded saved build for ${selected} 😏`);
                          } else {
                            handleResetStats();
                          }
                        }}
                        className="p-1 rounded bg-[#1c1c3c] text-white text-sm tank-target"
                      >
                        <option value="">Sélectionner un personnage</option>
                        {Object.entries(characters)
                          .filter(([key, char]) => {
                            if (key === '') return false;
                            if (selectedElement && char.element !== selectedElement) return false;
                            if (selectedClass) {
                              const classType = char.class === 'Tank' ? 'Tank'
                                : (['Healer', 'Support'].includes(char.class) ? 'Support' : 'DPS');
                              if (classType !== selectedClass) return false;
                            }
                            return true;
                          })
                          .map(([key, char]) => (
                            <option key={key} value={key}>{char.name}</option>
                          ))}
                      </select>

                      {/* Icônes classes */}
                      <div className="flex flex-row items-center gap-1 ml-2">
                        {['Tank', 'DPS', 'Support'].map((type) => {
                          const key = type.toLowerCase();
                          return (
                            <img
                              key={type}
                              src={ICON_CLASSES[key]}
                              alt={type}
                              onClick={() => handleClassClick(type)}
                              className={`w-8 h-8 cursor-pointer tank-target transition-all duration-300 
              ${selectedClass === type ? 'opacity-100 drop-shadow-md' : 'opacity-40'}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>




                  <div className="w-full flex justify-between tank-target mt-0 gap-2 text-sm">
                    {/* Bouton BobbyKick - Reset */}
                    <div className="flex items-center space-x-2 tank-target">

                      <button
                        onClick={handleResetStats}
                        className="bg-gradient-to-r from-[#3b3b9c] to-[#6c63ff] hover:from-[#4a4ab3] hover:to-[#7c72ff] text-red-400 font-semibold px-4 py-2 max-sm:px-2 max-sm:py-1 text-sm max-sm:text-xs rounded-lg shadow-md transition-transform duration-200 hover:scale-105">


                        BobbyKick
                      </button>

                      {/* Bouton Save */}
                      <button
                        onClick={handleSaveBuild}
                        className="bg-gradient-to-r tank-target from-emerald-800 to-green-600 hover:from-green-600 hover:to-green-400 text-white font-bold py-1 px-4 rounded-xl shadow-md transform transition-transform duration-200 hover:scale-105 hover:shadow-green-400/40"
                      >
                        Save
                      </button>


                      <div className="w-full tank-target flex justify-between items-center mt-0 text-sm">
                        {/* Espace à droite (ex : icône future) */}

                        <div id="buildIcons" className="flex tank-target gap-2 items-center">
                          {isBuildsReady && recentBuilds.length > 0 && (
                            recentBuilds
                              .filter((charKey) => characters[charKey]) // <-- Sécurité
                              .map((charKey) => (
                                <img
                                  key={charKey}
                                  src={characters[charKey]?.icon || '/default.png'}
                                  alt={characters[charKey]?.name || charKey}
                                  onClick={() => handleClickBuildIcon(charKey)}
                                  className="w-8 h-8 rounded-full cursor-pointer border-2 border-purple-700 hover:scale-110 transition"
                                />
                              ))
                          )}
                        </div>
                      </div>
                      <div className="w-full flex justify-between tank-targe items-center mt-0 text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handleExportAllBuilds}
                            className="bg-gradient-to-r from-[#3b3b9c] to-[#6c63ff] hover:from-[#4a4ab3] hover:to-[#7c72ff] text-white text-xs font-semibold py-1 px-3 rounded-lg shadow-md transition-transform duration-200 hover:scale-105"
                          >
                            Export
                          </button>

                          <button
                            onClick={handleImportBuild}
                            className="bg-gradient-to-r from-[#3b3b9c] to-[#6c63ff] hover:from-[#4a4ab3] hover:to-[#7c72ff] text-white text-xs font-semibold py-1 px-3 rounded-lg shadow-md transition-transform duration-200 hover:scale-105"
                          >
                            Import
                          </button>

                          <button
                            onClick={() => setShowNewAccountPopup(true)}
                            className="bg-gradient-to-r from-[#3b3b9c] to-[#6c63ff] hover:from-[#4a4ab3] hover:to-[#7c72ff] text-white text-xs font-semibold py-1 px-3 rounded-lg shadow-md transition-transform duration-200 hover:scale-105"
                          >
                            New
                          </button>

                          {Object.keys(accounts).length > 1 && (
                            <select
                              value={activeAccount}
                              onChange={(e) => {
                                const newAcc = e.target.value;

                                // 🎯 Utiliser la nouvelle fonction d'auto-load
                                handleAccountSwitch(newAcc);
                              }}
                              className="bg-gray-800 text-white px-3 py-2 rounded ml-2"
                            >
                              {Object.keys(accounts).map(acc => (
                                <option key={acc} value={acc}>{acc}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>


                  {showImportSaveWarning && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999]">
                      <div className="bg-[#1a1a2e] text-white p-6 rounded-xl shadow-lg border border-purple-700 text-center max-w-sm">
                        <p className="text-lg font-bold mb-4">
                          ⚠️ Shadow Override Detected
                        </p>
                        <p className="text-sm mb-6">
                          If you save this data,<br />
                          your current system build will be <span className="text-red-400">overwritten</span>.<br />
                          Do you really want to save this imported shadow?
                        </p>
                        <div className="flex justify-center gap-4">
                          <button
                            onClick={() => {

                              setShowImportSaveWarning(false);
                              setIsImportedBuild(false);
                              handleSaveBuild();
                              playMusic();
                            }}
                            className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded text-white"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setShowImportSaveWarning(false)}
                            className="bg-red-700 hover:bg-red-600 px-4 py-2 rounded text-white"
                          >
                            No
                          </button>
                        </div>
                      </div>
                    </div>
                  )}


                  {showNoyauxPopup && (
                    <NoyauxPopup
                      hunterName={selectedCharacter}
                      onClose={() => setShowNoyauxPopup(false)}
                      onSave={handleSaveNoyaux}
                      existingCores={hunterCores[selectedCharacter] || {}}
                    />
                  )}

                  {showGemPopup && (
                    <GemmesPopup
                      gemData={gemData}
                      onClose={() => setShowGemPopup(false)}
                      onSave={handleSaveGems}
                    />
                  )}

                  {showNewAccountPopup && (
                    <NewAccountPopup
                      newAccountName={newAccountName}
                      setNewAccountName={setNewAccountName}
                      setShowNewAccountPopup={setShowNewAccountPopup}
                      createNewAccount={createNewAccount}
                    />
                  )}

                  {showBeruInteractionMenu && (() => {
                    console.log("🐛 MONARQUE DEBUG: artifactsData avant menu Béru:", artifactsData);
                    console.log("🐛 Slots avec des noms:", Object.entries(artifactsData).filter(([slot, art]) => art?.name));
                    return null;
                  })()}
                  {showBeruInteractionMenu && (
                    <BeruInteractionMenu
                      position={beruMenuPosition}
                      onClose={() => {
                        setShowBeruInteractionMenu(false);
                        // 🔧 CORRECTION : Accès via window.shadowManager !
                        if (window.shadowManager) {
                          const beruEntity = window.shadowManager.entities.get('beru');
                          if (beruEntity) {
                            beruEntity.isMenuActive = false;
                          }
                        }
                      }}
                      selectedCharacter={selectedCharacter}
                      characters={characters}
                      showTankMessage={showTankMessage}
                      currentArtifacts={artifactsData}
                      currentStats={finalStats}                   // ← STATS FINALES COMPLÈTES !
                      currentCores={hunterCores[selectedCharacter] || {}}
                      currentGems={gemData}
                      multiAccountsData={accounts}
                    />
                  )}

                  {/* Papyrus doré */}
                  <GoldenPapyrusIcon
                    isVisible={showPapyrus}
                    onClick={handleOpenReport}
                  />

                  <BeruReportSystem
                    isOpen={showReportSystem}
                    onClose={handleCloseReport}
                    currentReport={currentReport}
                    reportHistory={reportHistory}
                    onSaveReport={handleSaveReport}
                  />

                  {showSernPopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-start justify-center z-[9999]  py-10">
                      <div
                        ref={popupRef}
                        className="relative w-[95vw] max-w-[1000px] p-4 bg-black/90 text-white 
        border-4 border-white rounded-2xl shadow-2xl animate-pulse flex flex-col 
         max-h-[90vh] scrollbar-none scroll-smooth"
                      >
                        {/* IMAGE */}
                        <div className="w-full flex items-center justify-center">
                          <img
                            src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747680569/SERN_ab7od6.png"
                            alt="Sung Bobby SERN"
                            className="w-full max-w-full rounded-md opacity-90 object-contain"
                          />
                        </div>

                        {/* TEXTE */}
                        <div className="w-full mt-4 px-4">
                          <h2 className="text-xl font-bold mb-2 text-center">⚠️ INFRACTION GAGOLDIQUE N-404 ⚠️</h2>
                          <span
                            ref={dytextRef}
                            className="text-sm whitespace-pre-line font-mono leading-relaxed tracking-wide animate-fade-in text-left"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {isSetSelectorOpen && setSelectorSlot && (
                    <SetSelectorPopup
                      slot={setSelectorSlot}
                      onSelect={handleSelectSet}
                      onClose={() => {
                        setIsSetSelectorOpen(false);
                        setSetSelectorSlot(null);
                      }}
                    />
                  )}

                  <OCRPasteListener
                    onParsed={(parsed) => {
                      setParsedArtifactData(parsed);
                    }}
                    updateArtifactFromOCR={updateArtifactFromOCR}
                  />

                  {comparisonData && (
                    <ComparisonPopup
                      original={comparisonData}
                      onClose={() => setComparisonData(null)}
                      hunter={characters[selectedCharacter]}
                      flatStats={flatStats} // ← Ajouter
                      statsWithoutArtefact={statsWithoutArtefact} // ← Ajouter
                      substatsMinMaxByIncrements={substatsMinMaxByIncrements}
                      showTankMessage={showTankMessage} // ✅ Ajoute ça
                      recalculateStatsFromArtifacts={recalculateStatsFromArtifacts} // ✅ Ajoute ça aussi
                    />
                  )}

                  {showNarrative && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-start justify-center z-[9999]  py-10">
                      <div
                        ref={popupRef}
                        className="relative w-[95vw] max-w-[1000px] p-4 bg-black/90 text-white 
        border-4 border-white rounded-2xl shadow-2xl animate-pulse flex flex-col 
         max-h-[90vh] scrollbar-none scroll-smooth"
                      >
                        {/* IMAGE dynamique */}
                        {currentImage && (
                          <div className="w-full flex items-center justify-center">
                            <img
                              ref={mainImageRef}
                              src={currentImage?.src}
                              alt="Image narrative"
                              className="w-1/2 mx-auto rounded-md opacity-90 object-contain"
                            />
                          </div>
                        )}

                        {/* TEXTE */}
                        <div className="w-full mt-4 px-4">
                          <h2 className="text-xl font-bold mb-2 text-center">⚠️ INFRACTION GAGOLDIQUE NARRATIVE ⚠️</h2>
                          <span
                            ref={dytextRef}
                            className="text-sm whitespace-pre-line font-mono leading-relaxed tracking-wide animate-fade-in text-left"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {showWeaponPopup && (
                    <WeaponPopup
                      hunterName={selectedCharacter}
                      onClose={() => setShowWeaponPopup(false)}
                      onSave={handleSaveWeapon}
                      existingWeapon={hunterWeapons[selectedCharacter] || {}}
                      scaleStat={characters[selectedCharacter]?.scaleStat}
                    />
                  )}

                  {parsedArtifactData && (
                    <OcrConfirmPopup
                      parsedData={parsedArtifactData}
                      onConfirm={(data) => {
                        // 🧠 Ici tu traites la sauvegarde finale (ex: mise à jour des artefactsData)
                        setParsedArtifactData(null);
                      }}
                      onCancel={() => setParsedArtifactData(null)}
                    />
                  )}

                  <OcrConfirmPopup
                    parsedData={parsedArtifactData}
                    onConfirm={(data) => {
                      applyOcrDataToArtifact(data);
                      setShowPopup(false); // cache la pop-up
                    }}
                    onCancel={() => setShowPopup(false)}
                  />

                  <div className={showSernPopup ? 'blur-background' : ''}>
                    {/* Image + stats EN BAS */}


                    <div className="flex items-center justify-start w-full px-1 mb-4 tank-target">

                      <div className="flex flex-col items-center w-full gap-2 tank-target">


                        {/* Bloc Noyaux à gauche + Personnage Centre + Bloc gemmes à droite*/}
                        <div className="flex justify-start items-start space-x-6 mt-4">
                          {/* Bloc Noyaux à gauche */}
                          <div className="w-40 text-white text-[11px] flex flex-col justify-start">
                            <h2 className="text-purple-300 font-bold mb-2"> <button
                              className="bg-gradient-to-r from-[#3b3b9c] to-[#6c63ff] hover:from-[#4a4ab3] hover:to-[#7c72ff] text-pink-200 font-semibold py-1 px-3 rounded-lg shadow-md transition-transform duration-200 hover:scale-105"
                              onClick={() => setShowNoyauxPopup(true)}
                            >
                              {t("cores")}
                            </button></h2>
                            {hunterCores[selectedCharacter] ? (
                              <div className="text-xs space-y-2">
                                {['Offensif', 'Défensif', 'Endurance'].map((type, index) => {
                                  const core = hunterCores[selectedCharacter]?.[type];
                                  if (!core) return null;

                                  const showPrimary = core.primary && parseFloat(core.primaryValue) !== 0;
                                  const showSecondary = core.secondary && parseFloat(core.secondaryValue) !== 0;

                                  if (!showPrimary && !showSecondary) return null;

                                  return (
                                    <div key={index} className="border-b border-purple-800 pb-1">
                                      <p className="text-purple-200 font-semibold">{t(`coreTypes.${type}`)}</p>
                                      {showPrimary && (
                                        <p>{t(`stats.${core.primary}`)}: {core.primaryValue}</p>
                                      )}
                                      {showSecondary && (
                                        <p>{core.secondary}: {core.secondaryValue}</p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p>No cores defined</p>
                            )}


                          </div>
                          {/* Bloc Personnage Centre */}
                          <div className="relative">
                            {selectedCharacter && characters[selectedCharacter] && characters[selectedCharacter].img ? (
                              <>
                                <img
                                  src={characters[selectedCharacter].img}
                                  alt={characters[selectedCharacter].name}
                                  className="w-64 mb-2 relative z-10"
                                  id="targetToDestroy"
                                />
                                {showHologram && selectedCharacter && characters[selectedCharacter]?.element && (
                                  <div
                                    className="absolute w-60 h-8 rounded-full blur-sm animate-fade-out z-0"
                                    style={{
                                      backgroundColor: getElementColor(characters[selectedCharacter].element),
                                      bottom: '0px'
                                    }}
                                  ></div>
                                )}
                              </>
                            ) : (
                              <div className="relative">
                                <img
                                  src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748276015/beru_select_Char_d7u6mh.png"
                                  className="w-64 mb-2 relative z-10"
                                  id="targetToDestroy"
                                />
                              </div>
                            )}
                          </div>


                          {/* Bloc Gemmes à droite */}
                          <div className="w-40 text-white text-xs flex flex-col items-start">
                            <h2 className="text-blue-300 font-bold mb-2">
                              <button
                                className="bg-gradient-to-r font-bold from-blue-500 text-[20px] to-purple-500 hover:from-blue-600 hover:to-purple-600 text-blue-300 font-semibold py-1 px-3 rounded-lg shadow-md transition-transform duration-200 hover:scale-105"
                                onClick={() => setShowGemPopup(true)}
                              >
                                {t("gems")}
                              </button>
                            </h2>
                            {
                              Object.entries(gemData || {}).every(([_, stats]) =>
                                Object.values(stats).every(value => !value)
                              ) ? (
                                <p>No gems defined</p>
                              ) : (
                                <div className="space-y-3">
                                  {
                                    Object.entries(gemData || {}).map(([color, stats]) => {
                                      const filtered = Object.entries(stats || {}).filter(([_, value]) => value);
                                      if (filtered.length === 0) return null;
                                      return (
                                        <div key={color}>
                                          <p className="text-blue-200 font-semibold">{t(`gemColors.${color}`, `${color} Gem`)}</p>
                                          {filtered.map(([stat, value], i) => (
                                            <p key={i}>{t(`stats.${stat}`, stat)} : {value}</p>
                                          ))}
                                          <hr className="border-blue-700 my-1" />
                                        </div>
                                      );
                                    })
                                  }
                                </div>
                              )
                            }
                          </div>

                        </div>

                        {/* BLOC STATS SOUS LE PERSONNAGE */}
                        <div className="flex justify-center mt-4 w-full">
                          <div className="flex flex-col items-center w-full gap-2">

                            <div className="flex justify-between items-center w-full -mb-1 pr-2 tank-target">
                              <div className="flex items-center space-x-4">
                                <button
                                  className="bg-gradient-to-r from-[#3b3b9c] to-[#6c63ff] hover:from-[#4a4ab3] hover:to-[#7c72ff] text-red-400 font-semibold py-1 px-3 rounded-lg shadow-md transition-transform duration-200 hover:scale-105"
                                  onClick={() => setShowWeaponPopup(true)}
                                >
                                  {t("weapon")}
                                </button>
                                <p className="text-white">
                                  {hunterWeapons[selectedCharacter]
                                    ? `+${hunterWeapons[selectedCharacter].mainStat || 0} ${characters[selectedCharacter]?.scaleStat || ''}`
                                    : 'Aucune arme définie'}
                                </p>

                              </div>

                              <button
                                onClick={() => setEditStatsMode(!editStatsMode)}
                                className="bg-gradient-to-r from-[#3b3b9c] to-[#6c63ff] hover:from-[#4a4ab3] hover:to-[#7c72ff] text-white-400 font-semibold py-1 px-3 rounded-lg shadow-md transition-transform duration-200 hover:scale-105"
                              >
                                {getEditLabel()}
                              </button>
                            </div>



                            {!editStatsMode ? (
                              <div className="bg-gray-900 p-2 rounded text-xs mt-2 relative group w-full">
                                <div className="font-bold text-white text-center">{t("statFinals")}</div>
                                <div className="flex flex-wrap w-full text-gray-200 text-xs">
                                  {Array.from({ length: Math.ceil(allStats.length / 4) }).map((_, colIndex) => (
                                    <div key={colIndex} className="flex flex-col mr-6">
                                      {allStats.slice(colIndex * 4, colIndex * 4 + 4).map((key) => {
                                        const base = typeof finalStatsWithoutArtefact[key] === 'number' ? finalStatsWithoutArtefact[key] : 0;
                                        const fromArtifact = typeof statsFromArtifacts[key] === 'number' ? statsFromArtifacts[key] : 0;
                                        const total = base + fromArtifact;

                                        return (
                                          <div key={key} className="mb-1 whitespace-nowrap">
                                            <span className="text-blue-300">{t(`stats.${key}`)}</span>: <span className="text-white">{Math.floor(total)}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ))}
                                </div>

                                {/* Infobulle au hover */}
                                <div className="absolute top-0 left-full ml-4 w-64 bg-[#322d59] hover:bg-[#4a3d89] text-white text-[10px] p-2 rounded shadow-lg hidden group-hover:block z-10 border border-purple-500">
                                  <div className="mb-1 font-bold">Stat Breakdown:</div>
                                  {allStats.map((key) => {
                                    const base = typeof flatStats[key] === 'number' ? statsWithoutArtefact[key] : 0;
                                    const fromArtifact = typeof statsFromArtifacts[key] === 'number' ? statsFromArtifacts[key] : 0;
                                    const total = base + fromArtifact;

                                    return (
                                      <div key={key}>
                                        {t(`stats.${key}`)}: <span className="text-blue-300">{base}</span> + <span className="text-green-400">{fromArtifact}</span> = <span className="text-white">{Math.floor(total)}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div className="flex gap-4 tank-targe">
                                {/* Bloc gauche - Flat Stats */}
                                <div className="bg-gray-800 p-2 rounded text-xs w-1/2">
                                  <div className="font-bold mb-2 text-white">Your flat stats</div>
                                  {Object.entries(flatStats).map(([key, value]) => (
                                    <div key={key} className="flex justify-between items-center gap-2 mb-1">
                                      <label className="w-24 text-gray-300">{key}</label>
                                      <input
                                        type="number"
                                        value={value}
                                        onChange={(e) =>
                                          setFlatStats((prev) => ({ ...prev, [key]: +e.target.value }))
                                        }
                                        className="w-20 bg-black text-white px-1 py-0.5 rounded text-right no-spinner"
                                      />
                                    </div>
                                  ))}
                                </div>

                                {/* Bloc droite - Stats Without Artefact */}
                                <div className="bg-gray-800 p-2 rounded text-xs w-1/2">
                                  <div className="font-bold mb-2 text-white">Stats you see without Artefacts</div>
                                  {Object.entries(statsWithoutArtefact).map(([key, value]) => (
                                    <div key={key} className="flex justify-between items-center gap-2 mb-1">
                                      <label className="w-24 text-gray-300">{key}</label>
                                      <input
                                        type="number"
                                        value={value}
                                        onChange={(e) =>
                                          setStatsWithoutArtefact((prev) => ({
                                            ...prev,
                                            [key]: +e.target.value,
                                          }))
                                        }
                                        className="w-20 bg-black text-white px-1 py-0.5 rounded text-right no-spinner"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>



              <div className="flex flex-col gap-y-1 min-w-0 flex-shrink">
                {[...rightArtifacts].map((item, idx) => (
                  <ArtifactCard
                    key={`${activeAccount}-${item.title}-${JSON.stringify(artifactsData[item.title])}`} // ← NOUVELLE KEY !
                    title={item.title}
                    mainStats={item.mainStats}
                    showTankMessage={showTankMessage}
                    recalculateStatsFromArtifacts={recalculateStatsFromArtifacts}
                    artifactData={artifactsData[item.title]}
                    statsWithoutArtefact={statsWithoutArtefact}  // ← AJOUT ICI
                    flatStats={flatStats}
                    onSetIconClick={openSetSelector}                       // ← UTILE SI BESOIN
                    handleLoadSavedSet={handleLoadSavedSet}
                    onArtifactSave={handleSaveArtifactToLibrary}
                    hunter={characters[selectedCharacter]}                        // ← UTILE SI BESOIN
                    substatsMinMaxByIncrements={substatsMinMaxByIncrements}  // ✅ C’EST ICI
                    disableComparisonButton={false} // 👈 AJOUT
                    openComparisonPopup={openComparisonPopup}
                    artifactLibrary={accounts[activeAccount]?.artifactLibrary || {}}
                    onArtifactChange={(updaterFn) =>
                      setArtifactsData(prev => ({
                        ...prev,
                        [item.title]: typeof updaterFn === 'function'
                          ? updaterFn(prev[item.title])
                          : { ...prev[item.title], ...updaterFn }
                      }))
                    }
                  />
                ))}
              </div>

            </div>
          </div>
          {/* <div className={showSernPopup ? 'blur-background' : ''}></div> */}
          <div className="h-[50px] mt-1">


            <div className="relative w-full h-[580px]">
              {/* Zone pour positionner DOM au-dessus du canvas */}




              {showChibiBubble && chibiMessage && (
                <ChibiBubble
                  key={`bubble-${bubbleId}`} // <-- force un rerender total à chaque message
                  message={chibiMessage}
                  position={chibiPos}
                />
              )}
              <div className="flex justify-center items-center relative gap-1">
                <canvas id="canvas-left" width="600" height="240" className="rounded-l-lg shadow-md bg-black w-[40vw] h-auto" />
                <canvas id="canvas-center" width="600" height="240" className="shadow-md bg-black w-[40vw] h-auto" />
                {/* Portail cliquable */}
                <div
                  className="absolute z-50 cursor-pointer hover:scale-105 transition background: red"
                  style={{
                    top: '45%',     // à ajuster selon ton image exacte
                    left: '43.2%',
                    width: '5%',
                    height: '25%'
                  }}
                  onClick={() => {
                    // const isMonarque = localStorage.getItem("isMonarque") === "true";
                    // if (isMonarque) {
                    window.location.href = "/guide-editor";
                    // } else {
                    showTankMessage("Seuls les Monarques peuvent franchir ce portail...", true);
                    // }
                  }}
                />

                <canvas id="canvas-right" width="600" height="240" className="rounded-r-lg shadow-md bg-black w-[40vw] h-auto" />

              </div>
            </div>
          </div>
        </div>


      )}

      {/* 🎭 OVERLAY DE LOADING - AJOUTE ÇA JUSTE AVANT la fermeture du fragment */}
      {isAccountSwitching && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999] backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4 bg-gray-900 p-8 rounded-xl border border-purple-500 shadow-2xl">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 border-t-4 border-t-transparent"></div>
            <p className="text-purple-300 animate-pulse text-lg font-semibold">🐉 Switching accounts...</p>
            <p className="text-gray-400 text-sm">Loading artifacts & builds...</p>
          </div>
        </div>
      )}


      <div
        id="tank-laser"
        className="hidden fixed z-[9999] pointer-events-none transition-all duration-200 tank-target"></div>
    </>
  )
};



export default BuilderBeru;