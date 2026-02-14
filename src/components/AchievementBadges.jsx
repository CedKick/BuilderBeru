// src/components/AchievementBadges.jsx
// Grille de badges des Shadow Achievements pour la HomePage

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import shadowAchievementManager from '../utils/ShadowAchievementManager';

const RARITY_COLORS = {
  common: { border: 'border-gray-500', bg: 'from-gray-600/30 to-slate-700/30', text: 'text-gray-300' },
  rare: { border: 'border-blue-500', bg: 'from-blue-600/30 to-purple-600/30', text: 'text-blue-300' },
  special: { border: 'border-pink-500', bg: 'from-purple-600/30 to-pink-600/30', text: 'text-pink-300' },
  mythic: { border: 'border-yellow-500', bg: 'from-yellow-500/30 to-orange-600/30', text: 'text-yellow-300' },
};

export default function AchievementBadges() {
  const [achievements, setAchievements] = useState([]);

  const refresh = () => {
    setAchievements(shadowAchievementManager.getAll());
  };

  useEffect(() => {
    refresh();

    // Refresh quand un achievement est unlock
    const unsub = shadowAchievementManager.subscribe(() => refresh());

    // Aussi ecouter l'event global
    const handleUnlock = () => setTimeout(refresh, 300);
    window.addEventListener('achievement-unlocked', handleUnlock);

    return () => {
      unsub();
      window.removeEventListener('achievement-unlocked', handleUnlock);
    };
  }, []);

  const stats = shadowAchievementManager.getStats();

  return (
    <div className="w-full max-w-2xl mx-auto mb-6 px-2">
      {/* Header */}
      <div className="text-center mb-3">
        <h3 className="text-sm md:text-base font-bold text-purple-300">
          Succes des Ombres ({stats.unlocked.length}/{stats.total})
        </h3>
        {/* Progress bar globale */}
        <div className="w-32 mx-auto mt-1.5 bg-gray-700/50 rounded-full h-1.5">
          <motion.div
            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${stats.progress * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Grille de badges */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
        {achievements.map((achievement, i) => {
          const colors = RARITY_COLORS[achievement.rarity] || RARITY_COLORS.common;
          const unlocked = achievement.unlocked;
          const progress = achievement.progress;

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.06 }}
              className={`
                relative p-2.5 md:p-3 rounded-xl border-2 cursor-default
                ${unlocked
                  ? `bg-gradient-to-br ${colors.bg} ${colors.border}`
                  : 'bg-gray-800/30 border-gray-700/50 opacity-50'
                }
                backdrop-blur-sm transition-colors
              `}
              title={unlocked ? `${achievement.name}: ${achievement.description}` : achievement.description}
            >
              {/* Icon */}
              <div className={`text-2xl md:text-3xl text-center mb-1 ${!unlocked ? 'grayscale' : ''}`}>
                {unlocked ? achievement.icon : '\uD83D\uDD12'}
              </div>

              {/* Name */}
              <div className={`text-[10px] md:text-xs font-bold text-center leading-tight ${unlocked ? colors.text : 'text-gray-500'}`}>
                {unlocked ? achievement.name : '???'}
              </div>

              {/* Progress bar (locked only) */}
              {!unlocked && progress && progress.max > 1 && (
                <div className="mt-1.5">
                  <div className="w-full bg-gray-700/60 rounded-full h-1">
                    <div
                      className="bg-purple-500/70 h-1 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((progress.current / progress.max) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="text-[9px] text-gray-500 text-center mt-0.5">
                    {progress.current}/{progress.max}
                  </div>
                </div>
              )}

              {/* Checkmark */}
              {unlocked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="absolute -top-1.5 -right-1.5 bg-green-500 rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center shadow-lg"
                >
                  <span className="text-white text-[8px] md:text-[10px] font-bold">{'\u2713'}</span>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
