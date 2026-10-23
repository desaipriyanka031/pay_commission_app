import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { execute, query, sql } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { auditService } from '../services/AuditService';
import { payRuleEngine } from '../services/PayRuleEngine';

const router = Router();
router.use(authenticate);

// -----------------------------------------------------------------------
// POST /api/pay-fixation/calculate
// Calculate pay fixation transparently (does not save)
// -----------------------------------------------------------------------
const calculateSchema = z.object({
  fixationType: z.enum(['INCREMENT', 'PROMOTION', 'SELECTION_GRADE', 'PAY_REVISION']),
  employeeId:          z.number().int(),
  commissionId:        z.number().int(),
  currentPayLevelId:   z.number().int(),
  currentPayCell:      z.number().int(),
  currentBasicPay:     z.number(),
  newPayLevelId:       z.number().int().optional(),
  effectiveDate:       z.string(),
  ruleId:              z.number().int().optional(),
  fromCommissionId:    z.number().int().optional(),
  toCommissionId:      z.number().int().optional(),
  gradeType:           z.string().optional(),
});

router.post('/calculate', authorize('SUPER_ADMIN', 'ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = calculateSchema.safeParse(req.body);
    if (!body.success) throw new AppError(body.error.errors[0].message, 400);

    const d = body.data;
    const effectiveDate = new Date(d.effectiveDate);
    let result;

    switch (d.fixationType) {
      case 'INCREMENT':
        result = await payRuleEngine.calculateIncrement({
          commissionId:    d.commissionId,
          payLevelId:      d.currentPayLevelId,
          currentPayCell:  d.currentPayCell,
          currentBasicPay: d.currentBasicPay,
          incrementDate:   effectiveDate,
          calculatedBy:    req.user!.userId,
        });
        break;

      case 'PROMOTION':
        if (!d.newPayLevelId) throw new AppError('newPayLevelId is required for promotion fixation', 400);
        result = await payRuleEngine.calculatePromotionPay({
          commissionId:        d.commissionId,
          currentPayLevelId:   d.currentPayLevelId,
          currentPayCell:      d.currentPayCell,
          currentBasicPay:     d.currentBasicPay,
          newPayLevelId:       d.newPayLevelId,
          promotionDate:       effectiveDate,
          calculatedBy:        req.user!.userId,
          ruleId:              d.ruleId,
        });
        break;

      case 'SELECTION_GRADE':
        if (!d.newPayLevelId) throw new AppError('newPayLevelId is required for selection grade fixation', 400);
        result = await payRuleEngine.calculateSelectionGradePay({
          commissionId:       d.commissionId,
          currentPayLevelId:  d.currentPayLevelId,
          currentPayCell:     d.currentPayCell,
          currentBasicPay:    d.currentBasicPay,
          newPayLevelId:      d.newPayLevelId,
          effectiveDate,
          gradeType:          d.gradeType || 'SELECTION_GRADE',
          calculatedBy:       req.user!.userId,
          ruleId:             d.ruleId,
        });
        break;

      case 'PAY_REVISION':
        if (!d.fromCommissionId || !d.toCommissionId) {
          throw new AppError('fromCommissionId and toCommissionId required for pay revision', 400);
        }
        result = await payRuleEngine.calculateRevisionPay({
          fromCommissionId:   d.fromCommissionId,
          toCommissionId:     d.toCommissionId,
          currentBasicPay:    d.currentBasicPay,
          currentPayLevelId:  d.currentPayLevelId,
          currentPayCell:     d.currentPayCell,
          effectiveDate,
          calculatedBy:       req.user!.userId,
          ruleId:             d.ruleId,
        });
        break;

      default:
        throw new AppError('Unsupported fixation type', 400);
    }

    res.json({
      success: true,
      data: {
        fixationType: d.fixationType,
        employeeId: d.employeeId,
        effectiveDate: d.effectiveDate,
        previousBasicPay: d.currentBasicPay,
        ...result,
        disclaimer:
          'PLACEHOLDER: Calculations are based on configured rules. ' +
          'Verify rules against official commission documents before approving.',
      },
    });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------
// POST /api/pay-fixation/save
// Save a calculated fixation as a draft
// -----------------------------------------------------------------------
router.post('/save', authorize('SUPER_ADMIN', 'ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const saveSchema = z.object({
      employeeId:       z.number().int(),
      fixationType:     z.string(),
      referenceId:      z.number().int().optional(),
      commissionId:     z.number().int().optional(),
      effectiveDate:    z.string(),
      previousPayLevelId: z.number().int().optional(),
      newPayLevelId:    z.number().int().optional(),
      previousPayCell:  z.number().int().optional(),
      newPayCell:       z.number().int().optional(),
      previousBasicPay: z.number().optional(),
      newBasicPay:      z.number(),
      applicableRuleId: z.number().int().optional(),
      ruleNameUsed:     z.string().optional(),
      inputSnapshot:    z.record(z.unknown()).optional(),
      calculationSteps: z.array(z.unknown()).optional(),
      nextIncrementDate: z.string().optional(),
    });

    const body = saveSchema.safeParse(req.body);
    if (!body.success) throw new AppError(body.error.errors[0].message, 400);
    const d = body.data;

    const result = await query<{ fixationId: number }[]>(
      `INSERT INTO employee_pay_fixations
         (employee_id, fixation_type, reference_id, commission_id, effective_date,
          previous_pay_level_id, new_pay_level_id, previous_pay_cell, new_pay_cell,
          previous_basic_pay, new_basic_pay, applicable_rule_id, rule_name_used,
          input_snapshot, calculation_steps, next_increment_date,
          calculated_by, calculated_at, approval_status, created_by,
          created_at, updated_at)
       OUTPUT INSERTED.fixation_id AS fixationId
       VALUES
         (@employeeId, @fixationType, @referenceId, @commissionId, @effectiveDate,
          @previousPayLevelId, @newPayLevelId, @previousPayCell, @newPayCell,
          @previousBasicPay, @newBasicPay, @applicableRuleId, @ruleNameUsed,
          @inputSnapshot, @calculationSteps, @nextIncrementDate,
          @calculatedBy, GETUTCDATE(), 'CALCULATED', @createdBy,
          GETUTCDATE(), GETUTCDATE())`,
      {
        employeeId:        { type: sql.Int,           value: d.employeeId },
        fixationType:      { type: sql.NVarChar(50),  value: d.fixationType },
        referenceId:       { type: sql.Int,           value: d.referenceId || null },
        commissionId:      { type: sql.Int,           value: d.commissionId || null },
        effectiveDate:     { type: sql.Date,          value: new Date(d.effectiveDate) },
        previousPayLevelId:{ type: sql.Int,           value: d.previousPayLevelId || null },
        newPayLevelId:     { type: sql.Int,           value: d.newPayLevelId || null },
        previousPayCell:   { type: sql.Int,           value: d.previousPayCell || null },
        newPayCell:        { type: sql.Int,           value: d.newPayCell || null },
        previousBasicPay:  { type: sql.Decimal(12,2), value: d.previousBasicPay || null },
        newBasicPay:       { type: sql.Decimal(12,2), value: d.newBasicPay },
        applicableRuleId:  { type: sql.Int,           value: d.applicableRuleId || null },
        ruleNameUsed:      { type: sql.NVarChar(200), value: d.ruleNameUsed || null },
        inputSnapshot:     { type: sql.NVarChar(sql.MAX), value: d.inputSnapshot ? JSON.stringify(d.inputSnapshot) : null },
        calculationSteps:  { type: sql.NVarChar(sql.MAX), value: d.calculationSteps ? JSON.stringify(d.calculationSteps) : null },
        nextIncrementDate: { type: sql.Date,          value: d.nextIncrementDate ? new Date(d.nextIncrementDate) : null },
        calculatedBy:      { type: sql.Int,           value: req.user!.userId },
        createdBy:         { type: sql.Int,           value: req.user!.userId },
      }
    );

    await auditService.log({
      userId: req.user!.userId,
      username: req.user!.username,
      action: 'CALCULATE',
      module: 'PAY_FIXATION',
      recordId: result[0].fixationId,
      employeeId: d.employeeId,
      description: `Pay fixation calculated for employee ${d.employeeId}: ${d.fixationType}`,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, data: { fixationId: result[0].fixationId } });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------
// POST /api/pay-fixation/:id/submit
// Submit fixation for approval
// -----------------------------------------------------------------------
router.post('/:id/submit', authorize('SUPER_ADMIN', 'ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fixationId = parseInt(req.params.id);
    await execute(
      `UPDATE employee_pay_fixations
       SET approval_status = 'SUBMITTED', updated_at = GETUTCDATE()
       WHERE fixation_id = @fixationId AND approval_status = 'CALCULATED'`,
      { fixationId: { type: sql.Int, value: fixationId } }
    );

    await auditService.log({
      userId: req.user!.userId,
      username: req.user!.username,
      action: 'SUBMIT_FOR_APPROVAL',
      module: 'PAY_FIXATION',
      recordId: fixationId,
      description: `Pay fixation ${fixationId} submitted for approval`,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Submitted for approval' });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------
// POST /api/pay-fixation/:id/approve
// Approve or reject a pay fixation
// -----------------------------------------------------------------------
router.post('/:id/approve', authorize('SUPER_ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fixationId = parseInt(req.params.id);
    const schema = z.object({
      action: z.enum(['APPROVE', 'REJECT']),
      remarks: z.string().optional(),
    });

    const body = schema.safeParse(req.body);
    if (!body.success) throw new AppError(body.error.errors[0].message, 400);

    const newStatus = body.data.action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    await execute(
      `UPDATE employee_pay_fixations
       SET approval_status = @status,
           approved_by = @approvedBy,
           approved_at = GETUTCDATE(),
           approval_remarks = @remarks,
           updated_at = GETUTCDATE()
       WHERE fixation_id = @fixationId`,
      {
        fixationId:  { type: sql.Int,           value: fixationId },
        status:      { type: sql.NVarChar(50),  value: newStatus },
        approvedBy:  { type: sql.Int,           value: req.user!.userId },
        remarks:     { type: sql.NVarChar(500), value: body.data.remarks || null },
      }
    );

    await auditService.log({
      userId: req.user!.userId,
      username: req.user!.username,
      action: body.data.action,
      module: 'PAY_FIXATION',
      recordId: fixationId,
      description: `Pay fixation ${fixationId} ${newStatus.toLowerCase()}`,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: `Pay fixation ${newStatus.toLowerCase()} successfully` });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------
// POST /api/pay-fixation/:id/apply
// Apply approved fixation to employee record
// -----------------------------------------------------------------------
router.post('/:id/apply', authorize('SUPER_ADMIN', 'ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fixationId = parseInt(req.params.id);

    const fixations = await query<{
      fixationId: number; employeeId: number; newBasicPay: number;
      newPayLevelId: number; newPayCell: number; nextIncrementDate: Date;
      approvalStatus: string;
    }[]>(
      `SELECT fixation_id AS fixationId, employee_id AS employeeId,
              new_basic_pay AS newBasicPay, new_pay_level_id AS newPayLevelId,
              new_pay_cell AS newPayCell, next_increment_date AS nextIncrementDate,
              approval_status AS approvalStatus
       FROM employee_pay_fixations WHERE fixation_id = @fixationId`,
      { fixationId: { type: sql.Int, value: fixationId } }
    );

    const fixation = fixations[0];
    if (!fixation) throw new AppError('Pay fixation not found', 404);
    if (fixation.approvalStatus !== 'APPROVED') {
      throw new AppError('Pay fixation must be APPROVED before applying', 400);
    }

    // Update employee pay
    await execute(
      `UPDATE employees
       SET basic_pay = @newBasicPay,
           current_pay_level_id = @newPayLevelId,
           current_pay_cell = @newPayCell,
           increment_date = @nextIncrementDate,
           updated_at = GETUTCDATE()
       WHERE employee_id = @employeeId`,
      {
        employeeId:      { type: sql.Int,           value: fixation.employeeId },
        newBasicPay:     { type: sql.Decimal(12,2), value: fixation.newBasicPay },
        newPayLevelId:   { type: sql.Int,           value: fixation.newPayLevelId },
        newPayCell:      { type: sql.Int,           value: fixation.newPayCell },
        nextIncrementDate:{ type: sql.Date,         value: fixation.nextIncrementDate },
      }
    );

    // Mark as applied
    await execute(
      `UPDATE employee_pay_fixations
       SET approval_status = 'APPLIED', final_approved_value = @newBasicPay,
           updated_at = GETUTCDATE()
       WHERE fixation_id = @fixationId`,
      {
        fixationId:  { type: sql.Int,           value: fixationId },
        newBasicPay: { type: sql.Decimal(12,2), value: fixation.newBasicPay },
      }
    );

    await auditService.log({
      userId: req.user!.userId,
      username: req.user!.username,
      action: 'APPLY',
      module: 'PAY_FIXATION',
      recordId: fixationId,
      employeeId: fixation.employeeId,
      newValue: {
        basicPay: fixation.newBasicPay,
        payLevelId: fixation.newPayLevelId,
        payCell: fixation.newPayCell,
        nextIncrementDate: fixation.nextIncrementDate,
      },
      description: `Pay fixation applied to employee ${fixation.employeeId}. New basic pay: ${fixation.newBasicPay}`,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Pay fixation applied to employee record' });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------
// GET /api/pay-fixation/employee/:employeeId
// Get all fixations for an employee
// -----------------------------------------------------------------------
router.get('/employee/:employeeId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = parseInt(req.params.employeeId);
    const fixations = await query(
      `SELECT f.fixation_id AS fixationId, f.fixation_type AS fixationType,
              f.effective_date AS effectiveDate,
              f.previous_basic_pay AS previousBasicPay, f.new_basic_pay AS newBasicPay,
              f.rule_name_used AS ruleNameUsed,
              f.calculation_steps AS calculationSteps,
              f.next_increment_date AS nextIncrementDate,
              f.approval_status AS approvalStatus,
              f.approved_at AS approvedAt, f.approval_remarks AS approvalRemarks,
              u.full_name AS approvedByName, f.calculated_at AS calculatedAt,
              pl_prev.level_number AS previousLevelNumber,
              pl_new.level_number AS newLevelNumber,
              f.previous_pay_cell AS previousPayCell, f.new_pay_cell AS newPayCell
       FROM employee_pay_fixations f
       LEFT JOIN users u ON u.user_id = f.approved_by
       LEFT JOIN pay_levels pl_prev ON pl_prev.pay_level_id = f.previous_pay_level_id
       LEFT JOIN pay_levels pl_new ON pl_new.pay_level_id = f.new_pay_level_id
       WHERE f.employee_id = @employeeId
       ORDER BY f.effective_date DESC, f.created_at DESC`,
      { employeeId: { type: sql.Int, value: employeeId } }
    );

    res.json({ success: true, data: fixations });
  } catch (err) {
    next(err);
  }
});

export default router;
