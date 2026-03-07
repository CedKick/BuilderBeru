import { useRef, useCallback } from 'react';

/**
 * Records drawing strokes for timelapse replay.
 * Each stroke = one pointer-down → pointer-up sequence.
 * Points within a stroke store relative timestamps for accurate replay timing.
 */
const useStrokeRecorder = () => {
    const strokesRef = useRef([]);
    const currentStrokeRef = useRef(null);
    const sessionStartRef = useRef(null);
    const isRecordingRef = useRef(true); // on by default
    const snapshotsRef = useRef([]); // Canvas snapshots for timelapse

    // Start a new stroke (called on pointerDown)
    const beginStroke = useCallback((layer, tool, brushType, brushSize, color) => {
        if (!isRecordingRef.current) return;
        if (!sessionStartRef.current) {
            sessionStartRef.current = performance.now();
        }
        currentStrokeRef.current = {
            t0: performance.now() - sessionStartRef.current,
            layer,
            tool,
            brushType,
            brushSize,
            color,
            points: [],
        };
    }, []);

    // Add a point to current stroke (called on each draw)
    const recordPoint = useCallback((x, y, pressure, color) => {
        if (!isRecordingRef.current || !currentStrokeRef.current) return;
        currentStrokeRef.current.points.push({
            x: Math.round(x * 10) / 10,
            y: Math.round(y * 10) / 10,
            p: Math.round(pressure * 100) / 100,
            c: color !== currentStrokeRef.current.color ? color : undefined,
            t: Math.round(performance.now() - sessionStartRef.current),
        });
    }, []);

    // End current stroke (called on pointerUp)
    const endStroke = useCallback(() => {
        if (!isRecordingRef.current || !currentStrokeRef.current) return;
        const stroke = currentStrokeRef.current;
        if (stroke.points.length > 0) {
            stroke.t1 = Math.round(performance.now() - sessionStartRef.current);
            strokesRef.current.push(stroke);
        }
        currentStrokeRef.current = null;
    }, []);

    // Get all recorded strokes (for save/export)
    const getStrokes = useCallback(() => strokesRef.current, []);

    // Load strokes (from saved coloring)
    const loadStrokes = useCallback((strokes) => {
        if (Array.isArray(strokes) && strokes.length > 0) {
            strokesRef.current = strokes;
            // Set sessionStart so new strokes continue after loaded ones
            const lastStroke = strokes[strokes.length - 1];
            sessionStartRef.current = performance.now() - (lastStroke.t1 || 0);
        }
    }, []);

    // Capture a JPEG snapshot of the composite canvas (called after each stroke)
    const captureSnapshot = useCallback((canvas) => {
        if (!isRecordingRef.current || !canvas || !sessionStartRef.current) return;
        const t = Math.round(performance.now() - sessionStartRef.current);
        const data = canvas.toDataURL('image/jpeg', 0.6);
        snapshotsRef.current.push({ t, data });
    }, []);

    const getSnapshots = useCallback(() => snapshotsRef.current, []);

    // Clear all strokes
    const clearStrokes = useCallback(() => {
        strokesRef.current = [];
        currentStrokeRef.current = null;
        sessionStartRef.current = null;
        snapshotsRef.current = [];
    }, []);

    // Toggle recording
    const setRecording = useCallback((val) => {
        isRecordingRef.current = val;
    }, []);

    const getStrokeCount = useCallback(() => strokesRef.current.length, []);

    return {
        beginStroke,
        recordPoint,
        endStroke,
        getStrokes,
        loadStrokes,
        clearStrokes,
        setRecording,
        getStrokeCount,
        captureSnapshot,
        getSnapshots,
    };
};

export default useStrokeRecorder;
