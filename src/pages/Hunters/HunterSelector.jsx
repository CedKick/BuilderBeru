import React, { useState, useEffect } from 'react';
import { characters } from '../../data/itemData';

export default function HunterSelector({ selectedHunters = [], setSelectedHunters, onNext, onBack }) {
  const [localSelection, setLocalSelection] = useState(selectedHunters);
  const elements = ['Fire', 'Water', 'Wind', 'Dark', 'Light'];

  const huntersByElement = elements.reduce((acc, element) => {
    acc[element] = Object.entries(characters)
      .filter(([_, data]) => data.element === element)
      .map(([key, data]) => ({ id: key, ...data }));
    return acc;
  }, {});

  useEffect(() => {
    if (Array.isArray(selectedHunters)) {
      setLocalSelection(selectedHunters);
    }
  }, [selectedHunters]);

  const toggleHunter = (id) => {
    const isSelected = localSelection.includes(id);
    let updated;
    if (isSelected) {
      updated = localSelection.filter((h) => h !== id);
    } else if (localSelection.length < 3) {
      updated = [...localSelection, id];
    } else {
      return;
    }
    setLocalSelection(updated);
    setSelectedHunters(updated);
  };

  const isReady = localSelection.length === 3;

  return (
    <div className="space-y-4 p-1 bg-gray-900 rounded-xl text-white max-w-[1440px] mx-auto">
      <h2 className="text-xl font-semibold text-center mb-2">Choisis 3 chasseurs pour cette équipe</h2>

      {elements.map((element) =>
        huntersByElement[element]?.length > 0 ? (
          <div key={element}>
            <h3 className="text-sm font-bold text-center text-blue-300 my-2 uppercase">{element}</h3>
            <div className="grid grid-cols-8 gap-[px-10] justify-center">
              {huntersByElement[element].map((hunter) => {
                const isSelected = localSelection.includes(hunter.id);
                return (
                  <div
                    key={hunter.id}
                    className={`flex flex-col items-center p-1 rounded-md border-2 transition duration-150 ${
                      isSelected ? 'border-yellow-400 bg-yellow-200/10' : 'border-transparent'
                    } cursor-pointer`}
                    onClick={() => toggleHunter(hunter.id)}
                  >
                    <img
                      src={hunter.icon}
                      alt={`${hunter.name} - ${hunter.class} - ${hunter.element}`}
                      className="w-15 h-15 object-contain rounded-full"
                    />
                    <span className="text-[10px] text-center mt-1 truncate w-[80px]">{hunter.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null
      )}

      <div className="flex justify-between items-center pt-6">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded bg-black text-white font-bold hover:bg-gray-700 transition"
        >
          Retour
        </button>
        <button
          disabled={!isReady}
          onClick={() => onNext(localSelection)}
          className={`px-4 py-2 rounded text-white font-bold ${
            isReady ? 'bg-yellow-500 hover:bg-yellow-600' : 'opacity-50 cursor-not-allowed bg-gray-800'
          }`}
        >
          Étape suivante
        </button>
      </div>
    </div>
  );
}
