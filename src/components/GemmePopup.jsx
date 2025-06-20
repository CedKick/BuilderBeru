import { gemTypes } from '../utils/gemOptions';
import React, { useState, useEffect } from 'react';

const GemmePopup = ({ gemData, onClose, onSave, isMobile }) => { // ← 🐉 AJOUT gemData en props !
  const [gemValues, setGemValues] = useState({});

  useEffect(() => {
    // 🐉 KAISEL FIX : Utilise les gemData du compte actif, pas le localStorage global !
    if (gemData && Object.keys(gemData).length > 0) {
      console.log("🐉 Kaisel: Chargement gemmes depuis props:", gemData);
      setGemValues(gemData);
    } else {
      console.log("🐉 Kaisel: Aucune gemme en props, utilisation des valeurs par défaut");
      setGemValues(gemTypes);
    }
  }, [gemData]); // ← 🐉 DÉPENDANCE sur gemData !

  const handleChange = (category, stat, value) => {
    setGemValues(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [stat]: value
      }
    }));
  };

  const handleSave = () => {
    // 🐉 KAISEL FIX : SUPPRIME la sauvegarde localStorage globale !
    // localStorage.setItem('gems', JSON.stringify(gemValues)); ← SUPPRIMÉ !
    
    console.log("🐉 Kaisel: Sauvegarde gemmes via onSave callback:", gemValues);
    onSave(gemValues); // ← Seule sauvegarde : via le callback parent !
    onClose();
  };

  const getColor = (type) => ({
    Red: 'text-red-500',
    Blue: 'text-blue-400',
    Green: 'text-green-400',
    Purple: 'text-purple-400',
    Yellow: 'text-yellow-400'
  }[type] || 'text-white');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center overflow-y-auto p-2">
      <div className="bg-[#1c1c2c] p-4 sm:p-6 rounded-xl w-full max-w-5xl text-white max-h-[90vh] overflow-y-auto">
        <h2 className="text-center text-lg font-bold mb-4">💎 Configurer les Gemmes</h2>

        {(isMobile?.isPhone || isMobile?.isTablet) && !isMobile?.isDesktop ? (
          <div className="flex flex-col gap-4">
            {Object.entries(gemTypes).map(([category, stats]) => (
              <div key={category} className="border rounded-lg p-2 bg-[#2a2a3d]">
                <div className={`font-semibold mb-2 ${getColor(category)}`}>{category} Gem</div>
                <div className="flex flex-col gap-2">
                  {Object.keys(stats).map((stat) => (
                    <div key={stat} className="flex justify-between items-center text-sm">
                      <label>{stat}</label>
                      <input
                        type="number"
                        className="w-24 text-right px-2 py-1 rounded bg-[#1a1a2f] text-white"
                        value={gemValues[category]?.[stat] || 0}
                        onChange={(e) => handleChange(category, stat, +e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 auto-rows-auto">
            {Object.entries(gemTypes).map(([category, stats]) => (
              <div
                key={category}
                className={`border rounded-lg p-2 bg-[#2a2a3d] ${category === 'Purple' || category === 'Yellow' ? 'col-span-3 sm:col-span-1' : ''}`}
              >
                <div className={`font-semibold mb-2 ${getColor(category)}`}>{category} Gem</div>
                <div className="flex flex-col gap-2">
                  {Object.keys(stats).map((stat) => (
                    <div key={stat} className="flex justify-between items-center text-sm">
                      <label>{stat}</label>
                      <input
                        type="number"
                        className="w-24 text-right px-2 py-1 rounded bg-[#1a1a2f] text-white"
                        value={gemValues[category]?.[stat] || 0}
                        onChange={(e) => handleChange(category, stat, +e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-6 gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default GemmePopup;