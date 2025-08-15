import React from 'react';
import { useAuth } from './AuthProvider';
import { User, LogOut, LogIn } from 'lucide-react';

interface UserProfileProps {
  onOpenAuthModal: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onOpenAuthModal }) => {
  const { user, isAuthenticated, isAnonymous, logout } = useAuth();

  if (isAuthenticated && user) {
    // Usuario autenticado
    return (
      <div className="user-profile authenticated">
        <div className="user-info">
          <div className="user-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <User size={20} />
            )}
          </div>
          <div className="user-details" title={user.email}>
            <span className="user-name">{user.name}</span>
            <span className="user-email">{user.email}</span>
          </div>
        </div>
        <button 
          className="user-profile-btn"
          onClick={logout}
          title="Cerrar sesión"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  if (isAnonymous) {
    // Usuario anónimo
    return (
      <div className="user-profile anonymous">
        <div className="user-info">
          <div className="user-avatar anonymous">
            <User size={20} />
          </div>
          <div className="user-details">
            <span className="user-name">Usuario Anónimo</span>
            <span className="user-status">Sin cuenta</span>
          </div>
        </div>
        <button 
          className="user-profile-btn"
          onClick={logout}
          title="Salir del modo anónimo"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  // Usuario sin autenticar (estado inicial)
  return (
    <div className="user-profile guest">
      <button 
        className="user-profile-btn user-profile-btn-primary"
        onClick={onOpenAuthModal}
      >
        <LogIn size={16} />
        <span>Iniciar Sesión</span>
      </button>
    </div>
  );
};

export default UserProfile;
