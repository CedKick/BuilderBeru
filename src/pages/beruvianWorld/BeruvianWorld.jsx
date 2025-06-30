import React from "react";
import MapCanvas from "./MapCanvas"; // ajuste le chemin selon ton arborescence

export default function BeruvianWorld() {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-purple-700 mb-4">🌍 Beruvian World - Map Test</h1>
      <MapCanvas />
    </div>
  );
}