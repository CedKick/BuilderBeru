// Fonction de collision
function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Créer une particule
function createParticle(x, y, color) {
  particles.push({
    x: x,
    y: y,
    velX: (Math.random() - 0.5) * 4,
    velY: (Math.random() - 0.5) * 4,
    size: Math.random() * 4 + 2,
    color: color,
    life: 30,
  });
}

// Mettre à jour les particules
function updateParticles(deltaTime = 1) {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.velX * deltaTime;
    p.y += p.velY * deltaTime;
    p.life -= deltaTime;
    p.size *= Math.pow(0.95, deltaTime);
    
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

// Créer une explosion
function createExplosion(x, y, damagePlayer = true) {
  // Créer plein de particules d'explosion
  for (let i = 0; i < 30; i++) {
    particles.push({
      x: x,
      y: y,
      velX: (Math.random() - 0.5) * 15,
      velY: (Math.random() - 0.5) * 15,
      size: Math.random() * 8 + 4,
      color: ["red", "orange", "yellow"][Math.floor(Math.random() * 3)],
      life: 40,
    });
  }
  
  // Détruire les blocs autour et créer des débris
  const explosionRadius = 120;
  for (let dx = -explosionRadius; dx <= explosionRadius; dx += BLOCK_SIZE) {
    for (let dy = -explosionRadius; dy <= explosionRadius; dy += BLOCK_SIZE) {
      const blockX = Math.floor((x + dx) / BLOCK_SIZE) * BLOCK_SIZE;
      const blockY = Math.floor((y + dy) / BLOCK_SIZE) * BLOCK_SIZE;
      const dist = Math.sqrt(Math.pow(blockX - x, 2) + Math.pow(blockY - y, 2));
      if (dist <= explosionRadius) {
        const block = getBlock(blockX, blockY);
        if (block && !block.initial) {
          removeBlock(blockX, blockY);
          
          // Créer des débris volants
          if (Math.random() < 0.7) {
            const angle = Math.atan2(blockY - y, blockX - x);
            const force = (1 - dist/explosionRadius) * 20;
            flyingDebris.push({
              x: blockX,
              y: blockY,
              velX: Math.cos(angle) * force,
              velY: Math.sin(angle) * force - 5,
              size: BLOCK_SIZE * 0.6,
              rotation: 0,
              rotSpeed: (Math.random() - 0.5) * 0.3,
              life: 60,
              type: block.type
            });
          }
        }
      }
    }
  }
  
  // Dégâts et projection des joueurs
  if (damagePlayer) {
    for (let player of players) {
      if (!player.active) continue;
      const dist = Math.sqrt(Math.pow(player.x - x, 2) + Math.pow(player.y - y, 2));
      if (dist < 150) {
        // Dégâts
        if (player.damageCooldown === 0) {
          player.lives--;
          player.damageCooldown = 60;
          updatePlayerLives(players.indexOf(player));
          
          if (player.lives <= 0) {
            player.active = false;
            // Vérifier si tous les joueurs sont morts
            if (players.every(p => !p.active)) {
              alert("Game Over! 😵 Score: " + score + " | Temps: " + formatTime(elapsedTime));
              location.reload();
            }
          }
        }
        
        // Knockback puissant
        const angle = Math.atan2(player.y - y, player.x - x);
        const force = (1 - dist/150) * 25;
        player.velX = Math.cos(angle) * force;
        player.velY = Math.sin(angle) * force - 10;
        player.knockbackTimer = 20;
      }
    }
  }
  
  // Dégâts aux ennemis
  for (let j = enemies.length - 1; j >= 0; j--) {
    const enemy = enemies[j];
    const dist = Math.sqrt(Math.pow(enemy.x - x, 2) + Math.pow(enemy.y - y, 2));
    if (dist < 150) {
      enemies.splice(j, 1);
      score += 100;
      document.getElementById("scoreValue").textContent = score;
    }
  }
}

// Mettre à jour les débris volants
function updateFlyingDebris(deltaTime = 1) {
  for (let i = flyingDebris.length - 1; i >= 0; i--) {
    let debris = flyingDebris[i];
    debris.x += debris.velX * deltaTime;
    debris.y += debris.velY * deltaTime;
    debris.velY += gravity * 0.5 * deltaTime;
    debris.rotation += debris.rotSpeed * deltaTime;
    debris.life -= deltaTime;
    
    // Collision avec les joueurs
    for (let player of players) {
      if (!player.active) continue;
      if (player.damageCooldown === 0 && isColliding(debris, player)) {
        player.lives--;
        player.damageCooldown = 30;
        updatePlayerLives(players.indexOf(player));
        
        // Petit knockback
        player.velX = debris.velX * 0.3;
        player.velY = -5;
        
        // Détruire le débris
        flyingDebris.splice(i, 1);
        
        if (player.lives <= 0) {
          player.active = false;
          if (players.every(p => !p.active)) {
            alert("Game Over! 😵");
            location.reload();
          }
        }
        break;
      }
    }
    
    if (debris.life <= 0) {
      flyingDebris.splice(i, 1);
    }
  }
}

// Mettre à jour les projectiles
function updateProjectiles(deltaTime = 1) {
  // Projectiles des joueurs
  for (let i = projectiles.length - 1; i >= 0; i--) {
    let proj = projectiles[i];
    proj.x += proj.velX * deltaTime;
    proj.y += proj.velY * deltaTime;
    
    // Vérifier collision avec ennemis
    for (let j = enemies.length - 1; j >= 0; j--) {
      if (isColliding(proj, enemies[j])) {
        for (let k = 0; k < 10; k++) {
          createParticle(enemies[j].x + enemies[j].width/2, enemies[j].y + enemies[j].height/2, "red");
        }
        enemies.splice(j, 1);
        projectiles.splice(i, 1);
        score += 50;
        document.getElementById("scoreValue").textContent = score;
        break;
      }
    }
    
    // Vérifier collision avec blocs
    const block = getBlock(proj.x, proj.y);
    if (block) {
      if (blockTypes[block.type].solid) {
        // Les éponges absorbent les projectiles
        if (block.type === "sponge") {
          // Effet visuel d'absorption
          for (let k = 0; k < 5; k++) {
            createParticle(proj.x, proj.y, "yellow");
          }
        }
        projectiles.splice(i, 1);
        continue;
      }
    }
    
    // Supprimer si hors limites
    if (proj.x < 0 || proj.x > WORLD_WIDTH || proj.y < 0 || proj.y > WORLD_HEIGHT) {
      projectiles.splice(i, 1);
    }
  }
  
  // Projectiles ennemis
  for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
    let proj = enemyProjectiles[i];
    proj.x += proj.velX * deltaTime;
    proj.y += proj.velY * deltaTime;
    
    // Collision avec les joueurs
    for (let player of players) {
      if (!player.active) continue;
      if (player.damageCooldown === 0 && isColliding(proj, player)) {
        player.lives--;
        player.damageCooldown = 60;
        updatePlayerLives(players.indexOf(player));
        enemyProjectiles.splice(i, 1);
        
        // Knockback
        let knockbackForce = 8;
        player.velX = proj.velX > 0 ? knockbackForce : -knockbackForce;
        player.velY = -6;
        player.knockbackTimer = 10;
        
        // Particules
        for (let k = 0; k < 8; k++) {
          createParticle(player.x + player.width/2, player.y + player.height/2, "orange");
        }
        
        if (player.lives <= 0) {
          player.active = false;
          if (players.every(p => !p.active)) {
            alert("Game Over! 😵");
            location.reload();
          }
        }
        break;
      }
    }
    
    // Collision avec blocs
    const block = getBlock(proj.x, proj.y);
    if (block && blockTypes[block.type].solid) {
      // Les éponges absorbent TOUS les projectiles
      if (block.type === "sponge") {
        for (let k = 0; k < 5; k++) {
          createParticle(proj.x, proj.y, "yellow");
        }
      }
      enemyProjectiles.splice(i, 1);
      continue;
    }
    
    // Supprimer si hors limites
    if (proj.x < 0 || proj.x > WORLD_WIDTH || proj.y < 0 || proj.y > WORLD_HEIGHT) {
      enemyProjectiles.splice(i, 1);
    }
  }
}

// Formater le temps
function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Mettre à jour le timer
function updateTimer() {
  if (!gameWon) {
    elapsedTime = Date.now() - startTime;
    document.getElementById("timerValue").textContent = formatTime(elapsedTime);
  }
}

// Mettre à jour l'affichage de l'inventaire
function updateInventoryDisplay() {
  document.getElementById("stoneCount").textContent = inventory.stone;
  document.getElementById("iceCount").textContent = inventory.ice;
  document.getElementById("elasticCount").textContent = inventory.elastic;
  document.getElementById("lavaCount").textContent = inventory.lava;
  document.getElementById("tntCount").textContent = inventory.tnt;
  document.getElementById("cloudCount").textContent = inventory.cloud;
  document.getElementById("teleportCount").textContent = inventory.teleport;
  document.getElementById("fanCount").textContent = inventory.fan;
  document.getElementById("spongeCount").textContent = inventory.sponge;
}

// Mettre à jour l'affichage des powerups
function updatePowerupDisplay() {
  const display = document.getElementById("powerupValue");
  const player = players[0];
  
  if (buildMode) {
    display.textContent = "🔨 Mode Construction";
  } else if (player.powerup === "croquette") {
    display.textContent = `🦴 Croquettes (${player.ammo})`;
  } else if (player.powerup === "speed") {
    display.textContent = "⚡ Vitesse";
  } else if (player.powerup === "jump") {
    display.textContent = "🚀 Super Saut";
  } else if (player.hasKirbyPower) {
    display.textContent = `🎈 Kirby (${player.kirbyJumps}/${player.kirbyMaxJumps})`;
  } else {
    display.textContent = "Aucun";
  }
}

// Mettre à jour l'affichage des vies d'un joueur
function updatePlayerLives(playerIndex) {
  const ids = ["p1Lives", "p2Lives", "p3Lives"];
  const livesDisplay = document.getElementById(ids[playerIndex]);
  if (livesDisplay) {
    livesDisplay.innerHTML = "❤️".repeat(Math.max(0, players[playerIndex].lives));
  }
  
  // Mettre à jour aussi le HUD principal pour le joueur 1
  if (playerIndex === 0) {
    document.getElementById("lives").innerHTML = "❤️".repeat(Math.max(0, players[0].lives));
  }
}

// Vérifier la collecte des items
function checkCollectibles() {
  for (let player of players) {
    if (!player.active) continue;
    
    for (let item of collectibles) {
      if (!item.collected && isColliding(player, item)) {
        item.collected = true;
        score += 100;
        document.getElementById("scoreValue").textContent = score;
        
        for (let i = 0; i < 10; i++) {
          createParticle(item.x + item.width/2, item.y + item.height/2, "gold");
        }
      }
    }
    
    for (let heart of hearts) {
      if (!heart.collected && isColliding(player, heart)) {
        heart.collected = true;
        if (player.lives < 5) {
          player.lives++;
          updatePlayerLives(players.indexOf(player));
        } else {
          score += 200;
        }
        document.getElementById("scoreValue").textContent = score;
        
        for (let i = 0; i < 15; i++) {
          createParticle(heart.x + heart.width/2, heart.y + heart.height/2, "pink");
        }
      }
    }
  }
}

// Mettre à jour la caméra
function updateCamera() {
  if (editorMode) {
    // En mode éditeur, la caméra est mise à jour dans gameLoop
    return;
  } else {
    // Mode jeu normal - suivre le joueur actif
    let targetPlayer = null;
    if (players[0].active && players[0].lives > 0) {
      targetPlayer = players[0];
    } else {
      for (let player of players) {
        if (player.active && player.lives > 0) {
          targetPlayer = player;
          break;
        }
      }
    }
    
    if (targetPlayer) {
      // Calculer la position idéale de la caméra avec zones mortes
      const deadZoneX = CANVAS_WIDTH * 0.3;
      const deadZoneY = CANVAS_HEIGHT * 0.3;
      
      // Position du joueur relative à la caméra
      const playerScreenX = targetPlayer.x - cameraX;
      const playerScreenY = targetPlayer.y - cameraY;
      
      // Ajuster horizontalement
      if (playerScreenX < deadZoneX) {
        cameraX = targetPlayer.x - deadZoneX;
      } else if (playerScreenX + targetPlayer.width > CANVAS_WIDTH - deadZoneX) {
        cameraX = targetPlayer.x + targetPlayer.width - (CANVAS_WIDTH - deadZoneX);
      }
      
      // Ajuster verticalement
      if (playerScreenY < deadZoneY) {
        cameraY = targetPlayer.y - deadZoneY;
      } else if (playerScreenY + targetPlayer.height > CANVAS_HEIGHT - deadZoneY) {
        cameraY = targetPlayer.y + targetPlayer.height - (CANVAS_HEIGHT - deadZoneY);
      }
      
      // Limiter la caméra aux bords du monde
      cameraX = Math.max(0, Math.min(cameraX, WORLD_WIDTH - CANVAS_WIDTH));
      cameraY = Math.max(0, Math.min(cameraY, WORLD_HEIGHT - CANVAS_HEIGHT));
    }
  }
}