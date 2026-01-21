import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Users, Clock } from 'lucide-react';
import './AdminLayout.css';
import abraLogo from '../assets/images/abra-logo.svg';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  exactMatch?: boolean;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user } = useAuthStore();

  const navItems: NavItem[] = [
    {
      path: '/assignments',
      label: 'ניהול לקוחות/פרויקטים',
      icon: <Users size={20} />,
    },
    {
      path: '/hour-report',
      label: 'הגדרת דיווחי שעות',
      icon: <Clock size={20} />,
    },
  ];

  const isActive = (item: NavItem): boolean => {
    return location.pathname === item.path;
  };


  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar">
        <div className="admin-layout__logo">
          <img src={abraLogo} alt="Abra Logo" className="admin-logo" />
        </div>
        <nav className="admin-layout__nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`admin-layout__nav-item ${isActive(item) ? 'admin-layout__nav-item--active' : ''}`}
              onClick={() => navigate(item.path)}
              type="button"
            >
              {item.icon}
              {item.label}
            </button>
          ))}
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
