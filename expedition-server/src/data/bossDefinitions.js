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
    hp: 1_300_000_000,
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
    hp: 2_600_000_000,
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
    hp: 3_900_000_000,
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

      // % HP ATTACK — Devastating shadow nova. If not dodged, sets HP to 10%.
      // Dodgeable — must dodge or tank shield. Healers must react fast after.
      {
        id: 'annihilation', name: 'Annihilation d\'Ombre', type: 'percent_hp_attack',
        targetHpPercent: 10, outerRadius: 450, innerSafe: 0,
        telegraphTime: 3.0, castTime: 0.6, recoveryTime: 2.0,
        cooldown: 35, phases: [2, 3], weight: 1,
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
  // Full mechanics from Manaya raid. Pink/corruption theme.
  // 6 phases, donut, death ball, poison, dive, triple debuff rotation, DPS check shield.
  {
    id: 'manaya',
    name: 'Manaya',
    index: 3,
    hp: 11_375_000_000,
    atk: 28000,
    def: 350,
    spd: 60,
    radius: 75,
    color: '#ec4899',
    sprite: 'manaya',
    enrageTimer: 600,
    anchorCenter: true,
    phases: [
      { hpPercent: 100, label: 'Phase 1 - Éveil' },
      { hpPercent: 90, label: 'Phase 2 - Corruption' },
      { hpPercent: 75, label: 'Phase 3 - Rage Froide' },
      { hpPercent: 50, label: 'Phase 4 - Accélération' },
      { hpPercent: 30, label: 'Phase 5 - Furie' },
      { hpPercent: 20, label: 'Phase 6 - Dernier Souffle' },
    ],
    patterns: [
      // ═══ PHASE 1+ (100-90%) : Core melee attacks ═══

      // Frontal cone — fast, frequent. Main tank-threat ability.
      {
        id: 'souffle_frontal', name: 'Souffle Frontal', type: 'cone_telegraph',
        power: 2.0, coneAngle: 90, range: 220,
        telegraphTime: 0.8, castTime: 0.3, recoveryTime: 0.5, cooldown: 4,
        phases: [0, 1, 2, 3, 4, 5], weight: 3,
      },
      // Rear sweep — punishes melee DPS standing behind boss
      {
        id: 'balayage_queue', name: 'Balayage de Queue', type: 'cone_telegraph',
        power: 2.5, coneAngle: 110, range: 200,
        telegraphTime: 0.6, castTime: 0.2, recoveryTime: 0.4, cooldown: 6,
        phases: [0, 1, 2, 3, 4, 5], weight: 2,
      },
      // Wide sustained breath — multi-tick implied by lingering AoE
      {
        id: 'souffle_corrompu', name: 'Souffle Corrompu', type: 'cone_telegraph',
        power: 2.0, coneAngle: 130, range: 280,
        telegraphTime: 1.2, castTime: 0.5, recoveryTime: 0.8, cooldown: 8,
        phases: [0, 1, 2, 3, 4, 5], weight: 2,
        appliesDebuff: { type: 'poison', damage: 800, duration: 8, tickInterval: 2 },
      },
      // Targeted AoE on 2 hunters
      {
        id: 'griffe_multi', name: 'Griffes Multiples', type: 'targeted_aoe_multi',
        power: 1.8, aoeRadius: 90, targetCount: 2,
        telegraphTime: 1.0, castTime: 0.3, recoveryTime: 0.6, cooldown: 6,
        phases: [0, 1, 2, 3, 4, 5], weight: 2,
      },

      // ═══ PHASE 2+ (90-75%) : Donut + Poison ═══

      // Double Donut — faithful to real Manaya. 2-phase ring mechanic.
      // Phase 1: ring 130-350px OS. Safe <120px or >360px.
      // Phase 2 (1.2s later): outer ring 370-550px OS + laser <160px.
      // Safe zone phase 2: 160-370px.
      {
        id: 'anneau_destructeur', name: 'Anneau Destructeur', type: 'double_donut',
        power: 999, telegraphTime: 2.5, castTime: 0.3, recoveryTime: 0.8, cooldown: 14,
        phases: [1, 2, 3, 4, 5], weight: 3, isTrueDamage: true,
      },
      // Poison circle — persistent ground AoE on random hunter position
      {
        id: 'cercle_poison', name: 'Cercle Empoisonné', type: 'persistent_aoe',
        power: 0.8, aoeRadius: 120, duration: 12, tickInterval: 1.0,
        telegraphTime: 0.8, castTime: 0.3, recoveryTime: 0.5, cooldown: 10,
        phases: [1, 2, 3, 4, 5], weight: 2,
      },
      // Spawn minor adds
      {
        id: 'appel_serviteurs', name: 'Appel de Serviteurs', type: 'aoe_full',
        power: 0.5, telegraphTime: 2.0, castTime: 0.8, recoveryTime: 1.5,
        cooldown: 25, phases: [1, 2, 3, 4, 5], weight: 1,
        spawnsAdds: { type: 'minion', count: 3 },
      },

      // ═══ PHASE 3+ (75-50%) : Death Ball + Dive + Waves + Triple Laser ═══

      // Death ball — exact Manaya Sphère de Mort. Radius 250, dodge or die.
      {
        id: 'sphere_mort', name: 'Sphère de Mort', type: 'aoe_ring',
        power: 5.0, innerRadius: 0, outerRadius: 250,
        telegraphTime: 2.5, castTime: 0.5, recoveryTime: 1.5, cooldown: 20,
        phases: [2, 3, 4, 5], weight: 2, isTrueDamage: true,
        visualColor: 'pink',
      },
      // Menacing wave — expanding ring, dodge through
      {
        id: 'vague_menacante', name: 'Vague Menaçante', type: 'fire_wave',
        power: 2.0, maxRadius: 500, duration: 2.0,
        telegraphTime: 1.5, castTime: 0.5, recoveryTime: 1.0, cooldown: 14,
        phases: [2, 3, 4, 5], weight: 2, waveColor: '#ec4899',
      },
      // Dive — targeted AoE on 4 hunters (boss dives at them)
      {
        id: 'plongeon', name: 'Plongeon Corrompu', type: 'targeted_aoe_multi',
        power: 2.0, aoeRadius: 110, targetCount: 4,
        telegraphTime: 1.8, castTime: 0.4, recoveryTime: 1.0, cooldown: 14,
        phases: [2, 3, 4, 5], weight: 2,
      },
      // Triple laser sweep
      {
        id: 'triple_laser', name: 'Triple Laser', type: 'laser',
        power: 1.5, range: 900, lineWidth: 55, duration: 3.0,
        telegraphTime: 1.5, castTime: 0.3, recoveryTime: 0.8, cooldown: 12,
        phases: [2, 3, 4, 5], weight: 2, laserColor: '#ec4899',
      },
      // Leap slam — heavy frontal + shockwave
      {
        id: 'impact_sismique', name: 'Impact Sismique', type: 'aoe_ring',
        power: 2.0, innerRadius: 0, outerRadius: 280,
        telegraphTime: 1.5, castTime: 0.3, recoveryTime: 0.8, cooldown: 12,
        phases: [2, 3, 4, 5], weight: 2,
      },

      // ═══ PHASE 4+ (50-30%) : Laser + Double Circle + Shield ═══

      // Single sustained laser
      {
        id: 'laser_simple', name: 'Rayon Corrompu', type: 'laser',
        power: 1.2, range: 800, lineWidth: 65, duration: 2.5,
        telegraphTime: 1.2, castTime: 0.3, recoveryTime: 0.8, cooldown: 8,
        phases: [3, 4, 5], weight: 2, laserColor: '#f472b6',
      },
      // Double circle — two AoE rings expanding simultaneously
      {
        id: 'double_cercle', name: 'Double Cercle', type: 'targeted_aoe_multi',
        power: 2.5, aoeRadius: 130, targetCount: 5,
        telegraphTime: 2.0, castTime: 0.4, recoveryTime: 1.0, cooldown: 16,
        phases: [3, 4, 5], weight: 2,
      },
      // Shield DPS check — boss shields, team must break it
      {
        id: 'bouclier_corrompu', name: 'Bouclier Corrompu', type: 'dps_check',
        dpsThreshold: 4_500_000, healPercent: 6, failPower: 2.0,
        staggerDuration: 5, staggerDefMult: 0.5,
        telegraphTime: 2.5, castTime: 1.0, recoveryTime: 2.0,
        cooldown: 40, phases: [3, 4, 5], weight: 1,
      },

      // ═══ PHASE 5+ (30-20%) : Rage Buff + Shadow Marks ═══

      // Rage buff — boss buffs itself, healers must cleanse
      {
        id: 'buff_rage', name: 'Fureur de Manaya', type: 'aoe_full',
        power: 1.5, telegraphTime: 1.0, castTime: 0.5, recoveryTime: 1.0,
        cooldown: 18, phases: [4, 5], weight: 2,
        spawnsAdds: { type: 'elite', count: 1 },
      },
      // Shadow marks — marked hunters explode, spread mechanic
      {
        id: 'marques_corruption', name: 'Marques de Corruption', type: 'shadow_mark',
        power: 2.0, targetCount: 4, explodeRadius: 120, markDuration: 4,
        telegraphTime: 1.5, castTime: 0.3, recoveryTime: 1.0,
        cooldown: 22, phases: [4, 5], weight: 2,
      },

      // ═══ PHASE 6 (20%) : Trinité des Marques + Desperation ═══

      // Triple debuff rotation — percent HP attack + poison + slow (rare, devastating)
      {
        id: 'trinite_marques', name: 'Trinité des Marques', type: 'percent_hp_attack',
        targetHpPercent: 10, outerRadius: 500, innerSafe: 0,
        telegraphTime: 3.0, castTime: 0.6, recoveryTime: 2.0,
        cooldown: 40, phases: [5], weight: 1,
      },
      // Mass debuff — slow + poison on everyone
      {
        id: 'corruption_totale', name: 'Corruption Totale', type: 'targeted_debuff',
        power: 1.0, targetCount: 8, debuffType: 'speed_down', debuffValue: 0.6, debuffDuration: 5,
        telegraphTime: 1.5, castTime: 0.3, recoveryTime: 0.8, cooldown: 20,
        phases: [5], weight: 2,
      },
      // Soul drain — channels and heals, team must burn
      {
        id: 'drain_ame', name: 'Drain d\'Âme', type: 'soul_drain',
        drainPercent: 3, duration: 4, tickInterval: 0.5, healMultiplier: 2,
        telegraphTime: 2.0, castTime: 0.5, recoveryTime: 1.5,
        cooldown: 30, phases: [5], weight: 1,
      },
      // Final add wave
      {
        id: 'appel_final', name: 'Appel du Néant', type: 'aoe_full',
        power: 2.0, telegraphTime: 3.0, castTime: 0.8, recoveryTime: 1.5,
        cooldown: 35, phases: [5], weight: 1,
        spawnsAdds: { type: 'elite', count: 3 },
      },
    ],
    autoAttack: { power: 1.5, range: 100, interval: 1.5, hitbox: 'cone', coneAngle: 60 },
  },

  // ─── BOSS 5: Ragnaros ────────────────────────────────────
  // Final boss. Massive HP, fire themed. Inspired by expedition2-server Ragnaros.
  // Mechanics: shield, soak circles, heal cast, rotating laser, marks, fissures, tornados.
  // Map: volcanic arena with lava and pillars.
  {
    id: 'ragnaros',
    name: 'Ragnaros',
    index: 4,
    hp: 9_100_000_000,
    atk: 35000,
    def: 500,
    spd: 50,
    radius: 100,
    color: '#f97316',
    sprite: 'ragnaros',
    enrageTimer: 720,
    anchorCenter: true,
    mapBg: 'https://api.builderberu.com/cdn/images/Paysage5emeBoss_jleab4.webp',
    phases: [
      { hpPercent: 100, label: 'Phase 1 - Émergence' },
      { hpPercent: 80, label: 'Phase 2 - Lave' },
      { hpPercent: 60, label: 'Phase 3 - Fournaise' },
      { hpPercent: 40, label: 'Phase 4 - Éruption' },
      { hpPercent: 20, label: 'Phase 5 - Apocalypse' },
    ],
    patterns: [
      // ═══ PHASE 1+ : Core attacks (all phases) ═══

      // Frontal cone slam — heavy, frequent
      {
        id: 'magma_slam', name: 'Fracas de Magma', type: 'cone_telegraph',
        power: 3.0, coneAngle: 100, range: 300,
        telegraphTime: 1.0, castTime: 0.4, recoveryTime: 0.8, cooldown: 4,
        phases: [0, 1, 2, 3, 4], weight: 3,
      },
      // Line attack — lava wave across arena
      {
        id: 'lava_wave', name: 'Vague de Lave', type: 'line_telegraph',
        power: 4.0, lineWidth: 120, range: 1000,
        telegraphTime: 1.5, castTime: 0.3, recoveryTime: 1.0, cooldown: 8,
        phases: [0, 1, 2, 3, 4], weight: 2,
      },
      // Targeted AoE on random hunters — fireballs
      {
        id: 'multi_fireball', name: 'Salve de Feu', type: 'targeted_aoe_multi',
        power: 2.5, aoeRadius: 100, targetCount: 3,
        telegraphTime: 1.5, castTime: 0.4, recoveryTime: 0.8, cooldown: 7,
        phases: [0, 1, 2, 3, 4], weight: 2,
      },

      // ═══ PHASE 2+ (80%) : Meteor + Persistent fire + Adds ═══

      // Meteor shower — AoE circles on 6 hunters
      {
        id: 'meteor_shower', name: 'Pluie de Météores', type: 'targeted_aoe_multi',
        power: 3.5, aoeRadius: 120, targetCount: 6,
        telegraphTime: 1.8, castTime: 0.5, recoveryTime: 0.5, cooldown: 12,
        phases: [1, 2, 3, 4], weight: 2,
      },
      // Persistent lava pool on ground
      {
        id: 'lava_pool', name: 'Mare de Lave', type: 'persistent_aoe',
        power: 1.5, aoeRadius: 180, duration: 12, tickInterval: 1.0,
        telegraphTime: 1.5, castTime: 0.3, recoveryTime: 0.8, cooldown: 14,
        phases: [1, 2, 3, 4], weight: 2,
      },
      // Expanding fire wave — dodge through
      {
        id: 'fire_wave', name: 'Vague de Feu', type: 'fire_wave',
        power: 2.0, maxRadius: 550, duration: 2.5,
        telegraphTime: 2.0, castTime: 0.5, recoveryTime: 1.0, cooldown: 16,
        phases: [1, 2, 3, 4], weight: 2, waveColor: '#f97316',
      },
      // Spawn fire elemental adds — explode if not killed, drain mana
      {
        id: 'serviteurs_feu', name: 'Serviteurs de Feu', type: 'aoe_full',
        power: 0.8, telegraphTime: 2.0, castTime: 0.8, recoveryTime: 1.5,
        cooldown: 22, phases: [1, 2, 3, 4], weight: 1,
        spawnsAdds: { type: 'fire_elemental', count: 3 },
      },

      // ═══ PHASE 3+ (60%) : Shield + Mark + Soak + Heal Cast ═══

      // Shield DPS check — higher threshold than Manaya
      {
        id: 'carapace_magma', name: 'Carapace de Magma', type: 'dps_check',
        dpsThreshold: 5_000_000, healPercent: 7, failPower: 2.5,
        staggerDuration: 6, staggerDefMult: 0.4,
        telegraphTime: 2.5, castTime: 1.0, recoveryTime: 2.0,
        cooldown: 35, phases: [2, 3, 4], weight: 2,
      },
      // Player mark — marked hunter explodes, spread mechanic
      {
        id: 'marque_feu', name: 'Marque de Feu', type: 'shadow_mark',
        power: 3.5, targetCount: 3, explodeRadius: 150, markDuration: 4,
        telegraphTime: 1.5, castTime: 0.3, recoveryTime: 1.0,
        cooldown: 20, phases: [2, 3, 4], weight: 2,
      },
      // Soak circles — hunters must stand in them or raid takes damage
      {
        id: 'fissures_soak', name: 'Fissures de Lave', type: 'soak_circles',
        power: 2.0, circleCount: 3, circleRadius: 80, soakDuration: 6,
        failDamagePercent: 20,
        telegraphTime: 2.0, castTime: 0.5, recoveryTime: 1.0, cooldown: 25,
        phases: [2, 3, 4], weight: 1,
      },
      // Heal cast — boss channels a heal, must be interrupted by damage
      {
        id: 'flamme_guerison', name: 'Flamme Guérisseuse', type: 'heal_cast',
        healPercent: 8, channelDuration: 5, damageToInterrupt: 5_000_000,
        telegraphTime: 1.5, castTime: 0.5, recoveryTime: 1.5, cooldown: 40,
        phases: [2, 3, 4], weight: 1,
      },
      // Fire laser beam
      {
        id: 'rayon_magma', name: 'Rayon de Magma', type: 'laser',
        power: 1.5, range: 900, lineWidth: 70, duration: 2.5,
        telegraphTime: 1.5, castTime: 0.3, recoveryTime: 1.0, cooldown: 10,
        phases: [2, 3, 4], weight: 2, laserColor: '#f97316',
      },

      // ═══ PHASE 4+ (40%) : Donut + Rotating Laser + Elite Adds ═══

      // Fire donut — true damage, stay inside or take massive damage
      {
        id: 'fire_donut', name: 'Anneau de Feu', type: 'donut',
        power: 5.0, innerSafe: 200, outerRadius: 600,
        telegraphTime: 2.5, castTime: 0.5, recoveryTime: 1.5, cooldown: 28,
        phases: [3, 4], weight: 1, isTrueDamage: true,
      },
      // Rotating laser — sweeps around boss
      {
        id: 'laser_rotatif', name: 'Laser Rotatif', type: 'rotating_laser',
        power: 1.5, range: 800, lineWidth: 60, duration: 5.0, rotationSpeed: 1.2,
        telegraphTime: 2.0, castTime: 0.3, recoveryTime: 1.0, cooldown: 22,
        phases: [3, 4], weight: 1, laserColor: '#ef4444',
      },
      // Heavy percent HP attack — sets to 10%, rare
      {
        id: 'souffle_purificateur', name: 'Souffle Purificateur', type: 'percent_hp_attack',
        targetHpPercent: 10, outerRadius: 500, innerSafe: 0,
        telegraphTime: 3.0, castTime: 0.6, recoveryTime: 2.0, cooldown: 45,
        phases: [3, 4], weight: 0.5,
      },
      // Elite fire elemental spawn — bigger, tougher, longer fuse
      {
        id: 'eruption_supreme', name: 'Éruption Suprême', type: 'aoe_full',
        power: 3.0, telegraphTime: 3.0, castTime: 1.0, recoveryTime: 2.0,
        cooldown: 30, phases: [3, 4], weight: 1,
        spawnsAdds: { type: 'fire_elemental', count: 4 },
      },

      // ═══ PHASE 5 (20%) : Ultimate Mechanics ═══

      // "BY FIRE BE PURGED!" — massive raid damage, must survive with cooldowns
      {
        id: 'by_fire_be_purged', name: 'PAR LE FEU, SOYEZ PURIFIÉS !',
        type: 'ultimate_wipe', power: 999999,
        telegraphTime: 5.0, castTime: 1.0, recoveryTime: 3.0,
        cooldown: 90, phases: [4], weight: 0.3,
        isTrueDamage: true, requiresSurvival: 10,
      },
      // Double donut — safe zone is a narrow ring between two lethal zones
      {
        id: 'double_anneau', name: 'Double Anneau de Feu', type: 'donut',
        power: 5.0, innerSafe: 250, outerRadius: 650,
        telegraphTime: 3.0, castTime: 0.5, recoveryTime: 1.0, cooldown: 28,
        phases: [4], weight: 1, isTrueDamage: true,
      },
      // Soul drain — fire version, heals boss massively
      {
        id: 'drain_flamme', name: 'Drain de Flammes', type: 'soul_drain',
        drainPercent: 4, duration: 5, tickInterval: 0.5, healMultiplier: 3,
        telegraphTime: 2.0, castTime: 0.5, recoveryTime: 1.5,
        cooldown: 35, phases: [4], weight: 1,
      },
      // Mass debuff — burn + slow on everyone
      {
        id: 'purification_totale', name: 'Purification Totale', type: 'targeted_debuff',
        power: 1.5, targetCount: 10, debuffType: 'speed_down', debuffValue: 0.5, debuffDuration: 6,
        telegraphTime: 1.5, castTime: 0.3, recoveryTime: 0.8, cooldown: 18,
        phases: [4], weight: 2,
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
