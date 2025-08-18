// src/components/ChibiSystem/ChibiPathfindingAdvanced.js
import React, { useState, useEffect } from 'react';
import { CHIBI_DATABASE } from './ChibiDatabase';

export class ChibiPathfindingAdvanced {
  constructor(pathData) {
    this.paths = pathData.paths || {};
    this.intersections = pathData.intersections || [];
    this.spawnPoints = pathData.spawnPoints || [];
    this.chibis = new Map();
    this.usedSpawns = new Set();
  }

  // Lisser les chemins pour des mouvements fluides
  smoothPath(path, smoothingFactor = 0.3) {
    if (path.length < 3) return path;
    
    const smoothed = [];
    
    // Garder le premier point
    smoothed.push(path[0]);
    
    // Lisser les points intermédiaires
    for (let i = 1; i < path.length - 1; i++) {
      const prev = path[i - 1];
      const curr = path[i];
      const next = path[i + 1];
      
      // Points de contrôle pour la courbe
      const cp1 = {
        x: curr.x - (next.x - prev.x) * smoothingFactor,
        y: curr.y - (next.y - prev.y) * smoothingFactor
      };
      
      const cp2 = {
        x: curr.x + (next.x - prev.x) * smoothingFactor,
        y: curr.y + (next.y - prev.y) * smoothingFactor
      };
      
      // Garder les points spéciaux tels quels
      if (curr.type !== 'normal') {
        smoothed.push(curr);
      } else {
        // Pour les points normaux, on peut les ajuster légèrement
        smoothed.push({
          ...curr,
          cp1: cp1,
          cp2: cp2
        });
      }
    }
    
    // Garder le dernier point
    smoothed.push(path[path.length - 1]);
    
    return smoothed;
  }

  // Créer un chibi avec spawn aléatoire
  createChibi(id, config = {}) {
    // Trouver un spawn point libre
    const availableSpawns = this.spawnPoints.filter(spawn => 
      !this.usedSpawns.has(spawn.id)
    );
    
    if (availableSpawns.length === 0) {
      console.warn('Plus de spawn points disponibles!');
      return null;
    }
    
    // Choisir un spawn aléatoire
    const spawn = availableSpawns[Math.floor(Math.random() * availableSpawns.length)];
    this.usedSpawns.add(spawn.id);
    
    const chibi = {
      id: id,
      x: spawn.x,
      y: spawn.y,
      spawnPoint: spawn.id,
      currentPath: null,
      currentSegment: 0,
      targetPoint: null,
      scale: this.calculateScale(spawn.y),
      speed: config.speed || 0.5 + Math.random() * 0.5,
      personality: config.personality || 'wanderer',
      isMoving: true,
      isPaused: false,
      pauseTimer: 0,
      lastIntersection: null,
      visitedPaths: new Set(),
      velocityX: 0,
      velocityY: 0,
      smoothedPath: null
    };
    
    this.chibis.set(id, chibi);
    
    // Assigner un chemin initial proche du spawn
    this.assignNearestPath(chibi);
    
    console.log(`🎮 ${id} créé au spawn ${spawn.id} (${spawn.x}, ${spawn.y})`);
    return chibi;
  }

  // Assigner le chemin le plus proche avec lissage
  assignNearestPath(chibi) {
    let nearestPath = null;
    let nearestDistance = Infinity;
    
    Object.entries(this.paths).forEach(([pathName, path]) => {
      path.forEach((point, index) => {
        const dist = Math.sqrt(
          Math.pow(point.x - chibi.x, 2) + 
          Math.pow(point.y - chibi.y, 2)
        );
        
        if (dist < nearestDistance) {
          nearestDistance = dist;
          nearestPath = { name: pathName, index: index };
        }
      });
    });
    
    if (nearestPath && nearestDistance < 100) {
      chibi.currentPath = nearestPath.name;
      chibi.currentSegment = nearestPath.index;
      
      // Lisser le chemin pour des mouvements fluides
      const originalPath = this.paths[nearestPath.name];
      chibi.smoothedPath = this.smoothPath(originalPath);
      
      chibi.targetPoint = chibi.smoothedPath[nearestPath.index];
      chibi.isMoving = true;
      chibi.visitedPaths.add(nearestPath.name);
      
      console.log(`🛤️ ${chibi.id} assigné au chemin ${nearestPath.name} (lissé)`);
    }
  }

  // Calculer l'échelle selon Y
  calculateScale(y, canvasHeight = 600) {
    const minScale = 0.5;  // En haut
    const maxScale = 1.1;  // En bas
    return minScale + (y / canvasHeight) * (maxScale - minScale);
  }

  // Update principal avec mouvements fluides
  update(deltaTime = 16) {
    this.chibis.forEach((chibi) => {
      // Gérer les pauses
      if (chibi.isPaused) {
        chibi.pauseTimer -= deltaTime;
        if (chibi.pauseTimer <= 0) {
          chibi.isPaused = false;
          chibi.isMoving = true;
        }
        return;
      }
      
      if (!chibi.isMoving || !chibi.currentPath) return;
      
      const path = chibi.smoothedPath || this.paths[chibi.currentPath];
      if (!path || !chibi.targetPoint) return;
      
      // Calculer la distance au point cible
      const dx = chibi.targetPoint.x - chibi.x;
      const dy = chibi.targetPoint.y - chibi.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Arrivé proche du point ?
      if (distance < 15) { // Augmenté pour éviter les arrêts brusques
        // Vérifier si on est à une intersection
        const intersection = this.checkIntersection(chibi.x, chibi.y);
        if (intersection && intersection.id !== chibi.lastIntersection) {
          chibi.atIntersection = true;
          
          // 15% de chance de pause à l'intersection
          if (Math.random() < 0.15) {
            chibi.isPaused = true;
            chibi.pauseTimer = 2000 + Math.random() * 3000;
          }
          
          this.handleIntersection(chibi, intersection);
          return;
        } else {
          chibi.atIntersection = false;
        }
        
        // Passer au point suivant
        chibi.currentSegment++;
        
        if (chibi.currentSegment >= path.length) {
          chibi.pathEnded = true;
          chibi.isPaused = true;
          chibi.pauseTimer = 3000 + Math.random() * 5000;
          this.handlePathEnd(chibi);
          return;
        } else {
          chibi.pathEnded = false;
        }
        
        chibi.targetPoint = path[chibi.currentSegment];
        
        // Pause aléatoire très rare (0.5%)
        if (Math.random() < 0.005) {
          chibi.isPaused = true;
          chibi.pauseTimer = 1000 + Math.random() * 2000;
        }
      } else {
        // Réinitialiser les flags
        chibi.atIntersection = false;
        chibi.pathEnded = false;
        
        // Mouvement fluide avec accélération/décélération
        let moveSpeed = chibi.speed * (deltaTime / 16);
        
        // Ralentir près des points pour des virages plus doux
        if (distance < 30) {
          moveSpeed *= (distance / 30);
        }
        
        // Calculer la nouvelle vélocité avec lissage
        const targetVelX = (dx / distance) * moveSpeed;
        const targetVelY = (dy / distance) * moveSpeed;
        
        // Interpolation douce de la vélocité (inertie)
        chibi.velocityX += (targetVelX - chibi.velocityX) * 0.2;
        chibi.velocityY += (targetVelY - chibi.velocityY) * 0.2;
        
        // Appliquer le mouvement
        chibi.x += chibi.velocityX;
        chibi.y += chibi.velocityY;
        
        // Mettre à jour l'échelle selon Y
        chibi.scale = this.calculateScale(chibi.y);
        
        // Direction basée sur la vélocité réelle
        chibi.direction = this.getDirection(chibi.velocityX, chibi.velocityY);
      }
    });
  }

  // Vérifier si on est à une intersection
  checkIntersection(x, y, threshold = 30) {
    for (const intersection of this.intersections) {
      const dist = Math.sqrt(
        Math.pow(intersection.x - x, 2) + 
        Math.pow(intersection.y - y, 2)
      );
      
      if (dist < threshold) {
        return intersection;
      }
    }
    return null;
  }

  // Gérer l'arrivée à une intersection
  handleIntersection(chibi, intersection) {
    console.log(`🔶 ${chibi.id} arrive à l'intersection ${intersection.id}`);
    
    chibi.lastIntersection = intersection.id;
    
    // Trouver tous les chemins possibles depuis cette intersection
    const possiblePaths = this.findPathsFromIntersection(intersection, chibi.currentPath);
    
    if (possiblePaths.length === 0) {
      // Pas d'autres chemins, continuer
      return;
    }
    
    // Filtrer les chemins déjà visités (si on veut de la variété)
    let availablePaths = possiblePaths.filter(p => !chibi.visitedPaths.has(p.pathName));
    
    // Si tous les chemins ont été visités, réinitialiser
    if (availablePaths.length === 0) {
      chibi.visitedPaths.clear();
      availablePaths = possiblePaths;
    }
    
    // Choisir aléatoirement
    const choice = availablePaths[Math.floor(Math.random() * availablePaths.length)];
    
    // Changer de chemin avec lissage
    chibi.currentPath = choice.pathName;
    chibi.currentSegment = choice.index;
    
    // Lisser le nouveau chemin
    const originalPath = this.paths[choice.pathName];
    chibi.smoothedPath = this.smoothPath(originalPath);
    
    chibi.targetPoint = chibi.smoothedPath[choice.index];
    chibi.visitedPaths.add(choice.pathName);
    
    console.log(`↪️ ${chibi.id} prend la direction ${choice.pathName}`);
  }

  // Trouver les chemins possibles depuis une intersection
  findPathsFromIntersection(intersection, currentPath) {
    const possiblePaths = [];
    const threshold = 40;
    
    Object.entries(this.paths).forEach(([pathName, path]) => {
      // Ne pas proposer le même chemin
      if (pathName === currentPath) return;
      
      path.forEach((point, index) => {
        const dist = Math.sqrt(
          Math.pow(point.x - intersection.x, 2) + 
          Math.pow(point.y - intersection.y, 2)
        );
        
        if (dist < threshold) {
          possiblePaths.push({
            pathName: pathName,
            index: index,
            distance: dist
          });
        }
      });
    });
    
    return possiblePaths;
  }

  // Gérer la fin d'un chemin
  handlePathEnd(chibi) {
    console.log(`🏁 ${chibi.id} a terminé le chemin ${chibi.currentPath}`);
    
    // Trouver un nouveau chemin proche
    this.assignNearestPath(chibi);
  }

  // Déterminer la direction
  getDirection(dx, dy) {
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    
    if (absDx > absDy) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  }

  // Libérer un spawn point
  releaseSpawn(chibiId) {
    const chibi = this.chibis.get(chibiId);
    if (chibi && chibi.spawnPoint) {
      this.usedSpawns.delete(chibi.spawnPoint);
    }
  }

  // Obtenir les stats
  getStats() {
    const pathUsage = {};
    
    this.chibis.forEach(chibi => {
      if (chibi.currentPath) {
        pathUsage[chibi.currentPath] = (pathUsage[chibi.currentPath] || 0) + 1;
      }
    });
    
    return {
      totalChibis: this.chibis.size,
      activeChibis: Array.from(this.chibis.values()).filter(c => c.isMoving).length,
      usedSpawns: this.usedSpawns.size,
      freeSpawns: this.spawnPoints.length - this.usedSpawns.size,
      pathUsage: pathUsage
    };
  }
}

// Hook React pour utiliser le pathfinding
export function useChibiPathfinding(pathData) {
  const [pathfinding] = useState(() => new ChibiPathfindingAdvanced(pathData));
  
  useEffect(() => {
    const animate = () => {
      pathfinding.update();
      requestAnimationFrame(animate);
    };
    
    animate();
  }, [pathfinding]);
  
  return pathfinding;
}