import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { PayFixationPage } from './pages/PayFixationPage';
import { PayMatrixPage } from './pages/PayMatrixPage';
import { CommissionConfigPage } from './pages/CommissionConfigPage';
import { ArrearsCalculatorPage } from './pages/ArrearsCalculatorPage';
import { AuditLogPage } from './pages/AuditLogPage';

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<string>('Admin / DDO');
  const [activeCommissionId, setActiveCommissionId] = useState<number>(7);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <AppLayout
              currentRole={currentRole}
              onRoleChange={setCurrentRole}
              activeCommissionId={activeCommissionId}
              onCommissionChange={setActiveCommissionId}
            />
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/fixation-wizard" element={<PayFixationPage />} />
          <Route path="/pay-matrix" element={<PayMatrixPage />} />
          <Route path="/commission-config" element={<CommissionConfigPage />} />
          <Route path="/arrears-calculator" element={<ArrearsCalculatorPage />} />
          <Route path="/audit-trail" element={<AuditLogPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
