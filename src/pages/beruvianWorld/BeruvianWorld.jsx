import React, { useState, useEffect } from "react";
import ShadowResonance from "./ShadowResonance";
import ResonanceManager from "./ResonanceManager";
import playerProgression from "./PlayerProgressionSystem";

// 🌍 CONSTANTES DU JEU
const TILE_SIZE = 1024;
const HUNTER_SIZE = 16; // Réduit de 32 à 16 (2x plus petit)
const HUNTER_SPEED = 5;
const VISION_RANGE = 50; // Réduit aussi pour matcher
const DEFAULT_ZOOM = 5; // Le 500% devient le zoom par défaut !
const MIN_ZOOM = 1;
const MAX_ZOOM = 20; // On augmente le max pour pouvoir zoomer encore plus

// 📍 POSITIONS DE TOUTES LES ZONES 5x5
const ZONE_POSITIONS = {
  "A1": { x: 0, y: 0, gridX: 0, gridY: 0 },
  "A2": { x: 1, y: 0, gridX: 1, gridY: 0 },
  "A3": { x: 2, y: 0, gridX: 2, gridY: 0 },
  "A4": { x: 3, y: 0, gridX: 3, gridY: 0 },
  "A5": { x: 4, y: 0, gridX: 4, gridY: 0 },
  "B1": { x: 0, y: 1, gridX: 0, gridY: 1 },
  "B2": { x: 1, y: 1, gridX: 1, gridY: 1 },
  "B3": { x: 2, y: 1, gridX: 2, gridY: 1 },
  "B4": { x: 3, y: 1, gridX: 3, gridY: 1 },
  "B5": { x: 4, y: 1, gridX: 4, gridY: 1 },
  "C1": { x: 0, y: 2, gridX: 0, gridY: 2 },
  "C2": { x: 1, y: 2, gridX: 1, gridY: 2 },
  "C3": { x: 2, y: 2, gridX: 2, gridY: 2 },
  "C4": { x: 3, y: 2, gridX: 3, gridY: 2 },
  "C5": { x: 4, y: 2, gridX: 4, gridY: 2 },
  "D1": { x: 0, y: 3, gridX: 0, gridY: 3 },
  "D2": { x: 1, y: 3, gridX: 1, gridY: 3 },
  "D3": { x: 2, y: 3, gridX: 2, gridY: 3 },
  "D4": { x: 3, y: 3, gridX: 3, gridY: 3 },
  "D5": { x: 4, y: 3, gridX: 4, gridY: 3 },
  "E1": { x: 0, y: 4, gridX: 0, gridY: 4 },
  "E2": { x: 1, y: 4, gridX: 1, gridY: 4 },
  "E3": { x: 2, y: 4, gridX: 2, gridY: 4 },
  "E4": { x: 3, y: 4, gridX: 3, gridY: 4 },
  "E5": { x: 4, y: 4, gridX: 4, gridY: 4 }
};

// 🗺️ IMPORT DU FICHIER zoneMaps.json (ou le mettre en dur ici)
import zoneMapData from "../../data/zoneMaps.json";

// 🎮 COMPOSANT PRINCIPAL
export default function BeruvianWorld() {
  // 🧭 États du jeu
  const [hunterPosition, setHunterPosition] = useState({ 
    x: ZONE_POSITIONS["B2"].gridX * TILE_SIZE + TILE_SIZE/2, 
    y: ZONE_POSITIONS["B2"].gridY * TILE_SIZE + TILE_SIZE/2 
  }); // Spawn à la capitale Shadow
  const [currentZone, setCurrentZone] = useState("B2");
  const [selectedAction, setSelectedAction] = useState(null);
  const [movementTarget, setMovementTarget] = useState(null);
  const [faction] = useState("ShadowLand");
  const [isMoving, setIsMoving] = useState(false);
  const [zoneMap] = useState(zoneMapData);
  const [actionsRemaining, setActionsRemaining] = useState(100); // 100 actions au lieu de 3 !
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // 🌀 États pour le système de résonance
  const [showResonance, setShowResonance] = useState(false);
  const [shadowEncountered, setShadowEncountered] = useState(null);
  const [activeResonance, setActiveResonance] = useState(null);
  const [isCorrupted, setIsCorrupted] = useState(false);
  
  // 📊 Charger les stats du joueur depuis localStorage
  const [hunterStats, setHunterStats] = useState(() => {
    const stats = playerProgression.getCurrentStats();
    return {
      name: playerProgression.playerData.name,
      level: stats.level,
      vision: stats.vision,
      hp: stats.hp,
      maxHp: stats.maxHp,
      attack: stats.attack,
      defense: stats.defense,
      role: playerProgression.playerData.class,
      xp: stats.xp,
      nextLevelXp: stats.xpRequired
    };
  });
  
  // 🎯 Système de notifications pour level up et achievements
  const [notifications, setNotifications] = useState([]);

  // 🕹️ Gestion du déplacement
  useEffect(() => {
    if (!movementTarget) return;

    setIsMoving(true);
    const interval = setInterval(() => {
      setHunterPosition(current => {
        const dx = movementTarget.x - current.x;
        const dy = movementTarget.y - current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < HUNTER_SPEED) {
          setMovementTarget(null);
          setIsMoving(false);
          // Consommer une action
          if (actionsRemaining > 0) {
            setActionsRemaining(prev => prev - 1);
          }
          return movementTarget;
        }

        const ratio = HUNTER_SPEED / distance;
        return {
          x: current.x + dx * ratio,
          y: current.y + dy * ratio
        };
      });
    }, 50);

    return () => clearInterval(interval);
  }, [movementTarget, actionsRemaining]);

  // 🎯 Mise à jour de la zone actuelle + auto-center
  useEffect(() => {
    const gridX = Math.floor(hunterPosition.x / TILE_SIZE);
    const gridY = Math.floor(hunterPosition.y / TILE_SIZE);
    
    const newZone = Object.entries(ZONE_POSITIONS).find(
      ([_, pos]) => pos.gridX === gridX && pos.gridY === gridY
    )?.[0] || currentZone;
    
    if (newZone !== currentZone) {
      setCurrentZone(newZone);
      
      // Explorer automatiquement les zones adjacentes
      exploreAdjacentZones(newZone);
    }
  }, [hunterPosition, currentZone]);

  // Centrer au démarrage
  useEffect(() => {
    setTimeout(centerOnHunter, 100);
  }, []);

  // 🗺️ Explorer les zones adjacentes
  const exploreAdjacentZones = (centerZone) => {
    const [letter, number] = [centerZone[0], parseInt(centerZone[1])];
    const adjacentCoords = [
      `${letter}${number - 1}`, // Gauche
      `${letter}${number + 1}`, // Droite
      `${String.fromCharCode(letter.charCodeAt(0) - 1)}${number}`, // Haut
      `${String.fromCharCode(letter.charCodeAt(0) + 1)}${number}` // Bas
    ];

    adjacentCoords.forEach(coord => {
      if (zoneMap[coord] && !zoneMap[coord].explored) {
        // Explorer la zone et gagner de l'XP
        const xpResult = playerProgression.exploreZone(coord);
        if (xpResult) {
          showNotification(`Zone découverte! +${xpResult.xpGained} XP`, 'success');
          updateHunterStats();
          
          // Vérifier les achievements
          const achievements = playerProgression.checkAchievements();
          achievements.forEach(ach => {
            showNotification(`🏆 ${ach.name}: ${ach.description}`, 'achievement');
          });
        }
      }
    });
  };

  // 🖱️ Gestion du clic sur la map
  const handleMapClick = (e) => {
    if (selectedAction !== "move" || actionsRemaining <= 0 || isDragging) return;

    const rect = e.currentTarget.getBoundingClientRect();
    
    // Calculer la position réelle en tenant compte du zoom et de l'offset
    const x = (e.clientX - rect.left - mapOffset.x) / zoom;
    const y = (e.clientY - rect.top - mapOffset.y) / zoom;

    const maxX = 5 * TILE_SIZE;
    const maxY = 5 * TILE_SIZE;
    
    if (x >= 0 && x <= maxX && y >= 0 && y <= maxY) {
      setMovementTarget({ x, y });
    }
    
    setSelectedAction(null);
  };

  // 🖱️ Gestion du drag de la map
  const handleMouseDown = (e) => {
    if (selectedAction === "move") return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - mapOffset.x, y: e.clientY - mapOffset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setMapOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 🔍 Gestion du zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2; // Plus sensible
    const newZoom = zoom + delta;
    setZoom(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom)));
  };

  // 🎯 Centrer sur le Hunter
  const centerOnHunter = () => {
    const rect = document.querySelector('.map-container')?.getBoundingClientRect();
    if (!rect) return;
    
    setMapOffset({
      x: rect.width / 2 - hunterPosition.x * zoom,
      y: rect.height / 2 - hunterPosition.y * zoom
    });
  };

  // 🎯 Centrer sur une zone spécifique
  const centerOnZone = (zoneId) => {
    const rect = document.querySelector('.map-container')?.getBoundingClientRect();
    if (!rect || !ZONE_POSITIONS[zoneId]) return;
    
    const zonePos = ZONE_POSITIONS[zoneId];
    const targetX = zonePos.gridX * TILE_SIZE + TILE_SIZE/2;
    const targetY = zonePos.gridY * TILE_SIZE + TILE_SIZE/2;
    
    setMapOffset({
      x: rect.width / 2 - targetX * zoom,
      y: rect.height / 2 - targetY * zoom
    });
  };

  // 🎮 Actions disponibles
  const actions = [
    { id: "move", icon: "🚶", name: "Se déplacer", description: "Cliquez sur la map (1 action)" },
    { id: "patrol", icon: "🔍", name: "Rôder", description: "Chercher des ennemis (1 action)" },
    { id: "rest", icon: "💤", name: "Se reposer", description: "Récupérer 20 HP (1 action)" },
    { id: "explore", icon: "🗺️", name: "Explorer", description: "Révéler la zone (gratuit)" }
  ];

  // 🎯 Exécuter une action
  const executeAction = (actionId) => {
    if (actionsRemaining <= 0 && actionId !== "explore") {
      alert("Plus d'actions disponibles aujourd'hui !");
      return;
    }

    switch (actionId) {
      case "patrol":
        setActionsRemaining(prev => prev - 1);
        // Chance de rencontrer une ombre ou un ennemi
        const encounterRoll = Math.random();
        
        if (encounterRoll > 0.7) {
          // Rencontre avec une ombre (30% de chance)
          const shadows = ['bigrock', 'beste', 'kaiser'];
          const randomShadow = shadows[Math.floor(Math.random() * shadows.length)];
          setShadowEncountered(randomShadow);
          setShowResonance(true);
        } else if (encounterRoll > 0.3) {
          // Combat normal (40% de chance)
          const enemyLevel = currentZone ? (zoneMap[currentZone].dangerLevel || 1) : 1;
          const combatSuccess = Math.random() > 0.3; // 70% de chance de victoire
          
          if (combatSuccess) {
            const xpResult = playerProgression.winCombat(enemyLevel);
            showNotification(`⚔️ Victoire! +${xpResult.xpGained} XP`, 'success');
            
            // Chance de drop
            if (Math.random() > 0.5) {
              const resources = ['shadowCrystals', 'lightEssence', 'earthFragments'];
              const resource = resources[Math.floor(Math.random() * resources.length)];
              const collected = playerProgression.collectResource(resource, Math.floor(Math.random() * 3) + 1);
              showNotification(`💎 +${collected.amount} ${resource}`, 'info');
            }
          } else {
            // Défaite : perte de HP
            const damage = Math.floor(Math.random() * 20) + 10;
            setHunterStats(prev => ({
              ...prev,
              hp: Math.max(0, prev.hp - damage)
            }));
            showNotification(`❌ Défaite! -${damage} HP`, 'error');
          }
          
          updateHunterStats();
        } else {
          // Zone calme (30% de chance)
          showNotification("🌲 Zone calme, rien à signaler.", 'info');
          // Petit bonus d'XP pour la patrouille
          playerProgression.gainXP(5);
          updateHunterStats();
        }
        break;
        
      case "rest":
        setActionsRemaining(prev => prev - 1);
        // Restaurer des HP
        const healAmount = Math.floor(hunterStats.maxHp * 0.2);
        setHunterStats(prev => ({
          ...prev,
          hp: Math.min(prev.hp + healAmount, prev.maxHp)
        }));
        showNotification(`❤️ +${healAmount} HP récupérés!`, 'heal');
        break;
        
      case "explore":
        alert("🔍 Cette zone est maintenant visible pour votre faction !");
        break;
    }
  };

  // 📊 Calcul des stats territoriales
  const getTerritorialStats = () => {
    const zones = Object.values(zoneMap);
    return {
      shadow: zones.filter(z => z.controlledBy === "ShadowLand").length,
      light: zones.filter(z => z.controlledBy === "Lightborne").length,
      earth: zones.filter(z => z.controlledBy === "Earthcore").length,
      neutral: zones.filter(z => !z.controlledBy).length
    };
  };

  // 🔄 Mettre à jour les stats du hunter
  const updateHunterStats = () => {
    const stats = playerProgression.getCurrentStats();
    setHunterStats({
      name: playerProgression.playerData.name,
      level: stats.level,
      vision: stats.vision,
      hp: stats.hp,
      maxHp: stats.maxHp,
      attack: stats.attack,
      defense: stats.defense,
      role: playerProgression.playerData.class,
      xp: stats.xp,
      nextLevelXp: stats.xpRequired
    });
  };

  // 📢 Système de notifications
  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // 🌀 Gestion de la résonance
  const handleResonanceComplete = (resonanceData) => {
    setActiveResonance(resonanceData);
    setShowResonance(false);
    
    // Sauvegarder la résonance et gagner de l'XP
    const xpResult = playerProgression.addResonance(resonanceData);
    showNotification(`🌀 Résonance établie! +${xpResult.xpGained} XP`, 'resonance');
    updateHunterStats();
    
  };

  const handleCorruptionMax = () => {
    setIsCorrupted(true);
    // En mode corrompu, le joueur devient hostile
    setTimeout(() => {
      setIsCorrupted(false);
      alert("La corruption s'estompe... Vous reprenez le contrôle.");
    }, 30000); // 30 secondes de mode berserk
  };

  const handleResonanceEnd = () => {
    setActiveResonance(null);
  };

  const territoryStats = getTerritorialStats();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* 📢 Système de Notifications */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={`px-6 py-3 rounded-lg shadow-lg animate-slideIn ${
              notif.type === 'success' ? 'bg-green-600' :
              notif.type === 'achievement' ? 'bg-purple-600' :
              notif.type === 'heal' ? 'bg-pink-600' :
              notif.type === 'resonance' ? 'bg-indigo-600' :
              notif.type === 'levelup' ? 'bg-yellow-600' :
              'bg-blue-600'
            }`}
          >
            {notif.message}
          </div>
        ))}
      </div>

      {/* 🌀 Système de Résonance */}
      {showResonance && (
        <ShadowResonance
          shadowEncountered={shadowEncountered}
          playerStats={hunterStats}
          onResonanceComplete={handleResonanceComplete}
          onClose={() => setShowResonance(false)}
        />
      )}

      {/* 🌀 Gestionnaire de Résonance Active */}
      {activeResonance && (
        <ResonanceManager
          activeResonance={activeResonance}
          playerStats={hunterStats}
          onCorruptionMax={handleCorruptionMax}
          onResonanceEnd={handleResonanceEnd}
        />
      )}

      {/* 🎯 HEADER */}
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-4xl font-bold text-purple-400 mb-2">
          🌍 Beruvian World
        </h1>
        <div className="flex gap-4 text-sm">
          <span>📍 Zone: <span className="text-yellow-400">{zoneMap[currentZone]?.name}</span></span>
          <span>⚡ Actions: <span className="text-green-400">{actionsRemaining}/100</span></span>
          <span>📅 Jour 1</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* 🗺️ MAP PRINCIPALE */}
        <div className="xl:col-span-3">
          <div className="bg-gray-800 rounded-lg p-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-purple-300">
                🗺️ World Map - {zoneMap[currentZone]?.type || "Unknown"}
              </h2>
              {zoneMap[currentZone]?.special && (
                <span className="bg-red-600 px-3 py-1 rounded-full text-sm">
                  ⭐ {zoneMap[currentZone].special}
                </span>
              )}
            </div>
            
            <div 
              className="relative w-full overflow-hidden border-2 border-purple-600 rounded bg-black map-container"
              style={{ 
                height: "70vh",
                cursor: selectedAction === "move" ? "crosshair" : isDragging ? "grabbing" : "grab"
              }}
              onClick={handleMapClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              {/* Conteneur avec zoom et pan */}
              <div
                style={{
                  transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${zoom})`,
                  transformOrigin: '0 0',
                  transition: isDragging ? 'none' : 'transform 0.3s ease'
                }}
              >
                {/* Canvas de la map */}
                <MapCanvas 
                  zoneMap={zoneMap} 
                  currentZone={currentZone}
                  hunterPosition={hunterPosition}
                />
                
                {/* Hunter */}
                <HunterMarker 
                  x={hunterPosition.x} 
                  y={hunterPosition.y}
                  faction={faction}
                />
                
                {/* Zone de vision */}
                <div
                  className="absolute rounded-full border-2 border-blue-400 opacity-20 pointer-events-none"
                  style={{
                    left: hunterPosition.x - VISION_RANGE,
                    top: hunterPosition.y - VISION_RANGE,
                    width: VISION_RANGE * 2,
                    height: VISION_RANGE * 2
                  }}
                />
                
                {/* Indicateur de mouvement */}
                {movementTarget && (
                  <div
                    className="absolute w-4 h-4 border-2 border-green-400 rounded-full animate-pulse pointer-events-none"
                    style={{
                      left: movementTarget.x - 8,
                      top: movementTarget.y - 8
                    }}
                  />
                )}
              </div>
              
              {/* Contrôles de zoom */}
              <div className="absolute top-2 right-2 flex flex-col gap-2">
                <button
                  onClick={() => setZoom(Math.min(MAX_ZOOM, zoom + 0.5))}
                  className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded transition-all hover:scale-110"
                  title="Zoom avant"
                >
                  🔍+
                </button>
                <button
                  onClick={() => setZoom(Math.max(MIN_ZOOM, zoom - 0.5))}
                  className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded transition-all hover:scale-110"
                  title="Zoom arrière"
                >
                  🔍-
                </button>
                <div className="bg-gray-800 text-white text-xs p-1 rounded text-center">
                  {Math.round(zoom * 100)}%
                </div>
                <button
                  onClick={centerOnHunter}
                  className="bg-blue-700 hover:bg-blue-600 text-white p-2 rounded transition-all hover:scale-110"
                  title="Centrer sur le Hunter"
                >
                  🎯
                </button>
                {/* Boutons de zoom rapide */}
                <div className="border-t border-gray-600 pt-2 mt-2 flex flex-col gap-1">
                  <button
                    onClick={() => setZoom(1)}
                    className="bg-gray-800 hover:bg-gray-700 text-white text-xs p-1 rounded"
                    title="Zoom 100%"
                  >
                    100%
                  </button>
                  <button
                    onClick={() => setZoom(2)}
                    className="bg-gray-800 hover:bg-gray-700 text-white text-xs p-1 rounded"
                    title="Zoom 200%"
                  >
                    200%
                  </button>
                  <button
                    onClick={() => setZoom(5)}
                    className="bg-gray-800 hover:bg-gray-700 text-white text-xs p-1 rounded"
                    title="Zoom 500%"
                  >
                    500%
                  </button>
                  <button
                    onClick={() => setZoom(MAX_ZOOM)}
                    className="bg-purple-700 hover:bg-purple-600 text-white text-xs p-1 rounded font-bold"
                    title="ZOOM MAX !"
                  >
                    MAX!
                  </button>
                </div>
              </div>
              
              {/* Mode déplacement */}
              {selectedAction === "move" && actionsRemaining > 0 && (
                <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm animate-pulse pointer-events-none">
                  🎯 Cliquez pour vous déplacer
                </div>
              )}
              
              {/* Indicateur de zoom avec barre */}
              <div className="absolute bottom-2 right-2 bg-black/80 text-white px-3 py-2 rounded">
                <div className="text-xs mb-1">Zoom: {Math.round(zoom * 100)}%</div>
                <div className="w-32 h-2 bg-gray-700 rounded-full">
                  <div 
                    className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${((zoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1 text-gray-400">
                  <span>{MIN_ZOOM * 100}%</span>
                  <span>{MAX_ZOOM * 100}%</span>
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {actions.map(action => (
                <button
                  key={action.id}
                  onClick={() => {
                    if (action.id === "move") {
                      setSelectedAction("move");
                    } else {
                      executeAction(action.id);
                    }
                  }}
                  disabled={isMoving || (actionsRemaining <= 0 && action.id !== "explore")}
                  className={`p-3 rounded-lg transition-all ${
                    selectedAction === action.id
                      ? "bg-purple-600 ring-2 ring-purple-400"
                      : isMoving || (actionsRemaining <= 0 && action.id !== "explore")
                      ? "bg-gray-800 opacity-50 cursor-not-allowed"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                  title={action.description}
                >
                  <div className="text-2xl">{action.icon}</div>
                  <div className="text-xs mt-1">{action.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 📊 PANNEAU LATÉRAL */}
        <div className="space-y-4">
          {/* Info Hunter */}
          <div className="bg-gray-800 rounded-lg p-4 shadow-xl">
            <h3 className="text-lg font-bold mb-3 text-green-400">🗡️ Hunter Info</h3>
            <div className="space-y-2 text-sm">
              <div>📛 {hunterStats.name}</div>
              <div className="flex items-center gap-2">
                <span>⭐ Niveau {hunterStats.level}</span>
                {hunterStats.level > 1 && (
                  <span className="text-xs text-yellow-400">(+{hunterStats.level - 1})</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span>📊 XP:</span>
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${(hunterStats.xp / hunterStats.nextLevelXp) * 100}%` }}
                  />
                </div>
                <span className="text-xs">{hunterStats.xp}/{hunterStats.nextLevelXp}</span>
              </div>
              
              {/* Stats détaillées */}
              <div className="pt-2 border-t border-gray-700">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>⚔️ ATK: <span className="text-red-400">{hunterStats.attack}</span></div>
                  <div>🛡️ DEF: <span className="text-blue-400">{hunterStats.defense}</span></div>
                  <div>👁️ Vision: <span className="text-green-400">{hunterStats.vision}m</span></div>
                  <div>❤️ HP: <span className="text-pink-400">{hunterStats.hp}/{hunterStats.maxHp}</span></div>
                </div>
              </div>
              
              <div className="pt-2 border-t border-gray-700">
                <div>⚔️ Rôle: {hunterStats.role}</div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                  <span>Faction: {faction}</span>
                </div>
              </div>
              {/* Indicateur de résonance active */}
              {activeResonance && (
                <div className="pt-2 border-t border-gray-700">
                  <div className="flex items-center gap-2">
                    <span>🌀</span>
                    <span className="text-purple-400">Résonance: {activeResonance.shadow.name}</span>
                  </div>
                </div>
              )}
              {/* Indicateur de corruption */}
              {isCorrupted && (
                <div className="text-red-500 font-bold animate-pulse">
                  ⚠️ MODE BERSERK ACTIF
                </div>
              )}
            </div>
          </div>

          {/* Mini Map */}
          <div className="bg-gray-800 rounded-lg p-4 shadow-xl">
            <h3 className="text-lg font-bold mb-3 text-blue-400">🗺️ World Overview</h3>
            <div className="grid grid-cols-5 gap-1" style={{ width: "200px", height: "200px" }}>
              {Object.entries(ZONE_POSITIONS).map(([zoneId, pos]) => {
                const zone = zoneMap[zoneId];
                const isCurrentZone = zoneId === currentZone;
                const factionColors = {
                  "ShadowLand": "bg-purple-800",
                  "Lightborne": "bg-yellow-600",
                  "Earthcore": "bg-green-700"
                };
                
                return (
                  <div
                    key={zoneId}
                    className={`relative border ${
                      isCurrentZone ? "border-yellow-400 ring-2 ring-yellow-400" : "border-gray-600"
                    } ${
                      zone.explored 
                        ? (zone.controlledBy ? factionColors[zone.controlledBy] : "bg-gray-700")
                        : "bg-black"
                    } flex items-center justify-center text-xs cursor-pointer hover:opacity-80 transition-all hover:scale-110`}
                    title={zone.explored ? zone.name : "Zone inconnue"}
                    onClick={() => centerOnZone(zoneId)}
                  >
                    {zone.explored ? (
                      <>
                        {zone.special === "Capital" && "👑"}
                        {zone.special === "Boss Zone" && "🔥"}
                        {zone.special === "PvE Zone" && "🧊"}
                        {isCurrentZone && (
                          <div className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                        )}
                      </>
                    ) : (
                      <span className="text-gray-600 text-xs">?</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Faction Control */}
          <div className="bg-gray-800 rounded-lg p-4 shadow-xl">
            <h3 className="text-lg font-bold mb-3 text-red-400">🏰 Contrôle Territorial</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span>🕶️ ShadowLand</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${(territoryStats.shadow / 25) * 100}%` }}
                    />
                  </div>
                  <span className="text-purple-400">{territoryStats.shadow}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>🌞 Lightborne</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${(territoryStats.light / 25) * 100}%` }}
                    />
                  </div>
                  <span className="text-yellow-400">{territoryStats.light}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>🌱 Earthcore</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(territoryStats.earth / 25) * 100}%` }}
                    />
                  </div>
                  <span className="text-green-400">{territoryStats.earth}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-700 text-xs text-gray-400">
                Zones neutres: {territoryStats.neutral}
              </div>
            </div>
          </div>

          {/* Zone Info */}
          {zoneMap[currentZone] && (
            <div className="bg-gray-800 rounded-lg p-4 shadow-xl">
              <h3 className="text-lg font-bold mb-3 text-orange-400">📍 Zone Actuelle</h3>
              <div className="space-y-2 text-sm">
                <div>🏷️ {zoneMap[currentZone].name}</div>
                <div>🎯 Type: {zoneMap[currentZone].type}</div>
                {zoneMap[currentZone].dangerLevel && (
                  <div>⚠️ Danger: Niveau {zoneMap[currentZone].dangerLevel}</div>
                )}
                {zoneMap[currentZone].special && (
                  <div className="text-yellow-400">⭐ {zoneMap[currentZone].special}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// 🗺️ COMPOSANT CANVAS
function MapCanvas({ zoneMap, currentZone, hunterPosition }) {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Import du composant MapCanvas séparé
    // (Le code est dans MapCanvas.jsx)
  }, [zoneMap, currentZone]);

  // Utiliser le MapCanvas importé
  return <MapCanvasComponent zoneMap={zoneMap} currentZone={currentZone} />;
}

// 🗡️ MARQUEUR DU HUNTER
function HunterMarker({ x, y, faction }) {
  const factionColors = {
    "ShadowLand": "border-purple-500 shadow-purple-500/50",
    "Lightborne": "border-yellow-400 shadow-yellow-400/50",
    "Earthcore": "border-green-500 shadow-green-500/50"
  };

  return (
    <div
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200`}
      style={{ left: x, top: y, zIndex: 100 }}
    >
      <img loading="lazy"
        src="https://api.builderberu.com/cdn/images/icons_build-31.webp"
        alt="Hunter"
        className={`border-2 rounded-full ${factionColors[faction]} shadow-lg`}
        style={{ 
          width: `${HUNTER_SIZE}px`,
          height: `${HUNTER_SIZE}px`,
          imageRendering: "pixelated" 
        }}
      />
      <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-black/80 px-1 py-0.5 rounded text-xs whitespace-nowrap" style={{ fontSize: "10px" }}>
        Shadow Hunter #1
      </div>
    </div>
  );
}

// Import du vrai MapCanvas
import MapCanvasComponent from "./MapCanvas";