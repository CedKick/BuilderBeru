import React, { useState, useMemo } from 'react';

const TeamBuffs = ({ 
  teamMembers = [], 
  characters = {}, 
  onClose, 
  onApplyBuffs,
  previousTeamSelection = ['', ''],  // 🗡️ KAISEL: Mémoriser la sélection précédente
  previousRaidSelection = ['', '', ''],  // 🗡️ KAISEL: Mémoriser la sélection précédente
  onTeamSelectionChange  // 🗡️ KAISEL: Callback pour sauvegarder les sélections
}) => {
  const [selectedBuffs, setSelectedBuffs] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(previousTeamSelection); // 🗡️ KAISEL: Initialiser avec les valeurs précédentes
  const [selectedRaid, setSelectedRaid] = useState(previousRaidSelection); // 🗡️ KAISEL: Initialiser avec les valeurs précédentes

  // Formater la description du buff
  const formatBuffDescription = (buff) => {
    if (!buff.effects || buff.effects.length === 0) return '';
    
    const descriptions = [];
    buff.effects.forEach(effect => {
      const values = effect.values || [0];
      const maxValue = values.length > 0 ? Math.max(...values) : 0;
      
      if (effect.type === 'elementalDamage') {
        descriptions.push(`+${maxValue}% ${effect.element} Damage`);
      } else if (effect.type === 'attack') {
        descriptions.push(`+${maxValue}% ATK`);
      } else if (effect.type === 'defense') {
        descriptions.push(`+${maxValue}% DEF`);
      } else if (effect.type === 'HP') {
        descriptions.push(`+${maxValue}% HP`);
      } else if (effect.type === 'skillBuffs') {
        descriptions.push(`+${maxValue}% Skill Damage`);
      } else if (effect.type === 'ultimateBuffs') {
        descriptions.push(`+${maxValue}% Ultimate Damage`);
      } else if (effect.type === 'damageBuffs') {
        descriptions.push(`+${maxValue}% All Damage`);
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
          // On ne prend que les buffs qui sont partagés (target !== 'self')
          if (buff.target && buff.target !== 'self') {
            buffs.push({
              id: `team_${charId}_${buffIndex}`,
              name: buff.name,
              character: characters[charId].name,
              icon: buff.img || characters[charId].icon,
              description: buff.description || formatBuffDescription(buff),
              effects: buff.effects,
              source: 'team',
              charId: charId
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
              charId: charId
            });
          }
        });
      }
    });
    
    return buffs;
  }, [selectedTeam, selectedRaid, characters]);

  const toggleBuff = (buffId) => {
    setSelectedBuffs(prev => 
      prev.includes(buffId) 
        ? prev.filter(id => id !== buffId)
        : [...prev, buffId]
    );
  };

  const handleApply = () => {
    const totalBuffs = {};

    selectedBuffs.forEach(buffId => {
      const buff = availableBuffs.find(b => b.id === buffId);
      if (buff?.effects) {
        buff.effects.forEach(effect => {
          const values = effect.values || [0];
          const maxValue = values.length > 0 ? Math.max(...values) : 0;
          
          if (effect.type === 'elementalDamage') {
            if (!totalBuffs.elementalDamage) totalBuffs.elementalDamage = {};
            totalBuffs.elementalDamage[effect.element] = (totalBuffs.elementalDamage[effect.element] || 0) + maxValue;
          } else {
            totalBuffs[effect.type] = (totalBuffs[effect.type] || 0) + maxValue;
          }
        });
      }
    });

    // 🗡️ KAISEL: Sauvegarder les sélections avant de fermer
    if (onTeamSelectionChange) {
      onTeamSelectionChange(selectedTeam, selectedRaid);
    }

    onApplyBuffs(totalBuffs);
    onClose();
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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-indigo-950/95 backdrop-blur-md rounded-lg shadow-2xl shadow-purple-900/50 w-full max-w-md lg:max-w-2xl">
        {/* Header */}
        <div className="bg-purple-900/30 px-4 py-3 flex justify-between items-center">
          <h3 className="text-white text-sm font-medium">TEAM BUFFS</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors text-xl"
          >
            ×
          </button>
        </div>

        {/* Team Selection */}
        <div className="p-4 space-y-4">
          {/* Main Team */}
          <div>
            <p className="text-purple-400 text-xs mb-2">● Main Team (2 members)</p>
            <div className="flex gap-2">
              {selectedTeam.map((charId, index) => (
                <div key={`team-${index}`} className="relative group">
                  <select
                    value={charId}
                    onChange={(e) => selectTeamMember(index, e.target.value)}
                    className="w-32 h-10 bg-indigo-900/50 border border-purple-800 rounded text-xs text-white appearance-none px-2"
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
            <p className="text-white/40 text-xs mb-2">● Raid Support (3 members)</p>
            <div className="flex gap-2 flex-wrap">
              {selectedRaid.map((charId, index) => (
                <div key={`raid-${index}`} className="relative group">
                  <select
                    value={charId}
                    onChange={(e) => selectRaidMember(index, e.target.value)}
                    className="w-32 h-10 bg-indigo-900/30 border border-purple-800/50 rounded text-xs text-white/80 appearance-none px-2"
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
        </div>

        {/* Available Buffs */}
        <div className="px-4 pb-2">
          <div className="text-xs text-white/60 mb-2">
            Available Team Buffs ({availableBuffs.length})
          </div>
        </div>

        {/* Buffs List */}
        <div className="px-4 pb-4 max-h-[40vh] overflow-y-auto">
          {availableBuffs.length === 0 ? (
            <div className="text-center text-white/40 text-sm py-8">
              Select team members with shared buffs to see available options
            </div>
          ) : (
            <div className="space-y-2">
              {availableBuffs.map(buff => (
                <div
                  key={buff.id}
                  onClick={() => toggleBuff(buff.id)}
                  className={`bg-indigo-900/30 rounded-lg p-3 cursor-pointer transition-all ${
                    selectedBuffs.includes(buff.id) 
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
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                      selectedBuffs.includes(buff.id) 
                        ? 'bg-purple-400 border-purple-400' 
                        : 'border-white/30'
                    }`}>
                      {selectedBuffs.includes(buff.id) && (
                        <svg className="w-full h-full text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-indigo-900/20 px-4 py-3 flex justify-between items-center">
          <span className="text-white/60 text-xs">
            {selectedBuffs.length} buff{selectedBuffs.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                // 🗡️ KAISEL: Sauvegarder les sélections même en cas d'annulation
                if (onTeamSelectionChange) {
                  onTeamSelectionChange(selectedTeam, selectedRaid);
                }
                onClose();
              }}
              className="px-3 py-1 text-xs text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamBuffs;