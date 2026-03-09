// src/pages/Forge/Forge.jsx — La Forge du Monarque (Community Weapon Creator)
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hammer, Sword, Shield, Zap, Flame, Droplets, Eye, Wind, Mountain,
  Sparkles, ArrowLeft, AlertTriangle, Check, Trash2, Clock, Info,
  Plus, X, MapPin,
} from 'lucide-react';
import { API_URL } from '../../utils/api.js';
import { isLoggedIn, getAuthUser, authHeaders } from '../../utils/auth';
import {
  FORGE_PASSIVE_TEMPLATES, BONUS_STAT_OPTIONS, AWAKENING_STAT_OPTIONS,
  WEAPON_TYPES, ELEMENTS, RARITIES, MULTI_PASSIVE_TAX, LOOT_LOCATIONS,
  PASSIVE_CATEGORIES, validateDrawbackConstraint,
  computePowerScore, computeRarity, computeBaseDropRate, computeDropRates,
  computeLootLocations, computeExpeditionBoss, formatDropRate,
} from '../../data/forgePassiveTemplates.js';
import {
  beruReact, beruWakeUp, getNameReaction, getCheatReaction, getScoreReaction,
  shouldTriggerEasterEgg, EASTER_EGG_DESTROY_INTRO,
  ENTRY_MESSAGES, NAME_GENERIC, DESC_GENERIC, DESC_EMPTY, DESC_LONG,
  ELEMENT_REACTIONS, WEAPON_TYPE_REACTIONS, BONUS_STAT_REACTIONS, BONUS_VALUE_HIGH,
  ATK_LOW, ATK_MID, ATK_HIGH, ATK_MAX,
  SCALING_INT_ON, SCALING_INT_OFF,
  PASSIVE_GENERIC, PASSIVE_SPECIFIC, PASSIVE_ADD_SECOND, PASSIVE_ADD_THIRD, PASSIVE_REMOVE,
  AWAKENING_GENERIC, AWAKENING_HIGH_VALUE,
  RARITY_UP, RARITY_DOWN, LOOT_LOST, LOOT_EXPEDITION_ONLY, LOOT_GAINED,
  SUBMIT_REACTIONS, SUBMIT_SUCCESS, SUBMIT_FAIL, DELETE_REACTIONS,
  GALLERY_REACTIONS, MY_WEAPONS_REACTIONS, MODAL_OPEN,
  TAB_CREATE, TAB_GALLERY, TAB_MY_WEAPONS,
  IDLE_FORGE, BOSS_CHANGE, CHEAT_WARNING_SEVERE,
  getHideAttemptReaction,
} from './forgeBeruReactions.js';

// ── Rarity colors ────────────────────────────────────────
const RARITY_COLORS = { rare: '#3b82f6', legendaire: '#f59e0b', mythique: '#ef4444' };
const RARITY_BG = { rare: 'from-blue-900/40', legendaire: 'from-amber-900/40', mythique: 'from-red-900/40' };

// ── Element icons ────────────────────────────────────────
const ELEMENT_ICONS = {
  fire: Flame, water: Droplets, shadow: Eye, light: Sparkles,
  wind: Wind, earth: Mountain,
};

export default function Forge() {
  const [forgeSection, setForgeSection] = useState('weapon'); // weapon | boss
  const [tab, setTab] = useState('create'); // create | gallery | my-weapons
  const [weapons, setWeapons] = useState([]);
  const [myWeapons, setMyWeapons] = useState([]);
  const [nextForgeAt, setNextForgeAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [selectedWeapon, setSelectedWeapon] = useState(null);

  // ── Form state ─────────────────────────────────────────
  const [name, setName] = useState('');
  const [element, setElement] = useState(null);
  const [weaponType, setWeaponType] = useState('blade');
  const [atk, setAtk] = useState(100);
  const [bonusStat, setBonusStat] = useState('crit_rate');
  const [bonusValue, setBonusValue] = useState(10);
  const [scalingStat, setScalingStat] = useState(null);
  const [passives, setPassives] = useState([{ id: 'none', params: {} }]);
  const [descFr, setDescFr] = useState('');
  const [awakeningPassives, setAwakeningPassives] = useState([
    { key: 'atk_pct', value: 8 },
    { key: 'crit_rate', value: 5 },
    { key: 'crit_dmg', value: 12 },
    { key: 'hp_pct', value: 8 },
    { key: 'defPen', value: 6 },
  ]);

  const maxAtk = 300;

  // ── Power score (live) ─────────────────────────────────
  const powerScore = useMemo(() => computePowerScore({
    atk, element, bonusStat, bonusValue,
    passives, awakeningPassives,
  }), [atk, element, bonusStat, bonusValue, passives, awakeningPassives]);

  // ── Derived from power score (not chosen by user) ─────
  const rarity = computeRarity(powerScore);
  const dropRate = computeBaseDropRate(powerScore);
  const dropRates = computeDropRates(powerScore);
  const lootLocationKeys = computeLootLocations(powerScore);
  const expeditionBoss = computeExpeditionBoss(powerScore);

  // ── Element → elemental damage stat filtering ─────────
  const ELEMENT_DAMAGE_MAP = { fire: 'fireDamage', water: 'waterDamage', shadow: 'shadowDamage', light: 'lightDamage' };
  const ELEMENTAL_STAT_KEYS = new Set(Object.values(ELEMENT_DAMAGE_MAP));

  const filteredBonusStats = useMemo(() => {
    if (!element || !ELEMENT_DAMAGE_MAP[element]) {
      // Neutre / wind / earth → no elemental damage stats at all
      return BONUS_STAT_OPTIONS.filter(s => !ELEMENTAL_STAT_KEYS.has(s.key));
    }
    // Element chosen → keep only that element's damage stat
    const allowed = ELEMENT_DAMAGE_MAP[element];
    return BONUS_STAT_OPTIONS.filter(s => !ELEMENTAL_STAT_KEYS.has(s.key) || s.key === allowed);
  }, [element]);

  const filteredAwakeningStats = useMemo(() => {
    if (!element || !ELEMENT_DAMAGE_MAP[element]) {
      return AWAKENING_STAT_OPTIONS.filter(s => !ELEMENTAL_STAT_KEYS.has(s.key));
    }
    const allowed = ELEMENT_DAMAGE_MAP[element];
    return AWAKENING_STAT_OPTIONS.filter(s => !ELEMENTAL_STAT_KEYS.has(s.key) || s.key === allowed);
  }, [element]);

  // Auto-clear invalid stats when element changes
  useEffect(() => {
    const validBonusKeys = new Set(filteredBonusStats.map(s => s.key));
    if (!validBonusKeys.has(bonusStat)) {
      setBonusStat(filteredBonusStats[0]?.key || 'crit_rate');
    }
    setAwakeningPassives(prev => prev.map(aw => {
      const validAwKeys = new Set(filteredAwakeningStats.map(s => s.key));
      if (!validAwKeys.has(aw.key)) {
        return { key: filteredAwakeningStats[0]?.key || 'atk_pct', value: aw.value };
      }
      return aw;
    }));
  }, [element, filteredBonusStats, filteredAwakeningStats]);

  // ── Score color ────────────────────────────────────────
  const scoreColor = powerScore <= 30 ? '#22c55e' : powerScore <= 50 ? '#eab308'
    : powerScore <= 70 ? '#f97316' : powerScore <= 85 ? '#ef4444' : '#dc2626';

  // ═══════════════════════════════════════════════════════
  // BERU MASCOT — Reactions to everything
  // ═══════════════════════════════════════════════════════
  const prevRarity = useRef(rarity);
  const prevLootCount = useRef(lootLocationKeys.length);
  const prevBoss = useRef(expeditionBoss);
  const nameTimerRef = useRef(null);
  const descTimerRef = useRef(null);
  const idleTimerRef = useRef(null);
  const easterEggTriggered = useRef(false);

  // ── Wake up Beru + entry message on mount ─────────────
  // Also lock Beru (can't hide him while in Forge)
  useEffect(() => {
    beruWakeUp();
    window.dispatchEvent(new CustomEvent('beru-forge-lock', { detail: { locked: true } }));
    const t = setTimeout(() => beruReact(ENTRY_MESSAGES, true), 1500);

    // Listen for hide attempts → send back angry reaction
    const onHideAttempt = (e) => {
      const reaction = getHideAttemptReaction(e.detail?.count || 1);
      if (reaction) {
        window.dispatchEvent(new CustomEvent('beru-react', {
          detail: { message: reaction.message, mood: reaction.mood, duration: reaction.duration },
        }));
      }
    };
    window.addEventListener('beru-hide-attempt', onHideAttempt);

    return () => {
      clearTimeout(t);
      window.removeEventListener('beru-hide-attempt', onHideAttempt);
      window.dispatchEvent(new CustomEvent('beru-forge-lock', { detail: { locked: false } }));
    };
  }, []);

  // ── Idle messages every 25-40s ────────────────────────
  useEffect(() => {
    const scheduleIdle = () => {
      idleTimerRef.current = setTimeout(() => {
        if (tab === 'create') beruReact(IDLE_FORGE);
        scheduleIdle();
      }, 25000 + Math.random() * 15000);
    };
    scheduleIdle();
    return () => clearTimeout(idleTimerRef.current);
  }, [tab]);

  // ── Name change (debounced 1.5s) ─────────────────────
  useEffect(() => {
    if (!name) return;
    clearTimeout(nameTimerRef.current);
    nameTimerRef.current = setTimeout(() => {
      const reaction = getNameReaction(name);
      if (reaction) {
        window.dispatchEvent(new CustomEvent('beru-react', {
          detail: { message: reaction.message, mood: reaction.mood, duration: reaction.duration },
        }));
      }
    }, 1500);
    return () => clearTimeout(nameTimerRef.current);
  }, [name]);

  // ── Description change (debounced 2s) ─────────────────
  useEffect(() => {
    clearTimeout(descTimerRef.current);
    descTimerRef.current = setTimeout(() => {
      if (!descFr) { if (name && Math.random() < 0.3) beruReact(DESC_EMPTY); }
      else if (descFr.length > 150) beruReact(DESC_LONG);
      else if (Math.random() < 0.4) beruReact(DESC_GENERIC);
    }, 2000);
    return () => clearTimeout(descTimerRef.current);
  }, [descFr]);

  // ── Element change ────────────────────────────────────
  useEffect(() => {
    const key = element || 'null';
    const reactions = ELEMENT_REACTIONS[key];
    if (reactions) beruReact(reactions);
  }, [element]);

  // ── Weapon type change ────────────────────────────────
  useEffect(() => {
    const reactions = WEAPON_TYPE_REACTIONS[weaponType];
    if (reactions) beruReact(reactions);
  }, [weaponType]);

  // ── ATK change (debounced via score) ──────────────────
  useEffect(() => {
    if (atk >= 280) beruReact(ATK_MAX);
    else if (atk >= 200) { if (Math.random() < 0.3) beruReact(ATK_HIGH); }
    else if (atk >= 100) { if (Math.random() < 0.15) beruReact(ATK_MID); }
    else { if (Math.random() < 0.2) beruReact(ATK_LOW); }
  }, [atk]);

  // ── Bonus stat change ────────────────────────────────
  useEffect(() => {
    const reactions = BONUS_STAT_REACTIONS[bonusStat];
    if (reactions) beruReact(reactions);
  }, [bonusStat]);

  // ── Bonus value high ─────────────────────────────────
  useEffect(() => {
    const statDef = BONUS_STAT_OPTIONS.find(s => s.key === bonusStat);
    if (statDef && bonusValue >= statDef.maxValue * 0.85) {
      beruReact(BONUS_VALUE_HIGH);
    }
  }, [bonusValue]);

  // ── Scaling stat toggle ──────────────────────────────
  useEffect(() => {
    if (scalingStat === 'int') beruReact(SCALING_INT_ON);
    else beruReact(SCALING_INT_OFF);
  }, [scalingStat]);

  // ── Rarity change (auto) ─────────────────────────────
  useEffect(() => {
    if (rarity !== prevRarity.current) {
      const rarityOrder = ['rare', 'legendaire', 'mythique'];
      const oldIdx = rarityOrder.indexOf(prevRarity.current);
      const newIdx = rarityOrder.indexOf(rarity);
      if (newIdx > oldIdx && RARITY_UP[rarity]) beruReact(RARITY_UP[rarity], true);
      else if (newIdx < oldIdx && RARITY_DOWN[rarity]) beruReact(RARITY_DOWN[rarity]);
      prevRarity.current = rarity;
    }
  }, [rarity]);

  // ── Loot location changes ────────────────────────────
  useEffect(() => {
    const count = lootLocationKeys.length;
    if (count < prevLootCount.current) {
      if (count === 1) beruReact(LOOT_EXPEDITION_ONLY, true);
      else beruReact(LOOT_LOST);
    } else if (count > prevLootCount.current) {
      beruReact(LOOT_GAINED);
    }
    prevLootCount.current = count;
  }, [lootLocationKeys.length]);

  // ── Expedition boss change ────────────────────────────
  useEffect(() => {
    const bossKey = expeditionBoss?.min;
    const prevKey = prevBoss.current?.min;
    if (bossKey !== prevKey && BOSS_CHANGE[bossKey]) {
      beruReact(BOSS_CHANGE[bossKey]);
      prevBoss.current = expeditionBoss;
    }
  }, [expeditionBoss?.min]);

  // ── Cheat detection + Easter egg ──────────────────────
  useEffect(() => {
    const cheat = getCheatReaction(powerScore);
    if (cheat) {
      window.dispatchEvent(new CustomEvent('beru-react', {
        detail: { message: cheat.message, mood: cheat.mood, duration: cheat.duration },
      }));
    }

    // Easter egg: roll ONCE when score first hits 100. If it doesn't proc, never again.
    if (!easterEggTriggered.current && powerScore >= 100) {
      easterEggTriggered.current = true; // mark forever, win or lose
      if (shouldTriggerEasterEgg(powerScore)) {
        triggerEasterEgg();
      }
    }
  }, [powerScore]);

  // ── Easter egg sequence: Beru resets everything ───────
  const triggerEasterEgg = useCallback(() => {
    const msgs = EASTER_EGG_DESTROY_INTRO;
    let delay = 0;
    msgs.forEach((m, i) => {
      delay += (i === 0 ? 500 : m.duration || 2000);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('beru-react', {
          detail: { message: m.message, mood: m.mood, duration: m.duration, isAdmin: true },
        }));
      }, delay);
    });
    // After the sequence, RESET all form fields
    setTimeout(() => {
      setAtk(50 + Math.floor(Math.random() * 50));
      setElement(null);
      setBonusStat('hp_pct');
      setBonusValue(5);
      setPassives([{ id: 'none', params: {} }]);
      setScalingStat(null);
      setAwakeningPassives([
        { key: 'atk_pct', value: 3 },
        { key: 'def_pct', value: 3 },
        { key: 'hp_pct', value: 3 },
        { key: 'crit_rate', value: 2 },
        { key: 'spd_flat', value: 2 },
      ]);
    }, delay + 2000);
  }, []);

  // ── Tab change reactions ──────────────────────────────
  const handleTabChange = useCallback((newTab) => {
    setTab(newTab);
    if (newTab === 'create') beruReact(TAB_CREATE);
    else if (newTab === 'gallery') beruReact(TAB_GALLERY.concat(GALLERY_REACTIONS));
    else if (newTab === 'my-weapons') beruReact(TAB_MY_WEAPONS.concat(MY_WEAPONS_REACTIONS));
  }, []);

  // (passive reactions are handled inline in addPassive/removePassive/updatePassiveId below)

  // ── Cooldown check ─────────────────────────────────────
  const canForge = !nextForgeAt || new Date(nextForgeAt) <= new Date();
  const cooldownText = nextForgeAt && !canForge
    ? `Prochaine forge : ${new Date(nextForgeAt).toLocaleDateString('fr-FR')} ${new Date(nextForgeAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
    : null;

  // ── Fetch data ─────────────────────────────────────────
  useEffect(() => { fetchGallery(); fetchMyWeapons(); }, []);

  async function fetchGallery() {
    try {
      const resp = await fetch(`${API_URL}/forge?action=list`);
      const data = await resp.json();
      if (data.success) setWeapons(data.weapons || []);
    } catch {}
  }

  async function fetchMyWeapons() {
    if (!isLoggedIn()) return;
    try {
      const resp = await fetch(`${API_URL}/forge?action=my-weapons`, { headers: authHeaders() });
      const data = await resp.json();
      if (data.success) {
        setMyWeapons(data.weapons || []);
        setNextForgeAt(data.nextForgeAt || null);
      }
    } catch {}
  }

  // ── Submit weapon ──────────────────────────────────────
  async function handleSubmit() {
    if (!isLoggedIn()) { setMsg({ type: 'error', text: 'Tu dois être connecté pour forger une arme.' }); return; }
    if (!name.trim()) { setMsg({ type: 'error', text: 'Donne un nom à ton arme !' }); return; }
    if (name.trim().length < 2) { setMsg({ type: 'error', text: 'Nom trop court (min 2 caractères).' }); return; }
    // Validate drawback constraints
    for (const p of passives.filter(p => p.id !== 'none')) {
      if (!validateDrawbackConstraint(p.id, p.params)) {
        setMsg({ type: 'error', text: `Passif "${FORGE_PASSIVE_TEMPLATES[p.id]?.name}" : le bonus ne peut pas dépasser le malus !` });
        return;
      }
    }

    setLoading(true);
    setMsg(null);
    beruReact(SUBMIT_REACTIONS, true);
    try {
      const resp = await fetch(`${API_URL}/forge?action=create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          name: name.trim(), element, weaponType,
          atk: Math.min(atk, maxAtk), bonusStat, bonusValue,
          scalingStat, passives: passives.filter(p => p.id !== 'none'), descFr,
          awakeningPassives,
        }),
      });
      const data = await resp.json();
      if (data.success) {
        setMsg({ type: 'success', text: `${data.weapon.name} a été forgée ! Drop rate: ${data.weapon.dropRate}%` });
        setTimeout(() => beruReact(SUBMIT_SUCCESS, true), 2000);
        fetchGallery();
        fetchMyWeapons();
        setTab('gallery');
      } else {
        setMsg({ type: 'error', text: data.error || 'Erreur lors de la forge.' });
        beruReact(SUBMIT_FAIL, true);
      }
    } catch (e) {
      setMsg({ type: 'error', text: 'Erreur réseau.' });
      beruReact(SUBMIT_FAIL, true);
    }
    setLoading(false);
  }

  // ── Delete weapon ──────────────────────────────────────
  async function handleDelete(weaponId) {
    if (!confirm('Supprimer cette arme ? Elle disparaîtra du jeu.')) return;
    beruReact(DELETE_REACTIONS, true);
    try {
      const resp = await fetch(`${API_URL}/forge?action=delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ weaponId }),
      });
      const data = await resp.json();
      if (data.success) {
        setMsg({ type: 'success', text: 'Arme supprimée.' });
        fetchGallery();
        fetchMyWeapons();
      }
    } catch {}
  }

  // ── Multi-passive helpers (with Beru reactions) ────────
  function addPassive() {
    if (passives.length >= 3) return;
    const newLen = passives.length + 1;
    setPassives(prev => [...prev, { id: 'none', params: {} }]);
    if (newLen === 2) setTimeout(() => beruReact(PASSIVE_ADD_SECOND, true), 300);
    if (newLen === 3) setTimeout(() => beruReact(PASSIVE_ADD_THIRD, true), 300);
  }

  function removePassive(idx) {
    if (passives.length <= 1) return;
    setPassives(prev => prev.filter((_, i) => i !== idx));
    beruReact(PASSIVE_REMOVE);
  }

  function updatePassiveId(idx, newId) {
    // Beru reacts to the passive choice
    const reactions = PASSIVE_SPECIFIC[newId];
    if (reactions) beruReact(reactions);
    else if (newId !== 'none') beruReact(PASSIVE_GENERIC);

    setPassives(prev => {
      const next = [...prev];
      const template = FORGE_PASSIVE_TEMPLATES[newId];
      const defaults = {};
      if (template?.params) {
        for (const [k, v] of Object.entries(template.params)) defaults[k] = v.options[0];
      }
      next[idx] = { id: newId, params: defaults };
      return next;
    });
  }

  function updatePassiveParam(idx, key, value) {
    setPassives(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], params: { ...next[idx].params, [key]: value } };
      return next;
    });
  }

  function getPassiveDesc(passive) {
    const t = FORGE_PASSIVE_TEMPLATES[passive.id];
    if (!t || passive.id === 'none') return '';
    let d = t.desc;
    for (const [k, v] of Object.entries(passive.params || {})) {
      d = d.replace(`{${k}}`, v);
    }
    return d;
  }

  // IDs already picked (to prevent duplicates)
  function usedPassiveIds(excludeIdx) {
    return passives.filter((_, i) => i !== excludeIdx).map(p => p.id).filter(id => id !== 'none');
  }

  // ── Awakening change ───────────────────────────────────
  function updateAwakening(idx, field, value) {
    setAwakeningPassives(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
    if (field === 'value' && value >= 12) {
      beruReact(AWAKENING_HIGH_VALUE);
    } else if (Math.random() < 0.2) {
      beruReact(AWAKENING_GENERIC);
    }
  }



  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white p-4 md:p-8 max-w-6xl mx-auto">
      {/* Back to Colosseum */}
      <Link to="/shadow-colosseum" className="text-sm text-gray-500 hover:text-purple-400 transition-colors mb-2 inline-block">← Retour au Colisee</Link>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
          ⚒️ La Forge du Monarque
        </h1>
        <p className="text-gray-400 mt-2">Crée ton arme. Le Monarque l'ajoutera au monde.</p>
      </div>

      {/* Section selector: Weapon / Boss */}
      <div className="flex gap-3 justify-center mb-6">
        <button
          onClick={() => setForgeSection('weapon')}
          className={`px-6 py-3 rounded-xl text-sm font-bold transition-all border ${
            forgeSection === 'weapon'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border-amber-500 shadow-lg shadow-amber-600/30'
              : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
          }`}
        >
          <span className="flex items-center gap-2"><Sword size={18} /> Forger une Arme</span>
        </button>
        <div
          className="px-6 py-3 rounded-xl text-sm font-bold border border-gray-700/50 bg-gray-800/50 text-gray-600 cursor-not-allowed relative group"
          title="En construction"
        >
          <span className="flex items-center gap-2 grayscale"><Shield size={18} /> Forger un Boss</span>
          <span className="absolute -top-2 -right-2 bg-yellow-600 text-[10px] text-white px-1.5 py-0.5 rounded-full font-bold">SOON</span>
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-600 text-xs text-gray-300 px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            En construction
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 justify-center mb-6">
        {[
          { key: 'create', label: '🔨 Forger', icon: Hammer },
          { key: 'gallery', label: '📜 Galerie', icon: Sword },
          { key: 'my-weapons', label: '⚔️ Mes Armes', icon: Shield },
        ].map(t => (
          <button key={t.key} onClick={() => handleTabChange(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
              msg.type === 'error' ? 'bg-red-900/50 text-red-300 border border-red-700' :
              'bg-green-900/50 text-green-300 border border-green-700'
            }`}
          >
            {msg.type === 'error' ? <AlertTriangle size={16} /> : <Check size={16} />}
            {msg.text}
            <button onClick={() => setMsg(null)} className="ml-auto text-gray-500 hover:text-white">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ CREATE TAB ═══ */}
      {tab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Form */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Nom de l'arme</label>
              <input value={name} onChange={e => setName(e.target.value.slice(0, 40))}
                placeholder="Ex: Lame du Crépuscule"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:border-amber-500 focus:outline-none"
              />
              <span className="text-xs text-gray-600">{name.length}/40</span>
            </div>

            {/* Type + Element + Rarity */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Type</label>
                <select value={weaponType} onChange={e => setWeaponType(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-white text-sm focus:border-amber-500 focus:outline-none"
                >
                  {WEAPON_TYPES.map(t => <option key={t.key} value={t.key}>{t.icon} {t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Élément</label>
                <select value={element || ''} onChange={e => setElement(e.target.value || null)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-white text-sm focus:border-amber-500 focus:outline-none"
                >
                  {ELEMENTS.map(el => <option key={el.key ?? 'null'} value={el.key ?? ''}>{el.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Rareté (auto)</label>
                <div className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm font-bold text-center"
                  style={{ color: RARITY_COLORS[rarity], borderColor: RARITY_COLORS[rarity] + '60' }}
                >
                  {RARITIES.find(r => r.key === rarity)?.label || rarity}
                </div>
              </div>
            </div>

            {/* ATK slider */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                ATK : <span className="text-white font-bold">{atk}</span>
                <span className="text-gray-600 ml-1">(max {maxAtk})</span>
              </label>
              <input type="range" min={10} max={maxAtk} value={Math.min(atk, maxAtk)}
                onChange={e => setAtk(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Scaling stat toggle */}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="scaling-int" checked={scalingStat === 'int'}
                onChange={e => setScalingStat(e.target.checked ? 'int' : null)}
                className="accent-amber-500"
              />
              <label htmlFor="scaling-int" className="text-xs text-gray-400">
                Scale sur INT (bâtons/mages)
              </label>
            </div>

            {/* Bonus stat */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Stat secondaire</label>
                <select value={bonusStat} onChange={e => setBonusStat(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-white text-sm focus:border-amber-500 focus:outline-none"
                >
                  {filteredBonusStats.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">
                  Valeur : <span className="text-white font-bold">{bonusValue}</span>
                </label>
                <input type="range" min={1} max={filteredBonusStats.find(s => s.key === bonusStat)?.maxValue || BONUS_STAT_OPTIONS.find(s => s.key === bonusStat)?.maxValue || 20}
                  value={bonusValue} onChange={e => setBonusValue(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            {/* Passives (up to 3) */}
            <div>
              <label className="text-xs text-gray-400 mb-2 block flex items-center gap-1">
                <Zap size={12} /> Passifs ({passives.filter(p => p.id !== 'none').length}/3)
                {passives.filter(p => p.id !== 'none').length >= 2 && (
                  <span className="text-amber-500 ml-1">
                    (+{MULTI_PASSIVE_TAX[Math.min(passives.filter(p => p.id !== 'none').length, 3)]} pts synergie)
                  </span>
                )}
              </label>
              <div className="space-y-3">
                {passives.map((passive, idx) => {
                  const used = usedPassiveIds(idx);
                  const template = FORGE_PASSIVE_TEMPLATES[passive.id];
                  return (
                    <div key={idx} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-amber-400 font-bold min-w-[16px]">P{idx + 1}</span>
                        <select value={passive.id} onChange={e => updatePassiveId(idx, e.target.value)}
                          className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-white text-sm focus:border-amber-500 focus:outline-none"
                        >
                          <option value="none">Aucun passif</option>
                          {['offensive', 'defensive', 'utility', 'drawback'].map(cat => {
                            const catDef = PASSIVE_CATEGORIES[cat];
                            const entries = Object.entries(FORGE_PASSIVE_TEMPLATES).filter(([id, t]) => id !== 'none' && t.category === cat);
                            if (!entries.length) return null;
                            return (
                              <optgroup key={cat} label={`${catDef.icon} ${catDef.label}`}>
                                {entries.map(([id, t]) => (
                                  <option key={id} value={id} disabled={used.includes(id)}>
                                    {t.name} ({t.cost > 0 ? '+' : ''}{t.cost} pts) {used.includes(id) ? '(déjà pris)' : ''}
                                  </option>
                                ))}
                              </optgroup>
                            );
                          })}
                        </select>
                        {idx > 0 && (
                          <button onClick={() => removePassive(idx)}
                            className="text-gray-500 hover:text-red-400 transition-colors p-1"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      {passive.id !== 'none' && template && (
                        <div className="flex items-center gap-2 pl-6 mb-1">
                          {PASSIVE_CATEGORIES[template.category] && (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: PASSIVE_CATEGORIES[template.category].color + '25', color: PASSIVE_CATEGORIES[template.category].color }}>
                              {PASSIVE_CATEGORIES[template.category].icon} {PASSIVE_CATEGORIES[template.category].label}
                            </span>
                          )}
                          {template.constraint && !validateDrawbackConstraint(passive.id, passive.params) && (
                            <span className="text-[9px] font-bold text-red-400 bg-red-900/30 px-1.5 py-0.5 rounded">
                              ⚠️ Bonus trop élevé vs malus
                            </span>
                          )}
                        </div>
                      )}
                      {passive.id !== 'none' && (
                        <p className="text-xs text-amber-400/80 mb-2 pl-6">{getPassiveDesc(passive)}</p>
                      )}
                      {passive.id !== 'none' && template?.params && (
                        <div className="grid grid-cols-2 gap-2 pl-6">
                          {Object.entries(template.params).map(([key, def]) => (
                            <div key={key}>
                              <label className="text-[10px] text-gray-500 mb-0.5 block">{def.label}</label>
                              <select value={passive.params[key] ?? def.options[0]}
                                onChange={e => {
                                  const val = isNaN(e.target.value) ? e.target.value : Number(e.target.value);
                                  updatePassiveParam(idx, key, val);
                                }}
                                className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white text-xs focus:border-amber-500 focus:outline-none"
                              >
                                {def.options.map((opt, i) => {
                                  const label = (key.toLowerCase().includes('duration') && opt === 0) ? '∞ Permanent' : opt;
                                  const costStr = def.costs[i] > 0 ? `(+${def.costs[i]} pts)` : def.costs[i] < 0 ? `(${def.costs[i]} pts)` : '';
                                  return <option key={opt} value={opt}>{label} {costStr}</option>;
                                })}
                              </select>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {passives.length < 3 && (
                <button onClick={addPassive}
                  className="mt-2 flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <Plus size={12} /> Ajouter un passif
                </button>
              )}
            </div>

            {/* Awakening A1-A5 */}
            <div>
              <label className="text-xs text-gray-400 mb-2 block flex items-center gap-1">
                <Info size={12} /> Passifs d'éveil A1-A5
              </label>
              <div className="space-y-2">
                {awakeningPassives.map((aw, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2 items-center">
                    <span className="text-xs text-amber-400 font-bold">A{i + 1}</span>
                    <select value={aw.key} onChange={e => updateAwakening(i, 'key', e.target.value)}
                      className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white focus:border-amber-500 focus:outline-none"
                    >
                      {filteredAwakeningStats.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                    <div className="flex items-center gap-1">
                      <input type="range" min={1} max={filteredAwakeningStats.find(s => s.key === aw.key)?.maxValue || AWAKENING_STAT_OPTIONS.find(s => s.key === aw.key)?.maxValue || 15}
                        value={aw.value} onChange={e => updateAwakening(i, 'value', Number(e.target.value))}
                        className="flex-1 accent-amber-500"
                      />
                      <span className="text-xs text-white w-8 text-right">+{aw.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Description / Lore (optionnel)</label>
              <textarea value={descFr} onChange={e => setDescFr(e.target.value.slice(0, 200))}
                placeholder="L'histoire de ton arme..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:border-amber-500 focus:outline-none resize-none h-20"
              />
              <span className="text-xs text-gray-600">{descFr.length}/200</span>
            </div>

            {/* Submit */}
            <button onClick={handleSubmit} disabled={loading || !canForge || !name.trim()}
              className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${
                loading || !canForge || !name.trim()
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-600/30'
              }`}
            >
              {loading ? '⏳ Forge en cours...' : !canForge ? `⏰ ${cooldownText}` : '🔨 Forger cette arme'}
            </button>
          </div>

          {/* Right: Live Preview */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <WeaponPreview
              name={name || 'Nom de l\'arme'} element={element} weaponType={weaponType}
              rarity={rarity} atk={Math.min(atk, maxAtk)} bonusStat={bonusStat}
              bonusValue={bonusValue} scalingStat={scalingStat}
              passives={passives}
              awakeningPassives={awakeningPassives}
              powerScore={powerScore} dropRates={dropRates}
              lootLocationKeys={lootLocationKeys} expeditionBoss={expeditionBoss}
              scoreColor={scoreColor} creator={getAuthUser()?.username || '???'}
            />
          </div>
        </div>
      )}

      {/* ═══ GALLERY TAB ═══ */}
      {tab === 'gallery' && (
        <div>
          <p className="text-gray-400 text-sm mb-4">{weapons.length} arme{weapons.length > 1 ? 's' : ''} forgée{weapons.length > 1 ? 's' : ''} par la communauté</p>
          {weapons.length === 0 && (
            <p className="text-center text-gray-600 py-12">Aucune arme forgée. Sois le premier !</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {weapons.map(w => (
              <WeaponCard key={w.weapon_id} weapon={w} onClick={() => { setSelectedWeapon(w); beruReact(MODAL_OPEN); }} />
            ))}
          </div>
        </div>
      )}

      {/* ═══ MY WEAPONS TAB ═══ */}
      {tab === 'my-weapons' && (
        <div>
          {!isLoggedIn() ? (
            <p className="text-center text-gray-500 py-12">Connecte-toi pour voir tes armes.</p>
          ) : (
            <>
              {cooldownText && (
                <div className="flex items-center gap-2 text-amber-400 text-sm mb-4 bg-amber-900/20 border border-amber-800/30 rounded-lg p-3">
                  <Clock size={14} /> {cooldownText}
                </div>
              )}
              <p className="text-gray-400 text-sm mb-4">{myWeapons.length}/20 armes créées</p>
              {myWeapons.length === 0 && (
                <p className="text-center text-gray-600 py-12">Tu n'as pas encore forgé d'arme.</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myWeapons.map(w => (
                  <WeaponCard key={w.weapon_id} weapon={w} showDelete onDelete={() => handleDelete(w.weapon_id)} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══ WEAPON DETAIL MODAL ═══ */}
      <AnimatePresence>
        {selectedWeapon && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedWeapon(null)}
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <WeaponPreview
                name={selectedWeapon.name} element={selectedWeapon.element}
                weaponType={selectedWeapon.weapon_type} rarity={selectedWeapon.rarity}
                atk={selectedWeapon.atk} bonusStat={selectedWeapon.bonus_stat}
                bonusValue={Number(selectedWeapon.bonus_value)}
                scalingStat={selectedWeapon.scaling_stat}
                passives={typeof selectedWeapon.passives === 'string'
                  ? JSON.parse(selectedWeapon.passives) : (selectedWeapon.passives || [])}
                awakeningPassives={typeof selectedWeapon.awakening_passives === 'string'
                  ? JSON.parse(selectedWeapon.awakening_passives) : selectedWeapon.awakening_passives}
                powerScore={selectedWeapon.power_score}
                dropRates={computeDropRates(selectedWeapon.power_score)}
                lootLocationKeys={computeLootLocations(selectedWeapon.power_score)}
                expeditionBoss={computeExpeditionBoss(selectedWeapon.power_score)}
                scoreColor={selectedWeapon.power_score <= 30 ? '#22c55e' : selectedWeapon.power_score <= 50 ? '#eab308'
                  : selectedWeapon.power_score <= 70 ? '#f97316' : '#ef4444'}
                creator={selectedWeapon.creator_username}
              />
              <button onClick={() => setSelectedWeapon(null)}
                className="mt-4 w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-400 transition-colors"
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Helper: build passive desc from template + params ────
function buildPassiveDesc(id, params) {
  const t = FORGE_PASSIVE_TEMPLATES[id];
  if (!t || id === 'none') return '';
  let d = t.desc;
  for (const [k, v] of Object.entries(params || {})) {
    // durationTurns: 0 = permanent
    if (k === 'durationTurns' && (v === 0 || v === '0')) {
      d = d.replace(/Dure \{durationTurns\} tours[^.]*\.?/, 'Effet permanent.');
      d = d.replace(/pendant \{durationTurns\} tours/, 'en permanence');
      d = d.replace(`{${k}}`, '∞');
      continue;
    }
    d = d.replace(`{${k}}`, v);
  }
  return d;
}

// ── Weapon Preview Card ──────────────────────────────────
function WeaponPreview({ name, element, weaponType, rarity, atk, bonusStat, bonusValue,
  scalingStat, passives, awakeningPassives, powerScore, dropRates, lootLocationKeys, expeditionBoss, scoreColor, creator }) {

  const wt = WEAPON_TYPES.find(t => t.key === weaponType);
  const el = ELEMENTS.find(e => e.key === element);
  const statLabel = BONUS_STAT_OPTIONS.find(s => s.key === bonusStat)?.label || bonusStat;

  // Normalize passives (could be array of {id, params} or legacy)
  const activePassives = (passives || []).filter(p => p.id && p.id !== 'none');

  return (
    <div className={`bg-gradient-to-b ${RARITY_BG[rarity] || 'from-gray-900/40'} to-gray-900 border rounded-xl p-5 relative overflow-hidden`}
      style={{ borderColor: RARITY_COLORS[rarity] || '#4b5563' }}
    >
      {/* Rarity badge */}
      <div className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
        style={{ backgroundColor: RARITY_COLORS[rarity] + '30', color: RARITY_COLORS[rarity] }}
      >
        {rarity}
      </div>

      {/* Icon + Name */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{wt?.icon || '⚔️'}</span>
        <div>
          <h3 className="font-bold text-lg" style={{ color: RARITY_COLORS[rarity] }}>{name}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {el && <span style={{ color: el.color }}>{el.label}</span>}
            <span>•</span>
            <span>{wt?.label}</span>
            {scalingStat === 'int' && <span className="text-purple-400">(INT)</span>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center bg-black/30 rounded-lg px-3 py-2">
          <span className="text-xs text-gray-400">{scalingStat === 'int' ? 'INT' : 'ATK'}</span>
          <span className="font-bold text-amber-400">{atk}</span>
        </div>
        {bonusStat && bonusValue > 0 && (
          <div className="flex justify-between items-center bg-black/30 rounded-lg px-3 py-2">
            <span className="text-xs text-gray-400">{statLabel}</span>
            <span className="font-bold text-blue-400">+{bonusValue}{bonusStat.includes('flat') ? '' : '%'}</span>
          </div>
        )}
      </div>

      {/* Passives (up to 3) */}
      {activePassives.length > 0 && (
        <div className="space-y-2 mb-4">
          {activePassives.map((p, i) => (
            <div key={i} className="bg-purple-900/20 border border-purple-800/30 rounded-lg px-3 py-2">
              <span className="text-[10px] text-purple-400 font-bold uppercase">
                Passif {activePassives.length > 1 ? `${i + 1}` : ''} : {FORGE_PASSIVE_TEMPLATES[p.id]?.name}
              </span>
              <p className="text-xs text-gray-300 mt-1">{buildPassiveDesc(p.id, p.params)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Awakening */}
      {awakeningPassives?.length > 0 && (
        <div className="mb-4">
          <span className="text-[10px] text-gray-500 font-bold uppercase">Éveil A1-A5</span>
          <div className="grid grid-cols-5 gap-1 mt-1">
            {awakeningPassives.map((aw, i) => (
              <div key={i} className="bg-black/30 rounded px-1.5 py-1 text-center">
                <span className="text-[9px] text-amber-400 block">A{i + 1}</span>
                <span className="text-[10px] text-white">+{aw.value}%</span>
                <span className="text-[8px] text-gray-500 block">{aw.key?.replace(/_/g, ' ').replace('pct', '%')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Power Score */}
      <div className="bg-black/40 rounded-lg px-3 py-2 text-center mb-3">
        <span className="text-[10px] text-gray-500 block">Power Score</span>
        <span className="text-xl font-bold" style={{ color: scoreColor }}>{powerScore}</span>
      </div>

      {/* Loot locations + drop rates */}
      <div className="bg-emerald-900/20 border border-emerald-800/30 rounded-lg px-3 py-2.5 mb-3 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <MapPin size={12} className="text-emerald-400 flex-shrink-0" />
          <span className="text-[10px] text-emerald-400 font-bold uppercase">Lieux d'obtention</span>
        </div>
        {LOOT_LOCATIONS.map(loc => {
          const active = lootLocationKeys?.includes(loc.key);
          const rate = dropRates?.[loc.key];
          return (
            <div key={loc.key} className={`flex items-center justify-between text-xs px-2 py-1 rounded ${active ? 'bg-black/30' : 'bg-black/10 opacity-40 line-through'}`}>
              <span className={active ? 'text-gray-300' : 'text-gray-600'}>
                {loc.icon} {loc.label}
                {loc.key === 'expedition' && expeditionBoss && (
                  <span className="text-amber-400 ml-1">
                    {expeditionBoss.min === expeditionBoss.max
                      ? `(Boss ${expeditionBoss.min})`
                      : `(Boss ${expeditionBoss.min}-${expeditionBoss.max})`}
                  </span>
                )}
              </span>
              {active && rate != null && (
                <span className={`font-bold ${rate >= 5 ? 'text-green-400' : rate >= 0.1 ? 'text-amber-400' : 'text-red-400'}`}>
                  {formatDropRate(rate)}
                </span>
              )}
            </div>
          );
        })}
        {lootLocationKeys?.length === 1 && (
          <p className="text-[10px] text-red-400 italic mt-1">Arme trop puissante — Expédition uniquement !</p>
        )}
      </div>

      {/* Creator */}
      <div className="text-center text-[10px] text-gray-600 border-t border-gray-800 pt-2">
        Forgée par <span className="text-amber-400">{creator}</span>
      </div>
    </div>
  );
}

// ── Weapon Card (gallery/list) ───────────────────────────
function WeaponCard({ weapon, onClick, showDelete, onDelete }) {
  const w = weapon;
  const el = ELEMENTS.find(e => e.key === w.element);
  const wt = WEAPON_TYPES.find(t => t.key === w.weapon_type);

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 cursor-pointer transition-colors relative"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{wt?.icon || '⚔️'}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold truncate" style={{ color: RARITY_COLORS[w.rarity] }}>{w.name}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {el && <span style={{ color: el.color }}>{el.label}</span>}
            <span>ATK {w.atk}</span>
            <span>•</span>
            <span>Score {w.power_score}</span>
            <span>•</span>
            <span className={Number(w.drop_rate) >= 1 ? 'text-green-500' : Number(w.drop_rate) >= 0.01 ? 'text-amber-500' : 'text-red-500'}>
              {formatDropRate(computeBaseDropRate(w.power_score))}
            </span>
          </div>
        </div>
        <div className="text-right text-[10px] text-gray-600">
          par <span className="text-amber-400">{w.creator_username}</span>
        </div>
      </div>
      {showDelete && (
        <button onClick={e => { e.stopPropagation(); onDelete(); }}
          className="absolute top-2 right-2 text-gray-600 hover:text-red-400 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      )}
    </motion.div>
  );
}
