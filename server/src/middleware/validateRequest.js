// ============================================
// Validation Middleware
// ============================================
// Validates request inputs

import { validationResult } from 'express-validator';
import { sendError } from '../utils/apiResponse.js';

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', errors.array(), 400);
  }
  next();
};

export default validateRequest;
