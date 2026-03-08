// ─── Expedition v2 Boss Definitions (5 bosses) ───────────
// Real-time 2D combat (Manaya engine), progression left→right
//
// Balance target: 30 hunters with inscription stats
// Effective ATK after class mult: ~2000-15000 per hunter
// Expected total team DPS: ~500K-1M/sec
// Boss fights should last 3-8 minutes each
//
// Map layout: long horizontal map, scroll right
// [Spawn] → [Mobs] → [Boss 1] → [Camp] → [Mobs] → [Boss 2] → ... → [Boss 5]

export const BOSS_DEFINITIONS = [
  // ─── BOSS 1: Gardien de la Forêt ────────────────────────
  // Intro boss with real mechanics. Teaches dodging AoEs, lasers, adds.
  // Not punishing — damage is avoidable and moderate.
  {
    id: 'forest_guardian',
    name: 'Gardien de la Forêt',
    index: 0,
    hp: 400_000_000,
    atk: 12000,
    def: 200,
    spd: 45,
    radius: 80,
    color: '#22c55e',
    sprite: 'forest_guardian',
    enrageTimer: 480,
    phases: [
      { hpPercent: 100, label: 'Phase 1' },
      { hpPercent: 60, label: 'Phase 2 - Corruption' },
      { hpPercent: 30, label: 'Phase 3 - Rage de la Forêt' },
    ],
    patterns: [
      // ── Phase 1+ : Basic attacks ──
      // Frontal cone slam (narrow, frequent)
      {
        id: 'root_slam', name: 'Fracas Racinaire', type: 'cone_telegraph',
        power: 1.8, coneAngle: 70, range: 220,
        telegraphTime: 1.5, castTime: 0.4, recoveryTime: 0.8, cooldown: 5,
        phases: [0, 1, 2], weight: 3,
      },
      // AoE ring around boss — dodge away
      {
        id: 'vine_whip', name: 'Fouet de Lianes', type: 'aoe_ring',
        power: 1.2, innerRadius: 0, outerRadius: 280,
        telegraphTime: 1.8, castTime: 0.5, recoveryTime: 1.2, cooldown: 10,
        phases: [0, 1, 2], weight: 2, visualColor: 'blue',
      },
      // Targeted AoE circles on 3 random hunters
      {
        id: 'thorn_rain', name: 'Pluie d\'Épines', type: 'targeted_aoe_multi',
        power: 1.5, aoeRadius: 100, targetCount: 3,
        telegraphTime: 2.0, castTime: 0.5, recoveryTime: 1.0, cooldown: 12,
        phases: [0, 1, 2], weight: 2,
      },

      // ── Phase 2+ : New mechanics ──
      // Laser beam — green line from boss, tick damage
      {
        id: 'nature_laser', name: 'Rayon Sylvestre', type: 'laser',
        power: 1.0, range: 900, lineWidth: 60, duration: 2.5,
        telegraphTime: 1.5, castTime: 0.3, recoveryTime: 1.0, cooldown: 10,
        phases: [1, 2], weight: 2, laserColor: '#22c55e',
      },
      // Expanding wave — dodge through it
      {
        id: 'forest_wave', name: 'Onde Forestière', type: 'fire_wave',
        power: 1.0, maxRadius: 450, duration: 2.0,
        telegraphTime: 2.0, castTime: 0.5, recoveryTime: 1.0, cooldown: 15,
        phases: [1, 2], weight: 2, waveColor: '#22c55e',
      },
      // Poison DoT zone — persistent ground AoE
      {
        id: 'corruption_zone', name: 'Zone de Corruption', type: 'persistent_aoe',
        power: 0.8, aoeRadius: 150, duration: 8, tickInterval: 1.0,
        telegraphTime: 1.5, castTime: 0.3, recoveryTime: 0.8, cooldown: 14,
        phases: [1, 2], weight: 2,
      },
      // Speed debuff on 3 hunters — Roots slow them
      {
        id: 'root_bind', name: 'Emprise Racinaire', type: 'targeted_debuff',
        power: 0.5, targetCount: 3, debuffType: 'speed_down', debuffValue: 0.5, debuffDuration: 4,
        telegraphTime: 1.0, castTime: 0.3, recoveryTime: 0.8, cooldown: 18,
        phases: [1, 2], weight: 1,
      },
      // Spawn minion adds — all phases, frequent
      {
        id: 'call_minions', name: 'Appel de la Forêt', type: 'aoe_full',
        power: 0.8, telegraphTime: 2.0, castTime: 0.8, recoveryTime: 1.5,
        cooldown: 18, phases: [0, 1, 2], weight: 2,
        spawnsAdds: { type: 'minion', count: 3 },
      },

      // ── Phase 3 : Ultimate mechanics ──
      // Wide cone slam (punishing frontal)
      {
        id: 'ancient_slam', name: 'Fracas Ancestral', type: 'cone_telegraph',
        power: 2.5, coneAngle: 120, range: 300,
        telegraphTime: 1.2, castTime: 0.5, recoveryTime: 1.0, cooldown: 8,
        phases: [2], weight: 2,
      },
      // Triple laser sweep
      {
        id: 'triple_laser', name: 'Triple Rayon', type: 'laser',
        power: 1.2, range: 900, lineWidth: 50, duration: 3.0,
        telegraphTime: 1.2, castTime: 0.3, recoveryTime: 0.8, cooldown: 12,
        phases: [2], weight: 1, laserColor: '#16a34a',
      },
      // Big add wave
      {
        id: 'nature_wrath', name: 'Courroux de la Nature', type: 'aoe_full',
        power: 1.5, telegraphTime: 3.0, castTime: 0.8, recoveryTime: 1.5,
        cooldown: 35, phases: [2], weight: 1,
        spawnsAdds: { type: 'minion', count: 5 },
      },
    ],
    autoAttack: { power: 1.0, range: 120, interval: 2.5, hitbox: 'cone', coneAngle: 60 },
  },

  // ─── BOSS 2: Sentinelle de Pierre ────────────────────────
  // Tank check. Heavy frontal hits, blue AoE rings to dodge, spawns adds.
  // Boss stays anchored to center, returns after chasing.
  {
    id: 'stone_sentinel',
    name: 'Sentinelle de Pierre',
    index: 1,
    hp: 800_000_000,
    atk: 18000,
    def: 400,
    spd: 35,
    radius: 90,
    color: '#94a3b8',
    enrageTimer: 540,
    anchorCenter: true,  // Boss returns to center between patterns
    sprite: 'stone_sentinel',
    phases: [
      { hpPercent: 100, label: 'Phase 1' },
      { hpPercent: 60, label: 'Phase 2 - Fissure' },
      { hpPercent: 30, label: 'Phase 3 - Effondrement' },
    ],
    patterns: [
      // Frontal cone - narrow melee smash (frequent)
      {
        id: 'boulder_crush', name: 'Ecrasement de Roc', type: 'cone_telegraph',
        power: 2.5, coneAngle: 60, range: 180,
        telegraphTime: 1.2, castTime: 0.3, recoveryTime: 0.8, cooldown: 5,
        phases: [0, 1, 2], weight: 4,
      },
      // Wide frontal cone - heavy slam
      {
        id: 'seismic_slam', name: 'Impact Sismique', type: 'cone_telegraph',
        power: 3.5, coneAngle: 120, range: 250,
        telegraphTime: 2.0, castTime: 0.5, recoveryTime: 1.2, cooldown: 10,
        phases: [0, 1, 2], weight: 2,
      },
      // Blue AoE ring wave - expanding shockwave, must dodge
      {
        id: 'shockwave', name: 'Onde de Choc', type: 'aoe_ring',
        power: 2.0, innerRadius: 0, outerRadius: 350,
        telegraphTime: 2.0, castTime: 0.5, recoveryTime: 1.5, cooldown: 8,
        phases: [0, 1, 2], weight: 3,
        visualColor: 'blue', // Rendered as blue ring in spectator
      },
      // Targeted rocks on random hunters
      {
        id: 'rock_barrage', name: 'Barrage de Rochers', type: 'targeted_aoe_multi',
        power: 2.0, aoeRadius: 100, targetCount: 3,
        telegraphTime: 2.0, castTime: 0.5, recoveryTime: 1.0, cooldown: 12,
        phases: [0, 1, 2], weight: 2,
      },
      // Line attack through the arena
      {
        id: 'stone_wall', name: 'Mur de Pierre', type: 'line_telegraph',
        power: 4.0, lineWidth: 80, range: 800,
        telegraphTime: 1.2, castTime: 0.3, recoveryTime: 1.0, cooldown: 10,
        phases: [1, 2], weight: 2,
      },
      // Multiple expanding blue rings (Phase 2+)
      {
        id: 'tremor_waves', name: 'Vagues Sismiques', type: 'aoe_ring',
        power: 2.5, innerRadius: 100, outerRadius: 500,
        telegraphTime: 1.5, castTime: 0.5, recoveryTime: 1.0, cooldown: 15,
        phases: [1, 2], weight: 2,
        visualColor: 'blue',
      },
      // Donut - safe inside, lethal outside (Phase 3)
      {
        id: 'earthquake', name: 'Séisme', type: 'donut',
        power: 5.0, innerSafe: 150, outerRadius: 600,
        telegraphTime: 2.5, castTime: 0.5, recoveryTime: 1.5, cooldown: 25,
        phases: [2], weight: 1, isTrueDamage: true,
      },
      // Raid damage + spawn adds — all phases
      {
        id: 'avalanche', name: 'Avalanche', type: 'aoe_full',
        power: 1.5, telegraphTime: 2.5, castTime: 0.8, recoveryTime: 1.5,
        cooldown: 20, phases: [0, 1, 2], weight: 2,
        spawnsAdds: { type: 'stone_golem', count: 3 },
      },
      // Massive add spawn + quake (Phase 3)
      {
        id: 'crumbling_fortress', name: 'Effondrement', type: 'aoe_full',
        power: 3.0, telegraphTime: 3.5, castTime: 1.0, recoveryTime: 2.0,
        cooldown: 40, phases: [2], weight: 1,
        spawnsAdds: { type: 'stone_golem', count: 5 },
      },
    ],
    autoAttack: { power: 1.5, range: 110, interval: 2.5, hitbox: 'cone', coneAngle: 50 },
  },

  // ─── BOSS 3: Seigneur des Ombres ────────────────────────
  // Healer + DPS check. Purple-themed shadow boss.
  // Key mechanics: DPS check (boss heals if DPS too low), %HP attacks (dodge or die),
  // soul drain, shadow marks (spread mechanic), persistent corruption zones.
  // Colors: all purple (#7c3aed, #8b5cf6, #6d28d9)
  {
    id: 'shadow_lord',
    name: 'Seigneur des Ombres',
    index: 2,
    hp: 1_200_000_000,
    atk: 24000,
    def: 350,
    spd: 60,
    radius: 85,
    color: '#7c3aed',
    sprite: 'shadow_lord',
    enrageTimer: 540,
    phases: [
      { hpPercent: 100, label: 'Phase 1 - Éveil des Ombres' },
      { hpPercent: 70, label: 'Phase 2 - Corruption Profonde' },
      { hpPercent: 40, label: 'Phase 3 - Ténèbres Absolues' },
      { hpPercent: 15, label: 'Phase 4 - Désespoir' },
    ],
    patterns: [
      // ═══ PHASE 1+ : Core attacks (purple-themed) ═══

      // Frontal shadow slash — fast, frequent
      {
        id: 'shadow_slash', name: 'Entaille d\'Ombre', type: 'cone_telegraph',
        power: 2.2, coneAngle: 75, range: 260,
        telegraphTime: 0.9, castTime: 0.3, recoveryTime: 0.7, cooldown: 5,
        phases: [0, 1, 2, 3], weight: 3,
      },
      // Purple AoE ring — expands outward, applies shadow poison
      {
        id: 'dark_pulse', name: 'Onde Ténébreuse', type: 'aoe_ring',
        power: 1.8, innerRadius: 0, outerRadius: 320,
        telegraphTime: 1.3, castTime: 0.4, recoveryTime: 0.8, cooldown: 7,
        phases: [0, 1, 2, 3], weight: 2,
        appliesDebuff: { type: 'poison', damage: 600, duration: 8, tickInterval: 2 },
        visualColor: 'purple',
      },
      // Targeted AoE on 3 random hunters — purple circles
      {
        id: 'shadow_bolts', name: 'Bolides d\'Ombre', type: 'targeted_aoe_multi',
        power: 2.0, aoeRadius: 110, targetCount: 3,
        telegraphTime: 1.8, castTime: 0.4, recoveryTime: 0.8, cooldown: 9,
        phases: [0, 1, 2, 3], weight: 2,
      },
      // Spawn shadow wraith adds
      {
        id: 'call_shadows', name: 'Appel des Ombres', type: 'aoe_full',
        power: 0.6, telegraphTime: 2.0, castTime: 0.8, recoveryTime: 1.5,
        cooldown: 22, phases: [0, 1, 2, 3], weight: 2,
        spawnsAdds: { type: 'shadow_wraith', count: 3 },
      },

      // ═══ PHASE 2+ : DPS check + new mechanics ═══

      // DPS CHECK — Boss checks team DPS. If below 4M/s, heals 5% and deals raid damage.
      // If DPS is enough, boss is staggered (takes 2x damage for 5s).
      {
        id: 'shadow_judgment', name: 'Jugement des Ombres', type: 'dps_check',
        dpsThreshold: 4_000_000, healPercent: 5, failPower: 1.5,
        staggerDuration: 5, staggerDefMult: 0.5,
        telegraphTime: 3.0, castTime: 1.0, recoveryTime: 2.0,
        cooldown: 45, phases: [1, 2, 3], weight: 2,
      },
      // Purple laser beam
      {
        id: 'shadow_beam', name: 'Rayon d\'Ombre', type: 'laser',
        power: 1.2, range: 900, lineWidth: 70, duration: 2.5,
        telegraphTime: 1.5, castTime: 0.3, recoveryTime: 1.0, cooldown: 12,
        phases: [1, 2, 3], weight: 2, laserColor: '#8b5cf6',
      },
      // Persistent corruption zone — purple ground AoE
      {
        id: 'corruption_zone', name: 'Zone de Corruption', type: 'persistent_aoe',
        power: 1.2, aoeRadius: 170, duration: 10, tickInterval: 1.0,
        telegraphTime: 1.5, castTime: 0.3, recoveryTime: 0.8, cooldown: 14,
        phases: [1, 2, 3], weight: 2,
      },
      // Shadow bind — slows 4 hunters
      {
        id: 'shadow_bind', name: 'Liens d\'Ombre', type: 'targeted_debuff',
        power: 0.5, targetCount: 4, debuffType: 'speed_down', debuffValue: 0.7, debuffDuration: 5,
        telegraphTime: 1.0, castTime: 0.3, recoveryTime: 0.8, cooldown: 18,
        phases: [1, 2, 3], weight: 1,
      },

      // ═══ PHASE 3+ : Lethal mechanics ═══

      // % HP ATTACK — Devastating shadow nova. If not dodged, sets HP to 15%.
      // Dodgeable — must dodge or tank shield. Healers must react fast after.
      {
        id: 'annihilation', name: 'Annihilation d\'Ombre', type: 'percent_hp_attack',
        targetHpPercent: 15, outerRadius: 450, innerSafe: 0,
        telegraphTime: 2.5, castTime: 0.6, recoveryTime: 2.0,
        cooldown: 30, phases: [2, 3], weight: 2,
      },
      // SOUL DRAIN — Channels for 4s, draining 3% max HP per tick from all hunters.
      // Boss heals 2x what it drains. Must burn boss HP fast during this phase.
      {
        id: 'soul_drain', name: 'Drain d\'Âme', type: 'soul_drain',
        drainPercent: 3, duration: 4, tickInterval: 0.5, healMultiplier: 2,
        telegraphTime: 2.0, castTime: 0.5, recoveryTime: 1.5,
        cooldown: 35, phases: [2, 3], weight: 1,
      },
      // Shadow marks — marks 4 hunters, they explode after 3s dealing AoE to nearby allies.
      // Forces spread mechanic.
      {
        id: 'shadow_mark', name: 'Marque des Ombres', type: 'shadow_mark',
        power: 2.5, targetCount: 4, explodeRadius: 130, markDuration: 3,
        telegraphTime: 1.5, castTime: 0.3, recoveryTime: 1.0,
        cooldown: 20, phases: [2, 3], weight: 2,
      },
      // Expanding purple wave — dodge through or die
      {
        id: 'shadow_wave', name: 'Vague d\'Ombre', type: 'fire_wave',
        power: 2.0, maxRadius: 550, duration: 2.5,
        telegraphTime: 2.0, castTime: 0.5, recoveryTime: 1.0, cooldown: 16,
        phases: [2, 3], weight: 2, waveColor: '#7c3aed',
      },

      // ═══ PHASE 4 (15% HP): Desperation ═══

      // Wide cone massacre
      {
        id: 'dark_massacre', name: 'Massacre Ténébreux', type: 'cone_telegraph',
        power: 3.5, coneAngle: 140, range: 350,
        telegraphTime: 1.0, castTime: 0.4, recoveryTime: 0.8, cooldown: 7,
        phases: [3], weight: 3,
      },
      // Double DPS check — harder threshold, more healing
      {
        id: 'final_judgment', name: 'Jugement Final', type: 'dps_check',
        dpsThreshold: 5_000_000, healPercent: 8, failPower: 2.0,
        staggerDuration: 6, staggerDefMult: 0.4,
        telegraphTime: 3.5, castTime: 1.0, recoveryTime: 2.0,
        cooldown: 40, phases: [3], weight: 2,
      },
      // % HP ATTACK — Even worse version, sets to 5% HP, donut (safe inside)
      {
        id: 'void_collapse', name: 'Effondrement du Vide', type: 'percent_hp_attack',
        targetHpPercent: 5, outerRadius: 600, innerSafe: 140,
        telegraphTime: 2.0, castTime: 0.5, recoveryTime: 1.5,
        cooldown: 35, phases: [3], weight: 1,
        isTrueDamage: true,
      },
      // Massive add spawn + raid damage
      {
        id: 'void_eruption', name: 'Eruption du Néant', type: 'aoe_full',
        power: 2.5, telegraphTime: 3.0, castTime: 0.8, recoveryTime: 1.5,
        cooldown: 40, phases: [3], weight: 1,
        spawnsAdds: { type: 'shadow_wraith', count: 5 },
      },
    ],
    autoAttack: { power: 1.3, range: 110, interval: 1.8, hitbox: 'cone', coneAngle: 65 },
  },

  // ─── BOSS 4: Manaya ──────────────────────────────────────
  // Full mechanics from Manaya raid (donut, death ball, triple debuff, etc.)
  {
    id: 'manaya',
    name: 'Manaya',
    index: 3,
    hp: 2_500_000_000,
    atk: 28000,
    def: 350,
    spd: 60,
    radius: 75,
    color: '#ec4899',
    enrageTimer: 600,
    phases: [
      { hpPercent: 100, label: 'Phase 1' },
      { hpPercent: 90, label: 'Phase 2' },
      { hpPercent: 75, label: 'Phase 3' },
      { hpPercent: 50, label: 'Phase 4' },
      { hpPercent: 30, label: 'Phase 5' },
      { hpPercent: 20, label: 'Phase 6 - Dernier Souffle' },
    ],
    useManayaPatterns: true,
    autoAttack: { power: 1.5, range: 100, interval: 1.5, hitbox: 'cone', coneAngle: 60 },
  },

  // ─── BOSS 5: Ragnaros ────────────────────────────────────
  // Final boss. Massive HP, fire themed, "BY FIRE BE PURGED!"
  {
    id: 'ragnaros',
    name: 'Ragnaros',
    index: 4,
    hp: 4_000_000_000,
    atk: 35000,
    def: 500,
    spd: 50,
    radius: 100,
    color: '#f97316',
    enrageTimer: 720,
    phases: [
      { hpPercent: 100, label: 'Phase 1 - Emergence' },
      { hpPercent: 80, label: 'Phase 2 - Lave' },
      { hpPercent: 60, label: 'Phase 3 - Fournaise' },
      { hpPercent: 40, label: 'Phase 4 - Eruption' },
      { hpPercent: 20, label: 'Phase 5 - Apocalypse' },
    ],
    patterns: [
      {
        id: 'magma_slam', name: 'Fracas de Magma', type: 'cone_telegraph',
        power: 3.0, coneAngle: 100, range: 300,
        telegraphTime: 1.0, castTime: 0.4, recoveryTime: 0.8, cooldown: 4,
        phases: [0, 1, 2, 3, 4], weight: 3,
      },
      {
        id: 'lava_wave', name: 'Vague de Lave', type: 'line_telegraph',
        power: 4.0, lineWidth: 120, range: 1000,
        telegraphTime: 1.5, castTime: 0.3, recoveryTime: 1.0, cooldown: 8,
        phases: [0, 1, 2, 3, 4], weight: 2,
      },
      {
        id: 'meteor_shower', name: 'Pluie de Météores', type: 'targeted_aoe_multi',
        power: 3.5, aoeRadius: 120, targetCount: 6,
        telegraphTime: 1.8, castTime: 0.5, recoveryTime: 0.5, cooldown: 10,
        phases: [1, 2, 3, 4], weight: 2,
      },
      {
        id: 'lava_floor', name: 'Sol de Lave', type: 'persistent_aoe',
        power: 1.5, aoeRadius: 200, duration: 10, tickInterval: 1.0,
        telegraphTime: 2.0, cooldown: 15, phases: [2, 3, 4], weight: 2,
      },
      {
        id: 'fire_donut', name: 'Anneau de Feu', type: 'donut',
        power: 6.0, innerSafe: 180, outerRadius: 650,
        telegraphTime: 2.0, castTime: 0.5, recoveryTime: 1.5, cooldown: 25,
        phases: [3, 4], weight: 1, isTrueDamage: true,
      },
      {
        id: 'eruption_supreme', name: 'Eruption Suprême', type: 'aoe_full',
        power: 5.0, telegraphTime: 3.5, castTime: 1.0, recoveryTime: 2.0,
        cooldown: 30, phases: [4], weight: 1,
        spawnsAdds: { type: 'elite', count: 2 },
      },
      {
        id: 'by_fire_be_purged', name: 'PAR LE FEU, SOYEZ PURIFIÉS !',
        type: 'ultimate_wipe', power: 999999,
        telegraphTime: 5.0, castTime: 1.0, recoveryTime: 3.0,
        cooldown: 60, phases: [4], weight: 0.5,
        isTrueDamage: true, requiresSurvival: 10,
      },
    ],
    autoAttack: { power: 2.0, range: 120, interval: 2.0, hitbox: 'cone', coneAngle: 70 },
  },
];

export function getBossDefinition(index) {
  return BOSS_DEFINITIONS[index] || null;
}

export function getAllBossIds() {
  return BOSS_DEFINITIONS.map(b => b.id);
}
