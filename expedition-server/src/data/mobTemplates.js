// ── Mob Templates for Expedition I ──
// Stats are base values, scaled by difficulty multiplier at spawn time

export const MOB_TEMPLATES = {
  // ── Basic Mobs (waves of 5-10) ──
  // ATK scaled to match character HP x8 & DEF x2 scaling
  slime: {
    name: 'Slime',
    type: 'basic',
    hp: 5000,
    atk: 350,
    def: 10,
    spd: 40,
    range: 60,
    attackInterval: 3.0,
  },
  skeleton: {
    name: 'Squelette',
    type: 'basic',
    hp: 8000,
    atk: 450,
    def: 20,
    spd: 50,
    range: 70,
    attackInterval: 2.8,
  },
  goblin: {
    name: 'Gobelin',
    type: 'basic',
    hp: 4000,
    atk: 500,
    def: 5,
    spd: 70,
    range: 50,
    attackInterval: 2.2,
  },

  // ── Elite Mobs (1-3 per wave) ──
  orc: {
    name: 'Orc',
    type: 'basic',
    hp: 30000,
    atk: 900,
    def: 40,
    spd: 35,
    range: 80,
    attackInterval: 2.5,
    elite: true,
  },
  golem: {
    name: 'Golem',
    type: 'basic',
    hp: 50000,
    atk: 700,
    def: 80,
    spd: 20,
    range: 70,
    attackInterval: 3.5,
    elite: true,
  },

  // ── Caster Mobs (ranged, stay back) ──
  dark_mage: {
    name: 'Mage Noir',
    type: 'basic',
    hp: 3000,
    atk: 800,
    def: 5,
    spd: 30,
    range: 350,
    attackInterval: 3.0,
    caster: true,
  },
};

// Wave composition by difficulty tier
export const WAVE_COMPOSITIONS = {
  // Before Boss 1 (easy)
  tier1: [
    { mobs: [{ t: 'slime', count: 5 }] },
    { mobs: [{ t: 'slime', count: 3 }, { t: 'skeleton', count: 2 }] },
    { mobs: [{ t: 'goblin', count: 4 }, { t: 'slime', count: 3 }] },
  ],
  // Before Boss 2 (medium)
  tier2: [
    { mobs: [{ t: 'skeleton', count: 5 }, { t: 'goblin', count: 3 }] },
    { mobs: [{ t: 'skeleton', count: 4 }, { t: 'orc', count: 1 }] },
    { mobs: [{ t: 'goblin', count: 5 }, { t: 'dark_mage', count: 2 }] },
    { mobs: [{ t: 'slime', count: 6 }, { t: 'orc', count: 1 }, { t: 'dark_mage', count: 1 }] },
  ],
  // Before Boss 3 (hard)
  tier3: [
    { mobs: [{ t: 'skeleton', count: 6 }, { t: 'orc', count: 2 }] },
    { mobs: [{ t: 'orc', count: 2 }, { t: 'dark_mage', count: 3 }] },
    { mobs: [{ t: 'golem', count: 1 }, { t: 'skeleton', count: 5 }, { t: 'dark_mage', count: 2 }] },
    { mobs: [{ t: 'orc', count: 3 }, { t: 'goblin', count: 4 }] },
  ],
};
