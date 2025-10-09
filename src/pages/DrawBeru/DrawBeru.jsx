
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { drawBeruModels, getModel, getHunterModels } from './config/models';

// 🎯 HOOK CUSTOM : DÉTECTION MOBILE
const useDevice = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return { isMobile };
};

// 🎯 HOOK CUSTOM : GESTURES MOBILE (Pinch-to-zoom, Pan)
const useTouchGestures = (enabled, onPinch, onPan) => {
    const touchStartRef = useRef({ touches: [], distance: 0 });

    const getTouchDistance = (touches) => {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e) => {
        if (!enabled) return;

        if (e.touches.length === 2) {
            // Pinch-to-zoom start
            touchStartRef.current = {
                touches: Array.from(e.touches),
                distance: getTouchDistance(e.touches)
            };
        } else if (e.touches.length === 1) {
            // Pan start
            touchStartRef.current = {
                touches: [{ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }],
                distance: 0
            };
        }
    };

    const handleTouchMove = (e) => {
        if (!enabled) return;

        if (e.touches.length === 2 && touchStartRef.current.distance > 0) {
            // Pinch-to-zoom
            e.preventDefault();
            const newDistance = getTouchDistance(e.touches);
            const delta = (newDistance - touchStartRef.current.distance) * 0.01;
            onPinch?.(delta);
            touchStartRef.current.distance = newDistance;
        } else if (e.touches.length === 1 && touchStartRef.current.touches.length === 1) {
            // Pan
            const deltaX = e.touches[0].clientX - touchStartRef.current.touches[0].clientX;
            const deltaY = e.touches[0].clientY - touchStartRef.current.touches[0].clientY;
            onPan?.(deltaX, deltaY);
            touchStartRef.current.touches = [{
                clientX: e.touches[0].clientX,
                clientY: e.touches[0].clientY
            }];
        }
    };

    const handleTouchEnd = () => {
        touchStartRef.current = { touches: [], distance: 0 };
    };

    return { handleTouchStart, handleTouchMove, handleTouchEnd };
};

const DrawBeru = () => {
    const { t } = useTranslation();
    const { isMobile } = useDevice();

    const canvasRef = useRef(null);
    const layersRef = useRef([]);
    const referenceCanvasRef = useRef(null);
    const overlayCanvasRef = useRef(null); // 🆕 Canvas overlay modèle mobile

    // 🆕 MOBILE SPECIFIC STATES
    const [interactionMode, setInteractionMode] = useState('draw'); // 'draw' | 'pan'
    const [showModelOverlay, setShowModelOverlay] = useState(false);
    const [modelOverlayOpacity, setModelOverlayOpacity] = useState(0.3);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // EXISTING STATES
    const [selectedHunter, setSelectedHunter] = useState('ilhwan');
    const [selectedModel, setSelectedModel] = useState('default');
    const [selectedColor, setSelectedColor] = useState('#FF0000');
    const [brushSize, setBrushSize] = useState(3);
    const [isDrawing, setIsDrawing] = useState(false);
    const [showReference, setShowReference] = useState(true);
    const [currentTool, setCurrentTool] = useState('brush');
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

    const [refZoomLevel, setRefZoomLevel] = useState(1);
    const [refPanOffset, setRefPanOffset] = useState({ x: 0, y: 0 });
    const [isRefPanning, setIsRefPanning] = useState(false);
    const [lastRefPanPoint, setLastRefPanPoint] = useState({ x: 0, y: 0 });
    const [debugPoint, setDebugPoint] = useState(null);

    const [layers, setLayers] = useState([
        { id: 'base', name: 'Base', visible: true, opacity: 1, locked: false },
        { id: 'shadows', name: 'Ombres', visible: true, opacity: 1, locked: false },
        { id: 'details', name: 'Détails', visible: true, opacity: 1, locked: false }
    ]);
    const [activeLayer, setActiveLayer] = useState('base');

    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    const currentModelData = getModel(selectedHunter, selectedModel);
    const availableModels = getHunterModels(selectedHunter);

    // 🆕 GESTURES MOBILE
    const { handleTouchStart: canvasTouchStart, handleTouchMove: canvasTouchMove, handleTouchEnd: canvasTouchEnd } =
        useTouchGestures(
            isMobile && interactionMode === 'pan',
            (delta) => handleZoom(delta),
            (dx, dy) => {
                setPanOffset(prev => ({
                    x: prev.x + dx,
                    y: prev.y + dy
                }));
            }
        );

    // 🆕 LOAD MODEL OVERLAY (Mobile uniquement)
    useEffect(() => {
        if (!isMobile || !currentModelData || !showModelOverlay) return;

        const overlayCanvas = overlayCanvasRef.current;
        if (!overlayCanvas) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const { width, height } = currentModelData.canvasSize;
            overlayCanvas.width = width;
            overlayCanvas.height = height;
            const ctx = overlayCanvas.getContext('2d');
            ctx.clearRect(0, 0, width, height);
            ctx.globalAlpha = modelOverlayOpacity;
            ctx.drawImage(img, 0, 0, width, height);
        };
        img.src = currentModelData.reference;
    }, [isMobile, showModelOverlay, modelOverlayOpacity, currentModelData]);

    // EXISTING USEEFFECT - Load canvas/template
    useEffect(() => {
        if (!currentModelData) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const { width, height } = currentModelData.canvasSize;

        canvas.width = width;
        canvas.height = height;

        layersRef.current = layers.map(() => {
            const layerCanvas = document.createElement('canvas');
            layerCanvas.width = width;
            layerCanvas.height = height;
            return layerCanvas;
        });

        console.log('🔍 DEBUG LOAD - Start');
        console.log('Looking for:', selectedHunter, selectedModel);

        const userData = JSON.parse(localStorage.getItem('builderberu_users') || '{}');
        const existingColoring = userData.user?.accounts?.default?.colorings?.[selectedHunter]?.[selectedModel];

        console.log('🎨 Existing coloring found:', !!existingColoring);

        if (existingColoring && existingColoring.layers) {
            console.log('✅ Chargement du coloriage existant');
            console.log('Layers count:', existingColoring.layers.length);

            let loadedLayers = 0;
            const totalLayers = Math.min(existingColoring.layers.length, layersRef.current.length);

            existingColoring.layers.forEach((layerData, i) => {
                if (i < layersRef.current.length) {
                    const img = new Image();
                    img.onload = () => {
                        const ctx = layersRef.current[i].getContext('2d');
                        ctx.clearRect(0, 0, layersRef.current[i].width, layersRef.current[i].height);
                        ctx.drawImage(img, 0, 0);
                        loadedLayers++;

                        console.log(`Layer ${i + 1}/${totalLayers} chargé`);

                        if (loadedLayers === totalLayers) {
                            renderLayers();
                            console.log('✅ Tous les layers chargés, rendu final');
                            setTimeout(() => saveToHistory(), 100);
                        }
                    };
                    img.onerror = () => {
                        console.error(`❌ Erreur chargement layer ${i}`);
                        loadedLayers++;
                        if (loadedLayers === totalLayers) {
                            renderLayers();
                            setTimeout(() => saveToHistory(), 100);
                        }
                    };
                    img.src = layerData.data;
                }
            });

            setLayers(prevLayers => prevLayers.map((layer, i) => ({
                ...layer,
                visible: existingColoring.layers[i]?.visible ?? layer.visible,
                opacity: existingColoring.layers[i]?.opacity ?? layer.opacity,
                locked: existingColoring.layers[i]?.locked ?? layer.locked
            })));

            setImagesLoaded(true);

        } else {
            console.log('📄 Aucun coloriage existant, chargement template vierge');

            const templateImg = new Image();
            templateImg.crossOrigin = "anonymous";
            templateImg.onload = () => {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(templateImg, 0, 0, width, height);

                setImagesLoaded(true);
                saveToHistory();
                console.log('✅ Template vierge chargé:', width, 'x', height);
            };

            templateImg.onerror = () => {
                console.error('❌ Erreur chargement template:', currentModelData.template);
                setImagesLoaded(true);
            };

            templateImg.src = currentModelData.template;
        }

        const refCanvas = referenceCanvasRef.current;
        if (refCanvas) {
            const refImg = new Image();
            refImg.crossOrigin = "anonymous";
            refImg.onload = () => {
                refCanvas.width = refImg.width;
                refCanvas.height = refImg.height;
                const refCtx = refCanvas.getContext('2d');
                refCtx.drawImage(refImg, 0, 0);
                console.log('✅ Modèle de référence chargé');
            };
            refImg.onerror = () => {
                console.error('❌ Erreur chargement référence');
            };
            refImg.src = currentModelData.reference;
        }

    }, [currentModelData, selectedHunter, selectedModel]);

    const saveToHistory = () => {
        const newHistory = history.slice(0, historyIndex + 1);
        const snapshot = layersRef.current.map(canvas => {
            try {
                return canvas.toDataURL();
            } catch (e) {
                console.warn('Warning: Could not save layer to history', e);
                return null;
            }
        }).filter(s => s !== null);

        newHistory.push(snapshot);

        if (newHistory.length > 50) {
            newHistory.shift();
        } else {
            setHistoryIndex(historyIndex + 1);
        }

        setHistory(newHistory);
        setCanUndo(true);
        setCanRedo(false);
    };

    const undo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            restoreFromHistory(newIndex);
            setCanUndo(newIndex > 0);
            setCanRedo(true);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            restoreFromHistory(newIndex);
            setCanUndo(true);
            setCanRedo(newIndex < history.length - 1);
        }
    };

    const restoreFromHistory = (index) => {
        const snapshot = history[index];
        snapshot.forEach((dataURL, i) => {
            const img = new Image();
            img.onload = () => {
                const ctx = layersRef.current[i].getContext('2d');
                ctx.clearRect(0, 0, layersRef.current[i].width, layersRef.current[i].height);
                ctx.drawImage(img, 0, 0);
                renderLayers();
            };
            img.src = dataURL;
        });
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z' || e.key === 'Z') {
                    e.preventDefault();
                    if (e.shiftKey) {
                        redo();
                    } else {
                        undo();
                    }
                }
                if (e.key === 'y' || e.key === 'Y') {
                    e.preventDefault();
                    redo();
                }
            }

            if (!e.ctrlKey && !e.metaKey) {
                if (e.key === 'b' || e.key === 'B') setCurrentTool('brush');
                if (e.key === 'e' || e.key === 'E') setCurrentTool('eraser');
                if (e.key === 'i' || e.key === 'I') setCurrentTool('pipette');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [historyIndex, history.length]);

    const renderLayers = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const templateImg = new Image();
        templateImg.crossOrigin = "anonymous";
        templateImg.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

            layers.forEach((layer, index) => {
                if (layer.visible && layersRef.current[index]) {
                    ctx.globalAlpha = layer.opacity;
                    ctx.drawImage(layersRef.current[index], 0, 0);
                    ctx.globalAlpha = 1;
                }
            });
        };
        templateImg.onerror = () => {
            console.warn('Could not load template for render');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            layers.forEach((layer, index) => {
                if (layer.visible && layersRef.current[index]) {
                    ctx.globalAlpha = layer.opacity;
                    ctx.drawImage(layersRef.current[index], 0, 0);
                    ctx.globalAlpha = 1;
                }
            });
        };
        templateImg.src = currentModelData.template;
    };

    const handleZoom = (delta) => {
        const newZoom = Math.max(0.5, Math.min(3, zoomLevel + delta));
        setZoomLevel(newZoom);
    };

    const resetView = () => {
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
    };

    const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        handleZoom(delta);
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

            setPanOffset(prev => ({
                x: prev.x + deltaX,
                y: prev.y + deltaY
            }));

            setLastPanPoint({ x: e.clientX, y: e.clientY });
        }
    };

    const stopPan = () => {
        setIsPanning(false);
    };

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

            setRefPanOffset(prev => ({
                x: prev.x + deltaX,
                y: prev.y + deltaY
            }));

            setLastRefPanPoint({ x: e.clientX, y: e.clientY });
        }
    };

    const stopRefPan = () => {
        setIsRefPanning(false);
    };

    const getCanvasCoordinates = (e, canvas) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        return { x, y };
    };

    const pickColorFromReference = (e) => {
        const refCanvas = referenceCanvasRef.current;
        if (!refCanvas) return;

        const rect = refCanvas.getBoundingClientRect();
        const scaleX = refCanvas.width / rect.width;
        const scaleY = refCanvas.height / rect.height;
        const x = Math.floor((e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.clientY - rect.top) * scaleY);

        const cssX = e.clientX - rect.left;
        const cssY = e.clientY - rect.top;
        setDebugPoint({ cssX, cssY });
        setTimeout(() => setDebugPoint(null), 1200);

        if (x < 0 || x >= refCanvas.width || y < 0 || y >= refCanvas.height) return;
        const ctx = refCanvas.getContext('2d', { willReadFrequently: true });
        const p = ctx.getImageData(x, y, 1, 1).data;
        if (p[3] === 0) return;

        const hex = `#${((1 << 24) + (p[0] << 16) + (p[1] << 8) + p[2])
            .toString(16).slice(1).toUpperCase()}`;
        setSelectedColor(hex);
        setCurrentTool('brush');
    };

    const pickColorFromCanvas = (e) => {
        const activeLayerIndex = layers.findIndex(l => l.id === activeLayer);
        const layerCanvas = layersRef.current[activeLayerIndex];
        if (!layerCanvas) return;

        const { x, y } = getCanvasCoordinates(e, canvasRef.current);

        const ctx = layerCanvas.getContext('2d');
        const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;

        if (pixel[3] > 0) {
            const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1).toUpperCase()}`;
            setSelectedColor(hex);
        }

        setCurrentTool('brush');
    };

    // 🆕 MOBILE TOUCH DRAWING (FIXED)
    const handleTouchDraw = (e) => {
        e.preventDefault();

        if (!e.touches || e.touches.length === 0) return;
        const touch = e.touches[0];

        // 🎯 PIPETTE MODE
        if (currentTool === 'pipette') {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();

            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = Math.floor((touch.clientX - rect.left) * scaleX);
            const y = Math.floor((touch.clientY - rect.top) * scaleY);

            if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;

            // Si overlay modèle visible, prendre couleur du modèle
            if (showModelOverlay && overlayCanvasRef.current) {
                const overlayCtx = overlayCanvasRef.current.getContext('2d', { willReadFrequently: true });
                const pixel = overlayCtx.getImageData(x, y, 1, 1).data;
                if (pixel[3] > 0) {
                    const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1).toUpperCase()}`;
                    setSelectedColor(hex);
                    setCurrentTool('brush');
                    return;
                }
            }

            // Sinon, prendre couleur du layer actif
            const activeLayerIndex = layers.findIndex(l => l.id === activeLayer);
            const layerCanvas = layersRef.current[activeLayerIndex];
            if (layerCanvas) {
                const ctx = layerCanvas.getContext('2d', { willReadFrequently: true });
                const pixel = ctx.getImageData(x, y, 1, 1).data;
                if (pixel[3] > 0) {
                    const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1).toUpperCase()}`;
                    setSelectedColor(hex);
                    setCurrentTool('brush');
                }
            }
            return;
        }

        // MODE DESSIN
        if (interactionMode !== 'draw') return;

        const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 'mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY,
            bubbles: true
        });

        if (e.type === 'touchstart') {
            startDrawing(mouseEvent);
        } else if (e.type === 'touchmove') {
            draw(mouseEvent);
        }
    };

    const startDrawing = (e) => {
        if (e.button !== 0 || e.ctrlKey || isPanning) return;

        if (currentTool === 'pipette') {
            pickColorFromCanvas(e);
            return;
        }

        const layer = layers.find(l => l.id === activeLayer);
        if (layer?.locked) return;

        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            saveToHistory();
        }
    };

    const draw = (e) => {
        if (!isDrawing || isPanning || currentTool === 'pipette') return;

        const activeLayerIndex = layers.findIndex(l => l.id === activeLayer);
        const layerCanvas = layersRef.current[activeLayerIndex];
        if (!layerCanvas) return;

        const ctx = layerCanvas.getContext('2d');
        const { x, y } = getCanvasCoordinates(e, canvasRef.current);

        if (x < 0 || x > layerCanvas.width || y < 0 || y > layerCanvas.height) return;

        ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';
        ctx.fillStyle = selectedColor;
        ctx.beginPath();
        ctx.arc(x, y, brushSize, 0, 2 * Math.PI);
        ctx.fill();

        renderLayers();
    };

    const toggleLayerVisibility = (layerId) => {
        setLayers(layers.map(l =>
            l.id === layerId ? { ...l, visible: !l.visible } : l
        ));
        setTimeout(renderLayers, 10);
    };

    const toggleLayerLock = (layerId) => {
        setLayers(layers.map(l =>
            l.id === layerId ? { ...l, locked: !l.locked } : l
        ));
    };

    const changeLayerOpacity = (layerId, opacity) => {
        setLayers(layers.map(l =>
            l.id === layerId ? { ...l, opacity: parseFloat(opacity) } : l
        ));
        setTimeout(renderLayers, 10);
    };

    const saveColoring = () => {
        console.log('🔍 DEBUG SAVE - Start');
        console.log('Hunter:', selectedHunter, 'Model:', selectedModel);

        const layersData = layersRef.current.map((layerCanvas, i) => {
            try {
                return {
                    id: layers[i].id,
                    name: layers[i].name,
                    data: layerCanvas.toDataURL('image/png', 1.0),
                    visible: layers[i].visible,
                    opacity: layers[i].opacity,
                    locked: layers[i].locked
                };
            } catch (e) {
                console.error(`❌ Erreur export layer ${i}:`, e);
                return null;
            }
        }).filter(l => l !== null);

        if (layersData.length === 0) {
            alert('❌ Impossible d\'exporter les layers. Essaie de dessiner quelque chose d\'abord.');
            return;
        }

        console.log('✅ Layers exportés:', layersData.length);

        const previewCanvas = document.createElement('canvas');
        const canvas = canvasRef.current;
        previewCanvas.width = canvas.width;
        previewCanvas.height = canvas.height;
        const previewCtx = previewCanvas.getContext('2d', { alpha: true });

        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = canvas.width;
        exportCanvas.height = canvas.height;
        const exportCtx = exportCanvas.getContext('2d', { alpha: true });

        const templateImg = new Image();
        templateImg.crossOrigin = "anonymous";
        templateImg.onload = () => {
            previewCtx.drawImage(templateImg, 0, 0, previewCanvas.width, previewCanvas.height);
            layers.forEach((layer, index) => {
                if (layer.visible && layersRef.current[index]) {
                    previewCtx.globalAlpha = layer.opacity;
                    previewCtx.drawImage(layersRef.current[index], 0, 0);
                    previewCtx.globalAlpha = 1;
                }
            });

            layers.forEach((layer, index) => {
                if (layer.visible && layersRef.current[index]) {
                    exportCtx.globalAlpha = layer.opacity;
                    exportCtx.drawImage(layersRef.current[index], 0, 0);
                    exportCtx.globalAlpha = 1;
                }
            });

            let previewImageData, exportImageData;
            try {
                previewImageData = previewCanvas.toDataURL('image/png', 0.8);
                exportImageData = exportCanvas.toDataURL('image/png', 1.0);
                console.log('✅ Preview générée:', (previewImageData.length / 1024).toFixed(0), 'Ko');
                console.log('✅ Export transparent généré:', (exportImageData.length / 1024).toFixed(0), 'Ko');
            } catch (e) {
                console.error('❌ Erreur génération images:', e);
                previewImageData = null;
                exportImageData = null;
            }

            const userData = JSON.parse(localStorage.getItem('builderberu_users') || '{}');
            if (!userData.user) userData.user = { accounts: {} };
            if (!userData.user.accounts.default) userData.user.accounts.default = {};
            if (!userData.user.accounts.default.colorings) userData.user.accounts.default.colorings = {};
            if (!userData.user.accounts.default.colorings[selectedHunter]) {
                userData.user.accounts.default.colorings[selectedHunter] = {};
            }

            const coloringData = {
                preview: previewImageData,
                exportImage: exportImageData,
                layers: layersData,
                palette: currentModelData.palette,
                createdAt: userData.user.accounts.default.colorings[selectedHunter][selectedModel]?.createdAt || Date.now(),
                updatedAt: Date.now(),
                isCompleted: true,
                hunter: selectedHunter,
                model: selectedModel,
                canvasSize: currentModelData.canvasSize,
                version: '1.0'
            };

            userData.user.accounts.default.colorings[selectedHunter][selectedModel] = coloringData;

            console.log('📦 Data structure:', {
                hunter: selectedHunter,
                model: selectedModel,
                layersCount: coloringData.layers.length,
                hasPreview: !!coloringData.preview,
                hasExport: !!coloringData.exportImage,
                totalSize: (JSON.stringify(coloringData).length / 1024).toFixed(0) + ' Ko'
            });

            try {
                localStorage.setItem('builderberu_users', JSON.stringify(userData));

                const verification = JSON.parse(localStorage.getItem('builderberu_users'));
                const saved = verification.user?.accounts?.default?.colorings?.[selectedHunter]?.[selectedModel];

                console.log('✅ Vérification:', {
                    saved: !!saved,
                    hasPreview: !!saved?.preview,
                    hasExport: !!saved?.exportImage,
                    layersCount: saved?.layers?.length
                });

                alert(`✅ Coloriage sauvegardé !\n\nHunter: ${selectedHunter}\nModèle: ${selectedModel}\nCalques: ${coloringData.layers.length}\nTaille totale: ${(JSON.stringify(coloringData).length / 1024).toFixed(0)} Ko\n\n🎯 PNG transparent créé pour export !`);

            } catch (e) {
                console.error('❌ Erreur sauvegarde:', e);
                if (e.name === 'QuotaExceededError') {
                    alert('⚠️ Espace localStorage plein ! Supprime d\'anciens coloriages ou réduis la qualité.');
                } else {
                    alert('❌ Erreur de sauvegarde : ' + e.message);
                }
            }
        };

        templateImg.onerror = () => {
            console.error('❌ Erreur chargement template pour export');
            alert('❌ Impossible de charger le template pour l\'export');
        };

        templateImg.src = currentModelData.template;
    };

    const downloadColoredPNG = () => {
        console.log('🖼️ Download modèle de référence - Start');

        const exportCanvas = document.createElement('canvas');
        const refCanvas = referenceCanvasRef.current;

        if (!refCanvas) {
            alert('❌ Modèle de référence non chargé');
            return;
        }

        exportCanvas.width = refCanvas.width;
        exportCanvas.height = refCanvas.height;
        const exportCtx = exportCanvas.getContext('2d', { alpha: true });

        exportCtx.drawImage(refCanvas, 0, 0);

        exportCanvas.toBlob((blob) => {
            if (!blob) {
                alert('❌ Erreur lors de la génération de l\'image');
                return;
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${selectedHunter}_${selectedModel}_reference_${Date.now()}.png`;

            link.click();
            URL.revokeObjectURL(url);

            console.log('✅ Modèle de référence téléchargé:', link.download);
            alert(`✅ Modèle de référence téléchargé !\n\nFichier: ${link.download}\n\n🎨 Image originale colorée`);

        }, 'image/png', 1.0);
    };

    const downloadTransparentPNG = () => {
        console.log('🔥 Download PNG avec template...');

        const exportCanvas = document.createElement('canvas');
        const canvas = canvasRef.current;
        exportCanvas.width = canvas.width;
        exportCanvas.height = canvas.height;
        const exportCtx = exportCanvas.getContext('2d', { alpha: true });

        const templateImg = new Image();
        templateImg.crossOrigin = "anonymous";

        templateImg.onload = () => {
            exportCtx.drawImage(templateImg, 0, 0, exportCanvas.width, exportCanvas.height);

            layers.forEach((layer, index) => {
                if (layer.visible && layersRef.current[index]) {
                    exportCtx.globalAlpha = layer.opacity;
                    exportCtx.drawImage(layersRef.current[index], 0, 0);
                    exportCtx.globalAlpha = 1;
                }
            });

            exportCanvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${selectedHunter}_${selectedModel}_colored_${Date.now()}.png`;
                link.click();
                URL.revokeObjectURL(url);

                console.log('✅ PNG téléchargé:', link.download);
                alert(`✅ Image téléchargée !\n\nFichier: ${link.download}`);
            }, 'image/png', 1.0);
        };

        templateImg.onerror = () => {
            console.error('❌ Erreur chargement template');
            alert('❌ Impossible de charger le template');
        };

        templateImg.src = currentModelData.template;
    };

    const resetColoring = () => {
        if (!confirm('Réinitialiser tout le coloriage ?')) return;

        layersRef.current.forEach(canvas => {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });

        renderLayers();
        setHistory([]);
        setHistoryIndex(-1);
        saveToHistory();
    };

    const exportColoring = () => {
        const userData = JSON.parse(localStorage.getItem('builderberu_users') || '{}');
        const coloring = userData.user?.accounts?.default?.colorings?.[selectedHunter]?.[selectedModel];

        if (!coloring) {
            alert('❌ Aucun coloriage à exporter pour ce hunter/model');
            return;
        }

        const exportData = {
            hunter: selectedHunter,
            model: selectedModel,
            data: coloring,
            exportedAt: Date.now(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedHunter}_${selectedModel}_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        console.log('📤 Coloriage exporté:', selectedHunter, selectedModel);
        alert(`✅ Coloriage exporté !\n\nFichier: ${a.download}`);
    };

    const importColoring = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);

                    if (!importedData.hunter || !importedData.data) {
                        throw new Error('Format invalide');
                    }

                    const userData = JSON.parse(localStorage.getItem('builderberu_users') || '{}');
                    if (!userData.user) userData.user = { accounts: {} };
                    if (!userData.user.accounts.default) userData.user.accounts.default = {};
                    if (!userData.user.accounts.default.colorings) userData.user.accounts.default.colorings = {};
                    if (!userData.user.accounts.default.colorings[importedData.hunter]) {
                        userData.user.accounts.default.colorings[importedData.hunter] = {};
                    }

                    userData.user.accounts.default.colorings[importedData.hunter][importedData.model] = importedData.data;
                    localStorage.setItem('builderberu_users', JSON.stringify(userData));

                    console.log('📥 Coloriage importé:', importedData.hunter, importedData.model);
                    alert(`✅ Coloriage importé !\n\nHunter: ${importedData.hunter}\nModèle: ${importedData.model}\n\nRecharge la page pour voir le résultat.`);

                    if (importedData.hunter === selectedHunter && importedData.model === selectedModel) {
                        window.location.reload();
                    }

                } catch (error) {
                    console.error('❌ Erreur import:', error);
                    alert('❌ Erreur lors de l\'import. Vérifie que le fichier est valide.');
                }
            };

            reader.readAsText(file);
        };

        input.click();
    };

    const handleModelChange = (modelId) => {
        setSelectedModel(modelId);
        setImagesLoaded(false);
        setHistory([]);
        setHistoryIndex(-1);
    };

    const handleHunterChange = (hunterId) => {
        setSelectedHunter(hunterId);
        setSelectedModel('default');
        setImagesLoaded(false);
        setHistory([]);
        setHistoryIndex(-1);
    };

    if (!currentModelData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-white text-xl">Modèle non trouvé</div>
            </div>
        );
    }

    // 🎨 RENDER MOBILE
    if (isMobile) {
        return (
            <div className="min-h-screen bg-[#0a0118] overflow-hidden">
                <style>{`
          @keyframes pulse {
            0%, 100% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -50%) scale(1.3); }
          }
          
          .mobile-fab {
            position: fixed;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            z-index: 1000;
            transition: all 0.3s ease;
          }
          
          .mobile-fab:active {
            transform: scale(0.95);
          }
        `}</style>

                {/* 📱 HEADER MOBILE COMPACT */}
                <div className="bg-black/30 backdrop-blur-sm border-b border-purple-500/30 px-3 py-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-white">🎨 DrawBeru</h1>
                            <p className="text-xs text-purple-200">{currentModelData.name}</p>
                        </div>

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-white text-2xl p-2"
                        >
                            ☰
                        </button>
                    </div>
                </div>

                {/* 📱 MOBILE MENU OVERLAY */}
                {mobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] overflow-y-auto"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <div
                            className="bg-[#1a1a2f] m-4 rounded-xl p-4 max-h-[85vh] overflow-y-auto border border-purple-500/30"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-white">Menu</h2>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-white text-2xl"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* HUNTER/MODEL SELECTORS */}
                            <div className="mb-4 space-y-2">
                                <select
                                    value={selectedHunter}
                                    onChange={(e) => {
                                        handleHunterChange(e.target.value);
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full bg-purple-800/50 text-white border border-purple-500/50 rounded-lg px-3 py-2 text-sm"
                                >
                                    {Object.entries(drawBeruModels).map(([hunterId, hunterData]) => (
                                        <option key={hunterId} value={hunterId}>
                                            {hunterData.name}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={selectedModel}
                                    onChange={(e) => {
                                        handleModelChange(e.target.value);
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full bg-purple-800/50 text-white border border-purple-500/50 rounded-lg px-3 py-2 text-sm"
                                >
                                    {Object.entries(availableModels).map(([modelId, modelData]) => (
                                        <option key={modelId} value={modelId}>
                                            {modelData.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* PALETTE */}
                            <div className="mb-4">
                                <h3 className="text-white text-sm font-semibold mb-2">🎨 Palette</h3>
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    {Object.entries(currentModelData.palette).map(([id, color]) => (
                                        <button
                                            key={id}
                                            onClick={() => {
                                                setSelectedColor(color);
                                                setMobileMenuOpen(false);
                                            }}
                                            className={`h-12 rounded-lg border-2 transition-all ${selectedColor === color
                                                ? 'border-white scale-110'
                                                : 'border-purple-500/50'
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <input
                                    type="color"
                                    value={selectedColor}
                                    onChange={(e) => setSelectedColor(e.target.value)}
                                    className="w-full h-10 rounded-lg border border-purple-500/50"
                                />
                            </div>

                            {/* BRUSH SIZE */}
                            <div className="mb-4">
                                <label className="text-white text-sm mb-2 block">
                                    Taille pinceau: {brushSize.toFixed(1)}px
                                </label>
                                <input
                                    type="range"
                                    min={0.5}
                                    max={20}
                                    step={0.5}
                                    value={brushSize}
                                    onChange={(e) => setBrushSize(parseFloat(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            {/* LAYERS */}
                            <div className="mb-4">
                                <h3 className="text-white text-sm font-semibold mb-2">📚 Calques</h3>
                                <div className="space-y-2">
                                    {layers.map((layer) => (
                                        <div
                                            key={layer.id}
                                            className={`p-2 rounded-lg border ${activeLayer === layer.id
                                                ? 'border-purple-400 bg-purple-900/50'
                                                : 'border-purple-700/30 bg-purple-900/20'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <button
                                                    onClick={() => {
                                                        setActiveLayer(layer.id);
                                                        setMobileMenuOpen(false);
                                                    }}
                                                    className="text-white text-sm flex-1 text-left"
                                                >
                                                    {layer.name}
                                                </button>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => toggleLayerVisibility(layer.id)}
                                                        className="text-white text-lg"
                                                    >
                                                        {layer.visible ? '👁️' : '🚫'}
                                                    </button>
                                                    <button
                                                        onClick={() => toggleLayerLock(layer.id)}
                                                        className="text-white text-lg"
                                                    >
                                                        {layer.locked ? '🔒' : '🔓'}
                                                    </button>
                                                </div>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.1"
                                                value={layer.opacity}
                                                onChange={(e) => changeLayerOpacity(layer.id, e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ACTIONS */}
                            <div className="space-y-2">
                                <button
                                    onClick={() => {
                                        saveColoring();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full bg-green-600 text-white py-2 rounded-lg text-sm"
                                >
                                    💾 Sauvegarder
                                </button>
                                <button
                                    onClick={() => {
                                        downloadTransparentPNG();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm"
                                >
                                    🖼️ Télécharger PNG
                                </button>
                                <button
                                    onClick={() => {
                                        resetColoring();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full bg-red-600 text-white py-2 rounded-lg text-sm"
                                >
                                    🗑️ Reset
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 🎨 CANVAS MOBILE FULLSCREEN */}
                <div className="relative w-full" style={{ height: 'calc(100vh - 120px)' }}>
                    <div
                        className="absolute inset-0 bg-white flex items-center justify-center overflow-hidden"
                        onTouchStart={(e) => {
                            if (interactionMode === 'pan' && currentTool !== 'pipette') {
                                canvasTouchStart(e);
                            } else {
                                handleTouchDraw(e);
                            }
                        }}
                        onTouchMove={(e) => {
                            if (interactionMode === 'pan' && currentTool !== 'pipette') {
                                canvasTouchMove(e);
                            } else {
                                handleTouchDraw(e);
                            }
                        }}
                        onTouchEnd={(e) => {
                            if (interactionMode === 'pan' && currentTool !== 'pipette') {
                                canvasTouchEnd(e);
                            } else {
                                stopDrawing();
                            }
                        }}
                    >
                        <div
                            style={{
                                transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                                transformOrigin: 'center center',
                                transition: 'none',
                                position: 'relative'
                            }}
                        >
                            {/* CANVAS PRINCIPAL (Template + Coloriage) - TOUJOURS VISIBLE */}
                            <canvas
                                ref={canvasRef}
                                style={{
                                    display: 'block',
                                    touchAction: 'none',
                                    cursor: currentTool === 'pipette' ? 'crosshair' : (interactionMode === 'pan' ? 'grab' : 'crosshair')
                                }}
                            />

                            {/* 🆕 MODÈLE RÉFÉRENCE COLORÉ - Opacity variable */}
                            <canvas
                                ref={overlayCanvasRef}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    pointerEvents: 'none',
                                    opacity: showModelOverlay ? modelOverlayOpacity : 0.15,
                                    touchAction: 'none',
                                    transition: 'opacity 0.3s ease',
                                    mixBlendMode: 'multiply' // Pour mieux voir à travers
                                }}
                            />

                            {/* 🆕 MODEL OVERLAY */}
                            {showModelOverlay && (
                                <canvas
                                    ref={overlayCanvasRef}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        pointerEvents: 'none',
                                        opacity: modelOverlayOpacity,
                                        touchAction: 'none'
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {/* 🔥 CONTROLS EN HAUT DANS LE CANVAS - ALIGNÉS */}
                    <div
                        className="absolute top-4 left-4 right-4 z-[1000] flex items-start gap-3"
                        style={{ pointerEvents: 'auto' }}
                    >
                        {/* BOUTONS ALIGNÉS À GAUCHE */}
                        <div className="flex gap-2">
                            {/* BOUTON MODE PAN/DRAW */}
                            <button
                                onClick={() => setInteractionMode(interactionMode === 'draw' ? 'pan' : 'draw')}
                                className={`flex items-center justify-center w-10 h-10 rounded-lg shadow-md text-lg transition-all active:scale-95 backdrop-blur-sm ${interactionMode === 'draw'
                                    ? 'bg-green-600/40 hover:bg-green-600/60 text-white border border-green-400/20'
                                    : 'bg-blue-600/40 hover:bg-blue-600/60 text-white border border-blue-400/20'
                                    }`}
                                title={interactionMode === 'draw' ? 'Mode Dessin' : 'Mode Déplacement'}
                            >
                                {interactionMode === 'draw' ? '🖌️' : '✋'}
                            </button>

                            {/* BOUTON TOGGLE MODEL OVERLAY */}
                            <button
                                onClick={() => setShowModelOverlay(!showModelOverlay)}
                                className={`flex items-center justify-center w-10 h-10 rounded-lg shadow-md text-lg transition-all active:scale-95 backdrop-blur-sm ${showModelOverlay
                                    ? 'bg-purple-600/40 hover:bg-purple-600/60 text-white border border-purple-400/20'
                                    : 'bg-gray-700/40 hover:bg-gray-700/60 text-white border border-gray-500/20'
                                    }`}
                                title={showModelOverlay ? 'Cacher modèle' : 'Afficher modèle'}
                            >
                                {showModelOverlay ? '👁️' : '🙈'}
                            </button>
                        </div>

                        {/* 🔥 SLIDER OPACITY À DROITE (visible si modèle affiché) */}
                        {showModelOverlay && (
                            <div
                                className="flex-1 bg-black/60 backdrop-blur-md rounded-lg p-2 shadow-lg border border-purple-500/30 max-w-[200px]"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-white text-[10px] font-semibold">Opacité</span>
                                    <span className="text-purple-300 text-[10px] font-mono">{Math.round(modelOverlayOpacity * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={modelOverlayOpacity}
                                    onChange={(e) => setModelOverlayOpacity(parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-purple-900/50 rounded-lg appearance-none cursor-pointer"
                                    style={{
                                        accentColor: '#9333ea'
                                    }}
                                />
                                <div className="flex justify-between mt-1 gap-1">
                                    <button
                                        onClick={() => setModelOverlayOpacity(0.2)}
                                        className="text-[9px] text-purple-300 hover:text-white px-1 py-0.5 rounded bg-purple-900/30 hover:bg-purple-900/50 transition-colors"
                                    >
                                        20%
                                    </button>
                                    <button
                                        onClick={() => setModelOverlayOpacity(0.5)}
                                        className="text-[9px] text-purple-300 hover:text-white px-1 py-0.5 rounded bg-purple-900/30 hover:bg-purple-900/50 transition-colors"
                                    >
                                        50%
                                    </button>
                                    <button
                                        onClick={() => setModelOverlayOpacity(0.8)}
                                        className="text-[9px] text-purple-300 hover:text-white px-1 py-0.5 rounded bg-purple-900/30 hover:bg-purple-900/50 transition-colors"
                                    >
                                        80%
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 🆕 INDICATEUR COULEUR ACTUELLE (en bas à droite) */}
                    <div
                        className="absolute backdrop-blur-sm"
                        style={{
                            bottom: '90px',
                            right: '16px',
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            backgroundColor: selectedColor,
                            border: '3px solid rgba(255, 255, 255, 0.8)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                            zIndex: 1000,
                            cursor: 'pointer',
                            opacity: 0.95
                        }}
                        onClick={() => setMobileMenuOpen(true)}
                        title="Changer de couleur"
                    />

                 {/* 🆕 CONTROLS BAS : Undo/Redo + Brush Size sur même ligne */}
          <div className="absolute bottom-20 left-2 right-2 z-[1000] flex items-center gap-2">
            {/* UNDO/REDO */}
            <div className="flex gap-2 shrink-0">
              <button
                onClick={undo}
                disabled={!canUndo}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-md transition-all active:scale-95 backdrop-blur-sm ${
                  canUndo
                    ? 'bg-blue-600/40 hover:bg-blue-600/60 text-white border border-blue-400/20'
                    : 'bg-gray-600/30 text-gray-400 border border-gray-500/15'
                }`}
              >
                ↶
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-md transition-all active:scale-95 backdrop-blur-sm ${
                  canRedo
                    ? 'bg-blue-600/40 hover:bg-blue-600/60 text-white border border-blue-400/20'
                    : 'bg-gray-600/30 text-gray-400 border border-gray-500/15'
                }`}
              >
                ↷
              </button>
            </div>

            {/* BRUSH SIZE SLIDER - Visible en mode brush/eraser */}
            {(currentTool === 'brush' || currentTool === 'eraser') && (
              <div 
                className="flex-1 bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1.5 shadow-md border border-purple-500/20"
                style={{ maxHeight: '46px' }}
              >
                <div className="flex items-center gap-2">
                  {/* ICÔNE OUTIL */}
                  <div className="flex items-center justify-center w-6 h-6 rounded bg-purple-600/50 text-sm shrink-0">
                    {currentTool === 'brush' ? '🖌️' : '🧽'}
                  </div>

                  {/* SLIDER */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-white/80 text-[9px] font-medium">
                        Taille
                      </span>
                      <span className="text-purple-300 text-[10px] font-mono font-bold">
                        {brushSize.toFixed(1)}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="30"
                      step="0.5"
                      value={brushSize}
                      onChange={(e) => setBrushSize(parseFloat(e.target.value))}
                      className="w-full h-1 bg-purple-900/30 rounded-lg appearance-none cursor-pointer"
                      style={{
                        accentColor: currentTool === 'brush' ? '#9333ea' : '#f97316'
                      }}
                    />
                  </div>

                  {/* QUICK BUTTONS */}
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => setBrushSize(2)}
                      className="text-[8px] text-purple-300/70 hover:text-white px-1.5 py-0.5 rounded bg-purple-900/20 hover:bg-purple-900/40 transition-colors"
                    >
                      S
                    </button>
                    <button
                      onClick={() => setBrushSize(8)}
                      className="text-[8px] text-purple-300/70 hover:text-white px-1.5 py-0.5 rounded bg-purple-900/20 hover:bg-purple-900/40 transition-colors"
                    >
                      M
                    </button>
                    <button
                      onClick={() => setBrushSize(15)}
                      className="text-[8px] text-purple-300/70 hover:text-white px-1.5 py-0.5 rounded bg-purple-900/20 hover:bg-purple-900/40 transition-colors"
                    >
                      L
                    </button>
                  </div>

                  {/* PRÉVISUALISATION */}
                  <div className="flex items-center justify-center w-8 h-8 bg-white/5 rounded border border-purple-500/20 shrink-0">
                    <div
                      style={{
                        width: `${Math.min(brushSize * 1.5, 24)}px`,
                        height: `${Math.min(brushSize * 1.5, 24)}px`,
                        borderRadius: '50%',
                        backgroundColor: currentTool === 'brush' ? selectedColor : '#ff6b6b',
                        border: '1px solid rgba(255,255,255,0.2)',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

                    {/* 🆕 INDICATEUR COULEUR ACTUELLE (en bas à droite) */}
                    <div
                        className="absolute"
                        style={{
                            bottom: '90px',
                            right: '16px',
                            width: '56px',
                            height: '56px',
                            borderRadius: '50%',
                            backgroundColor: selectedColor,
                            border: '3px solid white',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                            zIndex: 1000,
                            cursor: 'pointer'
                        }}
                        onClick={() => setMobileMenuOpen(true)}
                        title="Changer de couleur"
                    />

                   
                </div>

                {/* 📱 BOTTOM TOOLBAR MOBILE */}
                <div className="fixed bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm border-t border-purple-500/30 p-2 z-[999]">
                    <div className="flex items-center justify-around gap-1">
                        <button
                            onClick={() => setCurrentTool('brush')}
                            className={`flex-1 py-3 rounded-lg text-sm transition-all ${currentTool === 'brush'
                                ? 'bg-purple-600 text-white scale-105'
                                : 'bg-purple-800/50 text-purple-200'
                                }`}
                        >
                            🖌️
                        </button>
                        <button
                            onClick={() => setCurrentTool('eraser')}
                            className={`flex-1 py-3 rounded-lg text-sm transition-all ${currentTool === 'eraser'
                                ? 'bg-purple-600 text-white scale-105'
                                : 'bg-purple-800/50 text-purple-200'
                                }`}
                        >
                            🧽
                        </button>
                        <button
                            onClick={() => setCurrentTool('pipette')}
                            className={`flex-1 py-3 rounded-lg text-sm transition-all ${currentTool === 'pipette'
                                ? 'bg-purple-600 text-white scale-105'
                                : 'bg-purple-800/50 text-purple-200'
                                }`}
                        >
                            💧
                        </button>
                        <button
                            onClick={() => handleZoom(0.25)}
                            className="flex-1 py-3 rounded-lg bg-purple-800/50 text-purple-200 text-sm"
                        >
                            🔍+
                        </button>
                        <button
                            onClick={() => handleZoom(-0.25)}
                            className="flex-1 py-3 rounded-lg bg-purple-800/50 text-purple-200 text-sm"
                        >
                            🔍−
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0118]">
            <style>{`
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.3); }
        }
        
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.7);
        }
      `}</style>

            <div className="bg-black/20 backdrop-blur-sm border-b border-purple-500/30">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                🎨 DrawBeru
                            </h1>
                            <p className="text-purple-200">
                                Colorie {currentModelData.name}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <select
                                value={selectedHunter}
                                onChange={(e) => handleHunterChange(e.target.value)}
                                className="bg-purple-800/50 text-white border border-purple-500/50 rounded-lg px-3 py-2"
                            >
                                {Object.entries(drawBeruModels).map(([hunterId, hunterData]) => (
                                    <option key={hunterId} value={hunterId}>
                                        {hunterData.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={selectedModel}
                                onChange={(e) => handleModelChange(e.target.value)}
                                className="bg-purple-800/50 text-white border border-purple-500/50 rounded-lg px-3 py-2"
                            >
                                {Object.entries(availableModels).map(([modelId, modelData]) => (
                                    <option key={modelId} value={modelId}>
                                        {modelData.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3 flex-wrap">
                            <button
                                onClick={undo}
                                disabled={!canUndo}
                                className={`px-4 py-2 rounded-lg transition-colors ${canUndo
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    }`}
                                title="Annuler (Ctrl+Z)"
                            >
                                ↶ Undo
                            </button>

                            <button
                                onClick={redo}
                                disabled={!canRedo}
                                className={`px-4 py-2 rounded-lg transition-colors ${canRedo
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    }`}
                                title="Refaire (Ctrl+Y)"
                            >
                                ↷ Redo
                            </button>

                            <button
                                onClick={() => setShowReference(!showReference)}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                {showReference ? 'Cacher' : 'Voir'} Modèle
                            </button>

                            <button
                                onClick={saveColoring}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                💾 Sauvegarder
                            </button>

                            <button
                                onClick={downloadColoredPNG}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                title="Télécharger l'image colorée complète"
                            >
                                🖼️ PNG Coloré
                            </button>

                            <button
                                onClick={downloadTransparentPNG}
                                className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-colors"
                                title="Télécharger uniquement les couleurs (fond transparent)"
                            >
                                🎨 PNG Transparent
                            </button>

                            <button
                                onClick={exportColoring}
                                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
                                title="Exporter ce coloriage"
                            >
                                📤 Export
                            </button>

                            <button
                                onClick={importColoring}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                                title="Importer un coloriage"
                            >
                                📥 Import
                            </button>

                            <button
                                onClick={resetColoring}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                🗑️ Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-black/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4">
                            <h3 className="text-white font-semibold mb-4">
                                🎨 Palette
                            </h3>

                            <div className="grid grid-cols-4 gap-2 mb-4">
                                {Object.entries(currentModelData.palette).map(([id, color]) => (
                                    <button
                                        key={id}
                                        onClick={() => setSelectedColor(color)}
                                        className={`w-12 h-12 rounded-lg border-2 transition-all ${selectedColor === color
                                            ? 'border-white scale-110'
                                            : 'border-purple-500/50 hover:border-purple-400'
                                            }`}
                                        style={{ backgroundColor: color }}
                                        title={`Couleur ${id}: ${color}`}
                                    />
                                ))}
                            </div>

                            <div className="mb-4">
                                <label className="text-purple-200 text-sm mb-2 block">Couleur libre:</label>
                                <input
                                    type="color"
                                    value={selectedColor}
                                    onChange={(e) => setSelectedColor(e.target.value)}
                                    className="w-full h-10 rounded-lg border border-purple-500/50"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="text-sm text-white">Taille pinceau : {brushSize.toFixed(1)} px</label>
                                <input
                                    type="range"
                                    min={0.1}
                                    max={20}
                                    step={0.1}
                                    value={brushSize}
                                    onChange={(e) => setBrushSize(parseFloat(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="text-purple-200 text-sm mb-2 block">
                                    Zoom: {Math.round(zoomLevel * 100)}%
                                </label>
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                    <button
                                        onClick={() => handleZoom(-0.25)}
                                        className="bg-purple-700/50 text-white py-2 px-3 rounded text-lg font-bold"
                                    >
                                        −
                                    </button>
                                    <button
                                        onClick={resetView}
                                        className="bg-purple-700/50 text-white py-2 px-3 rounded text-sm"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={() => handleZoom(0.25)}
                                        className="bg-purple-700/50 text-white py-2 px-3 rounded text-lg font-bold"
                                    >
                                        +
                                    </button>
                                </div>

                                <div className="mb-2">
                                    <div className="text-purple-300 text-xs mb-1">Déplacement:</div>
                                    <div className="grid grid-cols-3 gap-1 max-w-[120px] mx-auto">
                                        <div></div>
                                        <button
                                            onClick={() => setPanOffset(prev => ({ ...prev, y: prev.y + 50 }))}
                                            className="bg-purple-700/50 text-white py-2 rounded"
                                        >
                                            ↑
                                        </button>
                                        <div></div>
                                        <button
                                            onClick={() => setPanOffset(prev => ({ ...prev, x: prev.x + 50 }))}
                                            className="bg-purple-700/50 text-white py-2 rounded"
                                        >
                                            ←
                                        </button>
                                        <button
                                            onClick={resetView}
                                            className="bg-purple-700/50 text-white py-2 rounded text-xs"
                                        >
                                            ⊙
                                        </button>
                                        <button
                                            onClick={() => setPanOffset(prev => ({ ...prev, x: prev.x - 50 }))}
                                            className="bg-purple-700/50 text-white py-2 rounded"
                                        >
                                            →
                                        </button>
                                        <div></div>
                                        <button
                                            onClick={() => setPanOffset(prev => ({ ...prev, y: prev.y - 50 }))}
                                            className="bg-purple-700/50 text-white py-2 rounded"
                                        >
                                            ↓
                                        </button>
                                        <div></div>
                                    </div>
                                </div>

                                <div className="text-purple-300 text-xs">
                                    PC: Molette zoom | Clic droit déplacer
                                </div>
                            </div>

                            <div className="space-y-2">
                                <button
                                    onClick={() => setCurrentTool('brush')}
                                    className={`w-full py-2 px-4 rounded-lg transition-colors ${currentTool === 'brush'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-purple-800/50 text-purple-200 hover:bg-purple-700/50'
                                        }`}
                                >
                                    🖌️ Pinceau (B)
                                </button>

                                <button
                                    onClick={() => setCurrentTool('eraser')}
                                    className={`w-full py-2 px-4 rounded-lg transition-colors ${currentTool === 'eraser'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-purple-800/50 text-purple-200 hover:bg-purple-700/50'
                                        }`}
                                >
                                    🧽 Gomme (E)
                                </button>

                                <button
                                    onClick={() => setCurrentTool('pipette')}
                                    className={`w-full py-2 px-4 rounded-lg transition-colors ${currentTool === 'pipette'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-purple-800/50 text-purple-200 hover:bg-purple-700/50'
                                        }`}
                                >
                                    💧 Pipette (I)
                                </button>
                            </div>
                        </div>

                        <div className="bg-black/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4">
                            <h3 className="text-white font-semibold mb-4">
                                📚 Calques
                            </h3>

                            <div className="space-y-2">
                                {layers.map((layer) => (
                                    <div
                                        key={layer.id}
                                        className={`p-3 rounded-lg border-2 transition-all ${activeLayer === layer.id
                                            ? 'border-purple-400 bg-purple-900/50'
                                            : 'border-purple-700/30 bg-purple-900/20'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <button
                                                onClick={() => setActiveLayer(layer.id)}
                                                className="text-white font-medium text-sm flex-1 text-left"
                                            >
                                                {layer.name}
                                            </button>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => toggleLayerVisibility(layer.id)}
                                                    className="text-white text-lg"
                                                    title={layer.visible ? 'Masquer' : 'Afficher'}
                                                >
                                                    {layer.visible ? '👁️' : '🚫'}
                                                </button>

                                                <button
                                                    onClick={() => toggleLayerLock(layer.id)}
                                                    className="text-white text-lg"
                                                    title={layer.locked ? 'Déverrouiller' : 'Verrouiller'}
                                                >
                                                    {layer.locked ? '🔒' : '🔓'}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-purple-300 text-xs">
                                                Opacité: {Math.round(layer.opacity * 100)}%
                                            </label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.1"
                                                value={layer.opacity}
                                                onChange={(e) => changeLayerOpacity(layer.id, e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-black/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4">
                            <h3 className="text-white font-semibold mb-4">
                                ✏️ Zone de coloriage - {currentModelData.name}
                            </h3>

                            {!imagesLoaded && (
                                <div className="bg-white rounded-lg p-8 text-center">
                                    <div className="text-gray-500">Chargement du modèle...</div>
                                </div>
                            )}

                            <div
                                className={`relative bg-white rounded-lg overflow-hidden ${!imagesLoaded ? 'hidden' : ''}`}
                                style={{
                                    minHeight: '400px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                                onWheel={handleWheel}
                                onMouseDown={startPan}
                                onMouseMove={handlePan}
                                onMouseUp={stopPan}
                                onMouseLeave={stopPan}
                                onContextMenu={(e) => e.preventDefault()}
                            >

                                <div
                                    className="relative inline-block"
                                    style={{
                                        transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                                        transformOrigin: 'center center',
                                        transition: isPanning ? 'none' : 'transform 0.1s ease-out'
                                    }}
                                >

                                    <canvas
                                        ref={canvasRef}
                                        style={{
                                            display: 'block',
                                            border: '1px solid #ccc',
                                            cursor: isPanning ? 'move' : (currentTool === 'pipette' ? 'crosshair' : currentTool === 'eraser' ? 'crosshair' : 'crosshair')
                                        }}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                    />

                                </div>
                            </div>

                            <div className="text-white text-xs mt-2 space-y-1">
                                <div>Canvas status: {imagesLoaded ? '✅ Loaded' : '⏳ Loading...'}</div>
                                {imagesLoaded && (
                                    <>
                                        <div>Template: {canvasRef.current?.width}x{canvasRef.current?.height}px</div>
                                        <div>Zoom: {Math.round(zoomLevel * 100)}% | Pan: {Math.round(panOffset.x)},{Math.round(panOffset.y)}</div>
                                        <div>Tool: {currentTool} | Color: {selectedColor} | Brush: {brushSize}px</div>
                                        <div>Layer actif: {layers.find(l => l.id === activeLayer)?.name}</div>
                                        <div>Historique: {historyIndex + 1}/{history.length}</div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        {showReference && (
                            <div className="bg-black/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4">
                                <h3 className="text-white font-semibold mb-4">
                                    👁️ Modèle {currentModelData.name}
                                </h3>

                                <div className="mb-3">
                                    <label className="text-purple-200 text-sm mb-2 block">
                                        Zoom: {Math.round(refZoomLevel * 100)}%
                                    </label>
                                    <div className="grid grid-cols-3 gap-2 mb-2">
                                        <button
                                            onClick={() => handleRefZoom(-0.25)}
                                            className="bg-purple-700/50 text-white py-2 px-3 rounded text-lg font-bold"
                                        >
                                            −
                                        </button>
                                        <button
                                            onClick={resetRefView}
                                            className="bg-purple-700/50 text-white py-2 px-3 rounded text-sm"
                                        >
                                            Reset
                                        </button>
                                        <button
                                            onClick={() => handleRefZoom(0.25)}
                                            className="bg-purple-700/50 text-white py-2 px-3 rounded text-lg font-bold"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="mb-2">
                                        <div className="text-purple-300 text-xs mb-1">Déplacement modèle:</div>
                                        <div className="grid grid-cols-3 gap-1 max-w-[120px] mx-auto">
                                            <div></div>
                                            <button
                                                onClick={() => setRefPanOffset(prev => ({ ...prev, y: prev.y + 30 }))}
                                                className="bg-purple-700/50 text-white py-2 rounded"
                                            >
                                                ↑
                                            </button>
                                            <div></div>
                                            <button
                                                onClick={() => setRefPanOffset(prev => ({ ...prev, x: prev.x + 30 }))}
                                                className="bg-purple-700/50 text-white py-2 rounded"
                                            >
                                                ←
                                            </button>
                                            <button
                                                onClick={resetRefView}
                                                className="bg-purple-700/50 text-white py-2 rounded text-xs"
                                            >
                                                ⊙
                                            </button>
                                            <button
                                                onClick={() => setRefPanOffset(prev => ({ ...prev, x: prev.x - 30 }))}
                                                className="bg-purple-700/50 text-white py-2 rounded"
                                            >
                                                →
                                            </button>
                                            <div></div>
                                            <button
                                                onClick={() => setRefPanOffset(prev => ({ ...prev, y: prev.y - 30 }))}
                                                className="bg-purple-700/50 text-white py-2 rounded"
                                            >
                                                ↓
                                            </button>
                                            <div></div>
                                        </div>
                                    </div>

                                    <div className="text-purple-300 text-xs mb-2">
                                        Clic sur l'image avec la pipette 💧 pour récupérer une couleur
                                    </div>
                                </div>

                                <div
                                    className="bg-white rounded-lg overflow-hidden flex justify-center items-center relative"
                                    style={{ minHeight: '300px' }}
                                    onWheel={handleRefWheel}
                                    onMouseDown={startRefPan}
                                    onMouseMove={handleRefPan}
                                    onMouseUp={stopRefPan}
                                    onMouseLeave={stopRefPan}
                                    onContextMenu={(e) => e.preventDefault()}
                                >
                                    <div
                                        className="relative inline-block"
                                        style={{
                                            transform: `scale(${refZoomLevel}) translate(${refPanOffset.x / refZoomLevel}px, ${refPanOffset.y / refZoomLevel}px)`,
                                            transformOrigin: 'center center',
                                            transition: isRefPanning ? 'none' : 'transform 0.1s ease-out'
                                        }}
                                    >
                                        <canvas
                                            ref={referenceCanvasRef}
                                            onClick={(e) => {
                                                if (currentTool === 'pipette') {
                                                    pickColorFromReference(e);
                                                }
                                            }}
                                            style={{
                                                display: 'block',
                                                maxWidth: '100%',
                                                height: 'auto',
                                                cursor: currentTool === 'pipette' ? 'crosshair' : (isRefPanning ? 'move' : 'default')
                                            }}
                                        />

                                        {debugPoint && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    left: `${debugPoint.cssX}px`,
                                                    top: `${debugPoint.cssY}px`,
                                                    width: 20, height: 20, borderRadius: '50%',
                                                    backgroundColor: 'rgba(255,0,0,0.7)', border: '3px solid #fff',
                                                    transform: 'translate(-50%, -50%)',
                                                    pointerEvents: 'none', zIndex: 1000,
                                                    boxShadow: '0 0 20px rgba(255,0,0,1), inset 0 0 10px rgba(255,255,255,0.5)',
                                                    animation: 'pulse 0.5s ease-in-out infinite',
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>

                                <p className="text-purple-200 text-sm mt-2">
                                    Utilise ce modèle comme référence pour tes couleurs
                                </p>

                                <div className="mt-3 flex gap-2">
                                    <button
                                        onClick={() => setShowReference(false)}
                                        className="text-xs bg-purple-700/50 text-white py-1 px-2 rounded"
                                    >
                                        Masquer
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DrawBeru;