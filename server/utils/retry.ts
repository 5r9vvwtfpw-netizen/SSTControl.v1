import logger from '../lib/logger';

/**
 * Retry Utility (Bloque 4 - Tarea 20)
 * 
 * Implements exponential backoff retry logic for API calls
 * Handles transient failures gracefully
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  retryableStatuses?: number[];
  shouldRetry?: (error: any) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  shouldRetry: () => true
};

/**
 * Executes an async function with exponential backoff retry logic
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
  context?: Record<string, any>
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;
  
  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on last attempt
      if (attempt >= opts.maxAttempts) {
        break;
      }
      
      // Check if error should be retried
      const shouldRetry = isRetryableError(error, opts);
      
      if (!shouldRetry) {
        logger.warn({ 
          ...context, 
          attempt, 
          error: error.message,
          statusCode: error.statusCode || error.status
        }, 'Non-retryable error - aborting retry');
        throw error; // Don't retry client errors (4xx)
      }
      
      // Calculate delay with exponential backoff
      const baseDelay = opts.initialDelayMs * Math.pow(opts.backoffMultiplier, attempt - 1);
      const delay = Math.min(baseDelay, opts.maxDelayMs);
      const jitter = Math.random() * 0.3 * delay; // Add 0-30% jitter
      const actualDelay = delay + jitter;
      
      logger.warn({
        ...context,
        attempt,
        maxAttempts: opts.maxAttempts,
        delayMs: Math.round(actualDelay),
        error: error.message,
        statusCode: error.statusCode || error.status
      }, `Retryable error - retrying in ${Math.round(actualDelay)}ms`);
      
      // Wait before retrying
      await sleep(actualDelay);
    }
  }
  
  // All attempts failed
  logger.error({
    ...context,
    maxAttempts: opts.maxAttempts,
    error: lastError.message
  }, 'All retry attempts failed');
  
  throw lastError;
}

/**
 * Determines if an error should be retried
 */
function isRetryableError(error: any, opts: Required<RetryOptions>): boolean {
  // Network errors (no response)
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
    return true;
  }
  
  // HTTP status codes
  const statusCode = error.statusCode || error.status;
  if (statusCode && opts.retryableStatuses.includes(statusCode)) {
    return true;
  }
  
  // Custom retry logic
  if (opts.shouldRetry && !opts.shouldRetry(error)) {
    return false;
  }
  
  // Don't retry 4xx client errors (except 408, 429 which are in retryableStatuses)
  if (statusCode && statusCode >= 400 && statusCode < 500) {
    return false;
  }
  
  // By default, retry unknown errors (could be network issues)
  return true;
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
