// src/pages/ShadowColosseum/TrainingDummy/FighterCard.jsx
// Card component for displaying a fighter (hunter/chibi) in battle

import React from 'react';
import { Sword } from 'lucide-react';
import { formatDamage, formatPercent, getHPColor } from './formatters';
import { WEAPONS } from '../equipmentData';

export default function FighterCard({
  fighter,
  weaponId,
  dpsData,
  logs,
  onClick,
  isSelected
}) {
  const hpPercent = (fighter.hp / fighter.maxHp) * 100;
  const manaPercent = fighter.maxMana > 0 ? (fighter.mana / fighter.maxMana) * 100 : 0;

  const weapon = weaponId ? WEAPONS[weaponId] : null;
  const totalDamage = dpsData?.damage || 0;
  const dps = dpsData?.dps || 0;

  // Calculate crit rate from logs
  const totalHits = logs?.totalHits || 0;
  const critHits = logs?.critHits || 0;
  const critRate = totalHits > 0 ? (critHits / totalHits) * 100 : 0;

  return (
    <div
      onClick={onClick}
      className={`bg-white/5 rounded-xl p-3 border-2 transition-all cursor-pointer ${
        fighter.alive
          ? isSelected
            ? 'border-purple-400 bg-purple-500/10 shadow-lg shadow-purple-500/20'
            : 'border-green-400/30 hover:border-green-400/60 hover:bg-white/10'
          : 'border-red-500/30 opacity-50 cursor-not-allowed'
      }`}
    >
      {/* Header: Avatar + Name + Weapon */}
      <div className="flex items-center gap-3 mb-2">
        <div className="relative">
          <img
            src={fighter.sprite}
            alt={fighter.name}
            className={`w-12 h-12 rounded-full object-cover border-2 ${
              fighter.alive ? 'border-green-400' : 'border-red-500'
            }`}
          />
          {/* Weapon icon overlay */}
          {weapon && (
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 border-2 border-black flex items-center justify-center"
              title={weapon.name}
            >
              <Sword className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold truncate">{fighter.name}</div>
          <div className="text-xs text-gray-400">
            ATK: {Math.floor(fighter.atk)} | SPD: {Math.floor(fighter.spd)}
          </div>
          {weapon && (
            <div className="text-[10px] text-amber-400 truncate">
              ⚔️ {weapon.name}
            </div>
          )}
        </div>
      </div>

      {/* HP Bar */}
      <div className="space-y-1 mb-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-red-400 font-bold">HP</span>
          <span className="text-white font-bold">
            {formatDamage(fighter.hp)} / {formatDamage(fighter.maxHp)}
          </span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2.5 border border-gray-600">
          <div
            className={`bg-gradient-to-r ${getHPColor(hpPercent)} h-2.5 rounded-full transition-all duration-300`}
            style={{ width: `${Math.max(0, Math.min(100, hpPercent))}%` }}
          />
        </div>
      </div>

      {/* Mana Bar */}
      {fighter.maxMana > 0 && (
        <div className="space-y-1 mb-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-400 font-bold">Mana</span>
            <span className="text-white font-bold">
              {Math.floor(fighter.mana)} / {Math.floor(fighter.maxMana)}
            </span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-1.5 border border-gray-600">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min(100, manaPercent))}%` }}
            />
          </div>
        </div>
      )}

      {/* Buffs Display */}
      {fighter.buffs && fighter.buffs.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {fighter.buffs.slice(0, 3).map((buff, idx) => (
            <div
              key={idx}
              className="px-2 py-0.5 rounded-full bg-green-600/20 border border-green-500/30 text-[10px] text-green-300 font-bold"
              title={`${buff.type}: +${buff.value}% for ${buff.turns} turns`}
            >
              +{buff.value}% {buff.type.toUpperCase()}
            </div>
          ))}
          {fighter.buffs.length > 3 && (
            <div className="px-2 py-0.5 rounded-full bg-purple-600/20 border border-purple-500/30 text-[10px] text-purple-300 font-bold">
              +{fighter.buffs.length - 3}
            </div>
          )}
        </div>
      )}

      {/* Weapon Passive State */}
      {fighter.passiveState?.katanaZStacks > 0 && (
        <div className="mb-2">
          <div className="px-2 py-1 rounded-lg bg-red-600/20 border border-red-500/30 text-[10px] text-red-300 font-bold text-center">
            ⚔️ Tranchant Éternel x{fighter.passiveState.katanaZStacks}
          </div>
        </div>
      )}

      {/* DPS Stats */}
      <div className="pt-2 border-t border-white/10 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-yellow-400 font-bold">Total DMG</span>
          <span className="text-yellow-300 font-bold text-sm">
            {formatDamage(totalDamage)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-orange-400 font-bold">DPS</span>
          <span className="text-orange-300 font-bold">
            {formatDamage(dps)}/s
          </span>
        </div>
        {totalHits > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-red-400 font-bold">Taux CRIT</span>
            <span className="text-red-300 font-bold">
              {formatPercent(critRate)} ({critHits}/{totalHits})
            </span>
          </div>
        )}
        {dpsData?.percent !== undefined && (
          <div className="w-full bg-gray-700/50 rounded-full h-1.5 mt-1">
            <div
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(100, dpsData.percent)}%` }}
              title={`${dpsData.percent.toFixed(1)}% of total damage`}
            />
          </div>
        )}
      </div>

      {/* Click hint */}
      <div className="mt-2 text-center text-[10px] text-gray-500">
        Cliquer pour voir les stats
      </div>
    </div>
  );
}
