// 🎯 ARTIFACT OPTIMIZER ENGINE
// Calculates optimal artifact distribution for each character based on their buff totals
// Focus: Manticore (Level 80)

import { statConversionsWithEnemy, newDefPenFormula } from './statConversions';

// ═══════════════════════════════════════════════════════════════
// ARTIFACT SYSTEM CONSTANTS
// ═══════════════════════════════════════════════════════════════

// Main stat values at +20
const MAINSTAT_VALUES = {
    'ATK%': 27.75, 'DEF%': 27.75, 'HP%': 27.75,
    'ATK flat': 2995, 'DEF flat': 2995, 'HP flat': 5990,
    'CritDMG': 6990, 'DefPen': 6990, 'Additional MP': 1305,
};

// Substat value ranges per roll (initial + each upgrade)
const SUBSTAT_RANGES = {
    critRate:   { min: 1595, max: 1890, avg: 1742 },
    critDMG:    { min: 1595, max: 1890, avg: 1742 },
    defPen:     { min: 1595, max: 1890, avg: 1742 },
    atkFlat:    { min: 687, max: 828, avg: 757 },
    defFlat:    { min: 687, max: 828, avg: 757 },
    hpFlat:     { min: 1387, max: 1650, avg: 1518 },
    'atk%':     { min: 5.95, max: 7.15, avg: 6.55 },
    'def%':     { min: 5.95, max: 7.15, avg: 6.55 },
    'hp%':      { min: 5.95, max: 7.15, avg: 6.55 },
    addMP:      { min: 165, max: 195, avg: 180 },
    mpcr:       { min: 330, max: 395, avg: 362 },
    di:         { min: 1595, max: 1890, avg: 1742 },
};

// Enchant values (bonus applied on top of substats, 1 per piece)
const ENCHANT_VALUES = {
    'ATK%': 1.6, 'DEF%': 1.6, 'HP%': 1.6,
    'ATK flat': 350, 'DEF flat': 350, 'HP flat': 700,
    'Crit Rate': 1060, 'Crit DMG': 1060,
    'DMG Increase': 1060, 'Def Pen': 1060,
    'MPCR': 210, 'Additional MP': 110,
};

// Slots configuration
const SLOTS = {
    left: ['helmet', 'armor', 'gloves', 'boots'],
    right: ['necklace', 'bracelet', 'ring', 'earrings'],
};

// Available main stats per slot
const SLOT_MAINSTATS = {
    helmet:   ['ATK%', 'DEF%', 'HP%', 'ATK flat', 'DEF flat', 'HP flat'],
    armor:    ['DEF flat', 'DEF%'],
    gloves:   ['ATK%', 'ATK flat'],
    boots:    ['DEF%', 'HP%', 'CritDMG', 'DefPen'],
    necklace: ['HP flat', 'HP%'],
    bracelet: [], // Elemental DMG% only — no stat budget for optimizer
    ring:     ['ATK%', 'DEF%', 'HP%', 'ATK flat', 'DEF flat', 'HP flat'],
    earrings: [], // Additional MP only — fixed
};

// Characters that need MP management
const MP_HUNGRY_CHARACTERS = new Set([
    'mirei', 'fern', 'seorin', 'alicia', 'meri', 'laine'
]);

// ═══════════════════════════════════════════════════════════════
// GEMS + CORES BASELINE (high-level account, all maxed)
// ═══════════════════════════════════════════════════════════════
const BASELINE = {
    gems: {
        'atk%': 60, 'def%': 60, 'hp%': 60,
        defPen: 6755, precision: 9000, mpcr: 1540, addMP: 600,
    },
    // Each hunter has 3 cores, each with 2 fixed main stats + 1 choosable substat
    // The 3 cores relevant to the scaler are: ScaleStat%, ScaleStatFlat, + 1 other
    // Each core's fixed stats include DefPen 7289 (except DEF flat core which has AddMP 1285)
    cores: {
        'atk%': 58.49, 'def%': 58.49, 'hp%': 58.49,
        atkFlat: 6023, defFlat: 6023, hpFlat: 12046,
        // DefPen from core main stats depends on which 3 cores are equipped
        // Typical: 2-3 cores have DefPen as main stat = 14,578 - 21,867 raw
        defPenPerCore: 7289,
        addMP: 1285,         // DEF flat core has Additional MP
    },
    // Core substat values (1 substat per core × 3 cores)
    coreSubstat: {
        critRate: 7289,      // Per core
        critDMG: 7289,
        damageIncrease: 7289,
        defPen: 7289,
        addMP: 1285,
        mpcr: 2341,
    },
};

// ═══════════════════════════════════════════════════════════════
// CONVERSION FORMULAS (Manticore LV80)
// ═══════════════════════════════════════════════════════════════

const getConversionParams = (enemyLevel = 80) => {
    const L = enemyLevel;
    const e = Math.E;

    // TC baseResist
    const levelDiff = L - 60;
    const baseResist = -19.015 * Math.pow(levelDiff, 2) + 1493.45 * levelDiff + 5000;

    // DCC params
    const K = 0.55 + 0.91 / (2 + 0.00008 * Math.pow(e, 0.1315 * L));
    const B = 1100 - 5300 / (1 + 60000 * Math.pow(e, -0.136 * L));
    const M = 2000 - 2500 / (1 + 51500 * Math.pow(e, -0.132 * L));

    return { baseResist, K, B, M, L };
};

// Raw → % conversions
const rawToPercent = {
    critRate: (raw, params) => 5 + (raw / (raw + params.baseResist)) * 100,
    critDMG: (raw, params) => Math.max(50, params.K * (raw + params.B) / (0.4 * raw + params.M) * 100),
    defPen: (raw, params) => (raw * 100) / (raw + params.L * 1000),
    di: (raw, params) => (raw * 100) / (raw + params.L * 1000),
};

// % → Raw inversions
const percentToRaw = {
    critRate: (pct, params) => {
        const t = pct / 100;
        if (t >= 1.05) return Infinity;
        return Math.max(0, Math.round(params.baseResist * (t - 0.05) / (1.05 - t)));
    },
    critDMG: (pct, params) => {
        // pct is the bonus % (code value, not in-game), e.g. 150 means 250% in-game
        const t = pct / 100;
        const denom = t * 0.4 - params.K;
        if (denom >= 0) return Infinity; // Unreachable
        return Math.max(0, Math.round((params.K * params.B - t * params.M) / denom));
    },
    defPen: (pct, params) => {
        if (pct >= 100) return Infinity;
        return Math.max(0, Math.round(params.L * 1000 * pct / (100 - pct)));
    },
    di: (pct, params) => {
        if (pct >= 100) return Infinity;
        return Math.max(0, Math.round(params.L * 1000 * pct / (100 - pct)));
    },
};

// ═══════════════════════════════════════════════════════════════
// MANTICORE SWEET SPOTS (target % values)
// ═══════════════════════════════════════════════════════════════

const MANTICORE_TARGETS = {
    // DPS class targets — CR is king, CD second, DefPen/DI mostly covered by gems+cores
    DPS: {
        critRate: { ideal: 95, min: 85, absolute_max: 100 },
        critDMG: { ideal: 200, min: 180 },      // In-game display (150% code = 250% ingame)
        defPen: { ideal: 38, min: 30 },          // ~35% from gems+cores baseline already
        di: { ideal: 38, min: 30 },
    },
    // Elementalist targets (overload chargers — slightly less CR needed)
    Elementalist: {
        critRate: { ideal: 90, min: 80, absolute_max: 100 },
        critDMG: { ideal: 190, min: 175 },
        defPen: { ideal: 35, min: 28 },
        di: { ideal: 35, min: 28 },
    },
    // Breaker targets — focus on break, less on pure DPS stats
    Breaker: {
        critRate: { ideal: 85, min: 75, absolute_max: 100 },
        critDMG: { ideal: 180, min: 165 },
        defPen: { ideal: 30, min: 25 },
        di: { ideal: 30, min: 25 },
    },
    // Support targets — just enough to contribute, focus on scaling stat
    Support: {
        critRate: { ideal: 75, min: 60, absolute_max: 100 },
        critDMG: { ideal: 170, min: 155 },
        defPen: { ideal: 25, min: 20 },
        di: { ideal: 25, min: 20 },
    },
};

// Map character class to target profile
const getClassProfile = (charClass) => {
    const classMap = {
        'Assassin': 'DPS', 'Fighter': 'DPS', 'Mage': 'DPS', 'Ranger': 'DPS',
        'Breaker': 'Breaker',
        'Healer': 'Support', 'Supporter': 'Support', 'Tank': 'Support',
    };
    return classMap[charClass] || 'DPS';
};

// ═══════════════════════════════════════════════════════════════
// OPTIMIZER CORE
// ═══════════════════════════════════════════════════════════════

/**
 * Compute optimal artifact recommendations for a character
 * @param {Object} params
 * @param {string} params.characterId - Character ID
 * @param {Object} params.buffTotals - Current buff totals from Theorycraft (% values)
 *   { critRate, critDMG, defPen, attack, defense, hp, damageIncrease, damageTaken, basicSkillDamage, ... }
 * @param {string} params.scaleStat - 'Attack' | 'Defense' | 'HP'
 * @param {string} params.charClass - Character class from characters.js
 * @param {number} params.enemyLevel - Enemy level (default 80 for Manticore)
 * @returns {Object} Optimization results
 */
export const computeArtifactOptimization = ({
    characterId,
    buffTotals = {},
    scaleStat = 'Attack',
    charClass = 'Fighter',
    enemyLevel = 80,
}) => {
    const params = getConversionParams(enemyLevel);
    const profile = getClassProfile(charClass);
    const classTargets = MANTICORE_TARGETS[profile];
    const needsMP = MP_HUNGRY_CHARACTERS.has(characterId);
    const isSung = characterId === 'sung' || characterId === 'jinwoo';

    // Current buff %s (from Theorycraft: team synergies, sets, advancements, weapons)
    const currentBuffCR = buffTotals.critRate || 0;
    const currentBuffCD = buffTotals.critDMG || 0;
    const currentBuffDP = buffTotals.defPen || 0;
    const currentBuffDI = buffTotals.damageIncrease || 0;

    // ─── Step 1: DYNAMIC TARGETS based on buffs ───
    // Max realistic raw CR from artifacts = 18,000 (hard cap on efficiency)
    const MAX_ARTIFACT_RAW_CR = 18000;
    const maxCRFromArtifacts = parseFloat(statConversionsWithEnemy.tc.toPercent(MAX_ARTIFACT_RAW_CR, enemyLevel)) - 5;
    // Real achievable CR = buffs + what 18K raw gives
    const reachableCR = Math.min(100, currentBuffCR + maxCRFromArtifacts);

    // Dynamic CR target: min of class ideal and what's actually reachable
    const dynamicCRTarget = Math.min(classTargets.critRate.ideal, Math.floor(reachableCR));
    const dynamicCRMin = Math.min(classTargets.critRate.min, Math.floor(reachableCR * 0.85));

    // DefPen: gems+cores baseline already ~35% at LV80, Manticore doesn't need much more
    const dynamicDPTarget = classTargets.defPen.ideal;
    const dynamicDPMin = classTargets.defPen.min;

    // CritDMG: dynamic based on how much CD% the character already gets from buffs
    // If lots of CD buffs (>30%) → raw target 180-195% (avg 187.5%), don't over-invest
    // If few CD buffs (<30%) → raw target 190-205% (avg 197.5%), need more from artifacts
    const hasManyCDBuffs = currentBuffCD > 30;
    const cdRawTarget = hasManyCDBuffs ? 187.5 : 197.5;  // Target for RAW contribution (in-game %)
    const cdRawMin = hasManyCDBuffs ? 180 : 190;
    // Total = raw + buffs. The "ideal" shown is the total including buffs
    const dynamicCDTarget = Math.round(cdRawTarget + currentBuffCD);
    const dynamicCDMin = Math.round(cdRawMin + currentBuffCD);

    // DI: same formula as DefPen, mostly covered by gems+cores
    const dynamicDITarget = classTargets.di.ideal;
    const dynamicDIMin = classTargets.di.min;

    const targets = {
        critRate: { ideal: dynamicCRTarget, min: dynamicCRMin, absolute_max: 100 },
        critDMG: { ideal: dynamicCDTarget, min: dynamicCDMin },
        defPen: { ideal: dynamicDPTarget, min: dynamicDPMin },
        di: { ideal: dynamicDITarget, min: dynamicDIMin },
    };

    // ─── Step 2: Calculate what raw artifacts need to provide ───
    // CR: how much raw to reach dynamic target
    const rawNeededCR = Math.min(MAX_ARTIFACT_RAW_CR, Math.max(0,
        percentToRaw.critRate(dynamicCRTarget, params)
    ));

    // CD: target in code = in-game - 100 + 50 (base 50% in code)
    const cdTargetCode = dynamicCDTarget - 100 + 50;
    const rawNeededCD = Math.max(0, percentToRaw.critDMG(cdTargetCode, params));

    // DefPen & DI
    const rawNeededDP = Math.max(0, percentToRaw.defPen(dynamicDPTarget, params) - percentToRaw.defPen(currentBuffDP, params));

    // ─── Step 3: Boots mainstat ───
    // DEF/HP scalers → scaling stat %. ATK scalers → CritDMG (since CD benefits most from raw)
    const scaleStatKey = scaleStat === 'Attack' ? 'ATK%' : scaleStat === 'Defense' ? 'DEF%' : 'HP%';
    let bootsMainStat;

    if (scaleStat === 'Defense' || scaleStat === 'HP') {
        // DEF/HP scalers: boots = scaling stat % (27.75% is huge)
        bootsMainStat = scaleStatKey;
    } else {
        // ATK scalers: boots = CritDMG (6990 raw) since CD needs raw from artifacts
        bootsMainStat = 'CritDMG';
    }

    // ─── Step 4: Main stats per slot ───
    // For each slot, pick best mainstat respecting slot constraints
    const getBestMainStat = (slot) => {
        const available = SLOT_MAINSTATS[slot];
        if (!available || available.length === 0) {
            // Fixed slots
            if (slot === 'bracelet') return 'Elem DMG%';
            if (slot === 'earrings') return 'Additional MP';
            return '';
        }
        // Prefer scaling stat % if available, then scaling stat flat, then best alternative %
        if (available.includes(scaleStatKey)) return scaleStatKey;
        // Gloves only have ATK%/ATK flat — pick ATK% (always better as mainstat)
        const percentOptions = available.filter(s => s.endsWith('%'));
        if (percentOptions.length > 0) return percentOptions[0]; // Best % available
        return available[0]; // Fallback to first option (flat)
    };

    const mainStats = {
        helmet: getBestMainStat('helmet'),
        armor: getBestMainStat('armor'),  // DEF flat or DEF%
        gloves: getBestMainStat('gloves'), // ATK% or ATK flat (always ATK%)
        boots: bootsMainStat,
        necklace: getBestMainStat('necklace'), // HP flat or HP%
        bracelet: 'Elem DMG%',   // Forced
        ring: scaleStatKey,
        earrings: 'Additional MP', // Forced
    };

    // ─── Step 5: Substat budget (realistic: ~1.5 rolls avg per stat per piece) ───
    const avgRollsPerStat = 1.5; // Realistic (not max, not min)
    const crPerPiece = SUBSTAT_RANGES.critRate.avg * avgRollsPerStat;
    const cdPerPiece = SUBSTAT_RANGES.critDMG.avg * avgRollsPerStat;

    // LEFT: 4 pieces with CritRate sub, RIGHT: 4 pieces with CritDMG sub
    const estimatedRawCR = Math.min(MAX_ARTIFACT_RAW_CR, 4 * crPerPiece);
    const estimatedRawCD = 4 * cdPerPiece + (bootsMainStat === 'CritDMG' ? 6990 : 0);

    // ─── Step 6: Estimated final stats ───
    const estimatedCRFromRaw = parseFloat(statConversionsWithEnemy.tc.toPercent(estimatedRawCR, enemyLevel)) - 5;
    const estimatedTotalCR = Math.min(100, currentBuffCR + estimatedCRFromRaw);

    const estimatedTotalCDCode = parseFloat(statConversionsWithEnemy.dcc.toPercent(estimatedRawCD, enemyLevel));
    const estimatedTotalCDInGame = 100 + estimatedTotalCDCode + currentBuffCD;

    const estimatedTotalDP = currentBuffDP; // DefPen mostly from gems+cores, minimal artifact investment needed

    // ─── Step 7: Substat priorities ───
    // Scaling stat is ALWAYS #1 — no cap, linear scaling, always valuable
    // CR/CD are #2 — important but diminishing returns
    // DefPen #3 only if below target
    const buildSubstatPriority = (side) => {
        const priorities = [];
        const scaleStatSub = scaleStat === 'Attack' ? 'ATK%' : scaleStat === 'Defense' ? 'DEF%' : 'HP%';
        const scaleStatFlat = scaleStat === 'Attack' ? 'ATK flat' : scaleStat === 'Defense' ? 'DEF flat' : 'HP flat';
        const preferPercent = isSung; // Sung prefers % over flat for ATK

        // 1. Scaling stat — ALWAYS priority #1
        if (preferPercent) {
            priorities.push({ stat: scaleStatSub, importance: 'high' });
            priorities.push({ stat: scaleStatFlat, importance: 'high' });
        } else {
            priorities.push({ stat: scaleStatFlat, importance: 'high' });
            priorities.push({ stat: scaleStatSub, importance: 'high' });
        }

        if (side === 'left') {
            // 2. CritRate — LEFT side only
            priorities.push({ stat: 'Crit Rate', importance: 'medium' });
        } else {
            // 2. CritDMG — RIGHT side only
            priorities.push({ stat: 'Crit DMG', importance: 'medium' });
        }

        // 3. DefPen only if below target
        if (currentBuffDP < dynamicDPTarget) {
            priorities.push({ stat: 'Def Pen', importance: 'low' });
        }

        if (needsMP) {
            priorities.push({ stat: 'MPCR', importance: 'medium' });
            priorities.push({ stat: 'Additional MP', importance: 'low' });
        }

        return priorities;
    };

    // ─── Step 8: Status per stat ───
    const getStatStatus = (current, target) => {
        if (current >= target.ideal) return { status: 'optimal', pct: 100, color: '#22c55e', label: 'Optimal' };
        if (current >= target.min) {
            const pct = ((current - target.min) / (target.ideal - target.min)) * 100;
            return { status: 'good', pct: Math.round(Math.min(95, pct)), color: '#84cc16', label: 'Bon' };
        }
        if (current >= target.min * 0.7) {
            return { status: 'improving', pct: Math.round((current / target.min) * 70), color: '#f59e0b', label: 'À améliorer' };
        }
        return { status: 'low', pct: Math.round(Math.max(10, (current / target.min) * 50)), color: '#ef4444', label: 'Insuffisant' };
    };

    const crStatus = getStatStatus(estimatedTotalCR, targets.critRate);
    const cdStatus = getStatStatus(estimatedTotalCDInGame, targets.critDMG);
    const dpStatus = getStatStatus(estimatedTotalDP, targets.defPen);
    const diStatus = getStatStatus(currentBuffDI, targets.di);

    // ─── Step 9: Sweet spots ───
    const sweetSpots = {
        critRate: {
            current: currentBuffCR,
            fromArtifacts: estimatedCRFromRaw,
            estimated: estimatedTotalCR,
            target: dynamicCRTarget,
            min: dynamicCRMin,
            rawRecommended: Math.round(estimatedRawCR),
            maxRaw: MAX_ARTIFACT_RAW_CR,
            status: crStatus,
        },
        critDMG: {
            current: currentBuffCD,
            fromArtifacts: cdRawTarget,
            estimated: dynamicCDTarget,
            target: dynamicCDTarget,
            min: dynamicCDMin,
            rawRecommended: Math.round(estimatedRawCD),
            status: cdStatus,
            note: hasManyCDBuffs ? 'Bcp de buffs CD → raw 180-195%' : 'Peu de buffs CD → raw 190-205%',
        },
        defPen: {
            current: currentBuffDP,
            fromArtifacts: 0,
            estimated: currentBuffDP,
            target: dynamicDPTarget,
            min: dynamicDPMin,
            rawRecommended: 0,
            status: dpStatus,
            note: 'Gems + Cores couvrent ~35%',
        },
        di: {
            current: currentBuffDI,
            fromArtifacts: 0,
            estimated: currentBuffDI,
            target: dynamicDITarget,
            min: dynamicDIMin,
            rawRecommended: 0,
            status: diStatus,
            note: 'Gems + Cores couvrent la majorité',
        },
    };

    // ─── Step 10: Overall score ───
    const avgPct = (crStatus.pct + cdStatus.pct + dpStatus.pct + diStatus.pct) / 4;
    const overallStatus = avgPct >= 90 ? 'optimal' : avgPct >= 70 ? 'good' : avgPct >= 50 ? 'improving' : 'low';
    const overallColor = avgPct >= 90 ? '#22c55e' : avgPct >= 70 ? '#84cc16' : avgPct >= 50 ? '#f59e0b' : '#ef4444';

    return {
        profile,
        targets,
        mainStats,
        bootsMainStat,
        substatPriority: {
            left: buildSubstatPriority('left'),
            right: buildSubstatPriority('right'),
        },
        sweetSpots,
        overall: {
            percentage: Math.round(avgPct),
            status: overallStatus,
            color: overallColor,
        },
        needsMP,
        mpBudget: needsMP ? { additionalMP: 3000, mpcr: 4500 } : null,
    };
};

// ═══════════════════════════════════════════════════════════════
// SUBSTAT VALUE COMPARISON (% vs flat for scaling stat)
// ═══════════════════════════════════════════════════════════════

/**
 * Compare ATK% vs ATK flat substat value
 * For most hunters: flat > % because base ATK isn't high enough
 * For Sung: % > flat because of high base + weapon
 */
export const compareScaleStatSubs = (baseStatValue, scaleStat = 'Attack') => {
    // Average substat values per roll
    const percentAvg = SUBSTAT_RANGES[scaleStat === 'Attack' ? 'atk%' : scaleStat === 'Defense' ? 'def%' : 'hp%'].avg;
    const flatAvg = scaleStat === 'HP' ? SUBSTAT_RANGES.hpFlat.avg : SUBSTAT_RANGES[scaleStat === 'Attack' ? 'atkFlat' : 'defFlat'].avg;

    // % value in absolute terms: base * percent / 100
    const percentAbsolute = baseStatValue * percentAvg / 100;

    // Max roll comparison (5 rolls total)
    const percentMax5 = baseStatValue * percentAvg * 5 / 100;
    const flatMax5 = flatAvg * 5;

    return {
        percentPerRoll: percentAbsolute,
        flatPerRoll: flatAvg,
        preferPercent: percentAbsolute > flatAvg,
        percentMax: percentMax5,
        flatMax: flatMax5,
        summary: percentAbsolute > flatAvg
            ? `${scaleStat}% preferred (+${percentAbsolute.toFixed(0)} vs +${flatAvg.toFixed(0)} flat)`
            : `${scaleStat} flat preferred (+${flatAvg.toFixed(0)} vs +${percentAbsolute.toFixed(0)} from %)`,
    };
};

// ═══════════════════════════════════════════════════════════════
// FULL ARTIFACT SET CALCULATOR (8 pieces, per-piece detail)
// ═══════════════════════════════════════════════════════════════

// Proc tiers = roll QUALITY only. All upgrades ALWAYS go to priority sub (optimal distribution).
// 5 rolls on priority (1 initial + 4 upgrades), 1 roll on others (initial only).
// LOW = min roll values, MID = avg roll values, HIGH = max roll values.
const PROC_TIERS = {
    low:  { rollQuality: 'min', label: 'Low',  priorityRolls: 5, otherRolls: 1 },
    mid:  { rollQuality: 'avg', label: 'Mid',  priorityRolls: 5, otherRolls: 1 },
    high: { rollQuality: 'max', label: 'High', priorityRolls: 5, otherRolls: 1 },
};

const SLOT_NAMES = {
    helmet: 'Helmet', armor: 'Armor', gloves: 'Gloves', boots: 'Boots',
    necklace: 'Necklace', bracelet: 'Bracelet', ring: 'Ring', earrings: 'Earrings',
};

/**
 * Compute a full optimal 8-piece artifact set for a character
 * @returns {{ pieces: Array, totals: { low, mid, high } }}
 */
export const computeOptimalArtifactSet = ({
    characterId,
    buffTotals = {},
    scaleStat = 'Attack',
    charClass = 'Fighter',
    element = 'Fire',
    enemyLevel = 80,
    needsMP = false,
}) => {
    const isSung = characterId === 'sung' || characterId === 'jinwoo';
    const scaleKey = scaleStat === 'Attack' ? 'ATK' : scaleStat === 'Defense' ? 'DEF' : 'HP';
    const scalePercent = `${scaleKey}%`;
    const scaleFlat = `${scaleKey} flat`;

    // Substat keys based on scale stat
    const scalePercentRange = SUBSTAT_RANGES[scaleKey.toLowerCase() + '%'] || SUBSTAT_RANGES['atk%'];
    const scaleFlatRange = scaleStat === 'HP' ? SUBSTAT_RANGES.hpFlat : SUBSTAT_RANGES[scaleKey.toLowerCase() + 'Flat'] || SUBSTAT_RANGES.atkFlat;

    // Determine best mainstat for each slot
    const getBestMain = (slot) => {
        const available = SLOT_MAINSTATS[slot];
        if (!available || available.length === 0) {
            if (slot === 'bracelet') return { stat: `${element} DMG%`, value: 16.38, isElemDmg: true };
            if (slot === 'earrings') return { stat: 'Additional MP', value: MAINSTAT_VALUES['Additional MP'] };
            return { stat: '—', value: 0 };
        }
        // If scaling stat % is available, always pick it (best value for the scaling stat)
        if (available.includes(scalePercent)) return { stat: scalePercent, value: MAINSTAT_VALUES[scalePercent] };
        // If it's NOT the scaling stat, prefer flat over % (base stats are low → flat gives more BP)
        const flats = available.filter(s => !s.endsWith('%'));
        if (flats.length > 0) return { stat: flats[0], value: MAINSTAT_VALUES[flats[0]] || 0 };
        // Fallback to % if no flat available
        return { stat: available[0], value: MAINSTAT_VALUES[available[0]] || 0 };
    };

    // Boots special: DEF/HP scalers → scaling%, ATK scalers → CritDMG
    const getBootsMain = () => {
        if (scaleStat === 'Defense') return { stat: 'DEF%', value: 27.75 };
        if (scaleStat === 'HP') return { stat: 'HP%', value: 27.75 };
        return { stat: 'CritDMG', value: 6990, isRaw: true };
    };

    // Build 4 optimal substats for a slot
    // PHILOSOPHY: scaling stat is ALWAYS #1 priority on EVERY piece (no cap, linear value)
    // CR/CD/DefPen/DI only fill remaining slots to hit minimum thresholds
    // Once thresholds are met by gems+cores+passifs, those slots become MORE scaling stat
    const getSubstats = (slot, mainStat) => {
        const isLeft = SLOTS.left.includes(slot);
        const mainBlocks = mainStat.stat; // Can't duplicate mainstat as substat
        const subs = [];

        // === SCALING STAT: always priority, both flat and % if possible ===
        // flat is priority #1 for all except Sung (who prefers %)
        if (isSung) {
            if (mainBlocks !== scalePercent) subs.push({ id: scalePercent, range: scalePercentRange, isPercent: true, priority: 1 });
            if (mainBlocks !== scaleFlat) subs.push({ id: scaleFlat, range: scaleFlatRange, priority: 2 });
        } else {
            if (mainBlocks !== scaleFlat) subs.push({ id: scaleFlat, range: scaleFlatRange, priority: 1 });
            if (mainBlocks !== scalePercent) subs.push({ id: scalePercent, range: scalePercentRange, isPercent: true, priority: 2 });
        }

        // === CR or CD: needed to hit thresholds, LEFT=CR, RIGHT=CD ===
        if (isLeft) {
            subs.push({ id: 'Crit Rate', range: SUBSTAT_RANGES.critRate, priority: 3 });
        } else {
            subs.push({ id: 'Crit DMG', range: SUBSTAT_RANGES.critDMG, priority: 3 });
        }

        // === Fill remaining slots to always have exactly 4 substats ===
        const addIfNotPresent = (id, range, isPercent = false) => {
            if (subs.length >= 4) return;
            if (subs.find(s => s.id === id)) return;
            subs.push({ id, range, isPercent, priority: subs.length + 1 });
        };

        // DI first — harder to get (no gems source), more important than DefPen
        addIfNotPresent('DMG Increase', SUBSTAT_RANGES.di);

        // MP if character needs it
        if (needsMP) {
            addIfNotPresent('MPCR', SUBSTAT_RANGES.mpcr);
        }

        // DefPen (gems+cores already cover most of it)
        addIfNotPresent('Def Pen', SUBSTAT_RANGES.defPen);

        // HP flat (universal filler, good for survivability)
        addIfNotPresent('HP flat', SUBSTAT_RANGES.hpFlat);

        // Additional MP (last resort filler)
        addIfNotPresent('Additional MP', SUBSTAT_RANGES.addMP);

        return subs.slice(0, 4);
    };

    // Calculate substat values for each proc tier
    const calcSubValues = (sub, tierKey, isPriority) => {
        const tier = PROC_TIERS[tierKey];
        const rolls = isPriority ? tier.priorityRolls : tier.otherRolls;
        const qual = tier.rollQuality;
        const rollValue = sub.range[qual];
        return Math.round(rollValue * rolls * 100) / 100;
    };

    // Get enchant value for a substat
    const getEnchant = (subId) => {
        return ENCHANT_VALUES[subId] || 0;
    };

    // Build all 8 pieces
    const allSlots = [...SLOTS.left, ...SLOTS.right];
    const pieces = allSlots.map(slot => {
        const mainStat = slot === 'boots' ? getBootsMain() : getBestMain(slot);
        const substats = getSubstats(slot, mainStat);

        // Enchant goes on the priority sub (index 0 = scaling stat) for max value
        return {
            slot,
            name: SLOT_NAMES[slot],
            side: SLOTS.left.includes(slot) ? 'left' : 'right',
            mainStat,
            substats: substats.map((sub, idx) => ({
                ...sub,
                enchant: getEnchant(sub.id),
                low: calcSubValues(sub, 'low', idx === 0),
                mid: calcSubValues(sub, 'mid', idx === 0),
                high: calcSubValues(sub, 'high', idx === 0),
            })),
        };
    });

    // Calculate totals across all 8 pieces for each tier (includes enchants)
    const calcTotals = (tierKey) => {
        const totals = {
            mainStats: {},   // { 'ATK%': sum, 'CritDMG': raw, ... }
            substats: {},    // { 'Crit Rate': raw, 'ATK flat': sum, ... }
            enchants: {},    // { 'DEF flat': total enchant, ... }
        };

        pieces.forEach(piece => {
            const ms = piece.mainStat.stat;
            totals.mainStats[ms] = (totals.mainStats[ms] || 0) + piece.mainStat.value;

            piece.substats.forEach((sub) => {
                const val = sub[tierKey];
                totals.substats[sub.id] = (totals.substats[sub.id] || 0) + val;
                if (sub.enchant) {
                    totals.enchants[sub.id] = (totals.enchants[sub.id] || 0) + sub.enchant;
                }
            });
        });

        return totals;
    };

    return {
        pieces,
        totals: {
            low: calcTotals('low'),
            mid: calcTotals('mid'),
            high: calcTotals('high'),
        },
        procTiers: PROC_TIERS,
    };
};

export { MAINSTAT_VALUES, SUBSTAT_RANGES, SLOT_MAINSTATS, MANTICORE_TARGETS, getClassProfile, rawToPercent, percentToRaw, getConversionParams, PROC_TIERS, SLOT_NAMES };
