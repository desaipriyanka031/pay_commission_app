import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { execute, query, sql } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import ExcelJS from 'exceljs';
import { payCommissionService } from '../services/PayCommissionService';

const router = Router();
router.use(authenticate);

// GET /api/pay-matrix?commissionId=&levelId=
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { commissionId, levelId } = req.query;
    let where = 'WHERE pm.is_active = 1';
    const params: Record<string, { type: import('mssql').ISqlType | (() => import('mssql').ISqlType); value: unknown }> = {};

    if (commissionId) {
      where += ' AND pm.commission_id = @commissionId';
      params.commissionId = { type: sql.Int, value: parseInt(commissionId as string) };
    }
    if (levelId) {
      where += ' AND pm.pay_level_id = @levelId';
      params.levelId = { type: sql.Int, value: parseInt(levelId as string) };
    }

    const data = await query(
      `SELECT pm.matrix_id AS matrixId, pm.commission_id AS commissionId,
              pm.pay_level_id AS payLevelId, pl.level_number AS levelNumber,
              pm.cell_number AS cellNumber, pm.basic_pay AS basicPay,
              pm.effective_from AS effectiveFrom, pm.effective_to AS effectiveTo
       FROM pay_matrix pm
       JOIN pay_levels pl ON pl.pay_level_id = pm.pay_level_id
       ${where}
       ORDER BY CAST(pl.level_number AS INT) ASC, pm.cell_number ASC`,
      params
    );

    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/pay-matrix
router.post('/', authorize('SUPER_ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      payLevelId:    z.number().int(),
      commissionId:  z.number().int(),
      cellNumber:    z.number().int().min(1),
      basicPay:      z.number().min(0),
      effectiveFrom: z.string(),
      effectiveTo:   z.string().optional(),
    });

    const body = schema.safeParse(req.body);
    if (!body.success) throw new AppError(body.error.errors[0].message, 400);
    const d = body.data;

    const result = await query<{ matrixId: number }[]>(
      `INSERT INTO pay_matrix
         (commission_id, pay_level_id, cell_number, basic_pay, effective_from, effective_to, created_by)
       OUTPUT INSERTED.matrix_id AS matrixId
       VALUES (@commissionId, @payLevelId, @cellNumber, @basicPay, @effectiveFrom, @effectiveTo, @createdBy)`,
      {
        commissionId:  { type: sql.Int,           value: d.commissionId },
        payLevelId:    { type: sql.Int,           value: d.payLevelId },
        cellNumber:    { type: sql.Int,           value: d.cellNumber },
        basicPay:      { type: sql.Decimal(12,2), value: d.basicPay },
        effectiveFrom: { type: sql.Date,          value: new Date(d.effectiveFrom) },
        effectiveTo:   { type: sql.Date,          value: d.effectiveTo ? new Date(d.effectiveTo) : null },
        createdBy:     { type: sql.Int,           value: req.user!.userId },
      }
    );

    res.status(201).json({ success: true, data: { matrixId: result[0].matrixId } });
  } catch (err) { next(err); }
});

// POST /api/pay-matrix/bulk - Bulk insert from Excel data array
router.post('/bulk', authorize('SUPER_ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      commissionId: z.number().int(),
      effectiveFrom: z.string(),
      rows: z.array(z.object({
        levelNumber: z.string(),
        cellNumber: z.number().int(),
        basicPay: z.number(),
      })),
    });

    const body = schema.safeParse(req.body);
    if (!body.success) throw new AppError(body.error.errors[0].message, 400);
    const d = body.data;

    const levels = await payCommissionService.getPayLevels(d.commissionId);
    const levelMap = new Map(levels.map(l => [l.levelNumber, l.payLevelId]));

    let inserted = 0;
    const errors: string[] = [];

    for (const row of d.rows) {
      const payLevelId = levelMap.get(row.levelNumber);
      if (!payLevelId) {
        errors.push(`Level ${row.levelNumber} not found for commission ${d.commissionId}`);
        continue;
      }
      try {
        await execute(
          `IF NOT EXISTS (SELECT 1 FROM pay_matrix WHERE pay_level_id = @payLevelId AND cell_number = @cellNumber AND effective_from = @effectiveFrom)
           INSERT INTO pay_matrix (commission_id, pay_level_id, cell_number, basic_pay, effective_from, created_by)
           VALUES (@commissionId, @payLevelId, @cellNumber, @basicPay, @effectiveFrom, @createdBy)`,
          {
            commissionId:  { type: sql.Int,           value: d.commissionId },
            payLevelId:    { type: sql.Int,           value: payLevelId },
            cellNumber:    { type: sql.Int,           value: row.cellNumber },
            basicPay:      { type: sql.Decimal(12,2), value: row.basicPay },
            effectiveFrom: { type: sql.Date,          value: new Date(d.effectiveFrom) },
            createdBy:     { type: sql.Int,           value: req.user!.userId },
          }
        );
        inserted++;
      } catch (e) {
        errors.push(`Row ${row.levelNumber}/${row.cellNumber}: ${(e as Error).message}`);
      }
    }

    res.json({ success: true, data: { inserted, errors } });
  } catch (err) { next(err); }
});

// GET /api/pay-matrix/export - Export as Excel
router.get('/export', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { commissionId } = req.query;
    if (!commissionId) throw new AppError('commissionId required', 400);

    const data = await query<{ levelNumber: string; cellNumber: number; basicPay: number }[]>(
      `SELECT pl.level_number AS levelNumber, pm.cell_number AS cellNumber, pm.basic_pay AS basicPay
       FROM pay_matrix pm
       JOIN pay_levels pl ON pl.pay_level_id = pm.pay_level_id
       WHERE pm.commission_id = @commissionId AND pm.is_active = 1
       ORDER BY CAST(pl.level_number AS INT), pm.cell_number`,
      { commissionId: { type: sql.Int, value: parseInt(commissionId as string) } }
    );

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Pay Matrix');
    sheet.columns = [
      { header: 'Level', key: 'levelNumber', width: 12 },
      { header: 'Cell', key: 'cellNumber', width: 10 },
      { header: 'Basic Pay', key: 'basicPay', width: 15 },
    ];

    data.forEach(row => sheet.addRow(row));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=pay_matrix.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) { next(err); }
});

export default router;
