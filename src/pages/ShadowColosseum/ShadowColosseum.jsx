// src/pages/ShadowColosseum/ShadowColosseum.jsx
// "Le Colisee des Ombres" — Chibi Battle RPG
// Fais combattre tes chibis captures, monte de niveaux, bats des boss !

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
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
  statsAt, statsAtFull, xpForLevel, getElementMult, getEffStat, buildSpdTurnOrder,
  applySkillUpgrades, getUpgradeDesc, computeAttack, aiPickSkill, mergeTalentBonuses,
  ACCOUNT_XP_FOR_LEVEL, ACCOUNT_BONUS_INTERVAL, ACCOUNT_BONUS_AMOUNT, accountLevelFromXp, accountAllocationsAtLevel, nextAllocationLevel,
  getBaseMana, BASE_MANA_REGEN, getSkillManaCost,
  getStarScaledStats, getStarRewardMult, getStarDropBonus, getGuaranteedArtifactRarity,
  calculatePowerScore, getDifficultyRating,
  BUFF_ICONS, computeDamagePreview, aiPickSkillArc2,
} from './colosseumCore';
import { HUNTERS, loadRaidData, saveRaidData, getHunterStars, addHunterOrDuplicate, HUNTER_PASSIVE_EFFECTS, rollNierHunterDrop, NIER_DROP_CONFIG, NIER_DROP_CONFIGS, HUNTER_SKINS, rollSkinDrop, getHunterSprite } from './raidData';
import { BattleStyles, BattleArena } from './BattleVFX';
import {
  ARTIFACT_SETS, ARTIFACT_SLOTS, SLOT_ORDER, MAIN_STAT_VALUES, SUB_STAT_POOL,
  ALL_ARTIFACT_SETS, RAID_ARTIFACT_SETS,
  WEAPONS, WEAPON_PRICES, FORGE_COSTS, ENHANCE_COST, SELL_RATIO, MAX_ARTIFACT_LEVEL,
  generateArtifact, enhanceArtifact, computeArtifactBonuses, computeWeaponBonuses,
  mergeEquipBonuses, getActiveSetBonuses, getActivePassives, MAX_EVEIL_STARS, STAGE_HUNTER_DROP,
  HAMMERS, HAMMER_ORDER, getRequiredHammer, rollHammerDrop, RED_HAMMER_BY_RARITY, RED_HAMMER_ULTIME,
  SULFURAS_STACK_PER_TURN, SULFURAS_STACK_MAX,
  KATANA_Z_ATK_PER_HIT, KATANA_Z_STACK_PERSIST_CHANCE, KATANA_Z_COUNTER_CHANCE, KATANA_Z_COUNTER_MULT,
  KATANA_V_DOT_PCT, KATANA_V_DOT_MAX_STACKS, KATANA_V_BUFF_CHANCE,
  MAX_WEAPON_AWAKENING, WEAPON_AWAKENING_PASSIVES, rollWeaponDrop,
  RARITY_SUB_COUNT,
  computeWeaponILevel, computeArtifactILevel, computeEquipILevel,
  ARC2_ARTIFACT_SETS, generateArc2Artifact, generateSetArtifact,
} from './equipmentData';
import {
  isArc2Unlocked, ARC2_STAGES, ARC2_TIER_NAMES, ARC2_STORIES,
  ARC2_LOCKED_BERU_DIALOGUES, ARC2_BEBE_MACHINE_REACTIONS, GRIMOIRE_WEISS,
  buildStageEnemies,
} from './arc2Data';
import { TALENT_SKILLS, TALENT_SKILL_COST, TALENT_SKILL_UNLOCK_LEVEL } from './talentSkillData';
import { isLoggedIn, authHeaders } from '../../utils/auth';

// ─── StoryTypewriter — char-by-char text reveal ──────────────
const StoryTypewriter = ({ text, speaker }) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const speed = speaker === 'narrator' ? 28 : 22; // ms per char
  useEffect(() => {
    if (!text) { setDone(true); return; }
    setDisplayed('');
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text]);
  return (
    <p className={`text-sm leading-relaxed ${speaker === 'narrator' ? 'text-gray-400 italic' : 'text-gray-200'}`}>
      {displayed}
      {!done && <span className="inline-block w-0.5 h-3.5 bg-purple-400 ml-0.5 animate-pulse align-middle" />}
    </p>
  );
};

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
    sprite: SPRITES.zephyr, spriteSize: 'lg',
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
const defaultData = () => ({ chibiLevels: {}, statPoints: {}, skillTree: {}, talentTree: {}, talentTree2: {}, talentSkills: {}, respecCount: {}, cooldowns: {}, stagesCleared: {}, stats: { battles: 0, wins: 0 }, artifacts: {}, artifactInventory: [], weapons: {}, weaponCollection: {}, hammers: { marteau_forge: 0, marteau_runique: 0, marteau_celeste: 0, marteau_rouge: 0 }, fragments: { fragment_sulfuras: 0, fragment_raeshalare: 0, fragment_katana_z: 0, fragment_katana_v: 0 }, accountXp: 0, accountBonuses: { hp: 0, atk: 0, def: 0, spd: 0, crit: 0, res: 0 }, accountAllocations: 0, arc2Unlocked: false, arc2StagesCleared: {}, arc2StoriesWatched: {}, arc2ClickCount: 0, grimoireWeiss: false, arc2Team: [null, null, null], arc2StarsRecord: {}, ragnarokKills: 0, ragnarokDropLog: [], zephyrKills: 0, zephyrDropLog: [], monarchKills: 0, monarchDropLog: [], lootBoostMs: 0 });
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
    if (!d.hammers) d.hammers = { marteau_forge: 0, marteau_runique: 0, marteau_celeste: 0, marteau_rouge: 0 };
    if (d.hammers.marteau_rouge === undefined) d.hammers.marteau_rouge = 0;
    if (d.accountXp === undefined) d.accountXp = 0;
    if (!d.accountBonuses) d.accountBonuses = { hp: 0, atk: 0, def: 0, spd: 0, crit: 0, res: 0 };
    if (d.accountAllocations === undefined) d.accountAllocations = 0;
    // ARC II migration
    if (d.arc2Unlocked === undefined) d.arc2Unlocked = false;
    if (!d.arc2StagesCleared) d.arc2StagesCleared = {};
    if (!d.arc2StoriesWatched) d.arc2StoriesWatched = {};
    if (d.arc2ClickCount === undefined) d.arc2ClickCount = 0;
    if (d.grimoireWeiss === undefined) d.grimoireWeiss = false;
    if (!d.arc2Team) d.arc2Team = [null, null, null];
    if (!d.arc2StarsRecord) d.arc2StarsRecord = {};
    if (d.ragnarokKills === undefined) d.ragnarokKills = 0;
    if (!d.ragnarokDropLog) d.ragnarokDropLog = [];
    if (d.zephyrKills === undefined) d.zephyrKills = 0;
    if (!d.zephyrDropLog) d.zephyrDropLog = [];
    if (d.monarchKills === undefined) d.monarchKills = 0;
    if (!d.monarchDropLog) d.monarchDropLog = [];
    if (d.lootBoostMs === undefined) d.lootBoostMs = 0;
    if (!d.fragments) d.fragments = { fragment_sulfuras: 0, fragment_raeshalare: 0, fragment_katana_z: 0, fragment_katana_v: 0 };
    if (!d.talentSkills) d.talentSkills = {};
    // Migration: add locked field to artifacts
    d.artifactInventory = (d.artifactInventory || []).map(art => ({
      ...art,
      locked: art.locked ?? false
    }));
    // Also migrate equipped artifacts
    if (d.artifacts) {
      Object.keys(d.artifacts).forEach(chibiId => {
        Object.keys(d.artifacts[chibiId] || {}).forEach(slotId => {
          if (d.artifacts[chibiId][slotId]) {
            d.artifacts[chibiId][slotId] = {
              ...d.artifacts[chibiId][slotId],
              locked: d.artifacts[chibiId][slotId].locked ?? false
            };
          }
        });
      });
    }
    // Migration: respecCount old format (number) → per-tree format
    for (const cid of Object.keys(d.respecCount || {})) {
      if (typeof d.respecCount[cid] === 'number') {
        d.respecCount[cid] = { talent1: d.respecCount[cid], talent2: d.respecCount[cid], talentSkill: 0 };
      }
    }
    // Migration: stagesCleared array → object { [id]: { maxStars } }
    if (Array.isArray(d.stagesCleared)) {
      const m = {};
      d.stagesCleared.forEach(id => { m[id] = { maxStars: 0 }; });
      d.stagesCleared = m;
    } else if (!d.stagesCleared || typeof d.stagesCleared !== 'object') {
      d.stagesCleared = {};
    }
    // Migration V1: forced account bonus reset (scaling rebalance)
    if (!d.accountResetV1) {
      d.accountBonuses = { hp: 0, atk: 0, def: 0, spd: 0, crit: 0, res: 0 };
      d.accountAllocations = 0;
      d.accountResetV1 = true;
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
  const [talentTab, setTalentTab] = useState(1); // 1 = Talent I, 2 = Talent II, 3 = Talent Skill
  const [replacingSkillIdx, setReplacingSkillIdx] = useState(null); // Talent Skill replacement flow
  const [t2Zoom, setT2Zoom] = useState(1);
  const [t2Pan, setT2Pan] = useState({ x: 0, y: 0 });
  const [t2SelectedNode, setT2SelectedNode] = useState(null);
  const [t2Dragging, setT2Dragging] = useState(false);
  const t2DragRef = useRef({ sx: 0, sy: 0, px: 0, py: 0 });
  const t2PinchRef = useRef({ dist: 0, zoom: 1 });
  const [chibiRage, setChibiRage] = useState(null); // { id, level, text, anim }
  const [shopEnhTarget, setShopEnhTarget] = useState(null); // index in artifactInventory
  const [shopEnhEquipKey, setShopEnhEquipKey] = useState(null); // "chibiId|slotId"
  const [accountLevelUpPending, setAccountLevelUpPending] = useState(0); // number of pending allocations
  const pendingRef = useRef(0);
  const setPendingAlloc = (v) => {
    if (typeof v === 'function') {
      setAccountLevelUpPending(prev => { const n = v(prev); pendingRef.current = n; return n; });
    } else {
      pendingRef.current = v;
      setAccountLevelUpPending(v);
    }
  };
  const [showTutorial, setShowTutorial] = useState(false);
  const [coinDisplay, setCoinDisplay] = useState(shadowCoinManager.getBalance());
  const [coinDelta, setCoinDelta] = useState(null); // { amount, key }
  const [collectionVer, setCollectionVer] = useState(0); // bump to re-read collection
  const [autoReplay, setAutoReplay] = useState(false);
  const [autoFarmStats, setAutoFarmStats] = useState({ runs: 0, wins: 0, levels: 0, coins: 0, loots: 0, hunters: 0, weapons: 0, artifacts: 0 });
  const [weaponReveal, setWeaponReveal] = useState(null); // weapon data for epic reveal
  const [artFilter, setArtFilter] = useState({ set: null, rarity: null, slot: null });
  const [artSelected, setArtSelected] = useState(null); // index in inventory OR "eq:chibiId:slot"
  const [artEquipPicker, setArtEquipPicker] = useState(false);
  const [cleanupExpanded, setCleanupExpanded] = useState(false);
  const [cleanupConfig, setCleanupConfig] = useState({
    protectedSets: new Set(),    // Sets à ne PAS supprimer
    keepPerSet: 10,              // Garder top X par set
    includeHighLevel: false,     // Inclure Lv15+ dans nettoyage (risqué)
    includeMythic10: false       // Inclure Mythique Lv10+ (risqué)
  });
  const [cleanupPreview, setCleanupPreview] = useState(null);
  const [weaponDetailId, setWeaponDetailId] = useState(null);
  const [weaponFilter, setWeaponFilter] = useState({ element: null, sort: 'ilevel' }); // filter for weapon lists
  const [artifactSetDetail, setArtifactSetDetail] = useState(null);
  const [ragnarokHistoryOpen, setRagnarokHistoryOpen] = useState(false);
  const [monarchHistoryOpen, setMonarchHistoryOpen] = useState(false);
  const [eqInvFilter, setEqInvFilter] = useState({ slot: null, set: null }); // filters for equipment view inventory
  const [rosterSort, setRosterSort] = useState('ilevel'); // 'ilevel' | 'level' | 'name'
  const [rosterFilterElem, setRosterFilterElem] = useState(null); // element id or null
  const [rosterFilterClass, setRosterFilterClass] = useState(null); // class id or null
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [chibisCollapsed, setChibisCollapsed] = useState(false);
  const [huntersCollapsed, setHuntersCollapsed] = useState(false);
  const [activeArc, setActiveArc] = useState(1); // 1 or 2 — tab switcher
  // ARC II state
  const [arc2StoryTier, setArc2StoryTier] = useState(null);
  const [arc2StoryIdx, setArc2StoryIdx] = useState(0);
  const [arc2SelStage, setArc2SelStage] = useState(null);
  const storyMusicRef = useRef(null);
  const stopStoryMusic = () => {
    if (storyMusicRef.current) {
      storyMusicRef.current.pause();
      storyMusicRef.current.currentTime = 0;
      storyMusicRef.current = null;
    }
  };
  useEffect(() => { if (view !== 'arc2_story') stopStoryMusic(); }, [view]);
  const [arc2Team, setArc2Team] = useState([null, null, null]);
  const [arc2PickSlot, setArc2PickSlot] = useState(null);
  const [arc2Star, setArc2Star] = useState(0);
  const [arc2Battle, setArc2Battle] = useState(null); // full 3v1 battle state
  const [arc2Filter, setArc2Filter] = useState({ element: 'all', sort: 'level' }); // team picker filters
  const autoReplayRef = useRef(false);
  const clickCountRef = useRef({});
  const clickTimerRef = useRef({});
  const phaseRef = useRef('idle');
  const statHoldRef = useRef(null); // hold-to-repeat for stat +/- buttons
  const enhanceHoldRef = useRef(null); // hold-to-repeat for artifact enhance button
  const [atkAnim, setAtkAnim] = useState(null); // { idx, frames, frame } for 2-frame attack animation
  const [hoveredEnemy, setHoveredEnemy] = useState(null); // enemy index for damage preview
  const [enemyTooltip, setEnemyTooltip] = useState(null); // enemy index for stats tooltip
  const [statTooltip, setStatTooltip] = useState(null); // stat key for detail tooltip
  const [tooltipPinned, setTooltipPinned] = useState(false); // click-pinned tooltip stays on mouse leave
  const tooltipTimerRef = useRef(null); // long-press timer for mobile tooltip
  const hammerHoldRef = useRef(null); // hold-to-buy timer for hammer shop
  const lootBoostStartRef = useRef(null); // tracks battle start time for loot boost timer
  const lastBeruTauntRef = useRef(0); // timestamp of last Beru taunt to avoid spam
  const [dropLog, setDropLog] = useState([]);
  const [showDropLog, setShowDropLog] = useState(false);
  const [hasNewDrops, setHasNewDrops] = useState(false);
  const [dropToast, setDropToast] = useState(null); // { username, itemName, itemRarity }
  const lastDropCheckRef = useRef(0);
  const [unreadMailCount, setUnreadMailCount] = useState(0);
  const navigate = useNavigate();

  // Fire-and-forget legendary drop logger
  const logLegendaryDrop = (itemType, itemId, itemName, itemRarity, awakening = 0) => {
    if (!isLoggedIn()) return;
    fetch('/api/drop-log?action=submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ itemType, itemId, itemName, itemRarity, awakening }),
    }).catch(() => {});
  };

  // Fetch recent legendary drops
  const lastKnownDropIdRef = useRef(0);
  const fetchDropLog = () => {
    fetch('/api/drop-log?action=recent')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.drops) {
          // Filter to last 3 days only
          const threeDaysAgo = Date.now() - 3 * 24 * 3600000;
          const filtered = d.drops.filter(dr => new Date(dr.createdAt).getTime() > threeDaysAgo);
          // Detect truly new drops since last check
          const newestId = filtered.length > 0 ? filtered[0].id : 0;
          if (lastKnownDropIdRef.current > 0 && newestId > lastKnownDropIdRef.current) {
            setHasNewDrops(true);
            const newest = filtered[0];
            setDropToast({ username: newest.username, itemName: newest.itemName, itemRarity: newest.itemRarity });
            setTimeout(() => setDropToast(null), 5000);
          }
          lastKnownDropIdRef.current = newestId;
          setDropLog(filtered);
          lastDropCheckRef.current = Date.now();
        }
      })
      .catch(() => {});
  };

  // Fetch unread mail count
  const fetchUnreadMailCount = () => {
    if (!isLoggedIn()) return;
    fetch('/api/mail?action=inbox&filter=unread&limit=1', {
      headers: authHeaders()
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) setUnreadMailCount(d.unreadCount || 0);
      })
      .catch(() => {});
  };

  // Fetch drop log on mount + poll every 60s
  useEffect(() => {
    fetchDropLog();
    const iv = setInterval(fetchDropLog, 60000);
    return () => clearInterval(iv);
  }, []);

  // Fetch mail count on mount + listen for updates
  useEffect(() => {
    if (isLoggedIn()) fetchUnreadMailCount();
    const handler = (e) => {
      if (e.detail?.type === 'mail-update') fetchUnreadMailCount();
    };
    window.addEventListener('beru-react', handler);
    return () => window.removeEventListener('beru-react', handler);
  }, []);

  // Play epic sound for secret weapon drops
  useEffect(() => {
    if (!weaponReveal) return;
    const isSecret = ['w_sulfuras', 'w_raeshalare', 'w_katana_z', 'w_katana_v'].includes(weaponReveal.id);
    if (!isSecret) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc1 = ctx.createOscillator(); const osc2 = ctx.createOscillator(); const gain = ctx.createGain();
      osc1.type = 'sawtooth'; osc2.type = 'sine'; osc1.frequency.setValueAtTime(220, ctx.currentTime); osc2.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
      osc1.connect(gain); osc2.connect(gain); gain.connect(ctx.destination);
      osc1.start(); osc2.start(); osc1.stop(ctx.currentTime + 1.5); osc2.stop(ctx.currentTime + 1.5);
      setTimeout(() => { const osc3 = ctx.createOscillator(); const g2 = ctx.createGain(); osc3.type = 'triangle'; osc3.frequency.setValueAtTime(330, ctx.currentTime); g2.gain.setValueAtTime(0.2, ctx.currentTime); g2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2); osc3.connect(g2); g2.connect(ctx.destination); osc3.start(); osc3.stop(ctx.currentTime + 2); }, 200);
    } catch (e) {}
  }, [weaponReveal]);

  // Skin-aware sprite helper — returns active skin sprite or default
  const getSprite = (id) => HUNTER_SKINS[id] ? getHunterSprite(id, data) : getChibiSprite(id);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => () => { if (enhanceHoldRef.current) clearTimeout(enhanceHoldRef.current); }, []);
  useEffect(() => { saveData(data); }, [data]);

  // 2-frame attack animation: triggered when lastAction has atkFrames
  useEffect(() => {
    const la = arc2Battle?.lastAction;
    if (!la?.atkFrames || la.type !== 'player') return;
    setAtkAnim({ idx: la.idx, frames: la.atkFrames, frame: 0 });
    const t1 = setTimeout(() => setAtkAnim(prev => prev ? { ...prev, frame: 1 } : null), 200);
    const t2 = setTimeout(() => setAtkAnim(null), 450);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [arc2Battle?.lastAction]);
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

  // ─── ARC II helpers ─────────────────────────────────────────
  const arc2Unlocked = isArc2Unlocked(data);
  const isArc2StageCleared = (id) => id in data.arc2StagesCleared;
  const getArc2MaxStars = (id) => data.arc2StagesCleared[id]?.maxStars ?? -1;
  const isArc2StageUnlocked = (idx) => idx === 0 || isArc2StageCleared(ARC2_STAGES[idx - 1].id);

  const handleArc2LockedClick = () => {
    const clickCount = data.arc2ClickCount || 0;
    const dialogueIdx = Math.min(clickCount, ARC2_LOCKED_BERU_DIALOGUES.length - 1);

    // Dispatch Beru dialogue
    window.dispatchEvent(new CustomEvent('beru-react', {
      detail: { message: ARC2_LOCKED_BERU_DIALOGUES[dialogueIdx], mood: clickCount < 3 ? 'neutral' : clickCount < 6 ? 'suspicious' : 'panicked' },
    }));

    // Check if Bebe Machine companions are active
    try {
      const companions = JSON.parse(localStorage.getItem('beru_companions') || '[]');
      const hasGirl = companions.includes('bebe_machine');
      const hasBoy = companions.includes('bebe_machine_boy');

      if (hasGirl && hasBoy && clickCount >= 3) {
        // Pair reaction
        const pair = ARC2_BEBE_MACHINE_REACTIONS.pair[Math.min(Math.floor((clickCount - 3) / 2), ARC2_BEBE_MACHINE_REACTIONS.pair.length - 1)];
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('beru-react', {
            detail: { type: 'companion-react', companionId: 'bebe_machine', message: pair.girl },
          }));
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('beru-react', {
              detail: { type: 'companion-react', companionId: 'bebe_machine_boy', message: pair.boy },
            }));
          }, 1500);
        }, 2000);
      } else if (hasGirl && clickCount >= 2) {
        const msgs = ARC2_BEBE_MACHINE_REACTIONS.girl;
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('beru-react', {
            detail: { type: 'companion-react', companionId: 'bebe_machine', message: msgs[Math.min(clickCount - 2, msgs.length - 1)] },
          }));
        }, 2000);
      } else if (hasBoy && clickCount >= 2) {
        const msgs = ARC2_BEBE_MACHINE_REACTIONS.boy;
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('beru-react', {
            detail: { type: 'companion-react', companionId: 'bebe_machine_boy', message: msgs[Math.min(clickCount - 2, msgs.length - 1)] },
          }));
        }, 2000);
      }
    } catch {}

    // Increment click count
    setData(prev => ({ ...prev, arc2ClickCount: (prev.arc2ClickCount || 0) + 1 }));
  };

  // ─── ARC II 3v1 Battle Engine ─────────────────────────────

  const ARC2_POWER_SCALE = (tier) => 3 + tier * 0.5; // skill power mult: t1=3.5x, t6=6x

  const buildArc2Fighter = (id) => {
    const c = getChibiData(id);
    if (!c) return null;
    const { level } = getChibiLevel(id);
    const alloc = data.statPoints[id] || {};
    const tb = getChibiTalentBonuses(id);
    const eqB = getChibiEquipBonuses(id);
    const evS = getChibiEveilStars(id);
    const fs = statsAtFull(c.base, c.growth, level, alloc, tb, eqB, evS, data.accountBonuses);

    // Hunter passive (typed schema)
    const hunterPassive = HUNTERS[id] ? (HUNTER_PASSIVE_EFFECTS[id] || null) : null;

    // Apply permanent stat bonuses at build time
    if (hunterPassive?.type === 'permanent' && hunterPassive.stats) {
      if (hunterPassive.stats.hp)   fs.hp  = Math.floor(fs.hp  * (1 + hunterPassive.stats.hp / 100));
      if (hunterPassive.stats.atk)  fs.atk = Math.floor(fs.atk * (1 + hunterPassive.stats.atk / 100));
      if (hunterPassive.stats.def)  fs.def = Math.floor(fs.def * (1 + hunterPassive.stats.def / 100));
      if (hunterPassive.stats.spd)  fs.spd = Math.floor(fs.spd * (1 + hunterPassive.stats.spd / 100));
      if (hunterPassive.stats.crit) fs.crit += hunterPassive.stats.crit;
      if (hunterPassive.stats.res)  fs.res += hunterPassive.stats.res;
    }

    // Build merged talent bonuses with hunter passive injections
    const mergedTb = { ...tb };
    for (const [k, v] of Object.entries(eqB)) { if (v) mergedTb[k] = (mergedTb[k] || 0) + v; }
    if (hunterPassive) {
      if (hunterPassive.type === 'healBonus')   mergedTb.healBonus = (mergedTb.healBonus || 0) + hunterPassive.value;
      if (hunterPassive.type === 'critDmg')     mergedTb.critDamage = (mergedTb.critDamage || 0) + hunterPassive.value;
      if (hunterPassive.type === 'magicDmg')    mergedTb.allDamage = (mergedTb.allDamage || 0) + hunterPassive.value;
      if (hunterPassive.type === 'vsBoss')      mergedTb.bossDamage = (mergedTb.bossDamage || 0) + (hunterPassive.stats?.atk || 0);
      if (hunterPassive.type === 'debuffBonus') mergedTb.debuffBonus = (mergedTb.debuffBonus || 0) + hunterPassive.value;
    }

    const manaCostMult = Math.max(0.5, 1 - (fs.manaCostReduce || 0) / 100);
    const skills = (c.skills || []).map((sk, i) => {
      // Check if this slot is replaced by a Talent Skill
      const ts = data.talentSkills[id];
      const baseSk = (ts && ts.replacedSlot === i && TALENT_SKILLS[id]?.[ts.skillIndex]) ? TALENT_SKILLS[id][ts.skillIndex] : sk;
      const up = applySkillUpgrades(baseSk, data.skillUpgrades?.[id]?.[i] || 0);
      return { ...up, cd: 0, manaCost: Math.floor(getSkillManaCost(up) * manaCostMult) };
    });

    // Initial buffs (firstTurn passive)
    const initBuffs = [];
    if (hunterPassive?.type === 'firstTurn' && hunterPassive.stats?.spd) {
      initBuffs.push({ type: 'spd', val: hunterPassive.stats.spd, dur: 1 });
    }

    return {
      id, name: c.name, sprite: getSprite(id), element: c.element,
      hp: fs.hp, maxHp: fs.hp, atk: fs.atk, def: fs.def,
      spd: fs.spd, crit: Math.min(80, fs.crit), res: Math.min(70, fs.res),
      mana: fs.mana || 100, maxMana: fs.mana || 100, manaRegen: fs.manaRegen || BASE_MANA_REGEN,
      skills, buffs: initBuffs, alive: true, tb: mergedTb, level,
      hunterPassive, // stored for combat-time conditional checks
      passiveState: { sianStacks: 0 }, // stacking passives state
    };
  };

  const startArc2Battle = () => {
    const stage = ARC2_STAGES[arc2SelStage];
    if (!stage) return;
    const fighters = arc2Team.filter(Boolean).map(id => buildArc2Fighter(id)).filter(Boolean);
    if (fighters.length === 0) return;
    // Apply teamDef passive (Reed): +DEF% to all team members
    const teamDefValue = fighters.reduce((sum, f) => {
      if (f.hunterPassive?.type === 'teamDef') return sum + (f.hunterPassive.value || 0);
      return sum;
    }, 0);
    if (teamDefValue > 0) {
      fighters.forEach(f => {
        f.def = Math.floor(f.def * (1 + teamDefValue / 100));
      });
    }
    // Apply teamAura passives (Pascal): permanent stat buffs to all allies
    fighters.forEach(f => {
      if (f.hunterPassive?.type === 'teamAura' && f.hunterPassive.stats) {
        const stats = f.hunterPassive.stats;
        fighters.forEach(ally => {
          Object.entries(stats).forEach(([stat, pct]) => {
            ally.buffs.push({ stat, value: pct / 100, dur: 999 });
          });
        });
      }
    });
    // Save team for "Previous Team" button
    setData(prev => ({ ...prev, arc2LastTeam: arc2Team.filter(Boolean) }));
    // Build multi-enemy encounter
    const stageEnemies = buildStageEnemies(stage);
    const enemies = stageEnemies.map(e => {
      const sc = getStarScaledStats(e, arc2Star);
      return {
        id: e.id, name: e.name, sprite: e.sprite || '', element: e.element,
        hp: sc.hp, maxHp: sc.hp, atk: sc.atk, def: sc.def, spd: sc.spd,
        crit: sc.crit, res: sc.res, skills: e.skills.map(s => ({ ...s, cd: 0 })),
        buffs: [], alive: true, mana: 999, maxMana: 999, emoji: e.emoji,
        isMain: e.isMain, isBoss: !!e.isBoss,
      };
    });
    // Build SPD-based turn order with extra turns for fast combatants
    const rawEntities = fighters.map((_, i) => ({ type: 'team', idx: i, spd: fighters[i].spd }))
      .concat(enemies.map((e, i) => ({ type: 'enemy', idx: i, spd: e.spd })));
    const entities = buildSpdTurnOrder(rawEntities);
    const first = entities[0];
    setArc2Battle({
      team: fighters, enemies, turnOrder: entities, currentTurn: 0, round: 1,
      phase: first.type === 'team' ? 'pick' : 'enemy_act',
      log: [], star: arc2Star, stageIdx: arc2SelStage, bossTier: stage.tier,
      lastAction: null, isBoss: stage.isBoss,
      pendingSkill: null,
    });
    setView('arc2_battle');
  };

  // ─── Step 1: Player selects a skill ─────────────────────────
  const arc2SelectSkill = (skillIdx) => {
    setArc2Battle(prev => {
      if (!prev || prev.phase !== 'pick') return prev;
      const b = JSON.parse(JSON.stringify(prev));
      const entity = b.turnOrder[b.currentTurn];
      if (!entity || entity.type !== 'team') return prev;
      const fighter = b.team[entity.idx];
      if (!fighter || !fighter.alive) return prev;
      const skill = fighter.skills[skillIdx];
      if (!skill || skill.cd > 0 || (skill.manaCost || 0) > (fighter.mana || 0)) return prev;

      const isPureSupport = skill.power === 0 && (skill.buffAtk || skill.buffDef || skill.healSelf);
      b.pendingSkill = skillIdx;

      if (isPureSupport) {
        // Buff/heal: choose an ally
        b.phase = 'pick_ally';
      } else {
        // Attack: choose an enemy (auto-target if only 1 alive)
        const aliveEnemies = b.enemies.filter(e => e.alive);
        if (aliveEnemies.length === 1) {
          const targetIdx = b.enemies.findIndex(e => e.alive);
          return arc2ExecuteAttack(b, entity.idx, skillIdx, targetIdx);
        }
        b.phase = 'pick_target';
      }
      return b;
    });
  };

  // ─── Cancel target/ally selection ──────────────────────────
  const arc2CancelSelection = () => {
    setArc2Battle(prev => {
      if (!prev || (prev.phase !== 'pick_target' && prev.phase !== 'pick_ally')) return prev;
      return { ...prev, phase: 'pick', pendingSkill: null };
    });
  };

  // ─── Step 2a: Player picks an enemy target ────────────────
  const arc2ConfirmTarget = (targetIdx) => {
    setArc2Battle(prev => {
      if (!prev || prev.phase !== 'pick_target' || prev.pendingSkill == null) return prev;
      try {
        const b = JSON.parse(JSON.stringify(prev));
        if (!b.enemies[targetIdx]?.alive) return prev;
        const entity = b.turnOrder[b.currentTurn];
        return arc2ExecuteAttack(b, entity.idx, b.pendingSkill, targetIdx);
      } catch (e) {
        console.error('arc2ConfirmTarget error:', e);
        return prev;
      }
    });
  };

  // ─── Step 2b: Player picks an ally for buff/heal ──────────
  const arc2ConfirmAlly = (allyIdx) => {
    setArc2Battle(prev => {
      if (!prev || prev.phase !== 'pick_ally' || prev.pendingSkill == null) return prev;
      try {
        const b = JSON.parse(JSON.stringify(prev));
        const entity = b.turnOrder[b.currentTurn];
        if (!entity || entity.type !== 'team') return prev;
        const fighter = b.team[entity.idx];
        if (!fighter || !fighter.alive) return prev;
        const skill = fighter.skills[b.pendingSkill];
        if (!skill) return prev;
        const ally = b.team[allyIdx];
        if (!ally || !ally.alive) return prev;

        // Deduct mana
        fighter.mana = (fighter.mana || 0) - (skill.manaCost || 0);
        // Apply buff/heal to chosen ally
        if (skill.buffAtk) ally.buffs.push({ stat: 'atk', value: skill.buffAtk / 100, dur: skill.buffDur || 2 });
        if (skill.buffDef) ally.buffs.push({ stat: 'def', value: skill.buffDef / 100, dur: skill.buffDur || 2 });
        const isAntiHealed = ally.buffs.some(bf => bf.type === 'antiHeal');
        if (skill.healSelf && !isAntiHealed) {
          ally.hp = Math.min(ally.maxHp, ally.hp + Math.floor(ally.maxHp * skill.healSelf / 100));
        } else if (skill.healSelf && isAntiHealed) {
          b.log.unshift({ msg: `🚫 Soin bloque sur ${ally.name} ! (Anti-Heal)`, type: 'player' });
        }
        if (skill.cdMax > 0) skill.cd = skill.cdMax;
        fighter.mana = Math.min(fighter.maxMana || 100, (fighter.mana || 0) + (fighter.manaRegen || 5));

        const effectText = skill.healSelf ? `Soin ${ally.name}` : `Buff ${ally.name}`;
        b.log.unshift({ msg: `${fighter.name} → ${skill.name} → ${effectText}`, type: 'player' });
        b.lastAction = { type: 'support', idx: entity.idx, allyIdx, skillName: skill.name };
        b.pendingSkill = null;
        b.phase = 'advance';
        return b;
      } catch (e) {
        console.error('arc2ConfirmAlly error:', e);
        return prev;
      }
    });
  };

  // ─── Execute attack on an enemy ────────────────────────────
  function arc2ExecuteAttack(b, fighterIdx, skillIdx, targetIdx) {
    const fighter = b.team[fighterIdx];
    const skill = fighter.skills[skillIdx];
    const enemy = b.enemies[targetIdx];
    fighter.mana = (fighter.mana || 0) - (skill.manaCost || 0);

    // ─── Apply conditional hunter passives before attack ───
    const hp = fighter.hunterPassive;
    const savedAtk = fighter.atk;
    const savedDef = fighter.def;
    const savedCrit = fighter.crit;
    const tbForAttack = { ...(fighter.tb || {}) };
    const ps = fighter.passiveState || {};

    if (hp) {
      const hpPct = fighter.hp / fighter.maxHp * 100;
      if (hp.type === 'lowHp' && hpPct < hp.threshold && hp.stats) {
        if (hp.stats.def) fighter.def = Math.floor(fighter.def * (1 + hp.stats.def / 100));
        if (hp.stats.atk) fighter.atk = Math.floor(fighter.atk * (1 + hp.stats.atk / 100));
      }
      if (hp.type === 'highHp' && hpPct > hp.threshold && hp.stats) {
        if (hp.stats.atk) fighter.atk = Math.floor(fighter.atk * (1 + hp.stats.atk / 100));
        if (hp.stats.crit) fighter.crit = +(fighter.crit + hp.stats.crit).toFixed(1);
      }
      if (hp.type === 'stacking') {
        ps.sianStacks = Math.min(hp.maxStacks || 10, (ps.sianStacks || 0) + 1);
        const stackBonus = (hp.perStack?.atk || 0) * ps.sianStacks;
        fighter.atk = Math.floor(fighter.atk * (1 + stackBonus / 100));
      }
      if (hp.type === 'vsLowHp' && (enemy.hp / enemy.maxHp * 100) < hp.threshold && hp.stats?.crit) {
        fighter.crit = +(fighter.crit + hp.stats.crit).toFixed(1);
      }
      if (hp.type === 'vsDebuffed' && enemy.buffs?.some(buf => buf.value < 0) && hp.stats?.atk) {
        fighter.atk = Math.floor(fighter.atk * (1 + hp.stats.atk / 100));
      }
      if (hp.type === 'skillCd' && (skill.cdMax || 0) >= (hp.minCd || 3) && hp.stats?.crit) {
        fighter.crit = +(fighter.crit + hp.stats.crit).toFixed(1);
      }
      if (hp.type === 'aoeDmg') tbForAttack.allDamage = (tbForAttack.allDamage || 0) + hp.value;
      if (hp.type === 'dotDmg') tbForAttack.allDamage = (tbForAttack.allDamage || 0) + hp.value;
    }

    let result = computeAttack(fighter, skill, enemy, tbForAttack);
    fighter.atk = savedAtk;
    fighter.def = savedDef;
    fighter.crit = savedCrit;
    fighter.passiveState = ps;

    if (hp?.type === 'defIgnore' && result.isCrit && result.damage > 0) {
      result = { ...result, damage: Math.floor(result.damage * (1 + (hp.value || 10) / 100)) };
    }

    const dmg = result.damage || 0;
    enemy.hp = Math.max(0, enemy.hp - dmg);
    if (enemy.hp <= 0) enemy.alive = false;
    // Heal blocked by antiHeal debuff
    const isAntiHealed = fighter.buffs.some(bf => bf.type === 'antiHeal');
    if (result.healed && !isAntiHealed) {
      fighter.hp = Math.min(fighter.maxHp, fighter.hp + result.healed);
    } else if (result.healed && isAntiHealed) {
      b.log.unshift({ msg: `🚫 Soin bloque sur ${fighter.name} ! (Anti-Heal)`, type: 'player' });
    }
    // Self-buff on attack combo (attack + buff skills)
    if (skill.buffAtk) fighter.buffs.push({ stat: 'atk', value: skill.buffAtk / 100, dur: skill.buffDur || 2 });
    if (skill.buffDef) fighter.buffs.push({ stat: 'def', value: skill.buffDef / 100, dur: skill.buffDur || 2 });
    if (skill.debuffDef) enemy.buffs.push({ stat: 'def', value: -(skill.debuffDef / 100), dur: skill.debuffDur || 2 });
    // Berserker selfDamage: skill costs % of max HP to use
    let selfDmg = 0;
    if (skill.selfDamage && skill.selfDamage > 0) {
      selfDmg = Math.floor(fighter.maxHp * skill.selfDamage / 100);
      fighter.hp = Math.max(1, fighter.hp - selfDmg); // never kills self
    }
    if (skill.cdMax > 0) skill.cd = skill.cdMax;
    fighter.mana = Math.min(fighter.maxMana || 100, (fighter.mana || 0) + (fighter.manaRegen || 5));

    const selfDmgLog = selfDmg > 0 ? ` (-${selfDmg} HP!)` : '';
    b.log.unshift({ msg: `${fighter.name} → ${skill.name} → ${enemy.name} ${dmg} DMG${result.isCrit ? ' CRIT!' : ''}${!enemy.alive ? ' KO!' : ''}${selfDmgLog}`, type: 'player' });
    b.lastAction = { type: 'player', idx: fighterIdx, targetEnemyIdx: targetIdx, damage: dmg, crit: result.isCrit, ko: !enemy.alive, selfDmg, atkFrames: skill.atkFrames || null };
    b.pendingSkill = null;
    b.phase = b.enemies.every(e => !e.alive) ? 'victory' : 'advance';
    return b;
  }

  // ─── Enemy turn (each enemy acts individually) ─────────────
  const arc2EnemyAction = () => {
    setArc2Battle(prev => {
      if (!prev || prev.phase !== 'enemy_act') return prev;
      try {
        const b = JSON.parse(JSON.stringify(prev));
        const entity = b.turnOrder[b.currentTurn];
        if (!entity || entity.type !== 'enemy') return prev;
        const enemy = b.enemies[entity.idx];
        if (!enemy || !enemy.alive) { b.phase = 'advance'; return b; }

        const aiResult = aiPickSkillArc2(enemy, b.enemies, b.team);
        const skill = aiResult.skill;
        if (!skill) { b.phase = 'advance'; return b; }

        // ═══ ALLY TARGET (heal/buff an ally enemy) ═══
        if (aiResult.targetType === 'ally' && aiResult.target) {
          const allyEnemy = b.enemies.find(e => e.id === aiResult.target.id && e.alive);
          if (allyEnemy) {
            if (skill.healAlly) {
              const healAmt = Math.floor(allyEnemy.maxHp * skill.healAlly / 100);
              allyEnemy.hp = Math.min(allyEnemy.maxHp, allyEnemy.hp + healAmt);
              b.log.unshift({ msg: `${enemy.name} → ${skill.name} → Soin ${allyEnemy.name} +${healAmt} PV`, type: 'enemy' });
            }
            if (skill.buffAllyAtk) allyEnemy.buffs.push({ stat: 'atk', value: skill.buffAllyAtk / 100, dur: skill.buffDur || 2 });
            if (skill.buffAllyDef) allyEnemy.buffs.push({ stat: 'def', value: skill.buffAllyDef / 100, dur: skill.buffDur || 2 });
            if ((skill.buffAllyAtk || skill.buffAllyDef) && !skill.healAlly) {
              b.log.unshift({ msg: `${enemy.name} → ${skill.name} → Buff ${allyEnemy.name}`, type: 'enemy' });
            }
            if (skill.cdMax > 0) skill.cd = skill.cdMax;
            b.lastAction = { type: 'enemy_support', enemyIdx: entity.idx, allyName: allyEnemy.name, skillName: skill.name };
            b.phase = 'advance';
            return b;
          }
        }

        // ═══ SELF TARGET (self-buff/self-heal) ═══
        if (aiResult.targetType === 'self') {
          if (skill.healSelf) enemy.hp = Math.min(enemy.maxHp, enemy.hp + Math.floor(enemy.maxHp * skill.healSelf / 100));
          if (skill.buffAtk) enemy.buffs.push({ stat: 'atk', value: skill.buffAtk / 100, dur: skill.buffDur || 2 });
          if (skill.buffDef) enemy.buffs.push({ stat: 'def', value: skill.buffDef / 100, dur: skill.buffDur || 2 });
          if (skill.buffSpd) enemy.buffs.push({ stat: 'spd', value: skill.buffSpd / 100, dur: skill.buffDur || 2 });
          if (skill.cdMax > 0) skill.cd = skill.cdMax;
          b.log.unshift({ msg: `${enemy.name} → ${skill.name} (self)`, type: 'enemy' });
          b.lastAction = { type: 'enemy_self', enemyIdx: entity.idx, skillName: skill.name };
          b.phase = 'advance';
          return b;
        }

        // ═══ PLAYER TARGET (attack + debuffs) ═══
        const aliveTeam = b.team.map((f, i) => ({ ...f, _i: i })).filter(f => f.alive);
        if (aliveTeam.length === 0) { b.phase = 'defeat'; return b; }

        // AI picks target or we fall back
        let tIdx;
        if (aiResult.target) {
          const match = aliveTeam.find(f => f.id === aiResult.target.id || f.name === aiResult.target.name);
          tIdx = match ? match._i : aliveTeam[0]._i;
        } else {
          const pick = Math.random() < 0.6
            ? aliveTeam.reduce((a, c) => a.hp < c.hp ? a : c)
            : aliveTeam[Math.floor(Math.random() * aliveTeam.length)];
          tIdx = pick._i;
        }
        const tFighter = b.team[tIdx];
        const scaled = { ...skill, power: skill.power ? Math.floor(skill.power * ARC2_POWER_SCALE(b.bossTier)) : 0 };
        const result = computeAttack(enemy, scaled, tFighter);
        const dmg = result.damage || 0;
        tFighter.hp = Math.max(0, tFighter.hp - dmg);
        if (tFighter.hp <= 0) tFighter.alive = false;
        if (result.healed) enemy.hp = Math.min(enemy.maxHp, enemy.hp + result.healed);
        // ─── Standard buffs/debuffs ───
        if (skill.buffAtk) enemy.buffs.push({ stat: 'atk', value: skill.buffAtk / 100, dur: skill.buffDur || 2 });
        if (skill.buffDef) enemy.buffs.push({ stat: 'def', value: skill.buffDef / 100, dur: skill.buffDur || 2 });
        if (skill.debuffDef) tFighter.buffs.push({ stat: 'def', value: -(skill.debuffDef / 100), dur: skill.debuffDur || 2 });
        // ─── New debuffs ───
        if (skill.debuffAtk) tFighter.buffs.push({ stat: 'atk', value: -(skill.debuffAtk / 100), dur: skill.debuffDur || 2 });
        if (skill.debuffSpd) tFighter.buffs.push({ stat: 'spd', value: -(skill.debuffSpd / 100), dur: skill.debuffDur || 2 });
        if (skill.poison) tFighter.buffs.push({ type: 'poison', value: skill.poison / 100, dur: skill.poisonDur || 3 });
        if (skill.antiHeal) tFighter.buffs.push({ type: 'antiHeal', dur: skill.antiHealDur || 2 });
        if (skill.cdMax > 0) skill.cd = skill.cdMax;

        const extraEffects = [];
        if (skill.debuffAtk) extraEffects.push('ATK↓');
        if (skill.debuffSpd) extraEffects.push('SPD↓');
        if (skill.poison) extraEffects.push('☠️Poison');
        if (skill.antiHeal) extraEffects.push('🚫Soin');
        const effectsStr = extraEffects.length > 0 ? ` [${extraEffects.join(', ')}]` : '';
        b.log.unshift({ msg: `${enemy.name} → ${skill.name} → ${tFighter.name} ${dmg} DMG${result.isCrit ? ' CRIT!' : ''}${!tFighter.alive ? ' KO!' : ''}${effectsStr}`, type: 'enemy' });
        b.lastAction = { type: 'enemy', enemyIdx: entity.idx, targetIdx: tIdx, damage: dmg, crit: result.isCrit, ko: !tFighter.alive };
        b.phase = b.team.every(f => !f.alive) ? 'defeat' : 'advance';
        return b;
      } catch (e) {
        console.error('arc2EnemyAction error:', e);
        return prev;
      }
    });
  };

  // ─── Advance to next turn ──────────────────────────────────
  const advanceArc2Turn = () => {
    setArc2Battle(prev => {
      if (!prev || prev.phase !== 'advance') return prev;
      const b = JSON.parse(JSON.stringify(prev));
      const cur = b.turnOrder[b.currentTurn];
      if (cur) {
        const curF = cur.type === 'team' ? b.team[cur.idx] : b.enemies[cur.idx];
        if (curF && curF.alive) {
          // ─── Poison / Burn DoT ───
          const poisonBuffs = (curF.buffs || []).filter(bf => bf.type === 'poison');
          poisonBuffs.forEach(p => {
            const dot = Math.floor(curF.maxHp * (p.value || 0.05));
            curF.hp = Math.max(1, curF.hp - dot); // poison never kills
            b.log.unshift({ msg: `☠️ ${curF.name} subit ${dot} degats de poison`, type: cur.type === 'team' ? 'enemy' : 'player' });
          });
          // ─── Cooldown tick ───
          curF.skills.forEach(s => { if (s.cd > 0) s.cd--; });
          // ─── Buff duration tick (skip permanent aura buffs dur:999) ───
          curF.buffs = (curF.buffs || []).filter(buff => { if (buff.dur >= 999) return true; buff.dur--; return buff.dur > 0; });
        }
      }

      const rebuildTurnOrder = () => {
        const raw = [];
        b.team.forEach((f, i) => { if (f.alive) raw.push({ type: 'team', idx: i, spd: getEffStat(f.spd, f.buffs || [], 'spd') }); });
        b.enemies.forEach((e, i) => { if (e.alive) raw.push({ type: 'enemy', idx: i, spd: getEffStat(e.spd, e.buffs || [], 'spd') }); });
        return buildSpdTurnOrder(raw);
      };

      let next = b.currentTurn + 1;
      if (next >= b.turnOrder.length) {
        b.round++;
        b.turnOrder = rebuildTurnOrder();
        next = 0;
      }
      let loops = 0;
      while (loops < b.turnOrder.length * 2) {
        if (next >= b.turnOrder.length) {
          b.round++;
          b.turnOrder = rebuildTurnOrder();
          next = 0;
        }
        const e = b.turnOrder[next];
        if (!e) break;
        if (e.type === 'team' && !b.team[e.idx].alive) { next++; loops++; continue; }
        if (e.type === 'enemy' && !b.enemies[e.idx].alive) { next++; loops++; continue; }
        break;
      }
      b.currentTurn = next;
      b.lastAction = null;
      b.pendingSkill = null;
      const ne = b.turnOrder[b.currentTurn];
      if (ne?.isExtra) {
        const extraName = ne.type === 'team' ? b.team[ne.idx]?.name : b.enemies[ne.idx]?.name;
        b.log.unshift({ msg: `\u26A1 Tour bonus ! ${extraName || ''} (SPD)`, type: ne.type === 'team' ? 'player' : 'enemy' });
      }
      b.phase = !ne ? 'defeat' : ne.type === 'team' ? 'pick' : 'enemy_act';
      return b;
    });
  };

  // Auto-advance + enemy auto-act via effects
  useEffect(() => {
    if (!arc2Battle) return;
    if (arc2Battle.phase === 'advance') {
      const t = setTimeout(() => advanceArc2Turn(), 600);
      return () => clearTimeout(t);
    }
    if (arc2Battle.phase === 'enemy_act') {
      const t = setTimeout(() => arc2EnemyAction(), 800);
      return () => clearTimeout(t);
    }
  }, [arc2Battle]);

  const handleArc2Victory = useCallback(() => {
    if (!arc2Battle) return;
    const stage = ARC2_STAGES[arc2Battle.stageIdx];
    if (!stage) return;
    const star = arc2Battle.star;
    const rMult = getStarRewardMult(star);
    const dropBonus = getStarDropBonus(star);

    // Pre-compute drops outside setData (need side effects like saveRaidData)
    // Hammer drop
    const hammerDrop = rollHammerDrop(stage.tier, !!stage.isBoss);
    let extraHammer = null;
    if (!hammerDrop && dropBonus.hammerPct > 0 && Math.random() * 100 < dropBonus.hammerPct) {
      extraHammer = rollHammerDrop(stage.tier, !!stage.isBoss);
    }
    // Hunter drop (ARC II = +50% higher base chance) — excludes Nier collab hunters
    let hunterDrop = null;
    const baseHunterChance = (stage.isBoss ? STAGE_HUNTER_DROP.dropChance.boss : STAGE_HUNTER_DROP.dropChance.normal) * 1.5;
    const hunterChance = baseHunterChance + dropBonus.hunterPct / 100;
    if (Math.random() < hunterChance) {
      const tierPool = STAGE_HUNTER_DROP.tierPool[stage.tier] || ['rare'];
      const dropRarity = tierPool[Math.floor(Math.random() * tierPool.length)];
      const hunterCandidates = Object.entries(HUNTERS).filter(([, h]) => h.rarity === dropRarity && !h.series);
      if (hunterCandidates.length > 0) {
        const [pickId, pickData] = hunterCandidates[Math.floor(Math.random() * hunterCandidates.length)];
        const rd = loadRaidData();
        const res = addHunterOrDuplicate(rd, pickId);
        rd.hunterCollection = res.collection;
        saveRaidData(rd);
        hunterDrop = { id: pickId, name: pickData.name, rarity: pickData.rarity, isDuplicate: res.isDuplicate, newStars: res.newStars };
      }
    }
    // Weapon drop
    let weaponDrop = null;
    const rolledWeaponId = rollWeaponDrop(stage.tier, !!stage.isBoss);
    if (rolledWeaponId && WEAPONS[rolledWeaponId]) {
      weaponDrop = { id: rolledWeaponId, ...WEAPONS[rolledWeaponId] };
    }
    // Nier Automata special drop — per-hunter stage/tier config
    let nierDrop = null;
    const hasNierOnStage = Object.values(NIER_DROP_CONFIGS).some(c =>
      c.stageId ? c.stageId === stage.id : c.tier === stage.tier
    );
    if (hasNierOnStage) {
      const nierId = rollNierHunterDrop(stage.id, stage.tier, !!stage.isBoss, star);
      if (nierId && HUNTERS[nierId]) {
        const rd = loadRaidData();
        const res = addHunterOrDuplicate(rd, nierId);
        rd.hunterCollection = res.collection;
        saveRaidData(rd);
        nierDrop = { id: nierId, name: HUNTERS[nierId].name, rarity: HUNTERS[nierId].rarity, series: 'nier', isDuplicate: res.isDuplicate, newStars: res.newStars };
        if (!res.isDuplicate) logLegendaryDrop('hunter', nierId, HUNTERS[nierId].name, HUNTERS[nierId].rarity);
      }
    }
    // Skin drop (stage/tier based)
    let skinDrop = null;
    const rolledSkin = rollSkinDrop(stage.id, stage.tier);
    if (rolledSkin) {
      skinDrop = rolledSkin;
    }

    setData(prev => {
      const d = JSON.parse(JSON.stringify(prev));
      // XP to all team members
      arc2Battle.team.forEach(f => {
        const xpMult = f.alive ? 1 : 0.5;
        const scaledXp = Math.floor(stage.xp * rMult.xp * xpMult);
        const cl = d.chibiLevels[f.id] || { level: 1, xp: 0 };
        cl.xp += scaledXp;
        while (cl.level < MAX_LEVEL && cl.xp >= xpForLevel(cl.level)) { cl.xp -= xpForLevel(cl.level); cl.level++; }
        d.chibiLevels[f.id] = cl;
      });
      // Coins
      const coins = Math.floor(stage.coins * rMult.coins);
      shadowCoinManager.addCoins(coins);
      // Account XP
      const baseAccountXp = 20 + stage.tier * 12 + (stage.isBoss ? 25 : 0);
      const accountXpGain = Math.floor(baseAccountXp * rMult.accountXp);
      d.accountXp = (d.accountXp || 0) + accountXpGain;
      // Stage cleared + star record
      if (!d.arc2StagesCleared[stage.id]) d.arc2StagesCleared[stage.id] = { maxStars: 0 };
      if (star > (d.arc2StagesCleared[stage.id].maxStars || 0)) d.arc2StagesCleared[stage.id].maxStars = star;
      d.stats.battles = (d.stats.battles || 0) + 1;
      d.stats.wins = (d.stats.wins || 0) + 1;
      // Hammers
      if (hammerDrop) d.hammers[hammerDrop] = (d.hammers[hammerDrop] || 0) + 1;
      if (extraHammer) d.hammers[extraHammer] = (d.hammers[extraHammer] || 0) + 1;
      // Weapon collection — if already A10, give red hammers instead
      if (weaponDrop) {
        if (d.weaponCollection[weaponDrop.id] !== undefined) {
          if (d.weaponCollection[weaponDrop.id] >= MAX_WEAPON_AWAKENING) {
            const w = WEAPONS[weaponDrop.id];
            const qty = (w && (w.ultime || w.secret)) ? RED_HAMMER_ULTIME : (RED_HAMMER_BY_RARITY[w?.rarity] || 1);
            d.hammers.marteau_rouge = (d.hammers.marteau_rouge || 0) + qty;
            weaponDrop._redHammers = qty; // flag for UI
          } else {
            d.weaponCollection[weaponDrop.id] = Math.min(d.weaponCollection[weaponDrop.id] + 1, MAX_WEAPON_AWAKENING);
          }
        } else {
          d.weaponCollection[weaponDrop.id] = 0;
        }
      }
      // ARC II artifact drop
      const baseDropChance = 0.08 + star * 0.03; // 8% base + 3% per star
      let droppedArt = null;
      const gRarity = getGuaranteedArtifactRarity(star);
      if (gRarity) droppedArt = generateArc2Artifact(gRarity);
      else if (Math.random() < baseDropChance) {
        const r = Math.random() < 0.15 ? 'mythique' : Math.random() < 0.45 ? 'legendaire' : 'rare';
        droppedArt = generateArc2Artifact(r);
      }
      if (droppedArt) d.artifactInventory.push(droppedArt);
      // Skin drop handling
      if (skinDrop) {
        if (!d.ownedSkins) d.ownedSkins = {};
        if (!d.ownedSkins[skinDrop.hunterId]) d.ownedSkins[skinDrop.hunterId] = ['default'];
        if (!d.ownedSkins[skinDrop.hunterId].includes(skinDrop.skinId)) {
          d.ownedSkins[skinDrop.hunterId].push(skinDrop.skinId);
        }
        // Auto-unlock hunter if not owned
        const rd = loadRaidData();
        const owned = (rd.hunterCollection || []).map(e => typeof e === 'string' ? e : e.id);
        if (!owned.includes(skinDrop.hunterId)) {
          const skinRes = addHunterOrDuplicate(rd, skinDrop.hunterId);
          rd.hunterCollection = skinRes.collection;
          saveRaidData(rd);
          skinDrop.autoUnlockedHunter = true;
        }
      }
      // Store result for display
      d._arc2Result = {
        coins, xp: Math.floor(stage.xp * rMult.xp), art: droppedArt, star, stageName: stage.name,
        accountXpGain, hammerDrop: hammerDrop || extraHammer, hunterDrop, weaponDrop, nierDrop, skinDrop,
      };
      return d;
    });
    setView('arc2_result');
    setArc2Battle(null);
  }, [arc2Battle]);

  const handleArc2Defeat = useCallback(() => {
    if (!arc2Battle) return;
    const stage = ARC2_STAGES[arc2Battle.stageIdx];
    setData(prev => {
      const d = JSON.parse(JSON.stringify(prev));
      d.stats.battles = (d.stats.battles || 0) + 1;
      d._arc2Result = { defeat: true, stageName: stage?.name || '?' };
      return d;
    });
    setView('arc2_result');
    setArc2Battle(null);
  }, [arc2Battle]);

  // Trigger victory/defeat from battle phase
  useEffect(() => {
    if (!arc2Battle) return;
    if (arc2Battle.phase === 'victory') { const t = setTimeout(() => handleArc2Victory(), 1200); return () => clearTimeout(t); }
    if (arc2Battle.phase === 'defeat') { const t = setTimeout(() => handleArc2Defeat(), 1200); return () => clearTimeout(t); }
  }, [arc2Battle]);

  // ─── Flee ARC II ──────────────────────────────────────────
  const fleeArc2 = () => {
    if (!arc2Battle) return;
    setArc2Battle(null);
    setView('hub');
    setActiveArc(2);
  };

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

  // Hold-to-repeat for stat buttons: starts slow (300ms), speeds up to 50ms
  const startStatHold = (id, stat, delta) => {
    allocateStat(id, stat, delta); // immediate first click
    let delay = 350;
    const tick = () => {
      allocateStat(id, stat, delta);
      delay = Math.max(40, delay * 0.82);
      statHoldRef.current = setTimeout(tick, delay);
    };
    statHoldRef.current = setTimeout(tick, delay);
  };
  const stopStatHold = () => {
    if (statHoldRef.current) { clearTimeout(statHoldRef.current); statHoldRef.current = null; }
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
  // Talent Skill spent
  const getSpentTalentSkillPts = (id) => data.talentSkills[id] ? TALENT_SKILL_COST : 0;
  // Total spent (T1 + T2 + Skill) — shared pool
  const getSpentTalentPts = (id) => getSpentTalent1Pts(id) + getSpentTalent2Pts(data.talentTree2[id]) + getSpentTalentSkillPts(id);
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

  // Reset talents per tree (talent1, talent2, talentSkill)
  const resetTalentTree = (id, treeType) => {
    const respecObj = typeof data.respecCount[id] === 'object' ? data.respecCount[id] : { talent1: 0, talent2: 0, talentSkill: 0 };
    const respecN = respecObj[treeType] || 0;
    const cost = respecN === 0 ? 0 : 100 * Math.pow(2, respecN - 1);
    const coins = shadowCoinManager.getBalance();
    if (cost > 0 && coins < cost) return false;
    if (cost > 0) shadowCoinManager.spendCoins(cost);
    setData(prev => {
      const oldRespec = typeof prev.respecCount[id] === 'object' ? prev.respecCount[id] : { talent1: 0, talent2: 0, talentSkill: 0 };
      const newRespec = { ...oldRespec, [treeType]: respecN + 1 };
      const update = { ...prev, respecCount: { ...prev.respecCount, [id]: newRespec } };
      if (treeType === 'talent1') update.talentTree = { ...prev.talentTree, [id]: {} };
      if (treeType === 'talent2') update.talentTree2 = { ...prev.talentTree2, [id]: {} };
      if (treeType === 'talentSkill') {
        const ts = { ...prev.talentSkills };
        delete ts[id];
        update.talentSkills = ts;
      }
      return update;
    });
    return true;
  };
  const getRespecCost = (id, treeType = 'talent1') => {
    const respecObj = typeof data.respecCount[id] === 'object' ? data.respecCount[id] : { talent1: 0, talent2: 0, talentSkill: 0 };
    const n = respecObj[treeType] || 0;
    return n === 0 ? 0 : 100 * Math.pow(2, n - 1);
  };

  // Talent Skill: equip a skill
  const equipTalentSkill = (id, skillIndex, replacedSlot) => {
    if (getAvailTalentPts(id) < TALENT_SKILL_COST && !data.talentSkills[id]) return;
    setData(prev => ({
      ...prev,
      talentSkills: { ...prev.talentSkills, [id]: { skillIndex, replacedSlot } },
    }));
  };
  const unequipTalentSkill = (id) => {
    setData(prev => {
      const ts = { ...prev.talentSkills };
      delete ts[id];
      return { ...prev, talentSkills: ts };
    });
  };

  // ═══════════════════════════════════════════════════════════════
  // ARTIFACT CLEANUP UTILITIES
  // ═══════════════════════════════════════════════════════════════

  const showToast = (message, color = '#10b981') => {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #1a1a2e;
      color: ${color};
      padding: 12px 20px;
      border-radius: 8px;
      border: 1px solid ${color};
      font-size: 14px;
      z-index: 99999;
      max-width: 90vw;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  const isArtifactEquipped = (uid) => {
    return Object.values(data.artifacts || {}).some(slots =>
      Object.values(slots).some(art => art?.uid === uid)
    );
  };

  const isArtifactProtected = (art, config) => {
    // Toujours protégé
    if (art.locked) return true;
    if (isArtifactEquipped(art.uid)) return true;

    // Auto-protect sauf si override activé
    if (!config.includeHighLevel && art.level >= 15) return true;
    if (!config.includeMythic10 && art.rarity === 'mythique' && art.level >= 10) return true;

    return false;
  };

  const computeCleanupPreview = (config) => {
    const inv = data.artifactInventory || [];
    const { protectedSets, keepPerSet } = config;

    const bySet = {};
    inv.forEach(art => {
      if (!bySet[art.set]) bySet[art.set] = [];
      bySet[art.set].push(art);
    });

    const toDelete = [];
    const toKeep = [];

    Object.entries(bySet).forEach(([setId, artifacts]) => {
      if (protectedSets.has(setId)) {
        toKeep.push(...artifacts);
        return;
      }

      const deletable = artifacts.filter(art => !isArtifactProtected(art, config));
      const protectedArts = artifacts.filter(art => isArtifactProtected(art, config));

      deletable.sort((a, b) => computeArtifactILevel(b) - computeArtifactILevel(a));

      toKeep.push(...protectedArts, ...deletable.slice(0, keepPerSet));
      toDelete.push(...deletable.slice(keepPerSet));
    });

    // Stats
    const rarityBreakdown = { rare: 0, legendaire: 0, mythique: 0 };
    let totalCoins = 0;
    toDelete.forEach(art => {
      rarityBreakdown[art.rarity] = (rarityBreakdown[art.rarity] || 0) + 1;
      totalCoins += Math.floor((FORGE_COSTS[art.rarity] || 200) * SELL_RATIO);
    });

    const setBreakdown = {};
    toDelete.forEach(art => {
      if (!setBreakdown[art.set]) setBreakdown[art.set] = 0;
      setBreakdown[art.set]++;
    });

    return {
      toDelete,
      toKeep,
      totalDelete: toDelete.length,
      totalKeep: toKeep.length,
      rarityBreakdown,
      totalCoins,
      setBreakdown
    };
  };

  const executeCleanup = () => {
    if (!cleanupPreview || cleanupPreview.totalDelete === 0) return;

    const deleteUids = new Set(cleanupPreview.toDelete.map(a => a.uid));

    setData(prev => ({
      ...prev,
      artifactInventory: prev.artifactInventory.filter(art => !deleteUids.has(art.uid))
    }));

    shadowCoinManager.addCoins(cleanupPreview.totalCoins, 'mass_cleanup');

    showToast(`✨ Nettoyage terminé! ${cleanupPreview.totalDelete} artefacts vendus pour ${cleanupPreview.totalCoins} coins`, '#10b981');

    setCleanupPreview(null);
  };

  // ─── Start Battle ──────────────────────────────────────────

  const LOOT_BOOST_BOSSES = ['ragnarok', 'zephyr', 'supreme_monarch'];

  const startBattle = () => {
    if (!selChibi || selStage === null || isCooldown(selChibi)) return;
    const chibi = getChibiData(selChibi);
    if (!chibi) return;
    const stage = STAGES[selStage];
    // Loot boost timer: start tracking if boost active and boss is eligible
    if (data.lootBoostMs > 0 && LOOT_BOOST_BOSSES.includes(stage.id)) {
      lootBoostStartRef.current = Date.now();
    } else {
      lootBoostStartRef.current = null;
    }
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
        if (hunterPassive.type === 'aoeDmg')      m.allDamage = (m.allDamage || 0) + hunterPassive.value;
        if (hunterPassive.type === 'dotDmg')      m.allDamage = (m.allDamage || 0) + hunterPassive.value;
        if (hunterPassive.type === 'buffBonus')   m.buffBonus = (m.buffBonus || 0) + hunterPassive.value;
        if (hunterPassive.type === 'teamDef') s.def = Math.floor(s.def * (1 + hunterPassive.value / 100));
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
          // Check if this slot is replaced by a Talent Skill
          const ts = data.talentSkills[selChibi];
          const baseSk = (ts && ts.replacedSlot === i && TALENT_SKILLS[selChibi]?.[ts.skillIndex]) ? TALENT_SKILLS[selChibi][ts.skillIndex] : sk;
          const upgraded = applySkillUpgrades(baseSk, tree[i] || 0);
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
      shadowSilence: (() => {
        const wId = data.weapons[selChibi];
        return wId && WEAPONS[wId]?.passive === 'shadow_silence' ? [] : undefined;
      })(),
      katanaZStacks: (() => {
        const wId = data.weapons[selChibi];
        return wId && WEAPONS[wId]?.passive === 'katana_z_fury' ? 0 : undefined;
      })(),
      katanaVState: (() => {
        const wId = data.weapons[selChibi];
        return wId && WEAPONS[wId]?.passive === 'katana_v_chaos'
          ? { dots: 0, allStatBuff: 0, shield: false, nextDmgMult: 1 }
          : undefined;
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

    // Shadow Silence (Rae'shalare): active stacks give +100% ATK each
    if (battle.shadowSilence !== undefined) {
      const activeStacks = battle.shadowSilence.filter(s => s > 0).length;
      if (activeStacks > 0) {
        atkMult += activeStacks * 1.0;
        log.push({ text: `Murmure de la Mort x${activeStacks} ! ATK +${activeStacks * 100}%`, type: 'info', id: Date.now() - 0.15 });
      }
    }

    // Katana Z: accumulated +5% ATK per stack
    if (battle.katanaZStacks !== undefined && battle.katanaZStacks > 0) {
      atkMult += battle.katanaZStacks * KATANA_Z_ATK_PER_HIT / 100;
      log.push({ text: `Tranchant Eternel x${battle.katanaZStacks} ! ATK +${battle.katanaZStacks * KATANA_Z_ATK_PER_HIT}%`, type: 'info', id: Date.now() - 0.12 });
    }

    // Katana V: x6 damage on next hit if buffed
    if (battle.katanaVState !== undefined && battle.katanaVState.nextDmgMult > 1) {
      atkMult *= battle.katanaVState.nextDmgMult;
      log.push({ text: `Benediction Chaotique ! DMG x${battle.katanaVState.nextDmgMult} !`, type: 'buff', id: Date.now() - 0.11 });
    }

    // Katana V: permanent all stats buff
    if (battle.katanaVState !== undefined && battle.katanaVState.allStatBuff > 0) {
      atkMult += battle.katanaVState.allStatBuff / 100;
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

    // Katana Z: add 1 ATK stack after each hit
    let newKatanaZStacks = battle.katanaZStacks;
    if (newKatanaZStacks !== undefined) {
      newKatanaZStacks = (newKatanaZStacks || 0) + 1;
    }

    // Katana V: add DoT stack + roll buff
    let newKatanaVState = battle.katanaVState ? { ...battle.katanaVState } : undefined;
    if (newKatanaVState !== undefined) {
      if (newKatanaVState.nextDmgMult > 1) newKatanaVState.nextDmgMult = 1;
      if (newKatanaVState.dots < KATANA_V_DOT_MAX_STACKS) newKatanaVState.dots++;
      if (Math.random() < KATANA_V_BUFF_CHANCE) {
        const roll = Math.random();
        if (roll < 0.33) {
          newKatanaVState.allStatBuff += 10;
          log.push({ text: `Benediction : +10% toutes stats ! (total +${newKatanaVState.allStatBuff}%)`, type: 'buff', id: Date.now() + 0.07 });
        } else if (roll < 0.66) {
          newKatanaVState.shield = true;
          log.push({ text: `Benediction : Bouclier Divin ! Prochain coup = 0 degats !`, type: 'buff', id: Date.now() + 0.07 });
        } else {
          newKatanaVState.nextDmgMult = 6;
          log.push({ text: `Benediction : Puissance x6 au prochain coup !`, type: 'buff', id: Date.now() + 0.07 });
        }
      }
    }

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
      setTimeout(() => handleVictory(), autoReplayRef.current ? 600 : 1200);
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

      // Katana V shield: absorb next hit entirely
      if (newKatanaVState?.shield && !dodged && dmgToPlayer > 0) {
        dmgToPlayer = 0;
        newKatanaVState.shield = false;
        log.push({ text: `Bouclier Divin absorbe le coup !`, type: 'buff', id: Date.now() + 0.9 });
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

      // Katana Z: 50% chance to counter with 200% player ATK
      if (!dodged && newKatanaZStacks !== undefined && eRes.damage > 0 && player.hp > 0) {
        if (Math.random() < KATANA_Z_COUNTER_CHANCE) {
          const counterDmg = Math.max(1, Math.floor(getEffStat(player.atk, player.buffs, 'atk') * KATANA_Z_COUNTER_MULT));
          enemy.hp = Math.max(0, enemy.hp - counterDmg);
          log.push({ text: `Katana Z contre-attaque ! -${counterDmg} PV !`, type: 'player', id: Date.now() + 1.2 });
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

      // Shadow Silence (Rae'shalare): decrement existing stacks, 10% chance to proc new +100% ATK for 5T (max 3 stacks)
      let newShadowSilence = battle.shadowSilence;
      if (newShadowSilence !== undefined) {
        newShadowSilence = newShadowSilence.map(t => t - 1).filter(t => t > 0);
        if (newShadowSilence.length < 3 && Math.random() < 0.10) {
          newShadowSilence.push(5);
          log.push({ text: `Murmure de la Mort proc ! +100% ATK pendant 5 tours (x${newShadowSilence.length}/3)`, type: 'buff', id: Date.now() + 1.6 });
        }
      }

      // Katana Z: each stack has 50% chance to persist
      if (newKatanaZStacks !== undefined && newKatanaZStacks > 0) {
        let surviving = 0;
        for (let i = 0; i < newKatanaZStacks; i++) {
          if (Math.random() < KATANA_Z_STACK_PERSIST_CHANCE) surviving++;
        }
        newKatanaZStacks = surviving;
      }

      // Katana V: DoT tick on enemy
      if (newKatanaVState !== undefined && newKatanaVState.dots > 0) {
        const dotDmg = Math.max(1, Math.floor(getEffStat(player.atk, player.buffs, 'atk') * KATANA_V_DOT_PCT * newKatanaVState.dots));
        enemy.hp = Math.max(0, enemy.hp - dotDmg);
        log.push({ text: `Lame Veneneuse x${newKatanaVState.dots} ! -${dotDmg} PV !`, type: 'player', id: Date.now() + 1.7 });
      }

      setDmgPopup(dmgToPlayer > 0 ? { target: 'player', value: dmgToPlayer, isCrit: eRes.isCrit } : null);
      setBattle(prev => ({ ...prev, player: { ...player }, enemy: { ...enemy }, immortelUsed, colossusUsed, passiveState: ps, sulfurasStacks: newSulfurasStacks, shadowSilence: newShadowSilence, katanaZStacks: newKatanaZStacks, katanaVState: newKatanaVState, turn: prev.turn + 1, log: log.slice(-10) }));

      if (enemy.hp <= 0) {
        setTimeout(() => handleVictory(), autoReplayRef.current ? 600 : 1200);
        return;
      }
      if (player.hp <= 0) {
        setTimeout(() => handleDefeat(), autoReplayRef.current ? 600 : 1200);
        return;
      }
      setTimeout(() => { setPhase('idle'); setDmgPopup(null); }, autoReplayRef.current ? 400 : 800);
    }, autoReplayRef.current ? 600 : 1200);
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
    }, 300);
    return () => clearTimeout(timer);
  }, [phase, battle, view, pickBestSkill, executeRound]);

  // ─── Victory ───────────────────────────────────────────────

  const handleVictory = useCallback(() => {
    setPhase('done');
    // Loot boost: deduct elapsed time
    if (lootBoostStartRef.current) {
      const elapsed = Date.now() - lootBoostStartRef.current;
      lootBoostStartRef.current = null;
      setData(prev => ({ ...prev, lootBoostMs: Math.max(0, (prev.lootBoostMs || 0) - elapsed) }));
    }
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
    const prevMilestones = accountAllocationsAtLevel(prevAccLvl);
    const newMilestones = accountAllocationsAtLevel(newAccLvl);
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
      const hunterCandidates = Object.entries(HUNTERS).filter(([, h]) => h.rarity === dropRarity && !h.series);
      if (hunterCandidates.length > 0) {
        const [pickId, pickData] = hunterCandidates[Math.floor(Math.random() * hunterCandidates.length)];
        const rd = loadRaidData();
        const res = addHunterOrDuplicate(rd, pickId);
        rd.hunterCollection = res.collection;
        saveRaidData(rd);
        hunterDrop = { id: pickId, name: pickData.name, rarity: pickData.rarity, isDuplicate: res.isDuplicate, newStars: res.newStars };
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
    // Loot boost: x2 drop rate for secret weapons only
    const lootMult = (data.lootBoostMs > 0) ? 2 : 1;
    if (!weaponDrop && stage.id === 'ragnarok' && Math.random() < (1 / 10000) * lootMult) {
      const isNew = data.weaponCollection['w_sulfuras'] === undefined;
      weaponDrop = { id: 'w_sulfuras', ...WEAPONS.w_sulfuras, isNew, newAwakening: isNew ? 0 : Math.min((data.weaponCollection['w_sulfuras'] || 0) + 1, MAX_WEAPON_AWAKENING) };
    }
    if (!weaponDrop && stage.id === 'zephyr' && Math.random() < (1 / 5000) * lootMult) {
      const isNew = data.weaponCollection['w_raeshalare'] === undefined;
      weaponDrop = { id: 'w_raeshalare', ...WEAPONS.w_raeshalare, isNew, newAwakening: isNew ? 0 : Math.min((data.weaponCollection['w_raeshalare'] || 0) + 1, MAX_WEAPON_AWAKENING) };
    }
    // Katana Z: 1/50,000 from Monarque Supreme
    if (!weaponDrop && stage.id === 'supreme_monarch' && Math.random() < (1 / 50000) * lootMult) {
      const isNew = data.weaponCollection['w_katana_z'] === undefined;
      weaponDrop = { id: 'w_katana_z', ...WEAPONS.w_katana_z, isNew, newAwakening: isNew ? 0 : Math.min((data.weaponCollection['w_katana_z'] || 0) + 1, MAX_WEAPON_AWAKENING) };
    }
    // Katana V: 1/50,000 from Monarque Supreme
    if (!weaponDrop && stage.id === 'supreme_monarch' && Math.random() < (1 / 50000) * lootMult) {
      const isNew = data.weaponCollection['w_katana_v'] === undefined;
      weaponDrop = { id: 'w_katana_v', ...WEAPONS.w_katana_v, isNew, newAwakening: isNew ? 0 : Math.min((data.weaponCollection['w_katana_v'] || 0) + 1, MAX_WEAPON_AWAKENING) };
    }

    // Fragment drops (mercy system) — 1% chance per kill
    let fragmentDrop = null;
    if (stage.id === 'ragnarok' && Math.random() < 0.005) fragmentDrop = 'fragment_sulfuras';
    if (stage.id === 'zephyr' && Math.random() < 0.008) fragmentDrop = 'fragment_raeshalare';
    if (stage.id === 'supreme_monarch' && Math.random() < 0.001) {
      fragmentDrop = Math.random() < 0.5 ? 'fragment_katana_z' : 'fragment_katana_v';
    }

    // Pacte des Ombres artifact drop — Zephyr Ultime at star >= 10 (1/250)
    let pacteDrop = null;
    if (stage.id === 'zephyr' && currentStar >= 10 && Math.random() < 1 / 250) {
      pacteDrop = generateSetArtifact('pacte_ombres');
    }

    // Star tracking
    const prevMaxStars = getMaxStars(stage.id);
    const newMaxStars = Math.max(prevMaxStars, currentStar);
    const isNewStarRecord = currentStar > prevMaxStars;

    setData(prev => {
      const newHammers = { ...(prev.hammers || { marteau_forge: 0, marteau_runique: 0, marteau_celeste: 0, marteau_rouge: 0 }) };
      if (hammerDrop) newHammers[hammerDrop] = (newHammers[hammerDrop] || 0) + 1;
      if (extraHammer) newHammers[extraHammer] = (newHammers[extraHammer] || 0) + 1;
      const newFragments = { ...(prev.fragments || { fragment_sulfuras: 0, fragment_raeshalare: 0, fragment_katana_z: 0, fragment_katana_v: 0 }) };
      if (fragmentDrop) newFragments[fragmentDrop] = (newFragments[fragmentDrop] || 0) + 1;
      // Ragnarok kill tracking
      const isRagnarok = stage.id === 'ragnarok';
      const newRagKills = isRagnarok ? (prev.ragnarokKills || 0) + 1 : (prev.ragnarokKills || 0);
      const newRagLog = (isRagnarok && weaponDrop)
        ? [...(prev.ragnarokDropLog || []), { weaponId: weaponDrop.id, name: weaponDrop.name, rarity: weaponDrop.rarity, icon: weaponDrop.icon, sprite: weaponDrop.sprite || null, killNumber: newRagKills, date: Date.now() }]
        : (prev.ragnarokDropLog || []);
      // Zephyr kill tracking
      const isZephyr = stage.id === 'zephyr';
      const newZephKills = isZephyr ? (prev.zephyrKills || 0) + 1 : (prev.zephyrKills || 0);
      const newZephLog = (isZephyr && weaponDrop)
        ? [...(prev.zephyrDropLog || []), { weaponId: weaponDrop.id, name: weaponDrop.name, rarity: weaponDrop.rarity, icon: weaponDrop.icon, sprite: weaponDrop.sprite || null, killNumber: newZephKills, date: Date.now() }]
        : (prev.zephyrDropLog || []);
      // Monarch Supreme kill tracking
      const isMonarch = stage.id === 'supreme_monarch';
      const newMonarchKills = isMonarch ? (prev.monarchKills || 0) + 1 : (prev.monarchKills || 0);
      const newMonarchLog = (isMonarch && weaponDrop)
        ? [...(prev.monarchDropLog || []), { weaponId: weaponDrop.id, name: weaponDrop.name, rarity: weaponDrop.rarity, icon: weaponDrop.icon, sprite: weaponDrop.sprite || null, killNumber: newMonarchKills, date: Date.now() }]
        : (prev.monarchDropLog || []);
      return {
        ...prev,
        chibiLevels: { ...prev.chibiLevels, [selChibi]: { level: newLevel, xp: newXp } },
        stagesCleared: { ...prev.stagesCleared, [stage.id]: { maxStars: Math.max((prev.stagesCleared[stage.id]?.maxStars ?? -1), currentStar) } },
        stats: { battles: prev.stats.battles + 1, wins: prev.stats.wins + 1 },
        hammers: newHammers,
        fragments: newFragments,
        accountXp: newAccountXp,
        ragnarokKills: newRagKills,
        ragnarokDropLog: newRagLog,
        zephyrKills: newZephKills,
        zephyrDropLog: newZephLog,
        monarchKills: newMonarchKills,
        monarchDropLog: newMonarchLog,
        weaponCollection: (() => {
          if (!weaponDrop) return prev.weaponCollection;
          const wc = { ...prev.weaponCollection };
          if (wc[weaponDrop.id] !== undefined) {
            if (wc[weaponDrop.id] >= MAX_WEAPON_AWAKENING) {
              // Already A10 — give red hammers instead
              const w = WEAPONS[weaponDrop.id];
              const qty = (w && (w.ultime || w.secret)) ? RED_HAMMER_ULTIME : (RED_HAMMER_BY_RARITY[w?.rarity] || 1);
              newHammers.marteau_rouge = (newHammers.marteau_rouge || 0) + qty;
              weaponDrop._redHammers = qty; // flag for UI
            } else {
              wc[weaponDrop.id] = Math.min(wc[weaponDrop.id] + 1, MAX_WEAPON_AWAKENING);
            }
          } else {
            wc[weaponDrop.id] = 0;
          }
          return wc;
        })(),
        artifactInventory: [...prev.artifactInventory, ...(guaranteedArtifact ? [guaranteedArtifact] : []), ...(pacteDrop ? [pacteDrop] : [])],
      };
    });
    if (newAllocations > 0) setPendingAlloc(newAllocations);
    setResult({ won: true, xp: scaledXp, coins: scaledCoins, leveled, newLevel, oldLevel: level, newStatPts, newSP, newTP, hunterDrop, hammerDrop: hammerDrop || extraHammer, weaponDrop, fragmentDrop, guaranteedArtifact, pacteDrop, starLevel: currentStar, isNewStarRecord, newMaxStars, accountXpGain, accountLevelUp: newAccLvl > prevAccLvl ? newAccLvl : null, accountAllocations: newAllocations });

    // Weapon drop reveal + Beru reaction
    if (weaponDrop) {
      const isSecret = ['w_sulfuras', 'w_raeshalare', 'w_katana_z', 'w_katana_v'].includes(weaponDrop.id);
      setWeaponReveal(weaponDrop);
      setTimeout(() => setWeaponReveal(null), isSecret ? 5500 : 2000);
      if (weaponDrop.id === 'w_sulfuras') {
        logLegendaryDrop('weapon', 'w_sulfuras', 'Masse de Sulfuras', 'secret', weaponDrop.newAwakening || 0);
        try { window.dispatchEvent(new CustomEvent('beru-react', { detail: { type: 'sulfuras', message: "OOOH MON DIEU !! LA MASSE DE SULFURAS !!! C'est... c'est REEL ?! Tu l'as eu ! TU L'AS VRAIMENT EU ! Je pleure des larmes de fourmi !!" } })); } catch (e) {}
      } else if (weaponDrop.id === 'w_raeshalare') {
        logLegendaryDrop('weapon', 'w_raeshalare', "Arc Rae'shalare", 'secret', weaponDrop.newAwakening || 0);
        try { window.dispatchEvent(new CustomEvent('beru-react', { detail: { type: 'excited', message: "RAE'SHALARE ?! Le Murmure de la Mort !! Cette arme est LEGENDAIRE ! Les ombres murmurent ton nom maintenant... INCROYABLE !!" } })); } catch (e) {}
      } else if (weaponDrop.id === 'w_katana_z') {
        logLegendaryDrop('weapon', 'w_katana_z', 'Katana Z', 'secret', weaponDrop.newAwakening || 0);
        try { window.dispatchEvent(new CustomEvent('beru-react', { detail: { type: 'excited', message: "LE KATANA Z !! L'arme de vitesse ULTIME !! Chaque coup te rend plus fort... INCROYABLE !!" } })); } catch (e) {}
      } else if (weaponDrop.id === 'w_katana_v') {
        logLegendaryDrop('weapon', 'w_katana_v', 'Katana V', 'secret', weaponDrop.newAwakening || 0);
        try { window.dispatchEvent(new CustomEvent('beru-react', { detail: { type: 'excited', message: "KATANA V ?! L'arme du CHAOS !! Poison, bouclier, puissance... cette lame est DIVINE !!" } })); } catch (e) {}
      }
    }

    // ─── Beru taunts when farming secret weapon bosses (no secret drop) ───
    // 8% chance, minimum 2min cooldown between taunts to avoid spam during auto-farm
    const isSecretDrop = weaponDrop && ['w_sulfuras', 'w_raeshalare', 'w_katana_z', 'w_katana_v'].includes(weaponDrop.id);
    const tauntCooldownOk = Date.now() - lastBeruTauntRef.current > 120000;
    if (!isSecretDrop && tauntCooldownOk && Math.random() < 0.08) {
      const beruTaunt = (() => {
        const kills = stage.id === 'ragnarok' ? (data.ragnarokKills || 0) + 1
          : stage.id === 'supreme_monarch' ? (data.monarchKills || 0) + 1
          : stage.id === 'zephyr' ? (data.zephyrKills || 0) + 1 : 0;
        if (kills === 0) return null;

        const weaponName = stage.id === 'ragnarok' ? 'Sulfuras'
          : stage.id === 'zephyr' ? "Rae'shalare"
          : 'un Katana';
        const dropRate = stage.id === 'ragnarok' ? '1/10 000'
          : stage.id === 'zephyr' ? '1/50 000 000'
          : '1/50 000';
        const cumul = stage.id === 'ragnarok' ? (1 - Math.pow(1 - 1/10000, kills)) * 100
          : stage.id === 'zephyr' ? (1 - Math.pow(1 - 1/5000, kills)) * 100
          : (1 - Math.pow(1 - 2/50000, kills)) * 100;

        // Pool of taunts — randomly picked
        const taunts = [
          // Mocking stats
          `${kills} kills et toujours rien ? Hahaha ! T'as ${cumul.toFixed(2)}% de chance cumulee... c'est beau l'espoir !`,
          `Run numero ${kills}... Tu sais que ${dropRate} ca veut dire que c'est presque IMPOSSIBLE hein ? Mais continue, j'adore te regarder souffrir.`,
          kills > 100 ? `${kills} runs... A ce rythme tu vas avoir des cheveux blancs avant d'avoir ${weaponName}. Courage !` : null,
          kills > 50 ? `T'es a ${kills} kills la... statistiquement tu devrais avoir honte. Mais bon, les maths c'est pas ton truc.` : null,
          kills > 200 ? `${kills} tentatives ?? Tu bats des records la ! Record de malchance je veux dire...` : null,
          kills > 500 ? `OK ${kills} kills je commence a avoir de la peine pour toi... non j'rigole HAHAHA` : null,

          // Probability jokes
          `Tu as plus de chances de te faire frapper par une meteorite que de drop ${weaponName}. Juste pour info.`,
          `Fun fact : avec un taux de ${dropRate}, tu aurais plus de chance de gagner au loto. Mais tu farm quand meme. Respect.`,
          `${dropRate} de chance... c'est comme trouver une aiguille dans une botte de foin. Sauf que la botte fait 10km.`,
          `Statistiquement, il te faudrait encore ${Math.max(1, Math.ceil(1 / (stage.id === 'ragnarok' ? 1/10000 : stage.id === 'zephyr' ? 1/5000 : 1/50000) - kills))} runs en moyenne. Bonne chance !`,
          stage.id === 'zephyr' ? "1 chance sur 50 MILLIONS... t'as plus de chances de rencontrer un alien. Mais je crois en toi ! Non j'deconne." : null,

          // Fake-outs
          `ATTENDS... C'EST... non rien c'est juste un caillou. Desole, fausse alerte.`,
          `OH MON DIEU ${weaponName.toUpperCase()} EST... ah non pardon. J'ai cru voir un truc briller. C'etait le soleil.`,
          `J'ai failli crier ! Pendant une seconde j'ai cru que... non laisse tomber. Continue a farm.`,
          `*plisse les yeux* Hmm on dirait que... non. Toujours rien. T'as l'habitude de toute facon.`,
          `STOP STOP STOP ! Le drop est... nope. Hehe. Je t'ai eu hein ?`,

          // General mockery
          `Encore un run pour rien. Tu sais, y'a des gens qui ont une vie en dehors du farm...`,
          `C'est beau la perseverance. Ou la folie. C'est la meme chose a ce stade.`,
          `Allez encore un ! Et un autre ! Et un autre ! Et un au... bon t'as compris.`,
          `Tu veux un conseil ? Arrete de farmer et va boire un verre. ${weaponName} sera toujours la demain. Ou pas.`,
          kills > 30 ? `Au bout de ${kills} runs, t'es officiellement plus tetu qu'un ane. Et c'est un compliment.` : null,
        ];

        const valid = taunts.filter(Boolean);
        return valid[Math.floor(Math.random() * valid.length)];
      })();

      if (beruTaunt) {
        lastBeruTauntRef.current = Date.now();
        try { window.dispatchEvent(new CustomEvent('beru-react', { detail: { type: 'taunt', message: beruTaunt } })); } catch (e) {}
      }
    }

    // Grimoire Weiss drop (1/250 sur victoire ARC I — debloque ARC II)
    if (!data.arc2Unlocked && !data.grimoireWeiss && Math.random() < GRIMOIRE_WEISS.dropRate) {
      setData(prev => ({ ...prev, grimoireWeiss: true, arc2Unlocked: true }));
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('beru-react', {
          detail: { message: "ATTENDS ! C'est... le GRIMOIRE WEISS ?! Un livre qui parle ?! Il dit qu'il connait le chemin vers... Pascal ?! L'ARC II est debloque !!", mood: 'shocked' },
        }));
      }, 1500);
    }

    // Auto-farm stats tracking
    if (autoReplayRef.current) {
      const levelsGained = newLevel - level;
      const lootCount = (hunterDrop ? 1 : 0) + (weaponDrop ? 1 : 0) + (guaranteedArtifact ? 1 : 0) + (hammerDrop ? 1 : 0);
      setAutoFarmStats(prev => ({
        runs: prev.runs + 1,
        wins: prev.wins + 1,
        levels: prev.levels + levelsGained,
        coins: prev.coins + scaledCoins,
        loots: prev.loots + lootCount,
        hunters: prev.hunters + (hunterDrop ? 1 : 0),
        weapons: prev.weapons + (weaponDrop ? 1 : 0),
        artifacts: prev.artifacts + (guaranteedArtifact ? 1 : 0),
      }));
    }

    // Auto-replay logic — si arme droppée, pause 4.5s pour l'animation puis reprend
    if (autoReplayRef.current) {
      setView('result');
      const delay = weaponDrop ? 2250 : 750;
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
    // Loot boost: deduct elapsed time
    if (lootBoostStartRef.current) {
      const elapsed = Date.now() - lootBoostStartRef.current;
      lootBoostStartRef.current = null;
      setData(prev => ({ ...prev, lootBoostMs: Math.max(0, (prev.lootBoostMs || 0) - elapsed) }));
    }
    setData(prev => ({
      ...prev,
      stats: { ...prev.stats, battles: prev.stats.battles + 1 },
    }));
    setResult({ won: false });
    setView('result');
  }, [selChibi, selStage]);

  // ─── Flee ──────────────────────────────────────────────────

  const flee = () => {
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

      {/* Fixed bottom back button for sub-views (not result/battle/story) */}
      {!['hub', 'battle', 'result', 'arc2_story'].includes(view) && (
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
            const totalBonusEarned = accountAllocationsAtLevel(acc.level) * ACCOUNT_BONUS_AMOUNT;
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
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 flex-1">
                      {STAT_ORDER.filter(k => ab[k] > 0).map(k => (
                        <span key={k} className="text-[10px] text-gray-400">
                          {STAT_META[k].icon} {STAT_META[k].name} <span className="text-green-400 font-bold">+{ab[k]}</span>
                        </span>
                      ))}
                    </div>
                    <button onClick={() => {
                      if (!confirm('Reset tous les points de compte ? Tu pourras les re-distribuer.')) return;
                      const allocCount = accountAllocationsAtLevel(acc.level);
                      setData(prev => ({
                        ...prev,
                        accountBonuses: { hp: 0, atk: 0, def: 0, spd: 0, crit: 0, res: 0 },
                        accountAllocations: 0,
                      }));
                      setPendingAlloc(allocCount);
                    }} className="text-[9px] text-red-400 hover:text-red-300 px-1.5 py-0.5 rounded border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-all whitespace-nowrap" title="Redistribuer les points">
                      Reset
                    </button>
                  </div>
                )}
                {pendingPoints > 0 && (
                  <button
                    onClick={() => setPendingAlloc(Math.ceil(pendingPoints / ACCOUNT_BONUS_AMOUNT))}
                    className="mt-1.5 w-full text-center text-[10px] font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 rounded-lg py-1 hover:bg-yellow-500/20 transition-all animate-pulse">
                    {'\u2B50'} {pendingPoints} points de stats a attribuer !
                  </button>
                )}
                <div className="text-[10px] text-gray-600 mt-1 text-center">
                  Prochain bonus : Lv {nextAllocationLevel(acc.level)} (+{ACCOUNT_BONUS_AMOUNT} pts d'une stat au choix)
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

          {/* PVE Ranking Button */}
          <Link to="/shadow-colosseum/pve-ranking"
            className="block mb-4 p-3 rounded-xl border border-yellow-500/30 bg-gradient-to-r from-yellow-900/30 to-amber-900/30 hover:from-yellow-900/50 hover:to-amber-900/50 transition-all text-center group">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">{'\uD83C\uDFC6'}</span>
              <span className="font-bold text-yellow-400 group-hover:text-yellow-300">RANK PVE</span>
              <span className="text-xs text-gray-400">— Classement iLevel</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-0.5">Top 100 des meilleurs hunters par iLevel !</p>
          </Link>

          {/* Codex, Shop & Artifacts Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Link
              to="/codex"
              className="p-3 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-900/20 to-teal-900/20 hover:from-cyan-900/40 hover:to-teal-900/40 transition-all text-center group">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-lg">{'\uD83D\uDCD6'}</span>
                <span className="font-bold text-cyan-400 group-hover:text-cyan-300 text-sm">CODEX</span>
              </div>
              <p className="text-[10px] text-gray-500 mt-0.5">Encyclopedie</p>
            </Link>
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
                        <img src={getSprite(id)} alt={c.name} className="w-12 h-12 object-contain" style={{ filter: RARITY[c.rarity].glow, imageRendering: 'auto' }} />
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
                        <img src={getSprite(selChibi)} alt="" className="w-14 h-14 object-contain" style={{ filter: RARITY[getChibiData(selChibi).rarity].glow }} />
                        <div className="flex-1">
                          <div className="text-base font-bold">{getChibiData(selChibi).name}</div>
                          <div className="text-xs text-gray-400">
                            Lv{getChibiLevel(selChibi).level} {RARITY[getChibiData(selChibi).rarity].stars} {ELEMENTS[getChibiData(selChibi).element].icon}
                            {HUNTERS[selChibi] && <span className="ml-1 text-red-400">[Hunter]</span>}
                          </div>
                          {HUNTERS[selChibi] && (() => {
                            const _es = getChibiEveilStars(selChibi);
                            return _es > 0 ? (
                              <div className="text-[10px] mt-0.5">
                                <span className="text-yellow-400 font-bold">A{_es}</span>
                              </div>
                            ) : null;
                          })()}
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
                                  <div key={stat} className="relative">
                                    <div className="flex items-center gap-1.5 bg-gray-800/30 rounded-md px-2 py-1.5 cursor-pointer"
                                      onClick={() => setStatTooltip(statTooltip === stat ? null : stat)}>
                                      <span className="text-xs">{m.icon}</span>
                                      <span className={`text-[11px] font-bold ${m.color}`}>{m.name}</span>
                                      {m.detail && <span className="text-[8px] text-gray-600 hover:text-purple-400">?</span>}
                                      <span className="text-xs text-white ml-auto font-bold">{s[stat]}{isPct ? '%' : ''}</span>
                                    </div>
                                    {statTooltip === stat && m.detail && (
                                      <div className="absolute z-20 left-0 right-0 mt-0.5 p-2 rounded-lg bg-[#1a1a2e] border border-purple-500/30 text-[10px] text-purple-200 leading-relaxed shadow-xl">{m.detail}</div>
                                    )}
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
                        <img src={getSprite(id)} alt={c.name} className="w-10 h-10 object-contain" style={{ filter: RARITY[c.rarity].glow, imageRendering: 'auto' }} />
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
                            <div className="text-[9px] mt-0.5 text-yellow-400 font-bold">
                              A{evStars}
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

          {/* ═══ ARC TABS — ARC I / ARC II / Fiche ═══ */}
          {ownedIds.length > 0 && (
            <div className="flex items-center gap-1.5 mb-4 p-1 bg-gray-900/60 rounded-xl border border-gray-700/30">
              <button
                onClick={() => { setActiveArc(1); setSelStage(null); }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                  activeArc === 1
                    ? 'bg-gradient-to-r from-purple-600/40 to-indigo-600/40 text-purple-200 border border-purple-500/30 shadow shadow-purple-500/20'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/40'
                }`}
              >
                {'\u2694\uFE0F'} ARC I
                {(() => {
                  const cleared1 = STAGES.filter(s => isStageCleared(s.id)).length;
                  return cleared1 > 0 ? <span className="ml-1.5 text-[9px] opacity-60">{cleared1}/{STAGES.length}</span> : null;
                })()}
              </button>
              <button
                onClick={() => { if (arc2Unlocked) { setActiveArc(2); setSelStage(null); } else { handleArc2LockedClick(); } }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wide transition-all relative ${
                  !arc2Unlocked
                    ? 'text-gray-600 hover:text-gray-500 hover:bg-gray-800/20'
                    : activeArc === 2
                      ? 'bg-gradient-to-r from-red-600/40 to-purple-600/40 text-red-200 border border-red-500/30 shadow shadow-red-500/20'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/40'
                }`}
              >
                {!arc2Unlocked ? '\uD83D\uDD12' : '\u2694\uFE0F'} ARC II
                {arc2Unlocked && (() => {
                  const cleared2 = ARC2_STAGES.filter(s => isArc2StageCleared(s.id)).length;
                  return cleared2 > 0 ? <span className="ml-1.5 text-[9px] opacity-60">{cleared2}/{ARC2_STAGES.length}</span> : null;
                })()}
                {!arc2Unlocked && (data.arc2ClickCount || 0) >= 7 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                )}
              </button>
              <button
                onClick={() => setView('fiche')}
                className="py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wide transition-all text-gray-500 hover:text-gray-300 hover:bg-gray-800/40"
              >
                {'\uD83D\uDCCB'} Fiche
              </button>
            </div>
          )}

          {/* ═══ ARC I — Donjons ═══ */}
          {ownedIds.length > 0 && activeArc === 1 && [1, 2, 3, 4, 5, 6].map(tier => (
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
                            {stage.id === 'ragnarok' && (data.ragnarokKills || 0) > 0 && (
                              <span className="text-[10px] bg-orange-500/20 text-orange-300 px-1.5 rounded cursor-pointer hover:bg-orange-500/40 transition-colors"
                                onClick={(e) => { e.stopPropagation(); setRagnarokHistoryOpen(true); }}>
                                {'\u2620\uFE0F'}{data.ragnarokKills} kills
                              </span>
                            )}
                            {stage.id === 'zephyr' && (data.zephyrKills || 0) > 0 && (
                              <span className="text-[10px] bg-teal-500/20 text-teal-300 px-1.5 rounded">
                                {'\u2620\uFE0F'}{data.zephyrKills} kills
                              </span>
                            )}
                            {stage.id === 'supreme_monarch' && (data.monarchKills || 0) > 0 && (
                              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 rounded cursor-pointer hover:bg-purple-500/40 transition-colors"
                                onClick={(e) => { e.stopPropagation(); setMonarchHistoryOpen(true); }}>
                                {'\u2620\uFE0F'}{data.monarchKills} kills
                              </span>
                            )}
                            {data.lootBoostMs > 0 && ['ragnarok', 'zephyr', 'supreme_monarch'].includes(stage.id) && (
                              <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 rounded font-bold animate-pulse">{'\uD83D\uDD34'} x2 {(() => { const ms = data.lootBoostMs; const h = Math.floor(ms/3600000); const m = Math.floor((ms%3600000)/60000); return h > 0 ? `${h}h${String(m).padStart(2,'0')}m` : `${m}m`; })()}</span>
                            )}
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

          {/* ═══ ARC II — Retrouver Pascal ═══ */}
          {ownedIds.length > 0 && activeArc === 2 && arc2Unlocked && (
            <>
              <div className="text-center mb-3 p-2 rounded-xl bg-gradient-to-r from-purple-900/20 to-red-900/20 border border-purple-500/20">
                <div className="text-sm font-black bg-gradient-to-r from-purple-400 to-red-400 bg-clip-text text-transparent">
                  {'\u2694\uFE0F'} Retrouver Pascal
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">Bebe Machine Boy & Girl partent a la recherche de leur aine...</p>
              </div>

              {[1, 2, 3, 4, 5, 6].map(tier => {
                const tierStages = ARC2_STAGES.filter(s => s.tier === tier);
                const storyWatched = data.arc2StoriesWatched[tier];
                const prevTierBoss = tier > 1 ? ARC2_STAGES.filter(s => s.tier === tier - 1 && s.isBoss)[0] : null;
                const tierUnlocked = tier === 1 || (prevTierBoss && isArc2StageCleared(prevTierBoss.id));
                const tierMap = { 1: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771507737/mapTier1ARCII_q1mgs8.png' }[tier];

                return (
                  <div key={`a2t${tier}`} className="mb-4 relative rounded-xl overflow-hidden" style={tierMap ? { background: `linear-gradient(to bottom, rgba(15,15,26,0.75), rgba(15,15,26,0.92))` } : {}}>
                    {tierMap && <img src={tierMap} alt={ARC2_TIER_NAMES[tier]} className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" />}
                    <div className="relative p-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">
                      <span>Tier {tier} — {ARC2_TIER_NAMES[tier]}</span>
                      {tierUnlocked && ARC2_STORIES[tier]?.scenes?.length > 0 && (
                        <button
                          onClick={() => { setArc2StoryTier(tier); setArc2StoryIdx(0); setView('arc2_story'); }}
                          className={`text-[9px] border rounded px-2 py-0.5 transition-all ${
                            storyWatched
                              ? 'text-green-400/70 bg-green-500/5 border-green-500/15 hover:bg-green-500/15'
                              : 'text-purple-400 bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20 animate-pulse'
                          }`}>
                          {storyWatched ? '\u2705' : '\uD83D\uDCDC'} Story
                        </button>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      {tierStages.map((stage) => {
                        const globalIdx = ARC2_STAGES.indexOf(stage);
                        const unlocked = tierUnlocked && isArc2StageUnlocked(globalIdx);
                        const cleared = isArc2StageCleared(stage.id);

                        return (
                          <button
                            key={stage.id}
                            onClick={() => { if (unlocked) { setArc2SelStage(globalIdx); setArc2Team([null, null, null]); setArc2PickSlot(null); setView('arc2_team'); } }}
                            disabled={!unlocked}
                            className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                              !unlocked ? 'border-gray-800/40 bg-gray-900/20 opacity-40' :
                              cleared ? 'border-green-600/30 bg-green-900/10 hover:border-purple-500/40' :
                              'border-gray-700/40 bg-gray-800/30 hover:border-purple-500/40'
                            }`}
                          >
                            {!unlocked ? (
                              <span className="text-2xl w-10 text-center">{'\uD83D\uDD12'}</span>
                            ) : stage.sprite ? (
                              <img src={stage.sprite} alt={stage.name} className="w-10 h-10 object-contain rounded" />
                            ) : (
                              <span className="text-2xl w-10 text-center">{stage.emoji}</span>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-bold truncate">{stage.name}</span>
                                {stage.isBoss && <span className="text-[10px] bg-red-500/30 text-red-300 px-1.5 rounded">BOSS</span>}
                                {cleared && <span className="text-green-400 text-xs">{'\u2705'}</span>}
                              </div>
                              <div className="flex items-center gap-2.5 text-[11px] text-gray-400 mt-0.5">
                                <span className={ELEMENTS[stage.element]?.color || 'text-gray-400'}>{ELEMENTS[stage.element]?.icon} {ELEMENTS[stage.element]?.name}</span>
                                <span>PV:{(stage.hp / 1000).toFixed(0)}K</span>
                                <span>ATK:{stage.atk}</span>
                                <span>XP:{stage.xp}</span>
                                <span>{'\uD83D\uDCB0'}{stage.coins}</span>
                              </div>
                            </div>
                            {/* 3vN badge — enemy count from buildStageEnemies */}
                            {(() => {
                              const ec = { 1: { n: 2, b: 2 }, 2: { n: 2, b: 3 }, 3: { n: 3, b: 3 }, 4: { n: 3, b: 4 }, 5: { n: 4, b: 4 }, 6: { n: 4, b: 5 } };
                              const cnt = ec[stage.tier] || { n: 2, b: 2 };
                              const enemyCount = stage.isBoss ? cnt.b : cnt.n;
                              return (
                                <span className="text-[9px] font-bold bg-gradient-to-r from-red-500/30 to-purple-500/30 text-red-300 px-1.5 py-0.5 rounded border border-red-500/20">
                                  3v{enemyCount}
                                </span>
                              );
                            })()}
                          </button>
                        );
                      })}
                    </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}

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

      {/* ═══ ARC II STORY VIEW ═══ */}
      {view === 'arc2_story' && arc2StoryTier && (() => {
        const story = ARC2_STORIES[arc2StoryTier];
        if (!story) return null;
        const scenes = story.scenes || [];
        const hasScenes = scenes.length > 0 && scenes.some(s => s.text || s.src);
        const currentScene = scenes[arc2StoryIdx];
        const isLastScene = arc2StoryIdx >= scenes.length - 1 || !hasScenes;

        const SPEAKER_STYLES = {
          narrator: { label: 'Narrateur', color: 'text-gray-400', border: 'border-gray-500/30', bg: 'bg-gray-900/90', icon: '\uD83D\uDCDC' },
          bebe_girl: { label: 'Bebe Machine Girl', color: 'text-pink-400', border: 'border-pink-500/30', bg: 'bg-pink-950/40', icon: '\uD83C\uDF38' },
          bebe_boy: { label: 'Bebe Machine Boy', color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-950/40', icon: '\u26A1' },
          beru: { label: 'Beru', color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-950/40', icon: '\uD83D\uDC7E' },
        };

        const advanceScene = () => {
          if (!isLastScene) setArc2StoryIdx(arc2StoryIdx + 1);
        };

        const finishStory = () => {
          stopStoryMusic();
          setData(prev => ({ ...prev, arc2StoriesWatched: { ...prev.arc2StoriesWatched, [arc2StoryTier]: true } }));
          setArc2StoryTier(null);
          setArc2StoryIdx(0);
          setView('hub');
        };

        // Start music if story has one and not already playing
        if (story.music && !storyMusicRef.current) {
          const audio = new Audio(story.music);
          audio.loop = true;
          audio.volume = 0.35;
          audio.play().catch(() => {});
          storyMusicRef.current = audio;
        }

        return (
          <div className="fixed inset-0 z-50 bg-black flex flex-col">
            {/* Ambient particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="absolute rounded-full bg-purple-500/10"
                  style={{
                    width: 2 + Math.random() * 4, height: 2 + Math.random() * 4,
                    left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                    animation: `float ${8 + Math.random() * 12}s ease-in-out infinite ${Math.random() * 5}s`,
                  }} />
              ))}
            </div>

            {/* Story header */}
            <div className="text-center pt-5 pb-2 relative z-10">
              <div className="text-[10px] text-purple-400/50 uppercase tracking-[0.25em] mb-1">Arc II — Retrouver Pascal</div>
              <h2 className="text-base font-black text-white/90">{story.title}</h2>
              {/* Progress bar */}
              <div className="mt-2 mx-auto w-48 h-0.5 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-red-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${((arc2StoryIdx + 1) / Math.max(scenes.length, 1)) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>

            {/* Tappable story content area */}
            <div
              className="flex-1 flex items-center justify-center px-5 relative z-10 cursor-pointer"
              onClick={() => { if (!isLastScene) advanceScene(); }}
            >
              {hasScenes && currentScene ? (
                <motion.div
                  key={arc2StoryIdx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="max-w-lg w-full"
                >
                  {/* Image scene */}
                  {currentScene.type === 'image' && currentScene.src && (
                    <motion.img
                      src={currentScene.src} alt={currentScene.alt || ''}
                      className="w-full rounded-2xl shadow-2xl shadow-purple-900/30"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                    />
                  )}
                  {currentScene.type === 'image' && !currentScene.src && (
                    <div className="w-full h-52 bg-gray-900/60 rounded-2xl border border-gray-700/30 flex flex-col items-center justify-center">
                      <span className="text-4xl mb-2">{'\uD83D\uDDBC\uFE0F'}</span>
                      <span className="text-gray-600 text-xs">{currentScene.alt || 'Image a venir...'}</span>
                    </div>
                  )}

                  {/* Text/Dialogue scene — bubble style */}
                  {(currentScene.type === 'text' || currentScene.type === 'dialogue') && (() => {
                    const spk = SPEAKER_STYLES[currentScene.speaker] || SPEAKER_STYLES.narrator;
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className={`relative p-5 rounded-2xl ${spk.bg} border ${spk.border} shadow-lg`}
                      >
                        {/* Speaker badge */}
                        {currentScene.speaker && (
                          <div className={`flex items-center gap-1.5 mb-3 ${spk.color}`}>
                            <span className="text-sm">{spk.icon}</span>
                            <span className="text-[11px] font-bold uppercase tracking-wider">{spk.label}</span>
                          </div>
                        )}
                        {/* Typewriter text */}
                        {currentScene.text ? (
                          <StoryTypewriter key={`tw-${arc2StoryIdx}`} text={currentScene.text} speaker={currentScene.speaker} />
                        ) : (
                          <p className="text-sm text-gray-600 italic">Texte a venir...</p>
                        )}
                        {/* Bubble tail */}
                        <div className={`absolute -bottom-2 left-8 w-4 h-4 ${spk.bg} ${spk.border} border-t-0 border-l-0 rotate-45`} />
                      </motion.div>
                    );
                  })()}
                </motion.div>
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-4">{'\uD83D\uDCDC'}</div>
                  <p className="text-gray-500 text-sm">Contenu de la story a venir...</p>
                </div>
              )}
            </div>

            {/* Tap hint */}
            {!isLastScene && hasScenes && (
              <motion.div
                className="text-center pb-1 text-[10px] text-gray-600 relative z-10"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                Touche pour continuer...
              </motion.div>
            )}

            {/* Story controls — bottom bar */}
            <div className="p-4 flex items-center gap-3 relative z-10">
              <button
                onClick={(e) => { e.stopPropagation(); if (arc2StoryIdx > 0) setArc2StoryIdx(arc2StoryIdx - 1); }}
                disabled={arc2StoryIdx === 0}
                className="px-3 py-2.5 rounded-xl bg-gray-800/80 text-xs text-gray-400 disabled:opacity-20 hover:bg-gray-700 transition-colors"
              >
                {'\u2190'}
              </button>
              <span className="text-[10px] text-gray-600 min-w-[40px] text-center">{hasScenes ? `${arc2StoryIdx + 1}/${scenes.length}` : ''}</span>

              {!isLastScene ? (
                <button
                  onClick={(e) => { e.stopPropagation(); advanceScene(); }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600/40 to-purple-500/30 text-sm font-bold text-purple-200 hover:from-purple-600/60 hover:to-purple-500/50 transition-all active:scale-[0.98] border border-purple-500/20"
                >
                  Suivant {'\u2192'}
                </button>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); finishStory(); }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-red-600 text-sm text-white font-black hover:scale-[1.02] transition-transform active:scale-[0.98] shadow-lg shadow-purple-900/40"
                >
                  {hasScenes ? '\u2694\uFE0F Commencer le combat' : 'Fermer'}
                </button>
              )}

              {/* Skip button */}
              <button
                onClick={(e) => { e.stopPropagation(); finishStory(); }}
                className="px-3 py-2.5 rounded-xl bg-gray-800/60 text-[10px] text-gray-500 hover:text-gray-300 hover:bg-gray-700/60 transition-colors"
              >
                Passer
              </button>
            </div>
          </div>
        );
      })()}

      {/* ═══ ARC II TEAM PICKER VIEW ═══ */}
      {view === 'arc2_team' && arc2SelStage !== null && (() => {
        const stage = ARC2_STAGES[arc2SelStage];
        if (!stage) return null;

        // Pool of all owned chibis + hunters
        const allOwnedIds = [...ownedIds, ...ownedHunterIds];
        const alreadyPicked = arc2Team.filter(Boolean);

        // Element that beats the stage's element
        const advantageElement = Object.entries(ELEMENTS).find(([, v]) => v.beats === stage.element)?.[0] || null;

        // Auto-setup: pick top 3 by level, prioritize element advantage
        const autoSetup = () => {
          const scored = allOwnedIds.map(id => {
            const c = getChibiData(id);
            if (!c) return null;
            const lv = getChibiLevel(id).level;
            const elemBonus = c.element === advantageElement ? 500 : ELEMENTS[c.element]?.beats === stage.element ? 500 : 0;
            const elemPenalty = ELEMENTS[stage.element]?.beats === c.element ? -200 : 0;
            return { id, score: lv + elemBonus + elemPenalty };
          }).filter(Boolean).sort((a, b) => b.score - a.score);
          const top3 = scored.slice(0, 3).map(s => s.id);
          setArc2Team([top3[0] || null, top3[1] || null, top3[2] || null]);
          setArc2PickSlot(null);
        };

        // Load previous team
        const lastTeam = data.arc2LastTeam || [];
        const hasLastTeam = lastTeam.length > 0 && lastTeam.some(id => id && allOwnedIds.includes(id));

        const loadPreviousTeam = () => {
          const valid = lastTeam.map(id => (id && allOwnedIds.includes(id)) ? id : null);
          setArc2Team([valid[0] || null, valid[1] || null, valid[2] || null]);
          setArc2PickSlot(null);
        };

        // Filter + sort chibis in picker
        const getFilteredChibis = () => {
          let pool = allOwnedIds.filter(id => !alreadyPicked.includes(id));
          // Element filter
          if (arc2Filter.element === 'advantage') {
            pool = pool.filter(id => { const c = getChibiData(id); return c && c.element === advantageElement; });
          } else if (arc2Filter.element !== 'all') {
            pool = pool.filter(id => { const c = getChibiData(id); return c && c.element === arc2Filter.element; });
          }
          // Sort
          if (arc2Filter.sort === 'power') {
            const psCache = {};
            const getPS = (id) => {
              if (psCache[id] !== undefined) return psCache[id];
              const c = getChibiData(id); if (!c) return (psCache[id] = 0);
              const lv = getChibiLevel(id).level;
              const alloc = data.statPoints[id] || {};
              const tb = getChibiTalentBonuses(id);
              const eqB = getChibiEquipBonuses(id);
              const evS = getChibiEveilStars(id);
              const fs = statsAtFull(c.base, c.growth, lv, alloc, tb, eqB, evS, data.accountBonuses);
              return (psCache[id] = calculatePowerScore(fs));
            };
            pool.sort((a, b) => getPS(b) - getPS(a));
          } else if (arc2Filter.sort === 'element') {
            pool.sort((a, b) => {
              const cA = getChibiData(a), cB = getChibiData(b);
              const sA = cA?.element === advantageElement ? 2 : ELEMENTS[stage.element]?.beats === cA?.element ? 0 : 1;
              const sB = cB?.element === advantageElement ? 2 : ELEMENTS[stage.element]?.beats === cB?.element ? 0 : 1;
              return sB - sA || getChibiLevel(b).level - getChibiLevel(a).level;
            });
          } else {
            pool.sort((a, b) => getChibiLevel(b).level - getChibiLevel(a).level);
          }
          return pool;
        };

        return (
          <div className="max-w-2xl mx-auto px-4 pt-4 pb-24">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="text-[10px] text-purple-400/60 uppercase tracking-widest mb-1">Arc II — {ARC2_TIER_NAMES[stage.tier]}</div>
              <h2 className="text-lg font-black text-white">{stage.emoji} {stage.name}</h2>
              <div className="flex items-center justify-center gap-3 text-[11px] text-gray-400 mt-1">
                <span className={ELEMENTS[stage.element]?.color}>{ELEMENTS[stage.element]?.icon} {ELEMENTS[stage.element]?.name}</span>
                <span>PV:{(stage.hp / 1000).toFixed(0)}K</span>
                <span>ATK:{stage.atk}</span>
                {stage.isBoss && <span className="text-red-400 font-bold">BOSS</span>}
              </div>
              {advantageElement && (
                <div className="text-[10px] mt-1">
                  <span className="text-gray-600">Avantage : </span>
                  <span className={ELEMENTS[advantageElement]?.color}>{ELEMENTS[advantageElement]?.icon} {ELEMENTS[advantageElement]?.name}</span>
                  <span className="text-green-400"> (+30%)</span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 mb-4">
              <button onClick={autoSetup}
                className="flex-1 py-2 rounded-lg bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 text-[10px] font-bold text-purple-300 hover:bg-purple-500/30 transition-all active:scale-[0.98]">
                {'\u26A1'} Auto Setup
              </button>
              {hasLastTeam && (
                <button onClick={loadPreviousTeam}
                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 text-[10px] font-bold text-blue-300 hover:bg-blue-500/30 transition-all active:scale-[0.98]">
                  {'\uD83D\uDD04'} Equipe prec.
                </button>
              )}
              {alreadyPicked.length > 0 && (
                <button onClick={() => { setArc2Team([null, null, null]); setArc2PickSlot(null); }}
                  className="py-2 px-3 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-400 hover:bg-red-500/20 transition-all">
                  {'\u2716'}
                </button>
              )}
            </div>

            {/* 3 Team Slots */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[0, 1, 2].map(slot => {
                const chibiId = arc2Team[slot];
                const chibi = chibiId ? getChibiData(chibiId) : null;
                const isPickingThis = arc2PickSlot === slot;
                const elemColor = chibi ? (ELEMENTS[chibi.element]?.color || 'text-gray-400') : '';

                return (
                  <button
                    key={slot}
                    onClick={() => setArc2PickSlot(isPickingThis ? null : slot)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isPickingThis ? 'border-purple-400 bg-purple-500/15 ring-1 ring-purple-400/40' :
                      chibi ? 'border-green-500/30 bg-green-900/10' :
                      'border-gray-700/40 bg-gray-800/30 border-dashed'
                    }`}
                  >
                    {chibi ? (
                      <>
                        <img src={getChibiSprite(chibiId)} alt={chibi.name} className="w-12 h-12 mx-auto object-contain" style={{ filter: RARITY[chibi.rarity]?.glow }} />
                        <div className="text-[10px] font-bold mt-1 truncate">{chibi.name}</div>
                        <div className="text-[9px] text-gray-500">Lv{getChibiLevel(chibiId).level}</div>
                        <div className={`text-[8px] ${elemColor}`}>{ELEMENTS[chibi.element]?.icon} {ELEMENTS[chibi.element]?.name}</div>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl mb-1">{'\u2795'}</div>
                        <div className="text-[10px] text-gray-500">Slot {slot + 1}</div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ─── Team Synergy Panel ─── */}
            {alreadyPicked.length > 0 && (() => {
              const rd = loadRaidData();
              const teamMembers = alreadyPicked.map(id => {
                const c = getChibiData(id);
                if (!c) return null;
                const { level } = getChibiLevel(id);
                const isHunter = !!HUNTERS[id];
                const stars = isHunter ? getHunterStars(rd, id) : 0;
                const hp = isHunter ? HUNTER_PASSIVE_EFFECTS[id] : null;
                const alloc = data.statPoints[id] || {};
                const tb = getChibiTalentBonuses(id);
                const eqB = getChibiEquipBonuses(id);
                const evS = getChibiEveilStars(id);
                const fs = statsAtFull(c.base, c.growth, level, alloc, tb, eqB, evS, data.accountBonuses);
                return { id, ...c, level, isHunter, stars, hp, fs };
              }).filter(Boolean);

              // Count elements
              const elemCounts = {};
              teamMembers.forEach(m => { elemCounts[m.element] = (elemCounts[m.element] || 0) + 1; });

              // Collect team-wide bonuses
              const teamBonuses = [];
              teamMembers.forEach(m => {
                if (!m.hp) return;
                const desc = HUNTERS[m.id]?.passiveDesc || '';
                if (m.hp.type === 'permanent' && m.hp.stats) {
                  const parts = Object.entries(m.hp.stats).map(([k, v]) => `${k.toUpperCase()} +${v}%`);
                  teamBonuses.push({ source: m.name, label: `${parts.join(', ')} (permanent)`, color: 'text-emerald-400', type: 'self' });
                }
                if (m.hp.type === 'teamDef') teamBonuses.push({ source: m.name, label: `DEF +${m.hp.value}% equipe`, color: 'text-teal-400', type: 'team' });
                if (m.hp.type === 'healBonus') teamBonuses.push({ source: m.name, label: `Soin +${m.hp.value}%`, color: 'text-green-400', type: 'self' });
                if (m.hp.type === 'critDmg') teamBonuses.push({ source: m.name, label: `CRIT DMG +${m.hp.value}%`, color: 'text-amber-400', type: 'self' });
                if (m.hp.type === 'magicDmg') teamBonuses.push({ source: m.name, label: `DMG Magique +${m.hp.value}%`, color: 'text-indigo-400', type: 'self' });
                if (m.hp.type === 'aoeDmg') teamBonuses.push({ source: m.name, label: `DMG AoE +${m.hp.value}%`, color: 'text-cyan-400', type: 'self' });
                if (m.hp.type === 'dotDmg') teamBonuses.push({ source: m.name, label: `DMG DoT +${m.hp.value}%`, color: 'text-lime-400', type: 'self' });
                if (m.hp.type === 'defIgnore') teamBonuses.push({ source: m.name, label: `Ignore DEF +${m.hp.value}% (crit)`, color: 'text-gray-300', type: 'self' });
                if (m.hp.type === 'debuffBonus') teamBonuses.push({ source: m.name, label: `Debuff +${m.hp.value}%`, color: 'text-rose-400', type: 'self' });
                if (m.hp.type === 'buffBonus') teamBonuses.push({ source: m.name, label: `Buff +${m.hp.value}%`, color: 'text-violet-400', type: 'self' });
                if (m.hp.type === 'lowHp') teamBonuses.push({ source: m.name, label: `<${m.hp.threshold}% PV: ${Object.entries(m.hp.stats).map(([k,v])=>`${k.toUpperCase()}+${v}%`).join(', ')}`, color: 'text-red-400', type: 'conditional' });
                if (m.hp.type === 'highHp') teamBonuses.push({ source: m.name, label: `>${m.hp.threshold}% PV: ${Object.entries(m.hp.stats).map(([k,v])=>`${k.toUpperCase()}+${v}%`).join(', ')}`, color: 'text-blue-400', type: 'conditional' });
                if (m.hp.type === 'firstTurn') teamBonuses.push({ source: m.name, label: `Tour 1: ${Object.entries(m.hp.stats).map(([k,v])=>`${k.toUpperCase()}+${v}%`).join(', ')}`, color: 'text-yellow-400', type: 'conditional' });
                if (m.hp.type === 'stacking') teamBonuses.push({ source: m.name, label: `Stack ATK +${m.hp.perStack?.atk || 0}%/attaque (max ${m.hp.maxStacks})`, color: 'text-orange-400', type: 'conditional' });
                if (m.hp.type === 'vsBoss') teamBonuses.push({ source: m.name, label: `vs Boss: ATK +${m.hp.stats?.atk || 0}%`, color: 'text-red-300', type: 'conditional' });
                if (m.hp.type === 'vsLowHp') teamBonuses.push({ source: m.name, label: `vs Ennemi <${m.hp.threshold}%: CRIT +${m.hp.stats?.crit || 0}`, color: 'text-pink-400', type: 'conditional' });
                if (m.hp.type === 'vsDebuffed') teamBonuses.push({ source: m.name, label: `vs Debuff: ATK +${m.hp.stats?.atk || 0}%`, color: 'text-purple-400', type: 'conditional' });
                if (m.hp.type === 'skillCd') teamBonuses.push({ source: m.name, label: `Skills CD${m.hp.minCd}+: CRIT +${m.hp.stats?.crit || 0}`, color: 'text-fuchsia-400', type: 'conditional' });
              });

              return (
                <div className="mb-4 p-3 rounded-xl bg-gray-900/60 border border-purple-500/20 backdrop-blur-sm">
                  <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-2">Synergies d'equipe</div>

                  {/* Element composition */}
                  <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-gray-700/30">
                    <span className="text-[9px] text-gray-500">Elements :</span>
                    {Object.entries(elemCounts).map(([elem, cnt]) => (
                      <span key={elem} className={`flex items-center gap-0.5 text-[10px] font-bold ${ELEMENTS[elem]?.color || 'text-gray-400'}`}>
                        {ELEMENTS[elem]?.icon} {cnt > 1 ? `x${cnt}` : ''}
                      </span>
                    ))}
                    {Object.keys(elemCounts).length === 1 && (
                      <span className="text-[9px] text-emerald-400 ml-1">Mono-element!</span>
                    )}
                    {advantageElement && Object.keys(elemCounts).includes(advantageElement) && (
                      <span className="text-[9px] text-green-400 ml-1">+30% avantage</span>
                    )}
                  </div>

                  {/* Per-member stats card */}
                  <div className="space-y-2 mb-2.5">
                    {teamMembers.map(m => {
                      const elemAdv = m.element === advantageElement;
                      const elemWeak = ELEMENTS[stage.element]?.beats === m.element;
                      return (
                        <div key={m.id} className="flex items-start gap-2.5 p-2 rounded-lg bg-gray-800/40">
                          <img src={getChibiSprite(m.id)} alt="" className="w-9 h-9 object-contain rounded-lg flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[11px] font-bold text-white truncate">{m.name}</span>
                              <span className={`text-[9px] ${ELEMENTS[m.element]?.color}`}>{ELEMENTS[m.element]?.icon}</span>
                              {m.isHunter && m.stars > 0 && <span className="text-[8px] text-yellow-400 font-bold">A{m.stars}</span>}
                              {elemAdv && <span className="text-[8px] px-1 rounded bg-green-900/50 text-green-400">+30%</span>}
                              {elemWeak && <span className="text-[8px] px-1 rounded bg-red-900/50 text-red-400">-30%</span>}
                            </div>
                            {/* Stats row */}
                            <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 text-[9px]">
                              <span className="text-red-400">ATK:{m.fs.atk}</span>
                              <span className="text-green-400">HP:{m.fs.hp}</span>
                              <span className="text-blue-400">DEF:{m.fs.def}</span>
                              <span className="text-yellow-400">SPD:{m.fs.spd}</span>
                              <span className="text-amber-400">CRIT:{Math.min(80, m.fs.crit).toFixed(0)}</span>
                              <span className="text-purple-400">RES:{Math.min(70, m.fs.res).toFixed(0)}</span>
                            </div>
                            {/* Skills summary */}
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(m.skills || []).map((sk, si) => {
                                const tags = [];
                                if (sk.power > 0) tags.push({ t: `${sk.power}%`, c: 'text-red-300' });
                                if (sk.buffAtk) tags.push({ t: `ATK+${sk.buffAtk}`, c: 'text-green-300' });
                                if (sk.buffDef) tags.push({ t: `DEF+${sk.buffDef}`, c: 'text-blue-300' });
                                if (sk.healSelf) tags.push({ t: `Heal`, c: 'text-emerald-300' });
                                if (sk.debuffDef) tags.push({ t: `DEF-${sk.debuffDef}`, c: 'text-orange-300' });
                                return (
                                  <span key={si} className="px-1 py-0.5 rounded bg-gray-700/50 text-[8px] text-gray-400">
                                    {sk.name}{tags.length > 0 && <span className={`ml-0.5 ${tags[0].c}`}>{tags.map(t => t.t).join(' ')}</span>}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Team-wide bonuses */}
                  {teamBonuses.length > 0 && (
                    <div className="pt-2 border-t border-gray-700/30">
                      <div className="text-[9px] text-gray-500 font-bold uppercase mb-1">Passifs actifs</div>
                      <div className="space-y-0.5">
                        {teamBonuses.map((b, i) => (
                          <div key={i} className="flex items-center gap-2 text-[10px]">
                            <span className="text-gray-500 w-20 truncate text-right">{b.source}</span>
                            <span className={`font-medium ${b.color}`}>{b.label}</span>
                            {b.type === 'team' && <span className="text-[8px] px-1 rounded bg-teal-900/40 text-teal-300">EQUIPE</span>}
                            {b.type === 'conditional' && <span className="text-[8px] px-1 rounded bg-yellow-900/30 text-yellow-400">COND.</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Remove button if slot has a chibi */}
            {arc2PickSlot !== null && arc2Team[arc2PickSlot] && (
              <button
                onClick={() => {
                  const newTeam = [...arc2Team];
                  newTeam[arc2PickSlot] = null;
                  setArc2Team(newTeam);
                  setArc2PickSlot(null);
                }}
                className="w-full mb-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-colors"
              >
                Retirer du slot {arc2PickSlot + 1}
              </button>
            )}

            {/* Chibi picker (shown when a slot is being picked) */}
            {arc2PickSlot !== null && (
              <div className="mb-4">
                <div className="text-[10px] text-gray-500 mb-2 font-bold uppercase">Choisir un combattant :</div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  {/* Element filter */}
                  {[
                    { key: 'all', label: 'Tous', color: 'text-gray-400' },
                    ...(advantageElement ? [{ key: 'advantage', label: `${ELEMENTS[advantageElement]?.icon} Avantage`, color: 'text-green-400' }] : []),
                    ...Object.entries(ELEMENTS).map(([k, v]) => ({ key: k, label: `${v.icon}`, color: v.color })),
                  ].map(opt => (
                    <button key={opt.key} onClick={() => setArc2Filter(f => ({ ...f, element: opt.key }))}
                      className={`px-2 py-1 rounded text-[9px] font-bold border transition-all ${
                        arc2Filter.element === opt.key
                          ? 'border-purple-400 bg-purple-500/20 text-white'
                          : 'border-gray-700/30 bg-gray-800/30 hover:border-gray-600 ' + opt.color
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                  {/* Sort separator */}
                  <span className="text-gray-700 mx-1">|</span>
                  {/* Sort options */}
                  {[
                    { key: 'level', label: 'Niveau' },
                    { key: 'power', label: 'Puissance' },
                    { key: 'element', label: 'Element' },
                  ].map(opt => (
                    <button key={opt.key} onClick={() => setArc2Filter(f => ({ ...f, sort: opt.key }))}
                      className={`px-2 py-1 rounded text-[9px] font-bold border transition-all ${
                        arc2Filter.sort === opt.key
                          ? 'border-yellow-400/60 bg-yellow-500/10 text-yellow-300'
                          : 'border-gray-700/30 bg-gray-800/30 text-gray-500 hover:border-gray-600'
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
                  {getFilteredChibis().map(id => {
                    const c = getChibiData(id);
                    if (!c) return null;
                    const lv = getChibiLevel(id).level;
                    const isAdvantage = c.element === advantageElement;
                    const isWeak = ELEMENTS[stage.element]?.beats === c.element;
                    const cEl = ELEMENTS[c.element];
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          const newTeam = [...arc2Team];
                          newTeam[arc2PickSlot] = id;
                          setArc2Team(newTeam);
                          setArc2PickSlot(null);
                        }}
                        className={`p-2 rounded-lg border transition-all text-center ${
                          isAdvantage ? 'border-green-500/40 bg-green-900/10 hover:border-green-400/60' :
                          isWeak ? 'border-red-500/20 bg-red-900/5 opacity-60 hover:opacity-80' :
                          'border-gray-700/30 bg-gray-800/30 hover:border-purple-500/40'
                        }`}
                      >
                        <img src={getSprite(id)} alt={c.name} className="w-10 h-10 mx-auto object-contain" style={{ filter: RARITY[c.rarity]?.glow }} />
                        <div className="text-[9px] font-bold truncate mt-1">{c.name}</div>
                        <div className="text-[8px] text-gray-500">Lv{lv}</div>
                        <div className={`text-[7px] ${cEl?.color || 'text-gray-500'}`}>
                          {cEl?.icon}
                          {isAdvantage && <span className="text-green-400 ml-0.5">+30%</span>}
                          {isWeak && <span className="text-red-400 ml-0.5">-30%</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Star selector (only if stage cleared) */}
            {(() => {
              const maxSt = getArc2MaxStars(stage.id);
              if (maxSt < 0) return null;
              const sc = getStarScaledStats(stage, arc2Star);
              return (
                <div className="mb-4 p-3 rounded-xl bg-gray-900/60 border border-purple-500/20">
                  <div className="text-[10px] text-gray-500 font-bold mb-1.5">Difficulte {'\u2B50'}</div>
                  <div className="grid grid-cols-11 gap-[3px] mb-2">
                    {[0,1,2,3,4,5,6,7,8,9,10].map(s => {
                      const ok = s === 0 || s <= maxSt + 1;
                      return (
                        <button key={s} onClick={() => { if (ok) setArc2Star(s); }} disabled={!ok}
                          className={`aspect-square rounded text-[9px] font-bold transition-all ${
                            arc2Star === s ? 'bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-400/60' :
                            !ok ? 'bg-gray-800/60 text-gray-600 opacity-40' :
                            'bg-gray-700/50 text-yellow-400 hover:bg-gray-600'
                          }`}>
                          {s === 0 ? '-' : s}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-gray-500">
                    <span>PV:{(sc.hp / 1000).toFixed(0)}K ATK:{sc.atk}</span>
                    <span>Record: {maxSt}{'\u2605'}</span>
                  </div>
                </div>
              );
            })()}

            {/* Fight & Back buttons */}
            <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-3 z-50">
              <button
                onClick={() => { setView('hub'); setArc2SelStage(null); setArc2Team([null, null, null]); setArc2PickSlot(null); setArc2Star(0); }}
                className="px-5 py-2.5 bg-gray-700 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-transform"
              >
                {'\u2190'} Retour
              </button>
              {arc2Team.filter(Boolean).length > 0 && (
                <button
                  onClick={startArc2Battle}
                  className="px-8 py-2.5 bg-gradient-to-r from-purple-600 to-red-600 rounded-xl font-black text-lg shadow-xl shadow-purple-900/40 hover:scale-105 transition-transform active:scale-95"
                >
                  {'\u2694\uFE0F'} COMBAT 3v1 !
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* ═══ ARC II MULTI-ENEMY BATTLE VIEW ═══ */}
      {view === 'arc2_battle' && arc2Battle && (() => {
        const { team, enemies, turnOrder, currentTurn, round, phase, log, lastAction, pendingSkill } = arc2Battle;
        const curEntity = turnOrder[currentTurn];
        const isPlayerTurn = phase === 'pick' && curEntity?.type === 'team';
        const isPickTarget = phase === 'pick_target';
        const isPickAlly = phase === 'pick_ally';
        const activeChar = (isPlayerTurn || isPickTarget || isPickAlly) ? team[curEntity?.idx] : null;
        const aliveEnemies = enemies.filter(e => e.alive);
        const mainEnemy = enemies.find(e => e.isMain) || enemies[0];
        const mainEl = ELEMENTS[mainEnemy?.element] || ELEMENTS.shadow;

        // ─── BuffBadges helper — compact (arena inline) or detailed (tooltip panel) ───
        const BuffBadges = ({ buffs, detailed }) => {
          if (!buffs || buffs.length === 0) return null;
          const getBuffLabel = (bf) => {
            if (bf.type === 'poison') return `Poison: ${Math.round((bf.value || 0.05) * 100)}% PV/tour (${bf.dur}t)`;
            if (bf.type === 'antiHeal') return `Anti-Heal: soins bloques (${bf.dur}t)`;
            const statName = { atk: 'ATK', def: 'DEF', spd: 'SPD' }[bf.stat] || bf.stat;
            const sign = bf.value > 0 ? '+' : '';
            const durTxt = bf.dur >= 999 ? 'permanent' : `${bf.dur}t`;
            return `${statName} ${sign}${Math.round(bf.value * 100)}% (${durTxt})`;
          };
          if (detailed) {
            return (
              <div className="flex flex-col gap-0.5">
                {buffs.map((bf, i) => {
                  const label = getBuffLabel(bf);
                  const isPoison = bf.type === 'poison';
                  const isAntiHeal = bf.type === 'antiHeal';
                  const icon = !isPoison && !isAntiHeal ? BUFF_ICONS[bf.stat] : null;
                  const isPos = bf.value > 0;
                  const colorClass = isPoison ? 'text-green-400' : isAntiHeal ? 'text-pink-400' : icon ? (isPos ? icon.posColor : icon.negColor) : 'text-gray-400';
                  const emoji = isPoison ? '☠️' : isAntiHeal ? '🚫' : icon ? (isPos ? icon.pos : icon.neg) : '?';
                  return (
                    <div key={i} className={`flex items-center gap-1.5 px-2 py-0.5 rounded ${isPos || isPoison || isAntiHeal ? (isPoison || isAntiHeal || !isPos ? 'bg-red-900/30' : 'bg-green-900/30') : 'bg-red-900/30'}`}>
                      <span className="text-[10px]">{emoji}</span>
                      <span className={`text-[9px] font-medium ${colorClass}`}>{label}</span>
                    </div>
                  );
                })}
              </div>
            );
          }
          return (
            <div className="flex flex-wrap gap-0.5 mt-0.5">
              {buffs.map((bf, i) => {
                const label = getBuffLabel(bf);
                if (bf.type === 'poison') return <span key={i} className="text-[7px] text-green-500 cursor-help" title={label}>☠️<sub>{bf.dur}</sub></span>;
                if (bf.type === 'antiHeal') return <span key={i} className="text-[7px] text-pink-500 cursor-help" title={label}>🚫<sub>{bf.dur >= 999 ? '' : bf.dur}</sub></span>;
                const icon = BUFF_ICONS[bf.stat];
                if (!icon) return null;
                const isPos = bf.value > 0;
                if (bf.dur >= 999) return <span key={i} className={`text-[7px] ${isPos ? icon.posColor : icon.negColor} cursor-help`} title={label}>{isPos ? icon.pos : icon.neg}</span>;
                return <span key={i} className={`text-[7px] ${isPos ? icon.posColor : icon.negColor} cursor-help`} title={label}>{isPos ? icon.pos : icon.neg}<sub>{bf.dur}</sub></span>;
              })}
            </div>
          );
        };

        // ─── Damage preview for pick_target ───
        const previewData = (isPickTarget && activeChar && pendingSkill != null) ? (() => {
          const skill = activeChar.skills[pendingSkill];
          if (!skill || skill.power <= 0) return {};
          const previews = {};
          enemies.forEach((en, ei) => {
            if (!en.alive) return;
            previews[ei] = computeDamagePreview(activeChar, skill, en, activeChar.tb || {});
          });
          return previews;
        })() : {};

        return (
          <div className="max-w-md mx-auto px-3 pt-3 pb-6">
            {/* Header: Turn + Turn Order + Flee */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-500">Tour {round}</span>
                <div className="flex items-center gap-0.5">
                  {turnOrder.map((e, i) => {
                    const isNow = i === currentTurn;
                    const isDead = e.type === 'team' ? !team[e.idx]?.alive : !enemies[e.idx]?.alive;
                    return (
                      <div key={i} className={`relative w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold border transition-all ${
                        isDead ? 'bg-gray-800 border-gray-700 opacity-30' :
                        isNow ? 'bg-yellow-500/30 border-yellow-400 ring-1 ring-yellow-400/50 scale-110' :
                        e.isExtra ? (e.type === 'enemy' ? 'bg-red-500/10 border-red-500/20 border-dashed' : 'bg-emerald-500/10 border-emerald-500/20 border-dashed') :
                        e.type === 'enemy' ? 'bg-red-500/20 border-red-500/30' :
                        'bg-blue-500/20 border-blue-500/30'
                      }`}>
                        {e.isExtra && !isDead && <span className="absolute -top-1.5 -right-1 text-[6px]">{'\u26A1'}</span>}
                        {e.type === 'enemy' ? (enemies[e.idx]?.isMain ? '\uD83D\uDC80' : `E${e.idx+1}`) : (e.idx + 1)}
                      </div>
                    );
                  })}
                </div>
              </div>
              <button onClick={fleeArc2} className="text-[10px] text-gray-500 hover:text-red-400 transition-colors px-2 py-1 rounded border border-gray-700/30 hover:border-red-500/30">Fuir</button>
            </div>

            {/* ─── ARENA — VS Layout ─── */}
            <div className="relative rounded-2xl overflow-hidden mb-3"
              style={{ background: 'linear-gradient(to bottom, #0a0a1a 0%, #1a1030 50%, #251540 100%)', minHeight: 260 }}>

              {/* Ground line */}
              <div className="absolute bottom-[14%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

              {/* Element indicators */}
              <div className="absolute top-2 left-3 text-[10px]">
                <span className="text-blue-400">{'\uD83D\uDDE1\uFE0F'} Equipe</span>
              </div>
              <div className="absolute top-2 right-3 text-[10px]">
                <span className={mainEl.color}>{mainEl.icon} x{aliveEnemies.length}</span>
              </div>

              {/* VS Center */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-700/30 font-black text-2xl select-none" style={{ textShadow: '0 0 20px rgba(168,85,247,0.2)' }}>
                VS
              </div>

              {/* Phase overlay messages */}
              {isPlayerTurn && curEntity?.isExtra && (
                <div className="absolute top-[8%] left-1/2 -translate-x-1/2 z-20">
                  <div className="bg-emerald-500/20 border border-emerald-400/50 rounded-lg px-3 py-1 text-[11px] text-emerald-300 font-bold animate-pulse whitespace-nowrap">
                    {'\u26A1'} TOUR BONUS
                  </div>
                </div>
              )}
              {isPickTarget && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[120%] z-20">
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg px-3 py-1 text-[11px] text-red-300 font-bold animate-pulse whitespace-nowrap">
                    {'\uD83C\uDFAF'} Choisis un ennemi !
                  </div>
                </div>
              )}
              {isPickAlly && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[120%] z-20">
                  <div className="bg-green-500/20 border border-green-500/50 rounded-lg px-3 py-1 text-[11px] text-green-300 font-bold animate-pulse whitespace-nowrap">
                    {'\uD83D\uDC9A'} Choisis un alli{'\u00e9'} !
                  </div>
                </div>
              )}

              {/* ─── Team Side (Left) — stacked vertically ─── */}
              <div className="absolute left-[4%] top-[15%] bottom-[8%] flex flex-col justify-around items-center" style={{ width: '38%' }}>
                {team.map((f, i) => {
                  const isActive = curEntity?.type === 'team' && curEntity.idx === i;
                  const hpPct = f.maxHp > 0 ? (f.hp / f.maxHp) * 100 : 0;
                  const canPickAlly = isPickAlly && f.alive;
                  return (
                    <div key={i}
                      onClick={() => { if (canPickAlly) arc2ConfirmAlly(i); else if (f.alive) { const key = `ally_${i}`; if (enemyTooltip === key) { setEnemyTooltip(null); setTooltipPinned(false); } else { setEnemyTooltip(key); setTooltipPinned(true); } } }}
                      onMouseLeave={() => { if (!tooltipPinned && enemyTooltip === `ally_${i}`) setEnemyTooltip(null); }}
                      className={`relative flex items-center gap-1.5 w-full cursor-pointer`}>
                      {/* Sprite */}
                      <div className={`relative w-12 h-12 flex-shrink-0 rounded-lg border-2 flex items-center justify-center transition-all ${
                        !f.alive ? 'border-gray-700/40 opacity-30 grayscale' :
                        canPickAlly ? 'border-green-400 shadow-[0_0_12px_rgba(74,222,128,0.4)] hover:scale-105' :
                        isActive ? 'border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.4)]' :
                        'border-gray-600/30'
                      }`} style={canPickAlly ? { background: 'radial-gradient(circle, rgba(74,222,128,0.08), transparent)' } : isActive ? { background: 'radial-gradient(circle, rgba(250,204,21,0.08), transparent)' } : {}}>
                        <img src={atkAnim?.idx === i ? atkAnim.frames[atkAnim.frame] : f.sprite} alt={f.name} className="w-10 h-10 object-contain"
                          style={{
                            animation: atkAnim?.idx === i ? 'none' : !f.alive ? 'none' : isActive ? 'idleBreatheFlip 3s ease-in-out infinite' : 'idleBreatheFlip 4s ease-in-out infinite',
                            filter: !f.alive ? 'grayscale(1)' : atkAnim?.idx === i ? 'drop-shadow(0 0 8px rgba(239,68,68,0.8))' : '',
                            transition: 'filter 0.15s',
                          }} />
                        {!f.alive && <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg"><span className="text-[9px] text-red-400 font-bold">KO</span></div>}
                        {isActive && !isPickAlly && <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />}
                        {canPickAlly && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className={`text-[9px] font-bold truncate ${isActive ? 'text-yellow-300' : f.alive ? 'text-white' : 'text-gray-600'}`}>{f.name}</span>
                          <span className="text-[7px] text-gray-600">Lv{f.level}</span>
                        </div>
                        {/* HP bar */}
                        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mt-0.5">
                          <div className={`h-full transition-all duration-500 rounded-full ${hpPct > 50 ? 'bg-green-500' : hpPct > 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${hpPct}%` }} />
                        </div>
                        <div className="text-[7px] text-gray-400">{f.hp}/{f.maxHp}</div>
                        {/* Mana bar */}
                        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mt-0.5">
                          <div className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, (f.mana || 0) / Math.max(1, f.maxMana || 1) * 100)}%` }} />
                        </div>
                        <div className="text-[7px] text-violet-400">{f.mana || 0}/{f.maxMana || 0} MP</div>
                        <BuffBadges buffs={f.buffs} />
                      </div>
                      {/* Damage float on this char (from enemy attack) */}
                      <AnimatePresence>
                        {lastAction?.type === 'enemy' && lastAction.targetIdx === i && lastAction.damage > 0 && (
                          <motion.div key={`pd-${round}-${currentTurn}-${i}`} initial={{ opacity: 1, y: 0, scale: 1.2 }} animate={{ opacity: 0, y: -25 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}
                            className={`absolute -top-3 left-1/2 -translate-x-1/2 text-sm font-black z-10 ${lastAction.crit ? 'text-yellow-300' : 'text-red-400'}`}>
                            -{lastAction.damage}{lastAction.ko ? ' KO!' : ''}{lastAction.crit ? '!' : ''}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {/* Berserker selfDamage float */}
                      <AnimatePresence>
                        {lastAction?.type === 'player' && lastAction.idx === i && lastAction.selfDmg > 0 && (
                          <motion.div key={`sd-${round}-${currentTurn}-${i}`} initial={{ opacity: 1, y: 5, scale: 1 }} animate={{ opacity: 0, y: -15 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-bold z-10 text-orange-400">
                            -{lastAction.selfDmg} HP!
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* ─── Enemies Side (Right) — multi-enemy grid ─── */}
              <div className="absolute right-[4%] top-[12%] bottom-[6%] flex flex-col justify-around items-center" style={{ width: '42%' }}>
                {enemies.map((en, ei) => {
                  const enEl = ELEMENTS[en.element] || ELEMENTS.shadow;
                  const enHpPct = en.maxHp > 0 ? (en.hp / en.maxHp) * 100 : 0;
                  const canTarget = isPickTarget && en.alive;
                  const isActing = curEntity?.type === 'enemy' && curEntity.idx === ei;
                  const preview = previewData[ei];
                  const previewPct = preview ? Math.min(100, ((preview.min + preview.max) / 2) / en.maxHp * 100) : 0;
                  return (
                    <div key={ei}
                      onClick={() => { if (canTarget) arc2ConfirmTarget(ei); else if (en.alive) { if (enemyTooltip === ei && tooltipPinned) { setEnemyTooltip(null); setTooltipPinned(false); } else { setEnemyTooltip(ei); setTooltipPinned(true); } } }}
                      onMouseEnter={() => { if (canTarget) setHoveredEnemy(ei); else if (en.alive && !isPickTarget && !tooltipPinned) setEnemyTooltip(ei); }}
                      onMouseLeave={() => { setHoveredEnemy(null); if (!tooltipPinned) setEnemyTooltip(null); if (tooltipTimerRef.current) { clearTimeout(tooltipTimerRef.current); tooltipTimerRef.current = null; } }}
                      onTouchStart={() => { if (!canTarget && en.alive) tooltipTimerRef.current = setTimeout(() => { setEnemyTooltip(ei); setTooltipPinned(true); }, 500); }}
                      onTouchEnd={() => { if (tooltipTimerRef.current) { clearTimeout(tooltipTimerRef.current); tooltipTimerRef.current = null; } }}
                      className="relative flex items-center gap-1.5 w-full cursor-pointer">
                      {/* Enemy sprite */}
                      <div className={`relative flex-shrink-0 rounded-lg border-2 flex items-center justify-center transition-all ${
                        en.isMain ? 'w-14 h-14' : 'w-11 h-11'
                      } ${
                        !en.alive ? 'border-gray-700/40 opacity-30 grayscale' :
                        canTarget ? 'border-red-400 shadow-[0_0_12px_rgba(248,113,113,0.5)] hover:scale-105' :
                        isActing ? 'border-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.4)]' :
                        en.isMain ? 'border-red-500/60' : 'border-gray-600/40'
                      }`} style={{
                        background: canTarget ? 'radial-gradient(circle, rgba(248,113,113,0.15), transparent)' :
                          `radial-gradient(circle, ${enEl.color === 'text-purple-400' ? 'rgba(168,85,247,0.12)' : enEl.color === 'text-red-400' ? 'rgba(239,68,68,0.12)' : 'rgba(100,100,200,0.08)'}, transparent)`,
                        animation: !en.alive ? 'none' : isActing ? 'idleBreathe 1s ease-in-out infinite' : 'idleBreathe 3s ease-in-out infinite',
                        boxShadow: en.isMain && en.alive ? '0 0 15px rgba(239,68,68,0.25)' : 'none',
                      }}>
                        {en.sprite ? (
                          <img src={en.sprite} alt={en.name} className={`${en.isMain ? 'w-11 h-11' : 'w-8 h-8'} object-contain`}
                            style={{ filter: en.isMain ? 'drop-shadow(0 0 6px rgba(239,68,68,0.4))' : '' }} />
                        ) : (
                          <span className={en.isMain ? 'text-3xl' : 'text-xl'}
                            style={{ filter: en.isMain ? 'drop-shadow(0 0 6px rgba(239,68,68,0.4))' : '' }}>
                            {en.emoji}
                          </span>
                        )}
                        {!en.alive && <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg"><span className="text-[8px] text-red-400 font-bold">KO</span></div>}
                        {canTarget && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-pulse" />}
                      </div>
                      {/* Enemy info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className={`text-[8px] font-bold truncate ${!en.alive ? 'text-gray-600' : en.isMain ? 'text-red-300' : 'text-gray-300'}`}>{en.name}</span>
                          {en.isMain && en.alive && <span className="text-[6px] bg-red-500/30 text-red-300 px-1 rounded font-bold">BOSS</span>}
                        </div>
                        {/* HP bar with damage preview overlay */}
                        <div className="relative w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mt-0.5">
                          <div className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500 rounded-full" style={{ width: `${enHpPct}%` }} />
                          {isPickTarget && preview && en.alive && (
                            <div className="absolute top-0 h-full bg-yellow-400/40 rounded-full transition-all duration-300"
                              style={{ right: `${100 - enHpPct}%`, width: `${Math.min(enHpPct, previewPct)}%` }} />
                          )}
                        </div>
                        <div className="text-[7px] text-red-300">{en.hp.toLocaleString()}/{en.maxHp.toLocaleString()}</div>
                        {/* Damage preview text (always shown on mobile during pick_target) */}
                        {isPickTarget && preview && en.alive && (
                          <div className="text-[6px] text-yellow-300/80 leading-tight">
                            ~{preview.min}-{preview.max} {preview.critChance > 0 && <span className="text-orange-300">| CRIT: {preview.critMin}-{preview.critMax}</span>}
                            {preview.elementAdvantage && <span className="text-green-300 ml-0.5">★</span>}
                          </div>
                        )}
                        <BuffBadges buffs={en.buffs} />
                      </div>
                      {/* Player damage float on this enemy */}
                      <AnimatePresence>
                        {lastAction?.type === 'player' && lastAction.targetEnemyIdx === ei && lastAction.damage > 0 && (
                          <motion.div key={`ed-${round}-${currentTurn}-${ei}`} initial={{ opacity: 1, y: 0, scale: 1.3 }} animate={{ opacity: 0, y: -30 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}
                            className={`absolute -top-3 left-1/2 -translate-x-1/2 text-sm font-black z-10 ${lastAction.crit ? 'text-yellow-300' : 'text-red-400'}`}>
                            -{lastAction.damage}{lastAction.crit ? ' CRIT!' : ''}{lastAction.ko ? ' KO!' : ''}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {/* Tooltip rendered outside arena below */}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ─── TOOLTIP PANEL (outside arena to avoid overflow clip) ─── */}
            <AnimatePresence>
              {enemyTooltip !== null && (() => {
                // Enemy tooltip
                const isAlly = typeof enemyTooltip === 'string' && enemyTooltip.startsWith('ally_');
                if (isAlly) {
                  const allyIdx = parseInt(enemyTooltip.split('_')[1]);
                  const f = team[allyIdx];
                  if (!f || !f.alive) return null;
                  const fEl = ELEMENTS[f.element] || ELEMENTS.shadow;
                  const getSkillDesc = (sk) => {
                    const parts = [];
                    if (sk.power > 0) parts.push(`DMG ${sk.power}%`);
                    if (sk.buffAtk) parts.push(`ATK +${sk.buffAtk}%`);
                    if (sk.buffDef) parts.push(`DEF +${sk.buffDef}%`);
                    if (sk.buffSpd) parts.push(`SPD +${sk.buffSpd}%`);
                    if (sk.healSelf) parts.push(`Soin ${sk.healSelf}%`);
                    if (sk.debuffDef) parts.push(`DEF -${sk.debuffDef}%`);
                    if (sk.selfDamage) parts.push(`Cout ${sk.selfDamage}% PV`);
                    return parts.join(' | ') || 'Effet';
                  };
                  const effAtk = getEffStat(f.atk, f.buffs, 'atk');
                  const effDef = getEffStat(f.def, f.buffs, 'def');
                  const effSpd = getEffStat(f.spd, f.buffs || [], 'spd');
                  const atkChanged = effAtk !== f.atk;
                  const defChanged = effDef !== f.def;
                  const spdChanged = effSpd !== f.spd;
                  return (
                    <motion.div key="ally-tip" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
                      className="bg-gray-900 border-2 border-blue-500/50 rounded-xl p-3 mb-2 shadow-2xl relative"
                      onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => { setEnemyTooltip(null); setTooltipPinned(false); }} className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white text-xs transition-colors">&times;</button>
                      <div className="flex items-center gap-2 mb-2">
                        <img src={f.sprite} alt={f.name} className="w-10 h-10 object-contain" />
                        <div>
                          <div className="text-xs font-bold text-white">{f.name} <span className="text-gray-500 font-normal">Lv{f.level}</span></div>
                          <div className="text-[9px] text-gray-400">{fEl.icon} {fEl.name}</div>
                        </div>
                      </div>
                      {/* HP / Mana bars */}
                      <div className="mb-2">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[9px] text-green-400 font-bold w-6">PV</span>
                          <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${(f.hp / f.maxHp) > 0.5 ? 'bg-green-500' : (f.hp / f.maxHp) > 0.25 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${(f.hp / f.maxHp) * 100}%` }} />
                          </div>
                          <span className="text-[9px] text-green-300 font-medium w-20 text-right">{f.hp.toLocaleString()}/{f.maxHp.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-violet-400 font-bold w-6">MP</span>
                          <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full" style={{ width: `${Math.min(100, (f.mana || 0) / Math.max(1, f.maxMana || 1) * 100)}%` }} />
                          </div>
                          <span className="text-[9px] text-violet-300 font-medium w-20 text-right">{f.mana || 0}/{f.maxMana || 0}</span>
                        </div>
                      </div>
                      {/* Stats grid — show base→eff when buffed/debuffed */}
                      <div className="grid grid-cols-3 gap-x-3 gap-y-1 text-[9px] mb-2 bg-gray-800/50 rounded-lg p-1.5">
                        <span className={atkChanged ? (effAtk > f.atk ? 'text-green-300 font-bold' : 'text-red-300 font-bold') : 'text-red-400'}>ATK {atkChanged ? <><s className="text-gray-600">{f.atk}</s> {effAtk}</> : effAtk}</span>
                        <span className={defChanged ? (effDef > f.def ? 'text-green-300 font-bold' : 'text-red-300 font-bold') : 'text-blue-400'}>DEF {defChanged ? <><s className="text-gray-600">{f.def}</s> {effDef}</> : effDef}</span>
                        <span className={spdChanged ? (effSpd > f.spd ? 'text-green-300 font-bold' : 'text-red-300 font-bold') : 'text-emerald-400'}>SPD {spdChanged ? <><s className="text-gray-600">{f.spd}</s> {effSpd}</> : effSpd}</span>
                        <span className="text-yellow-400">CRIT {f.crit}</span>
                        <span className="text-cyan-400">RES {f.res}</span>
                      </div>
                      {/* Buffs/Debuffs — detailed mode */}
                      {f.buffs?.length > 0 && (
                        <div className="mb-2">
                          <div className="text-[8px] text-gray-500 uppercase tracking-wider mb-1 font-bold">Effets actifs</div>
                          <BuffBadges buffs={f.buffs} detailed />
                        </div>
                      )}
                      {/* Skills */}
                      <div className="text-[9px] border-t border-gray-700/50 pt-1.5">
                        <div className="text-[8px] text-gray-500 uppercase tracking-wider mb-1 font-bold">Skills</div>
                        {f.skills.map((sk, si) => (
                          <div key={si} className={`flex items-center justify-between gap-1 py-0.5 ${sk.cd > 0 ? 'opacity-40' : ''}`}>
                            <span className="text-gray-200 font-medium">{sk.name}</span>
                            <span className="text-gray-400 text-[8px] flex-shrink-0">{getSkillDesc(sk)}{sk.manaCost > 0 ? ` | ${sk.manaCost}MP` : ''}{sk.cd > 0 ? ` (CD ${sk.cd}t)` : ''}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                } else {
                  const en = enemies[enemyTooltip];
                  if (!en || !en.alive) return null;
                  const enEl = ELEMENTS[en.element] || ELEMENTS.shadow;
                  const getEnemySkillDesc = (sk) => {
                    const parts = [];
                    if (sk.power > 0) parts.push(`DMG ${sk.power}%`);
                    if (sk.buffAtk) parts.push(`ATK +${sk.buffAtk}%`);
                    if (sk.buffDef) parts.push(`DEF +${sk.buffDef}%`);
                    if (sk.buffSpd) parts.push(`SPD +${sk.buffSpd}%`);
                    if (sk.buffAllyAtk) parts.push(`Allie ATK +${sk.buffAllyAtk}%`);
                    if (sk.buffAllyDef) parts.push(`Allie DEF +${sk.buffAllyDef}%`);
                    if (sk.healSelf) parts.push(`Soin ${sk.healSelf}%`);
                    if (sk.healAlly) parts.push(`Soin allie ${sk.healAlly}%`);
                    if (sk.debuffDef) parts.push(`DEF -${sk.debuffDef}%`);
                    if (sk.debuffAtk) parts.push(`ATK -${sk.debuffAtk}%`);
                    if (sk.debuffSpd) parts.push(`SPD -${sk.debuffSpd}%`);
                    if (sk.poison) parts.push(`Poison ${sk.poison}%`);
                    if (sk.antiHeal) parts.push('Anti-Heal');
                    return parts.join(' | ') || 'Attaque';
                  };
                  const eEffAtk = getEffStat(en.atk, en.buffs, 'atk');
                  const eEffDef = getEffStat(en.def, en.buffs, 'def');
                  const eEffSpd = getEffStat(en.spd, en.buffs || [], 'spd');
                  const eAtkChanged = eEffAtk !== en.atk;
                  const eDefChanged = eEffDef !== en.def;
                  const eSpdChanged = eEffSpd !== en.spd;
                  return (
                    <motion.div key="enemy-tip" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
                      className="bg-gray-900 border-2 border-red-500/50 rounded-xl p-3 mb-2 shadow-2xl relative">
                      <button onClick={() => { setEnemyTooltip(null); setTooltipPinned(false); }} className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white text-xs transition-colors">&times;</button>
                      <div className="flex items-center gap-2 mb-2">
                        {en.sprite ? <img src={en.sprite} alt={en.name} className="w-10 h-10 object-contain" /> : <span className="text-xl">{en.emoji}</span>}
                        <div>
                          <div className="text-xs font-bold text-white">{en.name} {en.isMain && <span className="text-[8px] bg-red-500/30 text-red-300 px-1.5 rounded font-bold ml-1">BOSS</span>}</div>
                          <div className="text-[9px] text-gray-400">{enEl.icon} {enEl.name}</div>
                        </div>
                      </div>
                      {/* HP bar */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] text-red-400 font-bold w-6">PV</span>
                        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: `${(en.hp / en.maxHp) * 100}%` }} />
                        </div>
                        <span className="text-[9px] text-red-300 font-medium w-24 text-right">{en.hp.toLocaleString()}/{en.maxHp.toLocaleString()}</span>
                      </div>
                      {/* Stats grid */}
                      <div className="grid grid-cols-3 gap-x-3 gap-y-1 text-[9px] mb-2 bg-gray-800/50 rounded-lg p-1.5">
                        <span className={eAtkChanged ? (eEffAtk > en.atk ? 'text-green-300 font-bold' : 'text-red-300 font-bold') : 'text-red-400'}>ATK {eAtkChanged ? <><s className="text-gray-600">{en.atk}</s> {eEffAtk}</> : eEffAtk}</span>
                        <span className={eDefChanged ? (eEffDef > en.def ? 'text-green-300 font-bold' : 'text-red-300 font-bold') : 'text-blue-400'}>DEF {eDefChanged ? <><s className="text-gray-600">{en.def}</s> {eEffDef}</> : eEffDef}</span>
                        <span className={eSpdChanged ? (eEffSpd > en.spd ? 'text-green-300 font-bold' : 'text-red-300 font-bold') : 'text-emerald-400'}>SPD {eSpdChanged ? <><s className="text-gray-600">{en.spd}</s> {eEffSpd}</> : eEffSpd}</span>
                        <span className="text-yellow-400">CRIT {en.crit}</span>
                        <span className="text-cyan-400">RES {en.res}</span>
                      </div>
                      {/* Buffs/Debuffs — detailed */}
                      {en.buffs?.length > 0 && (
                        <div className="mb-2">
                          <div className="text-[8px] text-gray-500 uppercase tracking-wider mb-1 font-bold">Effets actifs</div>
                          <BuffBadges buffs={en.buffs} detailed />
                        </div>
                      )}
                      {/* Skills */}
                      <div className="text-[9px] border-t border-gray-700/50 pt-1.5">
                        <div className="text-[8px] text-gray-500 uppercase tracking-wider mb-1 font-bold">Skills</div>
                        {en.skills.map((sk, si) => (
                          <div key={si} className={`flex items-center justify-between gap-1 py-0.5 ${sk.cd > 0 ? 'opacity-40' : ''}`}>
                            <span className="text-gray-200 font-medium">{sk.name}</span>
                            <span className="text-gray-400 text-[8px] flex-shrink-0">{getEnemySkillDesc(sk)}{sk.cd > 0 ? ` (CD ${sk.cd}t)` : ''}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                }
              })()}
            </AnimatePresence>

            {/* ─── COMBAT LOG ─── */}
            <div className="bg-gray-900/50 rounded-lg p-2 mb-3 max-h-16 overflow-y-auto border border-gray-800/50">
              {log.length === 0 && <div className="text-[10px] text-gray-600 text-center">Le combat commence...</div>}
              {log.slice(0, 4).map((l, i) => (
                <div key={i} className={`text-[10px] leading-relaxed ${
                  i === 0 ? 'text-white font-medium' :
                  l.type === 'enemy' ? 'text-red-400/70' : 'text-green-400/70'
                }`}>{l.msg}</div>
              ))}
            </div>

            {/* ─── PHASE INDICATORS ─── */}
            {phase === 'enemy_act' && (() => {
              const actingEnemy = curEntity?.type === 'enemy' ? enemies[curEntity.idx] : null;
              return (
                <div className="text-center py-2 mb-2">
                  <div className="text-sm text-red-400 font-bold animate-pulse">{actingEnemy?.name || 'Ennemi'} pr{'\u00e9'}pare son attaque...</div>
                </div>
              );
            })()}
            {phase === 'advance' && <div className="text-center py-2 mb-2"><div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>}
            {phase === 'victory' && (
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-4">
                <img src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771551432/Victory_hcur2y.png" alt="Victory" className="w-32 mx-auto mb-1 drop-shadow-[0_0_12px_rgba(234,179,8,0.5)]" style={{ animation: 'victoryPulse 1.5s ease-in-out infinite' }} />
              </motion.div>
            )}
            {phase === 'defeat' && (
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-4">
                <div className="text-3xl mb-2">{'\uD83D\uDC80'}</div>
                <div className="text-lg font-black text-red-400" style={{ animation: 'defeatPulse 1.5s ease-in-out infinite' }}>DEFAITE...</div>
              </motion.div>
            )}

            {/* ─── SKILLS ─── */}
            {isPlayerTurn && activeChar && (
              <div>
                <div className="text-[10px] text-yellow-400 font-bold mb-1.5">{activeChar.name} — Choisis une attaque :</div>
                <div className={`grid gap-2 mb-2 ${activeChar.skills.length <= 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  {activeChar.skills.map((sk, i) => {
                    const onCd = sk.cd > 0;
                    const noMana = sk.manaCost > 0 && activeChar.mana < sk.manaCost;
                    const blocked = onCd || noMana;
                    const isPureSupport = sk.power === 0 && (sk.buffAtk || sk.buffDef || sk.healSelf);
                    return (
                      <button key={i}
                        onClick={() => !blocked && arc2SelectSkill(i)}
                        disabled={blocked}
                        className={`relative p-2 rounded-lg border text-center transition-all ${
                          onCd ? 'border-gray-700/30 bg-gray-800/20 opacity-40' :
                          noMana ? 'border-violet-700/30 bg-violet-900/20 opacity-50' :
                          isPureSupport ? 'border-green-500/40 bg-green-500/10 hover:bg-green-500/20 active:scale-95' :
                          'border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 active:scale-95'
                        }`}>
                        <div className="text-[10px] font-bold truncate">{sk.name}</div>
                        <div className="text-[8px] text-gray-400 mt-0.5">
                          {sk.power > 0 ? `DMG: ${sk.power}%` : ''}
                          {sk.buffAtk ? `${sk.power > 0 ? ' ' : ''}ATK +${sk.buffAtk}%` : ''}
                          {sk.buffDef ? `${sk.power > 0 || sk.buffAtk ? ' ' : ''}DEF +${sk.buffDef}%` : ''}
                          {sk.healSelf ? `${sk.power > 0 ? ' ' : ''}Soin ${sk.healSelf}%` : ''}
                          {sk.debuffDef ? `${sk.power > 0 ? ' ' : ''}DEF -${sk.debuffDef}%` : ''}
                        </div>
                        {isPureSupport && <div className="text-[7px] mt-0.5 text-green-400/80">{'\uD83D\uDC9A'} Alli{'\u00e9'}</div>}
                        {sk.manaCost > 0 && (
                          <div className={`text-[7px] mt-0.5 ${noMana ? 'text-red-400' : 'text-violet-400'}`}>
                            {sk.manaCost} MP
                          </div>
                        )}
                        {sk.manaCost === 0 && !isPureSupport && <div className="text-[7px] mt-0.5 text-green-400/60">0 MP</div>}
                        {onCd && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                            <span className="text-gray-400 text-xs font-bold">{sk.cd}t</span>
                          </div>
                        )}
                        {!onCd && noMana && (
                          <div className="absolute inset-0 flex items-center justify-center bg-violet-900/40 rounded-lg">
                            <span className="text-violet-300 text-[9px] font-bold">Mana</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── Cancel button for target/ally selection ─── */}
            {(isPickTarget || isPickAlly) && (
              <div className="text-center mb-2">
                <div className="text-[10px] text-gray-400 mb-1.5">{activeChar?.name} — {activeChar?.skills[pendingSkill]?.name}</div>
                <button onClick={arc2CancelSelection}
                  className="px-4 py-1.5 bg-gray-800 border border-gray-600/40 rounded-lg text-[10px] text-gray-300 hover:bg-gray-700 hover:text-white transition-all active:scale-95">
                  {'\u2715'} Annuler
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {/* ═══ ARC II RESULT VIEW ═══ */}
      {view === 'arc2_result' && (() => {
        const r = data._arc2Result;
        if (!r) return null;
        return (
          <div className="max-w-md mx-auto px-4 pt-8 text-center">
            {r.defeat ? (
              <>
                <div className="text-5xl mb-4">{'\uD83D\uDC80'}</div>
                <h2 className="text-xl font-black text-red-400 mb-2">Defaite</h2>
                <p className="text-sm text-gray-400 mb-1">Ton equipe a ete decimee par {r.stageName}.</p>
                <p className="text-[10px] text-gray-600">Ameliore ton equipe et retente ta chance !</p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">{'\uD83C\uDFC6'}</div>
                <h2 className="text-xl font-black text-yellow-400 mb-4">{r.stageName} vaincu !</h2>
                <div className="space-y-2 text-sm text-left bg-gray-900/60 rounded-xl p-4 border border-purple-500/20">
                  <div className="flex justify-between"><span className="text-gray-400">XP gagn{'\u00e9'}s</span><span className="text-green-400 font-bold">+{r.xp}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Coins</span><span className="text-yellow-400 font-bold">{'\uD83D\uDCB0'} +{r.coins}</span></div>
                  {r.accountXpGain > 0 && <div className="flex justify-between"><span className="text-gray-400">XP Compte</span><span className="text-cyan-400 font-bold">+{r.accountXpGain}</span></div>}
                  {r.star > 0 && <div className="flex justify-between"><span className="text-gray-400">Difficult{'\u00e9'}</span><span className="text-yellow-300">{'\u2B50'}{r.star}</span></div>}
                  {r.hammerDrop && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Marteau</span>
                      <span className="text-orange-400 font-bold text-xs">{'\uD83D\uDD28'} {r.hammerDrop.replace(/_/g, ' ')}</span>
                    </div>
                  )}
                  {r.weaponDrop && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Arme</span>
                      <span className={`text-xs font-bold ${r.weaponDrop._redHammers ? 'text-red-400' : r.weaponDrop.rarity === 'mythique' ? 'text-red-400' : r.weaponDrop.rarity === 'legendaire' ? 'text-orange-400' : 'text-blue-400'}`}>
                        {r.weaponDrop._redHammers ? `\uD83D\uDD34 ${r.weaponDrop.name} → +${r.weaponDrop._redHammers} Marteau${r.weaponDrop._redHammers > 1 ? 'x' : ''} Rouge${r.weaponDrop._redHammers > 1 ? 's' : ''}` : `\u2694\uFE0F ${r.weaponDrop.name}`}
                      </span>
                    </div>
                  )}
                  {r.hunterDrop && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Hunter</span>
                      <span className={`text-xs font-bold ${r.hunterDrop.rarity === 'mythique' ? 'text-purple-400' : r.hunterDrop.rarity === 'legendaire' ? 'text-yellow-400' : 'text-blue-400'}`}>
                        {'\uD83C\uDF1F'} {r.hunterDrop.name} {r.hunterDrop.isDuplicate ? '(Dupe)' : '(Nouveau !)'}
                      </span>
                    </div>
                  )}
                  {r.art && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Artefact ARC II</span>
                      <span className={`text-xs font-bold ${r.art.rarity === 'mythique' ? 'text-purple-400' : r.art.rarity === 'legendaire' ? 'text-yellow-400' : 'text-blue-400'}`}>
                        {'\u2728'} {(ARC2_ARTIFACT_SETS[r.art.set] || {}).name || r.art.set} ({r.art.rarity})
                      </span>
                    </div>
                  )}
                  {r.nierDrop && (
                    <div className="mt-2 p-2 rounded-lg border border-red-500/40 bg-gradient-to-r from-red-900/30 to-black/40">
                      <div className="flex justify-between items-center">
                        <span className="text-red-300 font-bold text-xs">{'\uD83D\uDDA4'} NieR:Automata</span>
                        <span className="text-white font-black text-xs" style={{ textShadow: '0 0 8px rgba(239,68,68,0.6)' }}>
                          {r.nierDrop.name} {r.nierDrop.isDuplicate ? '(Dupe)' : '(NOUVEAU !)'}
                        </span>
                      </div>
                    </div>
                  )}
                  {r.skinDrop && (
                    <div className="mt-2 p-2 rounded-lg border border-pink-500/50 bg-gradient-to-r from-pink-900/30 to-purple-900/30" style={{ animation: 'victoryPulse 2s ease-in-out infinite' }}>
                      <div className="flex items-center gap-2">
                        <img src={r.skinDrop.sprite} alt={r.skinDrop.skinName} className="w-10 h-10 rounded-lg border border-pink-400/40 object-contain" />
                        <div>
                          <div className="text-pink-300 font-black text-xs">{'\uD83C\uDFA8'} SKIN RARE !</div>
                          <div className="text-white text-[10px]">{r.skinDrop.skinName}</div>
                          {r.skinDrop.autoUnlockedHunter && <div className="text-green-400 text-[9px]">+ Hunter d{'\u00e9'}bloqu{'\u00e9'} !</div>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            <button
              onClick={() => { setView('hub'); setData(prev => { const d = { ...prev }; delete d._arc2Result; return d; }); setActiveArc(2); }}
              className="mt-6 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-transform"
            >
              {'\u2190'} Retour au Colisee
            </button>
          </div>
        );
      })()}

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
              <img src={getSprite(id)} alt={c.name} className="w-16 h-16 mx-auto object-contain" style={{ filter: RARITY[c.rarity].glow }} />
              <h2 className="text-lg font-black mt-2">{c.name}</h2>
              <div className="text-[10px] text-gray-400">
                Lv{level} {RARITY[c.rarity].stars} {ELEMENTS[c.element].icon} {ELEMENTS[c.element].name}
                {HUNTERS[id] && <span className="ml-1 text-red-400">[Hunter]</span>}
              </div>
              {HUNTERS[id] && (() => {
                const _es = getChibiEveilStars(id);
                return _es > 0 ? (
                  <div className="text-[10px] mt-0.5">
                    <span className="text-yellow-400 font-bold">A{_es}</span>
                  </div>
                ) : null;
              })()}
              {/* Skin Selector */}
              {HUNTER_SKINS[id] && (() => {
                const owned = data.ownedSkins?.[id] || ['default'];
                const active = data.activeSkin?.[id] || 'default';
                return (
                  <div className="mt-3 p-2 rounded-xl bg-purple-500/5 border border-purple-500/20">
                    <div className="text-[9px] text-purple-400 font-bold mb-2">{'\uD83C\uDFA8'} Skins</div>
                    <div className="flex justify-center gap-2 flex-wrap">
                      {HUNTER_SKINS[id].map(skin => {
                        const isOwned = owned.includes(skin.id);
                        const isActive = active === skin.id;
                        return (
                          <button key={skin.id}
                            onClick={() => {
                              if (!isOwned) return;
                              setData(prev => {
                                const d = JSON.parse(JSON.stringify(prev));
                                if (!d.activeSkin) d.activeSkin = {};
                                d.activeSkin[id] = skin.id;
                                return d;
                              });
                            }}
                            disabled={!isOwned}
                            className={`relative p-1 rounded-lg border-2 transition-all ${
                              isActive ? 'border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)] bg-purple-500/10' :
                              isOwned ? 'border-gray-600/50 hover:border-purple-400/50 bg-gray-800/30' :
                              'border-gray-700/30 opacity-30 grayscale bg-gray-900/30'
                            }`}
                            title={isOwned ? skin.name : `${skin.name} (non obtenu)`}
                          >
                            <img src={skin.sprite} alt={skin.name} className="w-10 h-10 object-contain" />
                            {!isOwned && <div className="absolute inset-0 flex items-center justify-center"><span className="text-sm">{'\uD83D\uDD12'}</span></div>}
                            {isActive && <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full border border-purple-900" />}
                            <div className={`text-[7px] mt-0.5 truncate max-w-[48px] ${isActive ? 'text-purple-300' : 'text-gray-500'}`}>{skin.name}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
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
                        <span className={`text-xs font-bold ${m.color} flex items-center gap-1`}>{m.name}
                          {m.detail && (
                            <span onClick={(e) => { e.stopPropagation(); setStatTooltip(statTooltip === stat ? null : stat); }}
                              className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-gray-700/60 text-[8px] text-gray-400 cursor-pointer hover:bg-purple-500/30 hover:text-purple-300 transition-all">?</span>
                          )}
                        </span>
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
                      {statTooltip === stat && m.detail && (
                        <div className="mt-1 p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-200 leading-relaxed">{m.detail}</div>
                      )}
                      {/* Allocation bar */}
                      <div className="mt-1 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${m.color.replace('text-', 'bg-')}`}
                          style={{ width: `${Math.min(100, (allocated / 30) * 100)}%`, opacity: 0.6 }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onPointerDown={() => startStatHold(id, stat, -1)}
                        onPointerUp={stopStatHold}
                        onPointerLeave={stopStatHold}
                        onContextMenu={e => e.preventDefault()}
                        disabled={allocated <= 0}
                        className="w-7 h-7 rounded-lg bg-gray-700/50 text-gray-300 text-sm font-bold hover:bg-red-500/30 disabled:opacity-20 transition-colors flex items-center justify-center select-none"
                      >-</button>
                      <span className="text-[10px] text-gray-400 w-5 text-center font-mono">{allocated}</span>
                      <button
                        onPointerDown={() => startStatHold(id, stat, 1)}
                        onPointerUp={stopStatHold}
                        onPointerLeave={stopStatHold}
                        onContextMenu={e => e.preventDefault()}
                        disabled={available <= 0}
                        className="w-7 h-7 rounded-lg bg-gray-700/50 text-gray-300 text-sm font-bold hover:bg-green-500/30 disabled:opacity-20 transition-colors flex items-center justify-center select-none"
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
              <img src={getSprite(id)} alt={c.name} className="w-16 h-16 mx-auto object-contain" style={{ filter: RARITY[c.rarity].glow }} />
              <h2 className="text-lg font-black mt-2">{c.name}</h2>
              <div className="text-[10px] text-gray-400">
                Lv{level} {RARITY[c.rarity].stars} {ELEMENTS[c.element].icon} {ELEMENTS[c.element].name}
                {HUNTERS[id] && <span className="ml-1 text-red-400">[Hunter]</span>}
              </div>
              {HUNTERS[id] && (() => {
                const _es = getChibiEveilStars(id);
                return _es > 0 ? (
                  <div className="text-[10px] mt-0.5">
                    <span className="text-yellow-400 font-bold">A{_es}</span>
                  </div>
                ) : null;
              })()}
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
                // Check if this slot is replaced by a Talent Skill
                const tsData = data.talentSkills[id];
                const isReplaced = tsData && tsData.replacedSlot === skillIdx;
                const displaySkill = isReplaced && TALENT_SKILLS[id]?.[tsData.skillIndex] ? TALENT_SKILLS[id][tsData.skillIndex] : skill;
                // Show upgraded values preview
                const upgraded = applySkillUpgrades(displaySkill, curLevel);

                return (
                  <div key={skillIdx} className="text-center">
                    {/* Skill Name */}
                    <div className={`p-1.5 rounded-t-lg border border-b-0 ${isReplaced ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-gray-800/40 border-gray-700/30'}`}>
                      <div className={`text-[9px] font-bold truncate ${isReplaced ? 'text-cyan-300' : 'text-white'}`}>{displaySkill.name}</div>
                      {isReplaced && <div className="text-[8px] text-cyan-400/60">Talent Skill</div>}
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
                {HUNTERS[id] && <span className="ml-1 text-red-400">[Hunter]</span>}
              </div>
              {HUNTERS[id] && (() => {
                const _es = getChibiEveilStars(id);
                return _es > 0 ? (
                  <div className="text-[10px] mt-0.5">
                    <span className="text-yellow-400 font-bold">A{_es}</span>
                  </div>
                ) : null;
              })()}
              <div className="mt-2 px-3 py-1.5 rounded-lg bg-green-500/5 border border-green-500/20 inline-block">
                <span className="text-sm font-bold text-green-400">{availTP}</span>
                <span className="text-xs text-gray-400 ml-1">pts dispo</span>
                <span className="text-[9px] text-gray-500 ml-1">(I:{spent1} + II:{spent2}{data.talentSkills[id] ? ` + S:${TALENT_SKILL_COST}` : ''} / {totalTP})</span>
              </div>
            </div>

            {/* Talent I / II / Skill Toggle */}
            <div className="flex gap-1.5 mb-4">
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
              <button
                onClick={() => level >= TALENT_SKILL_UNLOCK_LEVEL && setTalentTab(3)}
                disabled={level < TALENT_SKILL_UNLOCK_LEVEL}
                className={`flex-1 py-2 rounded-lg border text-center transition-all ${
                  level < TALENT_SKILL_UNLOCK_LEVEL ? 'border-gray-800/30 bg-gray-900/10 text-gray-600 cursor-not-allowed' :
                  talentTab === 3 ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-400' : 'border-gray-700/40 bg-gray-800/20 text-gray-500 hover:text-gray-300'
                }`}
              >
                <span className="text-base">{'\uD83C\uDFAF'}</span>
                <span className="text-xs font-bold ml-1">Talent Skill</span>
                {level < TALENT_SKILL_UNLOCK_LEVEL && <span className="text-[9px] ml-1">(Lv{TALENT_SKILL_UNLOCK_LEVEL})</span>}
                {level >= TALENT_SKILL_UNLOCK_LEVEL && data.talentSkills[id] && <span className="text-[9px] ml-1 text-gray-400">({TALENT_SKILL_COST})</span>}
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

            {/* ═══ TALENT II — Pro Graph View ═══ */}
            {talentTab === 2 && t2Unlocked && (() => {
              const t2Alloc = getChibiTalent2Alloc(id);
              const allNodes = getAllTalent2Nodes();
              const connections = getTalent2Connections();
              const UNIT = 50;
              const CX = 400;
              const CY = 430;
              const W = 800;
              const H = 860;
              const toX = (gx) => CX + gx * UNIT;
              const toY = (gy) => CY + gy * UNIT;

              // Curved path: S-curves following branch direction
              const makePath = (x1, y1, x2, y2) => {
                const dx = x2 - x1, dy = y2 - y1;
                if (Math.abs(dx) > Math.abs(dy)) {
                  return `M${x1},${y1} C${x1 + dx * 0.5},${y1} ${x2 - dx * 0.5},${y2} ${x2},${y2}`;
                }
                return `M${x1},${y1} C${x1},${y1 + dy * 0.5} ${x2},${y2 - dy * 0.5} ${x2},${y2}`;
              };

              // Touch handlers
              const onTouchStart = (e) => {
                if (e.touches.length === 2) {
                  const dx = e.touches[0].clientX - e.touches[1].clientX;
                  const dy = e.touches[0].clientY - e.touches[1].clientY;
                  t2PinchRef.current = { dist: Math.sqrt(dx * dx + dy * dy), zoom: t2Zoom };
                } else if (e.touches.length === 1) {
                  setT2Dragging(true);
                  t2DragRef.current = { sx: e.touches[0].clientX, sy: e.touches[0].clientY, px: t2Pan.x, py: t2Pan.y };
                }
              };
              const onTouchMove = (e) => {
                if (e.touches.length === 2) {
                  const dx = e.touches[0].clientX - e.touches[1].clientX;
                  const dy = e.touches[0].clientY - e.touches[1].clientY;
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  setT2Zoom(Math.max(0.3, Math.min(3, t2PinchRef.current.zoom * dist / (t2PinchRef.current.dist || 1))));
                } else if (e.touches.length === 1 && t2Dragging) {
                  setT2Pan({ x: t2DragRef.current.px + e.touches[0].clientX - t2DragRef.current.sx, y: t2DragRef.current.py + e.touches[0].clientY - t2DragRef.current.sy });
                }
              };
              const onTouchEnd = () => setT2Dragging(false);
              const onMouseDown = (e) => { if (e.button !== 0) return; setT2Dragging(true); t2DragRef.current = { sx: e.clientX, sy: e.clientY, px: t2Pan.x, py: t2Pan.y }; };
              const onMouseMove = (e) => { if (!t2Dragging) return; setT2Pan({ x: t2DragRef.current.px + e.clientX - t2DragRef.current.sx, y: t2DragRef.current.py + e.clientY - t2DragRef.current.sy }); };
              const onMouseUp = () => setT2Dragging(false);
              const onWheel = (e) => { e.stopPropagation(); setT2Zoom(z => Math.max(0.3, Math.min(3, z + (e.deltaY > 0 ? -0.12 : 0.12)))); };

              // Format perRank bonuses for tooltip display
              const STAT_LABELS = {
                allStats: 'Toutes stats', atkPercent: 'ATK', hpPercent: 'PV', defPercent: 'DEF', spdPercent: 'SPD',
                critRate: 'Crit Rate', critDamage: 'Crit DMG', resFlat: 'RES', defPen: 'Pen DEF',
                elementalDamage: 'DMG Elem', fireDamage: 'DMG Feu', shadowDamage: 'DMG Ombre',
                waterDamage: 'DMG Eau', windDamage: 'DMG Vent', earthDamage: 'DMG Terre',
                lightDamage: 'DMG Lumiere', healBonus: 'Soins', regenPerTurn: 'Regen/tour',
                executionDmg: 'Execution (<30%PV)', bossDamage: 'DMG Boss',
                weaponDmg_blade: 'DMG Lames', weaponDmg_heavy: 'DMG Lourdes',
                weaponDmg_ranged: 'DMG Distance', weaponDmg_polearm: "DMG Hast",
                weaponDmg_shield_def: 'DEF Bouclier', weaponDmg_shield_hp: 'PV Bouclier',
                bastionDef: 'DEF (<50%PV)', bastionRes: 'RES (<50%PV)',
                fireRes: 'RES Feu', shadowRes: 'RES Ombre', waterRes: 'RES Eau', windRes: 'RES Vent',
                defFlat: 'DEF flat', counterChance: 'Riposte',
                masterWeapons: "Maitre d'Armes", convergenceAll: 'Convergence',
                hasColossus: 'Colossus', critDefIgnore: 'Ange de la Mort',
              };
              const CAPSTONE_FLAGS = ['masterWeapons', 'convergenceAll', 'hasColossus', 'critDefIgnore'];
              const formatPerRank = (perRank) => {
                if (!perRank) return [];
                return Object.entries(perRank).map(([k, v]) => ({
                  key: k, label: STAT_LABELS[k] || k, val: v, isCap: CAPSTONE_FLAGS.includes(k),
                }));
              };

              return (
                <>
                  {/* Branch legend with progress bars */}
                  <div className="flex flex-wrap justify-center gap-2 mb-3">
                    {Object.values(TALENT2_BRANCHES).map(br => {
                      const pts = getBranchPts(br.id, t2Alloc);
                      const max = Object.values(br.nodes).reduce((s, n) => s + n.maxRank, 0);
                      const pct = pts / max;
                      return (
                        <div key={br.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] transition-all"
                          style={{
                            borderColor: pct > 0 ? br.color + '50' : '#333',
                            backgroundColor: pct > 0 ? br.color + '10' : 'transparent',
                            boxShadow: pct >= 1 ? `0 0 12px ${br.color}30` : 'none',
                          }}>
                          <span className="text-sm">{br.icon}</span>
                          <span className="font-bold" style={{ color: pct > 0 ? br.color : '#666' }}>{br.name}</span>
                          <span className="font-mono" style={{ color: pct >= 1 ? br.color : '#888' }}>{pts}/{max}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Graph container — zoom/pan enabled */}
                  <div
                    className="relative overflow-hidden rounded-xl border border-gray-700/40 select-none"
                    style={{
                      height: 520,
                      background: 'radial-gradient(ellipse at 50% 48%, #151530 0%, #0c0c1a 45%, #080812 100%)',
                      touchAction: 'none',
                      cursor: t2Dragging ? 'grabbing' : 'grab',
                    }}
                    onWheel={onWheel}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                  >
                    {/* Zoom controls */}
                    <div className="absolute top-2 right-2 z-30 flex flex-col gap-1">
                      <button onClick={(e) => { e.stopPropagation(); setT2Zoom(z => Math.min(z + 0.25, 3)); }}
                        className="w-8 h-8 rounded-lg bg-black/60 border border-gray-600/40 text-white text-base font-bold hover:bg-gray-700/60 transition-colors flex items-center justify-center backdrop-blur-sm">+</button>
                      <div className="w-8 h-5 flex items-center justify-center text-[8px] text-gray-500 font-mono">{Math.round(t2Zoom * 100)}%</div>
                      <button onClick={(e) => { e.stopPropagation(); setT2Zoom(z => Math.max(z - 0.25, 0.3)); }}
                        className="w-8 h-8 rounded-lg bg-black/60 border border-gray-600/40 text-white text-base font-bold hover:bg-gray-700/60 transition-colors flex items-center justify-center backdrop-blur-sm">{'\u2212'}</button>
                      <button onClick={(e) => { e.stopPropagation(); setT2Zoom(1); setT2Pan({ x: 0, y: 0 }); }}
                        className="w-8 h-6 rounded-lg bg-black/60 border border-gray-600/40 text-gray-500 text-[8px] hover:bg-gray-700/60 hover:text-gray-300 transition-colors flex items-center justify-center backdrop-blur-sm mt-1">Reset</button>
                    </div>

                    {/* Hint */}
                    <div className="absolute bottom-2 left-2 z-30 text-[9px] text-gray-600 pointer-events-none">
                      Scroll/pinch pour zoomer {'\u2022'} Glisser pour deplacer
                    </div>

                    {/* Zoomable / pannable layer */}
                    <div style={{
                      transform: `translate(${t2Pan.x}px, ${t2Pan.y}px) scale(${t2Zoom})`,
                      transformOrigin: '50% 48%',
                      width: W, height: H,
                      position: 'absolute',
                      left: '50%', marginLeft: -W / 2,
                      top: -40,
                      transition: t2Dragging ? 'none' : 'transform 0.15s ease-out',
                    }}>
                      <svg width={W} height={H} className="absolute inset-0" style={{ overflow: 'visible' }}>
                        <defs>
                          <filter id="t2glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                          </filter>
                          <filter id="t2glowHard" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="8" result="blur" />
                            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                          </filter>
                          <radialGradient id="t2centerGlow">
                            <stop offset="0%" stopColor="rgba(234,179,8,0.08)" />
                            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                          </radialGradient>
                        </defs>

                        {/* Background constellation */}
                        {Array.from({ length: 60 }).map((_, i) => (
                          <circle key={`s${i}`}
                            cx={(i * 137.5 + 50) % W} cy={(i * 97.3 + 30) % H}
                            r={((i * 7) % 12) / 10 + 0.3}
                            fill={`rgba(255,255,255,${0.02 + ((i * 3) % 5) * 0.006})`}
                          />
                        ))}

                        {/* Center ambient glow */}
                        <circle cx={CX} cy={CY} r={200} fill="url(#t2centerGlow)" />

                        {/* ── CONNECTIONS with curves + glow ── */}
                        {connections.map((conn, i) => {
                          const fn = allNodes[conn.from];
                          const tn = allNodes[conn.to];
                          if (!fn || !tn) return null;
                          const x1 = toX(fn.pos.x), y1 = toY(fn.pos.y);
                          const x2 = toX(tn.pos.x), y2 = toY(tn.pos.y);
                          const d = makePath(x1, y1, x2, y2);
                          const fromOk = (t2Alloc[conn.from] || 0) > 0;
                          const toOk = (t2Alloc[conn.to] || 0) > 0;
                          const both = fromOk && toOk;

                          return (
                            <g key={`c${i}`}>
                              {/* Glow layer */}
                              {fromOk && (
                                <path d={d} fill="none" stroke={conn.branchColor}
                                  strokeWidth={both ? 8 : 5} strokeOpacity={both ? 0.12 : 0.06}
                                  filter="url(#t2glow)" />
                              )}
                              {/* Main path */}
                              <path d={d} fill="none"
                                stroke={fromOk ? conn.branchColor : '#1e1e2e'}
                                strokeWidth={fromOk ? (both ? 2.5 : 1.8) : 1.2}
                                strokeOpacity={fromOk ? (both ? 0.85 : 0.4) : 0.15}
                                strokeDasharray={fromOk ? 'none' : '5 5'}
                                strokeLinecap="round" />
                              {/* Energy particle flowing along active paths */}
                              {both && (
                                <circle r={2.5} fill={conn.branchColor} opacity={0.8}>
                                  <animateMotion dur={`${1.8 + (i % 4) * 0.5}s`} repeatCount="indefinite" path={d} />
                                </circle>
                              )}
                            </g>
                          );
                        })}
                      </svg>

                      {/* ── NODES (positioned over SVG) ── */}

                      {/* Root Node */}
                      {(() => {
                        const rk = t2Alloc.root || 0;
                        const canUp = canAllocT2(id, 'root');
                        const maxed = rk >= TALENT2_ROOT.maxRank;
                        return (
                          <button
                            onClick={(e) => { e.stopPropagation(); if (canUp) allocateTalent2Point(id, 'root'); setT2SelectedNode(t2SelectedNode === 'root' ? null : 'root'); }}
                            className="absolute z-20 flex flex-col items-center justify-center rounded-full transition-all duration-200 group"
                            style={{
                              left: toX(0) - 36, top: toY(0) - 36, width: 72, height: 72,
                              background: maxed
                                ? 'radial-gradient(circle, rgba(234,179,8,0.3) 0%, rgba(234,179,8,0.05) 100%)'
                                : rk > 0
                                  ? 'radial-gradient(circle, rgba(234,179,8,0.15) 0%, rgba(20,20,35,0.95) 100%)'
                                  : 'radial-gradient(circle, rgba(45,45,65,0.4) 0%, rgba(15,15,25,0.95) 100%)',
                              border: `3px solid ${maxed ? '#EAB308' : canUp ? '#EAB30888' : '#333'}`,
                              boxShadow: maxed
                                ? '0 0 35px rgba(234,179,8,0.5), 0 0 15px rgba(234,179,8,0.2), inset 0 0 20px rgba(234,179,8,0.1)'
                                : canUp ? '0 0 20px rgba(234,179,8,0.25)' : 'inset 0 0 10px rgba(0,0,0,0.3)',
                              cursor: canUp ? 'pointer' : 'default',
                              animation: canUp && rk === 0 ? 'nodePulse 2s ease-in-out infinite' : 'none',
                              outline: t2SelectedNode === 'root' ? '2px solid #EAB30880' : 'none',
                              outlineOffset: '4px',
                            }}
                          >
                            {maxed && <div className="absolute -inset-2 rounded-full border-2 border-yellow-500/20" style={{ animation: 'nodePulse 3s ease-in-out infinite' }} />}
                            <span className="text-2xl leading-none">{TALENT2_ROOT.icon}</span>
                            <span className="text-[9px] font-mono mt-0.5" style={{ color: maxed ? '#EAB308' : '#777' }}>{rk}/{TALENT2_ROOT.maxRank}</span>

                            {/* Root hover tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block z-50 pointer-events-none"
                              style={{ transform: `translate(-50%, 0) scale(${1 / t2Zoom})` }}>
                              <div className="rounded-xl px-3 py-2 shadow-2xl whitespace-nowrap"
                                style={{ backgroundColor: 'rgba(10,10,22,0.95)', border: '1px solid rgba(234,179,8,0.4)', backdropFilter: 'blur(8px)' }}>
                                <div className="text-[11px] font-bold text-yellow-400">{TALENT2_ROOT.icon} {TALENT2_ROOT.name}</div>
                                <div className="text-[9px] text-gray-400 mt-0.5">{TALENT2_ROOT.desc}</div>
                                <div className="text-[9px] mt-1.5 pt-1.5 border-t border-gray-700/40 flex justify-between gap-4">
                                  <span className="text-gray-500">Toutes stats</span>
                                  <span style={{ color: rk > 0 ? '#EAB308' : '#666' }}>+{TALENT2_ROOT.perRank.allStats * Math.max(rk, 1)}%</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })()}

                      {/* Branch Nodes */}
                      {Object.values(TALENT2_BRANCHES).map(branch =>
                        Object.entries(branch.nodes).map(([nid, node]) => {
                          const rk = t2Alloc[nid] || 0;
                          const maxed = rk >= node.maxRank;
                          const canUp = canAllocT2(id, nid);
                          const isCap = node.capstone;
                          const sz = isCap ? 62 : 50;
                          const h2 = sz / 2;
                          const sel = t2SelectedNode === nid;
                          const pctFill = rk / node.maxRank;

                          const bonuses = formatPerRank(node.perRank);
                          return (
                            <button key={nid}
                              onClick={(e) => { e.stopPropagation(); if (canUp) allocateTalent2Point(id, nid); setT2SelectedNode(sel ? null : nid); }}
                              className="absolute z-10 flex flex-col items-center justify-center transition-all duration-200 group"
                              style={{
                                left: toX(node.pos.x) - h2, top: toY(node.pos.y) - h2,
                                width: sz, height: sz,
                                borderRadius: isCap ? '16px' : '50%',
                                border: `${isCap ? 3 : 2}px solid ${maxed ? branch.color : canUp ? branch.color + '70' : rk > 0 ? branch.color + '40' : '#2a2a3a'}`,
                                background: maxed
                                  ? `radial-gradient(circle, ${branch.color}35 0%, ${branch.color}08 100%)`
                                  : rk > 0
                                    ? `radial-gradient(circle, ${branch.color}18 0%, rgba(18,18,30,0.95) 100%)`
                                    : 'radial-gradient(circle, rgba(30,30,45,0.4) 0%, rgba(12,12,22,0.95) 100%)',
                                boxShadow: maxed
                                  ? `0 0 25px ${branch.color}45, inset 0 0 15px ${branch.color}12`
                                  : canUp ? `0 0 12px ${branch.color}20` : 'inset 0 0 8px rgba(0,0,0,0.3)',
                                cursor: canUp ? 'pointer' : 'default',
                                animation: canUp && rk === 0 ? 'nodePulse 2s ease-in-out infinite' : 'none',
                                outline: sel ? `2px solid ${branch.color}80` : 'none',
                                outlineOffset: '4px',
                              }}
                            >
                              {/* Capstone outer glow ring */}
                              {isCap && maxed && (
                                <div className="absolute -inset-2.5 border-2"
                                  style={{ borderRadius: '20px', borderColor: branch.color + '35', animation: 'nodePulse 3s ease-in-out infinite' }} />
                              )}

                              {/* Progress ring (partial fill) */}
                              {rk > 0 && !maxed && !isCap && (
                                <svg className="absolute inset-0 -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                                  <circle cx="50" cy="50" r="46" fill="none" stroke={branch.color}
                                    strokeWidth="3" strokeDasharray={`${pctFill * 289} 289`}
                                    strokeOpacity="0.35" strokeLinecap="round" />
                                </svg>
                              )}

                              <span className={`leading-none ${isCap ? 'text-xl' : 'text-base'}`}>{node.icon}</span>
                              <span className="text-[8px] font-mono mt-0.5 leading-none"
                                style={{ color: maxed ? branch.color : rk > 0 ? '#aaa' : '#555' }}>
                                {rk}/{node.maxRank}
                              </span>

                              {/* Lock overlay */}
                              {rk === 0 && !canUp && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50"
                                  style={{ borderRadius: isCap ? '16px' : '50%' }}>
                                  <span className="text-[10px] opacity-50">{'\uD83D\uDD12'}</span>
                                </div>
                              )}

                              {/* Hover tooltip with bonus details */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block z-50 pointer-events-none"
                                style={{ transform: `translate(-50%, 0) scale(${1 / t2Zoom})` }}>
                                <div className="rounded-xl px-3 py-2 shadow-2xl whitespace-nowrap min-w-[140px]"
                                  style={{ backgroundColor: 'rgba(10,10,22,0.95)', border: `1px solid ${branch.color}40`, backdropFilter: 'blur(8px)' }}>
                                  <div className="text-[11px] font-bold" style={{ color: branch.color }}>{node.icon} {node.name}</div>
                                  <div className="text-[9px] text-gray-400 mt-0.5 max-w-[200px] whitespace-normal">{node.desc}</div>
                                  {bonuses.length > 0 && (
                                    <div className="mt-1.5 pt-1.5 border-t border-gray-700/40 space-y-0.5">
                                      {bonuses.map(b => (
                                        <div key={b.key} className="text-[9px] flex justify-between gap-4">
                                          <span className="text-gray-500">{b.label}</span>
                                          {b.isCap ? (
                                            <span style={{ color: rk > 0 ? branch.color : '#666' }}>{rk > 0 ? '\u2713 Actif' : 'Inactif'}</span>
                                          ) : (
                                            <span style={{ color: rk > 0 ? branch.color : '#666' }}>
                                              +{b.val * Math.max(rk, 1)}%
                                              <span className="text-gray-600 ml-1">({rk}/{node.maxRank})</span>
                                            </span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {node.requiredBranchPts && (
                                    <div className="text-[8px] mt-1.5 pt-1 border-t border-gray-700/30" style={{ color: branch.color + '80' }}>
                                      Requis : {node.requiredBranchPts} pts dans {branch.name}
                                    </div>
                                  )}
                                  {canUp && (
                                    <div className="text-[8px] mt-1 text-emerald-400/80">Clic pour ameliorer</div>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}

                      {/* Branch Labels */}
                      {Object.values(TALENT2_BRANCHES).map(branch => {
                        const lp = { weapons: { x: -5.5, y: 1.5 }, elements: { x: 5.5, y: 1.5 }, titan: { x: 3, y: -6.5 }, reaper: { x: 3, y: 6.5 } };
                        const p = lp[branch.id] || { x: 0, y: 0 };
                        const pts = getBranchPts(branch.id, t2Alloc);
                        return (
                          <div key={branch.id + '_l'}
                            className="absolute text-[9px] font-bold pointer-events-none whitespace-nowrap text-center"
                            style={{
                              left: toX(p.x) - 50, top: toY(p.y), width: 100,
                              color: pts > 0 ? branch.color + 'cc' : branch.color + '50',
                              textShadow: pts > 0 ? `0 0 10px ${branch.color}30` : 'none',
                            }}>
                            {branch.icon} {branch.name}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Node Detail Panel */}
                  {t2SelectedNode && (() => {
                    const node = allNodes[t2SelectedNode];
                    if (!node) return null;
                    const rk = t2Alloc[t2SelectedNode] || 0;
                    const maxed = rk >= node.maxRank;
                    const branch = node.branchId ? TALENT2_BRANCHES[node.branchId] : null;
                    const col = branch ? branch.color : '#EAB308';
                    const canUp = canAllocT2(id, t2SelectedNode);

                    return (
                      <div className="mt-3 p-3 rounded-xl border backdrop-blur-sm transition-all"
                        style={{ borderColor: col + '40', backgroundColor: 'rgba(15,15,30,0.9)', boxShadow: `0 0 20px ${col}10` }}>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 shrink-0"
                            style={{ borderColor: maxed ? col : col + '50', backgroundColor: col + '15', boxShadow: maxed ? `0 0 15px ${col}30` : 'none' }}>
                            <span className="text-xl">{node.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold" style={{ color: col }}>{node.name}</div>
                            <div className="text-[11px] text-gray-400 mt-0.5">{node.desc}</div>
                            {node.requiredBranchPts && (
                              <div className="text-[9px] mt-0.5" style={{ color: col + '80' }}>
                                Requis : {node.requiredBranchPts} pts dans {branch?.name}
                              </div>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-lg font-bold font-mono" style={{ color: maxed ? col : rk > 0 ? '#aaa' : '#555' }}>
                              {rk}<span className="text-xs text-gray-600">/{node.maxRank}</span>
                            </div>
                          </div>
                        </div>
                        {/* Stat bonuses grid */}
                        {node.perRank && (() => {
                          const bonuses = formatPerRank(node.perRank);
                          if (bonuses.length === 0) return null;
                          return (
                            <div className="mt-2.5 pt-2 border-t border-gray-700/30 grid gap-1">
                              {bonuses.map(b => (
                                <div key={b.key} className="flex justify-between items-center text-[10px]">
                                  <span className="text-gray-500">{b.label}</span>
                                  {b.isCap ? (
                                    <span className="font-bold" style={{ color: rk > 0 ? col : '#555' }}>{rk > 0 ? '\u2713 Actif' : 'Inactif'}</span>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-600 text-[9px]">+{b.val}%/rang</span>
                                      <span className="font-bold font-mono" style={{ color: rk > 0 ? col : '#555' }}>
                                        +{b.val * rk}%
                                      </span>
                                      {!maxed && <span className="text-gray-700 text-[8px]">{'\u2192'} +{b.val * node.maxRank}%</span>}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                        {canUp && (
                          <button onClick={() => allocateTalent2Point(id, t2SelectedNode)}
                            className="mt-2.5 w-full py-2 rounded-lg text-xs font-bold transition-all hover:brightness-110"
                            style={{ backgroundColor: col + '20', color: col, border: `1px solid ${col}40`, boxShadow: `0 0 10px ${col}15` }}>
                            {'\u2B06'} Ameliorer ({availTP - spentTP} PT restants)
                          </button>
                        )}
                      </div>
                    );
                  })()}
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

            {/* ═══ TALENT SKILL ═══ */}
            {talentTab === 3 && level >= TALENT_SKILL_UNLOCK_LEVEL && (() => {
              const skillChoices = TALENT_SKILLS[id] || [];
              const equipped = data.talentSkills[id]; // { skillIndex, replacedSlot } or undefined
              const hasEnoughPts = availTP >= TALENT_SKILL_COST || !!equipped;

              if (skillChoices.length === 0) return (
                <div className="text-center text-gray-500 text-xs py-8">Aucun Talent Skill disponible pour ce personnage.</div>
              );

              return (
                <div>
                  {/* Info banner */}
                  <div className="mb-4 p-2.5 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-center">
                    <div className="text-[10px] text-cyan-400 font-bold">Talent Skill — {TALENT_SKILL_COST} pts</div>
                    <div className="text-[9px] text-gray-400 mt-0.5">Choisis 1 skill unique puissant. Il remplacera un de tes 3 skills par defaut.</div>
                    <div className="text-[9px] text-gray-500 mt-0.5">Ces skills coutent plus de mana mais sont bien plus puissants.</div>
                  </div>

                  {/* Current default skills preview */}
                  {replacingSkillIdx !== null && (
                    <div className="mb-4 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/30">
                      <div className="text-[10px] text-amber-400 font-bold mb-2 text-center">Quel skill remplacer ?</div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {c.skills.map((sk, si) => (
                          <button key={si}
                            onClick={() => {
                              equipTalentSkill(id, replacingSkillIdx, si);
                              setReplacingSkillIdx(null);
                            }}
                            className="p-2 rounded-lg border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15 transition-all text-center"
                          >
                            <div className="text-[10px] font-bold text-white truncate">{sk.name}</div>
                            <div className="text-[9px] text-gray-400">
                              {sk.power > 0 ? `DMG:${sk.power}%` : ''}
                              {sk.buffAtk ? `ATK+${sk.buffAtk}%` : ''}
                              {sk.buffDef ? `DEF+${sk.buffDef}%` : ''}
                              {sk.healSelf ? `Soin ${sk.healSelf}%` : ''}
                            </div>
                            <div className="text-[9px] text-amber-400 mt-0.5">Remplacer</div>
                          </button>
                        ))}
                      </div>
                      <button onClick={() => setReplacingSkillIdx(null)}
                        className="w-full text-center text-[10px] text-gray-500 hover:text-gray-300 mt-2">Annuler</button>
                    </div>
                  )}

                  {/* Skill choices grid */}
                  <div className="space-y-2">
                    {skillChoices.map((ts, idx) => {
                      const isEquipped = equipped && equipped.skillIndex === idx;
                      return (
                        <div key={ts.id} className={`p-3 rounded-xl border transition-all ${
                          isEquipped ? 'border-cyan-400/60 bg-cyan-500/10' : 'border-gray-700/30 bg-gray-800/20'
                        }`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${isEquipped ? 'text-cyan-300' : 'text-white'}`}>{ts.name}</span>
                                {isEquipped && <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold">EQUIPE</span>}
                              </div>
                              <div className="text-[10px] text-gray-400 mt-1">{ts.desc}</div>
                              <div className="flex flex-wrap gap-2 mt-1.5">
                                {ts.power > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">DMG {ts.power}%</span>}
                                {ts.buffAtk > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400">ATK +{ts.buffAtk}%</span>}
                                {ts.buffDef > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">DEF +{ts.buffDef}%</span>}
                                {ts.healSelf > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Soin {ts.healSelf}%</span>}
                                {ts.debuffDef > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">DEF -{ts.debuffDef}%</span>}
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">CD {ts.cdMax}</span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400">Mana {ts.manaCost}</span>
                              </div>
                              {isEquipped && equipped && (
                                <div className="text-[9px] text-cyan-400/60 mt-1.5">
                                  Remplace : <span className="text-white">{c.skills[equipped.replacedSlot]?.name}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-1">
                              {!isEquipped && (
                                <button
                                  onClick={() => {
                                    if (equipped) {
                                      // Already have a skill equipped, swap
                                      setReplacingSkillIdx(idx);
                                    } else if (hasEnoughPts) {
                                      setReplacingSkillIdx(idx);
                                    }
                                  }}
                                  disabled={!hasEnoughPts && !equipped}
                                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 disabled:opacity-30 transition-all"
                                >
                                  {equipped ? 'Changer' : 'Choisir'}
                                </button>
                              )}
                              {isEquipped && (
                                <button
                                  onClick={() => unequipTalentSkill(id)}
                                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                                >
                                  Retirer
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Respec Button — per tree */}
            <div className="mt-4 text-center">
              {talentTab === 1 && (
                <button
                  onClick={() => resetTalentTree(id, 'talent1')}
                  disabled={spent1 === 0}
                  className="text-xs text-gray-500 hover:text-red-400 disabled:opacity-30 transition-colors py-2"
                >
                  Reset Talents I {getRespecCost(id, 'talent1') > 0 ? `(${getRespecCost(id, 'talent1')} coins)` : '(gratuit)'}
                </button>
              )}
              {talentTab === 2 && (
                <button
                  onClick={() => resetTalentTree(id, 'talent2')}
                  disabled={spent2 === 0}
                  className="text-xs text-gray-500 hover:text-red-400 disabled:opacity-30 transition-colors py-2"
                >
                  Reset Talents II {getRespecCost(id, 'talent2') > 0 ? `(${getRespecCost(id, 'talent2')} coins)` : '(gratuit)'}
                </button>
              )}
              {talentTab === 3 && data.talentSkills[id] && (
                <button
                  onClick={() => resetTalentTree(id, 'talentSkill')}
                  className="text-xs text-gray-500 hover:text-red-400 transition-colors py-2"
                >
                  Reset Talent Skill {getRespecCost(id, 'talentSkill') > 0 ? `(${getRespecCost(id, 'talentSkill')} coins)` : '(gratuit)'}
                </button>
              )}
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
                    {weapon.sprite ? (
                      <img src={weapon.sprite} alt={weapon.name} className="w-8 h-8 object-contain" draggable={false} />
                    ) : (
                      <span className="text-xl">{weapon.icon}</span>
                    )}
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
                let available = Object.keys(data.weaponCollection).filter(wId => wId !== weaponId && !equippedSet.has(wId) && WEAPONS[wId]);
                if (available.length === 0) return null;
                // Filter by element
                if (weaponFilter.element) available = available.filter(wId => (WEAPONS[wId].element || 'neutral') === weaponFilter.element);
                // Sort
                available.sort((a, b) => {
                  const wA = WEAPONS[a], wB = WEAPONS[b];
                  const ilA = computeWeaponILevel(a, data.weaponCollection[a] || 0);
                  const ilB = computeWeaponILevel(b, data.weaponCollection[b] || 0);
                  if (weaponFilter.sort === 'atk') return wB.atk - wA.atk;
                  if (weaponFilter.sort === 'name') return wA.name.localeCompare(wB.name);
                  return ilB - ilA; // default: ilevel desc
                });
                // Collect element options
                const elemOpts = new Set();
                Object.keys(data.weaponCollection).filter(wId => wId !== weaponId && !equippedSet.has(wId) && WEAPONS[wId]).forEach(wId => elemOpts.add(WEAPONS[wId].element || 'neutral'));
                return (
                <div className="mt-2">
                  {/* Filters */}
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    <span className="text-[9px] text-gray-500">Filtrer :</span>
                    <button onClick={() => setWeaponFilter(f => ({ ...f, element: null }))}
                      className={`text-[9px] px-1.5 py-0.5 rounded ${!weaponFilter.element ? 'bg-purple-500/30 text-purple-300' : 'bg-gray-700/30 text-gray-500'}`}>Tous</button>
                    {[...elemOpts].map(el => {
                      const e = ELEMENTS[el];
                      return (
                        <button key={el} onClick={() => setWeaponFilter(f => ({ ...f, element: f.element === el ? null : el }))}
                          className={`text-[9px] px-1.5 py-0.5 rounded ${weaponFilter.element === el ? 'bg-purple-500/30 text-purple-300' : 'bg-gray-700/30 text-gray-500'}`}>
                          {e?.icon || ''} {e?.name || 'Neutre'}
                        </button>
                      );
                    })}
                    <span className="text-[9px] text-gray-600 ml-1">|</span>
                    {[['ilevel', 'iLvl'], ['atk', 'ATK'], ['name', 'Nom']].map(([k, label]) => (
                      <button key={k} onClick={() => setWeaponFilter(f => ({ ...f, sort: k }))}
                        className={`text-[9px] px-1.5 py-0.5 rounded ${weaponFilter.sort === k ? 'bg-amber-500/30 text-amber-300' : 'bg-gray-700/30 text-gray-500'}`}>{label}</button>
                    ))}
                  </div>
                  <div className="text-[9px] text-gray-500 mb-1">Armes disponibles ({available.length}) :</div>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                  {available.map(wId => {
                    const w = WEAPONS[wId];
                    const wAw = data.weaponCollection[wId] || 0;
                    const el = ELEMENTS[w.element];
                    return (
                      <div key={wId} className="w-full flex items-center gap-2 p-1.5 rounded-lg border border-gray-700/30 bg-gray-800/20 hover:border-amber-500/40 transition-all text-left">
                        <button onClick={() => equipWeapon(wId)} className="flex items-center gap-2 flex-1 min-w-0 text-left">
                          {w.sprite ? (
                            <img src={w.sprite} alt={w.name} className="w-6 h-6 object-contain" draggable={false} />
                          ) : (
                            <span>{w.icon}</span>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-bold text-gray-300 truncate">
                              {w.name} <span className="text-yellow-400">A{wAw}</span> <span className="text-amber-400/70 text-[9px]">iLv{computeWeaponILevel(wId, wAw)}</span>
                            </div>
                            <div className="text-[10px] text-gray-500">
                              ATK +{w.atk} | {MAIN_STAT_VALUES[w.bonusStat]?.name || w.bonusStat} +{w.bonusValue}
                              {el && <span className={`ml-1 ${el.color}`}>{el.icon}</span>}
                              {!w.element && <span className="ml-1 text-gray-600">-</span>}
                            </div>
                          </div>
                        </button>
                        <button onClick={() => setWeaponDetailId(wId)} className="text-[10px] text-blue-400 hover:text-blue-300 px-1" title="Details">i</button>
                        <button onClick={() => equipWeapon(wId)} className="text-[10px] text-cyan-400 hover:text-cyan-300">Equiper</button>
                      </div>
                    );
                  })}
                  </div>
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

            {/* Artifact Inventory with Filters + Auto-Equip */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  Inventaire ({data.artifactInventory.length})
                </div>
                {/* Auto-equip button */}
                {data.artifactInventory.length > 0 && (
                  <button
                    onClick={() => {
                      // Determine chibi role from stats
                      const base = c.base;
                      const hasHeal = c.skills.some(s => s.healSelf || s.healTeam || s.buffAtk || s.buffDef);
                      const isHighDef = base.def >= base.atk;
                      const isHighAtk = base.atk > base.def * 1.3;
                      // Role: dps | tank | support
                      const role = hasHeal && !isHighAtk ? 'support' : isHighDef ? 'tank' : 'dps';

                      // Best sets per role
                      const elementSetMap = { fire: 'flamme_maudite', water: 'maree_eternelle', shadow: 'ombre_souveraine' };
                      const roleSetPriority = {
                        dps: [elementSetMap[c.element], 'infamie_chaotique', 'expertise_bestiale', 'fureur_desespoir'].filter(Boolean),
                        tank: ['volonte_de_fer', 'chaines_destin', 'benediction_celeste'],
                        support: ['benediction_celeste', 'volonte_de_fer', 'echo_temporel'],
                      };
                      const preferredSets = new Set(roleSetPriority[role] || roleSetPriority.dps);

                      // Preferred main stats per slot per role
                      const mainStatPriority = {
                        dps: { casque: 'hp_pct', plastron: 'atk_pct', gants: 'crit_dmg', bottes: 'spd_flat', collier: 'atk_pct', bracelet: 'atk_pct', anneau: 'crit_rate', boucles: 'atk_pct' },
                        tank: { casque: 'hp_pct', plastron: 'atk_flat', gants: 'crit_rate', bottes: 'def_pct', collier: 'hp_pct', bracelet: 'def_pct', anneau: 'res_flat', boucles: 'hp_pct' },
                        support: { casque: 'hp_pct', plastron: 'atk_pct', gants: 'crit_rate', bottes: 'spd_flat', collier: 'hp_pct', bracelet: 'def_pct', anneau: 'res_flat', boucles: 'hp_pct' },
                      };
                      const idealMain = mainStatPriority[role];

                      // Score each artifact for this chibi
                      const scoreArtifact = (art) => {
                        let score = 0;
                        // Rarity bonus
                        score += art.rarity === 'mythique' ? 30 : art.rarity === 'legendaire' ? 15 : 0;
                        // Level bonus
                        score += art.level * 2;
                        // Main stat match
                        if (idealMain[art.slot] === art.mainStat) score += 25;
                        // Main stat value
                        score += art.mainValue * 0.5;
                        // Set match
                        if (preferredSets.has(art.set)) score += 20;
                        // Sub stats quality
                        const dpsSubPriority = ['atk_pct', 'crit_dmg', 'crit_rate', 'atk_flat', 'spd_flat'];
                        const tankSubPriority = ['hp_pct', 'def_pct', 'hp_flat', 'def_flat', 'res_flat'];
                        const supportSubPriority = ['hp_pct', 'spd_flat', 'res_flat', 'def_pct', 'hp_flat'];
                        const subPriority = role === 'tank' ? tankSubPriority : role === 'support' ? supportSubPriority : dpsSubPriority;
                        art.subs.forEach(sub => {
                          const idx = subPriority.indexOf(sub.id);
                          if (idx !== -1) score += (5 - idx) * 2 + sub.value * 0.3;
                        });
                        return score;
                      };

                      // Pick best artifact per slot from inventory
                      setData(prev => {
                        let inv = [...prev.artifactInventory];
                        const prevEquipped = { ...(prev.artifacts[id] || {}) };
                        // Unequip all current artifacts back to inventory first
                        SLOT_ORDER.forEach(slotId => {
                          if (prevEquipped[slotId]) {
                            inv.push(prevEquipped[slotId]);
                            delete prevEquipped[slotId];
                          }
                        });
                        const newEquipped = {};
                        // For each slot, find the best available artifact
                        SLOT_ORDER.forEach(slotId => {
                          const candidates = inv.filter(a => a.slot === slotId);
                          if (candidates.length === 0) return;
                          candidates.sort((a, b) => scoreArtifact(b) - scoreArtifact(a));
                          const best = candidates[0];
                          newEquipped[slotId] = best;
                          inv = inv.filter(a => a.uid !== best.uid);
                        });
                        return { ...prev, artifacts: { ...prev.artifacts, [id]: newEquipped }, artifactInventory: inv };
                      });
                      window.dispatchEvent(new CustomEvent('beru-react', {
                        detail: { message: role === 'dps' ? "Full DPS ! Que la destruction commence !" : role === 'tank' ? "Blindage maximal ! Rien ne passera !" : "Support optimal ! L'equipe te remercie !", mood: 'happy' }
                      }));
                    }}
                    className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/30 text-[10px] font-bold text-cyan-300 hover:from-cyan-600/50 hover:to-blue-600/50 transition-all"
                  >
                    {'\u2728'} Auto-Equip
                  </button>
                )}
              </div>

              {/* Filters */}
              {data.artifactInventory.length > 0 && (
                <div className="mb-2 space-y-1">
                  {/* Slot filter */}
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[9px] text-gray-500 w-8">Slot</span>
                    {SLOT_ORDER.map(sId => (
                      <button key={sId} onClick={() => setEqInvFilter(prev => ({ ...prev, slot: prev.slot === sId ? null : sId }))}
                        className={`px-1.5 py-0.5 rounded text-[10px] transition-all ${
                          eqInvFilter.slot === sId ? 'text-purple-300 bg-purple-500/15 ring-1 ring-purple-400/50' : 'text-gray-500 bg-gray-800/30 hover:bg-gray-700/30'
                        }`}>{ARTIFACT_SLOTS[sId]?.icon}</button>
                    ))}
                  </div>
                  {/* Set filter */}
                  {(() => {
                    const setsInInv = new Set(data.artifactInventory.map(a => a.set));
                    if (setsInInv.size === 0) return null;
                    return (
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[9px] text-gray-500 w-8">Set</span>
                        {[...setsInInv].map(setId => {
                          const s = ALL_ARTIFACT_SETS[setId];
                          if (!s) return null;
                          return (
                            <div key={setId} className="relative group/set">
                              <button onClick={() => setEqInvFilter(prev => ({ ...prev, set: prev.set === setId ? null : setId }))}
                                className={`px-1.5 py-0.5 rounded text-[10px] transition-all ${
                                  eqInvFilter.set === setId ? `${s.color} ${s.bg} ring-1 ring-current` : 'text-gray-500 bg-gray-800/30 hover:bg-gray-700/30'
                                }`}>{s.icon}</button>
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/set:block z-50 pointer-events-none">
                                <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-600/40 rounded-lg px-2.5 py-1.5 shadow-xl w-max max-w-[200px]">
                                  <div className={`text-[10px] font-bold ${s.color} mb-1`}>{s.icon} {s.name}</div>
                                  <div className="text-[9px] text-green-400">2p : {s.bonus2Desc}</div>
                                  <div className="text-[9px] text-blue-400">4p : {s.bonus4Desc}</div>
                                  {s.bonus8Desc && <div className="text-[9px] text-orange-400">8p : {s.bonus8Desc}</div>}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                  {(eqInvFilter.slot || eqInvFilter.set) && (
                    <button onClick={() => setEqInvFilter({ slot: null, set: null })}
                      className="text-[10px] text-red-400 hover:text-red-300">Reset filtres</button>
                  )}
                </div>
              )}

              {/* Inventory grid */}
              {(() => {
                const filteredInv = data.artifactInventory.map((art, i) => ({ art, i })).filter(({ art }) => {
                  if (eqInvFilter.slot && art.slot !== eqInvFilter.slot) return false;
                  if (eqInvFilter.set && art.set !== eqInvFilter.set) return false;
                  return true;
                });
                return filteredInv.length === 0 ? (
                  <div className="text-center text-[10px] text-gray-600 py-4">
                    {data.artifactInventory.length === 0 ? "Aucun artefact. Forge-en dans la Boutique !" : "Aucun artefact ne correspond aux filtres."}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5 max-h-72 overflow-y-auto">
                    {filteredInv.map(({ art, i }) => {
                      const setDef = ALL_ARTIFACT_SETS[art.set];
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
                );
              })()}
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
        const hammers = data.hammers || { marteau_forge: 0, marteau_runique: 0, marteau_celeste: 0, marteau_rouge: 0 };

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
          if (!h || coins < h.shopPrice) return false;
          shadowCoinManager.spendCoins(h.shopPrice);
          setData(prev => {
            const newH = { ...(prev.hammers || { marteau_forge: 0, marteau_runique: 0, marteau_celeste: 0, marteau_rouge: 0 }) };
            newH[hId] = (newH[hId] || 0) + 1;
            return { ...prev, hammers: newH };
          });
          return true;
        };

        // Bulk buy: buy N hammers at once
        const buyHammerBulk = (hId, qty) => {
          const h = HAMMERS[hId];
          if (!h) return;
          const totalCost = h.shopPrice * qty;
          const affordable = Math.min(qty, Math.floor(coins / h.shopPrice));
          if (affordable <= 0) return;
          shadowCoinManager.spendCoins(h.shopPrice * affordable);
          setData(prev => {
            const newH = { ...(prev.hammers || { marteau_forge: 0, marteau_runique: 0, marteau_celeste: 0, marteau_rouge: 0 }) };
            newH[hId] = (newH[hId] || 0) + affordable;
            return { ...prev, hammers: newH };
          });
        };

        // Hold-to-buy: accelerates from 300ms to 50ms interval
        const startHammerHold = (hId) => {
          buyHammer(hId);
          let delay = 300;
          const tick = () => {
            const ok = buyHammer(hId);
            if (!ok) { stopHammerHold(); return; }
            delay = Math.max(50, delay * 0.85);
            hammerHoldRef.current = setTimeout(tick, delay);
          };
          hammerHoldRef.current = setTimeout(tick, delay);
        };
        const stopHammerHold = () => {
          if (hammerHoldRef.current) { clearTimeout(hammerHoldRef.current); hammerHoldRef.current = null; }
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
                {/* Red Hammer */}
                <div className="text-center border-l border-gray-700/30 pl-4">
                  <div className="text-xl">{'\uD83D\uDD34'}</div>
                  <div className="text-[9px] text-red-400 font-bold">Rouge</div>
                  <div className={`text-sm font-bold ${(hammers.marteau_rouge || 0) > 0 ? 'text-red-400' : 'text-gray-600'}`}>{hammers.marteau_rouge || 0}</div>
                </div>
              </div>
            </div>

            {/* Buy Hammers */}
            <div className="mb-5">
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">{'\uD83D\uDEE0\uFE0F'} Acheter des Marteaux</div>
              <div className="grid grid-cols-3 gap-2">
                {HAMMER_ORDER.map(hId => {
                  const h = HAMMERS[hId];
                  return (
                    <div key={hId} className="flex flex-col gap-1">
                      <button disabled={coins < h.shopPrice}
                        onPointerDown={() => startHammerHold(hId)}
                        onPointerUp={stopHammerHold}
                        onPointerLeave={stopHammerHold}
                        onContextMenu={(e) => e.preventDefault()}
                        className="p-2 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/15 active:bg-amber-500/25 disabled:opacity-30 transition-all text-center select-none touch-none">
                        <div className="text-lg">{h.icon}</div>
                        <div className="text-[9px] font-bold text-amber-300">{h.name.replace('Marteau ', '')}</div>
                        <div className="text-[10px] text-gray-500">Lv0-{h.maxLevel}</div>
                        <div className="text-[9px] text-amber-400 mt-0.5">{h.shopPrice} coins</div>
                      </button>
                      <div className="flex gap-0.5">
                        {[10, 100, 1000].map(qty => (
                          <button key={qty} onClick={() => buyHammerBulk(hId, qty)}
                            disabled={coins < h.shopPrice}
                            className="flex-1 py-0.5 rounded-lg text-[8px] font-bold border border-amber-500/15 bg-amber-500/5 hover:bg-amber-500/20 active:bg-amber-500/30 disabled:opacity-30 transition-all text-amber-400 select-none">
                            x{qty}
                          </button>
                        ))}
                      </div>
                    </div>
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
              {/* Weapon filters */}
              <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                <button onClick={() => setWeaponFilter(f => ({ ...f, element: null }))}
                  className={`text-[9px] px-1.5 py-0.5 rounded ${!weaponFilter.element ? 'bg-purple-500/30 text-purple-300' : 'bg-gray-700/30 text-gray-500'}`}>Tous</button>
                {['fire', 'water', 'shadow', 'wind', 'earth', 'light', 'neutral'].map(el => {
                  const e = ELEMENTS[el];
                  return (
                    <button key={el} onClick={() => setWeaponFilter(f => ({ ...f, element: f.element === el ? null : el }))}
                      className={`text-[9px] px-1.5 py-0.5 rounded ${weaponFilter.element === el ? 'bg-purple-500/30 text-purple-300' : 'bg-gray-700/30 text-gray-500'}`}>
                      {e?.icon || '-'} {e?.name || 'Neutre'}
                    </button>
                  );
                })}
                <span className="text-[9px] text-gray-600">|</span>
                {[['ilevel', 'iLvl'], ['atk', 'ATK'], ['name', 'Nom']].map(([k, label]) => (
                  <button key={k} onClick={() => setWeaponFilter(f => ({ ...f, sort: k }))}
                    className={`text-[9px] px-1.5 py-0.5 rounded ${weaponFilter.sort === k ? 'bg-amber-500/30 text-amber-300' : 'bg-gray-700/30 text-gray-500'}`}>{label}</button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1.5 max-h-72 overflow-y-auto">
                {Object.values(WEAPONS).filter(w => !w.secret && (!weaponFilter.element || (w.element || 'neutral') === weaponFilter.element))
                  .sort((a, b) => {
                    if (weaponFilter.sort === 'atk') return b.atk - a.atk;
                    if (weaponFilter.sort === 'name') return a.name.localeCompare(b.name);
                    return computeWeaponILevel(b.id, ownedWeapons[b.id] || 0) - computeWeaponILevel(a.id, ownedWeapons[a.id] || 0);
                  }).map(w => {
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
                        {w.sprite ? (
                          <img src={w.sprite} alt={w.name} className="w-6 h-6 object-contain" draggable={false} />
                        ) : (
                          <span className="text-sm">{w.icon}</span>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-bold text-gray-200 truncate">{w.name}
                            {owned && <span className="text-yellow-400 ml-1">A{aw}</span>}
                            <span className="text-amber-400/60 ml-1">iLv{computeWeaponILevel(w.id, aw || 0)}</span>
                          </div>
                          <div className="text-[10px] text-gray-500">
                            ATK +{w.atk} | {MAIN_STAT_VALUES[w.bonusStat]?.name || w.bonusStat} +{w.bonusValue}
                            {w.element ? <span className={`ml-1 ${ELEMENTS[w.element]?.color || 'text-gray-400'}`}> {ELEMENTS[w.element]?.icon} {ELEMENTS[w.element]?.name}</span> : <span className="ml-1 text-gray-600">Neutre</span>}
                          </div>
                        </div>
                        <span onClick={(e) => { e.stopPropagation(); setWeaponDetailId(w.id); }} className="text-xs text-blue-400 cursor-pointer hover:text-blue-300" title="Voir details">{'i'}</span>
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

            {/* Red Hammer Shop — Forge Rouge */}
            {(() => {
              const redHammers = hammers.marteau_rouge || 0;
              const boostMs = data.lootBoostMs || 0;
              const boostCost = 75;
              const canBuyBoost = redHammers >= boostCost;

              const fmtBoostTime = (ms) => {
                const h = Math.floor(ms / 3600000);
                const m = Math.floor((ms % 3600000) / 60000);
                const s = Math.floor((ms % 60000) / 1000);
                return h > 0 ? `${h}h${String(m).padStart(2,'0')}m` : `${m}m${String(s).padStart(2,'0')}s`;
              };

              const buyLootBoost = () => {
                if (!canBuyBoost) return;
                setData(prev => {
                  const newH = { ...prev.hammers };
                  newH.marteau_rouge = (newH.marteau_rouge || 0) - boostCost;
                  return { ...prev, hammers: newH, lootBoostMs: (prev.lootBoostMs || 0) + 3600000 };
                });
              };

              return (
                <div className="mb-5">
                  <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-[10px] text-red-400 font-bold uppercase tracking-wider">{'\uD83D\uDD34'} Forge Rouge</div>
                      <div className="text-[10px] text-red-300 font-bold">{'\uD83D\uDD34'} {redHammers} marteaux</div>
                    </div>

                    {/* Boost Loot x2 */}
                    <div className={`p-3 rounded-xl border ${boostMs > 0 ? 'border-green-500/40 bg-green-500/5' : 'border-red-500/20 bg-red-900/10'} transition-all`}>
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{'\u2728'}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-black text-red-300">Boost Loot x2</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">Double les chances de drop des armes secretes pendant 1h</div>
                          <div className="text-[9px] text-gray-500 mt-0.5">Sulfuras, Rae'shalare, Katana Z, Katana V</div>
                          <div className="text-[8px] text-gray-600 mt-0.5 italic">Le timer ne s'ecoule que pendant les combats de boss eligibles</div>
                        </div>
                      </div>

                      {boostMs > 0 && (
                        <div className="mt-2 px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
                          <div className="text-[10px] text-green-400 font-bold">Actif — {fmtBoostTime(boostMs)} restant</div>
                        </div>
                      )}

                      <button
                        onClick={buyLootBoost}
                        disabled={!canBuyBoost}
                        className={`mt-2 w-full py-2 rounded-lg text-xs font-bold transition-all ${canBuyBoost
                          ? 'bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 hover:text-red-200'
                          : 'bg-gray-800/40 border border-gray-700/20 text-gray-600 cursor-not-allowed'}`}
                      >
                        {'\uD83D\uDD34'} {boostCost} marteaux rouges — Acheter (+1h)
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Fragment Forge — Exchange 10 fragments for weapon */}
            {(() => {
              const frags = data.fragments || { fragment_sulfuras: 0, fragment_raeshalare: 0, fragment_katana_z: 0, fragment_katana_v: 0 };
              const weapons = data.collection || [];

              const forgeWeapon = (fragmentId, weaponId) => {
                if ((frags[fragmentId] || 0) < 10) return;
                if (weapons.includes(weaponId)) return; // Already have weapon

                setData(prev => {
                  const newFrags = { ...prev.fragments };
                  newFrags[fragmentId] = (newFrags[fragmentId] || 0) - 10;
                  const newCollection = [...(prev.collection || []), weaponId];
                  return { ...prev, fragments: newFrags, collection: newCollection };
                });

                // Show success toast
                showToast(`🎉 Arme forgée: ${WEAPONS[weaponId]?.name || weaponId}!`, '#fbbf24');
              };

              const forgeItems = [
                { fragmentId: 'fragment_sulfuras', weaponId: 'sulfuras', icon: '🔥', name: 'Masse de Sulfuras' },
                { fragmentId: 'fragment_raeshalare', weaponId: 'raeshalare', icon: '🌀', name: "Arc Rae'shalare" },
                { fragmentId: 'fragment_katana_z', weaponId: 'katana_z', icon: '⚡', name: 'Katana Z' },
                { fragmentId: 'fragment_katana_v', weaponId: 'katana_v', icon: '💚', name: 'Katana V' },
              ];

              return (
                <div className="mb-5">
                  <div className="p-4 rounded-xl border border-orange-500/30 bg-orange-500/5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">⚒️ Forge Mystique</div>
                      <div className="text-[9px] text-orange-300/60">10 fragments = 1 arme</div>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {forgeItems.map(item => {
                        const count = frags[item.fragmentId] || 0;
                        const hasWeapon = weapons.includes(item.weaponId);
                        const canForge = count >= 10 && !hasWeapon;

                        return (
                          <div key={item.fragmentId} className={`p-2 rounded-lg border ${canForge ? 'border-orange-500/40 bg-orange-500/10' : 'border-gray-700/30 bg-gray-900/20'} transition-all`}>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="text-xl">{item.icon}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[11px] font-bold text-orange-300">{item.name}</div>
                                  <div className={`text-[10px] font-bold ${count >= 10 ? 'text-green-400' : 'text-gray-500'}`}>
                                    Fragments: {count}/10
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => forgeWeapon(item.fragmentId, item.weaponId)}
                                disabled={!canForge}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${canForge
                                  ? 'bg-orange-500/30 border border-orange-500/50 text-orange-200 hover:bg-orange-500/40'
                                  : hasWeapon
                                  ? 'bg-green-500/20 border border-green-500/30 text-green-400 cursor-default'
                                  : 'bg-gray-800/40 border border-gray-700/20 text-gray-600 cursor-not-allowed'}`}
                              >
                                {hasWeapon ? '✓ Possédé' : canForge ? '⚒️ Forger' : '🔒 Locked'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

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
        const hammers = data.hammers || { marteau_forge: 0, marteau_runique: 0, marteau_celeste: 0, marteau_rouge: 0 };
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
          if (!selArt || isEquipped || selArt.locked) return;
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

            {/* ═══ CLEANUP SECTION ═══ */}
            <div className="mb-4">
              <button
                onClick={() => setCleanupExpanded(prev => !prev)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10 transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{'\u26A1'}</span>
                  <span className="text-sm font-bold text-yellow-300">Nettoyage d'Inventaire</span>
                  <span className="text-[10px] text-gray-500">({inv.length} artefacts)</span>
                </div>
                <span className={`text-gray-400 transition-transform ${cleanupExpanded ? 'rotate-180' : ''}`}>{'\u25BC'}</span>
              </button>

              {cleanupExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-2 p-3 rounded-xl border border-yellow-500/20 bg-gray-900/40 space-y-3"
                >
                  {/* Keep per set slider */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gray-400">Garder par set</span>
                      <span className="text-sm font-bold text-yellow-300">{cleanupConfig.keepPerSet}</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="20"
                      step="1"
                      value={cleanupConfig.keepPerSet}
                      onChange={e => setCleanupConfig(prev => ({ ...prev, keepPerSet: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                    <div className="flex justify-between text-[9px] text-gray-600 mt-0.5">
                      <span>Minimal (5)</span>
                      <span>Balanced (10)</span>
                      <span>Hoarder (20)</span>
                    </div>
                  </div>

                  {/* Protected sets */}
                  <div>
                    <div className="text-[10px] text-gray-400 mb-1">Sets protégés (ne seront pas supprimés)</div>
                    <div className="flex flex-wrap gap-1">
                      {Object.values(ALL_ARTIFACT_SETS).map(set => {
                        const isProtected = cleanupConfig.protectedSets.has(set.id);
                        return (
                          <button
                            key={set.id}
                            onClick={() => {
                              setCleanupConfig(prev => {
                                const newProtected = new Set(prev.protectedSets);
                                if (isProtected) newProtected.delete(set.id);
                                else newProtected.add(set.id);
                                return { ...prev, protectedSets: newProtected };
                              });
                            }}
                            className={`px-2 py-1 rounded text-[9px] font-bold transition-all ${
                              isProtected
                                ? `${set.color} ${set.bg} ring-1 ring-current`
                                : 'text-gray-600 bg-gray-800/30 hover:bg-gray-700/30'
                            }`}
                          >
                            {set.icon} {set.name.split(' ')[0]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Override options */}
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 text-[10px] text-gray-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cleanupConfig.includeHighLevel}
                        onChange={e => setCleanupConfig(prev => ({ ...prev, includeHighLevel: e.target.checked }))}
                        className="accent-red-500"
                      />
                      <span>Inclure artefacts Lv15+ ({'\u26A0\uFE0F'} risqué)</span>
                    </label>
                    <label className="flex items-center gap-2 text-[10px] text-gray-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cleanupConfig.includeMythic10}
                        onChange={e => setCleanupConfig(prev => ({ ...prev, includeMythic10: e.target.checked }))}
                        className="accent-red-500"
                      />
                      <span>Inclure Mythiques Lv10+ ({'\u26A0\uFE0F'} risqué)</span>
                    </label>
                  </div>

                  {/* Preview button */}
                  <button
                    onClick={() => setCleanupPreview(computeCleanupPreview(cleanupConfig))}
                    className="w-full py-2 rounded-lg bg-blue-600/30 text-blue-300 text-[11px] font-bold hover:bg-blue-600/50 transition-colors"
                  >
                    {'\uD83D\uDD0D'} Prévisualiser le nettoyage
                  </button>

                  {/* Preview panel */}
                  {cleanupPreview && (
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="p-3 rounded-lg border border-purple-500/30 bg-purple-500/10"
                    >
                      <div className="text-[11px] font-bold text-purple-300 mb-2">{'\uD83D\uDCCA'} Aperçu du nettoyage</div>

                      {cleanupPreview.totalDelete === 0 ? (
                        <div className="text-[10px] text-gray-400">Aucun artefact à supprimer avec ces paramètres.</div>
                      ) : (
                        <>
                          {/* Summary */}
                          <div className="grid grid-cols-2 gap-2 mb-2 text-[10px]">
                            <div className="p-2 rounded bg-red-500/10 border border-red-500/20">
                              <div className="text-red-400 font-bold">À supprimer</div>
                              <div className="text-xl font-black text-red-300">{cleanupPreview.totalDelete}</div>
                            </div>
                            <div className="p-2 rounded bg-green-500/10 border border-green-500/20">
                              <div className="text-green-400 font-bold">À garder</div>
                              <div className="text-xl font-black text-green-300">{cleanupPreview.totalKeep}</div>
                            </div>
                          </div>

                          {/* Breakdown by rarity */}
                          <div className="mb-2 p-2 rounded bg-gray-800/30 border border-gray-700/20">
                            <div className="text-[9px] text-gray-400 mb-1">Par rareté:</div>
                            <div className="flex gap-2 text-[10px]">
                              {cleanupPreview.rarityBreakdown.rare > 0 && (
                                <span className="text-blue-400">{cleanupPreview.rarityBreakdown.rare} Rare</span>
                              )}
                              {cleanupPreview.rarityBreakdown.legendaire > 0 && (
                                <span className="text-orange-400">{cleanupPreview.rarityBreakdown.legendaire} Légendaire</span>
                              )}
                              {cleanupPreview.rarityBreakdown.mythique > 0 && (
                                <span className="text-red-400">{cleanupPreview.rarityBreakdown.mythique} Mythique</span>
                              )}
                            </div>
                          </div>

                          {/* Expected coins */}
                          <div className="mb-2 p-2 rounded bg-yellow-500/10 border border-yellow-500/20 text-center">
                            <div className="text-[9px] text-yellow-400/70">Revenus attendus</div>
                            <div className="text-lg font-black text-yellow-300">{'\uD83E\uDE99'} {cleanupPreview.totalCoins} coins</div>
                          </div>

                          {/* Execute button */}
                          <button
                            onClick={executeCleanup}
                            className="w-full py-2 rounded-lg bg-red-600/30 text-red-300 text-[11px] font-bold hover:bg-red-600/50 transition-colors border border-red-500/30"
                          >
                            {'\uD83D\uDDD1\uFE0F'} NETTOYER L'INVENTAIRE ({cleanupPreview.totalDelete} artefacts)
                          </button>
                          <div className="text-[8px] text-gray-500 text-center mt-1">
                            {'\u26A0\uFE0F'} Cette action est irréversible!
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </motion.div>
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
                        className={`relative p-1.5 rounded-lg border text-left transition-all ${
                          selected ? 'border-purple-400 bg-purple-500/15 ring-1 ring-purple-400/40' :
                          `${setDef?.border || 'border-gray-700/30'} ${setDef?.bg || 'bg-gray-800/10'} hover:border-gray-500/40`
                        }`}>
                        {/* Lock button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setData(prev => ({
                              ...prev,
                              artifactInventory: prev.artifactInventory.map((a, i) =>
                                i === idx ? { ...a, locked: !a.locked } : a
                              )
                            }));
                          }}
                          className="absolute top-0.5 right-0.5 text-xs z-10 hover:scale-110 transition-transform"
                        >
                          {art.locked ? '\uD83D\uDD12' : '\uD83D\uDD13'}
                        </button>

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
                              className={`relative p-1 rounded-lg border text-center transition-all ${
                                selected ? 'border-purple-400 bg-purple-500/15' :
                                `${setDef?.border || 'border-gray-700/30'} ${setDef?.bg || 'bg-gray-800/10'} hover:border-gray-500/40`
                              }`}>
                              {/* Lock indicator */}
                              {art.locked && (
                                <span className="absolute top-0 right-0 text-[8px]">{'\uD83D\uDD12'}</span>
                              )}
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
                  {/* Lock toggle */}
                  <button
                    onClick={() => {
                      if (isEquipped) {
                        const [, cId, sId] = artSelected.split(':');
                        setData(prev => ({
                          ...prev,
                          artifacts: {
                            ...prev.artifacts,
                            [cId]: {
                              ...prev.artifacts[cId],
                              [sId]: { ...prev.artifacts[cId][sId], locked: !prev.artifacts[cId][sId].locked }
                            }
                          }
                        }));
                      } else {
                        setData(prev => ({
                          ...prev,
                          artifactInventory: prev.artifactInventory.map((a, i) =>
                            i === artSelected ? { ...a, locked: !a.locked } : a
                          )
                        }));
                      }
                    }}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-colors ${
                      selArt.locked
                        ? 'bg-yellow-600/30 text-yellow-300 hover:bg-yellow-600/50'
                        : 'bg-gray-600/30 text-gray-400 hover:bg-gray-600/50'
                    }`}
                  >
                    {selArt.locked ? '\uD83D\uDD12 Verrouillé' : '\uD83D\uDD13 Déverrouiller'}
                  </button>

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
                  <button
                    onPointerDown={() => {
                      if (!canEnhance) return;
                      doEnhance();
                      let delay = 350;
                      const tick = () => { doEnhance(); delay = Math.max(40, delay * 0.82); enhanceHoldRef.current = setTimeout(tick, delay); };
                      enhanceHoldRef.current = setTimeout(tick, delay);
                    }}
                    onPointerUp={() => { if (enhanceHoldRef.current) { clearTimeout(enhanceHoldRef.current); enhanceHoldRef.current = null; } }}
                    onPointerLeave={() => { if (enhanceHoldRef.current) { clearTimeout(enhanceHoldRef.current); enhanceHoldRef.current = null; } }}
                    onContextMenu={e => e.preventDefault()}
                    disabled={!canEnhance}
                    className="flex-1 py-1.5 rounded-lg bg-cyan-600/30 text-cyan-300 text-[10px] font-bold hover:bg-cyan-600/50 disabled:opacity-30 transition-colors select-none">
                    {'\uD83D\uDD28'} +1 ({bestHammer ? HAMMERS[bestHammer].icon : '?'} {coinCost}c)
                  </button>
                  {!isEquipped && (
                    <button onClick={doSell} disabled={selArt.locked}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-colors ${
                        selArt.locked
                          ? 'bg-gray-800/40 text-gray-600 cursor-not-allowed'
                          : 'bg-red-600/20 text-red-400 hover:bg-red-600/40'
                      }`}>
                      {selArt.locked ? '\uD83D\uDD12 Verrouillé' : `Vendre (${Math.floor((FORGE_COSTS[selArt.rarity] || 200) * SELL_RATIO)}c)`}
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
            weaponPassive={selChibi && data.weapons[selChibi] ? WEAPONS[data.weapons[selChibi]]?.passive : null}
          />
          {/* Auto toggle + Farm stats HUD */}
          <div className="absolute top-1 right-2 z-20 flex flex-col items-end gap-1">
            <button
              onClick={() => { const next = !autoReplay; setAutoReplay(next); if (next) setAutoFarmStats({ runs: 0, wins: 0, levels: 0, coins: 0, loots: 0, hunters: 0, weapons: 0, artifacts: 0 }); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${autoReplay ? 'bg-green-500/90 text-white shadow-lg shadow-green-500/30 ring-1 ring-green-400/50' : 'bg-gray-700/80 text-gray-400 hover:bg-gray-600/80'}`}>
              Auto {autoReplay ? 'ON' : 'OFF'}
            </button>
            {autoReplay && autoFarmStats.runs > 0 && (
              <div className="px-2.5 py-1.5 rounded-lg bg-gray-900/90 border border-green-500/30 backdrop-blur-sm text-right">
                <div className="text-[9px] text-green-400 font-bold uppercase tracking-wider mb-0.5">Auto-Farm</div>
                <div className="text-[10px] text-white font-bold">{autoFarmStats.runs} runs</div>
                <div className="flex flex-col gap-0 text-[9px]">
                  {autoFarmStats.levels > 0 && <span className="text-yellow-400">+{autoFarmStats.levels} niveaux</span>}
                  <span className="text-amber-300">+{autoFarmStats.coins.toLocaleString()} coins</span>
                  {autoFarmStats.loots > 0 && <span className="text-purple-400">{autoFarmStats.loots} loots</span>}
                  {autoFarmStats.hunters > 0 && <span className="text-blue-400">{autoFarmStats.hunters} hunters</span>}
                  {autoFarmStats.weapons > 0 && <span className="text-red-400">{autoFarmStats.weapons} armes</span>}
                  {autoFarmStats.artifacts > 0 && <span className="text-indigo-400">{autoFarmStats.artifacts} artefacts</span>}
                </div>
              </div>
            )}
            {/* Loot Boost x2 indicator */}
            {data.lootBoostMs > 0 && ['ragnarok', 'zephyr', 'supreme_monarch'].includes(STAGES[selStage]?.id) && (
              <div className="mt-1 px-2.5 py-1 rounded-lg bg-red-500/20 border border-red-500/40 backdrop-blur-sm animate-pulse">
                <div className="text-[10px] text-red-400 font-bold">{'\uD83D\uDD34'} LOOT x2</div>
                <div className="text-[9px] text-red-300/70 text-center">{(() => { const ms = data.lootBoostMs; const h = Math.floor(ms/3600000); const m = Math.floor((ms%3600000)/60000); const s = Math.floor((ms%60000)/1000); return h > 0 ? `${h}h${String(m).padStart(2,'0')}m` : `${m}m${String(s).padStart(2,'0')}s`; })()}</div>
              </div>
            )}
            {/* Ragnarok Tracker — persistent kill counter & Sulfuras hunt */}
            {STAGES[selStage]?.id === 'ragnarok' && (
              <div className="mt-1 px-2.5 py-2 rounded-lg bg-gradient-to-b from-orange-900/40 to-red-900/40 border border-orange-500/30 backdrop-blur-sm cursor-pointer hover:border-orange-400/50 transition-colors"
                onClick={() => setRagnarokHistoryOpen(true)}>
                <div className="text-[9px] text-orange-400 font-bold uppercase tracking-wider mb-1">{'\u2604\uFE0F'} Ragnarok</div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-red-300 font-bold">{'\u2620\uFE0F'} {data.ragnarokKills || 0} kills</span>
                  <span className="text-gray-600">|</span>
                  <span className="text-amber-300 font-bold">{'\u2694\uFE0F'} {(data.ragnarokDropLog || []).length} drops</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  {data.weaponCollection?.['w_sulfuras'] !== undefined ? (
                    <>
                      <img src={WEAPONS.w_sulfuras?.sprite} alt="Sulfuras" className="w-4 h-4 object-contain" />
                      <span className="text-[9px] text-orange-300 font-bold">Sulfuras obtenue ! (x{(data.ragnarokDropLog || []).filter(d => d.weaponId === 'w_sulfuras').length} drops, A{data.weaponCollection['w_sulfuras']})</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] opacity-40">{'\uD83D\uDD28'}</span>
                      <span className="text-[9px] text-gray-500">{data.ragnarokKills > 0 ? `${data.ragnarokKills} kills sans Sulfuras` : 'Chasse en cours...'}</span>
                    </>
                  )}
                </div>
                {(data.ragnarokKills || 0) > 0 && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-[9px] text-gray-500">Chance cumulee :</span>
                    <span className="text-[9px] text-orange-400 font-bold">{Math.min(99.99, (1 - Math.pow(1 - 1/10000, data.ragnarokKills)) * 100).toFixed(2)}%</span>
                    <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-600 to-red-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (1 - Math.pow(1 - 1/10000, data.ragnarokKills)) * 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Zephyr Tracker — persistent kill counter & Rae'shalare hunt */}
            {STAGES[selStage]?.id === 'zephyr' && (
              <div className="mt-1 px-2.5 py-2 rounded-lg bg-gradient-to-b from-teal-900/40 to-cyan-900/40 border border-teal-500/30 backdrop-blur-sm">
                <div className="text-[9px] text-teal-400 font-bold uppercase tracking-wider mb-1">{'\uD83C\uDF2C\uFE0F'} Zephyr Ultime</div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-teal-300 font-bold">{'\u2620\uFE0F'} {data.zephyrKills || 0} kills</span>
                  <span className="text-gray-600">|</span>
                  <span className="text-amber-300 font-bold">{'\u2694\uFE0F'} {(data.zephyrDropLog || []).length} drops</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  {data.weaponCollection?.['w_raeshalare'] !== undefined ? (
                    <>
                      <span className="text-sm">{'\uD83C\uDFF9'}</span>
                      <span className="text-[9px] text-teal-300 font-bold">Rae'shalare obtenue ! (x{(data.zephyrDropLog || []).filter(d => d.weaponId === 'w_raeshalare').length} drops, A{data.weaponCollection['w_raeshalare']})</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] opacity-40">{'\uD83C\uDFF9'}</span>
                      <span className="text-[9px] text-gray-500">{data.zephyrKills > 0 ? `${data.zephyrKills} kills sans Rae'shalare` : 'Chasse en cours...'}</span>
                    </>
                  )}
                </div>
                {(data.zephyrKills || 0) > 0 && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-[9px] text-gray-500">Chance cumulee :</span>
                    <span className="text-[9px] text-teal-400 font-bold">{Math.min(99.99, (1 - Math.pow(1 - 1/5000, data.zephyrKills)) * 100).toFixed(2)}%</span>
                    <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (1 - Math.pow(1 - 1/5000, data.zephyrKills)) * 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Monarque Supreme Tracker — Katana Z & V hunt */}
            {STAGES[selStage]?.id === 'supreme_monarch' && (
              <div className="mt-1 px-2.5 py-2 rounded-lg bg-gradient-to-b from-purple-900/40 to-indigo-900/40 border border-purple-500/30 backdrop-blur-sm cursor-pointer hover:border-purple-400/50 transition-colors"
                onClick={() => setMonarchHistoryOpen(true)}>
                <div className="text-[9px] text-purple-400 font-bold uppercase tracking-wider mb-1">{'\uD83D\uDC51'} Monarque Supreme</div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-purple-300 font-bold">{'\u2620\uFE0F'} {data.monarchKills || 0} kills</span>
                  <span className="text-gray-600">|</span>
                  <span className="text-amber-300 font-bold">{'\u2694\uFE0F'} {(data.monarchDropLog || []).length} drops</span>
                </div>
                <div className="mt-1 space-y-0.5">
                  {['w_katana_z', 'w_katana_v'].map(wId => {
                    const has = data.weaponCollection?.[wId] !== undefined;
                    const count = (data.monarchDropLog || []).filter(d => d.weaponId === wId).length;
                    const w = WEAPONS[wId];
                    return (
                      <div key={wId} className="flex items-center gap-1.5">
                        {has ? (
                          <>
                            <img src={w?.sprite} alt={w?.name} className="w-4 h-4 object-contain" />
                            <span className="text-[9px] text-purple-300 font-bold">{w?.name} obtenu ! (x{count} drops, A{data.weaponCollection[wId]})</span>
                          </>
                        ) : (
                          <>
                            <span className="text-[10px] opacity-40">{'\u2694\uFE0F'}</span>
                            <span className="text-[9px] text-gray-500">{w?.name} — 1/50 000</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
                {(data.monarchKills || 0) > 0 && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-[9px] text-gray-500">Chance cumulee (chaque) :</span>
                    <span className="text-[9px] text-purple-400 font-bold">{Math.min(99.99, (1 - Math.pow(1 - 1/50000, data.monarchKills)) * 100).toFixed(2)}%</span>
                    <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (1 - Math.pow(1 - 1/50000, data.monarchKills)) * 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ FICHE PERSOS — Character Detail Sheet ═══ */}
      {view === 'fiche' && (() => {
        const rd = loadRaidData();
        const allChars = ownedIds.map(id => {
          const c = getChibiData(id);
          if (!c) return null;
          const isHunter = !!HUNTERS[id];
          const { level } = getChibiLevel(id);
          const stars = isHunter ? getHunterStars(rd, id) : 0;
          const passive = isHunter ? HUNTER_PASSIVE_EFFECTS[id] : null;
          const passiveDesc = isHunter ? HUNTERS[id]?.passiveDesc : null;
          return { id, ...c, level, isHunter, stars, passive, passiveDesc };
        }).filter(Boolean);

        const elemColors = { fire: 'text-red-400', water: 'text-blue-400', shadow: 'text-purple-400', wind: 'text-green-400', earth: 'text-yellow-600', light: 'text-yellow-300' };
        const elemEmoji = { fire: '\uD83D\uDD25', water: '\uD83D\uDCA7', shadow: '\uD83C\uDF11', wind: '\uD83D\uDCA8', earth: '\uD83C\uDF0D', light: '\u2728' };
        const passiveTypeColors = {
          permanent: 'bg-emerald-900/50 text-emerald-300', firstTurn: 'bg-yellow-900/50 text-yellow-300',
          lowHp: 'bg-red-900/50 text-red-300', highHp: 'bg-blue-900/50 text-blue-300',
          stacking: 'bg-orange-900/50 text-orange-300', healBonus: 'bg-green-900/50 text-green-300',
          critDmg: 'bg-amber-900/50 text-amber-300', magicDmg: 'bg-indigo-900/50 text-indigo-300',
          vsBoss: 'bg-red-900/50 text-red-200', vsLowHp: 'bg-pink-900/50 text-pink-300',
          vsDebuffed: 'bg-purple-900/50 text-purple-300', defIgnore: 'bg-gray-800/50 text-gray-300',
          aoeDmg: 'bg-cyan-900/50 text-cyan-300', dotDmg: 'bg-lime-900/50 text-lime-300',
          teamDef: 'bg-teal-900/50 text-teal-300', buffBonus: 'bg-violet-900/50 text-violet-300',
          skillCd: 'bg-fuchsia-900/50 text-fuchsia-300', debuffBonus: 'bg-rose-900/50 text-rose-300',
        };

        const getSkillTag = (sk) => {
          const tags = [];
          if (sk.power > 0) tags.push({ label: `${sk.power}% DMG`, color: 'text-red-400' });
          if (sk.buffAtk) tags.push({ label: `ATK+${sk.buffAtk}%`, color: 'text-green-400' });
          if (sk.buffDef) tags.push({ label: `DEF+${sk.buffDef}%`, color: 'text-blue-400' });
          if (sk.healSelf) tags.push({ label: `Heal ${sk.healSelf}%`, color: 'text-emerald-400' });
          if (sk.debuffDef) tags.push({ label: `DEF-${sk.debuffDef}%`, color: 'text-orange-400' });
          if (sk.cdMax > 0) tags.push({ label: `CD:${sk.cdMax}`, color: 'text-gray-400' });
          return tags;
        };

        return (
          <div className="max-w-3xl mx-auto px-4 pt-4 pb-16">
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => setView('hub')} className="text-gray-400 hover:text-white text-sm">&larr; Retour</button>
              <h2 className="text-lg font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Fiche des Personnages
              </h2>
              <span className="text-[10px] text-gray-500">{allChars.length} persos</span>
            </div>

            <div className="text-[10px] text-gray-500 mb-4 p-2 rounded-lg bg-gray-900/40 border border-gray-700/20">
              Les <span className="text-emerald-400">passifs</span> des hunters s'appliquent automatiquement en combat.
              L'<span className="text-yellow-400">awakening</span> (A0-A200) augmente les stats à chaque duplicate (+1% HP/ATK/DEF tous les 5 niveaux après A5).
            </div>

            <div className="space-y-3">
              {allChars.map(ch => (
                <div key={ch.id} className="p-3 rounded-xl bg-gray-900/60 border border-gray-700/30 hover:border-gray-600/50 transition-all">
                  {/* Header */}
                  <div className="flex items-center gap-2.5 mb-2">
                    <img src={getChibiSprite(ch.id)} alt="" className="w-10 h-10 object-contain rounded-lg bg-gray-800/50" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white truncate">{ch.name}</span>
                        <span className={`text-xs ${elemColors[ch.element] || 'text-gray-400'}`}>{elemEmoji[ch.element] || ''}</span>
                        {ch.isHunter && <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-900/50 text-indigo-300 font-bold">HUNTER</span>}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500">
                        <span>Nv.{ch.level}</span>
                        {ch.isHunter && ch.stars > 0 && (
                          <span className="text-yellow-400 font-bold">A{ch.stars}</span>
                        )}
                        {ch.rarity && <span className={`${ch.rarity === 'mythique' ? 'text-amber-400' : ch.rarity === 'legendaire' ? 'text-purple-400' : 'text-blue-400'}`}>{ch.rarity}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-2">
                    <div className="text-[9px] text-gray-500 font-bold uppercase mb-1">Skills</div>
                    <div className="space-y-1">
                      {(ch.skills || []).map((sk, si) => {
                        const tags = getSkillTag(sk);
                        return (
                          <div key={si} className="flex items-center gap-2 text-[10px]">
                            <span className="text-gray-300 font-medium w-28 truncate">{sk.name}</span>
                            <div className="flex flex-wrap gap-1">
                              {tags.map((t, ti) => (
                                <span key={ti} className={`px-1 py-0.5 rounded bg-gray-800/60 ${t.color} text-[9px]`}>{t.label}</span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hunter Passive */}
                  {ch.passive && (
                    <div className="mb-2">
                      <div className="text-[9px] text-gray-500 font-bold uppercase mb-1">Passif</div>
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium ${passiveTypeColors[ch.passive.type] || 'bg-gray-800/50 text-gray-300'}`}>
                        <span className="font-bold uppercase text-[8px] opacity-70">{ch.passive.type}</span>
                        <span>{ch.passiveDesc}</span>
                      </div>
                    </div>
                  )}

                  {/* Awakening info */}
                  {ch.isHunter && ch.stars > 0 && (
                    <div>
                      <div className="text-[9px] text-gray-500 font-bold uppercase mb-1">Awakening</div>
                      <div className="px-2 py-1 rounded text-[10px] border border-yellow-500/40 bg-yellow-900/30 text-yellow-300 inline-block">
                        <span className="font-bold">A{ch.stars}</span>
                        <span className="ml-2 text-gray-400">
                          {ch.stars <= 5
                            ? `Bonus fixes appliqués`
                            : `+${Math.floor(ch.stars / 5) - 1}% HP/ATK/DEF (paliers)`
                          }
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ═══ RESULT VIEW ═══ */}
      {view === 'result' && result && (
        <div className="max-w-xl mx-auto px-4 pt-12 text-center">
          {result.won ? (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
              <img src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771551432/Victory_hcur2y.png" alt="Victory" className="w-48 mx-auto mb-2 drop-shadow-[0_0_16px_rgba(234,179,8,0.5)]" style={{ animation: 'victoryPulse 2s ease-in-out infinite' }} />
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
              {result.fragmentDrop && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.05 }}
                  className="bg-gradient-to-r from-red-600/15 to-pink-600/15 border border-red-500/40 rounded-xl p-2 mb-4">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl">{HAMMERS[result.fragmentDrop]?.icon || '\u2728'}</span>
                    <span className="text-sm font-bold text-red-300">{HAMMERS[result.fragmentDrop]?.name || 'Fragment'}</span>
                    <span className="text-xs text-red-400">+1 ({data.fragments[result.fragmentDrop] || 0}/10)</span>
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
                    <div className="text-yellow-400 text-xs mt-1">Doublon ! Eveil A{result.hunterDrop.newStars}</div>
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
                  <div className="text-2xl mt-1">{result.weaponDrop.sprite ? (
                    <img src={result.weaponDrop.sprite} alt={result.weaponDrop.name} className="w-10 h-10 object-contain mx-auto" draggable={false} />
                  ) : result.weaponDrop.icon}</div>
                  <div className="text-white font-black text-sm mt-1">{result.weaponDrop.name}</div>
                  <div className="text-orange-400 text-[10px] mt-0.5">ATK +{result.weaponDrop.atk} | {MAIN_STAT_VALUES[result.weaponDrop.bonusStat]?.name} +{result.weaponDrop.bonusValue}</div>
                  {result.weaponDrop._redHammers ? (
                    <div className="text-red-400 text-xs mt-1 font-bold">{'\uD83D\uDD34'} Deja A10 ! +{result.weaponDrop._redHammers} Marteau{result.weaponDrop._redHammers > 1 ? 'x' : ''} Rouge{result.weaponDrop._redHammers > 1 ? 's' : ''}</div>
                  ) : result.weaponDrop.isNew ? (
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
              {result.pacteDrop && (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.3, type: 'spring' }}
                  className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-2 border-purple-500/50 rounded-xl p-3 mb-4 text-center">
                  <div className="text-lg font-black text-purple-300">{'\uD83C\uDF11'} Pacte des Ombres !</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">Artefact mythique — {ARTIFACT_SLOTS[result.pacteDrop.slotId]?.name || result.pacteDrop.slotId}</div>
                  <div className="text-[9px] text-purple-400 mt-1">Set ultra-rare obtenu sur Zephyr Ultime !</div>
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
                <div className="text-red-400 text-sm font-bold">Tu peux retenter immediatement !</div>
                <div className="text-gray-400 text-[10px] mt-1">
                  Ameliore tes stats ou change de strategie.
                </div>
              </div>
            </motion.div>
          )}
          <div className="flex flex-col items-center gap-4 mt-2">
            {!result.won && (
              <button
                onClick={() => { setResult(null); setBattle(null); setTimeout(() => startBattle(), 50); }}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-transform"
              >
                {'⚔️'} Retenter
              </button>
            )}
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
                    if (next) { setAutoFarmStats({ runs: 0, wins: 0, levels: 0, coins: 0, loots: 0, hunters: 0, weapons: 0, artifacts: 0 }); setResult(null); setBattle(null); setTimeout(() => startBattle(), 100); }
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
            {/* Auto-farm stats on result screen */}
            {autoReplay && autoFarmStats.runs > 0 && (
              <div className="w-full max-w-xs mx-auto px-3 py-2 rounded-xl bg-gray-900/80 border border-green-500/30 backdrop-blur-sm">
                <div className="text-[10px] text-green-400 font-bold uppercase tracking-wider text-center mb-1">Auto-Farm en cours</div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="text-sm font-black text-white">{autoFarmStats.runs}</div>
                    <div className="text-[8px] text-gray-500">runs</div>
                  </div>
                  <div>
                    <div className="text-sm font-black text-yellow-400">+{autoFarmStats.levels}</div>
                    <div className="text-[8px] text-gray-500">niveaux</div>
                  </div>
                  <div>
                    <div className="text-sm font-black text-amber-300">{autoFarmStats.coins >= 1000 ? `${(autoFarmStats.coins/1000).toFixed(1)}K` : autoFarmStats.coins}</div>
                    <div className="text-[8px] text-gray-500">coins</div>
                  </div>
                  <div>
                    <div className="text-sm font-black text-purple-400">{autoFarmStats.loots}</div>
                    <div className="text-[8px] text-gray-500">loots</div>
                  </div>
                </div>
              </div>
            )}
            {/* Ragnarok persistent tracker on result screen */}
            {STAGES[selStage]?.id === 'ragnarok' && (
              <div className="w-full max-w-xs mx-auto px-3 py-2.5 rounded-xl bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-500/30 backdrop-blur-sm cursor-pointer hover:border-orange-400/50 transition-colors"
                onClick={() => setRagnarokHistoryOpen(true)}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">{'\u2604\uFE0F'} Ragnarok Tracker</span>
                  <span className="text-[9px] text-gray-500">Clic pour l'historique</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-sm font-black text-red-400">{data.ragnarokKills || 0}</div>
                    <div className="text-[8px] text-gray-500">kills total</div>
                  </div>
                  <div>
                    <div className="text-sm font-black text-amber-300">{(data.ragnarokDropLog || []).length}</div>
                    <div className="text-[8px] text-gray-500">armes drop</div>
                  </div>
                  <div>
                    {data.weaponCollection?.['w_sulfuras'] !== undefined ? (
                      <>
                        <div className="text-sm font-black text-orange-400">{'\uD83D\uDD28'}</div>
                        <div className="text-[8px] text-orange-300 font-bold">Sulfuras !</div>
                      </>
                    ) : (
                      <>
                        <div className="text-sm font-black text-gray-600">0</div>
                        <div className="text-[8px] text-gray-500">sulfuras</div>
                      </>
                    )}
                  </div>
                </div>
                {!data.weaponCollection?.['w_sulfuras'] && (data.ragnarokKills || 0) > 0 && (
                  <div className="mt-1.5">
                    <div className="flex justify-between text-[8px] text-gray-500 mb-0.5">
                      <span>Proba cumulee</span>
                      <span>{Math.min(99.99, (1 - Math.pow(1 - 1/10000, data.ragnarokKills)) * 100).toFixed(2)}%</span>
                    </div>
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-600 to-red-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (1 - Math.pow(1 - 1/10000, data.ragnarokKills)) * 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Monarque Supreme persistent tracker on result screen */}
            {STAGES[selStage]?.id === 'supreme_monarch' && (
              <div className="w-full max-w-xs mx-auto px-3 py-2.5 rounded-xl bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 backdrop-blur-sm cursor-pointer hover:border-purple-400/50 transition-colors"
                onClick={() => setMonarchHistoryOpen(true)}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">{'\uD83D\uDC51'} Monarque Supreme</span>
                  <span className="text-[9px] text-gray-500">Clic pour l'historique</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-sm font-black text-purple-400">{data.monarchKills || 0}</div>
                    <div className="text-[8px] text-gray-500">kills total</div>
                  </div>
                  <div>
                    <div className="text-sm font-black text-amber-300">{(data.monarchDropLog || []).length}</div>
                    <div className="text-[8px] text-gray-500">armes drop</div>
                  </div>
                  <div>
                    <div className="text-sm font-black text-purple-300">{(data.monarchDropLog || []).filter(d => d.weaponId === 'w_katana_z' || d.weaponId === 'w_katana_v').length}</div>
                    <div className="text-[8px] text-gray-500">katanas</div>
                  </div>
                </div>
                {(data.monarchKills || 0) > 0 && (
                  <div className="mt-1.5">
                    <div className="flex justify-between text-[8px] text-gray-500 mb-0.5">
                      <span>Proba cumulee (chaque katana)</span>
                      <span>{Math.min(99.99, (1 - Math.pow(1 - 1/50000, data.monarchKills)) * 100).toFixed(2)}%</span>
                    </div>
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (1 - Math.pow(1 - 1/50000, data.monarchKills)) * 100)}%` }} />
                    </div>
                  </div>
                )}
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
      {weaponReveal && (() => {
        const isSecret = ['w_sulfuras', 'w_raeshalare', 'w_katana_z', 'w_katana_v'].includes(weaponReveal.id);
        return isSecret ? (
          <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={() => setWeaponReveal(null)}>
            <motion.div className="absolute inset-0" initial={{ background: 'rgba(0,0,0,0)' }} animate={{ background: ['rgba(220,38,38,0.7)', 'rgba(0,0,0,0.95)', 'rgba(0,0,0,0.95)'] }} transition={{ duration: 2, times: [0, 0.2, 1] }} />
            <motion.div className="absolute w-96 h-96 rounded-full" initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 2, 1.5], opacity: [0, 1, 0.5] }} transition={{ duration: 2.5, delay: 0.2 }} style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.6) 0%, rgba(251,146,60,0.3) 40%, transparent 70%)' }} />
            <motion.div className="absolute w-[500px] h-[500px]" initial={{ rotate: 0, opacity: 0 }} animate={{ rotate: 360, opacity: [0, 0.8, 0.4] }} transition={{ rotate: { duration: 15, repeat: Infinity, ease: 'linear' }, opacity: { duration: 2.5, delay: 0.3 } }} style={{ background: 'conic-gradient(from 0deg, transparent, rgba(239,68,68,0.5), transparent, rgba(251,146,60,0.4), transparent, rgba(220,38,38,0.5), transparent)' }} />
            {[...Array(50)].map((_, i) => <motion.div key={i} className="absolute text-2xl pointer-events-none" initial={{ x: 0, y: 0, opacity: 0, scale: 0 }} animate={{ x: (Math.random() - 0.5) * 600, y: (Math.random() - 0.5) * 600, opacity: [0, 1, 0], scale: [0, 2, 0], rotate: Math.random() * 360 }} transition={{ duration: 3 + Math.random() * 2, delay: 0.3 + Math.random() * 2, repeat: Infinity, repeatDelay: Math.random() * 4 }}>{['🔥', '✨', '⭐', '💫', '⚡', '💥', '🌟'][i % 7]}</motion.div>)}
            <motion.div className="relative z-10 text-center" initial={{ scale: 0, opacity: 0, y: 100 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 15 }}>
              <motion.div animate={{ x: [0, -8, 8, -5, 5, 0], y: [0, 5, -5, 3, -3, 0] }} transition={{ duration: 0.6, delay: 0.5, repeat: 5 }}>
                <div className="text-red-400 font-black text-sm tracking-[0.4em] uppercase mb-3" style={{ textShadow: '0 0 30px rgba(239,68,68,1), 0 0 60px rgba(239,68,68,0.5)' }}>SECRET WEAPON</div>
                <motion.div className="mb-5" initial={{ rotateY: 0, scale: 1 }} animate={{ rotateY: [0, 180, 360], scale: [1, 1.3, 1] }} transition={{ duration: 3, delay: 0.8, repeat: Infinity, repeatDelay: 2 }}>
                  {weaponReveal.sprite ? <img src={weaponReveal.sprite} alt={weaponReveal.name} className="w-32 h-32 object-contain mx-auto drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]" draggable={false} /> : <span className="text-8xl drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]">{weaponReveal.icon}</span>}
                </motion.div>
                <motion.h2 className="text-4xl font-black mb-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }} style={{ background: 'linear-gradient(135deg, #ef4444, #f59e0b, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 20px rgba(239,68,68,0.8))' }}>{weaponReveal.name}</motion.h2>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} className="space-y-2">
                  <div className="text-orange-300 text-base font-bold">ATK +{weaponReveal.atk} | {MAIN_STAT_VALUES[weaponReveal.bonusStat]?.name} +{weaponReveal.bonusValue}</div>
                  {weaponReveal.id === 'w_sulfuras' && <div className="text-red-400 text-sm">Passive : Sulfuras Fury — +{SULFURAS_STACK_PER_TURN}% DMG/tour (max +{SULFURAS_STACK_MAX}%)</div>}
                  {weaponReveal.id === 'w_raeshalare' && <div className="text-purple-400 text-sm">Passive : Murmure de la Mort — 10% de chance/tour : +100% ATK pendant 5T (max x3)</div>}
                  {weaponReveal.id === 'w_katana_z' && <div className="text-cyan-400 text-sm">Passive : Tranchant Eternel — +5% ATK/coup (50% persist) + Contre-attaque 200% (50%)</div>}
                  {weaponReveal.id === 'w_katana_v' && <div className="text-emerald-400 text-sm">Passive : Lame Veneneuse — DoT 3%/stack + Buff aleatoire (30%) : +10% stats cumulable (Solo) / +5% stats cumulable (Raid) / Bouclier / DMG x6</div>}
                  {weaponReveal.isNew ? <div className="text-green-400 text-sm font-bold">Nouvelle arme !</div> : weaponReveal.newAwakening !== undefined && <div className="text-yellow-400 text-sm font-bold">Eveil A{weaponReveal.newAwakening - 1} → A{weaponReveal.newAwakening}</div>}
                  <div className="mt-5 text-gray-400 text-xs italic animate-pulse">Clique pour fermer</div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        ) : (
          <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={() => setWeaponReveal(null)}>
            <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} style={{ background: 'rgba(0,0,0,0.85)' }} />
            <motion.div className="relative z-10 text-center bg-gradient-to-b from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-xl p-6" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <div className="text-purple-400 font-bold text-xs tracking-wider uppercase mb-2">Drop</div>
              <div className="mb-3">{weaponReveal.sprite ? <img src={weaponReveal.sprite} alt={weaponReveal.name} className="w-20 h-20 object-contain mx-auto" draggable={false} /> : <span className="text-5xl">{weaponReveal.icon}</span>}</div>
              <h2 className="text-xl font-black text-orange-300 mb-2">{weaponReveal.name}</h2>
              <div className="text-orange-200 text-xs">ATK +{weaponReveal.atk} | {MAIN_STAT_VALUES[weaponReveal.bonusStat]?.name} +{weaponReveal.bonusValue}</div>
              {weaponReveal.isNew ? <div className="text-green-400 text-xs font-bold mt-2">Nouvelle arme !</div> : weaponReveal.newAwakening !== undefined && <div className="text-yellow-400 text-xs font-bold mt-2">Eveil A{weaponReveal.newAwakening - 1} → A{weaponReveal.newAwakening}</div>}
              <div className="mt-3 text-gray-400 text-[10px] italic">Clique pour fermer</div>
            </motion.div>
          </div>
        );
      })()}

      {/* ═══ RAGNAROK HISTORY MODAL ═══ */}
      {ragnarokHistoryOpen && (() => {
        const kills = data.ragnarokKills || 0;
        const log = data.ragnarokDropLog || [];
        const sulfurasCount = log.filter(d => d.weaponId === 'w_sulfuras').length;
        const hasSulfuras = data.weaponCollection?.['w_sulfuras'] !== undefined;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setRagnarokHistoryOpen(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-900/95 border border-orange-500/40 rounded-2xl p-5 max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img src={SPRITES.ragnarok} alt="Ragnarok" className="w-12 h-12 object-contain" />
                  <div>
                    <h3 className="text-lg font-black text-orange-300">{'\u2604\uFE0F'} Ragnarok</h3>
                    <div className="text-[10px] text-gray-400">Tier 6 — Domaine du Monarque</div>
                  </div>
                </div>
                <button onClick={() => setRagnarokHistoryOpen(false)} className="text-gray-500 hover:text-white text-xl">&times;</button>
              </div>

              {/* Kill counter */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-3 text-center">
                  <div className="text-2xl font-black text-red-400">{kills}</div>
                  <div className="text-[10px] text-red-300/60 mt-0.5">Kills total</div>
                </div>
                <div className="bg-amber-900/20 border border-amber-500/20 rounded-xl p-3 text-center">
                  <div className="text-2xl font-black text-amber-400">{log.length}</div>
                  <div className="text-[10px] text-amber-300/60 mt-0.5">Armes drop</div>
                </div>
                <div className={`border rounded-xl p-3 text-center ${hasSulfuras ? 'bg-orange-900/30 border-orange-400/40' : 'bg-gray-800/30 border-gray-700/20'}`}>
                  <div className={`text-2xl font-black ${hasSulfuras ? 'text-orange-400' : 'text-gray-600'}`}>{sulfurasCount}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{'\uD83D\uDD28'} Sulfuras</div>
                </div>
              </div>

              {/* Sulfuras pity counter */}
              <div className={`mb-4 p-3 rounded-xl border ${hasSulfuras ? 'bg-gradient-to-r from-orange-900/20 to-red-900/20 border-orange-500/30' : 'bg-gray-800/20 border-gray-700/20'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {hasSulfuras ? (
                    <img src={WEAPONS.w_sulfuras?.sprite} alt="Sulfuras" className="w-8 h-8 object-contain" />
                  ) : (
                    <span className="text-2xl opacity-30">{'\uD83D\uDD28'}</span>
                  )}
                  <div>
                    <div className={`text-sm font-bold ${hasSulfuras ? 'text-orange-300' : 'text-gray-500'}`}>
                      Masse de Sulfuras
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {hasSulfuras
                        ? `x${sulfurasCount} drops — A${data.weaponCollection['w_sulfuras']} (1er drop au kill #${log.find(d => d.weaponId === 'w_sulfuras')?.killNumber || '?'})`
                        : kills > 0
                          ? `${kills} kills sans Sulfuras... (drop : 1/10 000)`
                          : 'Pas encore de kills'
                      }
                    </div>
                  </div>
                </div>
                {!hasSulfuras && kills > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-[9px] text-gray-500 mb-0.5">
                      <span>Probabilite cumulee</span>
                      <span>{Math.min(99.99, (1 - Math.pow(1 - 1/10000, kills)) * 100).toFixed(2)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-600 to-red-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (1 - Math.pow(1 - 1/10000, kills)) * 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Drop history */}
              <div className="mb-2">
                <div className="text-xs font-bold text-gray-300 mb-2">{'\uD83D\uDCDC'} Historique des drops</div>
                {log.length === 0 ? (
                  <div className="text-center py-6 text-gray-600 text-sm italic">Aucune arme droppee pour l'instant</div>
                ) : (
                  <div className="space-y-1.5">
                    {[...log].reverse().map((entry, i) => {
                      const isSulfuras = entry.weaponId === 'w_sulfuras';
                      const wData = WEAPONS[entry.weaponId];
                      const dateStr = entry.date ? new Date(entry.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '?';
                      return (
                        <div key={i} className={`flex items-center gap-2.5 p-2 rounded-lg border transition-colors cursor-pointer hover:bg-gray-800/40 ${
                          isSulfuras ? 'border-orange-500/40 bg-orange-900/10' :
                          entry.rarity === 'mythique' ? 'border-purple-500/20 bg-purple-900/5' :
                          entry.rarity === 'legendaire' ? 'border-yellow-500/20 bg-yellow-900/5' :
                          'border-gray-700/20 bg-gray-800/10'
                        }`} onClick={() => { setRagnarokHistoryOpen(false); isSulfuras ? setWeaponReveal({ ...wData, isNew: false }) : setWeaponDetailId(entry.weaponId); }}>
                          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                            {entry.sprite || wData?.sprite ? (
                              <img src={entry.sprite || wData?.sprite} alt={entry.name} className="w-8 h-8 object-contain" />
                            ) : (
                              <span className="text-lg">{entry.icon || wData?.icon || '?'}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs font-bold truncate ${isSulfuras ? 'text-orange-300' : 'text-white'}`}>{entry.name || wData?.name}</div>
                            <div className="text-[9px] text-gray-500">Kill #{entry.killNumber} — {dateStr}</div>
                          </div>
                          <div className={`text-[9px] px-1.5 py-0.5 rounded ${
                            isSulfuras ? 'bg-orange-500/20 text-orange-300' :
                            entry.rarity === 'mythique' ? 'bg-purple-500/20 text-purple-300' :
                            entry.rarity === 'legendaire' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-gray-700/30 text-gray-400'
                          }`}>{entry.rarity}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        );
      })()}

      {/* ═══ MONARCH SUPREME HISTORY MODAL ═══ */}
      {monarchHistoryOpen && (() => {
        const kills = data.monarchKills || 0;
        const log = data.monarchDropLog || [];
        const katanaZCount = log.filter(d => d.weaponId === 'w_katana_z').length;
        const katanaVCount = log.filter(d => d.weaponId === 'w_katana_v').length;
        const hasZ = data.weaponCollection?.['w_katana_z'] !== undefined;
        const hasV = data.weaponCollection?.['w_katana_v'] !== undefined;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setMonarchHistoryOpen(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-900/95 border border-purple-500/40 rounded-2xl p-5 max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black text-purple-300">{'\uD83D\uDC51'} Monarque Supreme</h3>
                  <div className="text-[10px] text-gray-400">Tier 6 — Domaine du Monarque</div>
                </div>
                <button onClick={() => setMonarchHistoryOpen(false)} className="text-gray-500 hover:text-white text-xl">&times;</button>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-purple-900/20 border border-purple-500/20 rounded-xl p-3 text-center">
                  <div className="text-2xl font-black text-purple-400">{kills}</div>
                  <div className="text-[10px] text-purple-300/60 mt-0.5">Kills total</div>
                </div>
                <div className="bg-amber-900/20 border border-amber-500/20 rounded-xl p-3 text-center">
                  <div className="text-2xl font-black text-amber-400">{log.length}</div>
                  <div className="text-[10px] text-amber-300/60 mt-0.5">Armes drop</div>
                </div>
                <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-xl p-3 text-center">
                  <div className="text-2xl font-black text-indigo-400">{katanaZCount + katanaVCount}</div>
                  <div className="text-[10px] text-indigo-300/60 mt-0.5">Katanas</div>
                </div>
              </div>

              {/* Katana Z tracker */}
              <div className={`mb-3 p-3 rounded-xl border ${hasZ ? 'bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-cyan-500/30' : 'bg-gray-800/20 border-gray-700/20'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {hasZ ? (
                    <img src={WEAPONS.w_katana_z?.sprite} alt="Katana Z" className="w-8 h-8 object-contain" />
                  ) : (
                    <span className="text-2xl opacity-30">{'\u2694\uFE0F'}</span>
                  )}
                  <div>
                    <div className={`text-sm font-bold ${hasZ ? 'text-cyan-300' : 'text-gray-500'}`}>Katana Z</div>
                    <div className="text-[10px] text-gray-400">
                      {hasZ ? `x${katanaZCount} drops — A${data.weaponCollection['w_katana_z']}` : kills > 0 ? `${kills} kills sans Katana Z (1/50 000)` : 'Pas encore de kills'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Katana V tracker */}
              <div className={`mb-3 p-3 rounded-xl border ${hasV ? 'bg-gradient-to-r from-emerald-900/20 to-green-900/20 border-emerald-500/30' : 'bg-gray-800/20 border-gray-700/20'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {hasV ? (
                    <img src={WEAPONS.w_katana_v?.sprite} alt="Katana V" className="w-8 h-8 object-contain" />
                  ) : (
                    <span className="text-2xl opacity-30">{'\u2694\uFE0F'}</span>
                  )}
                  <div>
                    <div className={`text-sm font-bold ${hasV ? 'text-emerald-300' : 'text-gray-500'}`}>Katana V</div>
                    <div className="text-[10px] text-gray-400">
                      {hasV ? `x${katanaVCount} drops — A${data.weaponCollection['w_katana_v']}` : kills > 0 ? `${kills} kills sans Katana V (1/50 000)` : 'Pas encore de kills'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cumulative chance */}
              {kills > 0 && (
                <div className="mb-4 p-3 rounded-xl border border-purple-500/20 bg-purple-900/10">
                  <div className="flex justify-between text-[9px] text-gray-500 mb-0.5">
                    <span>Probabilite cumulee (chaque katana)</span>
                    <span>{Math.min(99.99, (1 - Math.pow(1 - 1/50000, kills)) * 100).toFixed(2)}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (1 - Math.pow(1 - 1/50000, kills)) * 100)}%` }} />
                  </div>
                </div>
              )}

              {/* Drop history */}
              <div className="mb-2">
                <div className="text-xs font-bold text-gray-300 mb-2">{'\uD83D\uDCDC'} Historique des drops</div>
                {log.length === 0 ? (
                  <div className="text-center py-6 text-gray-600 text-sm italic">Aucune arme droppee pour l'instant</div>
                ) : (
                  <div className="space-y-1.5">
                    {[...log].reverse().map((entry, i) => {
                      const isKatana = entry.weaponId === 'w_katana_z' || entry.weaponId === 'w_katana_v';
                      const wData = WEAPONS[entry.weaponId];
                      const dateStr = entry.date ? new Date(entry.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '?';
                      return (
                        <div key={i} className={`flex items-center gap-2.5 p-2 rounded-lg border transition-colors cursor-pointer hover:bg-gray-800/40 ${
                          isKatana ? 'border-purple-500/40 bg-purple-900/10' :
                          entry.rarity === 'mythique' ? 'border-purple-500/20 bg-purple-900/5' :
                          entry.rarity === 'legendaire' ? 'border-yellow-500/20 bg-yellow-900/5' :
                          'border-gray-700/20 bg-gray-800/10'
                        }`} onClick={() => { setMonarchHistoryOpen(false); isKatana ? setWeaponReveal({ ...wData, isNew: false }) : setWeaponDetailId(entry.weaponId); }}>
                          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                            {entry.sprite || wData?.sprite ? (
                              <img src={entry.sprite || wData?.sprite} alt={entry.name} className="w-8 h-8 object-contain" />
                            ) : (
                              <span className="text-lg">{entry.icon || wData?.icon || '?'}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs font-bold truncate ${isKatana ? 'text-purple-300' : 'text-white'}`}>{entry.name || wData?.name}</div>
                            <div className="text-[9px] text-gray-500">Kill #{entry.killNumber} — {dateStr}</div>
                          </div>
                          <div className={`text-[9px] px-1.5 py-0.5 rounded ${
                            isKatana ? 'bg-purple-500/20 text-purple-300' :
                            entry.rarity === 'mythique' ? 'bg-purple-500/20 text-purple-300' :
                            entry.rarity === 'legendaire' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-gray-700/30 text-gray-400'
                          }`}>{entry.rarity}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        );
      })()}

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
            className="bg-[#12122a] border border-indigo-500/40 rounded-2xl p-5 w-full max-w-md shadow-2xl">
            <div className="text-center mb-3">
              <div className="text-3xl mb-1">{'\uD83C\uDFC5'}</div>
              <h3 className="text-lg font-black text-indigo-300">Niveau Compte</h3>
              <p className="text-[11px] text-gray-400">+{ACCOUNT_BONUS_AMOUNT} pts par allocation</p>
              <div className="inline-block mt-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30">
                <span className="text-xs font-black text-amber-400">{accountLevelUpPending} allocation{accountLevelUpPending > 1 ? 's' : ''} restante{accountLevelUpPending > 1 ? 's' : ''}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              {STAT_ORDER.map(statKey => {
                const meta = STAT_META[statKey];
                const currentVal = (data.accountBonuses || {})[statKey] || 0;
                const allocN = (n) => {
                  const actual = Math.min(n, pendingRef.current);
                  if (actual <= 0) return;
                  pendingRef.current -= actual;
                  setAccountLevelUpPending(pendingRef.current);
                  setData(prev => ({
                    ...prev,
                    accountBonuses: { ...prev.accountBonuses, [statKey]: (prev.accountBonuses[statKey] || 0) + ACCOUNT_BONUS_AMOUNT * actual },
                    accountAllocations: (prev.accountAllocations || 0) + actual,
                  }));
                };
                return (
                  <div key={statKey} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-indigo-500/30 transition-all">
                    <span className="text-base w-6 text-center">{meta.icon}</span>
                    <span className="text-xs font-bold text-white w-12">{meta.name}</span>
                    <span className="text-xs font-black text-green-400 w-14 text-right">{currentVal > 0 ? `+${currentVal}` : '—'}</span>
                    <div className="flex gap-1 flex-1 justify-end">
                      {[1, 10, 100, 1000].map(n => (
                        <button key={n} onClick={() => allocN(n)}
                          className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/40 hover:text-white hover:border-indigo-400/60 transition-all active:scale-95">
                          +{n}
                        </button>
                      ))}
                    </div>
                  </div>
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

      {/* ═══ DROP LOG BELL (below ?) ═══ */}
      <button
        onClick={() => { setShowDropLog(true); setHasNewDrops(false); fetchDropLog(); }}
        className="fixed top-16 right-4 z-40 w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 border-2 border-amber-400/50 shadow-lg shadow-amber-500/30 flex items-center justify-center text-lg hover:scale-110 active:scale-95 transition-transform"
        title="Drops legendaires"
      >
        {'\uD83D\uDD14'}
        {hasNewDrops && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border border-red-300 animate-pulse" />}
      </button>

      {/* ═══ MAIL BUTTON (below bell) ═══ */}
      <button
        onClick={() => navigate('/mail')}
        className="fixed top-28 right-4 z-40 w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 border-2 border-purple-400/50 shadow-lg shadow-purple-500/30 flex items-center justify-center text-lg hover:scale-110 active:scale-95 transition-transform"
        title="Courrier"
      >
        📧
        {unreadMailCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 border border-red-300 text-[10px] font-bold text-white flex items-center justify-center px-1">
            {unreadMailCount > 99 ? '99+' : unreadMailCount}
          </span>
        )}
      </button>

      {/* ═══ FACTION BUTTON (below mail) ═══ */}
      <button
        onClick={() => navigate('/faction')}
        className="fixed top-40 right-4 z-40 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/30 flex items-center justify-center text-lg hover:scale-110 active:scale-95 transition-transform"
        title="Factions"
      >
        🛡️
      </button>

      {/* ═══ DROP TOAST NOTIFICATION ═══ */}
      <AnimatePresence>
        {dropToast && (
          <motion.div
            initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed top-28 right-4 z-50 cursor-pointer"
            onClick={() => { setDropToast(null); setShowDropLog(true); setHasNewDrops(false); fetchDropLog(); }}
          >
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600/90 border border-red-400/60 shadow-lg shadow-red-500/40 backdrop-blur-sm">
              <span className="text-lg animate-bounce">{'\uD83D\uDD14'}</span>
              <div>
                <div className="text-[11px] text-red-100 font-bold">{dropToast.username} a obtenu :</div>
                <div className="text-[13px] text-white font-black">{dropToast.itemName}</div>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-1 ${
                dropToast.itemRarity === 'secret' ? 'bg-red-900/60 text-red-200' : 'bg-amber-900/60 text-amber-200'
              }`}>{dropToast.itemRarity}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ DROP LOG MODAL ═══ */}
      <AnimatePresence>
        {showDropLog && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowDropLog(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }}
              className="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl border border-amber-500/40 bg-[#0f0f2a] p-5 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">{'\uD83D\uDD14'} Drops Legendaires</h2>
                <button onClick={() => setShowDropLog(false)} className="text-gray-500 hover:text-white text-xl transition-colors">&times;</button>
              </div>
              {dropLog.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6">Aucun drop legendaire enregistre pour le moment.</p>
              ) : (
                <div className="space-y-2">
                  {dropLog.map((drop) => {
                    const isWeapon = drop.itemType === 'weapon';
                    const icon = isWeapon ? (drop.itemId === 'w_sulfuras' ? '\uD83D\uDD28' : (drop.itemId === 'w_katana_z' || drop.itemId === 'w_katana_v') ? '\u2694\uFE0F' : '\uD83C\uDFF9') : '\uD83D\uDC64';
                    const awakeLabel = isWeapon && drop.awakening > 0 ? ` A${drop.awakening}` : '';
                    const date = new Date(drop.createdAt);
                    const timeStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div key={drop.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10">
                        <span className="text-2xl">{icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-amber-300 truncate">{drop.username}</div>
                          <div className="text-xs text-gray-300 truncate">{drop.itemName}{awakeLabel}</div>
                          <div className="text-[10px] text-gray-500">{timeStr}</div>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          drop.itemRarity === 'secret' ? 'bg-red-500/20 text-red-300' :
                          drop.itemRarity === 'legendaire' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-purple-500/20 text-purple-300'
                        }`}>{drop.itemRarity || 'rare'}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
