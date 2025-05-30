import React, { useState, useEffect } from 'react';

const WeaponPopup = ({ hunterName, scaleStat, onClose, onSave, existingWeapon }) => {
  const defaultStats = {
    HP: { mainStat: 6120, precision: 4000 },
    Attack: { mainStat: 3080, precision: 4000 },
    Defense: { mainStat: 3080, precision: 4000 },
  };

  const [weaponData, setWeaponData] = useState({
    mainStat: 0,
    precision: 4000,
  });

  useEffect(() => {
    let defaultMainStat = 0;
    if (!existingWeapon || Object.keys(existingWeapon).length === 0) {
      if (scaleStat === 'HP') defaultMainStat = 6120;
      else if (scaleStat === 'Defense') defaultMainStat = 3080;
      else if (scaleStat === 'Attack') defaultMainStat = 3080;
    }

    setWeaponData({
      mainStat: existingWeapon.mainStat ?? defaultMainStat,
      precision: existingWeapon.precision ?? 4000,
    });
  }, [scaleStat, existingWeapon]);

  const handleChange = (key, value) => {
    const val = parseFloat(value);
    setWeaponData(prev => ({ ...prev, [key]: isNaN(val) ? 0 : val }));
  };

  const handleSave = () => {
    onSave(hunterName, weaponData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-lg p-6 w-80 border border-purple-500">
        <h2 className="text-xl font-bold mb-4">🗡 Modifier l'Arme</h2>

        <div className="mb-4">
          <label className="block text-sm mb-1">{`Additional ${scaleStat}`}</label>
          <input
            type="number"
            className="w-full px-2 py-1 rounded bg-gray-800 text-white"
            value={weaponData.mainStat}
            onChange={(e) => handleChange('mainStat', e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">Precision</label>
          <input
            type="number"
            className="w-full px-2 py-1 rounded bg-gray-800 text-white"
            value={weaponData.precision}
            onChange={(e) => handleChange('precision', e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
           className="bg-gradient-to-r from-[#3b3b9c] to-[#6c63ff] hover:from-[#4a4ab3] hover:to-[#7c72ff] text-white-400 font-semibold px-4 py-2 max-sm:px-2 max-sm:py-1 text-sm max-sm:text-xs rounded-lg shadow-md transition-transform duration-200 hover:scale-105"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-gradient-to-r from-[#3b3b9c] to-[#6c63ff] hover:from-[#4a4ab3] hover:to-[#7c72ff] text-white-400 font-semibold px-4 py-2 max-sm:px-2 max-sm:py-1 text-sm max-sm:text-xs rounded-lg shadow-md transition-transform duration-200 hover:scale-105"

            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeaponPopup;
