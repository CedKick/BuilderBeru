import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { drawBeruModels, getModel, getHunterModels } from './config/models';

// ⚡ HOOK MOBILE SIMPLIFIÉ (au lieu d'importer un fichier externe)
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isMobile;
};

// ⚡ HOOK GESTURES MOBILE
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
            touchStartRef.current = {
                touches: Array.from(e.touches),
                distance: getTouchDistance(e.touches)
            };
        } else if (e.touches.length === 1) {
            touchStartRef.current = {
                touches: [{ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }],
                distance: 0
            };
        }
    };

    const handleTouchMove = (e) => {
        if (!enabled) return;

        if (e.touches.length === 2 && touchStartRef.current.distance > 0) {
            e.preventDefault();
            const newDistance = getTouchDistance(e.touches);
            const delta = (newDistance - touchStartRef.current.distance) * 0.01;
            onPinch?.(delta);
            touchStartRef.current.distance = newDistance;
        } else if (e.touches.length === 1 && touchStartRef.current.touches.length === 1) {
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

const DrawBeruFixed = () => {
    const { t } = useTranslation();
    const isMobile = useIsMobile();

    // Canvas refs
    const canvasRef = useRef(null);
    const layersRef = useRef([]);
    const referenceCanvasRef = useRef(null);
    const overlayCanvasRef = useRef(null);

    // States
    const [selectedHunter, setSelectedHunter] = useState('ilhwan');
    const [selectedModel, setSelectedModel] = useState('default');
    const [selectedColor, setSelectedColor] = useState('#FF0000');
    const [brushSize, setBrushSize] = useState(3);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentTool, setCurrentTool] = useState('brush');
    const [imagesLoaded, setImagesLoaded] = useState(false);

    // Mobile specific states
    const [interactionMode, setInteractionMode] = useState('draw');
    const [showModelOverlay, setShowModelOverlay] = useState(false);
    const [modelOverlayOpacity, setModelOverlayOpacity] = useState(0.3);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Zoom & Pan
    const [zoomLevel, setZoomLevel] = useState(1);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
    const MAX_ZOOM = isMobile ? 8 : 3;
    const ZOOM_STEP = isMobile ? 0.3 : 0.25;

    // Reference canvas states
    const [refZoomLevel, setRefZoomLevel] = useState(1);
    const [refPanOffset, setRefPanOffset] = useState({ x: 0, y: 0 });
    const [isRefPanning, setIsRefPanning] = useState(false);
    const [lastRefPanPoint, setLastRefPanPoint] = useState({ x: 0, y: 0 });
    const [debugPoint, setDebugPoint] = useState(null);
    const [showReference, setShowReference] = useState(true);

    // Layers
    const [layers, setLayers] = useState([
        { id: 'base', name: 'Base', visible: true, opacity: 1, locked: false },
        { id: 'shadows', name: 'Ombres', visible: true, opacity: 1, locked: false },
        { id: 'details', name: 'Détails', visible: true, opacity: 1, locked: false }
    ]);
    const [activeLayer, setActiveLayer] = useState('base');

    // History
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [coloringProgress, setColoringProgress] = useState(0);
    const [progressDetails, setProgressDetails] = useState(null);

    const currentModelData = getModel(selectedHunter, selectedModel);
    const availableModels = getHunterModels(selectedHunter);

    // Touch gestures
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

    // Load model overlay for mobile
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

    // Load canvas and template
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


        const userData = JSON.parse(localStorage.getItem('builderberu_users') || '{}');
        const existingColoring = userData.user?.accounts?.default?.colorings?.[selectedHunter]?.[selectedModel];

        if (existingColoring && existingColoring.layers) {
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

                        if (loadedLayers === totalLayers) {
                            renderLayers();
                            setTimeout(() => saveToHistory(), 100);
                        }
                    };
                    img.onerror = () => {
                        console.error(`❌ Error loading layer ${i}`);
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
            const templateImg = new Image();
            templateImg.crossOrigin = "anonymous";
            templateImg.onload = () => {
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(templateImg, 0, 0, width, height);
                setImagesLoaded(true);
                saveToHistory();
            };
            templateImg.onerror = () => {
                console.error('❌ Error loading template');
                setImagesLoaded(true);
            };
            templateImg.src = currentModelData.template;
        }

        // Load reference
        const refCanvas = referenceCanvasRef.current;
        if (refCanvas) {
            const refImg = new Image();
            refImg.crossOrigin = "anonymous";
            refImg.onload = () => {
                refCanvas.width = refImg.width;
                refCanvas.height = refImg.height;
                const refCtx = refCanvas.getContext('2d');
                refCtx.drawImage(refImg, 0, 0);
            };
            refImg.src = currentModelData.reference;
        }
    }, [currentModelData, selectedHunter, selectedModel]);

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

            // Calculer la progression après le rendu
            setTimeout(() => updateProgress(), 500);
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
            // Calculer la progression même en cas d'erreur
            setTimeout(() => updateProgress(), 500);
        };
        templateImg.src = currentModelData.template;
    };

    // FONCTION DE CALCUL DU POURCENTAGE DE COLORIAGE
        const calculateColoringProgress = () => {
            const canvas = canvasRef.current;

            if (!canvas || !currentModelData || !imagesLoaded) {
                return Promise.resolve({
                    percentage: 0,
                    coloredPixels: 0,
                    totalColorablePixels: 0,
                    details: { layers: 0, canvasSize: '0x0' }
                });
            }

            return new Promise((resolve) => {
                const templateCanvas = document.createElement('canvas');
                templateCanvas.width = canvas.width;
                templateCanvas.height = canvas.height;
                const templateCtx = templateCanvas.getContext('2d');

                const templateImg = new Image();
                templateImg.crossOrigin = "anonymous";

                templateImg.onload = () => {
                    // Dessiner le template de base
                    templateCtx.drawImage(templateImg, 0, 0, templateCanvas.width, templateCanvas.height);

                    // Obtenir les données du template
                    const templateData = templateCtx.getImageData(0, 0, templateCanvas.width, templateCanvas.height);

                    // Créer un canvas avec tout le coloriage actuel
                    const coloringCanvas = document.createElement('canvas');
                    coloringCanvas.width = canvas.width;
                    coloringCanvas.height = canvas.height;
                    const coloringCtx = coloringCanvas.getContext('2d');

                    // Dessiner le template de base
                    coloringCtx.drawImage(templateImg, 0, 0, coloringCanvas.width, coloringCanvas.height);

                    // Ajouter tous les layers visibles
                    layers.forEach((layer, index) => {
                        if (layer.visible && layersRef.current[index]) {
                            coloringCtx.globalAlpha = layer.opacity;
                            coloringCtx.drawImage(layersRef.current[index], 0, 0);
                            coloringCtx.globalAlpha = 1;
                        }
                    });

                    // Obtenir les données du coloriage final
                    const coloringData = coloringCtx.getImageData(0, 0, coloringCanvas.width, coloringCanvas.height);

                    // Calculer le pourcentage
                    let totalColorablePixels = 0;
                    let coloredPixels = 0;

                    for (let i = 0; i < templateData.data.length; i += 4) {
                        const templateR = templateData.data[i];
                        const templateG = templateData.data[i + 1];
                        const templateB = templateData.data[i + 2];
                        const templateA = templateData.data[i + 3];

                        const coloringR = coloringData.data[i];
                        const coloringG = coloringData.data[i + 1];
                        const coloringB = coloringData.data[i + 2];

                        // Vérifier si c'est une zone colorable (pas transparente et pas complètement blanche)
                        if (templateA > 0 && !(templateR > 240 && templateG > 240 && templateB > 240)) {
                            totalColorablePixels++;

                            // Vérifier si le pixel a été modifié par rapport au template
                            const hasChanged = Math.abs(coloringR - templateR) > 10 ||
                                Math.abs(coloringG - templateG) > 10 ||
                                Math.abs(coloringB - templateB) > 10;

                            if (hasChanged) {
                                coloredPixels++;
                            }
                        }
                    }

                    const percentage = totalColorablePixels > 0 ?
                        Math.round((coloredPixels / totalColorablePixels) * 100) : 0;

                    resolve({
                        percentage,
                        coloredPixels,
                        totalColorablePixels,
                        details: {
                            layers: layers.filter(l => l.visible).length,
                            canvasSize: `${canvas.width}x${canvas.height}`
                        }
                    });
                };

                templateImg.onerror = () => {
                    resolve({
                        percentage: 0,
                        coloredPixels: 0,
                        totalColorablePixels: 0,
                        details: { layers: 0, canvasSize: '0x0' }
                    });
                };

                templateImg.src = currentModelData.template;
            });
        };

    // CALCULER LE POURCENTAGE APRÈS CHAQUE MODIFICATION
    const updateProgress = async () => {
        try {
            const progress = await calculateColoringProgress();
            setColoringProgress(progress.percentage);
            setProgressDetails(progress);
        } catch (error) {
            console.error('❌ Erreur calcul progression:', error);
        }
    };

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

    // Keyboard shortcuts
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

    const getCanvasCoordinates = (e, canvas) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        return { x, y };
    };

    const handleZoom = (delta) => {
        const newZoom = Math.max(0.5, Math.min(MAX_ZOOM, zoomLevel + delta));
        setZoomLevel(newZoom);
    };

    const drawInstantPoint = (e) => {
        const layer = layers.find(l => l.id === activeLayer);
        if (layer?.locked) return;

        const activeLayerIndex = layers.findIndex(l => l.id === activeLayer);
        const layerCanvas = layersRef.current[activeLayerIndex];
        if (!layerCanvas) return;

        const ctx = layerCanvas.getContext('2d');
        const { x, y } = getCanvasCoordinates(e, canvasRef.current);

        if (x < 0 || x > layerCanvas.width || y < 0 || y > layerCanvas.height) return;

        ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';

        if (brushSize < 1) {
            ctx.strokeStyle = selectedColor;
            ctx.lineWidth = brushSize * 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 0.1, y + 0.1);
            ctx.stroke();
        } else {
            ctx.fillStyle = selectedColor;
            ctx.beginPath();
            ctx.arc(x, y, brushSize, 0, 2 * Math.PI);
            ctx.fill();
        }

        renderLayers();
    };

    const handleTouchDraw = (e) => {
        e.preventDefault();

        if (!e.touches || e.touches.length === 0) return;
        const touch = e.touches[0];

        if (currentTool === 'pipette') {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();

            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = Math.floor((touch.clientX - rect.left) * scaleX);
            const y = Math.floor((touch.clientY - rect.top) * scaleY);

            if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;

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

        if (interactionMode !== 'draw') return;

        const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 'mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY,
            bubbles: true
        });

        if (e.type === 'touchstart') {
            startDrawing(mouseEvent);
            drawInstantPoint(mouseEvent);
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
        if (!isMobile) {
            draw(e);
        }
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

        if (brushSize < 1) {
            ctx.strokeStyle = selectedColor;
            ctx.lineWidth = brushSize * 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.lineTo(x, y);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.arc(x, y, brushSize, 0, 2 * Math.PI);
            ctx.fill();
        }

        renderLayers();
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
                console.error(`❌ Error exporting layer ${i}:`, e);
                return null;
            }
        }).filter(l => l !== null);

        if (layersData.length === 0) {
            alert('❌ Impossible d\'exporter les layers');
            return;
        }

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
            } catch (e) {
                console.error('❌ Error generating images:', e);
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

            try {
                localStorage.setItem('builderberu_users', JSON.stringify(userData));
                alert(`✅ Coloriage sauvegardé !\n\nHunter: ${selectedHunter}\nModèle: ${selectedModel}\nCalques: ${coloringData.layers.length}`);
            } catch (e) {
                console.error('❌ Error saving:', e);
                if (e.name === 'QuotaExceededError') {
                    alert('⚠️ Espace localStorage plein !');
                } else {
                    alert('❌ Erreur de sauvegarde');
                }
            }
        };

        templateImg.src = currentModelData.template;
    };

    const downloadTransparentPNG = () => {
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
                alert('✅ Image téléchargée !');
            }, 'image/png', 1.0);
        };

        templateImg.src = currentModelData.template;
    };

    const downloadColoredPNG = () => {
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
            alert('✅ Modèle de référence téléchargé !');
        }, 'image/png', 1.0);
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
            alert('❌ Aucun coloriage à exporter');
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
        alert('✅ Coloriage exporté !');
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

                    alert('✅ Coloriage importé ! Recharge la page pour voir le résultat.');

                    if (importedData.hunter === selectedHunter && importedData.model === selectedModel) {
                        window.location.reload();
                    }
                } catch (error) {
                    alert('❌ Erreur lors de l\'import : ' + error.message);
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
        setColoringProgress(0);
        setProgressDetails(null);
    };

    // COMPOSANT D'AFFICHAGE DU POURCENTAGE
    const ProgressDisplay = () => (
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold text-sm">🎯 Progression</span>
                <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                    {coloringProgress}%
                </span>
            </div>

            <div className="w-full bg-purple-900/30 rounded-full h-3 mb-2 overflow-hidden">
                <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-700 ease-out relative"
                    style={{ width: `${coloringProgress}%` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                </div>
            </div>

            {progressDetails && (
                <div className="text-xs text-purple-200 space-y-1">
                    <div>✨ Pixels colorés: {progressDetails.coloredPixels.toLocaleString()}</div>
                    <div>🎯 Zones totales: {progressDetails.totalColorablePixels.toLocaleString()}</div>
                    <div>📚 Calques actifs: {progressDetails.details.layers}</div>
                </div>
            )}

            <div className="mt-2 text-xs text-center">
                {coloringProgress === 0 && (
                    <span className="text-purple-300">🚀 Commence ton chef-d'œuvre !</span>
                )}
                {coloringProgress > 0 && coloringProgress < 25 && (
                    <span className="text-blue-300">👶 Tu commences bien !</span>
                )}
                {coloringProgress >= 25 && coloringProgress < 50 && (
                    <span className="text-green-300">💪 Tu progresses rapidement !</span>
                )}
                {coloringProgress >= 50 && coloringProgress < 75 && (
                    <span className="text-yellow-300">🔥 Tu es sur la bonne voie !</span>
                )}
                {coloringProgress >= 75 && coloringProgress < 90 && (
                    <span className="text-orange-300">⭐ Presque fini, courage !</span>
                )}
                {coloringProgress >= 90 && coloringProgress < 100 && (
                    <span className="text-pink-300">🎉 Plus que quelques détails !</span>
                )}
                {coloringProgress === 100 && (
                    <span className="text-yellow-300 font-bold">🏆 CHEF-D'ŒUVRE TERMINÉ ! 🏆</span>
                )}
            </div>

            <button
                onClick={updateProgress}
                className="w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-1 rounded-lg text-xs font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
                🔄 Recalculer progression
            </button>
        </div>
    );

    const MobileProgressBadge = () => (
        <div
            className="fixed top-20 right-4 z-[1000] bg-black/60 backdrop-blur-md rounded-full px-3 py-2 border border-purple-500/30"
            style={{ minWidth: '70px' }}
        >
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <span className="text-white font-bold text-sm">{coloringProgress}%</span>
            </div>
        </div>
    );

    const handleHunterChange = (hunterId) => {
        setSelectedHunter(hunterId);
        setSelectedModel('default');
        setImagesLoaded(false);
        setHistory([]);
        setHistoryIndex(-1);
        setColoringProgress(0);
        setProgressDetails(null);
    };

    // Canvas event handlers
    const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
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

    // Reference canvas handlers
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

    const resetView = () => {
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
    };

    if (!currentModelData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-white text-xl">Modèle non trouvé</div>
            </div>
        );
    }

    // RENDER MOBILE
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

                {/* HEADER MOBILE COMPACT */}
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

                {/* MOBILE PROGRESS BADGE */}
                <MobileProgressBadge />

                {/* MOBILE MENU OVERLAY */}
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
                            {/* PROGRESS DISPLAY MOBILE */}
                            <ProgressDisplay />

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

                {/* CANVAS MOBILE FULLSCREEN */}
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
                            <canvas
                                ref={canvasRef}
                                style={{
                                    display: 'block',
                                    touchAction: 'none',
                                    cursor: currentTool === 'pipette' ? 'crosshair' : (interactionMode === 'pan' ? 'grab' : 'crosshair')
                                }}
                            />

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

                    {/* CONTROLS EN HAUT */}
                    <div className="absolute top-4 left-4 right-4 z-[1000] flex items-start gap-3">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setInteractionMode(interactionMode === 'draw' ? 'pan' : 'draw')}
                                className={`flex items-center justify-center w-10 h-10 rounded-lg shadow-md text-lg transition-all active:scale-95 backdrop-blur-sm ${interactionMode === 'draw'
                                    ? 'bg-green-600/40 hover:bg-green-600/60 text-white border border-green-400/20'
                                    : 'bg-blue-600/40 hover:bg-blue-600/60 text-white border border-blue-400/20'
                                    }`}
                            >
                                {interactionMode === 'draw' ? '🖌️' : '✋'}
                            </button>

                            <button
                                onClick={() => setShowModelOverlay(!showModelOverlay)}
                                className={`flex items-center justify-center w-10 h-10 rounded-lg shadow-md text-lg transition-all active:scale-95 backdrop-blur-sm ${showModelOverlay
                                    ? 'bg-purple-600/40 hover:bg-purple-600/60 text-white border border-purple-400/20'
                                    : 'bg-gray-700/40 hover:bg-gray-700/60 text-white border border-gray-500/20'
                                    }`}
                            >
                                {showModelOverlay ? '👁️' : '🙈'}
                            </button>
                        </div>

                        {showModelOverlay && (
                            <div className="flex-1 bg-black/60 backdrop-blur-md rounded-lg p-2 shadow-lg border border-purple-500/30 max-w-[200px]">
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
                                />
                            </div>
                        )}
                    </div>

                    {/* CONTROLS BAS */}
                    <div className="fixed bottom-20 left-2 right-2 z-[1000] flex items-center gap-2">
                        <div className="flex gap-2 shrink-0">
                            <button
                                onClick={undo}
                                disabled={!canUndo}
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-md transition-all active:scale-95 backdrop-blur-sm ${canUndo
                                    ? 'bg-blue-600/40 hover:bg-blue-600/60 text-white border border-blue-400/20'
                                    : 'bg-gray-600/30 text-gray-400 border border-gray-500/15'
                                    }`}
                            >
                                ↶
                            </button>
                            <button
                                onClick={redo}
                                disabled={!canRedo}
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-md transition-all active:scale-95 backdrop-blur-sm ${canRedo
                                    ? 'bg-blue-600/40 hover:bg-blue-600/60 text-white border border-blue-400/20'
                                    : 'bg-gray-600/30 text-gray-400 border border-gray-500/15'
                                    }`}
                            >
                                ↷
                            </button>
                        </div>

                        {(currentTool === 'brush' || currentTool === 'eraser') && (
                            <div className="flex-1 bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1.5 shadow-md border border-purple-500/20">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center justify-center w-6 h-6 rounded bg-purple-600/50 text-sm shrink-0">
                                        {currentTool === 'brush' ? '🖌️' : '🧽'}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <span className="text-white/80 text-[9px] font-medium">Taille</span>
                                            <span className="text-purple-300 text-[10px] font-mono font-bold">
                                                {brushSize.toFixed(1)}px
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="30"
                                            step="0.1"
                                            value={brushSize}
                                            onChange={(e) => setBrushSize(parseFloat(e.target.value))}
                                            className="w-full h-1 bg-purple-900/30 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>

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
                        />
                    </div>
                </div>

                {/* BOTTOM TOOLBAR MOBILE */}
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

    // RENDER DESKTOP
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
                            <h1 className="text-3xl font-bold text-white">🎨 DrawBeru</h1>
                            <p className="text-purple-200">Colorie {currentModelData.name}</p>
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
                    {/* LEFT PANEL - PALETTE & TOOLS */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* PROGRESS DISPLAY DESKTOP */}
                        <ProgressDisplay />
                        <div className="bg-black/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4">
                            <h3 className="text-white font-semibold mb-4">🎨 Palette</h3>

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

                        {/* LAYERS PANEL */}
                        <div className="bg-black/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4">
                            <h3 className="text-white font-semibold mb-4">📚 Calques</h3>

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

                    {/* CENTER - CANVAS */}
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
                                        <div>🎯 Progression: {coloringProgress}%</div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL - REFERENCE */}
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

export default DrawBeruFixed;