import { Manaya } from './Manaya.js';

export function createBoss(bossId, difficulty, x, y) {
  switch (bossId) {
    case 'manaya':
      return new Manaya(difficulty, x, y);

    // Future bosses:
    // case 'ragnaros':
    //   return new Ragnaros(difficulty, x, y);

    default:
      throw new Error(`Unknown boss: ${bossId}`);
  }
}
