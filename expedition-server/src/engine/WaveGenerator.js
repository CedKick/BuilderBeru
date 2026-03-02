import { WAVE_COMPOSITIONS, MOB_TEMPLATES } from '../data/mobTemplates.js';
import { BOSS_DEFINITIONS } from '../data/bossDefinitions.js';

// ── Wave Generator ──
// Pre-generates the full sequence of encounters for an expedition.
// Structure: [mob_wave, mob_wave, boss_1, mob_wave, mob_wave, mob_wave, boss_2, ...]

export function generateEncounterSequence(bossCount = 3) {
  const encounters = [];

  for (let bossIdx = 0; bossIdx < bossCount; bossIdx++) {
    const bossDef = BOSS_DEFINITIONS[bossIdx];
    if (!bossDef) break;

    // Determine wave tier for this boss section
    const tier = bossIdx === 0 ? 'tier1' : bossIdx === 1 ? 'tier2' : 'tier3';
    const wavePool = WAVE_COMPOSITIONS[tier] || WAVE_COMPOSITIONS.tier1;

    // 2-4 mob waves before each boss
    const waveCount = 2 + Math.floor(Math.random() * 3);
    for (let w = 0; w < waveCount; w++) {
      const composition = wavePool[Math.floor(Math.random() * wavePool.length)];
      const difficultyMult = 1 + bossIdx * 0.5 + w * 0.1;

      // Determine loot table for mob waves
      const mobLootTable = `mob_wave_${tier}`;

      encounters.push({
        type: 'mob_wave',
        waveIndex: w,
        bossSection: bossIdx,
        difficulty: difficultyMult,
        composition: composition.mobs.map(m => ({
          template: m.t,
          count: m.count,
        })),
        lootTableId: mobLootTable,
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
