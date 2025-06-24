import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import ArtifactCard from "./ArtifactCard"
import ArtifactScoreBadge from './ArtifactScoreBadge';
import { getTheoreticalScore, getMainStatPriorities } from '../utils/statPriority'; // si nécessaire
import { getMainStatsByArtifactType } from '../utils/statPriority';
import { mainStatMaxByIncrements } from '../BuilderBeru.jsx'

function computeStatValue(stat, artifact) {
  const idx = artifact.subStats.findIndex(s => s === stat);
  return idx !== -1 ? artifact.subStatsLevels[idx]?.value || 0 : 0;
}

function computeFlatScalingValue(artifact, flatStats, scalingKey) {
  let total = 0;

  // 1. Check MainStat (ex: Defense %)
  if (artifact.mainStat === `${scalingKey} %`) {
    total += (flatStats[scalingKey] * (mainStatMaxByIncrements[`${scalingKey} %`][0] || 0)) / 100;
  }

   if (artifact.mainStat === `Additional ${scalingKey}`) {
    total += mainStatMaxByIncrements[`Additional ${scalingKey}`][0] || 0;
  }


  // 2. Check subStats (both % and flat)
  artifact.subStats.forEach((stat, idx) => {
    const value = artifact.subStatsLevels[idx]?.value || 0;

    if (stat === `${scalingKey} %`) {
      total += (flatStats[scalingKey] * value) / 100;
    }

    if (stat === `Additional ${scalingKey}`) {
      total += value;
    }
  });

  return Math.round(total * 10) / 10; // arrondi à une décimale
}


function computeScalingStat(scale, artifact, flatStats) {
  const percentIdx = artifact.subStats.findIndex(s => s === `${scale} %`);
  const additionalIdx = artifact.subStats.findIndex(s => s === `Additional ${scale}`);

  const percent = percentIdx !== -1 ? artifact.subStatsLevels[percentIdx]?.value || 0 : 0;
  const additional = additionalIdx !== -1 ? artifact.subStatsLevels[additionalIdx]?.value || 0 : 0;
  const baseFlat = flatStats?.[scale] || 0;

  const statDiffSummary = useMemo(() => {
  const stats = [];

  importantStats.forEach(stat => {
    const left = original.original.subStats?.includes(stat)
      ? original.original.subStatsLevels[original.original.subStats.indexOf(stat)]?.value || 0
      : 0;

    const right = draftArtifact.subStats?.includes(stat)
      ? draftArtifact.subStatsLevels[draftArtifact.subStats.indexOf(stat)]?.value || 0
      : 0;

    const diff = right - left;

    stats.push({
      label: stat,
      left: left.toFixed(2),
      right: right.toFixed(2),
      diff: diff.toFixed(2),
    });
  });

  return stats.filter(stat => stat.left > 0 || stat.right > 0);
}, [original.original, draftArtifact]);

  const importantStats = [
  "Additional Attack", "Attack %",
  "Additional Defense", "Defense %",
  "Additional HP", "HP %",
  "Defense Penetration",
  "Critical Hit Rate",
  "Critical Hit Damage",
  "Damage Increase"
];

  return Math.round((percent / 100) * baseFlat + additional);
}
// const importantStats = computeImportantStats(original, draftArtifact, hunter, flatStats);
function computeImportantStats(original, candidate, hunter, flatStats) {
  const scale = hunter?.scaling || "Defense"; // fallback
  

//   const leftFlatScaling = computeFlatScalingValue(original.original, flatStats, hunter.scaleStat);
// const rightFlatScaling = computeFlatScalingValue(draftArtifact, flatStats, hunter.scaleStat);

  return [
    {
      label: scale,
      left: computeScalingStat(scale, left, flatStats),
      right: computeScalingStat(scale, right, flatStats),
    },
    {
      label: 'Critical Hit Rate',
      left: computeStatValue('Critical Hit Rate', left),
      right: computeStatValue('Critical Hit Rate', right),
    },
    {
      label: 'Critical Hit Damage',
      left: computeStatValue('Critical Hit Damage', left),
      right: computeStatValue('Critical Hit Damage', right),
    },
    {
      label: 'Defense Penetration',
      left: computeStatValue('Defense Penetration', left),
      right: computeStatValue('Defense Penetration', right),
    },
    {
      label: 'Damage Increase',
      left: computeStatValue('Damage Increase', left),
      right: computeStatValue('Damage Increase', right),
    }
  ].map(stat => ({
    ...stat,
    diff: Math.round(stat.right - stat.left)
  }));
}

const ComparisonPopup = ({ original, onClose, hunter, flatStats,
  statsWithoutArtefact, substatsMinMaxByIncrements, showTankMessage, recalculateStatsFromArtifacts }) => {
  const [draftArtifact, setDraftArtifact] = useState({
    mainStat: '',
    subStats: ['', '', '', ''],
    subStatsLevels: [
      { value: 0, level: 0, procOrders: [], procValues: [] },
      { value: 0, level: 0, procOrders: [], procValues: [] },
      { value: 0, level: 0, procOrders: [], procValues: [] },
      { value: 0, level: 0, procOrders: [], procValues: [] }
    ],
  });

  useEffect(() => {
  setDraftArtifact(prev => ({ ...prev, title: original.original.title }));
}, [original.original.title]);

  const candidate = { ...draftArtifact, title: original.original.title };

  const getMainStatsForType = (title) => {
    switch (title) {
      case "Helmet": return ["Attack", "Defense", "HP"];
      case "Chest": return ["Defense"];
      case "Gloves": return ["Attack"];
      case "Boots": return ["Critical Hit Damage"];
      case "Necklace": return ["HP"];
      case "Bracelet": return ["Fire", "Water", "Dark", "Light", "Wind"];
      case "Ring": return ["Attack", "HP", "Defense"];
      case "Earring": return ["MP Recovery Rate"];
      default: return [];
    }
  };

  const originalScore = getTheoreticalScore(hunter, original.original, substatsMinMaxByIncrements);
const candidateScore = getTheoreticalScore(hunter, draftArtifact, substatsMinMaxByIncrements);
const availableMainStats = getMainStatsByArtifactType(original.original.title);


const leftFlatScaling = computeFlatScalingValue(original.original, flatStats, hunter.scaleStat);
const rightFlatScaling = computeFlatScalingValue(draftArtifact, flatStats, hunter.scaleStat);

const statDiffSummary = [
  {
    label: hunter.scaleStat,
    left: `${leftFlatScaling}`,
    right: `${rightFlatScaling}`,
    diff: (rightFlatScaling - leftFlatScaling).toFixed(2),
  },
  ...['Damage Increase', 'Defense Penetration', 'Critical Hit Rate', 'Critical Hit Damage'].map(stat => {
    const leftIdx = original.original.subStats.indexOf(stat);
    const rightIdx = draftArtifact.subStats.indexOf(stat);

    const leftValue = leftIdx !== -1 ? original.original.subStatsLevels[leftIdx]?.value || 0 : 0;
    const rightValue = rightIdx !== -1 ? draftArtifact.subStatsLevels[rightIdx]?.value || 0 : 0;

    return {
      label: stat,
      left: leftValue.toFixed(2),
      right: rightValue.toFixed(2),
      diff: (rightValue - leftValue).toFixed(2),
    };
  })
];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#0b0b1f] p-4 rounded-lg w-[90vw] max-w-5xl shadow-lg text-white relative">
        <button onClick={onClose} className="absolute top-2 right-3 text-sm text-gray-300 hover:text-white">✖</button>
        <h2 className="text-lg font-bold mb-4 text-center">Artifact Comparison</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold mb-1 text-gray-300">Original</h3>
            <ArtifactCard
              // key={original.title} 
              title={original.original.title}
              mainStats={[original.original.mainStat]}
              artifactData={original.original}
              onArtifactChange={() => { }} // grisé = pas modifiable
              hunter={hunter}
              substatsMinMaxByIncrements={substatsMinMaxByIncrements}
              showTankMessage={() => { }}
              recalculateStatsFromArtifacts={recalculateStatsFromArtifacts}
              flatStats={flatStats}
              statsWithoutArtefact={statsWithoutArtefact}
              mode="view"
              disableComparisonButton={true} // 👈 AJOUT
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-1 text-gray-300">New Candidate</h3>
            <ArtifactCard
              title={original.original.title}
              mainStats={availableMainStats} // 👈 ici, on injecte la liste dynamique
              artifactData={candidate}
              onArtifactChange={setDraftArtifact}
              hunter={hunter}
              substatsMinMaxByIncrements={substatsMinMaxByIncrements}
              showTankMessage={showTankMessage}
              recalculateStatsFromArtifacts={recalculateStatsFromArtifacts}
              flatStats={flatStats}
              statsWithoutArtefact={statsWithoutArtefact}
              openComparisonPopup={() => { }}
              mode="edit"
              disableComparisonButton={true} // 👈 AJOUT
            />
          </div>
        </div>
      <div className="w-1/2 ml-0 mr-auto grid grid-cols-4 gap-1 text-sm mt-6 bg-[#161628] p-4 rounded-lg text-white">
  {statDiffSummary.map((stat, idx) => (
    <React.Fragment key={idx}>
      <div className="text-left text-xs text-gray-400">{stat.label}</div>
      <div className="text-right">{Math.round(stat.left)}</div>
      <div className={`text-center font-bold ${stat.diff > 0 ? 'text-green-400' : stat.diff < 0 ? 'text-red-400' : 'text-white'}`}>
        {stat.diff > 0 ? '+' : ''}{Math.round(stat.diff)}
      </div>
      <div className="text-left">{Math.round(stat.right)}</div>
    </React.Fragment>
  ))}
</div>
      </div>
    </div>
  );
}

export default ComparisonPopup;