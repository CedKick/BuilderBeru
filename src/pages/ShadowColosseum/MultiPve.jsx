import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

const GAME_SERVER_URL = 'http://159.223.225.71:3002/test';

export default function MultiPve() {
  const [loading, setLoading] = useState(true);

  // Build query params from localStorage (same logic as the old <a> tag)
  const gameUrl = useMemo(() => {
    try {
      const params = [];

      // Username
      const authUser = JSON.parse(localStorage.getItem('builderberu_auth_user') || 'null');
      if (authUser?.username) params.push('user=' + encodeURIComponent(authUser.username));

      // Hunter collection
      const coloData = JSON.parse(localStorage.getItem('shadow_colosseum_data') || '{}');
      const hunters = (coloData?.hunterCollection || [])
        .map(e => typeof e === 'string' ? e : e.id)
        .filter(Boolean);
      if (hunters.length > 0) params.push('hunters=' + hunters.join(','));

      // Raid level
      const raidChar = JSON.parse(localStorage.getItem('manaya_raid_character') || '{}');
      const raidData = JSON.parse(localStorage.getItem('shadow_colosseum_raid') || '{}');
      const raidLvl = raidData?.raidProfile?.level || raidChar.raidLevel || 1;
      if (raidLvl > 0) params.push('hlvl=' + raidLvl);

      // Preferred class
      if (raidChar.preferredClass) params.push('class=' + raidChar.preferredClass);

      // Stat points
      const totalPts = Math.max(0, (raidLvl - 1)) * 3;
      const sp = raidChar.statPoints || {};
      const usedPts = Object.values(sp).reduce((s, v) => s + v, 0);
      if (usedPts <= totalPts && usedPts > 0) {
        params.push('sp=' + encodeURIComponent(JSON.stringify(sp)));
      }

      return GAME_SERVER_URL + (params.length > 0 ? '?' + params.join('&') : '');
    } catch {
      return GAME_SERVER_URL;
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0a0a15] border-b border-purple-500/20">
        <Link
          to="/shadow-colosseum"
          className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors text-sm"
        >
          <span>←</span>
          <span>Shadow Colosseum</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-lg">🐉</span>
          <span className="font-bold text-emerald-400 text-sm">Raid Manaya</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-bold">
            BETA
          </span>
        </div>
        <a
          href={gameUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
        >
          Ouvrir en plein ecran ↗
        </a>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="flex-1 flex items-center justify-center bg-[#0f0f1a]">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Connexion au serveur Manaya...</p>
            <p className="text-gray-600 text-[10px] mt-1">Boss Raid multijoueur en temps reel</p>
          </div>
        </div>
      )}

      {/* Game iframe */}
      <iframe
        src={gameUrl}
        className={`flex-1 w-full border-0 ${loading ? 'hidden' : ''}`}
        style={{ minHeight: 'calc(100vh - 44px)' }}
        allow="autoplay; fullscreen"
        onLoad={() => setLoading(false)}
        title="Raid Manaya"
      />
    </div>
  );
}
