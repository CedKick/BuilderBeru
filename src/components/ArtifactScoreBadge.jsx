// 📁 /components/ArtifactScoreBadge.jsx - SYSTÈME COMPLET KAISEL 🔥

import React, { useEffect, useState } from 'react';
import { getTheoreticalScore } from '../utils/statPriority';
import { BUILDER_DATA } from '../data/builder_data';

const ArtifactScoreBadge = ({ 
    artifact, 
    hunter, 
    substatsMinMaxByIncrements,
    onScoreCalculated,
    showTankMessage 
}) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0, transform: 'translate(-50%, -100%)' });
    
    const score = getTheoreticalScore(hunter, artifact, substatsMinMaxByIncrements);

    const showTankMessageFn = showTankMessage || ((msg) => {
    console.log("🧠 Béru dit:", msg);
    alert(msg); // Fallback si showTankMessage n'est pas passé
});

    // 🔥 KAISEL: Notifier le parent du score calculé
    useEffect(() => {
        if (onScoreCalculated && artifact?.title && score !== null) {
            onScoreCalculated(artifact.title, score);
        }
    }, [score, artifact?.title, onScoreCalculated]);

    if (score === null || !artifact || !hunter || !substatsMinMaxByIncrements) {
        return null;
    }

    // 🧠 KAISEL: Calcul intelligent des flat stats avec builder_data
    const calculateIntelligentBreakdown = () => {
        const hunterKey = getHunterKey(hunter);
        const hunterData = BUILDER_DATA[hunterKey];
        
        if (!hunterData) return null;

        const scaleStat = hunterData.scaleStat;
        const flatStatsFromScore = Math.round(score * getScaleConversionRate(scaleStat));
        
        // 🔍 Analyse détaillée du score
        const breakdown = {
            mainStatAnalysis: analyzeMainStat(),
            subStatsAnalysis: analyzeSubStats(),
            setAnalysis: analyzeSet(),
            rollQualityAnalysis: analyzeRollQuality()
        };

        return {
            scaleStat,
            flatStatsFromScore,
            breakdown,
            hunterData
        };
    };

    // 🎯 KAISEL: Analyse MainStat intelligente
    const analyzeMainStat = () => {
        const hunterKey = getHunterKey(hunter);
        const hunterData = BUILDER_DATA[hunterKey];
        
        if (!hunterData || !artifact.mainStat) return { score: 0, status: 'unknown', message: 'Analyse impossible' };

        // Récupérer les mainStats recommandées pour ce slot
        const firstSet = Object.keys(hunterData.artifactSets)[0];
        const recommendedMainStats = hunterData.artifactSets[firstSet]?.mainStats;
        const slotKey = artifact.title.toLowerCase();
        const expectedMainStat = recommendedMainStats?.[slotKey];

        if (artifact.mainStat === expectedMainStat) {
            return { 
                score: 100, 
                status: 'perfect', 
                message: `✅ MainStat parfaite selon ${hunterData.name}`,
                expected: expectedMainStat
            };
        }

        // Vérifier si c'est au moins la stat de scale
        if (artifact.mainStat.includes(hunterData.scaleStat)) {
            return { 
                score: 75, 
                status: 'good', 
                message: `⚠️ Scale stat correcte mais ${expectedMainStat} serait optimal`,
                expected: expectedMainStat
            };
        }

        return { 
            score: 25, 
            status: 'poor', 
            message: `❌ MainStat suboptimale, change pour ${expectedMainStat}`,
            expected: expectedMainStat
        };
    };

    // 📊 KAISEL: Analyse SubStats avec priorités hunter
    const analyzeSubStats = () => {
        const hunterKey = getHunterKey(hunter);
        const hunterData = BUILDER_DATA[hunterKey];
        
        if (!hunterData || !artifact.subStats) return { averageScore: 0, details: [] };

        const priorities = hunterData.optimizationPriority;
        const topPriorityStats = priorities.slice(0, 3).map(p => p.stat);
        
        let totalScore = 0;
        const details = [];

        artifact.subStats.forEach((stat, idx) => {
            if (!stat) return;

            const levelInfo = artifact.subStatsLevels?.[idx];
            if (!levelInfo) return;

            // 🎯 Score de pertinence selon les priorités du hunter
            let relevanceScore = 20; // Base score
            const priorityIndex = topPriorityStats.findIndex(pStat => 
                stat.includes(pStat.replace('Additional ', ''))
            );
            
            if (priorityIndex === 0) relevanceScore = 100; // Priorité 1
            else if (priorityIndex === 1) relevanceScore = 80; // Priorité 2  
            else if (priorityIndex === 2) relevanceScore = 60; // Priorité 3
            else if (stat.includes('Critical Hit')) relevanceScore = 50; // Crit = toujours acceptable
            
            // 🎲 Qualité du roll
            const rollQuality = calculateRollQualityPercent(stat, levelInfo);
            
            // 📊 Score final de cette substat
            const finalScore = (relevanceScore * 0.7) + (rollQuality * 0.3);
            totalScore += finalScore;

            details.push({
                stat,
                relevanceScore,
                rollQuality: Math.round(rollQuality),
                finalScore: Math.round(finalScore),
                level: levelInfo.level || 0,
                value: levelInfo.value || 0,
                status: finalScore >= 80 ? 'excellent' : finalScore >= 60 ? 'good' : finalScore >= 40 ? 'ok' : 'poor'
            });
        });

        const averageScore = details.length > 0 ? totalScore / details.length : 0;

        return {
            averageScore: Math.round(averageScore),
            details,
            recommendation: averageScore >= 75 ? '🔥 Substats excellentes !' : 
                          averageScore >= 50 ? '👍 Substats correctes' : 
                          '❌ Substats à reroll'
        };
    };

    // 🎁 KAISEL: Analyse Set avec builder_data
    const analyzeSet = () => {
        const hunterKey = getHunterKey(hunter);
        const hunterData = BUILDER_DATA[hunterKey];
        
        if (!hunterData) return { score: 0, status: 'unknown', message: 'Hunter non supporté' };
        
        if (!artifact.set || artifact.set === '') {
            return { score: 0, status: 'missing', message: '❌ Aucun set défini' };
        }

        // Récupérer tous les sets recommandés pour ce hunter
        const recommendedSets = Object.values(hunterData.gameModes).map(mode => mode.recommendedSet);
        
        // Vérifier si le set actuel est dans les recommandations
        const isRecommended = recommendedSets.some(recSet => 
            artifact.set.toLowerCase().includes(recSet.toLowerCase()) ||
            recSet.toLowerCase().includes(artifact.set.toLowerCase())
        );

        if (isRecommended) {
            return { 
                score: 100, 
                status: 'perfect', 
                message: `✅ Set optimal pour ${hunterData.name}`,
                recommended: recommendedSets[0]
            };
        }

        return { 
            score: 30, 
            status: 'poor', 
            message: `⚠️ Set non-optimal, recommandé: ${recommendedSets[0]}`,
            recommended: recommendedSets[0]
        };
    };

    // 🎲 KAISEL: Analyse qualité des rolls
    const analyzeRollQuality = () => {
        if (!artifact.subStatsLevels || !substatsMinMaxByIncrements) {
            return { averageQuality: 0, details: [] };
        }

        const qualities = [];
        
        artifact.subStats.forEach((stat, idx) => {
            if (!stat) return;
            
            const levelInfo = artifact.subStatsLevels[idx];
            const quality = calculateRollQualityPercent(stat, levelInfo);
            
            qualities.push({
                stat,
                quality: Math.round(quality),
                status: quality >= 90 ? 'perfect' : quality >= 75 ? 'great' : quality >= 50 ? 'ok' : 'poor'
            });
        });

        const averageQuality = qualities.length > 0 ? 
            qualities.reduce((sum, q) => sum + q.quality, 0) / qualities.length : 0;

        return {
            averageQuality: Math.round(averageQuality),
            details: qualities,
            message: averageQuality >= 80 ? '🔥 Rolls excellents !' :
                    averageQuality >= 60 ? '👍 Rolls corrects' :
                    '💩 Rolls faibles...'
        };
    };

    // 🧮 HELPER: Calcul qualité roll en pourcentage
    const calculateRollQualityPercent = (stat, levelInfo) => {
        if (!substatsMinMaxByIncrements[stat] || !levelInfo.procOrders) return 50;
        
        const maxPossible = levelInfo.procOrders.reduce((sum, order) => {
            return sum + (substatsMinMaxByIncrements[stat][order]?.max || 0);
        }, 0);
        
        const actualValue = levelInfo.value || 0;
        
        if (maxPossible === 0) return 50;
        return Math.min((actualValue / maxPossible) * 100, 100);
    };

    // 🎯 HELPER: Conversion rate selon scaleStat
    const getScaleConversionRate = (scaleStat) => {
        const rates = {
            'Attack': 45,
            'Defense': 45,
            'HP': 90
        };
        return rates[scaleStat] || 45;
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

    // 🎨 KAISEL: Gestion du hover
const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = 400;
    const tooltipHeight = 500;
    const margin = 8; // Marge entre le badge et le tooltip
    
    let x, y, transform;
    
    // 🔍 DÉTERMINER LA POSITION OPTIMALE SELON LES QUADRANTS
    
    const isLeft = rect.left < viewportWidth / 2;
    const isTop = rect.top < viewportHeight / 2;
    
    if (isTop && isLeft) {
        // 🔺 HAUT-GAUCHE → Tooltip en BAS-DROITE du badge
        x = rect.right + margin;
        y = rect.bottom + margin;
        transform = 'translate(0%, 0%)';
        
        // Vérifier si ça sort de l'écran à droite
        if (x + tooltipWidth > viewportWidth - 20) {
            x = rect.left - margin;
            transform = 'translate(-100%, 0%)';
        }
        
        // Vérifier si ça sort de l'écran en bas
        if (y + tooltipHeight > viewportHeight - 20) {
            y = rect.top - margin;
            transform = transform.replace('0%', '-100%');
        }
        
    } else if (isTop && !isLeft) {
        // 🔺 HAUT-DROITE → Tooltip en BAS-GAUCHE du badge
        x = rect.left - margin;
        y = rect.bottom + margin;
        transform = 'translate(-100%, 0%)';
        
        // Vérifier si ça sort de l'écran à gauche
        if (x - tooltipWidth < 20) {
            x = rect.right + margin;
            transform = 'translate(0%, 0%)';
        }
        
        // Vérifier si ça sort de l'écran en bas
        if (y + tooltipHeight > viewportHeight - 20) {
            y = rect.top - margin;
            transform = transform.replace('0%', '-100%');
        }
        
    } else if (!isTop && isLeft) {
        // 🔻 BAS-GAUCHE → Tooltip en HAUT-DROITE du badge
        x = rect.right + margin;
        y = rect.top - margin;
        transform = 'translate(0%, -100%)';
        
        // Vérifier si ça sort de l'écran à droite
        if (x + tooltipWidth > viewportWidth - 20) {
            x = rect.left - margin;
            transform = 'translate(-100%, -100%)';
        }
        
        // Vérifier si ça sort de l'écran en haut
        if (y - tooltipHeight < 20) {
            y = rect.bottom + margin;
            transform = transform.replace('-100%', '0%');
        }
        
    } else {
        // 🔻 BAS-DROITE → Tooltip en HAUT-GAUCHE du badge
        x = rect.left - margin;
        y = rect.top - margin;
        transform = 'translate(-100%, -100%)';
        
        // Vérifier si ça sort de l'écran à gauche
        if (x - tooltipWidth < 20) {
            x = rect.right + margin;
            transform = 'translate(0%, -100%)';
        }
        
        // Vérifier si ça sort de l'écran en haut
        if (y - tooltipHeight < 20) {
            y = rect.bottom + margin;
            transform = transform.replace('-100%', '0%');
        }
    }
    
    console.log("🔥 KAISEL: Position intelligente:", { 
        quadrant: `${isTop ? 'HAUT' : 'BAS'}-${isLeft ? 'GAUCHE' : 'DROITE'}`,
        x, y, transform, 
        rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom }
    });
    
    setTooltipPosition({ x, y, transform });
    setShowTooltip(true);
};
    const handleMouseLeave = () => {
        setShowTooltip(false);
    };

    // 🧠 KAISEL: Clic pour déclencher analyse Béru complète
  const handleClick = (e) => {
    e.stopPropagation();
    console.log(`🧠 Analyse Béru demandée pour ${artifact.title}`, { artifact, hunter: hunter?.name, score });
    
    // 🔥 SOLUTION DIRECTE : Import et exécution immédiate
    triggerDirectArtifactAnalysis();
};

    // 🚀 KAISEL: Analyse directe d'artefact (bypass menu)
   const triggerDirectArtifactAnalysis = () => {
    console.log("🔥 KAISEL: showTankMessage reçu:", typeof showTankMessage);
    console.log("🔥 KAISEL: showTankMessage === parent?", showTankMessage.toString());
    // Import dynamique du système d'analyse
    import('../utils/BeruIntelligentAnalysis').then(module => {
        if (module.performSpecificArtifactAnalysis) {
            console.log("🔥 KAISEL: Déclenchement analyse spécifique pour", artifact.title);
            
            // 🎯 UTILISER showTankMessage depuis les props
            const showTankMessageFn = showTankMessage || ((msg) => {
                console.log("🧠 Béru dit:", msg);
                alert(msg); // Fallback temporaire
            });
            
            // 📜 GESTION DU RAPPORT
            const handleReportGenerated = (report) => {
                console.log("📊 Rapport généré depuis ArtifactScoreBadge:", report);
                // Déclencher l'affichage du rapport depuis le parent
                if (window.handleReportGenerated) {
                    window.handleReportGenerated(report);
                } else {
                    console.warn("⚠️ window.handleReportGenerated non trouvé");
                }
            };
            
            module.performSpecificArtifactAnalysis(
    artifact,
    hunter,
    (msg) => showTankMessageFn(msg, false, 'beru'), // ← WRAPPER avec priority = false
    () => {}, // onClose callback
    substatsMinMaxByIncrements
);
        }
    }).catch(err => {
        console.error('🐉 Kaisel: Erreur import analyse Béru:', err);
        alert('Erreur lors de l\'analyse ! Vérifiez la console.');
    });
};

    const getColor = () => {
        if (score >= 90) return 'bg-yellow-400 text-black';
        if (score >= 70) return 'bg-green-500 text-white';
        if (score >= 50) return 'bg-blue-500 text-white';
        return 'bg-gray-600 text-white';
    };

    const intelligentInfo = calculateIntelligentBreakdown();

    return (
        <>
            <div
                className={`px-2 py-1 text-xs rounded-full font-semibold cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg ${getColor()}`}
                title={`Score théorique basé sur ${hunter?.name} : ${score}/100`}
                data-artifact-slot={artifact.title}
                data-artifact-score={score}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
            >
                {score} / 100
            </div>

            {/* 🔥 TOOLTIP ULTRA-INTELLIGENT */}
   {showTooltip && (
    <div
        className="fixed z-[9999] bg-gray-900 border border-purple-500 rounded-lg p-4 text-xs text-white shadow-2xl pointer-events-none"
        style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: tooltipPosition.transform,
            minWidth: '350px',
            maxWidth: '450px'
        }}
    >
        {/* 🔥 CALCUL INTELLIGENT À L'INTÉRIEUR */}
        {(() => {
            const intelligentInfo = calculateIntelligentBreakdown();
            if (!intelligentInfo) {
                return <div className="text-red-400">❌ Analyse impossible - Hunter non supporté</div>;
            }
            
            return (
                <>
                    {/* En-tête */}
                    <div className="text-center mb-3 pb-2 border-b border-gray-700">
                        <div className="text-purple-300 font-bold text-sm">📊 Analyse Intelligence Béru</div>
                        <div className="text-xs">{artifact.title} • {hunter?.name}</div>
                    </div>

                    {/* Flat Stats équivalents */}
                    <div className="mb-3 p-2 bg-gray-800 rounded">
                        <div className="text-blue-300 font-semibold mb-1">🎯 Équivalent Flat Stats</div>
                        <div className="text-green-400 text-sm">
                            ≈ +{intelligentInfo.flatStatsFromScore} {intelligentInfo.scaleStat}
                        </div>
                        <div className="text-gray-400 text-[10px] mt-1">
                            Basé sur scale {intelligentInfo.hunterData.scaleStat} de {intelligentInfo.hunterData.name}
                        </div>
                    </div>

                    {/* Breakdown détaillé */}
                    <div className="space-y-2 mb-3">
                        {/* MainStat */}
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300">MainStat:</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded ${
                                    intelligentInfo.breakdown.mainStatAnalysis.status === 'perfect' ? 'bg-green-600' :
                                    intelligentInfo.breakdown.mainStatAnalysis.status === 'good' ? 'bg-yellow-600' :
                                    'bg-red-600'
                                }`}>
                                    {intelligentInfo.breakdown.mainStatAnalysis.score}/100
                                </span>
                            </div>
                        </div>

                        {/* SubStats */}
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300">SubStats:</span>
                            <span className="text-white">{intelligentInfo.breakdown.subStatsAnalysis.averageScore}/100</span>
                        </div>

                        {/* Set */}
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300">Set:</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded ${
                                    intelligentInfo.breakdown.setAnalysis.status === 'perfect' ? 'bg-green-600' :
                                    intelligentInfo.breakdown.setAnalysis.status === 'poor' ? 'bg-red-600' :
                                    'bg-gray-600'
                                }`}>
                                    {intelligentInfo.breakdown.setAnalysis.score}/100
                                </span>
                            </div>
                        </div>

                        {/* Roll Quality */}
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300">Roll Quality:</span>
                            <span className="text-white">{intelligentInfo.breakdown.rollQualityAnalysis.averageQuality}%</span>
                        </div>
                    </div>

                    {/* Résumé rapide */}
                    <div className="bg-slate-800/50 rounded p-2 mb-3">
                        <div className="text-yellow-400 font-semibold text-xs mb-1">🔍 Résumé</div>
                        <div className="text-[10px] space-y-1">
                            <div>{intelligentInfo.breakdown.mainStatAnalysis.message}</div>
                            <div>{intelligentInfo.breakdown.setAnalysis.message}</div>
                            <div>{intelligentInfo.breakdown.rollQualityAnalysis.message}</div>
                        </div>
                    </div>

                    {/* Call to action */}
                    <div className="text-center pt-2 border-t border-gray-700">
                        <div className="text-purple-300 text-[10px] animate-pulse font-bold">
                            🧠 Clic pour analyse complète Béru + comparaison localStorage
                        </div>
                    </div>
                </>
            );
        })()}
    </div>
)}
        </>
    );
};

export default ArtifactScoreBadge;