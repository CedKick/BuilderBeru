import React, { useState, useRef, useCallback } from 'react';
import { useEffect } from 'react';
import { ICON_CLASSES, ICON_ELEMENTS } from './imageLinks';
import { sernTracks } from './soundTracks';
import { MYST_EGGS, mystSernMsg } from './mystEggs';
import { dytextAnimate, parseNarrative, runNarrativeSteps } from "./useDytext";
import ChibiBubble from "./components/ChibiBubble";
import { getMainStatPriorities, getTheoreticalScore } from './utils/statPriority';
import DamageCalculator from './DamageCalculator';
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
import KaiselInteractionMenu from './components/KaiselInteractionMenu';
import { BeruReportSystem, GoldenPapyrusIcon } from './components/BeruReportSystem';
import HallOfFlameDebugPopup from './components/HallOfFlameDebugPopup';
import HallOfFlamePage from './components/HallOfFlamePage';
import AdminValidationPage from './components/AdminValidationPage';
import TVDialogueSystem from './components/TVDialogueSystem';



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
  });


  // 2️⃣ VÉRIFIER que le nouveau système existe
  const current = localStorage.getItem('builderberu_users');
  if (!current) {
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
  const [showKaiselInteractionMenu, setShowKaiselInteractionMenu] = useState(false);
  const [kaiselMenuPosition, setKaiselMenuPosition] = useState({ x: 0, y: 0 });
  const [kaiselMenuCharacter, setKaiselMenuCharacter] = useState('');
  const [beruMenuPosition, setBeruMenuPosition] = useState({ x: 0, y: 0 });
  const [showTvSystem, setShowTvSystem] = useState(false);
  const [tvData, setTvData] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [portalClickCount, setPortalClickCount] = useState(0);
  const [beruMenuCharacter, setBeruMenuCharacter] = useState('');
  const [showHitboxes, setShowHitboxes] = useState(false);
  const [hitboxPositions, setHitboxPositions] = useState({});
  const [showDebugButton, setShowDebugButton] = useState(false);
  const [showHallOfFlameDebug, setShowHallOfFlameDebug] = useState(false);
  const [showDamageCalculator, setShowDamageCalculator] = useState(false);
  const [showAdminPage, setShowAdminPage] = useState(false);
  const [hallOfFlameData, setHallOfFlameData] = useState({ name: '', guild: '' });
  const [showHallOfFlamePage, setShowHallOfFlamePage] = useState(false);
  const [tvDialogue, setTvDialogue] = useState(null);

  const showTvDialogue = (statType, statValue) => {
  setTvData({ statType, statValue });
  setShowTvSystem(true);
};

const handlePortalClick = () => {
  const newCount = portalClickCount + 1;
  setPortalClickCount(newCount);

  // 🎯 Messages progressifs selon le nombre de clics
  switch (newCount) {
    case 1:
      showTankMessage("🚪 Vivement Séville et ses 40°! Qu'on se cache d'ici", true);
      break;
    
    case 3:
      showTankMessage("🤔 Tu insistes sur ce portail... Il cache quelque chose ?", true);
      break;
    
    case 5:
      showTankMessage("🔍 Oh oh... ils sont en train de découvrir un secret...", true, 'tank');
      break;
    
    case 8:
      showTankMessage("👀 Le portail réagit à tes clics... Continue...", true, 'beru');
      break;
    
    case 12:
      showTankMessage("⚡ L'énergie du portail augmente ! Encore quelques clics...", true, 'kaisel');
      break;
    
    case 15:
      showTankMessage("🌀 Le portail commence à vibrer... Tu sens quelque chose ?", true, 'tank');
      break;
    
    case 20:
      showTankMessage("🔥 ATTENTION ! Le portail se charge d'une énergie inconnue !", true, 'beru');
      break;
    
    case 25:
      showTankMessage("⚠️ DANGER ! Le portail est presque activé... 5 clics encore !", true, 'kaisel');
      break;
    
    case 28:
      showTankMessage("🚨 ALERTE DIMENSIONNELLE ! 2 clics pour l'activation !", true, 'tank');
      break;
    
    case 29:
      showTankMessage("💥 UN DERNIER CLIC... ET LE PORTAIL S'OUVRIRA !", true, 'beru');
      break;
    
    case 30:
      // 🎮 OUVERTURE DU JEU !
      showTankMessage("🌟 PORTAIL ACTIVÉ ! BIENVENUE DANS L'AUTRE DIMENSION !", true, 'kaisel');
      setTimeout(() => {
        // Ouvre le jeu canvas dans un nouvel onglet
        window.open('/canvas-game/index.html', '_blank');
        // Reset le compteur pour rejouer l'easter egg
        setPortalClickCount(0);
      }, 2000);
      break;
    
    default:
      // Messages aléatoires pour maintenir l'immersion
      const randomMessages = [
        "🚪 Le portail reste fermé...",
        "🔒 Rien ne se passe... encore...",
        "⭐ Continue de cliquer, quelque chose va arriver...",
        "🌀 Le portail attend ton signal..."
      ];
      const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
      showTankMessage(randomMessage, true);
      break;
  }
};

const handleShowAdminValidation = (token) => {
  setAdminToken(token); // Stocker le token
  setShowAdminPage(true);
};
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
      preferredCanvas: 'canvas-center',
      personality: 'efficient_debugger',
      moveSpeed: 1.2,
      messageInterval: 60000,
      sprites: {
        idle: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750768929/Kaisel_face_dm9394.png',
        left: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750768929/Kaisel_left_m8qkyi.png',
        right: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750768929/Kaisel_right_hmgppo.png',
        up: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750772247/Kaisel_dos_dstl0d.png',
        down: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750768929/Kaisel_face_dm9394.png',
        // 🔥 NOUVEAUX ÉTATS POUR MES FONCTIONS
        scanning: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750768929/Kaisel_face_dm9394.png',
        debugging: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750768929/Kaisel_face_hmgppo.png'
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
      this.canvasLeft = document.getElementById('canvas-left');
      this.canvasCenter = document.getElementById('canvas-center');
      this.canvasRight = document.getElementById('canvas-right');
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
      const canvas = entity.spawnCanvas;
      if (!canvas) return;

      const handleClick = (event) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clickX = (event.clientX - rect.left) * scaleX;
        const clickY = (event.clientY - rect.top) * scaleY;

        const hitboxPadding = 5;
        const VERTICAL_OFFSET = 90;

        const spriteLeft = entity.x - hitboxPadding;
        const spriteRight = entity.x + entity.size + hitboxPadding;
        const spriteTop = entity.y - hitboxPadding - VERTICAL_OFFSET;
        const spriteBottom = entity.y + entity.size + hitboxPadding - VERTICAL_OFFSET;

        // 🔥 CALCULER LA POSITION ÉCRAN pour les hitboxes
        if (window.updateHitboxPosition) {
          const screenLeft = rect.left + (spriteLeft * scaleX);
          const screenTop = rect.top + (spriteTop * scaleY);
          const screenWidth = (spriteRight - spriteLeft) * scaleX;
          const screenHeight = (spriteBottom - spriteTop) * scaleY;

          window.updateHitboxPosition(entity.id, {
            left: screenLeft,
            top: screenTop,
            width: screenWidth,
            height: screenHeight,
            color: entity.id === 'tank' ? 'red' : entity.id === 'beru' ? 'green' : 'cyan'
          });
        }

        const isClickOnSprite = (
          clickX >= spriteLeft &&
          clickX <= spriteRight &&
          clickY >= spriteTop &&
          clickY <= spriteBottom
        );

        if (isClickOnSprite) {
          entity.clickCount++;
          if (entity.id === 'tank') {
            this.handleTankClick(entity);
          } else if (entity.id === 'beru') {
            this.handleBeruClick(entity);
          } else if (entity.id === 'kaisel') {
            this.handleKaiselClick(entity);
          }
        }
      };

      canvas.addEventListener('click', handleClick);
    }
    // 🎯 FEEDBACK VISUEL OPTIONNEL (pour debug)
    showClickFeedback(entity, clickX, clickY) {
      const canvas = entity.spawnCanvas;
      const ctx = canvas.getContext('2d');

      // Petit cercle pour montrer où on a cliqué
      ctx.save();
      ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(clickX, clickY, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();

    }

    // 🔧 ALTERNATIVE - HITBOX RELATIVE À LA TAILLE
    getEntityHitbox(entity, padding = 0.3) {
      // Padding proportionnel à la taille (30% par défaut)
      const paddingPx = entity.size * padding;

      return {
        left: entity.x - paddingPx,
        right: entity.x + entity.size + paddingPx,
        top: entity.y - paddingPx,
        bottom: entity.y + entity.size + paddingPx
      };
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

    handleBeruClick(entity) {
      // ✅ NOUVEAU : appel simplifié sans x,y
      this.callbacks.showBeruMenu(this.callbacks.getSelectedCharacter?.());
    }

    // ⚡ Kaisel click handler - VERSION CORRIGÉE
    handleKaiselClick(entity) {
      const count = entity.clickCount;

      // 🔥 AJOUTE ÇA POUR TESTER

      // Menu après
      this.callbacks.showKaiselMenu(this.callbacks.getSelectedCharacter?.());
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

      const entity = this.entities.get(entityType);
      if (!entity) return;

      const prefix = entityType === 'tank' ? '' :
        entityType === 'beru' ? '🧠 ' :
          entityType === 'kaisel' ? '🐉 ' : '';


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
      } else if (entity.id === 'kaisel') {
        this.handleKaiselWandering(entity); // 🆕 AJOUTER CETTE LIGNE

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
    // 🤝 SYSTÈME ANTI-COLLISION POUR KAISEL & BÉRU
    handleKaiselWandering(entity) {
      // 🔍 VÉRIFIER LA DISTANCE AVEC BÉRU
      const beruEntity = this.entities.get('beru');
      const MIN_DISTANCE = 150; // Distance plus large pour éviter oscillations
      const SAFE_DISTANCE = 200; // Distance de sécurité pour arrêter l'évitement

      if (beruEntity) {
        const distance = this.calculateDistance(entity, beruEntity);

        // 🚨 TROP PROCHE DE BÉRU !
        if (distance < MIN_DISTANCE && !entity.isAvoidingCollision) {
          this.initiateAvoidanceMovement(entity, beruEntity);
          return; // Skip normal wandering
        }

        // ✅ DISTANCE SÉCURISÉE, reprendre mouvement normal
        if (distance >= SAFE_DISTANCE && entity.isAvoidingCollision) {
          entity.isAvoidingCollision = false;
          entity.avoidanceDirection = null;
          entity.img.src = entity.sprites.idle;
        }
      }

      // 🎯 MOUVEMENT NORMAL (si pas d'évitement en cours)
      if (!entity.isAvoidingCollision) {
        this.normalKaiselWandering(entity);
      } else {
        this.executeAvoidanceMovement(entity);
      }
    }

    // 📐 CALCULER DISTANCE ENTRE ENTITÉS
    calculateDistance(entity1, entity2) {
      const dx = entity1.x - entity2.x;
      const dy = entity1.y - entity2.y;
      return Math.sqrt(dx * dx + dy * dy);
    }

    // 🚨 INITIER MOUVEMENT D'ÉVITEMENT
    initiateAvoidanceMovement(entity, otherEntity) {
      // 🛡️ COOLDOWN ANTI-OSCILLATION
      const now = Date.now();
      if (entity.lastAvoidanceTime && (now - entity.lastAvoidanceTime) < 1000) {
        return; // Skip si évitement récent (< 1 seconde)
      }

      entity.isAvoidingCollision = true;
      entity.lastAvoidanceTime = now;

      // 🧠 CALCULER DIRECTION D'ÉVITEMENT STABLE
      const dx = entity.x - otherEntity.x;
      const dy = entity.y - otherEntity.y;

      // 🔒 GARDER LA MÊME DIRECTION si déjà en évitement récent
      if (!entity.avoidanceDirection) {
        if (Math.abs(dx) > Math.abs(dy)) {
          entity.avoidanceDirection = dx > 0 ? 'right' : 'left';
        } else {
          entity.avoidanceDirection = dy > 0 ? 'down' : 'up';
        }
      }

      // ⏰ DURÉE D'ÉVITEMENT PLUS LONGUE
      entity.avoidanceTimer = 3000 + Math.random() * 2000; // 3-5 secondes
    }

    // ⚡ EXÉCUTER MOUVEMENT D'ÉVITEMENT
    executeAvoidanceMovement(entity) {
      if (!entity.avoidanceDirection || entity.avoidanceTimer <= 0) {
        entity.isAvoidingCollision = false;
        return;
      }

      const speed = entity.moveSpeed * 1.5; // Plus rapide en évitement

      switch (entity.avoidanceDirection) {
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

      // ⏱️ DÉCOMPTE DU TIMER
      entity.avoidanceTimer -= 16; // ~60fps

      // 🚧 LIMITES CANVAS
      const canvas = entity.spawnCanvas;
      if (canvas) {
        entity.x = Math.max(0, Math.min(canvas.width - entity.size, entity.x));
        entity.y = Math.max(canvas.height / 2, Math.min(canvas.height - entity.size, entity.y));
      }
    }

    // 🎯 MOUVEMENT NORMAL KAISEL
    normalKaiselWandering(entity) {
      // Kaisel bouge de façon efficace et rapide (personnalité debugger)
      if (!entity.isWandering && Math.random() < 0.005) {
        const directions = ["left", "right", "up", "down"];
        entity.direction = directions[Math.floor(Math.random() * directions.length)];
        entity.isWandering = true;

        const wanderDuration = 2000 + Math.random() * 1500;
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

      // Apply wandering movement
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

        // Limites canvas
        const canvas = entity.spawnCanvas;
        if (canvas) {
          entity.x = Math.max(0, Math.min(canvas.width - entity.size, entity.x));
          entity.y = Math.max(canvas.height / 2, Math.min(canvas.height - entity.size, entity.y));
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
      return updated;
    });

    // 🔥 FORCE un re-render de l'ArtifactCard
    setTimeout(() => {
    }, 100);

    setIsSetSelectorOpen(false);
    setSetSelectorSlot(null);
  };

  // Dans handleLoadSavedSet :
  const handleLoadSavedSet = (slot) => {

    const savedSets = JSON.parse(localStorage.getItem("savedSets") || "{}");

    if (savedSets[slot]) {
      setArtifactsData((prev) => ({
        ...prev,
        [slot]: {
          ...prev[slot],
          set: savedSets[slot],
        },
      }));
    } else {
      console.warn(`❌ Aucun set enregistré pour ${slot}`);
    }
  };


  const handleSaveArtifactToLibrary = (saveData) => {
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

  // 🐉 KAISEL FIX COMPLET - REMPLACE ta fonction getShadowScreenPosition

  const getShadowScreenPosition = (entityType = 'tank') => {
    const shadowManager = window.shadowManager;
    const entity = shadowManager?.entities?.get(entityType);

    if (!entity || !entity.spawnCanvas) {
      console.warn(`❌ ${entityType} entity introuvable`);
      return { x: window.innerWidth / 2, y: window.innerHeight / 2 }; // Fallback centre écran
    }

    const canvas = entity.spawnCanvas;
    const rect = canvas.getBoundingClientRect();

    // 🔥 CALCUL CORRECT avec les bonnes dimensions
    const scaleX = rect.width / canvas.width;   // Scale horizontal
    const scaleY = rect.height / canvas.height; // Scale vertical

    // 🎯 POSITION ÉCRAN EXACTE
    const screenX = rect.left + (entity.x * scaleX);
    const screenY = rect.top + (entity.y * scaleY);

    // 🔧 AJUSTEMENT RESPONSIVE selon la taille d'écran
    const screenWidth = window.innerWidth;
    const baseWidth = 1920; // Référence de design
    const responsiveFactor = screenWidth / baseWidth;

    // Offset adaptatif pour bien centrer le menu
    const offsetY = -40 * responsiveFactor; // S'adapte à la taille d'écran

    const finalX = screenX;
    const finalY = screenY + offsetY;

    return {
      x: finalX,
      y: finalY,
      currentCanvasId: canvas.id
    };
  };
  const getRandomMystEggLine = (charKey, context) => {
    const data = MYST_EGGS?.[charKey]?.[context];
    if (!data || !Array.isArray(data)) return null;
    return data[Math.floor(Math.random() * data.length)];
  };

  const characterStats = {
    'Jinah': { attack: 5909.5, defense: 5100, hp: 10890.5, critRate: 0, mp: 1000 },
    'shuhua': { attack: 5909.5, defense: 5100, hp: 10890.5, critRate: 0, mp: 1000 },
    'miyeon': { attack: 5176.5, defense: 5810.5, hp: 10932.5, critRate: 0, mp: 1000 },
    'niermann': { attack: 5495, defense: 5544, hp: 10825, critRate: 0, mp: 1000 },
    'chae': { attack: 5495, defense: 5544, hp: 10825, critRate: 0, mp: 1000 },
    'kanae': { attack: 5634, defense: 5028, hp: 11628, critRate: 0, mp: 1000 },
    'alicia': { attack: 5836, defense: 5087, hp: 11075, critRate: 0, mp: 1000 },
    'mirei': { attack: 5926, defense: 5040, hp: 10938, critRate: 0, mp: 1000 },
    'baek': { attack: 5171, defense: 5737, hp: 11105, critRate: 0, mp: 1000 },
    'chae-in': { attack: 5854, defense: 5168, hp: 10863, critRate: 0, mp: 1000 },
    'charlotte': { attack: 5113, defense: 5878, hp: 10930, critRate: 0, mp: 1000 },
    'choi': { attack: 5879, defense: 5010, hp: 11144, critRate: 0, mp: 1000 },
    'emma': { attack: 5145, defense: 5102, hp: 12511, critRate: 0, mp: 1000 },
    'esil': { attack: 5866, defense: 5180, hp: 10812, critRate: 0, mp: 1000 },
    'gina': { attack: 5929, defense: 5132, hp: 10781, critRate: 0, mp: 1000 },
    'go': { attack: 5102, defense: 5798, hp: 11125, critRate: 0, mp: 1000 },
    'goto': { attack: 5087, defense: 5186, hp: 12457, critRate: 0, mp: 1000 },
    'han': { attack: 5077, defense: 5187, hp: 12474, critRate: 0, mp: 1000 },
    'harper': { attack: 5146, defense: 5157, hp: 12389, critRate: 0, mp: 1000 },
    'hwang': { attack: 5168, defense: 5786, hp: 11010, critRate: 0, mp: 1000 },
    'isla': { attack: 5243, defense: 5892, hp: 10621, critRate: 0, mp: 1000 },
    'lee': { attack: 5825, defense: 5139, hp: 10986, critRate: 0, mp: 1000 },
    'lim': { attack: 5850, defense: 5240, hp: 10720, critRate: 0, mp: 1000 },
    'meilin': { attack: 5719, defense: 5211, hp: 11058, critRate: 0, mp: 1000 },
    'min': { attack: 5095, defense: 5131, hp: 12555, critRate: 0, mp: 1000 },
    'seo': { attack: 5195, defense: 5262, hp: 12062, critRate: 0, mp: 1000 },
    'seorin': { attack: 5047, defense: 5197, hp: 12517, critRate: 0, mp: 1000 },
    'shimizu': { attack: 5226, defense: 5022, hp: 12509, critRate: 0, mp: 1000 },
    'silverbaek': { attack: 5817, defense: 5162, hp: 10956, critRate: 0, mp: 1000 },
    'thomas': { attack: 5188, defense: 5928, hp: 10622, critRate: 0, mp: 1000 },
    'woo': { attack: 5205, defense: 5862, hp: 10768, critRate: 0, mp: 1000 },
    'yoo': { attack: 5880, defense: 5030, hp: 11100, critRate: 0, mp: 1000 },
    'anna': { attack: 5163, defense: 4487, hp: 9705, critRate: 0, mp: 1000 },
    'han-song': { attack: 5066, defense: 4567, hp: 9741, critRate: 0, mp: 1000 },
    'hwang-dongsuk': { attack: 4533, defense: 4595, hp: 10815, critRate: 0, mp: 1000 },
    'jo': { attack: 5081, defense: 4585, hp: 9673, critRate: 0, mp: 1000 },
    'kang': { attack: 5128, defense: 4506, hp: 9740, critRate: 0, mp: 1000 },
    'kim-chul': { attack: 4561, defense: 5167, hp: 9542, critRate: 0, mp: 1000 },
    'kim-sangshik': { attack: 4670, defense: 5071, hp: 9513, critRate: 0, mp: 1000 },
    'lee-johee': { attack: 4604, defense: 4407, hp: 11064, critRate: 0, mp: 1000 },
    'nam': { attack: 4556, defense: 4563, hp: 10836, critRate: 0, mp: 1000 },
    'park-beom': { attack: 4621, defense: 5096, hp: 9568, critRate: 0, mp: 1000 },
    'park-heejin': { attack: 5024, defense: 4619, hp: 9721, critRate: 0, mp: 1000 },
    'song': { attack: 5252, defense: 4490, hp: 9513, critRate: 0, mp: 1000 },
    'yoo-jinho': { attack: 4591, defense: 5079, hp: 9665, critRate: 0, mp: 1000 }
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
  const [currentSpeaker, setCurrentSpeaker] = useState('tank');
  const [isAccountSwitching, setIsAccountSwitching] = useState(false);
  const [setSelectorSlot, setSetSelectorSlot] = useState(null); // ex: 'Helmet'
  const [showNoyauxPopup, setShowNoyauxPopup] = useState(false);

  // 🐉 KAISEL FIX 4 - INITIALISATION STATE artifactScores SÉCURISÉE
  const [artifactScores, setArtifactScores] = useState(() => {
    try {
      // 🔄 Initialiser avec un objet vide sécurisé
      const initialScores = {};

      // 🛡️ Pré-remplir avec les slots d'artefacts existants
      Object.keys(artifactsData || {}).forEach(slot => {
        initialScores[slot] = 0;
      });

      return initialScores;
    } catch (error) {
      console.error("🐉 Kaisel: Erreur init artifactScores:", error);
      return {};
    }
  });

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

  // 🚨 KAISEL EMERGENCY - STOPPER LA BOUCLE handleArtifactScoreUpdate

  // ❌ PROBLÈME : Cette fonction se redéfinit à chaque render !
  // const handleArtifactScoreUpdate = (slot, score) => { ... }

  // ✅ SOLUTION 1 - useCallback CORRECT (avec dépendances vides)
  const handleArtifactScoreUpdate = useCallback((slot, score) => {
    setArtifactScores(prev => ({ ...prev, [slot]: score }));
  }, []);


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



  // 🐉 KAISEL FIX 3 - FONCTION DE FERMETURE MENU BERU SÉCURISÉE
  const closeBeruMenu = () => {
    try {
      setShowBeruInteractionMenu(false);

      // 🔓 DÉBLOQUER le mouvement de Beru
      if (window.shadowManager?.entities) {
        const beruEntity = window.shadowManager.entities.get('beru');
        if (beruEntity) {
          beruEntity.isMenuActive = false;
        }
      }
    } catch (error) {
      console.error("🐉 Kaisel: Erreur closeBeruMenu:", error);
    }
  };

  const closeKaiselMenu = () => {
    try {
      setShowKaiselInteractionMenu(false);

      // 🔓 DÉBLOQUER le mouvement de Kaisel
      if (window.shadowManager?.entities) {
        const kaiselEntity = window.shadowManager.entities.get('kaisel');
        if (kaiselEntity) {
          kaiselEntity.isMenuActive = false;
        }
      }
    } catch (error) {
      console.error("🐉 Kaisel: Erreur closeKaiselMenu:", error);
    }
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
      scaleStat: '',
      skillMultipliers: {
        core1: 0,
        core2: 0,
        skill1: 0,
        skill2: 0,
        ultimate: 0
      },
      buffs: []
      
    },'jinah': {
  name: 'Jinah',
  img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1753869840/jinah_vrbddm.png',
  icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1753869067/jinah_icon_pfdee6.png',
  class: 'Support',
  grade: 'SSR',
  element: 'Wind',
  scaleStat: 'Defense',
  skillMultipliers: {
    core1: 2.76,
    core2: 14.82,
    skill1: 27.27,
    skill2: 26.61,
    ultimate: 68.69
  },
  buffs: [
    {
      name: 'Shield',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754383923/defense_jinah_bzd7tr.png',
      duration: 30,
      target: 'self',
      effects: [
        { type: 'scaleStat', values: [10, 20, 30] }
      ]
    },
    {
      name: 'Wind Damage Taken Increase',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754383924/wind_damage_taken_jinah_brirej.png',
      duration: 20,
      target: 'shared',
      effects: [
        { type: 'elementalDamage', element: 'Wind', values: [1, 2, 3, 4, 5] }
      ]
    },
    {
      name: 'Sudden Showers',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754383915/rain_jinah_uufuxy.png',
      duration: 25,
      target: 'shared',
      effects: [
        { type: 'damageBuffs', values: [10] }
      ]
    },
    {
      name: 'Aero',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754384587/Aero_jinah_hjuchd.png',
      duration: 25,
      target: 'shared',
      effects: [
        { type: 'elementalDamage', element: 'Wind', values: [2, 4, 6, 8, 10] }
      ]
    },
    {
      name: "Wind's Touch",
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754391315/windtTouch_jinah_w7hmrx.png',
      duration: -1, // Infini
      target: 'shared',
      stacks: 10,
      effects: [
        { type: 'attack', values: [10] },           // +1% Attack
        { type: 'defense', values: [10] },          // +1% Defense
        { type: 'skillBuffs', values: [5] },     // +0.5% Basic Skill
        // Bonus Wind (optionnel, on peut gérer ça plus tard)
        { type: 'attack', condition: 'wind', values: [10] },     // +1% Attack si Wind
        { type: 'defense', condition: 'wind', values: [10] },    // +1% Defense si Wind
        { type: 'skillBuffs', condition: 'wind', values: [5] } // +0.5% Skill si Wind
      ]
    },
    {
  name: "Wings of Freedom",
  img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754394834/wingOfFreedom_jinah_tavng0.png', // Tu devras uploader l'image
  duration: 5,
  target: 'self', // Ou 'shared' si c'est pour toute l'équipe
  stacks: 1,
  effects: [
    { type: 'skillBuffs', values: [10] },      // +10% Basic Skill damage
    { type: 'ultimateBuffs', values: [10] }    // +10% Ultimate Skill damage
  ]
},
{
  name: "4 Star Jinah",
  img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754395402/fourStar_jinah_izutbk.png', // Tu devras uploader l'image
  duration: -1, // Infini (passif)
  target: 'shared', // Pour tous les membres Wind de l'équipe
  effects: [
    { type: 'elementalDamage', element: 'Wind', values: [15] } // +15% Wind damage (5% x 3 alliés Wind)
  ]
},
{
  name: "Jinah's Weapon Buff",
  img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754506761/buffWeapon_jinah_xdosfy.png',
  duration: -1, // Infini
  target: 'shared', // Pour toute l'équipe
  effects: [
    { type: 'skillBuffs', values: [10] } // +10% Basic Skill (déjà calculé pour 5 stacks)
  ]
} 
  ]
}, 'shuhua': {
      name: 'Shuhua',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1751535917/Shuhua1_difnjb.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1751536775/IconShuhua_njc2f2.png',
      class: 'Fighter',
      grade: 'SSR',
      element: 'Water',
      scaleStat: 'Attack',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    }, 'miyeon': {
      name: 'Miyeon',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1751496034/miyeon_ijwudx.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1751496034/miyeon_ijwudx.png',
      class: 'Fighter',
      grade: 'SSR',
      element: 'Light',
      scaleStat: 'Defense',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    }, 'niermann': {
      name: 'Lennart Niermann',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1749114179/niermann_arxjer.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1749114267/build-niermann_phfwmu.png',
      class: 'Fighter',
      grade: 'SSR',
      element: 'Wind',
      scaleStat: 'Defense',
      skillMultipliers: {
        core1: 2.595,
        core2: 16.995,
        skill1: 84.195,
        skill2: 73.695,
        ultimate: 85.305
      },
      buffs: [
        {
  name: "Defensive Divination Circle",
  img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754508325/DefensiveDivinationCircle_lennart_ln8nxu.png',
  duration: 20, // 20 secondes
  target: 'self',
  effects: [
    { type: 'critDamageBuffs', values: [30] },
    { type: 'defense', values: [30] }          
  ]
},
      {
  name: "Defense Reduction Mark",
  img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754512224/DefenseReductionMark_Lennart_rmaard.png',
  duration: 40,
  target: 'self', 
  effects: [
    { type: 'damageBuffs', values: [30] } 
  ]
},
{
  name: "Wind Synergy",
  img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754514229/fourStarLennart_y59gsr.png', 
  duration: 0, 
  target: 'shared',
  effects: [
    { type: 'defense', condition: 'wind', values: [42] }, 
    { type: 'hp', values: [8] } 
  ]
}
]
    },

    'chae': {
      name: 'Cha Hae-In Valkyrie',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604309/chae_mlnz8k.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606282/icons/build-3.png',
      class: 'Fighter',
      grade: 'SSR',
      element: 'Water',
      scaleStat: 'Defense',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'kanae': {
      name: 'Tawata Kanae',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604318/kanae_squvh2.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606320/icons/build-18.png',
      class: 'Assassin',
      grade: 'SSR',
      element: 'Fire',
      scaleStat: 'Attack',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'alicia': {
      name: 'Alicia Blanche',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604309/alicia_fzpzkf.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606278/icons/build.png',
      class: 'Mage',
      grade: 'SSR',
      element: 'Water',
      scaleStat: 'Attack',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'mirei': {
      name: 'Amamiya Mirei',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604327/mirei_nb6arm.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606340/icons/build-26.png',
      class: 'Assassin',
      grade: 'SSR',
      element: 'Wind',
      scaleStat: 'Attack',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'baek': {
      name: 'Baek Yoonho',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604214/baek_tgrbx8.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747647495/build_baek_wwcvhp.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Light',
      scaleStat: 'Defense',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'chae-in': {
      name: 'Cha Hae In',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604308/chae-in_zafver.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606285/icons/build-4.png',
      class: 'Fighter',
      grade: 'SSR',
      element: 'Light',
      scaleStat: 'Attack',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'charlotte': {
      name: 'Charlotte',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604306/charlotte_bbsqv1.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606287/icons/build-5.png',
      class: 'Mage',
      grade: 'SSR',
      element: 'Dark',
      scaleStat: 'Defense',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'choi': {
      name: 'Choi Jong-In',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604310/choi_a4k5sl.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606289/icons/build-6.png',
      class: 'Mage',
      grade: 'SSR',
      element: 'Fire',
      scaleStat: 'Attack',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'emma': {
      name: 'Emma Laurent',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604311/emma_vvw5lt.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606292/icons/build-7.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Fire',
      scaleStat: 'HP',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'esil': {
      name: 'Esil Radiru',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604313/esil_bjzrv2.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606294/icons/build-8.png',
      class: 'Ranger',
      grade: 'SSR',
      element: 'Fire',
      scaleStat: 'Attack',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'gina': {
      name: 'Gina',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604312/gina_emzlpd.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606297/icons/build-9.png',
      class: 'Support',
      grade: 'SSR',
      element: 'Fire',
      scaleStat: 'Attack',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'go': {
      name: 'Go Gunhee',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604312/go_e5tq0a.png',
      icon: 'build_go.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Light',
      scaleStat: 'Defense',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'goto': {
      name: 'Goto Ryuji',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604314/goto_pirfgy.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606299/icons/build-10.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Wind',
      scaleStat: 'HP',
      skillMultipliers: {
        core1: 2.58,
        core2: 8.82,
        skill1: 6.99,
        skill2: 12.75,
        ultimate: 27.84
      },
      buffs: [
        {
  name: "Arrogance",
  img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754515830/arrogance_goto_fnicil.png', 
  duration: 20, // 20 secondes
  target: 'self',
  effects: [
    { type: 'critDamageBuffs', values: [20] }, 
    { type: 'skillBuffs', values: [20] } 
  ]
},
{
  name: "Third Hunter Boost",
  img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754516654/fourStarGoto_qgsvgp.png', // À remplacer
  duration: 0, // Passif permanent
  target: 'shared', // Cible spécifique : 3ème membre de l'équipe
  effects: [
    { type: 'damageBuffs', values: [24] } // +24% de dégâts
  ]
} ]
    },
    'han': {
      name: 'Han Se-Mi',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604315/han_pfyz7e.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606304/icons/build-12.png',
      class: 'Healer',
      grade: 'SSR',
      element: 'Wind',
      scaleStat: 'HP',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'harper': {
      name: 'Harper',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604316/harper_fvn1d9.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606309/icons/build-14.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Dark',
      scaleStat: 'HP',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'hwang': {
      name: 'Hwang Dongsoo',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604316/Hwang_wumgnp.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606311/icons/build-15.png',
      class: 'Fighter',
      grade: 'SSR',
      element: 'Wind',
      scaleStat: 'Defense',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'isla': {
      name: 'Isla Wright',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604215/isla_w9mnlc.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606317/icons/build-17.png',
      class: 'Healer',
      grade: 'SSR',
      element: 'Dark',
      scaleStat: 'Defense',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'lee': {
      name: 'Lee Bora',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604324/lee_khjilr.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606327/icons/build-21.png',
      class: 'Mage',
      grade: 'SSR',
      element: 'Dark',
      scaleStat: 'Attack',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'lim': {
      name: 'Lim Tae-Gyu',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604325/lim_gahgsq.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606332/icons/build-23.png',
      class: 'Ranger',
      grade: 'SSR',
      element: 'Dark',
      scaleStat: 'Attack',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'meilin': {
      name: 'Meilin Fisher',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604218/meilin_k17bnw.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606335/icons/build-24.png',
      class: 'Healer',
      grade: 'SSR',
      element: 'Water',
      scaleStat: 'HP',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'min': {
      name: 'Min Byung-Gu',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604326/min_tw1eio.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606337/icons/build-25.png',
      class: 'Healer',
      grade: 'SSR',
      element: 'Light',
      scaleStat: 'HP',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'seo': {
      name: 'Seo Jiwoo',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604210/seo_qsvfhj.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606349/icons/build-30.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Water',
      scaleStat: 'HP',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'seorin': {
      name: 'Seorin',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604210/seorin_t7irtj.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606352/icons/build-31.png',
      class: 'Ranger',
      grade: 'SSR',
      element: 'Water',
      scaleStat: 'HP',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'shimizu': {
      name: 'Shimizu Akari',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604212/shimizu_a3devg.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606355/icons/build-32.png',
      class: 'Healer',
      grade: 'SSR',
      element: 'Light',
      scaleStat: 'HP',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'silverbaek': {
      name: 'Silver Mane Baek Yoonho',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604211/silverbaek_kg7wuz.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606357/icons/build-33.png',
      class: 'Fighter',
      grade: 'SSR',
      element: 'Dark',
      scaleStat: 'Attack',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'thomas': {
      name: 'Thomas Andre',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604216/thomas_jr9x92.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606363/icons/build-35.png',
      class: 'Fighter',
      grade: 'SSR',
      element: 'Light',
      scaleStat: 'Defense',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'woo': {
      name: 'Woo Jinchul',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604217/woo_pfrpik.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606367/icons/build-36.png',
      class: 'Tank',
      grade: 'SSR',
      element: 'Wind',
      scaleStat: 'Defense',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'yoo': {
      name: 'Yoo Soohyun',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604218/yoo_mrwt08.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606370/icons/build-37.png',
      class: 'Mage',
      grade: 'SSR',
      element: 'Fire',
      scaleStat: 'Attack',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'anna': {
      name: 'Anna Ruiz',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604212/anna_ygnv0l.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606280/icons/build-2.png',
      class: 'Ranger',
      grade: 'SR',
      element: 'Water',
      scaleStat: 'Attack',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'han-song': {
      name: 'Han Song-Yi',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604213/han-song_xsfzja.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606306/icons/build-13.png',
      class: 'Assassin',
      grade: 'SR',
      element: 'Water',
      scaleStat: 'Attack',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'hwang-dongsuk': {
      name: 'Hwang Dongsuk',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604317/hwang-dongsuk_g1humr.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606314/icons/build-16.png',
      class: 'Tank',
      grade: 'SR',
      element: 'Dark',
      scaleStat: 'HP',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'jo': {
      name: 'Jo Kyuhwan',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747689385/jojo3_tjhgu8.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747649046/jojo_vmdzhg.png',
      class: 'Mage',
      grade: 'SR',
      element: 'Light',
      scaleStat: 'Attack',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'kang': {
      name: 'Kang Taeshik',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604320/kang_y6r5f4.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606322/icons/build-19.png',
      class: 'Assassin',
      grade: 'SR',
      element: 'Dark',
      scaleStat: 'Attack',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'kim-chul': {
      name: 'Kim Chul',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604322/kim-chul_z9jha4.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747646719/build__kim-chul_sptghm.png',
      class: 'Tank',
      grade: 'SR',
      element: 'Light',
      scaleStat: 'Defense',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'kim-sangshik': {
      name: 'Kim Sangshik',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604321/kim-sangshik_rmknpe.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606325/icons/build-20.png',
      class: 'Tank',
      grade: 'SR',
      element: 'Wind',
      scaleStat: 'Defense',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'lee-johee': {
      name: 'Lee Johee',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604323/lee-johee_ispe3p.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606330/icons/build-22.png',
      class: 'Healer',
      grade: 'SR',
      element: 'Water',
      scaleStat: 'HP',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'nam': {
      name: 'Nam Chae-Young',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604328/nam_rb2ogg.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606342/icons/build-27.png',
      class: 'Ranger',
      grade: 'SR',
      element: 'Water',
      scaleStat: 'HP',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'park-beom': {
      name: 'Park Beom-Shik',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604328/park-beom_er1y0k.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606345/icons/build-28.png',
      class: 'Fighter',
      grade: 'SR',
      element: 'Wind',
      scaleStat: 'Defense',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'park-heejin': {
      name: 'Park Heejin',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604307/park-heejin_tsukcl.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606347/icons/build-29.png',
      class: 'Mage',
      grade: 'SR',
      element: 'Wind',
      scaleStat: 'Attack',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'song': {
      name: 'Song Chiyul',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604215/song_usr7ja.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606359/icons/build-34.png',
      class: 'Mage',
      grade: 'SR',
      element: 'Fire',
      scaleStat: 'Attack',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
    },
    'yoo-jinho': {
      name: 'Yoo Jinho',
      img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604221/yoo-jinho_csl27q.png',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747606372/icons/build-38.png',
      class: 'Tank',
      grade: 'SR',
      element: 'Light',
      scaleStat: 'Defense',
      skillMultipliers: {
        core1: 3.5,
        core2: 4.8,
        skill1: 12.0,
        skill2: 16.5,
        ultimate: 35.0
      },
      buffs: [
        {
          name: 'Wind Shield',
          values: [5, 10, 15], // Accumulative: 5%, 10%, 15%
          cooldown: 12,
          duration: 8,
          target: 'shared', // 'self' ou 'shared'
          type: 'damageBuffs', // damageBuffs, coreBuffs, skillBuffs, ultimateBuffs, elementalDamage
          element: 'Wind'
        } ]
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

    if (stored?.user?.accounts) {
      Object.entries(stored.user.accounts).forEach(([accountName, accountData]) => {
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
      } else {
        // Sinon, essayer le compte "main"
        const mainAccount = userData.accounts.main;
        const mainRecent = (mainAccount?.recentBuilds || []).filter((id) => characters[id]);

        if (mainRecent.length > 0) {
          defaultCharacter = mainRecent[0];
        } else {
          // En dernier recours, Niermann
          defaultCharacter = 'shuhua';
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
      } else if (defaultCharacter === 'jinah') {
        // Si c'est jinah par défaut, pas de build à charger
      }
      // 🔥 AJOUTE ICI, JUSTE APRÈS setSelectedCharacter :
      if (defaultCharacter && !currentAccount.builds?.[defaultCharacter]) {

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

      setIsBuildsReady(true);
    } catch (error) {
      console.error("❌ Erreur localStorage :", error);
      localStorage.setItem("builderberu_users", JSON.stringify({ user: defaultUserData }));
      setMergedUser(defaultUserData);
      setAccounts(defaultUserData.accounts);
      setActiveAccount("main");
      setRecentBuilds([]);
      setSelectedCharacter('jinah'); // Fallback en cas d'erreur
      setGemData({});
    }
  }, []);


  // 🏆 AJOUTE CES FONCTIONS AU DÉBUT DE TON COMPOSANT BuilderBeru (après les autres fonctions)

  // 🔍 FONCTION DE VALIDATION COMPLÈTE DU HUNTER
  const validateHunterForHallOfFame = (currentArtifacts, currentCores, currentGems) => {
    const validation = {
      isValid: true,
      missing: [],
      details: {}
    };

    // 🎨 VÉRIFICATION DES 8 ARTEFACTS
    const requiredArtifactSlots = ['Helmet', 'Chest', 'Gloves', 'Boots', 'Necklace', 'Bracelet', 'Ring', 'Earrings'];
    const artifactCount = requiredArtifactSlots.filter(slot => {
      const artifact = currentArtifacts[slot];
      return artifact && (artifact.mainStat || artifact.set); // Au minimum un mainStat ou set défini
    }).length;

    validation.details.artifacts = {
      current: artifactCount,
      required: 8,
      isComplete: artifactCount === 8
    };

    if (artifactCount < 8) {
      validation.isValid = false;
      validation.missing.push(`Artefacts manquants (${artifactCount}/8)`);
    }

    // 🔮 VÉRIFICATION DES CORES
    const requiredCoreSlots = ['Offensif', 'Défensif', 'Endurance'];
    const coreCount = requiredCoreSlots.filter(slot => {
      const core = currentCores[slot];
      return core && core.primary; // Au minimum un primary défini
    }).length;

    validation.details.cores = {
      current: coreCount,
      required: 3,
      isComplete: coreCount === 3
    };

    if (coreCount < 3) {
      validation.isValid = false;
      validation.missing.push(`Cores manquants (${coreCount}/3)`);
    }

    // 💎 VÉRIFICATION DES GEMMES (optionnel mais recommandé)
    const gemCount = Object.keys(currentGems || {}).filter(slot => {
      const gem = currentGems[slot];
      return gem && Object.values(gem).some(value => value > 0); // Au moins une valeur > 0
    }).length;

    validation.details.gems = {
      current: gemCount,
      recommended: 5,
      isComplete: gemCount >= 3 // Au moins 3 types de gemmes
    };

    if (gemCount < 3) {
      validation.missing.push(`Gemmes recommandées (${gemCount}/5)`);
      // Pas bloquant mais warning
    }

    return validation;
  };

  // 🏆 FONCTION POUR LE BOUTON SUBMIT HALL OF FAME
  const handleSubmitToHallOfFame = () => {
    const validation = validateHunterForHallOfFame(artifactsData, hunterCores[selectedCharacter] || {}, gemData);

    if (!validation.isValid) {
      // 🚫 HUNTER INCOMPLET - MESSAGE KAISEL
      const missingItems = validation.missing.join(', ');
      showTankMessage(
        `🏆 **SUBMISSION HALL OF FAME REFUSÉE**\n\n` +
        `❌ Hunter incomplet détecté par Kaisel !\n\n` +
        `**Éléments manquants :**\n${missingItems}\n\n` +
        `📋 **Détails :**\n` +
        `🎨 Artefacts: ${validation.details.artifacts.current}/8\n` +
        `🔮 Cores: ${validation.details.cores.current}/3\n` +
        `💎 Gemmes: ${validation.details.gems.current}/5\n\n` +
        `⚡ Complète ton build avant de le soumettre !`,
        true,
        'kaisel'
      );
      return;
    }

    // ✅ HUNTER COMPLET - OUVRIR LA POPUP
    showTankMessage(
      `🏆 **HUNTER VALIDÉ PAR KAISEL !**\n\n` +
      `✅ Build complet détecté :\n` +
      `🎨 ${validation.details.artifacts.current}/8 Artefacts\n` +
      `🔮 ${validation.details.cores.current}/3 Cores\n` +
      `💎 ${validation.details.gems.current}/5 Gemmes\n\n` +
      `🚀 Ouverture du système de soumission...`,
      true,
      'kaisel'
    );

    // Ouvrir la popup HallOfFlameDebug
    if (typeof setShowHallOfFlameDebug === 'function') {
      setShowHallOfFlameDebug(true);
    } else {
      showTankMessage("🤖 Erreur : système HallOfFlame non trouvé", true, 'kaisel');
    }
  };



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

    if (selectedCharacter === 'kanae') {
      const newKanaeCount = kanaeSaveCount + 1;
      setKanaeSaveCount(newKanaeCount);

      if (newKanaeCount === 5) {
        showTankMessage("🌸 Kanae... encore ? Le SERN t'observe...", true);
        setTimeout(() => {
          triggerSernIntervention(); // ← Déclenche le popup
          setKanaeSaveCount(0); // Reset
        }, 2000);
      } else if (newKanaeCount === 3) {
        showTankMessage("🌸 Kanae sauvegardée 3 fois... Suspect...", true, 'kaisel');
      }
    }

    // 🃏 EASTER EGG JO (si tu veux le remettre aussi)
    if (selectedCharacter === 'jo') {
      const newJoCount = joSaveCount + 1;
      setJoSaveCount(newJoCount);

      if (newJoCount === 7) {
        setTimeout(() => {
          triggerSernIntervention();
          setJoSaveCount(0);
        }, 1000);
      }
    }

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
    if (!showHitboxes) {
      setHitboxPositions({});
      return;
    }

    // Fonction globale pour recevoir les positions
    window.updateHitboxPosition = (entityId, position) => {
      setHitboxPositions(prev => ({
        ...prev,
        [entityId]: position
      }));
    };

    // Update toutes les 100ms quand actif
    const interval = setInterval(() => {
      if (window.shadowManager?.entities) {
        window.shadowManager.entities.forEach((entity) => {
          if (entity.spawnCanvas) {
            const canvas = entity.spawnCanvas;
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            const hitboxPadding = 20;
            const VERTICAL_OFFSET = 50;

            const spriteLeft = entity.x - hitboxPadding;
            const spriteRight = entity.x + entity.size + hitboxPadding;
            const spriteTop = entity.y - hitboxPadding - VERTICAL_OFFSET;
            const spriteBottom = entity.y + entity.size + hitboxPadding - VERTICAL_OFFSET;

            const screenLeft = rect.left + (spriteLeft * scaleX);
            const screenTop = rect.top + (spriteTop * scaleY);
            const screenWidth = (spriteRight - spriteLeft) * scaleX;
            const screenHeight = (spriteBottom - spriteTop) * scaleY;

            // 🔥 DEBUG - Ajoute juste ça pour voir
            console.log(`🎯 ${entity.id}:`, { left: screenLeft, top: screenTop, width: screenWidth, height: screenHeight });

            setHitboxPositions(prev => ({
              ...prev,
              [entity.id]: {
                left: screenLeft,
                top: screenTop,
                width: screenWidth,
                height: screenHeight,
                color: entity.id === 'tank' ? 'red' : entity.id === 'beru' ? 'green' : 'cyan'
              }
            }));
          }
        });
      }
    }, 100);

    return () => {
      clearInterval(interval);
      window.updateHitboxPosition = null;
    };
  }, [showHitboxes]);

  // 5️⃣ AJOUTE CES HITBOXES dans le return de BuilderBeru (à la fin, juste avant </> )
  {/* 🐛 HITBOXES DEBUG OVERLAY */ }
  {
    showHitboxes && Object.entries(hitboxPositions).map(([entityId, pos]) => (
      <div
        key={entityId}
        style={{
          position: 'fixed',
          left: pos.left,
          top: pos.top,
          width: pos.width,
          height: pos.height,
          border: `2px dashed ${pos.color}`,
          backgroundColor: `${pos.color}33`, // 33 = transparence
          pointerEvents: 'none',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          color: 'white',
          fontWeight: 'bold',
          textShadow: '1px 1px 2px black'
        }}
      >
        {entityId.toUpperCase()}
      </div>
    ))
  }

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
        let messageSource;

        // Essaie d'abord i18n, sinon fallback sur mystSernMsg
        try {
          messageSource = t('mystSerNMsg.message', { returnObjects: true });
          if (!Array.isArray(messageSource) || messageSource.length === 0) {
            throw new Error('No i18n messages found');
          }
        } catch {
          // Fallback sur l'ancien système
          messageSource = mystSernMsg.message;
        }

        // Sélection aléatoire
        const randomEncoded = messageSource[Math.floor(Math.random() * messageSource.length)];

        // Décodage Base64
        const decoded = decodeURIComponent(escape(atob(randomEncoded)));

        dytextAnimate(dytextRef, decoded, 30, {
          onComplete: () => {
            setTimeout(() => {
              triggerFadeOutAllMusic();
            }, 13000);
            setTimeout(() => {
              setShowSernPopup(false);
            }, 10000);
          },
        });

      } catch (error) {
        console.warn("💥 Le SERN a subi une interférence temporelle :", error);
      }
    }
  }, [showSernPopup, t]);



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


    // 🔍 Vérification 2 : localStorage
    const stored = JSON.parse(localStorage.getItem("builderberu_users"));


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

    // 🔍 Vérification 4 : path complet
    const userAccounts = stored?.user?.accounts;

    const targetAccount = userAccounts?.[activeAccount];

    const builds = targetAccount?.builds;

    const build = builds?.[characterName];

    if (!build) {
      showTankMessage(`Aucun build sauvegardé pour ${characterName} 😶`, true);
      return;
    }


    // 📦 CHARGEMENT COMPLET de TOUTES les données du build

    // 1️⃣ Personnage sélectionné
    setSelectedCharacter(characterName);

    // 2️⃣ Stats de base
    setFlatStats(build.flatStats || {});

    setStatsWithoutArtefact(build.statsWithoutArtefact || {});

    // 3️⃣ Artefacts complets
    setArtifactsData(build.artifactsData || {});

    // 4️⃣ Hunter cores
    setHunterCores(prev => ({
      ...prev,
      [characterName]: build.hunterCores || {}
    }));

    // 5️⃣ Hunter weapons
    setHunterWeapons(prev => ({
      ...prev,
      [characterName]: build.hunterWeapons || {}
    }));

    // 6️⃣ Gemmes du compte
    if (build.gems) {
      setGemData(build.gems);
    }

    // 7️⃣ Message de confirmation
    showTankMessage(`✅ ${characters[characterName]?.name || characterName} chargé !`, true);

  };


  // 2️⃣ REMPLACE ta fonction handleAccountSwitch par cette version smooth :
  const handleAccountSwitch = async (newAccountName) => {

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

  const createStableShowTankMessage = (setShowChibiBubble, setBubbleId, setChibiPos, setChibiMessage, isTankSpeaking, messageQueue, currentTimeout, getShadowScreenPosition) => {
    return (message, priority = false, entityType = 'tank') => {
      try {
        if (!message || typeof message !== 'string') return;

        if (isTankSpeaking.current && !priority) {
          messageQueue.current.push({ message, entityType });
          return;
        }

        if (priority && isTankSpeaking.current) {
          if (currentTimeout.current) {
            clearTimeout(currentTimeout.current);
          }
        }

        isTankSpeaking.current = true;
        setShowChibiBubble(false);
        setBubbleId(Date.now());

        const pos = getShadowScreenPosition(entityType);
        const messageOffset = Math.min(200, message.length * 0.6);
        const adjustedPos = {
          x: pos.x,
          y: pos.y - messageOffset,
          currentCanvasId: pos.currentCanvasId
        };

        setChibiPos(adjustedPos);
        setShowChibiBubble(true);
        setChibiMessage(message);

        const displayDuration = Math.min(Math.max(4000, message.length * 80), 20000);

        currentTimeout.current = setTimeout(() => {
          setShowChibiBubble(false);
          isTankSpeaking.current = false;

          if (messageQueue.current.length > 0) {
            const next = messageQueue.current.shift();
            setTimeout(() => {
              createStableShowTankMessage(setShowChibiBubble, setBubbleId, setChibiPos, setChibiMessage, isTankSpeaking, messageQueue, currentTimeout, getShadowScreenPosition)(next.message, false, next.entityType);
            }, 100);
          }

          currentTimeout.current = null;
        }, displayDuration);

      } catch (error) {
        console.error("🐉 Kaisel: showTankMessage error:", error);
        isTankSpeaking.current = false;
      }
    };
  };

  // 2️⃣ AJOUTE un raccourci clavier pour l'afficher
  useEffect(() => {
    // Fonction accessible depuis la console
    window.toggleDebug = () => {
      setShowDebugButton(prev => {
        const newValue = !prev;
        console.log(`🐛 Debug button: ${newValue ? 'VISIBLE' : 'HIDDEN'}`);
        return newValue;
      });
    };

    return () => {
      delete window.toggleDebug;
    };
  }, []);



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


  // 🐉 REMPLACE ton useEffect ShadowManager par celui-ci :
  useEffect(() => {
    // ✅ VÉRIFICATION : Seulement si on est sur la vue 'main' 
    const isMobileDevice = window.innerWidth < 1024;
    const shouldInitShadows = !isMobileDevice || mobileView === 'main';

    if (!shouldInitShadows) {
      // 🧹 CLEANUP si on quitte la vue main sur mobile
      if (window.shadowManager) {
        window.shadowManager.cleanup();
        window.shadowManager = null;
      }
      return;
    }

    // 🔒 PROTECTION : Nettoyage préalable
    if (window.shadowManager) {
      window.shadowManager.cleanup();
      window.shadowManager = null;
    }

    const shadowManager = new ShadowManager();
    window.shadowManager = shadowManager;
    shadowManager.setTranslation(t);
    window.getShadowScreenPosition = getShadowScreenPosition;

    // 🔥 CALLBACKS avec références stables
    const callbacks = {
      showMessage: showTankMessage,
      showBeruMenu: (selectedCharacter) => {
        try {
          if (window.shadowManager?.entities) {
            const beruEntity = window.shadowManager.entities.get('beru');
            if (beruEntity) {
              beruEntity.isMenuActive = true;
            }
          }

          const pos = getShadowScreenPosition('beru');
          const adjustedPos = {
            x: pos.x - 10,
            y: pos.y,
            currentCanvasId: pos.currentCanvasId
          };

          setShowBeruInteractionMenu(true);
          setBeruMenuPosition({ x: adjustedPos.x, y: adjustedPos.y });
          setBeruMenuCharacter(selectedCharacter || '');
        } catch (error) {
          console.error("🐉 Kaisel: Erreur showBeruMenu:", error);
        }
      },
      showKaiselMenu: (selectedCharacter) => {
        try {
          if (window.shadowManager?.entities) {
            const kaiselEntity = window.shadowManager.entities.get('kaisel');
            if (kaiselEntity) {
              kaiselEntity.isMenuActive = true;
            }
          }

          const pos = getShadowScreenPosition('kaisel');
          const adjustedPos = {
            x: pos.x - 10,
            y: pos.y,
            currentCanvasId: pos.currentCanvasId
          };

          setShowKaiselInteractionMenu(true);
          setKaiselMenuPosition({ x: adjustedPos.x, y: adjustedPos.y });
          setKaiselMenuCharacter(selectedCharacter || '');
        } catch (error) {
          console.error("🐉 Kaisel: Erreur showKaiselMenu:", error);
        }
      },
      getSelectedCharacter: () => selectedCharacter,
      onShowHallOfFlame: () => {
        setShowHallOfFlameDebug(true);
      }
    };

    // 🎯 DELAY pour éviter les conflits de rendu
    const initTimer = setTimeout(() => {
      try {
        // ✅ VÉRIFICATION CANVAS EXISTE AVANT INIT
        const canvasLeft = document.getElementById('canvas-left');
        const canvasCenter = document.getElementById('canvas-center');
        const canvasRight = document.getElementById('canvas-right');

        if (!canvasLeft || !canvasCenter || !canvasRight) {
          console.warn("🐉 Kaisel: Canvas manquants, skip init");
          return;
        }

        shadowManager.init(['canvas-left', 'canvas-center', 'canvas-right'], callbacks);
        shadowManager.spawnEntity('tank');
        shadowManager.spawnEntity('beru');
        shadowManager.spawnEntity('kaisel');
      } catch (error) {
        console.error("🐉 Kaisel: Shadow init error:", error);
      }
    }, 100);

    const keyboardCleanup = shadowManager.setupKeyboardControls();

    return () => {
      clearTimeout(initTimer);
      if (shadowManager) {
        shadowManager.cleanup();
      }
      if (keyboardCleanup) keyboardCleanup();
      window.shadowManager = null;
      window.getShadowScreenPosition = null;
    };
  }, [t, selectedCharacter, mobileView]); // ← AJOUT mobileView dans les dépendances
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
    try {
      if (!message || typeof message !== 'string') {
        console.warn("🐉 Kaisel: Message invalide ignoré");
        return;
      }

      if (isTankSpeaking.current && !priority) {
        messageQueue.current.push({ message, entityType });
        return;
      }

      if (priority && isTankSpeaking.current) {
        if (currentTimeout.current) {
          clearTimeout(currentTimeout.current);
        }
      }

      isTankSpeaking.current = true;
      setShowChibiBubble(false);
      setBubbleId(Date.now());
      setCurrentSpeaker(entityType); // ← NOUVEAU : Track l'entité

      const pos = getShadowScreenPosition(entityType);
      const isMobileDevice = isMobile?.isPhone || isMobile?.isTablet || window.innerWidth < 768;

      const adjustedPos = isMobileDevice ? {
        x: window.innerWidth / 2,
        y: 80,
        currentCanvasId: pos.currentCanvasId
      } : {
        x: pos.x,
        y: pos.y - Math.min(200, message.length * 0.6),
        currentCanvasId: pos.currentCanvasId
      };

      setChibiPos(adjustedPos);
      setShowChibiBubble(true);
      setChibiMessage(message);

      const displayDuration = isMobileDevice ?
        Math.min(Math.max(6000, message.length * 120), 30000) :
        Math.min(Math.max(4000, message.length * 80), 20000);

      currentTimeout.current = setTimeout(() => {
        setShowChibiBubble(false);
        isTankSpeaking.current = false;

        if (messageQueue.current.length > 0) {
          const next = messageQueue.current.shift();
          setTimeout(() => {
            showTankMessage(next.message, false, next.entityType);
          }, 100);
        }

        currentTimeout.current = null;
      }, displayDuration);

    } catch (error) {
      console.error("🐉 Kaisel: showTankMessage error:", error);
      isTankSpeaking.current = false;
    }
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

  const getCurrentHunterData = () => {
    if (!selectedCharacter) return null;

    return {
      character: selectedCharacter,
      characterName: characters[selectedCharacter]?.name || selectedCharacter,
      stats: finalStats,
      artifacts: artifactsData,
      cores: hunterCores[selectedCharacter] || {},
      gems: gemData || {},
      weapon: hunterWeapons[selectedCharacter] || {},
      // Score global (si tu as un système de scoring)
      totalScore: Object.values(artifactScores).reduce((sum, score) => sum + score, 0)
    };
  };

  const handleCloseBubble = () => {
    setShowChibiBubble(false);
    isTankSpeaking.current = false;

    // Clear le timeout actuel
    if (currentTimeout.current) {
      clearTimeout(currentTimeout.current);
      currentTimeout.current = null;
    }

    // Traiter la queue si messages en attente
    if (messageQueue.current.length > 0) {
      const next = messageQueue.current.shift();
      setTimeout(() => {
        showTankMessage(next.message, false, next.entityType);
      }, 100);
    }
  };

  return (
    <>
 {tvDialogue && (
      <TVDialogueSystem 
        key={`tv-${tvDialogue.statType}-${tvDialogue.statValue}`}
        show={!!tvDialogue}
        statType={tvDialogue.statType}
        statValue={tvDialogue.statValue}
        onClose={() => setTvDialogue(null)}
      />
    )}
      {((isMobile.isPhone || isMobile.isTablet) && !isMobile.isDesktop) ? (
        <>
          {/* 🔥 CONTAINER PRINCIPAL - HAUTEUR DYNAMIQUE */}
          <div className="min-h-screen bg-gray-950 text-white tank-target overflow-y-auto">
            <div className="w-full flex justify-center">
              <div className="w-full max-w-[95vw] mx-auto px-2">

                {/* 🎯 VUE MAIN */}
                {mobileView === 'main' && (
                  <div className="w-full mx-auto py-4 pb-32 space-y-6">
                    {/* ← pb-32 pour navigation + canvas */}

                    {/* SECTION FILTRES + SELECT */}
                   <div className="flex flex-col w-full gap-4">
  {/* Langues + Select */}
  <div className="flex items-center gap-2 justify-between">
    <div className="flex gap-2 items-center">
      <img
        src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748533955/Francia_sboce9.png"
        alt="Français"
        onClick={() => i18n.changeLanguage('fr')}
        className="w-7 h-5 cursor-pointer hover:scale-110 transition-transform rounded border border-transparent hover:border-purple-500"
      />
      <img
        src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748533955/BritishAirLine_s681io.png"
        alt="English"
        onClick={() => i18n.changeLanguage('en')}
        className="w-7 h-5 cursor-pointer hover:scale-110 transition-transform rounded border border-transparent hover:border-purple-500"
      />
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
  className="p-2 rounded-lg bg-purple-900/30 text-purple-300 text-sm
            border border-purple-600/50 hover:border-purple-500
            focus:outline-none focus:border-purple-400
            flex-1 max-w-[200px]"
  style={{
    backgroundColor: 'rgba(30, 30, 50, 0.95)',
    color: '#e9d5ff'
  }}
>
  <option value="" style={{ backgroundColor: '#1a1a2e', color: '#e9d5ff' }}>
    Sélectionner un personnage
  </option>
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
      <option 
        key={key} 
        value={key}
        style={{ backgroundColor: '#1a1a2e', color: '#e9d5ff' }}
      >
        {char.name}
      </option>
    ))}
</select>
  </div>

  {/* BOUTONS D'ACTION - VERSION MOBILE SOBRE */}
  <div className="flex flex-col gap-3 w-full">
    {/* Ligne 1 - Actions principales */}
    <div className="flex gap-2 w-full">
      <button
        onClick={handleResetStats}
        className="flex-1 bg-purple-800/30 text-purple-300
                  border border-purple-600/50
                  font-semibold px-3 py-2 text-xs rounded-lg
                  transition-all duration-200 active:scale-95"
      >
        BobbyKick
      </button>

      <button
        onClick={handleSaveBuild}
        className="flex-1 bg-purple-800/30 text-purple-300
                  border border-purple-600/50
                  font-bold px-3 py-2 text-xs rounded-lg
                  transition-all duration-200 active:scale-95"
      >
        Save
      </button>

      <button
        onClick={() => {
          const validation = validateHunterForHallOfFame(artifactsData, hunterCores[selectedCharacter] || {}, gemData);
          if (validation.isValid) {
            handleSubmitToHallOfFame();
          } else {
            showTankMessage(
              `🏆 **BUILD INCOMPLET**\n\n${validation.missing.join('\n')}\n\n🔧 Termine ton build avant submission !`,
              true,
              'kaisel'
            );
          }
        }}
        className={`
          flex-1
          ${validateHunterForHallOfFame(artifactsData, hunterCores[selectedCharacter] || {}, gemData).isValid
            ? 'bg-purple-800/30 text-purple-300 border-purple-600/50'
            : 'bg-gray-800/30 text-gray-500 border-gray-700/50'
          } 
          font-semibold px-3 py-2 text-xs rounded-lg border
          transition-all duration-200 active:scale-95
        `}
        disabled={!validateHunterForHallOfFame(artifactsData, hunterCores[selectedCharacter] || {}, gemData).isValid}
      >
        {validateHunterForHallOfFame(artifactsData, hunterCores[selectedCharacter] || {}, gemData).isValid
          ? 'Submit'
          : 'Incomplet'
        }
      </button>
    </div>

    {/* Ligne 2 - Import et New */}
    <div className="flex gap-2 w-full">
      <button
        onClick={handleImportBuild}
        className="flex-1 bg-purple-800/30 text-purple-300
                  border border-purple-600/50
                  font-semibold px-3 py-2 text-xs rounded-lg
                  transition-all duration-200 active:scale-95"
      >
        Import
      </button>

      <button
        onClick={() => setShowNewAccountPopup(true)}
        className="flex-1 bg-purple-800/30 text-purple-300
                  border border-purple-600/50
                  font-semibold px-3 py-2 text-xs rounded-lg
                  transition-all duration-200 active:scale-95"
      >
        New
      </button>
    </div>

    {/* Ligne 3 - Builds récents et Account */}
    <div className="flex items-center justify-between gap-3">
      {/* Builds récents */}
      {isBuildsReady && recentBuilds.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto">
          {recentBuilds
            .filter((charKey) => characters[charKey])
            .slice(0, 5)
            .map((charKey) => (
              <img
                key={charKey}
                src={characters[charKey]?.icon || '/default.png'}
                alt={characters[charKey]?.name || charKey}
                onClick={() => handleClickBuildIcon(charKey)}
                className="w-8 h-8 rounded-full cursor-pointer 
                          border-2 border-purple-600/50
                          transition-all duration-200 active:scale-40
                          opacity-80 flex-shrink-0"
              />
            ))}
        </div>
      )}

      {/* Account selector */}
      {Object.keys(accounts).length > 1 && (
        <select
          value={activeAccount}
          onChange={(e) => handleAccountSwitch(e.target.value)}
          className="bg-purple-900/30 text-purple-300 border border-purple-600/50
                    px-2 py-1.5 rounded-lg text-xs
                    focus:outline-none focus:border-purple-400"
        >
          {Object.keys(accounts).map(acc => (
            <option key={acc} value={acc} className="bg-gray-900">
              {acc.length > 8 ? acc.slice(0, 8) + '...' : acc}
            </option>
          ))}
        </select>
      )}
    </div>
  </div>

  {/* Debug Button */}
  {showDebugButton && (
    <button
      onClick={() => setShowHitboxes(!showHitboxes)}
      className="fixed top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs z-[10001]"
    >
      🐛 {showHitboxes ? 'HIDE' : 'SHOW'} HITBOX
    </button>
  )}
</div>

                    {/* SECTION PRINCIPALE - NOYAUX + PERSONNAGE + GEMMES */}
                    <div className="flex flex-col items-center space-y-6">

                      {/* LAYOUT RESPONSIVE NOYAUX/PERSONNAGE/GEMMES */}
                      <div className="w-full flex flex-col sm:flex-row justify-between items-start gap-4">

                        {/* Bloc Noyaux */}
                        <div className="w-full sm:w-1/3 text-white text-xs">
                          <div className="text-center mb-2">
                            <button
                              className="bg-gradient-to-r from-[#3b3b9c] to-[#6c63ff] hover:from-[#4a4ab3] hover:to-[#7c72ff] text-pink-200 font-semibold px-3 py-2 text-sm rounded-lg shadow-md transition-transform duration-200 hover:scale-105"
                              onClick={() => setShowNoyauxPopup(true)}
                            >
                              {t("cores")}
                            </button>
                          </div>

                          {hunterCores[selectedCharacter] ? (
                            <div className="space-y-2 text-center">
                              {['Offensif', 'Défensif', 'Endurance'].map((type, index) => {
                                const core = hunterCores[selectedCharacter]?.[type];
                                if (!core) return null;

                                const showPrimary = core.primary && parseFloat(core.primaryValue) !== 0;
                                const showSecondary = core.secondary && parseFloat(core.secondaryValue) !== 0;

                                if (!showPrimary && !showSecondary) return null;

                                return (
                                  <div key={index} className="border border-purple-800 rounded p-2 bg-gray-800">
                                    <p className="text-purple-200 font-semibold">{t(`coreTypes.${type}`)}</p>
                                    {showPrimary && (
                                      <p className="text-xs">{t(`stats.${core.primary}`)}: {core.primaryValue}</p>
                                    )}
                                    {showSecondary && (
                                      <p className="text-xs">{core.secondary}: {core.secondaryValue}</p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-center text-gray-400">No cores defined</p>
                          )}
                        </div>

                        {/* Bloc Personnage Centre */}
                        <div className="w-full sm:w-1/3 flex flex-col items-center">
                          <div className="relative">
                            {selectedCharacter && characters[selectedCharacter] && characters[selectedCharacter].img ? (
                              <>
                                <img
                                  src={characters[selectedCharacter].img}
                                  alt={characters[selectedCharacter].name}
                                  className="w-48 h-auto mb-2 relative z-10"
                                  id="targetToDestroy"
                                />
                                {showHologram && selectedCharacter && characters[selectedCharacter]?.element && (
                                  <div
                                    className="absolute w-60 h-8 rounded-full blur-sm animate-fade-out z-0"
                                    style={{
                                      backgroundColor: getElementColor(characters[selectedCharacter].element),
                                      bottom: '0px',
                                      marginLeft: '-15px'
                                    }}
                                  ></div>
                                )}
                              </>
                            ) : (
                              <img
                                src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748276015/beru_select_Char_d7u6mh.png"
                                className="w-48 h-auto mb-2 relative z-10"
                                id="targetToDestroy"
                              />
                            )}
                          </div>
                        </div>

                        {/* Bloc Gemmes */}
                        <div className="w-full sm:w-1/3 text-white text-xs">
                          <div className="text-center mb-2">
                            <button
                              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-blue-100 font-semibold px-3 py-2 text-sm rounded-lg shadow-md transition-transform duration-200 hover:scale-105"
                              onClick={() => setShowGemPopup(true)}
                            >
                              {t("gems")}
                            </button>
                          </div>

                          {Object.entries(gemData || {}).every(([_, stats]) =>
                            Object.values(stats).every(value => !value)
                          ) ? (
                            <p className="text-center text-gray-400">No gems defined</p>
                          ) : (
                            <div className="space-y-2">
                              {Object.entries(gemData || {}).map(([color, stats]) => {
                                const filtered = Object.entries(stats || {}).filter(([_, value]) => value);
                                if (filtered.length === 0) return null;
                                return (
                                  <div key={color} className="border border-blue-700 rounded p-2 bg-gray-800 text-center">
                                    <p className="text-blue-200 font-semibold">{t(`gemColors.${color}`, `${color} Gem`)}</p>
                                    {filtered.map(([stat, value], i) => (
                                      <p key={i} className="text-xs">{t(`stats.${stat}`, stat)}: {value}</p>
                                    ))}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* SECTION ARME + STATS */}
                      <div className="w-full space-y-4">

                       {/* Bouton Arme */}
<div className="flex items-center justify-center space-x-4">
  <button
    className="bg-gradient-to-r from-[#3b3b9c] to-[#6c63ff] hover:from-[#4a4ab3] hover:to-[#7c72ff] text-red-400 font-semibold px-4 py-2 text-sm rounded-lg shadow-md transition-transform duration-200 hover:scale-105"
    onClick={() => setShowWeaponPopup(true)}
  >
    {t("weapon")}
  </button>
  
  <p className="text-white text-sm">
    {hunterWeapons[selectedCharacter]
      ? `+${hunterWeapons[selectedCharacter].mainStat || 0} ${characters[selectedCharacter]?.scaleStat || ''}`
      : 'Aucune arme définie'}
  </p>
  
  {/* NOUVEAU BOUTON CALCULATEUR */}
  <button
    onClick={() => setShowDamageCalculator(true)}
    className="relative bg-gradient-to-r from-[#8b3b3b] to-[#ff6363] hover:from-[#a34a4a] hover:to-[#ff7272] text-white font-semibold px-4 py-2 text-sm rounded-lg shadow-md transition-transform duration-200 hover:scale-105 flex items-center gap-2"
  >
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
    <span>Calc</span>
    <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[10px] px-1 py-0.5 rounded-full font-bold animate-pulse">
      NEW
    </span>
  </button>
  
  <button
    onClick={() => setEditStatsMode(!editStatsMode)}
    className="bg-gradient-to-r from-[#3b3b9c] to-[#6c63ff] hover:from-[#4a4ab3] hover:to-[#7c72ff] text-white-400 font-semibold px-4 py-2 text-sm rounded-lg shadow-md transition-transform duration-200 hover:scale-105"
  >
    {getEditLabel()}
  </button>
</div>

                        {/* STATS FINALES OU ÉDITION */}
                        {!editStatsMode ? (
                          <div className="bg-gray-900 p-3 rounded-lg text-xs relative group w-full">
                            <div className="font-bold text-white text-center mb-3">{t("statFinals")}</div>
                            <div className="grid grid-cols-2 gap-x-3 gap-y-2 w-full text-gray-200 text-xs">
                              {allStats.map((key) => {
                                const base = typeof finalStatsWithoutArtefact[key] === 'number' ? finalStatsWithoutArtefact[key] : 0;
                                const fromArtifact = typeof statsFromArtifacts[key] === 'number' ? statsFromArtifacts[key] : 0;
                                const total = base + fromArtifact;

                                return (
                                  <div key={key} className="break-words text-center">
                                    <span className="text-blue-300 block text-[10px]">{t(`stats.${key}`)}</span>
                                    <span className="text-white font-semibold">{Math.floor(total)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-4">
                            {/* Flat Stats */}
                            <div className="bg-gray-800 p-3 rounded-lg text-xs">
                              <div className="font-bold mb-2 text-white text-center">Your flat stats</div>
                              <div className="space-y-2">
                                {Object.entries(flatStats).map(([key, value]) => (
                                  <div key={key} className="flex justify-between items-center gap-2">
                                    <label className="text-gray-300 text-xs flex-1">{key}</label>
                                    <input
                                      type="number"
                                      value={value}
                                      onChange={(e) =>
                                        setFlatStats((prev) => ({ ...prev, [key]: +e.target.value }))
                                      }
                                      className="w-20 bg-black text-white px-2 py-1 rounded text-right text-xs"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Stats Without Artefact */}
                            <div className="bg-gray-800 p-3 rounded-lg text-xs">
                              <div className="font-bold mb-2 text-white text-center">Stats you see without Artefacts</div>
                              <div className="space-y-2">
                                {Object.entries(statsWithoutArtefact).map(([key, value]) => (
                                  <div key={key} className="flex justify-between items-center gap-2">
                                    <label className="text-gray-300 text-xs flex-1">{key}</label>
                                    <input
                                      type="number"
                                      value={value}
                                      onChange={(e) =>
                                        setStatsWithoutArtefact((prev) => ({
                                          ...prev,
                                          [key]: +e.target.value,
                                        }))
                                      }
                                      className="w-20 bg-black text-white px-2 py-1 rounded text-right text-xs"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CANVAS SECTION - Plus petit et en bas */}
                    <div className="w-full mt-8 mb-24">
                      <div className="flex flex-col items-center gap-4 max-w-[350px] mx-auto">

                        {/* Canvas 1 - Neige */}
                        <div className="w-full">
                          <canvas
                            id="canvas-left"
                            width="350"
                            height="140"
                            className="rounded-lg shadow-lg bg-black w-full h-auto border border-blue-500/30"
                          />
                          <p className="text-center text-xs text-blue-300 mt-1">🌨️ Royaume de Neige</p>
                        </div>

                        {/* Canvas 2 - Sanctuaire avec Portail */}
                        <div className="w-full relative">
                          <canvas
                            id="canvas-center"
                            width="350"
                            height="140"
                            className="rounded-lg shadow-lg bg-black w-full h-auto border border-purple-500/30"
                          />

                        {/* Portail cliquable */}
<div
  className="absolute z-50 cursor-pointer hover:scale-105 transition-transform"
  style={{
    top: '40%',
    left: '46.7%',
    transform: 'translate(-50%, 50%)',
    width: '30px',
    height: '30px',
    zIndex: 10 // ← BEAUCOUP plus bas que z-50
  }}
  onClick={handlePortalClick}
>
  {/* Zone cliquable invisible */}
  {/* 🔥 Effet visuel progressif selon les clics */}
  {portalClickCount > 10 && (
    <div className="absolute inset-0 animate-pulse bg-blue-500 opacity-20 rounded-full"></div>
  )}
  {portalClickCount > 20 && (
    <div className="absolute inset-0 animate-bounce bg-purple-500 opacity-30 rounded-full"></div>
  )}
  {portalClickCount > 25 && (
    <div className="absolute inset-0 animate-ping bg-red-500 opacity-40 rounded-full"></div>
  )}
</div>

                          <p className="text-center text-xs text-purple-300 mt-1">🏛️ Sanctuaire Central</p>
                        </div>

                        {/* Canvas 3 - Terres Vertes */}
                        <div className="w-full">
                          <canvas
                            id="canvas-right"
                            width="350"
                            height="140"
                            className="rounded-lg shadow-lg bg-black w-full h-auto border border-green-500/30"
                          />
                          <p className="text-center text-xs text-green-300 mt-1">🌿 Terres Vertes</p>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

                {/* 🎯 VUE GAUCHE - ARTEFACTS */}
                {mobileView === 'left' && (
                  <div className="w-full mx-auto py-4 pb-24">
                    <div className="space-y-4">
                      {leftArtifacts.map((item, idx) => (
                        <ArtifactCard
                          key={`${activeAccount}-mobile-left-${item.title}`}
                          title={item.title}
                          mainStats={item.mainStats}
                          showTankMessage={showTankMessage}
                          recalculateStatsFromArtifacts={recalculateStatsFromArtifacts}
                          artifactData={artifactsData[item.title]}
                          statsWithoutArtefact={statsWithoutArtefact}
                          flatStats={flatStats}
                          onSetIconClick={openSetSelector}
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
                          onScoreCalculated={handleArtifactScoreUpdate}
                          onReportGenerated={handleReportGenerated}
                          onTvTrigger={setTvDialogue} // 🔥 NOUVELLE PROP !
                        />
                      ))}

                    </div>
                  </div>
                )}

                {/* 🎯 VUE DROITE - ARTEFACTS */}
                {mobileView === 'right' && (
                  <div className="w-full mx-auto py-4 pb-24">
                    <div className="space-y-4">
                      {rightArtifacts.map((item, idx) => (
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
                          onScoreCalculated={handleArtifactScoreUpdate} // ← AJOUTER CETTE LIGNE !
                          onReportGenerated={handleReportGenerated} // ← AJOUTER CETTE LIGNE !
                          onTvTrigger={setTvDialogue} // 🔥 NOUVELLE PROP !
                        />
                      ))}

                    </div>
                  </div>
                )}

                {/* 🎯 NAVIGATION MOBILE FIXE */}
                <div className="fixed bottom-4 left-0 right-0 z-50 px-4">
                  <div className="flex justify-center gap-3">
                    {mobileView !== 'main' && (
                      <button
                        onClick={() => setMobileView('main')}
                        className="px-4 py-2 bg-[#2d2d5c] hover:bg-[#3d3d7c] text-white rounded-lg shadow-lg text-sm font-medium transition-colors"
                      >
                        🏠 Main
                      </button>
                    )}

                    {mobileView !== 'left' && (
                      <button
                        onClick={() => setMobileView('left')}
                        className="px-4 py-2 text-white rounded-lg shadow-lg text-sm font-medium transition-colors"
                        style={{
                          backgroundColor: 'rgba(45, 45, 92, 0.3)', // ← Plus transparent
                          backdropFilter: 'blur(8px)' // ← Effet blur optionnel
                        }}
                      >
                        {t('left')}
                      </button>
                    )}

                    {mobileView !== 'right' && (
                      <button
                        onClick={() => setMobileView('right')}
                        className="px-4 py-2 text-white rounded-lg shadow-lg text-sm font-medium transition-colors"
                        style={{
                          backgroundColor: 'rgba(45, 45, 92, 0.3)', // ← Plus transparent
                          backdropFilter: 'blur(8px)' // ← Effet blur optionnel
                        }}
                      >
                        {t('right')}
                      </button>
                    )}
                  </div>
                </div>

                {/* POPUPS ET MODALES (restent identiques) */}
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

                {/* Autres popups... (garde tes popups existants) */}
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

                {showAdminPage && (
                  <div
                    className="fixed inset-0 z-50 bg-black/80 flex justify-center items-center"
                    style={{ overflowY: "auto", WebkitOverflowScrolling: "touch" }}
                  >
                    <div className="relative w-full max-w-4xl mx-auto my-8 max-h-[90vh] overflow-y-auto rounded-lg bg-black p-4">
                      <AdminValidationPage
                        onClose={() => setShowAdminPage(false)}
                        showTankMessage={showTankMessage}
                        selectedCharacter={selectedCharacter}
                        characterData={characters[selectedCharacter]}
                        currentStats={finalStats}
                        currentArtifacts={artifactsData}
                        statsFromArtifacts={statsFromArtifacts}
                        currentCores={hunterCores[selectedCharacter] || {}}
                        currentGems={gemData}
                        currentWeapon={hunterWeapons[selectedCharacter] || {}}
                        characters={characters}
                        onNavigateToHallOfFlame={() => setShowHallOfFlamePage(true)}
                        adminToken={adminToken}
                      />
                    </div>
                  </div>
                )}


                {showBeruInteractionMenu && (
                  <BeruInteractionMenu
                    position={beruMenuPosition}
                    onClose={closeBeruMenu}
                    selectedCharacter={selectedCharacter}
                    characters={characters}
                    showTankMessage={showTankMessage}
                    currentArtifacts={artifactsData}
                    currentStats={finalStats}
                    currentCores={hunterCores[selectedCharacter] || {}}
                    currentGems={gemData}
                    multiAccountsData={accounts}
                    onReportGenerated={handleReportGenerated}
                    substatsMinMaxByIncrements={substatsMinMaxByIncrements}
                    existingScores={artifactScores}
                  />
                )}

                {showKaiselInteractionMenu && (
                  <KaiselInteractionMenu
                    position={kaiselMenuPosition}
                    onClose={closeKaiselMenu}
                    selectedCharacter={selectedCharacter}
                    characters={characters}
                    showTankMessage={showTankMessage}
                    currentArtifacts={artifactsData}
                    currentStats={finalStats}
                    currentCores={hunterCores[selectedCharacter] || {}}
                    onShowAdminValidation={handleShowAdminValidation} 
                    multiAccountsData={accounts}
                    substatsMinMaxByIncrements={substatsMinMaxByIncrements}
                    existingScores={artifactScores}
                    onShowHallOfFlameDebug={() => setShowHallOfFlameDebug(true)}
                    onShowHallOfFlame={() => setShowHallOfFlamePage(true)}
                    showDebugButton={showDebugButton} // ← ET CETTE LIGNE AUSSI
                  />
                )}

                {showHallOfFlameDebug && (
                  <HallOfFlameDebugPopup
                    isOpen={showHallOfFlameDebug}
                    onClose={() => setShowHallOfFlameDebug(false)}
                    selectedCharacter={selectedCharacter}
                    characterData={characters[selectedCharacter]}
                    currentStats={finalStats}
                    currentArtifacts={artifactsData}
                    statsFromArtifacts={statsFromArtifacts}
                    currentCores={hunterCores[selectedCharacter] || {}}
                    onNavigateToHallOfFlame={() => setShowHallOfFlamePage(true)}
                    currentGems={gemData}
                    currentWeapon={hunterWeapons[selectedCharacter] || {}}
                    showTankMessage={showTankMessage}
                    onSave={(hunterData) => {
                      console.log('Hunter sauvegardé:', hunterData);
                      // Si tu veux naviguer après sauvegarde :
                      // setShowHallOfFlamePage(true);
                    }}
                  />
                )}



                {showHallOfFlamePage && (
                  <HallOfFlamePage
                    onClose={() => setShowHallOfFlamePage(false)}
                    showTankMessage={showTankMessage}
                    characters={characters}
                    onNavigateToBuilder={() => {
                      setShowHallOfFlamePage(false);
                      showTankMessage("🚀 Retour au Builder ! Créez un build légendaire !", true, 'kaisel');
                    }}
                    selectedCharacter={selectedCharacter}           // Pour le contexte du personnage actuel
                    currentStats={finalStats}                    // Stats totales calculées
                    currentArtifacts={artifactsData}            // Artefacts équipés
                    statsFromArtifacts={statsFromArtifacts}         // Stats des artefacts uniquement
                    currentCores={hunterCores[selectedCharacter] || {}}
                    currentGems={gemData}
                    currentWeapon={hunterWeapons[selectedCharacter] || {}}
                  />
                )}

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


                {showHitboxes && Object.entries(hitboxPositions).map(([entityId, pos]) => (
                  <div
                    key={entityId}
                    style={{
                      position: 'fixed',
                      left: pos.left,
                      top: pos.top,
                      width: pos.width,
                      height: pos.height,
                      border: `2px dashed ${pos.color}`,
                      backgroundColor: `${pos.color}33`,
                      pointerEvents: 'none',
                      zIndex: 9999,
                      fontSize: '10px',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  >
                    {entityId}
                  </div>
                ))}
                {showSernPopup && (
                  <>
                    {/* 🌫️ BLUR OVERLAY - TOUT LE SITE */}
                    <div
                      className="fixed inset-0 z-[9998]"
                      style={{
                        backdropFilter: 'blur(8px)',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        animation: 'sernAppear 0.5s ease-out'
                      }}
                    />

                    {/* 🚨 POPUP PRINCIPALE */}
                    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
                      <div
                        ref={popupRef}
                        className="relative bg-black border-4 border-red-500 rounded-xl shadow-2xl 
                   max-w-[800px] w-full max-h-[85vh] overflow-hidden
                   animate-bounce-gentle"
                        style={{
                          background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #000000 100%)',
                          boxShadow: '0 0 50px rgba(255, 0, 0, 0.5), 0 0 100px rgba(255, 0, 0, 0.3), inset 0 0 50px rgba(255, 0, 0, 0.1)',
                          border: '4px solid #ff0000',
                          animation: 'sernPulse 2s infinite, sernSlideIn 0.8s ease-out'
                        }}
                      >
                        {/* 🔴 HEADER DRAMATIQUE */}
                        <div className="relative p-4 border-b-2 border-red-500 bg-gradient-to-r from-red-900/50 to-black/50">
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                            <h1 className="text-red-400 font-bold text-xl tracking-widest animate-pulse">
                              ⚠️ ALERTE SERN - INFRACTION N-404 ⚠️
                            </h1>
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                          </div>

                          {/* 🎯 SCANNING EFFECT */}
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan"></div>
                        </div>

                        {/* 🖼️ IMAGE SECTION */}
                        <div className="relative p-6 flex justify-center bg-gradient-to-b from-black/80 to-gray-900/80">
                          <img
                            src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747680569/SERN_ab7od6.png"
                            alt="SERN - Sung Bobby Jones"
                            className="max-w-full max-h-[300px] object-contain rounded-lg shadow-2xl"
                            style={{
                              filter: 'drop-shadow(0 0 20px rgba(255, 0, 0, 0.5))',
                              animation: 'sernGlow 3s ease-in-out infinite'
                            }}
                          />

                          {/* 🌟 PARTICULES FLOTTANTES */}
                          <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-[20%] left-[10%] w-2 h-2 bg-red-400 rounded-full animate-float-1"></div>
                            <div className="absolute top-[60%] right-[15%] w-1 h-1 bg-red-300 rounded-full animate-float-2"></div>
                            <div className="absolute bottom-[30%] left-[80%] w-1.5 h-1.5 bg-red-500 rounded-full animate-float-3"></div>
                          </div>
                        </div>

                        {/* 📜 TEXTE ZONE AVEC AUTOSCROLL */}
                        <div
                          ref={popupRef}
                          className="relative p-6 bg-gradient-to-b from-gray-900/90 to-black/95 max-h-[40vh] overflow-y-auto scrollbar-custom scroll-smooth"
                          id="sern-text-container"
                        >
                          <div
                            ref={dytextRef}
                            className="text-green-400 font-mono text-sm leading-relaxed tracking-wide 
                       whitespace-pre-wrap break-words overflow-wrap-anywhere 
                       min-h-[100px] max-w-full"
                            style={{
                              textShadow: '0 0 10px rgba(0, 255, 0, 0.5)',
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word',
                              animation: 'textGlow 2s ease-in-out infinite alternate'
                            }}
                          />

                          {/* 🔥 TERMINAL CURSOR */}
                          <span className="inline-block w-2 h-4 bg-green-400 ml-1 animate-pulse"></span>
                        </div>

                        {/* ⚡ FOOTER EFFECTS */}
                        <div className="relative p-4 border-t-2 border-red-500 bg-gradient-to-r from-black/90 to-red-900/30">
                          <div className="flex justify-center items-center gap-4 text-red-300 text-xs">
                            <span className="animate-pulse">● CONNEXION SÉCURISÉE</span>
                            <span className="animate-bounce">● ANALYSE EN COURS</span>
                            <span className="animate-ping">● VERDICT IMMINENT</span>
                          </div>

                          {/* 🎯 PROGRESS BAR FAKE */}
                          <div className="mt-2 w-full bg-gray-800 rounded-full h-1 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-red-500 to-red-300 rounded-full animate-progress"></div>
                          </div>
                        </div>

                        {/* 🔴 CORNER ACCENTS */}
                        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-red-500"></div>
                        <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-red-500"></div>
                        <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-red-500"></div>
                        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-red-500"></div>
                      </div>
                    </div>

                    {/* 🎨 ANIMATIONS CSS */}
                    <style jsx>{`
      @keyframes sernAppear {
        from { opacity: 0; backdrop-filter: blur(0px); }
        to { opacity: 1; backdrop-filter: blur(8px); }
      }
      
      @keyframes sernSlideIn {
        from { 
          opacity: 0; 
          transform: scale(0.8) translateY(-50px); 
        }
        to { 
          opacity: 1; 
          transform: scale(1) translateY(0); 
        }
      }
      
      @keyframes sernPulse {
        0%, 100% { box-shadow: 0 0 50px rgba(255, 0, 0, 0.5); }
        50% { box-shadow: 0 0 80px rgba(255, 0, 0, 0.8); }
      }
      
      @keyframes sernGlow {
        0%, 100% { filter: drop-shadow(0 0 20px rgba(255, 0, 0, 0.5)); }
        50% { filter: drop-shadow(0 0 40px rgba(255, 0, 0, 0.8)); }
      }
      
      @keyframes textGlow {
        from { text-shadow: 0 0 10px rgba(0, 255, 0, 0.5); }
        to { text-shadow: 0 0 20px rgba(0, 255, 0, 0.8); }
      }
      
      @keyframes scan {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      
      @keyframes progress {
        0% { width: 0%; }
        100% { width: 100%; }
      }
      
      @keyframes float-1 {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(180deg); }
      }
      
      @keyframes float-2 {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-15px) rotate(-180deg); }
      }
      
      @keyframes float-3 {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-25px) rotate(90deg); }
      }
      
      @keyframes bounce-gentle {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
      }
      
      .animate-scan {
        animation: scan 2s linear infinite;
      }
      
      .animate-progress {
        animation: progress 3s ease-in-out infinite;
      }
      
      .animate-float-1 {
        animation: float-1 4s ease-in-out infinite;
      }
      
      .animate-float-2 {
        animation: float-2 3s ease-in-out infinite 0.5s;
      }
      
      .animate-float-3 {
        animation: float-3 5s ease-in-out infinite 1s;
      }
      
      .animate-bounce-gentle {
        animation: bounce-gentle 2s ease-in-out infinite;
      }
      
      .scrollbar-custom::-webkit-scrollbar {
        width: 6px;
      }
      
      .scrollbar-custom::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.5);
        border-radius: 3px;
      }
      
      .scrollbar-custom::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, #ff0000, #cc0000);
        border-radius: 3px;
      }
      
      .scrollbar-custom::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(to bottom, #ff3333, #ff0000);
      }
    `}</style>
                  </>
                )}

                {/* Damage Calculator Modal */}
{showDamageCalculator && (
  <DamageCalculator
    selectedCharacter={selectedCharacter}
    finalStats={(() => {
      const scaleStat = characters[selectedCharacter]?.scaleStat;
      return {
        [scaleStat]: (finalStatsWithoutArtefact[scaleStat] || 0) + (statsFromArtifacts[scaleStat] || 0),
        'Critical Hit Rate': (finalStatsWithoutArtefact['Critical Hit Rate'] || 0) + (statsFromArtifacts['Critical Hit Rate'] || 0),
        'Critical Hit Damage': (finalStatsWithoutArtefact['Critical Hit Damage'] || 0) + (statsFromArtifacts['Critical Hit Damage'] || 0),
        'Defense Penetration': (finalStatsWithoutArtefact['Defense Penetration'] || 0) + (statsFromArtifacts['Defense Penetration'] || 0),
        'Damage Increase': (finalStatsWithoutArtefact['Damage Increase'] || 0) + (statsFromArtifacts['Damage Increase'] || 0),
        [`${characters[selectedCharacter]?.element} Damage %`]: finalStatsWithoutArtefact[`${characters[selectedCharacter]?.element} Damage %`] || 0
      };
    })()}
    flatStats={flatStats}
    characters={characters}
    hunterWeapons={hunterWeapons}
    onClose={() => setShowDamageCalculator(false)}
    t={t}
  />
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
                    flatStats={flatStats}
                    statsWithoutArtefact={statsWithoutArtefact}
                    substatsMinMaxByIncrements={substatsMinMaxByIncrements}
                    showTankMessage={showTankMessage}
                    recalculateStatsFromArtifacts={recalculateStatsFromArtifacts}
                  />
                )}

                {showNarrative && (
                  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-start justify-center z-[9999] py-10">
                    <div
                      ref={popupRef}
                      className="relative w-[95vw] max-w-[1000px] p-4 bg-black/90 text-white border-4 border-white rounded-2xl shadow-2xl animate-pulse flex flex-col max-h-[90vh] scrollbar-none scroll-smooth"
                    >
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
                      setParsedArtifactData(null);
                    }}
                    onCancel={() => setParsedArtifactData(null)}
                  />
                )}

                <OcrConfirmPopup
                  parsedData={parsedArtifactData}
                  onConfirm={(data) => {
                    applyOcrDataToArtifact(data);
                    setShowPopup(false);
                  }}
                  onCancel={() => setShowPopup(false)}
                />



                {/* CHIBI BUBBLE */}
                {showChibiBubble && chibiMessage && (
                  <ChibiBubble
                    key={`bubble-${bubbleId}`}
                    message={chibiMessage}
                    position={chibiPos}
                    entityType={currentSpeaker}
                    isMobile={isMobile}
                    onClose={handleCloseBubble}
                  />
                )}

              </div>
            </div>
          </div>
        </>
      ) : (


        <div className="min-h-screen bg-gray-950 text-white p-1 tank-target">
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
                      onScoreCalculated={handleArtifactScoreUpdate} // ← AJOUTER CETTE LIGNE !
                      onReportGenerated={handleReportGenerated} // ← AJOUTER CETTE LIGNE !
                      onTvTrigger={setTvDialogue} // 🔥 NOUVELLE PROP !
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
                  <div className="flex items-center justify-start w-full px-1 mb-1 tank-target">
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

                          // 🛡️ Protection si aucun personnage
                          if (!selected) {
                            setSelectedCharacter('');
                            return;
                          }

                          // 📦 Vérifier si un build existe dans le nouveau système
                          const storedData = JSON.parse(localStorage.getItem("builderberu_users"));
                          const build = storedData?.user?.accounts?.[activeAccount]?.builds?.[selected];

                          if (build && build.artifactsData) {
                            // ✅ BUILD EXISTANT : Charger tout
                            setSelectedCharacter(selected);
                            setFlatStats(build.flatStats || {});
                            setStatsWithoutArtefact(build.statsWithoutArtefact || {});
                            setArtifactsData(build.artifactsData || {});
                            setHunterCores(prev => ({
                              ...prev,
                              [selected]: build.hunterCores || {}
                            }));
                            setHunterWeapons(prev => ({
                              ...prev,
                              [selected]: build.hunterWeapons || {}
                            }));

                            // 💎 Gemmes du compte (pas dans le build)
                            const accountGems = storedData?.user?.accounts?.[activeAccount]?.gems || {};
                            setGemData(accountGems);

                            showTankMessage(`✅ Build chargé pour ${characters[selected]?.name} !`, true);

                          } else {
                            // 🆕 NOUVEAU PERSONNAGE : Reset avec les stats de base
                            setSelectedCharacter(selected);

                            // Reset complet avec stats du personnage
                            const charStats = characterStats[selected];
                            if (charStats) {
                              // Simuler une arme si elle n'existe pas
                              simulateWeaponSaveIfMissing(selected);

                              // Récupérer l'arme (existante ou simulée)
                              const weapon = hunterWeapons[selected] || {
                                mainStat: characters[selected]?.scaleStat === 'Defense' ? 3080 :
                                  characters[selected]?.scaleStat === 'HP' ? 6120 : 3080,
                                precision: 4000
                              };

                              // Stats de base avec arme
                              const newFlatStats = getFlatStatsWithWeapon(charStats, weapon);
                              setFlatStats(completeStats(newFlatStats));

                              // Reset les autres états
                              setStatsWithoutArtefact(completeStats(newFlatStats));
                              setStatsFromArtifacts(completeStats({}));

                              // Artefacts vides
                              const emptyArtifacts = {};
                              Object.keys(artifactsData).forEach(slot => {
                                emptyArtifacts[slot] = {
                                  mainStat: '',
                                  subStats: ['', '', '', ''],
                                  subStatsLevels: [
                                    { value: 0, level: 0, procOrders: [], procValues: [] },
                                    { value: 0, level: 0, procOrders: [], procValues: [] },
                                    { value: 0, level: 0, procOrders: [], procValues: [] },
                                    { value: 0, level: 0, procOrders: [], procValues: [] }
                                  ],
                                  set: ''
                                };
                              });
                              setArtifactsData(emptyArtifacts);

                              // Reset cores pour ce personnage
                              setHunterCores(prev => ({
                                ...prev,
                                [selected]: {}
                              }));

                              showTankMessage(`🆕 Nouveau build créé pour ${characters[selected]?.name} !`, true);
                            }
                          }
                        }}
                        className="p-2 rounded bg-[#1c1c3c] text-white text-sm tank-target flex-1 max-w-[200px]"
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




<div className="w-full mt-4 space-y-3">
  {/* VERSION DESKTOP - hidden on mobile */}
  <div className="hidden md:flex flex-wrap items-center gap-3">
    {/* BobbyKick */}
    <button
      onClick={handleResetStats}
      className="bg-purple-800/30 hover:bg-purple-700/40 text-purple-300 hover:text-white
                border border-purple-600/50 hover:border-purple-500
                font-semibold px-4 py-2 text-sm rounded-lg
                transition-all duration-200 hover:scale-105"
    >
      BobbyKick
    </button>

    {/* Save */}
    <button
      onClick={handleSaveBuild}
      className="bg-purple-800/30 hover:bg-purple-700/40 text-purple-300 hover:text-white
                border border-purple-600/50 hover:border-purple-500
                font-bold px-4 py-2 text-sm rounded-lg
                transition-all duration-200 hover:scale-105"
    >
      Save
    </button>

    {/* Submit/Incomplet */}
    <button
      onClick={() => {
        const validation = validateHunterForHallOfFame(artifactsData, hunterCores[selectedCharacter] || {}, gemData);
        if (validation.isValid) {
          handleSubmitToHallOfFame();
        } else {
          showTankMessage(
            `🏆 **BUILD INCOMPLET**\n\n${validation.missing.join('\n')}\n\n🔧 Termine ton build avant submission !`,
            true,
            'kaisel'
          );
        }
      }}
      className={`
        ${validateHunterForHallOfFame(artifactsData, hunterCores[selectedCharacter] || {}, gemData).isValid
          ? 'bg-purple-800/30 hover:bg-purple-700/40 text-purple-300 hover:text-white border-purple-600/50 hover:border-purple-500'
          : 'bg-gray-800/30 text-gray-500 border-gray-700/50 cursor-not-allowed'
        } 
        font-semibold px-4 py-2 text-sm rounded-lg border
        transition-all duration-200 hover:scale-105
      `}
      disabled={!validateHunterForHallOfFame(artifactsData, hunterCores[selectedCharacter] || {}, gemData).isValid}
      title={validateHunterForHallOfFame(artifactsData, hunterCores[selectedCharacter] || {}, gemData).isValid
        ? 'Soumettre au Hall of Fame'
        : `Manque: ${validateHunterForHallOfFame(artifactsData, hunterCores[selectedCharacter] || {}, gemData).missing.join(', ')}`
      }
    >
      {validateHunterForHallOfFame(artifactsData, hunterCores[selectedCharacter] || {}, gemData).isValid
        ? 'Submit'
        : 'Incomplet'
      }
    </button>

    {/* Import */}
    <button
      onClick={handleImportBuild}
      className="bg-purple-800/30 hover:bg-purple-700/40 text-purple-300 hover:text-white
                border border-purple-600/50 hover:border-purple-500
                font-semibold px-4 py-2 text-sm rounded-lg
                transition-all duration-200 hover:scale-105"
    >
      Import
    </button>

    {/* New */}
    <button
      onClick={() => setShowNewAccountPopup(true)}
      className="bg-purple-800/30 hover:bg-purple-700/40 text-purple-300 hover:text-white
                border border-purple-600/50 hover:border-purple-500
                font-semibold px-2 py-2 text-sm rounded-lg
                transition-all duration-200 hover:scale-105"
    >
      New
    </button>

    {/* Account Selector */}
    {Object.keys(accounts).length > 1 && (
      <select
        value={activeAccount}
        onChange={(e) => {
          const newAcc = e.target.value;
          handleAccountSwitch(newAcc);
        }}
        className="bg-purple-900/30 text-purple-300 border border-purple-600/50
                  px-3 py-2 rounded-lg text-sm
                  hover:border-purple-500 focus:outline-none focus:border-purple-400
                  transition-colors"
      >
        {Object.keys(accounts).map(acc => (
          <option key={acc} value={acc} className="bg-gray-900">{acc}</option>
        ))}
      </select>
    )}

    {/* Separator */}
    <div className="h-4 w-px bg-purple-600/30 mx-2" />

    {/* Builds récents */}
    {isBuildsReady && recentBuilds.length > 0 && (
      <div className="flex items-center gap-1">
        <span className="text-purple-400/70 text-sm"></span>
        <div className="flex gap-1">
          {recentBuilds
            .filter((charKey) => characters[charKey])
            .map((charKey) => (
              <img
                key={charKey}
                src={characters[charKey]?.icon || '/default.png'}
                alt={characters[charKey]?.name || charKey}
                onClick={() => handleClickBuildIcon(charKey)}
                className="w-6 h-6 rounded-full cursor-pointer 
                          border-2 border-purple-600/50 hover:border-purple-400
                          transition-all duration-200 hover:scale-110
                          opacity-80 hover:opacity-100"
              />
            ))}
        </div>
      </div>
    )}
  </div>

  {/* VERSION MOBILE - visible only on mobile */}
  <div className="md:hidden space-y-2">
    {/* Ligne 1: Actions principales */}
    <div className="flex gap-1">
      <button
        onClick={handleResetStats}
        className="flex-1 bg-purple-800/30 text-purple-300
                  border border-purple-600/50
                  font-semibold px-2 py-2 text-xs rounded-lg
                  transition-all duration-200 active:scale-95"
      >
        BobbyKick
      </button>

      <button
        onClick={handleSaveBuild}
        className="flex-1 bg-purple-800/30 text-purple-300
                  border border-purple-600/50
                  font-bold px-3 py-2 text-xs rounded-lg
                  transition-all duration-200 active:scale-95"
      >
        Save
      </button>

      <button
        onClick={() => {
          const validation = validateHunterForHallOfFame(artifactsData, hunterCores[selectedCharacter] || {}, gemData);
          if (validation.isValid) {
            handleSubmitToHallOfFame();
          } else {
            showTankMessage(`BUILD INCOMPLET`, true, 'kaisel');
          }
        }}
        className={`
          flex-1
          ${validateHunterForHallOfFame(artifactsData, hunterCores[selectedCharacter] || {}, gemData).isValid
            ? 'bg-purple-800/30 text-purple-300 border-purple-600/50'
            : 'bg-gray-800/30 text-gray-500 border-gray-700/50'
          } 
          font-semibold px-3 py-2 text-xs rounded-lg border
          transition-all duration-200 active:scale-95
        `}
        disabled={!validateHunterForHallOfFame(artifactsData, hunterCores[selectedCharacter] || {}, gemData).isValid}
      >
        {validateHunterForHallOfFame(artifactsData, hunterCores[selectedCharacter] || {}, gemData).isValid
          ? 'Submit'
          : 'Incomplet'
        }
      </button>
    </div>

    {/* Ligne 2: Import, New et Account */}
    <div className="flex gap-1">
      <button
        onClick={handleImportBuild}
        className="flex-1 bg-purple-800/30 text-purple-300
                  border border-purple-600/50
                  font-semibold px-3 py-2 text-xs rounded-lg
                  transition-all duration-200 active:scale-95"
      >
        Import
      </button>

      <button
        onClick={() => setShowNewAccountPopup(true)}
        className="flex-1 bg-purple-800/30 text-purple-300
                  border border-purple-600/50
                  font-semibold px-3 py-2 text-xs rounded-lg
                  transition-all duration-200 active:scale-95"
      >
        New
      </button>

      {Object.keys(accounts).length > 1 && (
        <select
          value={activeAccount}
          onChange={(e) => {
            const newAcc = e.target.value;
            handleAccountSwitch(newAcc);
          }}
          className="flex-1 bg-purple-900/30 text-purple-300 border border-purple-600/50
                    px-2 py-2 rounded-lg text-xs
                    focus:outline-none focus:border-purple-400"
        >
          {Object.keys(accounts).map(acc => (
            <option key={acc} value={acc} className="bg-gray-900">{acc}</option>
          ))}
        </select>
      )}
    </div>

    {/* Ligne 3: Builds récents */}
    {isBuildsReady && recentBuilds.length > 0 && (
      <div className="flex justify-center gap-2">
        {recentBuilds
          .filter((charKey) => characters[charKey])
          .slice(0, 5)
          .map((charKey) => (
            <img
              key={charKey}
              src={characters[charKey]?.icon || '/default.png'}
              alt={characters[charKey]?.name || charKey}
              onClick={() => handleClickBuildIcon(charKey)}
              className="w-7 h-7 rounded-full cursor-pointer 
                        border-2 border-purple-600/50
                        transition-all duration-200 active:scale-110
                        opacity-80"
            />
          ))}
      </div>
    )}
  </div>

  {/* Debug Button - visible sur les deux versions */}
  {showDebugButton && (
    <button
      onClick={() => setShowHitboxes(!showHitboxes)}
      className="fixed top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs z-[10001]"
    >
      🐛 {showHitboxes ? 'HIDE' : 'SHOW'} HITBOX
    </button>
  )}
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

                  {showAdminPage && (
                    <div
                      className="fixed inset-0 z-50 bg-black/80 flex justify-center items-center"
                      style={{ overflowY: "auto", WebkitOverflowScrolling: "touch" }}
                    >
                      <div className="relative w-full max-w-4xl mx-auto my-8 max-h-[90vh] overflow-y-auto rounded-lg bg-black p-4">
                        <AdminValidationPage
                          onClose={() => setShowAdminPage(false)}
                          showTankMessage={showTankMessage}
                          selectedCharacter={selectedCharacter}
                          characterData={characters[selectedCharacter]}
                          currentStats={finalStats}
                          currentArtifacts={artifactsData}
                          statsFromArtifacts={statsFromArtifacts}
                          currentCores={hunterCores[selectedCharacter] || {}}
                          currentGems={gemData}
                          currentWeapon={hunterWeapons[selectedCharacter] || {}}
                          characters={characters}
                          onNavigateToHallOfFlame={() => setShowHallOfFlamePage(true)}
                          adminToken={adminToken}
                        />
                      </div>
                    </div>
                  )}

                  {showBeruInteractionMenu && (() => {
                    return null;
                  })()}
                  {showBeruInteractionMenu && (
                    <BeruInteractionMenu
                      position={beruMenuPosition}
                      onClose={closeBeruMenu} // ← UTILISER LA FONCTION SÉCURISÉE
                      selectedCharacter={selectedCharacter}
                      characters={characters}
                      showTankMessage={showTankMessage}
                      currentArtifacts={artifactsData}
                      currentStats={finalStats}                   // ← STATS FINALES COMPLÈTES !
                      currentCores={hunterCores[selectedCharacter] || {}}
                      currentGems={gemData}
                      multiAccountsData={accounts}
                      onReportGenerated={handleReportGenerated}
                      substatsMinMaxByIncrements={substatsMinMaxByIncrements} // ← AJOUTER CETTE LIGNE !
                      existingScores={artifactScores} // ← UTILISER LE STATE PROTÉGÉ
                    />
                  )}

                  {showKaiselInteractionMenu && (
                    <KaiselInteractionMenu
                      position={kaiselMenuPosition}
                      onClose={closeKaiselMenu}
                      selectedCharacter={selectedCharacter}
                      characters={characters}
                      showTankMessage={showTankMessage}
                      currentArtifacts={artifactsData}
                      currentStats={finalStats}
                      currentCores={hunterCores[selectedCharacter] || {}}
                      onShowAdminValidation={handleShowAdminValidation}
                      multiAccountsData={accounts}
                      substatsMinMaxByIncrements={substatsMinMaxByIncrements}
                      existingScores={artifactScores}
                      onShowHallOfFlameDebug={() => setShowHallOfFlameDebug(true)}
                      onShowHallOfFlame={() => setShowHallOfFlamePage(true)}
                      showDebugButton={showDebugButton} // ← ET CETTE LIGNE AUSSI
                    />
                  )}


                  {showHallOfFlameDebug && (
                    <HallOfFlameDebugPopup
                      isOpen={showHallOfFlameDebug}
                      onClose={() => setShowHallOfFlameDebug(false)}
                      selectedCharacter={selectedCharacter}
                      characterData={characters[selectedCharacter]}
                      currentStats={finalStats}
                      currentArtifacts={artifactsData}
                      statsFromArtifacts={statsFromArtifacts}
                      currentCores={hunterCores[selectedCharacter] || {}}
                      onNavigateToHallOfFlame={() => setShowHallOfFlamePage(true)}
                      currentGems={gemData}
                      currentWeapon={hunterWeapons[selectedCharacter] || {}}
                      showTankMessage={showTankMessage}
                      onSave={(hunterData) => {
                        console.log('Hunter sauvegardé:', hunterData);
                        // Si tu veux naviguer après sauvegarde :
                        // setShowHallOfFlamePage(true);
                      }}
                    />
                  )}


                  {showHallOfFlamePage && (
                    <HallOfFlamePage
                      onClose={() => setShowHallOfFlamePage(false)}
                      showTankMessage={showTankMessage}
                      characters={characters}
                      onNavigateToBuilder={() => {
                        setShowHallOfFlamePage(false);
                        showTankMessage("🚀 Retour au Builder ! Créez un build légendaire !", true, 'kaisel');
                      }}
                      selectedCharacter={selectedCharacter}           // Pour le contexte du personnage actuel
                      currentStats={finalStats}                    // Stats totales calculées
                      currentArtifacts={artifactsData}            // Artefacts équipés
                      statsFromArtifacts={statsFromArtifacts}         // Stats des artefacts uniquement
                      currentCores={hunterCores[selectedCharacter] || {}}
                      currentGems={gemData}
                      currentWeapon={hunterWeapons[selectedCharacter] || {}}
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
                  {showHitboxes && Object.entries(hitboxPositions).map(([entityId, pos]) => (
                    <div
                      key={entityId}
                      style={{
                        position: 'fixed',
                        left: pos.left,
                        top: pos.top,
                        width: pos.width,
                        height: pos.height,
                        border: `2px dashed ${pos.color}`,
                        backgroundColor: `${pos.color}33`,
                        pointerEvents: 'none',
                        zIndex: 9999,
                        fontSize: '10px',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    >
                      {entityId}
                    </div>
                  ))}


                  {showSernPopup && (
                    <>
                      {/* 🌫️ BLUR OVERLAY - TOUT LE SITE */}
                      <div
                        className="fixed inset-0 z-[9998]"
                        style={{
                          backdropFilter: 'blur(8px)',
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          animation: 'sernAppear 0.5s ease-out'
                        }}
                      />

                      {/* 🚨 POPUP PRINCIPALE */}
                      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
                        <div
                          ref={popupRef}
                          className="relative bg-black border-4 border-red-500 rounded-xl shadow-2xl 
                   max-w-[800px] w-full max-h-[85vh] overflow-hidden
                   animate-bounce-gentle"
                          style={{
                            background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #000000 100%)',
                            boxShadow: '0 0 50px rgba(255, 0, 0, 0.5), 0 0 100px rgba(255, 0, 0, 0.3), inset 0 0 50px rgba(255, 0, 0, 0.1)',
                            border: '4px solid #ff0000',
                            animation: 'sernPulse 2s infinite, sernSlideIn 0.8s ease-out'
                          }}
                        >
                          {/* 🔴 HEADER DRAMATIQUE */}
                          <div className="relative p-4 border-b-2 border-red-500 bg-gradient-to-r from-red-900/50 to-black/50">
                            <div className="flex items-center justify-center gap-3">
                              <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                              <h1 className="text-red-400 font-bold text-xl tracking-widest animate-pulse">
                                ⚠️ ALERTE SERN - INFRACTION N-404 ⚠️
                              </h1>
                              <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                            </div>

                            {/* 🎯 SCANNING EFFECT */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan"></div>
                          </div>

                          {/* 🖼️ IMAGE SECTION */}
                          <div className="relative p-6 flex justify-center bg-gradient-to-b from-black/80 to-gray-900/80">
                            <img
                              src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747680569/SERN_ab7od6.png"
                              alt="SERN - Sung Bobby Jones"
                              className="max-w-full max-h-[300px] object-contain rounded-lg shadow-2xl"
                              style={{
                                filter: 'drop-shadow(0 0 20px rgba(255, 0, 0, 0.5))',
                                animation: 'sernGlow 3s ease-in-out infinite'
                              }}
                            />

                            {/* 🌟 PARTICULES FLOTTANTES */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                              <div className="absolute top-[20%] left-[10%] w-2 h-2 bg-red-400 rounded-full animate-float-1"></div>
                              <div className="absolute top-[60%] right-[15%] w-1 h-1 bg-red-300 rounded-full animate-float-2"></div>
                              <div className="absolute bottom-[30%] left-[80%] w-1.5 h-1.5 bg-red-500 rounded-full animate-float-3"></div>
                            </div>
                          </div>

                          {/* 📜 TEXTE ZONE AVEC AUTOSCROLL */}
                          <div
                            ref={popupRef}
                            className="relative p-6 bg-gradient-to-b from-gray-900/90 to-black/95 max-h-[40vh] overflow-y-auto scrollbar-custom scroll-smooth"
                            id="sern-text-container"
                          >
                            <div
                              ref={dytextRef}
                              className="text-green-400 font-mono text-sm leading-relaxed tracking-wide 
                       whitespace-pre-wrap break-words overflow-wrap-anywhere 
                       min-h-[100px] max-w-full"
                              style={{
                                textShadow: '0 0 10px rgba(0, 255, 0, 0.5)',
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                animation: 'textGlow 2s ease-in-out infinite alternate'
                              }}
                            />

                            {/* 🔥 TERMINAL CURSOR */}
                            <span className="inline-block w-2 h-4 bg-green-400 ml-1 animate-pulse"></span>
                          </div>

                          {/* ⚡ FOOTER EFFECTS */}
                          <div className="relative p-4 border-t-2 border-red-500 bg-gradient-to-r from-black/90 to-red-900/30">
                            <div className="flex justify-center items-center gap-4 text-red-300 text-xs">
                              <span className="animate-pulse">● CONNEXION SÉCURISÉE</span>
                              <span className="animate-bounce">● ANALYSE EN COURS</span>
                              <span className="animate-ping">● VERDICT IMMINENT</span>
                            </div>

                            {/* 🎯 PROGRESS BAR FAKE */}
                            <div className="mt-2 w-full bg-gray-800 rounded-full h-1 overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-red-500 to-red-300 rounded-full animate-progress"></div>
                            </div>
                          </div>

                          {/* 🔴 CORNER ACCENTS */}
                          <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-red-500"></div>
                          <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-red-500"></div>
                          <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-red-500"></div>
                          <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-red-500"></div>
                        </div>
                      </div>

                      {/* 🎨 ANIMATIONS CSS */}
                      <style jsx>{`
      @keyframes sernAppear {
        from { opacity: 0; backdrop-filter: blur(0px); }
        to { opacity: 1; backdrop-filter: blur(8px); }
      }
      
      @keyframes sernSlideIn {
        from { 
          opacity: 0; 
          transform: scale(0.8) translateY(-50px); 
        }
        to { 
          opacity: 1; 
          transform: scale(1) translateY(0); 
        }
      }
      
      @keyframes sernPulse {
        0%, 100% { box-shadow: 0 0 50px rgba(255, 0, 0, 0.5); }
        50% { box-shadow: 0 0 80px rgba(255, 0, 0, 0.8); }
      }
      
      @keyframes sernGlow {
        0%, 100% { filter: drop-shadow(0 0 20px rgba(255, 0, 0, 0.5)); }
        50% { filter: drop-shadow(0 0 40px rgba(255, 0, 0, 0.8)); }
      }
      
      @keyframes textGlow {
        from { text-shadow: 0 0 10px rgba(0, 255, 0, 0.5); }
        to { text-shadow: 0 0 20px rgba(0, 255, 0, 0.8); }
      }
      
      @keyframes scan {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      
      @keyframes progress {
        0% { width: 0%; }
        100% { width: 100%; }
      }
      
      @keyframes float-1 {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(180deg); }
      }
      
      @keyframes float-2 {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-15px) rotate(-180deg); }
      }
      
      @keyframes float-3 {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-25px) rotate(90deg); }
      }
      
      @keyframes bounce-gentle {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
      }
      
      .animate-scan {
        animation: scan 2s linear infinite;
      }
      
      .animate-progress {
        animation: progress 3s ease-in-out infinite;
      }
      
      .animate-float-1 {
        animation: float-1 4s ease-in-out infinite;
      }
      
      .animate-float-2 {
        animation: float-2 3s ease-in-out infinite 0.5s;
      }
      
      .animate-float-3 {
        animation: float-3 5s ease-in-out infinite 1s;
      }
      
      .animate-bounce-gentle {
        animation: bounce-gentle 2s ease-in-out infinite;
      }
      
      .scrollbar-custom::-webkit-scrollbar {
        width: 6px;
      }
      
      .scrollbar-custom::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.5);
        border-radius: 3px;
      }
      
      .scrollbar-custom::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, #ff0000, #cc0000);
        border-radius: 3px;
      }
      
      .scrollbar-custom::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(to bottom, #ff3333, #ff0000);
      }
    `}</style>
                    </>
                  )}

                  {/* Damage Calculator Modal */}
{showDamageCalculator && (
  <DamageCalculator
    selectedCharacter={selectedCharacter}
    finalStats={(() => {
      const scaleStat = characters[selectedCharacter]?.scaleStat;
      return {
        [scaleStat]: (finalStatsWithoutArtefact[scaleStat] || 0) + (statsFromArtifacts[scaleStat] || 0),
        'Critical Hit Rate': (finalStatsWithoutArtefact['Critical Hit Rate'] || 0) + (statsFromArtifacts['Critical Hit Rate'] || 0),
        'Critical Hit Damage': (finalStatsWithoutArtefact['Critical Hit Damage'] || 0) + (statsFromArtifacts['Critical Hit Damage'] || 0),
        'Defense Penetration': (finalStatsWithoutArtefact['Defense Penetration'] || 0) + (statsFromArtifacts['Defense Penetration'] || 0),
        'Damage Increase': (finalStatsWithoutArtefact['Damage Increase'] || 0) + (statsFromArtifacts['Damage Increase'] || 0),
        [`${characters[selectedCharacter]?.element} Damage %`]: finalStatsWithoutArtefact[`${characters[selectedCharacter]?.element} Damage %`] || 0
      };
    })()}
    flatStats={flatStats}
    characters={characters}
    hunterWeapons={hunterWeapons}
    onClose={() => setShowDamageCalculator(false)}
    t={t}
  />
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


                    <div className="flex items-center justify-start w-full px-1 mb-1 tank-target">

                      <div className="flex flex-col items-center w-full gap-1 tank-target">


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
                          <div className="flex flex-col items-center w-full gap-1">

                            <div className="flex justify-between items-center w-full -mb-1 pr-2">
  <div className="flex items-center gap-3">
    {/* Bouton Arme */}
    <button
      className="bg-purple-800/30 hover:bg-purple-700/40 text-purple-300 hover:text-white
                border border-purple-600/50 hover:border-purple-500
                font-semibold px-4 py-2 text-sm rounded-lg
                transition-all duration-200 hover:scale-105
                flex items-center gap-2"
      onClick={() => setShowWeaponPopup(true)}
    >
      <span></span>
      {t("weapon")}
    </button>
    
    {/* Bouton Calculateur */}
    <button
      onClick={() => setShowDamageCalculator(true)}
      className="relative bg-purple-800/30 hover:bg-purple-700/40 text-purple-300 hover:text-white
                border border-purple-600/50 hover:border-purple-500
                font-semibold px-4 py-2 text-sm rounded-lg
                transition-all duration-200 hover:scale-105
                flex items-center gap-2"
      title="Calculateur de dégâts"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
      <span>DPS Calculator</span>
      <span className="absolute -top-1 -right-1 bg-purple-400 text-black text-[9px] px-1 py-0.5 rounded-full font-bold animate-pulse">
        NEW
      </span>
    </button>
    
    {/* Stats de l'arme */}
    <p className="text-purple-400 text-sm">
      {hunterWeapons[selectedCharacter]
        ? `+${hunterWeapons[selectedCharacter].mainStat || 0} ${characters[selectedCharacter]?.scaleStat || ''}`
        : 'Aucune arme définie'}
    </p>
  </div>

  {/* Bouton Modifier */}
  <button
    onClick={() => setEditStatsMode(!editStatsMode)}
    className="bg-purple-800/30 hover:bg-purple-700/40 text-purple-300 hover:text-white
              border border-purple-600/50 hover:border-purple-500
              font-semibold px-4 py-2 text-sm rounded-lg
              transition-all duration-200 hover:scale-105"
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
                    onScoreCalculated={handleArtifactScoreUpdate} // ← AJOUTER CETTE LIGNE !
                    onReportGenerated={handleReportGenerated} // ← AJOUTER CETTE LIGNE !
                    onTvTrigger={setTvDialogue} // 🔥 NOUVELLE PROP !
                  />
                ))}

              </div>

            </div>
          </div>
          {/* <div className={showSernPopup ? 'blur-background' : ''}></div> */}
          <div className="mt-1">
            <div className="relative w-full min-h-[240px]">
              {/* Zone pour positionner DOM au-dessus du canvas */}




              {showChibiBubble && chibiMessage && (
                <ChibiBubble
                  key={`bubble-${bubbleId}`} // <-- force un rerender total à chaque message
                  entityType={currentSpeaker} // ← REMPLACE PAR entityType direct
                  message={chibiMessage}
                  isMobile={isMobile}
                  position={chibiPos}
                />
              )}
              {/* 🎨 CANVAS SECTION - RESPONSIVE MOBILE/DESKTOP */}
              <div className="w-full mt-4 mb-2">
                {/* 📱 VERSION MOBILE - 3 LIGNES VERTICALES */}
                {((isMobile.isPhone || isMobile.isTablet) && !isMobile.isDesktop) ? (
                  <div className="flex flex-col items-center gap-2">
                    {/* Canvas Left - Ligne 1 */}
                    <div className="relative w-full flex justify-center">
                      <canvas
                        id="canvas-left"
                        width="400"
                        height="160"
                        className="rounded-lg shadow-md bg-black w-[80vw] max-w-[350px] h-auto"
                      />
                    </div>

                    {/* Canvas Center - Ligne 2 avec Portail */}
                    <div className="relative w-full flex justify-center">
                      <canvas
                        id="canvas-center"
                        width="400"
                        height="160"
                        className="rounded-lg shadow-md bg-black w-[80vw] max-w-[350px] h-auto"
                      />

                      {/* Portail Mobile - Repositionné */}
                      <div
                        className="absolute z-50 cursor-pointer hover:scale-105 transition-transform"
                        style={{
                          top: '40%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '20%',
                          height: '30%',
                          background: 'rgba(255, 0, 0, 0.1)', // Debug - retire en prod
                          border: '1px solid rgba(255, 0, 0, 0.3)' // Debug - retire en prod
                        }}
                        onClick={() => {
                          showTankMessage("🚪 Vivement Séville et ses 45°... Qu'on se cache d'ici !", true);
                        }}
                      />
                    </div>

                    {/* Canvas Right - Ligne 3 */}
                    <div className="relative w-full flex justify-center">
                      <canvas
                        id="canvas-right"
                        width="400"
                        height="160"
                        className="rounded-lg shadow-md bg-black w-[80vw] max-w-[350px] h-auto"
                      />
                    </div>

                    {/* Label Mobile */}
                    <div className="text-center mt-2 text-gray-400 text-xs">
                      <p>🌌 Royaumes des Ombres</p>
                      <p className="text-[10px]">Neige • Sanctuaire • Terre Verte</p>
                    </div>
                  </div>
                ) : (
                  // 🖥️ VERSION DESKTOP - LIGNE HORIZONTALE
                  <div className="flex justify-center items-center relative gap-1">
                    <canvas
                      id="canvas-left"
                      width="600"
                      height="240"
                      className="rounded-l-lg shadow-md bg-black w-[30vw] max-w-[400px] h-auto"
                    />

                    <canvas
                      id="canvas-center"
                      width="600"
                      height="240"
                      className="shadow-md bg-black w-[30vw] max-w-[400px] h-auto"
                    />

       {/* Portail cliquable */}
<div
  className="absolute z-50 cursor-pointer hover:scale-105 transition-transform"
  style={{
    top: '40%',
    left: '46.7%',
    transform: 'translate(-50%, 50%)',
    width: '30px',
    height: '30px',
    zIndex: 10 // ← BEAUCOUP plus bas que z-50
  }}
  onClick={handlePortalClick}
>
  {/* Zone cliquable invisible */}
  {/* 🔥 Effet visuel progressif selon les clics */}
  {portalClickCount > 10 && (
    <div className="absolute inset-0 animate-pulse bg-blue-500 opacity-20 rounded-full"></div>
  )}
  {portalClickCount > 20 && (
    <div className="absolute inset-0 animate-bounce bg-purple-500 opacity-30 rounded-full"></div>
  )}
  {portalClickCount > 25 && (
    <div className="absolute inset-0 animate-ping bg-red-500 opacity-40 rounded-full"></div>
  )}
</div>

                    <canvas
                      id="canvas-right"
                      width="600"
                      height="240"
                      className="rounded-r-lg shadow-md bg-black w-[30vw] max-w-[400px] h-auto"
                    />
                  </div>
                )}
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