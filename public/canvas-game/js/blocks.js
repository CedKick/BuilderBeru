// 🧱 SYSTÈME DE BLOCS

// Grille de blocs
let blockGrid = {};

// Ajouter un bloc
function addBlock(x, y, type, initial = false) {
  const gridX = Math.floor(x / BLOCK_SIZE);
  const gridY = Math.floor(y / BLOCK_SIZE);
  const key = `${gridX},${gridY}`;
  
  console.log("ADD BLOCK - Type:", type, "Key:", key, "Initial:", initial);
  
  blockGrid[key] = { x: gridX * BLOCK_SIZE, y: gridY * BLOCK_SIZE, type: type, initial: initial };
  
  console.log("Block added to grid:", blockGrid[key]);
  
  // Gérer les téléporteurs par paires
  if (type === "teleport" && !initial) {
    const newTeleporter = { x: gridX * BLOCK_SIZE, y: gridY * BLOCK_SIZE };
    teleporters.push(newTeleporter);
    
    // Si on a une paire complète, les lier
    if (teleporters.length >= 2) {
      const tp1 = teleporters[teleporters.length - 2];
      const tp2 = teleporters[teleporters.length - 1];
      tp1.partner = tp2;
      tp2.partner = tp1;
    }
  }
  
  // Gérer les blocs nuage
  if (type === "cloud" && !initial) {
    cloudBlocks.push({
      x: gridX * BLOCK_SIZE,
      y: gridY * BLOCK_SIZE,
      timer: -1,
      active: true
    });
  }
}

// Retirer un bloc
function removeBlock(x, y) {
  const gridX = Math.floor(x / BLOCK_SIZE);
  const gridY = Math.floor(y / BLOCK_SIZE);
  const key = `${gridX},${gridY}`;
  const block = blockGrid[key];
  
  if (block && !block.initial) {
    // Nettoyer les téléporteurs
    if (block.type === "teleport") {
      teleporters = teleporters.filter(tp => tp.x !== block.x || tp.y !== block.y);
    }
    
    // Nettoyer les nuages
    if (block.type === "cloud") {
      cloudBlocks = cloudBlocks.filter(cb => cb.x !== block.x || cb.y !== block.y);
    }
    
    delete blockGrid[key];
  }
}

// Obtenir un bloc
function getBlock(x, y) {
  const gridX = Math.floor(x / BLOCK_SIZE);
  const gridY = Math.floor(y / BLOCK_SIZE);
  const key = `${gridX},${gridY}`;
  const block = blockGrid[key];
  
  // DEBUG occasionnel pour voir si on trouve des blocs
  if (Math.random() < 0.0001 && block) {
    console.log("GET BLOCK found:", key, block);
  }
  
  return block;
}

// Initialiser les blocs de base
function initializeBlocks() {
  // Sol principal
  for (let x = 0; x < WORLD_WIDTH; x += BLOCK_SIZE) {
    for (let y = 2470; y < 3000; y += BLOCK_SIZE) {
      addBlock(x, y, "stone", true);
    }
  }
  
  // Plateformes de départ - seulement 3 blocs
  for (let x = 0; x < 120; x += BLOCK_SIZE) {
    addBlock(x, 2400, "stone", true);
  }
  
  // Quelques plateformes initiales
  const initialPlatforms = [
    {x: 400, y: 2350, w: 200, h: 20, type: "stone"},
    {x: 800, y: 2250, w: 200, h: 20, type: "stone"},
    {x: 1200, y: 2150, w: 200, h: 20, type: "ice"},
    {x: 1600, y: 2050, w: 200, h: 20, type: "stone"},
    {x: 2000, y: 1950, w: 20, h: 400, type: "stone"},
    {x: 2400, y: 1850, w: 200, h: 20, type: "elastic"},
    {x: 2800, y: 1750, w: 200, h: 20, type: "stone"},
    {x: 3200, y: 1650, w: 20, h: 600, type: "stone"},
    {x: 3600, y: 1550, w: 200, h: 20, type: "ice"},
    {x: 4000, y: 1450, w: 200, h: 20, type: "stone"},
  ];
  
  initialPlatforms.forEach(plat => {
    for (let x = plat.x; x < plat.x + plat.w; x += BLOCK_SIZE) {
      for (let y = plat.y; y < plat.y + plat.h; y += BLOCK_SIZE) {
        addBlock(x, y, plat.type, true);
      }
    }
  });
  
  // Ajouter quelques zones de lave
  for (let x = 1000; x < 1200; x += BLOCK_SIZE) {
    addBlock(x, 2440, "lava", true);
  }
  
  // Plateforme d'arrivée
  for (let x = 19600; x < 20000; x += BLOCK_SIZE) {
    for (let y = 2100; y < 2200; y += BLOCK_SIZE) {
      addBlock(x, y, "stone", true);
    }
  }
}

// Mettre à jour les blocs nuage
function updateCloudBlocks(deltaTime = 1) {
  for (let cloud of cloudBlocks) {
    if (cloud.timer > 0) {
      cloud.timer -= deltaTime;
      if (cloud.timer <= 0) {
        // Le nuage disparaît
        cloud.active = false;
        removeBlock(cloud.x, cloud.y);
        
        // Particules de disparition
        for (let i = 0; i < 10; i++) {
          createParticle(cloud.x + BLOCK_SIZE/2, cloud.y + BLOCK_SIZE/2, "white");
        }
      }
    }
  }
}

// Initialiser les collectibles
function initializeCollectibles() {
  // 🌟 COLLECTIBLES
  collectibles = [
    {x: 600, y: 2300, width: 30, height: 30, collected: false, initial: true},
    {x: 1400, y: 2100, width: 30, height: 30, collected: false, initial: true},
    {x: 2600, y: 1800, width: 30, height: 30, collected: false, initial: true},
    {x: 3800, y: 1500, width: 30, height: 30, collected: false, initial: true},
    {x: 5000, y: 1200, width: 30, height: 30, collected: false, initial: true},
    {x: 6500, y: 900, width: 30, height: 30, collected: false, initial: true},
    {x: 8000, y: 600, width: 30, height: 30, collected: false, initial: true},
    {x: 10000, y: 400, width: 30, height: 30, collected: false, initial: true},
    {x: 12000, y: 300, width: 30, height: 30, collected: false, initial: true},
    {x: 14000, y: 200, width: 30, height: 30, collected: false, initial: true},
    {x: 16000, y: 150, width: 30, height: 30, collected: false, initial: true},
    {x: 18000, y: 100, width: 30, height: 30, collected: false, initial: true},
  ];

  // ❤️ COEURS BONUS
  hearts = [
    {x: 800, y: 2200, width: 30, height: 30, collected: false, initial: true},
    {x: 1800, y: 1900, width: 30, height: 30, collected: false, initial: true},
    {x: 3000, y: 1600, width: 30, height: 30, collected: false, initial: true},
    {x: 4500, y: 1300, width: 30, height: 30, collected: false, initial: true},
    {x: 6000, y: 1000, width: 30, height: 30, collected: false, initial: true},
    {x: 7500, y: 700, width: 30, height: 30, collected: false, initial: true},
    {x: 9000, y: 500, width: 30, height: 30, collected: false, initial: true},
    {x: 11000, y: 350, width: 30, height: 30, collected: false, initial: true},
    {x: 13000, y: 250, width: 30, height: 30, collected: false, initial: true},
    {x: 15000, y: 200, width: 30, height: 30, collected: false, initial: true},
    {x: 17000, y: 150, width: 30, height: 30, collected: false, initial: true},
    {x: 19000, y: 2050, width: 30, height: 30, collected: false, initial: true},
  ];

  // 🎁 BLOCS BONUS
  powerupBlocks = [
    // Zone de départ - Ressources de base
    {x: 300, y: 2350, width: 40, height: 40, type: "resource_stone", amount: 10, hit: false, initial: true},
    {x: 500, y: 2250, width: 40, height: 40, type: "resource_ice", amount: 5, hit: false, initial: true},
    {x: 700, y: 2350, width: 40, height: 40, type: "croquette", hit: false, initial: true},
    {x: 900, y: 2150, width: 40, height: 40, type: "resource_elastic", amount: 3, hit: false, initial: true},
    
    // Zone 1
    {x: 1100, y: 2050, width: 40, height: 40, type: "speed", hit: false, initial: true},
    {x: 1300, y: 1950, width: 40, height: 40, type: "resource_cloud", amount: 5, hit: false, initial: true},
    {x: 1500, y: 1850, width: 40, height: 40, type: "resource_tnt", amount: 2, hit: false, initial: true},
    {x: 1700, y: 1750, width: 40, height: 40, type: "jump", hit: false, initial: true},
    
    // Zone 2
    {x: 2100, y: 1650, width: 40, height: 40, type: "resource_stone", amount: 15, hit: false, initial: true},
    {x: 2300, y: 1550, width: 40, height: 40, type: "kirby", hit: false, initial: true},
    {x: 2500, y: 1450, width: 40, height: 40, type: "resource_fan", amount: 3, hit: false, initial: true},
    {x: 2700, y: 1350, width: 40, height: 40, type: "resource_teleport", amount: 4, hit: false, initial: true},
    
    // Zone 3
    {x: 3100, y: 1250, width: 40, height: 40, type: "croquette", hit: false, initial: true},
    {x: 3300, y: 1150, width: 40, height: 40, type: "resource_sponge", amount: 3, hit: false, initial: true},
    {x: 3500, y: 1050, width: 40, height: 40, type: "resource_lava", amount: 5, hit: false, initial: true},
    {x: 3700, y: 950, width: 40, height: 40, type: "speed", hit: false, initial: true},
    
    // Zones suivantes avec plus de variété
    {x: 4100, y: 850, width: 40, height: 40, type: "resource_ice", amount: 10, hit: false, initial: true},
    {x: 4500, y: 750, width: 40, height: 40, type: "kirby", hit: false, initial: true},
    {x: 5000, y: 650, width: 40, height: 40, type: "resource_elastic", amount: 8, hit: false, initial: true},
    {x: 5500, y: 550, width: 40, height: 40, type: "resource_tnt", amount: 5, hit: false, initial: true},
    {x: 6000, y: 450, width: 40, height: 40, type: "jump", hit: false, initial: true},
    {x: 6500, y: 350, width: 40, height: 40, type: "resource_cloud", amount: 10, hit: false, initial: true},
    {x: 7000, y: 250, width: 40, height: 40, type: "croquette", hit: false, initial: true},
    {x: 7500, y: 150, width: 40, height: 40, type: "resource_all", amount: 5, hit: false, initial: true},
    
    // Zones finales
    {x: 10000, y: 500, width: 40, height: 40, type: "kirby", hit: false, initial: true},
    {x: 12000, y: 400, width: 40, height: 40, type: "resource_stone", amount: 20, hit: false, initial: true},
    {x: 14000, y: 300, width: 40, height: 40, type: "resource_all", amount: 10, hit: false, initial: true},
    {x: 16000, y: 200, width: 40, height: 40, type: "speed", hit: false, initial: true},
    {x: 18000, y: 100, width: 40, height: 40, type: "jump", hit: false, initial: true},
  ];
}

// Fonction pour initialiser les éléments du jeu
function initializeGameElements() {
  // Cette fonction est maintenant vide car on utilise les tableaux directement
  // Les éléments sont déjà initialisés avec leur flag "initial"
}