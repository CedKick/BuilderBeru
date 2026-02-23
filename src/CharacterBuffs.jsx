import React, { useState, useEffect } from 'react';

const CharacterBuffs = ({
  selectedCharacter,
  characters = {},
  onClose,
  onApplyBuffs,
  activeBuffs = [] // 🗡️ KAISEL FIX: Recevoir les buffs actifs depuis le parent
}) => {
  // 🗡️ KAISEL FIX: Initialiser avec les buffs déjà actifs
  const [selectedBuffs, setSelectedBuffs] = useState(activeBuffs);
  const [appliedBuffs, setAppliedBuffs] = useState({});

  // Récupérer les buffs du personnage sélectionné
  const characterBuffs = characters[selectedCharacter]?.buffs || [];

  // 🗡️ KAISEL FIX: Initialiser appliedBuffs avec les buffs actifs au montage
  useEffect(() => {
    const initialAppliedBuffs = {};

    activeBuffs.forEach(buffIndex => {
      const buff = characterBuffs[buffIndex];
      if (buff && buff.effects) {
        const buffsToApply = {};

        buff.effects.forEach(effect => {
          const maxValue = Math.max(...effect.values);

          if (effect.type === 'elementalDamage') {
            if (!buffsToApply.elementalDamage) buffsToApply.elementalDamage = {};
            buffsToApply.elementalDamage[effect.element] = maxValue;
          }
          else if (effect.type === 'attack' || effect.type === 'defense' || effect.type === 'HP') {
            // 🗡️ KAISEL FIX: Vérifier si c'est le bon scaleStat
            const characterScaleStat = characters[selectedCharacter]?.scaleStat;
            const typeToScaleStat = {
              'attack': 'Attack',
              'defense': 'Defense',
              'HP': 'HP'
            };

            if (typeToScaleStat[effect.type] === characterScaleStat) {
              buffsToApply.scaleStatBuff = (buffsToApply.scaleStatBuff || 0) + maxValue;
            }
          }
          else if (effect.type === 'scaleStat') {
            buffsToApply.scaleStatBuff = (buffsToApply.scaleStatBuff || 0) + maxValue;
          }
          else {
            buffsToApply[effect.type] = (buffsToApply[effect.type] || 0) + maxValue;
          }
        });

        initialAppliedBuffs[buffIndex] = buffsToApply;
      }
    });

    setAppliedBuffs(initialAppliedBuffs);
  }, [activeBuffs, selectedCharacter, characters, characterBuffs]);

  const toggleBuff = (buffIndex) => {
    const isSelected = selectedBuffs.includes(buffIndex);

    if (isSelected) {
      // Retirer le buff
      setSelectedBuffs(prev => prev.filter(i => i !== buffIndex));

      // Retirer immédiatement les buffs appliqués
      const buffToRemove = characterBuffs[buffIndex];
      if (buffToRemove && appliedBuffs[buffIndex]) {
        const buffsToRemove = appliedBuffs[buffIndex];

        // Calculer les nouveaux totaux en retirant les buffs
        const updatedBuffs = {};
        Object.keys(buffsToRemove).forEach(key => {
          if (key === 'elementalDamage' && typeof buffsToRemove[key] === 'object') {
            // Pour elementalDamage
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
          delete newApplied[buffIndex];
          return newApplied;
        });
      }
    } else {
      // Ajouter le buff
      setSelectedBuffs(prev => [...prev, buffIndex]);

      // Appliquer immédiatement les buffs
      const buff = characterBuffs[buffIndex];
      if (buff && buff.effects) {
        const buffsToApply = {};

        // 🗡️ KAISEL SIMPLIFICATION: Parcourir tous les effets
        buff.effects.forEach(effect => {
          const maxValue = Math.max(...effect.values);

          // Gérer les différents types d'effets
          if (effect.type === 'elementalDamage') {
            if (!buffsToApply.elementalDamage) buffsToApply.elementalDamage = {};
            buffsToApply.elementalDamage[effect.element] = maxValue;
          }
          else if (effect.type === 'attack' || effect.type === 'defense' || effect.type === 'HP') {
            // 🗡️ KAISEL FIX: Vérifier si c'est le bon scaleStat
            const characterScaleStat = characters[selectedCharacter]?.scaleStat;

            // Mapper les types vers les scaleStats
            const typeToScaleStat = {
              'attack': 'Attack',
              'defense': 'Defense',
              'HP': 'HP'
            };

            // Appliquer seulement si c'est le scaleStat du personnage
            if (typeToScaleStat[effect.type] === characterScaleStat) {
              buffsToApply.scaleStatBuff = (buffsToApply.scaleStatBuff || 0) + maxValue;
            }
          }
          else if (effect.type === 'scaleStat') {
            // Pour les buffs génériques qui boostent la stat principale
            buffsToApply.scaleStatBuff = (buffsToApply.scaleStatBuff || 0) + maxValue;
          }
          else {
            // Pour tous les autres (damageBuffs, skillBuffs, etc.)
            buffsToApply[effect.type] = (buffsToApply[effect.type] || 0) + maxValue;
          }
        });

        // Sauvegarder les buffs appliqués
        setAppliedBuffs(prev => ({
          ...prev,
          [buffIndex]: buffsToApply
        }));

        onApplyBuffs(buffsToApply);
      }
    }
  };

  const handleClose = () => {
    // 🗡️ KAISEL FIX: Si on ferme avec Cancel, on doit retirer les buffs nouvellement ajoutés
    // et remettre ceux qui ont été retirés
    const buffsToRevert = {};

    // Retirer les nouveaux buffs ajoutés
    selectedBuffs.forEach(buffIndex => {
      if (!activeBuffs.includes(buffIndex) && appliedBuffs[buffIndex]) {
        Object.entries(appliedBuffs[buffIndex]).forEach(([key, value]) => {
          if (key === 'elementalDamage' && typeof value === 'object') {
            // Pour elementalDamage
            Object.entries(value).forEach(([element, val]) => {
              if (!buffsToRevert.elementalDamage) buffsToRevert.elementalDamage = {};
              buffsToRevert.elementalDamage[element] = -(val || 0);
            });
          } else if (key === 'scaleStatBuff') {
            buffsToRevert.scaleStatBuff = -(value || 0);
          } else {
            buffsToRevert[key] = -(value || 0);
          }
        });
      }
    });

    // Remettre les buffs qui ont été retirés
    activeBuffs.forEach(buffIndex => {
      if (!selectedBuffs.includes(buffIndex)) {
        const buff = characterBuffs[buffIndex];
        if (buff && buff.effects) {
          const buffsToApply = {};

          buff.effects.forEach(effect => {
            const maxValue = Math.max(...effect.values);

            if (effect.type === 'elementalDamage') {
              if (!buffsToRevert.elementalDamage) buffsToRevert.elementalDamage = {};
              buffsToRevert.elementalDamage[effect.element] = maxValue;
            }
            else if (effect.type === 'attack' || effect.type === 'defense') {
              buffsToRevert.scaleStatBuff = (buffsToRevert.scaleStatBuff || 0) + maxValue;
            }
            else if (effect.type === 'scaleStat') {
              buffsToRevert.scaleStatBuff = (buffsToRevert.scaleStatBuff || 0) + maxValue;
            }
            else {
              buffsToRevert[effect.type] = (buffsToRevert[effect.type] || 0) + maxValue;
            }
          });
        }
      }
    });

    if (Object.keys(buffsToRevert).length > 0) {
      onApplyBuffs(buffsToRevert);
    }

    onClose();
  };

  const handleConfirm = () => {
    // 🗡️ KAISEL FIX: Passer les indices des buffs sélectionnés au parent
    onClose(selectedBuffs);
  };

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
      {/* 🗡️ KAISEL RESPONSIVE: max-w-md sur mobile, max-w-4xl sur desktop */}
      <div className="bg-indigo-950/95 backdrop-blur-md rounded-lg shadow-2xl shadow-purple-900/50 w-full max-w-md lg:max-w-4xl">
        {/* Header */}
        <div className="bg-purple-900/30 px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="text-white text-sm font-medium">
              CHARACTER BUFFS
            </h3>
            {characters[selectedCharacter] && (
              <>
                <span className="text-white/60">-</span>
                <span className="text-purple-400 text-sm">{characters[selectedCharacter].name}</span>
                <img loading="lazy"
                  src={characters[selectedCharacter].icon}
                  alt={characters[selectedCharacter].name}
                  className="w-5 h-5 rounded"
                />
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* 🗡️ KAISEL: Boutons Select All / Unselect All */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Select All
                  const allBuffIndices = characterBuffs.map((_, index) => index);
                  setSelectedBuffs(allBuffIndices);

                  // Appliquer tous les buffs
                  const allBuffsToApply = {};
                  characterBuffs.forEach((buff, buffIndex) => {
                    if (buff && buff.effects && !selectedBuffs.includes(buffIndex)) {
                      const buffsForThisBuff = {};

                      buff.effects.forEach(effect => {
                        const maxValue = Math.max(...effect.values);

                        if (effect.type === 'elementalDamage') {
                          if (!buffsForThisBuff.elementalDamage) buffsForThisBuff.elementalDamage = {};
                          buffsForThisBuff.elementalDamage[effect.element] = maxValue;
                        }
                        else if (effect.type === 'attack' || effect.type === 'defense' || effect.type === 'HP') {
                          const characterScaleStat = characters[selectedCharacter]?.scaleStat;
                          const typeToScaleStat = {
                            'attack': 'Attack',
                            'defense': 'Defense',
                            'HP': 'HP'
                          };

                          if (typeToScaleStat[effect.type] === characterScaleStat) {
                            buffsForThisBuff.scaleStatBuff = (buffsForThisBuff.scaleStatBuff || 0) + maxValue;
                          }
                        }
                        else if (effect.type === 'scaleStat') {
                          buffsForThisBuff.scaleStatBuff = (buffsForThisBuff.scaleStatBuff || 0) + maxValue;
                        }
                        else {
                          buffsForThisBuff[effect.type] = (buffsForThisBuff[effect.type] || 0) + maxValue;
                        }
                      });

                      // Fusionner avec allBuffsToApply
                      Object.entries(buffsForThisBuff).forEach(([key, value]) => {
                        if (key === 'elementalDamage' && typeof value === 'object') {
                          if (!allBuffsToApply.elementalDamage) allBuffsToApply.elementalDamage = {};
                          Object.entries(value).forEach(([element, val]) => {
                            allBuffsToApply.elementalDamage[element] = (allBuffsToApply.elementalDamage[element] || 0) + val;
                          });
                        } else {
                          allBuffsToApply[key] = (allBuffsToApply[key] || 0) + value;
                        }
                      });

                      setAppliedBuffs(prev => ({
                        ...prev,
                        [buffIndex]: buffsForThisBuff
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

                  selectedBuffs.forEach(buffIndex => {
                    if (appliedBuffs[buffIndex]) {
                      Object.entries(appliedBuffs[buffIndex]).forEach(([key, value]) => {
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

        {/* Content - Grid sur desktop, colonne simple sur mobile */}
        <div className="p-4 max-h-[60vh] lg:max-h-[70vh] overflow-y-auto">
          {characterBuffs.length === 0 ? (
            <p className="text-white/50 text-center text-sm">No buffs available for this character</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {characterBuffs.map((buff, index) => {
                const isSelected = selectedBuffs.includes(index);

                return (
                  <div
                    key={index}
                    className={`bg-indigo-900/30 rounded-lg p-3 transition-all cursor-pointer ${isSelected
                        ? 'ring-2 ring-purple-400 bg-indigo-900/50'
                        : 'hover:bg-indigo-900/40'
                      }`}
                    onClick={() => toggleBuff(index)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Buff Icon */}
                      <div className="relative group flex-shrink-0">
                        <img loading="lazy"
                          src={buff.img || characters[selectedCharacter]?.icon}
                          alt={buff.name}
                          className="w-10 h-10 lg:w-12 lg:h-12 rounded"
                        />

                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          <div className="bg-black/90 rounded px-2 py-1 text-[10px] text-white whitespace-nowrap">
                            <div className="font-medium mb-1">{buff.name}</div>
                            <div className="space-y-0.5">
                              {buff.effects?.map((effect, i) => (
                                <div key={i} className="text-white/70">
                                  {effect.type}: +{Math.max(...effect.values)}%
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="border-4 border-transparent border-t-black/90"></div>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-white text-xs font-medium flex items-center gap-2 flex-wrap">
                          <span className="truncate">{buff.name}</span>
                          {/* Afficher la valeur principale ou "Multi" si plusieurs effets */}
                          <span className="text-purple-400 text-[10px] flex-shrink-0">
                            {buff.effects?.length > 1 ? 'Multi' : `+${Math.max(...(buff.effects?.[0]?.values || [0]))}%`}
                          </span>
                        </h4>

                        <div className="flex flex-wrap gap-1 mt-1">
                          {/* Type et Element Badges combinés */}
                          {buff.effects?.map((effect, idx) => {
                            // Déterminer le label du type
                            let typeLabel = '';
                            if (effect.type === 'attack') typeLabel = '⚔️ ATK';
                            else if (effect.type === 'defense') typeLabel = '🛡️ DEF';
                            else if (effect.type === 'HP') typeLabel = '❤️ HP';
                            else if (effect.type === 'skillBuffs') typeLabel = '💫 Skill';
                            else if (effect.type === 'damageBuffs') typeLabel = '💥 DMG';
                            else if (effect.type === 'coreBuffs') typeLabel = '🔷 Core';
                            else if (effect.type === 'ultimateBuffs') typeLabel = '🔥 Ult';
                            else if (effect.type === 'elementalDamage') typeLabel = `🌟 ${effect.element || 'Elem'}`;
                            else if (effect.type === 'scaleStat') typeLabel = '📊 Main Stat';
                            else if (effect.type === 'critRateBuffs') typeLabel = '🎯 CriteRate';
                            else if (effect.type === 'critDamageBuffs') typeLabel = '💥 CritDamage';
                            else typeLabel = effect.type;

                            return (
                              <span key={idx} className={`text-[8px] lg:text-[9px] bg-indigo-900/50 px-1.5 py-0.5 rounded ${effect.element ? getElementColor(effect.element) : 'text-white/70'
                                }`}>
                                {typeLabel}
                              </span>
                            );
                          })}

                          {/* Target Badge */}
                          <span className="text-[8px] lg:text-[9px] bg-indigo-900/50 px-1.5 py-0.5 rounded text-white/70">
                            {buff.target === 'self' ? '👤 Self' : '👥 Team'}
                          </span>

                          {/* Duration */}
                          {buff.duration > 0 && (
                            <span className="text-[8px] lg:text-[9px] bg-indigo-900/50 px-1.5 py-0.5 rounded text-white/70">
                              ⏱️ {buff.duration}s
                            </span>
                          )}
                          {buff.duration === -1 && (
                            <span className="text-[8px] lg:text-[9px] bg-indigo-900/50 px-1.5 py-0.5 rounded text-yellow-400">
                              ♾️ Infinite
                            </span>
                          )}

                          {/* Stacks */}
                          {buff.stacks && (
                            <span className="text-[8px] lg:text-[9px] bg-indigo-900/50 px-1.5 py-0.5 rounded text-yellow-400">
                              📊 x{buff.stacks}
                            </span>
                          )}
                        </div>

                        {/* Afficher les détails des effets si plusieurs */}
                        {buff.effects?.length > 1 && (
                          <div className="mt-1 text-[7px] lg:text-[8px] text-white/50 space-y-0">
                            {buff.effects.map((effect, idx) => (
                              <div key={idx}>
                                • {effect.type === 'attack' && 'Attack'}
                                {effect.type === 'defense' && 'Defense'}
                                {effect.type === 'HP' && 'HP'}
                                {effect.type === 'skillBuffs' && 'Basic Skill'}
                                {effect.type === 'damageBuffs' && 'All Damage'}
                                {effect.type === 'elementalDamage' && `${effect.element} Damage`}
                                {effect.type === 'scaleStat' && 'Main Stat'}
                                {effect.type === 'ultimateBuffs' && 'Ultimate'}
                                {effect.type === 'coreBuffs' && 'Core Skills'}
                                : +{Math.max(...effect.values)}%
                                {effect.condition && ` (${effect.condition} only)`}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className={`w-4 h-4 rounded-full border-2 transition-all flex-shrink-0 ${isSelected
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

        {/* Footer */}
        <div className="bg-indigo-900/20 px-4 py-3 flex justify-between items-center">
          <span className="text-white/60 text-xs">
            {selectedBuffs.length} buff{selectedBuffs.length !== 1 ? 's' : ''} active
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

export default CharacterBuffs;