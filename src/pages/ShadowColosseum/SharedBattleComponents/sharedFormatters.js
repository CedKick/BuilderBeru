// src/pages/ShadowColosseum/SharedBattleComponents/sharedFormatters.js
// Shared utility functions for formatting numbers and stats

export function formatDamage(dmg) {
  if (!dmg || dmg === 0) return '0';
  if (dmg >= 1_000_000_000) return (dmg / 1_000_000_000).toFixed(2) + 'B';
  if (dmg >= 1_000_000) return (dmg / 1_000_000).toFixed(2) + 'M';
  if (dmg >= 1_000) return (dmg / 1_000).toFixed(1) + 'K';
  return Math.floor(dmg).toString();
}

export function formatPercent(pct) {
  return pct.toFixed(1) + '%';
}

export function formatNumber(n) {
  return Math.floor(n).toLocaleString('fr-FR');
}

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getHPColor(hpPercent) {
  if (hpPercent > 60) return 'from-green-500 to-emerald-500';
  if (hpPercent > 30) return 'from-yellow-500 to-orange-500';
  return 'from-red-500 to-rose-600';
}

export function calculateCritRate(critHits, totalHits) {
  if (totalHits === 0) return 0;
  return (critHits / totalHits) * 100;
}

// Element colors
export const ELEMENT_COLORS = {
  fire: 'text-red-400',
  water: 'text-blue-400',
  light: 'text-yellow-400',
  dark: 'text-purple-400',
  wind: 'text-green-400',
  neutral: 'text-gray-400',
};

export const ELEMENT_BG = {
  fire: 'bg-red-600/20 border-red-500/30',
  water: 'bg-blue-600/20 border-blue-500/30',
  light: 'bg-yellow-600/20 border-yellow-500/30',
  dark: 'bg-purple-600/20 border-purple-500/30',
  wind: 'bg-green-600/20 border-green-500/30',
  neutral: 'bg-gray-600/20 border-gray-500/30',
};
