// 👾 SYSTÈME DES ENNEMIS

// Classe Enemy
class Enemy {
  constructor(x, y, width, height, speed, minX, maxX, type = "normal") {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.direction = 1;
    this.minX = minX;
    this.maxX = maxX;
    this.type = type;
    this.jumpTimer = 0;
    this.shootCooldown = 0;
  }

  update(deltaTime = 1) {
    this.x += this.speed * this.direction * deltaTime;

    if (this.type === "jumper") {
      this.jumpTimer += deltaTime;
      if (this.jumpTimer > 60) {
        this.y = this.baseY - Math.abs(Math.sin(this.jumpTimer * 0.05)) * 100;
      }
    }

    if (this.type === "shooter") {
      this.shootCooldown -= deltaTime;
      if (this.shootCooldown <= 0) {
        // Tirer vers le joueur le plus proche
        let closestPlayer = null;
        let closestDist = Infinity;
        
        for (let player of players) {
          if (!player.active) continue;
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < closestDist) {
            closestDist = dist;
            closestPlayer = player;
          }
        }
        
        if (closestPlayer && closestDist < 800) {
          const dx = closestPlayer.x - this.x;
          const dy = closestPlayer.y - this.y;
          
          enemyProjectiles.push({
            x: this.x + this.width/2,
            y: this.y + this.height/2,
            velX: (dx/closestDist) * 5,
            velY: (dy/closestDist) * 5,
            width: 12,
            height: 12,
          });
          
          this.shootCooldown = 120;
          
          for (let i = 0; i < 3; i++) {
            createParticle(this.x + this.width/2, this.y + this.height/2, "orange");
          }
        }
      }
    }

    if (this.x <= this.minX || this.x + this.width >= this.maxX) {
      this.direction *= -1;
    }
  }

  draw() {
    if (this.type === "shooter") {
      ctx.fillStyle = "#8B0000";
      ctx.fillRect(this.x - cameraX, this.y - cameraY, this.width, this.height);
      
      ctx.fillStyle = "orange";
      ctx.font = "16px Arial";
      ctx.fillText("🔥", this.x + 10 - cameraX, this.y + 25 - cameraY);
    } else {
      ctx.fillStyle = this.type === "jumper" ? "orange" : "red";
      ctx.fillRect(this.x - cameraX, this.y - cameraY, this.width, this.height);
    }
    
    ctx.fillStyle = "white";
    ctx.fillRect(this.x + 5 - cameraX, this.y + 5 - cameraY, 5, 5);
    ctx.fillRect(this.x + this.width - 10 - cameraX, this.y + 5 - cameraY, 5, 5);
  }

  isColliding(player) {
    return isColliding(player, this);
  }
}

// Initialiser les ennemis
function initializeEnemies() {
  enemies = [
    new Enemy(500, 2360, 40, 40, 1.5, 450, 550, "normal"),
    new Enemy(1200, 2360, 40, 40, 1.8, 1150, 1250, "shooter"),
    new Enemy(2300, 2360, 40, 40, 2, 2250, 2350, "normal"),
    new Enemy(3500, 1510, 40, 40, 2.2, 3450, 3550, "shooter"),
    new Enemy(5000, 1200, 40, 40, 2.5, 4950, 5050, "normal"),
    new Enemy(7000, 800, 40, 40, 2.8, 6950, 7050, "shooter"),
    new Enemy(9000, 600, 40, 40, 3, 8950, 9050, "normal"),
    new Enemy(11000, 400, 40, 40, 3.2, 10950, 11050, "shooter"),
    new Enemy(13000, 300, 40, 40, 3.5, 12950, 13050, "normal"),
    new Enemy(15000, 200, 40, 40, 3.8, 14950, 15050, "shooter"),
    new Enemy(17000, 150, 40, 40, 4, 16950, 17050, "normal"),
    new Enemy(19000, 2060, 40, 40, 4.2, 18950, 19050, "shooter"),
  ];

  // Marquer les ennemis initiaux
  enemies.forEach(enemy => {
    enemy.initial = true;
    if (enemy.type === "jumper") {
      enemy.baseY = enemy.y;
    }
  });
}

// Mettre à jour tous les ennemis
function updateEnemies(deltaTime = 1) {
  for (let enemy of enemies) {
    enemy.update(deltaTime);
    
    for (let player of players) {
      if (!player.active) continue;
      if (player.damageCooldown === 0 && enemy.isColliding(player)) {
        player.lives--;
        player.damageCooldown = 60;
        updatePlayerLives(players.indexOf(player));

        let knockbackForce = 10;
        if (player.x < enemy.x) {
          player.velX = -knockbackForce;
        } else {
          player.velX = knockbackForce;
        }
        player.velY = -8;
        player.knockbackTimer = 10;

        for (let i = 0; i < 8; i++) {
          createParticle(player.x + player.width/2, player.y + player.height/2, "red");
        }

        if (player.lives <= 0) {
          player.active = false;
          if (players.every(p => !p.active)) {
            alert("Game Over! 😵 Score: " + score + " | Temps: " + formatTime(elapsedTime));
            location.reload();
          }
        }
      }
    }
  }
}