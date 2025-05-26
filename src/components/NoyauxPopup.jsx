import React, { useState, useEffect } from 'react';
import { CORE_OPTIONS } from '../utils/coreOptions'; // Ton fichier avec la constante que je t’ai générée

const NoyauxPopup = ({ hunterName, onClose, onSave, existingCores = {} }) => {
  const initialState = {
    Offensif: { primary: '', primaryValue: '', secondary: '', secondaryValue: '' },
    Défensif: { primary: '', primaryValue: '', secondary: '', secondaryValue: '' },
    Endurance: { primary: '', primaryValue: '', secondary: '', secondaryValue: '' },
  };

  const [coreData, setCoreData] = useState(initialState);

  useEffect(() => {
    if (existingCores && Object.keys(existingCores).length) {
      setCoreData(existingCores);
    }
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
      secondaryValue: parseFloat(core.secondaryValue) || 0
    };
  });

  onSave(hunterName, cleanedCoreData);
  onClose();
};

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-[#1a1a2f] p-6 rounded-lg shadow-md w-[600px] text-white">
        <h2 className="text-xl font-bold mb-4 text-center">Configure Noyaux</h2>

        {['Offensif', 'Défensif', 'Endurance'].map(type => (
          <div key={type} className="mb-4 border-b border-gray-500 pb-3">
            <h3 className="text-lg font-semibold mb-2 text-purple-300">{type}</h3>
            <div className="flex gap-4">
              <div className="flex flex-col flex-1">
                <label>Primary Stat</label>
                <select
                  className="bg-black p-1 rounded text-sm"
                  value={coreData[type].primary}
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
                  value={coreData[type].primaryValue}
                  onChange={e => handleChange(type, 'primaryValue', e.target.value)}
                />
              </div>

              <div className="flex flex-col flex-1">
                <label>Secondary Stat</label>
                <select
                  className="bg-black p-1 rounded text-sm"
                  value={coreData[type].secondary}
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
                  value={coreData[type].secondaryValue}
                  onChange={e => handleChange(type, 'secondaryValue', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-end mt-6 gap-4">
          <button onClick={onClose} className="px-4 py-1 bg-gray-600 hover:bg-gray-500 rounded">Cancel</button>
          <button onClick={handleSave} className="px-4 py-1 bg-purple-600 hover:bg-purple-500 rounded">Save</button>
        </div>
      </div>
    </div>
  );
};

export default NoyauxPopup;