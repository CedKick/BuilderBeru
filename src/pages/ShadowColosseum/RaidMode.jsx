// RaidMode.jsx — Real-time Raid Mode for Shadow Colosseum
// 3 phases: Setup (team pick) → Battle (real-time) → Result (RC/DPS)

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import shadowCoinManager from '../../components/ChibiSystem/ShadowCoinManager';
import { computeTalentBonuses } from './talentTreeData';
import {
  SPRITES, ELEMENTS, RARITY, CHIBIS,
  STAT_PER_POINT, STAT_ORDER, STAT_META, POINTS_PER_LEVEL, MAX_LEVEL,
  statsAt, statsAtFull, xpForLevel, getElementMult, getEffStat,
  applySkillUpgrades, computeAttack, aiPickSkill, spdToInterval,
  accountLevelFromXp, ACCOUNT_BONUS_INTERVAL, ACCOUNT_BONUS_AMOUNT,
  getBaseMana, BASE_MANA_REGEN, getSkillManaCost,
} from './colosseumCore';
import {
  HUNTERS, SUNG_SKILLS, RAID_BOSSES,
  RAID_DURATION_SEC, RAID_TICK_MS, BOSS_BASE_INTERVAL_MS, TEAM_SIZE,
  HUNTER_UNLOCK_THRESHOLDS,
  computeSynergies, computeCrossTeamSynergy, computeRaidRewards,
  loadRaidData, saveRaidData, getHunterPool, getHunterStars,
} from './raidData';
import {
  computeArtifactBonuses, computeWeaponBonuses, mergeEquipBonuses, HAMMERS, HAMMER_ORDER,
  generateRaidArtifact, MAX_DAILY_RAIDS, getActivePassives, RAID_ARTIFACT_SETS,
} from './equipmentData';
import { BattleStyles, RaidArena } from './BattleVFX';

// ─── Colosseum shared save (chibi levels, stat points, skill tree, talents) ──
const SAVE_KEY = 'shadow_colosseum_data';
const defaultColoData = () => ({ chibiLevels: {}, statPoints: {}, skillTree: {}, talentTree: {}, respecCount: {}, cooldowns: {}, stagesCleared: [], stats: { battles: 0, wins: 0 }, artifacts: {}, artifactInventory: [], weapons: {}, weaponInventory: [], hammers: { marteau_forge: 0, marteau_runique: 0, marteau_celeste: 0 }, accountXp: 0, accountBonuses: { hp: 0, atk: 0, def: 0, spd: 0, crit: 0, res: 0 }, accountAllocations: 0, dailyRaidDate: '', dailyRaidCount: 0 });
const loadColoData = () => { try { const d = { ...defaultColoData(), ...JSON.parse(localStorage.getItem(SAVE_KEY)) }; if (!d.artifacts) d.artifacts = {}; if (!d.weapons) d.weapons = {}; if (!d.hammers) d.hammers = { marteau_forge: 0, marteau_runique: 0, marteau_celeste: 0 }; if (d.accountXp === undefined) d.accountXp = 0; if (!d.accountBonuses) d.accountBonuses = { hp: 0, atk: 0, def: 0, spd: 0, crit: 0, res: 0 }; if (d.accountAllocations === undefined) d.accountAllocations = 0; const today = new Date().toISOString().slice(0, 10); if (d.dailyRaidDate !== today) { d.dailyRaidDate = today; d.dailyRaidCount = 0; } return d; } catch { return defaultColoData(); } };
const saveColoData = (d) => localStorage.setItem(SAVE_KEY, JSON.stringify(d));

// ─── Format numbers ──────────────────────────────────────────
const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(Math.floor(n));

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

  // ─── Refs for game loop ────────────────────────────────────
  const gameLoopRef = useRef(null);
  const battleRef = useRef(null);
  const timerRef = useRef(RAID_DURATION_SEC);
  const sungCDRef = useRef({});
  const sungBuffsRef = useRef([]);
  const dpsTracker = useRef({});
  const startTimeRef = useRef(0);
  const pausedRef = useRef(false);

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
    const tb = computeTalentBonuses(coloData.talentTree[id] || {});
    const artBonuses = computeArtifactBonuses(coloData.artifacts?.[id]);
    const weapBonuses = computeWeaponBonuses(coloData.weapons?.[id]);
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
    const tb = computeTalentBonuses(coloData.talentTree[id] || {});
    const artBonuses = computeArtifactBonuses(coloData.artifacts?.[id]);
    const weapBonuses = computeWeaponBonuses(coloData.weapons?.[id]);
    const eqB = mergeEquipBonuses(artBonuses, weapBonuses);
    const evStars = HUNTERS[id] ? getHunterStars(loadRaidData(), id) : 0;
    const st = statsAtFull(chibi.base, chibi.growth, lvData.level, allocated, tb, eqB, evStars, coloData.accountBonuses);

    // Apply synergy bonuses
    const syn = synergyBonuses;
    const hpBonus = 1 + (syn.hp + syn.allStats) / 100;
    const atkBonus = 1 + (syn.atk + syn.allStats) / 100;
    const defBonus = 1 + (syn.def + syn.allStats) / 100;
    const spdBonus = 1 + (syn.spd + syn.allStats) / 100;

    const finalHp = Math.floor(st.hp * hpBonus);
    const finalAtk = Math.floor(st.atk * atkBonus);
    const finalDef = Math.floor(st.def * defBonus);
    const finalSpd = Math.floor(st.spd * spdBonus);
    const finalCrit = +(st.crit + syn.crit).toFixed(1);
    const finalRes = +(st.res + syn.res).toFixed(1);

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

    return {
      id, name: chibi.name, element: chibi.element, class: chibi.class,
      sprite: chibi.sprite, rarity: chibi.rarity,
      hp: finalHp, maxHp: finalHp,
      atk: finalAtk, def: finalDef, spd: finalSpd, crit: finalCrit, res: finalRes,
      mana, maxMana: mana, manaRegen, manaCostReduce,
      skills, buffs: [], passives,
      passiveState: { flammeStacks: 0, martyrHealed: false, echoCounter: 0 },
      talentBonuses: (() => { const m = { ...tb }; for (const [k, v] of Object.entries(eqB)) { if (v) m[k] = (m[k] || 0) + v; } return m; })(),
      lastAttackAt: 0, attackInterval: spdToInterval(finalSpd),
      alive: true,
    };
  }, [allPool, coloData]);

  const buildBossEntity = useCallback(() => {
    const b = boss;
    const barHP = b.barScaling(0);
    return {
      id: 'boss', name: b.name, element: b.element, isBoss: true,
      sprite: b.sprite, emoji: b.emoji,
      hp: barHP, maxHp: barHP,
      atk: b.stats.atk, def: b.stats.def, spd: b.stats.spd,
      crit: b.stats.crit, res: b.stats.res,
      buffs: [],
      currentBar: 0, totalBars: b.totalBars, barsDestroyed: 0,
      skills: b.skills.map(s => ({ ...s, lastUsedAt: 0 })),
      phase: b.phases[0],
      lastAttackAt: 0,
    };
  }, [boss]);

  const startRaid = useCallback(() => {
    // Daily raid limit check
    const today = new Date().toISOString().slice(0, 10);
    const currentCount = coloData.dailyRaidDate === today ? (coloData.dailyRaidCount || 0) : 0;
    if (currentCount >= MAX_DAILY_RAIDS) return;

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
      // Commander DEF: all allies +10% DEF
      const cmdDef = c.passives?.find(p => p.type === 'commanderDef');
      if (cmdDef) chibis.forEach(ally => { ally.def = Math.floor(ally.def * 1.10); });
    });
    // Commander Crit: battle start +20% CRIT for ~30s (turns=30 in decay)
    chibis.forEach(c => {
      const cmdCrit = c.passives?.find(p => p.type === 'commanderCrit');
      if (cmdCrit) chibis.forEach(ally => { ally.buffs.push({ stat: 'crit', value: 20, turns: 30 }); });
    });

    // Increment daily raid count
    setColoData(prev => ({ ...prev, dailyRaidDate: today, dailyRaidCount: (prev.dailyRaidDate === today ? (prev.dailyRaidCount || 0) : 0) + 1 }));

    const bossEntity = buildBossEntity();
    const state = { chibis, boss: bossEntity };

    setBattleState(state);
    battleRef.current = state;
    setCombatLog([{ text: `Raid commence ! ${boss.name} apparait !`, time: 0, type: 'system' }]);
    setSungCooldowns({});
    sungCDRef.current = {};
    setActiveSungBuffs([]);
    sungBuffsRef.current = [];
    setTimer(RAID_DURATION_SEC);
    timerRef.current = RAID_DURATION_SEC;
    dpsTracker.current = {};
    chibis.forEach(c => { dpsTracker.current[c.id] = 0; });
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
    if (remaining <= 0 || aliveCount === 0 || state.boss.barsDestroyed >= state.boss.totalBars) {
      // End raid
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;

      const rc = state.boss.barsDestroyed;
      const isFullClear = rc >= state.boss.totalBars;
      const totalDamage = Object.values(dpsTracker.current).reduce((s, v) => s + v, 0);
      const rewards = computeRaidRewards(rc, isFullClear);
      const endReason = remaining <= 0 ? 'timeout' : aliveCount === 0 ? 'wipe' : 'clear';

      // DPS breakdown
      const dpsBreakdown = state.chibis.map(c => ({
        id: c.id, name: c.name, sprite: c.sprite, element: c.element,
        damage: dpsTracker.current[c.id] || 0,
        percent: totalDamage > 0 ? ((dpsTracker.current[c.id] || 0) / totalDamage * 100) : 0,
      })).sort((a, b) => b.damage - a.damage);

      // Check hunter unlocks via thresholds
      const newRC = (raidData.raidStats.totalRC || 0) + rc;
      const unlockedHunters = [];
      const hunterDuplicates = [];
      const hunterIds = Object.keys(HUNTERS);
      const alreadyOwned = new Set((raidData.hunterCollection || []).map(e => typeof e === 'string' ? e : e.id));
      const oldRC = raidData.raidStats.totalRC || 0;

      HUNTER_UNLOCK_THRESHOLDS.forEach(threshold => {
        if (newRC >= threshold.rc && oldRC < threshold.rc) {
          const candidates = hunterIds.filter(h =>
            HUNTERS[h].rarity === threshold.rarity && !alreadyOwned.has(h)
          );
          if (candidates.length > 0) {
            const pick = candidates[Math.floor(Math.random() * candidates.length)];
            unlockedHunters.push(pick);
            alreadyOwned.add(pick);
          } else {
            // All hunters of this rarity owned — give a duplicate for eveil
            const dupePool = hunterIds.filter(h => HUNTERS[h].rarity === threshold.rarity);
            if (dupePool.length > 0) {
              const pick = dupePool[Math.floor(Math.random() * dupePool.length)];
              hunterDuplicates.push(pick);
            }
          }
        }
      });

      // Apply rewards
      shadowCoinManager.addCoins(rewards.coins, 'raid_reward');

      // Hammer drops based on RC
      const hammerDrops = {};
      const hammerTiers = rc >= 8 ? ['marteau_runique', 'marteau_celeste'] : rc >= 4 ? ['marteau_forge', 'marteau_runique'] : ['marteau_forge'];
      const hammerCount = Math.min(3, Math.floor(rc / 2) + (isFullClear ? 2 : 0));
      for (let i = 0; i < hammerCount; i++) {
        const hId = hammerTiers[Math.floor(Math.random() * hammerTiers.length)];
        hammerDrops[hId] = (hammerDrops[hId] || 0) + 1;
      }

      // Raid artifact drops (exclusive raid sets!)
      const raidArtifactDrops = [];
      if (rc >= 2) {
        // Guaranteed 1 artifact at RC 2+
        const rarity1 = rc >= 8 ? 'mythique' : rc >= 5 ? 'legendaire' : 'rare';
        raidArtifactDrops.push(generateRaidArtifact(rarity1));
      }
      if (rc >= 6) {
        // Bonus artifact at RC 6+
        const rarity2 = rc >= 9 ? 'mythique' : 'legendaire';
        raidArtifactDrops.push(generateRaidArtifact(rarity2));
      }
      if (isFullClear) {
        // Full clear bonus: guaranteed mythique
        raidArtifactDrops.push(generateRaidArtifact('mythique'));
      }

      // XP to participating chibis + save hammer drops + raid artifacts
      const newColoData = { ...coloData };
      const newHammers = { ...(newColoData.hammers || { marteau_forge: 0, marteau_runique: 0, marteau_celeste: 0 }) };
      Object.entries(hammerDrops).forEach(([hId, count]) => { newHammers[hId] = (newHammers[hId] || 0) + count; });
      newColoData.hammers = newHammers;
      // Add raid artifacts to inventory
      if (raidArtifactDrops.length > 0) {
        newColoData.artifactInventory = [...(newColoData.artifactInventory || []), ...raidArtifactDrops];
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
      // Account XP from raid
      const raidAccountXp = 30 + rc * 15 + (isFullClear ? 50 : 0);
      newColoData.accountXp = (newColoData.accountXp || 0) + raidAccountXp;
      setColoData(newColoData);

      // Update raid data
      const newRaidData = { ...raidData };
      newRaidData.raidStats = {
        totalRC: newRC,
        bestRC: Math.max(raidData.raidStats.bestRC || 0, rc),
        totalDamage: (raidData.raidStats.totalDamage || 0) + totalDamage,
        raidsPlayed: (raidData.raidStats.raidsPlayed || 0) + 1,
      };
      if (!newRaidData.weeklyBoss[bossId]) newRaidData.weeklyBoss[bossId] = { attempts: 0, bestRC: 0 };
      newRaidData.weeklyBoss[bossId].attempts++;
      newRaidData.weeklyBoss[bossId].bestRC = Math.max(newRaidData.weeklyBoss[bossId].bestRC, rc);
      newRaidData.lastTeam = [...team1, ...team2];
      // Add unlocked hunters (new format)
      unlockedHunters.forEach(hId => {
        const existing = (newRaidData.hunterCollection || []).find(e => (typeof e === 'string' ? e : e.id) === hId);
        if (!existing) {
          newRaidData.hunterCollection = [...(newRaidData.hunterCollection || []), { id: hId, stars: 0 }];
        }
      });
      // Handle duplicates (eveil)
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

      setResultData({
        rc, isFullClear, totalDamage, endReason, dpsBreakdown,
        rewards, unlockedHunters, hunterDuplicates, hammerDrops, raidArtifactDrops,
        duration: Math.floor(elapsed),
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
      chibi.atk = Math.floor(origAtk * (1 + sungMults.atk / 100));
      chibi.crit = +(origCrit + sungMults.crit).toFixed(1);

      // Temporarily modify boss DEF
      const origBossDef = state.boss.def;
      state.boss.def = Math.floor(origBossDef * (1 - bossDebuffs.def / 100));

      // Support healing: if support class and ally is low, heal instead of attack
      if (chibi.class === 'support') {
        const aliveAllies = state.chibis.filter(a => a.alive && a.id !== chibi.id && a.hp < a.maxHp);
        const lowestAlly = aliveAllies.sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0];
        if (lowestAlly && (lowestAlly.hp / lowestAlly.maxHp) < 0.75) {
          const healBonus = (chibi.talentBonuses?.healBonus || 0);
          const healAmt = Math.floor(lowestAlly.maxHp * 0.15 * (1 + healBonus / 100));
          lowestAlly.hp = Math.min(lowestAlly.maxHp, lowestAlly.hp + healAmt);
          chibi.lastAttackAt = now;
          // Restore stats before return
          chibi.atk = origAtk; chibi.crit = origCrit; state.boss.def = origBossDef;
          logEntries.push({ text: `${chibi.name} soigne ${lowestAlly.name} +${healAmt} PV`, time: elapsed, type: 'heal' });
          vfxEvents.push({ id: now + Math.random(), type: 'heal', targetId: lowestAlly.id, value: healAmt, timestamp: now });
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
          logEntries.push({ text: `${chibi.name} [Martyr] soigne ${critAlly.name} +${healAmt} PV !`, time: elapsed, type: 'heal' });
          vfxEvents.push({ id: now + Math.random(), type: 'heal', targetId: critAlly.id, value: healAmt, timestamp: now });
        }
      }

      // AI picks a skill considering mana
      const availSkills = chibi.skills.filter(s => {
        if ((s.cd || 0) > 0) return false;
        const cost = chibi.passiveState?.echoFreeMana ? 0 : (s.manaCost || 0);
        return (chibi.mana || 999) >= cost;
      });
      const entityForAI = { ...chibi, skills: availSkills.length > 0 ? availSkills.map(s => ({ ...s, cd: 0 })) : [{ ...chibi.skills[0], cd: 0 }] };
      const skill = aiPickSkill(entityForAI);

      // Consume mana
      if (chibi.maxMana > 0 && skill.manaCost > 0) {
        const actualCost = chibi.passiveState?.echoFreeMana ? 0 : skill.manaCost;
        chibi.mana = Math.max(0, (chibi.mana || 0) - actualCost);
        if (chibi.passiveState?.echoFreeMana) chibi.passiveState.echoFreeMana = false;
      }

      let result = computeAttack(chibi, skill, state.boss, chibi.talentBonuses || {});

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
      }

      // Restore original stats
      chibi.atk = origAtk;
      chibi.crit = origCrit;
      state.boss.def = origBossDef;

      // Apply damage to boss
      if (result.damage > 0) {
        state.boss.hp -= result.damage;
        dpsTracker.current[chibi.id] = (dpsTracker.current[chibi.id] || 0) + result.damage;

        // ── Passive: Lifesteal — 15% chance to steal 12% DMG as HP
        if (chibi.passives?.find(p => p.type === 'lifesteal') && Math.random() < 0.15) {
          const heal = Math.floor(result.damage * 0.12);
          chibi.hp = Math.min(chibi.maxHp, chibi.hp + heal);
        }

        // Check bar break
        if (state.boss.hp <= 0) {
          state.boss.barsDestroyed++;
          if (state.boss.barsDestroyed < state.boss.totalBars) {
            const nextBarHP = boss.barScaling(state.boss.barsDestroyed);
            state.boss.hp = nextBarHP;
            state.boss.maxHp = nextBarHP;
            logEntries.push({ text: `BARRE ${state.boss.barsDestroyed} DETRUITE ! RC +1`, time: elapsed, type: 'bar_break' });
            vfxEvents.push({ id: now + Math.random() + 0.1, type: 'bar_break', timestamp: now });

            // Check phase transition
            const barsLeft = state.boss.totalBars - state.boss.barsDestroyed;
            const newPhase = [...boss.phases].reverse().find(p => barsLeft <= p.barsRemaining);
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
        chibi.hp = Math.min(chibi.maxHp, chibi.hp + result.healed);
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
      logEntries.push({ text: result.text, time: elapsed, type: result.isCrit ? 'crit' : 'normal' });
      vfxEvents.push({ id: now + Math.random(), type: 'chibi_attack', sourceId: chibi.id, element: chibi.element, damage: result.damage, isCrit: result.isCrit, timestamp: now });
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
            // Counter on dodge
            const counterP = target.passives?.find(p => p.type === 'shadowCounter');
            if (counterP) {
              const counterDmg = Math.floor(target.atk * 0.8);
              state.boss.hp -= counterDmg;
              dpsTracker.current[target.id] = (dpsTracker.current[target.id] || 0) + counterDmg;
              logEntries.push({ text: `${target.name} contre-attaque ! -${counterDmg}`, time: elapsed, type: 'crit' });
            }
            return;
          }
          const dmg = computeAttack(state.boss, bSkill, target);
          target.hp -= dmg.damage;
          // Reset flamme stacks when hit
          if (target.passiveState?.flammeStacks > 0) target.passiveState.flammeStacks = 0;
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
          logEntries.push({ text: `${state.boss.name} → ${target.name}: ${bossSkill.name} -${dmg?.damage || 0} PV${!target.alive ? ' K.O. !' : ''}`, time: elapsed, type: 'boss' });
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
      setCombatLog(prev => [...prev.slice(-30), ...logEntries]);
    }

    // Push VFX events
    if (vfxEvents.length > 0) {
      setVfxQueue(prev => [...prev.filter(v => now - v.timestamp < 800).slice(-20), ...vfxEvents]);
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
        setCombatLog(prev => [...prev.slice(-30), {
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
        setCombatLog(prev => [...prev.slice(-30), {
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

  const renderSetup = () => (
    <div className="space-y-6">
      {/* Boss Preview */}
      <div className="bg-gradient-to-r from-red-900/40 to-amber-900/40 border border-red-500/30 rounded-2xl p-4 text-center">
        <div className="text-3xl mb-1">{boss.emoji}</div>
        <h2 className="text-xl font-bold text-red-400">{boss.name}</h2>
        <div className="flex items-center justify-center gap-3 text-sm text-gray-400 mt-1">
          <span className={ELEMENTS[boss.element]?.color}>{ELEMENTS[boss.element]?.icon} {ELEMENTS[boss.element]?.name}</span>
          <span>|</span>
          <span>{boss.totalBars} Barres</span>
          <span>|</span>
          <span>HP: {fmt(boss.baseHP)} → {fmt(boss.barScaling(boss.totalBars - 1))}</span>
        </div>
        <div className="flex justify-center gap-1 mt-2">
          {Array.from({ length: boss.totalBars }).map((_, i) => (
            <div key={i} className="w-3 h-3 rotate-45 bg-red-500/60 border border-red-400/40" />
          ))}
        </div>
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

      {/* Cross-team synergy */}
      {crossSynergy.labels.length > 0 && (
        <div className="text-center text-xs text-yellow-400">
          {crossSynergy.labels.join(' | ')}
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

      {/* Daily raid counter */}
      {(() => {
        const today = new Date().toISOString().slice(0, 10);
        const count = coloData.dailyRaidDate === today ? (coloData.dailyRaidCount || 0) : 0;
        const remaining = MAX_DAILY_RAIDS - count;
        return (
          <div className={`text-center text-sm font-bold ${remaining > 3 ? 'text-emerald-400' : remaining > 0 ? 'text-amber-400' : 'text-red-400'}`}>
            Tentatives : {remaining}/{MAX_DAILY_RAIDS} restantes aujourd'hui
          </div>
        );
      })()}

      {/* Launch button */}
      <div className="flex justify-center gap-3">
        <Link to="/shadow-colosseum"
          className="px-4 py-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-all text-sm">
          Retour
        </Link>
        <button onClick={startRaid}
          disabled={selectedIds.length === 0 || (() => { const today = new Date().toISOString().slice(0, 10); return coloData.dailyRaidDate === today && (coloData.dailyRaidCount || 0) >= MAX_DAILY_RAIDS; })()}
          className="px-8 py-3 rounded-xl font-bold text-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95">
          LANCER LE RAID
        </button>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // RENDER — Result Phase
  // ═══════════════════════════════════════════════════════════

  const renderResult = () => {
    if (!resultData) return null;
    const { rc, isFullClear, totalDamage, endReason, dpsBreakdown, rewards, unlockedHunters, hunterDuplicates = [], hammerDrops = {}, raidArtifactDrops = [], duration } = resultData;
    const min = Math.floor(duration / 60);
    const sec = duration % 60;

    return (
      <div className="space-y-4">
        {/* Header */}
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className={`text-center p-6 rounded-2xl border ${
            isFullClear ? 'bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-yellow-500/30' :
            endReason === 'wipe' ? 'bg-gradient-to-r from-red-900/40 to-gray-900/40 border-red-500/30' :
            'bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-blue-500/30'
          }`}>
          <div className="text-4xl mb-2">{isFullClear ? '\uD83C\uDFC6' : endReason === 'wipe' ? '\uD83D\uDC80' : '\u23F1\uFE0F'}</div>
          <h2 className="text-2xl font-bold mb-1">
            {isFullClear ? 'VICTOIRE TOTALE !' : endReason === 'wipe' ? 'EQUIPE ELIMINEE' : 'TEMPS ECOULE'}
          </h2>
          <div className="flex justify-center gap-6 text-lg">
            <span className="text-orange-400">RC: <b>{rc}</b></span>
            <span className="text-blue-400">DMG: <b>{fmt(totalDamage)}</b></span>
            <span className="text-gray-400">{min}:{sec.toString().padStart(2, '0')}</span>
          </div>
        </motion.div>

        {/* Rewards */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
          <div className="text-yellow-400 text-lg font-bold mb-1">+{rewards.coins} Shadow Coins</div>
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
            />
          )}
          {phase === 'result' && renderResult()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
