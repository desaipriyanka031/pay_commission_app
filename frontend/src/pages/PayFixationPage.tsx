import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  FileText, 
  AlertCircle, 
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Send,
  Printer,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { AppStore } from '../services/store';
import { Employee, FixationType, PayFixationRecord } from '../types';
import { PayCalculationEngine, CalculationResult } from '../services/payCalculationEngine';
import { FixationMemoModal } from './FixationMemoModal';

export const PayFixationPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(AppStore.getEmployees());
  const [fixations, setFixations] = useState<PayFixationRecord[]>(AppStore.getFixations());
  const matrix = AppStore.getPayMatrix();
  const commissions = AppStore.getCommissions();
  const activeCommission = commissions.find(c => c.status === 'ACTIVE') || commissions[0];

  // Selection state
  const [selectedEmpId, setSelectedEmpId] = useState<number>(employees[0]?.employeeId || 1001);
  const [fixationType, setFixationType] = useState<FixationType>('PROMOTION');
  const [targetLevel, setTargetLevel] = useState<string>('8');
  const [effectiveDate, setEffectiveDate] = useState<string>('2026-07-01');
  const [orderNumber, setOrderNumber] = useState<string>(`PAY-FIX/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`);
  const [orderRemarks, setOrderRemarks] = useState<string>('');

  // Calculation output state
  const [calcResult, setCalcResult] = useState<CalculationResult | null>(null);
  const [selectedRecordForMemo, setSelectedRecordForMemo] = useState<PayFixationRecord | null>(null);

  const currentEmployee = employees.find(e => e.employeeId === selectedEmpId) || employees[0];

  // Auto-calculate whenever parameters change
  useEffect(() => {
    if (!currentEmployee) return;

    if (fixationType === 'PROMOTION' || fixationType === 'SELECTION_GRADE') {
      const res = PayCalculationEngine.calculatePromotion(
        currentEmployee.levelNumber,
        currentEmployee.currentPayCell,
        targetLevel,
        matrix,
        currentEmployee.cityCategory
      );
      setCalcResult(res);
    } else if (fixationType === 'INCREMENT') {
      const res = PayCalculationEngine.calculateAnnualIncrement(
        currentEmployee.levelNumber,
        currentEmployee.currentPayCell,
        matrix,
        currentEmployee.cityCategory
      );
      setCalcResult(res);
    } else if (fixationType === 'COMMISSION_REVISION') {
      // 8th CPC simulation with fitment factor 1.92 or 2.57
      const fitment = 1.92;
      const res = PayCalculationEngine.calculateCommissionRevision(
        currentEmployee.basicPay,
        currentEmployee.levelNumber,
        targetLevel,
        fitment,
        matrix,
        currentEmployee.cityCategory
      );
      setCalcResult(res);
    }
  }, [selectedEmpId, fixationType, targetLevel, effectiveDate]);

  // When changing employee, auto-adjust suggested target level
  const handleEmployeeChange = (id: number) => {
    setSelectedEmpId(id);
    const emp = employees.find(e => e.employeeId === id);
    if (emp) {
      const currentLvlNum = parseInt(emp.levelNumber, 10);
      if (!isNaN(currentLvlNum)) {
        setTargetLevel(String(currentLvlNum + 1));
      }
    }
  };

  const handleSaveOrder = (status: PayFixationRecord['approvalStatus']) => {
    if (!calcResult || !currentEmployee) return;

    const newRecord: PayFixationRecord = {
      fixationId: Date.now(),
      employeeId: currentEmployee.employeeId,
      employeeCode: currentEmployee.employeeCode,
      employeeName: currentEmployee.employeeName,
      departmentName: currentEmployee.departmentName,
      designationName: currentEmployee.designationName,
      fixationType,
      effectiveDate,
      orderNumber,
      orderDate: new Date().toISOString().substring(0, 10),
      commissionId: activeCommission.commissionId,
      commissionName: activeCommission.commissionName,
      previousLevel: currentEmployee.levelNumber,
      previousCell: currentEmployee.currentPayCell,
      previousBasicPay: calcResult.previousBasicPay,
      newLevel: calcResult.newLevel,
      newCell: calcResult.newCell,
      newBasicPay: calcResult.newBasicPay,
      daAmount: calcResult.daAmount,
      hraAmount: calcResult.hraAmount,
      taAmount: calcResult.taAmount,
      grossPay: calcResult.grossPay,
      calculationSteps: calcResult.calculationSteps,
      nextIncrementDate: calcResult.nextIncrementDate,
      approvalStatus: status,
      approvalRemarks: orderRemarks,
      createdAt: new Date().toISOString().substring(0, 10),
      submittedBy: status === 'SUBMITTED' ? 'Dealing Assistant (Maker)' : undefined,
      submittedAt: status === 'SUBMITTED' ? new Date().toISOString().substring(0, 16) : undefined,
      approvedBy: status === 'APPROVED' ? 'DDO / Competent Authority' : undefined,
      approvedAt: status === 'APPROVED' ? new Date().toISOString().substring(0, 16) : undefined,
    };

    AppStore.saveFixation(newRecord);
    if (status === 'APPROVED') {
      AppStore.updateFixationStatus(newRecord.fixationId, 'APPROVED', orderRemarks);
    }
    setFixations(AppStore.getFixations());
    setEmployees(AppStore.getEmployees());
    alert(`Pay Fixation Order #${orderNumber} saved successfully with status: ${status}`);
    setOrderNumber(`PAY-FIX/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0 }}>Pay Fixation Engine & Workflow</h1>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
          Transparent step-by-step mathematical fixation under FR 22(I)(a)(1), 7th Pay Commission rules, and future 8th CPC fitment
        </p>
      </div>

      {/* Main Calculation Wizard */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.75rem' }}>
        {/* Left: Input Parameters Card */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calculator size={18} color="#2563eb" />
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>1. Fixation Parameters</h3>
            </div>
            <span className="badge badge-primary">{activeCommission.commissionCode}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {/* Employee Selector */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Select Employee *</label>
              <select
                className="form-select"
                value={selectedEmpId}
                onChange={(e) => handleEmployeeChange(Number(e.target.value))}
              >
                {employees.map(e => (
                  <option key={e.employeeId} value={e.employeeId}>
                    {e.employeeCode} - {e.employeeName} (Level {e.levelNumber}, Cell {e.currentPayCell} - ₹{e.basicPay.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            {/* Current Substantive Profile Pill */}
            {currentEmployee && (
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '0.85rem',
                fontSize: '0.82rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#64748b' }}>Current Post:</span>
                  <strong>{currentEmployee.designationName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#64748b' }}>Existing Level & Cell:</span>
                  <strong style={{ color: '#2563eb' }}>Level {currentEmployee.levelNumber}, Cell {currentEmployee.currentPayCell}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Substantive Basic Pay:</span>
                  <strong style={{ color: '#16a34a', fontSize: '0.95rem' }}>₹{currentEmployee.basicPay.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            )}

            {/* Fixation Event Type */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Fixation Event Type *</label>
              <select
                className="form-select"
                value={fixationType}
                onChange={(e) => setFixationType(e.target.value as FixationType)}
              >
                <option value="PROMOTION">Promotion Fixation (FR 22(I)(a)(1))</option>
                <option value="INCREMENT">Annual Increment (Uniform 3% Vertical Step)</option>
                <option value="SELECTION_GRADE">MACP / Selection Grade Financial Upgradation</option>
                <option value="COMMISSION_REVISION">Pay Commission Revision (Fitment Factor)</option>
              </select>
            </div>

            {/* Target Level for Promotion / MACP / Revision */}
            {(fixationType === 'PROMOTION' || fixationType === 'SELECTION_GRADE' || fixationType === 'COMMISSION_REVISION') && (
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Target Pay Level *</label>
                <select
                  className="form-select"
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value)}
                >
                  {Object.keys(matrix).map(lvl => (
                    <option key={lvl} value={lvl}>Level {lvl} (Starts at ₹{matrix[lvl][0]?.basicPay.toLocaleString('en-IN')})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Effective Date & Order Number */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Effective Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Order Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Order Remarks */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Fixation Remarks / Service Book Ref</label>
              <input
                type="text"
                placeholder="e.g. Recommended by Departmental Promotion Committee"
                className="form-control"
                value={orderRemarks}
                onChange={(e) => setOrderRemarks(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Right: Transparent Calculation Breakdown & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {calcResult && (
            <div className="card" style={{ borderColor: '#bfdbfe', backgroundColor: '#f0f9ff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={18} color="#2563eb" />
                  <h3 style={{ fontSize: '1.1rem', color: '#1e3a8a', margin: 0 }}>2. Transparent Calculation Breakdown</h3>
                </div>
                <span className="badge badge-primary">Auditable Trail</span>
              </div>

              {/* Mathematical Steps Accordion/List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {calcResult.calculationSteps.map((step) => (
                  <div
                    key={step.stepNumber}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #dbeafe',
                      borderRadius: '10px',
                      padding: '1rem',
                      boxShadow: '0 1px 3px rgba(37, 99, 235, 0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {step.stepNumber}
                        </span>
                        <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{step.title}</strong>
                      </div>
                      {step.outputValue && (
                        <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '0.92rem' }}>
                          {step.outputValue}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0.25rem 0 0.4rem 1.85rem', lineHeight: 1.45 }}>
                      {step.description}
                    </p>
                    {step.formula && (
                      <div style={{
                        marginLeft: '1.85rem',
                        fontSize: '0.75rem',
                        fontFamily: 'monospace',
                        color: '#1d4ed8',
                        backgroundColor: '#eff6ff',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        display: 'inline-block'
                      }}>
                        Formula: {step.formula}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pay Comparison Card */}
              <div style={{
                marginTop: '1.25rem',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '1.25rem',
                border: '1px solid #93c5fd',
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Existing Substantive Pay</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                    ₹{calcResult.previousBasicPay.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                    Level {calcResult.previousLevel} (Cell {calcResult.previousCell})
                  </div>
                </div>

                <div style={{ color: '#2563eb' }}>
                  <ArrowRight size={28} />
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>Fixed Substantive Pay</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a' }}>
                    ₹{calcResult.newBasicPay.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 700 }}>
                    Level {calcResult.newLevel} (Cell {calcResult.newCell})
                  </div>
                </div>
              </div>

              {/* Allowances Breakdown */}
              <div style={{
                marginTop: '1rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.75rem',
                backgroundColor: '#ffffff',
                padding: '0.85rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.8rem',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ color: '#64748b' }}>DA (@ 50%)</div>
                  <div style={{ fontWeight: 700 }}>₹{calcResult.daAmount.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div style={{ color: '#64748b' }}>HRA (City {currentEmployee?.cityCategory})</div>
                  <div style={{ fontWeight: 700 }}>₹{calcResult.hraAmount.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div style={{ color: '#64748b' }}>Transport Allow.</div>
                  <div style={{ fontWeight: 700 }}>₹{calcResult.taAmount.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ borderLeft: '1px solid #e2e8f0' }}>
                  <div style={{ color: '#1e40af', fontWeight: 700 }}>Total Gross</div>
                  <div style={{ fontWeight: 800, color: '#1e40af' }}>₹{calcResult.grossPay.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Action Buttons Workflow */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button onClick={() => handleSaveOrder('DRAFT')} className="btn btn-secondary">
                  Save Draft
                </button>
                <button onClick={() => handleSaveOrder('SUBMITTED')} className="btn btn-primary">
                  <Send size={16} /> Submit for DDO Sanction
                </button>
                <button onClick={() => handleSaveOrder('APPROVED')} className="btn btn-success">
                  <ShieldCheck size={16} /> Sanction & Apply Pay Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixation Records History */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="card-header" style={{ padding: '1.25rem 1.5rem', margin: 0 }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Pay Fixation Orders & Sanctions Registry</h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
              Official records of annual increments, promotions, and revision memos
            </p>
          </div>
        </div>

        <div className="data-table-wrapper" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Employee</th>
                <th>Event Type</th>
                <th>Substantive Pay Change</th>
                <th>New Monthly Gross</th>
                <th>Status</th>
                <th>Sanction Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fixations.map(fix => (
                <tr key={fix.fixationId}>
                  <td style={{ fontWeight: 700, color: '#2563eb' }}>{fix.orderNumber}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{fix.employeeName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{fix.employeeCode} • {fix.departmentName}</div>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{fix.fixationType}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>
                      ₹{fix.previousBasicPay?.toLocaleString('en-IN')} &rarr; <span style={{ color: '#16a34a' }}>₹{fix.newBasicPay?.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      L-{fix.previousLevel} (C{fix.previousCell}) &rarr; L-{fix.newLevel} (C{fix.newCell})
                    </div>
                  </td>
                  <td>
                    <strong>₹{fix.grossPay?.toLocaleString('en-IN')}</strong>
                  </td>
                  <td>
                    {fix.approvalStatus === 'APPROVED' && <span className="badge badge-success">Approved</span>}
                    {fix.approvalStatus === 'SUBMITTED' && <span className="badge badge-warning">Awaiting DDO</span>}
                    {fix.approvalStatus === 'DRAFT' && <span className="badge badge-neutral">Draft</span>}
                    {fix.approvalStatus === 'REJECTED' && <span className="badge badge-danger">Rejected</span>}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{fix.effectiveDate}</td>
                  <td>
                    <button
                      onClick={() => setSelectedRecordForMemo(fix)}
                      className="btn btn-secondary btn-sm"
                      title="View Official Sanction Memorandum"
                    >
                      <FileText size={14} /> View Memo
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sanction Memo Modal */}
      {selectedRecordForMemo && (
        <FixationMemoModal
          record={selectedRecordForMemo}
          onClose={() => setSelectedRecordForMemo(null)}
        />
      )}
    </div>
  );
};
