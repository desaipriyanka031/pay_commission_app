export type EmployeeStatus = 'ACTIVE' | 'RETIRED' | 'RESIGNED' | 'DECEASED' | 'ON_LEAVE';
export type ApprovalStatus = 'DRAFT' | 'CALCULATED' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'APPLIED';
export type FixationType = 'INCREMENT' | 'PROMOTION' | 'SELECTION_GRADE' | 'COMMISSION_REVISION' | 'INITIAL_FIXATION';
export type CityCategory = 'X' | 'Y' | 'Z';

export interface PayCommission {
  commissionId: number;
  commissionCode: string;
  commissionName: string;
  effectiveFrom: string;
  effectiveTo?: string;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'FUTURE';
  fitmentFactor?: number;
  description?: string;
  isActive: boolean;
}

export interface PayLevel {
  payLevelId: number;
  commissionId: number;
  levelNumber: string;
  levelName?: string;
  gradePay?: number;
  minPay: number;
  maxPay: number;
  totalCells: number;
}

export interface PayMatrixCell {
  levelNumber: string;
  cellNumber: number;
  basicPay: number;
}

export interface PayRule {
  ruleId: number;
  commissionId: number;
  ruleCode: string;
  ruleName: string;
  ruleDescription: string;
  ruleType: 'INCREMENT' | 'PROMOTION' | 'FITMENT' | 'ALLOWANCE' | 'ROUNDING';
  parameters: Record<string, any>;
  isActive: boolean;
}

export interface Employee {
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  fathersHusbandsName?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth: string;
  dateOfJoining: string;
  departmentId: number;
  departmentName: string;
  designationId: number;
  designationName: string;
  cityCategory: CityCategory;
  currentCommissionId: number;
  levelNumber: string;
  currentPayCell: number;
  basicPay: number;
  incrementDate: string; // e.g. "01-07-2026" or "01-01-2027"
  panNumber?: string;
  mobileNumber?: string;
  email?: string;
  status: EmployeeStatus;
}

export interface CalculationStep {
  stepNumber: number;
  title: string;
  description: string;
  formula?: string;
  inputValue?: string | number;
  outputValue?: string | number;
  notes?: string;
}

export interface PayFixationRecord {
  fixationId: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  designationName: string;
  fixationType: FixationType;
  effectiveDate: string;
  orderNumber: string;
  orderDate: string;
  commissionId: number;
  commissionName: string;
  previousLevel: string;
  previousCell: number;
  previousBasicPay: number;
  newLevel: string;
  newCell: number;
  newBasicPay: number;
  daAmount: number;
  hraAmount: number;
  taAmount: number;
  grossPay: number;
  calculationSteps: CalculationStep[];
  nextIncrementDate: string;
  approvalStatus: ApprovalStatus;
  submittedBy?: string;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  approvalRemarks?: string;
  createdAt: string;
}

export interface ArrearsMonthBreakdown {
  monthYear: string;
  dueBasic: number;
  drawnBasic: number;
  diffBasic: number;
  dueDA: number;
  drawnDA: number;
  diffDA: number;
  dueHRA: number;
  drawnHRA: number;
  diffHRA: number;
  dueTA: number;
  drawnTA: number;
  diffTA: number;
  netArrears: number;
}

export interface AuditLogItem {
  id: number;
  timestamp: string;
  username: string;
  action: string;
  module: string;
  description: string;
  details?: Record<string, any>;
}
