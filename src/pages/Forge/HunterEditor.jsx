// src/pages/Forge/HunterEditor.jsx — Admin Hunter Editor (CRUD)
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Save, Plus, Trash2, Search, Shield, Sword, Heart,
  Zap, Target, Settings, AlertTriangle, ChevronDown, ChevronUp,
  RefreshCw, Users, Flame, Droplets, Wind, Mountain, Sparkles, Eye,
} from 'lucide-react';
import { API_URL } from '../../utils/api.js';
import { invalidateHuntersCache } from '../../utils/huntersCache.js';

// ── Constants ──────────────────────────────────────────────
const ELEMENTS = ['fire', 'water', 'shadow', 'light', 'wind'];
const CLASSES = ['assassin', 'fighter', 'mage', 'support', 'tank', 'healer'];
const RARITIES = ['rare', 'legendaire', 'mythique'];
const PASSIVE_TYPES = [
  'permanent', 'lowHp', 'highHp', 'firstTurn', 'teamDef', 'teamAura',
  'aoeDmg', 'healBonus', 'buffBonus', 'vsBoss', 'vsDebuffed', 'vsLowHp',
  'stacking', 'critDmg', 'magicDmg', 'defIgnore', 'dotDmg', 'debuffBonus',
  'skillCd', 'chaotic', 'berserker',
];
const STAT_KEYS = ['hp', 'atk', 'def', 'spd', 'crit', 'res', 'mana'];

const ELEMENT_ICONS = { fire: Flame, water: Droplets, shadow: Eye, light: Sparkles, wind: Wind, earth: Mountain };
const ELEMENT_COLORS = { fire: '#ef4444', water: '#3b82f6', shadow: '#a855f7', light: '#eab308', wind: '#22c55e' };
const RARITY_COLORS = { rare: '#3b82f6', legendaire: '#f59e0b', mythique: '#ef4444' };
const CLASS_ICONS = { assassin: Target, fighter: Sword, mage: Zap, support: Heart, tank: Shield, healer: Plus };

function authHeaders() {
  const token = localStorage.getItem('builderberu_auth_token');
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

// ── Default hunter template ────────────────────────────────
function createDefaultHunter() {
  return {
    hunter_id: 'h_new_hunter',
    name: '',
    element: 'fire',
    class: 'fighter',
    rarity: 'legendaire',
    series: '',
    sprite_url: '',
    passive_desc: '',
    passive_type: '',
    passive_params: {},
    base_stats: { hp: 400, atk: 45, def: 20, spd: 28, crit: 12, res: 8, mana: 120 },
    growth_stats: { hp: 14, atk: 3.2, def: 1.2, spd: 1.3, crit: 0.4, res: 0.3, mana: 0.6 },
    skills: [{ name: 'Attaque de base', power: 100, cdMax: 0 }],
    awakening_passives: {},
    special: false,
  };
}

export default function HunterEditor({ onBack }) {
  const [hunters, setHunters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // hunter_id or null
  const [editData, setEditData] = useState(null); // editable copy
  const [activeTab, setActiveTab] = useState('identity');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [search, setSearch] = useState('');
  const [filterElement, setFilterElement] = useState('all');
  const [isNew, setIsNew] = useState(false);

  // ── Load all hunters ─────────────────────────────────────
  const loadHunters = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/hunter?action=list`);
      const data = await res.json();
      if (data.success) setHunters(data.hunters || []);
    } catch (err) {
      console.warn('[HunterEditor] Failed to load:', err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadHunters(); }, [loadHunters]);

  // ── Select a hunter for editing ──────────────────────────
  const selectHunter = useCallback((h) => {
    const base = typeof h.base_stats === 'string' ? JSON.parse(h.base_stats) : h.base_stats;
    const growth = typeof h.growth_stats === 'string' ? JSON.parse(h.growth_stats) : h.growth_stats;
    const skills = typeof h.skills === 'string' ? JSON.parse(h.skills) : h.skills;
    const passiveParams = typeof h.passive_params === 'string' ? JSON.parse(h.passive_params) : (h.passive_params || {});
    const awakeningPassives = typeof h.awakening_passives === 'string' ? JSON.parse(h.awakening_passives) : (h.awakening_passives || {});
    setEditData({
      hunter_id: h.hunter_id,
      name: h.name,
      element: h.element,
      class: h.class,
      rarity: h.rarity,
      series: h.series || '',
      sprite_url: h.sprite_url || '',
      passive_desc: h.passive_desc || '',
      passive_type: h.passive_type || '',
      passive_params: passiveParams,
      awakening_passives: awakeningPassives,
      base_stats: base,
      growth_stats: growth,
      skills: skills || [],
      special: h.special || false,
    });
    setSelected(h.hunter_id);
    setIsNew(false);
    setActiveTab('identity');
    setSaveMsg(null);
  }, []);

  // ── Create new hunter ────────────────────────────────────
  const createNew = useCallback(() => {
    const def = createDefaultHunter();
    setEditData(def);
    setSelected(null);
    setIsNew(true);
    setActiveTab('identity');
    setSaveMsg(null);
  }, []);

  // ── Update field helper ──────────────────────────────────
  const update = useCallback((key, val) => setEditData(d => ({ ...d, [key]: val })), []);
  const updateBase = useCallback((key, val) => setEditData(d => ({
    ...d, base_stats: { ...d.base_stats, [key]: Number(val) || 0 },
  })), []);
  const updateGrowth = useCallback((key, val) => setEditData(d => ({
    ...d, growth_stats: { ...d.growth_stats, [key]: Number(val) || 0 },
  })), []);
  const updatePassiveParam = useCallback((key, val) => setEditData(d => ({
    ...d, passive_params: { ...d.passive_params, [key]: val },
  })), []);

  // ── Skill CRUD ───────────────────────────────────────────
  const addSkill = useCallback(() => setEditData(d => ({
    ...d, skills: [...d.skills, { name: '', power: 100, cdMax: 2 }],
  })), []);
  const removeSkill = useCallback((idx) => setEditData(d => ({
    ...d, skills: d.skills.filter((_, i) => i !== idx),
  })), []);
  const updateSkill = useCallback((idx, key, val) => setEditData(d => ({
    ...d, skills: d.skills.map((s, i) => i === idx ? { ...s, [key]: key === 'name' ? val : (Number(val) || 0) } : s),
  })), []);

  // ── Save (create or update) ──────────────────────────────
  const saveHunter = useCallback(async () => {
    if (!editData) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const action = isNew ? 'create' : 'update';
      const body = {
        hunter_id: editData.hunter_id,
        name: editData.name,
        element: editData.element,
        class: editData.class,
        rarity: editData.rarity,
        series: editData.series || null,
        sprite_url: editData.sprite_url || null,
        passive_desc: editData.passive_desc || null,
        passive_type: editData.passive_type || null,
        passive_params: editData.passive_params || {},
        awakening_passives: editData.awakening_passives || {},
        base_stats: editData.base_stats,
        growth_stats: editData.growth_stats,
        skills: editData.skills,
        special: editData.special || false,
      };
      const res = await fetch(`${API_URL}/admin/hunter?action=${action}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMsg({ type: 'success', text: isNew ? 'Hunter créé !' : 'Hunter mis à jour !' });
        invalidateHuntersCache();
        await loadHunters();
        if (isNew) {
          setSelected(editData.hunter_id);
          setIsNew(false);
        }
      } else {
        setSaveMsg({ type: 'error', text: data.error || data.details?.join(', ') || 'Erreur' });
      }
    } catch (err) {
      setSaveMsg({ type: 'error', text: err.message });
    }
    setSaving(false);
  }, [editData, isNew, loadHunters]);

  // ── Delete ───────────────────────────────────────────────
  const deleteHunter = useCallback(async () => {
    if (!selected || !confirm(`Supprimer ${editData?.name} ?`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/hunter?action=delete`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ hunter_id: selected }),
      });
      const data = await res.json();
      if (data.success) {
        invalidateHuntersCache();
        setEditData(null);
        setSelected(null);
        await loadHunters();
      }
    } catch { /* */ }
  }, [selected, editData, loadHunters]);

  // ── Filtered list ────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = hunters;
    if (filterElement !== 'all') list = list.filter(h => h.element === filterElement);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(h => h.name.toLowerCase().includes(q) || h.hunter_id.includes(q));
    }
    return list;
  }, [hunters, filterElement, search]);

  // ── Element counts ───────────────────────────────────────
  const elemCounts = useMemo(() => {
    const c = { all: hunters.length };
    hunters.forEach(h => { c[h.element] = (c[h.element] || 0) + 1; });
    return c;
  }, [hunters]);

  // ════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════
  const tabs = [
    { key: 'identity', label: 'Identité', icon: Users },
    { key: 'stats',    label: 'Stats',    icon: Shield },
    { key: 'skills',   label: 'Skills',   icon: Sword },
    { key: 'passive',  label: 'Passif',   icon: Zap },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={18} /> Retour à la Forge
        </button>
        <div className="flex items-center gap-3">
          <button onClick={loadHunters}
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors">
            <RefreshCw size={16} />
          </button>
          <span className="text-gray-500 text-sm">{hunters.length} hunters en DB</span>
        </div>
      </div>

      <div className="flex gap-6">
        {/* ── Left: Hunter list ──────────────────────────── */}
        <div className="w-80 shrink-0">
          {/* Search + New */}
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:border-amber-500 outline-none"
              />
            </div>
            <button onClick={createNew}
              className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium flex items-center gap-1">
              <Plus size={14} /> Nouveau
            </button>
          </div>

          {/* Element filter */}
          <div className="flex gap-1 mb-3 flex-wrap">
            {['all', ...ELEMENTS].map(el => {
              const Icon = el === 'all' ? Users : ELEMENT_ICONS[el];
              const count = elemCounts[el] || 0;
              return (
                <button key={el}
                  onClick={() => setFilterElement(el)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${
                    filterElement === el
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {Icon && <Icon size={12} />}
                  <span>{el === 'all' ? 'Tous' : el}</span>
                  <span className="opacity-60">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Hunter list */}
          <div className="space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto pr-1 custom-scrollbar">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Chargement...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Aucun hunter trouvé</div>
            ) : filtered.map(h => {
              const ElIcon = ELEMENT_ICONS[h.element];
              const isSelected = selected === h.hunter_id;
              return (
                <button key={h.hunter_id}
                  onClick={() => selectHunter(h)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all ${
                    isSelected
                      ? 'bg-amber-600/20 border border-amber-500/50'
                      : 'bg-gray-800/50 border border-transparent hover:bg-gray-800'
                  }`}
                >
                  {h.sprite_url ? (
                    <img src={h.sprite_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-900" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
                      {ElIcon && <ElIcon size={16} style={{ color: ELEMENT_COLORS[h.element] }} />}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{h.name}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span style={{ color: RARITY_COLORS[h.rarity] }}>{h.rarity}</span>
                      <span>{h.class}</span>
                      <span className="opacity-50">{h.hunter_id}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right: Editor ──────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {!editData ? (
            <div className="text-center py-20 text-gray-500">
              <Users size={48} className="mx-auto mb-4 opacity-30" />
              <p>Sélectionne un hunter ou crée-en un nouveau</p>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                {tabs.map(t => (
                  <button key={t.key} onClick={() => setActiveTab(t.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      activeTab === t.key
                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <t.icon size={14} /> {t.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <AnimatePresence mode="wait">
                  <motion.div key={activeTab}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    {activeTab === 'identity' && (
                      <IdentityTab data={editData} update={update} isNew={isNew} />
                    )}
                    {activeTab === 'stats' && (
                      <StatsTab data={editData} updateBase={updateBase} updateGrowth={updateGrowth} />
                    )}
                    {activeTab === 'skills' && (
                      <SkillsTab data={editData} addSkill={addSkill} removeSkill={removeSkill} updateSkill={updateSkill} />
                    )}
                    {activeTab === 'passive' && (
                      <PassiveTab data={editData} update={update} updatePassiveParam={updatePassiveParam} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Action bar */}
              <div className="flex items-center justify-between mt-4">
                <div>
                  {saveMsg && (
                    <span className={`text-sm ${saveMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                      {saveMsg.text}
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  {!isNew && selected && (
                    <button onClick={deleteHunter}
                      className="px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg text-sm hover:bg-red-600/30 flex items-center gap-2">
                      <Trash2 size={14} /> Supprimer
                    </button>
                  )}
                  <button onClick={saveHunter} disabled={saving}
                    className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50">
                    <Save size={14} /> {saving ? 'Sauvegarde...' : isNew ? 'Créer' : 'Sauvegarder'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// TAB: Identity
// ════════════════════════════════════════════════════════════
function IdentityTab({ data, update, isNew }) {
  return (
    <div className="space-y-5">
      {/* Hunter ID (only editable on create) */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Hunter ID</label>
        <input value={data.hunter_id} onChange={e => isNew && update('hunter_id', e.target.value)}
          disabled={!isNew}
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm disabled:opacity-50 focus:border-amber-500 outline-none"
          placeholder="h_nom_du_hunter"
        />
        {isNew && <p className="text-xs text-gray-500 mt-1">Format: h_[a-z0-9_]+</p>}
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Nom</label>
        <input value={data.name} onChange={e => update('name', e.target.value)}
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-amber-500 outline-none"
          placeholder="Nom du hunter"
        />
      </div>

      {/* Element + Class + Rarity row */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Élément</label>
          <select value={data.element} onChange={e => update('element', e.target.value)}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-amber-500 outline-none">
            {ELEMENTS.map(el => <option key={el} value={el}>{el}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Classe</label>
          <select value={data.class} onChange={e => update('class', e.target.value)}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-amber-500 outline-none">
            {CLASSES.map(cl => <option key={cl} value={cl}>{cl}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Rareté</label>
          <select value={data.rarity} onChange={e => update('rarity', e.target.value)}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-amber-500 outline-none">
            {RARITIES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Series */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Série (optionnel)</label>
        <input value={data.series} onChange={e => update('series', e.target.value)}
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-amber-500 outline-none"
          placeholder="ex: collab, aot, fate..."
        />
      </div>

      {/* Sprite URL */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Sprite URL</label>
        <div className="flex gap-3">
          <input value={data.sprite_url} onChange={e => update('sprite_url', e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-amber-500 outline-none"
            placeholder="https://..."
          />
          {data.sprite_url && (
            <img src={data.sprite_url} alt="sprite" className="w-12 h-12 rounded-lg object-cover bg-gray-900 border border-gray-700" />
          )}
        </div>
      </div>

      {/* Special flag */}
      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
        <input type="checkbox" checked={data.special} onChange={e => update('special', e.target.checked)}
          className="accent-amber-500"
        />
        Hunter spécial (ex: boss jouable)
      </label>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// TAB: Stats (base + growth)
// ════════════════════════════════════════════════════════════
function StatsTab({ data, updateBase, updateGrowth }) {
  return (
    <div className="space-y-6">
      {/* Base Stats */}
      <div>
        <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
          <Shield size={14} /> Stats de Base (niveau 1)
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {STAT_KEYS.map(key => (
            <div key={key}>
              <label className="block text-xs text-gray-400 mb-1 uppercase">{key}</label>
              <input type="number" value={data.base_stats[key] ?? 0}
                onChange={e => updateBase(key, e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-amber-500 outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Growth Stats */}
      <div>
        <h3 className="text-sm font-bold text-green-400 mb-3 flex items-center gap-2">
          <ChevronUp size={14} /> Croissance (par niveau)
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {STAT_KEYS.map(key => (
            <div key={key}>
              <label className="block text-xs text-gray-400 mb-1 uppercase">{key}</label>
              <input type="number" step="0.1" value={data.growth_stats[key] ?? 0}
                onChange={e => updateGrowth(key, e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-amber-500 outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Preview at level 50 */}
      <div>
        <h3 className="text-sm font-bold text-purple-400 mb-3">Aperçu niveau 50</h3>
        <div className="grid grid-cols-4 gap-3">
          {STAT_KEYS.map(key => {
            const lv50 = Math.round((data.base_stats[key] || 0) + (data.growth_stats[key] || 0) * 49);
            return (
              <div key={key} className="bg-gray-900 rounded-lg p-2 text-center">
                <div className="text-xs text-gray-500 uppercase">{key}</div>
                <div className="text-white font-bold">{lv50}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// TAB: Skills
// ════════════════════════════════════════════════════════════
function SkillsTab({ data, addSkill, removeSkill, updateSkill }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-amber-400">Skills ({data.skills.length}/5)</h3>
        {data.skills.length < 5 && (
          <button onClick={addSkill}
            className="px-3 py-1 bg-green-600/20 text-green-400 border border-green-600/30 rounded-lg text-xs hover:bg-green-600/30 flex items-center gap-1">
            <Plus size={12} /> Ajouter
          </button>
        )}
      </div>

      {data.skills.map((skill, idx) => (
        <div key={idx} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 font-bold">Skill {idx + 1}</span>
            {data.skills.length > 1 && (
              <button onClick={() => removeSkill(idx)}
                className="text-red-400 hover:text-red-300 p-1"><Trash2 size={12} /></button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3 sm:col-span-1">
              <label className="block text-xs text-gray-400 mb-1">Nom</label>
              <input value={skill.name} onChange={e => updateSkill(idx, 'name', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Power</label>
              <input type="number" value={skill.power} onChange={e => updateSkill(idx, 'power', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">CD Max</label>
              <input type="number" value={skill.cdMax} onChange={e => updateSkill(idx, 'cdMax', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-amber-500 outline-none"
              />
            </div>
          </div>
          {/* Extra skill props */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {['buffAtk', 'buffDef', 'buffDur', 'debuffDef', 'debuffDur', 'healSelf', 'selfDamage'].map(prop => (
              <div key={prop}>
                <label className="block text-[10px] text-gray-500 mb-0.5">{prop}</label>
                <input type="number" value={skill[prop] ?? ''}
                  onChange={e => updateSkill(idx, prop, e.target.value || undefined)}
                  placeholder="-"
                  className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs focus:border-amber-500 outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// TAB: Passive
// ════════════════════════════════════════════════════════════
function PassiveTab({ data, update, updatePassiveParam }) {
  // ── Awakening helpers ──────────────────────────────────
  const AWAKENING_TYPES = [
    'teamElementalDmg', 'statBoost', 'teamAura', 'permanent',
    'critDmg', 'defIgnore', 'healBonus', 'aoeDmg', 'custom',
  ];
  const awakenings = data.awakening_passives || {};
  const updateAwakening = (slot, val) => {
    const next = { ...awakenings };
    if (!val || (typeof val === 'object' && !val.type)) delete next[slot];
    else next[slot] = val;
    update('awakening_passives', next);
  };

  return (
    <div className="space-y-5">
      {/* Passive description */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Description du passif</label>
        <textarea value={data.passive_desc} onChange={e => update('passive_desc', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-amber-500 outline-none resize-none"
          placeholder="Description visible par les joueurs..."
        />
      </div>

      {/* Passive type */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Type de passif</label>
        <select value={data.passive_type} onChange={e => update('passive_type', e.target.value)}
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-amber-500 outline-none">
          <option value="">Aucun</option>
          {PASSIVE_TYPES.map(pt => <option key={pt} value={pt}>{pt}</option>)}
        </select>
      </div>

      {/* Dynamic params based on type */}
      {data.passive_type && (
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <h4 className="text-xs font-bold text-amber-400 mb-3">Paramètres du passif ({data.passive_type})</h4>

          {/* Common params based on type */}
          {['permanent', 'lowHp', 'highHp', 'firstTurn', 'teamDef', 'teamAura', 'stacking'].includes(data.passive_type) && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">Stats buffées (valeurs en %)</p>
              <div className="grid grid-cols-4 gap-2">
                {['atk', 'def', 'spd', 'crit', 'hp', 'res', 'elemDmg'].map(stat => (
                  <div key={stat}>
                    <label className="block text-[10px] text-gray-500 mb-0.5 uppercase">{stat}</label>
                    <input type="number"
                      value={data.passive_params?.stats?.[stat] ?? ''}
                      onChange={e => {
                        const stats = { ...(data.passive_params?.stats || {}) };
                        if (e.target.value === '' || e.target.value === '0') delete stats[stat];
                        else stats[stat] = Number(e.target.value);
                        updatePassiveParam('stats', stats);
                      }}
                      placeholder="-"
                      className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs focus:border-amber-500 outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Threshold for lowHp / highHp */}
          {['lowHp', 'highHp'].includes(data.passive_type) && (
            <div className="mt-3">
              <label className="block text-xs text-gray-400 mb-1">Seuil HP (%)</label>
              <input type="number" value={data.passive_params?.threshold ?? ''}
                onChange={e => updatePassiveParam('threshold', Number(e.target.value) || 0)}
                className="w-32 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-amber-500 outline-none"
              />
            </div>
          )}

          {/* Stacking extras */}
          {data.passive_type === 'stacking' && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Max Stacks</label>
                <input type="number" value={data.passive_params?.maxStacks ?? ''}
                  onChange={e => updatePassiveParam('maxStacks', Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Trigger</label>
                <select value={data.passive_params?.trigger ?? 'kill'}
                  onChange={e => updatePassiveParam('trigger', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-amber-500 outline-none">
                  <option value="kill">Kill</option>
                  <option value="crit">Crit</option>
                  <option value="hit">Hit</option>
                  <option value="turn">Turn</option>
                </select>
              </div>
            </div>
          )}

          {/* Value-based passives */}
          {['aoeDmg', 'healBonus', 'buffBonus', 'critDmg', 'magicDmg', 'defIgnore', 'dotDmg', 'debuffBonus'].includes(data.passive_type) && (
            <div className="mt-3">
              <label className="block text-xs text-gray-400 mb-1">Valeur (%)</label>
              <input type="number" value={data.passive_params?.value ?? ''}
                onChange={e => updatePassiveParam('value', Number(e.target.value) || 0)}
                className="w-32 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-amber-500 outline-none"
              />
            </div>
          )}

          {/* Raw JSON fallback */}
          <details className="mt-4">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">JSON brut</summary>
            <textarea
              value={JSON.stringify(data.passive_params, null, 2)}
              onChange={e => {
                try { update('passive_params', JSON.parse(e.target.value)); } catch { /* */ }
              }}
              rows={6}
              className="w-full mt-2 px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-green-400 text-xs font-mono focus:border-amber-500 outline-none resize-none"
            />
          </details>
        </div>
      )}

      {/* ── Awakening Passives (A1-A5) ──────────────────── */}
      <div className="border-t border-gray-700 pt-5">
        <h3 className="text-sm font-bold text-purple-400 mb-3 flex items-center gap-2">
          <Sparkles size={14} /> Passifs d'Éveil (A1 — A5)
        </h3>
        <p className="text-xs text-gray-500 mb-4">Chaque étoile peut débloquer un passif supplémentaire. Laisse vide si pas d'éveil à ce palier.</p>

        <div className="space-y-3">
          {['A1', 'A2', 'A3', 'A4', 'A5'].map(slot => {
            const aw = awakenings[slot] || null;
            const isActive = !!aw;
            return (
              <div key={slot} className={`rounded-lg border p-3 ${isActive ? 'bg-purple-900/20 border-purple-600/40' : 'bg-gray-900/50 border-gray-700'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold ${isActive ? 'text-purple-400' : 'text-gray-500'}`}>{slot}</span>
                  {!isActive ? (
                    <button onClick={() => updateAwakening(slot, { type: 'statBoost', desc: '' })}
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                      <Plus size={12} /> Ajouter
                    </button>
                  ) : (
                    <button onClick={() => updateAwakening(slot, null)}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                      <Trash2 size={12} /> Retirer
                    </button>
                  )}
                </div>

                {isActive && (
                  <div className="space-y-2">
                    {/* Type */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">Type</label>
                        <select value={aw.type || 'statBoost'}
                          onChange={e => updateAwakening(slot, { ...aw, type: e.target.value })}
                          className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs focus:border-purple-500 outline-none">
                          {AWAKENING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-0.5">Description</label>
                        <input value={aw.desc || ''}
                          onChange={e => updateAwakening(slot, { ...aw, desc: e.target.value })}
                          placeholder="ex: +3% DMG Eau par allié Water"
                          className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs focus:border-purple-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Type-specific params */}
                    {aw.type === 'teamElementalDmg' && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5">Élément</label>
                          <select value={aw.element || data.element}
                            onChange={e => updateAwakening(slot, { ...aw, element: e.target.value })}
                            className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs focus:border-purple-500 outline-none">
                            {ELEMENTS.map(el => <option key={el} value={el}>{el}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5">% par allié</label>
                          <input type="number" value={aw.pctPerAlly ?? 3}
                            onChange={e => updateAwakening(slot, { ...aw, pctPerAlly: Number(e.target.value) || 0 })}
                            className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs focus:border-purple-500 outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {aw.type === 'statBoost' && (
                      <div className="grid grid-cols-4 gap-2">
                        {['atk', 'def', 'hp', 'spd', 'crit', 'res', 'elemDmg'].map(stat => (
                          <div key={stat}>
                            <label className="block text-[10px] text-gray-500 mb-0.5 uppercase">{stat}</label>
                            <input type="number" value={aw[stat] ?? ''}
                              onChange={e => {
                                const next = { ...aw };
                                if (e.target.value === '' || e.target.value === '0') delete next[stat];
                                else next[stat] = Number(e.target.value);
                                updateAwakening(slot, next);
                              }}
                              placeholder="-"
                              className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-xs focus:border-purple-500 outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* JSON fallback for any type */}
                    <details>
                      <summary className="text-[10px] text-gray-600 cursor-pointer hover:text-gray-400">JSON</summary>
                      <textarea
                        value={JSON.stringify(aw, null, 2)}
                        onChange={e => { try { updateAwakening(slot, JSON.parse(e.target.value)); } catch { /* */ } }}
                        rows={4}
                        className="w-full mt-1 px-2 py-1 bg-gray-900 border border-gray-600 rounded text-green-400 text-[10px] font-mono focus:border-purple-500 outline-none resize-none"
                      />
                    </details>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
