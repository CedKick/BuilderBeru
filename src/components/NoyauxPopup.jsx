import React, { useState, useEffect, useRef } from 'react';
import { CORE_OPTIONS } from '../utils/coreOptions';

const NoyauxPopup = ({ hunterName, onClose, onSave, existingCores = {}, isMobile }) => {
  const initialState = {
    Offensif: { primary: '', primaryValue: '', secondary: '', secondaryValue: '' },
    Défensif: { primary: '', primaryValue: '', secondary: '', secondaryValue: '' },
    Endurance: { primary: '', primaryValue: '', secondary: '', secondaryValue: '' },
  };

  const [coreData, setCoreData] = useState(initialState);
  
  // 🔥 KAISEL FIX : Tracking pour éviter les re-renders inutiles
  const hasInitialized = useRef(false);
  const lastExistingCores = useRef(null);

  // 🛡️ FONCTION HELPER POUR COMPARER DEEP LES OBJETS
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

  // 🔥 USEEFFECT OPTIMISÉ - Plus de re-render de l'enfer !
  useEffect(() => {
    // Ne s'initialise qu'une seule fois OU si existingCores change vraiment
    if (!hasInitialized.current || !deepEqual(existingCores, lastExistingCores.current)) {
      const merged = {
        ...initialState,
        ...(existingCores || {}),
      };
      
      // 🛡️ Protection contre les objets incomplets
      Object.keys(merged).forEach(type => {
        if (!merged[type] || typeof merged[type] !== 'object') {
          merged[type] = initialState[type];
        } else {
          // Assurer que tous les champs existent
          merged[type] = {
            primary: merged[type].primary || '',
            primaryValue: merged[type].primaryValue || '',
            secondary: merged[type].secondary || '',
            secondaryValue: merged[type].secondaryValue || '',
          };
        }
      });
      
      setCoreData(merged);
      hasInitialized.current = true;
      lastExistingCores.current = existingCores;
    }
  }, [existingCores]);

  // 🔧 HANDLERS OPTIMISÉS
  const handleChange = (type, field, value) => {
    setCoreData(prev => {
      // 🛡️ Protection contre les états corrompus
      if (!prev[type]) {
        prev[type] = initialState[type];
      }
      
      return {
        ...prev,
        [type]: {
          ...prev[type],
          [field]: value,
        },
      };
    });
  };

  const handlePrimaryChange = (type, value) => {
    const defaultValue = CORE_OPTIONS[type]?.defaultValues?.[value] || '';
    
    setCoreData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        primary: value,
        primaryValue: defaultValue,
      },
    }));
  };

  const handleSecondaryChange = (type, value) => {
    const defaultValue = CORE_OPTIONS[type]?.defaultValues?.[value] || '';
    
    setCoreData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        secondary: value,
        secondaryValue: defaultValue,
      },
    }));
  };

  const handleSave = () => {
    const cleanedCoreData = {};

    ['Offensif', 'Défensif', 'Endurance'].forEach(type => {
      const core = coreData[type] || initialState[type];
      cleanedCoreData[type] = {
        primary: core.primary || '',
        secondary: core.secondary || '',
        primaryValue: parseFloat(core.primaryValue) || 0,
        secondaryValue: parseFloat(core.secondaryValue) || 0,
      };
    });

    onSave(hunterName, cleanedCoreData);
    onClose();
  };

  // 🎨 RENDER BLOCK OPTIMISÉ
  const renderTypeBlock = (type) => {
    const safeData = coreData[type] || initialState[type];

    // 🛡️ Double protection contre les données corrompues
    const primary = safeData.primary || '';
    const primaryValue = safeData.primaryValue || '';
    const secondary = safeData.secondary || '';
    const secondaryValue = safeData.secondaryValue || '';

    return (
      <div key={type} className="mb-4 border-b border-gray-500 pb-3">
        <h3 className="text-lg font-semibold mb-2 text-purple-300">{type}</h3>
        <div className="flex gap-4">
          <div className="flex flex-col flex-1">
            <label className="text-sm text-gray-300 mb-1">Primary Stat</label>
            <select
              className="bg-black p-2 rounded text-sm border border-gray-600 focus:border-purple-400 transition-colors"
              value={primary}
              onChange={e => handlePrimaryChange(type, e.target.value)}
            >
              <option value="">Select Primary</option>
              {CORE_OPTIONS[type]?.primary?.map(stat => (
                <option key={stat} value={stat}>{stat}</option>
              )) || []}
            </select>
            <input
              type="number"
              step="0.01"
              className="bg-[#222] p-2 rounded mt-2 border border-gray-600 focus:border-purple-400 transition-colors"
              value={primaryValue}
              onChange={e => handleChange(type, 'primaryValue', e.target.value)}
              placeholder="Value"
            />
          </div>

          <div className="flex flex-col flex-1">
            <label className="text-sm text-gray-300 mb-1">Secondary Stat</label>
            <select
              className="bg-black p-2 rounded text-sm border border-gray-600 focus:border-purple-400 transition-colors"
              value={secondary}
              onChange={e => handleSecondaryChange(type, e.target.value)}
            >
              <option value="">Select Secondary</option>
              {CORE_OPTIONS[type]?.secondary?.map(stat => (
                <option key={stat} value={stat}>{stat}</option>
              )) || []}
            </select>
            <input
              type="number"
              step="0.01"
              className="bg-[#222] p-2 rounded mt-2 border border-gray-600 focus:border-purple-400 transition-colors"
              value={secondaryValue}
              onChange={e => handleChange(type, 'secondaryValue', e.target.value)}
              placeholder="Value"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center overflow-y-auto p-2">
      {(isMobile?.isPhone || isMobile?.isTablet) && !isMobile?.isDesktop ? (
        <div className="bg-[#1a1a2f] p-4 rounded-lg shadow-xl w-[95%] text-white max-h-[90%] overflow-y-auto border border-purple-500/30">
          <h2 className="text-lg font-bold mb-3 text-center text-purple-300">⚙️ Noyaux Configuration</h2>
          <div className="space-y-3">
            {['Offensif', 'Défensif', 'Endurance'].map(renderTypeBlock)}
          </div>
          <div className="flex justify-center mt-4 gap-3">
            <button 
              onClick={onClose} 
              className="text-xs px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors border border-gray-500"
            >
              ❌ Annuler
            </button>
            <button 
              onClick={handleSave} 
              className="text-xs px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg hover:from-purple-500 hover:to-purple-600 transition-all border border-purple-400"
            >
              💾 Sauvegarder
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#1a1a2f] p-6 rounded-lg shadow-xl w-[650px] text-white border border-purple-500/30">
          <h2 className="text-xl font-bold mb-4 text-center text-purple-300">⚙️ Configuration des Noyaux</h2>
          <div className="space-y-4">
            {['Offensif', 'Défensif', 'Endurance'].map(renderTypeBlock)}
          </div>
          <div className="flex justify-end mt-6 gap-4">
            <button 
              onClick={onClose} 
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-2 text-sm rounded-lg hover:scale-105 transition-transform border border-gray-500"
            >
              ❌ Cancel
            </button>
            <button 
              onClick={handleSave} 
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 text-sm rounded-lg hover:scale-105 transition-transform border border-purple-400"
            >
              💾 Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoyauxPopup;