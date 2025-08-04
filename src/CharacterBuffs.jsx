import React, { useState } from 'react';

const CharacterBuffs = ({ selectedCharacter, onClose, onApplyBuffs }) => {
  const [selectedBuffs, setSelectedBuffs] = useState([]);

  // Buffs fictifs pour le moment
  const characterBuffs = [
    {
      id: 'passive1',
      name: 'Shadow Monarch',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754055045/sungicon_bfndrc.png',
      description: '+30% Damage when HP above 70%',
      effects: {
        damageBuffs: 30,
        condition: 'hp > 70%'
      }
    },
    {
      id: 'passive2',
      name: 'Arise',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754055721/jinahlogo_lllt2d.png',
      description: '+15% Core Skill Damage',
      effects: {
        coreBuffs: 15
      }
    },
    {
      id: 'skill_buff',
      name: 'Battle Cry',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754055557/chaelogo_hci0do.png',
      description: '+20% Skill Damage for 3 turns',
      effects: {
        skillBuffs: 20,
        duration: '3 turns'
      }
    }
  ];

  const toggleBuff = (buffId) => {
    setSelectedBuffs(prev => 
      prev.includes(buffId) 
        ? prev.filter(id => id !== buffId)
        : [...prev, buffId]
    );
  };

  const handleApply = () => {
    // Calculer les buffs totaux
    const totalBuffs = {
      damageBuffs: 0,
      coreBuffs: 0,
      skillBuffs: 0,
      ultimateBuffs: 0
    };

    selectedBuffs.forEach(buffId => {
      const buff = characterBuffs.find(b => b.id === buffId);
      if (buff?.effects) {
        Object.keys(buff.effects).forEach(key => {
          if (totalBuffs.hasOwnProperty(key)) {
            totalBuffs[key] += buff.effects[key];
          }
        });
      }
    });

    onApplyBuffs(totalBuffs);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-indigo-950/95 backdrop-blur-md rounded-lg shadow-2xl shadow-purple-900/50 w-full max-w-md">
        {/* Header */}
        <div className="bg-purple-900/30 px-4 py-3 flex justify-between items-center">
          <h3 className="text-white text-sm font-medium">CHARACTER BUFFS</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors text-xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {characterBuffs.map(buff => (
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
                <img 
                  src={buff.icon} 
                  alt={buff.name} 
                  className="w-10 h-10 rounded"
                />
                <div className="flex-1">
                  <h4 className="text-white text-xs font-medium">{buff.name}</h4>
                  <p className="text-white/60 text-[10px] mt-1">{buff.description}</p>
                  {buff.effects.condition && (
                    <span className="text-purple-400 text-[9px] mt-1 inline-block">
                      Condition: {buff.effects.condition}
                    </span>
                  )}
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedBuffs.includes(buff.id) 
                    ? 'bg-purple-400 border-purple-400' 
                    : 'border-white/30'
                }`} />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-indigo-900/20 px-4 py-3 flex justify-between items-center">
          <span className="text-white/60 text-xs">
            {selectedBuffs.length} buff{selectedBuffs.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
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

export default CharacterBuffs;