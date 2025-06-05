import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function BuilderMenu() {
  const [show, setShow] = useState(false);

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-[#1a1a2a] text-white z-50 transition-all duration-300 ${
        show ? 'w-30' : 'w-3'
      }`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <div className="flex flex-col mt-10 px-2 gap-2">
        {show && (
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
