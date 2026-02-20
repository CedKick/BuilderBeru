// src/pages/ShadowColosseum/TrainingDummy/formatters.js
// Utility functions for formatting numbers and stats

/**
 * Format damage with K/M/B suffixes (Warcraft style)
 * @param {number} dmg - Raw damage number
 * @returns {string} Formatted string (e.g., "1.5M", "2.3B")
 */
export function formatDamage(dmg) {
  if (!dmg || dmg === 0) return '0';
  if (dmg >= 1_000_000_000) return (dmg / 1_000_000_000).toFixed(2) + 'B';
  if (dmg >= 1_000_000) return (dmg / 1_000_000).toFixed(2) + 'M';
  if (dmg >= 1_000) return (dmg / 1_000).toFixed(1) + 'K';
  return Math.floor(dmg).toString();
}

/**
 * Format time as MM:SS
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time (e.g., "2:47")
 */
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format percentage with 1 decimal
 * @param {number} value - Percentage value (0-100)
 * @returns {string} Formatted percentage (e.g., "15.5%")
 */
export function formatPercent(value) {
  return value.toFixed(1) + '%';
}

/**
 * Format large numbers with locale (French)
 * @param {number} n - Number to format
 * @returns {string} Formatted number with spaces (e.g., "1 234 567")
 */
export function formatNumber(n) {
  return Math.floor(n).toLocaleString('fr-FR');
}

/**
 * Calculate DPS (damage per second)
 * @param {number} totalDamage - Total damage dealt
 * @param {number} duration - Duration in seconds
 * @returns {number} DPS value
 */
export function calculateDPS(totalDamage, duration) {
  if (duration === 0) return 0;
  return totalDamage / duration;
}

/**
 * Calculate crit rate percentage
 * @param {number} critHits - Number of critical hits
 * @param {number} totalHits - Total number of hits
 * @returns {number} Crit rate percentage (0-100)
 */
export function calculateCritRate(critHits, totalHits) {
  if (totalHits === 0) return 0;
  return (critHits / totalHits) * 100;
}

/**
 * Get color based on HP percentage
 * @param {number} hpPercent - HP percentage (0-100)
 * @returns {string} Tailwind color class
 */
export function getHPColor(hpPercent) {
  if (hpPercent > 75) return 'from-green-500 to-green-600';
  if (hpPercent > 50) return 'from-yellow-500 to-yellow-600';
  if (hpPercent > 25) return 'from-orange-500 to-orange-600';
  return 'from-red-500 to-red-600';
}

/**
 * Get rarity color
 * @param {string} rarity - Rarity tier
 * @returns {string} Tailwind color class
 */
export function getRarityColor(rarity) {
  const colors = {
    common: 'text-gray-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendaire: 'text-orange-400',
    mythique: 'text-red-400',
  };
  return colors[rarity] || 'text-gray-400';
}
