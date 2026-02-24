/**
 * autoEquipUtils.js
 *
 * Centralized auto-equip and equipment analysis logic shared between
 * ShadowColosseum.jsx and PvpLive.jsx.
 *
 * Extracts: constants (set tiers, ideal stats, stat colors),
 * scoring functions, set bonus valuation, the set-first auto-equip
 * algorithm, and the analyzeEquipment advisory function.
 */

import {
  ALL_ARTIFACT_SETS,
  SLOT_ORDER,
  MAIN_STAT_VALUES,
  SUB_STAT_POOL,
  computeArtifactILevel,
} from './equipmentData';

// ---------------------------------------------------------------------------
// 1. Constants
// ---------------------------------------------------------------------------

export const ELEMENT_SET_MAP = {
  fire: 'flamme_maudite',
  water: 'maree_eternelle',
  shadow: 'ombre_souveraine',
};

export const CLASS_SET_TIERS = {
  assassin: {
    S: ['infamie_chaotique', 'ELEMENT_SET'],
    A: ['expertise_bestiale', 'fureur_desespoir', 'flamme_interieure'],
    B: ['eclat_angelique', 'voile_ombre'],
    C: ['volonte_de_fer', 'benediction_celeste'],
  },
  fighter: {
    S: ['infamie_chaotique', 'ELEMENT_SET'],
    A: ['expertise_bestiale', 'fureur_desespoir', 'flamme_interieure'],
    B: ['chaines_destin', 'aura_commandeur'],
    C: ['benediction_celeste', 'source_arcanique'],
  },
  mage: {
    S: ['source_arcanique', 'tempete_arcane', 'ELEMENT_SET'],
    A: ['echo_temporel', 'expertise_bestiale', 'infamie_chaotique'],
    B: ['eclat_angelique', 'flamme_interieure'],
    C: ['volonte_de_fer', 'chaines_destin'],
  },
  tank: {
    S: ['volonte_de_fer', 'chaines_destin'],
    A: ['aura_commandeur', 'benediction_celeste'],
    B: ['sacrifice_martyr', 'voile_ombre'],
    C: ['infamie_chaotique', 'expertise_bestiale'],
  },
  support: {
    S: ['benediction_celeste', 'echo_temporel'],
    A: ['aura_commandeur', 'volonte_de_fer', 'source_arcanique'],
    B: ['sacrifice_martyr', 'chaines_destin'],
    C: ['infamie_chaotique', 'fureur_desespoir'],
  },
};

export const CLASS_IDEAL_STATS = {
  assassin: {
    mainStats: { casque: 'hp_pct', plastron: 'atk_pct', gants: 'crit_dmg', bottes: 'spd_flat', collier: 'atk_pct', bracelet: 'atk_pct', anneau: 'crit_rate', boucles: 'atk_pct' },
    goodSubs: ['crit_dmg', 'crit_rate', 'atk_pct', 'spd_flat', 'atk_flat'],
    badSubs: ['hp_flat', 'def_flat', 'res_flat'],
  },
  fighter: {
    mainStats: { casque: 'hp_pct', plastron: 'atk_pct', gants: 'crit_rate', bottes: 'spd_flat', collier: 'atk_pct', bracelet: 'atk_pct', anneau: 'crit_dmg', boucles: 'atk_pct' },
    goodSubs: ['atk_pct', 'crit_rate', 'crit_dmg', 'atk_flat', 'hp_pct'],
    badSubs: ['res_flat', 'def_flat'],
  },
  mage: {
    mainStats: { casque: 'hp_pct', plastron: 'int_pct', gants: 'crit_dmg', bottes: 'spd_flat', collier: 'int_pct', bracelet: 'int_pct', anneau: 'crit_rate', boucles: 'int_pct' },
    goodSubs: ['int_pct', 'int_flat', 'crit_dmg', 'crit_rate', 'spd_flat'],
    badSubs: ['atk_flat', 'atk_pct', 'hp_flat', 'def_flat'],
  },
  tank: {
    mainStats: { casque: 'hp_pct', plastron: 'atk_flat', gants: 'crit_rate', bottes: 'def_pct', collier: 'hp_pct', bracelet: 'def_pct', anneau: 'res_flat', boucles: 'hp_pct' },
    goodSubs: ['hp_pct', 'def_pct', 'res_flat', 'hp_flat', 'def_flat'],
    badSubs: ['crit_dmg', 'atk_pct', 'atk_flat'],
  },
  support: {
    mainStats: { casque: 'hp_pct', plastron: 'atk_pct', gants: 'crit_rate', bottes: 'spd_flat', collier: 'hp_pct', bracelet: 'def_pct', anneau: 'res_flat', boucles: 'hp_pct' },
    goodSubs: ['hp_pct', 'spd_flat', 'res_flat', 'def_pct', 'hp_flat'],
    badSubs: ['crit_dmg', 'atk_flat'],
  },
};

export const STAT_COLOR_MAP = {
  fighter:  { green: ['atk_flat', 'atk_pct', 'crit_dmg', 'crit_rate', 'spd_flat'], gray: ['int_flat', 'int_pct', 'hp_flat', 'res_flat'] },
  assassin: { green: ['atk_flat', 'atk_pct', 'crit_dmg', 'crit_rate', 'spd_flat'], gray: ['int_flat', 'int_pct', 'hp_flat', 'res_flat'] },
  mage:     { green: ['int_flat', 'int_pct', 'crit_dmg', 'crit_rate', 'spd_flat'], gray: ['atk_flat', 'atk_pct', 'hp_flat', 'res_flat'] },
  support:  { green: ['atk_flat', 'atk_pct', 'crit_dmg', 'crit_rate', 'spd_flat'], gray: ['int_flat', 'int_pct'] },
  tank:     { green: ['hp_flat', 'hp_pct', 'def_flat', 'def_pct', 'res_flat'], gray: ['atk_flat', 'crit_dmg', 'int_flat', 'int_pct'] },
};

// ---------------------------------------------------------------------------
// 2. Utility Functions
// ---------------------------------------------------------------------------

/**
 * Resolve ELEMENT_SET placeholder to actual set ID.
 */
export function resolveSetId(setId, hunterElement) {
  return setId === 'ELEMENT_SET' ? ELEMENT_SET_MAP[hunterElement] : setId;
}

/**
 * Get resolved set tiers for a class + element.
 */
export function getResolvedTiers(hunterClass, hunterElement) {
  const tiers = CLASS_SET_TIERS[hunterClass] || CLASS_SET_TIERS.fighter;
  const resolved = {};
  for (const tier of ['S', 'A', 'B', 'C']) {
    resolved[tier] = (tiers[tier] || []).map(s => resolveSetId(s, hunterElement)).filter(Boolean);
  }
  return resolved;
}

/**
 * Get the tier of a set for a given class.
 */
export function getSetTier(setId, hunterClass, hunterElement) {
  const resolved = getResolvedTiers(hunterClass, hunterElement);
  for (const tier of ['S', 'A', 'B', 'C']) {
    if (resolved[tier].includes(setId)) return tier;
  }
  return 'B'; // default neutral
}

/**
 * Get stat color CSS class based on class/element.
 */
export function getStatColor(statId, hunterClass, hunterElement) {
  const map = STAT_COLOR_MAP[hunterClass] || STAT_COLOR_MAP.fighter;
  if (map.green.includes(statId)) return 'text-green-400 font-bold';
  if (map.gray.includes(statId)) return 'text-gray-500';
  const elemMap = {
    fire: ['fire_dmg_flat', 'fire_dmg_pct'],
    water: ['water_dmg_flat', 'water_dmg_pct'],
    shadow: ['shadow_dmg_flat', 'shadow_dmg_pct'],
    light: ['light_dmg_flat', 'light_dmg_pct'],
    earth: ['earth_dmg_flat', 'earth_dmg_pct'],
  };
  if (elemMap[hunterElement]?.includes(statId)) return 'text-green-400 font-bold';
  const allElem = Object.values(elemMap).flat();
  if (allElem.includes(statId)) return 'text-gray-300';
  return 'text-gray-300';
}

/**
 * Score a single artifact for a given class/element.
 */
export function scoreArtifact(art, hunterClass, hunterElement) {
  if (!art) return 0;
  const idealStats = CLASS_IDEAL_STATS[hunterClass] || CLASS_IDEAL_STATS.fighter;
  let score = 0;

  // Rarity base
  score += art.rarity === 'mythique' ? 30 : art.rarity === 'legendaire' ? 15 : 0;

  // Level
  score += art.level * 2;

  // Main stat match
  const idealMain = idealStats.mainStats[art.slot];
  if (idealMain === art.mainStat) score += 30;
  else if (['atk_pct', 'hp_pct', 'crit_rate', 'crit_dmg', 'int_pct'].includes(art.mainStat)) score += 10;
  else score -= 10;

  // Set tier
  const tier = getSetTier(art.set, hunterClass, hunterElement);
  score += tier === 'S' ? 25 : tier === 'A' ? 15 : tier === 'B' ? 5 : -10;

  // Sub stats
  (art.subs || []).forEach(sub => {
    if (idealStats.goodSubs.includes(sub.id)) score += 8;
    else if (idealStats.badSubs.includes(sub.id)) score -= 5;
    score += sub.value * 0.3;
  });

  // iLevel
  score += computeArtifactILevel(art) * 0.5;

  return Math.round(score);
}

/**
 * Score just the raw quality without set tier
 * (for set-plan comparison where set is already accounted for).
 */
export function scoreArtifactRaw(art, hunterClass, hunterElement) {
  if (!art) return 0;
  const idealStats = CLASS_IDEAL_STATS[hunterClass] || CLASS_IDEAL_STATS.fighter;
  let score = 0;

  score += art.rarity === 'mythique' ? 30 : art.rarity === 'legendaire' ? 15 : 0;
  score += art.level * 2;

  const idealMain = idealStats.mainStats[art.slot];
  if (idealMain === art.mainStat) score += 25;
  score += art.mainValue * 0.5;

  (art.subs || []).forEach(sub => {
    const idx = idealStats.goodSubs.indexOf(sub.id);
    if (idx !== -1) score += (5 - idx) * 2 + sub.value * 0.3;
    else if (idealStats.badSubs.includes(sub.id)) score -= 3;
    else score += sub.value * 0.2;
  });

  return score;
}

// ---------------------------------------------------------------------------
// 3. Set Bonus Valuation
// ---------------------------------------------------------------------------

/**
 * How much a 2-piece set bonus is worth in score points.
 */
export function setBonus2Value(setId) {
  const s = ALL_ARTIFACT_SETS[setId];
  if (!s) return 15;
  if (s.passive2) return 40;
  const b = s.bonus2 || {};
  let v = 15;
  if (b.manaPercent) v += b.manaPercent * 0.8;
  if (b.atkPercent) v += b.atkPercent * 1.5;
  if (b.defPercent) v += b.defPercent;
  if (b.hpPercent) v += b.hpPercent;
  if (b.critRate) v += b.critRate * 2;
  if (b.spdPercent) v += b.spdPercent * 1.5;
  if (b.resFlat) v += b.resFlat;
  if (b.manaCostReduce) v += b.manaCostReduce;
  return v;
}

/**
 * How much a 4-piece set bonus is worth in score points.
 */
export function setBonus4Value(setId) {
  const s = ALL_ARTIFACT_SETS[setId];
  if (!s) return 30;
  if (s.passive4) return 60;
  const b = s.bonus4 || {};
  let v = 30;
  if (b.critDamage) v += b.critDamage * 1.5;
  if (b.fireDamage) v += b.fireDamage * 2;
  if (b.waterDamage) v += b.waterDamage * 2;
  if (b.shadowDamage) v += b.shadowDamage * 2;
  if (b.allDamage) v += b.allDamage * 2.5;
  if (b.healBonus) v += b.healBonus;
  if (b.hpPercent) v += b.hpPercent;
  if (b.defPen) v += b.defPen * 2;
  if (b.manaRegen) v += b.manaRegen * 0.5;
  if (b.manaCostReduce) v += b.manaCostReduce;
  return v;
}

// ---------------------------------------------------------------------------
// 4. The Main Auto-Equip Set-First Algorithm
// ---------------------------------------------------------------------------

/**
 * Set-first auto-equip algorithm.
 * @param {string} hunterClass - 'fighter'|'mage'|'tank'|'support'|'assassin'
 * @param {string} hunterElement - 'fire'|'water'|'shadow'
 * @param {Array} allArtifacts - combined array of all available artifacts (equipped + inventory)
 * @returns {{ assigned: Object, usedUids: Set, setLabels: string }}
 *   assigned: { [slot]: artifact } mapping
 *   usedUids: Set of UIDs used in the assignment
 *   setLabels: human-readable string of equipped sets for Beru messages
 */
export function autoEquipSetFirst(hunterClass, hunterElement, allArtifacts) {
  const resolvedTiers = getResolvedTiers(hunterClass, hunterElement);
  const preferredSets = new Set([...resolvedTiers.S, ...resolvedTiers.A]);

  // Index artifacts by slot and set
  const bySlot = {};
  const bySlotAndSet = {};
  SLOT_ORDER.forEach(s => { bySlot[s] = []; });
  allArtifacts.forEach(a => {
    if (bySlot[a.slot]) bySlot[a.slot].push(a);
  });

  // Sort each slot by raw score descending
  SLOT_ORDER.forEach(s => {
    bySlot[s].sort((a, b) => scoreArtifactRaw(b, hunterClass, hunterElement) - scoreArtifactRaw(a, hunterClass, hunterElement));
    bySlotAndSet[s] = {};
    bySlot[s].forEach(a => {
      if (!bySlotAndSet[s][a.set]) bySlotAndSet[s][a.set] = [];
      bySlotAndSet[s][a.set].push(a);
    });
  });

  // Count slot coverage per preferred set
  const setSlotCoverage = {};
  [...preferredSets].forEach(setId => {
    setSlotCoverage[setId] = SLOT_ORDER.filter(s => (bySlotAndSet[s][setId] || []).length > 0).length;
  });

  // Generate set plans
  const allSets = [...preferredSets];
  const plans = [];

  // Plan: 8p (only for sets that have an 8p bonus)
  for (const s8 of allSets) {
    if (setSlotCoverage[s8] >= 8 && ALL_ARTIFACT_SETS[s8]?.bonus8Desc) {
      plans.push([{ set: s8, n: 8 }]);
    }
  }

  // Plan: 4p + 4p
  for (let i = 0; i < allSets.length; i++) {
    for (let j = i + 1; j < allSets.length; j++) {
      if (setSlotCoverage[allSets[i]] >= 4 && setSlotCoverage[allSets[j]] >= 4) {
        plans.push([{ set: allSets[i], n: 4 }, { set: allSets[j], n: 4 }]);
      }
    }
  }

  // Plan: 4p + 2p + 2p
  for (let i = 0; i < allSets.length; i++) {
    if (setSlotCoverage[allSets[i]] < 4) continue;
    for (let j = 0; j < allSets.length; j++) {
      if (j === i || setSlotCoverage[allSets[j]] < 2) continue;
      for (let k = j + 1; k < allSets.length; k++) {
        if (k === i || setSlotCoverage[allSets[k]] < 2) continue;
        plans.push([{ set: allSets[i], n: 4 }, { set: allSets[j], n: 2 }, { set: allSets[k], n: 2 }]);
      }
    }
  }

  // Plan: 2p + 2p + 2p + 2p
  if (allSets.length >= 4) {
    const sets2 = allSets.filter(s => setSlotCoverage[s] >= 2);
    for (let i = 0; i < sets2.length; i++) {
      for (let j = i + 1; j < sets2.length; j++) {
        for (let k = j + 1; k < sets2.length; k++) {
          for (let l = k + 1; l < sets2.length; l++) {
            plans.push([{ set: sets2[i], n: 2 }, { set: sets2[j], n: 2 }, { set: sets2[k], n: 2 }, { set: sets2[l], n: 2 }]);
          }
        }
      }
    }
  }

  // Plan: 4p + 2p (remaining 2 slots = best available)
  for (const s4 of allSets) {
    if (setSlotCoverage[s4] < 4) continue;
    for (const s2 of allSets) {
      if (s2 === s4 || setSlotCoverage[s2] < 2) continue;
      plans.push([{ set: s4, n: 4 }, { set: s2, n: 2 }]);
    }
  }

  // Fallback: greedy (no set constraint)
  plans.push([]);

  // Evaluate each plan
  const evaluatePlan = (plan) => {
    const assigned = {};
    const usedUids = new Set();
    let totalScore = 0;

    const slotsRemaining = new Set(SLOT_ORDER);
    for (const { set: setId, n: needed } of plan) {
      const slotCandidates = [...slotsRemaining]
        .map(s => {
          const arts = (bySlotAndSet[s][setId] || []).filter(a => !usedUids.has(a.uid));
          return { slot: s, best: arts[0] || null, score: arts[0] ? scoreArtifactRaw(arts[0], hunterClass, hunterElement) : -999 };
        })
        .filter(sc => sc.best)
        .sort((a, b) => {
          const aBestRaw = bySlot[a.slot].find(x => !usedUids.has(x.uid));
          const bBestRaw = bySlot[b.slot].find(x => !usedUids.has(x.uid));
          const aLoss = (aBestRaw ? scoreArtifactRaw(aBestRaw, hunterClass, hunterElement) : 0) - a.score;
          const bLoss = (bBestRaw ? scoreArtifactRaw(bBestRaw, hunterClass, hunterElement) : 0) - b.score;
          return aLoss - bLoss;
        });

      let placed = 0;
      for (const sc of slotCandidates) {
        if (placed >= needed) break;
        if (!slotsRemaining.has(sc.slot)) continue;
        assigned[sc.slot] = sc.best;
        usedUids.add(sc.best.uid);
        totalScore += sc.score;
        slotsRemaining.delete(sc.slot);
        placed++;
      }
      if (placed >= 2) totalScore += setBonus2Value(setId);
      if (placed >= 4) totalScore += setBonus4Value(setId);
      if (placed >= 8 && ALL_ARTIFACT_SETS[setId]?.bonus8Desc) totalScore += 50;
    }

    // Fill remaining slots with best raw artifacts
    for (const slot of slotsRemaining) {
      const best = bySlot[slot].find(a => !usedUids.has(a.uid));
      if (best) {
        assigned[slot] = best;
        usedUids.add(best.uid);
        totalScore += scoreArtifactRaw(best, hunterClass, hunterElement);
      }
    }

    return { assigned, totalScore, usedUids };
  };

  // Find the best plan
  let bestResult = { assigned: {}, totalScore: -Infinity, usedUids: new Set() };
  for (const plan of plans) {
    const result = evaluatePlan(plan);
    if (result.totalScore > bestResult.totalScore) bestResult = result;
  }

  // Generate set labels for Beru message
  const setCounts = {};
  Object.values(bestResult.assigned).forEach(a => {
    if (a?.set) setCounts[a.set] = (setCounts[a.set] || 0) + 1;
  });
  const setLabels = Object.entries(setCounts)
    .filter(([, cnt]) => cnt >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([sId, cnt]) => {
      const sd = ALL_ARTIFACT_SETS[sId];
      const bonusTag = cnt >= 8 ? '8p' : cnt >= 4 ? '4p' : '2p';
      return `${sd?.icon || ''} ${sd?.name || sId} (${bonusTag})`;
    })
    .join(' + ');

  return { assigned: bestResult.assigned, usedUids: bestResult.usedUids, setLabels };
}

// ---------------------------------------------------------------------------
// 5. analyzeEquipment function (for Conseil Beru)
// ---------------------------------------------------------------------------

/**
 * Analyze a hunter's equipment and return advice.
 * @param {string} hunterClass
 * @param {string} hunterElement
 * @param {Object} equipped - { slot: artifact } of current equipment
 * @param {Array} inventory - array of available inventory artifacts
 * @returns analysis object with grade, slotAdvice, recommendations, etc.
 */
export function analyzeEquipment(hunterClass, hunterElement, equipped, inventory) {
  const idealStats = CLASS_IDEAL_STATS[hunterClass] || CLASS_IDEAL_STATS.fighter;
  const resolvedTiers = getResolvedTiers(hunterClass, hunterElement);
  const role = ['assassin', 'fighter'].includes(hunterClass)
    ? 'DPS'
    : hunterClass === 'mage'
      ? 'Mage'
      : hunterClass === 'tank'
        ? 'Tank'
        : 'Support';

  // Current set analysis
  const setCounts = {};
  Object.values(equipped).forEach(art => {
    if (art?.set) setCounts[art.set] = (setCounts[art.set] || 0) + 1;
  });
  const currentSetAnalysis = Object.entries(setCounts).map(([setId, count]) => {
    const tier = getSetTier(setId, hunterClass, hunterElement);
    return {
      setId,
      count,
      tier,
      verdict: tier === 'S' ? 'parfait' : tier === 'A' ? 'ok' : 'mauvais',
    };
  });

  // Slot-by-slot analysis
  const slotAdvice = SLOT_ORDER.map(slot => {
    const current = equipped[slot] || null;
    const currentScore = current ? scoreArtifact(current, hunterClass, hunterElement) : 0;
    const currentIssues = [];

    if (current) {
      const idealMain = idealStats.mainStats[slot];
      if (idealMain && current.mainStat !== idealMain) {
        const cur = MAIN_STAT_VALUES[current.mainStat]?.name || current.mainStat;
        const ideal = MAIN_STAT_VALUES[idealMain]?.name || idealMain;
        currentIssues.push(`Main stat non optimale (${cur} au lieu de ${ideal})`);
      }
      if (getSetTier(current.set, hunterClass, hunterElement) === 'C') {
        currentIssues.push(`Set pas adapte pour un ${hunterClass}`);
      }
      (current.subs || []).forEach(sub => {
        if (idealStats.badSubs.includes(sub.id)) {
          const subName = SUB_STAT_POOL.find(s => s.id === sub.id)?.name || sub.id;
          currentIssues.push(`Sub ${subName} inutile pour un ${hunterClass}`);
        }
      });
      if (current.level === 0) currentIssues.push('Artefact pas monte (Lv0)');
    }

    // Find best upgrade in inventory
    const candidates = inventory.filter(a => a.slot === slot);
    let bestInInventory = null;
    let bestScore = 0;
    candidates.forEach(a => {
      const s = scoreArtifact(a, hunterClass, hunterElement);
      if (s > bestScore) {
        bestScore = s;
        bestInInventory = a;
      }
    });

    const upgrade = bestInInventory && bestScore > currentScore;
    return {
      slot,
      current,
      currentScore,
      currentIssues,
      bestInInventory: upgrade ? bestInInventory : null,
      bestScore: upgrade ? bestScore : 0,
      upgrade: !!upgrade,
      upgradeGain: upgrade ? bestScore - currentScore : 0,
    };
  });

  // Mage-specific advice
  const mageAdvice = hunterClass === 'mage'
    ? (() => {
        const issues = [];
        Object.entries(equipped).forEach(([slot, art]) => {
          if (!art) return;
          if (['plastron', 'collier', 'bracelet', 'boucles'].includes(slot) && art.mainStat === 'atk_pct') {
            issues.push(`${slot}: ATK% au lieu de INT% — un mage scale sur INT !`);
          }
        });
        return issues.length > 0 ? issues : null;
      })()
    : null;

  // Reroll advice
  const rerollAdvice = [];
  Object.entries(equipped).forEach(([slot, art]) => {
    if (!art) return;
    const idealMain = idealStats.mainStats[slot];
    if (idealMain && art.mainStat !== idealMain) {
      const curName = MAIN_STAT_VALUES[art.mainStat]?.name || art.mainStat;
      const idealName = MAIN_STAT_VALUES[idealMain]?.name || idealMain;
      rerollAdvice.push({ slot, msg: `${slot}: ${curName} -> ${idealName}` });
    }
  });

  // Grade
  const equippedSlots = SLOT_ORDER.filter(s => equipped[s]).length;
  if (equippedSlots === 0) {
    return {
      hunterClass,
      role,
      currentSetAnalysis,
      slotAdvice,
      mageAdvice,
      rerollAdvice,
      recommendedSets: { S: resolvedTiers.S, A: resolvedTiers.A },
      overallGrade: 'D',
      summary: 'Pas d\'artefact equipe... Beru est decourage.',
    };
  }

  const avgScore = slotAdvice.reduce((sum, sa) => sum + sa.currentScore, 0) / SLOT_ORDER.length;
  const totalIssues = slotAdvice.reduce((sum, sa) => sum + sa.currentIssues.length, 0);
  const sSetCount = currentSetAnalysis.filter(s => s.tier === 'S').reduce((sum, s) => sum + s.count, 0);

  let grade;
  if (avgScore >= 70 && totalIssues <= 2 && sSetCount >= 4) grade = 'S';
  else if (avgScore >= 50 && totalIssues <= 5) grade = 'A';
  else if (avgScore >= 30 && totalIssues <= 10) grade = 'B';
  else grade = 'C';

  const gradeMsgs = {
    S: 'Build PARFAIT ! Beru est IMPRESSIONNE !',
    A: 'Pas mal du tout, quelques ajustements et c\'est top !',
    B: 'Y\'a du boulot... Beru voit des problemes.',
    C: 'AIEEE ! C\'est... c\'est quoi ce build ?! Beru pleure.',
  };

  return {
    hunterClass,
    role,
    currentSetAnalysis,
    slotAdvice,
    mageAdvice,
    rerollAdvice,
    recommendedSets: { S: resolvedTiers.S, A: resolvedTiers.A },
    overallGrade: grade,
    summary: gradeMsgs[grade],
  };
}
