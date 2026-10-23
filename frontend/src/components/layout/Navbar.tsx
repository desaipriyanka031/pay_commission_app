import React, { useState, useEffect } from 'react';
import { Layers, ShieldCheck, UserCheck, Bell, ChevronDown, CheckCircle2, Sliders } from 'lucide-react';
import { AppStore } from '../../services/store';

interface NavbarProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
  activeCommissionId: number;
  onCommissionChange: (commId: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  activeCommissionId,
  onCommissionChange
}) => {
  const commissions = AppStore.getCommissions();
  const currentComm = commissions.find(c => c.commissionId === activeCommissionId) || commissions[0];

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            Government of India / Public Sector Enterprise
          </h2>
          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
            Automated Pay Fixation, Rules Engine & Matrix Auditing System
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Commission Selector Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          padding: '0.4rem 0.85rem',
          borderRadius: '9999px'
        }}>
          <Layers size={16} color="#2563eb" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>Commission:</span>
          <select
            value={activeCommissionId}
            onChange={(e) => onCommissionChange(Number(e.target.value))}
            style={{
              border: 'none',
              background: 'transparent',
              fontWeight: 700,
              fontSize: '0.82rem',
              color: '#1d4ed8',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {commissions.map(c => (
              <option key={c.commissionId} value={c.commissionId}>
                {c.commissionCode} - {c.status === 'ACTIVE' ? 'Active Operative' : 'Configurable Prototype'}
              </option>
            ))}
          </select>
          {currentComm?.status === 'ACTIVE' ? (
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} title="Operative Commission" />
          ) : (
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b' }} title="Draft / Prototype Commission" />
          )}
        </div>

        {/* Role Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          padding: '0.4rem 0.85rem',
          borderRadius: '9999px'
        }}>
          <ShieldCheck size={16} color="#2563eb" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e40af' }}>Role:</span>
          <select
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              fontWeight: 700,
              fontSize: '0.82rem',
              color: '#1e40af',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="Admin / DDO">Admin / DDO (Sanction Authority)</option>
            <option value="Dealing Assistant">Dealing Assistant (Maker / Verifier)</option>
            <option value="Auditor">Accounts / Audit Inspector</option>
          </select>
        </div>

        {/* User Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', paddingLeft: '0.5rem' }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.88rem'
          }}>
            GO
          </div>
        </div>
      </div>
    </header>
  );
};
