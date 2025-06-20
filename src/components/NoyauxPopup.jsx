import React, { useState, useEffect } from 'react';
import { CORE_OPTIONS } from '../utils/coreOptions';

const NoyauxPopup = ({ hunterName, onClose, onSave, existingCores = {}, isMobile }) => {
  const initialState = {
    Offensif: { primary: '', primaryValue: '', secondary: '', secondaryValue: '' },
    Défensif: { primary: '', primaryValue: '', secondary: '', secondaryValue: '' },
    Endurance: { primary: '', primaryValue: '', secondary: '', secondaryValue: '' },
  };

  const [coreData, setCoreData] = useState(initialState);

  useEffect(() => {
    const merged = {
      ...initialState,
      ...(existingCores || {}),
    };
    setCoreData(merged);
  }, [existingCores]);

  const handleChange = (type, field, value) => {
    setCoreData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const handlePrimaryChange = (type, value) => {
    const defaultValue = CORE_OPTIONS[type].defaultValues[value] || '';
    handleChange(type, 'primary', value);
    handleChange(type, 'primaryValue', defaultValue);
  };

  const handleSecondaryChange = (type, value) => {
    const defaultValue = CORE_OPTIONS[type].defaultValues[value] || '';
    handleChange(type, 'secondary', value);
    handleChange(type, 'secondaryValue', defaultValue);
  };

  const handleSave = () => {
    const cleanedCoreData = {};

    ['Offensif', 'Défensif', 'Endurance'].forEach(type => {
      const core = coreData[type];
      cleanedCoreData[type] = {
        primary: core.primary,
        secondary: core.secondary,
        primaryValue: parseFloat(core.primaryValue) || 0,
        secondaryValue: parseFloat(core.secondaryValue) || 0,
      };
    });

    onSave(hunterName, cleanedCoreData);
    onClose();
  };

  const renderTypeBlock = (type) => {
    const safeData = coreData[type] || {
      primary: '',
      primaryValue: '',
      secondary: '',
      secondaryValue: ''
    };

    return (
      <div key={type} className="mb-4 border-b border-gray-500 pb-3">
        <h3 className="text-lg font-semibold mb-2 text-purple-300">{type}</h3>
        <div className="flex gap-4">
          <div className="flex flex-col flex-1">
            <label>Primary Stat</label>
            <select
              className="bg-black p-1 rounded text-sm"
              value={safeData.primary}
              onChange={e => handlePrimaryChange(type, e.target.value)}
            >
              <option value="">Select</option>
              {CORE_OPTIONS[type].primary.map(stat => (
                <option key={stat} value={stat}>{stat}</option>
              ))}
            </select>
            <input
              type="number"
              className="bg-[#222] p-1 rounded mt-1"
              value={safeData.primaryValue}
              onChange={e => handleChange(type, 'primaryValue', e.target.value)}
            />
          </div>

          <div className="flex flex-col flex-1">
            <label>Secondary Stat</label>
            <select
              className="bg-black p-1 rounded text-sm"
              value={safeData.secondary}
              onChange={e => handleSecondaryChange(type, e.target.value)}
            >
              <option value="">Select</option>
              {CORE_OPTIONS[type].secondary.map(stat => (
                <option key={stat} value={stat}>{stat}</option>
              ))}
            </select>
            <input
              type="number"
              className="bg-[#222] p-1 rounded mt-1"
              value={safeData.secondaryValue}
              onChange={e => handleChange(type, 'secondaryValue', e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center overflow-y-auto p-2">
      {(isMobile?.isPhone || isMobile?.isTablet) && !isMobile?.isDesktop ? (
        <div className="bg-[#1a1a2f] p-4 rounded-lg shadow-md w-[95%] text-white max-h-[90%] overflow-y-auto">
          <h2 className="text-lg font-bold mb-3 text-center">Noyaux (Mobile)</h2>
          {['Offensif', 'Défensif', 'Endurance'].map(renderTypeBlock)}
          <div className="flex justify-center mt-4 gap-3">
            <button onClick={onClose} className="text-xs px-3 py-1 bg-gray-700 rounded hover:bg-gray-600">Annuler</button>
            <button onClick={handleSave} className="text-xs px-3 py-1 bg-purple-600 rounded hover:bg-purple-500">Sauvegarder</button>
          </div>
        </div>
      ) : (
        <div className="bg-[#1a1a2f] p-6 rounded-lg shadow-md w-[600px] text-white">
          <h2 className="text-xl font-bold mb-4 text-center">Configure Noyaux</h2>
          {['Offensif', 'Défensif', 'Endurance'].map(renderTypeBlock)}
          <div className="flex justify-end mt-6 gap-4">
            <button onClick={onClose} className="bg-gradient-to-r from-[#3b3b9c] to-[#6c63ff] text-white px-4 py-2 text-sm rounded-lg hover:scale-105">Cancel</button>
            <button onClick={handleSave} className="bg-gradient-to-r from-[#3b3b9c] to-[#6c63ff] text-white px-4 py-2 text-sm rounded-lg hover:scale-105">Save</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoyauxPopup;
