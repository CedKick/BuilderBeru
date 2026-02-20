// src/pages/ShadowColosseum/SharedBattleComponents/SharedDPSGraph.jsx
// Shared DPS Graph component - Warcraft Logs style
// Used by both Training Dummy and Raid Mode

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDamage, formatTime } from './sharedFormatters';
import { Eye, EyeOff, ZoomIn, RotateCcw } from 'lucide-react';

const COLORS = [
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#10b981', // green
  '#ef4444', // red
  '#06b6d4', // cyan
];

export default function SharedDPSGraph({ dpsHistory, fighters, bossData = null }) {
  const [viewMode, setViewMode] = useState('individual'); // 'individual' | 'total'
  const [visibleLines, setVisibleLines] = useState({});

  // Sync visibleLines with current fighters (add new fighters as visible)
  useEffect(() => {
    setVisibleLines(prev => {
      const updated = { ...prev };
      fighters.forEach(f => {
        if (updated[f.id] === undefined) {
          updated[f.id] = true; // New fighter, make visible by default
        }
      });
      if (bossData && updated[bossData.id] === undefined) {
        updated[bossData.id] = true;
      }
      return updated;
    });
  }, [fighters, bossData]);

  // Calculate total DPS data (MUST be before early return to respect Hooks rules)
  const totalDpsHistory = useMemo(() => {
    if (!dpsHistory || dpsHistory.length === 0) return [];
    return dpsHistory.map(snapshot => {
      let total = 0;
      fighters.forEach(f => {
        if (visibleLines[f.id]) {
          total += snapshot[f.id] || 0;
        }
      });
      if (bossData && visibleLines[bossData.id]) {
        total += snapshot[bossData.id] || 0;
      }
      return { time: snapshot.time, total };
    });
  }, [dpsHistory, fighters, bossData, visibleLines]);

  // Y-axis zoom state
  const [yZoomMax, setYZoomMax] = useState(null); // null = auto
  const chartContainerRef = useRef(null);

  // Calculate natural Y max from current data
  const naturalYMax = useMemo(() => {
    const data = viewMode === 'total' ? totalDpsHistory : dpsHistory;
    if (!data || data.length === 0) return 1000;
    let max = 0;
    data.forEach(snapshot => {
      if (viewMode === 'total') {
        max = Math.max(max, snapshot.total || 0);
      } else {
        fighters.forEach(f => {
          if (visibleLines[f.id]) {
            max = Math.max(max, snapshot[f.id] || 0);
          }
        });
      }
    });
    return Math.ceil(max * 1.1) || 1000; // +10% padding
  }, [dpsHistory, totalDpsHistory, fighters, visibleLines, viewMode]);

  // Reset zoom when switching view mode
  useEffect(() => {
    setYZoomMax(null);
  }, [viewMode]);

  // Wheel zoom handler
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const currentMax = yZoomMax || naturalYMax;
    const zoomFactor = 0.15;

    if (e.deltaY < 0) {
      // Scroll up → zoom in (reduce Y max)
      const newMax = Math.max(currentMax * (1 - zoomFactor), naturalYMax * 0.02);
      setYZoomMax(newMax);
    } else {
      // Scroll down → zoom out (increase Y max)
      const newMax = currentMax * (1 + zoomFactor);
      if (newMax >= naturalYMax) {
        setYZoomMax(null); // Reset to auto
      } else {
        setYZoomMax(newMax);
      }
    }
  }, [yZoomMax, naturalYMax]);

  // Attach non-passive wheel listener to prevent page scroll
  useEffect(() => {
    const el = chartContainerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const isZoomed = yZoomMax !== null;
  const zoomPercent = isZoomed ? Math.round((yZoomMax / naturalYMax) * 100) : 100;

  if (!dpsHistory || dpsHistory.length === 0) {
    return (
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-center text-gray-400">
          📊 Graphique DPS - En attente de données...
        </h3>
      </div>
    );
  }

  const toggleLine = (id) => {
    setVisibleLines(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = (visible) => {
    const newState = {};
    fighters.forEach(f => { newState[f.id] = visible; });
    if (bossData) newState[bossData.id] = visible;
    setVisibleLines(newState);
  };

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
      {/* Header with mode toggle */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-purple-300">
            📊 DPS en temps réel (style Warcraft Logs)
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('individual')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'individual'
                ? 'bg-purple-600/30 border border-purple-400/50 text-purple-200'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            Individuel
          </button>
          <button
            onClick={() => setViewMode('total')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'total'
                ? 'bg-purple-600/30 border border-purple-400/50 text-purple-200'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            Total DPS
          </button>
        </div>
      </div>

      {/* Zoom indicator */}
      {isZoomed && (
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5 text-xs text-cyan-400">
            <ZoomIn className="w-3 h-3" />
            <span>Zoom: {zoomPercent}% — max {formatDamage(yZoomMax)}/s</span>
          </div>
          <button
            onClick={() => setYZoomMax(null)}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-600/30 transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      )}

      <div ref={chartContainerRef} className="relative cursor-ns-resize">
        {!isZoomed && (
          <div className="absolute top-2 right-2 z-10 text-[10px] text-gray-500 pointer-events-none">
            Scroll pour zoomer ↕
          </div>
        )}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={viewMode === 'total' ? totalDpsHistory : dpsHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis
              dataKey="time"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => formatTime(value)}
            />
            <YAxis
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              tickFormatter={(value) => formatDamage(value)}
              domain={[0, yZoomMax || 'auto']}
              allowDataOverflow={!!yZoomMax}
            />
            <Tooltip content={<CustomTooltip />} />

          {viewMode === 'total' ? (
            <Line
              type="monotone"
              dataKey="total"
              name="DPS Total"
              stroke="#fbbf24"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }}
            />
          ) : (
            fighters.filter(f => visibleLines[f.id]).map((fighter, idx) => (
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
            ))
          )}
          {viewMode !== 'total' && bossData && visibleLines[bossData.id] && (
            <Line
              type="monotone"
              dataKey={bossData.id}
              name={bossData.name}
              stroke="#f97316"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      </div>

      {/* Legend with current DPS - clickable to show/hide */}
      <div className="mt-4 pt-4 border-t border-white/10">
        {/* Toggle all buttons */}
        {viewMode === 'individual' && (
          <div className="flex gap-2 mb-3 justify-center">
            <button
              onClick={() => toggleAll(true)}
              className="px-2 py-1 rounded text-xs font-bold bg-green-600/20 border border-green-500/30 text-green-300 hover:bg-green-600/30 transition-all"
            >
              Tout afficher
            </button>
            <button
              onClick={() => toggleAll(false)}
              className="px-2 py-1 rounded text-xs font-bold bg-red-600/20 border border-red-500/30 text-red-300 hover:bg-red-600/30 transition-all"
            >
              Tout masquer
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {fighters.map((fighter, idx) => {
            const latestDPS = dpsHistory[dpsHistory.length - 1]?.[fighter.id] || 0;
            const isVisible = visibleLines[fighter.id];
            return (
              <button
                key={fighter.id}
                onClick={() => viewMode === 'individual' && toggleLine(fighter.id)}
                className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                  viewMode === 'individual' ? 'cursor-pointer hover:bg-white/10' : 'cursor-default'
                } ${
                  isVisible
                    ? 'bg-black/30 border-white/10'
                    : 'bg-black/10 border-white/5 opacity-50'
                }`}
                disabled={viewMode === 'total'}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: isVisible ? COLORS[idx % COLORS.length] : '#444' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400 truncate">{fighter.name}</div>
                  <div
                    className="text-xs font-bold"
                    style={{ color: isVisible ? COLORS[idx % COLORS.length] : '#666' }}
                  >
                    {formatDamage(latestDPS)}/s
                  </div>
                </div>
                {viewMode === 'individual' && (
                  isVisible ? (
                    <Eye className="w-3 h-3 text-green-400 flex-shrink-0" />
                  ) : (
                    <EyeOff className="w-3 h-3 text-gray-600 flex-shrink-0" />
                  )
                )}
              </button>
            );
          })}

          {/* Total DPS display in individual mode */}
          {viewMode === 'total' && (
            <div className="col-span-3 flex items-center justify-center gap-2 p-3 rounded-lg bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-2 border-yellow-400/30">
              <div className="w-4 h-4 rounded-full bg-yellow-400" />
              <div>
                <div className="text-xs text-gray-300">DPS Total Combiné</div>
                <div className="text-lg font-bold text-yellow-400">
                  {formatDamage(totalDpsHistory[totalDpsHistory.length - 1]?.total || 0)}/s
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
