// src/components/HomeDashboard.jsx
// Homepage Vivante - "Le Repaire de l'Ombre"
// Dashboard vivant avec stats, chibi anime, evenements saisonniers et quick resume

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import AchievementBadges from './AchievementBadges';
import shadowCoinManager from './ChibiSystem/ShadowCoinManager';

const BERU_SPRITE = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750414699/beru_face_w2rdyn.png';

// ============================================================
// DONNEES
// ============================================================

const getSeasonalEvent = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  if (month === 2 && day >= 12 && day <= 16)
    return { id: 'valentine', icon: '\uD83D\uDC9D', messageKey: 'dashboard.seasonal.valentine', gradient: 'from-pink-600/40 to-red-600/40', border: 'border-pink-500/50' };
  if (month === 4 && day === 1)
    return { id: 'april', icon: '\uD83D\uDC1F', messageKey: 'dashboard.seasonal.april', gradient: 'from-cyan-600/40 to-blue-600/40', border: 'border-cyan-500/50' };
  if ((month === 10 && day >= 25) || (month === 11 && day <= 2))
    return { id: 'halloween', icon: '\uD83C\uDF83', messageKey: 'dashboard.seasonal.halloween', gradient: 'from-orange-600/40 to-purple-900/40', border: 'border-orange-500/50' };
  if (month === 12 && day >= 20)
    return { id: 'christmas', icon: '\uD83C\uDF84', messageKey: 'dashboard.seasonal.christmas', gradient: 'from-red-600/40 to-green-700/40', border: 'border-red-500/50' };
  if (month === 5 && day >= 5 && day <= 10)
    return { id: 'sla_anniversary', icon: '\uD83C\uDF82', messageKey: 'dashboard.seasonal.sla_anniversary', gradient: 'from-purple-600/40 to-indigo-600/40', border: 'border-purple-500/50' };

  return null;
};

const DEFAULT_STATS = { coins: 0, streak: 0, chibis: 0, builds: 0 };

const getUserStats = () => {
  try {
    const raw = localStorage.getItem('builderberu_users');
    if (!raw) return DEFAULT_STATS;
    const data = JSON.parse(raw);
    const accounts = data?.user?.accounts || {};
    const account = accounts[Object.keys(accounts)[0]] || {};
    return {
      coins: account.chibis?.shadowCoins || 0,
      streak: account.chibis?.streakData?.currentStreak || 0,
      chibis: Object.keys(account.chibis?.ownedChibis || {}).length,
      builds: Object.keys(account.builds || {}).length,
    };
  } catch { return DEFAULT_STATS; }
};

const getQuickResume = () => {
  const items = [];
  try {
    // Dernier dessin
    const lastDraw = localStorage.getItem('drawberu_last_drawing');
    if (lastDraw) {
      const d = JSON.parse(lastDraw);
      if (d.hunter) items.push({ label: `DrawBeru: ${d.hunter}`, to: '/drawberu', icon: '\uD83C\uDFA8' });
    }
  } catch {}

  try {
    // Theorycraft sessions
    const raw = localStorage.getItem('builderberu_users');
    if (raw) {
      const data = JSON.parse(raw);
      const accounts = data?.user?.accounts || {};
      const account = accounts[Object.keys(accounts)[0]] || {};
      if ((account.theorycraftSessions || 0) > 0) {
        items.push({ label: 'Theorycraft', to: '/theorycraft', icon: '\uD83D\uDCCA' });
      }
      // Dernier build
      const builds = account.builds || {};
      const buildKeys = Object.keys(builds);
      if (buildKeys.length > 0) {
        items.push({ label: 'Build', to: '/build', icon: '\u2694\uFE0F' });
      }
    }
  } catch {}

  return items;
};

// ============================================================
// COMPOSANT
// ============================================================

export default function HomeDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [resumeItems, setResumeItems] = useState([]);
  const seasonalEvent = getSeasonalEvent();

  // Charger les stats
  useEffect(() => {
    setStats(getUserStats());
    setResumeItems(getQuickResume());

    // Ecouter les mises a jour de coins
    const unsub = shadowCoinManager.subscribe(({ total }) => {
      setStats(prev => ({ ...prev, coins: total }));
    });
    return unsub;
  }, []);

  const STAT_CARDS = [
    { label: t('dashboard.stats.coins', 'Shadow Coins'), value: stats.coins.toLocaleString(), icon: '\uD83D\uDCB0', color: 'text-yellow-400' },
    { label: t('dashboard.stats.streak', 'Streak'), value: stats.streak > 0 ? `${stats.streak}j` : '-', icon: '\uD83D\uDD25', color: stats.streak > 0 ? 'text-orange-400' : 'text-gray-500' },
    { label: t('dashboard.stats.chibis', 'Chibis'), value: `${stats.chibis}`, icon: '\uD83D\uDC3E', color: 'text-purple-400' },
    { label: t('dashboard.stats.builds', 'Builds'), value: `${stats.builds}`, icon: '\u2694\uFE0F', color: 'text-blue-400' },
  ];

  // Mini Chibi walking + speech bubble
  const [bubble, setBubble] = useState(null);
  const bubbleTimer = useRef(null);
  const showBubble = useCallback(() => {
    const messages = t('dashboard.chibiMessages', { returnObjects: true });
    const pool = Array.isArray(messages) ? messages : ["Kiiiek!"];
    const msg = pool[Math.floor(Math.random() * pool.length)];
    setBubble(msg);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setBubble(null), 3000);
  }, [t]);

  useEffect(() => {
    const interval = setInterval(showBubble, 8000 + Math.random() * 4000);
    const t = setTimeout(showBubble, 2000);
    return () => { clearInterval(interval); clearTimeout(t); if (bubbleTimer.current) clearTimeout(bubbleTimer.current); };
  }, [showBubble]);

  return (
    <div className="w-full max-w-sm md:max-w-2xl mx-auto mb-4 px-2">

      {/* ─── Section 0 : Mini Chibi Anime ─── */}
      <div className="relative h-10 md:h-14 mb-2 overflow-hidden rounded-lg bg-gray-800/20 border border-gray-700/20">
        <style>{`
          @keyframes chibiWalk {
            0% { left: -40px; transform: scaleX(1); }
            48% { left: calc(100% - 0px); transform: scaleX(1); }
            50% { left: calc(100% - 0px); transform: scaleX(-1); }
            98% { left: -40px; transform: scaleX(-1); }
            100% { left: -40px; transform: scaleX(1); }
          }
        `}</style>
        <div
          className="absolute top-1/2 -translate-y-1/2"
          style={{ animation: 'chibiWalk 20s linear infinite' }}
        >
          <div className="relative">
            <AnimatePresence>
              {bubble && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.8 }}
                  className="absolute -top-7 md:-top-8 left-1/2 -translate-x-1/2 whitespace-nowrap
                             bg-gray-900/90 text-[8px] md:text-[10px] text-purple-300 font-medium
                             px-2 py-0.5 rounded-full border border-purple-500/30 pointer-events-none"
                >
                  {bubble}
                </motion.div>
              )}
            </AnimatePresence>
            <img
              src={BERU_SPRITE}
              alt="Beru"
              className="w-8 h-8 md:w-10 md:h-10"
              style={{ imageRendering: 'pixelated' }}
              draggable={false}
            />
          </div>
        </div>
      </div>

      {/* ─── Section 1 : Stats Personnelles ─── */}
      <div className="grid grid-cols-4 gap-1.5 md:gap-2 mb-3">
        {STAT_CARDS.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-1.5 md:p-2 border border-gray-700/30 text-center"
          >
            <div className="text-base md:text-lg">{card.icon}</div>
            <div className={`text-sm md:text-base font-bold ${card.color}`}>{card.value}</div>
            <div className="text-[8px] md:text-[10px] text-gray-500 leading-tight">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ─── Section 3 : Achievements ─── */}
      <AchievementBadges />

      {/* ─── Section 4 : Banniere Saisonniere ─── */}
      {seasonalEvent && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className={`
            bg-gradient-to-r ${seasonalEvent.gradient}
            backdrop-blur-sm rounded-xl p-2.5 md:p-3 mb-3
            border ${seasonalEvent.border} text-center
          `}
        >
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block text-xl md:text-2xl mr-2"
          >
            {seasonalEvent.icon}
          </motion.span>
          <span className="text-xs md:text-sm text-white/90 font-medium">
            {t(seasonalEvent.messageKey)}
          </span>
        </motion.div>
      )}

      {/* ─── Section 5 : Quick Resume ─── */}
      {resumeItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-2"
        >
          <div className="text-[10px] md:text-xs text-gray-500 mb-1.5 text-center">{t('dashboard.resume', 'Reprendre')}</div>
          <div className="flex justify-center gap-2 flex-wrap">
            {resumeItems.map((item, i) => (
              <Link
                key={i}
                to={item.to}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg
                           bg-gray-800/30 border border-gray-700/40
                           hover:border-purple-500/50 hover:bg-purple-900/20
                           transition-all text-[10px] md:text-xs text-gray-300 hover:text-white"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
