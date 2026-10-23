import React, { useState } from 'react';
import { Sliders, Plus, CheckCircle2, ShieldAlert, Sparkles, Building2, Save } from 'lucide-react';
import { AppStore } from '../services/store';
import { PayCommission, PayRule } from '../types';

export const CommissionConfigPage: React.FC = () => {
  const [commissions, setCommissions] = useState<PayCommission[]>(AppStore.getCommissions());
  const [rules, setRules] = useState<PayRule[]>(AppStore.getRules());

  // 8th CPC Configuration form state
  const eighthCpc = commissions.find(c => c.commissionCode === '8CPC') || {
    commissionId: 8,
    commissionCode: '8CPC',
    commissionName: '8th Central Pay Commission',
    effectiveFrom: '2026-01-01',
    status: 'DRAFT',
    fitmentFactor: 1.92,
    description: 'Upcoming 8th Central Pay Commission configurable model.',
    isActive: false
  };

  const [form8, setForm8] = useState<PayCommission>(eighthCpc);

  const handleSave8th = (e: React.FormEvent) => {
    e.preventDefault();
    AppStore.saveCommission(form8);
    setCommissions(AppStore.getCommissions());
    alert('8th Pay Commission parameters saved to system successfully.');
  };

  const handleToggleCommissionStatus = (commId: number) => {
    const comm = commissions.find(c => c.commissionId === commId);
    if (!comm) return;

    const newStatus = comm.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updated = { ...comm, status: newStatus as any, isActive: newStatus === 'ACTIVE' };
    AppStore.saveCommission(updated);
    setCommissions(AppStore.getCommissions());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0 }}>Pay Commission & Rules Configuration Engine</h1>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
          Manage operative commission parameters, DA rates, and configure the upcoming 8th Pay Commission rules dynamically
        </p>
      </div>

      {/* Architecture Advantage Notice */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
        borderColor: '#93c5fd',
        padding: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Sparkles size={20} color="#2563eb" />
          <h3 style={{ fontSize: '1.1rem', color: '#1e3a8a', margin: 0 }}>
            Configurable Rules Architecture (7th & 8th CPC Ready)
          </h3>
        </div>
        <p style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.5, margin: 0 }}>
          This software does NOT hardcode the 7th Pay Commission. When the Government of India formally notifies the 
          <strong> 8th Central Pay Commission</strong>, the organization can update the <strong>Fitment Factor (e.g. 1.92 or 2.57)</strong>, 
          effective dates, minimum pay, and revised pay bands here. The entire pay fixation wizard and arrears engine immediately operate 
          using the new parameters without recompiling or rebuilding the application.
        </p>
      </div>

      {/* Commissions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* 7th CPC (Current Operative) */}
        <div className="card" style={{ borderColor: '#86efac' }}>
          <div className="card-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', margin: 0 }}>7th Central Pay Commission</h3>
                <span className="badge badge-success">Operative Active</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Gazetted w.e.f. 01-01-2016</span>
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>Fitment: 2.57</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Pay Matrix Levels:</span>
              <strong>Level 1 to Level 18 (40 Cells max)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Minimum Entry Basic Pay:</span>
              <strong>₹18,000 (Level 1, Cell 1)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Maximum Cabinet Sec Basic:</span>
              <strong>₹2,50,000 (Level 18, Cell 1)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Annual Increment Compounding:</span>
              <strong>3.0% (Cell-to-Cell vertical advancement)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
              <span style={{ color: '#64748b' }}>Current Operative DA Rate:</span>
              <strong style={{ color: '#2563eb' }}>50% on Revised Basic</strong>
            </div>
          </div>
        </div>

        {/* 8th CPC (Configurable Future Framework) */}
        <div className="card" style={{ borderColor: '#cbd5e1' }}>
          <div className="card-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', margin: 0 }}>8th Pay Commission (Configurable)</h3>
                <span className="badge badge-warning">Draft Prototype</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Ready for official gazette parameters</span>
            </div>
          </div>

          <form onSubmit={handleSave8th} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Proposed Fitment Factor</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={form8.fitmentFactor || 1.92}
                  onChange={(e) => setForm8({ ...form8, fitmentFactor: parseFloat(e.target.value) })}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Anticipated Effective Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={form8.effectiveFrom}
                  onChange={(e) => setForm8({ ...form8, effectiveFrom: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Description / Gazette Reference</label>
              <textarea
                rows={2}
                className="form-control"
                value={form8.description || ''}
                onChange={(e) => setForm8({ ...form8, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="activate8th"
                  checked={form8.status === 'ACTIVE'}
                  onChange={(e) => setForm8({ ...form8, status: e.target.checked ? 'ACTIVE' : 'DRAFT', isActive: e.target.checked })}
                />
                <label htmlFor="activate8th" style={{ fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                  Mark as Primary Active Commission
                </label>
              </div>

              <button type="submit" className="btn btn-primary btn-sm">
                <Save size={14} /> Update 8th CPC Configuration
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Pay Rules Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="card-header" style={{ padding: '1.25rem 1.5rem', margin: 0 }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Statutory Pay Rules & Allowance Matrices</h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
              Live formulas driving promotional step matching, notional increments, and allowances
            </p>
          </div>
        </div>

        <div className="data-table-wrapper" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Rule Code</th>
                <th>Rule Name & Citation</th>
                <th>Type</th>
                <th>Parameters</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(r => (
                <tr key={r.ruleId}>
                  <td style={{ fontWeight: 700, color: '#2563eb' }}>{r.ruleCode}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.ruleName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{r.ruleDescription}</div>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{r.ruleType}</span>
                  </td>
                  <td>
                    <pre style={{
                      backgroundColor: '#f8fafc',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      margin: 0
                    }}>
                      {JSON.stringify(r.parameters)}
                    </pre>
                  </td>
                  <td>
                    <span className="badge badge-success">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
