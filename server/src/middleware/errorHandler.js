// ============================================
// Global Error Handler Middleware
// ============================================

import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  const msg = err.message || 'Internal Server Error';

  // Log full details server-side
  logger.error({
    message: msg,
    path: req.path,
    method: req.method,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });

  // ── AI provider errors → meaningful HTTP codes ──────────────────────
  if (msg.includes('429') || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('exceeded')) {
    return res.status(429).json({
      success: false,
      message: 'AI API quota exceeded. Add billing to your AI provider account or switch models.',
      code: 'QUOTA_EXCEEDED',
    });
  }

  if (msg.includes('401') || msg.toLowerCase().includes('api key') || msg.toLowerCase().includes('not configured')) {
    return res.status(401).json({
      success: false,
      message: 'AI API key is invalid or missing. Check your server/.env file.',
      code: 'INVALID_API_KEY',
    });
  }

  if (msg.includes('404') && (msg.toLowerCase().includes('model') || msg.toLowerCase().includes('does not exist'))) {
    return res.status(400).json({
      success: false,
      message: 'The selected AI model is not available on your account. Try a different model.',
      code: 'MODEL_NOT_FOUND',
    });
  }

  // ── Mongoose validation errors ───────────────────────────────────────
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({ success: false, message: `${field} already exists` });
  }

  // ── JWT errors ───────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  // ── Generic fallback ─────────────────────────────────────────────────
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error' : msg,
    ...(process.env.NODE_ENV === 'development' && { detail: msg }),
  });
};

export default errorHandler;
