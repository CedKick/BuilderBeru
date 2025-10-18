import React from 'react';
import { Layers, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Slider } from '../../components/ui/slider';

export const LayerPanel = ({
  layers,
  activeLayer,
  onLayerSelect,
  onLayerToggle,
  onLayerLock,
  onLayerOpacityChange,
  className
}) => {
  return (
    <div className={cn("panel", className)}>
      <div className="panel-header">
        <Layers className="w-5 h-5" />
        <span>Calques</span>
      </div>

      <div className="space-y-2">
        {layers.map((layer) => (
          <div
            key={layer.id}
            className={cn(
              "p-3 rounded-lg border-2 transition-all cursor-pointer",
              activeLayer === layer.id
                ? "border-primary bg-primary/10"
                : "border-border bg-secondary/50 hover:bg-secondary"
            )}
            onClick={() => onLayerSelect(layer.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">{layer.name}</span>
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerToggle(layer.id);
                  }}
                  className="p-1 hover:bg-background rounded transition-colors"
                  aria-label={layer.visible ? 'Masquer' : 'Afficher'}
                >
                  {layer.visible ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4 opacity-50" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLayerLock(layer.id);
                  }}
                  className="p-1 hover:bg-background rounded transition-colors"
                  aria-label={layer.locked ? 'Déverrouiller' : 'Verrouiller'}
                >
                  {layer.locked ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <Unlock className="w-4 h-4 opacity-50" />
                  )}
                </button>
              </div>
            </div>

            {/* Opacity Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Opacité</span>
                <span className="text-xs font-medium">{Math.round(layer.opacity * 100)}%</span>
              </div>
              <Slider
                value={[layer.opacity * 100]}
                onValueChange={(value) => onLayerOpacityChange(layer.id, value[0] / 100)}
                min={0}
                max={100}
                step={1}
                className="w-full"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
