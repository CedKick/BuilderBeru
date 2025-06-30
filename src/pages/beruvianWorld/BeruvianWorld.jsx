import React from "react";
import MapCanvas from "./MapCanvas"; // ajuste le chemin selon ton arborescence
import HunterMarker from "./HunterMarker";

export default function BeruvianWorld() {
  return (
   <div className="relative p-4">
      <h1 className="text-3xl font-bold text-purple-700 mb-4">🌍 Beruvian World - Map Test</h1>

      {/* Zone relative pour positionner le Hunter par-dessus le canvas */}
      <div className="relative w-[2048px] h-[2048px] border border-purple-800 overflow-auto">
        <MapCanvas />

        {/* Position du Hunter au centre de A1 (0,0) → x=512, y=512 */}
        <HunterMarker x={512} y={512} />
      </div>
    </div>
  );
}