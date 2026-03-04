import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, Swords, BookOpen, ArrowLeft, Users, Shield, Zap, MapPin, ScrollText } from 'lucide-react';
import { WEAPONS, WEAPON_AWAKENING_PASSIVES, MAX_WEAPON_AWAKENING, getWeaponAwakeningBonuses, computeWeaponBonuses,
  ARTIFACT_SETS, RAID_ARTIFACT_SETS, ARC2_ARTIFACT_SETS, ULTIME_ARTIFACT_SETS, ALL_ARTIFACT_SETS,
  ARTIFACT_SLOTS, SLOT_ORDER, MAIN_STAT_VALUES, SUB_STAT_POOL, RARITY_SUB_COUNT,
} from '../ShadowColosseum/equipmentData';
import { CHIBIS, SPRITES, ELEMENTS, RARITY, STAT_META, getSkillManaCost } from '../ShadowColosseum/colosseumCore';
import { EXPEDITION_SETS, EXPEDITION_WEAPONS, EXPEDITION_UNIQUES, EXPEDITION_ESSENCES, ESSENCE_EXCHANGE, EXPEDITION_BOSSES } from '../ShadowColosseum/expeditionCodexData';
import { HUNTERS, HUNTER_PASSIVE_EFFECTS, getHunterStars, getAwakeningPassives } from '../ShadowColosseum/raidData';
import { CHANGELOG, CHANGELOG_CATEGORIES } from '../ShadowColosseum/changelogData';
import { ULTIMATE_SKILLS } from '../ShadowColosseum/talentSkillData';
import { ALL_MECHANICS_TABS } from '../ShadowColosseum/codexMechanicsData';

// ═══════════════════════════════════════════════════════════════
// CODEX — Encyclopedie du Shadow Colosseum
// 3 onglets : Combattants / Armes / Artefacts
// ═══════════════════════════════════════════════════════════════

const SAVE_KEY = 'shadow_colosseum_data';
const RAID_KEY = 'shadow_colosseum_raid';

const ATTACK_TYPE_META = {
  frontal:    { label: 'Frontal',      color: 'text-red-400',     border: 'border-red-500/50',     bg: 'bg-red-500/10' },
  aoe_melee:  { label: 'AoE Melee',    color: 'text-orange-400',  border: 'border-orange-500/50',  bg: 'bg-orange-500/10' },
  aoe_ranged: { label: 'AoE Distance', color: 'text-blue-400',    border: 'border-blue-500/50',    bg: 'bg-blue-500/10' },
  aoe_all:    { label: 'AoE Global',   color: 'text-purple-400',  border: 'border-purple-500/50',  bg: 'bg-purple-500/10' },
  summon:     { label: 'Invocation',    color: 'text-green-400',   border: 'border-green-500/50',   bg: 'bg-green-500/10' },
  self_heal:  { label: 'Auto-Soin',    color: 'text-emerald-400', border: 'border-emerald-500/50', bg: 'bg-emerald-500/10' },
  anti_heal:  { label: 'Anti-Heal',    color: 'text-rose-400',    border: 'border-rose-500/50',    bg: 'bg-rose-500/10' },
  execute:    { label: 'Execute',       color: 'text-red-500',     border: 'border-red-600/50',     bg: 'bg-red-600/10' },
  multi_hit:  { label: 'Multi-Hit',    color: 'text-amber-400',   border: 'border-amber-500/50',   bg: 'bg-amber-500/10' },
  atk_crush:  { label: 'ATK Crush',   color: 'text-pink-400',    border: 'border-pink-500/50',    bg: 'bg-pink-500/10' },
};

const ZONE_STYLES = {
  Foret:   { color: 'text-green-400',  bg: 'bg-green-900/40',  border: 'border-green-500/30',  gradient: 'from-green-900/50 to-green-800/20' },
  Abysses: { color: 'text-cyan-400',   bg: 'bg-cyan-900/40',   border: 'border-cyan-500/30',   gradient: 'from-cyan-900/50 to-blue-800/20' },
  Neant:   { color: 'text-purple-400', bg: 'bg-purple-900/40', border: 'border-purple-500/30', gradient: 'from-purple-900/50 to-indigo-800/20' },
};

const WEAPON_SPRITES = {
  w_sulfuras: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771443640/WeaponSulfuras_efg3ca.png',
  w_guldan: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771638363/batonGuldan_vuu7ez.png',
};

const ELEMENT_CONFIG = {
  fire:   { label: 'Feu',      color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/30', icon: '\uD83D\uDD25' },
  water:  { label: 'Eau',      color: 'text-cyan-400',   bg: 'bg-cyan-500/15',   border: 'border-cyan-500/30',   icon: '\uD83D\uDCA7' },
  wind:   { label: 'Vent',     color: 'text-green-400',  bg: 'bg-green-500/15',  border: 'border-green-500/30',  icon: '\uD83D\uDCA8' },
  earth:  { label: 'Terre',    color: 'text-amber-400',  bg: 'bg-amber-500/15',  border: 'border-amber-500/30',  icon: '\uD83E\uDEA8' },
  shadow: { label: 'Ombre',    color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30', icon: '\uD83C\uDF11' },
  light:  { label: 'Lumiere',  color: 'text-yellow-300', bg: 'bg-yellow-500/15', border: 'border-yellow-500/30', icon: '\u2728' },
  null:   { label: 'Neutre',   color: 'text-gray-400',   bg: 'bg-gray-500/15',   border: 'border-gray-500/30',   icon: '\u26AA' },
};

const WEAPON_TYPE_CONFIG = {
  blade:   { label: 'Lame',     icon: '\u2694\uFE0F' },
  heavy:   { label: 'Lourde',   icon: '\uD83D\uDD28' },
  polearm: { label: 'Lance',    icon: '\uD83D\uDDE1\uFE0F' },
  ranged:  { label: 'Distance', icon: '\uD83C\uDFF9' },
  staff:   { label: 'Baton',    icon: '\uD83E\uDE84' },
  shield:  { label: 'Bouclier', icon: '\uD83D\uDEE1\uFE0F' },
  scythe:  { label: 'Faux',     icon: '\u2694\uFE0F' },
};

const RARITY_CONFIG = {
  rare:       { label: 'Rare',       color: 'text-blue-400',   bg: 'bg-blue-500/15',   border: 'border-blue-500/40',   glow: 'shadow-blue-500/20' },
  legendaire: { label: 'Legendaire', color: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'border-yellow-500/40', glow: 'shadow-yellow-500/20' },
  mythique:   { label: 'Mythique',   color: 'text-red-400',    bg: 'bg-red-500/15',    border: 'border-red-500/40',    glow: 'shadow-red-500/20' },
};

const STAT_LABELS = {
  atk_flat: 'ATK', atk_pct: 'ATK%', int_flat: 'INT', int_pct: 'INT%',
  def_flat: 'DEF', def_pct: 'DEF%', hp_pct: 'PV%',
  spd_flat: 'SPD', crit_rate: 'CRIT%', crit_dmg: 'CRIT DMG%', res_flat: 'RES',
  fireDamage: 'DMG Feu%', waterDamage: 'DMG Eau%', shadowDamage: 'DMG Ombre%',
  windDamage: 'DMG Vent%', lightDamage: 'DMG Lumiere%',
  allDamage: 'Tous DMG%', defPen: 'PEN DEF%',
};

const CLASS_CONFIG = {
  fighter:  { label: 'Fighter',  color: 'text-red-400',    icon: '\u2694\uFE0F' },
  assassin: { label: 'Assassin', color: 'text-purple-400', icon: '\uD83D\uDDE1\uFE0F' },
  mage:     { label: 'Mage',     color: 'text-blue-400',   icon: '\uD83D\uDD2E' },
  support:  { label: 'Support',  color: 'text-green-400',  icon: '\u2728' },
  tank:     { label: 'Tank',     color: 'text-amber-400',  icon: '\uD83D\uDEE1\uFE0F' },
};

const RARITY_ORDER = { mythique: 3, legendaire: 2, rare: 1 };
const ELEMENT_ORDER = { fire: 0, water: 1, wind: 2, earth: 3, shadow: 4, light: 5, null: 6 };

const PASSIVE_TYPE_COLORS = {
  permanent: 'bg-emerald-900/50 text-emerald-300', firstTurn: 'bg-yellow-900/50 text-yellow-300',
  lowHp: 'bg-red-900/50 text-red-300', highHp: 'bg-blue-900/50 text-blue-300',
  stacking: 'bg-orange-900/50 text-orange-300', healBonus: 'bg-green-900/50 text-green-300',
  critDmg: 'bg-amber-900/50 text-amber-300', magicDmg: 'bg-indigo-900/50 text-indigo-300',
  vsBoss: 'bg-red-900/50 text-red-200', vsLowHp: 'bg-pink-900/50 text-pink-300',
  vsDebuffed: 'bg-purple-900/50 text-purple-300', defIgnore: 'bg-gray-800/50 text-gray-300',
  aoeDmg: 'bg-cyan-900/50 text-cyan-300', dotDmg: 'bg-lime-900/50 text-lime-300',
  teamDef: 'bg-teal-900/50 text-teal-300', buffBonus: 'bg-violet-900/50 text-violet-300',
  skillCd: 'bg-fuchsia-900/50 text-fuchsia-300', debuffBonus: 'bg-rose-900/50 text-rose-300',
  teamAura: 'bg-indigo-900/50 text-indigo-300',
};

const PASSIVE_TYPE_LABELS = {
  permanent: 'Permanent', firstTurn: '1er Tour', lowHp: 'PV Bas', highHp: 'PV Haut',
  stacking: 'Cumulable', healBonus: 'Soin+', critDmg: 'Crit DMG', magicDmg: 'Magie',
  vsBoss: 'vs Boss', vsLowHp: 'vs PV Bas', vsDebuffed: 'vs Debuff', defIgnore: 'Ignore DEF',
  aoeDmg: 'AOE', dotDmg: 'DOT', teamDef: 'Equipe DEF', buffBonus: 'Buff+',
  skillCd: 'Reduc CD', debuffBonus: 'Debuff+', teamAura: 'Aura Equipe',
};

const SKILL_SCOPE_CONFIG = {
  offensive:  { label: 'Offensif',     icon: '\u2694\uFE0F', border: 'border-red-500/40',    bg: 'bg-red-500/10',    text: 'text-red-400' },
  buffSelf:   { label: 'Buff Self',    icon: '\uD83D\uDEE1\uFE0F', border: 'border-blue-500/40',   bg: 'bg-blue-500/10',   text: 'text-blue-400' },
  buffTeam:   { label: 'Buff Equipe',  icon: '\uD83D\uDC65', border: 'border-violet-500/40', bg: 'bg-violet-500/10', text: 'text-violet-400' },
  healSelf:   { label: 'Soin Self',    icon: '\uD83D\uDC9A', border: 'border-green-500/40',  bg: 'bg-green-500/10',  text: 'text-green-400' },
  healTeam:   { label: 'Soin Equipe',  icon: '\uD83D\uDC9A', border: 'border-teal-500/40',   bg: 'bg-teal-500/10',   text: 'text-teal-400' },
  debuff:     { label: 'Debuff',       icon: '\uD83D\uDD3B', border: 'border-orange-500/40', bg: 'bg-orange-500/10', text: 'text-orange-400' },
  dot:        { label: 'DOT',          icon: '\u2620\uFE0F', border: 'border-lime-500/40',   bg: 'bg-lime-500/10',   text: 'text-lime-400' },
  special:    { label: 'Special',      icon: '\u26A1',       border: 'border-yellow-500/40', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
};

function getSkillScopes(sk) {
  const scopes = [];
  if (sk.power > 0) scopes.push('offensive');
  if (sk.buffAllyAtk || sk.buffAllyDef) scopes.push('buffTeam');
  else if (sk.buffAtk || sk.buffDef || sk.buffSpd) scopes.push('buffSelf');
  if (sk.healAlly) scopes.push('healTeam');
  if (sk.healSelf) scopes.push('healSelf');
  if (sk.debuffDef || sk.debuffAtk || sk.debuffSpd || sk.antiHeal) scopes.push('debuff');
  if (sk.poison) scopes.push('dot');
  if (sk.grantExtraTurn || sk.selfDamage || sk.selfStunTurns || sk.consumeHalfMana) scopes.push('special');
  return scopes;
}

const PASSIVE_SCOPE_MAP = {
  teamDef: 'team', teamAura: 'team', healBonus: 'team',
  vsBoss: 'boss', vsLowHp: 'boss', vsDebuffed: 'boss', defIgnore: 'boss', aoeDmg: 'boss', dotDmg: 'boss',
};
const PASSIVE_SCOPE_CONFIG = {
  self: { label: 'Self', icon: '\uD83D\uDEE1\uFE0F', border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  team: { label: 'Equipe', icon: '\uD83D\uDC65', border: 'border-violet-500/30', bg: 'bg-violet-500/10', text: 'text-violet-400' },
  boss: { label: 'vs Boss', icon: '\u2694\uFE0F', border: 'border-red-500/30', bg: 'bg-red-500/10', text: 'text-red-400' },
};

function computeWeaponILevel(weapon, awakening) {
  const rarityBase = { rare: 10, legendaire: 25, mythique: 50 };
  return (rarityBase[weapon.rarity] || 10) + (awakening * 5);
}

// Compute fighter stats at a given level
function computeStatsAtLevel(base, growth, level) {
  return {
    hp:   Math.floor(base.hp   + growth.hp   * (level - 1)),
    atk:  Math.floor(base.atk  + growth.atk  * (level - 1)),
    def:  Math.floor(base.def  + growth.def  * (level - 1)),
    spd:  Math.floor(base.spd  + growth.spd  * (level - 1)),
    crit: +(base.crit + growth.crit * (level - 1)).toFixed(1),
    res:  +(base.res  + growth.res  * (level - 1)).toFixed(1),
  };
}

const CODEX_TABS = [
  { id: 'fighters',  label: 'Combattants', Icon: Users },
  { id: 'weapons',   label: 'Armes',       Icon: Swords },
  { id: 'artifacts', label: 'Artefacts',   Icon: Shield },
  { id: 'mechanics', label: 'Mecaniques',  Icon: Zap },
  { id: 'expedition', label: 'Expedition', Icon: MapPin },
  { id: 'changelog',  label: 'Changelog',  Icon: ScrollText },
];

// ═══════════════════════════════════════════════════════════════

export default function Codex() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('fighters');
  const [mechSubTab, setMechSubTab] = useState('general');
  const [search, setSearch] = useState('');

  // ─── Weapon state ───
  const [filterElement, setFilterElement] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [selectedWeapon, setSelectedWeapon] = useState(null);
  const [viewAwakening, setViewAwakening] = useState(0);

  // ─── Fighter state ───
  const [fFilterElem, setFFilterElem] = useState('all');
  const [fFilterRarity, setFFilterRarity] = useState('all');
  const [fFilterType, setFFilterType] = useState('all'); // 'all' | 'shadow' | 'hunter'
  const [fFilterClass, setFFilterClass] = useState('all');
  const [selectedFighter, setSelectedFighter] = useState(null);
  const [fViewLevel, setFViewLevel] = useState(1);

  // ─── Artifact state ───
  const [aFilterSource, setAFilterSource] = useState('all');
  const [selectedSet, setSelectedSet] = useState(null);
  const [codexStatTooltip, setCodexStatTooltip] = useState(null);

  // ─── Boss codex state ───
  const [selectedBoss, setSelectedBoss] = useState(null);
  const [bossZoneFilter, setBossZoneFilter] = useState('all');

  // ─── Load save data ───
  const [weaponCollection, setWeaponCollection] = useState({});
  const [ownedChibis, setOwnedChibis] = useState(new Set());
  const [ownedHunters, setOwnedHunters] = useState(new Set());
  const [raidDataRef, setRaidDataRef] = useState(null);
  const [artifactInventory, setArtifactInventory] = useState([]);
  const [expeditionInventory, setExpeditionInventory] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        setWeaponCollection(d.weaponCollection || {});
        setArtifactInventory(d.artifactInventory || []);
        const owned = new Set(d.ownedShadows || []);
        // All default chibis are always owned
        Object.keys(CHIBIS).forEach(id => owned.add(id));
        setOwnedChibis(owned);
      }
    } catch {}
    try {
      const raw = localStorage.getItem(RAID_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        setRaidDataRef(d);
        const hunters = new Set();
        (d.hunterCollection || []).forEach(e => {
          hunters.add(typeof e === 'string' ? e : e.id);
        });
        setOwnedHunters(hunters);
        if (d.expeditionInventory) {
          setExpeditionInventory(d.expeditionInventory);
        }
      }
    } catch {}
  }, []);

  // ─── Expedition ownership tracking ───
  const ownedExpSets = useMemo(() => {
    const sets = {};
    for (const item of expeditionInventory) {
      if (item.setId) sets[item.setId] = (sets[item.setId] || 0) + 1;
    }
    return sets;
  }, [expeditionInventory]);

  const ownedExpWeapons = useMemo(() => {
    const w = new Set();
    for (const item of expeditionInventory) {
      if (item.weaponId) w.add(item.weaponId);
    }
    return w;
  }, [expeditionInventory]);

  const ownedExpUniques = useMemo(() => {
    const u = new Set();
    for (const item of expeditionInventory) {
      if (item.uniqueId) u.add(item.uniqueId);
    }
    return u;
  }, [expeditionInventory]);

  // ─── Computed data ───
  const allWeapons = useMemo(() =>
    Object.values(WEAPONS).sort((a, b) => {
      const eA = ELEMENT_ORDER[a.element] ?? 99, eB = ELEMENT_ORDER[b.element] ?? 99;
      if (eA !== eB) return eA - eB;
      return (RARITY_ORDER[b.rarity] || 0) - (RARITY_ORDER[a.rarity] || 0) || a.name.localeCompare(b.name);
    }), []);

  const filteredWeapons = useMemo(() =>
    allWeapons.filter(w => {
      if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterElement !== 'all' && String(w.element) !== filterElement) return false;
      if (filterType !== 'all' && w.weaponType !== filterType) return false;
      if (filterRarity !== 'all' && w.rarity !== filterRarity) return false;
      return true;
    }), [allWeapons, search, filterElement, filterType, filterRarity]);

  const allFighters = useMemo(() => {
    const list = [];
    Object.entries(CHIBIS).forEach(([id, c]) => {
      list.push({ id, ...c, type: 'shadow', sprite: SPRITES[id], class: null });
    });
    Object.entries(HUNTERS).forEach(([id, h]) => {
      list.push({ id, ...h, type: 'hunter' });
    });
    return list.sort((a, b) => {
      const rA = RARITY_ORDER[a.rarity] || 0, rB = RARITY_ORDER[b.rarity] || 0;
      if (rA !== rB) return rB - rA;
      return a.name.localeCompare(b.name);
    });
  }, []);

  const filteredFighters = useMemo(() =>
    allFighters.filter(f => {
      if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (fFilterElem !== 'all' && f.element !== fFilterElem) return false;
      if (fFilterRarity !== 'all' && f.rarity !== fFilterRarity) return false;
      if (fFilterType !== 'all' && f.type !== fFilterType) return false;
      if (fFilterClass !== 'all' && (f.class || '') !== fFilterClass) return false;
      return true;
    }), [allFighters, search, fFilterElem, fFilterRarity, fFilterType, fFilterClass]);

  const allSets = useMemo(() => {
    const list = [];
    Object.values(ARTIFACT_SETS).forEach(s => list.push({ ...s, source: 'base' }));
    Object.values(RAID_ARTIFACT_SETS).forEach(s => list.push({ ...s, source: 'raid' }));
    Object.values(ARC2_ARTIFACT_SETS).forEach(s => list.push({ ...s, source: 'arc2' }));
    Object.values(ULTIME_ARTIFACT_SETS).forEach(s => list.push({ ...s, source: 'ultime' }));
    return list;
  }, []);

  const filteredSets = useMemo(() =>
    allSets.filter(s => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (aFilterSource !== 'all' && s.source !== aFilterSource) return false;
      return true;
    }), [allSets, search, aFilterSource]);

  // Artifact count per set
  const setCount = useMemo(() => {
    const counts = {};
    artifactInventory.forEach(a => { counts[a.set] = (counts[a.set] || 0) + 1; });
    return counts;
  }, [artifactInventory]);

  const selectedStats = useMemo(() => {
    if (!selectedWeapon) return null;
    return computeWeaponBonuses(selectedWeapon.id, viewAwakening);
  }, [selectedWeapon, viewAwakening]);

  const selectedPassives = useMemo(() => {
    if (!selectedWeapon) return [];
    return (WEAPON_AWAKENING_PASSIVES[selectedWeapon.id] || []).slice(0, 5);
  }, [selectedWeapon]);

  const fStats = useMemo(() => {
    if (!selectedFighter) return null;
    return computeStatsAtLevel(selectedFighter.base, selectedFighter.growth, fViewLevel);
  }, [selectedFighter, fViewLevel]);

  // Beru react
  useEffect(() => {
    try {
      window.dispatchEvent(new CustomEvent('beru-react', {
        detail: { message: "Le Codex ! Toutes les connaissances de l'Ombre sont ici.", mood: 'proud' }
      }));
    } catch {}
  }, []);

  // Reset search when switching tabs
  useEffect(() => { setSearch(''); }, [activeTab]);

  const owned = (id) => weaponCollection[id] !== undefined;
  const getAwakening = (id) => weaponCollection[id] || 0;
  const isFighterOwned = (f) => f.type === 'shadow' ? ownedChibis.has(f.id) : ownedHunters.has(f.id);

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white px-3 py-4 md:px-6 md:py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/shadow-colosseum')}
          className="p-2 rounded-lg bg-gray-800/60 border border-gray-700/30 hover:border-purple-500/40 hover:bg-gray-700/40 transition-all">
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <BookOpen className="w-7 h-7 text-purple-400" />
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">
          <span className="text-purple-400">CODEX</span>
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {CODEX_TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === t.id
                ? 'bg-purple-600/30 border border-purple-500/50 text-purple-300'
                : 'bg-gray-800/40 border border-gray-700/30 text-gray-500 hover:text-gray-300'
            }`}>
            <t.Icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* ═══ FIGHTERS TAB ═══ */}
      {activeTab === 'fighters' && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative flex-1 min-w-[160px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/40 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50" />
            </div>
            <select value={fFilterElem} onChange={e => setFFilterElem(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/40 text-sm text-gray-300 focus:outline-none focus:border-purple-500/50">
              <option value="all">Element</option>
              {Object.entries(ELEMENT_CONFIG).filter(([k]) => k !== 'null').map(([k, c]) => (
                <option key={k} value={k}>{c.icon} {c.label}</option>
              ))}
            </select>
            <select value={fFilterRarity} onChange={e => setFFilterRarity(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/40 text-sm text-gray-300 focus:outline-none focus:border-purple-500/50">
              <option value="all">Rarete</option>
              {Object.entries(RARITY_CONFIG).map(([k, c]) => (
                <option key={k} value={k}>{c.label}</option>
              ))}
            </select>
            <select value={fFilterType} onChange={e => setFFilterType(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/40 text-sm text-gray-300 focus:outline-none focus:border-purple-500/50">
              <option value="all">Tous</option>
              <option value="shadow">Ombres</option>
              <option value="hunter">Hunters</option>
            </select>
            <select value={fFilterClass} onChange={e => setFFilterClass(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/40 text-sm text-gray-300 focus:outline-none focus:border-purple-500/50">
              <option value="all">Classe</option>
              {Object.entries(CLASS_CONFIG).map(([k, c]) => (
                <option key={k} value={k}>{c.icon} {c.label}</option>
              ))}
            </select>
          </div>

          <div className="text-[10px] text-gray-600 mb-3">
            {filteredFighters.length} combattant{filteredFighters.length > 1 ? 's' : ''} — {[...ownedChibis].length + [...ownedHunters].length}/{allFighters.length} obtenu{([...ownedChibis].length + [...ownedHunters].length) > 1 ? 's' : ''}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
            {filteredFighters.map(f => {
              const isOwn = isFighterOwned(f);
              const rCfg = RARITY_CONFIG[f.rarity] || RARITY_CONFIG.rare;
              const eCfg = ELEMENT_CONFIG[f.element] || ELEMENT_CONFIG.null;
              const cCfg = f.class ? CLASS_CONFIG[f.class] : null;

              return (
                <motion.button key={f.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { setSelectedFighter(f); setFViewLevel(1); }}
                  className={`relative p-3 rounded-xl border text-left transition-all ${
                    isOwn ? `${rCfg.border} ${rCfg.bg} shadow-lg ${rCfg.glow}` : 'border-gray-700/20 bg-gray-900/40'
                  } ${selectedFighter?.id === f.id ? 'ring-2 ring-purple-500/60' : ''}`}>
                  {/* Type badge */}
                  <div className={`absolute top-1.5 right-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded ${
                    f.type === 'hunter' ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {f.type === 'hunter' ? 'Hunter' : 'Ombre'}
                  </div>

                  {/* Sprite */}
                  <div className={`w-full aspect-square rounded-lg mb-2 flex items-center justify-center overflow-hidden ${
                    isOwn ? 'bg-gray-800/40' : 'bg-gray-800/20'
                  }`}>
                    {f.sprite ? (
                      <img loading="lazy" src={f.sprite} alt={f.name} className={`w-full h-full object-contain ${!isOwn ? 'grayscale opacity-40' : ''}`} draggable={false} />
                    ) : (
                      <span className={`text-3xl ${!isOwn ? 'opacity-30' : ''}`}>{eCfg.icon}</span>
                    )}
                  </div>

                  <div className={`text-[11px] font-bold truncate ${isOwn ? rCfg.color : 'text-gray-600'}`}>{f.name}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px]">{eCfg.icon}</span>
                    <span className={`text-[9px] ${rCfg.color}`}>{RARITY[f.rarity]?.stars}</span>
                    {cCfg && <span className={`text-[9px] ml-auto ${cCfg.color}`}>{cCfg.label}</span>}
                  </div>
                  {/* Eveil stars for hunters */}
                  {f.type === 'hunter' && isOwn && raidDataRef && (() => {
                    const stars = getHunterStars(raidDataRef, f.id);
                    return stars > 0 ? (
                      <div className="mt-0.5 text-[9px]">
                        <span className="text-yellow-400 font-bold">A{stars}</span>
                      </div>
                    ) : null;
                  })()}

                  {!isOwn && <div className="absolute inset-0 rounded-xl bg-black/20 pointer-events-none" />}
                </motion.button>
              );
            })}
          </div>

          {/* Fighter Detail Modal */}
          <AnimatePresence>
            {selectedFighter && fStats && (
              <motion.div key={selectedFighter.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={e => { if (e.target === e.currentTarget) setSelectedFighter(null); }}>
                <div className="w-full max-w-lg bg-[#12121f] border border-gray-700/40 rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
                  {(() => {
                    const f = selectedFighter;
                    const rCfg = RARITY_CONFIG[f.rarity] || RARITY_CONFIG.rare;
                    const eCfg = ELEMENT_CONFIG[f.element] || ELEMENT_CONFIG.null;
                    const cCfg = f.class ? CLASS_CONFIG[f.class] : null;
                    const isOwn = isFighterOwned(f);
                    const passive = HUNTER_PASSIVE_EFFECTS[f.id];
                    const evStars = (f.type === 'hunter' && raidDataRef) ? getHunterStars(raidDataRef, f.id) : 0;

                    return (
                      <>
                        {/* Header */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden border ${rCfg.border} ${rCfg.bg}`}>
                            {f.sprite ? (
                              <img loading="lazy" src={f.sprite} alt={f.name} className={`w-full h-full object-contain ${!isOwn ? 'grayscale opacity-40' : ''}`} draggable={false} />
                            ) : (
                              <span className="text-4xl">{eCfg.icon}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h2 className={`text-lg font-black ${rCfg.color}`}>{f.name}</h2>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                                f.type === 'hunter' ? 'bg-red-500/15 border-red-500/30 text-red-400' : 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                              }`}>{f.type === 'hunter' ? 'Hunter' : 'Ombre'}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${eCfg.bg} ${eCfg.color} ${eCfg.border} border font-bold`}>{eCfg.icon} {eCfg.label}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${rCfg.bg} ${rCfg.color} ${rCfg.border} border font-bold`}>{rCfg.label}</span>
                              {cCfg && <span className={`text-[10px] px-2 py-0.5 rounded-full bg-gray-800/60 border border-gray-700/30 font-bold ${cCfg.color}`}>{cCfg.icon} {cCfg.label}</span>}
                            </div>
                            {/* Awakening */}
                            {f.type === 'hunter' && isOwn && evStars > 0 && (
                              <div className="mt-1.5">
                                <span className="text-yellow-400 text-sm font-bold">A{evStars}</span>
                              </div>
                            )}
                            {f.passiveDesc && <p className="text-[11px] text-amber-300 mt-1.5 italic">{f.passiveDesc}</p>}
                            {evStars >= 1 && (() => {
                              const awPs = getAwakeningPassives(f.id, evStars);
                              return awPs.length > 0 ? awPs.map((ap, i) => (
                                <p key={i} className="text-[10px] text-yellow-300 mt-0.5">{ap.desc}</p>
                              )) : null;
                            })()}
                            {!isOwn && <div className="text-[10px] text-gray-600 font-bold mt-1">Non obtenu</div>}
                          </div>
                        </div>

                        {/* Level selector */}
                        <div className="flex items-center justify-between mb-4 bg-gray-800/40 rounded-xl px-4 py-2.5 border border-gray-700/30">
                          <button onClick={() => setFViewLevel(Math.max(1, fViewLevel - 10))} disabled={fViewLevel <= 1}
                            className="p-1 rounded-lg hover:bg-gray-700/40 disabled:opacity-20 transition-all">
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <div className="text-center">
                            <div className="text-lg font-black text-purple-400">Lv {fViewLevel}</div>
                            <input type="range" min={1} max={200} value={fViewLevel} onChange={e => setFViewLevel(+e.target.value)}
                              className="w-32 h-1 accent-purple-500 cursor-pointer" />
                          </div>
                          <button onClick={() => setFViewLevel(Math.min(200, fViewLevel + 10))} disabled={fViewLevel >= 200}
                            className="p-1 rounded-lg hover:bg-gray-700/40 disabled:opacity-20 transition-all">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Stats table */}
                        <div className="mb-4">
                          <div className="text-[10px] text-gray-500 font-bold uppercase mb-2">Stats Lv{fViewLevel}</div>
                          <div className="grid grid-cols-3 gap-2">
                            {['hp', 'atk', 'def', 'spd', 'crit', 'res'].map(k => {
                              const sm = STAT_META[k];
                              return (
                                <div key={k} className="relative p-2 rounded-lg bg-gray-800/40 border border-gray-700/20 cursor-pointer"
                                  onClick={() => setCodexStatTooltip(codexStatTooltip === k ? null : k)}>
                                  <div className="text-[9px] text-gray-500 flex items-center gap-1">{sm.icon} {sm.name}
                                    {sm.detail && <span className="text-[7px] text-gray-600 hover:text-purple-400">?</span>}
                                  </div>
                                  <div className={`text-sm font-black ${sm.color}`}>{fStats[k]}{k === 'crit' || k === 'res' ? '%' : ''}</div>
                                  <div className="text-[8px] text-gray-600">+{f.growth[k]}/lv</div>
                                  {codexStatTooltip === k && sm.detail && (
                                    <div className="absolute z-20 left-0 right-0 top-full mt-1 p-2 rounded-lg bg-[#1a1a2e] border border-purple-500/30 text-[10px] text-purple-200 leading-relaxed shadow-xl">{sm.detail}</div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Skills */}
                        <div className="mb-4">
                          <div className="text-[10px] text-gray-500 font-bold uppercase mb-2">Skills</div>
                          <div className="space-y-2">
                            {(f.skills || []).map((sk, i) => {
                              const scopes = getSkillScopes(sk);
                              const mainScope = scopes[0] ? SKILL_SCOPE_CONFIG[scopes[0]] : null;
                              const manaCost = getSkillManaCost(sk);
                              return (
                                <div key={i} className={`p-2.5 rounded-lg border ${
                                  mainScope ? `${mainScope.bg} ${mainScope.border}` :
                                  'bg-gray-800/30 border-gray-700/20'
                                }`}>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] font-bold text-white">{sk.name}</span>
                                    <div className="flex items-center gap-2 shrink-0">
                                      {sk.power > 0 && <span className="text-[10px] text-orange-400 font-bold">POW {sk.power}</span>}
                                      <span className="text-[10px] text-gray-500">CD {sk.cdMax || 0}</span>
                                      {manaCost > 0 && <span className="text-[10px] text-indigo-400">{'\uD83D\uDD2E'}{manaCost}</span>}
                                    </div>
                                  </div>
                                  {/* Scope badges */}
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {scopes.map(scope => {
                                      const cfg = SKILL_SCOPE_CONFIG[scope];
                                      return (
                                        <span key={scope} className={`text-[8px] px-1.5 py-0.5 rounded-full border font-bold uppercase ${cfg.border} ${cfg.bg} ${cfg.text}`}>
                                          {cfg.icon} {cfg.label}
                                        </span>
                                      );
                                    })}
                                  </div>
                                  {sk.desc && <div className="text-[10px] text-gray-500 mt-1">{sk.desc}</div>}
                                  {/* Effect details */}
                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    {sk.buffAtk && <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-400">ATK +{sk.buffAtk}% ({sk.buffDur}t)</span>}
                                    {sk.buffDef && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400">DEF +{sk.buffDef}% ({sk.buffDur}t)</span>}
                                    {sk.buffSpd && <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400">SPD +{sk.buffSpd}% ({sk.buffDur}t)</span>}
                                    {sk.buffAllyAtk && <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400">ATK Equipe +{sk.buffAllyAtk}% ({sk.buffDur}t)</span>}
                                    {sk.buffAllyDef && <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400">DEF Equipe +{sk.buffAllyDef}% ({sk.buffDur}t)</span>}
                                    {sk.debuffDef && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">DEF ennemi -{sk.debuffDef}% ({sk.debuffDur}t)</span>}
                                    {sk.debuffAtk && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">ATK ennemi -{sk.debuffAtk}% ({sk.debuffDur}t)</span>}
                                    {sk.debuffSpd && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">SPD ennemi -{sk.debuffSpd}% ({sk.debuffDur}t)</span>}
                                    {sk.healSelf && <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-400">Soin {sk.healSelf}% PV max</span>}
                                    {sk.healAlly && <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-400">Soin allie {sk.healAlly}% PV max</span>}
                                    {sk.poison && <span className="text-[9px] px-1.5 py-0.5 rounded bg-lime-500/15 text-lime-400">Poison {sk.poison}/t ({sk.poisonDur}t)</span>}
                                    {sk.antiHeal && <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400">Anti-Soin ({sk.antiHealDur}t)</span>}
                                    {sk.selfDamage && <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400">Auto-DMG {sk.selfDamage}%</span>}
                                    {sk.selfStunTurns && <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400">Auto-Stun {sk.selfStunTurns}t</span>}
                                    {sk.grantExtraTurn && <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400">Tour bonus</span>}
                                    {sk.manaRestore && <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400">+{sk.manaRestore} Mana</span>}
                                    {sk.consumeHalfMana && <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400">Consume 50% Mana</span>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Ultimate Skill */}
                        {(() => {
                          const ultiData = ULTIMATE_SKILLS[f.id] || ULTIMATE_SKILLS[f.id?.replace('_skin', '')];
                          if (!ultiData) return null;
                          const coloSave = (() => { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}'); } catch { return {}; } })();
                          const isUnlocked = !!coloSave.ultimateSkills?.[f.id];
                          return (
                            <div className="mb-4">
                              <div className="text-[10px] text-gray-500 font-bold uppercase mb-2">Ultimate</div>
                              <div className={`p-2.5 rounded-lg border transition-all ${
                                isUnlocked
                                  ? 'bg-blue-500/10 border-blue-500/30'
                                  : 'bg-gray-800/20 border-gray-700/20 opacity-50'
                              }`}>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[11px] font-bold text-blue-300">{ultiData.name}</span>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {ultiData.power > 0 && <span className="text-[10px] text-orange-400 font-bold">POW {ultiData.power}</span>}
                                    <span className="text-[10px] text-gray-500">CD {ultiData.cdMax}</span>
                                    <span className="text-[10px] text-indigo-400">{'\uD83D\uDD2E'}{ultiData.manaCost}</span>
                                  </div>
                                </div>
                                <div className="text-[10px] text-gray-400 mt-1">{ultiData.desc}</div>
                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                  {ultiData.shieldTeamPctDef > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400">Shield {Math.round(ultiData.shieldTeamPctDef * 100)}% DEF</span>}
                                  {ultiData.healSelf > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-400">Soin {ultiData.healSelf}%</span>}
                                  {ultiData.healTeam > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">Soin Equipe {ultiData.healTeam}%</span>}
                                  {ultiData.buffAtk > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-400">ATK +{ultiData.buffAtk}%</span>}
                                  {ultiData.buffDef > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400">DEF +{ultiData.buffDef}%</span>}
                                  {ultiData.debuffDef > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">DEF ennemi -{ultiData.debuffDef}%</span>}
                                  {ultiData.poison > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-lime-500/15 text-lime-400">Poison {ultiData.poison}/t ({ultiData.poisonDur}t)</span>}
                                  {ultiData.antiHeal > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400">Anti-Soin {ultiData.antiHeal}%</span>}
                                  {ultiData.manaScaling > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400">Mana x{ultiData.manaScaling}</span>}
                                  {ultiData.selfDamage > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400">Auto-DMG {ultiData.selfDamage}%</span>}
                                  {ultiData.manaRestore > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400">+{ultiData.manaRestore}% Mana</span>}
                                </div>
                                {!isUnlocked && <div className="text-[9px] text-gray-500 mt-1.5 italic">Verrouille — Obtenir un Parchemin Ultimate en Expedition</div>}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Hunter Passive */}
                        {f.type === 'hunter' && passive && f.passiveDesc && (() => {
                          const passiveScope = PASSIVE_SCOPE_MAP[passive.type] || 'self';
                          const psCfg = PASSIVE_SCOPE_CONFIG[passiveScope];
                          return (
                            <div className="mb-4">
                              <div className="text-[10px] text-gray-500 font-bold uppercase mb-2">Passif</div>
                              <div className={`p-2.5 rounded-lg border ${psCfg.border} ${psCfg.bg}`}>
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className={`font-bold uppercase text-[8px] px-1.5 py-0.5 rounded-full border ${PASSIVE_TYPE_COLORS[passive.type] || 'bg-gray-800/50 text-gray-300'}`}>
                                    {PASSIVE_TYPE_LABELS[passive.type] || passive.type}
                                  </span>
                                  <span className={`text-[8px] px-1.5 py-0.5 rounded-full border font-bold uppercase ${psCfg.border} ${psCfg.text}`}>
                                    {psCfg.icon} {psCfg.label}
                                  </span>
                                </div>
                                <div className="text-[10px] text-gray-300">{f.passiveDesc}</div>
                                {evStars >= 1 && (() => {
                                  const awPs = getAwakeningPassives(f.id, evStars);
                                  return awPs.length > 0 ? (
                                    <div className="mt-2 pt-2 border-t border-white/10">
                                      <div className="text-[9px] text-yellow-500 font-bold uppercase mb-1">Passifs d'eveil</div>
                                      {awPs.map((ap, i) => (
                                        <div key={i} className="text-[10px] text-yellow-300">{ap.desc}</div>
                                      ))}
                                    </div>
                                  ) : null;
                                })()}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Eveil Breakdown (Hunters) */}
                        {f.type === 'hunter' && evStars > 0 && (
                          <div className="mb-4">
                            <div className="text-[10px] text-gray-500 font-bold uppercase mb-2">Awakening</div>
                            <div className="px-2 py-1 rounded-lg text-[11px] border border-yellow-500/40 bg-yellow-900/30 text-yellow-300 inline-block">
                              <span className="font-bold">A{evStars}</span>
                              <span className="ml-2 text-gray-400">
                                {evStars <= 5
                                  ? `Bonus fixes appliqués`
                                  : `+${Math.floor(evStars / 5) - 1}% HP/ATK/DEF (paliers)`
                                }
                              </span>
                            </div>
                            <div className="text-[9px] text-gray-600 mt-1.5">
                              A1-A5 : bonus progressifs • Après A5 : +1% HP/ATK/DEF tous les 5 niveaux (max A200)
                            </div>
                          </div>
                        )}

                        {/* Where to obtain */}
                        <div className="mb-4 p-3 rounded-xl bg-gray-800/30 border border-gray-700/20">
                          <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Ou obtenir</div>
                          {f.type === 'shadow' ? (
                            <div className="text-[11px] text-gray-300">
                              {'\uD83C\uDF11'} Disponible des le debut (Ombre de base). Peut aussi etre capture dans le Chibi World.
                            </div>
                          ) : (
                            <div className="text-[11px] text-gray-300">
                              <div>{'\uD83C\uDFAF'} <span className="text-red-400 font-bold">Drop universel</span> — 5 tirages x 1% par victoire</div>
                              <div className="text-[10px] text-gray-500 mt-0.5">Disponible partout : ARC I, ARC II, Raid Manaya</div>
                              <span className={`ml-1 ${rCfg.color}`}>Rarete : {rCfg.label}</span>
                            </div>
                          )}
                        </div>

                        <button onClick={() => setSelectedFighter(null)}
                          className="w-full py-2 rounded-xl bg-gray-800/60 border border-gray-700/30 text-sm font-bold text-gray-400 hover:text-white hover:border-purple-500/40 transition-all">
                          Fermer
                        </button>
                      </>
                    );
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ═══ WEAPONS TAB ═══ */}
      {activeTab === 'weapons' && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/40 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50" />
            </div>
            <select value={filterElement} onChange={e => setFilterElement(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/40 text-sm text-gray-300 focus:outline-none focus:border-purple-500/50">
              <option value="all">Element</option>
              {Object.entries(ELEMENT_CONFIG).map(([k, c]) => <option key={k} value={k}>{c.icon} {c.label}</option>)}
            </select>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/40 text-sm text-gray-300 focus:outline-none focus:border-purple-500/50">
              <option value="all">Type</option>
              {Object.entries(WEAPON_TYPE_CONFIG).map(([k, c]) => <option key={k} value={k}>{c.icon} {c.label}</option>)}
            </select>
            <select value={filterRarity} onChange={e => setFilterRarity(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/40 text-sm text-gray-300 focus:outline-none focus:border-purple-500/50">
              <option value="all">Rarete</option>
              {Object.entries(RARITY_CONFIG).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
            </select>
          </div>

          <div className="text-[10px] text-gray-600 mb-3">
            {filteredWeapons.length} arme{filteredWeapons.length > 1 ? 's' : ''} — {Object.keys(weaponCollection).length}/{allWeapons.length} obtenue{Object.keys(weaponCollection).length > 1 ? 's' : ''}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
            {filteredWeapons.map(w => {
              const isOwned = owned(w.id);
              const aw = getAwakening(w.id);
              const rCfg = RARITY_CONFIG[w.rarity] || RARITY_CONFIG.rare;
              const eCfg = ELEMENT_CONFIG[w.element] || ELEMENT_CONFIG.null;
              const tCfg = WEAPON_TYPE_CONFIG[w.weaponType] || { label: '?', icon: '?' };
              const iLevel = computeWeaponILevel(w, aw);
              const sprite = w.sprite || WEAPON_SPRITES[w.id];

              return (
                <motion.button key={w.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { setSelectedWeapon(w); setViewAwakening(aw); }}
                  className={`relative p-3 rounded-xl border text-left transition-all ${
                    isOwned ? `${rCfg.border} ${rCfg.bg} shadow-lg ${rCfg.glow}` : 'border-gray-700/20 bg-gray-900/40'
                  } ${selectedWeapon?.id === w.id ? 'ring-2 ring-purple-500/60' : ''}`}>
                  <div className="absolute top-1.5 right-1.5 text-[9px] font-bold text-gray-500 bg-gray-900/80 px-1.5 py-0.5 rounded">iLv {iLevel}</div>
                  <div className={`w-full aspect-square rounded-lg mb-2 flex items-center justify-center overflow-hidden ${isOwned ? 'bg-gray-800/40' : 'bg-gray-800/20'}`}>
                    {sprite ? (
                      <img loading="lazy" src={sprite} alt={w.name} className={`w-full h-full object-contain ${!isOwned ? 'grayscale opacity-40' : ''}`} />
                    ) : (
                      <span className={`text-3xl ${!isOwned ? 'grayscale opacity-30' : ''}`}>{w.icon}</span>
                    )}
                  </div>
                  <div className={`text-[11px] font-bold truncate ${isOwned ? rCfg.color : 'text-gray-600'}`}>{w.name}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px]">{eCfg.icon}</span>
                    <span className="text-[10px]">{tCfg.icon}</span>
                    {w.secret && <span className="text-[9px] text-red-500 font-bold ml-auto">SECRET</span>}
                    {w.ultime && <span className="text-[9px] text-red-300 font-bold ml-auto">ULTIME</span>}
                  </div>
                  {isOwned && <div className="mt-1 text-[9px] font-bold text-purple-400">A{aw}</div>}
                  {!isOwned && <div className="absolute inset-0 rounded-xl bg-black/20 pointer-events-none" />}
                </motion.button>
              );
            })}
          </div>

          {/* Weapon Detail Modal */}
          <AnimatePresence>
            {selectedWeapon && selectedStats && (
              <motion.div key={selectedWeapon.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={e => { if (e.target === e.currentTarget) setSelectedWeapon(null); }}>
                <div className="w-full max-w-lg bg-[#12121f] border border-gray-700/40 rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
                  {(() => {
                    const w = selectedWeapon;
                    const rCfg = RARITY_CONFIG[w.rarity] || RARITY_CONFIG.rare;
                    const eCfg = ELEMENT_CONFIG[w.element] || ELEMENT_CONFIG.null;
                    const tCfg = WEAPON_TYPE_CONFIG[w.weaponType] || { label: '?', icon: '?' };
                    const isOwned = owned(w.id);
                    const iLevel = computeWeaponILevel(w, viewAwakening);
                    const sprite = w.sprite || WEAPON_SPRITES[w.id];

                    return (
                      <>
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden border ${rCfg.border} ${rCfg.bg}`}>
                            {sprite ? (
                              <img loading="lazy" src={sprite} alt={w.name} className={`w-full h-full object-contain ${!isOwned ? 'grayscale opacity-40' : ''}`} />
                            ) : (
                              <span className={`text-4xl ${!isOwned ? 'grayscale opacity-30' : ''}`}>{w.icon}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h2 className={`text-lg font-black ${rCfg.color}`}>{w.name}</h2>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${rCfg.bg} ${rCfg.color} ${rCfg.border} border font-bold`}>{rCfg.label}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${eCfg.bg} ${eCfg.color} ${eCfg.border} border font-bold`}>{eCfg.icon} {eCfg.label}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800/60 border border-gray-700/30 text-gray-400 font-bold">{tCfg.icon} {tCfg.label}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800/60 border border-gray-700/30 text-gray-400 font-bold">iLv {iLevel}</span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-1.5 italic">{w.desc}</p>
                            {w.secret && <div className="text-[10px] text-red-400 font-bold mt-1">SECRET — Drop {w.dropRate || '1/10,000'} sur {w.dropSource || 'Ragnarok'}</div>}
                            {w.ultime && <div className="text-[10px] text-red-300 font-bold mt-1">ULTIME — Drop exclusif en Raid Ultime (RC 3+)</div>}
                            {!isOwned && <div className="text-[10px] text-gray-600 font-bold mt-1">Non obtenu</div>}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-4 bg-gray-800/40 rounded-xl px-4 py-2.5 border border-gray-700/30">
                          <button onClick={() => setViewAwakening(Math.max(0, viewAwakening - (viewAwakening > 10 ? 5 : 1)))} disabled={viewAwakening <= 0}
                            className="p-1 rounded-lg hover:bg-gray-700/40 disabled:opacity-20 transition-all"><ChevronLeft className="w-5 h-5" /></button>
                          <div className="text-center">
                            <div className="text-lg font-black text-purple-400">A{viewAwakening}</div>
                            <div className="text-[9px] text-gray-500">{viewAwakening === 0 ? 'Base' : viewAwakening <= 5 ? 'Passive unique' : viewAwakening <= 10 ? '+3% ATK/INT/DEF/PV par niv' : '+2% ATK/INT/DEF/PV /5 niv'}</div>
                          </div>
                          <button onClick={() => setViewAwakening(Math.min(MAX_WEAPON_AWAKENING, viewAwakening + (viewAwakening >= 10 ? 5 : 1)))} disabled={viewAwakening >= MAX_WEAPON_AWAKENING}
                            className="p-1 rounded-lg hover:bg-gray-700/40 disabled:opacity-20 transition-all"><ChevronRight className="w-5 h-5" /></button>
                        </div>

                        <div className="flex flex-wrap justify-center gap-1 mb-4">
                          {[0,1,2,3,4,5,6,7,8,9,10,15,20,25,30,40,50,60,70,80,90,100].filter(i => i <= MAX_WEAPON_AWAKENING).map(i => (
                            <button key={i} onClick={() => setViewAwakening(i)}
                              className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition-all ${
                                i === viewAwakening ? 'bg-purple-400 text-white scale-110' : i <= (isOwned ? getAwakening(w.id) : -1) ? 'bg-purple-600/60 text-purple-300' : 'bg-gray-700/40 text-gray-500'
                              }`}>A{i}</button>
                          ))}
                        </div>

                        <div className="mb-4">
                          <div className="text-[10px] text-gray-500 font-bold uppercase mb-2">Stats a A{viewAwakening}</div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            {Object.entries(selectedStats).map(([key, val]) => {
                              if (val === 0) return null;
                              return (
                                <div key={key} className="flex justify-between text-[11px]">
                                  <span className="text-gray-400">{STAT_LABELS[key] || key}</span>
                                  <span className="text-white font-bold">+{val}{key.includes('flat') ? '' : '%'}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {selectedPassives.length > 0 && (
                          <div className="mb-4">
                            <div className="text-[10px] text-gray-500 font-bold uppercase mb-2">Passives d'eveil (A1-A5)</div>
                            <div className="space-y-1">
                              {selectedPassives.map((p, i) => (
                                <div key={i} className={`flex items-center gap-2 text-[11px] px-2.5 py-1.5 rounded-lg border transition-all ${
                                  i < viewAwakening ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' : 'bg-gray-800/30 border-gray-700/20 text-gray-600'
                                }`}>
                                  <span className="font-bold w-6 text-center">A{i + 1}</span>
                                  <span>{p.desc}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mb-4">
                          <div className="text-[10px] text-gray-500 font-bold uppercase mb-2">Bonus A6-A10</div>
                          <div className="space-y-1">
                            {[6, 7, 8, 9, 10].map(lvl => (
                              <div key={lvl} className={`flex items-center gap-2 text-[11px] px-2.5 py-1.5 rounded-lg border transition-all ${
                                lvl <= viewAwakening ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-gray-800/30 border-gray-700/20 text-gray-600'
                              }`}>
                                <span className="font-bold w-6 text-center">A{lvl}</span>
                                <span>ATK +3%, INT +3%, DEF +3%, PV +3%</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {w.passive === 'sulfuras_fury' && (
                          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 mb-4">
                            <div className="text-[10px] text-red-400 font-bold uppercase mb-1">Passive Unique — Sulfuras Fury</div>
                            <div className="text-[11px] text-red-300">+33% DMG par tour (cumulable, max +100%). La puissance augmente a chaque tour de combat.</div>
                          </div>
                        )}
                        {w.passive === 'shadow_silence' && (
                          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 mb-4">
                            <div className="text-[10px] text-purple-400 font-bold uppercase mb-1">Passive Unique — Murmure de la Mort</div>
                            <div className="text-[11px] text-purple-300">10% de chance par tour d'obtenir +100% ATK pendant 5 tours. Cumulable jusqu'a 3 fois (max +300% ATK).</div>
                          </div>
                        )}
                        {w.passive === 'katana_z_fury' && (
                          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 mb-4">
                            <div className="text-[10px] text-cyan-400 font-bold uppercase mb-1">Passive Unique — Tranchant Eternel</div>
                            <div className="text-[11px] text-cyan-300">Chaque attaque octroie +5% ATK (cumulable). En fin de tour, chaque stack a 50% de chance de persister. 50% de chance de contre-attaquer les coups ennemis pour 200% de l'ATK du porteur.</div>
                          </div>
                        )}
                        {w.passive === 'katana_v_chaos' && (
                          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 mb-4">
                            <div className="text-[10px] text-emerald-400 font-bold uppercase mb-1">Passive Unique — Lame Veneneuse</div>
                            <div className="text-[11px] text-emerald-300">Scale sur INT (Mana). Chaque attaque empoisonne l'ennemi (1.5% maxMana/stack/tour, max 7 stacks). 18% de chance par coup de declencher un buff aleatoire : +10% toutes stats permanent cumulable (Solo) / +5% toutes stats permanent cumulable (Raid) / Bouclier Divin (absorbe 1 coup) / Puissance x6 au prochain coup.</div>
                          </div>
                        )}
                        {w.passive === 'guldan_halo' && (
                          <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 mb-4">
                            <div className="text-[10px] text-green-400 font-bold uppercase mb-1">Passive Unique — Halo Eternel</div>
                            <div className="text-[11px] text-green-300 space-y-1">
                              <div><span className="text-green-400 font-bold">Halo de Soin :</span> Chaque attaque ajoute un stack de Halo. Soigne {'{'}2% des degats infliges x nombre de stacks{'}'} a chaque coup.</div>
                              <div><span className="text-green-400 font-bold">Renforcement :</span> +1% DEF et +1.5% ATK par attaque (permanent, cumulable tout le combat).</div>
                              <div><span className="text-green-400 font-bold">Halo Celeste :</span> 25% de chance par attaque de gagner un stack de vitesse (+80% SPD/stack, max 3 stacks).</div>
                              <div><span className="text-green-400 font-bold">Etourdissement :</span> En fin de tour, chaque stack de Halo a 5% de chance d'etourdir l'ennemi (skip son tour).</div>
                              <div><span className="text-green-400 font-bold">Halo Divin :</span> Ressuscite automatiquement le premier allie mort a 50% PV (1 fois par combat, ARC II uniquement).</div>
                            </div>
                            <div className="mt-2 text-[9px] text-gray-500 italic">Drop : Archdemon (1/80 000). Fragments : 0.3% par kill.</div>
                          </div>
                        )}

                        <button onClick={() => setSelectedWeapon(null)}
                          className="w-full py-2 rounded-xl bg-gray-800/60 border border-gray-700/30 text-sm font-bold text-gray-400 hover:text-white hover:border-purple-500/40 transition-all">
                          Fermer
                        </button>
                      </>
                    );
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ═══ ARTIFACTS TAB ═══ */}
      {activeTab === 'artifacts' && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative flex-1 min-w-[160px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input type="text" placeholder="Rechercher un set..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/40 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50" />
            </div>
            <select value={aFilterSource} onChange={e => setAFilterSource(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/40 text-sm text-gray-300 focus:outline-none focus:border-purple-500/50">
              <option value="all">Toutes les sources</option>
              <option value="base">Colosseum (Base)</option>
              <option value="raid">Raid</option>
              <option value="arc2">ARC II</option>
              <option value="ultime">Ultime</option>
            </select>
          </div>

          <div className="text-[10px] text-gray-600 mb-3">{filteredSets.length} set{filteredSets.length > 1 ? 's' : ''} d'artefacts</div>

          {/* Sets by source */}
          {['base', 'raid', 'arc2', 'ultime'].map(src => {
            const srcSets = filteredSets.filter(s => s.source === src);
            if (srcSets.length === 0) return null;
            const srcLabel = { base: 'Sets Colosseum', raid: 'Sets Raid (Exclusifs)', arc2: 'Sets ARC II', ultime: 'Sets Ultime' }[src];
            const srcColor = { base: 'text-blue-400', raid: 'text-pink-400', arc2: 'text-amber-400', ultime: 'text-red-400' }[src];
            return (
              <div key={src} className="mb-6">
                <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${srcColor}`}>{srcLabel}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {srcSets.map(s => {
                    const count = setCount[s.id] || 0;
                    return (
                      <motion.button key={s.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedSet(s)}
                        className={`relative p-3.5 rounded-xl border text-left transition-all ${s.border} ${s.bg} hover:shadow-lg ${
                          selectedSet?.id === s.id ? 'ring-2 ring-purple-500/60' : ''
                        }`}>
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{s.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-bold ${s.color}`}>{s.name}</div>
                            <div className="text-[10px] text-gray-500">{s.desc}</div>
                          </div>
                          {count > 0 && (
                            <span className="text-[10px] font-bold text-green-400 bg-green-500/15 px-2 py-0.5 rounded-full">x{count}</span>
                          )}
                        </div>
                        <div className="mt-2 space-y-0.5">
                          <div className="text-[10px] text-green-400">2p : {s.bonus2Desc}</div>
                          <div className="text-[10px] text-blue-400">4p : {s.bonus4Desc}</div>
                          {s.bonus8Desc && <div className="text-[10px] text-orange-400">8p : {s.bonus8Desc}</div>}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Reference section: Slots, Main stats, Sub stats */}
          <div className="mt-8 mb-6">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Reference : Slots & Stats</div>

            {/* Slots + main stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {SLOT_ORDER.map(slotId => {
                const sl = ARTIFACT_SLOTS[slotId];
                return (
                  <div key={slotId} className="p-2.5 rounded-lg bg-gray-800/30 border border-gray-700/20">
                    <div className="text-[11px] font-bold text-gray-300">{sl.icon} {sl.name}</div>
                    <div className="text-[9px] text-gray-500 mt-1">Main stats :</div>
                    {sl.mainStats.map(ms => (
                      <div key={ms} className="text-[10px] text-gray-400">- {MAIN_STAT_VALUES[ms]?.icon} {MAIN_STAT_VALUES[ms]?.name}</div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Sub stats reference */}
            <div className="p-3 rounded-xl bg-gray-800/20 border border-gray-700/20">
              <div className="text-[10px] text-gray-500 font-bold uppercase mb-2">Sub-stats possibles</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
                {SUB_STAT_POOL.map(s => (
                  <div key={s.id} className="text-[10px] text-gray-400 flex justify-between px-2 py-1 rounded bg-gray-800/40">
                    <span>{s.name}</span>
                    <span className="text-gray-600">{s.range[0]}-{s.range[1]}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-4">
                {Object.entries(RARITY_SUB_COUNT).map(([r, v]) => (
                  <div key={r} className="text-[9px] text-gray-500">
                    <span className={RARITY_CONFIG[r]?.color}>{RARITY_CONFIG[r]?.label}</span> : {v.initial} sub{v.initial > 1 ? 's' : ''} (max {v.max})
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Set Detail Modal */}
          <AnimatePresence>
            {selectedSet && (
              <motion.div key={selectedSet.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={e => { if (e.target === e.currentTarget) setSelectedSet(null); }}>
                <div className="w-full max-w-lg bg-[#12121f] border border-gray-700/40 rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
                  {(() => {
                    const s = selectedSet;
                    const count = setCount[s.id] || 0;
                    const srcLabel = { base: 'Colosseum', raid: 'Raid', arc2: 'ARC II', ultime: 'Ultime' }[s.source];
                    const srcColor = { base: 'text-blue-400 bg-blue-500/15 border-blue-500/30', raid: 'text-pink-400 bg-pink-500/15 border-pink-500/30', arc2: 'text-amber-400 bg-amber-500/15 border-amber-500/30', ultime: 'text-red-400 bg-red-500/15 border-red-500/30' }[s.source];

                    return (
                      <>
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl border ${s.border} ${s.bg}`}>{s.icon}</div>
                          <div className="flex-1">
                            <h2 className={`text-lg font-black ${s.color}`}>{s.name}</h2>
                            <p className="text-[11px] text-gray-500 mt-0.5">{s.desc}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${srcColor}`}>{srcLabel}</span>
                              {count > 0 && <span className="text-[10px] text-green-400 font-bold">x{count} possede{count > 1 ? 's' : ''}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Bonus breakdown */}
                        <div className="mb-4 space-y-2">
                          <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Bonus de Set</div>
                          <div className="p-2.5 rounded-lg bg-green-500/5 border border-green-500/20">
                            <div className="text-[10px] text-green-400 font-bold">2 Pieces</div>
                            <div className="text-[11px] text-green-300 mt-0.5">{s.bonus2Desc}</div>
                          </div>
                          <div className="p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/20">
                            <div className="text-[10px] text-blue-400 font-bold">4 Pieces</div>
                            <div className="text-[11px] text-blue-300 mt-0.5">{s.bonus4Desc}</div>
                          </div>
                          {s.bonus8Desc && (
                            <div className="p-2.5 rounded-lg bg-orange-500/5 border border-orange-500/20">
                              <div className="text-[10px] text-orange-400 font-bold">8 Pieces</div>
                              <div className="text-[11px] text-orange-300 mt-0.5">{s.bonus8Desc}</div>
                            </div>
                          )}
                        </div>

                        {/* Where to obtain */}
                        <div className="mb-4 p-3 rounded-xl bg-gray-800/30 border border-gray-700/20">
                          <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Ou obtenir</div>
                          {s.source === 'base' && (
                            <div className="text-[11px] text-gray-300">
                              {'\u2694\uFE0F'} Drop en victoire Colosseum ARC I (tous tiers, toutes difficultes). Drop aussi en boutique (100-500 coins).
                            </div>
                          )}
                          {s.source === 'raid' && (
                            <div className="text-[11px] text-gray-300">
                              {'\uD83D\uDC51'} Drop exclusif en mode <span className="text-pink-400 font-bold">Raid</span>. Les tiers plus eleves donnent de meilleures chances et raretes.
                            </div>
                          )}
                          {s.source === 'arc2' && (
                            <div className="text-[11px] text-gray-300">
                              {'\uD83D\uDD25'} Drop en victoire Colosseum <span className="text-amber-400 font-bold">ARC II</span>. Sub-stats +30% superieures aux sets classiques.
                            </div>
                          )}
                          {s.source === 'ultime' && (
                            <div className="text-[11px] text-gray-300">
                              {'\uD83D\uDCA0'} <span className="text-red-400 font-bold">Drop universel</span> — 5 tirages x 0.5% par victoire. Disponible partout : ARC I, ARC II, Raid Manaya. Sets les plus puissants du jeu.
                            </div>
                          )}
                        </div>

                        {/* Passives info (if any) */}
                        {(s.passive2 || s.passive4 || s.passive8) && (
                          <div className="mb-4 p-3 rounded-xl bg-purple-500/5 border border-purple-500/20">
                            <div className="text-[10px] text-purple-400 font-bold uppercase mb-1">Passives Mecaniques</div>
                            {s.passive2 && <div className="text-[10px] text-purple-300 mb-1">2p : Trigger "{s.passive2.type}" — {s.passive2.trigger}</div>}
                            {s.passive4 && <div className="text-[10px] text-purple-300 mb-1">4p : Trigger "{s.passive4.type}" — {s.passive4.trigger}</div>}
                            {s.passive8 && <div className="text-[10px] text-purple-300">8p : Trigger "{s.passive8.type}" — {s.passive8.trigger}</div>}
                          </div>
                        )}

                        {/* Available slots */}
                        <div className="mb-4">
                          <div className="text-[10px] text-gray-500 font-bold uppercase mb-1.5">Slots disponibles</div>
                          <div className="flex flex-wrap gap-1.5">
                            {SLOT_ORDER.map(slotId => {
                              const sl = ARTIFACT_SLOTS[slotId];
                              return (
                                <span key={slotId} className="text-[10px] px-2 py-1 rounded-lg bg-gray-800/40 border border-gray-700/20 text-gray-400">
                                  {sl.icon} {sl.name}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        <button onClick={() => setSelectedSet(null)}
                          className="w-full py-2 rounded-xl bg-gray-800/60 border border-gray-700/30 text-sm font-bold text-gray-400 hover:text-white hover:border-purple-500/40 transition-all">
                          Fermer
                        </button>
                      </>
                    );
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ═══ MECHANICS TAB ═══ */}
      {activeTab === 'mechanics' && (
        <div className="space-y-4">
          {/* ─── Sub-tab pills ─── */}
          <div className="flex flex-wrap gap-1.5">
            {ALL_MECHANICS_TABS.map(tab => (
              <button key={tab.id} onClick={() => setMechSubTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  mechSubTab === tab.id
                    ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40'
                    : 'bg-gray-800/40 text-gray-500 border border-gray-700/20 hover:text-gray-300 hover:border-gray-600/40'
                }`}>
                <span className="mr-1">{tab.icon}</span>{tab.label}
              </button>
            ))}
          </div>

          {/* ─── Dynamic section renderer ─── */}
          {ALL_MECHANICS_TABS.filter(t => t.id === mechSubTab).map(tab => (
            <div key={tab.id} className="space-y-4">
              {tab.sections.map((section, si) => {
                const colorMap = {
                  violet: { bg: 'bg-violet-900/20', border: 'border-violet-500/30', title: 'text-violet-400', label: 'text-violet-400' },
                  emerald: { bg: 'bg-emerald-900/20', border: 'border-emerald-500/30', title: 'text-emerald-400', label: 'text-emerald-400' },
                  amber: { bg: 'bg-amber-900/20', border: 'border-amber-500/30', title: 'text-amber-400', label: 'text-amber-400' },
                  red: { bg: 'bg-red-900/20', border: 'border-red-500/30', title: 'text-red-400', label: 'text-red-400' },
                  blue: { bg: 'bg-blue-900/20', border: 'border-blue-500/30', title: 'text-blue-400', label: 'text-blue-400' },
                  green: { bg: 'bg-green-900/20', border: 'border-green-500/30', title: 'text-green-400', label: 'text-green-400' },
                  cyan: { bg: 'bg-cyan-900/20', border: 'border-cyan-500/30', title: 'text-cyan-400', label: 'text-cyan-400' },
                  purple: { bg: 'bg-purple-900/20', border: 'border-purple-500/30', title: 'text-purple-400', label: 'text-purple-400' },
                };
                const c = section.color ? colorMap[section.color] : { bg: 'bg-gray-800/30', border: 'border-gray-700/30', title: 'text-purple-400', label: 'text-gray-500' };

                return (
                  <div key={si} className={`${c.bg} border ${c.border} rounded-2xl p-4`}>
                    <h2 className={`text-base font-black ${c.title} mb-3`}>{section.title}</h2>

                    {/* Stat items (Stats de Base style) */}
                    {section.items && (
                      <div className="space-y-2 text-sm text-gray-300">
                        {section.items.map((item, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className={`${item.color} font-bold w-14 shrink-0 text-xs`}>{item.stat}</span>
                            <span className="text-[12px]">
                              {item.desc}
                              {item.formula && <> — <code className="text-cyan-300 bg-gray-900/60 px-1 rounded text-[11px]">{item.formula}</code></>}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Description text */}
                    {section.desc && (
                      <p className="text-sm text-gray-300 mb-2">{section.desc}</p>
                    )}

                    {/* Points grid (Allocation style) */}
                    {section.points && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                        {section.points.map((p, i) => (
                          <div key={i} className="flex items-center gap-2 bg-gray-900/40 rounded-lg px-2 py-1.5">
                            <span className={`font-bold text-xs ${p.color}`}>{p.stat}</span>
                            <span className="text-xs text-gray-400">{p.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Text lines */}
                    {section.lines && (
                      <div className="space-y-1.5 text-[12px] text-gray-300">
                        {section.lines.map((line, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className={`${c.label} mt-0.5 shrink-0`}>•</span>
                            <span>{line}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Formula blocks */}
                    {section.formulas && (
                      <div className="space-y-2 mt-1">
                        {section.formulas.map((f, i) => (
                          <div key={i}>
                            <div className={`text-[10px] ${c.label} font-bold uppercase mb-0.5`}>{f.label}</div>
                            <code className="block text-cyan-300 bg-gray-900/60 px-3 py-1.5 rounded-lg text-[11px]">{f.formula}</code>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tables */}
                    {section.table && (
                      <div className="overflow-x-auto mt-1">
                        <table className="w-full text-[11px]">
                          <thead>
                            <tr className="border-b border-gray-700/40">
                              {section.table.headers.map((h, i) => (
                                <th key={i} className={`py-1.5 px-2 text-left font-bold ${c.title}`}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {section.table.rows.map((row, ri) => (
                              <tr key={ri} className="border-b border-gray-800/30 hover:bg-gray-800/20">
                                {row.map((cell, ci) => (
                                  <td key={ci} className={`py-1 px-2 ${ci === 0 ? 'font-bold text-gray-200' : 'text-gray-400'}`}>{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* ═══ EXPEDITION TAB ═══ */}
      {activeTab === 'expedition' && (
        <div className="space-y-8">

          {/* ─── Section: SETS ─── */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-red-400 mb-3 flex items-center gap-2">
              Sets Expedition (25)
              {Object.keys(ownedExpSets).length > 0 && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-900/30 text-green-400 normal-case tracking-normal">
                  {Object.keys(ownedExpSets).length}/25 obtenus
                </span>
              )}
            </div>

            {/* Big Sets */}
            <div className="text-[10px] font-bold uppercase tracking-wider text-yellow-400 mb-2 mt-4">Gros Sets (10) — Passifs puissants, class-specific</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {Object.values(EXPEDITION_SETS).filter(s => s.big).map(s => {
                const owned = ownedExpSets[s.id] || 0;
                return (
                <div key={s.id} className={`p-3.5 rounded-xl border text-left ${s.border} ${s.bg} ${owned === 0 ? 'opacity-40' : ''} transition-opacity`}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-bold ${s.color} flex items-center gap-2`}>
                        {s.name}
                        {owned > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-900/40 text-green-400 font-medium">{owned}p</span>}
                      </div>
                      <div className="text-[10px] text-gray-500">{s.desc}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {s.targetClass.map(c => (
                      <span key={c} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800/60 text-gray-400 font-medium">{c}</span>
                    ))}
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                      s.rarity === 'legendaire' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-purple-900/30 text-purple-400'
                    }`}>{s.rarity}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800/60 text-gray-500">{s.zone}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800/60 text-gray-500">{s.binding}</span>
                  </div>
                  <div className="mt-2 space-y-0.5">
                    <div className={`text-[10px] ${owned >= 2 ? 'text-green-400' : 'text-green-400/40'}`}>2p : {s.bonus2Desc}</div>
                    <div className={`text-[10px] ${owned >= 4 ? 'text-blue-400' : 'text-blue-400/40'}`}>4p : {s.bonus4Desc}</div>
                  </div>
                </div>
                );
              })}
            </div>

            {/* Medium Sets by zone */}
            {['foret', 'abysses', 'neant'].map(zone => {
              const zoneSets = Object.values(EXPEDITION_SETS).filter(s => !s.big && s.zone === zone);
              if (zoneSets.length === 0) return null;
              const zoneLabel = { foret: 'Foret (Boss 1-5)', abysses: 'Abysses (Boss 6-10)', neant: 'Neant (Boss 11-15)' }[zone];
              const zoneColor = { foret: 'text-green-400', abysses: 'text-cyan-400', neant: 'text-purple-400' }[zone];
              return (
                <div key={zone} className="mb-6">
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${zoneColor} mb-2`}>Sets Moyens — {zoneLabel}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {zoneSets.map(s => {
                      const owned = ownedExpSets[s.id] || 0;
                      return (
                      <div key={s.id} className={`p-3 rounded-xl border text-left ${s.border} ${s.bg} ${owned === 0 ? 'opacity-40' : ''} transition-opacity`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{s.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className={`text-[11px] font-bold ${s.color} flex items-center gap-2`}>
                              {s.name}
                              {owned > 0 && <span className="text-[9px] px-1 py-0.5 rounded bg-green-900/40 text-green-400 font-medium">{owned}p</span>}
                            </div>
                            <div className="text-[9px] text-gray-500">{s.desc}</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {s.targetClass.map(c => (
                            <span key={c} className="text-[9px] px-1 py-0.5 rounded bg-gray-800/60 text-gray-400">{c}</span>
                          ))}
                          <span className={`text-[9px] px-1 py-0.5 rounded ${
                            s.rarity === 'epique' ? 'bg-purple-900/30 text-purple-300' : 'bg-blue-900/30 text-blue-300'
                          }`}>{s.rarity}</span>
                        </div>
                        <div className="mt-1.5 space-y-0.5">
                          <div className={`text-[10px] ${owned >= 2 ? 'text-green-400' : 'text-green-400/40'}`}>2p : {s.bonus2Desc}</div>
                          <div className={`text-[10px] ${owned >= 4 ? 'text-blue-400' : 'text-blue-400/40'}`}>4p : {s.bonus4Desc}</div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ─── Section: WEAPONS ─── */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-red-400 mb-3 flex items-center gap-2">
              Armes Expedition ({Object.keys(EXPEDITION_WEAPONS).length})
              {ownedExpWeapons.size > 0 && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-900/30 text-green-400 normal-case tracking-normal">
                  {ownedExpWeapons.size}/{Object.keys(EXPEDITION_WEAPONS).length} obtenues
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.values(EXPEDITION_WEAPONS).sort((a, b) => b.atk - a.atk).map(w => {
                const elColor = { fire: 'text-orange-400', water: 'text-cyan-400', shadow: 'text-purple-400', light: 'text-yellow-300' }[w.element] || 'text-gray-400';
                const owned = ownedExpWeapons.has(w.id);
                return (
                  <div key={w.id} className={`p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-left ${owned ? '' : 'opacity-40'} transition-opacity`}>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{w.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-red-400 flex items-center gap-2">
                          {w.name}
                          {owned && <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-900/40 text-green-400 font-medium">Obtenue</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-300">ATK {w.atk}</span>
                          <span className={`text-[10px] ${elColor}`}>{w.element}</span>
                          <span className="text-[10px] text-gray-500">{w.weaponType}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-900/30 text-red-300">{w.rarity}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-amber-400">Bonus: {w.bonusDesc}</div>
                    <div className="mt-1 text-[10px] text-blue-300">Passif: {w.passiveDesc}</div>
                    <div className="mt-1 text-[9px] text-gray-500">
                      Drop: Boss {w.dropBoss + 1} ({w.dropBossName}) — {w.dropChance}% | {w.binding}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Section: UNIQUE ARTIFACTS ─── */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-red-400 mb-3 flex items-center gap-2">
              Artefacts Uniques (20)
              {ownedExpUniques.size > 0 && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-900/30 text-green-400 normal-case tracking-normal">
                  {ownedExpUniques.size}/20 obtenus
                </span>
              )}
            </div>
            {[1, 2, 3].map(tier => {
              const tierUniques = Object.values(EXPEDITION_UNIQUES).filter(u => u.tier === tier);
              if (tierUniques.length === 0) return null;
              const tierLabel = { 1: 'Tier 1 — Premiers pas (Boss 1-3)', 2: 'Tier 2 — Progression (Boss 4-8)', 3: 'Tier 3 — Endgame (Boss 9-15)' }[tier];
              const tierColor = { 1: 'text-green-400', 2: 'text-blue-400', 3: 'text-amber-400' }[tier];
              return (
                <div key={tier} className="mb-6">
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${tierColor} mb-2`}>{tierLabel}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {tierUniques.map(u => {
                      const owned = ownedExpUniques.has(u.id);
                      return (
                      <div key={u.id} className={`p-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-left ${owned ? '' : 'opacity-40'} transition-opacity`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{u.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className={`text-[11px] font-bold ${u.color} flex items-center gap-2`}>
                              {u.name}
                              {owned && <span className="text-[9px] px-1 py-0.5 rounded bg-green-900/40 text-green-400 font-medium">Obtenu</span>}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] text-gray-500">{u.slot}</span>
                              <span className="text-[9px] px-1 py-0.5 rounded bg-yellow-900/30 text-yellow-400">{u.rarity}</span>
                              <span className="text-[9px] text-gray-600">{u.binding}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-1.5 text-[10px] text-amber-300">Stats: {u.statsDesc}</div>
                        <div className="mt-0.5 text-[10px] text-blue-300">Passif: {u.passiveDesc}</div>
                        <div className="mt-1 text-[9px] text-gray-500 italic">Obtention: {u.achievementDesc}</div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ─── Section: ESSENCES ─── */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-red-400 mb-3">Essences (3 types)</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {EXPEDITION_ESSENCES.map(e => (
                <div key={e.id} className={`p-3 rounded-xl border border-gray-700/30 ${e.bg}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{e.icon}</span>
                    <span className={`text-sm font-bold ${e.color}`}>{e.name}</span>
                  </div>
                  <div className="text-[10px] text-gray-300">{e.desc}</div>
                  <div className="text-[9px] text-gray-500 mt-1">{e.dropRate}</div>
                </div>
              ))}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Echange PNJ Forgeron</div>
            <div className="flex flex-wrap gap-2">
              {ESSENCE_EXCHANGE.map(ex => (
                <div key={ex.item} className="px-3 py-1.5 rounded-lg bg-gray-800/40 border border-gray-700/20 text-[10px] text-gray-300">
                  {ex.icon} {ex.item} — <span className="text-amber-400">{ex.cost} essences</span>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Section: BOSS CODEX (DokkanDB style) ─── */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-red-400 mb-3">Boss d'Expedition</div>

            {selectedBoss === null ? (
              /* ═══ MODE GRILLE ═══ */
              <>
                {/* Zone filter pills */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {['all', 'Foret', 'Abysses', 'Neant'].map(z => (
                    <button key={z} onClick={() => setBossZoneFilter(z)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                        bossZoneFilter === z
                          ? 'bg-purple-600/30 border border-purple-500/50 text-purple-300'
                          : 'bg-gray-800/40 border border-gray-700/30 text-gray-500 hover:text-gray-300'
                      }`}>
                      {z === 'all' ? 'Tous (15)' : `${z} (${EXPEDITION_BOSSES.filter(b => b.zone === z).length})`}
                    </button>
                  ))}
                </div>

                {/* Boss grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {EXPEDITION_BOSSES.filter(b => bossZoneFilter === 'all' || b.zone === bossZoneFilter).map(b => {
                    const zs = ZONE_STYLES[b.zone];
                    return (
                      <button key={b.idx} onClick={() => setSelectedBoss(b.idx)}
                        className={`text-left rounded-xl overflow-hidden border ${zs.border} hover:scale-[1.02] transition-all duration-200 hover:shadow-lg`}>
                        <div className={`bg-gradient-to-r ${zs.gradient} px-3 py-2 flex items-center gap-2`}>
                          <span className="text-lg">{b.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500 text-[10px] font-bold">#{b.idx + 1}</span>
                              <span className="text-white text-[11px] font-bold truncate">{b.name}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded ${zs.bg} ${zs.color} font-medium`}>{b.zone}</span>
                              {b.phases.length > 0 && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-medium">{b.phases.length} Phase{b.phases.length > 1 ? 's' : ''}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-900/40 px-3 py-2 flex gap-4 text-[10px]">
                          <span className="text-red-400 font-bold">{b.hpDisplay} HP</span>
                          <span className="text-orange-400">{b.atk.toLocaleString()} ATK</span>
                          <span className="text-blue-400">{b.def} DEF</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              /* ═══ MODE FICHE DETAILLEE ═══ */
              (() => {
                const boss = EXPEDITION_BOSSES[selectedBoss];
                if (!boss) return null;
                const zs = ZONE_STYLES[boss.zone];
                return (
                  <div>
                    {/* Navigation */}
                    <div className="flex items-center gap-3 mb-4">
                      <button onClick={() => setSelectedBoss(null)}
                        className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition-colors">
                        <ChevronLeft className="w-4 h-4" /> Tous les boss
                      </button>
                      <div className="flex-1" />
                      <button onClick={() => setSelectedBoss(Math.max(0, selectedBoss - 1))}
                        disabled={selectedBoss === 0}
                        className="p-1.5 rounded-lg bg-gray-800/40 border border-gray-700/30 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-[11px] text-gray-400 font-bold">{selectedBoss + 1} / 15</span>
                      <button onClick={() => setSelectedBoss(Math.min(14, selectedBoss + 1))}
                        disabled={selectedBoss === 14}
                        className="p-1.5 rounded-lg bg-gray-800/40 border border-gray-700/30 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Boss Card */}
                    <div className={`rounded-xl overflow-hidden border ${zs.border} bg-gray-900/60`}>
                      {/* Header */}
                      <div className={`bg-gradient-to-r ${zs.gradient} px-4 py-3`}>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{boss.icon}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400 text-sm font-bold">#{boss.idx + 1}</span>
                              <span className="text-white text-lg font-black">{boss.name}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[10px] px-2 py-0.5 rounded ${zs.bg} ${zs.color} font-medium`}>{boss.zone}</span>
                              <span className="text-[10px] text-gray-400">Regen: {boss.regenPct}%/s</span>
                              <span className="text-[10px] text-gray-400">Enrage: {boss.enrageTimer}s{boss.enrageHpPct > 0 ? ` ou ${boss.enrageHpPct}% HP` : ''}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="px-4 py-3 border-b border-gray-700/30">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Stats</div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-gray-800/40 rounded-lg px-3 py-2 text-center">
                            <div className="text-[9px] text-gray-500">HP</div>
                            <div className="text-sm font-black text-red-400">{boss.hpDisplay}</div>
                          </div>
                          <div className="bg-gray-800/40 rounded-lg px-3 py-2 text-center">
                            <div className="text-[9px] text-gray-500">ATK</div>
                            <div className="text-sm font-black text-orange-400">{boss.atk.toLocaleString()}</div>
                          </div>
                          <div className="bg-gray-800/40 rounded-lg px-3 py-2 text-center">
                            <div className="text-[9px] text-gray-500">DEF</div>
                            <div className="text-sm font-black text-blue-400">{boss.def}</div>
                          </div>
                          <div className="bg-gray-800/40 rounded-lg px-3 py-2 text-center">
                            <div className="text-[9px] text-gray-500">SPD</div>
                            <div className="text-sm font-black text-teal-400">{boss.spd}</div>
                          </div>
                          <div className="bg-gray-800/40 rounded-lg px-3 py-2 text-center">
                            <div className="text-[9px] text-gray-500">Auto-ATK</div>
                            <div className="text-sm font-black text-gray-300">{boss.autoAtkPower}%</div>
                          </div>
                          <div className="bg-gray-800/40 rounded-lg px-3 py-2 text-center">
                            <div className="text-[9px] text-gray-500">Regen/s</div>
                            <div className="text-sm font-black text-emerald-400">{boss.regenPct}%</div>
                          </div>
                        </div>
                      </div>

                      {/* Patterns & Attacks */}
                      <div className="px-4 py-3 border-b border-gray-700/30">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Patterns & Attaques</div>
                        <div className="space-y-2">
                          {boss.patterns.map((p, i) => {
                            const meta = ATTACK_TYPE_META[p.type] || { label: p.type, color: 'text-gray-400', border: 'border-gray-500/50', bg: 'bg-gray-500/10' };
                            return (
                              <div key={i} className={`rounded-lg bg-gray-800/30 border-l-2 ${meta.border} px-3 py-2`}>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[11px] font-bold text-white">{p.name}</span>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${meta.bg} ${meta.color}`}>{meta.label}</span>
                                  {p.damage > 0 && <span className="text-[9px] text-red-400 font-medium">DMG: {p.damage}</span>}
                                  {p.healPercent && <span className="text-[9px] text-emerald-400 font-medium">Heal: {p.healPercent}%</span>}
                                  {p.hitCount && <span className="text-[9px] text-amber-400 font-medium">{p.hitCount} hits</span>}
                                  {p.antiHealPct && <span className="text-[9px] text-rose-400 font-medium">Anti-Heal: {p.antiHealPct}%</span>}
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-[9px] text-gray-500">
                                  <span>CD: {p.cooldown}s</span>
                                  {p.telegraphTime && <span>Telegraph: {p.telegraphTime}s</span>}
                                  {p.range && <span>Portee: {p.range}px</span>}
                                  {p.aoeRadius && <span>Rayon: {p.aoeRadius}px</span>}
                                  {p.summonCount && <span>Invoque: {p.summonCount}x {p.summonType}</span>}
                                  {p.duration && <span>Duree: {p.duration}s</span>}
                                </div>
                                <div className="text-[10px] text-gray-400 mt-1">{p.description}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Phases */}
                      <div className="px-4 py-3">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Phases Speciales</div>
                        {boss.phases.length === 0 ? (
                          <div className="text-[11px] text-gray-600 italic py-2">Ce boss n'a pas de phases speciales</div>
                        ) : (
                          <div className="space-y-2">
                            {boss.phases.map((phase, pi) => (
                              <div key={phase.id} className="rounded-lg bg-gray-800/30 border border-amber-500/30 px-3 py-2">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">Phase {pi + 1}</span>
                                  <span className="text-[10px] text-amber-300 font-medium">HP &le; {phase.threshold}%</span>
                                </div>
                                {/* Multipliers */}
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {phase.atkMult && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">ATK x{phase.atkMult}</span>}
                                  {phase.spdMult && <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400">SPD x{phase.spdMult}</span>}
                                  {phase.regenMult && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Regen x{phase.regenMult}</span>}
                                  {phase.antiHealPct > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400">Anti-Heal {phase.antiHealPct}%</span>}
                                </div>
                                {/* Phase patterns */}
                                {phase.patterns.map((p, i) => {
                                  const meta = ATTACK_TYPE_META[p.type] || { label: p.type, color: 'text-gray-400', border: 'border-gray-500/50', bg: 'bg-gray-500/10' };
                                  return (
                                    <div key={i} className={`rounded bg-gray-900/40 border-l-2 ${meta.border} px-2.5 py-1.5 mt-1.5`}>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-[10px] font-bold text-white">{p.name}</span>
                                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-medium ${meta.bg} ${meta.color}`}>{meta.label}</span>
                                        {p.damage > 0 && <span className="text-[9px] text-red-400">DMG: {p.damage}</span>}
                                        {p.hitCount && <span className="text-[9px] text-amber-400">{p.hitCount} hits</span>}
                                        {p.antiHealPct && <span className="text-[9px] text-rose-400">Anti-Heal: {p.antiHealPct}%</span>}
                                      </div>
                                      <div className="text-[9px] text-gray-400 mt-0.5">{p.description}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>

        </div>
      )}

      {/* ═══════════════ CHANGELOG ═══════════════ */}
      {activeTab === 'changelog' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ScrollText size={20} className="text-amber-400" />
            Derniers Changements
          </h2>
          <p className="text-gray-400 text-sm">Historique des mises a jour du Shadow Colosseum et de l'Expedition.</p>

          <div className="space-y-4 mt-4">
            {CHANGELOG.map((patch, pi) => (
              <div key={pi} className="bg-gray-900/60 border border-gray-700/40 rounded-xl overflow-hidden">
                {/* Patch header */}
                <div className="px-4 py-3 bg-gradient-to-r from-amber-900/30 to-transparent border-b border-gray-700/30 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-md">v{patch.version}</span>
                    <span className="text-white font-semibold text-sm">{patch.title}</span>
                  </div>
                  <span className="text-gray-500 text-xs">{patch.date}</span>
                </div>

                {/* Categories */}
                <div className="p-4 space-y-3">
                  {patch.entries.map((entry, ei) => {
                    const cat = CHANGELOG_CATEGORIES[entry.category] || CHANGELOG_CATEGORIES.new;
                    return (
                      <div key={ei}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`${cat.bg} ${cat.border} border ${cat.color} text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide`}>
                            {cat.icon} {cat.label}
                          </span>
                        </div>
                        <ul className="space-y-1 ml-1">
                          {entry.items.map((item, ii) => (
                            <li key={ii} className="flex items-start gap-2 text-sm text-gray-300">
                              <span className={`${cat.color} mt-1 text-[8px]`}>●</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
