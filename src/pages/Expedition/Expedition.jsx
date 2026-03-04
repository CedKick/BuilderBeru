import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Swords, Users, Play, Plus, Eye, Clock, Shield, Skull, Trophy, ChevronRight, ChevronDown, ChevronUp, Flame, X, RotateCcw, BookOpen, Star, Gem, Award, Package, ScrollText, Sparkles, Lock } from 'lucide-react';

// ── Import real hunter data from Shadow Colosseum ──
import { HUNTERS, RAID_SAVE_KEY, loadRaidData, getHunterPool, getHunterStars } from '../ShadowColosseum/raidData';
import { computeArtifactBonuses, computeWeaponBonuses, mergeEquipBonuses, WEAPONS } from '../ShadowColosseum/equipmentData';
import { statsAtFull, mergeTalentBonuses } from '../ShadowColosseum/colosseumCore';
import { computeTalentBonuses } from '../ShadowColosseum/talentTreeData';
import { computeTalentBonuses2 } from '../ShadowColosseum/talentTree2Data';

// ── API Config ──
const API_BASE = import.meta.env.DEV
  ? 'http://localhost:3004'
  : 'https://api.builderberu.com/expedition';

const SPECTATOR_URL = import.meta.env.DEV
  ? 'http://localhost:3004/spectator'
  : 'https://api.builderberu.com/expedition/spectator';

const COLO_KEY = 'shadow_colosseum_data';
const defaultColoData = () => ({
  chibiLevels: {}, statPoints: {}, skillTree: {}, talentTree: {}, talentTree2: {},
  respecCount: {}, cooldowns: {}, stagesCleared: [], stats: { battles: 0, wins: 0 },
  artifacts: {}, artifactInventory: [], weapons: {}, weaponCollection: {},
  weaponEnchants: {},
  hammers: { marteau_forge: 0, marteau_runique: 0, marteau_celeste: 0 },
  accountXp: 0, accountBonuses: { hp: 0, atk: 0, def: 0, spd: 0, crit: 0, res: 0 },
  accountAllocations: 0,
});

const loadColoData = () => {
  try { return { ...defaultColoData(), ...JSON.parse(localStorage.getItem(COLO_KEY)) }; }
  catch { return defaultColoData(); }
};

const ELEMENT_COLORS = {
  fire: { bg: 'bg-red-900/30', border: 'border-red-500/50', text: 'text-red-400', ring: 'ring-red-400' },
  water: { bg: 'bg-blue-900/30', border: 'border-blue-500/50', text: 'text-blue-400', ring: 'ring-blue-400' },
  shadow: { bg: 'bg-purple-900/30', border: 'border-purple-500/50', text: 'text-purple-400', ring: 'ring-purple-400' },
  light: { bg: 'bg-yellow-900/30', border: 'border-yellow-500/50', text: 'text-yellow-300', ring: 'ring-yellow-300' },
};

const RARITY_STYLES = {
  common:    { bg: 'bg-gray-800/50',   border: 'border-gray-600/50',  text: 'text-gray-400',   badge: 'bg-gray-600 text-gray-200' },
  uncommon:  { bg: 'bg-green-900/30',  border: 'border-green-600/50', text: 'text-green-400',  badge: 'bg-green-700 text-green-100' },
  rare:      { bg: 'bg-blue-900/30',   border: 'border-blue-500/50',  text: 'text-blue-400',   badge: 'bg-blue-700 text-blue-100' },
  epic:      { bg: 'bg-purple-900/30', border: 'border-purple-500/50', text: 'text-purple-400', badge: 'bg-purple-700 text-purple-100' },
  legendary: { bg: 'bg-yellow-900/30', border: 'border-yellow-500/50', text: 'text-yellow-300', badge: 'bg-yellow-600 text-yellow-100' },
  mythique:  { bg: 'bg-red-900/30',    border: 'border-red-500/50',   text: 'text-red-400',    badge: 'bg-red-700 text-red-100' },
};

const ZONE_STYLES = {
  foret:   { bg: 'bg-green-900/20', text: 'text-green-400', label: 'Foret' },
  abysses: { bg: 'bg-blue-900/20',  text: 'text-blue-400',  label: 'Abysses' },
  neant:   { bg: 'bg-purple-900/20', text: 'text-purple-400', label: 'Neant' },
};

const SR_MAX = 5;

// Inject expedition animation keyframes
if (typeof document !== 'undefined' && !document.getElementById('sr-notif-style')) {
  const style = document.createElement('style');
  style.id = 'sr-notif-style';
  style.textContent = `
    @keyframes srSlideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes tooltipFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
  `;
  document.head.appendChild(style);
}

// Rarity glow colors for WoW-style tooltips
const RARITY_GLOW = {
  common:    { border: '#6b7280', glow: 'none' },
  uncommon:  { border: '#22c55e', glow: '0 0 12px rgba(34,197,94,0.3)' },
  rare:      { border: '#3b82f6', glow: '0 0 12px rgba(59,130,246,0.3)' },
  epic:      { border: '#a855f7', glow: '0 0 16px rgba(168,85,247,0.35)' },
  legendary: { border: '#eab308', glow: '0 0 20px rgba(234,179,8,0.4)' },
  mythique:  { border: '#ef4444', glow: '0 0 24px rgba(239,68,68,0.45), 0 0 48px rgba(239,68,68,0.15)' },
};

// Item type → icon mapping for loot display
const TYPE_ICONS = {
  armor: Shield,
  weapon: Swords,
  set_piece: Gem,
  unique: Star,
  material: Package,
  currency: Award,
};

// Stat label mapping for tooltip display
const STAT_LABELS = {
  hp_flat: 'PV', hp_pct: 'PV%', atk_flat: 'ATK', atk_pct: 'ATK%',
  def_flat: 'DEF', def_pct: 'DEF%', spd_flat: 'SPD', spd_pct: 'SPD%',
  crit_rate: 'Taux Crit', crit_dmg_pct: 'DMG Crit%', res_flat: 'RES', res_pct: 'RES%',
  heal_pct: 'Soin%', heal_received_pct: 'Soins recus%', lifesteal_pct: 'Vol vie%',
  mana_max_pct: 'Mana max%', mana_regen_pct: 'Regen mana%', magic_dmg_pct: 'DMG magique%',
  fire_dmg_pct: 'DMG feu%', water_dmg_pct: 'DMG eau%', shadow_dmg_pct: 'DMG ombre%',
  aoe_reduction_pct: 'Reduc AoE%', aggro_pct: 'Aggro%', dodge_pct: 'Esquive%',
  double_attack_pct: 'Double frappe%', all_dmg_pct: 'Tous DMG%', all_stats_pct: 'Tous stats%',
  cd_reduction_pct: 'Reduc CD%', hp_regen_pct: 'Regen PV%',
};
const SLOT_LABELS = {
  helm: 'Casque', chest: 'Plastron', gloves: 'Gants', boots: 'Bottes',
  weapon: 'Arme', anneau: 'Anneau', collier: 'Collier', bracelet: 'Bracelet',
  boucles: 'Boucles', plastron: 'Plastron', casque: 'Casque', gants: 'Gants',
};
const BINDING_LABELS = { lqr: 'Lie au personnage', lqe: 'Lie a l\'equipement', tradeable: 'Echangeable' };
const ELEMENT_LABELS = { fire: 'Feu', water: 'Eau', shadow: 'Ombre', light: 'Lumiere' };

function formatStats(stats) {
  if (!stats || Object.keys(stats).length === 0) return null;
  return Object.entries(stats)
    .filter(([, v]) => v)
    .map(([k, v]) => `${STAT_LABELS[k] || k} +${v}${k.includes('pct') || k.includes('rate') ? '%' : ''}`);
}

// Extract level number from chibiLevels (can be a number or {xp, level} object)
function getLevel(coloData, hunterId) {
  const raw = coloData.chibiLevels?.[hunterId];
  if (!raw) return 1;
  if (typeof raw === 'object') return raw.level || 1;
  return raw || 1;
}

// Compute full stats for a hunter (including artifacts, weapons, talents, account bonuses)
function computeHunterFullStats(hunterId, coloData, raidData) {
  const h = HUNTERS[hunterId];
  if (!h) return null;

  const level = getLevel(coloData, hunterId);
  const stars = getHunterStars(raidData, hunterId);
  const allocated = coloData.statPoints?.[hunterId] || {};

  // Talent bonuses
  const tb1 = computeTalentBonuses(coloData.talentTree?.[hunterId] || {});
  const tb2 = computeTalentBonuses2(coloData.talentTree2?.[hunterId]);
  const tb = mergeTalentBonuses(tb1, tb2);

  // Equipment bonuses
  const artBonuses = computeArtifactBonuses(coloData.artifacts?.[hunterId]);
  const wId = coloData.weapons?.[hunterId];
  const weapBonuses = computeWeaponBonuses(wId, coloData.weaponCollection?.[wId] || 0, coloData.weaponEnchants);
  const equipBonuses = mergeEquipBonuses(artBonuses, weapBonuses);

  // Account bonuses
  const globalBonuses = coloData.accountBonuses || {};

  // Compute full stats
  const stats = statsAtFull(h.base, h.growth, level, allocated, tb, equipBonuses, stars, globalBonuses);

  return { ...stats, level, stars };
}

// ── Main Component ──
export default function Expedition() {
  // Auth (open to all — admin gate disabled)
  const [authenticated, setAuthenticated] = useState(true);

  // Data
  const [expedition, setExpedition] = useState(null);
  const [liveStatus, setLiveStatus] = useState(null);
  const [entries, setEntries] = useState([]);
  const [totalCharacters, setTotalCharacters] = useState(0);
  const [maxCharacters, setMaxCharacters] = useState(30);
  const [bossLootData, setBossLootData] = useState([]);

  // Registration form — username auto-loaded from account
  const [username] = useState(() => {
    try {
      const auth = JSON.parse(localStorage.getItem('builderberu_auth_user') || 'null');
      return auth?.username || localStorage.getItem('expedition_username') || '';
    } catch { return localStorage.getItem('expedition_username') || ''; }
  });
  const [selectedHunters, setSelectedHunters] = useState([]);
  const [selectedSRs, setSelectedSRs] = useState([]);

  // Countdown & launch times
  const [launchTime, setLaunchTime] = useState(null);
  const [registrationCutoff, setRegistrationCutoff] = useState(null);
  const [countdown, setCountdown] = useState('');

  // SR / Boss Loot UI
  const [showBossLoot, setShowBossLoot] = useState(false);
  const [selectedBoss, setSelectedBoss] = useState(1);
  const [rarityFilter, setRarityFilter] = useState('all');

  // SR notifications (loot results matching your SR)
  const [srNotifications, setSrNotifications] = useState([]);
  const lastLootCheckRef = useRef(0);

  // UI
  const [showSpectator, setShowSpectator] = useState(false);
  const [showCodexOverlay, setShowCodexOverlay] = useState(false);
  const [expandedPlayer, setExpandedPlayer] = useState(null);
  const isAdminReset = new URLSearchParams(window.location.search).has('reset');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const pollRef = useRef(null);

  // Recap
  const [recapData, setRecapData] = useState(null);
  const [recapTab, setRecapTab] = useState('summary');

  // ── Load real hunter data from localStorage ──
  const raidData = useMemo(() => loadRaidData(), []);
  const coloData = useMemo(() => loadColoData(), []);
  const hunterPool = useMemo(() => getHunterPool(raidData), [raidData]);

  // Sort hunters by element then by level (desc)
  const sortedHunters = useMemo(() => {
    const elementOrder = { fire: 0, water: 1, shadow: 2, light: 3 };
    return Object.entries(hunterPool)
      .map(([id, poolData]) => {
        const h = HUNTERS[id];
        if (!h) return null;
        const level = getLevel(coloData, id);
        const stars = poolData.stars || 0;
        return { id, stars, name: h.name, element: h.element, rarity: h.rarity, class: h.class, sprite: h.sprite, level };
      })
      .filter(Boolean)
      .sort((a, b) => (elementOrder[a.element] || 9) - (elementOrder[b.element] || 9) || b.level - a.level);
  }, [hunterPool, coloData]);

  // ── API Helper ──
  const api = useCallback(async (path, method = 'GET', body = null) => {
    const url = `${API_BASE}${path}`;
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }, []);

  // ── Fetch data ──
  const fetchStatus = useCallback(async () => {
    if (!authenticated) return;
    try {
      const [currentRes, entriesRes, bossLootRes] = await Promise.all([
        api('/api/expedition/current'),
        api('/api/expedition/entries'),
        api('/api/expedition/boss-loot'),
      ]);
      setExpedition(currentRes.expedition);
      setLiveStatus(currentRes.live);
      if (currentRes.launchTime) setLaunchTime(new Date(currentRes.launchTime));
      if (currentRes.registrationCutoff) setRegistrationCutoff(new Date(currentRes.registrationCutoff));
      setEntries(entriesRes.entries || []);
      setTotalCharacters(entriesRes.totalCharacters || 0);
      setMaxCharacters(entriesRes.maxCharacters || 30);
      setBossLootData(bossLootRes.bosses || []);
    } catch (e) {
      console.error('[Expedition] Fetch error:', e.message);
    }
  }, [authenticated, api]);

  useEffect(() => {
    if (authenticated) {
      fetchStatus();
      pollRef.current = setInterval(fetchStatus, 5000);
      return () => clearInterval(pollRef.current);
    }
  }, [authenticated, fetchStatus]);

  // ── Actions ──
  const createExpedition = async () => {
    try {
      setLoading(true);
      setError('');
      await api('/api/expedition/create', 'POST', { name: 'Expedition I' });
      setSuccess('Expedition creee !');
      await fetchStatus();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const register = async () => {
    if (!username.trim()) {
      setError('Connecte-toi a ton compte BuilderBeru d\'abord');
      return;
    }
    if (selectedHunters.length === 0) {
      setError('Choisis au moins 1 hunter');
      return;
    }
    if (isRegistrationClosed) {
      setError('Inscriptions fermees ! Lancement imminent...');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const characterData = {};
      for (const hId of selectedHunters) {
        const fullStats = computeHunterFullStats(hId, coloData, raidData);
        const h = hunterPool[hId];
        const wId = coloData.weapons?.[hId];
        const weaponPassive = wId && WEAPONS[wId]?.passive ? WEAPONS[wId].passive : null;
        characterData[hId] = {
          level: fullStats?.level || 1,
          stars: typeof h === 'number' ? h : (h?.stars || 0),
          fullStats, // Pre-computed stats including artifacts/weapons/talents
          weaponPassive, // SC weapon passive identifier (sulfuras_fury, katana_v_chaos, etc.)
        };
      }
      await api('/api/expedition/register', 'POST', {
        username: username.trim(),
        characterIds: selectedHunters,
        characterData,
        srItems: selectedSRs.length > 0 ? selectedSRs : [],
      });
      localStorage.setItem('expedition_username', username.trim());
      setSuccess(`${username} inscrit avec ${selectedHunters.length} hunter(s)${selectedSRs.length > 0 ? ` et ${selectedSRs.length} SR` : ''} !`);
      setSelectedHunters([]);
      setSelectedSRs([]);
      await fetchStatus();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const forceStart = async () => {
    try {
      setLoading(true);
      setError('');
      await api('/api/expedition/force-start', 'POST');
      setSuccess('Expedition lancee !');
      setShowSpectator(true);
      await fetchStatus();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const resetExpedition = async () => {
    try {
      setLoading(true);
      setError('');
      await api('/api/expedition/reset', 'POST');
      setSuccess('Expedition reset ! Nouvelle inscription ouverte.');
      setShowSpectator(false);
      await fetchStatus();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleHunter = (hId) => {
    setSelectedHunters(prev => {
      if (prev.includes(hId)) return prev.filter(x => x !== hId);
      if (prev.length >= 6) return prev;
      return [...prev, hId];
    });
  };

  const toggleSR = (itemId) => {
    setSelectedSRs(prev => {
      if (prev.includes(itemId)) return prev.filter(x => x !== itemId);
      if (prev.length >= SR_MAX) return prev;
      return [...prev, itemId];
    });
  };

  // Build a lookup: itemId → item data from boss loot data
  const srItemLookup = useMemo(() => {
    const map = {};
    for (const boss of bossLootData) {
      for (const loot of boss.loot) {
        if (!map[loot.itemId]) map[loot.itemId] = loot;
      }
    }
    return map;
  }, [bossLootData]);

  // Count how many players have SR'd each item (for concurrence display)
  const srCountByItem = useMemo(() => {
    const counts = {};
    for (const entry of entries) {
      const srs = entry.srItems || [];
      for (const itemId of srs) {
        counts[itemId] = (counts[itemId] || []);
        counts[itemId].push(entry.username);
      }
    }
    return counts;
  }, [entries]);

  // Current user's registered SR items (from their entry)
  const myRegisteredSRs = useMemo(() => {
    const myEntry = entries.find(e => e.username?.toLowerCase() === username.trim().toLowerCase());
    return myEntry?.srItems || [];
  }, [entries, username]);

  // ── Auto-show spectator when active ──
  useEffect(() => {
    if (liveStatus && ['march', 'combat', 'loot_roll', 'campfire'].includes(liveStatus.status)) {
      setShowSpectator(true);
    }
  }, [liveStatus]);

  // ── SR Loot Notifications ──
  // Check for new loot wins matching the player's SR items when bossesKilled changes
  const prevBossKillsRef = useRef(0);
  useEffect(() => {
    if (!liveStatus || !authenticated) return;
    const bk = liveStatus.bossesKilled || 0;
    if (bk <= prevBossKillsRef.current) return;
    prevBossKillsRef.current = bk;

    // Fetch loot history and check for SR wins
    const checkSRLoot = async () => {
      try {
        const data = await api('/api/expedition/loot');
        const lootList = data.loot || [];
        const myName = username.trim().toLowerCase();
        const mySRs = new Set(myRegisteredSRs);
        if (mySRs.size === 0) return;

        // Find new loot results after lastLootCheckRef
        const newSRWins = lootList.filter(l =>
          l.winner_username?.toLowerCase() === myName &&
          mySRs.has(l.item_id) &&
          new Date(l.rolled_at).getTime() > lastLootCheckRef.current
        );

        if (newSRWins.length > 0) {
          lastLootCheckRef.current = Date.now();
          const notifs = newSRWins.map(l => ({
            id: `sr_${l.id}_${Date.now()}`,
            itemName: l.item_name,
            rarity: l.rarity,
            rollValue: l.rolls?.[0]?.roll_value,
            hadSr: true,
            timestamp: Date.now(),
          }));
          setSrNotifications(prev => [...prev, ...notifs]);
        }
      } catch { /* silent */ }
    };
    checkSRLoot();
  }, [liveStatus?.bossesKilled, authenticated, api, username, myRegisteredSRs]);

  // Auto-dismiss SR notifications after 6s
  useEffect(() => {
    if (srNotifications.length === 0) return;
    const t = setTimeout(() => {
      setSrNotifications(prev => prev.slice(1));
    }, 6000);
    return () => clearTimeout(t);
  }, [srNotifications]);

  // ── Clear messages ──
  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => { setError(''); setSuccess(''); }, 4000);
      return () => clearTimeout(t);
    }
  }, [error, success]);

  // ── Countdown timer to 19h ──
  useEffect(() => {
    if (!launchTime) return;
    const tick = () => {
      const now = Date.now();
      const diff = launchTime.getTime() - now;
      if (diff <= 0) {
        setCountdown('Lancement...');
        return;
      }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setCountdown(`${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [launchTime]);

  const isRegistrationClosed = registrationCutoff && Date.now() >= registrationCutoff.getTime();

  // Compute status early (needed by recap useEffect below and by render logic)
  const engineStatus = liveStatus?.status;
  const dbStatus = expedition?.status;
  const status = (engineStatus && engineStatus !== 'idle') ? engineStatus : (dbStatus || 'none');

  // Fetch recap data when expedition is finished or wiped
  useEffect(() => {
    if (status !== 'finished' && status !== 'wiped') { setRecapData(null); return; }
    api('/api/expedition/recap').then(data => {
      if (data.success) setRecapData(data);
    }).catch(() => {});
  }, [status, api]);

  // ═══════════════════════════════════════════
  // RENDER: Spectator Mode (fullscreen iframe)
  // ═══════════════════════════════════════════
  if (showSpectator) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] relative">
        {/* Back button */}
        <button
          onClick={() => setShowSpectator(false)}
          className="fixed top-2 left-2 z-50 bg-[#1a1a2e]/90 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1 border border-purple-500/30 transition-colors"
        >
          <X className="w-4 h-4" /> Retour
        </button>

        {/* Floating Codex Button */}
        <button
          onClick={() => setShowCodexOverlay(true)}
          className="fixed top-2 right-2 z-50 bg-[#1a1a2e]/90 hover:bg-yellow-600 text-yellow-400 hover:text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 border border-yellow-500/30 transition-colors"
        >
          <BookOpen className="w-4 h-4" /> Loots Boss
          {myRegisteredSRs.length > 0 && (
            <span className="bg-yellow-500/20 text-yellow-300 text-[10px] font-bold px-1.5 rounded">
              {myRegisteredSRs.length} SR
            </span>
          )}
        </button>

        {/* Codex Overlay */}
        {showCodexOverlay && bossLootData.length > 0 && (
          <CodexOverlay
            bossLootData={bossLootData}
            selectedBoss={selectedBoss}
            setSelectedBoss={setSelectedBoss}
            rarityFilter={rarityFilter}
            setRarityFilter={setRarityFilter}
            selectedSRs={myRegisteredSRs}
            srCountByItem={srCountByItem}
            username={username}
            onClose={() => setShowCodexOverlay(false)}
          />
        )}

        {/* SR Win Notifications */}
        <SRNotificationToasts notifications={srNotifications} onDismiss={(id) => setSrNotifications(prev => prev.filter(n => n.id !== id))} />

        <iframe
          src={SPECTATOR_URL}
          className="w-full h-screen border-0"
          title="Expedition Spectator"
        />
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // RENDER: Dashboard
  // ═══════════════════════════════════════════
  const isActive = ['march', 'combat', 'loot_roll', 'campfire'].includes(status);
  const isRegistration = status === 'registration';

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-gray-100 px-4 py-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Swords className="w-8 h-8 text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-purple-300">Expedition I</h1>
            <p className="text-gray-500 text-sm">PvE Auto-Battler - Phase de test</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isActive && (
            <button
              onClick={() => setShowSpectator(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <Eye className="w-4 h-4" /> Regarder le combat
            </button>
          )}
          {expedition && isAdminReset && (
            <button
              onClick={resetExpedition}
              disabled={loading}
              className="bg-red-900/50 hover:bg-red-800 disabled:bg-gray-700 border border-red-500/30 text-red-300 px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
              title="Reset l'expedition et relancer les inscriptions"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Floating Codex Button (during active expedition on dashboard) */}
      {isActive && bossLootData.length > 0 && (
        <>
          <button
            onClick={() => setShowCodexOverlay(true)}
            className="fixed bottom-4 right-4 z-40 bg-[#1a1a2e] hover:bg-yellow-900/50 text-yellow-400 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium border border-yellow-500/30 shadow-lg shadow-yellow-500/10 transition-all hover:scale-105"
          >
            <BookOpen className="w-5 h-5" /> Loots Boss
            {myRegisteredSRs.length > 0 && (
              <span className="bg-yellow-500/20 text-yellow-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                {myRegisteredSRs.length} SR
              </span>
            )}
          </button>
          {showCodexOverlay && (
            <CodexOverlay
              bossLootData={bossLootData}
              selectedBoss={selectedBoss}
              setSelectedBoss={setSelectedBoss}
              rarityFilter={rarityFilter}
              setRarityFilter={setRarityFilter}
              selectedSRs={myRegisteredSRs}
              srCountByItem={srCountByItem}
              username={username}
              onClose={() => setShowCodexOverlay(false)}
            />
          )}
        </>
      )}

      {/* SR Win Notifications (dashboard) */}
      <SRNotificationToasts notifications={srNotifications} onDismiss={(id) => setSrNotifications(prev => prev.filter(n => n.id !== id))} />

      {/* Messages */}
      {error && (
        <div className="bg-red-900/30 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-green-900/30 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg mb-4 text-sm">{success}</div>
      )}

      {/* Status Card */}
      <div className="bg-[#1a1a2e] border border-gray-800 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-200">Statut</h2>
          <StatusBadge status={status} />
        </div>
        {liveStatus && liveStatus.totalCharacters > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={Users} label="Vivants" value={`${liveStatus.aliveCount}/${liveStatus.totalCharacters}`} />
            <StatCard icon={Skull} label="Boss tues" value={liveStatus.bossesKilled} />
            <StatCard icon={ChevronRight} label="Encounter" value={`${liveStatus.currentEncounter}/${liveStatus.totalEncounters}`} />
            <StatCard icon={Clock} label="Temps" value={formatTime(liveStatus.elapsedSeconds)} />
          </div>
        )}
        {isRegistration && launchTime && (
          <div className="mt-3 bg-[#0f0f1a] border border-amber-500/30 rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-amber-400 text-sm font-medium">
                {isRegistrationClosed ? 'Inscriptions fermees — lancement imminent !' : 'Inscriptions ouvertes'}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                {isRegistrationClosed
                  ? 'L\'expedition demarre automatiquement a 19h'
                  : `Inscris tes hunters avant 18h59`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-300 font-mono">{countdown}</div>
              <div className="text-[10px] text-gray-500">avant lancement</div>
            </div>
          </div>
        )}
        {isRegistration && !launchTime && (
          <p className="text-blue-400 text-sm mt-2">Inscription ouverte - inscris tes hunters ci-dessous</p>
        )}
        {!expedition && (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">Aucune expedition active</p>
            <button
              onClick={createExpedition}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              {loading ? 'Creation...' : 'Creer une expedition'}
            </button>
          </div>
        )}
      </div>

      {/* Registration Section */}
      {isRegistration && (
        <div className="bg-[#1a1a2e] border border-gray-800 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" /> Inscription
            </h2>
            <span className="text-xs text-gray-500">
              {totalCharacters}/{maxCharacters} places
            </span>
          </div>

          {/* Username (auto from account) */}
          <div className="mb-4">
            <label className="text-sm text-gray-400 mb-1 block">Joueur</label>
            {username ? (
              <div className="flex items-center gap-2 bg-[#0f0f1a] border border-green-700/50 rounded-lg px-3 py-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-green-400 font-medium text-sm">{username}</span>
              </div>
            ) : (
              <div className="bg-[#0f0f1a] border border-red-700/50 rounded-lg px-3 py-2 text-red-400 text-sm">
                Connecte-toi a ton compte BuilderBeru pour t'inscrire
              </div>
            )}
          </div>

          {/* Hunter Selection - Real hunters from account */}
          <div className="mb-4">
            <label className="text-sm text-gray-400 mb-2 block">
              Tes Hunters ({selectedHunters.length}/6) — {sortedHunters.length} disponibles
            </label>
            {sortedHunters.length === 0 ? (
              <p className="text-gray-600 text-sm italic">Aucun hunter dans ton compte Shadow Colosseum</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2 max-h-80 overflow-y-auto pr-1">
                {sortedHunters.map(h => {
                  const selected = selectedHunters.includes(h.id);
                  const colors = ELEMENT_COLORS[h.element] || ELEMENT_COLORS.shadow;
                  return (
                    <button
                      key={h.id}
                      onClick={() => toggleHunter(h.id)}
                      className={`relative p-2 rounded-lg border text-xs transition-all ${
                        selected
                          ? `${colors.bg} ${colors.border} ${colors.text} ring-2 ${colors.ring}`
                          : 'bg-[#0f0f1a] border-gray-800 text-gray-400 hover:border-gray-600'
                      }`}
                      title={`${h.name} Lv${h.level} (A${h.stars})`}
                    >
                      {h.sprite && (
                        <img
                          src={h.sprite}
                          alt={h.name}
                          className="w-10 h-10 mx-auto mb-1 object-contain"
                          loading="lazy"
                        />
                      )}
                      <div className="font-medium truncate text-center">{h.name.split(' ')[0]}</div>
                      <div className="text-[10px] text-gray-500 text-center">
                        Lv{h.level} {h.stars > 0 && `A${h.stars}`}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected hunter stat summaries */}
          {selectedHunters.length > 0 && (
            <div className="mb-4 space-y-2">
              {selectedHunters.map(hId => {
                const h = HUNTERS[hId];
                if (!h) return null;
                const fullStats = computeHunterFullStats(hId, coloData, raidData);
                const colors = ELEMENT_COLORS[h.element] || ELEMENT_COLORS.shadow;
                const wId = coloData.weapons?.[hId];
                const hasArts = coloData.artifacts?.[hId] && Object.keys(coloData.artifacts[hId]).length > 0;
                return (
                  <div key={hId} className={`flex items-center gap-3 ${colors.bg} border ${colors.border} rounded-lg px-3 py-2`}>
                    {h.sprite && <img src={h.sprite} alt={h.name} className="w-8 h-8 object-contain flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${colors.text}`}>{h.name}</div>
                      <div className="text-[10px] text-gray-500">
                        Lv{fullStats?.level || 1} | A{fullStats?.stars || 0} | {h.class}
                        {wId && ' | Arme'}
                        {hasArts && ' | Artefacts'}
                      </div>
                    </div>
                    {fullStats && (
                      <div className="flex gap-2 text-[10px] text-gray-400">
                        <span>HP:{fullStats.hp}</span>
                        <span>ATK:{fullStats.atk}</span>
                        <span>DEF:{fullStats.def}</span>
                        <span>SPD:{fullStats.spd}</span>
                      </div>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleHunter(hId); }}
                      className="text-gray-600 hover:text-red-400 flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Team Composition Analysis */}
          {entries.length > 0 && (() => {
            // Gather ALL registered hunters across all players
            const allHunterIds = entries.flatMap(e => {
              const ids = typeof e.character_ids === 'string' ? JSON.parse(e.character_ids) : (e.character_ids || []);
              return ids;
            });
            const elemCount = { fire: 0, water: 0, shadow: 0, light: 0 };
            const classCount = { tank: 0, fighter: 0, assassin: 0, mage: 0, support: 0 };
            for (const hId of allHunterIds) {
              const h = HUNTERS[hId];
              if (!h) continue;
              if (elemCount[h.element] !== undefined) elemCount[h.element]++;
              if (classCount[h.class] !== undefined) classCount[h.class]++;
            }
            const total = allHunterIds.length;
            // My team analysis
            const myElems = {};
            const myClasses = {};
            for (const hId of selectedHunters) {
              const h = HUNTERS[hId];
              if (!h) continue;
              myElems[h.element] = (myElems[h.element] || 0) + 1;
              myClasses[h.class] = (myClasses[h.class] || 0) + 1;
            }
            const lowTanks = classCount.tank < 3;
            const lowHealers = classCount.support < 4;
            const ELEM_DISPLAY = { fire: { icon: '\uD83D\uDD25', label: 'Feu', color: 'text-red-400' }, water: { icon: '\uD83D\uDCA7', label: 'Eau', color: 'text-blue-400' }, shadow: { icon: '\uD83D\uDC7B', label: 'Ombre', color: 'text-purple-400' }, light: { icon: '\u2728', label: 'Lumiere', color: 'text-yellow-300' } };
            const CLASS_DISPLAY = { tank: { icon: '\uD83D\uDEE1\uFE0F', label: 'Tank' }, fighter: { icon: '\u2694\uFE0F', label: 'Fighter' }, assassin: { icon: '\uD83D\uDDE1\uFE0F', label: 'Assassin' }, mage: { icon: '\uD83D\uDD2E', label: 'Mage' }, support: { icon: '\uD83D\uDC9A', label: 'Support' } };
            return (
              <div className="mb-4 bg-[#0f0f1a] border border-gray-700/30 rounded-lg p-3">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Composition Raid ({total}/30)
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {Object.entries(elemCount).map(([el, count]) => {
                    const d = ELEM_DISPLAY[el];
                    return (
                      <span key={el} className={`text-xs ${d.color} bg-gray-800/50 px-2 py-0.5 rounded-full`}>
                        {d.icon} {d.label}: {count}
                      </span>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {Object.entries(classCount).filter(([,c]) => c > 0).map(([cls, count]) => {
                    const d = CLASS_DISPLAY[cls];
                    const warn = (cls === 'tank' && lowTanks) || (cls === 'support' && lowHealers);
                    return (
                      <span key={cls} className={`text-xs px-2 py-0.5 rounded-full ${warn ? 'bg-red-900/30 text-red-400 border border-red-500/30' : 'bg-gray-800/50 text-gray-400'}`}>
                        {d.icon} {d.label}: {count} {warn && '\u26A0\uFE0F'}
                      </span>
                    );
                  })}
                </div>
                {selectedHunters.length > 0 && (
                  <div className="border-t border-gray-700/30 pt-2 mt-2">
                    <div className="text-[10px] text-gray-500 mb-1">Ton equipe :</div>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(myElems).map(([el, c]) => {
                        const d = ELEM_DISPLAY[el];
                        return <span key={el} className={`text-[10px] ${d.color}`}>{d.icon}{c}</span>;
                      })}
                      <span className="text-gray-600">|</span>
                      {Object.entries(myClasses).map(([cls, c]) => {
                        const d = CLASS_DISPLAY[cls];
                        return <span key={cls} className="text-[10px] text-gray-400">{d.icon}{c}</span>;
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* SR Selection — Soft Reserve via Boss Loot Codex */}
          <div className="mb-4">
            {/* SR Header + Toggle */}
            <button
              onClick={() => setShowBossLoot(prev => !prev)}
              className="w-full flex items-center justify-between text-sm text-gray-300 hover:text-yellow-300 transition-colors mb-2"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">Soft Reserve ({selectedSRs.length}/{SR_MAX})</span>
              </span>
              <span className="flex items-center gap-2">
                {selectedSRs.length > 0 && (
                  <span className="text-yellow-500 text-xs">{selectedSRs.length} item{selectedSRs.length > 1 ? 's' : ''} SR</span>
                )}
                {showBossLoot ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>

            {/* Selected SR summary pills */}
            <SRSummaryPills selectedSRs={selectedSRs} srItemLookup={srItemLookup} srCountByItem={srCountByItem} onRemove={toggleSR} username={username} />

            {/* Boss Loot Codex Panel */}
            {showBossLoot && bossLootData.length > 0 && (
              <BossLootCodex
                bossLootData={bossLootData}
                selectedBoss={selectedBoss}
                setSelectedBoss={setSelectedBoss}
                rarityFilter={rarityFilter}
                setRarityFilter={setRarityFilter}
                selectedSRs={selectedSRs}
                toggleSR={toggleSR}
                srCountByItem={srCountByItem}
                username={username}
                interactive={true}
              />
            )}
          </div>

          {/* Register Button */}
          <button
            onClick={register}
            disabled={loading || !username.trim() || selectedHunters.length === 0 || isRegistrationClosed}
            className={`w-full font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              isRegistrationClosed
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white'
            }`}
          >
            {isRegistrationClosed ? (
              <>
                <Lock className="w-4 h-4" />
                Inscriptions fermees (18h59)
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                {loading ? 'Inscription...' : "S'inscrire"}
              </>
            )}
          </button>
        </div>
      )}

      {/* Entries List */}
      {entries.length > 0 && (
        <div className="bg-[#1a1a2e] border border-gray-800 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" /> Inscrits ({entries.length} joueur{entries.length > 1 ? 's' : ''})
            </h2>
            <span className={`text-xs font-medium px-2 py-1 rounded ${totalCharacters >= maxCharacters ? 'bg-red-900/30 text-red-400 border border-red-500/30' : 'bg-gray-800 text-gray-400'}`}>
              {totalCharacters}/{maxCharacters} hunters
            </span>
          </div>
          <div className="space-y-2">
            {entries.map((entry, i) => {
              const isExpanded = expandedPlayer === entry.username;
              return (
                <div key={i} className="bg-[#0f0f1a] rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedPlayer(isExpanded ? null : entry.username)}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ChevronRight className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      <span className="text-sm font-medium text-gray-200">{entry.username}</span>
                    </div>
                    <span className="text-xs text-gray-500">{entry.characterIds?.length || 0} hunters</span>
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-gray-800/50">
                      {/* Hunter team */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(entry.characterIds || []).map((hId) => {
                          const h = HUNTERS[hId];
                          if (!h) return null;
                          const ec = ELEMENT_COLORS[h.element] || ELEMENT_COLORS.fire;
                          const classLabels = { tank: 'Tank', fighter: 'Fighter', assassin: 'Assassin', mage: 'Mage', support: 'Support' };
                          return (
                            <div key={hId} className={`flex items-center gap-1.5 ${ec.bg} ${ec.border} border rounded-lg px-2 py-1`}>
                              {h.sprite && <img src={h.sprite} alt="" className="w-6 h-6 rounded-full object-cover" />}
                              <div className="flex flex-col">
                                <span className={`text-xs font-medium ${ec.text}`}>{h.name}</span>
                                <span className="text-[9px] text-gray-500">{classLabels[h.class] || h.class}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {/* SR items */}
                      {entry.srItems && entry.srItems.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-gray-800/30">
                          <span className="text-[10px] text-gray-600 mr-1 self-center">SR:</span>
                          {entry.srItems.map((itemId, j) => {
                            const info = srItemLookup[itemId];
                            const rs = RARITY_STYLES[info?.rarity] || RARITY_STYLES.common;
                            return (
                              <span key={j} className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded ${rs.badge}`}>
                                <Star className="w-2.5 h-2.5 fill-current" />
                                {info?.name || itemId}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Admin force-start removed — expedition auto-launches at 19h */}

      {/* Finished/Wiped recap */}
      {(status === 'finished' || status === 'wiped') && (
        <div className={`bg-[#1a1a2e] border ${status === 'finished' ? 'border-green-500/30' : 'border-red-500/30'} rounded-xl p-5`}>
          <h2 className={`text-lg font-semibold ${status === 'finished' ? 'text-green-300' : 'text-red-300'} mb-3 flex items-center gap-2`}>
            <Trophy className="w-5 h-5" />
            {status === 'finished' ? 'Expedition terminee !' : 'Wipe total...'}
          </h2>

          {/* Summary stats */}
          {liveStatus && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              <StatCard icon={Skull} label="Boss tues" value={liveStatus.bossesKilled || recapData?.expedition?.maxBossReached || 0} />
              <StatCard icon={Clock} label="Duree" value={formatTime(liveStatus.elapsedSeconds || (recapData?.expedition?.endedAt && recapData?.expedition?.startedAt ? Math.floor((new Date(recapData.expedition.endedAt) - new Date(recapData.expedition.startedAt)) / 1000) : 0))} />
              <StatCard icon={Users} label="Survivants" value={`${liveStatus.aliveCount || 0}/${liveStatus.totalCharacters || 0}`} />
            </div>
          )}

          {/* Recap tabs */}
          {recapData && (
            <>
              <div className="flex gap-1 mb-4 border-b border-gray-700/50 pb-2">
                {[
                  { key: 'summary', label: 'Resume', icon: ScrollText },
                  { key: 'loot', label: 'Butin', icon: Package },
                  { key: 'leaderboard', label: 'Classement', icon: Trophy },
                ].map(tab => (
                  <button key={tab.key} onClick={() => setRecapTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      recapTab === tab.key ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' : 'text-gray-500 hover:text-gray-300 border border-transparent'
                    }`}>
                    <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                  </button>
                ))}
              </div>

              {/* SUMMARY TAB */}
              {recapTab === 'summary' && (() => {
                const cs = recapData.characterStates || [];
                const totalDmg = cs.reduce((s, c) => s + (c.damage_dealt || 0), 0);
                const totalHeal = cs.reduce((s, c) => s + (c.healing_done || 0), 0);
                const totalDeaths = cs.reduce((s, c) => s + (c.deaths || 0), 0);
                const totalKills = cs.reduce((s, c) => s + (c.kills || 0), 0);
                const aliveCount = cs.filter(c => c.alive).length;
                const lootCount = (recapData.lootHistory || []).filter(l => !l.stolen).length;
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <MiniStat label="Boss vaincus" value={`${recapData.expedition.maxBossReached || 0}/15`} color="text-yellow-400" />
                    <MiniStat label="Degats totaux" value={formatBigNumber(totalDmg)} color="text-red-400" />
                    <MiniStat label="Soins totaux" value={formatBigNumber(totalHeal)} color="text-green-400" />
                    <MiniStat label="Kills" value={totalKills} color="text-amber-400" />
                    <MiniStat label="Morts" value={totalDeaths} color="text-red-500" />
                    <MiniStat label="Survivants" value={`${aliveCount}/${cs.length}`} color="text-cyan-400" />
                    <MiniStat label="Items obtenus" value={lootCount} color="text-purple-400" />
                    <MiniStat label="Joueurs" value={recapData.entries?.length || 0} color="text-blue-400" />
                    <MiniStat label="Hunters" value={cs.length} color="text-gray-300" />
                  </div>
                );
              })()}

              {/* LOOT TAB */}
              {recapTab === 'loot' && (() => {
                const byPlayer = recapData.lootByPlayer || {};
                const playerNames = Object.keys(byPlayer).sort();
                if (playerNames.length === 0) return <p className="text-gray-500 text-sm text-center py-4">Aucun loot</p>;
                return (
                  <div className="space-y-3">
                    {playerNames.map(name => (
                      <div key={name} className="bg-[#0f0f1a] rounded-lg p-3">
                        <div className="text-sm font-bold text-purple-300 mb-2 flex items-center gap-2">
                          <Users className="w-3.5 h-3.5" /> {name}
                          <span className="text-gray-500 font-normal">({byPlayer[name].length} items)</span>
                        </div>
                        <div className="space-y-1">
                          {byPlayer[name].map((item, i) => {
                            const rs = RARITY_STYLES[item.rarity] || RARITY_STYLES.common;
                            return (
                              <div key={i} className={`flex items-center gap-2 px-2 py-1 rounded ${rs.bg} border ${rs.border}`}>
                                <span className={`text-xs font-bold ${rs.text}`}>{item.itemName}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${rs.badge}`}>{item.rarity}</span>
                                {item.srWinner && <span className="text-[9px] px-1 py-0.5 rounded bg-yellow-600/30 text-yellow-300 font-bold">SR</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* LEADERBOARD TAB */}
              {recapTab === 'leaderboard' && (() => {
                const cs = recapData.characterStates || [];
                const dpsBoard = [...cs].sort((a, b) => (b.damage_dealt || 0) - (a.damage_dealt || 0)).slice(0, 15);
                const healBoard = [...cs].sort((a, b) => (b.healing_done || 0) - (a.healing_done || 0)).filter(c => c.healing_done > 0).slice(0, 10);
                const maxDmg = dpsBoard[0]?.damage_dealt || 1;
                const maxHeal = healBoard[0]?.healing_done || 1;
                return (
                  <div className="space-y-4">
                    {/* DPS Leaderboard */}
                    <div>
                      <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Swords className="w-3.5 h-3.5" /> Degats</h3>
                      <div className="space-y-1">
                        {dpsBoard.map((c, i) => {
                          const h = HUNTERS[c.hunter_id];
                          const pct = Math.max(2, (c.damage_dealt / maxDmg) * 100);
                          return (
                            <div key={c.hunter_id} className="flex items-center gap-2 text-xs">
                              <span className="text-gray-500 w-4 text-right font-bold">{i + 1}</span>
                              {h?.sprite && <img src={h.sprite} className="w-5 h-5 rounded-full object-cover" alt="" />}
                              <span className="text-gray-200 w-24 truncate">{h?.name || c.hunter_id} <span className="text-gray-600">({c.username})</span></span>
                              <div className="flex-1 h-3 bg-gray-800/50 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500/40 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-gray-400 w-16 text-right font-mono">{formatBigNumber(c.damage_dealt)}</span>
                              {!c.alive && <Skull className="w-3 h-3 text-red-500" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {/* Heal Leaderboard */}
                    {healBoard.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> Soins</h3>
                        <div className="space-y-1">
                          {healBoard.map((c, i) => {
                            const h = HUNTERS[c.hunter_id];
                            const pct = Math.max(2, (c.healing_done / maxHeal) * 100);
                            return (
                              <div key={c.hunter_id} className="flex items-center gap-2 text-xs">
                                <span className="text-gray-500 w-4 text-right font-bold">{i + 1}</span>
                                {h?.sprite && <img src={h.sprite} className="w-5 h-5 rounded-full object-cover" alt="" />}
                                <span className="text-gray-200 w-24 truncate">{h?.name || c.hunter_id} <span className="text-gray-600">({c.username})</span></span>
                                <div className="flex-1 h-3 bg-gray-800/50 rounded-full overflow-hidden">
                                  <div className="h-full bg-green-500/40 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-gray-400 w-16 text-right font-mono">{formatBigNumber(c.healing_done)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </>
          )}

          {!recapData && (status === 'finished' || status === 'wiped') && (
            <p className="text-gray-500 text-sm text-center py-4">Chargement du recap...</p>
          )}

          <button
            onClick={createExpedition}
            disabled={loading}
            className="mt-4 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" /> Nouvelle expedition
          </button>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──

function StatusBadge({ status }) {
  const styles = {
    none: 'bg-gray-700 text-gray-300',
    idle: 'bg-gray-700 text-gray-300',
    registration: 'bg-blue-600 text-white',
    march: 'bg-blue-500 text-white',
    combat: 'bg-red-600 text-white',
    loot_roll: 'bg-purple-600 text-white',
    campfire: 'bg-yellow-500 text-black',
    finished: 'bg-green-600 text-white',
    wiped: 'bg-red-900 text-white',
  };
  const labels = {
    none: 'Aucune', idle: 'En attente', registration: 'Inscription',
    march: 'Marche', combat: 'Combat', loot_roll: 'Loot Roll',
    campfire: 'Campfire', finished: 'Terminee', wiped: 'Wipe',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${styles[status] || styles.none}`}>
      {labels[status] || status}
    </span>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-[#0f0f1a] rounded-lg p-3 text-center">
      <Icon className="w-4 h-4 text-gray-500 mx-auto mb-1" />
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function formatTime(seconds) {
  if (!seconds) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h${String(m).padStart(2, '0')}m`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatBigNumber(n) {
  if (!n) return '0';
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(Math.floor(n));
}

function MiniStat({ label, value, color }) {
  return (
    <div className="bg-[#0f0f1a] rounded-lg p-2.5 text-center">
      <div className={`text-lg font-bold ${color || 'text-gray-200'}`}>{value}</div>
      <div className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</div>
    </div>
  );
}

// ── SR Summary Pills ──
// Shows selected SR items as compact pills with rarity color + remove button
function SRSummaryPills({ selectedSRs, srItemLookup, srCountByItem, onRemove, username }) {
  if (!selectedSRs || selectedSRs.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mb-2">
      {selectedSRs.map(itemId => {
        const info = srItemLookup[itemId];
        const rs = RARITY_STYLES[info?.rarity] || RARITY_STYLES.common;
        const others = (srCountByItem[itemId] || []).filter(u => u.toLowerCase() !== username.trim().toLowerCase());
        return (
          <span
            key={itemId}
            className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${rs.badge} border ${RARITY_STYLES[info?.rarity]?.border || 'border-gray-600/50'}`}
            title={others.length > 0 ? `Aussi SR par: ${others.join(', ')}` : 'Aucun concurrent'}
          >
            <Star className="w-3 h-3 fill-current flex-shrink-0" />
            <span className="truncate max-w-[120px]">{info?.name || itemId}</span>
            {others.length > 0 && (
              <span className="text-[9px] opacity-70 flex-shrink-0">({others.length})</span>
            )}
            {onRemove && (
              <button onClick={() => onRemove(itemId)} className="ml-0.5 hover:text-red-300 flex-shrink-0">
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        );
      })}
    </div>
  );
}

// ── Item Tooltip ──
// WoW-style rich tooltip with rarity glow, stats, set bonuses, weapon passives
function ItemTooltip({ item, children }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  const hasDetail = item.stats || item.setInfo || item.weaponInfo || item.uniqueInfo || item.description;
  if (!hasDetail) return children;

  const rs = RARITY_STYLES[item.rarity] || RARITY_STYLES.common;
  const glow = RARITY_GLOW[item.rarity] || RARITY_GLOW.common;
  const stats = formatStats(item.stats);
  const setBonus2 = item.setInfo?.bonus2pc ? formatStats(item.setInfo.bonus2pc) : null;

  const handleEnter = () => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: rect.left, y: rect.top });
    setShow(true);
  };

  return (
    <div ref={ref} onMouseEnter={handleEnter} onMouseLeave={() => setShow(false)} className="relative">
      {children}
      {show && (
        <div
          className="fixed z-[100] pointer-events-none"
          style={{
            left: Math.min(pos.x - 8, window.innerWidth - 310),
            top: Math.max(pos.y - 8, 8),
            transform: 'translateY(-100%)',
            animation: 'tooltipFadeIn 0.15s ease-out',
          }}
        >
          <div
            className="w-72 rounded-xl overflow-hidden"
            style={{ boxShadow: glow.glow, border: `1.5px solid ${glow.border}` }}
          >
            {/* Top gradient accent bar */}
            <div className="h-1" style={{ background: `linear-gradient(90deg, transparent, ${glow.border}, transparent)` }} />

            <div className="bg-[#0a0a16]/98 backdrop-blur-xl p-3">
              {/* Header — Item name + element badge */}
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm font-bold ${rs.text}`} style={{ textShadow: `0 0 8px ${glow.border}40` }}>
                  {item.name}
                </span>
              </div>
              {/* Sub-header — rarity, slot, type, binding */}
              <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mb-2.5 text-[10px] text-gray-500">
                <span className={`${rs.badge} px-1.5 py-0.5 rounded font-medium`}>{item.rarity}</span>
                {item.slot && <span>{SLOT_LABELS[item.slot] || item.slot}</span>}
                {item.type && item.type !== 'set_piece' && item.type !== 'unique' && <span className="capitalize">{item.type}</span>}
                {item.type === 'set_piece' && <span>Piece de set</span>}
                {item.type === 'unique' && <span className="text-yellow-400">Unique</span>}
                {item.binding && <span className="text-gray-600">· {BINDING_LABELS[item.binding] || item.binding}</span>}
              </div>

              {/* ── Weapon ATK block ── */}
              {item.weaponInfo && (
                <div className="mb-2.5 py-2 px-2.5 rounded-lg border border-red-500/20" style={{ background: 'linear-gradient(135deg, rgba(127,29,29,0.2), rgba(30,10,10,0.3))' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-base text-red-300 font-black tracking-tight">ATK {item.weaponInfo.atk}</div>
                      {item.weaponInfo.weaponType && <div className="text-[10px] text-gray-500 capitalize">{item.weaponInfo.weaponType}</div>}
                    </div>
                    {item.weaponInfo.element && (
                      <span className={`text-[10px] px-2 py-1 rounded-lg font-medium ${ELEMENT_COLORS[item.weaponInfo.element]?.bg || ''} ${ELEMENT_COLORS[item.weaponInfo.element]?.text || 'text-gray-400'} border ${ELEMENT_COLORS[item.weaponInfo.element]?.border || 'border-gray-600'}`}>
                        {ELEMENT_LABELS[item.weaponInfo.element] || item.weaponInfo.element}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* ── Item Stats ── */}
              {stats && stats.length > 0 && (
                <div className="mb-2.5">
                  <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-1 font-semibold">Stats</div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {stats.map((s, i) => <span key={i} className="text-xs text-green-400 font-medium">{s}</span>)}
                  </div>
                </div>
              )}

              {/* ── Weapon Bonus Stats ── */}
              {item.weaponInfo?.bonus && (
                <div className="mb-2.5">
                  <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-1 font-semibold">Bonus</div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {formatStats(item.weaponInfo.bonus)?.map((s, i) => <span key={i} className="text-xs text-green-400 font-medium">{s}</span>)}
                  </div>
                </div>
              )}

              {/* ── Weapon Passive ── */}
              {item.weaponInfo?.passive && (
                <div className="mb-2.5 py-2 px-2.5 rounded-lg border border-yellow-500/20" style={{ background: 'linear-gradient(135deg, rgba(113,63,18,0.15), rgba(30,20,5,0.2))' }}>
                  <div className="text-[10px] text-yellow-400 font-bold uppercase tracking-wide mb-0.5">Passif</div>
                  <div className="text-[11px] text-yellow-200/90 leading-relaxed">{item.weaponInfo.passive.description}</div>
                </div>
              )}

              {/* ── Set Info ── */}
              {item.setInfo && (
                <div className="mb-2.5 py-2 px-2.5 rounded-lg border border-purple-500/20" style={{ background: 'linear-gradient(135deg, rgba(88,28,135,0.15), rgba(20,5,30,0.2))' }}>
                  <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wide mb-1">Set: {item.setInfo.name}</div>
                  {item.setInfo.targetClass && (
                    <div className="text-[9px] text-gray-500 mb-1.5">
                      {Array.isArray(item.setInfo.targetClass)
                        ? (item.setInfo.targetClass.includes('all') ? 'Toutes classes' : item.setInfo.targetClass.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', '))
                        : item.setInfo.targetClass
                      }
                    </div>
                  )}
                  {setBonus2 && (
                    <div className="mb-1 flex items-baseline gap-1">
                      <span className="text-[10px] text-purple-400 font-bold">(2)</span>
                      <span className="text-[11px] text-purple-200/80">{setBonus2.join(', ')}</span>
                    </div>
                  )}
                  {item.setInfo.bonus4pc && (
                    <div className="flex items-baseline gap-1">
                      <span className="text-[10px] text-purple-400 font-bold">(4)</span>
                      <span className="text-[11px] text-purple-200/80 leading-relaxed">
                        {typeof item.setInfo.bonus4pc === 'object' && item.setInfo.bonus4pc.passive
                          ? item.setInfo.bonus4pc.description
                          : formatStats(item.setInfo.bonus4pc)?.join(', ') || JSON.stringify(item.setInfo.bonus4pc)
                        }
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* ── Unique Info ── */}
              {item.uniqueInfo && (
                <div className="mb-2.5 py-2 px-2.5 rounded-lg border border-yellow-500/30" style={{ background: 'linear-gradient(135deg, rgba(161,98,7,0.15), rgba(30,20,5,0.25))' }}>
                  <div className="text-[10px] text-yellow-400 font-bold uppercase tracking-wide mb-0.5">Passif Unique</div>
                  <div className="text-[11px] text-yellow-200/90 leading-relaxed">{item.uniqueInfo.passive?.description}</div>
                  {item.uniqueInfo.achievement && (
                    <div className="mt-1.5 pt-1 border-t border-yellow-800/30 text-[10px] text-amber-500/70 italic">
                      {item.uniqueInfo.achievement.description}
                    </div>
                  )}
                </div>
              )}

              {/* ── Description ── */}
              {item.description && (
                <div className="text-[11px] text-gray-400 italic leading-snug mb-1">{item.description}</div>
              )}

              {/* ── Footer: drop chance ── */}
              <div className="mt-2 pt-1.5 border-t border-gray-800/40 text-[10px] text-gray-600 flex justify-between items-center">
                <span>Drop: <span className="text-gray-400 font-medium">{item.dropChance}%</span></span>
                {item.srEligible && <span className="text-yellow-600 font-medium flex items-center gap-0.5"><Star className="w-2.5 h-2.5" /> SR eligible</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Boss Loot Codex ──
// Full boss loot browser with SR selection, type icons, and other players' SR visibility
function BossLootCodex({ bossLootData, selectedBoss, setSelectedBoss, rarityFilter, setRarityFilter, selectedSRs, toggleSR, srCountByItem, username, interactive }) {
  const boss = bossLootData.find(b => b.bossId === selectedBoss);
  const zoneStyle = ZONE_STYLES[boss?.zone] || ZONE_STYLES.foret;
  const rarities = ['all', 'mythique', 'legendary', 'epic', 'rare', 'uncommon', 'common'];

  // Filter loot by rarity
  const filteredLoot = (boss?.loot || []).filter(item => {
    if (rarityFilter !== 'all' && item.rarity !== rarityFilter) return false;
    return true;
  });

  return (
    <div className="bg-[#0f0f1a] rounded-lg border border-gray-800 overflow-hidden">
      {/* Boss Selector — scrollable tabs */}
      <div className="flex overflow-x-auto gap-0.5 p-1.5 bg-[#0a0a15] border-b border-gray-800 scrollbar-thin">
        {bossLootData.map(b => {
          const z = ZONE_STYLES[b.zone] || ZONE_STYLES.foret;
          const active = b.bossId === selectedBoss;
          return (
            <button
              key={b.bossId}
              onClick={() => setSelectedBoss(b.bossId)}
              className={`flex-shrink-0 px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
                active
                  ? `${z.bg} ${z.text} ring-1 ring-current`
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
              }`}
              title={b.name}
            >
              {b.bossId}
            </button>
          );
        })}
      </div>

      {/* Boss Info + Rarity Filter */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800/50">
        <div className="flex items-center gap-2">
          <Skull className="w-4 h-4 text-red-400" />
          <span className="text-sm font-medium text-gray-200">{boss?.name || '???'}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${zoneStyle.bg} ${zoneStyle.text}`}>{zoneStyle.label}</span>
        </div>
        <div className="flex gap-1">
          {rarities.map(r => (
            <button
              key={r}
              onClick={() => setRarityFilter(r)}
              className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                rarityFilter === r
                  ? (r === 'all' ? 'bg-gray-600 text-white' : `${RARITY_STYLES[r]?.badge || 'bg-gray-600 text-white'}`)
                  : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              {r === 'all' ? 'Tout' : r.charAt(0).toUpperCase() + r.slice(1, 4)}
            </button>
          ))}
        </div>
      </div>

      {/* Loot Items */}
      <div className="max-h-72 overflow-y-auto p-2 space-y-1">
        {filteredLoot.length === 0 && (
          <p className="text-gray-600 text-xs text-center py-4">Aucun loot pour ce filtre</p>
        )}
        {filteredLoot.map(item => {
          const rs = RARITY_STYLES[item.rarity] || RARITY_STYLES.common;
          const isSR = selectedSRs?.includes(item.itemId);
          const srUsers = srCountByItem[item.itemId] || [];
          const otherSR = srUsers.filter(u => u.toLowerCase() !== username.trim().toLowerCase());
          const TypeIcon = TYPE_ICONS[item.type || (item.uniqueId ? 'unique' : item.setId ? 'set_piece' : item.weaponId ? 'weapon' : 'armor')] || Package;
          const itemStats = formatStats(item.stats);

          return (
            <ItemTooltip key={item.itemId} item={item}>
              <div
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border transition-all ${
                  isSR
                    ? `${rs.bg} ${rs.border} ring-1 ring-yellow-500/40`
                    : `bg-[#12121f] border-gray-800/50 ${interactive && item.srEligible ? 'hover:border-gray-600 cursor-pointer' : ''}`
                }`}
                onClick={() => interactive && item.srEligible && toggleSR(item.itemId)}
              >
                {/* Type Icon */}
                <TypeIcon className={`w-4 h-4 flex-shrink-0 ${rs.text}`} />

                {/* Item Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-medium ${rs.text}`}>{item.name}</span>
                    {item.setInfo && <span className="text-[9px] text-purple-400/70">(Set)</span>}
                    {item.weaponInfo && <span className="text-[9px] text-orange-400/70">(Arme)</span>}
                    {item.uniqueInfo && <span className="text-[9px] text-yellow-400/70">(Unique)</span>}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <span className={`${rs.badge} px-1 py-0 rounded text-[9px]`}>{item.rarity}</span>
                    <span>{item.dropChance}%</span>
                    {item.slot && <span className="text-gray-600">· {SLOT_LABELS[item.slot] || item.slot}</span>}
                  </div>
                  {/* Inline preview: key stats or set name */}
                  {itemStats && itemStats.length > 0 && (
                    <div className="text-[9px] text-green-500/60 mt-0.5 truncate">
                      {itemStats.slice(0, 3).join(' · ')}
                    </div>
                  )}
                  {item.setInfo && !itemStats?.length && (
                    <div className="text-[9px] text-purple-400/50 mt-0.5 truncate">
                      Set: {item.setInfo.name}
                    </div>
                  )}
                  {item.weaponInfo && (
                    <div className="text-[9px] text-red-400/50 mt-0.5">
                      ATK {item.weaponInfo.atk} · {ELEMENT_LABELS[item.weaponInfo.element] || item.weaponInfo.element}
                    </div>
                  )}
                  {item.uniqueInfo && (
                    <div className="text-[9px] text-yellow-400/50 mt-0.5 truncate">
                      {item.uniqueInfo.passive?.description?.slice(0, 50)}{item.uniqueInfo.passive?.description?.length > 50 ? '...' : ''}
                    </div>
                  )}
                </div>

                {/* SR Concurrence — other players who SR'd this item */}
                {srUsers.length > 0 && (
                  <div className="flex-shrink-0 text-right" title={`SR par: ${srUsers.join(', ')}`}>
                    <div className="flex items-center gap-0.5">
                      <Users className="w-3 h-3 text-yellow-500/60" />
                      <span className="text-[10px] text-yellow-500/70 font-medium">{srUsers.length}</span>
                    </div>
                    {otherSR.length > 0 && (
                      <div className="text-[9px] text-gray-600 truncate max-w-[80px]">
                        {otherSR.slice(0, 2).join(', ')}{otherSR.length > 2 ? '...' : ''}
                      </div>
                    )}
                  </div>
                )}

                {/* SR Badge */}
                {isSR && (
                  <span className="flex-shrink-0 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-yellow-500/30">
                    SR
                  </span>
                )}
                {!isSR && interactive && item.srEligible && (
                  <span className="flex-shrink-0 text-[10px] text-gray-600">
                    +SR
                  </span>
                )}
                {!item.srEligible && (
                  <Lock className="w-3 h-3 text-gray-700 flex-shrink-0" />
                )}
              </div>
            </ItemTooltip>
          );
        })}
      </div>

      {/* Footer: SR count */}
      {interactive && (
        <div className="px-3 py-2 border-t border-gray-800/50 text-center text-[10px] text-gray-500">
          {selectedSRs?.length || 0}/{SR_MAX} SR selectionnes — Clique un item pour SR
        </div>
      )}
    </div>
  );
}

// ── SR Win Notification Toasts ──
// Animated toast notifications when a player wins an SR loot item
function SRNotificationToasts({ notifications, onDismiss }) {
  if (!notifications || notifications.length === 0) return null;
  return (
    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[70] flex flex-col gap-2 pointer-events-none">
      {notifications.map(n => {
        const rs = RARITY_STYLES[n.rarity] || RARITY_STYLES.common;
        return (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${rs.bg} ${rs.border}`}
            style={{ minWidth: 280, animation: 'srSlideDown 0.3s ease-out' }}
          >
            <div className="flex-shrink-0">
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-yellow-400 font-bold uppercase tracking-wide">SR Obtenu !</div>
              <div className={`text-sm font-semibold ${rs.text} truncate`}>{n.itemName}</div>
              {n.rollValue && (
                <div className="text-[10px] text-gray-400">Roll: {n.rollValue}/100</div>
              )}
            </div>
            <button
              onClick={() => onDismiss(n.id)}
              className="flex-shrink-0 text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ── Codex Overlay (Modal) ──
// Read-only boss loot codex overlay accessible during active expedition
function CodexOverlay({ bossLootData, selectedBoss, setSelectedBoss, rarityFilter, setRarityFilter, selectedSRs, srCountByItem, username, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-[#1a1a2e] border border-yellow-500/30 rounded-xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl shadow-yellow-500/10"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-semibold text-yellow-300">Codex Boss Loot</span>
          </div>
          <div className="flex items-center gap-3">
            {selectedSRs.length > 0 && (
              <span className="text-[10px] text-yellow-500 flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                {selectedSRs.length} SR actifs
              </span>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* My SR summary */}
        {selectedSRs.length > 0 && (
          <div className="px-4 py-2 border-b border-gray-800/50">
            <SRSummaryPills
              selectedSRs={selectedSRs}
              srItemLookup={(() => {
                const map = {};
                for (const boss of bossLootData) {
                  for (const loot of boss.loot) {
                    if (!map[loot.itemId]) map[loot.itemId] = loot;
                  }
                }
                return map;
              })()}
              srCountByItem={srCountByItem}
              username={username}
            />
          </div>
        )}

        {/* Codex content (scrollable) */}
        <div className="flex-1 overflow-y-auto p-3">
          <BossLootCodex
            bossLootData={bossLootData}
            selectedBoss={selectedBoss}
            setSelectedBoss={setSelectedBoss}
            rarityFilter={rarityFilter}
            setRarityFilter={setRarityFilter}
            selectedSRs={selectedSRs}
            toggleSR={() => {}}
            srCountByItem={srCountByItem}
            username={username}
            interactive={false}
          />
        </div>
      </div>
    </div>
  );
}
