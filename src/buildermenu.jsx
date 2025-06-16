import React from 'react';
import { Link } from 'react-router-dom';

export default function BuilderMenu({ isOpen }) {
  return (
    <div
      className={`h-full bg-[#1a1a2a] text-white z-50 transition-all duration-300 ${
        isOpen ? 'w-40' : 'w-3'
      }`}
    >
      <div className="flex flex-col mt-10 px-2 gap-2">
        {isOpen && (
          <>
            <Link to="/" className="hover:text-purple-400 font-semibold">Accueil</Link>
            <Link to="/build" className="hover:text-purple-400">BUILD</Link>

            <h4 className="text-xs text-purple-400 mt-4 mb-1 uppercase tracking-widest">Guide</h4>

            <Link to="/pod" className="hover:text-purple-400">PoD</Link>
            <span className="text-gray-500 cursor-not-allowed">BoT (coming soon)</span>
            <span className="text-gray-500 cursor-not-allowed">BdG (coming soon)</span>
            <Link to="/guide-editor" className="hover:text-purple-400">Guide Editor</Link>
          </>
        )}
      </div>
    </div>
  );
}
  