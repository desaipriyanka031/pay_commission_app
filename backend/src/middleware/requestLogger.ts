import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, _res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, url, ip } = req;

  _res.on('finish', () => {
    const duration = Date.now() - start;
    const status = _res.statusCode;
    const user = req.user?.username || 'anonymous';
    console.log(
      `[${new Date().toISOString()}] ${method} ${url} ${status} ${duration}ms - ${ip} - ${user}`
    );
  });

  next();
}
