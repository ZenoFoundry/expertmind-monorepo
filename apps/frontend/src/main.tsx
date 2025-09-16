import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './components/Auth/auth.css'

// Información en desarrollo
if (import.meta.env.DEV) {
  console.log('🚀 ExpertMind Frontend - Unified App Version');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
