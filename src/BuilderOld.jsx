import React from 'react';

const artifactsLeft = ['Helmet', 'Chest', 'Gloves', 'Boots'];
const artifactsRight = ['Necklace', 'Bracelet', 'Ring', 'Earrings'];

export default function Builder() {
  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <h1 className="text-4xl font-bold text-center mb-12">Builder Beru - Solo Leveling Arise</h1>

      <div className="grid grid-cols-3 gap-8">
        {/* Colonne de gauche */}
        <div className="flex flex-col gap-6">
          {artifactsLeft.map((item, idx) => (
            <ArtifactCard key={idx} title={item} />
          ))}
        </div>

        {/* Partie centrale */}
        <div className="flex flex-col items-center justify-start gap-8">
          {/* Placeholder Image */}
          <div className="w-150 h-250 bg-gray-700 rounded-lg"></div>

          {/* Stats Display */}
          <div className="flex flex-col gap-2 text-lg">
            <div>Attack: 0</div>
            <div>Defense: 0</div>
            <div>HP: 0</div>
            <div>Critical Rate: 0%</div>
          </div>
        </div>

        {/* Colonne de droite */}
        <div className="flex flex-col gap-6">
          {artifactsRight.map((item, idx) => (
            <ArtifactCard key={idx} title={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ArtifactCard({ title }) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <select className="w-full mb-2 p-2 rounded bg-gray-700">
        <option>Select Main Stat</option>
      </select>
      {[1, 2, 3, 4].map((i) => (
        <select key={i} className="w-full mb-2 p-2 rounded bg-gray-700">
          <option>Substat {i}</option>
        </select>
      ))}
    </div>
  );
}