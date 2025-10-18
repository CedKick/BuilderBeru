import React from 'react';
import { Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../components/ui/sheet';
import { ColorPalette } from './ColorPalette';
import { LayerPanel } from './LayerPanel';
import { CanvasControls } from './CanvasControls';

export const MobileDrawer = ({
  palette,
  selectedColor,
  onColorSelect,
  brushSize,
  onBrushSizeChange,
  layers,
  activeLayer,
  onLayerSelect,
  onLayerToggle,
  onLayerLock,
  onLayerOpacityChange,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onResetPan,
  children
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="fixed bottom-4 right-4 z-50 tool-btn tool-btn-active p-4 rounded-full shadow-lg">
          <Menu className="w-6 h-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Outils de dessin</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <ColorPalette
            palette={palette}
            selectedColor={selectedColor}
            onColorSelect={onColorSelect}
            brushSize={brushSize}
            onBrushSizeChange={onBrushSizeChange}
          />
          
          <CanvasControls
            zoomLevel={zoomLevel}
            onZoomIn={onZoomIn}
            onZoomOut={onZoomOut}
            onResetZoom={onResetZoom}
            onResetPan={onResetPan}
          />

          <LayerPanel
            layers={layers}
            activeLayer={activeLayer}
            onLayerSelect={onLayerSelect}
            onLayerToggle={onLayerToggle}
            onLayerLock={onLayerLock}
            onLayerOpacityChange={onLayerOpacityChange}
          />

          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
};
