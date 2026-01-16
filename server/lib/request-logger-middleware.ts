import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { createRequestLogger } from './logger';

/**
 * Request logging middleware using Pino
 * Bloque 2: Infrastructure - Request Context Tracking
 * 
 * Features:
 * - Generates unique requestId for each request
 * - Attaches companyId and userId from authenticated sessions
 * - Logs all API requests with timing
 * - Structured JSON logging for production
 */

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const requestId = randomUUID();
  
  // Attach requestId to request object for use in other middleware
  (req as any).requestId = requestId;
  
  // Extract user context from session (if authenticated)
  const userId = req.user?.id;
  const companyId = req.user?.companyId;
  
  // Create child logger with request context
  const reqLogger = createRequestLogger({
    requestId,
    userId,
    companyId,
    method: req.method,
    url: req.path,
  });
  
  // Attach logger to request for use in route handlers
  (req as any).log = reqLogger;
  
  // Log incoming request (only for API routes to reduce noise)
  if (req.path.startsWith('/api')) {
    reqLogger.info({
      type: 'request',
      method: req.method,
      url: req.path,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    }, 'Incoming API request');
  }
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    
    if (req.path.startsWith('/api')) {
      reqLogger[level]({
        type: 'response',
        method: req.method,
        url: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      }, `API request completed - ${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  
  next();
}
