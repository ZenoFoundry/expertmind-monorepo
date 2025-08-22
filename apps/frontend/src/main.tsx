import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import AppUnified from './AppUnified'
import './index.css'
import './components/Auth/auth.css'

// Decidir qué app usar basado en una variable de entorno o localStorage
const useUnifiedApp = 
  localStorage.getItem('em-use-unified-app') === 'true' ||
  import.meta.env.VITE_USE_UNIFIED_APP === 'true' ||
  new URLSearchParams(window.location.search).get('unified') === 'true';

const AppToRender = useUnifiedApp ? AppUnified : App;

// Agregar indicador visual en desarrollo
if (import.meta.env.DEV) {
  console.log(`🚀 Using ${useUnifiedApp ? 'Unified' : 'Legacy'} App version`);
  
  // Agregar botón para cambiar entre versiones
  const switchButton = document.createElement('button');
  switchButton.textContent = `Switch to ${useUnifiedApp ? 'Legacy' : 'Unified'} App`;
  switchButton.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 9999;
    padding: 8px 12px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
  `;
  
  switchButton.onclick = () => {
    const newValue = !useUnifiedApp;
    localStorage.setItem('em-use-unified-app', newValue.toString());
    window.location.reload();
  };
  
  document.body.appendChild(switchButton);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppToRender />
  </React.StrictMode>,
)
