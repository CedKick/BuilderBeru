// PveRanking.jsx — PVE iLevel Ranking for Shadow Colosseum
// Shows top 100 players ranked by best single hunter iLevel

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { isLoggedIn, authHeaders, getAuthUser } from '../../utils/auth';
import AuthModal from '../../components/AuthModal';
import { CHIBIS, SPRITES, ELEMENTS } from './colosseumCore';
import { HUNTERS, loadRaidData, getHunterStars } from './raidData';
import {
  computeEquipILevel, computeArtifactILevel, computeWeaponILevel,
  WEAPONS, ARTIFACT_SLOTS, MAIN_STAT_VALUES, SUB_STAT_POOL,
  ALL_ARTIFACT_SETS,
} from './equipmentData';

// ─── Save keys ──────────────────────────────────────────────
const COLO_KEY = 'shadow_colosseum_data';
const PVE_LAST_SUBMIT_KEY = 'pve_last_submit';
const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

const defaultColoData = () => ({ chibiLevels: {}, statPoints: {}, skillTree: {}, talentTree: {}, respecCount: {}, cooldowns: {}, stagesCleared: [], stats: { battles: 0, wins: 0 }, artifacts: {}, artifactInventory: [], weapons: {}, weaponCollection: {}, hammers: { marteau_forge: 0, marteau_runique: 0, marteau_celeste: 0 }, accountXp: 0, accountBonuses: { hp: 0, atk: 0, def: 0, spd: 0, crit: 0, res: 0 }, accountAllocations: 0 });
const loadColoData = () => { try { return { ...defaultColoData(), ...JSON.parse(localStorage.getItem(COLO_KEY)) }; } catch { return defaultColoData(); } };

const ELEMENT_COLORS = {
  shadow: 'text-purple-400', fire: 'text-red-400', wind: 'text-emerald-400',
  earth: 'text-amber-400', water: 'text-blue-400', light: 'text-yellow-300',
};
const ELEMENT_BG = {
  shadow: 'bg-purple-500/20', fire: 'bg-red-500/20', wind: 'bg-emerald-500/20',
  earth: 'bg-amber-500/20', water: 'bg-blue-500/20', light: 'bg-yellow-500/20',
};

const MEDAL = ['', '\uD83E\uDD47', '\uD83E\uDD48', '\uD83E\uDD49']; // gold, silver, bronze

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function PveRanking() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loggedIn, setLoggedIn] = useState(() => isLoggedIn());
  const [rankings, setRankings] = useState([]);
  const [total, setTotal] = useState(0);
  const [playerRank, setPlayerRank] = useState(null);
  const [myPlayerId, setMyPlayerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Listen for auth changes
  useEffect(() => {
    const handler = (e) => { if (e.detail?.type === 'auth-change') setLoggedIn(isLoggedIn()); };
    window.addEventListener('beru-react', handler);
    return () => window.removeEventListener('beru-react', handler);
  }, []);

  // ─── Compute best hunter from local data ────────────────
  const bestHunter = useMemo(() => {
    const coloData = loadColoData();
    const raidData = loadRaidData();
    const ownedIds = (raidData.hunterCollection || []).map(e => typeof e === 'string' ? e : e.id);
    // Merge chibi IDs (from colosseum levels) + hunter IDs
    const allIds = new Set([...Object.keys(coloData.chibiLevels || {}), ...ownedIds]);

    let best = null;
    let bestIlevel = 0;

    for (const id of allIds) {
      const wId = coloData.weapons?.[id] || null;
      const wAw = wId ? (coloData.weaponCollection?.[wId] || 0) : 0;
      const eq = computeEquipILevel(coloData.artifacts?.[id], wId, wAw);

      if (eq.total > bestIlevel) {
        bestIlevel = eq.total;
        const chibi = CHIBIS[id];
        const hunter = HUNTERS[id];
        const info = chibi || hunter;
        if (!info) continue;

        const level = coloData.chibiLevels?.[id] || 1;
        const weapon = wId ? WEAPONS[wId] : null;
        const artifacts = coloData.artifacts?.[id] || {};

        best = {
          id,
          name: info.name,
          element: info.element,
          emoji: chibi ? (SPRITES[id] ? '' : '\uD83D\uDC7E') : (hunter?.emoji || '\uD83D\uDC64'),
          sprite: SPRITES[id] || hunter?.sprite || null,
          ilevel: eq.total,
          level,
          weaponId: wId,
          weaponName: weapon?.name || null,
          weaponAwakening: wAw,
          weaponIlevel: wId ? computeWeaponILevel(wId, wAw) : 0,
          artifacts: Object.entries(artifacts).map(([slot, art]) => ({
            slot,
            slotName: ARTIFACT_SLOTS[slot]?.name || slot,
            set: art.set,
            setName: ALL_ARTIFACT_SETS[art.set]?.name || art.set,
            setIcon: ALL_ARTIFACT_SETS[art.set]?.icon || '',
            rarity: art.rarity,
            level: art.level || 0,
            ilevel: computeArtifactILevel(art),
            mainStat: art.mainStat,
            mainStatName: MAIN_STAT_VALUES[art.mainStat]?.name || art.mainStat,
            mainValue: art.mainValue,
            subs: (art.subs || []).map(s => ({
              id: s.id,
              name: SUB_STAT_POOL.find(sp => sp.id === s.id)?.name || s.id,
              value: s.value,
            })),
          })),
          stats: {
            hp: info.base?.hp || 0,
            atk: info.base?.atk || 0,
            def: info.base?.def || 0,
            spd: info.base?.spd || 0,
            crit: info.base?.crit || 0,
            res: info.base?.res || 0,
          },
        };
      }
    }
    return best;
  }, []);

  // ─── Fetch rankings ─────────────────────────────────────
  const fetchRankings = useCallback(async () => {
    if (!loggedIn) { setLoading(false); return; }
    try {
      const resp = await fetch('/api/pve-ranking?action=rankings', {
        headers: { ...authHeaders() },
      });
      const json = await resp.json();
      if (json.success) {
        setRankings(json.rankings || []);
        setTotal(json.total || 0);
        setPlayerRank(json.playerRank);
        setMyPlayerId(json.myPlayerId);
      }
    } catch (err) {
      console.error('PVE ranking fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [loggedIn]);

  // ─── Auto-submit best hunter ────────────────────────────
  const submitBestHunter = useCallback(async () => {
    if (!loggedIn || !bestHunter || bestHunter.ilevel <= 0) return;

    const lastSubmit = JSON.parse(localStorage.getItem(PVE_LAST_SUBMIT_KEY) || '{}');
    const timeSince = Date.now() - (lastSubmit.timestamp || 0);
    const isSame = lastSubmit.ilevel === bestHunter.ilevel && lastSubmit.hunterId === bestHunter.id;

    // Skip if same data and less than 10 min
    if (isSame && timeSince < REFRESH_INTERVAL) return;

    setSubmitting(true);
    try {
      const user = getAuthUser();
      const resp = await fetch('/api/pve-ranking?action=submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          displayName: user?.username || 'Joueur',
          hunterName: bestHunter.name,
          hunterElement: bestHunter.element,
          hunterEmoji: bestHunter.emoji,
          bestIlevel: bestHunter.ilevel,
          hunterData: {
            hunterId: bestHunter.id,
            hunterLevel: bestHunter.level,
            stats: bestHunter.stats,
            weaponId: bestHunter.weaponId,
            weaponName: bestHunter.weaponName,
            weaponAwakening: bestHunter.weaponAwakening,
            weaponIlevel: bestHunter.weaponIlevel,
            artifacts: bestHunter.artifacts,
            totalIlevel: bestHunter.ilevel,
            sprite: bestHunter.sprite,
          },
        }),
      });
      const json = await resp.json();
      if (json.success) {
        localStorage.setItem(PVE_LAST_SUBMIT_KEY, JSON.stringify({
          timestamp: Date.now(),
          ilevel: bestHunter.ilevel,
          hunterId: bestHunter.id,
        }));
        setSubmitMsg('');
      }
    } catch (err) {
      console.error('PVE submit error:', err);
    } finally {
      setSubmitting(false);
    }
  }, [loggedIn, bestHunter]);

  // ─── Init: submit + fetch + periodic refresh ────────────
  useEffect(() => {
    if (!loggedIn) return;
    // Init table
    fetch('/api/pve-ranking?action=init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
    }).catch(() => {});

    submitBestHunter().then(() => fetchRankings());

    const interval = setInterval(() => {
      submitBestHunter().then(() => fetchRankings());
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [loggedIn, submitBestHunter, fetchRankings]);

  // ─── Fetch player detail ────────────────────────────────
  const fetchPlayerDetail = async (playerId) => {
    setDetailLoading(true);
    try {
      const resp = await fetch(`/api/pve-ranking?action=player-detail&playerId=${playerId}`, {
        headers: { ...authHeaders() },
      });
      const json = await resp.json();
      if (json.success) {
        setSelectedPlayer(json.player);
      }
    } catch (err) {
      console.error('PVE detail error:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  // ─── Not logged in ─────────────────────────────────────
  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] text-white flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">{'\uD83C\uDFC6'}</div>
          <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
            Classement PVE
          </h1>
          <p className="text-gray-400 mb-6 text-sm">
            Connecte-toi pour voir le classement des meilleurs hunters par iLevel !
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold transition-all">
            Se connecter
          </button>
          <Link to="/shadow-colosseum" className="block mt-4 text-sm text-gray-500 hover:text-gray-300">
            {'\u2190'} Retour au Colosseum
          </Link>
        </div>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/shadow-colosseum" className="text-sm text-gray-500 hover:text-gray-300 mb-3 inline-block">
            {'\u2190'} Retour au Colosseum
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
            {'\uD83C\uDFC6'} Classement PVE
          </h1>
          <p className="text-gray-500 text-xs mt-1">
            Top 100 — Meilleur Hunter par iLevel
          </p>
        </div>

        {/* My best hunter card */}
        {bestHunter && (
          <div className="mb-4 p-3 rounded-xl border border-yellow-500/30 bg-gradient-to-r from-yellow-900/20 to-amber-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {bestHunter.sprite ? (
                  <img src={bestHunter.sprite} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <span className="text-xl">{bestHunter.emoji || '\uD83D\uDC64'}</span>
                )}
                <div>
                  <div className="text-sm font-bold text-yellow-300">{bestHunter.name}</div>
                  <div className="text-[10px] text-gray-400">Mon meilleur hunter</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-amber-400">{bestHunter.ilevel}</div>
                <div className="text-[10px] text-gray-500">iLevel</div>
              </div>
            </div>
            {playerRank && (
              <div className="mt-2 text-center text-xs text-gray-400">
                Mon rang : <span className="text-yellow-400 font-bold">#{playerRank}</span> / {total}
              </div>
            )}
            {submitting && (
              <div className="mt-1 text-center text-[10px] text-gray-500">Synchronisation...</div>
            )}
          </div>
        )}

        {/* Rankings list */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-xs">Chargement du classement...</p>
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-3xl mb-2">{'\uD83C\uDFDC\uFE0F'}</div>
            <p className="text-sm">Aucun joueur classe pour le moment.</p>
            <p className="text-xs mt-1">Equipe tes hunters et reviens !</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {rankings.map((r) => {
              const isMe = r.playerId === myPlayerId;
              const medal = MEDAL[r.rank] || '';
              const elemColor = ELEMENT_COLORS[r.hunterElement] || 'text-gray-400';
              const elemBg = ELEMENT_BG[r.hunterElement] || 'bg-gray-500/20';
              const elemIcon = ELEMENTS[r.hunterElement]?.icon || '';

              return (
                <motion.button
                  key={r.playerId}
                  onClick={() => fetchPlayerDetail(r.playerId)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isMe
                      ? 'border-yellow-500/50 bg-yellow-900/20 hover:bg-yellow-900/30'
                      : r.rank <= 3
                        ? 'border-amber-500/30 bg-amber-900/10 hover:bg-amber-900/20'
                        : 'border-gray-700/40 bg-gray-800/30 hover:bg-gray-800/50'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank */}
                    <div className={`w-8 text-center font-bold text-sm ${
                      r.rank === 1 ? 'text-yellow-400' : r.rank === 2 ? 'text-gray-300' : r.rank === 3 ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      {medal || `#${r.rank}`}
                    </div>

                    {/* Hunter info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${elemBg} ${elemColor}`}>
                          {elemIcon} {r.hunterName}
                        </span>
                        {isMe && <span className="text-[9px] px-1 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-bold">MOI</span>}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5 truncate">
                        {r.displayName}
                      </div>
                    </div>

                    {/* iLevel */}
                    <div className="text-right">
                      <div className={`font-bold text-sm ${r.rank <= 3 ? 'text-amber-400' : 'text-gray-300'}`}>
                        {r.bestIlevel}
                      </div>
                      <div className="text-[9px] text-gray-600">iLvl</div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Player rank outside top 100 */}
        {playerRank && playerRank > 100 && (
          <div className="mt-4 text-center p-3 rounded-xl border border-gray-700/40 bg-gray-800/30">
            <span className="text-gray-400 text-sm">
              Ton rang : <span className="text-yellow-400 font-bold">#{playerRank}</span> / {total}
            </span>
          </div>
        )}
      </div>

      {/* ─── Player Detail Modal ───────────────────────────── */}
      <AnimatePresence>
        {selectedPlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={() => setSelectedPlayer(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-purple-500/30 rounded-2xl p-5 max-w-lg w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {detailLoading ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : (
                <PlayerDetailView player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PLAYER DETAIL VIEW
// ═══════════════════════════════════════════════════════════════

function PlayerDetailView({ player, onClose }) {
  const hd = player.hunterData || {};
  const elemColor = ELEMENT_COLORS[player.hunterElement] || 'text-gray-400';
  const elemIcon = ELEMENTS[player.hunterElement]?.icon || '';
  const weapon = hd.weaponId ? WEAPONS[hd.weaponId] : null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {hd.sprite ? (
            <img src={hd.sprite} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/50" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-2xl border-2 border-purple-500/50">
              {player.hunterEmoji || '\uD83D\uDC64'}
            </div>
          )}
          <div>
            <div className={`font-bold text-lg ${elemColor}`}>
              {elemIcon} {player.hunterName}
            </div>
            <div className="text-xs text-gray-400">{player.displayName}</div>
            {hd.hunterLevel && <div className="text-[10px] text-gray-500">Niveau {hd.hunterLevel}</div>}
          </div>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-lg px-2">{'\u2715'}</button>
      </div>

      {/* iLevel badge */}
      <div className="text-center mb-4 p-2 rounded-xl bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border border-yellow-500/30">
        <div className="text-2xl font-bold text-amber-400">{player.bestIlevel}</div>
        <div className="text-[10px] text-gray-500">iLevel Total</div>
      </div>

      {/* Stats */}
      {hd.stats && (
        <div className="mb-4">
          <div className="text-xs font-bold text-gray-400 mb-2">Stats de base</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              ['HP', hd.stats.hp, '\u2764\uFE0F'],
              ['ATK', hd.stats.atk, '\u2694\uFE0F'],
              ['DEF', hd.stats.def, '\uD83D\uDEE1\uFE0F'],
              ['SPD', hd.stats.spd, '\uD83D\uDCA8'],
              ['CRIT', hd.stats.crit, '\uD83C\uDFAF'],
              ['RES', hd.stats.res, '\uD83D\uDEE1\uFE0F'],
            ].map(([label, val, icon]) => (
              <div key={label} className="p-2 rounded-lg bg-gray-800/50 text-center">
                <div className="text-[10px] text-gray-500">{icon} {label}</div>
                <div className="text-sm font-bold text-gray-200">{val}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weapon */}
      {weapon && (
        <div className="mb-4">
          <div className="text-xs font-bold text-gray-400 mb-2">Arme</div>
          <div className="p-3 rounded-xl bg-gray-800/50 border border-gray-700/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{weapon.icon}</span>
                <div>
                  <div className="text-sm font-bold text-gray-200">{weapon.name}</div>
                  <div className="text-[10px] text-gray-500">
                    {weapon.rarity} {weapon.element ? `| ${ELEMENTS[weapon.element]?.name || weapon.element}` : ''}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-purple-400">{hd.weaponIlevel || 0}</div>
                <div className="text-[9px] text-gray-600">iLvl</div>
                {hd.weaponAwakening > 0 && (
                  <div className="text-[9px] text-amber-400">A{hd.weaponAwakening}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Artifacts */}
      {hd.artifacts && hd.artifacts.length > 0 && (
        <div>
          <div className="text-xs font-bold text-gray-400 mb-2">Artefacts ({hd.artifacts.length}/8)</div>
          <div className="space-y-1.5">
            {hd.artifacts.map((art, i) => (
              <ArtifactRow key={i} art={art} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ARTIFACT ROW
// ═══════════════════════════════════════════════════════════════

function ArtifactRow({ art }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg bg-gray-800/50 border border-gray-700/30 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-2.5 flex items-center gap-2"
      >
        <span className="text-sm">{art.setIcon || '\uD83D\uDC8E'}</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-gray-300 truncate">
            {art.slotName} — {art.setName}
          </div>
          <div className="text-[10px] text-gray-500">
            {art.mainStatName} +{typeof art.mainValue === 'number' ? (art.mainValue % 1 !== 0 ? art.mainValue.toFixed(1) : art.mainValue) : art.mainValue}
            {' | '}Lv.{art.level} | {art.rarity}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-purple-400">{art.ilevel}</div>
          <div className="text-[9px] text-gray-600">iLvl</div>
        </div>
        <span className="text-gray-600 text-xs">{expanded ? '\u25B2' : '\u25BC'}</span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-700/30 px-3 py-2"
          >
            {art.subs && art.subs.length > 0 ? (
              <div className="space-y-0.5">
                {art.subs.map((s, i) => (
                  <div key={i} className="flex justify-between text-[10px]">
                    <span className="text-gray-400">{s.name}</span>
                    <span className="text-gray-300 font-mono">+{s.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[10px] text-gray-600 italic">Pas de sub-stats</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
