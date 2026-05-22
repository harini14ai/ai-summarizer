// ============================================
// Authentication Middleware
// ============================================
// Protects routes by verifying JWT tokens

import { verifyToken } from '../utils/tokenUtils.js';
import { sendError } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';
import User from '../models/User.js';

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return sendError(res, 'No authentication token provided', null, 401);
    }

    // Verify token
    const decoded = verifyToken(token);
    req.userId = decoded.userId;

    // Check if user exists
    const user = await User.findById(req.userId);
    if (!user) {
      return sendError(res, 'User not found', null, 401);
    }

    if (!user.isActive) {
      return sendError(res, 'User account is inactive', null, 401);
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return sendError(res, 'Invalid or expired token', null, 401);
  }
};

// ============================================
// Admin Middleware
// ============================================
// Verifies that user has admin privileges

const adminMiddleware = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return sendError(res, 'Access denied. Admin privileges required', null, 403);
  }
  next();
};

export { authMiddleware, adminMiddleware };
