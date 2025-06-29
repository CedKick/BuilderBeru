import React from "react";
import setsBySlot from "../data/setsBySlot.json";

const SetSelectorPopup = ({ slot, onSelect, onClose }) => {
  const sets = setsBySlot[slot] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-black/90 border border-purple-700 rounded p-2 shadow-lg 
                      w-full max-w-xs sm:max-w-sm md:max-w-md 
                      max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-white font-bold text-sm">
            Select Set for {slot}
          </h3>
          <button
            onClick={onClose}
            className="text-white text-sm hover:text-red-500"
          >
            ✖
          </button>
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
    </div>
  );
};

export default SetSelectorPopup;
