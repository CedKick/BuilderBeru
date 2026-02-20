// src/pages/ShadowColosseum/TrainingDummy/BattleView.jsx
// Main battle view component - orchestrates all battle UI components

import React, { useState } from 'react';
import { Play, Pause, RotateCcw, TrendingUp } from 'lucide-react';
import FighterCard from './FighterCard';
import DummyCard from './DummyCard';
import SharedStatsPanel from '../SharedBattleComponents/SharedStatsPanel';
import SharedDPSGraph from '../SharedBattleComponents/SharedDPSGraph';
import SharedCombatLogs from '../SharedBattleComponents/SharedCombatLogs';
import { formatDamage, formatTime } from './formatters';
import { WEAPONS } from '../equipmentData';

export default function BattleView({
  battleState,
  dummyConfig,
  setDummyConfig,
  timer,
  isPaused,
  dpsTracker,
  dummyAttacksEnabled,
  setDummyAttacksEnabled,
  combatLog,
  dpsHistory,
  detailedLogs,
  coloData,
  onTogglePause,
  onRefresh,
}) {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [selectedEntityWeapon, setSelectedEntityWeapon] = useState(null);

  if (!battleState) return null;

  const { fighters, dummy } = battleState;
  const totalDmg = Object.values(dpsTracker.current || {}).reduce((s, v) => s + v, 0);
  const elapsed = 180 - timer;

  // Calculate DPS breakdown
  const dpsBreakdown = fighters.map(f => {
    const dmg = dpsTracker.current[f.id] || 0;
    const dps = elapsed > 0 ? dmg / elapsed : 0;
    const percent = totalDmg > 0 ? (dmg / totalDmg) * 100 : 0;
    return {
      id: f.id,
      damage: dmg,
      dps,
      percent,
    };
  });

  const handleFighterClick = (fighter) => {
    setSelectedEntity(fighter);
    setSelectedEntityWeapon(coloData.weapons?.[fighter.id]);
  };

  const handleDummyClick = () => {
    setSelectedEntity(dummy);
    setSelectedEntityWeapon(null);
  };

  return (
    <div className="space-y-4">
      {/* Timer & Controls */}
      <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-2xl p-4 border-2 border-purple-400/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-white tabular-nums">
              {formatTime(timer)}
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-sm text-gray-300">
                <span className="text-yellow-400 font-bold">{formatDamage(totalDmg)}</span> DMG Total
              </div>
              <div className="text-xs text-gray-400">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                {formatDamage(elapsed > 0 ? totalDmg / elapsed : 0)}/s DPS
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePause}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all shadow-lg"
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              <span className="font-bold">{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all shadow-lg"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="font-bold">Reset</span>
            </button>
          </div>
        </div>

        {isPaused && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-sm text-yellow-300 text-center font-bold animate-pulse">
              ⏸️ Combat en pause - Vous pouvez modifier les stats du boss
            </p>
          </div>
        )}
      </div>

      {/* Battle Arena */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-start">
        {/* Fighters Side */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-center text-purple-300 mb-4">
            ⚔️ Hunters ({fighters.filter(f => f.alive).length}/{fighters.length})
          </h3>
          {fighters.map(fighter => {
            const weaponId = coloData.weapons?.[fighter.id];
            const dpsData = dpsBreakdown.find(d => d.id === fighter.id);
            const logs = detailedLogs[fighter.id];

            return (
              <FighterCard
                key={fighter.id}
                fighter={fighter}
                weaponId={weaponId}
                dpsData={dpsData}
                logs={logs}
                onClick={() => handleFighterClick(fighter)}
                isSelected={selectedEntity?.id === fighter.id}
              />
            );
          })}
        </div>

        {/* VS Divider */}
        <div className="flex flex-col items-center justify-center pt-12">
          <div className="relative">
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse">
              VS
            </div>
            <div className="absolute inset-0 blur-xl bg-gradient-to-r from-purple-600 to-pink-600 opacity-30 animate-pulse" />
          </div>
        </div>

        {/* Dummy Side */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-center text-orange-300 mb-4">
            🎯 Mannequin
          </h3>
          <DummyCard
            dummy={dummy}
            dummyConfig={dummyConfig}
            onConfigChange={setDummyConfig}
            isPaused={isPaused}
            attacksEnabled={dummyAttacksEnabled}
            onToggleAttacks={setDummyAttacksEnabled}
            onClick={handleDummyClick}
            isSelected={selectedEntity?.id === dummy.id}
          />
        </div>
      </div>

      {/* DPS Graph */}
      <SharedDPSGraph
        dpsHistory={dpsHistory}
        fighters={fighters}
        bossData={{ id: 'dummy', name: 'Mannequin' }}
      />

      {/* Combat Logs */}
      <SharedCombatLogs
        combatLog={combatLog}
        detailedLogs={detailedLogs}
        fighters={fighters}
        boss={dummy}
      />

      {/* Stats Panel Modal */}
      {selectedEntity && (
        <SharedStatsPanel
          entity={selectedEntity}
          weapon={selectedEntityWeapon ? WEAPONS[selectedEntityWeapon] : null}
          logs={detailedLogs[selectedEntity.id]}
          onClose={() => setSelectedEntity(null)}
        />
      )}
    </div>
  );
}
