import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

const GAME_SERVER_URL = import.meta.env.DEV
  ? 'http://localhost:3007/play'
  : 'https://api.builderberu.com/expedition2/play';

export default function RagnarosPve() {
  const [loading, setLoading] = useState(true);

  const gameUrl = useMemo(() => {
    try {
      const params = [];
      const authUser = JSON.parse(localStorage.getItem('builderberu_auth_user') || 'null');
      if (authUser?.username) params.push('user=' + encodeURIComponent(authUser.username));
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
      <div className="flex items-center justify-between px-4 py-2 bg-[#0a0a15] border-b border-orange-500/20">
        <Link
          to="/shadow-colosseum"
          className="flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-colors text-sm"
        >
          <span>&larr;</span>
          <span>Shadow Colosseum</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-lg">{'\uD83D\uDD25'}</span>
          <span className="font-bold text-orange-400 text-sm">Raid Ragnaros</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold">
            BETA
          </span>
        </div>
        <a
          href={gameUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
        >
          Ouvrir en plein ecran &nearr;
        </a>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center bg-[#0f0f1a]">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Connexion au serveur Ragnaros...</p>
            <p className="text-gray-600 text-[10px] mt-1">Boss Raid multijoueur — jusqu'a 10 joueurs</p>
          </div>
        </div>
      )}

      <iframe
        src={gameUrl}
        className={`flex-1 w-full border-0 ${loading ? 'hidden' : ''}`}
        style={{ minHeight: 'calc(100vh - 44px)' }}
        allow="autoplay; fullscreen"
        onLoad={() => setLoading(false)}
        title="Raid Ragnaros"
      />
    </div>
  );
}
