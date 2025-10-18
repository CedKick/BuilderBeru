import React from 'react';
import { ZoomIn, ZoomOut, Maximize, Move } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';

export const CanvasControls = ({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  panOffset,
  onResetPan,
  className
}) => {
  return (
    <TooltipProvider>
      <div className={cn("panel", className)}>
        <div className="space-y-4">
          {/* Zoom Controls */}
          <div>
            <div className="text-sm font-medium mb-2 flex items-center justify-between">
              <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onZoomOut}
                    className="tool-btn flex items-center justify-center"
                    aria-label="Dézoomer"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Dézoomer</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onResetZoom}
                    className="tool-btn flex items-center justify-center"
                    aria-label="Réinitialiser zoom"
                  >
                    <Maximize className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Réinitialiser</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onZoomIn}
                    className="tool-btn flex items-center justify-center"
                    aria-label="Zoomer"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Zoomer</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Pan Controls */}
          <div>
            <div className="text-sm font-medium mb-2">Déplacement</div>
            <div className="grid grid-cols-3 gap-1">
              <div></div>
              <button
                onClick={() => onResetPan('up')}
                className="tool-btn flex items-center justify-center text-lg"
                aria-label="Haut"
              >
                ↑
              </button>
              <div></div>
              <button
                onClick={() => onResetPan('left')}
                className="tool-btn flex items-center justify-center text-lg"
                aria-label="Gauche"
              >
                ←
              </button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onResetPan('center')}
                    className="tool-btn flex items-center justify-center"
                    aria-label="Centrer"
                  >
                    <Move className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Centrer</p>
                </TooltipContent>
              </Tooltip>
              <button
                onClick={() => onResetPan('right')}
                className="tool-btn flex items-center justify-center text-lg"
                aria-label="Droite"
              >
                →
              </button>
              <div></div>
              <button
                onClick={() => onResetPan('down')}
                className="tool-btn flex items-center justify-center text-lg"
                aria-label="Bas"
              >
                ↓
              </button>
              <div></div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Molette souris | Clic droit déplacer
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
};
