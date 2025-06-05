import React from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';

const SungStatsRadar = ({ stats }) => {

  const labelMap = {
    strength: 'Str',
    intelligence: 'Int',
    vitality: 'Vit',
    perception: 'Per',
    agility: 'Agi',
  };

  const data = Object.entries(stats).map(([key, value]) => ({
    stat: labelMap[key] || key,
    value: Number(value),
  }));




  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <RadarChart cx="50%" cy="35%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#444" strokeDasharray="3 3" />
          <PolarAngleAxis dataKey="stat" stroke="#a855f7"
            tick={{ fontSize: 12, fill: "#a855f7" }} />
          <PolarRadiusAxis angle={30} domain={[0, Math.max(...data.map(d => d.value))]} stroke="#666" tick={{ fontSize: 10 }} />
          <Radar name="Stats" dataKey="value" stroke="#9333ea" fill="#9333ea" fillOpacity={0.5} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SungStatsRadar;