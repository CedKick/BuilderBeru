// 🚀 INITIALISATION ET ÉVÉNEMENTS

// Événements clavier
document.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  
  // Activer/Désactiver le mode construction avec B (Joueur 1 seulement)
  if (e.code === "KeyB" && players[0].active && !editorMode) {
    buildMode = !buildMode;
    document.getElementById("buildMode").style.display = buildMode ? "block" : "none";
    updatePowerupDisplay();
  }
  
  // Changer de type de bloc avec les nombres (Joueur 1 en mode construction)
  if (buildMode && players[0].active && !editorMode) {
    const blockMap = {
      "Digit1": { type: "stone", name: "Pierre" },
      "Digit2": { type: "ice", name: "Glace" },
      "Digit3": { type: "elastic", name: "Élastique" },
      "Digit4": { type: "lava", name: "Lave" },
      "Digit5": { type: "tnt", name: "TNT" },
      "Digit6": { type: "cloud", name: "Nuage" },
      "Digit7": { type: "teleport", name: "Téléporteur" },
      "Digit8": { type: "fan", name: "Ventilateur" },
      "Digit9": { type: "sponge", name: "Éponge" }
    };
    
    if (blockMap[e.code]) {
      selectedBlockType = blockMap[e.code].type;
      document.getElementById("selectedBlock").textContent = blockMap[e.code].name;
    }
  }
  
  // Activer les joueurs avec Alt+9 et Alt+0
  if (e.code === "Digit9" && e.altKey && !players[1].active && !editorMode) {
    players[1].active = true;
    // Reconfigurer les contrôles quand on ajoute J2
    players[0].controls = {
      left: ["ArrowLeft"],
      right: ["ArrowRight"],
      up: ["ArrowUp"],
      down: ["ArrowDown"]
    };
    players[1].controls = {
      left: ["KeyJ"],
      right: ["KeyL"],
      up: ["KeyI"],
      down: ["KeyK"]
    };
    console.log("Joueur 2 activé! J1 = Flèches, J2 = IJKL");
  }
  if (e.code === "Digit0" && e.altKey && !players[2].active && !editorMode) {
    players[2].active = true;
    // Reconfigurer les contrôles quand on ajoute J3
    players[2].controls = {
      left: ["KeyQ", "KeyA"],
      right: ["KeyD"],
      up: ["KeyZ", "KeyW"],
      down: ["KeyS"]
    };
    console.log("Joueur 3 activé! J1 = Flèches, J2 = IJKL, J3 = ZQSD");
  }
  
  // Recentrer la caméra avec M
  if (e.code === "KeyM" && !editorMode) {
    // Forcer le recentrage sur le joueur prioritaire
    let targetPlayer = null;
    if (players[0].active && players[0].lives > 0) {
      targetPlayer = players[0];
    } else {
      // Chercher le premier joueur vivant
      for (let player of players) {
        if (player.active && player.lives > 0) {
          targetPlayer = player;
          break;
        }
      }
    }
    
    if (targetPlayer) {
      cameraX = targetPlayer.x + targetPlayer.width/2 - CANVAS_WIDTH/2;
      cameraY = targetPlayer.y + targetPlayer.height/2 - CANVAS_HEIGHT/2;
      cameraX = Math.max(0, Math.min(cameraX, WORLD_WIDTH - CANVAS_WIDTH));
      cameraY = Math.max(0, Math.min(cameraY, WORLD_HEIGHT - CANVAS_HEIGHT));
    }
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

// Événements souris
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
  
  // Si on est en mode éditeur, forcer le redessin pour voir l'indicateur de placement
  if (editorMode) {
    needsRedraw = true;
  }
});

canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault(); // Empêcher le menu contextuel
  if (editorMode) {
    handleEditorClick(e, true); // Clic droit = effacer
  }
});

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
  
  if (editorMode) {
    if (editorTool) {
      handleEditorClick(e, false);
    }
  } else if (buildMode && players[0].active) {
    const worldX = Math.floor((mouseX + cameraX) / BLOCK_SIZE) * BLOCK_SIZE;
    const worldY = Math.floor((mouseY + cameraY) / BLOCK_SIZE) * BLOCK_SIZE;
    
    // Vérifier qu'on ne place pas sur un joueur
    let canPlace = true;
    for (let player of players) {
      if (player.active && isColliding({x: worldX, y: worldY, width: BLOCK_SIZE, height: BLOCK_SIZE}, player)) {
        canPlace = false;
        break;
      }
    }
    
    if (canPlace) {
      const existingBlock = getBlock(worldX, worldY);
      
      if (!existingBlock && inventory[selectedBlockType] > 0) {
        // Ajouter nouveau bloc si on a les ressources
        addBlock(worldX, worldY, selectedBlockType);
        inventory[selectedBlockType]--;
        updateInventoryDisplay();
      }
    }
  } else if (players[0].powerup === "croquette" && players[0].ammo > 0) {
    // Tir de croquettes (Joueur 1 seulement)
    const worldMouseX = mouseX + cameraX;
    const worldMouseY = mouseY + cameraY;
    const player = players[0];
    const dx = worldMouseX - (player.x + player.width/2);
    const dy = worldMouseY - (player.y + player.height/2);
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    projectiles.push({
      x: player.x + player.width/2,
      y: player.y + player.height/2,
      velX: (dx/dist) * 10,
      velY: (dy/dist) * 10,
      width: 10,
      height: 10,
      owner: 0
    });
    
    player.ammo--;
    if (player.ammo <= 0) {
      player.powerup = null;
      updatePowerupDisplay();
    }
  }
});

// Sélection d'outil dans l'éditeur
document.addEventListener("DOMContentLoaded", () => {
  console.log("=== DOM LOADED ===");
  console.log("Canvas trouvé:", !!document.getElementById("gameCanvas"));
  console.log("EditorPanel trouvé:", !!document.getElementById("editorPanel"));
  
  const editorItems = document.querySelectorAll(".editorItem");
  console.log("Nombre d'items éditeur trouvés:", editorItems.length);
  
  editorItems.forEach(item => {
    item.addEventListener("click", () => {
      console.log("Item éditeur cliqué:", item.dataset.type, item.dataset.value);
      
      // Retirer la sélection précédente
      editorItems.forEach(i => i.classList.remove("selected"));
      item.classList.add("selected");
      
      editorTool = item.dataset.type;
      editorValue = item.dataset.value;
      
      // Actions spéciales
      if (editorTool === "tool" && editorValue === "clear") {
        if (confirm("Effacer toute la map ?")) {
          clearMap();
        }
      }
    });
  });
  
  // Initialiser et démarrer le jeu
  initGame();
});