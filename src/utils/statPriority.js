// 📁 /utils/statPriority.js - ENHANCED BY KAISEL 🔥
// Système de notation unifié avec builder_data.js

import { BUILDER_DATA } from '../data/builder_data';

export const MAINSTAT_PRIORITY = {
  Helmet: ['Additional Attack', 'Additional Defense', 'Additional HP'],
  Chest: ['Additional Defense'],
  Gloves: ['Additional Attack'],
  Boots: ['Critical Hit Damage'],
  Necklace: ['Additional HP'],
  Bracelet: {
    Fire: ['Fire Damage %'],
    Water: ['Water Damage %'],
    Wind: ['Wind Damage %'],
    Light: ['Light Damage %'],
    Dark: ['Dark Damage %'],
  },
  Ring: ['Additional Attack', 'Additional Defense', 'Additional HP'],
  Earrings: ['Additional MP']
};

const helmetMainStats = [
  'Additional Defense', 'Defense %', 'Additional Attack', 'Attack %', 'Additional HP', 'HP %'
];
const chestMainStats = ['Additional Defense', 'Defense %'];
const glovesMainStats = ['Additional Attack', 'Attack %'];
const bootsMainStats = ['Defense %', 'HP %', 'Critical Hit Damage', 'Defense Penetration', 'Healing Given Increase (%)'];
const necklaceMainStats = ['Additional HP', 'HP %'];
const braceletMainStats = ['Fire Damage %', 'Water Damage %', 'Wind Damage %', 'Light Damage %', 'Dark Damage %'];
const ringMainStats = ['Additional Attack', 'Additional Defense', 'Attack %', 'Defense %'];
const earringsMainStats = ['Additional MP'];

export const SUBSTAT_PRIORITY = {
  Type1: {
    priority2: ['Critical Hit Rate', 'Damage Increase', 'Defense Penetration']
  },
  Type2: {
    priority2: ['Critical Hit Damage', 'Damage Increase', 'Defense Penetration']
  }
};

export const SUBSTAT_TYPE_MAPPING = {
  Helmet: 'Type1',
  Chest: 'Type1',
  Gloves: 'Type1',
  Boots: 'Type1',
  Necklace: 'Type2',
  Bracelet: 'Type2',
  Ring: 'Type2',
  Earrings: 'Type2'
};

// 🔥 ENHANCED: Récupère les priorités main stats avec builder_data
export function getMainStatPriorities(hunter, artifactType) {
  // 🎯 PRIORITY 1: Utiliser builder_data si hunter existe
  const hunterKey = getHunterKey(hunter);
  if (hunterKey && BUILDER_DATA[hunterKey]) {
    const hunterData = BUILDER_DATA[hunterKey];
    const firstArtifactSet = Object.keys(hunterData.artifactSets)[0];
    
    if (hunterData.artifactSets[firstArtifactSet]?.mainStats) {
      const slotKey = artifactType.toLowerCase();
      const expectedMainStat = hunterData.artifactSets[firstArtifactSet].mainStats[slotKey];
      if (expectedMainStat) {
        return [expectedMainStat]; // Priorité absolue du hunter
      }
    }
  }
  
  // 🔥 FALLBACK: Logique originale
  if (artifactType === 'Bracelet') {
    return MAINSTAT_PRIORITY.Bracelet[hunter.element] || [];
  }
  return MAINSTAT_PRIORITY[artifactType] || [];
}

// 🔥 ENHANCED: Récupère les priorités substats avec builder_data
export function getSubStatPriorities(hunter, artifactType) {
  const typeKey = SUBSTAT_TYPE_MAPPING[artifactType];
  const scale = hunter.scaleStat?.toLowerCase();
  const scalingStats = [
    `${hunter.scaleStat} %`,
    `Additional ${hunter.scaleStat}`
  ];
  
  // 🎯 ENHANCED: Ajouter les priorités du hunter depuis builder_data
  const hunterKey = getHunterKey(hunter);
  let enhancedPriorities = {};
  
  if (hunterKey && BUILDER_DATA[hunterKey]) {
    const hunterData = BUILDER_DATA[hunterKey];
    if (hunterData.optimizationPriority) {
      const topPriorities = hunterData.optimizationPriority
        .slice(0, 3)
        .map(p => p.stat);
      
      enhancedPriorities.hunterSpecific = topPriorities;
    }
  }

  return {
    priority1: scalingStats,
    hunterSpecific: enhancedPriorities.hunterSpecific || [],
    ...SUBSTAT_PRIORITY[typeKey]
  };
}

// 🔥 ENHANCED: Application proc avec logique builder_data
export function applyProcAndUpdateScore(baseScore, hunter, artifactTitle, substat, value, maxValue, global, enrichedSubStats) {
  const subPriorities = getSubStatPriorities(hunter, artifactTitle);
  const ratio = value / maxValue;

  let penalty = 10;
  let recoveryCap = 8;

  // 🎯 ENHANCED LOGIC: Priorités hunter-specific
  if (subPriorities.hunterSpecific?.includes(substat)) {
    penalty = 8; // Moins de pénalité pour stats du hunter
    recoveryCap = 25; // Plus de recovery
  } else if (subPriorities.priority1.includes(substat)) {
    penalty = 10;
    recoveryCap = 20;
  } else if (subPriorities.priority2.includes(substat)) {
    penalty = 18;
    recoveryCap = 16;
  } else {
    penalty = 15; // Plus de pénalité pour stats inutiles
    recoveryCap = 3;
  }

  const statData = enrichedSubStats?.find(s => s.name === substat);
  const procCount = statData?.procOrders?.length || 0;

  // Pondération par nombre de procs
  const procMultiplier = 1 + procCount * 0.1;
  recoveryCap = Math.floor(recoveryCap * procMultiplier);

  let newScore = baseScore - penalty;
  let recovery = Math.floor(ratio * recoveryCap);
  newScore += recovery;

  return newScore;
}

// 🔥 ENHANCED: Scoring unifié avec builder_data
export function getTheoreticalScore(hunter, artifact, substatsMinMaxByIncrements) {
  const { title, mainStat, subStats, subStatsLevels } = artifact;
  
  const MAINSTAT_POOL = {
    Helmet: helmetMainStats,
    Chest: chestMainStats,
    Gloves: glovesMainStats,
    Boots: bootsMainStats,
    Necklace: necklaceMainStats,
    Bracelet: braceletMainStats,
    Ring: ringMainStats,
    Earrings: earringsMainStats
  };
  
  const possibleMainStats = MAINSTAT_POOL[title] || [];

  if (!mainStat || !subStats || subStats.length !== 4) return null;
  if (!mainStat || mainStat === '' || subStats.some(s => s === '')) return null;
  if (!title) return null;

  // 🔥 ENHANCED: Utiliser les priorités enhanced
  const mainPriorities = getMainStatPriorities(hunter, title);
  const subPriorities = getSubStatPriorities(hunter, title);
  const scale = hunter.scaleStat?.toLowerCase();
  const mainIncludesScaling = mainStat.toLowerCase().includes(scale);
  const mainIsPriority = mainPriorities.includes(mainStat);
  const scalingExistsInThisArtifact = possibleMainStats.some(s => s.toLowerCase().includes(scale));

  let score = 0;
  
  const enrichedSubStats = subStats.map((stat, i) => ({
    name: stat,
    ...subStatsLevels[i]
  }));

  // 🎯 ENHANCED MAIN STAT SCORING
  const hunterKey = getHunterKey(hunter);
  let mainStatBonus = 0;
  
  if (hunterKey && BUILDER_DATA[hunterKey]) {
    // Utiliser builder_data pour scoring main stat
    const expectedMainStats = getExpectedMainStatsForSlotEnhanced(BUILDER_DATA[hunterKey], title);
    
    if (expectedMainStats.optimal?.includes(mainStat)) {
      mainStatBonus = 40; // Main stat parfaite selon builder_data
    } else if (expectedMainStats.good?.includes(mainStat)) {
      mainStatBonus = 25; // Main stat acceptable
    } else if (mainIncludesScaling) {
      mainStatBonus = 30; // Scaling stat (toujours bon)
    } else {
      mainStatBonus = 5; // Main stat suboptimale
    }
  } else {
    // Logique fallback originale
    if (!scalingExistsInThisArtifact) {
      mainStatBonus = mainIsPriority ? 10 : 5;
    } else {
      if (mainIsPriority && mainIncludesScaling) {
        mainStatBonus = 40;
      } else if (mainIncludesScaling) {
        mainStatBonus = 30;
      } else {
        mainStatBonus = 1;
      }
    }
  }
  
  score += mainStatBonus;

  // 🎯 ENHANCED SUBSTAT SCORING
  enrichedSubStats.forEach(({ name, value, procOrders = [], level = 0 }) => {
    const isScalingStat = name.toLowerCase().includes(scale);
    const isPriority1 = subPriorities.priority1.includes(name);
    const isPriority2 = subPriorities.priority2?.includes(name);
    const isHunterSpecific = subPriorities.hunterSpecific?.includes(name);

    let base = 0;
    let bonusPerProc = 0;

    // 🔥 ENHANCED LOGIC avec hunter-specific
    if (isHunterSpecific) {
      base = 25; // Bonus max pour stats du hunter
      bonusPerProc = 8;
    } else if (isPriority1 && isScalingStat) {
      base = scalingExistsInThisArtifact ? 20 : 23;
      bonusPerProc = 6;
    } else if (isPriority2) {
      base = scalingExistsInThisArtifact ? 10 : 15;
      bonusPerProc = scalingExistsInThisArtifact ? 0 : 3;
    } else {
      base = 4;
      bonusPerProc = -10; // Malus pour stats inutiles
    }

    const procCount = procOrders.length || level || 0;
    const adjustedScore = base + procCount * bonusPerProc;
    score += adjustedScore;
  });

  // 🎯 ENHANCED ROLL QUALITY ANALYSIS
  if (subStatsLevels && subStatsLevels.length === 4 && substatsMinMaxByIncrements) {
    subStats.forEach((stat, i) => {
      const data = subStatsLevels[i];
      if (!data || !Array.isArray(data.procOrders) || !Array.isArray(data.procValues)) return;

      const steps = data.procOrders;
      if (Array.isArray(steps) && steps.length > 0) {
        const totalMax = steps.reduce((sum, step) => {
          return sum + (substatsMinMaxByIncrements[stat]?.[step]?.max ?? 0);
        }, 0);

        const value = data.value ?? 0;
        
        // 🔥 ENHANCED: Plus de bonus pour rolls de qualité
        const rollQuality = totalMax > 0 ? value / totalMax : 0;
        let rollBonus = 0;
        
        if (rollQuality >= 0.9) {
          rollBonus = steps.length * 4; // Excellent rolls
        } else if (rollQuality >= 0.75) {
          rollBonus = steps.length * 2; // Good rolls
        } else if (rollQuality >= 0.5) {
          rollBonus = 0; // Average rolls
        } else {
          rollBonus = -steps.length; // Poor rolls
        }
        
        score += rollBonus;

        // Appliquer aussi l'ancienne logique pour compatibilité
        score = applyProcAndUpdateScore(score, hunter, title, stat, value, totalMax, 'global', enrichedSubStats);
      }
    });
  }


  if (hunterKey && BUILDER_DATA[hunterKey]) {
    const hunterData = BUILDER_DATA[hunterKey];
    const recommendedSet = hunterData.gameModes[Object.keys(hunterData.gameModes)[0]]?.recommendedSet;
    
    if (artifact.set) {
      if (artifact.set.includes(recommendedSet) || recommendedSet.includes(artifact.set)) {
        score += 20; // Bon set = +20 points
      } else {
        score -= 20; // Mauvais set = -20 points

      }
    }
  }

  // 🔥 ENHANCED: Score final sans limite haute, minimum 0
  return Math.max(0, Math.round(score));
}

// 🔥 HELPER: Trouve la clé du hunter dans builder_data
function getHunterKey(hunter) {
  if (!hunter || !hunter.name) return null;
  
  // Mappings hunter name → builder_data key
  const nameMapping = {
    'Jinha': 'jinha',
    'Miyeon': 'miyeon',
    'Shuhua': 'shuhua',
    'Lennart Niermann': 'niermann',
    'Cha Hae-In': 'chae',
    'Tawata Kanae': 'kanae',
    'Seorin': 'seorin',
    'Goto Ryuji': 'goto',
    'Shimizu Akari': 'shimizu',
    'Thomas André': 'thomas',
    'Isla Wright': 'isla',
    'Gina': 'gina',
    'Esil Radiru': 'esil'
  };
  
  return nameMapping[hunter.name] || null;
}

// 🔥 HELPER: Main stats attendues selon builder_data
function getExpectedMainStatsForSlotEnhanced(hunterData, slot) {
  const firstArtifactSet = Object.keys(hunterData.artifactSets)[0];
  const slotKey = slot.toLowerCase();
  
  let optimal = [];
  let good = [];
  
  if (hunterData.artifactSets[firstArtifactSet]?.mainStats?.[slotKey]) {
    optimal = [hunterData.artifactSets[firstArtifactSet].mainStats[slotKey]];
  }
  
  // Ajouter scaling stat comme priorité
  const scalingStat = `Additional ${hunterData.scaleStat}`;
  if (!optimal.includes(scalingStat)) {
    good.push(scalingStat);
  }
  
  return { optimal, good };
}

// 🔥 EXPORTS originaux conservés
export function getMainStatsByArtifactType(title) {
  const allMainStats = {
    Helmet: helmetMainStats,
    Chest: chestMainStats,
    Gloves: glovesMainStats,
    Boots: bootsMainStats,
    Necklace: necklaceMainStats,
    Bracelet: braceletMainStats,
    Ring: ringMainStats,
    Earrings: earringsMainStats
  };

  return allMainStats[title] || [];
}