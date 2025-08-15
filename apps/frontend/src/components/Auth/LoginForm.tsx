import React, { useState } from 'react';
import { useAuth } from './AuthProvider';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email && formData.password) {
      await login(formData.email, formData.password);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="auth-form">
      <div className="auth-header">
        <h2>Iniciar Sesión</h2>
        <p>Accede a tu cuenta de ExpertMind</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form-content">
        <div className="auth-form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="tu@email.com"
            required
            disabled={isLoading}
            className="auth-form-input"
          />
        </div>

        <div className="auth-form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            disabled={isLoading}
            className="auth-form-input"
          />
        </div>

        {error && (
          <div className="auth-error-message">
            {error}
          </div>
        )}

        <button 
          type="submit" 
          className="auth-btn auth-btn-primary auth-btn-full"
          disabled={isLoading || !formData.email || !formData.password}
        >
          {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          ¿No tienes cuenta?{' '}
          <button 
            type="button"
            className="auth-link-button"
            onClick={onSwitchToRegister}
            disabled={isLoading}
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
