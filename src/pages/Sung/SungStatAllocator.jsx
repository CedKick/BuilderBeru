import React, { useState } from "react";

export default function SungStatAllocator({ stats, setStats, onNext, onPrevious }) {
  const TOTAL_POINTS = 754;
  const usedPoints = Object.values(stats).reduce((acc, val) => acc + val, 0);
  const remainingPoints = TOTAL_POINTS - usedPoints;

  const adjustStat = (key, delta) => {
    const newVal = stats[key] + delta;
    if (newVal < 10) return;

    const simulatedStats = { ...stats, [key]: newVal };
    const totalSimulated = Object.values(simulatedStats).reduce((acc, val) => acc + val, 0);

    if (totalSimulated <= TOTAL_POINTS) {
      setStats(simulatedStats);
    }
  };

  const applyPreset = () => {
    const preset = {
      strength: 464,
      intelligence: 220,
      perception: 50,
      vitality: 10,
      agility: 10,
    };

    const total = Object.values(preset).reduce((acc, v) => acc + v, 0);
    if (total === TOTAL_POINTS) {
      setStats(preset);
    } else {
      alert("Le preset dépasse la limite !");
    }
  };

  const handleNext = () => {
    if (remainingPoints === 0 && onNext) {
      onNext();
    }
  };

  return (
    <div className="p-4 bg-gray-900 rounded-xl text-white shadow-lg max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Répartition des points de Sung</h2>

      <div className="space-y-4">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between bg-gray-800 p-2 rounded-lg">
            <span className="capitalize w-24">{key}</span>

            <div className="flex items-center gap-2">
              <button
                className="px-2 py-1 bg-red-600 rounded hover:bg-red-700"
                onClick={() => adjustStat(key, -10)}
              >
                -10
              </button>
              <button
                className="px-2 py-1 bg-red-500 rounded hover:bg-red-600"
                onClick={() => adjustStat(key, -1)}
              >
                -
              </button>

              <span className="w-12 text-center font-bold text-yellow-300">{value}</span>

              <button
                className="px-2 py-1 bg-green-500 rounded hover:bg-green-600"
                onClick={() => adjustStat(key, +1)}
              >
                +
              </button>
              <button
                className="px-2 py-1 bg-green-600 rounded hover:bg-green-700"
                onClick={() => adjustStat(key, +10)}
              >
                +10
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-right">
        Points restants :{" "}
        <span
          className={`font-bold ${
            remainingPoints < 0 ? "text-red-400" : "text-green-400"
          }`}
        >
          {remainingPoints}
        </span>
      </div>

      <div className="flex items-center justify-between mt-6">
        <button
          onClick={onPrevious}
          className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition"
        >
          Retour
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={applyPreset}
            className="text-sm underline text-blue-400 hover:text-blue-300"
          >
            Appliquer preset 464/220/50
          </button>

          <button
            onClick={handleNext}
            disabled={remainingPoints !== 0}
            className={`px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 transition ${
              remainingPoints !== 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Étape suivante
          </button>
        </div>
      </div>
    </div>
  );
}
