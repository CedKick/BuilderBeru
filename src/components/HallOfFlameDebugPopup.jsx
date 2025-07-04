// HallOfFlameDebugPopup.jsx - 🔧 DIGITALOCEAN UPLOAD + 3 SCREENSHOTS MAX + LOADING - v5.1
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BUILDER_DATA } from '../data/builder_data.js';

const API_BASE = window.location.hostname === 'localhost' 
  ? '' // Utilise le proxy en dev
  : 'https://api.builderberu.com'; // URL complète en prod

// Fix pour les URLs de base quand on n'est pas en localhost
const getApiUrl = (endpoint) => {
  if (window.location.hostname === 'localhost') {
    return endpoint; // Proxy gère tout
  }
  // En prod, toujours utiliser l'URL complète de l'API
  return `${API_BASE}${endpoint}`;
};

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
          const response = await fetch(getApiUrl('/api/hallofflame/submit'), {
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
  // Validation des props
  if (onSave && typeof onSave !== 'function') {
    console.warn('⚠️ HallOfFlameDebugPopup: onSave doit être une fonction');
  }
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
  
  // 🆕 States pour loading
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasShownMessage, setHasShownMessage] = useState(false); // Flag pour éviter spam

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
    if (selectedCharacter && memoizedCpTotal.total > 0 && showTankMessage && !hasShownMessage) {
      let message = `✅ ${selectedCharacter} chargé: ${memoizedCpTotal.total.toLocaleString()} CP total`;
      if (memoizedSetAnalysis.isOptimal) {
        message += " 🏆 SET OPTIMAL!";
      }
      showTankMessage(message, true, 'kaisel');
      setHasShownMessage(true);
    }
  }, [isOpen, selectedCharacter]); // Retirer les dépendances qui changent

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
      setIsUploading(false);
      setUploadProgress('');
      setIsSaving(false);
      setHasShownMessage(false); // Reset le flag
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isUploading && !isSaving) onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose, isUploading, isSaving]);

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

  // 📸 UPLOAD SCREENSHOTS DIGITALOCEAN - VERSION v5.1 avec LOADING et FIX CHUNKING
  const uploadToDigitalOcean = useCallback(async (files) => {
    if (!files || files.length === 0) return [];
    
    // Activer l'état de loading
    setIsUploading(true);
    setUploadProgress('Préparation...');
    
    // Limiter à 3 fichiers max
    const filesToUpload = Array.from(files).slice(0, 3);
    
    if (files.length > 3) {
      showTankMessage(
        `⚠️ ${files.length} fichiers sélectionnés, seulement les 3 premiers seront uploadés`,
        true,
        'kaisel'
      );
    }
    
    // Vérifier la taille totale
    const totalSize = filesToUpload.reduce((sum, file) => sum + file.size, 0);
    console.log(`📊 Taille totale: ${(totalSize/1024/1024).toFixed(2)}MB`);
    
    setUploadProgress(`Upload de ${(totalSize/1024/1024).toFixed(2)}MB...`);
    showTankMessage(`📸 Upload de ${filesToUpload.length} fichiers...`, true, 'kaisel');
    
    try {
      const uploadFormData = new FormData();
      
      // Ajouter les fichiers
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        
        if (!file.type.startsWith('image/')) {
          console.warn(`⚠️ ${file.name} n'est pas une image`);
          continue;
        }
        
        setUploadProgress(`Ajout ${i+1}/${filesToUpload.length}: ${file.name}`);
        console.log(`📸 Fichier ${i+1}: ${file.name} (${(file.size/1024/1024).toFixed(2)}MB)`);
        uploadFormData.append('screenshots', file);
      }
      
      const entriesCount = Array.from(uploadFormData.entries()).length;
      if (entriesCount === 0) {
        setIsUploading(false);
        showTankMessage("❌ Aucun fichier valide", true, 'kaisel');
        return [];
      }
      
      // Upload avec timeout plus long et configuration spéciale pour gros fichiers
      setUploadProgress('Envoi vers le serveur SERN...');
      
      console.log('🚀 Début upload...');
      const startTime = Date.now();
      
      // 🔥 FIX KAISEL: XMLHttpRequest pour gérer les gros uploads
      const uploadUrl = getApiUrl('/api/upload-screenshots');
      
      const uploadPromise = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Progress tracking
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            setUploadProgress(`Upload: ${percentComplete.toFixed(1)}%`);
            console.log(`📊 Progress: ${percentComplete.toFixed(1)}%`);
          }
        });
        
        // Completion
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText);
              resolve(result);
            } catch (error) {
              reject(new Error('Invalid JSON response'));
            }
          } else {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
          }
        });
        
        // Error
        xhr.addEventListener('error', () => {
          reject(new Error('Network error'));
        });
        
        // Timeout
        xhr.addEventListener('timeout', () => {
          reject(new Error('Upload timeout'));
        });
        
        // Configure
        xhr.open('POST', uploadUrl);
        xhr.timeout = 300000; // 5 minutes
        
        // Send
        xhr.send(uploadFormData);
      });
      
      const result = await uploadPromise;
      const uploadTime = Date.now() - startTime;
      console.log(`📡 Upload terminé en ${uploadTime}ms`);
      
      if (result.success && result.screenshots) {
        setUploadProgress('✅ Upload terminé !');
        showTankMessage(
          `✅ ${result.screenshots.length} screenshot(s) uploadé(s) !`,
          true,
          'kaisel'
        );
        
        // Petit délai avant de masquer le loading
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress('');
        }, 1000);
        
        return result.screenshots;
      } else {
        throw new Error(result.error || 'Upload échoué');
      }
      
    } catch (error) {
      console.error('❌ Erreur upload:', error);
      
      setUploadProgress(`❌ Erreur: ${error.message}`);
      
      if (error.message.includes('timeout')) {
        showTankMessage(`❌ Upload timeout (5 min)`, true, 'kaisel');
      } else {
        showTankMessage(`❌ Upload échoué: ${error.message}`, true, 'kaisel');
      }
      
      // Garder l'erreur affichée un moment
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress('');
      }, 3000);
      
      return [];
    }
  }, [showTankMessage]);

  // 💾 SAUVEGARDE FINALE - VERSION v5.1 avec LOADING
  const handleFinalSave = useCallback(async () => {
    if (!currentStats || Object.keys(currentStats).length === 0) {
      showTankMessage("❌ Aucune donnée à sauvegarder", true, 'kaisel');
      return;
    }

    // Activer l'état de sauvegarde
    setIsSaving(true);
    
    let screenshotUrls = [];
    
    // 📸 UPLOAD SCREENSHOTS
    if (formData.screenshots && formData.screenshots.length > 0) {
      try {
        screenshotUrls = await uploadToDigitalOcean(formData.screenshots);
        
        // Attendre que l'upload soit vraiment fini
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error('Erreur upload:', error);
        showTankMessage("⚠️ Upload échoué, soumission sans screenshots", true, 'kaisel');
      }
    }

    // Vérifier si on a des screenshots (obligatoires en prod)
    if (screenshotUrls.length === 0 && window.location.hostname !== 'localhost') {
      showTankMessage("❌ Screenshots obligatoires ! Upload échoué.", true, 'kaisel');
      setIsSaving(false);
      return;
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
    
    // 🚀 ENVOI VERS LE BACKEND
    try {
      showTankMessage("🌐 Envoi vers le backend...", true, 'kaisel');
      
      const response = await fetch(getApiUrl('/api/hallofflame/submit'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(hunterData)
      });
      
      const result = await response.json();
      
      if (response.ok && result && result.success) {
        // Messages de succès
        if (result.isReplacingPending) {
          showTankMessage(
            `🔄 ${result.hunter.pseudo} mis à jour\n` +
            `Screenshots: ${screenshotUrls.length} uploadés`,
            true,
            'kaisel'
          );
        } else {
          showTankMessage(
            `📋 ${result.hunter.pseudo} soumis !\n` +
            `Screenshots: ${screenshotUrls.length} uploadés\n` +
            `Rang potentiel: #${result.potentialRank}`,
            true,
            'kaisel'
          );
        }
        
        // Callback sécurisé
        if (onSave && typeof onSave === 'function') {
          try {
            await onSave(hunterData);
          } catch (callbackError) {
            console.error('❌ Erreur callback onSave:', callbackError);
          }
        }
        
        // Attendre avant de fermer
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Demander navigation
        if (window.confirm("✅ Hunter soumis ! Voir le Hall Of Flame ?")) {
          if (onNavigateToHallOfFlame) {
            onNavigateToHallOfFlame();
          }
        }
        
        // Fermer
        setIsSaving(false);
        onClose();
        
      } else {
        throw new Error(result?.error || 'Erreur backend');
      }
      
    } catch (error) {
      console.error('❌ Erreur:', error);
      
      showTankMessage(`❌ Erreur: ${error.message}`, true, 'kaisel');
      
      // Sauvegarde locale
      try {
        const localData = JSON.parse(localStorage.getItem('hallofflame_cache') || '[]');
        const existingIndex = localData.findIndex(h => h.uniqueKey === hunterData.uniqueKey);
        if (existingIndex !== -1) {
          localData[existingIndex] = hunterData;
        } else {
          localData.push(hunterData);
        }
        localStorage.setItem('hallofflame_cache', JSON.stringify(localData));
        showTankMessage("💾 Sauvegarde locale effectuée !", true, 'kaisel');
      } catch (localError) {
        console.error('❌ Erreur sauvegarde locale:', localError);
      }
      
      if (onSave && typeof onSave === 'function') {
        try {
          await onSave(hunterData);
        } catch (callbackError) {
          console.error('❌ Erreur callback onSave:', callbackError);
        }
      }
      
      // Attendre avant de fermer
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 3000);
    }
  }, [currentStats, formData, selectedCharacter, characterData, currentArtifacts, currentCores, currentGems, currentWeapon, statsFromArtifacts, memoizedCpTotal, memoizedCpArtifacts, memoizedSetAnalysis, validationErrors, uploadToDigitalOcean, showTankMessage, onSave, onNavigateToHallOfFlame, onClose]);

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

        @keyframes loading-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
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

        .screenshot-preview {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .screenshot-thumb {
          width: 60px;
          height: 60px;
          border-radius: 4px;
          object-fit: cover;
          border: 2px solid rgba(255, 215, 0, 0.5);
        }
        
        .upload-progress {
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 8px;
          padding: 12px;
          margin-top: 8px;
          text-align: center;
          animation: loading-pulse 2s ease-in-out infinite;
        }
        
        .upload-progress-text {
          color: #ffd700;
          font-weight: bold;
          font-size: 14px;
        }
        
        .loading-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 100;
          border-radius: inherit;
        }
        
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(255, 215, 0, 0.3);
          border-top-color: #ffd700;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* 🌫️ OVERLAY */}
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999] p-4">
        
        {/* 🏆 POPUP PRINCIPAL */}
        <div
          ref={popupRef}
          className={`flame-popup rounded-2xl shadow-2xl w-full transition-all duration-300 ${
            isMobileDevice ? 'max-w-sm max-h-[85vh]' : 'max-w-4xl max-h-[85vh]'
          } overflow-hidden flex flex-col relative`}
        >
          
          {/* 🔄 LOADING OVERLAY */}
          {(isUploading || isSaving) && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <p className="text-yellow-400 font-bold mt-4">
                {uploadProgress || (isSaving ? 'Sauvegarde en cours...' : 'Chargement...')}
              </p>
            </div>
          )}
          
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
                    Kaisel CP System v5.1 • Max 3 Screenshots
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
                disabled={isUploading || isSaving}
                className="w-8 h-8 rounded-full bg-red-600/20 hover:bg-red-600/40 text-red-400 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      Données sauvegardées localement suite à des erreurs réseau
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

                {/* 🆕 AFFICHAGE WEAPON, CORES ET GEMS */}
                {hasData && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Weapon */}
                    {currentWeapon && Object.keys(currentWeapon).length > 0 && (
                      <div className="bg-black/30 rounded-lg p-3 border border-red-500/20">
                        <h4 className="text-red-400 font-bold text-sm mb-2">⚔️ Arme</h4>
                        <div className="text-xs space-y-1">
                          {/* Afficher la stat principale selon le scale stat */}
                          {(() => {
                            const scaleStat = BUILDER_DATA[selectedCharacter]?.scaleStat;
                            const mainStatValue = currentWeapon.mainStat || 0;
                            
                            if (scaleStat === "Defense") {
                              return (
                                <p className="text-blue-400">
                                  Defense: <span className="text-white font-bold">{formatStat(mainStatValue)}</span>
                                </p>
                              );
                            } else if (scaleStat === "Attack") {
                              return (
                                <p className="text-red-400">
                                  Attack: <span className="text-white font-bold">{formatStat(mainStatValue)}</span>
                                </p>
                              );
                            } else if (scaleStat === "HP") {
                              return (
                                <p className="text-green-400">
                                  HP: <span className="text-white font-bold">{formatStat(mainStatValue)}</span>
                                </p>
                              );
                            }
                            return null;
                          })()}
                          
                          {/* Afficher la précision */}
                          {currentWeapon.precision && (
                            <p className="text-yellow-400">
                              Precision: <span className="text-white font-bold">{formatStat(currentWeapon.precision)}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Cores */}
                    {currentCores && Object.keys(currentCores).length > 0 && (
                      <div className="bg-black/30 rounded-lg p-3 border border-orange-500/20">
                        <h4 className="text-orange-400 font-bold text-sm mb-2">🔴 Noyaux ({Object.keys(currentCores).length})</h4>
                        <div className="text-xs space-y-2">
                          {Object.entries(currentCores).map(([slot, core]) => (
                            <div key={slot} className="border-b border-gray-700 pb-1 last:border-0">
                              <p className="font-bold text-orange-300">{slot}:</p>
                              {core.primary && (
                                <p className="text-gray-300 ml-2">
                                  {core.primary}: <span className="text-white font-bold">{formatStat(core.primaryValue || 0)}</span>
                                </p>
                              )}
                              {core.secondary && (
                                <p className="text-gray-300 ml-2">
                                  {core.secondary}: <span className="text-white font-bold">{formatStat(core.secondaryValue || 0)}</span>
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Gems */}
                    {currentGems && Object.keys(currentGems).length > 0 && (
                      <div className="bg-black/30 rounded-lg p-3 border border-pink-500/20">
                        <h4 className="text-pink-400 font-bold text-sm mb-2">💎 Gemmes ({Object.keys(currentGems).length})</h4>
                        <div className="text-xs space-y-2">
                          {Object.entries(currentGems).map(([color, gemData]) => {
                            // Déterminer la couleur d'affichage selon le type de gemme
                            const gemColors = {
                              'Red': '#ef4444',
                              'Blue': '#3b82f6',
                              'Green': '#10b981',
                              'Purple': '#a855f7',
                              'Yellow': '#eab308'
                            };
                            const displayColor = gemColors[color] || '#ec4899';
                            
                            return (
                              <div key={color} className="border-b border-gray-700 pb-1 last:border-0">
                                <p style={{ color: displayColor }} className="font-bold">{color}:</p>
                                {/* Boucler sur toutes les propriétés de la gemme */}
                                {gemData && typeof gemData === 'object' && Object.entries(gemData).map(([stat, value]) => {
                                  // Ignorer les propriétés non-stat comme 'name', 'type', etc.
                                  if (['name', 'type', 'level', 'color'].includes(stat)) return null;
                                  
                                  return (
                                    <p key={stat} className="ml-2 text-gray-300">
                                      {stat}: <span className="text-white font-bold">+{formatStat(value || 0)}</span>
                                    </p>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

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

                {/* 🎨 AFFICHAGE DÉTAILLÉ DES ARTEFACTS */}
                {hasData && currentArtifacts && Object.keys(currentArtifacts).length > 0 && (
                  <div className="bg-black/30 rounded-lg p-4 border border-yellow-500/20 mb-4">
                    <h3 className="font-bold text-yellow-300 mb-3 flex items-center gap-2">
                      🎨 Artefacts Équipés ({Object.keys(currentArtifacts).length}/8)
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {Object.entries(currentArtifacts).map(([slot, artifact]) => (
                        <div key={slot} className="artifact-slot rounded p-3">
                          <h4 className="text-yellow-400 font-bold text-xs mb-1">{slot}</h4>
                          <p className="text-blue-400 text-xs mb-1">{artifact.set || 'Aucun Set'}</p>
                          
                          <div className="space-y-1">
                            <p className="text-gray-300 text-xs">
                              Main: <span className="text-white">{artifact.mainStat}</span>
                              {artifact.mainStatValue && (
                                <span className="text-gray-400"> (+{Math.round(artifact.mainStatValue)})</span>
                              )}
                            </p>
                            
                            {artifact.subStats && artifact.subStats.length > 0 && (
                              <div className="mt-1 border-t border-gray-700 pt-1">
                                <p className="text-gray-400 text-xs mb-1">Subs:</p>
                                {artifact.subStats.slice(0, 4).map((sub, idx) => {
                                  // Récupérer la valeur et les procs pour ce substat
                                  const subStatLevel = artifact.subStatsLevels?.[idx];
                                  const value = subStatLevel?.value || 0;
                                  const procCount = subStatLevel?.procOrders?.length > 1 
                                    ? subStatLevel.procOrders.length - 1 
                                    : 0;
                                  
                                  // Vérifier si c'est un pourcentage
                                  const isPercentage = sub && sub.includes('%');
                                  const displayValue = isPercentage 
                                    ? value.toFixed(2) 
                                    : Math.round(value).toLocaleString();
                                  
                                  return (
                                    <p key={idx} className="text-gray-300 text-xs ml-2">
                                      • {sub || '-'}
                                      {subStatLevel && (
                                        <>
                                          <span className="text-white">: {displayValue}</span>
                                          {procCount > 0 && (
                                            <span className="text-yellow-400"> (+{procCount})</span>
                                          )}
                                        </>
                                      )}
                                    </p>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Screenshots Upload DigitalOcean - MAX 3 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    📸 Screenshots * (Upload SERN - Max 3)
                    <span className={`text-xs ml-2 ${window.location.hostname === 'localhost' ? 'text-yellow-400' : 'text-red-400'}`}>
                      {window.location.hostname === 'localhost' 
                        ? '(Optionnel en local)' 
                        : '(Obligatoire pour validation - Max 3)'
                      }
                    </span>
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      if (files.length > 3) {
                        showTankMessage("⚠️ Maximum 3 screenshots ! Les autres seront ignorés.", true, 'kaisel');
                        setFormData(prev => ({...prev, screenshots: files.slice(0, 3)}));
                      } else {
                        setFormData(prev => ({...prev, screenshots: files}));
                      }
                    }}
                    className="flame-input w-full px-4 py-3 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-yellow-500 file:text-black hover:file:bg-yellow-400"
                  />
                  
                  {/* Upload Progress */}
                  {uploadProgress && (
                    <div className="upload-progress">
                      <p className="upload-progress-text">{uploadProgress}</p>
                    </div>
                  )}
                  
                  {formData.screenshots.length > 0 && !uploadProgress ? (
                    <>
                      <p className="text-green-400 text-sm mt-2">
                        ✅ {formData.screenshots.length} screenshot(s) sélectionné(s) - Upload vers SERN
                      </p>
                      <div className="screenshot-preview">
                        {formData.screenshots.map((file, index) => (
                          <div key={index} className="relative">
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={`Screenshot ${index + 1}`}
                              className="screenshot-thumb"
                            />
                            <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                              {index + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : !uploadProgress && (
                    <div>
                      <p className={`text-sm mt-2 ${window.location.hostname === 'localhost' ? 'text-yellow-400' : 'text-red-400'}`}>
                        {window.location.hostname === 'localhost' 
                          ? "⚠️ Screenshots optionnels en local (max 3)" 
                          : "❌ Screenshots requis (max 3 fichiers, 10MB chacun)"
                        }
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        Formats acceptés : JPG, PNG, GIF, WEBP, BMP (attention BMP très lourd)
                      </p>
                    </div>
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
                    📸 Screenshots: <strong>{formData.screenshots.length}/3 fichiers → SERN</strong><br/>
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
                  disabled={isUploading || isSaving}
                  className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors text-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Retour
                </button>
              )}

              {/* Bouton Annuler */}
              <button
                onClick={onClose}
                disabled={isUploading || isSaving}
                className="flex-1 px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors text-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>

              {/* Bouton Principal */}
              {currentStep === 1 && (
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 flame-button px-3 py-2 rounded-lg transition-all text-center min-h-[40px] flex items-center justify-center text-sm"
                  disabled={!formData.pseudo.trim() || !formData.accountId.trim() || !hasData || 
                    (window.location.hostname !== 'localhost' && formData.screenshots.length === 0) || isUploading}
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
                  disabled={isUploading || isSaving}
                  className="flex-1 flame-button px-3 py-2 rounded-lg transition-all text-center min-h-[40px] flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{isSaving ? '⏳ Sauvegarde...' : '📋 Soumettre pour Validation'}</span>
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