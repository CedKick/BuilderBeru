import React from 'react';
import { User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';

export const ModelSelector = ({
  hunters,
  selectedHunter,
  selectedModel,
  onHunterChange,
  onModelChange,
  availableModels,
  className
}) => {
  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hunter Selector */}
        <div>
          <Label htmlFor="hunter-select" className="text-sm font-medium mb-2 block flex items-center gap-2">
            <User className="w-4 h-4" />
            Personnage
          </Label>
          <Select value={selectedHunter} onValueChange={onHunterChange}>
            <SelectTrigger id="hunter-select" className="w-full">
              <SelectValue placeholder="Sélectionner un hunter" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(hunters).map((hunterKey) => (
                <SelectItem key={hunterKey} value={hunterKey}>
                  {hunters[hunterKey].name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model Selector */}
        <div>
          <Label htmlFor="model-select" className="text-sm font-medium mb-2 block">
            Modèle
          </Label>
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger id="model-select" className="w-full">
              <SelectValue placeholder="Sélectionner un modèle" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
