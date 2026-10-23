import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';

import { initializeDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// Routes
import authRoutes from './routes/auth.routes';
import employeeRoutes from './routes/employees.routes';
import departmentRoutes from './routes/departments.routes';
import designationRoutes from './routes/designations.routes';
import payCommissionRoutes from './routes/payCommission.routes';
import payMatrixRoutes from './routes/payMatrix.routes';
import payRulesRoutes from './routes/payRules.routes';
import payFixationRoutes from './routes/payFixation.routes';
import promotionRoutes from './routes/promotions.routes';
import incrementRoutes from './routes/increments.routes';
import selectionGradeRoutes from './routes/selectionGrade.routes';
import payRevisionRoutes from './routes/payRevision.routes';
import arrearsRoutes from './routes/arrears.routes';
import documentsRoutes from './routes/documents.routes';
import reportsRoutes from './routes/reports.routes';
import auditLogRoutes from './routes/auditLog.routes';
import userRoutes from './routes/users.routes';
import settingsRoutes from './routes/settings.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Auth rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many login attempts, please try again later.',
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging
app.use(requestLogger);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/designations', designationRoutes);
app.use('/api/pay-commissions', payCommissionRoutes);
app.use('/api/pay-matrix', payMatrixRoutes);
app.use('/api/pay-rules', payRulesRoutes);
app.use('/api/pay-fixation', payFixationRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/increments', incrementRoutes);
app.use('/api/selection-grade', selectionGradeRoutes);
app.use('/api/pay-revision', payRevisionRoutes);
app.use('/api/arrears', arrearsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    await initializeDatabase();
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
