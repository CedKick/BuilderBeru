// src/components/AchievementToast.jsx
// Toast epique anime pour les Shadow Achievements

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RARITY_STYLES = {
  common: {
    gradient: 'from-gray-600 to-slate-700',
    glow: '0 0 20px rgba(156, 163, 175, 0.5)',
    border: 'border-gray-400/50',
  },
  rare: {
    gradient: 'from-blue-500 to-purple-600',
    glow: '0 0 30px rgba(139, 92, 246, 0.7)',
    border: 'border-purple-400/60',
  },
  special: {
    gradient: 'from-purple-500 to-pink-600',
    glow: '0 0 40px rgba(219, 39, 119, 0.8)',
    border: 'border-pink-400/60',
  },
  mythic: {
    gradient: 'from-yellow-400 via-orange-500 to-red-600',
    glow: '0 0 60px rgba(251, 146, 60, 1), 0 0 100px rgba(251, 146, 60, 0.4)',
    border: 'border-yellow-400/70',
  },
};

export default function AchievementToast() {
  const [activeAchievement, setActiveAchievement] = useState(null);
  const queueRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    const handleUnlock = (e) => {
      const { achievement } = e.detail || {};
      if (!achievement) return;

      if (activeAchievement) {
        // Queue if toast already showing
        queueRef.current.push(achievement);
      } else {
        showToast(achievement);
      }
    };

    window.addEventListener('achievement-unlocked', handleUnlock);
    return () => window.removeEventListener('achievement-unlocked', handleUnlock);
  }, [activeAchievement]);

  const showToast = (achievement) => {
    setActiveAchievement(achievement);
    timerRef.current = setTimeout(() => {
      setActiveAchievement(null);
      // Show next in queue
      setTimeout(() => {
        if (queueRef.current.length > 0) {
          showToast(queueRef.current.shift());
        }
      }, 300);
    }, 5000);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const style = activeAchievement ? RARITY_STYLES[activeAchievement.rarity] || RARITY_STYLES.common : null;

  return (
    <AnimatePresence>
      {activeAchievement && style && (
        <motion.div
          initial={{ y: -100, opacity: 0, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -100, opacity: 0, scale: 0.5 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[10001] max-w-[90vw]"
          style={{ boxShadow: style.glow }}
        >
          <div className={`
            bg-gradient-to-br ${style.gradient}
            backdrop-blur-md rounded-2xl p-5 min-w-[280px] md:min-w-[340px]
            border-2 ${style.border} relative overflow-hidden
          `}>
            {/* Sparkles */}
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute -top-1 -right-1 text-2xl pointer-events-none"
            >
              ✨
            </motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.7 }}
              className="absolute -bottom-1 -left-1 text-xl pointer-events-none"
            >
              ✨
            </motion.span>

            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="text-4xl md:text-5xl"
              >
                {activeAchievement.icon}
              </motion.div>

              <div className="flex-1 min-w-0">
                <div className="text-[10px] md:text-xs font-bold text-white/80 uppercase tracking-widest">
                  Succes Debloque !
                </div>
                <div className="text-lg md:text-xl font-extrabold text-white truncate">
                  {activeAchievement.name}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="text-xs md:text-sm text-white/90 mb-2">
              {activeAchievement.description}
            </div>

            {/* Rewards */}
            <div className="flex items-center gap-3 text-xs md:text-sm font-bold text-yellow-200">
              {activeAchievement.rewards.shadowCoins > 0 && (
                <span>+{activeAchievement.rewards.shadowCoins} Shadow Coins</span>
              )}
              {activeAchievement.rewards.chibiId && (
                <span>Chibi {activeAchievement.rewards.chibiRarity?.toUpperCase()}</span>
              )}
            </div>

            {/* Progress bar animation */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 5, ease: 'linear' }}
              className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 origin-left"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
