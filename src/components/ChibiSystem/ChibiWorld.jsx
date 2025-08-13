// src/components/ChibiSystem/ChibiWorld.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ChibiCanvas from './ChibiCanvas';
import ChibiInventory from './ChibiInventory';
import ChibiGacha from './ChibiGacha';
import ChibiBubble from '../ChibiBubble';
import './ChibiWorld.css';

const ChibiWorld = () => {
    const { t } = useTranslation();

    // 🎮 États principaux
    const [showGacha, setShowGacha] = useState(false);
    const [activeChibis, setActiveChibis] = useState(['chibi_beru_001', 'chibi_tank_001']);
    const [shadowCoins, setShadowCoins] = useState(100);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [chibiMessage, setChibiMessage] = useState(null);
    const [selectedChibi, setSelectedChibi] = useState(null);
    const [activeAccount, setActiveAccount] = useState('Compte1');

    // 🗺️ Configuration de la map offline
    const worldData = {
        background: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755091230/BuilderBeru_enclos_wgtjm5.jpg',
        name: 'BuilderBeru Sanctuary',
        maxChibis: 5
    };

    // 💾 Charger les données du localStorage
    useEffect(() => {
        const storedData = localStorage.getItem('builderberu_users');
        if (storedData) {
            const data = JSON.parse(storedData);
            const accounts = data?.user?.accounts || {};

            // Déterminer le compte actif
            const firstAccount = Object.keys(accounts)[0] || 'Compte1';
            setActiveAccount(firstAccount);

            // Charger les données chibi si elles existent
            const accountData = accounts[firstAccount];
            if (accountData?.chibis) {
                setActiveChibis(accountData.chibis.activeEnclos || ['chibi_beru_001']);
                setShadowCoins(accountData.chibis.currency?.shadowCoins || 100);
                setCurrentStreak(accountData.chibis.streakData?.currentStreak || 0);
            }
        }
    }, []);

    // 💾 Sauvegarder les changements
    const saveToLocalStorage = (newData) => {
        const storedData = localStorage.getItem('builderberu_users');
        const data = storedData ? JSON.parse(storedData) : { user: { accounts: {} } };

        // Mettre à jour les données chibi
        if (!data.user.accounts[activeAccount]) {
            data.user.accounts[activeAccount] = {};
        }

        data.user.accounts[activeAccount].chibis = {
            ...data.user.accounts[activeAccount].chibis,
            ...newData
        };

        localStorage.setItem('builderberu_users', JSON.stringify(data));
    };

    // Dans ChibiWorld.jsx, modifie la gestion du message
const handleChibiClick = (chibiId, realPosition) => {
  setSelectedChibi(chibiId);
  
  const messages = {
    'chibi_beru_001': [
      "Kiiiek ! Le Monarque est le meilleur !",
      "Tu veux voir ma collection ?",
      "Je suis le plus fort des soldats !"
    ],
    'chibi_tank_001': [
      "Je protège cet enclos !",
      "As-tu fait tes dailies ?",
      "Bob m'observe... 😰"
    ],
    'chibi_kaisel_001': [
      "Optimisation en cours...",
      "Performance +++ !",
      "Ce code peut être amélioré."
    ]
  };

  const chibiMessages = messages[chibiId] || ["..."];
  const randomMessage = chibiMessages[Math.floor(Math.random() * chibiMessages.length)];

  setChibiMessage({
    text: randomMessage,
    position: realPosition || { x: window.innerWidth / 2, y: 100 },
    chibiType: chibiId.split('_')[1]
  });
  
  // AJOUTER CE TIMER POUR FAIRE DISPARAÎTRE LE MESSAGE
  setTimeout(() => {
    setChibiMessage(null);
  }, 5000); // Disparaît après 5 secondes
};

    // 🎰 Gestion du pull
    const handlePull = (newChibi) => {
        if (shadowCoins >= 100) {
            setShadowCoins(prev => prev - 100);
            // Ajouter le nouveau chibi si pas déjà présent et si place disponible
            if (!activeChibis.includes(newChibi.id) && activeChibis.length < worldData.maxChibis) {
                const newActiveChibis = [...activeChibis, newChibi.id];
                setActiveChibis(newActiveChibis);

                // Sauvegarder
                saveToLocalStorage({
                    activeEnclos: newActiveChibis,
                    currency: { shadowCoins: shadowCoins - 100 }
                });
            }
        }
    };

    return (
        <div className="chibi-world-container">
            {/* 🔙 Bouton retour */}
            <Link to="/" className="back-button">
                <button className="absolute top-4 left-4 z-50 flex items-center gap-2 
                         px-4 py-2 bg-purple-900/50 border border-purple-500 
                         rounded-lg hover:bg-purple-800/50 transition-colors">
                    <span>←</span>
                    <span>{t('common.back', 'Retour')}</span>
                </button>
            </Link>

            {/* 📊 Header avec infos */}
            <div className="chibi-header">
                <div className="currency-display flex items-center gap-2 
                        bg-purple-900/30 px-4 py-2 rounded-full">
                    <span className="text-2xl">🪙</span>
                    <span className="text-purple-300 font-bold">{shadowCoins}</span>
                </div>

                <div className="streak-display flex items-center gap-2 
                        bg-orange-900/30 px-4 py-2 rounded-full">
                    <span className="text-2xl">🔥</span>
                    <span className="text-orange-300 font-bold">
                        {currentStreak} {t('chibi.days_streak', 'jours')}
                    </span>
                </div>

                <button
                    className="gacha-button px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 
                     text-white font-bold rounded-full hover:from-purple-700 hover:to-pink-700 
                     transition-all transform hover:scale-105 shadow-lg"
                    onClick={() => setShowGacha(true)}
                >
                    {t('chibi.summon_button', '🎰 Invocation')}
                </button>
            </div>

            {/* 🗺️ Canvas principal avec la map */}
            <ChibiCanvas
                worldData={worldData}
                activeChibis={activeChibis}
                onChibiClick={handleChibiClick} // Maintenant ça passe la position
            />

            {/* 📦 Inventaire (si nécessaire) */}
            {/* <ChibiInventory
        activeAccount={activeAccount}
        onChibiSelect={(chibi) => {
          // TODO: Gérer la sélection depuis l'inventaire
        }}
      /> */}

            {/* 🎰 Système de Gacha */}
            {showGacha && (
                <ChibiGacha
                    shadowCoins={shadowCoins}
                    onClose={() => setShowGacha(false)}
                    onPull={handlePull}
                />
            )}

            {/* 💬 Messages des Chibis */}
            {chibiMessage && (
                <ChibiBubble
                    message={chibiMessage.text}
                    position={chibiMessage.position}
                    entityType={chibiMessage.chibiType}
                    isMobile={window.innerWidth < 768}
                    onClose={() => setChibiMessage(null)}
                />
            )}
        </div>
    );
};

export default ChibiWorld;