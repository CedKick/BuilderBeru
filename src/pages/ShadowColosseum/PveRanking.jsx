// PveRanking.jsx — PVE Power Ranking for Shadow Colosseum
// Shows level 140 hunters ranked by Power Score (computed stats)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { isLoggedIn, authHeaders, getAuthUser } from '../../utils/auth';
import AuthModal from '../../components/AuthModal';
import { CHIBIS, SPRITES, ELEMENTS, MAX_LEVEL, statsAtFull, calculatePowerScore, mergeTalentBonuses } from './colosseumCore';
import { HUNTERS, loadRaidData, getHunterStars, getHunterSprite } from './raidData';
import {
  computeEquipILevel, computeArtifactILevel, computeWeaponILevel,
  computeArtifactBonuses, getActiveSetBonuses,
  scoreAllArtifacts, scoreToGrade,
  WEAPONS, ARTIFACT_SLOTS, MAIN_STAT_VALUES, SUB_STAT_POOL,
  ALL_ARTIFACT_SETS,
} from './equipmentData';

// ─── Constants ──────────────────────────────────────────────
const COLO_KEY = 'shadow_colosseum_data';
const PVE_LAST_SUBMIT_KEY = 'pve_last_submit_v2';
const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

const defaultColoData = () => ({ chibiLevels: {}, statPoints: {}, skillTree: {}, talentTree: {}, talentTree2: {}, respecCount: {}, cooldowns: {}, stagesCleared: [], stats: { battles: 0, wins: 0 }, artifacts: {}, artifactInventory: [], weapons: {}, weaponCollection: {}, hammers: {}, accountXp: 0, accountBonuses: { hp: 0, atk: 0, def: 0, spd: 0, crit: 0, res: 0 }, accountAllocations: 0 });
const loadColoData = () => { try { return { ...defaultColoData(), ...JSON.parse(localStorage.getItem(COLO_KEY)) }; } catch { return defaultColoData(); } };

const ELEMENT_COLORS = {
  shadow: 'text-purple-400', fire: 'text-red-400', wind: 'text-emerald-400',
  earth: 'text-amber-400', water: 'text-blue-400', light: 'text-yellow-300',
  neutral: 'text-gray-400',
};
const ELEMENT_BG = {
  shadow: 'bg-purple-500/20', fire: 'bg-red-500/20', wind: 'bg-emerald-500/20',
  earth: 'bg-amber-500/20', water: 'bg-blue-500/20', light: 'bg-yellow-500/20',
  neutral: 'bg-gray-500/20',
};
const MEDAL = ['', '\uD83E\uDD47', '\uD83E\uDD48', '\uD83E\uDD49'];
const RARITY_LABEL = { mythique: 'Myth', legendaire: 'Leg', rare: 'Rare' };
const RARITY_COLOR = { mythique: 'text-red-400', legendaire: 'text-amber-400', rare: 'text-blue-400' };

const fmtNum = (n) => {
  if (n == null) return '0';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e4) return (n / 1e3).toFixed(1) + 'K';
  return n.toLocaleString('fr-FR');
};

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function PveRanking() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loggedIn, setLoggedIn] = useState(() => isLoggedIn());
  const [rankings, setRankings] = useState([]);
  const [total, setTotal] = useState(0);
  const [myHunters, setMyHunters] = useState([]);
  const [myBestRank, setMyBestRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [hunterFilter, setHunterFilter] = useState(''); // '' = all
  const [hunterList, setHunterList] = useState([]);

  // Listen for auth changes
  useEffect(() => {
    const handler = (e) => { if (e.detail?.type === 'auth-change') setLoggedIn(isLoggedIn()); };
    window.addEventListener('beru-react', handler);
    return () => window.removeEventListener('beru-react', handler);
  }, []);

  // ─── Compute ALL level 140 hunters from local data ────────
  const allMaxHunters = useMemo(() => {
    const coloData = loadColoData();
    const raidData = loadRaidData();
    const ownedIds = (raidData.hunterCollection || []).map(e => typeof e === 'string' ? e : e.id);
    const allIds = new Set([...Object.keys(coloData.chibiLevels || {}), ...ownedIds]);

    const result = [];

    for (const id of allIds) {
      const lvData = coloData.chibiLevels?.[id];
      const level = typeof lvData === 'object' ? (lvData?.level || 1) : (lvData || 1);
      if (level < MAX_LEVEL) continue; // Only level 140

      const chibi = CHIBIS[id];
      const hunter = HUNTERS[id];
      const info = chibi || hunter;
      if (!info || !info.base || !info.growth) continue;

      // Compute full stats
      const allocated = coloData.statPoints?.[id] || {};
      const tb = mergeTalentBonuses(coloData.talentTree?.[id] || {}, coloData.talentTree2?.[id] || {});
      const eqBonuses = computeArtifactBonuses(coloData.artifacts?.[id]);
      const stars = hunter ? getHunterStars(raidData, id) : 0;
      const globalBonuses = coloData.accountBonuses || {};

      const stats = statsAtFull(info.base, info.growth, MAX_LEVEL, allocated, tb, eqBonuses, stars, globalBonuses);
      const powerScore = calculatePowerScore(stats);

      // Equipment
      const wId = coloData.weapons?.[id] || null;
      const wAw = wId ? (coloData.weaponCollection?.[wId] || 0) : 0;
      const weapon = wId ? WEAPONS[wId] : null;
      const eq = computeEquipILevel(coloData.artifacts?.[id], wId, wAw);

      // Artifacts detail
      const equippedArtifacts = coloData.artifacts?.[id] || {};
      const artScores = scoreAllArtifacts(equippedArtifacts);
      const activeSets = getActiveSetBonuses(equippedArtifacts);

      const artifacts = Object.entries(equippedArtifacts).map(([slot, art]) => {
        if (!art) return null;
        return {
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
        };
      }).filter(Boolean);

      // Sprite
      const sprite = hunter ? getHunterSprite(id, raidData) : (SPRITES[id] || null);

      result.push({
        id,
        name: info.name,
        element: info.element,
        sprite,
        level: MAX_LEVEL,
        stats,
        powerScore,
        // Weapon
        weaponId: wId,
        weaponName: weapon?.name || null,
        weaponRarity: weapon?.rarity || null,
        weaponIcon: weapon?.icon || null,
        weaponAwakening: wAw,
        weaponIlevel: wId ? computeWeaponILevel(wId, wAw) : 0,
        weaponBonusStat: weapon?.bonusStat || null,
        weaponBonusValue: weapon?.bonusValue || null,
        // Artifacts
        artifacts,
        activeSets: activeSets.map(s => ({
          setId: s.set?.id,
          setName: s.set?.name,
          icon: s.set?.icon,
          pieces: s.pieces,
          bonusDesc: s.bonus,
          tier: s.tier,
        })),
        totalIlevel: eq.total,
        artifactAvgScore: artScores.avgScore,
        artifactAvgGrade: artScores.avgGrade,
      });
    }

    return result.sort((a, b) => b.powerScore - a.powerScore);
  }, []);

  // ─── Fetch rankings ─────────────────────────────────────
  const fetchRankings = useCallback(async (filter) => {
    if (!loggedIn) { setLoading(false); return; }
    try {
      const params = new URLSearchParams();
      params.set('action', 'rankings');
      if (filter) params.set('hunterId', filter);
      const resp = await fetch(`/api/pve-ranking?${params}`, { headers: { ...authHeaders() } });
      const json = await resp.json();
      if (json.success) {
        setRankings(json.rankings || []);
        setTotal(json.total || 0);
        setMyHunters(json.myHunters || []);
        setMyBestRank(json.myBestRank);
      }
    } catch (err) {
      console.error('PVE ranking fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [loggedIn]);

  // ─── Fetch hunter list for filter dropdown ────────────────
  const fetchHunterList = useCallback(async () => {
    if (!loggedIn) return;
    try {
      const resp = await fetch('/api/pve-ranking?action=hunter-list', { headers: { ...authHeaders() } });
      const json = await resp.json();
      if (json.success) setHunterList(json.hunters || []);
    } catch {}
  }, [loggedIn]);

  // ─── Submit all lv140 hunters ─────────────────────────────
  const submitAllHunters = useCallback(async () => {
    if (!loggedIn || allMaxHunters.length === 0) return;

    // Throttle: hash-based check
    const dataHash = allMaxHunters.map(h => `${h.id}:${h.powerScore}:${h.totalIlevel}`).join('|');
    const lastSubmit = JSON.parse(localStorage.getItem(PVE_LAST_SUBMIT_KEY) || '{}');
    const timeSince = Date.now() - (lastSubmit.timestamp || 0);
    if (lastSubmit.hash === dataHash && timeSince < REFRESH_INTERVAL) return;

    setSubmitting(true);
    try {
      const user = getAuthUser();
      const resp = await fetch('/api/pve-ranking?action=submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          displayName: user?.username || 'Joueur',
          hunters: allMaxHunters.map(h => ({
            hunterId: h.id,
            hunterName: h.name,
            hunterElement: h.element,
            powerScore: h.powerScore,
            totalIlevel: h.totalIlevel,
            hunterData: {
              hunterId: h.id,
              hunterName: h.name,
              hunterLevel: h.level,
              sprite: h.sprite,
              element: h.element,
              stats: h.stats,
              powerScore: h.powerScore,
              weaponId: h.weaponId,
              weaponName: h.weaponName,
              weaponRarity: h.weaponRarity,
              weaponIcon: h.weaponIcon,
              weaponAwakening: h.weaponAwakening,
              weaponIlevel: h.weaponIlevel,
              weaponBonusStat: h.weaponBonusStat,
              weaponBonusValue: h.weaponBonusValue,
              artifacts: h.artifacts,
              activeSets: h.activeSets,
              totalIlevel: h.totalIlevel,
              artifactAvgScore: h.artifactAvgScore,
              artifactAvgGrade: h.artifactAvgGrade,
            },
          })),
        }),
      });
      const json = await resp.json();
      if (json.success) {
        localStorage.setItem(PVE_LAST_SUBMIT_KEY, JSON.stringify({
          timestamp: Date.now(),
          hash: dataHash,
        }));
      }
    } catch (err) {
      console.error('PVE submit error:', err);
    } finally {
      setSubmitting(false);
    }
  }, [loggedIn, allMaxHunters]);

  // ─── Init: submit + fetch + periodic refresh ────────────
  useEffect(() => {
    if (!loggedIn) return;
    // Init table THEN submit + fetch (must wait for table creation)
    const initAndLoad = async () => {
      try {
        await fetch('/api/pve-ranking?action=init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
        });
      } catch {}
      await submitAllHunters();
      fetchRankings(hunterFilter);
      fetchHunterList();
    };
    initAndLoad();

    const interval = setInterval(() => {
      submitAllHunters().then(() => fetchRankings(hunterFilter));
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [loggedIn, submitAllHunters, fetchRankings, fetchHunterList, hunterFilter]);

  // ─── Re-fetch when filter changes ────────────────────────
  useEffect(() => {
    if (loggedIn) {
      setLoading(true);
      fetchRankings(hunterFilter);
    }
  }, [hunterFilter, loggedIn, fetchRankings]);

  // ─── Fetch entry detail ──────────────────────────────────
  const fetchEntryDetail = async (entryId) => {
    setDetailLoading(true);
    try {
      const resp = await fetch(`/api/pve-ranking?action=player-detail&id=${entryId}`, {
        headers: { ...authHeaders() },
      });
      const json = await resp.json();
      if (json.success) setSelectedEntry(json.entry);
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
            Connecte-toi pour voir le classement des meilleurs hunters Level 140 !
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

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="text-center mb-5">
          <Link to="/shadow-colosseum" className="text-sm text-gray-500 hover:text-gray-300 mb-3 inline-block">
            {'\u2190'} Retour au Colosseum
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
            {'\uD83C\uDFC6'} Classement PVE
          </h1>
          <p className="text-gray-500 text-xs mt-1">
            Level 140 — Classe par Power Score
          </p>
        </div>

        {/* My hunters summary */}
        {allMaxHunters.length > 0 && (
          <div className="mb-4 p-3 rounded-xl border border-yellow-500/30 bg-gradient-to-r from-yellow-900/10 to-amber-900/10">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-yellow-400">
                Mes hunters Lv.{MAX_LEVEL} ({allMaxHunters.length})
              </div>
              {myBestRank && (
                <div className="text-xs text-gray-400">
                  Meilleur rang : <span className="text-yellow-400 font-bold">#{myBestRank}</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {allMaxHunters.slice(0, 8).map(h => {
                const myRankEntry = myHunters.find(m => m.hunterId === h.id);
                return (
                  <div key={h.id} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-800/50 border border-gray-700/30">
                    {h.sprite && <img loading="lazy" src={h.sprite} alt="" className="w-5 h-5 rounded-full object-cover" />}
                    <span className={`text-[10px] font-bold ${ELEMENT_COLORS[h.element] || 'text-gray-400'}`}>{h.name}</span>
                    <span className="text-[9px] text-amber-400 font-mono">{fmtNum(h.powerScore)}</span>
                  </div>
                );
              })}
            </div>
            {submitting && <div className="mt-1 text-center text-[10px] text-gray-500">Synchronisation...</div>}
          </div>
        )}

        {allMaxHunters.length === 0 && (
          <div className="mb-4 p-3 rounded-xl border border-gray-700/40 bg-gray-800/20 text-center">
            <div className="text-gray-500 text-sm">Aucun hunter au niveau {MAX_LEVEL}</div>
            <div className="text-gray-600 text-xs mt-1">Monte un perso au max pour apparaitre dans le classement !</div>
          </div>
        )}

        {/* Hunter filter */}
        {hunterList.length > 0 && (
          <div className="mb-4 flex items-center gap-2">
            <label className="text-xs text-gray-400 flex-shrink-0">Filtrer :</label>
            <select
              value={hunterFilter}
              onChange={(e) => setHunterFilter(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-purple-500"
            >
              <option value="">Tous les hunters ({total})</option>
              {hunterList.map(h => (
                <option key={h.hunterId} value={h.hunterId}>
                  {ELEMENTS[h.hunterElement]?.icon || ''} {h.hunterName} ({h.playerCount} joueurs)
                </option>
              ))}
            </select>
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
            <p className="text-xs mt-1">Monte un perso au Lv.{MAX_LEVEL} et equipe-le !</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {rankings.map((r) => {
              const medal = MEDAL[r.rank] || '';
              const elemColor = ELEMENT_COLORS[r.hunterElement] || 'text-gray-400';
              const elemBg = ELEMENT_BG[r.hunterElement] || 'bg-gray-500/20';
              const elemIcon = ELEMENTS[r.hunterElement]?.icon || '';

              return (
                <motion.button
                  key={r.entryId}
                  onClick={() => fetchEntryDetail(r.entryId)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    r.isMe
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
                    <div className={`w-8 text-center font-bold text-sm flex-shrink-0 ${
                      r.rank === 1 ? 'text-yellow-400' : r.rank === 2 ? 'text-gray-300' : r.rank === 3 ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      {medal || `#${r.rank}`}
                    </div>

                    {/* Hunter info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${elemBg} ${elemColor} font-bold`}>
                          {elemIcon} {r.hunterName}
                        </span>
                        {r.isMe && <span className="text-[9px] px-1 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-bold">MOI</span>}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5 truncate">
                        {r.displayName}
                      </div>
                    </div>

                    {/* Power Score + iLevel */}
                    <div className="text-right flex-shrink-0">
                      <div className={`font-bold text-sm ${r.rank <= 3 ? 'text-amber-400' : 'text-gray-200'}`}>
                        {fmtNum(r.powerScore)}
                      </div>
                      <div className="text-[9px] text-gray-600">
                        PS | {r.totalIlevel} iLv
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* My rank if outside top 100 */}
        {myBestRank && myBestRank > 100 && (
          <div className="mt-4 text-center p-3 rounded-xl border border-gray-700/40 bg-gray-800/30">
            <span className="text-gray-400 text-sm">
              Ton rang : <span className="text-yellow-400 font-bold">#{myBestRank}</span> / {total}
            </span>
          </div>
        )}
      </div>

      {/* ─── Entry Detail Modal ───────────────────────────── */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={() => setSelectedEntry(null)}
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
                <EntryDetailView entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
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
// ENTRY DETAIL VIEW
// ═══════════════════════════════════════════════════════════════

function EntryDetailView({ entry, onClose }) {
  const hd = entry.hunterData || {};
  const elemColor = ELEMENT_COLORS[entry.hunterElement] || 'text-gray-400';
  const elemIcon = ELEMENTS[entry.hunterElement]?.icon || '';
  const weapon = hd.weaponId ? WEAPONS[hd.weaponId] : null;
  const avgGrade = hd.artifactAvgGrade ? scoreToGrade(hd.artifactAvgScore || 0) : null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {hd.sprite ? (
            <img loading="lazy" src={hd.sprite} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-purple-500/50" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center text-2xl border-2 border-purple-500/50">
              {elemIcon || '\uD83D\uDC64'}
            </div>
          )}
          <div>
            <div className={`font-bold text-lg ${elemColor}`}>
              {elemIcon} {entry.hunterName}
            </div>
            <div className="text-xs text-gray-400">par {entry.displayName}</div>
            <div className="text-[10px] text-gray-500">Level {hd.hunterLevel || MAX_LEVEL}</div>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-lg px-2">{'\u2715'}</button>
      </div>

      {/* Power Score + iLevel */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="text-center p-3 rounded-xl bg-gradient-to-r from-amber-900/30 to-yellow-900/30 border border-yellow-500/30">
          <div className="text-2xl font-bold text-amber-400">{fmtNum(entry.powerScore)}</div>
          <div className="text-[10px] text-gray-500">Power Score</div>
        </div>
        <div className="text-center p-3 rounded-xl bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30">
          <div className="text-2xl font-bold text-purple-400">{entry.totalIlevel}</div>
          <div className="text-[10px] text-gray-500">iLevel Total</div>
        </div>
      </div>

      {/* Stats (computed, with equipment) */}
      {hd.stats && (
        <div className="mb-4">
          <div className="text-xs font-bold text-gray-400 mb-2">Stats finales (avec equipement)</div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              ['HP', hd.stats.hp, '#ef4444'],
              ['ATK', hd.stats.atk, '#f97316'],
              ['DEF', hd.stats.def, '#3b82f6'],
              ['SPD', hd.stats.spd, '#22c55e'],
              ['CRIT', hd.stats.crit, '#eab308'],
              ['RES', hd.stats.res, '#a78bfa'],
            ].map(([label, val, color]) => (
              <div key={label} className="p-2 rounded-lg bg-gray-800/50 border border-gray-700/20">
                <div className="text-[10px] font-bold" style={{ color }}>{label}</div>
                <div className="text-sm font-bold text-gray-200">{typeof val === 'number' ? fmtNum(Math.floor(val)) : val}</div>
              </div>
            ))}
          </div>
          {hd.stats.mana != null && (
            <div className="mt-1.5 flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-800/30 border border-gray-700/20">
              <span className="text-[10px] text-blue-400 font-bold">MANA</span>
              <span className="text-xs text-gray-300">{hd.stats.mana}</span>
            </div>
          )}
        </div>
      )}

      {/* Weapon */}
      {(weapon || hd.weaponName) && (
        <div className="mb-4">
          <div className="text-xs font-bold text-gray-400 mb-2">Arme</div>
          <div className="p-3 rounded-xl bg-gray-800/50 border border-gray-700/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{hd.weaponIcon || weapon?.icon || '\uD83D\uDDE1\uFE0F'}</span>
                <div>
                  <div className="text-sm font-bold text-gray-200">{hd.weaponName || weapon?.name}</div>
                  <div className="text-[10px] text-gray-500">
                    <span className={RARITY_COLOR[hd.weaponRarity || weapon?.rarity] || 'text-gray-400'}>
                      {RARITY_LABEL[hd.weaponRarity || weapon?.rarity] || hd.weaponRarity || weapon?.rarity}
                    </span>
                    {hd.weaponBonusStat && (
                      <span className="ml-1 text-gray-500">
                        | +{hd.weaponBonusValue} {MAIN_STAT_VALUES[hd.weaponBonusStat]?.name || hd.weaponBonusStat}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-purple-400">{hd.weaponIlevel || 0}</div>
                <div className="text-[9px] text-gray-600">iLvl</div>
                {(hd.weaponAwakening || 0) > 0 && (
                  <div className="text-[9px] text-amber-400 font-bold">A{hd.weaponAwakening}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Sets */}
      {hd.activeSets && hd.activeSets.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-bold text-gray-400 mb-2">Sets actifs</div>
          <div className="space-y-1">
            {hd.activeSets.map((s, i) => (
              <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-800/40 border border-gray-700/20">
                <span className="text-sm">{s.icon || ''}</span>
                <span className="text-xs font-bold text-gray-300">{s.setName}</span>
                <span className="text-[10px] text-purple-400">({s.pieces}pc)</span>
                {s.bonusDesc && <span className="text-[10px] text-gray-500 ml-auto">{s.bonusDesc}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Artifacts */}
      {hd.artifacts && hd.artifacts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-gray-400">Artefacts ({hd.artifacts.length}/8)</div>
            {avgGrade && (
              <div className={`text-xs font-bold ${avgGrade.color}`}>
                Note moy: {avgGrade.grade}
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            {hd.artifacts.map((art, i) => (
              <ArtifactDetailRow key={i} art={art} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ARTIFACT DETAIL ROW
// ═══════════════════════════════════════════════════════════════

function ArtifactDetailRow({ art }) {
  const [expanded, setExpanded] = useState(false);
  const rarityColor = RARITY_COLOR[art.rarity] || 'text-gray-400';

  return (
    <div className="rounded-lg bg-gray-800/50 border border-gray-700/30 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-2.5 flex items-center gap-2"
      >
        <span className="text-sm flex-shrink-0">{art.setIcon || '\uD83D\uDC8E'}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-gray-300 truncate">{art.slotName}</span>
            <span className="text-[9px] text-gray-500">—</span>
            <span className="text-[10px] text-gray-400 truncate">{art.setName}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`text-[9px] ${rarityColor}`}>{RARITY_LABEL[art.rarity] || art.rarity}</span>
            <span className="text-[9px] text-gray-600">+{art.level}</span>
            <span className="text-[9px] text-gray-500">|</span>
            <span className="text-[10px] text-gray-300">{art.mainStatName} +{typeof art.mainValue === 'number' ? (art.mainValue % 1 !== 0 ? art.mainValue.toFixed(1) : art.mainValue) : art.mainValue}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-xs font-bold text-purple-400">{art.ilevel}</div>
          <div className="text-[9px] text-gray-600">iLvl</div>
        </div>
        <span className="text-gray-600 text-xs ml-1">{expanded ? '\u25B2' : '\u25BC'}</span>
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
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
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
