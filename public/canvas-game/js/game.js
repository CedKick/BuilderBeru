// 🎮 LOGIQUE PRINCIPALE DU JEU

// Boucle principale du jeu
function gameLoop() {
  // Calculer le deltaTime
  const currentTime = Date.now();
  const deltaTime = Math.min((currentTime - lastFrameTime) / targetFrameTime, 2); // Cap à 2 pour éviter les gros sauts
  lastFrameTime = currentTime;
  
  // Mise à jour de la caméra en mode éditeur
  if (editorMode) {
    // DEBUG très occasionnel
    if (Math.random() < 0.001) {
      console.log("GAMELOOP - Mode éditeur actif, needsRedraw:", needsRedraw);
    }
    
    // Déplacement libre de la caméra avec deltaTime
    const adjustedCameraSpeed = editorCameraSpeed * deltaTime;
    
    if (keys["KeyQ"] || keys["KeyA"] || keys["ArrowLeft"]) {
      cameraX -= adjustedCameraSpeed;
      needsRedraw = true;
    }
    if (keys["KeyD"] || keys["ArrowRight"]) {
      cameraX += adjustedCameraSpeed;
      needsRedraw = true;
    }
    if (keys["KeyZ"] || keys["KeyW"] || keys["ArrowUp"]) {
      cameraY -= adjustedCameraSpeed;
      needsRedraw = true;
    }
    if (keys["KeyS"] || keys["ArrowDown"]) {
      cameraY += adjustedCameraSpeed;
      needsRedraw = true;
    }
    
    // Limiter la caméra aux bords du monde
    cameraX = Math.max(0, Math.min(cameraX, WORLD_WIDTH - CANVAS_WIDTH));
    cameraY = Math.max(0, Math.min(cameraY, WORLD_HEIGHT - CANVAS_HEIGHT));
    
    // TOUJOURS redessiner en mode éditeur
    draw();
  } else {
    // Mise à jour des joueurs seulement si on n'est pas en mode éditeur
    for (let i = 0; i < players.length; i++) {
      if (players[i].active) {
        updatePlayer(players[i], i, deltaTime);
        if (players[i].damageCooldown > 0) {
          players[i].damageCooldown = Math.max(0, players[i].damageCooldown - deltaTime);
        }
      }
    }
    
    updateParticles(deltaTime);
    updateFlyingDebris(deltaTime);
    updateProjectiles(deltaTime);
    updateCloudBlocks(deltaTime);
    checkCollectibles();
    updateTimer();
    updateEnemies(deltaTime);
    updateCamera();
    
    // Dessiner le jeu normal
    draw();
  }
  
  requestAnimationFrame(gameLoop);
}

// Initialiser le jeu
function initGame() {
  initializeBlocks();
  initializeCollectibles();
  initializeEnemies();
  initializeGameElements();
  updateInventoryDisplay();
  
  // Démarrer la boucle de jeu
  gameLoop();
}