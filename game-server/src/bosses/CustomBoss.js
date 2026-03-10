// ── CustomBoss ──────────────────────────────────────────
// Generic boss entity that loads from a BossEditor config (JSONB).
// Extends BossBase with declarative phase/pattern system via PatternFactory.
// Does NOT touch Manaya.js or any hardcoded boss — fully independent.

import { BossBase } from './BossBase.js';
import { DIFFICULTY, BOSS as BOSS_CFG } from '../config.js';
import { buildPatterns } from './PatternFactory.js';

export class CustomBoss extends BossBase {
  /**
   * @param {Object} config - BossEditor config object (from custom_bosses.config JSONB)
   * @param {string} difficulty - Difficulty key ('NORMAL', 'HARD', etc.)
   * @param {number} x - Spawn X position
   * @param {number} y - Spawn Y position
   */
  constructor(config, difficulty, x, y) {
    const diff = DIFFICULTY[difficulty] || DIFFICULTY.NORMAL;

    const stats = {
      hp: Math.floor((config.hp || 15_000_000) * diff.hpMult),
      atk: Math.floor((config.atk || 450) * diff.dmgMult),
      def: config.def || 50,
      spd: Math.floor((config.spd || 140) * diff.spdMult),
    };

    super(config.name || 'Boss Custom', stats, x, y);

    this.difficulty = difficulty;
    this.diffMult = diff;
    this.customConfig = config;

    // Visual overrides
    this.radius = config.radius || BOSS_CFG.RADIUS;
    this.color = config.color || '#ef4444';
    this.spriteUrl = config.spriteUrl || null;
    this.mapBg = config.mapBg || null;

    // Auto-attack config
    if (config.autoAttack) {
      this._autoAttackInterval = config.autoAttack.interval || 2.0;
      this._autoAttackPower = config.autoAttack.power || 1.0;
      this._autoAttackRange = config.autoAttack.range || 120;
      this._autoAttackConeAngle = config.autoAttack.coneAngle || 60;
    }

    // Enrage config
    if (config.enrageTimer) {
      this._customEnrageTimer = config.enrageTimer;
    }

    // Phase thresholds — convert BossEditor format to BossBase format
    // BossEditor: [{ hpPercent: 100, label: 'Phase 1' }, { hpPercent: 60, label: 'Phase 2' }, ...]
    // BossBase: [{ hpPercent: 60, phase: 2, onEnter: fn }]
    this.phaseThresholds = (config.phases || [])
      .filter((_, i) => i > 0) // Skip phase 0 (always active)
      .map((p, i) => ({
        hpPercent: p.hpPercent,
        phase: i + 2, // Phase 2, 3, 4...
        onEnter: (boss, gs) => {
          gs.addEvent({
            type: 'boss_message',
            text: `⚡ ${boss.name} — ${p.label || `Phase ${i + 2}`} !`,
          });
          // Speed stack on major phase changes (phase 3+)
          if (i + 2 >= 3) boss.addSpeedStack();
        },
      }));

    // Build patterns from declarative definitions via PatternFactory
    this.patterns = buildPatterns(config.patterns);

    console.log(`[CustomBoss] Created "${this.name}" (${stats.hp.toLocaleString()} HP, ${this.patterns.length} patterns, ${this.phaseThresholds.length + 1} phases, ${difficulty})`);
  }
}
