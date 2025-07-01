// ComparisonHunter.jsx - 🆚 COMPARAISON FUTURISTE BERUVIAN WORLD x BUILDERBERU
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { BUILDER_DATA } from '../data/builder_data.js';

// 🔧 STATS DE BASE DES PERSONNAGES - COPIÉ DEPUIS BuilderBeru.jsx
const characterStats = {
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

// 🔧 VALEURS MAX DES MAIN STATS PAR NIVEAU
const mainStatMaxByIncrements = {
  'Additional Defense': { 0: 2433, 1: 2433, 2: 2433, 3: 2433, 4: 2433 },
  'Defense %': { 0: 25.55, 1: 25.55, 2: 25.55, 3: 25.55, 4: 25.55 },
  'Additional Attack': { 0: 2433, 1: 2433, 2: 2433, 3: 2433, 4: 2433 },
  'Attack %': { 0: 25.55, 1: 25.55, 2: 25.55, 3: 25.55, 4: 25.55 },
  'Additional HP': { 0: 4866, 1: 4866, 2: 4866, 3: 4866, 4: 4866 },
  'HP %': { 0: 25.55, 1: 25.55, 2: 25.55, 3: 25.55, 4: 25.55 },
  'Critical Hit Damage': { 0: 5899, 1: 5899, 2: 5899, 3: 5899, 4: 5899 },
  'Defense Penetration': { 0: 4741, 1: 4741, 2: 4741, 3: 4741, 4: 4741 },
  'Healing Given Increase (%)': { 0: 6.12, 1: 6.12, 2: 6.12, 3: 6.12, 4: 6.12 },
  'MP Consumption Reduction': { 0: 30, 1: 30, 2: 30, 3: 30, 4: 30 },
  'Additional MP': { 0: 1044, 1: 1044, 2: 1044, 3: 1044, 4: 1044 },
  'MP Recovery Rate Increase (%)': { 0: 30, 1: 30, 2: 30, 3: 30, 4: 30 },
  'Damage Increase': { 0: 5799, 1: 5799, 2: 5799, 3: 5799, 4: 5799 },
  'Damage Reduction': { 0: 24, 1: 24, 2: 24, 3: 24, 4: 24 },
  'Fire Damage %': { 0: 13.82, 1: 13.82, 2: 13.82, 3: 13.82, 4: 13.82 },
  'Water Damage %': { 0: 13.82, 1: 13.82, 2: 13.82, 3: 13.82, 4: 13.82 },
  'Wind Damage %': { 0: 13.82, 1: 13.82, 2: 13.82, 3: 13.82, 4: 13.82 },
  'Light Damage %': { 0: 13.82, 1: 13.82, 2: 13.82, 3: 13.82, 4: 13.82 },
  'Dark Damage %': { 0: 13.82, 1: 13.82, 2: 13.82, 3: 13.82, 4: 13.82 }
};

// 🔧 CALCUL DES STATS FROM ARTIFACTS SEULEMENT
const calculateStatsFromArtifactsOnly = (artifactsData, flatStats) => {
  const stats = {
    Attack: 0,
    Defense: 0,
    HP: 0,
    'Critical Hit Rate': 0,
    'Critical Hit Damage': 0,
    'Defense Penetration': 0,
    'Damage Increase': 0,
    'Healing Given Increase (%)': 0,
    'Damage Reduction': 0,
    'MP Recovery Rate Increase (%)': 0,
    'MP Consumption Reduction': 0,
    'Additional MP': 0,
    MP: 0,
    Precision: 0
  };
  
  Object.values(artifactsData || {}).forEach(artifact => {
    if (!artifact) return;
    
    // Main stat
    if (artifact.mainStat && mainStatMaxByIncrements[artifact.mainStat]) {
      const value = mainStatMaxByIncrements[artifact.mainStat][4] || 0;
      const stat = artifact.mainStat;
      
      if (stat.endsWith('%')) {
        const baseStat = stat.replace(' %', '');
        const base = flatStats[baseStat] || 0;
        stats[baseStat] += (base * value / 100);
      } else if (stat.startsWith('Additional ')) {
        const baseStat = stat.replace('Additional ', '');
        stats[baseStat] += value;
      } else {
        stats[stat] = (stats[stat] || 0) + value;
      }
    }
    
    // Substats
    if (artifact.subStats && artifact.subStatsLevels) {
      artifact.subStats.forEach((subStat, i) => {
        const levelInfo = artifact.subStatsLevels[i];
        if (!subStat || !levelInfo || typeof levelInfo.value !== 'number') return;
        
        if (subStat.endsWith('%')) {
          const baseStat = subStat.replace(' %', '');
          const base = flatStats[baseStat] || 0;
          stats[baseStat] += (base * levelInfo.value / 100);
        } else if (subStat.startsWith('Additional ')) {
          const baseStat = subStat.replace('Additional ', '');
          stats[baseStat] += levelInfo.value;
        } else {
          stats[subStat] = (stats[subStat] || 0) + levelInfo.value;
        }
      });
    }
  });
  
  // Arrondir
  Object.keys(stats).forEach(key => {
    stats[key] = Math.floor(stats[key]);
  });
  
  return stats;
};

// 🔧 CALCUL DES STATS FINALES CORRIGÉ
const calculateFinalStats = (hunterData, character) => {
  if (!hunterData || !character) return {};
  
  const charStats = characterStats[character];
  if (!charStats) return {};
  
  const builderInfo = BUILDER_DATA[character];
  const scaleStat = builderInfo?.scaleStat || 'Attack';
  
  const {
    artifactsData = {},
    currentCores = {},
    currentGems = {},
    currentWeapon = {}
  } = hunterData;
  
  // 1️⃣ FLAT STATS = BASE + ARME
  const flatStats = {
    'Attack': charStats.attack || 0,
    'Defense': charStats.defense || 0,
    'HP': charStats.hp || 0,
    'MP': charStats.mp || 0,
    'Critical Hit Rate': charStats.critRate || 0,
    'Critical Hit Damage': 0,
    'Defense Penetration': 0,
    'Damage Increase': 0,
    'Healing Given Increase (%)': 0,
    'Damage Reduction': 0,
    'MP Recovery Rate Increase (%)': 0,
    'MP Consumption Reduction': 0,
    'Precision': currentWeapon.precision || 0
  };
  
  // Ajouter l'arme
  const weaponBoost = currentWeapon.mainStat || 0;
  if (scaleStat === 'Attack') flatStats.Attack += weaponBoost;
  else if (scaleStat === 'Defense') flatStats.Defense += weaponBoost;
  else if (scaleStat === 'HP') flatStats.HP += weaponBoost;
  
  // 2️⃣ CALCULER statsWithoutArtefact
  let statsWithoutArtefact = { ...flatStats };
  
  // GEMS - Flat d'abord
  Object.values(currentGems || {}).forEach(gemCategory => {
    Object.entries(gemCategory || {}).forEach(([stat, value]) => {
      if (!stat || !value) return;
      
      if (stat.startsWith('Additional ')) {
        const baseStat = stat.replace('Additional ', '');
        statsWithoutArtefact[baseStat] += value;
      } else if (!stat.endsWith('%')) {
        statsWithoutArtefact[stat] = (statsWithoutArtefact[stat] || 0) + value;
      }
    });
  });
  
  // CORES - Flat d'abord
  ['Offensif', 'Défensif', 'Endurance'].forEach(type => {
    const core = currentCores[type];
    if (!core) return;
    
    [core.primary, core.secondary].forEach((stat, idx) => {
      const value = idx === 0 ? core.primaryValue : core.secondaryValue;
      if (!stat || !value) return;
      
      const numValue = parseFloat(value);
      
      if (stat.startsWith('Additional ')) {
        const baseStat = stat.replace('Additional ', '');
        statsWithoutArtefact[baseStat] += numValue;
      } else if (!stat.endsWith('%')) {
        statsWithoutArtefact[stat] = (statsWithoutArtefact[stat] || 0) + numValue;
      }
    });
  });
  
  // GEMS - % sur FLATSTATS
  Object.values(currentGems || {}).forEach(gemCategory => {
    Object.entries(gemCategory || {}).forEach(([stat, value]) => {
      if (!stat || !value || !stat.endsWith('%')) return;
      
      const baseStat = stat.replace(' %', '');
      const base = flatStats[baseStat] || 0;
      statsWithoutArtefact[baseStat] += (base * value / 100);
    });
  });
  
  // CORES - % sur FLATSTATS
  ['Offensif', 'Défensif', 'Endurance'].forEach(type => {
    const core = currentCores[type];
    if (!core) return;
    
    [core.primary, core.secondary].forEach((stat, idx) => {
      const value = idx === 0 ? core.primaryValue : core.secondaryValue;
      if (!stat || !value || !stat.endsWith('%')) return;
      
      const baseStat = stat.replace(' %', '');
      const base = flatStats[baseStat] || 0;
      statsWithoutArtefact[baseStat] += (base * parseFloat(value) / 100);
    });
  });
  
  // 3️⃣ AJOUTER LES ARTEFACTS
  let finalStats = { ...statsWithoutArtefact };
  
  Object.values(artifactsData || {}).forEach(artifact => {
    if (!artifact) return;
    
    // Main stat
    if (artifact.mainStat && mainStatMaxByIncrements[artifact.mainStat]) {
      const value = mainStatMaxByIncrements[artifact.mainStat][4] || 0;
      const stat = artifact.mainStat;
      
      if (stat.endsWith('%')) {
        const baseStat = stat.replace(' %', '');
        const base = flatStats[baseStat] || 0;
        finalStats[baseStat] += (base * value / 100);
      } else if (stat.startsWith('Additional ')) {
        const baseStat = stat.replace('Additional ', '');
        finalStats[baseStat] += value;
      } else {
        finalStats[stat] = (finalStats[stat] || 0) + value;
      }
    }
    
    // Substats
    if (artifact.subStats && artifact.subStatsLevels) {
      artifact.subStats.forEach((subStat, i) => {
        const levelInfo = artifact.subStatsLevels[i];
        if (!subStat || !levelInfo || typeof levelInfo.value !== 'number') return;
        
        if (subStat.endsWith('%')) {
          const baseStat = subStat.replace(' %', '');
          const base = flatStats[baseStat] || 0;
          finalStats[baseStat] += (base * levelInfo.value / 100);
        } else if (subStat.startsWith('Additional ')) {
          const baseStat = subStat.replace('Additional ', '');
          finalStats[baseStat] += levelInfo.value;
        } else {
          finalStats[subStat] = (finalStats[subStat] || 0) + levelInfo.value;
        }
      });
    }
  });
  
  // 4️⃣ ARRONDIR
  const result = {};
  Object.keys(finalStats).forEach(stat => {
    result[stat] = Math.floor(finalStats[stat] || 0);
  });
  
  return { finalStats: result, flatStats };
};

// 🔧 FONCTION D'EXTRACTION INTELLIGENTE DES DONNÉES LOCALSTORAGE
const extractHunterFromLocalStorage = (hunterName, accountName = null) => {
  try {
    const data = JSON.parse(localStorage.getItem("builderberu_users"));
    if (!data) {
      console.error('❌ Pas de données builderberu_users dans localStorage');
      return null;
    }
    
    const targetAccount = accountName || data.user?.activeAccount || 'main';
    const hunterData = data.user?.accounts?.[targetAccount]?.builds?.[hunterName];
    
    if (!hunterData) {
      console.warn(`Hunter "${hunterName}" not found in account "${targetAccount}"`);
      return null;
    }
    
    // 🔥 FIX: Récupérer l'arme correctement
    const accountWeapon = data.user?.accounts?.[targetAccount]?.hunterWeapons?.[hunterName] || {};
    
    // 🔥 SI PAS D'ARME, CRÉER UNE ARME PAR DÉFAUT
    let weapon = accountWeapon;
    if (!weapon.mainStat) {
      const builderInfo = BUILDER_DATA[hunterName];
      const scaleStat = builderInfo?.scaleStat || 'Attack';
      
      weapon = {
        mainStat: scaleStat === 'HP' ? 6120 : 3080,
        precision: 4000
      };
      
      console.log('⚠️ Arme par défaut créée:', weapon);
    }
    
    const result = {
      statsWithoutArtefact: hunterData.statsWithoutArtefact || {},
      artifactsData: hunterData.artifactsData || {},
      flatStats: hunterData.flatStats || {},
      currentCores: data.user?.accounts?.[targetAccount]?.hunterCores?.[hunterName] || {},
      currentGems: data.user?.accounts?.[targetAccount]?.gems || {},
      currentWeapon: weapon, // 🔥 ARME GARANTIE
      accountName: targetAccount,
      characterName: hunterName
    };
    
    console.log('✅ Hunter extrait avec arme:', {
      weapon: result.currentWeapon,
      cores: result.currentCores,
      gems: result.currentGems
    });
    
    return result;
  } catch (error) {
    console.error('Error extracting hunter data:', error);
    return null;
  }
};

// 🔧 FONCTION POUR OBTENIR LE CHARACTER DU HUNTER RÉFÉRENCE
const getCharacterFromHunter = (referenceHunter) => {
  return referenceHunter.character || referenceHunter.characterName || 'Hunter';
};

// 🧮 CALCUL CP AVANCÉ KAISEL
const calculateAdvancedCP = (stats, selectedCharacter, returnDetails = false, setBonus = false) => {
  if (!stats || !selectedCharacter) return returnDetails ? { total: 0, details: [] } : 0;
  
  const builderInfo = BUILDER_DATA[selectedCharacter];
  if (!builderInfo) return returnDetails ? { total: 0, details: [] } : 0;
  
  const scaleStat = builderInfo.scaleStat;
  let totalCP = 0;
  const details = [];
  
  const mainStatValue = scaleStat === "Attack" ? (stats.Attack || 0) : 
                       scaleStat === "Defense" ? (stats.Defense || 0) : 
                       scaleStat === "HP" ? (stats.HP || 0) : 0;
  const mainStatCP = mainStatValue * 2.5;
  totalCP += mainStatCP;
  details.push({
    name: `${scaleStat} (Scale Stat)`,
    value: Math.round(mainStatValue),
    multiplier: 2.5,
    points: Math.round(mainStatCP),
    color: scaleStat === "Attack" ? "#ef4444" : scaleStat === "Defense" ? "#3b82f6" : "#22c55e"
  });
  
  const damageIncrease = stats["Damage Increase"] || 0;
  const damageIncreaseCP = damageIncrease * 1.5;
  totalCP += damageIncreaseCP;
  details.push({
    name: "Damage Increase",
    value: Math.round(damageIncrease),
    multiplier: 1.5,
    points: Math.round(damageIncreaseCP),
    color: "#a855f7"
  });
  
  const critDamage = stats["Critical Hit Damage"] || 0;
  const critDamageCP = critDamage * 1.3;
  totalCP += critDamageCP;
  details.push({
    name: "Critical Hit Damage",
    value: Math.round(critDamage),
    multiplier: 1.3,
    points: Math.round(critDamageCP),
    color: "#f97316"
  });
  
  const defPen = stats["Defense Penetration"] || 0;
  const defPenCP = defPen * 1.2;
  totalCP += defPenCP;
  details.push({
    name: "Defense Penetration",
    value: Math.round(defPen),
    multiplier: 1.2,
    points: Math.round(defPenCP),
    color: "#ec4899"
  });
  
  const critRate = stats["Critical Hit Rate"] || 0;
  let critRateCP = 0;
  let critRateMultiplier = "Complex";
  
  if (critRate <= 8000) {
    critRateCP = critRate * 1.0;
    critRateMultiplier = "1.0 (≤8k)";
  } else if (critRate <= 12000) {
    critRateCP = 8000 * 1.0 + (critRate - 8000) * 0.8;
    critRateMultiplier = "1.0 + 0.8 (8k-12k)";
  } else {
    critRateCP = 8000 * 1.0 + 4000 * 0.8;
    critRateMultiplier = "Capped at 12k";
  }
  
  totalCP += critRateCP;
  details.push({
    name: "Critical Hit Rate",
    value: Math.round(critRate),
    multiplier: critRateMultiplier,
    points: Math.round(critRateCP),
    color: "#eab308"
  });
  
  if (setBonus) {
    const bonus = totalCP * 0.05;
    totalCP += bonus;
    details.push({
      name: "Set Optimal Bonus",
      value: "Perfect",
      multiplier: "+5%",
      points: Math.round(bonus),
      color: "#10b981"
    });
  }
  
  if (returnDetails) {
    return {
      total: Math.round(totalCP),
      details: details
    };
  }
  
  return Math.round(totalCP);
};

// 🎯 ANALYSER SETS D'ARTEFACTS
const analyzeArtifactSets = (artifacts) => {
  if (!artifacts) return { equipped: {}, analysis: "", isOptimal: false };
  
  const equippedSets = {};
  
  Object.values(artifacts).forEach(artifact => {
    if (artifact.set && artifact.set !== "") {
      equippedSets[artifact.set] = (equippedSets[artifact.set] || 0) + 1;
    }
  });
  
  return { 
    equipped: equippedSets, 
    analysis: Object.entries(equippedSets).map(([name, count]) => `${name} (${count})`).join(', ') || "Aucun set",
    isOptimal: false
  };
};

const ComparisonHunter = ({
  isOpen,
  onClose,
  referenceHunter,
  showTankMessage
}) => {
  const { t } = useTranslation();
  const [animationPhase, setAnimationPhase] = useState(0);
  const [glitchEffect, setGlitchEffect] = useState(false);
  const [localHunterData, setLocalHunterData] = useState(null);
  const [currentFinalStats, setCurrentFinalStats] = useState({});
  const [currentStatsFromArtifacts, setCurrentStatsFromArtifacts] = useState({});
  const [currentFlatStats, setCurrentFlatStats] = useState({});
  const canvasRef = useRef(null);
  
  // 🆕 NOUVEAU STATE POUR LE MODE DE COMPARAISON
  const [comparisonMode, setComparisonMode] = useState('final'); // 'final' ou 'artifacts'
  const [hoveredArtifact, setHoveredArtifact] = useState(null);
  
  const isMobileDevice = window.innerWidth < 768;

  useEffect(() => {
    if (isOpen) {
      console.log('🔍 Extraction automatique du hunter actif...');
      console.log('🎯 Hunter référence (Hall of Flame):', referenceHunter.character);
      
      const characterToFind = getCharacterFromHunter(referenceHunter);
      console.log('🔎 Recherche du character:', characterToFind);
      
      const extractedData = extractHunterFromLocalStorage(characterToFind);
      
      if (extractedData) {
        setLocalHunterData(extractedData);
        
        // 🔥 CALCUL DES STATS FINALES ET STATS FROM ARTIFACTS
        const calcResult = calculateFinalStats(extractedData, characterToFind);
        setCurrentFinalStats(calcResult.finalStats);
        setCurrentFlatStats(calcResult.flatStats);
        
        // Calculer les stats from artifacts
        const artifactStats = calculateStatsFromArtifactsOnly(extractedData.artifactsData, calcResult.flatStats);
        setCurrentStatsFromArtifacts(artifactStats);
        
        console.log('✅ Hunter extrait avec stats finales:', {
          character: characterToFind,
          finalStats: calcResult.finalStats,
          artifactStats
        });
        
        if (showTankMessage) {
          showTankMessage(`✅ ${characterToFind} chargé pour comparaison`, true, 'kaisel');
        }
      } else {
        console.error('❌ Extraction échouée pour:', characterToFind);
        setLocalHunterData({
          statsWithoutArtefact: {},
          artifactsData: {},
          flatStats: {},
          currentCores: {},
          currentGems: {},
          currentWeapon: {},
          accountName: 'unknown',
          character: characterToFind
        });
        setCurrentFinalStats({});
        setCurrentStatsFromArtifacts({});
        if (showTankMessage) {
          showTankMessage(`⚠️ ${characterToFind} non trouvé dans votre compte actif`, true, 'kaisel');
        }
      }
    }
  }, [isOpen, referenceHunter, showTankMessage]);

  const currentStats = localHunterData?.statsWithoutArtefact || {};
  const currentArtifacts = localHunterData?.artifactsData || {};
  const statsFromArtifacts = localHunterData?.flatStats || {};
  const currentCores = localHunterData?.currentCores || {};
  const currentGems = localHunterData?.currentGems || {};
  const currentWeapon = localHunterData?.currentWeapon || {};

  useEffect(() => {
    if (isOpen) {
      setAnimationPhase(0);
      const timers = [];
      
      timers.push(setTimeout(() => {
        setGlitchEffect(true);
      }, 100));
      
      timers.push(setTimeout(() => {
        setGlitchEffect(false);
        setAnimationPhase(1);
      }, 300));
      
      timers.push(setTimeout(() => {
        setAnimationPhase(2);
      }, 600));
      
      return () => timers.forEach(timer => clearTimeout(timer));
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let particles = [];
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
    
    let animationId;
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 85, 247, ${particle.opacity})`;
        ctx.fill();
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => cancelAnimationFrame(animationId);
  }, [isOpen]);

  if (!isOpen) return null;

  const calculateStatDiff = (refStat, currentStat) => {
    const diff = (currentStat || 0) - (refStat || 0);
    const percentage = refStat > 0 ? ((diff / refStat) * 100).toFixed(1) : 0;
    return { diff, percentage };
  };

  const referenceSetAnalysis = analyzeArtifactSets(referenceHunter.currentArtifacts);
  const currentSetAnalysis = analyzeArtifactSets(currentArtifacts);
  
  // Déterminer quelles stats utiliser selon le mode
  const referenceStatsToUse = comparisonMode === 'final' 
    ? referenceHunter.currentStats 
    : referenceHunter.statsFromArtifacts;
    
  const currentStatsToUse = comparisonMode === 'final' 
    ? currentFinalStats 
    : currentStatsFromArtifacts;
  
  const referenceCP = comparisonMode === 'final'
    ? calculateAdvancedCP(referenceHunter.currentStats || {}, referenceHunter.character, false, referenceSetAnalysis.isOptimal)
    : calculateAdvancedCP(referenceHunter.statsFromArtifacts || {}, referenceHunter.character, false, referenceSetAnalysis.isOptimal);
    
  const currentCP = comparisonMode === 'final'
    ? calculateAdvancedCP(currentFinalStats, localHunterData?.character || referenceHunter.character, false, currentSetAnalysis.isOptimal)
    : calculateAdvancedCP(currentStatsFromArtifacts, localHunterData?.character || referenceHunter.character, false, currentSetAnalysis.isOptimal);
  
  const statsToCompare = ['Attack', 'Defense', 'HP', 'Critical Hit Rate', 'Critical Hit Damage', 'Damage Increase', 'Defense Penetration'];

  const determineWinner = () => {
    const cpDiff = currentCP - referenceCP;
    const winChance = 50 + (cpDiff / Math.max(referenceCP, 1) * 50);
    return {
      winner: cpDiff > 0 ? 'current' : 'reference',
      winChance: Math.max(0, Math.min(100, winChance)),
      cpDiff
    };
  };

  const battleResult = determineWinner();

  // 🔧 FONCTION POUR COMPARER LES ARTEFACTS
  const compareArtifacts = (slot) => {
    const refArtifact = referenceHunter.currentArtifacts?.[slot];
    const curArtifact = currentArtifacts[slot];
    
    if (!refArtifact || !curArtifact) return null;
    
    const comparison = {
      slot,
      mainStatMatch: refArtifact.mainStat === curArtifact.mainStat,
      refMainStat: refArtifact.mainStat,
      curMainStat: curArtifact.mainStat,
      refSet: refArtifact.set || 'No Set',
      curSet: curArtifact.set || 'No Set',
      subStats: []
    };
    
    // Comparer les substats
    if (refArtifact.subStats && curArtifact.subStats) {
      // Créer une map des substats pour comparaison
      const refSubMap = {};
      const curSubMap = {};
      
      refArtifact.subStats.forEach((stat, i) => {
        if (stat && refArtifact.subStatsLevels?.[i]) {
          refSubMap[stat] = refArtifact.subStatsLevels[i].value || 0;
        }
      });
      
      curArtifact.subStats.forEach((stat, i) => {
        if (stat && curArtifact.subStatsLevels?.[i]) {
          curSubMap[stat] = curArtifact.subStatsLevels[i].value || 0;
        }
      });
      
      // Comparer toutes les substats
      const allSubStats = new Set([...Object.keys(refSubMap), ...Object.keys(curSubMap)]);
      
      allSubStats.forEach(stat => {
        comparison.subStats.push({
          stat,
          refValue: refSubMap[stat] || 0,
          curValue: curSubMap[stat] || 0,
          diff: (curSubMap[stat] || 0) - (refSubMap[stat] || 0)
        });
      });
    }
    
    return comparison;
  };

  return ReactDOM.createPortal(
    <>
      <style jsx>{`
        @keyframes glitch {
          0% { transform: translate(0); filter: hue-rotate(0deg); }
          20% { transform: translate(-2px, 2px); filter: hue-rotate(90deg); }
          40% { transform: translate(-2px, -2px); filter: hue-rotate(180deg); }
          60% { transform: translate(2px, 2px); filter: hue-rotate(270deg); }
          80% { transform: translate(2px, -2px); filter: hue-rotate(360deg); }
          100% { transform: translate(0); filter: hue-rotate(0deg); }
        }

        @keyframes hologram {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }

        @keyframes scan-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }

        @keyframes power-up {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }

        .comparison-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .comparison-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .comparison-container {
          position: relative;
          width: 100%;
          max-width: 1400px;
          max-height: 90vh;
          background: linear-gradient(135deg, 
            rgba(10, 10, 25, 0.98) 0%, 
            rgba(25, 15, 35, 0.98) 50%, 
            rgba(15, 5, 20, 0.98) 100%);
          border: 2px solid rgba(168, 85, 247, 0.8);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 
            0 0 50px rgba(168, 85, 247, 0.5),
            inset 0 0 50px rgba(168, 85, 247, 0.1);
        }

        .glitch-effect {
          animation: glitch 0.3s infinite;
        }

        .hologram-effect {
          position: relative;
          animation: hologram 2s ease-in-out infinite;
        }

        .hologram-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: rgba(168, 85, 247, 0.8);
          animation: scan-line 3s linear infinite;
        }

        .vs-badge {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, 
            rgba(168, 85, 247, 1) 0%, 
            rgba(168, 85, 247, 0.5) 50%, 
            transparent 70%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: bold;
          color: white;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
          animation: power-up 0.6s ease-out;
          z-index: 10;
        }

        .hunter-side {
          flex: 1;
          padding: 2rem;
          position: relative;
          overflow-y: auto;
          max-height: 85vh;
          scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
        }

        .hunter-side::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

        .hunter-side.reference {
          border-right: 1px solid rgba(168, 85, 247, 0.3);
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(255, 100, 100, 0.05) 100%);
        }

        .hunter-side.current {
          background: linear-gradient(90deg, 
            rgba(100, 255, 100, 0.05) 0%, 
            transparent 100%);
        }

        .stat-bar {
          position: relative;
          height: 24px;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(168, 85, 247, 0.3);
          border-radius: 12px;
          overflow: hidden;
          margin: 0.5rem 0;
        }

        .stat-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--bar-color) 0%, var(--bar-color-light) 100%);
          transition: width 0.6s ease-out;
          position: relative;
          overflow: hidden;
        }

        .stat-bar-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(255, 255, 255, 0.3) 50%, 
            transparent 100%);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 200%; }
        }

        .diff-indicator {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.75rem;
          font-weight: bold;
          padding: 2px 8px;
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.7);
        }

        .diff-positive {
          color: #22c55e;
          border: 1px solid #22c55e;
        }

        .diff-negative {
          color: #ef4444;
          border: 1px solid #ef4444;
        }

        .battle-prediction {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.3); /* Plus transparent */
  border: 2px solid rgba(168, 85, 247, 0.3); /* Bordure plus transparente */
  border-radius: 16px;
  padding: 1rem 2rem;
  text-align: center;
  z-index: 20;
  opacity: 0.3; /* Opacité globale réduite */
  transition: all 0.3s ease; /* Animation smooth */
  cursor: pointer;
}

.battle-prediction:hover {
  opacity: 1; /* Full opacité au hover */
  background: rgba(0, 0, 0, 0.9); /* Background plus opaque */
  border-color: rgba(168, 85, 247, 0.8); /* Bordure plus visible */
  box-shadow: 0 0 30px rgba(168, 85, 247, 0.5); /* Effet glow */
  transform: translateX(-50%) scale(1.05); /* Légère augmentation de taille */
}

        .winner-glow {
          box-shadow: 
            0 0 30px var(--winner-color),
            inset 0 0 30px rgba(var(--winner-rgb), 0.1);
          border-color: var(--winner-color) !important;
        }

        .cyber-grid {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(rgba(168, 85, 247, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 85, 247, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
        }

        .loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          font-size: 1.5rem;
          color: #a855f7;
        }

        .mode-toggle {
          position: absolute;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid #a855f7;
          border-radius: 30px;
          padding: 4px;
          display: flex;
          gap: 4px;
        }

        .toggle-button {
          padding: 8px 20px;
          border: none;
          background: transparent;
          color: #a855f7;
          cursor: pointer;
          border-radius: 25px;
          transition: all 0.3s;
          font-weight: bold;
          font-size: 0.9rem;
        }

        .toggle-button.active {
          background: #a855f7;
          color: white;
          box-shadow: 0 0 15px #a855f7;
        }

        .artifact-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 20px;
        }

        .artifact-slot {
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(168, 85, 247, 0.3);
          border-radius: 8px;
          padding: 10px;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
        }

        .artifact-slot:hover {
          border-color: #a855f7;
          background: rgba(168, 85, 247, 0.1);
          transform: translateY(-2px);
        }

        .artifact-comparison-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.95);
          border: 2px solid #a855f7;
          border-radius: 8px;
          padding: 15px;
          min-width: 300px;
          z-index: 1000;
          margin-bottom: 10px;
          display: none;
          scrollbar-width: none;
  -ms-overflow-style: none;
        }
  .artifact-comparison-tooltip::-webkit-scrollbar {
  display: none;
}

        .artifact-slot:hover .artifact-comparison-tooltip {
          display: block;
        }

        @media (max-width: 768px) {
          .comparison-container {
            max-width: 100%;
            margin: 0;
            border-radius: 0;
            height: 100vh;
            scrollbar-width: none;
  -ms-overflow-style: none;
          }

  .comparison-container::-webkit-scrollbar {
  display: none;
}
          
          .hunter-side {
            padding: 1rem;
          }
          
          .vs-badge {
            width: 60px;
            height: 60px;
            font-size: 1.5rem;
          }
          
          .mode-toggle {
            top: 10px;
            padding: 2px;
          }
          
          .toggle-button {
            padding: 6px 12px;
            font-size: 0.75rem;
          }
          
          .artifact-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="comparison-overlay">
        <canvas ref={canvasRef} className="comparison-canvas" />
        
        <div className={`comparison-container ${glitchEffect ? 'glitch-effect' : ''} ${
          animationPhase >= 1 ? 'hologram-effect' : ''
        }`}>
          <div className="cyber-grid" />
          
          {/* 🆕 TOGGLE SWITCH */}
          <div className="mode-toggle">
            <button 
              className={`toggle-button ${comparisonMode === 'final' ? 'active' : ''}`}
              onClick={() => setComparisonMode('final')}
            >
              Stats Finales
            </button>
            <button 
              className={`toggle-button ${comparisonMode === 'artifacts' ? 'active' : ''}`}
              onClick={() => setComparisonMode('artifacts')}
            >
              Stats Artefacts
            </button>
          </div>
          
          {animationPhase >= 2 && (
            <div className="vs-badge">
              VS
            </div>
          )}

          {!localHunterData ? (
            <div className="loading-state">
              <div className="text-center">
                <div className="text-4xl mb-4">⚔️</div>
                <p>Chargement des données du hunter...</p>
                <p className="text-sm text-gray-400 mt-2">
                  Extraction depuis localStorage
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row h-full relative">
              {/* CÔTÉ GAUCHE - RÉFÉRENCE (HALL OF FLAME) */}
              <div className={`hunter-side reference ${
                battleResult.winner === 'reference' ? 'winner-glow' : ''
              }`} style={{
                '--winner-color': '#ef4444',
                '--winner-rgb': '239, 68, 68'
              }}>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-red-400 mb-2">
                    🏆 Hall of Flame
                  </h2>
                  <h3 className="text-xl text-white font-bold">
                    {referenceHunter.pseudo}
                  </h3>
                  <p className="text-gray-400">
                    {referenceHunter.characterName || referenceHunter.character}
                  </p>
                  <div className="mt-3">
                    <span className="text-3xl font-bold text-purple-400">
                      {referenceCP.toLocaleString()} CP
                    </span>
                    <p className="text-sm text-gray-300 mt-1">
                      {comparisonMode === 'final' ? 'CP Total' : 'CP Artefacts'}
                    </p>
                  </div>
                </div>

                {/* STATS RÉFÉRENCE */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-purple-400 mb-3">
                    📊 Stats de Combat {comparisonMode === 'artifacts' && '(Artefacts)'}
                  </h4>
                  
                  {statsToCompare.map(stat => {
                    const value = referenceStatsToUse?.[stat] || 0;
                    const maxValue = stat === 'HP' ? 300000 : 
                                    stat.includes('Rate') ? 20000 : 200000;
                    const percentage = (value / maxValue) * 100;
                    
                    return (
                      <div key={stat} className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">{stat}</span>
                          <span className="text-white font-bold">
                            {value.toLocaleString()}
                          </span>
                        </div>
                        <div className="stat-bar">
                          <div 
                            className="stat-bar-fill"
                            style={{
                              width: `${Math.min(percentage, 100)}%`,
                              '--bar-color': '#ef4444',
                              '--bar-color-light': '#f87171'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 🆕 GRILLE D'ARTEFACTS */}
                <div className="mt-6">
                  <h4 className="text-lg font-bold text-blue-400 mb-3">
                    🎨 Artefacts Équipés
                  </h4>
                  <div className="artifact-grid">
                    {['Helmet', 'Chest', 'Gloves', 'Boots', 'Necklace', 'Bracelet', 'Ring', 'Earrings'].map(slot => {
                      const artifact = referenceHunter.currentArtifacts?.[slot];
                      if (!artifact) return null;
                      
                      return (
                        <div 
                          key={slot} 
                          className="artifact-slot"
                          onMouseEnter={() => !isMobileDevice && setHoveredArtifact(slot)}
                          onMouseLeave={() => !isMobileDevice && setHoveredArtifact(null)}
                          onClick={() => isMobileDevice && setHoveredArtifact(hoveredArtifact === slot ? null : slot)}
                        >
                          <div className="text-xs font-bold text-purple-300 mb-1">{slot}</div>
                          <div className="text-xs text-gray-400">{artifact.set || 'No Set'}</div>
                          <div className="text-xs text-white mt-1">{artifact.mainStat}</div>
                          
                          {/* Tooltip de comparaison */}
                          {hoveredArtifact === slot && (
                            <div className="artifact-comparison-tooltip">
                              {(() => {
                                const comp = compareArtifacts(slot);
                                if (!comp) return 'Pas de comparaison disponible';
                                
                                return (
                                  <>
                                    <div className="mb-2">
                                      <div className="text-sm font-bold text-purple-400 mb-1">Main Stat</div>
                                      <div className="flex justify-between text-xs">
                                        <span className="text-red-400">Hall: {comp.refMainStat}</span>
                                        <span className="text-green-400">Vous: {comp.curMainStat}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="mb-2">
                                      <div className="text-sm font-bold text-blue-400 mb-1">Sets</div>
                                      <div className="flex justify-between text-xs">
                                        <span className="text-red-400">{comp.refSet}</span>
                                        <span className="text-green-400">{comp.curSet}</span>
                                      </div>
                                    </div>
                                    
                                    {comp.subStats.length > 0 && (
                                      <div>
                                        <div className="text-sm font-bold text-yellow-400 mb-1">Substats</div>
                                        {comp.subStats.map((sub, idx) => (
                                          <div key={idx} className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-300">{sub.stat}</span>
                                            <span className={sub.diff > 0 ? 'text-green-400' : sub.diff < 0 ? 'text-red-400' : 'text-gray-400'}>
                                              {sub.refValue} → {sub.curValue} ({sub.diff > 0 ? '+' : ''}{sub.diff})
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* CÔTÉ DROIT - HUNTER ACTUEL */}
              <div className={`hunter-side current ${
                battleResult.winner === 'current' ? 'winner-glow' : ''
              }`} style={{
                '--winner-color': '#22c55e',
                '--winner-rgb': '34, 197, 94'
              }}>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-green-400 mb-2">
                    ⚔️ Votre Hunter
                  </h2>
                  <h3 className="text-xl text-white font-bold">
                    {localHunterData?.characterName || 'Hunter'}
                  </h3>
                  <p className="text-gray-400">
                    Compte: {localHunterData?.accountName || 'main'}
                  </p>
                  <div className="mt-3">
                    <span className="text-3xl font-bold text-purple-400">
                      {currentCP.toLocaleString()} CP
                    </span>
                    <p className="text-sm text-gray-300 mt-1">
                      {comparisonMode === 'final' ? 'CP Total' : 'CP Artefacts'}
                    </p>
                    {(() => {
                      const cpDiff = currentCP - referenceCP;
                      return cpDiff !== 0 && (
                        <div className={`text-sm mt-1 ${cpDiff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {cpDiff > 0 ? '+' : ''}{cpDiff.toLocaleString()} CP
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* STATS ACTUELLES AVEC COMPARAISON */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-purple-400 mb-3">
                    📊 Stats de Combat {comparisonMode === 'artifacts' && '(Artefacts)'}
                  </h4>
                  
                  {statsToCompare.map(stat => {
                    const refValue = referenceStatsToUse?.[stat] || 0;
                    const currentValue = currentStatsToUse[stat] || 0;
                    const { diff, percentage } = calculateStatDiff(refValue, currentValue);
                    const maxValue = stat === 'HP' ? 300000 : 
                                    stat.includes('Rate') ? 20000 : 200000;
                    const fillPercentage = (currentValue / maxValue) * 100;
                    
                    return (
                      <div key={stat} className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">{stat}</span>
                          <span className="text-white font-bold">
                            {currentValue.toLocaleString()}
                          </span>
                        </div>
                        <div className="stat-bar">
                          <div 
                            className="stat-bar-fill"
                            style={{
                              width: `${Math.min(fillPercentage, 100)}%`,
                              '--bar-color': diff >= 0 ? '#22c55e' : '#ef4444',
                              '--bar-color-light': diff >= 0 ? '#4ade80' : '#f87171'
                            }}
                          />
                          {diff !== 0 && (
                            <div className={`diff-indicator ${diff > 0 ? 'diff-positive' : 'diff-negative'}`}>
                              {diff > 0 ? '+' : ''}{diff.toLocaleString()} ({percentage}%)
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 🆕 GRILLE D'ARTEFACTS ACTUELLE */}
                <div className="mt-6">
                  <h4 className="text-lg font-bold text-blue-400 mb-3">
                    🎨 Vos Artefacts
                  </h4>
                  <div className="artifact-grid">
                    {['Helmet', 'Chest', 'Gloves', 'Boots', 'Necklace', 'Bracelet', 'Ring', 'Earrings'].map(slot => {
                      const artifact = currentArtifacts[slot];
                      if (!artifact || !artifact.mainStat) return null;
                      
                      return (
                        <div 
                          key={slot} 
                        className="artifact-slot"
                         onMouseEnter={() => !isMobileDevice && setHoveredArtifact(slot)}
                         onMouseLeave={() => !isMobileDevice && setHoveredArtifact(null)}
                         onClick={() => isMobileDevice && setHoveredArtifact(hoveredArtifact === slot ? null : slot)}
                       >
                         <div className="text-xs font-bold text-purple-300 mb-1">{slot}</div>
                         <div className="text-xs text-gray-400">{artifact.set || 'No Set'}</div>
                         <div className="text-xs text-white mt-1">{artifact.mainStat}</div>
                         
                         {/* Tooltip de comparaison */}
                         {hoveredArtifact === slot && (
                           <div className="artifact-comparison-tooltip">
                             {(() => {
                               const comp = compareArtifacts(slot);
                               if (!comp) return 'Pas de comparaison disponible';
                               
                               return (
                                 <>
                                   <div className="mb-2">
                                     <div className="text-sm font-bold text-purple-400 mb-1">Main Stat</div>
                                     <div className="flex justify-between text-xs">
                                       <span className="text-red-400">Hall: {comp.refMainStat}</span>
                                       <span className="text-green-400">Vous: {comp.curMainStat}</span>
                                     </div>
                                     {comp.mainStatMatch ? (
                                       <div className="text-center text-xs text-green-400 mt-1">✓ Match!</div>
                                     ) : (
                                       <div className="text-center text-xs text-red-400 mt-1">✗ Différent</div>
                                     )}
                                   </div>
                                   
                                   <div className="mb-2">
                                     <div className="text-sm font-bold text-blue-400 mb-1">Sets</div>
                                     <div className="flex justify-between text-xs">
                                       <span className="text-red-400">{comp.refSet}</span>
                                       <span className="text-green-400">{comp.curSet}</span>
                                     </div>
                                   </div>
                                   
                                   {comp.subStats.length > 0 && (
                                     <div>
                                       <div className="text-sm font-bold text-yellow-400 mb-1">Substats</div>
                                       {comp.subStats.map((sub, idx) => (
                                         <div key={idx} className="flex justify-between text-xs mb-1">
                                           <span className="text-gray-300">{sub.stat}</span>
                                           <span className={sub.diff > 0 ? 'text-green-400' : sub.diff < 0 ? 'text-red-400' : 'text-gray-400'}>
                                             {sub.refValue} → {sub.curValue} ({sub.diff > 0 ? '+' : ''}{sub.diff})
                                           </span>
                                         </div>
                                       ))}
                                     </div>
                                   )}
                                 </>
                               );
                             })()}
                           </div>
                         )}
                       </div>
                     );
                   })}
                 </div>
               </div>

               {/* INDICATEUR SOURCE DE DONNÉES */}
               {localHunterData && (
                 <div className="mt-4 p-2 bg-purple-900/20 rounded border border-purple-500/30">
                   <p className="text-xs text-purple-300">
                     📦 Données extraites du localStorage
                     <br />
                     🔥 Compte: {localHunterData.accountName}
                     <br />
                     🎯 Mode: {comparisonMode === 'final' ? 'Stats Finales Complètes' : 'Stats Artefacts Uniquement'}
                   </p>
                 </div>
               )}

               {/* SUGGESTIONS D'AMÉLIORATION */}
               <div className="mt-6 p-4 bg-black/30 rounded-lg border border-yellow-500/30">
                 <h4 className="text-yellow-400 font-bold mb-2">
                   💡 Suggestions Kaisel
                 </h4>
                 <ul className="text-sm text-gray-300 space-y-1">
                   {(() => {
                     const suggestions = [];
                     
                     // Analyser les plus grosses différences
                     statsToCompare.forEach(stat => {
                       const refValue = referenceStatsToUse?.[stat] || 0;
                       const currentValue = currentStatsToUse[stat] || 0;
                       const { diff, percentage } = calculateStatDiff(refValue, currentValue);
                       
                       if (percentage < -20) {
                         suggestions.push(`Améliorer ${stat} (+${Math.abs(diff).toLocaleString()} pour égaler)`);
                       }
                     });
                     
                     // Analyser les différences de mainstat
                     let mainStatMismatches = 0;
                     ['Helmet', 'Chest', 'Gloves', 'Boots', 'Necklace', 'Bracelet', 'Ring', 'Earrings'].forEach(slot => {
                       const comp = compareArtifacts(slot);
                       if (comp && !comp.mainStatMatch) {
                         mainStatMismatches++;
                       }
                     });
                     
                     if (mainStatMismatches > 2) {
                       suggestions.push(`${mainStatMismatches} artefacts ont des main stats différentes du Hall of Flame`);
                     }
                     
                     if (referenceHunter.setAnalysis?.isOptimal && !currentSetAnalysis.isOptimal) {
                       suggestions.push('Optimiser vos sets d\'artefacts pour le bonus +5% CP');
                     }
                     
                     if (suggestions.length === 0) {
                       suggestions.push('Votre build est déjà excellent ! 🎉');
                     }
                     
                     return suggestions.slice(0, 3).map((sugg, idx) => (
                       <li key={idx}>• {sugg}</li>
                     ));
                   })()}
                 </ul>
               </div>
             </div>
           </div>
         )}

         {/* 🎮 PRÉDICTION DE COMBAT BERUVIAN WORLD */}
         {animationPhase >= 2 && currentCP > 0 && (
           <div className="battle-prediction">
             <h3 className="text-lg font-bold text-purple-400 mb-2">
               🎮 Simulation Beruvian World ({comparisonMode === 'artifacts' ? 'Artefacts' : 'Total'})
             </h3>
             <div className="flex items-center justify-center gap-4">
               <div className={`text-center ${battleResult.winner === 'reference' ? 'text-red-400' : 'text-gray-400'}`}>
                 <p className="text-sm">{referenceHunter.pseudo}</p>
                 <p className="text-2xl font-bold">
                   {battleResult.winner === 'reference' ? Math.round(battleResult.winChance) : Math.round(100 - battleResult.winChance)}%
                 </p>
               </div>
               <span className="text-purple-400 text-xl">⚔️</span>
               <div className={`text-center ${battleResult.winner === 'current' ? 'text-green-400' : 'text-gray-400'}`}>
                 <p className="text-sm">Vous</p>
                 <p className="text-2xl font-bold">
                   {battleResult.winner === 'current' ? Math.round(battleResult.winChance) : Math.round(100 - battleResult.winChance)}%
                 </p>
               </div>
             </div>
             <p className="text-xs text-gray-400 mt-2">
               Simulation basée sur le CP {comparisonMode === 'artifacts' ? 'des artefacts' : 'total'} et les stats principales
             </p>
           </div>
         )}

         {/* BOUTON FERMER */}
         <button
           onClick={onClose}
           className="absolute top-4 right-4 w-10 h-10 rounded-full bg-red-600/20 hover:bg-red-600/40 text-red-400 flex items-center justify-center transition-all hover:scale-110 z-30"
         >
           ✕
         </button>
       </div>
     </div>
   </>,
   document.body
 );
};

export default ComparisonHunter;