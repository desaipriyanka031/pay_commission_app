import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calculator, 
  Table2, 
  Sliders, 
  Receipt, 
  FileCheck2, 
  History,
  Building2,
  HelpCircle
} from 'lucide-react';
import { AppStore } from '../../services/store';

export const Sidebar: React.FC = () => {
  const fixations = AppStore.getFixations();
  const pendingCount = fixations.filter(f => f.approvalStatus === 'SUBMITTED').length;

  const navItems = [
    { to: '/', label: 'Overview Dashboard', icon: LayoutDashboard },
    { to: '/employees', label: 'Employee Records', icon: Users },
    { 
      to: '/fixation-wizard', 
      label: 'Pay Fixation Engine', 
      icon: Calculator,
      badge: pendingCount > 0 ? pendingCount : undefined 
    },
    { to: '/pay-matrix', label: '7th/8th Pay Matrix', icon: Table2 },
    { to: '/commission-config', label: 'Commission & Rules', icon: Sliders },
    { to: '/arrears-calculator', label: 'Due-Drawn & Arrears', icon: Receipt },
    { to: '/audit-trail', label: 'Audit Trail & Logs', icon: History },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.2rem',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
          }}>
            ₹
          </div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
              PayGov Central
            </h1>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>
              7th & 8th CPC Rules Engine
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div style={{ padding: '1rem 0', flex: 1 }}>
        <div style={{ padding: '0 1.25rem 0.5rem', fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Main Modules
        </div>
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '9999px',
                    marginLeft: 'auto'
                  }}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Architecture Notice Footer */}
      <div style={{
        padding: '1.25rem',
        margin: '0.75rem',
        borderRadius: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <Building2 size={16} color="#60a5fa" />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e2e8f0' }}>Rules-Engine Ready</span>
        </div>
        <p style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4, margin: 0 }}>
          Commission-agnostic core: supports adding 8th Pay Commission without code modifications.
        </p>
      </div>
    </aside>
  );
};
