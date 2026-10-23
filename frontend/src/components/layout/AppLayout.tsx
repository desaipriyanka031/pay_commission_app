import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

interface AppLayoutProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
  activeCommissionId: number;
  onCommissionChange: (id: number) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentRole,
  onRoleChange,
  activeCommissionId,
  onCommissionChange
}) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar
          currentRole={currentRole}
          onRoleChange={onRoleChange}
          activeCommissionId={activeCommissionId}
          onCommissionChange={onCommissionChange}
        />
        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
