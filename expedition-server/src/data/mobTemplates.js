// ── Mob Templates for Expedition I ──
// Stats are base values, scaled by difficulty multiplier at spawn time

export const MOB_TEMPLATES = {
  // ── Basic Mobs (waves of 20-35) ──
  // ATK scaled to match character HP x8 & DEF x2 scaling
  slime: {
    name: 'Slime',
    type: 'basic',
    hp: 25000,
    atk: 450,
    def: 15,
    spd: 40,
    range: 60,
    attackInterval: 3.0,
  },
  skeleton: {
    name: 'Squelette',
    type: 'basic',
    hp: 35000,
    atk: 550,
    def: 30,
    spd: 50,
    range: 70,
    attackInterval: 2.8,
  },
  goblin: {
    name: 'Gobelin',
    type: 'basic',
    hp: 20000,
    atk: 600,
    def: 10,
    spd: 70,
    range: 50,
    attackInterval: 2.2,
  },

  // ── Elite Mobs (3-6 per wave) ──
  orc: {
    name: 'Orc',
    type: 'basic',
    hp: 120000,
    atk: 1100,
    def: 60,
    spd: 35,
    range: 80,
    attackInterval: 2.5,
    elite: true,
  },
  golem: {
    name: 'Golem',
    type: 'basic',
    hp: 200000,
    atk: 900,
    def: 120,
    spd: 20,
    range: 70,
    attackInterval: 3.5,
    elite: true,
  },

  // ── Caster Mobs (ranged, stay back) ──
  dark_mage: {
    name: 'Mage Noir',
    type: 'basic',
    hp: 15000,
    atk: 1000,
    def: 10,
    spd: 30,
    range: 350,
    attackInterval: 3.0,
    caster: true,
  },
};

// Wave composition by difficulty tier (large waves!)
export const WAVE_COMPOSITIONS = {
  // Before Boss 1 (easy) - big swarms of weak mobs
  tier1: [
    { mobs: [{ t: 'slime', count: 25 }] },
    { mobs: [{ t: 'slime', count: 18 }, { t: 'skeleton', count: 10 }] },
    { mobs: [{ t: 'goblin', count: 16 }, { t: 'slime', count: 14 }] },
    { mobs: [{ t: 'slime', count: 20 }, { t: 'goblin', count: 12 }] },
    { mobs: [{ t: 'skeleton', count: 14 }, { t: 'goblin', count: 14 }, { t: 'slime', count: 8 }] },
  ],
  // Before Boss 2 (medium) - tougher + elites
  tier2: [
    { mobs: [{ t: 'skeleton', count: 20 }, { t: 'goblin', count: 14 }] },
    { mobs: [{ t: 'skeleton', count: 16 }, { t: 'orc', count: 6 }] },
    { mobs: [{ t: 'goblin', count: 18 }, { t: 'dark_mage', count: 8 }] },
    { mobs: [{ t: 'slime', count: 22 }, { t: 'orc', count: 5 }, { t: 'dark_mage', count: 5 }] },
    { mobs: [{ t: 'orc', count: 8 }, { t: 'skeleton', count: 18 }] },
    { mobs: [{ t: 'goblin', count: 16 }, { t: 'skeleton', count: 14 }, { t: 'dark_mage', count: 6 }] },
  ],
  // Before Boss 3-5 (hard) - elite hordes + casters
  tier3: [
    { mobs: [{ t: 'skeleton', count: 22 }, { t: 'orc', count: 8 }] },
    { mobs: [{ t: 'orc', count: 10 }, { t: 'dark_mage', count: 8 }] },
    { mobs: [{ t: 'golem', count: 5 }, { t: 'skeleton', count: 18 }, { t: 'dark_mage', count: 8 }] },
    { mobs: [{ t: 'orc', count: 10 }, { t: 'goblin', count: 18 }] },
    { mobs: [{ t: 'golem', count: 4 }, { t: 'orc', count: 8 }, { t: 'dark_mage', count: 8 }, { t: 'skeleton', count: 12 }] },
    { mobs: [{ t: 'golem', count: 6 }, { t: 'orc', count: 6 }, { t: 'dark_mage', count: 10 }] },
  ],
  // Before Boss 10+ (brutal) - all elites, max casters
  tier4: [
    { mobs: [{ t: 'golem', count: 8 }, { t: 'orc', count: 10 }, { t: 'dark_mage', count: 10 }] },
    { mobs: [{ t: 'orc', count: 14 }, { t: 'dark_mage', count: 12 }] },
    { mobs: [{ t: 'golem', count: 10 }, { t: 'dark_mage', count: 12 }] },
    { mobs: [{ t: 'golem', count: 6 }, { t: 'orc', count: 12 }, { t: 'dark_mage', count: 10 }, { t: 'skeleton', count: 14 }] },
    { mobs: [{ t: 'orc', count: 16 }, { t: 'golem', count: 8 }, { t: 'dark_mage', count: 8 }] },
  ],
};
