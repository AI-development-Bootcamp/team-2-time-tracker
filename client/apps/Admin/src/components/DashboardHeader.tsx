import React from 'react';
import { AddButton } from './AddButton';
import './DashboardHeader.css';

interface DashboardHeaderProps {
  title: string;
  showAddButton?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  showAddButton = true,
}) => {
  return (
    <header className="dashboard-header">
      <h1 className="dashboard-header__title">{title}</h1>
      <div className="dashboard-header__actions">
        {showAddButton && <AddButton />}
      </div>
    </header>
  );
};
