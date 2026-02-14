import React from "react";
import { elementData } from "../../data/itemData";

const ALL_ELEMENTS = Object.keys(elementData);

const ElementSelector = ({ selectedElements, setSelectedElements, maxElements = 2, onNext, onBack }) => {
  const toggleElement = (element) => {
    if (selectedElements.includes(element)) {
      setSelectedElements(selectedElements.filter((el) => el !== element));
    } else if (selectedElements.length < maxElements) {
      setSelectedElements([...selectedElements, element]);
    }
  };

  const isSelected = (element) => selectedElements.includes(element);

  return (
    <div className="p-6 bg-gray-900 rounded-xl text-white shadow-lg max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-6 text-center">
        Choisis {maxElements} élément{maxElements > 1 ? "s" : ""}
      </h2>

      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {ALL_ELEMENTS.map((element) => (
          <img
            key={element}
            src={elementData[element]}
            alt={element}
            title={element}
            onClick={() => toggleElement(element)}
            className={`w-[64px] h-[64px] cursor-pointer object-contain rounded-full transition-all
              ${isSelected(element)
                ? "ring-2 ring-yellow-400"
                : "opacity-80 hover:opacity-100 hover:scale-105"}`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm rounded bg-gray-700 hover:bg-gray-600"
        >
          Retour
        </button>

        <button
          onClick={onNext}
          disabled={selectedElements.length !== maxElements}
          className={`px-4 py-2 text-sm rounded bg-purple-600 hover:bg-purple-700 transition 
            ${selectedElements.length !== maxElements ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Étape suivante
        </button>
      </div>
    </div>
  );
};

export default ElementSelector;
