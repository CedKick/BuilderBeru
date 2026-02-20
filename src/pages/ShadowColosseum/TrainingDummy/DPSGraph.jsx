// src/pages/ShadowColosseum/TrainingDummy/DPSGraph.jsx
// DPS Graph component - Warcraft Logs style with peaks and valleys

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatDamage, formatTime } from './formatters';

const COLORS = [
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#10b981', // green
  '#ef4444', // red
  '#06b6d4', // cyan
];

export default function DPSGraph({ dpsHistory, fighters }) {
  if (!dpsHistory || dpsHistory.length === 0) {
    return (
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-center text-gray-400">
          📊 Graphique DPS - En attente de données...
        </h3>
      </div>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 border border-purple-400/50 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-bold text-white mb-2">{formatTime(label)}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              <span className="font-bold">{entry.name}:</span> {formatDamage(entry.value)}/s
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-xl p-4 border border-purple-400/30">
      <h3 className="text-lg font-bold text-center text-purple-300 mb-4">
        📊 DPS en temps réel (style Warcraft Logs)
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={dpsHistory}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis
            dataKey="time"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickFormatter={(value) => formatTime(value)}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickFormatter={(value) => formatDamage(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '10px' }}
            iconType="line"
          />

          {/* Line for each fighter */}
          {fighters.map((fighter, idx) => (
            <Line
              key={fighter.id}
              type="monotone"
              dataKey={fighter.id}
              name={fighter.name}
              stroke={COLORS[idx % COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            />
          ))}

          {/* Dummy DPS line (if it attacks) */}
          <Line
            type="monotone"
            dataKey="dummy"
            name="Mannequin"
            stroke="#f97316"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Legend with current DPS */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="grid grid-cols-3 gap-2">
          {fighters.map((fighter, idx) => {
            const latestDPS = dpsHistory[dpsHistory.length - 1]?.[fighter.id] || 0;
            return (
              <div
                key={fighter.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-black/30 border border-white/10"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400 truncate">{fighter.name}</div>
                  <div className="text-xs font-bold" style={{ color: COLORS[idx % COLORS.length] }}>
                    {formatDamage(latestDPS)}/s
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
