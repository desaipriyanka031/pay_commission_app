import { query, sql } from '../config/database';
import { PayCommission, PayLevel, PayMatrixCell, PayRule } from '../types';
import { AppError } from '../middleware/errorHandler';

/**
 * PayCommissionService
 * -----------------------------------------------------------------------
 * Commission-agnostic service. Works with ANY configured pay commission
 * (7th, 8th, or future). Never hardcodes commission-specific logic.
 * New commissions are supported purely through database configuration.
 * -----------------------------------------------------------------------
 */
export class PayCommissionService {
  /** Get all pay commissions */
  async getAllCommissions(): Promise<PayCommission[]> {
    return query<PayCommission[]>(`
      SELECT commission_id AS commissionId,
             commission_code AS commissionCode,
             commission_name AS commissionName,
             effective_from AS effectiveFrom,
             effective_to AS effectiveTo,
             status,
             fitment_factor AS fitmentFactor,
             description,
             is_active AS isActive,
             created_at AS createdAt
      FROM pay_commissions
      ORDER BY effective_from DESC
    `);
  }

  /** Get single commission by ID */
  async getCommissionById(commissionId: number): Promise<PayCommission> {
    const rows = await query<PayCommission[]>(
      `SELECT commission_id AS commissionId,
              commission_code AS commissionCode,
              commission_name AS commissionName,
              effective_from AS effectiveFrom,
              effective_to AS effectiveTo,
              status,
              fitment_factor AS fitmentFactor,
              description,
              is_active AS isActive,
              created_at AS createdAt
       FROM pay_commissions
       WHERE commission_id = @commissionId`,
      { commissionId: { type: sql.Int, value: commissionId } }
    );
    if (!rows[0]) throw new AppError('Pay commission not found', 404);
    return rows[0];
  }

  /** Get the currently ACTIVE commission */
  async getActiveCommission(): Promise<PayCommission | null> {
    const rows = await query<PayCommission[]>(`
      SELECT TOP 1 commission_id AS commissionId,
             commission_code AS commissionCode,
             commission_name AS commissionName,
             effective_from AS effectiveFrom,
             effective_to AS effectiveTo,
             status,
             fitment_factor AS fitmentFactor,
             description,
             is_active AS isActive,
             created_at AS createdAt
      FROM pay_commissions
      WHERE status = 'ACTIVE' AND is_active = 1
      ORDER BY effective_from DESC
    `);
    return rows[0] || null;
  }

  /** Create a new pay commission */
  async createCommission(
    data: Omit<PayCommission, 'commissionId' | 'createdAt'>,
    createdBy: number
  ): Promise<number> {
    const result = await query<{ commissionId: number }[]>(
      `INSERT INTO pay_commissions
         (commission_code, commission_name, effective_from, effective_to,
          status, fitment_factor, description, is_active, created_by, created_at, updated_at)
       OUTPUT INSERTED.commission_id AS commissionId
       VALUES (@commissionCode, @commissionName, @effectiveFrom, @effectiveTo,
               @status, @fitmentFactor, @description, 1, @createdBy, GETUTCDATE(), GETUTCDATE())`,
      {
        commissionCode:  { type: sql.NVarChar(50),   value: data.commissionCode },
        commissionName:  { type: sql.NVarChar(200),  value: data.commissionName },
        effectiveFrom:   { type: sql.Date,           value: data.effectiveFrom },
        effectiveTo:     { type: sql.Date,           value: data.effectiveTo || null },
        status:          { type: sql.NVarChar(50),   value: data.status },
        fitmentFactor:   { type: sql.Decimal(10,4),  value: data.fitmentFactor || null },
        description:     { type: sql.NVarChar(1000), value: data.description || null },
        createdBy:       { type: sql.Int,            value: createdBy },
      }
    );
    return result[0].commissionId;
  }

  /** Update a pay commission */
  async updateCommission(
    commissionId: number,
    data: Partial<PayCommission>
  ): Promise<void> {
    await query(
      `UPDATE pay_commissions
       SET commission_name = COALESCE(@commissionName, commission_name),
           effective_from  = COALESCE(@effectiveFrom, effective_from),
           effective_to    = @effectiveTo,
           status          = COALESCE(@status, status),
           fitment_factor  = @fitmentFactor,
           description     = @description,
           updated_at      = GETUTCDATE()
       WHERE commission_id = @commissionId`,
      {
        commissionId:  { type: sql.Int,           value: commissionId },
        commissionName: { type: sql.NVarChar(200), value: data.commissionName || null },
        effectiveFrom:  { type: sql.Date,          value: data.effectiveFrom || null },
        effectiveTo:    { type: sql.Date,          value: data.effectiveTo || null },
        status:         { type: sql.NVarChar(50),  value: data.status || null },
        fitmentFactor:  { type: sql.Decimal(10,4), value: data.fitmentFactor || null },
        description:    { type: sql.NVarChar(1000),value: data.description || null },
      }
    );
  }

  /** Get all pay levels for a commission */
  async getPayLevels(commissionId: number): Promise<PayLevel[]> {
    return query<PayLevel[]>(
      `SELECT pay_level_id AS payLevelId,
              commission_id AS commissionId,
              level_number AS levelNumber,
              level_name AS levelName,
              grade_pay AS gradePay,
              description,
              is_active AS isActive
       FROM pay_levels
       WHERE commission_id = @commissionId AND is_active = 1
       ORDER BY CAST(level_number AS INT)`,
      { commissionId: { type: sql.Int, value: commissionId } }
    );
  }

  /** Get pay matrix cells for a level */
  async getPayMatrixCells(payLevelId: number): Promise<PayMatrixCell[]> {
    return query<PayMatrixCell[]>(
      `SELECT pm.matrix_id AS matrixId,
              pm.commission_id AS commissionId,
              pm.pay_level_id AS payLevelId,
              pl.level_number AS levelNumber,
              pm.cell_number AS cellNumber,
              pm.basic_pay AS basicPay,
              pm.effective_from AS effectiveFrom,
              pm.effective_to AS effectiveTo
       FROM pay_matrix pm
       JOIN pay_levels pl ON pl.pay_level_id = pm.pay_level_id
       WHERE pm.pay_level_id = @payLevelId AND pm.is_active = 1
       ORDER BY pm.cell_number`,
      { payLevelId: { type: sql.Int, value: payLevelId } }
    );
  }

  /** Find the next cell (equal to or immediately above a given basic pay) */
  async findNextCell(payLevelId: number, currentBasicPay: number): Promise<PayMatrixCell | null> {
    const rows = await query<PayMatrixCell[]>(
      `SELECT TOP 1
              pm.matrix_id AS matrixId,
              pm.commission_id AS commissionId,
              pm.pay_level_id AS payLevelId,
              pl.level_number AS levelNumber,
              pm.cell_number AS cellNumber,
              pm.basic_pay AS basicPay,
              pm.effective_from AS effectiveFrom
       FROM pay_matrix pm
       JOIN pay_levels pl ON pl.pay_level_id = pm.pay_level_id
       WHERE pm.pay_level_id = @payLevelId
         AND pm.basic_pay > @currentBasicPay
         AND pm.is_active = 1
       ORDER BY pm.basic_pay ASC`,
      {
        payLevelId:      { type: sql.Int,          value: payLevelId },
        currentBasicPay: { type: sql.Decimal(12,2), value: currentBasicPay },
      }
    );
    return rows[0] || null;
  }

  /** Find cell equal to or immediately above a given pay (for promotion fixation) */
  async findCellEqualOrAbove(
    payLevelId: number,
    minimumPay: number
  ): Promise<PayMatrixCell | null> {
    const rows = await query<PayMatrixCell[]>(
      `SELECT TOP 1
              pm.matrix_id AS matrixId,
              pm.commission_id AS commissionId,
              pm.pay_level_id AS payLevelId,
              pl.level_number AS levelNumber,
              pm.cell_number AS cellNumber,
              pm.basic_pay AS basicPay,
              pm.effective_from AS effectiveFrom
       FROM pay_matrix pm
       JOIN pay_levels pl ON pl.pay_level_id = pm.pay_level_id
       WHERE pm.pay_level_id = @payLevelId
         AND pm.basic_pay >= @minimumPay
         AND pm.is_active = 1
       ORDER BY pm.basic_pay ASC`,
      {
        payLevelId:  { type: sql.Int,           value: payLevelId },
        minimumPay:  { type: sql.Decimal(12,2), value: minimumPay },
      }
    );
    return rows[0] || null;
  }

  /** Get active rules for a commission and rule type */
  async getActiveRules(commissionId: number, ruleTypeCode: string): Promise<PayRule[]> {
    return query<PayRule[]>(
      `SELECT pr.rule_id AS ruleId,
              pr.commission_id AS commissionId,
              pr.rule_type_id AS ruleTypeId,
              pr.rule_code AS ruleCode,
              pr.rule_name AS ruleName,
              pr.rule_description AS ruleDescription,
              pr.rule_parameters AS ruleParameters,
              pr.formula_expression AS formulaExpression,
              pr.effective_from AS effectiveFrom,
              pr.effective_to AS effectiveTo,
              pr.is_active AS isActive,
              pr.priority
       FROM pay_rules pr
       JOIN pay_rule_types prt ON prt.rule_type_id = pr.rule_type_id
       WHERE pr.commission_id = @commissionId
         AND prt.type_code = @ruleTypeCode
         AND pr.is_active = 1
         AND pr.effective_from <= GETUTCDATE()
         AND (pr.effective_to IS NULL OR pr.effective_to >= GETUTCDATE())
       ORDER BY pr.priority ASC`,
      {
        commissionId: { type: sql.Int,          value: commissionId },
        ruleTypeCode: { type: sql.NVarChar(50), value: ruleTypeCode },
      }
    );
  }

  /** Get a specific rule by ID */
  async getRuleById(ruleId: number): Promise<PayRule | null> {
    const rows = await query<PayRule[]>(
      `SELECT rule_id AS ruleId, commission_id AS commissionId,
              rule_type_id AS ruleTypeId, rule_code AS ruleCode,
              rule_name AS ruleName, rule_description AS ruleDescription,
              rule_parameters AS ruleParameters, formula_expression AS formulaExpression,
              effective_from AS effectiveFrom, effective_to AS effectiveTo,
              is_active AS isActive, priority
       FROM pay_rules WHERE rule_id = @ruleId`,
      { ruleId: { type: sql.Int, value: ruleId } }
    );
    return rows[0] || null;
  }
}

export const payCommissionService = new PayCommissionService();
