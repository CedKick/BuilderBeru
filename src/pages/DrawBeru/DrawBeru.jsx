// src/pages/DrawBeru/DrawBeru.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const drawBeruModels = {
    ilhwan: {
        name: "Ilhwan",
        models: {
            default: {
                id: "default",
                name: "Ilhwan Classique",
                reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1759920073/ilhwan_orig_fm4l2o.png",
                template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1759920073/ilhwan_uncoloried_uzywyu.png",
                canvasSize: { width: 450, height: 675 },
                palette: {
                    "1": "#F5DEB3", "2": "#2F2F2F", "3": "#8B4513", "4": "#DC143C",
                    "5": "#FFFFFF", "6": "#000000", "7": "#FFD700", "8": "#4B0082"
                }
            }
        }
    },
    Yuqi: {
        name: "Yuqi",
        models: {
            default: {
                id: "default",
                name: "Yuqi Classique",
                reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1759927874/yuki_origi_m4l9h6.png",
                template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1759927873/yuki_uncoloried_nyhkmc.png",
                canvasSize: { width: 300, height: 450 },
                palette: {
                    "1": "#3c3331", "2": "#fdd8b8", "3": "#1c1718", "4": "#c48e6d",
                    "5": "#070402", "6": "#2d2d39", "7": "#645249", "8": "#f7f1e6"
                }
            }
        }
    },
    Minnie: {
        name: "Minnie",
        models: {
            default: {
                id: "default",
                name: "Minnie Classique",
                reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1759937740/Minnie_origi_afqdqa.png",
                template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1759937740/Minnie_uncoloried_b5otkl.png",
                canvasSize: { width: 300, height: 450 },
                palette: {
                    "1": "#3c3331",
                    "2": "#fdd8b8",
                    "3": "#1c1718",
                    "4": "#c48e6d",
                    "5": "#070402",
                    "6": "#2d2d39",
                    "7": "#645249",
                    "8": "#f7f1e6"
                }
            }
        }
    },
    Kanae: {
        name: "Kanae",
        models: {
            default: {
                id: "default",
                name: "Kanae What",
                reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1759942372/kanaeWha_origi_rpqlgt.png",
                template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1759942371/kanaeWhat_uncoloried_qd0yb0.png",
                canvasSize: { width: 1024, height: 1536 },
                palette: {
                    "1": "#f9dcbf",
                    "2": "#2d2928",
                    "3": "#0c0d0b",
                    "4": "#d79780",
                    "5": "#fbfaf7",
                    "6": "#9f3a47",
                    "7": "#6b5a5c",
                    "8": "#3c3638"
                }
            }
        }
    },
    Seorin: {
        name: "Seorin",
        models: {
            default: {
                id: "default",
                name: "Seorin pyjama",
                reference: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1759944005/seorin_origi_cnjynr.png",
                template: "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1759944005/seorin_uncoloried_ymcwro.png",
                canvasSize: { width: 408, height: 612 },
                palette: {
                    "1": "#9e948f",
                    "2": "#161112", 
                    "3": "#c5babf",
                    "4": "#7d5c58",
                    "5": "#b2a8ac",
                    "6": "#887d79",
                    "7": "#c88371",
                    "8": "#443435"
                }
            }
        }
    }
};

const getModel = (hunter, modelId = 'default') => {
    return drawBeruModels[hunter]?.models[modelId] || null;
};

const getHunterModels = (hunter) => {
    return drawBeruModels[hunter]?.models || {};
};

const DrawBeru = () => {
    const { t } = useTranslation();

    const canvasRef = useRef(null);
    const layersRef = useRef([]);
    const referenceCanvasRef = useRef(null);

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

        // Charger un coloriage existant s'il existe
        const userData = JSON.parse(localStorage.getItem('builderberu_users') || '{}');
        const existingColoring = userData.user?.accounts?.default?.colorings?.[selectedHunter]?.[selectedModel];

        console.log('🎨 Existing coloring found:', !!existingColoring);

        if (existingColoring && existingColoring.layers) {
            console.log('✅ Chargement du coloriage existant');
            console.log('Layers count:', existingColoring.layers.length);

            let loadedLayers = 0;
            const totalLayers = Math.min(existingColoring.layers.length, layersRef.current.length);

            // Charger les layers sauvegardés
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

            // Restaurer les paramètres des layers
            setLayers(prevLayers => prevLayers.map((layer, i) => ({
                ...layer,
                visible: existingColoring.layers[i]?.visible ?? layer.visible,
                opacity: existingColoring.layers[i]?.opacity ?? layer.opacity,
                locked: existingColoring.layers[i]?.locked ?? layer.locked
            })));

            setImagesLoaded(true);

        } else {
            console.log('📄 Aucun coloriage existant, chargement template vierge');

            // Charger le template vierge
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

        // Charger le modèle de référence
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

        // Sauvegarder UNIQUEMENT les layers (tes pixels dessinés)
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

        // Créer une preview (fond blanc + layers) pour affichage futur
        const exportCanvas = document.createElement('canvas');
        const canvas = canvasRef.current;
        exportCanvas.width = canvas.width;
        exportCanvas.height = canvas.height;
        const exportCtx = exportCanvas.getContext('2d');

        // Fond blanc
        exportCtx.fillStyle = '#FFFFFF';
        exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        // Dessiner les layers visibles
        layers.forEach((layer, index) => {
            if (layer.visible && layersRef.current[index]) {
                exportCtx.globalAlpha = layer.opacity;
                exportCtx.drawImage(layersRef.current[index], 0, 0);
                exportCtx.globalAlpha = 1;
            }
        });

        let previewImageData;
        try {
            previewImageData = exportCanvas.toDataURL('image/png', 0.8);
            console.log('✅ Preview générée, taille:', (previewImageData.length / 1024).toFixed(0), 'Ko');
        } catch (e) {
            console.error('❌ Erreur génération preview:', e);
            previewImageData = null;
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
            totalSize: (JSON.stringify(coloringData).length / 1024).toFixed(0) + ' Ko'
        });

        try {
            localStorage.setItem('builderberu_users', JSON.stringify(userData));

            // Vérification immédiate
            const verification = JSON.parse(localStorage.getItem('builderberu_users'));
            const saved = verification.user?.accounts?.default?.colorings?.[selectedHunter]?.[selectedModel];

            console.log('✅ Vérification:', {
                saved: !!saved,
                hasPreview: !!saved?.preview,
                layersCount: saved?.layers?.length
            });

            alert(`✅ Coloriage sauvegardé !\n\nHunter: ${selectedHunter}\nModèle: ${selectedModel}\nCalques: ${coloringData.layers.length}\nTaille totale: ${(JSON.stringify(coloringData).length / 1024).toFixed(0)} Ko`);

        } catch (e) {
            console.error('❌ Erreur sauvegarde:', e);
            if (e.name === 'QuotaExceededError') {
                alert('⚠️ Espace localStorage plein ! Supprime d\'anciens coloriages ou réduis la qualité.');
            } else {
                alert('❌ Erreur de sauvegarde : ' + e.message);
            }
        }
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
                                onClick={() => {
                                    const userData = JSON.parse(localStorage.getItem('builderberu_users') || '{}');
                                    const colorings = userData.user?.accounts?.default?.colorings || {};

                                    console.log('🔍 DEBUG - État localStorage complet:');
                                    console.log('Tous les coloriages:', colorings);
                                    console.log('Hunter actuel:', selectedHunter);
                                    console.log('Model actuel:', selectedModel);
                                    console.log('Coloriage actuel:', colorings[selectedHunter]?.[selectedModel]);

                                    const hunterColorings = colorings[selectedHunter] || {};
                                    const count = Object.keys(hunterColorings).length;

                                    alert(`🔍 Debug Info:\n\nHunter: ${selectedHunter}\nModèle: ${selectedModel}\n\nColoriages sauvegardés: ${count}\n\nOuvre la console (F12) pour plus de détails.`);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                title="Inspecter le localStorage"
                            >
                                🔍 Debug
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
                                <label className="text-sm">Taille pinceau : {brushSize.toFixed(1)} px</label>
                                <input
                                    type="range"
                                    min={0.1}
                                    max={20}
                                    step={0.1}
                                    value={brushSize}
                                    onChange={(e) => setBrushSize(parseFloat(e.target.value))}  // ⬅️ ici le fix
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
                                    PC: Molette zoom | Clic droit déplacer<br />
                                    Mobile: Boutons ci-dessus 👆
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
                                        onTouchStart={(e) => {
                                            e.preventDefault();
                                            const touch = e.touches[0];
                                            const mouseEvent = new MouseEvent('mousedown', {
                                                clientX: touch.clientX,
                                                clientY: touch.clientY
                                            });
                                            startDrawing(mouseEvent);
                                        }}
                                        onTouchMove={(e) => {
                                            e.preventDefault();
                                            const touch = e.touches[0];
                                            const mouseEvent = new MouseEvent('mousemove', {
                                                clientX: touch.clientX,
                                                clientY: touch.clientY
                                            });
                                            draw(mouseEvent);
                                        }}
                                        onTouchEnd={(e) => {
                                            e.preventDefault();
                                            stopDrawing();
                                        }}
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