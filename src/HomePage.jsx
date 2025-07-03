import React from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  const activeItems = [
    { label: "BUILD", path: "/build" },
    { label: "🏆 Hall Of Flame", path: "/hall-of-flame", special: true }, // 🆕 AJOUTÉ
    { label: "PoD", path: "/pod" },
    { label: "GuideEditor", path: "/guide-editor" },
  ];

  const inactiveItems = [
    { label: "BoT", disabled: true },
    { label: "BdG", disabled: true },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white flex flex-col items-center justify-center py-10 px-4">
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        @keyframes glow-pulse {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(255, 105, 180, 0.5);
          }
          50% { 
            box-shadow: 0 0 40px rgba(255, 105, 180, 0.8), 0 0 60px rgba(255, 105, 180, 0.4);
          }
        }

        .character-announcement {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
          padding: 20px;
          border-radius: 15px;
          margin: 30px 0;
          max-width: 400px;
        }

        .new-character-text {
          text-shadow: 
            0 0 10px rgba(255, 105, 180, 0.8),
            0 0 20px rgba(255, 105, 180, 0.6),
            0 0 30px rgba(255, 105, 180, 0.4);
          animation: float 3s ease-in-out infinite;
        }

        .theorycraft-text {
          background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
        }

        .theorycraft-text::after {
          content: '...';
          position: absolute;
          animation: dots 1.5s infinite;
        }

        @keyframes dots {
          0%, 20% { content: '.'; }
          40% { content: '..'; }
          60%, 100% { content: '...'; }
        }

        .character-image {
          animation: glow-pulse 2s ease-in-out infinite;
        }
      `}</style>

      <h1 className="text-4xl font-extrabold mb-10 text-purple-400 drop-shadow-md">
        Builder Béru
      </h1>

      {/* 🎵 NOUVELLE SECTION SHUHUA & MIYEONN */}
      <div className="character-announcement">
        <img 
          src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1751537418/songtogether_lrdu7o.png"
          alt="Shuhua & Miyeon"
          className="character-image w-full rounded-lg hover:scale-105 transition-all duration-300"
        />
        
        <div className="mt-4 text-center">
          <p className="text-sm font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Build your new characters
          </p>
          <p className="new-character-text text-2xl font-extrabold mt-2 text-white">
            Shuhua & Miyeon
          </p>
          <p className="theorycraft-text text-sm mt-3 font-medium">
            Theorycraft in progress
          </p>
        </div>
      </div>

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