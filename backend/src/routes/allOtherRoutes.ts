// Stub routes for: departments, designations, promotions, increments,
// selectionGrade, payRevision, arrears, documents, reports, auditLog, users, settings, payRules
// These follow the same pattern as the main routes.

import { Router } from 'express';
import { query, execute, sql } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { auditService } from '../services/AuditService';
import { AppError } from '../middleware/errorHandler';
import { payRuleEngine } from '../services/PayRuleEngine';
import { z } from 'zod';

export const departmentRoutes = Router();
departmentRoutes.use(authenticate);

departmentRoutes.get('/', async (_req, res, next) => {
  try {
    const data = await query(
      `SELECT department_id AS departmentId, dept_code AS deptCode,
              dept_name AS deptName, parent_dept_id AS parentDeptId, is_active AS isActive
       FROM departments WHERE is_active = 1 ORDER BY dept_name`
    );
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

departmentRoutes.post('/', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const schema = z.object({
      deptCode: z.string().min(1).max(50),
      deptName: z.string().min(1).max(200),
      parentDeptId: z.number().int().optional(),
    });
    const body = schema.safeParse(req.body);
    if (!body.success) throw new AppError(body.error.errors[0].message, 400);
    const d = body.data;
    const result = await query<{ departmentId: number }[]>(
      `INSERT INTO departments (dept_code, dept_name, parent_dept_id)
       OUTPUT INSERTED.department_id AS departmentId
       VALUES (@deptCode, @deptName, @parentDeptId)`,
      {
        deptCode:     { type: sql.NVarChar(50),  value: d.deptCode },
        deptName:     { type: sql.NVarChar(200), value: d.deptName },
        parentDeptId: { type: sql.Int,           value: d.parentDeptId || null },
      }
    );
    res.status(201).json({ success: true, data: { departmentId: result[0].departmentId } });
  } catch (err) { next(err); }
});

// -----------------------------------------------------------------------
export const designationRoutes = Router();
designationRoutes.use(authenticate);

designationRoutes.get('/', async (req, res, next) => {
  try {
    const { departmentId } = req.query;
    let where = 'WHERE is_active = 1';
    const params: Record<string, { type: import('mssql').ISqlType | (() => import('mssql').ISqlType); value: unknown }> = {};
    if (departmentId) {
      where += ' AND department_id = @departmentId';
      params.departmentId = { type: sql.Int, value: parseInt(departmentId as string) };
    }
    const data = await query(
      `SELECT designation_id AS designationId, designation_code AS designationCode,
              designation_name AS designationName, department_id AS departmentId,
              grade_level AS gradeLevel, is_active AS isActive
       FROM designations ${where} ORDER BY designation_name`,
      params
    );
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

designationRoutes.post('/', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const schema = z.object({
      designationCode: z.string().min(1).max(50),
      designationName: z.string().min(1).max(200),
      departmentId: z.number().int().optional(),
      gradeLevel: z.string().optional(),
    });
    const body = schema.safeParse(req.body);
    if (!body.success) throw new AppError(body.error.errors[0].message, 400);
    const d = body.data;
    const result = await query<{ designationId: number }[]>(
      `INSERT INTO designations (designation_code, designation_name, department_id, grade_level)
       OUTPUT INSERTED.designation_id AS designationId
       VALUES (@designationCode, @designationName, @departmentId, @gradeLevel)`,
      {
        designationCode: { type: sql.NVarChar(50),  value: d.designationCode },
        designationName: { type: sql.NVarChar(200), value: d.designationName },
        departmentId:    { type: sql.Int,           value: d.departmentId || null },
        gradeLevel:      { type: sql.NVarChar(50),  value: d.gradeLevel || null },
      }
    );
    res.status(201).json({ success: true, data: { designationId: result[0].designationId } });
  } catch (err) { next(err); }
});

// -----------------------------------------------------------------------
export const promotionRoutes = Router();
promotionRoutes.use(authenticate);

promotionRoutes.get('/employee/:employeeId', async (req, res, next) => {
  try {
    const data = await query(
      `SELECT p.*, pd.designation_name AS previousDesignationName,
              nd.designation_name AS newDesignationName,
              ppl.level_number AS previousLevelNumber, npl.level_number AS newLevelNumber
       FROM employee_promotions p
       LEFT JOIN designations pd ON pd.designation_id = p.previous_designation_id
       LEFT JOIN designations nd ON nd.designation_id = p.new_designation_id
       LEFT JOIN pay_levels ppl ON ppl.pay_level_id = p.previous_pay_level_id
       LEFT JOIN pay_levels npl ON npl.pay_level_id = p.new_pay_level_id
       WHERE p.employee_id = @employeeId ORDER BY p.promotion_date DESC`,
      { employeeId: { type: sql.Int, value: parseInt(req.params.employeeId) } }
    );
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

promotionRoutes.post('/', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const schema = z.object({
      employeeId:             z.number().int(),
      promotionDate:          z.string(),
      previousDesignationId:  z.number().int().optional(),
      newDesignationId:       z.number().int().optional(),
      previousPayLevelId:     z.number().int(),
      newPayLevelId:          z.number().int(),
      previousPayCell:        z.number().int(),
      previousBasicPay:       z.number(),
      commissionId:           z.number().int(),
      applicableRuleId:       z.number().int().optional(),
      orderNumber:            z.string().optional(),
      orderDate:              z.string().optional(),
      remarks:                z.string().optional(),
    });

    const body = schema.safeParse(req.body);
    if (!body.success) throw new AppError(body.error.errors[0].message, 400);
    const d = body.data;

    // Calculate promotion pay
    const calcResult = await payRuleEngine.calculatePromotionPay({
      commissionId:      d.commissionId,
      currentPayLevelId: d.previousPayLevelId,
      currentPayCell:    d.previousPayCell,
      currentBasicPay:   d.previousBasicPay,
      newPayLevelId:     d.newPayLevelId,
      promotionDate:     new Date(d.promotionDate),
      calculatedBy:      req.user!.userId,
      ruleId:            d.applicableRuleId,
    });

    const result = await query<{ promotionId: number }[]>(
      `INSERT INTO employee_promotions
         (employee_id, promotion_date, previous_designation_id, new_designation_id,
          previous_pay_level_id, new_pay_level_id, previous_pay_cell, new_pay_cell,
          previous_basic_pay, new_basic_pay, applicable_rule_id, order_number, order_date,
          next_increment_date, calculation_details, remarks, approval_status, created_by)
       OUTPUT INSERTED.promotion_id AS promotionId
       VALUES (@employeeId, @promotionDate, @prevDesigId, @newDesigId,
               @prevLevelId, @newLevelId, @prevCell, @newCell,
               @prevPay, @newPay, @ruleId, @orderNumber, @orderDate,
               @nextIncDate, @calcDetails, @remarks, 'CALCULATED', @createdBy)`,
      {
        employeeId:   { type: sql.Int,           value: d.employeeId },
        promotionDate:{ type: sql.Date,          value: new Date(d.promotionDate) },
        prevDesigId:  { type: sql.Int,           value: d.previousDesignationId || null },
        newDesigId:   { type: sql.Int,           value: d.newDesignationId || null },
        prevLevelId:  { type: sql.Int,           value: d.previousPayLevelId },
        newLevelId:   { type: sql.Int,           value: d.newPayLevelId },
        prevCell:     { type: sql.Int,           value: d.previousPayCell },
        newCell:      { type: sql.Int,           value: calcResult.newPayCell },
        prevPay:      { type: sql.Decimal(12,2), value: d.previousBasicPay },
        newPay:       { type: sql.Decimal(12,2), value: calcResult.newBasicPay },
        ruleId:       { type: sql.Int,           value: d.applicableRuleId || null },
        orderNumber:  { type: sql.NVarChar(100), value: d.orderNumber || null },
        orderDate:    { type: sql.Date,          value: d.orderDate ? new Date(d.orderDate) : null },
        nextIncDate:  { type: sql.Date,          value: calcResult.nextIncrementDate },
        calcDetails:  { type: sql.NVarChar(sql.MAX), value: JSON.stringify({ steps: calcResult.steps, ruleUsed: calcResult.ruleUsed }) },
        remarks:      { type: sql.NVarChar(1000), value: d.remarks || null },
        createdBy:    { type: sql.Int,           value: req.user!.userId },
      }
    );

    await auditService.log({
      userId: req.user!.userId, username: req.user!.username,
      action: 'CREATE', module: 'PROMOTIONS',
      recordId: result[0].promotionId, employeeId: d.employeeId,
      description: `Promotion added for employee ${d.employeeId}. New pay: ${calcResult.newBasicPay}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      data: {
        promotionId: result[0].promotionId,
        calculationResult: {
          newPayCell: calcResult.newPayCell,
          newBasicPay: calcResult.newBasicPay,
          nextIncrementDate: calcResult.nextIncrementDate,
          steps: calcResult.steps,
        },
      },
    });
  } catch (err) { next(err); }
});

// -----------------------------------------------------------------------
export const incrementRoutes = Router();
incrementRoutes.use(authenticate);

incrementRoutes.get('/due', async (_req, res, next) => {
  try {
    const data = await query(`
      SELECT e.employee_id AS employeeId, e.employee_code AS employeeCode,
             e.employee_name AS employeeName,
             d.dept_name AS departmentName, des.designation_name AS designationName,
             pl.level_number AS levelNumber, e.current_pay_cell AS currentPayCell,
             e.basic_pay AS basicPay, e.increment_date AS incrementDate,
             pc.commission_name AS commissionName
      FROM employees e
      LEFT JOIN departments d ON d.department_id = e.department_id
      LEFT JOIN designations des ON des.designation_id = e.designation_id
      LEFT JOIN pay_levels pl ON pl.pay_level_id = e.current_pay_level_id
      LEFT JOIN pay_commissions pc ON pc.commission_id = e.current_commission_id
      WHERE e.status = 'ACTIVE'
        AND e.increment_date IS NOT NULL
        AND e.increment_date <= DATEADD(day, 60, GETUTCDATE())
      ORDER BY e.increment_date ASC
    `);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

incrementRoutes.get('/employee/:employeeId', async (req, res, next) => {
  try {
    const data = await query(
      `SELECT i.*, pl.level_number AS levelNumber
       FROM employee_increments i
       LEFT JOIN pay_levels pl ON pl.pay_level_id = i.previous_pay_level_id
       WHERE i.employee_id = @employeeId ORDER BY i.increment_date DESC`,
      { employeeId: { type: sql.Int, value: parseInt(req.params.employeeId) } }
    );
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

incrementRoutes.post('/', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const schema = z.object({
      employeeId:       z.number().int(),
      incrementDate:    z.string(),
      commissionId:     z.number().int(),
      payLevelId:       z.number().int(),
      currentPayCell:   z.number().int(),
      currentBasicPay:  z.number(),
      applicableRuleId: z.number().int().optional(),
      remarks:          z.string().optional(),
    });
    const body = schema.safeParse(req.body);
    if (!body.success) throw new AppError(body.error.errors[0].message, 400);
    const d = body.data;

    const calcResult = await payRuleEngine.calculateIncrement({
      commissionId:    d.commissionId,
      payLevelId:      d.payLevelId,
      currentPayCell:  d.currentPayCell,
      currentBasicPay: d.currentBasicPay,
      incrementDate:   new Date(d.incrementDate),
      calculatedBy:    req.user!.userId,
    });

    const result = await query<{ incrementId: number }[]>(
      `INSERT INTO employee_increments
         (employee_id, increment_date, previous_pay_level_id, previous_pay_cell, new_pay_cell,
          previous_basic_pay, new_basic_pay, applicable_rule_id, next_increment_date,
          calculation_details, remarks, approval_status, created_by)
       OUTPUT INSERTED.increment_id AS incrementId
       VALUES (@employeeId, @incrementDate, @payLevelId, @prevCell, @newCell,
               @prevPay, @newPay, @ruleId, @nextIncDate,
               @calcDetails, @remarks, 'CALCULATED', @createdBy)`,
      {
        employeeId:   { type: sql.Int,           value: d.employeeId },
        incrementDate:{ type: sql.Date,          value: new Date(d.incrementDate) },
        payLevelId:   { type: sql.Int,           value: d.payLevelId },
        prevCell:     { type: sql.Int,           value: d.currentPayCell },
        newCell:      { type: sql.Int,           value: calcResult.newPayCell },
        prevPay:      { type: sql.Decimal(12,2), value: d.currentBasicPay },
        newPay:       { type: sql.Decimal(12,2), value: calcResult.newBasicPay },
        ruleId:       { type: sql.Int,           value: d.applicableRuleId || null },
        nextIncDate:  { type: sql.Date,          value: calcResult.nextIncrementDate },
        calcDetails:  { type: sql.NVarChar(sql.MAX), value: JSON.stringify({ steps: calcResult.steps }) },
        remarks:      { type: sql.NVarChar(1000), value: d.remarks || null },
        createdBy:    { type: sql.Int,           value: req.user!.userId },
      }
    );

    res.status(201).json({ success: true, data: { incrementId: result[0].incrementId, calcResult } });
  } catch (err) { next(err); }
});

// -----------------------------------------------------------------------
export const selectionGradeRoutes = Router();
selectionGradeRoutes.use(authenticate);

selectionGradeRoutes.get('/employee/:employeeId', async (req, res, next) => {
  try {
    const data = await query(
      `SELECT sg.*, pl_prev.level_number AS previousLevelNumber, pl_new.level_number AS newLevelNumber
       FROM employee_selection_grades sg
       LEFT JOIN pay_levels pl_prev ON pl_prev.pay_level_id = sg.previous_pay_level_id
       LEFT JOIN pay_levels pl_new ON pl_new.pay_level_id = sg.new_pay_level_id
       WHERE sg.employee_id = @employeeId ORDER BY sg.effective_date DESC`,
      { employeeId: { type: sql.Int, value: parseInt(req.params.employeeId) } }
    );
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

selectionGradeRoutes.post('/', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const schema = z.object({
      employeeId:          z.number().int(),
      gradeType:           z.enum(['SELECTION_GRADE', 'SENIOR_SELECTION_GRADE']),
      effectiveDate:       z.string(),
      commissionId:        z.number().int(),
      previousPayLevelId:  z.number().int(),
      newPayLevelId:       z.number().int(),
      previousPayCell:     z.number().int(),
      previousBasicPay:    z.number(),
      previousDesignationId: z.number().int().optional(),
      newDesignationId:    z.number().int().optional(),
      applicableRuleId:    z.number().int().optional(),
      orderNumber:         z.string().optional(),
      orderDate:           z.string().optional(),
      remarks:             z.string().optional(),
    });
    const body = schema.safeParse(req.body);
    if (!body.success) throw new AppError(body.error.errors[0].message, 400);
    const d = body.data;

    const calcResult = await payRuleEngine.calculateSelectionGradePay({
      commissionId:      d.commissionId,
      currentPayLevelId: d.previousPayLevelId,
      currentPayCell:    d.previousPayCell,
      currentBasicPay:   d.previousBasicPay,
      newPayLevelId:     d.newPayLevelId,
      effectiveDate:     new Date(d.effectiveDate),
      gradeType:         d.gradeType,
      calculatedBy:      req.user!.userId,
      ruleId:            d.applicableRuleId,
    });

    const result = await query<{ selectionGradeId: number }[]>(
      `INSERT INTO employee_selection_grades
         (employee_id, grade_type, effective_date, previous_designation_id, new_designation_id,
          previous_pay_level_id, new_pay_level_id, previous_pay_cell, new_pay_cell,
          previous_basic_pay, new_basic_pay, applicable_rule_id, order_number, order_date,
          next_increment_date, calculation_details, remarks, approval_status, created_by)
       OUTPUT INSERTED.selection_grade_id AS selectionGradeId
       VALUES (@employeeId, @gradeType, @effectiveDate, @prevDesigId, @newDesigId,
               @prevLevelId, @newLevelId, @prevCell, @newCell,
               @prevPay, @newPay, @ruleId, @orderNumber, @orderDate,
               @nextIncDate, @calcDetails, @remarks, 'CALCULATED', @createdBy)`,
      {
        employeeId:  { type: sql.Int,           value: d.employeeId },
        gradeType:   { type: sql.NVarChar(50),  value: d.gradeType },
        effectiveDate:{ type: sql.Date,         value: new Date(d.effectiveDate) },
        prevDesigId: { type: sql.Int,           value: d.previousDesignationId || null },
        newDesigId:  { type: sql.Int,           value: d.newDesignationId || null },
        prevLevelId: { type: sql.Int,           value: d.previousPayLevelId },
        newLevelId:  { type: sql.Int,           value: d.newPayLevelId },
        prevCell:    { type: sql.Int,           value: d.previousPayCell },
        newCell:     { type: sql.Int,           value: calcResult.newPayCell },
        prevPay:     { type: sql.Decimal(12,2), value: d.previousBasicPay },
        newPay:      { type: sql.Decimal(12,2), value: calcResult.newBasicPay },
        ruleId:      { type: sql.Int,           value: d.applicableRuleId || null },
        orderNumber: { type: sql.NVarChar(100), value: d.orderNumber || null },
        orderDate:   { type: sql.Date,          value: d.orderDate ? new Date(d.orderDate) : null },
        nextIncDate: { type: sql.Date,          value: calcResult.nextIncrementDate },
        calcDetails: { type: sql.NVarChar(sql.MAX), value: JSON.stringify({ steps: calcResult.steps }) },
        remarks:     { type: sql.NVarChar(1000), value: d.remarks || null },
        createdBy:   { type: sql.Int,           value: req.user!.userId },
      }
    );

    res.status(201).json({ success: true, data: { selectionGradeId: result[0].selectionGradeId, calcResult } });
  } catch (err) { next(err); }
});

// -----------------------------------------------------------------------
export const payRevisionRoutes = Router();
payRevisionRoutes.use(authenticate);

payRevisionRoutes.post('/', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const schema = z.object({
      employeeId:         z.number().int(),
      effectiveDate:      z.string(),
      fromCommissionId:   z.number().int(),
      toCommissionId:     z.number().int(),
      currentPayLevelId:  z.number().int(),
      currentPayCell:     z.number().int(),
      currentBasicPay:    z.number(),
      applicableRuleId:   z.number().int().optional(),
      remarks:            z.string().optional(),
    });
    const body = schema.safeParse(req.body);
    if (!body.success) throw new AppError(body.error.errors[0].message, 400);
    const d = body.data;

    const calcResult = await payRuleEngine.calculateRevisionPay({
      fromCommissionId:  d.fromCommissionId,
      toCommissionId:    d.toCommissionId,
      currentBasicPay:   d.currentBasicPay,
      currentPayLevelId: d.currentPayLevelId,
      currentPayCell:    d.currentPayCell,
      effectiveDate:     new Date(d.effectiveDate),
      calculatedBy:      req.user!.userId,
      ruleId:            d.applicableRuleId,
    });

    const result = await query<{ revisionId: number }[]>(
      `INSERT INTO employee_pay_revisions
         (employee_id, effective_date, from_commission_id, to_commission_id,
          previous_pay_level_id, new_pay_level_id, previous_pay_cell, new_pay_cell,
          previous_basic_pay, new_basic_pay, applicable_rule_id, fitment_factor_used,
          calculation_details, remarks, approval_status, created_by)
       OUTPUT INSERTED.revision_id AS revisionId
       VALUES (@employeeId, @effectiveDate, @fromCommId, @toCommId,
               @prevLevelId, @newLevelId, @prevCell, @newCell,
               @prevPay, @newPay, @ruleId, @fitmentFactor,
               @calcDetails, @remarks, 'CALCULATED', @createdBy)`,
      {
        employeeId:   { type: sql.Int,           value: d.employeeId },
        effectiveDate:{ type: sql.Date,          value: new Date(d.effectiveDate) },
        fromCommId:   { type: sql.Int,           value: d.fromCommissionId },
        toCommId:     { type: sql.Int,           value: d.toCommissionId },
        prevLevelId:  { type: sql.Int,           value: d.currentPayLevelId },
        newLevelId:   { type: sql.Int,           value: calcResult.newPayLevelId },
        prevCell:     { type: sql.Int,           value: d.currentPayCell },
        newCell:      { type: sql.Int,           value: calcResult.newPayCell },
        prevPay:      { type: sql.Decimal(12,2), value: d.currentBasicPay },
        newPay:       { type: sql.Decimal(12,2), value: calcResult.newBasicPay },
        ruleId:       { type: sql.Int,           value: d.applicableRuleId || null },
        fitmentFactor:{ type: sql.Decimal(10,4), value: calcResult.fitmentFactorUsed },
        calcDetails:  { type: sql.NVarChar(sql.MAX), value: JSON.stringify({ steps: calcResult.steps }) },
        remarks:      { type: sql.NVarChar(1000),value: d.remarks || null },
        createdBy:    { type: sql.Int,           value: req.user!.userId },
      }
    );

    res.status(201).json({ success: true, data: { revisionId: result[0].revisionId, calcResult } });
  } catch (err) { next(err); }
});

// -----------------------------------------------------------------------
export const arrearsRoutes = Router();
arrearsRoutes.use(authenticate);

arrearsRoutes.post('/calculate', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const schema = z.object({
      employeeId:       z.number().int(),
      fromDate:         z.string(),
      toDate:           z.string(),
      oldBasicPay:      z.number(),
      revisedBasicPay:  z.number(),
      referenceType:    z.string().optional(),
      referenceId:      z.number().int().optional(),
      deductions:       z.number().optional(),
      remarks:          z.string().optional(),
    });
    const body = schema.safeParse(req.body);
    if (!body.success) throw new AppError(body.error.errors[0].message, 400);
    const d = body.data;

    const calcResult = payRuleEngine.calculateArrears({
      fromDate:         new Date(d.fromDate),
      toDate:           new Date(d.toDate),
      oldBasicPay:      d.oldBasicPay,
      revisedBasicPay:  d.revisedBasicPay,
    });

    const netArrear = calcResult.totalArrear - (d.deductions || 0);

    const result = await query<{ arrearId: number }[]>(
      `INSERT INTO arrears
         (employee_id, arrear_from_date, arrear_to_date, old_basic_pay, revised_basic_pay,
          reference_type, reference_id, monthly_details, total_arrear, deductions,
          net_arrear, remarks, approval_status, created_by)
       OUTPUT INSERTED.arrear_id AS arrearId
       VALUES (@employeeId, @fromDate, @toDate, @oldPay, @revisedPay,
               @refType, @refId, @monthlyDetails, @totalArrear, @deductions,
               @netArrear, @remarks, 'CALCULATED', @createdBy)`,
      {
        employeeId:     { type: sql.Int,           value: d.employeeId },
        fromDate:       { type: sql.Date,          value: new Date(d.fromDate) },
        toDate:         { type: sql.Date,          value: new Date(d.toDate) },
        oldPay:         { type: sql.Decimal(12,2), value: d.oldBasicPay },
        revisedPay:     { type: sql.Decimal(12,2), value: d.revisedBasicPay },
        refType:        { type: sql.NVarChar(50),  value: d.referenceType || null },
        refId:          { type: sql.Int,           value: d.referenceId || null },
        monthlyDetails: { type: sql.NVarChar(sql.MAX), value: JSON.stringify(calcResult.monthlyDetails) },
        totalArrear:    { type: sql.Decimal(12,2), value: calcResult.totalArrear },
        deductions:     { type: sql.Decimal(12,2), value: d.deductions || 0 },
        netArrear:      { type: sql.Decimal(12,2), value: netArrear },
        remarks:        { type: sql.NVarChar(1000),value: d.remarks || null },
        createdBy:      { type: sql.Int,           value: req.user!.userId },
      }
    );

    res.status(201).json({
      success: true,
      data: { arrearId: result[0].arrearId, ...calcResult, deductions: d.deductions, netArrear },
    });
  } catch (err) { next(err); }
});

arrearsRoutes.get('/employee/:employeeId', async (req, res, next) => {
  try {
    const data = await query(
      `SELECT * FROM arrears WHERE employee_id = @employeeId ORDER BY arrear_from_date DESC`,
      { employeeId: { type: sql.Int, value: parseInt(req.params.employeeId) } }
    );
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// -----------------------------------------------------------------------
export const auditLogRoutes = Router();
auditLogRoutes.use(authenticate);
auditLogRoutes.use(authorize('SUPER_ADMIN', 'ADMIN'));

auditLogRoutes.get('/', async (req, res, next) => {
  try {
    const { module, employeeId, action, from, to, page, limit } = req.query;
    const result = await auditService.getLogs({
      module:     module as string,
      employeeId: employeeId ? parseInt(employeeId as string) : undefined,
      action:     action as string,
      from:       from ? new Date(from as string) : undefined,
      to:         to ? new Date(to as string) : undefined,
      page:       page ? parseInt(page as string) : 1,
      limit:      limit ? parseInt(limit as string) : 50,
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

// -----------------------------------------------------------------------
export const settingsRoutes = Router();
settingsRoutes.use(authenticate);

settingsRoutes.get('/', async (_req, res, next) => {
  try {
    const settings = await query(
      `SELECT setting_key AS settingKey, setting_value AS settingValue,
              setting_group AS settingGroup, description
       FROM system_settings ORDER BY setting_group, setting_key`
    );
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
});

settingsRoutes.put('/:key', authorize('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { value } = req.body;
    await execute(
      `UPDATE system_settings SET setting_value = @value, updated_at = GETUTCDATE(), updated_by = @updatedBy
       WHERE setting_key = @key`,
      {
        key:       { type: sql.NVarChar(200), value: req.params.key },
        value:     { type: sql.NVarChar(sql.MAX), value: String(value) },
        updatedBy: { type: sql.Int, value: req.user!.userId },
      }
    );
    res.json({ success: true, message: 'Setting updated' });
  } catch (err) { next(err); }
});

// -----------------------------------------------------------------------
export const userRoutes = Router();
userRoutes.use(authenticate, authorize('SUPER_ADMIN'));

userRoutes.get('/', async (_req, res, next) => {
  try {
    const data = await query(
      `SELECT u.user_id AS userId, u.username, u.email, u.full_name AS fullName,
              r.role_name AS roleName, u.is_active AS isActive, u.last_login AS lastLogin,
              u.created_at AS createdAt
       FROM users u JOIN roles r ON r.role_id = u.role_id
       ORDER BY u.full_name`
    );
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

userRoutes.post('/', async (req, res, next) => {
  try {
    const bcrypt = await import('bcryptjs');
    const schema = z.object({
      username: z.string().min(3).max(100),
      email:    z.string().email(),
      password: z.string().min(8),
      fullName: z.string().min(1).max(200),
      roleId:   z.number().int(),
    });
    const body = schema.safeParse(req.body);
    if (!body.success) throw new AppError(body.error.errors[0].message, 400);
    const d = body.data;
    const hash = await bcrypt.default.hash(d.password, 12);
    const result = await query<{ userId: number }[]>(
      `INSERT INTO users (username, email, password_hash, full_name, role_id, created_by)
       OUTPUT INSERTED.user_id AS userId
       VALUES (@username, @email, @hash, @fullName, @roleId, @createdBy)`,
      {
        username:  { type: sql.NVarChar(100), value: d.username },
        email:     { type: sql.NVarChar(255), value: d.email },
        hash:      { type: sql.NVarChar(500), value: hash },
        fullName:  { type: sql.NVarChar(200), value: d.fullName },
        roleId:    { type: sql.Int,           value: d.roleId },
        createdBy: { type: sql.Int,           value: req.user!.userId },
      }
    );
    res.status(201).json({ success: true, data: { userId: result[0].userId } });
  } catch (err) { next(err); }
});

// -----------------------------------------------------------------------
export const reportsRoutes = Router();
reportsRoutes.use(authenticate);

reportsRoutes.get('/templates', async (_req, res, next) => {
  try {
    const data = await query(
      `SELECT template_id AS templateId, template_code AS templateCode,
              template_name AS templateName, report_type AS reportType, is_default AS isDefault
       FROM report_templates WHERE is_active = 1 ORDER BY report_type, template_name`
    );
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

reportsRoutes.get('/employee/:employeeId/pay-history', async (req, res, next) => {
  try {
    const data = await query(
      `SELECT h.effective_date AS effectiveDate,
              set_.type_name AS eventTypeName,
              h.previous_basic_pay AS previousBasicPay,
              h.new_basic_pay AS newBasicPay,
              pl.level_number AS levelNumber,
              h.new_pay_cell AS newPayCell,
              h.order_number AS orderNumber,
              h.remarks
       FROM employee_service_history h
       JOIN service_event_types set_ ON set_.event_type_id = h.event_type_id
       LEFT JOIN pay_levels pl ON pl.pay_level_id = h.new_pay_level_id
       WHERE h.employee_id = @employeeId
         AND set_.affects_pay = 1
         AND h.approval_status = 'APPLIED'
       ORDER BY h.effective_date ASC`,
      { employeeId: { type: sql.Int, value: parseInt(req.params.employeeId) } }
    );
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export const documentsRoutes = Router();
documentsRoutes.use(authenticate);

documentsRoutes.get('/employee/:employeeId', async (req, res, next) => {
  try {
    const data = await query(
      `SELECT document_id AS documentId, document_type AS documentType,
              file_name AS fileName, file_size AS fileSize, mime_type AS mimeType,
              related_module AS relatedModule, related_id AS relatedId,
              description, upload_date AS uploadDate
       FROM documents
       WHERE employee_id = @employeeId AND is_active = 1
       ORDER BY upload_date DESC`,
      { employeeId: { type: sql.Int, value: parseInt(req.params.employeeId) } }
    );
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export const payRulesRoutes = Router();
payRulesRoutes.use(authenticate);

payRulesRoutes.get('/types', async (_req, res, next) => {
  try {
    const data = await query(
      `SELECT rule_type_id AS ruleTypeId, type_code AS typeCode, type_name AS typeName, description
       FROM pay_rule_types ORDER BY type_name`
    );
    res.json({ success: true, data });
  } catch (err) { next(err); }
});
