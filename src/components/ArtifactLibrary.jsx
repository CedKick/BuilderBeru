// components/ArtifactLibrary.jsx
import React, { useState, useMemo } from "react";
import { getSetIcon } from "../utils/artifactUtils";
import { useTranslation } from 'react-i18next';

const ArtifactLibrary = ({ 
  slot,           // "Helmet", "Chest", etc.
  onSelect,       // Callback quand on sélectionne un artefact
  onClose,
  artifactLibrary, // Données du localStorage
  activeAccount   // Pour debug
}) => {
  const { t } = useTranslation();
  
  // 📊 États des filtres
  const [selectedSet, setSelectedSet] = useState('');
  const [selectedMainStat, setSelectedMainStat] = useState('');
  const [selectedSubStats, setSelectedSubStats] = useState([]);
  const [hoveredArtifact, setHoveredArtifact] = useState(null);
  const [sortBy, setSortBy] = useState('date'); // 'date', 'name', 'hunter'

  // 🎯 Stats possibles par slot
  const slotMainStats = {
    'Helmet': ['Additional Defense', 'Defense %', 'Additional Attack', 'Attack %', 'Additional HP', 'HP %'],
    'Chest': ['Additional Defense', 'Defense %'],
    'Gloves': ['Additional Attack', 'Attack %'],
    'Boots': ['Defense %', 'HP %', 'Critical Hit Damage', 'Defense Penetration', 'Healing Given Increase (%)'],
    'Necklace': ['Additional HP', 'HP %'],
    'Bracelet': ['Fire Damage %', 'Water Damage %', 'Wind Damage %', 'Light Damage %', 'Dark Damage %'],
    'Ring': ['Additional Attack', 'Additional Defense', 'Attack %', 'Defense %', 'Additional HP', 'HP %'],
    'Earrings': ['Additional MP']
  };

  const commonSubStats = [
    'Attack %', 'Additional Attack', 'Defense Penetration', 'Damage Increase', 'Additional Defense',
    'Defense %', 'Additional HP', 'HP %', 'MP Consumption Reduction',
    'Additional MP', 'MP Recovery Rate Increase (%)', 'Damage Reduction', 'Critical Hit Damage', 'Critical Hit Rate'
  ];

  // 🔍 Récupération des artefacts pour ce slot
  const slotArtifacts = useMemo(() => {
    const artifacts = artifactLibrary?.[slot] || {};
    return Object.values(artifacts);
  }, [artifactLibrary, slot]);

  // 🗂️ Extraction des sets uniques
  const availableSets = useMemo(() => {
    const sets = [...new Set(slotArtifacts.map(art => art.set).filter(Boolean))];
    return sets.sort();
  }, [slotArtifacts]);

  // 🔽 Artefacts filtrés et triés
  const filteredArtifacts = useMemo(() => {
    let filtered = slotArtifacts.filter(artifact => {
      // Filtre par set
      if (selectedSet && artifact.set !== selectedSet) return false;
      
      // Filtre par mainStat
      if (selectedMainStat && artifact.mainStat !== selectedMainStat) return false;
      
      // Filtre par subStats (l'artefact doit avoir TOUS les substats sélectionnés)
      if (selectedSubStats.length > 0) {
        const hasAllSubStats = selectedSubStats.every(subStat => 
          artifact.subStats && artifact.subStats.includes(subStat)
        );
        if (!hasAllSubStats) return false;
      }
      
      return true;
    });

    // Tri
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'date':
          return new Date(b.dateCreated) - new Date(a.dateCreated); // Plus récent en premier
        case 'name':
          return a.name.localeCompare(b.name);
        case 'hunter':
          return a.hunter.localeCompare(b.hunter);
        default:
          return 0;
      }
    });

    return filtered;
  }, [slotArtifacts, selectedSet, selectedMainStat, selectedSubStats, sortBy]);

  // 🎨 Fonction pour abréger les stats (sans valeurs)
  const getStatIcon = (stat) => {
    const icons = {
      'Attack %': '⚔️',
      'Additional Attack': '⚔️+',
      'Defense %': '🛡️',
      'Additional Defense': '🛡️+',
      'HP %': '❤️',
      'Additional HP': '❤️+',
      'Critical Hit Rate': '💥',
      'Critical Hit Damage': '💥+',
      'Defense Penetration': '🗡️',
      'Damage Increase': '📈',
      'MP Consumption Reduction': '💙-',
      'Additional MP': '💙+',
      'MP Recovery Rate Increase (%)': '💙🔄',
      'Damage Reduction': '📉',
      'Healing Given Increase (%)': '💚',
      'Fire Damage %': '🔥',
      'Water Damage %': '💧',
      'Wind Damage %': '💨',
      'Light Damage %': '✨',
      'Dark Damage %': '🌑'
    };
    return icons[stat] || '📊';
  };

  // 🎯 Gestion sélection subStats multiples
  const toggleSubStat = (subStat) => {
    setSelectedSubStats(prev => 
      prev.includes(subStat) 
        ? prev.filter(s => s !== subStat)
        : [...prev, subStat]
    );
  };

  // 📱 Détection mobile
  const isMobile = window.innerWidth < 768;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] text-white rounded-xl shadow-lg border border-purple-700 w-full max-w-4xl h-[80vh] flex flex-col">
        
        {/* 📋 Header */}
        <div className="flex justify-between items-center p-4 border-b border-purple-700">
          <h3 className="text-lg font-bold">
            📦 {t(`titleArtifact.${slot}`)} Library ({filteredArtifacts.length})
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✖
          </button>
        </div>

        {/* 🔍 Filtres */}
        <div className="p-4 border-b border-gray-700 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Filtre Set */}
            <div>
              <label className="block text-sm font-medium mb-1">Set:</label>
              <select
                value={selectedSet}
                onChange={(e) => setSelectedSet(e.target.value)}
                className="w-full p-2 rounded bg-[#2d2d5c] text-white border border-gray-600 text-sm"
              >
                <option value="">Tous les sets</option>
                {availableSets.map(set => (
                  <option key={set} value={set}>{set}</option>
                ))}
              </select>
            </div>

            {/* Filtre MainStat */}
            <div>
              <label className="block text-sm font-medium mb-1">Main Stat:</label>
              <select
                value={selectedMainStat}
                onChange={(e) => setSelectedMainStat(e.target.value)}
                className="w-full p-2 rounded bg-[#2d2d5c] text-white border border-gray-600 text-sm"
              >
                <option value="">Toutes les main stats</option>
                {slotMainStats[slot]?.map(stat => (
                  <option key={stat} value={stat}>{getStatIcon(stat)} {stat}</option>
                ))}
              </select>
            </div>

            {/* Tri */}
            <div>
              <label className="block text-sm font-medium mb-1">Tri:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 rounded bg-[#2d2d5c] text-white border border-gray-600 text-sm"
              >
                <option value="date">Plus récent</option>
                <option value="name">Nom A-Z</option>
                <option value="hunter">Hunter A-Z</option>
              </select>
            </div>
          </div>

          {/* Filtre SubStats - Checkboxes */}
          <div>
            <label className="block text-sm font-medium mb-2">SubStats (cocher pour filtrer):</label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {commonSubStats.slice(0, 12).map(subStat => (
                <label key={subStat} className="flex items-center space-x-1 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSubStats.includes(subStat)}
                    onChange={() => toggleSubStat(subStat)}
                    className="w-3 h-3"
                  />
                  <span className="truncate" title={subStat}>
                    {getStatIcon(subStat)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 📜 Liste des artefacts */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredArtifacts.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              📭 Aucun artefact trouvé avec ces filtres
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredArtifacts.map(artifact => (
                <div
                  key={artifact.id}
                  className="bg-[#0b0b1f] border border-gray-600 rounded-lg p-3 cursor-pointer hover:border-purple-500 transition-all duration-200 relative"
                  onClick={() => onSelect(artifact)}
                  onMouseEnter={() => !isMobile && setHoveredArtifact(artifact)}
                  onMouseLeave={() => !isMobile && setHoveredArtifact(null)}
                >
                  {/* 🎨 Card compacte */}
                  <div className="flex items-center gap-2 mb-2">
                    <img 
                      src={getSetIcon(artifact.set, slot) || "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1750333738/set_a6k4yh.png"}
                      className="w-8 h-8 flex-shrink-0"
                      alt={artifact.set}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate" title={artifact.name}>
                        {artifact.name}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {artifact.hunter} • {new Date(artifact.dateCreated).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Main Stat */}
                  <div className="text-blue-300 text-sm mb-2">
                    {getStatIcon(artifact.mainStat)} {artifact.mainStat}
                  </div>

                  {/* Sub Stats (sans valeurs) */}
                  <div className="flex flex-wrap gap-1">
                    {artifact.subStats?.filter(Boolean).map((subStat, i) => (
                      <span 
                        key={i}
                        className="text-xs bg-gray-700 px-1 py-0.5 rounded"
                        title={subStat}
                      >
                        {getStatIcon(subStat)}
                      </span>
                    ))}
                  </div>

                  {/* 💡 Hover Tooltip Desktop */}
                  {hoveredArtifact?.id === artifact.id && !isMobile && (
                    <div className="absolute z-10 top-0 left-full ml-2 w-64 bg-[#2d2d5c] border border-purple-500 rounded p-3 shadow-lg">
                      <div className="text-sm font-medium mb-2">{artifact.name}</div>
                      <div className="text-xs space-y-1">
                        <div><strong>Set:</strong> {artifact.set}</div>
                        <div><strong>Main:</strong> {artifact.mainStat} {artifact.mainStatValue}</div>
                        <div><strong>Subs:</strong></div>
                        {artifact.subStats?.map((subStat, i) => {
                          const value = artifact.subStatsLevels?.[i]?.value;
                          if (!subStat || !value) return null;
                          return (
                            <div key={i} className="ml-2">
                              • {subStat}: {subStat.includes('%') ? value.toFixed(1) : Math.floor(value)}
                            </div>
                          );
                        })}
                        <div><strong>Hunter:</strong> {artifact.hunter}</div>
                        <div><strong>Date:</strong> {new Date(artifact.dateCreated).toLocaleDateString()}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 📱 Bottom actions mobile */}
        <div className="p-4 border-t border-gray-700">
          <div className="text-center text-sm text-gray-400">
            {isMobile ? "Tapez sur un artefact pour le sélectionner" : "Survolez ou cliquez pour sélectionner"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtifactLibrary;