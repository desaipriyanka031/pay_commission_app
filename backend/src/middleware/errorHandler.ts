import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isDev = process.env.NODE_ENV === 'development';

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(isDev && { stack: err.stack }),
    });
    return;
  }

  // MSSQL constraint violations
  if ((err as NodeJS.ErrnoException).code === 'EREQUEST') {
    const mssqlErr = err as Error & { number?: number; message: string };
    if (mssqlErr.number === 2627 || mssqlErr.number === 2601) {
      res.status(409).json({ success: false, message: 'Duplicate entry: record already exists.' });
      return;
    }
  }

  console.error('[ERROR]', {
    method: req.method,
    url: req.url,
    error: err.message,
    stack: isDev ? err.stack : undefined,
  });

  res.status(500).json({
    success: false,
    message: isDev ? err.message : 'An internal server error occurred.',
    ...(isDev && { stack: err.stack }),
  });
}
