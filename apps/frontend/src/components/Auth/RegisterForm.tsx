import React, { useState } from 'react';
import { useAuth } from './AuthProvider';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const { register, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones del frontend
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setValidationError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setValidationError(null);

    if (formData.name && formData.email && formData.password) {
      await register(formData.email, formData.password, formData.name);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    
    // Limpiar errores de validación cuando el usuario empiece a escribir
    if (validationError) {
      setValidationError(null);
    }
  };

  const displayError = error || validationError;

  return (
    <div className="auth-form">
      <div className="auth-header">
        <h2>Crear Cuenta</h2>
        <p>Únete a ExpertMind y guarda tus conversaciones</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form-content">
        <div className="auth-form-group">
          <label htmlFor="name">Nombre completo</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Tu nombre completo"
            required
            disabled={isLoading}
            className="auth-form-input"
          />
        </div>

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
            minLength={6}
            className="auth-form-input"
          />
        </div>

        <div className="auth-form-group">
          <label htmlFor="confirmPassword">Confirmar contraseña</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
            disabled={isLoading}
            className="auth-form-input"
          />
        </div>

        {displayError && (
          <div className="auth-error-message">
            {displayError}
          </div>
        )}

        <button 
          type="submit" 
          className="auth-btn auth-btn-primary auth-btn-full"
          disabled={isLoading || !formData.name || !formData.email || !formData.password || !formData.confirmPassword}
        >
          {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          ¿Ya tienes cuenta?{' '}
          <button 
            type="button"
            className="auth-link-button"
            onClick={onSwitchToLogin}
            disabled={isLoading}
          >
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
