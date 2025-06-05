import React from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  const activeItems = [
    { label: "BUILD", path: "/build" },
    { label: "PoD", path: "/pod" },
    { label: "GuideEditor", path: "/guide-editor" },
  ];

  const inactiveItems = [
    { label: "BoT", disabled: true },
    { label: "BdG", disabled: true },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white flex flex-col items-center justify-center py-10 px-4">
      <h1 className="text-4xl font-extrabold mb-10 text-purple-400 drop-shadow-md">
        Builder Béru
      </h1>

      <div className="grid grid-cols-2 gap-6 max-w-md w-full">
        {activeItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className="border border-purple-600 bg-[#1c1c2a] rounded-xl p-6 text-center text-xl font-bold text-white
              transition duration-300 transform hover:scale-105 hover:shadow-[0_0_15px_#a855f7] hover:bg-purple-700"
          >
            {item.label}
          </Link>
        ))}

        {inactiveItems.map((item) => (
          <div
            key={item.label}
            className="border border-gray-700 bg-[#1a1a1a] rounded-xl p-6 text-center text-xl font-bold text-gray-500
              opacity-50 cursor-not-allowed transition duration-300 transform hover:scale-100 hover:shadow-none"
          >
            {item.label}
          </div>
        ))}
      </div>

    <footer className="mt-12 text-sm text-gray-500 italic text-center max-w-sm">
  This is a fan-made website for Solo Leveling: Arise.  
  <br />
  Join our community on{" "}
  <a
    href="https://discord.gg/m8RCuDz5"
    target="_blank"
    rel="noopener noreferrer"
    className="text-purple-400 hover:underline"
  >
    Discord
  </a>
  .
</footer>
    </div>
  );
}
