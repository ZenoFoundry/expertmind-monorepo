import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

type AuthMode = 'login' | 'register';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { continueAsAnonymous, clearError, isAuthenticated, isAnonymous } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  // Cerrar modal cuando el usuario se autentica o elige anónimo
  useEffect(() => {
    if (isAuthenticated || isAnonymous) {
      onClose();
    }
  }, [isAuthenticated, isAnonymous, onClose]);

  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleContinueAnonymous = () => {
    clearError();
    continueAsAnonymous();
  };

  const switchMode = (mode: AuthMode) => {
    clearError();
    setAuthMode(mode);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal">
        <div className="auth-modal-header">
          <button 
            className="auth-modal-close"
            onClick={onClose}
            title="Cerrar"
          >
            ✕
          </button>
          <div className="auth-modal-logo">
            <h1>ExpertMind</h1>
            <span className="logo-subtitle">AI Chat Assistant</span>
          </div>
        </div>

        <div className="auth-modal-content">
          {authMode === 'login' ? (
            <LoginForm onSwitchToRegister={() => switchMode('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => switchMode('login')} />
          )}
        </div>

        <div className="auth-modal-divider">
          <span>o</span>
        </div>

        <div className="auth-modal-anonymous">
          <button 
            className="auth-btn auth-btn-secondary auth-btn-full"
            onClick={handleContinueAnonymous}
          >
            <span className="auth-anonymous-icon">👤</span>
            Continuar sin cuenta
          </button>
          <p className="auth-anonymous-note">
            Podrás usar ExpertMind de forma anónima, pero no se guardarán tus conversaciones.
          </p>
        </div>

        <div className="auth-modal-footer">
          <p>
            Al continuar, aceptas nuestros{' '}
            <a href="#" className="auth-link">Términos de Servicio</a> y{' '}
            <a href="#" className="auth-link">Política de Privacidad</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
