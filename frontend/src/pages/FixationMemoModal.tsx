import React from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { PayFixationRecord } from '../types';

interface FixationMemoModalProps {
  record: PayFixationRecord;
  onClose: () => void;
}

export const FixationMemoModal: React.FC<FixationMemoModalProps> = ({ record, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px', padding: 0 }}>
        {/* Actions bar (hidden in print) */}
        <div className="no-print" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-success">Official Fixation Sanction Order</span>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Order #{record.orderNumber}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handlePrint} className="btn btn-primary btn-sm">
              <Printer size={16} /> Print / Save PDF
            </button>
            <button onClick={onClose} className="btn btn-secondary btn-sm">
              <X size={16} /> Close
            </button>
          </div>
        </div>

        {/* Printable Order Paper */}
        <div className="order-paper" style={{ padding: '2.5rem', backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'serif' }}>
          {/* Official Letterhead */}
          <div style={{ textAlign: 'center', borderBottom: '2px double #000000', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Government of India
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>
              Office of the Competent Authority & Drawing and Disbursing Officer
            </div>
            <div style={{ fontSize: '0.88rem', fontStyle: 'italic', color: '#334155' }}>
              Personnel & Accounts Wing, Pay Fixation Section
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            <div>
              <strong>Order No.:</strong> {record.orderNumber}
            </div>
            <div>
              <strong>Dated:</strong> {record.orderDate || new Date().toISOString().substring(0, 10)}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.15rem', textDecoration: 'underline', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'serif' }}>
              OFFICE SANCTION MEMORANDUM
            </h2>
            <div style={{ fontSize: '0.92rem', fontWeight: 600, marginTop: '0.25rem' }}>
              Subject: Fixation of Pay on {record.fixationType} under {record.commissionName}
            </div>
          </div>

          <p style={{ fontSize: '0.95rem', lineHeight: 1.6, textAlign: 'justify', marginBottom: '1.25rem' }}>
            Sanction of the Competent Authority is hereby conveyed for the fixation of substantive pay of 
            <strong> {record.employeeName}</strong>, <strong>{record.designationName}</strong> ({record.employeeCode}), 
            consequent upon <strong>{record.fixationType}</strong> with effect from <strong>{record.effectiveDate}</strong> 
            under the provisions of Fundamental Rules FR 22(I)(a)(1) read with the applicable {record.commissionName} Matrix.
          </p>

          {/* Tabular Statement */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
            <tbody>
              <tr style={{ border: '1px solid #000' }}>
                <td style={{ padding: '0.5rem', fontWeight: 700, width: '45%' }}>1. Name & Designation of Employee</td>
                <td style={{ padding: '0.5rem' }}>{record.employeeName}, {record.designationName}</td>
              </tr>
              <tr style={{ border: '1px solid #000' }}>
                <td style={{ padding: '0.5rem', fontWeight: 700 }}>2. Department / Section</td>
                <td style={{ padding: '0.5rem' }}>{record.departmentName}</td>
              </tr>
              <tr style={{ border: '1px solid #000' }}>
                <td style={{ padding: '0.5rem', fontWeight: 700 }}>3. Pre-fixation Substantive Pay & Level</td>
                <td style={{ padding: '0.5rem' }}>₹{record.previousBasicPay?.toLocaleString('en-IN')} in Level {record.previousLevel} (Cell {record.previousCell})</td>
              </tr>
              <tr style={{ border: '1px solid #000' }}>
                <td style={{ padding: '0.5rem', fontWeight: 700 }}>4. Effective Date of Fixation</td>
                <td style={{ padding: '0.5rem' }}>{record.effectiveDate}</td>
              </tr>
              <tr style={{ border: '1px solid #000' }}>
                <td style={{ padding: '0.5rem', fontWeight: 700 }}>5. Fixed Substantive Basic Pay</td>
                <td style={{ padding: '0.5rem', fontWeight: 800, fontSize: '0.95rem' }}>
                  ₹{record.newBasicPay?.toLocaleString('en-IN')} in Level {record.newLevel} (Cell {record.newCell})
                </td>
              </tr>
              <tr style={{ border: '1px solid #000' }}>
                <td style={{ padding: '0.5rem', fontWeight: 700 }}>6. Dearness Allowance (DA @ 50%)</td>
                <td style={{ padding: '0.5rem' }}>₹{record.daAmount?.toLocaleString('en-IN')}</td>
              </tr>
              <tr style={{ border: '1px solid #000' }}>
                <td style={{ padding: '0.5rem', fontWeight: 700 }}>7. House Rent Allowance (HRA)</td>
                <td style={{ padding: '0.5rem' }}>₹{record.hraAmount?.toLocaleString('en-IN')}</td>
              </tr>
              <tr style={{ border: '1px solid #000' }}>
                <td style={{ padding: '0.5rem', fontWeight: 700 }}>8. Next Date of Annual Increment</td>
                <td style={{ padding: '0.5rem', fontWeight: 700 }}>{record.nextIncrementDate}</td>
              </tr>
            </tbody>
          </table>

          {/* Mathematical Audit Verification Steps */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Audit Verification & Calculation Steps:
            </div>
            <ol style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', lineHeight: 1.5 }}>
              {record.calculationSteps?.map((step, idx) => (
                <li key={idx} style={{ marginBottom: '0.35rem' }}>
                  <strong>{step.title}:</strong> {step.description} 
                  {step.formula && <span style={{ color: '#334155' }}> [Formula: {step.formula}]</span>}
                  {step.outputValue && <strong> — Result: {step.outputValue}</strong>}
                </li>
              ))}
            </ol>
          </div>

          {/* Signature Block */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3.5rem', fontSize: '0.9rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 600 }}>Prepared & Verified by:</div>
              <div style={{ marginTop: '2.5rem', borderTop: '1px solid #000', paddingTop: '0.25rem' }}>
                Dealing Assistant / Accounts Clerk
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 600 }}>Sanctioned & Approved by:</div>
              <div style={{ marginTop: '2.5rem', borderTop: '1px solid #000', paddingTop: '0.25rem' }}>
                Drawing & Disbursing Officer (DDO)<br/>
                Competent Authority
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
