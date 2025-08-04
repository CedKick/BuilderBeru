import React, { useState } from 'react';

const TeamBuffs = ({ teamMembers = [], onClose, onApplyBuffs }) => {
  const [selectedBuffs, setSelectedBuffs] = useState([]);

  // Buffs d'équipe fictifs
  const teamBuffs = [
    {
      id: 'jinwoo_aura',
      name: 'Shadow Army',
      character: 'Sung Jinwoo',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754055045/sungicon_bfndrc.png',
      description: 'All allies +25% ATK',
      effects: {
        damageBuffs: 25,
        target: 'all'
      }
    },
    {
      id: 'chae_support',
      name: 'Armor Break',
      character: 'Cha Hae-In',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754055557/chaelogo_hci0do.png',
      description: 'Team +15% Defense Penetration',
      effects: {
        penetrationBuff: 15,
        target: 'team'
      }
    },
    {
      id: 'healer_buff',
      name: 'Divine Protection',
      character: 'Healer',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754055721/jinahlogo_lllt2d.png',
      description: '+20% Ultimate Damage',
      effects: {
        ultimateBuffs: 20,
        target: 'all'
      }
    },
    {
      id: 'tank_taunt',
      name: 'Guardian Shield',
      character: 'Tank',
      icon: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754055802/bossConfig_ftvd3z.png',
      description: '+10% Damage Reduction',
      effects: {
        damageReduction: 10,
        target: 'self'
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
      const buff = teamBuffs.find(b => b.id === buffId);
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
          <h3 className="text-white text-sm font-medium">TEAM BUFFS</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors text-xl"
          >
            ×
          </button>
        </div>

        {/* Categories */}
        <div className="px-4 pt-3">
          <div className="flex gap-2 text-[10px]">
            <span className="text-purple-400">● Active Team Members</span>
            <span className="text-white/40">● Available Buffs</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {teamBuffs.map(buff => (
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
                <div className="relative">
                  <img 
                    src={buff.icon} 
                    alt={buff.character} 
                    className="w-10 h-10 rounded"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-indigo-950" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white text-xs font-medium">{buff.name}</h4>
                  <p className="text-purple-400 text-[9px]">from {buff.character}</p>
                  <p className="text-white/60 text-[10px] mt-1">{buff.description}</p>
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

        {/* Team Preview */}
        <div className="px-4 pb-3">
          <div className="bg-indigo-900/20 rounded p-2">
            <p className="text-white/40 text-[9px] mb-1">Current Team:</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map(slot => (
                <div key={slot} className="w-8 h-8 bg-indigo-900/30 rounded" />
              ))}
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

export default TeamBuffs;