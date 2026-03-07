// ── Loot Engine (Ragnaros) ──
// Generates all rewards at end of fight: XP, artifacts, weapons, alkahest, feathers, set pieces

import { calculateXpReward, xpForLevel, MAX_LEVEL } from './playerProfile.js';
import {
  generateRaidArtifact, generateRaidWeaponDrop,
  calculateAlkahestReward, rollSetUltimeDrops,
  ARTIFACT_DROP_TABLE, WEAPON_DROP_CHANCE, WEAPON_DROP_TIERS,
  FEATHER_DROP_RATES,
} from './raidGearData.js';

/**
 * Generate loot for a single player after a Ragnaros fight
 *
 * @param {Object} params
 * @param {boolean} params.victory
 * @param {string} params.difficulty - NORMAL | HARD | NIGHTMARE
 * @param {number} params.bossHpPercent - 0-100
 * @param {number} params.damageDealt - total damage by this player
 * @param {number} params.healingDone - total healing by this player
 * @param {number} params.deaths - number of deaths
 * @param {number} params.playerCount - total human players
 * @param {number} params.elapsed - fight duration in seconds
 * @param {number} params.playerLevel - current player level
 * @param {string} params.playerClass
 * @returns {Object} { xp, levelUp, artifacts, weapons, alkahest, feathers, setDrops }
 */
export function generatePlayerRewards(params) {
  const {
    victory, difficulty, bossHpPercent, damageDealt, healingDone,
    deaths, playerCount, elapsed, playerLevel, playerClass,
  } = params;

  const diff = difficulty || 'NORMAL';

  // ── XP ──
  const xp = calculateXpReward({
    victory, difficulty: diff, bossHpPercent,
    damageDealt, healingDone, deaths, playerCount, elapsed,
  });

  // Check level up
  let levelUp = null;
  if (playerLevel < MAX_LEVEL) {
    const xpNeeded = xpForLevel(playerLevel + 1);
    // We send xp back, the client/storage handles accumulation
    // But we can pre-compute if this would level up
    levelUp = { xpNeeded, currentLevel: playerLevel };
  }

  // ── Artifacts (victory only) ──
  const artifacts = [];
  if (victory) {
    const dropTable = ARTIFACT_DROP_TABLE[diff] || ARTIFACT_DROP_TABLE.NORMAL;
    const count = dropTable.count[0] + Math.floor(Math.random() * (dropTable.count[1] - dropTable.count[0] + 1));
    for (let i = 0; i < count; i++) {
      const tier = dropTable.tiers[Math.floor(Math.random() * dropTable.tiers.length)];
      artifacts.push(generateRaidArtifact(tier));
    }
  }

  // ── Weapons (victory only) ──
  const weapons = [];
  if (victory) {
    const weaponChance = WEAPON_DROP_CHANCE[diff] || 0.15;
    if (Math.random() < weaponChance) {
      const tiers = WEAPON_DROP_TIERS[diff] || WEAPON_DROP_TIERS.NORMAL;
      const tier = tiers[Math.floor(Math.random() * tiers.length)];
      weapons.push(generateRaidWeaponDrop(tier));
    }
  }

  // ── Alkahest (victory or boss < 75%) ──
  const alkahest = calculateAlkahestReward(bossHpPercent, diff, playerCount, victory);

  // ── Feathers (victory only, rare) ──
  let feathers = 0;
  if (victory) {
    const featherRate = FEATHER_DROP_RATES[diff] || 0.05;
    // Roll 3 times
    for (let i = 0; i < 3; i++) {
      if (Math.random() < featherRate) feathers++;
    }
  }

  // ── Set Ultime drops (victory only, very rare) ──
  const setDrops = victory ? rollSetUltimeDrops() : [];

  return {
    xp,
    levelUp,
    artifacts,
    weapons,
    alkahest,
    feathers,
    setDrops,
    summary: {
      damageDealt,
      healingDone,
      deaths,
      elapsed,
      difficulty: diff,
      victory,
      bossHpPercent,
    },
  };
}
