// ── Essence System V2 ──
// 3 types of essences dropped by mobs and bosses
// Used to exchange for specific set pieces at the NPC Blacksmith

export const ESSENCE_TYPES = {
  guerre: {
    id: 'essence_guerre',
    name: 'Essence de Guerre',
    color: '#ef4444',  // Red
    icon: 'sword',
    description: 'Essence liee aux combattants. Echangeable contre des sets Fighter/Assassin.',
    dropSources: ['slime', 'orc', 'skeleton', 'goblin'],
    associatedClasses: ['fighter', 'assassin'],
  },
  arcanique: {
    id: 'essence_arcanique',
    name: 'Essence Arcanique',
    color: '#3b82f6',  // Blue
    icon: 'wand',
    description: 'Essence magique. Echangeable contre des sets Mage/Support.',
    dropSources: ['dark_mage'],
    associatedClasses: ['mage', 'support'],
  },
  gardienne: {
    id: 'essence_gardienne',
    name: 'Essence Gardienne',
    color: '#eab308',  // Gold
    icon: 'shield',
    description: 'Essence protectrice. Echangeable contre des sets Tank/Universels.',
    dropSources: ['golem', 'orc'],
    associatedClasses: ['tank'],
  },
};

// ── Drop Rates ──

export const ESSENCE_DROP_RATES = {
  // Mob drops
  mob_basic: { chance: 0.15, min: 1, max: 2 },     // 15% chance, 1-2 essences
  mob_elite: { chance: 0.40, min: 2, max: 4 },     // 40% chance, 2-4 essences
  // Boss drops (100% guaranteed)
  boss: { chance: 1.0, min: 10, max: 30 },          // 100%, 10-30 essences
};

// Which essence type a mob drops (based on mob template type)
export const MOB_ESSENCE_MAP = {
  slime:     'guerre',
  skeleton:  'guerre',
  goblin:    'guerre',
  orc:       'guerre',    // Also gardienne (50/50)
  golem:     'gardienne',
  dark_mage: 'arcanique',
};

// Special: Orc drops guerre OR gardienne (50/50)
export function getEssenceTypeForMob(mobType) {
  if (mobType === 'orc') {
    return Math.random() < 0.5 ? 'guerre' : 'gardienne';
  }
  return MOB_ESSENCE_MAP[mobType] || 'guerre';
}

// Boss drops a random essence type
export function getEssenceTypeForBoss() {
  const types = ['guerre', 'arcanique', 'gardienne'];
  return types[Math.floor(Math.random() * types.length)];
}

// ── NPC Exchange Prices ──

export const ESSENCE_EXCHANGE = {
  // Exchange essences for set pieces at the NPC Blacksmith
  medium_set_piece: {
    cost: 50,
    description: 'Piece de set moyen (aleatoire dans la zone correspondante)',
  },
  big_set_piece: {
    cost: 150,
    description: 'Piece de gros set (aleatoire, classe correspondante)',
  },
  random_mythique: {
    cost: 200,
    description: 'Piece aleatoire de rarete mythique',
  },
};

// ── Helpers ──

export function rollEssenceDrop(mobType, isElite = false, isBoss = false) {
  if (isBoss) {
    const rate = ESSENCE_DROP_RATES.boss;
    const type = getEssenceTypeForBoss();
    const amount = rate.min + Math.floor(Math.random() * (rate.max - rate.min + 1));
    return { type, amount };
  }

  const rate = isElite ? ESSENCE_DROP_RATES.mob_elite : ESSENCE_DROP_RATES.mob_basic;
  if (Math.random() > rate.chance) return null; // No drop

  const type = getEssenceTypeForMob(mobType);
  const amount = rate.min + Math.floor(Math.random() * (rate.max - rate.min + 1));
  return { type, amount };
}

export function getExchangeOptions(essenceType) {
  const essenceDef = ESSENCE_TYPES[essenceType];
  if (!essenceDef) return [];
  return Object.entries(ESSENCE_EXCHANGE).map(([key, val]) => ({
    id: key,
    ...val,
    essenceType,
    classes: essenceDef.associatedClasses,
  }));
}
