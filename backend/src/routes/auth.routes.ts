import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query, execute, sql } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { auditService } from '../services/AuditService';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = loginSchema.safeParse(req.body);
    if (!body.success) {
      throw new AppError(body.error.errors[0].message, 400);
    }

    const { username, password } = body.data;

    const users = await query<{
      userId: number; username: string; email: string;
      passwordHash: string; fullName: string;
      roleId: number; roleName: string; isActive: boolean;
    }[]>(
      `SELECT u.user_id AS userId, u.username, u.email, u.password_hash AS passwordHash,
              u.full_name AS fullName, u.role_id AS roleId, r.role_name AS roleName,
              u.is_active AS isActive
       FROM users u
       JOIN roles r ON r.role_id = u.role_id
       WHERE u.username = @username`,
      { username: { type: sql.NVarChar(100), value: username } }
    );

    const user = users[0];
    if (!user || !user.isActive) {
      throw new AppError('Invalid credentials', 401);
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    await execute(
      `UPDATE users SET last_login = GETUTCDATE() WHERE user_id = @userId`,
      { userId: { type: sql.Int, value: user.userId } }
    );

    const payload = {
      userId: user.userId,
      username: user.username,
      email: user.email,
      roleId: user.roleId,
      roleName: user.roleName,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    } as jwt.SignOptions);

    await auditService.log({
      userId: user.userId,
      username: user.username,
      action: 'LOGIN',
      module: 'AUTH',
      description: `User ${user.username} logged in`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          userId: user.userId,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          roleName: user.roleName,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await query<{
      userId: number; username: string; email: string;
      fullName: string; roleName: string; lastLogin: Date;
    }[]>(
      `SELECT u.user_id AS userId, u.username, u.email, u.full_name AS fullName,
              r.role_name AS roleName, u.last_login AS lastLogin
       FROM users u JOIN roles r ON r.role_id = u.role_id
       WHERE u.user_id = @userId`,
      { userId: { type: sql.Int, value: req.user!.userId } }
    );

    if (!users[0]) throw new AppError('User not found', 404);
    res.json({ success: true, data: users[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    });
    const body = schema.safeParse(req.body);
    if (!body.success) throw new AppError(body.error.errors[0].message, 400);

    const users = await query<{ passwordHash: string }[]>(
      `SELECT password_hash AS passwordHash FROM users WHERE user_id = @userId`,
      { userId: { type: sql.Int, value: req.user!.userId } }
    );

    const valid = await bcrypt.compare(body.data.currentPassword, users[0]?.passwordHash || '');
    if (!valid) throw new AppError('Current password is incorrect', 400);

    const newHash = await bcrypt.hash(body.data.newPassword, 12);
    await execute(
      `UPDATE users SET password_hash = @hash, updated_at = GETUTCDATE() WHERE user_id = @userId`,
      {
        hash:   { type: sql.NVarChar(500), value: newHash },
        userId: { type: sql.Int,           value: req.user!.userId },
      }
    );

    await auditService.log({
      userId: req.user!.userId,
      username: req.user!.username,
      action: 'CHANGE_PASSWORD',
      module: 'AUTH',
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
