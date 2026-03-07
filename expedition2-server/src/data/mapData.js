// ── Ragnaros Arena — Map Definition ──
// Semi-circular stone platform surrounded by lava
// Boss emerges from lava pool at the top

import { GAME, WALLS } from '../config.js';

const P = GAME.PLATFORM;

// ── Platform shape: ellipse ──
// Point is on platform if ((x-cx)/rx)^2 + ((y-cy)/ry)^2 <= 1
export function isOnPlatform(x, y) {
  const dx = (x - P.cx) / P.radiusX;
  const dy = (y - P.cy) / P.radiusY;
  return (dx * dx + dy * dy) <= 1;
}

// ── Lava = anything outside the platform ──
export function isInLava(x, y) {
  return !isOnPlatform(x, y);
}

// ── Wall collision (AABB) ──
export function collidesWithWall(x, y, radius) {
  for (const w of WALLS) {
    // Closest point on rect to circle center
    const closestX = Math.max(w.x, Math.min(x, w.x + w.w));
    const closestY = Math.max(w.y, Math.min(y, w.y + w.h));
    const dx = x - closestX;
    const dy = y - closestY;
    if (dx * dx + dy * dy < radius * radius) {
      return w;
    }
  }
  return null;
}

// ── Resolve collision: push entity out of wall ──
export function resolveWallCollision(x, y, radius) {
  for (const w of WALLS) {
    const closestX = Math.max(w.x, Math.min(x, w.x + w.w));
    const closestY = Math.max(w.y, Math.min(y, w.y + w.h));
    const dx = x - closestX;
    const dy = y - closestY;
    const distSq = dx * dx + dy * dy;
    if (distSq < radius * radius && distSq > 0) {
      const dist = Math.sqrt(distSq);
      const pushX = (dx / dist) * (radius - dist);
      const pushY = (dy / dist) * (radius - dist);
      x += pushX;
      y += pushY;
    }
  }
  return { x, y };
}

// ── Clamp position to platform edge ──
// If moving off platform, clamp to the nearest platform edge
export function clampToPlatform(x, y) {
  const dx = (x - P.cx) / P.radiusX;
  const dy = (y - P.cy) / P.radiusY;
  const d = dx * dx + dy * dy;
  if (d <= 1) return { x, y }; // already on platform

  // Normalize to edge
  const scale = 1 / Math.sqrt(d);
  return {
    x: P.cx + dx * scale * P.radiusX,
    y: P.cy + dy * scale * P.radiusY,
  };
}

// ── Get distance to platform edge (negative = inside, positive = outside) ──
export function distToEdge(x, y) {
  const dx = (x - P.cx) / P.radiusX;
  const dy = (y - P.cy) / P.radiusY;
  const d = Math.sqrt(dx * dx + dy * dy);
  // Distance in world units (approximate)
  return (d - 1) * Math.min(P.radiusX, P.radiusY);
}

// ── Map rendering data (sent to client once) ──
export function getMapData() {
  return {
    width: GAME.ARENA_WIDTH,
    height: GAME.ARENA_HEIGHT,
    platform: {
      cx: P.cx,
      cy: P.cy,
      radiusX: P.radiusX,
      radiusY: P.radiusY,
    },
    walls: WALLS,
    bossSpawn: GAME.BOSS_SPAWN,
    playerSpawn: GAME.PLAYER_SPAWN,
  };
}
