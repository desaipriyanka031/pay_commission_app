import React, { useState } from 'react';
import { Receipt, Calendar, Calculator, Printer, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AppStore } from '../services/store';
import { Employee, ArrearsMonthBreakdown } from '../types';
import { PayCalculationEngine } from '../services/payCalculationEngine';

export const ArrearsCalculatorPage: React.FC = () => {
  const employees = AppStore.getEmployees();
  const [selectedEmpId, setSelectedEmpId] = useState<number>(employees[0]?.employeeId || 1001);

  const currentEmp = employees.find(e => e.employeeId === selectedEmpId) || employees[0];

  // Parameters
  const [effectiveDate, setEffectiveDate] = useState<string>('2025-07-01');
  const [implementationDate, setImplementationDate] = useState<string>('2026-03-31');
  const [drawnBasic, setDrawnBasic] = useState<number>(currentEmp ? currentEmp.basicPay - 1600 : 50400);
  const [dueBasic, setDueBasic] = useState<number>(currentEmp ? currentEmp.basicPay : 52000);

  const [statement, setStatement] = useState<{ breakdown: ArrearsMonthBreakdown[]; totalNetArrears: number } | null>(() => {
    return PayCalculationEngine.calculateArrears(
      effectiveDate,
      implementationDate,
      drawnBasic,
      dueBasic,
      currentEmp?.levelNumber || '7',
      currentEmp?.cityCategory || 'X'
    );
  });

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const res = PayCalculationEngine.calculateArrears(
      effectiveDate,
      implementationDate,
      Number(drawnBasic),
      Number(dueBasic),
      currentEmp?.levelNumber || '7',
      currentEmp?.cityCategory || 'X'
    );
    setStatement(res);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0 }}>Due-Drawn & Arrears Statement Calculator</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            Automated retrospective pay adjustment with monthly DA & HRA differential statements
          </p>
        </div>

        <button onClick={handlePrint} className="btn btn-primary">
          <Printer size={16} /> Print Official Due-Drawn Statement
        </button>
      </div>

      {/* Control Form (Hidden on Print) */}
      <div className="card no-print">
        <form onSubmit={handleCalculate}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Employee</label>
              <select
                className="form-select"
                value={selectedEmpId}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setSelectedEmpId(id);
                  const emp = employees.find(x => x.employeeId === id);
                  if (emp) {
                    setDueBasic(emp.basicPay);
                    setDrawnBasic(Math.round(emp.basicPay * 0.97));
                  }
                }}
              >
                {employees.map(e => (
                  <option key={e.employeeId} value={e.employeeId}>
                    {e.employeeCode} - {e.employeeName} (L-{e.levelNumber})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Retrospective Effective Date</label>
              <input
                type="date"
                className="form-control"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Payment / Implementation Date</label>
              <input
                type="date"
                className="form-control"
                value={implementationDate}
                onChange={(e) => setImplementationDate(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Drawn Basic (Old Pay)</label>
              <input
                type="number"
                className="form-control"
                value={drawnBasic}
                onChange={(e) => setDrawnBasic(Number(e.target.value))}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Due Basic (Fixed Pay)</label>
              <input
                type="number"
                className="form-control"
                value={dueBasic}
                onChange={(e) => setDueBasic(Number(e.target.value))}
              />
            </div>

            <div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Calculator size={16} /> Compute Statement
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Arrears Summary & Breakdown */}
      {statement && (
        <div className="card order-paper" style={{ padding: '2rem' }}>
          {/* Printable Letterhead */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase' }}>
              DUE AND DRAWN STATEMENT OF SALARY ARREARS
            </h2>
            <div style={{ fontSize: '0.88rem', color: '#475569', marginTop: '0.25rem' }}>
              Employee: <strong>{currentEmp?.employeeName}</strong> ({currentEmp?.employeeCode}), {currentEmp?.designationName} • Level {currentEmp?.levelNumber}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Period of Claim: <strong>{effectiveDate}</strong> to <strong>{implementationDate}</strong>
            </div>
          </div>

          {/* KPI Total Net Payable */}
          <div className="no-print" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#065f46', fontWeight: 600 }}>Total Cumulative Net Arrears Payable</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#047857' }}>
                ₹{statement.totalNetArrears.toLocaleString('en-IN')}
              </div>
            </div>
            <span className="badge badge-success" style={{ fontSize: '0.88rem', padding: '0.4rem 1rem' }}>
              <CheckCircle2 size={16} /> Verified by Rules Engine
            </span>
          </div>

          {/* Month by Month Table */}
          <div className="data-table-wrapper" style={{ border: '1px solid #cbd5e1' }}>
            <table className="data-table" style={{ fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Due Basic</th>
                  <th>Drawn Basic</th>
                  <th>Diff Basic</th>
                  <th>Due DA</th>
                  <th>Drawn DA</th>
                  <th>Diff DA</th>
                  <th>Due HRA</th>
                  <th>Drawn HRA</th>
                  <th>Diff HRA</th>
                  <th style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>Net Arrears</th>
                </tr>
              </thead>
              <tbody>
                {statement.breakdown.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700 }}>{row.monthYear}</td>
                    <td>₹{row.dueBasic.toLocaleString('en-IN')}</td>
                    <td>₹{row.drawnBasic.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 600, color: '#2563eb' }}>+₹{row.diffBasic.toLocaleString('en-IN')}</td>
                    <td>₹{row.dueDA.toLocaleString('en-IN')}</td>
                    <td>₹{row.drawnDA.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 600, color: '#2563eb' }}>+₹{row.diffDA.toLocaleString('en-IN')}</td>
                    <td>₹{row.dueHRA.toLocaleString('en-IN')}</td>
                    <td>₹{row.drawnHRA.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 600, color: '#2563eb' }}>+₹{row.diffHRA.toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 800, color: '#059669', backgroundColor: '#f0fdf4' }}>
                      +₹{row.netArrears.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: '#f8fafc', fontWeight: 800, fontSize: '0.88rem' }}>
                  <td colSpan={10} style={{ textAlign: 'right', padding: '1rem' }}>
                    GRAND TOTAL NET ARREARS PAYABLE:
                  </td>
                  <td style={{ color: '#047857', fontSize: '1.05rem', backgroundColor: '#dcfce7', padding: '1rem' }}>
                    ₹{statement.totalNetArrears.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Verification Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3.5rem', fontSize: '0.88rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div>Prepared & Checked by:</div>
              <div style={{ marginTop: '2.5rem', borderTop: '1px solid #000', paddingTop: '0.25rem' }}>
                Dealing Assistant (Bills)
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div>Verified & Passed for Payment by:</div>
              <div style={{ marginTop: '2.5rem', borderTop: '1px solid #000', paddingTop: '0.25rem' }}>
                Drawing & Disbursing Officer (DDO)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
