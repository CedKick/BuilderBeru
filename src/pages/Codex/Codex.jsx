import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, Filter, Swords, BookOpen, ArrowLeft } from 'lucide-react';
import { WEAPONS, WEAPON_AWAKENING_PASSIVES, MAX_WEAPON_AWAKENING, getWeaponAwakeningBonuses, computeWeaponBonuses } from '../ShadowColosseum/equipmentData';

// ═══════════════════════════════════════════════════════════════
// CODEX — Encyclopedie du Shadow Colosseum
// Onglet Weapons : toutes les armes, stats A0→A10, filtres
// ═══════════════════════════════════════════════════════════════

const SAVE_KEY = 'shadow_colosseum_data';

// Weapon sprites (Cloudinary)
const WEAPON_SPRITES = {
  w_sulfuras: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1771443640/WeaponSulfuras_efg3ca.png',
};

const ELEMENT_CONFIG = {
  fire:   { label: 'Feu',    color: 'text-orange-400', bg: 'bg-orange-500/15', border: 'border-orange-500/30', icon: '🔥' },
  water:  { label: 'Eau',    color: 'text-cyan-400',   bg: 'bg-cyan-500/15',   border: 'border-cyan-500/30',   icon: '💧' },
  wind:   { label: 'Vent',   color: 'text-green-400',  bg: 'bg-green-500/15',  border: 'border-green-500/30',  icon: '🌿' },
  shadow: { label: 'Ombre',  color: 'text-purple-400', bg: 'bg-purple-500/15', border: 'border-purple-500/30', icon: '🌑' },
  null:   { label: 'Neutre', color: 'text-gray-400',   bg: 'bg-gray-500/15',   border: 'border-gray-500/30',   icon: '⚪' },
};

const WEAPON_TYPE_CONFIG = {
  blade:   { label: 'Lame',    icon: '⚔️' },
  heavy:   { label: 'Lourde',  icon: '🔨' },
  polearm: { label: 'Lance',   icon: '🗡️' },
  ranged:  { label: 'Distance', icon: '🏹' },
  shield:  { label: 'Bouclier', icon: '🛡️' },
};

const RARITY_CONFIG = {
  rare:       { label: 'Rare',      color: 'text-blue-400',   bg: 'bg-blue-500/15',   border: 'border-blue-500/40',   glow: 'shadow-blue-500/20' },
  legendaire: { label: 'Legendaire', color: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'border-yellow-500/40', glow: 'shadow-yellow-500/20' },
  mythique:   { label: 'Mythique',   color: 'text-red-400',    bg: 'bg-red-500/15',    border: 'border-red-500/40',    glow: 'shadow-red-500/20' },
};

const STAT_LABELS = {
  atk_flat: 'ATK',
  atk_pct: 'ATK%',
  def_pct: 'DEF%',
  hp_pct: 'PV%',
  spd_flat: 'SPD',
  crit_rate: 'CRIT%',
  crit_dmg: 'CRIT DMG%',
  res_flat: 'RES',
  fireDamage: 'DMG Feu%',
  waterDamage: 'DMG Eau%',
  shadowDamage: 'DMG Ombre%',
  allDamage: 'Tous DMG%',
  defPen: 'PEN DEF%',
};

// Item level calculation
function computeWeaponILevel(weapon, awakening) {
  const rarityBase = { rare: 10, legendaire: 25, mythique: 50 };
  const base = rarityBase[weapon.rarity] || 10;
  return base + (awakening * 5);
}

// Sort weapons by element then rarity
const RARITY_ORDER = { mythique: 3, legendaire: 2, rare: 1 };
const ELEMENT_ORDER = { fire: 0, water: 1, wind: 2, shadow: 3, null: 4 };

export default function Codex() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('weapons');
  const [search, setSearch] = useState('');
  const [filterElement, setFilterElement] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [selectedWeapon, setSelectedWeapon] = useState(null);
  const [viewAwakening, setViewAwakening] = useState(0);

  // Load weapon collection from colosseum save
  const [weaponCollection, setWeaponCollection] = useState({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        setWeaponCollection(d.weaponCollection || {});
      }
    } catch {}
  }, []);

  // All weapons as sorted array
  const allWeapons = useMemo(() => {
    return Object.values(WEAPONS).sort((a, b) => {
      const eA = ELEMENT_ORDER[a.element] ?? 99;
      const eB = ELEMENT_ORDER[b.element] ?? 99;
      if (eA !== eB) return eA - eB;
      const rA = RARITY_ORDER[a.rarity] || 0;
      const rB = RARITY_ORDER[b.rarity] || 0;
      if (rA !== rB) return rB - rA;
      return a.name.localeCompare(b.name);
    });
  }, []);

  // Filtered weapons
  const filteredWeapons = useMemo(() => {
    return allWeapons.filter(w => {
      if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterElement !== 'all' && String(w.element) !== filterElement) return false;
      if (filterType !== 'all' && w.weaponType !== filterType) return false;
      if (filterRarity !== 'all' && w.rarity !== filterRarity) return false;
      return true;
    });
  }, [allWeapons, search, filterElement, filterType, filterRarity]);

  const owned = (id) => weaponCollection[id] !== undefined;
  const getAwakening = (id) => weaponCollection[id] || 0;

  // Stats for selected weapon at viewAwakening
  const selectedStats = useMemo(() => {
    if (!selectedWeapon) return null;
    return computeWeaponBonuses(selectedWeapon.id, viewAwakening);
  }, [selectedWeapon, viewAwakening]);

  const selectedPassives = useMemo(() => {
    if (!selectedWeapon) return [];
    const p = WEAPON_AWAKENING_PASSIVES[selectedWeapon.id] || [];
    return p.slice(0, 5);
  }, [selectedWeapon]);

  // Beru react on mount
  useEffect(() => {
    try {
      window.dispatchEvent(new CustomEvent('beru-react', {
        detail: { message: "Le Codex ! Toutes les connaissances de l'Ombre sont ici.", mood: 'proud' }
      }));
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white px-3 py-4 md:px-6 md:py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/shadow-colosseum')}
          className="p-2 rounded-lg bg-gray-800/60 border border-gray-700/30 hover:border-purple-500/40 hover:bg-gray-700/40 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>
        <BookOpen className="w-7 h-7 text-purple-400" />
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">
          <span className="text-purple-400">CODEX</span>
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setTab('weapons')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            tab === 'weapons'
              ? 'bg-purple-600/30 border border-purple-500/50 text-purple-300'
              : 'bg-gray-800/40 border border-gray-700/30 text-gray-500 hover:text-gray-300'
          }`}
        >
          <Swords className="w-4 h-4" /> Armes
        </button>
        {/* Future tabs: Artifacts, Monsters, etc. */}
      </div>

      {tab === 'weapons' && (
        <>
          {/* Filters bar */}
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/40 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
              />
            </div>

            {/* Element filter */}
            <select
              value={filterElement}
              onChange={(e) => setFilterElement(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/40 text-sm text-gray-300 focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">Element</option>
              {Object.entries(ELEMENT_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
              ))}
            </select>

            {/* Type filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/40 text-sm text-gray-300 focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">Type</option>
              {Object.entries(WEAPON_TYPE_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.icon} {cfg.label}</option>
              ))}
            </select>

            {/* Rarity filter */}
            <select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/40 text-sm text-gray-300 focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">Rarete</option>
              {Object.entries(RARITY_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
          </div>

          {/* Counter */}
          <div className="text-[10px] text-gray-600 mb-3">
            {filteredWeapons.length} arme{filteredWeapons.length > 1 ? 's' : ''} — {Object.keys(weaponCollection).length}/{allWeapons.length} obtenue{Object.keys(weaponCollection).length > 1 ? 's' : ''}
          </div>

          {/* Weapons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
            {filteredWeapons.map(w => {
              const isOwned = owned(w.id);
              const aw = getAwakening(w.id);
              const rCfg = RARITY_CONFIG[w.rarity] || RARITY_CONFIG.rare;
              const eCfg = ELEMENT_CONFIG[w.element] || ELEMENT_CONFIG.null;
              const tCfg = WEAPON_TYPE_CONFIG[w.weaponType] || { label: '?', icon: '?' };
              const iLevel = computeWeaponILevel(w, aw);
              const sprite = WEAPON_SPRITES[w.id];

              return (
                <motion.button
                  key={w.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setSelectedWeapon(w); setViewAwakening(aw); }}
                  className={`relative p-3 rounded-xl border text-left transition-all ${
                    isOwned
                      ? `${rCfg.border} ${rCfg.bg} shadow-lg ${rCfg.glow}`
                      : 'border-gray-700/20 bg-gray-900/40'
                  } ${selectedWeapon?.id === w.id ? 'ring-2 ring-purple-500/60' : ''}`}
                >
                  {/* iLevel badge */}
                  <div className="absolute top-1.5 right-1.5 text-[9px] font-bold text-gray-500 bg-gray-900/80 px-1.5 py-0.5 rounded">
                    iLv {iLevel}
                  </div>

                  {/* Sprite or icon */}
                  <div className={`w-full aspect-square rounded-lg mb-2 flex items-center justify-center overflow-hidden ${
                    isOwned ? 'bg-gray-800/40' : 'bg-gray-800/20'
                  }`}>
                    {sprite ? (
                      <img
                        src={sprite}
                        alt={w.name}
                        className={`w-full h-full object-contain ${!isOwned ? 'grayscale opacity-40' : ''}`}
                      />
                    ) : (
                      <span className={`text-3xl ${!isOwned ? 'grayscale opacity-30' : ''}`}>{w.icon}</span>
                    )}
                  </div>

                  {/* Name */}
                  <div className={`text-[11px] font-bold truncate ${isOwned ? rCfg.color : 'text-gray-600'}`}>
                    {w.name}
                  </div>

                  {/* Element + Type row */}
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px]">{eCfg.icon}</span>
                    <span className="text-[10px]">{tCfg.icon}</span>
                    {w.secret && <span className="text-[9px] text-red-500 font-bold ml-auto">SECRET</span>}
                  </div>

                  {/* Awakening indicator */}
                  {isOwned && (
                    <div className="mt-1 text-[9px] font-bold text-purple-400">
                      A{aw}
                    </div>
                  )}

                  {/* Not obtained overlay */}
                  {!isOwned && (
                    <div className="absolute inset-0 rounded-xl bg-black/20 pointer-events-none" />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Weapon Detail Panel */}
          <AnimatePresence>
            {selectedWeapon && selectedStats && (
              <motion.div
                key={selectedWeapon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={(e) => { if (e.target === e.currentTarget) setSelectedWeapon(null); }}
              >
                <div className="w-full max-w-lg bg-[#12121f] border border-gray-700/40 rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
                  {(() => {
                    const w = selectedWeapon;
                    const rCfg = RARITY_CONFIG[w.rarity] || RARITY_CONFIG.rare;
                    const eCfg = ELEMENT_CONFIG[w.element] || ELEMENT_CONFIG.null;
                    const tCfg = WEAPON_TYPE_CONFIG[w.weaponType] || { label: '?', icon: '?' };
                    const isOwned = owned(w.id);
                    const iLevel = computeWeaponILevel(w, viewAwakening);
                    const sprite = WEAPON_SPRITES[w.id];

                    return (
                      <>
                        {/* Header */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden border ${rCfg.border} ${rCfg.bg}`}>
                            {sprite ? (
                              <img
                                src={sprite}
                                alt={w.name}
                                className={`w-full h-full object-contain ${!isOwned ? 'grayscale opacity-40' : ''}`}
                              />
                            ) : (
                              <span className={`text-4xl ${!isOwned ? 'grayscale opacity-30' : ''}`}>{w.icon}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h2 className={`text-lg font-black ${rCfg.color}`}>{w.name}</h2>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${rCfg.bg} ${rCfg.color} ${rCfg.border} border font-bold`}>
                                {rCfg.label}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${eCfg.bg} ${eCfg.color} ${eCfg.border} border font-bold`}>
                                {eCfg.icon} {eCfg.label}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800/60 border border-gray-700/30 text-gray-400 font-bold">
                                {tCfg.icon} {tCfg.label}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800/60 border border-gray-700/30 text-gray-400 font-bold">
                                iLv {iLevel}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-1.5 italic">{w.desc}</p>
                            {w.secret && (
                              <div className="text-[10px] text-red-400 font-bold mt-1">
                                SECRET — Drop 1/10,000 sur Ragnarok
                              </div>
                            )}
                            {!isOwned && (
                              <div className="text-[10px] text-gray-600 font-bold mt-1">
                                Non obtenu
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Awakening selector */}
                        <div className="flex items-center justify-between mb-4 bg-gray-800/40 rounded-xl px-4 py-2.5 border border-gray-700/30">
                          <button
                            onClick={() => setViewAwakening(Math.max(0, viewAwakening - 1))}
                            disabled={viewAwakening <= 0}
                            className="p-1 rounded-lg hover:bg-gray-700/40 disabled:opacity-20 transition-all"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <div className="text-center">
                            <div className="text-lg font-black text-purple-400">A{viewAwakening}</div>
                            <div className="text-[9px] text-gray-500">
                              {viewAwakening === 0 ? 'Base' : viewAwakening <= 5 ? 'Passive unique' : '+3% ATK/DEF/PV'}
                            </div>
                          </div>
                          <button
                            onClick={() => setViewAwakening(Math.min(MAX_WEAPON_AWAKENING, viewAwakening + 1))}
                            disabled={viewAwakening >= MAX_WEAPON_AWAKENING}
                            className="p-1 rounded-lg hover:bg-gray-700/40 disabled:opacity-20 transition-all"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Awakening progress dots */}
                        <div className="flex justify-center gap-1 mb-4">
                          {Array.from({ length: MAX_WEAPON_AWAKENING + 1 }, (_, i) => (
                            <button
                              key={i}
                              onClick={() => setViewAwakening(i)}
                              className={`w-2.5 h-2.5 rounded-full transition-all ${
                                i === viewAwakening
                                  ? 'bg-purple-400 scale-125'
                                  : i <= (isOwned ? getAwakening(w.id) : -1)
                                    ? 'bg-purple-600/60'
                                    : 'bg-gray-700/40'
                              }`}
                              title={`A${i}`}
                            />
                          ))}
                        </div>

                        {/* Stats table */}
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

                        {/* Awakening passives breakdown */}
                        {selectedPassives.length > 0 && (
                          <div className="mb-4">
                            <div className="text-[10px] text-gray-500 font-bold uppercase mb-2">Passives d'eveil (A1-A5)</div>
                            <div className="space-y-1">
                              {selectedPassives.map((p, i) => (
                                <div
                                  key={i}
                                  className={`flex items-center gap-2 text-[11px] px-2.5 py-1.5 rounded-lg border transition-all ${
                                    i < viewAwakening
                                      ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                                      : 'bg-gray-800/30 border-gray-700/20 text-gray-600'
                                  }`}
                                >
                                  <span className="font-bold w-6 text-center">A{i + 1}</span>
                                  <span>{p.desc}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* A6-A10 flat bonus explanation */}
                        <div className="mb-4">
                          <div className="text-[10px] text-gray-500 font-bold uppercase mb-2">Bonus A6-A10</div>
                          <div className="space-y-1">
                            {[6, 7, 8, 9, 10].map(lvl => (
                              <div
                                key={lvl}
                                className={`flex items-center gap-2 text-[11px] px-2.5 py-1.5 rounded-lg border transition-all ${
                                  lvl <= viewAwakening
                                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                                    : 'bg-gray-800/30 border-gray-700/20 text-gray-600'
                                }`}
                              >
                                <span className="font-bold w-6 text-center">A{lvl}</span>
                                <span>ATK +3%, DEF +3%, PV +3%</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Sulfuras special passive */}
                        {w.passive === 'sulfuras_fury' && (
                          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 mb-4">
                            <div className="text-[10px] text-red-400 font-bold uppercase mb-1">Passive Unique — Sulfuras Fury</div>
                            <div className="text-[11px] text-red-300">
                              +33% DMG par tour (cumulable, max +100%). La puissance augmente a chaque tour de combat.
                            </div>
                          </div>
                        )}

                        {/* Close button */}
                        <button
                          onClick={() => setSelectedWeapon(null)}
                          className="w-full py-2 rounded-xl bg-gray-800/60 border border-gray-700/30 text-sm font-bold text-gray-400 hover:text-white hover:border-purple-500/40 transition-all"
                        >
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
