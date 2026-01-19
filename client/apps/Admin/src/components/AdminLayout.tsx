import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import './AdminLayout.css';
import abraLogo from '../assets/images/abra-logo.svg';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar">
        <div className="admin-layout__logo">
           <img src={abraLogo} alt="Abra Logo" className="admin-logo" />
        </div>
        <nav className="admin-layout__nav">
          {/* Future: Navigation menu items */}
        </nav>
        <div className="admin-layout__footer">
          <div className="admin-layout__user">
            <span className="admin-layout__user-name">{user?.fullName}</span>
            <span className="admin-layout__user-email">{user?.email}</span>
          </div>
          <button
            className="admin-layout__logout-btn"
            onClick={handleLogout}
            type="button"
          >
            התנתק
          </button>
        </div>
      </aside>
      <main className="admin-layout__content">
        {children}
      </main>
    </div>
  );
};
