// components/ArtifactSavePopup.jsx
import React, { useState } from "react";
import { getSetIcon } from "../utils/artifactUtils";

const ArtifactSavePopup = ({ 
  artifactData, 
  slot, 
  onSave, 
  onClose,
  hunter 
}) => {
  // 🔥 DÉTECTION SI C'EST UNE MODIFICATION
  const isModifying = artifactData.savedArtifactId && artifactData.savedArtifactName;
  const [artifactName, setArtifactName] = useState(
    isModifying ? artifactData.savedArtifactName : ""
  );
  
  const handleSave = () => {
    if (!artifactName.trim()) {
      alert("Veuillez entrer un nom pour cet artefact !");
      return;
    }
    
    const saveData = {
      id: isModifying ? artifactData.savedArtifactId : `${slot.toLowerCase()}_${Date.now()}`, // 🔥 GARDE L'ID EXISTANT
      name: artifactName.trim(),
      mainStat: artifactData.mainStat,
      subStats: artifactData.subStats,
      subStatsLevels: artifactData.subStatsLevels,
      set: artifactData.set,
      slot: slot,
      hunter: hunter,
      dateCreated: isModifying ? 
        (artifactData.dateCreated || new Date().toISOString()) : 
        new Date().toISOString(), // 🔥 GARDE LA DATE ORIGINALE
      mainStatValue: artifactData.mainStatValue || 0,
      isModifying: isModifying // 🔥 FLAG POUR LE PARENT
    };
    
    onSave(saveData);
    onClose();
  };

  // Fonction pour abréger les stats
  const getStatAbbrev = (stat, value) => {
    const abbrevs = {
      'Attack %': 'ATK%',
      'Defense %': 'DEF%',
      'HP %': 'HP%',
      'Additional Attack': 'ATK+',
      'Additional Defense': 'DEF+',
      'Additional HP': 'HP+',
      'Critical Hit Rate': 'CritR',
      'Critical Hit Damage': 'CritD',
      'Defense Penetration': 'DefPen',
      'Damage Increase': 'DMG+',
      'MP Consumption Reduction': 'MP-',
      'Additional MP': 'MP+',
      'MP Recovery Rate Increase (%)': 'MPRec%',
      'Damage Reduction': 'DMGRed'
    };
    
    const shortStat = abbrevs[stat] || stat.slice(0, 6);
    const shortValue = stat.includes('%') ? value.toFixed(1) : Math.floor(value);
    return `${shortStat} ${shortValue}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1a1a2e] text-white p-6 rounded-xl shadow-lg border border-purple-700 w-96">
        
        {/* Header modifié */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">
            {isModifying ? "🔄 Modifier Artifact" : "💾 Save Artifact"}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✖
          </button>
        </div>

        {/* Message informatif si modification */}
        {isModifying && (
          <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded">
            <div className="text-yellow-300 text-sm">
              ⚠️ Vous modifiez un artefact existant
            </div>
            <div className="text-yellow-200 text-xs mt-1">
              Les changements remplaceront la version sauvée
            </div>
          </div>
        )}

        {/* Input nom - modifié */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Artifact Name:
            {isModifying && <span className="text-gray-400 ml-2">(non-modifiable)</span>}
          </label>
          <input
            type="text"
            value={artifactName}
            onChange={(e) => !isModifying && setArtifactName(e.target.value)} // 🔥 BLOQUE SI MODIFICATION
            placeholder={isModifying ? "Nom existant" : "e.g. Tank HP Build"}
            className={`w-full p-2 rounded border border-gray-600 focus:border-purple-500 ${
              isModifying 
                ? 'bg-gray-700 text-gray-300 cursor-not-allowed' // 🔥 STYLE DÉSACTIVÉ
                : 'bg-[#2d2d5c] text-white'
            }`}
            readOnly={isModifying} // 🔥 LECTURE SEULE SI MODIFICATION
            autoFocus={!isModifying}
          />
        </div>

        {/* Preview */}
        <div className="mb-6 p-3 bg-[#0b0b1f] rounded border">
          <div className="text-sm font-medium mb-2">Preview:</div>
          
          {/* Set Name + Icon en haut */}
          {artifactData.set && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-[#1a1a2e] rounded">
              <img 
                src={getSetIcon(artifactData.set, slot) || "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750333738/set_a6k4yh.png"}
                className="w-6 h-6"
                alt={artifactData.set}
              />
              <span className="text-purple-300 text-sm font-medium">
                {artifactData.set}
              </span>
            </div>
          )}
          
          {/* Slot + Main Stat */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-300">🛡️</span>
            <span className="text-blue-300 font-medium">
              {getStatAbbrev(artifactData.mainStat, artifactData.mainStatValue || 0)}
            </span>
          </div>

          {/* Sub Stats */}
          <div className="grid grid-cols-2 gap-1 text-xs">
            {artifactData.subStats
              .filter((stat, i) => stat && artifactData.subStatsLevels[i]?.value > 0)
              .map((stat, i) => {
                const realIndex = artifactData.subStats.findIndex(s => s === stat);
                const value = artifactData.subStatsLevels[realIndex]?.value || 0;
                return (
                  <span key={i} className="text-gray-300">
                    {getStatAbbrev(stat, value)}
                  </span>
                );
              })}
          </div>
        </div>

        {/* Buttons - texte modifié */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`flex-1 py-2 px-4 rounded transition text-white ${
              isModifying 
                ? 'bg-orange-600 hover:bg-orange-500' // 🔥 COULEUR DIFFÉRENTE
                : 'bg-green-600 hover:bg-green-500'
            }`}
          >
            {isModifying ? "Modifier" : "Save"} {/* 🔥 TEXTE ADAPTÉ */}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArtifactSavePopup;