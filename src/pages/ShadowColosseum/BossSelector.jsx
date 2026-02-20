// src/pages/ShadowColosseum/BossSelector.jsx
// Sélecteur de boss pour Training Dummy

import React from 'react';
import { ARC2_STAGES } from './arc2Data';
import { RAID_BOSSES, RAID_TIERS } from './raidData';

const fmt = (n) => Math.floor(n).toLocaleString('fr-FR');

// ARC I Bosses
const ARC1_BOSSES = [
  { id: 'knight', name: 'Chevalier Déchu', tier: 1,
    hp: 320, atk: 28, def: 22, spd: 22, crit: 8, res: 5 },
  { id: 'guardian', name: 'Gardien du Portail', tier: 2,
    hp: 550, atk: 38, def: 35, spd: 16, crit: 5, res: 15 },
  { id: 'dread_lord', name: 'Seigneur de l\'Effroi', tier: 3,
    hp: 850, atk: 55, def: 42, spd: 28, crit: 10, res: 18 },
  { id: 'shadow_monarch', name: 'Monarque des Ombres', tier: 4,
    hp: 1200, atk: 72, def: 55, spd: 35, crit: 15, res: 25 },
  { id: 'ancient_dragon', name: 'Dragon Ancestral', tier: 5,
    hp: 1800, atk: 95, def: 72, spd: 42, crit: 20, res: 35 },
  { id: 'abyss_tyrant', name: 'Tyran des Abysses', tier: 6,
    hp: 2800, atk: 125, def: 95, spd: 48, crit: 25, res: 45 },
];

// ARC II Bosses (filter from ARC2_STAGES)
const ARC2_BOSSES = ARC2_STAGES.filter(s => s.isBoss);

// Slider Input Component
function SliderInput({ label, value, onChange, min, max, step = 1, logarithmic = false, unit = '' }) {
  const handleChange = (e) => {
    const rawValue = parseFloat(e.target.value);
    if (logarithmic) {
      const logMin = Math.log10(min);
      const logMax = Math.log10(max);
      const logValue = logMin + (rawValue / 100) * (logMax - logMin);
      const actualValue = Math.round(Math.pow(10, logValue) / step) * step;
      onChange(actualValue);
    } else {
      onChange(rawValue);
    }
  };

  const displayValue = logarithmic
    ? ((Math.log10(value) - Math.log10(min)) / (Math.log10(max) - Math.log10(min))) * 100
    : value;

  return (
    <div className="flex items-center gap-3">
      <label className="text-xs font-bold text-gray-300 w-20">{label}</label>
      <input
        type="range"
        min={logarithmic ? 0 : min}
        max={logarithmic ? 100 : max}
        step={logarithmic ? 0.1 : step}
        value={displayValue}
        onChange={handleChange}
        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
      />
      <span className="text-sm font-bold text-white w-24 text-right">
        {fmt(value)}{unit}
      </span>
    </div>
  );
}

export default function BossSelector({
  configMode,
  setConfigMode,
  selectedBoss,
  setSelectedBoss,
  difficulty,
  setDifficulty,
  raidTier,
  setRaidTier,
  dummyConfig,
  setDummyConfig,
  applyPreset,
  applyBossPreset,
}) {
  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <h2 className="text-lg font-bold mb-4 text-center text-purple-300">Configuration Cible</h2>

      {/* Config Mode Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { id: 'manual', label: '⚙️ Manuel', color: 'gray' },
          { id: 'arc1', label: '⚔️ ARC I', color: 'blue' },
          { id: 'arc2', label: '🤖 ARC II', color: 'purple' },
          { id: 'raid', label: '🐜 Ant Queen', color: 'green' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setConfigMode(tab.id)}
            className={`flex-1 py-2 px-3 rounded-lg border-2 text-xs font-bold transition-all ${
              configMode === tab.id
                ? 'border-purple-400 bg-purple-500/20 text-white scale-105'
                : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Manual Config */}
      {configMode === 'manual' && (
        <>
          <div className="space-y-3 mb-4">
            <SliderInput label="Level" value={dummyConfig.level} onChange={(v) => setDummyConfig(prev => ({ ...prev, level: v }))} min={1} max={100} step={1} />
            <SliderInput label="HP" value={dummyConfig.hp} onChange={(v) => setDummyConfig(prev => ({ ...prev, hp: v }))} min={1000} max={10000000} step={1000} logarithmic />
            <SliderInput label="ATK" value={dummyConfig.atk} onChange={(v) => setDummyConfig(prev => ({ ...prev, atk: v }))} min={0} max={2000} step={10} />
            <SliderInput label="DEF" value={dummyConfig.def} onChange={(v) => setDummyConfig(prev => ({ ...prev, def: v }))} min={0} max={1000} step={10} />
            <SliderInput label="RES" value={dummyConfig.res} onChange={(v) => setDummyConfig(prev => ({ ...prev, res: v }))} min={0} max={200} step={5} />
            <SliderInput label="SPD" value={dummyConfig.spd} onChange={(v) => setDummyConfig(prev => ({ ...prev, spd: v }))} min={0} max={200} step={5} />
            <SliderInput label="CRIT" value={dummyConfig.crit} onChange={(v) => setDummyConfig(prev => ({ ...prev, crit: v }))} min={0} max={100} step={1} unit="%" />
            <SliderInput label="CRIT DMG" value={dummyConfig.critDmg} onChange={(v) => setDummyConfig(prev => ({ ...prev, critDmg: v }))} min={100} max={500} step={5} unit="%" />
          </div>

          <div className="border-t border-white/10 pt-4">
            <h3 className="text-sm font-bold text-gray-300 mb-2 text-center">Presets</h3>
            <div className="flex gap-2 justify-center flex-wrap">
              <button onClick={() => applyPreset('fragile')} className="px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-bold hover:bg-blue-600/30 transition-all">Fragile</button>
              <button onClick={() => applyPreset('tank')} className="px-3 py-1.5 rounded-lg bg-green-600/20 border border-green-500/30 text-green-300 text-xs font-bold hover:bg-green-600/30 transition-all">Tank</button>
              <button onClick={() => applyPreset('boss_t1')} className="px-3 py-1.5 rounded-lg bg-orange-600/20 border border-orange-500/30 text-orange-300 text-xs font-bold hover:bg-orange-600/30 transition-all">Boss T1</button>
              <button onClick={() => applyPreset('boss_t3')} className="px-3 py-1.5 rounded-lg bg-red-600/20 border border-red-500/30 text-red-300 text-xs font-bold hover:bg-red-600/30 transition-all">Boss T3</button>
              <button onClick={() => applyPreset('boss_t6')} className="px-3 py-1.5 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-bold hover:bg-purple-600/30 transition-all">Boss T6</button>
            </div>
          </div>
        </>
      )}

      {/* ARC I Boss Selection */}
      {configMode === 'arc1' && (
        <>
          <div className="mb-4">
            <label className="text-xs font-bold text-gray-300 block mb-2">Sélectionner un Boss ARC I:</label>
            <div className="grid grid-cols-2 gap-2">
              {ARC1_BOSSES.map(boss => (
                <button
                  key={boss.id}
                  onClick={() => {
                    setSelectedBoss(boss.id);
                    applyBossPreset('arc1', boss.id, difficulty);
                  }}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedBoss === boss.id
                      ? 'border-blue-400 bg-blue-500/20 text-white'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/30'
                  }`}
                >
                  <div className="text-sm font-bold">{boss.name}</div>
                  <div className="text-xs text-gray-400">Tier {boss.tier}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs font-bold text-gray-300 block mb-2">Difficulté: {difficulty}/10</label>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={difficulty}
              onChange={(e) => {
                const newDiff = parseInt(e.target.value);
                setDifficulty(newDiff);
                if (selectedBoss) applyBossPreset('arc1', selectedBoss, newDiff);
              }}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-xs text-gray-400 text-center mt-1">
              Stats x{(1 + difficulty * 0.5).toFixed(1)}
            </div>
          </div>
        </>
      )}

      {/* ARC II Boss Selection */}
      {configMode === 'arc2' && (
        <>
          <div className="mb-4">
            <label className="text-xs font-bold text-gray-300 block mb-2">Sélectionner un Boss ARC II:</label>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {ARC2_BOSSES.map(boss => (
                <button
                  key={boss.id}
                  onClick={() => {
                    setSelectedBoss(boss.id);
                    applyBossPreset('arc2', boss.id, difficulty);
                  }}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedBoss === boss.id
                      ? 'border-purple-400 bg-purple-500/20 text-white'
                      : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/30'
                  }`}
                >
                  <div className="text-sm font-bold">{boss.name}</div>
                  <div className="text-xs text-gray-400">Tier {boss.tier}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs font-bold text-gray-300 block mb-2">Difficulté: {difficulty}/10</label>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={difficulty}
              onChange={(e) => {
                const newDiff = parseInt(e.target.value);
                setDifficulty(newDiff);
                if (selectedBoss) applyBossPreset('arc2', selectedBoss, newDiff);
              }}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="text-xs text-gray-400 text-center mt-1">
              Stats x{(1 + difficulty * 0.5).toFixed(1)}
            </div>
          </div>
        </>
      )}

      {/* Ant Queen Tier Selection */}
      {configMode === 'raid' && (
        <>
          <div className="mb-4">
            <label className="text-xs font-bold text-gray-300 block mb-2">Sélectionner un Tier:</label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map(tier => {
                const tierData = RAID_TIERS[tier];
                return (
                  <button
                    key={tier}
                    onClick={() => {
                      setRaidTier(tier);
                      setSelectedBoss('ant_queen');
                      applyBossPreset('raid', 'ant_queen', tier);
                    }}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      raidTier === tier
                        ? 'border-green-400 bg-green-500/20 text-white scale-105'
                        : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/30'
                    }`}
                  >
                    <div className="text-lg font-bold">T{tier}</div>
                    <div className="text-[10px] text-gray-400">{tierData.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-black/20 rounded-lg p-3 border border-green-500/20">
            <div className="text-xs font-bold text-green-300 mb-2">🐜 Reine des Fourmis - T{raidTier}</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-gray-400">HP Mult: <span className="text-white font-bold">x{RAID_TIERS[raidTier].bossHPMult}</span></div>
              <div className="text-gray-400">ATK Mult: <span className="text-white font-bold">x{RAID_TIERS[raidTier].bossAtkMult}</span></div>
              <div className="text-gray-400">DEF Mult: <span className="text-white font-bold">x{RAID_TIERS[raidTier].bossDefMult}</span></div>
              <div className="text-gray-400">SPD Mult: <span className="text-white font-bold">x{RAID_TIERS[raidTier].bossSpdMult}</span></div>
            </div>
          </div>
        </>
      )}

      {/* Stats Display */}
      {configMode !== 'manual' && (
        <div className="mt-4 bg-black/30 rounded-lg p-3 border border-white/10">
          <div className="text-xs font-bold text-purple-300 mb-2">📊 Stats Calculées:</div>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="text-gray-400">LV: <span className="text-white font-bold">{dummyConfig.level}</span></div>
            <div className="text-gray-400">HP: <span className="text-white font-bold">{fmt(dummyConfig.hp)}</span></div>
            <div className="text-gray-400">ATK: <span className="text-white font-bold">{fmt(dummyConfig.atk)}</span></div>
            <div className="text-gray-400">DEF: <span className="text-white font-bold">{fmt(dummyConfig.def)}</span></div>
            <div className="text-gray-400">SPD: <span className="text-white font-bold">{fmt(dummyConfig.spd)}</span></div>
            <div className="text-gray-400">RES: <span className="text-white font-bold">{fmt(dummyConfig.res)}%</span></div>
            <div className="text-gray-400">CRIT: <span className="text-white font-bold">{fmt(dummyConfig.crit)}%</span></div>
            <div className="text-gray-400">CDMG: <span className="text-white font-bold">{fmt(dummyConfig.critDmg)}%</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
