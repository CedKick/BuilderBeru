import { useState, useEffect, useCallback, useRef } from 'react';
import { Swords, Users, Play, Plus, LogIn, Eye, Clock, Shield, Skull, Trophy, ChevronRight, Flame, X } from 'lucide-react';

// ── API Config ──
const API_BASE = import.meta.env.DEV
  ? 'http://localhost:3004'
  : 'https://api.builderberu.com/expedition';

const SPECTATOR_URL = import.meta.env.DEV
  ? 'http://localhost:3004/spectator'
  : 'https://api.builderberu.com/expedition/spectator';

// ── Hunter display data (minimal subset for registration UI) ──
const HUNTER_ELEMENTS = {
  h_sung: 'shadow', h_cha_hae_in: 'water', h_baek_yoonho: 'fire',
  h_choi_jong_in: 'fire', h_min_byung_gyu: 'water', h_lim_tae_gyu: 'fire',
  h_park_heejin: 'water', h_yoo_jinho: 'shadow', h_lee_joohee: 'water',
  h_goto_ryuji: 'fire', h_liu_zhigang: 'fire', h_thomas_andre: 'fire',
  h_lennart_niermann: 'water', h_kanae: 'shadow', h_esil: 'shadow',
  h_hwang_dongsoo: 'shadow',
};

const ELEMENT_COLORS = {
  fire: { bg: 'bg-red-900/30', border: 'border-red-500/50', text: 'text-red-400' },
  water: { bg: 'bg-blue-900/30', border: 'border-blue-500/50', text: 'text-blue-400' },
  shadow: { bg: 'bg-purple-900/30', border: 'border-purple-500/50', text: 'text-purple-400' },
};

// ── Main Component ──
export default function Expedition() {
  // Auth
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem('expedition_admin_key') || '');
  const [authenticated, setAuthenticated] = useState(false);

  // Data
  const [expedition, setExpedition] = useState(null);
  const [liveStatus, setLiveStatus] = useState(null);
  const [entries, setEntries] = useState([]);
  const [srItems, setSrItems] = useState([]);

  // Registration form
  const [username, setUsername] = useState(() => localStorage.getItem('expedition_username') || '');
  const [selectedHunters, setSelectedHunters] = useState([]);
  const [hunterLevels, setHunterLevels] = useState({});
  const [hunterStars, setHunterStars] = useState({});
  const [selectedSR, setSelectedSR] = useState('');

  // UI
  const [showSpectator, setShowSpectator] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const pollRef = useRef(null);

  // ── API Helper ──
  const api = useCallback(async (path, method = 'GET', body = null) => {
    const url = `${API_BASE}${path}${path.includes('?') ? '&' : '?'}key=${adminKey}`;
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }, [adminKey]);

  // ── Auth ──
  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api('/api/expedition/current');
      if (data.success !== undefined) {
        setAuthenticated(true);
        localStorage.setItem('expedition_admin_key', adminKey);
      }
    } catch {
      setError('Clé invalide');
    } finally {
      setLoading(false);
    }
  };

  // Auto-auth on mount
  useEffect(() => {
    if (adminKey && !authenticated) {
      handleLogin();
    }
  }, []); // eslint-disable-line

  // ── Fetch data ──
  const fetchStatus = useCallback(async () => {
    if (!authenticated) return;
    try {
      const [currentRes, entriesRes, itemsRes] = await Promise.all([
        api('/api/expedition/current'),
        api('/api/expedition/entries'),
        api('/api/expedition/items'),
      ]);
      setExpedition(currentRes.expedition);
      setLiveStatus(currentRes.live);
      setEntries(entriesRes.entries || []);
      setSrItems(itemsRes.items || []);
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
      setSuccess('Expédition créée !');
      await fetchStatus();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const register = async () => {
    if (!username.trim() || selectedHunters.length === 0) {
      setError('Choisis un pseudo et au moins 1 hunter');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const characterData = {};
      for (const hId of selectedHunters) {
        characterData[hId] = {
          level: hunterLevels[hId] || 30,
          stars: hunterStars[hId] || 3,
        };
      }
      await api('/api/expedition/register', 'POST', {
        username: username.trim(),
        characterIds: selectedHunters,
        characterData,
        srItemId: selectedSR || null,
      });
      localStorage.setItem('expedition_username', username.trim());
      setSuccess(`${username} inscrit avec ${selectedHunters.length} hunter(s) !`);
      setSelectedHunters([]);
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
      setSuccess('Expédition lancée !');
      setShowSpectator(true);
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
      if (prev.length >= 3) return prev;
      return [...prev, hId];
    });
  };

  // ── Auto-show spectator when active ──
  useEffect(() => {
    if (liveStatus && ['march', 'combat', 'loot_roll', 'campfire'].includes(liveStatus.status)) {
      setShowSpectator(true);
    }
  }, [liveStatus]);

  // ── Clear messages ──
  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => { setError(''); setSuccess(''); }, 4000);
      return () => clearTimeout(t);
    }
  }, [error, success]);

  // ═══════════════════════════════════════════
  // RENDER: Login
  // ═══════════════════════════════════════════
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="bg-[#1a1a2e] border border-purple-500/30 rounded-xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <Swords className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-purple-300">Expedition I</h1>
            <p className="text-gray-500 text-sm mt-1">Accès restreint - Phase de test</p>
          </div>
          <input
            type="text"
            value={adminKey}
            onChange={e => setAdminKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Clé admin"
            className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none mb-4"
          />
          <button
            onClick={handleLogin}
            disabled={loading || !adminKey}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Connexion...' : 'Entrer'}
          </button>
          {error && <p className="text-red-400 text-sm text-center mt-3">{error}</p>}
        </div>
      </div>
    );
  }

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
        <iframe
          src={`${SPECTATOR_URL}?key=${adminKey}`}
          className="w-full h-screen border-0"
          title="Expedition Spectator"
        />
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // RENDER: Dashboard
  // ═══════════════════════════════════════════
  // Engine status is "idle" when not running; prefer DB expedition status in that case
  const engineStatus = liveStatus?.status;
  const dbStatus = expedition?.status;
  const status = (engineStatus && engineStatus !== 'idle') ? engineStatus : (dbStatus || 'none');
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
        {isActive && (
          <button
            onClick={() => setShowSpectator(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <Eye className="w-4 h-4" /> Regarder le combat
          </button>
        )}
      </div>

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
            <StatCard icon={Skull} label="Boss tués" value={liveStatus.bossesKilled} />
            <StatCard icon={ChevronRight} label="Encounter" value={`${liveStatus.currentEncounter}/${liveStatus.totalEncounters}`} />
            <StatCard icon={Clock} label="Temps" value={formatTime(liveStatus.elapsedSeconds)} />
          </div>
        )}
        {isRegistration && (
          <p className="text-blue-400 text-sm mt-2">Inscription ouverte - inscris tes hunters ci-dessous</p>
        )}
        {!expedition && (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">Aucune expédition active</p>
            <button
              onClick={createExpedition}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              {loading ? 'Création...' : 'Créer une expédition'}
            </button>
          </div>
        )}
      </div>

      {/* Registration Section */}
      {isRegistration && (
        <div className="bg-[#1a1a2e] border border-gray-800 rounded-xl p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" /> Inscription
          </h2>

          {/* Username */}
          <div className="mb-4">
            <label className="text-sm text-gray-400 mb-1 block">Pseudo</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Ton pseudo"
              className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:border-purple-500 focus:outline-none text-sm"
            />
          </div>

          {/* Hunter Selection */}
          <div className="mb-4">
            <label className="text-sm text-gray-400 mb-2 block">Hunters ({selectedHunters.length}/3)</label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {Object.entries(HUNTER_ELEMENTS).map(([hId, element]) => {
                const selected = selectedHunters.includes(hId);
                const colors = ELEMENT_COLORS[element];
                const name = hId.replace('h_', '').replace(/_/g, ' ');
                return (
                  <button
                    key={hId}
                    onClick={() => toggleHunter(hId)}
                    className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                      selected
                        ? `${colors.bg} ${colors.border} ${colors.text} ring-1 ring-${element === 'fire' ? 'red' : element === 'water' ? 'blue' : 'purple'}-400`
                        : 'bg-[#0f0f1a] border-gray-800 text-gray-500 hover:border-gray-600'
                    }`}
                    title={name}
                  >
                    <div className="truncate capitalize">{name.split(' ')[0]}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Level/Stars for selected hunters */}
          {selectedHunters.length > 0 && (
            <div className="mb-4 space-y-2">
              {selectedHunters.map(hId => {
                const name = hId.replace('h_', '').replace(/_/g, ' ');
                return (
                  <div key={hId} className="flex items-center gap-3 bg-[#0f0f1a] rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-300 capitalize w-32 truncate">{name}</span>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-500">Lvl</label>
                      <input
                        type="number"
                        min={1} max={80}
                        value={hunterLevels[hId] || 30}
                        onChange={e => setHunterLevels(p => ({ ...p, [hId]: parseInt(e.target.value) || 1 }))}
                        className="w-16 bg-[#1a1a2e] border border-gray-700 rounded px-2 py-1 text-white text-sm text-center"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-500">Stars</label>
                      <select
                        value={hunterStars[hId] || 3}
                        onChange={e => setHunterStars(p => ({ ...p, [hId]: parseInt(e.target.value) }))}
                        className="bg-[#1a1a2e] border border-gray-700 rounded px-2 py-1 text-white text-sm"
                      >
                        {[0,1,2,3,4,5].map(s => <option key={s} value={s}>{s} ★</option>)}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SR Selection */}
          {srItems.length > 0 && (
            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-1 block">Selection Rate (optionnel)</label>
              <select
                value={selectedSR}
                onChange={e => setSelectedSR(e.target.value)}
                className="w-full bg-[#0f0f1a] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="">Aucun SR</option>
                {srItems.map(item => (
                  <option key={item.id} value={item.id}>{item.name} ({item.rarity})</option>
                ))}
              </select>
            </div>
          )}

          {/* Register Button */}
          <button
            onClick={register}
            disabled={loading || !username.trim() || selectedHunters.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {loading ? 'Inscription...' : "S'inscrire"}
          </button>
        </div>
      )}

      {/* Entries List */}
      {entries.length > 0 && (
        <div className="bg-[#1a1a2e] border border-gray-800 rounded-xl p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-200 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-400" /> Inscrits ({entries.length})
          </h2>
          <div className="space-y-2">
            {entries.map((entry, i) => (
              <div key={i} className="flex items-center justify-between bg-[#0f0f1a] rounded-lg px-3 py-2">
                <span className="text-sm font-medium text-gray-200">{entry.username}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{entry.characterIds?.length || 0} hunters</span>
                  {entry.srItemId && <span className="text-xs text-yellow-500">SR: {entry.srItemId}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin: Force Start */}
      {isRegistration && entries.length > 0 && (
        <div className="bg-[#1a1a2e] border border-orange-500/30 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-orange-300 mb-3 flex items-center gap-2">
            <Flame className="w-5 h-5" /> Admin
          </h2>
          <button
            onClick={forceStart}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Play className="w-5 h-5" />
            {loading ? 'Démarrage...' : 'Lancer maintenant'}
          </button>
        </div>
      )}

      {/* Finished/Wiped summary */}
      {(status === 'finished' || status === 'wiped') && liveStatus && (
        <div className={`bg-[#1a1a2e] border ${status === 'finished' ? 'border-green-500/30' : 'border-red-500/30'} rounded-xl p-5`}>
          <h2 className={`text-lg font-semibold ${status === 'finished' ? 'text-green-300' : 'text-red-300'} mb-3 flex items-center gap-2`}>
            <Trophy className="w-5 h-5" />
            {status === 'finished' ? 'Expédition terminée !' : 'Wipe total...'}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={Skull} label="Boss tués" value={liveStatus.bossesKilled} />
            <StatCard icon={Clock} label="Durée" value={formatTime(liveStatus.elapsedSeconds)} />
            <StatCard icon={Users} label="Survivants" value={`${liveStatus.aliveCount}/${liveStatus.totalCharacters}`} />
          </div>
          <button
            onClick={createExpedition}
            disabled={loading}
            className="mt-4 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" /> Nouvelle expédition
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
    campfire: 'Campfire', finished: 'Terminée', wiped: 'Wipe',
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
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
