// ═══════════════════════════════════════════════════════════════
// ANTI-CHEAT: Bounds Validation & Sanitization (Phase 1+)
// Duplicated constants from client — zero DB dependency
// Principle: SANITIZE (clamp), don't REJECT
// Includes HMAC integrity checksum for tamper detection
// ═══════════════════════════════════════════════════════════════

import crypto from 'node:crypto';

const ANTICHEAT_SECRET = process.env.ANTICHEAT_SECRET || process.env.AUTH_SECRET || 'beru-anticheat-v1';

// ─── Constants (from equipmentData.js lines 261-315) ─────────

const MAIN_STAT_VALUES = {
  hp_flat:         { base: 50,  perLevel: 30 },
  hp_pct:          { base: 5,   perLevel: 2.5 },
  atk_flat:        { base: 5,   perLevel: 3 },
  atk_pct:         { base: 5,   perLevel: 2.5 },
  def_pct:         { base: 5,   perLevel: 2.5 },
  def_flat:        { base: 3,   perLevel: 1.5 },
  spd_flat:        { base: 3,   perLevel: 1.5 },
  crit_rate:       { base: 3,   perLevel: 1.5 },
  crit_dmg:        { base: 5,   perLevel: 3 },
  res_flat:        { base: 3,   perLevel: 1.5 },
  int_flat:        { base: 3,   perLevel: 2 },
  int_pct:         { base: 3,   perLevel: 2 },
  fire_dmg_flat:   { base: 3,   perLevel: 2 },
  fire_dmg_pct:    { base: 3,   perLevel: 1.5 },
  water_dmg_flat:  { base: 3,   perLevel: 2 },
  water_dmg_pct:   { base: 3,   perLevel: 1.5 },
  shadow_dmg_flat: { base: 3,   perLevel: 2 },
  shadow_dmg_pct:  { base: 3,   perLevel: 1.5 },
  light_dmg_flat:  { base: 3,   perLevel: 2 },
  light_dmg_pct:   { base: 3,   perLevel: 1.5 },
  earth_dmg_flat:  { base: 3,   perLevel: 2 },
  earth_dmg_pct:   { base: 3,   perLevel: 1.5 },
};

// Sub-stat roll ranges [min, max] (from equipmentData.js lines 286-309)
const SUB_STAT_RANGES = {
  hp_flat: [15, 40], atk_flat: [2, 6], def_flat: [2, 5], spd_flat: [1, 4],
  crit_rate: [1, 4], crit_dmg: [2, 6], res_flat: [1, 3],
  hp_pct: [2, 5], atk_pct: [2, 5], def_pct: [2, 5],
  int_flat: [1, 4], int_pct: [2, 5],
  fire_dmg_flat: [1, 3], fire_dmg_pct: [2, 5],
  water_dmg_flat: [1, 3], water_dmg_pct: [2, 5],
  shadow_dmg_flat: [1, 3], shadow_dmg_pct: [2, 5],
  light_dmg_flat: [1, 3], light_dmg_pct: [2, 5],
  earth_dmg_flat: [1, 3], earth_dmg_pct: [2, 5],
};

const RARITY_MAX_SUBS = { rare: 2, legendaire: 3, mythique: 4 };
const VALID_RARITIES = new Set(['rare', 'legendaire', 'mythique']);
const VALID_SLOTS = new Set(['casque', 'plastron', 'gants', 'bottes', 'collier', 'bracelet', 'anneau', 'boucles']);

// All 29 valid set IDs (8 base + 8 raid + 5 ARC2 + 8 ultime)
const VALID_SETS = new Set([
  // Base (equipmentData.js line 8-65)
  'infamie_chaotique', 'volonte_de_fer', 'flamme_maudite', 'maree_eternelle',
  'ombre_souveraine', 'benediction_celeste', 'expertise_bestiale', 'eclat_angelique',
  // Raid (equipmentData.js line 71-143)
  'sacrifice_martyr', 'fureur_desespoir', 'chaines_destin', 'echo_temporel',
  'aura_commandeur', 'voile_ombre', 'source_arcanique', 'flamme_interieure',
  // ARC2 (equipmentData.js line 1346-1442)
  'toughness', 'burning_curse', 'burning_greed', 'iron_will', 'chaotic_infamy',
  // Ultime (equipmentData.js line 1448-1522)
  'rage_eternelle', 'gardien_celeste', 'siphon_vital', 'tempete_arcane',
  'equilibre_supreme', 'pacte_ombres', 'esprit_transcendant', 'resonance_arcanique',
]);

// ─── Constants (from colosseumCore.js lines 95-119) ──────────

const MAX_ARTIFACT_LEVEL = 20;
const MAX_INVENTORY = 1500;
const MAX_CHIBI_LEVEL = 140;
const POINTS_PER_LEVEL = 2;
const ACCOUNT_BONUS_AMOUNT = 10;
const MAX_STARS = 1000;
const MAX_WEAPON_AWAKENING = 100;
const MAX_HAMMER_COUNT = 10_000_000;

const VALID_HAMMER_KEYS = new Set([
  'marteau_forge', 'marteau_runique', 'marteau_celeste', 'marteau_rouge',
  'fragment_sulfuras', 'fragment_raeshalare', 'fragment_katana_z',
  'fragment_katana_v', 'fragment_guldan',
]);

const STAT_KEYS = ['hp', 'atk', 'def', 'spd', 'crit', 'res', 'mana'];

// Skill tree (colosseumCore.js lines 139-142)
const SP_INTERVAL = 5;          // 1 SP every 5 account levels
const TIER_COSTS = [1, 1, 2];   // cost per tier upgrade (max 3 tiers, 3 skills per chibi)
const MAX_SKILL_TIER = 3;
const SKILLS_PER_CHIBI = 3;

// Talent trees: 1 point per chibi level, max ~51 at lv60 (shared pool for T1+T2)
const MAX_TALENT_POINTS_PER_CHIBI = 60;

// AccountXp: max reasonable gain per save (generous — equiv ~8h of intense grinding)
const MAX_ACCOUNT_XP_DELTA = 2_000_000;

// ─── Account Level from XP (from colosseumCore.js lines 99-137) ──

function accountXpForLevel(lvl) {
  const base = 80 + lvl * 25;
  if (lvl <= 10000) return base;
  const over = lvl - 10000;
  return base + Math.floor(over * over * 0.5);
}

function accountLevelFromXp(totalXp) {
  if (!totalXp || totalXp < 0) return 0;
  let lvl = 0, spent = 0;
  while (true) {
    const need = accountXpForLevel(lvl + 1);
    if (spent + need > totalXp) break;
    spent += need;
    lvl++;
    if (lvl > 100000) break; // safety cap
  }
  return lvl;
}

// From colosseumCore.js lines 111-118
function accountAllocationsAtLevel(level) {
  if (level <= 1000) return Math.floor(level / 10);
  let allocs = 100;
  if (level <= 5000) return allocs + Math.floor((level - 1000) / 15);
  allocs += Math.floor(4000 / 15);
  if (level <= 10000) return allocs + Math.floor((level - 5000) / 25);
  allocs += Math.floor(5000 / 25);
  return allocs + Math.floor((level - 10000) / 30);
}

// ═══════════════════════════════════════════════════════════════
// VALIDATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// Max possible sub-stat value = initial max + 4 milestone upgrades + enchant
// Generous 10x multiplier to avoid false positives
function maxSubStatValue(statId) {
  const range = SUB_STAT_RANGES[statId];
  if (!range) return 9999; // unknown stat → don't block
  return Math.ceil(range[1] * 10);
}

export function validateArtifact(artifact) {
  if (!artifact || typeof artifact !== 'object') {
    return { valid: false, errors: ['artifact is null/invalid'], fixed: null };
  }
  const errors = [];
  const fixed = { ...artifact };

  // Level: clamp [0, MAX_ARTIFACT_LEVEL]
  if (typeof fixed.level !== 'number' || fixed.level < 0) {
    fixed.level = 0;
    errors.push(`level=${artifact.level}→0`);
  } else if (fixed.level > MAX_ARTIFACT_LEVEL) {
    errors.push(`level=${fixed.level}→${MAX_ARTIFACT_LEVEL}`);
    fixed.level = MAX_ARTIFACT_LEVEL;
  }

  // Rarity
  if (!VALID_RARITIES.has(fixed.rarity)) {
    errors.push(`rarity=${fixed.rarity}→rare`);
    fixed.rarity = 'rare';
  }

  // Main stat value: check against formula with 5% tolerance
  const statDef = MAIN_STAT_VALUES[fixed.mainStat];
  if (statDef && typeof fixed.mainValue === 'number') {
    const maxVal = statDef.base + statDef.perLevel * fixed.level;
    const tolerantMax = maxVal * 1.05;
    if (fixed.mainValue > tolerantMax) {
      errors.push(`mainValue=${fixed.mainValue}→${maxVal} (${fixed.mainStat} lv${fixed.level})`);
      fixed.mainValue = maxVal;
    }
  }

  // Sub-stat count
  const maxSubs = RARITY_MAX_SUBS[fixed.rarity] || 2;
  if (Array.isArray(fixed.subs) && fixed.subs.length > maxSubs) {
    errors.push(`subs.length=${fixed.subs.length}→${maxSubs}`);
    fixed.subs = fixed.subs.slice(0, maxSubs);
  }

  // Sub-stat values
  if (Array.isArray(fixed.subs)) {
    fixed.subs = fixed.subs.map((sub, i) => {
      if (!sub || typeof sub !== 'object') return sub;
      const cap = maxSubStatValue(sub.id);
      if (typeof sub.value === 'number' && sub.value > cap) {
        errors.push(`sub[${i}] ${sub.id}=${sub.value}→${cap}`);
        return { ...sub, value: cap };
      }
      return sub;
    });
  }

  return { valid: errors.length === 0, errors, fixed };
}

export function validateArtifactInventory(inventory) {
  if (!Array.isArray(inventory)) {
    return { errors: ['inventory is not array'], fixed: [] };
  }
  const errors = [];
  let fixed = inventory;

  // Cap size
  if (fixed.length > MAX_INVENTORY) {
    errors.push(`inventory.length=${fixed.length}→${MAX_INVENTORY}`);
    fixed = fixed.slice(-MAX_INVENTORY); // keep most recent
  }

  // Validate each artifact
  fixed = fixed.filter((art, i) => {
    if (!art || !art.uid) return false; // remove garbage
    const result = validateArtifact(art);
    if (!result.valid) {
      errors.push(...result.errors.map(e => `inv[${i}]: ${e}`));
    }
    return result.fixed !== null;
  }).map(art => {
    const { fixed: f } = validateArtifact(art);
    return f || art;
  });

  return { errors, fixed };
}

export function validateChibiLevels(chibiLevels) {
  if (!chibiLevels || typeof chibiLevels !== 'object') {
    return { errors: [], fixed: chibiLevels || {} };
  }
  const errors = [];
  const fixed = { ...chibiLevels };

  for (const [id, data] of Object.entries(fixed)) {
    if (!data || typeof data !== 'object') continue;
    const d = { ...data };
    let changed = false;

    if (typeof d.level === 'number' && d.level > MAX_CHIBI_LEVEL) {
      errors.push(`${id}.level=${d.level}→${MAX_CHIBI_LEVEL}`);
      d.level = MAX_CHIBI_LEVEL;
      changed = true;
    }
    if (typeof d.level === 'number' && d.level < 0) {
      d.level = 0;
      changed = true;
    }
    if (typeof d.stars === 'number' && d.stars > MAX_STARS) {
      errors.push(`${id}.stars=${d.stars}→${MAX_STARS}`);
      d.stars = MAX_STARS;
      changed = true;
    }
    if (typeof d.stars === 'number' && d.stars < 0) {
      d.stars = 0;
      changed = true;
    }
    if (typeof d.xp === 'number' && d.xp < 0) {
      d.xp = 0;
      changed = true;
    }

    if (changed) fixed[id] = d;
  }

  return { errors, fixed };
}

export function validateStatPoints(statPoints, chibiLevels) {
  if (!statPoints || typeof statPoints !== 'object') {
    return { errors: [], fixed: statPoints || {} };
  }
  const errors = [];
  const fixed = { ...statPoints };

  for (const [chibiId, stats] of Object.entries(fixed)) {
    if (!stats || typeof stats !== 'object') continue;
    const level = chibiLevels?.[chibiId]?.level || 1;
    const maxPoints = Math.max(0, (level - 1)) * POINTS_PER_LEVEL;

    let total = 0;
    for (const k of STAT_KEYS) {
      total += (stats[k] || 0);
    }

    if (total > maxPoints && total > 0) {
      errors.push(`${chibiId}: totalPts=${total} > max=${maxPoints} (lv${level})`);
      // Scale down proportionally
      const ratio = maxPoints / total;
      const s = { ...stats };
      for (const k of STAT_KEYS) {
        if (s[k]) s[k] = Math.floor(s[k] * ratio);
      }
      fixed[chibiId] = s;
    }
  }

  return { errors, fixed };
}

export function validateAccountBonuses(accountBonuses, accountLevel) {
  if (!accountBonuses || typeof accountBonuses !== 'object') {
    return { errors: [], fixed: accountBonuses || {} };
  }
  const errors = [];
  const fixed = { ...accountBonuses };

  const maxAllocations = accountAllocationsAtLevel(accountLevel);
  const maxTotalBonus = maxAllocations * ACCOUNT_BONUS_AMOUNT;

  let totalBonus = 0;
  for (const k of STAT_KEYS) {
    totalBonus += (fixed[k] || 0);
  }

  if (totalBonus > maxTotalBonus && totalBonus > 0) {
    errors.push(`totalBonus=${totalBonus} > max=${maxTotalBonus} (lv${accountLevel})`);
    const ratio = maxTotalBonus / totalBonus;
    for (const k of STAT_KEYS) {
      if (fixed[k]) fixed[k] = Math.floor(fixed[k] * ratio);
    }
  }

  return { errors, fixed };
}

export function validateHammers(hammers) {
  if (!hammers || typeof hammers !== 'object') {
    return { errors: [], fixed: hammers || {} };
  }
  const errors = [];
  const fixed = { ...hammers };

  for (const [key, val] of Object.entries(fixed)) {
    if (typeof val !== 'number') continue;
    if (val < 0) {
      fixed[key] = 0;
      errors.push(`${key}=${val}→0`);
    } else if (val > MAX_HAMMER_COUNT) {
      errors.push(`${key}=${val}→${MAX_HAMMER_COUNT}`);
      fixed[key] = MAX_HAMMER_COUNT;
    }
  }

  return { errors, fixed };
}

// ═══════════════════════════════════════════════════════════════
// SKILL TREE & TALENT TREE VALIDATION
// ═══════════════════════════════════════════════════════════════

export function validateSkillTree(skillTree, chibiLevels, accountLevel) {
  if (!skillTree || typeof skillTree !== 'object') {
    return { errors: [], fixed: skillTree || {} };
  }
  const errors = [];
  const fixed = { ...skillTree };
  const totalSP = Math.floor(accountLevel / SP_INTERVAL);

  for (const [chibiId, skills] of Object.entries(fixed)) {
    if (!skills || typeof skills !== 'object') continue;
    const s = { ...skills };
    let spSpent = 0;
    let changed = false;

    for (const [idx, tier] of Object.entries(s)) {
      const t = typeof tier === 'number' ? tier : 0;
      // Clamp tier to [0, MAX_SKILL_TIER]
      if (t > MAX_SKILL_TIER) {
        s[idx] = MAX_SKILL_TIER;
        errors.push(`${chibiId}.skill[${idx}]=${t}→${MAX_SKILL_TIER}`);
        changed = true;
      } else if (t < 0) {
        s[idx] = 0;
        changed = true;
      }
      // Sum SP cost: tier 1=1, tier 2=1+1=2, tier 3=1+1+2=4
      for (let i = 0; i < Math.min(s[idx], TIER_COSTS.length); i++) {
        spSpent += TIER_COSTS[i];
      }
    }

    // If too many SP spent across all chibis (checked globally below)
    if (changed) fixed[chibiId] = s;
  }

  // Global SP check: total SP spent across ALL chibis ≤ totalSP
  let globalSP = 0;
  for (const [, skills] of Object.entries(fixed)) {
    if (!skills || typeof skills !== 'object') continue;
    for (const tier of Object.values(skills)) {
      const t = typeof tier === 'number' ? Math.min(tier, MAX_SKILL_TIER) : 0;
      for (let i = 0; i < t; i++) globalSP += TIER_COSTS[i];
    }
  }
  if (globalSP > totalSP) {
    errors.push(`globalSP=${globalSP} > available=${totalSP} (accountLv${accountLevel})`);
    // Don't reset skill trees (too complex), just log as suspicious
  }

  return { errors, fixed };
}

export function validateTalentTrees(talentTree, talentTree2, chibiLevels) {
  if (!talentTree && !talentTree2) return { errors: [] };
  const errors = [];

  // For each chibi: total talent points (T1 + T2) ≤ max(chibiLevel, MAX_TALENT_POINTS_PER_CHIBI)
  const allChibiIds = new Set([
    ...Object.keys(talentTree || {}),
    ...Object.keys(talentTree2 || {}),
  ]);

  for (const chibiId of allChibiIds) {
    const level = chibiLevels?.[chibiId]?.level || 1;
    const maxPts = Math.min(level, MAX_TALENT_POINTS_PER_CHIBI);
    let totalPts = 0;

    // T1: talentTree[chibiId][treeId][nodeId] = rank
    const t1 = talentTree?.[chibiId];
    if (t1 && typeof t1 === 'object') {
      for (const treeNodes of Object.values(t1)) {
        if (!treeNodes || typeof treeNodes !== 'object') continue;
        for (const rank of Object.values(treeNodes)) {
          totalPts += (typeof rank === 'number' ? rank : 0);
        }
      }
    }

    // T2: talentTree2[chibiId][nodeId] = rank
    const t2 = talentTree2?.[chibiId];
    if (t2 && typeof t2 === 'object') {
      for (const rank of Object.values(t2)) {
        totalPts += (typeof rank === 'number' ? rank : 0);
      }
    }

    if (totalPts > maxPts) {
      errors.push(`${chibiId}: talentPts=${totalPts} > max=${maxPts} (lv${level})`);
    }
  }

  return { errors };
}

// ═══════════════════════════════════════════════════════════════
// HMAC INTEGRITY CHECKSUM — Tamper detection
// Client can't forge without server secret
// ═══════════════════════════════════════════════════════════════

function getCriticalFields(data) {
  // Only hash fields that matter for anti-cheat
  return {
    alk: data.alkahest || 0,
    axp: data.accountXp || 0,
    abn: JSON.stringify(data.accountBonuses || {}),
    hmr: JSON.stringify(data.hammers || {}),
    wpn: JSON.stringify(data.weaponCollection || {}),
  };
}

export function computeIntegrity(data) {
  const fields = getCriticalFields(data);
  const payload = JSON.stringify(fields);
  return crypto.createHmac('sha256', ANTICHEAT_SECRET).update(payload).digest('base64url');
}

export function verifyIntegrity(data) {
  if (!data._integrity) return { valid: true, reason: 'no_checksum' }; // first save
  const expected = computeIntegrity(data);
  try {
    const match = crypto.timingSafeEqual(
      Buffer.from(expected, 'utf8'),
      Buffer.from(data._integrity, 'utf8'),
    );
    return { valid: match, reason: match ? 'ok' : 'mismatch' };
  } catch {
    return { valid: false, reason: 'length_mismatch' };
  }
}

// ═══════════════════════════════════════════════════════════════
// PVP TEAM VALIDATION
// ═══════════════════════════════════════════════════════════════

export function validatePvpTeam(teamData, submittedPowerScore) {
  const errors = [];

  if (!Array.isArray(teamData) || teamData.length !== 6) {
    errors.push('teamData must be array of exactly 6 units');
    return { valid: false, errors };
  }

  // Check for duplicate IDs
  const ids = teamData.map(u => u?.hunterId || u?.id).filter(Boolean);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size < ids.length) {
    errors.push(`duplicate hunter IDs: ${ids.length} total, ${uniqueIds.size} unique`);
  }

  // Generous stat bounds (max-gear max-level with all bonuses)
  for (let i = 0; i < teamData.length; i++) {
    const unit = teamData[i];
    if (!unit) { errors.push(`unit ${i} is null`); continue; }
    if (typeof unit.hp === 'number' && unit.hp > 100000) errors.push(`unit[${i}].hp=${unit.hp} > 100k`);
    if (typeof unit.atk === 'number' && unit.atk > 50000) errors.push(`unit[${i}].atk=${unit.atk} > 50k`);
    if (typeof unit.def === 'number' && unit.def > 50000) errors.push(`unit[${i}].def=${unit.def} > 50k`);
  }

  // Power score sanity check
  if (typeof submittedPowerScore === 'number' && submittedPowerScore > 50000) {
    errors.push(`powerScore=${submittedPowerScore} > 50000`);
  }

  return { valid: errors.length === 0, errors };
}

// ═══════════════════════════════════════════════════════════════
// MAIN SANITIZER — Called from save.js CHECK 5
// ═══════════════════════════════════════════════════════════════

function logSuspicious(deviceId, type, details) {
  console.warn(`[anticheat] ${type} | ${deviceId} | ${JSON.stringify(details)}`);
}

export function sanitizeColoData(data, cloudData, deviceId) {
  const suspicious = [];
  const d = { ...data };

  // 0. INTEGRITY CHECK: verify cloud data wasn't tampered between saves
  if (cloudData) {
    const integrity = verifyIntegrity(cloudData);
    if (!integrity.valid && integrity.reason !== 'no_checksum') {
      suspicious.push(`INTEGRITY_TAMPERED: ${integrity.reason}`);
      // Force critical fields from cloud (the last server-validated state)
      // The cloudData's checksum was set by the server, so if it doesn't match,
      // someone modified localStorage critical fields between saves
    }
  }

  // 1. ALKAHEST: client can NEVER increase — only server endpoints modify
  if (cloudData) {
    const cloudAlk = cloudData.alkahest || 0;
    const incomingAlk = d.alkahest || 0;
    if (incomingAlk > cloudAlk) {
      suspicious.push(`alkahest: ${incomingAlk}→${cloudAlk}`);
      d.alkahest = cloudAlk;
    }
  }

  // 1b. ACCOUNT XP: cap delta to prevent instant inflation
  if (cloudData && typeof d.accountXp === 'number') {
    const cloudXp = cloudData.accountXp || 0;
    const delta = d.accountXp - cloudXp;
    if (delta > MAX_ACCOUNT_XP_DELTA) {
      suspicious.push(`accountXp: delta=${delta} > max=${MAX_ACCOUNT_XP_DELTA}, clamped`);
      d.accountXp = cloudXp + MAX_ACCOUNT_XP_DELTA;
    }
    if (d.accountXp < 0) d.accountXp = 0;
  }

  // 2. CHIBI LEVELS: clamp to 140, stars to 1000
  if (d.chibiLevels && typeof d.chibiLevels === 'object') {
    const { errors, fixed } = validateChibiLevels(d.chibiLevels);
    if (errors.length) {
      suspicious.push(...errors.map(e => `chibiLevels: ${e}`));
      d.chibiLevels = fixed;
    }
  }

  // 3. STAT POINTS: total per chibi ≤ (level-1) × 2
  if (d.statPoints && typeof d.statPoints === 'object') {
    const { errors, fixed } = validateStatPoints(d.statPoints, d.chibiLevels || {});
    if (errors.length) {
      suspicious.push(...errors.map(e => `statPoints: ${e}`));
      d.statPoints = fixed;
    }
  }

  // 4. ACCOUNT BONUSES: total ≤ allocations(level) × 10
  if (d.accountBonuses && typeof d.accountBonuses === 'object') {
    const accountLevel = accountLevelFromXp(d.accountXp || 0);
    const { errors, fixed } = validateAccountBonuses(d.accountBonuses, accountLevel);
    if (errors.length) {
      suspicious.push(...errors.map(e => `accountBonuses: ${e}`));
      d.accountBonuses = fixed;
    }
  }

  // 5. ARTIFACT INVENTORY: validate each, cap at 1500
  if (d.artifactInventory && Array.isArray(d.artifactInventory)) {
    const { errors, fixed } = validateArtifactInventory(d.artifactInventory);
    if (errors.length) {
      suspicious.push(...errors.map(e => `inventory: ${e}`));
      d.artifactInventory = fixed;
    }
  }

  // 6. EQUIPPED ARTIFACTS: validate each slot
  if (d.artifacts && typeof d.artifacts === 'object') {
    for (const [chibiId, slots] of Object.entries(d.artifacts)) {
      if (!slots || typeof slots !== 'object') continue;
      for (const [slotId, art] of Object.entries(slots)) {
        if (!art) continue;
        const { errors, fixed } = validateArtifact(art);
        if (errors.length) {
          suspicious.push(...errors.map(e => `equipped[${chibiId}][${slotId}]: ${e}`));
          d.artifacts[chibiId][slotId] = fixed;
        }
      }
    }
  }

  // 7. HAMMERS: clamp to MAX_HAMMER_COUNT
  if (d.hammers && typeof d.hammers === 'object') {
    const { errors, fixed } = validateHammers(d.hammers);
    if (errors.length) {
      suspicious.push(...errors.map(e => `hammers: ${e}`));
      d.hammers = fixed;
    }
  }

  // 8. WEAPON COLLECTION: awakening clamp [0, MAX_WEAPON_AWAKENING]
  if (d.weaponCollection && typeof d.weaponCollection === 'object') {
    for (const [wId, awk] of Object.entries(d.weaponCollection)) {
      if (typeof awk !== 'number') continue;
      if (awk < 0) {
        d.weaponCollection[wId] = 0;
        suspicious.push(`weapon[${wId}]: ${awk}→0`);
      } else if (awk > MAX_WEAPON_AWAKENING) {
        suspicious.push(`weapon[${wId}]: ${awk}→${MAX_WEAPON_AWAKENING}`);
        d.weaponCollection[wId] = MAX_WEAPON_AWAKENING;
      }
    }
  }

  // 9. SKILL TREE: SP spent ≤ floor(accountLevel / 5)
  if (d.skillTree && typeof d.skillTree === 'object') {
    const accountLevel = accountLevelFromXp(d.accountXp || 0);
    const { errors, fixed } = validateSkillTree(d.skillTree, d.chibiLevels || {}, accountLevel);
    if (errors.length) {
      suspicious.push(...errors.map(e => `skillTree: ${e}`));
      d.skillTree = fixed;
    }
  }

  // 10. TALENT TREES: total points (T1+T2) ≤ min(chibiLevel, 60) per chibi
  {
    const { errors } = validateTalentTrees(
      d.talentTree, d.talentTree2, d.chibiLevels || {}
    );
    if (errors.length) {
      suspicious.push(...errors.map(e => `talentTree: ${e}`));
      // Don't reset (too complex), just log — the capped chibi levels limit damage
    }
  }

  // 11. STAMP INTEGRITY: HMAC of critical fields — client can't forge
  d._integrity = computeIntegrity(d);

  // Log all suspicious activity
  if (suspicious.length > 0) {
    logSuspicious(deviceId, 'SANITIZE_COLO', {
      count: suspicious.length,
      details: suspicious.slice(0, 20),
    });
  }

  return { data: d, suspicious };
}
