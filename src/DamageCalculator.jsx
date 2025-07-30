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
    stars: 15, // 6-10 étoiles
    finalStat: finalStats.attack || finalStats.defense || 43835,
    
    // Multiplicateurs par skill
    skillMultipliers: {
      core1: 525,
      core2: 702,
      skill1: 1890,
      skill2: 2520,
      ultimate: 4200
    },
    
    elementalDamage: finalStats.elementalDamage || 13.82,
    setMultiplier: 1.4, // Infamie par défaut
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
    recommendedCP: 2300000
  });

  const [results, setResults] = useState({
    core1: { noCrit: 0, withCrit: 0 },
    core2: { noCrit: 0, withCrit: 0 },
    skill1: { noCrit: 0, withCrit: 0 },
    skill2: { noCrit: 0, withCrit: 0 },
    ultimate: { noCrit: 0, withCrit: 0 },
    calculatedStats: {}
  });

  // Formules de calcul
  const calculateDI = (diStat) => diStat / (diStat + 50000);
  const calculatePEN = (penStat) => penStat / (penStat + 50000);
  const calculateCR = (crStat) => 0.05 + crStat / (crStat + 5000);
  const calculateCD = (cdStat) => (cdStat + 1000) / (0.4 * cdStat + 2000);
  const calculatePrecision = (precStat, cpRatio) => {
    const basePrecision = Math.min(0.5 + precStat / (precStat + 1000), 0.99);
    return cpRatio >= 1 ? basePrecision : basePrecision * cpRatio;
  };

  // Calcul principal pour un skill
  const calculateSkillDamage = (skillMultiplier) => {
    const stats = customStats;
    const cpRatio = stats.recommendedCP > 0 ? stats.teamCP / stats.recommendedCP : 1;
    
    const diPct = calculateDI(stats.damageIncrease);
    const penPct = calculatePEN(stats.penetration);
    const crPct = calculateCR(stats.critRate);
    const cdPct = calculateCD(stats.critDamage);
    const precPct = calculatePrecision(stats.precision, cpRatio);
    
    const defEff = stats.bossDefense * (1 - penPct);
    const defRed = defEff / (defEff + 50000);
    const defMult = 1 - defRed;
    
    const starsBonus = stats.baseStat * (stats.stars / 100);
    const finalStatWithStars = stats.finalStat + starsBonus;
    
    const baseDmg = finalStatWithStars * 
      (skillMultiplier / 100) * 
      (1 + diPct) * 
      (1 + stats.elementalDamage / 100) * 
      stats.setMultiplier * 
      stats.elementalAdvantage * 
      defMult * 
      precPct;
    
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
        cpRatio: (cpRatio * 100).toFixed(0)
      }
    };
  };

  // Calculer tous les skills
  const calculateAllDamage = () => {
    const newResults = {
      core1: calculateSkillDamage(customStats.skillMultipliers.core1),
      core2: calculateSkillDamage(customStats.skillMultipliers.core2),
      skill1: calculateSkillDamage(customStats.skillMultipliers.skill1),
      skill2: calculateSkillDamage(customStats.skillMultipliers.skill2),
      ultimate: calculateSkillDamage(customStats.skillMultipliers.ultimate),
    };
    
    newResults.calculatedStats = newResults.core1.stats;
    setResults(newResults);
  };

  useEffect(() => {
    calculateAllDamage();
  }, [customStats]);

  const handleStatChange = (stat, value) => {
    setCustomStats(prev => ({
      ...prev,
      [stat]: parseFloat(value) || 0
    }));
  };

  const handleSkillMultiplierChange = (skill, value) => {
    setCustomStats(prev => ({
      ...prev,
      skillMultipliers: {
        ...prev.skillMultipliers,
        [skill]: parseFloat(value) || 0
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a2e] rounded-xl shadow-2xl w-full max-w-7xl border border-purple-500/30">
        {/* Header avec gradient violet */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-3 rounded-t-xl relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors bg-black/30 rounded-lg p-1"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚔️</span>
            <div>
              <h2 className="text-xl font-bold text-white">Calculateur de Dégâts - {selectedCharacter || 'Hunter'}</h2>
            </div>
          </div>
        </div>

        {/* Contenu principal en 3 colonnes */}
        <div className="p-4 grid grid-cols-3 gap-4">
          {/* Colonne 1: Stats de base et multiplicateurs */}
          <div className="space-y-3">
            {/* Stats de base */}
            <div className="bg-[#0a0a1a] rounded-lg p-3 border border-purple-500/20">
              <h3 className="text-sm font-bold text-yellow-400 mb-2 flex items-center gap-1">
                <span>🛡️</span> Stats de Base
              </h3>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">DEF/ATK Base</label>
                  <input
                    type="number"
                    value={customStats.baseStat}
                    onChange={(e) => handleStatChange('baseStat', e.target.value)}
                    className="bg-gray-800 text-yellow-400 px-2 py-1 rounded w-20 text-center"
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">Étoiles 6-10 (%)</label>
                  <input
                    type="number"
                    value={customStats.stars}
                    onChange={(e) => handleStatChange('stars', e.target.value)}
                    className="bg-gray-800 text-yellow-400 px-2 py-1 rounded w-20 text-center"
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">Stat Finale</label>
                  <input
                    type="number"
                    value={customStats.finalStat}
                    onChange={(e) => handleStatChange('finalStat', e.target.value)}
                    className="bg-gray-800 text-yellow-400 px-2 py-1 rounded w-20 text-center"
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">Dégâts Élém. (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={customStats.elementalDamage}
                    onChange={(e) => handleStatChange('elementalDamage', e.target.value)}
                    className="bg-gray-800 text-yellow-400 px-2 py-1 rounded w-20 text-center"
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">Set Multiplicateur</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customStats.setMultiplier}
                    onChange={(e) => handleStatChange('setMultiplier', e.target.value)}
                    className="bg-gray-800 text-yellow-400 px-2 py-1 rounded w-20 text-center"
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">Avantage Élém.</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customStats.elementalAdvantage}
                    onChange={(e) => handleStatChange('elementalAdvantage', e.target.value)}
                    className="bg-gray-800 text-yellow-400 px-2 py-1 rounded w-20 text-center"
                  />
                </div>
              </div>
            </div>

            {/* Multiplicateurs de skills */}
            <div className="bg-[#0a0a1a] rounded-lg p-3 border border-purple-500/20">
              <h3 className="text-sm font-bold text-orange-400 mb-2 flex items-center gap-1">
                <span>📊</span> Multiplicateurs (%)
              </h3>
              
              <div className="space-y-2 text-xs">
                {Object.entries(customStats.skillMultipliers).map(([skill, value]) => (
                  <div key={skill} className="flex justify-between items-center">
                    <label className="text-gray-400 capitalize">{skill.replace(/(\d)/, ' $1')}</label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => handleSkillMultiplierChange(skill, e.target.value)}
                      className="bg-gray-800 text-orange-400 px-2 py-1 rounded w-20 text-center"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne 2: Stats avancées et Boss */}
          <div className="space-y-3">
            {/* Stats avancées */}
            <div className="bg-[#0a0a1a] rounded-lg p-3 border border-purple-500/20">
              <h3 className="text-sm font-bold text-yellow-400 mb-2 flex items-center gap-1">
                <span>📈</span> Stats Avancées
              </h3>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">Hausse dégâts</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={customStats.damageIncrease}
                      onChange={(e) => handleStatChange('damageIncrease', e.target.value)}
                      className="bg-gray-800 text-yellow-400 px-2 py-1 rounded w-16 text-center"
                    />
                    <span className="text-green-400 text-[10px] w-12 text-right">
                      {results.calculatedStats.diPct}%
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">Pénétration</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={customStats.penetration}
                      onChange={(e) => handleStatChange('penetration', e.target.value)}
                      className="bg-gray-800 text-yellow-400 px-2 py-1 rounded w-16 text-center"
                    />
                    <span className="text-green-400 text-[10px] w-12 text-right">
                      {results.calculatedStats.penPct}%
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">Taux critique</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={customStats.critRate}
                      onChange={(e) => handleStatChange('critRate', e.target.value)}
                      className="bg-gray-800 text-yellow-400 px-2 py-1 rounded w-16 text-center"
                    />
                    <span className="text-green-400 text-[10px] w-12 text-right">
                      {results.calculatedStats.crPct}%
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">Dégâts crit.</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={customStats.critDamage}
                      onChange={(e) => handleStatChange('critDamage', e.target.value)}
                      className="bg-gray-800 text-yellow-400 px-2 py-1 rounded w-16 text-center"
                    />
                    <span className="text-green-400 text-[10px] w-12 text-right">
                      {results.calculatedStats.cdPct}%
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">Précision</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={customStats.precision}
                      onChange={(e) => handleStatChange('precision', e.target.value)}
                      className="bg-gray-800 text-yellow-400 px-2 py-1 rounded w-16 text-center"
                    />
                    <span className="text-green-400 text-[10px] w-12 text-right">
                      {results.calculatedStats.precPct}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuration Boss avec CP */}
            <div className="bg-[#0a0a1a] rounded-lg p-3 border border-red-500/20">
              <h3 className="text-sm font-bold text-red-400 mb-2 flex items-center gap-1">
                <span>🎯</span> Boss Config
              </h3>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">Niveau Boss</label>
                  <input
                    type="number"
                    value={customStats.bossLevel}
                    onChange={(e) => handleStatChange('bossLevel', e.target.value)}
                    className="bg-gray-800 text-red-400 px-2 py-1 rounded w-20 text-center"
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">DEF Boss</label>
                  <input
                    type="number"
                    value={customStats.bossDefense}
                    onChange={(e) => handleStatChange('bossDefense', e.target.value)}
                    className="bg-gray-800 text-red-400 px-2 py-1 rounded w-20 text-center"
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">CP Équipe</label>
                  <input
                    type="number"
                    value={customStats.teamCP}
                    onChange={(e) => handleStatChange('teamCP', e.target.value)}
                    className="bg-gray-800 text-red-400 px-2 py-1 rounded w-20 text-center"
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">CP Recommandé</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={customStats.recommendedCP}
                      onChange={(e) => handleStatChange('recommendedCP', e.target.value)}
                      className="bg-gray-800 text-red-400 px-2 py-1 rounded w-16 text-center"
                    />
                    <span className="text-green-400 text-[10px] w-12 text-right">
                      {results.calculatedStats.cpRatio}%
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <label className="text-gray-400">DEF Effective</label>
                  <span className="text-green-400 text-xs font-mono">
                    {results.calculatedStats.defEff ? results.calculatedStats.defEff.toLocaleString() : '0'}
                  </span>
                </div>
              </div>
            </div>

            {/* Boss Fatchna avec image */}
            <div className="bg-gradient-to-br from-red-900/20 to-purple-900/20 rounded-lg p-3 border border-red-500/30">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <img 
                    src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1753876142/fatchna_npzzlj.png" 
                    alt="Fatchna"
                    className="w-32 h-20 object-cover rounded-lg border border-red-500/50"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">Fatchna</p>
                  <p className="text-gray-400 text-xs">Niveau 80 • DEF: 248,000</p>
                  <p className="text-purple-300 text-[10px] mt-1">Boss Infamie recommandé</p>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne 3: Résultats */}
          <div className="bg-gradient-to-br from-purple-900/20 to-purple-900/10 rounded-lg p-3 border border-purple-500/30">
            <h3 className="text-sm font-bold text-orange-400 mb-3 flex items-center gap-1">
              <span>⚡</span> Résultats des Dégâts
            </h3>
            
            <div className="space-y-2">
              {Object.entries(results).filter(([key]) => key !== 'calculatedStats').map(([skill, damage]) => (
                <div key={skill} className="bg-gray-900/50 rounded p-2 border border-purple-500/10">
                  <div className="text-xs text-gray-400 mb-1 capitalize font-semibold">
                    {skill === 'core1' ? '⚔️ Noyau 1' :
                     skill === 'core2' ? '🗡️ Noyau 2' :
                     skill === 'skill1' ? '💫 Skill 1' :
                     skill === 'skill2' ? '✨ Skill 2' :
                     '🔥 Ultimate'}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-gray-500 text-[10px]">Sans crit</div>
                      <div className="text-yellow-400 font-bold">{damage.noCrit.toLocaleString()}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500 text-[10px]">Avec crit</div>
                      <div className="text-red-400 font-bold">{damage.withCrit.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Infos formules */}
            <div className="mt-3 p-2 bg-purple-900/20 rounded text-[10px] text-purple-300 border border-purple-500/20">
              <p className="font-semibold mb-1">📐 Formules utilisées:</p>
              <p>• DI%: stat/(stat+50000)</p>
              <p>• PEN%: stat/(stat+50000)</p>
              <p>• CR%: 5% + stat/(stat+5000)</p>
              <p>• CD%: (stat+1000)/(0.4*stat+2000)</p>
              <p>• Précision affectée par ratio CP</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-black/50 px-4 py-2 rounded-b-xl text-center text-gray-500 text-xs">
          ⚔️ BuilderBeru Calculator Version Beta 0.1 - Formules Solo Leveling Arise - En construction ⚔️
        </div>
      </div>
    </div>
  );
};

export default DamageCalculator;