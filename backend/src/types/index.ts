// ============================================================
// Core Domain Types for Pay Commission Management System
// ============================================================

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// ------ Auth ------
export interface User {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  roleId: number;
  roleName: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export interface Role {
  roleId: number;
  roleName: string;
  description?: string;
  isActive: boolean;
}

// ------ Organisation ------
export interface Department {
  departmentId: number;
  deptCode: string;
  deptName: string;
  parentDeptId?: number;
  isActive: boolean;
  createdAt: Date;
}

export interface Branch {
  branchId: number;
  departmentId: number;
  branchCode: string;
  branchName: string;
  address?: string;
  isActive: boolean;
}

export interface Designation {
  designationId: number;
  designationCode: string;
  designationName: string;
  departmentId?: number;
  gradeLevel?: string;
  isActive: boolean;
}

// ------ Pay Commission (Commission-agnostic) ------
export interface PayCommission {
  commissionId: number;
  commissionCode: string;
  commissionName: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'FUTURE';
  fitmentFactor?: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface PayLevel {
  payLevelId: number;
  commissionId: number;
  levelNumber: string;
  levelName?: string;
  gradePay?: number;
  description?: string;
  isActive: boolean;
}

export interface PayMatrixCell {
  matrixId: number;
  commissionId: number;
  payLevelId: number;
  levelNumber: string;
  cellNumber: number;
  basicPay: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
}

// ------ Pay Rules Engine ------
export interface PayRuleType {
  ruleTypeId: number;
  typeCode: string;
  typeName: string;
  description?: string;
}

export interface PayRule {
  ruleId: number;
  commissionId: number;
  ruleTypeId: number;
  ruleCode: string;
  ruleName: string;
  ruleDescription?: string;
  ruleParameters?: Record<string, unknown>;  // JSON
  formulaExpression?: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isActive: boolean;
  priority: number;
}

// ------ Employee ------
export type EmployeeStatus = 'ACTIVE' | 'RETIRED' | 'RESIGNED' | 'DECEASED' | 'ON_LEAVE';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Employee {
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  fathersHusbandsName?: string;
  gender?: Gender;
  dateOfBirth?: Date;
  dateOfJoining: Date;
  dateOfRetirement?: Date;
  dateOfInitialAppointment?: Date;
  dateOfRegularAppointment?: Date;
  departmentId?: number;
  departmentName?: string;
  branchId?: number;
  branchName?: string;
  designationId?: number;
  designationName?: string;
  currentPost?: string;
  employeeType?: string;
  category?: string;
  currentCommissionId?: number;
  commissionName?: string;
  currentPayLevelId?: number;
  levelNumber?: string;
  currentPayCell?: number;
  basicPay?: number;
  incrementDate?: Date;
  panNumber?: string;
  aadhaarNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  mobileNumber?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  status: EmployeeStatus;
  remarks?: string;
  photoPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ------ Service History ------
export type ApprovalStatus = 'DRAFT' | 'CALCULATED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'APPLIED';

export interface ServiceEventType {
  eventTypeId: number;
  typeCode: string;
  typeName: string;
  affectsPay: boolean;
}

export interface ServiceHistoryEvent {
  historyId: number;
  employeeId: number;
  eventTypeId: number;
  eventTypeName: string;
  effectiveDate: Date;
  previousDesignationId?: number;
  previousDesignationName?: string;
  newDesignationId?: number;
  newDesignationName?: string;
  previousCommissionId?: number;
  newCommissionId?: number;
  previousPayLevelId?: number;
  newPayLevelId?: number;
  previousPayCell?: number;
  newPayCell?: number;
  previousBasicPay?: number;
  newBasicPay?: number;
  orderNumber?: string;
  orderDate?: Date;
  remarks?: string;
  approvalStatus: ApprovalStatus;
  createdAt: Date;
  createdByName?: string;
}

// ------ Pay Fixation (Transparent Calculation) ------
export interface CalculationStep {
  stepNumber: number;
  description: string;
  inputValue?: number | string;
  outputValue?: number | string;
  ruleApplied?: string;
  notes?: string;
}

export interface PayFixationResult {
  previousBasicPay: number;
  previousPayLevelId: number;
  previousPayCell: number;
  newBasicPay: number;
  newPayLevelId: number;
  newPayCell: number;
  commissionId: number;
  commissionName: string;
  ruleId: number;
  ruleName: string;
  calculationSteps: CalculationStep[];
  nextIncrementDate: Date;
  calculatedAt: Date;
  calculatedBy: number;
}

export interface PayFixation {
  fixationId: number;
  employeeId: number;
  fixationType: string;
  referenceId?: number;
  commissionId?: number;
  effectiveDate: Date;
  previousBasicPay?: number;
  newBasicPay?: number;
  ruleNameUsed?: string;
  calculationSteps?: CalculationStep[];
  nextIncrementDate?: Date;
  approvalStatus: ApprovalStatus;
  approvedBy?: number;
  approvedAt?: Date;
  approvalRemarks?: string;
}

// ------ Promotion ------
export interface Promotion {
  promotionId: number;
  employeeId: number;
  historyId?: number;
  promotionDate: Date;
  previousDesignationId?: number;
  newDesignationId?: number;
  previousPayLevelId?: number;
  newPayLevelId?: number;
  previousPayCell?: number;
  newPayCell?: number;
  previousBasicPay?: number;
  newBasicPay?: number;
  applicableRuleId?: number;
  orderNumber?: string;
  orderDate?: Date;
  nextIncrementDate?: Date;
  calculationDetails?: Record<string, unknown>;
  remarks?: string;
  approvalStatus: ApprovalStatus;
}

// ------ Increment ------
export interface Increment {
  incrementId: number;
  employeeId: number;
  incrementDate: Date;
  previousPayCell?: number;
  newPayCell?: number;
  previousBasicPay?: number;
  newBasicPay?: number;
  applicableRuleId?: number;
  nextIncrementDate?: Date;
  calculationDetails?: Record<string, unknown>;
  approvalStatus: ApprovalStatus;
}

// ------ Selection Grade ------
export interface SelectionGrade {
  selectionGradeId: number;
  employeeId: number;
  gradeType: 'SELECTION_GRADE' | 'SENIOR_SELECTION_GRADE';
  effectiveDate: Date;
  previousPayLevelId?: number;
  newPayLevelId?: number;
  previousBasicPay?: number;
  newBasicPay?: number;
  applicableRuleId?: number;
  orderNumber?: string;
  orderDate?: Date;
  nextIncrementDate?: Date;
  calculationDetails?: Record<string, unknown>;
  approvalStatus: ApprovalStatus;
}

// ------ Pay Revision ------
export interface PayRevision {
  revisionId: number;
  employeeId: number;
  effectiveDate: Date;
  fromCommissionId?: number;
  toCommissionId?: number;
  previousBasicPay?: number;
  newBasicPay?: number;
  fitmentFactorUsed?: number;
  applicableRuleId?: number;
  calculationDetails?: Record<string, unknown>;
  approvalStatus: ApprovalStatus;
  isBulk: boolean;
  bulkRevisionId?: number;
}

// ------ Arrears ------
export interface ArrearMonthDetail {
  month: string;       // YYYY-MM
  oldPay: number;
  revisedPay: number;
  difference: number;
  arrear: number;
}

export interface Arrear {
  arrearId: number;
  employeeId: number;
  arrearFromDate: Date;
  arrearToDate: Date;
  oldBasicPay: number;
  revisedBasicPay: number;
  monthlyDetails: ArrearMonthDetail[];
  totalArrear: number;
  deductions?: number;
  netArrear: number;
  approvalStatus: ApprovalStatus;
}

// ------ Document ------
export interface Document {
  documentId: number;
  employeeId: number;
  documentType: string;
  fileName: string;
  filePath: string;
  fileSize?: number;
  mimeType?: string;
  relatedModule?: string;
  relatedId?: number;
  description?: string;
  uploadDate: Date;
  uploadedBy?: number;
}

// ------ Audit Log ------
export interface AuditLog {
  logId: number;
  userId?: number;
  username?: string;
  action: string;
  module: string;
  recordId?: number;
  employeeId?: number;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  description?: string;
  ipAddress?: string;
  createdAt: Date;
}

// ------ Dashboard ------
export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  retiredEmployees: number;
  dueForIncrement: number;
  recentPromotions: number;
  withSelectionGrade: number;
  pendingPayFixation: number;
  recentPayRevisions: number;
}

// ------ Report Template ------
export interface ReportTemplate {
  templateId: number;
  commissionId?: number;
  templateCode: string;
  templateName: string;
  reportType: string;
  templateConfig: ReportTemplateConfig;
  isDefault: boolean;
  isActive: boolean;
}

export interface ReportTemplateConfig {
  title: string;
  showLogo: boolean;
  showOrgName: boolean;
  showAddress: boolean;
  showDate: boolean;
  showPageNumber: boolean;
  showSignatureSection: boolean;
  sections: ReportSection[];
  footer?: string;
}

export interface ReportSection {
  type: 'HEADER' | 'EMPLOYEE_INFO' | 'TABLE' | 'CALCULATION' | 'SIGNATURE' | 'TEXT';
  title?: string;
  fields?: string[];
  columns?: ReportColumn[];
  content?: string;
}

export interface ReportColumn {
  key: string;
  label: string;
  width?: number;
  format?: 'CURRENCY' | 'DATE' | 'TEXT' | 'NUMBER';
}
