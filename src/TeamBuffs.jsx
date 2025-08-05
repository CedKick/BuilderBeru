import React, { useState, useMemo, useEffect } from 'react';

const TeamBuffs = ({ 
  teamMembers = [], 
  characters = {}, 
  onClose, 
  onApplyBuffs,
  activeTeamBuffs = [],
  previousTeamSelection = ['', ''],
  previousRaidSelection = ['', '', ''],
  onTeamSelectionChange,
  selectedCharacter // 🔧 KAISEL: Le personnage actuellement sélectionné
}) => {
  const [selectedBuffs, setSelectedBuffs] = useState(activeTeamBuffs);
  const [selectedTeam, setSelectedTeam] = useState(previousTeamSelection);
  const [selectedRaid, setSelectedRaid] = useState(previousRaidSelection);
  const [appliedBuffs, setAppliedBuffs] = useState({});

  // 🔧 KAISEL: Obtenir l'élément et le scaleStat du personnage principal
  const getMainCharacterInfo = () => {
    const mainCharacter = selectedCharacter ? characters[selectedCharacter] : null;
    return {
      element: mainCharacter?.element?.toLowerCase() || '',
      scaleStat: mainCharacter?.scaleStat || ''
    };
  };

  // Formater la description du buff
  const formatBuffDescription = (buff) => {
    if (!buff.effects || buff.effects.length === 0) return '';
    
    const descriptions = [];
    const { element: characterElement } = getMainCharacterInfo();
    
    buff.effects.forEach(effect => {
      const values = effect.values || [0];
      const maxValue = values.length > 0 ? Math.max(...values) : 0;
      
      const isConditionMet = !effect.condition || effect.condition === characterElement;
      const conditionPrefix = effect.condition ? 
        (isConditionMet ? '✓ ' : '✗ ') : '';
      
      if (effect.type === 'elementalDamage') {
        descriptions.push(`${conditionPrefix}+${maxValue}% ${effect.element} Damage`);
      } else if (effect.type === 'attack') {
        descriptions.push(`${conditionPrefix}+${maxValue}% ATK${effect.condition ? ` (${effect.condition} only)` : ''}`);
      } else if (effect.type === 'defense') {
        descriptions.push(`${conditionPrefix}+${maxValue}% DEF${effect.condition ? ` (${effect.condition} only)` : ''}`);
      } else if (effect.type === 'HP') {
        descriptions.push(`${conditionPrefix}+${maxValue}% HP${effect.condition ? ` (${effect.condition} only)` : ''}`);
      } else if (effect.type === 'skillBuffs') {
        descriptions.push(`${conditionPrefix}+${maxValue}% Skill Damage${effect.condition ? ` (${effect.condition} only)` : ''}`);
      } else if (effect.type === 'ultimateBuffs') {
        descriptions.push(`${conditionPrefix}+${maxValue}% Ultimate Damage`);
      } else if (effect.type === 'damageBuffs') {
        descriptions.push(`${conditionPrefix}+${maxValue}% All Damage`);
      } else if (effect.type === 'coreBuffs') {
        descriptions.push(`${conditionPrefix}+${maxValue}% Core Skills`);
      }
    });
    
    return descriptions.join(', ');
  };

  // Récupérer tous les buffs partagés des personnages sélectionnés
  const availableBuffs = useMemo(() => {
    const buffs = [];
    
    // Buffs de la team principale
    selectedTeam.forEach((charId, index) => {
      if (charId && characters[charId]?.buffs) {
        characters[charId].buffs.forEach((buff, buffIndex) => {
          if (buff.target && buff.target !== 'self') {
            buffs.push({
              id: `team_${charId}_${buffIndex}`,
              name: buff.name,
              character: characters[charId].name,
              icon: buff.img || characters[charId].icon,
              description: buff.description || formatBuffDescription(buff),
              effects: buff.effects,
              source: 'team',
              charId: charId,
              buffIndex: buffIndex
            });
          }
        });
      }
    });
    
    // Buffs du raid
    selectedRaid.forEach((charId, index) => {
      if (charId && characters[charId]?.buffs) {
        characters[charId].buffs.forEach((buff, buffIndex) => {
          if (buff.target && buff.target !== 'self') {
            buffs.push({
              id: `raid_${charId}_${buffIndex}`,
              name: buff.name,
              character: characters[charId].name,
              icon: buff.img || characters[charId].icon,
              description: buff.description || formatBuffDescription(buff),
              effects: buff.effects,
              source: 'raid',
              charId: charId,
              buffIndex: buffIndex
            });
          }
        });
      }
    });
    
    return buffs;
  }, [selectedTeam, selectedRaid, characters]);

  // Initialiser appliedBuffs avec les buffs actifs au montage
  useEffect(() => {
    const initialAppliedBuffs = {};
    const { element: characterElement, scaleStat } = getMainCharacterInfo();
    
    activeTeamBuffs.forEach(buffId => {
      const buff = availableBuffs.find(b => b.id === buffId);
      if (buff && buff.effects) {
        const buffsToApply = {};
        
        buff.effects.forEach(effect => {
          // Vérifier la condition
          if (effect.condition && effect.condition !== characterElement) {
            return; // Skip cet effet
          }
          
          const values = effect.values || [0];
          const maxValue = values.length > 0 ? Math.max(...values) : 0;
          
          if (effect.type === 'elementalDamage') {
            if (!buffsToApply.elementalDamage) buffsToApply.elementalDamage = {};
            buffsToApply.elementalDamage[effect.element] = maxValue;
          } 
          // 🔧 KAISEL FIX PRINCIPAL: Ne traiter que le buff qui correspond au scaleStat
          else if (effect.type === 'attack' && scaleStat === 'Attack') {
            buffsToApply.scaleStatBuff = (buffsToApply.scaleStatBuff || 0) + maxValue;
          }
          else if (effect.type === 'defense' && scaleStat === 'Defense') {
            buffsToApply.scaleStatBuff = (buffsToApply.scaleStatBuff || 0) + maxValue;
          }
          else if (effect.type === 'HP' && scaleStat === 'HP') {
            buffsToApply.scaleStatBuff = (buffsToApply.scaleStatBuff || 0) + maxValue;
          }
          else if (effect.type !== 'attack' && effect.type !== 'defense' && effect.type !== 'HP') {
            // Autres buffs (skill, damage, etc.)
            buffsToApply[effect.type] = (buffsToApply[effect.type] || 0) + maxValue;
          }
        });
        
        initialAppliedBuffs[buffId] = buffsToApply;
      }
    });
    
    setAppliedBuffs(initialAppliedBuffs);
  }, [activeTeamBuffs, availableBuffs]);

  const toggleBuff = (buffId) => {
    const isSelected = selectedBuffs.includes(buffId);
    const { element: characterElement, scaleStat } = getMainCharacterInfo();
    
    if (isSelected) {
      // Retirer le buff
      setSelectedBuffs(prev => prev.filter(id => id !== buffId));
      
      // Retirer immédiatement les buffs appliqués
      if (appliedBuffs[buffId]) {
        const buffsToRemove = appliedBuffs[buffId];
        
        // Calculer les nouveaux totaux en retirant les buffs
        const updatedBuffs = {};
        Object.keys(buffsToRemove).forEach(key => {
          if (key === 'elementalDamage' && typeof buffsToRemove[key] === 'object') {
            updatedBuffs.elementalDamage = {};
            Object.entries(buffsToRemove[key]).forEach(([element, val]) => {
              updatedBuffs.elementalDamage[element] = -val;
            });
          } else {
            updatedBuffs[key] = -buffsToRemove[key];
          }
        });
        
        onApplyBuffs(updatedBuffs);
        
        // Retirer de appliedBuffs
        setAppliedBuffs(prev => {
          const newApplied = { ...prev };
          delete newApplied[buffId];
          return newApplied;
        });
      }
    } else {
      // Ajouter le buff
      setSelectedBuffs(prev => [...prev, buffId]);
      
      // Appliquer immédiatement les buffs
      const buff = availableBuffs.find(b => b.id === buffId);
      if (buff && buff.effects) {
        const buffsToApply = {};
        
        buff.effects.forEach(effect => {
          // Ne pas appliquer l'effet si condition non remplie
          if (effect.condition && effect.condition !== characterElement) {
            return; // Skip cet effet
          }
          
          const values = effect.values || [0];
          const maxValue = values.length > 0 ? Math.max(...values) : 0;
          
          if (effect.type === 'elementalDamage') {
            if (!buffsToApply.elementalDamage) buffsToApply.elementalDamage = {};
            buffsToApply.elementalDamage[effect.element] = maxValue;
          } 
          // 🔧 KAISEL FIX PRINCIPAL: Ne traiter que le buff qui correspond au scaleStat
          else if (effect.type === 'attack' && scaleStat === 'Attack') {
            buffsToApply.scaleStatBuff = (buffsToApply.scaleStatBuff || 0) + maxValue;
          }
          else if (effect.type === 'defense' && scaleStat === 'Defense') {
            buffsToApply.scaleStatBuff = (buffsToApply.scaleStatBuff || 0) + maxValue;
          }
          else if (effect.type === 'HP' && scaleStat === 'HP') {
            buffsToApply.scaleStatBuff = (buffsToApply.scaleStatBuff || 0) + maxValue;
          }
          else if (effect.type !== 'attack' && effect.type !== 'defense' && effect.type !== 'HP') {
            // Autres buffs (skill, damage, etc.)
            buffsToApply[effect.type] = (buffsToApply[effect.type] || 0) + maxValue;
          }
        });
        
        // Sauvegarder les buffs appliqués
        setAppliedBuffs(prev => ({
          ...prev,
          [buffId]: buffsToApply
        }));
        
        onApplyBuffs(buffsToApply);
      }
    }
  };

  const handleClose = () => {
    const buffsToRevert = {};
    const { element: characterElement, scaleStat } = getMainCharacterInfo();
    
    // Retirer les nouveaux buffs ajoutés
    selectedBuffs.forEach(buffId => {
      if (!activeTeamBuffs.includes(buffId) && appliedBuffs[buffId]) {
        Object.entries(appliedBuffs[buffId]).forEach(([key, value]) => {
          if (key === 'elementalDamage' && typeof value === 'object') {
            Object.entries(value).forEach(([element, val]) => {
              if (!buffsToRevert.elementalDamage) buffsToRevert.elementalDamage = {};
              buffsToRevert.elementalDamage[element] = -(val || 0);
            });
          } else {
            buffsToRevert[key] = -(value || 0);
          }
        });
      }
    });
    
    // Remettre les buffs qui ont été retirés
    activeTeamBuffs.forEach(buffId => {
      if (!selectedBuffs.includes(buffId)) {
        const buff = availableBuffs.find(b => b.id === buffId);
        if (buff && buff.effects) {
          buff.effects.forEach(effect => {
            // Vérifier la condition
            if (effect.condition && effect.condition !== characterElement) {
              return; // Skip cet effet
            }
            
            const values = effect.values || [0];
            const maxValue = values.length > 0 ? Math.max(...values) : 0;
            
            if (effect.type === 'elementalDamage') {
              if (!buffsToRevert.elementalDamage) buffsToRevert.elementalDamage = {};
              buffsToRevert.elementalDamage[effect.element] = maxValue;
            } 
            // 🔧 KAISEL FIX: Seulement le bon stat
            else if (effect.type === 'attack' && scaleStat === 'Attack') {
              buffsToRevert.scaleStatBuff = (buffsToRevert.scaleStatBuff || 0) + maxValue;
            }
            else if (effect.type === 'defense' && scaleStat === 'Defense') {
              buffsToRevert.scaleStatBuff = (buffsToRevert.scaleStatBuff || 0) + maxValue;
            }
            else if (effect.type === 'HP' && scaleStat === 'HP') {
              buffsToRevert.scaleStatBuff = (buffsToRevert.scaleStatBuff || 0) + maxValue;
            }
            else if (effect.type !== 'attack' && effect.type !== 'defense' && effect.type !== 'HP') {
              buffsToRevert[effect.type] = (buffsToRevert[effect.type] || 0) + maxValue;
            }
          });
        }
      }
    });
    
    if (Object.keys(buffsToRevert).length > 0) {
      onApplyBuffs(buffsToRevert);
    }
    
    // Sauvegarder les sélections même en cas d'annulation
    if (onTeamSelectionChange) {
      onTeamSelectionChange(selectedTeam, selectedRaid);
    }
    
    onClose();
  };

  const handleConfirm = () => {
    // Passer les buffs sélectionnés au parent
    if (onTeamSelectionChange) {
      onTeamSelectionChange(selectedTeam, selectedRaid);
    }
    onClose(selectedBuffs);
  };

  // Sélectionner un personnage pour la team
  const selectTeamMember = (slot, charId) => {
    const newTeam = [...selectedTeam];
    newTeam[slot] = charId;
    setSelectedTeam(newTeam);
  };

  // Sélectionner un personnage pour le raid
  const selectRaidMember = (slot, charId) => {
    const newRaid = [...selectedRaid];
    newRaid[slot] = charId;
    setSelectedRaid(newRaid);
  };

  // Liste des personnages disponibles
  const availableCharacters = Object.entries(characters).filter(([id, char]) => char.buffs && char.buffs.length > 0);

  const getElementColor = (element) => {
    const colors = {
      Fire: 'text-red-400',
      Water: 'text-blue-400',
      Wind: 'text-green-400',
      Light: 'text-yellow-400',
      Dark: 'text-purple-400',
      None: 'text-gray-400'
    };
    return colors[element] || 'text-gray-400';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-indigo-950/95 backdrop-blur-md rounded-lg shadow-2xl shadow-purple-900/50 w-full max-w-md lg:max-w-5xl">
        {/* Header */}
        <div className="bg-purple-900/30 px-4 py-3 flex justify-between items-center">
          <h3 className="text-white text-sm font-medium">TEAM BUFFS</h3>
          
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Select All
                  const allBuffIds = availableBuffs.map(buff => buff.id);
                  setSelectedBuffs(allBuffIds);
                  
                  // Appliquer tous les buffs
                  const allBuffsToApply = {};
                  const { element: characterElement, scaleStat } = getMainCharacterInfo();
                  
                  availableBuffs.forEach(buff => {
                    if (!selectedBuffs.includes(buff.id) && buff.effects) {
                      buff.effects.forEach(effect => {
                        // Vérifier la condition
                        if (effect.condition && effect.condition !== characterElement) {
                          return; // Skip cet effet
                        }
                        
                        const values = effect.values || [0];
                        const maxValue = values.length > 0 ? Math.max(...values) : 0;
                        
                        if (effect.type === 'elementalDamage') {
                          if (!allBuffsToApply.elementalDamage) allBuffsToApply.elementalDamage = {};
                          allBuffsToApply.elementalDamage[effect.element] = (allBuffsToApply.elementalDamage[effect.element] || 0) + maxValue;
                        } 
                        // 🔧 KAISEL FIX: Seulement le bon stat
                        else if (effect.type === 'attack' && scaleStat === 'Attack') {
                          allBuffsToApply.scaleStatBuff = (allBuffsToApply.scaleStatBuff || 0) + maxValue;
                        }
                        else if (effect.type === 'defense' && scaleStat === 'Defense') {
                          allBuffsToApply.scaleStatBuff = (allBuffsToApply.scaleStatBuff || 0) + maxValue;
                        }
                        else if (effect.type === 'HP' && scaleStat === 'HP') {
                          allBuffsToApply.scaleStatBuff = (allBuffsToApply.scaleStatBuff || 0) + maxValue;
                        }
                        else if (effect.type !== 'attack' && effect.type !== 'defense' && effect.type !== 'HP') {
                          allBuffsToApply[effect.type] = (allBuffsToApply[effect.type] || 0) + maxValue;
                        }
                      });
                      
                      setAppliedBuffs(prev => ({
                        ...prev,
                        [buff.id]: buff.effects.reduce((acc, effect) => {
                          // Vérifier la condition ici aussi
                          if (effect.condition && effect.condition !== characterElement) {
                            return acc;
                          }
                          
                          const values = effect.values || [0];
                          const maxValue = values.length > 0 ? Math.max(...values) : 0;
                          
                          if (effect.type === 'elementalDamage') {
                            if (!acc.elementalDamage) acc.elementalDamage = {};
                            acc.elementalDamage[effect.element] = maxValue;
                          } 
                          else if (effect.type === 'attack' && scaleStat === 'Attack') {
                            acc.scaleStatBuff = (acc.scaleStatBuff || 0) + maxValue;
                          }
                          else if (effect.type === 'defense' && scaleStat === 'Defense') {
                            acc.scaleStatBuff = (acc.scaleStatBuff || 0) + maxValue;
                          }
                          else if (effect.type === 'HP' && scaleStat === 'HP') {
                            acc.scaleStatBuff = (acc.scaleStatBuff || 0) + maxValue;
                          }
                          else if (effect.type !== 'attack' && effect.type !== 'defense' && effect.type !== 'HP') {
                            acc[effect.type] = maxValue;
                          }
                          return acc;
                        }, {})
                      }));
                    }
                  });
                  
                  if (Object.keys(allBuffsToApply).length > 0) {
                    onApplyBuffs(allBuffsToApply);
                  }
                }}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                Select All
              </button>
              
              <span className="text-white/30">|</span>
              
              <button
                onClick={() => {
                  // Unselect All
                  const buffsToRemove = {};
                  
                  selectedBuffs.forEach(buffId => {
                    if (appliedBuffs[buffId]) {
                      Object.entries(appliedBuffs[buffId]).forEach(([key, value]) => {
                        if (key === 'elementalDamage' && typeof value === 'object') {
                          if (!buffsToRemove.elementalDamage) buffsToRemove.elementalDamage = {};
                          Object.entries(value).forEach(([element, val]) => {
                            buffsToRemove.elementalDamage[element] = (buffsToRemove.elementalDamage[element] || 0) - val;
                          });
                        } else {
                          buffsToRemove[key] = (buffsToRemove[key] || 0) - value;
                        }
                      });
                    }
                  });
                  
                  setSelectedBuffs([]);
                  setAppliedBuffs({});
                  
                  if (Object.keys(buffsToRemove).length > 0) {
                    onApplyBuffs(buffsToRemove);
                  }
                }}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                Unselect All
              </button>
            </div>
            
            <button
              onClick={handleClose}
              className="text-white/60 hover:text-white transition-colors text-xl ml-2"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content wrapper avec grid responsive */}
        <div className="lg:grid lg:grid-cols-[300px_1fr] lg:divide-x lg:divide-purple-800/30">
          {/* Team Selection - Colonne gauche sur desktop */}
          <div className="p-4 space-y-4">
            {/* Main Team */}
            <div>
              <p className="text-purple-400 text-xs mb-2 font-medium">● Main Team (2 members)</p>
              <div className="flex gap-2 lg:flex-col">
                {selectedTeam.map((charId, index) => (
                  <div key={`team-${index}`} className="relative group">
                    <select
                      value={charId}
                      onChange={(e) => selectTeamMember(index, e.target.value)}
                      className="w-full h-10 bg-indigo-900/50 border border-purple-800 rounded text-xs text-white appearance-none px-2 pr-10"
                    >
                      <option value="">Select...</option>
                      {availableCharacters.map(([id, char]) => (
                        <option key={id} value={id}>{char.name}</option>
                      ))}
                    </select>
                    {charId && characters[charId] && (
                      <img 
                        src={characters[charId].icon} 
                        alt={characters[charId].name}
                        className="absolute right-1 top-1 w-8 h-8 rounded pointer-events-none"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Raid Team */}
            <div>
              <p className="text-white/40 text-xs mb-2 font-medium">● Raid Support (3 members)</p>
              <div className="flex gap-2 flex-wrap lg:flex-col">
                {selectedRaid.map((charId, index) => (
                  <div key={`raid-${index}`} className="relative group">
                    <select
                      value={charId}
                      onChange={(e) => selectRaidMember(index, e.target.value)}
                      className="w-full h-10 bg-indigo-900/30 border border-purple-800/50 rounded text-xs text-white/80 appearance-none px-2 pr-10"
                    >
                      <option value="">Select...</option>
                      {availableCharacters.map(([id, char]) => (
                        <option key={id} value={id}>{char.name}</option>
                      ))}
                    </select>
                    {charId && characters[charId] && (
                      <img 
                        src={characters[charId].icon} 
                        alt={characters[charId].name}
                        className="absolute right-1 top-1 w-8 h-8 rounded pointer-events-none opacity-80"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Counter */}
            <div className="text-xs text-white/60 pt-2 border-t border-purple-800/30">
              Available Team Buffs ({availableBuffs.length})
            </div>
          </div>

          {/* Buffs List - Colonne droite sur desktop */}
          <div className="p-4">
            <div className="max-h-[50vh] lg:max-h-[60vh] overflow-y-auto">
              {availableBuffs.length === 0 ? (
                <div className="text-center text-white/40 text-sm py-8">
                  Select team members with shared buffs to see available options
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  {availableBuffs.map(buff => {
                    const isSelected = selectedBuffs.includes(buff.id);
                    
                    return (
                      <div
                        key={buff.id}
                        onClick={() => toggleBuff(buff.id)}
                        className={`bg-indigo-900/30 rounded-lg p-3 cursor-pointer transition-all ${
                          isSelected 
                            ? 'ring-2 ring-purple-400 bg-indigo-900/50' 
                            : 'hover:bg-indigo-900/40'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <img 
                              src={buff.icon} 
                              alt={buff.character} 
                              className="w-10 h-10 rounded"
                            />
                            {buff.source === 'team' && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border border-indigo-950" />
                            )}
                            {buff.source === 'raid' && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-indigo-950" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white text-xs font-medium">{buff.name}</h4>
                            <p className="text-purple-400 text-[9px]">from {buff.character}</p>
                            <p className="text-white/60 text-[10px] mt-1">{buff.description}</p>
                            
                            {/* Badges d'effets */}
                            {buff.effects && buff.effects.length > 1 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {buff.effects.map((effect, idx) => {
                                  let typeLabel = '';
                                  if (effect.type === 'attack') typeLabel = '⚔️ ATK';
                                  else if (effect.type === 'defense') typeLabel = '🛡️ DEF';
                                  else if (effect.type === 'HP') typeLabel = '❤️ HP';
                                  else if (effect.type === 'skillBuffs') typeLabel = '💫 Skill';
                                  else if (effect.type === 'damageBuffs') typeLabel = '💥 DMG';
                                  else if (effect.type === 'coreBuffs') typeLabel = '🔷 Core';
                                  else if (effect.type === 'ultimateBuffs') typeLabel = '🔥 Ult';
                                  else if (effect.type === 'elementalDamage') typeLabel = `🌟 ${effect.element || 'Elem'}`;
                                  else typeLabel = effect.type;
                                  
                                  return (
                                    <span key={idx} className={`text-[8px] bg-indigo-900/50 px-1 py-0.5 rounded ${
                                      effect.element ? getElementColor(effect.element) : 'text-white/70'
                                    }`}>
                                      {typeLabel}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                            isSelected 
                              ? 'bg-purple-400 border-purple-400' 
                              : 'border-white/30'
                          }`}>
                            {isSelected && (
                              <svg className="w-full h-full text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-indigo-900/20 px-4 py-3 flex justify-between items-center">
          <span className="text-white/60 text-xs">
            {selectedBuffs.length} buff{selectedBuffs.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="px-3 py-1 text-xs text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamBuffs;