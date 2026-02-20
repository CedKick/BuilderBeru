// src/pages/ShadowColosseum/SharedBattleComponents/SharedCombatLogs.jsx
// Shared detailed combat logs with tabs and filters
// Used by both Training Dummy and Raid Mode

import React, { useState } from 'react';
import { formatDamage, formatPercent, formatNumber, ELEMENT_COLORS, ELEMENT_BG } from './sharedFormatters';

export default function SharedCombatLogs({ combatLog, detailedLogs, fighters, boss }) {
  const [activeTab, setActiveTab] = useState('timeline'); // timeline | damage | stats | crits | buffs
  const [filterElement, setFilterElement] = useState('all');
  const [filterType, setFilterType] = useState('all'); // all | normal | crit | buff | passive

  const tabs = [
    { id: 'timeline', label: '📜 Timeline', icon: '📜' },
    { id: 'damage', label: '⚔️ Dégâts', icon: '⚔️' },
    { id: 'stats', label: '📊 Statistiques', icon: '📊' },
    { id: 'crits', label: '💥 Critiques', icon: '💥' },
    { id: 'buffs', label: '✨ Buffs & Passifs', icon: '✨' },
  ];

  const elements = ['all', 'fire', 'water', 'light', 'dark', 'wind', 'neutral'];
  const types = [
    { id: 'all', label: 'Tous' },
    { id: 'normal', label: 'Normal' },
    { id: 'crit', label: 'Critique' },
    { id: 'buff', label: 'Buffs' },
    { id: 'passive', label: 'Passifs' },
  ];

  // Filter timeline by element and type
  const filteredTimeline = combatLog.filter(entry => {
    if (filterElement !== 'all' && entry.element && entry.element !== filterElement) return false;
    if (filterType !== 'all' && entry.type !== filterType) return false;
    return true;
  });

  return (
    <div className="bg-white/5 rounded-xl border border-white/10">
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 font-bold text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600/20 border-b-2 border-purple-400 text-purple-300'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Filters (for Timeline tab) */}
      {activeTab === 'timeline' && (
        <div className="p-3 border-b border-white/10 bg-black/20 flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-bold">Élément:</span>
            {elements.map(elem => (
              <button
                key={elem}
                onClick={() => setFilterElement(elem)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterElement === elem
                    ? 'bg-purple-600/30 border border-purple-400/50 text-purple-200'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                {elem === 'all' ? 'Tous' : elem.charAt(0).toUpperCase() + elem.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-bold">Type:</span>
            {types.map(type => (
              <button
                key={type.id}
                onClick={() => setFilterType(type.id)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterType === type.id
                    ? 'bg-purple-600/30 border border-purple-400/50 text-purple-200'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {activeTab === 'timeline' && (
          <TimelineTab combatLog={filteredTimeline} />
        )}
        {activeTab === 'damage' && (
          <DamageTab detailedLogs={detailedLogs} fighters={fighters} boss={boss} />
        )}
        {activeTab === 'stats' && (
          <StatsTab detailedLogs={detailedLogs} fighters={fighters} />
        )}
        {activeTab === 'crits' && (
          <CritsTab detailedLogs={detailedLogs} fighters={fighters} />
        )}
        {activeTab === 'buffs' && (
          <BuffsTab detailedLogs={detailedLogs} fighters={fighters} />
        )}
      </div>
    </div>
  );
}

// Timeline tab - chronological combat log
function TimelineTab({ combatLog }) {
  if (!combatLog || combatLog.length === 0) {
    return <p className="text-center text-gray-500 py-8">Aucun événement pour le moment...</p>;
  }

  return (
    <div className="space-y-1">
      {combatLog.slice().reverse().map((entry, idx) => {
        const typeColors = {
          system: 'text-gray-400',
          normal: 'text-blue-300',
          crit: 'text-orange-400 font-bold',
          boss: 'text-red-300',
          enemy: 'text-red-300',
          buff: 'text-green-300',
          passive: 'text-purple-300',
          info: 'text-cyan-300',
          heal: 'text-emerald-300',
          dodge: 'text-yellow-300',
          bar_break: 'text-yellow-400 font-bold',
        };

        const elementColor = entry.element ? ELEMENT_COLORS[entry.element] : '';

        return (
          <div
            key={entry.id || idx}
            className={`text-xs font-mono ${typeColors[entry.type] || 'text-gray-300'} ${elementColor}`}
          >
            <span className="text-gray-500">[{entry.time?.toFixed(1)}s]</span> {entry.text}
            {entry.element && (
              <span className={`ml-2 px-1 rounded text-[10px] ${ELEMENT_BG[entry.element]}`}>
                {entry.element.toUpperCase()}
              </span>
            )}
            {entry.passive && (
              <span className="ml-2 px-1 rounded text-[10px] bg-purple-600/20 border border-purple-500/30 text-purple-300">
                {entry.passive}
              </span>
            )}
          </div>
        );
      })}</div>
  );
}

// Damage tab - damage dealt by each entity
function DamageTab({ detailedLogs, fighters, boss }) {
  const allEntities = [...fighters, boss].filter(Boolean);

  return (
    <div className="space-y-3">
      {allEntities.map(entity => {
        const log = detailedLogs[entity.id] || {};
        const totalDmg = log.totalDamage || 0;
        const damageTaken = log.damageTaken || 0;

        return (
          <div key={entity.id} className="bg-black/30 rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <img src={entity.sprite} alt={entity.name} className="w-8 h-8 rounded-full" />
              <span className="font-bold text-white">{entity.name}</span>
              {entity.element && (
                <span className={`text-xs px-2 py-0.5 rounded ${ELEMENT_BG[entity.element]}`}>
                  {entity.element.toUpperCase()}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-yellow-400">Infligés:</span>
                <span className="text-white font-bold ml-2">{formatDamage(totalDmg)}</span>
              </div>
              <div>
                <span className="text-red-400">Reçus:</span>
                <span className="text-white font-bold ml-2">{formatDamage(damageTaken)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Stats tab - detailed statistics
function StatsTab({ detailedLogs, fighters }) {
  return (
    <div className="space-y-3">
      {fighters.map(fighter => {
        const log = detailedLogs[fighter.id] || {};
        const totalHits = log.totalHits || 0;
        const critHits = log.critHits || 0;
        const critRate = totalHits > 0 ? (critHits / totalHits) * 100 : 0;
        const avgDmg = totalHits > 0 ? (log.totalDamage || 0) / totalHits : 0;

        return (
          <div key={fighter.id} className="bg-black/30 rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <img src={fighter.sprite} alt={fighter.name} className="w-8 h-8 rounded-full" />
              <span className="font-bold text-white">{fighter.name}</span>
              {fighter.element && (
                <span className={`text-xs px-2 py-0.5 rounded ${ELEMENT_BG[fighter.element]}`}>
                  {fighter.element.toUpperCase()}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <StatLine label="Total coups" value={formatNumber(totalHits)} />
              <StatLine label="Critiques" value={formatNumber(critHits)} color="text-orange-400" />
              <StatLine label="Taux crit" value={formatPercent(critRate)} color="text-orange-300" />
              <StatLine label="DMG moyen" value={formatDamage(avgDmg)} color="text-yellow-400" />
              <StatLine label="DPS" value={formatDamage(log.dps || 0) + '/s'} color="text-purple-400" />
              <StatLine label="Skills used" value={formatNumber(log.skillsUsed || 0)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Crits tab - critical hit analysis
function CritsTab({ detailedLogs, fighters }) {
  return (
    <div className="space-y-3">
      {fighters.map(fighter => {
        const log = detailedLogs[fighter.id] || {};
        const critHits = log.critHits || 0;
        const totalCritDmg = log.totalCritDamage || 0;
        const avgCritDmg = critHits > 0 ? totalCritDmg / critHits : 0;
        const maxCrit = log.maxCrit || 0;

        return (
          <div key={fighter.id} className="bg-black/30 rounded-lg p-3 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-2">
              <img src={fighter.sprite} alt={fighter.name} className="w-8 h-8 rounded-full" />
              <span className="font-bold text-white">{fighter.name}</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Coups critiques:</span>
                <span className="text-orange-400 font-bold">{formatNumber(critHits)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">DMG crit total:</span>
                <span className="text-orange-300 font-bold">{formatDamage(totalCritDmg)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">DMG crit moyen:</span>
                <span className="text-yellow-400 font-bold">{formatDamage(avgCritDmg)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Crit maximum:</span>
                <span className="text-red-400 font-bold">{formatDamage(maxCrit)} 💥</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Buffs tab - buff and passive tracking
function BuffsTab({ detailedLogs, fighters }) {
  return (
    <div className="space-y-3">
      {fighters.map(fighter => {
        const log = detailedLogs[fighter.id] || {};
        const buffActivations = log.buffActivations || [];
        const passiveProcs = log.passiveProcs || [];

        return (
          <div key={fighter.id} className="bg-black/30 rounded-lg p-3 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <img src={fighter.sprite} alt={fighter.name} className="w-8 h-8 rounded-full" />
              <span className="font-bold text-white">{fighter.name}</span>
            </div>

            {buffActivations.length > 0 && (
              <div className="mb-2">
                <div className="text-xs font-bold text-green-300 mb-1">Buffs actifs:</div>
                <div className="space-y-1">
                  {buffActivations.slice(-5).map((buff, idx) => (
                    <div key={idx} className="text-xs text-green-200 bg-green-600/10 rounded px-2 py-1 border border-green-500/20">
                      {buff.name}: +{buff.value}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {passiveProcs.length > 0 && (
              <div>
                <div className="text-xs font-bold text-purple-300 mb-1">Passifs déclenchés:</div>
                <div className="space-y-1">
                  {passiveProcs.slice(-5).map((passive, idx) => (
                    <div key={idx} className="text-xs text-purple-200 bg-purple-600/10 rounded px-2 py-1 border border-purple-500/20">
                      {passive.name}: {passive.description}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {buffActivations.length === 0 && passiveProcs.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-2">Aucun buff ou passif déclenché</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatLine({ label, value, color = 'text-white' }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}:</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
  );
}
