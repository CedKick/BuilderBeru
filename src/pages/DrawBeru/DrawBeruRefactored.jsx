import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Paintbrush, Menu } from 'lucide-react';
import { drawBeruModels, getModel, getHunterModels } from './config/models';
import { Toolbar } from '../../components/drawberu/Toolbar';
import { ColorPalette } from '../../components/drawberu/ColorPalette';
import { CanvasControls } from '../../components/drawberu/CanvasControls';
import { LayerPanel } from '../../components/drawberu/LayerPanel';
import { ReferencePanel } from '../../components/drawberu/ReferencePanel';
import { ModelSelector } from '../../components/drawberu/ModelSelector';
import { MobileDrawer } from '../../components/drawberu/MobileDrawer';
import { useIsMobile } from '../../hooks/use-mobile';

const DrawBeruRefactored = () => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  // Canvas refs
  const canvasRef = useRef(null);
  const layersRef = useRef([]);
  const referenceCanvasRef = useRef(null);

  // State
  const [selectedHunter, setSelectedHunter] = useState('ilhwan');
  const [selectedModel, setSelectedModel] = useState('default');
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  const [brushSize, setBrushSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('brush');
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  // Zoom & Pan
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const MAX_ZOOM = isMobile ? 8 : 3;
  const ZOOM_STEP = isMobile ? 0.3 : 0.25;

  // Reference canvas zoom & pan
  const [refZoomLevel, setRefZoomLevel] = useState(1);
  const [refPanOffset, setRefPanOffset] = useState({ x: 0, y: 0 });
  const [isRefPanning, setIsRefPanning] = useState(false);
  const [lastRefPanPoint, setLastRefPanPoint] = useState({ x: 0, y: 0 });
  const [debugPoint, setDebugPoint] = useState(null);

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

  // UI State
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);

  const currentModelData = getModel(selectedHunter, selectedModel);
  const availableModels = getHunterModels(selectedHunter);

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
    };
    templateImg.onerror = () => {
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

  const saveToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    const snapshot = layersRef.current.map(canvas => {
      try {
        return canvas.toDataURL();
      } catch (e) {
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
    
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;
    
    const x = ((clientX - rect.left) / zoomLevel - panOffset.x / zoomLevel) * scaleX;
    const y = ((clientY - rect.top) / zoomLevel - panOffset.y / zoomLevel) * scaleY;
    
    return { x, y };
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
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCanvasCoordinates(e, canvas);

    if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      if (pixel[3] > 0) {
        const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1).toUpperCase()}`;
        setSelectedColor(hex);
        setCurrentTool('brush');
      }
    }
  };

  const pickColorFromReference = (e) => {
    if (currentTool !== 'pipette') return;

    const refCanvas = referenceCanvasRef.current;
    if (!refCanvas) return;

    const rect = refCanvas.getBoundingClientRect();
    const scaleX = refCanvas.width / rect.width;
    const scaleY = refCanvas.height / rect.height;

    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const x = Math.floor(((clientX / refZoomLevel) - (refPanOffset.x / refZoomLevel)) * scaleX);
    const y = Math.floor(((clientY / refZoomLevel) - (refPanOffset.y / refZoomLevel)) * scaleY);

    if (x >= 0 && x < refCanvas.width && y >= 0 && y < refCanvas.height) {
      const ctx = refCanvas.getContext('2d');
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      
      if (pixel[3] > 0) {
        const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1).toUpperCase()}`;
        setSelectedColor(hex);
        setCurrentTool('brush');
        
        setDebugPoint({ cssX: clientX, cssY: clientY });
        setTimeout(() => setDebugPoint(null), 1000);
      }
    }
  };

  // Save, export, import functions
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
        console.error(`Error exporting layer ${i}:`, e);
        return null;
      }
    }).filter(l => l !== null);

    if (layersData.length === 0) {
      alert('❌ Impossible d\'exporter les layers');
      return;
    }

    const canvas = canvasRef.current;
    const previewCanvas = document.createElement('canvas');
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
        console.error('Error generating images:', e);
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
        console.error('Error saving:', e);
        if (e.name === 'QuotaExceededError') {
          alert('⚠️ Espace localStorage plein !');
        } else {
          alert('❌ Erreur de sauvegarde');
        }
      }
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
      alert(`✅ Modèle de référence téléchargé !`);
    }, 'image/png', 1.0);
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
        alert(`✅ Image téléchargée !`);
      }, 'image/png', 1.0);
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
    alert(`✅ Coloriage exporté !`);
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

          alert(`✅ Coloriage importé !\n\nRecharge la page pour voir le résultat.`);

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

  // Canvas wheel handler for zoom
  const handleCanvasWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    const newZoom = Math.max(0.5, Math.min(MAX_ZOOM, zoomLevel + delta));
    setZoomLevel(newZoom);
  };

  // Canvas pan handlers
  const startCanvasPan = (e) => {
    if (e.button === 2 || e.ctrlKey) {
      e.preventDefault();
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasPan = (e) => {
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

  const stopCanvasPan = () => {
    setIsPanning(false);
  };

  // Reference canvas handlers
  const handleRefWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.25 : 0.25;
    setRefZoomLevel(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const startRefPan = (e) => {
    if (e.button === 2 || e.ctrlKey) {
      e.preventDefault();
      setIsRefPanning(true);
      setLastRefPanPoint({ x: e.clientX, y: e.clientY });
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

  const resetRefView = () => {
    setRefZoomLevel(1);
    setRefPanOffset({ x: 0, y: 0 });
  };

  const handleRefPanDirection = (direction) => {
    const step = 30;
    switch (direction) {
      case 'up':
        setRefPanOffset(prev => ({ ...prev, y: prev.y + step }));
        break;
      case 'down':
        setRefPanOffset(prev => ({ ...prev, y: prev.y - step }));
        break;
      case 'left':
        setRefPanOffset(prev => ({ ...prev, x: prev.x + step }));
        break;
      case 'right':
        setRefPanOffset(prev => ({ ...prev, x: prev.x - step }));
        break;
    }
  };

  const handleCanvasPanDirection = (direction) => {
    const step = 30;
    switch (direction) {
      case 'up':
        setPanOffset(prev => ({ ...prev, y: prev.y + step }));
        break;
      case 'down':
        setPanOffset(prev => ({ ...prev, y: prev.y - step }));
        break;
      case 'left':
        setPanOffset(prev => ({ ...prev, x: prev.x + step }));
        break;
      case 'right':
        setPanOffset(prev => ({ ...prev, x: prev.x - step }));
        break;
      case 'center':
        setPanOffset({ x: 0, y: 0 });
        setZoomLevel(1);
        break;
    }
  };

  if (!imagesLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 sticky top-0 z-40">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Paintbrush className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold">DrawBeru</h1>
            </div>

            {!isMobile && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowLeftPanel(!showLeftPanel)}
                  className="tool-btn"
                >
                  {showLeftPanel ? 'Masquer palette' : 'Afficher palette'}
                </button>
                <button
                  onClick={() => setShowRightPanel(!showRightPanel)}
                  className="tool-btn"
                >
                  {showRightPanel ? 'Masquer référence' : 'Afficher référence'}
                </button>
              </div>
            )}
          </div>

          <ModelSelector
            hunters={drawBeruModels}
            selectedHunter={selectedHunter}
            selectedModel={selectedModel}
            onHunterChange={setSelectedHunter}
            onModelChange={setSelectedModel}
            availableModels={availableModels}
            className="mb-4"
          />

          <Toolbar
            currentTool={currentTool}
            onToolChange={setCurrentTool}
            onUndo={undo}
            onRedo={redo}
            onSave={saveColoring}
            onExport={exportColoring}
            onImport={importColoring}
            onReset={resetColoring}
            onExportPNG={downloadTransparentPNG}
            onExportTransparent={downloadColoredPNG}
            canUndo={canUndo}
            canRedo={canRedo}
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Panel - Desktop Only */}
          {!isMobile && showLeftPanel && (
            <div className="lg:col-span-3 space-y-4 animate-slide-up">
              <ColorPalette
                palette={currentModelData.palette}
                selectedColor={selectedColor}
                onColorSelect={setSelectedColor}
                brushSize={brushSize}
                onBrushSizeChange={setBrushSize}
              />

              <CanvasControls
                zoomLevel={zoomLevel}
                onZoomIn={() => setZoomLevel(Math.min(MAX_ZOOM, zoomLevel + ZOOM_STEP))}
                onZoomOut={() => setZoomLevel(Math.max(0.5, zoomLevel - ZOOM_STEP))}
                onResetZoom={() => {
                  setZoomLevel(1);
                  setPanOffset({ x: 0, y: 0 });
                }}
                panOffset={panOffset}
                onResetPan={handleCanvasPanDirection}
              />

              <LayerPanel
                layers={layers}
                activeLayer={activeLayer}
                onLayerSelect={setActiveLayer}
                onLayerToggle={(layerId) => {
                  setLayers(layers.map(l =>
                    l.id === layerId ? { ...l, visible: !l.visible } : l
                  ));
                  setTimeout(renderLayers, 10);
                }}
                onLayerLock={(layerId) => {
                  setLayers(layers.map(l =>
                    l.id === layerId ? { ...l, locked: !l.locked } : l
                  ));
                }}
                onLayerOpacityChange={(layerId, opacity) => {
                  setLayers(layers.map(l =>
                    l.id === layerId ? { ...l, opacity } : l
                  ));
                  setTimeout(renderLayers, 10);
                }}
              />
            </div>
          )}

          {/* Canvas - Center */}
          <div className={`${!isMobile ? (showLeftPanel && showRightPanel ? 'lg:col-span-6' : showLeftPanel || showRightPanel ? 'lg:col-span-9' : 'lg:col-span-12') : 'lg:col-span-12'}`}>
            <div className="panel">
              <div className="panel-header">
                <Paintbrush className="w-5 h-5" />
                <span>Zone de coloriage</span>
                <span className="ml-auto text-sm text-muted-foreground">
                  {selectedHunter} - {currentModelData.name}
                </span>
              </div>

              <div
                className="bg-canvas-bg rounded-lg overflow-hidden flex justify-center items-center relative"
                style={{ minHeight: '500px' }}
                onWheel={handleCanvasWheel}
                onMouseDown={(e) => {
                  if (e.button === 2 || e.ctrlKey) {
                    startCanvasPan(e);
                  } else {
                    startDrawing(e);
                  }
                }}
                onMouseMove={(e) => {
                  handleCanvasPan(e);
                  draw(e);
                }}
                onMouseUp={() => {
                  stopCanvasPan();
                  stopDrawing();
                }}
                onMouseLeave={() => {
                  stopCanvasPan();
                  stopDrawing();
                }}
                onContextMenu={(e) => e.preventDefault()}
              >
                <div
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
                      maxWidth: '100%',
                      height: 'auto',
                      cursor: currentTool === 'pipette' ? 'crosshair' : (isPanning ? 'move' : 'crosshair')
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Desktop Only */}
          {!isMobile && showRightPanel && (
            <div className="lg:col-span-3 animate-slide-up">
              <ReferencePanel
                referenceCanvasRef={referenceCanvasRef}
                zoomLevel={refZoomLevel}
                panOffset={refPanOffset}
                isPanning={isRefPanning}
                currentTool={currentTool}
                onWheel={handleRefWheel}
                onMouseDown={startRefPan}
                onMouseMove={handleRefPan}
                onMouseUp={stopRefPan}
                onMouseLeave={stopRefPan}
                onZoomIn={() => setRefZoomLevel(Math.min(3, refZoomLevel + 0.25))}
                onZoomOut={() => setRefZoomLevel(Math.max(0.5, refZoomLevel - 0.25))}
                onResetView={resetRefView}
                onPanDirection={handleRefPanDirection}
                onPickColor={pickColorFromReference}
                debugPoint={debugPoint}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobile && (
        <MobileDrawer
          palette={currentModelData.palette}
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
          layers={layers}
          activeLayer={activeLayer}
          onLayerSelect={setActiveLayer}
          onLayerToggle={(layerId) => {
            setLayers(layers.map(l =>
              l.id === layerId ? { ...l, visible: !l.visible } : l
            ));
            setTimeout(renderLayers, 10);
          }}
          onLayerLock={(layerId) => {
            setLayers(layers.map(l =>
              l.id === layerId ? { ...l, locked: !l.locked } : l
            ));
          }}
          onLayerOpacityChange={(layerId, opacity) => {
            setLayers(layers.map(l =>
              l.id === layerId ? { ...l, opacity } : l
            ));
            setTimeout(renderLayers, 10);
          }}
          zoomLevel={zoomLevel}
          onZoomIn={() => setZoomLevel(Math.min(MAX_ZOOM, zoomLevel + ZOOM_STEP))}
          onZoomOut={() => setZoomLevel(Math.max(0.5, zoomLevel - ZOOM_STEP))}
          onResetZoom={() => {
            setZoomLevel(1);
            setPanOffset({ x: 0, y: 0 });
          }}
          onResetPan={handleCanvasPanDirection}
        >
          <ReferencePanel
            referenceCanvasRef={referenceCanvasRef}
            zoomLevel={refZoomLevel}
            panOffset={refPanOffset}
            isPanning={isRefPanning}
            currentTool={currentTool}
            onWheel={handleRefWheel}
            onMouseDown={startRefPan}
            onMouseMove={handleRefPan}
            onMouseUp={stopRefPan}
            onMouseLeave={stopRefPan}
            onZoomIn={() => setRefZoomLevel(Math.min(3, refZoomLevel + 0.25))}
            onZoomOut={() => setRefZoomLevel(Math.max(0.5, refZoomLevel - 0.25))}
            onResetView={resetRefView}
            onPanDirection={handleRefPanDirection}
            onPickColor={pickColorFromReference}
            debugPoint={debugPoint}
          />
        </MobileDrawer>
      )}
    </div>
  );
};

export default DrawBeruRefactored;
