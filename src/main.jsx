// src/main.jsx
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import './i18n/i18n';
import { cloudStorage } from './utils/CloudStorage';

// Cloud sync on app startup (non-blocking)
cloudStorage.initialSync().catch(() => {});

import HomePage from './HomePage.jsx';
import AppLayout from './AppLayout.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Lazy loaded routes
const Builder = React.lazy(() => import('./BuilderBeru'));
const GuideEditor = React.lazy(() => import('./pages/GuideEditor.jsx'));
const HallOfFlameStandalone = React.lazy(() => import('./components/HallOfFlameStandalone.jsx'));
const TrainingCenter = React.lazy(() => import('./components/Training/TrainingCenter.jsx'));
const BeruvianWorld = React.lazy(() => import('./pages/beruvianWorld/BeruvianWorld.jsx'));
const CraftSimulator = React.lazy(() => import('./components/CraftSimulator/CraftSimulator.jsx'));
const DamageCalculatorStandalone = React.lazy(() => import('./DamageCalculatorStandalone.jsx'));
const ChibiWorld = React.lazy(() => import('./components/ChibiSystem/ChibiWorld.jsx'));
const DrawBeruLauncher = React.lazy(() => import('./pages/DrawBeru/DrawBeruLauncher.jsx'));
const BDGScore = React.lazy(() => import('./components/BDGScore.jsx'));
const PODScore = React.lazy(() => import('./components/PODScore.jsx'));
const Theorycraft = React.lazy(() => import('./pages/Theorycraft/Theorycraft.jsx'));
const LoreStory = React.lazy(() => import('./pages/LoreStory/LoreStory.jsx'));
const ShadowColosseum = React.lazy(() => import('./pages/ShadowColosseum/ShadowColosseum.jsx'));
const RaidMode = React.lazy(() => import('./pages/ShadowColosseum/RaidMode.jsx'));
const PvpMode = React.lazy(() => import('./pages/ShadowColosseum/PvpMode.jsx'));
const PveRanking = React.lazy(() => import('./pages/ShadowColosseum/PveRanking.jsx'));
const TrainingDummy = React.lazy(() => import('./pages/ShadowColosseum/TrainingDummy.jsx'));
const Codex = React.lazy(() => import('./pages/Codex/Codex.jsx'));
const MailInbox = React.lazy(() => import('./pages/MailInbox.jsx'));
const AdminMailSender = React.lazy(() => import('./pages/AdminMailSender.jsx'));
const FactionHub = React.lazy(() => import('./pages/FactionHub.jsx'));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p className="text-gray-500 text-xs">Chargement...</p>
    </div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <AppLayout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/build" element={<Builder />} />
              <Route path="/drawberu" element={<DrawBeruLauncher />} />
              <Route path="/craft-simulator" element={<CraftSimulator />} />
              <Route path="/trainingCenter" element={<TrainingCenter />} />
              <Route path="/guide-editor" element={<GuideEditor />} />
              <Route path="/pod" element={<PODScore />} />
              <Route path="/bdg" element={<BDGScore />} />
              <Route path="/hall-of-flame" element={<HallOfFlameStandalone />} />
              <Route path="/damage-calculator" element={<DamageCalculatorStandalone />} />
              <Route path="/beruvian-world" element={<BeruvianWorld />} />
              <Route path="/chibi-world" element={<ChibiWorld />} />
              <Route path="/lorestory" element={<LoreStory />} />
              <Route path="/theorycraft" element={<Theorycraft />} />
              <Route path="/theorycraft/:boss" element={<Theorycraft />} />
              <Route path="/theorycraft/:boss/:element" element={<Theorycraft />} />
              <Route path="/shadow-colosseum" element={<ShadowColosseum />} />
              <Route path="/shadow-colosseum/raid" element={<RaidMode />} />
              <Route path="/shadow-colosseum/pvp" element={<PvpMode />} />
              <Route path="/shadow-colosseum/pve-ranking" element={<PveRanking />} />
              <Route path="/codex" element={<Codex />} />
              <Route path="/mail" element={<MailInbox />} />
              <Route path="/admin/mail" element={<AdminMailSender />} />
              <Route path="/faction" element={<FactionHub />} />
              <Route path="/training-dummy" element={<TrainingDummy />} />
            </Routes>
          </Suspense>
        </AppLayout>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
