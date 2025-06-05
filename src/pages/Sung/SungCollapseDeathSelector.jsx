import React, { useState } from 'react';
import { runesData } from '../../data/itemData';

const SungCollapseDeathSelector = ({ onNext, onBack }) => {
  const [selectedCollapse, setSelectedCollapse] = useState(null);
  const [selectedDeath, setSelectedDeath] = useState(null);

  const collapseRunes = runesData.filter(r => r.className === 'collapse');
  const deathRunes = runesData.filter(r => r.className === 'death');

  const handleSelect = (rune, type) => {
    if (type === 'collapse') setSelectedCollapse(rune);
    if (type === 'death') setSelectedDeath(rune);
  };

  const isReady = selectedCollapse && selectedDeath;

  const renderRuneButton = (rune, selected, type) => {
    const isSelected = selected?.name === rune.name;

    return (
      <button
        key={rune.name}
        onClick={() => handleSelect(rune, type)}
        className={`flex flex-col items-center justify-center m-1 p-2 rounded-lg border-2 transition-all duration-150 w-[90px] h-[100px] text-xs shadow-md
          ${isSelected
            ? 'border-yellow-400 bg-yellow-100 bg-opacity-10 shadow-yellow-400'
            : 'border-gray-600 hover:border-blue-500 bg-gray-800 hover:bg-gray-700'}`}
      >
        <img src={rune.src} alt={rune.name} className="w-10 h-10 mb-1 rounded" />
        <span className="truncate w-full text-center text-white">{rune.name}</span>
        <span className="text-[10px] italic text-gray-400">{rune.type}</span>
      </button>
    );
  };

  return (
    <div className="p-4 bg-gray-900 rounded-xl shadow-md w-full max-w-5xl mx-auto mt-6">
      <h2 className="text-lg font-bold mb-6 text-white text-center">
        Choisis 1 skill <span className="text-blue-400">Collapse</span> & 1 skill <span className="text-red-400">Death</span>
      </h2>

      <div className="mb-6">
        <h3 className="text-white font-semibold mb-2">Collapse</h3>
        <div className="flex flex-wrap justify-center">
          {collapseRunes.map(rune => renderRuneButton(rune, selectedCollapse, 'collapse'))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-white font-semibold mb-2">Death</h3>
        <div className="flex flex-wrap justify-center">
          {deathRunes.map(rune => renderRuneButton(rune, selectedDeath, 'death'))}
        </div>
      </div>

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={onBack}
          className="bg-zinc-800 text-white px-6 py-2 rounded hover:bg-zinc-700 transition-all"
        >
          Retour
        </button>
        <button
          onClick={() => onNext({ collapse: selectedCollapse, death: selectedDeath })}
          disabled={!isReady}
          className={`px-6 py-2 rounded font-semibold transition-all ${
            isReady
              ? 'px-4 py-2 text-sm rounded bg-purple-600 hover:bg-purple-700 transition'
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          Étape suivante
        </button>
      </div>
    </div>
  );
};

export default SungCollapseDeathSelector;
