// 🧠 SYSTÈME D'ANALYSE INTELLIGENTE BÉRU - BY KAISEL 🔥
// Pour l'action 'stat_optimization' dans BeruInteractionMenu
import { BUILDER_DATA } from '../data/builder_data';
import { BeruReportSystem, GoldenPapyrusIcon } from '../components/BeruReportSystem';

// 🎯 FONCTION PRINCIPALE D'ANALYSE INTELLIGENTE - MODIFIÉE POUR RAPPORT
// 🐛 VERSION DEBUG - À remplacer dans performIntelligentAnalysis

// 🧠 ANALYSE SÉQUENTIELLE BÉRU - BY KAISEL
// REMPLACE performIntelligentAnalysis dans BeruIntelligentAnalysis.js

export const performIntelligentAnalysis = (selectedCharacter, currentArtifacts, showTankMessage, onClose, onReportGenerated) => {
    const hunterData = BUILDER_DATA[selectedCharacter];
    if (!hunterData) {
        showTankMessage("🤔 Je ne connais pas ce Hunter... Aide-moi à apprendre !", true, 'beru');
        return;
    }

    // 🔍 ÉTAPE 1 : VÉRIFICATIONS DE BASE
    const artifactCount = Object.values(currentArtifacts || {}).filter(artifact => {
        return artifact && (artifact.set || artifact.mainStat);
    }).length;
    
    if (artifactCount === 0) {
        showTankMessage(`😤 **${hunterData.name.toUpperCase()} N'EST MÊME PAS BUILDÉ !**\n\nVa d'abord construire ton Hunter ! 🔨\n\n💡 Utilise le Builder pour équiper au moins quelques artefacts !`, true, 'beru');
        return;
    }
    
    if (artifactCount < 4) {
        const missingSlots = ['weapon', 'helmet', 'armor', 'necklace', 'ring', 'earrings', 'boots', 'gloves']
            .filter(slot => !currentArtifacts[slot] || !currentArtifacts[slot].name)
            .map(slot => slot === 'necklace' ? 'Collier' : 
                         slot === 'ring' ? 'Bague' : 
                         slot === 'earrings' ? 'Boucles' : 
                         slot === 'boots' ? 'Bottes' : 
                         slot === 'gloves' ? 'Gants' : 
                         slot === 'helmet' ? 'Casque' : 
                         slot === 'armor' ? 'Armure' : 'Arme');
        
        showTankMessage(`⚠️ **SEULEMENT ${artifactCount}/8 ARTEFACTS !**\n\n📋 Il te manque : ${missingSlots.slice(0, 3).join(', ')}\n\n🎯 Remplis au moins 4 slots pour une analyse sérieuse !`, true, 'beru');
        return;
    }

    // 🧠 DÉMARRAGE DE L'ANALYSE SÉQUENTIELLE
    startSequentialAnalysis(hunterData, currentArtifacts, showTankMessage, onReportGenerated);
};

// 🎯 FONCTION SÉQUENTIELLE PRINCIPALE
const startSequentialAnalysis = (hunterData, currentArtifacts, showTankMessage, onReportGenerated) => {
    
    // 🎬 MESSAGE INITIAL
    showTankMessage(`🧠 **ANALYSE INTELLIGENTE BÉRU**\n\n🔍 Inspection de ${hunterData.name}...\n⚡ Calculs en cours...`, true, 'beru');
    
    // ⏱️ ATTENDRE 3 SECONDES puis lancer la séquence
    setTimeout(() => {
        runAnalysisStep(1, hunterData, currentArtifacts, showTankMessage, onReportGenerated);
    }, 3000);
};

// 🔄 FONCTION RÉCURSIVE POUR CHAQUE ÉTAPE
const runAnalysisStep = (stepNumber, hunterData, currentArtifacts, showTankMessage, onReportGenerated) => {
    console.log(`🧠 Kaisel: Lancement étape ${stepNumber}`);
    
    let message = '';
    let nextStepDelay = 2000; // délai par défaut entre les étapes
    
    switch(stepNumber) {
        case 1:
            message = generateStep1Message(hunterData, currentArtifacts);
            nextStepDelay = 2500;
            break;
        case 2:
            message = generateStep2Message(hunterData, currentArtifacts);
            nextStepDelay = 2500;
            break;
        case 3:
            message = generateStep3Message(hunterData, currentArtifacts);
            nextStepDelay = 2500;
            break;
        case 4:
            message = generateStep4Message(hunterData, currentArtifacts);
            nextStepDelay = 2500;
            break;
        case 5:
            message = generateStep5Message(hunterData, currentArtifacts);
            nextStepDelay = 1000; // Moins d'attente avant le papyrus
            break;
        default:
            console.log("🧠 Kaisel: Analyse terminée");
            return;
    }
    
    // 🎭 AFFICHER LE MESSAGE AVEC CALLBACK
    showTankMessageWithCallback(message, () => {
        if (stepNumber === 5) {
            // 🔥 GÉNÉRER LE RAPPORT APRÈS L'ÉTAPE 5
            setTimeout(() => {
                const detailedReport = generateDetailedReport(hunterData, currentArtifacts);
                if (onReportGenerated) {
                    onReportGenerated(detailedReport);
                }
            }, 1000);
        } else {
            // 🔄 PASSER À L'ÉTAPE SUIVANTE
            setTimeout(() => {
                runAnalysisStep(stepNumber + 1, hunterData, currentArtifacts, showTankMessage, onReportGenerated);
            }, nextStepDelay);
        }
    }, showTankMessage);
};

// 🎭 WRAPPER POUR showTankMessage AVEC CALLBACK
const showTankMessageWithCallback = (message, onComplete, originalShowTankMessage) => {
    // 📝 CALCULER LA DURÉE D'ÉCRITURE (comme dans dytextAnimate)
    const calculateWritingDuration = (text) => {
        let duration = 0;
        for (let char of text) {
            if (char === '.') duration += 400;
            else if (char === ',') duration += 200;
            else duration += 35; // délai par caractère (même que ChibiBubble)
        }
        return duration + 500; // + marge de sécurité
    };
    
    const writingDuration = calculateWritingDuration(message);
    console.log(`🧠 Kaisel: Message va prendre ${writingDuration}ms à s'écrire`);
    
    // 🎯 AFFICHER LE MESSAGE
    originalShowTankMessage(message, true, 'beru');
    
    // ⏱️ ATTENDRE LA FIN D'ÉCRITURE
    setTimeout(() => {
        console.log("🧠 Kaisel: Message terminé, callback lancé");
        onComplete();
    }, writingDuration);
};

// 🎯 GÉNÉRATEURS DE MESSAGES (utilise les fonctions existantes)
const generateStep1Message = (hunterData, currentArtifacts) => {
    const setAnalysis = analyzeArtifactSets(hunterData, currentArtifacts);
    
    let message = `🎯 **ÉTAPE 1 : ANALYSE DES SETS**\n\n`;
    
    if (setAnalysis.optimalSetCount >= 4) {
        message += `✅ **SET OPTIMAL !** ${setAnalysis.dominantSet} (${setAnalysis.optimalSetCount}/8)\n`;
        message += `💪 Excellent choix pour ${hunterData.name} !`;
    } else if (setAnalysis.optimalSetCount >= 2) {
        message += `⚠️ **SET PARTIEL** ${setAnalysis.dominantSet} (${setAnalysis.optimalSetCount}/8)\n`;
        message += `🎯 Continue le farm pour compléter le set !`;
    } else {
        message += `❌ **SET NON-OPTIMAL !**\n`;
        message += `🔥 **RECOMMANDÉ :** ${hunterData.gameModes[Object.keys(hunterData.gameModes)[0]].recommendedSet}\n`;
        message += `📈 Priorité : changer les artefacts hors-set !`;
    }
    
    return message;
};

const generateStep2Message = (hunterData, currentArtifacts) => {
    const artifactScores = calculateArtifactScores(hunterData, currentArtifacts);
    const weakArtifacts = artifactScores.filter(artifact => artifact.score < 70).slice(0, 3);
    
    let message = `⚠️ **ÉTAPE 2 : ARTEFACTS À AMÉLIORER**\n\n`;
    
    if (weakArtifacts.length === 0) {
        message += `🌟 **BUILD EXCELLENT !**\n`;
        message += `💎 Tous tes artefacts sont solides !`;
    } else {
        message += `🚨 **${weakArtifacts.length} ARTEFACTS PROBLÉMATIQUES :**\n\n`;
        weakArtifacts.forEach((artifact, index) => {
            message += `${index + 1}. **${artifact.slot.toUpperCase()}** (${artifact.score}/100)\n`;
            message += `   ${artifact.issues.join(' • ')}\n\n`;
        });
    }
    
    return message;
};

const generateStep3Message = (hunterData, currentArtifacts) => {
    const artifactScores = calculateArtifactScores(hunterData, currentArtifacts);
    const worstArtifact = artifactScores.sort((a, b) => a.score - b.score)[0];
    
    let message = `🚨 **ÉTAPE 3 : PRIORITÉ ABSOLUE**\n\n`;
    
    if (worstArtifact.score >= 70) {
        message += `✨ **AUCUNE PRIORITÉ CRITIQUE !**\n`;
        message += `🎯 Ton build est déjà très solide !`;
    } else {
        message += `🎯 **FOCUS SUR : ${worstArtifact.slot.toUpperCase()}**\n`;
        message += `📊 Score catastrophique : ${worstArtifact.score}/100\n\n`;
        message += `🔥 **PROBLÈMES CRITIQUES :**\n`;
        worstArtifact.issues.forEach(issue => {
            message += `• ${issue}\n`;
        });
        message += `\n💡 **Change cet artefact EN PRIORITÉ !**`;
    }
    
    return message;
};

const generateStep4Message = (hunterData, currentArtifacts) => {
    const substatAnalysis = analyzeSubstats(hunterData, currentArtifacts);
    
    let message = `📊 **ÉTAPE 4 : ANALYSE DES SUBSTATS**\n\n`;
    
    if (substatAnalysis.criticalMissing.length > 0) {
        message += `❌ **SUBSTATS CRITIQUES MANQUANTES :**\n`;
        substatAnalysis.criticalMissing.forEach(stat => {
            message += `• ${stat}\n`;
        });
        message += `\n🎯 Focus sur ces substats lors du farm !`;
    } else {
        message += `✅ **SUBSTATS SOLIDES !**\n`;
        message += `💎 Bonne répartition des stats importantes !`;
    }
    
    if (substatAnalysis.wastedStats.length > 0) {
        message += `\n\n⚠️ **SUBSTATS INUTILES DÉTECTÉES :**\n`;
        substatAnalysis.wastedStats.forEach(stat => {
            message += `• ${stat}\n`;
        });
    }
    
    return message;
};

const generateStep5Message = (hunterData, currentArtifacts) => {
    const artifactScores = calculateArtifactScores(hunterData, currentArtifacts);
    const globalScore = Math.round(artifactScores.reduce((sum, art) => sum + art.score, 0) / artifactScores.length);
    
    let message = `🎯 **PLAN D'ACTION BÉRU ULTIME**\n\n`;
    message += `📈 **SCORE GLOBAL : ${globalScore}/100**\n\n`;
    
    if (globalScore >= 85) {
        message += `🌟 **BUILD LÉGENDAIRE !**\n`;
        message += `👑 Tu maîtrises ${hunterData.name} parfaitement !\n`;
        message += `💡 Focus maintenant sur les substats parfaites !`;
    } else if (globalScore >= 70) {
        message += `💪 **BUILD SOLIDE !**\n`;
        message += `🎯 Quelques ajustements te mèneront au sommet !\n`;
        message += `🔧 Améliore les artefacts < 70 points.`;
    } else if (globalScore >= 50) {
        message += `⚡ **BUILD EN CONSTRUCTION !**\n`;
        message += `🛠️ Tu es sur la bonne voie !\n`;
        message += `🎯 Priorise le set optimal et les main stats.`;
    } else {
        message += `🚨 **RECONSTRUCTION NÉCESSAIRE !**\n`;
        message += `🔥 Focus sur les bases : sets et main stats !\n`;
        message += `💪 Ne lâche rien, le farm va payer !`;
    }
    
    message += `\n\n🤖 **Béru t'accompagne dans ton ascension !** 😈`;
    message += `\n\n📜 **Rapport détaillé en préparation...**`;
    
    return message;
};

// (Garde toutes les autres fonctions existantes : calculateArtifactScores, analyzeArtifactSets, etc.)
// 🎯 ÉTAPE 1 : ANALYSE DES SETS
const analyzeStep1_Sets = (hunterData, currentArtifacts, showTankMessage) => {
    const setAnalysis = analyzeArtifactSets(hunterData, currentArtifacts);
    
    let message = `🎯 **ÉTAPE 1 : ANALYSE DES SETS**\n\n`;
    
    if (setAnalysis.optimalSetCount >= 4) {
        message += `✅ **SET OPTIMAL !** ${setAnalysis.dominantSet} (${setAnalysis.optimalSetCount}/8)\n`;
        message += `💪 Excellent choix pour ${hunterData.name} !`;
    } else if (setAnalysis.optimalSetCount >= 2) {
        message += `⚠️ **SET PARTIEL** ${setAnalysis.dominantSet} (${setAnalysis.optimalSetCount}/8)\n`;
        message += `🎯 Continue le farm pour compléter le set !`;
    } else {
        message += `❌ **SET NON-OPTIMAL !**\n`;
        message += `🔥 **RECOMMANDÉ :** ${hunterData.gameModes[Object.keys(hunterData.gameModes)[0]].recommendedSet}\n`;
        message += `📈 Priorité : changer les artefacts hors-set !`;
    }
    
    showTankMessage(message, true, 'beru');
};

// 🎯 ÉTAPE 2 : ARTEFACTS À AMÉLIORER
const analyzeStep2_WeakArtifacts = (hunterData, currentArtifacts, showTankMessage) => {
    const artifactScores = calculateArtifactScores(hunterData, currentArtifacts);
    const weakArtifacts = artifactScores.filter(artifact => artifact.score < 70).slice(0, 3);
    
    let message = `⚠️ **ÉTAPE 2 : ARTEFACTS À AMÉLIORER**\n\n`;
    
    if (weakArtifacts.length === 0) {
        message += `🌟 **BUILD EXCELLENT !**\n`;
        message += `💎 Tous tes artefacts sont solides !`;
    } else {
        message += `🚨 **${weakArtifacts.length} ARTEFACTS PROBLÉMATIQUES :**\n\n`;
        weakArtifacts.forEach((artifact, index) => {
            message += `${index + 1}. **${artifact.slot.toUpperCase()}** (${artifact.score}/100)\n`;
            message += `   ${artifact.issues.join(' • ')}\n\n`;
        });
    }
    
    showTankMessage(message, true, 'beru');
};

// 🎯 ÉTAPE 3 : PRIORITÉ CRITIQUE
const analyzeStep3_CriticalPriority = (hunterData, currentArtifacts, showTankMessage) => {
    const artifactScores = calculateArtifactScores(hunterData, currentArtifacts);
    const worstArtifact = artifactScores.sort((a, b) => a.score - b.score)[0];
    
    let message = `🚨 **ÉTAPE 3 : PRIORITÉ ABSOLUE**\n\n`;
    
    if (worstArtifact.score >= 70) {
        message += `✨ **AUCUNE PRIORITÉ CRITIQUE !**\n`;
        message += `🎯 Ton build est déjà très solide !`;
    } else {
        message += `🎯 **FOCUS SUR : ${worstArtifact.slot.toUpperCase()}**\n`;
        message += `📊 Score catastrophique : ${worstArtifact.score}/100\n\n`;
        message += `🔥 **PROBLÈMES CRITIQUES :**\n`;
        worstArtifact.issues.forEach(issue => {
            message += `• ${issue}\n`;
        });
        message += `\n💡 **Change cet artefact EN PRIORITÉ !**`;
    }
    
    showTankMessage(message, true, 'beru');
};

// 🎯 ÉTAPE 4 : ANALYSE DES SUBSTATS
const analyzeStep4_SubstatsAnalysis = (hunterData, currentArtifacts, showTankMessage) => {
    const substatAnalysis = analyzeSubstats(hunterData, currentArtifacts);
    
    let message = `📊 **ÉTAPE 4 : ANALYSE DES SUBSTATS**\n\n`;
    
    if (substatAnalysis.criticalMissing.length > 0) {
        message += `❌ **SUBSTATS CRITIQUES MANQUANTES :**\n`;
        substatAnalysis.criticalMissing.forEach(stat => {
            message += `• ${stat}\n`;
        });
        message += `\n🎯 Focus sur ces substats lors du farm !`;
    } else {
        message += `✅ **SUBSTATS SOLIDES !**\n`;
        message += `💎 Bonne répartition des stats importantes !`;
    }
    
    if (substatAnalysis.wastedStats.length > 0) {
        message += `\n\n⚠️ **SUBSTATS INUTILES DÉTECTÉES :**\n`;
        substatAnalysis.wastedStats.forEach(stat => {
            message += `• ${stat}\n`;
        });
    }
    
    showTankMessage(message, true, 'beru');
};

// 🎯 ÉTAPE 5 : PLAN D'ACTION BÉRU - MODIFIÉE POUR GÉNÉRER LE RAPPORT
const analyzeStep5_ActionPlan = (hunterData, currentArtifacts, showTankMessage, onReportGenerated) => {
    const artifactScores = calculateArtifactScores(hunterData, currentArtifacts);
    const globalScore = Math.round(artifactScores.reduce((sum, art) => sum + art.score, 0) / artifactScores.length);
    
    let message = `🎯 **PLAN D'ACTION BÉRU ULTIME**\n\n`;
    message += `📈 **SCORE GLOBAL : ${globalScore}/100**\n\n`;
    
    if (globalScore >= 85) {
        message += `🌟 **BUILD LÉGENDAIRE !**\n`;
        message += `👑 Tu maîtrises ${hunterData.name} parfaitement !\n`;
        message += `💡 Focus maintenant sur les substats parfaites !`;
    } else if (globalScore >= 70) {
        message += `💪 **BUILD SOLIDE !**\n`;
        message += `🎯 Quelques ajustements te mèneront au sommet !\n`;
        message += `🔧 Améliore les artefacts < 70 points.`;
    } else if (globalScore >= 50) {
        message += `⚡ **BUILD EN CONSTRUCTION !**\n`;
        message += `🛠️ Tu es sur la bonne voie !\n`;
        message += `🎯 Priorise le set optimal et les main stats.`;
    } else {
        message += `🚨 **RECONSTRUCTION NÉCESSAIRE !**\n`;
        message += `🔥 Focus sur les bases : sets et main stats !\n`;
        message += `💪 Ne lâche rien, le farm va payer !`;
    }
    
    message += `\n\n🤖 **Béru t'accompagne dans ton ascension !** 😈`;
    message += `\n\n📜 **Rapport détaillé disponible !**`;
    
    showTankMessage(message, true, 'beru');
    
    // 🔥 GÉNÉRER LE RAPPORT APRÈS LE MESSAGE
    setTimeout(() => {
        const detailedReport = generateDetailedReport(hunterData, currentArtifacts);
        if (onReportGenerated) {
            onReportGenerated(detailedReport);
        }
    }, 1000);
};

// 📊 FONCTION DE GÉNÉRATION DU RAPPORT COMPLET - NOUVELLE
export const generateDetailedReport = (hunterData, currentArtifacts) => {
    const artifactScores = calculateArtifactScores(hunterData, currentArtifacts);
    const globalScore = Math.round(artifactScores.reduce((sum, art) => sum + art.score, 0) / artifactScores.length);
    const setAnalysis = analyzeArtifactSets(hunterData, currentArtifacts);
    const substatAnalysis = analyzeSubstats(hunterData, currentArtifacts);
    
    // 🔍 Trouver les artefacts faibles et le pire
    const weakArtifacts = artifactScores.filter(artifact => artifact.score < 70);
    const worstArtifact = artifactScores.sort((a, b) => a.score - b.score)[0];
    
    // 🎯 Générer le plan d'action
    let actionPlan = '';
    if (globalScore >= 85) {
        actionPlan = `🌟 BUILD LÉGENDAIRE !\n👑 Tu maîtrises ${hunterData.name} parfaitement !\n💡 Focus maintenant sur les substats parfaites !`;
    } else if (globalScore >= 70) {
        actionPlan = `💪 BUILD SOLIDE !\n🎯 Quelques ajustements te mèneront au sommet !\n🔧 Améliore les artefacts < 70 points.`;
    } else if (globalScore >= 50) {
        actionPlan = `⚡ BUILD EN CONSTRUCTION !\n🛠️ Tu es sur la bonne voie !\n🎯 Priorise le set optimal et les main stats.`;
    } else {
        actionPlan = `🚨 RECONSTRUCTION NÉCESSAIRE !\n🔥 Focus sur les bases : sets et main stats !\n💪 Ne lâche rien, le farm va payer !`;
    }
    
    return {
        id: Date.now(), // ID unique
        timestamp: new Date().toLocaleString('fr-FR'),
        hunterName: hunterData.name,
        globalScore,
        artifactCount: Object.values(currentArtifacts || {}).filter(artifact => artifact && artifact.name).length,
        setAnalysis: {
            dominantSet: setAnalysis.dominantSet,
            optimalSetCount: setAnalysis.optimalSetCount,
            allSets: setAnalysis.allSets
        },
        weakArtifacts: weakArtifacts.map(artifact => ({
            slot: artifact.slot,
            score: artifact.score,
            issues: artifact.issues
        })),
        criticalPriority: worstArtifact.score < 70 ? {
            slot: worstArtifact.slot,
            score: worstArtifact.score,
            issues: worstArtifact.issues
        } : null,
        substatAnalysis: {
            criticalMissing: substatAnalysis.criticalMissing,
            wastedStats: substatAnalysis.wastedStats
        },
        actionPlan,
        artifactDetails: artifactScores
    };
};

// 🧮 FONCTION DE CALCUL DES SCORES D'ARTEFACTS
const calculateArtifactScores = (hunterData, currentArtifacts) => {
    const scores = [];
    const recommendedSet = hunterData.gameModes[Object.keys(hunterData.gameModes)[0]].recommendedSet;
    const recommendedMainStats = hunterData.artifactSets[Object.keys(hunterData.artifactSets)[0]]?.mainStats || {};
    
    Object.entries(currentArtifacts).forEach(([slot, artifact]) => {
        if (!artifact || !artifact.name) return;
        
        let score = 0;
        let issues = [];
        
        // 🎯 MAIN STAT (40 points)
        const expectedMainStat = recommendedMainStats[slot];
        if (expectedMainStat && artifact.mainStat === expectedMainStat) {
            score += 40;
        } else if (expectedMainStat) {
            issues.push(`❌ Main: ${artifact.mainStat} → ${expectedMainStat}`);
        }
        
        // 🎯 SET (20 points)
        if (artifact.set === recommendedSet) {
            score += 20;
        } else {
            issues.push(`❌ Set: ${artifact.set} → ${recommendedSet}`);
        }
        
        // 🎯 SUBSTATS (40 points max - 10 par substat utile)
        const usefulSubstats = hunterData.optimizationPriority.slice(0, 4);
        if (artifact.substats) {
            Object.keys(artifact.substats).forEach(substat => {
                if (usefulSubstats.includes(substat)) {
                    score += 10;
                }
            });
        }
        
        // 🔍 ANALYSE DU SCALE STAT
        const scaleStat = hunterData.scaleStat;
        const scaleStatSubstat = scaleStat === 'Attack' ? 'Additional Attack' :
                                scaleStat === 'Defense' ? 'Additional Defense' :
                                scaleStat === 'HP' ? 'Additional HP' : null;
        
        if (scaleStatSubstat && (!artifact.substats || !artifact.substats[scaleStatSubstat])) {
            issues.push(`⚠️ Manque ${scaleStat}%`);
        }
        
        scores.push({
            slot,
            artifact: artifact.name,
            score: Math.min(100, score),
            issues
        });
    });
    
    return scores;
};

// 🎯 ANALYSE DES SETS
const analyzeArtifactSets = (hunterData, currentArtifacts) => {
    const sets = {};
    Object.values(currentArtifacts).forEach(artifact => {
        if (artifact?.set) {
            sets[artifact.set] = (sets[artifact.set] || 0) + 1;
        }
    });
    
    const dominantSet = Object.keys(sets).reduce((a, b) => sets[a] > sets[b] ? a : b, null);
    const optimalSet = hunterData.gameModes[Object.keys(hunterData.gameModes)[0]].recommendedSet;
    
    return {
        dominantSet,
        optimalSetCount: sets[optimalSet] || 0,
        allSets: sets
    };
};

// 📊 ANALYSE DES SUBSTATS
const analyzeSubstats = (hunterData, currentArtifacts) => {
    const priorities = hunterData.optimizationPriority;
    const currentSubstats = new Set();
    const wastedStats = [];
    
    Object.values(currentArtifacts).forEach(artifact => {
        if (artifact?.substats) {
            Object.keys(artifact.substats).forEach(substat => {
                currentSubstats.add(substat);
                if (!priorities.includes(substat) && substat !== 'Critical Hit Rate' && substat !== 'Critical Hit Damage') {
                    wastedStats.push(substat);
                }
            });
        }
    });
    
    const criticalMissing = priorities.slice(0, 3).filter(stat => !currentSubstats.has(stat));
    
    return {
        criticalMissing,
        wastedStats: [...new Set(wastedStats)]
    };
};