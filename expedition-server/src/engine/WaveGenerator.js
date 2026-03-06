import { WAVE_COMPOSITIONS, MOB_TEMPLATES } from '../data/mobTemplates.js';
import { BOSS_DEFINITIONS } from '../data/bossDefinitions.js';
import { getMobWaveTier } from '../data/lootTables.js';

// ── Wave Generator ──
// Pre-generates the full sequence of encounters for an expedition.
// Structure: [mob_wave, mob_wave, boss_1, mob_wave, mob_wave, mob_wave, boss_2, ...]

// Map loot table tier names to wave composition keys
const TIER_TO_WAVE = {
  mob_wave_tier1: 'tier1',
  mob_wave_tier2: 'tier2',
  mob_wave_tier3: 'tier3',
  mob_wave_tier4: 'tier4',
};

export function generateEncounterSequence(bossCount = 15) {
  const encounters = [];

  for (let bossIdx = 0; bossIdx < bossCount; bossIdx++) {
    const bossDef = BOSS_DEFINITIONS[bossIdx];
    if (!bossDef) break;

    // Determine wave tier for this boss section (from lootTables.js)
    const lootTier = getMobWaveTier(bossIdx);
    const waveTier = TIER_TO_WAVE[lootTier] || 'tier1';
    const wavePool = WAVE_COMPOSITIONS[waveTier] || WAVE_COMPOSITIONS.tier1;

    // 3-5 mob waves before each boss (more waves = more AoE value)
    const baseWaves = bossIdx < 5 ? 4 : bossIdx < 10 ? 3 : 3;
    const waveCount = baseWaves + Math.floor(Math.random() * 2);
    for (let w = 0; w < waveCount; w++) {
      const composition = wavePool[Math.floor(Math.random() * wavePool.length)];
      // Difficulty scales with boss section and wave progress
      const difficultyMult = 1 + bossIdx * 0.4 + w * 0.1;

      encounters.push({
        type: 'mob_wave',
        waveIndex: w,
        bossSection: bossIdx,
        difficulty: difficultyMult,
        composition: composition.mobs.map(m => ({
          template: m.t,
          count: m.count,
        })),
        lootTableId: lootTier,
      });
    }

    // Boss encounter
    encounters.push({
      type: 'boss',
      bossIndex: bossIdx,
      bossId: bossDef.id,
      bossName: bossDef.name,
      difficulty: 1 + bossIdx * 0.3,
      lootTableId: bossDef.lootTable,
    });
  }

  return encounters;
}

// Get mob spawn data from an encounter composition (returns template + difficulty, not entities)
export function getMobSpawnData(encounter) {
  return encounter.composition.map(group => {
    const template = MOB_TEMPLATES[group.template];
    if (!template) return [];
    const spawns = [];
    for (let i = 0; i < group.count; i++) {
      spawns.push({ template: { ...template, name: template.name }, difficultyMult: encounter.difficulty });
    }
    return spawns;
  }).flat();
}

// Serialize encounter sequence for state snapshot
export function serializeEncounters(encounters) {
  return encounters.map(e => ({ ...e }));
}
