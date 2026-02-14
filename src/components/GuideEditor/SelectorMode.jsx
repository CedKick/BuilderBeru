// src/components/GuideEditor/SelectorMode.jsx
import React from 'react';

export default function SelectorMode({ selectedMode, setSelectedMode }) {
  const modes = [
    { label: '🔥 Power of Destruction (PoD)', value: 'PoD' },
    { label: '⚔️ Boss de Guilde (BdG)', value: 'BdG' },
    { label: '🌀 Battle of Time (BoT)', value: 'BoT' }
  ];

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-2">Choisis un mode :</h2>
      <div className="flex gap-4">
        {modes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => setSelectedMode(mode.value)}
            className={`px-4 py-2 rounded-lg border ${
              selectedMode === mode.value
                ? 'bg-purple-700 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
}