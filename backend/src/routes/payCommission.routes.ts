import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { execute, query, sql } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { payCommissionService } from '../services/PayCommissionService';
import { auditService } from '../services/AuditService';

const router = Router();
router.use(authenticate);

// GET /api/pay-commissions
router.get('/', async (_req, res: Response, next: NextFunction) => {
  try {
    const commissions = await payCommissionService.getAllCommissions();
    res.json({ success: true, data: commissions });
  } catch (err) { next(err); }
});

// GET /api/pay-commissions/active
router.get('/active', async (_req, res: Response, next: NextFunction) => {
  try {
    const commission = await payCommissionService.getActiveCommission();
    res.json({ success: true, data: commission });
  } catch (err) { next(err); }
});

// GET /api/pay-commissions/:id
router.get('/:id', async (req, res: Response, next: NextFunction) => {
  try {
    const commission = await payCommissionService.getCommissionById(parseInt(req.params.id));
    res.json({ success: true, data: commission });
  } catch (err) { next(err); }
});

// GET /api/pay-commissions/:id/levels
router.get('/:id/levels', async (req, res: Response, next: NextFunction) => {
  try {
    const levels = await payCommissionService.getPayLevels(parseInt(req.params.id));
    res.json({ success: true, data: levels });
  } catch (err) { next(err); }
});

// GET /api/pay-commissions/:id/rules
router.get('/:id/rules', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ruleType } = req.query;
    const rules = ruleType
      ? await payCommissionService.getActiveRules(parseInt(req.params.id), ruleType as string)
      : await query(
          `SELECT pr.*, prt.type_code AS ruleTypeCode, prt.type_name AS ruleTypeName
           FROM pay_rules pr
           JOIN pay_rule_types prt ON prt.rule_type_id = pr.rule_type_id
           WHERE pr.commission_id = @commissionId AND pr.is_active = 1
           ORDER BY pr.priority`,
          { commissionId: { type: sql.Int, value: parseInt(req.params.id) } }
        );
    res.json({ success: true, data: rules });
  } catch (err) { next(err); }
});

// POST /api/pay-commissions
router.post('/', authorize('SUPER_ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      commissionCode: z.string().min(1).max(50),
      commissionName: z.string().min(1).max(200),
      effectiveFrom:  z.string(),
      effectiveTo:    z.string().optional(),
      status:         z.enum(['DRAFT','ACTIVE','INACTIVE','FUTURE']).default('DRAFT'),
      fitmentFactor:  z.number().optional(),
      description:    z.string().optional(),
    });

    const body = schema.safeParse(req.body);
    if (!body.success) throw new AppError(body.error.errors[0].message, 400);

    const commissionId = await payCommissionService.createCommission(
      { ...body.data, effectiveFrom: new Date(body.data.effectiveFrom),
        effectiveTo: body.data.effectiveTo ? new Date(body.data.effectiveTo) : undefined,
        isActive: true },
      req.user!.userId
    );

    await auditService.log({
      userId: req.user!.userId, username: req.user!.username,
      action: 'CREATE', module: 'PAY_COMMISSION', recordId: commissionId,
      newValue: body.data as Record<string, unknown>,
      description: `Pay commission created: ${body.data.commissionName}`,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, data: { commissionId } });
  } catch (err) { next(err); }
});

// PUT /api/pay-commissions/:id
router.put('/:id', authorize('SUPER_ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await payCommissionService.updateCommission(parseInt(req.params.id), req.body);
    await auditService.log({
      userId: req.user!.userId, username: req.user!.username,
      action: 'UPDATE', module: 'PAY_COMMISSION', recordId: parseInt(req.params.id),
      newValue: req.body as Record<string, unknown>,
      ipAddress: req.ip,
    });
    res.json({ success: true, message: 'Pay commission updated' });
  } catch (err) { next(err); }
});

// POST /api/pay-commissions/:id/levels
router.post('/:id/levels', authorize('SUPER_ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      levelNumber: z.string().min(1).max(10),
      levelName:   z.string().optional(),
      gradePay:    z.number().optional(),
      description: z.string().optional(),
    });
    const body = schema.safeParse(req.body);
    if (!body.success) throw new AppError(body.error.errors[0].message, 400);
    const d = body.data;
    const commissionId = parseInt(req.params.id);

    const result = await query<{ payLevelId: number }[]>(
      `INSERT INTO pay_levels (commission_id, level_number, level_name, grade_pay, description)
       OUTPUT INSERTED.pay_level_id AS payLevelId
       VALUES (@commissionId, @levelNumber, @levelName, @gradePay, @description)`,
      {
        commissionId: { type: sql.Int, value: commissionId },
        levelNumber:  { type: sql.NVarChar(10),  value: d.levelNumber },
        levelName:    { type: sql.NVarChar(100), value: d.levelName || null },
        gradePay:     { type: sql.Decimal(12,2), value: d.gradePay || null },
        description:  { type: sql.NVarChar(500), value: d.description || null },
      }
    );
    res.status(201).json({ success: true, data: { payLevelId: result[0].payLevelId } });
  } catch (err) { next(err); }
});

// POST /api/pay-commissions/:id/rules
router.post('/:id/rules', authorize('SUPER_ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      ruleTypeId:       z.number().int(),
      ruleCode:         z.string().min(1).max(100),
      ruleName:         z.string().min(1).max(200),
      ruleDescription:  z.string().optional(),
      ruleParameters:   z.record(z.unknown()).optional(),
      formulaExpression:z.string().optional(),
      effectiveFrom:    z.string(),
      effectiveTo:      z.string().optional(),
      priority:         z.number().int().default(1),
    });
    const body = schema.safeParse(req.body);
    if (!body.success) throw new AppError(body.error.errors[0].message, 400);
    const d = body.data;

    const result = await query<{ ruleId: number }[]>(
      `INSERT INTO pay_rules
         (commission_id, rule_type_id, rule_code, rule_name, rule_description,
          rule_parameters, formula_expression, effective_from, effective_to, priority, created_by)
       OUTPUT INSERTED.rule_id AS ruleId
       VALUES (@commissionId, @ruleTypeId, @ruleCode, @ruleName, @ruleDescription,
               @ruleParameters, @formulaExpression, @effectiveFrom, @effectiveTo, @priority, @createdBy)`,
      {
        commissionId:       { type: sql.Int,           value: parseInt(req.params.id) },
        ruleTypeId:         { type: sql.Int,           value: d.ruleTypeId },
        ruleCode:           { type: sql.NVarChar(100), value: d.ruleCode },
        ruleName:           { type: sql.NVarChar(200), value: d.ruleName },
        ruleDescription:    { type: sql.NVarChar(2000),value: d.ruleDescription || null },
        ruleParameters:     { type: sql.NVarChar(sql.MAX), value: d.ruleParameters ? JSON.stringify(d.ruleParameters) : null },
        formulaExpression:  { type: sql.NVarChar(2000),value: d.formulaExpression || null },
        effectiveFrom:      { type: sql.Date,          value: new Date(d.effectiveFrom) },
        effectiveTo:        { type: sql.Date,          value: d.effectiveTo ? new Date(d.effectiveTo) : null },
        priority:           { type: sql.Int,           value: d.priority },
        createdBy:          { type: sql.Int,           value: req.user!.userId },
      }
    );
    res.status(201).json({ success: true, data: { ruleId: result[0].ruleId } });
  } catch (err) { next(err); }
});

export default router;
