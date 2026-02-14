import React, { useState } from 'react';
import { sungData } from '../../data/itemData';
import HunterArtifacts from '../../pages/Hunters/HunterArtifacts';
import HunterCores from '../../pages/Hunters/HunterCores';

const currentMode = 'PoD';

export default function SungEditor({ onNext, onBack }) {
  const sung = sungData[0];
  const [config, setConfig] = useState({
    name: sung.name,
    leftArtifact: [],
    rightArtifact: [],
    core: null,
  });

  const [corePopupOpen, setCorePopupOpen] = useState(false);
  const [artifactPopup, setArtifactPopup] = useState({ side: null });

  const autoFillPreset = () => {
    const preset = sung.presets?.[currentMode];
    if (!preset) {
      alert(`Aucun preset pour le mode ${currentMode}`);
      return;
    }

    setConfig({
      ...config,
      leftArtifact: preset.leftArtifact || [],
      rightArtifact: preset.rightArtifact || [],
      core: preset.core || null,
    });
  };

  const handleArtifactSelect = (side, selected) => {
    setConfig((prev) => ({ ...prev, [side]: selected }));
    setArtifactPopup({ side: null });
  };

  const isConfigured =
    config.leftArtifact?.length > 0 &&
    config.rightArtifact?.length > 0 &&
    config.core &&
    config.core.Offensive &&
    config.core.Defensive &&
    config.core.Endurance;

  return (
    <div className="p-4 bg-gray-900 rounded-xl text-white shadow-lg max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Stuff de Sung Jin-Woo</h2>

      <div className="flex justify-around items-end gap-x-6">
        {/* Left Artifact */}
        <div
          onClick={() => setArtifactPopup({ side: 'leftArtifact' })}
          className={`w-32 h-48 border-4 rounded-lg flex flex-col items-center justify-center cursor-pointer ${
            config.leftArtifact?.length ? 'border-yellow-400' : 'border-white'
          }`}
        >
          {config.leftArtifact?.length ? (
            config.leftArtifact.map((artifact, i) => (
              <div key={i} className="flex flex-col items-center mb-1">
                <img src={artifact.src} alt={artifact.name} className="w-12 h-12 object-contain" />
                <span className="text-sm font-bold text-yellow-300">x{artifact.amount}</span>
              </div>
            ))
          ) : (
            <span className="text-lg text-gray-400">Left Artifacts</span>
          )}
        </div>

        {/* Core */}
        <div
          onClick={() => setCorePopupOpen(true)}
          className={`w-32 h-20 border-4 rounded-lg flex items-center justify-center cursor-pointer ${
            config.core ? 'border-yellow-400' : 'border-white'
          }`}
        >
          {config.core ? (
            <div className="flex gap-1">
              {Object.values(config.core).map((core) => (
                <img
                  key={core.name}
                  src={core.src}
                  alt={core.name}
                  className="w-8 h-8 object-contain"
                />
              ))}
            </div>
          ) : (
            'Core'
          )}
        </div>

        {/* Right Artifact */}
        <div
          onClick={() => setArtifactPopup({ side: 'rightArtifact' })}
          className={`w-32 h-48 border-4 rounded-lg flex flex-col items-center justify-center cursor-pointer ${
            config.rightArtifact?.length ? 'border-yellow-400' : 'border-white'
          }`}
        >
          {config.rightArtifact?.length ? (
            config.rightArtifact.map((artifact, i) => (
              <div key={i} className="flex flex-col items-center mb-1">
                <img src={artifact.src} alt={artifact.name} className="w-12 h-12 object-contain" />
                <span className="text-sm font-bold text-yellow-300">x{artifact.amount}</span>
              </div>
            ))
          ) : (
            <span className="text-lg text-gray-400">Right Artifacts</span>
          )}
        </div>
      </div>

      <div className="text-center mt-4">
        <p className="text-lg font-semibold">Sung Jin-Woo</p>
        <button
          onClick={autoFillPreset}
          className="text-sm underline text-blue-400 hover:text-blue-300 mt-1"
        >
          Auto remplir preset
        </button>
      </div>

      {/* Boutons bas */}
      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="text-sm px-4 py-2 rounded bg-gray-600 hover:bg-gray-500"
        >
          Retour
        </button>

        <button
          onClick={() => isConfigured && onNext(config)}
          disabled={!isConfigured}
          className={`px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 transition ${
            !isConfigured ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Étape suivante
        </button>
      </div>

      {/* Popups */}
      {corePopupOpen && (
        <HunterCores
          onClose={() => setCorePopupOpen(false)}
          onSelect={(core) => {
            setConfig((prev) => ({ ...prev, core }));
            setCorePopupOpen(false);
          }}
        />
      )}

      {artifactPopup.side && (
        <HunterArtifacts
          side={artifactPopup.side === 'leftArtifact' ? 'L' : 'R'}
          onConfirm={(selected) => handleArtifactSelect(artifactPopup.side, selected)}
          onClose={() => setArtifactPopup({ side: null })}
        />
      )}
    </div>
  );
}
