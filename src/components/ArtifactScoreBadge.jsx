// 📁 /components/ArtifactScoreBadge.jsx

import React from 'react';
import { getTheoreticalScore } from '../utils/statPriority';

const ArtifactScoreBadge = ({ artifact, hunter, substatsMinMaxByIncrements }) => {
    const score = getTheoreticalScore(hunter, artifact, substatsMinMaxByIncrements) 


    if (score === null) return null;

        if (!artifact || !hunter || !substatsMinMaxByIncrements) {
  return null;
}

    const getColor = () => {
        if (score >= 90) return 'bg-yellow-400 text-black';
        if (score >= 70) return 'bg-green-500 text-white';
        if (score >= 50) return 'bg-blue-500 text-white';
        return 'bg-gray-600 text-white';
    };

    return (
        <div
            className={`px-2 py-1 text-xs rounded-full font-semibold ${getColor()}`}
            title={`Score théorique basé sur les stats : ${score}/100`}
        >
            {score} / 100
        </div>
    );
};

export default ArtifactScoreBadge;
