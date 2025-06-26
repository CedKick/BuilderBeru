import React from 'react';
import { Link } from 'react-router-dom';

export default function BuilderMenu({ isOpen }) {
  return (
    <div
      className={`h-full bg-[#1a1a2a] text-white z-50 transition-all duration-300 ${
        isOpen ? 'w-40' : 'w-3'
      }`}
    >
      <style jsx="true">{`
        @keyframes golden-glow {
          0%, 100% { 
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.3);
            border-color: rgba(255, 215, 0, 0.7);
          }
          50% { 
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.5);
            border-color: rgba(255, 215, 0, 1);
          }
        }

        .hall-of-flame-link {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
          border: 2px solid rgba(255, 215, 0, 0.7);
          border-radius: 8px;
          animation: golden-glow 2s infinite;
          transition: all 0.3s ease;
          padding: 8px 12px;
          display: block;
          text-decoration: none;
          color: #ffd700;
          font-weight: bold;
        }

        .hall-of-flame-link:hover {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1));
          transform: translateY(-2px);
          box-shadow: 0 0 25px rgba(255, 215, 0, 1), 0 0 40px rgba(255, 215, 0, 0.6);
        }
      `}</style>

      <div className="flex flex-col mt-10 px-2 gap-2">
        {isOpen && (
          <>
            <Link to="/" className="hover:text-purple-400 font-semibold">Accueil</Link>
            <Link to="/build" className="hover:text-purple-400">BUILD</Link>
            
            {/* 🏆 HALL OF FLAME AVEC ANIMATION DORÉE */}
            <Link to="/hall-of-flame" className="hall-of-flame-link">
              🏆 Hall Of Flame
            </Link>

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