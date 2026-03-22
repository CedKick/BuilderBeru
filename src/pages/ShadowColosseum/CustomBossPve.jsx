import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ColosseumHeader from './SharedBattleComponents/ColosseumHeader';

const GAME_SERVER_URL = 'https://manaya.builderberu.com/test';

export default function CustomBossPve() {
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  const bossId = searchParams.get('bossId') || '';
  const bossName = searchParams.get('name') || 'Boss Custom';

  const gameUrl = useMemo(() => {
    try {
      const params = [];

      const authUser = JSON.parse(localStorage.getItem('builderberu_auth_user') || 'null');
      if (authUser?.username) params.push('user=' + encodeURIComponent(authUser.username));

      const coloData = JSON.parse(localStorage.getItem('shadow_colosseum_data') || '{}');
      const hunters = (coloData?.hunterCollection || [])
        .map(e => typeof e === 'string' ? e : e.id)
        .filter(Boolean);
      if (hunters.length > 0) params.push('hunters=' + hunters.join(','));

      const raidChar = JSON.parse(localStorage.getItem('manaya_raid_character') || '{}');
      const raidData = JSON.parse(localStorage.getItem('shadow_colosseum_raid') || '{}');
      const raidLvl = raidData?.raidProfile?.level || raidChar.raidLevel || 1;
      if (raidLvl > 0) params.push('hlvl=' + raidLvl);

      if (raidChar.preferredClass) params.push('class=' + raidChar.preferredClass);

      const totalPts = Math.max(0, (raidLvl - 1)) * 3;
      const sp = raidChar.statPoints || {};
      const usedPts = Object.values(sp).reduce((s, v) => s + v, 0);
      if (usedPts <= totalPts && usedPts > 0) {
        params.push('sp=' + encodeURIComponent(JSON.stringify(sp)));
      }

      if (bossId) params.push('bossId=' + encodeURIComponent(bossId));

      return GAME_SERVER_URL + (params.length > 0 ? '?' + params.join('&') : '');
    } catch {
      return GAME_SERVER_URL;
    }
  }, [bossId]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!bossId) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Aucun boss selectionne.</p>
          <Link to="/shadow-colosseum" className="col-btn col-btn-secondary text-sm">← Retour</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0f0f1a] flex flex-col overflow-hidden">
      <ColosseumHeader
        title={<><span className="truncate max-w-[160px]">{bossName}</span> <span className="text-[9px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30 font-bold">CUSTOM</span></>}
        emoji="✨" titleColor="text-violet-400"
        rightElement={<a href={gameUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors">Plein ecran ↗</a>}
      />

      <div className="flex-1 relative overflow-hidden">
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0f0f1a]">
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white font-bold text-lg mb-1">{bossName}</p>
              <p className="text-gray-400 text-sm">Connexion au serveur...</p>
              <p className="text-gray-600 text-[10px] mt-2">Boss Custom par la communaute</p>
            </div>
          </div>
        )}

        {/* Game iframe — wider than container to hide scrollbar */}
        <iframe
          src={gameUrl}
          className="h-full border-0"
          style={{ width: 'calc(100% + 20px)' }}
          allow="autoplay; fullscreen"
          onLoad={() => setLoading(false)}
          title={`Boss Custom: ${bossName}`}
        />
      </div>
    </div>
  );
}
