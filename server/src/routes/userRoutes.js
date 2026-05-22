// ============================================
// User Routes
// ============================================

import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Summary from '../models/Summary.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

const router = express.Router();
router.use(authMiddleware);

// GET /api/users/me/stats — personal usage stats
router.get('/me/stats', async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return sendError(res, 'User not found', null, 404);

    const totalSummaries = await Summary.countDocuments({ userId: req.userId });
    const bookmarked     = await Summary.countDocuments({ userId: req.userId, isBookmarked: true });

    const modelBreakdown = await Summary.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: '$aiModel', count: { $sum: 1 } } },
    ]);

    return sendSuccess(res, {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        subscriptionPlan: user.subscriptionPlan,
        apiUsageCount: user.apiUsageCount,
        apiUsageLimit: user.apiUsageLimit,
      },
      stats: { totalSummaries, bookmarked, modelBreakdown },
    });
  } catch (err) {
    logger.error(`User stats error: ${err.message}`);
    next(err);
  }
});

export default router;
