// src/pages/ShadowColosseum/ShadowColosseum.jsx
// "Le Colisee des Ombres" — Chibi Battle RPG
// Fais combattre tes chibis captures, monte de niveaux, bats des boss !

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import shadowCoinManager from '../../components/ChibiSystem/ShadowCoinManager';
import { TALENT_TREES, computeTalentBonuses, getTreeMaxPoints, getNodeDesc } from './talentTreeData';
import {
  TALENT2_BRANCHES, TALENT2_ROOT, TALENT2_UNLOCK_LEVEL,
  computeTalentBonuses2, getAllTalent2Nodes, getTalent2Connections,
  getBranchPts, getSpentTalent2Pts, canAllocateNode, getTalent2MaxPoints,
  WEAPON_TYPE_NAMES,
} from './talentTree2Data';
import {
  SPRITES, ELEMENTS, RARITY, CHIBIS,
  STAT_PER_POINT, STAT_ORDER, STAT_META, POINTS_PER_LEVEL,
  TIER_NAMES_SKILL, TIER_COSTS, SP_INTERVAL, MAX_LEVEL,
  statsAt, statsAtFull, xpForLevel, getElementMult, getEffStat,
  applySkillUpgrades, getUpgradeDesc, computeAttack, aiPickSkill, mergeTalentBonuses,
  ACCOUNT_XP_FOR_LEVEL, ACCOUNT_BONUS_INTERVAL, ACCOUNT_BONUS_AMOUNT, accountLevelFromXp,
  getBaseMana, BASE_MANA_REGEN, getSkillManaCost,
  getStarScaledStats, getStarRewardMult, getStarDropBonus, getGuaranteedArtifactRarity,
  calculatePowerScore, getDifficultyRating,
} from './colosseumCore';
import { HUNTERS, loadRaidData, saveRaidData, getHunterStars, addHunterOrDuplicate, HUNTER_PASSIVE_EFFECTS } from './raidData';
import { BattleStyles, BattleArena } from './BattleVFX';
import {
  ARTIFACT_SETS, ARTIFACT_SLOTS, SLOT_ORDER, MAIN_STAT_VALUES, SUB_STAT_POOL,
  ALL_ARTIFACT_SETS, RAID_ARTIFACT_SETS,
  WEAPONS, WEAPON_PRICES, FORGE_COSTS, ENHANCE_COST, SELL_RATIO, MAX_ARTIFACT_LEVEL,
  generateArtifact, enhanceArtifact, computeArtifactBonuses, computeWeaponBonuses,
  mergeEquipBonuses, getActiveSetBonuses, getActivePassives, MAX_EVEIL_STARS, STAGE_HUNTER_DROP,
  HAMMERS, HAMMER_ORDER, getRequiredHammer, rollHammerDrop,
  SULFURAS_STACK_PER_TURN, SULFURAS_STACK_MAX,
  MAX_WEAPON_AWAKENING, WEAPON_AWAKENING_PASSIVES, rollWeaponDrop,
  RARITY_SUB_COUNT,
  computeWeaponILevel, computeArtifactILevel, computeEquipILevel,
} from './equipmentData';

// Unified lookup helpers — works for both shadow chibis and hunters
const getChibiData = (id) => CHIBIS[id] || HUNTERS[id] || null;
const getChibiSprite = (id) => SPRITES[id] || (HUNTERS[id] && HUNTERS[id].sprite) || '';

// ─── Stages ──────────────────────────────────────────────────

const STAGES = [
  // Tier 1 — Donjon des Ombres
  { id: 'goblin', name: 'Gobelin des Ombres', tier: 1, element: 'shadow', emoji: '\uD83D\uDC79',
    sprite: SPRITES.shadow_goblin,
    hp: 120, atk: 18, def: 12, spd: 15, crit: 5, res: 0, xp: 25, coins: 40,
    skills: [{ name: 'Griffure', power: 100, cdMax: 0 }, { name: 'Rage', power: 0, cdMax: 3, buffAtk: 40, buffDur: 3 }] },
  { id: 'wolf', name: 'Loup Corrompu', tier: 1, element: 'shadow', emoji: '\uD83D\uDC3A',
    sprite: SPRITES.corrupted_wolf,
    hp: 100, atk: 22, def: 8, spd: 25, crit: 10, res: 0, xp: 30, coins: 50,
    skills: [{ name: 'Morsure', power: 110, cdMax: 0 }, { name: 'Morsure Sauvage', power: 170, cdMax: 3 }] },
  { id: 'golem', name: 'Golem de Pierre', tier: 1, element: 'earth', emoji: '\uD83E\uDEA8',
    sprite: SPRITES.stone_golem,
    hp: 200, atk: 15, def: 30, spd: 8, crit: 3, res: 12, xp: 35, coins: 55,
    skills: [{ name: 'Ecrasement', power: 95, cdMax: 0 }, { name: 'Seisme', power: 155, cdMax: 3 }] },
  { id: 'knight', name: 'Chevalier Dechu', tier: 1, element: 'shadow', emoji: '\u2694\uFE0F', isBoss: true,
    sprite: SPRITES.fallen_knight,
    hp: 320, atk: 28, def: 22, spd: 22, crit: 8, res: 5, xp: 60, coins: 100,
    skills: [{ name: 'Epee Maudite', power: 100, cdMax: 0 }, { name: 'Charge Sombre', power: 170, cdMax: 2 }, { name: 'Frappe Fatale', power: 240, cdMax: 4 }] },
  // Tier 2 — Ruines Ancestrales
  { id: 'spectre', name: 'Spectre Ancestral', tier: 2, element: 'shadow', emoji: '\uD83D\uDC7B',
    sprite: SPRITES.ancestral_spectre,
    hp: 200, atk: 32, def: 15, spd: 30, crit: 12, res: 8, xp: 45, coins: 70,
    skills: [{ name: 'Drain', power: 100, cdMax: 0, healSelf: 15 }, { name: 'Malediction', power: 0, cdMax: 3, debuffDef: 35, debuffDur: 2 }] },
  { id: 'salamandre', name: 'Salamandre', tier: 2, element: 'fire', emoji: '\uD83E\uDD8E',
    sprite: SPRITES.salamandre,
    hp: 250, atk: 35, def: 20, spd: 22, crit: 8, res: 5, xp: 50, coins: 80,
    skills: [{ name: 'Crache-Feu', power: 105, cdMax: 0 }, { name: 'Inferno', power: 185, cdMax: 3 }] },
  { id: 'griffon', name: 'Griffon', tier: 2, element: 'wind', emoji: '\uD83E\uDD85',
    sprite: SPRITES.griffon,
    hp: 220, atk: 30, def: 18, spd: 35, crit: 15, res: 3, xp: 55, coins: 85,
    skills: [{ name: 'Serres', power: 100, cdMax: 0 }, { name: 'Tempete', power: 175, cdMax: 2 }] },
  { id: 'guardian', name: 'Gardien du Portail', tier: 2, element: 'earth', emoji: '\uD83D\uDDFF', isBoss: true,
    sprite: SPRITES.guardian,
    hp: 550, atk: 38, def: 35, spd: 16, crit: 5, res: 15, xp: 100, coins: 180,
    skills: [{ name: 'Poing de Pierre', power: 100, cdMax: 0 }, { name: 'Mur de Roche', power: 0, cdMax: 3, buffDef: 80, buffDur: 3 }, { name: 'Avalanche', power: 200, cdMax: 4 }] },
  // Tier 3 — Les Abysses
  { id: 'chimera', name: 'Chimere des Abysses', tier: 3, element: 'fire', emoji: '\uD83D\uDC09',
    sprite: SPRITES.chimera,
    hp: 380, atk: 45, def: 28, spd: 30, crit: 12, res: 10, xp: 80, coins: 120,
    skills: [{ name: 'Souffle', power: 110, cdMax: 0 }, { name: 'Triple Frappe', power: 200, cdMax: 3 }] },
  { id: 'phoenix', name: 'Phenix Noir', tier: 3, element: 'fire', emoji: '\uD83D\uDD3B',
    sprite: SPRITES.phoenix,
    hp: 320, atk: 50, def: 22, spd: 38, crit: 15, res: 8, xp: 90, coins: 140,
    skills: [{ name: 'Flamme Noire', power: 110, cdMax: 0 }, { name: 'Renaissance', power: 0, cdMax: 4, healSelf: 35 }, { name: 'Explosion Solaire', power: 250, cdMax: 4 }] },
  { id: 'titan', name: 'Titan de Glace', tier: 3, element: 'earth', emoji: '\u2744\uFE0F',
    sprite: SPRITES.titan,
    hp: 650, atk: 38, def: 48, spd: 12, crit: 5, res: 20, xp: 100, coins: 160,
    skills: [{ name: 'Ecrasement Glacial', power: 100, cdMax: 0 }, { name: 'Cuirasse', power: 0, cdMax: 3, buffDef: 100, buffDur: 3 }, { name: 'Avalanche', power: 220, cdMax: 5 }] },
  { id: 'monarch', name: 'Monarque Mineure', tier: 3, element: 'shadow', emoji: '\uD83D\uDC51', isBoss: true,
    sprite: SPRITES.monarch,
    hp: 900, atk: 55, def: 38, spd: 32, crit: 18, res: 12, xp: 180, coins: 300,
    skills: [{ name: 'Ombre Royale', power: 110, cdMax: 0 }, { name: 'Domination', power: 0, cdMax: 3, buffAtk: 60, buffDur: 3 }, { name: 'Jugement Final', power: 280, cdMax: 5 }] },
  // Tier 4 — Citadelle Maudite
  { id: 'wraith', name: 'Wraith', tier: 4, element: 'shadow', emoji: '\uD83D\uDC7B',
    sprite: SPRITES.wraith,
    hp: 600, atk: 65, def: 30, spd: 40, crit: 18, res: 12, xp: 130, coins: 220,
    skills: [{ name: 'Drain Vital', power: 100, cdMax: 0, healSelf: 15 }, { name: 'Hurlement Spectral', power: 200, cdMax: 3, debuffDef: 30, debuffDur: 2 }] },
  { id: 'ifrit', name: 'Ifrit', tier: 4, element: 'fire', emoji: '\uD83D\uDD25',
    sprite: SPRITES.ifrit,
    hp: 550, atk: 75, def: 25, spd: 35, crit: 20, res: 8, xp: 140, coins: 240,
    skills: [{ name: 'Flamme Infernale', power: 115, cdMax: 0 }, { name: 'Nova de Feu', power: 230, cdMax: 3 }] },
  { id: 'wyvern', name: 'Wyverne', tier: 4, element: 'wind', emoji: '\uD83D\uDC32',
    sprite: SPRITES.wyvern,
    hp: 500, atk: 60, def: 28, spd: 50, crit: 22, res: 6, xp: 150, coins: 250,
    skills: [{ name: 'Souffle Tempete', power: 105, cdMax: 0 }, { name: 'Tornade', power: 210, cdMax: 2 }] },
  { id: 'lich_king', name: 'Roi Liche', tier: 4, element: 'earth', emoji: '\uD83D\uDC80', isBoss: true,
    sprite: SPRITES.lich_king,
    hp: 1400, atk: 70, def: 50, spd: 25, crit: 12, res: 20, xp: 250, coins: 450,
    skills: [{ name: 'Frappe Glaciale', power: 100, cdMax: 0 }, { name: 'Armure d\'Os', power: 0, cdMax: 3, buffDef: 90, buffDur: 3 }, { name: 'Apocalypse Noire', power: 280, cdMax: 5 }] },
  // Tier 5 — Throne des Anciens
  { id: 'banshee', name: 'Banshee', tier: 5, element: 'shadow', emoji: '\uD83D\uDE31',
    sprite: SPRITES.banshee,
    hp: 700, atk: 85, def: 32, spd: 45, crit: 22, res: 15, xp: 200, coins: 350,
    skills: [{ name: 'Cri Mortel', power: 110, cdMax: 0 }, { name: 'Lamentation', power: 240, cdMax: 3, debuffDef: 40, debuffDur: 2 }] },
  { id: 'dragon_rouge', name: 'Dragon Rouge', tier: 5, element: 'fire', emoji: '\uD83D\uDC09',
    sprite: SPRITES.dragon_rouge,
    hp: 900, atk: 95, def: 40, spd: 32, crit: 18, res: 12, xp: 220, coins: 380,
    skills: [{ name: 'Crache-Flamme', power: 115, cdMax: 0 }, { name: 'Souffle de Dragon', power: 260, cdMax: 3 }, { name: 'Inferno Total', power: 320, cdMax: 5 }] },
  { id: 'tempestaire', name: 'Tempestaire', tier: 5, element: 'wind', emoji: '\uD83C\uDF2A\uFE0F',
    sprite: SPRITES.tempestaire,
    hp: 650, atk: 80, def: 30, spd: 55, crit: 25, res: 10, xp: 210, coins: 360,
    skills: [{ name: 'Lame de Vent', power: 105, cdMax: 0 }, { name: 'Cyclone', power: 250, cdMax: 3 }] },
  { id: 'colossus', name: 'Colossus', tier: 5, element: 'earth', emoji: '\uD83D\uDDFF', isBoss: true,
    sprite: SPRITES.colossus,
    hp: 2200, atk: 85, def: 65, spd: 18, crit: 8, res: 25, xp: 380, coins: 650,
    skills: [{ name: 'Poing Titanesque', power: 110, cdMax: 0 }, { name: 'Bouclier Ancestral', power: 0, cdMax: 3, buffDef: 100, buffDur: 3 }, { name: 'Seisme Supreme', power: 300, cdMax: 5 }] },
  // Tier 6 — Domaine du Monarque
  { id: 'archdemon', name: 'Archdemon', tier: 6, element: 'shadow', emoji: '\uD83D\uDE08',
    sprite: SPRITES.archdemon,
    hp: 1100, atk: 110, def: 45, spd: 42, crit: 25, res: 18, xp: 300, coins: 500,
    skills: [{ name: 'Griffe Demoniaque', power: 115, cdMax: 0 }, { name: 'Pluie de Tenebres', power: 280, cdMax: 3 }] },
  { id: 'ragnarok', name: 'Ragnarok', tier: 6, element: 'fire', emoji: '\u2604\uFE0F',
    sprite: SPRITES.ragnarok, spriteSize: 'lg',
    hp: 1000, atk: 120, def: 38, spd: 38, crit: 22, res: 12, xp: 320, coins: 550,
    skills: [{ name: 'Extinction', power: 120, cdMax: 0 }, { name: 'Jugement de Feu', power: 300, cdMax: 3 }, { name: 'Apocalypse', power: 380, cdMax: 5 }] },
  { id: 'zephyr', name: 'Zephyr Ultime', tier: 6, element: 'wind', emoji: '\uD83C\uDF2C\uFE0F',
    hp: 850, atk: 100, def: 35, spd: 60, crit: 30, res: 10, xp: 310, coins: 520,
    skills: [{ name: 'Tranchant Celeste', power: 110, cdMax: 0 }, { name: 'Tornade Divine', power: 290, cdMax: 3 }] },
  { id: 'supreme_monarch', name: 'Monarque Supreme', tier: 6, element: 'shadow', emoji: '\uD83D\uDC51', isBoss: true,
    hp: 3500, atk: 115, def: 70, spd: 35, crit: 20, res: 22, xp: 600, coins: 1000,
    skills: [{ name: 'Jugement Royal', power: 120, cdMax: 0 }, { name: 'Domination Absolue', power: 0, cdMax: 3, buffAtk: 80, buffDur: 3 }, { name: 'Aneantissement', power: 400, cdMax: 5 }] },
];

const TIER_NAMES = { 1: 'Donjon des Ombres', 2: 'Ruines Ancestrales', 3: 'Les Abysses', 4: 'Citadelle Maudite', 5: 'Throne des Anciens', 6: 'Domaine du Monarque' };
const TIER_COOLDOWN_MIN = { 1: 15, 2: 30, 3: 60, 4: 60, 5: 90, 6: 120 };

// ═══════════════════════════════════════════════════════════════
// PERSISTENCE
// ═══════════════════════════════════════════════════════════════

const SAVE_KEY = 'shadow_colosseum_data';
const defaultData = () => ({ chibiLevels: {}, statPoints: {}, skillTree: {}, talentTree: {}, talentTree2: {}, respecCount: {}, cooldowns: {}, stagesCleared: {}, stats: { battles: 0, wins: 0 }, artifacts: {}, artifactInventory: [], weapons: {}, weaponCollection: {}, hammers: { marteau_forge: 0, marteau_runique: 0, marteau_celeste: 0 }, accountXp: 0, accountBonuses: { hp: 0, atk: 0, def: 0, spd: 0, crit: 0, res: 0 }, accountAllocations: 0 });
const loadData = () => {
  try {
    const d = { ...defaultData(), ...JSON.parse(localStorage.getItem(SAVE_KEY)) };
    if (!d.artifacts) d.artifacts = {};
    if (!d.artifactInventory) d.artifactInventory = [];
    if (!d.weapons) d.weapons = {};
    // Migration: weaponInventory (string[]) → weaponCollection ({weaponId: awakening})
    if (d.weaponInventory && Array.isArray(d.weaponInventory)) {
      if (!d.weaponCollection || typeof d.weaponCollection !== 'object' || Array.isArray(d.weaponCollection)) d.weaponCollection = {};
      d.weaponInventory.forEach(wId => { if (d.weaponCollection[wId] === undefined) d.weaponCollection[wId] = 0; });
      Object.values(d.weapons).forEach(wId => { if (wId && d.weaponCollection[wId] === undefined) d.weaponCollection[wId] = 0; });
      delete d.weaponInventory;
    }
    if (!d.weaponCollection || typeof d.weaponCollection !== 'object') d.weaponCollection = {};
    // Also ensure equipped weapons are in collection
    Object.values(d.weapons).forEach(wId => { if (wId && d.weaponCollection[wId] === undefined) d.weaponCollection[wId] = 0; });
    if (!d.hammers) d.hammers = { marteau_forge: 0, marteau_runique: 0, marteau_celeste: 0 };
    if (d.accountXp === undefined) d.accountXp = 0;
    if (!d.accountBonuses) d.accountBonuses = { hp: 0, atk: 0, def: 0, spd: 0, crit: 0, res: 0 };
    if (d.accountAllocations === undefined) d.accountAllocations = 0;
    // Migration: stagesCleared array → object { [id]: { maxStars } }
    if (Array.isArray(d.stagesCleared)) {
      const m = {};
      d.stagesCleared.forEach(id => { m[id] = { maxStars: 0 }; });
      d.stagesCleared = m;
    } else if (!d.stagesCleared || typeof d.stagesCleared !== 'object') {
      d.stagesCleared = {};
    }
    return d;
  } catch { return defaultData(); }
};
const saveData = (d) => localStorage.setItem(SAVE_KEY, JSON.stringify(d));

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function ShadowColosseum() {
  const [view, setView] = useState('hub'); // hub, stats, skilltree, talents, battle, result
  const [data, setData] = useState(loadData);
  const [selChibi, setSelChibi] = useState(null);
  const [selStage, setSelStage] = useState(null);
  const [selectedStar, setSelectedStar] = useState(0);
  const [battle, setBattle] = useState(null);
  const [phase, setPhase] = useState('idle');
  const [dmgPopup, setDmgPopup] = useState(null);
  const [result, setResult] = useState(null);
  const [manageTarget, setManageTarget] = useState(null); // chibi ID for stats/skilltree views
  const [activeTree, setActiveTree] = useState('fury'); // talent I tree tab
  const [talentTab, setTalentTab] = useState(1); // 1 = Talent I, 2 = Talent II
  const [chibiRage, setChibiRage] = useState(null); // { id, level, text, anim }
  const [shopEnhTarget, setShopEnhTarget] = useState(null); // index in artifactInventory
  const [shopEnhEquipKey, setShopEnhEquipKey] = useState(null); // "chibiId|slotId"
  const [accountLevelUpPending, setAccountLevelUpPending] = useState(0); // number of pending allocations
  const [showTutorial, setShowTutorial] = useState(false);
  const [coinDisplay, setCoinDisplay] = useState(shadowCoinManager.getBalance());
  const [coinDelta, setCoinDelta] = useState(null); // { amount, key }
  const [collectionVer, setCollectionVer] = useState(0); // bump to re-read collection
  const [autoReplay, setAutoReplay] = useState(false);
  const [weaponReveal, setWeaponReveal] = useState(null); // weapon data for epic reveal
  const [artFilter, setArtFilter] = useState({ set: null, rarity: null, slot: null });
  const [artSelected, setArtSelected] = useState(null); // index in inventory OR "eq:chibiId:slot"
  const [artEquipPicker, setArtEquipPicker] = useState(false);
  const [weaponDetailId, setWeaponDetailId] = useState(null);
  const [artifactSetDetail, setArtifactSetDetail] = useState(null);
  const [rosterSort, setRosterSort] = useState('ilevel'); // 'ilevel' | 'level' | 'name'
  const [rosterFilterElem, setRosterFilterElem] = useState(null); // element id or null
  const [rosterFilterClass, setRosterFilterClass] = useState(null); // class id or null
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [chibisCollapsed, setChibisCollapsed] = useState(false);
  const [huntersCollapsed, setHuntersCollapsed] = useState(false);
  const autoReplayRef = useRef(false);
  const clickCountRef = useRef({});
  const clickTimerRef = useRef({});
  const phaseRef = useRef('idle');

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { saveData(data); }, [data]);
  useEffect(() => { autoReplayRef.current = autoReplay; }, [autoReplay]);
  useEffect(() => {
    document.title = 'Shadow Colosseum - Chibi Battle RPG | BuilderBeru';
    let meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.content = 'Shadow Colosseum - Chibi Battle RPG pour Solo Leveling Arise. Fais combattre tes chibis, monte de niveaux, debloque des competences et bats des boss !';
    }
    window.dispatchEvent(new CustomEvent('beru-react', {
      detail: { message: "Le Colisee des Ombres ! Que le combat commence !", mood: 'excited' },
    }));
  }, []);

  // Subscribe to coin changes for instant reactive updates
  useEffect(() => {
    const unsub = shadowCoinManager.subscribe(({ total, change }) => {
      setCoinDisplay(total);
      if (change !== 0) setCoinDelta({ amount: change, key: Date.now() });
    });
    return unsub;
  }, []);

  // Poll collection for reactive updates (no event system for localStorage)
  const collectionCacheRef = useRef(0);
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const col = JSON.parse(localStorage.getItem('beru_chibi_collection') || '{}');
        const count = Object.keys(col).filter(k => col[k] > 0 && CHIBIS[k]).length;
        if (count !== collectionCacheRef.current) {
          collectionCacheRef.current = count;
          setCollectionVer(v => v + 1);
        }
      } catch {}
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Listen for chibi catches — duplicate = bonus XP
  const [catchToast, setCatchToast] = useState(null);
  useEffect(() => {
    const DUPE_XP = { rare: 30, legendaire: 60, mythique: 120 };
    const handler = (e) => {
      const { id, rarity, isDuplicate, allCollected } = e.detail;
      if (isDuplicate && CHIBIS[id]) {
        const baseXp = DUPE_XP[rarity] || 30;
        const xpBonus = allCollected ? baseXp * 5 : baseXp;
        setData(prev => {
          const cur = prev.chibiLevels[id] || { level: 1, xp: 0 };
          let newXp = cur.xp + xpBonus;
          let newLevel = cur.level;
          let leveled = false;
          while (newLevel < MAX_LEVEL && newXp >= xpForLevel(newLevel)) {
            newXp -= xpForLevel(newLevel);
            newLevel++;
            leveled = true;
          }
          if (newLevel >= MAX_LEVEL) newXp = 0;
          return { ...prev, chibiLevels: { ...prev.chibiLevels, [id]: { level: newLevel, xp: newXp } } };
        });
        setCatchToast({ id, name: CHIBIS[id].name, xp: xpBonus, key: Date.now() });
        setTimeout(() => setCatchToast(null), 3000);
      } else if (!isDuplicate && CHIBIS[id]) {
        setCatchToast({ id, name: CHIBIS[id].name, isNew: true, key: Date.now() });
        setTimeout(() => setCatchToast(null), 3000);
      }
    };
    window.addEventListener('beru-chibi-catch', handler);
    return () => window.removeEventListener('beru-chibi-catch', handler);
  }, []);

  // Collection from mascot system (reactive via collectionVer)
  // eslint-disable-next-line
  const collection = (() => { try { return JSON.parse(localStorage.getItem('beru_chibi_collection') || '{}'); } catch { return {}; } })();
  const ownedIds = Object.keys(collection).filter(k => collection[k] > 0 && CHIBIS[k]);

  // Hunter chibis unlocked via raid
  const raidData = loadRaidData();
  const ownedHunterIds = (raidData.hunterCollection || []).map(e => typeof e === 'string' ? e : e.id).filter(id => HUNTERS[id]);

  const getChibiLevel = (id) => data.chibiLevels[id] || { level: 1, xp: 0 };
  const isCooldown = (id) => data.cooldowns[id] && Date.now() < data.cooldowns[id];
  const cooldownMin = (id) => {
    if (!isCooldown(id)) return 0;
    return Math.ceil((data.cooldowns[id] - Date.now()) / 60000);
  };
  const isStageCleared = (id) => id in data.stagesCleared;
  const getMaxStars = (id) => data.stagesCleared[id]?.maxStars ?? -1;
  const isStageUnlocked = (idx) => idx === 0 || isStageCleared(STAGES[idx - 1].id);

  // ─── Stat Points Logic ─────────────────────────────────────

  const getTotalStatPts = (level) => (level - 1) * POINTS_PER_LEVEL;
  const getSpentStatPts = (id) => {
    const alloc = data.statPoints[id] || {};
    return Object.values(alloc).reduce((s, v) => s + v, 0);
  };
  const getAvailStatPts = (id) => getTotalStatPts(getChibiLevel(id).level) - getSpentStatPts(id);

  const allocateStat = (id, stat, delta) => {
    setData(prev => {
      const alloc = { ...(prev.statPoints[id] || { hp: 0, atk: 0, def: 0, spd: 0, crit: 0, res: 0 }) };
      const newVal = (alloc[stat] || 0) + delta;
      if (newVal < 0) return prev;
      if (delta > 0) {
        const total = getTotalStatPts(getChibiLevel(id).level);
        const spent = Object.values(alloc).reduce((s, v) => s + v, 0);
        if (spent >= total) return prev;
      }
      alloc[stat] = newVal;
      return { ...prev, statPoints: { ...prev.statPoints, [id]: alloc } };
    });
  };

  const resetStats = (id) => {
    setData(prev => ({
      ...prev,
      statPoints: { ...prev.statPoints, [id]: { hp: 0, atk: 0, def: 0, spd: 0, crit: 0, res: 0 } },
    }));
  };

  // ─── Skill Tree Logic ──────────────────────────────────────

  const getTotalSP = (level) => Math.floor(level / SP_INTERVAL);
  const getSpentSP = (id) => {
    const tree = data.skillTree[id] || {};
    let total = 0;
    for (const idx in tree) {
      for (let i = 0; i < tree[idx]; i++) total += TIER_COSTS[i];
    }
    return total;
  };
  const getAvailSP = (id) => getTotalSP(getChibiLevel(id).level) - getSpentSP(id);

  const upgradeSkill = (id, skillIdx) => {
    setData(prev => {
      const tree = { ...(prev.skillTree[id] || { 0: 0, 1: 0, 2: 0 }) };
      const cur = tree[skillIdx] || 0;
      if (cur >= 3) return prev;
      const cost = TIER_COSTS[cur];
      if (getAvailSP(id) < cost) return prev;
      tree[skillIdx] = cur + 1;
      return { ...prev, skillTree: { ...prev.skillTree, [id]: tree } };
    });
  };

  const resetSkillTree = (id) => {
    setData(prev => ({
      ...prev,
      skillTree: { ...prev.skillTree, [id]: { 0: 0, 1: 0, 2: 0 } },
    }));
  };

  // ─── Talent Tree Logic ─────────────────────────────────────

  const getTotalTalentPts = (level) => Math.max(0, level - 9);
  // Talent I spent
  const getSpentTalent1Pts = (id) => {
    const alloc = data.talentTree[id] || {};
    let total = 0;
    for (const treeId of Object.keys(TALENT_TREES)) {
      const tree = alloc[treeId] || {};
      total += Object.values(tree).reduce((s, v) => s + v, 0);
    }
    return total;
  };
  // Total spent (T1 + T2) — shared pool
  const getSpentTalentPts = (id) => getSpentTalent1Pts(id) + getSpentTalent2Pts(data.talentTree2[id]);
  const getAvailTalentPts = (id) => getTotalTalentPts(getChibiLevel(id).level) - getSpentTalentPts(id);
  const getTreePoints = (id, treeId) => {
    const tree = (data.talentTree[id] || {})[treeId] || {};
    return Object.values(tree).reduce((s, v) => s + v, 0);
  };

  // Talent II helpers
  const getChibiTalent2Alloc = (id) => data.talentTree2[id] || {};
  const canAllocT2 = (id, nodeId) => {
    if (getAvailTalentPts(id) <= 0) return false;
    return canAllocateNode(nodeId, getChibiTalent2Alloc(id));
  };
  const allocateTalent2Point = (id, nodeId) => {
    if (!canAllocT2(id, nodeId)) return;
    setData(prev => {
      const alloc = { ...(prev.talentTree2[id] || {}) };
      alloc[nodeId] = (alloc[nodeId] || 0) + 1;
      return { ...prev, talentTree2: { ...prev.talentTree2, [id]: alloc } };
    });
  };

  // Merged bonuses: Talent I + Talent II
  const getChibiTalentBonuses = (id) => {
    const tb1 = computeTalentBonuses(data.talentTree[id]);
    const tb2 = computeTalentBonuses2(data.talentTree2[id]);
    return mergeTalentBonuses(tb1, tb2);
  };

  // Equipment bonus computation for a chibi/hunter
  const getChibiEquipBonuses = (id) => {
    const artBonuses = computeArtifactBonuses(data.artifacts[id]);
    const wId = data.weapons[id];
    const weapBonuses = computeWeaponBonuses(wId, wId ? (data.weaponCollection[wId] || 0) : 0);
    return mergeEquipBonuses(artBonuses, weapBonuses);
  };
  const getChibiEveilStars = (id) => HUNTERS[id] ? getHunterStars(raidData, id) : 0;

  const getChibiILevel = (id) => {
    const c = getChibiData(id);
    if (!c) return 0;
    const { level } = getChibiLevel(id);
    const alloc = data.statPoints[id] || {};
    const tb = getChibiTalentBonuses(id);
    const eqB = getChibiEquipBonuses(id);
    const evStars = getChibiEveilStars(id);
    const s = statsAtFull(c.base, c.growth, level, alloc, tb, eqB, evStars, data.accountBonuses);
    const statScore = Math.floor(s.hp * 0.3 + s.atk * 5 + s.def * 2 + s.spd * 2 + s.crit * 4 + s.res * 2);
    const skillScore = (c.skills || []).reduce((sum, sk) => sum + (sk.power || 0) * 0.3, 0);
    const wId = data.weapons[id];
    const eq = computeEquipILevel(data.artifacts[id], wId, wId ? (data.weaponCollection[wId] || 0) : 0);
    return Math.floor(statScore + skillScore + eq.total * 0.5);
  };

  const canRankUpNode = (id, treeId, nodeId) => {
    if (getAvailTalentPts(id) <= 0) return false;
    const tree = TALENT_TREES[treeId];
    if (!tree) return false;
    const treePts = getTreePoints(id, treeId);
    const alloc = (data.talentTree[id] || {})[treeId] || {};
    for (const row of tree.rows) {
      const node = row.nodes.find(n => n.id === nodeId);
      if (node) {
        if (treePts < row.requiredPoints) return false;
        return (alloc[nodeId] || 0) < node.maxRank;
      }
    }
    return false;
  };

  const allocateTalentPoint = (id, treeId, nodeId) => {
    if (!canRankUpNode(id, treeId, nodeId)) return;
    setData(prev => {
      const chibiAlloc = { ...(prev.talentTree[id] || {}) };
      const treeAlloc = { ...(chibiAlloc[treeId] || {}) };
      treeAlloc[nodeId] = (treeAlloc[nodeId] || 0) + 1;
      chibiAlloc[treeId] = treeAlloc;
      return { ...prev, talentTree: { ...prev.talentTree, [id]: chibiAlloc } };
    });
  };

  const resetTalents = (id) => {
    const respecN = data.respecCount[id] || 0;
    const cost = respecN === 0 ? 0 : 100 * Math.pow(2, respecN - 1);
    const coins = shadowCoinManager.getBalance();
    if (cost > 0 && coins < cost) return false;
    if (cost > 0) shadowCoinManager.spendCoins(cost);
    setData(prev => ({
      ...prev,
      talentTree: { ...prev.talentTree, [id]: {} },
      talentTree2: { ...prev.talentTree2, [id]: {} },
      respecCount: { ...prev.respecCount, [id]: respecN + 1 },
    }));
    return true;
  };
  const getRespecCost = (id) => {
    const n = data.respecCount[id] || 0;
    return n === 0 ? 0 : 100 * Math.pow(2, n - 1);
  };

  // ─── Start Battle ──────────────────────────────────────────

  const startBattle = () => {
    if (!selChibi || selStage === null || isCooldown(selChibi)) return;
    const chibi = getChibiData(selChibi);
    if (!chibi) return;
    const stage = STAGES[selStage];
    const { level } = getChibiLevel(selChibi);
    const alloc = data.statPoints[selChibi] || {};
    const tb = getChibiTalentBonuses(selChibi);
    const eqB = getChibiEquipBonuses(selChibi);
    const evStars = getChibiEveilStars(selChibi);
    const s = statsAtFull(chibi.base, chibi.growth, level, alloc, tb, eqB, evStars, data.accountBonuses);
    const tree = data.skillTree[selChibi] || {};

    // Hunter innate passive
    const hunterPassive = HUNTERS[selChibi] ? (HUNTER_PASSIVE_EFFECTS[selChibi] || null) : null;

    // Apply permanent hunter passive stat bonuses
    if (hunterPassive?.type === 'permanent' && hunterPassive.stats) {
      if (hunterPassive.stats.hp)  s.hp  = Math.floor(s.hp  * (1 + hunterPassive.stats.hp / 100));
      if (hunterPassive.stats.atk) s.atk = Math.floor(s.atk * (1 + hunterPassive.stats.atk / 100));
      if (hunterPassive.stats.def) s.def = Math.floor(s.def * (1 + hunterPassive.stats.def / 100));
      if (hunterPassive.stats.spd) s.spd = Math.floor(s.spd * (1 + hunterPassive.stats.spd / 100));
      if (hunterPassive.stats.crit) s.crit = +(s.crit + hunterPassive.stats.crit).toFixed(1);
      if (hunterPassive.stats.res)  s.res  = +(s.res + hunterPassive.stats.res).toFixed(1);
    }

    // Apply cooldown reduction from talents
    const cdReduction = Math.floor(tb.cooldownReduction || 0);

    const passives = getActivePassives(data.artifacts[selChibi]);
    const costReduce = s.manaCostReduce || 0;

    // Build talentBonuses with hunter passive injections
    const mergedTb = (() => {
      const m = { ...tb };
      for (const [k, v] of Object.entries(eqB)) { if (v) m[k] = (m[k] || 0) + v; }
      if (hunterPassive) {
        if (hunterPassive.type === 'healBonus')   m.healBonus = (m.healBonus || 0) + hunterPassive.value;
        if (hunterPassive.type === 'critDmg')     m.critDamage = (m.critDamage || 0) + hunterPassive.value;
        if (hunterPassive.type === 'magicDmg')    m.allDamage = (m.allDamage || 0) + hunterPassive.value;
        if (hunterPassive.type === 'vsBoss')      m.bossDamage = (m.bossDamage || 0) + (hunterPassive.stats?.atk || 0);
        if (hunterPassive.type === 'debuffBonus') m.debuffBonus = (m.debuffBonus || 0) + hunterPassive.value;
      }
      return m;
    })();

    const initBuffs = [];
    if (hunterPassive?.type === 'firstTurn' && hunterPassive.stats?.spd) {
      initBuffs.push({ stat: 'spd', value: hunterPassive.stats.spd / 100, turns: 1 });
    }

    // Get weapon type for Talent II weapon-type bonuses
    const playerWeaponId = data.weapons[selChibi];
    const playerWeaponType = playerWeaponId && WEAPONS[playerWeaponId] ? WEAPONS[playerWeaponId].weaponType : null;

    setBattle({
      player: {
        id: selChibi, name: chibi.name, level, element: chibi.element,
        weaponType: playerWeaponType,
        hp: s.hp, maxHp: s.hp, atk: s.atk, def: s.def, spd: s.spd,
        crit: Math.min(80, s.crit), res: Math.min(70, s.res),
        mana: s.mana, maxMana: s.mana, manaRegen: s.manaRegen,
        skills: chibi.skills.map((sk, i) => {
          const upgraded = applySkillUpgrades(sk, tree[i] || 0);
          const baseCost = getSkillManaCost(upgraded);
          const finalCost = Math.max(0, Math.floor(baseCost * (1 - costReduce / 100)));
          return { ...upgraded, cdMax: Math.max(0, upgraded.cdMax - cdReduction), cd: 0, manaCost: finalCost };
        }),
        buffs: initBuffs,
      },
      enemy: (() => {
        const sc = getStarScaledStats(stage, selectedStar);
        return {
          id: stage.id, name: stage.name, element: stage.element, isBoss: !!stage.isBoss,
          hp: sc.hp, maxHp: sc.hp, atk: sc.atk, def: sc.def, spd: sc.spd,
          crit: sc.crit, res: sc.res,
          skills: stage.skills.map(sk => ({ ...sk, cd: 0 })),
          buffs: [],
          mana: 999, maxMana: 999, manaRegen: 0,
        };
      })(),
      starLevel: selectedStar,
      hunterPassive,
      talentBonuses: mergedTb,
      passives,
      passiveState: { flammeStacks: 0, martyrHealed: false, echoTurnCounter: 0, echoFreeMana: false, sianStacks: 0 },
      immortelUsed: false,
      colossusUsed: false,
      sulfurasStacks: (() => {
        const wId = data.weapons[selChibi];
        return wId && WEAPONS[wId]?.passive === 'sulfuras_fury' ? 0 : undefined;
      })(),
      turn: 1, log: [],
    });
    setPhase('idle');
    setDmgPopup(null);
    setResult(null);
    setView('battle');
  };

  // ─── Execute Round ─────────────────────────────────────────

  const executeRound = useCallback((skillIdx) => {
    if (phaseRef.current !== 'idle' || !battle) return;
    const player = JSON.parse(JSON.stringify(battle.player));
    const enemy = JSON.parse(JSON.stringify(battle.enemy));
    const tb = battle.talentBonuses || {};
    const passives = battle.passives || [];
    const ps = { ...(battle.passiveState || {}) };
    let immortelUsed = battle.immortelUsed || false;
    let colossusUsed = battle.colossusUsed || false;
    const log = [...battle.log];
    const playerSkill = player.skills[skillIdx];

    // Check mana
    const manaCost = ps.echoFreeMana ? 0 : (playerSkill.manaCost || 0);
    if (player.mana < manaCost) {
      log.push({ text: `Pas assez de mana ! (${player.mana}/${manaCost})`, type: 'info', id: Date.now() });
      setBattle(prev => ({ ...prev, log: log.slice(-10) }));
      return;
    }
    if (ps.echoFreeMana) ps.echoFreeMana = false;

    // Consume mana
    player.mana = Math.max(0, player.mana - manaCost);

    // ─── PASSIVE: beforeAttack ─────────────────
    let atkMult = 1;
    let forceCrit = false;
    let bonusCritDmg = 0;
    let bonusDefIgnore = 0;
    passives.forEach(p => {
      if (p.trigger !== 'beforeAttack') return;
      if (p.type === 'desperateFury') {
        const missingPct = 1 - (player.hp / player.maxHp);
        atkMult += missingPct * p.dmgPerMissingPct * 100;
      }
      if (p.type === 'lastStand' && (player.hp / player.maxHp) < p.hpThreshold) {
        forceCrit = p.autoCrit;
        bonusDefIgnore += p.defIgnore;
      }
      if (p.type === 'innerFlameRelease' && ps.flammeStacks >= p.stackThreshold) {
        forceCrit = p.autoCrit;
        bonusCritDmg += p.bonusCritDmg;
        ps.flammeStacks = 0;
        log.push({ text: `Flamme Interieure explose ! Crit garanti !`, type: 'info', id: Date.now() - 0.2 });
      }
    });

    // Sulfuras stacking passive: +33% dmg per turn, max +100%
    if (battle.sulfurasStacks !== undefined) {
      atkMult += battle.sulfurasStacks / 100;
    }

    // Temporarily modify player for this attack
    const savedAtk = player.atk;
    const savedCrit = player.crit;
    player.atk = Math.floor(player.atk * atkMult);
    if (forceCrit) player.crit = 100;
    const tbForAttack = { ...tb };
    tbForAttack.critDamage = (tbForAttack.critDamage || 0) + bonusCritDmg * 100;
    tbForAttack.defPen = (tbForAttack.defPen || 0) + bonusDefIgnore * 100;

    // Apply conditional hunter passives
    const hp = battle.hunterPassive;
    const savedDef = player.def;
    if (hp) {
      const hpPct = player.hp / player.maxHp * 100;
      if (hp.type === 'lowHp' && hpPct < hp.threshold && hp.stats) {
        if (hp.stats.def) player.def = Math.floor(player.def * (1 + hp.stats.def / 100));
        if (hp.stats.atk) player.atk = Math.floor(player.atk * (1 + hp.stats.atk / 100));
      }
      if (hp.type === 'highHp' && hpPct > hp.threshold && hp.stats) {
        if (hp.stats.atk) player.atk = Math.floor(player.atk * (1 + hp.stats.atk / 100));
        if (hp.stats.crit) player.crit = +(player.crit + hp.stats.crit).toFixed(1);
      }
      if (hp.type === 'stacking') {
        ps.sianStacks = Math.min(hp.maxStacks || 10, (ps.sianStacks || 0) + 1);
        const stackBonus = (hp.perStack?.atk || 0) * ps.sianStacks;
        player.atk = Math.floor(player.atk * (1 + stackBonus / 100));
      }
      if (hp.type === 'vsLowHp' && (enemy.hp / enemy.maxHp * 100) < hp.threshold && hp.stats?.crit) {
        player.crit = +(player.crit + hp.stats.crit).toFixed(1);
      }
      if (hp.type === 'vsDebuffed' && enemy.buffs?.some(b => b.value < 0) && hp.stats?.atk) {
        player.atk = Math.floor(player.atk * (1 + hp.stats.atk / 100));
      }
      if (hp.type === 'skillCd' && (playerSkill.cdMax || 0) >= (hp.minCd || 3) && hp.stats?.crit) {
        player.crit = +(player.crit + hp.stats.crit).toFixed(1);
      }
    }

    setPhase('player_atk');
    let pRes = computeAttack(player, playerSkill, enemy, tbForAttack);
    player.atk = savedAtk;
    player.crit = savedCrit;
    player.def = savedDef;

    // Hunter passive: defIgnore (Minnie) — extra DMG on crits
    if (hp?.type === 'defIgnore' && pRes.isCrit && pRes.damage > 0) {
      pRes = { ...pRes, damage: Math.floor(pRes.damage * (1 + (hp.value || 10) / 100)) };
    }

    enemy.hp = Math.max(0, enemy.hp - pRes.damage);
    if (pRes.healed) player.hp = Math.min(player.maxHp, player.hp + pRes.healed);
    if (pRes.buff) player.buffs.push({ ...pRes.buff });
    if (pRes.debuff) enemy.buffs.push({ ...pRes.debuff });
    playerSkill.cd = playerSkill.cdMax;
    log.push({ text: pRes.text, type: 'player', id: Date.now() });

    // ─── PASSIVE: afterAttack ─────────────────
    passives.forEach(p => {
      if (p.trigger !== 'afterAttack') return;
      if (p.type === 'lifesteal' && pRes.damage > 0 && Math.random() < p.chance) {
        const stolen = Math.floor(pRes.damage * p.stealPct);
        player.hp = Math.min(player.maxHp, player.hp + stolen);
        log.push({ text: `Vol de vie ! +${stolen} PV`, type: 'info', id: Date.now() + 0.05 });
      }
      if (p.type === 'echoCD' && Math.random() < p.chance) {
        const cdSkills = player.skills.filter(s => s.cd > 0);
        if (cdSkills.length > 0) {
          cdSkills[Math.floor(Math.random() * cdSkills.length)].cd--;
          log.push({ text: `Echo Temporel ! -1 CD`, type: 'info', id: Date.now() + 0.06 });
        }
      }
      if (p.type === 'innerFlameStack') {
        ps.flammeStacks = Math.min(p.maxStacks, (ps.flammeStacks || 0) + 1);
      }
    });

    // Regen per turn (after player action)
    if (tb.regenPerTurn > 0) {
      const regen = Math.floor(player.maxHp * tb.regenPerTurn / 100);
      if (regen > 0 && player.hp < player.maxHp) {
        player.hp = Math.min(player.maxHp, player.hp + regen);
        log.push({ text: `${player.name} regenere +${regen} PV`, type: 'info', id: Date.now() + 0.1 });
      }
    }

    // Mana regen
    player.mana = Math.min(player.maxMana, player.mana + (player.manaRegen || 0));

    setDmgPopup(pRes.damage > 0 ? { target: 'enemy', value: pRes.damage, isCrit: pRes.isCrit } : null);
    setBattle(prev => ({ ...prev, player: { ...player }, enemy: { ...enemy }, passiveState: ps, log: log.slice(-10) }));

    if (enemy.hp <= 0) {
      setTimeout(() => handleVictory(), 1200);
      return;
    }

    setTimeout(() => {
      setPhase('enemy_atk');
      const eSkill = aiPickSkill(enemy);
      const eRes = computeAttack(enemy, eSkill, player);

      let dmgToPlayer = eRes.damage;

      // ─── PASSIVE: onHit (dodge) ──────────────
      let dodged = false;
      passives.forEach(p => {
        if (p.trigger === 'onHit' && p.type === 'dodge' && Math.random() < p.chance) {
          dodged = true;
          log.push({ text: `${player.name} esquive l'attaque !`, type: 'info', id: Date.now() + 0.9 });
        }
      });

      if (dodged) {
        dmgToPlayer = 0;
        // ─── PASSIVE: onDodge (counter) ────────
        passives.forEach(p => {
          if (p.trigger === 'onDodge' && p.type === 'counter') {
            const counterDmg = Math.max(1, Math.floor(getEffStat(player.atk, player.buffs, 'atk') * p.powerMult));
            enemy.hp = Math.max(0, enemy.hp - counterDmg);
            log.push({ text: `Contre-attaque ! -${counterDmg} PV`, type: 'player', id: Date.now() + 0.95 });
          }
        });
      } else {
        // Flamme Interieure: reset stacks when hit
        if (ps.flammeStacks > 0) {
          const hadFlameReset = passives.some(p => p.type === 'innerFlameStack');
          if (hadFlameReset) { ps.flammeStacks = 0; }
        }
      }

      player.hp = Math.max(0, player.hp - dmgToPlayer);

      // Immortel: survive one fatal blow with 1 HP
      if (player.hp <= 0 && tb.hasImmortel && !immortelUsed) {
        player.hp = 1;
        immortelUsed = true;
        log.push({ text: `${player.name} survit au coup fatal ! (Immortel)`, type: 'info', id: Date.now() + 0.2 });
      }
      // Colossus (Talent II): survive one fatal blow, revive at 20% HP
      if (player.hp <= 0 && tb.hasColossus && !colossusUsed) {
        player.hp = Math.floor(player.maxHp * 0.2);
        colossusUsed = true;
        log.push({ text: `${player.name} se releve tel un Colossus ! (20% PV)`, type: 'info', id: Date.now() + 0.25 });
      }

      if (eRes.healed) enemy.hp = Math.min(enemy.maxHp, enemy.hp + eRes.healed);
      if (eRes.buff) enemy.buffs.push({ ...eRes.buff });
      if (eRes.debuff) player.buffs.push({ ...eRes.debuff });
      eSkill.cd = eSkill.cdMax;
      log.push({ text: dodged ? `${enemy.name} attaque mais rate !` : eRes.text, type: 'enemy', id: Date.now() + 1 });

      // Riposte: chance to counter-attack after enemy hit
      if (!dodged && tb.counterChance > 0 && eRes.damage > 0 && player.hp > 0) {
        if (Math.random() * 100 < tb.counterChance) {
          const riposteDmg = Math.max(1, Math.floor(getEffStat(player.atk, player.buffs, 'atk') * 0.5));
          enemy.hp = Math.max(0, enemy.hp - riposteDmg);
          log.push({ text: `${player.name} contre-attaque ! -${riposteDmg} PV`, type: 'player', id: Date.now() + 1.1 });
        }
      }

      player.skills.forEach(s => { if (s.cd > 0) s.cd--; });
      enemy.skills.forEach(s => { if (s.cd > 0) s.cd--; });
      player.buffs = player.buffs.map(b => ({ ...b, turns: b.turns - 1 })).filter(b => b.turns > 0);
      enemy.buffs = enemy.buffs.map(b => ({ ...b, turns: b.turns - 1 })).filter(b => b.turns > 0);

      // ─── PASSIVE: onTurnStart (for next turn) ───
      ps.echoTurnCounter = (ps.echoTurnCounter || 0) + 1;
      passives.forEach(p => {
        if (p.trigger === 'onTurnStart' && p.type === 'echoFreeMana' && ps.echoTurnCounter % p.interval === 0) {
          ps.echoFreeMana = true;
          log.push({ text: `Echo Temporel ! Prochain sort gratuit !`, type: 'info', id: Date.now() + 1.5 });
        }
      });

      // Sulfuras: increment stacking damage each turn
      let newSulfurasStacks = battle.sulfurasStacks;
      if (newSulfurasStacks !== undefined) {
        newSulfurasStacks = Math.min(SULFURAS_STACK_MAX, newSulfurasStacks + SULFURAS_STACK_PER_TURN);
      }

      setDmgPopup(dmgToPlayer > 0 ? { target: 'player', value: dmgToPlayer, isCrit: eRes.isCrit } : null);
      setBattle(prev => ({ ...prev, player: { ...player }, enemy: { ...enemy }, immortelUsed, colossusUsed, passiveState: ps, sulfurasStacks: newSulfurasStacks, turn: prev.turn + 1, log: log.slice(-10) }));

      if (enemy.hp <= 0) {
        setTimeout(() => handleVictory(), 1200);
        return;
      }
      if (player.hp <= 0) {
        setTimeout(() => handleDefeat(), 1200);
        return;
      }
      setTimeout(() => { setPhase('idle'); setDmgPopup(null); }, 800);
    }, 1200);
  }, [battle]);

  // ─── Auto-combat AI ────────────────────────────────────────

  const pickBestSkill = useCallback(() => {
    if (!battle) return 0;
    const p = battle.player;
    const e = battle.enemy;
    let bestIdx = 0;
    let bestScore = -Infinity;
    p.skills.forEach((sk, i) => {
      if (sk.cd > 0) return;
      const cost = sk.manaCost || 0;
      if (p.mana < cost) return;
      let score = (sk.power || 100) * (sk.hits || 1);
      // Prefer finishing blows
      const estDmg = Math.floor(p.atk * (sk.power || 100) / 100 * (sk.hits || 1));
      if (estDmg >= e.hp) score += 5000;
      // Prefer heals when low HP
      if (sk.type === 'heal' && p.hp < p.maxHp * 0.4) score += 3000;
      if (sk.type === 'heal' && p.hp >= p.maxHp * 0.7) score -= 2000;
      // Prefer buffs early
      if (sk.type === 'buff' && battle.turn <= 2) score += 1500;
      if (sk.type === 'buff' && battle.turn > 2) score -= 500;
      // Prefer high damage skills when enemy is low
      if (e.hp < e.maxHp * 0.3) score += (sk.power || 100) * 2;
      // Penalize expensive mana skills when mana is low
      if (p.mana < p.maxMana * 0.3 && cost > 0) score -= cost * 10;
      // Prefer skills off cooldown with high cooldown (use them when available)
      score += (sk.cdMax || 0) * 50;
      if (score > bestScore) { bestScore = score; bestIdx = i; }
    });
    return bestIdx;
  }, [battle]);

  useEffect(() => {
    if (!autoReplayRef.current || !battle || phase !== 'idle' || view !== 'battle') return;
    const timer = setTimeout(() => {
      if (autoReplayRef.current && phaseRef.current === 'idle' && battle) {
        executeRound(pickBestSkill());
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [phase, battle, view, pickBestSkill, executeRound]);

  // ─── Victory ───────────────────────────────────────────────

  const handleVictory = useCallback(() => {
    setPhase('done');
    const stage = STAGES[selStage];
    const currentStar = battle?.starLevel || 0;

    // Star-scaled rewards
    const rMult = getStarRewardMult(currentStar);
    const scaledXp = Math.floor(stage.xp * rMult.xp);
    const scaledCoins = Math.floor(stage.coins * rMult.coins);

    const { level, xp } = getChibiLevel(selChibi);
    let newXp = xp + scaledXp;
    let newLevel = level;
    let leveled = false;
    let newStatPts = 0;
    let newSP = 0;
    let newTP = 0;
    while (newLevel < MAX_LEVEL && newXp >= xpForLevel(newLevel)) {
      newXp -= xpForLevel(newLevel);
      newLevel++;
      leveled = true;
      newStatPts += POINTS_PER_LEVEL;
      if (newLevel % SP_INTERVAL === 0) newSP++;
      if (newLevel >= 10) newTP++;
    }
    if (newLevel >= MAX_LEVEL) newXp = 0;

    shadowCoinManager.addCoins(scaledCoins, 'colosseum_victory');

    // Account XP (scaled)
    const baseAccountXp = 15 + stage.tier * 10 + (stage.isBoss ? 20 : 0);
    const accountXpGain = Math.floor(baseAccountXp * rMult.accountXp);
    const prevAccountXp = data.accountXp || 0;
    const newAccountXp = prevAccountXp + accountXpGain;
    const prevAccLvl = accountLevelFromXp(prevAccountXp).level;
    const newAccLvl = accountLevelFromXp(newAccountXp).level;
    const prevMilestones = Math.floor(prevAccLvl / ACCOUNT_BONUS_INTERVAL);
    const newMilestones = Math.floor(newAccLvl / ACCOUNT_BONUS_INTERVAL);
    const newAllocations = newMilestones - prevMilestones;

    // Hammer drop (star bonus on base chance)
    const dropBonus = getStarDropBonus(currentStar);
    const hammerDrop = rollHammerDrop(stage.tier, !!stage.isBoss);
    // Extra hammer roll from star bonus
    let extraHammer = null;
    if (!hammerDrop && dropBonus.hammerPct > 0 && Math.random() * 100 < dropBonus.hammerPct) {
      extraHammer = rollHammerDrop(stage.tier, !!stage.isBoss);
    }

    // Hunter drop (base + star bonus)
    let hunterDrop = null;
    const baseHunterChance = stage.isBoss ? STAGE_HUNTER_DROP.dropChance.boss : STAGE_HUNTER_DROP.dropChance.normal;
    const hunterChance = baseHunterChance + dropBonus.hunterPct / 100;
    if (Math.random() < hunterChance) {
      const tierPool = STAGE_HUNTER_DROP.tierPool[stage.tier] || ['rare'];
      const dropRarity = tierPool[Math.floor(Math.random() * tierPool.length)];
      const hunterCandidates = Object.values(HUNTERS).filter(h => h.rarity === dropRarity);
      if (hunterCandidates.length > 0) {
        const pick = hunterCandidates[Math.floor(Math.random() * hunterCandidates.length)];
        const rd = loadRaidData();
        const res = addHunterOrDuplicate(rd, pick.id);
        saveRaidData(rd);
        hunterDrop = { id: pick.id, name: pick.name, rarity: pick.rarity, isDuplicate: res.isDuplicate, newStars: res.newStars };
      }
    }

    // Guaranteed artifact at high stars
    let guaranteedArtifact = null;
    const gRarity = getGuaranteedArtifactRarity(currentStar);
    if (gRarity) guaranteedArtifact = generateArtifact(gRarity);

    // Weapon drops — general (tier-based) + Sulfuras secret (no uniqueness check)
    let weaponDrop = null;
    const rolledWeaponId = rollWeaponDrop(stage.tier, !!stage.isBoss);
    if (rolledWeaponId) {
      const isNew = data.weaponCollection[rolledWeaponId] === undefined;
      weaponDrop = { id: rolledWeaponId, ...WEAPONS[rolledWeaponId], isNew, newAwakening: isNew ? 0 : Math.min((data.weaponCollection[rolledWeaponId] || 0) + 1, MAX_WEAPON_AWAKENING) };
    }
    if (!weaponDrop && stage.id === 'ragnarok' && Math.random() < 1 / 10000) {
      const isNew = data.weaponCollection['w_sulfuras'] === undefined;
      weaponDrop = { id: 'w_sulfuras', ...WEAPONS.w_sulfuras, isNew, newAwakening: isNew ? 0 : Math.min((data.weaponCollection['w_sulfuras'] || 0) + 1, MAX_WEAPON_AWAKENING) };
    }

    // Star tracking
    const prevMaxStars = getMaxStars(stage.id);
    const newMaxStars = Math.max(prevMaxStars, currentStar);
    const isNewStarRecord = currentStar > prevMaxStars;

    setData(prev => {
      const newHammers = { ...(prev.hammers || { marteau_forge: 0, marteau_runique: 0, marteau_celeste: 0 }) };
      if (hammerDrop) newHammers[hammerDrop] = (newHammers[hammerDrop] || 0) + 1;
      if (extraHammer) newHammers[extraHammer] = (newHammers[extraHammer] || 0) + 1;
      return {
        ...prev,
        chibiLevels: { ...prev.chibiLevels, [selChibi]: { level: newLevel, xp: newXp } },
        stagesCleared: { ...prev.stagesCleared, [stage.id]: { maxStars: Math.max((prev.stagesCleared[stage.id]?.maxStars ?? -1), currentStar) } },
        stats: { battles: prev.stats.battles + 1, wins: prev.stats.wins + 1 },
        hammers: newHammers,
        accountXp: newAccountXp,
        weaponCollection: (() => {
          if (!weaponDrop) return prev.weaponCollection;
          const wc = { ...prev.weaponCollection };
          if (wc[weaponDrop.id] !== undefined) wc[weaponDrop.id] = Math.min(wc[weaponDrop.id] + 1, MAX_WEAPON_AWAKENING);
          else wc[weaponDrop.id] = 0;
          return wc;
        })(),
        artifactInventory: guaranteedArtifact ? [...prev.artifactInventory, guaranteedArtifact] : prev.artifactInventory,
      };
    });
    if (newAllocations > 0) setAccountLevelUpPending(newAllocations);
    setResult({ won: true, xp: scaledXp, coins: scaledCoins, leveled, newLevel, oldLevel: level, newStatPts, newSP, newTP, hunterDrop, hammerDrop: hammerDrop || extraHammer, weaponDrop, guaranteedArtifact, starLevel: currentStar, isNewStarRecord, newMaxStars, accountXpGain, accountLevelUp: newAccLvl > prevAccLvl ? newAccLvl : null, accountAllocations: newAllocations });

    // Weapon drop reveal + Beru reaction
    if (weaponDrop) {
      setWeaponReveal(weaponDrop);
      // Auto-dismiss le reveal après 4s pour ne pas bloquer le farm
      setTimeout(() => setWeaponReveal(null), 4000);
      if (weaponDrop.id === 'w_sulfuras') {
        try { window.dispatchEvent(new CustomEvent('beru-react', { detail: { type: 'sulfuras', message: "OOOH MON DIEU !! LA MASSE DE SULFURAS !!! C'est... c'est REEL ?! Tu l'as eu ! TU L'AS VRAIMENT EU ! Je pleure des larmes de fourmi !!" } })); } catch (e) {}
      } else if (weaponDrop.rarity === 'mythique') {
        try { window.dispatchEvent(new CustomEvent('beru-react', { detail: { type: 'excited', message: `Wow ! ${weaponDrop.name} ! Une arme mythique, la classe !` } })); } catch (e) {}
      }
    }

    // Auto-replay logic — si arme droppée, pause 4.5s pour l'animation puis reprend
    if (autoReplayRef.current) {
      setView('result');
      const delay = weaponDrop ? 4500 : 1500;
      setTimeout(() => {
        if (autoReplayRef.current) {
          setResult(null); setBattle(null);
          setTimeout(() => startBattle(), 100);
        }
      }, delay);
    } else {
      setView('result');
    }
  }, [selChibi, selStage, battle, data]);

  // ─── Defeat ────────────────────────────────────────────────

  const handleDefeat = useCallback(() => {
    setPhase('done');
    const stage = STAGES[selStage];
    const cooldownMs = TIER_COOLDOWN_MIN[stage.tier] * 60 * 1000;
    setData(prev => ({
      ...prev,
      cooldowns: { ...prev.cooldowns, [selChibi]: Date.now() + cooldownMs },
      stats: { ...prev.stats, battles: prev.stats.battles + 1 },
    }));
    setResult({ won: false, cooldownMin: TIER_COOLDOWN_MIN[stage.tier] });
    setView('result');
  }, [selChibi, selStage]);

  // ─── Flee ──────────────────────────────────────────────────

  const flee = () => {
    setData(prev => ({
      ...prev,
      cooldowns: { ...prev.cooldowns, [selChibi]: Date.now() + 5 * 60 * 1000 },
    }));
    setBattle(null);
    setView('hub');
  };

  // ─── HP Bar ────────────────────────────────────────────────

  const HpBar = ({ hp, maxHp }) => {
    const pct = Math.max(0, (hp / maxHp) * 100);
    const color = pct > 50 ? 'bg-green-500' : pct > 25 ? 'bg-yellow-500' : 'bg-red-500';
    return (
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white pb-20">
      <BattleStyles />

      {/* Fixed bottom back button for sub-views (not result/battle) */}
      {!['hub', 'battle', 'result'].includes(view) && (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50">
          <button onClick={() => setView('hub')}
            className="px-6 py-2.5 bg-gradient-to-r from-gray-700 to-gray-600 rounded-xl font-bold text-sm shadow-lg shadow-gray-900/40 hover:scale-105 transition-transform active:scale-95 border border-gray-500/30">
            {'\u2190'} Menu
          </button>
        </div>
      )}

      {/* ═══ HUB VIEW ═══ */}
      {view === 'hub' && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          {/* Header */}
          <div className="text-center mb-5">
            <Link to="/" className="text-gray-500 text-xs hover:text-white transition-colors">&larr; Retour</Link>
            <h1 className="text-2xl md:text-3xl font-black mt-1 bg-gradient-to-r from-purple-400 to-red-400 bg-clip-text text-transparent">
              Shadow Colosseum
            </h1>
            <p className="text-xs text-gray-500 mt-1">Le Colisee des Ombres — Fais combattre tes chibis !</p>
            <div className="flex justify-center gap-4 mt-2 text-xs text-gray-400">
              <span>{data.stats.battles} combats</span>
              <span>{data.stats.wins} victoires</span>
            </div>
          </div>

          {/* Account Level Bar */}
          {(() => {
            const acc = accountLevelFromXp(data.accountXp || 0);
            const totalBonusAllocated = Object.values(data.accountBonuses || {}).reduce((s, v) => s + v, 0);
            const totalBonusEarned = Math.floor(acc.level / ACCOUNT_BONUS_INTERVAL) * ACCOUNT_BONUS_AMOUNT;
            const pendingPoints = totalBonusEarned - totalBonusAllocated;
            const ab = data.accountBonuses || {};
            const hasAnyBonus = Object.values(ab).some(v => v > 0);
            return (
              <div className="mb-4 p-2.5 rounded-xl bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/30">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{'\uD83C\uDFC5'}</span>
                    <span className="text-xs font-bold text-indigo-300">Niveau Compte</span>
                    <span className="text-sm font-black text-white">{acc.level}</span>
                  </div>
                  <span className="text-[9px] text-gray-500">{acc.xpInLevel}/{acc.xpForNext} XP</span>
                </div>
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (acc.xpInLevel / acc.xpForNext) * 100)}%` }} />
                </div>
                {hasAnyBonus && (
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
                    {STAT_ORDER.filter(k => ab[k] > 0).map(k => (
                      <span key={k} className="text-[10px] text-gray-400">
                        {STAT_META[k].icon} {STAT_META[k].name} <span className="text-green-400 font-bold">+{ab[k]}</span>
                      </span>
                    ))}
                  </div>
                )}
                {pendingPoints > 0 && (
                  <button
                    onClick={() => setAccountLevelUpPending(Math.ceil(pendingPoints / ACCOUNT_BONUS_AMOUNT))}
                    className="mt-1.5 w-full text-center text-[10px] font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 rounded-lg py-1 hover:bg-yellow-500/20 transition-all animate-pulse">
                    {'\u2B50'} {pendingPoints} points de stats a attribuer !
                  </button>
                )}
                <div className="text-[10px] text-gray-600 mt-1 text-center">
                  Prochain bonus : Lv {(Math.floor(acc.level / ACCOUNT_BONUS_INTERVAL) + 1) * ACCOUNT_BONUS_INTERVAL} (+{ACCOUNT_BONUS_AMOUNT} pts d'une stat au choix)
                </div>
              </div>
            );
          })()}

          {/* Raid Button */}
          <Link to="/shadow-colosseum/raid"
            className="block mb-4 p-3 rounded-xl border border-red-500/30 bg-gradient-to-r from-red-900/30 to-orange-900/30 hover:from-red-900/50 hover:to-orange-900/50 transition-all text-center group">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">{'\uD83D\uDC1C'}</span>
              <span className="font-bold text-red-400 group-hover:text-red-300">MODE RAID</span>
              <span className="text-xs text-gray-400">— Reine des Fourmis</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-0.5">Jusqu'a 6 chibis vs Raid Boss ! Controle Sung Jinwoo au clavier !</p>
          </Link>

          {/* PVP Button */}
          <Link to="/shadow-colosseum/pvp"
            className="block mb-4 p-3 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 hover:from-cyan-900/50 hover:to-blue-900/50 transition-all text-center group">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">{'\u2694\uFE0F'}</span>
              <span className="font-bold text-cyan-400 group-hover:text-cyan-300">MODE PVP</span>
              <span className="text-xs text-gray-400">— Arene Asynchrone</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-0.5">6v6 contre les equipes des autres joueurs !</p>
          </Link>

          {/* Shop & Artifacts Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => setView('shop')}
              className="p-3 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-900/20 to-yellow-900/20 hover:from-amber-900/40 hover:to-yellow-900/40 transition-all text-center group">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-lg">{'\uD83D\uDED2'}</span>
                <span className="font-bold text-amber-400 group-hover:text-amber-300 text-sm">BOUTIQUE</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5 relative inline-flex items-center gap-1">
                Forge & Armes {'\uD83D\uDCB0'}{' '}
                <span className="text-amber-400 font-bold">{coinDisplay}</span>
                {coinDelta && (
                  <motion.span
                    key={coinDelta.key}
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 0, y: -20 }}
                    transition={{ duration: 1.5 }}
                    className={`absolute -top-3 right-0 text-[10px] font-bold ${coinDelta.amount > 0 ? 'text-green-400' : 'text-red-400'}`}
                  >{coinDelta.amount > 0 ? '+' : ''}{coinDelta.amount}</motion.span>
                )}
              </p>
            </button>
            <button
              onClick={() => { setView('artifacts'); setArtSelected(null); setArtFilter({ set: null, rarity: null, slot: null }); }}
              className="p-3 rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 hover:from-purple-900/40 hover:to-indigo-900/40 transition-all text-center group">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-lg">{'\uD83D\uDC8E'}</span>
                <span className="font-bold text-purple-400 group-hover:text-purple-300 text-sm">ARTEFACTS</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {data.artifactInventory.length} en inventaire
              </p>
            </button>
          </div>

          {/* No chibis warning */}
          {ownedIds.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              <div className="text-4xl mb-3">{'\uD83D\uDC1C'}</div>
              <p>Tu n'as aucun chibi !</p>
              <p className="text-xs mt-1">Attrape-les quand ils passent sur l'ecran.</p>
            </div>
          )}

          {/* Filter / Sort Bar */}
          {(ownedIds.length > 0 || ownedHunterIds.length > 0) && (
            <div className="mb-3 p-2 rounded-xl bg-gray-800/20 border border-gray-700/20">
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { key: 'ilevel', label: 'iLevel', icon: '\u2B50' },
                  { key: 'level', label: 'Niveau', icon: '\uD83D\uDCC8' },
                  { key: 'name', label: 'Nom', icon: 'A' },
                ].map(s => (
                  <button key={s.key} onClick={() => setRosterSort(s.key)}
                    className={`px-1.5 py-0.5 rounded text-[10px] transition-all ${
                      rosterSort === s.key ? 'bg-amber-500/30 text-amber-300 font-bold' : 'text-gray-500 bg-gray-800/30 hover:bg-gray-700/30'
                    }`}>{s.icon} {s.label}</button>
                ))}
                <button onClick={() => setFiltersExpanded(!filtersExpanded)}
                  className={`ml-auto px-1.5 py-0.5 rounded text-[10px] transition-all ${
                    filtersExpanded || rosterFilterElem || rosterFilterClass ? 'bg-purple-500/30 text-purple-300 font-bold' : 'text-gray-500 bg-gray-800/30 hover:bg-gray-700/30'
                  }`}>
                  {'\u2699\uFE0F'} Filtres {(rosterFilterElem || rosterFilterClass) && !filtersExpanded ? '\u2022' : ''} {filtersExpanded ? '\u25B2' : '\u25BC'}
                </button>
              </div>
              {filtersExpanded && (
                <div className="mt-1.5 pt-1.5 border-t border-gray-700/20">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                    <span className="text-[9px] text-gray-500 font-bold uppercase">Element:</span>
                    <button onClick={() => setRosterFilterElem(null)}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${!rosterFilterElem ? 'bg-white/10 text-white font-bold' : 'text-gray-500 bg-gray-800/30 hover:bg-gray-700/30'}`}>Tous</button>
                    {Object.entries(ELEMENTS).map(([eId, e]) => (
                      <button key={eId} onClick={() => setRosterFilterElem(rosterFilterElem === eId ? null : eId)}
                        className={`px-1.5 py-0.5 rounded text-[10px] transition-all ${
                          rosterFilterElem === eId ? `${e.color} ${e.bg || 'bg-white/10'} font-bold` : 'text-gray-500 bg-gray-800/30 hover:bg-gray-700/30'
                        }`}>{e.icon}</button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] text-gray-500 font-bold uppercase">Classe:</span>
                    <button onClick={() => setRosterFilterClass(null)}
                      className={`px-1.5 py-0.5 rounded text-[10px] ${!rosterFilterClass ? 'bg-white/10 text-white font-bold' : 'text-gray-500 bg-gray-800/30 hover:bg-gray-700/30'}`}>Tous</button>
                    {['fighter', 'assassin', 'mage', 'tank', 'support'].map(cls => (
                      <button key={cls} onClick={() => setRosterFilterClass(rosterFilterClass === cls ? null : cls)}
                        className={`px-1.5 py-0.5 rounded text-[10px] capitalize transition-all ${
                          rosterFilterClass === cls ? 'bg-red-500/30 text-red-300 font-bold' : 'text-gray-500 bg-gray-800/30 hover:bg-gray-700/30'
                        }`}>{cls}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Your Chibis */}
          {ownedIds.length > 0 && (() => {
            const sortedChibis = ownedIds
              .filter(id => {
                const c = getChibiData(id);
                if (!c) return false;
                if (rosterFilterElem && c.element !== rosterFilterElem) return false;
                if (rosterFilterClass) return false; // chibis don't have classes
                return true;
              })
              .map(id => ({ id, iLvl: getChibiILevel(id), level: (getChibiLevel(id)).level, name: getChibiData(id)?.name || '' }))
              .sort((a, b) => rosterSort === 'ilevel' ? b.iLvl - a.iLvl : rosterSort === 'level' ? b.level - a.level : a.name.localeCompare(b.name));
            if (sortedChibis.length === 0) return null;
            return (
            <>
              <button onClick={() => setChibisCollapsed(!chibisCollapsed)}
                className="w-full flex items-center justify-between text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 hover:text-gray-300 transition-colors">
                <span>Tes Chibis ({sortedChibis.length})</span>
                <span className="text-[10px] text-gray-600">{chibisCollapsed ? '\u25BC' : '\u25B2'}</span>
              </button>
              {!chibisCollapsed && <div className="grid grid-cols-2 gap-2 mb-3">
                {sortedChibis.map(({ id, iLvl }) => {
                  const c = getChibiData(id);
                  const { level, xp } = getChibiLevel(id);
                  const alloc = data.statPoints[id] || {};
                  const tb = getChibiTalentBonuses(id);
                  const eqB = getChibiEquipBonuses(id);
                  const s = statsAtFull(c.base, c.growth, level, alloc, tb, eqB, 0, data.accountBonuses);
                  const onCd = isCooldown(id);
                  const selected = selChibi === id;
                  const availPts = getAvailStatPts(id);
                  const availSP = getAvailSP(id);
                  const availTP = getAvailTalentPts(id);
                  const hasUnspent = availPts > 0 || availSP > 0 || availTP > 0;
                  return (
                    <button
                      key={id}
                      onClick={() => !onCd && setSelChibi(selected ? null : id)}
                      disabled={onCd}
                      className={`relative p-2 rounded-xl border transition-all text-left ${
                        selected ? 'border-purple-400 bg-purple-500/15 ring-1 ring-purple-400/50' :
                        onCd ? 'border-red-500/30 bg-red-900/10 opacity-60' :
                        'border-gray-700/40 bg-gray-800/30 hover:border-purple-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={getChibiSprite(id)} alt={c.name} className="w-12 h-12 object-contain" style={{ filter: RARITY[c.rarity].glow, imageRendering: 'auto' }} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold truncate">{c.name}</div>
                          <div className="flex items-center gap-1 text-[11px]">
                            <span className={RARITY[c.rarity].color}>{RARITY[c.rarity].stars}</span>
                            <span className={ELEMENTS[c.element].color}>{ELEMENTS[c.element].icon}</span>
                            <span className="text-gray-400">Lv{level}</span>
                            <span className="text-amber-400 font-bold ml-auto text-[10px]">iLv{iLvl}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-1.5 grid grid-cols-3 gap-x-3 gap-y-0.5 text-[10px] text-gray-400">
                        <span>PV:{s.hp}</span><span>ATK:{s.atk}</span><span>DEF:{s.def}</span>
                        <span>SPD:{s.spd}</span><span>CRT:{s.crit}%</span><span>RES:{s.res}%</span>
                      </div>
                      {level < MAX_LEVEL && (
                        <div className="mt-1 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500/60 rounded-full" style={{ width: `${(xp / xpForLevel(level)) * 100}%` }} />
                        </div>
                      )}
                      {hasUnspent && !onCd && (
                        <div className="absolute -top-1 -right-1 flex gap-0.5">
                          {availPts > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/80 text-black" style={{ animation: 'statGlow 2s ease-in-out infinite' }}>
                              {availPts} PTS
                            </span>
                          )}
                          {availSP > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/80 text-white" style={{ animation: 'statGlow 2s ease-in-out infinite' }}>
                              {availSP} SP
                            </span>
                          )}
                          {availTP > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-500/80 text-black" style={{ animation: 'statGlow 2s ease-in-out infinite' }}>
                              {availTP} TP
                            </span>
                          )}
                        </div>
                      )}
                      {onCd && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                          <span className="text-red-400 text-[10px] font-bold">{'\u23F3'} {cooldownMin(id)}min</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>}

              {/* Selected Chibi Detail Panel */}
              <AnimatePresence>
                {selChibi && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/5">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={getChibiSprite(selChibi)} alt="" className="w-14 h-14 object-contain" style={{ filter: RARITY[getChibiData(selChibi).rarity].glow }} />
                        <div className="flex-1">
                          <div className="text-base font-bold">{getChibiData(selChibi).name}</div>
                          <div className="text-xs text-gray-400">
                            Lv{getChibiLevel(selChibi).level} {RARITY[getChibiData(selChibi).rarity].stars} {ELEMENTS[getChibiData(selChibi).element].icon}
                            {HUNTERS[selChibi] && <span className="ml-1 text-red-400">[Hunter]</span>}
                          </div>
                        </div>
                      </div>
                      {/* 6 Stats */}
                      {(() => {
                        const selData = getChibiData(selChibi);
                        const alloc = data.statPoints[selChibi] || {};
                        const tbDetail = getChibiTalentBonuses(selChibi);
                        const eqBDetail = getChibiEquipBonuses(selChibi);
                        const evStars = getChibiEveilStars(selChibi);
                        const s = statsAtFull(selData.base, selData.growth, getChibiLevel(selChibi).level, alloc, tbDetail, eqBDetail, evStars, data.accountBonuses);
                        // Merge talent + equip for derived stats
                        const derived = { ...tbDetail };
                        for (const [k, v] of Object.entries(eqBDetail)) { if (v) derived[k] = (derived[k] || 0) + v; }
                        const totalCritDmg = 150 + (derived.critDamage || 0);
                        const derivedLines = [
                          { key: '_critDmgTotal', name: 'CRIT DMG', icon: '\uD83D\uDCA5', color: 'text-orange-400', suffix: '%', value: totalCritDmg },
                          { key: 'physicalDamage', name: 'DMG Physique', icon: '\u2694\uFE0F', color: 'text-red-300', suffix: '%' },
                          { key: 'elementalDamage', name: 'DMG Elementaire', icon: '\uD83C\uDF00', color: 'text-purple-300', suffix: '%' },
                          { key: 'fireDamage', name: 'DMG Feu', icon: '\uD83D\uDD25', color: 'text-orange-400', suffix: '%' },
                          { key: 'waterDamage', name: 'DMG Eau', icon: '\uD83D\uDCA7', color: 'text-cyan-400', suffix: '%' },
                          { key: 'shadowDamage', name: 'DMG Ombre', icon: '\uD83C\uDF11', color: 'text-purple-400', suffix: '%' },
                          { key: 'allDamage', name: 'Tous DMG', icon: '\u2728', color: 'text-emerald-400', suffix: '%' },
                          { key: 'bossDamage', name: 'DMG Boss', icon: '\uD83D\uDC1C', color: 'text-red-400', suffix: '%' },
                          { key: 'defPen', name: 'DEF PEN', icon: '\uD83D\uDDE1\uFE0F', color: 'text-yellow-300', suffix: '%' },
                          { key: 'healBonus', name: 'Soins', icon: '\uD83D\uDC9A', color: 'text-green-400', suffix: '%' },
                          { key: 'cooldownReduction', name: 'Reduc. CD', icon: '\u231B', color: 'text-blue-300', suffix: '' },
                          { key: 'elementalAdvantageBonus', name: 'Avantage Elem.', icon: '\uD83C\uDF1F', color: 'text-yellow-400', suffix: '%' },
                        ].filter(d => d.value !== undefined || (derived[d.key] || 0) > 0);
                        return (
                          <>
                            <div className="grid grid-cols-3 gap-1.5 mb-2">
                              {STAT_ORDER.map(stat => {
                                const isPct = stat === 'crit' || stat === 'res';
                                const m = STAT_META[stat];
                                return (
                                  <div key={stat} className="flex items-center gap-1.5 bg-gray-800/30 rounded-md px-2 py-1.5">
                                    <span className="text-xs">{m.icon}</span>
                                    <span className={`text-[11px] font-bold ${m.color}`}>{m.name}</span>
                                    <span className="text-xs text-white ml-auto font-bold">{s[stat]}{isPct ? '%' : ''}</span>
                                  </div>
                                );
                              })}
                            </div>
                            {derivedLines.length > 0 && (
                              <div className="grid grid-cols-2 gap-1 mb-3">
                                {derivedLines.map(d => (
                                  <div key={d.key} className="flex items-center gap-1 bg-gray-800/20 rounded-md px-2 py-1">
                                    <span className="text-[11px]">{d.icon}</span>
                                    <span className={`text-[10px] ${d.color}`}>{d.name}</span>
                                    <span className={`text-[11px] ml-auto font-bold ${d.color}`}>{d.value !== undefined ? d.value : `+${derived[d.key]}`}{d.suffix}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        );
                      })()}
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setManageTarget(selChibi); setView('stats'); }}
                          className="flex-1 py-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-400 text-sm font-bold hover:bg-amber-500/20 transition-colors"
                        >
                          {'\uD83D\uDCCA'} Stats {getAvailStatPts(selChibi) > 0 && <span className="ml-1 px-1 rounded bg-amber-500/30 text-[10px]">{getAvailStatPts(selChibi)}</span>}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setManageTarget(selChibi); setView('skilltree'); }}
                          className="flex-1 py-2.5 rounded-lg border border-purple-500/40 bg-purple-500/10 text-purple-400 text-sm font-bold hover:bg-purple-500/20 transition-colors"
                        >
                          {'\uD83C\uDF33'} Skills {getAvailSP(selChibi) > 0 && <span className="ml-1 px-1 rounded bg-purple-500/30 text-[10px]">{getAvailSP(selChibi)}</span>}
                        </button>
                        {getChibiLevel(selChibi).level >= 10 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setManageTarget(selChibi); setView('talents'); }}
                            className="flex-1 py-2.5 rounded-lg border border-green-500/40 bg-green-500/10 text-green-400 text-sm font-bold hover:bg-green-500/20 transition-colors"
                          >
                            {'\u2728'} Talents {getAvailTalentPts(selChibi) > 0 && <span className="ml-1 px-1 rounded bg-green-500/30 text-[10px]">{getAvailTalentPts(selChibi)}</span>}
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setManageTarget(selChibi); setView('equipment'); }}
                          className="flex-1 py-2.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-400 text-sm font-bold hover:bg-cyan-500/20 transition-colors"
                        >
                          {'\uD83D\uDEE1\uFE0F'} Equip
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
            );
          })()}

          {/* Hunter Chibis */}
          {ownedHunterIds.length > 0 && (() => {
            const sortedHunters = ownedHunterIds
              .filter(id => {
                const c = getChibiData(id);
                if (!c) return false;
                if (rosterFilterElem && c.element !== rosterFilterElem) return false;
                if (rosterFilterClass && c.class !== rosterFilterClass) return false;
                return true;
              })
              .map(id => ({ id, iLvl: getChibiILevel(id), level: (getChibiLevel(id)).level, name: getChibiData(id)?.name || '' }))
              .sort((a, b) => rosterSort === 'ilevel' ? b.iLvl - a.iLvl : rosterSort === 'level' ? b.level - a.level : a.name.localeCompare(b.name));
            if (sortedHunters.length === 0) return null;
            return (
            <>
              <button onClick={() => setHuntersCollapsed(!huntersCollapsed)}
                className="w-full flex items-center justify-between text-xs text-red-400 font-bold uppercase tracking-wider mb-2 hover:text-red-300 transition-colors">
                <span className="flex items-center gap-1.5">{'\u2694\uFE0F'} Tes Hunters <span className="text-[9px] text-gray-500 font-normal ml-1">({sortedHunters.length})</span></span>
                <span className="text-[10px] text-gray-600">{huntersCollapsed ? '\u25BC' : '\u25B2'}</span>
              </button>
              {!huntersCollapsed && <div className="grid grid-cols-2 gap-2 mb-3">
                {sortedHunters.map(({ id, iLvl }) => {
                  const c = getChibiData(id);
                  const { level, xp } = getChibiLevel(id);
                  const alloc = data.statPoints[id] || {};
                  const tb = getChibiTalentBonuses(id);
                  const eqB = getChibiEquipBonuses(id);
                  const evStars = getChibiEveilStars(id);
                  const s = statsAtFull(c.base, c.growth, level, alloc, tb, eqB, evStars, data.accountBonuses);
                  const selected = selChibi === id;
                  const availPts = getAvailStatPts(id);
                  const availSP = getAvailSP(id);
                  const availTP = getAvailTalentPts(id);
                  const hasUnspent = availPts > 0 || availSP > 0 || availTP > 0;
                  return (
                    <button
                      key={id}
                      onClick={() => setSelChibi(selected ? null : id)}
                      className={`relative p-2 rounded-xl border transition-all text-left ${
                        selected ? 'border-red-400 bg-red-500/15 ring-1 ring-red-400/50' :
                        'border-gray-700/40 bg-gray-800/30 hover:border-red-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={getChibiSprite(id)} alt={c.name} className="w-10 h-10 object-contain" style={{ filter: RARITY[c.rarity].glow, imageRendering: 'auto' }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 text-xs font-bold">
                            <span className="truncate">{c.name}</span>
                            <span className="text-amber-400 text-[9px] ml-auto font-bold">iLv{iLvl}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[9px]">
                            <span className={RARITY[c.rarity].color}>{RARITY[c.rarity].stars}</span>
                            <span className={ELEMENTS[c.element].color}>{ELEMENTS[c.element].icon}</span>
                            <span className="text-gray-400">Lv{level}</span>
                            <span className="text-red-400/60 text-[10px]">{c.class}</span>
                          </div>
                          {evStars > 0 && (
                            <div className="text-[9px] mt-0.5" style={evStars >= MAX_EVEIL_STARS ? { animation: 'statGlow 2s ease-in-out infinite' } : {}}>
                              {Array.from({ length: MAX_EVEIL_STARS }).map((_, i) => (
                                <span key={i} className={i < evStars ? 'text-yellow-400' : 'text-gray-600'}>{'\u2605'}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-1.5 grid grid-cols-3 gap-x-2 gap-y-0.5 text-[10px] text-gray-400">
                        <span>PV:{s.hp}</span><span>ATK:{s.atk}</span><span>DEF:{s.def}</span>
                        <span>SPD:{s.spd}</span><span>CRT:{s.crit}%</span><span>RES:{s.res}%</span>
                      </div>
                      {level < MAX_LEVEL && (
                        <div className="mt-1 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500/60 rounded-full" style={{ width: `${(xp / xpForLevel(level)) * 100}%` }} />
                        </div>
                      )}
                      {hasUnspent && (
                        <div className="absolute -top-1 -right-1 flex gap-0.5">
                          {availPts > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/80 text-black" style={{ animation: 'statGlow 2s ease-in-out infinite' }}>
                              {availPts} PTS
                            </span>
                          )}
                          {availSP > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/80 text-white" style={{ animation: 'statGlow 2s ease-in-out infinite' }}>
                              {availSP} SP
                            </span>
                          )}
                          {availTP > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-500/80 text-black" style={{ animation: 'statGlow 2s ease-in-out infinite' }}>
                              {availTP} TP
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>}
              {!huntersCollapsed && <div className="text-[9px] text-gray-600 text-center mb-3 italic">Les hunters gagnent de l'XP et montent en niveau dans les Raids.</div>}
            </>
            );
          })()}

          {/* Stages */}
          {ownedIds.length > 0 && [1, 2, 3, 4, 5, 6].map(tier => (
            <div key={tier} className="mb-4">
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">
                Tier {tier} — {TIER_NAMES[tier]}
              </div>
              <div className="space-y-1.5">
                {STAGES.filter(s => s.tier === tier).map((stage) => {
                  const globalIdx = STAGES.indexOf(stage);
                  const unlocked = isStageUnlocked(globalIdx);
                  const cleared = isStageCleared(stage.id);
                  const selected = selStage === globalIdx;
                  const maxSt = getMaxStars(stage.id);
                  const elemAdv = selChibi && getChibiData(selChibi) ? getElementMult(getChibiData(selChibi).element, stage.element) : 1;
                  const sc = selected ? getStarScaledStats(stage, selectedStar) : null;
                  return (
                    <div key={stage.id}>
                      <button
                        onClick={() => { if (unlocked) { if (selected) { setSelStage(null); } else { setSelStage(globalIdx); setSelectedStar(0); } } }}
                        disabled={!unlocked}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                          selected ? 'border-purple-400 bg-purple-500/15' :
                          !unlocked ? 'border-gray-800/40 bg-gray-900/20 opacity-40' :
                          cleared ? 'border-green-600/30 bg-green-900/10 hover:border-purple-500/40' :
                          'border-gray-700/40 bg-gray-800/30 hover:border-purple-500/40'
                        }`}
                      >
                        {!unlocked ? (
                          <span className="text-2xl w-10 text-center">{'\uD83D\uDD12'}</span>
                        ) : stage.sprite ? (
                          <img src={stage.sprite} alt={stage.name} className={`${stage.spriteSize === 'lg' ? 'w-14 h-14' : 'w-10 h-10'} object-contain rounded`} />
                        ) : (
                          <span className="text-2xl w-10 text-center">{stage.emoji}</span>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold truncate">{stage.name}</span>
                            {stage.isBoss && <span className="text-[10px] bg-red-500/30 text-red-300 px-1.5 rounded">BOSS</span>}
                            {cleared && <span className="text-green-400 text-xs">{'\u2705'}</span>}
                            {maxSt > 0 && <span className="text-[10px] text-yellow-400">{'\u2B50'}{maxSt}</span>}
                          </div>
                          <div className="flex items-center gap-2.5 text-[11px] text-gray-400 mt-0.5">
                            <span className={ELEMENTS[stage.element].color}>{ELEMENTS[stage.element].icon} {ELEMENTS[stage.element].name}</span>
                            <span>PV:{selected ? sc.hp : stage.hp}</span>
                            <span>RES:{selected ? Math.round(sc.res) : stage.res}%</span>
                            <span>XP:{selected ? Math.floor(stage.xp * getStarRewardMult(selectedStar).xp) : stage.xp}</span>
                            <span>{'\uD83D\uDCB0'}{selected ? Math.floor(stage.coins * getStarRewardMult(selectedStar).coins) : stage.coins}</span>
                            {selChibi && elemAdv !== 1 && (
                              <span className={elemAdv > 1 ? 'text-green-400' : 'text-red-400'}>
                                {elemAdv > 1 ? '\u25B2' : '\u25BC'}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                      {/* Star difficulty selector */}
                      {cleared && selected && (() => {
                        let diff = null, playerPower = 0, enemyPower = 0, gRarity = null;
                        if (selChibi) {
                          const chibi = getChibiData(selChibi);
                          if (chibi) {
                            const { level } = getChibiLevel(selChibi);
                            const alloc = data.statPoints[selChibi] || {};
                            const tb = getChibiTalentBonuses(selChibi);
                            const eqB = getChibiEquipBonuses(selChibi);
                            const evS = getChibiEveilStars(selChibi);
                            const ps = statsAtFull(chibi.base, chibi.growth, level, alloc, tb, eqB, evS, data.accountBonuses);
                            playerPower = calculatePowerScore(ps);
                            enemyPower = calculatePowerScore(sc, stage.isBoss);
                            diff = getDifficultyRating(playerPower, enemyPower);
                          }
                        }
                        gRarity = getGuaranteedArtifactRarity(selectedStar);
                        return (
                        <div className="mt-1 px-2 py-1.5 bg-gray-900/60 rounded-lg border border-purple-500/20">
                          {/* Star row: indicator + buttons on one line */}
                          <div className="flex items-center gap-1.5">
                            {diff && (
                              <div className={`flex-shrink-0 text-center px-1.5 py-1 rounded ${diff.color} bg-gray-800/80 border border-current`}>
                                <div className="text-[10px] leading-none">{diff.icon}</div>
                                <div className="text-[9px] font-bold leading-tight mt-0.5">{diff.label}</div>
                              </div>
                            )}
                            <div className="flex-1 grid grid-cols-11 gap-[3px]">
                              {[0,1,2,3,4,5,6,7,8,9,10].map(star => {
                                const starUnlocked = star === 0 || star <= maxSt + 1;
                                return (
                                  <button key={star} onClick={(e) => { e.stopPropagation(); if (starUnlocked) setSelectedStar(star); }}
                                    disabled={!starUnlocked}
                                    className={`aspect-square rounded text-[9px] font-bold transition-all ${
                                      selectedStar === star ? 'bg-yellow-500/20 text-yellow-300 font-black ring-1 ring-yellow-400/60 shadow shadow-yellow-500/40' :
                                      !starUnlocked ? 'bg-gray-800/60 text-gray-600 opacity-40' :
                                      'bg-gray-700/50 text-yellow-400 hover:bg-gray-600'
                                    }`}>
                                    {star === 0 ? '-' : star}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          {/* Info row */}
                          <div className="flex items-center justify-between mt-1">
                            {diff ? (
                              <span className="text-[9px] text-gray-500">
                                <span className="text-blue-400">{playerPower}</span> vs <span className="text-red-400">{enemyPower}</span>
                              </span>
                            ) : <span />}
                            <span className="text-[9px] text-gray-500">Record {maxSt}{'\u2605'} | Max {Math.min(10, maxSt + 1)}{'\u2605'}</span>
                          </div>
                          {gRarity && (
                            <div className="mt-1 text-center text-[10px] text-purple-300 bg-purple-900/20 rounded py-0.5 border border-purple-500/20">
                              {'\u2728'} Artefact {gRarity} garanti
                            </div>
                          )}
                        </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Fight Button */}
          {selChibi && selStage !== null && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-4 left-0 right-0 flex justify-center z-50">
              <button
                onClick={startBattle}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-red-600 rounded-xl font-black text-lg shadow-xl shadow-purple-900/40 hover:scale-105 transition-transform active:scale-95"
              >
                {'\u2694\uFE0F'} COMBAT !
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* ═══ STATS VIEW ═══ */}
      {view === 'stats' && manageTarget && (() => {
        const id = manageTarget;
        const c = getChibiData(id);
        if (!c) return null;
        const { level } = getChibiLevel(id);
        const alloc = data.statPoints[id] || {};
        const available = getAvailStatPts(id);
        const total = getTotalStatPts(level);
        const spent = getSpentStatPts(id);

        return (
          <div className="max-w-2xl mx-auto px-4 pt-4">

            {/* Header */}
            <div className="text-center mb-5">
              <img src={getChibiSprite(id)} alt={c.name} className="w-16 h-16 mx-auto object-contain" style={{ filter: RARITY[c.rarity].glow }} />
              <h2 className="text-lg font-black mt-2">{c.name}</h2>
              <div className="text-[10px] text-gray-400">
                Lv{level} {RARITY[c.rarity].stars} {ELEMENTS[c.element].icon} {ELEMENTS[c.element].name}
                {HUNTERS[id] && <span className="ml-1 text-red-400">[Hunter]</span>}
              </div>
            </div>

            {/* Points Summary */}
            <div className="text-center mb-4 p-2 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <div className="text-sm font-bold text-amber-400">
                {available} <span className="text-xs text-gray-400 font-normal">points disponibles</span>
              </div>
              <div className="text-[9px] text-gray-500">{spent}/{total} utilises ({POINTS_PER_LEVEL} par niveau)</div>
            </div>

            {/* Stats Allocation */}
            <div className="space-y-2 mb-4">
              {STAT_ORDER.map(stat => {
                const m = STAT_META[stat];
                const isPct = stat === 'crit' || stat === 'res';
                const baseVal = stat === 'mana'
                  ? getBaseMana(c.base)
                  : isPct
                    ? +(c.base[stat] + c.growth[stat] * (level - 1)).toFixed(1)
                    : Math.floor(c.base[stat] + c.growth[stat] * (level - 1));
                const bonusVal = (alloc[stat] || 0) * STAT_PER_POINT[stat];
                const totalVal = isPct ? +(baseVal + bonusVal).toFixed(1) : Math.floor(baseVal + bonusVal);
                const allocated = alloc[stat] || 0;

                return (
                  <div key={stat} className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-800/30 border border-gray-700/30">
                    <span className="text-base w-6 text-center">{m.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${m.color}`}>{m.name}</span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-white">{totalVal}{isPct ? '%' : ''}</span>
                          {bonusVal > 0 && (
                            <span className="text-[9px] text-green-400 ml-1">
                              (+{isPct ? bonusVal.toFixed(1) : Math.floor(bonusVal)})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">{m.desc}</div>
                      {/* Allocation bar */}
                      <div className="mt-1 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${m.color.replace('text-', 'bg-')}`}
                          style={{ width: `${Math.min(100, (allocated / 30) * 100)}%`, opacity: 0.6 }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => allocateStat(id, stat, -1)}
                        disabled={allocated <= 0}
                        className="w-7 h-7 rounded-lg bg-gray-700/50 text-gray-300 text-sm font-bold hover:bg-red-500/30 disabled:opacity-20 transition-colors flex items-center justify-center"
                      >-</button>
                      <span className="text-[10px] text-gray-400 w-5 text-center font-mono">{allocated}</span>
                      <button
                        onClick={() => allocateStat(id, stat, 1)}
                        disabled={available <= 0}
                        className="w-7 h-7 rounded-lg bg-gray-700/50 text-gray-300 text-sm font-bold hover:bg-green-500/30 disabled:opacity-20 transition-colors flex items-center justify-center"
                      >+</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Per-point info */}
            <div className="text-center mb-3 p-2 rounded-lg bg-gray-800/20 border border-gray-700/20">
              <div className="text-[10px] text-gray-500 mb-1">Valeur par point :</div>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-[9px] text-gray-400">
                {STAT_ORDER.map(stat => (
                  <span key={stat}>
                    <span className={STAT_META[stat].color}>{STAT_META[stat].name}</span> +{STAT_PER_POINT[stat]}{(stat === 'crit' || stat === 'res') ? '%' : ''}
                  </span>
                ))}
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={() => resetStats(id)}
              disabled={spent === 0}
              className="w-full text-center text-xs text-gray-500 hover:text-red-400 disabled:opacity-30 transition-colors py-2"
            >
              Reinitialiser les points (gratuit)
            </button>
          </div>
        );
      })()}

      {/* ═══ SKILL TREE VIEW ═══ */}
      {view === 'skilltree' && manageTarget && (() => {
        const id = manageTarget;
        const c = getChibiData(id);
        if (!c) return null;
        const { level } = getChibiLevel(id);
        const tree = data.skillTree[id] || {};
        const availSP = getAvailSP(id);
        const totalSP = getTotalSP(level);
        const spentSP = getSpentSP(id);

        return (
          <div className="max-w-2xl mx-auto px-4 pt-4">

            {/* Header */}
            <div className="text-center mb-5">
              <img src={getChibiSprite(id)} alt={c.name} className="w-16 h-16 mx-auto object-contain" style={{ filter: RARITY[c.rarity].glow }} />
              <h2 className="text-lg font-black mt-2">{c.name}</h2>
              <div className="text-[10px] text-gray-400">
                Lv{level} {RARITY[c.rarity].stars} {ELEMENTS[c.element].icon} {ELEMENTS[c.element].name}
                {HUNTERS[id] && <span className="ml-1 text-red-400">[Hunter]</span>}
              </div>
            </div>

            {/* SP Summary */}
            <div className="text-center mb-5 p-2 rounded-xl bg-purple-500/5 border border-purple-500/20">
              <div className="text-sm font-bold text-purple-400">
                {availSP} <span className="text-xs text-gray-400 font-normal">SP disponibles</span>
              </div>
              <div className="text-[9px] text-gray-500">{spentSP}/{totalSP} utilises (1 SP tous les {SP_INTERVAL} niveaux)</div>
            </div>

            {/* 3 Skill Columns */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {c.skills.map((skill, skillIdx) => {
                const curLevel = tree[skillIdx] || 0;
                // Show upgraded values preview
                const upgraded = applySkillUpgrades(skill, curLevel);

                return (
                  <div key={skillIdx} className="text-center">
                    {/* Skill Name */}
                    <div className="p-1.5 rounded-t-lg bg-gray-800/40 border border-gray-700/30 border-b-0">
                      <div className="text-[9px] font-bold text-white truncate">{skill.name}</div>
                      <div className="text-[9px] text-gray-500 mt-0.5">
                        {upgraded.power > 0 ? `DMG: ${upgraded.power}%` : ''}
                        {upgraded.buffAtk ? `ATK +${upgraded.buffAtk}%` : ''}
                        {upgraded.buffDef ? `DEF +${upgraded.buffDef}%` : ''}
                        {upgraded.healSelf ? `Soin ${upgraded.healSelf}%` : ''}
                        {upgraded.debuffDef ? `Debuff -${upgraded.debuffDef}%` : ''}
                        {upgraded.cdMax > 0 ? ` | CD:${upgraded.cdMax}` : ''}
                      </div>
                    </div>

                    {/* 3 Tier Nodes */}
                    {[0, 1, 2].map(tierIdx => {
                      const isUnlocked = curLevel > tierIdx;
                      const isAvailable = curLevel === tierIdx && availSP >= TIER_COSTS[tierIdx];
                      const isLocked = !isUnlocked && !isAvailable;
                      const desc = getUpgradeDesc(skill, tierIdx);

                      return (
                        <React.Fragment key={tierIdx}>
                          {/* Connecting line */}
                          <div className={`w-0.5 h-2 mx-auto ${isUnlocked || (tierIdx === 0 && isAvailable) ? 'bg-purple-400/60' : 'bg-gray-700/40'}`} />

                          {/* Node */}
                          <button
                            onClick={() => isAvailable && upgradeSkill(id, skillIdx)}
                            disabled={!isAvailable}
                            className={`w-full p-1.5 rounded-lg border transition-all ${
                              isUnlocked ? 'border-purple-400/50 bg-purple-500/15' :
                              isAvailable ? 'border-amber-400/60 bg-amber-500/5 hover:bg-amber-500/15 cursor-pointer' :
                              'border-gray-700/20 bg-gray-800/15 opacity-40'
                            }`}
                            style={isAvailable ? { animation: 'nodePulse 2s ease-in-out infinite' } : {}}
                          >
                            <div className={`text-[10px] font-bold ${
                              isUnlocked ? 'text-purple-300' : isAvailable ? 'text-amber-400' : 'text-gray-600'
                            }`}>
                              {isUnlocked ? '\u2713 ' : ''}{TIER_NAMES_SKILL[tierIdx]}
                            </div>
                            <div className="text-[9px] text-gray-400 mt-0.5">{desc}</div>
                            {!isUnlocked && (
                              <div className={`text-[9px] mt-0.5 ${isAvailable ? 'text-amber-400' : 'text-gray-600'}`}>
                                {TIER_COSTS[tierIdx]} SP
                              </div>
                            )}
                          </button>
                        </React.Fragment>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Upgrade descriptions */}
            <div className="p-2 rounded-lg bg-gray-800/20 border border-gray-700/20 mb-3">
              <div className="text-[10px] text-gray-500 mb-1">Tiers de competence :</div>
              <div className="space-y-0.5 text-[10px] text-gray-400">
                <div><span className="text-purple-400 font-bold">Eveil</span> — DMG/Effet +30/25% (1 SP)</div>
                <div><span className="text-purple-400 font-bold">Maitrise</span> — Cooldown -1 tour (1 SP)</div>
                <div><span className="text-purple-400 font-bold">Transcendance</span> — DMG/Effet +25/30% (2 SP)</div>
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={() => resetSkillTree(id)}
              disabled={spentSP === 0}
              className="w-full text-center text-xs text-gray-500 hover:text-red-400 disabled:opacity-30 transition-colors py-2"
            >
              Reinitialiser les competences (gratuit)
            </button>
          </div>
        );
      })()}

      {/* ═══ TALENTS VIEW ═══ */}
      {view === 'talents' && manageTarget && (() => {
        const id = manageTarget;
        const c = getChibiData(id);
        if (!c) return null;
        const { level } = getChibiLevel(id);
        const totalTP = getTotalTalentPts(level);
        const spentTP = getSpentTalentPts(id);
        const spent1 = getSpentTalent1Pts(id);
        const spent2 = getSpentTalent2Pts(data.talentTree2[id]);
        const availTP = totalTP - spentTP;
        const t2Unlocked = level >= TALENT2_UNLOCK_LEVEL;

        return (
          <div className="max-w-2xl mx-auto px-4 pt-4">

            {/* Header */}
            <div className="text-center mb-3">
              <img src={getChibiSprite(id)} alt={c.name} className="w-14 h-14 mx-auto object-contain" style={{ filter: RARITY[c.rarity].glow }} />
              <h2 className="text-lg font-black mt-2">{c.name}</h2>
              <div className="text-[10px] text-gray-400">
                Lv{level} {RARITY[c.rarity].stars} {ELEMENTS[c.element].icon}
              </div>
              <div className="mt-2 px-3 py-1.5 rounded-lg bg-green-500/5 border border-green-500/20 inline-block">
                <span className="text-sm font-bold text-green-400">{availTP}</span>
                <span className="text-xs text-gray-400 ml-1">pts dispo</span>
                <span className="text-[9px] text-gray-500 ml-1">(I:{spent1} + II:{spent2} / {totalTP})</span>
              </div>
            </div>

            {/* Talent I / II Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setTalentTab(1)}
                className={`flex-1 py-2 rounded-lg border text-center transition-all ${
                  talentTab === 1 ? 'border-green-500/60 bg-green-500/15 text-green-400' : 'border-gray-700/40 bg-gray-800/20 text-gray-500 hover:text-gray-300'
                }`}
              >
                <span className="text-base">{'\uD83C\uDF1F'}</span>
                <span className="text-xs font-bold ml-1">Talents I</span>
                {spent1 > 0 && <span className="text-[9px] ml-1 text-gray-400">({spent1})</span>}
              </button>
              <button
                onClick={() => t2Unlocked && setTalentTab(2)}
                disabled={!t2Unlocked}
                className={`flex-1 py-2 rounded-lg border text-center transition-all ${
                  !t2Unlocked ? 'border-gray-800/30 bg-gray-900/10 text-gray-600 cursor-not-allowed' :
                  talentTab === 2 ? 'border-purple-500/60 bg-purple-500/15 text-purple-400' : 'border-gray-700/40 bg-gray-800/20 text-gray-500 hover:text-gray-300'
                }`}
              >
                <span className="text-base">{'\u26A1'}</span>
                <span className="text-xs font-bold ml-1">Talents II</span>
                {!t2Unlocked && <span className="text-[9px] ml-1">(Lv{TALENT2_UNLOCK_LEVEL})</span>}
                {t2Unlocked && spent2 > 0 && <span className="text-[9px] ml-1 text-gray-400">({spent2})</span>}
              </button>
            </div>

            {/* ═══ TALENT I ═══ */}
            {talentTab === 1 && (() => {
              const chibiAlloc = data.talentTree[id] || {};
              const treeIds = Object.keys(TALENT_TREES);
              const tree = TALENT_TREES[activeTree];
              const treePts = getTreePoints(id, activeTree);
              const treeMax = getTreeMaxPoints(activeTree);

              return (
                <>
                  {/* Tree Tabs */}
                  <div className="flex gap-1.5 mb-4">
                    {treeIds.map(tid => {
                      const t = TALENT_TREES[tid];
                      const pts = getTreePoints(id, tid);
                      const max = getTreeMaxPoints(tid);
                      const isActive = activeTree === tid;
                      return (
                        <button
                          key={tid}
                          onClick={() => setActiveTree(tid)}
                          className={`flex-1 py-2 rounded-lg border text-center transition-all ${
                            isActive
                              ? `border-${t.color}-500/60 bg-${t.color}-500/15`
                              : 'border-gray-700/40 bg-gray-800/20 hover:border-gray-600/60'
                          }`}
                          style={isActive ? { borderColor: t.accent + '60', backgroundColor: t.accent + '15' } : {}}
                        >
                          <div className="text-base">{t.icon}</div>
                          <div className={`text-[10px] font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>{t.name}</div>
                          <div className="text-[10px] text-gray-500">{pts}/{max}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Tree Description */}
                  <div className="text-center text-[10px] text-gray-500 mb-3" style={{ color: tree.accent + 'aa' }}>
                    {tree.desc}
                  </div>

                  {/* Talent Nodes — WoW-style vertical layout */}
                  <div className="relative pb-4">
                    {tree.rows.map((row, rowIdx) => {
                      const locked = treePts < row.requiredPoints;
                      const treeAlloc = chibiAlloc[activeTree] || {};

                      return (
                        <div key={rowIdx}>
                          {/* Tier gate label */}
                          {row.requiredPoints > 0 && (
                            <div className="flex items-center gap-2 my-2">
                              <div className="flex-1 h-px bg-gray-700/40" />
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                locked ? 'text-gray-600 bg-gray-800/30' : 'bg-gray-800/40'
                              }`} style={!locked ? { color: tree.accent } : {}}>
                                {row.requiredPoints} pts requis
                              </span>
                              <div className="flex-1 h-px bg-gray-700/40" />
                            </div>
                          )}

                          {/* SVG connecting lines */}
                          {rowIdx > 0 && (
                            <div className="flex justify-center mb-1">
                              <div className={`w-0.5 h-4 ${locked ? 'bg-gray-700/30' : 'bg-gray-600/40'}`}
                                style={!locked ? { backgroundColor: tree.accent + '40' } : {}} />
                            </div>
                          )}

                          {/* Nodes Row */}
                          <div className="flex justify-center gap-3">
                            {row.nodes.map(node => {
                              const rank = treeAlloc[node.id] || 0;
                              const isMaxed = rank >= node.maxRank;
                              const canUpgrade = !locked && rank < node.maxRank && availTP > 0 && treePts >= row.requiredPoints;
                              const isCapstone = node.capstone;
                              const desc = rank > 0 ? getNodeDesc(node, rank) : getNodeDesc(node, 1);

                              return (
                                <button
                                  key={node.id}
                                  onClick={() => canUpgrade && allocateTalentPoint(id, activeTree, node.id)}
                                  disabled={!canUpgrade}
                                  className={`relative w-full max-w-[140px] p-2 rounded-xl border transition-all text-center ${
                                    isMaxed ? 'border-yellow-500/50 bg-yellow-500/5' :
                                    canUpgrade ? 'border-amber-400/50 bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer' :
                                    locked ? 'border-gray-800/30 bg-gray-900/20 opacity-30' :
                                    'border-gray-700/30 bg-gray-800/20 opacity-50'
                                  }`}
                                  style={
                                    isMaxed ? { borderColor: tree.accent + '60', boxShadow: `0 0 12px ${tree.accent}30` } :
                                    canUpgrade ? { animation: 'nodePulse 2s ease-in-out infinite' } : {}
                                  }
                                >
                                  {/* Capstone special border */}
                                  {isCapstone && isMaxed && (
                                    <div className="absolute inset-0 rounded-xl border-2 pointer-events-none"
                                      style={{ borderColor: tree.accent + '80', boxShadow: `0 0 20px ${tree.accent}40, inset 0 0 12px ${tree.accent}15` }} />
                                  )}

                                  <div className="text-xl mb-0.5">{node.icon}</div>
                                  <div className={`text-[10px] font-bold ${isMaxed ? 'text-white' : locked ? 'text-gray-600' : 'text-gray-300'}`}>
                                    {node.name}
                                  </div>

                                  {/* Rank dots */}
                                  <div className="flex justify-center gap-0.5 mt-1">
                                    {Array.from({ length: node.maxRank }).map((_, i) => (
                                      <div
                                        key={i}
                                        className={`w-1.5 h-1.5 rounded-full ${i < rank ? 'bg-yellow-400' : 'bg-gray-700'}`}
                                        style={i < rank ? { backgroundColor: tree.accent, boxShadow: `0 0 4px ${tree.accent}60` } : {}}
                                      />
                                    ))}
                                  </div>

                                  <div className="text-[10px] mt-1" style={{ color: isMaxed ? tree.accent : rank > 0 ? '#9CA3AF' : '#6B7280' }}>
                                    {rank}/{node.maxRank}
                                  </div>

                                  {/* Description */}
                                  <div className={`text-[9px] mt-0.5 ${rank > 0 ? 'text-gray-300' : 'text-gray-500'}`}>
                                    {desc}
                                  </div>

                                  {/* Locked icon */}
                                  {locked && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
                                      <span className="text-lg">{'\uD83D\uDD12'}</span>
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}

            {/* ═══ TALENT II — Graph View ═══ */}
            {talentTab === 2 && t2Unlocked && (() => {
              const t2Alloc = getChibiTalent2Alloc(id);
              const allNodes = getAllTalent2Nodes();
              const connections = getTalent2Connections();
              // Grid unit = 40px, center at (300, 340)
              const UNIT = 40;
              const CX = 300;
              const CY = 340;
              const toX = (gx) => CX + gx * UNIT;
              const toY = (gy) => CY + gy * UNIT;

              return (
                <>
                  {/* Branch legend */}
                  <div className="flex flex-wrap justify-center gap-2 mb-3">
                    {Object.values(TALENT2_BRANCHES).map(br => (
                      <div key={br.id} className="flex items-center gap-1 text-[9px]" style={{ color: br.color }}>
                        <span>{br.icon}</span> <span>{br.name}</span>
                        <span className="text-gray-500">({getBranchPts(br.id, t2Alloc)}/{Object.values(br.nodes).reduce((s, n) => s + n.maxRank, 0)})</span>
                      </div>
                    ))}
                  </div>

                  {/* Graph container */}
                  <div className="relative overflow-auto rounded-xl border border-gray-700/30 bg-[#0a0a14]" style={{ height: 720 }}>
                    <svg width={600} height={700} className="absolute inset-0">
                      {/* Grid dots */}
                      {Array.from({ length: 15 }).map((_, gx) =>
                        Array.from({ length: 18 }).map((_, gy) => (
                          <circle key={`g${gx}_${gy}`} cx={gx * UNIT} cy={gy * UNIT} r={1} fill="rgba(255,255,255,0.03)" />
                        ))
                      )}
                      {/* Connections */}
                      {connections.map((conn, i) => {
                        const fromNode = allNodes[conn.from];
                        const toNode = allNodes[conn.to];
                        if (!fromNode || !toNode) return null;
                        const fromAllocated = (t2Alloc[conn.from] || 0) > 0;
                        const toAllocated = (t2Alloc[conn.to] || 0) > 0;
                        const active = fromAllocated;
                        return (
                          <line
                            key={i}
                            x1={toX(fromNode.pos.x)} y1={toY(fromNode.pos.y)}
                            x2={toX(toNode.pos.x)} y2={toY(toNode.pos.y)}
                            stroke={active ? conn.branchColor : '#333'}
                            strokeWidth={active ? 2 : 1}
                            strokeOpacity={active ? 0.7 : 0.2}
                            strokeDasharray={active ? 'none' : '4 4'}
                          />
                        );
                      })}
                    </svg>

                    {/* Root Node */}
                    {(() => {
                      const rk = t2Alloc.root || 0;
                      const canUp = canAllocT2(id, 'root');
                      return (
                        <button
                          onClick={() => canUp && allocateTalent2Point(id, 'root')}
                          className="absolute z-10 flex flex-col items-center justify-center rounded-full border-2 transition-all"
                          style={{
                            left: toX(0) - 28, top: toY(0) - 28, width: 56, height: 56,
                            borderColor: rk > 0 ? '#EAB308' : canUp ? '#EAB30880' : '#444',
                            backgroundColor: rk > 0 ? 'rgba(234,179,8,0.15)' : 'rgba(30,30,40,0.8)',
                            boxShadow: rk > 0 ? '0 0 20px rgba(234,179,8,0.3)' : 'none',
                            cursor: canUp ? 'pointer' : 'default',
                          }}
                        >
                          <span className="text-lg">{TALENT2_ROOT.icon}</span>
                          <span className="text-[8px] text-gray-400">{rk}/{TALENT2_ROOT.maxRank}</span>
                        </button>
                      );
                    })()}

                    {/* Branch Nodes */}
                    {Object.values(TALENT2_BRANCHES).map(branch =>
                      Object.entries(branch.nodes).map(([nodeId, node]) => {
                        const rk = t2Alloc[nodeId] || 0;
                        const isMaxed = rk >= node.maxRank;
                        const canUp = canAllocT2(id, nodeId);
                        const isCapstone = node.capstone;
                        const nodeSize = isCapstone ? 52 : 44;
                        const half = nodeSize / 2;

                        return (
                          <button
                            key={nodeId}
                            onClick={() => canUp && allocateTalent2Point(id, nodeId)}
                            className="absolute z-10 flex flex-col items-center justify-center transition-all group"
                            style={{
                              left: toX(node.pos.x) - half, top: toY(node.pos.y) - half,
                              width: nodeSize, height: nodeSize,
                              borderRadius: isCapstone ? '12px' : '50%',
                              border: `2px solid ${isMaxed ? branch.color : canUp ? branch.color + '80' : '#444'}`,
                              backgroundColor: isMaxed ? branch.color + '20' : rk > 0 ? branch.color + '10' : 'rgba(20,20,30,0.8)',
                              boxShadow: isMaxed ? `0 0 16px ${branch.color}40` : canUp ? `0 0 8px ${branch.color}20` : 'none',
                              cursor: canUp ? 'pointer' : 'default',
                              animation: canUp ? 'nodePulse 2s ease-in-out infinite' : 'none',
                            }}
                            title={`${node.name}\n${node.desc}\n${rk}/${node.maxRank}`}
                          >
                            <span className="text-sm leading-none">{node.icon}</span>
                            <span className="text-[7px] leading-none mt-0.5" style={{ color: isMaxed ? branch.color : '#888' }}>
                              {rk}/{node.maxRank}
                            </span>

                            {/* Tooltip on hover */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 pointer-events-none">
                              <div className="bg-gray-900/95 border border-gray-600/50 rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-xl">
                                <div className="text-[10px] font-bold text-white">{node.name}</div>
                                <div className="text-[9px] text-gray-300 mt-0.5">{node.desc}</div>
                                {node.requiredBranchPts && (
                                  <div className="text-[8px] mt-0.5" style={{ color: branch.color }}>
                                    Requis: {node.requiredBranchPts} pts dans {branch.name}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Lock overlay */}
                            {rk === 0 && !canUp && (
                              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40" style={{ borderRadius: isCapstone ? '12px' : '50%' }}>
                                <span className="text-[10px]">{'\uD83D\uDD12'}</span>
                              </div>
                            )}
                          </button>
                        );
                      })
                    )}

                    {/* Branch Labels */}
                    {Object.values(TALENT2_BRANCHES).map(branch => {
                      const positions = { weapons: { x: -5, y: 0 }, elements: { x: 5, y: 0 }, titan: { x: 0, y: -6 }, reaper: { x: 0, y: 6 } };
                      const p = positions[branch.id] || { x: 0, y: 0 };
                      return (
                        <div
                          key={branch.id + '_label'}
                          className="absolute text-[8px] font-bold text-center pointer-events-none"
                          style={{ left: toX(p.x) - 40, top: toY(p.y) + 30, width: 80, color: branch.color + 'aa' }}
                        >
                          {branch.icon} {branch.name}
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}

            {/* Active Bonuses Summary */}
            {spentTP > 0 && (() => {
              const tb = getChibiTalentBonuses(id);
              const bonuses = [];
              if (tb.atkPercent > 0) bonuses.push({ label: 'ATK', value: `+${tb.atkPercent}%`, color: 'text-red-400' });
              if (tb.hpPercent > 0) bonuses.push({ label: 'PV', value: `+${tb.hpPercent}%`, color: 'text-green-400' });
              if (tb.defPercent > 0) bonuses.push({ label: 'DEF', value: `+${tb.defPercent}%`, color: 'text-blue-400' });
              if (tb.spdPercent > 0) bonuses.push({ label: 'SPD', value: `+${tb.spdPercent}%`, color: 'text-emerald-400' });
              if (tb.critRate > 0) bonuses.push({ label: 'Crit Rate', value: `+${tb.critRate}%`, color: 'text-yellow-400' });
              if (tb.critDamage > 0) bonuses.push({ label: 'Crit DMG', value: `+${tb.critDamage}%`, color: 'text-orange-400' });
              if (tb.resFlat > 0) bonuses.push({ label: 'RES', value: `+${tb.resFlat}%`, color: 'text-cyan-400' });
              if (tb.physicalDamage > 0) bonuses.push({ label: 'DMG Phys', value: `+${tb.physicalDamage}%`, color: 'text-red-300' });
              if (tb.elementalDamage > 0) bonuses.push({ label: 'DMG Elem', value: `+${tb.elementalDamage}%`, color: 'text-blue-300' });
              if (tb.elementalAdvantageBonus > 0) bonuses.push({ label: 'Bonus Elem', value: `+${tb.elementalAdvantageBonus}%`, color: 'text-purple-300' });
              if (tb.bossDamage > 0) bonuses.push({ label: 'DMG Boss', value: `+${tb.bossDamage}%`, color: 'text-red-500' });
              if (tb.cooldownReduction > 0) bonuses.push({ label: 'CD', value: `-${tb.cooldownReduction}`, color: 'text-sky-400' });
              if (tb.regenPerTurn > 0) bonuses.push({ label: 'Regen', value: `+${tb.regenPerTurn}%/t`, color: 'text-green-300' });
              if (tb.counterChance > 0) bonuses.push({ label: 'Riposte', value: `${tb.counterChance}%`, color: 'text-amber-400' });
              if (tb.defPen > 0) bonuses.push({ label: 'DEF Pen', value: `+${tb.defPen}%`, color: 'text-pink-400' });
              if (tb.executionDmg > 0) bonuses.push({ label: 'Execution', value: `+${tb.executionDmg}%`, color: 'text-yellow-500' });
              if (tb.hasBerserk) bonuses.push({ label: 'Berserk', value: '\u2713', color: 'text-red-400' });
              if (tb.hasTranscendance) bonuses.push({ label: 'Transcendance', value: '\u2713', color: 'text-blue-400' });
              if (tb.hasImmortel) bonuses.push({ label: 'Immortel', value: '\u2713', color: 'text-green-400' });
              if (tb.hasColossus) bonuses.push({ label: 'Colossus', value: '\u2713', color: 'text-emerald-400' });
              if (tb.masterWeapons) bonuses.push({ label: "Maitre d'Armes", value: '\u2713', color: 'text-orange-400' });
              if (tb.convergenceAll) bonuses.push({ label: 'Convergence', value: '\u2713', color: 'text-purple-400' });
              if (tb.critDefIgnore) bonuses.push({ label: 'Ange de la Mort', value: '\u2713', color: 'text-yellow-400' });

              if (bonuses.length === 0) return null;
              return (
                <div className="mt-2 p-2 rounded-lg bg-gray-800/20 border border-gray-700/20">
                  <div className="text-[10px] text-gray-500 mb-1.5 text-center">Bonus actifs (I + II)</div>
                  <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[9px]">
                    {bonuses.map(b => (
                      <span key={b.label}>
                        <span className={b.color}>{b.label}</span> <span className="text-white">{b.value}</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Respec Button */}
            <div className="mt-4 text-center">
              <button
                onClick={() => resetTalents(id)}
                disabled={spentTP === 0}
                className="text-xs text-gray-500 hover:text-red-400 disabled:opacity-30 transition-colors py-2"
              >
                Reinitialiser TOUS les talents {getRespecCost(id) > 0 ? `(${getRespecCost(id)} coins)` : '(gratuit)'}
              </button>
            </div>
          </div>
        );
      })()}

      {/* ═══ EQUIPMENT VIEW ═══ */}
      {view === 'equipment' && manageTarget && (() => {
        const id = manageTarget;
        const c = getChibiData(id);
        if (!c) return null;
        const { level } = getChibiLevel(id);
        const equipped = data.artifacts[id] || {};
        const weaponId = data.weapons[id] || null;
        const weapon = weaponId ? WEAPONS[weaponId] : null;
        const activeSets = getActiveSetBonuses(equipped);
        const evStars = getChibiEveilStars(id);

        const equipArtifact = (art) => {
          setData(prev => {
            const prevEquipped = { ...(prev.artifacts[id] || {}) };
            const prevInv = [...prev.artifactInventory];
            // Unequip current in same slot → back to inventory
            if (prevEquipped[art.slot]) prevInv.push(prevEquipped[art.slot]);
            // Remove from inventory
            const idx = prevInv.findIndex(a => a.uid === art.uid);
            if (idx !== -1) prevInv.splice(idx, 1);
            prevEquipped[art.slot] = art;
            return { ...prev, artifacts: { ...prev.artifacts, [id]: prevEquipped }, artifactInventory: prevInv };
          });
        };

        const unequipArtifact = (slot) => {
          setData(prev => {
            const prevEquipped = { ...(prev.artifacts[id] || {}) };
            if (!prevEquipped[slot]) return prev;
            const prevInv = [...prev.artifactInventory, prevEquipped[slot]];
            delete prevEquipped[slot];
            return { ...prev, artifacts: { ...prev.artifacts, [id]: prevEquipped }, artifactInventory: prevInv };
          });
        };

        const equipWeapon = (wId) => {
          setData(prev => {
            if (prev.weaponCollection[wId] === undefined) return prev;
            const equippedElsewhere = Object.entries(prev.weapons).some(([cId, eqW]) => eqW === wId && cId !== id);
            if (equippedElsewhere) return prev;
            return { ...prev, weapons: { ...prev.weapons, [id]: wId } };
          });
        };

        const unequipWeapon = () => {
          setData(prev => {
            if (!prev.weapons[id]) return prev;
            return { ...prev, weapons: { ...prev.weapons, [id]: null } };
          });
        };

        return (
          <div className="max-w-2xl mx-auto px-4 pt-4">

            {/* Header */}
            <div className="text-center mb-4">
              <img src={getChibiSprite(id)} alt={c.name} className="w-14 h-14 mx-auto object-contain" style={{ filter: RARITY[c.rarity].glow }} />
              <h2 className="text-lg font-black mt-2">{c.name}</h2>
              <div className="text-[10px] text-gray-400">
                Lv{level} {RARITY[c.rarity].stars} {ELEMENTS[c.element].icon}
                {evStars > 0 && <span className="ml-1 text-yellow-400">{Array.from({ length: evStars }).map(() => '\u2605').join('')}</span>}
              </div>
            </div>

            {/* Weapon Slot */}
            <div className="mb-4">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">{'\u2694\uFE0F'} Arme</div>
              {weapon ? (() => {
                const wAw = data.weaponCollection[weaponId] || 0;
                return (
                <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 cursor-pointer" onClick={() => setWeaponDetailId(weaponId)}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{weapon.icon}</span>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-amber-300">{weapon.name} <span className="text-yellow-400 text-[10px]">A{wAw}</span> <span className="text-amber-400/70 text-[9px]">iLv{computeWeaponILevel(weaponId, wAw)}</span></div>
                      <div className="text-[9px] text-gray-400">
                        ATK +{weapon.atk} | {MAIN_STAT_VALUES[weapon.bonusStat]?.name || weapon.bonusStat} +{weapon.bonusValue}
                      </div>
                      <div className="text-[10px] text-gray-500">{weapon.desc}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); unequipWeapon(); }} className="text-[9px] px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30">Retirer</button>
                  </div>
                </div>
                );
              })() : (
                <div className="p-2.5 rounded-xl border border-gray-700/30 bg-gray-800/20 text-center text-[10px] text-gray-500">
                  Aucune arme equipee
                </div>
              )}
              {/* Available weapons from collection */}
              {(() => {
                const equippedSet = new Set(Object.values(data.weapons).filter(Boolean));
                const available = Object.keys(data.weaponCollection).filter(wId => wId !== weaponId && !equippedSet.has(wId));
                if (available.length === 0) return null;
                return (
                <div className="mt-2 space-y-1">
                  <div className="text-[9px] text-gray-500">Armes disponibles :</div>
                  {available.map(wId => {
                    const w = WEAPONS[wId];
                    if (!w) return null;
                    const wAw = data.weaponCollection[wId] || 0;
                    return (
                      <button key={wId} onClick={() => equipWeapon(wId)}
                        className="w-full flex items-center gap-2 p-1.5 rounded-lg border border-gray-700/30 bg-gray-800/20 hover:border-amber-500/40 transition-all text-left">
                        <span>{w.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-bold text-gray-300 truncate">{w.name} <span className="text-yellow-400">A{wAw}</span> <span className="text-amber-400/70 text-[9px]">iLv{computeWeaponILevel(wId, wAw)}</span></div>
                          <div className="text-[10px] text-gray-500">ATK +{w.atk} | {MAIN_STAT_VALUES[w.bonusStat]?.name || w.bonusStat} +{w.bonusValue}</div>
                        </div>
                        <span className="text-[10px] text-cyan-400">Equiper</span>
                      </button>
                    );
                  })}
                </div>
                );
              })()}
            </div>

            {/* Artifact Slots */}
            <div className="mb-4">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">{'\uD83D\uDEE1\uFE0F'} Artefacts</div>
              <div className="grid grid-cols-4 gap-1.5">
                {SLOT_ORDER.map(slotId => {
                  const slotDef = ARTIFACT_SLOTS[slotId];
                  const art = equipped[slotId];
                  const setDef = art ? ARTIFACT_SETS[art.set] : null;
                  const mainDef = art ? MAIN_STAT_VALUES[art.mainStat] : null;
                  return (
                    <div key={slotId} className="text-center">
                      {art ? (
                        <button onClick={() => unequipArtifact(slotId)}
                          className={`w-full p-2 rounded-lg border ${setDef?.border || 'border-gray-600/30'} ${setDef?.bg || 'bg-gray-800/20'} hover:brightness-125 transition-all relative`}>
                          <div className="flex items-center justify-center gap-0.5">
                            <span className="text-sm">{slotDef.icon}</span>
                            <span className={`text-[9px] font-bold ${RARITY[art.rarity]?.color || 'text-gray-400'}`}>+{art.level}</span>
                          </div>
                          <div className="text-[8px] text-amber-400/70 font-bold">iLv{computeArtifactILevel(art)}</div>
                          <div className={`text-[10px] font-bold mt-0.5 ${setDef?.color || 'text-gray-300'}`}>{mainDef?.name || '?'}</div>
                          <div className="text-[10px] font-black text-white">{art.mainValue}</div>
                          <div className="mt-0.5 space-y-px">
                            {art.subs.slice(0, 2).map((sub, si) => {
                              const subDef = SUB_STAT_POOL.find(s => s.id === sub.id);
                              return <div key={si} className="text-[9px] text-gray-400 truncate">{subDef?.name || sub.id} +{sub.value}</div>;
                            })}
                            {art.subs.length > 2 && <div className="text-[9px] text-gray-500">+{art.subs.length - 2} subs</div>}
                          </div>
                          <div className={`absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${setDef?.border?.replace('border-', 'bg-').replace('/30', '') || 'bg-gray-500'}`} />
                        </button>
                      ) : (
                        <div className="w-full p-2 rounded-lg border border-gray-700/20 bg-gray-800/10">
                          <div className="text-lg opacity-30">{slotDef.icon}</div>
                          <div className="text-[9px] text-gray-600">{slotDef.name}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Set Bonuses */}
            {activeSets.length > 0 && (
              <div className="mb-4 p-2 rounded-lg bg-gray-800/20 border border-gray-700/20">
                <div className="text-[9px] text-gray-500 mb-1">Sets actifs :</div>
                {activeSets.map((s, i) => (
                  <div key={i} className="flex items-center gap-1 text-[9px] cursor-pointer hover:bg-white/5 rounded p-0.5 -m-0.5 transition-colors"
                    onClick={() => setArtifactSetDetail(s.set.id)}>
                    <span className={s.set.color}>{s.set.icon}</span>
                    <span className={`${s.set.color} underline decoration-dotted`}>{s.set.name}</span>
                    <span className="text-gray-500">({s.tier}p)</span>
                    <span className="text-green-400 ml-auto">{s.bonus}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Total Equipment Stats Summary */}
            {(() => {
              const eqB = getChibiEquipBonuses(id);
              const statLines = [
                { label: 'PV', flat: eqB.hp_flat, pct: (eqB.hp_pct || 0) + (eqB.hpPercent || 0), icon: '\u2764\uFE0F' },
                { label: 'ATK', flat: eqB.atk_flat, pct: (eqB.atk_pct || 0) + (eqB.atkPercent || 0), icon: '\u2694\uFE0F' },
                { label: 'DEF', flat: eqB.def_flat, pct: (eqB.def_pct || 0) + (eqB.defPercent || 0), icon: '\uD83D\uDEE1\uFE0F' },
                { label: 'SPD', flat: eqB.spd_flat, pct: (eqB.spd_pct || 0) + (eqB.spdPercent || 0), icon: '\uD83D\uDCA8' },
                { label: 'CRIT%', flat: (eqB.crit_rate || 0) + (eqB.critRate || 0), pct: 0, icon: '\uD83C\uDFAF' },
                { label: 'CRIT DMG%', flat: (eqB.crit_dmg || 0) + (eqB.critDamage || 0), pct: 0, icon: '\uD83D\uDCA5' },
                { label: 'RES', flat: eqB.res_flat, pct: 0, icon: '\uD83D\uDEE1\uFE0F' },
              ].filter(s => s.flat > 0 || s.pct > 0);
              const specialLines = [
                eqB.fireDamage > 0 && { label: 'Degats Feu', value: `+${eqB.fireDamage}%`, color: 'text-orange-400' },
                eqB.waterDamage > 0 && { label: 'Degats Eau', value: `+${eqB.waterDamage}%`, color: 'text-cyan-400' },
                eqB.shadowDamage > 0 && { label: 'Degats Ombre', value: `+${eqB.shadowDamage}%`, color: 'text-purple-400' },
                eqB.allDamage > 0 && { label: 'Tous Degats', value: `+${eqB.allDamage}%`, color: 'text-emerald-400' },
                eqB.healBonus > 0 && { label: 'Soins', value: `+${eqB.healBonus}%`, color: 'text-green-400' },
                eqB.defPen > 0 && { label: 'DEF PEN', value: `+${eqB.defPen}%`, color: 'text-yellow-300' },
              ].filter(Boolean);
              if (statLines.length === 0 && specialLines.length === 0) return null;
              return (
                <div className="mb-4 p-2.5 rounded-xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/30">
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">{'\uD83D\uDCCA'} Bonus totaux d'equipement</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {statLines.map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-[9px]">
                        <span className="text-gray-400">{s.icon} {s.label}</span>
                        <span className="text-green-400 font-bold">
                          {s.flat > 0 && `+${Number.isInteger(s.flat) ? s.flat : s.flat.toFixed(1)}`}
                          {s.flat > 0 && s.pct > 0 && ' '}
                          {s.pct > 0 && <span className="text-emerald-300">+{s.pct.toFixed(1)}%</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                  {specialLines.length > 0 && (
                    <div className="mt-1.5 pt-1.5 border-t border-gray-700/20 grid grid-cols-2 gap-x-4 gap-y-1">
                      {specialLines.map((s, i) => (
                        <div key={i} className="flex items-center justify-between text-[9px]">
                          <span className="text-gray-400">{s.label}</span>
                          <span className={`font-bold ${s.color}`}>{s.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Artifact Inventory */}
            <div className="mb-4">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">
                Inventaire ({data.artifactInventory.length})
              </div>
              {data.artifactInventory.length === 0 ? (
                <div className="text-center text-[10px] text-gray-600 py-4">Aucun artefact. Forge-en dans la Boutique !</div>
              ) : (
                <div className="grid grid-cols-2 gap-1.5 max-h-72 overflow-y-auto">
                  {data.artifactInventory.map((art, i) => {
                    const setDef = ARTIFACT_SETS[art.set];
                    const slotDef = ARTIFACT_SLOTS[art.slot];
                    const mainDef = MAIN_STAT_VALUES[art.mainStat];
                    return (
                      <button key={art.uid || i} onClick={() => equipArtifact(art)}
                        className={`p-2 rounded-lg border ${setDef?.border || 'border-gray-600/30'} ${setDef?.bg || 'bg-gray-800/20'} hover:brightness-125 transition-all text-left`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-sm">{slotDef?.icon || '?'}</span>
                            <span className={`text-[10px] font-bold truncate ${setDef?.color || 'text-gray-300'}`}>{setDef?.name?.split(' ')[0] || '?'}</span>
                          </div>
                          <span className={`text-[9px] font-bold ${RARITY[art.rarity]?.color || 'text-gray-400'}`}>+{art.level}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[9px] text-gray-300 font-bold">{mainDef?.icon} {mainDef?.name || '?'}</span>
                          <span className="text-[10px] font-black text-white ml-auto">+{art.mainValue}</span>
                        </div>
                        {art.subs.length > 0 && (
                          <div className="mt-1 pt-1 border-t border-gray-700/20 space-y-px">
                            {art.subs.map((sub, si) => {
                              const subDef = SUB_STAT_POOL.find(s => s.id === sub.id);
                              return <div key={si} className="text-[9px] text-gray-500">{subDef?.name || sub.id} +{sub.value}</div>;
                            })}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sell artifacts */}
            {data.artifactInventory.length > 0 && (
              <button
                onClick={() => {
                  const worst = [...data.artifactInventory].sort((a, b) => a.level - b.level)[0];
                  if (!worst) return;
                  const sellPrice = Math.floor(FORGE_COSTS[worst.rarity] * SELL_RATIO);
                  shadowCoinManager.addCoins(sellPrice, 'artifact_sell');
                  setData(prev => ({
                    ...prev,
                    artifactInventory: prev.artifactInventory.filter(a => a.uid !== worst.uid),
                  }));
                }}
                className="w-full text-center text-[10px] text-gray-500 hover:text-yellow-400 transition-colors py-2"
              >
                Vendre le pire artefact ({Math.floor(FORGE_COSTS[([...data.artifactInventory].sort((a, b) => a.level - b.level)[0])?.rarity] * SELL_RATIO || 0)} coins)
              </button>
            )}
          </div>
        );
      })()}

      {/* ═══ SHOP VIEW ═══ */}
      {view === 'shop' && (() => {
        const coins = shadowCoinManager.getBalance();
        const hammers = data.hammers || { marteau_forge: 0, marteau_runique: 0, marteau_celeste: 0 };

        const forgeArtifact = (rarity) => {
          const cost = FORGE_COSTS[rarity];
          if (coins < cost) return;
          shadowCoinManager.spendCoins(cost);
          const art = generateArtifact(rarity);
          setData(prev => ({ ...prev, artifactInventory: [...prev.artifactInventory, art] }));
        };

        const buyWeapon = (wId) => {
          const w = WEAPONS[wId];
          if (!w) return;
          const price = WEAPON_PRICES[w.rarity];
          if (coins < price) return;
          const currentAw = data.weaponCollection[wId];
          if (currentAw !== undefined && currentAw >= MAX_WEAPON_AWAKENING) return;
          shadowCoinManager.spendCoins(price);
          setData(prev => {
            const wc = { ...prev.weaponCollection };
            if (wc[wId] !== undefined) wc[wId] = Math.min(wc[wId] + 1, MAX_WEAPON_AWAKENING);
            else wc[wId] = 0;
            return { ...prev, weaponCollection: wc };
          });
        };

        const buyHammer = (hId) => {
          const h = HAMMERS[hId];
          if (!h || coins < h.shopPrice) return;
          shadowCoinManager.spendCoins(h.shopPrice);
          setData(prev => {
            const newH = { ...(prev.hammers || { marteau_forge: 0, marteau_runique: 0, marteau_celeste: 0 }) };
            newH[hId] = (newH[hId] || 0) + 1;
            return { ...prev, hammers: newH };
          });
        };

        const ownedWeapons = data.weaponCollection;

        return (
          <div className="max-w-2xl mx-auto px-4 pt-4">

            <div className="text-center mb-5">
              <h2 className="text-xl font-black bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">Boutique</h2>
              <div className="text-sm text-yellow-400 font-bold mt-1">{'\uD83D\uDCB0'} {coins} Shadow Coins</div>
            </div>

            {/* Hammer Inventory */}
            <div className="mb-4 p-2.5 rounded-xl bg-gray-800/20 border border-gray-700/20">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">{'\uD83D\uDD28'} Tes Marteaux</div>
              <div className="flex justify-center gap-4">
                {HAMMER_ORDER.map(hId => {
                  const h = HAMMERS[hId];
                  const count = hammers[hId] || 0;
                  return (
                    <div key={hId} className="text-center">
                      <div className="text-xl">{h.icon}</div>
                      <div className="text-[9px] text-gray-400">{h.name.split(' ').pop()}</div>
                      <div className={`text-sm font-bold ${count > 0 ? 'text-amber-400' : 'text-gray-600'}`}>{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Buy Hammers */}
            <div className="mb-5">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">{'\uD83D\uDEE0\uFE0F'} Acheter des Marteaux</div>
              <div className="grid grid-cols-3 gap-2">
                {HAMMER_ORDER.map(hId => {
                  const h = HAMMERS[hId];
                  return (
                    <button key={hId} onClick={() => buyHammer(hId)} disabled={coins < h.shopPrice}
                      className="p-2 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/15 disabled:opacity-30 transition-all text-center">
                      <div className="text-lg">{h.icon}</div>
                      <div className="text-[9px] font-bold text-amber-300">{h.name.replace('Marteau ', '')}</div>
                      <div className="text-[10px] text-gray-500">Lv0-{h.maxLevel}</div>
                      <div className="text-[9px] text-amber-400 mt-0.5">{h.shopPrice} coins</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Forge Section */}
            <div className="mb-5">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">{'\uD83D\uDD2E'} Forge d'Artefacts</div>
              <div className="grid grid-cols-3 gap-2">
                {[{ rarity: 'rare', color: 'blue', label: 'Rare' }, { rarity: 'legendaire', color: 'purple', label: 'Legendaire' }, { rarity: 'mythique', color: 'amber', label: 'Mythique' }].map(({ rarity, color, label }) => (
                  <button key={rarity} onClick={() => forgeArtifact(rarity)} disabled={coins < FORGE_COSTS[rarity]}
                    className={`p-2.5 rounded-xl border border-${color}-500/30 bg-${color}-500/5 hover:bg-${color}-500/15 disabled:opacity-30 transition-all text-center`}>
                    <div className="text-lg">{'\uD83D\uDD2E'}</div>
                    <div className={`text-[10px] font-bold text-${color}-400`}>{label}</div>
                    <div className="text-[9px] text-gray-400 mt-0.5">{FORGE_COSTS[rarity]} coins</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Armory Section */}
            <div className="mb-5">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">{'\u2694\uFE0F'} Armurerie</div>
              <div className="grid grid-cols-2 gap-1.5 max-h-72 overflow-y-auto">
                {Object.values(WEAPONS).filter(w => !w.secret).map(w => {
                  const aw = ownedWeapons[w.id];
                  const owned = aw !== undefined;
                  const maxed = owned && aw >= MAX_WEAPON_AWAKENING;
                  const price = WEAPON_PRICES[w.rarity];
                  return (
                    <button key={w.id} onClick={() => !maxed && buyWeapon(w.id)} disabled={maxed || coins < price}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        maxed ? 'border-yellow-500/30 bg-yellow-500/5 opacity-60' :
                        owned ? 'border-green-500/30 bg-green-500/5 hover:border-amber-500/40' :
                        coins >= price ? 'border-gray-700/40 bg-gray-800/20 hover:border-amber-500/40' :
                        'border-gray-800/20 bg-gray-900/10 opacity-30'
                      }`}>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{w.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-bold text-gray-200 truncate">{w.name}
                            {owned && <span className="text-yellow-400 ml-1">A{aw}</span>}
                            <span className="text-amber-400/60 ml-1">iLv{computeWeaponILevel(w.id, aw || 0)}</span>
                          </div>
                          <div className="text-[10px] text-gray-500">ATK +{w.atk} | {MAIN_STAT_VALUES[w.bonusStat]?.name || w.bonusStat} +{w.bonusValue}</div>
                          {w.element && <div className={`text-[9px] ${ELEMENTS[w.element]?.color || 'text-gray-400'}`}>{ELEMENTS[w.element]?.icon} {w.element}</div>}
                        </div>
                        <span onClick={(e) => { e.stopPropagation(); setWeaponDetailId(w.id); }} className="text-xs text-blue-400 cursor-pointer hover:text-blue-300">{'i'}</span>
                      </div>
                      <div className="mt-1 text-[9px] text-right">
                        {maxed ? <span className="text-yellow-400">MAX A{MAX_WEAPON_AWAKENING}</span> :
                         owned ? <span className="text-amber-400">Eveil A{aw+1} - {price} coins</span> :
                         <span className="text-amber-400">{price} coins</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Artifacts link */}
            <div className="mb-4 text-center">
              <button onClick={() => { setView('artifacts'); setArtSelected(null); setArtFilter({ set: null, rarity: null, slot: null }); }}
                className="text-[10px] text-purple-400 hover:text-purple-300 underline">
                {'\uD83D\uDC8E'} Gerer et ameliorer tes artefacts
              </button>
            </div>
          </div>
        );
      })()}

      {/* ═══ ARTIFACTS VIEW ═══ */}
      {view === 'artifacts' && (() => {
        const coins = shadowCoinManager.getBalance();
        const hammers = data.hammers || { marteau_forge: 0, marteau_runique: 0, marteau_celeste: 0 };
        const inv = data.artifactInventory || [];

        // Collect all sets present in inventory + equipped for filter options
        const allSetsInUse = new Set();
        inv.forEach(a => allSetsInUse.add(a.set));
        Object.values(data.artifacts || {}).forEach(slots => {
          if (slots) Object.values(slots).forEach(a => { if (a) allSetsInUse.add(a.set); });
        });

        // Filter inventory
        const filtered = inv.map((art, idx) => ({ art, idx })).filter(({ art }) => {
          if (artFilter.set && art.set !== artFilter.set) return false;
          if (artFilter.rarity && art.rarity !== artFilter.rarity) return false;
          if (artFilter.slot && art.slot !== artFilter.slot) return false;
          return true;
        });

        // Get selected artifact
        const getSelectedArt = () => {
          if (artSelected === null) return null;
          if (typeof artSelected === 'string' && artSelected.startsWith('eq:')) {
            const [, cId, sId] = artSelected.split(':');
            return data.artifacts[cId]?.[sId] || null;
          }
          return inv[artSelected] || null;
        };
        const selArt = getSelectedArt();
        const isEquipped = typeof artSelected === 'string' && artSelected.startsWith('eq:');

        // Enhancement logic
        const coinCost = selArt ? ENHANCE_COST(selArt.level) : 0;
        const validHammers = selArt ? getRequiredHammer(selArt.level) : [];
        const bestHammer = validHammers.find(hId => (hammers[hId] || 0) > 0) || null;
        const canEnhance = selArt && selArt.level < MAX_ARTIFACT_LEVEL && coins >= coinCost && bestHammer;
        const isMilestone = selArt ? (selArt.level + 1) % 5 === 0 : false;

        const doEnhance = () => {
          if (!canEnhance) return;
          shadowCoinManager.spendCoins(coinCost);
          setData(prev => {
            const newH = { ...(prev.hammers || {}) };
            newH[bestHammer] = Math.max(0, (newH[bestHammer] || 0) - 1);
            if (isEquipped) {
              const [, cId, sId] = artSelected.split(':');
              const newArts = { ...prev.artifacts };
              newArts[cId] = { ...newArts[cId], [sId]: enhanceArtifact(newArts[cId][sId]) };
              return { ...prev, artifacts: newArts, hammers: newH };
            } else {
              const newInv = [...prev.artifactInventory];
              newInv[artSelected] = enhanceArtifact(newInv[artSelected]);
              return { ...prev, artifactInventory: newInv, hammers: newH };
            }
          });
        };

        const doSell = () => {
          if (!selArt || isEquipped) return;
          const sellPrice = Math.floor((FORGE_COSTS[selArt.rarity] || 200) * SELL_RATIO);
          shadowCoinManager.addCoins(sellPrice, 'artifact_sell');
          setData(prev => {
            const newInv = [...prev.artifactInventory];
            newInv.splice(artSelected, 1);
            return { ...prev, artifactInventory: newInv };
          });
          setArtSelected(null);
        };

        const doEquip = (chibiId) => {
          if (!selArt || isEquipped) return;
          const slot = selArt.slot;
          setData(prev => {
            const newInv = [...prev.artifactInventory];
            newInv.splice(artSelected, 1);
            const newArts = { ...prev.artifacts };
            if (!newArts[chibiId]) newArts[chibiId] = {};
            // If slot already occupied, move old artifact back to inventory
            if (newArts[chibiId][slot]) newInv.push(newArts[chibiId][slot]);
            newArts[chibiId] = { ...newArts[chibiId], [slot]: selArt };
            return { ...prev, artifactInventory: newInv, artifacts: newArts };
          });
          setArtSelected(null);
          setArtEquipPicker(false);
        };

        const doUnequip = () => {
          if (!selArt || !isEquipped) return;
          const [, cId, sId] = artSelected.split(':');
          setData(prev => {
            const newArts = { ...prev.artifacts };
            const art = newArts[cId]?.[sId];
            if (!art) return prev;
            const newSlots = { ...newArts[cId] };
            delete newSlots[sId];
            newArts[cId] = newSlots;
            return { ...prev, artifacts: newArts, artifactInventory: [...prev.artifactInventory, art] };
          });
          setArtSelected(null);
        };

        // Equipped chibis list
        const equippedChibis = Object.entries(data.artifacts || {}).filter(([, slots]) => slots && Object.values(slots).some(Boolean));

        return (
          <div className="max-w-2xl mx-auto px-4 pt-4 pb-16">

            {/* Header */}
            <div className="text-center mb-4">
              <h2 className="text-xl font-black bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">{'\uD83D\uDC8E'} Artefacts</h2>
              <div className="text-xs text-gray-400 mt-0.5">{inv.length} en inventaire</div>
            </div>

            {/* Filters */}
            <div className="mb-4 space-y-2">
              {/* Rarity filter */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] text-gray-500 w-10">Rarete</span>
                {['rare', 'legendaire', 'mythique'].map(r => (
                  <button key={r} onClick={() => setArtFilter(prev => ({ ...prev, rarity: prev.rarity === r ? null : r }))}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                      artFilter.rarity === r ? `${RARITY[r]?.color || 'text-white'} bg-white/10 ring-1 ring-current` : 'text-gray-500 bg-gray-800/30 hover:bg-gray-700/30'
                    }`}>{r.charAt(0).toUpperCase() + r.slice(1)}</button>
                ))}
              </div>
              {/* Slot filter */}
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[9px] text-gray-500 w-10">Slot</span>
                {SLOT_ORDER.map(sId => (
                  <button key={sId} onClick={() => setArtFilter(prev => ({ ...prev, slot: prev.slot === sId ? null : sId }))}
                    className={`px-1.5 py-0.5 rounded text-[10px] transition-all ${
                      artFilter.slot === sId ? 'text-purple-300 bg-purple-500/15 ring-1 ring-purple-400/50' : 'text-gray-500 bg-gray-800/30 hover:bg-gray-700/30'
                    }`}>{ARTIFACT_SLOTS[sId]?.icon}</button>
                ))}
              </div>
              {/* Set filter */}
              {allSetsInUse.size > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[9px] text-gray-500 w-10">Set</span>
                  {[...allSetsInUse].map(setId => {
                    const s = ALL_ARTIFACT_SETS[setId];
                    if (!s) return null;
                    return (
                      <button key={setId} onClick={() => setArtFilter(prev => ({ ...prev, set: prev.set === setId ? null : setId }))}
                        className={`px-1.5 py-0.5 rounded text-[10px] transition-all ${
                          artFilter.set === setId ? `${s.color} ${s.bg} ring-1 ring-current` : 'text-gray-500 bg-gray-800/30 hover:bg-gray-700/30'
                        }`}>{s.icon} {s.name.split(' ')[0]}</button>
                    );
                  })}
                </div>
              )}
              {(artFilter.set || artFilter.rarity || artFilter.slot) && (
                <button onClick={() => setArtFilter({ set: null, rarity: null, slot: null })}
                  className="text-[10px] text-red-400 hover:text-red-300">Reset filtres</button>
              )}
            </div>

            {/* Inventory Grid */}
            <div className="mb-5">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Inventaire ({filtered.length})</div>
              {filtered.length === 0 ? (
                <div className="text-center text-[10px] text-gray-600 py-4">
                  {inv.length === 0 ? "Aucun artefact. Forge-en dans la Boutique !" : "Aucun artefact ne correspond aux filtres."}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1.5 max-h-64 overflow-y-auto">
                  {filtered.map(({ art, idx }) => {
                    const setDef = ALL_ARTIFACT_SETS[art.set];
                    const mainDef = MAIN_STAT_VALUES[art.mainStat];
                    const selected = artSelected === idx;
                    return (
                      <button key={art.uid || idx} onClick={() => { setArtSelected(selected ? null : idx); setArtEquipPicker(false); }}
                        className={`p-1.5 rounded-lg border text-left transition-all ${
                          selected ? 'border-purple-400 bg-purple-500/15 ring-1 ring-purple-400/40' :
                          `${setDef?.border || 'border-gray-700/30'} ${setDef?.bg || 'bg-gray-800/10'} hover:border-gray-500/40`
                        }`}>
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="text-xs">{ARTIFACT_SLOTS[art.slot]?.icon}</span>
                          <span className={`text-[10px] font-bold truncate ${setDef?.color || 'text-gray-400'}`}>{setDef?.name?.split(' ')[0] || '?'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`text-[9px] ${RARITY[art.rarity]?.color || 'text-gray-400'}`}>{RARITY[art.rarity]?.stars || art.rarity}</span>
                          <span className="text-[8px] text-amber-400/70 font-bold ml-auto">iLv{computeArtifactILevel(art)}</span>
                        </div>
                        <div className="text-[10px] text-gray-300">{mainDef?.icon} {mainDef?.name}: +{art.mainValue}</div>
                        <div className="text-[9px] text-gray-500">Lv {art.level}/{MAX_ARTIFACT_LEVEL} | {art.subs.length} subs</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Equipped Section */}
            {equippedChibis.length > 0 && (
              <div className="mb-5">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">Equipes</div>
                {equippedChibis.map(([cId, slots]) => {
                  const chibi = getChibiData(cId);
                  if (!chibi) return null;
                  const filledCount = Object.values(slots).filter(Boolean).length;
                  return (
                    <div key={cId} className="mb-3 p-2 rounded-xl border border-gray-700/20 bg-gray-800/10">
                      <div className="flex items-center gap-2 mb-1.5">
                        <img src={getChibiSprite(cId)} alt="" className="w-8 h-8 object-contain" />
                        <span className="text-xs font-bold text-gray-200">{chibi.name}</span>
                        <span className="text-[10px] text-gray-500">{filledCount}/8</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {SLOT_ORDER.map(sId => {
                          const art = slots[sId];
                          const eqKey = `eq:${cId}:${sId}`;
                          const selected = artSelected === eqKey;
                          if (!art) return (
                            <div key={sId} className="p-1 rounded border border-dashed border-gray-700/20 text-center">
                              <div className="text-[10px] text-gray-700">{ARTIFACT_SLOTS[sId]?.icon}</div>
                              <div className="text-[8px] text-gray-700">vide</div>
                            </div>
                          );
                          const setDef = ALL_ARTIFACT_SETS[art.set];
                          return (
                            <button key={sId} onClick={() => { setArtSelected(selected ? null : eqKey); setArtEquipPicker(false); }}
                              className={`p-1 rounded-lg border text-center transition-all ${
                                selected ? 'border-purple-400 bg-purple-500/15' :
                                `${setDef?.border || 'border-gray-700/30'} ${setDef?.bg || 'bg-gray-800/10'} hover:border-gray-500/40`
                              }`}>
                              <div className="text-[10px]">{ARTIFACT_SLOTS[sId]?.icon}</div>
                              <div className={`text-[9px] font-bold truncate ${setDef?.color || 'text-gray-400'}`}>{setDef?.name?.split(' ')[0] || '?'}</div>
                              <div className="text-[9px] text-gray-500">Lv{art.level}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Detail Panel */}
            {selArt && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="p-3 rounded-xl border border-purple-500/30 bg-purple-500/5 mb-4">
                {/* Close */}
                <button onClick={() => { setArtSelected(null); setArtEquipPicker(false); }}
                  className="float-right text-gray-500 hover:text-gray-300 text-xs">{'\u2715'}</button>

                {/* Info */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{ARTIFACT_SLOTS[selArt.slot]?.icon}</span>
                  <div>
                    <div className={`text-sm font-bold ${ALL_ARTIFACT_SETS[selArt.set]?.color || 'text-gray-300'}`}>{ALL_ARTIFACT_SETS[selArt.set]?.name || '?'}</div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] ${RARITY[selArt.rarity]?.color}`}>{RARITY[selArt.rarity]?.stars} {selArt.rarity}</span>
                      <span className="text-[10px] text-gray-400">Lv {selArt.level}/{MAX_ARTIFACT_LEVEL}</span>
                      <span className="text-[10px] text-amber-400 font-bold">iLv {computeArtifactILevel(selArt)}</span>
                    </div>
                  </div>
                </div>
                {/* Stats */}
                <div className="mb-2 p-2 rounded-lg bg-gray-800/30 border border-gray-700/20">
                  {(() => {
                    const mainDef = MAIN_STAT_VALUES[selArt.mainStat];
                    const nextVal = selArt.level < MAX_ARTIFACT_LEVEL ? +(mainDef.base + mainDef.perLevel * (selArt.level + 1)).toFixed(1) : selArt.mainValue;
                    return (
                      <div className="text-xs text-gray-200 font-bold mb-1">
                        {mainDef?.icon} {mainDef?.name}: +{selArt.mainValue}
                        {selArt.level < MAX_ARTIFACT_LEVEL && <span className="text-green-400/60 ml-1">{'\u2192'} {nextVal}</span>}
                      </div>
                    );
                  })()}
                  {selArt.subs.map((sub, i) => {
                    const subDef = SUB_STAT_POOL.find(s => s.id === sub.id);
                    return (
                      <div key={i} className="text-[10px] text-gray-400">
                        {subDef?.name || sub.id}: +{sub.value}
                        {isMilestone && <span className="text-amber-400/50 ml-1">(chance {'\u2B06\uFE0F'})</span>}
                      </div>
                    );
                  })}
                  {isMilestone && <div className="text-[9px] text-amber-400 mt-1 font-bold">{'\u2B50'} Palier Lv{selArt.level + 1} — Boost sub-stat !</div>}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {!isEquipped && (
                    <button onClick={() => setArtEquipPicker(prev => !prev)}
                      className="flex-1 py-1.5 rounded-lg bg-indigo-600/30 text-indigo-300 text-[10px] font-bold hover:bg-indigo-600/50 transition-colors">
                      {'\u2694\uFE0F'} Equiper
                    </button>
                  )}
                  {isEquipped && (
                    <button onClick={doUnequip}
                      className="flex-1 py-1.5 rounded-lg bg-orange-600/30 text-orange-300 text-[10px] font-bold hover:bg-orange-600/50 transition-colors">
                      Desequiper
                    </button>
                  )}
                  <button onClick={doEnhance} disabled={!canEnhance}
                    className="flex-1 py-1.5 rounded-lg bg-cyan-600/30 text-cyan-300 text-[10px] font-bold hover:bg-cyan-600/50 disabled:opacity-30 transition-colors">
                    {'\uD83D\uDD28'} +1 ({bestHammer ? HAMMERS[bestHammer].icon : '?'} {coinCost}c)
                  </button>
                  {!isEquipped && (
                    <button onClick={doSell}
                      className="py-1.5 px-2 rounded-lg bg-red-600/20 text-red-400 text-[10px] font-bold hover:bg-red-600/40 transition-colors">
                      Vendre ({Math.floor((FORGE_COSTS[selArt.rarity] || 200) * SELL_RATIO)}c)
                    </button>
                  )}
                </div>

                {/* Enhancement details */}
                {selArt.level < MAX_ARTIFACT_LEVEL && (
                  <div className="mt-2 flex items-center gap-2 p-1.5 rounded-lg bg-gray-800/30 border border-gray-700/20 text-[9px] text-gray-400">
                    <span>Requis :</span>
                    {bestHammer ? (
                      <span className="text-amber-300">{HAMMERS[bestHammer].icon} {HAMMERS[bestHammer].name} (x1)</span>
                    ) : (
                      <span className="text-red-400">Pas de marteau !</span>
                    )}
                    <span className="ml-auto">{coinCost} coins</span>
                  </div>
                )}

                {/* Chibi Equip Picker */}
                {artEquipPicker && !isEquipped && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    className="mt-2 p-2 rounded-lg border border-indigo-500/30 bg-indigo-500/5">
                    <div className="text-[10px] text-indigo-300 font-bold mb-1.5">Equiper sur :</div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[...ownedIds, ...ownedHunterIds].map(id => {
                        const c = getChibiData(id);
                        if (!c) return null;
                        const currentSlotArt = data.artifacts[id]?.[selArt.slot];
                        return (
                          <button key={id} onClick={() => doEquip(id)}
                            className="p-1 rounded-lg border border-gray-700/30 bg-gray-800/20 hover:border-indigo-400/50 transition-all text-center">
                            <img src={getChibiSprite(id)} alt="" className="w-8 h-8 mx-auto object-contain" />
                            <div className="text-[9px] text-gray-300 truncate">{c.name.split(' ')[0]}</div>
                            {currentSlotArt && (
                              <div className="text-[8px] text-yellow-400">{ARTIFACT_SLOTS[selArt.slot]?.icon} Lv{currentSlotArt.level}</div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        );
      })()}

      {/* ═══ BATTLE VIEW ═══ */}
      {view === 'battle' && battle && (
        <div className="relative">
          <BattleArena
            battle={battle}
            phase={phase}
            dmgPopup={dmgPopup}
            stageEmoji={STAGES[selStage]?.emoji || ''}
            stageSprite={STAGES[selStage]?.sprite || ''}
            stageSpriteSize={STAGES[selStage]?.spriteSize || ''}
            stageElement={STAGES[selStage]?.element || 'shadow'}
            onSkillUse={(i) => phase === 'idle' && executeRound(i)}
            onFlee={flee}
            getChibiSprite={getChibiSprite}
            getChibiData={getChibiData}
          />
          {/* Auto toggle in battle */}
          <div className="absolute top-1 right-2 z-20">
            <button
              onClick={() => setAutoReplay(prev => !prev)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${autoReplay ? 'bg-green-500/90 text-white shadow-lg shadow-green-500/30 ring-1 ring-green-400/50' : 'bg-gray-700/80 text-gray-400 hover:bg-gray-600/80'}`}>
              Auto {autoReplay ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      )}

      {/* ═══ RESULT VIEW ═══ */}
      {view === 'result' && result && (
        <div className="max-w-xl mx-auto px-4 pt-12 text-center">
          {result.won ? (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
              <div className="text-6xl mb-4" style={{ animation: 'victoryPulse 2s ease-in-out infinite' }}>{'\uD83C\uDFC6'}</div>
              <h2 className="text-3xl font-black text-yellow-400 mb-2">VICTOIRE !</h2>
              {result.starLevel > 0 && (
                <div className="mb-2">
                  <div className="flex items-center justify-center gap-0.5">
                    {[...Array(result.starLevel)].map((_, i) => <span key={i} className="text-yellow-400 text-lg">{'\u2B50'}</span>)}
                  </div>
                  {result.isNewStarRecord && (
                    <div className="text-[10px] font-bold text-yellow-300 mt-1" style={{ animation: 'victoryPulse 2s ease-in-out infinite' }}>
                      Nouveau record ! {result.newMaxStars < 10 && `${result.newMaxStars + 1}\u2605 debloquee !`}
                    </div>
                  )}
                </div>
              )}
              <p className="text-gray-300 text-sm mb-6">{getChibiData(selChibi)?.name} a triomphe !</p>
              <div className="flex justify-center gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-black text-blue-400">+{result.xp}</div>
                  <div className="text-[10px] text-gray-500">XP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-yellow-400">+{result.coins}</div>
                  <div className="text-[10px] text-gray-500">Coins</div>
                </div>
              </div>
              {result.leveled && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
                  className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/40 rounded-xl p-3 mb-4">
                  <div className="text-yellow-400 font-black text-lg">{'\u2B06\uFE0F'} LEVEL UP !</div>
                  <div className="text-white text-sm">Lv {result.oldLevel} {'\u2192'} Lv {result.newLevel}</div>
                </motion.div>
              )}
              {(result.newStatPts > 0 || result.newSP > 0 || result.newTP > 0) && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }}
                  className="bg-gradient-to-r from-amber-600/15 to-purple-600/15 border border-amber-500/30 rounded-xl p-3 mb-6">
                  <div className="text-[11px] font-bold text-amber-300 mb-1">Nouveaux points !</div>
                  <div className="flex justify-center gap-4 text-xs">
                    {result.newStatPts > 0 && (
                      <span className="text-amber-400">+{result.newStatPts} points de stats</span>
                    )}
                    {result.newSP > 0 && (
                      <span className="text-purple-400">+{result.newSP} SP</span>
                    )}
                    {result.newTP > 0 && (
                      <span className="text-green-400">+{result.newTP} Talent Points</span>
                    )}
                  </div>
                </motion.div>
              )}
              {result.hammerDrop && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.0 }}
                  className="bg-gradient-to-r from-amber-600/15 to-orange-600/15 border border-amber-500/30 rounded-xl p-2 mb-4">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl">{HAMMERS[result.hammerDrop]?.icon || '\uD83D\uDD28'}</span>
                    <span className="text-sm font-bold text-amber-300">{HAMMERS[result.hammerDrop]?.name || 'Marteau'}</span>
                    <span className="text-xs text-amber-400">+1</span>
                  </div>
                </motion.div>
              )}
              {result.hunterDrop && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.1 }}
                  className="bg-gradient-to-r from-red-600/20 to-purple-600/20 border border-red-500/40 rounded-xl p-3 mb-6">
                  <div className="text-red-400 font-black text-lg">{'\u2694\uFE0F'} HUNTER DROP !</div>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <img src={HUNTERS[result.hunterDrop.id]?.sprite || ''} alt="" className="w-10 h-10 object-contain" />
                    <div>
                      <div className="text-sm font-bold text-white">{result.hunterDrop.name}</div>
                      <div className={`text-[10px] ${RARITY[result.hunterDrop.rarity]?.color || 'text-gray-400'}`}>
                        {RARITY[result.hunterDrop.rarity]?.stars || ''}
                      </div>
                    </div>
                  </div>
                  {result.hunterDrop.isDuplicate ? (
                    <div className="text-yellow-400 text-xs mt-1">Doublon ! Eveil {'\u2605'}{result.hunterDrop.newStars}/{MAX_EVEIL_STARS}</div>
                  ) : (
                    <div className="text-green-400 text-xs mt-1">Nouveau hunter debloque !</div>
                  )}
                </motion.div>
              )}
              {result.weaponDrop && (
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
                  className="bg-gradient-to-r from-orange-600/30 to-red-600/30 border-2 border-orange-400/60 rounded-xl p-4 mb-6 cursor-pointer" style={{ boxShadow: '0 0 30px rgba(251, 146, 60, 0.3)' }}
                  onClick={() => result.weaponDrop.id === 'w_sulfuras' ? setWeaponReveal(result.weaponDrop) : setWeaponDetailId(result.weaponDrop.id)}>
                  <div className="text-orange-300 font-black text-lg animate-pulse">{'\u2694\uFE0F'} ARME OBTENUE !</div>
                  <div className="text-2xl mt-1">{result.weaponDrop.icon}</div>
                  <div className="text-white font-black text-sm mt-1">{result.weaponDrop.name}</div>
                  <div className="text-orange-400 text-[10px] mt-0.5">ATK +{result.weaponDrop.atk} | {MAIN_STAT_VALUES[result.weaponDrop.bonusStat]?.name} +{result.weaponDrop.bonusValue}</div>
                  {result.weaponDrop.isNew ? (
                    <div className="text-green-400 text-xs mt-1">Nouvelle arme !</div>
                  ) : (
                    <div className="text-yellow-400 text-xs mt-1">Eveil A{result.weaponDrop.newAwakening - 1} {'\u2192'} A{result.weaponDrop.newAwakening}</div>
                  )}
                </motion.div>
              )}
              {result.guaranteedArtifact && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.25 }}
                  className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-2 mb-4">
                  <div className="text-purple-300 text-xs font-bold">{'\u2728'} Artefact {result.guaranteedArtifact.rarity} obtenu !</div>
                  <div className="text-[9px] text-gray-400 mt-0.5">{ARTIFACT_SETS[result.guaranteedArtifact.setId]?.name || 'Artefact'} — {ARTIFACT_SLOTS[result.guaranteedArtifact.slotId]?.name || result.guaranteedArtifact.slotId}</div>
                </motion.div>
              )}
              {/* Account XP */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.3 }}
                className="mb-6">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                  <span>{'\uD83C\uDFC5'}</span>
                  <span>Compte +{result.accountXpGain} XP</span>
                </div>
                {result.accountLevelUp && (
                  <div className="mt-1 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/40 rounded-xl p-2 text-center">
                    <div className="text-indigo-300 font-black">{'\u2B06\uFE0F'} Compte Lv {result.accountLevelUp} !</div>
                    {result.accountAllocations > 0 && (
                      <div className="text-yellow-400 text-[10px] mt-0.5">{'\u2B50'} +{result.accountAllocations * ACCOUNT_BONUS_AMOUNT} pts de stats a attribuer !</div>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-6xl mb-4" style={{ animation: 'defeatPulse 2s ease-in-out infinite' }}>{'\uD83D\uDC80'}</div>
              <h2 className="text-3xl font-black text-red-400 mb-2">DEFAITE...</h2>
              <p className="text-gray-300 text-sm mb-4">{getChibiData(selChibi)?.name} est KO.</p>
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-3 mb-6">
                <div className="text-red-400 text-sm font-bold">{'\u23F3'} Cooldown : {result.cooldownMin} minutes</div>
                <div className="text-gray-400 text-[10px] mt-1">
                  {getChibiData(selChibi)?.name} ne peut plus combattre pendant {result.cooldownMin}min.
                </div>
              </div>
            </motion.div>
          )}
          <div className="flex flex-col items-center gap-4 mt-2">
            {result.won && (
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => { setResult(null); setBattle(null); setTimeout(() => startBattle(), 50); }}
                  className="px-5 py-2.5 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-transform"
                >
                  {'🔁'} Recommencer
                </button>
                <label className="flex items-center gap-2 cursor-pointer select-none"
                  onClick={(e) => {
                    e.preventDefault();
                    const next = !autoReplay;
                    setAutoReplay(next);
                    if (next) { setResult(null); setBattle(null); setTimeout(() => startBattle(), 100); }
                  }}>
                  <div className={`relative w-10 h-5 rounded-full transition-colors ${autoReplay ? 'bg-green-500' : 'bg-gray-600'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${autoReplay ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className={`text-xs font-bold ${autoReplay ? 'text-green-400' : 'text-gray-400'}`}>
                    Auto
                  </span>
                </label>
              </div>
            )}
            <button
              onClick={() => { setAutoReplay(false); setView('hub'); setBattle(null); setResult(null); }}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-transform"
            >
              Retour au Colisee
            </button>
          </div>
        </div>
      )}

      {/* ═══ SULFURAS EPIC REVEAL ═══ */}
      {weaponReveal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={() => setWeaponReveal(null)}>
          {/* Background flash */}
          <motion.div className="absolute inset-0"
            initial={{ background: 'rgba(0,0,0,0)' }}
            animate={{ background: ['rgba(255,165,0,0.6)', 'rgba(0,0,0,0.92)', 'rgba(0,0,0,0.92)'] }}
            transition={{ duration: 1.5, times: [0, 0.3, 1] }} />
          {/* Radial glow behind weapon */}
          <motion.div className="absolute w-80 h-80 rounded-full"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1.2], opacity: [0, 0.8, 0.4] }}
            transition={{ duration: 2, delay: 0.3 }}
            style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.5) 0%, rgba(220,38,38,0.2) 50%, transparent 70%)' }} />
          {/* Spinning rays */}
          <motion.div className="absolute w-96 h-96"
            initial={{ rotate: 0, opacity: 0 }}
            animate={{ rotate: 360, opacity: [0, 0.6, 0.3] }}
            transition={{ rotate: { duration: 20, repeat: Infinity, ease: 'linear' }, opacity: { duration: 2, delay: 0.5 } }}
            style={{ background: 'conic-gradient(from 0deg, transparent, rgba(251,146,60,0.3), transparent, rgba(220,38,38,0.2), transparent, rgba(251,146,60,0.3), transparent)' }} />
          {/* Floating particles */}
          {[...Array(30)].map((_, i) => (
            <motion.div key={i} className="absolute text-xl pointer-events-none"
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{ x: (Math.random() - 0.5) * 500, y: (Math.random() - 0.5) * 500, opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
              transition={{ duration: 2 + Math.random() * 2, delay: 0.5 + Math.random() * 1.5, repeat: Infinity, repeatDelay: Math.random() * 3 }}>
              {['🔥', '✨', '⭐', '💫', '🔨', '💥'][i % 6]}
            </motion.div>
          ))}
          {/* Main content */}
          <motion.div className="relative z-10 text-center"
            initial={{ scale: 0, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.8, type: 'spring', stiffness: 150, damping: 12 }}>
            {/* Screen shake effect */}
            <motion.div
              animate={{ x: [0, -5, 5, -3, 3, 0], y: [0, 3, -3, 2, -2, 0] }}
              transition={{ duration: 0.5, delay: 0.8, repeat: 3 }}>
              <div className="text-orange-400 font-black text-xs tracking-[0.3em] uppercase mb-2"
                style={{ textShadow: '0 0 20px rgba(251,146,60,0.8)' }}>Drop Legendaire</div>
              <motion.div className="text-7xl mb-4"
                initial={{ rotateY: 0 }}
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 2, delay: 1.2, repeat: Infinity, repeatDelay: 3 }}>
                {weaponReveal.icon}
              </motion.div>
              <motion.h2
                className="text-3xl font-black mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 10px rgba(251,146,60,0.6))' }}>
                {weaponReveal.name}
              </motion.h2>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
                className="space-y-2">
                <div className="text-orange-300 text-sm font-bold">ATK +{weaponReveal.atk} | {MAIN_STAT_VALUES[weaponReveal.bonusStat]?.name} +{weaponReveal.bonusValue}</div>
                {weaponReveal.id === 'w_sulfuras' && <div className="text-red-400 text-xs">Passive : Sulfuras Fury — +{SULFURAS_STACK_PER_TURN}% DMG/tour (max +{SULFURAS_STACK_MAX}%)</div>}
                {weaponReveal.fireRes && <div className="text-orange-500 text-xs">{'\uD83D\uDD25'} Fire RES +{weaponReveal.fireRes}%</div>}
                {weaponReveal.isNew ? (
                  <div className="text-green-400 text-xs font-bold">Nouvelle arme !</div>
                ) : weaponReveal.newAwakening !== undefined && (
                  <div className="text-yellow-400 text-xs font-bold">Eveil A{weaponReveal.newAwakening - 1} {'\u2192'} A{weaponReveal.newAwakening}</div>
                )}
                <div className="mt-4 text-gray-400 text-[10px] italic animate-pulse">Clique pour fermer</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* ═══ WEAPON DETAIL VIEW ═══ */}
      {weaponDetailId && (() => {
        const wDet = WEAPONS[weaponDetailId];
        if (!wDet) return null;
        const wAw = data.weaponCollection?.[weaponDetailId] ?? -1;
        const owned = wAw >= 0;
        const passives = WEAPON_AWAKENING_PASSIVES[weaponDetailId] || [];
        const rarCol = { rare: 'text-blue-400 border-blue-400/40', legendaire: 'text-yellow-400 border-yellow-400/40', mythique: 'text-red-400 border-red-400/40' };
        const elCol = { fire: { icon: '\uD83D\uDD25', name: 'Feu', color: 'text-orange-400' }, water: { icon: '\uD83D\uDCA7', name: 'Eau', color: 'text-cyan-400' }, shadow: { icon: '\uD83C\uDF11', name: 'Ombre', color: 'text-purple-400' } };
        const el = elCol[wDet.element];
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setWeaponDetailId(null)}>
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl border border-amber-500/30 bg-[#0f0f2a] p-5 shadow-2xl"
              onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{wDet.icon}</span>
                  <div>
                    <h3 className="text-lg font-black text-amber-300">{wDet.name}</h3>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className={rarCol[wDet.rarity]?.split(' ')[0] || 'text-gray-400'}>{RARITY[wDet.rarity]?.stars}</span>
                      {el && <span className={el.color}>{el.icon} {el.name}</span>}
                      {!el && <span className="text-gray-400">Neutre</span>}
                    </div>
                  </div>
                </div>
                <button onClick={() => setWeaponDetailId(null)} className="text-gray-500 hover:text-white text-xl">&times;</button>
              </div>
              {/* Base stats */}
              <div className="bg-white/5 rounded-xl p-3 border border-white/10 mb-3">
                <div className="text-xs text-gray-400 mb-1">{wDet.desc}</div>
                <div className="flex gap-4 text-sm">
                  <span className="text-white font-bold">ATK +{wDet.atk}</span>
                  <span className="text-amber-300">{MAIN_STAT_VALUES[wDet.bonusStat]?.name} +{wDet.bonusValue}</span>
                  {wDet.fireRes && <span className="text-orange-400">Fire RES +{wDet.fireRes}%</span>}
                </div>
                {owned && <div className="text-xs mt-2 flex items-center gap-3"><span className="text-yellow-400 font-bold">Eveil : A{wAw}/{MAX_WEAPON_AWAKENING}</span><span className="text-amber-400 font-bold">iLv {computeWeaponILevel(weaponDetailId, wAw)}</span></div>}
                {!owned && <div className="text-xs mt-2 flex items-center gap-3"><span className="text-gray-500 italic">Non possedee</span><span className="text-amber-400/50">iLv {computeWeaponILevel(weaponDetailId, 0)}</span></div>}
              </div>
              {/* Awakening passives A1-A5 */}
              <div className="text-xs font-bold text-amber-400 mb-1.5">Passifs d'Eveil</div>
              <div className="space-y-1.5 mb-3">
                {passives.map((p, i) => {
                  const lvl = i + 1;
                  const unlocked = owned && wAw >= lvl;
                  return (
                    <div key={i} className={`flex items-center gap-2 p-2 rounded-lg border ${unlocked ? 'border-green-500/40 bg-green-500/10' : 'border-gray-700/30 bg-gray-800/20'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black ${unlocked ? 'bg-green-500/30 text-green-300' : 'bg-gray-700/30 text-gray-500'}`}>A{lvl}</div>
                      <div className="flex-1">
                        <div className={`text-xs font-bold ${unlocked ? 'text-green-300' : 'text-gray-500'}`}>{p.desc}</div>
                      </div>
                      {!unlocked && <span className="text-gray-600 text-sm">{'\uD83D\uDD12'}</span>}
                      {unlocked && <span className="text-green-400 text-sm">{'\u2714'}</span>}
                    </div>
                  );
                })}
              </div>
              {/* Flat bonuses A6-A10 */}
              <div className="text-xs font-bold text-indigo-400 mb-1.5">Bonus Supplementaires</div>
              <div className="space-y-1.5">
                {[6, 7, 8, 9, 10].map(lvl => {
                  const unlocked = owned && wAw >= lvl;
                  const bonus = (lvl - 5) * 3;
                  return (
                    <div key={lvl} className={`flex items-center gap-2 p-2 rounded-lg border ${unlocked ? 'border-indigo-500/40 bg-indigo-500/10' : 'border-gray-700/30 bg-gray-800/20'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black ${unlocked ? 'bg-indigo-500/30 text-indigo-300' : 'bg-gray-700/30 text-gray-500'}`}>A{lvl}</div>
                      <div className="flex-1">
                        <div className={`text-xs ${unlocked ? 'text-indigo-300' : 'text-gray-500'}`}>ATK +{bonus}%, DEF +{bonus}%, PV +{bonus}%</div>
                      </div>
                      {!unlocked && <span className="text-gray-600 text-sm">{'\uD83D\uDD12'}</span>}
                      {unlocked && <span className="text-indigo-400 text-sm">{'\u2714'}</span>}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        );
      })()}

      {/* ═══ ARTIFACT SET DETAIL VIEW ═══ */}
      {artifactSetDetail && (() => {
        const s = ALL_ARTIFACT_SETS[artifactSetDetail];
        if (!s) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setArtifactSetDetail(null)}>
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl border border-violet-500/30 bg-[#0f0f2a] p-5 shadow-2xl"
              onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{s.icon}</span>
                  <div>
                    <h3 className={`text-lg font-black ${s.color}`}>{s.name}</h3>
                    <div className="text-[10px] text-gray-400">{s.desc}</div>
                    {s.raid && <span className="text-[9px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-400 font-bold">Raid Exclusif</span>}
                  </div>
                </div>
                <button onClick={() => setArtifactSetDetail(null)} className="text-gray-500 hover:text-white text-xl">&times;</button>
              </div>
              {/* 2-piece bonus */}
              <div className={`p-3 rounded-xl border ${s.border} ${s.bg} mb-2`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${s.bg} ${s.color}`}>2</div>
                  <span className={`text-xs font-bold ${s.color}`}>Bonus 2 Pieces</span>
                </div>
                <div className="text-sm text-white font-bold">{s.bonus2Desc}</div>
                {s.passive2 && <div className="text-[10px] text-purple-300 mt-1 italic">Passif actif en combat</div>}
              </div>
              {/* 4-piece bonus */}
              <div className={`p-3 rounded-xl border ${s.border} ${s.bg}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${s.bg} ${s.color}`}>4</div>
                  <span className={`text-xs font-bold ${s.color}`}>Bonus 4 Pieces</span>
                </div>
                <div className="text-sm text-white font-bold">{s.bonus4Desc}</div>
                {s.passive4 && <div className="text-[10px] text-purple-300 mt-1 italic">Passif actif en combat</div>}
              </div>
            </motion.div>
          </div>
        );
      })()}

      {/* ═══ ACCOUNT LEVEL-UP ALLOCATION POPUP ═══ */}
      {accountLevelUpPending > 0 && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-[#12122a] border border-indigo-500/40 rounded-2xl p-5 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{'\uD83C\uDFC5'}</div>
              <h3 className="text-xl font-black text-indigo-300">Niveau Compte !</h3>
              <p className="text-sm text-gray-400 mt-1">Choisis une stat a booster de <span className="text-yellow-400 font-bold">+{ACCOUNT_BONUS_AMOUNT}</span> pts</p>
              <p className="text-[10px] text-gray-500">Ce bonus s'applique a TOUS tes personnages (y compris Sung)</p>
              {accountLevelUpPending > 1 && (
                <p className="text-[10px] text-amber-400 mt-1">{accountLevelUpPending} allocations en attente</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {STAT_ORDER.map(statKey => {
                const meta = STAT_META[statKey];
                const currentVal = (data.accountBonuses || {})[statKey] || 0;
                return (
                  <button key={statKey}
                    onClick={() => {
                      setData(prev => ({
                        ...prev,
                        accountBonuses: { ...prev.accountBonuses, [statKey]: (prev.accountBonuses[statKey] || 0) + ACCOUNT_BONUS_AMOUNT },
                        accountAllocations: (prev.accountAllocations || 0) + 1,
                      }));
                      setAccountLevelUpPending(p => p - 1);
                    }}
                    className={`p-3 rounded-xl border border-gray-700/40 bg-gray-800/30 hover:border-indigo-500/60 hover:bg-indigo-500/10 transition-all text-left group`}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{meta.icon}</span>
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{meta.name}</div>
                        <div className="text-[9px] text-gray-500">{meta.desc}</div>
                      </div>
                    </div>
                    <div className="mt-1 text-[10px]">
                      <span className="text-gray-400">Actuel : </span>
                      <span className="text-green-400 font-bold">+{currentVal}</span>
                      <span className="text-gray-500 mx-1">{'\u2192'}</span>
                      <span className="text-yellow-400 font-bold">+{currentVal + ACCOUNT_BONUS_AMOUNT}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      {/* ═══ TUTORIAL BUTTON (top-right) ═══ */}
      <button
        onClick={() => setShowTutorial(true)}
        className="fixed top-4 right-4 z-40 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 border-2 border-indigo-400/50 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-lg hover:scale-110 active:scale-95 transition-transform"
        title="Comment jouer ?"
      >?</button>

      {/* ═══ TUTORIAL MODAL ═══ */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowTutorial(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }}
              className="w-full max-w-xl max-h-[80vh] overflow-y-auto rounded-2xl border border-indigo-500/40 bg-[#0f0f2a] p-5 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Comment Jouer</h2>
                <button onClick={() => setShowTutorial(false)} className="text-gray-500 hover:text-white text-xl transition-colors">&times;</button>
              </div>

              {/* 1. Elements */}
              <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-sm font-bold text-indigo-300 mb-2">1. Les Elements</div>
                <p className="text-[10px] text-gray-400 mb-2">Chaque chibi a un element. Exploite les faiblesses pour +30% de degats !</p>
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-[10px]"><span className="text-purple-400">{'\uD83C\uDF11'} Ombre</span> &gt; <span className="text-emerald-400">{'\uD83D\uDCA8'} Vent</span></div>
                  <div className="text-[10px]"><span className="text-red-400">{'\uD83D\uDD25'} Feu</span> &gt; <span className="text-purple-400">{'\uD83C\uDF11'} Ombre</span></div>
                  <div className="text-[10px]"><span className="text-emerald-400">{'\uD83D\uDCA8'} Vent</span> &gt; <span className="text-amber-400">{'\uD83E\uDEA8'} Terre</span></div>
                  <div className="text-[10px]"><span className="text-amber-400">{'\uD83E\uDEA8'} Terre</span> &gt; <span className="text-red-400">{'\uD83D\uDD25'} Feu</span></div>
                  <div className="text-[10px]"><span className="text-blue-400">{'\uD83D\uDCA7'} Eau</span> &gt; <span className="text-red-400">{'\uD83D\uDD25'} Feu</span></div>
                  <div className="text-[10px]"><span className="text-yellow-300">{'\u2728'} Lumiere</span> &gt; <span className="text-purple-400">{'\uD83C\uDF11'} Ombre</span></div>
                </div>
              </div>

              {/* 2. Farming & Leveling */}
              <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-sm font-bold text-emerald-300 mb-2">2. Farming & Leveling</div>
                <div className="space-y-1 text-[10px] text-gray-400">
                  <p>{'\u2694\uFE0F'} <b className="text-white">Combats d'etages</b> : Bats des ennemis de plus en plus forts pour gagner de l'XP, des coins et des marteaux.</p>
                  <p>{'\uD83D\uDCC8'} <b className="text-white">Montee en niveau</b> : Chaque niveau donne des points de stats a repartir (PV, ATK, DEF, SPD, CRIT, RES, MANA).</p>
                  <p>{'\uD83C\uDF33'} <b className="text-white">Arbre de competences</b> : Debloque des ameliorations pour les sorts de tes chibis.</p>
                  <p>{'\uD83C\uDFC5'} <b className="text-white">Talents</b> : Des bonus passifs puissants. Plus tu progresses, plus tu en debloques.</p>
                  <p>{'\uD83C\uDF10'} <b className="text-white">Niveau de compte</b> : Tous les 10 niveaux, choisis une stat a booster de +10 pts pour TOUS tes personnages !</p>
                </div>
              </div>

              {/* 3. Equipment */}
              <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-sm font-bold text-amber-300 mb-2">3. Equipement</div>
                <div className="space-y-1 text-[10px] text-gray-400">
                  <p>{'\uD83D\uDD2E'} <b className="text-white">Artefacts</b> : Forge-les dans la Boutique (rare/legendaire/mythique). Chaque piece a une stat principale et des sub-stats.</p>
                  <p>{'\u2B06\uFE0F'} <b className="text-white">Amelioration</b> : Utilise des Marteaux + coins pour monter tes artefacts (max Lv20). Tous les 5 niveaux, une sub-stat est boostee !</p>
                  <p>{'\uD83D\uDEE1\uFE0F'} <b className="text-white">Sets</b> : Equipe 2 ou 4 pieces du meme set pour des bonus puissants (ATK%, DEF%, SPD...).</p>
                  <p>{'\u2694\uFE0F'} <b className="text-white">Armes</b> : Achete des armes dans la Boutique pour booster l'ATK de base.</p>
                  <p>{'\uD83D\uDC9C'} <b className="text-white">Sets de Raid</b> : Des sets exclusifs avec des passives uniques ! Obtenus uniquement via le Raid Boss.</p>
                </div>
              </div>

              {/* 4. Mana */}
              <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-sm font-bold text-violet-300 mb-2">4. Mana</div>
                <div className="space-y-1 text-[10px] text-gray-400">
                  <p>{'\uD83D\uDCA0'} <b className="text-white">Chaque sort coute de la mana</b>. Les sorts basiques sont gratuits, les sorts puissants coutent plus cher.</p>
                  <p>{'\uD83D\uDD04'} <b className="text-white">Regeneration</b> : La mana remonte a chaque tour, bonus avec la SPD.</p>
                  <p>{'\uD83D\uDCA1'} <b className="text-white">Astuce</b> : Investis des points en MANA ou equipe le set "Source Arcanique" pour +30% mana max et -20% cout !</p>
                </div>
              </div>

              {/* 5. Raid Boss */}
              <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-sm font-bold text-red-300 mb-2">5. Raid Boss</div>
                <div className="space-y-1 text-[10px] text-gray-400">
                  <p>{'\uD83D\uDC1C'} <b className="text-white">Le Raid est un combat en temps reel</b> contre un boss a barres de vie multiples. Compose 2 equipes de 3 combattants.</p>
                  <p>{'\uD83D\uDCA5'} <b className="text-white">Rage Count (RC)</b> : Chaque barre detruite = +1 RC. Plus le RC est haut, meilleures sont les recompenses !</p>
                  <p>{'\u23F1\uFE0F'} <b className="text-white">Limite</b> : 10 tentatives par jour. Utilise-les bien !</p>
                  <p>{'\uD83C\uDFB9'} <b className="text-white">Sung Jinwoo</b> : Pendant le raid, utilise les touches clavier (A, Z, E, R, T) pour activer les sorts de Sung en temps reel !</p>
                  <p>{'\uD83D\uDCE6'} <b className="text-white">Recompenses</b> : Coins, XP, marteaux et artefacts de sets de Raid exclusifs !</p>
                </div>
              </div>

              {/* 6. Hunters */}
              <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-sm font-bold text-yellow-300 mb-2">6. Debloquer des Hunters</div>
                <div className="space-y-1 text-[10px] text-gray-400">
                  <p>{'\uD83C\uDFC6'} <b className="text-white">Les Hunters</b> sont des combattants speciaux debloques en accumulant du RC total sur le Raid Boss.</p>
                  <p>{'\u2B50'} <b className="text-white">Eveil</b> : Les duplicatas augmentent les etoiles d'un Hunter (+5% stats de base par etoile, max 5).</p>
                  <p>{'\uD83D\uDCAA'} <b className="text-white">Objectif</b> : Farm le Raid, monte ton RC total, et debloque tous les Hunters pour avoir la meilleure equipe !</p>
                </div>
              </div>

              <button onClick={() => setShowTutorial(false)}
                className="w-full py-2 rounded-xl bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-sm font-bold hover:bg-indigo-600/50 transition-colors">
                Compris !
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ CATCH TOAST ═══ */}
      <AnimatePresence>
        {catchToast && (
          <motion.div
            key={catchToast.key}
            initial={{ opacity: 0, y: 40, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border shadow-lg backdrop-blur-sm ${
              catchToast.isNew
                ? 'bg-green-900/90 border-green-500/50 shadow-green-500/20'
                : 'bg-blue-900/90 border-blue-500/50 shadow-blue-500/20'
            }`}>
              <img src={getChibiSprite(catchToast.id)} alt="" className="w-8 h-8 object-contain" />
              <div>
                <div className="text-xs font-bold text-white">{catchToast.name}</div>
                {catchToast.isNew ? (
                  <div className="text-[10px] text-green-400">Nouveau chibi debloque !</div>
                ) : (
                  <div className="text-[10px] text-blue-300">Doublon ! +{catchToast.xp} XP</div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
