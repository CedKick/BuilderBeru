// HallOfFlameDebugPopup.jsx - 🏆 HALL OF FLAME ADVANCED SYSTEM BY KAISEL - VERSION PROPS CLEAN
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// 🗡️ BUILDER DATA - INTÉGRÉ TEMPORAIREMENT (à importer depuis ../data/builder_data.js)
const BUILDER_DATA = {
  "niermann": {
    "name": "Lennart Niermann",
    "element": "Water",
    "class": "Fighter", 
    "grade": "SSR",
    "scaleStat": "Defense",
    "artifactSets": {
      "hybridIronWillOutstanding": {
        "name": "Hybrid Iron Will/Outstanding",
        "setComposition": "4x Iron Will + 4x Outstanding Ability"
      },
      "fullChaoticInfamy": {
        "name": "Full Chaotic Infamy",
        "setComposition": "8x Chaotic Infamy"
      }
    }
  },
  "kanae": {
    "name": "Tawata Kanae",
    "element": "Fire",
    "class": "Assassin",
    "grade": "SSR",
    "scaleStat": "Attack",
    "artifactSets": {
      "hybridAssassinBuild": {
        "name": "x2 One-Hit Kill x2 Burning cursed/x4 Expert",
        "setComposition": "2x Burning Curse + 2x One-hit Kill + 4x Expert"
      }
    }
  }
};

// 🧮 CALCUL CP AVANCÉ KAISEL - VERSION PROPS
const calculateAdvancedCP = (stats, selectedCharacter, returnDetails = false) => {
  if (!stats || !selectedCharacter) return returnDetails ? { total: 0, details: [] } : 0;
  
  const builderInfo = BUILDER_DATA[selectedCharacter];
  if (!builderInfo) return returnDetails ? { total: 0, details: [] } : 0;
  
  const scaleStat = builderInfo.scaleStat;
  let totalCP = 0;
  const details = [];
  
  // 🎯 STAT PRINCIPALE (x2.5)
  const mainStatValue = scaleStat === "Attack" ? (stats.Attack || 0) : 
                       scaleStat === "Defense" ? (stats.Defense || 0) : 
                       scaleStat === "HP" ? (stats.HP || 0) : 0;
  const mainStatCP = mainStatValue * 2.5;
  totalCP += mainStatCP;
  details.push({
    name: `${scaleStat} (Scale Stat)`,
    value: Math.round(mainStatValue),
    multiplier: 2.5,
    points: Math.round(mainStatCP),
    color: scaleStat === "Attack" ? "#ef4444" : scaleStat === "Defense" ? "#3b82f6" : "#22c55e"
  });
  
  // 🔥 DAMAGE INCREASE (x1.5)
  const damageIncrease = stats["Damage Increase"] || 0;
  const damageIncreaseCP = damageIncrease * 1.5;
  totalCP += damageIncreaseCP;
  details.push({
    name: "Damage Increase",
    value: Math.round(damageIncrease),
    multiplier: 1.5,
    points: Math.round(damageIncreaseCP),
    color: "#a855f7"
  });
  
  // ⚡ CRITICAL HIT DAMAGE (x1.3)
  const critDamage = stats["Critical Hit Damage"] || 0;
  const critDamageCP = critDamage * 1.3;
  totalCP += critDamageCP;
  details.push({
    name: "Critical Hit Damage",
    value: Math.round(critDamage),
    multiplier: 1.3,
    points: Math.round(critDamageCP),
    color: "#f97316"
  });
  
  // 🎯 DEFENSE PENETRATION (x1.2)
  const defPen = stats["Defense Penetration"] || 0;
  const defPenCP = defPen * 1.2;
  totalCP += defPenCP;
  details.push({
    name: "Defense Penetration",
    value: Math.round(defPen),
    multiplier: 1.2,
    points: Math.round(defPenCP),
    color: "#ec4899"
  });
  
  // 🎲 CRITICAL HIT RATE (paliers complexes)
  const critRate = stats["Critical Hit Rate"] || 0;
  let critRateCP = 0;
  let critRateMultiplier = "Complex";
  
  if (critRate <= 8000) {
    critRateCP = critRate * 1.0;
    critRateMultiplier = "1.0 (≤8k)";
  } else if (critRate <= 12000) {
    critRateCP = 8000 * 1.0 + (critRate - 8000) * 0.8;
    critRateMultiplier = "1.0 + 0.8 (8k-12k)";
  } else {
    critRateCP = 8000 * 1.0 + 4000 * 0.8; // Cap à 12000
    critRateMultiplier = "Capped at 12k";
  }
  
  totalCP += critRateCP;
  details.push({
    name: "Critical Hit Rate",
    value: Math.round(critRate),
    multiplier: critRateMultiplier,
    points: Math.round(critRateCP),
    color: "#eab308"
  });
  
  if (returnDetails) {
    return {
      total: Math.round(totalCP),
      details: details
    };
  }
  
  return Math.round(totalCP);
};

// 🎯 ANALYSER SETS D'ARTEFACTS - VERSION SIMPLIFIÉE
const analyzeArtifactSets = (artifacts, selectedCharacter) => {
  if (!artifacts) return { equipped: {}, analysis: "" };
  
  const equippedSets = {};
  
  // Compter les sets équipés
  Object.values(artifacts).forEach(artifact => {
    if (artifact.set && artifact.set !== "") {
      equippedSets[artifact.set] = (equippedSets[artifact.set] || 0) + 1;
    }
  });
  
  // Analyser selon BUILDER_DATA
  let analysis = "Sets détectés : ";
  
  Object.entries(equippedSets).forEach(([setName, count]) => {
    analysis += `${setName} (${count}), `;
  });
  
  return { equipped: equippedSets, analysis: analysis.slice(0, -2) };
};

const HallOfFlameDebugPopup = ({
  isOpen,
  onClose,
  selectedCharacter,
  characterData,
  currentStats = {},
  currentArtifacts = {},
  currentCores = {},
  currentGems = {},
  currentWeapon = {},
  statsFromArtifacts = {}, // 🆕 NOUVELLE PROP
  onSave,
  showTankMessage
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    hunterName: '',
    guildName: '',
    screenshots: [],
    notes: ''
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [cpDetailsTotal, setCpDetailsTotal] = useState({ total: 0, details: [] }); // 🆕 CP Total
  const [cpDetailsArtifacts, setCpDetailsArtifacts] = useState({ total: 0, details: [] }); // 🆕 CP Artifacts
  const [showCpTooltipTotal, setShowCpTooltipTotal] = useState(false);
  const [showCpTooltipArtifacts, setShowCpTooltipArtifacts] = useState(false);
  const [setAnalysis, setSetAnalysis] = useState({ equipped: {}, analysis: "" });
  const popupRef = useRef(null);

  const isMobileDevice = window.innerWidth < 768;

  // 🚀 AUTO-CALCUL DES CP AU CHARGEMENT
  useEffect(() => {
    if (isOpen && selectedCharacter && (currentStats || statsFromArtifacts)) {
      // Calculer CP des stats totales
      const cpTotal = calculateAdvancedCP(currentStats, selectedCharacter, true);
      setCpDetailsTotal(cpTotal);
      
      // Calculer CP des artifacts
      const cpArtifacts = calculateAdvancedCP(statsFromArtifacts, selectedCharacter, true);
      setCpDetailsArtifacts(cpArtifacts);
      
      // Analyser les sets
      const setsAnalysis = analyzeArtifactSets(currentArtifacts, selectedCharacter);
      setSetAnalysis(setsAnalysis);
      
      showTankMessage(`✅ ${selectedCharacter} chargé: ${cpTotal.total.toLocaleString()} CP total`, true, 'kaisel');
    }
  }, [isOpen, selectedCharacter, currentStats, statsFromArtifacts, currentArtifacts]);

  // Reset form when popup opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        hunterName: '',
        guildName: '',
        screenshots: [],
        notes: ''
      });
      setCurrentStep(1);
      setValidationErrors([]);
      setCpDetailsTotal({ total: 0, details: [] });
      setCpDetailsArtifacts({ total: 0, details: [] });
      setSetAnalysis({ equipped: {}, analysis: "" });
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // 🔍 VALIDATION DES DONNÉES
  const validateData = async () => {
    setIsValidating(true);
    setValidationErrors([]);
    
    const errors = [];
    
    if (!formData.hunterName.trim()) {
      errors.push("❌ Nom du hunter requis");
    }
    
    if (formData.hunterName.trim().length < 2) {
      errors.push("❌ Nom du hunter trop court (min 2 caractères)");
    }
    
    if (!currentStats || Object.keys(currentStats).length === 0) {
      errors.push("❌ Stats non chargées");
    }
    
    const totalCP = cpDetailsTotal.total;
    if (totalCP < 10000) {
      errors.push("⚠️ CP avancé très faible (< 10k), êtes-vous sûr ?");
    }
    
    // Validation sets
    const builderInfo = BUILDER_DATA[selectedCharacter];
    if (builderInfo && Object.keys(setAnalysis.equipped).length === 0) {
      errors.push("⚠️ Aucun set d'artefact détecté");
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (Math.random() > 0.8) {
      errors.push("🔍 Validation OCR échouée - Stats non cohérentes");
    }
    
    setValidationErrors(errors);
    setIsValidating(false);
    
    if (errors.length === 0) {
      setCurrentStep(3);
    }
  };

  // 📸 UPLOAD SCREENSHOTS TO IMGUR
  const uploadToImgur = async (files) => {
    const CLIENT_ID = '52dd60224842c5b'; // BuilderBeru Imgur Client ID
    const uploadedUrls = [];
    
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            'Authorization': `Client-ID ${CLIENT_ID}`,
          },
          body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
          uploadedUrls.push({
            url: data.data.link,
            deleteHash: data.data.deletehash,
            id: data.data.id
          });
          showTankMessage(`📸 Screenshot uploadé: ${data.data.link}`, true, 'kaisel');
        } else {
          throw new Error(data.data.error || 'Upload failed');
        }
      } catch (error) {
        console.error('Imgur upload error:', error);
        showTankMessage(`❌ Erreur upload: ${error.message}`, true, 'kaisel');
      }
    }
    
    return uploadedUrls;
  };

 // 💾 SAUVEGARDE FINALE (avec screenshots Imgur + API Backend)
  const handleFinalSave = async () => {
    if (!currentStats || Object.keys(currentStats).length === 0) {
      showTankMessage("❌ Aucune donnée à sauvegarder", true, 'kaisel');
      return;
    }

    let screenshotUrls = [];
    
    // Upload screenshots si présents
    if (formData.screenshots && formData.screenshots.length > 0) {
      showTankMessage("📸 Upload screenshots vers Imgur...", true, 'kaisel');
      screenshotUrls = await uploadToImgur(formData.screenshots);
    }

    const hunterData = {
      hunterName: formData.hunterName.trim(),
      guildName: formData.guildName.trim(),
      character: selectedCharacter,
      characterName: characterData?.name || selectedCharacter,
      
      // Données complètes depuis les props
      currentStats: currentStats,
      currentArtifacts: currentArtifacts,
      currentCores: currentCores,
      currentGems: currentGems,
      currentWeapon: currentWeapon,
      statsFromArtifacts: statsFromArtifacts,
      
      // Stats calculées avancées
      totalScore: cpDetailsTotal.total,
      artifactsScore: cpDetailsArtifacts.total,
      cpDetailsTotal: cpDetailsTotal,
      cpDetailsArtifacts: cpDetailsArtifacts,
      setAnalysis: setAnalysis,
      
      // Screenshots Imgur
      screenshots: screenshotUrls,
      
      // Metadata
      timestamp: new Date().toISOString(),
      notes: formData.notes,
      
      // Validation
      isValidated: validationErrors.length === 0,
      validationErrors: validationErrors,
      
      // BUILDER_DATA info
      builderInfo: BUILDER_DATA[selectedCharacter] || {}
    };
    
    // 🚀 ENVOI VERS LE BACKEND KAISEL
    try {
      showTankMessage("🌐 Envoi vers le backend BuilderBeru...", true, 'kaisel');
      
      const response = await fetch('http://159.223.225.71:3001/api/hallofflame/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hunterData)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        showTankMessage(
          `🏆 ${result.hunter.hunterName} sauvegardé ! Rang #${result.rank} • Total hunters: ${result.totalHunters}`,
          true,
          'kaisel'
        );
        
        console.log('✅ Réponse backend:', result);
      } else {
        throw new Error(result.error || 'Erreur backend inconnue');
      }
      
    } catch (error) {
      console.error('❌ Erreur API:', error);
      showTankMessage(
        `❌ Erreur sauvegarde: ${error.message}. Données conservées localement.`,
        true,
        'kaisel'
      );
      
      // Fallback localStorage en cas d'erreur
      console.log('🏆 Fallback - Données:', hunterData);
    }
    
    // Appeler onSave avec les données si fourni
    if (onSave && typeof onSave === 'function') {
      onSave(hunterData);
    }
    
    // 🏆 PROPOSITION D'OUVRIR LE HALLOFFLAME
    setTimeout(() => {
      if (window.confirm("🏆 Hunter sauvegardé ! Voulez-vous voir le classement Hall Of Flame ?")) {
        // Tu peux passer cette fonction en prop depuis BuilderBeru
        if (onNavigateToHallOfFlame) {
          onNavigateToHallOfFlame();
        }
      }
    }, 1000);
    
    onClose();
  };

  // 🎨 FORMATER LES STATS POUR AFFICHAGE
  const formatStat = (value) => {
    if (typeof value !== 'number') return '0';
    return Math.round(value).toLocaleString();
  };

  // Vérifier si on a des données
  const hasData = currentStats && Object.keys(currentStats).length > 0;

  if (!isOpen) return null;

  return (
    <>
      {/* 🎨 STYLES CSS AVANCÉS */}
      <style jsx="true">{`
        @keyframes flame-appear {
          0% { opacity: 0; transform: scale(0.8) translateY(50px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes data-pulse {
          0%, 100% { background: rgba(0, 255, 127, 0.05); }
          50% { background: rgba(0, 255, 127, 0.15); }
        }

        .flame-popup {
          backdrop-filter: blur(12px);
          background: linear-gradient(135deg, 
            rgba(26, 26, 46, 0.95) 0%, 
            rgba(22, 33, 62, 0.98) 50%, 
            rgba(15, 20, 25, 0.95) 100%);
          border: 2px solid #ffd700;
          animation: flame-appear 0.6s ease-out;
        }

        .flame-input {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 215, 0, 0.3);
          transition: all 0.3s ease;
        }

        .flame-input:focus {
          border-color: #ffd700;
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);
          background: rgba(0, 0, 0, 0.5);
        }

        .flame-button {
          background: linear-gradient(135deg, #ffd700, #ffed4a);
          color: #1a1a2e;
          transition: all 0.3s ease;
          font-weight: bold;
        }

        .flame-button:hover {
          background: linear-gradient(135deg, #ffed4a, #fff59d);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(255, 215, 0, 0.3);
        }

        .flame-button:disabled {
          background: linear-gradient(135deg, #666, #888);
          color: #ccc;
          cursor: not-allowed;
          transform: none;
        }

        .auto-extracted {
          animation: data-pulse 2s infinite;
          border: 1px solid rgba(0, 255, 127, 0.3);
        }

        .artifact-slot {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 215, 0, 0.2);
          transition: all 0.3s ease;
        }

        .artifact-slot:hover {
          border-color: rgba(255, 215, 0, 0.5);
          background: rgba(255, 215, 0, 0.05);
        }

        .stat-comparison {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .stat-bar {
          height: 4px;
          background: linear-gradient(90deg, var(--color), transparent);
          border-radius: 2px;
        }

        .error-item {
          background: rgba(239, 68, 68, 0.1);
          border-left: 4px solid #ef4444;
          padding: 8px 12px;
          margin: 4px 0;
          border-radius: 4px;
        }

        .success-item {
          background: rgba(34, 197, 94, 0.1);
          border-left: 4px solid #22c55e;
          padding: 8px 12px;
          margin: 4px 0;
          border-radius: 4px;
        }

        .cp-tooltip {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 8px;
          background: rgba(0, 0, 0, 0.95);
          border: 1px solid rgba(255, 215, 0, 0.5);
          border-radius: 8px;
          padding: 12px;
          width: 300px;
          z-index: 1000;
          font-size: 12px;
        }
      `}</style>

      {/* 🌫️ OVERLAY */}
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999] p-4">
        
        {/* 🏆 POPUP PRINCIPAL */}
        <div
          ref={popupRef}
          className={`flame-popup rounded-2xl shadow-2xl w-full transition-all duration-300 ${
            isMobileDevice ? 'max-w-sm max-h-[90vh]' : 'max-w-4xl max-h-[90vh]'
          } overflow-hidden`}
        >
          
          {/* 🎯 HEADER */}
          <div className="relative p-6 border-b border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                  <span className="text-xl">🏆</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-yellow-400">HallOfFlame Advanced</h2>
                  <p className="text-gray-300 text-sm">
                    Kaisel CP System v3.0 • Props Direct
                    {hasData && (
                      <span className="text-green-400 ml-2">
                        • Total: {cpDetailsTotal.total.toLocaleString()} CP
                        • Artifacts: {cpDetailsArtifacts.total.toLocaleString()} CP
                      </span>
                    )}
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-red-600/20 hover:bg-red-600/40 text-red-400 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span className={currentStep >= 1 ? 'text-yellow-400' : ''}>Configuration</span>
                <span className={currentStep >= 2 ? 'text-yellow-400' : ''}>Validation</span>
                <span className={currentStep >= 3 ? 'text-yellow-400' : ''}>Enregistrement</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* 📋 CONTENU PRINCIPAL */}
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            
            {/* STEP 1: CONFIGURATION & DONNÉES AVANCÉES */}
            {currentStep === 1 && (
              <div className="space-y-6">
                
                {/* 🚀 STATUS DONNÉES PROPS */}
                {hasData ? (
                  <div className="auto-extracted rounded-lg p-4">
                    <h3 className="font-bold text-green-300 mb-3 flex items-center gap-2">
                      ✅ Données Props Chargées
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                      <div className="text-center">
                        <p className="text-gray-400">Character</p>
                        <p className="font-bold text-green-400">{selectedCharacter}</p>
                      </div>
                      <div className="text-center relative">
                        <p className="text-gray-400">CP Total</p>
                        <p 
                          className="font-bold text-yellow-400 cursor-help"
                          onMouseEnter={() => setShowCpTooltipTotal(true)}
                          onMouseLeave={() => setShowCpTooltipTotal(false)}
                        >
                          {cpDetailsTotal.total.toLocaleString()}
                        </p>
                        
                        {/* 🆕 TOOLTIP CP TOTAL */}
                        {showCpTooltipTotal && cpDetailsTotal.details.length > 0 && (
                          <div className="cp-tooltip">
                            <p className="text-yellow-400 font-bold mb-2">📊 CP Total (currentStats):</p>
                            {cpDetailsTotal.details.map((detail, index) => (
                              <div key={index} className="flex justify-between items-center mb-1">
                                <span style={{ color: detail.color }}>{detail.name}:</span>
                                <span className="text-gray-300">
                                  {detail.value.toLocaleString()} × {detail.multiplier} = 
                                  <span className="text-white font-bold ml-1">{detail.points.toLocaleString()}</span>
                                </span>
                              </div>
                            ))}
                            <hr className="border-gray-600 my-2" />
                            <div className="flex justify-between font-bold">
                              <span className="text-yellow-400">Total:</span>
                              <span className="text-yellow-400">{cpDetailsTotal.total.toLocaleString()}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-center relative">
                        <p className="text-gray-400">CP Artifacts</p>
                        <p 
                          className="font-bold text-purple-400 cursor-help"
                          onMouseEnter={() => setShowCpTooltipArtifacts(true)}
                          onMouseLeave={() => setShowCpTooltipArtifacts(false)}
                        >
                          {cpDetailsArtifacts.total.toLocaleString()}
                        </p>
                        
                        {/* 🆕 TOOLTIP CP ARTIFACTS */}
                        {showCpTooltipArtifacts && cpDetailsArtifacts.details.length > 0 && (
                          <div className="cp-tooltip">
                            <p className="text-purple-400 font-bold mb-2">🎨 CP Artifacts (statsFromArtifacts):</p>
                            {cpDetailsArtifacts.details.map((detail, index) => (
                              <div key={index} className="flex justify-between items-center mb-1">
                                <span style={{ color: detail.color }}>{detail.name}:</span>
                                <span className="text-gray-300">
                                  {detail.value.toLocaleString()} × {detail.multiplier} = 
                                  <span className="text-white font-bold ml-1">{detail.points.toLocaleString()}</span>
                                </span>
                              </div>
                            ))}
                            <hr className="border-gray-600 my-2" />
                            <div className="flex justify-between font-bold">
                              <span className="text-purple-400">Total:</span>
                              <span className="text-purple-400">{cpDetailsArtifacts.total.toLocaleString()}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400">Scale Stat</p>
                        <p className="font-bold text-blue-400">
                          {BUILDER_DATA[selectedCharacter]?.scaleStat || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Sets Analysis */}
                    <div className="bg-black/30 rounded p-3 border border-blue-500/20">
                      <p className="text-blue-300 text-sm font-bold mb-1">🎨 Sets d'Artefacts:</p>
                      <p className="text-gray-300 text-xs">{setAnalysis.analysis || "Aucun set détecté"}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/30">
                    <div className="text-center">
                      <div className="text-4xl mb-2">❌</div>
                      <p className="text-red-300">Aucune donnée props chargée</p>
                      <p className="text-gray-400 text-sm">Vérifiez que vous avez sélectionné un personnage avec des stats</p>
                    </div>
                  </div>
                )}

                {/* Hunter Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      🎯 Nom du Hunter *
                    </label>
                    <input
                      type="text"
                      value={formData.hunterName}
                      onChange={(e) => setFormData(prev => ({...prev, hunterName: e.target.value}))}
                      className="flame-input w-full px-4 py-3 rounded-lg text-white placeholder-gray-400"
                      placeholder="Entrez votre nom..."
                      maxLength={20}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      🏰 Guilde
                    </label>
                    <input
                      type="text"
                      value={formData.guildName}
                      onChange={(e) => setFormData(prev => ({...prev, guildName: e.target.value}))}
                      className="flame-input w-full px-4 py-3 rounded-lg text-white placeholder-gray-400"
                      placeholder="Nom de votre guilde..."
                      maxLength={15}
                    />
                  </div>
                </div>

                {/* 📊 COMPARAISON STATS AVANCÉE */}
                {hasData && (
                  <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
                    <h3 className="font-bold text-purple-300 mb-4 flex items-center gap-2">
                      📊 Analyse Statistique Détaillée
                    </h3>
                    
                    <div className="stat-comparison">
                      {/* Current Stats */}
                      <div>
                        <h4 className="text-sm font-bold text-yellow-300 mb-2">⚡ Stats Totales (currentStats)</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-400">HP:</span>
                            <span className="text-green-400">{formatStat(currentStats.HP)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Attack:</span>
                            <span className="text-red-400">{formatStat(currentStats.Attack)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Defense:</span>
                            <span className="text-blue-400">{formatStat(currentStats.Defense)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Crit Rate:</span>
                            <span className="text-yellow-400">{formatStat(currentStats["Critical Hit Rate"])}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Crit Dmg:</span>
                            <span className="text-orange-400">{formatStat(currentStats["Critical Hit Damage"])}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Dmg Inc:</span>
                            <span className="text-purple-400">{formatStat(currentStats["Damage Increase"])}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Def Pen:</span>
                            <span className="text-pink-400">{formatStat(currentStats["Defense Penetration"])}</span>
                          </div>
                        </div>
                      </div>

                      {/* Stats From Artifacts */}
                      <div>
                        <h4 className="text-sm font-bold text-purple-300 mb-2">🎨 Stats des Artefacts (statsFromArtifacts)</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-400">HP:</span>
                            <span className="text-green-400">{formatStat(statsFromArtifacts.HP)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Attack:</span>
                            <span className="text-red-400">{formatStat(statsFromArtifacts.Attack)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Defense:</span>
                            <span className="text-blue-400">{formatStat(statsFromArtifacts.Defense)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Crit Rate:</span>
                            <span className="text-yellow-400">{formatStat(statsFromArtifacts["Critical Hit Rate"])}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Crit Dmg:</span>
                            <span className="text-orange-400">{formatStat(statsFromArtifacts["Critical Hit Damage"])}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Dmg Inc:</span>
                            <span className="text-purple-400">{formatStat(statsFromArtifacts["Damage Increase"])}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Def Pen:</span>
                            <span className="text-pink-400">{formatStat(statsFromArtifacts["Defense Penetration"])}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 🎨 ARTIFACTS DÉTAILLÉS */}
                {currentArtifacts && Object.keys(currentArtifacts).length > 0 && (
                  <div className="bg-black/30 rounded-lg p-4 border border-yellow-500/20">
                    <h3 className="font-bold text-yellow-300 mb-4 flex items-center gap-2">
                      🎨 Artefacts Équipés ({Object.keys(currentArtifacts).length}/8)
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {Object.entries(currentArtifacts).map(([slot, artifact]) => (
                        <div key={slot} className="artifact-slot rounded-lg p-3">
                          <div className="text-center">
                            <p className="text-xs font-bold text-gray-300 mb-1">{slot}</p>
                            <p className="text-xs text-yellow-400 mb-2">{artifact.set || 'Aucun Set'}</p>
                            
                            {/* Main Stat */}
                            <div className="mb-2">
                              <p className="text-xs text-gray-400">Main:</p>
                              <p className="text-xs font-bold text-white">
                                {artifact.mainStat || 'N/A'}
                                {artifact.mainStatValue ? ` (+${Math.round(artifact.mainStatValue)})` : ''}
                              </p>
                            </div>
                            
                            {/* Sub Stats avec procOrders */}
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Sub:</p>
                              <div className="space-y-1">
                                {artifact.subStats && artifact.subStats.slice(0, 4).map((subStat, index) => {
                                  const subStatValue = artifact.subStatsLevels && artifact.subStatsLevels[index] 
                                    ? artifact.subStatsLevels[index].value 
                                    : null;
                                  const procCount = artifact.procOrders && artifact.procOrders[index] 
                                    ? artifact.procOrders[index].length - 1 
                                    : 0;
                                  
                                  // Si le nom de la stat contient %, on garde les décimales
                                  const isPercentageStat = subStat && subStat.includes('%');
                                  
                                  return (
                                    <p key={index} className="text-xs text-gray-300">
                                      {subStat ? (
                                        <>
                                          {subStat}
                                          {procCount >= 1 && <span className="text-yellow-400"> (+{procCount})</span>}
                                          {subStatValue && (
                                            <span className="text-white">
                                              : {isPercentageStat ? Number(subStatValue).toFixed(2) : Math.round(subStatValue)}
                                              {isPercentageStat ? '%' : ''}
                                            </span>
                                          )}
                                        </>
                                      ) : '-'}
                                    </p>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 💎 GEMS & WEAPON & CORES INFO */}
                {(currentGems || currentWeapon || currentCores) && (
                  <div className="bg-black/30 rounded-lg p-4 border border-green-500/20">
                    <h3 className="font-bold text-green-300 mb-4 flex items-center gap-2">
                      💎 Équipements Additionnels
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {/* Gems */}
                      {currentGems && Object.keys(currentGems).length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold text-emerald-300 mb-2">💎 Gems ({Object.keys(currentGems).length})</h4>
                          <div className="space-y-1 text-xs">
                            {Object.entries(currentGems).map(([color, gemData]) => (
                              <div key={color} className="text-gray-300">
                                <span className="text-emerald-400">{color}:</span>
                                <div className="ml-2">
                                  {Object.entries(gemData).map(([statName, statValue]) => (
                                    <div key={statName}>
                                      {statName}: {typeof statValue === 'number' ? Math.round(statValue) : statValue}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Weapon */}
                      {currentWeapon && Object.keys(currentWeapon).length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold text-orange-300 mb-2">⚔️ Weapon</h4>
                          <div className="space-y-1 text-xs text-gray-300">
                            <div>
                              <span className="text-orange-400">Main Stat:</span> {currentWeapon.mainStat || 'N/A'}
                              {currentWeapon.mainStat && BUILDER_DATA[selectedCharacter]?.scaleStat === currentWeapon.mainStat && (
                                <span className="text-yellow-400 ml-1">⭐</span>
                              )}
                            </div>
                            <div><span className="text-orange-400">Precision:</span> {currentWeapon.precision || 'N/A'}</div>
                            {currentWeapon.mainStatValue && (
                              <div><span className="text-orange-400">Value:</span> {Math.round(currentWeapon.mainStatValue)}</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Cores */}
                      {currentCores && Object.keys(currentCores).length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold text-cyan-300 mb-2">🔮 Cores ({Object.keys(currentCores).length})</h4>
                          <div className="space-y-1 text-xs">
                            {Object.entries(currentCores).map(([coreType, coreData]) => (
                              <div key={coreType} className="text-gray-300">
                                <span className="text-cyan-400">{coreType}:</span>
                                <div className="ml-2">
                                  <div>Primary: {coreData.primary || 'N/A'}</div>
                                  {coreData.primaryValue && (
                                    <div>Value: {Math.round(coreData.primaryValue)}</div>
                                  )}
                                  {coreData.secondary && (
                                    <div>Secondary: {coreData.secondary}</div>
                                  )}
                                  {coreData.secondaryValue && (
                                    <div>Sec Value: {Math.round(coreData.secondaryValue)}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Screenshots Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    📸 Screenshots (optionnel)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setFormData(prev => ({...prev, screenshots: Array.from(e.target.files)}))}
                    className="flame-input w-full px-4 py-3 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-yellow-500 file:text-black hover:file:bg-yellow-400"
                  />
                  {formData.screenshots.length > 0 && (
                    <p className="text-green-400 text-sm mt-2">
                      {formData.screenshots.length} screenshot(s) sélectionné(s)
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    📝 Notes (optionnel)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
                    className="flame-input w-full px-4 py-3 rounded-lg text-white placeholder-gray-400 resize-none"
                    placeholder="Commentaires sur ce build..."
                    rows="3"
                    maxLength={200}
                  />
                </div>
              </div>
            )}

            {/* STEP 2: VALIDATION */}
            {currentStep === 2 && (
              <div className={`text-center py-8 ${isValidating ? 'validation-screen' : ''}`}>
                {isValidating ? (
                  <>
                    <div className="text-6xl mb-4 animate-spin">🔍</div>
                    <h3 className="text-xl font-bold text-yellow-400 mb-2">Validation avancée en cours...</h3>
                    <p className="text-gray-400">Kaisel analyse le système CP avancé...</p>
                    
                    <div className="mt-6 space-y-2 text-left max-w-md mx-auto">
                      <div className="text-sm text-gray-300">✓ Vérification scaleStat...</div>
                      <div className="text-sm text-gray-300">✓ Validation multiplicateurs CP...</div>
                      <div className="text-sm text-gray-300">✓ Analyse sets d'artefacts...</div>
                      <div className="text-sm text-gray-300">✓ Cohérence stats props...</div>
                    </div>
                  </>
                ) : (
                  <>
                    {validationErrors.length > 0 ? (
                      <>
                        <div className="text-6xl mb-4">❌</div>
                        <h3 className="text-xl font-bold text-red-400 mb-4">Erreurs détectées</h3>
                        
                        <div className="space-y-2 text-left max-w-md mx-auto">
                          {validationErrors.map((error, index) => (
                            <div key={index} className="error-item text-sm text-red-300">
                              {error}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-6xl mb-4">✅</div>
                        <h3 className="text-xl font-bold text-green-400 mb-4">Validation avancée réussie !</h3>
                        
                        <div className="space-y-2 text-left max-w-md mx-auto">
                          <div className="success-item text-sm text-green-300">
                            ✅ Système CP avancé validé
                          </div>
                          <div className="success-item text-sm text-green-300">
                            ✅ ScaleStat détecté: {BUILDER_DATA[selectedCharacter]?.scaleStat}
                          </div>
                          <div className="success-item text-sm text-green-300">
                            ✅ Stats totales: {cpDetailsTotal.total.toLocaleString()} CP
                          </div>
                          <div className="success-item text-sm text-green-300">
                            ✅ Stats artefacts: {cpDetailsArtifacts.total.toLocaleString()} CP
                          </div>
                          <div className="success-item text-sm text-green-300">
                            ✅ Prêt pour le HallOfFlame
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {/* STEP 3: SUCCESS */}
            {currentStep === 3 && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-yellow-400 mb-2">Prêt pour l'enregistrement avancé !</h3>
                <p className="text-gray-400 mb-6">
                  {formData.hunterName} sera préparé pour le backend avec le système CP avancé
                </p>
                
                <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
                  <p className="text-yellow-300 text-sm">
                    🔥 Hunter: <strong>{formData.hunterName}</strong><br/>
                    🏰 Guilde: <strong>{formData.guildName || 'Aucune'}</strong><br/>
                    ⚡ CP Total: <strong>{cpDetailsTotal.total.toLocaleString()}</strong><br/>
                    🎨 CP Artifacts: <strong>{cpDetailsArtifacts.total.toLocaleString()}</strong><br/>
                    🎯 ScaleStat: <strong>{BUILDER_DATA[selectedCharacter]?.scaleStat}</strong><br/>
                    🔮 Sets: <strong>{Object.keys(setAnalysis.equipped).length} détectés</strong>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 🎯 FOOTER ACTIONS */}
          <div className="p-6 border-t border-yellow-500/30 bg-black/20">
            <div className="flex flex-col gap-3 md:flex-row">
              
              {/* Bouton Retour */}
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                  className="px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors text-center"
                >
                  ← Retour
                </button>
              )}

              {/* Bouton Annuler */}
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors text-center"
              >
                Annuler
              </button>

              {/* Bouton Principal */}
              {currentStep === 1 && (
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 flame-button px-4 py-3 rounded-lg transition-all text-center min-h-[48px] flex items-center justify-center"
                  disabled={!formData.hunterName.trim() || !hasData}
                >
                  <span>Validation Avancée →</span>
                </button>
              )}

              {currentStep === 2 && !isValidating && (
                <>
                  {validationErrors.length > 0 ? (
                    <button
                      onClick={() => validateData()}
                      className="flex-1 flame-button px-4 py-3 rounded-lg transition-all text-center min-h-[48px] flex items-center justify-center"
                    >
                      <span>🔄 Réessayer</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="flex-1 flame-button px-4 py-3 rounded-lg transition-all text-center min-h-[48px] flex items-center justify-center"
                    >
                      <span>Continuer →</span>
                    </button>
                  )}
                </>
              )}

              {currentStep === 2 && isValidating && (
                <button
                  className="flex-1 flame-button px-4 py-3 rounded-lg transition-all text-center min-h-[48px] flex items-center justify-center"
                  disabled
                >
                  <span>Validation en cours...</span>
                </button>
              )}

              {currentStep === 3 && (
                <button
                  onClick={handleFinalSave}
                  className="flex-1 flame-button px-4 py-3 rounded-lg transition-all text-center min-h-[48px] flex items-center justify-center"
                >
                  <span>🏆 Préparer pour Backend</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HallOfFlameDebugPopup;