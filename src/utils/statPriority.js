// 📁 /utils/statPriority.js

export const MAINSTAT_PRIORITY = {
  Helmet: ['Additional Attack', 'Additional Defense', 'Additional HP'],
  Chest: ['Additional Defense'],
  Gloves: ['Additional Attack'],
  Boots: ['Critical Hit Damage', ],
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
    priority2: ['Critical Rate', 'Damage Increase', 'Defense Penetration']
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

export function getMainStatPriorities(hunter, artifactType) {
  if (artifactType === 'Bracelet') {
    return MAINSTAT_PRIORITY.Bracelet[hunter.element] || [];
  }
  return MAINSTAT_PRIORITY[artifactType] || [];
}

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

export function getSubStatPriorities(hunter, artifactType) {
  const typeKey = SUBSTAT_TYPE_MAPPING[artifactType];
  const scale = hunter.scaleStat?.toLowerCase();
  const scalingStats = [
    `${hunter.scaleStat} %`,
    `Additional ${hunter.scaleStat}`
  ];
  

  return {
    priority1: scalingStats,
    ...SUBSTAT_PRIORITY[typeKey]
  };
}

export function applyProcAndUpdateScore(baseScore, hunter, artifactTitle, substat, value, maxValue, global, enrichedSubStats) {
  const subPriorities = getSubStatPriorities(hunter, artifactTitle);
  const ratio = value / maxValue;

  let penalty = 10
  let recoveryCap = 8
  // let good = false;
  // let average = false;
  // let bad = false;

  

  if (subPriorities.priority1.includes(substat)) {
    penalty = 10
     recoveryCap = 20
    // good = true;

  } else if (subPriorities.priority2.includes(substat)) {
    penalty = 18
    recoveryCap = 16;
  } else {
    penalty = 13;
     recoveryCap = 3;
  }

  const statData = enrichedSubStats?.find(s => s.name === substat);
const procCount = statData?.procOrders?.length || 0;

// Pondération par nombre de procs : max 4 procs → multiplicateur progressif
const procMultiplier = 1 + procCount * 0.1; // +10% par proc
recoveryCap = Math.floor(recoveryCap * procMultiplier);

  let newScore = baseScore - penalty;

  let recovery = Math.floor(ratio * recoveryCap);

  newScore += recovery;

  return newScore;
}

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

  const mainPriorities = getMainStatPriorities(hunter, title);
  const subPriorities = getSubStatPriorities(hunter, title);
  const scale = hunter.scaleStat?.toLowerCase();
  const mainIncludesScaling = mainStat.toLowerCase().includes(scale);
const mainIsPriority = mainPriorities.includes(mainStat);
const scalingExistsInThisArtifact = possibleMainStats.some(s => s.toLowerCase().includes(scale));

  let score = 0;
  let good = false;
  let average = false;
  let bad = false;
  if (!title){return;}
const enrichedSubStats = subStats.map((stat, i) => ({
  name: stat,
  ...subStatsLevels[i]
}));

  if (!scalingExistsInThisArtifact) {
  // Si la stat du scaling n’est pas dans les stats possibles du type d’artéfact, on ne pénalise pas
  if (mainIsPriority) {
    score += 10;
  } else {
    score += 5;
  }

  enrichedSubStats.forEach(({ name, value, procOrders = [], level = 0 }) => {
  const isScalingStat = name.toLowerCase().includes(scale);
  const isPriority1 = subPriorities.priority1.includes(name);
  const isPriority2 = subPriorities.priority2?.includes(name);

  let base = 0;
  let bonusPerProc = 0;

  if (isPriority1 && isScalingStat) {
    base = 23;
    bonusPerProc = 6;
  } else if (isPriority2) {
    base = 15;
    bonusPerProc = 3;
  } else {
    base = 4;
    bonusPerProc = -10;
  }

  const procCount = procOrders.length || level || 0;
  const adjustedScore = base + procCount * bonusPerProc;

  score += adjustedScore;
});

} else {
  // Cas normal : la stat scale est possible ici, on évalue normalement
  if (mainIsPriority && mainIncludesScaling) {
    score += 40;
  } else if (mainIncludesScaling) {
    score += 30;
  } else {
    score += 1;
  }
  if (!title){return;}

 enrichedSubStats.forEach(({ name, value, procOrders = [], level = 0 }) => {
  const isScalingStat = name.toLowerCase().includes(scale);
  const isPriority1 = subPriorities.priority1.includes(name);
  const isPriority2 = subPriorities.priority2?.includes(name);

  let base = 0;
  let bonusPerProc = 0;

  if (isPriority1 && isScalingStat) {
    base = 20;
    bonusPerProc = 6;
  } else if (isPriority2) {
    base = 10;
    bonusPerProc = 0;
  } else {
    base = 4;
    bonusPerProc = -10;
  }

  const procCount = procOrders.length || level || 0;
  const adjustedScore = base + procCount * bonusPerProc;

  score += adjustedScore;
});
}

  

  if (subStatsLevels && subStatsLevels.length === 4) {
    subStats.forEach((stat, i) => {
      const data = subStatsLevels[i];
      if (!data || !Array.isArray(data.procOrders) || !Array.isArray(data.procValues)) return;

      const steps = data.procOrders;
if (Array.isArray(steps) && steps.length > 0) {
  const totalMin = steps.reduce((sum, step) => {
    return sum + (substatsMinMaxByIncrements[stat]?.[step]?.min ?? 0);
  }, 0);

  const totalMax = steps.reduce((sum, step) => {
    return sum + (substatsMinMaxByIncrements[stat]?.[step]?.max ?? 0);
  }, 0);

  const value = data.value ?? 0;

  score = applyProcAndUpdateScore(score, hunter, title, stat, value, totalMax, 'global', enrichedSubStats);
}
    });
  }

  return score;
}