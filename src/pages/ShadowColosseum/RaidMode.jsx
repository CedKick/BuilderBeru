// RaidMode.jsx — Real-time Raid Mode for Shadow Colosseum
// 3 phases: Setup (team pick) → Battle (real-time) → Result (RC/DPS)

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import shadowCoinManager from '../../components/ChibiSystem/ShadowCoinManager';
import { computeTalentBonuses } from './talentTreeData';
import { computeTalentBonuses2 } from './talentTree2Data';
import {
  SPRITES, ELEMENTS, RARITY, CHIBIS,
  STAT_PER_POINT, STAT_ORDER, STAT_META, POINTS_PER_LEVEL, MAX_LEVEL,
  statsAt, statsAtFull, xpForLevel, getElementMult, getEffStat,
  applySkillUpgrades, computeAttack, aiPickSkill, spdToInterval,
  accountLevelFromXp, ACCOUNT_BONUS_INTERVAL, ACCOUNT_BONUS_AMOUNT,
  getBaseMana, BASE_MANA_REGEN, getSkillManaCost,
  mergeTalentBonuses, fmtNum,
} from './colosseumCore';
import {
  HUNTERS, SUNG_SKILLS, RAID_BOSSES,
  RAID_DURATION_SEC, RAID_TICK_MS, BOSS_BASE_INTERVAL_MS, TEAM_SIZE,
  HUNTER_UNLOCK_THRESHOLDS,
  computeSynergies, computeCrossTeamSynergy, computeRaidRewards,
  loadRaidData, saveRaidData, getHunterPool, getHunterStars, RAID_SAVE_KEY,
  HUNTER_PASSIVE_EFFECTS,
  RAID_TIERS, MAX_RAID_TIER, getTierData, getTierArtifactRarity,
} from './raidData';
import {
  computeArtifactBonuses, computeWeaponBonuses, mergeEquipBonuses, HAMMERS, HAMMER_ORDER,
  generateRaidArtifact, generateRaidArtifactFromTier, getActivePassives, RAID_ARTIFACT_SETS, ULTIME_ARTIFACT_SETS,
  WEAPONS, MAIN_STAT_VALUES, rollRaidWeaponDrop, rollUltimeWeaponDrop, generateUltimeArtifact, MAX_WEAPON_AWAKENING,
  KATANA_V_BUFF_CHANCE, KATANA_V_DOT_PCT, KATANA_V_DOT_MAX_STACKS,
  KATANA_Z_ATK_PER_HIT, KATANA_Z_STACK_PERSIST_CHANCE, KATANA_Z_COUNTER_CHANCE, KATANA_Z_COUNTER_MULT,
  SULFURAS_STACK_PER_TURN, SULFURAS_STACK_MAX,
  GULDAN_HEAL_PER_STACK, GULDAN_DEF_PER_HIT, GULDAN_ATK_PER_HIT, GULDAN_SPD_CHANCE, GULDAN_SPD_BOOST, GULDAN_SPD_MAX_STACKS, GULDAN_STUN_CHANCE,
  trimArtifactInventory,
} from './equipmentData';
import { BattleStyles, RaidArena } from './BattleVFX';
import { isLoggedIn, authHeaders } from '../../utils/auth';
import { cloudStorage } from '../../utils/CloudStorage';
import SharedDPSGraph from './SharedBattleComponents/SharedDPSGraph';
import SharedCombatLogs from './SharedBattleComponents/SharedCombatLogs';

// ─── Colosseum shared save (chibi levels, stat points, skill tree, talents) ──
const SAVE_KEY = 'shadow_colosseum_data';
const defaultColoData = () => ({ chibiLevels: {}, statPoints: {}, skillTree: {}, talentTree: {}, respecCount: {}, cooldowns: {}, stagesCleared: [], stats: { battles: 0, wins: 0 }, artifacts: {}, artifactInventory: [], weapons: {}, weaponCollection: {}, hammers: { marteau_forge: 0, marteau_runique: 0, marteau_celeste: 0 }, accountXp: 0, accountBonuses: { hp: 0, atk: 0, def: 0, spd: 0, crit: 0, res: 0 }, accountAllocations: 0, dailyRaidDate: '', dailyRaidCount: 0 });
const loadColoData = () => { try { const d = { ...defaultColoData(), ...JSON.parse(localStorage.getItem(SAVE_KEY)) }; if (!d.artifacts) d.artifacts = {}; if (!d.weapons) d.weapons = {}; if (!d.hammers) d.hammers = { marteau_forge: 0, marteau_runique: 0, marteau_celeste: 0 }; if (d.accountXp === undefined) d.accountXp = 0; if (!d.accountBonuses) d.accountBonuses = { hp: 0, atk: 0, def: 0, spd: 0, crit: 0, res: 0 }; if (d.accountAllocations === undefined) d.accountAllocations = 0; if (d.weaponInventory && Array.isArray(d.weaponInventory)) { if (!d.weaponCollection || typeof d.weaponCollection !== 'object' || Array.isArray(d.weaponCollection)) d.weaponCollection = {}; d.weaponInventory.forEach(wId => { if (d.weaponCollection[wId] === undefined) d.weaponCollection[wId] = 0; }); Object.values(d.weapons).forEach(wId => { if (wId && d.weaponCollection[wId] === undefined) d.weaponCollection[wId] = 0; }); delete d.weaponInventory; } if (!d.weaponCollection) d.weaponCollection = {}; const today = new Date().toISOString().slice(0, 10); if (d.dailyRaidDate !== today) { d.dailyRaidDate = today; d.dailyRaidCount = 0; } return d; } catch { return defaultColoData(); } };
const saveColoData = (d) => cloudStorage.save(SAVE_KEY, d);

// ─── Format numbers (shared from colosseumCore) ─────────────
const fmt = fmtNum;

// ─── Sung skill glow colors (rgba for VFX) ──────────────────
const SUNG_GLOW = {
  arise: 'rgba(239,68,68,0.3)',
  domination: 'rgba(59,130,246,0.3)',
  ombre_royale: 'rgba(168,85,247,0.3)',
  volonte: 'rgba(251,191,36,0.3)',
  shadow_exchange: 'rgba(34,197,94,0.3)',
};

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function RaidMode() {
  const [phase, setPhase] = useState('setup'); // setup | battle | result
  const [coloData, setColoData] = useState(loadColoData);
  const [raidData, setRaidData] = useState(loadRaidData);
  const [bossId] = useState('ant_queen');
  const [selectedTier, setSelectedTier] = useState(raidData.currentTier || 1);

  // ─── Setup state ───────────────────────────────────────────
  const [team1, setTeam1] = useState([null, null, null]);
  const [team2, setTeam2] = useState([null, null, null]);
  const [pickSlot, setPickSlot] = useState(null); // { team: 1|2, idx: 0-2 }

  // ─── Battle state ──────────────────────────────────────────
  const [battleState, setBattleState] = useState(null);
  const [combatLog, setCombatLog] = useState([]);
  const [sungCooldowns, setSungCooldowns] = useState({});
  const [activeSungBuffs, setActiveSungBuffs] = useState([]);
  const [timer, setTimer] = useState(RAID_DURATION_SEC);
  const [isPaused, setIsPaused] = useState(false);
  const [vfxQueue, setVfxQueue] = useState([]);
  const vfxRef = useRef([]);

  // ─── Result state ──────────────────────────────────────────
  const [resultData, setResultData] = useState(null);
  const [showDetailedStats, setShowDetailedStats] = useState(false);

  // ─── Refs for game loop ────────────────────────────────────
  const gameLoopRef = useRef(null);
  const battleRef = useRef(null);
  const timerRef = useRef(RAID_DURATION_SEC);
  const sungCDRef = useRef({});
  const sungBuffsRef = useRef([]);
  const dpsTracker = useRef({});
  const dpsWindowTracker = useRef({}); // damage since last snapshot for rolling DPS
  const healWindowTracker = useRef({});
  const healReceivedWindowTracker = useRef({});
  const dmgTakenWindowTracker = useRef({});
  const startTimeRef = useRef(0);
  const pausedRef = useRef(false);

  // ─── New: Detailed logs & DPS history ──────────────────────
  const [dpsHistory, setDpsHistory] = useState([]);
  const [detailedLogs, setDetailedLogs] = useState({});
  const detailedLogsRef = useRef({});
  const lastDpsSnapshotRef = useRef(0);
  const [graphMetric, setGraphMetric] = useState('dps'); // 'dps' | 'hps' | 'hrps' | 'dtps'

  // ─── Chibi weapon passives for VFX ─────────────────────────
  const chibiWeaponsMap = useMemo(() => {
    const map = {};
    (battleState?.chibis || []).forEach(c => {
      const wId = coloData.weapons?.[c.id];
      if (wId && WEAPONS[wId]?.passive) map[c.id] = WEAPONS[wId].passive;
    });
    return map;
  }, [battleState?.chibis, coloData.weapons]);

  // ─── Boss data ─────────────────────────────────────────────
  const boss = RAID_BOSSES[bossId];

  // ─── Available chibi pool ──────────────────────────────────
  const collection = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('beru_chibi_collection') || '{}'); } catch { return {}; }
  }, []);
  const ownedShadows = useMemo(() => Object.keys(collection).filter(k => collection[k] > 0 && CHIBIS[k]), [collection]);
  const hunterPool = useMemo(() => getHunterPool(raidData), [raidData]);
  const allPool = useMemo(() => {
    const pool = {};
    ownedShadows.forEach(id => { pool[id] = { ...CHIBIS[id], sprite: SPRITES[id] }; });
    Object.entries(hunterPool).forEach(([id, h]) => { pool[id] = h; });
    return pool;
  }, [ownedShadows, hunterPool]);

  // ─── Save effects ──────────────────────────────────────────
  useEffect(() => { saveColoData(coloData); }, [coloData]);
  useEffect(() => { saveRaidData(raidData); }, [raidData]);

  // ─── SEO ───────────────────────────────────────────────────
  useEffect(() => {
    document.title = 'Mode Raid - Shadow Colosseum | BuilderBeru';
    window.dispatchEvent(new CustomEvent('beru-react', {
      detail: { message: 'Mode Raid ! Ecrasez la Reine des Fourmis !', mood: 'excited' },
    }));
  }, []);

  // ─── Chibi stats helper ────────────────────────────────────
  const getChibiStats = useCallback((id) => {
    const chibi = allPool[id];
    if (!chibi) return null;
    const lvData = coloData.chibiLevels[id] || { level: 1, xp: 0 };
    const allocated = coloData.statPoints[id] || {};
    const tb1 = computeTalentBonuses(coloData.talentTree[id] || {});
    const tb2 = computeTalentBonuses2(coloData.talentTree2?.[id]);
    const tb = mergeTalentBonuses(tb1, tb2);
    const artBonuses = computeArtifactBonuses(coloData.artifacts?.[id]);
    const wId = coloData.weapons?.[id];
    const weapBonuses = computeWeaponBonuses(wId, coloData.weaponCollection?.[wId] || 0);
    const eqB = mergeEquipBonuses(artBonuses, weapBonuses);
    const evStars = HUNTERS[id] ? getHunterStars(loadRaidData(), id) : 0;
    return statsAtFull(chibi.base, chibi.growth, lvData.level, allocated, tb, eqB, evStars, coloData.accountBonuses);
  }, [allPool, coloData]);

  const getChibiLevel = (id) => (coloData.chibiLevels[id] || { level: 1, xp: 0 }).level;

  // ─── Selected chibis (no duplicates) ──────────────────────
  const selectedIds = useMemo(() => [...team1, ...team2].filter(Boolean), [team1, team2]);

  // ─── Team synergies ────────────────────────────────────────
  const synergy1 = useMemo(() => {
    const team = team1.filter(Boolean).map(id => allPool[id]).filter(Boolean);
    return computeSynergies(team);
  }, [team1, allPool]);
  const synergy2 = useMemo(() => {
    const team = team2.filter(Boolean).map(id => allPool[id]).filter(Boolean);
    return computeSynergies(team);
  }, [team2, allPool]);
  const crossSynergy = useMemo(() => {
    const t1 = team1.filter(Boolean).map(id => allPool[id]).filter(Boolean);
    const t2 = team2.filter(Boolean).map(id => allPool[id]).filter(Boolean);
    return computeCrossTeamSynergy(t1, t2);
  }, [team1, team2, allPool]);

  // ═══════════════════════════════════════════════════════════
  // SETUP — Team Selection
  // ═══════════════════════════════════════════════════════════

  const handleSlotClick = (teamNum, idx) => {
    const team = teamNum === 1 ? team1 : team2;
    if (team[idx]) {
      // Remove chibi from slot
      const setter = teamNum === 1 ? setTeam1 : setTeam2;
      setter(prev => { const n = [...prev]; n[idx] = null; return n; });
      setPickSlot(null);
    } else {
      setPickSlot({ team: teamNum, idx });
    }
  };

  const handlePickChibi = (id) => {
    if (!pickSlot) return;
    const setter = pickSlot.team === 1 ? setTeam1 : setTeam2;
    setter(prev => { const n = [...prev]; n[pickSlot.idx] = id; return n; });
    setPickSlot(null);
  };

  // ═══════════════════════════════════════════════════════════
  // BATTLE — Init & Game Loop
  // ═══════════════════════════════════════════════════════════

  const buildChibiEntity = useCallback((id, synergyBonuses) => {
    const chibi = allPool[id];
    if (!chibi) return null;
    const lvData = coloData.chibiLevels[id] || { level: 1, xp: 0 };
    const allocated = coloData.statPoints[id] || {};
    const tb1 = computeTalentBonuses(coloData.talentTree[id] || {});
    const tb2 = computeTalentBonuses2(coloData.talentTree2?.[id]);
    const tb = mergeTalentBonuses(tb1, tb2);
    const artBonuses = computeArtifactBonuses(coloData.artifacts?.[id]);
    const wId2 = coloData.weapons?.[id];
    const weapBonuses = computeWeaponBonuses(wId2, coloData.weaponCollection?.[wId2] || 0);
    const eqB = mergeEquipBonuses(artBonuses, weapBonuses);
    const evStars = HUNTERS[id] ? getHunterStars(loadRaidData(), id) : 0;
    const st = statsAtFull(chibi.base, chibi.growth, lvData.level, allocated, tb, eqB, evStars, coloData.accountBonuses);
    const weaponType = wId2 && WEAPONS[wId2] ? WEAPONS[wId2].weaponType : null;

    // Hunter innate passive
    const hunterPassive = HUNTERS[id] ? (HUNTER_PASSIVE_EFFECTS[id] || null) : null;

    // Apply synergy bonuses
    const syn = synergyBonuses;
    let hpMult = 1 + (syn.hp + syn.allStats) / 100;
    let atkMult = 1 + (syn.atk + syn.allStats) / 100;
    let defMult = 1 + (syn.def + syn.allStats) / 100;
    let spdMult = 1 + (syn.spd + syn.allStats) / 100;
    let critFlat = syn.crit;
    let resFlat = syn.res;

    // Apply permanent hunter passives (% bonuses)
    if (hunterPassive?.type === 'permanent' && hunterPassive.stats) {
      if (hunterPassive.stats.hp)   hpMult  += hunterPassive.stats.hp / 100;
      if (hunterPassive.stats.atk)  atkMult += hunterPassive.stats.atk / 100;
      if (hunterPassive.stats.def)  defMult += hunterPassive.stats.def / 100;
      if (hunterPassive.stats.spd)  spdMult += hunterPassive.stats.spd / 100;
      if (hunterPassive.stats.crit) critFlat += hunterPassive.stats.crit;
      if (hunterPassive.stats.res)  resFlat  += hunterPassive.stats.res;
    }

    const finalHp = Math.floor(st.hp * hpMult);
    const finalAtk = Math.floor(st.atk * atkMult);
    const finalDef = Math.floor(st.def * defMult);
    const finalSpd = Math.floor(st.spd * spdMult);
    const finalCrit = +(st.crit + critFlat).toFixed(1);
    const finalRes = +(st.res + resFlat).toFixed(1);

    // Mana stats
    const mana = st.mana || 0;
    const manaRegen = st.manaRegen || 0;
    const manaCostReduce = st.manaCostReduce || 0;

    // Build upgraded skills with mana costs
    const skillTreeData = coloData.skillTree[id] || {};
    const skills = chibi.skills.map((sk, i) => {
      const lvl = skillTreeData[i] || 0;
      const upgraded = applySkillUpgrades(sk, lvl);
      const rawCost = getSkillManaCost(upgraded);
      const cost = Math.floor(rawCost * (1 - manaCostReduce / 100));
      return { ...upgraded, cd: 0, cdMaxMs: upgraded.cdMax * spdToInterval(finalSpd), manaCost: cost };
    });

    // Passives from raid sets
    const passives = getActivePassives(coloData.artifacts?.[id]);

    // Build talentBonuses with hunter passive injections
    const mergedTb = (() => {
      const m = { ...tb };
      for (const [k, v] of Object.entries(eqB)) { if (v) m[k] = (m[k] || 0) + v; }
      // Inject hunter passive bonuses into talentBonuses
      if (hunterPassive) {
        if (hunterPassive.type === 'healBonus')   m.healBonus = (m.healBonus || 0) + hunterPassive.value;
        if (hunterPassive.type === 'critDmg')     m.critDamage = (m.critDamage || 0) + hunterPassive.value;
        if (hunterPassive.type === 'magicDmg')    m.allDamage = (m.allDamage || 0) + hunterPassive.value;
        if (hunterPassive.type === 'vsBoss')      m.bossDamage = (m.bossDamage || 0) + (hunterPassive.stats?.atk || 0);
        if (hunterPassive.type === 'debuffBonus') m.debuffBonus = (m.debuffBonus || 0) + hunterPassive.value;
        if (hunterPassive.type === 'aoeDmg')      m.allDamage = (m.allDamage || 0) + hunterPassive.value;
        if (hunterPassive.type === 'dotDmg')      m.allDamage = (m.allDamage || 0) + hunterPassive.value;
        if (hunterPassive.type === 'buffBonus')   m.buffBonus = (m.buffBonus || 0) + hunterPassive.value;
        if (hunterPassive.type === 'teamDef')     defMult += hunterPassive.value / 100;
      }
      return m;
    })();

    return {
      id, name: chibi.name, element: chibi.element, class: chibi.class,
      sprite: chibi.sprite, rarity: chibi.rarity, weaponType,
      hp: finalHp, maxHp: finalHp,
      atk: finalAtk, def: finalDef, spd: finalSpd, crit: finalCrit, res: finalRes,
      mana, maxMana: mana, manaRegen, manaCostReduce,
      skills, buffs: [], passives,
      passiveState: {
        flammeStacks: 0, martyrHealed: false, echoCounter: 0, sianStacks: 0,
        ...(wId2 && WEAPONS[wId2]?.passive === 'sulfuras_fury' ? { sulfurasStacks: 0 } : {}),
        ...(wId2 && WEAPONS[wId2]?.passive === 'shadow_silence' ? { shadowSilence: [] } : {}),
        ...(wId2 && WEAPONS[wId2]?.passive === 'katana_z_fury' ? { katanaZStacks: 0 } : {}),
        ...(wId2 && WEAPONS[wId2]?.passive === 'katana_v_chaos' ? { katanaVState: { dots: 0, allStatBuff: 0, shield: false, nextDmgMult: 1 } } : {}),
        ...(wId2 && WEAPONS[wId2]?.passive === 'guldan_halo' ? { guldanState: { healStacks: 0, defBonus: 0, atkBonus: 0, spdStacks: 0, divinUsed: false } } : {}),
        // ULTIME artifact passive state
        eternalRageStacks: 0,     // Rage Eternelle: ATK stacking
        celestialShield: 0,       // Gardien Celeste: shield HP
        celestialShieldBroken: false,
        celestialDefBoostTurns: 0,
        vitalOverhealShield: 0,   // Siphon Vital: overheal shield
        vitalEmergencyCD: 0,      // Siphon Vital: emergency lifesteal cooldown
        vitalEmergencyActive: 0,  // Siphon Vital: emergency lifesteal remaining turns
        arcaneOverloadCD: 0,      // Tempete Arcane: overload cooldown
        supremeAllStatsCounter: 0,// Equilibre Supreme: counter for all-stats buff
        supremeAllStatsBuff: 0,   // Equilibre Supreme: active all-stats buff turns
      },
      talentBonuses: mergedTb,
      hunterPassive,
      lastAttackAt: 0, attackInterval: spdToInterval(finalSpd),
      alive: true,
    };
  }, [allPool, coloData]);

  const buildBossEntity = useCallback((tier = 1) => {
    const b = boss;
    const tierData = getTierData(tier);
    const barHP = Math.floor(b.barScaling(0) * tierData.bossHPMult);
    const isInfinite = !!tierData.infiniteBars;
    return {
      id: 'boss', name: b.name, element: b.element, isBoss: true,
      sprite: b.sprite, emoji: b.emoji,
      hp: barHP, maxHp: barHP,
      atk: Math.floor(b.stats.atk * tierData.bossAtkMult),
      def: Math.floor(b.stats.def * tierData.bossDefMult),
      spd: Math.floor(b.stats.spd * tierData.bossSpdMult),
      crit: b.stats.crit, res: b.stats.res,
      buffs: [],
      currentBar: 0, totalBars: isInfinite ? 999999 : b.totalBars, barsDestroyed: 0,
      infiniteBars: isInfinite,
      skills: b.skills.map(s => ({ ...s, lastUsedAt: 0 })),
      phase: b.phases[0],
      lastAttackAt: 0,
      tier, tierData, rcPerBar: tierData.rcPerBar,
    };
  }, [boss]);

  const startRaid = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);

    const allBonuses1 = { ...synergy1.bonuses, crit: synergy1.bonuses.crit + crossSynergy.bonuses.crit };
    const allBonuses2 = { ...synergy2.bonuses, crit: synergy2.bonuses.crit + crossSynergy.bonuses.crit };

    const chibis = [];
    team1.filter(Boolean).forEach(id => {
      const e = buildChibiEntity(id, allBonuses1);
      if (e) chibis.push(e);
    });
    team2.filter(Boolean).forEach(id => {
      const e = buildChibiEntity(id, allBonuses2);
      if (e) chibis.push(e);
    });

    if (chibis.length === 0) return;

    // Apply team-wide passives from raid sets
    chibis.forEach(c => {
      // Martyr Aura: self ATK -30%, allies ATK +15%
      const martyrAura = c.passives?.find(p => p.type === 'martyrAura');
      if (martyrAura) {
        c.atk = Math.floor(c.atk * (1 + (martyrAura.selfAtkMult || -0.30)));
        chibis.forEach(ally => { if (ally.id !== c.id) ally.atk = Math.floor(ally.atk * (1 + (martyrAura.allyAtkBonus || 0.15))); });
      }
      // Shadow Pact: self ATK -50%, teammates ATK +150%
      const shadowPact = c.passives?.find(p => p.type === 'shadowPact');
      if (shadowPact) {
        c.atk = Math.floor(c.atk * (1 + (shadowPact.selfAtkMult || -0.50)));
        chibis.forEach(ally => { if (ally.id !== c.id) ally.atk = Math.floor(ally.atk * (1 + (shadowPact.allyAtkBoost || 1.50))); });
      }
      // Shadow Pact Raid (4p): +25% total DMG for ALL chibis in raid
      const shadowPactRaid = c.passives?.find(p => p.type === 'shadowPactRaid');
      if (shadowPactRaid) {
        chibis.forEach(ally => { ally.passiveState.shadowPactRaidBoost = (ally.passiveState.shadowPactRaidBoost || 0) + (shadowPactRaid.raidDmgBoost || 0.25); });
      }
      // Commander DEF: all allies +10% DEF
      const cmdDef = c.passives?.find(p => p.type === 'commanderDef');
      if (cmdDef) chibis.forEach(ally => { ally.def = Math.floor(ally.def * 1.10); });
    });
    // Commander Crit: battle start +20% CRIT for ~30s (turns=30 in decay)
    chibis.forEach(c => {
      const cmdCrit = c.passives?.find(p => p.type === 'commanderCrit');
      if (cmdCrit) chibis.forEach(ally => { ally.buffs.push({ stat: 'crit', value: 20, turns: 30 }); });
    });
    // Hunter passive: teamDef (Reed) → all allies DEF +X%
    chibis.forEach(c => {
      if (c.hunterPassive?.type === 'teamDef') {
        const val = c.hunterPassive.value || 0;
        chibis.forEach(ally => { ally.def = Math.floor(ally.def * (1 + val / 100)); });
      }
      // Hunter passive: teamAura (Mayuri) → all allies stat buffs (permanent)
      if (c.hunterPassive?.type === 'teamAura' && c.hunterPassive.stats) {
        const stats = c.hunterPassive.stats;
        chibis.forEach(ally => {
          Object.entries(stats).forEach(([stat, pct]) => {
            ally.buffs.push({ stat, value: pct / 100, turns: 9999 });
          });
        });
      }
      // Hunter passive: buffBonus (Meri) → increase buff durations by X%
      if (c.hunterPassive?.type === 'buffBonus') {
        c.talentBonuses.buffBonus = (c.talentBonuses.buffBonus || 0) + c.hunterPassive.value;
      }
      // Hunter passive: firstTurn (Kanae) → SPD boost at battle start
      if (c.hunterPassive?.type === 'firstTurn' && c.hunterPassive.stats?.spd) {
        c.buffs.push({ stat: 'spd', value: c.hunterPassive.stats.spd / 100, turns: 1 });
      }
    });

    // ─── ULTIME artifact set passives: onBattleStart ───
    chibis.forEach(c => {
      const ap = c.passives || [];
      const ps = c.passiveState;
      ap.forEach(p => {
        // Gardien Celeste (2p): Shield = 20% max HP at battle start — individual
        if (p.type === 'celestialShield') {
          ps.celestialShield = Math.floor(c.maxHp * (p.shieldPct || 0.20));
        }
        // Equilibre Supreme (4p): find lowest stat and boost +25% — individual
        if (p.type === 'supremeBalance') {
          const stats = { atk: c.atk, def: c.def, spd: c.spd };
          const lowest = Object.entries(stats).sort((a, b) => a[1] - b[1])[0];
          if (lowest) {
            const boost = Math.floor(lowest[1] * (p.lowestStatBonus || 0.25));
            c[lowest[0]] = c[lowest[0]] + boost;
          }
          ps.supremeAllStatsInterval = p.allStatsInterval || 5;
          ps.supremeAllStatsBonus = p.allStatsBonus || 0.10;
          ps.supremeAllStatsDuration = p.allStatsDuration || 3;
        }
      });
    });

    // Increment daily raid count + save tier preference
    setColoData(prev => ({ ...prev, dailyRaidDate: today, dailyRaidCount: (prev.dailyRaidDate === today ? (prev.dailyRaidCount || 0) : 0) + 1 }));
    setRaidData(prev => ({ ...prev, currentTier: selectedTier }));

    const tierData = getTierData(selectedTier);
    const bossEntity = buildBossEntity(selectedTier);
    const state = { chibis, boss: bossEntity };

    setBattleState(state);
    battleRef.current = state;
    setCombatLog([{ text: `Raid ${tierData.name} commence ! ${boss.name} apparait !`, time: 0, type: 'system' }]);
    setSungCooldowns({});
    sungCDRef.current = {};
    setActiveSungBuffs([]);
    sungBuffsRef.current = [];
    setTimer(RAID_DURATION_SEC);
    timerRef.current = RAID_DURATION_SEC;
    dpsTracker.current = {};
    dpsWindowTracker.current = {};
    healWindowTracker.current = {};
    healReceivedWindowTracker.current = {};
    dmgTakenWindowTracker.current = {};
    chibis.forEach(c => {
      dpsTracker.current[c.id] = 0;
      dpsWindowTracker.current[c.id] = 0;
      healWindowTracker.current[c.id] = 0;
      healReceivedWindowTracker.current[c.id] = 0;
      dmgTakenWindowTracker.current[c.id] = 0;
    });
    dpsWindowTracker.current['boss'] = 0;

    // Initialize detailed logs
    const initialLogs = {};
    chibis.forEach(c => {
      initialLogs[c.id] = {
        totalDamage: 0,
        totalHealing: 0,
        healReceived: 0,
        damageTaken: 0,
        totalHits: 0,
        critHits: 0,
        totalCritDamage: 0,
        maxCrit: 0,
        skillsUsed: 0,
        dps: 0,
        buffActivations: [],
        passiveProcs: [],
      };
    });
    initialLogs['boss'] = {
      totalDamage: 0,
      damageTaken: 0,
      totalHits: 0,
      critHits: 0,
      totalCritDamage: 0,
      maxCrit: 0,
      skillsUsed: 0,
      dps: 0,
      buffActivations: [],
      passiveProcs: [],
    };
    detailedLogsRef.current = initialLogs;
    setDetailedLogs(initialLogs);

    // Initial DPS snapshot at time 0
    const initialSnapshot = { time: 0 };
    chibis.forEach(c => { initialSnapshot[c.id] = 0; });
    initialSnapshot['boss'] = 0;
    setDpsHistory([initialSnapshot]);
    lastDpsSnapshotRef.current = 0;

    startTimeRef.current = Date.now();
    pausedRef.current = false;
    setIsPaused(false);
    setPhase('battle');
  }, [team1, team2, synergy1, synergy2, crossSynergy, buildChibiEntity, buildBossEntity, boss]);

  // ─── Game tick ─────────────────────────────────────────────

  const gameTick = useCallback(() => {
    if (pausedRef.current) return;
    const state = battleRef.current;
    if (!state) return;

    const now = Date.now();
    const elapsed = (now - startTimeRef.current) / 1000;
    const remaining = Math.max(0, RAID_DURATION_SEC - elapsed);
    timerRef.current = remaining;

    let logEntries = [];
    let vfxEvents = [];
    let stateChanged = false;

    // ─── Check end conditions ────────────────────────────────
    const aliveCount = state.chibis.filter(c => c.alive).length;
    const endByBars = !state.boss.infiniteBars && state.boss.barsDestroyed >= state.boss.totalBars;
    if (remaining <= 0 || aliveCount === 0 || endByBars) {
      // End raid
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;

      const barsDestroyed = state.boss.barsDestroyed;
      const tier = state.boss.tier || 1;
      const tierData = state.boss.tierData || getTierData(1);
      const rc = barsDestroyed * tierData.rcPerBar;
      const isFullClear = !state.boss.infiniteBars && barsDestroyed >= state.boss.totalBars;
      const totalDamage = Object.values(dpsTracker.current).reduce((s, v) => s + v, 0);
      const rewards = computeRaidRewards(rc, isFullClear, tierData);
      const endReason = remaining <= 0 ? 'timeout' : aliveCount === 0 ? 'wipe' : 'clear';

      // DPS breakdown
      const dpsBreakdown = state.chibis.map(c => ({
        id: c.id, name: c.name, sprite: c.sprite, element: c.element,
        damage: dpsTracker.current[c.id] || 0,
        percent: totalDamage > 0 ? ((dpsTracker.current[c.id] || 0) / totalDamage * 100) : 0,
      })).sort((a, b) => b.damage - a.damage);

      // Check hunter unlocks via thresholds (uses cumulative totalRC)
      const newRC = (raidData.raidStats.totalRC || 0) + rc;
      const unlockedHunters = [];
      const hunterDuplicates = [];
      const hunterIds = Object.keys(HUNTERS);
      const alreadyOwned = new Set((raidData.hunterCollection || []).map(e => typeof e === 'string' ? e : e.id));
      const oldRC = raidData.raidStats.totalRC || 0;

      HUNTER_UNLOCK_THRESHOLDS.forEach(threshold => {
        if (newRC >= threshold.rc && oldRC < threshold.rc) {
          const candidates = hunterIds.filter(h =>
            HUNTERS[h].rarity === threshold.rarity && !alreadyOwned.has(h) && !HUNTERS[h].series && !HUNTERS[h].special
          );
          if (candidates.length > 0) {
            const pick = candidates[Math.floor(Math.random() * candidates.length)];
            unlockedHunters.push(pick);
            alreadyOwned.add(pick);
          } else {
            const dupePool = hunterIds.filter(h => HUNTERS[h].rarity === threshold.rarity && !HUNTERS[h].series && !HUNTERS[h].special);
            if (dupePool.length > 0) {
              const pick = dupePool[Math.floor(Math.random() * dupePool.length)];
              hunterDuplicates.push(pick);
            }
          }
        }
      });

      // Random hunter drop — scales with RC and tier (minimum 3 RC for any loot)
      const tierDropMult = [0, 1, 1.5, 2, 3, 4, 5][tier] || 1;
      const dropChance = Math.min(0.6, rc * 0.03 * tierDropMult);
      if (rc >= 3 && Math.random() < dropChance) {
        // Pick rarity based on tier
        const rarityRoll = Math.random();
        let dropRarity;
        if (tier >= 5) dropRarity = 'mythique';
        else if (tier >= 3) dropRarity = rarityRoll < 0.3 ? 'mythique' : 'legendaire';
        else dropRarity = rarityRoll < 0.1 ? 'mythique' : rarityRoll < 0.4 ? 'legendaire' : 'rare';

        const newCandidates = hunterIds.filter(h =>
          HUNTERS[h].rarity === dropRarity && !alreadyOwned.has(h) && !HUNTERS[h].series && !HUNTERS[h].special
        );
        if (newCandidates.length > 0) {
          const pick = newCandidates[Math.floor(Math.random() * newCandidates.length)];
          unlockedHunters.push(pick);
          alreadyOwned.add(pick);
        } else {
          // All of that rarity owned — give a duplicate for stars
          const dupePool = hunterIds.filter(h => HUNTERS[h].rarity === dropRarity && !HUNTERS[h].series && !HUNTERS[h].special);
          if (dupePool.length > 0) {
            const pick = dupePool[Math.floor(Math.random() * dupePool.length)];
            hunterDuplicates.push(pick);
          }
        }
      }

      // Special drop: Megumin — tier 5 (Divin) & 6 (Ultime), 1/100
      if ((tier === 5 || tier === 6) && !alreadyOwned.has('h_megumin') && Math.random() < 1 / 100) {
        unlockedHunters.push('h_megumin');
        alreadyOwned.add('h_megumin');
        // Log legendary drop
        if (isLoggedIn()) {
          fetch('/api/drop-log?action=submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ itemType: 'hunter', itemId: 'h_megumin', itemName: 'Megumin', itemRarity: 'legendaire' }),
          }).catch(() => {});
        }
      }

      // Apply rewards
      shadowCoinManager.addCoins(rewards.coins, 'raid_reward');

      // Faction contribution: +5 points for any raid
      if (isLoggedIn()) {
        fetch('/api/factions?action=activity-reward', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ activity: 'raid' }),
        }).catch(() => {});
      }

      // Hammer drops — tier-aware (minimum 3 RC for any loot)
      const hammerDrops = {};
      const hammerCount = rc >= 3 ? Math.floor(tierData.hammerCountBase + rc * tierData.hammerCountPerRC + (isFullClear ? 2 : 0)) : 0;
      for (let i = 0; i < hammerCount; i++) {
        const hId = tierData.hammerTiers[Math.floor(Math.random() * tierData.hammerTiers.length)];
        hammerDrops[hId] = (hammerDrops[hId] || 0) + 1;
      }

      // Raid artifact drops — tier-aware (rates /5 — inventory cap active)
      const raidArtifactDrops = [];
      if (tier === 6) {
        // Ultime mode: RC-scaled artifact drops — 20% chance each (was 100%)
        if (rc >= 3 && Math.random() < 0.2) raidArtifactDrops.push(generateUltimeArtifact(rc));
        if (rc >= 8 && Math.random() < 0.2) raidArtifactDrops.push(generateUltimeArtifact(rc));
        if (rc >= 15 && Math.random() < 0.2) raidArtifactDrops.push(generateUltimeArtifact(rc));
        if (rc >= 25 && Math.random() < 0.2) raidArtifactDrops.push(generateUltimeArtifact(rc));
      } else {
        if (rc >= tierData.artifactDrop1.rcMin && Math.random() < 0.2) {
          const rarity1 = getTierArtifactRarity(tierData.artifactDrop1, rc);
          raidArtifactDrops.push(generateRaidArtifactFromTier(rarity1, tier));
        }
        if (tierData.artifactDrop2 && rc >= tierData.artifactDrop2.rcMin && Math.random() < 0.2) {
          const rarity2 = getTierArtifactRarity(tierData.artifactDrop2, rc);
          raidArtifactDrops.push(generateRaidArtifactFromTier(rarity2, tier));
        }
        if (isFullClear && Math.random() < 0.2) {
          raidArtifactDrops.push(generateRaidArtifactFromTier(tierData.artifactDropFullClear, tier));
        }
      }

      // Weapon drops — tier-aware (Ultime uses RC-scaled drops)
      let raidWeaponDrop = null;
      if (tier === 6) {
        const ultWeaponId = rollUltimeWeaponDrop(rc);
        if (ultWeaponId) {
          const wData = WEAPONS[ultWeaponId];
          if (wData) raidWeaponDrop = { id: ultWeaponId, ...wData };
        }
      } else {
        const rolledWeapon = rollRaidWeaponDrop(tier, isFullClear);
        if (rolledWeapon) {
          const wData = WEAPONS[rolledWeapon];
          if (wData) raidWeaponDrop = { id: rolledWeapon, ...wData };
        }
      }

      // XP to participating chibis + save hammer drops + raid artifacts
      const newColoData = { ...coloData };
      const newHammers = { ...(newColoData.hammers || { marteau_forge: 0, marteau_runique: 0, marteau_celeste: 0 }) };
      Object.entries(hammerDrops).forEach(([hId, count]) => { newHammers[hId] = (newHammers[hId] || 0) + count; });
      newColoData.hammers = newHammers;
      if (raidArtifactDrops.length > 0) {
        newColoData.artifactInventory = trimArtifactInventory([...(newColoData.artifactInventory || []), ...raidArtifactDrops]);
      }
      if (raidWeaponDrop) {
        const wc = { ...(newColoData.weaponCollection || {}) };
        if (wc[raidWeaponDrop.id] !== undefined) {
          if (wc[raidWeaponDrop.id] < MAX_WEAPON_AWAKENING) {
            wc[raidWeaponDrop.id]++;
            raidWeaponDrop.isNew = false;
            raidWeaponDrop.newAwakening = wc[raidWeaponDrop.id];
          } else {
            raidWeaponDrop.isNew = false;
            raidWeaponDrop.newAwakening = MAX_WEAPON_AWAKENING;
          }
        } else {
          wc[raidWeaponDrop.id] = 0;
          raidWeaponDrop.isNew = true;
        }
        newColoData.weaponCollection = wc;
      }
      state.chibis.forEach(c => {
        const cur = newColoData.chibiLevels[c.id] || { level: 1, xp: 0 };
        if (cur.level >= MAX_LEVEL) return;
        let newXp = cur.xp + rewards.xpPerChibi;
        let newLvl = cur.level;
        while (newLvl < MAX_LEVEL && newXp >= xpForLevel(newLvl)) {
          newXp -= xpForLevel(newLvl);
          newLvl++;
        }
        newColoData.chibiLevels[c.id] = { level: newLvl, xp: newXp };
      });
      const raidAccountXp = Math.floor((30 + rc * 15 + (isFullClear ? 50 : 0)) * tierData.xpMult);
      newColoData.accountXp = (newColoData.accountXp || 0) + raidAccountXp;
      setColoData(newColoData);
      // Force immediate cloud sync — raid XP is critical, don't rely on debounce
      cloudStorage.saveAndSync(SAVE_KEY, newColoData);

      // Update raid data — with tier tracking
      const newRaidData = { ...raidData };
      const oldTierBestRC = { ...(newRaidData.raidStats?.tierBestRC || {}) };
      oldTierBestRC[tier] = Math.max(oldTierBestRC[tier] || 0, rc);
      newRaidData.raidStats = {
        totalRC: newRC,
        bestRC: Math.max(raidData.raidStats.bestRC || 0, rc),
        totalDamage: (raidData.raidStats.totalDamage || 0) + totalDamage,
        raidsPlayed: (raidData.raidStats.raidsPlayed || 0) + 1,
        bestTierCleared: newRaidData.raidStats?.bestTierCleared || 0,
        tierBestRC: oldTierBestRC,
      };
      // Unlock next tier on full clear
      let tierUnlocked = null;
      if (isFullClear && tier === (newRaidData.unlockedTier || 1) && tier < MAX_RAID_TIER) {
        newRaidData.unlockedTier = tier + 1;
        newRaidData.raidStats.bestTierCleared = tier;
        tierUnlocked = tier + 1;
      }
      if (!newRaidData.weeklyBoss[bossId]) newRaidData.weeklyBoss[bossId] = { attempts: 0, bestRC: 0 };
      newRaidData.weeklyBoss[bossId].attempts++;
      newRaidData.weeklyBoss[bossId].bestRC = Math.max(newRaidData.weeklyBoss[bossId].bestRC, rc);
      newRaidData.lastTeam = [...team1, ...team2];
      unlockedHunters.forEach(hId => {
        const existing = (newRaidData.hunterCollection || []).find(e => (typeof e === 'string' ? e : e.id) === hId);
        if (!existing) {
          newRaidData.hunterCollection = [...(newRaidData.hunterCollection || []), { id: hId, stars: 0 }];
        }
      });
      hunterDuplicates.forEach(hId => {
        const col = newRaidData.hunterCollection || [];
        const idx = col.findIndex(e => (typeof e === 'string' ? e : e.id) === hId);
        if (idx !== -1) {
          const entry = typeof col[idx] === 'string' ? { id: col[idx], stars: 0 } : { ...col[idx] };
          if (entry.stars < 5) entry.stars++;
          col[idx] = entry;
        }
      });
      setRaidData(newRaidData);
      // Force immediate cloud sync for raid progression too
      cloudStorage.saveAndSync(RAID_SAVE_KEY, newRaidData);

      setResultData({
        rc, barsDestroyed, isFullClear, totalDamage, endReason, dpsBreakdown,
        rewards, unlockedHunters, hunterDuplicates, hammerDrops, raidArtifactDrops,
        raidWeaponDrop,
        duration: Math.floor(elapsed),
        tier, tierData, tierUnlocked,
      });
      setPhase('result');
      return;
    }

    // ─── Expire Sung buffs ───────────────────────────────────
    const activeBuffs = sungBuffsRef.current.filter(b => b.expiresAt > now);
    sungBuffsRef.current = activeBuffs;

    // ─── Chibi attacks ───────────────────────────────────────
    state.chibis.forEach(chibi => {
      if (!chibi.alive) return;
      if (now - chibi.lastAttackAt < chibi.attackInterval) return;

      // Mana regen (proportional to attack interval / 3s base)
      if (chibi.maxMana > 0) {
        chibi.mana = Math.min(chibi.maxMana, (chibi.mana || 0) + (chibi.manaRegen || 0) * (chibi.attackInterval / 3000));
      }

      // Echo Temporel: every 3 attack cycles, next skill is free
      const echoFree = chibi.passives?.find(p => p.type === 'echoFreeMana');
      if (echoFree) {
        chibi.passiveState.echoCounter = (chibi.passiveState.echoCounter || 0) + 1;
        if (chibi.passiveState.echoCounter >= 3) {
          chibi.passiveState.echoCounter = 0;
          chibi.passiveState.echoFreeMana = true;
        }
      }

      // Adjust stats with active Sung buffs
      const sungMults = { atk: 0, def: 0, spd: 0, crit: 0, res: 0 };
      activeBuffs.forEach(b => {
        if (b.effect.type === 'buff') {
          sungMults[b.effect.stat] += b.effect.value;
          if (b.effect.stat2) sungMults[b.effect.stat2] += b.effect.value2;
        }
      });

      // Boss debuffs from Sung
      const bossDebuffs = { def: 0 };
      activeBuffs.forEach(b => {
        if (b.effect.type === 'debuff') bossDebuffs[b.effect.stat] += b.effect.value;
      });

      // Temporarily modify chibi stats
      const origAtk = chibi.atk;
      const origCrit = chibi.crit;
      const origDef = chibi.def;
      chibi.atk = Math.floor(origAtk * (1 + sungMults.atk / 100));
      chibi.crit = +(origCrit + sungMults.crit).toFixed(1);

      // Apply conditional hunter passives
      const hp = chibi.hunterPassive;
      if (hp) {
        const hpPct = chibi.hp / chibi.maxHp * 100;
        if (hp.type === 'lowHp' && hpPct < hp.threshold && hp.stats) {
          if (hp.stats.def) chibi.def = Math.floor(origDef * (1 + hp.stats.def / 100));
          if (hp.stats.atk) chibi.atk = Math.floor(chibi.atk * (1 + hp.stats.atk / 100));
        }
        if (hp.type === 'highHp' && hpPct > hp.threshold && hp.stats) {
          if (hp.stats.atk)  chibi.atk = Math.floor(chibi.atk * (1 + hp.stats.atk / 100));
          if (hp.stats.crit) chibi.crit = +(chibi.crit + hp.stats.crit).toFixed(1);
        }
        if (hp.type === 'stacking') {
          chibi.passiveState.sianStacks = Math.min(hp.maxStacks || 10, (chibi.passiveState.sianStacks || 0) + 1);
          const stackBonus = (hp.perStack?.atk || 0) * chibi.passiveState.sianStacks;
          chibi.atk = Math.floor(chibi.atk * (1 + stackBonus / 100));
        }
        if (hp.type === 'vsLowHp' && (state.boss.hp / state.boss.maxHp * 100) < hp.threshold && hp.stats) {
          if (hp.stats.crit) chibi.crit = +(chibi.crit + hp.stats.crit).toFixed(1);
        }
        if (hp.type === 'vsDebuffed' && state.boss.buffs?.some(b => b.value < 0) && hp.stats) {
          if (hp.stats.atk) chibi.atk = Math.floor(chibi.atk * (1 + hp.stats.atk / 100));
        }
      }

      // Sulfuras: +33% per stack, 3 stacks max = +100%
      if (chibi.passiveState.sulfurasStacks !== undefined && chibi.passiveState.sulfurasStacks > 0) {
        chibi.atk = Math.floor(chibi.atk * (1 + chibi.passiveState.sulfurasStacks / 3));
      }

      // Shadow Silence (Rae'shalare): +100% ATK per active stack
      if (chibi.passiveState.shadowSilence !== undefined) {
        const activeStacks = chibi.passiveState.shadowSilence.filter(s => s > 0).length;
        if (activeStacks > 0) {
          chibi.atk = Math.floor(chibi.atk * (1 + activeStacks * 1.0));
        }
      }

      // Katana Z: apply ATK buff from stacks before damage calc
      if (chibi.passiveState.katanaZStacks !== undefined && chibi.passiveState.katanaZStacks > 0) {
        chibi.atk = Math.floor(chibi.atk * (1 + chibi.passiveState.katanaZStacks * KATANA_Z_ATK_PER_HIT / 100));
      }

      // Gul'dan Halo Eternelle: ATK + DEF + SPD stacking bonuses
      if (chibi.passiveState.guldanState) {
        const gs = chibi.passiveState.guldanState;
        if (gs.atkBonus > 0) chibi.atk = Math.floor(chibi.atk * (1 + gs.atkBonus));
        if (gs.defBonus > 0) chibi.def = Math.floor(chibi.def * (1 + gs.defBonus));
        if (gs.spdStacks > 0) chibi.atk = Math.floor(chibi.atk * (1 + gs.spdStacks * GULDAN_SPD_BOOST * 0.1));
      }

      // ── ULTIME Artifact Passives: beforeAttack ──
      // Rage Eternelle (2p): +1% ATK per stack — individual
      if (chibi.passiveState.eternalRageStacks > 0) {
        const ragePassive = chibi.passives?.find(p => p.type === 'eternalRageStack');
        if (ragePassive) {
          chibi.atk = Math.floor(chibi.atk * (1 + chibi.passiveState.eternalRageStacks * (ragePassive.atkPerStack || 0.01)));
        }
      }
      // Gardien Celeste (4p): shield intact → +25% DMG — individual
      if (chibi.passiveState.celestialShield > 0) {
        const celWrath = chibi.passives?.find(p => p.type === 'celestialWrath');
        if (celWrath) {
          chibi.atk = Math.floor(chibi.atk * (1 + (celWrath.dmgWhileShield || 0.25)));
        }
      }
      // Siphon Vital (4p): HP > 80% → +30% DMG — individual
      const vitalSurge = chibi.passives?.find(p => p.type === 'vitalSurge');
      if (vitalSurge && (chibi.hp / chibi.maxHp) > (vitalSurge.highHpThreshold || 0.80)) {
        chibi.atk = Math.floor(chibi.atk * (1 + (vitalSurge.highHpDmg || 0.30)));
      }

      // Temporarily modify boss DEF
      const origBossDef = state.boss.def;
      state.boss.def = Math.floor(origBossDef * (1 - bossDebuffs.def / 100));

      // Support healing: allies first, then self as fallback (costs 25% maxMana)
      if (chibi.class === 'support') {
        const healManaCost = Math.floor((chibi.maxMana || 0) * 0.25);
        const hasEnoughMana = chibi.maxMana <= 0 || (chibi.mana || 0) >= healManaCost;
        const aliveAllies = state.chibis.filter(a => a.alive && a.id !== chibi.id && a.hp < a.maxHp);
        const lowestAlly = aliveAllies.sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0];
        // Heal target: lowest ally <75% HP, OR self <75% HP as fallback
        const healTarget = hasEnoughMana ? ((lowestAlly && (lowestAlly.hp / lowestAlly.maxHp) < 0.75) ? lowestAlly
          : (chibi.hp < chibi.maxHp && (chibi.hp / chibi.maxHp) < 0.75) ? chibi : null) : null;
        if (healTarget) {
          // Consume mana for heal
          if (chibi.maxMana > 0) chibi.mana = Math.max(0, (chibi.mana || 0) - healManaCost);
          const healBonus = (chibi.talentBonuses?.healBonus || 0);
          let healAmt = Math.floor(healTarget.maxHp * 0.15 * (1 + healBonus / 100));
          // healCrit (Chaines du Destin 4p): +30% heal, 10% chance crit heal x2
          const healCritP = chibi.passives?.find(p => p.type === 'healCrit');
          if (healCritP) {
            healAmt = Math.floor(healAmt * (1 + (healCritP.healBoostPct || 0.30)));
            if (Math.random() < (healCritP.critChance || 0.10)) {
              healAmt *= 2;
              logEntries.push({ text: `${chibi.name} : SOIN CRITIQUE x2 !`, time: elapsed, type: 'heal' });
            }
          }
          healTarget.hp = Math.min(healTarget.maxHp, healTarget.hp + healAmt);
          chibi.lastAttackAt = now;
          // Track healing
          if (healWindowTracker.current[chibi.id] !== undefined) healWindowTracker.current[chibi.id] += healAmt;
          if (healReceivedWindowTracker.current[healTarget.id] !== undefined) healReceivedWindowTracker.current[healTarget.id] += healAmt;
          const cHLog = detailedLogsRef.current[chibi.id];
          if (cHLog) cHLog.totalHealing = (cHLog.totalHealing || 0) + healAmt;
          const rHLog = detailedLogsRef.current[healTarget.id];
          if (rHLog) rHLog.healReceived = (rHLog.healReceived || 0) + healAmt;
          // Restore stats before return
          chibi.atk = origAtk; chibi.crit = origCrit; chibi.def = origDef; state.boss.def = origBossDef;
          const targetLabel = healTarget === chibi ? 'se soigne' : `soigne ${healTarget.name}`;
          logEntries.push({ text: `${chibi.name} ${targetLabel} +${fmt(healAmt)} PV`, time: elapsed, type: 'heal' });
          vfxEvents.push({ id: now + Math.random(), type: 'heal', targetId: healTarget.id, value: healAmt, timestamp: now });
          stateChanged = true;
          return;
        }
      }

      // Martyr Heal: if ally <30% HP and not yet healed, emergency heal once
      const martyrHeal = chibi.passives?.find(p => p.type === 'martyrHeal');
      if (martyrHeal && !chibi.passiveState.martyrHealed) {
        const critAlly = state.chibis.find(a => a.alive && a.id !== chibi.id && (a.hp / a.maxHp) < (martyrHeal.threshold || 0.30));
        if (critAlly) {
          const healAmt = Math.floor(critAlly.maxHp * (martyrHeal.healPct || 0.20));
          critAlly.hp = Math.min(critAlly.maxHp, critAlly.hp + healAmt);
          chibi.passiveState.martyrHealed = true;
          if (healWindowTracker.current[chibi.id] !== undefined) healWindowTracker.current[chibi.id] += healAmt;
          if (healReceivedWindowTracker.current[critAlly.id] !== undefined) healReceivedWindowTracker.current[critAlly.id] += healAmt;
          const mhLog = detailedLogsRef.current[chibi.id];
          if (mhLog) mhLog.totalHealing = (mhLog.totalHealing || 0) + healAmt;
          const mrLog = detailedLogsRef.current[critAlly.id];
          if (mrLog) mrLog.healReceived = (mrLog.healReceived || 0) + healAmt;
          logEntries.push({ text: `${chibi.name} [Martyr] soigne ${critAlly.name} +${fmt(healAmt)} PV !`, time: elapsed, type: 'heal' });
          vfxEvents.push({ id: now + Math.random(), type: 'heal', targetId: critAlly.id, value: healAmt, timestamp: now });
        }
      }

      // AI picks a skill considering mana
      const availSkills = chibi.skills.filter(s => {
        if ((s.cd || 0) > 0) return false;
        // manaThreshold skills (Megumin EXPLOSION): available if mana >= threshold% maxMana OR mana >= manaCost
        if (s.manaThreshold) return (chibi.mana || 0) >= (chibi.maxMana || 1) * s.manaThreshold || (chibi.mana || 0) >= (s.manaCost || 0);
        // consumeHalfMana: always available (no mana cost to check, just needs some mana)
        if (s.consumeHalfMana) return (chibi.mana || 0) > 0;
        const cost = chibi.passiveState?.echoFreeMana ? 0 : (s.manaCost || 0);
        return (chibi.mana || 999) >= cost;
      });
      // If no skill affordable (e.g. Megumin out of mana), skip turn
      if (availSkills.length === 0) {
        chibi.atk = origAtk; chibi.crit = origCrit; chibi.def = origDef;
        state.boss.def = origBossDef;
        chibi.lastAttackAt = now;
        return;
      }
      const entityForAI = { ...chibi, skills: availSkills.map(s => ({ ...s, cd: 0 })) };
      const skill = aiPickSkill(entityForAI);

      // Save mana before consumption (for manaScaling calculation)
      const manaBeforeConsume = chibi.mana || 0;

      // Consume mana
      if (skill.consumeHalfMana) {
        chibi.mana = Math.floor((chibi.mana || 0) / 2); // consume 50% of current mana
      } else if (chibi.maxMana > 0 && skill.manaCost > 0) {
        const actualCost = chibi.passiveState?.echoFreeMana ? 0 : skill.manaCost;
        chibi.mana = Math.max(0, (chibi.mana || 0) - actualCost);
        if (chibi.passiveState?.echoFreeMana) chibi.passiveState.echoFreeMana = false;
      }

      // Hunter passive: skillCd (Yoo) — CRIT boost on high-CD skills
      const preSkillCrit = chibi.crit;
      if (hp?.type === 'skillCd' && (skill.cdMax || 0) >= (hp.minCd || 3) && hp.stats?.crit) {
        chibi.crit = +(chibi.crit + hp.stats.crit).toFixed(1);
      }

      // Megumin manaScaling: power = mana (before consumption) × multiplier
      const skillForAttack = skill.manaScaling
        ? { ...skill, power: Math.floor(manaBeforeConsume * skill.manaScaling) }
        : skill;

      let result = computeAttack(chibi, skillForAttack, state.boss, chibi.talentBonuses || {});
      chibi.crit = preSkillCrit; // restore after compute

      // Hunter passive: defIgnore (Minnie) — extra DMG on crits (simulated as DEF ignore)
      if (hp?.type === 'defIgnore' && result.isCrit && result.damage > 0) {
        result = { ...result, damage: Math.floor(result.damage * (1 + (hp.value || 10) / 100)) };
      }

      // ── Passive: Desperate Fury — DMG scales with missing HP (+0.8% per 1% HP missing)
      const furyPassive = chibi.passives?.find(p => p.type === 'desperateFury');
      if (furyPassive && result.damage > 0) {
        const missingPct = 1 - chibi.hp / chibi.maxHp;
        result = { ...result, damage: Math.floor(result.damage * (1 + missingPct * 0.8)) };
      }

      // ── Passive: Last Stand — auto-crit + DEF ignore below 25% HP
      const lastStand = chibi.passives?.find(p => p.type === 'lastStand');
      if (lastStand && (chibi.hp / chibi.maxHp) < 0.25 && result.damage > 0) {
        result = { ...result, damage: Math.floor(result.damage * 1.5), isCrit: true };
        logEntries.push({ text: `${chibi.name} : Dernier Rempart ! CRIT garanti`, time: elapsed, type: 'buff' });
      }

      // ── Passive: Inner Flame — +3% DMG per stack (max 10), at 10 stacks auto-crit +50%
      const flammeStack = chibi.passives?.find(p => p.type === 'innerFlameStack');
      if (flammeStack && result.damage > 0) {
        chibi.passiveState.flammeStacks = Math.min(10, (chibi.passiveState.flammeStacks || 0) + 1);
        result = { ...result, damage: Math.floor(result.damage * (1 + chibi.passiveState.flammeStacks * 0.03)) };
      }
      const flammeRelease = chibi.passives?.find(p => p.type === 'innerFlameRelease');
      if (flammeRelease && (chibi.passiveState.flammeStacks || 0) >= 10 && result.damage > 0) {
        result = { ...result, damage: Math.floor(result.damage * 1.5), isCrit: true };
        chibi.passiveState.flammeStacks = 0;
        logEntries.push({ text: `${chibi.name} : Flamme Interieure DECHAINEE ! CRIT +50%`, time: elapsed, type: 'buff' });
      }

      // Shadow Pact Raid: +25% total DMG if any chibi has 4p passive
      if (result.damage > 0 && chibi.passiveState.shadowPactRaidBoost) {
        result = { ...result, damage: Math.floor(result.damage * (1 + chibi.passiveState.shadowPactRaidBoost)) };
      }

      // Katana V (Raid): +5% all stats permanent (cumulable), DoT, shield, x6 DMG
      const kvs = chibi.passiveState.katanaVState;
      if (kvs) {
        // Apply nextDmgMult if active
        if (kvs.nextDmgMult > 1 && result.damage > 0) {
          result = { ...result, damage: Math.floor(result.damage * kvs.nextDmgMult) };
          kvs.nextDmgMult = 1;
        }
        // Apply allStatBuff
        if (kvs.allStatBuff > 0 && result.damage > 0) {
          result = { ...result, damage: Math.floor(result.damage * (1 + kvs.allStatBuff / 100)) };
        }
        // Add DoT stack
        if (kvs.dots < KATANA_V_DOT_MAX_STACKS) kvs.dots++;
        // DoT tick on boss
        if (kvs.dots > 0) {
          const dotDmg = Math.max(1, Math.floor(chibi.atk * KATANA_V_DOT_PCT * kvs.dots));
          state.boss.hp -= dotDmg;
          dpsTracker.current[chibi.id] = (dpsTracker.current[chibi.id] || 0) + dotDmg;
          dpsWindowTracker.current[chibi.id] = (dpsWindowTracker.current[chibi.id] || 0) + dotDmg;
        }
        // 30% chance for random buff (+5% stats in raid)
        if (Math.random() < KATANA_V_BUFF_CHANCE) {
          const roll = Math.random();
          const cLog = detailedLogsRef.current[chibi.id];
          if (roll < 0.33) {
            kvs.allStatBuff += 5;
            logEntries.push({ text: `${chibi.name} : Benediction +5% stats ! (total +${kvs.allStatBuff}%)`, time: elapsed, type: 'buff', element: chibi.element, passive: 'Katana V' });
            if (cLog) {
              cLog.buffActivations.push({
                name: 'Katana V - Bénédiction Divine',
                value: `+${kvs.allStatBuff}% all stats`,
              });
            }
          } else if (roll < 0.66) {
            kvs.shield = true;
            if (cLog) {
              cLog.buffActivations.push({
                name: 'Katana V - Bouclier Divin',
                value: 'Absorbe 1 coup',
              });
            }
          } else {
            kvs.nextDmgMult = 6;
            logEntries.push({ text: `${chibi.name} : Puissance x6 prochain coup !`, time: elapsed, type: 'buff', element: chibi.element, passive: 'Katana V' });
            if (cLog) {
              cLog.buffActivations.push({
                name: 'Katana V - Puissance Divine',
                value: 'x6 DMG prochain coup',
              });
            }
          }
        }
      }

      // Restore original stats
      chibi.atk = origAtk;
      chibi.crit = origCrit;
      chibi.def = origDef;
      state.boss.def = origBossDef;

      // Megumin manaRestore: restore X% of max mana after attack
      if (skill.manaRestore && chibi.maxMana > 0) {
        const restored = Math.floor(chibi.maxMana * skill.manaRestore / 100);
        chibi.mana = Math.min(chibi.maxMana, (chibi.mana || 0) + restored);
        logEntries.push({ text: `${chibi.name} restaure ${restored} mana !`, time: elapsed, type: 'heal' });
      }

      // Apply damage to boss
      if (result.damage > 0) {
        state.boss.hp -= result.damage;
        dpsTracker.current[chibi.id] = (dpsTracker.current[chibi.id] || 0) + result.damage;
        dpsWindowTracker.current[chibi.id] = (dpsWindowTracker.current[chibi.id] || 0) + result.damage;

        // Track detailed logs
        const cLog = detailedLogsRef.current[chibi.id];
        if (cLog) {
          cLog.totalDamage = (cLog.totalDamage || 0) + result.damage;
          cLog.totalHits = (cLog.totalHits || 0) + 1;
          cLog.skillsUsed = (cLog.skillsUsed || 0) + 1;
          if (result.isCrit) {
            cLog.critHits = (cLog.critHits || 0) + 1;
            cLog.totalCritDamage = (cLog.totalCritDamage || 0) + result.damage;
            cLog.maxCrit = Math.max(cLog.maxCrit || 0, result.damage);
          }
          cLog.dps = elapsed > 0 ? cLog.totalDamage / elapsed : 0;
        }
        const bossLog = detailedLogsRef.current['boss'];
        if (bossLog) {
          bossLog.damageTaken = (bossLog.damageTaken || 0) + result.damage;
        }

        // ── Passive: Lifesteal — 15% chance to steal 12% DMG as HP
        if (chibi.passives?.find(p => p.type === 'lifesteal') && Math.random() < 0.15) {
          const heal = Math.floor(result.damage * 0.12);
          chibi.hp = Math.min(chibi.maxHp, chibi.hp + heal);
          logEntries.push({ text: `${chibi.name} : Vol de vie ! +${fmt(heal)} PV`, time: elapsed, type: 'heal' });
        }

        // Katana Z: +1 stack after each hit
        if (chibi.passiveState.katanaZStacks !== undefined) {
          chibi.passiveState.katanaZStacks++;
        }

        // Sulfuras: +33% DMG per attack cycle (max 100%)
        if (chibi.passiveState.sulfurasStacks !== undefined) {
          chibi.passiveState.sulfurasStacks = Math.min(SULFURAS_STACK_MAX, chibi.passiveState.sulfurasStacks + SULFURAS_STACK_PER_TURN);
        }

        // Shadow Silence: decay existing stacks, 10% chance to proc new +100% ATK (max 3)
        if (chibi.passiveState.shadowSilence !== undefined) {
          chibi.passiveState.shadowSilence = chibi.passiveState.shadowSilence.map(t => t - 1).filter(t => t > 0);
          if (chibi.passiveState.shadowSilence.length < 3 && Math.random() < 0.10) {
            chibi.passiveState.shadowSilence.push(5);
          }
        }

        // Gul'dan Halo Eternelle: post-attack stacking
        if (chibi.passiveState.guldanState && result.damage > 0) {
          const gs = chibi.passiveState.guldanState;
          gs.healStacks = (gs.healStacks || 0) + 1;
          const healAmt = Math.floor(result.damage * GULDAN_HEAL_PER_STACK * gs.healStacks);
          if (healAmt > 0) {
            chibi.hp = Math.min(chibi.maxHp, chibi.hp + healAmt);
            if (healWindowTracker.current[chibi.id] !== undefined) healWindowTracker.current[chibi.id] += healAmt;
            if (healReceivedWindowTracker.current[chibi.id] !== undefined) healReceivedWindowTracker.current[chibi.id] += healAmt;
            const gLog = detailedLogsRef.current[chibi.id];
            if (gLog) { gLog.totalHealing = (gLog.totalHealing || 0) + healAmt; gLog.healReceived = (gLog.healReceived || 0) + healAmt; }
            logEntries.push({ text: `${chibi.name} : Halo x${gs.healStacks} +${fmt(healAmt)} PV`, time: elapsed, type: 'heal' });
          }
          gs.defBonus = (gs.defBonus || 0) + GULDAN_DEF_PER_HIT;
          gs.atkBonus = (gs.atkBonus || 0) + GULDAN_ATK_PER_HIT;
          if (gs.spdStacks < GULDAN_SPD_MAX_STACKS && Math.random() < GULDAN_SPD_CHANCE) {
            gs.spdStacks++;
            logEntries.push({ text: `${chibi.name} : Halo Celeste ! SPD +${gs.spdStacks * 200}%`, time: elapsed, type: 'buff' });
          }
          // Stun: each heal stack has 50% chance → delay boss next attack
          let stunProcs = 0;
          for (let i = 0; i < gs.healStacks; i++) {
            if (Math.random() < GULDAN_STUN_CHANCE) stunProcs++;
          }
          if (stunProcs > 0 && state.boss.hp > 0) {
            state.boss.lastAttackAt = now; // reset boss attack timer = delay next attack
            logEntries.push({ text: `${chibi.name} : Halo Stun ! (${stunProcs} procs)`, time: elapsed, type: 'buff' });
          }
          // Halo Divin: resurrect first dead ally (once per combat)
          if (!gs.divinUsed) {
            const deadAlly = state.chibis.find(c => !c.alive && c.id !== chibi.id);
            if (deadAlly) {
              deadAlly.alive = true;
              deadAlly.hp = Math.floor(deadAlly.maxHp * 0.5);
              gs.divinUsed = true;
              logEntries.push({ text: `${chibi.name} : HALO DIVIN ! ${deadAlly.name} ressuscite a 50% PV !`, time: elapsed, type: 'heal' });
            }
          }
        }

        // ── ULTIME Artifact Passives: afterAttack ──
        // Rage Eternelle (2p): +1% ATK per attack (max 15 stacks) — individual
        const eternalRage = chibi.passives?.find(p => p.type === 'eternalRageStack');
        if (eternalRage) {
          const ps = chibi.passiveState;
          if (ps.eternalRageStacks < (eternalRage.maxStacks || 15)) {
            ps.eternalRageStacks++;
          }
        }
        // Rage Eternelle (4p): at 15 stacks → auto-crit + bonus DMG — individual
        const eternalRelease = chibi.passives?.find(p => p.type === 'eternalRageRelease');
        if (eternalRelease && chibi.passiveState.eternalRageStacks >= (eternalRelease.stackThreshold || 15)) {
          const bonusMult = 1 + (eternalRelease.bonusDmg || 0.40);
          result = { ...result, damage: Math.floor(result.damage * bonusMult), isCrit: true };
          chibi.passiveState.eternalRageStacks = 0;
          logEntries.push({ text: `${chibi.name} : Rage Eternelle LIBEREE ! x15 stacks`, time: elapsed, type: 'buff' });
        }

        // Siphon Vital (2p): 25% chance lifesteal 15% DMG, overheal = shield — individual
        const vitalSiphon = chibi.passives?.find(p => p.type === 'vitalSiphon');
        if (vitalSiphon && result.damage > 0 && Math.random() < (vitalSiphon.chance || 0.25)) {
          const steal = Math.floor(result.damage * (vitalSiphon.stealPct || 0.15));
          const newHp = chibi.hp + steal;
          if (newHp > chibi.maxHp) {
            const overheal = newHp - chibi.maxHp;
            chibi.hp = chibi.maxHp;
            chibi.passiveState.vitalOverhealShield = Math.min(
              Math.floor(chibi.maxHp * (vitalSiphon.overHealShield || 0.20)),
              (chibi.passiveState.vitalOverhealShield || 0) + overheal
            );
            logEntries.push({ text: `${chibi.name} : Siphon Vital ! +${fmt(steal)} PV (bouclier +${fmt(overheal)})`, time: elapsed, type: 'heal' });
          } else {
            chibi.hp = newHp;
            logEntries.push({ text: `${chibi.name} : Siphon Vital ! +${fmt(steal)} PV`, time: elapsed, type: 'heal' });
          }
        }

        // Tempete Arcane (2p): +2% DMG per 10% mana remaining — individual
        const arcaneTempest = chibi.passives?.find(p => p.type === 'arcaneTempest');
        if (arcaneTempest && result.damage > 0 && chibi.maxMana > 0) {
          const manaPct10 = Math.floor((chibi.mana / chibi.maxMana) * 10);
          const arcaneBonus = manaPct10 * (arcaneTempest.dmgPerMana10Pct || 0.02);
          if (arcaneBonus > 0) {
            result = { ...result, damage: Math.floor(result.damage * (1 + arcaneBonus)) };
          }
        }

        // Tempete Arcane (4p): if mana was full → x2 DMG (cooldown 5 attacks) — individual
        const arcaneOverload = chibi.passives?.find(p => p.type === 'arcaneOverload');
        if (arcaneOverload) {
          if (chibi.passiveState.arcaneOverloadCD > 0) chibi.passiveState.arcaneOverloadCD--;
          if (chibi.passiveState.arcaneOverloadCD <= 0 && chibi.mana >= chibi.maxMana * 0.95) {
            result = { ...result, damage: Math.floor(result.damage * (arcaneOverload.dmgMult || 2.0)) };
            chibi.passiveState.arcaneOverloadCD = arcaneOverload.cooldown || 5;
            logEntries.push({ text: `${chibi.name} : Arcane Overload ! DMG x${arcaneOverload.dmgMult || 2} !`, time: elapsed, type: 'buff' });
          }
        }

        // Equilibre Supreme (4p): counter for all-stats buff every 5 attacks — individual
        if (chibi.passiveState.supremeAllStatsInterval) {
          chibi.passiveState.supremeAllStatsCounter = (chibi.passiveState.supremeAllStatsCounter || 0) + 1;
          if (chibi.passiveState.supremeAllStatsCounter >= chibi.passiveState.supremeAllStatsInterval) {
            chibi.passiveState.supremeAllStatsCounter = 0;
            chibi.passiveState.supremeAllStatsBuff = chibi.passiveState.supremeAllStatsDuration || 3;
            chibi.buffs.push(
              { stat: 'atk', value: chibi.passiveState.supremeAllStatsBonus || 0.10, turns: 30 },
              { stat: 'def', value: chibi.passiveState.supremeAllStatsBonus || 0.10, turns: 30 }
            );
            logEntries.push({ text: `${chibi.name} : Equilibre Supreme ! Stats +${Math.round((chibi.passiveState.supremeAllStatsBonus || 0.10) * 100)}% !`, time: elapsed, type: 'buff' });
          }
        }

        // Check bar break
        if (state.boss.hp <= 0) {
          state.boss.barsDestroyed++;
          if (state.boss.barsDestroyed < state.boss.totalBars) {
            const tierHPMult = state.boss.tierData?.bossHPMult || 1;
            // Infinite bars: bar HP keeps scaling with barScaling formula (uses barIndex % cycle for the scaling function)
            const barIdx = state.boss.infiniteBars ? state.boss.barsDestroyed % 10 : state.boss.barsDestroyed;
            // For infinite mode, add progressive multiplier: each 10-bar cycle gets harder
            const cycleMult = state.boss.infiniteBars ? 1 + Math.floor(state.boss.barsDestroyed / 10) * 0.5 : 1;
            const nextBarHP = Math.floor(boss.barScaling(barIdx) * tierHPMult * cycleMult);
            state.boss.hp = nextBarHP;
            state.boss.maxHp = nextBarHP;
            logEntries.push({ text: `BARRE ${state.boss.barsDestroyed} DETRUITE ! +${state.boss.rcPerBar || 1} RC`, time: elapsed, type: 'bar_break' });
            vfxEvents.push({ id: now + Math.random() + 0.1, type: 'bar_break', timestamp: now });

            // Check phase transition — infinite mode: cycle phases every 10 bars
            let newPhase;
            if (state.boss.infiniteBars) {
              const cyclePos = state.boss.barsDestroyed % 10;
              newPhase = cyclePos >= 7 ? boss.phases[2] : cyclePos >= 4 ? boss.phases[1] : boss.phases[0];
            } else {
              const barsLeft = state.boss.totalBars - state.boss.barsDestroyed;
              newPhase = [...boss.phases].reverse().find(p => barsLeft <= p.barsRemaining);
            }
            if (newPhase && newPhase.name !== state.boss.phase.name) {
              state.boss.phase = newPhase;
              logEntries.push({ text: `PHASE: ${newPhase.name} !`, time: elapsed, type: 'phase' });
              vfxEvents.push({ id: now + Math.random() + 0.2, type: 'phase_change', phaseName: newPhase.name, timestamp: now });
            }
          }
        }
      }

      // Heal self
      if (result.healed > 0) {
        let healAmt = result.healed;
        // healCrit (Chaines du Destin 4p): +30% heal, 10% chance crit heal x2
        const healCritP = chibi.passives?.find(p => p.type === 'healCrit');
        if (healCritP) {
          healAmt = Math.floor(healAmt * (1 + (healCritP.healBoostPct || 0.30)));
          if (Math.random() < (healCritP.critChance || 0.10)) {
            healAmt *= 2;
            logEntries.push({ text: `${chibi.name} : SOIN CRITIQUE x2 !`, time: elapsed, type: 'heal' });
          }
        }
        // Siphon Vital emergency lifesteal: 100% for N attacks
        if (chibi.passiveState.vitalEmergencyActive > 0 && result.damage > 0) {
          const emergencyHeal = result.damage; // 100% lifesteal
          healAmt += emergencyHeal;
          chibi.passiveState.vitalEmergencyActive--;
        }
        if (chibi.passiveState.vitalEmergencyCD > 0) chibi.passiveState.vitalEmergencyCD--;
        chibi.hp = Math.min(chibi.maxHp, chibi.hp + healAmt);
        if (healWindowTracker.current[chibi.id] !== undefined) healWindowTracker.current[chibi.id] += healAmt;
        if (healReceivedWindowTracker.current[chibi.id] !== undefined) healReceivedWindowTracker.current[chibi.id] += healAmt;
        const shLog = detailedLogsRef.current[chibi.id];
        if (shLog) { shLog.totalHealing = (shLog.totalHealing || 0) + healAmt; shLog.healReceived = (shLog.healReceived || 0) + healAmt; }
      }

      // Apply buff/debuff
      if (result.buff) chibi.buffs.push({ ...result.buff });
      if (result.debuff) state.boss.buffs.push({ ...result.debuff });

      // Cooldown management (real-time)
      chibi.skills.forEach(s => {
        if (s === skill && s.cdMax > 0) {
          s.cd = s.cdMaxMs || s.cdMax * chibi.attackInterval;
          // ── Passive: Echo CD — 20% chance to reduce cooldown by 1 interval
          if (chibi.passives?.find(p => p.type === 'echoCD') && Math.random() < 0.20) {
            s.cd = Math.max(0, s.cd - chibi.attackInterval);
          }
        } else if (s.cd > 0) {
          s.cd = Math.max(0, s.cd - chibi.attackInterval);
        }
      });

      chibi.lastAttackAt = now;

      // SelfDamage: skill costs % of max HP
      if (skill.selfDamage && skill.selfDamage > 0) {
        const selfDmg = Math.floor(chibi.maxHp * skill.selfDamage / 100);
        chibi.hp = Math.max(1, chibi.hp - selfDmg);
        logEntries.push({ text: `${chibi.name} s'inflige ${fmt(selfDmg)} dégâts !`, time: elapsed, type: 'normal' });
      }
      // SelfStun: skip X attack cycles (Megumin post-explosion)
      if (skill.selfStunTurns && skill.selfStunTurns > 0) {
        chibi.lastAttackAt = now + skill.selfStunTurns * chibi.attackInterval;
        logEntries.push({ text: `${chibi.name} est étourdi(e) pendant ${skill.selfStunTurns} cycles !`, time: elapsed, type: 'normal' });
      }

      // Add element multiplier info to log
      const elemMult = getElementMult(chibi.element, state.boss.element);
      let elemText = '';
      if (elemMult > 1) elemText = ' \uD83D\uDCA5 Super efficace !';
      else if (elemMult < 1) elemText = ' \uD83D\uDEE1\uFE0F Peu efficace...';

      logEntries.push({
        text: result.text + elemText,
        time: elapsed,
        type: result.isCrit ? 'crit' : 'normal',
        element: chibi.element,
      });
      vfxEvents.push({ id: now + Math.random(), type: 'chibi_attack', sourceId: chibi.id, element: chibi.element, damage: result.damage, isCrit: result.isCrit, timestamp: now, attackInterval: chibi.attackInterval });

      // ── MEGUMIN EXPLOSION — special VFX + sound + Beru reaction ──
      if (skill.consumeAllMana) {
        vfxEvents.push({ id: now + Math.random() + 0.01, type: 'megumin_explosion', sourceId: chibi.id, damage: result.damage, isCrit: result.isCrit, timestamp: now });
        try { const sfx = new Audio('https://res.cloudinary.com/dbg7m8qjd/video/upload/v1771534482/ExposionMegumin_wpz0qo.mp3'); sfx.volume = 0.5; sfx.play().catch(() => {}); } catch {}
        window.dispatchEvent(new CustomEvent('beru-react', {
          detail: {
            message: ["WAAAH !! C'est quoi cette EXPLOSION ?!", "BERU A PEUR !! TROP DE FEU !!", "Megumin est FOLLE !! Ca va tout detruire !!", "EXPLOSION !! BERU SE CACHE !!"][Math.floor(Math.random() * 4)],
            mood: 'panicked',
          },
        }));
      }

      stateChanged = true;
    });

    // ─── Boss attacks ────────────────────────────────────────
    const bossInterval = BOSS_BASE_INTERVAL_MS / (state.boss.phase?.spdMult || 1);
    if (now - state.boss.lastAttackAt >= bossInterval) {
      const alive = state.chibis.filter(c => c.alive);
      if (alive.length > 0) {
        const phaseMult = state.boss.phase?.atkMult || 1;
        const origBossAtk = state.boss.atk;
        state.boss.atk = Math.floor(origBossAtk * phaseMult);

        // Boss picks a skill (CD-based)
        const availSkills = state.boss.skills.filter(s => now - s.lastUsedAt >= (s.cdSec || 0) * 1000);
        const bossSkill = availSkills.length > 1
          ? availSkills[Math.floor(Math.random() * availSkills.length)]
          : availSkills[0] || state.boss.skills[0];

        bossSkill.lastUsedAt = now;

        // Helper: apply damage to target with dodge check (Voile de l'Ombre passive)
        const applyBossDmgToTarget = (target, bSkill) => {
          const dodgeP = target.passives?.find(p => p.type === 'dodge');
          if (dodgeP && Math.random() < 0.12) {
            logEntries.push({ text: `${target.name} esquive !`, time: elapsed, type: 'dodge' });
            // Counter on dodge (Voile de l'Ombre 4p)
            const counterP = target.passives?.find(p => p.type === 'counter');
            if (counterP) {
              const counterDmg = Math.floor(target.atk * (counterP.powerMult || 0.8));
              state.boss.hp -= counterDmg;
              dpsTracker.current[target.id] = (dpsTracker.current[target.id] || 0) + counterDmg;
              dpsWindowTracker.current[target.id] = (dpsWindowTracker.current[target.id] || 0) + counterDmg;
              logEntries.push({ text: `${target.name} contre-attaque ! -${fmt(counterDmg)}`, time: elapsed, type: 'crit' });
            }
            return;
          }
          const dmg = computeAttack(state.boss, bSkill, target);
          // Katana V shield: absorb hit entirely
          if (target.passiveState?.katanaVState?.shield && dmg.damage > 0) {
            target.passiveState.katanaVState.shield = false;
            logEntries.push({ text: `${target.name} : Bouclier Divin absorbe le coup !`, time: elapsed, type: 'buff' });
            return dmg;
          }
          let actualDmg = dmg.damage;
          // Gardien Celeste: shield absorbs damage first — individual
          if (target.passiveState?.celestialShield > 0 && actualDmg > 0) {
            if (actualDmg <= target.passiveState.celestialShield) {
              target.passiveState.celestialShield -= actualDmg;
              actualDmg = 0;
            } else {
              actualDmg -= target.passiveState.celestialShield;
              target.passiveState.celestialShield = 0;
              // Shield broken → heal 30% HP + DEF +20% for 3 attacks — individual
              if (!target.passiveState.celestialShieldBroken) {
                target.passiveState.celestialShieldBroken = true;
                const celWrath = target.passives?.find(p => p.type === 'celestialWrath');
                if (celWrath) {
                  const healAmt = Math.floor(target.maxHp * (celWrath.healOnBreak || 0.30));
                  target.hp = Math.min(target.maxHp, target.hp + healAmt);
                  target.buffs.push({ stat: 'def', value: celWrath.defBoost || 0.20, turns: 30 });
                  if (healWindowTracker.current[target.id] !== undefined) healWindowTracker.current[target.id] += healAmt;
                  if (healReceivedWindowTracker.current[target.id] !== undefined) healReceivedWindowTracker.current[target.id] += healAmt;
                  const celLog = detailedLogsRef.current[target.id];
                  if (celLog) { celLog.totalHealing = (celLog.totalHealing || 0) + healAmt; celLog.healReceived = (celLog.healReceived || 0) + healAmt; }
                  logEntries.push({ text: `${target.name} : Gardien Celeste brise ! Heal +${fmt(healAmt)} + DEF +${Math.round((celWrath.defBoost || 0.20) * 100)}% !`, time: elapsed, type: 'buff' });
                }
              }
            }
          }
          // Siphon Vital: overheal shield absorbs remaining damage — individual
          if (target.passiveState?.vitalOverhealShield > 0 && actualDmg > 0) {
            if (actualDmg <= target.passiveState.vitalOverhealShield) {
              target.passiveState.vitalOverhealShield -= actualDmg;
              actualDmg = 0;
            } else {
              actualDmg -= target.passiveState.vitalOverhealShield;
              target.passiveState.vitalOverhealShield = 0;
            }
          }
          // Siphon Vital (4p): HP < 30% → emergency 100% lifesteal for 2 attacks — individual
          const vSurge = target.passives?.find(p => p.type === 'vitalSurge');
          if (vSurge && target.passiveState.vitalEmergencyCD <= 0 && target.hp > 0 && (target.hp / target.maxHp) < (vSurge.lowHpThreshold || 0.30)) {
            target.passiveState.vitalEmergencyActive = vSurge.emergencyDuration || 2;
            target.passiveState.vitalEmergencyCD = vSurge.emergencyCD || 10;
            logEntries.push({ text: `${target.name} : Siphon Vital mode urgence ! Lifesteal 100% pendant ${target.passiveState.vitalEmergencyActive} attaques !`, time: elapsed, type: 'buff' });
          }
          target.hp -= actualDmg;
          if (actualDmg > 0 && dmgTakenWindowTracker.current[target.id] !== undefined) dmgTakenWindowTracker.current[target.id] += actualDmg;
          const dtLog = detailedLogsRef.current[target.id];
          if (dtLog && actualDmg > 0) dtLog.damageTaken = (dtLog.damageTaken || 0) + actualDmg;
          // Reset flamme stacks when hit
          if (target.passiveState?.flammeStacks > 0) target.passiveState.flammeStacks = 0;

          // Katana Z: counter-attack (50% chance) + stack persistence (50% per stack)
          if (target.passiveState?.katanaZStacks !== undefined && actualDmg > 0 && target.hp > 0) {
            // Counter-attack
            if (Math.random() < KATANA_Z_COUNTER_CHANCE) {
              const counterDmg = Math.max(1, Math.floor(target.atk * KATANA_Z_COUNTER_MULT));
              state.boss.hp -= counterDmg;
              dpsTracker.current[target.id] = (dpsTracker.current[target.id] || 0) + counterDmg;
              dpsWindowTracker.current[target.id] = (dpsWindowTracker.current[target.id] || 0) + counterDmg;
              logEntries.push({ text: `${target.name} : Katana Z contre-attaque ! -${fmt(counterDmg)}`, time: elapsed, type: 'crit' });
            }
            // Stack persistence: each stack has 50% chance to survive
            if (target.passiveState.katanaZStacks > 0) {
              let surviving = 0;
              for (let i = 0; i < target.passiveState.katanaZStacks; i++) {
                if (Math.random() < KATANA_Z_STACK_PERSIST_CHANCE) surviving++;
              }
              target.passiveState.katanaZStacks = surviving;
            }
          }

          if (target.hp <= 0) { target.hp = 0; target.alive = false; }
          return dmg;
        };

        if (bossSkill.target === 'aoe') {
          alive.forEach(target => applyBossDmgToTarget(target, bossSkill));
          logEntries.push({ text: `${state.boss.name} utilise ${bossSkill.name} ! AoE sur toute l'equipe !`, time: elapsed, type: 'boss' });
          vfxEvents.push({ id: now + Math.random() + 0.3, type: 'boss_aoe', timestamp: now });
        } else if (bossSkill.target === 'multi') {
          const hits = bossSkill.hits || 3;
          for (let i = 0; i < hits; i++) {
            const aliveNow = state.chibis.filter(c => c.alive);
            if (aliveNow.length === 0) break;
            const target = aliveNow[Math.floor(Math.random() * aliveNow.length)];
            applyBossDmgToTarget(target, bossSkill);
          }
          logEntries.push({ text: `${state.boss.name} utilise ${bossSkill.name} ! ${bossSkill.hits || 3} frappes !`, time: elapsed, type: 'boss' });
          vfxEvents.push({ id: now + Math.random() + 0.4, type: 'boss_aoe', timestamp: now });
        } else {
          const target = alive[Math.floor(Math.random() * alive.length)];
          const dmg = applyBossDmgToTarget(target, bossSkill);

          // Boss element advantage
          const bossElemMult = getElementMult(state.boss.element, target.element);
          let bossElemText = '';
          if (bossElemMult > 1) bossElemText = ' \uD83D\uDCA5';
          else if (bossElemMult < 1) bossElemText = ' \uD83D\uDEE1\uFE0F';

          logEntries.push({
            text: `${state.boss.name} → ${target.name}: ${bossSkill.name} -${fmt(dmg?.damage || 0)} PV${bossElemText}${!target.alive ? ' K.O. !' : ''}`,
            time: elapsed,
            type: 'boss',
            element: state.boss.element,
          });
          vfxEvents.push({ id: now + Math.random() + 0.5, type: 'boss_attack', targetId: target.id, damage: dmg?.damage || 0, timestamp: now });
        }

        // Boss self buff
        if (bossSkill.buffAtk) {
          state.boss.buffs.push({ stat: 'atk', value: bossSkill.buffAtk / 100, turns: 99 });
        }

        state.boss.atk = origBossAtk;
        state.boss.lastAttackAt = now;
        stateChanged = true;
      }
    }

    // ─── Decay chibi buffs (turn-based → time-based: rough approx) ──
    state.chibis.forEach(c => {
      if (!c.alive) return;
      c.buffs = c.buffs.filter(b => {
        b.turns -= 0.1 / (c.attackInterval / 1000);
        return b.turns > 0;
      });
    });

    // ─── Update React state periodically (every 200ms for perf) ──
    if (stateChanged || logEntries.length > 0) {
      setBattleState({ ...state });
    }

    if (logEntries.length > 0) {
      setCombatLog(prev => [...prev, ...logEntries]); // Keep ALL logs (local storage only)
    }

    // Push VFX events
    if (vfxEvents.length > 0) {
      setVfxQueue(prev => [...prev.filter(v => now - v.timestamp < 800).slice(-20), ...vfxEvents]);
    }

    // DPS snapshot every 1 second — rolling window with HPS/HRPS/DTPS
    if (elapsed - lastDpsSnapshotRef.current >= 1) {
      const windowDuration = elapsed - lastDpsSnapshotRef.current;
      const snapshot = { time: +elapsed.toFixed(1) };
      state.chibis.forEach(c => {
        const windowDmg = dpsWindowTracker.current[c.id] || 0;
        const windowHeal = healWindowTracker.current[c.id] || 0;
        const windowHealRecv = healReceivedWindowTracker.current[c.id] || 0;
        const windowDmgTaken = dmgTakenWindowTracker.current[c.id] || 0;
        snapshot[c.id] = windowDuration > 0 ? Math.floor(windowDmg / windowDuration) : 0;
        snapshot[`${c.id}_hps`] = windowDuration > 0 ? Math.floor(windowHeal / windowDuration) : 0;
        snapshot[`${c.id}_hrps`] = windowDuration > 0 ? Math.floor(windowHealRecv / windowDuration) : 0;
        snapshot[`${c.id}_dtps`] = windowDuration > 0 ? Math.floor(windowDmgTaken / windowDuration) : 0;
        dpsWindowTracker.current[c.id] = 0;
        healWindowTracker.current[c.id] = 0;
        healReceivedWindowTracker.current[c.id] = 0;
        dmgTakenWindowTracker.current[c.id] = 0;
      });
      const bossWindowDmg = dpsWindowTracker.current['boss'] || 0;
      snapshot['boss'] = windowDuration > 0 ? bossWindowDmg / windowDuration : 0;
      dpsWindowTracker.current['boss'] = 0;
      setDpsHistory(prev => [...prev, snapshot]);
      setDetailedLogs({ ...detailedLogsRef.current });
      lastDpsSnapshotRef.current = elapsed;
    }

    setTimer(remaining);
    setActiveSungBuffs([...sungBuffsRef.current]);
    setSungCooldowns({ ...sungCDRef.current });
  }, [boss, bossId, coloData, raidData, team1, team2]);

  // ─── Start game loop ───────────────────────────────────────
  useEffect(() => {
    if (phase === 'battle' && battleRef.current && !gameLoopRef.current) {
      gameLoopRef.current = setInterval(gameTick, RAID_TICK_MS);
    }
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [phase, gameTick]);

  // ─── Keyboard handler for Sung skills ──────────────────────
  useEffect(() => {
    if (phase !== 'battle') return;
    const handler = (e) => {
      if (pausedRef.current) return;
      const k = e.key.toLowerCase();
      const skill = SUNG_SKILLS.find(s => s.key === k || s.altKey === k);
      if (!skill) return;
      e.preventDefault();

      const now = Date.now();
      const cd = sungCDRef.current[skill.id];
      if (cd && cd > now) return; // still on CD

      // Activate skill
      sungCDRef.current[skill.id] = now + skill.cdSec * 1000;

      if (skill.effect.type === 'heal') {
        // Heal all alive chibis
        const state = battleRef.current;
        if (state) {
          state.chibis.forEach(c => {
            if (!c.alive) return;
            c.hp = Math.min(c.maxHp, c.hp + Math.floor(c.maxHp * skill.effect.value / 100));
          });
          setBattleState({ ...state });
        }
        setCombatLog(prev => [...prev, {
          text: `Sung Jinwoo: ${skill.name} ! Soin ${skill.effect.value}% PV !`,
          time: timerRef.current, type: 'sung',
        }]);
      } else {
        // Buff or debuff
        sungBuffsRef.current.push({
          id: skill.id,
          effect: skill.effect,
          expiresAt: now + skill.durationSec * 1000,
        });
        setCombatLog(prev => [...prev, {
          text: `Sung Jinwoo: ${skill.name} ! ${skill.desc}`,
          time: timerRef.current, type: 'sung',
        }]);
      }

      setSungCooldowns({ ...sungCDRef.current });
      setActiveSungBuffs([...sungBuffsRef.current]);
      // VFX for Sung skill
      setVfxQueue(prev => [...prev.slice(-20), { id: now + Math.random(), type: 'sung_skill', color: SUNG_GLOW[skill.id] || 'rgba(168,85,247,0.3)', timestamp: now }]);
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase]);

  // ─── Pause toggle ──────────────────────────────────────────
  const togglePause = () => {
    pausedRef.current = !pausedRef.current;
    setIsPaused(pausedRef.current);
    if (!pausedRef.current) {
      // Adjust startTime to account for pause
      startTimeRef.current += Date.now() - startTimeRef.current - (RAID_DURATION_SEC - timerRef.current) * 1000;
    }
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER — Setup Phase
  // ═══════════════════════════════════════════════════════════

  const renderSetup = () => {
    const currentTierData = getTierData(selectedTier);
    return (
    <div className="space-y-6">
      {/* Boss Preview */}
      <div className="bg-gradient-to-r from-red-900/40 to-amber-900/40 border border-red-500/30 rounded-2xl p-4 text-center relative">
        {/* Tier badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg border ${currentTierData.borderColor} bg-gradient-to-r ${currentTierData.bgGradient}`}>
          <span className={`text-xs font-bold ${currentTierData.nameColor}`}>Tier {selectedTier}: {currentTierData.name}</span>
        </div>
        <div className="text-3xl mb-1">{boss.emoji}</div>
        <h2 className="text-xl font-bold text-red-400">{boss.name}</h2>
        <div className="flex items-center justify-center gap-3 text-sm text-gray-400 mt-1">
          <span className={ELEMENTS[boss.element]?.color}>{ELEMENTS[boss.element]?.icon} {ELEMENTS[boss.element]?.name}</span>
          <span>|</span>
          <span>{currentTierData.infiniteBars ? '\u221E Barres' : `${boss.totalBars} Barres`}</span>
          <span>|</span>
          <span>HP: {fmt(Math.floor(boss.baseHP * currentTierData.bossHPMult))}{currentTierData.infiniteBars ? '+' : ` \u2192 ${fmt(Math.floor(boss.barScaling(boss.totalBars - 1) * currentTierData.bossHPMult))}`}</span>
        </div>
        <div className="flex justify-center gap-1 mt-2">
          {currentTierData.infiniteBars ? (
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-3 h-3 rotate-45 bg-red-500/60 border border-red-400/40" />
              ))}
              <span className="text-red-400 text-sm font-bold mx-1">{'\u221E'}</span>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i + 5} className="w-3 h-3 rotate-45 bg-red-500/60 border border-red-400/40" />
              ))}
            </div>
          ) : (
            Array.from({ length: boss.totalBars }).map((_, i) => (
              <div key={i} className="w-3 h-3 rotate-45 bg-red-500/60 border border-red-400/40" />
            ))
          )}
        </div>
      </div>

      {/* Tier Selector */}
      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
        <h3 className="text-sm font-bold text-center mb-2 text-gray-300">Difficulte</h3>
        <div className="flex gap-2 justify-center flex-wrap">
          {Array.from({ length: raidData.unlockedTier || 1 }, (_, i) => i + 1).map(tier => {
            const td = getTierData(tier);
            const isSelected = selectedTier === tier;
            const tierBest = raidData.raidStats?.tierBestRC?.[tier] || 0;
            const isCleared = !td.infiniteBars && tierBest >= td.maxRC;
            return (
              <button key={tier} onClick={() => setSelectedTier(tier)}
                className={`flex flex-col items-center px-3 py-2 rounded-lg border-2 transition-all ${
                  isSelected ? `${td.borderColor} bg-gradient-to-r ${td.bgGradient} scale-105` : 'border-white/20 bg-white/5 hover:border-white/40'
                }`}>
                <span className={`text-sm font-bold ${td.nameColor}`}>{td.name}</span>
                <span className="text-[10px] text-gray-400">{td.infiniteBars ? 'RC \u221E' : `RC x${td.rcPerBar}`}</span>
                {isCleared && <span className="text-[10px] text-green-400">Clear</span>}
                {tierBest > 0 && !isCleared && <span className="text-[9px] text-gray-500">Best: {tierBest}</span>}
              </button>
            );
          })}
        </div>
        {/* Tier details */}
        <div className="mt-3 p-2 rounded-lg bg-black/20 border border-white/10">
          <div className="grid grid-cols-4 gap-2 text-[10px] text-center">
            <div className="text-gray-400">RC Max<br/><span className="text-white font-bold text-xs">{currentTierData.infiniteBars ? '\u221E' : currentTierData.maxRC}</span></div>
            <div className="text-gray-400">Coins<br/><span className="text-yellow-400 font-bold text-xs">x{currentTierData.coinMult}</span></div>
            <div className="text-gray-400">HP Boss<br/><span className="text-red-400 font-bold text-xs">x{currentTierData.bossHPMult}</span></div>
            <div className="text-gray-400">XP<br/><span className="text-green-400 font-bold text-xs">x{currentTierData.xpMult}</span></div>
          </div>
        </div>
        {currentTierData.infiniteBars && (
          <div className="mt-2 text-center text-[10px] text-red-300 font-bold">RC illimite — Detruis un max de barres en 180s !</div>
        )}
        {!currentTierData.infiniteBars && (raidData.unlockedTier || 1) < MAX_RAID_TIER && selectedTier === (raidData.unlockedTier || 1) && (
          <div className="mt-2 text-center text-[10px] text-amber-400">Clear complet (10/10) pour debloquer Tier {(raidData.unlockedTier || 1) + 1}</div>
        )}
      </div>

      {/* Teams */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map(teamNum => {
          const team = teamNum === 1 ? team1 : team2;
          const syn = teamNum === 1 ? synergy1 : synergy2;
          return (
            <div key={teamNum} className="bg-white/5 rounded-xl p-3 border border-white/10">
              <h3 className="text-sm font-bold text-center mb-3 text-purple-300">Team {teamNum}</h3>
              <div className="flex gap-2 justify-center mb-3">
                {team.map((id, idx) => {
                  const chibi = id ? allPool[id] : null;
                  const isActive = pickSlot?.team === teamNum && pickSlot?.idx === idx;
                  return (
                    <button key={idx} onClick={() => handleSlotClick(teamNum, idx)}
                      className={`w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                        isActive ? 'border-purple-400 bg-purple-500/20 scale-105' :
                        chibi ? 'border-white/20 bg-white/5' : 'border-dashed border-white/20 bg-white/5'
                      }`}>
                      {chibi ? (
                        <>
                          <img src={chibi.sprite} alt={chibi.name} className="w-10 h-10 rounded-full object-cover" />
                          <span className="text-[10px] text-white/80 mt-1 truncate w-full text-center">{chibi.name}</span>
                          <span className="text-[9px] text-yellow-400">Lv.{getChibiLevel(id)}</span>
                        </>
                      ) : (
                        <span className="text-2xl text-white/20">+</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {/* Synergies */}
              {syn.labels.length > 0 && (
                <div className="space-y-0.5">
                  {syn.labels.map((l, i) => (
                    <div key={i} className="text-[10px] text-emerald-400 text-center">{l}</div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Previous team button */}
      {raidData.lastTeam && raidData.lastTeam.some(Boolean) && (
        <div className="flex justify-center">
          <button onClick={() => {
            const lt = raidData.lastTeam;
            const valid = lt.map(id => (id && allPool[id]) ? id : null);
            setTeam1([valid[0] || null, valid[1] || null, valid[2] || null]);
            setTeam2([valid[3] || null, valid[4] || null, valid[5] || null]);
            setPickSlot(null);
          }}
            className="px-4 py-2 rounded-lg bg-purple-500/15 border border-purple-500/40 text-purple-300 text-sm font-medium hover:bg-purple-500/25 hover:border-purple-400/60 transition-all flex items-center gap-2">
            🔄 Team precedente
          </button>
        </div>
      )}

      {/* Cross-team synergy */}
      {crossSynergy.labels.length > 0 && (
        <div className="text-center text-xs text-yellow-400">
          {crossSynergy.labels.join(' | ')}
        </div>
      )}

      {/* ─── Team Passives Detail Panel ─── */}
      {selectedIds.length > 0 && (
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-2">Passifs & Stats de l'equipe</div>
          <div className="space-y-2">
            {selectedIds.map(id => {
              const c = allPool[id];
              if (!c) return null;
              const isHunter = !!HUNTERS[id];
              const hp = isHunter ? HUNTER_PASSIVE_EFFECTS[id] : null;
              const passiveDesc = isHunter ? HUNTERS[id]?.passiveDesc : null;
              const lv = getChibiLevel(id);
              const stars = isHunter ? getHunterStars(raidData, id) : 0;
              const fs = getChibiStats(id);
              if (!fs) return null;

              const passiveTypeColors = {
                permanent: 'text-emerald-400', firstTurn: 'text-yellow-400', lowHp: 'text-red-400',
                highHp: 'text-blue-400', stacking: 'text-orange-400', healBonus: 'text-green-400',
                critDmg: 'text-amber-400', magicDmg: 'text-indigo-400', vsBoss: 'text-red-300',
                aoeDmg: 'text-cyan-400', dotDmg: 'text-lime-400', defIgnore: 'text-gray-300',
                teamDef: 'text-teal-400', buffBonus: 'text-violet-400', debuffBonus: 'text-rose-400',
                vsLowHp: 'text-pink-400', vsDebuffed: 'text-purple-400', skillCd: 'text-fuchsia-400',
              };

              return (
                <div key={id} className="flex items-start gap-2.5 p-2 rounded-lg bg-gray-800/40">
                  <img src={c.sprite} alt="" className="w-9 h-9 object-contain rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[11px] font-bold text-white truncate">{c.name}</span>
                      <span className={`text-[9px] ${ELEMENTS[c.element]?.color}`}>{ELEMENTS[c.element]?.icon}</span>
                      {stars > 0 && <span className="text-[8px] text-yellow-400 font-bold">A{stars}</span>}
                      <span className="text-[8px] text-gray-500">Lv{lv}</span>
                    </div>
                    {/* Stats row */}
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[9px]">
                      <span className="text-red-400">ATK:{fs.atk}</span>
                      <span className="text-green-400">HP:{fs.hp}</span>
                      <span className="text-blue-400">DEF:{fs.def}</span>
                      <span className="text-yellow-400">SPD:{fs.spd}</span>
                      <span className="text-amber-400">CRIT:{Math.min(80, fs.crit).toFixed(0)}</span>
                    </div>
                    {/* Passive */}
                    {hp && passiveDesc && (
                      <div className={`mt-1 text-[9px] ${passiveTypeColors[hp.type] || 'text-gray-400'}`}>
                        <span className="text-[8px] text-gray-600 uppercase mr-1">[{hp.type}]</span>
                        {passiveDesc}
                        {hp.type === 'teamDef' && <span className="ml-1 text-[8px] px-1 rounded bg-teal-900/40 text-teal-300">EQUIPE</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chibi Pool */}
      {pickSlot && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-xl p-3 border border-white/10">
          <h3 className="text-sm font-bold text-center mb-2 text-gray-300">Tes Combattants</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-60 overflow-y-auto">
            {Object.entries(allPool).filter(([id]) => !selectedIds.includes(id)).map(([id, c]) => (
              <button key={id} onClick={() => handlePickChibi(id)}
                className="flex flex-col items-center p-2 rounded-lg bg-white/5 border border-white/10 hover:border-purple-400/60 transition-all hover:bg-purple-500/10">
                <img src={c.sprite} alt={c.name} className="w-10 h-10 rounded-full object-cover" />
                <span className="text-[10px] text-white/80 mt-1 truncate w-full text-center">{c.name}</span>
                <span className={`text-[9px] ${RARITY[c.rarity]?.color}`}>{RARITY[c.rarity]?.stars}</span>
                <span className={`text-[9px] ${ELEMENTS[c.element]?.color}`}>{ELEMENTS[c.element]?.icon}</span>
                <span className="text-[9px] text-yellow-400">Lv.{getChibiLevel(id)}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Launch button */}
      <div className="flex justify-center gap-3">
        <Link to="/shadow-colosseum"
          className="px-4 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-all text-sm">
          Retour
        </Link>
        <button onClick={startRaid}
          disabled={selectedIds.length === 0}
          className="px-8 py-3 rounded-xl font-bold text-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95">
          LANCER LE RAID
        </button>
      </div>
    </div>
  );
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER — Result Phase
  // ═══════════════════════════════════════════════════════════

  const renderResult = () => {
    if (!resultData) return null;
    const { rc, barsDestroyed = 0, isFullClear, totalDamage, endReason, dpsBreakdown, rewards, unlockedHunters, hunterDuplicates = [], hammerDrops = {}, raidArtifactDrops = [], raidWeaponDrop = null, duration, tier = 1, tierData: resTierData, tierUnlocked } = resultData;
    const resTd = resTierData || getTierData(tier);
    const min = Math.floor(duration / 60);
    const sec = duration % 60;

    return (
      <div className="space-y-4">
        {/* Header */}
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className={`text-center p-6 rounded-2xl border ${
            isFullClear ? 'bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-yellow-500/30' :
            endReason === 'wipe' ? 'bg-gradient-to-r from-red-900/40 to-gray-900/40 border-red-500/30' :
            tier === 6 && endReason === 'timeout' ? 'bg-gradient-to-r from-red-900/40 to-orange-900/40 border-orange-500/30' :
            'bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-blue-500/30'
          }`}>
          {/* Tier badge */}
          <div className={`inline-block px-3 py-1 rounded-lg mb-2 border ${resTd.borderColor} bg-gradient-to-r ${resTd.bgGradient}`}>
            <span className={`text-sm font-bold ${resTd.nameColor}`}>Tier {tier}: {resTd.name}</span>
          </div>
          <div className="text-4xl mb-2">{isFullClear ? '\uD83C\uDFC6' : endReason === 'wipe' ? '\uD83D\uDC80' : tier === 6 ? '\uD83D\uDD25' : '\u23F1\uFE0F'}</div>
          <h2 className="text-2xl font-bold mb-1">
            {isFullClear ? 'VICTOIRE TOTALE !' : endReason === 'wipe' ? 'EQUIPE ELIMINEE' : tier === 6 ? 'RAID ULTIME TERMINE !' : 'TEMPS ECOULE'}
          </h2>
          <div className="flex justify-center gap-6 text-lg">
            <span className="text-orange-400">RC: <b>{rc}</b> <span className="text-xs text-gray-400">({barsDestroyed}{resTierData?.infiniteBars ? '' : '/10'} barres)</span></span>
            <span className="text-blue-400">DMG: <b>{fmt(totalDamage)}</b></span>
            <span className="text-gray-400">{min}:{sec.toString().padStart(2, '0')}</span>
          </div>
        </motion.div>

        {/* Tier Unlock Notification */}
        {tierUnlocked && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500/50 rounded-2xl p-4 text-center">
            <div className="text-3xl mb-2">{'\uD83D\uDD13'}</div>
            <div className="text-lg font-bold text-yellow-400 mb-1">Nouveau Tier Debloque !</div>
            <div className={`text-sm font-bold ${getTierData(tierUnlocked).nameColor}`}>
              Tier {tierUnlocked}: {getTierData(tierUnlocked).name}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              RC Max: {getTierData(tierUnlocked).infiniteBars ? '\u221E' : getTierData(tierUnlocked).maxRC} | Boss HP: x{getTierData(tierUnlocked).bossHPMult} | Coins: x{getTierData(tierUnlocked).coinMult}
            </div>
          </motion.div>
        )}

        {/* Rewards */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
          <div className="text-yellow-400 text-lg font-bold mb-1">+{fmt(rewards.coins)} Shadow Coins</div>
          <div className="text-emerald-400 text-sm">+{rewards.xpPerChibi} XP par chibi</div>
          {/* Hammer drops */}
          {Object.keys(hammerDrops).length > 0 && (
            <div className="flex justify-center gap-3 mt-2">
              {Object.entries(hammerDrops).map(([hId, count]) => (
                <div key={hId} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <span className="text-sm">{HAMMERS[hId]?.icon}</span>
                  <span className="text-[10px] text-amber-300 font-bold">{HAMMERS[hId]?.name?.split(' ').pop()}</span>
                  <span className="text-xs text-amber-400">x{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Raid Artifact Drops */}
        {raidArtifactDrops.length > 0 && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-r from-violet-900/30 to-indigo-900/30 rounded-xl p-4 border border-violet-500/30 text-center">
            <div className="text-lg font-bold text-violet-400 mb-2">Artefacts de Raid !</div>
            <div className="flex justify-center gap-3 flex-wrap">
              {raidArtifactDrops.map((art, i) => {
                const setData = RAID_ARTIFACT_SETS[art.set];
                const rarityColors = { rare: 'border-blue-400 text-blue-400', legendaire: 'border-yellow-400 text-yellow-400', mythique: 'border-red-400 text-red-400' };
                return (
                  <div key={art.uid || i} className={`flex flex-col items-center p-2 rounded-lg bg-white/5 border ${rarityColors[art.rarity]?.split(' ')[0] || 'border-white/20'}`}>
                    <span className="text-xl">{setData?.icon || '?'}</span>
                    <span className="text-[10px] font-bold mt-1">{art.slotId}</span>
                    <span className={`text-[9px] ${rarityColors[art.rarity]?.split(' ')[1] || ''}`}>{art.rarity}</span>
                    <span className="text-[8px] text-gray-400">{setData?.name || art.set}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Raid Weapon Drop */}
        {raidWeaponDrop && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-xl p-4 border border-orange-500/30 text-center">
            <div className="text-lg font-bold text-orange-400 mb-2">{'\u2694\uFE0F'} Arme Obtenue !</div>
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-1">{raidWeaponDrop.icon}</span>
              <span className="text-sm font-black text-white">{raidWeaponDrop.name}</span>
              <span className="text-[10px] text-orange-300">ATK +{raidWeaponDrop.atk} | {MAIN_STAT_VALUES[raidWeaponDrop.bonusStat]?.name} +{raidWeaponDrop.bonusValue}</span>
              {raidWeaponDrop.isNew ? (
                <span className="text-green-400 text-xs mt-1">Nouvelle arme !</span>
              ) : (
                <span className="text-yellow-400 text-xs mt-1">Eveil A{(raidWeaponDrop.newAwakening || 1) - 1} {'\u2192'} A{raidWeaponDrop.newAwakening || 1}</span>
              )}
            </div>
          </motion.div>
        )}

        {/* DPS Breakdown */}
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <h3 className="text-sm font-bold text-center mb-2 text-gray-300">DPS Breakdown</h3>
          <div className="space-y-2">
            {dpsBreakdown.map((d, i) => (
              <div key={d.id} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-4">#{i + 1}</span>
                <img src={d.sprite} alt={d.name} className="w-6 h-6 rounded-full object-cover" />
                <span className="text-xs flex-1 truncate">{d.name}</span>
                <span className="text-xs text-gray-400">{fmt(d.damage)}</span>
                <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${ELEMENTS[d.element]?.bg?.replace('/20', '') || 'bg-purple-500'}`}
                    style={{ width: `${d.percent}%` }} />
                </div>
                <span className="text-[10px] text-gray-500 w-10 text-right">{d.percent.toFixed(1)}%</span>
              </div>
            ))}
          </div>

          {/* View Detailed Stats Button */}
          <div className="flex justify-center mt-3">
            <button
              onClick={() => setShowDetailedStats(true)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm transition-all border border-purple-400/30 flex items-center gap-2"
            >
              📊 Voir les stats détaillées
            </button>
          </div>
        </div>

        {/* Hunter Unlocks */}
        {unlockedHunters.length > 0 && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-r from-yellow-900/30 to-purple-900/30 rounded-xl p-4 border border-yellow-500/30 text-center">
            <div className="text-lg font-bold text-yellow-400 mb-2">Hunters Debloques !</div>
            <div className="flex justify-center gap-3">
              {unlockedHunters.map(id => {
                const h = HUNTERS[id];
                return (
                  <div key={id} className="flex flex-col items-center">
                    <img src={h.sprite} alt={h.name} className="w-12 h-12 rounded-full border-2 border-yellow-400 object-cover" />
                    <span className="text-xs mt-1">{h.name}</span>
                    <span className={`text-[9px] ${RARITY[h.rarity]?.color}`}>{RARITY[h.rarity]?.stars}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Hunter Duplicates (Eveil) */}
        {hunterDuplicates.length > 0 && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-r from-amber-900/30 to-red-900/30 rounded-xl p-4 border border-amber-500/30 text-center">
            <div className="text-lg font-bold text-amber-400 mb-2">{'\u2605'} Eveil !</div>
            <div className="flex justify-center gap-3">
              {hunterDuplicates.map((id, i) => {
                const h = HUNTERS[id];
                return (
                  <div key={`${id}_${i}`} className="flex flex-col items-center">
                    <img src={h?.sprite} alt={h?.name} className="w-12 h-12 rounded-full border-2 border-amber-400 object-cover" />
                    <span className="text-xs mt-1">{h?.name}</span>
                    <span className="text-[9px] text-yellow-400">Eveil +1 {'\u2605'}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-3">
          <Link to="/shadow-colosseum"
            className="px-4 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-all text-sm">
            Retour au Colisee
          </Link>
          <button onClick={() => { setPhase('setup'); setResultData(null); setBattleState(null); setCombatLog([]); }}
            className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 transition-all">
            Relancer le Raid
          </button>
        </div>

        {/* Detailed Stats Modal */}
        {showDetailedStats && (() => {
          const raidFighters = dpsBreakdown.map(d => ({ id: d.id, name: d.name, sprite: d.sprite, element: d.element }));
          const suffix = graphMetric === 'hps' ? '_hps' : graphMetric === 'hrps' ? '_hrps' : graphMetric === 'dtps' ? '_dtps' : '';
          const metricLabels = { dps: 'DPS', hps: 'Heal/s', hrps: 'Heal Recu/s', dtps: 'Dmg Recu/s' };
          const transformedHistory = suffix ? dpsHistory.map(snap => {
            const out = { time: snap.time };
            raidFighters.forEach(f => { out[f.id] = snap[`${f.id}${suffix}`] || 0; });
            return out;
          }) : dpsHistory;
          return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDetailedStats(false)}>
            <div className="bg-[#0f0f1a] border-2 border-purple-400 rounded-2xl p-4 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-purple-300">Statistiques du Raid</h2>
                <button onClick={() => setShowDetailedStats(false)}
                  className="p-2 rounded-lg bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 transition-all text-red-300 font-bold">
                  ✕
                </button>
              </div>

              {/* Metric filter */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <div className="text-xs text-gray-400 font-bold mr-1">Courbe</div>
                {[
                  { key: 'dps', label: 'DPS', active: 'bg-orange-600/30 border-orange-400/50 text-orange-200' },
                  { key: 'hps', label: 'Heal', active: 'bg-green-600/30 border-green-400/50 text-green-200' },
                  { key: 'hrps', label: 'Heal Recu', active: 'bg-emerald-600/30 border-emerald-400/50 text-emerald-200' },
                  { key: 'dtps', label: 'Dmg Recu', active: 'bg-red-600/30 border-red-400/50 text-red-200' },
                ].map(f => (
                  <button key={f.key} onClick={() => setGraphMetric(f.key)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${
                      graphMetric === f.key ? f.active : 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10'
                    }`}>{f.label}</button>
                ))}
              </div>

              {/* DPS Graph with averageMode + metric transform */}
              <div className="mb-4">
                <SharedDPSGraph
                  dpsHistory={transformedHistory}
                  fighters={raidFighters}
                  bossData={graphMetric === 'dps' ? { id: 'boss', name: boss.name, sprite: boss.sprite } : null}
                  averageMode={true}
                  metricLabel={metricLabels[graphMetric]}
                />
              </div>

              {/* Detailed stats inline */}
              <div className="mb-4 p-3 rounded-xl bg-gray-800/30 border border-gray-700/20">
                <div className="text-xs text-gray-400 font-bold mb-2">Statistiques detaillees</div>
                {raidFighters.map((c, i) => {
                  const log = detailedLogs[c.id];
                  if (!log) return null;
                  const critRate = log.totalHits > 0 ? (log.critHits / log.totalHits * 100).toFixed(0) : 0;
                  return (
                    <div key={i} className="flex items-center gap-3 py-1 border-b border-gray-700/10 last:border-0">
                      <img src={c.sprite} alt="" className="w-5 h-5 rounded-full object-cover" />
                      <div className="text-[10px] font-bold w-16 truncate">{c.name}</div>
                      <div className="flex-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] text-gray-400">
                        <span>{fmt(log.totalDamage)} dmg</span>
                        {log.damageTaken > 0 && <span className="text-red-400">-{fmt(log.damageTaken)} recu</span>}
                        {log.totalHealing > 0 && <span className="text-green-400">+{fmt(log.totalHealing)} heal</span>}
                        {log.healReceived > 0 && log.healReceived !== log.totalHealing && <span className="text-emerald-400">+{fmt(log.healReceived)} soigne</span>}
                        <span>{log.totalHits} hits</span>
                        <span>{critRate}% crit</span>
                        {log.maxCrit > 0 && <span className="text-yellow-400">max: {fmt(log.maxCrit)}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <SharedCombatLogs
                combatLog={combatLog}
                detailedLogs={detailedLogs}
                fighters={raidFighters}
                boss={{ id: 'boss', name: boss.name, sprite: boss.sprite }}
              />
            </div>
          </div>
          );
        })()}
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white p-4 max-w-2xl mx-auto">
      <BattleStyles />
      {/* Title */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
          {boss.emoji} Mode Raid
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          {phase === 'setup' ? 'Compose ton equipe de 6 combattants' :
           phase === 'battle' ? 'Combat en cours...' : 'Resultats du raid'}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={phase} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
          {phase === 'setup' && renderSetup()}
          {phase === 'battle' && (
            <>
              <RaidArena
                battleState={battleState}
                vfxQueue={vfxQueue}
                timer={timer}
                isPaused={isPaused}
                sungCooldowns={sungCooldowns}
                activeSungBuffs={activeSungBuffs}
                combatLog={combatLog}
                onTogglePause={togglePause}
                onSungSkill={(key) => window.dispatchEvent(new KeyboardEvent('keydown', { key }))}
                phase={phase}
                dpsData={dpsTracker.current}
                chibiWeapons={chibiWeaponsMap}
              />

              {/* DPS Graph */}
              <div className="mt-6">
                <SharedDPSGraph
                  dpsHistory={dpsHistory}
                  fighters={battleState?.chibis || []}
                  bossData={battleState?.boss ? { id: 'boss', name: battleState.boss.name } : null}
                />
              </div>

              {/* Combat Logs */}
              <div className="mt-6">
                <SharedCombatLogs
                  combatLog={combatLog}
                  detailedLogs={detailedLogs}
                  fighters={battleState?.chibis || []}
                  boss={battleState?.boss}
                />
              </div>
            </>
          )}
          {phase === 'result' && renderResult()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
