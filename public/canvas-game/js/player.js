// 🟪 SYSTÈME DES JOUEURS

const players = [
  // Joueur 1 - Gogunee le bâtisseur (ZQSD)
  {
    x: 100,
    y: 2360,
    width: 40,
    height: 40,
    color: "deeppink",
    velX: 0,
    velY: 0,
    speed: 8, // Augmenté de 4 à 5
    jumpPower: 15,
    grounded: false,
    canWallJump: false,
    facing: 1,
    invincible: false,
    powerup: null,
    ammo: 0,
    isSliding: false,
    slideVel: 0,
    touchingWall: false,
    wallSide: 0,
    lastWallTime: 0,
    wasAirborne: false,
    lavaDamageTimer: 0,
    lives: 3,
    damageCooldown: 0,
    knockbackTimer: 0,
    active: true,
    controls: {
      left: ["KeyQ", "KeyA"],
      right: ["KeyD"],
      up: ["KeyZ", "KeyW"],
      down: ["KeyS"]
    },
    kirbyJumps: 0,
    kirbyMaxJumps: 10,
    hasKirbyPower: false,
    useSprite: true // Nouveau: utiliser les sprites pour ce joueur
  },
  // Joueur 2 (IJKL)
  {
    x: 150,
    y: 2360,
    width: 40,
    height: 40,
    color: "dodgerblue",
    velX: 0,
    velY: 0,
    speed: 9, // Augmenté de 4.5 à 5.5
    jumpPower: 16,
    grounded: false,
    canWallJump: false,
    facing: 1,
    invincible: false,
    powerup: null,
    ammo: 0,
    isSliding: false,
    slideVel: 0,
    touchingWall: false,
    wallSide: 0,
    lastWallTime: 0,
    wasAirborne: false,
    lavaDamageTimer: 0,
    lives: 3,
    damageCooldown: 0,
    knockbackTimer: 0,
    active: false,
    controls: {
      left: ["KeyJ"],
      right: ["KeyL"],
      up: ["KeyI"],
      down: ["KeyK"]
    }
  },
  // Joueur 3 (Flèches)
  {
    x: 200,
    y: 2360,
    width: 40,
    height: 40,
    color: "limegreen",
    velX: 0,
    velY: 0,
    speed: 9, // Augmenté de 5 à 6
    jumpPower: 17,
    grounded: false,
    canWallJump: false,
    facing: 1,
    invincible: false,
    powerup: null,
    ammo: 0,
    isSliding: false,
    slideVel: 0,
    touchingWall: false,
    wallSide: 0,
    lastWallTime: 0,
    wasAirborne: false,
    lavaDamageTimer: 0,
    lives: 3,
    damageCooldown: 0,
    knockbackTimer: 0,
    active: false,
    controls: {
      left: ["ArrowLeft"],
      right: ["ArrowRight"],
      up: ["ArrowUp"],
      down: ["ArrowDown"]
    }
  }
];

// Mettre à jour un joueur
function updatePlayer(player, playerIndex, deltaTime = 1) {
  if (gameWon || !player.active) return;
  
  // Vérifier si le joueur était en l'air
  player.wasAirborne = !player.grounded && player.velY !== 0;
  
  if (player.knockbackTimer > 0) {
    player.knockbackTimer = Math.max(0, player.knockbackTimer - deltaTime);
  }

  // Appliquer les bonus
  let currentSpeed = player.speed * deltaTime;
  let currentJump = player.jumpPower;
  
  if (player.powerup === "speed") {
    currentSpeed = player.speed * 1.5 * deltaTime;
  } else if (player.powerup === "jump") {
    currentJump = player.jumpPower * 1.3;
  }

  // Contrôles
  if (player.knockbackTimer === 0) {
    // Gauche/Droite
    let leftPressed = false;
    let rightPressed = false;
    
    for (let key of player.controls.left) {
      if (keys[key]) leftPressed = true;
    }
    for (let key of player.controls.right) {
      if (keys[key]) rightPressed = true;
    }
    
    if (leftPressed) {
      if (!player.isSliding) {
        player.velX = -currentSpeed;
      }
      player.facing = -1;
    } else if (rightPressed) {
      if (!player.isSliding) {
        player.velX = currentSpeed;
      }
      player.facing = 1;
    } else {
      if (!player.isSliding) {
        player.velX *= friction;
      }
    }

    // Saut et walljump
    let upPressed = false;
    for (let key of player.controls.up) {
      if (keys[key]) upPressed = true;
    }
    
    const currentTime = Date.now();
    if (upPressed) {
      if (player.grounded) {
        // Saut normal
        player.velY = -currentJump;
        player.isSliding = false;
        if (player.hasKirbyPower) {
          player.kirbyJumps = player.kirbyMaxJumps - 1;
        }
      } else if (player.canWallJump && !player.touchingWall && currentTime - player.lastWallTime < 300) {
        // Walljump
        player.velY = -currentJump;
        player.velX = 8 * player.wallSide;
        
        for (let i = 0; i < 5; i++) {
          createParticle(player.x + player.width/2, player.y + player.height/2, "cyan");
        }
        player.canWallJump = false;
      } else if (player.hasKirbyPower && player.kirbyJumps > 0) {
        // Pouvoir Kirby - Vol!
        player.velY = -currentJump * 0.8;
        player.kirbyJumps--;
        
        // Particules roses de Kirby
        for (let i = 0; i < 3; i++) {
          createParticle(player.x + player.width/2, player.y + player.height, "pink");
        }
        
        updatePowerupDisplay();
        
        if (player.kirbyJumps <= 0) {
          player.hasKirbyPower = false;
          updatePowerupDisplay();
        }
      }
    }
  }

  // Gestion du slide
  if (player.isSliding) {
    player.x += player.slideVel * deltaTime;
    player.slideVel *= Math.pow(0.92, deltaTime);
    if (Math.abs(player.slideVel) < 0.3) {
      player.isSliding = false;
    }
  }

  player.velY += gravity * deltaTime;
  player.x += player.velX * deltaTime;
  player.y += player.velY * deltaTime;

  player.grounded = false;
  player.touchingWall = false;

  // Collisions avec les blocs
  const playerLeft = Math.floor(player.x / BLOCK_SIZE);
  const playerRight = Math.floor((player.x + player.width) / BLOCK_SIZE);
  const playerTop = Math.floor(player.y / BLOCK_SIZE);
  const playerBottom = Math.floor((player.y + player.height) / BLOCK_SIZE);

  for (let gx = playerLeft; gx <= playerRight; gx++) {
    for (let gy = playerTop; gy <= playerBottom; gy++) {
      const block = blockGrid[`${gx},${gy}`];
      if (!block) continue;
      
      const blockData = blockTypes[block.type];
      
      // Dégâts de lave
      if (blockData.damage && block.type === "lava") {
        player.lavaDamageTimer++;
        if (player.lavaDamageTimer > 30 && player.damageCooldown === 0) {
          player.lives--;
          player.damageCooldown = 60;
          updatePlayerLives(playerIndex);
          player.lavaDamageTimer = 0;
          
          for (let i = 0; i < 10; i++) {
            createParticle(player.x + player.width/2, player.y + player.height/2, "orange");
          }
          
          if (player.lives <= 0) {
            player.active = false;
            if (players.every(p => !p.active)) {
              alert("Game Over! 😵");
              location.reload();
            }
          }
        }
        continue;
      }
      
      if (!blockData.solid) continue;
      
      const blockRect = {
        x: block.x,
        y: block.y,
        width: BLOCK_SIZE,
        height: BLOCK_SIZE
      };
      
      if (isColliding(player, blockRect)) {
        // TNT explose au contact
        if (block.type === "tnt") {
          removeBlock(block.x, block.y);
          createExplosion(block.x + BLOCK_SIZE/2, block.y + BLOCK_SIZE/2);
          continue;
        }
        
        // Téléportation
        if (block.type === "teleport") {
          const tp = teleporters.find(t => t.x === block.x && t.y === block.y);
          if (tp && tp.partner && player.grounded) {
            player.x = tp.partner.x;
            player.y = tp.partner.y - player.height;
            
            // Effet de téléportation
            for (let i = 0; i < 20; i++) {
              createParticle(tp.x + BLOCK_SIZE/2, tp.y + BLOCK_SIZE/2, "purple");
              createParticle(tp.partner.x + BLOCK_SIZE/2, tp.partner.y + BLOCK_SIZE/2, "purple");
            }
            continue;
          }
        }
        
        // Calcul des collisions standard
        const overlapLeft = (player.x + player.width) - block.x;
        const overlapRight = (block.x + BLOCK_SIZE) - player.x;
        const overlapTop = (player.y + player.height) - block.y;
        const overlapBottom = (block.y + BLOCK_SIZE) - player.y;
        
        const minOverlapX = Math.min(overlapLeft, overlapRight);
        const minOverlapY = Math.min(overlapTop, overlapBottom);
        
        if (minOverlapX < minOverlapY) {
          // Collision horizontale
          if (overlapLeft < overlapRight) {
            player.x = block.x - player.width;
            player.touchingWall = true;
            player.wallSide = -1;
            player.lastWallTime = Date.now();
            player.canWallJump = true;
            player.facing = -1;
          } else {
            player.x = block.x + BLOCK_SIZE;
            player.touchingWall = true;
            player.wallSide = 1;
            player.lastWallTime = Date.now();
            player.canWallJump = true;
            player.facing = 1;
          }
          player.velX = 0;
          
          // Glissement sur mur
          if (player.velY > 0 && player.touchingWall) {
            player.velY *= 0.8;
          }
        } else {
          // Collision verticale
          if (overlapTop < overlapBottom) {
            // Atterrissage
            player.y = block.y - player.height;
            
            // Ventilateur - propulsion vers le haut
            if (blockData.windForce) {
              player.velY = -20;
              // Particules de vent
              for (let i = 0; i < 5; i++) {
                createParticle(block.x + BLOCK_SIZE/2, block.y, "lightblue");
              }
            }
            // Rebond élastique
            else if (blockData.bouncy) {
              player.velY = -Math.abs(player.velY) * 1.5;
              for (let i = 0; i < 8; i++) {
                createParticle(player.x + player.width/2, player.y + player.height, "magenta");
              }
            } else {
              player.velY = 0;
              player.grounded = true;
              
              // Activer le timer du nuage
              if (block.type === "cloud") {
                const cloud = cloudBlocks.find(c => c.x === block.x && c.y === block.y);
                if (cloud && cloud.timer === -1) {
                  cloud.timer = 60; // 1 seconde avant disparition
                }
              }
              
              // Slide sur bord
              if (player.wasAirborne && Math.abs(player.velY) > 2) {
                const playerCenter = player.x + player.width/2;
                const blockLeft = block.x;
                const blockRight = block.x + BLOCK_SIZE;
                const edgeDistance = 12;
                
                if (!blockData.slippery) {
                  if (playerCenter < blockLeft + edgeDistance && player.velX <= 0) {
                    player.isSliding = true;
                    player.slideVel = -3.5;
                  } else if (playerCenter > blockRight - edgeDistance && player.velX >= 0) {
                    player.isSliding = true;
                    player.slideVel = 3.5;
                  }
                }
              }
              
              // Effet de glace
              if (blockData.slippery && player.grounded) {
                player.velX *= 1.02;
                // Vérifier si le joueur appuie sur gauche ou droite
                let isPressingDirection = false;
                for (let key of player.controls.left.concat(player.controls.right)) {
                  if (keys[key]) {
                    isPressingDirection = true;
                    break;
                  }
                }
                if (isPressingDirection) {
                  player.velX *= 0.95;
                }
              }
            }
          } else {
            // Collision en haut
            player.y = block.y + BLOCK_SIZE;
            player.velY = 0;
          }
        }
      }
    }
  }
  
  // Reset le timer de lave
  const currentBlock = getBlock(player.x + player.width/2, player.y + player.height/2);
  if (!currentBlock || currentBlock.type !== "lava") {
    player.lavaDamageTimer = 0;
  }

  // Collision avec blocs bonus (Joueur 1 seulement peut collecter)
  if (playerIndex === 0) {
    for (let block of powerupBlocks) {
      if (!block.hit && isColliding(player, block) && player.velY < 0) {
        block.hit = true;
        player.velY = 0;
        
        // Donner le powerup ou les ressources
        if (block.type.startsWith("resource_")) {
          const resourceType = block.type.replace("resource_", "");
          if (resourceType === "all") {
            // Bonus de toutes les ressources
            inventory.stone += block.amount;
            inventory.ice += block.amount;
            inventory.elastic += Math.floor(block.amount / 2);
            inventory.lava += Math.floor(block.amount / 2);
            inventory.tnt += Math.floor(block.amount / 3);
            inventory.cloud += block.amount;
            inventory.teleport += Math.floor(block.amount / 2);
            inventory.fan += Math.floor(block.amount / 3);
            inventory.sponge += Math.floor(block.amount / 3);
          } else {
            inventory[resourceType] += block.amount;
          }
          updateInventoryDisplay();
          
          // Effet visuel ressources
          for (let i = 0; i < 20; i++) {
            createParticle(block.x + block.width/2, block.y + block.height/2, "gold");
          }
        } else if (block.type === "kirby") {
          // Pouvoir Kirby!
          player.hasKirbyPower = true;
          player.kirbyJumps = player.kirbyMaxJumps;
          updatePowerupDisplay();
          
          // Effet visuel Kirby
          for (let i = 0; i < 25; i++) {
            createParticle(block.x + block.width/2, block.y + block.height/2, "pink");
          }
        } else {
          // Powerups classiques
          player.powerup = block.type;
          if (block.type === "croquette") {
            player.ammo = 5;
          }
          updatePowerupDisplay();
          
          // Effet visuel
          for (let i = 0; i < 15; i++) {
            createParticle(block.x + block.width/2, block.y + block.height/2, "yellow");
          }
        }
      }
    }
  }

  // Limites du monde
  player.x = Math.max(0, Math.min(player.x, WORLD_WIDTH - player.width));
  
  if (player.y < 0) {
    player.y = 0;
    player.velY = 0;
  }
  
  // Respawn si tombe
  if (player.y > WORLD_HEIGHT - 50) {
    player.x = startZone.x + playerIndex * 50;
    player.y = startZone.y;
    player.velX = 0;
    player.velY = 0;
    player.isSliding = false;
    player.slideVel = 0;
    player.lives--;
    updatePlayerLives(playerIndex);
    if (player.lives <= 0) {
      player.active = false;
      if (players.every(p => !p.active)) {
        alert("Game Over! 😵");
        location.reload();
      }
    }
  }

  // Vérifier l'arrivée
  if (isColliding(player, finishLine) && !gameWon) {
    gameWon = true;
    const finalTime = formatTime(elapsedTime);
    document.getElementById("victoire").innerHTML = `🏆 VICTOIRE ! 🏆<br>Temps: ${finalTime}`;
    document.getElementById("victoire").style.display = "block";
    
    // Feu d'artifice
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        createParticle(
          finishLine.x + Math.random() * finishLine.width,
          finishLine.y + Math.random() * finishLine.height,
          ["gold", "yellow", "orange", "white"][Math.floor(Math.random() * 4)]
        );
      }, i * 20);
    }
  }
}