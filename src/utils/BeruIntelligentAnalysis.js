// 🧠 SYSTÈME D'ANALYSE INTELLIGENTE BÉRU - VERSION FINALE BY KAISEL 🔥
// UTILISE LES SCORES CALCULÉS PAR ArtifactScoreBadge - AUCUNE DIVERGENCE !

import { BUILDER_DATA } from '../data/builder_data';

// 🎯 FONCTION PRINCIPALE - VERSION FINALE
export const performIntelligentAnalysis = (
    selectedCharacter, 
    currentArtifacts, 
    showTankMessage, 
    onClose, 
    onReportGenerated,
    substatsMinMaxByIncrements,
    existingScores // ← NOUVEAU : scores des ArtifactScoreBadge
) => {
    const hunterData = BUILDER_DATA[selectedCharacter];
    if (!hunterData) {
        showTankMessage("🤔 Je ne connais pas ce Hunter... Aide-moi à apprendre !", true, 'beru');
        return;
    }

    console.log("🔥 KAISEL FINAL: existingScores reçus:", existingScores);

    // 🔍 VÉRIFICATIONS DE BASE
    const artifactCount = Object.values(currentArtifacts || {}).filter(artifact => {
        return artifact && (artifact.set || artifact.mainStat);
    }).length;
    
    if (artifactCount === 0) {
        showTankMessage(`😤 **${hunterData.name.toUpperCase()} N'EST MÊME PAS BUILDÉ !**\n\nVa d'abord construire ton Hunter ! 🔨`, true, 'beru');
        return;
    }
    
    if (artifactCount < 4) {
        showTankMessage(`⚠️ **SEULEMENT ${artifactCount}/8 ARTEFACTS !**\n\n🎯 Remplis au moins 4 slots pour une analyse sérieuse !`, true, 'beru');
        return;
    }

    // 🚀 ANALYSE AVEC SCORES EXISTANTS
    startFinalAnalysis(hunterData, currentArtifacts, existingScores, showTankMessage, onReportGenerated);
};

// ✅ FONCTION CORRIGÉE - getFinalArtifactScores
const getFinalArtifactScores = (currentArtifacts, existingScores) => {
    console.log("🔥 KAISEL FINAL: Compilation des scores existants");
    console.log("🔍 DEBUG currentArtifacts reçus:", currentArtifacts);
    
    const scores = [];
    const allSlots = ['Helmet', 'Chest', 'Gloves', 'Boots', 'Necklace', 'Bracelet', 'Ring', 'Earrings'];
    
    allSlots.forEach(slot => {
        const artifact = currentArtifacts[slot];
        const existingScore = existingScores[slot] || 0;
        
        console.log(`🔍 DEBUG ${slot}:`, {
            artifact: artifact,
            set: artifact?.set,
            mainStat: artifact?.mainStat,
            score: existingScore
        });
        
        if (artifact && (artifact.set || artifact.mainStat)) {
            scores.push({
                slot,
                score: existingScore,
                artifact: artifact.set || 'No Set', // ← CORRECTION ICI !
                setName: artifact.set, // ← AJOUTER POUR CLARTÉ
                hasMainStat: !!artifact.mainStat,
                hasSet: !!artifact.set,
                isEmpty: false
            });
        } else {
            scores.push({
                slot,
                score: 0,
                artifact: 'Empty',
                setName: null,
                hasMainStat: false,
                hasSet: false,
                isEmpty: true
            });
        }
    });
    
    console.log("🔥 KAISEL FINAL: Scores compilés avec sets:", scores.map(s => `${s.slot}: ${s.setName} (${s.score})`));
    return scores;
};

// 🔍 ANALYSE SIMPLIFIÉE FINALE
const analyzeFinalScores = (scores, hunterData) => {
    const filledSlots = scores.filter(s => !s.isEmpty);
    const emptySlots = scores.filter(s => s.isEmpty);
    const weakArtifacts = filledSlots.filter(s => s.score < 70).sort((a, b) => a.score - b.score);
    const strongArtifacts = filledSlots.filter(s => s.score >= 100);
    
    const globalScore = filledSlots.length > 0 
        ? Math.round(filledSlots.reduce((sum, s) => sum + s.score, 0) / filledSlots.length)
        : 0;
    
    return {
        globalScore,
        maxScore: Math.max(...filledSlots.map(s => s.score), 0),
        weakArtifacts: weakArtifacts.slice(0, 2), // 2 pires
        strongArtifacts,
        emptySlots,
        filledCount: filledSlots.length,
        totalSlots: 8
    };
};

// ✅ FONCTION CORRIGÉE - analyzeFinalSetStatus
const analyzeFinalSetStatus = (scores, hunterData) => {
    console.log("🔍 DEBUG analyzeFinalSetStatus - scores reçus:", scores);
    
    const sets = {};
    const setsDetails = []; // Pour debug
    
    // 🔥 CORRECTION : Utiliser setName au lieu de artifact
    scores.filter(s => !s.isEmpty && s.setName).forEach(score => {
        const setName = score.setName; // ← CORRECTION !
        sets[setName] = (sets[setName] || 0) + 1;
        setsDetails.push(`${score.slot}: ${setName}`);
    });
    
    console.log("🔍 DEBUG Sets trouvés:", sets);
    console.log("🔍 DEBUG Sets détails:", setsDetails);
    
    const recommendedSet = hunterData.gameModes[Object.keys(hunterData.gameModes)[0]]?.recommendedSet;
    const optimalSetCount = sets[recommendedSet] || 0;
    const dominantSet = Object.keys(sets).length > 0 
        ? Object.keys(sets).reduce((a, b) => sets[a] > sets[b] ? a : b) 
        : null;
    
    console.log("🔍 DEBUG Analyse finale:", {
        recommendedSet,
        optimalSetCount,
        dominantSet,
        setDistribution: sets
    });
    
    return {
        recommendedSet,
        optimalSetCount,
        dominantSet,
        setDistribution: sets,
        setsDetails // Pour debug
    };
};

// 🎯 ANALYSE SÉQUENTIELLE FINALE
const startFinalAnalysis = (hunterData, currentArtifacts, existingScores, showTankMessage, onReportGenerated) => {
    showTankMessage(`🧠 **ANALYSE BÉRU FINALE**\n\n🔍 Inspection de ${hunterData.name}...\n⚡ Utilisation des scores ArtifactScoreBadge...\n🎯 **GARANTIE:** Aucune divergence de scoring !`, true, 'beru');
    
    setTimeout(() => {
        runFinalStep(1, hunterData, currentArtifacts, existingScores, showTankMessage, onReportGenerated);
    }, 3000);
};

const runFinalStep = (stepNumber, hunterData, currentArtifacts, existingScores, showTankMessage, onReportGenerated) => {
    console.log(`🔥 KAISEL FINAL: === ÉTAPE ${stepNumber} ===`);
    
    const scores = getFinalArtifactScores(currentArtifacts, existingScores);
    const analysis = analyzeFinalScores(scores, hunterData);
    const setStatus = analyzeFinalSetStatus(scores, hunterData);
    
    let message = '';
    
    switch(stepNumber) {
        case 1:
            message = generateFinalStep1(analysis, setStatus, hunterData);
            break;
        case 2:
            message = generateFinalStep2(analysis, hunterData);
            break;
        case 3:
            message = generateFinalStep3(analysis, setStatus, hunterData);
            break;
        default:
            // 📜 GÉNÉRATION DU RAPPORT FINAL
            setTimeout(() => {
                const report = generateFinalReport(hunterData, scores, analysis, setStatus);
                if (onReportGenerated) {
                    onReportGenerated(report);
                }
            }, 1000);
            return;
    }
    
    showTankMessageWithCallback(message, () => {
        setTimeout(() => {
            runFinalStep(stepNumber + 1, hunterData, currentArtifacts, existingScores, showTankMessage, onReportGenerated);
        }, 2000);
    }, showTankMessage);
};

// 🔥 KAISEL: CALLBACK HELPER (IDENTIQUE)
const showTankMessageWithCallback = (message, onComplete, originalShowTankMessage) => {
    const calculateWritingDuration = (text) => {
        let duration = 0;
        for (let char of text) {
            if (char === '.') duration += 400;
            else if (char === ',') duration += 200;
            else duration += 35;
        }
        return duration + 1000;
    };
    
    const writingDuration = calculateWritingDuration(message);
    originalShowTankMessage(message, true, 'beru');
    
    setTimeout(() => {
        try {
            onComplete();
        } catch (error) {
            console.error("🔥 ERREUR dans onComplete:", error);
        }
    }, writingDuration);
};

// 🎯 MESSAGES FINAUX
const generateFinalStep1 = (analysis, setStatus, hunterData) => {
    let message = `🎯 **ÉTAPE 1 : ÉTAT GÉNÉRAL**\n\n`;
    
    message += `📊 **SCORE GLOBAL : ${analysis.globalScore}/100**\n`;
    message += `📈 **MEILLEUR ARTEFACT : ${analysis.maxScore} points**\n`;
    message += `📦 **ARTEFACTS ÉQUIPÉS : ${analysis.filledCount}/8**\n\n`;
    
    if (analysis.emptySlots.length > 0) {
        message += `❌ **SLOTS VIDES (${analysis.emptySlots.length}) :**\n`;
        analysis.emptySlots.slice(0, 3).forEach(slot => {
            message += `• ${slot.slot}\n`;
        });
        message += `\n🎯 **PRIORITÉ 1 : Équiper ces slots !**`;
    } else {
        message += `✅ **TOUS LES SLOTS ÉQUIPÉS !**\n`;
        message += `🔥 Excellent ! Passons à l'optimisation...`;
    }
    
    return message;
};

const generateFinalStep2 = (analysis, hunterData) => {
    let message = `⚠️ **ÉTAPE 2 : ARTEFACTS FAIBLES**\n\n`;
    
    if (analysis.weakArtifacts.length === 0) {
        message += `💎 **AUCUN ARTEFACT FAIBLE !**\n`;
        message += `✨ Tous tes artefacts ≥ 70 points !\n`;
        message += `🚀 Build excellent détecté !`;
    } else {
        message += `🚨 **${analysis.weakArtifacts.length} ARTEFACTS À AMÉLIORER :**\n\n`;
        
        analysis.weakArtifacts.forEach((artifact, index) => {
            message += `${index + 1}. **${artifact.slot}** : ${artifact.score} points\n`;
        });
        
        message += `\n🎯 **PRIORITÉ : Focus sur ces ${analysis.weakArtifacts.length} artefacts !**`;
        
        if (analysis.strongArtifacts.length > 0) {
            message += `\n\n🌟 **BONUS :** ${analysis.strongArtifacts.length} artefacts déjà excellents (≥100) !`;
        }
    }
    
    return message;
};

// ✅ MESSAGE CORRIGÉ - generateFinalStep3
const generateFinalStep3 = (analysis, setStatus, hunterData) => {
    let message = `🎯 **ÉTAPE 3 : PLAN D'ACTION FINAL**\n\n`;
    
    // 🎯 PRIORITÉ ABSOLUE
    if (analysis.emptySlots.length > 0) {
        message += `🚨 **PRIORITÉ ABSOLUE :** Équiper les ${analysis.emptySlots.length} slots vides\n\n`;
    } else if (analysis.weakArtifacts.length > 0) {
        const worstArtifact = analysis.weakArtifacts[0];
        message += `🎯 **PRIORITÉ 1 :** Remplacer ${worstArtifact.slot} (${worstArtifact.score} pts)\n\n`;
    } else {
        message += `✨ **OPTIMISATION FINE :** Build déjà excellent !\n\n`;
    }
    
    // 🔥 ANALYSE DES SETS CORRIGÉE
    message += `📦 **ANALYSE DES SETS :**\n`;
    
    if (Object.keys(setStatus.setDistribution).length === 0) {
        message += `⚠️ **AUCUN SET DÉTECTÉ !**\n`;
        message += `🎯 Assure-toi de sélectionner les sets sur tes artefacts !\n\n`;
    } else {
        message += `📋 **Sets actuels :**\n`;
        Object.entries(setStatus.setDistribution).forEach(([setName, count]) => {
            message += `• ${setName}: ${count} pièces\n`;
        });
        
        message += `\n• Set recommandé : ${setStatus.recommendedSet}\n`;
        message += `• Set dominant : ${setStatus.dominantSet || 'Aucun'}\n\n`;
        
        if (setStatus.optimalSetCount >= 6) {
            message += `💪 **SET EXCELLENT !** ${setStatus.optimalSetCount}/8 pièces optimales !`;
        } else if (setStatus.optimalSetCount >= 4) {
            message += `⚡ **SET CORRECT !** ${setStatus.optimalSetCount}/8 pièces. Continue le farm !`;
        } else if (setStatus.optimalSetCount >= 2) {
            message += `⚠️ **SET PARTIEL !** Seulement ${setStatus.optimalSetCount}/8. Priorité après optimisation scores !`;
        } else {
            message += `🚨 **SET À CONSTRUIRE !** Focus sur ${setStatus.recommendedSet} après avoir fixé les artefacts faibles !`;
        }
    }
    
    message += `\n\n📜 **Rapport détaillé final en préparation...**`;
    
    return message;
};
// 📜 RAPPORT FINAL
const generateFinalReport = (hunterData, scores, analysis, setStatus) => {
    console.log("🔥 KAISEL FINAL: Génération rapport final avec scores existants");
    
    // 🎯 KAISEL: PRIORITÉ SELON LES SLOTS VIDES D'ABORD !
    let actionPlan = '';
    
    if (analysis.emptySlots.length > 0) {
        // 🚨 PRIORITÉ ABSOLUE : SLOTS VIDES
        actionPlan = `🚨 **PRIORITÉ ABSOLUE : ${analysis.emptySlots.length} ARTEFACTS MANQUANTS !**\n\n`;
        actionPlan += `📋 **Slots à équiper d'urgence :**\n`;
        analysis.emptySlots.forEach(slot => {
            actionPlan += `• ${slot.slot}\n`;
        });
        actionPlan += `\n💡 **Béru recommande :** Équipe ces slots AVANT toute optimisation !\n`;
        actionPlan += `🎯 Un Hunter sans artefacts complets ne peut pas révéler son potentiel !`;
    } else if (analysis.globalScore >= 85) {
        actionPlan = `🌟 BUILD EXCELLENT !\n🎯 ${hunterData.name} est très bien optimisé !\n💡 Scores identiques aux badges affichés !`;
    } else if (analysis.globalScore >= 70) {
        actionPlan = `⚡ BUILD SOLIDE !\n🔧 Quelques améliorations possibles.\n💡 Focus sur les 2 artefacts les plus faibles !`;
    } else {
        actionPlan = `🚨 BUILD À AMÉLIORER !\n💪 Focus sur les priorités identifiées.\n💡 Optimise les artefacts avec scores <70 !`;
    }
    
    return {
        id: Date.now(),
        timestamp: new Date().toLocaleString('fr-FR'),
        hunterName: hunterData.name,
        globalScore: analysis.globalScore,
        maxScore: analysis.maxScore,
        enhancedAnalysis: false,
        unlimitedScoring: true,
        artifactCount: analysis.filledCount,
        
        // 🎯 DONNÉES FINALES
        emptySlots: analysis.emptySlots.map(s => s.slot),
        weakArtifacts: analysis.weakArtifacts.map(artifact => ({
            slot: artifact.slot,
            score: artifact.score,
            issues: [`Score: ${artifact.score}/100 (identique au badge)`]
        })),
        strongArtifacts: analysis.strongArtifacts.map(artifact => ({
            slot: artifact.slot,
            score: artifact.score
        })),
        
        setAnalysis: {
            recommendedSet: setStatus.recommendedSet,
            dominantSet: setStatus.dominantSet,
            optimalSetCount: setStatus.optimalSetCount,
            allSets: setStatus.setDistribution
        },
        
        criticalPriority: analysis.emptySlots.length > 0 ? {
            slot: analysis.emptySlots[0].slot,
            score: 0,
            issues: [`SLOT VIDE - ${analysis.emptySlots.length} artefacts manquants au total`],
            reason: `PRIORITÉ ABSOLUE : ${analysis.emptySlots.length} slots vides à équiper`,
            missingCount: analysis.emptySlots.length,
            missingSlots: analysis.emptySlots.map(s => s.slot)
        } : analysis.weakArtifacts.length > 0 ? {
            slot: analysis.weakArtifacts[0].slot,
            score: analysis.weakArtifacts[0].score,
            issues: [`Score le plus faible: ${analysis.weakArtifacts[0].score}/100`],
            reason: "Score le plus faible (identique au badge)"
        } : null,
        
        substatAnalysis: {
            criticalMissing: [], // Simplifié pour cette version
            wastedStats: []
        },
        
        actionPlan,
        artifactDetails: scores.filter(s => !s.isEmpty)
    };
};