import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { query, execute, sql } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { auditService } from '../services/AuditService';
import { Employee } from '../types';

const router = Router();

// All employee routes require authentication
router.use(authenticate);

// -----------------------------------------------------------------------
// GET /api/employees - List employees with search, filter, pagination
// -----------------------------------------------------------------------
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      search, status, departmentId, designationId,
      commissionId, page = '1', limit = '20', sortBy = 'employee_name', sortOrder = 'ASC',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const offset = (pageNum - 1) * limitNum;

    let where = 'WHERE 1=1';
    const params: Record<string, { type: import('mssql').ISqlType | (() => import('mssql').ISqlType); value: unknown }> = {
      limit:  { type: sql.Int, value: limitNum },
      offset: { type: sql.Int, value: offset },
    };

    if (search) {
      where += ` AND (e.employee_name LIKE @search OR e.employee_code LIKE @search)`;
      params.search = { type: sql.NVarChar(200), value: `%${search}%` };
    }
    if (status) {
      where += ' AND e.status = @status';
      params.status = { type: sql.NVarChar(50), value: status };
    }
    if (departmentId) {
      where += ' AND e.department_id = @departmentId';
      params.departmentId = { type: sql.Int, value: parseInt(departmentId as string) };
    }
    if (designationId) {
      where += ' AND e.designation_id = @designationId';
      params.designationId = { type: sql.Int, value: parseInt(designationId as string) };
    }
    if (commissionId) {
      where += ' AND e.current_commission_id = @commissionId';
      params.commissionId = { type: sql.Int, value: parseInt(commissionId as string) };
    }

    const allowedSortCols = ['employee_name', 'employee_code', 'date_of_joining', 'basic_pay', 'status'];
    const safeSortBy = allowedSortCols.includes(sortBy as string) ? sortBy : 'employee_name';
    const safeSortOrder = sortOrder === 'DESC' ? 'DESC' : 'ASC';

    const [data, countResult] = await Promise.all([
      query<Employee[]>(
        `SELECT e.employee_id AS employeeId, e.employee_code AS employeeCode,
                e.employee_name AS employeeName, e.gender, e.date_of_joining AS dateOfJoining,
                e.date_of_retirement AS dateOfRetirement, e.status,
                d.dept_name AS departmentName, des.designation_name AS designationName,
                pc.commission_name AS commissionName, pl.level_number AS levelNumber,
                e.current_pay_cell AS currentPayCell, e.basic_pay AS basicPay,
                e.mobile_number AS mobileNumber, e.email, e.increment_date AS incrementDate,
                e.created_at AS createdAt
         FROM employees e
         LEFT JOIN departments d ON d.department_id = e.department_id
         LEFT JOIN designations des ON des.designation_id = e.designation_id
         LEFT JOIN pay_commissions pc ON pc.commission_id = e.current_commission_id
         LEFT JOIN pay_levels pl ON pl.pay_level_id = e.current_pay_level_id
         ${where}
         ORDER BY e.${safeSortBy} ${safeSortOrder}
         OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
        params
      ),
      query<{ total: number }[]>(
        `SELECT COUNT(*) AS total FROM employees e ${where}`,
        params
      ),
    ]);

    res.json({
      success: true,
      data: {
        employees: data,
        total: countResult[0]?.total || 0,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil((countResult[0]?.total || 0) / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------
// GET /api/employees/:id - Get single employee with full details
// -----------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employees = await query<Employee[]>(
      `SELECT e.*,
              d.dept_name AS departmentName,
              b.branch_name AS branchName,
              des.designation_name AS designationName,
              pc.commission_name AS commissionName,
              pl.level_number AS levelNumber
       FROM employees e
       LEFT JOIN departments d ON d.department_id = e.department_id
       LEFT JOIN branches b ON b.branch_id = e.branch_id
       LEFT JOIN designations des ON des.designation_id = e.designation_id
       LEFT JOIN pay_commissions pc ON pc.commission_id = e.current_commission_id
       LEFT JOIN pay_levels pl ON pl.pay_level_id = e.current_pay_level_id
       WHERE e.employee_id = @employeeId`,
      { employeeId: { type: sql.Int, value: parseInt(req.params.id) } }
    );

    if (!employees[0]) throw new AppError('Employee not found', 404);
    res.json({ success: true, data: employees[0] });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------
// POST /api/employees - Create new employee
// -----------------------------------------------------------------------
const createEmployeeSchema = z.object({
  employeeCode:               z.string().min(1).max(50),
  employeeName:               z.string().min(1).max(200),
  fathersHusbandsName:        z.string().max(200).optional(),
  gender:                     z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dateOfBirth:                z.string().optional(),
  dateOfJoining:              z.string(),
  dateOfRetirement:           z.string().optional(),
  dateOfInitialAppointment:   z.string().optional(),
  dateOfRegularAppointment:   z.string().optional(),
  departmentId:               z.number().int().optional(),
  branchId:                   z.number().int().optional(),
  designationId:              z.number().int().optional(),
  currentPost:                z.string().max(200).optional(),
  employeeType:               z.string().max(50).optional(),
  category:                   z.string().max(50).optional(),
  currentCommissionId:        z.number().int().optional(),
  currentPayLevelId:          z.number().int().optional(),
  currentPayCell:             z.number().int().optional(),
  basicPay:                   z.number().min(0).optional(),
  incrementDate:              z.string().optional(),
  panNumber:                  z.string().max(20).optional(),
  aadhaarNumber:              z.string().max(20).optional(),
  bankName:                   z.string().max(100).optional(),
  bankAccountNumber:          z.string().max(50).optional(),
  bankIfsc:                   z.string().max(20).optional(),
  mobileNumber:               z.string().max(15).optional(),
  email:                      z.string().email().optional(),
  addressLine1:               z.string().max(255).optional(),
  addressLine2:               z.string().max(255).optional(),
  city:                       z.string().max(100).optional(),
  state:                      z.string().max(100).optional(),
  pincode:                    z.string().max(10).optional(),
  status:                     z.enum(['ACTIVE', 'RETIRED', 'RESIGNED', 'DECEASED', 'ON_LEAVE']).default('ACTIVE'),
  remarks:                    z.string().max(1000).optional(),
}).refine(data => {
  if (data.dateOfJoining && data.dateOfRetirement) {
    return new Date(data.dateOfJoining) < new Date(data.dateOfRetirement);
  }
  return true;
}, { message: 'Date of joining must be before date of retirement', path: ['dateOfRetirement'] });

router.post('/', authorize('SUPER_ADMIN', 'ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = createEmployeeSchema.safeParse(req.body);
    if (!body.success) {
      throw new AppError(body.error.errors.map(e => e.message).join(', '), 400);
    }

    const d = body.data;
    const result = await query<{ employeeId: number }[]>(
      `INSERT INTO employees
         (employee_code, employee_name, fathers_husbands_name, gender,
          date_of_birth, date_of_joining, date_of_retirement,
          date_of_initial_appointment, date_of_regular_appointment,
          department_id, branch_id, designation_id, current_post,
          employee_type, category, current_commission_id, current_pay_level_id,
          current_pay_cell, basic_pay, increment_date, pan_number, aadhaar_number,
          bank_name, bank_account_number, bank_ifsc, mobile_number, email,
          address_line1, address_line2, city, state, pincode,
          status, remarks, created_by, updated_by, created_at, updated_at)
       OUTPUT INSERTED.employee_id AS employeeId
       VALUES
         (@employeeCode, @employeeName, @fathersHusbandsName, @gender,
          @dateOfBirth, @dateOfJoining, @dateOfRetirement,
          @dateOfInitialAppointment, @dateOfRegularAppointment,
          @departmentId, @branchId, @designationId, @currentPost,
          @employeeType, @category, @currentCommissionId, @currentPayLevelId,
          @currentPayCell, @basicPay, @incrementDate, @panNumber, @aadhaarNumber,
          @bankName, @bankAccountNumber, @bankIfsc, @mobileNumber, @email,
          @addressLine1, @addressLine2, @city, @state, @pincode,
          @status, @remarks, @createdBy, @createdBy, GETUTCDATE(), GETUTCDATE())`,
      {
        employeeCode:              { type: sql.NVarChar(50),  value: d.employeeCode },
        employeeName:              { type: sql.NVarChar(200), value: d.employeeName },
        fathersHusbandsName:       { type: sql.NVarChar(200), value: d.fathersHusbandsName || null },
        gender:                    { type: sql.NVarChar(10),  value: d.gender || null },
        dateOfBirth:               { type: sql.Date, value: d.dateOfBirth || null },
        dateOfJoining:             { type: sql.Date, value: d.dateOfJoining },
        dateOfRetirement:          { type: sql.Date, value: d.dateOfRetirement || null },
        dateOfInitialAppointment:  { type: sql.Date, value: d.dateOfInitialAppointment || null },
        dateOfRegularAppointment:  { type: sql.Date, value: d.dateOfRegularAppointment || null },
        departmentId:              { type: sql.Int,  value: d.departmentId || null },
        branchId:                  { type: sql.Int,  value: d.branchId || null },
        designationId:             { type: sql.Int,  value: d.designationId || null },
        currentPost:               { type: sql.NVarChar(200), value: d.currentPost || null },
        employeeType:              { type: sql.NVarChar(50),  value: d.employeeType || null },
        category:                  { type: sql.NVarChar(50),  value: d.category || null },
        currentCommissionId:       { type: sql.Int,  value: d.currentCommissionId || null },
        currentPayLevelId:         { type: sql.Int,  value: d.currentPayLevelId || null },
        currentPayCell:            { type: sql.Int,  value: d.currentPayCell || null },
        basicPay:                  { type: sql.Decimal(12,2), value: d.basicPay || null },
        incrementDate:             { type: sql.Date, value: d.incrementDate || null },
        panNumber:                 { type: sql.NVarChar(20),  value: d.panNumber || null },
        aadhaarNumber:             { type: sql.NVarChar(20),  value: d.aadhaarNumber || null },
        bankName:                  { type: sql.NVarChar(100), value: d.bankName || null },
        bankAccountNumber:         { type: sql.NVarChar(50),  value: d.bankAccountNumber || null },
        bankIfsc:                  { type: sql.NVarChar(20),  value: d.bankIfsc || null },
        mobileNumber:              { type: sql.NVarChar(15),  value: d.mobileNumber || null },
        email:                     { type: sql.NVarChar(255), value: d.email || null },
        addressLine1:              { type: sql.NVarChar(255), value: d.addressLine1 || null },
        addressLine2:              { type: sql.NVarChar(255), value: d.addressLine2 || null },
        city:                      { type: sql.NVarChar(100), value: d.city || null },
        state:                     { type: sql.NVarChar(100), value: d.state || null },
        pincode:                   { type: sql.NVarChar(10),  value: d.pincode || null },
        status:                    { type: sql.NVarChar(50),  value: d.status },
        remarks:                   { type: sql.NVarChar(1000),value: d.remarks || null },
        createdBy:                 { type: sql.Int,           value: req.user!.userId },
      }
    );

    const newEmployeeId = result[0].employeeId;

    await auditService.log({
      userId: req.user!.userId,
      username: req.user!.username,
      action: 'CREATE',
      module: 'EMPLOYEES',
      recordId: newEmployeeId,
      employeeId: newEmployeeId,
      newValue: { ...d },
      description: `Employee created: ${d.employeeName} (${d.employeeCode})`,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, data: { employeeId: newEmployeeId } });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------
// PUT /api/employees/:id - Update employee
// -----------------------------------------------------------------------
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = parseInt(req.params.id);
    const existing = await query<{ employeeId: number }[]>(
      `SELECT employee_id AS employeeId FROM employees WHERE employee_id = @employeeId`,
      { employeeId: { type: sql.Int, value: employeeId } }
    );
    if (!existing[0]) throw new AppError('Employee not found', 404);

    const body = createEmployeeSchema.partial().safeParse(req.body);
    if (!body.success) throw new AppError(body.error.errors[0].message, 400);

    const d = body.data;
    await execute(
      `UPDATE employees SET
         employee_name               = COALESCE(@employeeName, employee_name),
         fathers_husbands_name       = COALESCE(@fathersHusbandsName, fathers_husbands_name),
         gender                      = COALESCE(@gender, gender),
         date_of_birth               = COALESCE(@dateOfBirth, date_of_birth),
         date_of_retirement          = COALESCE(@dateOfRetirement, date_of_retirement),
         department_id               = COALESCE(@departmentId, department_id),
         branch_id                   = COALESCE(@branchId, branch_id),
         designation_id              = COALESCE(@designationId, designation_id),
         current_post                = COALESCE(@currentPost, current_post),
         employee_type               = COALESCE(@employeeType, employee_type),
         category                    = COALESCE(@category, category),
         mobile_number               = COALESCE(@mobileNumber, mobile_number),
         email                       = COALESCE(@email, email),
         address_line1               = COALESCE(@addressLine1, address_line1),
         address_line2               = COALESCE(@addressLine2, address_line2),
         city                        = COALESCE(@city, city),
         state                       = COALESCE(@state, state),
         pincode                     = COALESCE(@pincode, pincode),
         status                      = COALESCE(@status, status),
         remarks                     = COALESCE(@remarks, remarks),
         updated_by                  = @updatedBy,
         updated_at                  = GETUTCDATE()
       WHERE employee_id = @employeeId`,
      {
        employeeId:          { type: sql.Int,           value: employeeId },
        employeeName:        { type: sql.NVarChar(200), value: d.employeeName || null },
        fathersHusbandsName: { type: sql.NVarChar(200), value: d.fathersHusbandsName || null },
        gender:              { type: sql.NVarChar(10),  value: d.gender || null },
        dateOfBirth:         { type: sql.Date,          value: d.dateOfBirth || null },
        dateOfRetirement:    { type: sql.Date,          value: d.dateOfRetirement || null },
        departmentId:        { type: sql.Int,           value: d.departmentId || null },
        branchId:            { type: sql.Int,           value: d.branchId || null },
        designationId:       { type: sql.Int,           value: d.designationId || null },
        currentPost:         { type: sql.NVarChar(200), value: d.currentPost || null },
        employeeType:        { type: sql.NVarChar(50),  value: d.employeeType || null },
        category:            { type: sql.NVarChar(50),  value: d.category || null },
        mobileNumber:        { type: sql.NVarChar(15),  value: d.mobileNumber || null },
        email:               { type: sql.NVarChar(255), value: d.email || null },
        addressLine1:        { type: sql.NVarChar(255), value: d.addressLine1 || null },
        addressLine2:        { type: sql.NVarChar(255), value: d.addressLine2 || null },
        city:                { type: sql.NVarChar(100), value: d.city || null },
        state:               { type: sql.NVarChar(100), value: d.state || null },
        pincode:             { type: sql.NVarChar(10),  value: d.pincode || null },
        status:              { type: sql.NVarChar(50),  value: d.status || null },
        remarks:             { type: sql.NVarChar(1000),value: d.remarks || null },
        updatedBy:           { type: sql.Int,           value: req.user!.userId },
      }
    );

    await auditService.log({
      userId: req.user!.userId,
      username: req.user!.username,
      action: 'UPDATE',
      module: 'EMPLOYEES',
      recordId: employeeId,
      employeeId,
      newValue: d as Record<string, unknown>,
      description: `Employee updated (ID: ${employeeId})`,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Employee updated successfully' });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------
// GET /api/employees/:id/service-history
// -----------------------------------------------------------------------
router.get('/:id/service-history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = parseInt(req.params.id);
    const history = await query(
      `SELECT h.history_id AS historyId, h.employee_id AS employeeId,
              set_.type_name AS eventTypeName, set_.type_code AS eventTypeCode,
              set_.affects_pay AS affectsPay,
              h.effective_date AS effectiveDate,
              pd.designation_name AS previousDesignationName,
              nd.designation_name AS newDesignationName,
              ppl.level_number AS previousLevelNumber,
              npl.level_number AS newLevelNumber,
              h.previous_pay_cell AS previousPayCell,
              h.new_pay_cell AS newPayCell,
              h.previous_basic_pay AS previousBasicPay,
              h.new_basic_pay AS newBasicPay,
              h.order_number AS orderNumber,
              h.order_date AS orderDate,
              h.remarks, h.approval_status AS approvalStatus,
              u.full_name AS createdByName, h.created_at AS createdAt
       FROM employee_service_history h
       JOIN service_event_types set_ ON set_.event_type_id = h.event_type_id
       LEFT JOIN designations pd ON pd.designation_id = h.previous_designation_id
       LEFT JOIN designations nd ON nd.designation_id = h.new_designation_id
       LEFT JOIN pay_levels ppl ON ppl.pay_level_id = h.previous_pay_level_id
       LEFT JOIN pay_levels npl ON npl.pay_level_id = h.new_pay_level_id
       LEFT JOIN users u ON u.user_id = h.created_by
       WHERE h.employee_id = @employeeId AND h.is_reversed = 0
       ORDER BY h.effective_date DESC, h.created_at DESC`,
      { employeeId: { type: sql.Int, value: employeeId } }
    );

    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------
// GET /api/employees/dashboard/stats
// -----------------------------------------------------------------------
router.get('/dashboard/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await query<{
      totalEmployees: number;
      activeEmployees: number;
      retiredEmployees: number;
      dueForIncrement: number;
    }[]>(`
      SELECT
        COUNT(*) AS totalEmployees,
        SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) AS activeEmployees,
        SUM(CASE WHEN status = 'RETIRED' THEN 1 ELSE 0 END) AS retiredEmployees,
        SUM(CASE WHEN status = 'ACTIVE' AND increment_date <= DATEADD(day, 30, GETUTCDATE()) THEN 1 ELSE 0 END) AS dueForIncrement
      FROM employees
    `);

    const recentPromotions = await query<{ count: number }[]>(`
      SELECT COUNT(*) AS count FROM employee_promotions
      WHERE promotion_date >= DATEADD(month, -3, GETUTCDATE())
    `);

    const pendingFixation = await query<{ count: number }[]>(`
      SELECT COUNT(*) AS count FROM employee_pay_fixations
      WHERE approval_status IN ('DRAFT', 'CALCULATED', 'SUBMITTED')
    `);

    res.json({
      success: true,
      data: {
        ...stats[0],
        recentPromotions: recentPromotions[0]?.count || 0,
        pendingPayFixation: pendingFixation[0]?.count || 0,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
