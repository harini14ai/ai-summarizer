// ============================================
// Retry with Exponential Backoff
// ============================================
// Retries a function on 429/503/network errors
// with jittered exponential backoff.

import logger from './logger.js';

/**
 * @param {Function} fn          - async function to retry
 * @param {Object}   opts
 * @param {number}   opts.maxRetries  - max attempts (default 3)
 * @param {number}   opts.baseDelay  - initial delay ms (default 1000)
 * @param {number}   opts.maxDelay   - cap delay ms (default 16000)
 * @param {string}   opts.label      - label for logging
 */
export const retryWithBackoff = async (fn, opts = {}) => {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 16000, label = 'AI call' } = opts;

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const msg = err.message || '';

      // Only retry on rate-limit / server errors
      const isRetryable =
        msg.includes('429') ||
        msg.includes('503') ||
        msg.includes('rate') ||
        msg.includes('overloaded') ||
        msg.includes('ECONNRESET') ||
        msg.includes('ETIMEDOUT') ||
        msg.includes('socket hang up');

      if (!isRetryable || attempt === maxRetries) {
        throw err;
      }

      // Exponential backoff with ±20% jitter
      const expDelay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
      const jitter = expDelay * 0.2 * (Math.random() * 2 - 1);
      const delay = Math.round(expDelay + jitter);

      logger.warn(`${label} attempt ${attempt}/${maxRetries} failed (${msg.substring(0, 60)}). Retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastError;
};
