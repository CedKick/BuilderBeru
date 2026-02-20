import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, Swords, BookOpen, ArrowLeft, Users, Shield } from 'lucide-react';
import { WEAPONS, WEAPON_AWAKENING_PASSIVES, MAX_WEAPON_AWAKENING, getWeaponAwakeningBonuses, computeWeaponBonuses,
  ARTIFACT_SETS, RAID_ARTIFACT_SETS, ARC2_ARTIFACT_SETS, ULTIME_ARTIFACT_SETS, ALL_ARTIFACT_SETS,
  ARTIFACT_SLOTS, SLOT_ORDER, MAIN_STAT_VALUES, SUB_STAT_POOL, RARITY_SUB_COUNT,
} from '../ShadowColosseum/equipmentData';
import { CHIBIS, SPRITES, ELEMENTS, RARITY, STAT_META } from '../ShadowColosseum/colosseumCore';
import { HUNTERS, HUNTER_PASSIVE_EFFECTS, getHunterStars } from '../ShadowColosseum/raidData';

// ═══════════════════════════════════════════════════════════════
// CODEX — Encyclopedie du Shadow Colosseum
// 3 onglets : Combattants / Armes / Artefacts
// ═══════════════════════════════════════════════════════════════

const SAVE_KEY = 'shadow_colosseum_data';
const RAID_KEY = 'shadow_colosseum_raid';

const WEAPON_SPRITES = {
  w_sulfuras: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771443640/WeaponSulfuras_efg3ca.png',
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
  shield:  { label: 'Bouclier', icon: '\uD83D\uDEE1\uFE0F' },
};

const RARITY_CONFIG = {
  rare:       { label: 'Rare',       color: 'text-blue-400',   bg: 'bg-blue-500/15',   border: 'border-blue-500/40',   glow: 'shadow-blue-500/20' },
  legendaire: { label: 'Legendaire', color: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'border-yellow-500/40', glow: 'shadow-yellow-500/20' },
  mythique:   { label: 'Mythique',   color: 'text-red-400',    bg: 'bg-red-500/15',    border: 'border-red-500/40',    glow: 'shadow-red-500/20' },
};

const STAT_LABELS = {
  atk_flat: 'ATK', atk_pct: 'ATK%', def_pct: 'DEF%', hp_pct: 'PV%',
  spd_flat: 'SPD', crit_rate: 'CRIT%', crit_dmg: 'CRIT DMG%', res_flat: 'RES',
  fireDamage: 'DMG Feu%', waterDamage: 'DMG Eau%', shadowDamage: 'DMG Ombre%',
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
];

// ═══════════════════════════════════════════════════════════════

export default function Codex() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('fighters');
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

  // ─── Load save data ───
  const [weaponCollection, setWeaponCollection] = useState({});
  const [ownedChibis, setOwnedChibis] = useState(new Set());
  const [ownedHunters, setOwnedHunters] = useState(new Set());
  const [raidDataRef, setRaidDataRef] = useState(null);
  const [artifactInventory, setArtifactInventory] = useState([]);

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
      }
    } catch {}
  }, []);

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
                      <img src={f.sprite} alt={f.name} className={`w-full h-full object-contain ${!isOwn ? 'grayscale opacity-40' : ''}`} draggable={false} />
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
                              <img src={f.sprite} alt={f.name} className={`w-full h-full object-contain ${!isOwn ? 'grayscale opacity-40' : ''}`} draggable={false} />
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
                          <div className="space-y-1.5">
                            {(f.skills || []).map((sk, i) => (
                              <div key={i} className={`p-2.5 rounded-lg border ${
                                i === 0 ? 'bg-gray-800/30 border-gray-700/20' :
                                i === 1 ? 'bg-blue-500/5 border-blue-500/20' :
                                'bg-purple-500/5 border-purple-500/20'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-white">{sk.name}</span>
                                  <div className="flex items-center gap-2">
                                    {sk.power > 0 && <span className="text-[10px] text-orange-400 font-bold">POW {sk.power}</span>}
                                    <span className="text-[10px] text-gray-500">CD {sk.cdMax || 0}</span>
                                  </div>
                                </div>
                                {sk.desc && <div className="text-[10px] text-gray-500 mt-0.5">{sk.desc}</div>}
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {sk.buffAtk && <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-400">ATK +{sk.buffAtk}% ({sk.buffDur}t)</span>}
                                  {sk.buffDef && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400">DEF +{sk.buffDef}% ({sk.buffDur}t)</span>}
                                  {sk.debuffDef && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">DEF ennemi -{sk.debuffDef}% ({sk.debuffDur}t)</span>}
                                  {sk.healSelf && <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-400">Soin {sk.healSelf}% PV max</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Hunter Passive */}
                        {f.type === 'hunter' && passive && f.passiveDesc && (
                          <div className="mb-4">
                            <div className="text-[10px] text-gray-500 font-bold uppercase mb-2">Passif</div>
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium ${PASSIVE_TYPE_COLORS[passive.type] || 'bg-gray-800/50 text-gray-300'}`}>
                              <span className="font-bold uppercase text-[8px] opacity-70 px-1 py-0.5 rounded bg-black/20">{PASSIVE_TYPE_LABELS[passive.type] || passive.type}</span>
                              <span>{f.passiveDesc}</span>
                            </div>
                          </div>
                        )}

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
                              {'\uD83C\uDFAF'} Drop aleatoire en victoire Colosseum (Tier 1-6).
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
                      <img src={sprite} alt={w.name} className={`w-full h-full object-contain ${!isOwned ? 'grayscale opacity-40' : ''}`} />
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
                              <img src={sprite} alt={w.name} className={`w-full h-full object-contain ${!isOwned ? 'grayscale opacity-40' : ''}`} />
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
                          <button onClick={() => setViewAwakening(Math.max(0, viewAwakening - 1))} disabled={viewAwakening <= 0}
                            className="p-1 rounded-lg hover:bg-gray-700/40 disabled:opacity-20 transition-all"><ChevronLeft className="w-5 h-5" /></button>
                          <div className="text-center">
                            <div className="text-lg font-black text-purple-400">A{viewAwakening}</div>
                            <div className="text-[9px] text-gray-500">{viewAwakening === 0 ? 'Base' : viewAwakening <= 5 ? 'Passive unique' : '+3% ATK/DEF/PV'}</div>
                          </div>
                          <button onClick={() => setViewAwakening(Math.min(MAX_WEAPON_AWAKENING, viewAwakening + 1))} disabled={viewAwakening >= MAX_WEAPON_AWAKENING}
                            className="p-1 rounded-lg hover:bg-gray-700/40 disabled:opacity-20 transition-all"><ChevronRight className="w-5 h-5" /></button>
                        </div>

                        <div className="flex justify-center gap-1 mb-4">
                          {Array.from({ length: MAX_WEAPON_AWAKENING + 1 }, (_, i) => (
                            <button key={i} onClick={() => setViewAwakening(i)}
                              className={`w-2.5 h-2.5 rounded-full transition-all ${
                                i === viewAwakening ? 'bg-purple-400 scale-125' : i <= (isOwned ? getAwakening(w.id) : -1) ? 'bg-purple-600/60' : 'bg-gray-700/40'
                              }`} title={`A${i}`} />
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
                                <span>ATK +3%, DEF +3%, PV +3%</span>
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
                            <div className="text-[11px] text-emerald-300">Chaque attaque empoisonne l'ennemi (3% ATK/stack/tour, max 10 stacks). 30% de chance par coup de declencher un buff aleatoire : +10% toutes stats permanent cumulable (Solo) / +5% toutes stats permanent cumulable (Raid) / Bouclier Divin (absorbe 1 coup) / Puissance x6 au prochain coup.</div>
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
                              {'\uD83D\uDCA0'} Drop exclusif en mode <span className="text-red-400 font-bold">Raid Ultime</span> (RC 3+). Taux de drop augmente avec le RC. Sets les plus puissants du jeu.
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
    </div>
  );
}
