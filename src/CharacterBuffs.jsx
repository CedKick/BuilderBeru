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

  // 🗡️ KAISEL FIX: Initialiser appliedBuffs avec les buffs actifs au montage
  useEffect(() => {
    const initialAppliedBuffs = {};
    const characterBuffs = characters[selectedCharacter]?.buffs || [];
    
    activeBuffs.forEach(buffIndex => {
      const buff = characterBuffs[buffIndex];
      if (buff) {
        const maxValue = Math.max(...buff.values);
        const buffsToApply = {};
        
        if (buff.type === 'elementalDamage') {
          buffsToApply.elementalDamage = { [buff.element]: maxValue };
        } else if (buff.type === 'scaleStat') {
          buffsToApply.scaleStatBuff = maxValue;
        } else {
          buffsToApply[buff.type] = maxValue;
        }
        
        initialAppliedBuffs[buffIndex] = buffsToApply;
      }
    });
    
    setAppliedBuffs(initialAppliedBuffs);
  }, [activeBuffs, selectedCharacter, characters]);

  // Récupérer les buffs du personnage sélectionné
  const characterBuffs = characters[selectedCharacter]?.buffs || [];

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
          if (key === 'elementalDamage') {
            updatedBuffs.elementalDamage = {};
            Object.entries(buffsToRemove[key]).forEach(([element, value]) => {
              updatedBuffs.elementalDamage[element] = -value;
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
      if (buff) {
        const maxValue = Math.max(...buff.values);
        const buffsToApply = {};
        
        if (buff.type === 'elementalDamage') {
          buffsToApply.elementalDamage = { [buff.element]: maxValue };
        } else if (buff.type === 'scaleStat') {
          buffsToApply.scaleStatBuff = maxValue;
        } else {
          buffsToApply[buff.type] = maxValue;
        }
        
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
        if (buff) {
          const maxValue = Math.max(...buff.values);
          
          if (buff.type === 'elementalDamage') {
            if (!buffsToRevert.elementalDamage) buffsToRevert.elementalDamage = {};
            buffsToRevert.elementalDamage[buff.element] = maxValue;
          } else if (buff.type === 'scaleStat') {
            buffsToRevert.scaleStatBuff = maxValue;
          } else {
            buffsToRevert[buff.type] = maxValue;
          }
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

  const getBuffTypeLabel = (type) => {
    const labels = {
      damageBuffs: 'Damage',
      coreBuffs: 'Core',
      skillBuffs: 'Skill',
      ultimateBuffs: 'Ultimate',
      elementalDamage: 'Elemental',
      scaleStat: 'Stat'
    };
    return labels[type] || type;
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
      <div className="bg-indigo-950/95 backdrop-blur-md rounded-lg shadow-2xl shadow-purple-900/50 w-full max-w-md">
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
                <img 
                  src={characters[selectedCharacter].icon} 
                  alt={characters[selectedCharacter].name}
                  className="w-5 h-5 rounded"
                />
              </>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white transition-colors text-xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {characterBuffs.length === 0 ? (
            <p className="text-white/50 text-center text-sm">No buffs available for this character</p>
          ) : (
            characterBuffs.map((buff, index) => {
              const maxValue = Math.max(...buff.values);
              const isSelected = selectedBuffs.includes(index);
              
              return (
                <div
                  key={index}
                  className={`bg-indigo-900/30 rounded-lg p-3 transition-all cursor-pointer ${
                    isSelected 
                      ? 'ring-2 ring-purple-400 bg-indigo-900/50' 
                      : 'hover:bg-indigo-900/40'
                  }`}
                  onClick={() => toggleBuff(index)}
                >
                  <div className="flex items-start gap-3">
                    {/* Buff Icon */}
                    <div className="relative group">
                      <img 
                        src={buff.img || characters[selectedCharacter]?.icon} 
                        alt={buff.name} 
                        className="w-12 h-12 rounded"
                      />
                      
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <div className="bg-black/90 rounded px-2 py-1 text-[10px] text-white whitespace-nowrap">
                          <div className="font-medium mb-1">{buff.name}</div>
                          <div className="space-y-0.5">
                            {buff.values.map((value, i) => (
                              <div key={i} className="text-white/70">
                                Level {i + 1}: +{value}%
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                          <div className="border-4 border-transparent border-t-black/90"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-white text-xs font-medium flex items-center gap-2">
                        {buff.name}
                        <span className="text-purple-400 text-[10px]">+{maxValue}%</span>
                      </h4>
                      
                      <div className="flex flex-wrap gap-2 mt-1">
                        {/* Type Badge */}
                        <span className="text-[9px] bg-indigo-900/50 px-1.5 py-0.5 rounded text-white/70">
                          {getBuffTypeLabel(buff.type)}
                        </span>
                        
                        {/* Element Badge */}
                        {buff.element && buff.element !== 'None' && (
                          <span className={`text-[9px] bg-indigo-900/50 px-1.5 py-0.5 rounded ${getElementColor(buff.element)}`}>
                            {buff.element}
                          </span>
                        )}
                        
                        {/* Target Badge */}
                        <span className="text-[9px] bg-indigo-900/50 px-1.5 py-0.5 rounded text-white/70">
                          {buff.target === 'self' ? '👤 Self' : '👥 Team'}
                        </span>
                        
                        {/* Duration */}
                        {buff.duration > 0 && (
                          <span className="text-[9px] bg-indigo-900/50 px-1.5 py-0.5 rounded text-white/70">
                            ⏱️ {buff.duration}s
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className={`w-4 h-4 rounded-full border-2 transition-all ${
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
            })
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