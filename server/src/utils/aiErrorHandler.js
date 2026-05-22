// ============================================
// AI Error Handler Utility
// ============================================
// Converts raw AI SDK errors into clean HTTP responses

import { sendError } from './apiResponse.js';
import logger from './logger.js';

/**
 * Classify an AI provider error and send the appropriate HTTP response.
 * Returns true if the error was handled (caller should return), false otherwise.
 */
export const handleAIError = (error, provider, res) => {
  const msg = error.message || '';

  // OpenAI / Gemini / Claude quota exceeded
  if (msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('exceeded')) {
    logger.warn(`${provider} quota exceeded`);
    return sendError(
      res,
      `Your ${provider} API quota is exceeded. Add billing at the provider dashboard, or switch to a different AI model.`,
      { provider, code: 'QUOTA_EXCEEDED' },
      429
    );
  }

  // Invalid / missing API key
  if (
    msg.includes('401') ||
    msg.toLowerCase().includes('api key') ||
    msg.toLowerCase().includes('not configured') ||
    msg.toLowerCase().includes('authentication')
  ) {
    logger.warn(`${provider} API key invalid or missing`);
    return sendError(
      res,
      `${provider} API key is invalid or missing. Check your server/.env file.`,
      { provider, code: 'INVALID_API_KEY' },
      401
    );
  }

  // Model not found / no access
  if (msg.includes('404') || msg.toLowerCase().includes('does not exist') || msg.toLowerCase().includes('no access')) {
    logger.warn(`${provider} model not found: ${msg}`);
    return sendError(
      res,
      `The selected ${provider} model is not available on your account. Try a different model.`,
      { provider, code: 'MODEL_NOT_FOUND' },
      400
    );
  }

  // Rate limit (different from quota)
  if (msg.includes('rate') || msg.includes('too many')) {
    return sendError(
      res,
      `${provider} rate limit hit. Please wait a moment and try again.`,
      { provider, code: 'RATE_LIMIT' },
      429
    );
  }

  // Not handled — let caller deal with it
  return null;
};
