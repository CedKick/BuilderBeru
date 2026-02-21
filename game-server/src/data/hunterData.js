// ── Hunter Data for Raid ──
// Extracted from ShadowColosseum raidData.js for server-side use
// Each hunter has base stats, growth, 3 skills, element, class, passive

export const HUNTERS = {
  // ── FIRE ──
  h_kanae: { name: 'Tawata Kanae', element: 'fire', rarity: 'mythique', class: 'assassin',
    base: { hp: 350, atk: 52, def: 16, spd: 42, crit: 22, res: 4 },
    growth: { hp: 11, atk: 3.8, def: 0.9, spd: 2.0, crit: 0.7, res: 0.2 },
    skills: [
      { name: 'Flamme Eclair', power: 110, cdMax: 0 },
      { name: 'Dague Incandescente', power: 200, cdMax: 3 },
      { name: 'Embrasement', power: 150, cdMax: 2, buffAtk: 25, buffDur: 2 },
    ],
  },
  h_stark: { name: 'Stark', element: 'fire', rarity: 'mythique', class: 'tank',
    base: { hp: 500, atk: 32, def: 38, spd: 22, crit: 10, res: 18 },
    growth: { hp: 16, atk: 2.0, def: 2.2, spd: 0.8, crit: 0.3, res: 0.9 },
    skills: [
      { name: 'Flamme Bouclier', power: 80, cdMax: 0 },
      { name: 'Mur de Feu', power: 0, cdMax: 3, buffDef: 50, buffDur: 3 },
      { name: 'Garde de Flamme', power: 0, cdMax: 4, buffDef: 60, buffDur: 3 },
    ],
  },
  h_fern: { name: 'Fern', element: 'fire', rarity: 'legendaire', class: 'mage',
    base: { hp: 300, atk: 48, def: 14, spd: 35, crit: 18, res: 8 },
    growth: { hp: 9, atk: 3.5, def: 0.7, spd: 1.5, crit: 0.6, res: 0.3 },
    skills: [
      { name: 'Boule de Feu', power: 100, cdMax: 0 },
      { name: 'Pyro Explosion', power: 180, cdMax: 3 },
      { name: 'Flamme de Fern', power: 155, cdMax: 2 },
    ],
  },
  h_choi: { name: 'Choi Jong-In', element: 'fire', rarity: 'mythique', class: 'mage',
    base: { hp: 320, atk: 55, def: 12, spd: 38, crit: 20, res: 6 },
    growth: { hp: 10, atk: 4.0, def: 0.6, spd: 1.8, crit: 0.8, res: 0.2 },
    skills: [
      { name: 'Eclair de Feu', power: 105, cdMax: 0 },
      { name: 'Combustion', power: 190, cdMax: 3 },
      { name: 'Inferno', power: 150, cdMax: 2, debuffDef: 20, debuffDur: 2 },
    ],
  },
  h_megumin: { name: 'Megumin', element: 'fire', rarity: 'mythique', class: 'mage',
    base: { hp: 200, atk: 80, def: 5, spd: 15, crit: 30, res: 2 },
    growth: { hp: 5, atk: 6.0, def: 0.2, spd: 0.5, crit: 1.0, res: 0.1 },
    skills: [
      { name: 'Staff Bonk', power: 50, cdMax: 0 },
      { name: 'Mini Explosion', power: 300, cdMax: 4 },
      { name: 'EXPLOSION!!!', power: 5000, cdMax: 6, consumeAllMana: true },
    ],
    special: true,
  },

  // ── WATER ──
  h_chae_in: { name: 'Cha Hae-In', element: 'water', rarity: 'mythique', class: 'assassin',
    base: { hp: 340, atk: 54, def: 18, spd: 44, crit: 24, res: 5 },
    growth: { hp: 10, atk: 4.0, def: 0.8, spd: 2.2, crit: 0.8, res: 0.2 },
    skills: [
      { name: 'Lame Rapide', power: 115, cdMax: 0 },
      { name: 'Tempete de Lames', power: 210, cdMax: 3 },
      { name: 'Danse du Sabre', power: 155, cdMax: 2, buffAtk: 30, buffDur: 2 },
    ],
  },
  h_frieren: { name: 'Frieren', element: 'water', rarity: 'mythique', class: 'mage',
    base: { hp: 280, atk: 60, def: 10, spd: 30, crit: 15, res: 12 },
    growth: { hp: 8, atk: 4.5, def: 0.5, spd: 1.2, crit: 0.5, res: 0.5 },
    skills: [
      { name: 'Zoltraak', power: 120, cdMax: 0 },
      { name: 'Magie Ancienne', power: 240, cdMax: 4 },
      { name: 'Gel Eternel', power: 165, cdMax: 3, debuffDef: 25, debuffDur: 2 },
    ],
  },
  h_alicia: { name: 'Alicia Blanche', element: 'water', rarity: 'legendaire', class: 'assassin',
    base: { hp: 310, atk: 50, def: 15, spd: 40, crit: 26, res: 4 },
    growth: { hp: 9, atk: 3.6, def: 0.7, spd: 1.8, crit: 0.9, res: 0.2 },
    skills: [
      { name: 'Givre', power: 100, cdMax: 0 },
      { name: 'Blizzard', power: 185, cdMax: 3 },
      { name: 'Givre Tranchant', power: 155, cdMax: 2 },
    ],
  },
  h_seo: { name: 'Seo Jiwoo', element: 'water', rarity: 'legendaire', class: 'support',
    base: { hp: 400, atk: 25, def: 22, spd: 28, crit: 8, res: 20 },
    growth: { hp: 13, atk: 1.5, def: 1.2, spd: 1.0, crit: 0.3, res: 0.8 },
    skills: [
      { name: 'Eau Vive', power: 60, cdMax: 0 },
      { name: 'Cascade Protectrice', power: 0, cdMax: 3, buffDef: 40, buffDur: 3 },
      { name: 'Soin Aquatique', power: 0, cdMax: 4, healSelf: 35 },
    ],
  },
  h_kurisu: { name: 'Kurisu Makise', element: 'water', rarity: 'mythique', class: 'mage',
    base: { hp: 290, atk: 52, def: 14, spd: 36, crit: 20, res: 10 },
    growth: { hp: 9, atk: 3.8, def: 0.6, spd: 1.6, crit: 0.7, res: 0.4 },
    skills: [
      { name: 'Analyse', power: 90, cdMax: 0 },
      { name: 'Hack Temporel', power: 200, cdMax: 3 },
      { name: 'Amadeus Protocol', power: 160, cdMax: 2, buffAtk: 20, buffDur: 2 },
    ],
  },

  // ── SHADOW ──
  h_ilhwan: { name: 'Ilhwan', element: 'shadow', rarity: 'mythique', class: 'assassin',
    base: { hp: 330, atk: 56, def: 14, spd: 45, crit: 25, res: 3 },
    growth: { hp: 10, atk: 4.2, def: 0.6, spd: 2.2, crit: 0.9, res: 0.1 },
    skills: [
      { name: 'Lame d\'Ombre', power: 115, cdMax: 0 },
      { name: 'Frappe Letale', power: 220, cdMax: 3 },
      { name: 'Danse de l\'Ombre', power: 160, cdMax: 2, buffAtk: 25, buffDur: 2 },
    ],
  },
  h_silverbaek: { name: 'Baek Yoonho', element: 'shadow', rarity: 'mythique', class: 'fighter',
    base: { hp: 420, atk: 48, def: 25, spd: 35, crit: 18, res: 8 },
    growth: { hp: 14, atk: 3.2, def: 1.4, spd: 1.4, crit: 0.6, res: 0.4 },
    skills: [
      { name: 'Griffe de Bete', power: 105, cdMax: 0 },
      { name: 'Charge Bestiale', power: 200, cdMax: 3 },
      { name: 'Rugissement Bestial', power: 170, cdMax: 3 },
    ],
  },
  h_kaneki: { name: 'Ken Kaneki', element: 'shadow', rarity: 'mythique', class: 'fighter',
    base: { hp: 380, atk: 58, def: 20, spd: 40, crit: 22, res: 5 },
    growth: { hp: 12, atk: 4.0, def: 1.0, spd: 1.8, crit: 0.8, res: 0.2 },
    skills: [
      { name: 'Kagune Strike', power: 120, cdMax: 0 },
      { name: 'Kagune Burst', power: 230, cdMax: 3 },
      { name: 'Centipede', power: 280, cdMax: 4, selfDamage: 15, buffAtk: 35, buffDur: 2 },
    ],
  },
  h_saber: { name: 'Saber', element: 'shadow', rarity: 'mythique', class: 'fighter',
    base: { hp: 360, atk: 55, def: 22, spd: 38, crit: 20, res: 6 },
    growth: { hp: 11, atk: 3.8, def: 1.0, spd: 1.6, crit: 0.7, res: 0.3 },
    skills: [
      { name: 'Strike Air', power: 110, cdMax: 0 },
      { name: 'Invisible Air', power: 200, cdMax: 3 },
      { name: 'Excalibur', power: 260, cdMax: 4 },
    ],
  },
  h_guts: { name: 'Guts', element: 'shadow', rarity: 'mythique', class: 'fighter',
    base: { hp: 450, atk: 60, def: 28, spd: 30, crit: 16, res: 4 },
    growth: { hp: 15, atk: 4.2, def: 1.3, spd: 1.0, crit: 0.5, res: 0.2 },
    skills: [
      { name: 'Dragon Slayer', power: 130, cdMax: 0 },
      { name: 'Rage', power: 240, cdMax: 3, selfDamage: 10 },
      { name: 'Berserker Armor', power: 280, cdMax: 4, buffAtk: 40, buffDur: 3, selfDamage: 20 },
    ],
  },
  h_2b: { name: '2B', element: 'shadow', rarity: 'mythique', class: 'assassin',
    base: { hp: 320, atk: 54, def: 16, spd: 42, crit: 24, res: 5 },
    growth: { hp: 10, atk: 3.9, def: 0.8, spd: 2.0, crit: 0.8, res: 0.2 },
    skills: [
      { name: 'Virtuous Contract', power: 115, cdMax: 0 },
      { name: 'Pod Fire', power: 190, cdMax: 3 },
      { name: 'Pod Programme R011', power: 160, cdMax: 2, debuffDef: 25, debuffDur: 2 },
    ],
  },
};

// Compute stats at a given level
export function hunterStatsAtLevel(hunterId, level = 1, stars = 0) {
  const h = HUNTERS[hunterId];
  if (!h) return null;

  const stats = {
    hp: Math.floor(h.base.hp + h.growth.hp * (level - 1)),
    atk: Math.floor(h.base.atk + h.growth.atk * (level - 1)),
    def: Math.floor(h.base.def + h.growth.def * (level - 1)),
    spd: Math.floor(h.base.spd + h.growth.spd * (level - 1)),
    crit: Math.floor(h.base.crit + h.growth.crit * (level - 1)),
    res: Math.floor(h.base.res + h.growth.res * (level - 1)),
  };

  // Star bonuses (same as STAR_STAT_BONUSES from raidData)
  const starBonuses = [
    { hp: 0, atk: 0, def: 0, spd: 0, crit: 0, res: 0 },
    { hp: 5, atk: 3, def: 2, spd: 0, crit: 0, res: 0 },
    { hp: 8, atk: 5, def: 3, spd: 2, crit: 1, res: 0 },
    { hp: 12, atk: 8, def: 5, spd: 3, crit: 2, res: 1 },
    { hp: 16, atk: 12, def: 8, spd: 4, crit: 3, res: 2 },
    { hp: 20, atk: 15, def: 10, spd: 5, crit: 5, res: 3 },
  ];

  const bonus = starBonuses[Math.min(stars, 5)] || starBonuses[0];
  stats.hp = Math.floor(stats.hp * (1 + bonus.hp / 100));
  stats.atk = Math.floor(stats.atk * (1 + bonus.atk / 100));
  stats.def = Math.floor(stats.def * (1 + bonus.def / 100));
  stats.spd = Math.floor(stats.spd * (1 + bonus.spd / 100));
  stats.crit += bonus.crit;
  stats.res += bonus.res;

  return stats;
}

// Get the 3rd skill of a hunter (the one used when summoned via 1/2/3)
export function getHunterSummonSkill(hunterId) {
  const h = HUNTERS[hunterId];
  if (!h || !h.skills[2]) return null;
  return { ...h.skills[2], hunterName: h.name, element: h.element };
}

// List of all hunter IDs
export function getAllHunterIds() {
  return Object.keys(HUNTERS);
}
