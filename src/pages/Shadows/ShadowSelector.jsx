import React, { useState, useEffect } from 'react';
import { shadowData } from '../../data/itemData';

const ShadowSelector = ({ onNext, onCancel, initialShadows = [] }) => {
  const [selectedShadows, setSelectedShadows] = useState(initialShadows);

  useEffect(() => {
    if (initialShadows.length > 0) {
      setSelectedShadows(initialShadows);
    }
  }, [initialShadows]);

  const toggleShadow = (shadow) => {
    const isSelected = selectedShadows.some((s) => s.name === shadow.name);
    if (isSelected) {
      setSelectedShadows(selectedShadows.filter((s) => s.name !== shadow.name));
    } else if (selectedShadows.length < 3) {
      setSelectedShadows([...selectedShadows, shadow]);
    }
  };

  const isSelected = (shadowName) =>
    selectedShadows.some((s) => s.name === shadowName);

  return (
    <div className="bg-zinc-900 text-white p-4 rounded-lg shadow-lg max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-6 text-center">Choose your 3 Shadows</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {shadowData.map((shadow) => (
          <div
            key={shadow.name}
            className={`border-4 rounded-lg p-2 flex flex-col items-center cursor-pointer transition-all duration-200 ${
              isSelected(shadow.name)
                ? 'border-yellow-400 scale-105'
                : 'border-white'
            }`}
            onClick={() => toggleShadow(shadow)}
          >
            <img
              src={shadow.src}
              alt={shadow.name}
              className="w-20 h-20 object-contain mb-2"
            />
            <span>{shadow.name}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onCancel}
          className="bg-gray-700 px-5 py-2 rounded hover:bg-gray-600 text-white font-semibold"
        >
          Retour
        </button>
        <button
          onClick={() => onNext(selectedShadows)}
          disabled={selectedShadows.length !== 3}
          className={`px-5 py-2 rounded font-semibold ${
            selectedShadows.length === 3
              ? 'px-4 py-2 rounded text-white font-bold'
              : 'opacity-50 cursor-not-allowed bg-gray-800'
          }`}
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default ShadowSelector;
