// src/components/DrawBeru/MultiplayerUI/HunterModelSelector.jsx
// Sélection du Hunter et du Modèle
// Par Kaisel pour le Monarque des Ombres

import React, { useState, useEffect } from 'react';
import { drawBeruModels, getHunterModels, getModel } from '../../../pages/DrawBeru/config/models';

const HunterModelSelector = ({
  selectedHunter,
  selectedModel,
  onHunterChange,
  onModelChange,
}) => {
  const [previewImage, setPreviewImage] = useState(null);

  // Liste des hunters disponibles
  const hunters = Object.entries(drawBeruModels);
  const currentHunterModels = getHunterModels(selectedHunter);
  const currentModelData = getModel(selectedHunter, selectedModel);

  // Mettre à jour la preview
  useEffect(() => {
    if (currentModelData) {
      setPreviewImage(currentModelData.reference);
    }
  }, [currentModelData]);

  return (
    <div className="space-y-6">
      {/* Sélection Hunter */}
      <div>
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <span>🎯</span>
          <span>Choisis ton Hunter</span>
        </h3>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {hunters.map(([hunterId, hunterData]) => {
            const firstModel = Object.values(hunterData.models)[0];
            const isSelected = selectedHunter === hunterId;

            return (
              <button
                key={hunterId}
                onClick={() => {
                  onHunterChange(hunterId);
                  onModelChange('default');
                }}
                className={`relative aspect-square rounded-xl overflow-hidden transition-all ${
                  isSelected
                    ? 'ring-4 ring-purple-500 scale-105 z-10'
                    : 'ring-2 ring-purple-500/30 hover:ring-purple-400 hover:scale-102'
                }`}
              >
                {/* Image du hunter */}
                <img
                  src={firstModel?.reference}
                  alt={hunterData.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Nom */}
                <div className="absolute bottom-0 left-0 right-0 p-1 text-center">
                  <span className="text-white text-xs font-medium truncate block">
                    {hunterData.name}
                  </span>
                </div>

                {/* Check mark si sélectionné */}
                {isSelected && (
                  <div className="absolute top-1 right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sélection Modèle */}
      {Object.keys(currentHunterModels).length > 1 && (
        <div>
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span>🖼️</span>
            <span>Choisis le modèle</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(currentHunterModels).map(([modelId, modelData]) => {
              const isSelected = selectedModel === modelId;

              return (
                <button
                  key={modelId}
                  onClick={() => onModelChange(modelId)}
                  className={`relative aspect-[4/5] rounded-xl overflow-hidden transition-all ${
                    isSelected
                      ? 'ring-4 ring-pink-500 scale-105'
                      : 'ring-2 ring-purple-500/30 hover:ring-purple-400'
                  }`}
                >
                  <img
                    src={modelData.reference}
                    alt={modelData.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
                    <span className="text-white text-sm font-medium">
                      {modelData.name}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Preview */}
      {previewImage && (
        <div className="bg-purple-900/30 rounded-xl border border-purple-500/30 p-4">
          <h3 className="text-white font-semibold mb-3 text-center">Aperçu</h3>
          <div className="flex justify-center">
            <img
              src={previewImage}
              alt="Preview"
              className="max-h-48 rounded-lg shadow-lg"
            />
          </div>
          <div className="text-center mt-3">
            <span className="text-purple-200">
              {drawBeruModels[selectedHunter]?.name} - {currentModelData?.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HunterModelSelector;
