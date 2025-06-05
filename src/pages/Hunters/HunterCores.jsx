import React, { useState, useEffect } from 'react';
import { coresData } from '../../data/itemData';

const HuntersCore = ({ onClose, onSelect }) => {
  const [selectedCores, setSelectedCores] = useState({
    Offensive: null,
    Defensive: null,
    Endurance: null,
  });

  const handleCoreClick = (core) => {
    setSelectedCores((prev) => ({
      ...prev,
      [core.type]: prev[core.type]?.name === core.name ? null : core,
    }));
  };

  useEffect(() => {
    const allSelected = Object.values(selectedCores).every((core) => core !== null);
    if (allSelected) {
      setTimeout(() => {
        onSelect(selectedCores);
        onClose();
      }, 500);
    }
  }, [selectedCores]);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
      <div className="bg-gray-900 text-white p-6 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl mb-4 font-bold text-center">Select 1 Core per Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Offensive', 'Defensive', 'Endurance'].map((type) => (
            <div key={type}>
              <h3 className="text-lg font-semibold mb-2">{type}</h3>
              <div className="flex flex-wrap gap-2">
                {coresData
                  .filter((core) => core.type === type)
                  .map((core) => (
                    <div
                      key={core.name}
                      onClick={() => handleCoreClick(core)}
                      className={`cursor-pointer p-1 border-4 rounded-md w-16 h-16 flex items-center justify-center
                        ${
                          selectedCores[type]?.name === core.name
                            ? 'border-yellow-400'
                            : 'border-transparent'
                        }`}
                    >
                      <img src={core.src} alt={core.name} className="w-full h-full object-contain" />
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* BOUTON ANNULER */}
        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default HuntersCore;
