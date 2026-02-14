import { gemTypes } from '../utils/gemOptions';
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const GemmePopup = ({ gemData, onClose, onSave, isMobile }) => {
  const [gemValues, setGemValues] = useState({});
  const { t } = useTranslation();
  
  // 🔥 KAISEL INPUT SYSTEM - Same as ArtifactCard
  const [inputStates, setInputStates] = useState({});
  const [isFocused, setIsFocused] = useState({});
  
  // 🛡️ PROTECTION ANTI-RE-RENDER
  const hasInitialized = useRef(false);
  const lastGemData = useRef(null);

  // 🔧 DEEP COMPARISON HELPER
  const deepEqual = (obj1, obj2) => {
    if (obj1 === obj2) return true;
    if (!obj1 || !obj2) return false;
    
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    for (let key of keys1) {
      if (!keys2.includes(key)) return false;
      
      if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
        if (!deepEqual(obj1[key], obj2[key])) return false;
      } else if (obj1[key] !== obj2[key]) {
        return false;
      }
    }
    
    return true;
  };

  // 🔥 USEEFFECT OPTIMISÉ
  useEffect(() => {
    if (!hasInitialized.current || !deepEqual(gemData, lastGemData.current)) {
      if (gemData && Object.keys(gemData).length > 0) {
        
        // 🛡️ Merge intelligent avec protection
        const safeGemValues = {};
        Object.keys(gemTypes).forEach(category => {
          safeGemValues[category] = {};
          Object.keys(gemTypes[category]).forEach(stat => {
            safeGemValues[category][stat] = gemData[category]?.[stat] || 0;
          });
        });
        
        setGemValues(safeGemValues);
      } else {
        
        // 🔧 Initialisation propre avec valeurs par défaut
        const defaultGemValues = {};
        Object.keys(gemTypes).forEach(category => {
          defaultGemValues[category] = {};
          Object.keys(gemTypes[category]).forEach(stat => {
            defaultGemValues[category][stat] = 0;
          });
        });
        
        setGemValues(defaultGemValues);
      }
      
      hasInitialized.current = true;
      lastGemData.current = gemData;
    }
  }, [gemData]);

  // 🔥 VALIDATION ET NETTOYAGE (logique intelligente selon le type de stat)
  const validateAndCleanInput = (input, statName) => {
    const isPercentage = statName && statName.includes('%');
    
    // Autoriser seulement chiffres, point et virgule
    let cleaned = input.replace(/[^0-9.,]/g, '');
    
    // Remplacer virgule par point
    cleaned = cleaned.replace(/,/g, '.');
    
    // Pour les non-pourcentages, supprimer les points (entiers seulement)
    if (!isPercentage) {
      cleaned = cleaned.replace(/\./g, '');
    }
    
    // Pour les pourcentages, gérer les décimales
    if (isPercentage && cleaned.includes('.')) {
      const parts = cleaned.split('.');
      if (parts.length > 2) {
        cleaned = parts[0] + '.' + parts[1];
      }
      // Limiter à 2 décimales
      if (parts[1] && parts[1].length > 2) {
        cleaned = parts[0] + '.' + parts[1].slice(0, 2);
      }
    }
    
    return cleaned;
  };

  // 🔥 FORMATER LA VALEUR SELON LE TYPE
  const formatValue = (value, statName) => {
    const isPercentage = statName && statName.includes('%');
    
    if (isPercentage) {
      return Number(value).toFixed(2);
    } else {
      return Math.round(Number(value)).toString();
    }
  };

  // 🔥 OBTENIR LA VALEUR D'AFFICHAGE
  const getDisplayValue = (category, stat) => {
    const key = `${category}_${stat}`;
    const gemValue = gemValues[category]?.[stat] || 0;
    
    // Si l'input est focus et qu'on a un état local, on l'utilise
    if (isFocused[key] && inputStates[key] !== undefined) {
      return inputStates[key];
    }
    
    // Sinon on affiche la valeur formatée selon le type
    return formatValue(gemValue, stat);
  };

  // 🔥 GESTION DU FOCUS
  const handleInputFocus = (category, stat) => {
    const key = `${category}_${stat}`;
    setIsFocused(prev => ({ ...prev, [key]: true }));
    
    const currentValue = gemValues[category]?.[stat] || 0;
    
    // Si la valeur est 0, on vide l'input
    if (currentValue === 0) {
      setInputStates(prev => ({ ...prev, [key]: '' }));
    } else {
      // Sinon on garde la valeur actuelle formatée selon le type
      setInputStates(prev => ({ 
        ...prev, 
        [key]: formatValue(currentValue, stat)
      }));
    }
  };

  // 🔥 GESTION DE LA PERTE DE FOCUS
  const handleInputBlur = (category, stat) => {
    const key = `${category}_${stat}`;
    setIsFocused(prev => ({ ...prev, [key]: false }));
    
    const inputValue = inputStates[key];
    
    if (inputValue === '' || inputValue === undefined) {
      // Si l'input est vide, on met 0
      handleChange(category, stat, 0);
    } else {
      // Sinon on parse et applique la valeur
      const parsed = parseFloat(inputValue);
      if (!isNaN(parsed)) {
        handleChange(category, stat, parsed);
      }
    }
    
    // Reset de l'état local pour cet input
    setInputStates(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  };

  // 🔥 GESTION DU CHANGEMENT DE VALEUR
  const handleInputChange = (category, stat, rawValue) => {
    const key = `${category}_${stat}`;
    const cleanedValue = validateAndCleanInput(rawValue, stat);
    
    // Mise à jour de l'état local uniquement
    setInputStates(prev => ({ ...prev, [key]: cleanedValue }));
  };

  // 🔧 FONCTION CHANGE OPTIMISÉE
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
    onSave(gemValues);
    onClose();
  };

  const getColor = (type) => ({
    Red: 'text-red-400 border-red-500/30',
    Blue: 'text-blue-400 border-blue-500/30',
    Green: 'text-green-400 border-green-500/30',
    Purple: 'text-purple-400 border-purple-500/30',
    Yellow: 'text-yellow-400 border-yellow-500/30'
  }[type] || 'text-white border-gray-500/30');

  const getColorText = (type) => ({
    Red: 'text-red-400',
    Blue: 'text-blue-400',
    Green: 'text-green-400',
    Purple: 'text-purple-400',
    Yellow: 'text-yellow-400'
  }[type] || 'text-white');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center overflow-y-auto p-2">
      <div className="bg-[#1c1c2c] p-4 sm:p-6 rounded-xl w-full max-w-5xl text-white max-h-[90vh] overflow-y-auto border border-purple-500/30 shadow-2xl">
        <h2 className="text-center text-xl font-bold mb-6 text-purple-300">{t('gems.popup.title')}</h2>

        {(isMobile?.isPhone || isMobile?.isTablet) && !isMobile?.isDesktop ? (
          // 📱 VERSION MOBILE
          <div className="flex flex-col gap-4">
            {Object.entries(gemTypes).map(([category, stats]) => (
              <div key={category} className={`border rounded-lg p-3 bg-[#2a2a3d] ${getColor(category)}`}>
                <div className={`font-semibold mb-3 ${getColorText(category)} text-center`}>
                  {t('gems.popup.gemType', { type: t(`gems.colors.${category}`) })}
                </div>
                <div className="flex flex-col gap-3">
                  {Object.keys(stats).map((stat) => (
                    <div key={stat} className="flex justify-between items-center text-sm">
                      <label className="text-gray-300 font-medium">{stat}</label>
                      <input
                        type="text"
                        className="w-24 text-right px-3 py-2 rounded-lg bg-[#1a1a2f] text-white border border-gray-600 focus:border-purple-400 focus:outline-none transition-colors"
                        value={getDisplayValue(category, stat)}
                        onChange={(e) => handleInputChange(category, stat, e.target.value)}
                        onFocus={() => handleInputFocus(category, stat)}
                        onBlur={() => handleInputBlur(category, stat)}
                        placeholder={stat.includes('%') ? '0.00' : '0'}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 🖥️ VERSION DESKTOP
          <div className="grid grid-cols-3 gap-6 auto-rows-auto">
            {Object.entries(gemTypes).map(([category, stats]) => (
              <div
                key={category}
                className={`border rounded-lg p-4 bg-[#2a2a3d] ${getColor(category)} hover:bg-[#323248] transition-colors ${
                  category === 'Purple' || category === 'Yellow' ? 'col-span-3 sm:col-span-1' : ''
                }`}
              >
                <div className={`font-bold mb-4 text-center ${getColorText(category)} text-lg`}>
                  💎 {category} Gem
                </div>
                <div className="flex flex-col gap-3">
                  {Object.keys(stats).map((stat) => (
                    <div key={stat} className="flex justify-between items-center text-sm">
                      <label className="text-gray-300 font-medium flex-1">{stat}</label>
                      <input
                        type="text"
                        className="w-20 text-right px-3 py-2 rounded-lg bg-[#1a1a2f] text-white border border-gray-600 focus:border-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-400/30 transition-all hover:border-gray-500"
                        value={getDisplayValue(category, stat)}
                        onChange={(e) => handleInputChange(category, stat, e.target.value)}
                        onFocus={() => handleInputFocus(category, stat)}
                        onBlur={() => handleInputBlur(category, stat)}
                        placeholder={stat.includes('%') ? '0.00' : '0'}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-8 gap-4">
          <button 
            onClick={onClose} 
            className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 rounded-lg transition-all border border-gray-500 font-medium"
          >
            {t('gems.popup.cancel')}
          </button>
          <button 
            onClick={handleSave} 
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 rounded-lg transition-all border border-green-400 font-medium"
          >
            {t('gems.popup.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GemmePopup;