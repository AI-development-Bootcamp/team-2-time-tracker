import React from 'react';
import './AdminLayout.css';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar">
        <div className="admin-layout__logo">
          <div className="admin-layout__logo-placeholder">ABRA</div>
        </div>
        <nav className="admin-layout__nav">
          {/* Future: Navigation menu items */}
        </nav>
      </aside>
      <main className="admin-layout__content">
        {children}
      </main>
    </div>
  );
};
