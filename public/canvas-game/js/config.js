// ⚔️ CONFIGURATION DU JEU
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const WORLD_WIDTH = 20000;
const WORLD_HEIGHT = 3000;
const BLOCK_SIZE = 40;

// Physique
const gravity = 0.9; // Légèrement augmenté de 0.8
const friction = 0.8;

// Variables globales de jeu
let cameraX = 0;
let cameraY = 0;
let score = 0;
let gameWon = false;
let startTime = Date.now();
let elapsedTime = 0;
let buildMode = false;
let selectedBlockType = "stone";

// Variables pour le deltaTime
let lastFrameTime = Date.now();
const targetFPS = 60;
const targetFrameTime = 1000 / targetFPS;

// Arrays globaux
let particles = [];
let projectiles = [];
let enemyProjectiles = [];
let flyingDebris = [];
let teleporters = [];
let cloudBlocks = [];
let enemies = [];
let collectibles = [];
let hearts = [];
let powerupBlocks = [];

// Zones spéciales
let startZone = { x: 100, y: 2360 };
let finishZone = { x: 19700, y: 2000, width: 200, height: 100 };
let finishLine = {
  x: 19700,
  y: 2000,
  width: 200,
  height: 100,
};

// Variables souris
let mouseX = 0;
let mouseY = 0;

// État des touches
const keys = {};

// Inventaire des ressources
const inventory = {
  stone: 0,
  ice: 0,
  elastic: 0,
  lava: 0,
  tnt: 0,
  cloud: 0,
  teleport: 0,
  fan: 0,
  sponge: 0
};

// Images des sprites
const sprites = {
  goguneeLeft: new Image(),
  goguneeRight: new Image()
};

// Charger les sprites
sprites.goguneeLeft.src = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1752179029/gogunee_left_rhsnys.png';
sprites.goguneeRight.src = 'https://res.cloudinary.com/dbg7m8qjd/image/upload/v1752179029/gogunee_right_iihs8y.png';

// Types de blocs avec propriétés
const blockTypes = {
  stone: { color: "#4a4a4a", solid: true },
  ice: { color: "#87CEEB", solid: true, slippery: true },
  elastic: { color: "#FF69B4", solid: true, bouncy: true },
  lava: { color: "#FF4500", solid: false, damage: true },
  tnt: { color: "#8B4513", solid: true, explosive: true },
  cloud: { color: "#F0F8FF", solid: true, temporary: true },
  teleport: { color: "#9370DB", solid: true, teleporter: true },
  fan: { color: "#B0E0E6", solid: true, windForce: true },
  sponge: { color: "#F0E68C", solid: true, absorbent: true }
};