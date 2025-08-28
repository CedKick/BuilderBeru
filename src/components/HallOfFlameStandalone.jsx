// HallOfFlameStandalone.jsx - 🏆 PAGE STANDALONE MOBILE-FRIENDLY BY KAISEL v2.0
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HallOfFlamePage from './HallOfFlamePage';

const HallOfFlameStandalone = () => {
  const navigate = useNavigate();
  
  // Function pour afficher les messages (version simplifiée adaptée mobile)
  const [showTankMessage] = useState(() => {
    return (message, isSuccess, source) => {
      console.log(`${source}: ${message}`);
      
      // Toast simple pour mobile
      if (window.innerWidth < 768) {
        // Toast mobile minimaliste
        const toast = document.createElement('div');
        toast.style.cssText = `
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.9);
          color: #ffd700;
          padding: 12px 20px;
          border-radius: 8px;
          border: 1px solid #ffd700;
          font-size: 14px;
          z-index: 99999;
          max-width: 90vw;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 3000);
      }
    };
  });

  // Characters data complet pour éviter les erreurs
  const characters = {
    minnie: { 
      name: "Minnie", 
      element: "Dark", 
      class: "Monarch",
      portrait: "🌊"
    },
    soyeon: { 
      name: "Soyeon", 
      element: "Wind", 
      class: "Support",
      portrait: "🌊"
    },
    yuqi: { 
      name: "Yuqi",
      element: "Fire", 
      class: "Assassin",
      portrait: "🌊"
    },
    jinwoo: { 
      name: "Jinwoo", 
      element: "None", 
      class: "Monarch",
      portrait: "🌊"
    },
    jinah: { 
      name: "Jinah", 
      element: "Wind", 
      class: "Support",
      portrait: "🌊"
    },
    shuhua: { 
      name: "Shuhua", 
      element: "Water", 
      class: "Assassin",
      portrait: "🌊"
    },
    miyeon: { 
      name: "Miyeon", 
      element: "Light", 
      class: "Fighter",
      portrait: "🌊"
    },
    niermann: { 
      name: "Lennart Niermann", 
      element: "Wind", 
      class: "Fighter",
      portrait: "🌊"
    },
    kanae: { 
      name: "Tawata Kanae", 
      element: "Fire", 
      class: "Assassin",
      portrait: "🔥"
    },
    jo: { 
      name: "Patti Jo", 
      element: "Light", 
      class: "Hunter",
      portrait: "☀️"
    },
    gabriel: { 
      name: "Gabriel", 
      element: "Dark", 
      class: "Mage",
      portrait: "🌙"
    },
    sasha: { 
      name: "Sasha", 
      element: "Wind", 
      class: "Support",
      portrait: "💨"
    },
    lynn: { 
      name: "Lynn", 
      element: "Fire", 
      class: "Fighter",
      portrait: "🔥"
    },
    claire: { 
      name: "Claire", 
      element: "Water", 
      class: "Mage",
      portrait: "💧"
    },
    // Ajoute d'autres personnages selon tes besoins
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* CSS Mobile-First pour Hall of Flame */}
      <style jsx="true">{`
        /* Mobile-first responsive fixes */
        @media (max-width: 768px) {
          .hall-page {
            padding: 0 !important;
          }
          
          .hunter-card {
            margin: 0 4px !important;
            padding: 16px !important;
          }
          
          .details-content {
            margin: 8px !important;
            max-height: 95vh !important;
            border-radius: 12px !important;
          }
          
          .screenshot-gallery {
            display: none !important; /* Masquer screenshots sur mobile */
          }
          
          .artifact-grid {
            grid-template-columns: 1fr !important; /* Une colonne sur mobile */
          }
          
          /* Header mobile optimisé */
          .mobile-header {
            padding: 12px 16px !important;
          }
          
          .mobile-header h1 {
            font-size: 1.5rem !important;
          }
          
          /* Filtres mobile stack */
          .mobile-filters {
            flex-direction: column !important;
            gap: 12px !important;
          }
          
          .mobile-filters select,
          .mobile-filters input {
            width: 100% !important;
            font-size: 16px !important; /* Évite le zoom iOS */
          }
          
          /* Cards mobile optimisées */
          .mobile-card {
            border-radius: 12px !important;
            margin-bottom: 16px !important;
          }
          
          /* Stats mobile plus compactes */
          .mobile-stats {
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
          }
          
          .mobile-stats > div {
            padding: 12px !important;
            font-size: 14px !important;
          }
          
          /* Modal mobile full-screen */
          .mobile-modal {
            margin: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            border-radius: 0 !important;
          }
          
          /* Pagination mobile */
          .mobile-pagination {
            flex-wrap: wrap !important;
            gap: 8px !important;
          }
          
          .mobile-pagination button {
            font-size: 14px !important;
            padding: 8px 12px !important;
          }
        }
        
        /* Tablet adjustments */
        @media (min-width: 768px) and (max-width: 1024px) {
          .hunter-card {
            padding: 20px !important;
          }
          
          .artifact-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        /* Hide screenshots globally - for verification only */
        .screenshot-section,
        .screenshot-gallery,
        .screenshot-item {
          display: none !important;
        }
        
        /* Mobile touch improvements */
        .mobile-touch {
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        
        /* Smooth scrolling on mobile */
        .mobile-scroll {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }
        
        /* Better mobile typography */
        @media (max-width: 768px) {
          body {
            font-size: 14px;
            line-height: 1.4;
          }
          
          h1, h2, h3 {
            line-height: 1.2;
          }
          
          .text-xs {
            font-size: 11px !important;
          }
          
          .text-sm {
            font-size: 13px !important;
          }
          
          .text-base {
            font-size: 14px !important;
          }
          
          .text-lg {
            font-size: 16px !important;
          }
          
          .text-xl {
            font-size: 18px !important;
          }
          
          .text-2xl {
            font-size: 20px !important;
          }
          
          .text-3xl {
            font-size: 24px !important;
          }
        }
        
        /* Safe area for notch devices */
        @supports (padding: max(0px)) {
          .safe-top {
            padding-top: max(16px, env(safe-area-inset-top));
          }
          
          .safe-bottom {
            padding-bottom: max(16px, env(safe-area-inset-bottom));
          }
        }
      `}</style>

      <HallOfFlamePage
        onClose={() => navigate('/')} // Retour à l'accueil
        showTankMessage={showTankMessage}
        characters={characters}
        onNavigateToBuilder={() => navigate('/build')}
        
        // Props optionnelles (vides pour la version standalone)
        selectedCharacter={null}
        currentStats={{}}
        currentArtifacts={{}}
        statsFromArtifacts={{}}
        currentCores={{}}
        currentGems={{}}
        currentWeapon={{}}
        
        // Props additionnelles pour éviter les erreurs
        builderInfo={{}}
        timestamp={new Date().toISOString()}
        
        // Mode standalone
        isStandalone={true}
      />
    </div>
  );
};

export default HallOfFlameStandalone;