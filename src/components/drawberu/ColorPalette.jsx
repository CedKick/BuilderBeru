import React from 'react';
import { Palette } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Slider } from '../../components/ui/slider';

export const ColorPalette = ({
  palette,
  selectedColor,
  onColorSelect,
  brushSize,
  onBrushSizeChange,
  className
}) => {
  return (
    <div className={cn("panel", className)}>
      <div className="panel-header">
        <Palette className="w-5 h-5" />
        <span>Palette</span>
      </div>

      {/* Preset Colors */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {Object.entries(palette).map(([key, color]) => (
          <button
            key={key}
            onClick={() => onColorSelect(color)}
            className={cn(
              "color-swatch",
              selectedColor === color && "color-swatch-active"
            )}
            style={{ backgroundColor: color }}
            aria-label={`Couleur ${key}`}
          />
        ))}
      </div>

      {/* Custom Color Picker */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="color-picker" className="text-sm font-medium mb-2 block">
            Couleur libre
          </Label>
          <div className="flex gap-2 items-center">
            <Input
              id="color-picker"
              type="color"
              value={selectedColor}
              onChange={(e) => onColorSelect(e.target.value)}
              className="h-12 w-full cursor-pointer"
            />
            <div
              className="w-12 h-12 rounded-lg border-2 border-border flex-shrink-0"
              style={{ backgroundColor: selectedColor }}
            />
          </div>
        </div>

        {/* Brush Size */}
        <div>
          <Label htmlFor="brush-size" className="text-sm font-medium mb-2 block">
            Taille pinceau: {brushSize.toFixed(1)}px
          </Label>
          <Slider
            id="brush-size"
            min={0.1}
            max={50}
            step={0.1}
            value={[brushSize]}
            onValueChange={(value) => onBrushSizeChange(value[0])}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0.1</span>
            <span>50</span>
          </div>
        </div>
      </div>
    </div>
  );
};
