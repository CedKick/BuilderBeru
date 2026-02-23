import React, { useState } from 'react';
import { runesData } from '../../data/itemData';

const SungSkillSelector = ({ onNext, onBack }) => {
  const [selectedSkills, setSelectedSkills] = useState([]);

  const basicSkills = runesData.filter((r) => r.class === 'basicSkills');

  const toggleSkill = (skill) => {
    const isAlreadySelected = selectedSkills.find((s) => s.name === skill.name);

    if (isAlreadySelected) {
      // Unselect if already selected
      setSelectedSkills(selectedSkills.filter((s) => s.name !== skill.name));
    } else {
      if (selectedSkills.length >= 2) {
        // Remove the oldest one (first in the array) and add the new one
        setSelectedSkills([...selectedSkills.slice(1), skill]);
      } else {
        setSelectedSkills([...selectedSkills, skill]);
      }
    }
  };

  const canProceed = selectedSkills.length === 2;

  const groupedByClassName = basicSkills.reduce((acc, skill) => {
    if (!acc[skill.className]) acc[skill.className] = [];
    acc[skill.className].push(skill);
    return acc;
  }, {});

  return (
    <div className="bg-slate-800 p-4 rounded-xl shadow-lg text-white">
      <h2 className="text-center text-xl font-bold mb-4">Choisis 2 compétences pour Sung</h2>

      <div className="grid grid-cols-3 gap-2">
        {Object.entries(groupedByClassName).map(([className, skills]) => (
          <div
            key={className}
            className="bg-slate-800 rounded-xl p-3 shadow-md flex flex-col items-center"
          >
            <h3 className="text-sm font-semibold text-center text-white mb-2">{className}</h3>
            <div className="flex flex-wrap justify-center gap-1">
              {skills.map((skill) => {
                const isSelected = selectedSkills.some((s) => s.name === skill.name);
                return (
                  <div
                    key={skill.name}
                    className={`p-1 rounded-lg border transition-all duration-150 w-fit cursor-pointer ${
                      isSelected ? 'border-yellow-400 bg-yellow-200/10' : 'border-transparent'
                    }`}
                    onClick={() => toggleSkill(skill)}
                    title={`${skill.name} (${skill.element} - ${skill.type})`}
                  >
                    <img loading="lazy"
                      src={skill.src}
                      alt={`${skill.name} ${skill.element} ${skill.type} ${skill.className}`}
                      className="w-11 h-11 object-contain"
                    />
                    <p className="text-[10px] text-center mt-1 text-white truncate w-11">
                      {skill.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={onBack}
          className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded shadow-md"
        >
          Retour
        </button>

        <button
          disabled={!canProceed}
          onClick={() => onNext(selectedSkills)}
          className={`px-6 py-2 rounded text-white font-semibold transition duration-200 ${
            canProceed
              ? 'px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 transition'
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          Étape suivante
        </button>
      </div>
    </div>
  );
};

export default SungSkillSelector;
