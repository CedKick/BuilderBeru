import React, { useState } from 'react';
import { blessingStonesData } from '../../data/itemData';

const SungBlessingSelector = ({ onNext, onBack }) => {
  const [selectedOffensive, setSelectedOffensive] = useState([]);
  const [selectedDefensive, setSelectedDefensive] = useState([]);

  const handleSelect = (type, stone) => {
    const setter = type === 'Offensive' ? setSelectedOffensive : setSelectedDefensive;
    const selected = type === 'Offensive' ? selectedOffensive : selectedDefensive;

    if (selected.includes(stone.name)) {
      setter(selected.filter(s => s !== stone.name));
    } else if (selected.length < 4) {
      setter([...selected, stone.name]);
    }
  };

  const canProceed = selectedOffensive.length === 4 && selectedDefensive.length === 4;

  const grouped = {
    Offensive: blessingStonesData.filter(stone => stone.type === 'offensive'),
    Defensive: blessingStonesData.filter(stone => stone.type === 'defensive'),
  };

  return (
    <div className="bg-zinc-900 rounded-xl p-6 space-y-6">
      <h2 className="text-lg font-bold">Choisis 4 Blessing Stones offensives</h2>
      <div className="grid grid-cols-8 gap-1">
        {grouped.Offensive.map(stone => (
          <div
            key={stone.name}
            onClick={() => handleSelect('Offensive', stone)}
            className={`cursor-pointer border rounded-lg p-1 text-center transition-all ${
              selectedOffensive.includes(stone.name) ? 'border-yellow-400' : 'border-transparent'
            }`}
            title={stone.name}
          >
            <img
              src={stone.src}
              alt={`${stone.name} ${stone.type}`}
              className="w-14 h-14 object-contain mx-auto"
            />
            <div className="text-xs truncate mt-1">{stone.name}</div>
          </div>
        ))}
      </div>

      {selectedOffensive.length === 4 && (
        <>
          <h2 className="text-lg font-bold mt-4">Choisis 4 Blessing Stones défensives</h2>
          <div className="grid grid-cols-8 gap-1">
            {grouped.Defensive.map(stone => (
              <div
                key={stone.name}
                onClick={() => handleSelect('Defensive', stone)}
                className={`cursor-pointer border rounded-lg p-1 text-center transition-all ${
                  selectedDefensive.includes(stone.name) ? 'border-yellow-400' : 'border-transparent'
                }`}
                title={stone.name}
              >
                <img
                  src={stone.src}
                  alt={`${stone.name} ${stone.type}`}
                  className="w-14 h-14 object-contain mx-auto"
                />
                <div className="text-xs truncate mt-1">{stone.name}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="bg-zinc-800 text-white px-4 py-2 rounded hover:bg-zinc-700"
        >
          Retour
        </button>

        <button
          disabled={!canProceed}
          onClick={() => {
            const getFullStone = (name) => blessingStonesData.find((s) => s.name === name);
            onNext({
              offensive: selectedOffensive.map(getFullStone),
              defensive: selectedDefensive.map(getFullStone),
            });
          }}
          className={`px-4 py-2 rounded ${
            canProceed
              ? 'bg-yellow-600 text-white hover:bg-yellow-700'
              : 'bg-zinc-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          Étape suivante
        </button>
      </div>
    </div>
  );
};

export default SungBlessingSelector;
