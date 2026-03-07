import { MAP, ZONES } from '../config.js';

// Tile types
export const TILE = {
  WALL: 0,
  FLOOR: 1,
  WATER: 2,
  CRYSTAL: 3,
  ENTRANCE: 4,   // spawn point
  LAVA: 5,
};

// Generate a procedural cave using cellular automata
export class GrottoMap {
  constructor(seed = Date.now()) {
    this.width = MAP.WIDTH;
    this.height = MAP.HEIGHT;
    this.seed = seed;
    this.tiles = new Uint8Array(this.width * this.height);
    this.zoneMap = new Uint8Array(this.width * this.height); // zone index per tile
    this.spawnPoints = [];      // valid mob spawn positions per zone
    this.playerSpawn = null;    // entrance point

    this._rng = this._mulberry32(seed);
    this._generate();
  }

  // Simple seeded PRNG (mulberry32)
  _mulberry32(seed) {
    return () => {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  _idx(x, y) { return y * this.width + x; }

  get(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return TILE.WALL;
    return this.tiles[this._idx(x, y)];
  }

  getZone(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return 0;
    return this.zoneMap[this._idx(x, y)];
  }

  isWalkable(x, y) {
    const t = this.get(x, y);
    return t === TILE.FLOOR || t === TILE.CRYSTAL || t === TILE.ENTRANCE;
  }

  // Convert pixel position to tile coords
  pixelToTile(px, py) {
    return { tx: Math.floor(px / MAP.TILE_SIZE), ty: Math.floor(py / MAP.TILE_SIZE) };
  }

  // Convert tile coords to pixel center
  tileToPixel(tx, ty) {
    return { px: tx * MAP.TILE_SIZE + MAP.TILE_SIZE / 2, py: ty * MAP.TILE_SIZE + MAP.TILE_SIZE / 2 };
  }

  // Line-of-sight check between two pixel positions (Bresenham on tiles)
  hasLineOfSight(px1, py1, px2, py2) {
    let { tx: x0, ty: y0 } = this.pixelToTile(px1, py1);
    const { tx: x1, ty: y1 } = this.pixelToTile(px2, py2);
    const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    while (true) {
      if (!this.isWalkable(x0, y0)) return false;
      if (x0 === x1 && y0 === y1) return true;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
  }

  _generate() {
    const rng = this._rng;
    const w = this.width, h = this.height;

    // Step 1: Random fill
    for (let i = 0; i < w * h; i++) {
      this.tiles[i] = rng() < MAP.CAVE_FILL_CHANCE ? TILE.WALL : TILE.FLOOR;
    }

    // Force borders to be walls
    for (let x = 0; x < w; x++) {
      this.tiles[this._idx(x, 0)] = TILE.WALL;
      this.tiles[this._idx(x, h - 1)] = TILE.WALL;
    }
    for (let y = 0; y < h; y++) {
      this.tiles[this._idx(0, y)] = TILE.WALL;
      this.tiles[this._idx(w - 1, y)] = TILE.WALL;
    }

    // Step 2: Cellular automata smoothing
    const temp = new Uint8Array(w * h);
    for (let iter = 0; iter < MAP.CAVE_ITERATIONS; iter++) {
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          let walls = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              if (this.tiles[this._idx(x + dx, y + dy)] === TILE.WALL) walls++;
            }
          }
          if (this.tiles[this._idx(x, y)] === TILE.WALL) {
            temp[this._idx(x, y)] = walls >= MAP.CAVE_DEATH_LIMIT ? TILE.WALL : TILE.FLOOR;
          } else {
            temp[this._idx(x, y)] = walls >= MAP.CAVE_BIRTH_LIMIT ? TILE.WALL : TILE.FLOOR;
          }
        }
      }
      // Copy back (keep borders as walls)
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          this.tiles[this._idx(x, y)] = temp[this._idx(x, y)];
        }
      }
    }

    // Step 3: Carve guaranteed corridors between zones (vertical)
    const zoneH = Math.floor(h / ZONES.length);
    for (let z = 0; z < ZONES.length - 1; z++) {
      const corridorY = (z + 1) * zoneH;
      const corridorX = Math.floor(w * 0.3 + rng() * w * 0.4);
      // Carve a wide corridor (was 5-wide, now 9-wide)
      for (let dy = -4; dy <= 4; dy++) {
        for (let dx = -5; dx <= 5; dx++) {
          const cx = corridorX + dx;
          const cy = corridorY + dy;
          if (cx > 0 && cx < w - 1 && cy > 0 && cy < h - 1) {
            this.tiles[this._idx(cx, cy)] = TILE.FLOOR;
          }
        }
      }
    }

    // Step 4: Carve rooms in each zone for guaranteed open space
    for (let z = 0; z < ZONES.length; z++) {
      const yStart = z * zoneH + 3;
      const yEnd = Math.min((z + 1) * zoneH - 3, h - 2);
      const roomCount = 4 + Math.floor(rng() * 4);
      for (let r = 0; r < roomCount; r++) {
        const roomW = 10 + Math.floor(rng() * 12);
        const roomH = 8 + Math.floor(rng() * 10);
        const rx = 3 + Math.floor(rng() * (w - roomW - 6));
        const ry = yStart + Math.floor(rng() * Math.max(1, yEnd - yStart - roomH));
        for (let dy = 0; dy < roomH; dy++) {
          for (let dx = 0; dx < roomW; dx++) {
            const tx = rx + dx, ty = ry + dy;
            if (tx > 0 && tx < w - 1 && ty > 0 && ty < h - 1) {
              this.tiles[this._idx(tx, ty)] = TILE.FLOOR;
            }
          }
        }
      }
    }

    // Step 5: Flood fill to find largest connected region & fill isolated pockets
    this._connectCave();

    // Step 6: Assign zones (top = entrance, bottom = abyss)
    for (let y = 0; y < h; y++) {
      const zoneIdx = Math.min(ZONES.length - 1, Math.floor(y / zoneH));
      for (let x = 0; x < w; x++) {
        this.zoneMap[this._idx(x, y)] = zoneIdx;
      }
    }

    // Step 7: Add decorative tiles
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        if (this.tiles[this._idx(x, y)] !== TILE.FLOOR) continue;
        const zIdx = this.zoneMap[this._idx(x, y)];

        // Crystals in deep + abyss zones
        if (zIdx >= 2 && rng() < 0.02) {
          this.tiles[this._idx(x, y)] = TILE.CRYSTAL;
        }
        // Water pools in upper zone
        if (zIdx === 1 && rng() < 0.015) {
          this.tiles[this._idx(x, y)] = TILE.WATER;
        }
        // Lava in abyss
        if (zIdx === 3 && rng() < 0.02) {
          this.tiles[this._idx(x, y)] = TILE.LAVA;
        }
      }
    }

    // Step 8: Set player spawn in an OPEN area (not a dead-end)
    const entranceY = Math.floor(zoneH * 0.5);
    let spawnX = Math.floor(w / 2);
    let bestSpawn = null, bestOpenness = 0;
    // Search for the most open area near the center of the entrance zone
    for (let r = 0; r < 40; r++) {
      for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
          const tx = spawnX + dx, ty = entranceY + dy;
          if (!this.isWalkable(tx, ty)) continue;
          // Count walkable neighbors in a 5-tile radius (openness score)
          let openness = 0;
          for (let oy = -3; oy <= 3; oy++) {
            for (let ox = -3; ox <= 3; ox++) {
              if (this.isWalkable(tx + ox, ty + oy)) openness++;
            }
          }
          if (openness > bestOpenness) {
            bestOpenness = openness;
            bestSpawn = { tx, ty };
          }
        }
      }
      // Found a good open spot (at least 30 of 49 tiles walkable)
      if (bestSpawn && bestOpenness >= 30) break;
    }
    if (bestSpawn) {
      this.tiles[this._idx(bestSpawn.tx, bestSpawn.ty)] = TILE.ENTRANCE;
      this.playerSpawn = this.tileToPixel(bestSpawn.tx, bestSpawn.ty);
    }

    // Step 9: Collect spawn points per zone
    for (let z = 0; z < ZONES.length; z++) {
      const points = [];
      const yS = z * zoneH;
      const yE = Math.min((z + 1) * zoneH, h);
      for (let y = yS; y < yE; y++) {
        for (let x = 0; x < w; x++) {
          if (this.isWalkable(x, y)) {
            points.push(this.tileToPixel(x, y));
          }
        }
      }
      this.spawnPoints.push(points);
    }
  }

  // Flood-fill to connect the cave (fill small isolated areas with walls)
  _connectCave() {
    const w = this.width, h = this.height;
    const visited = new Uint8Array(w * h);
    const regions = [];

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        if (visited[this._idx(x, y)] || this.tiles[this._idx(x, y)] === TILE.WALL) continue;
        // BFS
        const region = [];
        const queue = [[x, y]];
        visited[this._idx(x, y)] = 1;
        while (queue.length > 0) {
          const [cx, cy] = queue.shift();
          region.push([cx, cy]);
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = cx + dx, ny = cy + dy;
            if (nx <= 0 || nx >= w - 1 || ny <= 0 || ny >= h - 1) continue;
            if (visited[this._idx(nx, ny)]) continue;
            if (this.tiles[this._idx(nx, ny)] === TILE.WALL) continue;
            visited[this._idx(nx, ny)] = 1;
            queue.push([nx, ny]);
          }
        }
        regions.push(region);
      }
    }

    // Keep largest region, fill others
    if (regions.length > 1) {
      regions.sort((a, b) => b.length - a.length);
      const largest = new Set(regions[0].map(([x, y]) => this._idx(x, y)));
      // Connect second-largest regions via tunnels to the largest
      for (let r = 1; r < Math.min(regions.length, 5); r++) {
        const region = regions[r];
        if (region.length > 20) {
          // Find closest tile pair between this region and the largest
          let bestDist = Infinity;
          let bestFrom = null, bestTo = null;
          // Sample to avoid O(n^2) for huge regions
          const sample1 = region.length > 100 ? region.filter((_, i) => i % 5 === 0) : region;
          const mainSample = regions[0].length > 100 ? regions[0].filter((_, i) => i % 10 === 0) : regions[0];
          for (const [x1, y1] of sample1) {
            for (const [x2, y2] of mainSample) {
              const d = Math.abs(x1 - x2) + Math.abs(y1 - y2);
              if (d < bestDist) { bestDist = d; bestFrom = [x1, y1]; bestTo = [x2, y2]; }
            }
          }
          if (bestFrom && bestTo) {
            this._carveTunnel(bestFrom[0], bestFrom[1], bestTo[0], bestTo[1]);
          }
        } else {
          // Too small — fill with walls
          for (const [x, y] of region) {
            this.tiles[this._idx(x, y)] = TILE.WALL;
          }
        }
      }
    }
  }

  _carveTunnel(x1, y1, x2, y2) {
    let x = x1, y = y1;
    while (x !== x2 || y !== y2) {
      if (x > 0 && x < this.width - 1 && y > 0 && y < this.height - 1) {
        // Widen tunnel to 4 tiles wide
        for (let oy = -1; oy <= 2; oy++) {
          for (let ox = -1; ox <= 2; ox++) {
            const wx = x + ox, wy = y + oy;
            if (wx > 0 && wx < this.width - 1 && wy > 0 && wy < this.height - 1) {
              this.tiles[this._idx(wx, wy)] = TILE.FLOOR;
            }
          }
        }
      }
      // Move toward target (Manhattan path)
      if (Math.abs(x2 - x) > Math.abs(y2 - y)) {
        x += x < x2 ? 1 : -1;
      } else {
        y += y < y2 ? 1 : -1;
      }
    }
  }

  // Serialize map for sending to clients (compressed: RLE)
  serialize() {
    // RLE encode tiles
    const rle = [];
    let current = this.tiles[0], count = 1;
    for (let i = 1; i < this.tiles.length; i++) {
      if (this.tiles[i] === current && count < 255) {
        count++;
      } else {
        rle.push(current, count);
        current = this.tiles[i];
        count = 1;
      }
    }
    rle.push(current, count);

    return {
      width: this.width,
      height: this.height,
      tileSize: MAP.TILE_SIZE,
      tiles: rle,
      zones: ZONES,
      playerSpawn: this.playerSpawn,
      seed: this.seed,
    };
  }
}
