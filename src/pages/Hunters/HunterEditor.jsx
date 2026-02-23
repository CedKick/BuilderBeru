import React, { useState } from 'react';
import { artifactData, coresData } from '../../data/itemData';
import HunterCores from './HunterCores';
import HunterArtifacts from './HunterArtifacts';
import { characters } from '../../data/itemData';

const currentMode = 'PoD';

const HunterEditor = ({ selectedHunters, onNext, onPrevious }) => {
  const [hunterConfigs, setHunterConfigs] = useState(
    selectedHunters.map((hunter) => ({
      name: hunter.name,
      img: hunter.img,
      leftArtifact: [],
      rightArtifact: [],
      core: null,
    }))
  );

  const [corePopupIndex, setCorePopupIndex] = useState(null);
  const [artifactPopup, setArtifactPopup] = useState({ index: null, side: null });

  const autoFillPreset = (index) => {
    const hunterName = characters[index]?.name;
    const charData = characters.find((c) => c.name === hunterName);

    if (!charData?.presets?.[currentMode]) {
      alert(`Aucun preset pour ${hunterName} en mode ${currentMode}`);
      return;
    }

    const preset = charData.presets[currentMode];
    setHunterConfigs((prev) =>
      prev.map((conf, i) =>
        i === index
          ? {
              ...conf,
              leftArtifact: preset.leftArtifact || [],
              rightArtifact: preset.rightArtifact || [],
              core: preset.core || null,
            }
          : conf
      )
    );
  };

  const handleArtifactSelect = (index, side, selectedArtifact) => {
    setHunterConfigs((prev) =>
      prev.map((conf, i) =>
        i === index ? { ...conf, [side]: selectedArtifact } : conf
      )
    );
    setArtifactPopup({ index: null, side: null });
  };

  const allHuntersConfigured = hunterConfigs.every(
    (hunter) =>
      hunter.leftArtifact.length > 0 &&
      hunter.rightArtifact.length > 0 &&
      hunter.core &&
      hunter.core.Offensive &&
      hunter.core.Defensive &&
      hunter.core.Endurance
  );

  return (
    <div className="bg-zinc-900 rounded-xl p-4 flex flex-col items-center gap-4 mt-2">
      <div className="flex flex-wrap justify-center gap-6">
        {hunterConfigs.map((hunter, index) => (
          <div key={index} className="flex flex-col items-center gap-y-2">
            <div className="flex gap-x-2 items-end">
              {/* Left Artifact */}
              <div
                onClick={() => setArtifactPopup({ index, side: 'leftArtifact' })}
                className={`w-28 h-40 border-2 rounded-lg flex flex-col items-center justify-center cursor-pointer 
                  ${hunter.leftArtifact.length > 0 ? 'border-yellow-400' : 'border-white'}
                `}
              >
                {hunter.leftArtifact.length > 0 ? (
                  hunter.leftArtifact.map((artifact, i) => (
                    <div key={i} className="flex flex-col items-center mb-1">
                      <img loading="lazy" src={artifact.src} alt={artifact.name} className="w-10 h-10 object-contain" />
                      <span className="text-sm text-yellow-300 font-bold">x{artifact.amount}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">Left Artifacts</span>
                )}
              </div>

              {/* Core */}
              <div className="flex flex-col items-center">
                <img loading="lazy" src={hunter.img} alt={hunter.name} className="w-20 h-20 object-contain" />
                <div
                  onClick={() => setCorePopupIndex(index)}
                  className={`w-28 h-16 mt-2 border-2 rounded-lg flex items-center justify-center cursor-pointer 
                    ${hunter.core ? 'border-yellow-400' : 'border-white'}
                  `}
                >
                  {hunter.core ? (
                    <div className="flex gap-1">
                      {Object.values(hunter.core).map((core) => (
                        <img loading="lazy" key={core.name} src={core.src} alt={core.name} className="w-6 h-6 object-contain" />
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">Core</span>
                  )}
                </div>
              </div>

              {/* Right Artifact */}
              <div
                onClick={() => setArtifactPopup({ index, side: 'rightArtifact' })}
                className={`w-28 h-40 border-2 rounded-lg flex flex-col items-center justify-center cursor-pointer 
                  ${hunter.rightArtifact.length > 0 ? 'border-yellow-400' : 'border-white'}
                `}
              >
                {hunter.rightArtifact.length > 0 ? (
                  hunter.rightArtifact.map((artifact, i) => (
                    <div key={i} className="flex flex-col items-center mb-1">
                      <img loading="lazy" src={artifact.src} alt={artifact.name} className="w-10 h-10 object-contain" />
                      <span className="text-sm text-yellow-300 font-bold">x{artifact.amount}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">Right Artifacts</span>
                )}
              </div>
            </div>
            <div className="mt-1 text-base font-semibold text-white">{hunter.name}</div>
            <button onClick={() => autoFillPreset(index)} className="text-sm text-blue-300 hover:underline">
              Auto remplir preset
            </button>
          </div>
        ))}
      </div>

      <div className="w-full flex justify-between mt-4">
        <button
          onClick={onPrevious}
          className="bg-zinc-800 text-white py-1 px-4 rounded-lg hover:bg-zinc-700"
        >
          Retour
        </button>
        <button
          onClick={() => onNext(hunterConfigs)}
          disabled={!allHuntersConfigured}
          className={`py-1 px-4 rounded-lg font-bold shadow-md ${
            allHuntersConfigured
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
              : 'bg-zinc-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          Étape suivante
        </button>
      </div>

      {corePopupIndex !== null && (
        <HunterCores
          onClose={() => setCorePopupIndex(null)}
          onSelect={(selectedCores) =>
            setHunterConfigs((prev) =>
              prev.map((conf, i) => (i === corePopupIndex ? { ...conf, core: selectedCores } : conf))
            )
          }
        />
      )}

      {artifactPopup.index !== null && (
        <HunterArtifacts
          side={artifactPopup.side === 'leftArtifact' ? 'L' : 'R'}
          onConfirm={(selectedArtifact) =>
            handleArtifactSelect(artifactPopup.index, artifactPopup.side, selectedArtifact)
          }
          onClose={() => setArtifactPopup({ index: null, side: null })}
        />
      )}
    </div>
  );
};

export default HunterEditor;
