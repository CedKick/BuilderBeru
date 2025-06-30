import React, { useEffect, useRef } from "react";
import zoneMap from "../../data/zoneMaps.json";

const TILE_SIZE = 1024;

// Dictionnaire des images
const zoneImages = {
  "shadow_01": "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1751283779/shadowland_01_bxz7rw.png",
  "shadow_02": "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1751283779/shadowland_02_mqrvow.png",
  "shadow_03": "https://res.cloudinary.com/dbg7m8qjd/image/upload/v1751283779/shadowland_03_kcip6h.png"
};

// Ordre des zones à afficher (coordonnées logiques)
const coords = ["A1", "A2", "B1", "B2"];
const columns = 2; // nombre de colonnes dans la grille (à adapter selon layout réel)

export default function MapCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    coords.forEach((coord, index) => {
      const zone = zoneMap[coord];
      const x = index % columns;
      const y = Math.floor(index / columns);
      const posX = x * TILE_SIZE;
      const posY = y * TILE_SIZE;

      const tileId = zone?.tileId;

if (tileId && zoneImages[tileId]) {
  const img = new Image();
  img.src = zoneImages[tileId];
  img.onload = () => {
    console.log("Image loaded:", tileId); // ✅ remplacer zoneId par tileId
    ctx.drawImage(img, posX, posY, TILE_SIZE, TILE_SIZE);
  };

        img.onerror = () => {
  console.warn("Erreur de chargement image:", tileId);
};
      } else {
        // Noir si zone inconnue ou tile manquante
        ctx.fillStyle = "#000";
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
      }
    });
  }, []);

  return (
    <div className="overflow-auto border border-purple-800 w-full h-full">
      <canvas
        ref={canvasRef}
        width={TILE_SIZE * columns}
        height={TILE_SIZE * Math.ceil(coords.length / columns)}
        style={{ imageRendering: "pixelated", display: "block" }}
      />
    </div>
  );
}