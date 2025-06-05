import React, { useState } from 'react';
import ElementSelector from './ElementSelector';
import SungStatAllocator from '../../pages/Sung/SungStatAllocator';
import SungSkillSelector from '../../pages/Sung/SungSkillSelector';
import SungCollapseDeathSelector from '../../pages/Sung/SungCollapseDeathSelector';
import HunterSelector from '../../pages/Hunters/HunterSelector';
import SungBlessingSelector from '../../pages/Sung/SungBlessingSelector';
import SungWeaponSelector from '../../pages/Sung/SungWeaponSelector';
import ShadowSelector from '../../pages/Shadows/ShadowSelector';
import FinalStep from './FinalStep';
import PodPreviewLayout from './PodPreviewLayout';
import { characters } from '../../data/itemData';
import HunterEditor from '../../pages/Hunters/HunterEditor';
import SungEditor from '../../pages/Sung/SungEditor';
import StepHeader from './StepHeader';

export default function FormPod() {
  const [step, setStep] = useState(0);
  const [selectedElements, setSelectedElements] = useState([]);
  const [testDateRange, setTestDateRange] = useState(null);
  const [sungStats, setSungStats] = useState({
    strength: 19,
    vitality: 10,
    intelligence: 10,
    perception: 10,
    agility: 10,
  });
  const [sungSkills, setSungSkills] = useState([]);
  const [selectedHunters, setSelectedHunters] = useState([]);
  const [sungCollapseDeath, setSungCollapseDeath] = useState([]);
  const [sungBlessings, setSungBlessings] = useState([]);
  const [selectedShadows, setSelectedShadows] = useState([]);
  const [weaponsSelected, setWeaponsSelected] = useState([]);
  const [pseudo, setPseudo] = useState('');
  const [score, setScore] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [level, setLevel] = useState('');
  const [configuredHunters, setConfiguredHunters] = useState([]);
  const [sungLeftArtifact, setSungLeftArtifact] = useState([]);
  const [sungRightArtifact, setSungRightArtifact] = useState([]);
  const [sungCore, setSungCore] = useState(null);
  const [validatedSteps, setValidatedSteps] = useState([]);
  const [finalFormData, setFinalFormData] = useState([]);
  const fullSelectedHunters = selectedHunters.map((index) => characters[index]);
  



  const handleNextStep = (value = null) => {
    if (value) setConfiguredHunters(value);

    // Validation de l'étape actuelle
    if (!validatedSteps.includes(step)) {
      setValidatedSteps((prev) => [...prev, step]);
    }

    // Passage à l'étape suivante
    setStep((prev) => prev + 1);
  };

  const handlePreviousStep = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleFinalConfirm = (basicInfo) => {
    const fullData = {
      ...basicInfo,               // {pseudo, score, videoUrl, level, testDateRange}
      // guild,
      sungStats,
      sungLeftArtifact,
      sungRightArtifact,
      sungCore,
      weaponsSelected,
      sungSkills,
      sungBlessings,
      sungCollapseDeath,
      selectedHunters,
      selectedShadows,
      selectedElements,
      fullSelectedHunters
      // boss,                      // optionnel, valeur par défaut = 'Ennio'
    };

    console.log('✅ JSON final prêt à l\'export ou preview :', fullData);
    setFinalFormData(fullData);  // stocke-le si tu veux l'utiliser ailleurs (comme dans PodPreviewLayout)
  };

  const nextStepReady = (() => {
    switch (step) {
      case 0:
        return selectedElements.length === 2;
      case 1:
        return Object.values(sungStats).every((val) => val > 0);
      case 2:
        return (
          sungLeftArtifact?.length > 0 &&
          sungRightArtifact?.length > 0 &&
          sungCore &&
          sungCore.Offensive &&
          sungCore.Defensive &&
          sungCore.Endurance
        );
      case 3:
        return weaponsSelected.length > 0; // au moins une arme sélectionnée
      case 4:
        return sungSkills.length === 2; // exactement deux skills
      default:
        return false;
    }
  })();




  const stepsLabels = [
    'Éléments',
    'Attribution des Stats de Sung',
    'Sung\'s Artifacts',
    'Weapons',
    'Skills',
    'SKills 2',
    'Blessing Stones',
    'Hunters',
    'Edition Hunters',
    'Shadows',
    'Finalisation'
  ];
  const stepIsReady = (() => {
    switch (step) {
      case 0:
        return selectedElements.length === 2; // Tu fixes 2 ici, car maxElements n'existe pas ici
      case 1:
        return Object.values(sungStats).every((val) => val > 0);
      case 2:
        return sungLeftArtifact?.length > 0 && sungRightArtifact?.length > 0 && sungCore !== null;
      default:
        return false;
    }
  })();

  const stepComponents = [
    <ElementSelector
      selectedElements={selectedElements}
      setSelectedElements={setSelectedElements}
      onNext={handleNextStep}
      maxElements={2}
      validatedSteps={validatedSteps}
      currentStep={step}
    />,
    <SungStatAllocator stats={sungStats} setStats={setSungStats} onNext={handleNextStep} />,
    <SungEditor
      onNext={({ leftArtifact, rightArtifact, core }) => {
        setSungLeftArtifact(leftArtifact);
        setSungRightArtifact(rightArtifact);
        setSungCore(core);
        handleNextStep();
      }}
    />,
    <SungWeaponSelector onNext={(weapons) => {
      setWeaponsSelected(weapons);
      handleNextStep();
    }} />,
    <SungSkillSelector onNext={(selectedRunes) => {
      setSungSkills(selectedRunes);
      handleNextStep();
    }} />,
    <SungCollapseDeathSelector onNext={(sungCollapseDeath) => {
      setSungCollapseDeath(sungCollapseDeath);
      handleNextStep();
    }} />,
    <SungBlessingSelector onNext={(blessings) => {
      setSungBlessings(blessings);
      handleNextStep();
    }} />,
    <HunterSelector selectedHunters={selectedHunters} setSelectedHunters={setSelectedHunters} onNext={handleNextStep} />,
    <HunterEditor
      selectedHunters={fullSelectedHunters}
      onNext={(configured) => handleNextStep(configured)}
    />,
    <ShadowSelector onNext={(shadow) => {
      setSelectedShadows(shadow); // ✅ Appel correct de la fonction
      handleNextStep();
    }} />

  ];

  return (
    <div className="space-y-6 max-w-7xl w-full mx-auto px-4">
      <StepHeader
        steps={stepsLabels}
        currentStep={step}
        onStepChange={setStep}
        validatedSteps={validatedSteps}
        nextStepReady={stepIsReady}
      />

      {step < stepComponents.length ? (
        stepComponents[step]
      ) : (
        <div className="w-full flex flex-col gap-6 p-4">
          <div className="w-full">
           <FinalStep
  pseudo={pseudo}
  setPseudo={setPseudo}
  score={score}
  setScore={setScore}
  videoUrl={videoUrl}
  setVideoUrl={setVideoUrl}
  level={level}
  setLevel={setLevel}
  testDateRange={testDateRange}
  setTestDateRange={setTestDateRange}
  onConfirm={handleFinalConfirm}
  selectedElements={selectedElements}
  sungStats={sungStats}
  sungLeftArtifact={sungLeftArtifact}
  sungRightArtifact={sungRightArtifact}
  sungCore={sungCore}
  weaponsSelected={weaponsSelected}
  sungSkills={sungSkills}
  sungCollapseDeath={sungCollapseDeath}
  sungBlessings={sungBlessings}
  selectedHunters={configuredHunters}
  fullSelectedHunters={fullSelectedHunters}
  selectedShadows={selectedShadows}
/>

          </div>
          <div className="lg:w-full w-full">
            <PodPreviewLayout
              formData={{
                pseudo,
                score,
                videoUrl,
                level,
                sungStats,
                sungCore,
                sungLeftArtifact,
                sungRightArtifact,
                weaponsSelected,
                sungSkills,
                sungCollapseDeath,
                sungBlessings,
                selectedHunters: configuredHunters.length > 0 ? configuredHunters : fullSelectedHunters,
                fullSelectedHunters:fullSelectedHunters,
                selectedShadows,
                boss: "Ennio",
                testDateRange,
                selectedElements, // 👈 ici
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
