import React, { useState, useEffect } from 'react';

const DamageCalculator = ({ 
  selectedCharacter, 
  finalStats = {}, 
  onClose,
  t = (key) => key 
}) => {
  // États pour les calculs
  const [customStats, setCustomStats] = useState({
    // Stats de base
    baseStat: finalStats.attack || finalStats.defense || 8624,
    stars: 15,
    finalStat: finalStats.attack || finalStats.defense || 43835,
    
    // Multiplicateurs par skill
    skillMultipliers: {
      core1: 5.25,
      core2: 7.02,
      skill1: 18.90,
      skill2: 25.20,
      ultimate: 42.00
    },
    
    elementalDamage: finalStats.elementalDamage || 13.82,
    setMultiplier: 1.4,
    elementalAdvantage: 1.5,
    
    // Stats avancées
    damageIncrease: finalStats.damageIncrease || 9922,
    penetration: finalStats.defPenetration || 23444,
    critRate: finalStats.criticalHitRate || 25000,
    critDamage: finalStats.criticalHitDamage || 18200,
    precision: finalStats.precision || 4630,
    
    // Boss
    bossLevel: 80,
    bossDefense: 248000,
    teamCP: 2300000,
    recommendedCP: 2300000,
    
    // Buffs
    buffs: 0
  });

  const [results, setResults] = useState({
    core1: { noCrit: 0, withCrit: 0 },
    core2: { noCrit: 0, withCrit: 0 },
    skill1: { noCrit: 0, withCrit: 0 },
    skill2: { noCrit: 0, withCrit: 0 },
    ultimate: { noCrit: 0, withCrit: 0 },
    calculatedStats: {}
  });

  const [selectedBoss, setSelectedBoss] = useState('fatchna');

  // Boss presets
  const bossPresets = {
    fatchna: { name: 'Fatchna', level: 80, defense: 248000, cp: 2300000, img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1753876142/fatchna_npzzlj.png' },
    antQueen: { name: 'Ant Queen', level: 80, defense: 150000, cp: 50000, img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1753968545/antQueen_jzt22r.png' },
    ennio: { name: 'Ennio Immortal', level: 82, defense: 150000, cp: 50000, img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1753968454/ennioimmortal_t86t1w.png' },
    custom: { name: 'Custom Boss', level: 80, defense: 100000, cp: 100000, img: null }
  };

  // Formules
  const calculateDI = (diStat) => diStat / (diStat + 50000);
  const calculatePEN = (penStat) => penStat / (penStat + 50000);
  const calculateCR = (crStat) => 0.05 + crStat / (crStat + 5000);
  const calculateCD = (cdStat) => (cdStat + 1000) / (0.4 * cdStat + 2000);
  
  const calculatePrecision = (precStat, cpRatio) => {
    const basePrecision = Math.min(0.5 + precStat / (precStat + 1000), 0.99);
    if (cpRatio <= 1) {
      return basePrecision * cpRatio;
    } else {
      const bonus = Math.min(cpRatio - 1, 0.56);
      return basePrecision * (1 + bonus);
    }
  };

  const calculateSkillDamage = (skillMultiplier) => {
    const stats = customStats;
    const safeValue = (val) => val === '' ? 0 : parseFloat(val) || 0;
    
    const cpRatio = safeValue(stats.recommendedCP) > 0 ? safeValue(stats.teamCP) / safeValue(stats.recommendedCP) : 1;
    
    const diPct = calculateDI(safeValue(stats.damageIncrease));
    const penPct = calculatePEN(safeValue(stats.penetration));
    const crPct = calculateCR(safeValue(stats.critRate));
    const cdPct = calculateCD(safeValue(stats.critDamage));
    const precPct = calculatePrecision(safeValue(stats.precision), cpRatio);
    
    const defEff = safeValue(stats.bossDefense) * (1 - penPct);
    const G = 1 - defEff / (defEff + 50000);
    
    const starsBonus = safeValue(stats.baseStat) * (safeValue(stats.stars) / 100);
    const finalStatWithStars = safeValue(stats.finalStat) + starsBonus;
    
    const baseDmg = finalStatWithStars * 
      safeValue(skillMultiplier) * 
      precPct * 
      G * 
      (1 + diPct) * 
      (1 + safeValue(stats.buffs) / 100) * 
      (1 + safeValue(stats.elementalDamage) / 100) * 
      safeValue(stats.setMultiplier) * 
      safeValue(stats.elementalAdvantage);
    
    const critDmg = baseDmg * (1 + cdPct);
    
    return {
      noCrit: Math.round(baseDmg),
      withCrit: Math.round(critDmg),
      stats: {
        diPct: (diPct * 100).toFixed(2),
        penPct: (penPct * 100).toFixed(2),
        crPct: (crPct * 100).toFixed(2),
        cdPct: (cdPct * 100).toFixed(2),
        precPct: (precPct * 100).toFixed(2),
        defEff: Math.round(defEff),
        cpRatio: (cpRatio * 100).toFixed(0),
        G: (G * 100).toFixed(2)
      }
    };
  };

  const calculateAllDamage = () => {
    const safeMultiplier = (mult) => mult === '' ? 0 : parseFloat(mult) || 0;
    
    const newResults = {
      core1: calculateSkillDamage(safeMultiplier(customStats.skillMultipliers.core1)),
      core2: calculateSkillDamage(safeMultiplier(customStats.skillMultipliers.core2)),
      skill1: calculateSkillDamage(safeMultiplier(customStats.skillMultipliers.skill1)),
      skill2: calculateSkillDamage(safeMultiplier(customStats.skillMultipliers.skill2)),
      ultimate: calculateSkillDamage(safeMultiplier(customStats.skillMultipliers.ultimate)),
    };
    
    newResults.calculatedStats = newResults.core1.stats;
    setResults(newResults);
  };

  useEffect(() => {
    calculateAllDamage();
  }, [customStats]);

  // Gestion du changement de boss
  const handleBossChange = (bossType) => {
    setSelectedBoss(bossType);
    if (bossType !== 'custom') {
      const boss = bossPresets[bossType];
      setCustomStats(prev => ({
        ...prev,
        bossLevel: boss.level,
        bossDefense: boss.defense,
        recommendedCP: boss.cp
      }));
    }
  };

  const handleStatChange = (stat, value) => {
    setCustomStats(prev => ({
      ...prev,
      [stat]: value === '' ? '' : value
    }));
  };

  const handleSkillMultiplierChange = (skill, value) => {
    setCustomStats(prev => ({
      ...prev,
      skillMultipliers: {
        ...prev.skillMultipliers,
        [skill]: value === '' ? '' : value
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-2">
      <div className="bg-gradient-to-br from-blue-950/90 via-black/95 to-purple-950/90 rounded-lg border border-blue-500/30 shadow-2xl shadow-blue-500/20 w-full max-w-6xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-blue-500/30 px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-500/20 border border-blue-400/50 flex items-center justify-center">
                <span className="text-blue-400 text-sm">!</span>
              </div>
              <h2 className="text-blue-400 font-bold text-sm tracking-wider">DAMAGE CALCULATOR</h2>
            </div>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded bg-red-500/20 border border-red-400/50 flex items-center justify-center hover:bg-red-500/30 transition-colors"
            >
              <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content - 3 colonnes compactes */}
        <div className="grid grid-cols-3 gap-2 p-2">
          {/* Colonne 1: Stats & Multiplicateurs */}
          <div className="space-y-2">
            {/* Stats de base */}
            <div className="bg-black/40 rounded border border-blue-900/30 p-2">
              <h3 className="text-cyan-400 text-[10px] font-bold mb-1">BASE STATS</h3>
              <div className="space-y-0.5 text-[10px]">
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">Base</label>
                  <input
                    type="number"
                    value={customStats.baseStat}
                    onChange={(e) => handleStatChange('baseStat', e.target.value)}
                    className="bg-gray-800/50 text-cyan-400 px-1 py-0.5 rounded w-16 text-[10px] text-center border border-blue-900/20"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">Stars%</label>
                  <input
                    type="number"
                    value={customStats.stars}
                    onChange={(e) => handleStatChange('stars', e.target.value)}
                    className="bg-gray-800/50 text-cyan-400 px-1 py-0.5 rounded w-16 text-[10px] text-center border border-blue-900/20"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">Final</label>
                  <input
                    type="number"
                    value={customStats.finalStat}
                    onChange={(e) => handleStatChange('finalStat', e.target.value)}
                    className="bg-gray-800/50 text-cyan-400 px-1 py-0.5 rounded w-16 text-[10px] text-center border border-blue-900/20"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">Elem%</label>
                  <input
                    type="number"
                    step="0.01"
                    value={customStats.elementalDamage}
                    onChange={(e) => handleStatChange('elementalDamage', e.target.value)}
                    className="bg-gray-800/50 text-cyan-400 px-1 py-0.5 rounded w-16 text-[10px] text-center border border-blue-900/20"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">Set</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customStats.setMultiplier}
                    onChange={(e) => handleStatChange('setMultiplier', e.target.value)}
                    className="bg-gray-800/50 text-cyan-400 px-1 py-0.5 rounded w-16 text-[10px] text-center border border-blue-900/20"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">Advantage</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customStats.elementalAdvantage}
                    onChange={(e) => handleStatChange('elementalAdvantage', e.target.value)}
                    className="bg-gray-800/50 text-cyan-400 px-1 py-0.5 rounded w-16 text-[10px] text-center border border-blue-900/20"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">Buffs%</label>
                  <input
                    type="number"
                    value={customStats.buffs}
                    onChange={(e) => handleStatChange('buffs', e.target.value)}
                    className="bg-gray-800/50 text-green-400 px-1 py-0.5 rounded w-16 text-[10px] text-center border border-blue-900/20"
                  />
                </div>
              </div>
            </div>

            {/* Multiplicateurs */}
            <div className="bg-black/40 rounded border border-purple-900/30 p-2">
              <h3 className="text-purple-400 text-[10px] font-bold mb-1">MULTIPLIERS</h3>
              <div className="space-y-0.5 text-[10px]">
                {Object.entries(customStats.skillMultipliers).map(([skill, value]) => (
                  <div key={skill} className="flex justify-between items-center">
                    <label className="text-gray-400 capitalize">{skill.replace(/(\d)/, ' $1')}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={value}
                      onChange={(e) => handleSkillMultiplierChange(skill, e.target.value)}
                      className="bg-gray-800/50 text-purple-400 px-1 py-0.5 rounded w-16 text-[10px] text-center border border-purple-900/20"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne 2: Stats avancées & Boss */}
          <div className="space-y-2">
            {/* Stats avancées */}
            <div className="bg-black/40 rounded border border-blue-900/30 p-2">
              <h3 className="text-yellow-400 text-[10px] font-bold mb-1">ADVANCED</h3>
              <div className="space-y-0.5 text-[10px]">
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">DMG↑</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={customStats.damageIncrease}
                      onChange={(e) => handleStatChange('damageIncrease', e.target.value)}
                      className="bg-gray-800/50 text-yellow-400 px-1 py-0.5 rounded w-14 text-[10px] text-center border border-blue-900/20"
                    />
                    <span className="text-green-400 text-[9px] w-10 text-right">{results.calculatedStats.diPct}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">PEN</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={customStats.penetration}
                      onChange={(e) => handleStatChange('penetration', e.target.value)}
                      className="bg-gray-800/50 text-yellow-400 px-1 py-0.5 rounded w-14 text-[10px] text-center border border-blue-900/20"
                    />
                    <span className="text-green-400 text-[9px] w-10 text-right">{results.calculatedStats.penPct}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">CRIT%</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={customStats.critRate}
                      onChange={(e) => handleStatChange('critRate', e.target.value)}
                      className="bg-gray-800/50 text-yellow-400 px-1 py-0.5 rounded w-14 text-[10px] text-center border border-blue-900/20"
                    />
                    <span className="text-green-400 text-[9px] w-10 text-right">{results.calculatedStats.crPct}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">CDMG</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={customStats.critDamage}
                      onChange={(e) => handleStatChange('critDamage', e.target.value)}
                      className="bg-gray-800/50 text-yellow-400 px-1 py-0.5 rounded w-14 text-[10px] text-center border border-blue-900/20"
                    />
                    <span className="text-green-400 text-[9px] w-10 text-right">{results.calculatedStats.cdPct}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">PREC</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={customStats.precision}
                      onChange={(e) => handleStatChange('precision', e.target.value)}
                      className="bg-gray-800/50 text-yellow-400 px-1 py-0.5 rounded w-14 text-[10px] text-center border border-blue-900/20"
                    />
                    <span className="text-green-400 text-[9px] w-10 text-right">{results.calculatedStats.precPct}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Boss Selection */}
            <div className="bg-black/40 rounded border border-red-900/30 p-2">
              <h3 className="text-red-400 text-[10px] font-bold mb-1">BOSS CONFIG</h3>
              
              {/* Boss selector */}
              <div className="grid grid-cols-2 gap-1 mb-2">
                {Object.entries(bossPresets).map(([key, boss]) => (
                  <button
                    key={key}
                    onClick={() => handleBossChange(key)}
                    className={`px-1 py-0.5 rounded text-[9px] transition-all ${
                      selectedBoss === key 
                        ? 'bg-red-500/30 text-red-400 border border-red-400/50' 
                        : 'bg-black/30 text-gray-500 border border-gray-700/30 hover:border-red-500/30'
                    }`}
                  >
                    {boss.name}
                  </button>
                ))}
              </div>

              <div className="space-y-0.5 text-[10px]">
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">Level</label>
                  <input
                    type="number"
                    value={customStats.bossLevel}
                    onChange={(e) => handleStatChange('bossLevel', e.target.value)}
                    className="bg-gray-800/50 text-red-400 px-1 py-0.5 rounded w-16 text-[10px] text-center border border-red-900/20"
                    disabled={selectedBoss !== 'custom'}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">DEF</label>
                  <input
                    type="number"
                    value={customStats.bossDefense}
                    onChange={(e) => handleStatChange('bossDefense', e.target.value)}
                    className="bg-gray-800/50 text-red-400 px-1 py-0.5 rounded w-16 text-[10px] text-center border border-red-900/20"
                    disabled={selectedBoss !== 'custom'}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">Team CP</label>
                  <input
                    type="number"
                    value={customStats.teamCP}
                    onChange={(e) => handleStatChange('teamCP', e.target.value)}
                    className="bg-gray-800/50 text-orange-400 px-1 py-0.5 rounded w-16 text-[10px] text-center border border-red-900/20"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">Rec CP</label>
                  <input
                    type="number"
                    value={customStats.recommendedCP}
                    onChange={(e) => handleStatChange('recommendedCP', e.target.value)}
                    className="bg-gray-800/50 text-orange-400 px-1 py-0.5 rounded w-16 text-[10px] text-center border border-red-900/20"
                    disabled={selectedBoss !== 'custom'}
                  />
                </div>
                <div className="mt-1 pt-1 border-t border-red-900/30">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-[9px]">DEF Eff</span>
                    <span className="text-red-400 text-[9px] font-mono">{results.calculatedStats.defEff?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-[9px]">CP Ratio</span>
                    <span className={`text-[9px] font-mono ${parseInt(results.calculatedStats.cpRatio) >= 100 ? 'text-green-400' : 'text-red-400'}`}>
                      {results.calculatedStats.cpRatio}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-[9px]">G Factor</span>
                    <span className="text-green-400 text-[9px] font-mono">{results.calculatedStats.G}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne 3: Résultats */}
          <div className="bg-gradient-to-br from-purple-900/20 to-black/30 rounded border border-purple-900/30 p-2">
            <h3 className="text-orange-400 text-[10px] font-bold mb-2">DAMAGE OUTPUT</h3>
            
            <div className="space-y-1">
              {Object.entries(results).filter(([key]) => key !== 'calculatedStats').map(([skill, damage]) => (
                <div key={skill} className="bg-black/30 rounded p-1.5 border border-purple-900/10">
                  <div className="text-[9px] text-gray-500 mb-0.5">
                    {skill === 'core1' ? '⚔️ CORE 1' :
                     skill === 'core2' ? '🗡️ CORE 2' :
                     skill === 'skill1' ? '💫 SKILL 1' :
                     skill === 'skill2' ? '✨ SKILL 2' :
                     '🔥 ULTIMATE'}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-gray-600 text-[8px]">Normal: </span>
                      <span className="text-cyan-400 font-bold">{damage.noCrit.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 text-[8px]">Crit: </span>
                      <span className="text-orange-400 font-bold">{damage.withCrit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-2 p-1.5 bg-purple-900/20 rounded border border-purple-500/20">
              <div className="grid grid-cols-2 gap-1 text-[9px]">
                <div className="text-center">
                  <div className="text-gray-500">AVG DMG</div>
                  <div className="text-cyan-400 font-bold text-xs">
                    {Math.round((results.skill1.noCrit + results.skill2.noCrit) / 2).toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500">MAX CRIT</div>
                  <div className="text-orange-400 font-bold text-xs">
                    {results.ultimate.withCrit.toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="mt-1 pt-1 border-t border-purple-900/30">
                <p className="text-[8px] text-purple-300 text-center">
                  DMG = STAT × MULT × PREC × G × (1+DI%) × (1+BUFFS%) × ELEM × SET
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-black/60 border-t border-blue-900/30 px-3 py-1">
          <p className="text-center text-[9px] text-gray-600">
            BUILDERBERU V3 • SHADOW MONARCH EDITION • {selectedCharacter || 'HUNTER'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DamageCalculator;