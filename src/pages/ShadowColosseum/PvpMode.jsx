// PvpMode.jsx — Async 6v6 PVP for Shadow Colosseum
// Phases: setup → matchmaking → battle → result → rankings

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { computeTalentBonuses } from './talentTreeData';
import { computeTalentBonuses2 } from './talentTree2Data';
import {
  SPRITES, ELEMENTS, RARITY, CHIBIS,
  STAT_PER_POINT, STAT_ORDER, STAT_META, MAX_LEVEL,
  statsAtFull, getEffStat,
  applySkillUpgrades, computeAttack, aiPickSkill, aiPickSkillSupport, spdToInterval,
  accountLevelFromXp, getBaseMana, BASE_MANA_REGEN, getSkillManaCost,
  PVP_DAMAGE_MULT, PVP_HP_MULT, PVP_DEF_MULT, PVP_RES_MULT, PVP_DURATION_SEC, PVP_TICK_MS,
  mergeTalentBonuses,
} from './colosseumCore';
import {
  HUNTERS, HUNTER_PASSIVE_EFFECTS,
  computeSynergies, computeCrossTeamSynergy,
  loadRaidData, getHunterPool, getHunterStars,
} from './raidData';
import {
  computeArtifactBonuses, computeWeaponBonuses, mergeEquipBonuses,
  getActivePassives, WEAPONS, computeEquipILevel,
} from './equipmentData';
import { BattleStyles } from './BattleVFX';

// ─── Save keys ──────────────────────────────────────────────
const COLO_KEY = 'shadow_colosseum_data';
const PVP_KEY = 'pvp_data';

const defaultColoData = () => ({ chibiLevels: {}, statPoints: {}, skillTree: {}, talentTree: {}, respecCount: {}, cooldowns: {}, stagesCleared: [], stats: { battles: 0, wins: 0 }, artifacts: {}, artifactInventory: [], weapons: {}, weaponCollection: {}, hammers: { marteau_forge: 0, marteau_runique: 0, marteau_celeste: 0 }, accountXp: 0, accountBonuses: { hp: 0, atk: 0, def: 0, spd: 0, crit: 0, res: 0 }, accountAllocations: 0 });
const loadColoData = () => { try { return { ...defaultColoData(), ...JSON.parse(localStorage.getItem(COLO_KEY)) }; } catch { return defaultColoData(); } };

const defaultPvpData = () => ({ displayName: '', defenseTeam: [], attackTeam: [], pvpStats: { wins: 0, losses: 0, rating: 1000, bestRating: 1000 }, lastMatchAt: 0 });
const loadPvpData = () => { try { return { ...defaultPvpData(), ...JSON.parse(localStorage.getItem(PVP_KEY)) }; } catch { return defaultPvpData(); } };
const savePvpData = (d) => localStorage.setItem(PVP_KEY, JSON.stringify(d));

const getDeviceId = () => {
  let id = localStorage.getItem('builderberu_device_id');
  if (!id) { id = 'dev_' + crypto.randomUUID(); localStorage.setItem('builderberu_device_id', id); }
  return id;
};

const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(Math.floor(n));

const ELEMENT_COLORS_RAW = {
  shadow: '#a855f7', fire: '#ef4444', wind: '#10b981', earth: '#f59e0b', water: '#3b82f6', light: '#fbbf24',
};

// Positions for 6v6 arena: left team (attackers) and right team (defenders)
const ATK_POSITIONS = [
  { left: '5%', top: '15%' },
  { left: '3%', top: '40%' },
  { left: '5%', top: '65%' },
  { left: '18%', top: '8%' },
  { left: '16%', top: '36%' },
  { left: '18%', top: '60%' },
];
const DEF_POSITIONS = [
  { right: '5%', top: '15%' },
  { right: '3%', top: '40%' },
  { right: '5%', top: '65%' },
  { right: '18%', top: '8%' },
  { right: '16%', top: '36%' },
  { right: '18%', top: '60%' },
];

// PVP Arena backgrounds (random per battle)
const PVP_ARENAS = [
  'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771328568/pvpArena1_wfxqmk.png',
  'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771328568/pvpArena2_hqeqzb.png',
];

// ═══════════════════════════════════════════════════════════════
// PVP MODE COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function PvpMode() {
  const [coloData] = useState(() => loadColoData());
  const [pvpData, setPvpData] = useState(() => loadPvpData());
  const [phase, setPhase] = useState('setup');

  // Setup state
  const [team1, setTeam1] = useState(() => {
    const t = loadPvpData().attackTeam || [];
    return [t[0] || null, t[1] || null, t[2] || null];
  });
  const [team2, setTeam2] = useState(() => {
    const t = loadPvpData().attackTeam || [];
    return [t[3] || null, t[4] || null, t[5] || null];
  });
  const [defTeam1, setDefTeam1] = useState(() => {
    const t = loadPvpData().defenseTeam || [];
    return [t[0] || null, t[1] || null, t[2] || null];
  });
  const [defTeam2, setDefTeam2] = useState(() => {
    const t = loadPvpData().defenseTeam || [];
    return [t[3] || null, t[4] || null, t[5] || null];
  });
  const [pickSlot, setPickSlot] = useState(null);
  const [displayName, setDisplayName] = useState(() => loadPvpData().displayName || '');
  const [tab, setTab] = useState('atk');
  const [registerMsg, setRegisterMsg] = useState('');

  // Matchmaking state
  const [opponents, setOpponents] = useState([]);
  const [loadingOpponents, setLoadingOpponents] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [dailyRemaining, setDailyRemaining] = useState(25);

  // Battle state
  const [battleState, setBattleState] = useState(null);
  const battleRef = useRef(null);
  const [combatLog, setCombatLog] = useState([]);
  const [timer, setTimer] = useState(PVP_DURATION_SEC);
  const timerRef = useRef(PVP_DURATION_SEC);
  const gameLoopRef = useRef(null);
  const startTimeRef = useRef(0);
  const dpsTracker = useRef({});
  const [speedMult, setSpeedMult] = useState(1);
  const speedMultRef = useRef(1);
  const [vfxEvents, setVfxEvents] = useState([]);
  const vfxIdRef = useRef(0);

  // Arena background
  const [arenaBg, setArenaBg] = useState(() => PVP_ARENAS[Math.floor(Math.random() * PVP_ARENAS.length)]);

  // Result state
  const [resultData, setResultData] = useState(null);

  // Rankings state
  const [rankings, setRankings] = useState([]);
  const [rankingsTotal, setRankingsTotal] = useState(0);
  const [playerRank, setPlayerRank] = useState(null);
  const [loadingRankings, setLoadingRankings] = useState(false);

  // ─── Pool of available chibis/hunters ────────────────────────
  const raidData = useMemo(() => loadRaidData(), []);
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

  // ─── Save pvp data on change ─────────────────────────────────
  useEffect(() => { savePvpData(pvpData); }, [pvpData]);

  // ─── SEO ──────────────────────────────────────────────────────
  useEffect(() => {
    document.title = 'PVP Arena - Shadow Colosseum | BuilderBeru';
    window.dispatchEvent(new CustomEvent('beru-react', {
      detail: { message: 'Arene PVP ! 6v6 contre les autres joueurs !', mood: 'excited' },
    }));
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // BUILD ENTITY — Compute combat-ready unit from save data
  // ═══════════════════════════════════════════════════════════════

  const buildChibiEntity = useCallback((id) => {
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
    const evStars = HUNTERS[id] ? getHunterStars(raidData, id) : 0;
    const st = statsAtFull(chibi.base, chibi.growth, lvData.level, allocated, tb, eqB, evStars, coloData.accountBonuses);
    const weaponType = wId && WEAPONS[wId] ? WEAPONS[wId].weaponType : null;

    const hunterPassive = HUNTERS[id] ? (HUNTER_PASSIVE_EFFECTS[id] || null) : null;

    let hp2 = st.hp, atk2 = st.atk, def2 = st.def, spd2 = st.spd, crit2 = st.crit, res2 = st.res;
    if (hunterPassive?.type === 'permanent' && hunterPassive.stats) {
      if (hunterPassive.stats.hp) hp2 = Math.floor(hp2 * (1 + hunterPassive.stats.hp / 100));
      if (hunterPassive.stats.atk) atk2 = Math.floor(atk2 * (1 + hunterPassive.stats.atk / 100));
      if (hunterPassive.stats.def) def2 = Math.floor(def2 * (1 + hunterPassive.stats.def / 100));
      if (hunterPassive.stats.spd) spd2 = Math.floor(spd2 * (1 + hunterPassive.stats.spd / 100));
      if (hunterPassive.stats.crit) crit2 = +(crit2 + hunterPassive.stats.crit).toFixed(1);
      if (hunterPassive.stats.res) res2 = +(res2 + hunterPassive.stats.res).toFixed(1);
    }

    const skillTreeData = coloData.skillTree[id] || {};
    const skills = chibi.skills.map((sk, i) => {
      const lvl = skillTreeData[i] || 0;
      const upgraded = applySkillUpgrades(sk, lvl);
      const rawCost = getSkillManaCost(upgraded);
      const cost = Math.floor(rawCost * (1 - (st.manaCostReduce || 0) / 100));
      return { ...upgraded, cd: 0, cdMaxMs: upgraded.cdMax * spdToInterval(spd2), manaCost: cost };
    });

    const passives = getActivePassives(coloData.artifacts?.[id]);

    const mergedTb = { ...tb };
    Object.entries(eqB).forEach(([k, v]) => { if (v) mergedTb[k] = (mergedTb[k] || 0) + v; });
    if (hunterPassive) {
      if (hunterPassive.type === 'healBonus') mergedTb.healBonus = (mergedTb.healBonus || 0) + hunterPassive.value;
      if (hunterPassive.type === 'critDmg') mergedTb.critDamage = (mergedTb.critDamage || 0) + hunterPassive.value;
      if (hunterPassive.type === 'magicDmg') mergedTb.allDamage = (mergedTb.allDamage || 0) + hunterPassive.value;
    }

    return {
      id, name: chibi.name, element: chibi.element, class: chibi.class,
      sprite: chibi.sprite || SPRITES[id], rarity: chibi.rarity,
      weaponType,
      hp: hp2, maxHp: hp2,
      atk: atk2, def: def2, spd: spd2, crit: crit2, res: res2,
      mana: st.mana || 0, maxMana: st.mana || 0, manaRegen: st.manaRegen || 0, manaCostReduce: st.manaCostReduce || 0,
      skills, buffs: [], passives,
      passiveState: { flammeStacks: 0, martyrHealed: false, echoCounter: 0, sianStacks: 0 },
      talentBonuses: mergedTb,
      hunterPassive,
      lastAttackAt: 0, attackInterval: spdToInterval(spd2),
      alive: true,
    };
  }, [allPool, coloData, raidData]);

  const computePowerScore = useCallback((ids) => {
    let total = 0;
    ids.filter(Boolean).forEach(id => {
      const wId = coloData.weapons?.[id];
      const wAw = wId ? (coloData.weaponCollection?.[wId] || 0) : 0;
      const eq = computeEquipILevel(coloData.artifacts?.[id], wId, wAw);
      total += eq.total;
    });
    return total;
  }, [coloData]);

  // Apply PVP multipliers to entity (HP x3, DEF x1.6, RES x1.4)
  const applyPvpStats = (entity) => {
    entity.hp = Math.floor(entity.hp * PVP_HP_MULT);
    entity.maxHp = Math.floor(entity.maxHp * PVP_HP_MULT);
    entity.def = Math.floor(entity.def * PVP_DEF_MULT);
    entity.res = +(entity.res * PVP_RES_MULT).toFixed(1);
  };

  // ═══════════════════════════════════════════════════════════════
  // TEAM SELECTION
  // ═══════════════════════════════════════════════════════════════

  const activeTeam1 = tab === 'atk' ? team1 : defTeam1;
  const activeTeam2 = tab === 'atk' ? team2 : defTeam2;
  const activeSetter1 = tab === 'atk' ? setTeam1 : setDefTeam1;
  const activeSetter2 = tab === 'atk' ? setTeam2 : setDefTeam2;
  const selectedIds = useMemo(() => [...activeTeam1, ...activeTeam2].filter(Boolean), [activeTeam1, activeTeam2]);

  const handleSlotClick = (teamNum, idx) => {
    const team = teamNum === 1 ? activeTeam1 : activeTeam2;
    if (team[idx]) {
      const setter = teamNum === 1 ? activeSetter1 : activeSetter2;
      setter(prev => { const n = [...prev]; n[idx] = null; return n; });
      setPickSlot(null);
    } else {
      setPickSlot({ team: teamNum, idx });
    }
  };

  const handlePickChibi = (id) => {
    if (!pickSlot) return;
    const setter = pickSlot.team === 1 ? activeSetter1 : activeSetter2;
    setter(prev => { const n = [...prev]; n[pickSlot.idx] = id; return n; });
    setPickSlot(null);
  };

  // ═══════════════════════════════════════════════════════════════
  // REGISTER DEFENSE TEAM
  // ═══════════════════════════════════════════════════════════════

  const registerDefense = async () => {
    const defIds = [...defTeam1, ...defTeam2].filter(Boolean);
    if (defIds.length < 6) { setRegisterMsg('Il faut 6 unites en defense !'); return; }
    if (!displayName.trim()) { setRegisterMsg('Choisis un nom !'); return; }

    setRegisterMsg('Enregistrement...');
    const teamData = defIds.map(id => buildChibiEntity(id)).filter(Boolean);
    if (teamData.length < 6) { setRegisterMsg('Erreur: unites invalides'); return; }

    const powerScore = computePowerScore(defIds);
    const deviceId = getDeviceId();

    try {
      const resp = await fetch('/api/pvp?action=register-defense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, displayName: displayName.trim(), teamData, powerScore }),
      });
      const json = await resp.json();
      if (json.success) {
        setPvpData(prev => ({ ...prev, displayName: displayName.trim(), defenseTeam: defIds }));
        setRegisterMsg('Equipe defensive enregistree !');
        setTimeout(() => setRegisterMsg(''), 3000);
      } else {
        setRegisterMsg('Erreur: ' + (json.error || 'inconnue'));
      }
    } catch (err) {
      setRegisterMsg('Erreur reseau: ' + err.message);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // MATCHMAKING
  // ═══════════════════════════════════════════════════════════════

  const findOpponents = async () => {
    setLoadingOpponents(true);
    const atkIds = [...team1, ...team2].filter(Boolean);
    const powerScore = computePowerScore(atkIds);
    const deviceId = getDeviceId();

    try {
      const resp = await fetch(`/api/pvp?action=find-opponents&deviceId=${encodeURIComponent(deviceId)}&powerScore=${powerScore}`);
      const json = await resp.json();
      if (json.success) {
        setOpponents(json.opponents || []);
        if (json.dailyRemaining !== undefined) setDailyRemaining(json.dailyRemaining);
      }
    } catch (err) {
      console.warn('PVP find error:', err);
    }
    setLoadingOpponents(false);
  };

  const startMatchmaking = () => {
    const atkIds = [...team1, ...team2].filter(Boolean);
    if (atkIds.length < 6) return;
    if (!pvpData.defenseTeam || pvpData.defenseTeam.length < 6) return;
    setPvpData(prev => ({ ...prev, attackTeam: atkIds }));
    setPhase('matchmaking');
    findOpponents();
  };

  // ═══════════════════════════════════════════════════════════════
  // BATTLE — 6v6 Combat Engine
  // ═══════════════════════════════════════════════════════════════

  const addVfx = (type, data) => {
    const id = ++vfxIdRef.current;
    setVfxEvents(prev => [...prev.slice(-20), { id, type, timestamp: Date.now(), ...data }]);
  };

  const startBattle = (opponent) => {
    if (dailyRemaining <= 0) return;
    setSelectedOpponent(opponent);
    setArenaBg(PVP_ARENAS[Math.floor(Math.random() * PVP_ARENAS.length)]);

    const atkIds = [...team1, ...team2].filter(Boolean);
    const attackers = atkIds.map(id => buildChibiEntity(id)).filter(Boolean);
    if (attackers.length === 0) return;

    // Apply PVP stat multipliers (HP x3, DEF x1.6, RES x1.4)
    attackers.forEach(applyPvpStats);
    applyTeamPassives(attackers);

    const defenders = (opponent.teamData || []).map(d => ({
      ...d,
      hp: d.maxHp || d.hp,
      buffs: [],
      passiveState: { flammeStacks: 0, martyrHealed: false, echoCounter: 0, sianStacks: 0 },
      lastAttackAt: 0,
      attackInterval: spdToInterval(d.spd),
      alive: true,
      skills: (d.skills || []).map(s => ({ ...s, cd: 0 })),
    }));
    // Apply PVP stat multipliers to defenders too
    defenders.forEach(applyPvpStats);
    applyTeamPassives(defenders);

    const state = { attackers, defenders };
    setBattleState(state);
    battleRef.current = state;
    setCombatLog([{ text: `PVP: ${displayName || 'Toi'} vs ${opponent.displayName} !`, time: 0, type: 'system' }]);
    setVfxEvents([]);
    dpsTracker.current = {};
    attackers.forEach(c => { dpsTracker.current[c.id] = 0; });
    startTimeRef.current = Date.now();
    timerRef.current = PVP_DURATION_SEC;
    setTimer(PVP_DURATION_SEC);
    setPhase('battle');
  };

  function applyTeamPassives(units) {
    units.forEach(c => {
      const martyrAura = c.passives?.find(p => p.type === 'martyrAura');
      if (martyrAura) {
        c.atk = Math.floor(c.atk * (1 + (martyrAura.selfAtkMult || -0.30)));
        units.forEach(ally => { if (ally.id !== c.id) ally.atk = Math.floor(ally.atk * (1 + (martyrAura.allyAtkBonus || 0.15))); });
      }
      const cmdDef = c.passives?.find(p => p.type === 'commanderDef');
      if (cmdDef) units.forEach(ally => { ally.def = Math.floor(ally.def * 1.10); });
    });
    units.forEach(c => {
      const cmdCrit = c.passives?.find(p => p.type === 'commanderCrit');
      if (cmdCrit) units.forEach(ally => { ally.buffs.push({ stat: 'crit', value: 20, turns: 30 }); });
    });
    units.forEach(c => {
      if (c.hunterPassive?.type === 'teamDef') {
        const val = c.hunterPassive.value || 0;
        units.forEach(ally => { ally.def = Math.floor(ally.def * (1 + val / 100)); });
      }
      if (c.hunterPassive?.type === 'firstTurn' && c.hunterPassive.stats?.spd) {
        c.buffs.push({ stat: 'spd', value: c.hunterPassive.stats.spd / 100, turns: 1 });
      }
    });
  }

  // ─── Game tick ────────────────────────────────────────────────
  const gameTick = useCallback(() => {
    const state = battleRef.current;
    if (!state) return;

    const now = Date.now();
    const elapsed = (now - startTimeRef.current) / 1000;
    const remaining = Math.max(0, PVP_DURATION_SEC - elapsed);
    timerRef.current = remaining;

    let logEntries = [];
    let stateChanged = false;

    const aliveAtk = state.attackers.filter(c => c.alive);
    const aliveDef = state.defenders.filter(c => c.alive);

    // ─── End conditions ──────────────────────────────────
    if (remaining <= 0 || aliveAtk.length === 0 || aliveDef.length === 0) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;

      let attackerWon;
      if (aliveAtk.length === 0 && aliveDef.length === 0) {
        attackerWon = false;
      } else if (aliveAtk.length === 0) {
        attackerWon = false;
      } else if (aliveDef.length === 0) {
        attackerWon = true;
      } else {
        const atkHpPct = aliveAtk.reduce((s, c) => s + c.hp / c.maxHp, 0) / state.attackers.length;
        const defHpPct = aliveDef.reduce((s, c) => s + c.hp / c.maxHp, 0) / state.defenders.length;
        attackerWon = atkHpPct > defHpPct;
      }

      const totalDmg = Object.values(dpsTracker.current).reduce((s, v) => s + v, 0);
      const dpsBreakdown = state.attackers.map(c => ({
        id: c.id, name: c.name, sprite: c.sprite, element: c.element,
        damage: dpsTracker.current[c.id] || 0,
        percent: totalDmg > 0 ? ((dpsTracker.current[c.id] || 0) / totalDmg * 100) : 0,
        alive: c.alive,
      })).sort((a, b) => b.damage - a.damage);

      const deviceId = getDeviceId();
      fetch('/api/pvp?action=report-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          defenderId: selectedOpponent?.deviceId,
          attackerWon,
          attackerAliveCount: aliveAtk.length,
          duration: Math.floor(elapsed),
        }),
      }).then(r => r.json()).then(json => {
        if (json.success) {
          setResultData(prev => prev ? { ...prev, newRating: json.newRating, ratingChange: json.ratingChange, capped: json.capped } : prev);
          setPvpData(prev => ({
            ...prev,
            pvpStats: {
              ...prev.pvpStats,
              wins: prev.pvpStats.wins + (attackerWon ? 1 : 0),
              losses: prev.pvpStats.losses + (attackerWon ? 0 : 1),
              rating: json.newRating,
              bestRating: Math.max(prev.pvpStats.bestRating || 1000, json.newRating),
            },
            lastMatchAt: Date.now(),
          }));
        }
      }).catch(() => {});

      setResultData({
        attackerWon,
        aliveCount: { atk: aliveAtk.length, def: aliveDef.length },
        duration: Math.floor(elapsed),
        dpsBreakdown,
        totalDamage: totalDmg,
        opponentName: selectedOpponent?.displayName || '???',
        newRating: null,
        ratingChange: null,
        capped: false,
      });
      setPhase('result');
      return;
    }

    // ─── Process unit attacks for one team ────────────────
    const processUnit = (unit, enemies, allies, isAttacker) => {
      if (!unit.alive) return;
      if (now - unit.lastAttackAt < unit.attackInterval) return;

      // Mana regen
      if (unit.maxMana > 0) {
        unit.mana = Math.min(unit.maxMana, (unit.mana || 0) + (unit.manaRegen || 0) * (unit.attackInterval / 3000));
      }

      // Echo Temporel: free mana every 3 attacks
      const echoFree = unit.passives?.find(p => p.type === 'echoFreeMana');
      if (echoFree) {
        unit.passiveState.echoCounter = (unit.passiveState.echoCounter || 0) + 1;
        if (unit.passiveState.echoCounter >= 3) {
          unit.passiveState.echoCounter = 0;
          unit.passiveState.echoFreeMana = true;
        }
      }

      // Support healing
      if (unit.class === 'support') {
        const aliveAllies = allies.filter(a => a.alive && a.id !== unit.id && a.hp < a.maxHp);
        const lowest = aliveAllies.sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0];
        if (lowest && (lowest.hp / lowest.maxHp) < 0.75) {
          const healBonus = unit.talentBonuses?.healBonus || 0;
          const healAmt = Math.floor(lowest.maxHp * 0.15 * (1 + healBonus / 100));
          lowest.hp = Math.min(lowest.maxHp, lowest.hp + healAmt);
          unit.lastAttackAt = now;
          logEntries.push({ text: `${unit.name} soigne ${lowest.name} +${healAmt}`, time: elapsed, type: 'heal' });
          addVfx('heal', { targetId: lowest.id });
          stateChanged = true;
          return;
        }
      }

      // Pick target (random for V1)
      const aliveEnemies = enemies.filter(e => e.alive);
      if (aliveEnemies.length === 0) return;
      const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];

      // Pick skill (AI)
      const availSkills = unit.skills.filter(s => {
        if ((s.cd || 0) > 0) return false;
        const cost = unit.passiveState?.echoFreeMana ? 0 : (s.manaCost || 0);
        return (unit.mana || 999) >= cost;
      });
      const entityForAI = { ...unit, skills: availSkills.length > 0 ? availSkills.map(s => ({ ...s, cd: 0 })) : [{ ...unit.skills[0], cd: 0 }] };
      const skill = aiPickSkill(entityForAI);

      // Consume mana
      if (unit.maxMana > 0 && skill.manaCost > 0) {
        const actualCost = unit.passiveState?.echoFreeMana ? 0 : skill.manaCost;
        unit.mana = Math.max(0, (unit.mana || 0) - actualCost);
        if (unit.passiveState?.echoFreeMana) unit.passiveState.echoFreeMana = false;
      }

      // Conditional hunter passives
      const hp = unit.hunterPassive;
      if (hp?.type === 'lowHp' && (unit.hp / unit.maxHp * 100) < hp.threshold && hp.stats) {
        if (hp.stats.def) unit.def = Math.floor(unit.def * (1 + hp.stats.def / 100));
      }
      if (hp?.type === 'stacking') {
        unit.passiveState.sianStacks = Math.min((hp.maxStacks || 5), (unit.passiveState.sianStacks || 0) + 1);
        unit.atk = Math.floor(unit.atk * (1 + (unit.passiveState.sianStacks * (hp.perStack?.atk || 0)) / 100));
      }

      let result = computeAttack(unit, skill, target, unit.talentBonuses || {});

      // Apply PVP damage reduction (heals unaffected)
      if (result.damage > 0) {
        result = { ...result, damage: Math.max(1, Math.floor(result.damage * PVP_DAMAGE_MULT)) };
      }

      // Passive: Desperate Fury
      const furyPassive = unit.passives?.find(p => p.type === 'desperateFury');
      if (furyPassive && result.damage > 0) {
        const missingPct = 1 - unit.hp / unit.maxHp;
        result = { ...result, damage: Math.floor(result.damage * (1 + missingPct * 0.8)) };
      }

      // Passive: Last Stand
      const lastStand = unit.passives?.find(p => p.type === 'lastStand');
      if (lastStand && (unit.hp / unit.maxHp) < 0.25 && result.damage > 0) {
        result = { ...result, damage: Math.floor(result.damage * 1.5), isCrit: true };
      }

      // Passive: Inner Flame stacking
      const flammeStack = unit.passives?.find(p => p.type === 'innerFlameStack');
      if (flammeStack && result.damage > 0) {
        unit.passiveState.flammeStacks = Math.min(10, (unit.passiveState.flammeStacks || 0) + 1);
        result = { ...result, damage: Math.floor(result.damage * (1 + unit.passiveState.flammeStacks * 0.03)) };
      }
      const flammeRelease = unit.passives?.find(p => p.type === 'innerFlameRelease');
      if (flammeRelease && (unit.passiveState.flammeStacks || 0) >= 10 && result.damage > 0) {
        result = { ...result, damage: Math.floor(result.damage * 1.5), isCrit: true };
        unit.passiveState.flammeStacks = 0;
      }

      // Passive: Dodge (Voile de l'Ombre) — check on target
      const dodgePassive = target.passives?.find(p => p.type === 'dodge');
      if (dodgePassive && Math.random() < (dodgePassive.chance || 0.12) && result.damage > 0) {
        logEntries.push({ text: `${target.name} esquive ${unit.name} !`, time: elapsed, type: 'dodge' });
        const counterPassive = target.passives?.find(p => p.type === 'counter');
        if (counterPassive) {
          const counterSkill = target.skills[0];
          const counterResult = computeAttack(target, counterSkill, unit, target.talentBonuses || {});
          const counterDmg = Math.max(1, Math.floor(counterResult.damage * PVP_DAMAGE_MULT * (counterPassive.powerMult || 0.80)));
          unit.hp -= counterDmg;
          if (unit.hp <= 0) { unit.hp = 0; unit.alive = false; }
          logEntries.push({ text: `${target.name} contre-attaque ! -${counterDmg}`, time: elapsed, type: 'counter' });
          addVfx('hit', { targetId: unit.id, damage: counterDmg });
        }
        unit.lastAttackAt = now;
        unit.skills.forEach(s => {
          if (s === skill && s.cdMax > 0) s.cd = s.cdMaxMs || s.cdMax * unit.attackInterval;
          else if (s.cd > 0) s.cd = Math.max(0, s.cd - unit.attackInterval);
        });
        stateChanged = true;
        return;
      }

      // Apply damage
      if (result.damage > 0) {
        target.hp -= result.damage;

        if (dpsTracker.current[unit.id] !== undefined) {
          dpsTracker.current[unit.id] += result.damage;
        }

        // VFX: attack + hit
        addVfx('attack', { sourceId: unit.id, isAttacker, element: unit.element });
        addVfx('hit', { targetId: target.id, damage: result.damage, isCrit: result.isCrit, element: unit.element });

        // Lifesteal
        if (unit.passives?.find(p => p.type === 'lifesteal') && Math.random() < 0.15) {
          const heal = Math.floor(result.damage * 0.12);
          unit.hp = Math.min(unit.maxHp, unit.hp + heal);
        }

        if (target.hp <= 0) {
          target.hp = 0;
          target.alive = false;
          logEntries.push({ text: `${target.name} est KO !`, time: elapsed, type: 'kill' });
          addVfx('ko', { targetId: target.id });
        }
      }

      if (result.healed > 0) {
        unit.hp = Math.min(unit.maxHp, unit.hp + result.healed);
        addVfx('heal', { targetId: unit.id });
      }

      if (result.buff) unit.buffs.push({ ...result.buff });
      if (result.debuff) target.buffs.push({ ...result.debuff });

      unit.skills.forEach(s => {
        if (s === skill && s.cdMax > 0) {
          s.cd = s.cdMaxMs || s.cdMax * unit.attackInterval;
          if (unit.passives?.find(p => p.type === 'echoCD') && Math.random() < 0.20) {
            s.cd = Math.max(0, s.cd - unit.attackInterval);
          }
        } else if (s.cd > 0) {
          s.cd = Math.max(0, s.cd - unit.attackInterval);
        }
      });

      unit.lastAttackAt = now;
      if (result.damage > 0) {
        logEntries.push({ text: `${unit.name} \u2192 ${target.name} -${result.damage}${result.isCrit ? ' CRIT!' : ''}`, time: elapsed, type: result.isCrit ? 'crit' : 'normal' });
      }
      stateChanged = true;
    };

    state.attackers.forEach(u => processUnit(u, state.defenders, state.attackers, true));
    state.defenders.forEach(u => processUnit(u, state.attackers, state.defenders, false));

    // Buff decay every ~3s
    if (Math.floor(elapsed * 10) % 30 === 0) {
      [...state.attackers, ...state.defenders].forEach(u => {
        u.buffs = u.buffs.filter(b => { b.turns--; return b.turns > 0; });
      });
    }

    if (stateChanged) {
      setBattleState({ ...state });
      if (logEntries.length > 0) {
        setCombatLog(prev => [...prev.slice(-20), ...logEntries]);
      }
    }
    setTimer(remaining);
  }, [selectedOpponent]);

  // Start/stop game loop
  useEffect(() => {
    if (phase === 'battle' && battleRef.current && !gameLoopRef.current) {
      const tickMs = Math.floor(PVP_TICK_MS / speedMultRef.current);
      gameLoopRef.current = setInterval(gameTick, tickMs);
    }
    return () => {
      if (gameLoopRef.current) { clearInterval(gameLoopRef.current); gameLoopRef.current = null; }
    };
  }, [phase, gameTick]);

  // Speed change
  useEffect(() => {
    speedMultRef.current = speedMult;
    if (phase === 'battle' && gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      const tickMs = Math.floor(PVP_TICK_MS / speedMult);
      gameLoopRef.current = setInterval(gameTick, tickMs);
    }
  }, [speedMult, phase, gameTick]);

  // Skip battle
  const skipBattle = () => {
    if (!battleRef.current) return;
    const maxIter = 5000;
    for (let i = 0; i < maxIter; i++) {
      const state = battleRef.current;
      const aliveAtk = state.attackers.filter(c => c.alive).length;
      const aliveDef = state.defenders.filter(c => c.alive).length;
      if (aliveAtk === 0 || aliveDef === 0) break;
      state.attackers.filter(c => c.alive).forEach(u => { u.lastAttackAt = 0; });
      state.defenders.filter(c => c.alive).forEach(u => { u.lastAttackAt = 0; });
      startTimeRef.current = Date.now() - (PVP_DURATION_SEC * 1000 - i * 100);
      gameTick();
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // RANKINGS
  // ═══════════════════════════════════════════════════════════════

  const loadRankings = async () => {
    setLoadingRankings(true);
    try {
      const deviceId = getDeviceId();
      const resp = await fetch(`/api/pvp?action=rankings&deviceId=${encodeURIComponent(deviceId)}&limit=50`);
      const json = await resp.json();
      if (json.success) {
        setRankings(json.rankings || []);
        setRankingsTotal(json.total || 0);
        setPlayerRank(json.playerRank);
      }
    } catch (err) {
      console.warn('Rankings error:', err);
    }
    setLoadingRankings(false);
  };

  // ═══════════════════════════════════════════════════════════════
  // ARENA SPRITE COMPONENT
  // ═══════════════════════════════════════════════════════════════

  const now = Date.now();
  const recentVfx = vfxEvents.filter(v => now - v.timestamp < 600);

  function ArenaSprite({ unit, pos, side }) {
    const hpPct = unit.maxHp > 0 ? unit.hp / unit.maxHp : 0;
    const hpColor = hpPct > 0.5 ? '#22c55e' : hpPct > 0.2 ? '#eab308' : '#ef4444';

    const isAttacking = recentVfx.some(v => v.type === 'attack' && v.sourceId === unit.id && now - v.timestamp < 400);
    const hitEvent = recentVfx.find(v => v.type === 'hit' && v.targetId === unit.id && now - v.timestamp < 500);
    const isHealing = recentVfx.some(v => v.type === 'heal' && v.targetId === unit.id && now - v.timestamp < 500);
    const isKO = recentVfx.some(v => v.type === 'ko' && v.targetId === unit.id);

    const flipStyle = side === 'left' ? 'scaleX(-1)' : '';

    const anim = !unit.alive ? 'arenaKO 0.6s ease-out forwards' :
      isAttacking && side === 'left' ? 'arenaDashRight 0.5s ease-in-out' :
      isAttacking && side === 'right' ? 'arenaDashLeft 0.5s ease-in-out' :
      hitEvent ? 'arenaHitChib 0.35s ease-out' :
      side === 'left' ? 'arenaIdleChib 2.5s ease-in-out infinite' :
      'arenaIdleBoss 2.5s ease-in-out infinite';

    const posStyle = side === 'left'
      ? { left: pos.left, top: pos.top }
      : { right: pos.right, top: pos.top };

    return (
      <div className="absolute flex flex-col items-center pointer-events-none"
        style={{ ...posStyle, zIndex: isAttacking ? 20 : 10 }}>
        <div className="text-[8px] font-bold text-white/80 mb-0.5 whitespace-nowrap drop-shadow-lg"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
          {unit.name}
        </div>
        <div className="relative">
          <img src={unit.sprite} alt={unit.name}
            className="w-10 h-10 object-contain"
            style={{
              animation: anim,
              transform: !isAttacking && !hitEvent && unit.alive ? flipStyle : undefined,
              filter: !unit.alive ? 'grayscale(1) brightness(0.3)' :
                isHealing ? 'brightness(1.4) drop-shadow(0 0 6px rgba(34,197,94,0.7))' :
                (RARITY[unit.rarity]?.glow || ''),
              imageRendering: 'auto',
            }} />
          {/* Heal sparkle */}
          {isHealing && unit.alive && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-green-400 text-sm font-black"
              style={{ animation: 'dmgFloatUp 0.6s ease-out forwards', textShadow: '0 0 6px rgba(34,197,94,0.8)' }}>+</div>
          )}
          {/* Floating damage */}
          {hitEvent && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none"
              style={{
                color: hitEvent.isCrit ? '#fbbf24' : ELEMENT_COLORS_RAW[hitEvent.element] || '#ef4444',
                fontWeight: 900,
                fontSize: hitEvent.isCrit ? '0.85rem' : '0.7rem',
                textShadow: '0 1px 4px rgba(0,0,0,0.9)',
                animation: hitEvent.isCrit ? 'dmgFloatCrit 0.7s ease-out forwards' : 'dmgFloatUp 0.6s ease-out forwards',
              }}>
              -{hitEvent.damage}{hitEvent.isCrit ? '!' : ''}
            </div>
          )}
          {/* Ground shadow */}
          {unit.alive && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1.5 rounded-full bg-black/30"
              style={{ animation: 'arenaShadow 2.5s ease-in-out infinite', filter: 'blur(2px)' }} />
          )}
        </div>
        {/* HP bar */}
        <div className="w-10 h-1 bg-gray-900/80 rounded-full overflow-hidden mt-0.5">
          <div className="h-full rounded-full transition-all duration-200" style={{ width: `${hpPct * 100}%`, backgroundColor: hpColor }} />
        </div>
        {!unit.alive && <div className="text-[7px] text-red-500 font-bold mt-0.5">K.O.</div>}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  const poolArray = useMemo(() => Object.entries(allPool).sort((a, b) => {
    const ra = { mythique: 3, legendaire: 2, rare: 1 };
    return (ra[b[1].rarity] || 0) - (ra[a[1].rarity] || 0);
  }), [allPool]);

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white pb-20 select-none">
      <BattleStyles />

      {/* Header */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <Link to="/shadow-colosseum" className="text-gray-500 text-xs hover:text-white transition-colors">&larr; Colosseum</Link>
          <h1 className="text-xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {'\u2694\uFE0F'} Arene PVP
          </h1>
          <button onClick={() => { setPhase('rankings'); loadRankings(); }}
            className="text-xs text-amber-400 hover:text-amber-300">{'\uD83C\uDFC6'} Rang</button>
        </div>

        {/* Stats bar */}
        <div className="flex justify-center gap-4 text-xs text-gray-400 mb-4">
          <span>Rating: <span className="text-cyan-400 font-bold">{pvpData.pvpStats.rating}</span></span>
          <span>{'\u2705'} {pvpData.pvpStats.wins}W</span>
          <span>{'\u274C'} {pvpData.pvpStats.losses}L</span>
        </div>
      </div>

      {/* ═══ SETUP PHASE ═══ */}
      {phase === 'setup' && (
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex gap-2 mb-4">
            <button onClick={() => setTab('atk')}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'atk' ? 'bg-red-500/30 text-red-400 border border-red-500/40' : 'bg-gray-800/30 text-gray-500 border border-gray-700/20'}`}>
              {'\u2694\uFE0F'} Equipe ATK
            </button>
            <button onClick={() => setTab('def')}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'def' ? 'bg-blue-500/30 text-blue-400 border border-blue-500/40' : 'bg-gray-800/30 text-gray-500 border border-gray-700/20'}`}>
              {'\uD83D\uDEE1\uFE0F'} Equipe DEF
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {[1, 2].map(teamNum => (
              <div key={teamNum} className="space-y-1.5">
                <div className="text-[10px] text-gray-500 text-center font-bold">Equipe {teamNum}</div>
                {[0, 1, 2].map(idx => {
                  const team = teamNum === 1 ? activeTeam1 : activeTeam2;
                  const id = team[idx];
                  const chibi = id ? allPool[id] : null;
                  const isActive = pickSlot?.team === teamNum && pickSlot?.idx === idx;
                  return (
                    <button key={idx} onClick={() => handleSlotClick(teamNum, idx)}
                      className={`w-full p-2 rounded-lg border transition-all flex items-center gap-2 ${
                        isActive ? 'border-yellow-400/60 bg-yellow-500/10' :
                        chibi ? 'border-gray-600/30 bg-gray-800/30 hover:bg-gray-700/30' :
                        'border-dashed border-gray-700/30 bg-gray-900/20 hover:bg-gray-800/20'
                      }`}>
                      {chibi ? (
                        <>
                          <img src={chibi.sprite || SPRITES[id]} alt="" className="w-8 h-8 rounded-full object-cover" />
                          <div className="text-left flex-1 min-w-0">
                            <div className="text-xs font-bold truncate">{chibi.name}</div>
                            <div className="text-[10px] text-gray-500">
                              {ELEMENTS[chibi.element]?.icon} Lv.{(coloData.chibiLevels[id] || { level: 1 }).level}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-gray-600 w-full text-center">+ Slot vide</div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {pickSlot && (
            <div className="mb-4 p-3 rounded-xl bg-gray-800/50 border border-gray-700/30">
              <div className="text-xs text-gray-400 mb-2 font-bold">Choisis une unite :</div>
              <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto">
                {poolArray.filter(([id]) => !selectedIds.includes(id)).map(([id, chibi]) => (
                  <button key={id} onClick={() => handlePickChibi(id)}
                    className="p-1.5 rounded-lg bg-gray-900/50 hover:bg-gray-700/30 transition-all border border-gray-700/20 text-center">
                    <img src={chibi.sprite || SPRITES[id]} alt="" className="w-8 h-8 mx-auto rounded-full object-cover" />
                    <div className="text-[9px] truncate mt-0.5">{chibi.name}</div>
                    <div className={`text-[8px] ${RARITY[chibi.rarity]?.color || 'text-gray-400'}`}>
                      {ELEMENTS[chibi.element]?.icon} Lv.{(coloData.chibiLevels[id] || { level: 1 }).level}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'def' && (
            <div className="mb-4 p-3 rounded-xl bg-blue-900/20 border border-blue-500/20">
              <div className="text-xs text-blue-400 font-bold mb-2">{'\uD83D\uDEE1\uFE0F'} Enregistrer ton equipe defensive</div>
              <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value.slice(0, 20))}
                placeholder="Ton pseudo (max 20)"
                className="w-full mb-2 px-3 py-1.5 rounded-lg bg-gray-900/50 border border-gray-700/30 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500/50" />
              <button onClick={registerDefense}
                disabled={[...defTeam1, ...defTeam2].filter(Boolean).length < 6 || !displayName.trim()}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:from-blue-500 hover:to-cyan-500 transition-all">
                Sauvegarder Defense ({[...defTeam1, ...defTeam2].filter(Boolean).length}/6)
              </button>
              {registerMsg && <div className="text-[10px] text-center mt-1.5 text-cyan-400">{registerMsg}</div>}
            </div>
          )}

          {tab === 'atk' && (
            <button onClick={startMatchmaking}
              disabled={[...team1, ...team2].filter(Boolean).length < 6 || !pvpData.defenseTeam || pvpData.defenseTeam.length < 6}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-black text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:from-red-500 hover:to-orange-500 transition-all shadow-lg shadow-red-900/40">
              {'\u2694\uFE0F'} CHERCHER ADVERSAIRE ({[...team1, ...team2].filter(Boolean).length}/6)
            </button>
          )}
          {tab === 'atk' && (!pvpData.defenseTeam || pvpData.defenseTeam.length < 6) && (
            <div className="text-[10px] text-yellow-400 text-center mt-2">
              {'\u26A0\uFE0F'} Enregistre d'abord ton equipe defensive dans l'onglet DEF
            </div>
          )}
        </div>
      )}

      {/* ═══ MATCHMAKING PHASE ═══ */}
      {phase === 'matchmaking' && (
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-4">
            <div className="text-sm text-gray-400">Choisis ton adversaire</div>
            <div className="text-[10px] text-gray-600">Combats restants: <span className={`font-bold ${dailyRemaining > 5 ? 'text-green-400' : dailyRemaining > 0 ? 'text-yellow-400' : 'text-red-400'}`}>{dailyRemaining}/25</span></div>
          </div>

          {loadingOpponents && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-3xl animate-spin mb-2">{'\u2694\uFE0F'}</div>
              <div className="text-sm">Recherche d'adversaires...</div>
            </div>
          )}

          {!loadingOpponents && opponents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-3xl mb-2">{'\uD83D\uDE14'}</div>
              <div className="text-sm">Aucun adversaire trouve</div>
              <div className="text-xs mt-1">Sois le premier a enregistrer une defense !</div>
            </div>
          )}

          <div className="space-y-2 mb-4">
            {opponents.map((opp, i) => (
              <button key={i} onClick={() => startBattle(opp)}
                disabled={dailyRemaining <= 0}
                className="w-full p-3 rounded-xl bg-gray-800/40 border border-gray-700/30 hover:border-red-500/40 hover:bg-red-900/10 transition-all text-left disabled:opacity-30 disabled:cursor-not-allowed">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-bold text-sm">{opp.displayName}</div>
                  <div className="flex items-center gap-2">
                    {opp.foughtToday > 0 && <span className="text-[9px] text-yellow-400">{opp.foughtToday}/3 combats</span>}
                    <span className="text-xs text-amber-400">Rating {opp.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  {(opp.teamData || []).map((unit, j) => (
                    <img key={j} src={unit.sprite} alt="" className="w-7 h-7 rounded-full object-cover border border-gray-700/30" />
                  ))}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-500">
                  <span>Power: {opp.powerScore}</span>
                  <span>{'\u2705'} {opp.wins}W / {'\u274C'} {opp.losses}L</span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={findOpponents}
              className="flex-1 py-2 rounded-lg bg-gray-800/40 text-gray-400 text-sm hover:bg-gray-700/40 transition-all border border-gray-700/20">
              {'\uD83D\uDD04'} Rafraichir
            </button>
            <button onClick={() => setPhase('setup')}
              className="flex-1 py-2 rounded-lg bg-gray-800/40 text-gray-400 text-sm hover:bg-gray-700/40 transition-all border border-gray-700/20">
              {'\u2190'} Retour
            </button>
          </div>
        </div>
      )}

      {/* ═══ BATTLE PHASE — Raid-style Arena ═══ */}
      {phase === 'battle' && battleState && (
        <div className="max-w-2xl mx-auto px-4">
          {/* Timer + controls */}
          <div className="flex items-center justify-between mb-3">
            <div className={`text-lg font-black font-mono ${timer < 15 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
              {Math.floor(timer / 60)}:{Math.floor(timer % 60).toString().padStart(2, '0')}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-green-400 font-bold">{battleState.attackers.filter(c => c.alive).length}</span>
              <span className="text-[10px] text-gray-500">vs</span>
              <span className="text-[10px] text-red-400 font-bold">{battleState.defenders.filter(c => c.alive).length}</span>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3].map(s => (
                <button key={s} onClick={() => setSpeedMult(s)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                    speedMult === s ? 'bg-amber-500/30 text-amber-300' : 'bg-gray-800/30 text-gray-500 hover:bg-gray-700/30'
                  }`}>x{s}</button>
              ))}
              <button onClick={skipBattle}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all">
                SKIP
              </button>
            </div>
          </div>

          {/* ═══ VISUAL BATTLE ARENA ═══ */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 mb-3"
            style={{
              height: 280,
              backgroundImage: `url(${arenaBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}>
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-black/25 pointer-events-none" />
            {/* Atmospheric particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="absolute w-1 h-1 rounded-full bg-purple-400/20"
                  style={{
                    left: `${10 + i * 16}%`,
                    top: `${20 + (i % 3) * 25}%`,
                    animation: `healSparkle ${3 + i * 0.5}s ease-in-out infinite`,
                    animationDelay: `${i * 0.7}s`,
                  }} />
              ))}
            </div>
            {/* VS indicator */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/8 font-black text-4xl select-none pointer-events-none">
              VS
            </div>
            {/* Center divider line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-purple-500/20 to-transparent pointer-events-none" />

            {/* Attackers (left) */}
            {battleState.attackers.map((unit, i) => (
              <ArenaSprite key={`atk-${unit.id}`} unit={unit} pos={ATK_POSITIONS[i]} side="left" />
            ))}
            {/* Defenders (right) */}
            {battleState.defenders.map((unit, i) => (
              <ArenaSprite key={`def-${unit.id}`} unit={unit} pos={DEF_POSITIONS[i]} side="right" />
            ))}

            {/* Arena label */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] text-gray-600/30 italic select-none pointer-events-none">
              Shadow Colosseum — PVP Arena
            </div>
          </div>

          {/* Team HP summary */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <div className="text-[9px] text-green-400 font-bold text-center mb-1">TON EQUIPE</div>
              <div className="grid grid-cols-3 gap-1">
                {battleState.attackers.map(c => {
                  const hpPct = c.maxHp > 0 ? c.hp / c.maxHp : 0;
                  return (
                    <div key={c.id} className="text-center">
                      <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-200" style={{
                          width: `${hpPct * 100}%`,
                          backgroundColor: !c.alive ? '#374151' : hpPct > 0.5 ? '#22c55e' : hpPct > 0.2 ? '#eab308' : '#ef4444',
                        }} />
                      </div>
                      <div className={`text-[7px] truncate ${!c.alive ? 'text-red-500' : 'text-gray-500'}`}>
                        {c.name.split(' ')[0]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="text-[9px] text-red-400 font-bold text-center mb-1">{selectedOpponent?.displayName || 'ADVERSAIRE'}</div>
              <div className="grid grid-cols-3 gap-1">
                {battleState.defenders.map(c => {
                  const hpPct = c.maxHp > 0 ? c.hp / c.maxHp : 0;
                  return (
                    <div key={c.id} className="text-center">
                      <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-200" style={{
                          width: `${hpPct * 100}%`,
                          backgroundColor: !c.alive ? '#374151' : hpPct > 0.5 ? '#ef4444' : hpPct > 0.2 ? '#eab308' : '#22c55e',
                        }} />
                      </div>
                      <div className={`text-[7px] truncate ${!c.alive ? 'text-red-500' : 'text-gray-500'}`}>
                        {c.name.split(' ')[0]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Combat log */}
          <div className="bg-black/40 rounded-xl p-2 border border-white/5 max-h-24 overflow-y-auto text-[9px] font-mono">
            {combatLog.slice(-8).map((entry, i) => (
              <div key={i} className={`py-0.5 ${
                entry.type === 'crit' ? 'text-yellow-400 font-bold' :
                entry.type === 'heal' ? 'text-green-400' :
                entry.type === 'kill' ? 'text-red-400 font-bold' :
                entry.type === 'dodge' ? 'text-cyan-400' :
                entry.type === 'counter' ? 'text-orange-400' :
                entry.type === 'system' ? 'text-purple-400 font-bold' :
                'text-gray-400'
              }`}>{entry.text}</div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ RESULT PHASE ═══ */}
      {phase === 'result' && resultData && (
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className={`text-5xl font-black mb-2 ${resultData.attackerWon ? 'text-green-400' : 'text-red-400'}`}
            style={{ animation: resultData.attackerWon ? 'victoryPulse 2s ease-in-out infinite' : 'defeatPulse 2s ease-in-out infinite' }}>
            {resultData.attackerWon ? 'VICTOIRE !' : 'DEFAITE'}
          </motion.div>

          <div className="text-sm text-gray-400 mb-1">vs {resultData.opponentName}</div>
          <div className="text-xs text-gray-500 mb-4">
            {resultData.aliveCount.atk}/6 survivants — {resultData.duration}s
          </div>

          {resultData.ratingChange !== null && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-4">
              <div className={`text-2xl font-black ${resultData.ratingChange > 0 ? 'text-green-400' : resultData.ratingChange < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                {resultData.ratingChange > 0 ? '+' : ''}{resultData.ratingChange} Rating
                {resultData.capped && <span className="text-xs text-gray-500 ml-2">(Elo cap)</span>}
              </div>
              <div className="text-sm text-gray-400">
                Nouveau rating: <span className="text-cyan-400 font-bold">{resultData.newRating}</span>
              </div>
            </motion.div>
          )}

          <div className="mb-4 p-3 rounded-xl bg-gray-800/30 border border-gray-700/20">
            <div className="text-xs text-gray-400 font-bold mb-2">DPS Breakdown</div>
            {resultData.dpsBreakdown.map((c, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <img src={c.sprite} alt="" className={`w-6 h-6 rounded-full object-cover ${!c.alive ? 'grayscale opacity-50' : ''}`} />
                <div className="flex-1 text-left">
                  <div className="text-[10px] font-bold">{c.name}</div>
                  <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                      style={{ width: `${c.percent}%` }} />
                  </div>
                </div>
                <div className="text-[10px] text-gray-400 w-16 text-right">{fmt(c.damage)} ({c.percent.toFixed(0)}%)</div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={() => { setPhase('matchmaking'); findOpponents(); }}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold text-sm hover:from-red-500 hover:to-orange-500 transition-all">
              {'\u2694\uFE0F'} Encore !
            </button>
            <button onClick={() => { setPhase('setup'); setBattleState(null); setResultData(null); }}
              className="flex-1 py-2.5 rounded-xl bg-gray-800/40 text-gray-400 text-sm hover:bg-gray-700/40 transition-all border border-gray-700/20">
              {'\u2190'} Menu
            </button>
          </div>
        </div>
      )}

      {/* ═══ RANKINGS PHASE ═══ */}
      {phase === 'rankings' && (
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-4">
            <div className="text-lg font-black text-amber-400">{'\uD83C\uDFC6'} Classement PVP</div>
            {playerRank && <div className="text-xs text-gray-400">Ton rang: <span className="text-cyan-400 font-bold">#{playerRank}</span></div>}
            <div className="text-[10px] text-gray-600">{rankingsTotal} joueurs</div>
          </div>

          {loadingRankings && <div className="text-center py-8 text-gray-500 text-sm animate-pulse">Chargement...</div>}

          <div className="space-y-1 mb-4">
            {rankings.map((r, i) => {
              const isMe = r.deviceId === getDeviceId();
              return (
                <div key={i} className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                  isMe ? 'bg-cyan-900/20 border border-cyan-500/30' : 'bg-gray-800/20 border border-gray-700/10'
                }`}>
                  <div className={`w-7 text-center font-black text-sm ${
                    r.rank === 1 ? 'text-yellow-400' : r.rank === 2 ? 'text-gray-300' : r.rank === 3 ? 'text-amber-600' : 'text-gray-500'
                  }`}>
                    {r.rank <= 3 ? ['\uD83E\uDD47', '\uD83E\uDD48', '\uD83E\uDD49'][r.rank - 1] : `#${r.rank}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">{r.displayName} {isMe && <span className="text-cyan-400">(toi)</span>}</div>
                    <div className="text-[10px] text-gray-500">Power: {r.powerScore}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-amber-400">{r.rating}</div>
                    <div className="text-[9px] text-gray-500">{r.wins}W/{r.losses}L</div>
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={() => setPhase('setup')}
            className="w-full py-2 rounded-lg bg-gray-800/40 text-gray-400 text-sm hover:bg-gray-700/40 transition-all border border-gray-700/20">
            {'\u2190'} Retour
          </button>
        </div>
      )}
    </div>
  );
}
