import rateLimit from 'express-rate-limit';
import logger from '../lib/logger';

/**
 * Rate Limiting Middleware (Bloque 4 - Tarea 19)
 * 
 * Prevents abuse of billing endpoints and protects against:
 * - Brute force attacks
 * - DDoS attempts
 * - Excessive API calls
 * - Subscription manipulation attempts
 */

/**
 * General rate limiter for billing endpoints
 * Allows 100 requests per 15 minutes per IP
 */
export const billingRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  handler: (req, res) => {
    const reqLogger = (req as any).log || logger;
    reqLogger.warn({
      ip: req.ip,
      path: req.path,
      method: req.method
    }, 'Rate limit exceeded for billing endpoint');
    
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

/**
 * Stricter rate limiter for subscription mutations
 * Allows only 20 requests per 15 minutes per IP
 * Used for: create subscription, change plan, cancel subscription
 */
export const subscriptionMutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: {
    error: 'Too many subscription changes attempted. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  handler: (req, res) => {
    const reqLogger = (req as any).log || logger;
    reqLogger.warn({
      ip: req.ip,
      path: req.path,
      method: req.method,
      userId: (req as any).user?.id
    }, 'Rate limit exceeded for subscription mutation');
    
    res.status(429).json({
      error: 'Too many subscription changes attempted. Please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

/**
 * Very strict rate limiter for payment operations
 * Allows only 10 requests per 15 minutes per IP
 * Used for: payment link creation, transaction processing
 */
export const paymentOperationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many payment operations attempted. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  handler: (req, res) => {
    const reqLogger = (req as any).log || logger;
    reqLogger.warn({
      ip: req.ip,
      path: req.path,
      method: req.method,
      userId: (req as any).user?.id
    }, 'Rate limit exceeded for payment operation');
    
    res.status(429).json({
      error: 'Too many payment operations attempted. Please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

/**
 * Authentication rate limiter - Login attempts
 * Allows 5 login attempts per 15 minutes per IP
 * Prevents brute force password attacks
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per window
  message: {
    error: 'Demasiados intentos de inicio de sesión. Por favor espere 15 minutos.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  skipFailedRequests: false,
  handler: (req, res) => {
    const reqLogger = (req as any).log || logger;
    reqLogger.warn({
      ip: req.ip,
      path: req.path,
      username: req.body?.username ? '[REDACTED]' : undefined
    }, 'Login rate limit exceeded - possible brute force attack');
    
    res.status(429).json({
      error: 'Demasiados intentos de inicio de sesión. Por favor espere 15 minutos.',
      retryAfter: '15 minutes'
    });
  }
});

/**
 * Password reset rate limiter
 * Allows 3 password reset requests per hour per IP
 * Prevents email bombing and abuse
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 reset requests per hour
  message: {
    error: 'Demasiadas solicitudes de restablecimiento de contraseña. Por favor espere 1 hora.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  handler: (req, res) => {
    const reqLogger = (req as any).log || logger;
    reqLogger.warn({
      ip: req.ip,
      path: req.path
    }, 'Password reset rate limit exceeded');
    
    res.status(429).json({
      error: 'Demasiadas solicitudes de restablecimiento de contraseña. Por favor espere 1 hora.',
      retryAfter: '1 hour'
    });
  }
});

/**
 * Registration rate limiter
 * Allows 3 registration attempts per hour per IP
 * Prevents mass account creation
 */
export const registrationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour
  message: {
    error: 'Demasiados intentos de registro. Por favor espere 1 hora.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  handler: (req, res) => {
    const reqLogger = (req as any).log || logger;
    reqLogger.warn({
      ip: req.ip,
      path: req.path
    }, 'Registration rate limit exceeded');
    
    res.status(429).json({
      error: 'Demasiados intentos de registro. Por favor espere 1 hora.',
      retryAfter: '1 hour'
    });
  }
});

/**
 * Webhook rate limiter
 * Allows 1000 requests per 15 minutes (webhooks come from Wompi servers)
 * More lenient because webhooks are server-to-server
 */
export const webhookRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit to 1000 requests per windowMs
  message: {
    error: 'Webhook rate limit exceeded.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful webhooks
  skipFailedRequests: false,
  handler: (req, res) => {
    const reqLogger = (req as any).log || logger;
    reqLogger.error({
      ip: req.ip,
      path: req.path,
      method: req.method
    }, 'Webhook rate limit exceeded - possible attack');
    
    res.status(429).json({
      error: 'Webhook rate limit exceeded.'
    });
  }
});

/**
 * Contact form rate limiter
 * Allows 5 contact requests per 15 minutes per IP
 * Prevents bot spam and abuse of contact/form endpoints
 */
export const contactFormRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 contact requests per window
  message: {
    error: 'Demasiadas solicitudes de contacto. Por favor espere 15 minutos.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  handler: (req, res) => {
    const reqLogger = (req as any).log || logger;
    reqLogger.warn({
      ip: req.ip,
      path: req.path,
      method: req.method
    }, 'Contact form rate limit exceeded - possible bot spam');
    
    res.status(429).json({
      error: 'Demasiadas solicitudes de contacto. Por favor espere 15 minutos.',
      retryAfter: '15 minutes'
    });
  }
});

/**
 * Public search rate limiter
 * Allows 30 search requests per 15 minutes per IP
 * Prevents scraping of public directories
 */
export const publicSearchRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 searches per window
  message: {
    error: 'Demasiadas búsquedas. Por favor espere 15 minutos.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  handler: (req, res) => {
    const reqLogger = (req as any).log || logger;
    reqLogger.warn({
      ip: req.ip,
      path: req.path,
      method: req.method
    }, 'Public search rate limit exceeded - possible scraping');
    
    res.status(429).json({
      error: 'Demasiadas búsquedas. Por favor espere 15 minutos.',
      retryAfter: '15 minutes'
    });
  }
});

/**
 * Upload rate limiter
 * Allows 30 file uploads per 15 minutes per IP
 * Prevents abuse of file upload endpoints
 */
export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 uploads per window
  message: {
    error: 'Demasiadas subidas de archivos. Por favor espere 15 minutos.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  handler: (req, res) => {
    const reqLogger = (req as any).log || logger;
    reqLogger.warn({
      ip: req.ip,
      path: req.path,
      method: req.method,
      userId: (req as any).user?.id
    }, 'Upload rate limit exceeded');
    
    res.status(429).json({
      error: 'Demasiadas subidas de archivos. Por favor espere 15 minutos.',
      retryAfter: '15 minutes'
    });
  }
});
