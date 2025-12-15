// src/components/DrawBeru/MultiplayerUI/HunterModelSelector.jsx
// Sélection du Hunter et du Modèle
// Par Kaisel pour le Monarque des Ombres

import React, { useState, useEffect } from 'react';
import {
  drawBeruModels,
  getHunterModels,
  getModel,
  getAvailableThemes,
  getHuntersByTheme
} from '../../../pages/DrawBeru/config/models';

const HunterModelSelector = ({
  selectedHunter,
  selectedModel,
  onHunterChange,
  onModelChange,
}) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(null);

  // Liste des thèmes disponibles
  const themes = getAvailableThemes();

  // Liste des hunters filtrés par thème
  const hunters = getHuntersByTheme(selectedTheme);
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
      {/* Sélection Thème */}
      <div>
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <span>🎨</span>
          <span>Choisis un Thème</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Bannière "Tous" */}
          <button
            onClick={() => setSelectedTheme(null)}
            className={`relative h-16 rounded-xl overflow-hidden transition-all ${
              selectedTheme === null
                ? 'ring-4 ring-purple-500 scale-105 z-10'
                : 'ring-2 ring-purple-500/30 hover:ring-purple-400 hover:scale-102'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-800" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-lg drop-shadow-lg">
                Tous
              </span>
            </div>
            {selectedTheme === null && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-xs">✓</span>
              </div>
            )}
          </button>

          {/* Bannières des thèmes */}
          {themes.map((theme) => {
            const isSelected = selectedTheme === theme.id;
            const hasImage = theme.image !== null;

            return (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`relative h-16 rounded-xl overflow-hidden transition-all ${
                  isSelected
                    ? 'ring-4 ring-purple-500 scale-105 z-10'
                    : 'ring-2 ring-purple-500/30 hover:ring-purple-400 hover:scale-102'
                }`}
              >
                {/* Fond: image ou violet */}
                {hasImage ? (
                  <>
                    <img
                      src={theme.image}
                      alt={theme.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-800" />
                )}

                {/* Texte */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-lg drop-shadow-lg">
                    {theme.name}
                  </span>
                </div>

                {/* Check si sélectionné */}
                {isSelected && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-xs">✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sélection Personnage */}
      <div>
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <span>🎯</span>
          <span>Choisis ton Personnage</span>
          {selectedTheme && (
            <span className="text-purple-400 text-sm font-normal">
              ({hunters.length} disponible{hunters.length > 1 ? 's' : ''})
            </span>
          )}
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
