// src/main.jsx ou src/index.jsx selon ton projet
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Builder from './BuilderBeru'; // <<< ajoute cette ligne

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Builder />
  </React.StrictMode>,
);