// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import Builder from './BuilderBeru';
import GuideEditor from './pages/GuideEditor.jsx';
import POD from './components/Guide/POD.jsx';
import HomePage from './HomePage.jsx';
import AppLayout from './AppLayout.jsx';
import HallOfFlameStandalone from './components/HallOfFlameStandalone.jsx';
import BeruvianWorld from "./pages/beruvianWorld/BeruvianWorld.jsx";


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/build" element={<Builder />} />
          <Route path="/guide-editor" element={<GuideEditor />} />
          <Route path="/pod" element={<POD />} />
          <Route path="/hall-of-flame" element={<HallOfFlameStandalone />} />
          <Route path="/beruvian-world" element={<BeruvianWorld />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  </React.StrictMode>
);
