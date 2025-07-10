// 🛠️ MODE ÉDITEUR

// Variables éditeur
let editorMode = false;
let editorTool = null;
let editorValue = null;
let editorGrid = true;
let needsRedraw = false;
let editorCameraSpeed = 15;

// Variables pour les éléments custom de l'éditeur
let customEnemies = [];
let customItems = {
  collectibles: [],
  hearts: [],
  powerupBlocks: []
};

// Basculer le mode éditeur
function toggleEditor() {
  console.log("=== TOGGLE EDITOR ===");
  console.log("Mode éditeur avant:", editorMode);
  
  editorMode = !editorMode;
  const button = document.getElementById("editorButton");
  const panel = document.getElementById("editorPanel");
  const mapControls = document.getElementById("mapControls");
  const buildModeDiv = document.getElementById("buildMode");
  const cameraInfo = document.getElementById("cameraInfo");
  const gridCanvas = document.getElementById("gridOverlay");
  
  if (editorMode) {
    console.log("Activation du mode éditeur");
    console.log("Nombre de blocs actuels:", Object.keys(blockGrid).length);
    
    // Activer l'éditeur
    button.textContent = "🎮 Mode Jeu";
    button.style.backgroundColor = "#228B22";
    panel.style.display = "block";
    mapControls.style.display = "block";
    buildModeDiv.style.display = "none";
    cameraInfo.textContent = "MODE ÉDITEUR - ZQSD/Flèches: Déplacer | Clic: Placer | Clic droit: Effacer";
    buildMode = false;
    
    // Afficher la grille MAIS s'assurer qu'elle est transparente
    gridCanvas.style.display = "block";
    gridCanvas.style.pointerEvents = "none"; // IMPORTANT : ne pas capturer les clics
    gridCanvas.style.background = "transparent"; // IMPORTANT : fond transparent
    
    // S'assurer que le gameCanvas est visible
    const gameCanvas = document.getElementById("gameCanvas");
    console.log("GameCanvas z-index:", gameCanvas.style.zIndex);
    console.log("GridCanvas z-index:", gridCanvas.style.zIndex);
    
    // Désactiver tous les joueurs
    for (let i = 0; i < players.length; i++) {
      players[i].active = false;
    }
    
    // Sauvegarder la position actuelle des joueurs
    for (let i = 0; i < players.length; i++) {
      players[i].savedX = players[i].x;
      players[i].savedY = players[i].y;
    }
    
    updateGridOverlay();
    needsRedraw = true;
    draw();
  } else {
    // Retour au jeu
    button.textContent = "🛠️ Mode Éditeur";
    button.style.backgroundColor = "#8B4513";
    panel.style.display = "none";
    mapControls.style.display = "none";
    document.getElementById("mapList").style.display = "none";
    cameraInfo.textContent = "Appuyez sur M pour recentrer la caméra";
    gridCanvas.style.display = "none";
    
    // Réactiver le joueur 1
    players[0].active = true;
    
    // Restaurer les positions des joueurs
    for (let i = 0; i < players.length; i++) {
      if (players[i].savedX !== undefined) {
        players[i].x = players[i].savedX;
        players[i].y = players[i].savedY;
      }
    }
    
    // Réinitialiser les vies normales
    players[0].lives = 3;
    updatePlayerLives(0);
  }
}

// Gérer les clics en mode éditeur
function handleEditorClick(e, rightClick) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const worldX = Math.floor((x + cameraX) / BLOCK_SIZE) * BLOCK_SIZE;
  const worldY = Math.floor((y + cameraY) / BLOCK_SIZE) * BLOCK_SIZE;
  
  console.log("=== HANDLE EDITOR CLICK ===");
  console.log("Clic éditeur:", {x: worldX, y: worldY, tool: editorTool, value: editorValue});
  console.log("Camera position:", {cameraX, cameraY});
  console.log("Mouse position:", {mouseX: x, mouseY: y});
  console.log("Right click:", rightClick);
  
  // Mode gomme ou clic droit
  if (rightClick || (editorTool === "tool" && editorValue === "eraser")) {
    // Effacer bloc
    removeBlock(worldX, worldY);
    
    // Effacer ennemi
    enemies = enemies.filter(e => 
      !(e.x >= worldX && e.x < worldX + BLOCK_SIZE && 
        e.y >= worldY && e.y < worldY + BLOCK_SIZE)
    );
    
    // Effacer items
    collectibles = collectibles.filter(i => 
      !(i.x >= worldX && i.x < worldX + BLOCK_SIZE && 
        i.y >= worldY && i.y < worldY + BLOCK_SIZE)
    );
    hearts = hearts.filter(i => 
      !(i.x >= worldX && i.x < worldX + BLOCK_SIZE && 
        i.y >= worldY && i.y < worldY + BLOCK_SIZE)
    );
    powerupBlocks = powerupBlocks.filter(i => 
      !(i.x >= worldX && i.x < worldX + BLOCK_SIZE && 
        i.y >= worldY && i.y < worldY + BLOCK_SIZE)
    );
    
    needsRedraw = true;
    return;
  }
  
  // Placer selon le type
  switch (editorTool) {
    case "block":
      if (!getBlock(worldX, worldY)) {
        addBlock(worldX, worldY, editorValue);
        console.log("Bloc ajouté:", editorValue, "à", worldX, worldY);
        console.log("BlockGrid après ajout:", Object.keys(blockGrid).length, "blocs");
        console.log("Bloc existe maintenant?", getBlock(worldX, worldY));
        needsRedraw = true;
      } else {
        console.log("Bloc déjà existant à cette position!");
      }
      break;
      
    case "enemy":
      // Vérifier qu'il n'y a pas déjà un ennemi
      const hasEnemy = enemies.some(e => 
        e.x === worldX && e.y === worldY
      );
      if (!hasEnemy) {
        enemies.push(new Enemy(worldX, worldY, 40, 40, 2, worldX - 100, worldX + 100, editorValue));
        console.log("Ennemi ajouté:", editorValue);
        needsRedraw = true;
      }
      break;
      
    case "item":
      switch (editorValue) {
        case "collectible":
          collectibles.push({
            x: worldX + 5,
            y: worldY + 5,
            width: 30,
            height: 30,
            collected: false
          });
          console.log("Collectible ajouté");
          needsRedraw = true;
          break;
        case "heart":
          hearts.push({
            x: worldX + 5,
            y: worldY + 5,
            width: 30,
            height: 30,
            collected: false
          });
          console.log("Cœur ajouté");
          needsRedraw = true;
          break;
        case "powerup":
          powerupBlocks.push({
            x: worldX,
            y: worldY,
            width: 40,
            height: 40,
            type: "resource_all",
            amount: 5,
            hit: false
          });
          console.log("Bloc bonus ajouté");
          needsRedraw = true;
          break;
      }
      break;
      
    case "zone":
      if (editorValue === "start") {
        startZone = { x: worldX, y: worldY };
        // Mettre à jour la position de départ des joueurs
        for (let i = 0; i < players.length; i++) {
          players[i].savedX = worldX + i * 50;
          players[i].savedY = worldY;
        }
        console.log("Zone de départ définie");
        needsRedraw = true;
      } else if (editorValue === "finish") {
        finishLine.x = worldX;
        finishLine.y = worldY;
        finishLine.width = 200;
        finishLine.height = 100;
        finishZone.x = worldX;
        finishZone.y = worldY;
        finishZone.width = 200;
        finishZone.height = 100;
        console.log("Zone d'arrivée définie");
        needsRedraw = true;
      }
      break;
  }
}

// Mettre à jour la grille overlay
function updateGridOverlay() {
  const gridCanvas = document.getElementById("gridOverlay");
  const gridCtx = gridCanvas.getContext("2d");
  gridCanvas.width = CANVAS_WIDTH;
  gridCanvas.height = CANVAS_HEIGHT;
  
  if (!editorMode || !editorGrid) {
    gridCanvas.style.display = "none";
    return;
  }
  
  gridCanvas.style.display = "block";
  
  // IMPORTANT : Effacer complètement le canvas avec clearRect, pas avec un fond noir !
  gridCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  gridCtx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  gridCtx.lineWidth = 1;
  
  // Dessiner la grille
  const startX = Math.floor(cameraX / BLOCK_SIZE) * BLOCK_SIZE - cameraX;
  const startY = Math.floor(cameraY / BLOCK_SIZE) * BLOCK_SIZE - cameraY;
  
  for (let x = startX; x < CANVAS_WIDTH; x += BLOCK_SIZE) {
    gridCtx.beginPath();
    gridCtx.moveTo(x, 0);
    gridCtx.lineTo(x, CANVAS_HEIGHT);
    gridCtx.stroke();
  }
  
  for (let y = startY; y < CANVAS_HEIGHT; y += BLOCK_SIZE) {
    gridCtx.beginPath();
    gridCtx.moveTo(0, y);
    gridCtx.lineTo(CANVAS_WIDTH, y);
    gridCtx.stroke();
  }
}

// Fonctions de gestion des maps
function saveMap() {
  const mapName = prompt("Nom de la map :");
  if (!mapName) return;
  
  const mapData = {
    name: mapName,
    date: new Date().toISOString(),
    blocks: Object.entries(blockGrid).reduce((acc, [key, block]) => {
      if (!block.initial) { // Ne sauver que les blocs custom
        acc[key] = block;
      }
      return acc;
    }, {}),
    enemies: enemies.filter(e => !e.initial), // Sauver seulement les ennemis custom
    collectibles: collectibles.filter(c => !c.initial),
    hearts: hearts.filter(h => !h.initial),
    powerupBlocks: powerupBlocks.filter(p => !p.initial),
    zones: { start: startZone, finish: finishZone }
  };
  
  const mapId = `builderberuMap_${Date.now()}`;
  localStorage.setItem(mapId, JSON.stringify(mapData));
  
  alert(`Map "${mapName}" sauvegardée !`);
}

function loadMapMenu() {
  const mapList = document.getElementById("mapList");
  const content = document.getElementById("mapListContent");
  mapList.style.display = "block";
  
  content.innerHTML = "";
  
  // Lister toutes les maps
  for (let key in localStorage) {
    if (key.startsWith("builderberuMap_")) {
      try {
        const mapData = JSON.parse(localStorage.getItem(key));
        const mapDiv = document.createElement("div");
        mapDiv.className = "mapItem";
        mapDiv.innerHTML = `
          <strong>${mapData.name}</strong><br>
          <small>${new Date(mapData.date).toLocaleDateString()}</small><br>
          <button onclick="loadMap('${key}')">Charger</button>
          <button onclick="deleteMap('${key}')">🗑️</button>
        `;
        content.appendChild(mapDiv);
      } catch (e) {
        console.error("Erreur loading map:", e);
      }
    }
  }
  
  if (content.children.length === 0) {
    content.innerHTML = "<p>Aucune map sauvegardée</p>";
  }
}

function loadMap(mapId) {
  try {
    const mapData = JSON.parse(localStorage.getItem(mapId));
    
    // Nettoyer la map actuelle
    clearMap();
    
    // Charger les blocs
    Object.entries(mapData.blocks).forEach(([key, block]) => {
      blockGrid[key] = block;
    });
    
    // Charger les ennemis
    if (mapData.enemies) {
      mapData.enemies.forEach(enemyData => {
        enemies.push(new Enemy(enemyData.x, enemyData.y, 40, 40, enemyData.speed || 2, 
          enemyData.minX || enemyData.x - 100, enemyData.maxX || enemyData.x + 100, enemyData.type));
      });
    }
    
    // Charger les items
    if (mapData.collectibles) collectibles.push(...mapData.collectibles);
    if (mapData.hearts) hearts.push(...mapData.hearts);
    if (mapData.powerupBlocks) powerupBlocks.push(...mapData.powerupBlocks);
    
    // Charger les zones
    if (mapData.zones) {
      startZone = mapData.zones.start || startZone;
      finishZone = mapData.zones.finish || finishZone;
      finishLine = {...finishZone};
    }
    
    alert(`Map "${mapData.name}" chargée !`);
    closeMapList();
    needsRedraw = true;
  } catch (e) {
    alert("Erreur lors du chargement de la map");
    console.error(e);
  }
}

function deleteMap(mapId) {
  if (confirm("Supprimer cette map ?")) {
    localStorage.removeItem(mapId);
    loadMapMenu(); // Rafraîchir la liste
  }
}

function closeMapList() {
  document.getElementById("mapList").style.display = "none";
}

function clearMap() {
  // Garder seulement les blocs initiaux
  const newGrid = {};
  Object.entries(blockGrid).forEach(([key, block]) => {
    if (block.initial) {
      newGrid[key] = block;
    }
  });
  blockGrid = newGrid;
  
  // Garder seulement les éléments initiaux
  enemies = enemies.filter(e => e.initial);
  collectibles = collectibles.filter(c => c.initial);
  hearts = hearts.filter(h => h.initial);
  powerupBlocks = powerupBlocks.filter(p => p.initial);
  
  // Réinitialiser les listes spéciales
  teleporters = [];
  cloudBlocks = [];
  
  needsRedraw = true;
}

function testMap() {
  // Réinitialiser et lancer le test
  players[0].x = startZone.x;
  players[0].y = startZone.y;
  players[0].lives = 3;
  score = 0;
  gameWon = false;
  
  toggleEditor(); // Quitter le mode éditeur
}

function resetMap() {
  if (confirm("Réinitialiser la map? Cela supprimera tous vos ajouts personnalisés!")) {
    // Réinitialiser les blocs
    blockGrid = {};
    initializeBlocks();
    
    // Réinitialiser les éléments
    enemies.length = 0;
    collectibles.length = 0;
    hearts.length = 0;
    powerupBlocks.length = 0;
    
    // Remettre les éléments de base
    initializeCollectibles();
    initializeEnemies();
    
    // Réinitialiser les zones
    startZone = { x: 100, y: 2360 };
    finishLine = {
      x: 19700,
      y: 2000,
      width: 200,
      height: 100,
    };
    finishZone = {...finishLine};
    
    // Réinitialiser les listes spéciales
    teleporters = [];
    cloudBlocks = [];
    
    // Réinitialiser l'inventaire
    for (let key in inventory) {
      inventory[key] = 0;
    }
    updateInventoryDisplay();
    
    needsRedraw = true;
    alert("Map réinitialisée!");
  }
}

function exportMap() {
  const mapData = {
    name: prompt("Nom de la map :") || "Map Custom",
    date: new Date().toISOString(),
    blocks: Object.entries(blockGrid).reduce((acc, [key, block]) => {
      if (!block.initial) {
        acc[key] = block;
      }
      return acc;
    }, {}),
    enemies: enemies.filter(e => !e.initial).map(e => ({
      x: e.x, y: e.y, type: e.type, speed: e.speed, minX: e.minX, maxX: e.maxX
    })),
    collectibles: collectibles.filter(c => !c.initial),
    hearts: hearts.filter(h => !h.initial),
    powerupBlocks: powerupBlocks.filter(p => !p.initial),
    zones: { start: startZone, finish: finishZone }
  };
  
  const dataStr = btoa(JSON.stringify(mapData));
  prompt("Code de la map (Copiez-le) :", dataStr);
}

function importMap() {
  const code = prompt("Collez le code de la map :");
  if (!code) return;
  
  try {
    const mapData = JSON.parse(atob(code));
    
    clearMap();
    
    Object.entries(mapData.blocks).forEach(([key, block]) => {
      blockGrid[key] = block;
    });
    
    if (mapData.enemies) {
      mapData.enemies.forEach(enemyData => {
        enemies.push(new Enemy(enemyData.x, enemyData.y, 40, 40, enemyData.speed || 2, 
          enemyData.minX || enemyData.x - 100, enemyData.maxX || enemyData.x + 100, enemyData.type));
      });
    }
    
    if (mapData.collectibles) collectibles.push(...mapData.collectibles);
    if (mapData.hearts) hearts.push(...mapData.hearts);
    if (mapData.powerupBlocks) powerupBlocks.push(...mapData.powerupBlocks);
    
    if (mapData.zones) {
      startZone = mapData.zones.start || startZone;
      finishZone = mapData.zones.finish || finishZone;
      finishLine = {...finishZone};
    }
    
    needsRedraw = true;
    alert(`Map "${mapData.name}" importée !`);
  } catch (e) {
    alert("Code invalide !");
  }
}

// Fonction de debug globale
window.debugEditor = function() {
  console.log("=== DEBUG EDITOR STATE ===");
  console.log("Editor mode:", editorMode);
  console.log("Editor tool:", editorTool);
  console.log("Editor value:", editorValue);
  console.log("Camera position:", {x: cameraX, y: cameraY});
  console.log("Total blocks:", Object.keys(blockGrid).length);
  console.log("needsRedraw:", needsRedraw);
  console.log("First 10 blocks:", Object.entries(blockGrid).slice(0, 10));
  
  // Compter les blocs par type
  const blockCounts = {};
  Object.values(blockGrid).forEach(block => {
    blockCounts[block.type] = (blockCounts[block.type] || 0) + 1;
  });
  console.log("Blocks by type:", blockCounts);
  
  // Vérifier la zone visible
  const visibleBlocks = [];
  const startX = Math.floor(cameraX / BLOCK_SIZE);
  const endX = Math.ceil((cameraX + CANVAS_WIDTH) / BLOCK_SIZE);
  const startY = Math.floor(cameraY / BLOCK_SIZE);
  const endY = Math.ceil((cameraY + CANVAS_HEIGHT) / BLOCK_SIZE);
  
  for (let gx = startX; gx <= endX; gx++) {
    for (let gy = startY; gy <= endY; gy++) {
      const key = `${gx},${gy}`;
      if (blockGrid[key]) {
        visibleBlocks.push({key, block: blockGrid[key]});
      }
    }
  }
  console.log("Visible blocks count:", visibleBlocks.length);
  console.log("First 5 visible blocks:", visibleBlocks.slice(0, 5));
};

// Fonction pour aller à la zone de départ
window.goToStart = function() {
  cameraX = 0;
  cameraY = 2300;
  needsRedraw = true;
  console.log("Camera déplacée à la zone de départ");
};

// Fonction pour aller au sol
window.goToGround = function() {
  cameraX = 0;
  cameraY = 2400;
  needsRedraw = true;
  console.log("Camera déplacée au niveau du sol");
};

// Test de rendu direct
window.testRender = function() {
  console.log("=== TEST RENDER ===");
  console.log("Canvas:", canvas);
  console.log("Context:", ctx);
  console.log("Canvas size:", canvas.width, "x", canvas.height);
  
  // Vérifier le gridOverlay
  const gridCanvas = document.getElementById("gridOverlay");
  console.log("Grid overlay:", gridCanvas);
  console.log("Grid overlay display:", gridCanvas.style.display);
  console.log("Grid overlay z-index:", gridCanvas.style.zIndex);
  
  // Dessiner un rectangle de test
  ctx.fillStyle = "red";
  ctx.fillRect(100, 100, 200, 200);
  console.log("Rectangle rouge dessiné à 100,100");
  
  // Vérifier les blocs visibles
  let count = 0;
  for (let x = 0; x < CANVAS_WIDTH; x += BLOCK_SIZE) {
    for (let y = 0; y < CANVAS_HEIGHT; y += BLOCK_SIZE) {
      const worldX = x + cameraX;
      const worldY = y + cameraY;
      const block = getBlock(worldX, worldY);
      if (block) {
        count++;
        if (count <= 5) {
          console.log("Bloc visible:", block, "à l'écran:", x, y);
        }
      }
    }
  }
  console.log("Total blocs visibles:", count);
};

// Forcer le redessin
window.forceRedraw = function() {
  console.log("Force redraw...");
  draw();
  console.log("Draw terminé");
};

// Basculer la grille
window.toggleGrid = function() {
  const gridCanvas = document.getElementById("gridOverlay");
  if (gridCanvas.style.display === "none") {
    gridCanvas.style.display = "block";
    console.log("Grille activée");
  } else {
    gridCanvas.style.display = "none";
    console.log("Grille désactivée");
  }
};

// Vérifier l'état des canvas
window.checkCanvas = function() {
  const gameCanvas = document.getElementById("gameCanvas");
  const gridCanvas = document.getElementById("gridOverlay");
  
  console.log("=== ÉTAT DES CANVAS ===");
  console.log("GameCanvas:", {
    width: gameCanvas.width,
    height: gameCanvas.height,
    display: gameCanvas.style.display,
    zIndex: gameCanvas.style.zIndex || "auto",
    position: gameCanvas.style.position || "static"
  });
  
  console.log("GridCanvas:", {
    width: gridCanvas.width,
    height: gridCanvas.height,
    display: gridCanvas.style.display,
    zIndex: gridCanvas.style.zIndex || "auto",
    position: gridCanvas.style.position || "static",
    background: gridCanvas.style.background || "none"
  });
};