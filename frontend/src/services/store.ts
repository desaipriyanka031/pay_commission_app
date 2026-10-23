import { useState, useEffect } from 'react';
import { Employee, PayFixationRecord, PayCommission, PayRule, AuditLogItem } from '../types';
import { INITIAL_EMPLOYEES, INITIAL_FIXATIONS, INITIAL_COMMISSIONS, INITIAL_RULES, INITIAL_PAY_MATRIX, INITIAL_AUDIT_LOGS } from '../data/mockData';

const STORAGE_KEYS = {
  EMPLOYEES: 'paycom_employees',
  FIXATIONS: 'paycom_fixations',
  COMMISSIONS: 'paycom_commissions',
  RULES: 'paycom_rules',
  MATRIX: 'paycom_matrix',
  AUDIT_LOGS: 'paycom_audit_logs',
  ACTIVE_COMMISSION: 'paycom_active_commission',
  USER_ROLE: 'paycom_user_role'
};

function getStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage write error', e);
  }
}

export const AppStore = {
  getEmployees(): Employee[] {
    return getStorage<Employee[]>(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
  },
  saveEmployee(employee: Employee): void {
    const list = this.getEmployees();
    const index = list.findIndex(e => e.employeeId === employee.employeeId);
    if (index >= 0) {
      list[index] = employee;
      this.logAudit('UPDATE_EMPLOYEE', 'Employee Management', `Updated record for ${employee.employeeName} (${employee.employeeCode})`);
    } else {
      list.unshift(employee);
      this.logAudit('CREATE_EMPLOYEE', 'Employee Management', `Added new employee ${employee.employeeName} (${employee.employeeCode})`);
    }
    setStorage(STORAGE_KEYS.EMPLOYEES, list);
  },

  getFixations(): PayFixationRecord[] {
    return getStorage<PayFixationRecord[]>(STORAGE_KEYS.FIXATIONS, INITIAL_FIXATIONS);
  },
  saveFixation(record: PayFixationRecord): void {
    const list = this.getFixations();
    const index = list.findIndex(f => f.fixationId === record.fixationId);
    if (index >= 0) {
      list[index] = record;
    } else {
      list.unshift(record);
    }
    setStorage(STORAGE_KEYS.FIXATIONS, list);
  },
  updateFixationStatus(fixationId: number, status: PayFixationRecord['approvalStatus'], remarks?: string, approverName = 'DDO / Accounts Officer'): void {
    const list = this.getFixations();
    const item = list.find(f => f.fixationId === fixationId);
    if (item) {
      item.approvalStatus = status;
      if (status === 'APPROVED') {
        item.approvedBy = approverName;
        item.approvedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
        item.approvalRemarks = remarks || 'Verified and sanctioned under statutory provisions.';
        
        // Also update the employee substantive basic pay!
        const employees = this.getEmployees();
        const emp = employees.find(e => e.employeeId === item.employeeId);
        if (emp) {
          emp.levelNumber = item.newLevel;
          emp.currentPayCell = item.newCell;
          emp.basicPay = item.newBasicPay;
          emp.incrementDate = item.nextIncrementDate;
          setStorage(STORAGE_KEYS.EMPLOYEES, employees);
        }
        this.logAudit('APPROVE_PAY_FIXATION', 'Pay Fixation', `Approved fixation #${item.orderNumber} for ${item.employeeName}. Pay updated to Level ${item.newLevel}, Cell ${item.newCell} (₹${item.newBasicPay.toLocaleString('en-IN')})`);
      } else if (status === 'SUBMITTED') {
        item.submittedBy = 'Dealing Assistant';
        item.submittedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
        this.logAudit('SUBMIT_PAY_FIXATION', 'Pay Fixation', `Submitted fixation order #${item.orderNumber} for approval.`);
      } else if (status === 'REJECTED') {
        item.approvalRemarks = remarks || 'Returned for discrepancy clarification.';
        this.logAudit('REJECT_PAY_FIXATION', 'Pay Fixation', `Returned fixation order #${item.orderNumber}. Reason: ${remarks}`);
      }
      setStorage(STORAGE_KEYS.FIXATIONS, list);
    }
  },

  getCommissions(): PayCommission[] {
    return getStorage<PayCommission[]>(STORAGE_KEYS.COMMISSIONS, INITIAL_COMMISSIONS);
  },
  saveCommission(comm: PayCommission): void {
    const list = this.getCommissions();
    const index = list.findIndex(c => c.commissionId === comm.commissionId);
    if (index >= 0) {
      list[index] = comm;
    } else {
      list.push(comm);
    }
    setStorage(STORAGE_KEYS.COMMISSIONS, list);
    this.logAudit('CONFIG_COMMISSION', 'Commission Engine', `Updated commission configuration for ${comm.commissionName}`);
  },

  getRules(): PayRule[] {
    return getStorage<PayRule[]>(STORAGE_KEYS.RULES, INITIAL_RULES);
  },
  saveRule(rule: PayRule): void {
    const list = this.getRules();
    const idx = list.findIndex(r => r.ruleId === rule.ruleId);
    if (idx >= 0) list[idx] = rule;
    else list.push(rule);
    setStorage(STORAGE_KEYS.RULES, list);
    this.logAudit('UPDATE_RULE', 'Rules Engine', `Configured rule ${rule.ruleName} (${rule.ruleCode})`);
  },

  getPayMatrix(): Record<string, { cellNumber: number; basicPay: number }[]> {
    return getStorage(STORAGE_KEYS.MATRIX, INITIAL_PAY_MATRIX);
  },

  getAuditLogs(): AuditLogItem[] {
    return getStorage<AuditLogItem[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },
  logAudit(action: string, module: string, description: string, details?: any): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLogItem = {
      id: Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      username: localStorage.getItem(STORAGE_KEYS.USER_ROLE) || 'Admin / DDO',
      action,
      module,
      description,
      details
    };
    logs.unshift(newLog);
    setStorage(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 100));
  },

  resetDefaults(): void {
    localStorage.clear();
  }
};
