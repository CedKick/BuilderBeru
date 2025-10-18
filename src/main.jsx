// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import Builder from './BuilderBeru';
import GuideEditor from './pages/GuideEditor.jsx';
import HomePage from './HomePage.jsx';
import AppLayout from './AppLayout.jsx';
import HallOfFlameStandalone from './components/HallOfFlameStandalone.jsx';
import TrainingCenter from './components/Training/TrainingCenter.jsx';
import BeruvianWorld from "./pages/beruvianWorld/BeruvianWorld.jsx";
import CraftSimulator from './components/CraftSimulator/CraftSimulator.jsx';
import DamageCalculatorStandalone from './DamageCalculatorStandalone.jsx';
import ChibiWorld from './components/ChibiSystem/ChibiWorld.jsx';
import DrawBeru from './pages/DrawBeru/DrawBeru.jsx';

// 🔥 NOUVELLES IMPORTS - Remplacer POD
import BDGScore from './components/BDGScore.jsx';
import PODScore from './components/PODScore.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/build" element={<Builder />} />
          <Route path="/drawberu" element={<DrawBeru />} />
          <Route path="/craft-simulator" element={<CraftSimulator />} />
          <Route path="/trainingCenter" element={<TrainingCenter />} />
          <Route path="/guide-editor" element={<GuideEditor />} />
          
          {/* 🔥 REMPLACER L'ANCIENNE ROUTE POD */}
          <Route path="/pod" element={<PODScore />} />
          
          {/* 🔥 AJOUTER LA NOUVELLE ROUTE BDG */}
          <Route path="/bdg" element={<BDGScore />} />
          
          <Route path="/hall-of-flame" element={<HallOfFlameStandalone />} />
          <Route path="/damage-calculator" element={<DamageCalculatorStandalone />} />
          <Route path="/beruvian-world" element={<BeruvianWorld />} />
          <Route path="/chibi-world" element={<ChibiWorld />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  </React.StrictMode>
);