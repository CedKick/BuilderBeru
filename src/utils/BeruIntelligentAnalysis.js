// 📁 /utils/BeruIntelligentAnalysis.js - SYSTÈME IA COMPLET KAISEL 🧠
// VERSION FINALE - INTÉGRATION PARFAITE AVEC ArtifactScoreBadge + ANALYSE SUBSTATS INTELLIGENTE

import { BUILDER_DATA } from '../data/builder_data';
import { getTheoreticalScore } from './statPriority';

// 🚫 RESTRICTIONS PAR SLOT
const SLOT_RESTRICTIONS = {
    // Armor pieces - PAS de Critical Hit Damage
    "helmet": { forbidden: ["criticalHitDamage"] },
    "chest": { forbidden: ["criticalHitDamage"] },
    "gloves": { forbidden: ["criticalHitDamage"] },
    "boots": { forbidden: ["criticalHitDamage"] },
    
    // Jewelry - PAS de Critical Hit Rate  
    "necklace": { forbidden: ["criticalHitRate"] },
    "bracelet": { forbidden: ["criticalHitRate"] },
    "ring": { forbidden: ["criticalHitRate"] },
    "earrings": { forbidden: ["criticalHitRate"] }
};

// 🧠 ANALYSE SPÉCIFIQUE D'ARTEFACT DÉCLENCHÉE DEPUIS LE BADGE
export const performSpecificArtifactAnalysis = (
    artifactData,
    hunter,
    showTankMessage,
    onClose,
    substatsMinMaxByIncrements,
    onReportGenerated  // ← AJOUTER CE PARAMÈTRE !
) => {

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

        // 📊 NOUVEAU : Génération du rapport avec callback (8.5s)
        setTimeout(() => {
            const report = generateDetailedReport(artifactData, hunter, substatsMinMaxByIncrements, showTankMessage);

            // 🔥 APPELER LE CALLBACK onReportGenerated !
            if (onReportGenerated) {
                onReportGenerated(report);
            } else {
                console.warn("⚠️ KAISEL: onReportGenerated non fourni à performSpecificArtifactAnalysis");
            }
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

// 🎯 ANALYSE SUBSTATS SELON SLOT ET HUNTER - NOUVELLE FONCTION INTELLIGENTE
const analyzeSubstatsForSlot = (artifactData, hunterData) => {
    // 1️⃣ Identifier le slot
    const slot = identifyArtifactSlot(artifactData.title);
    if (!slot) {
        return { criticalMissing: [], wastedStats: [], slot: 'unknown' };
    }

    // 2️⃣ Récupérer les stats recommandées (≠ null)
    const recommendedStats = Object.entries(hunterData.recommendedStats)
        .filter(([stat, value]) => value !== null)
        .map(([stat, value]) => stat);

    console.log('🔍 Kaisel Debug - Stats recommandées:', recommendedStats);
    console.log('🔍 Kaisel Debug - Slot détecté:', slot);

    // 3️⃣ Filtrer selon les restrictions du slot
    const restrictions = SLOT_RESTRICTIONS[slot] || { forbidden: [] };
    const allowedStats = recommendedStats.filter(stat => 
        !restrictions.forbidden.includes(stat)
    );

    console.log('🔍 Kaisel Debug - Stats autorisées pour ce slot:', allowedStats);
    console.log('🔍 Kaisel Debug - Stats interdites:', restrictions.forbidden);

    // 4️⃣ Vérifier les substats existants
    const existingSubstats = artifactData.subStats || [];
    const existingMainStat = artifactData.mainStat || '';
    
    console.log('🔍 Kaisel Debug - Substats existants:', existingSubstats);
    console.log('🔍 Kaisel Debug - MainStat existante:', existingMainStat);

    // 5️⃣ Mapping des noms pour comparaison
    const statMapping = {
        'criticalHitRate': ['Critical Hit Rate', 'Taux de coup critique'],
        'criticalHitDamage': ['Critical Hit Damage', 'Dégâts de coup critique'],
        'DamageIncrease': ['Damage Increase', 'Augmentation des dégâts'],
        'defensePenetration': ['Defense Penetration', 'Pénétration de défense'],
        'additionalDefense': ['Additional Defense', 'Défense supplémentaire'],
        'additionalAttack': ['Additional Attack', 'Attaque supplémentaire'],
        'additionalHP': ['Additional HP', 'PV supplémentaires']
    };

    // 6️⃣ Chercher les stats manquantes
    const criticalMissing = allowedStats.filter(recommendedStat => {
        const aliases = statMapping[recommendedStat] || [recommendedStat];
        
        // Vérifier dans les substats ET mainStat
        const foundInSubstats = existingSubstats.some(substat => 
            aliases.some(alias => 
                substat.toLowerCase().includes(alias.toLowerCase()) ||
                alias.toLowerCase().includes(substat.toLowerCase())
            )
        );

        const foundInMainStat = aliases.some(alias =>
            existingMainStat.toLowerCase().includes(alias.toLowerCase()) ||
            alias.toLowerCase().includes(existingMainStat.toLowerCase())
        );

        const found = foundInSubstats || foundInMainStat;
        
        if (!found) {
            console.log(`❌ MANQUANT: ${recommendedStat} (aliases: ${aliases.join(', ')})`);
        } else {
            console.log(`✅ TROUVÉ: ${recommendedStat}`);
        }

        return !found;
    });

    // 7️⃣ Identifier les stats inutiles
    const wastedStats = existingSubstats.filter(substat => {
        // Stats toujours inutiles
        if (substat.includes('MP') && !recommendedStats.includes('mpRecoveryRate') && !recommendedStats.includes('mpCostReduction')) {
            return true;
        }

        // Vérifier si cette substat correspond à une stat recommandée
        const isUseful = recommendedStats.some(recommendedStat => {
            const aliases = statMapping[recommendedStat] || [recommendedStat];
            return aliases.some(alias => 
                substat.toLowerCase().includes(alias.toLowerCase()) ||
                alias.toLowerCase().includes(substat.toLowerCase())
            );
        });

        if (!isUseful) {
            console.log(`🗑️ INUTILE: ${substat}`);
        }

        return !isUseful;
    });

    return {
        criticalMissing: criticalMissing.slice(0, 3), // Max 3 pour l'affichage
        wastedStats: wastedStats.slice(0, 3),
        slot,
        allowedStats,
        restrictedStats: restrictions.forbidden
    };
};

// 🔍 IDENTIFIER LE SLOT DEPUIS LE TITRE
const identifyArtifactSlot = (title) => {
    const slotMapping = {
        'helmet': ['helmet', 'casque'],
        'chest': ['chest', 'armure', 'armor'],
        'gloves': ['gloves', 'gants'],
        'boots': ['boots', 'bottes'],
        'necklace': ['necklace', 'collier'],
        'bracelet': ['bracelet'],
        'ring': ['ring', 'bague'],
        'earrings': ['earrings', 'boucles']
    };

    const titleLower = title.toLowerCase();
    
    for (const [slot, keywords] of Object.entries(slotMapping)) {
        if (keywords.some(keyword => titleLower.includes(keyword))) {
            return slot;
        }
    }
    
    return null;
};

// 🔍 RECHERCHE ALTERNATIVES DANS LOCALSTORAGE - VERSION CORRIGÉE
const findBetterAlternativesInStorage = (currentArtifact, hunter, substatsMinMaxByIncrements) => {
    try {
        const storage = JSON.parse(localStorage.getItem("builderberu_users"));
        if (!storage?.user?.accounts) {
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

    // 🧠 NOUVELLE ANALYSE SUBSTATS INTELLIGENTE POUR RAPPORT GLOBAL
    const overallSubstatAnalysis = analyzeOverallSubstatsForReport(artifacts, hunterData);

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

        substatAnalysis: overallSubstatAnalysis,
        actionPlan: generateActionPlan(artifacts, weakArtifacts, emptySlots, hunterData, globalScore),

        // Données supplémentaires
        artifactDetails: artifactAnalyses,
        enhancedAnalysis: true,
        unlimitedScoring: true,
        type: 'complete_build_analysis',
        triggeredFrom: 'beru_menu'
    };

    if (onReportGenerated) {
        onReportGenerated(report);
    }
};

// 🧠 ANALYSE SUBSTATS POUR RAPPORT GLOBAL - NOUVELLE FONCTION
const analyzeOverallSubstatsForReport = (artifacts, hunterData) => {
    const allSubstats = [];
    Object.values(artifacts).forEach(artifact => {
        if (artifact?.subStats) {
            allSubstats.push(...artifact.subStats.filter(s => s));
        }
    });

    // Récupérer les stats recommandées (≠ null) depuis recommendedStats
    const recommendedStats = Object.entries(hunterData.recommendedStats)
        .filter(([stat, value]) => value !== null)
        .map(([stat, value]) => stat);

    console.log('🔍 Kaisel Debug Global - Stats recommandées:', recommendedStats);
    console.log('🔍 Kaisel Debug Global - Substats trouvées:', allSubstats);

    // Mapping des noms pour comparaison
    const statMapping = {
        'criticalHitRate': ['Critical Hit Rate'],
        'criticalHitDamage': ['Critical Hit Damage'],
        'DamageIncrease': ['Damage Increase'],
        'defensePenetration': ['Defense Penetration'],
        'additionalDefense': ['Additional Defense'],
        'additionalAttack': ['Additional Attack'],
        'additionalHP': ['Additional HP']
    };

    // Chercher les stats manquantes
    const criticalMissing = recommendedStats.slice(0, 5).filter(recommendedStat => {
        const aliases = statMapping[recommendedStat] || [recommendedStat];
        
        const found = allSubstats.some(substat => 
            aliases.some(alias => 
                substat.toLowerCase().includes(alias.toLowerCase()) ||
                alias.toLowerCase().includes(substat.toLowerCase())
            )
        );

        if (!found) {
            console.log(`❌ GLOBAL MANQUANT: ${recommendedStat}`);
        }

        return !found;
    });

    // Stats inutiles
    const wastedStats = allSubstats.filter(substat => {
        if (substat.includes('MP') && !recommendedStats.includes('mpRecoveryRate') && !recommendedStats.includes('mpCostReduction')) {
            return true;
        }

        const isUseful = recommendedStats.some(recommendedStat => {
            const aliases = statMapping[recommendedStat] || [recommendedStat];
            return aliases.some(alias => 
                substat.toLowerCase().includes(alias.toLowerCase()) ||
                alias.toLowerCase().includes(substat.toLowerCase())
            );
        });

        return !isUseful;
    });

    return { 
        criticalMissing: criticalMissing.slice(0, 3),
        wastedStats: wastedStats.slice(0, 3) 
    };
};

// 🎁 ANALYSE SET DÉTAILLÉE - VERSION RAPPORT INTÉGRÉE KAISEL
const analyzeArtifactSet = (artifactData, hunter, onReportGenerated = null) => {
    const hunterKey = getHunterKey(hunter);
    const hunterData = BUILDER_DATA[hunterKey];

    if (!hunterData) {
        return { score: 0, status: 'unknown', message: '❓ Hunter non supporté par l\'IA Béru' };
    }

    if (!artifactData.set || artifactData.set === '') {
        // 📊 Générer un rapport si callback fourni
        if (onReportGenerated) {
            const report = generateSingleArtifactReport(artifactData, hunter, {
                score: 0,
                status: 'missing',
                message: '❌ Aucun set défini ! Sélectionne un set pour les bonus.',
                issues: ['Aucun set sélectionné'],
                recommendation: 'Sélectionner un set approprié'
            });
            onReportGenerated(report);
        }

        return {
            score: 0,
            status: 'missing',
            message: '❌ Aucun set défini ! Sélectionne un set pour les bonus.'
        };
    }

    // 🔍 Déterminer le slot depuis le title de l'artefact
    const slotMapping = {
        'helmet': 'helmet',
        'casque': 'helmet',
        'chest': 'chest',
        'armure': 'chest',
        'armor': 'chest',
        'gloves': 'gloves',
        'gants': 'gloves',
        'boots': 'boots',
        'bottes': 'boots',
        'necklace': 'necklace',
        'collier': 'necklace',
        'bracelet': 'bracelet',
        'ring': 'ring',
        'bague': 'ring',
        'earrings': 'earrings',
        'boucles': 'earrings'
    };

    const currentSlot = Object.keys(slotMapping).find(key =>
        artifactData.title.toLowerCase().includes(key)
    );
    const mappedSlot = slotMapping[currentSlot];

    if (!mappedSlot) {
        const analysis = {
            score: 0,
            status: 'unknown',
            message: `❓ Impossible d'identifier le slot de "${artifactData.title}"`,
            issues: ['Slot non identifiable'],
            recommendation: 'Vérifier le nom de l\'artefact'
        };

        // 📊 Générer rapport si callback fourni
        if (onReportGenerated) {
            const report = generateSingleArtifactReport(artifactData, hunter, analysis);
            onReportGenerated(report);
        }

        return analysis;
    }

    // 🎯 Récupérer tous les sets autorisés pour ce slot spécifique
    const allowedSets = [];
    const setRecommendations = [];

    Object.entries(hunterData.artifactSets).forEach(([setKey, setData]) => {
        const pieceForSlot = setData.pieces[mappedSlot];
        if (pieceForSlot) {
            // Extraire le nom du set depuis le nom de la pièce
            let setName = '';
            if (pieceForSlot.includes('volonté de fer') || pieceForSlot.includes('Iron Will')) {
                setName = 'Iron Will';
            } else if (pieceForSlot.includes('obsidienne') || pieceForSlot.includes('Outstanding')) {
                setName = 'Outstanding Ability';
            } else if (pieceForSlot.includes('infamie chaotique') || pieceForSlot.includes('Chaotic Infamy')) {
                setName = 'Chaotic Infamy';
            } else if (pieceForSlot.includes('Limit Break')) {
                setName = 'Limit Break';
            } else if (pieceForSlot.includes('Seven Deadly Sins')) {
                setName = 'Seven Deadly Sins';
            } else if (pieceForSlot.includes('malédiction ardente') || pieceForSlot.includes('Burning Curse')) {
                setName = 'Burning Curse';
            } else if (pieceForSlot.includes('expert') || pieceForSlot.includes('Expert')) {
                setName = 'Expert';
            }

            if (setName && !allowedSets.includes(setName)) {
                allowedSets.push(setName);
                setRecommendations.push({
                    setName,
                    buildName: setData.name,
                    availability: setData.availability
                });
            }
        }
    });

    if (allowedSets.length === 0) {
        const analysis = {
            score: 0,
            status: 'unknown',
            message: `❓ Aucun set recommandé trouvé pour le slot ${mappedSlot}`,
            issues: ['Aucun set recommandé pour ce slot'],
            recommendation: 'Consulter les builds recommandés'
        };

        // 📊 Générer rapport si callback fourni
        if (onReportGenerated) {
            const report = generateSingleArtifactReport(artifactData, hunter, analysis);
            onReportGenerated(report);
        }

        return analysis;
    }

    // 🔍 Vérifier si le set actuel est dans les sets autorisés
    const currentSet = artifactData.set;
    const isOptimalSet = allowedSets.some(allowedSet => {
        // Vérification flexible des noms de sets
        const currentSetLower = currentSet.toLowerCase();
        const allowedSetLower = allowedSet.toLowerCase();

        return currentSetLower.includes(allowedSetLower.split(' ')[0]) ||
            allowedSetLower.includes(currentSetLower.split(' ')[0]) ||
            currentSetLower === allowedSetLower;
    });

    if (isOptimalSet) {
        const matchingRecommendation = setRecommendations.find(rec =>
            currentSet.toLowerCase().includes(rec.setName.toLowerCase().split(' ')[0])
        );

        const analysis = {
            score: 100,
            status: 'perfect',
            message: `✅ Set "${currentSet}" PARFAIT pour ${hunterData.name} ${mappedSlot} ! (${matchingRecommendation?.buildName || 'Build optimal'})`,
            allowedSets,
            currentBuild: matchingRecommendation?.buildName,
            issues: [],
            recommendation: 'Set optimal - aucune action requise'
        };

        // 📊 Générer rapport si callback fourni
        if (onReportGenerated) {
            const report = generateSingleArtifactReport(artifactData, hunter, analysis);
            onReportGenerated(report);
        }

        return analysis;
    }

    // 🎯 Récupérer directement les noms des pièces pour ce slot
    const pieceNames = Object.values(hunterData.artifactSets)
        .map(setData => setData.pieces[mappedSlot])
        .filter(piece => piece); // Enlever les undefined

    const analysis = {
        score: 20,
        status: 'poor',
        message: `❌ Set "${currentSet}" NON-OPTIMAL pour ${mappedSlot} ! Change pour "${pieceNames.join(' ou ')}"`,
        allowedSets,
        recommendedPieces: pieceNames,
        issues: ['Set non-optimal pour ce hunter'],
        recommendation: `Changer pour: ${pieceNames.join(' ou ')}`
    };

    // 📊 Générer rapport si callback fourni
    if (onReportGenerated) {
        const report = generateSingleArtifactReport(artifactData, hunter, analysis);
        onReportGenerated(report);
    }

    return analysis;
};

// 📊 GÉNÉRATEUR RAPPORT ARTEFACT UNIQUE - NOUVEAU
const generateSingleArtifactReport = (artifactData, hunter, setAnalysis) => {
    const hunterKey = getHunterKey(hunter);
    const hunterData = BUILDER_DATA[hunterKey];

    // Créer un rapport compatible avec BeruReportSystem
    const report = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('fr-FR'),
        hunterName: hunter.name,
        artifactCount: 1,
        globalScore: setAnalysis.score,
        maxScore: setAnalysis.score,

        // Analyse spécifique du set
        setAnalysis: {
            dominantSet: artifactData.set || 'Aucun',
            optimalSetCount: setAnalysis.status === 'perfect' ? 1 : 0,
            recommendedSet: setAnalysis.recommendedPieces?.join(' ou ') || 'Inconnu',
            currentStatus: setAnalysis.status,
            allowedSets: setAnalysis.allowedSets || []
        },

        // Artefacts problématiques (si ce n'est pas parfait)
        weakArtifacts: setAnalysis.status !== 'perfect' ? [{
            slot: artifactData.title,
            score: setAnalysis.score,
            issues: setAnalysis.issues || ['Set non-optimal']
        }] : [],

        // Slots vides (aucun dans ce cas)
        emptySlots: [],

        // Priorité critique
        criticalPriority: setAnalysis.status === 'missing' ? {
            missingCount: 0,
            missingSlots: [],
            score: 0,
            slot: artifactData.title,
            issues: setAnalysis.issues
        } : (setAnalysis.status === 'poor' ? {
            slot: artifactData.title,
            score: setAnalysis.score,
            issues: setAnalysis.issues
        } : null),

        // Analyse substats (basique pour ce cas)
        substatAnalysis: {
            criticalMissing: [],
            wastedStats: []
        },

        // Plan d'action personnalisé
        actionPlan: generateSetActionPlan(artifactData, hunter, setAnalysis),

        // Métadonnées
        type: 'single_artifact_set_analysis',
        triggeredFrom: 'set_analysis',
        enhancedAnalysis: true,
        artifactDetails: [{
            slot: artifactData.title,
            score: setAnalysis.score,
            artifact: artifactData.set || 'Aucun set',
            mainStat: artifactData.mainStat || 'Aucune main stat'
        }]
    };

    return report;
};

// 🎯 PLAN D'ACTION SPÉCIFIQUE SET
const generateSetActionPlan = (artifactData, hunter, setAnalysis) => {
    const hunterData = BUILDER_DATA[getHunterKey(hunter)];

    let plan = `🎯 PLAN D'ACTION SET - ${artifactData.title.toUpperCase()}\n\n`;

    if (setAnalysis.status === 'missing') {
        plan += `🚨 PRIORITÉ ABSOLUE: Sélectionner un set pour cet artefact\n`;
        plan += `📋 Sets recommandés: ${setAnalysis.allowedSets?.join(', ') || 'Consulter les builds'}\n\n`;
    } else if (setAnalysis.status === 'poor') {
        plan += `🔧 AMÉLIORATION SET REQUISE:\n`;
        plan += `❌ Set actuel: "${artifactData.set}" (non-optimal)\n`;
        plan += `✅ Change pour: ${setAnalysis.recommendedPieces?.join(' ou ')}\n\n`;
    } else if (setAnalysis.status === 'perfect') {
        plan += `✨ SET PARFAIT ! Aucune action requise.\n`;
        plan += `🎯 Set "${artifactData.set}" est optimal pour ${hunter.name}\n\n`;
    }

    plan += `📊 BUILDS RECOMMANDÉS: ${Object.values(hunterData?.artifactSets || {}).map(set => set.name).join(', ')}\n`;
    plan += `🎯 HUNTER: ${hunter.name} - ${artifactData.title}`;

    if (setAnalysis.currentBuild) {
        plan += `\n🏗️ BUILD ACTUEL: ${setAnalysis.currentBuild}`;
    }

    return plan;
};

// 🎯 ANALYSE MAINSTAT ULTRA-DÉTAILLÉE
const analyzeMainStatDetailed = (artifactData, hunter) => {
    const hunterKey = getHunterKey(hunter);
    const hunterData = BUILDER_DATA[hunterKey];

    if (!hunterData || !artifactData.mainStat) {
        return { score: 0, status: 'unknown', message: '❌ Impossible d\'analyser la MainStat' };
    }

    // 🔍 Déterminer le slot depuis le title de l'artefact
    const slotMapping = {
        'helmet': 'helmet',
        'casque': 'helmet',
        'chest': 'chest',
        'armure': 'chest',
        'armor': 'chest',
        'gloves': 'gloves',
        'gants': 'gloves',
        'boots': 'boots',
        'bottes': 'boots',
        'necklace': 'necklace',
        'collier': 'necklace',
        'bracelet': 'bracelet',
        'ring': 'ring',
        'bague': 'ring',
        'earrings': 'earrings',
        'boucles': 'earrings'
    };

    const currentSlot = Object.keys(slotMapping).find(key =>
        artifactData.title.toLowerCase().includes(key)
    );
    const mappedSlot = slotMapping[currentSlot];

    if (!mappedSlot) {
        return {
            score: 0,
            status: 'unknown',
            message: `❓ Impossible d'identifier le slot de "${artifactData.title}"`
        };
    }

    // Récupérer les mainStats recommandées pour ce slot
    const firstSet = Object.keys(hunterData.artifactSets)[0];
    const recommendedMainStats = hunterData.artifactSets[firstSet]?.mainStats;
    const expectedMainStat = recommendedMainStats?.[mappedSlot];

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
    const topPriorityStats = priorities.slice(0, 6).map(p => p.stat);

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
        else if (priorityIndex === 4) relevanceScore = 45;
        else if (priorityIndex === 5) relevanceScore = 35;
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

// 🔧 GENERATE DETAILED REPORT - VERSION CORRIGÉE AVEC ANALYSE INTELLIGENTE
const generateDetailedReport = (artifactData, hunter, substatsMinMaxByIncrements, showTankMessage) => {
    const setAnalysis = analyzeArtifactSet(artifactData, hunter);
    const mainStatAnalysis = analyzeMainStatDetailed(artifactData, hunter);
    const subStatsAnalysis = analyzeSubStatsDetailed(artifactData, hunter, substatsMinMaxByIncrements);
    const alternatives = findBetterAlternativesInStorage(artifactData, hunter, substatsMinMaxByIncrements);
    const globalScore = getTheoreticalScore(hunter, artifactData, substatsMinMaxByIncrements);

    // 🎯 Créer le plan d'action personnalisé
    let actionPlan = `🎯 PLAN D'ACTION POUR ${artifactData.title.toUpperCase()}\n\n`;

    if (setAnalysis.status !== 'perfect') {
        actionPlan += `1️⃣ PRIORITÉ SET: Change pour "${setAnalysis.recommendedPieces?.join(' ou ')}"}\n`;
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

    // 🧠 UTILISER LA NOUVELLE ANALYSE INTELLIGENTE DES SUBSTATS
    const smartSubstatAnalysis = analyzeSubstatsForSlot(artifactData, BUILDER_DATA[getHunterKey(hunter)]);

    // 📊 CRÉER LE RAPPORT COMPATIBLE AVEC BeruReportSystem
    const report = {
        id: Date.now(),
        timestamp: new Date().toLocaleString('fr-FR'),
        hunterName: hunter.name,
        artifactCount: 1,
        globalScore,
        maxScore: globalScore,

        // Analyse spécifique
        setAnalysis: {
            dominantSet: artifactData.set || 'Aucun',
            optimalSetCount: setAnalysis.status === 'perfect' ? 1 : 0,
            recommendedSet: setAnalysis.recommendedPieces?.join(' ou ') || 'Consulter builds'
        },

        // Artefacts problématiques
        weakArtifacts: globalScore < 70 ? [{
            slot: artifactData.title,
            score: globalScore,
            issues: [
                ...(setAnalysis.status !== 'perfect' ? ['Set non-optimal'] : []),
                ...(mainStatAnalysis.status !== 'perfect' ? ['MainStat suboptimale'] : []),
                ...(subStatsAnalysis.averageScore < 70 ? ['Substats à améliorer'] : [])
            ]
        }] : [],

        // Priorité critique
        criticalPriority: globalScore < 40 ? {
            slot: artifactData.title,
            score: globalScore,
            issues: ['Artefact critique à remplacer']
        } : null,
        
        // 🧠 ANALYSE SUBSTATS INTELLIGENTE SELON SLOT
        substatAnalysis: {
            criticalMissing: smartSubstatAnalysis.criticalMissing || [],
            wastedStats: subStatsAnalysis.wastedStats || []
        },

        actionPlan,
        alternatives: alternatives.slice(0, 3),
        type: 'single_artifact_analysis',
        triggeredFrom: 'score_badge',

        // Détails
        artifactDetails: [{
            slot: artifactData.title,
            score: globalScore,
            artifact: artifactData.set || 'Aucun set',
            mainStat: artifactData.mainStat || 'Aucune main stat'
        }],

        emptySlots: [] // Pas de slots vides pour un seul artefact
    };

    setTimeout(() => {
        showTankMessage(`📊 Rapport d'analyse généré ! Consulte le papyrus doré pour les détails.`, true, 'beru');
    }, 500);

    return report;  // ← IMPORTANT : RETOURNER LE RAPPORT !
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
        'Jinah': 'jinah',
        'Miyeon': 'miyeon',
        'Shuhua': 'shuhua',
        'Lennart Niermann': 'niermann',
        'Cha Hae-In Valkyrie': 'chae',
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

    plan += `📊 BUILDS RECOMMANDÉS: ${Object.values(hunterData.artifactSets).map(set => set.name).join(', ')}\n`;
    plan += `🎯 PRIORITÉS: ${hunterData.optimizationPriority.slice(0, 3).map(p => p.stat).join(', ')}`;

    if (globalScore >= 85) {
        plan += `\n\n✨ FÉLICITATIONS ! Ton build est excellent !`;
    }

    return plan;
};