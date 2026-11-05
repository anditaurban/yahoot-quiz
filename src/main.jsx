import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import { initLockInspect } from './utils/lockInspect';

// Aktifkan proteksi kunci inspect & anti-cheat
initLockInspect();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
