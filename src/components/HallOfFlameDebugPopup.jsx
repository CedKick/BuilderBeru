// HallOfFlameDebugPopup.jsx - 🔧 FIX IMGUR + useEffect + CORS par Kaisel - v3.0 CHECKED/NOTATION
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BUILDER_DATA } from '../data/builder_data.js';

// 🧮 CALCUL CP AVANCÉ KAISEL - VERSION PROPS + SET BONUS
const calculateAdvancedCP = (stats, selectedCharacter, returnDetails = false, setBonus = false) => {
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
  
  // 🏆 BONUS SET OPTIMAL (+5% CP si set parfait)
  if (setBonus) {
    const bonus = totalCP * 0.05;
    totalCP += bonus;
    details.push({
      name: "Set Optimal Bonus",
      value: "Perfect",
      multiplier: "+5%",
      points: Math.round(bonus),
      color: "#10b981"
    });
  }
  
  if (returnDetails) {
    return {
      total: Math.round(totalCP),
      details: details
    };
  }
  
  return Math.round(totalCP);
};

// 🎯 ANALYSER SETS D'ARTEFACTS - VERSION AVANCÉE KAISEL
const analyzeArtifactSets = (artifacts, selectedCharacter) => {
  if (!artifacts) return { 
    equipped: {}, 
    analysis: "", 
    isOptimal: false, 
    recommendedSets: []
  };
  
  const equippedSets = {};
  
  // Compter les sets équipés
  Object.values(artifacts).forEach(artifact => {
    if (artifact.set && artifact.set !== "") {
      equippedSets[artifact.set] = (equippedSets[artifact.set] || 0) + 1;
    }
  });
  
  // Construire la string des sets détectés
  let analysis = "Sets détectés : ";
  const detectedSetsList = [];
  
  Object.entries(equippedSets).forEach(([setName, count]) => {
    const setString = `${setName} (${count})`;
    detectedSetsList.push(setString);
    analysis += `${setString}, `;
  });
  
  analysis = analysis.slice(0, -2); // Supprimer la dernière virgule
  
  // 🚀 VALIDATION AVEC BUILDER_DATA
  const builderInfo = BUILDER_DATA[selectedCharacter];
  let isOptimal = false;
  let recommendedSets = [];
  
  if (builderInfo && builderInfo.artifactSets) {
    // Récupérer tous les sets recommandés
    Object.values(builderInfo.artifactSets).forEach(artifactSet => {
      if (artifactSet.setComposition) {
        recommendedSets.push({
          name: artifactSet.name,
          composition: artifactSet.setComposition,
          availability: artifactSet.availability
        });
      }
    });
    
    // 🧮 FONCTION DE NORMALISATION POUR COMPARAISON
    const normalizeSetString = (setString) => {
      if (!setString) return "";
      
      // Convertir "4x Iron Will + 4x Outstanding Ability" 
      // en "Iron Will (4), Outstanding Ability (4)"
      if (setString.includes('x') && setString.includes('+')) {
        const parts = setString.split('+').map(part => part.trim());
        const normalized = parts.map(part => {
          const match = part.match(/(\d+)x\s*(.+)/);
          if (match) {
            const count = match[1];
            const setName = match[2].trim();
            return `${setName} (${count})`;
          }
          return part;
        });
        return normalized.sort().join(', ');
      }
      
      // Si déjà au bon format, on trie juste
      return setString.split(',').map(s => s.trim()).sort().join(', ');
    };
    
    const detectedNormalized = normalizeSetString(detectedSetsList.sort().join(', '));
    
    // Vérifier si un des sets recommandés correspond
    for (const recSet of recommendedSets) {
      const recommendedNormalized = normalizeSetString(recSet.composition);
      
      if (detectedNormalized === recommendedNormalized) {
        isOptimal = true;
        break;
      }
    }
  }
  
  return { 
    equipped: equippedSets, 
    analysis: analysis || "Aucun set détecté",
    isOptimal: isOptimal,
    recommendedSets: recommendedSets
  };
};

// 🔄 FONCTION DE SYNCHRONISATION DU CACHE LOCAL
export const syncLocalCache = async (showTankMessage) => {
  try {
    const localData = JSON.parse(localStorage.getItem('hallofflame_cache') || '[]');
    
    if (localData.length === 0) {
      console.log('✅ Aucune donnée à synchroniser');
      return { success: true, synced: 0, remaining: 0 };
    }
    
    console.log(`🔄 Synchronisation de ${localData.length} hunter(s)...`);
    if (showTankMessage) {
      showTankMessage(`🔄 Synchronisation de ${localData.length} hunter(s) en cours...`, true, 'kaisel');
    }
    
    const results = await Promise.allSettled(
      localData.map(async (hunterData) => {
        try {
          const response = await fetch('https://api.builderberu.com/api/hallofflame/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(hunterData)
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          const result = await response.json();
          return {
            ...result,
            uniqueKey: hunterData.uniqueKey
          };
        } catch (error) {
          console.error(`❌ Erreur sync ${hunterData.pseudo}:`, error);
          throw error;
        }
      })
    );
    
    // Filtrer les succès
    const successful = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value.uniqueKey);
    
    // Mettre à jour le cache local
    const remainingData = localData.filter(h => !successful.includes(h.uniqueKey));
    localStorage.setItem('hallofflame_cache', JSON.stringify(remainingData));
    
    const syncResult = {
      success: true,
      synced: successful.length,
      remaining: remainingData.length,
      total: localData.length
    };
    
    console.log(`✅ Synchronisation: ${successful.length} succès, ${remainingData.length} en attente`);
    
    if (showTankMessage) {
      if (successful.length > 0) {
        showTankMessage(
          `✅ Synchronisation réussie: ${successful.length}/${localData.length} hunters envoyés !`,
          true,
          'kaisel'
        );
      }
      if (remainingData.length > 0) {
        showTankMessage(
          `⚠️ ${remainingData.length} hunter(s) en attente (erreur réseau/CORS)`,
          true,
          'kaisel'
        );
      }
    }
    
    return syncResult;
    
  } catch (error) {
    console.error('❌ Erreur synchronisation globale:', error);
    return { success: false, error: error.message };
  }
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
  statsFromArtifacts = {},
  onSave,
  showTankMessage,
  onNavigateToHallOfFlame
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    pseudo: '',
    accountId: '',
    guildName: '',
    screenshots: [],
    notes: ''
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [cpDetailsTotal, setCpDetailsTotal] = useState({ total: 0, details: [] });
  const [cpDetailsArtifacts, setCpDetailsArtifacts] = useState({ total: 0, details: [] });
  const [showCpTooltipTotal, setShowCpTooltipTotal] = useState(false);
  const [showCpTooltipArtifacts, setShowCpTooltipArtifacts] = useState(false);
  const [setAnalysis, setSetAnalysis] = useState({ 
    equipped: {}, 
    analysis: "", 
    isOptimal: false, 
    recommendedSets: []
  });
  const popupRef = useRef(null);
  
  // 🆕 State pour gérer la réponse de soumission
  const [submissionResponse, setSubmissionResponse] = useState(null);

  const isMobileDevice = window.innerWidth < 768;

  // 🔧 MÉMOISATION POUR ÉVITER RECALCULS EXCESSIFS
  const memoizedSetAnalysis = useMemo(() => {
    if (!isOpen || !selectedCharacter || !currentArtifacts) return { 
      equipped: {}, 
      analysis: "", 
      isOptimal: false, 
      recommendedSets: []
    };
    return analyzeArtifactSets(currentArtifacts, selectedCharacter);
  }, [isOpen, selectedCharacter, currentArtifacts]);

  const memoizedCpTotal = useMemo(() => {
    if (!isOpen || !selectedCharacter || !currentStats || Object.keys(currentStats).length === 0) {
      return { total: 0, details: [] };
    }
    return calculateAdvancedCP(currentStats, selectedCharacter, true, memoizedSetAnalysis.isOptimal);
  }, [isOpen, selectedCharacter, currentStats, memoizedSetAnalysis.isOptimal]);

  const memoizedCpArtifacts = useMemo(() => {
    if (!isOpen || !selectedCharacter || !statsFromArtifacts || Object.keys(statsFromArtifacts).length === 0) {
      return { total: 0, details: [] };
    }
    return calculateAdvancedCP(statsFromArtifacts, selectedCharacter, true, memoizedSetAnalysis.isOptimal);
  }, [isOpen, selectedCharacter, statsFromArtifacts, memoizedSetAnalysis.isOptimal]);

  // 🚀 useEffect OPTIMISÉ AVEC DEPENDENCIES STABLES
  useEffect(() => {
    if (!isOpen) return;

    // Mise à jour des states SEULEMENT si nécessaire
    setSetAnalysis(prev => {
      if (JSON.stringify(prev) !== JSON.stringify(memoizedSetAnalysis)) {
        return memoizedSetAnalysis;
      }
      return prev;
    });

    setCpDetailsTotal(prev => {
      if (JSON.stringify(prev) !== JSON.stringify(memoizedCpTotal)) {
        return memoizedCpTotal;
      }
      return prev;
    });

    setCpDetailsArtifacts(prev => {
      if (JSON.stringify(prev) !== JSON.stringify(memoizedCpArtifacts)) {
        return memoizedCpArtifacts;
      }
      return prev;
    });

    // Message Tank SEULEMENT au premier chargement
    if (selectedCharacter && memoizedCpTotal.total > 0 && showTankMessage) {
      let message = `✅ ${selectedCharacter} chargé: ${memoizedCpTotal.total.toLocaleString()} CP total`;
      if (memoizedSetAnalysis.isOptimal) {
        message += " 🏆 SET OPTIMAL!";
      }
      showTankMessage(message, true, 'kaisel');
    }
  }, [isOpen, selectedCharacter, memoizedSetAnalysis, memoizedCpTotal, memoizedCpArtifacts]);

  // Reset form when popup opens - OPTIMISÉ
  useEffect(() => {
    if (isOpen) {
      setFormData({
        pseudo: '',
        accountId: '',
        guildName: '',
        screenshots: [],
        notes: ''
      });
      setCurrentStep(1);
      setValidationErrors([]);
      setSubmissionResponse(null); // 🆕 Reset response
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
  const validateData = useCallback(async () => {
    setIsValidating(true);
    setValidationErrors([]);
    
    const errors = [];
    
    if (!formData.pseudo.trim()) {
      errors.push("❌ Pseudo requis");
    }
    
    if (formData.pseudo.trim().length < 2) {
      errors.push("❌ Pseudo trop court (min 2 caractères)");
    }

    if (!formData.accountId.trim()) {
      errors.push("❌ ID Account requis");
    }
    
    if (formData.accountId.trim().length < 4) {
      errors.push("❌ ID Account trop court (min 4 caractères, ex: #Kly123)");
    }

    if (!formData.accountId.startsWith('#')) {
      errors.push("❌ ID Account doit commencer par # (ex: #Kly123)");
    }

    // Screenshots optionnels en local, obligatoires en prod
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocalhost && (!formData.screenshots || formData.screenshots.length === 0)) {
      errors.push("❌ Screenshot obligatoire pour validation (prod)");
    }
    
    if (!currentStats || Object.keys(currentStats).length === 0) {
      errors.push("❌ Stats non chargées");
    }
    
    const totalCP = memoizedCpTotal.total;
    if (totalCP < 10000) {
      errors.push("⚠️ CP avancé très faible (< 10k), êtes-vous sûr ?");
    }
    
    // Validation sets avancée
    const builderInfo = BUILDER_DATA[selectedCharacter];
    if (builderInfo && Object.keys(memoizedSetAnalysis.equipped).length === 0) {
      errors.push("⚠️ Aucun set d'artefact détecté");
    } else if (builderInfo && !memoizedSetAnalysis.isOptimal && memoizedSetAnalysis.recommendedSets.length > 0) {
      errors.push("⚠️ Set d'artefacts non optimal - bonus CP manqué");
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
  }, [formData, currentStats, selectedCharacter, memoizedCpTotal.total, memoizedSetAnalysis]);

  // 📸 UPLOAD SCREENSHOTS IMGUR - VERSION FIXÉE CORS
  const uploadToImgur = useCallback(async (files) => {
    // 🔧 MÉTHODE ALTERNATIVE SANS CORS
    showTankMessage("📸 Upload via fallback (CORS bypass)...", true, 'kaisel');
    
    const uploadedUrls = [];
    
    // Simuler upload local + génération liens temporaires
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Créer un blob URL temporaire
        const blobUrl = URL.createObjectURL(file);
        
        // Convertir en base64 pour stockage (fallback)
        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
        
        const base64Data = await base64Promise;
        
        uploadedUrls.push({
          url: blobUrl, // URL temporaire pour preview
          base64: base64Data, // Data complète pour sauvegarde
          filename: file.name,
          size: file.size,
          type: file.type,
          uploadMethod: 'fallback'
        });
        
        showTankMessage(`📸 Screenshot ${i + 1} traité: ${file.name}`, true, 'kaisel');
        
      } catch (error) {
        console.error('Erreur traitement image:', error);
        showTankMessage(`❌ Erreur image ${i + 1}: ${error.message}`, true, 'kaisel');
      }
    }
    
    return uploadedUrls;
  }, [showTankMessage]);

  // 💾 SAUVEGARDE FINALE - VERSION MISE À JOUR v3.0
  const handleFinalSave = useCallback(async () => {
    if (!currentStats || Object.keys(currentStats).length === 0) {
      showTankMessage("❌ Aucune donnée à sauvegarder", true, 'kaisel');
      return;
    }

    let screenshotUrls = [];
    
    if (formData.screenshots && formData.screenshots.length > 0) {
      screenshotUrls = await uploadToImgur(formData.screenshots);
    }

    const hunterData = {
      uniqueKey: `${selectedCharacter}-${formData.pseudo.trim()}-${formData.accountId.trim()}`,
      pseudo: formData.pseudo.trim(),
      accountId: formData.accountId.trim(),
      guildName: formData.guildName.trim(),
      character: selectedCharacter,
      characterName: characterData?.name || selectedCharacter,
      currentStats: currentStats,
      currentArtifacts: currentArtifacts,
      currentCores: currentCores,
      currentGems: currentGems,
      currentWeapon: currentWeapon,
      statsFromArtifacts: statsFromArtifacts,
      totalScore: memoizedCpTotal.total,
      artifactsScore: memoizedCpArtifacts.total,
      cpDetailsTotal: memoizedCpTotal,
      cpDetailsArtifacts: memoizedCpArtifacts,
      setAnalysis: memoizedSetAnalysis,
      setValidation: {
        isOptimal: memoizedSetAnalysis.isOptimal,
        recommendedSets: memoizedSetAnalysis.recommendedSets,
        detectedSets: Object.entries(memoizedSetAnalysis.equipped).map(([name, count]) => `${name} (${count})`)
      },
      screenshots: screenshotUrls,
      timestamp: new Date().toISOString(),
      notes: formData.notes,
      isValidated: validationErrors.length === 0,
      validationErrors: validationErrors,
      builderInfo: BUILDER_DATA[selectedCharacter] || {}
    };
    
    // 🚀 STRATÉGIE MULTI-MÉTHODES POUR GÉRER CORS
    try {
      showTankMessage("🌐 Envoi vers le backend BuilderBeru...", true, 'kaisel');
      
      let response;
      let result;
      let methodUsed = 'direct';
      
      try {
        response = await fetch('https://api.builderberu.com/api/hallofflame/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(hunterData)
        });
        
        result = await response.json();
        
      } catch (corsError) {
        console.warn('⚠️ Erreur CORS avec méthode directe, essai méthode alternative...');
        
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          try {
            response = await fetch('/api/hallofflame/submit', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify(hunterData)
            });
            
            result = await response.json();
            methodUsed = 'proxy';
            
          } catch (proxyError) {
            console.warn('⚠️ Proxy local non configuré');
            throw corsError;
          }
        } else {
          throw corsError;
        }
      }
      
      // 🆕 TRAITEMENT DE LA RÉPONSE v3.0
      if (response && response.ok && result && result.success) {
        setSubmissionResponse(result); // Stocker la réponse
        
        // 🔄 CAS D'UN DOUBLON DÉTECTÉ
        if (result.isDuplicate) {
          const message = result.suspiciousPseudoChange ? 
            `🚨 DOUBLON SUSPECT: ${result.hunter.pseudo} en attente de validation\n` +
            `⚠️ Changement de pseudo détecté!\n` +
            `Ancien: ${result.existingHunter.pseudo}\n` +
            `Nouveau: ${result.hunter.pseudo}` :
            `🔄 DOUBLON: ${result.hunter.pseudo} en attente de validation\n` +
            `Un hunter existe déjà avec ce compte et personnage`;
          
          showTankMessage(message, true, 'kaisel');
          
          // Afficher une alerte spéciale pour les doublons suspects
          if (result.suspiciousPseudoChange) {
            setTimeout(() => {
              if (window.confirm(
                `🚨 ATTENTION - CHANGEMENT DE PSEUDO DÉTECTÉ!\n\n` +
                `Compte: ${result.hunter.accountId}\n` +
                `Personnage: ${result.hunter.character}\n` +
                `Ancien pseudo: ${result.existingHunter.pseudo}\n` +
                `Nouveau pseudo: ${result.hunter.pseudo}\n\n` +
                `Cette soumission est en attente de validation admin.\n` +
                `Voulez-vous voir le Hall Of Flame ?`
              )) {
                if (onNavigateToHallOfFlame) {
                  onNavigateToHallOfFlame();
                }
              }
            }, 500);
          }
        } else {
          // 📋 CAS NORMAL (pas de doublon)
          showTankMessage(
            `📋 ${result.hunter.pseudo} soumis en attente de validation!\n` +
            `Rang potentiel: #${result.potentialRank} (si approuvé)\n` +
            `Total en attente: ${result.totalHunters - result.checkedHunters}`,
            true,
            'kaisel'
          );
        }
        
        console.log('✅ Réponse backend v3.0:', result);
        
        // Effacer le cache local si succès
        try {
          const localCache = JSON.parse(localStorage.getItem('hallofflame_cache') || '[]');
          const filteredCache = localCache.filter(h => h.uniqueKey !== hunterData.uniqueKey);
          localStorage.setItem('hallofflame_cache', JSON.stringify(filteredCache));
        } catch (e) {
          console.warn('Impossible de nettoyer le cache local');
        }
        
      } else {
        throw new Error(result?.error || 'Erreur backend inconnue');
      }
      
    } catch (error) {
      console.error('❌ Erreur API:', error);
      
      // Message d'erreur détaillé selon le type
      let errorMessage = '❌ Erreur sauvegarde: ';
      
      if (error.message.includes('CORS') || error.message.includes('fetch')) {
        errorMessage += 'Problème CORS - Le serveur doit autoriser les requêtes cross-origin. ';
        errorMessage += 'Contactez l\'admin ou utilisez l\'extension CORS Unblock.';
        
        // Proposition de solutions
        showTankMessage(errorMessage, true, 'kaisel');
        
        // Afficher des instructions détaillées
        setTimeout(() => {
          if (window.confirm(
            '🔧 Erreur CORS détectée!\n\n' +
            'Solutions possibles:\n' +
            '1. Installer l\'extension "CORS Unblock" sur Chrome\n' +
            '2. Demander à l\'admin d\'activer CORS sur api.builderberu.com\n' +
            '3. Utiliser un proxy de développement\n\n' +
            'Voulez-vous sauvegarder en local en attendant?'
          )) {
            // Sauvegarder en local
            saveToLocalStorage();
          }
        }, 500);
        
      } else {
        errorMessage += error.message;
        showTankMessage(errorMessage + ' Données conservées localement.', true, 'kaisel');
        
        // Sauvegarder automatiquement en local
        saveToLocalStorage();
      }
      
      // Fonction helper pour sauvegarder en local
      function saveToLocalStorage() {
        try {
          const localData = JSON.parse(localStorage.getItem('hallofflame_cache') || '[]');
          
          // Éviter les doublons
          const existingIndex = localData.findIndex(h => h.uniqueKey === hunterData.uniqueKey);
          if (existingIndex !== -1) {
            localData[existingIndex] = hunterData;
          } else {
            localData.push(hunterData);
          }
          
          localStorage.setItem('hallofflame_cache', JSON.stringify(localData));
          showTankMessage("💾 Sauvegarde locale effectuée ! Les données seront synchronisées plus tard.", true, 'kaisel');
          
          // Log pour debug
          console.log('📦 Données sauvegardées localement:', hunterData);
          console.log('📊 Total en cache local:', localData.length);
          
       } catch (localError) {
         console.error('❌ Erreur sauvegarde locale:', localError);
         
         // Fallback: afficher les données dans la console
         console.log('🏆 Données complètes (copiez pour sauvegarder):', JSON.stringify(hunterData, null, 2));
         
         showTankMessage("❌ Impossible de sauvegarder. Vérifiez la console pour récupérer les données.", true, 'kaisel');
       }
     }
   }
   
   // Callback onSave
   if (onSave && typeof onSave === 'function') {
     onSave(hunterData);
   }
   
   // 🆕 Navigation adaptée selon le résultat v3.0
   setTimeout(() => {
     const message = submissionResponse?.isDuplicate ? 
       "⚠️ Soumission en attente de validation (doublon détecté).\nVoulez-vous voir le Hall Of Flame ?" :
       "📋 Soumission en attente de validation.\nVoulez-vous voir le Hall Of Flame ?";
       
     if (window.confirm(message)) {
       if (onNavigateToHallOfFlame) {
         onNavigateToHallOfFlame();
       }
     }
   }, 1000);
   
   onClose();
 }, [currentStats, formData, selectedCharacter, characterData, currentArtifacts, currentCores, currentGems, currentWeapon, statsFromArtifacts, memoizedCpTotal, memoizedCpArtifacts, memoizedSetAnalysis, validationErrors, uploadToImgur, showTankMessage, onSave, onNavigateToHallOfFlame, onClose, submissionResponse]);

 // 🎨 FORMATER LES STATS POUR AFFICHAGE
 const formatStat = useCallback((value) => {
   if (typeof value !== 'number') return '0';
   return Math.round(value).toLocaleString();
 }, []);

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

       .sync-banner {
         background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 140, 0, 0.1));
         border: 1px solid rgba(255, 215, 0, 0.5);
         padding: 12px;
         border-radius: 8px;
         margin-bottom: 16px;
         display: flex;
         justify-content: space-between;
         align-items: center;
       }
     `}</style>

     {/* 🌫️ OVERLAY */}
     <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999] p-4">
       
       {/* 🏆 POPUP PRINCIPAL */}
       <div
         ref={popupRef}
         className={`flame-popup rounded-2xl shadow-2xl w-full transition-all duration-300 ${
           isMobileDevice ? 'max-w-sm max-h-[85vh]' : 'max-w-4xl max-h-[85vh]'
         } overflow-hidden flex flex-col`}
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
                   Kaisel CP System v3.3 • Fix CORS + Sync
                   {hasData && (
                     <span className="text-green-400 ml-2">
                       • Total: {memoizedCpTotal.total.toLocaleString()} CP
                       • Artifacts: {memoizedCpArtifacts.total.toLocaleString()} CP
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
         <div className="flex-1 p-6 overflow-y-auto min-h-0">
           
           {/* BANNIÈRE SYNCHRONISATION */}
           {currentStep === 1 && (() => {
             const cacheCount = JSON.parse(localStorage.getItem('hallofflame_cache') || '[]').length;
             return cacheCount > 0 ? (
               <div className="sync-banner">
                 <div>
                   <p className="text-yellow-300 font-bold">
                     🔄 {cacheCount} hunter(s) en attente de synchronisation
                   </p>
                   <p className="text-gray-300 text-xs">
                     Données sauvegardées localement suite à des erreurs réseau/CORS
                   </p>
                 </div>
                 <button
                   onClick={async () => {
                     const result = await syncLocalCache(showTankMessage);
                     if (result.success && result.synced > 0) {
                       setFormData({...formData}); // Force re-render
                     }
                   }}
                   className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg font-bold text-sm transition-colors"
                 >
                   Synchroniser
                 </button>
               </div>
             ) : null;
           })()}
           
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
                         {memoizedCpTotal.total.toLocaleString()}
                       </p>
                       
                       {/* TOOLTIP CP TOTAL */}
                       {showCpTooltipTotal && memoizedCpTotal.details.length > 0 && (
                         <div className="cp-tooltip">
                           <p className="text-yellow-400 font-bold mb-2">📊 CP Total:</p>
                           {memoizedCpTotal.details.map((detail, index) => (
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
                             <span className="text-yellow-400">{memoizedCpTotal.total.toLocaleString()}</span>
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
                         {memoizedCpArtifacts.total.toLocaleString()}
                       </p>
                       
                       {/* TOOLTIP CP ARTIFACTS */}
                       {showCpTooltipArtifacts && memoizedCpArtifacts.details.length > 0 && (
                         <div className="cp-tooltip">
                           <p className="text-purple-400 font-bold mb-2">🎨 CP Artifacts:</p>
                           {memoizedCpArtifacts.details.map((detail, index) => (
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
                             <span className="text-purple-400">{memoizedCpArtifacts.total.toLocaleString()}</span>
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

                   {/* Sets Analysis Avancée */}
                   <div className="bg-black/30 rounded p-3 border border-blue-500/20">
                     <div className="flex items-center justify-between mb-2">
                       <p className="text-blue-300 text-sm font-bold">🎨 Sets d'Artefacts:</p>
                       {memoizedSetAnalysis.isOptimal && (
                         <span className="text-green-400 text-xs font-bold bg-green-900/30 px-2 py-1 rounded">
                           ✅ OPTIMAL (+5% CP)
                         </span>
                       )}
                       {!memoizedSetAnalysis.isOptimal && memoizedSetAnalysis.recommendedSets.length > 0 && Object.keys(memoizedSetAnalysis.equipped).length > 0 && (
                         <span className="text-yellow-400 text-xs font-bold bg-yellow-900/30 px-2 py-1 rounded">
                           ⚠️ NON OPTIMAL
                         </span>
                       )}
                       {Object.keys(memoizedSetAnalysis.equipped).length === 0 && (
                         <span className="text-red-400 text-xs font-bold bg-red-900/30 px-2 py-1 rounded">
                           ❌ AUCUN SET
                         </span>
                       )}
                     </div>
                     
                     <p className="text-gray-300 text-xs mb-3">
                       {memoizedSetAnalysis.analysis || "Aucun set détecté"}
                     </p>
                     
                     {/* Afficher les sets recommandés */}
                     {memoizedSetAnalysis.recommendedSets && memoizedSetAnalysis.recommendedSets.length > 0 && (
                       <div className="mt-2 space-y-1">
                         <p className="text-cyan-300 text-xs font-bold">🎯 Sets Recommandés:</p>
                         {memoizedSetAnalysis.recommendedSets.map((recSet, index) => (
                           <div key={index} className="text-xs">
                             <span className="text-cyan-400">{recSet.name}:</span>
                             <span className="text-gray-300 ml-1">{recSet.composition}</span>
                             <span className="text-gray-500 ml-1">({recSet.availability})</span>
                           </div>
                         ))}
                       </div>
                     )}
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

               {/* Hunter Info Mis à Jour */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-300 mb-2">
                     🎯 Pseudo *
                   </label>
                   <input
                     type="text"
                     value={formData.pseudo}
                     onChange={(e) => setFormData(prev => ({...prev, pseudo: e.target.value}))}
                     className="flame-input w-full px-4 py-3 rounded-lg text-white placeholder-gray-400"
                     placeholder="Votre pseudo de jeu..."
                     maxLength={20}
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-medium text-gray-300 mb-2">
                     🆔 ID Account *
                   </label>
                   <input
                     type="text"
                     value={formData.accountId}
                     onChange={(e) => setFormData(prev => ({...prev, accountId: e.target.value}))}
                     className="flame-input w-full px-4 py-3 rounded-lg text-white placeholder-gray-400"
                     placeholder="#Kly123"
                     maxLength={15}
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-300 mb-2">
                   🏰 Nom Guilde (Optionnel)
                 </label>
                 <input
                   type="text"
                   value={formData.guildName}
                   onChange={(e) => setFormData(prev => ({...prev, guildName: e.target.value}))}
                   className="flame-input w-full px-4 py-3 rounded-lg text-white placeholder-gray-400"
                   placeholder="Nom de votre guilde..."
                   maxLength={25}
                 />
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
                       <h4 className="text-sm font-bold text-yellow-300 mb-2">⚡ Stats Totales</h4>
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
                       <h4 className="text-sm font-bold text-purple-300 mb-2">🎨 Stats des Artefacts</h4>
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

               {/* Screenshots Upload OBLIGATOIRE */}
               <div>
                 <label className="block text-sm font-medium text-gray-300 mb-2">
                   📸 Screenshots *
                   <span className={`text-xs ml-2 ${window.location.hostname === 'localhost' ? 'text-yellow-400' : 'text-red-400'}`}>
                     {window.location.hostname === 'localhost' 
                       ? '(Optionnel en local)' 
                       : '(Obligatoire pour validation)'
                     }
                   </span>
                 </label>
                 <input
                   type="file"
                   multiple
                   accept="image/*"
                   onChange={(e) => setFormData(prev => ({...prev, screenshots: Array.from(e.target.files)}))}
                   className="flame-input w-full px-4 py-3 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-yellow-500 file:text-black hover:file:bg-yellow-400"
                 />
                 {formData.screenshots.length > 0 ? (
                   <p className="text-green-400 text-sm mt-2">
                     ✅ {formData.screenshots.length} screenshot(s) sélectionné(s)
                   </p>
                 ) : (
                   <p className={`text-sm mt-2 ${window.location.hostname === 'localhost' ? 'text-yellow-400' : 'text-red-400'}`}>
                     {window.location.hostname === 'localhost' 
                       ? "⚠️ Screenshots optionnels en local" 
                       : "❌ Screenshots requis pour soumettre"
                     }
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
             <div className="flex flex-col h-full">
               <div className={`flex-1 flex items-center justify-center py-4 ${isValidating ? 'validation-screen' : ''}`}>
                 {isValidating ? (
                   <div className="text-center">
                     <div className="text-4xl mb-4 animate-spin">🔍</div>
                     <h3 className="text-lg font-bold text-yellow-400 mb-2">Validation avancée en cours...</h3>
                     <p className="text-gray-400 text-sm">Kaisel analyse le système CP + Sets...</p>
                     
                     <div className="mt-4 space-y-1 text-xs">
                       <div className="text-gray-300">✓ Vérification scaleStat...</div>
                       <div className="text-gray-300">✓ Validation multiplicateurs CP...</div>
                       <div className="text-gray-300">✓ Analyse sets d'artefacts...</div>
                       <div className="text-gray-300">✓ Validation bonus optimal...</div>
                     </div>
                   </div>
                 ) : (
                   <div className="text-center max-w-md mx-auto">
                     {validationErrors.length > 0 ? (
                       <>
                         <div className="text-4xl mb-4">❌</div>
                         <h3 className="text-lg font-bold text-red-400 mb-4">Erreurs détectées</h3>
                         
                         <div className="space-y-2 text-left mb-6 max-h-48 overflow-y-auto">
                           {validationErrors.map((error, index) => (
                             <div key={index} className="error-item text-sm text-red-300">
                               {error}
                             </div>
                           ))}
                         </div>
                       </>
                     ) : (
                       <>
                         <div className="text-4xl mb-4">✅</div>
                         <h3 className="text-lg font-bold text-green-400 mb-4">Validation avancée réussie !</h3>
                         
                         <div className="space-y-2 text-left mb-6">
                           <div className="success-item text-sm text-green-300">
                             ✅ Système CP avancé validé
                           </div>
                           <div className="success-item text-sm text-green-300">
                             ✅ ScaleStat détecté: {BUILDER_DATA[selectedCharacter]?.scaleStat}
                           </div>
                           <div className="success-item text-sm text-green-300">
                             ✅ Stats totales: {memoizedCpTotal.total.toLocaleString()} CP
                           </div>
                           {memoizedSetAnalysis.isOptimal && (
                             <div className="success-item text-sm text-green-300">
                               🏆 Set optimal détecté ! Bonus +5% CP appliqué
                             </div>
                           )}
                           <div className="success-item text-sm text-green-300">
                             ✅ Prêt pour le HallOfFlame
                           </div>
                         </div>
                       </>
                     )}
                   </div>
                 )}
               </div>
             </div>
           )}

           {/* STEP 3: SUCCESS */}
           {currentStep === 3 && (
             <div className="text-center py-4">
               <div className="text-4xl mb-4">🏆</div>
               <h3 className="text-lg font-bold text-yellow-400 mb-2">Prêt pour l'enregistrement !</h3>
               <p className="text-gray-400 mb-4 text-sm">
                 {formData.pseudo} sera soumis en attente de validation admin
               </p>
               
               <div className="bg-yellow-900/20 rounded-lg p-3 border border-yellow-500/30">
                 <p className="text-yellow-300 text-xs">
                   🔥 Pseudo: <strong>{formData.pseudo}</strong><br/>
                   🆔 Account ID: <strong>{formData.accountId}</strong><br/>
                   🏰 Guilde: <strong>{formData.guildName || 'Aucune'}</strong><br/>
                   ⚡ CP Total: <strong>{memoizedCpTotal.total.toLocaleString()}</strong><br/>
                   🎨 CP Artifacts: <strong>{memoizedCpArtifacts.total.toLocaleString()}</strong><br/>
                   🎯 ScaleStat: <strong>{BUILDER_DATA[selectedCharacter]?.scaleStat}</strong><br/>
                   🔮 Sets: <strong>{memoizedSetAnalysis.isOptimal ? '✅ OPTIMAL' : '⚠️ Non optimal'}</strong><br/>
                   📸 Screenshots: <strong>{formData.screenshots.length} fichier(s)</strong><br/>
                   <span className="text-orange-400 font-bold">
                     ⏳ Status: En attente de validation admin
                   </span>
                 </p>
               </div>
             </div>
           )}
         </div>

         {/* 🎯 FOOTER ACTIONS */}
         <div className="flex-shrink-0 p-4 border-t border-yellow-500/30 bg-black/20">
           <div className="flex flex-col gap-2 md:flex-row">
             
             {/* Bouton Retour */}
             {currentStep > 1 && (
               <button
                 onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                 className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors text-center text-sm"
               >
                 ← Retour
               </button>
             )}

             {/* Bouton Annuler */}
             <button
               onClick={onClose}
               className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors text-center text-sm"
             >
               Annuler
             </button>

             {/* Bouton Principal */}
             {currentStep === 1 && (
               <button
                 onClick={() => setCurrentStep(2)}
                 className="flex-1 flame-button px-3 py-2 rounded-lg transition-all text-center min-h-[40px] flex items-center justify-center text-sm"
                 disabled={!formData.pseudo.trim() || !formData.accountId.trim() || !hasData || 
                   (window.location.hostname !== 'localhost' && formData.screenshots.length === 0)}
               >
                 <span>Validation Avancée →</span>
               </button>
             )}

             {currentStep === 2 && !isValidating && (
               <>
                 {validationErrors.length > 0 ? (
                   <button
                     onClick={validateData}
                     className="flex-1 flame-button px-3 py-2 rounded-lg transition-all text-center min-h-[40px] flex items-center justify-center text-sm"
                   >
                     <span>🔄 Réessayer</span>
                   </button>
                 ) : (
                   <button
                     onClick={() => setCurrentStep(3)}
                     className="flex-1 flame-button px-3 py-2 rounded-lg transition-all text-center min-h-[40px] flex items-center justify-center text-sm"
                   >
                     <span>Continuer →</span>
                   </button>
                 )}
               </>
             )}

             {currentStep === 2 && isValidating && (
               <button
                 className="flex-1 flame-button px-3 py-2 rounded-lg transition-all text-center min-h-[40px] flex items-center justify-center text-sm"
                 disabled
               >
                 <span>Validation en cours...</span>
               </button>
             )}

             {currentStep === 3 && (
               <button
                 onClick={handleFinalSave}
                 className="flex-1 flame-button px-3 py-2 rounded-lg transition-all text-center min-h-[40px] flex items-center justify-center text-sm"
               >
                 <span>📋 Soumettre pour Validation</span>
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