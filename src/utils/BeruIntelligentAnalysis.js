// 📁 /utils/BeruIntelligentAnalysis.js - SYSTÈME IA COMPLET KAISEL 🧠
// VERSION FINALE - INTÉGRATION PARFAITE AVEC ArtifactScoreBadge

import { BUILDER_DATA } from '../data/builder_data';
import { getTheoreticalScore } from './statPriority';

// 🧠 ANALYSE SPÉCIFIQUE D'ARTEFACT DÉCLENCHÉE DEPUIS LE BADGE
export const performSpecificArtifactAnalysis = (
    artifactData, 
    hunter, 
    showTankMessage, 
    onClose, 
    substatsMinMaxByIncrements
) => {
    console.log("🧠 Béru démarre l'analyse spécifique d'artefact:", artifactData.title);

    // Phase 1: Annonce
    setTimeout(() => {
        showTankMessage(`🧠 Béru analyse ${artifactData.title} pour ${hunter.name}...`, true, 'beru');
    }, 100);

    // Phase 2: Analyse set (1.5s)
    setTimeout(() => {
        const setAnalysis = analyzeArtifactSet(artifactData, hunter);
        showTankMessage(`🎁 SET: ${setAnalysis.message}`, true, 'beru');
    }, 1500);

    // Phase 3: Analyse mainStat (3s)
    setTimeout(() => {
        const mainStatAnalysis = analyzeMainStatDetailed(artifactData, hunter);
        showTankMessage(`🎯 MAIN: ${mainStatAnalysis.message}`, true, 'beru');
    }, 3000);

    // Phase 4: Analyse substats (4.5s)
    setTimeout(() => {
        const subStatsAnalysis = analyzeSubStatsDetailed(artifactData, hunter, substatsMinMaxByIncrements);
        showTankMessage(`📈 SUBS: ${subStatsAnalysis.message}`, true, 'beru');
    }, 4500);

    // Phase 5: Analyse localStorage (6s)
    setTimeout(() => {
        const alternatives = findBetterAlternativesInStorage(artifactData, hunter, substatsMinMaxByIncrements);
        if (alternatives.length > 0) {
            const best = alternatives[0];
            showTankMessage(
                `🔍 ALTERNATIVE: "${best.name}" (+${best.improvement} points) avec ${best.mainStat} et ${best.topSubstats.join(', ')}`, 
                true, 
                'beru'
            );
        } else {
            showTankMessage(`✅ OPTIMAL: Aucun artefact ${artifactData.title} meilleur trouvé !`, true, 'beru');
        }
    }, 6000);

    // Phase 6: Conclusion et génération rapport (7.5s)
    setTimeout(() => {
        const finalScore = getTheoreticalScore(hunter, artifactData, substatsMinMaxByIncrements);
        let conclusion = '';
        
        if (finalScore >= 85) conclusion = `🔥 Artefact EXCEPTIONNEL (${finalScore}/100) ! Garde-le précieusement !`;
        else if (finalScore >= 65) conclusion = `👍 Bon artefact (${finalScore}/100), quelques améliorations possibles.`;
        else if (finalScore >= 40) conclusion = `⚠️ Artefact moyen (${finalScore}/100), reroll conseillé.`;
        else conclusion = `❌ Artefact faible (${finalScore}/100), change-le rapidement !`;

        showTankMessage(conclusion, true, 'beru');

        // 📊 Génération du rapport après conclusion (8.5s)
        setTimeout(() => {
            generateDetailedReport(artifactData, hunter, substatsMinMaxByIncrements, showTankMessage);
        }, 1000);
    }, 7500);
};

// 🔥 ANALYSE GLOBALE INTELLIGENTE FINALE - SYSTÈME ORIGINAL RESTAURÉ
export const performIntelligentAnalysis = (
    selectedCharacter,
    currentArtifacts,
    showTankMessage,
    onClose,
    onReportGenerated,
    substatsMinMaxByIncrements,
    existingScores = {}
) => {
    console.log("🔥 KAISEL FINAL: performIntelligentAnalysis avec scores:", existingScores);
    
    const hunterData = BUILDER_DATA[selectedCharacter];
    if (!hunterData) {
        showTankMessage("🤔 Je ne connais pas ce Hunter... Aide-moi à apprendre !", true, 'beru');
        return;
    }

    // 🎯 SYSTÈME ORIGINAL AVEC DÉLAIS CONFORTABLES
    
    // Phase 1: Annonce (500ms)
    setTimeout(() => {
        showTankMessage(`🧠 Béru lance l'analyse complète de ${getHunterNameFromKey(selectedCharacter)}...`, true, 'beru');
    }, 500);

    // Phase 2: Scan des artefacts (3000ms)
    setTimeout(() => {
        const artifactCount = Object.values(currentArtifacts).filter(a => a && a.mainStat).length;
        const scoresCount = Object.keys(existingScores).filter(slot => existingScores[slot] > 0).length;
        showTankMessage(`🔍 Scan: ${artifactCount}/8 artefacts équipés. ${scoresCount} scores calculés.`, true, 'beru');
    }, 3000);

    // Phase 3: Analyse des scores (5500ms)
    setTimeout(() => {
        if (existingScores && Object.keys(existingScores).length > 0) {
            const scores = Object.values(existingScores).filter(s => s > 0);
            const avgScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
            const maxScore = Math.max(...scores, 0);
            showTankMessage(`📊 Score moyen: ${Math.round(avgScore)}/100. Meilleur: ${maxScore}/100 sur ${scores.length} artefacts.`, true, 'beru');
        }
    }, 5500);

    // Phase 4: Message final (8000ms)
    setTimeout(() => {
        showTankMessage(`📜 Analyse terminée ! Génération du rapport détaillé...`, true, 'beru');
    }, 8000);

    // Phase 5: Génération rapport (10500ms - APRÈS tous les messages)
    setTimeout(() => {
        generateCompleteReport(selectedCharacter, currentArtifacts, substatsMinMaxByIncrements, existingScores, onReportGenerated);
        showTankMessage(`📊 Rapport complet généré ! Consulte le papyrus doré pour les détails.`, true, 'beru');
    }, 10500);
};

// 🔍 RECHERCHE ALTERNATIVES DANS LOCALSTORAGE - VERSION CORRIGÉE
const findBetterAlternativesInStorage = (currentArtifact, hunter, substatsMinMaxByIncrements) => {
    try {
        const storage = JSON.parse(localStorage.getItem("builderberu_users"));
        if (!storage?.user?.accounts) {
            console.log("🔍 KAISEL: Pas de comptes trouvés dans localStorage");
            return [];
        }

        const alternatives = [];
        const currentScore = getTheoreticalScore(hunter, currentArtifact, substatsMinMaxByIncrements);

        // 🔍 Scanner tous les comptes - STRUCTURE CORRIGÉE
        Object.values(storage.user.accounts).forEach(accountData => {
            const artifactLibrary = accountData.artifactLibrary || {};
            const sameSlotArtifacts = artifactLibrary[currentArtifact.title] || {};
            
            Object.values(sameSlotArtifacts).forEach(artifact => {
                // Skip l'artefact actuel si même ID
                if (artifact.id === currentArtifact.savedArtifactId) return;
                
                // 🧮 Calculer le score de l'alternative
                const alternativeScore = getTheoreticalScore(hunter, artifact, substatsMinMaxByIncrements);
                
                if (alternativeScore > currentScore) {
                    // 📊 Extraire les meilleures substats pour description
                    const topSubstats = artifact.subStats.filter(stat => 
                        stat && (stat.includes('Additional') || stat.includes('Critical Hit') || stat.includes('Damage'))
                    ).slice(0, 2);

                    alternatives.push({
                        name: artifact.name || 'Artefact sans nom',
                        score: alternativeScore,
                        improvement: Math.round(alternativeScore - currentScore),
                        set: artifact.set || 'Aucun set',
                        mainStat: artifact.mainStat || 'Pas de main stat',
                        topSubstats: topSubstats.length > 0 ? topSubstats : ['Pas de substats notables'],
                        artifact
                    });
                }
            });
        });
        
        // 📊 Trier par amélioration décroissante
        return alternatives.sort((a, b) => b.improvement - a.improvement).slice(0, 3);
        
    } catch (error) {
        console.error("🐉 Kaisel: Erreur analyse localStorage:", error);
        return [];
    }
};

// 📊 GÉNÉRATION RAPPORT COMPLET - VERSION FINALE
const generateCompleteReport = (characterKey, artifacts, substatsMinMax, existingScores, onReportGenerated) => {
    const hunterData = BUILDER_DATA[characterKey];
    if (!hunterData) return;

    console.log("🔥 KAISEL FINAL: Génération rapport avec existingScores:", existingScores);

    // 🎯 ANALYSER TOUS LES ARTEFACTS AVEC SCORES EXISTANTS
    const allSlots = ['Helmet', 'Chest', 'Gloves', 'Boots', 'Necklace', 'Bracelet', 'Ring', 'Earrings'];
    const artifactAnalyses = [];
    const weakArtifacts = [];
    const emptySlots = [];
    let totalScore = 0;
    let artifactCount = 0;

    allSlots.forEach(slot => {
        const artifact = artifacts[slot];
        const existingScore = existingScores[slot] || 0;
        
        if (!artifact || (!artifact.mainStat && !artifact.set)) {
            emptySlots.push(slot);
            return;
        }

        artifactCount++;
        totalScore += existingScore;

        // Analyse détaillée avec score existant
        if (existingScore < 60) {
            const analysis = analyzeArtifactForReport(artifact, slot, hunterData);
            weakArtifacts.push({
                slot,
                score: existingScore,
                issues: analysis.issues
            });
        }

        artifactAnalyses.push({
            slot,
            score: existingScore,
            artifact: artifact.set || 'Aucun set',
            mainStat: artifact.mainStat || 'Aucune main stat'
        });
    });

    const globalScore = artifactCount > 0 ? Math.round(totalScore / artifactCount) : 0;
    const maxScore = Math.max(...Object.values(existingScores), 0);

    // Analyser les sets
    const setAnalysis = analyzeOverallSets(artifacts);

    // Créer le rapport final
    const report = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('fr-FR'),
        hunterName: getHunterNameFromKey(characterKey),
        artifactCount,
        globalScore,
        maxScore,
        
        setAnalysis: {
            dominantSet: setAnalysis.dominantSet || 'Aucun',
            optimalSetCount: setAnalysis.optimalSetCount || 0,
            recommendedSet: hunterData.gameModes[Object.keys(hunterData.gameModes)[0]]?.recommendedSet || 'Inconnu'
        },
        
        weakArtifacts: weakArtifacts.sort((a, b) => a.score - b.score),
        emptySlots,
        
        // Priorité critique
        criticalPriority: emptySlots.length > 0 ? {
            missingCount: emptySlots.length,
            missingSlots: emptySlots,
            score: 0
        } : (weakArtifacts.length > 0 ? weakArtifacts[0] : null),
        
        substatAnalysis: analyzeOverallSubstats(artifacts, hunterData),
        actionPlan: generateActionPlan(artifacts, weakArtifacts, emptySlots, hunterData, globalScore),
        
        // Données supplémentaires
        artifactDetails: artifactAnalyses,
        enhancedAnalysis: true,
        unlimitedScoring: true,
        type: 'complete_build_analysis',
        triggeredFrom: 'beru_menu'
    };

    console.log("🔥 KAISEL FINAL: Rapport généré:", report);

    if (onReportGenerated) {
        onReportGenerated(report);
    }
};

// 🎁 ANALYSE SET DÉTAILLÉE
const analyzeArtifactSet = (artifactData, hunter) => {
    const hunterKey = getHunterKey(hunter);
    const hunterData = BUILDER_DATA[hunterKey];
    
    if (!hunterData) {
        return { score: 0, status: 'unknown', message: '❓ Hunter non supporté par l\'IA Béru' };
    }
    
    if (!artifactData.set || artifactData.set === '') {
        return { 
            score: 0, 
            status: 'missing', 
            message: '❌ Aucun set défini ! Sélectionne un set pour les bonus.' 
        };
    }

    // Récupérer tous les sets recommandés
    const recommendedSets = Object.values(hunterData.gameModes).map(mode => mode.recommendedSet);
    const primarySet = recommendedSets[0];
    
    // Vérification intelligente des sets
    const currentSet = artifactData.set.toLowerCase();
    const isOptimal = recommendedSets.some(recSet => {
        const recSetLower = recSet.toLowerCase();
        return currentSet.includes(recSetLower.split(' ')[0]) || 
               recSetLower.includes(currentSet.split(' ')[0]) ||
               currentSet === recSetLower;
    });

    if (isOptimal) {
        return { 
            score: 100, 
            status: 'perfect', 
            message: `✅ Set "${artifactData.set}" PARFAIT pour ${hunterData.name} !`,
            recommended: primarySet
        };
    }

    return { 
        score: 20, 
        status: 'poor', 
        message: `❌ Set "${artifactData.set}" NON-OPTIMAL ! Change pour "${primarySet}".`,
        recommended: primarySet
    };
};

// 🎯 ANALYSE MAINSTAT ULTRA-DÉTAILLÉE
const analyzeMainStatDetailed = (artifactData, hunter) => {
    const hunterKey = getHunterKey(hunter);
    const hunterData = BUILDER_DATA[hunterKey];
    
    if (!hunterData || !artifactData.mainStat) {
        return { score: 0, status: 'unknown', message: '❌ Impossible d\'analyser la MainStat' };
    }

    // Récupérer les mainStats recommandées pour ce slot
    const firstSet = Object.keys(hunterData.artifactSets)[0];
    const recommendedMainStats = hunterData.artifactSets[firstSet]?.mainStats;
    const slotKey = artifactData.title.toLowerCase();
    const expectedMainStat = recommendedMainStats?.[slotKey];
    
    const currentMainStat = artifactData.mainStat;
    const scaleStat = hunterData.scaleStat;

    // PERFECT: MainStat recommandée exacte
    if (currentMainStat === expectedMainStat) {
        return { 
            score: 100, 
            status: 'perfect', 
            message: `✅ MainStat "${currentMainStat}" PARFAITE ! Exactement comme recommandé pour ${hunterData.name}.`,
            expected: expectedMainStat
        };
    }

    // GOOD: Stat de scale du hunter
    if (currentMainStat.includes(scaleStat)) {
        return { 
            score: 80, 
            status: 'good', 
            message: `👍 MainStat "${currentMainStat}" BONNE (scale stat), mais "${expectedMainStat}" serait optimal.`,
            expected: expectedMainStat
        };
    }

    // POOR: Stat inadaptée
    return { 
        score: 20, 
        status: 'poor', 
        message: `❌ MainStat "${currentMainStat}" MAUVAISE pour ${hunterData.name} ! Change pour "${expectedMainStat}".`,
        expected: expectedMainStat
    };
};

// 📊 ANALYSE SUBSTATS ULTRA-DÉTAILLÉE
const analyzeSubStatsDetailed = (artifactData, hunter, substatsMinMaxByIncrements) => {
    const hunterKey = getHunterKey(hunter);
    const hunterData = BUILDER_DATA[hunterKey];
    
    if (!hunterData || !artifactData.subStats) {
        return { averageScore: 0, message: '❌ Impossible d\'analyser les substats' };
    }

    const priorities = hunterData.optimizationPriority;
    const topPriorityStats = priorities.slice(0, 4).map(p => p.stat);
    
    let totalScore = 0;
    let totalRollQuality = 0;
    const analysis = [];
    let procCount = 0;

    artifactData.subStats.forEach((stat, idx) => {
        if (!stat) return;

        const levelInfo = artifactData.subStatsLevels?.[idx];
        if (!levelInfo) return;

        procCount += levelInfo.level || 0;

        // 🎯 Score de pertinence selon priorités hunter
        let relevanceScore = 10;
        const priorityIndex = topPriorityStats.findIndex(pStat => 
            stat.includes(pStat.replace('Additional ', '').replace(' %', ''))
        );
        
        if (priorityIndex === 0) relevanceScore = 100;
        else if (priorityIndex === 1) relevanceScore = 85;
        else if (priorityIndex === 2) relevanceScore = 70;
        else if (priorityIndex === 3) relevanceScore = 55;
        else if (stat.includes('Critical Hit')) relevanceScore = 45;
        else relevanceScore = 15;
        
        // 🎲 Qualité du roll
        const rollQuality = calculateRollQualityPercent(stat, levelInfo, substatsMinMaxByIncrements);
        totalRollQuality += rollQuality;
        
        // 📊 Score final de cette substat  
        const finalScore = (relevanceScore * 0.7) + (rollQuality * 0.3);
        totalScore += finalScore;

        analysis.push({
            stat,
            relevanceScore,
            rollQuality: Math.round(rollQuality),
            finalScore: Math.round(finalScore),
            level: levelInfo.level || 0,
            value: levelInfo.value || 0
        });
    });

    const validSubstats = analysis.length;
    const averageScore = validSubstats > 0 ? totalScore / validSubstats : 0;
    const averageRollQuality = validSubstats > 0 ? totalRollQuality / validSubstats : 0;

    // 🔍 Messages personnalisés selon l'analyse
    let message = '';
    let topStats = analysis.filter(a => a.relevanceScore >= 70).map(a => a.stat);
    let wastedStats = analysis.filter(a => a.relevanceScore <= 20).map(a => a.stat);

    if (averageScore >= 80) {
        message = `🔥 Substats EXCELLENTES (${Math.round(averageScore)}/100) ! ${topStats.length} stats prioritaires trouvées.`;
    } else if (averageScore >= 60) {
        message = `👍 Bonnes substats (${Math.round(averageScore)}/100). `;
        if (wastedStats.length > 0) {
            message += `Attention aux stats inutiles: ${wastedStats.join(', ')}.`;
        }
    } else if (averageScore >= 40) {
        message = `⚠️ Substats moyennes (${Math.round(averageScore)}/100). Reroll conseillé. Manque: ${topPriorityStats.slice(0, 2).join(', ')}.`;
    } else {
        message = `❌ Substats FAIBLES (${Math.round(averageScore)}/100) ! Change cet artefact rapidement.`;
    }

    if (procCount < 4) {
        message += ` | ${procCount}/4 procs terminés.`;
    } else {
        message += ` | Rolls à ${Math.round(averageRollQuality)}%.`;
    }

    return {
        averageScore: Math.round(averageScore),
        averageRollQuality: Math.round(averageRollQuality),
        analysis,
        topStats,
        wastedStats,
        message
    };
};

// 📊 GÉNÉRATION DU RAPPORT DÉTAILLÉ
const generateDetailedReport = (artifactData, hunter, substatsMinMaxByIncrements, showTankMessage) => {
    const setAnalysis = analyzeArtifactSet(artifactData, hunter);
    const mainStatAnalysis = analyzeMainStatDetailed(artifactData, hunter);
    const subStatsAnalysis = analyzeSubStatsDetailed(artifactData, hunter, substatsMinMaxByIncrements);
    const alternatives = findBetterAlternativesInStorage(artifactData, hunter, substatsMinMaxByIncrements);
    const globalScore = getTheoreticalScore(hunter, artifactData, substatsMinMaxByIncrements);

    // 🎯 Créer le plan d'action personnalisé
    let actionPlan = `🎯 PLAN D'ACTION POUR ${artifactData.title.toUpperCase()}\n\n`;
    
    if (setAnalysis.status !== 'perfect') {
        actionPlan += `1️⃣ PRIORITÉ SET: Change pour "${setAnalysis.recommended}"\n`;
    }
    
    if (mainStatAnalysis.status !== 'perfect') {
        actionPlan += `2️⃣ PRIORITÉ MAINSTAT: Change pour "${mainStatAnalysis.expected}"\n`;
    }
    
    if (subStatsAnalysis.averageScore < 70) {
        actionPlan += `3️⃣ PRIORITÉ SUBSTATS: Reroll pour obtenir ${BUILDER_DATA[getHunterKey(hunter)]?.optimizationPriority.slice(0, 2).map(p => p.stat).join(', ')}\n`;
    }
    
    if (alternatives.length > 0) {
        actionPlan += `4️⃣ ALTERNATIVE: Utilise "${alternatives[0].name}" (+${alternatives[0].improvement} points)\n`;
    }
    
    if (globalScore >= 85) {
        actionPlan += `✅ CET ARTEFACT EST DÉJÀ EXCELLENT ! Garde-le précieusement.`;
    }

    // Structure pour BeruReportSystem si nécessaire
    const report = {
        timestamp: new Date().toLocaleString('fr-FR'),
        hunterName: hunter.name,
        artifactSlot: artifactData.title,
        artifactCount: 1,
        globalScore,
        actionPlan,
        alternatives: alternatives.slice(0, 3),
        type: 'single_artifact_analysis',
        triggeredFrom: 'score_badge'
    };

    setTimeout(() => {
        showTankMessage(`📊 Rapport d'analyse généré ! Consulte le papyrus doré pour les détails.`, true, 'beru');
        
        if (window.handleReportGenerated) {
            window.handleReportGenerated(report);
        }
    }, 500);

    return report;
};

// 🧮 HELPER: Calcul qualité roll
const calculateRollQualityPercent = (stat, levelInfo, substatsMinMaxByIncrements) => {
    if (!substatsMinMaxByIncrements[stat] || !levelInfo.procOrders) return 50;
    
    const maxPossible = levelInfo.procOrders.reduce((sum, order) => {
        return sum + (substatsMinMaxByIncrements[stat][order]?.max || 0);
    }, 0);
    
    const actualValue = levelInfo.value || 0;
    
    if (maxPossible === 0) return 50;
    return Math.min((actualValue / maxPossible) * 100, 100);
};
// 🔍 HELPER: Clé hunter pour builder_data
const getHunterKey = (hunter) => {
    const nameMapping = {
        'Lennart Niermann': 'niermann',
        'Cha Hae-In': 'chae',
        'Tawata Kanae': 'kanae',
        'Seorin': 'seorin',
        'Goto Ryuji': 'goto',
        'Shimizu Akari': 'shimizu',
        'Thomas André': 'thomas',
        'Isla Wright': 'isla',
        'Gina': 'gina',
        'Esil Radiru': 'esil'
    };
    return nameMapping[hunter?.name] || null;
};

// 🔍 HELPER: Nom hunter depuis clé
const getHunterNameFromKey = (key) => {
    const keyMapping = {
        'niermann': 'Lennart Niermann',
        'chae': 'Cha Hae-In',
        'kanae': 'Tawata Kanae',
        'seorin': 'Seorin',
        'goto': 'Goto Ryuji',
        'shimizu': 'Shimizu Akari',
        'thomas': 'Thomas André',
        'isla': 'Isla Wright',
        'gina': 'Gina',
        'esil': 'Esil Radiru'
    };
    return keyMapping[key] || key;
};

// 🎯 HELPERS POUR RAPPORT COMPLET
const analyzeArtifactForReport = (artifact, slot, hunterData) => {
    const issues = [];
    
    if (!artifact.set) issues.push(`Aucun set sélectionné`);
    if (!artifact.mainStat) issues.push(`Aucune main stat`);
    
    return { issues };
};

const analyzeOverallSets = (artifacts) => {
    const sets = {};
    Object.values(artifacts).forEach(artifact => {
        if (artifact?.set) {
            sets[artifact.set] = (sets[artifact.set] || 0) + 1;
        }
    });
    
    const dominantSet = Object.keys(sets).length > 0 
        ? Object.keys(sets).reduce((a, b) => sets[a] > sets[b] ? a : b) 
        : null;
    
    return {
        dominantSet,
        optimalSetCount: Math.max(...Object.values(sets), 0)
    };
};

const analyzeOverallSubstats = (artifacts, hunterData) => {
    const allSubstats = [];
    Object.values(artifacts).forEach(artifact => {
        if (artifact?.subStats) {
            allSubstats.push(...artifact.subStats.filter(s => s));
        }
    });
    
    const priorities = hunterData.optimizationPriority.slice(0, 3).map(p => p.stat);
    const criticalMissing = priorities.filter(stat => 
        !allSubstats.some(s => s.includes(stat.replace('Additional ', '')))
    );
    
    const wastedStats = allSubstats.filter(stat => 
        stat.includes('MP') && !priorities.some(p => p.includes('MP'))
    );
    
    return { criticalMissing, wastedStats };
};

const generateActionPlan = (artifacts, weakArtifacts, emptySlots, hunterData, globalScore) => {
    let plan = `🎯 PLAN D'ACTION ${hunterData.name.toUpperCase()}\n\n`;
    
    if (emptySlots.length > 0) {
        plan += `🚨 PRIORITÉ ABSOLUE: Équiper les ${emptySlots.length} slots manquants\n`;
        plan += `Slots vides: ${emptySlots.join(', ')}\n\n`;
    }
    
    if (weakArtifacts.length > 0) {
        plan += `🔧 ARTEFACTS À AMÉLIORER:\n`;
        weakArtifacts.slice(0, 3).forEach((artifact, i) => {
            plan += `${i + 1}. ${artifact.slot} (${artifact.score}/100)\n`;
        });
        plan += `\n`;
    }
    
    plan += `📊 BUILD RECOMMANDÉ: ${hunterData.gameModes[Object.keys(hunterData.gameModes)[0]].recommendedSet}\n`;
    plan += `🎯 PRIORITÉS: ${hunterData.optimizationPriority.slice(0, 3).map(p => p.stat).join(', ')}`;
    
    if (globalScore >= 85) {
        plan += `\n\n✨ FÉLICITATIONS ! Ton build est excellent !`;
    }
    
    return plan;
};