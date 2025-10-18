// src/components/ScoreCard/bdgService.js

/**
 * Récupère l'historique BDG complet depuis builderberu_users
 */
export const getBdgHistory = (activeAccount = null) => {
  try {
    const builderberuUsers = localStorage.getItem('builderberu_users');
    if (!builderberuUsers) return {};

    const data = JSON.parse(builderberuUsers);
    const username = Object.keys(data)[0];
    const account = activeAccount || data[username]?.activeAccount || 'main';

    return data[username]?.accounts?.[account]?.bdgHistory || {};
  } catch (e) {
    console.error('Erreur récupération historique BDG:', e);
    return {};
  }
};

/**
 * Calcule le numéro de semaine précédente au format ISO (2025-W37 -> 2025-W36)
 */
export const getPreviousWeek = (weekId) => {
  const [year, weekNum] = weekId.split('-W').map(Number);
  const prevWeek = weekNum - 1;
  
  if (prevWeek < 1) {
    return `${year - 1}-W52`;
  }
  
  return `${year}-W${String(prevWeek).padStart(2, '0')}`;
};

/**
 * Sauvegarde une tentative dans l'historique BDG
 * Limite: 2 tentatives maximum par semaine/élément/preset
 */
export const saveBdgAttempt = (
  data,
  username,
  account,
  weekId,
  element,
  preset,
  attemptData
) => {
  try {
    // Initialiser la structure si nécessaire
    if (!data[username].accounts[account].bdgHistory) {
      data[username].accounts[account].bdgHistory = {};
    }
    if (!data[username].accounts[account].bdgHistory[weekId]) {
      data[username].accounts[account].bdgHistory[weekId] = {};
    }
    if (!data[username].accounts[account].bdgHistory[weekId][element]) {
      data[username].accounts[account].bdgHistory[weekId][element] = {};
    }
    if (!data[username].accounts[account].bdgHistory[weekId][element][preset]) {
      data[username].accounts[account].bdgHistory[weekId][element][preset] = {
        attempts: []
      };
    }

    const attempts = data[username].accounts[account].bdgHistory[weekId][element][preset].attempts;

    // Vérifier la limite de 2 tentatives
    if (attempts.length >= 2) {
      attempts.shift();
    }

    // Ajouter la nouvelle tentative
    attempts.push({
      id: `attempt_${Date.now()}`,
      timestamp: new Date().toISOString(),
      totalScore: attemptData.totalScore,
      rageCount: attemptData.rageCount,
      sung: attemptData.sung,
      hunters: attemptData.hunters.map(h => ({
        id: h.id,
        damage: h.damage || '',
        stars: h.stars || 0,
        weaponStars: h.weaponStars || 0,
        leftSet: h.leftSet || '',
        leftSet1: h.leftSet1 || '',
        leftSet2: h.leftSet2 || '',
        rightSet: h.rightSet || '',
        finalStats: h.finalStats || {}
      })),
      boss: attemptData.boss,
      bossName: attemptData.bossName,
      elements: attemptData.elements
    });

    return {
      success: true,
      message: `Sauvegardé (${attempts.length}/2 tentatives)`
    };

  } catch (e) {
    console.error('Erreur sauvegarde tentative:', e);
    return {
      success: false,
      message: 'Erreur lors de la sauvegarde'
    };
  }
};

/**
 * Récupère TOUTES les tentatives comparables pour analyse détaillée
 * Filtre par élément et boss identiques
 */
export const getAllComparableAttempts = (
  currentWeek,
  currentBoss,
  currentElement,
  activeAccount
) => {
  const history = getBdgHistory(activeAccount);
  const allAttempts = [];

  if (!history || Object.keys(history).length === 0) {
    return [];
  }

  // Parcourir TOUTES les semaines
  for (const weekId in history) {
    if (weekId === currentWeek) continue; // Skip semaine actuelle

    for (const element in history[weekId]) {
      // Filtrer par élément
      if (element !== currentElement) continue;

      for (const preset in history[weekId][element]) {
        const attempts = history[weekId][element][preset].attempts || [];
        
        attempts.forEach(attempt => {
          // Filtrer par boss
          if (attempt.boss === currentBoss) {
            allAttempts.push({
              week: weekId,
              element: element,
              preset: preset,
              timestamp: attempt.timestamp,
              totalScore: attempt.totalScore,
              rageCount: attempt.rageCount,
              sung: attempt.sung,
              hunters: attempt.hunters,
              boss: attempt.boss,
              bossName: attempt.bossName
            });
          }
        });
      }
    }
  }

  // Trier par date (plus ancien au plus récent)
  return allAttempts.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};

/**
 * Analyse les différences de stats et identifie les causes principales
 */
const analyzeStatsDifference = (currentStats, pastStats, character) => {
  const differences = {};
  const importantStats = character?.importantStats || ['atk', 'tc', 'dcc', 'defPen', 'di'];

  importantStats.forEach(stat => {
    const current = parseFloat(currentStats?.[stat]) || 0;
    const past = parseFloat(pastStats?.[stat]) || 0;
    const diff = current - past;
    const diffPercent = past > 0 ? ((diff / past) * 100) : 0;

    if (Math.abs(diff) > 0.1) { // Seuil minimal pour éviter les micro-variations
      differences[stat] = {
        diff,
        diffPercent,
        current,
        past
      };
    }
  });

  // Identifier la stat la plus impactante (plus grande variation en %)
  let mainFactor = null;
  let maxImpact = 0;

  for (const stat in differences) {
    const impact = Math.abs(differences[stat].diffPercent);
    if (impact > maxImpact) {
      maxImpact = impact;
      mainFactor = stat;
    }
  }

  return {
    differences,
    mainFactor,
    mainFactorImpact: maxImpact
  };
};

/**
 * Compare les hunters individuellement entre tentative actuelle et passée
 */
export const compareHunters = (currentHunters, pastAttempt) => {
  const comparisons = [];

  currentHunters.forEach((currentHunter, idx) => {
    if (!currentHunter || !currentHunter.id) return;

    const pastHunter = pastAttempt.hunters.find(h => h.id === currentHunter.id);
    
    if (pastHunter) {
      const currentDamage = parseInt(currentHunter.damage) || 0;
      const pastDamage = parseInt(pastHunter.damage) || 0;
      const diff = currentDamage - pastDamage;
      const diffPercent = pastDamage > 0 ? ((diff / pastDamage) * 100) : 0;

      // Analyser les stats
      const statsDiff = analyzeStatsDifference(
        currentHunter.finalStats,
        pastHunter.finalStats,
        currentHunter.character
      );

      comparisons.push({
        name: currentHunter.character?.name || currentHunter.id,
        currentDamage,
        pastDamage,
        diff,
        diffPercent,
        statsDiff,
        currentStats: currentHunter.finalStats,
        pastStats: pastHunter.finalStats,
        character: currentHunter.character
      });
    }
  });

  return comparisons;
};

/**
 * Trouve la meilleure comparaison pour analyse simple (ancien système)
 * Priorités:
 * 1. Même semaine précédente + même boss + mêmes éléments
 * 2. Même boss (peu importe éléments/semaine)
 * 3. Meilleur score des 4 dernières semaines
 */
export const findBestComparison = (
  currentWeek,
  currentBoss,
  currentElements,
  currentElement,
  currentScore,
  activeAccount
) => {
  const history = getBdgHistory(activeAccount);
  
  if (!history || Object.keys(history).length === 0) {
    return null;
  }

  // 1. Chercher dans la semaine précédente avec même config
  const prevWeek = getPreviousWeek(currentWeek);
  
  if (history[prevWeek]?.[currentElement]) {
    for (const preset in history[prevWeek][currentElement]) {
      const attempts = history[prevWeek][currentElement][preset].attempts || [];
      
      const bestAttempt = attempts.reduce((best, current) => {
        return !best || current.totalScore > best.totalScore ? current : best;
      }, null);

      if (bestAttempt && bestAttempt.boss === currentBoss) {
        return {
          type: 'perfect_match',
          score: bestAttempt.totalScore,
          rageCount: bestAttempt.rageCount,
          week: prevWeek,
          boss: bestAttempt.bossName,
          element: currentElement,
          diff: currentScore - bestAttempt.totalScore,
          diffPercent: ((currentScore - bestAttempt.totalScore) / bestAttempt.totalScore) * 100,
          note: null
        };
      }
    }
  }

  // 2. Chercher même boss dans toutes les semaines
  const allWeeks = Object.keys(history).sort().reverse();
  
  for (const weekId of allWeeks) {
    if (weekId === currentWeek) continue;

    for (const element in history[weekId]) {
      for (const preset in history[weekId][element]) {
        const attempts = history[weekId][element][preset].attempts || [];
        
        const bestAttempt = attempts.reduce((best, current) => {
          return !best || current.totalScore > best.totalScore ? current : best;
        }, null);

        if (bestAttempt && bestAttempt.boss === currentBoss) {
          return {
            type: 'same_boss',
            score: bestAttempt.totalScore,
            rageCount: bestAttempt.rageCount,
            week: weekId,
            boss: bestAttempt.bossName,
            element: element,
            diff: currentScore - bestAttempt.totalScore,
            diffPercent: ((currentScore - bestAttempt.totalScore) / bestAttempt.totalScore) * 100,
            note: element !== currentElement ? 'Éléments différents' : null
          };
        }
      }
    }
  }

  // 3. Meilleur score des 4 dernières semaines
  const recentWeeks = allWeeks.slice(0, 4);
  let bestScore = null;

  for (const weekId of recentWeeks) {
    if (weekId === currentWeek) continue;

    for (const element in history[weekId]) {
      for (const preset in history[weekId][element]) {
        const attempts = history[weekId][element][preset].attempts || [];
        
        for (const attempt of attempts) {
          if (!bestScore || attempt.totalScore > bestScore.totalScore) {
            bestScore = { ...attempt, week: weekId, element };
          }
        }
      }
    }
  }

  if (bestScore) {
    return {
      type: 'recent_best',
      score: bestScore.totalScore,
      rageCount: bestScore.rageCount,
      week: bestScore.week,
      boss: bestScore.bossName,
      element: bestScore.element,
      diff: currentScore - bestScore.totalScore,
      diffPercent: ((currentScore - bestScore.totalScore) / bestScore.totalScore) * 100,
      note: bestScore.boss !== currentBoss ? 'Boss différent' : null
    };
  }

  return null;
};

/**
 * Validation de la complétude du build (conservé pour compatibilité)
 */
export const validateBuildCompleteness = () => {
  const warnings = [];
  
  try {
    const artifactsData = JSON.parse(localStorage.getItem('artifactsData') || '{}');
    const sungArtifacts = Object.values(artifactsData).filter(a => a && a.mainStat);
    
    if (sungArtifacts.length < 8) {
      warnings.push({
        type: 'sung_incomplete',
        message: `Sung Jin-Woo n'a que ${sungArtifacts.length}/8 artifacts équipés`
      });
    }
  } catch (e) {
    console.error('Erreur validation build:', e);
  }
  
  return warnings;
};

/**
 * Charge les données du build (conservé pour compatibilité)
 */
export const loadBuildData = () => {
  try {
    const artifactsData = JSON.parse(localStorage.getItem('artifactsData') || '{}');
    const hunterCores = JSON.parse(localStorage.getItem('hunterCores') || '{}');
    const gemData = JSON.parse(localStorage.getItem('gemData') || '{}');
    
    return {
      artifacts: artifactsData,
      cores: hunterCores,
      gems: gemData
    };
  } catch (e) {
    console.error('Erreur chargement build:', e);
    return { artifacts: {}, cores: {}, gems: {} };
  }
};

/**
 * Validation des scores (conservé pour compatibilité)
 */
export const validateScores = (scoreData, limits) => {
  const errors = [];
  
  if (scoreData.totalScore > limits.maxTotalScore) {
    errors.push('Score total dépasse la limite');
  }
  
  if (limits.rageCountRange) {
    if (scoreData.rageCount < limits.rageCountRange.min || 
        scoreData.rageCount > limits.rageCountRange.max) {
      errors.push('Rage count hors limites');
    }
  }
  
  return errors;
};