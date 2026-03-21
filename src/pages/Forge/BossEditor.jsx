// src/pages/Forge/BossEditor.jsx — CreateYourOwnBoss Editor
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Sword, Heart, Zap, Target, Settings, Plus, Trash2, Copy,
  ChevronDown, ChevronUp, Play, Pause, RotateCcw,
  Save, Upload, AlertTriangle, Info, GripVertical, Flame, Droplets, Globe,
  Wind, Mountain, Sparkles, Crown, Clock, ArrowLeft, Link, Unlink, ArrowDown, Eye,
} from 'lucide-react';
import {
  PATTERN_TYPES, PATTERN_CATEGORIES, TARGETING_MODES, TARGETING_CATEGORIES,
  DEBUFF_TYPES, BOSS_BUFF_TYPES, getPatternDefaults,
} from '../../data/patternLibrary.js';
import { API_URL } from '../../utils/api.js';

// ── Colors ──────────────────────────────────────────────
const PHASE_COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#22c55e', '#ec4899', '#06b6d4', '#f97316'];
const CAT_COLORS = { geometric: '#3b82f6', targeted: '#f59e0b', special: '#ef4444' };

// ── Default boss config ──────────────────────────────────
function createDefaultBoss() {
  return {
    name: '',
    description: '',
    color: '#ef4444',
    radius: 75,
    spriteUrl: null,
    sprites: {
      idle: { down: null, up: null, left: null, right: null },
      atk: { down: null, up: null, left: null, right: null },
    },
    mapBg: null,
    // Stats
    hp: 1_000_000_000,
    atk: 15000,
    def: 250,
    spd: 50,
    // Enrage
    enrageTimer: 600,
    enrageDmgMult: 2.0,
    enrageSpdMult: 2.0,
    enrageHpPercent: 5,
    // Auto-attack
    autoAttack: { power: 1.0, range: 120, interval: 2.0, coneAngle: 60 },
    globalCooldown: 1.5,
    anchorCenter: true,
    // Phases
    phases: [
      { hpPercent: 100, label: 'Phase 1' },
    ],
    // Patterns
    patterns: [],
  };
}

let nextPatternUid = 1;

const LS_KEY = 'boss_editor_draft';
const LS_BOSS_ID_KEY = 'boss_editor_current_id';

function restoreUidCounter(config) {
  let maxUid = 0;
  (config.patterns || []).forEach(p => { if (p._uid > maxUid) maxUid = p._uid; });
  nextPatternUid = maxUid + 1;
}

// Migrate old single spriteUrl → new multi-sprite structure
function migrateSprites(config) {
  const empty = { down: null, up: null, left: null, right: null };
  if (!config.sprites) {
    config.sprites = {
      idle: { ...empty, down: config.spriteUrl || null },
      atk: { ...empty },
    };
  } else {
    // Ensure all keys exist
    if (!config.sprites.idle) config.sprites.idle = { ...empty };
    if (!config.sprites.atk) config.sprites.atk = { ...empty };
    for (const dir of ['down', 'up', 'left', 'right']) {
      if (config.sprites.idle[dir] === undefined) config.sprites.idle[dir] = null;
      if (config.sprites.atk[dir] === undefined) config.sprites.atk[dir] = null;
    }
  }
  return config;
}

export default function BossEditor({ onBack, editBossId }) {
  const [boss, setBoss] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        restoreUidCounter(parsed);
        migrateSprites(parsed);
        return parsed;
      }
    } catch { /* ignore */ }
    return createDefaultBoss();
  });
  const [bossId, setBossId] = useState(() => localStorage.getItem(LS_BOSS_ID_KEY) || null);
  const [activeTab, setActiveTab] = useState('identity'); // identity | stats | phases | patterns
  const [selectedPatternIdx, setSelectedPatternIdx] = useState(null);
  const [patternLibOpen, setPatternLibOpen] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false); // false | 'saving' | 'saved' | 'error'
  const [saveError, setSaveError] = useState(null);
  const [testOpen, setTestOpen] = useState(false);
  const [myBosses, setMyBosses] = useState(null); // null = not loaded, [] = loaded
  const [showMyBosses, setShowMyBosses] = useState(false);
  const [bossStatus, setBossStatus] = useState('draft');
  const [showAtkSprites, setShowAtkSprites] = useState(false);
  const spriteInputRef = useRef(null);
  const spriteInputRefs = useRef({});
  const mapInputRef = useRef(null);

  // ── Load from DB if editBossId is set ─────────────────────
  useEffect(() => {
    const loadId = editBossId || bossId;
    if (!loadId) return;
    const token = localStorage.getItem('builderberu_auth_token');
    if (!token) return;
    fetch(`${API_URL}/boss-editor?action=get&bossId=${loadId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(r => r.json()).then(data => {
      if (data.success && data.boss?.config) {
        const config = typeof data.boss.config === 'string' ? JSON.parse(data.boss.config) : data.boss.config;
        restoreUidCounter(config);
        migrateSprites(config);
        setBoss(config);
        setBossId(data.boss.boss_id);
        setBossStatus(data.boss.status || 'draft');
        localStorage.setItem(LS_KEY, JSON.stringify(config));
        localStorage.setItem(LS_BOSS_ID_KEY, data.boss.boss_id);
      }
    }).catch(() => { /* offline — use localStorage */ });
  }, [editBossId]); // only on mount / editBossId change

  // ── Auto-save to localStorage on changes ──────────────────
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(boss)); } catch { /* */ }
  }, [boss]);

  // ── Save to DB ────────────────────────────────────────────
  const saveDraft = useCallback(async () => {
    const token = localStorage.getItem('builderberu_auth_token');
    if (!token) {
      // Fallback: localStorage only (not logged in)
      setSaveFlash('saved');
      setTimeout(() => setSaveFlash(false), 1500);
      return;
    }

    setSaveFlash('saving');
    try {
      const action = bossId ? 'update' : 'create';
      const body = {
        name: boss.name || 'Sans nom',
        description: boss.description || '',
        config: boss,
        ...(bossId && { bossId }),
      };
      const resp = await fetch(`${API_URL}/boss-editor?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const result = await resp.json();
      if (result.success) {
        if (result.bossId && !bossId) {
          setBossId(result.bossId);
          localStorage.setItem(LS_BOSS_ID_KEY, result.bossId);
        }
        setSaveFlash('saved');
      } else {
        console.warn('[BossEditor] Save failed:', result.error);
        setSaveFlash('error');
        setSaveError(result.error || 'Erreur inconnue');
      }
    } catch {
      setSaveFlash('error');
      setSaveError('Erreur réseau');
    }
    setTimeout(() => { setSaveFlash(false); setSaveError(null); }, 5000);
  }, [boss, bossId]);

  // ── Load my bosses list ───────────────────────────────────
  const loadMyBosses = useCallback(async () => {
    const token = localStorage.getItem('builderberu_auth_token');
    if (!token) return;
    try {
      const resp = await fetch(`${API_URL}/boss-editor?action=my-bosses`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await resp.json();
      if (data.success) setMyBosses(data.bosses || []);
    } catch { /* offline */ }
  }, []);

  // ── Publish / Unpublish ────────────────────────────────────
  const togglePublish = useCallback(async () => {
    if (!bossId) return;
    const token = localStorage.getItem('builderberu_auth_token');
    if (!token) return;
    try {
      const resp = await fetch(`${API_URL}/boss-editor?action=publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ bossId }),
      });
      const data = await resp.json();
      if (data.success) {
        setBossStatus(data.status);
      } else {
        setSaveError(data.error || 'Erreur publication');
        setTimeout(() => setSaveError(null), 5000);
      }
    } catch {
      setSaveError('Erreur réseau');
      setTimeout(() => setSaveError(null), 5000);
    }
  }, [bossId]);

  // ── Load a specific boss from list ────────────────────────
  const loadBoss = useCallback(async (id) => {
    const token = localStorage.getItem('builderberu_auth_token');
    if (!token) return;
    try {
      const resp = await fetch(`${API_URL}/boss-editor?action=get&bossId=${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await resp.json();
      if (data.success && data.boss?.config) {
        const config = typeof data.boss.config === 'string' ? JSON.parse(data.boss.config) : data.boss.config;
        restoreUidCounter(config);
        migrateSprites(config);
        setBoss(config);
        setBossId(data.boss.boss_id);
        setBossStatus(data.boss.status || 'draft');
        localStorage.setItem(LS_KEY, JSON.stringify(config));
        localStorage.setItem(LS_BOSS_ID_KEY, data.boss.boss_id);
        setShowMyBosses(false);
        setSelectedPatternIdx(null);
      }
    } catch { /* */ }
  }, []);

  // ── New boss (reset) ──────────────────────────────────────
  const newBoss = useCallback(() => {
    setBoss(createDefaultBoss());
    setBossId(null);
    localStorage.removeItem(LS_BOSS_ID_KEY);
    setSelectedPatternIdx(null);
    setShowMyBosses(false);
  }, []);

  // ── Delete a boss ─────────────────────────────────────────
  const deleteBoss = useCallback(async (id) => {
    const token = localStorage.getItem('builderberu_auth_token');
    if (!token) return;
    try {
      const resp = await fetch(`${API_URL}/boss-editor?action=delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ bossId: id }),
      });
      const data = await resp.json();
      if (data.success) {
        setMyBosses(prev => prev?.filter(b => b.boss_id !== id) || []);
        if (bossId === id) newBoss();
      }
    } catch { /* */ }
  }, [bossId, newBoss]);

  // ── File upload handlers ────────────────────────────────
  const handleFileUpload = useCallback((file, key, maxW, maxH) => {
    if (!file) return;
    if (file.size > 512_000) { alert('Fichier trop lourd (max 500KB)'); return; }
    if (!file.type.startsWith('image/')) { alert('Format image requis (PNG/WebP)'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Resize if needed
        if (img.width > maxW || img.height > maxH) {
          const canvas = document.createElement('canvas');
          const scale = Math.min(maxW / img.width, maxH / img.height);
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          setBoss(b => ({ ...b, [key]: canvas.toDataURL('image/webp', 0.85) }));
        } else {
          setBoss(b => ({ ...b, [key]: e.target.result }));
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }, []);

  // ── Updaters ────────────────────────────────────────────
  const update = useCallback((key, val) => setBoss(b => ({ ...b, [key]: val })), []);
  const updateAutoAtk = useCallback((key, val) => setBoss(b => ({
    ...b, autoAttack: { ...b.autoAttack, [key]: val },
  })), []);

  // Update a sprite in the sprites object: updateSprite('idle', 'down', url)
  const updateSprite = useCallback((state, dir, val) => {
    setBoss(b => ({
      ...b,
      sprites: {
        ...b.sprites,
        [state]: { ...b.sprites[state], [dir]: val },
      },
      // Keep spriteUrl in sync for rétrocompat (use idle.down as primary)
      ...(state === 'idle' && dir === 'down' ? { spriteUrl: val } : {}),
    }));
  }, []);

  // Handle sprite file upload for a specific state+direction
  const handleSpriteUpload = useCallback((file, state, dir) => {
    if (!file) return;
    if (file.size > 512_000) { alert('Fichier trop lourd (max 500KB)'); return; }
    if (!file.type.startsWith('image/')) { alert('Format image requis (PNG/WebP)'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 400, maxH = 400;
        if (img.width > maxW || img.height > maxH) {
          const canvas = document.createElement('canvas');
          const scale = Math.min(maxW / img.width, maxH / img.height);
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          updateSprite(state, dir, canvas.toDataURL('image/webp', 0.85));
        } else {
          updateSprite(state, dir, e.target.result);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }, [updateSprite]);

  // ── Phase CRUD ──────────────────────────────────────────
  const addPhase = () => {
    setBoss(b => {
      const lastHp = b.phases[b.phases.length - 1]?.hpPercent || 100;
      const newHp = Math.max(5, lastHp - 30);
      return { ...b, phases: [...b.phases, { hpPercent: newHp, label: `Phase ${b.phases.length + 1}` }] };
    });
  };
  const removePhase = (idx) => {
    if (boss.phases.length <= 1) return;
    setBoss(b => ({ ...b, phases: b.phases.filter((_, i) => i !== idx) }));
  };
  const updatePhase = (idx, key, val) => {
    setBoss(b => ({
      ...b,
      phases: b.phases.map((p, i) => i === idx ? { ...p, [key]: val } : p),
    }));
  };

  // ── Pattern CRUD ────────────────────────────────────────
  const addPattern = (type) => {
    const defaults = getPatternDefaults(type);
    const typeDef = PATTERN_TYPES[type];
    const newP = {
      ...defaults,
      _uid: nextPatternUid++,
      id: `pattern_${Date.now()}`,
      name: typeDef?.name || type,
      type,
      phases: boss.phases.map((_, i) => i),
      isTrueDamage: typeDef?.forceTrueDamage || false,
      chainTo: null,      // _uid of next pattern in combo (null = none)
      chainDelay: 1.5,    // seconds between end of this pattern and start of chained one
    };
    setBoss(b => ({ ...b, patterns: [...b.patterns, newP] }));
    setSelectedPatternIdx(boss.patterns.length);
    setPatternLibOpen(false);
  };

  const removePattern = (idx) => {
    setBoss(b => {
      const removedUid = b.patterns[idx]?._uid;
      const filtered = b.patterns
        .filter((_, i) => i !== idx)
        .map(p => p.chainTo === removedUid ? { ...p, chainTo: null } : p);
      return { ...b, patterns: filtered };
    });
    if (selectedPatternIdx === idx) setSelectedPatternIdx(null);
    else if (selectedPatternIdx > idx) setSelectedPatternIdx(selectedPatternIdx - 1);
  };

  const duplicatePattern = (idx) => {
    setBoss(b => {
      const copy = { ...b.patterns[idx], _uid: nextPatternUid++, id: `pattern_${Date.now()}`, name: b.patterns[idx].name + ' (copie)', chainTo: null };
      const newP = [...b.patterns];
      newP.splice(idx + 1, 0, copy);
      return { ...b, patterns: newP };
    });
  };

  const updatePattern = useCallback((idx, key, val) => {
    setBoss(b => ({
      ...b,
      patterns: b.patterns.map((p, i) => i === idx ? { ...p, [key]: val } : p),
    }));
  }, []);

  // ── Canvas Preview (shared draw function) ───────────────
  const drawPattern = useCallback((canvas, p, size) => {
    if (!canvas || !p) return;
    const ctx = canvas.getContext('2d');
    const W = size || canvas.width, H = size || canvas.height;
    const cx = W / 2, cy = H / 2;
    ctx.clearRect(0, 0, W, H);

    // Arena bg
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, W, H);

    // Boss circle
    const scale = W / 1600;
    const bossR = boss.radius * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, bossR, 0, Math.PI * 2);
    ctx.fillStyle = boss.color + '80';
    ctx.fill();
    ctx.strokeStyle = boss.color;
    ctx.lineWidth = Math.max(1, 2 * (W / 280));
    ctx.stroke();

    ctx.globalAlpha = 0.35;
    switch (p.type) {
      case 'cone_telegraph': {
        const range = (p.range || 250) * scale;
        const halfAngle = ((p.coneAngle || 90) * Math.PI / 180) / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, range, -halfAngle, halfAngle);
        ctx.closePath();
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        break;
      }
      case 'aoe_ring': {
        const inner = (p.innerRadius || 0) * scale;
        const outer = (p.outerRadius || 300) * scale;
        ctx.beginPath();
        ctx.arc(cx, cy, outer, 0, Math.PI * 2);
        if (inner > 0) { ctx.moveTo(cx + inner, cy); ctx.arc(cx, cy, inner, 0, Math.PI * 2, true); }
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
        break;
      }
      case 'donut': {
        const safe = (p.innerSafe || 150) * scale;
        const outer = (p.outerRadius || 600) * scale;
        ctx.beginPath();
        ctx.arc(cx, cy, outer, 0, Math.PI * 2);
        ctx.arc(cx, cy, safe, 0, Math.PI * 2, true);
        ctx.fillStyle = '#ef444480';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, safe, 0, Math.PI * 2);
        ctx.fillStyle = '#22c55e40';
        ctx.fill();
        break;
      }
      case 'line_telegraph': case 'laser': {
        const range = (p.range || 800) * scale;
        const halfW = ((p.lineWidth || 80) * scale) / 2;
        ctx.fillStyle = p.type === 'laser' ? (p.laserColor || '#8b5cf6') + '80' : '#ef444480';
        ctx.fillRect(cx, cy - halfW, range, halfW * 2);
        break;
      }
      case 'rotating_laser': {
        const range = (p.range || 800) * scale;
        const halfW = ((p.lineWidth || 60) * scale) / 2;
        const isCW = (p.direction || 'cw') === 'cw';
        const startAngle = -Math.PI / 6;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(startAngle);
        ctx.fillStyle = (p.laserColor || '#ef4444') + '70';
        ctx.fillRect(0, -halfW, range, halfW * 2);
        // Show rotation arc with direction arrow
        ctx.strokeStyle = (p.laserColor || '#ef4444') + '30';
        ctx.lineWidth = Math.max(1, halfW * 2);
        ctx.beginPath();
        if (isCW) {
          ctx.arc(0, 0, range * 0.6, -Math.PI / 6, Math.PI / 4);
        } else {
          ctx.arc(0, 0, range * 0.6, Math.PI / 4, -Math.PI / 6, true);
        }
        ctx.stroke();
        // Direction arrow at arc end
        const arrowAngle = isCW ? Math.PI / 4 + startAngle : -Math.PI / 6 + startAngle;
        const arrowR = range * 0.6;
        const ax = Math.cos(arrowAngle) * arrowR;
        const ay = Math.sin(arrowAngle) * arrowR;
        ctx.fillStyle = (p.laserColor || '#ef4444') + '60';
        ctx.beginPath();
        const aSize = Math.max(6, halfW * 1.5);
        const aTangent = isCW ? arrowAngle + Math.PI / 2 : arrowAngle - Math.PI / 2;
        ctx.moveTo(ax + Math.cos(aTangent) * aSize, ay + Math.sin(aTangent) * aSize);
        ctx.lineTo(ax + Math.cos(aTangent + 2.5) * aSize * 0.7, ay + Math.sin(aTangent + 2.5) * aSize * 0.7);
        ctx.lineTo(ax + Math.cos(aTangent - 2.5) * aSize * 0.7, ay + Math.sin(aTangent - 2.5) * aSize * 0.7);
        ctx.fill();
        ctx.restore();
        break;
      }
      case 'fire_wave': {
        const maxR = (p.maxRadius || 500) * scale;
        ctx.strokeStyle = p.waveColor || '#f97316';
        ctx.lineWidth = Math.max(1, 3 * (W / 280));
        ctx.beginPath();
        ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
        ctx.stroke();
        for (let i = 1; i <= 3; i++) {
          ctx.beginPath();
          ctx.arc(cx, cy, maxR * i / 4, 0, Math.PI * 2);
          ctx.strokeStyle = (p.waveColor || '#f97316') + '40';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        break;
      }
      case 'targeted_aoe_multi': {
        const r = (p.aoeRadius || 100) * scale;
        const count = p.targetCount || 3;
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 * i / count) - Math.PI / 2;
          const dist = 180 * scale;
          const tx = cx + Math.cos(angle) * dist;
          const ty = cy + Math.sin(angle) * dist;
          ctx.beginPath();
          ctx.arc(tx, ty, r, 0, Math.PI * 2);
          ctx.fillStyle = '#f59e0b60';
          ctx.fill();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        break;
      }
      case 'shadow_mark': {
        const r = (p.explodeRadius || 130) * scale;
        const count = p.targetCount || 4;
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 * i / count) + Math.PI / 4;
          const dist = 200 * scale;
          const tx = cx + Math.cos(angle) * dist;
          const ty = cy + Math.sin(angle) * dist;
          ctx.beginPath();
          ctx.arc(tx, ty, r, 0, Math.PI * 2);
          ctx.fillStyle = '#a855f760';
          ctx.fill();
        }
        break;
      }
      case 'persistent_aoe': {
        const r = (p.aoeRadius || 150) * scale;
        const dist = 120 * scale;
        ctx.beginPath();
        ctx.arc(cx + dist, cy - dist * 0.3, r, 0, Math.PI * 2);
        ctx.fillStyle = '#ef444450';
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
        break;
      }
      case 'percent_hp_attack': {
        const outer = (p.outerRadius || 450) * scale;
        const inner = (p.innerSafe || 0) * scale;
        ctx.beginPath();
        ctx.arc(cx, cy, outer, 0, Math.PI * 2);
        if (inner > 0) ctx.arc(cx, cy, inner, 0, Math.PI * 2, true);
        ctx.fillStyle = '#dc262660';
        ctx.fill();
        break;
      }
      case 'double_donut': {
        const r1 = 200 * scale, r2 = 400 * scale;
        // Phase 1 indicator
        ctx.beginPath();
        ctx.arc(cx, cy, r2, 0, Math.PI * 2);
        ctx.arc(cx, cy, r1, 0, Math.PI * 2, true);
        ctx.fillStyle = '#ef444450';
        ctx.fill();
        // Phase 2 indicator (inner)
        ctx.beginPath();
        ctx.arc(cx, cy, r1, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f630';
        ctx.fill();
        break;
      }
      case 'soul_drain': {
        // Drain visual: lines from edges to boss
        ctx.strokeStyle = '#dc262680';
        ctx.lineWidth = Math.max(1, 2 * (W / 280));
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI * 2 * i / 6);
          const dist = W * 0.4;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist);
          ctx.lineTo(cx, cy);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(cx, cy, bossR * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#dc262630';
        ctx.fill();
        break;
      }
      case 'aoe_full': case 'dps_check': {
        // Full screen effect
        ctx.fillStyle = p.type === 'dps_check' ? '#fbbf2420' : '#ef444430';
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = p.type === 'dps_check' ? '#fbbf24' : '#ef4444';
        ctx.lineWidth = Math.max(1, 2 * (W / 280));
        ctx.strokeRect(2, 2, W - 4, H - 4);
        break;
      }
      default: {
        ctx.fillStyle = '#ffffff10';
        ctx.fillRect(0, 0, W, H);
        if (W >= 100) {
          ctx.fillStyle = '#666';
          ctx.font = `${Math.max(10, W * 0.05)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('Aperçu non disponible', cx, cy);
        }
      }
    }
    ctx.globalAlpha = 1;
  }, [boss.radius, boss.color]);

  // drawPattern is passed to PatternPreviewAnim for static rendering

  // ── Selected pattern ref ────────────────────────────────
  const selPattern = selectedPatternIdx != null ? boss.patterns[selectedPatternIdx] : null;
  const selTypeDef = selPattern ? PATTERN_TYPES[selPattern.type] : null;

  // ── Chain helpers ───────────────────────────────────────
  // Build a map of _uid → pattern for quick lookup
  const patternByUid = useMemo(() => {
    const map = {};
    boss.patterns.forEach(p => { map[p._uid] = p; });
    return map;
  }, [boss.patterns]);

  // Get the full chain starting from a pattern
  const getChain = useCallback((startUid) => {
    const chain = [];
    const visited = new Set();
    let current = startUid;
    while (current != null && !visited.has(current)) {
      visited.add(current);
      const p = patternByUid[current];
      if (!p) break;
      chain.push(p);
      current = p.chainTo;
    }
    return chain;
  }, [patternByUid]);

  // Check if a pattern is already part of someone else's chain (non-head)
  const isChainChild = useCallback((uid) => {
    return boss.patterns.some(p => p.chainTo === uid);
  }, [boss.patterns]);

  // Detect circular chain if we set pattern[fromUid].chainTo = toUid
  const wouldCreateCycle = useCallback((fromUid, toUid) => {
    if (toUid == null) return false;
    const visited = new Set([fromUid]);
    let current = toUid;
    while (current != null) {
      if (visited.has(current)) return true;
      visited.add(current);
      const p = patternByUid[current];
      if (!p) break;
      current = p.chainTo;
    }
    return false;
  }, [patternByUid]);

  // ── Summary stats ───────────────────────────────────────
  const patternCount = boss.patterns.length;
  const phaseCount = boss.phases.length;

  // ── Render ──────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Crown size={24} className="text-amber-400" /> Créer un Boss
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {boss.name || 'Sans nom'} — {phaseCount} phase{phaseCount > 1 ? 's' : ''} — {patternCount} pattern{patternCount > 1 ? 's' : ''}
            {bossId && <span className="ml-2 text-green-500/60 text-xs">cloud</span>}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => { setShowMyBosses(s => !s); if (!myBosses) loadMyBosses(); }}
            className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm flex items-center gap-2 transition-colors">
            <Upload size={16} /> Mes Boss
          </button>
          <button onClick={newBoss}
            className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm flex items-center gap-2 transition-colors">
            <Plus size={16} /> Nouveau
          </button>
          <button onClick={saveDraft}
            className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
              saveFlash === 'saving' ? 'bg-amber-600 text-white' :
              saveFlash === 'saved' ? 'bg-green-600 text-white' :
              saveFlash === 'error' ? 'bg-red-600 text-white' :
              'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}>
            <Save size={16} /> {
              saveFlash === 'saving' ? 'Sauvegarde...' :
              saveFlash === 'saved' ? 'Sauvegardé !' :
              saveFlash === 'error' ? 'Erreur !' :
              bossId ? 'Sauvegarder' : 'Créer'
            }
          </button>
          <button onClick={() => setTestOpen(true)}
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm flex items-center gap-2 transition-colors font-bold">
            <Play size={16} /> Tester
          </button>
          {bossId && (
            <button onClick={togglePublish}
              className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors font-bold ${
                bossStatus === 'published'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-purple-600 hover:bg-purple-500 text-white'
              }`}>
              <Globe size={16} /> {bossStatus === 'published' ? 'Publié ✓' : 'Publier'}
            </button>
          )}
        </div>
        {saveError && (
          <div className="mt-2 px-4 py-2 bg-red-900/60 border border-red-500/40 rounded-lg text-red-300 text-sm">
            {saveError}
          </div>
        )}
      </div>

      {/* My Bosses Panel */}
      <AnimatePresence>
        {showMyBosses && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="mb-4 overflow-hidden">
            <div className="bg-gray-900/80 border border-gray-700 rounded-xl p-4">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Upload size={16} className="text-purple-400" /> Mes Boss sauvegardés
              </h3>
              {!myBosses ? (
                <p className="text-xs text-gray-500">Chargement...</p>
              ) : myBosses.length === 0 ? (
                <p className="text-xs text-gray-500">Aucun boss sauvegardé. Clique "Créer" pour sauvegarder ton premier boss.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {myBosses.map(b => (
                    <div key={b.boss_id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        bossId === b.boss_id
                          ? 'border-amber-500/50 bg-amber-500/10'
                          : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
                      }`}
                      onClick={() => loadBoss(b.boss_id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{b.name}</span>
                        <button onClick={(e) => { e.stopPropagation(); if (confirm(`Supprimer "${b.name}" ?`)) deleteBoss(b.boss_id); }}
                          className="text-gray-600 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {b.phase_count} phase{b.phase_count > 1 ? 's' : ''} · {b.pattern_count} pattern{b.pattern_count > 1 ? 's' : ''}
                        {b.status === 'draft' && <span className="ml-2 text-amber-400">brouillon</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-gray-800/50 rounded-xl p-1">
        {[
          { key: 'identity', label: 'Identité', icon: Crown },
          { key: 'stats', label: 'Stats', icon: Sword },
          { key: 'phases', label: 'Phases', icon: Zap },
          { key: 'patterns', label: 'Patterns', icon: Target },
          { key: 'preview', label: 'Preview', icon: Eye },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === t.key
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <t.icon size={16} /> {t.label}
            {t.key === 'patterns' && patternCount > 0 && (
              <span className="ml-1 bg-amber-500/30 text-amber-300 text-xs px-1.5 rounded-full">{patternCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>

          {/* ═══ IDENTITY TAB ═══ */}
          {activeTab === 'identity' && (
            <div className="space-y-4">
              <Panel title="Identité du Boss">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nom du Boss</Label>
                    <input value={boss.name} onChange={e => update('name', e.target.value)} maxLength={40}
                      placeholder="Ex: Gardien de la Forêt"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 focus:outline-none" />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <input value={boss.description} onChange={e => update('description', e.target.value)} maxLength={120}
                      placeholder="Un ancien gardien corrompu..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 focus:outline-none" />
                  </div>
                </div>
              </Panel>

              <Panel title="Apparence">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Couleur du boss</Label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={boss.color} onChange={e => update('color', e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-gray-600" />
                      <span className="text-gray-400 text-xs font-mono">{boss.color}</span>
                    </div>
                  </div>
                  <div>
                    <Label>Taille hitbox (rayon px)</Label>
                    <Slider value={boss.radius} min={40} max={150} step={5}
                      onChange={v => update('radius', v)} unit="px" />
                  </div>
                  <div>
                    <Label>Ancrage centre</Label>
                    <Toggle value={boss.anchorCenter} onChange={v => update('anchorCenter', v)}
                      labelOn="Revient au centre" labelOff="Libre" />
                  </div>
                </div>

                {/* ── Sprites du boss ── */}
                <Panel title="Sprites du boss" subtitle="PNG/WebP, max 500KB par sprite">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* IDLE column */}
                    <div>
                      <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" /> IDLE (repos)
                      </h4>
                      <div className="space-y-2">
                        {[
                          { dir: 'down', label: 'Down ↓', required: true },
                          { dir: 'up', label: 'Up ↑' },
                          { dir: 'left', label: 'Left ←' },
                        ].map(({ dir, label, required }) => {
                          const val = boss.sprites?.idle?.[dir];
                          const refKey = `idle_${dir}`;
                          return (
                            <div key={dir} className="flex items-center gap-2">
                              <div className="w-12 h-12 rounded-lg border border-dashed border-gray-600 flex items-center justify-center bg-gray-800/50 flex-shrink-0 overflow-hidden">
                                {val ? <img src={val} alt={label} className="w-full h-full object-contain" /> : <span className="text-gray-600 text-[9px]">—</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                  {label}
                                  {required && <span className="text-amber-500 text-[9px] font-bold">Requis</span>}
                                </p>
                              </div>
                              <input ref={el => spriteInputRefs.current[refKey] = el} type="file" accept="image/png,image/webp,image/jpeg" className="hidden"
                                onChange={e => { handleSpriteUpload(e.target.files[0], 'idle', dir); e.target.value = ''; }} />
                              <button onClick={() => spriteInputRefs.current[refKey]?.click()}
                                className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-[10px] text-gray-300 flex-shrink-0">
                                <Upload size={10} />
                              </button>
                              {val && (
                                <button onClick={() => updateSprite('idle', dir, null)}
                                  className="p-1 rounded hover:bg-red-900/30 text-gray-600 hover:text-red-400 flex-shrink-0">
                                  <Trash2 size={10} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                        {/* Right = auto flip of Left */}
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-12 rounded-lg border border-dashed border-gray-600 flex items-center justify-center bg-gray-800/50 flex-shrink-0 overflow-hidden">
                            {(boss.sprites?.idle?.right || boss.sprites?.idle?.left)
                              ? <img src={boss.sprites?.idle?.right || boss.sprites?.idle?.left} alt="Right"
                                  className="w-full h-full object-contain" style={!boss.sprites?.idle?.right && boss.sprites?.idle?.left ? { transform: 'scaleX(-1)' } : {}} />
                              : <span className="text-gray-600 text-[9px]">—</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-400">Right →</p>
                            {!boss.sprites?.idle?.right && boss.sprites?.idle?.left && (
                              <p className="text-[8px] text-green-500">Auto (flip de Left)</p>
                            )}
                          </div>
                          {!boss.sprites?.idle?.left && (
                            <>
                              <input ref={el => spriteInputRefs.current['idle_right'] = el} type="file" accept="image/png,image/webp,image/jpeg" className="hidden"
                                onChange={e => { handleSpriteUpload(e.target.files[0], 'idle', 'right'); e.target.value = ''; }} />
                              <button onClick={() => spriteInputRefs.current['idle_right']?.click()}
                                className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-[10px] text-gray-300 flex-shrink-0">
                                <Upload size={10} />
                              </button>
                            </>
                          )}
                          {boss.sprites?.idle?.right && (
                            <button onClick={() => updateSprite('idle', 'right', null)}
                              className="p-1 rounded hover:bg-red-900/30 text-gray-600 hover:text-red-400 flex-shrink-0">
                              <Trash2 size={10} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ATK column */}
                    <div>
                      <button onClick={() => setShowAtkSprites(!showAtkSprites)}
                        className="text-xs font-bold text-white mb-3 flex items-center gap-2 hover:text-amber-400 transition-colors w-full">
                        <span className="w-2 h-2 rounded-full bg-red-500" /> ATK (attaque)
                        <span className="text-[9px] text-gray-500 font-normal">optionnel</span>
                        {showAtkSprites ? <ChevronUp size={12} className="ml-auto" /> : <ChevronDown size={12} className="ml-auto" />}
                      </button>
                      {showAtkSprites && (
                        <div className="space-y-2">
                          {[
                            { dir: 'down', label: 'Down ↓' },
                            { dir: 'up', label: 'Up ↑' },
                            { dir: 'left', label: 'Left ←' },
                          ].map(({ dir, label }) => {
                            const val = boss.sprites?.atk?.[dir];
                            const refKey = `atk_${dir}`;
                            return (
                              <div key={dir} className="flex items-center gap-2">
                                <div className="w-12 h-12 rounded-lg border border-dashed border-gray-600 flex items-center justify-center bg-gray-800/50 flex-shrink-0 overflow-hidden">
                                  {val ? <img src={val} alt={label} className="w-full h-full object-contain" /> : <span className="text-gray-600 text-[9px]">—</span>}
                                </div>
                                <p className="text-[10px] text-gray-400 flex-1">{label}</p>
                                <input ref={el => spriteInputRefs.current[refKey] = el} type="file" accept="image/png,image/webp,image/jpeg" className="hidden"
                                  onChange={e => { handleSpriteUpload(e.target.files[0], 'atk', dir); e.target.value = ''; }} />
                                <button onClick={() => spriteInputRefs.current[refKey]?.click()}
                                  className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-[10px] text-gray-300 flex-shrink-0">
                                  <Upload size={10} />
                                </button>
                                {val && (
                                  <button onClick={() => updateSprite('atk', dir, null)}
                                    className="p-1 rounded hover:bg-red-900/30 text-gray-600 hover:text-red-400 flex-shrink-0">
                                    <Trash2 size={10} />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                          {/* ATK Right = auto flip */}
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-12 rounded-lg border border-dashed border-gray-600 flex items-center justify-center bg-gray-800/50 flex-shrink-0 overflow-hidden">
                              {(boss.sprites?.atk?.right || boss.sprites?.atk?.left)
                                ? <img src={boss.sprites?.atk?.right || boss.sprites?.atk?.left} alt="Right ATK"
                                    className="w-full h-full object-contain" style={!boss.sprites?.atk?.right && boss.sprites?.atk?.left ? { transform: 'scaleX(-1)' } : {}} />
                                : <span className="text-gray-600 text-[9px]">—</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] text-gray-400">Right →</p>
                              {!boss.sprites?.atk?.right && boss.sprites?.atk?.left && (
                                <p className="text-[8px] text-green-500">Auto (flip de Left ATK)</p>
                              )}
                            </div>
                            {!boss.sprites?.atk?.left && (
                              <>
                                <input ref={el => spriteInputRefs.current['atk_right'] = el} type="file" accept="image/png,image/webp,image/jpeg" className="hidden"
                                  onChange={e => { handleSpriteUpload(e.target.files[0], 'atk', 'right'); e.target.value = ''; }} />
                                <button onClick={() => spriteInputRefs.current['atk_right']?.click()}
                                  className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-[10px] text-gray-300 flex-shrink-0">
                                  <Upload size={10} />
                                </button>
                              </>
                            )}
                            {boss.sprites?.atk?.right && (
                              <button onClick={() => updateSprite('atk', 'right', null)}
                                className="p-1 rounded hover:bg-red-900/30 text-gray-600 hover:text-red-400 flex-shrink-0">
                                <Trash2 size={10} />
                              </button>
                            )}
                          </div>
                          {!Object.values(boss.sprites?.atk || {}).some(v => v) && (
                            <p className="text-[9px] text-gray-500 italic">Aucun sprite ATK → le moteur utilisera les sprites IDLE en combat</p>
                          )}
                        </div>
                      )}
                      {!showAtkSprites && (
                        <p className="text-[9px] text-gray-500 italic">Cliquer pour ajouter des sprites d'attaque</p>
                      )}
                    </div>
                  </div>
                </Panel>

                <div className="grid grid-cols-1 gap-4 mt-4">
                  <div>
                    <Label>Map / Background (1600×1200, optionnel)</Label>
                    <div className="flex items-center gap-3">
                      <div className="w-28 h-20 rounded-xl border-2 border-dashed border-gray-600 flex items-center justify-center bg-gray-800/50 text-gray-600 text-xs">
                        {boss.mapBg
                          ? <img src={boss.mapBg} alt="map" className="w-full h-full object-cover rounded-xl" />
                          : 'Défaut'
                        }
                      </div>
                      <input ref={mapInputRef} type="file" accept="image/png,image/webp,image/jpeg" className="hidden"
                        onChange={e => handleFileUpload(e.target.files[0], 'mapBg', 1600, 1200)} />
                      <button onClick={() => mapInputRef.current?.click()}
                        className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm text-gray-300 flex items-center gap-2 transition-colors">
                        <Upload size={14} /> Upload map
                      </button>
                      {boss.mapBg && (
                        <button onClick={() => update('mapBg', null)}
                          className="p-2 rounded-lg hover:bg-red-900/30 text-gray-600 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Panel>
            </div>
          )}

          {/* ═══ STATS TAB ═══ */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <Panel title="Stats principales">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <Label>HP <span className="text-gray-500">({formatBigNumber(boss.hp)})</span></Label>
                    <Slider value={boss.hp} min={100_000_000} max={15_000_000_000} step={100_000_000}
                      onChange={v => update('hp', v)} format={formatBigNumber} />
                  </div>
                  <div>
                    <Label>ATK</Label>
                    <Slider value={boss.atk} min={5000} max={50000} step={500}
                      onChange={v => update('atk', v)} format={v => v.toLocaleString()} />
                  </div>
                  <div>
                    <Label>DEF</Label>
                    <Slider value={boss.def} min={50} max={800} step={10}
                      onChange={v => update('def', v)} />
                  </div>
                  <div>
                    <Label>SPD</Label>
                    <Slider value={boss.spd} min={20} max={100} step={1}
                      onChange={v => update('spd', v)} />
                  </div>
                  <div>
                    <Label>Cooldown global entre patterns (s)</Label>
                    <Slider value={boss.globalCooldown ?? 1.5} min={0.3} max={5.0} step={0.1}
                      onChange={v => update('globalCooldown', v)} unit="s" />
                  </div>
                </div>
              </Panel>

              <Panel title="Enrage">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <Label>Timer enrage (sec)</Label>
                    <Slider value={boss.enrageTimer} min={120} max={900} step={10}
                      onChange={v => update('enrageTimer', v)} unit="s" />
                  </div>
                  <div>
                    <Label>Enrage à HP% restant</Label>
                    <Slider value={boss.enrageHpPercent} min={3} max={15} step={1}
                      onChange={v => update('enrageHpPercent', v)} unit="%" />
                  </div>
                  <div>
                    <Label>Multiplicateur dégâts enragé</Label>
                    <Slider value={boss.enrageDmgMult} min={1.5} max={4.0} step={0.1}
                      onChange={v => update('enrageDmgMult', v)} unit="×" />
                  </div>
                  <div>
                    <Label>Multiplicateur vitesse enragé</Label>
                    <Slider value={boss.enrageSpdMult} min={1.5} max={4.0} step={0.1}
                      onChange={v => update('enrageSpdMult', v)} unit="×" />
                  </div>
                </div>
              </Panel>

              <Panel title="Auto-attack (basique du boss)">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <Label>Power (multiplicateur ATK)</Label>
                    <Slider value={boss.autoAttack.power} min={0.3} max={3.0} step={0.1}
                      onChange={v => updateAutoAtk('power', v)} unit="×" />
                  </div>
                  <div>
                    <Label>Portée (px)</Label>
                    <Slider value={boss.autoAttack.range} min={60} max={250} step={5}
                      onChange={v => updateAutoAtk('range', v)} unit="px" />
                  </div>
                  <div>
                    <Label>Intervalle (sec)</Label>
                    <Slider value={boss.autoAttack.interval} min={0.8} max={5.0} step={0.1}
                      onChange={v => updateAutoAtk('interval', v)} unit="s" />
                  </div>
                  <div>
                    <Label>Angle cône (°)</Label>
                    <Slider value={boss.autoAttack.coneAngle} min={30} max={150} step={5}
                      onChange={v => updateAutoAtk('coneAngle', v)} unit="°" />
                  </div>
                </div>
              </Panel>
            </div>
          )}

          {/* ═══ PHASES TAB ═══ */}
          {activeTab === 'phases' && (
            <div className="space-y-4">
              <Panel title="Phases du Boss" action={
                <button onClick={addPhase} disabled={boss.phases.length >= 8}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <Plus size={14} /> Phase
                </button>
              }>
                <div className="space-y-3">
                  {boss.phases.map((phase, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: PHASE_COLORS[idx] }} />
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input value={phase.label} onChange={e => updatePhase(idx, 'label', e.target.value)}
                          placeholder="Nom de la phase"
                          className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-sm focus:border-amber-500 focus:outline-none" />
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-xs whitespace-nowrap">Seuil HP:</span>
                          <input type="number" value={phase.hpPercent}
                            onChange={e => updatePhase(idx, 'hpPercent', Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                            min={1} max={100}
                            className="w-16 bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-white text-sm text-center focus:border-amber-500 focus:outline-none" />
                          <span className="text-gray-500 text-xs">%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-xs">Patterns:</span>
                          <span className="text-amber-400 text-sm font-bold">
                            {boss.patterns.filter(p => p.phases?.includes(idx)).length}
                          </span>
                        </div>
                      </div>
                      {idx > 0 && (
                        <button onClick={() => removePhase(idx)} className="p-1.5 rounded-lg hover:bg-red-900/30 text-gray-600 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {boss.phases.length < 2 && (
                  <p className="text-gray-500 text-xs mt-3 flex items-center gap-1">
                    <Info size={12} /> Ajoute au moins 2 phases pour des combats dynamiques.
                  </p>
                )}
              </Panel>
            </div>
          )}

          {/* ═══ PATTERNS TAB ═══ */}
          {activeTab === 'patterns' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Pattern list (left) */}
              <div className="lg:col-span-2 space-y-3">
                <Panel title="Patterns" action={
                  <button onClick={() => setPatternLibOpen(!patternLibOpen)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1 transition-colors">
                    <Plus size={14} /> Pattern
                  </button>
                }>
                  {/* Pattern Library dropdown */}
                  <AnimatePresence>
                    {patternLibOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-3">
                        <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 space-y-2">
                          <p className="text-gray-400 text-xs font-medium mb-2">Choisir un type de pattern :</p>
                          {Object.entries(PATTERN_CATEGORIES).map(([catKey, cat]) => (
                            <div key={catKey}>
                              <p className="text-xs font-bold mb-1" style={{ color: cat.color }}>{cat.label}</p>
                              <div className="grid grid-cols-2 gap-1">
                                {Object.entries(PATTERN_TYPES)
                                  .filter(([, def]) => def.category === catKey)
                                  .map(([typeKey, def]) => (
                                    <button key={typeKey} onClick={() => addPattern(typeKey)}
                                      className="text-left px-2 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 hover:text-white transition-colors flex items-center gap-1.5">
                                      <span>{def.icon}</span> {def.name}
                                      {def.advanced && <span className="text-[9px] text-amber-400 bg-amber-900/30 px-1 rounded">ADV</span>}
                                    </button>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Pattern entries */}
                  {boss.patterns.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">
                      <Target size={32} className="mx-auto mb-2 opacity-40" />
                      <p className="text-sm">Aucun pattern</p>
                      <p className="text-xs mt-1">Clique "+" pour en ajouter</p>
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {boss.patterns.map((p, idx) => {
                        const typeDef = PATTERN_TYPES[p.type];
                        const isSelected = selectedPatternIdx === idx;
                        const hasChain = p.chainTo != null;
                        const chainTarget = hasChain ? boss.patterns.find(pp => pp._uid === p.chainTo) : null;
                        const isChildOfChain = isChainChild(p._uid);
                        return (
                          <React.Fragment key={p._uid || idx}>
                            <div
                              onClick={() => setSelectedPatternIdx(idx)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all border ${
                                isSelected
                                  ? 'bg-amber-900/30 border-amber-500/50 text-white'
                                  : isChildOfChain
                                    ? 'bg-purple-900/10 border-purple-500/20 hover:bg-purple-900/20 text-gray-300'
                                    : 'bg-gray-800/30 border-transparent hover:bg-gray-800/60 text-gray-300'
                              }`}
                            >
                              {isChildOfChain && (
                                <span className="text-purple-500 text-[10px] shrink-0" title="Fait partie d'un combo">
                                  <Link size={10} />
                                </span>
                              )}
                              <span className="text-sm">{typeDef?.icon || '?'}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{p.name}</p>
                                <p className="text-[10px] text-gray-500">{typeDef?.name} — W:{p.weight}</p>
                              </div>
                              <div className="flex gap-0.5 shrink-0">
                                {p.phases?.map(ph => (
                                  <div key={ph} className="w-2 h-2 rounded-full" style={{ backgroundColor: PHASE_COLORS[ph] }} />
                                ))}
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <button onClick={e => { e.stopPropagation(); duplicatePattern(idx); }}
                                  className="p-1 rounded hover:bg-gray-700 text-gray-500 hover:text-white transition-colors">
                                  <Copy size={12} />
                                </button>
                                <button onClick={e => { e.stopPropagation(); removePattern(idx); }}
                                  className="p-1 rounded hover:bg-red-900/30 text-gray-500 hover:text-red-400 transition-colors">
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                            {/* Chain connector arrow */}
                            {hasChain && chainTarget && (
                              <div className="flex items-center gap-2 pl-6 py-0.5">
                                <div className="flex flex-col items-center">
                                  <div className="w-px h-2 bg-purple-500/40" />
                                  <ArrowDown size={10} className="text-purple-400" />
                                  <div className="w-px h-2 bg-purple-500/40" />
                                </div>
                                <span className="text-[9px] text-purple-400 font-mono bg-purple-900/30 rounded px-1.5 py-0.5">
                                  {p.chainDelay}s → {PATTERN_TYPES[chainTarget.type]?.icon} {chainTarget.name}
                                </span>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  )}
                </Panel>
              </div>

              {/* Pattern config (right) */}
              <div className="lg:col-span-3 space-y-3">
                {selPattern ? (
                  <>
                    {/* Name & type */}
                    <Panel title={`${selTypeDef?.icon || ''} ${selPattern.name}`} subtitle={selTypeDef?.desc}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Nom du pattern</Label>
                          <input value={selPattern.name} onChange={e => updatePattern(selectedPatternIdx, 'name', e.target.value)}
                            maxLength={40}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 focus:outline-none" />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <p className="text-sm text-amber-400 font-medium">{selTypeDef?.name || selPattern.type}</p>
                        </div>
                      </div>
                    </Panel>

                    {/* Geometry params */}
                    {selTypeDef && Object.keys(selTypeDef.params).length > 0 && (
                      <Panel title="Géométrie">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(selTypeDef.params).map(([paramKey, paramDef]) => {
                            if (paramDef.type === 'select' || paramDef.options) {
                              return (
                                <div key={paramKey}>
                                  <Label>{paramDef.label}</Label>
                                  <select value={selPattern[paramKey] || paramDef.default}
                                    onChange={e => updatePattern(selectedPatternIdx, paramKey, e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500 focus:outline-none">
                                    {paramDef.options.map((o, i) => <option key={o} value={o}>{paramDef.optionLabels?.[i] || o}</option>)}
                                  </select>
                                </div>
                              );
                            }
                            return (
                              <div key={paramKey}>
                                <Label>{paramDef.label}</Label>
                                <Slider
                                  value={selPattern[paramKey] ?? paramDef.default}
                                  min={paramDef.min} max={paramDef.max} step={paramDef.step}
                                  onChange={v => updatePattern(selectedPatternIdx, paramKey, v)}
                                  unit={paramDef.label.includes('(px)') ? 'px' : paramDef.label.includes('(°)') ? '°' : paramDef.label.includes('(s)') ? 's' : paramDef.label.includes('(M)') ? 'M' : ''}
                                />
                              </div>
                            );
                          })}
                        </div>

                        {/* Animated preview */}
                        <div className="mt-4">
                          <PatternPreviewAnim pattern={selPattern} bossRadius={boss.radius} bossColor={boss.color} drawStatic={drawPattern} />
                        </div>
                      </Panel>
                    )}

                    {/* Timing */}
                    <Panel title="Timing">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <Label>Telegraph (s)</Label>
                          <Slider value={selPattern.telegraphTime} min={0.5} max={4.0} step={0.1}
                            onChange={v => updatePattern(selectedPatternIdx, 'telegraphTime', v)} unit="s" />
                        </div>
                        <div>
                          <Label>Cast (s)</Label>
                          <Slider value={selPattern.castTime} min={0.1} max={2.0} step={0.1}
                            onChange={v => updatePattern(selectedPatternIdx, 'castTime', v)} unit="s" />
                        </div>
                        <div>
                          <Label>Recovery (s)</Label>
                          <Slider value={selPattern.recoveryTime} min={0.3} max={3.0} step={0.1}
                            onChange={v => updatePattern(selectedPatternIdx, 'recoveryTime', v)} unit="s" />
                        </div>
                        <div>
                          <Label>Cooldown (s)</Label>
                          <Slider value={selPattern.cooldown} min={3} max={120} step={1}
                            onChange={v => updatePattern(selectedPatternIdx, 'cooldown', v)} unit="s" />
                        </div>
                      </div>
                    </Panel>

                    {/* Damage */}
                    <Panel title="Dégâts">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Power (× ATK)</Label>
                          <Slider value={selPattern.power} min={0.3} max={6.0} step={0.1}
                            onChange={v => updatePattern(selectedPatternIdx, 'power', v)} unit="×" />
                        </div>
                        <div>
                          <Label>True Damage</Label>
                          <Toggle value={selPattern.isTrueDamage}
                            onChange={v => updatePattern(selectedPatternIdx, 'isTrueDamage', v)}
                            labelOn="Ignore DEF" labelOff="Normal"
                            disabled={selTypeDef?.forceTrueDamage} />
                        </div>
                        <div>
                          <Label>Weight (fréquence)</Label>
                          <Slider value={selPattern.weight} min={1} max={5} step={1}
                            onChange={v => updatePattern(selectedPatternIdx, 'weight', v)} />
                        </div>
                      </div>
                    </Panel>

                    {/* Targeting — categorized */}
                    <Panel title="Ciblage">
                      <div className="space-y-3">
                        {Object.entries(TARGETING_CATEGORIES).map(([catKey, cat]) => {
                          const modes = TARGETING_MODES.filter(m => m.category === catKey);
                          return (
                            <div key={catKey}>
                              <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: cat.color }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                                {cat.label}
                                <span className="text-gray-600 font-normal normal-case">— {cat.desc}</span>
                              </p>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                                {modes.map(t => {
                                  const active = (selPattern.targeting || 'highest_aggro') === t.key;
                                  return (
                                    <button key={t.key}
                                      onClick={() => updatePattern(selectedPatternIdx, 'targeting', t.key)}
                                      className={`px-2.5 py-2 rounded-lg text-xs text-left transition-all border ${
                                        active
                                          ? 'border-opacity-50 text-white'
                                          : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                                      }`}
                                      style={active ? { backgroundColor: cat.color + '25', borderColor: cat.color + '60', color: cat.color } : {}}
                                    >
                                      <p className="font-medium">{t.icon} {t.label}</p>
                                      <p className="text-[10px] text-gray-500 mt-0.5">{t.desc}</p>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Panel>

                    {/* Phase availability */}
                    <Panel title="Phases actives">
                      <div className="flex gap-2 flex-wrap">
                        {boss.phases.map((phase, idx) => {
                          const active = selPattern.phases?.includes(idx);
                          return (
                            <button key={idx}
                              onClick={() => {
                                const newPhases = active
                                  ? selPattern.phases.filter(p => p !== idx)
                                  : [...(selPattern.phases || []), idx].sort();
                                updatePattern(selectedPatternIdx, 'phases', newPhases);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                                active
                                  ? 'text-white border-opacity-50'
                                  : 'bg-gray-800/50 border-gray-700/30 text-gray-600'
                              }`}
                              style={active ? { backgroundColor: PHASE_COLORS[idx] + '30', borderColor: PHASE_COLORS[idx] + '80', color: PHASE_COLORS[idx] } : {}}
                            >
                              {phase.label}
                            </button>
                          );
                        })}
                      </div>
                    </Panel>

                    {/* Visual */}
                    {selTypeDef?.extraVisual && (
                      <Panel title="Visuel">
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(selTypeDef.extraVisual).map(([vKey, vDef]) => (
                            <div key={vKey}>
                              <Label>{vDef.label}</Label>
                              {vDef.type === 'color' ? (
                                <div className="flex items-center gap-3">
                                  <input type="color" value={selPattern[vKey] || vDef.default}
                                    onChange={e => updatePattern(selectedPatternIdx, vKey, e.target.value)}
                                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-gray-600" />
                                  <span className="text-gray-400 text-xs font-mono">{selPattern[vKey] || vDef.default}</span>
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </Panel>
                    )}

                    {/* ── Combo / Chain ── */}
                    <Panel title={<span className="flex items-center gap-2"><Link size={14} className="text-purple-400" /> Combo / Enchaînement</span>}>
                      {selPattern.chainTo != null ? (
                        // Active chain — show linked pattern + delay + unlink
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 bg-purple-900/20 border border-purple-500/30 rounded-xl p-3">
                            <div className="flex flex-col items-center gap-1 shrink-0">
                              <div className="w-8 h-8 rounded-lg bg-amber-900/40 border border-amber-500/40 flex items-center justify-center text-sm">
                                {selTypeDef?.icon || '?'}
                              </div>
                              <ArrowDown size={14} className="text-purple-400" />
                              <div className="text-[10px] text-purple-300 font-mono bg-purple-900/40 rounded px-1.5 py-0.5">
                                {selPattern.chainDelay}s
                              </div>
                              <ArrowDown size={14} className="text-purple-400" />
                              <div className="w-8 h-8 rounded-lg bg-purple-900/40 border border-purple-500/40 flex items-center justify-center text-sm">
                                {PATTERN_TYPES[patternByUid[selPattern.chainTo]?.type]?.icon || '?'}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-400">Après ce pattern, le boss enchaîne :</p>
                              <p className="text-sm text-purple-300 font-bold mt-1">
                                {patternByUid[selPattern.chainTo]?.name || 'Pattern supprimé'}
                              </p>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                {PATTERN_TYPES[patternByUid[selPattern.chainTo]?.type]?.desc || ''}
                              </p>
                              {/* Show full chain preview if multi-step */}
                              {(() => {
                                const chain = getChain(selPattern._uid);
                                if (chain.length > 2) {
                                  return (
                                    <div className="mt-2 flex items-center gap-1 flex-wrap">
                                      {chain.map((cp, ci) => (
                                        <React.Fragment key={cp._uid}>
                                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${ci === 0 ? 'bg-amber-900/40 text-amber-300' : 'bg-purple-900/30 text-purple-300'}`}>
                                            {PATTERN_TYPES[cp.type]?.icon} {cp.name}
                                          </span>
                                          {ci < chain.length - 1 && (
                                            <span className="text-[9px] text-purple-500">→ {cp.chainDelay}s →</span>
                                          )}
                                        </React.Fragment>
                                      ))}
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                            <button onClick={() => updatePattern(selectedPatternIdx, 'chainTo', null)}
                              className="p-2 rounded-lg hover:bg-red-900/30 text-gray-500 hover:text-red-400 transition-colors shrink-0"
                              title="Supprimer le lien">
                              <Unlink size={16} />
                            </button>
                          </div>
                          <div>
                            <Label>Délai entre les deux (s)</Label>
                            <Slider value={selPattern.chainDelay} min={0.3} max={5.0} step={0.1}
                              onChange={v => updatePattern(selectedPatternIdx, 'chainDelay', v)} unit="s" />
                          </div>
                          <div>
                            <Label>Changer le pattern chaîné</Label>
                            <select
                              value={selPattern.chainTo}
                              onChange={e => {
                                const val = e.target.value === '' ? null : parseInt(e.target.value);
                                if (val != null && wouldCreateCycle(selPattern._uid, val)) {
                                  alert('Boucle infinie détectée ! Ce lien créerait un cycle.');
                                  return;
                                }
                                updatePattern(selectedPatternIdx, 'chainTo', val);
                              }}
                              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-purple-500 focus:outline-none"
                            >
                              <option value="">— Aucun (fin du combo) —</option>
                              {boss.patterns.filter(p => p._uid !== selPattern._uid).map(p => {
                                const td = PATTERN_TYPES[p.type];
                                const cycle = wouldCreateCycle(selPattern._uid, p._uid);
                                return (
                                  <option key={p._uid} value={p._uid} disabled={cycle}>
                                    {td?.icon || '?'} {p.name}{cycle ? ' (cycle !)' : ''}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        </div>
                      ) : (
                        // No chain — show add button
                        <div>
                          <p className="text-xs text-gray-500 mb-3">
                            Chaîne ce pattern avec un autre pour créer un combo automatique.
                            Comme le Double Donut de Manaya : anneau externe → pause → anneau interne.
                          </p>
                          {boss.patterns.length < 2 ? (
                            <p className="text-xs text-gray-600 flex items-center gap-1">
                              <Info size={12} /> Ajoute au moins 2 patterns pour créer des combos.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              <Label>Enchaîner avec :</Label>
                              <div className="grid grid-cols-1 gap-1.5">
                                {boss.patterns.filter(p => p._uid !== selPattern._uid).map(p => {
                                  const td = PATTERN_TYPES[p.type];
                                  const cycle = wouldCreateCycle(selPattern._uid, p._uid);
                                  return (
                                    <button key={p._uid}
                                      onClick={() => {
                                        if (cycle) return;
                                        updatePattern(selectedPatternIdx, 'chainTo', p._uid);
                                      }}
                                      disabled={cycle}
                                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left transition-all border ${
                                        cycle
                                          ? 'opacity-30 cursor-not-allowed bg-gray-900 border-gray-800 text-gray-600'
                                          : 'bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-purple-900/20 hover:border-purple-500/30 hover:text-purple-300'
                                      }`}
                                    >
                                      <span className="text-sm">{td?.icon || '?'}</span>
                                      <div className="flex-1">
                                        <p className="font-medium">{p.name}</p>
                                        <p className="text-[10px] text-gray-500">{td?.name}</p>
                                      </div>
                                      <Link size={12} className="text-purple-500 opacity-0 group-hover:opacity-100" />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Panel>
                  </>
                ) : (
                  <div className="text-center py-20 text-gray-600">
                    <Settings size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Sélectionne un pattern pour le configurer</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ PREVIEW TAB ═══ */}
          {activeTab === 'preview' && (
            <PatternTimeline boss={boss} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Test Simulator Modal */}
      <AnimatePresence>
        {testOpen && (
          <BossTestSimulator boss={boss} drawPattern={drawPattern} onClose={() => setTestOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Reusable UI Components ──────────────────────────────
function Panel({ title, subtitle, action, children }) {
  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-white">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Label({ children }) {
  return <label className="block text-xs text-gray-400 mb-1.5 font-medium">{children}</label>;
}

function Slider({ value, min, max, step, onChange, unit, format }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex items-center gap-3">
      <input type="range" value={value} min={min} max={max} step={step}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
        style={{ background: `linear-gradient(to right, #d97706 0%, #d97706 ${pct}%, #374151 ${pct}%, #374151 100%)` }}
      />
      <span className="text-xs text-amber-400 font-mono w-16 text-right shrink-0">
        {format ? format(value) : value}{unit || ''}
      </span>
    </div>
  );
}

function Toggle({ value, onChange, labelOn, labelOff, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!value)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${value
        ? 'bg-amber-900/30 border-amber-500/40 text-amber-300'
        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
      }`}
    >
      <div className={`w-8 h-4 rounded-full relative transition-colors ${value ? 'bg-amber-500' : 'bg-gray-600'}`}>
        <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${value ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </div>
      <span className="text-xs">{value ? labelOn : labelOff}</span>
    </button>
  );
}

function formatBigNumber(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(0) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
  return n.toString();
}

// ── Animated Pattern Preview ─────────────────────────────
// Plays: telegraph (flashing outline) → cast (solid fill expanding) → hit (flash) → recovery (fade)
// Loops automatically. Shows timing bar at bottom.
function PatternPreviewAnim({ pattern, bossRadius, bossColor, drawStatic }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [phase, setPhase] = useState('idle'); // idle | telegraph | cast | hit | recovery
  const startTimeRef = useRef(0);

  const SIZE = 320;
  const p = pattern;
  if (!p) return null;

  const totalTime = (p.telegraphTime || 1.5) + (p.castTime || 0.4) + 0.3 + (p.recoveryTime || 1.0);

  const draw = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = SIZE, H = SIZE;
    const cx = W / 2, cy = H / 2;
    const scale = W / 1600;
    const elapsed = (timestamp - startTimeRef.current) / 1000;

    // Determine current phase
    const tTele = p.telegraphTime || 1.5;
    const tCast = p.castTime || 0.4;
    const tHit = 0.3;
    const tRec = p.recoveryTime || 1.0;

    let currentPhase, phaseProgress;
    if (elapsed < tTele) {
      currentPhase = 'telegraph';
      phaseProgress = elapsed / tTele;
    } else if (elapsed < tTele + tCast) {
      currentPhase = 'cast';
      phaseProgress = (elapsed - tTele) / tCast;
    } else if (elapsed < tTele + tCast + tHit) {
      currentPhase = 'hit';
      phaseProgress = (elapsed - tTele - tCast) / tHit;
    } else if (elapsed < tTele + tCast + tHit + tRec) {
      currentPhase = 'recovery';
      phaseProgress = (elapsed - tTele - tCast - tHit) / tRec;
    } else {
      // Loop
      startTimeRef.current = timestamp;
      currentPhase = 'telegraph';
      phaseProgress = 0;
    }
    setPhase(currentPhase);

    // Clear
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, W, H);

    // Boss
    const bossR = bossRadius * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, bossR, 0, Math.PI * 2);
    ctx.fillStyle = bossColor + (currentPhase === 'cast' ? 'cc' : '60');
    ctx.fill();
    ctx.strokeStyle = bossColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pattern shape based on phase
    const drawPatternShape = (alpha, sizeMultiplier) => {
      ctx.globalAlpha = alpha;
      const sm = sizeMultiplier;
      switch (p.type) {
        case 'cone_telegraph': {
          const range = (p.range || 250) * scale * sm;
          const halfAngle = ((p.coneAngle || 90) * Math.PI / 180) / 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, range, -halfAngle, halfAngle);
          ctx.closePath();
          ctx.fillStyle = '#ef4444';
          ctx.fill();
          break;
        }
        case 'aoe_ring': {
          const inner = (p.innerRadius || 0) * scale * sm;
          const outer = (p.outerRadius || 300) * scale * sm;
          ctx.beginPath();
          ctx.arc(cx, cy, outer, 0, Math.PI * 2);
          if (inner > 0) { ctx.moveTo(cx + inner, cy); ctx.arc(cx, cy, inner, 0, Math.PI * 2, true); }
          ctx.fillStyle = '#3b82f6';
          ctx.fill();
          break;
        }
        case 'donut': {
          const safe = (p.innerSafe || 150) * scale * sm;
          const outer = (p.outerRadius || 600) * scale * sm;
          ctx.beginPath();
          ctx.arc(cx, cy, outer, 0, Math.PI * 2);
          ctx.arc(cx, cy, safe, 0, Math.PI * 2, true);
          ctx.fillStyle = '#ef4444';
          ctx.fill();
          ctx.globalAlpha = alpha * 0.5;
          ctx.beginPath();
          ctx.arc(cx, cy, safe, 0, Math.PI * 2);
          ctx.fillStyle = '#22c55e';
          ctx.fill();
          break;
        }
        case 'line_telegraph': case 'laser': {
          const range = (p.range || 800) * scale * sm;
          const halfW = ((p.lineWidth || 80) * scale) / 2;
          ctx.fillStyle = p.type === 'laser' ? (p.laserColor || '#8b5cf6') : '#ef4444';
          ctx.fillRect(cx, cy - halfW, range, halfW * 2);
          break;
        }
        case 'rotating_laser': {
          const range = (p.range || 800) * scale * sm;
          const halfW = ((p.lineWidth || 60) * scale) / 2;
          const rotSpeed = p.rotationSpeed || 1.2;
          const dir = (p.direction || 'cw') === 'cw' ? 1 : -1;
          const angle = currentPhase === 'telegraph'
            ? -Math.PI / 6
            : -Math.PI / 6 + (elapsed - tTele) * rotSpeed * dir;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(angle);
          ctx.fillStyle = (p.laserColor || '#ef4444');
          ctx.fillRect(0, -halfW, range, halfW * 2);
          ctx.restore();
          break;
        }
        case 'fire_wave': {
          const maxR = (p.maxRadius || 500) * scale;
          const currentR = currentPhase === 'telegraph'
            ? maxR * 0.1
            : currentPhase === 'cast'
              ? maxR * (0.1 + 0.9 * phaseProgress)
              : maxR * sm;
          ctx.beginPath();
          ctx.arc(cx, cy, currentR, 0, Math.PI * 2);
          ctx.strokeStyle = p.waveColor || '#f97316';
          ctx.lineWidth = Math.max(2, 8 * (1 - (currentR / maxR)));
          ctx.stroke();
          // Inner rings
          if (currentR > maxR * 0.3) {
            ctx.beginPath();
            ctx.arc(cx, cy, currentR * 0.5, 0, Math.PI * 2);
            ctx.strokeStyle = (p.waveColor || '#f97316') + '40';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
          break;
        }
        case 'targeted_aoe_multi': {
          const r = (p.aoeRadius || 100) * scale * sm;
          const count = p.targetCount || 3;
          for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i / count) - Math.PI / 2;
            const dist = 180 * scale;
            const tx = cx + Math.cos(angle) * dist;
            const ty = cy + Math.sin(angle) * dist;
            ctx.beginPath();
            ctx.arc(tx, ty, r, 0, Math.PI * 2);
            ctx.fillStyle = '#f59e0b';
            ctx.fill();
          }
          break;
        }
        case 'shadow_mark': {
          const r = (p.explodeRadius || 130) * scale * (currentPhase === 'hit' ? 1 : sm * 0.3);
          const count = p.targetCount || 4;
          for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i / count) + Math.PI / 4;
            const dist = 200 * scale;
            const tx = cx + Math.cos(angle) * dist;
            const ty = cy + Math.sin(angle) * dist;
            ctx.beginPath();
            ctx.arc(tx, ty, r, 0, Math.PI * 2);
            ctx.fillStyle = currentPhase === 'hit' ? '#ef4444' : '#a855f7';
            ctx.fill();
          }
          break;
        }
        case 'persistent_aoe': {
          const r = (p.aoeRadius || 150) * scale * sm;
          const dist = 120 * scale;
          ctx.beginPath();
          ctx.arc(cx + dist, cy - dist * 0.3, r, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.fill();
          break;
        }
        case 'soul_drain': {
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 2;
          for (let i = 0; i < 6; i++) {
            const a = (Math.PI * 2 * i / 6) + elapsed * 0.3;
            const dist = W * 0.4 * (1 - phaseProgress * 0.3);
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(a) * dist, cy + Math.sin(a) * dist);
            ctx.lineTo(cx, cy);
            ctx.stroke();
          }
          break;
        }
        case 'double_donut': {
          const r1 = 200 * scale, r2 = 400 * scale;
          if (phaseProgress < 0.5 || currentPhase === 'telegraph') {
            // Phase 1: outer lethal
            ctx.beginPath();
            ctx.arc(cx, cy, r2, 0, Math.PI * 2);
            ctx.arc(cx, cy, r1, 0, Math.PI * 2, true);
            ctx.fillStyle = '#ef4444';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx, cy, r1, 0, Math.PI * 2);
            ctx.fillStyle = '#22c55e40';
            ctx.fill();
          } else {
            // Phase 2: inner lethal
            ctx.beginPath();
            ctx.arc(cx, cy, r1, 0, Math.PI * 2);
            ctx.fillStyle = '#ef4444';
            ctx.fill();
          }
          break;
        }
        default: {
          ctx.fillStyle = '#ef444430';
          ctx.fillRect(0, 0, W, H);
        }
      }
      ctx.globalAlpha = 1;
    };

    // Phase-specific rendering
    if (currentPhase === 'telegraph') {
      // Flashing outline — blink faster as we approach cast
      const blinkRate = 2 + phaseProgress * 8; // Hz increases
      const blink = Math.sin(elapsed * blinkRate * Math.PI * 2) * 0.5 + 0.5;
      drawPatternShape(0.1 + blink * 0.2, 1.0);
      // Telegraph border (dashed)
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = '#fbbf24' + Math.round(60 + blink * 60).toString(16).padStart(2, '0');
      ctx.lineWidth = 2;
      // Simple border around canvas
      ctx.strokeRect(4, 4, W - 8, H - 8);
      ctx.setLineDash([]);
    } else if (currentPhase === 'cast') {
      // Solid, growing to full size
      const expandProgress = 0.7 + phaseProgress * 0.3; // 70% → 100%
      drawPatternShape(0.3 + phaseProgress * 0.4, expandProgress);
    } else if (currentPhase === 'hit') {
      // Flash bright then fade
      const flash = 1 - phaseProgress;
      drawPatternShape(0.5 + flash * 0.5, 1.0);
      // White flash overlay
      ctx.fillStyle = `rgba(255,255,255,${flash * 0.3})`;
      ctx.fillRect(0, 0, W, H);
      // Screen shake effect
      if (flash > 0.5) {
        ctx.save();
        ctx.translate((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
        ctx.restore();
      }
    } else if (currentPhase === 'recovery') {
      // Fade out
      drawPatternShape(0.3 * (1 - phaseProgress), 1.0);
    }

    // ── Timeline bar at bottom ──
    const barY = H - 20;
    const barH = 8;
    const barW = W - 20;
    const barX = 10;
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(barX, barY, barW, barH);

    // Phase segments
    const phases = [
      { name: 'Telegraph', dur: tTele, color: '#fbbf24' },
      { name: 'Cast', dur: tCast, color: '#ef4444' },
      { name: 'Hit', dur: tHit, color: '#ffffff' },
      { name: 'Recovery', dur: tRec, color: '#6b7280' },
    ];
    let x = barX;
    for (const seg of phases) {
      const segW = (seg.dur / totalTime) * barW;
      ctx.fillStyle = seg.color + '40';
      ctx.fillRect(x, barY, segW, barH);
      x += segW;
    }

    // Playhead
    const playheadX = barX + (Math.min(elapsed, totalTime) / totalTime) * barW;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(playheadX - 1, barY - 2, 3, barH + 4);

    // Phase label
    const phaseLabels = { telegraph: 'TELEGRAPH', cast: 'CAST', hit: 'HIT!', recovery: 'RECOVERY' };
    const phaseColors = { telegraph: '#fbbf24', cast: '#ef4444', hit: '#ffffff', recovery: '#6b7280' };
    ctx.fillStyle = phaseColors[currentPhase] || '#fff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(phaseLabels[currentPhase] || '', barX, barY - 6);
    // Timer
    ctx.textAlign = 'right';
    ctx.fillStyle = '#9ca3af';
    ctx.font = '10px monospace';
    ctx.fillText(`${elapsed.toFixed(1)}s / ${totalTime.toFixed(1)}s`, barX + barW, barY - 6);

    animRef.current = requestAnimationFrame(draw);
  }, [p, bossRadius, bossColor, totalTime]);

  const startPreview = useCallback(() => {
    if (playing) {
      cancelAnimationFrame(animRef.current);
      setPlaying(false);
      setPhase('idle');
      // Draw static
      drawStatic(canvasRef.current, p, SIZE);
      return;
    }
    setPlaying(true);
    startTimeRef.current = performance.now();
    animRef.current = requestAnimationFrame((ts) => {
      startTimeRef.current = ts;
      draw(ts);
    });
  }, [playing, draw, drawStatic, p]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  // Draw static when pattern changes and not playing
  useEffect(() => {
    if (!playing) {
      drawStatic(canvasRef.current, p, SIZE);
    }
  }, [p, playing, drawStatic]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <canvas ref={canvasRef} width={SIZE} height={SIZE}
          className="rounded-xl border border-gray-700 bg-[#0f0f1a]" />
        {playing && (
          <div className="absolute top-2 left-2">
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
              phase === 'telegraph' ? 'bg-amber-500/30 text-amber-300' :
              phase === 'cast' ? 'bg-red-500/30 text-red-300' :
              phase === 'hit' ? 'bg-white/30 text-white' :
              'bg-gray-500/30 text-gray-400'
            }`}>
              {phase === 'telegraph' ? `TELEGRAPH ${(p.telegraphTime || 1.5).toFixed(1)}s` :
               phase === 'cast' ? `CAST ${(p.castTime || 0.4).toFixed(1)}s` :
               phase === 'hit' ? 'HIT!' :
               `RECOVERY ${(p.recoveryTime || 1.0).toFixed(1)}s`}
            </span>
          </div>
        )}
      </div>
      <button onClick={startPreview}
        className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
          playing
            ? 'bg-red-600 hover:bg-red-500 text-white'
            : 'bg-amber-600 hover:bg-amber-500 text-white'
        }`}
      >
        {playing ? <><Pause size={14} /> Stop</> : <><Play size={14} /> Aperçu animé</>}
      </button>
    </div>
  );
}

// ── Pattern Timeline Simulator ──────────────────────────
function PatternTimeline({ boss }) {
  const [hpPercent, setHpPercent] = useState(100);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [simDuration, setSimDuration] = useState(60);
  const [timeline, setTimeline] = useState([]);
  const [speed, setSpeed] = useState(1);
  const animRef = useRef(null);
  const lastTimeRef = useRef(null);
  const canvasRef = useRef(null);

  // Determine current phase from HP%
  const currentPhase = useMemo(() => {
    const sorted = [...boss.phases].sort((a, b) => a.hpPercent - b.hpPercent);
    let phase = 0;
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (hpPercent <= sorted[i].hpPercent) { phase = boss.phases.indexOf(sorted[i]); }
    }
    // Find highest phase index where hpPercent <= threshold
    let result = 0;
    for (let i = 0; i < boss.phases.length; i++) {
      if (hpPercent <= boss.phases[i].hpPercent) result = i;
    }
    return result;
  }, [hpPercent, boss.phases]);

  // Build available patterns for current phase
  const availablePatterns = useMemo(() => {
    return boss.patterns.filter(p => {
      if (!p.phases || p.phases.length === 0) return true;
      return p.phases.includes(currentPhase);
    });
  }, [boss.patterns, currentPhase]);

  // Run simulation
  const runSimulation = useCallback(() => {
    const events = [];
    let t = 0;
    let globalCd = 0;
    const cooldowns = {};
    const phase1Idx = currentPhase + 1; // 1-indexed for engine

    while (t < simDuration) {
      // Tick cooldowns
      globalCd = Math.max(0, globalCd - 0.016);
      for (const uid in cooldowns) {
        cooldowns[uid] = Math.max(0, cooldowns[uid] - 0.016);
      }

      if (globalCd > 0) { t += 0.016; continue; }

      // Filter available patterns
      const pool = availablePatterns.filter(p => {
        if (cooldowns[p._uid] > 0) return false;
        return true;
      });

      if (pool.length === 0) { t += 0.016; continue; }

      // Weighted random
      const totalW = pool.reduce((s, p) => s + (p.weight || 2), 0);
      let roll = Math.random() * totalW;
      let selected = pool[pool.length - 1];
      for (const p of pool) {
        roll -= (p.weight || 2);
        if (roll <= 0) { selected = p; break; }
      }

      const telegraph = selected.telegraphTime || 1.5;
      const cast = selected.castTime || 0.4;
      const recovery = selected.recoveryTime || 1.0;
      const totalTime = telegraph + cast + recovery;

      events.push({
        pattern: selected,
        start: t,
        telegraphEnd: t + telegraph,
        castEnd: t + telegraph + cast,
        end: t + totalTime,
        type: 'pattern',
      });

      cooldowns[selected._uid] = selected.cooldown || 10;

      // Handle chain
      let chainT = t + totalTime;
      let cur = selected;
      while (cur.chainTo) {
        const chained = boss.patterns.find(p => p._uid === cur.chainTo);
        if (!chained) break;
        const delay = cur.chainDelay || 0;
        chainT += delay;
        const cTel = chained.telegraphTime || 1.5;
        const cCast = chained.castTime || 0.4;
        const cRec = chained.recoveryTime || 1.0;
        events.push({
          pattern: chained,
          start: chainT,
          telegraphEnd: chainT + cTel,
          castEnd: chainT + cTel + cCast,
          end: chainT + cTel + cCast + cRec,
          type: 'chain',
          parentUid: cur._uid,
        });
        cooldowns[chained._uid] = chained.cooldown || 10;
        chainT += cTel + cCast + cRec;
        cur = chained;
      }

      globalCd = boss.globalCooldown || 1.5;
      t = (events[events.length - 1]?.end || t) + 0.016;
    }

    setTimeline(events);
  }, [availablePatterns, boss.patterns, boss.globalCooldown, currentPhase, simDuration]);

  // Auto-run sim when config changes
  useEffect(() => { runSimulation(); }, [runSimulation]);

  // Play animation
  useEffect(() => {
    if (!playing) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      lastTimeRef.current = null;
      return;
    }
    const tick = (timestamp) => {
      if (lastTimeRef.current != null) {
        const dt = ((timestamp - lastTimeRef.current) / 1000) * speed;
        setElapsed(prev => {
          const next = prev + dt;
          if (next >= simDuration) { setPlaying(false); return simDuration; }
          return next;
        });
      }
      lastTimeRef.current = timestamp;
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [playing, speed, simDuration]);

  // Assign colors to patterns
  const patternColors = useMemo(() => {
    const colors = ['#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#22c55e', '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6'];
    const map = {};
    boss.patterns.forEach((p, i) => { map[p._uid] = colors[i % colors.length]; });
    return map;
  }, [boss.patterns]);

  // Phase background zones
  const phaseZones = useMemo(() => {
    if (boss.phases.length <= 1) return [];
    return boss.phases.map((p, i) => ({
      label: p.label || `Phase ${i + 1}`,
      idx: i,
      color: PHASE_COLORS[i % PHASE_COLORS.length],
    }));
  }, [boss.phases]);

  const pxPerSec = 800 / simDuration; // Rough scale

  if (boss.patterns.length === 0) {
    return (
      <Panel title="Preview — Simulateur de Patterns">
        <div className="text-center py-16 text-gray-500">
          <Target size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aucun pattern configuré — ajoute des patterns dans l'onglet Patterns</p>
        </div>
      </Panel>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Panel title="Preview — Simulateur de Patterns" subtitle="Visualise la séquence de patterns selon la phase et le HP du boss">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <Label>HP du boss (%)</Label>
            <div className="flex items-center gap-2">
              <input type="range" min={1} max={100} value={hpPercent}
                onChange={e => setHpPercent(Number(e.target.value))}
                className="flex-1 accent-amber-500" />
              <span className="text-white text-sm font-bold w-12 text-right">{hpPercent}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Phase active : <span className="text-amber-400 font-medium">{boss.phases[currentPhase]?.label || `Phase ${currentPhase + 1}`}</span>
            </p>
          </div>
          <div>
            <Label>Durée simulation (s)</Label>
            <div className="flex items-center gap-2">
              <input type="range" min={15} max={180} step={5} value={simDuration}
                onChange={e => setSimDuration(Number(e.target.value))}
                className="flex-1 accent-amber-500" />
              <span className="text-white text-sm font-bold w-12 text-right">{simDuration}s</span>
            </div>
          </div>
          <div>
            <Label>Vitesse</Label>
            <div className="flex gap-1">
              {[0.5, 1, 2, 4].map(s => (
                <button key={s} onClick={() => setSpeed(s)}
                  className={`px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
                    speed === s ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}>{s}×</button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-2">
            <button onClick={() => { setPlaying(!playing); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-all">
              {playing ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Play</>}
            </button>
            <button onClick={() => { setElapsed(0); setPlaying(false); lastTimeRef.current = null; runSimulation(); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium transition-all">
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </Panel>

      {/* Timeline */}
      <Panel title="Timeline">
        <div className="relative overflow-x-auto">
          {/* Time axis */}
          <div className="relative h-8 mb-1 border-b border-gray-700">
            {Array.from({ length: Math.ceil(simDuration / 5) + 1 }, (_, i) => i * 5).map(t => (
              <span key={t} className="absolute text-[10px] text-gray-500 -translate-x-1/2"
                style={{ left: `${(t / simDuration) * 100}%` }}>{t}s</span>
            ))}
          </div>

          {/* Phase background */}
          {phaseZones.length > 1 && (
            <div className="relative h-5 mb-1 rounded overflow-hidden">
              {phaseZones.map((pz, i) => {
                // Phase spans from its hpPercent to the next phase's hpPercent
                // For timeline display, show phase as band at top
                const width = 100 / phaseZones.length;
                return (
                  <div key={i} className="absolute top-0 h-full flex items-center justify-center text-[9px] font-medium"
                    style={{
                      left: `${i * width}%`, width: `${width}%`,
                      backgroundColor: `${pz.color}20`, borderRight: '1px solid rgba(255,255,255,0.1)',
                      color: pz.color,
                    }}>
                    {pz.label}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pattern rows */}
          <div className="relative" style={{ minHeight: 60 }}>
            {timeline.map((ev, i) => {
              const left = (ev.start / simDuration) * 100;
              const width = ((ev.end - ev.start) / simDuration) * 100;
              const color = patternColors[ev.pattern._uid] || '#6b7280';
              const telWidth = ((ev.telegraphEnd - ev.start) / (ev.end - ev.start)) * 100;
              const castWidth = ((ev.castEnd - ev.telegraphEnd) / (ev.end - ev.start)) * 100;

              return (
                <div key={i} className="absolute group" title={`${ev.pattern.name} (${ev.start.toFixed(1)}s → ${ev.end.toFixed(1)}s)`}
                  style={{
                    left: `${left}%`, width: `${Math.max(width, 0.3)}%`,
                    top: `${(i % 3) * 22}px`, height: 18,
                  }}>
                  <div className="w-full h-full rounded-sm overflow-hidden flex relative" style={{ backgroundColor: `${color}30`, border: `1px solid ${color}60` }}>
                    {/* Telegraph zone */}
                    <div style={{ width: `${telWidth}%`, backgroundColor: `${color}40` }} />
                    {/* Cast zone */}
                    <div style={{ width: `${castWidth}%`, backgroundColor: `${color}80` }} />
                    {/* Recovery = remaining */}
                  </div>
                  {/* Label */}
                  {width > 2 && (
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white font-medium truncate px-0.5 pointer-events-none">
                      {ev.pattern.name}
                    </span>
                  )}
                  {/* Chain arrow */}
                  {ev.type === 'chain' && (
                    <div className="absolute -left-2.5 top-1/2 -translate-y-1/2">
                      <Link size={8} className="text-amber-400" />
                    </div>
                  )}
                  {/* Tooltip on hover */}
                  <div className="hidden group-hover:block absolute z-50 bottom-full left-0 mb-1 bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs whitespace-nowrap shadow-xl">
                    <p className="text-white font-semibold">{ev.pattern.name}</p>
                    <p className="text-gray-400">Type: {ev.pattern.type}</p>
                    <p className="text-gray-400">
                      <span className="text-blue-400">Tel {(ev.pattern.telegraphTime || 1.5).toFixed(1)}s</span>
                      {' → '}
                      <span className="text-amber-400">Cast {(ev.pattern.castTime || 0.4).toFixed(1)}s</span>
                      {' → '}
                      <span className="text-gray-300">Rec {(ev.pattern.recoveryTime || 1.0).toFixed(1)}s</span>
                    </p>
                    <p className="text-gray-400">Power: {ev.pattern.power || 1.5}× ATK</p>
                    {ev.type === 'chain' && <p className="text-amber-400">Chaîné</p>}
                  </div>
                </div>
              );
            })}

            {/* Playhead */}
            {elapsed > 0 && (
              <div className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10 pointer-events-none"
                style={{ left: `${(elapsed / simDuration) * 100}%` }}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] text-amber-400 font-bold whitespace-nowrap">
                  {elapsed.toFixed(1)}s
                </div>
              </div>
            )}
          </div>
        </div>
      </Panel>

      {/* Legend + Stats */}
      <Panel title="Patterns disponibles" subtitle={`Phase : ${boss.phases[currentPhase]?.label || 'Phase 1'} — ${availablePatterns.length} patterns actifs`}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {availablePatterns.map(p => {
            const color = patternColors[p._uid] || '#6b7280';
            const totalTime = (p.telegraphTime || 1.5) + (p.castTime || 0.4) + (p.recoveryTime || 1.0);
            const chainTarget = p.chainTo ? boss.patterns.find(pp => pp._uid === p.chainTo) : null;
            const count = timeline.filter(ev => ev.pattern._uid === p._uid).length;
            return (
              <div key={p._uid} className="bg-gray-800/50 rounded-lg p-2.5 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-white text-xs font-medium truncate">{p.name}</span>
                </div>
                <div className="text-[10px] text-gray-400 space-y-0.5">
                  <p>{p.type} — {totalTime.toFixed(1)}s total — {p.power || 1.5}× ATK</p>
                  <p>Weight: {p.weight || 2} — CD: {p.cooldown || 10}s</p>
                  <p>Déclenché <span className="text-amber-400 font-medium">{count}×</span> dans la sim</p>
                  {chainTarget && (
                    <p className="text-amber-400 flex items-center gap-1">
                      <Link size={10} /> → {chainTarget.name} ({p.chainDelay || 0}s)
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

// ── Boss Test Simulator (fullscreen arena) ──────────────
function BossTestSimulator({ boss, drawPattern, onClose }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [simState, setSimState] = useState({ phase: 0, patternIdx: -1, patternName: '', status: 'idle', elapsed: 0 });
  const stateRef = useRef(null);

  // Build the pattern schedule for the simulator
  const schedule = useMemo(() => {
    if (!boss.patterns.length) return [];
    // Sort phases by hpPercent desc
    const sortedPhases = boss.phases
      .map((p, i) => ({ ...p, idx: i }))
      .sort((a, b) => b.hpPercent - a.hpPercent);

    const items = [];
    sortedPhases.forEach((phase, phaseOrder) => {
      // Get patterns for this phase (including chains)
      const phasePatterns = boss.patterns.filter(p => p.phases?.includes(phase.idx));
      // Build weighted pool, skip chain children (they fire via parent)
      const chainChildren = new Set();
      boss.patterns.forEach(p => { if (p.chainTo != null) chainChildren.add(p.chainTo); });

      const roots = phasePatterns.filter(p => !chainChildren.has(p._uid));
      if (roots.length === 0) return;

      // Add each root pattern (with its chain) for this phase
      roots.forEach(root => {
        // Walk the chain
        const chain = [];
        let cur = root;
        const visited = new Set();
        while (cur && !visited.has(cur._uid)) {
          visited.add(cur._uid);
          chain.push(cur);
          cur = cur.chainTo != null ? boss.patterns.find(p => p._uid === cur.chainTo) : null;
        }
        items.push({ phaseIdx: phase.idx, phaseLabel: phase.label, chain });
      });
    });
    return items;
  }, [boss.patterns, boss.phases]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const scale = W / 1600;
    const bossR = boss.radius * scale;

    let schedIdx = 0;       // current schedule item
    let chainStep = 0;      // current step within chain
    let patternStart = 0;   // timestamp when current pattern started
    let delayUntil = 0;     // timestamp to wait until (chain delay)
    let waiting = false;

    const getPattern = () => schedule[schedIdx]?.chain[chainStep];
    const getTotalDuration = (p) => {
      if (!p) return 2;
      return (p.telegraphTime || 1.5) + (p.castTime || 0.4) + 0.3 + (p.recoveryTime || 1.0);
    };

    const loop = (timestamp) => {
      if (!stateRef.current?.playing) { animRef.current = requestAnimationFrame(loop); return; }

      const p = getPattern();
      if (!p) {
        // No patterns or end of schedule — loop
        schedIdx = 0; chainStep = 0; patternStart = timestamp; waiting = false;
        animRef.current = requestAnimationFrame(loop);
        return;
      }

      // Handle chain delay
      if (waiting && timestamp < delayUntil) {
        // Draw boss idle during delay
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#0f0f1a';
        ctx.fillRect(0, 0, W, H);
        drawBossCircle(ctx, cx, cy, bossR, boss.color, '60');
        drawHUD(ctx, W, schedule[schedIdx]?.phaseLabel, `Enchaînement... ${((delayUntil - timestamp) / 1000).toFixed(1)}s`, '#a855f7');
        setSimState({ phase: schedule[schedIdx]?.phaseIdx, patternIdx: schedIdx, patternName: 'Enchaînement...', status: 'chain_delay', elapsed: (timestamp - patternStart) / 1000 });
        animRef.current = requestAnimationFrame(loop);
        return;
      }
      if (waiting) { waiting = false; patternStart = timestamp; }

      const elapsed = (timestamp - patternStart) / 1000;
      const tTele = p.telegraphTime || 1.5;
      const tCast = p.castTime || 0.4;
      const tHit = 0.3;
      const tRec = p.recoveryTime || 1.0;
      const total = tTele + tCast + tHit + tRec;

      let currentPhase, phaseProgress;
      if (elapsed < tTele) {
        currentPhase = 'telegraph'; phaseProgress = elapsed / tTele;
      } else if (elapsed < tTele + tCast) {
        currentPhase = 'cast'; phaseProgress = (elapsed - tTele) / tCast;
      } else if (elapsed < tTele + tCast + tHit) {
        currentPhase = 'hit'; phaseProgress = (elapsed - tTele - tCast) / tHit;
      } else if (elapsed < total) {
        currentPhase = 'recovery'; phaseProgress = (elapsed - tTele - tCast - tHit) / tRec;
      } else {
        // Pattern done — advance chain or schedule
        const chain = schedule[schedIdx]?.chain;
        if (chain && chainStep < chain.length - 1) {
          // Next in chain
          chainStep++;
          waiting = true;
          delayUntil = timestamp + (p.chainDelay || 1.5) * 1000;
          animRef.current = requestAnimationFrame(loop);
          return;
        }
        // Next schedule item
        schedIdx = (schedIdx + 1) % Math.max(1, schedule.length);
        chainStep = 0;
        patternStart = timestamp + 1500; // 1.5s pause between patterns
        animRef.current = requestAnimationFrame(loop);
        return;
      }

      setSimState({ phase: schedule[schedIdx]?.phaseIdx, patternIdx: schedIdx, patternName: p.name || p.type, status: currentPhase, elapsed });

      // ── Draw ──
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0f0f1a';
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = '#ffffff08';
      ctx.lineWidth = 1;
      for (let i = 0; i < W; i += 80) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke(); }
      for (let i = 0; i < H; i += 80) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke(); }

      // Boss
      drawBossCircle(ctx, cx, cy, bossR, boss.color, currentPhase === 'cast' ? 'cc' : '60');

      // Pattern shape
      const alpha = currentPhase === 'telegraph' ? 0.15 + 0.2 * Math.abs(Math.sin(elapsed * 4))
        : currentPhase === 'cast' ? 0.3 + 0.4 * phaseProgress
        : currentPhase === 'hit' ? 0.9 - 0.3 * phaseProgress
        : 0.4 * (1 - phaseProgress);
      const sizeMult = currentPhase === 'telegraph' ? 0.3 + 0.7 * phaseProgress
        : currentPhase === 'cast' ? 1.0
        : currentPhase === 'hit' ? 1.0
        : 1.0 - 0.3 * phaseProgress;

      ctx.globalAlpha = alpha;
      drawPatternShape(ctx, p, cx, cy, scale, sizeMult, elapsed, tTele, currentPhase, phaseProgress);
      ctx.globalAlpha = 1;

      // HUD
      const phaseColor = currentPhase === 'telegraph' ? '#f59e0b' : currentPhase === 'cast' ? '#ef4444' : currentPhase === 'hit' ? '#ffffff' : '#6b7280';
      const phaseLabel = currentPhase === 'telegraph' ? 'TELEGRAPH' : currentPhase === 'cast' ? 'CAST' : currentPhase === 'hit' ? 'HIT!' : 'RECOVERY';
      drawHUD(ctx, W, schedule[schedIdx]?.phaseLabel, `${p.name || p.type} — ${phaseLabel}`, phaseColor);

      // Timeline bar
      const barY = H - 20;
      const barH = 6;
      ctx.fillStyle = '#333';
      ctx.fillRect(20, barY, W - 40, barH);
      const progress = elapsed / total;
      ctx.fillStyle = phaseColor;
      ctx.fillRect(20, barY, (W - 40) * Math.min(1, progress), barH);

      animRef.current = requestAnimationFrame(loop);
    };

    stateRef.current = { playing: true };
    patternStart = performance.now();
    animRef.current = requestAnimationFrame(loop);

    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [schedule, boss.radius, boss.color]);

  // Sync playing state
  useEffect(() => {
    if (stateRef.current) stateRef.current.playing = playing;
  }, [playing]);

  const SIZE = Math.min(720, typeof window !== 'undefined' ? window.innerWidth - 48 : 720);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-gray-900 rounded-2xl border border-gray-700 p-4 max-w-[780px] w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Play size={18} className="text-amber-400" /> Test — {boss.name || 'Sans nom'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Simulateur visuel — {boss.patterns.length} pattern{boss.patterns.length > 1 ? 's' : ''}, {boss.phases.length} phase{boss.phases.length > 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl transition-colors">{'\u2715'}</button>
        </div>

        {/* Canvas */}
        <div className="flex justify-center">
          <canvas ref={canvasRef} width={SIZE} height={SIZE}
            className="rounded-xl border border-gray-700" style={{ maxWidth: '100%', height: 'auto' }} />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mt-3">
          <button onClick={() => setPlaying(p => !p)}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 ${
              playing ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white'
            }`}>
            {playing ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Play</>}
          </button>
          <div className="text-xs text-gray-400">
            {simState.patternName && (
              <span className={`px-2 py-1 rounded ${
                simState.status === 'telegraph' ? 'bg-amber-500/20 text-amber-300' :
                simState.status === 'cast' ? 'bg-red-500/20 text-red-300' :
                simState.status === 'hit' ? 'bg-white/20 text-white' :
                simState.status === 'chain_delay' ? 'bg-purple-500/20 text-purple-300' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {simState.patternName}
              </span>
            )}
          </div>
        </div>

        {boss.patterns.length === 0 && (
          <div className="text-center text-gray-600 text-sm mt-4 py-8">
            Aucun pattern configuré — ajoute des patterns dans l'onglet Patterns
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Simulator draw helpers ──────────────────────────────
function drawBossCircle(ctx, cx, cy, r, color, alphaSuffix) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = color + alphaSuffix;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawHUD(ctx, W, phaseLabel, text, color) {
  ctx.fillStyle = '#00000080';
  ctx.fillRect(0, 0, W, 32);
  ctx.font = 'bold 13px sans-serif';
  ctx.fillStyle = '#a855f7';
  ctx.textAlign = 'left';
  ctx.fillText(phaseLabel || 'Phase', 12, 21);
  ctx.fillStyle = color;
  ctx.textAlign = 'right';
  ctx.fillText(text, W - 12, 21);
  ctx.textAlign = 'left';
}

function drawPatternShape(ctx, p, cx, cy, scale, sm, elapsed, tTele, currentPhase, phaseProgress) {
  switch (p.type) {
    case 'cone_telegraph': {
      const range = (p.range || 250) * scale * sm;
      const halfAngle = ((p.coneAngle || 90) * Math.PI / 180) / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, range, -halfAngle, halfAngle);
      ctx.closePath();
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      break;
    }
    case 'aoe_ring': {
      const inner = (p.innerRadius || 0) * scale * sm;
      const outer = (p.outerRadius || 300) * scale * sm;
      ctx.beginPath();
      ctx.arc(cx, cy, outer, 0, Math.PI * 2);
      if (inner > 0) { ctx.moveTo(cx + inner, cy); ctx.arc(cx, cy, inner, 0, Math.PI * 2, true); }
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
      break;
    }
    case 'donut': {
      const safe = (p.innerSafe || 150) * scale * sm;
      const outer = (p.outerRadius || 600) * scale * sm;
      ctx.beginPath();
      ctx.arc(cx, cy, outer, 0, Math.PI * 2);
      ctx.arc(cx, cy, safe, 0, Math.PI * 2, true);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      const prevAlpha = ctx.globalAlpha;
      ctx.globalAlpha = prevAlpha * 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, safe, 0, Math.PI * 2);
      ctx.fillStyle = '#22c55e';
      ctx.fill();
      ctx.globalAlpha = prevAlpha;
      break;
    }
    case 'double_donut': {
      const r1 = (p.innerSafe1 || 100) * scale * sm;
      const r2 = (p.midStart || 200) * scale * sm;
      const r3 = (p.midEnd || 350) * scale * sm;
      const r4 = (p.outerRadius || 600) * scale * sm;
      ctx.beginPath();
      ctx.arc(cx, cy, r2, 0, Math.PI * 2);
      ctx.arc(cx, cy, r1, 0, Math.PI * 2, true);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, r4, 0, Math.PI * 2);
      ctx.arc(cx, cy, r3, 0, Math.PI * 2, true);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      break;
    }
    case 'line_telegraph': case 'laser': {
      const range = (p.range || 800) * scale * sm;
      const halfW = ((p.lineWidth || 80) * scale) / 2;
      ctx.fillStyle = p.type === 'laser' ? (p.laserColor || '#8b5cf6') : '#ef4444';
      ctx.fillRect(cx, cy - halfW, range, halfW * 2);
      break;
    }
    case 'rotating_laser': {
      const range = (p.range || 800) * scale * sm;
      const halfW = ((p.lineWidth || 60) * scale) / 2;
      const rotSpeed = p.rotationSpeed || 1.2;
      const dir = (p.direction || 'cw') === 'cw' ? 1 : -1;
      const angle = currentPhase === 'telegraph'
        ? -Math.PI / 6
        : -Math.PI / 6 + (elapsed - tTele) * rotSpeed * dir;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.fillStyle = (p.laserColor || '#ef4444');
      ctx.fillRect(0, -halfW, range, halfW * 2);
      ctx.restore();
      break;
    }
    case 'fire_wave': {
      const maxR = (p.maxRadius || 500) * scale;
      const currentR = currentPhase === 'telegraph'
        ? maxR * 0.1
        : currentPhase === 'cast' ? maxR * (0.1 + 0.9 * phaseProgress) : maxR * sm;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(1, currentR), 0, Math.PI * 2);
      ctx.strokeStyle = p.waveColor || '#f97316';
      ctx.lineWidth = Math.max(2, 8 * scale);
      ctx.stroke();
      break;
    }
    case 'targeted_circle': {
      const r = (p.radius || 200) * scale * sm;
      const offX = 200 * scale, offY = -150 * scale;
      ctx.beginPath();
      ctx.arc(cx + offX, cy + offY, r, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      break;
    }
    case 'marker_spread': case 'marker_stack': {
      const r = (p.radius || 150) * scale * sm;
      const color = p.type === 'marker_stack' ? '#3b82f6' : '#f59e0b';
      [-1, 1].forEach(dx => {
        ctx.beginPath();
        ctx.arc(cx + dx * 180 * scale, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });
      break;
    }
    case 'persistent_aoe': {
      const r = (p.radius || 200) * scale * sm;
      const offX = 150 * scale;
      ctx.beginPath();
      ctx.arc(cx + offX, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = '#f97316';
      ctx.fill();
      break;
    }
    case 'percent_hp_attack': case 'soul_drain': case 'aoe_full': case 'dps_check': {
      ctx.fillStyle = p.type === 'dps_check' ? '#fbbf2440' : '#ef444440';
      const W2 = ctx.canvas.width, H2 = ctx.canvas.height;
      ctx.fillRect(0, 0, W2, H2);
      break;
    }
    default: break;
  }
}
