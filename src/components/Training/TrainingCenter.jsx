// src/components/Training/TrainingCenter.jsx
import React, { useState, useRef, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart, Bar, BarChart, Cell, Tooltip } from 'recharts';
import { weaponData, runesData, blessingStonesData, artifactData, shadowData } from '../../data/itemData';
import { characters } from '../../data/characters';

const TrainingCenter = () => {
  // 🎮 STATE MANAGEMENT
  const [mode, setMode] = useState('sung_hunters'); // sung_hunters ou hunters_only
  const [selectedTeam, setSelectedTeam] = useState({
    sung: 'jinwoo',
    hunters: ['minnie', 'gina', 'esil-radiru']
  });
  const [selectedHunter, setSelectedHunter] = useState(0); // Pour le mode hunters_only
  const [timeline, setTimeline] = useState([]);
  const [dpsMarkers, setDpsMarkers] = useState([]);
  const [dpsData, setDpsData] = useState([]);
  const [diffDpsData, setDiffDpsData] = useState([]);
  const [draggedSkill, setDraggedSkill] = useState(null);
  const [showMarkerInput, setShowMarkerInput] = useState(null);
  const [showTeamConfig, setShowTeamConfig] = useState(false);
  const [graphMode, setGraphMode] = useState('timeline');
  const [timelineLength, setTimelineLength] = useState(15);
  const [selectedAction, setSelectedAction] = useState(null);
  const [editingTime, setEditingTime] = useState(null);
  const [activeEffects, setActiveEffects] = useState([]); // Pour tracker les buffs/debuffs actifs
  const [analytics, setAnalytics] = useState({
    currentDPS: 0,
    peakDPS: 0,
    totalDamage: 0,
    efficiency: 0
  });

  // État pour la configuration complète de Sung
  const [sungConfig, setSungConfig] = useState({
    leftSet: '',
    leftSet1: '',
    leftSet2: '',
    rightSet: '',
    leftSplit: false,
    weapons: ['', ''],
    weaponStars: [0, 0],
    skills: Array(6).fill(null),
    blessings: Array(8).fill(null),
    baseStats: {
      str: 0,
      int: 0,
      vit: 0,
      per: 0,
      agi: 0
    },
    finalStats: {
      atk: '',
      tc: '',
      dcc: '',
      di: '',
      defPen: '',
      precision: '',
      mpcr: '',
      mpa: ''
    }
  });

  // Fonction helper pour obtenir les données d'un personnage
  const getCharacterData = (characterId) => {
    return characters[characterId] || null;
  };

  // Get skill icon based on element and type
  const getSkillIcon = (skill) => {
    const elementIcons = {
      'Fire': '🔥',
      'Water': '💧',
      'Wind': '🌪️',
      'Light': '⚡',
      'Dark': '🌑',
      'none': '✨'
    };

    const typeIcons = {
      'basicSkills': '⚔️',
      'Ultimate': '💥',
      'death': '💀',
      'collapse': '⚠️',
      'Shadow Step': '🌑'
    };

    return elementIcons[skill?.element] || typeIcons[skill?.class] || '✨';
  };

  // Get rarity color
  const getRarityColor = (rarity) => {
    const colors = {
      'rare': 'border-blue-500 bg-blue-500/20',
      'epic': 'border-purple-500 bg-purple-500/20',
      'legendary': 'border-yellow-500 bg-yellow-500/20',
      'mythic': 'border-red-500 bg-red-500/20'
    };
    return colors[rarity?.toLowerCase()] || colors['mythic'];
  };

  // Filter skills by type from runesData
  const basicSkills = runesData.filter(r => r.class === 'basicSkills');
  const collapseSkills = runesData.filter(r => r.class === 'collapse');
  const deathSkills = runesData.filter(r => r.class === 'death');
  const ultimateSkills = runesData.filter(r => r.class === 'Ultimate');
  const shadowStepSkills = runesData.filter(r => r.class === 'Shadow Step');

  // Filter artifacts by side
  const leftArtifacts = artifactData.filter(a => a.side === 'L');
  const rightArtifacts = artifactData.filter(a => a.side === 'R');

  // 🎨 HUNTER SKILLS TEMPLATES
  const hunterSupportTemplate = {
    support: { name: 'Support', icon: '🛡️', category: 'support' }
  };

  const hunterSkillsTemplate = {
    coreAttack1: { name: 'Core Attack 1', icon: '⚔️', category: 'core' },
    coreAttack2: { name: 'Core Attack 2', icon: '🗡️', category: 'core' },
    skill1: { name: 'Skill 1', icon: '🌟', category: 'skill' },
    skill2: { name: 'Skill 2', icon: '✨', category: 'skill' },
    ultimate: { name: 'Ultimate', icon: '💥', category: 'ultimate' },
    qte: { name: 'QTE Switch', icon: '🔄', category: 'qte' }
  };

  // 💰 PARSE DAMAGE INPUT
  const parseDamageInput = (input) => {
    if (!input) return 0;
    const str = input.toString().toLowerCase();

    if (str.includes('b')) {
      return parseFloat(str.replace('b', '')) * 1000000000;
    } else if (str.includes('m')) {
      return parseFloat(str.replace('m', '')) * 1000000;
    } else if (str.includes('k')) {
      return parseFloat(str.replace('k', '')) * 1000;
    }

    return parseFloat(str) || 0;
  };

  // 📊 FORMAT DAMAGE DISPLAY
  const formatDamage = (damage) => {
    if (damage >= 1000000000) return `${(damage / 1000000000).toFixed(1)}B`;
    if (damage >= 1000000) return `${(damage / 1000000).toFixed(1)}M`;
    if (damage >= 1000) return `${(damage / 1000).toFixed(1)}K`;
    return damage.toString();
  };

  // 📊 DPS CALCULATION
  const calculateDPS = (newTimeline = timeline, newMarkers = dpsMarkers) => {
    const maxTime = Math.max(timelineLength, Math.max(...newMarkers.map(m => m.timestamp)) + 2);
    const data = [];
    const diffData = [];

    const sortedMarkers = [...newMarkers].sort((a, b) => a.timestamp - b.timestamp);

    for (let t = 0; t <= maxTime; t += 0.2) {
      let instantDPS = 0;
      let cumulativeDamage = 0;

      if (sortedMarkers.length >= 2) {
        const beforeMarker = sortedMarkers.filter(m => m.timestamp <= t).pop();
        const afterMarker = sortedMarkers.find(m => m.timestamp > t);

        if (beforeMarker && afterMarker) {
          const ratio = (t - beforeMarker.timestamp) / (afterMarker.timestamp - beforeMarker.timestamp);
          const interpolatedDPS = beforeMarker.damage + (afterMarker.damage - beforeMarker.damage) * ratio;
          instantDPS = interpolatedDPS;
          cumulativeDamage = beforeMarker.cumulativeDamage || 0;
        } else if (beforeMarker) {
          instantDPS = beforeMarker.damage;
          cumulativeDamage = beforeMarker.cumulativeDamage || 0;
        }
      } else if (sortedMarkers.length === 1 && t >= sortedMarkers[0].timestamp) {
        instantDPS = sortedMarkers[0].damage;
      }

      data.push({
        time: Number(t.toFixed(1)),
        dps: instantDPS,
        totalDamage: cumulativeDamage
      });
    }

    for (let i = 0; i < sortedMarkers.length - 1; i++) {
      const current = sortedMarkers[i];
      const next = sortedMarkers[i + 1];
      const timeDiff = next.timestamp - current.timestamp;
      const damageDiff = (next.damage - current.damage) * timeDiff;

      diffData.push({
        period: `${current.timestamp}s-${next.timestamp}s`,
        damage: Math.max(0, damageDiff),
        startTime: current.timestamp,
        endTime: next.timestamp,
        color: damageDiff >= 0 ? '#10b981' : '#ef4444'
      });
    }

    setDiffDpsData(diffData);
    return data;
  };

  // 🎯 UPDATE ANALYTICS
  const updateAnalytics = (newTimeline, newMarkers) => {
    const data = calculateDPS(newTimeline, newMarkers);
    setDpsData(data);

    if (data.length === 0 || newMarkers.length === 0) return;

    const peakDPS = Math.max(...newMarkers.map(m => m.damage));
    const totalDamage = newMarkers.length > 0 ?
      newMarkers[newMarkers.length - 1].damage * timelineLength : 0;
    const avgDPS = totalDamage / timelineLength;

    setAnalytics({
      currentDPS: newMarkers[newMarkers.length - 1]?.damage || 0,
      peakDPS,
      totalDamage,
      efficiency: peakDPS > 0 ? Math.min(95, (avgDPS / peakDPS) * 100) : 0
    });
  };

  // Update timeline length based on markers
  useEffect(() => {
    if (dpsMarkers.length > 0) {
      const maxMarkerTime = Math.max(...dpsMarkers.map(m => m.timestamp));
      if (maxMarkerTime > timelineLength) {
        setTimelineLength(Math.ceil(maxMarkerTime / 5) * 5);
      }
    }
  }, [dpsMarkers]);

  // Generate timeline marks
  const generateTimelineMarks = () => {
    const marks = [];
    const step = timelineLength <= 20 ? 3 : timelineLength <= 30 ? 5 : 10;
    for (let i = 0; i <= timelineLength; i += step) {
      marks.push(i);
    }
    return marks;
  };

const handleSungSkillDragStart = (skill, type, index) => {
  // Pour les skills configurés
  if (type === 'skill') {
    setDraggedSkill({
      ...skill,
      hunterId: 'jinwoo',
      hunterIndex: -1,
      isSupport: false,
      hunterName: 'Sung Jinwoo',
      hunterIcon: characters['jinwoo']?.icon,
      color: '#A855F7',
      skillType: type,
      skillIndex: index,
      effects: skill?.effects, // skill a déjà les effects
      src: skill?.src, // skill a déjà src
      icon: getSkillIcon(skill)
    });
  }
  // Pour les armes configurées
  else if (type === 'weapon') {
    const weaponName = sungConfig.weapons[index];
    const weapon = weaponData.find(w => w.name === weaponName);

    if (!weapon) return;

    setDraggedSkill({
      ...skill,
      hunterId: 'jinwoo',
      hunterIndex: -1,
      isSupport: false,
      hunterName: 'Sung Jinwoo',
      hunterIcon: characters['jinwoo']?.icon,
      color: '#A855F7',
      skillType: type,
      skillIndex: index,
      weaponData: weapon,
      icon: weapon.src ? '🗡️' : (index === 0 ? '🗡️' : '⚔️')
    });
  }
  // Pour les autres skills (Attack, Dash, etc.)
  else {
    setDraggedSkill({
      ...skill,
      hunterId: 'jinwoo',
      hunterIndex: -1,
      isSupport: false,
      hunterName: 'Sung Jinwoo',
      hunterIcon: characters['jinwoo']?.icon,
      color: '#A855F7',
      skillType: type,
      skillIndex: index
    });
  }
};

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // 📍 DROP HANDLER sur la rotation
  const handleRotationDrop = (e) => {
    e.preventDefault();

    if (!draggedSkill) return;

    // Nouveau skill ajouté à la rotation
    const action = {
      id: Date.now() + Math.random(),
      hunterId: draggedSkill.hunterId,
      hunterIndex: draggedSkill.hunterIndex,
      isSupport: draggedSkill.isSupport,
      hunterName: draggedSkill.hunterName,
      hunterIcon: draggedSkill.hunterIcon,
      skillId: draggedSkill.id || draggedSkill.skillId,
      name: draggedSkill.name,
      icon: draggedSkill.icon,
      timestamp: timeline.length * 0.5, // Position par défaut
      color: draggedSkill.color,
      skillType: draggedSkill.skillType,
      element: draggedSkill.element,
      weaponData: draggedSkill.weaponData,
      src: draggedSkill.src,
      effects: draggedSkill.effects, // Ajoute cette ligne
    };

    const newTimeline = [...timeline, action].sort((a, b) => a.timestamp - b.timestamp);
    setTimeline(newTimeline);
    setDraggedSkill(null);
  };

  // Gestion du clic sur une action dans la rotation
  const handleActionClick = (action) => {
    setSelectedAction(action);
    setEditingTime(action.timestamp.toString());
  };

  // Mise à jour du temps d'une action
  const updateActionTime = (actionId, newTime) => {
    const parsedTime = parseFloat(newTime);
    if (isNaN(parsedTime) || parsedTime < 0) return;

    const newTimeline = timeline.map(action =>
      action.id === actionId
        ? { ...action, timestamp: parsedTime }
        : action
    ).sort((a, b) => a.timestamp - b.timestamp);

    setTimeline(newTimeline);
  };

  // Suppression d'une action de la rotation
  const removeFromRotation = (actionId) => {
    const newTimeline = timeline.filter(a => a.id !== actionId);
    setTimeline(newTimeline);
    setSelectedAction(null);
    setEditingTime(null);
  };

  // Fonction pour échanger deux actions dans la rotation
  const swapActions = (draggedId, targetId) => {
    const draggedIndex = timeline.findIndex(a => a.id === draggedId);
    const targetIndex = timeline.findIndex(a => a.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newTimeline = [...timeline];
    const draggedTime = newTimeline[draggedIndex].timestamp;
    const targetTime = newTimeline[targetIndex].timestamp;

    newTimeline[draggedIndex].timestamp = targetTime;
    newTimeline[targetIndex].timestamp = draggedTime;

    setTimeline(newTimeline.sort((a, b) => a.timestamp - b.timestamp));
  };

  // 📌 MARKER HANDLERS
  const handleMarkerZoneClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const timelineWidth = rect.width;
    const timestamp = (x / timelineWidth) * timelineLength;

    setShowMarkerInput({
      timestamp: Math.round(timestamp * 10) / 10,
      x: x,
      damage: ''
    });
  };

  const saveDpsMarker = (timestamp, damageInput) => {
    const damage = parseDamageInput(damageInput);
    const marker = {
      id: Date.now(),
      timestamp,
      damage
    };

    const newMarkers = [...dpsMarkers, marker].sort((a, b) => a.timestamp - b.timestamp);
    setDpsMarkers(newMarkers);
    updateAnalytics(timeline, newMarkers);
    setShowMarkerInput(null);
  };

  const removeMarker = (markerId) => {
    const newMarkers = dpsMarkers.filter(marker => marker.id !== markerId);
    setDpsMarkers(newMarkers);
    updateAnalytics(timeline, newMarkers);
  };

  const clearAll = () => {
    setTimeline([]);
    setDpsMarkers([]);
    setDpsData([]);
    setDiffDpsData([]);
    setTimelineLength(15);
    setAnalytics({ currentDPS: 0, peakDPS: 0, totalDamage: 0, efficiency: 0 });
  };

  // Change hunter in team
  const changeHunter = (index, newHunterId) => {
    const newTeam = { ...selectedTeam };
    newTeam.hunters[index] = newHunterId;
    setSelectedTeam(newTeam);
  };

  // Update Sung configuration
  const updateSungConfig = (field, value) => {
    setSungConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Convertir l'objet characters en tableau pour l'affichage
  const charactersArray = Object.entries(characters).map(([id, char]) => ({ id, ...char }));

  return (
    <div className="min-h-screen bg-[#0f0f1e] text-white">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] border-b border-purple-500/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-4xl animate-pulse">🏋️</div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Training Center
                </h1>
                <p className="text-purple-300 text-sm">Optimiseur de Rotations DPS</p>
              </div>
            </div>
            <div className="flex gap-3">
              {/* Mode Selector */}
              <button
                onClick={() => setMode(mode === 'sung_hunters' ? 'hunters_only' : 'sung_hunters')}
                className="bg-purple-600/20 border border-purple-500 text-purple-300 px-6 py-2.5 rounded-lg font-bold hover:bg-purple-600/30 transition-all flex items-center gap-2"
              >
                {mode === 'sung_hunters' ? '👤' : '👥'}
                {mode === 'sung_hunters' ? 'Sung + 3 Hunters' : '3 Hunters Only'}
              </button>

              <button
                onClick={() => setShowTeamConfig(true)}
                className="bg-blue-600/20 border border-blue-500 text-blue-300 px-6 py-2.5 rounded-lg font-bold hover:bg-blue-600/30 transition-all"
              >
                ⚙️ Config
              </button>

              <button
                onClick={clearAll}
                className="bg-red-600/20 border border-red-500 text-red-300 px-6 py-2.5 rounded-lg font-bold hover:bg-red-600/30 transition-all"
              >
                🗑️ Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-4">
          {/* LEFT PANEL - SKILLS */}
          <div className="col-span-3 space-y-4">
            {/* Mode-specific Skills */}
            {mode === 'sung_hunters' ? (
              <>
                {/* Sung Skills Panel */}
                <div className="bg-[#1a1a2e]/80 backdrop-blur border border-purple-500/30 rounded-xl p-4 shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="text-2xl">⚔️</div>
                    <h3 className="text-lg font-bold text-purple-400">SUNG JINWOO SKILLS</h3>
                  </div>

                  {/* Core Skills */}
                  <div className="mb-3">
                    <h4 className="text-xs font-bold text-purple-300 mb-2 uppercase">Core Skills</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div
                        draggable
                        onDragStart={() => handleSungSkillDragStart({
                          name: 'Attack',
                          icon: '⚔️',
                          category: 'core'
                        }, 'core', -1)}
                        className="p-2 bg-purple-900/30 border border-purple-500/50 rounded-lg cursor-grab active:cursor-grabbing hover:bg-purple-800/40 hover:border-purple-400 transition-all"
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-xl">⚔️</span>
                          <span className="text-xs font-medium mt-1">Attack</span>
                        </div>
                      </div>
                      <div
                        draggable
                        onDragStart={() => handleSungSkillDragStart({
                          name: 'Dash',
                          icon: '💨',
                          category: 'movement'
                        }, 'movement', -1)}
                        className="p-2 bg-purple-900/30 border border-purple-500/50 rounded-lg cursor-grab active:cursor-grabbing hover:bg-purple-800/40 hover:border-purple-400 transition-all"
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-xl">💨</span>
                          <span className="text-xs font-medium mt-1">Dash</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Configured Skills */}
                  <div className="mb-3">
                    <h4 className="text-xs font-bold text-purple-300 mb-2 uppercase">Configured Skills (6)</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {sungConfig.skills.map((skill, idx) => {
                        if (!skill) {
                          return (
                            <div key={idx} className="p-2 bg-gray-800/30 border border-gray-600/50 rounded-lg opacity-50">
                              <div className="flex flex-col items-center">
                                <span className="text-lg">❓</span>
                                <span className="text-xs text-gray-500">
                                  {idx < 2 ? `Basic ${idx + 1}` :
                                    idx === 2 ? 'Ultimate' :
                                      idx === 3 ? 'Death' :
                                        idx === 4 ? 'Collapse' : 'Shadow'}
                                </span>
                              </div>
                            </div>
                          );
                        }

                        // const skillData = runesData.find(r => r.name === skill.name);

                        return (
                          <div
                            key={idx}
                            draggable
                            onDragStart={() => handleSungSkillDragStart(skill, 'skill', idx)}
                            className={`p-2 border rounded-lg cursor-grab active:cursor-grabbing hover:opacity-80 transition-all ${getRarityColor(skill.rarity)
                              }`}
                          >
                            <div className="flex flex-col items-center">
                              {skill?.src ? (
  <img src={skill.src} alt={skill.name} className="w-8 h-8 object-cover rounded" />
) : (
  <span className="text-lg">{getSkillIcon(skill)}</span>
)}
                              <span className="text-xs font-medium truncate w-full text-center">
                                {skill.name}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Weapon Skills */}
                  <div>
                    <h4 className="text-xs font-bold text-purple-300 mb-2 uppercase">Weapon Skills</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {sungConfig.weapons.map((weaponName, idx) => {
                        const weapon = weaponData.find(w => w.name === weaponName);

                        return (
                          <div
                            key={idx}
                            draggable={!!weaponName}
                            onDragStart={() => weaponName && handleSungSkillDragStart({
                              name: weapon?.name || `Weapon ${idx + 1}`,
                              icon: '🗡️',
                              category: 'weapon',
                              weaponName: weaponName
                            }, 'weapon', idx)}
                            className={`p-2 ${weaponName ? 'bg-cyan-900/30 border border-cyan-500/50 cursor-grab active:cursor-grabbing hover:bg-cyan-800/40' : 'bg-gray-800/30 border border-gray-600/50 opacity-50'} rounded-lg transition-all`}
                          >
                            <div className="flex flex-col items-center">
                              {weapon?.src ? (
                                <img src={weapon.src} alt={weapon.name} className="w-8 h-8 object-cover rounded" />
                              ) : (
                                <span className="text-lg">{idx === 0 ? '🗡️' : '⚔️'}</span>
                              )}
                              <span className="text-xs font-medium truncate w-full text-center">
                                {weaponName || `Weapon ${idx + 1}`}
                              </span>
                              {weaponName && sungConfig.weaponStars[idx] > 0 && (
                                <span className="text-[10px] text-yellow-400">
                                  ⭐ {sungConfig.weaponStars[idx]}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Support Hunters - PAS DE QTE */}
                <div className="bg-[#1a1a2e]/80 backdrop-blur border border-cyan-500/30 rounded-xl p-4 shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="text-2xl">🛡️</div>
                    <h3 className="text-lg font-bold text-cyan-400">SUPPORT HUNTERS</h3>
                  </div>

                  <div className="space-y-3">
                    {selectedTeam.hunters.map((hunterId, idx) => {
                      const hunter = getCharacterData(hunterId);
                      if (!hunter) return null;

                      return (
                        <div key={idx} className="space-y-2">
                          <div className="flex items-center gap-2 mb-2">
                            <img
                              src={hunter.icon}
                              alt={hunter.name}
                              className="w-8 h-8 rounded-full ring-2 ring-cyan-500/50"
                            />
                            <span className="text-sm font-medium" style={{ color: hunter.color || '#06B6D4' }}>
                              {hunter.name}
                            </span>
                          </div>

                          <div
                            draggable
                            onDragStart={() => handleDragStart({
                              id: `${hunterId}_support_${idx}`,
                              name: `Support ${idx + 1}`,
                              icon: '🛡️',
                              category: 'support'
                            }, hunterId, idx, true)}
                            className="p-2 bg-gray-800/50 border border-gray-600 rounded cursor-grab active:cursor-grabbing hover:bg-gray-700/50 hover:border-cyan-400 transition-all relative"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🛡️</span>
                              <span className="text-xs">Support {idx + 1}</span>
                              <img
                                src={hunter.icon}
                                alt={hunter.name}
                                className="ml-auto w-4 h-4 rounded-full opacity-70"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              /* HUNTERS ONLY MODE */
              <div className="bg-[#1a1a2e]/80 backdrop-blur border border-purple-500/30 rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-2xl">👥</div>
                  <h3 className="text-lg font-bold text-cyan-400">HUNTER SKILLS</h3>
                </div>

                {/* Hunter Selector */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {selectedTeam.hunters.map((hunterId, idx) => {
                    const hunter = getCharacterData(hunterId);
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedHunter(idx)}
                        className={`p-3 rounded-lg transition-all ${selectedHunter === idx
                            ? 'bg-cyan-600/30 border-2 border-cyan-400 shadow-lg'
                            : 'bg-gray-800/50 border-2 border-gray-600 hover:bg-gray-700/50'
                          }`}
                      >
                        {hunter && (
                          <img
                            src={hunter.icon}
                            alt={hunter.name}
                            className="w-12 h-12 rounded-full mx-auto mb-1"
                          />
                        )}
                        <div className="text-xs font-medium">{hunter?.name || 'Empty'}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Hunter Skills */}
                {(() => {
                  const hunterId = selectedTeam.hunters[selectedHunter];
                  const hunter = getCharacterData(hunterId);

                  if (!hunter) return <div className="text-center text-gray-500">Select a hunter</div>;

                  return (
                    <div>
                      <h4 className="text-sm font-medium text-center mb-3" style={{ color: hunter.color || '#06B6D4' }}>
                        {hunter.name} Skills
                      </h4>

                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(hunterSkillsTemplate).map(([key, skill]) => {
                          const skillData = {
                            id: `${hunterId}_${key}_${selectedHunter}`,
                            ...skill
                          };

                          return (
                            <div
                              key={key}
                              draggable
                              onDragStart={() => handleDragStart(skillData, hunterId, selectedHunter)}
                              className="p-2 bg-gray-800/50 border border-gray-600 rounded cursor-grab active:cursor-grabbing hover:bg-gray-700/50 hover:border-cyan-400 transition-all relative"
                            >
                              <div className="flex items-center gap-1">
                                <span className="text-lg">{skill.icon}</span>
                                <span className="text-xs">{skill.name}</span>
                              </div>
                              <img
                                src={hunter.icon}
                                alt={hunter.name}
                                className="absolute bottom-1 right-1 w-4 h-4 rounded-full opacity-70"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* MAIN PANEL */}
          <div className="col-span-6 space-y-4">
            {/* DPS MARKERS ZONE */}
            <div className="bg-[#1a1a2e]/80 backdrop-blur border border-yellow-500/30 rounded-xl p-5 shadow-xl">
              <h3 className="text-lg font-bold mb-4 text-yellow-400 flex items-center gap-2">
                📌 DPS Markers ({timelineLength}s)
              </h3>

              <div className="relative">
                <div className="flex justify-between text-xs text-gray-500 mb-2 px-1">
                  {generateTimelineMarks().map(time => (
                    <span key={time}>{time}s</span>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <div
                    className="relative h-16 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg border-2 border-dashed border-yellow-600/50 hover:border-yellow-500 transition-all cursor-crosshair"
                    style={{
                      width: timelineLength > 20 ? `${(timelineLength / 15) * 100}%` : '100%',
                      minWidth: '100%'
                    }}
                    onClick={handleMarkerZoneClick}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-yellow-500/50 text-sm">
                      {dpsMarkers.length === 0 && "Click to add DPS markers"}
                    </div>

                    {dpsMarkers.map((marker) => {
                      const leftPosition = (marker.timestamp / timelineLength) * 100;
                      return (
                        <div
                          key={marker.id}
                          className="absolute top-2 h-12 flex items-center cursor-pointer group"
                          style={{ left: `${leftPosition}%`, transform: 'translateX(-50%)' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMarker(marker.id);
                          }}
                        >
                          <div className="w-6 h-6 bg-yellow-500 rounded-full ring-2 ring-yellow-300 group-hover:scale-125 transition-all shadow-lg" />
                          <div className="absolute top-full mt-1 bg-black/90 rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                            <div className="text-yellow-400 font-medium">
                              {marker.timestamp}s: {formatDamage(marker.damage)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* SKILLS ROTATION - Zone éditable */}
            <div className="bg-[#1a1a2e]/80 backdrop-blur border border-cyan-500/30 rounded-xl p-5 shadow-xl">
              <h3 className="text-lg font-bold mb-4 text-cyan-400 flex items-center gap-2">
                🎬 Skills Rotation
                <span className="text-xs text-gray-400 font-normal ml-2">
                  (Drag skills here, click to set precise timing)
                </span>
              </h3>

              <div
                className="min-h-[120px] bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg border-2 border-dashed border-cyan-600/50 p-4"
                onDragOver={handleDragOver}
                onDrop={handleRotationDrop}
              >
                {timeline.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    📥 Drop skills here to build your rotation
                  </div>
                ) : (
                  <div className="grid grid-cols-6 gap-3">
                    {timeline.map((action, index) => (
                      <div
                        key={action.id}
                        className={`relative group cursor-pointer transition-all ${selectedAction?.id === action.id ? 'ring-2 ring-cyan-400 scale-105' : ''
                          }`}
                        onClick={() => handleActionClick(action)}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('actionId', action.id)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const draggedId = e.dataTransfer.getData('actionId');
                          swapActions(draggedId, action.id);
                        }}
                      >
                        {/* Skill Icon */}
                        <div
                          className="w-16 h-16 rounded-lg flex items-center justify-center text-lg font-medium border-2 shadow-lg relative"
                          style={{
                            backgroundColor: action.color + '20',
                            borderColor: action.color,
                            color: 'white'
                          }}
                        >
                          {action.weaponData?.src ? (
                            <img src={action.weaponData.src} alt={action.name} className="w-10 h-10 object-cover rounded" />
                          ) : action.src ? (
                            <img src={action.src} alt={action.name} className="w-10 h-10 object-cover rounded" />
                          ) : (
                            <span>{action.icon}</span>
                          )}

                          {action.hunterIcon && (
                            <img
                              src={action.hunterIcon}
                              alt={action.hunterName}
                              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full ring-2 ring-white/50"
                            />
                          )}
                        </div>

                        {/* Position Number */}
                        <div className="absolute -top-2 -left-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>

                        {/* Time Display */}
                        <div className="text-center mt-1">
                          <div className="text-xs font-medium" style={{ color: action.color }}>
                            {action.timestamp}s
                          </div>
                          <div className="text-[10px] text-gray-400 truncate max-w-[64px]">
                            {action.name}
                          </div>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromRotation(action.id);
                          }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Time Editor for selected action */}
              {selectedAction && (
                <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-cyan-500/30">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-cyan-400">
                      Editing: {selectedAction.name}
                    </span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={editingTime}
                      onChange={(e) => setEditingTime(e.target.value)}
                      onBlur={() => {
                        updateActionTime(selectedAction.id, editingTime);
                      }}
                      className="w-20 px-2 py-1 bg-gray-900 border border-gray-600 rounded text-white text-sm"
                    />
                    <span className="text-sm text-gray-400">seconds</span>
                    <button
                      onClick={() => {
                        updateActionTime(selectedAction.id, editingTime);
                        setSelectedAction(null);
                        setEditingTime(null);
                      }}
                      className="ml-auto px-3 py-1 bg-cyan-600/20 border border-cyan-500 text-cyan-300 rounded text-sm hover:bg-cyan-600/30"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* DPS GRAPH */}
            <div className="bg-[#1a1a2e]/80 backdrop-blur border border-purple-500/30 rounded-xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-purple-400">📈 DPS Analysis</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGraphMode('timeline')}
                    className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${graphMode === 'timeline'
                        ? 'bg-purple-600/30 text-purple-300 border border-purple-500'
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                      }`}
                  >
                    Timeline
                  </button>
                  <button
                    onClick={() => setGraphMode('difference')}
                    className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${graphMode === 'difference'
                        ? 'bg-purple-600/30 text-purple-300 border border-purple-500'
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                      }`}
                  >
                    Difference
                  </button>
                </div>
              </div>

              <div className="h-64 -mx-2">
                {graphMode === 'timeline' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dpsData} margin={{ top: 10, right: 30, left: 50, bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis
                        dataKey="time"
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        label={{ value: 'Time (s)', position: 'insideBottom', offset: -10, fill: '#6B7280' }}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        label={{ value: 'DPS', angle: -90, position: 'insideLeft', fill: '#6B7280' }}
                        tickFormatter={(value) => formatDamage(value)}
                      />
                      <Tooltip
                        formatter={(value) => formatDamage(value)}
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="dps"
                        stroke="#A78BFA"
                        fill="url(#gradientPurple)"
                        strokeWidth={3}
                      />
                      <defs>
                        <linearGradient id="gradientPurple" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#A78BFA" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={diffDpsData} margin={{ top: 10, right: 30, left: 50, bottom: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis
                        dataKey="period"
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF', fontSize: 11 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        tickFormatter={(value) => formatDamage(value)}
                      />
                      <Bar dataKey="damage" radius={[8, 8, 0, 0]}>
                        {diffDpsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

     {/* BUFFS & DEBUFFS TIMELINE - Version avec lignes séparées */}
<div className="bg-[#1a1a2e]/80 backdrop-blur border border-red-500/30 rounded-xl p-5 shadow-xl">
  <h3 className="text-lg font-bold mb-4 text-red-400 flex items-center gap-2">
    ⚔️ Active Effects Timeline
  </h3>
  
  <div className="space-y-2">
    {/* Timeline marks */}
    <div className="flex justify-between text-xs text-gray-500 px-1">
      {generateTimelineMarks().map(time => (
        <span key={time}>{time}s</span>
      ))}
    </div>

    {/* Une ligne par type de debuff */}
    {(() => {
      const debuffTypes = {};
      timeline.filter(action => action.effects?.debuffs).forEach(action => {
        action.effects.debuffs.forEach(debuff => {
          if (!debuffTypes[debuff.type]) {
            debuffTypes[debuff.type] = [];
          }
          debuffTypes[debuff.type].push({
            ...debuff,
            timestamp: action.timestamp,
            actionId: action.id
          });
        });
      });

      return Object.entries(debuffTypes).map(([type, debuffs]) => (
        <div key={type} className="relative h-8 bg-gray-800/30 rounded-lg border border-red-900/50">
          <div className="absolute -left-24 top-1/2 -translate-y-1/2 text-[10px] text-red-400 w-20 text-right">
            {type.replace(/_/g, ' ').slice(0, 15)}
          </div>
          {debuffs.map((debuff, idx) => {
            const startPos = (debuff.timestamp / timelineLength) * 100;
            const width = (debuff.duration / timelineLength) * 100;
            
            return (
              <div
                key={`${debuff.actionId}-${idx}`}
                className="absolute h-5 top-1.5 rounded cursor-pointer group hover:z-10"
                style={{
                  left: `${startPos}%`,
                  width: `${width}%`,
                  backgroundColor: debuff.color + '60',
                  border: `1px solid ${debuff.color}`
                }}
              >
                <div className="flex items-center justify-center h-full">
                  <span className="text-xs">{debuff.icon}</span>
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black/95 rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20">
                  <div className="text-yellow-400">{debuff.value}% for {debuff.duration}s</div>
                </div>
              </div>
            );
          })}
        </div>
      ));
    })()}

    {/* Une ligne par type de buff personnel */}
    {(() => {
      const buffTypes = {};
      timeline.filter(action => action.effects?.buffs).forEach(action => {
        action.effects.buffs.forEach(buff => {
          if (!buffTypes[buff.type]) {
            buffTypes[buff.type] = [];
          }
          buffTypes[buff.type].push({
            ...buff,
            timestamp: action.timestamp,
            actionId: action.id
          });
        });
      });

      return Object.entries(buffTypes).map(([type, buffs]) => (
        <div key={type} className="relative h-8 bg-gray-800/30 rounded-lg border border-green-900/50">
          <div className="absolute -left-24 top-1/2 -translate-y-1/2 text-[10px] text-green-400 w-20 text-right">
            {type.replace(/_/g, ' ').slice(0, 15)}
          </div>
          {buffs.map((buff, idx) => {
            const startPos = (buff.timestamp / timelineLength) * 100;
            const width = buff.duration === 'instant' ? 1 : (buff.duration / timelineLength) * 100;
            
            return (
              <div
                key={`${buff.actionId}-${idx}`}
                className="absolute h-5 top-1.5 rounded cursor-pointer group hover:z-10"
                style={{
                  left: `${startPos}%`,
                  width: `${width}%`,
                  backgroundColor: buff.color + '60',
                  border: `1px solid ${buff.color}`
                }}
              >
                <div className="flex items-center justify-center h-full">
                  <span className="text-xs">{buff.icon}</span>
                </div>
                
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black/95 rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20">
                  <div className="text-green-400">Duration: {buff.duration}s</div>
                </div>
              </div>
            );
          })}
        </div>
      ));
    })()}
  </div>
</div>

          </div>

          {/* RIGHT PANEL - TEAM & ANALYTICS */}
          <div className="col-span-3 space-y-4">
            {/* ACTIVE TEAM */}
            <div className="bg-[#1a1a2e]/80 backdrop-blur border border-purple-500/30 rounded-xl p-4 shadow-xl">
              <h3 className="text-sm font-bold mb-3 text-purple-400 uppercase tracking-wider">Active Team</h3>
              <div className="space-y-2">
                {mode === 'sung_hunters' && (
                  <div className="flex items-center gap-3 p-2 bg-purple-900/20 rounded-lg">
                    <img
                      src={characters['jinwoo']?.icon || "https://via.placeholder.com/40"}
                      alt="Sung"
                      className="w-10 h-10 rounded-full ring-2 ring-purple-500/50"
                    />
                    <div>
                      <div className="text-sm font-medium text-purple-300">Sung Jinwoo</div>
                      <div className="text-xs text-purple-400/70">Shadow Monarch</div>
                    </div>
                  </div>
                )}

                {selectedTeam.hunters.map((hunterId, idx) => {
                  const hunter = getCharacterData(hunterId);
                  if (!hunter) return null;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-all cursor-pointer ${mode === 'hunters_only' && selectedHunter === idx
                          ? 'bg-cyan-900/30 ring-1 ring-cyan-400'
                          : 'bg-gray-800/30 hover:bg-gray-700/30'
                        }`}
                      onClick={() => mode === 'hunters_only' && setSelectedHunter(idx)}
                    >
                      <img
                        src={hunter.icon}
                        alt={hunter.name}
                        className="w-10 h-10 rounded-full ring-2 ring-gray-600/50"
                      />
                      <div>
                        <div className="text-sm font-medium" style={{ color: hunter.color || '#06B6D4' }}>{hunter.name}</div>
                        <div className="text-xs text-gray-500">
                          {mode === 'sung_hunters' ? 'Support' : hunter.class}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ANALYTICS */}
            <div className="bg-[#1a1a2e]/80 backdrop-blur border border-green-500/30 rounded-xl p-4 shadow-xl">
              <h3 className="text-sm font-bold mb-3 text-green-400 uppercase tracking-wider">Analytics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Peak DPS</span>
                  <span className="text-yellow-400 font-bold">
                    {formatDamage(Math.round(analytics.peakDPS))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total Damage</span>
                  <span className="text-purple-400 font-bold">
                    {formatDamage(Math.round(analytics.totalDamage))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Average DPS</span>
                  <span className="text-cyan-400 font-bold">
                    {formatDamage(Math.round(analytics.totalDamage / timelineLength))}
                  </span>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Efficiency</span>
                    <span className="text-blue-400 font-bold">{Math.round(analytics.efficiency)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${analytics.efficiency}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ROTATION SUMMARY */}
            {timeline.length > 0 && (
              <div className="bg-[#1a1a2e]/80 backdrop-blur border border-cyan-500/30 rounded-xl p-4 shadow-xl">
                <h3 className="text-sm font-bold mb-3 text-cyan-400 uppercase tracking-wider">
                  Rotation ({timeline.length})
                </h3>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {timeline.map((action, idx) => (
                    <div key={action.id} className="flex items-center justify-between bg-gray-800/50 rounded px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">#{idx + 1}</span>
                        {action.hunterIcon && (
                          <img src={action.hunterIcon} alt="" className="w-5 h-5 rounded-full" />
                        )}
                        <span className="text-sm">{action.icon}</span>
                        <span className="text-sm truncate max-w-[120px]">{action.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{action.timestamp}s</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MARKER INPUT MODAL */}
      {showMarkerInput && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1a1a2e] border border-purple-500/50 rounded-xl p-6 w-96 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-purple-400">Add DPS Marker</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Timestamp (s)</label>
                <input
                  type="number"
                  value={showMarkerInput.timestamp}
                  onChange={(e) => setShowMarkerInput({ ...showMarkerInput, timestamp: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-purple-400 focus:outline-none"
                  step="0.1"
                  min="0"
                  max={timelineLength}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">DPS Value</label>
                <input
                  type="text"
                  value={showMarkerInput.damage}
                  onChange={(e) => setShowMarkerInput({ ...showMarkerInput, damage: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-purple-400 focus:outline-none"
                  placeholder="e.g. 65M, 2.5B, 120K"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => saveDpsMarker(showMarkerInput.timestamp, showMarkerInput.damage)}
                  className="flex-1 bg-green-600/20 border border-green-500 text-green-300 py-2 rounded-lg font-medium hover:bg-green-600/30 transition-all"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowMarkerInput(null)}
                  className="flex-1 bg-gray-700/50 border border-gray-600 text-gray-300 py-2 rounded-lg font-medium hover:bg-gray-700/70 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TEAM CONFIG MODAL */}
      {showTeamConfig && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] border border-purple-500/50 rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-purple-400 text-center">Team Configuration</h3>

            {/* Sung Complete Config (only in sung_hunters mode) */}
            {mode === 'sung_hunters' && (
              <div className="mb-6 bg-gradient-to-br from-gray-900/90 to-gray-800/80 rounded-xl p-4 border border-purple-500/30">
                <h4 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
                  ⚔️ SUNG JINWOO
                </h4>

                <div className="grid grid-cols-4 gap-4">
                  {/* Col 1: Sets & Armes */}
                  <div className="space-y-3">
                    {/* Sets */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-xs font-semibold text-purple-300 uppercase">SETS</h5>
                        <label className="text-xs text-gray-400 flex items-center">
                          <input
                            type="checkbox"
                            checked={sungConfig.leftSplit}
                            onChange={(e) => updateSungConfig('leftSplit', e.target.checked)}
                            className="mr-1"
                          />
                          2+2
                        </label>
                      </div>
                      {sungConfig.leftSplit ? (
                        <div className="grid grid-cols-2 gap-1 mb-1">
                          <select
                            className="w-full bg-gray-800/80 text-white text-xs p-1 rounded border border-gray-700 focus:border-purple-500"
                            value={sungConfig.leftSet1 || ''}
                            onChange={(e) => updateSungConfig('leftSet1', e.target.value)}
                          >
                            <option value="">Set 1</option>
                            {leftArtifacts.map(artifact => (
                              <option key={artifact.set} value={artifact.set}>{artifact.set}</option>
                            ))}
                          </select>
                          <select
                            className="w-full bg-gray-800/80 text-white text-xs p-1 rounded border border-gray-700 focus:border-purple-500"
                            value={sungConfig.leftSet2 || ''}
                            onChange={(e) => updateSungConfig('leftSet2', e.target.value)}
                          >
                            <option value="">Set 2</option>
                            {leftArtifacts.map(artifact => (
                              <option key={artifact.set} value={artifact.set}>{artifact.set}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <select
                          className="w-full bg-gray-800/80 text-white text-xs p-1 rounded border border-gray-700 focus:border-purple-500 mb-1"
                          value={sungConfig.leftSet || ''}
                          onChange={(e) => updateSungConfig('leftSet', e.target.value)}
                        >
                          <option value="">Left Set</option>
                          {leftArtifacts.map(artifact => (
                            <option key={artifact.set} value={artifact.set}>{artifact.set}</option>
                          ))}
                        </select>
                      )}
                      <select
                        className="w-full bg-gray-800/80 text-white text-xs p-1 rounded border border-gray-700 focus:border-purple-500"
                        value={sungConfig.rightSet || ''}
                        onChange={(e) => updateSungConfig('rightSet', e.target.value)}
                      >
                        <option value="">Right Set</option>
                        {rightArtifacts.map(artifact => (
                          <option key={artifact.set} value={artifact.set}>{artifact.set}</option>
                        ))}
                      </select>
                    </div>

                    {/* Armes */}
                    <div>
                      <h5 className="text-xs font-semibold text-purple-300 mb-1 uppercase">ARMES</h5>
                      {[0, 1].map((idx) => (
                        <div key={idx} className="flex items-center gap-1 mb-1">
                          <select
                            className="flex-1 bg-gray-800/80 text-white text-xs p-1 rounded border border-gray-700 focus:border-purple-500"
                            value={sungConfig.weapons[idx] || ''}
                            onChange={(e) => {
                              const newWeapons = [...sungConfig.weapons];
                              newWeapons[idx] = e.target.value;
                              updateSungConfig('weapons', newWeapons);
                            }}
                          >
                            <option value="">Weapon
                              {idx + 1}</option>
                            {weaponData.map(weapon => (
                              <option key={weapon.name} value={weapon.name}>{weapon.name}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            value={sungConfig.weaponStars[idx] || 0}
                            onChange={(e) => {
                              const newStars = [...sungConfig.weaponStars];
                              newStars[idx] = parseInt(e.target.value) || 0;
                              updateSungConfig('weaponStars', newStars);
                            }}
                            className="w-10 bg-gray-800/80 text-white text-xs p-1 rounded text-center border border-gray-700 focus:border-purple-500"
                          />
                          <span className="text-yellow-400 text-xs">⭐</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Col 2: Compétences (6) */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-semibold text-purple-300 uppercase">COMPÉTENCES (6)</h5>
                    <div className="grid grid-cols-2 gap-1">
                      {[0, 1, 2, 3, 4, 5].map((idx) => {
                        const skill = sungConfig.skills[idx];

                        const skillsList = idx < 2 ? basicSkills :
                          idx === 2 ? ultimateSkills :
                            idx === 3 ? deathSkills :
                              idx === 4 ? collapseSkills :
                                shadowStepSkills;

                        const skillLabel = idx < 2 ? `Basic ${idx + 1}` :
                          idx === 2 ? 'Ultimate' :
                            idx === 3 ? 'Death' :
                              idx === 4 ? 'Collapse' : 'Shadow Step';

                        return (
                          <div key={idx} className="flex gap-1">
                            <select
                              className="flex-1 bg-gray-800/80 text-white text-xs p-1 rounded border border-gray-700 focus:border-purple-500"
                              value={skill?.name || ''}
                              onChange={(e) => {
                                const selectedSkill = skillsList.find(s => s.name === e.target.value);
                                const newSkills = [...sungConfig.skills];
                                newSkills[idx] = selectedSkill ? {
                                  ...selectedSkill,
                                  rarity: skill?.rarity || 'mythic'
                                } : null;
                                updateSungConfig('skills', newSkills);
                              }}
                            >
                              <option value="">{skillLabel}</option>
                              {skillsList.map(s => (
                                <option key={s.name} value={s.name}>
                                  {s.name}
                                </option>
                              ))}
                            </select>
                            {skill && (
                              <select
                                className={`w-12 text-xs p-1 rounded border ${getRarityColor(skill.rarity)}`}
                                value={skill.rarity || 'mythic'}
                                onChange={(e) => {
                                  const newSkills = [...sungConfig.skills];
                                  newSkills[idx] = { ...skill, rarity: e.target.value };
                                  updateSungConfig('skills', newSkills);
                                }}
                              >
                                <option value="rare">R</option>
                                <option value="epic">E</option>
                                <option value="legendary">L</option>
                                <option value="mythic">M</option>
                              </select>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Col 3: Bénédictions (8) */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-semibold text-purple-300 uppercase">BÉNÉDICTIONS (8)</h5>
                    <div className="grid grid-cols-4 gap-1">
                      {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
                        const blessing = sungConfig.blessings[idx];
                        const isDefensive = idx >= 4;
                        const blessings = blessingStonesData.filter(b => b.type === (isDefensive ? 'defensive' : 'offensive'));

                        return (
                          <select
                            key={idx}
                            className={`bg-gray-800/80 text-white text-xs p-1 rounded border ${blessing ? 'border-purple-500' : 'border-gray-700'
                              } focus:border-purple-500`}
                            value={blessing?.name || ''}
                            onChange={(e) => {
                              const newBlessings = [...sungConfig.blessings];
                              const selectedBlessing = blessingStonesData.find(b => b.name === e.target.value);
                              newBlessings[idx] = selectedBlessing || null;
                              updateSungConfig('blessings', newBlessings);
                            }}
                          >
                            <option value="">
                              {isDefensive ? 'D' : 'O'}{(idx % 4) + 1}
                            </option>
                            {blessings.map(blessing => (
                              <option key={blessing.name} value={blessing.name}>
                                {blessing.name}
                              </option>
                            ))}
                          </select>
                        );
                      })}
                    </div>

                    {/* Stats de base */}
                    <div>
                      <h5 className="text-xs font-semibold text-purple-300 mb-1 uppercase">STATS DE BASE</h5>
                      <div className="grid grid-cols-5 gap-1">
                        {['str', 'int', 'vit', 'per', 'agi'].map(stat => (
                          <div key={stat}>
                            <label className="text-[9px] text-gray-500 block">{stat.toUpperCase()}</label>
                            <input
                              type="number"
                              value={sungConfig.baseStats[stat] || 0}
                              onChange={(e) => {
                                const newStats = { ...sungConfig.baseStats };
                                newStats[stat] = parseInt(e.target.value) || 0;
                                updateSungConfig('baseStats', newStats);
                              }}
                              className="w-full bg-gray-800/80 text-white text-xs p-1 rounded text-center border border-gray-700 focus:border-purple-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Col 4: Stats finales */}
                  <div>
                    <h5 className="text-xs font-semibold text-purple-300 mb-1 uppercase">STATS FINALES</h5>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      {[
                        { key: 'atk', label: 'ATK' },
                        { key: 'tc', label: 'TC' },
                        { key: 'dcc', label: 'DCC' },
                        { key: 'di', label: 'DI' },
                        { key: 'defPen', label: 'DEF P' },
                        { key: 'precision', label: 'PREC' },
                        { key: 'mpcr', label: 'MPCR' },
                        { key: 'mpa', label: 'MPA' }
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className="text-[9px] text-gray-500 block">{label}</label>
                          <input
                            type="text"
                            value={sungConfig.finalStats[key] || ''}
                            onChange={(e) => {
                              const newStats = { ...sungConfig.finalStats };
                              newStats[key] = e.target.value;
                              updateSungConfig('finalStats', newStats);
                            }}
                            className="w-full bg-gray-800/80 text-white text-xs p-1 rounded text-center border border-gray-700 focus:border-purple-500"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Hunters Config */}
            <div>
              <h4 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                {mode === 'sung_hunters' ? '🛡️ Support Hunters' : '👥 Hunters Team'}
              </h4>
              <div className="space-y-3">
                {selectedTeam.hunters.map((hunterId, idx) => {
                  const hunter = getCharacterData(hunterId);
                  return (
                    <div key={idx} className="grid grid-cols-3 gap-4 bg-gray-800/20 rounded-lg p-4 border border-gray-700/50">
                      <div>
                        <h5 className="text-sm font-medium mb-3 flex items-center gap-2" style={{ color: hunter?.color || '#06B6D4' }}>
                          {hunter?.icon && <img src={hunter.icon} alt={hunter.name} className="w-5 h-5 rounded-full" />}
                          {mode === 'sung_hunters' ? `Support ${idx + 1}` : `Hunter ${idx + 1}`}
                        </h5>
                        <select
                          value={hunterId || ''}
                          onChange={(e) => changeHunter(idx, e.target.value)}
                          className="w-full px-2 py-1.5 bg-gray-800/50 border border-gray-600 rounded text-white text-sm focus:border-cyan-400 focus:outline-none"
                        >
                          <option value="">Select Hunter</option>
                          {charactersArray.filter(char => char.grade === 'SSR' || char.grade === 'SR').map(char => (
                            <option key={char.id} value={char.id}>{char.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium text-gray-400 mb-3">Stats</h5>
                        <div className="grid grid-cols-2 gap-2">
                          {['ATK', 'Crit Rate %', 'Crit DMG %', mode === 'sung_hunters' ? 'Support %' : 'DMG Inc %'].map(stat => (
                            <div key={stat}>
                              <label className="text-xs text-gray-500">{stat}</label>
                              <input
                                type="number"
                                className="w-full px-2 py-1 bg-gray-800/50 border border-gray-600 rounded text-white text-sm focus:border-cyan-400 focus:outline-none"
                                placeholder="0"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium text-gray-400 mb-3">Artifact Sets</h5>
                        <div className="space-y-2">
                          <select className="w-full px-2 py-1.5 bg-gray-800/50 border border-gray-600 rounded text-white text-sm focus:border-cyan-400 focus:outline-none">
                            <option value="">Left Set</option>
                            {artifactData.filter(a => a.side === 'L').map(artifact => (
                              <option key={artifact.set} value={artifact.set}>{artifact.set}</option>
                            ))}
                          </select>
                          <select className="w-full px-2 py-1.5 bg-gray-800/50 border border-gray-600 rounded text-white text-sm focus:border-cyan-400 focus:outline-none">
                            <option value="">Right Set</option>
                            {artifactData.filter(a => a.side === 'R').map(artifact => (
                              <option key={artifact.set} value={artifact.set}>{artifact.set}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTeamConfig(false)}
                className="flex-1 bg-green-600/20 border border-green-500 text-green-300 py-2.5 rounded-lg font-medium hover:bg-green-600/30 transition-all"
              >
                Save Configuration
              </button>
              <button
                onClick={() => setShowTeamConfig(false)}
                className="flex-1 bg-gray-700/50 border border-gray-600 text-gray-300 py-2.5 rounded-lg font-medium hover:bg-gray-700/70 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingCenter;