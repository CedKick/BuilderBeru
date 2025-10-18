import React from 'react';
import { Image, ZoomIn, ZoomOut, Maximize, Move } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';

export const ReferencePanel = ({
  referenceCanvasRef,
  zoomLevel,
  panOffset,
  isPanning,
  currentTool,
  onWheel,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onZoomIn,
  onZoomOut,
  onResetView,
  onPanDirection,
  onPickColor,
  debugPoint,
  className
}) => {
  return (
    <TooltipProvider>
      <div className={cn("panel", className)}>
        <div className="panel-header">
          <Image className="w-5 h-5" />
          <span>Modèle</span>
        </div>

        {/* Zoom Controls */}
        <div className="mb-3">
          <div className="text-sm font-medium mb-2">
            Zoom: {Math.round(zoomLevel * 100)}%
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onZoomOut}
                  className="tool-btn flex items-center justify-center"
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
                  onClick={onResetView}
                  className="tool-btn flex items-center justify-center"
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
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoomer</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Pan Controls */}
          <div className="mb-2">
            <div className="text-xs text-muted-foreground mb-1">Déplacement:</div>
            <div className="grid grid-cols-3 gap-1 max-w-[120px] mx-auto">
              <div></div>
              <button
                onClick={() => onPanDirection('up')}
                className="tool-btn flex items-center justify-center text-lg"
              >
                ↑
              </button>
              <div></div>
              <button
                onClick={() => onPanDirection('left')}
                className="tool-btn flex items-center justify-center text-lg"
              >
                ←
              </button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onResetView}
                    className="tool-btn flex items-center justify-center"
                  >
                    <Move className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Centrer</p>
                </TooltipContent>
              </Tooltip>
              <button
                onClick={() => onPanDirection('right')}
                className="tool-btn flex items-center justify-center text-lg"
              >
                →
              </button>
              <div></div>
              <button
                onClick={() => onPanDirection('down')}
                className="tool-btn flex items-center justify-center text-lg"
              >
                ↓
              </button>
              <div></div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            {currentTool === 'pipette' ? '💧 Cliquez pour prélever une couleur' : 'Clic droit pour déplacer'}
          </div>
        </div>

        {/* Reference Canvas */}
        <div
          className="bg-canvas-bg rounded-lg overflow-hidden flex justify-center items-center relative"
          style={{ minHeight: '300px' }}
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
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
              ref={referenceCanvasRef}
              onClick={onPickColor}
              style={{
                display: 'block',
                maxWidth: '100%',
                height: 'auto',
                cursor: currentTool === 'pipette' ? 'crosshair' : (isPanning ? 'move' : 'default')
              }}
            />

            {debugPoint && (
              <div
                style={{
                  position: 'absolute',
                  left: `${debugPoint.cssX}px`,
                  top: `${debugPoint.cssY}px`,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,0,0,0.7)',
                  border: '3px solid #fff',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                  zIndex: 1000,
                  boxShadow: '0 0 20px rgba(255,0,0,1), inset 0 0 10px rgba(255,255,255,0.5)',
                  animation: 'pulse 0.5s ease-in-out infinite',
                }}
              />
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
