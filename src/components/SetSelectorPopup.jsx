import React from "react";
import setsBySlot from "../data/setsBySlot.json"; // assure-toi que ce chemin est correct
// import "./SetSelectorPopup.css"; // optionnel pour styles externes



const SetSelectorPopup = ({ slot, onSelect, onClose }) => {
  const sets = setsBySlot[slot] || [];

  return (
    <div className="absolute z-50 bg-black/90 backdrop-blur-sm border border-purple-700 rounded p-2 shadow-lg w-64 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-bold text-sm">Select Set for {slot}</h3>
        <button onClick={onClose} className="text-white text-sm hover:text-red-500">✖</button>
      </div>
      <ul className="grid grid-cols-1 gap-2">
        {sets.map((set, idx) => (
          <li
            key={idx}
            onClick={() => {
              onSelect(slot, set.name);
              onClose();
            }}
            className="flex items-center gap-2 p-1 rounded hover:bg-purple-800 cursor-pointer transition"
          >
            {set.icon && (
              <img
                src={set.icon}
                alt={set.name}
                className="w-5 h-5 object-contain"
              />
            )}
            <span className="text-white text-sm">{set.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SetSelectorPopup;