import React, { useState } from 'react';


const commonSubStats = [
  'Attack %',
  'Additional Attack',
  'Critical Hit Rate',
  'Damage Increase',
  'Defense Penetration',
  'Additional Defense',
  'Defense %',
  'Additional HP',
  'HP %',
  'MP Consumption Reduction',
  'Additional MP',
  'MP Recovery Rate Increase (%)',
  'Damage Reduction',
];

const mainStatsOptions = {
  helmet: [
    'Additional Defense',
    'Defense %',
    'Additional Attack',
    'Attack %',
    'Additional HP',
    'HP %',
  ],
  chest: [
    'Additional Defense',
    'Defense %',
  ],
  gloves: [
    'Additional Attack',
    'Attack %',
  ],
  boots: [
    'Defense %',
    'HP %',
    'Critical Hit Rate',
    'Defense Penetration',
    'Healing Given Increase (%)',
  ],
};

const Builder = () => {
  const [equipments, setEquipments] = useState({
    helmet: { mainStat: '', subStats: ['', '', '', ''] },
    chest: { mainStat: '', subStats: ['', '', '', ''] },
    gloves: { mainStat: '', subStats: ['', '', '', ''] },
    boots: { mainStat: '', subStats: ['', '', '', ''] },
  });

  const handleMainStatChange = (type, value) => {
    setEquipments(prev => ({
      ...prev,
      [type]: { ...prev[type], mainStat: value },
    }));
  };

  const handleSubStatChange = (type, idx, value) => {
    setEquipments(prev => {
      const newSubStats = [...prev[type].subStats];
      newSubStats[idx] = value;
      return { ...prev, [type]: { ...prev[type], subStats: newSubStats } };
    });
  };

  const renderEquipmentBlock = (type, label) => (
    <div key={type} className="p-4 border rounded shadow-md bg-gradient-to-br from-purple-800 via-purple-900 to-black text-white">
      <h3 className="text-lg font-semibold mb-2 text-center">{label}</h3>

      {/* Main Stat */}
      <select
        className="w-full p-2 mb-3 border rounded text-black"
        value={equipments[type].mainStat}
        onChange={(e) => handleMainStatChange(type, e.target.value)}
      >
        <option value="">Select Main Stat</option>
        {mainStatsOptions[type].map((stat, idx) => (
          <option key={idx} value={stat}>
            {stat}
          </option>
        ))}
      </select>

      {/* Substats */}
      {equipments[type].subStats.map((subStat, idx) => (
        <select
          key={idx}
          className="w-full p-2 mb-2 border rounded text-black"
          value={subStat}
          onChange={(e) => handleSubStatChange(type, idx, e.target.value)}
        >
          <option value="">Substat {idx + 1}</option>
          {commonSubStats.map((stat, sidx) => (
            <option key={sidx} value={stat}>
              {stat}
            </option>
          ))}
        </select>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-3xl font-bold text-center text-white mb-8">Builder Beru - Solo Leveling Arise</h1>

      <div className="grid grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
          {renderEquipmentBlock('helmet', 'Helmet')}
          {renderEquipmentBlock('chest', 'Chest')}
          {renderEquipmentBlock('gloves', 'Gloves')}
          {renderEquipmentBlock('boots', 'Boots')}
        </div>
        <div className="flex flex-col justify-center items-center text-white">
          {/* Future section pour Stats et Image */}
          <div className="bg-purple-800 p-4 rounded w-64 mb-4">[Future Image Ici]</div>
          <div className="text-left">
            <p>Attack: 0</p>
            <p>Defense: 0</p>
            <p>HP: 0</p>
            <p>Critical Rate: 0%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder;