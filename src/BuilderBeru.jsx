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


let tank = {
  x: 0,
  y: 0,
  img: new Image(),
  speedX: 0,
  speedY: 0,
  size: 64,
  direction: 'down',
};

let currentTankCanvasId = 'canvas-center'; // par défaut
let tankAlreadySpawned = false;

function encodeUTF8(str) {
  return btoa(unescape(encodeURIComponent(str)));
}
function decodeUTF8(encoded) {
  return decodeURIComponent(escape(atob(encoded)));
}

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
  "JO n'a toujours pas d'images... Moi je dis ça moi je dis rien 😶"
  // "Rappel : Critical Rate, c’est pas Crit DMG. N’oublie jamais.",
  // "Quand le serveur bug, c’est moi qui prends tout… #respecteTank",
  // "This build smells like a Gagold masterpiece.",
  // "Kly coded this with coffee and shadows.",
  // "Don’t forget your daily pulls, or BobbyJones will kick you.",
  // "Who's skipping the Guild Boss today? 👀",
  // "Artifacts don't roll themselves, you know.",
  // "Another +0 Helmet? Really?",
  // "This chest piece looks... cursed.",
  // "I saw Sung Jin-Woo roll better than that.",
  // "The Gagold guild expects greatness!",
  // "Legends say BobbyJones kicked someone for missing 1 BDG.",
  // "Is this build Gagold-approved?",
  // "Imagine Kly sees this gear. 😬",
  // "Don't let Tank down. Enhance your boots!",
  // "Did someone say... legendary artifact?",
  // "This isn’t slagate, this is Kly's domain.",
  // "No BDG? No mercy from Bobby.",
  // "This ring is older than Kaisel.",
  // "Missing Critical Rate again, huh?",
  // "Your HP is as low as your chances vs Ant King.",
  // "Even Beru would say 'meh' to this stat.",

  // // Solo Leveling / Artifacts
  // "These artifacts are crying for a reforge.",
  // "Did you just roll flat DEF again? 😂",
  // "Shadow Soldiers would laugh at this gear.",
  // "You need a dungeon, not luck.",
  // "That’s not RNG, that’s sabotage.",
  // "Even Baruka had better rolls.",
  // "Cha Hae-In wouldn't wear this... even blindfolded.",
  // "Looks like the System's trolling you today.",

  // // Gagold / Lore
  // "BobbyJones is watching... 👁",
  // "Miss one BDG and you're out. Gagold rules.",
  // "You think Gagold tolerates +3 gear?",
  // "Pull your weight or pull the door 🚪",
  // "This is Gagold, not a daycare.",
  // "Kly built this place in the shadow of Solo Leveling itself.",
  // "Respect the rank, fear the BDG.",
  // "Guild motto: no excuses, only crits.",

  // // Meta / Fun
  // "Bet you thought that was a good roll. You thought wrong.",
  // "Tank's watching. Tank's judging.",
  // "I've seen better builds in tutorial zones.",
  // "What’s next, flat luck as a main stat?",
  // "Every time you reroll, a shadow cries.",
  // "I auto-attack harder than this weapon does.",
  // "You call this optimization? I call it disappointment.",
  // "I heard SLAGATE finally finished their site... 😭😭😭😝😌",
  // "This build was handcrafted in mediocrity."
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
  'Critical Rate': {
    0: { min: 900, max: 1300 },
    1: { min: 900, max: 1300 },
    2: { min: 900, max: 1300 },
    3: { min: 900, max: 1300 },
    4: { min: 1300, max: 1500 },
  },
  'Defense Penetration': {
    0: {
      min: 900, max:
        1300
    },
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
    0: 4865,
    1: 4865,
    2: 4865,
    3: 4865,
    4: 4865,
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

  const initialArtifacts = {
  Helmet: { mainStat: '', subStats: [], mainStatValue: 0, subStatsLevels: [] },
  Chest: { mainStat: '', subStats: [], mainStatValue: 0, subStatsLevels: [] },
  Gloves: { mainStat: '', subStats: [], mainStatValue: 0, subStatsLevels: [] },
  Boots: { mainStat: '', subStats: [], mainStatValue: 0, subStatsLevels: [] },
  Necklace: { mainStat: '', subStats: [], mainStatValue: 0, subStatsLevels: [] },
  Bracelet: { mainStat: '', subStats: [], mainStatValue: 0, subStatsLevels: [] },
  Ring: { mainStat: '', subStats: [], mainStatValue: 0, subStatsLevels: [] },
  Earrings: { mainStat: '', subStats: [], mainStatValue: 0, subStatsLevels: [] },
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
    console.log("📦 artifactData reçu :", artifactData);
    setComparisonData({ original: artifactData, candidate: emptyArtifact });
    console.log("Lancement de la comparaison avec :", artifactData.title);
  };

  const refs = {
    mainImage: mainImageRef
  };

  const allStats = [
    'Attack', 'Defense', 'HP', 'Critical Rate',
    'Critical Hit Damage', 'Defense Penetration', 'Damage Increase',
    'MP Recovery Rate Increase (%)', 'Additional MP', 'MP Consumption Reduction',
    'Precision', 'Damage Reduction', 'Healing Given Increase (%)'
  ];

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

    setHunterCores((prev) => ({
      ...prev,
      [hunterName]: coreData,
    }));
  };

  const getTankScreenPosition = () => {
    // Toujours revalider à chaque appel
    const canvas = document.getElementById(currentTankCanvasId);
    console.log("🧪 currentTankCanvasId utilisé :", currentTankCanvasId);
    if (!canvas) {
      // Forcer une recherche dynamique
      const fallbackIds = ['canvas-left', 'canvas-center', 'canvas-right'];
      for (const id of fallbackIds) {
        const tryCanvas = document.getElementById(id);
        if (tryCanvas) {
          currentTankCanvasId = id;
          console.log("✅ Canvas retrouvé dynamiquement :", id);

          return getTankScreenPosition(); // 🔁 appel récursif avec nouveau ID
        }
      }

      console.error("❌ Aucun canvas valide trouvé.");
      return { x: 0, y: 0 };
    }

    const rect = canvas.getBoundingClientRect();
    return {
      x: rect.left + tank.x,
      y: rect.top + tank.y,
      currentTankCanvasId
    };
  };

  const getRandomMystEggLine = (charKey, context) => {
    const data = MYST_EGGS?.[charKey]?.[context];
    if (!data || !Array.isArray(data)) return null;
    return data[Math.floor(Math.random() * data.length)];
  };

  const characterStats = {
    'chae': { attack: 5495, defense: 5544, hp: 10825, critRate: 0 },
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
    },
  });
  const [comparisonData, setComparisonData] = useState(null); // 👈 ici

  const [gemData, setGemData] = useState(() => {
    const saved = localStorage.getItem('global_gem_data');
    return saved ? JSON.parse(saved) : {
      Red: { 'Additional Attack': 0, 'Attack %': 0 },
      Blue: { 'Additional HP': 0, 'HP %': 0, 'Healing Given Increase (%)': 0 },
      Green: { 'Additional Defense': 0, 'Defense %': 0, 'Damage Reduction': 0 },
      Purple: { 'MP Recovery Rate Increase (%)': 0, 'Additional MP': 0, 'MP Consumption Reduction': 0 },
      Yellow: { 'Precision': 0, 'Critical Hit Damage': 0, 'Defense Penetration': 0 }
    };
  });

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
    } else if (lowerStat.includes('Critical Rate') || lowerStat.includes('critical rate')) {
      flat['Critical Rate'] += value;
    } else {
      flat[stat] = (flat[stat] || 0) + value;
    }
  };

  // 🧠 Fonction de recalcul des stats finales avec artefacts
  const recalculateStatsFromArtifacts = () => {
    if (!selectedCharacter) return;

    const flat = { ...flatStats }; // ⚠️ utilise flatStats réel du state
    const updated = {};

    Object.values(artifactsData).forEach(artifact => {
      if (!artifact) return;

      // ➤ Substats
      artifact.subStats?.forEach((stat, i) => {
        const levelInfo = artifact.subStatsLevels?.[i];
        if (!stat || !levelInfo || typeof levelInfo.value !== 'number') return;

        if (stat.endsWith('%')) {
          const baseStat = stat.replace(' %', '');
          const base = flat[baseStat] || 0;
          updated[baseStat] = (updated[baseStat] || 0) + (base * levelInfo.value / 100);
        } else {
          updated[stat] = (updated[stat] || 0) + levelInfo.value;
        }
      });

      // ➤ Main stat
      if (artifact.mainStat && artifact.mainStatValue) {
        const stat = artifact.mainStat;
        const value = artifact.mainStatValue;

        if (stat.endsWith('%')) {
          const baseStat = stat.replace(' %', '');
          const base = flat[baseStat] || 0;
          updated[baseStat] = (updated[baseStat] || 0) + (base * value / 100);
        } else {
          updated[stat] = (updated[stat] || 0) + value;
        }
      }
    });

    setStatsFromArtifacts(completeStats(updated));
  };

  const tankMessageRef = useRef('');
  const messageOpacityRef = useRef(1);
  const [tankMessage, setTankMessage] = useState('');
  const [messageOpacity, setMessageOpacity] = useState(1);
  const [showNoyauxPopup, setShowNoyauxPopup] = useState(false);
  const [hunterCores, setHunterCores] = useState({});
  const [artifacts, setArtifacts] = useState(initialArtifacts);
  const [hunterWeapons, setHunterWeapons] = useState(() => {
    const fromStorage = JSON.parse(localStorage.getItem('hunterWeapons') || '{}');
    return fromStorage;
  });
  const [parsedArtifactData, setParsedArtifactData] = useState(null);
  const [showWeaponPopup, setShowWeaponPopup] = useState(false);

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


  const narrativeText = `
{img:https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747834575/AnotherGagoldFound_yqrrnb.png ref=mainImage class=fade-in size=320}
Chargement du rapport Kanae...
{delay=1500}

{sound:https://res.cloudinary.com/dbg7m8qjd/video/upload/v1747685476/Sad_Anime_Ost_Believe_Me_udqopx.mp3}
{delay=2500}

{sound:https://res.cloudinary.com/dbg7m8qjd/video/upload/v1747830888/Anime_girl_yawn_cq3iy3.mp3}

*bâillement léger*

Kanae entrouvre doucement la porte de sa chambre.

{img:https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747831036/kanae1_ealvhz.png ref=mainImage class=fade-in size=320}

Ses cheveux sont en bataille, elle porte un pyjama trop grand pour elle, et ses joues sont un peu rouges.

{delay=1500}

"Encore ces... sauvegardes. Qui fait ça... à cette heure-là... ?"

{sound:https://res.cloudinary.com/dbg7m8qjd/video/upload/v1747831216/sigh_confused_ctuchy.mp3}

Elle frotte ses yeux, l'air perdue.

"J’ai rêvé que quelqu’un cliquait... encore... et encore..."

{delay=1000}

Elle observe autour d’elle. Sa chambre est un peu en désordre.
Des peluches tombent d’une étagère.
Un sabre traîne à côté d’un pot de nouilles froides.

{sound:https://res.cloudinary.com/dbg7m8qjd/video/upload/v1747832147/Gong_Sound_Effect_k85f8f.mp3}

"...Vous... m’avez réveillée."

{delay=800}

Ses yeux croisent les vôtres. Un léger sourire gêné.

"Tu m’as déjà vue en pyjama maintenant... 😳"

{sound:https://res.cloudinary.com/dbg7m8qjd/video/upload/v1747832552/Scared_anime_female_or9gvg.mp3}

Kanae détourne le regard, croise les bras.

"Bon. J’vais retourner me coucher. Mais... juste cette fois, arrête les sauvegardes, d’accord ?"

{delay=2000}

"Sinon je descends en vrai."

{sound:https://res.cloudinary.com/dbg7m8qjd/video/upload/v1747832749/Happy_Anime_girl_Sound_Effect_whlcx6.mp3}

{delay=2000}

`;




  const [selectedCharacter, setSelectedCharacter] = useState('chae');

  const characters = {
    '': {
      name: 'Sélectionner un personnage',
      img: '', // Pas d'image volontairement
      class: '',
      grade: '',
      element: '',
      scaleStat: ''
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
    // deep copy pour forcer React à capter le changement
    const cleanData = JSON.parse(JSON.stringify(coreData));
    setHunterCores(prev => ({
      ...prev,
      [hunterName]: cleanData
    }));
  };

  const handleSaveWeapon = (hunterName, weaponData) => {
    setHunterWeapons(prev => ({
      ...prev,
      [hunterName]: weaponData
    }));
  };

  const [showGemPopup, setShowGemPopup] = useState(false);

  const handleSaveGems = (data) => {
    setGemData(data);
    localStorage.setItem('global_gem_data', JSON.stringify(data));
    showTankMessage('💎 Gemmes mises à jour et sauvegardées !', true);
  };

  const handleExportAllBuilds = () => {
    const allBuilds = {};

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('build_')) {
        try {
          allBuilds[key] = JSON.parse(localStorage.getItem(key));
        } catch (e) {
          console.warn(`Failed to parse build for ${key}`);
        }
      }
    });

    // Ajoute la liste des builds récents
    allBuilds.recentBuilds = JSON.parse(localStorage.getItem('recentBuilds') || '[]');

    // 🧬 Intègre les hunterCores (noyaux) si dispo
    Object.entries(hunterCores).forEach(([character, cores]) => {
      const key = `build_${character}`;
      if (allBuilds[key]) {
        allBuilds[key].hunterCores = cores;
      }
    });

    // Encodage & copie
    const exportString = JSON.stringify(allBuilds);
    const salted = exportString + salt;
    const encoded = btoa(salted);

    navigator.clipboard.writeText(encoded);

    showTankMessage('📋 All builds copied to clipboard!', true);
  };

//   const updateArtifactFromOCR = (parsedData) => {
//   setArtifacts(prev => {
//     const updated = [...prev];
//     const index = updated.findIndex(a => a.type === parsedData.type);
//     if (index === -1) return prev;

//     const artifactToUpdate = updated[index];

//     updated[index] = {
//       ...artifactToUpdate,
//       mainStat: parsedData.mainStat,
//       subStats: parsedData.subStats,
//       procValue: parsedData.procValue || artifactToUpdate.procValue || null
//     };

//     return updated;
//   });
// };

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

          if (
            imported.flatStats &&
            imported.statsWithoutArtefact &&
            imported.artifactsData
          ) {
            // Cas ancien (1 seul build)
            localStorage.setItem(`build_${selectedCharacter}`, JSON.stringify(imported));
            setFlatStats(imported.flatStats);
            setStatsWithoutArtefact(imported.statsWithoutArtefact);
            setArtifactsData(imported.artifactsData);
            setHunterCores(imported.hunterCores);
            showTankMessage("Single build imported for current character 🥸");
            setIsImportedBuild(true);
          } else if (
            typeof imported === 'object' &&
            Object.keys(imported).some((key) => key.startsWith('build_'))
          ) {
            // Cas nouveau (plusieurs builds)
            Object.entries(imported).forEach(([key, value]) => {
              localStorage.setItem(key, JSON.stringify(value));
            });
            if (imported.recentBuilds) {
              localStorage.setItem('recentBuilds', JSON.stringify(imported.recentBuilds));
              showTankMessage("Builds & Icons imported with success 😎", true);
              setRecentBuilds(imported.recentBuilds)
            } else {
              showTankMessage("Builds imported (no icons info) 😶", true);
            }
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
    localStorage.setItem('hunterWeapons', JSON.stringify({
      ...hunterWeapons,
      [name]: weapon
    }));

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

  const handleSaveBuild = () => {
    if (!selectedCharacter) return;

    const build = {
      flatStats,
      statsWithoutArtefact,
      artifactsData,
      hunterCores, // ← ici 🧠
      hunterWeapons         // ✅ à ajouter
    };

    if (isImportedBuild) {
      setShowImportSaveWarning(true);
      return;
    }

    localStorage.setItem(`build_${selectedCharacter}`, JSON.stringify(build));

    // Mise à jour des builds récents
    let recent = JSON.parse(localStorage.getItem('recentBuilds') || '[]');
    recent = recent.filter((id) => id !== selectedCharacter);
    recent.unshift(selectedCharacter);
    if (recent.length > 4) recent = recent.slice(0, 4);
    localStorage.setItem('recentBuilds', JSON.stringify(recent));

    // Messages mystiques
    const mystLine = getRandomMystEggLine(selectedCharacter, 'messageSaved');
    const defaultLine = `Build for ${selectedCharacter} saved! 😌`;

    if (selectedCharacter === "jo") {
      setJoSaveCount(prev => prev + 1);
      if (joSaveCount + 1 >= 5) {
        triggerSernIntervention();
        return;
      }
    } else if (selectedCharacter === "kanae") {
      setKanaeSaveCount(prev => prev + 1);
      if (kanaeSaveCount + 1 >= 5) {
        setShowNarrative(true);
        return;
      }
    }

    showTankMessage(mystLine || defaultLine, true);
    setRecentBuilds(recent);
  };



  const handleLoadBuild = (characterKey) => {
    const key = characterKey || selectedCharacter;
    if (!key) return;



    const saved = localStorage.getItem(`build_${key}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFlatStats(parsed.flatStats || {});
        setStatsWithoutArtefact(parsed.statsWithoutArtefact || {});
        setArtifactsData(parsed.artifactsData || {});
        if (selectedCharacter !== key) {
          setSelectedCharacter(key);
        }

        if (parsed.hunterCores) {
          setHunterCores(prev => ({
            ...prev,
            [key]: parsed.hunterCores[key] || {}
          }));
        }
        // setHunterCores(prev => {
        //    parsed.hunterCores || {};

        // });
        // showTankMessage(`Build for ${key} loaded! 😈`);
      } catch (e) {
        console.error('❌ Failed to load build:', e);
        showTankMessage(`Corrupted build for ${key}... 😱`);
      }
    } else {
      showTankMessage(`No saved build for ${key} yet! 😶`);
    }
  };

  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem('recentBuilds') || '[]');
    if (recent.length > 0) {
      setSelectedCharacter(recent[0]); // premier build dispo
      handleLoadBuild(recent[0]);
    } else {
      setSelectedCharacter('chae'); // Chae à poil sinon
    }
  }, []);

  const simulateWeaponSaveIfMissing = (hunterKey) => {
    if (!hunterWeapons[hunterKey]) {
      const scale = characters[hunterKey]?.scaleStat || 'Attack';
      let mainStat = 0;

      if (scale === 'Defense') mainStat = 3080;
      else if (scale === 'HP') mainStat = 6120;
      else mainStat = 3080; // Attack par défaut

      const defaultWeapon = {
        mainStat,
        precision: 4000,
      };

      handleSaveWeapon(hunterKey, defaultWeapon); // 👈 simulate true Save
      localStorage.setItem('hunterWeapons', JSON.stringify({
        ...hunterWeapons,
        [hunterKey]: defaultWeapon
      }));
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
      'Critical Rate': char?.critRate || 0,
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
    'Critical Rate': 0,
  });

  const [statsFromArtifacts, setStatsFromArtifacts] = useState({
    Attack: 0,
    Defense: 0,
    HP: 0,
    'Critical Rate': 0
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
    'Critical Rate': defaultCharacter?.critRate || 0,
  });

  const computeStatsWithoutArtefact = (flatStats, gemData, noyaux) => {
    const allBonuses = {
      'Attack': 0,
      'HP': 0,
      'Defense': 0,
      'Critical Rate': 0
    };

    const percentMap = {
      'Attack %': 'Attack',
      'HP %': 'HP',
      'Defense %': 'Defense'
    };

    const additionalMap = {
      'Additional Attack': 'Attack',
      'Additional HP': 'HP',
      'Additional Defense': 'Defense'
    };

    const allSources = [gemData, ...Object.values(noyaux || {})];

    for (const source of allSources) {
      for (const [stat, value] of Object.entries(source || {})) {
        if (percentMap[stat]) {
          const base = flatStats[percentMap[stat]] || 0;
          allBonuses[percentMap[stat]] += base * (value / 100);
        } else if (additionalMap[stat]) {
          allBonuses[additionalMap[stat]] += value;
        } else if (stat === 'Critical Rate') {
          allBonuses['Critical Rate'] += value;
        }
      }
    }

    return {
      'Attack': Math.round((flatStats.Attack || 0) + allBonuses.Attack),
      'HP': Math.round((flatStats.HP || 0) + allBonuses.HP),
      'Defense': Math.round((flatStats.Defense || 0) + allBonuses.Defense),
      'Critical Rate': Math.round((flatStats['Critical Rate'] || 0) + allBonuses['Critical Rate']),
    };
  };


  useEffect(() => {
    const updatedStats = completeStats({ ...flatStats }); // flat = base + weapon
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

    // C. Phase 1 – Additional uniquement
    for (const source of allSources) {
      for (const [stat, value] of Object.entries(source || {})) {
        if (stat.startsWith('Additional ')) {
          const baseStatName = stat.replace('Additional ', '');
          updatedStats[baseStatName] = (updatedStats[baseStatName] || 0) + value;
        }
      }
    }

    // C. Phase 2 – Pourcentages (sur flatStats uniquement)
    for (const source of allSources) {
      for (const [stat, value] of Object.entries(source || {})) {
        if (stat.endsWith('%')) {
          const baseStatName = stat.replace(' %', '');
          const base = flatStats[baseStatName] || 0; // 🧠 c’est ici que tu corriges le bug
          updatedStats[baseStatName] += (base * value) / 100;
        }
      }
    }

    // C. Phase 3 – le reste (flat direct style : Precision, Critical Rate, etc.)
    for (const source of allSources) {
      for (const [stat, value] of Object.entries(source || {})) {
        if (!stat.startsWith('Additional ') && !stat.endsWith('%')) {
          updatedStats[stat] = (updatedStats[stat] || 0) + value;
        }
      }
    }

    setStatsWithoutArtefact(completeStats(updatedStats));
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
        'Critical Rate': charStats.critRate,
      })
    );
  }, [selectedCharacter, hunterWeapons]);

  // useEffect(() => {
  //   const char = characters[selectedCharacter];
  //   const weapon = hunterWeapons[selectedCharacter] || {};
  //   if (!char) return;

  //   setFlatStats(getFlatStatsWithWeapon(char, weapon));
  // }, [selectedCharacter, hunterWeapons]);

  useEffect(() => {
    if (showNarrative) {
      const steps = parseNarrative(narrativeText);
      runNarrativeSteps(steps, {
        refs,
        setCurrentImage,
        dytextRef,
        setShowNarrative,
        triggerFadeOutAllMusic, // 👈 ici aussi
        playingAudiosRef
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
        'Critical Rate': char.critRate,
      };
    }
  }, [selectedCharacter]);
  const [joSaveCount, setJoSaveCount] = useState(0);
  const [kanaeSaveCount, setKanaeSaveCount] = useState(0);
  const [recentBuilds, setRecentBuilds] = useState([]);
  const [isImportedBuild, setIsImportedBuild] = useState(false);
  const [showImportSaveWarning, setShowImportSaveWarning] = useState(false);
  const [tankClickCount, setTankClickCount] = useState(0);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('recentBuilds') || '[]');
    setRecentBuilds(saved);
  }, []);

  const handleClickBuildIcon = (characterName) => {
    const saved = localStorage.getItem(`build_${characterName}`);
    if (!saved) return;
    const build = JSON.parse(saved);
    setSelectedCharacter(characterName);
    setFlatStats(build.flatStats);
    setStatsWithoutArtefact(build.statsWithoutArtefact);
    setArtifactsData(build.artifactsData);
    setHunterCores(build.hunterCores || {});
    showTankMessage(`Loaded ${characterName}'s saved build 😌`);
  };

  // useEffect(() => {
  //   setStatsWithoutArtefact({
  //     Attack: flatStats.Attack,
  //     Defense: flatStats.Defense,
  //     HP: flatStats.HP,
  //     'Critical Rate': flatStats['Critical Rate'],
  //   });
  // }, []);

  useEffect(() => {
    let canvasLeft = document.getElementById('canvas-left');
    let canvasCenter = document.getElementById('canvas-center');
    let canvasRight = document.getElementById('canvas-right');

    function resetCanvas(canvas) {
      if (!canvas) return;
      const newCanvas = canvas.cloneNode(true);
      canvas.parentNode.replaceChild(newCanvas, canvas);
    }

    // Réinitialiser les trois canvas
    resetCanvas(canvasLeft);
    resetCanvas(canvasCenter);
    resetCanvas(canvasRight);

    // IMPORTANT : récupérer les nouveaux canvas recréés
    canvasLeft = document.getElementById('canvas-left');
    canvasCenter = document.getElementById('canvas-center');
    canvasRight = document.getElementById('canvas-right');


    if (!canvasLeft || !canvasCenter || !canvasRight) return;

    const ctxLeft = canvasLeft.getContext('2d');
    const ctxCenter = canvasCenter.getContext('2d');
    const ctxRight = canvasRight.getContext('2d');
    ctxLeft.clearRect(0, 0, canvasLeft.width, canvasLeft.height);
    ctxCenter.clearRect(0, 0, canvasCenter.width, canvasCenter.height);
    ctxRight.clearRect(0, 0, canvasRight.width, canvasRight.height);

    const imgLeft = new Image();
    const imgCenter = new Image();
    const imgRight = new Image();

    imgLeft.src = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604093/neige_onpilk.png';
    imgCenter.src = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604092/sanctuaire_rfcze5.png';
    imgRight.src = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604092/greenland_cb4caw.png';

    let spawnCanvas = null;
    let imagesLoaded = 0;


    imgLeft.onload = () => {
      ctxLeft.drawImage(imgLeft, 0, 0, canvasLeft.width, canvasLeft.height);

    };
    imgCenter.onload = () => {
      ctxCenter.drawImage(imgCenter, 0, 0, canvasCenter.width, canvasCenter.height);

    };
    imgRight.onload = () => {
      ctxRight.drawImage(imgRight, 0, 0, canvasRight.width, canvasRight.height);

    };

    spawnTank();
    animate();
    function spawnTank() {
      const canvases = [canvasLeft, canvasCenter, canvasRight];
      const randomIndex = Math.floor(Math.random() * canvases.length);
      spawnCanvas = canvases[randomIndex];
      // const canvasIds = ['canvas-left', 'canvas-center', 'canvas-right'];
      currentTankCanvasId = spawnCanvas.id; // 👈 À définir en global
      console.log("✅ Tank spawn dans :", spawnCanvas.id);
      spawnCanvas.addEventListener('click', handleTankClick);

      tank.x = spawnCanvas.width / 2;
      tank.y = spawnCanvas.height - 80;
    }

    function fireTankLaser() {
      console.log("💥 LASER DE TANK ACTIVÉ !");

      const tankCanvas = document.getElementById(currentTankCanvasId);
      // const target = document.getElementById("targetToDestroy");
      const laser = document.getElementById("tank-laser");
      const candidates = document.querySelectorAll(".tank-target");

      if (!tankCanvas || !laser || !candidates) return;
      const target = candidates[Math.floor(Math.random() * candidates.length)];
      const tankRect = tankCanvas.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      tank.img.src = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604462/tank_dos_bk6poi.png';
      const startX = tankRect.left + tankRect.width / 2;
      const startY = tankRect.top + tank.y - 80;
      const endX = targetRect.left + targetRect.width / 2;
      const endY = targetRect.top + targetRect.height / 2;

      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const length = Math.sqrt(deltaX ** 2 + deltaY ** 2);
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

      // Appliquer styles
      laser.style.width = `${length}px`;
      laser.style.height = `4px`;
      laser.style.left = `${startX}px`;
      laser.style.top = `${startY}px`;
      laser.style.transform = `rotate(${angle}deg)`;
      laser.style.transformOrigin = "0 0"; // origine : début du rayon
      laser.classList.remove("hidden");

      // 💥 Effet et destruction
      setTimeout(() => {
        laser.classList.add("hidden");
        target.classList.add("laser-hit");

        setTimeout(() => {
          target.remove();
        }, 500);
      }, 300);
    }

    function handleTankClick() {
      setTankClickCount(prev => {
        const count = prev + 1;
        console.log(`🔥 ${count} fois que Tank est cliqué... 👀`);

        if (count === 5) {
          showTankMessage("Hé ! C’est pas un bouton ici 😐", true);
        } else if (count === 10) {
          showTankMessage("Encore un clic et j'appelle BobbyJones 😠", true);
        } else if (count === 20) {
          showTankMessage("Ok, là j’en ai marre.", true);
        } else if (count === 30) {
          showTankMessage("...Dernier avertissement.", true);
        }


        if (count >= 40) {
          fireTankLaser();
          return 0; // Reset
        }

        return count; // Incrémente
      });
    }

    function drawTankMessage(ctx) {
      if (tankIsWandering) {
        const speed = 0.8;
        if (tankDirection === "left") tank.x -= speed;
        if (tankDirection === "right") tank.x += speed;
        if (tankDirection === "up") tank.y -= speed;
        if (tankDirection === "down") tank.y += speed;

        // Garde Tank dans les limites du canvas
        tank.x = Math.max(0, Math.min(spawnCanvas.width, tank.x));
        tank.y = Math.max(spawnCanvas.height / 2, Math.min(spawnCanvas.height, tank.y));
      }
      const message = tankMessageRef.current;
      const opacity = messageOpacityRef.current;

      if (!message || opacity <= 0) return;

      const paddingX = 20;
      const paddingY = 14;
      const fontSize = 16;

      ctx.save();
      ctx.globalAlpha = opacity;

      ctx.font = `bold ${fontSize}px Arial`;
      const textWidth = ctx.measureText(message).width;
      const bubbleWidth = textWidth + paddingX * 2;
      const bubbleHeight = fontSize + paddingY * 2;
      const radius = 12;

      const x = tank.x - bubbleWidth / 2;
      const y = tank.y - tank.size - bubbleHeight - 20;

      // 💬 Bulle arrondie
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + bubbleWidth - radius, y);
      ctx.quadraticCurveTo(x + bubbleWidth, y, x + bubbleWidth, y + radius);
      ctx.lineTo(x + bubbleWidth, y + bubbleHeight - radius);
      ctx.quadraticCurveTo(x + bubbleWidth, y + bubbleHeight, x + bubbleWidth - radius, y + bubbleHeight);
      ctx.lineTo(x + radius, y + bubbleHeight);
      ctx.quadraticCurveTo(x, y + bubbleHeight, x, y + bubbleHeight - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();

      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      // ✍️ Texte
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(message, x + bubbleWidth / 2, y + bubbleHeight / 2);

      ctx.restore();
    }


    function drawTank() {
      if (!spawnCanvas) return;
      const ctx = spawnCanvas.getContext('2d');
      if (!ctx) return;

      // 1. Effacer tout
      ctx.clearRect(0, 0, spawnCanvas.width, spawnCanvas.height);

      // 2. Redessiner le fond
      if (spawnCanvas === canvasLeft) ctx.drawImage(imgLeft, 0, 0, canvasLeft.width, canvasLeft.height);
      if (spawnCanvas === canvasCenter) ctx.drawImage(imgCenter, 0, 0, canvasCenter.width, canvasCenter.height);
      if (spawnCanvas === canvasRight) ctx.drawImage(imgRight, 0, 0, canvasRight.width, canvasRight.height);

      // 3. Dessiner Tank
      ctx.save();
      const scale = ((tank.y / 2) / spawnCanvas.height) * 4;
      ctx.translate(tank.x, tank.y);
      ctx.scale(scale, scale);
      ctx.drawImage(tank.img, -tank.size / 2, -tank.size, tank.size, tank.size);
      ctx.restore();
      drawTankMessage(ctx);
    }

    function animate() {
      if (!spawnCanvas) return;

      tank.x += tank.speedX;
      tank.y += tank.speedY;

      const friction = 0.9;
      const maxSpeed = 1.2;

      tank.speedX *= friction;
      tank.speedY *= friction;

      if (tank.speedX > maxSpeed) tank.speedX = maxSpeed;
      if (tank.speedX < -maxSpeed) tank.speedX = -maxSpeed;
      if (tank.speedY > maxSpeed) tank.speedY = maxSpeed;
      if (tank.speedY < -maxSpeed) tank.speedY = -maxSpeed;

      // Limites
      if (tank.x < 0) tank.x = 0;
      if (tank.x > spawnCanvas.width) tank.x = spawnCanvas.width;
      if (tank.y < spawnCanvas.height / 2) tank.y = spawnCanvas.height / 2;
      if (tank.y > spawnCanvas.height) tank.y = spawnCanvas.height;
      if (tankIsWandering && tankDirection) {
        switch (tankDirection) {
          case 'left':
            tank.img.src = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748294466/tank_run_left_lxr3km.png';
            break;
          case 'right':
            tank.img.src = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748294466/tank_run_right_2_zrf0y1.png';
            break;
          case 'up':
            tank.img.src = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604462/tank_dos_bk6poi.png';
            break;
          case 'down':
            tank.img.src = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604465/tank_face_n9kxrh.png';
            break;
        }
      }
      drawTank();
      requestAnimationFrame(animate);
    }

    tank.img.src = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604465/tank_face_n9kxrh.png';

    const handleKeyDown = (e) => {
      if (!spawnCanvas) return;
      if (e.key === 'ArrowLeft') {
        tank.speedX = -0.6;
        tank.direction = 'left';
        tank.img.src = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748294466/tank_run_left_lxr3km.png';
      } else if (e.key === 'ArrowRight') {
        tank.speedX = 0.6;
        tank.direction = 'right';
        tank.img.src = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748294466/tank_run_right_2_zrf0y1.png';
      } else if (e.key === 'ArrowUp') {
        tank.speedY = -0.15;
        tank.img.src = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604462/tank_dos_bk6poi.png';
      } else if (e.key === 'ArrowDown') {
        tank.speedY = 0.15;
        tank.img.src = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604465/tank_face_n9kxrh.png';
      }
    };

    const handleKeyUp = (e) => {
      if (!spawnCanvas) return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        tank.speedX = 0;
        tank.img.src = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747604465/tank_face_n9kxrh.png';
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
  }, []);

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


  useEffect(() => {
    const newStatsFromArtifacts = {
      Attack: 0,
      Defense: 0,
      HP: 0,
      'Critical Rate': 0
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

        const key = ['Attack', 'HP', 'Defense', 'Critical Rate'].find(
          valid => cleanStat === valid || cleanStat === `${valid} %`
        );

        if (!key) return;

        if (stat.includes('%')) {
          newStatsFromArtifacts[key] += Math.floor(flatStats[key] * value / 100);
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


  const showTankMessage = (message, priority = false, queue = false) => {
    if (isTankSpeaking.current && !priority && queue) {
      messageQueue.current.push(message);
      return;
    }
    if (isTankSpeaking.current && !priority && !queue) {
      return;
    }

    isTankSpeaking.current = true;
    setShowChibiBubble(false); // ← force clean
    setBubbleId(Date.now());


    const pos = getTankScreenPosition();
    setChibiPos({ x: pos.x, y: pos.y, currentTankCanvasId });
    setShowChibiBubble(true);
    setChibiMessage(message);



    setTimeout(() => {
      setShowChibiBubble(false);
      isTankSpeaking.current = false;
      if (messageQueue.current.length > 0) {
        const next = messageQueue.current.shift();
        showTankMessage(next);
      }
    }, 8000);
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
    <div className="h-screen bg-gray-950 text-white p-1 overflow-y-auto tank-target">
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-3 justify-items-center gap-2 px-1 tank-target">
          <div className={showSernPopup ? 'blur-background' : ''}>
            <div
              id="tank-laser"
              className="hidden fixed z-[9999] pointer-events-none transition-all duration-200 tank-target"
            ></div>
            <div className="flex flex-col gap-y-1">
              {[...leftArtifacts].map((item, idx) => (
                <ArtifactCard
                  key={idx}
                  title={item.title}
                  mainStats={item.mainStats}
                  showTankMessage={showTankMessage}
                  recalculateStatsFromArtifacts={recalculateStatsFromArtifacts}
                  artifactData={artifactsData[item.title]}
                  statsWithoutArtefact={statsWithoutArtefact}  // ← AJOUT ICI
                  flatStats={flatStats}
                  hunter={characters[selectedCharacter]}                        // ← UTILE SI BESOIN
                  substatsMinMaxByIncrements={substatsMinMaxByIncrements}  // ✅ C’EST ICI
                  disableComparisonButton={false} // 👈 AJOUT
                  openComparisonPopup={openComparisonPopup}
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

          <div className="flex flex-col justify-end items-center h-full tank-target">
            {/* Filtres + select personnage EN HAUT */}
            <div className="flex flex-wrap items-center justify-between w-full gap-2 px-1 mb-2 tank-target">
              {/* Filtres éléments */}
              <div className="flex flex-row items-center space-x-2 tank-target">
                {['Fire', 'Water', 'Light', 'Dark', 'Wind'].map((el) => {
                  const key = el.toLowerCase();
                  return (
                    <img
                      key={el}
                      src={ICON_ELEMENTS[key]}
                      alt={el}
                      onClick={() => handleElementClick(el)}
                      className={`w-10 h-10 cursor-pointer transition-all duration-300 tank-target 
        ${selectedElement === el ? 'opacity-100 drop-shadow-md' : 'opacity-40'}`}
                    />
                  );
                })}
              </div>

              {/* Select personnage */}
              <div className="flex flex-col items-center tank-target">
                <select
                  value={selectedCharacter}
                  onChange={(e) => {
                    const selected = e.target.value;
                    setSelectedCharacter(selected);

                    const saved = localStorage.getItem(`build_${selected}`);
                    if (saved) {
                      const build = JSON.parse(saved);
                      setFlatStats(build.flatStats);
                      setStatsWithoutArtefact(build.statsWithoutArtefact);
                      setArtifactsData(build.artifactsData);
                      setHunterCores(build.hunterCores);
                      showTankMessage(`Loaded saved build for ${selected} 😏`);
                    } else {
                      handleResetStats(); // aucun build → on réinitialise
                      // showTankMessage(`${selected} has no saved build, starting fresh 🧹`);
                    }
                  }}
                  className="p-1 rounded bg-[#1c1c3c] text-white text-sm mb-2 tank-target"
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

              {/* Filtres classes */}
              <div className="flex flex-row items-center space-x-2 tank-target">
                {['Tank', 'DPS', 'Support'].map((type) => {
                  const key = type.toLowerCase();
                  return (
                    <img
                      key={type}
                      src={ICON_CLASSES[key]}
                      alt={type}
                      onClick={() => handleClassClick(type)}
                      className={`w-10 h-10 cursor-pointer tank-target transition-all duration-300 
        ${selectedClass === type ? 'opacity-100 drop-shadow-md' : 'opacity-40'}`}
                    />
                  );
                })}
              </div>
            </div>

            <div className="w-full flex justify-between tank-target mt-0 gap-2 text-sm">
              {/* Bouton BobbyKick - Reset */}
              <div className="flex items-center space-x-2 tank-target">
                <button onClick={() => i18n.changeLanguage('fr')}>FR</button>
                <button onClick={() => i18n.changeLanguage('en')}>EN</button>
                <button
                  onClick={handleResetStats}
                  className="bg-gradient-to-r tank-target from-black-900 to-black-700 hover:from-black-700 hover:to-black-500 text-white font-bold py-1 px-4 rounded-xl shadow-md transform transition-transform duration-200 hover:scale-105 hover:shadow-red-500/40"
                >
                  BobbyKick
                </button>

                {/* Bouton Save */}
                <button
                  onClick={handleSaveBuild}
                  className="bg-gradient-to-r tank-target from-emerald-800 to-green-600 hover:from-green-600 hover:to-green-400 text-white font-bold py-1 px-4 rounded-xl shadow-md transform transition-transform duration-200 hover:scale-105 hover:shadow-green-400/40"
                >
                  Save
                </button>
              </div>

              <div className="w-full tank-target flex justify-between items-center mt-0 text-sm">
                {/* Espace à droite (ex : icône future) */}

                <div id="buildIcons" className="flex tank-target gap-2 items-center">
                  {recentBuilds.length > 0 && recentBuilds.map((charKey) => (
                    <img
                      key={charKey}
                      src={characters[charKey]?.icon || '/default.png'}
                      alt={characters[charKey]?.name || charKey}
                      onClick={() => handleClickBuildIcon(charKey)}
                      className="w-8 h-8 rounded-full tank-targe cursor-pointer border-2 border-purple-700 hover:scale-110 transition"
                    />
                  ))}
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

            {showSernPopup && (
              <div className="fixed inset-0 bg-black bg-opacity-70 flex items-start justify-center z-[9999] overflow-y-auto py-10">
                <div
                  ref={popupRef}
                  className="relative w-[95vw] max-w-[1000px] p-4 bg-black/90 text-white 
        border-4 border-white rounded-2xl shadow-2xl animate-pulse flex flex-col 
        overflow-y-auto max-h-[90vh] scrollbar-none scroll-smooth"
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
    console.log('Parsed envoyé à Builder :', parsed);
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
              <div className="fixed inset-0 bg-black bg-opacity-70 flex items-start justify-center z-[9999] overflow-y-auto py-10">
                <div
                  ref={popupRef}
                  className="relative w-[95vw] max-w-[1000px] p-4 bg-black/90 text-white 
        border-4 border-white rounded-2xl shadow-2xl animate-pulse flex flex-col 
        overflow-y-auto max-h-[90vh] scrollbar-none scroll-smooth"
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
      console.log("CONFIRMED", data); // ➕ à remplacer par le vrai traitement
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


              <div className="flex flex-col items-center justify-start gap-1 mt-auto mb-2">

                <div className="flex justify-start items-start space-x-6 mt-4">
                  {/* Bloc Noyaux à gauche */}
                  <div className="w-60 text-white text-[11px] flex flex-col justify-start">
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
                  <div className="w-48 text-white text-xs flex flex-col items-start">
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
                <div className="w-full mt-2 tank-targe">
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
                              const base = typeof statsWithoutArtefact[key] === 'number' ? statsWithoutArtefact[key] : 0;
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

          <div className="flex flex-col gap-y-1">
            {[...rightArtifacts].map((item, idx) => (
              <ArtifactCard
                key={idx}
                title={item.title}
                mainStats={item.mainStats}
                showTankMessage={showTankMessage}
                recalculateStatsFromArtifacts={recalculateStatsFromArtifacts}
                artifactData={artifactsData[item.title]}
                statsWithoutArtefact={statsWithoutArtefact}  // ← AJOUT ICI
                flatStats={flatStats}                        // ← UTILE SI BESOIN
                hunter={characters[selectedCharacter]}                        // ← UTILE SI BESOIN
                substatsMinMaxByIncrements={substatsMinMaxByIncrements}  // ✅ C’EST ICI
                disableComparisonButton={false} // 👈 AJOUT
                openComparisonPopup={openComparisonPopup}
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
          <div className="flex justify-center items-center overflow-x-auto relative">
            <canvas id="canvas-left" width="600" height="240" className="rounded-l-lg shadow-md bg-black" />
            <canvas id="canvas-center" width="600" height="240" className="shadow-md bg-black" />
            <canvas id="canvas-right" width="600" height="240" className="rounded-r-lg shadow-md bg-black" />


            {/* </div> */}
          </div>
        </div>
      </div>
    </div>


  );
};



export default BuilderBeru;