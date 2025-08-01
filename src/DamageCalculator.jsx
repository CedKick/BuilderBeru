import React, { useState, useEffect } from 'react';

const DamageCalculator = ({ 
  selectedCharacter, 
  finalStats = {}, 
   statsWithoutArtefact = {},  // Ajouter
  flatStats = {},             // Ajouter
  characters = {},            // Ajouter
  hunterWeapons = {},        // Ajouter
  BUILDER_DATA = {},         // Ajouter
  onClose,
  t = (key) => key 
}) => {
  // États pour les calculs
 const [customStats, setCustomStats] = useState({
  // Stats de base
  baseStat: flatStats[characters[selectedCharacter]?.scaleStat] || 8624,
  stars: 15,
  finalStat: finalStats[characters[selectedCharacter]?.scaleStat] || 43835, // Maintenant c'est la vraie stat finale !
  
  // Multiplicateurs par skill (on les garde en pourcentage)
  skillMultipliers: {
    core1: 5.25,
    core2: 7.02,
    skill1: 18.90,
    skill2: 25.20,
    ultimate: 42.00
  },
  
  elementalDamage: finalStats[`${characters[selectedCharacter]?.element} Damage %`] || 13.82,
  setMultiplier: 1.4,
  elementalAdvantage: 1.5,
  
  // Stats avancées (déjà les totaux)
  damageIncrease: finalStats['Damage Increase'] || 9922,
  penetration: finalStats['Defense Penetration'] || 23444,
  critRate: finalStats['Critical Hit Rate'] || 25000,
  critDamage: finalStats['Critical Hit Damage'] || 18200,
  precision: flatStats.Precision || hunterWeapons[selectedCharacter]?.precision || 4630,
  
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
    fatchna: { name: 'Fatchna', level: 80, defense: 248000, cp: 50000, img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1753876142/fatchna_npzzlj.png' },
    antQueen: { name: 'Ant Queen', level: 82, defense: 150000, cp: 50000, img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1753968545/antQueen_jzt22r.png' },
    ennioImmortal: { name: 'Ennio Immortal', level: 82, defense: 1500000, cp: 50000, img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1753968454/ennioimmortal_t86t1w.png' },
    custom: { name: 'Custom', level: 80, defense: 100000, cp: 100000,img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754056910/jinahcustom_id8cwq.png' }
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

  // Détection mobile
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <div className={`bg-indigo-950/90 backdrop-blur-md rounded-lg shadow-2xl shadow-indigo-900/50 w-full ${isMobile ? 'max-w-md max-h-[90vh] overflow-y-auto' : 'max-w-5xl'}`}>
        {/* Header ultra compact */}
        <div className="bg-purple-900/30 px-4 py-2 flex justify-between items-center">
  <div className="flex-1 text-center">
    <h2 className="text-white text-sm font-medium tracking-wide">DAMAGE CALCULATOR</h2>
    <p className="text-white/60 text-xs">PRECISION 80%</p>
  </div>
  <button
    onClick={onClose}
    className="text-white/60 hover:text-white transition-colors text-xl leading-none absolute right-4"
  >
    ×
  </button>
</div>

        {/* Content - Ultra compact */}
        <div className={`${isMobile ? 'p-3 space-y-3' : 'grid grid-cols-3 gap-3 p-3'}`}>
          {/* Section 1: Base & Multipliers */}
          <div className="space-y-2">
            {/* Base Stats */}
            <div className="bg-indigo-900/20 rounded p-2">
              <div className="flex items-center gap-2 mb-1.5">
  <img src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754055045/sungicon_bfndrc.png" alt="icon" className="w-4 h-4 rounded" />
  <h3 className="text-white/90 text-xs font-medium">BASE STATS</h3>
</div>
              <div className="space-y-1">
                {[
                  { label: 'Base', key: 'baseStat', value: customStats.baseStat },
                  { label: 'Stars%', key: 'stars', value: customStats.stars },
                  { label: 'Final', key: 'finalStat', value: customStats.finalStat },
                  { label: 'Elem%', key: 'elementalDamage', value: customStats.elementalDamage, step: 0.01 },
                  { label: 'Set', key: 'setMultiplier', value: customStats.setMultiplier, step: 0.1 },
                  { label: 'Advantage', key: 'elementalAdvantage', value: customStats.elementalAdvantage, step: 0.1 },
                  { label: 'Buffs%', key: 'buffs', value: customStats.buffs }
                ].map((item) => (
                  <div key={item.key} className="flex justify-between items-center">
                    <label className="text-white/60 text-xs">{item.label}</label>
                    <input
                      type="number"
                      step={item.step}
                      value={item.value}
                      onChange={(e) => handleStatChange(item.key, e.target.value)}
                      className="bg-indigo-900/30 text-white/90 px-2 py-0.5 rounded w-20 text-xs text-right focus:outline-none focus:bg-indigo-900/50"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Multipliers */}
            <div className="bg-indigo-900/20 rounded p-2">
               <div className="flex items-center gap-2 mb-1.5">
  <img src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754055721/jinahlogo_lllt2d.png" alt="icon" className="w-4 h-4 rounded" />
  <h3 className="text-white/90 text-xs font-medium">SKILL MULTIPLIERS</h3>
</div>
              <div className="space-y-1">
                {Object.entries(customStats.skillMultipliers).map(([skill, value]) => (
                  <div key={skill} className="flex justify-between items-center">
                    <label className="text-white/60 text-xs uppercase">{skill.replace(/(\d)/, ' $1')}</label>
                    <input
                      type="number"
                      step="0.01"
                      value={value}
                      onChange={(e) => handleSkillMultiplierChange(skill, e.target.value)}
                      className="bg-indigo-900/30 text-white/90 px-2 py-0.5 rounded w-20 text-xs text-right focus:outline-none focus:bg-indigo-900/50"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Advanced & Boss */}
          <div className="space-y-2">
            {/* Advanced Stats */}
            <div className="bg-indigo-900/20 rounded p-2">
                   <div className="flex items-center gap-2 mb-1.5">
  <img src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754055557/chaelogo_hci0do.png" alt="icon" className="w-4 h-4 rounded" />
  <h3 className="text-white/90 text-xs font-medium">ADVANCED STATS</h3>
</div>
              <div className="space-y-1">
                {[
                  { label: 'DMG↑', key: 'damageIncrease', calc: 'diPct' },
                  { label: 'PEN', key: 'penetration', calc: 'penPct' },
                  { label: 'CRIT%', key: 'critRate', calc: 'crPct' },
                  { label: 'CDMG', key: 'critDamage', calc: 'cdPct' },
                  { label: 'PREC', key: 'precision', calc: 'precPct' }
                ].map((item) => (
                  <div key={item.key} className="flex justify-between items-center">
                    <label className="text-white/60 text-xs">{item.label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={customStats[item.key]}
                        onChange={(e) => handleStatChange(item.key, e.target.value)}
                        className="bg-indigo-900/30 text-white/90 px-2 py-0.5 rounded w-16 text-xs text-right focus:outline-none focus:bg-indigo-900/50"
                      />
                      <span className="text-white/40 text-xs w-12 text-right">
                        {results.calculatedStats[item.calc]}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Boss Config */}
            <div className="bg-indigo-900/20 rounded p-2">
                   <div className="flex items-center gap-2 mb-1.5">
  <img src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754055802/bossConfig_ftvd3z.png" alt="icon" className="w-4 h-4 rounded" />
  <h3 className="text-white/90 text-xs font-medium">BOSS CONFIG</h3>
</div>
              
              <div className="grid grid-cols-2 gap-1 mb-2">
            {Object.entries(bossPresets).map(([key, boss]) => (
  <button
    key={key}
    onClick={() => handleBossChange(key)}
    className={`relative overflow-hidden px-2 py-1 rounded text-xs transition-all ${
      selectedBoss === key 
        ? 'ring-2 ring-purple-400 text-white' 
        : 'text-white/70 hover:text-white'
    }`}
    style={{
      backgroundImage: boss.img ? `url(${boss.img})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}
  >
    {/* Overlay sombre pour la lisibilité */}
    <div className={`absolute inset-0 ${
      selectedBoss === key 
        ? 'bg-purple-900/60' 
        : 'bg-purple-900/80 hover:bg-purple-900/70'
    } transition-colors`} />
    
    {/* Texte au-dessus de l'overlay */}
    <span className="relative z-10">{boss.name}</span>
  </button>
))}
              </div>

              <div className="space-y-1">
                {[
                  { label: 'Level', key: 'bossLevel' },
                  { label: 'DEF', key: 'bossDefense' },
                  { label: 'Team CP', key: 'teamCP' },
                  { label: 'Rec CP', key: 'recommendedCP' }
                ].map((item) => (
                  <div key={item.key} className="flex justify-between items-center">
                    <label className="text-white/60 text-xs">{item.label}</label>
                    <input
                      type="number"
                      value={customStats[item.key]}
                      onChange={(e) => handleStatChange(item.key, e.target.value)}
                      className="bg-indigo-900/30 text-white/90 px-2 py-0.5 rounded w-20 text-xs text-right focus:outline-none focus:bg-indigo-900/50"
                      disabled={selectedBoss !== 'custom' && item.key !== 'teamCP'}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-2 pt-2 border-t border-indigo-800/30">
                <div className="space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-white/40 text-xs">DEF Eff</span>
                    <span className="text-white/70 text-xs">{results.calculatedStats.defEff?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40 text-xs">CP Ratio</span>
                    <span className="text-white/70 text-xs">{results.calculatedStats.cpRatio}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40 text-xs">G Factor</span>
                    <span className="text-white/70 text-xs">{results.calculatedStats.G}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Results */}
          <div className="bg-indigo-900/20 rounded p-2">
                      <div className="flex items-center gap-2 mb-1.5">
  <img src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754055837/beruProst_ymvwos.png" alt="icon" className="w-4 h-4 rounded" />
  <h3 className="text-white/90 text-xs font-medium">DAMAGE OUTPUT</h3>
</div>        
            <div className="space-y-1">
              {Object.entries(results).filter(([key]) => key !== 'calculatedStats').map(([skill, damage]) => (
                <div key={skill} className="bg-indigo-900/30 rounded p-1.5">
                  <div className="text-white/50 text-xs uppercase mb-0.5">
                    {skill.replace(/(\d)/, ' $1')}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-white/40 text-xs">Normal: </span>
                      <span className="text-white/90 text-xs font-medium">{damage.noCrit.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-white/40 text-xs">Crit: </span>
                      <span className="text-white text-xs font-medium">{damage.withCrit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary compact */}
            <div className="mt-2 p-1.5 bg-indigo-800/20 rounded">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center">
                  <div className="text-white/50 text-xs">AVG DMG</div>
                  <div className="text-white/90 text-sm font-medium">
                    {Math.round((results.skill1.noCrit + results.skill2.noCrit) / 2).toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-white/50 text-xs">MAX CRIT</div>
                  <div className="text-white text-sm font-medium">
                    {results.ultimate.withCrit.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer ultra minimal */}
        <div className="bg-indigo-900/20 px-4 py-1.5">
          <p className="text-center text-white/30 text-xs">
            BUILDERBERU V3 • {selectedCharacter || 'HUNTER'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DamageCalculator;