import { useState } from 'react';

/**
 * Hook for zoom & pan on a canvas element.
 * Returns state + event handlers for both main canvas and reference canvas.
 */
export const useZoomPan = ({ isMobile, canvasRef, overlayCanvasRef }) => {
    const MAX_ZOOM = isMobile ? 25 : 10;
    const ZOOM_STEP = isMobile ? 0.5 : 0.25;

    // Main canvas
    const [zoomLevel, setZoomLevel] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

    // Reference canvas
    const [refZoomLevel, setRefZoomLevel] = useState(1);
    const [refPanOffset, setRefPanOffset] = useState({ x: 0, y: 0 });
    const [isRefPanning, setIsRefPanning] = useState(false);
    const [lastRefPanPoint, setLastRefPanPoint] = useState({ x: 0, y: 0 });

    // --- Main canvas ---

    const handleZoom = (delta) => {
        const newZoom = Math.max(0.5, Math.min(MAX_ZOOM, zoomLevel + delta));
        setZoomLevel(newZoom);
    };

    const handleWheel = (e) => {
        const isOnCanvas = e.target === canvasRef?.current ||
                          e.target === overlayCanvasRef?.current;
        if (isOnCanvas) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
            handleZoom(delta);
        }
    };

    const startPan = (e) => {
        if (e.button === 2 || (e.button === 0 && e.ctrlKey)) {
            setIsPanning(true);
            setLastPanPoint({ x: e.clientX, y: e.clientY });
            e.preventDefault();
        }
    };

    const handlePan = (e) => {
        if (isPanning) {
            const deltaX = e.clientX - lastPanPoint.x;
            const deltaY = e.clientY - lastPanPoint.y;
            setPanOffset(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
            setLastPanPoint({ x: e.clientX, y: e.clientY });
        }
    };

    const stopPan = () => {
        setIsPanning(false);
    };

    const resetView = () => {
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
    };

    // --- Reference canvas ---

    const handleRefZoom = (delta) => {
        const newZoom = Math.max(0.5, Math.min(3, refZoomLevel + delta));
        setRefZoomLevel(newZoom);
    };

    const resetRefView = () => {
        setRefZoomLevel(1);
        setRefPanOffset({ x: 0, y: 0 });
    };

    const handleRefWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        handleRefZoom(delta);
    };

    const startRefPan = (e) => {
        if (e.button === 2 || (e.button === 0 && e.ctrlKey)) {
            setIsRefPanning(true);
            setLastRefPanPoint({ x: e.clientX, y: e.clientY });
            e.preventDefault();
        }
    };

    const handleRefPan = (e) => {
        if (isRefPanning) {
            const deltaX = e.clientX - lastRefPanPoint.x;
            const deltaY = e.clientY - lastRefPanPoint.y;
            setRefPanOffset(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
            setLastRefPanPoint({ x: e.clientX, y: e.clientY });
        }
    };

    const stopRefPan = () => {
        setIsRefPanning(false);
    };

    return {
        // Main canvas state
        zoomLevel, panOffset, isPanning,
        setPanOffset,
        // Main canvas handlers
        handleZoom, handleWheel, startPan, handlePan, stopPan, resetView,
        // Reference canvas state
        refZoomLevel, refPanOffset, isRefPanning,
        setRefPanOffset,
        // Reference canvas handlers
        handleRefZoom, handleRefWheel, startRefPan, handleRefPan, stopRefPan, resetRefView,
        // Config
        MAX_ZOOM, ZOOM_STEP,
    };
};

export default useZoomPan;
