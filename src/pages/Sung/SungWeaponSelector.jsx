import React, { useState } from 'react';
import { weaponData } from '../../data/itemData';

export default function SungWeaponSelector({ onNext, onBack }) {
  const [selectedWeapons, setSelectedWeapons] = useState([]);

  const toggleWeapon = (weapon) => {
    const alreadySelected = selectedWeapons.find(w => w.name === weapon.name);

    if (alreadySelected) {
      setSelectedWeapons(prev => prev.filter(w => w.name !== weapon.name));
    } else if (selectedWeapons.length < 2) {
      setSelectedWeapons(prev => [...prev, weapon]);
    } else {
      // Remplace la plus ancienne sélection
      setSelectedWeapons(prev => [...prev.slice(1), weapon]);
    }
  };

  const isSelected = (weapon) =>
    selectedWeapons.some(w => w.name === weapon.name);

  return (
    <div className="bg-zinc-900 rounded-xl shadow-md p-6 text-white max-w-6xl mx-auto">
      <h2 className="text-xl font-bold mb-6 text-center">Choisis deux armes de Sung</h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {weaponData.map((weapon) => (
          <div
            key={weapon.name}
            onClick={() => toggleWeapon(weapon)}
            className={`border-4 rounded-lg p-2 cursor-pointer flex flex-col items-center justify-center transition
              ${isSelected(weapon) ? 'border-yellow-400' : 'border-white hover:border-yellow-500'}`}
          >
            <img
              src={weapon.src}
              alt={weapon.name}
              className="h-24 object-contain"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="bg-zinc-700 text-white px-4 py-2 rounded hover:bg-zinc-600"
        >
          Retour
        </button>

        <button
          onClick={() => onNext(selectedWeapons)}
          disabled={selectedWeapons.length !== 2}
          className={`px-4 py-2 rounded font-semibold transition ${
            selectedWeapons.length === 2
              ? 'px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 transition'
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          Étape suivante
        </button>
      </div>
    </div>
  );
}
