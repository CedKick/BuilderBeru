import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { drawBeruModels, getModel, getHunterModels } from './config/models';
import { BrushEngine, MANGA_BRUSHES } from './BrushEngine';

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

// 🎨 BRUSH TYPES CONFIGURATION - Mapping vers MANGA_BRUSHES
// Ces types sont utilisés pour la compatibilité avec l'UI existante
const BRUSH_TYPES = {
    pen: {
        id: 'gpen',
        name: 'G-Pen',
        icon: '✒️',
        description: 'Encrage manga professionnel',
        ...MANGA_BRUSHES.gpen
    },
    pencil: {
        id: 'pencil',
        name: 'Crayon Manga',
        icon: '✏️',
        description: 'Esquisse avec grain',
        ...MANGA_BRUSHES.pencil
    },
    marker: {
        id: 'marker',
        name: 'Feutre Copic',
        icon: '🖍️',
        description: 'Coloriage semi-transparent',
        ...MANGA_BRUSHES.marker
    },
    airbrush: {
        id: 'airbrush',
        name: 'Aérographe',
        icon: '💨',
        description: 'Dégradés et ombres douces',
        ...MANGA_BRUSHES.airbrush
    },
    pixel: {
        id: 'pixel',
        name: 'Pixel',
        icon: '▪️',
        description: 'Pixel art',
        ...MANGA_BRUSHES.pixel
    },
    // Nouveaux pinceaux manga
    mapping: {
        id: 'mapping',
        name: 'Mapping Pen',
        icon: '🖊️',
        description: 'Lignes fines et détails',
        ...MANGA_BRUSHES.mapping
    },
    softbrush: {
        id: 'softbrush',
        name: 'Brush Doux',
        icon: '🖌️',
        description: 'Ombres et dégradés',
        ...MANGA_BRUSHES.softbrush
    }
};

const DrawBeruFixed = () => {
    const { t } = useTranslation();
    const isMobile = useIsMobile();

    // Canvas refs
    const canvasRef = useRef(null);
    const layersRef = useRef([]);
    const referenceCanvasRef = useRef(null);
    const overlayCanvasRef = useRef(null);

    // 🎨 Helper: Récupère le dernier dessin visité depuis localStorage
    const getLastDrawing = () => {
        try {
            const stored = localStorage.getItem('drawberu_last_drawing');
            if (stored) {
                const { hunter, model } = JSON.parse(stored);
                // Vérifie que le hunter existe dans les modèles disponibles
                if (drawBeruModels[hunter] && drawBeruModels[hunter].models[model]) {
                    return { hunter, model };
                }
            }
        } catch (error) {
            console.error('❌ Error loading last drawing:', error);
        }
        // Par défaut: premier hunter de la liste avec son modèle par défaut
        const firstHunter = Object.keys(drawBeruModels)[0];
        return { hunter: firstHunter, model: 'default' };
    };

    const lastDrawing = getLastDrawing();

    // States
    const [selectedHunter, setSelectedHunter] = useState(lastDrawing.hunter);
    const [selectedModel, setSelectedModel] = useState(lastDrawing.model);
    // 🎨 Couleur par défaut: noir pour le lineart manga (pas rouge!)
    const [selectedColor, setSelectedColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(3);
    const [brushType, setBrushType] = useState('pen'); // 🎨 NEW: Type de brush (pen, pencil, marker, airbrush, pixel)
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
    const MAX_ZOOM = isMobile ? 25 : 10;
    const ZOOM_STEP = isMobile ? 0.5 : 0.25;

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

    // 🎮 CHEAT CODE STATES
    const [cheatModeActive, setCheatModeActive] = useState(false);
    const [cheatCooldown, setCheatCooldown] = useState(null);
    const [cheatTimeRemaining, setCheatTimeRemaining] = useState(10);
    const [pressedKeys, setPressedKeys] = useState(new Set());
    const cheatTimerRef = useRef(null);
    const cheatCountdownRef = useRef(null);

    // 🎨 AUTO-PIPETTE MODE - Colorie avec les couleurs du modèle de référence
    const [autoPipetteMode, setAutoPipetteMode] = useState(false);

    // 🔢 BRUSH SIZE CONTROLS - Long press refs
    const brushSizeIntervalRef = useRef(null);

    // ✨ PRECISION DRAWING - Interpolation & Stabilization
    const lastPointRef = useRef(null); // Dernier point dessiné pour interpolation
    const [stabilization, setStabilization] = useState(0); // 0-10, 0 = off
    const stabilizationBufferRef = useRef([]); // Buffer pour lissage
    const STABILIZATION_BUFFER_SIZE = 8; // Nombre de points à moyenner

    // 🎯 CURSOR PREVIEW - Position du curseur pour preview
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0, visible: false });

    // 🖌️ BRUSH ENGINE PRO - Tracking pression et vitesse
    const lastDrawTimeRef = useRef(performance.now());
    const lastDrawPositionRef = useRef(null);
    const currentVelocityRef = useRef(0);
    const currentPressureRef = useRef(1.0);

    // 🖌️ BRUSH ENGINE PRO - Instance et paramètres avancés
    const brushEngineRef = useRef(null);
    const [pressureSensitivity, setPressureSensitivity] = useState(0.85); // 0-1
    const [velocitySensitivity, setVelocitySensitivity] = useState(0.3);  // 0-1
    const [currentPressure, setCurrentPressure] = useState(1.0);          // État de la pression actuelle
    const [currentVelocity, setCurrentVelocity] = useState(0);            // État de la vitesse actuelle
    const [enablePressure, setEnablePressure] = useState(true);           // Activer/désactiver pression
    const [enableVelocity, setEnableVelocity] = useState(true);           // Activer/désactiver vitesse
    const [taperStart, setTaperStart] = useState(0.2);                    // Effilage début
    const [taperEnd, setTaperEnd] = useState(0.3);                        // Effilage fin

    // Initialiser le BrushEngine
    if (!brushEngineRef.current) {
        brushEngineRef.current = new BrushEngine();
    }

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

    // 💾 Sauvegarde automatique du dernier dessin visité
    useEffect(() => {
        try {
            localStorage.setItem('drawberu_last_drawing', JSON.stringify({
                hunter: selectedHunter,
                model: selectedModel
            }));
            console.log('✅ Last drawing saved:', selectedHunter, selectedModel);
        } catch (error) {
            console.error('❌ Error saving last drawing:', error);
        }
    }, [selectedHunter, selectedModel]);

    // Load model overlay for mobile and desktop
    useEffect(() => {
        if (!currentModelData || !showModelOverlay) return;

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
    }, [showModelOverlay, modelOverlayOpacity, currentModelData]);

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

        console.log('🔍 DEBUG LOAD - Start');

        const userData = JSON.parse(localStorage.getItem('builderberu_users') || '{}');
        const existingColoring = userData.user?.accounts?.default?.colorings?.[selectedHunter]?.[selectedModel];

        if (existingColoring && existingColoring.layers) {
            console.log('✅ Loading existing coloring');
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
            console.log('📄 Loading blank template');
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

    // 🎮 CHEAT CODE: Détection de la combinaison A+E+R+T+Shift
    useEffect(() => {
        // Desktop uniquement
        if (isMobile) return;

        const handleKeyDown = (e) => {
            setPressedKeys(prev => {
                const newKeys = new Set(prev);
                newKeys.add(e.key.toLowerCase());

                // Vérifier si la combinaison correcte est pressée
                if (newKeys.has('a') && newKeys.has('e') && newKeys.has('r') &&
                    newKeys.has('t') && e.shiftKey) {
                    activateCheatMode();
                }

                return newKeys;
            });
        };

        const handleKeyUp = (e) => {
            setPressedKeys(prev => {
                const newKeys = new Set(prev);
                newKeys.delete(e.key.toLowerCase());
                return newKeys;
            });
        };

        const activateCheatMode = () => {
            // Vérifier le cooldown
            const now = Date.now();
            const storedCooldown = localStorage.getItem('drawberu_cheat_cooldown');

            if (storedCooldown) {
                const cooldownEnd = parseInt(storedCooldown);
                if (now < cooldownEnd) {
                    const remainingMinutes = Math.ceil((cooldownEnd - now) / 60000);
                    alert(`⏳ Cheat code en cooldown ! Réessayez dans ${remainingMinutes} minute(s).`);
                    return;
                }
            }

            // Activer le cheat mode
            setCheatModeActive(true);
            setCheatTimeRemaining(10);
            console.log('🎮 CHEAT MODE ACTIVÉ ! 10 secondes de coloriage parfait...');

            // Décompte
            let timeLeft = 10;
            cheatCountdownRef.current = setInterval(() => {
                timeLeft--;
                setCheatTimeRemaining(timeLeft);
                if (timeLeft <= 0) {
                    clearInterval(cheatCountdownRef.current);
                }
            }, 1000);

            // Timer de 10 secondes
            if (cheatTimerRef.current) {
                clearTimeout(cheatTimerRef.current);
            }

            cheatTimerRef.current = setTimeout(() => {
                setCheatModeActive(false);
                console.log('⏱️ Cheat mode désactivé');

                // Définir le cooldown d'1 heure
                const cooldownEnd = Date.now() + (60 * 60 * 1000); // 1 heure
                localStorage.setItem('drawberu_cheat_cooldown', cooldownEnd.toString());
                setCheatCooldown(cooldownEnd);
            }, 10000); // 10 secondes
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (cheatTimerRef.current) {
                clearTimeout(cheatTimerRef.current);
            }
            if (cheatCountdownRef.current) {
                clearInterval(cheatCountdownRef.current);
            }
        };
    }, [isMobile]);

    // 🎨 FEATURE 3: Fixed renderLayers to ensure proper color rendering
    const renderLayers = () => {
        const canvas = canvasRef.current;
        // Use alpha: true and willReadFrequently for proper color handling
        const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: true });

        const templateImg = new Image();
        templateImg.crossOrigin = "anonymous";
        templateImg.onload = () => {
            // Reset composite operation to ensure proper color rendering
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

            layers.forEach((layer, index) => {
                if (layer.visible && layersRef.current[index]) {
                    ctx.globalCompositeOperation = 'source-over';
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
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            layers.forEach((layer, index) => {
                if (layer.visible && layersRef.current[index]) {
                    ctx.globalCompositeOperation = 'source-over';
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
            console.log('🎯 Progression coloriage:', progress);
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

                // 🎨 FEATURE 1: Brush type cycling with B key when tool is brush
                // 🔢 FEATURE 2: Brush size shortcuts with [ and ]
                if (e.key === '[') {
                    e.preventDefault();
                    setBrushSize(prev => Math.max(0.1, Math.round((prev - 0.1) * 10) / 10));
                }
                if (e.key === ']') {
                    e.preventDefault();
                    setBrushSize(prev => Math.min(50, Math.round((prev + 0.1) * 10) / 10));
                }
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

    // 🔢 FEATURE 2: Brush Size Controls
    const incrementBrushSize = () => {
        setBrushSize(prev => Math.min(50, Math.round((prev + 0.1) * 10) / 10));
    };

    const decrementBrushSize = () => {
        setBrushSize(prev => Math.max(0.1, Math.round((prev - 0.1) * 10) / 10));
    };

    const startBrushSizeRepeat = (increment) => {
        if (brushSizeIntervalRef.current) return;
        brushSizeIntervalRef.current = setInterval(() => {
            if (increment) {
                incrementBrushSize();
            } else {
                decrementBrushSize();
            }
        }, 100);
    };

    const stopBrushSizeRepeat = () => {
        if (brushSizeIntervalRef.current) {
            clearInterval(brushSizeIntervalRef.current);
            brushSizeIntervalRef.current = null;
        }
    };

    // ✨ PRECISION: Fonction d'interpolation linéaire entre deux points
    const interpolatePoints = (p1, p2, spacing) => {
        const points = [];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Si la distance est trop petite, pas besoin d'interpoler
        if (distance < spacing) {
            return [p2];
        }

        const steps = Math.ceil(distance / spacing);
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            points.push({
                x: p1.x + dx * t,
                y: p1.y + dy * t
            });
        }
        return points;
    };

    // ✨ PRECISION: Fonction de stabilisation (moyenne des derniers points)
    const stabilizePoint = (point) => {
        if (stabilization === 0) return point;

        stabilizationBufferRef.current.push(point);

        // Garder seulement les N derniers points
        const bufferSize = Math.max(2, Math.floor(stabilization * STABILIZATION_BUFFER_SIZE / 10));
        while (stabilizationBufferRef.current.length > bufferSize) {
            stabilizationBufferRef.current.shift();
        }

        // Calculer la moyenne pondérée (points récents ont plus de poids)
        let totalWeight = 0;
        let sumX = 0;
        let sumY = 0;

        stabilizationBufferRef.current.forEach((p, i) => {
            const weight = i + 1; // Les points plus récents ont plus de poids
            sumX += p.x * weight;
            sumY += p.y * weight;
            totalWeight += weight;
        });

        return {
            x: sumX / totalWeight,
            y: sumY / totalWeight
        };
    };

    // ✨ PRECISION: Générer curseur SVG dynamique
    const generateDynamicCursor = (size, color, tool, brushTypeId) => {
        const displaySize = Math.max(4, Math.min(size * 2, 64)); // Taille affichée (4-64px)
        const center = displaySize / 2 + 2;
        const totalSize = displaySize + 4;

        let shape;
        if (tool === 'eraser') {
            // Gomme: cercle rouge avec bordure
            shape = `<circle cx="${center}" cy="${center}" r="${displaySize/2}" fill="rgba(255,100,100,0.3)" stroke="rgba(255,100,100,0.8)" stroke-width="1.5"/>`;
        } else if (brushTypeId === 'pixel') {
            // Pixel: carré
            const halfSize = displaySize / 2;
            shape = `<rect x="${center - halfSize}" y="${center - halfSize}" width="${displaySize}" height="${displaySize}" fill="${color}40" stroke="${color}" stroke-width="1.5"/>`;
        } else {
            // Autres: cercle
            shape = `<circle cx="${center}" cy="${center}" r="${displaySize/2}" fill="${color}40" stroke="${color}" stroke-width="1.5"/>`;
        }

        // Croix centrale pour la précision
        const crossSize = 6;
        const crosshair = `
            <line x1="${center - crossSize}" y1="${center}" x2="${center + crossSize}" y2="${center}" stroke="white" stroke-width="1.5" opacity="0.9"/>
            <line x1="${center}" y1="${center - crossSize}" x2="${center}" y2="${center + crossSize}" stroke="white" stroke-width="1.5" opacity="0.9"/>
            <line x1="${center - crossSize}" y1="${center}" x2="${center + crossSize}" y2="${center}" stroke="black" stroke-width="0.5" opacity="0.5"/>
            <line x1="${center}" y1="${center - crossSize}" x2="${center}" y2="${center + crossSize}" stroke="black" stroke-width="0.5" opacity="0.5"/>
        `;

        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalSize}" height="${totalSize}" viewBox="0 0 ${totalSize} ${totalSize}">${shape}${crosshair}</svg>`;

        return `url('data:image/svg+xml;utf8,${encodeURIComponent(svg)}') ${center} ${center}, crosshair`;
    };

    // 🖌️ BRUSH ENGINE PRO: Convertit hex en rgba
    const hexToRgba = (hex, alpha) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // 🖌️ BRUSH ENGINE PRO: Calcule la taille effective avec pression et vitesse
    const calculateEffectiveSize = (baseSize, pressure, velocity, brushConfig) => {
        let effectiveSize = baseSize;

        // Effet de la pression sur la taille
        if (enablePressure && brushConfig.pressureAffectsSize) {
            const sensitivity = brushConfig.pressureSensitivity * pressureSensitivity;
            const pressureFactor = Math.pow(pressure * sensitivity + (1 - sensitivity) * 0.5, 1.5);
            const sizeRange = brushConfig.maxSize - brushConfig.minSize;
            effectiveSize *= brushConfig.minSize + (sizeRange * pressureFactor);
        }

        // Effet de la vitesse sur la taille (inverse: plus rapide = plus fin)
        if (enableVelocity && brushConfig.velocityAffectsSize && velocity > 0) {
            const velocityFactor = Math.min(1, velocity * brushConfig.velocitySensitivity * velocitySensitivity);
            effectiveSize *= 1 - (velocityFactor * 0.5);
        }

        return Math.max(0.5, effectiveSize);
    };

    // 🖌️ BRUSH ENGINE PRO: Calcule l'opacité effective avec pression
    const calculateEffectiveOpacity = (baseOpacity, pressure, brushConfig) => {
        let effectiveOpacity = baseOpacity * (brushConfig.opacity || 1);

        if (enablePressure && brushConfig.pressureAffectsOpacity) {
            const sensitivity = brushConfig.pressureSensitivity * pressureSensitivity;
            effectiveOpacity *= Math.pow(pressure * sensitivity + (1 - sensitivity) * 0.5, 1.2);
        }

        return Math.max(0, Math.min(1, effectiveOpacity));
    };

    // 🎨 BRUSH ENGINE PRO: Draw brush stroke with pressure/velocity support
    const drawBrushStroke = (ctx, x, y, size, color, brushConfig, pressure = 1.0, velocity = 0) => {
        // Calcul des valeurs effectives avec pression et vitesse
        const effectiveSize = calculateEffectiveSize(size, pressure, velocity, brushConfig);
        const effectiveOpacity = calculateEffectiveOpacity(1.0, pressure, brushConfig);

        // Save context state
        ctx.save();

        // Set blend mode
        if (brushConfig.blendMode === 'multiply') {
            ctx.globalCompositeOperation = 'multiply';
        }

        // Set opacity
        ctx.globalAlpha = effectiveOpacity;
        ctx.fillStyle = color;

        // Désactiver anti-aliasing pour pixel art
        if (brushConfig.antiAlias === false) {
            ctx.imageSmoothingEnabled = false;
        }

        // PIXEL BRUSH - Perfect square
        if (brushConfig.square) {
            const pixelSize = Math.max(1, Math.floor(effectiveSize));
            ctx.fillRect(
                Math.floor(x - pixelSize / 2),
                Math.floor(y - pixelSize / 2),
                pixelSize,
                pixelSize
            );
        }
        // AIRBRUSH - Radial gradient
        else if (brushConfig.gradient) {
            const gradientRadius = effectiveSize * 2;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, gradientRadius);
            grad.addColorStop(0, color);
            grad.addColorStop(0.3, hexToRgba(color, 0.6));
            grad.addColorStop(0.6, hexToRgba(color, 0.2));
            grad.addColorStop(1, hexToRgba(color, 0));
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, gradientRadius, 0, 2 * Math.PI);
            ctx.fill();
        }
        // SOFT BRUSH - Bords doux (hardness < 1)
        else if (brushConfig.hardness !== undefined && brushConfig.hardness < 1) {
            const innerRadius = effectiveSize * brushConfig.hardness;
            const grad = ctx.createRadialGradient(x, y, innerRadius, x, y, effectiveSize);
            grad.addColorStop(0, color);
            grad.addColorStop(1, hexToRgba(color, 0));
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, effectiveSize, 0, 2 * Math.PI);
            ctx.fill();
        }
        // PENCIL/TEXTURE - Textured with grain
        else if (brushConfig.texture?.enabled) {
            const density = brushConfig.texture.density || 0.3;
            const texSize = brushConfig.texture.size || 0.8;
            const numDots = Math.max(3, Math.floor(effectiveSize * density * 4));

            for (let i = 0; i < numDots; i++) {
                const offsetX = (Math.random() - 0.5) * effectiveSize * texSize;
                const offsetY = (Math.random() - 0.5) * effectiveSize * texSize;
                const dotSize = effectiveSize * (0.3 + Math.random() * 0.4);
                ctx.globalAlpha = effectiveOpacity * (0.5 + Math.random() * 0.5);
                ctx.beginPath();
                ctx.arc(x + offsetX, y + offsetY, dotSize, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
        // G-PEN / MAPPING PEN - Hard edges (default manga ink)
        else {
            ctx.beginPath();
            ctx.arc(x, y, effectiveSize, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Restore context state
        ctx.restore();
    };

    const drawInstantPoint = (e) => {
        const layer = layers.find(l => l.id === activeLayer);
        if (layer?.locked) return;

        const activeLayerIndex = layers.findIndex(l => l.id === activeLayer);
        const layerCanvas = layersRef.current[activeLayerIndex];
        if (!layerCanvas) return;

        // 🎨 FEATURE 3: Use proper context options for color accuracy
        const ctx = layerCanvas.getContext('2d', { alpha: true });
        const rawPoint = getCanvasCoordinates(e, canvasRef.current);

        if (rawPoint.x < 0 || rawPoint.x > layerCanvas.width || rawPoint.y < 0 || rawPoint.y > layerCanvas.height) return;

        // ✨ PRECISION: Appliquer la stabilisation et initialiser le buffer
        stabilizationBufferRef.current = [rawPoint];
        const stabilizedPoint = stabilizePoint(rawPoint);
        const { x, y } = stabilizedPoint;

        // ✨ PRECISION: Initialiser le dernier point pour l'interpolation mobile
        lastPointRef.current = { x, y };

        // 🎨 AUTO-PIPETTE: Récupérer la couleur automatiquement depuis la référence (couleurs pures, sans opacité)
        let colorToUse = selectedColor;

        if (autoPipetteMode && currentTool === 'brush') {
            // TOUJOURS lire depuis referenceCanvasRef pour avoir les vraies couleurs (sans opacité appliquée)
            const canvas = canvasRef.current;
            const refCanvas = referenceCanvasRef.current;
            if (refCanvas && canvas) {
                try {
                    // 🔄 Convertir les coordonnées du canvas de dessin vers le canvas de référence (proportionnel)
                    const refX = Math.floor(x * refCanvas.width / canvas.width);
                    const refY = Math.floor(y * refCanvas.height / canvas.height);

                    // Vérifier les limites
                    if (refX >= 0 && refX < refCanvas.width && refY >= 0 && refY < refCanvas.height) {
                        const refCtx = refCanvas.getContext('2d', { willReadFrequently: true });
                        const pixel = refCtx.getImageData(refX, refY, 1, 1).data;
                        if (pixel[3] > 0) {
                            colorToUse = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1).toUpperCase()}`;
                        }
                    }
                } catch (err) {
                    console.warn('Auto-pipette reference error:', err);
                }
            }
        }

        ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';

        // 🎨 Use brush engine for drawing
        if (currentTool === 'eraser') {
            // Eraser uses simple circle
            ctx.fillStyle = colorToUse;
            ctx.beginPath();
            ctx.arc(x, y, brushSize, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            // Use brush type configuration
            const brushConfig = BRUSH_TYPES[brushType] || BRUSH_TYPES.pen;
            drawBrushStroke(ctx, x, y, brushSize, colorToUse, brushConfig);
        }

        renderLayers();
    };

    const handleTouchDraw = (e) => {
        e.preventDefault();

        if (!e.touches || e.touches.length === 0) return;
        const touch = e.touches[0];

        // 🎨 FEATURE 4: Touch pipette reads ALWAYS from reference image
        if (currentTool === 'pipette') {
            const canvas = canvasRef.current;
            const refCanvas = referenceCanvasRef.current;
            if (!canvas || !refCanvas) return;

            const rect = canvas.getBoundingClientRect();

            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const canvasX = Math.floor((touch.clientX - rect.left) * scaleX);
            const canvasY = Math.floor((touch.clientY - rect.top) * scaleY);

            if (canvasX < 0 || canvasX >= canvas.width || canvasY < 0 || canvasY >= canvas.height) return;

            // 🔄 Convertir les coordonnées du canvas de dessin vers le canvas de référence (proportionnel)
            const refX = Math.floor(canvasX * refCanvas.width / canvas.width);
            const refY = Math.floor(canvasY * refCanvas.height / canvas.height);

            // Vérifier les limites du canvas de référence
            if (refX < 0 || refX >= refCanvas.width || refY < 0 || refY >= refCanvas.height) return;

            // TOUJOURS lire depuis l'image de référence (referenceCanvasRef)
            try {
                const refCtx = refCanvas.getContext('2d', { willReadFrequently: true });
                const pixel = refCtx.getImageData(refX, refY, 1, 1).data;

                if (pixel[3] > 0) {
                    const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1).toUpperCase()}`;
                    setSelectedColor(hex);
                } else {
                    // Pixel transparent -> blanc par défaut
                    setSelectedColor('#FFFFFF');
                }
            } catch (err) {
                console.warn('Touch pipette: impossible de lire la couleur de référence:', err);
                setSelectedColor('#FFFFFF');
            }
            setCurrentTool('brush');
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

        // ✨ PRECISION: Reset interpolation et stabilization au début du trait
        lastPointRef.current = null;
        stabilizationBufferRef.current = [];

        // 🖌️ BRUSH ENGINE PRO: Reset tracking au début du trait
        lastDrawTimeRef.current = performance.now();
        lastDrawPositionRef.current = null;
        currentVelocityRef.current = 0;

        setIsDrawing(true);
        if (!isMobile) {
            draw(e);
        }
    };

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            saveToHistory();
            // ✨ PRECISION: Reset refs à la fin du trait
            lastPointRef.current = null;
            stabilizationBufferRef.current = [];
        }
    };

    const draw = (e) => {
        if (!isDrawing || isPanning || currentTool === 'pipette') return;

        const activeLayerIndex = layers.findIndex(l => l.id === activeLayer);
        const layerCanvas = layersRef.current[activeLayerIndex];
        if (!layerCanvas) return;

        // 🖌️ BRUSH ENGINE PRO: Extraire la pression (PointerEvent)
        let pressure = 1.0;
        if (e.pointerType === 'pen' && e.pressure > 0) {
            pressure = e.pressure;
        } else if (e.pressure !== undefined && e.pressure > 0) {
            pressure = e.pressure;
        }
        currentPressureRef.current = pressure;
        setCurrentPressure(pressure);

        // 🖌️ BRUSH ENGINE PRO: Calculer la vitesse
        const now = performance.now();
        const deltaTime = now - lastDrawTimeRef.current;
        let velocity = 0;

        // 🎨 FEATURE 3: Use proper context options for color accuracy
        const ctx = layerCanvas.getContext('2d', { alpha: true });
        let rawPoint = getCanvasCoordinates(e, canvasRef.current);

        if (rawPoint.x < 0 || rawPoint.x > layerCanvas.width || rawPoint.y < 0 || rawPoint.y > layerCanvas.height) return;

        // Calculer la vitesse basée sur le déplacement
        if (lastDrawPositionRef.current && deltaTime > 0) {
            const dx = rawPoint.x - lastDrawPositionRef.current.x;
            const dy = rawPoint.y - lastDrawPositionRef.current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            velocity = distance / deltaTime; // pixels/ms
        }
        currentVelocityRef.current = velocity;
        setCurrentVelocity(velocity);
        lastDrawTimeRef.current = now;
        lastDrawPositionRef.current = { x: rawPoint.x, y: rawPoint.y };

        // ✨ PRECISION: Appliquer la stabilisation si activée
        const stabilizedPoint = stabilizePoint(rawPoint);
        const { x, y } = stabilizedPoint;

        // 🎮 CHEAT MODE & AUTO-PIPETTE: Auto-pick couleur depuis référence
        let colorToUse = selectedColor;
        let brushSizeToUse = brushSize;

        // Fonction helper pour récupérer la couleur d'une position (TOUJOURS depuis la référence pour couleurs pures)
        const getColorAtPosition = (posX, posY) => {
            let color = selectedColor;

            // TOUJOURS lire depuis referenceCanvasRef pour avoir les vraies couleurs (sans opacité appliquée)
            const canvas = canvasRef.current;
            const refCanvas = referenceCanvasRef.current;
            if (refCanvas && canvas) {
                try {
                    // 🔄 Convertir les coordonnées du canvas de dessin vers le canvas de référence (proportionnel)
                    const refX = Math.floor(posX * refCanvas.width / canvas.width);
                    const refY = Math.floor(posY * refCanvas.height / canvas.height);

                    // Vérifier les limites
                    if (refX >= 0 && refX < refCanvas.width && refY >= 0 && refY < refCanvas.height) {
                        const refCtx = refCanvas.getContext('2d', { willReadFrequently: true });
                        const pixel = refCtx.getImageData(refX, refY, 1, 1).data;
                        if (pixel[3] > 0) {
                            color = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1).toUpperCase()}`;
                        }
                    }
                } catch (err) { /* ignore */ }
            }

            return color;
        };

        // Auto-pipette mode ou cheat mode actif
        if ((autoPipetteMode || cheatModeActive) && currentTool === 'brush') {
            if (cheatModeActive) {
                brushSizeToUse = Math.min(brushSize, 3);
            }
            colorToUse = getColorAtPosition(x, y);
        }

        ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';

        // ✨ PRECISION: Calculer l'espacement pour l'interpolation (basé sur la taille du pinceau)
        const spacing = Math.max(1, brushSizeToUse * 0.3); // Espacement = 30% de la taille

        // ✨ PRECISION: Interpolation entre le dernier point et le point actuel
        const currentPoint = { x, y };
        let pointsToDraw = [currentPoint];

        if (lastPointRef.current) {
            pointsToDraw = interpolatePoints(lastPointRef.current, currentPoint, spacing);
        }

        // Dessiner tous les points interpolés
        const brushConfig = BRUSH_TYPES[brushType] || BRUSH_TYPES.pen;

        pointsToDraw.forEach(point => {
            // En mode auto-pipette/cheat, récupérer la couleur pour chaque point interpolé
            let pointColor = colorToUse;
            if ((autoPipetteMode || cheatModeActive) && currentTool === 'brush') {
                pointColor = getColorAtPosition(point.x, point.y);
            }

            if (currentTool === 'eraser') {
                ctx.fillStyle = pointColor;
                ctx.beginPath();
                ctx.arc(point.x, point.y, brushSizeToUse, 0, 2 * Math.PI);
                ctx.fill();
            } else {
                // 🖌️ BRUSH ENGINE PRO: Passer pression et vitesse
                drawBrushStroke(ctx, point.x, point.y, brushSizeToUse, pointColor, brushConfig, pressure, velocity);
            }
        });

        // ✨ PRECISION: Sauvegarder le dernier point pour l'interpolation
        lastPointRef.current = currentPoint;

        renderLayers();
    };

    // 🎨 FEATURE 4: Pipette reads ALWAYS from reference image, regardless of overlay state
    const pickColorFromCanvas = (e) => {
        const canvas = canvasRef.current;
        const refCanvas = referenceCanvasRef.current;
        if (!canvas || !refCanvas) {
            setSelectedColor('#FFFFFF');
            setCurrentTool('brush');
            return;
        }

        const { x, y } = getCanvasCoordinates(e, canvas);
        const canvasX = Math.floor(x);
        const canvasY = Math.floor(y);

        // 🔄 Convertir les coordonnées du canvas de dessin vers le canvas de référence (proportionnel)
        const refX = Math.floor(canvasX * refCanvas.width / canvas.width);
        const refY = Math.floor(canvasY * refCanvas.height / canvas.height);

        // Vérifier les limites du canvas de référence
        if (refX < 0 || refX >= refCanvas.width || refY < 0 || refY >= refCanvas.height) {
            setSelectedColor('#FFFFFF');
            setCurrentTool('brush');
            return;
        }

        // TOUJOURS lire depuis l'image de référence (referenceCanvasRef)
        try {
            const refCtx = refCanvas.getContext('2d', { willReadFrequently: true });
            const pixel = refCtx.getImageData(refX, refY, 1, 1).data;

            // Si le pixel n'est pas transparent, utiliser sa couleur
            if (pixel[3] > 0) {
                const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1).toUpperCase()}`;
                setSelectedColor(hex);
            } else {
                // Pixel transparent -> blanc par défaut
                setSelectedColor('#FFFFFF');
            }
        } catch (err) {
            console.warn('Pipette: impossible de lire la couleur de référence:', err);
            setSelectedColor('#FFFFFF');
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
        console.log('🔍 DEBUG SAVE - Start');

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
        // Vérifier si la molette est utilisée sur le canvas ou l'overlay
        const isOnCanvas = e.target === canvasRef.current ||
                          e.target === overlayCanvasRef.current;

        if (isOnCanvas) {
            // Si sur le canvas, empêcher le scroll et zoomer
            e.preventDefault();
            const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
            handleZoom(delta);
        }
        // Si pas sur le canvas, laisser le scroll normal fonctionner
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
                        <div className="flex items-center gap-3 py-3">
                            <img
                                src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760821994/DrasBeru_zd8ju5.png"
                                alt="DrawBeru logo"
                                className="w-8 h-8 select-none"
                            />
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-bold">DrawBeru</h1>
                                <p className="text-xs text-purple-200">{currentModelData.name}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-white text-2xl p-2"
                        >
                            ☰
                        </button>
                    </div>
                </div>

                {/* 🎨 CANVAS DE RÉFÉRENCE CACHÉ POUR PIPETTE MOBILE */}
                <canvas
                    ref={referenceCanvasRef}
                    style={{ display: 'none' }}
                />

                {/* 🎨 AUTO-PIPETTE NOTIFICATION MOBILE */}
                {autoPipetteMode && (
                    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-[9998]">
                        <div className="bg-gradient-to-r from-green-500/90 to-emerald-600/90 text-white px-4 py-2 rounded-full shadow-lg border border-green-400/50 backdrop-blur-sm">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <span>🎯</span>
                                <span>Auto-Pipette ON</span>
                            </div>
                        </div>
                    </div>
                )}

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

                            {/* 🎨 FEATURE 1: BRUSH TYPE SELECTOR MOBILE */}
                            <div className="mb-4">
                                <h3 className="text-white text-sm font-semibold mb-2">🖌️ Type de pinceau</h3>
                                <div className="grid grid-cols-5 gap-2">
                                    {Object.values(BRUSH_TYPES).map((brush) => (
                                        <button
                                            key={brush.id}
                                            onClick={() => {
                                                setBrushType(brush.id);
                                            }}
                                            className={`h-12 rounded-lg flex flex-col items-center justify-center transition-all ${
                                                brushType === brush.id
                                                    ? 'bg-purple-600 ring-2 ring-purple-400'
                                                    : 'bg-purple-800/50'
                                            }`}
                                        >
                                            <span className="text-lg">{brush.icon}</span>
                                            <span className="text-[9px] text-white/80">{brush.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 🔢 FEATURE 2: BRUSH SIZE with +/- */}
                            <div className="mb-4">
                                <label className="text-white text-sm mb-2 block">
                                    Taille pinceau: {brushSize.toFixed(1)}px
                                </label>
                                <div className="flex items-center gap-2 mb-2">
                                    <button
                                        onClick={decrementBrushSize}
                                        onTouchStart={() => startBrushSizeRepeat(false)}
                                        onTouchEnd={stopBrushSizeRepeat}
                                        className="w-12 h-10 rounded bg-purple-700/50 active:bg-purple-600/50 text-white font-bold text-xl"
                                    >
                                        −
                                    </button>
                                    <span className="text-purple-300 font-mono font-bold flex-1 text-center">
                                        {brushSize.toFixed(1)}px
                                    </span>
                                    <button
                                        onClick={incrementBrushSize}
                                        onTouchStart={() => startBrushSizeRepeat(true)}
                                        onTouchEnd={stopBrushSizeRepeat}
                                        className="w-12 h-10 rounded bg-purple-700/50 active:bg-purple-600/50 text-white font-bold text-xl"
                                    >
                                        +
                                    </button>
                                </div>
                                <input
                                    type="range"
                                    min={0.1}
                                    max={50}
                                    step={0.1}
                                    value={brushSize}
                                    onChange={(e) => setBrushSize(parseFloat(e.target.value))}
                                    className="w-full"
                                />
                            </div>

                            {/* ✨ PRECISION: Stabilisation Mobile */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-white text-sm flex items-center gap-2">
                                        🎯 Stabilisation
                                    </label>
                                    <span className="text-purple-300 text-sm font-mono">
                                        {stabilization === 0 ? 'OFF' : stabilization}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={10}
                                    step={1}
                                    value={stabilization}
                                    onChange={(e) => setStabilization(parseInt(e.target.value))}
                                    className="w-full"
                                />
                                <p className="text-purple-300/70 text-xs mt-1">
                                    Lisse le trait pour plus de précision
                                </p>
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
                                        downloadColoredPNG();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm"
                                >
                                    🖼️ PNG Coloré
                                </button>
                                <button
                                    onClick={() => {
                                        downloadTransparentPNG();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full bg-pink-600 text-white py-2 rounded-lg text-sm"
                                >
                                    🎨 PNG Transparent
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
                                onClick={() =>
                                    setInteractionMode(interactionMode === 'draw' ? 'pan' : 'draw')
                                }
                                className="w-10 h-10 rounded-lg shadow-md transition-all active:scale-95 backdrop-blur-sm border"
                                style={{
                                    backgroundImage:
                                        interactionMode === 'draw'
                                            ? "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760823190/Pinceau_cwjaxh.png')" // pinceau
                                            : "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760824762/Deplace_v5rkuq.png')", // ✋ en PNG
                                    backgroundSize: "100% 100%",   // prend toute la largeur et hauteur
                                    backgroundPosition: "center",
                                    backgroundRepeat: "no-repeat",
                                    backgroundColor:
                                        interactionMode === 'draw'
                                            ? "rgba(22,163,74,0.4)"   // vert si draw
                                            : "rgba(37,99,235,0.4)",  // bleu si pan
                                    borderColor:
                                        interactionMode === 'draw'
                                            ? "rgba(74,222,128,0.2)"
                                            : "rgba(147,197,253,0.2)"
                                }}
                                aria-label={interactionMode === 'draw' ? 'Pinceau' : 'Main'}
                            />

                            <button
                                onClick={() => setShowModelOverlay(!showModelOverlay)}
                                className="w-10 h-10 rounded-lg shadow-md transition-all active:scale-95 backdrop-blur-sm border"
                                style={{
                                    backgroundImage: showModelOverlay
                                        ? "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754055045/sungicon_bfndrc.png')"   // 👁️
                                        : "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760826182/hide_te5av9.png')", // 🙈
                                    backgroundSize: "100% 100%",
                                    backgroundPosition: "center",
                                    backgroundRepeat: "no-repeat",
                                    backgroundColor: showModelOverlay
                                        ? "rgba(147,51,234,0.4)"   // violet si actif
                                        : "rgba(55,65,81,0.4)",    // gris si inactif
                                    borderColor: showModelOverlay
                                        ? "rgba(216,180,254,0.2)"
                                        : "rgba(156,163,175,0.2)"
                                }}
                                aria-label={showModelOverlay ? "Cacher le modèle" : "Afficher le modèle"}
                            />
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

                        {/* 🔢 FEATURE 2: Mobile brush size with +/- buttons */}
                        {(currentTool === 'brush' || currentTool === 'eraser') && (
                            <div className="flex-1 bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1.5 shadow-md border border-purple-500/20">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="flex items-center justify-center w-6 h-6 rounded bg-purple-600/50 text-sm shrink-0 bg-center bg-no-repeat bg-contain"
                                        style={{
                                            backgroundImage:
                                                currentTool === 'brush'
                                                    ? "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760823190/Pinceau_cwjaxh.png')"
                                                    : "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760827288/pipette_kqqmzh.png')"
                                        }}
                                    />

                                    {/* 🔢 Boutons +/- mobile */}
                                    <button
                                        onClick={decrementBrushSize}
                                        onTouchStart={() => startBrushSizeRepeat(false)}
                                        onTouchEnd={stopBrushSizeRepeat}
                                        className="w-8 h-8 rounded bg-purple-700/50 active:bg-purple-600/50 text-white font-bold text-lg flex items-center justify-center shrink-0"
                                    >
                                        −
                                    </button>
                                    <span className="text-purple-300 text-[10px] font-mono font-bold min-w-[38px] text-center">
                                        {brushSize.toFixed(1)}px
                                    </span>
                                    <button
                                        onClick={incrementBrushSize}
                                        onTouchStart={() => startBrushSizeRepeat(true)}
                                        onTouchEnd={stopBrushSizeRepeat}
                                        className="w-8 h-8 rounded bg-purple-700/50 active:bg-purple-600/50 text-white font-bold text-lg flex items-center justify-center shrink-0"
                                    >
                                        +
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="50"
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
                                                borderRadius: brushType === 'pixel' ? '0' : '50%',
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
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={() => setCurrentTool('brush')}
                            className={`w-12 h-12 rounded-lg shadow-md transition-all bg-center bg-no-repeat bg-contain ${currentTool === 'brush'
                                ? 'bg-purple-600 scale-105'
                                : 'bg-purple-800/50'
                                }`}
                            style={{
                                backgroundImage:
                                    "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760823190/Pinceau_cwjaxh.png')"
                            }}
                            aria-label="Pinceau"
                        />

                        <button
                            onClick={() => setCurrentTool('eraser')}
                            className={`w-12 h-12 rounded-lg shadow-md transition-all bg-center bg-no-repeat bg-contain ${currentTool === 'eraser'
                                ? 'bg-purple-600 scale-105'
                                : 'bg-purple-800/50'
                                }`}
                            style={{
                                backgroundImage:
                                    "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760827288/pipette_kqqmzh.png')"
                            }}
                            aria-label="Gomme"
                        />
                        <button
                            onClick={() => setCurrentTool('pipette')}
                            className={`w-12 h-12 rounded-lg shadow-md transition-all bg-center bg-no-repeat bg-contain ${currentTool === 'pipette'
                                ? 'bg-purple-600 scale-105'
                                : 'bg-purple-800/50'
                                }`}
                            style={{
                                backgroundImage:
                                    "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760827432/pipettevrai_vxsysi.png')"
                            }}
                            aria-label="Pipette"
                        />
                        {/* 🎨 AUTO-PIPETTE TOGGLE MOBILE */}
                        <button
                            onClick={() => setAutoPipetteMode(!autoPipetteMode)}
                            className={`w-12 h-12 rounded-lg shadow-md transition-all flex items-center justify-center relative ${autoPipetteMode
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600 scale-105 ring-2 ring-green-400/50'
                                : 'bg-purple-800/50'
                            }`}
                            aria-label={autoPipetteMode ? "Auto-Pipette activé" : "Auto-Pipette désactivé"}
                        >
                            <span className="text-xl">🎯</span>
                            {autoPipetteMode && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                            )}
                        </button>
                        <button
                            onClick={() => handleZoom(0.25)}
                            className="w-12 h-12 rounded-lg shadow-md transition-all bg-center bg-no-repeat bg-contain bg-purple-800/50 text-purple-200"
                            style={{
                                backgroundImage:
                                    "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760827803/zoomgrow_hzuucr.png')"
                            }}
                            aria-label="Zoom +"
                        />
                        <button
                            onClick={resetView}
                            className="w-12 h-12 rounded-lg shadow-md transition-all bg-purple-700/50 text-white text-xs font-bold"
                            aria-label="Reset zoom"
                        >
                            ⊙
                        </button>
                        <button
                            onClick={() => handleZoom(-0.25)}
                            className="w-12 h-12 rounded-lg shadow-md transition-all bg-center bg-no-repeat bg-contain bg-purple-800/50 text-purple-200"
                            style={{
                                backgroundImage:
                                    "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760827864/zoomreduce_lmj2sp.png')"
                            }}
                            aria-label="Zoom -"
                        />
                    </div>
                </div>
            </div>
        );
    }

    // RENDER DESKTOP
    return (
        <div className="min-h-screen bg-[#0a0118]">
            {/* 🎮 CHEAT MODE NOTIFICATION */}
            {cheatModeActive && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[10000] animate-pulse">
                    <div className="bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 text-white px-8 py-4 rounded-full shadow-2xl border-4 border-white/50">
                        <div className="text-center">
                            <div className="text-2xl font-bold mb-1">🎮 CHEAT MODE ACTIVÉ ! 🎨</div>
                            <div className="text-sm opacity-90">Coloriage parfait automatique ⚡</div>
                            <div className="text-3xl font-bold mt-2">{cheatTimeRemaining}s</div>
                        </div>
                    </div>
                </div>
            )}

            {/* 🎨 AUTO-PIPETTE NOTIFICATION DESKTOP */}
            {autoPipetteMode && !cheatModeActive && (
                <div className="fixed top-4 right-4 z-[10000]">
                    <div className="bg-gradient-to-r from-green-500/95 to-emerald-600/95 text-white px-5 py-3 rounded-xl shadow-xl border border-green-400/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🎯</span>
                            <div>
                                <div className="font-bold text-sm">Auto-Pipette ACTIVÉ</div>
                                <div className="text-xs opacity-90">Colorie avec les couleurs du modèle</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                        <div className="flex items-center gap-3 py-3">
                            <img
                                src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760821994/DrasBeru_zd8ju5.png"
                                alt="DrawBeru logo"
                                className="w-8 h-8 select-none"
                            />
                            <h1 className="text-2xl font-bold">DrawBeru</h1>

                        </div>
                        <p className="text-purple-200">Colorie {currentModelData.name}</p>
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
                    {/* CENTER - CANVAS */}
                    <div className="lg:col-span-3">
                        <div className="bg-black/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4">
                            <h3 className="text-white font-semibold mb-4">
                                ✏️ Zone de coloriage - {currentModelData.name}
                            </h3>

                            {/* CONTROLS BAR - Style Mobile */}
                            <div className="mb-4 flex flex-wrap items-center gap-3 bg-black/40 backdrop-blur-sm rounded-xl p-3 border border-purple-500/20">
                                {/* Afficher/Masquer Calque */}
                                <button
                                    onClick={() => setShowModelOverlay(!showModelOverlay)}
                                    className="w-12 h-12 rounded-lg shadow-md transition-all active:scale-95 backdrop-blur-sm border"
                                    style={{
                                        backgroundImage: showModelOverlay
                                            ? "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1754055045/sungicon_bfndrc.png')"
                                            : "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760826182/hide_te5av9.png')",
                                        backgroundSize: "100% 100%",
                                        backgroundPosition: "center",
                                        backgroundRepeat: "no-repeat",
                                        backgroundColor: showModelOverlay
                                            ? "rgba(147,51,234,0.4)"
                                            : "rgba(55,65,81,0.4)",
                                        borderColor: showModelOverlay
                                            ? "rgba(216,180,254,0.2)"
                                            : "rgba(156,163,175,0.2)"
                                    }}
                                    title={showModelOverlay ? "Masquer Calque" : "Afficher Calque"}
                                />

                                {/* Barre d'opacité */}
                                {showModelOverlay && (
                                    <div className="flex-1 bg-black/60 backdrop-blur-md rounded-lg p-2 shadow-lg border border-purple-500/30 min-w-[200px] max-w-[300px]">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-white text-xs font-semibold">Opacité Calque</span>
                                            <span className="text-purple-300 text-xs font-mono">{Math.round(modelOverlayOpacity * 100)}%</span>
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

                                {/* Separator */}
                                <div className="w-px h-10 bg-purple-500/30"></div>

                                {/* Undo/Redo */}
                                <button
                                    onClick={undo}
                                    disabled={!canUndo}
                                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl shadow-md transition-all active:scale-95 backdrop-blur-sm border ${canUndo
                                        ? 'bg-blue-600/40 hover:bg-blue-600/60 text-white border-blue-400/20'
                                        : 'bg-gray-600/30 text-gray-400 border-gray-500/15 cursor-not-allowed'
                                    }`}
                                    title="Annuler (Ctrl+Z)"
                                >
                                    ↶
                                </button>
                                <button
                                    onClick={redo}
                                    disabled={!canRedo}
                                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl shadow-md transition-all active:scale-95 backdrop-blur-sm border ${canRedo
                                        ? 'bg-blue-600/40 hover:bg-blue-600/60 text-white border-blue-400/20'
                                        : 'bg-gray-600/30 text-gray-400 border-gray-500/15 cursor-not-allowed'
                                    }`}
                                    title="Refaire (Ctrl+Y)"
                                >
                                    ↷
                                </button>

                                {/* Separator */}
                                <div className="w-px h-10 bg-purple-500/30"></div>

                                {/* Outils - Pinceau, Gomme, Pipette */}
                                <button
                                    onClick={() => setCurrentTool('brush')}
                                    className={`w-12 h-12 rounded-lg shadow-md transition-all active:scale-95 ${currentTool === 'brush'
                                        ? 'bg-purple-600 scale-105'
                                        : 'bg-purple-800/50'
                                    }`}
                                    style={{
                                        backgroundImage: "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760823190/Pinceau_cwjaxh.png')",
                                        backgroundSize: "contain",
                                        backgroundPosition: "center",
                                        backgroundRepeat: "no-repeat"
                                    }}
                                    title="Pinceau (B)"
                                />

                                <button
                                    onClick={() => setCurrentTool('eraser')}
                                    className={`w-12 h-12 rounded-lg shadow-md transition-all active:scale-95 ${currentTool === 'eraser'
                                        ? 'bg-purple-600 scale-105'
                                        : 'bg-purple-800/50'
                                    }`}
                                    style={{
                                        backgroundImage: "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760827288/pipette_kqqmzh.png')",
                                        backgroundSize: "contain",
                                        backgroundPosition: "center",
                                        backgroundRepeat: "no-repeat"
                                    }}
                                    title="Gomme (E)"
                                />

                                <button
                                    onClick={() => setCurrentTool('pipette')}
                                    className={`w-12 h-12 rounded-lg shadow-md transition-all active:scale-95 ${currentTool === 'pipette'
                                        ? 'bg-purple-600 scale-105'
                                        : 'bg-purple-800/50'
                                    }`}
                                    style={{
                                        backgroundImage: "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760827432/pipettevrai_vxsysi.png')",
                                        backgroundSize: "contain",
                                        backgroundPosition: "center",
                                        backgroundRepeat: "no-repeat"
                                    }}
                                    title="Pipette (I)"
                                />

                                {/* 🎨 FEATURE 1: Brush Type Selector */}
                                {currentTool === 'brush' && (
                                    <div className="flex items-center gap-1 bg-black/40 rounded-lg p-1 border border-purple-500/20">
                                        {Object.values(BRUSH_TYPES).map((brush) => (
                                            <button
                                                key={brush.id}
                                                onClick={() => setBrushType(brush.id)}
                                                className={`w-9 h-9 rounded-md flex items-center justify-center text-lg transition-all ${
                                                    brushType === brush.id
                                                        ? 'bg-purple-600 scale-105 ring-2 ring-purple-400/50'
                                                        : 'bg-purple-800/30 hover:bg-purple-700/40'
                                                }`}
                                                title={`${brush.name} - ${brush.description}`}
                                            >
                                                {brush.icon}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* 🎨 AUTO-PIPETTE TOGGLE */}
                                <button
                                    onClick={() => setAutoPipetteMode(!autoPipetteMode)}
                                    className={`w-12 h-12 rounded-lg shadow-md transition-all active:scale-95 flex items-center justify-center relative ${autoPipetteMode
                                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 scale-105 ring-2 ring-green-400/50'
                                        : 'bg-purple-800/50 hover:bg-purple-700/50'
                                    }`}
                                    title={autoPipetteMode ? "Auto-Pipette ACTIVÉ - Colorie avec les couleurs du modèle" : "Auto-Pipette - Cliquez pour activer"}
                                >
                                    <span className="text-xl">🎯</span>
                                    {autoPipetteMode && (
                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                                    )}
                                </button>

                                {/* Separator */}
                                <div className="w-px h-10 bg-purple-500/30"></div>

                                {/* Zoom Controls */}
                                <button
                                    onClick={() => handleZoom(0.25)}
                                    className="w-12 h-12 rounded-lg shadow-md transition-all active:scale-95 bg-purple-800/50 hover:bg-purple-700/50"
                                    style={{
                                        backgroundImage: "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760827803/zoomgrow_hzuucr.png')",
                                        backgroundSize: "contain",
                                        backgroundPosition: "center",
                                        backgroundRepeat: "no-repeat"
                                    }}
                                    title="Zoom +"
                                />

                                <button
                                    onClick={resetView}
                                    className="w-12 h-12 rounded-lg shadow-md transition-all active:scale-95 bg-purple-700/50 hover:bg-purple-600/50 text-white text-xs font-bold flex items-center justify-center"
                                    title="Recadrer"
                                >
                                    ⊙
                                </button>

                                <button
                                    onClick={() => handleZoom(-0.25)}
                                    className="w-12 h-12 rounded-lg shadow-md transition-all active:scale-95 bg-purple-800/50 hover:bg-purple-700/50"
                                    style={{
                                        backgroundImage: "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760827864/zoomreduce_lmj2sp.png')",
                                        backgroundSize: "contain",
                                        backgroundPosition: "center",
                                        backgroundRepeat: "no-repeat"
                                    }}
                                    title="Zoom -"
                                />

                                {/* Separator */}
                                <div className="w-px h-10 bg-purple-500/30"></div>

                                {/* Couleur actuelle */}
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-12 h-12 rounded-lg border-2 border-white shadow-lg cursor-pointer"
                                        style={{ backgroundColor: selectedColor }}
                                        title={`Couleur actuelle: ${selectedColor}`}
                                    />
                                </div>

                                {/* Palette de couleurs */}
                                <div className="flex items-center gap-1.5">
                                    {Object.entries(currentModelData.palette).slice(0, 6).map(([id, color]) => (
                                        <button
                                            key={id}
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-8 h-8 rounded-lg border-2 transition-all ${selectedColor === color
                                                ? 'border-white scale-110'
                                                : 'border-purple-500/50 hover:border-purple-300/70'
                                            }`}
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        />
                                    ))}
                                    <input
                                        type="color"
                                        value={selectedColor}
                                        onChange={(e) => setSelectedColor(e.target.value)}
                                        className="w-8 h-8 rounded-lg border-2 border-purple-500/50 cursor-pointer"
                                        title="Choisir une couleur personnalisée"
                                    />
                                </div>

                                {/* 🔢 FEATURE 2: Taille du pinceau avec boutons +/- */}
                                {(currentTool === 'brush' || currentTool === 'eraser') && (
                                    <>
                                        <div className="w-px h-10 bg-purple-500/30"></div>
                                        <div className="flex-1 bg-black/60 backdrop-blur-md rounded-lg p-2 shadow-lg border border-purple-500/30 min-w-[280px] max-w-[350px]">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-6 h-6 rounded bg-purple-600/50 shrink-0"
                                                    style={{
                                                        backgroundImage: currentTool === 'brush'
                                                            ? "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760823190/Pinceau_cwjaxh.png')"
                                                            : "url('https://res.cloudinary.com/dbg7m8qjd/image/upload/v1760827288/pipette_kqqmzh.png')",
                                                        backgroundSize: "contain",
                                                        backgroundPosition: "center",
                                                        backgroundRepeat: "no-repeat"
                                                    }}
                                                />
                                                {/* 🔢 Boutons +/- avec valeur */}
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={decrementBrushSize}
                                                        onMouseDown={() => startBrushSizeRepeat(false)}
                                                        onMouseUp={stopBrushSizeRepeat}
                                                        onMouseLeave={stopBrushSizeRepeat}
                                                        className="w-7 h-7 rounded bg-purple-700/50 hover:bg-purple-600/50 text-white font-bold text-lg flex items-center justify-center transition-all active:scale-95"
                                                        title="Réduire taille (touche [)"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="text-purple-300 text-xs font-mono font-bold min-w-[45px] text-center">
                                                        {brushSize.toFixed(1)}px
                                                    </span>
                                                    <button
                                                        onClick={incrementBrushSize}
                                                        onMouseDown={() => startBrushSizeRepeat(true)}
                                                        onMouseUp={stopBrushSizeRepeat}
                                                        onMouseLeave={stopBrushSizeRepeat}
                                                        className="w-7 h-7 rounded bg-purple-700/50 hover:bg-purple-600/50 text-white font-bold text-lg flex items-center justify-center transition-all active:scale-95"
                                                        title="Augmenter taille (touche ])"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="range"
                                                        min="0.1"
                                                        max="50"
                                                        step="0.1"
                                                        value={brushSize}
                                                        onChange={(e) => setBrushSize(parseFloat(e.target.value))}
                                                        className="w-full h-1 bg-purple-900/30 rounded-lg appearance-none cursor-pointer"
                                                    />
                                                </div>
                                                <div className="w-8 h-8 bg-white/5 rounded border border-purple-500/20 shrink-0 flex items-center justify-center">
                                                    <div
                                                        style={{
                                                            width: `${Math.min(brushSize * 1.5, 24)}px`,
                                                            height: `${Math.min(brushSize * 1.5, 24)}px`,
                                                            borderRadius: brushType === 'pixel' ? '0' : '50%',
                                                            backgroundColor: currentTool === 'brush' ? selectedColor : '#ff6b6b',
                                                            border: '1px solid rgba(255,255,255,0.2)',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* ✨ PRECISION: Contrôle de stabilisation */}
                                {(currentTool === 'brush' || currentTool === 'eraser') && (
                                    <>
                                        <div className="w-px h-10 bg-purple-500/30"></div>
                                        <div className="bg-black/60 backdrop-blur-md rounded-lg p-2 shadow-lg border border-purple-500/30 min-w-[140px]">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg" title="Stabilisation du trait">🎯</span>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-white text-[10px] font-semibold">Stabilisation</span>
                                                        <span className="text-purple-300 text-[10px] font-mono">
                                                            {stabilization === 0 ? 'OFF' : stabilization}
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="10"
                                                        step="1"
                                                        value={stabilization}
                                                        onChange={(e) => setStabilization(parseInt(e.target.value))}
                                                        className="w-full h-1 bg-purple-900/30 rounded-lg appearance-none cursor-pointer"
                                                        title="0 = OFF, 10 = Maximum (trait très lissé)"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* 🖌️ BRUSH ENGINE PRO: Contrôles de pression et vitesse */}
                                {(currentTool === 'brush') && (
                                    <>
                                        <div className="w-px h-10 bg-purple-500/30"></div>
                                        <div className="bg-black/60 backdrop-blur-md rounded-lg p-2 shadow-lg border border-purple-500/30 min-w-[200px]">
                                            <div className="flex items-center gap-3">
                                                {/* Indicateur de pression en temps réel */}
                                                <div className="flex flex-col items-center">
                                                    <div
                                                        className="w-4 h-10 bg-purple-900/30 rounded-full overflow-hidden relative"
                                                        title={`Pression: ${Math.round(currentPressure * 100)}%`}
                                                    >
                                                        <div
                                                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-500 to-purple-300 transition-all duration-75"
                                                            style={{ height: `${currentPressure * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[8px] text-purple-300 mt-1">P</span>
                                                </div>

                                                <div className="flex-1 space-y-2">
                                                    {/* Toggle Pression */}
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setEnablePressure(!enablePressure)}
                                                            className={`w-6 h-6 rounded flex items-center justify-center text-xs transition-all ${
                                                                enablePressure
                                                                    ? 'bg-purple-600 text-white'
                                                                    : 'bg-purple-900/30 text-purple-400'
                                                            }`}
                                                            title={enablePressure ? "Pression activée" : "Pression désactivée"}
                                                        >
                                                            ✍️
                                                        </button>
                                                        <div className="flex-1">
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="1"
                                                                step="0.05"
                                                                value={pressureSensitivity}
                                                                onChange={(e) => setPressureSensitivity(parseFloat(e.target.value))}
                                                                disabled={!enablePressure}
                                                                className="w-full h-1 bg-purple-900/30 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                                                                title="Sensibilité à la pression"
                                                            />
                                                        </div>
                                                        <span className="text-[10px] text-purple-300 w-8">{Math.round(pressureSensitivity * 100)}%</span>
                                                    </div>

                                                    {/* Toggle Vitesse */}
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setEnableVelocity(!enableVelocity)}
                                                            className={`w-6 h-6 rounded flex items-center justify-center text-xs transition-all ${
                                                                enableVelocity
                                                                    ? 'bg-purple-600 text-white'
                                                                    : 'bg-purple-900/30 text-purple-400'
                                                            }`}
                                                            title={enableVelocity ? "Vitesse activée" : "Vitesse désactivée"}
                                                        >
                                                            💨
                                                        </button>
                                                        <div className="flex-1">
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="1"
                                                                step="0.05"
                                                                value={velocitySensitivity}
                                                                onChange={(e) => setVelocitySensitivity(parseFloat(e.target.value))}
                                                                disabled={!enableVelocity}
                                                                className="w-full h-1 bg-purple-900/30 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                                                                title="Sensibilité à la vitesse"
                                                            />
                                                        </div>
                                                        <span className="text-[10px] text-purple-300 w-8">{Math.round(velocitySensitivity * 100)}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

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
                                            cursor: isPanning
                                                ? 'move'
                                                : currentTool === 'pipette'
                                                    ? 'crosshair'
                                                    : generateDynamicCursor(brushSize, selectedColor, currentTool, brushType),
                                            touchAction: 'none' // Important pour PointerEvents
                                        }}
                                        // 🖌️ BRUSH ENGINE PRO: PointerEvents pour support tablette graphique
                                        onPointerDown={startDrawing}
                                        onPointerMove={(e) => {
                                            draw(e);
                                            // ✨ PRECISION: Update cursor position for preview
                                            const rect = canvasRef.current?.getBoundingClientRect();
                                            if (rect) {
                                                setCursorPosition({
                                                    x: e.clientX - rect.left,
                                                    y: e.clientY - rect.top,
                                                    visible: true
                                                });
                                            }
                                        }}
                                        onPointerUp={stopDrawing}
                                        onPointerLeave={() => {
                                            stopDrawing();
                                            setCursorPosition(prev => ({ ...prev, visible: false }));
                                        }}
                                        onPointerCancel={stopDrawing}
                                    />

                                    {/* Overlay canvas for model reference with opacity */}
                                    {showModelOverlay && (
                                        <canvas
                                            ref={overlayCanvasRef}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                pointerEvents: 'none',
                                                opacity: modelOverlayOpacity
                                            }}
                                        />
                                    )}
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
                        <div
                            className="bg-black/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4"
                            style={{ display: showReference ? 'block' : 'none' }}
                        >
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DrawBeruFixed;