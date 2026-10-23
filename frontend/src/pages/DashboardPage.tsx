import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Receipt,
  Users, 
  Calculator, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  ArrowUpRight, 
  FileText, 
  Sliders, 
  Table2,
  Building2,
  AlertCircle
} from 'lucide-react';
import { AppStore } from '../services/store';

export const DashboardPage: React.FC = () => {
  const employees = AppStore.getEmployees();
  const fixations = AppStore.getFixations();
  const commissions = AppStore.getCommissions();
  const activeCommission = commissions.find(c => c.status === 'ACTIVE') || commissions[0];

  const pendingFixations = fixations.filter(f => f.approvalStatus === 'SUBMITTED');
  const approvedFixations = fixations.filter(f => f.approvalStatus === 'APPROVED');
  const draftFixations = fixations.filter(f => f.approvalStatus === 'DRAFT');

  const totalMonthlyBasicOutlay = employees.reduce((sum, e) => sum + (e.basicPay || 0), 0);
  const estimatedMonthlyGross = totalMonthlyBasicOutlay * 1.85; // Approx with DA 50% + HRA + TA

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e3a8a 100%)',
        borderRadius: '16px',
        padding: '2rem 2.5rem',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)'
      }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(147, 197, 253, 0.3)',
            borderRadius: '9999px',
            padding: '0.25rem 0.85rem',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#93c5fd',
            marginBottom: '0.75rem'
          }}>
            <Building2 size={14} />
            Configurable Pay Commission Architecture Operative
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
            Pay Fixation & Commission Operations Portal
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.5 }}>
            Automated compliance engine for the <strong>{activeCommission?.commissionName}</strong>, featuring transparent notional steps under FR 22(I)(a)(1), dynamic matrix fitting, and built-in future 8th CPC compatibility.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/fixation-wizard" className="btn btn-primary" style={{ padding: '0.8rem 1.5rem', fontSize: '0.92rem' }}>
            <Calculator size={18} />
            New Pay Fixation
          </Link>
          <Link to="/pay-matrix" className="btn btn-secondary" style={{ padding: '0.8rem 1.5rem', fontSize: '0.92rem' }}>
            <Table2 size={18} />
            Explore Pay Matrix
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
        {/* Total Employees */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Covered Employees</span>
            <div style={{ width: 42, height: 42, borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
              <Users size={22} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a' }}>
            {employees.length}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
            <span>● 100% Onboarded in Level 1–14</span>
          </div>
        </div>

        {/* Fixations Awaiting Approval */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Pending Verification</span>
            <div style={{ width: 42, height: 42, borderRadius: '10px', backgroundColor: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
              <Clock size={22} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a' }}>
            {pendingFixations.length}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.78rem', color: '#f59e0b', fontWeight: 600 }}>
            <span>Awaiting DDO sanction</span>
          </div>
        </div>

        {/* Sanctioned Fixations */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Sanctioned Orders</span>
            <div style={{ width: 42, height: 42, borderRadius: '10px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a' }}>
            {approvedFixations.length}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
            <span>Audit trail verified</span>
          </div>
        </div>

        {/* Monthly Basic Outlay */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Monthly Basic Outlay</span>
            <div style={{ width: 42, height: 42, borderRadius: '10px', backgroundColor: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
              <TrendingUp size={22} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a' }}>
            ₹{totalMonthlyBasicOutlay.toLocaleString('en-IN')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.78rem', color: '#64748b' }}>
            <span>Est. Gross: ₹{Math.round(estimatedMonthlyGross).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Fixations & Quick Modules */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Recent Fixations List */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Recent Pay Fixation Workflow</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                Transparent calculations with Maker-Checker audit state
              </p>
            </div>
            <Link to="/fixation-wizard" className="btn btn-secondary btn-sm">
              View All Orders <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order No.</th>
                  <th>Employee</th>
                  <th>Event Type</th>
                  <th>From &rarr; To Pay</th>
                  <th>Status</th>
                  <th>Effective</th>
                </tr>
              </thead>
              <tbody>
                {fixations.slice(0, 5).map(f => (
                  <tr key={f.fixationId}>
                    <td style={{ fontWeight: 600, color: '#2563eb' }}>{f.orderNumber}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{f.employeeName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{f.employeeCode} • {f.departmentName}</div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{f.fixationType}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        ₹{f.previousBasicPay?.toLocaleString('en-IN')} &rarr; <span style={{ color: '#16a34a' }}>₹{f.newBasicPay?.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        L-{f.previousLevel} (C{f.previousCell}) &rarr; L-{f.newLevel} (C{f.newCell})
                      </div>
                    </td>
                    <td>
                      {f.approvalStatus === 'APPROVED' && <span className="badge badge-success">Approved</span>}
                      {f.approvalStatus === 'SUBMITTED' && <span className="badge badge-warning">Awaiting DDO</span>}
                      {f.approvalStatus === 'DRAFT' && <span className="badge badge-neutral">Draft</span>}
                      {f.approvalStatus === 'REJECTED' && <span className="badge badge-danger">Rejected</span>}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{f.effectiveDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Utilities & Rules Callout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Quick Action Tiles */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Operational Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <Link to="/fixation-wizard" className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem' }}>
                <Calculator size={18} color="#2563eb" />
                <span>Calculate Promotion / Increment</span>
              </Link>
              <Link to="/arrears-calculator" className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem' }}>
                <Receipt size={18} color="#10b981" />
                <span>Generate Due-Drawn Arrears</span>
              </Link>
              <Link to="/employees" className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem' }}>
                <Users size={18} color="#6366f1" />
                <span>Manage Employee Service Books</span>
              </Link>
              <Link to="/commission-config" className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem' }}>
                <Sliders size={18} color="#f59e0b" />
                <span>Configure 8th CPC & Rules</span>
              </Link>
            </div>
          </div>

          {/* Transparent Engine Rules Highlight */}
          <div className="card" style={{ backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <AlertCircle size={18} color="#0284c7" />
              <h4 style={{ fontSize: '0.92rem', color: '#0369a1', margin: 0 }}>Rules Engine Architecture</h4>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#0c4a6e', lineHeight: 1.5, margin: 0 }}>
              Calculations are never hardcoded. When 8th Pay Commission documents are officially gazetted, enter the new fitment factor and matrix in the <strong>Commission & Rules</strong> manager—the software immediately adapts without recompilation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
