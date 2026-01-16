import pino from 'pino';

/**
 * Centralized Pino logger for SST Colombia
 * Bloque 2: Infrastructure - Structured Logging
 * 
 * Features:
 * - JSON structured logging for production
 * - Pretty printing for development
 * - Request context (requestId, companyId, userId)
 * - Log levels: trace, debug, info, warn, error, fatal
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  
  // Pretty print in development, JSON in production
  transport: isDevelopment ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
      messageFormat: '{levelLabel} - {msg}',
      errorLikeObjectKeys: ['err', 'error'],
    }
  } : undefined,

  // Base fields for all log entries
  base: {
    env: process.env.NODE_ENV || 'development',
    service: 'sst-colombia',
  },

  // Timestamp format
  timestamp: () => `,"time":"${new Date().toISOString()}"`,

  // Redact sensitive fields from logs (GDPR / Ley 1581 compliance)
  redact: {
    paths: [
      // Authentication & Session
      'password',
      'passwordHash',
      'token',
      'authorization',
      'cookie',
      'session',
      'sessionId',
      // Environment secrets
      'SENTRY_DSN',
      'DATABASE_URL',
      'SESSION_SECRET',
      'RESEND_API_KEY',
      'ENCRYPTION_MASTER_KEY',
      // Personal data (Ley 1581/2012 - Habeas Data)
      'identificationNumber',
      'cedula',
      'documento',
      'phone',
      'telefono',
      'address',
      'direccion',
      'email',
      'correo',
      'bankAccountNumber',
      'numeroCuenta',
      'emergencyContactPhone',
      'emergencyContactName',
      'legalRepresentativeId',
      'legalRepresentativePhone',
      'legalRepresentativeEmail',
      // Medical data (sensitive - Ley 1581/2012)
      'healthConditions',
      'condicionesSalud',
      'medicalHistory',
      'historiaClinica',
      'bloodType',
      'tipoSangre',
      'allergies',
      'alergias',
      'medications',
      'medicamentos',
      'disabilities',
      'discapacidades',
      'medicalCondition',
      'medicalTest',
      'diagnosis',
      'diagnostico',
      'eps',
      'arl',
      'afp',
      // Nested paths for objects
      '*.password',
      '*.identificationNumber',
      '*.cedula',
      '*.documento',
      '*.healthConditions',
      '*.medicalHistory',
      '*.phone',
      '*.telefono',
      '*.address',
      '*.direccion',
      '*.email',
      '*.correo',
      'worker.identificationNumber',
      'worker.healthConditions',
      'worker.phone',
      'worker.address',
      'worker.email',
      'data.password',
      'data.identificationNumber',
      'data.email',
      'body.password',
      'body.identificationNumber',
      'body.email',
      'req.body.password',
      'req.body.email',
      'req.body.identificationNumber'
    ],
    censor: '[REDACTED]'
  },

  // Serialize errors properly
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  }
});

/**
 * Create a child logger with request context
 * Use this in middleware to attach requestId, companyId, userId to all logs
 */
export function createRequestLogger(context: {
  requestId?: string;
  companyId?: string;
  userId?: string;
  method?: string;
  url?: string;
}) {
  return logger.child(context);
}

/**
 * Log levels available:
 * - logger.trace() - Very detailed debugging
 * - logger.debug() - Debugging information
 * - logger.info() - Informational messages
 * - logger.warn() - Warning messages
 * - logger.error() - Error messages
 * - logger.fatal() - Fatal errors (application crash)
 */

export default logger;
