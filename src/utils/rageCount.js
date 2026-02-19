// src/utils/rageCount.js
const RC_THRESHOLDS_ANT_QUEEN = [
  { rc: 1, damage: 2404000 },
  { rc: 2, damage: 4906000 },
  { rc: 3, damage: 7600000 },
  { rc: 4, damage: 11291000 },
  { rc: 5, damage: 15290000 },
  { rc: 6, damage: 19500000 },
  { rc: 7, damage: 24000000 },
  { rc: 8, damage: 29000000 },
  { rc: 9, damage: 38115000 },
  { rc: 10, damage: 43500000 },
  { rc: 11, damage: 49330000 },
  { rc: 12, damage: 59000000 },
  { rc: 13, damage: 66300000 },
  { rc: 14, damage: 74030000 },
  { rc: 15, damage: 82930000 },
  { rc: 16, damage: 96550000 },
  { rc: 17, damage: 113470000 },
  { rc: 18, damage: 134580000 },
  { rc: 19, damage: 161640000 },
  { rc: 20, damage: 191520000 },
  { rc: 21, damage: 248740000 },
  { rc: 22, damage: 287000000 },
  { rc: 23, damage: 330000000 },
  { rc: 24, damage: 382000000 },
  { rc: 25, damage: 440000000 },
  { rc: 26, damage: 502000000 },
  { rc: 27, damage: 570000000 },
  { rc: 28, damage: 645000000 },
  { rc: 29, damage: 726000000 },
  { rc: 30, damage: 817000000 },
  { rc: 31, damage: 906000000 },
  { rc: 32, damage: 1006000000 },
  { rc: 33, damage: 1110000000 },
  { rc: 34, damage: 1221000000 },
  { rc: 35, damage: 1339000000 },
  { rc: 36, damage: 1465000000 },
  { rc: 37, damage: 1598000000 },
  { rc: 38, damage: 1739000000 },
  { rc: 39, damage: 1883000000 },
  { rc: 40, damage: 2033000000 },
  { rc: 41, damage: 2193000000 },
  { rc: 42, damage: 2353000000 },
  { rc: 43, damage: 2517000000 },
  { rc: 44, damage: 2687000000 },
  { rc: 45, damage: 2864000000 },
  { rc: 46, damage: 3060000000 },
  { rc: 47, damage: 3250000000 },
  { rc: 48, damage: 3445000000 },
  { rc: 49, damage: 3652000000 },
  { rc: 50, damage: 3910000000 },
  { rc: 51, damage: 4188000000 },
  { rc: 52, damage: 4530000000 },
  { rc: 53, damage: 4935000000 },
  { rc: 54, damage: 5411000000 },
  { rc: 55, damage: 5948000000 },
  { rc: 56, damage: 6647000000 },
  { rc: 57, damage: 7337000000 },
  { rc: 58, damage: 8035000000 },
  { rc: 59, damage: 8784000000 },
  { rc: 60, damage: 9612000000 },
  { rc: 61, damage: 10510000000 },
  { rc: 62, damage: 11469000000 },
  { rc: 63, damage: 12506000000 },
  { rc: 64, damage: 13612000000 },
  { rc: 65, damage: 14873000000 },
  { rc: 66, damage: 16124000000 },
  { rc: 67, damage: 17459000000 },
  { rc: 68, damage: 18837000000 },
  { rc: 69, damage: 20313000000 },
  { rc: 70, damage: 21840000000 },
  { rc: 71, damage: 23461000000 },
  { rc: 72, damage: 25160000000 },
  { rc: 73, damage: 26934000000 },
  { rc: 74, damage: 28778000000 },
  { rc: 75, damage: 30700000000 },
  { rc: 76, damage: 32600000000 },
  { rc: 77, damage: 34700000000 },
  { rc: 78, damage: 36900000000 },
  { rc: 79, damage: 39200000000 },
  { rc: 80, damage: 42200000000 },
  { rc: 81, damage: 44500000000 },
  { rc: 82, damage: 46900000000 },
  { rc: 83, damage: 49350000000 },
  { rc: 84, damage: 52100000000 },
  { rc: 85, damage: 54800000000 },
  { rc: 86, damage: 57500000000 },
  { rc: 87, damage: 60400000000 }
];

const RC_THRESHOLDS_FATCHNA = [
  { rc: 1, damage: 2350000 },
  { rc: 2, damage: 5770000 },
  { rc: 3, damage: 8400000 },
  { rc: 4, damage: 11200000 },
  { rc: 5, damage: 15000000 },
  { rc: 6, damage: 19000000 },
  { rc: 7, damage: 22900000 },
  { rc: 8, damage: 30000000 },
  { rc: 9, damage: 37000000 },
  { rc: 10, damage: 41700000 },
  { rc: 11, damage: 47000000 },
  { rc: 12, damage: 53300000 },
  { rc: 13, damage: 60000000 },
  { rc: 14, damage: 68070000 },
  { rc: 15, damage: 77820000 },
  { rc: 16, damage: 90000000 },
  { rc: 17, damage: 107000000 },
  { rc: 18, damage: 128000000 },
  { rc: 19, damage: 152000000 },
  { rc: 20, damage: 182000000 },
  { rc: 21, damage: 218000000 },
  { rc: 22, damage: 255000000 },
  { rc: 23, damage: 300000000 },
  { rc: 24, damage: 350000000 },
  { rc: 25, damage: 412000000 },
  { rc: 26, damage: 475000000 },
  { rc: 27, damage: 543000000 },
  { rc: 28, damage: 617000000 },
  { rc: 29, damage: 701000000 },
  { rc: 30, damage: 788000000 },
  { rc: 31, damage: 885000000 },
  { rc: 32, damage: 1012000000 },
  { rc: 33, damage: 1118000000 },
  { rc: 34, damage: 1228000000 },
  { rc: 35, damage: 1345000000 },
  { rc: 36, damage: 1483000000 },
  { rc: 37, damage: 1610000000 },
  { rc: 38, damage: 1749000000 },
  { rc: 39, damage: 1898000000 },
  { rc: 40, damage: 2035000000 },
  { rc: 41, damage: 2189000000 },
  { rc: 42, damage: 2350000000 },
  { rc: 43, damage: 2516000000 },
  { rc: 44, damage: 2689000000 },
  { rc: 45, damage: 2869000000 },
  { rc: 46, damage: 3054000000 },
  { rc: 47, damage: 3246000000 },
  { rc: 48, damage: 3450000000 },
  { rc: 49, damage: 3702000000 },
  { rc: 50, damage: 3932000000 },
  { rc: 51, damage: 4211000000 },
  { rc: 52, damage: 4522000000 },
  { rc: 53, damage: 4953000000 },
  { rc: 54, damage: 5420000000 },
  { rc: 55, damage: 5964000000 },
  { rc: 56, damage: 6570000000 },
  { rc: 57, damage: 7219000000 },
  { rc: 58, damage: 7900000000 },
  { rc: 59, damage: 8652000000 },
  { rc: 60, damage: 9475000000 },
  { rc: 61, damage: 10370000000 },
  { rc: 62, damage: 11330000000 },
  { rc: 63, damage: 12360000000 },
  { rc: 64, damage: 13480000000 },
  { rc: 65, damage: 14660000000 },
  { rc: 66, damage: 16000000000 },
  { rc: 67, damage: 17340000000 },
  { rc: 68, damage: 18750000000 },
  { rc: 69, damage: 20250000000 },
  { rc: 70, damage: 21900000000 },
  { rc: 71, damage: 23500000000 },
  { rc: 72, damage: 25000000000 },
  { rc: 73, damage: 26900000000 },
  { rc: 74, damage: 28800000000 },
  { rc: 75, damage: 30800000000 },
  { rc: 76, damage: 32800000000 },
  { rc: 77, damage: 35000000000 },
  { rc: 78, damage: 37200000000 },
  { rc: 79, damage: 39500000000 },
  { rc: 80, damage: 41850000000 },
  { rc: 81, damage: 44300000000 }
];

// Growth factor for RC extrapolation beyond table (≈5% per RC, matches observed pattern)
const RC_GROWTH_FACTOR = 1.05;

export const calculateRCFromTotal = (totalDamage, boss = 'ant_queen') => {
  const thresholds = boss === 'ant_queen' ? RC_THRESHOLDS_ANT_QUEEN
    : boss === 'fatchna' ? RC_THRESHOLDS_FATCHNA : [];
  if (!thresholds.length) return 0;

  const last = thresholds[thresholds.length - 1];

  // Beyond table: extrapolate with 5% growth per RC (infinite scaling)
  if (totalDamage >= last.damage) {
    const extraRC = Math.floor(Math.log(totalDamage / last.damage) / Math.log(RC_GROWTH_FACTOR));
    return last.rc + extraRC;
  }

  // Within table
  let rageCount = 0;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (totalDamage >= thresholds[i].damage) {
      rageCount = thresholds[i].rc;
      break;
    }
  }
  return rageCount;
};

// Get the damage threshold needed for a given RC (used for UI display)
export const getDamageForRC = (rc, boss = 'ant_queen') => {
  const thresholds = boss === 'ant_queen' ? RC_THRESHOLDS_ANT_QUEEN
    : boss === 'fatchna' ? RC_THRESHOLDS_FATCHNA : [];
  if (!thresholds.length) return 0;
  const entry = thresholds.find(t => t.rc === rc);
  if (entry) return entry.damage;
  const last = thresholds[thresholds.length - 1];
  if (rc > last.rc) return Math.floor(last.damage * Math.pow(RC_GROWTH_FACTOR, rc - last.rc));
  return 0;
};