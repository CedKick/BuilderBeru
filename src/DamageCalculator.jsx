import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CharacterBuffs from './CharacterBuffs';
import TeamBuffs from './TeamBuffs';
import SetBuffs from './SetBuffs';

const DamageCalculator = ({
  selectedCharacter: initialCharacter,
  finalStats = {},
  statsWithoutArtefact = {},
  flatStats = {},
  characters = {},
  hunterWeapons = {},
  BUILDER_DATA = {},
  onClose
}) => {
  const { t } = useTranslation();
  // État pour le personnage sélectionné
  const [selectedCharacter, setSelectedCharacter] = useState(initialCharacter || '');
  const [teamBuffSelection, setTeamBuffSelection] = useState(['', '']);
  const [raidBuffSelection, setRaidBuffSelection] = useState(['', '', '']);

  // États pour les calculs
  const [customStats, setCustomStats] = useState({
    // Stats de base
    level: 115,
    baseStat: flatStats[characters[selectedCharacter]?.scaleStat] || 8624,
    stars: 30,
    finalStat: finalStats[characters[selectedCharacter]?.scaleStat] || 43835,

    // Multiplicateurs par skill (initialisés depuis le personnage)
    skillMultipliers: {
      core1: characters[selectedCharacter]?.skillMultipliers?.core1 || 5.25,
      core2: characters[selectedCharacter]?.skillMultipliers?.core2 || 7.02,
      skill1: characters[selectedCharacter]?.skillMultipliers?.skill1 || 18.90,
      skill2: characters[selectedCharacter]?.skillMultipliers?.skill2 || 25.20,
      ultimate: characters[selectedCharacter]?.skillMultipliers?.ultimate || 42.00
    },

    calculatorMode: 'normal',
    expertSettings: {
      damageIncrease: false,
      defensePenetration: false,
      precision: false,
      criticalDamage: false
    },

    elementalDamage: finalStats[`${characters[selectedCharacter]?.element} Damage %`] || 13.82,
    setMultiplier: 1,
    activeStatMultiplier: 1,
    elementalAdvantage: 1.5,

    // Stats avancées
    damageIncrease: finalStats['Damage Increase'] || 9922,
    penetration: finalStats['Defense Penetration'] || 23444,
    critRate: finalStats['Critical Hit Rate'] || 25000,
    critDamage: finalStats['Critical Hit Damage'] || 18200,
    precision: flatStats.Precision || hunterWeapons[selectedCharacter]?.precision || 4630,

    // Boss
    bossLevel: 80,
    bossDefense: 248000,
    teamCP: 2300000,
    recommendedCP: 50000,

    // Buffs manuels
    damageBuffsManual: 0,
    coreBuffsManual: 0,
    skillBuffsManual: 0,
    ultimateBuffsManual: 0,
    critRateBuffsManual: 0,
    critDamageBuffsManual: 0,

    // Buffs automatiques
    damageBuffsAuto: 0,
    coreBuffsAuto: 0,
    skillBuffsAuto: 0,
    ultimateBuffsAuto: 0,
    critRateBuffsAuto: 0,
    critDamageBuffsAuto: 0,

    // 🗡️ KAISEL FIX: Tracker le buff de stat appliqué
    scaleStatBuffPercent: 0,
  });

  const [showBuffsPopup, setShowBuffsPopup] = useState({
    character: false,
    team: false,
    set: false
  });

  const [activeBuffsCount, setActiveBuffsCount] = useState({
    character: 0,
    team: 0,
    set: 0
  });

  // 🗡️ KAISEL FIX: Stocker les indices des buffs actifs
  const [activeCharacterBuffsIndices, setActiveCharacterBuffsIndices] = useState([]);

  const getTotalBuff = (manual, auto) => {
    const manualVal = parseFloat(manual) || 0;
    const autoVal = parseFloat(auto) || 0;
    return manualVal + autoVal;
  };

  // Liste des sets disponibles
  const availableSets = [
    {
      label: 'None',
      multiplier: 1,
      damageBuff: 0,
      coreBuff: 0,
      skillBuff: 0,
      ultimateBuff: 0,
      statMultipliers: {
        atk: 1,
        def: 1,
        hp: 1
      }
    },
    {
      label: 'Infamy x8',
      multiplier: 1,
      damageBuff: 40,
      coreBuff: 0,
      skillBuff: 100,
      ultimateBuff: 100,
      statMultipliers: {
        atk: 1,
        def: 1,
        hp: 1
      }
    },
    {
      label: 'Cursed/Expert',
      multiplier: 1,
      damageBuff: 30,
      coreBuff: 0,
      skillBuff: 0,
      ultimateBuff: 0,
      statMultipliers: {
        atk: 1.6,
        def: 1,
        hp: 1
      }
    },
    {
      label: '2Curs/2Inf/4Exp.',
      multiplier: 1,
      damageBuff: 20,
      coreBuff: 0,
      skillBuff: 30,
      ultimateBuff: 0,
      statMultipliers: {
        atk: 1.6,
        def: 1,
        hp: 1
      }
    },
    {
      label: 'Cursed/Obsi',
      multiplier: 1,
      damageBuff: 90,
      coreBuff: 0,
      skillBuff: 0,
      ultimateBuff: 0,
      statMultipliers: {
        atk: 1,
        def: 1,
        hp: 1
      }
    },
    {
      label: 'Infamy/Obsidian',
      multiplier: 1,
      damageBuff: 60,
      coreBuff: 0,
      skillBuff: 50,
      ultimateBuff: 0,
      statMultipliers: {
        atk: 1,
        def: 1,
        hp: 1
      }
    },
    {
      label: 'IronWill/Obsi',
      multiplier: 1,
      damageBuff: 60,
      coreBuff: 0,
      skillBuff: 0,
      ultimateBuff: 50,
      statMultipliers: {
        atk: 1,
        def: 1.33,
        hp: 1
      }
    },
    {
      label: 'IronWill/Infamy',
      multiplier: 1,
      damageBuff: 0,
      coreBuff: 0,
      skillBuff: 50,
      ultimateBuff: 50,
      statMultipliers: {
        atk: 1,
        def: 1.33,
        hp: 1
      }
    },
    {
      label: 'Champion',
      multiplier: 1,
      damageBuff: 0,
      coreBuff: 0,
      skillBuff: 0,
      ultimateBuff: 0,
      statMultipliers: {
        atk: 1,
        def: 1,
        hp: 1
      }
    },
    {
      label: 'Burning',
      multiplier: 1,
      damageBuff: 0,
      coreBuff: 0,
      skillBuff: 0,
      ultimateBuff: 0,
      statMultipliers: {
        atk: 1,
        def: 1,
        hp: 1
      }
    },
    {
      label: 'Chaos',
      multiplier: 1,
      damageBuff: 0,
      coreBuff: 0,
      skillBuff: 0,
      ultimateBuff: 0,
      statMultipliers: {
        atk: 1,
        def: 1,
        hp: 1
      }
    }
  ];

  const [selectedSetIndex, setSelectedSetIndex] = useState(0);
  // Pour le compteur, ajouter cet état :
  const [activeTeamBuffsCount, setActiveTeamBuffsCount] = useState(0);
  const [activeTeamBuffs, setActiveTeamBuffs] = useState([]);

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
    custom: { name: 'Custom', level: 80, defense: 100000, cp: 100000, img: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754056910/jinahcustom_id8cwq.png' }
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

  // Fonction pour gérer le changement de personnage
  const handleCharacterChange = (characterKey) => {
    setSelectedCharacter(characterKey);

    if (characterKey && characters[characterKey]) {
      const character = characters[characterKey];

      // Mettre à jour les multiplicateurs
      setCustomStats(prev => ({
        ...prev,
        skillMultipliers: {
          core1: character.skillMultipliers?.core1 || 0,
          core2: character.skillMultipliers?.core2 || 0,
          skill1: character.skillMultipliers?.skill1 || 0,
          skill2: character.skillMultipliers?.skill2 || 0,
          ultimate: character.skillMultipliers?.ultimate || 0
        },
        // Mettre à jour les stats de base selon le nouveau personnage
        baseStat: flatStats[character.scaleStat] || 8624,
        finalStat: finalStats[character.scaleStat] || 43835,
        elementalDamage: finalStats[`${character.element} Damage %`] || 13.82,
      }));
    }
  };

  // Fonction helper pour déterminer quel multiplicateur appliquer
  const getActiveStatMultiplier = (set, character) => {
    if (!character || !characters[character]) return 1;

    const scaleStat = characters[character].scaleStat;
    const statMultipliers = set.statMultipliers || { atk: 1, def: 1, hp: 1 };

    // Mapper les noms de stats du jeu vers les clés du multiplicateur
    const statMapping = {
      'Attack': 'atk',
      'Defense': 'def',
      'HP': 'hp'
    };

    const statKey = statMapping[scaleStat] || 'atk';
    return statMultipliers[statKey] || 1;
  };

  // 2. Dans handleSetChange (ligne ~330), modifier pour ne pas écraser les buffs :
  const handleSetChange = (setIndex) => {
    const selectedSet = availableSets[setIndex];
    const activeMultiplier = getActiveStatMultiplier(selectedSet, selectedCharacter);

    setSelectedSetIndex(setIndex);

    // 🔧 KAISEL FIX: Calculer la différence au lieu d'écraser
    setCustomStats(prev => {
      // Retirer les anciens buffs du set
      const oldSet = availableSets[selectedSetIndex];
      const newDamageBuff = selectedSet.damageBuff - (oldSet?.damageBuff || 0);
      const newCoreBuff = selectedSet.coreBuff - (oldSet?.coreBuff || 0);
      const newSkillBuff = selectedSet.skillBuff - (oldSet?.skillBuff || 0);
      const newUltimateBuff = selectedSet.ultimateBuff - (oldSet?.ultimateBuff || 0);

      return {
        ...prev,
        setMultiplier: selectedSet.multiplier,
        damageBuffsAuto: prev.damageBuffsAuto + newDamageBuff,
        coreBuffsAuto: prev.coreBuffsAuto + newCoreBuff,
        skillBuffsAuto: prev.skillBuffsAuto + newSkillBuff,
        ultimateBuffsAuto: prev.ultimateBuffsAuto + newUltimateBuff,
        activeStatMultiplier: activeMultiplier
      };
    });
  };

  // Dans calculateSkillDamage, modifier le calcul :
  const calculateSkillDamage = (skillMultiplier, skillType) => {
    const stats = customStats;
    const safeValue = (val) => val === '' ? 0 : parseFloat(val) || 0;

    // 🔧 KAISEL: Ajouter les buffs aux calculs
    const totalCritRateBuffs = safeValue(stats.critRateBuffsManual) + safeValue(stats.critRateBuffsAuto);
    const totalCritDamageBuffs = safeValue(stats.critDamageBuffsManual) + safeValue(stats.critDamageBuffsAuto);

    const cpRatio = safeValue(stats.recommendedCP) > 0 ? safeValue(stats.teamCP) / safeValue(stats.recommendedCP) : 1;

    const diPct = calculateDI(safeValue(stats.damageIncrease));
    const penPct = calculatePEN(safeValue(stats.penetration));
    const baseCrPct = calculateCR(safeValue(stats.critRate));
    const crPct = baseCrPct * (1 + totalCritRateBuffs / 100); // Appliquer le buff
    const baseCdPct = calculateCD(safeValue(stats.critDamage));
    const cdPct = baseCdPct * (1 + totalCritDamageBuffs / 100); // Appliquer le buff
    const precPct = calculatePrecision(safeValue(stats.precision), cpRatio);

    const defEff = safeValue(stats.bossDefense) * (1 - penPct);
    const G = 1 - defEff / (defEff + 50000);

    // Calcul normal des stars sur la base stat (sans multiplicateur)
    const starsBonus = safeValue(stats.baseStat) * (safeValue(stats.stars) / 100);

    // Appliquer le multiplicateur de stat ET le buff % sur la STAT FINALE
    const finalStatBase = safeValue(stats.finalStat) + starsBonus;
    const statBuffMultiplier = 1 + (safeValue(stats.scaleStatBuffPercent) / 100);
    const finalStatWithMultiplier = finalStatBase * safeValue(stats.activeStatMultiplier) * statBuffMultiplier;

    // Calculer les totaux des buffs
    const totalDamageBuffs = safeValue(stats.damageBuffsManual) + safeValue(stats.damageBuffsAuto);

    let specificBuff = 0;
    if (skillType === 'core') {
      specificBuff = safeValue(stats.coreBuffsManual) + safeValue(stats.coreBuffsAuto);
    } else if (skillType === 'skill') {
      specificBuff = safeValue(stats.skillBuffsManual) + safeValue(stats.skillBuffsAuto);
    } else if (skillType === 'ultimate') {
      specificBuff = safeValue(stats.ultimateBuffsManual) + safeValue(stats.ultimateBuffsAuto);
    }

    const baseDmg = finalStatWithMultiplier *  // Utiliser la stat finale avec multiplicateur
      safeValue(skillMultiplier) *
      precPct *
      G *
      (1 + diPct) *
      (1 + totalDamageBuffs / 100) *
      (1 + specificBuff / 100) *
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
        G: (G * 100).toFixed(2),
        // Ajouter la stat finale modifiée pour info
        finalStatModified: Math.round(finalStatWithMultiplier)
      }
    };
  };

  // Remplacer la fonction calculateAllDamage par celle-ci :
  const calculateAllDamage = () => {
    const safeMultiplier = (mult) => mult === '' ? 0 : parseFloat(mult) || 0;

    const newResults = {
      core1: calculateSkillDamage(safeMultiplier(customStats.skillMultipliers.core1), 'core'),
      core2: calculateSkillDamage(safeMultiplier(customStats.skillMultipliers.core2), 'core'),
      skill1: calculateSkillDamage(safeMultiplier(customStats.skillMultipliers.skill1), 'skill'),
      skill2: calculateSkillDamage(safeMultiplier(customStats.skillMultipliers.skill2), 'skill'),
      ultimate: calculateSkillDamage(safeMultiplier(customStats.skillMultipliers.ultimate), 'ultimate'),
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
    if (stat.includes('.')) {
      // Pour les nested properties comme expertSettings.damageIncrease
      const [parent, child] = stat.split('.');
      setCustomStats(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setCustomStats(prev => ({
        ...prev,
        [stat]: value === '' ? '' : value
      }));
    }
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

  // Remplacer handleApplyBuffs par ceci :
  const handleApplyBuffs = (source, buffs) => {
    console.log(`🗡️ KAISEL: Applying ${source} buffs:`, buffs);

    // Appliquer directement aux customStats
    setCustomStats(prev => {
      let newStats = { ...prev };

      // Gérer les buffs de dégâts
      if (buffs.damageBuffs !== undefined) {
        newStats.damageBuffsAuto = (newStats.damageBuffsAuto || 0) + buffs.damageBuffs;
      }

      // Gérer les buffs de skills
      if (buffs.skillBuffs !== undefined) {
        newStats.skillBuffsAuto = (newStats.skillBuffsAuto || 0) + buffs.skillBuffs;
      }

      // Gérer les buffs ultimate
      if (buffs.ultimateBuffs !== undefined) {
        newStats.ultimateBuffsAuto = (newStats.ultimateBuffsAuto || 0) + buffs.ultimateBuffs;
      }

      // Gérer les buffs core
      if (buffs.coreBuffs !== undefined) {
        newStats.coreBuffsAuto = (newStats.coreBuffsAuto || 0) + buffs.coreBuffs;
      }

      // 🗡️ KAISEL: Gérer scaleStatBuff
      if (buffs.scaleStatBuff !== undefined) {
        newStats.scaleStatBuffPercent = (newStats.scaleStatBuffPercent || 0) + buffs.scaleStatBuff;
      }

      // 🗡️ KAISEL: Gérer elementalDamage
      if (buffs.elementalDamage && typeof buffs.elementalDamage === 'object') {
        const characterElement = characters[selectedCharacter]?.element;
        if (characterElement && buffs.elementalDamage[characterElement]) {
          newStats.elementalDamage = (newStats.elementalDamage || 0) + buffs.elementalDamage[characterElement];
        }
      }

      if (buffs.critRateBuffs !== undefined) {
        newStats.critRateBuffsAuto = (newStats.critRateBuffsAuto || 0) + buffs.critRateBuffs;
      }

      if (buffs.critDamageBuffs !== undefined) {
        newStats.critDamageBuffsAuto = (newStats.critDamageBuffsAuto || 0) + buffs.critDamageBuffs;
      }

      return newStats;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <div className={`bg-indigo-950/90 backdrop-blur-md rounded-lg shadow-2xl shadow-indigo-900/50 w-full ${isMobile ? 'max-w-md max-h-[90vh] overflow-y-auto' : 'max-w-5xl'}`}>
        {/* Header ultra compact */}
        <div className="bg-purple-900/30 px-4 py-2 flex justify-between items-center">
          <div className="flex-1 text-center">
            <h2 className="text-white text-sm font-medium tracking-wide">{t('damageCalculator.title')}</h2>
            <p className="text-white/60 text-xs">{t('damageCalculator.precision')}</p>
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
            {/* Base Stats avec Character Selector */}
            <div className="bg-indigo-900/20 rounded p-2">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <img src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754055045/sungicon_bfndrc.png" alt="icon" className="w-4 h-4 rounded" />
                  <h3 className="text-white/90 text-xs font-medium">{t('damageCalculator.sections.baseStats')}</h3>
                </div>

                {/* Character Selector */}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedCharacter}
                    onChange={(e) => handleCharacterChange(e.target.value)}
                    className="bg-indigo-900/30 text-white px-2 py-0.5 rounded text-[10px] focus:outline-none focus:bg-indigo-900/50"
                  >
                    <option value="">{t('damageCalculator.selectCharacter')}</option>
                    {Object.entries(characters)
                      .filter(([key]) => key !== '') // Juste exclure l'entrée vide
                      .map(([key, char]) => (
                        <option key={key} value={key}>{char.name}</option>
                      ))}
                  </select>
                  {selectedCharacter && characters[selectedCharacter] && (
                    <img
                      src={characters[selectedCharacter].icon}
                      alt={characters[selectedCharacter].name}
                      className="w-4 h-4 rounded"
                    />
                  )}
                </div>
              </div>

              {/* Stats principales en 2 colonnes - Les labels restent en anglais */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-2">
                {/* Colonne gauche */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-white/60 text-[10px]">Level</label>
                    <input
                      type="number"
                      value={customStats.level}
                      onChange={(e) => handleStatChange('level', e.target.value)}
                      className="bg-indigo-900/30 text-white/90 px-1 py-0.5 rounded w-14 text-[10px] text-right focus:outline-none focus:bg-indigo-900/50"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <label className="text-white/60 text-[10px]">Base</label>
                    <input
                      type="number"
                      value={customStats.baseStat}
                      onChange={(e) => handleStatChange('baseStat', e.target.value)}
                      className="bg-indigo-900/30 text-white/90 px-1 py-0.5 rounded w-14 text-[10px] text-right focus:outline-none focus:bg-indigo-900/50"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <label className="text-white/60 text-[10px]">Stars%</label>
                    <input
                      type="number"
                      value={customStats.stars}
                      onChange={(e) => handleStatChange('stars', e.target.value)}
                      className="bg-indigo-900/30 text-white/90 px-1 py-0.5 rounded w-14 text-[10px] text-right focus:outline-none focus:bg-indigo-900/50"
                    />
                  </div>
                </div>

                {/* Colonne droite */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-white/60 text-[10px]">Final Stats</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={customStats.finalStat}
                        onChange={(e) => handleStatChange('finalStat', e.target.value)}
                        className="bg-indigo-900/30 text-white/90 px-1 py-0.5 rounded w-14 text-[10px] text-right focus:outline-none focus:bg-indigo-900/50"
                      />
                      {customStats.scaleStatBuffPercent > 0 && (
                        <span className="text-green-400 text-[8px]">
                          +{customStats.scaleStatBuffPercent.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <label className="text-white/60 text-[10px]">Elem%</label>
                    <input
                      type="number"
                      step="0.01"
                      value={customStats.elementalDamage}
                      onChange={(e) => handleStatChange('elementalDamage', e.target.value)}
                      className="bg-indigo-900/30 text-white/90 px-1 py-0.5 rounded w-14 text-[10px] text-right focus:outline-none focus:bg-indigo-900/50"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <label className="text-white/60 text-[10px]">Set</label>
                    <select
                      value={selectedSetIndex}
                      onChange={(e) => handleSetChange(parseInt(e.target.value))}
                      className="bg-indigo-900/30 text-white/90 px-1 py-0.5 rounded w-14 text-[10px] text-right focus:outline-none focus:bg-indigo-900/50 appearance-none cursor-pointer"
                    >
                      {availableSets.map((set, index) => (
                        <option key={index} value={index} className="bg-indigo-950">
                          {set.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-between items-center">
                    <label className="text-white/60 text-[10px]">Advantage</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customStats.elementalAdvantage}
                      onChange={(e) => handleStatChange('elementalAdvantage', e.target.value)}
                      className="bg-indigo-900/30 text-white/90 px-1 py-0.5 rounded w-14 text-[10px] text-right focus:outline-none focus:bg-indigo-900/50"
                    />
                  </div>

                </div>
              </div>

              {/* Séparateur */}
              <div className="border-t border-indigo-800/30 my-2"></div>

              {/* Section Buffs avec double inputs - GRILLE 2 COLONNES - Labels techniques restent en anglais */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                {/* DMG% - Colonne 1 */}
                <div>
                  <label className="text-white/60 text-[10px] block mb-1">DMG%</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={customStats.damageBuffsManual}
                      onChange={(e) => handleStatChange('damageBuffsManual', e.target.value)}
                      placeholder="0"
                      className="bg-indigo-900/30 text-white/90 px-1 py-0.5 rounded w-10 text-[10px] text-center focus:outline-none focus:bg-indigo-900/50"
                    />
                    <span className="text-white/40 text-[10px]">+</span>
                    <input
                      type="number"
                      value={customStats.damageBuffsAuto}
                      disabled
                      className="bg-purple-900/20 text-purple-300/70 px-1 py-0.5 rounded w-10 text-[10px] text-center cursor-not-allowed"
                    />
                    <span className="text-white/60 text-[10px]">
                      = {getTotalBuff(customStats.damageBuffsManual, customStats.damageBuffsAuto)}%
                    </span>
                  </div>
                </div>

                {/* Ult% - Colonne 2 */}
                <div>
                  <label className="text-white/60 text-[10px] block mb-1">Ult%</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={customStats.ultimateBuffsManual}
                      onChange={(e) => handleStatChange('ultimateBuffsManual', e.target.value)}
                      placeholder="0"
                      className="bg-indigo-900/30 text-white/90 px-1 py-0.5 rounded w-10 text-[10px] text-center focus:outline-none focus:bg-indigo-900/50"
                    />
                    <span className="text-white/40 text-[10px]">+</span>
                    <input
                      type="number"
                      value={customStats.ultimateBuffsAuto}
                      disabled
                      className="bg-purple-900/20 text-purple-300/70 px-1 py-0.5 rounded w-10 text-[10px] text-center cursor-not-allowed"
                    />
                    <span className="text-white/60 text-[10px]">
                      = {getTotalBuff(customStats.ultimateBuffsManual, customStats.ultimateBuffsAuto)}%
                    </span>
                  </div>
                </div>

                {/* Core% - Colonne 1 */}
                <div>
                  <label className="text-white/60 text-[10px] block mb-1">Core%</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={customStats.coreBuffsManual}
                      onChange={(e) => handleStatChange('coreBuffsManual', e.target.value)}
                      placeholder="0"
                      className="bg-indigo-900/30 text-white/90 px-1 py-0.5 rounded w-10 text-[10px] text-center focus:outline-none focus:bg-indigo-900/50"
                    />
                    <span className="text-white/40 text-[10px]">+</span>
                    <input
                      type="number"
                      value={customStats.coreBuffsAuto}
                      disabled
                      className="bg-purple-900/20 text-purple-300/70 px-1 py-0.5 rounded w-10 text-[10px] text-center cursor-not-allowed"
                    />
                    <span className="text-white/60 text-[10px]">
                      = {getTotalBuff(customStats.coreBuffsManual, customStats.coreBuffsAuto)}%
                    </span>
                  </div>
                </div>

                {/* CR% - Colonne 2 */}
                <div>
                  <label className="text-white/60 text-[10px] block mb-1">CR%</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={customStats.critRateBuffsManual}
                      onChange={(e) => handleStatChange('critRateBuffsManual', e.target.value)}
                      placeholder="0"
                      className="bg-indigo-900/30 text-white/90 px-1 py-0.5 rounded w-10 text-[10px] text-center focus:outline-none focus:bg-indigo-900/50"
                    />
                    <span className="text-white/40 text-[10px]">+</span>
                    <input
                      type="number"
                      value={customStats.critRateBuffsAuto}
                      disabled
                      className="bg-purple-900/20 text-purple-300/70 px-1 py-0.5 rounded w-10 text-[10px] text-center cursor-not-allowed"
                    />
                    <span className="text-white/60 text-[10px]">
                      = {getTotalBuff(customStats.critRateBuffsManual, customStats.critRateBuffsAuto)}%
                    </span>
                  </div>
                </div>

                {/* Skill% - Colonne 1 */}
                <div>
                  <label className="text-white/60 text-[10px] block mb-1">Skill%</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={customStats.skillBuffsManual}
                      onChange={(e) => handleStatChange('skillBuffsManual', e.target.value)}
                      placeholder="0"
                      className="bg-indigo-900/30 text-white/90 px-1 py-0.5 rounded w-10 text-[10px] text-center focus:outline-none focus:bg-indigo-900/50"
                    />
                    <span className="text-white/40 text-[10px]">+</span>
                    <input
                      type="number"
                      value={customStats.skillBuffsAuto}
                      disabled
                      className="bg-purple-900/20 text-purple-300/70 px-1 py-0.5 rounded w-10 text-[10px] text-center cursor-not-allowed"
                    />
                    <span className="text-white/60 text-[10px]">
                      = {getTotalBuff(customStats.skillBuffsManual, customStats.skillBuffsAuto)}%
                    </span>
                  </div>
                </div>

                {/* CD% - Colonne 2 */}
                <div>
                  <label className="text-white/60 text-[10px] block mb-1">CD%</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={customStats.critDamageBuffsManual}
                      onChange={(e) => handleStatChange('critDamageBuffsManual', e.target.value)}
                      placeholder="0"
                      className="bg-indigo-900/30 text-white/90 px-1 py-0.5 rounded w-10 text-[10px] text-center focus:outline-none focus:bg-indigo-900/50"
                    />
                    <span className="text-white/40 text-[10px]">+</span>
                    <input
                      type="number"
                      value={customStats.critDamageBuffsAuto}
                      disabled
                      className="bg-purple-900/20 text-purple-300/70 px-1 py-0.5 rounded w-10 text-[10px] text-center cursor-not-allowed"
                    />
                    <span className="text-white/60 text-[10px]">
                      = {getTotalBuff(customStats.critDamageBuffsManual, customStats.critDamageBuffsAuto)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Multipliers */}
            <div className="bg-indigo-900/20 rounded p-2">
              <div className="flex items-center gap-2 mb-1.5">
                <img src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754055721/jinahlogo_lllt2d.png" alt="icon" className="w-4 h-4 rounded" />
                <h3 className="text-white/90 text-xs font-medium">{t('damageCalculator.sections.skillMultipliers')}</h3>
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

            {/* OTHER BUFFS - NOUVELLE SECTION */}
            <div className="bg-indigo-900/20 rounded p-2">
              <div className="flex items-center gap-2 mb-1.5">
                <img src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754055557/chaelogo_hci0do.png" alt="icon" className="w-4 h-4 rounded" />
                <h3 className="text-white/90 text-xs font-medium">{t('damageCalculator.sections.otherBuffs')}</h3>
              </div>

              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => setShowBuffsPopup(prev => ({ ...prev, character: true }))}
                  className="bg-indigo-900/30 hover:bg-indigo-900/50 text-white/70 hover:text-white px-1 py-1 rounded text-[9px] transition-all text-center"
                >
                  {t('damageCalculator.buffs.character')}
                  <span className="text-purple-400 block text-[8px]">({activeBuffsCount.character})</span>
                </button>

                <button
                  onClick={() => setShowBuffsPopup(prev => ({ ...prev, team: true }))}
                  className="bg-indigo-900/30 hover:bg-indigo-900/50 text-white/70 hover:text-white px-1 py-1 rounded text-[9px] transition-all text-center"
                >
                  {t('damageCalculator.buffs.team')}
                  <span className="text-purple-400 block text-[8px]">({activeTeamBuffsCount})</span>
                </button>

                <button
                  onClick={() => setShowBuffsPopup(prev => ({ ...prev, set: true }))}
                  className="bg-indigo-900/30 hover:bg-indigo-900/50 text-white/70 hover:text-white px-1 py-1 rounded text-[9px] transition-all text-center"
                >
                  {t('damageCalculator.buffs.set')}
                  <span className="text-purple-400 block text-[8px]">({activeBuffsCount.set})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Advanced & Boss */}
          <div className="space-y-2">
            {/* Advanced Stats */}
            <div className="bg-indigo-900/20 rounded p-2">
              <div className="flex items-center gap-2 mb-1.5">
                <img src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754055557/chaelogo_hci0do.png" alt="icon" className="w-4 h-4 rounded" />
                <h3 className="text-white/90 text-xs font-medium">{t('damageCalculator.sections.advancedStats')}</h3>
              </div>
              <div className="space-y-1">
                {/* Labels DMG↑, PEN, CRIT%, CDMG, PREC restent en anglais */}
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
                <h3 className="text-white/90 text-xs font-medium">{t('damageCalculator.sections.bossConfig')}</h3>
              </div>

              <div className="grid grid-cols-2 gap-1 mb-2">
                {Object.entries(bossPresets).map(([key, boss]) => (
                  <button
                    key={key}
                    onClick={() => handleBossChange(key)}
                    className={`relative overflow-hidden px-2 py-1 rounded text-xs transition-all ${selectedBoss === key
                      ? 'ring-2 ring-purple-400 text-white'
                      : 'text-white/70 hover:text-white'
                      }`}
                    style={{
                      backgroundImage: boss.img ? `url(${boss.img})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className={`absolute inset-0 ${selectedBoss === key
                      ? 'bg-purple-900/60'
                      : 'bg-purple-900/80 hover:bg-purple-900/70'
                      } transition-colors`} />
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
          <div className="space-y-2">
            {/* Damage Output */}
            <div className="bg-indigo-900/20 rounded p-2">
              <div className="flex items-center gap-2 mb-1.5">
                <img src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754055837/beruProst_ymvwos.png" alt="icon" className="w-4 h-4 rounded" />
                <h3 className="text-white/90 text-xs font-medium">{t('damageCalculator.sections.damageOutput')}</h3>
              </div>
              
              {/* Normal et Crit peuvent être traduits */}
              <div className="space-y-1">
                {Object.entries(results).filter(([key]) => key !== 'calculatedStats').map(([skill, damage]) => (
                  <div key={skill} className="bg-indigo-900/30 rounded p-1.5">
                    <div className="text-white/50 text-xs uppercase mb-0.5">
                      {skill.replace(/(\d)/, ' $1')}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-white/40 text-xs">{t('damageCalculator.damage.normal')}: </span>
                        <span className="text-white/90 text-xs font-medium">{damage.noCrit.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-white/40 text-xs">{t('damageCalculator.damage.crit')}: </span>
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

            {/* SETTINGS - NOUVELLE SECTION */}
            <div className="bg-indigo-900/20 rounded p-2">
              <div className="flex items-center gap-2 mb-1.5">
                <img src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754055837/beruProst_ymvwos.png" alt="icon" className="w-4 h-4 rounded" />
                <h3 className="text-white/90 text-xs font-medium">{t('damageCalculator.sections.settings')}</h3>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/70 text-[10px]">{t('damageCalculator.settings.calculatorMode')}</span>
                <button
                  onClick={() => handleStatChange('calculatorMode', customStats.calculatorMode === 'normal' ? 'expert' : 'normal')}
                  className={`relative w-14 h-6 rounded-full transition-colors ${customStats.calculatorMode === 'expert' ? 'bg-purple-600' : 'bg-indigo-900/50'
                    }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${customStats.calculatorMode === 'expert' ? 'translate-x-8' : 'translate-x-0'
                      }`}
                  />
                  <span className={`absolute inset-0 flex items-center ${customStats.calculatorMode === 'expert' ? 'justify-start pl-1' : 'justify-end pr-1'
                    }`}>
                    <span className="text-[8px] text-white font-medium">
                      {customStats.calculatorMode === 'expert' ? 'EXP' : 'NOR'}
                    </span>
                  </span>
                </button>
              </div>

              {/* Expert Options */}
              {customStats.calculatorMode === 'expert' && (
                <div className="space-y-1 pl-2 border-l-2 border-purple-600/30">
                  {[
                    { key: 'damageIncrease', label: 'DMG Increase' },
                    { key: 'defensePenetration', label: 'DEF Penetration' },
                    { key: 'precision', label: 'Precision' },
                    { key: 'criticalDamage', label: 'Critical Damage' }
                  ].map(setting => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <span className="text-white/60 text-[9px]">{setting.label}</span>
                      <button
                        onClick={() => handleStatChange(`expertSettings.${setting.key}`, !customStats.expertSettings[setting.key])}
                        className={`relative w-8 h-4 rounded-full transition-colors ${customStats.expertSettings[setting.key] ? 'bg-purple-600/70' : 'bg-indigo-900/30'
                          }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white/90 rounded-full transition-transform ${customStats.expertSettings[setting.key] ? 'translate-x-4' : 'translate-x-0'
                            }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer ultra minimal */}
        <div className="bg-indigo-900/20 px-4 py-1.5">
          <p className="text-center text-white/30 text-xs">
            BUILDERBERU V3 • {selectedCharacter ? characters[selectedCharacter]?.name : t('damageCalculator.noHunterSelected')}
          </p>
        </div>
      </div>

      {/* Popups */}
      {showBuffsPopup.character && (
        <CharacterBuffs
          selectedCharacter={selectedCharacter}
          characters={characters}
          activeBuffs={activeCharacterBuffsIndices} // 🗡️ KAISEL FIX: Passer les buffs actifs
          onClose={(selectedIndices) => {
            setShowBuffsPopup(prev => ({ ...prev, character: false }));
            // 🗡️ KAISEL FIX: Mettre à jour les indices si fournis
            if (selectedIndices) {
              setActiveCharacterBuffsIndices(selectedIndices);
              setActiveBuffsCount(prev => ({
                ...prev,
                character: selectedIndices.length
              }));
            }
          }}
          onApplyBuffs={(buffs) => {
            handleApplyBuffs('character', buffs);
          }}
        />
      )}

      {showBuffsPopup.team && (
        <TeamBuffs
          teamMembers={[selectedCharacter]} // 🔧 FIX: Passer le personnage sélectionné
          characters={characters}
          activeTeamBuffs={activeTeamBuffs}
          previousTeamSelection={teamBuffSelection}
          previousRaidSelection={raidBuffSelection}
          selectedCharacter={selectedCharacter} // 🔧 FIX: Ajouter cette prop
          onTeamSelectionChange={(team, raid) => {
            setTeamBuffSelection(team);
            setRaidBuffSelection(raid);
          }}
          onClose={(selectedBuffs) => {
            setShowBuffsPopup(prev => ({ ...prev, team: false }));
            if (selectedBuffs) {
              setActiveTeamBuffs(selectedBuffs);
              setActiveTeamBuffsCount(selectedBuffs.length);
            }
          }}
          onApplyBuffs={(buffs) => handleApplyBuffs('team', buffs)}
        />
      )}

      {showBuffsPopup.set && (
        <SetBuffs
          equippedSets={[]}
          onClose={() => setShowBuffsPopup(prev => ({ ...prev, set: false }))}
          onApplyBuffs={(buffs) => handleApplyBuffs('set', buffs)}
        />
      )}
    </div>
  );
};

export default DamageCalculator;