// src/pages/ShadowColosseum/TrainingDummy/CombatLogs.jsx
// Detailed combat logs with tabs for different stats

import React, { useState } from 'react';
import { formatDamage, formatPercent, formatNumber } from './formatters';

export default function CombatLogs({ combatLog, detailedLogs, fighters, dummy }) {
  const [activeTab, setActiveTab] = useState('timeline'); // timeline | damage | healing | deaths

  const tabs = [
    { id: 'timeline', label: '📜 Timeline', icon: '📜' },
    { id: 'damage', label: '⚔️ Dégâts', icon: '⚔️' },
    { id: 'stats', label: '📊 Statistiques', icon: '📊' },
    { id: 'crits', label: '💥 Critiques', icon: '💥' },
  ];

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

      {/* Tab Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {activeTab === 'timeline' && (
          <TimelineTab combatLog={combatLog} />
        )}
        {activeTab === 'damage' && (
          <DamageTab detailedLogs={detailedLogs} fighters={fighters} dummy={dummy} />
        )}
        {activeTab === 'stats' && (
          <StatsTab detailedLogs={detailedLogs} fighters={fighters} />
        )}
        {activeTab === 'crits' && (
          <CritsTab detailedLogs={detailedLogs} fighters={fighters} />
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
          enemy: 'text-red-300',
          buff: 'text-green-300',
          info: 'text-purple-300',
        };

        return (
          <div
            key={entry.id || idx}
            className={`text-xs ${typeColors[entry.type] || 'text-gray-300'} font-mono`}
          >
            <span className="text-gray-500">[{entry.time?.toFixed(1)}s]</span> {entry.text}
          </div>
        );
      })}
    </div>
  );
}

// Damage tab - damage dealt by each entity
function DamageTab({ detailedLogs, fighters, dummy }) {
  const allEntities = [...fighters, dummy].filter(Boolean);

  return (
    <div className="space-y-3">
      {allEntities.map(entity => {
        const log = detailedLogs[entity.id] || {};
        const totalDmg = log.totalDamage || 0;
        const damageTaken = log.damageTaken || 0;

        return (
          <div key={entity.id} className="bg-black/30 rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <img loading="lazy" src={entity.sprite} alt={entity.name} className="w-8 h-8 rounded-full" />
              <span className="font-bold text-white">{entity.name}</span>
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
              <img loading="lazy" src={fighter.sprite} alt={fighter.name} className="w-8 h-8 rounded-full" />
              <span className="font-bold text-white">{fighter.name}</span>
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
              <img loading="lazy" src={fighter.sprite} alt={fighter.name} className="w-8 h-8 rounded-full" />
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

function StatLine({ label, value, color = 'text-white' }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}:</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
  );
}
