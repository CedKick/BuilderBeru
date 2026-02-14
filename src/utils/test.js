setupEntityEvents(entity) {
  const canvas = entity.spawnCanvas;
  if (!canvas) return;

  const handleClick = (event) => {
    // 🎯 CALCUL PRÉCIS AVEC ZOOM ET SCALE (ton code existant)
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    // 🔧 HITBOX CONFIGURABLE
    const hitboxPadding = 20; // ← TU PEUX MODIFIER ÇA
    const VERTICAL_OFFSET = 50;
    
    const spriteLeft = entity.x - hitboxPadding;
    const spriteRight = entity.x + entity.size + hitboxPadding;
    const spriteTop = entity.y - hitboxPadding - VERTICAL_OFFSET;
    const spriteBottom = entity.y + entity.size + hitboxPadding - VERTICAL_OFFSET;


    // 🔥 MISE À JOUR HITBOX DATA pour l'affichage
    if (window.updateHitboxData) {
      window.updateHitboxData(entity.id, {
        x: entity.x,
        y: entity.y,
        size: entity.size,
        padding: hitboxPadding,
        canvasId: canvas.id
      });
    }

    // ✅ COLLISION DETECTION (ton code existant)
    const isClickOnSprite = (
      clickX >= spriteLeft && 
      clickX <= spriteRight && 
      clickY >= spriteTop && 
      clickY <= spriteBottom
    );

    if (isClickOnSprite) {
      entity.clickCount++;
      this.showClickFeedback && this.showClickFeedback(entity, clickX, clickY);

      if (entity.id === 'tank') {
        this.handleTankClick(entity);
      } else if (entity.id === 'beru') {
        this.handleBeruClick(entity);
      } else if (entity.id === 'kaisel') {
        this.handleKaiselClick(entity);
      }
    }
  };

  canvas.addEventListener('click', handleClick);
}

// 4️⃣ FONCTION HELPER POUR RÉCUPÉRER LES POSITIONS DES ENTITÉS
const getEntityPositions = () => {
  const positions = {};
  if (window.shadowManager?.entities) {
    window.shadowManager.entities.forEach((entity, id) => {
      if (entity.spawnCanvas) {
        const rect = entity.spawnCanvas.getBoundingClientRect();
        const scaleX = rect.width / entity.spawnCanvas.width;
        const scaleY = rect.height / entity.spawnCanvas.height;
        
        positions[id] = {
          x: rect.left + (entity.x * scaleX),
          y: rect.top + (entity.y * scaleY),
          size: entity.size,
          canvasId: entity.spawnCanvas.id
        };
      }
    });
  }
  return positions;
};

// 5️⃣ HOOK POUR METTRE À JOUR LES HITBOXES EN TEMPS RÉEL
useEffect(() => {
  if (!showHitboxes) return;

  const updateHitboxes = () => {
    const positions = getEntityPositions();
    setHitboxData(positions);
  };

  // Mise à jour toutes les 100ms quand debug mode activé
  const interval = setInterval(updateHitboxes, 100);
  
  // Setup global function pour ShadowManager
  window.updateHitboxData = (entityId, data) => {
    setHitboxData(prev => ({ ...prev, [entityId]: data }));
  };

  return () => {
    clearInterval(interval);
    window.updateHitboxData = null;
  };
}, [showHitboxes]);

// 6️⃣ BOUTON DEBUG À AJOUTER DANS TON UI (quelque part visible)
const HitboxDebugButton = () => (
  <button
    onClick={() => setShowHitboxes(!showHitboxes)}
    className={`fixed top-4 right-4 z-[10001] px-3 py-2 rounded text-xs font-bold transition-colors ${
      showHitboxes 
        ? 'bg-red-600 hover:bg-red-700 text-white' 
        : 'bg-gray-600 hover:bg-gray-700 text-white'
    }`}
    style={{ 
      backgroundColor: showHitboxes ? '#dc2626' : '#4b5563',
      border: '2px solid #fff'
    }}
  >
    🐛 {showHitboxes ? 'HIDE' : 'SHOW'} HITBOXES
  </button>
);

// 7️⃣ DANS LE RETURN DE BuilderBeru, AJOUTE CES ÉLÉMENTS :

// À la fin, juste avant la fermeture du fragment principal :
{/* 🐛 DEBUG HITBOXES */}
<HitboxDebugButton />

{/* Affichage des hitboxes pour chaque entité */}
{showHitboxes && Object.entries(hitboxData).map(([entityId, data]) => (
  <HitboxDebugOverlay
    key={entityId}
    entityType={entityId}
    position={{ x: data.x, y: data.y }}
    size={data.size}
    hitboxPadding={20} // ← TU PEUX AJUSTER ICI
  />
))}

// 8️⃣ CSS POUR LE DEBUG (optionnel, à ajouter dans ton style global)
const debugStyles = `
  .hitbox-debug-info {
    position: fixed;
    bottom: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px;
    border-radius: 5px;
    font-size: 12px;
    font-family: monospace;
    z-index: 10002;
  }
`;

// 9️⃣ FONCTION POUR AJUSTER LES HITBOXES (tu pourras modifier les valeurs)
const adjustHitbox = (entityType, newPadding) => {
  // Cette fonction te permettra d'ajuster les hitboxes en live
  // Tu peux ajouter un state pour les paddings personnalisés
};

export { HitboxDebugOverlay, HitboxDebugButton, getEntityPositions };