import React, { useState } from 'react';

const SetBuffs = ({ equippedSets = [], onClose, onApplyBuffs }) => {
  const [selectedBuffs, setSelectedBuffs] = useState([]);

  // Buffs de sets fictifs
  const setBuffs = [
    {
      id: 'burning_2pc',
      name: '2-Piece Burning',
      setName: 'Burning Set',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730690/artifact_burningCurse_8L_l98rff.png',
      description: '+20% Fire Damage',
      requirement: '2 pieces',
      effects: {
        damageBuffs: 20,
        element: 'fire'
      }
    },
    {
      id: 'burning_4pc',
      name: '4-Piece Burning',
      setName: 'Burning Set',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730690/artifact_BurningBlessing_8L_sppyfn.png',
      description: '+40% Ultimate Damage on Burning enemies',
      requirement: '4 pieces',
      effects: {
        ultimateBuffs: 40,
        condition: 'burning'
      }
    },
    {
      id: 'chaos_2pc',
      name: '2-Piece Chaos',
      setName: 'Chaos Set',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730691/artifact_chaosWish_8L_wspayx.png',
      description: '+15% Critical Rate',
      requirement: '2 pieces',
      effects: {
        critRateBuff: 15
      }
    },
    {
      id: 'angel_4pc',
      name: '4-Piece Angel',
      setName: 'Angel White Set',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1748730699/artifact_angelInWhite_4L_jet12q.png',
      description: '+30% Healing & +20% Skill Damage',
      requirement: '4 pieces',
      effects: {
        skillBuffs: 20,
        healingBuff: 30
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
    const totalBuffs = {
      damageBuffs: 0,
      coreBuffs: 0,
      skillBuffs: 0,
      ultimateBuffs: 0
    };

    selectedBuffs.forEach(buffId => {
      const buff = setBuffs.find(b => b.id === buffId);
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

  // Grouper par set
  const groupedSets = setBuffs.reduce((acc, buff) => {
    if (!acc[buff.setName]) acc[buff.setName] = [];
    acc[buff.setName].push(buff);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-indigo-950/95 backdrop-blur-md rounded-lg shadow-2xl shadow-purple-900/50 w-full max-w-md">
        {/* Header */}
        <div className="bg-purple-900/30 px-4 py-3 flex justify-between items-center">
          <h3 className="text-white text-sm font-medium">SET BUFFS</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors text-xl"
          >
            ×
          </button>
        </div>

        {/* Info */}
        <div className="px-4 pt-3">
          <p className="text-white/50 text-[10px]">
            Select active set bonuses based on your equipped artifacts
          </p>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {Object.entries(groupedSets).map(([setName, buffs]) => (
            <div key={setName} className="space-y-2">
              <h4 className="text-purple-400 text-xs font-medium">{setName}</h4>
              {buffs.map(buff => (
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
                    <img loading="lazy" 
                      src={buff.icon} 
                      alt={buff.name} 
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="text-white text-xs font-medium">{buff.name}</h5>
                        <span className="text-purple-400 text-[9px] bg-purple-900/30 px-1.5 py-0.5 rounded">
                          {buff.requirement}
                        </span>
                      </div>
                      <p className="text-white/60 text-[10px] mt-1">{buff.description}</p>
                      {buff.effects.condition && (
                        <span className="text-yellow-400 text-[9px] mt-1 inline-block">
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
          ))}
        </div>

        {/* Current Equipment Preview */}
        <div className="px-4 pb-3">
          <div className="bg-indigo-900/20 rounded p-2">
            <p className="text-white/40 text-[9px] mb-1">Equipped Artifacts:</p>
            <div className="flex gap-1 flex-wrap">
              <span className="text-purple-400 text-[9px] bg-purple-900/30 px-2 py-0.5 rounded">
                4× Burning
              </span>
              <span className="text-purple-400 text-[9px] bg-purple-900/30 px-2 py-0.5 rounded">
                2× Chaos
              </span>
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

export default SetBuffs;