import React from 'react';
import { useTranslation } from 'react-i18next';
import { getOptimizationStatus, getOverallOptimization, getCurrentBenchmark, CHARACTER_OPTIMIZATION } from '../../data/characterOptimization';

// 🎯 Indicateur de sweet spot pour une stat individuelle
export const StatOptimizationIndicator = ({ characterId, statName, currentValue, showLabel = true }) => {
    const { t } = useTranslation();
    const status = getOptimizationStatus(characterId, statName, currentValue);
    const charOptim = CHARACTER_OPTIMIZATION[characterId];
    const sweetSpot = charOptim?.sweetSpots?.[statName];

    if (!sweetSpot) return null;

    const getStatusIcon = () => {
        switch (status.status) {
            case 'optimal': return '✓';
            case 'good': return '◐';
            case 'improving': return '△';
            case 'low': return '▽';
            default: return '?';
        }
    };

    const getStatusMessage = () => t(`optimization.status.${status.status || 'unknown'}`);

    return (
        <div className="flex items-center gap-1.5">
            <div
                className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold"
                style={{
                    backgroundColor: `${status.color}20`,
                    color: status.color,
                    border: `1.5px solid ${status.color}`
                }}
                title={`${getStatusMessage()} - ${t('optimization.sweetSpots.ideal')}: ${sweetSpot.ideal}${statName === 'critRate' || statName === 'critDMG' || statName === 'defPen' ? '%' : ''}`}
            >
                {getStatusIcon()}
            </div>
            {showLabel && (
                <span className="text-xs" style={{ color: status.color }}>
                    {currentValue.toFixed(1)}% / {sweetSpot.ideal}%
                </span>
            )}
        </div>
    );
};

// 🎯 Barre de progression vers le sweet spot
export const OptimizationProgressBar = ({ characterId, statName, currentValue, compact = false }) => {
    const { t } = useTranslation();
    const status = getOptimizationStatus(characterId, statName, currentValue);
    const charOptim = CHARACTER_OPTIMIZATION[characterId];
    const sweetSpot = charOptim?.sweetSpots?.[statName];

    if (!sweetSpot) return null;

    const getStatLabel = () => t(`optimization.stats.${statName}`);

    return (
        <div className={`${compact ? 'mb-1' : 'mb-2'}`}>
            <div className="flex justify-between items-center mb-0.5">
                <span className="text-xs text-gray-400">{getStatLabel()}</span>
                <span className="text-xs" style={{ color: status.color }}>
                    {currentValue.toFixed(1)}% → {sweetSpot.ideal}%
                </span>
            </div>
            <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                        width: `${Math.min(status.percentage, 100)}%`,
                        backgroundColor: status.color
                    }}
                />
            </div>
        </div>
    );
};

// 🎯 Card d'optimisation complète pour un personnage
export const OptimizationCard = ({ characterId, stats, compact = false }) => {
    const { t } = useTranslation();
    const charOptim = CHARACTER_OPTIMIZATION[characterId];
    const overall = getOverallOptimization(characterId, stats);
    const benchmark = getCurrentBenchmark(characterId, stats);

    if (!charOptim || !overall) return null;

    if (compact) {
        return (
            <div className="flex items-center gap-2 px-2 py-1 bg-gray-800/50 rounded-lg">
                <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: overall.overallColor }}
                    title={`${t('optimization.title')}: ${overall.avgPercentage.toFixed(0)}%`}
                />
                <span className="text-xs text-gray-300">{overall.avgPercentage.toFixed(0)}%</span>
                {benchmark && (
                    <span className="text-xs" style={{ color: benchmark.color }}>
                        {t(`optimization.benchmarks.${benchmark.level}`)}
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/50">
            {/* Header avec score global */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: overall.overallColor }}
                    />
                    <span className="text-sm font-medium text-white">
                        {t('optimization.title')}: {overall.avgPercentage.toFixed(0)}%
                    </span>
                </div>
                {benchmark && (
                    <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                            backgroundColor: `${benchmark.color}20`,
                            color: benchmark.color
                        }}
                    >
                        {t(`optimization.benchmarks.${benchmark.level}`)}
                    </span>
                )}
            </div>

            {/* Barres de progression par stat */}
            <div className="space-y-2">
                <OptimizationProgressBar
                    characterId={characterId}
                    statName="critRate"
                    currentValue={stats.critRate || 0}
                />
                <OptimizationProgressBar
                    characterId={characterId}
                    statName="critDMG"
                    currentValue={stats.critDMG || 0}
                />
                <OptimizationProgressBar
                    characterId={characterId}
                    statName="defPen"
                    currentValue={stats.defPen || 0}
                />
            </div>

            {/* Sweet spots targets */}
            <div className="mt-3 pt-2 border-t border-gray-700/50">
                <div className="text-xs text-gray-400 mb-1">{t('optimization.sweetSpots.title')}:</div>
                <div className="flex gap-3 text-xs">
                    <span style={{ color: charOptim.sweetSpots.critRate.color }}>
                        {t('optimization.stats.critRate')}: {charOptim.sweetSpots.critRate.ideal}%
                    </span>
                    <span style={{ color: charOptim.sweetSpots.critDMG.color }}>
                        {t('optimization.stats.critDMG')}: {charOptim.sweetSpots.critDMG.ideal}%
                    </span>
                    <span style={{ color: charOptim.sweetSpots.defPen.color }}>
                        {t('optimization.stats.defPen')}: {charOptim.sweetSpots.defPen.ideal}%
                    </span>
                </div>
            </div>
        </div>
    );
};

// 🎯 Indicateur inline compact pour afficher à côté d'une stat
export const InlineOptimizationDot = ({ characterId, statName, currentValue }) => {
    const { t } = useTranslation();
    const status = getOptimizationStatus(characterId, statName, currentValue);
    const charOptim = CHARACTER_OPTIMIZATION[characterId];
    const sweetSpot = charOptim?.sweetSpots?.[statName];

    if (!sweetSpot) return null;

    const diff = sweetSpot.ideal - currentValue;
    const showDiff = status.status !== 'optimal' && diff > 0;
    const statusMessage = t(`optimization.status.${status.status || 'unknown'}`);

    return (
        <span
            className="inline-flex items-center gap-1 ml-1"
            title={`${statusMessage} - ${t('optimization.sweetSpots.ideal')}: ${sweetSpot.ideal}%`}
        >
            <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: status.color }}
            />
            {showDiff && (
                <span className="text-xs text-gray-500">
                    (+{diff.toFixed(1)}%)
                </span>
            )}
        </span>
    );
};

// 🎯 Tooltip/Popover avec les recommandations
export const OptimizationTooltip = ({ characterId, children }) => {
    const { t } = useTranslation();
    const charOptim = CHARACTER_OPTIMIZATION[characterId];
    const [isHovered, setIsHovered] = React.useState(false);

    if (!charOptim) return children;

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {children}
            {isHovered && (
                <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 rounded-lg shadow-xl border border-gray-700">
                    <div className="text-sm font-medium text-white mb-2">
                        {charOptim.name} - {t(`optimization.roles.${charOptim.roleKey || 'dpsBurst'}`)}
                    </div>

                    {/* Priorité des substats */}
                    <div className="text-xs text-gray-400 mb-1">{t('optimization.substats.title')}:</div>
                    <div className="text-xs text-gray-300 mb-2">
                        {charOptim.substatPriority.join(' > ')}
                    </div>

                    {/* Tips */}
                    <div className="text-xs text-gray-400 mb-1">{t('optimization.tips.title')}:</div>
                    <ul className="text-xs text-gray-300 space-y-1">
                        {charOptim.tips.slice(0, 2).map((tip, i) => (
                            <li key={i} className="flex items-start gap-1">
                                <span className="text-yellow-500">•</span>
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>

                    {/* Sets recommandés */}
                    <div className="mt-2 pt-2 border-t border-gray-700">
                        <div className="text-xs text-gray-400">{t('optimization.sets.title')}:</div>
                        <div className="text-xs text-purple-400">
                            {charOptim.recommendedSets[0]}
                        </div>
                    </div>

                    {/* Flèche du tooltip */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                        <div className="border-8 border-transparent border-t-gray-900" />
                    </div>
                </div>
            )}
        </div>
    );
};

// 🎯 Mini badge d'optimisation pour la liste des personnages
export const OptimizationBadge = ({ characterId, stats }) => {
    const { t } = useTranslation();
    const overall = getOverallOptimization(characterId, stats);

    if (!overall) return null;

    const getBadgeIcon = () => {
        switch (overall.overallStatus) {
            case 'optimal': return '★';
            case 'good': return '◆';
            case 'improving': return '●';
            case 'low': return '○';
            default: return '?';
        }
    };

    return (
        <div
            className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
            style={{
                backgroundColor: `${overall.overallColor}20`,
                color: overall.overallColor,
                border: `2px solid ${overall.overallColor}`
            }}
            title={`${t('optimization.title')}: ${overall.avgPercentage.toFixed(0)}%`}
        >
            {getBadgeIcon()}
        </div>
    );
};

export default {
    StatOptimizationIndicator,
    OptimizationProgressBar,
    OptimizationCard,
    InlineOptimizationDot,
    OptimizationTooltip,
    OptimizationBadge
};
