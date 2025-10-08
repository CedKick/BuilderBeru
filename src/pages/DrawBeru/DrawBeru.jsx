// src/pages/DrawBeru/DrawBeru.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { drawBeruModels, getModel, getHunterModels } from './config/models.js';

const DrawBeru = () => {
  const { t } = useTranslation();
  
  // Canvas refs
  const canvasRef = useRef(null);
  const layersRef = useRef([]); // Refs pour chaque layer
  const referenceCanvasRef = useRef(null); // Canvas pour le modèle de référence
  
  // States
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
  
  // Zoom pour le modèle de référence
  const [refZoomLevel, setRefZoomLevel] = useState(1);
  const [refPanOffset, setRefPanOffset] = useState({ x: 0, y: 0 });
  const [isRefPanning, setIsRefPanning] = useState(false);
  const [lastRefPanPoint, setLastRefPanPoint] = useState({ x: 0, y: 0 });
  const [debugPoint, setDebugPoint] = useState(null); // Point de debug pour la pipette
  
  // Layers system
  const [layers, setLayers] = useState([
    { id: 'base', name: 'Base', visible: true, opacity: 1, locked: false },
    { id: 'shadows', name: 'Ombres', visible: true, opacity: 1, locked: false },
    { id: 'details', name: 'Détails', visible: true, opacity: 1, locked: false }
  ]);
  const [activeLayer, setActiveLayer] = useState('base');
  
  // Undo/Redo system
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  
  // Récupérer le modèle actuel
  const currentModelData = getModel(selectedHunter, selectedModel);
  const availableModels = getHunterModels(selectedHunter);
  
  // Initialisation des canvas
  useEffect(() => {
    if (!currentModelData) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const { width, height } = currentModelData.canvasSize;
    
    // Canvas template
    canvas.width = width;
    canvas.height = height;
    
    // Créer les canvas des layers
    layersRef.current = layers.map(() => {
      const layerCanvas = document.createElement('canvas');
      layerCanvas.width = width;
      layerCanvas.height = height;
      return layerCanvas;
    });
    
    // Charger le template
    const templateImg = new Image();
    templateImg.crossOrigin = "anonymous";
    templateImg.onload = () => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(templateImg, 0, 0, width, height);
      
      setImagesLoaded(true);
      saveToHistory(); // État initial
      console.log('Template loaded:', width, 'x', height);
    };
    
    templateImg.onerror = () => {
      console.error('Erreur chargement template:', currentModelData.template);
    };
    
    templateImg.src = currentModelData.template;
    
    // Charger le modèle de référence dans son canvas
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
    
  }, [currentModelData, layers.length]);
  
  // Gestion historique
  const saveToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    const snapshot = layersRef.current.map(canvas => canvas.toDataURL());
    newHistory.push(snapshot);
    
    // Limiter l'historique à 50 étapes
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
  
  // Raccourcis clavier
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
      
      // Raccourcis outils
      if (!e.ctrlKey && !e.metaKey) {
        if (e.key === 'b' || e.key === 'B') setCurrentTool('brush');
        if (e.key === 'e' || e.key === 'E') setCurrentTool('eraser');
        if (e.key === 'i' || e.key === 'I') setCurrentTool('pipette');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history.length]);
  
  // Render tous les layers sur le canvas principal
  const renderLayers = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Recharger le template en fond
    const templateImg = new Image();
    templateImg.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
      
      // Dessiner chaque layer visible
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
  
  // Zoom et pan (canvas principal)
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
  
  // Zoom et pan pour le modèle de référence
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
  
 // Coordonnées précises sur le canvas (gère zoom/pan/ratio)
const getCanvasCoordinates = (e, canvas) => {
  const rect = canvas.getBoundingClientRect();           // bbox après transform
  const scaleX = canvas.width  / rect.width;             // px intrinsèque / px CSS
  const scaleY = canvas.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top)  * scaleY;
  return { x, y };
};

  
  // Pipette : récupérer couleur depuis le modèle de référence
  const pickColorFromReference = (e) => {
  const refCanvas = referenceCanvasRef.current;
  if (!refCanvas) return;

  // 1) Coordonnées canvas intrinsèques
  const rect = refCanvas.getBoundingClientRect();
  const scaleX = refCanvas.width  / rect.width;
  const scaleY = refCanvas.height / rect.height;
  const x = Math.floor((e.clientX - rect.left) * scaleX);
  const y = Math.floor((e.clientY - rect.top)  * scaleY);

  // 2) Debug point en coordonnées CSS (pour afficher le dot au bon endroit)
  const cssX = e.clientX - rect.left;
  const cssY = e.clientY - rect.top;
  setDebugPoint({ cssX, cssY }); 
  setTimeout(() => setDebugPoint(null), 1200);

  // 3) Bornes + lecture pixel
  if (x < 0 || x >= refCanvas.width || y < 0 || y >= refCanvas.height) return;
  const ctx = refCanvas.getContext('2d', { willReadFrequently: true });
  const p = ctx.getImageData(x, y, 1, 1).data;
  if (p[3] === 0) return; // transparent

  const hex = `#${((1 << 24) + (p[0] << 16) + (p[1] << 8) + p[2])
    .toString(16).slice(1).toUpperCase()}`;
  setSelectedColor(hex);
  setCurrentTool('brush');
};

  
  // Pipette : récupérer couleur depuis le canvas de coloriage
  const pickColorFromCanvas = (e) => {
    const activeLayerIndex = layers.findIndex(l => l.id === activeLayer);
    const layerCanvas = layersRef.current[activeLayerIndex];
    if (!layerCanvas) return;
    
    const { x, y } = getCanvasCoordinates(e, canvasRef.current);
    
    const ctx = layerCanvas.getContext('2d');
    const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
    
    // Vérifier si le pixel n'est pas transparent
    if (pixel[3] > 0) {
      const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1).toUpperCase()}`;
      setSelectedColor(hex);
    }
    
    setCurrentTool('brush');
  };
  
  // Gestion du dessin
  const startDrawing = (e) => {
    if (e.button !== 0 || e.ctrlKey || isPanning) return;
    
    // Pipette
    if (currentTool === 'pipette') {
      pickColorFromCanvas(e);
      return;
    }
    
    // Vérifier que le layer n'est pas verrouillé
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
  
  // Toggle layer visibility
  const toggleLayerVisibility = (layerId) => {
    setLayers(layers.map(l => 
      l.id === layerId ? { ...l, visible: !l.visible } : l
    ));
    setTimeout(renderLayers, 10);
  };
  
  // Toggle layer lock
  const toggleLayerLock = (layerId) => {
    setLayers(layers.map(l => 
      l.id === layerId ? { ...l, locked: !l.locked } : l
    ));
  };
  
  // Change layer opacity
  const changeLayerOpacity = (layerId, opacity) => {
    setLayers(layers.map(l => 
      l.id === layerId ? { ...l, opacity: parseFloat(opacity) } : l
    ));
    setTimeout(renderLayers, 10);
  };
  
  // Sauvegarde
  const saveColoring = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL();
    
    const userData = JSON.parse(localStorage.getItem('builderberu_users') || '{}');
    if (!userData.user) userData.user = { accounts: {} };
    if (!userData.user.accounts.default) userData.user.accounts.default = {};
    if (!userData.user.accounts.default.colorings) userData.user.accounts.default.colorings = {};
    if (!userData.user.accounts.default.colorings[selectedHunter]) {
      userData.user.accounts.default.colorings[selectedHunter] = {};
    }
    
    userData.user.accounts.default.colorings[selectedHunter][selectedModel] = {
      imageData: dataURL,
      layers: layersRef.current.map((canvas, i) => ({
        id: layers[i].id,
        name: layers[i].name,
        data: canvas.toDataURL(),
        visible: layers[i].visible,
        opacity: layers[i].opacity,
        locked: layers[i].locked
      })),
      palette: currentModelData.palette,
      createdAt: Date.now(),
      isCompleted: true,
      hunter: selectedHunter,
      model: selectedModel
    };
    
    localStorage.setItem('builderberu_users', JSON.stringify(userData));
    alert(`Coloriage ${currentModelData.name} sauvegardé ! 🎨`);
  };
  
  // Reset
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
  
  // Changer de modèle
  const handleModelChange = (modelId) => {
    setSelectedModel(modelId);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.3); }
        }
      `}</style>
      
      {/* Header */}
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
            
            <div className="flex gap-3">
              <button
                onClick={undo}
                disabled={!canUndo}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  canUndo 
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
                className={`px-4 py-2 rounded-lg transition-colors ${
                  canRedo 
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
          
          {/* Palette + Layers */}
          <div className="lg:col-span-1 space-y-4">
            {/* Palette */}
            <div className="bg-black/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-4">
                🎨 Palette
              </h3>
              
              <div className="grid grid-cols-4 gap-2 mb-4">
                {Object.entries(currentModelData.palette).map(([id, color]) => (
                  <button
                    key={id}
                    onClick={() => setSelectedColor(color)}
                    className={`w-12 h-12 rounded-lg border-2 transition-all ${
                      selectedColor === color 
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
                <label className="text-purple-200 text-sm mb-2 block">
                  Taille pinceau: {brushSize}px
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div className="mb-4">
                <label className="text-purple-200 text-sm mb-2 block">
                  Zoom: {Math.round(zoomLevel * 100)}%
                </label>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => handleZoom(-0.25)}
                    className="flex-1 bg-purple-700/50 text-white py-1 px-2 rounded text-sm"
                  >
                    -
                  </button>
                  <button
                    onClick={resetView}
                    className="flex-1 bg-purple-700/50 text-white py-1 px-2 rounded text-sm"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => handleZoom(0.25)}
                    className="flex-1 bg-purple-700/50 text-white py-1 px-2 rounded text-sm"
                  >
                    +
                  </button>
                </div>
                <div className="text-purple-300 text-xs">
                  Molette: zoom | Clic droit / Ctrl+clic: déplacer
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => setCurrentTool('brush')}
                  className={`w-full py-2 px-4 rounded-lg transition-colors ${
                    currentTool === 'brush' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-purple-800/50 text-purple-200 hover:bg-purple-700/50'
                  }`}
                >
                  🖌️ Pinceau (B)
                </button>
                
                <button
                  onClick={() => setCurrentTool('eraser')}
                  className={`w-full py-2 px-4 rounded-lg transition-colors ${
                    currentTool === 'eraser' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-purple-800/50 text-purple-200 hover:bg-purple-700/50'
                  }`}
                >
                  🧽 Gomme (E)
                </button>
                
                <button
                  onClick={() => setCurrentTool('pipette')}
                  className={`w-full py-2 px-4 rounded-lg transition-colors ${
                    currentTool === 'pipette' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-purple-800/50 text-purple-200 hover:bg-purple-700/50'
                  }`}
                >
                  💧 Pipette (I)
                </button>
              </div>
            </div>
            
            {/* Layers */}
            <div className="bg-black/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-4">
                📚 Calques
              </h3>
              
              <div className="space-y-2">
                {layers.map((layer) => (
                  <div
                    key={layer.id}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      activeLayer === layer.id 
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

          {/* Zone de coloriage */}
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

          {/* Modèle de référence */}
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
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => handleRefZoom(-0.25)}
                      className="flex-1 bg-purple-700/50 text-white py-1 px-2 rounded text-sm"
                    >
                      -
                    </button>
                    <button
                      onClick={resetRefView}
                      className="flex-1 bg-purple-700/50 text-white py-1 px-2 rounded text-sm"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => handleRefZoom(0.25)}
                      className="flex-1 bg-purple-700/50 text-white py-1 px-2 rounded text-sm"
                    >
                      +
                    </button>
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
                    
                    {/* Point de debug pour la pipette - DANS le container transformé */}
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