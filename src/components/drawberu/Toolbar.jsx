import React from 'react';
import { Paintbrush, Eraser, Pipette, Undo, Redo, Save, Upload, Download, RotateCcw, FileImage, Package } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { cn } from '../../lib/utils';

export const Toolbar = ({
  currentTool,
  onToolChange,
  onUndo,
  onRedo,
  onSave,
  onExport,
  onImport,
  onReset,
  onHideModel,
  onExportPNG,
  onExportTransparent,
  canUndo,
  canRedo,
  className
}) => {
  const tools = [
    { id: 'brush', icon: Paintbrush, label: 'Pinceau (B)', shortcut: 'B' },
    { id: 'eraser', icon: Eraser, label: 'Gomme (E)', shortcut: 'E' },
    { id: 'pipette', icon: Pipette, label: 'Pipette (I)', shortcut: 'I' },
  ];

  const actions = [
    { id: 'undo', icon: Undo, label: 'Annuler (Ctrl+Z)', onClick: onUndo, disabled: !canUndo },
    { id: 'redo', icon: Redo, label: 'Refaire (Ctrl+Y)', onClick: onRedo, disabled: !canRedo },
  ];

  const exportActions = [
    { id: 'save', icon: Save, label: 'Sauvegarder', onClick: onSave },
    { id: 'export', icon: Download, label: 'Exporter', onClick: onExport },
    { id: 'png', icon: FileImage, label: 'PNG Coloré', onClick: onExportPNG },
    { id: 'transparent', icon: Package, label: 'PNG Transparent', onClick: onExportTransparent },
    { id: 'import', icon: Upload, label: 'Importer', onClick: onImport },
    { id: 'reset', icon: RotateCcw, label: 'Réinitialiser', onClick: onReset },
  ];

  return (
    <TooltipProvider>
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        {/* Drawing Tools */}
        <div className="flex gap-1 p-1 bg-secondary rounded-lg">
          {tools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onToolChange(tool.id)}
                  className={cn(
                    "tool-btn",
                    currentTool === tool.id && "tool-btn-active"
                  )}
                  aria-label={tool.label}
                >
                  <tool.icon className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tool.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* History Actions */}
        <div className="flex gap-1 p-1 bg-secondary rounded-lg">
          {actions.map((action) => (
            <Tooltip key={action.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={cn(
                    "tool-btn",
                    action.disabled && "opacity-40 cursor-not-allowed"
                  )}
                  aria-label={action.label}
                >
                  <action.icon className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{action.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Export Actions */}
        <div className="flex gap-1 p-1 bg-secondary rounded-lg">
          {exportActions.map((action) => (
            <Tooltip key={action.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={action.onClick}
                  className="tool-btn"
                  aria-label={action.label}
                >
                  <action.icon className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{action.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};
