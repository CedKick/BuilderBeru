// src/components/ChibiSystem/ChibiWorld.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import ChibiCanvas from './ChibiCanvas';
import ChibiInventory from './ChibiInventory';
import ChibiGacha from './ChibiGacha';
import ChibiBubble from '../ChibiBubble';
import shadowCoinManager from './ShadowCoinManager';
import { ChibiFactory } from './ChibiDataStructure';
import { CHIBI_DATABASE } from './ChibiDatabase';
import './ChibiWorld.css';

const ChibiWorld = () => {
    const { t } = useTranslation();

    // 🎮 États principaux
    const [showGacha, setShowGacha] = useState(false);
    const [showInventory, setShowInventory] = useState(false);
    const [chibiFactory] = useState(() => new ChibiFactory(CHIBI_DATABASE));
    const [ownedChibis, setOwnedChibis] = useState({}); // Pour stocker les entités ChibiEntity
    const [activeChibis, setActiveChibis] = useState(['chibi_beru_001', 'chibi_tank_001']);
    const [shadowCoins, setShadowCoins] = useState(100);
    const [currentStreak, setCurrentStreak] = useState(0);
     const [isLoading, setIsLoading] = useState(true); // NOUVEAU
    const [chibiMessage, setChibiMessage] = useState(null);
    const [selectedChibi, setSelectedChibi] = useState(null);
    const [activeAccount, setActiveAccount] = useState('Compte1');

    // États pour le système de coins
    const [nextTickIn, setNextTickIn] = useState(60);
    const [showDailyBonus, setShowDailyBonus] = useState(false);

    // Refs
    const coinAnimationContainer = useRef(null);

    // 🗺️ Configuration de la map
    const worldData = {
        background: 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1755091230/BuilderBeru_enclos_wgtjm5.jpg',
        name: 'BuilderBeru Sanctuary',
        maxChibis: 20
    };

 // 💾 Charger TOUT d'un coup au montage
    useEffect(() => {
        const loadGameData = async () => {
            try {
                // Attendre un tick pour s'assurer que tout est prêt
                await new Promise(resolve => setTimeout(resolve, 10));
                
                const storedData = localStorage.getItem('builderberu_users');
                if (!storedData) {
                    // Pas de données, charger les chibis par défaut
                    const defaultChibis = ['chibi_beru_001', 'chibi_tank_001'];
                    const loadedChibis = {};
                    
                    defaultChibis.forEach(id => {
                        const chibi = chibiFactory.createChibi(id);
                        if (chibi) {
                            loadedChibis[id] = chibi;
                        }
                    });
                    
                    setOwnedChibis(loadedChibis);
                    setActiveChibis(defaultChibis);
                    setIsLoading(false);
                    return;
                }

                const data = JSON.parse(storedData);
                const accounts = data?.user?.accounts || {};
                const firstAccount = Object.keys(accounts)[0] || 'Compte1';
                setActiveAccount(firstAccount);

                const accountData = accounts[firstAccount];
                if (accountData?.chibis) {
                    // Charger les données de base
                    setCurrentStreak(accountData.chibis.streakData?.currentStreak || 0);
                    
                    // IMPORTANT : Charger les chibis possédés AVANT les actifs
                    const loadedChibis = {};
                    if (accountData.chibis.ownedChibis) {
                        for (const [id, savedState] of Object.entries(accountData.chibis.ownedChibis)) {
                            const chibi = chibiFactory.createChibi(id, savedState);
                            if (chibi) {
                                loadedChibis[id] = chibi;
                            }
                        }
                        setOwnedChibis(loadedChibis);
                    }
                    
                    // Puis charger les chibis actifs
                    const activeIds = accountData.chibis.activeEnclos || [];
                    // Vérifier que les chibis actifs existent vraiment
                    const validActiveIds = activeIds.filter(id => loadedChibis[id]);
                    setActiveChibis(validActiveIds);
                    
                    // Si aucun chibi actif valide, en mettre par défaut
                    if (validActiveIds.length === 0 && Object.keys(loadedChibis).length > 0) {
                        setActiveChibis([Object.keys(loadedChibis)[0]]);
                    }
                } else {
                    // Pas de données chibi, charger les défauts
                    const defaultChibis = ['chibi_beru_001', 'chibi_tank_001'];
                    const loadedChibis = {};
                    
                    defaultChibis.forEach(id => {
                        const chibi = chibiFactory.createChibi(id);
                        if (chibi) {
                            loadedChibis[id] = chibi;
                        }
                    });
                    
                    setOwnedChibis(loadedChibis);
                    setActiveChibis(defaultChibis);
                }
            } catch (error) {
                console.error('Erreur chargement données:', error);
                // En cas d'erreur, charger les chibis par défaut
                const defaultChibis = ['chibi_beru_001', 'chibi_tank_001'];
                const loadedChibis = {};
                
                defaultChibis.forEach(id => {
                    const chibi = chibiFactory.createChibi(id);
                    if (chibi) {
                        loadedChibis[id] = chibi;
                    }
                });
                
                setOwnedChibis(loadedChibis);
                setActiveChibis(defaultChibis);
            } finally {
                setIsLoading(false);
            }
        };

        loadGameData();
    }, []); // Pas de dépendance sur chibiFactory car il est créé dans useState

    // Sauvegarder à chaque changement important
    useEffect(() => {
        if (!isLoading && (activeChibis.length > 0 || Object.keys(ownedChibis).length > 0)) {
            saveToLocalStorage({
                ownedChibis: Object.fromEntries(
                    Object.entries(ownedChibis).map(([id, chibi]) => [id, chibi.toJSON()])
                ),
                activeEnclos: activeChibis
            });
        }
    }, [activeChibis, ownedChibis, isLoading]);

    // 💰 Initialiser le système de coins
    useEffect(() => {
        // Initialiser le manager
        shadowCoinManager.init();

        // Vérifier si c'est la première connexion du jour
        const stats = shadowCoinManager.getStats();
        if (!stats.hasClaimedDaily) {
            setShowDailyBonus(true);
            setTimeout(() => setShowDailyBonus(false), 3000);
        }

        // S'abonner aux mises à jour
        const unsubscribe = shadowCoinManager.subscribe(({ total, change, source }) => {
            setShadowCoins(total);

            // Afficher une animation de gain
            if (change > 0 && source === 'passive') {
                showCoinAnimation(change, 'passive');
            } else if (change > 0 && source === 'daily') {
                showCoinAnimation(change, 'daily');
            } else if (change > 0 && source === 'offline') {
                showCoinAnimation(change, 'offline');
            }
        });

        // Mettre à jour le solde initial
        setShadowCoins(shadowCoinManager.getBalance());

        // Timer pour afficher le prochain gain
        const timer = setInterval(() => {
            const stats = shadowCoinManager.getStats();
            const nextTick = Math.ceil(stats.nextTick / 1000);
            setNextTickIn(nextTick > 0 ? nextTick : 60);
        }, 1000);

        return () => {
            unsubscribe();
            clearInterval(timer);
        };
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
            ...newData,
            shadowCoins: shadowCoins // Synchroniser avec le manager
        };

        localStorage.setItem('builderberu_users', JSON.stringify(data));
    };

const handleChibiClick = (chibiId, realPosition) => {
    const chibi = ownedChibis[chibiId];
    if (!chibi) return;
    
    setSelectedChibi(chibi);
    
    // Utiliser la méthode getMessage() du chibi
    const message = chibi.getMessage();
    
    setChibiMessage({
        text: message,
        position: realPosition || { x: window.innerWidth / 2, y: 100 },
        chibiType: chibi.id.split('_')[1]
    });
    
    setTimeout(() => {
        setChibiMessage(null);
    }, 5000);
};

    // 🎰 Gestion du pull
    const handlePull = (newChibi) => {
    if (shadowCoinManager.spendCoins(100)) {
        // Vérifier si on possède déjà ce chibi
        if (ownedChibis[newChibi.id]) {
            // Chibi déjà possédé - donner des fragments ou de l'XP
            const existingChibi = ownedChibis[newChibi.id];
            existingChibi.gainExperience(50); // Bonus XP pour duplicate
            
            showCoinAnimation(25, 'duplicate'); // Compensation en coins
            shadowCoinManager.addCoins(25, 'duplicate');
            
            // Afficher un message
            setChibiMessage({
                text: `${newChibi.name} déjà possédé! +50 XP et +25 🪙`,
                position: { x: window.innerWidth / 2, y: 200 },
                chibiType: 'system'
            });
        } else {
            // Nouveau chibi !
            setOwnedChibis(prev => ({
                ...prev,
                [newChibi.id]: newChibi
            }));
            
            // L'ajouter aux chibis actifs si place disponible
            if (activeChibis.length < worldData.maxChibis) {
                setActiveChibis(prev => [...prev, newChibi.id]);
            }
            
            // Sauvegarder
            saveToLocalStorage({
                ownedChibis: {
                    ...ownedChibis,
                    [newChibi.id]: newChibi.toJSON()
                },
                activeEnclos: activeChibis
            });
        }
    }
};

    // 💫 Animation de gain de coins
    const showCoinAnimation = (amount, source) => {
        const animDiv = document.createElement('div');
        animDiv.className = 'coin-gain-animation';

        let message = `+${amount} 🪙`;
        let color = '#FFD700';

        if (source === 'daily') {
            message = `🎁 Bonus quotidien! +${amount} 🪙`;
            color = '#10B981';
        } else if (source === 'offline') {
            message = `💤 Gains hors-ligne! +${amount} 🪙`;
            color = '#8B5CF6';
        }

        animDiv.textContent = message;
        animDiv.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            color: ${color};
            font-size: ${source === 'passive' ? '20px' : '28px'};
            font-weight: bold;
            z-index: 10000;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            animation: floatUp 2.5s ease-out forwards;
        `;

        document.body.appendChild(animDiv);
        setTimeout(() => animDiv.remove(), 2500);
    };

    // 📊 Formater le temps
    const formatTime = (seconds) => {
        if (seconds <= 0) return '0s';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
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
                        bg-purple-900/30 px-4 py-2 rounded-full relative">
                    <span className="text-2xl">🪙</span>
                    <span className="text-purple-300 font-bold text-xl">{shadowCoins}</span>
                    <span className="passive-gain-info text-green-400 text-sm ml-2">
                        (+{shadowCoinManager.PASSIVE_GAIN_RATE}/min)
                    </span>
                </div>

                {/* Timer jusqu'au prochain gain */}
                <div className="next-gain-timer">
                    <span className="text-sm text-gray-300">
                        Prochain gain dans: <span className="text-yellow-400 font-bold">{nextTickIn}s</span>
                    </span>
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
                     transition-all transform hover:scale-105 shadow-lg relative"
                    onClick={() => setShowGacha(true)}
                    disabled={shadowCoins < 100}
                >
                    {t('chibi.summon_button', '🎰 Invocation')}
                    {shadowCoins < 100 && (
                        <span className="absolute -bottom-6 left-0 right-0 text-xs text-red-400">
                            Pas assez de coins!
                        </span>
                    )}
                </button>

                <button
                    className="inventory-button px-4 py-2 bg-gray-800/50 border border-gray-600
                     text-white rounded-full hover:bg-gray-700/50 transition-colors"
                    onClick={() => setShowInventory(true)}
                >
                    📦 {t('chibi.inventory', 'Inventaire')}
                </button>
            </div>

            {/* 🎁 Notification bonus quotidien */}
            {showDailyBonus && (
                <div className="daily-bonus-notification">
                    <div className="daily-bonus-content">
                        <span className="daily-bonus-icon">🎁</span>
                        <span className="daily-bonus-text">
                            Bonus de connexion quotidienne! +100 Shadow Coins!
                        </span>
                    </div>
                </div>
            )}

            {/* 🗺️ Canvas principal avec la map */}
            <ChibiCanvas
    worldData={worldData}
    activeChibiEntities={activeChibis.map(id => ownedChibis[id]).filter(Boolean)}
    onChibiClick={handleChibiClick}
/>

            {/* 📦 Inventaire */}
            {showInventory && (
                <ChibiInventory
                    activeAccount={activeAccount}
                    activeChibis={activeChibis}
                    onChibiSelect={(chibi) => {
                        // TODO: Gérer la sélection depuis l'inventaire
                        setShowInventory(false);
                    }}
                    onClose={() => setShowInventory(false)}
                />
            )}

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

            {/* Container pour les animations de coins */}
            <div ref={coinAnimationContainer} />
        </div>
    );
};

export default ChibiWorld;