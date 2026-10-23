import { execute, query, sql } from '../config/database';
import { AuditLog } from '../types';

export interface AuditLogInput {
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
  userAgent?: string;
}

export class AuditService {
  async log(input: AuditLogInput): Promise<void> {
    try {
      await execute(
        `INSERT INTO audit_logs
           (user_id, username, action, module, record_id, employee_id,
            old_value, new_value, description, ip_address, user_agent, created_at)
         VALUES
           (@userId, @username, @action, @module, @recordId, @employeeId,
            @oldValue, @newValue, @description, @ipAddress, @userAgent, GETUTCDATE())`,
        {
          userId:      { type: sql.Int,           value: input.userId || null },
          username:    { type: sql.NVarChar(100), value: input.username || null },
          action:      { type: sql.NVarChar(100), value: input.action },
          module:      { type: sql.NVarChar(100), value: input.module },
          recordId:    { type: sql.Int,           value: input.recordId || null },
          employeeId:  { type: sql.Int,           value: input.employeeId || null },
          oldValue:    { type: sql.NVarChar(sql.MAX), value: input.oldValue ? JSON.stringify(input.oldValue) : null },
          newValue:    { type: sql.NVarChar(sql.MAX), value: input.newValue ? JSON.stringify(input.newValue) : null },
          description: { type: sql.NVarChar(1000), value: input.description || null },
          ipAddress:   { type: sql.NVarChar(50),  value: input.ipAddress || null },
          userAgent:   { type: sql.NVarChar(500), value: input.userAgent || null },
        }
      );
    } catch (err) {
      // Never let audit log failure crash the main operation
      console.error('[AuditService] Failed to write audit log:', err);
    }
  }

  async getLogs(filters: {
    module?: string;
    userId?: number;
    employeeId?: number;
    action?: string;
    from?: Date;
    to?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ data: AuditLog[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const offset = (page - 1) * limit;

    let where = 'WHERE 1=1';
    const params: Record<string, { type: unknown; value: unknown }> = {
      limit:  { type: sql.Int, value: limit },
      offset: { type: sql.Int, value: offset },
    };

    if (filters.module) {
      where += ' AND module = @module';
      params.module = { type: sql.NVarChar(100), value: filters.module };
    }
    if (filters.userId) {
      where += ' AND user_id = @userId';
      params.userId = { type: sql.Int, value: filters.userId };
    }
    if (filters.employeeId) {
      where += ' AND employee_id = @employeeId';
      params.employeeId = { type: sql.Int, value: filters.employeeId };
    }
    if (filters.action) {
      where += ' AND action = @action';
      params.action = { type: sql.NVarChar(100), value: filters.action };
    }
    if (filters.from) {
      where += ' AND created_at >= @fromDate';
      params.fromDate = { type: sql.DateTime2, value: filters.from };
    }
    if (filters.to) {
      where += ' AND created_at <= @toDate';
      params.toDate = { type: sql.DateTime2, value: filters.to };
    }

    const [data, countResult] = await Promise.all([
      query<AuditLog[]>(
        `SELECT log_id AS logId, user_id AS userId, username, action, module,
                record_id AS recordId, employee_id AS employeeId,
                old_value AS oldValue, new_value AS newValue,
                description, ip_address AS ipAddress, created_at AS createdAt
         FROM audit_logs ${where}
         ORDER BY created_at DESC
         OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`,
        params as Record<string, { type: import('mssql').ISqlType | (() => import('mssql').ISqlType); value: unknown }>
      ),
      query<{ total: number }[]>(
        `SELECT COUNT(*) AS total FROM audit_logs ${where}`,
        params as Record<string, { type: import('mssql').ISqlType | (() => import('mssql').ISqlType); value: unknown }>
      ),
    ]);

    return { data, total: countResult[0]?.total || 0 };
  }
}

export const auditService = new AuditService();
