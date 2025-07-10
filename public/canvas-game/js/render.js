// 🎨 SYSTÈME DE RENDU

// Dessiner les blocs
function drawBlocks() {
  const startX = Math.floor(cameraX / BLOCK_SIZE);
  const endX = Math.ceil((cameraX + CANVAS_WIDTH) / BLOCK_SIZE);
  const startY = Math.floor(cameraY / BLOCK_SIZE);
  const endY = Math.ceil((cameraY + CANVAS_HEIGHT) / BLOCK_SIZE);

  // DEBUG: Log une fois tous les 300 frames (environ toutes les 5 secondes)
  if (Math.random() < 0.003 && editorMode) {
    console.log("DRAW BLOCKS - Camera:", {cameraX, cameraY});
    console.log("Drawing range X:", startX, "to", endX);
    console.log("Drawing range Y:", startY, "to", endY);
    console.log("Total blocks in grid:", Object.keys(blockGrid).length);
  }
  
  let blocksDrawn = 0;

  for (let gx = startX; gx <= endX; gx++) {
    for (let gy = startY; gy <= endY; gy++) {
      const block = blockGrid[`${gx},${gy}`];
      if (!block) continue;
      
      const blockData = blockTypes[block.type];
      const x = block.x - cameraX;
      const y = block.y - cameraY;
      
      // Trouver le nuage correspondant si c'est un nuage
      let cloudAlpha = 1;
      if (block.type === "cloud") {
        const cloud = cloudBlocks.find(c => c.x === block.x && c.y === block.y);
        if (cloud && cloud.timer > 0 && cloud.timer < 30) {
          cloudAlpha = cloud.timer / 30;
        }
      }
      
      ctx.save();
      ctx.globalAlpha = cloudAlpha;
      
      switch(block.type) {
        case "stone":
          ctx.fillStyle = blockData.color;
          ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
          ctx.strokeStyle = "#666";
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
          break;
          
        case "ice":
          ctx.fillStyle = blockData.color;
          ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
          ctx.strokeStyle = "#00BFFF";
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
          ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
          ctx.fillRect(x + 5, y + 2, BLOCK_SIZE - 10, 5);
          break;
          
        case "elastic":
          ctx.fillStyle = blockData.color;
          ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
          ctx.strokeStyle = "#FF1493";
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let i = 0; i < 4; i++) {
            ctx.moveTo(x + 5 + i*10, y + BLOCK_SIZE - 5);
            ctx.quadraticCurveTo(x + 10 + i*10, y + BLOCK_SIZE - 15, x + 15 + i*10, y + BLOCK_SIZE - 5);
          }
          ctx.stroke();
          break;
          
        case "lava":
          const time = Date.now() * 0.001;
          const gradient = ctx.createLinearGradient(x, y, x, y + BLOCK_SIZE);
          gradient.addColorStop(0, "#FF6347");
          gradient.addColorStop(0.5 + Math.sin(time) * 0.1, "#FF4500");
          gradient.addColorStop(1, "#8B0000");
          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
          ctx.fillStyle = "#FFD700";
          for (let i = 0; i < 3; i++) {
            const bubbleY = y + (time * 20 + i * 15) % BLOCK_SIZE;
            ctx.beginPath();
            ctx.arc(x + 10 + i*10, bubbleY, 2, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
          
        case "tnt":
          ctx.fillStyle = blockData.color;
          ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
          ctx.strokeStyle = "#654321";
          ctx.strokeRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
          ctx.fillStyle = "red";
          ctx.font = "bold 16px Arial";
          ctx.fillText("TNT", x + 5, y + 25);
          break;
          
        case "cloud":
          ctx.fillStyle = blockData.color;
          ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
          // Motif nuage
          ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
          ctx.beginPath();
          ctx.arc(x + 10, y + 20, 8, 0, Math.PI * 2);
          ctx.arc(x + 20, y + 15, 10, 0, Math.PI * 2);
          ctx.arc(x + 30, y + 20, 8, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case "teleport":
          // Effet portail animé
          const portalTime = Date.now() * 0.002;
          ctx.fillStyle = blockData.color;
          ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
          ctx.strokeStyle = "#8A2BE2";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
          // Spirale
          ctx.beginPath();
          ctx.arc(x + BLOCK_SIZE/2, y + BLOCK_SIZE/2, 15, portalTime, portalTime + Math.PI * 2);
          ctx.strokeStyle = "#DDA0DD";
          ctx.stroke();
          break;
          
        case "fan":
          ctx.fillStyle = blockData.color;
          ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
          // Lignes de vent
          ctx.strokeStyle = "#4682B4";
          ctx.lineWidth = 2;
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(x + 10, y + 10 + i*10);
            ctx.lineTo(x + 30, y + 5 + i*10);
            ctx.stroke();
          }
          break;
          
        case "sponge":
          ctx.fillStyle = blockData.color;
          ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
          // Trous d'éponge
          ctx.fillStyle = "#DAA520";
          for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
              ctx.beginPath();
              ctx.arc(x + 8 + i*12, y + 8 + j*12, 3, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          break;
      }
      
      ctx.restore();
      blocksDrawn++;
    }
  }
  
  // DEBUG: Si on est en mode éditeur et qu'on a dessiné des blocs
  if (editorMode && Math.random() < 0.01) {
    console.log("Blocks drawn this frame:", blocksDrawn);
  }
}

// Dessiner les éléments du jeu
function drawGameElements() {
  // Blocs bonus
  for (let block of powerupBlocks) {
    if (!block.hit) {
      ctx.fillStyle = "#FFD700";
      ctx.fillRect(block.x - cameraX, block.y - cameraY, block.width, block.height);
      ctx.strokeStyle = "#FFA500";
      ctx.lineWidth = 3;
      ctx.strokeRect(block.x - cameraX, block.y - cameraY, block.width, block.height);
      
      ctx.fillStyle = "#8B4513";
      ctx.font = "bold 24px Arial";
      ctx.fillText("?", block.x + 12 - cameraX, block.y + 28 - cameraY);
    } else if (!editorMode) {
      ctx.fillStyle = "#333";
      ctx.fillRect(block.x - cameraX, block.y - cameraY, block.width, block.height);
      ctx.strokeStyle = "#222";
      ctx.strokeRect(block.x - cameraX, block.y - cameraY, block.width, block.height);
    }
  }

  // Collectibles
  for (let item of collectibles) {
    if (!item.collected) {
      ctx.save();
      ctx.translate(item.x + item.width/2 - cameraX, item.y + item.height/2 - cameraY);
      ctx.rotate(Date.now() * 0.002);
      ctx.fillStyle = "gold";
      ctx.fillRect(-item.width/2, -item.height/2, item.width, item.height);
      ctx.strokeStyle = "yellow";
      ctx.strokeRect(-item.width/2, -item.height/2, item.width, item.height);
      ctx.restore();
    }
  }

  // Coeurs
  for (let heart of hearts) {
    if (!heart.collected) {
      if (editorMode) {
        ctx.font = "24px Arial";
        ctx.fillText("❤️", heart.x - cameraX, heart.y + 20 - cameraY);
      } else {
        ctx.save();
        ctx.translate(heart.x + heart.width/2 - cameraX, heart.y + heart.height/2 - cameraY);
        ctx.scale(1 + Math.sin(Date.now() * 0.003) * 0.1, 1 + Math.sin(Date.now() * 0.003) * 0.1);
        ctx.font = "24px Arial";
        ctx.fillText("❤️", -12, 8);
        ctx.restore();
      }
    }
  }

  // Zone d'arrivée
  ctx.fillStyle = "rgba(255, 215, 0, 0.3)";
  ctx.fillRect(finishLine.x - cameraX, finishLine.y - cameraY, finishLine.width, finishLine.height);
  ctx.strokeStyle = "gold";
  ctx.lineWidth = 4;
  ctx.strokeRect(finishLine.x - cameraX, finishLine.y - cameraY, finishLine.width, finishLine.height);
  ctx.fillStyle = "gold";
  ctx.font = "24px Arial";
  ctx.fillText("🏁 FIN", finishLine.x + 50 - cameraX, finishLine.y + 50 - cameraY);
}

// Dessiner les éléments spécifiques au mode éditeur
function drawEditorElements() {
  // Ennemis (toujours visibles en mode éditeur)
  for (let enemy of enemies) {
    if (enemy.type === "shooter") {
      ctx.fillStyle = "#8B0000";
    } else if (enemy.type === "jumper") {
      ctx.fillStyle = "orange";
    } else {
      ctx.fillStyle = "red";
    }
    ctx.fillRect(enemy.x - cameraX, enemy.y - cameraY, enemy.width, enemy.height);
    
    ctx.fillStyle = "white";
    ctx.fillRect(enemy.x + 5 - cameraX, enemy.y + 5 - cameraY, 5, 5);
    ctx.fillRect(enemy.x + enemy.width - 10 - cameraX, enemy.y + 5 - cameraY, 5, 5);
  }
  
  // Indicateur de placement
  const gridX = Math.floor((mouseX + cameraX) / BLOCK_SIZE) * BLOCK_SIZE;
  const gridY = Math.floor((mouseY + cameraY) / BLOCK_SIZE) * BLOCK_SIZE;
  
  if (editorTool && editorValue) {
    ctx.strokeStyle = "rgba(255, 255, 0, 0.7)";
    ctx.lineWidth = 2;
    ctx.strokeRect(gridX - cameraX, gridY - cameraY, BLOCK_SIZE, BLOCK_SIZE);
  }
  
  // Zone de départ
  ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
  ctx.fillRect(startZone.x - cameraX, startZone.y - cameraY, BLOCK_SIZE, BLOCK_SIZE);
  ctx.strokeStyle = "lime";
  ctx.lineWidth = 2;
  ctx.strokeRect(startZone.x - cameraX, startZone.y - cameraY, BLOCK_SIZE, BLOCK_SIZE);
  ctx.fillStyle = "white";
  ctx.font = "12px Arial";
  ctx.fillText("START", startZone.x + 2 - cameraX, startZone.y + 25 - cameraY);
  
  // Mettre à jour la grille
  updateGridOverlay();
}

// Dessiner les joueurs
function drawPlayers() {
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    if (!player.active) continue;
    
    if (player.damageCooldown > 0 && Math.floor(player.damageCooldown / 5) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }
    
    // Effet de slide
    if (player.isSliding) {
      ctx.fillStyle = "cyan";
      for (let j = 0; j < 3; j++) {
        ctx.globalAlpha = 0.3 - j * 0.1;
        ctx.fillRect(
          player.x - player.slideVel * j * 2 - cameraX,
          player.y - cameraY,
          player.width,
          player.height
        );
      }
      ctx.globalAlpha = 1;
    }
    
    // Effet Kirby
    if (player.hasKirbyPower) {
      // Aura rose
      ctx.strokeStyle = "pink";
      ctx.lineWidth = 3;
      ctx.strokeRect(player.x - 3 - cameraX, player.y - 3 - cameraY, player.width + 6, player.height + 6);
      
      // Nuages sous les pieds pendant le vol
      if (!player.grounded) {
        ctx.fillStyle = "rgba(255, 192, 203, 0.5)";
        ctx.beginPath();
        ctx.arc(player.x + player.width/2 - cameraX, player.y + player.height + 10 - cameraY, 15, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Dessiner le joueur (sprite ou carré)
    if (player.useSprite && sprites.goguneeLeft.complete && sprites.goguneeRight.complete) {
      // Utiliser les sprites pour Gogunee
      const sprite = player.facing === -1 ? sprites.goguneeLeft : sprites.goguneeRight;
      ctx.drawImage(
        sprite,
        player.x - cameraX,
        player.y - cameraY,
        player.width,
        player.height
      );
    } else {
      // Dessiner un carré coloré pour les autres joueurs
      ctx.fillStyle = player.color;
      ctx.fillRect(player.x - cameraX, player.y - cameraY, player.width, player.height);
      
      // Yeux
      ctx.fillStyle = "white";
      if (player.facing === 1) {
        ctx.fillRect(player.x + 25 - cameraX, player.y + 10 - cameraY, 8, 8);
      } else {
        ctx.fillRect(player.x + 7 - cameraX, player.y + 10 - cameraY, 8, 8);
      }
    }
    
    // Indicateur de walljump
    if (player.canWallJump && !player.touchingWall && Date.now() - player.lastWallTime < 300) {
      ctx.strokeStyle = "cyan";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(player.x - 3 - cameraX, player.y - 3 - cameraY, player.width + 6, player.height + 6);
      ctx.setLineDash([]);
    }
    
    // Aura de powerup
    if (player.powerup) {
      ctx.strokeStyle = player.powerup === "speed" ? "yellow" : 
                       player.powerup === "jump" ? "cyan" : "orange";
      ctx.lineWidth = 3;
      ctx.strokeRect(player.x - 2 - cameraX, player.y - 2 - cameraY, player.width + 4, player.height + 4);
    }
    
    // Numéro du joueur (seulement si ce n'est pas Gogunee ou en mode multijoueur)
    if (players.filter(p => p.active).length > 1) {
      ctx.fillStyle = "white";
      ctx.font = "bold 12px Arial";
      ctx.fillText(`J${i+1}`, player.x + player.width/2 - 6 - cameraX, player.y - 5 - cameraY);
    }
    
    ctx.globalAlpha = 1;
  }
}

// Dessiner les effets
function drawEffects() {
  // Débris volants
  for (let debris of flyingDebris) {
    ctx.save();
    ctx.translate(debris.x + debris.size/2 - cameraX, debris.y + debris.size/2 - cameraY);
    ctx.rotate(debris.rotation);
    ctx.globalAlpha = debris.life / 60;
    ctx.fillStyle = blockTypes[debris.type].color;
    ctx.fillRect(-debris.size/2, -debris.size/2, debris.size, debris.size);
    ctx.restore();
  }

  // Projectiles des joueurs
  ctx.fillStyle = "brown";
  for (let proj of projectiles) {
    ctx.fillRect(proj.x - cameraX, proj.y - cameraY, proj.width, proj.height);
  }

  // Projectiles ennemis
  for (let proj of enemyProjectiles) {
    ctx.save();
    ctx.translate(proj.x + proj.width/2 - cameraX, proj.y + proj.height/2 - cameraY);
    ctx.rotate(Date.now() * 0.01);
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, proj.width);
    gradient.addColorStop(0, "yellow");
    gradient.addColorStop(0.5, "orange");
    gradient.addColorStop(1, "red");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, proj.width/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Particules
  for (let p of particles) {
    ctx.globalAlpha = p.life / 30;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - cameraX, p.y - cameraY, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

// Fonction principale de dessin
function draw() {
  // DEBUG très occasionnel
  if (Math.random() < 0.001 && editorMode) {
    console.log("DRAW - Editor mode:", editorMode, "needsRedraw:", needsRedraw);
  }
  // Background
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  gradient.addColorStop(0, "#1a0033");
  gradient.addColorStop(1, "#000000");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Étoiles
  ctx.fillStyle = "white";
  for (let i = 0; i < 50; i++) {
    let starX = (i * 397) % WORLD_WIDTH;
    let starY = (i * 251) % WORLD_HEIGHT;
    if (starX > cameraX && starX < cameraX + CANVAS_WIDTH &&
        starY > cameraY && starY < cameraY + CANVAS_HEIGHT) {
      ctx.fillRect(starX - cameraX, starY - cameraY, 2, 2);
    }
  }

  // Dessiner les blocs
  drawBlocks();

  // Indicateur de placement en mode construction
  if (buildMode && !editorMode) {
    const gridX = Math.floor((mouseX + cameraX) / BLOCK_SIZE) * BLOCK_SIZE;
    const gridY = Math.floor((mouseY + cameraY) / BLOCK_SIZE) * BLOCK_SIZE;
    
    // Vérifier si on a les ressources
    const hasResources = inventory[selectedBlockType] > 0;
    
    ctx.strokeStyle = hasResources ? "rgba(0, 255, 0, 0.5)" : "rgba(255, 0, 0, 0.5)";
    ctx.lineWidth = 2;
    ctx.strokeRect(gridX - cameraX, gridY - cameraY, BLOCK_SIZE, BLOCK_SIZE);
    
    // Prévisualisation du bloc
    ctx.fillStyle = blockTypes[selectedBlockType].color;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(gridX - cameraX, gridY - cameraY, BLOCK_SIZE, BLOCK_SIZE);
    ctx.globalAlpha = 1;
  }

  // Dessiner les éléments du jeu
  drawGameElements();

  // Si on est en mode éditeur, dessiner les éléments spéciaux
  if (editorMode) {
    drawEditorElements();
  }

  // Si on n'est pas en mode éditeur, dessiner le jeu normal
  if (!editorMode) {
    drawEffects();
    drawPlayers();
    
    // Ennemis
    for (let enemy of enemies) {
      enemy.draw();
    }
  }
}