import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { drawBeruModels, getModel, getHunterModels, getAvailableThemes, getHuntersByTheme } from './config/models';
import {
  RoomLobby,
  PlayerCursors,
} from '../../components/drawberu/MultiplayerUI';
import useMultiplayer from './hooks/useMultiplayer';
import DrawBeru from './DrawBeru';
import ChibiBubble from '../../components/ChibiBubble';
import { DRAWBERU_PROCESS_URL } from '../../utils/api';

const STATES = {
  HOME: 'home',
  PLAYING_SOLO: 'playing_solo',
  MULTI_LOBBY: 'multi_lobby',
  PLAYING_MULTI: 'playing_multi',
};

const DrawBeruLauncher = () => {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState(STATES.HOME);
  const [selectedHunter, setSelectedHunter] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState(null);

  // SEO for DrawBeru page
  useEffect(() => {
    document.title = 'DrawBeru - Free Anime Coloring Tool | Solo Leveling Arise';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = 'DrawBeru: free online anime coloring tool with auto-pipette magic brush. Color Solo Leveling Arise characters, export timelapse, share your art. No signup needed.';
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = 'DrawBeru - Free Anime Coloring Tool';
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = 'Color anime characters with a magic auto-pipette brush. Free, no signup, timelapse export.';
    return () => { document.title = 'BuilderBeru - Solo Leveling Arise Calculator'; };
  }, []);

  // Custom upload
  const [customModelData, setCustomModelData] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  // Multi
  const multiplayer = useMultiplayer();

  useEffect(() => {
    const roomCode = searchParams.get('room');
    if (roomCode) setState(STATES.MULTI_LOBBY);
  }, [searchParams]);

  useEffect(() => {
    if (multiplayer.gameStarted && state === STATES.MULTI_LOBBY) {
      setState(STATES.PLAYING_MULTI);
    }
  }, [multiplayer.gameStarted, state]);

  // ========== SAVED COLORINGS ==========
  const savedColorings = useMemo(() => {
    try {
      const data = JSON.parse(localStorage.getItem('builderberu_users') || '{}');
      const colorings = data.user?.accounts?.default?.colorings || {};
      const results = [];
      for (const [hunterId, models] of Object.entries(colorings)) {
        for (const [modelId, coloring] of Object.entries(models)) {
          if (coloring.preview) {
            results.push({
              hunterId,
              modelId,
              preview: coloring.preview,
              updatedAt: coloring.updatedAt || coloring.createdAt || 0,
              hunterName: drawBeruModels[hunterId]?.name || hunterId,
              modelName: getModel(hunterId, modelId)?.name || modelId,
            });
          }
        }
      }
      return results.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch { return []; }
  }, [state]); // recalc when coming back from drawing

  // ========== THEMES & HUNTERS ==========
  const themes = getAvailableThemes();
  const hunters = getHuntersByTheme(selectedTheme);

  // ========== HANDLERS ==========
  const startSolo = (hunterId, modelId) => {
    setSelectedHunter(hunterId);
    setSelectedModel(modelId);
    setCustomModelData(null);
    setState(STATES.PLAYING_SOLO);
  };

  const handleLeave = () => {
    if (multiplayer.room) multiplayer.leaveRoom();
    setCustomModelData(null);
    setState(STATES.HOME);
  };

  const handleCustomUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image trop lourde (max 10MB)');
      return;
    }

    setUploadStatus('uploading');
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${DRAWBERU_PROCESS_URL}/process?n_colors=8`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Erreur ${res.status}`);
      }
      const data = await res.json();
      const model = {
        id: 'custom',
        name: file.name.replace(/\.[^.]+$/, ''),
        reference: `data:image/png;base64,${data.reference}`,
        template: `data:image/png;base64,${data.template}`,
        canvasSize: data.canvas_size,
        palette: data.palette,
      };
      setCustomModelData(model);
      setUploadStatus(null);
      setState(STATES.PLAYING_SOLO);
    } catch (err) {
      setUploadError(err.message || 'Erreur lors du traitement');
      setUploadStatus(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const deleteColoring = (hunterId, modelId) => {
    try {
      const data = JSON.parse(localStorage.getItem('builderberu_users') || '{}');
      if (data.user?.accounts?.default?.colorings?.[hunterId]?.[modelId]) {
        delete data.user.accounts.default.colorings[hunterId][modelId];
        if (Object.keys(data.user.accounts.default.colorings[hunterId]).length === 0) {
          delete data.user.accounts.default.colorings[hunterId];
        }
        localStorage.setItem('builderberu_users', JSON.stringify(data));
        setState(prev => prev); // force re-render
      }
    } catch {}
  };

  // ========== RENDER STATES ==========

  if (state === STATES.PLAYING_SOLO) {
    return (
      <DrawBeru
        initialHunter={customModelData ? 'custom' : selectedHunter}
        initialModel={customModelData ? 'custom' : selectedModel}
        onBack={handleLeave}
        customModelData={customModelData}
      />
    );
  }

  if (state === STATES.PLAYING_MULTI) {
    return (
      <>
        <DrawBeru
          initialHunter={selectedHunter}
          initialModel={selectedModel}
          multiplayerMode={true}
          multiplayer={multiplayer}
          onBack={handleLeave}
        />
        <PlayerCursors cursors={multiplayer.otherCursors} />
      </>
    );
  }

  if (state === STATES.MULTI_LOBBY) {
    const hunterName = drawBeruModels[selectedHunter]?.name || selectedHunter;
    const modelData = getModel(selectedHunter, selectedModel);
    return (
      <RoomLobby
        room={multiplayer.room}
        players={multiplayer.players}
        spectators={multiplayer.spectators}
        isHost={multiplayer.isHost}
        myPlayer={multiplayer.myPlayer}
        settings={multiplayer.settings}
        isConnecting={multiplayer.isConnecting}
        connectionError={multiplayer.connectionError}
        selectedHunter={selectedHunter}
        selectedModel={selectedModel}
        hunterName={hunterName}
        modelName={modelData?.name || selectedModel}
        onCreateRoom={(name) => multiplayer.createRoom(name, selectedHunter, selectedModel)}
        onJoinRoom={async (code, name) => {
          const r = await multiplayer.joinRoom(code, name);
          if (r.room) { setSelectedHunter(r.room.hunter); setSelectedModel(r.room.model); }
        }}
        onLeaveRoom={() => { multiplayer.leaveRoom(); setState(STATES.HOME); }}
        onUpdateSettings={multiplayer.updateSettings}
        onStartGame={() => multiplayer.startGame()}
        onBack={() => { if (multiplayer.room) multiplayer.leaveRoom(); setState(STATES.HOME); }}
      />
    );
  }

  // ========== HOME ==========
  return (
    <div className="min-h-screen bg-[#0a0118] overflow-y-auto">
      {/* Hero */}
      <div className="relative bg-gradient-to-b from-purple-900/40 to-transparent pt-8 pb-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <img loading="lazy"
              src="https://api.builderberu.com/cdn/images/DrasBeru_zd8ju5.webp"
              alt="DrawBeru" className="w-12 h-12"
            />
            <div>
              <h1 className="text-3xl font-bold text-white">DrawBeru</h1>
              <p className="text-purple-300 text-sm">Choisis un modele, colorie-le, partage ton chef-d'oeuvre !</p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-3 mt-6">
            {/* Upload custom */}
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp"
              onChange={handleCustomUpload} className="hidden" id="custom-upload" />
            <label htmlFor="custom-upload"
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all ${
                uploadStatus === 'uploading'
                  ? 'bg-yellow-600/60 text-yellow-100 cursor-wait'
                  : 'bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-500 hover:to-orange-400 text-white shadow-lg shadow-pink-600/20'
              }`}>
              {uploadStatus === 'uploading' ? (
                <><span className="animate-spin">&#9203;</span> Traitement...</>
              ) : (
                <><span className="text-lg">&#128228;</span> Upload ton image</>
              )}
            </label>

            {/* Multi */}
            <button
              onClick={() => {
                if (!selectedHunter) {
                  const first = Object.keys(drawBeruModels)[0];
                  setSelectedHunter(first);
                  setSelectedModel('default');
                }
                setState(STATES.MULTI_LOBBY);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-purple-600/40 hover:bg-purple-600/60 text-purple-200 hover:text-white border border-purple-500/30 transition-all"
            >
              <span className="text-lg">&#128101;</span> Mode Multi
            </button>
          </div>

          {uploadError && (
            <p className="text-red-400 text-sm mt-2">&cross; {uploadError}</p>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-12">
        {/* Saved Colorings */}
        {savedColorings.length > 0 && (
          <section className="mb-10">
            <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <span className="text-xl">&#127912;</span> Mes coloriages
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {savedColorings.map(({ hunterId, modelId, preview, hunterName, modelName, updatedAt }) => (
                <div key={`${hunterId}-${modelId}`}
                  className="group relative rounded-xl overflow-hidden border-2 border-purple-500/20 hover:border-purple-400 transition-all bg-[#120822]">
                  {/* Preview */}
                  <button onClick={() => startSolo(hunterId, modelId)}
                    className="w-full aspect-square">
                    <img src={preview} alt={`${hunterName} ${modelName}`}
                      className="w-full h-full object-cover" loading="lazy" />
                  </button>
                  {/* Info */}
                  <div className="p-2">
                    <div className="text-white text-xs font-medium truncate">{hunterName}</div>
                    <div className="text-purple-400 text-[10px] truncate">{modelName}</div>
                  </div>
                  {/* Continue overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
                      Continuer &#9654;
                    </span>
                  </div>
                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Supprimer ce coloriage ?')) deleteColoring(hunterId, modelId);
                    }}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-600/80 hover:bg-red-500 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    title="Supprimer"
                  >&#10005;</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Theme filters */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-white font-bold text-lg">Nouveau coloriage</h2>
            <span className="text-purple-400 text-sm">({hunters.length} modeles)</span>
          </div>

          <div className="flex gap-2 flex-wrap mb-5">
            <button
              onClick={() => setSelectedTheme(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedTheme === null
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-purple-300 hover:bg-white/10'
              }`}
            >Tous</button>
            {themes.map(t => (
              <button key={t.id}
                onClick={() => setSelectedTheme(t.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedTheme === t.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-purple-300 hover:bg-white/10'
                }`}
              >{t.name}</button>
            ))}
          </div>
        </section>

        {/* Character grid — click = start drawing immediately */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {hunters.map(([hunterId, hunterData]) => {
            const firstModel = Object.values(hunterData.models)[0];
            const modelCount = Object.keys(hunterData.models).length;
            // Check if there's a saved coloring for this hunter
            const hasSaved = savedColorings.some(s => s.hunterId === hunterId);

            return (
              <button
                key={hunterId}
                onClick={() => startSolo(hunterId, 'default')}
                className="group relative aspect-square rounded-xl overflow-hidden border-2 border-purple-500/20 hover:border-purple-400 transition-all hover:scale-[1.03]"
              >
                <img src={firstModel?.reference} alt={hunterData.name}
                  className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Name */}
                <div className="absolute bottom-0 left-0 right-0 p-1.5 text-center">
                  <span className="text-white text-xs font-medium truncate block drop-shadow">
                    {hunterData.name}
                  </span>
                </div>

                {/* Model count badge */}
                {modelCount > 1 && (
                  <div className="absolute top-1.5 left-1.5 bg-purple-600/90 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {modelCount}
                  </div>
                )}

                {/* Saved indicator */}
                {hasSaved && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-green-500/90 rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px]">&#10003;</span>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                    Colorier &#9654;
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <ChibiBubble />
    </div>
  );
};

export default DrawBeruLauncher;
