// src/pages/ShadowColosseum/TrainingDummy.jsx
// "Mannequin d'Entraînement" — Test weapon passives & artifact effects

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Play, Pause, RotateCcw, Zap, Crosshair } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  ELEMENTS, RARITY, CHIBIS, SPRITES,
  statsAtFull, getEffStat, computeAttack, mergeTalentBonuses,
  getBaseMana, BASE_MANA_REGEN, applySkillUpgrades,
} from './colosseumCore';

import { HUNTERS, HUNTER_PASSIVE_EFFECTS, getHunterStars, getHunterSprite, HUNTER_SKINS, computeSynergies, computeCrossTeamSynergy } from './raidData';

import {
  WEAPONS,
  KATANA_Z_ATK_PER_HIT, KATANA_Z_STACK_PERSIST_CHANCE, KATANA_Z_COUNTER_CHANCE, KATANA_Z_COUNTER_MULT,
  KATANA_V_DOT_PCT, KATANA_V_DOT_MAX_STACKS, KATANA_V_BUFF_CHANCE,
  SULFURAS_STACK_PER_TURN, SULFURAS_STACK_MAX,
  computeArtifactBonuses, computeWeaponBonuses, mergeEquipBonuses,
} from './equipmentData';

import { TALENT_TREES, computeTalentBonuses } from './talentTreeData';
import {
  TALENT2_BRANCHES, computeTalentBonuses2,
} from './talentTree2Data';

import { ARC2_STAGES } from './arc2Data';
import { RAID_BOSSES, RAID_TIERS } from './raidData';

import BossSelector from './BossSelector';
import BattleView from './TrainingDummy/BattleView';
import SharedDPSGraph from './SharedBattleComponents/SharedDPSGraph';
import SharedCombatLogs from './SharedBattleComponents/SharedCombatLogs';

const fmt = (n) => Math.floor(n).toLocaleString('fr-FR');

// Format damage with K, M, B suffixes (like Warcraft)
const formatDamage = (dmg) => {
  if (dmg >= 1_000_000_000) return (dmg / 1_000_000_000).toFixed(2) + 'B';
  if (dmg >= 1_000_000) return (dmg / 1_000_000).toFixed(2) + 'M';
  if (dmg >= 1_000) return (dmg / 1_000).toFixed(1) + 'K';
  return Math.floor(dmg).toString();
};

// Get sprite for entity (hunter or chibi)
const getEntitySprite = (id, coloData) => {
  // If it's a hunter with custom skin, use getHunterSprite
  if (HUNTER_SKINS[id]) {
    return getHunterSprite(id, coloData);
  }
  // Otherwise use SPRITES (for chibis and default hunters)
  return SPRITES[id] || (HUNTERS[id]?.sprite) || '';
};

// ═══════════════════════════════════════════════════════════════
// BOSS DATA - ARC I (only bosses with isBoss: true)
// ═══════════════════════════════════════════════════════════════

const ARC1_BOSSES = [
  { id: 'knight', name: 'Chevalier Dechu', tier: 1,
    hp: 320, atk: 28, def: 22, spd: 22, crit: 8, res: 5 },
  { id: 'guardian', name: 'Gardien du Portail', tier: 2,
    hp: 550, atk: 38, def: 35, spd: 16, crit: 5, res: 15 },
  { id: 'dread_lord', name: 'Seigneur de l\'Effroi', tier: 3,
    hp: 850, atk: 55, def: 42, spd: 28, crit: 10, res: 18 },
  { id: 'shadow_monarch', name: 'Monarque des Ombres', tier: 4,
    hp: 1200, atk: 72, def: 55, spd: 35, crit: 15, res: 25 },
  { id: 'ancient_dragon', name: 'Dragon Ancestral', tier: 5,
    hp: 1800, atk: 95, def: 72, spd: 42, crit: 20, res: 35 },
  { id: 'abyss_tyrant', name: 'Tyran des Abysses', tier: 6,
    hp: 2800, atk: 125, def: 95, spd: 48, crit: 25, res: 45 },
];

// Get all ARC2 bosses (isBoss: true)
const ARC2_BOSSES = ARC2_STAGES.filter(s => s.isBoss);

// ═══════════════════════════════════════════════════════════════
// SLIDER INPUT COMPONENT
// ═══════════════════════════════════════════════════════════════

function SliderInput({ label, value, onChange, min, max, step = 1, logarithmic = false, unit = '' }) {
  const handleChange = (e) => {
    const rawValue = parseFloat(e.target.value);
    if (logarithmic) {
      // Convert from logarithmic scale
      const logMin = Math.log10(min);
      const logMax = Math.log10(max);
      const logValue = logMin + (rawValue / 100) * (logMax - logMin);
      const actualValue = Math.round(Math.pow(10, logValue) / step) * step;
      onChange(actualValue);
    } else {
      onChange(rawValue);
    }
  };

  const displayValue = logarithmic
    ? ((Math.log10(value) - Math.log10(min)) / (Math.log10(max) - Math.log10(min))) * 100
    : value;

  return (
    <div className="flex items-center gap-3">
      <label className="text-xs font-bold text-gray-300 w-20">{label}</label>
      <input
        type="range"
        min={logarithmic ? 0 : min}
        max={logarithmic ? 100 : max}
        step={logarithmic ? 0.1 : step}
        value={displayValue}
        onChange={handleChange}
        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
      />
      <span className="text-sm font-bold text-white w-24 text-right">
        {fmt(value)}{unit}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function TrainingDummy() {
  const navigate = useNavigate();

  // ─── Main State ────────────────────────────────────────────
  const [phase, setPhase] = useState('setup'); // setup | battle | result
  const [battleMode, setBattleMode] = useState('automatic'); // automatic | turn-based
  const [team1, setTeam1] = useState([null, null, null]);
  const [team2, setTeam2] = useState([null, null, null]);
  const [dummyConfig, setDummyConfig] = useState({
    level: 100,
    hp: 100000,
    atk: 500,
    def: 300,
    res: 100,
    spd: 50,
    crit: 10,
    critDmg: 150,
  });
  const [resultData, setResultData] = useState(null);

  // ─── Boss Selection State ──────────────────────────────────
  const [configMode, setConfigMode] = useState('manual'); // manual | arc1 | arc2 | raid
  const [selectedBoss, setSelectedBoss] = useState(null); // boss id
  const [difficulty, setDifficulty] = useState(5); // 0-10 for ARC I/II
  const [raidTier, setRaidTier] = useState(1); // 1-6 for Ant Queen

  // Load Shadow Colosseum data
  const [coloData, setColoData] = useState(() => {
    const saved = localStorage.getItem('shadow_colosseum_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return getDefaultColoData();
      }
    }
    return getDefaultColoData();
  });

  // ─── Battle State - Automatique ────────────────────────────
  const battleRef = useRef(null);
  const gameLoopRef = useRef(null);
  const pausedRef = useRef(false);
  const dpsTracker = useRef({});
  const detailedLogsRef = useRef({});
  const startTimeRef = useRef(0);
  const timerRef = useRef(0);
  const lastDpsSnapshotRef = useRef(0);
  const pauseTimeRef = useRef(0);

  const [isPaused, setIsPaused] = useState(false);
  const [battleState, setBattleState] = useState(null);
  const [timer, setTimer] = useState(180);
  const [combatLog, setCombatLog] = useState([]);
  const [dummyAttacksEnabled, setDummyAttacksEnabled] = useState(true);
  const [selectedFighter, setSelectedFighter] = useState(null); // For stats panel
  const [dpsHistory, setDpsHistory] = useState([]); // For DPS graph
  const [detailedLogs, setDetailedLogs] = useState({}); // For detailed stats

  // ─── Battle State - Tour par Tour ──────────────────────────
  const [battle, setBattle] = useState(null);
  const [selectedFighterId, setSelectedFighterId] = useState(null);
  const phaseRef = useRef('idle'); // idle | player_atk | enemy_atk

  // ─── Team Picker State ──────────────────────────────────────
  const [showPicker, setShowPicker] = useState(false);
  const [pickSlot, setPickSlot] = useState(null); // { team: 1|2, idx: 0-2 }

  // ═══════════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════

  // Get default colosseum data structure (match ShadowColosseum.jsx)
  function getDefaultColoData() {
    return {
      chibiLevels: {},
      statPoints: {},
      skillTree: {},
      talentTree: {},
      talentTree2: {},
      talentSkills: {},
      respecCount: {},
      cooldowns: {},
      stagesCleared: {},
      stats: { battles: 0, wins: 0 },
      artifacts: {},
      artifactInventory: [],
      weapons: {},
      weaponCollection: {},
      hammers: { marteau_forge: 0, marteau_runique: 0, marteau_celeste: 0, marteau_rouge: 0 },
      fragments: { fragment_sulfuras: 0, fragment_raeshalare: 0, fragment_katana_z: 0, fragment_katana_v: 0 },
      accountXp: 0,
      accountBonuses: { hp: 0, atk: 0, def: 0, spd: 0, crit: 0, res: 0 },
      accountAllocations: 0,
      arc2Unlocked: false,
      arc2StagesCleared: {},
      arc2StoriesWatched: {},
      arc2ClickCount: 0,
      grimoireWeiss: false,
      arc2Team: [null, null, null],
      arc2StarsRecord: {},
      ragnarokKills: 0,
      ragnarokDropLog: [],
      zephyrKills: 0,
      zephyrDropLog: [],
      monarchKills: 0,
      monarchDropLog: [],
      lootBoostMs: 0,
    };
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, []);

  // ═══════════════════════════════════════════════════════════
  // PRESET CONFIGS
  // ═══════════════════════════════════════════════════════════

  const applyPreset = (preset) => {
    const presets = {
      fragile: {
        level: 50,
        hp: 10000,
        atk: 300,
        def: 50,
        res: 20,
        spd: 30,
        crit: 5,
        critDmg: 150,
      },
      tank: {
        level: 100,
        hp: 500000,
        atk: 200,
        def: 800,
        res: 150,
        spd: 10,
        crit: 3,
        critDmg: 120,
      },
      boss_t1: {
        level: 60,
        hp: 50000,
        atk: 400,
        def: 250,
        res: 80,
        spd: 40,
        crit: 10,
        critDmg: 180,
      },
      boss_t3: {
        level: 85,
        hp: 200000,
        atk: 650,
        def: 400,
        res: 120,
        spd: 50,
        crit: 15,
        critDmg: 220,
      },
      boss_t6: {
        level: 100,
        hp: 1000000,
        atk: 1000,
        def: 600,
        res: 180,
        spd: 80,
        crit: 25,
        critDmg: 300,
      },
    };

    if (presets[preset]) {
      setDummyConfig(presets[preset]);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // APPLY BOSS PRESET - Calculate stats from boss data
  // ═══════════════════════════════════════════════════════════

  const applyBossPreset = (mode, bossId, difficultyOrTier) => {
    let boss = null;
    let config = {};

    if (mode === 'arc1') {
      boss = ARC1_BOSSES.find(b => b.id === bossId);
      if (!boss) return;

      // Difficulty 0-10: scale stats
      const diffMult = 1 + (difficultyOrTier * 0.5); // +50% per difficulty level
      config = {
        level: 50 + difficultyOrTier * 5, // level 50-100
        hp: Math.floor(boss.hp * diffMult * 100), // scale up for combat
        atk: Math.floor(boss.atk * diffMult * 10),
        def: Math.floor(boss.def * diffMult * 10),
        res: Math.floor(boss.res * diffMult),
        spd: Math.floor(boss.spd * (1 + difficultyOrTier * 0.1)),
        crit: Math.floor(boss.crit * (1 + difficultyOrTier * 0.1)),
        critDmg: 150 + difficultyOrTier * 10, // 150-250%
      };
    } else if (mode === 'arc2') {
      boss = ARC2_BOSSES.find(b => b.id === bossId);
      if (!boss) return;

      // Difficulty 0-10: scale stats
      const diffMult = 1 + (difficultyOrTier * 0.5);
      config = {
        level: 50 + difficultyOrTier * 5,
        hp: Math.floor(boss.hp * diffMult),
        atk: Math.floor(boss.atk * diffMult),
        def: Math.floor(boss.def * diffMult),
        res: Math.floor(boss.res * diffMult),
        spd: Math.floor(boss.spd * (1 + difficultyOrTier * 0.1)),
        crit: Math.floor(boss.crit * (1 + difficultyOrTier * 0.1)),
        critDmg: 150 + difficultyOrTier * 10,
      };
    } else if (mode === 'raid') {
      const antQueen = RAID_BOSSES.ant_queen;
      const tier = RAID_TIERS[difficultyOrTier];
      if (!tier) return;

      // Calculate Ant Queen stats for tier
      const baseStats = antQueen.stats;
      config = {
        level: 50 + (difficultyOrTier - 1) * 10, // T1=50, T6=100
        hp: Math.floor(antQueen.baseHP * tier.bossHPMult),
        atk: Math.floor(baseStats.atk * tier.bossAtkMult * 10),
        def: Math.floor(baseStats.def * tier.bossDefMult * 10),
        res: Math.floor(baseStats.res * tier.bossDefMult),
        spd: Math.floor(baseStats.spd * tier.bossSpdMult),
        crit: Math.floor(baseStats.crit * (1 + (difficultyOrTier - 1) * 0.2)),
        critDmg: 150 + (difficultyOrTier - 1) * 15, // T1=150%, T6=225%
      };
    }

    if (config.hp) {
      setDummyConfig(config);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // BUILD FIGHTER - Construct hunter with full stats
  // ═══════════════════════════════════════════════════════════

  const buildFighter = useCallback((entityId, synergyBonuses = {}) => {
    // Support both HUNTERS and CHIBIS
    const entity = HUNTERS[entityId] || CHIBIS[entityId];
    if (!entity) return null;

    const lvData = coloData.chibiLevels?.[entityId] || { level: 1, xp: 0 };
    const allocated = coloData.statPoints?.[entityId] || {};
    const tb = computeTalentBonuses(coloData.talentTree?.[entityId] || {});
    const tb2 = computeTalentBonuses2(coloData.talentTree2?.[entityId] || {});
    const mergedTB = mergeTalentBonuses(tb, tb2);

    const artBonuses = computeArtifactBonuses(coloData.artifacts?.[entityId]);
    const weaponId = coloData.weapons?.[entityId];
    const weapBonuses = computeWeaponBonuses(weaponId, coloData.weaponCollection?.[weaponId] || 0);
    const eqB = mergeEquipBonuses(artBonuses, weapBonuses);
    const evStars = 0; // Eveil stars not implemented yet

    // Stats de base (from colosseumCore.js)
    const st = statsAtFull(
      entity.base,
      entity.growth,
      lvData.level,
      allocated,
      mergedTB,
      eqB,
      evStars,
      coloData.accountBonuses || {}
    );

    // Apply synergies
    let hpMult = 1 + ((synergyBonuses.hp || 0) + (synergyBonuses.allStats || 0)) / 100;
    let atkMult = 1 + ((synergyBonuses.atk || 0) + (synergyBonuses.allStats || 0)) / 100;
    let defMult = 1 + ((synergyBonuses.def || 0) + (synergyBonuses.allStats || 0)) / 100;
    let spdMult = 1 + ((synergyBonuses.spd || 0) + (synergyBonuses.allStats || 0)) / 100;

    // Apply hunter passives permanents (only for hunters, not chibis)
    const hunterPassive = HUNTER_PASSIVE_EFFECTS[entityId];
    if (hunterPassive?.type === 'permanent' && hunterPassive.stats) {
      if (hunterPassive.stats.hp) hpMult += hunterPassive.stats.hp / 100;
      if (hunterPassive.stats.atk) atkMult += hunterPassive.stats.atk / 100;
      if (hunterPassive.stats.def) defMult += hunterPassive.stats.def / 100;
      if (hunterPassive.stats.spd) spdMult += hunterPassive.stats.spd / 100;
    }

    const hp = Math.floor(st.hp * hpMult);
    const atk = Math.floor(st.atk * atkMult);
    const def = Math.floor(st.def * defMult);
    const spd = Math.floor(st.spd * spdMult);
    const crit = st.crit + (synergyBonuses.crit || 0);
    const res = st.res + (synergyBonuses.res || 0);

    const mana = getBaseMana(lvData.level);
    const manaRegen = BASE_MANA_REGEN + (mergedTB.manaRegen || 0);

    const rawSkills = applySkillUpgrades(entity.skills || [], coloData.skillTree?.[entityId] || {});
    const skills = Array.isArray(rawSkills) ? rawSkills : (entity.skills || []);

    // Attack interval (SPD-based)
    const baseInterval = 3000;
    const attackInterval = Math.max(500, baseInterval / (1 + spd / 100));

    // Weapon passive states (weaponId already defined above)
    const passiveState = {
      katanaZStacks: weaponId && WEAPONS[weaponId]?.passive === 'katana_z_fury' ? 0 : undefined,
      katanaVState: weaponId && WEAPONS[weaponId]?.passive === 'katana_v_chaos'
        ? { dots: 0, allStatBuff: 0, shield: false, nextDmgMult: 1 }
        : undefined,
      sulfurasStacks: weaponId && WEAPONS[weaponId]?.passive === 'sulfuras_fury' ? 0 : undefined,
    };

    return {
      id: entityId,
      name: entity.name,
      sprite: getEntitySprite(entityId, coloData),
      element: entity.element,
      hp,
      maxHp: hp,
      atk,
      def,
      spd,
      crit,
      res,
      mana,
      maxMana: mana,
      manaRegen,
      skills: Array.isArray(skills) ? skills.map(s => ({ ...s, cd: 0 })) : [],
      buffs: [],
      passives: [],
      passiveState,
      hunterPassive,
      talentBonuses: mergedTB,
      attackInterval,
      lastAttackAt: 0,
      alive: true,
    };
  }, [coloData]);

  // ═══════════════════════════════════════════════════════════
  // BUILD DUMMY - Construct training dummy
  // ═══════════════════════════════════════════════════════════

  const buildDummy = useCallback(() => {
    const cfg = dummyConfig;
    return {
      id: 'training_dummy',
      name: 'Mannequin d\'Entraînement',
      sprite: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771614440/dummy_target.png',
      element: 'neutral',
      hp: cfg.hp,
      maxHp: cfg.hp,
      atk: cfg.atk,
      def: cfg.def,
      spd: cfg.spd,
      crit: cfg.crit,
      res: cfg.res,
      critDmg: cfg.critDmg,
      skills: [{ name: 'Frappe', power: 100, cdMax: 0 }],
      buffs: [],
      lastAttackAt: 0,
      alive: true,
    };
  }, [dummyConfig]);

  // ═══════════════════════════════════════════════════════════
  // START AUTO BATTLE - Initialize automatic combat
  // ═══════════════════════════════════════════════════════════

  const startAutoBattle = useCallback(() => {
    const allIds = [...team1.filter(Boolean), ...team2.filter(Boolean)];

    // Simple synergy calculation (no cross-team for now)
    const synergy = { hp: 0, atk: 0, def: 0, spd: 0, crit: 0, res: 0, allStats: 0 };

    const fighters = allIds.map(id => buildFighter(id, synergy)).filter(Boolean);
    const dummy = buildDummy();

    const state = { fighters, dummy };
    battleRef.current = state;
    setBattleState(state);

    dpsTracker.current = {};
    const initialLogs = {};
    fighters.forEach(f => {
      dpsTracker.current[f.id] = 0;
      initialLogs[f.id] = {
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
    });
    initialLogs['training_dummy'] = {
      totalDamage: 0,
      damageTaken: 0,
      totalHits: 0,
      critHits: 0,
      buffActivations: [],
      passiveProcs: [],
      totalCritDamage: 0,
      maxCrit: 0,
      skillsUsed: 0,
      dps: 0,
    };
    setDetailedLogs(initialLogs);
    detailedLogsRef.current = initialLogs;
    setDpsHistory([]);
    lastDpsSnapshotRef.current = 0;

    const duration = 180;
    timerRef.current = duration;
    setTimer(duration);
    startTimeRef.current = Date.now();
    pausedRef.current = false;
    setIsPaused(false);

    setCombatLog([{ text: 'Combat commence !', time: 0, type: 'system', id: Date.now() }]);
    setPhase('battle');
  }, [team1, team2, buildFighter, buildDummy]);

  // ═══════════════════════════════════════════════════════════
  // GAME TICK - Main combat loop for automatic mode
  // ═══════════════════════════════════════════════════════════

  const gameTick = useCallback(() => {
    if (pausedRef.current || !battleRef.current) return;

    const state = battleRef.current;
    const now = Date.now();
    const elapsed = (now - startTimeRef.current) / 1000;
    const remaining = Math.max(0, 180 - elapsed);
    timerRef.current = remaining;

    let logEntries = [];
    let stateChanged = false;

    // ─── Check end conditions ────────────────────────────────
    const aliveCount = state.fighters.filter(f => f.alive).length;
    if (remaining <= 0 || !state.dummy.alive || aliveCount === 0) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;

      const totalDmg = Object.values(dpsTracker.current).reduce((s, v) => s + v, 0);
      const dpsBreakdown = state.fighters.map(f => ({
        id: f.id,
        name: f.name,
        sprite: f.sprite,
        damage: dpsTracker.current[f.id] || 0,
        dps: elapsed > 0 ? (dpsTracker.current[f.id] || 0) / elapsed : 0,
        percent: totalDmg > 0 ? ((dpsTracker.current[f.id] || 0) / totalDmg * 100) : 0,
      })).sort((a, b) => b.damage - a.damage);

      setResultData({
        totalDmg,
        dpsBreakdown,
        duration: Math.floor(elapsed),
        defeat: aliveCount === 0 && state.dummy.alive,
      });
      setPhase('result');
      return;
    }

    // ─── Fighters attack ─────────────────────────────────────
    state.fighters.forEach(fighter => {
      if (!fighter.alive || !state.dummy.alive) return;
      if (now - fighter.lastAttackAt < fighter.attackInterval) return;

      // Mana regen
      if (fighter.maxMana > 0) {
        fighter.mana = Math.min(
          fighter.maxMana,
          (fighter.mana || 0) + (fighter.manaRegen || 0) * (fighter.attackInterval / 3000)
        );
      }

      // Pick skill
      const availSkills = fighter.skills.filter(
        s => (s.cd || 0) <= 0 && (fighter.mana || 999) >= (s.manaCost || 0)
      );
      if (availSkills.length === 0) {
        fighter.lastAttackAt = now;
        return;
      }
      const skill = availSkills[0];

      // Consume mana
      if (fighter.maxMana > 0 && skill.manaCost > 0) {
        fighter.mana = Math.max(0, fighter.mana - skill.manaCost);
      }

      // ═══ WEAPON PASSIVE MULTIPLIERS ═══
      let atkMult = 1;

      // Katana Z: +5% ATK per stack
      if (fighter.passiveState.katanaZStacks !== undefined && fighter.passiveState.katanaZStacks > 0) {
        atkMult += fighter.passiveState.katanaZStacks * KATANA_Z_ATK_PER_HIT / 100;
        logEntries.push({
          text: `${fighter.name}: Tranchant Eternel x${fighter.passiveState.katanaZStacks} ! ATK +${fighter.passiveState.katanaZStacks * KATANA_Z_ATK_PER_HIT}%`,
          time: elapsed,
          type: 'buff',
        });
      }

      // Katana V
      if (fighter.passiveState.katanaVState?.nextDmgMult > 1) {
        atkMult *= fighter.passiveState.katanaVState.nextDmgMult;
      }
      if (fighter.passiveState.katanaVState?.allStatBuff > 0) {
        atkMult += fighter.passiveState.katanaVState.allStatBuff / 100;
      }

      // Sulfuras stacks
      if (fighter.passiveState.sulfurasStacks !== undefined && fighter.passiveState.sulfurasStacks > 0) {
        atkMult += fighter.passiveState.sulfurasStacks / 100;
      }

      // Temporarily boost ATK
      const origAtk = fighter.atk;
      fighter.atk = Math.floor(fighter.atk * atkMult);

      // Compute attack
      const result = computeAttack(fighter, skill, state.dummy, fighter.talentBonuses || {});

      // Restore ATK
      fighter.atk = origAtk;

      // Apply damage
      if (result.damage > 0) {
        state.dummy.hp = Math.max(0, state.dummy.hp - result.damage);
        dpsTracker.current[fighter.id] = (dpsTracker.current[fighter.id] || 0) + result.damage;

        // Track detailed logs
        if (!detailedLogsRef.current[fighter.id]) detailedLogsRef.current[fighter.id] = {};
        const fLog = detailedLogsRef.current[fighter.id];
        fLog.totalDamage = (fLog.totalDamage || 0) + result.damage;
        fLog.totalHits = (fLog.totalHits || 0) + 1;
        fLog.skillsUsed = (fLog.skillsUsed || 0) + 1;
        if (result.isCrit) {
          fLog.critHits = (fLog.critHits || 0) + 1;
          fLog.totalCritDamage = (fLog.totalCritDamage || 0) + result.damage;
          fLog.maxCrit = Math.max(fLog.maxCrit || 0, result.damage);
        }
        fLog.dps = elapsed > 0 ? fLog.totalDamage / elapsed : 0;

        // Track dummy damage taken
        const dLog = detailedLogsRef.current['training_dummy'];
        if (dLog) {
          dLog.damageTaken = (dLog.damageTaken || 0) + result.damage;
        }

        if (state.dummy.hp <= 0) state.dummy.alive = false;
      }

      // ═══ WEAPON PASSIVE EFFECTS AFTER ATTACK ═══

      // Katana Z: +1 stack
      if (fighter.passiveState.katanaZStacks !== undefined) {
        fighter.passiveState.katanaZStacks++;
        // Track passive activation
        const fLog = detailedLogsRef.current[fighter.id];
        if (fLog) {
          fLog.passiveProcs.push({
            name: 'Katana Z - Tranchant Éternel',
            description: `+1 stack (total: ${fighter.passiveState.katanaZStacks})`,
          });
        }
      }

      // Katana V: DoT + buff roll
      if (fighter.passiveState.katanaVState) {
        if (fighter.passiveState.katanaVState.nextDmgMult > 1) {
          fighter.passiveState.katanaVState.nextDmgMult = 1;
        }
        if (fighter.passiveState.katanaVState.dots < KATANA_V_DOT_MAX_STACKS) {
          fighter.passiveState.katanaVState.dots++;
        }
        if (Math.random() < KATANA_V_BUFF_CHANCE) {
          const roll = Math.random();
          const fLog = detailedLogsRef.current[fighter.id];
          if (roll < 0.33) {
            fighter.passiveState.katanaVState.allStatBuff += 5;
            logEntries.push({
              text: `${fighter.name}: Benediction +5% stats ! (total +${fighter.passiveState.katanaVState.allStatBuff}%)`,
              time: elapsed,
              type: 'buff',
            });
            if (fLog) {
              fLog.buffActivations.push({
                name: 'Katana V - Bénédiction Divine',
                value: `+${fighter.passiveState.katanaVState.allStatBuff}% all stats`,
              });
            }
          } else if (roll < 0.66) {
            fighter.passiveState.katanaVState.shield = true;
            if (fLog) {
              fLog.buffActivations.push({
                name: 'Katana V - Bouclier Divin',
                value: 'Absorbe 1 coup',
              });
            }
          } else {
            fighter.passiveState.katanaVState.nextDmgMult = 6;
            if (fLog) {
              fLog.buffActivations.push({
                name: 'Katana V - Puissance Divine',
                value: 'x6 DMG prochain coup',
              });
            }
          }
        }
      }

      // Sulfuras: +33% DMG per turn (max +100%)
      if (fighter.passiveState.sulfurasStacks !== undefined) {
        if (fighter.passiveState.sulfurasStacks < SULFURAS_STACK_MAX) {
          fighter.passiveState.sulfurasStacks += SULFURAS_STACK_PER_TURN;
        }
      }

      // Cooldown
      skill.cd = skill.cdMax || 0;

      fighter.lastAttackAt = now;

      // Enriched combat log with element and passive info
      logEntries.push({
        text: result.text,
        time: elapsed,
        type: result.isCrit ? 'crit' : 'normal',
        element: fighter.element,
        passive: fighter.passiveState?.katanaZStacks > 0 ? 'Katana Z' :
                 fighter.passiveState?.katanaVState ? 'Katana V' :
                 fighter.passiveState?.sulfurasStacks > 0 ? 'Sulfuras' : null,
      });
      stateChanged = true;
    });

    // ─── Dummy attack ────────────────────────────────────────
    const dummyInterval = 5000; // 5s
    if (dummyAttacksEnabled && now - state.dummy.lastAttackAt >= dummyInterval) {
      const alive = state.fighters.filter(f => f.alive);
      if (alive.length > 0) {
        const target = alive[Math.floor(Math.random() * alive.length)];
        const dmgResult = computeAttack(state.dummy, state.dummy.skills[0], target);

        // ═══ KATANA Z COUNTER-ATTACK ═══
        if (target.passiveState.katanaZStacks !== undefined && dmgResult.damage > 0 && target.hp > 0) {
          if (Math.random() < KATANA_Z_COUNTER_CHANCE) {
            const counterDmg = Math.floor(getEffStat(target.atk, target.buffs, 'atk') * KATANA_Z_COUNTER_MULT);
            state.dummy.hp = Math.max(0, state.dummy.hp - counterDmg);
            dpsTracker.current[target.id] = (dpsTracker.current[target.id] || 0) + counterDmg;
            logEntries.push({
              text: `${target.name}: Katana Z contre-attaque ! -${fmt(counterDmg)} PV !`,
              time: elapsed,
              type: 'crit',
            });
          }
        }

        // Katana V shield absorb
        if (target.passiveState.katanaVState?.shield && dmgResult.damage > 0) {
          target.passiveState.katanaVState.shield = false;
          logEntries.push({
            text: `${target.name}: Bouclier Divin absorbe le coup !`,
            time: elapsed,
            type: 'buff',
          });
          dmgResult.damage = 0;
        }

        target.hp = Math.max(0, target.hp - dmgResult.damage);

        // Track damage dealt by dummy
        if (dmgResult.damage > 0 && dummyAttacksEnabled) {
          const dLog = detailedLogsRef.current['training_dummy'];
          if (dLog) {
            dLog.totalDamage = (dLog.totalDamage || 0) + dmgResult.damage;
            dLog.totalHits = (dLog.totalHits || 0) + 1;
            if (dmgResult.isCrit) {
              dLog.critHits = (dLog.critHits || 0) + 1;
              dLog.totalCritDamage = (dLog.totalCritDamage || 0) + dmgResult.damage;
              dLog.maxCrit = Math.max(dLog.maxCrit || 0, dmgResult.damage);
            }
            dLog.dps = elapsed > 0 ? dLog.totalDamage / elapsed : 0;
          }

          // Track damage taken by fighter
          const tLog = detailedLogsRef.current[target.id];
          if (tLog) {
            tLog.damageTaken = (tLog.damageTaken || 0) + dmgResult.damage;
          }
        }

        if (target.hp <= 0) target.alive = false;

        logEntries.push({
          text: `Mannequin → ${target.name}: -${fmt(dmgResult.damage)} PV`,
          time: elapsed,
          type: 'enemy',
        });
        state.dummy.lastAttackAt = now;
        stateChanged = true;
      }
    }

    // ─── Cooldown decay ──────────────────────────────────────
    state.fighters.forEach(f => {
      f.skills.forEach(s => {
        if (s.cd > 0) s.cd = Math.max(0, s.cd - 1);
      });
    });

    // ─── DPS History Snapshot (every 2 seconds) ──────────────
    if (elapsed - lastDpsSnapshotRef.current >= 2) {
      const snapshot = { time: elapsed };
      state.fighters.forEach(f => {
        const fLog = detailedLogsRef.current[f.id];
        snapshot[f.id] = fLog ? (fLog.dps || 0) : 0;
      });
      const dLog = detailedLogsRef.current['training_dummy'];
      snapshot['dummy'] = dLog ? (dLog.dps || 0) : 0;

      setDpsHistory(prev => [...prev, snapshot]);
      lastDpsSnapshotRef.current = elapsed;
    }

    // ─── Update detailed logs state ──────────────────────────
    setDetailedLogs({ ...detailedLogsRef.current });

    // ─── Update state ────────────────────────────────────────
    if (stateChanged) setBattleState({ ...state });
    if (logEntries.length > 0) {
      setCombatLog(prev => [...prev.slice(-50), ...logEntries.map((e, i) => ({ ...e, id: Date.now() + i }))]);
    }
    setTimer(remaining);
  }, [dummyAttacksEnabled]);

  // Start game loop
  useEffect(() => {
    if (phase === 'battle' && battleMode === 'automatic' && battleRef.current && !gameLoopRef.current) {
      gameLoopRef.current = setInterval(gameTick, 100); // 100ms tick
    }
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [phase, battleMode, gameTick]);

  // ═══════════════════════════════════════════════════════════
  // PAUSE/RESUME/RESET CONTROLS
  // ═══════════════════════════════════════════════════════════

  const togglePause = () => {
    if (pausedRef.current) {
      // Resuming: adjust startTime to account for paused duration
      const pausedDuration = Date.now() - pauseTimeRef.current;
      startTimeRef.current += pausedDuration;
      pausedRef.current = false;
      setIsPaused(false);
    } else {
      // Pausing: save current time
      pauseTimeRef.current = Date.now();
      pausedRef.current = true;
      setIsPaused(true);
    }
  };

  const refreshBattle = () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    startAutoBattle();
  };

  // ═══════════════════════════════════════════════════════════
  // START TURN-BASED BATTLE - Initialize turn-based combat
  // ═══════════════════════════════════════════════════════════

  const startTurnBasedBattle = useCallback(() => {
    const allIds = [...team1.filter(Boolean), ...team2.filter(Boolean)];

    // Simple synergy calculation
    const synergy = { hp: 0, atk: 0, def: 0, spd: 0, crit: 0, res: 0, allStats: 0 };

    const fighters = allIds.map(id => buildFighter(id, synergy)).filter(Boolean);
    const dummy = buildDummy();

    dpsTracker.current = {};
    fighters.forEach(f => {
      dpsTracker.current[f.id] = 0;
    });

    const initialLog = [
      { text: '╔════════════════════════════════════════╗', type: 'system', id: Date.now() },
      { text: '║  COMBAT TOUR PAR TOUR - MODE ANALYSE  ║', type: 'system', id: Date.now() + 0.1 },
      { text: '╚════════════════════════════════════════╝', type: 'system', id: Date.now() + 0.2 },
      { text: '', type: 'system', id: Date.now() + 0.3 },
    ];

    fighters.forEach((f, i) => {
      initialLog.push({
        text: `✓ ${f.name} - HP: ${fmt(f.hp)} | ATK: ${fmt(f.atk)} | DEF: ${fmt(f.def)} | SPD: ${fmt(f.spd)}`,
        type: 'system',
        id: Date.now() + 0.4 + i * 0.1,
      });
    });

    initialLog.push({ text: '', type: 'system', id: Date.now() + 1 });
    initialLog.push({
      text: `🎯 Mannequin - HP: ${fmt(dummy.hp)} | ATK: ${fmt(dummy.atk)} | DEF: ${fmt(dummy.def)} | RES: ${fmt(dummy.res)}`,
      type: 'system',
      id: Date.now() + 1.1,
    });

    setBattle({
      fighters,
      dummy,
      selectedFighterId: fighters[0].id,
      turn: 1,
      log: initialLog,
    });
    setSelectedFighterId(fighters[0].id);
    phaseRef.current = 'idle';
    setPhase('battle');
  }, [team1, team2, buildFighter, buildDummy]);

  // ═══════════════════════════════════════════════════════════
  // EXECUTE ROUND - Turn-based combat with detailed logging
  // ═══════════════════════════════════════════════════════════

  const executeRound = useCallback((skillIdx) => {
    if (phaseRef.current !== 'idle' || !battle) return;

    const fighter = battle.fighters.find(f => f.id === battle.selectedFighterId);
    if (!fighter || !fighter.alive) return;

    const skill = fighter.skills[skillIdx];
    const dummy = battle.dummy;
    const log = [...battle.log];

    // Separator
    log.push({ text: '', type: 'system', id: Date.now() });
    log.push({ text: `━━━━━━━━━━━━━━━━ TOUR ${battle.turn} ━━━━━━━━━━━━━━━━`, type: 'system', id: Date.now() + 0.01 });
    log.push({ text: '', type: 'system', id: Date.now() + 0.02 });

    // Check mana
    const manaCost = skill.manaCost || 0;
    if (fighter.mana < manaCost) {
      log.push({ text: `❌ ${fighter.name}: Pas assez de mana ! (${fmt(fighter.mana)}/${fmt(manaCost)})`, type: 'info', id: Date.now() + 0.1 });
      setBattle(prev => ({ ...prev, log: log.slice(-50) }));
      return;
    }

    // Consume mana
    if (manaCost > 0) {
      fighter.mana = Math.max(0, fighter.mana - manaCost);
      log.push({ text: `💙 ${fighter.name}: Mana consommée: -${fmt(manaCost)} (${fmt(fighter.mana)}/${fmt(fighter.maxMana)})`, type: 'info', id: Date.now() + 0.15 });
    }

    // ═══ PLAYER ATTACK ═══
    phaseRef.current = 'player_atk';
    log.push({ text: `⚔️ ${fighter.name} utilise: ${skill.name}`, type: 'player', id: Date.now() + 0.2 });
    log.push({ text: '', type: 'system', id: Date.now() + 0.21 });

    // Calculate ATK multipliers
    let atkMult = 1;
    const atkDetails = [];

    // Katana Z stacks
    if (fighter.passiveState.katanaZStacks !== undefined && fighter.passiveState.katanaZStacks > 0) {
      const bonus = fighter.passiveState.katanaZStacks * KATANA_Z_ATK_PER_HIT;
      atkMult += bonus / 100;
      atkDetails.push(`  ├─ Katana Z "Tranchant Eternel": x${fighter.passiveState.katanaZStacks} stacks = +${bonus}% ATK`);
    }

    // Katana V buffs
    if (fighter.passiveState.katanaVState?.nextDmgMult > 1) {
      const mult = fighter.passiveState.katanaVState.nextDmgMult;
      atkMult *= mult;
      atkDetails.push(`  ├─ Katana V "Puissance Divine": x${mult} DMG`);
    }
    if (fighter.passiveState.katanaVState?.allStatBuff > 0) {
      const bonus = fighter.passiveState.katanaVState.allStatBuff;
      atkMult += bonus / 100;
      atkDetails.push(`  ├─ Katana V "Benediction": +${bonus}% stats`);
    }

    // Sulfuras stacks
    if (fighter.passiveState.sulfurasStacks !== undefined && fighter.passiveState.sulfurasStacks > 0) {
      const bonus = fighter.passiveState.sulfurasStacks;
      atkMult += bonus / 100;
      atkDetails.push(`  ├─ Sulfuras: +${bonus}% DMG`);
    }

    if (atkDetails.length > 0) {
      log.push({ text: `📊 Multiplicateurs d'ATK:`, type: 'buff', id: Date.now() + 0.25 });
      atkDetails.forEach((detail, i) => {
        log.push({ text: detail, type: 'buff', id: Date.now() + 0.26 + i * 0.01 });
      });
      log.push({ text: `  └─ Total multiplicateur: x${atkMult.toFixed(2)}`, type: 'buff', id: Date.now() + 0.3 });
      log.push({ text: '', type: 'system', id: Date.now() + 0.31 });
    }

    // Temporarily boost ATK
    const savedAtk = fighter.atk;
    const boostedAtk = Math.floor(fighter.atk * atkMult);
    fighter.atk = boostedAtk;

    if (boostedAtk !== savedAtk) {
      log.push({ text: `💪 ATK boosté: ${fmt(savedAtk)} → ${fmt(boostedAtk)}`, type: 'buff', id: Date.now() + 0.35 });
    }

    // Compute attack with detailed breakdown
    const result = computeAttack(fighter, skill, dummy, fighter.talentBonuses || {});

    // Log attack breakdown
    log.push({ text: `🎲 Calcul des dégâts:`, type: 'normal', id: Date.now() + 0.4 });
    log.push({ text: `  ├─ Puissance du skill: ${skill.power}%`, type: 'normal', id: Date.now() + 0.41 });
    log.push({ text: `  ├─ ATK attaquant: ${fmt(boostedAtk)}`, type: 'normal', id: Date.now() + 0.42 });
    log.push({ text: `  ├─ DEF cible: ${fmt(dummy.def)}`, type: 'normal', id: Date.now() + 0.43 });
    log.push({ text: `  ├─ RES cible: ${fmt(dummy.res)}%`, type: 'normal', id: Date.now() + 0.44 });

    if (result.isCrit) {
      log.push({ text: `  ├─ 💥 COUP CRITIQUE ! (CRIT: ${fmt(fighter.crit)}%)`, type: 'crit', id: Date.now() + 0.45 });
      log.push({ text: `  ├─ CRIT DMG: ${fmt(fighter.talentBonuses?.critDmg || 150)}%`, type: 'crit', id: Date.now() + 0.46 });
    }

    log.push({ text: `  └─ Dégâts finaux: ${fmt(result.damage)}`, type: result.isCrit ? 'crit' : 'normal', id: Date.now() + 0.5 });
    log.push({ text: '', type: 'system', id: Date.now() + 0.51 });

    // Restore ATK
    fighter.atk = savedAtk;

    // Apply damage
    dummy.hp = Math.max(0, dummy.hp - result.damage);
    dpsTracker.current[fighter.id] = (dpsTracker.current[fighter.id] || 0) + result.damage;

    log.push({ text: `🎯 ${dummy.name}: -${fmt(result.damage)} PV (${fmt(dummy.hp)}/${fmt(dummy.maxHp)})`, type: 'player', id: Date.now() + 0.55 });

    // Check dummy death
    if (dummy.hp <= 0) {
      dummy.alive = false;
      log.push({ text: '', type: 'system', id: Date.now() + 0.6 });
      log.push({ text: `💀 ${dummy.name} a été vaincu !`, type: 'system', id: Date.now() + 0.61 });

      const totalDmg = Object.values(dpsTracker.current).reduce((s, v) => s + v, 0);
      const dpsBreakdown = battle.fighters.map(f => ({
        id: f.id,
        name: f.name,
        sprite: f.sprite,
        damage: dpsTracker.current[f.id] || 0,
        percent: totalDmg > 0 ? ((dpsTracker.current[f.id] || 0) / totalDmg * 100) : 0,
      })).sort((a, b) => b.damage - a.damage);

      setResultData({ totalDmg, dpsBreakdown, turns: battle.turn });
      setTimeout(() => setPhase('result'), 800);
      return;
    }

    // ═══ WEAPON PASSIVE EFFECTS AFTER ATTACK ═══
    log.push({ text: '', type: 'system', id: Date.now() + 0.7 });
    log.push({ text: `⚡ Effets post-attaque:`, type: 'buff', id: Date.now() + 0.71 });

    // Katana Z: +1 stack
    if (fighter.passiveState.katanaZStacks !== undefined) {
      fighter.passiveState.katanaZStacks++;
      log.push({ text: `  ├─ Katana Z: +1 stack → ${fighter.passiveState.katanaZStacks} stacks total`, type: 'buff', id: Date.now() + 0.72 });
    }

    // Katana V: DoT + buff roll
    if (fighter.passiveState.katanaVState) {
      if (fighter.passiveState.katanaVState.nextDmgMult > 1) {
        fighter.passiveState.katanaVState.nextDmgMult = 1;
      }
      if (fighter.passiveState.katanaVState.dots < KATANA_V_DOT_MAX_STACKS) {
        fighter.passiveState.katanaVState.dots++;
        log.push({ text: `  ├─ Katana V: DoT +1 stack → ${fighter.passiveState.katanaVState.dots}/${KATANA_V_DOT_MAX_STACKS}`, type: 'buff', id: Date.now() + 0.73 });
      }

      if (Math.random() < KATANA_V_BUFF_CHANCE) {
        const roll = Math.random();
        if (roll < 0.33) {
          fighter.passiveState.katanaVState.allStatBuff += 10;
          log.push({ text: `  ├─ Katana V "Benediction": +10% stats ! (total: +${fighter.passiveState.katanaVState.allStatBuff}%)`, type: 'buff', id: Date.now() + 0.74 });
        } else if (roll < 0.66) {
          fighter.passiveState.katanaVState.shield = true;
          log.push({ text: `  ├─ Katana V "Bouclier Divin" activé !`, type: 'buff', id: Date.now() + 0.75 });
        } else {
          fighter.passiveState.katanaVState.nextDmgMult = 6;
          log.push({ text: `  ├─ Katana V "Puissance x6" activée !`, type: 'buff', id: Date.now() + 0.76 });
        }
      }
    }

    // Sulfuras
    if (fighter.passiveState.sulfurasStacks !== undefined) {
      if (fighter.passiveState.sulfurasStacks < SULFURAS_STACK_MAX) {
        fighter.passiveState.sulfurasStacks += SULFURAS_STACK_PER_TURN;
        log.push({ text: `  ├─ Sulfuras: +${SULFURAS_STACK_PER_TURN}% DMG → ${fighter.passiveState.sulfurasStacks}%`, type: 'buff', id: Date.now() + 0.77 });
      }
    }

    // Mana regen
    fighter.mana = Math.min(fighter.maxMana, fighter.mana + (fighter.manaRegen || 0));
    if (fighter.manaRegen > 0) {
      log.push({ text: `  ├─ Mana regen: +${fmt(fighter.manaRegen)} → ${fmt(fighter.mana)}/${fmt(fighter.maxMana)}`, type: 'info', id: Date.now() + 0.78 });
    }

    skill.cd = skill.cdMax || 0;
    if (skill.cdMax > 0) {
      log.push({ text: `  └─ Cooldown appliqué: ${skill.cdMax} tours`, type: 'info', id: Date.now() + 0.79 });
    }

    log.push({ text: '', type: 'system', id: Date.now() + 0.8 });

    // ═══ DUMMY ATTACK ═══
    phaseRef.current = 'enemy_atk';
    setTimeout(() => {
      log.push({ text: `🔴 ${dummy.name} attaque ${fighter.name} !`, type: 'enemy', id: Date.now() });
      log.push({ text: '', type: 'system', id: Date.now() + 0.01 });

      const dummySkill = dummy.skills[0];
      const eResult = computeAttack(dummy, dummySkill, fighter);

      log.push({ text: `🎲 Calcul des dégâts (Mannequin):`, type: 'enemy', id: Date.now() + 0.1 });
      log.push({ text: `  ├─ Puissance: ${dummySkill.power}%`, type: 'enemy', id: Date.now() + 0.11 });
      log.push({ text: `  ├─ ATK: ${fmt(dummy.atk)}`, type: 'enemy', id: Date.now() + 0.12 });
      log.push({ text: `  ├─ DEF cible: ${fmt(fighter.def)}`, type: 'enemy', id: Date.now() + 0.13 });

      // Katana Z counter
      if (fighter.passiveState.katanaZStacks !== undefined && eResult.damage > 0 && fighter.hp > 0) {
        if (Math.random() < KATANA_Z_COUNTER_CHANCE) {
          const counterDmg = Math.floor(getEffStat(fighter.atk, fighter.buffs, 'atk') * KATANA_Z_COUNTER_MULT);
          dummy.hp = Math.max(0, dummy.hp - counterDmg);
          dpsTracker.current[fighter.id] = (dpsTracker.current[fighter.id] || 0) + counterDmg;

          log.push({ text: '', type: 'system', id: Date.now() + 0.15 });
          log.push({ text: `⚡ CONTRE-ATTAQUE KATANA Z !`, type: 'crit', id: Date.now() + 0.16 });
          log.push({ text: `  ├─ Chance déclenchée: 50%`, type: 'crit', id: Date.now() + 0.17 });
          log.push({ text: `  ├─ Multiplicateur: x${KATANA_Z_COUNTER_MULT}`, type: 'crit', id: Date.now() + 0.18 });
          log.push({ text: `  └─ Dégâts: ${fmt(counterDmg)}`, type: 'crit', id: Date.now() + 0.19 });
          log.push({ text: `🎯 ${dummy.name}: -${fmt(counterDmg)} PV (${fmt(dummy.hp)}/${fmt(dummy.maxHp)})`, type: 'crit', id: Date.now() + 0.2 });
          log.push({ text: '', type: 'system', id: Date.now() + 0.21 });
        }
      }

      // Katana V shield
      if (fighter.passiveState.katanaVState?.shield && eResult.damage > 0) {
        fighter.passiveState.katanaVState.shield = false;
        log.push({ text: `🛡️ BOUCLIER DIVIN KATANA V ACTIVÉ !`, type: 'buff', id: Date.now() + 0.25 });
        log.push({ text: `  └─ Dégâts bloqués: ${fmt(eResult.damage)}`, type: 'buff', id: Date.now() + 0.26 });
        eResult.damage = 0;
        log.push({ text: '', type: 'system', id: Date.now() + 0.27 });
      }

      if (eResult.damage > 0) {
        log.push({ text: `  └─ Dégâts finaux: ${fmt(eResult.damage)}`, type: 'enemy', id: Date.now() + 0.3 });
        fighter.hp = Math.max(0, fighter.hp - eResult.damage);
        log.push({ text: `💔 ${fighter.name}: -${fmt(eResult.damage)} PV (${fmt(fighter.hp)}/${fmt(fighter.maxHp)})`, type: 'enemy', id: Date.now() + 0.35 });
      }

      if (fighter.hp <= 0) {
        fighter.alive = false;
        log.push({ text: '', type: 'system', id: Date.now() + 0.4 });
        log.push({ text: `💀 ${fighter.name} a été KO !`, type: 'enemy', id: Date.now() + 0.41 });
      }

      log.push({ text: '', type: 'system', id: Date.now() + 0.5 });

      // Cooldown/Buffs decay
      log.push({ text: `⏱️ Fin de tour:`, type: 'info', id: Date.now() + 0.55 });

      fighter.skills.forEach(s => {
        if (s.cd > 0) {
          s.cd--;
          log.push({ text: `  ├─ ${s.name}: CD -1 → ${s.cd} tours restants`, type: 'info', id: Date.now() + 0.56 });
        }
      });

      dummy.skills.forEach(s => {
        if (s.cd > 0) s.cd--;
      });

      fighter.buffs = fighter.buffs.map(b => ({ ...b, turns: b.turns - 1 })).filter(b => b.turns > 0);
      dummy.buffs = dummy.buffs.map(b => ({ ...b, turns: b.turns - 1 })).filter(b => b.turns > 0);

      // Katana Z stack decay
      if (fighter.passiveState.katanaZStacks !== undefined && fighter.passiveState.katanaZStacks > 0) {
        let surviving = 0;
        for (let i = 0; i < fighter.passiveState.katanaZStacks; i++) {
          if (Math.random() < KATANA_Z_STACK_PERSIST_CHANCE) surviving++;
        }

        const lost = fighter.passiveState.katanaZStacks - surviving;
        fighter.passiveState.katanaZStacks = surviving;

        log.push({ text: `  ├─ Katana Z "Tranchant Eternel": Test de persistance (50% par stack)`, type: 'info', id: Date.now() + 0.6 });
        if (surviving > 0) {
          log.push({ text: `  │  ├─ ${surviving} stacks persistent, ${lost} stacks dissipés`, type: 'info', id: Date.now() + 0.61 });
        } else {
          log.push({ text: `  │  └─ Tous les stacks ont été dissipés !`, type: 'info', id: Date.now() + 0.62 });
        }
      }

      log.push({ text: `  └─ Tour ${battle.turn} terminé`, type: 'info', id: Date.now() + 0.7 });

      // Update battle
      setBattle(prev => ({
        ...prev,
        fighters: battle.fighters,
        dummy,
        turn: prev.turn + 1,
        log: log.slice(-100),
      }));

      // Check all fighters dead
      if (!battle.fighters.some(f => f.alive)) {
        const totalDmg = Object.values(dpsTracker.current).reduce((s, v) => s + v, 0);
        const dpsBreakdown = battle.fighters.map(f => ({
          id: f.id,
          name: f.name,
          sprite: f.sprite,
          damage: dpsTracker.current[f.id] || 0,
          percent: totalDmg > 0 ? ((dpsTracker.current[f.id] || 0) / totalDmg * 100) : 0,
        })).sort((a, b) => b.damage - a.damage);

        setResultData({ totalDmg, dpsBreakdown, turns: battle.turn, defeat: true });
        setTimeout(() => setPhase('result'), 800);
        return;
      }

      // Switch fighter if dead
      if (fighter.hp <= 0) {
        const nextFighter = battle.fighters.find(f => f.alive && f.id !== fighter.id);
        if (nextFighter) {
          setSelectedFighterId(nextFighter.id);
          setBattle(prev => ({ ...prev, selectedFighterId: nextFighter.id }));
        }
      }

      phaseRef.current = 'idle';
    }, 800);
  }, [battle]);

  // ═══════════════════════════════════════════════════════════
  // RENDER PHASES
  // ═══════════════════════════════════════════════════════════

  return (
    <>
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: linear-gradient(135deg, #a855f7, #6366f1);
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid #ffffff40;
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: linear-gradient(135deg, #a855f7, #6366f1);
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid #ffffff40;
        }
      `}</style>

      <div className="min-h-screen bg-[#0f0f1a] text-white p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </Link>
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-orange-400" />
            <h1 className="text-3xl font-bold">Mannequin d'Entraînement</h1>
          </div>
          <div className="w-20" />
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {phase === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {renderSetup()}
            </motion.div>
          )}

          {phase === 'battle' && (
            <motion.div
              key="battle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {battleMode === 'automatic' ? renderBattleAutomatic() : renderBattleTurnBased()}
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {renderResult()}
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </>
  );

  // ═══════════════════════════════════════════════════════════
  // RENDER: SETUP PHASE
  // ═══════════════════════════════════════════════════════════

  function renderSetup() {
    return (
      <>
        {/* Mode Selector */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-bold mb-4 text-center text-purple-300">Mode de Combat</h2>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setBattleMode('automatic')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 font-bold transition-all ${
                battleMode === 'automatic'
                  ? 'border-purple-400 bg-purple-500/20 text-purple-200 scale-105'
                  : 'border-white/20 bg-white/5 text-gray-400 hover:border-white/40'
              }`}
            >
              <Zap className="w-5 h-5" />
              <span>Automatique</span>
            </button>
            <button
              onClick={() => setBattleMode('turn-based')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 font-bold transition-all ${
                battleMode === 'turn-based'
                  ? 'border-purple-400 bg-purple-500/20 text-purple-200 scale-105'
                  : 'border-white/20 bg-white/5 text-gray-400 hover:border-white/40'
              }`}
            >
              <Crosshair className="w-5 h-5" />
              <span>Tour par Tour</span>
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">
            {battleMode === 'automatic'
              ? 'Combat en temps réel (comme Raid Ant Queen). DPS tracking automatique.'
              : 'Combat au tour par tour (comme Shadow Colosseum). Contrôle manuel des skills.'}
          </p>
        </div>

        {/* Team Selection */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-bold mb-4 text-center text-purple-300">Équipe (1-6 Hunters)</h2>
          <p className="text-xs text-gray-400 text-center mb-4">
            {[...team1, ...team2].filter(Boolean).length <= 3 ? 'Team 1 uniquement' : 'Team 1 + Team 2 (auto-split)'}
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map(teamNum => {
              const team = teamNum === 1 ? team1 : team2;
              return (
                <div key={teamNum} className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <h3 className="text-sm font-bold text-center mb-3 text-purple-300">Team {teamNum}</h3>
                  <div className="flex gap-2 justify-center mb-3">
                    {team.map((id, idx) => {
                      const entity = id ? (HUNTERS[id] || CHIBIS[id]) : null;
                      const isActive = pickSlot?.team === teamNum && pickSlot?.idx === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSlotClick(teamNum, idx)}
                          className={`w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                            isActive
                              ? 'border-purple-400 bg-purple-500/20 scale-105'
                              : entity
                              ? 'border-white/20 bg-white/5 hover:border-white/30'
                              : 'border-dashed border-white/20 bg-white/5 hover:border-white/30'
                          }`}
                        >
                          {entity ? (
                            <>
                              <img
                                src={getEntitySprite(id, coloData)}
                                alt={entity.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <span className="text-[10px] text-white/80 mt-1 truncate w-full text-center">
                                {entity.name}
                              </span>
                              <span className="text-[9px] text-yellow-400">
                                Lv.{(coloData.chibiLevels[id] || { level: 1 }).level}
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl text-white/20">+</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Picker Modal */}
          {showPicker && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#0f0f1a] border-2 border-purple-400 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4 text-center">Sélectionner un Personnage</h3>

                {/* Hunters Section */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-purple-300 mb-2 uppercase tracking-wide">🗡️ Hunters</h4>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.keys(HUNTERS).map(hunterId => {
                      const hunter = HUNTERS[hunterId];
                      const owned = coloData.chibiLevels[hunterId] !== undefined;
                      if (!owned) return null;

                      const alreadySelected = [...team1, ...team2].includes(hunterId);

                      return (
                        <button
                          key={hunterId}
                          onClick={() => !alreadySelected && handleSelectHunter(hunterId)}
                          disabled={alreadySelected}
                          className={`flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all ${
                            alreadySelected
                              ? 'border-gray-600 bg-gray-800/50 opacity-50 cursor-not-allowed'
                              : 'border-white/10 bg-white/5 hover:border-purple-400 hover:bg-purple-500/10'
                          }`}
                        >
                          <img
                            src={getEntitySprite(hunterId, coloData)}
                            alt={hunter.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <span className="text-xs text-white/80 text-center">{hunter.name}</span>
                          <span className="text-[10px] text-yellow-400">
                            Lv.{(coloData.chibiLevels[hunterId] || { level: 1 }).level}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Chibis Section */}
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-cyan-300 mb-2 uppercase tracking-wide">🐾 Chibis</h4>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.keys(CHIBIS).map(chibiId => {
                      const chibi = CHIBIS[chibiId];
                      const owned = coloData.chibiLevels[chibiId] !== undefined;
                      if (!owned) return null;

                      const alreadySelected = [...team1, ...team2].includes(chibiId);

                      return (
                        <button
                          key={chibiId}
                          onClick={() => !alreadySelected && handleSelectHunter(chibiId)}
                          disabled={alreadySelected}
                          className={`flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all ${
                            alreadySelected
                              ? 'border-gray-600 bg-gray-800/50 opacity-50 cursor-not-allowed'
                              : 'border-white/10 bg-white/5 hover:border-cyan-400 hover:bg-cyan-500/10'
                          }`}
                        >
                          <img
                            src={getEntitySprite(chibiId, coloData)}
                            alt={chibi.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <span className="text-xs text-white/80 text-center">{chibi.name}</span>
                          <span className="text-[10px] text-yellow-400">
                            Lv.{(coloData.chibiLevels[chibiId] || { level: 1 }).level}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Clear & Close Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleClearSlot}
                    className="flex-1 py-2 rounded-xl bg-red-600/20 border border-red-500/30 text-red-300 font-bold hover:bg-red-600/30 transition-all"
                  >
                    Retirer
                  </button>
                  <button
                    onClick={() => setShowPicker(false)}
                    className="flex-1 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 font-bold transition-all"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Team Synergies Display */}
        {([...team1, ...team2].filter(Boolean).length > 0) && (() => {
          const team1Ids = team1.filter(Boolean);
          const team2Ids = team2.filter(Boolean);
          const team1Entities = team1Ids.map(id => HUNTERS[id] || CHIBIS[id]).filter(Boolean);
          const team2Entities = team2Ids.map(id => HUNTERS[id] || CHIBIS[id]).filter(Boolean);

          const synergy1 = computeSynergies(team1Entities);
          const synergy2 = computeSynergies(team2Entities);
          const crossSynergy = computeCrossTeamSynergy(team1Entities, team2Entities);

          const allLabels = [...synergy1.labels, ...synergy2.labels, ...crossSynergy.labels];

          return allLabels.length > 0 ? (
            <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl p-4 border-2 border-green-400/30">
              <h2 className="text-lg font-bold mb-3 text-center text-green-300">✨ Synergies d'Équipe</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {synergy1.labels.map((label, idx) => (
                  <div
                    key={`t1-${idx}`}
                    className="px-3 py-2 rounded-lg bg-green-600/20 border border-green-500/30 text-sm text-green-200 font-bold"
                  >
                    <span className="text-purple-300">Team 1:</span> {label}
                  </div>
                ))}
                {synergy2.labels.map((label, idx) => (
                  <div
                    key={`t2-${idx}`}
                    className="px-3 py-2 rounded-lg bg-green-600/20 border border-green-500/30 text-sm text-green-200 font-bold"
                  >
                    <span className="text-indigo-300">Team 2:</span> {label}
                  </div>
                ))}
                {crossSynergy.labels.map((label, idx) => (
                  <div
                    key={`cross-${idx}`}
                    className="px-3 py-2 rounded-lg bg-yellow-600/20 border border-yellow-500/30 text-sm text-yellow-200 font-bold col-span-full"
                  >
                    <span className="text-yellow-300">⚡ Cross-Team:</span> {label}
                  </div>
                ))}
              </div>
            </div>
          ) : null;
        })()}

        {/* Dummy Config */}
        <BossSelector
          configMode={configMode}
          setConfigMode={setConfigMode}
          selectedBoss={selectedBoss}
          setSelectedBoss={setSelectedBoss}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          raidTier={raidTier}
          setRaidTier={setRaidTier}
          dummyConfig={dummyConfig}
          setDummyConfig={setDummyConfig}
          applyPreset={applyPreset}
          applyBossPreset={applyBossPreset}
        />

        {/* Original manual config (kept for fallback) - HIDDEN */}
        {false && (
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-bold mb-4 text-center text-purple-300">Configuration Mannequin</h2>

          <div className="space-y-3 mb-4">
            {/* Level */}
            <SliderInput
              label="Level"
              value={dummyConfig.level}
              onChange={(v) => setDummyConfig(prev => ({ ...prev, level: v }))}
              min={1}
              max={100}
              step={1}
            />

            {/* HP */}
            <SliderInput
              label="HP"
              value={dummyConfig.hp}
              onChange={(v) => setDummyConfig(prev => ({ ...prev, hp: v }))}
              min={1000}
              max={10000000}
              step={1000}
              logarithmic
            />

            {/* ATK */}
            <SliderInput
              label="ATK"
              value={dummyConfig.atk}
              onChange={(v) => setDummyConfig(prev => ({ ...prev, atk: v }))}
              min={0}
              max={2000}
              step={10}
            />

            {/* DEF */}
            <SliderInput
              label="DEF"
              value={dummyConfig.def}
              onChange={(v) => setDummyConfig(prev => ({ ...prev, def: v }))}
              min={0}
              max={1000}
              step={10}
            />

            {/* RES */}
            <SliderInput
              label="RES"
              value={dummyConfig.res}
              onChange={(v) => setDummyConfig(prev => ({ ...prev, res: v }))}
              min={0}
              max={200}
              step={5}
            />

            {/* SPD */}
            <SliderInput
              label="SPD"
              value={dummyConfig.spd}
              onChange={(v) => setDummyConfig(prev => ({ ...prev, spd: v }))}
              min={0}
              max={200}
              step={5}
            />

            {/* CRIT */}
            <SliderInput
              label="CRIT"
              value={dummyConfig.crit}
              onChange={(v) => setDummyConfig(prev => ({ ...prev, crit: v }))}
              min={0}
              max={100}
              step={1}
              unit="%"
            />

            {/* CRIT DMG */}
            <SliderInput
              label="CRIT DMG"
              value={dummyConfig.critDmg}
              onChange={(v) => setDummyConfig(prev => ({ ...prev, critDmg: v }))}
              min={100}
              max={500}
              step={5}
              unit="%"
            />
          </div>

          {/* Presets */}
          <div className="border-t border-white/10 pt-4">
            <h3 className="text-sm font-bold text-gray-300 mb-2 text-center">Presets</h3>
            <div className="flex gap-2 justify-center flex-wrap">
              <button
                onClick={() => applyPreset('fragile')}
                className="px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-bold hover:bg-blue-600/30 transition-all"
              >
                Fragile
              </button>
              <button
                onClick={() => applyPreset('tank')}
                className="px-3 py-1.5 rounded-lg bg-green-600/20 border border-green-500/30 text-green-300 text-xs font-bold hover:bg-green-600/30 transition-all"
              >
                Tank
              </button>
              <button
                onClick={() => applyPreset('boss_t1')}
                className="px-3 py-1.5 rounded-lg bg-orange-600/20 border border-orange-500/30 text-orange-300 text-xs font-bold hover:bg-orange-600/30 transition-all"
              >
                Boss T1
              </button>
              <button
                onClick={() => applyPreset('boss_t3')}
                className="px-3 py-1.5 rounded-lg bg-red-600/20 border border-red-500/30 text-red-300 text-xs font-bold hover:bg-red-600/30 transition-all"
              >
                Boss T3
              </button>
              <button
                onClick={() => applyPreset('boss_t6')}
                className="px-3 py-1.5 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-bold hover:bg-purple-600/30 transition-all"
              >
                Boss T6
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Start Button */}
        <button
          onClick={handleStartBattle}
          disabled={[...team1, ...team2].filter(Boolean).length === 0}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed font-bold text-xl transition-all shadow-lg"
        >
          COMMENCER LE COMBAT
        </button>
      </>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: BATTLE AUTOMATIC
  // ═══════════════════════════════════════════════════════════

  function renderBattleAutomatic() {
    return (
      <BattleView
        battleState={battleState}
        dummyConfig={dummyConfig}
        setDummyConfig={setDummyConfig}
        timer={timer}
        isPaused={isPaused}
        dpsTracker={dpsTracker}
        dummyAttacksEnabled={dummyAttacksEnabled}
        setDummyAttacksEnabled={setDummyAttacksEnabled}
        combatLog={combatLog}
        dpsHistory={dpsHistory}
        detailedLogs={detailedLogs}
        coloData={coloData}
        onTogglePause={togglePause}
        onRefresh={refreshBattle}
      />
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: BATTLE TURN-BASED
  // ═══════════════════════════════════════════════════════════

  function renderBattleTurnBased() {
    if (!battle) return null;

    const activeFighter = battle.fighters.find(f => f.id === battle.selectedFighterId);
    if (!activeFighter) return null;

    const isAnimating = phaseRef.current !== 'idle';

    return (
      <>
        {/* Turn Counter */}
        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-2xl p-4 border-2 border-indigo-400/30">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-white">Tour {battle.turn}</div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Total Dégâts:</span>
              <span className="text-xl font-bold text-yellow-400">
                {fmt(Object.values(dpsTracker.current).reduce((s, v) => s + v, 0))}
              </span>
            </div>
            <button
              onClick={() => {
                if (confirm('Abandonner le combat ?')) {
                  setPhase('setup');
                }
              }}
              className="px-4 py-2 rounded-xl bg-red-600/20 border border-red-500/30 text-red-300 font-bold hover:bg-red-600/30 transition-all"
            >
              Abandonner
            </button>
          </div>
        </div>

        {/* Battle Arena */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4">
          {/* Fighters Side */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-center text-purple-300">Hunters</h3>

            {/* Fighter Selector */}
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="text-xs text-gray-400 mb-2 text-center">Sélectionner un hunter:</div>
              <div className="flex gap-2 justify-center flex-wrap">
                {battle.fighters.map(f => (
                  <button
                    key={f.id}
                    onClick={() => {
                      if (f.alive && !isAnimating) {
                        setSelectedFighterId(f.id);
                        setBattle(prev => ({ ...prev, selectedFighterId: f.id }));
                      }
                    }}
                    disabled={!f.alive || isAnimating}
                    className={`relative w-14 h-14 rounded-xl border-2 transition-all ${
                      f.id === activeFighter.id
                        ? 'border-purple-400 bg-purple-500/20 scale-110'
                        : f.alive
                        ? 'border-white/20 bg-white/5 hover:border-white/40'
                        : 'border-red-500/30 bg-red-900/10 opacity-30 cursor-not-allowed'
                    }`}
                  >
                    <img
                      src={f.sprite}
                      alt={f.name}
                      className="w-full h-full rounded-lg object-cover"
                    />
                    {!f.alive && (
                      <div className="absolute inset-0 flex items-center justify-center text-2xl">💀</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Fighter Detail */}
            <div className="bg-white/5 rounded-xl p-4 border-2 border-purple-400/30">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={activeFighter.sprite}
                  alt={activeFighter.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-purple-400"
                />
                <div className="flex-1">
                  <div className="text-lg font-bold">{activeFighter.name}</div>
                  <div className="text-xs text-gray-400 space-y-0.5">
                    <div>ATK: {fmt(activeFighter.atk)} | DEF: {fmt(activeFighter.def)}</div>
                    <div>SPD: {fmt(activeFighter.spd)} | CRIT: {fmt(activeFighter.crit)}%</div>
                  </div>
                </div>
              </div>

              {/* HP Bar */}
              <div className="space-y-1 mb-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-red-400 font-bold">HP</span>
                  <span className="text-white font-bold">
                    {fmt(activeFighter.hp)} / {fmt(activeFighter.maxHp)}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.max(0, (activeFighter.hp / activeFighter.maxHp) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Mana Bar */}
              {activeFighter.maxMana > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-400 font-bold">Mana</span>
                    <span className="text-white font-bold">
                      {fmt(activeFighter.mana)} / {fmt(activeFighter.maxMana)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.max(0, (activeFighter.mana / activeFighter.maxMana) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <div className="text-xs text-gray-400 mb-2 text-center">Compétences:</div>
              <div className="space-y-2">
                {activeFighter.skills.map((skill, idx) => {
                  const canUse = !isAnimating && skill.cd <= 0 && activeFighter.mana >= (skill.manaCost || 0);
                  return (
                    <button
                      key={idx}
                      onClick={() => executeRound(idx)}
                      disabled={!canUse}
                      className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                        canUse
                          ? 'border-green-400/30 bg-green-500/10 hover:bg-green-500/20 hover:border-green-400/50'
                          : 'border-white/10 bg-white/5 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm">{skill.name}</span>
                        {skill.cd > 0 && (
                          <span className="text-xs text-red-400 font-bold">CD: {skill.cd}</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 space-y-0.5">
                        <div>Puissance: {skill.power}%</div>
                        {skill.manaCost > 0 && (
                          <div className={activeFighter.mana >= skill.manaCost ? 'text-blue-400' : 'text-red-400'}>
                            Mana: {skill.manaCost}
                          </div>
                        )}
                        {skill.cdMax > 0 && <div>Cooldown: {skill.cdMax} tours</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-indigo-400 animate-pulse">VS</div>
          </div>

          {/* Dummy Side */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-center text-orange-300">Mannequin</h3>
            <div className="bg-white/5 rounded-xl p-4 border-2 border-orange-400/30">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={battle.dummy.sprite}
                  alt={battle.dummy.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-orange-400"
                />
                <div className="flex-1">
                  <div className="text-lg font-bold">{battle.dummy.name}</div>
                  <div className="text-xs text-gray-400">Level {dummyConfig.level}</div>
                </div>
              </div>

              {/* HP Bar */}
              <div className="space-y-1 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-red-400 font-bold">HP</span>
                  <span className="text-white font-bold">
                    {fmt(battle.dummy.hp)} / {fmt(battle.dummy.maxHp)}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-red-600 h-4 rounded-full transition-all"
                    style={{ width: `${Math.max(0, (battle.dummy.hp / battle.dummy.maxHp) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                  <div className="text-gray-400">ATK</div>
                  <div className="text-white font-bold text-lg">{fmt(battle.dummy.atk)}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                  <div className="text-gray-400">DEF</div>
                  <div className="text-white font-bold text-lg">{fmt(battle.dummy.def)}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                  <div className="text-gray-400">SPD</div>
                  <div className="text-white font-bold text-lg">{fmt(battle.dummy.spd)}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                  <div className="text-gray-400">RES</div>
                  <div className="text-white font-bold text-lg">{fmt(battle.dummy.res)}%</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                  <div className="text-gray-400">CRIT</div>
                  <div className="text-white font-bold text-lg">{fmt(battle.dummy.crit)}%</div>
                </div>
                <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                  <div className="text-gray-400">CRIT DMG</div>
                  <div className="text-white font-bold text-lg">{fmt(battle.dummy.critDmg)}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Combat Log */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h3 className="text-lg font-bold mb-3 text-center text-indigo-300">📜 Log de Combat Détaillé</h3>
          <div className="h-96 overflow-y-auto space-y-0.5 text-xs font-mono bg-black/30 p-3 rounded-lg border border-white/10">
            {battle.log.map((entry) => (
              <div
                key={entry.id}
                className={`${
                  entry.type === 'system'
                    ? 'text-gray-500'
                    : entry.type === 'crit'
                    ? 'text-yellow-300 font-bold'
                    : entry.type === 'buff'
                    ? 'text-purple-400'
                    : entry.type === 'enemy'
                    ? 'text-red-400'
                    : entry.type === 'player'
                    ? 'text-green-400'
                    : entry.type === 'info'
                    ? 'text-blue-300'
                    : 'text-white'
                }`}
              >
                {entry.text}
              </div>
            ))}
            <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
          </div>
        </div>
      </>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: RESULT PHASE
  // ═══════════════════════════════════════════════════════════

  function renderResult() {
    if (!resultData) return null;

    return (
      <>
        <div className="text-center">
          <h2 className="text-4xl font-bold">
            {resultData.defeat ? '❌ Défaite' : '✅ Victoire'}
          </h2>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h3 className="text-lg font-bold mb-2">Statistiques</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Total Dégâts: <span className="text-yellow-400 font-bold">{fmt(resultData.totalDmg)}</span></div>
            {resultData.duration && <div>Durée: <span className="text-blue-400 font-bold">{resultData.duration}s</span></div>}
            {resultData.turns && <div>Tours: <span className="text-purple-400 font-bold">{resultData.turns}</span></div>}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h3 className="text-lg font-bold mb-3">Répartition DPS</h3>
          <div className="space-y-2">
            {resultData.dpsBreakdown.map((f, i) => (
              <div key={f.id} className="flex items-center gap-3">
                <span className="text-xl font-bold text-gray-400">{i + 1}</span>
                <img src={f.sprite} alt={f.name} className="w-10 h-10 rounded-full object-cover border-2 border-purple-400" />
                <div className="flex-1">
                  <div className="text-sm font-bold">{f.name}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{fmt(f.damage)} DMG</span>
                    {f.dps !== undefined && <span>({fmt(Math.floor(f.dps))} DPS)</span>}
                    <span>({f.percent.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${f.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setPhase('setup')}
            className="flex-1 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 font-bold transition-all"
          >
            Recommencer
          </button>
          <button
            onClick={handleRestartSameConfig}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold transition-all"
          >
            Même Config
          </button>
        </div>
      </>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // EVENT HANDLERS - TEAM SELECTION
  // ═══════════════════════════════════════════════════════════

  function handleSlotClick(teamNum, idx) {
    setPickSlot({ team: teamNum, idx });
    setShowPicker(true);
  }

  function handleSelectHunter(hunterId) {
    if (!pickSlot) return;

    const { team: teamNum, idx } = pickSlot;

    // Check if hunter already in any team
    const allHunters = [...team1, ...team2];
    if (allHunters.includes(hunterId)) {
      alert('Ce hunter est déjà dans l\'équipe !');
      return;
    }

    if (teamNum === 1) {
      const newTeam = [...team1];
      newTeam[idx] = hunterId;
      setTeam1(newTeam);
    } else {
      const newTeam = [...team2];
      newTeam[idx] = hunterId;
      setTeam2(newTeam);
    }

    setShowPicker(false);
    setPickSlot(null);
  }

  function handleClearSlot() {
    if (!pickSlot) return;

    const { team: teamNum, idx } = pickSlot;

    if (teamNum === 1) {
      const newTeam = [...team1];
      newTeam[idx] = null;
      setTeam1(newTeam);
    } else {
      const newTeam = [...team2];
      newTeam[idx] = null;
      setTeam2(newTeam);
    }

    setShowPicker(false);
    setPickSlot(null);
  }

  // ═══════════════════════════════════════════════════════════
  // EVENT HANDLERS - BATTLE
  // ═══════════════════════════════════════════════════════════

  function handleStartBattle() {
    const allIds = [...team1, ...team2].filter(Boolean);
    if (allIds.length === 0) {
      alert('Sélectionnez au moins 1 hunter !');
      return;
    }

    if (battleMode === 'automatic') {
      startAutoBattle();
    } else {
      startTurnBasedBattle();
    }
  }

  function handleRestartSameConfig() {
    if (battleMode === 'automatic') {
      refreshBattle();
    } else {
      startTurnBasedBattle();
    }
  }
}
