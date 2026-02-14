import React, { useState, useEffect } from 'react';

const WeaponPopup = ({ hunterName, scaleStat, onClose, onSave, existingWeapon }) => {
  // 🔥 Détection si c'est Sung Jinwoo
  const isSungJinwoo = hunterName === 'Sung Jinwoo' || hunterName === 'sung-jinwoo' || hunterName === 'sung' || hunterName === 'jinwoo';
  
  const [weaponData, setWeaponData] = useState({
    mainStat: 0,
    precision: 0,
  });

  useEffect(() => {
    // Valeurs par défaut
    let defaultMainStat = 0;
    let defaultPrecision = 0;
    
    // HP toujours 6120, peu importe le personnage
    if (scaleStat === 'HP') {
      defaultMainStat = 6120;
    } else {
      // Attack ou Defense : 3080 pour hunter, 6160 pour Jinwoo
      defaultMainStat = isSungJinwoo ? 6160 : 3080;
    }
    
    // Precision : 4000 pour hunter, 8000 pour Jinwoo
    defaultPrecision = isSungJinwoo ? 8000 : 4000;

    // Si c'est Jinwoo et que les valeurs existantes sont celles d'un hunter, on force les bonnes valeurs
    if (isSungJinwoo && existingWeapon?.mainStat === 3080 && scaleStat !== 'HP') {
      setWeaponData({
        mainStat: 6160,
        precision: 8000,
      });
    } else {
      setWeaponData({
        mainStat: existingWeapon?.mainStat ?? defaultMainStat,
        precision: existingWeapon?.precision ?? defaultPrecision,
      });
    }
  }, [scaleStat, existingWeapon, isSungJinwoo, hunterName]);

  const handleChange = (key, value) => {
    const val = parseFloat(value);
    setWeaponData(prev => ({ ...prev, [key]: isNaN(val) ? 0 : val }));
  };

  const handleSave = () => {
    onSave(hunterName, weaponData);
    onClose();
  };

  // Calcul des valeurs par arme pour l'affichage Jinwoo
  const perWeaponMainStat = isSungJinwoo ? Math.floor(weaponData.mainStat / 2) : weaponData.mainStat;
  const perWeaponPrecision = isSungJinwoo ? Math.floor(weaponData.precision / 2) : weaponData.precision;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-lg p-6 w-96 border border-purple-500">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-bold">
            {isSungJinwoo ? '⚔️ Modifier les Armes' : '🗡️ Modifier l\'Arme'}
          </h2>
          {isSungJinwoo && (
            <span className="text-xs bg-purple-600 px-2 py-1 rounded">
              2 Armes
            </span>
          )}
        </div>

        {isSungJinwoo && (
          <div className="bg-purple-900/30 p-3 rounded mb-4 text-sm">
            <p className="text-purple-300">
              ⚡ Sung Jinwoo porte 2 armes identiques
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Total affiché = Arme 1 + Arme 2
            </p>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm mb-1">
            {`Additional ${scaleStat}`} (Total)
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-purple-500 transition-colors"
            value={weaponData.mainStat}
            onChange={(e) => handleChange('mainStat', e.target.value)}
          />
          {isSungJinwoo && (
            <div className="text-xs text-purple-400 mt-1">
              = {perWeaponMainStat} par arme × 2
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">
            Precision (Total)
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-purple-500 transition-colors"
            value={weaponData.precision}
            onChange={(e) => handleChange('precision', e.target.value)}
          />
          {isSungJinwoo && (
            <div className="text-xs text-purple-400 mt-1">
              = {perWeaponPrecision} par arme × 2
            </div>
          )}
        </div>

        {/* Résumé détaillé pour Jinwoo */}
        {isSungJinwoo && (
          <div className="bg-gray-800/50 p-3 rounded mb-4 text-sm border border-gray-700">
            <div className="text-xs text-gray-400 mb-2">Détail par arme :</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">Arme 1:</span>
                <div>{perWeaponMainStat} {scaleStat}</div>
                <div>{perWeaponPrecision} Precision</div>
              </div>
              <div>
                <span className="text-gray-400">Arme 2:</span>
                <div>{perWeaponMainStat} {scaleStat}</div>
                <div>{perWeaponPrecision} Precision</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold px-4 py-2 text-sm rounded-lg shadow-md transition-all duration-200 hover:scale-105"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-4 py-2 text-sm rounded-lg shadow-md transition-all duration-200 hover:scale-105"
            onClick={handleSave}
          >
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeaponPopup;