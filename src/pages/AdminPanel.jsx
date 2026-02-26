// src/pages/AdminPanel.jsx — Admin panel for managing player data (Kly only)
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Search, User, ChevronLeft, Save, RefreshCw, Package, Sword, Star, TrendingUp, X, Check, AlertTriangle, Activity, Eye, Ban, ShieldCheck, ShieldAlert } from 'lucide-react';
import { isLoggedIn, authHeaders, getAuthUser } from '../utils/auth';
import { HUNTERS } from './ShadowColosseum/raidData';
import { WEAPONS } from './ShadowColosseum/equipmentData';

const API = '/api/admin';

const SAVE_KEY = 'shadow_colosseum_data';
const RAID_KEY = 'shadow_colosseum_raid';

const TABS = [
  { id: 'overview', label: 'Vue globale', icon: User },
  { id: 'hunters', label: 'Hunters', icon: Star },
  { id: 'weapons', label: 'Armes', icon: Sword },
  { id: 'account', label: 'Compte', icon: TrendingUp },
  { id: 'inventory', label: 'Inventaire', icon: Package },
  { id: 'anticheat', label: 'Anti-Cheat', icon: ShieldAlert },
  { id: 'diagnostics', label: 'Serveur', icon: Activity },
];

export default function AdminPanel() {
  const navigate = useNavigate();

  // Auth check
  useEffect(() => {
    const user = getAuthUser();
    if (!isLoggedIn() || !user || user.username.toLowerCase() !== 'kly') {
      navigate('/');
    }
  }, [navigate]);

  // ─── State ─────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);

  const [selectedUser, setSelectedUser] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [raidData, setRaidData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [error, setError] = useState(null);

  // Pending modifications (tracked before save)
  const [pendingChanges, setPendingChanges] = useState({});

  const searchTimeout = useRef(null);

  // ─── Load all users on mount ──────────────────────────
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (q = '') => {
    setSearchLoading(true);
    try {
      const url = q
        ? `${API}?action=list-users&q=${encodeURIComponent(q)}&limit=50`
        : `${API}?action=list-users&limit=50`;
      const resp = await fetch(url, { headers: authHeaders() });
      const data = await resp.json();
      if (data.success) {
        if (q) {
          setSearchResults(data.users);
        } else {
          setAllUsers(data.users);
          setTotalUsers(data.total);
        }
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchQuery(term);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!term || term.length < 1) {
      setSearchResults([]);
      return;
    }
    searchTimeout.current = setTimeout(() => loadUsers(term), 300);
  };

  // ─── Load player data ─────────────────────────────────
  const loadPlayer = async (username) => {
    setLoading(true);
    setError(null);
    setSaveMsg(null);
    setPendingChanges({});
    try {
      const resp = await fetch(`${API}?action=get-player&username=${encodeURIComponent(username)}`, {
        headers: authHeaders(),
      });
      const data = await resp.json();
      if (data.success) {
        setSelectedUser(data.user);
        const coloData = data.storage[SAVE_KEY]?.data || null;
        const rData = data.storage[RAID_KEY]?.data || null;
        setPlayerData(coloData);
        setRaidData(rData);
        setActiveTab('overview');
      } else {
        setError(data.error || 'Erreur chargement joueur');
      }
    } catch (err) {
      setError('Erreur reseau: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Save changes ──────────────────────────────────────
  const saveChanges = async () => {
    if (!selectedUser || !playerData) return;
    setSaving(true);
    setError(null);
    setSaveMsg(null);
    try {
      const resp = await fetch(`${API}?action=update-player`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          username: selectedUser.username,
          storageKey: SAVE_KEY,
          data: playerData,
        }),
      });
      const result = await resp.json();
      if (result.success) {
        setSaveMsg(`Sauvegarde OK (${(result.sizeBytes / 1024).toFixed(1)} KB)`);
        setPendingChanges({});
      } else {
        setError(result.error || 'Erreur sauvegarde');
      }
    } catch (err) {
      setError('Erreur reseau: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Helpers ───────────────────────────────────────────
  const updatePlayerField = useCallback((path, value) => {
    setPlayerData(prev => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let obj = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!obj[parts[i]]) obj[parts[i]] = {};
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = value;
      return copy;
    });
    setPendingChanges(prev => ({ ...prev, [path]: true }));
  }, []);

  // Safer field updater
  const setField = (path, value) => {
    setPlayerData(prev => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let obj = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!obj[parts[i]]) obj[parts[i]] = {};
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = value;
      return copy;
    });
    setPendingChanges(prev => ({ ...prev, [path]: true }));
  };

  const getField = (path) => {
    if (!playerData) return undefined;
    const parts = path.split('.');
    let obj = playerData;
    for (const p of parts) {
      if (obj == null) return undefined;
      obj = obj[p];
    }
    return obj;
  };

  const hasPending = Object.keys(pendingChanges).length > 0;

  // ─── Auth guard ────────────────────────────────────────
  const user = getAuthUser();
  if (!isLoggedIn() || !user || user.username.toLowerCase() !== 'kly') return null;

  const displayUsers = searchQuery ? searchResults : allUsers;

  // ─── RENDER ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      <div className="flex h-screen">

        {/* ═══ LEFT SIDEBAR — User List ═══ */}
        <div className="w-80 border-r border-white/10 flex flex-col bg-[#0a0a15]">
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500 flex items-center gap-2">
              <Shield size={20} />
              Admin Panel
            </h1>
            <p className="text-gray-500 text-xs mt-1">{totalUsers} joueurs inscrits</p>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Rechercher un joueur..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto">
            {displayUsers.map(u => (
              <button
                key={u.id}
                onClick={() => loadPlayer(u.username)}
                className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${
                  selectedUser?.username === u.username ? 'bg-purple-500/10 border-l-2 border-l-purple-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{u.username}</span>
                  <span className="text-[10px] text-gray-600">
                    {(u.totalStorage / 1024).toFixed(0)} KB
                  </span>
                </div>
                {u.displayName && u.displayName !== u.username && (
                  <div className="text-xs text-gray-500">{u.displayName}</div>
                )}
              </button>
            ))}
            {displayUsers.length === 0 && !searchLoading && (
              <div className="p-4 text-center text-gray-600 text-sm">
                {searchQuery ? 'Aucun resultat' : 'Chargement...'}
              </div>
            )}
          </div>
        </div>

        {/* ═══ MAIN CONTENT ═══ */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Top bar */}
          {selectedUser && (
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#0a0a15]">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => { setSelectedUser(null); setPlayerData(null); }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h2 className="text-lg font-bold">{selectedUser.username}</h2>
                  <p className="text-xs text-gray-500">
                    Device: {selectedUser.deviceId?.slice(0, 20)}... | Inscrit: {new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {saveMsg && (
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <Check size={14} /> {saveMsg}
                  </span>
                )}
                {error && (
                  <span className="text-xs text-red-400 flex items-center gap-1">
                    <AlertTriangle size={14} /> {error}
                  </span>
                )}
                <button
                  onClick={() => loadPlayer(selectedUser.username)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                  title="Recharger"
                >
                  <RefreshCw size={16} />
                </button>
                <button
                  onClick={saveChanges}
                  disabled={saving || !hasPending}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    hasPending
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                      : 'bg-white/5 text-gray-600'
                  }`}
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Sauvegarder{hasPending ? ` (${Object.keys(pendingChanges).length})` : ''}
                </button>
              </div>
            </div>
          )}

          {/* Tabs */}
          {(selectedUser && playerData || activeTab === 'diagnostics' || activeTab === 'anticheat') && (
            <div className="flex gap-1 px-6 pt-3 border-b border-white/10 bg-[#0a0a15] overflow-x-auto">
              {TABS.filter(tab => tab.id === 'diagnostics' || tab.id === 'anticheat' || (selectedUser && playerData)).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white/10 text-white border-b-2 border-purple-500'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {activeTab === 'diagnostics' && (
              <DiagnosticsTab allUsers={allUsers} />
            )}

            {activeTab === 'anticheat' && (
              <AntiCheatTab />
            )}

            {!selectedUser && !loading && activeTab !== 'diagnostics' && activeTab !== 'anticheat' && (
              <div className="flex items-center justify-center h-64 text-gray-600">
                <div className="text-center">
                  <Shield size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Selectionne un joueur pour gerer ses donnees</p>
                </div>
              </div>
            )}

            {selectedUser && !playerData && !loading && (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <p>Aucune donnee Shadow Colosseum pour ce joueur</p>
              </div>
            )}

            {selectedUser && playerData && !loading && activeTab !== 'diagnostics' && activeTab !== 'anticheat' && (
              <>
                {activeTab === 'overview' && <OverviewTab data={playerData} raidData={raidData} />}
                {activeTab === 'hunters' && <HuntersTab data={playerData} setField={setField} />}
                {activeTab === 'weapons' && <WeaponsTab data={playerData} setField={setField} />}
                {activeTab === 'account' && <AccountTab data={playerData} setField={setField} />}
                {activeTab === 'inventory' && <InventoryTab data={playerData} setField={setField} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB: Anti-Cheat Monitoring
// ═══════════════════════════════════════════════════════════

function AntiCheatTab() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // username being acted on
  const [actionMsg, setActionMsg] = useState(null);
  const [suspendDialog, setSuspendDialog] = useState(null); // { username } or null
  const [suspendReason, setSuspendReason] = useState('');
  const [resetLoading, setResetLoading] = useState(null); // username being reset

  const fetchMonitor = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${API}?action=cheat-monitor`, { headers: authHeaders() });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (data.success) {
        setPlayers(data.players);
      } else {
        throw new Error(data.error || 'Erreur serveur');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMonitor(); }, []);

  const handleUnsuspend = async (username) => {
    setActionLoading(username);
    setActionMsg(null);
    try {
      const resp = await fetch(`${API}?action=unsuspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ username }),
      });
      const data = await resp.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: `${username} desuspendu (ancien score: ${data.previousScore})` });
        fetchMonitor();
      } else {
        setActionMsg({ type: 'error', text: data.error || 'Erreur' });
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async () => {
    if (!suspendDialog) return;
    setActionLoading(suspendDialog.username);
    setActionMsg(null);
    try {
      const resp = await fetch(`${API}?action=manual-suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ username: suspendDialog.username, reason: suspendReason || undefined }),
      });
      const data = await resp.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: `${suspendDialog.username} suspendu` });
        setSuspendDialog(null);
        setSuspendReason('');
        fetchMonitor();
      } else {
        setActionMsg({ type: 'error', text: data.error || 'Erreur' });
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetScore = async (username) => {
    setResetLoading(username);
    setActionMsg(null);
    try {
      const resp = await fetch(`${API}?action=reset-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ username }),
      });
      const data = await resp.json();
      if (data.success) {
        setActionMsg({ type: 'success', text: `Score de ${username} remis a zero (ancien: ${data.previousScore})` });
        fetchMonitor();
      } else {
        setActionMsg({ type: 'error', text: data.error || 'Erreur' });
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message });
    } finally {
      setResetLoading(null);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#ef4444';
    if (score >= 30) return '#f59e0b';
    if (score > 0) return '#a855f7';
    return '#6b7280';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'rgba(239,68,68,0.1)';
    if (score >= 30) return 'rgba(245,158,11,0.1)';
    if (score > 0) return 'rgba(168,85,247,0.1)';
    return 'rgba(107,114,128,0.05)';
  };

  if (loading && players.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const suspended = players.filter(p => p.suspended);
  const flagged = players.filter(p => !p.suspended && p.cheatScore > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500 flex items-center gap-2">
            <ShieldAlert size={20} />
            Anti-Cheat Monitoring
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {suspended.length} suspendu{suspended.length > 1 ? 's' : ''} | {flagged.length} sous surveillance
          </p>
        </div>
        <button
          onClick={fetchMonitor}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Rafraichir
        </button>
      </div>

      {/* Action message */}
      {actionMsg && (
        <div className={`px-4 py-3 rounded-lg text-sm flex items-center gap-2 ${
          actionMsg.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {actionMsg.type === 'success' ? <ShieldCheck size={16} /> : <AlertTriangle size={16} />}
          {actionMsg.text}
          <button onClick={() => setActionMsg(null)} className="ml-auto text-gray-500 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-lg text-sm bg-red-500/10 text-red-400 border border-red-500/20">
          {error}
        </div>
      )}

      {/* ─── Suspended Accounts ─────────────────────── */}
      <div className="bg-white/5 rounded-lg p-4 border border-red-500/20">
        <h3 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
          <Ban size={16} />
          Comptes Suspendus ({suspended.length})
        </h3>
        {suspended.length === 0 ? (
          <p className="text-gray-600 text-xs">Aucun compte suspendu</p>
        ) : (
          <div className="space-y-2">
            {suspended.map(p => (
              <div key={p.username} className="flex items-center justify-between py-3 px-4 rounded-lg bg-red-500/5 border border-red-500/10">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{p.displayName || p.username}</span>
                    {p.displayName && p.displayName !== p.username && (
                      <span className="text-xs text-gray-500">({p.username})</span>
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                      SUSPENDU
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                    <span>Score: <span className="text-red-400 font-bold">{p.cheatScore}</span></span>
                    {p.suspendedAt && <span>Depuis: {new Date(p.suspendedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
                  </div>
                  {p.reason && (
                    <div className="text-xs text-orange-400/80 mt-1 font-mono bg-white/5 px-2 py-1 rounded">
                      {p.reason}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleUnsuspend(p.username)}
                  disabled={actionLoading === p.username}
                  className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-lg text-sm font-semibold transition-colors ml-3"
                >
                  {actionLoading === p.username ? (
                    <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShieldCheck size={14} />
                  )}
                  Desuspendre
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Flagged Accounts (not suspended, score > 0) ── */}
      <div className="bg-white/5 rounded-lg p-4 border border-amber-500/20">
        <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
          <Eye size={16} />
          Sous Surveillance ({flagged.length})
        </h3>
        {flagged.length === 0 ? (
          <p className="text-gray-600 text-xs">Aucun joueur sous surveillance</p>
        ) : (
          <div className="space-y-2">
            {flagged.map(p => (
              <div key={p.username} className="flex items-center justify-between py-3 px-4 rounded-lg" style={{ background: getScoreBg(p.cheatScore), border: `1px solid ${getScoreColor(p.cheatScore)}22` }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{p.displayName || p.username}</span>
                    {p.displayName && p.displayName !== p.username && (
                      <span className="text-xs text-gray-500">({p.username})</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                    <span>Score: <span className="font-bold" style={{ color: getScoreColor(p.cheatScore) }}>{p.cheatScore}</span>/80</span>
                    {p.reason && <span className="text-gray-600">{p.reason}</span>}
                    {p.lastActivity && <span>Derniere activite: {new Date(p.lastActivity).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>}
                  </div>
                  {/* Score bar */}
                  <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden w-48">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (p.cheatScore / 80) * 100)}%`,
                        background: `linear-gradient(90deg, ${getScoreColor(p.cheatScore)}80, ${getScoreColor(p.cheatScore)})`,
                      }}
                    />
                  </div>
                </div>
                <div className="flex gap-2 ml-3">
                  <button
                    onClick={() => handleResetScore(p.username)}
                    disabled={resetLoading === p.username}
                    className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 rounded-lg text-sm font-semibold transition-colors"
                  >
                    {resetLoading === p.username ? (
                      <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ShieldCheck size={14} />
                    )}
                    Reset
                  </button>
                  <button
                    onClick={() => setSuspendDialog({ username: p.username })}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <Ban size={14} />
                    Suspendre
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Score Legend */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/5">
        <h3 className="text-sm font-bold text-gray-400 mb-3">Legende des Scores</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: '#a855f7' }} />
            <span className="text-gray-400">1-29 : Suspect leger</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }} />
            <span className="text-gray-400">30-79 : Beru averti le joueur</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
            <span className="text-gray-400">80+ : Alerte admin (Discord)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-600" />
            <span className="text-gray-400">0 : Aucun flag</span>
          </div>
        </div>
      </div>

      {/* ─── Manual Suspend Dialog ──────────────────── */}
      {suspendDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a2e] rounded-xl border border-red-500/30 p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
              <Ban size={20} />
              Suspendre {suspendDialog.username} ?
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Le joueur sera immediatement bloque. Il verra le message de suspension de Beru.
            </p>
            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-1 block">Raison (optionnelle)</label>
              <input
                type="text"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Triche confirmee, comportement suspect..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setSuspendDialog(null); setSuspendReason(''); }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg text-sm transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSuspend}
                disabled={actionLoading === suspendDialog.username}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-colors"
              >
                {actionLoading === suspendDialog.username ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Ban size={14} />
                )}
                Confirmer la Suspension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB: Diagnostics (Server)
// ═══════════════════════════════════════════════════════════

function DiagnosticsTab({ allUsers }) {
  const [diag, setDiag] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchDiag = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch('/api/storage/diagnostics', { headers: authHeaders() });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      setDiag(data);
      setLastFetch(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => { fetchDiag(); }, []);

  // Build device_id → username map
  const deviceToUser = {};
  for (const u of allUsers) {
    if (u.deviceId) deviceToUser[u.deviceId] = u.username;
  }
  // Also try partial match (diagnostics may have full device_id)
  const resolveUser = (deviceId) => {
    if (deviceToUser[deviceId]) return deviceToUser[deviceId];
    // Try matching prefix
    for (const [did, uname] of Object.entries(deviceToUser)) {
      if (deviceId?.startsWith(did?.slice(0, 16)) || did?.startsWith(deviceId?.slice(0, 16))) {
        return uname;
      }
    }
    return null;
  };

  if (loading && !diag) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !diag) {
    return (
      <div className="text-center py-12">
        <AlertTriangle size={32} className="mx-auto mb-3 text-red-400" />
        <p className="text-red-400 mb-3">{error}</p>
        <button onClick={fetchDiag} className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm font-semibold transition-colors">
          Reessayer
        </button>
      </div>
    );
  }

  if (!diag) return null;

  return (
    <div className="space-y-6">
      {/* Header + Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Diagnostics Serveur
          </h2>
          {lastFetch && (
            <p className="text-xs text-gray-500 mt-1">
              Mis a jour : {lastFetch.toLocaleTimeString('fr-FR')}
            </p>
          )}
        </div>
        <button
          onClick={fetchDiag}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Rafraichir
        </button>
      </div>

      {/* ─── DB Size ───────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/5 rounded-lg p-4 border border-white/5">
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">Taille BDD</div>
          <div className="text-xl font-bold text-cyan-400">{diag.dbSize?.db_size || '?'}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/5">
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">Devices uniques</div>
          <div className="text-xl font-bold text-purple-400">{diag.uniqueDevices || 0}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/5">
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">Joueurs NEW (v2)</div>
          <div className="text-xl font-bold text-green-400">
            {diag.versionSummary?.filter(v => v.status?.includes('NEW')).reduce((s, v) => s + parseInt(v.player_count), 0) || 0}
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/5">
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">Joueurs OLD</div>
          <div className="text-xl font-bold text-red-400">
            {diag.versionSummary?.filter(v => v.status?.includes('OLD')).reduce((s, v) => s + parseInt(v.player_count), 0) || 0}
          </div>
        </div>
      </div>

      {/* ─── Version Tracking per Player ─────────── */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/5">
        <h3 className="text-sm font-bold text-amber-400 mb-3">Version Code par Joueur</h3>
        <div className="space-y-1.5">
          {diag.clientVersions?.map((cv, i) => {
            const username = resolveUser(cv.device_id);
            const isNew = cv.client_version >= 2;
            return (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: isNew ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)' }}>
                <div className="flex items-center gap-3">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: isNew ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                      color: isNew ? '#22c55e' : '#ef4444',
                      border: `1px solid ${isNew ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    }}
                  >
                    {isNew ? 'NEW' : 'OLD'}
                  </span>
                  <span className="text-sm font-medium text-white">
                    {username || cv.device_id?.slice(0, 16) + '...'}
                  </span>
                  {!username && (
                    <span className="text-[10px] text-gray-600">(pas inscrit)</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{cv.size_pretty}</span>
                  <span>{cv.updated_at ? new Date(cv.updated_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                </div>
              </div>
            );
          })}
          {(!diag.clientVersions || diag.clientVersions.length === 0) && (
            <p className="text-gray-600 text-xs">Aucune donnee de version</p>
          )}
        </div>
      </div>

      {/* ─── Storage par Cle ──────────────────────── */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/5">
        <h3 className="text-sm font-bold text-blue-400 mb-3">Stockage par Cle</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] text-gray-500 uppercase border-b border-white/10">
                <th className="pb-2 pr-4">Cle</th>
                <th className="pb-2 pr-4">Joueurs</th>
                <th className="pb-2 pr-4">Total</th>
                <th className="pb-2 pr-4">Moyenne</th>
                <th className="pb-2">Max</th>
              </tr>
            </thead>
            <tbody>
              {diag.keyBreakdown?.map((kb, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="py-2 pr-4 font-medium text-gray-300">{kb.storage_key}</td>
                  <td className="py-2 pr-4 text-gray-400">{kb.user_count}</td>
                  <td className="py-2 pr-4 text-cyan-400 font-medium">{kb.total_text_size}</td>
                  <td className="py-2 pr-4 text-gray-400">{kb.avg_per_user}</td>
                  <td className="py-2 text-amber-400 font-medium">{kb.max_per_user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Table Sizes ─────────────────────────── */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/5">
        <h3 className="text-sm font-bold text-purple-400 mb-3">Taille des Tables</h3>
        <div className="space-y-2">
          {diag.tableSizes?.map((ts, i) => {
            const pct = diag.dbSize?.db_bytes ? (ts.total_bytes / diag.dbSize.db_bytes * 100) : 0;
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="w-40 text-sm text-gray-300 font-medium truncate">{ts.table_name}</span>
                <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.max(pct, 1)}%`, background: 'linear-gradient(90deg, #a855f7, #6366f1)' }}
                  />
                </div>
                <span className="text-sm text-white font-medium w-24 text-right">{ts.total_size}</span>
                <span className="text-xs text-gray-500 w-20 text-right">
                  {ts.live_rows} rows
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Bloat Estimate ──────────────────────── */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/5">
        <h3 className="text-sm font-bold text-red-400 mb-3">Bloat (Dead Tuples)</h3>
        <p className="text-xs text-gray-500 mb-3">
          Dead tuples = copies mortes MVCC. Si dead_pct est eleve, lancer VACUUM FULL.
        </p>
        <div className="space-y-1.5">
          {diag.bloatEstimate?.filter(b => parseInt(b.dead_tuples) > 0).map((b, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/5">
              <span className="text-sm text-gray-300">{b.relname}</span>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-green-400">{b.live_tuples} live</span>
                <span className="text-red-400">{b.dead_tuples} dead</span>
                <span
                  className="font-bold px-2 py-0.5 rounded"
                  style={{
                    color: parseFloat(b.dead_pct) > 50 ? '#ef4444' : parseFloat(b.dead_pct) > 20 ? '#f59e0b' : '#22c55e',
                    background: parseFloat(b.dead_pct) > 50 ? 'rgba(239,68,68,0.1)' : parseFloat(b.dead_pct) > 20 ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)',
                  }}
                >
                  {b.dead_pct}%
                </span>
              </div>
            </div>
          ))}
          {diag.bloatEstimate?.filter(b => parseInt(b.dead_tuples) > 0).length === 0 && (
            <p className="text-green-400 text-xs">Aucun bloat detecte</p>
          )}
        </div>
      </div>

      {/* ─── Biggest Entries ─────────────────────── */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/5">
        <h3 className="text-sm font-bold text-orange-400 mb-3">Top 10 Plus Grosses Entrees</h3>
        <div className="space-y-1.5">
          {diag.biggestEntries?.map((be, i) => {
            const username = resolveUser(be.device_id);
            return (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-5 text-right">{i + 1}.</span>
                  <span className="text-sm font-medium text-white">{username || be.device_id?.slice(0, 16) + '...'}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400">{be.storage_key}</span>
                </div>
                <span className="text-sm font-bold text-orange-400">{be.size_pretty}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── TOAST Size ──────────────────────────── */}
      {diag.toastSize?.length > 0 && (
        <div className="bg-white/5 rounded-lg p-4 border border-white/5">
          <h3 className="text-sm font-bold text-gray-400 mb-3">TOAST (JSONB Large Values)</h3>
          <div className="space-y-1.5">
            {diag.toastSize.map((ts, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/5">
                <span className="text-sm text-gray-300">{ts.table_name}</span>
                <span className="text-sm text-gray-400">{ts.toast_size}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB: Overview
// ═══════════════════════════════════════════════════════════

function OverviewTab({ data, raidData }) {
  const hunterCount = data.chibiLevels ? Object.keys(data.chibiLevels).length : 0;
  const maxLevel = data.chibiLevels
    ? Math.max(0, ...Object.values(data.chibiLevels).map(h => h.level || 0))
    : 0;
  const weaponCount = data.weaponCollection ? Object.keys(data.weaponCollection).length : 0;
  const artifactCount = data.artifactInventory ? data.artifactInventory.length : 0;
  const accountXp = data.accountXp || 0;

  // Compute account level
  let accountLevel = 1;
  let xpNeeded = 100;
  let xpConsumed = 0;
  while (xpConsumed + xpNeeded <= accountXp) {
    xpConsumed += xpNeeded;
    accountLevel++;
    xpNeeded = Math.floor(100 * Math.pow(1.15, accountLevel - 1));
  }

  const stats = [
    { label: 'Niveau Compte', value: accountLevel, color: 'text-purple-400' },
    { label: 'XP Compte', value: accountXp.toLocaleString(), color: 'text-purple-300' },
    { label: 'Hunters', value: hunterCount, color: 'text-cyan-400' },
    { label: 'Niveau max hunter', value: maxLevel, color: 'text-cyan-300' },
    { label: 'Armes', value: weaponCount, color: 'text-amber-400' },
    { label: 'Artefacts inventaire', value: artifactCount, color: 'text-orange-400' },
    { label: 'Combats', value: data.stats?.battles || 0, color: 'text-gray-300' },
    { label: 'Victoires', value: data.stats?.wins || 0, color: 'text-green-400' },
    { label: 'ARC II debloque', value: data.arc2Unlocked ? 'Oui' : 'Non', color: data.arc2Unlocked ? 'text-green-400' : 'text-red-400' },
    { label: 'Grimoire Weiss', value: data.grimoireWeiss ? 'Oui' : 'Non', color: data.grimoireWeiss ? 'text-green-400' : 'text-red-400' },
  ];

  const hammers = data.hammers || {};
  const fragments = data.fragments || {};

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-white/5 rounded-lg p-3 border border-white/5">
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">{s.label}</div>
            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Hammers & Fragments */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-lg p-4 border border-white/5">
          <h3 className="text-sm font-bold text-blue-400 mb-3">Marteaux</h3>
          <div className="space-y-2">
            {Object.entries(hammers).map(([id, count]) => (
              <div key={id} className="flex justify-between text-sm">
                <span className="text-gray-400">{id.replace('marteau_', '')}</span>
                <span className="text-white font-bold">{count}</span>
              </div>
            ))}
            {Object.keys(hammers).length === 0 && <p className="text-gray-600 text-xs">Aucun marteau</p>}
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-4 border border-white/5">
          <h3 className="text-sm font-bold text-orange-400 mb-3">Fragments</h3>
          <div className="space-y-2">
            {Object.entries(fragments).map(([id, count]) => (
              <div key={id} className="flex justify-between text-sm">
                <span className="text-gray-400">{id.replace('fragment_', '')}</span>
                <span className="text-white font-bold">{count}</span>
              </div>
            ))}
            {Object.keys(fragments).length === 0 && <p className="text-gray-600 text-xs">Aucun fragment</p>}
          </div>
        </div>
      </div>

      {/* Data Size */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/5">
        <h3 className="text-sm font-bold text-gray-400 mb-2">Taille donnees</h3>
        <p className="text-xs text-gray-500">
          shadow_colosseum_data: {(JSON.stringify(data).length / 1024).toFixed(1)} KB
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB: Hunters
// ═══════════════════════════════════════════════════════════

function HuntersTab({ data, setField }) {
  const [addHunterId, setAddHunterId] = useState('');
  const [addHunterLevel, setAddHunterLevel] = useState(1);
  const [addHunterStars, setAddHunterStars] = useState(0);

  const chibiLevels = data.chibiLevels || {};
  const ownedHunters = Object.keys(chibiLevels);

  const addHunter = () => {
    if (!addHunterId) return;
    const levels = { ...data.chibiLevels };
    const stats = { ...(data.statPoints || {}) };

    if (!levels[addHunterId]) {
      levels[addHunterId] = { level: addHunterLevel, xp: 0, stars: addHunterStars };
    } else {
      levels[addHunterId] = { ...levels[addHunterId], level: addHunterLevel, stars: (levels[addHunterId].stars || 0) + addHunterStars };
    }

    if (!stats[addHunterId]) {
      stats[addHunterId] = { hp: 0, atk: 0, def: 0, spd: 0, crit: 0, res: 0, mana: 0 };
    }

    setField('chibiLevels', levels);
    setField('statPoints', stats);
    setAddHunterId('');
    setAddHunterLevel(1);
    setAddHunterStars(0);
  };

  const removeHunter = (hunterId) => {
    const levels = { ...data.chibiLevels };
    delete levels[hunterId];
    setField('chibiLevels', levels);
  };

  const updateHunterField = (hunterId, field, value) => {
    const levels = { ...data.chibiLevels };
    if (!levels[hunterId]) return;
    levels[hunterId] = { ...levels[hunterId], [field]: value };
    setField('chibiLevels', levels);
  };

  return (
    <div className="space-y-6">
      {/* Add Hunter */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h3 className="text-sm font-bold text-cyan-400 mb-3">Ajouter / Modifier un Hunter</h3>
        <div className="flex gap-2 flex-wrap">
          <select
            value={addHunterId}
            onChange={(e) => setAddHunterId(e.target.value)}
            className="flex-1 min-w-[200px] bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            style={{ colorScheme: 'dark' }}
          >
            <option value="">Selectionner un hunter</option>
            {Object.entries(HUNTERS).map(([id, h]) => (
              <option key={id} value={id}>
                {h.name} ({h.element} - {h.rarity}) {chibiLevels[id] ? '[POSSEDE]' : ''}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1 bg-white/10 border border-white/20 rounded-lg px-2">
            <span className="text-xs text-gray-500">Lv</span>
            <input
              type="number"
              value={addHunterLevel}
              onChange={(e) => setAddHunterLevel(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              max={999}
              className="w-16 bg-transparent text-center text-white text-sm focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1 bg-white/10 border border-white/20 rounded-lg px-2">
            <span className="text-xs text-yellow-400">A</span>
            <input
              type="number"
              value={addHunterStars}
              onChange={(e) => setAddHunterStars(Math.max(0, parseInt(e.target.value) || 0))}
              min={0}
              className="w-16 bg-transparent text-center text-white text-sm focus:outline-none"
            />
          </div>
          <button
            onClick={addHunter}
            disabled={!addHunterId}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-700 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            Ajouter
          </button>
        </div>
      </div>

      {/* Owned Hunters */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-gray-300">
          Hunters possedes ({ownedHunters.length})
        </h3>
        {ownedHunters.length === 0 && (
          <p className="text-gray-600 text-sm">Aucun hunter</p>
        )}
        <div className="grid gap-2">
          {ownedHunters.map(id => {
            const h = HUNTERS[id];
            const info = chibiLevels[id] || {};
            return (
              <div key={id} className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{h?.name || id}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400">
                      {h?.element || '?'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500">Lv</label>
                  <input
                    type="number"
                    value={info.level || 1}
                    onChange={(e) => updateHunterField(id, 'level', Math.max(1, parseInt(e.target.value) || 1))}
                    min={1}
                    className="w-16 bg-white/10 border border-white/10 rounded px-2 py-1 text-center text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                  <label className="text-xs text-yellow-400">A</label>
                  <input
                    type="number"
                    value={info.stars || 0}
                    onChange={(e) => updateHunterField(id, 'stars', Math.max(0, parseInt(e.target.value) || 0))}
                    min={0}
                    className="w-16 bg-white/10 border border-white/10 rounded px-2 py-1 text-center text-sm text-white focus:outline-none focus:border-yellow-500"
                  />
                  <button
                    onClick={() => removeHunter(id)}
                    className="p-1.5 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-colors"
                    title="Supprimer"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB: Weapons
// ═══════════════════════════════════════════════════════════

function WeaponsTab({ data, setField }) {
  const [addWeaponId, setAddWeaponId] = useState('');
  const [addWeaponQty, setAddWeaponQty] = useState(1);

  const collection = data.weaponCollection || {};

  const addWeapon = () => {
    if (!addWeaponId) return;
    const coll = { ...collection };
    coll[addWeaponId] = (coll[addWeaponId] || 0) + addWeaponQty;
    setField('weaponCollection', coll);
    setAddWeaponId('');
    setAddWeaponQty(1);
  };

  const setWeaponCount = (weaponId, count) => {
    const coll = { ...collection };
    if (count <= 0) {
      delete coll[weaponId];
    } else {
      coll[weaponId] = count;
    }
    setField('weaponCollection', coll);
  };

  return (
    <div className="space-y-6">
      {/* Add Weapon */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h3 className="text-sm font-bold text-amber-400 mb-3">Ajouter une arme</h3>
        <div className="flex gap-2 flex-wrap">
          <select
            value={addWeaponId}
            onChange={(e) => setAddWeaponId(e.target.value)}
            className="flex-1 min-w-[200px] bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            style={{ colorScheme: 'dark' }}
          >
            <option value="">Selectionner une arme</option>
            {Object.entries(WEAPONS).map(([id, w]) => (
              <option key={id} value={id}>
                {w.name} ({w.rarity} - {w.element}) {collection[id] ? `[x${collection[id]}]` : ''}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1 bg-white/10 border border-white/20 rounded-lg px-2">
            <span className="text-xs text-gray-500">Qte</span>
            <input
              type="number"
              value={addWeaponQty}
              onChange={(e) => setAddWeaponQty(Math.max(1, parseInt(e.target.value) || 1))}
              min={1}
              className="w-16 bg-transparent text-center text-white text-sm focus:outline-none"
            />
          </div>
          <button
            onClick={addWeapon}
            disabled={!addWeaponId}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-700 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            Ajouter
          </button>
        </div>
      </div>

      {/* Collection */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-gray-300">
          Collection ({Object.keys(collection).length} armes)
        </h3>
        {Object.keys(collection).length === 0 && (
          <p className="text-gray-600 text-sm">Aucune arme</p>
        )}
        <div className="grid gap-2">
          {Object.entries(collection).map(([id, count]) => {
            const w = WEAPONS[id];
            return (
              <div key={id} className="flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/5">
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm">{w?.name || id}</span>
                  {w && (
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400">
                      {w.rarity} | {w.element}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={count}
                    onChange={(e) => setWeaponCount(id, parseInt(e.target.value) || 0)}
                    min={0}
                    className="w-16 bg-white/10 border border-white/10 rounded px-2 py-1 text-center text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={() => setWeaponCount(id, 0)}
                    className="p-1.5 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-colors"
                    title="Supprimer"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB: Account
// ═══════════════════════════════════════════════════════════

function AccountTab({ data, setField }) {
  const NumberField = ({ label, path, min = 0 }) => (
    <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/5">
      <label className="text-sm text-gray-300">{label}</label>
      <input
        type="number"
        value={data[path] ?? 0}
        onChange={(e) => setField(path, Math.max(min, parseInt(e.target.value) || 0))}
        min={min}
        className="w-28 bg-white/10 border border-white/10 rounded px-3 py-1.5 text-center text-sm text-white focus:outline-none focus:border-purple-500"
      />
    </div>
  );

  const BoolField = ({ label, path }) => (
    <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/5">
      <label className="text-sm text-gray-300">{label}</label>
      <button
        onClick={() => setField(path, !data[path])}
        className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${
          data[path]
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}
      >
        {data[path] ? 'OUI' : 'NON'}
      </button>
    </div>
  );

  const HammerField = ({ id, label }) => (
    <div className="flex items-center justify-between">
      <label className="text-sm text-gray-400">{label}</label>
      <input
        type="number"
        value={data.hammers?.[id] ?? 0}
        onChange={(e) => {
          const hammers = { ...(data.hammers || {}) };
          hammers[id] = Math.max(0, parseInt(e.target.value) || 0);
          setField('hammers', hammers);
        }}
        min={0}
        className="w-20 bg-white/10 border border-white/10 rounded px-2 py-1 text-center text-sm text-white focus:outline-none focus:border-blue-500"
      />
    </div>
  );

  const FragmentField = ({ id, label }) => (
    <div className="flex items-center justify-between">
      <label className="text-sm text-gray-400">{label}</label>
      <input
        type="number"
        value={data.fragments?.[id] ?? 0}
        onChange={(e) => {
          const fragments = { ...(data.fragments || {}) };
          fragments[id] = Math.max(0, parseInt(e.target.value) || 0);
          setField('fragments', fragments);
        }}
        min={0}
        className="w-20 bg-white/10 border border-white/10 rounded px-2 py-1 text-center text-sm text-white focus:outline-none focus:border-orange-500"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Account Level */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-purple-400">Progression du compte</h3>
        <NumberField label="XP du compte" path="accountXp" />
        <NumberField label="Allocations bonus" path="accountAllocations" />
      </div>

      {/* Toggles */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-green-400">Deverrouillages</h3>
        <BoolField label="ARC II debloque" path="arc2Unlocked" />
        <BoolField label="Grimoire Weiss" path="grimoireWeiss" />
      </div>

      {/* Stats */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-gray-300">Statistiques de combat</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/5">
            <label className="text-sm text-gray-400">Combats</label>
            <input
              type="number"
              value={data.stats?.battles ?? 0}
              onChange={(e) => setField('stats', { ...(data.stats || {}), battles: parseInt(e.target.value) || 0 })}
              min={0}
              className="w-20 bg-white/10 border border-white/10 rounded px-2 py-1 text-center text-sm text-white focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/5">
            <label className="text-sm text-gray-400">Victoires</label>
            <input
              type="number"
              value={data.stats?.wins ?? 0}
              onChange={(e) => setField('stats', { ...(data.stats || {}), wins: parseInt(e.target.value) || 0 })}
              min={0}
              className="w-20 bg-white/10 border border-white/10 rounded px-2 py-1 text-center text-sm text-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Hammers */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-blue-400">Marteaux</h3>
        <div className="bg-white/5 rounded-lg p-4 border border-white/5 space-y-3">
          <HammerField id="marteau_forge" label="Marteau de Forge" />
          <HammerField id="marteau_runique" label="Marteau Runique" />
          <HammerField id="marteau_celeste" label="Marteau Celeste" />
          <HammerField id="marteau_rouge" label="Marteau Rouge" />
        </div>
      </div>

      {/* Fragments */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-orange-400">Fragments</h3>
        <div className="bg-white/5 rounded-lg p-4 border border-white/5 space-y-3">
          <FragmentField id="fragment_sulfuras" label="Fragment de Sulfuras" />
          <FragmentField id="fragment_raeshalare" label="Fragment de Rae'shalare" />
          <FragmentField id="fragment_katana_z" label="Fragment de Katana Z" />
          <FragmentField id="fragment_katana_v" label="Fragment de Katana V" />
          <FragmentField id="fragment_guldan" label="Fragment de Gul'dan" />
        </div>
      </div>

      {/* Account Bonuses */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-purple-300">Bonus de compte</h3>
        <div className="bg-white/5 rounded-lg p-4 border border-white/5">
          <div className="grid grid-cols-3 gap-3">
            {['hp', 'atk', 'def', 'spd', 'crit', 'res'].map(stat => (
              <div key={stat} className="flex items-center justify-between">
                <label className="text-sm text-gray-400 uppercase">{stat}</label>
                <input
                  type="number"
                  value={data.accountBonuses?.[stat] ?? 0}
                  onChange={(e) => {
                    const bonuses = { ...(data.accountBonuses || {}) };
                    bonuses[stat] = Math.max(0, parseInt(e.target.value) || 0);
                    setField('accountBonuses', bonuses);
                  }}
                  min={0}
                  className="w-16 bg-white/10 border border-white/10 rounded px-2 py-1 text-center text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TAB: Inventory
// ═══════════════════════════════════════════════════════════

function InventoryTab({ data, setField }) {
  const inventory = data.artifactInventory || [];
  const equipped = data.artifacts || {};

  const clearInventory = () => {
    if (confirm(`Supprimer les ${inventory.length} artefacts de l'inventaire ?`)) {
      setField('artifactInventory', []);
    }
  };

  const clearUnlocked = () => {
    const locked = inventory.filter(a => a.locked || a.highlighted);
    if (confirm(`Supprimer ${inventory.length - locked.length} artefacts non-verrouilles ? (${locked.length} verrouilles gardes)`)) {
      setField('artifactInventory', locked);
    }
  };

  // Count by rarity
  const rarityCount = {};
  for (const art of inventory) {
    const r = art.rarity || 'unknown';
    rarityCount[r] = (rarityCount[r] || 0) + 1;
  }

  const equippedCount = Object.keys(equipped).reduce((acc, chibiId) => {
    return acc + Object.keys(equipped[chibiId] || {}).length;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
          <div className="text-[10px] text-gray-500 uppercase">Inventaire</div>
          <div className="text-lg font-bold text-orange-400">{inventory.length}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
          <div className="text-[10px] text-gray-500 uppercase">Equipes</div>
          <div className="text-lg font-bold text-cyan-400">{equippedCount}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
          <div className="text-[10px] text-gray-500 uppercase">Verrouilles</div>
          <div className="text-lg font-bold text-yellow-400">{inventory.filter(a => a.locked).length}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/5">
          <div className="text-[10px] text-gray-500 uppercase">Taille</div>
          <div className="text-lg font-bold text-gray-300">{(JSON.stringify(inventory).length / 1024).toFixed(1)} KB</div>
        </div>
      </div>

      {/* Rarity Breakdown */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/5">
        <h3 className="text-sm font-bold text-gray-300 mb-3">Par rarete</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(rarityCount).sort((a, b) => b[1] - a[1]).map(([rarity, count]) => (
            <div key={rarity} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <span className="text-xs text-gray-400 capitalize">{rarity}</span>
              <span className="ml-2 font-bold text-white">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={clearUnlocked}
          className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg text-sm font-semibold transition-colors border border-amber-500/30"
        >
          Nettoyer non-verrouilles ({inventory.length - inventory.filter(a => a.locked || a.highlighted).length})
        </button>
        <button
          onClick={clearInventory}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-semibold transition-colors border border-red-500/30"
        >
          Vider tout l'inventaire
        </button>
      </div>
    </div>
  );
}
