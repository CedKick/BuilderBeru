// SERNPopup.jsx - Component Dédié SERN
import React, { useRef, useEffect } from 'react';
import { dytextAnimateSERN } from '../useDytext';
import { mystSernMsg } from '../mystEggs';

const SERNPopup = ({ 
  showSernPopup, 
  onClose, 
  triggerFadeOutAllMusic,
  playingAudiosRef 
}) => {
  const popupRef = useRef(null);
  const dytextRef = useRef(null);

  // 🎬 AUTO-SCROLL quand le popup s'ouvre
  useEffect(() => {
    if (!showSernPopup || !popupRef.current) return;

    const scrollInterval = setInterval(() => {
      popupRef.current.scrollBy({ top: 20, behavior: 'smooth' });
    }, 300);

    return () => clearInterval(scrollInterval);
  }, [showSernPopup]);

  // 🎭 ANIMATION DU TEXTE
  useEffect(() => {
    if (showSernPopup) {
      try {
        const encoded = mystSernMsg.message[Math.floor(Math.random() * mystSernMsg.message.length)];
        const decoded = decodeURIComponent(escape(atob(encoded)));

        dytextAnimateSERN(dytextRef, decoded, 25, {
          onComplete: () => {
            setTimeout(() => {
              triggerFadeOutAllMusic?.();
            }, 13000);
            setTimeout(() => {
              onClose();
            }, 10000);
          },
        });
      } catch (error) {
        console.warn("💥 Le SERN a corrompu un message encodé :", error);
      }
    }
  }, [showSernPopup, triggerFadeOutAllMusic, onClose]);

  if (!showSernPopup) return null;

  return (
    <>
      {/* 🌫️ BLUR OVERLAY - TOUT LE SITE */}
      <div 
        className="fixed inset-0 z-[9998]"
        style={{
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          animation: 'sernAppear 0.5s ease-out'
        }}
      />
      
      {/* 🚨 POPUP PRINCIPALE */}
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
        <div
          className="relative bg-black border-4 border-red-500 rounded-xl shadow-2xl 
                     max-w-[800px] w-full max-h-[85vh] overflow-hidden
                     animate-bounce-gentle"
          style={{
            background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #000000 100%)',
            boxShadow: '0 0 50px rgba(255, 0, 0, 0.5), 0 0 100px rgba(255, 0, 0, 0.3), inset 0 0 50px rgba(255, 0, 0, 0.1)',
            border: '4px solid #ff0000',
            animation: 'sernPulse 2s infinite, sernSlideIn 0.8s ease-out'
          }}
        >
          {/* 🔴 HEADER DRAMATIQUE */}
          <div className="relative p-4 border-b-2 border-red-500 bg-gradient-to-r from-red-900/50 to-black/50">
            <div className="flex items-center justify-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
              <h1 className="text-red-400 font-bold text-xl tracking-widest animate-pulse">
                ⚠️ ALERTE SERN - INFRACTION N-404 ⚠️
              </h1>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
            </div>
            
            {/* 🎯 SCANNING EFFECT */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-scan"></div>
          </div>

          {/* 🖼️ IMAGE SECTION */}
          <div className="relative p-6 flex justify-center bg-gradient-to-b from-black/80 to-gray-900/80">
            <img loading="lazy"
              src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1747680569/SERN_ab7od6.png"
              alt="SERN - Sung Bobby Jones"
              className="max-w-full max-h-[300px] object-contain rounded-lg shadow-2xl"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(255, 0, 0, 0.5))',
                animation: 'sernGlow 3s ease-in-out infinite'
              }}
            />
            
            {/* 🌟 PARTICULES FLOTTANTES */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-[20%] left-[10%] w-2 h-2 bg-red-400 rounded-full animate-float-1"></div>
              <div className="absolute top-[60%] right-[15%] w-1 h-1 bg-red-300 rounded-full animate-float-2"></div>
              <div className="absolute bottom-[30%] left-[80%] w-1.5 h-1.5 bg-red-500 rounded-full animate-float-3"></div>
            </div>
          </div>

          {/* 📜 TEXTE ZONE AVEC AUTOSCROLL */}
          <div 
            ref={popupRef}
            className="relative p-6 bg-gradient-to-b from-gray-900/90 to-black/95 max-h-[40vh] overflow-y-auto scrollbar-custom scroll-smooth"
            id="sern-text-container"
          >
            <div
              ref={dytextRef}
              className="text-green-400 font-mono text-sm leading-relaxed tracking-wide 
                         whitespace-pre-wrap break-words overflow-wrap-anywhere 
                         min-h-[100px] max-w-full"
              style={{
                textShadow: '0 0 10px rgba(0, 255, 0, 0.5)',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                animation: 'textGlow 2s ease-in-out infinite alternate'
              }}
            />
            
            {/* 🔥 TERMINAL CURSOR */}
            <span className="inline-block w-2 h-4 bg-green-400 ml-1 animate-pulse"></span>
          </div>

          {/* ⚡ FOOTER EFFECTS */}
          <div className="relative p-4 border-t-2 border-red-500 bg-gradient-to-r from-black/90 to-red-900/30">
            <div className="flex justify-center items-center gap-4 text-red-300 text-xs">
              <span className="animate-pulse">● CONNEXION SÉCURISÉE</span>
              <span className="animate-bounce">● ANALYSE EN COURS</span>
              <span className="animate-ping">● VERDICT IMMINENT</span>
            </div>
            
            {/* 🎯 PROGRESS BAR FAKE */}
            <div className="mt-2 w-full bg-gray-800 rounded-full h-1 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-500 to-red-300 rounded-full animate-progress"></div>
            </div>
          </div>

          {/* 🔴 CORNER ACCENTS */}
          <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-red-500"></div>
          <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-red-500"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-red-500"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-red-500"></div>
        </div>
      </div>

      {/* 🎨 ANIMATIONS CSS */}
      <style jsx>{`
        @keyframes sernAppear {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(8px); }
        }
        
        @keyframes sernSlideIn {
          from { 
            opacity: 0; 
            transform: scale(0.8) translateY(-50px); 
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }
        
        @keyframes sernPulse {
          0%, 100% { box-shadow: 0 0 50px rgba(255, 0, 0, 0.5); }
          50% { box-shadow: 0 0 80px rgba(255, 0, 0, 0.8); }
        }
        
        @keyframes sernGlow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(255, 0, 0, 0.5)); }
          50% { filter: drop-shadow(0 0 40px rgba(255, 0, 0, 0.8)); }
        }
        
        @keyframes textGlow {
          from { text-shadow: 0 0 10px rgba(0, 255, 0, 0.5); }
          to { text-shadow: 0 0 20px rgba(0, 255, 0, 0.8); }
        }
        
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-180deg); }
        }
        
        @keyframes float-3 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(90deg); }
        }
        
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        
        .animate-scan {
          animation: scan 2s linear infinite;
        }
        
        .animate-progress {
          animation: progress 3s ease-in-out infinite;
        }
        
        .animate-float-1 {
          animation: float-1 4s ease-in-out infinite;
        }
        
        .animate-float-2 {
          animation: float-2 3s ease-in-out infinite 0.5s;
        }
        
        .animate-float-3 {
          animation: float-3 5s ease-in-out infinite 1s;
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
        
        .scrollbar-custom::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-custom::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.5);
          border-radius: 3px;
        }
        
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #ff0000, #cc0000);
          border-radius: 3px;
        }
        
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #ff3333, #ff0000);
        }
      `}</style>
    </>
  );
};

export default SERNPopup;