import React, { useEffect, useRef } from "react";
import { getUpscaledImage } from "./imageUpscaler";

const TILE_SIZE = 1024; // Chaque tuile = exactement 1024x1024 pixels

// 🗺️ TOUTES LES COORDONNÉES 5x5
const coords = [
  "A1", "A2", "A3", "A4", "A5",
  "B1", "B2", "B3", "B4", "B5",
  "C1", "C2", "C3", "C4", "C5",
  "D1", "D2", "D3", "D4", "D5",
  "E1", "E2", "E3", "E4", "E5"
];


const columns = 5; // Grille 5x5

// 🖼️ DICTIONNAIRE DES IMAGES TEMPORAIRES
const zoneImages = {
  // ShadowLand (existantes)
  "shadow_01": "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1751283779/shadowland_01_bxz7rw.png",
  "shadow_02": "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1751283779/shadowland_02_mqrvow.png",
  "shadow_03": "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1751283779/shadowland_03_kcip6h.png",
  
  // PLACEHOLDERS TEMPORAIRES (à remplacer par tes vraies images)
  "light_01": "https://via.placeholder.com/1024/FFD700/000000?text=Lightborne+1",
  "light_02": "https://via.placeholder.com/1024/FFA500/000000?text=Lightborne+2",
  "earth_01": "https://via.placeholder.com/1024/228B22/FFFFFF?text=Earthcore+1",
  "earth_02": "https://via.placeholder.com/1024/32CD32/FFFFFF?text=Earthcore+2",
  "grass_01": "https://via.placeholder.com/1024/90EE90/000000?text=Plaines",
  "desert_01": "https://via.placeholder.com/1024/F4A460/000000?text=Desert",
  "snow_01": "https://via.placeholder.com/1024/F0F8FF/000000?text=Neige",
  "ice_01": "https://via.placeholder.com/1024/00FFFF/000000?text=Glacier",
  "lava_01": "https://via.placeholder.com/1024/FF4500/FFFF00?text=Volcan2"
};

export default function MapCanvas({ zoneMap, currentZone, hunterPosition }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 🎨 DESSINER CHAQUE ZONE
    coords.forEach((coord, index) => {
      const zone = zoneMap[coord];
      if (!zone) return;

      const x = (index % columns) * TILE_SIZE;
      const y = Math.floor(index / columns) * TILE_SIZE;

      // Si la zone est explorée et a une image
      if (zone.explored && zone.tileId && zoneImages[zone.tileId]) {
        const img = new Image();
        
        // D'abord essayer d'obtenir l'image upscalée
        getUpscaledImage(zoneImages[zone.tileId], TILE_SIZE).then(upscaledSrc => {
          img.src = upscaledSrc;
        }).catch(() => {
          img.src = zoneImages[zone.tileId];
        });
        
        img.onload = () => {
          // Si la zone est explorée et a une image
          ctx.drawImage(img, x, y, TILE_SIZE, TILE_SIZE);
          
          // 🏷️ AJOUTER LE NOM DE LA ZONE (plus petit)
          ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
          ctx.fillRect(x, y, 200, 30);
          
          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 16px Arial";
          ctx.fillText(zone.name, x + 10, y + 20);
          
          // 🎯 INDICATEUR DE ZONE ACTUELLE
          if (coord === currentZone) {
            ctx.strokeStyle = "#FFD700";
            ctx.lineWidth = 8;
            ctx.strokeRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
          }
          
          // 🏰 INDICATEUR DE CAPITALE
          if (zone.special === "Capital") {
            ctx.fillStyle = "#FFD700";
            ctx.font = "bold 32px Arial";
            ctx.fillText("👑", x + TILE_SIZE - 60, y + 50);
          }
          
          // ⚠️ NIVEAU DE DANGER
          if (zone.dangerLevel) {
            const dangerColor = zone.dangerLevel >= 8 ? "#FF0000" : 
                               zone.dangerLevel >= 5 ? "#FFA500" : 
                               zone.dangerLevel >= 3 ? "#FFFF00" : "#00FF00";
            
            ctx.fillStyle = dangerColor;
            ctx.font = "bold 18px Arial";
            ctx.fillText(`⚠️ Lvl ${zone.dangerLevel}`, x + TILE_SIZE - 120, y + TILE_SIZE - 20);
          }
          
          // 🏳️ FACTION QUI CONTRÔLE
          if (zone.controlledBy) {
            const factionColors = {
              "ShadowLand": "#4B0082",
              "Lightborne": "#FFD700",
              "Earthcore": "#228B22"
            };
            
            ctx.fillStyle = factionColors[zone.controlledBy] || "#808080";
            ctx.fillRect(x, y + TILE_SIZE - 10, TILE_SIZE, 10);
          }
        };
        
        img.onerror = () => {
          console.warn("Erreur chargement image:", zone.tileId);
          // Fallback : couleur unie
          drawFallbackZone(ctx, x, y, zone);
        };
        
      } else {
        // Zone non explorée ou sans image
        drawFallbackZone(ctx, x, y, zone);
      }
    });

    // 🌫️ FOG OF WAR pour les zones non explorées
    coords.forEach((coord, index) => {
      const zone = zoneMap[coord];
      if (!zone || zone.explored) return;

      const x = (index % columns) * TILE_SIZE;
      const y = Math.floor(index / columns) * TILE_SIZE;

      // Brouillard noir
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

      // Point d'interrogation
      ctx.fillStyle = "#444444";
      ctx.font = "bold 200px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("?", x + TILE_SIZE/2, y + TILE_SIZE/2);
      
      // Coordonnées
      ctx.fillStyle = "#666666";
      ctx.font = "bold 48px Arial";
      ctx.fillText(coord, x + TILE_SIZE/2, y + TILE_SIZE - 100);
    });

    // 🗺️ GRILLE DE COORDONNÉES
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2;
    
    // Lignes verticales
    for (let i = 1; i < columns; i++) {
      ctx.beginPath();
      ctx.moveTo(i * TILE_SIZE, 0);
      ctx.lineTo(i * TILE_SIZE, canvas.height);
      ctx.stroke();
    }
    
    // Lignes horizontales
    for (let i = 1; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * TILE_SIZE);
      ctx.lineTo(canvas.width, i * TILE_SIZE);
      ctx.stroke();
    }

  }, [zoneMap, currentZone]);

  // 🎨 FONCTION FALLBACK POUR ZONES SANS IMAGE
  function drawFallbackZone(ctx, x, y, zone) {
    const typeColors = {
      "ShadowLand": "#4B0082",
      "Lightborne": "#FFD700",
      "Earthcore": "#228B22",
      "Neutral": "#808080",
      "Glacier": "#00FFFF",
      "Volcano": "#FF4500"
    };
    
    ctx.fillStyle = zone.explored 
      ? (typeColors[zone.type] || "#333333")
      : "#000000";
    
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    
    if (zone.explored) {
      // Nom de la zone
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 32px Arial";
      ctx.textAlign = "center";
      ctx.fillText(zone.name, x + TILE_SIZE/2, y + TILE_SIZE/2);
    }
  }

  return (
    <canvas
      ref={canvasRef}
      width={TILE_SIZE * columns}
      height={TILE_SIZE * columns}
      style={{ 
        display: "block", 
        imageRendering: "pixelated",
        width: "100%",
        height: "auto"
      }}
    />
  );
}