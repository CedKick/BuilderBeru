// src/pages/ShadowColosseum/SharedBattleComponents/SharedDPSGraph.jsx
// Shared DPS Graph component - Warcraft Logs style
// Used by both Training Dummy and Raid Mode

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
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

export default function SharedDPSGraph({ dpsHistory, fighters, bossData = null, averageMode = false, metricLabel = null }) {
  const [viewMode, setViewMode] = useState('individual'); // 'individual' | 'total'
  const [visibleLines, setVisibleLines] = useState({});

  // Time range slider state (for averageMode)
  const maxTime = dpsHistory?.length > 0 ? dpsHistory[dpsHistory.length - 1]?.time || 0 : 0;
  const [rangeStart, setRangeStart] = useState(0);
  const [rangeEnd, setRangeEnd] = useState(maxTime);
  const sliderRef = useRef(null);
  const draggingRef = useRef(null); // 'start' | 'end' | null

  // Reset range when data changes
  useEffect(() => {
    setRangeStart(0);
    setRangeEnd(maxTime);
  }, [maxTime]);

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

  // ─── Time range slider drag logic ────────────────────────
  const getTimeFromX = useCallback((clientX) => {
    if (!sliderRef.current || maxTime <= 0) return 0;
    const rect = sliderRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    // Snap to 0.5s increments
    return Math.round(pct * maxTime * 2) / 2;
  }, [maxTime]);

  const handleSliderDown = useCallback((e, handle) => {
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = handle;
    const onMove = (ev) => {
      const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const t = getTimeFromX(clientX);
      if (draggingRef.current === 'start') {
        setRangeStart(Math.min(t, rangeEnd - 0.5));
      } else if (draggingRef.current === 'end') {
        setRangeEnd(Math.max(t, rangeStart + 0.5));
      }
    };
    const onUp = () => {
      draggingRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
  }, [getTimeFromX, rangeStart, rangeEnd]);

  // Use refs for latest rangeStart/rangeEnd in closure
  const rangeStartRef = useRef(rangeStart);
  const rangeEndRef = useRef(rangeEnd);
  rangeStartRef.current = rangeStart;
  rangeEndRef.current = rangeEnd;

  const handleSliderDownStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = 'start';
    const onMove = (ev) => {
      const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const t = getTimeFromX(clientX);
      setRangeStart(prev => Math.max(0, Math.min(t, rangeEndRef.current - 0.5)));
    };
    const onUp = () => {
      draggingRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
  }, [getTimeFromX]);

  const handleSliderDownEnd = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = 'end';
    const onMove = (ev) => {
      const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const t = getTimeFromX(clientX);
      setRangeEnd(prev => Math.min(maxTime, Math.max(t, rangeStartRef.current + 0.5)));
    };
    const onUp = () => {
      draggingRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
  }, [getTimeFromX, maxTime]);

  // ─── Average calculation using time range ────────────────
  const rangeAvg = useMemo(() => {
    if (!averageMode || !dpsHistory || dpsHistory.length < 2) return {};
    const inRange = dpsHistory.filter(s => s.time >= rangeStart && s.time <= rangeEnd);
    if (inRange.length === 0) return {};
    const avgs = {};
    fighters.forEach(f => {
      avgs[f.id] = Math.floor(inRange.reduce((s, snap) => s + (snap[f.id] || 0), 0) / inRange.length);
    });
    return avgs;
  }, [averageMode, dpsHistory, fighters, rangeStart, rangeEnd]);

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

  // Slider positions as percentages
  const startPct = maxTime > 0 ? (rangeStart / maxTime) * 100 : 0;
  const endPct = maxTime > 0 ? (rangeEnd / maxTime) * 100 : 100;
  const isFullRange = rangeStart <= 0 && rangeEnd >= maxTime;

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-xl p-4 border border-purple-400/30">
      {/* Header with mode toggle */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-purple-300">
            {metricLabel ? `📊 ${metricLabel}` : '📊 DPS en temps réel (style Warcraft Logs)'}
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

            {/* Highlight selected range */}
            {averageMode && !isFullRange && (
              <ReferenceArea x1={rangeStart} x2={rangeEnd} fill="#8b5cf6" fillOpacity={0.08} stroke="#8b5cf6" strokeOpacity={0.3} />
            )}

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

      {/* ─── Time Range Slider (averageMode only) ─── */}
      {averageMode && maxTime > 0 && (
        <div className="mt-2 px-1">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[10px] text-gray-500">
              Periode: <span className="text-purple-300 font-bold">{formatTime(rangeStart)}</span> → <span className="text-purple-300 font-bold">{formatTime(rangeEnd)}</span>
              {!isFullRange && <span className="text-gray-600 ml-1">({(rangeEnd - rangeStart).toFixed(1)}s)</span>}
            </div>
            {!isFullRange && (
              <button
                onClick={() => { setRangeStart(0); setRangeEnd(maxTime); }}
                className="text-[10px] text-gray-500 hover:text-purple-300 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
          {/* Slider track */}
          <div
            ref={sliderRef}
            className="relative h-8 select-none touch-none"
            style={{ cursor: 'default' }}
          >
            {/* Background bar */}
            <div className="absolute top-3 left-0 right-0 h-2 rounded-full bg-gray-700/60" />
            {/* Active range bar */}
            <div
              className="absolute top-3 h-2 rounded-full bg-gradient-to-r from-blue-500/60 to-purple-500/60"
              style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
            />
            {/* Start handle (red) */}
            <div
              className="absolute top-1 w-5 h-5 rounded-full bg-red-500 border-2 border-white shadow-lg shadow-red-500/30 cursor-grab active:cursor-grabbing z-10 hover:scale-110 transition-transform"
              style={{ left: `calc(${startPct}% - 10px)` }}
              onMouseDown={handleSliderDownStart}
              onTouchStart={handleSliderDownStart}
            />
            {/* End handle (orange) */}
            <div
              className="absolute top-1 w-5 h-5 rounded-full bg-orange-400 border-2 border-white shadow-lg shadow-orange-400/30 cursor-grab active:cursor-grabbing z-10 hover:scale-110 transition-transform"
              style={{ left: `calc(${endPct}% - 10px)` }}
              onMouseDown={handleSliderDownEnd}
              onTouchStart={handleSliderDownEnd}
            />
            {/* Time labels under handles */}
            <div
              className="absolute top-6 text-[9px] font-bold text-red-400 whitespace-nowrap"
              style={{ left: `${startPct}%`, transform: 'translateX(-50%)' }}
            >
              {formatTime(rangeStart)}
            </div>
            <div
              className="absolute top-6 text-[9px] font-bold text-orange-400 whitespace-nowrap"
              style={{ left: `${endPct}%`, transform: 'translateX(-50%)' }}
            >
              {formatTime(rangeEnd)}
            </div>
          </div>
        </div>
      )}

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
            const latestDPS = averageMode
              ? (rangeAvg[fighter.id] || 0)
              : (dpsHistory[dpsHistory.length - 1]?.[fighter.id] || 0);
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
                    {formatDamage(latestDPS)}/s{averageMode ? ' moy' : ''}
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
