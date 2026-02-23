// src/pages/ShadowColosseum/TrainingDummy/StatsPanel.jsx
// Detailed stats panel that appears when clicking on a fighter or dummy

import React from 'react';
import { X, Sword as SwordIcon, Shield, Zap, Heart, Droplet, Target, TrendingUp } from 'lucide-react';
import { formatDamage, formatPercent, formatNumber } from './formatters';
import { WEAPONS } from '../equipmentData';

export default function StatsPanel({ entity, weaponId, logs, onClose }) {
  const isDummy = entity.id === 'training_dummy';
  const weapon = weaponId && !isDummy ? WEAPONS[weaponId] : null;

  // Calculate stats from logs
  const totalHits = logs?.totalHits || 0;
  const critHits = logs?.critHits || 0;
  const totalDamage = logs?.totalDamage || 0;
  const damageTaken = logs?.damageTaken || 0;
  const critRate = totalHits > 0 ? (critHits / totalHits) * 100 : 0;
  const avgDamage = totalHits > 0 ? totalDamage / totalHits : 0;
  const avgCritDamage = critHits > 0 ? (logs?.totalCritDamage || 0) / critHits : 0;

  // Calculate effective ATK including weapon passive bonuses
  const getEffectiveAtk = () => {
    if (isDummy || !entity.passiveState) return null;
    let mult = 1;
    if (entity.passiveState.katanaZStacks > 0) mult += entity.passiveState.katanaZStacks * 5 / 100;
    if (entity.passiveState.shadowSilence) mult += entity.passiveState.shadowSilence.filter(s => s > 0).length;
    if (entity.passiveState.katanaVState?.allStatBuff > 0) mult += entity.passiveState.katanaVState.allStatBuff / 100;
    if (mult <= 1) return null;
    return Math.floor(entity.atk * mult);
  };
  const effectiveAtk = getEffectiveAtk();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f0f1a] border-2 border-purple-400 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img loading="lazy"
              src={entity.sprite}
              alt={entity.name}
              className="w-16 h-16 rounded-full border-2 border-purple-400"
            />
            <div>
              <h2 className="text-xl font-bold text-white">{entity.name}</h2>
              <p className="text-sm text-gray-400">{entity.element} • Lv.{entity.level || '?'}</p>
              {weapon && (
                <p className="text-xs text-amber-400 mt-1">⚔️ {weapon.name}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 transition-all"
          >
            <X className="w-5 h-5 text-red-300" />
          </button>
        </div>

        {/* Core Stats */}
        <div className="mb-4">
          <h3 className="text-sm font-bold text-purple-300 mb-3 uppercase tracking-wide">📊 Statistiques de base</h3>
          <div className="grid grid-cols-2 gap-3">
            <StatRow icon={<Heart className="w-4 h-4 text-red-400" />} label="HP" value={formatDamage(entity.hp) + ' / ' + formatDamage(entity.maxHp)} />
            <StatRow icon={<Droplet className="w-4 h-4 text-blue-400" />} label="Mana" value={entity.maxMana > 0 ? formatNumber(Math.floor(entity.mana)) + ' / ' + formatNumber(entity.maxMana) : 'N/A'} />
            <StatRow icon={<SwordIcon className="w-4 h-4 text-red-400" />} label="ATK" value={formatNumber(Math.floor(entity.atk))} effectiveValue={effectiveAtk ? formatNumber(effectiveAtk) : null} />
            <StatRow icon={<Shield className="w-4 h-4 text-blue-400" />} label="DEF" value={formatNumber(Math.floor(entity.def))} />
            <StatRow icon={<Zap className="w-4 h-4 text-yellow-400" />} label="SPD" value={formatNumber(Math.floor(entity.spd))} />
            <StatRow icon={<Target className="w-4 h-4 text-orange-400" />} label="CRIT" value={formatPercent(entity.crit)} />
            <StatRow icon={<TrendingUp className="w-4 h-4 text-purple-400" />} label="CRIT DMG" value={formatPercent(entity.critDmg || 150)} />
            <StatRow icon={<span className="text-purple-400">✨</span>} label="RES" value={formatPercent(entity.res)} />
          </div>
        </div>

        {/* Active Buffs */}
        {entity.buffs && entity.buffs.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-bold text-green-300 mb-3 uppercase tracking-wide">✨ Buffs actifs</h3>
            <div className="space-y-2">
              {entity.buffs.map((buff, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-green-600/10 border border-green-500/20">
                  <span className="text-sm text-white font-bold">{buff.type.toUpperCase()}</span>
                  <span className="text-sm text-green-300">+{buff.value}%</span>
                  <span className="text-xs text-gray-400">{buff.turns} tours</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weapon Passive State */}
        {!isDummy && entity.passiveState && (
          <div className="mb-4">
            <h3 className="text-sm font-bold text-amber-300 mb-3 uppercase tracking-wide">⚔️ État des passives d'arme</h3>
            <div className="space-y-2">
              {entity.passiveState.katanaZStacks !== undefined && (
                <div className="p-2 rounded-lg bg-red-600/10 border border-red-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">Tranchant Éternel</span>
                    <span className="text-sm text-red-300">x{entity.passiveState.katanaZStacks} stacks</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">+{entity.passiveState.katanaZStacks * 5}% ATK</p>
                </div>
              )}
              {entity.passiveState.katanaVState && (
                <div className="p-2 rounded-lg bg-purple-600/10 border border-purple-500/20">
                  <div className="text-sm font-bold text-white mb-1">Bénédiction Divine</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-gray-400">DoT stacks: <span className="text-purple-300">{entity.passiveState.katanaVState.dots}</span></div>
                    <div className="text-gray-400">Stats buff: <span className="text-purple-300">+{entity.passiveState.katanaVState.allStatBuff}%</span></div>
                    <div className="text-gray-400">Bouclier: <span className="text-purple-300">{entity.passiveState.katanaVState.shield ? '✓' : '✗'}</span></div>
                    <div className="text-gray-400">Next DMG: <span className="text-purple-300">x{entity.passiveState.katanaVState.nextDmgMult}</span></div>
                  </div>
                </div>
              )}
              {entity.passiveState.sulfurasStacks !== undefined && entity.passiveState.sulfurasStacks > 0 && (
                <div className="p-2 rounded-lg bg-orange-600/10 border border-orange-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">Sulfuras Fury</span>
                    <span className="text-sm text-orange-300">x{entity.passiveState.sulfurasStacks}/3</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">+{Math.round(entity.passiveState.sulfurasStacks / 3 * 100)}% DMG (max 100%)</p>
                </div>
              )}
              {entity.passiveState.shadowSilence !== undefined && (
                <div className="p-2 rounded-lg bg-indigo-600/10 border border-indigo-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">Murmure de la Mort</span>
                    <span className="text-sm text-indigo-300">x{entity.passiveState.shadowSilence.filter(s => s > 0).length}/3</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">+{entity.passiveState.shadowSilence.filter(s => s > 0).length * 100}% ATK</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Combat Stats */}
        {logs && (
          <div className="mb-4">
            <h3 className="text-sm font-bold text-yellow-300 mb-3 uppercase tracking-wide">⚔️ Statistiques de combat</h3>
            <div className="grid grid-cols-2 gap-3">
              <CombatStatRow label="Dégâts infligés" value={formatDamage(totalDamage)} color="text-yellow-400" />
              <CombatStatRow label="Dégâts reçus" value={formatDamage(damageTaken)} color="text-red-400" />
              <CombatStatRow label="Total coups" value={formatNumber(totalHits)} color="text-gray-300" />
              <CombatStatRow label="Coups critiques" value={formatNumber(critHits)} color="text-orange-400" />
              <CombatStatRow label="Taux critique" value={formatPercent(critRate)} color="text-orange-300" />
              <CombatStatRow label="DMG moyen" value={formatDamage(avgDamage)} color="text-yellow-300" />
              <CombatStatRow label="Crit moyen" value={formatDamage(avgCritDamage)} color="text-orange-300" />
              <CombatStatRow label="DPS" value={formatDamage(logs.dps || 0) + '/s'} color="text-purple-400" />
            </div>
          </div>
        )}

        {/* Skills */}
        {entity.skills && entity.skills.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-bold text-cyan-300 mb-3 uppercase tracking-wide">🎯 Compétences</h3>
            <div className="space-y-2">
              {entity.skills.map((skill, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-cyan-600/10 border border-cyan-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{skill.name}</span>
                    <span className="text-xs text-gray-400">
                      {skill.cd > 0 ? `CD: ${skill.cd}` : 'Ready'}
                    </span>
                  </div>
                  {skill.power > 0 && (
                    <p className="text-xs text-cyan-300 mt-1">Puissance: {skill.power}%</p>
                  )}
                  {skill.manaCost > 0 && (
                    <p className="text-xs text-blue-300">Coût mana: {skill.manaCost}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatRow({ icon, label, value, effectiveValue }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-gray-400 font-bold">{label}</span>
      </div>
      <div className="text-right">
        <span className="text-sm text-white font-bold">{value}</span>
        {effectiveValue && (
          <span className="text-xs text-green-400 ml-1">({effectiveValue})</span>
        )}
      </div>
    </div>
  );
}

function CombatStatRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-white/5">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
  );
}
