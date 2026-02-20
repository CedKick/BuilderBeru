// src/pages/ShadowColosseum/TrainingDummy/DummyCard.jsx
// Card component for displaying the training dummy with editable stats when paused

import React, { useState } from 'react';
import { Settings, Shield, Sword as SwordIcon, Zap } from 'lucide-react';
import { formatDamage, getHPColor } from './formatters';

export default function DummyCard({
  dummy,
  dummyConfig,
  onConfigChange,
  isPaused,
  attacksEnabled,
  onToggleAttacks,
  onClick,
  isSelected
}) {
  const [showEditor, setShowEditor] = useState(false);
  const hpPercent = (dummy.hp / dummy.maxHp) * 100;

  const handleStatChange = (stat, value) => {
    if (!isPaused) return;
    onConfigChange({ ...dummyConfig, [stat]: value });
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white/5 rounded-xl p-4 border-2 transition-all cursor-pointer ${
        dummy.alive
          ? isSelected
            ? 'border-purple-400 bg-purple-500/10 shadow-lg shadow-purple-500/20'
            : 'border-orange-400/30 hover:border-orange-400/60 hover:bg-white/10'
          : 'border-red-500/30 opacity-50'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <img
          src={dummy.sprite}
          alt={dummy.name}
          className={`w-16 h-16 rounded-full object-cover border-2 ${
            dummy.alive ? 'border-orange-400' : 'border-red-500'
          }`}
        />
        <div className="flex-1">
          <div className="text-base font-bold">{dummy.name}</div>
          <div className="text-xs text-gray-400">Level {dummyConfig.level}</div>
        </div>
        {isPaused && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowEditor(!showEditor);
            }}
            className="p-2 rounded-lg bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 transition-all"
            title="Modifier les stats"
          >
            <Settings className="w-4 h-4 text-purple-300" />
          </button>
        )}
      </div>

      {/* Attack Toggle */}
      <div className="mb-3">
        <label className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
          <input
            type="checkbox"
            checked={attacksEnabled}
            onChange={(e) => {
              e.stopPropagation();
              onToggleAttacks(e.target.checked);
            }}
            className="w-4 h-4 rounded border-gray-600 text-orange-500 focus:ring-orange-500"
          />
          <span className="text-xs font-bold text-gray-300">
            {attacksEnabled ? '⚔️ Attaque activée' : '🛡️ Passif (no attack)'}
          </span>
        </label>
      </div>

      {/* HP Bar */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-red-400 font-bold">HP</span>
          <span className="text-white font-bold">
            {formatDamage(dummy.hp)} / {formatDamage(dummy.maxHp)}
          </span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-3 border border-gray-600">
          <div
            className={`bg-gradient-to-r ${getHPColor(hpPercent)} h-3 rounded-full transition-all duration-300`}
            style={{ width: `${Math.max(0, Math.min(100, hpPercent))}%` }}
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="flex items-center gap-1">
          <SwordIcon className="w-3 h-3 text-red-400" />
          <span className="text-gray-400">ATK:</span>
          <span className="text-white font-bold">{Math.floor(dummy.atk)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Shield className="w-3 h-3 text-blue-400" />
          <span className="text-gray-400">DEF:</span>
          <span className="text-white font-bold">{Math.floor(dummy.def)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-yellow-400" />
          <span className="text-gray-400">SPD:</span>
          <span className="text-white font-bold">{Math.floor(dummy.spd)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-purple-400">✨</span>
          <span className="text-gray-400">RES:</span>
          <span className="text-white font-bold">{Math.floor(dummy.res)}%</span>
        </div>
      </div>

      {/* Buffs/Debuffs */}
      {dummy.buffs && dummy.buffs.length > 0 && (
        <div className="mb-3">
          <div className="text-xs font-bold text-gray-400 mb-1">Effets:</div>
          <div className="flex flex-wrap gap-1">
            {dummy.buffs.map((buff, idx) => (
              <div
                key={idx}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  buff.value > 0
                    ? 'bg-green-600/20 border border-green-500/30 text-green-300'
                    : 'bg-red-600/20 border border-red-500/30 text-red-300'
                }`}
              >
                {buff.value > 0 ? '+' : ''}{buff.value}% {buff.type}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Editor (when paused) */}
      {isPaused && showEditor && (
        <div
          className="mt-3 pt-3 border-t border-white/20 space-y-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-xs font-bold text-purple-300 mb-2">📝 Modifier les stats</div>
          {['atk', 'def', 'spd', 'res', 'crit', 'critDmg'].map(stat => (
            <div key={stat} className="flex items-center gap-2">
              <label className="text-xs text-gray-400 w-16 uppercase">{stat}:</label>
              <input
                type="number"
                value={dummyConfig[stat]}
                onChange={(e) => handleStatChange(stat, parseInt(e.target.value) || 0)}
                className="flex-1 px-2 py-1 rounded bg-black/50 border border-white/20 text-white text-xs font-bold focus:outline-none focus:border-purple-400"
                min="0"
              />
            </div>
          ))}
        </div>
      )}

      {/* Click hint */}
      <div className="mt-2 text-center text-[10px] text-gray-500">
        Cliquer pour voir les stats
      </div>
    </div>
  );
}
