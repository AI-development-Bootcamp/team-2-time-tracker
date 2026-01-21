import React from 'react';
import { useAuthStore } from '../stores/authStore';
import './AdminLayout.css';
import abraLogo from '../assets/images/abra-logo.svg';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user } = useAuthStore();


  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar">
        <div className="admin-layout__logo">
          <img src={abraLogo} alt="Abra Logo" className="admin-logo" />
        </div>
        <nav className="admin-layout__nav">
        </nav>
        <div className="admin-layout__footer">
          <div className="admin-layout__user">
            <span className="admin-layout__user-name">{user?.fullName}</span>
          </div>
        </div>
      </aside>
      <main className="admin-layout__content">
        {children}
      </main>
    </div>
  );
};
