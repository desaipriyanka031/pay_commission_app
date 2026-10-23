import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit3, 
  Building2, 
  Calendar, 
  Award,
  CheckCircle2,
  X,
  CreditCard,
  Phone,
  Mail
} from 'lucide-react';
import { AppStore } from '../services/store';
import { Employee, CityCategory } from '../types';
import { INITIAL_DEPARTMENTS, INITIAL_DESIGNATIONS } from '../data/mockData';

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(AppStore.getEmployees());
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // New Employee Form State
  const [form, setForm] = useState<Partial<Employee>>({
    employeeCode: `EMP-00${employees.length + 1}`,
    employeeName: '',
    fathersHusbandsName: '',
    gender: 'MALE',
    dateOfBirth: '1990-01-01',
    dateOfJoining: '2020-01-01',
    departmentId: 1,
    departmentName: 'Administration & HR',
    designationId: 4,
    designationName: 'Assistant Section Officer (ASO)',
    cityCategory: 'X',
    currentCommissionId: 7,
    levelNumber: '7',
    currentPayCell: 1,
    basicPay: 44900,
    incrementDate: '01-07-2027',
    panNumber: '',
    mobileNumber: '',
    email: '',
    status: 'ACTIVE'
  });

  const matrix = AppStore.getPayMatrix();

  const handleLevelChange = (lvl: string) => {
    const cells = matrix[lvl] || [];
    const entryPay = cells[0]?.basicPay || 18000;
    setForm(prev => ({
      ...prev,
      levelNumber: lvl,
      currentPayCell: 1,
      basicPay: entryPay
    }));
  };

  const handleCellChange = (cellNum: number) => {
    const cells = matrix[form.levelNumber || '7'] || [];
    const matched = cells.find(c => c.cellNumber === cellNum);
    if (matched) {
      setForm(prev => ({
        ...prev,
        currentPayCell: cellNum,
        basicPay: matched.basicPay
      }));
    }
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employeeName || !form.employeeCode) return;

    const newEmp: Employee = {
      employeeId: Date.now(),
      employeeCode: form.employeeCode!,
      employeeName: form.employeeName!,
      fathersHusbandsName: form.fathersHusbandsName || '',
      gender: form.gender as any,
      dateOfBirth: form.dateOfBirth || '',
      dateOfJoining: form.dateOfJoining || '',
      departmentId: Number(form.departmentId) || 1,
      departmentName: INITIAL_DEPARTMENTS.find(d => d.id === Number(form.departmentId))?.name || 'Administration & HR',
      designationId: Number(form.designationId) || 1,
      designationName: INITIAL_DESIGNATIONS.find(d => d.id === Number(form.designationId))?.name || 'Assistant Section Officer (ASO)',
      cityCategory: (form.cityCategory as CityCategory) || 'X',
      currentCommissionId: 7,
      levelNumber: form.levelNumber || '7',
      currentPayCell: Number(form.currentPayCell) || 1,
      basicPay: Number(form.basicPay) || 44900,
      incrementDate: form.incrementDate || '01-07-2027',
      panNumber: form.panNumber || '',
      mobileNumber: form.mobileNumber || '',
      email: form.email || '',
      status: 'ACTIVE'
    };

    AppStore.saveEmployee(newEmp);
    setEmployees(AppStore.getEmployees());
    setIsAddModalOpen(false);
  };

  const filteredEmployees = employees.filter(emp => {
    const matchSearch = emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = deptFilter ? emp.departmentName === deptFilter : true;
    const matchLevel = levelFilter ? emp.levelNumber === levelFilter : true;
    return matchSearch && matchDept && matchLevel;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Employee Pay Records</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            Central repository of employees, pay stages, increment cycles, and service levels
          </p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
          <Plus size={18} /> Add New Employee
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
            <input
              type="text"
              placeholder="Search by name, code, designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ width: '200px' }}>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="form-select"
            >
              <option value="">All Departments</option>
              {INITIAL_DEPARTMENTS.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          <div style={{ width: '150px' }}>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="form-select"
            >
              <option value="">All Levels</option>
              {Object.keys(matrix).map(lvl => (
                <option key={lvl} value={lvl}>Level {lvl}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employees Directory Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="data-table-wrapper" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Code & Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Current Pay Stage</th>
                <th>Basic Pay</th>
                <th>City Tier</th>
                <th>Next Increment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(emp => (
                <tr key={emp.employeeId}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{emp.employeeName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>{emp.employeeCode}</div>
                  </td>
                  <td>{emp.departmentName}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{emp.designationName}</div>
                  </td>
                  <td>
                    <span style={{
                      backgroundColor: '#eff6ff',
                      color: '#1e40af',
                      fontWeight: 700,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem'
                    }}>
                      Level {emp.levelNumber} (Cell {emp.currentPayCell})
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>
                      ₹{emp.basicPay.toLocaleString('en-IN')}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-neutral">Class {emp.cityCategory}</span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    {emp.incrementDate}
                  </td>
                  <td>
                    <span className="badge badge-success">Active</span>
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedEmployee(emp)}
                      className="btn btn-secondary btn-sm"
                      title="View Service Profile"
                    >
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '720px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Add New Employee Record</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={20} color="#64748b" />
              </button>
            </div>
            <form onSubmit={handleSaveEmployee}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Employee Code *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.employeeCode}
                      onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Ramesh Chandra Sharma"
                      value={form.employeeName}
                      onChange={(e) => setForm({ ...form, employeeName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Father's / Husband's Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.fathersHusbandsName}
                      onChange={(e) => setForm({ ...form, fathersHusbandsName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select
                      className="form-select"
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value as any })}
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department *</label>
                    <select
                      className="form-select"
                      value={form.departmentId}
                      onChange={(e) => setForm({ ...form, departmentId: Number(e.target.value) })}
                    >
                      {INITIAL_DEPARTMENTS.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Designation *</label>
                    <select
                      className="form-select"
                      value={form.designationId}
                      onChange={(e) => setForm({ ...form, designationId: Number(e.target.value) })}
                    >
                      {INITIAL_DESIGNATIONS.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">City Classification (for HRA)</label>
                    <select
                      className="form-select"
                      value={form.cityCategory}
                      onChange={(e) => setForm({ ...form, cityCategory: e.target.value as any })}
                    >
                      <option value="X">Class X (30% HRA - Metro)</option>
                      <option value="Y">Class Y (20% HRA - Major City)</option>
                      <option value="Z">Class Z (10% HRA - Other)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Pay Level *</label>
                    <select
                      className="form-select"
                      value={form.levelNumber}
                      onChange={(e) => handleLevelChange(e.target.value)}
                    >
                      {Object.keys(matrix).map(lvl => (
                        <option key={lvl} value={lvl}>Level {lvl}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Matrix Cell *</label>
                    <select
                      className="form-select"
                      value={form.currentPayCell}
                      onChange={(e) => handleCellChange(Number(e.target.value))}
                    >
                      {(matrix[form.levelNumber || '7'] || []).map(c => (
                        <option key={c.cellNumber} value={c.cellNumber}>
                          Cell {c.cellNumber} — ₹{c.basicPay.toLocaleString('en-IN')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Substantive Basic Pay</label>
                    <input
                      type="text"
                      className="form-control"
                      value={`₹${form.basicPay?.toLocaleString('en-IN')}`}
                      readOnly
                      style={{ backgroundColor: '#f8fafc', fontWeight: 700, color: '#16a34a' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Next Annual Increment Date</label>
                    <select
                      className="form-select"
                      value={form.incrementDate}
                      onChange={(e) => setForm({ ...form, incrementDate: e.target.value })}
                    >
                      <option value="01-01-2027">01st January 2027</option>
                      <option value="01-07-2027">01st July 2027</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">PAN Number</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="ABCPS1234F"
                      value={form.panNumber}
                      onChange={(e) => setForm({ ...form, panNumber: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Employee Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Employee Detail Modal */}
      {selectedEmployee && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{selectedEmployee.employeeName}</h3>
                <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600 }}>{selectedEmployee.employeeCode}</span>
              </div>
              <button onClick={() => setSelectedEmployee(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={20} color="#64748b" />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Designation & Dept</div>
                  <div style={{ fontWeight: 700 }}>{selectedEmployee.designationName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#334155' }}>{selectedEmployee.departmentName}</div>
                </div>

                <div style={{ padding: '0.85rem', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#1e40af' }}>Pay Scale & Cell</div>
                  <div style={{ fontWeight: 800, color: '#1d4ed8', fontSize: '1.05rem' }}>
                    Level {selectedEmployee.levelNumber}, Cell {selectedEmployee.currentPayCell}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: 700 }}>
                    Basic Pay: ₹{selectedEmployee.basicPay.toLocaleString('en-IN')}
                  </div>
                </div>

                <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Date of Joining</div>
                  <div style={{ fontWeight: 600 }}>{selectedEmployee.dateOfJoining}</div>
                </div>

                <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Next Increment Due</div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{selectedEmployee.incrementDate}</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <h4 style={{ fontSize: '0.92rem', marginBottom: '0.75rem' }}>Salary Components Breakdown (Current Operative 7th CPC)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                    <span>Substantive Basic Pay</span>
                    <strong>₹{selectedEmployee.basicPay.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                    <span>Dearness Allowance (DA @ 50%)</span>
                    <strong>₹{Math.round(selectedEmployee.basicPay * 0.50).toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                    <span>House Rent Allowance (HRA @ 30%)</span>
                    <strong>₹{Math.round(selectedEmployee.basicPay * 0.30).toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontWeight: 800, color: '#16a34a', fontSize: '1rem' }}>
                    <span>Estimated Monthly Gross</span>
                    <span>₹{Math.round(selectedEmployee.basicPay * 1.85).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setSelectedEmployee(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
