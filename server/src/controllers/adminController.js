// ============================================
// Admin Controller
// ============================================
// Handles admin dashboard and analytics

import User from '../models/User.js';
import Summary from '../models/Summary.js';
import APIUsage from '../models/APIUsage.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

// ============================================
// Get Dashboard Analytics
// ============================================
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    // Total stats
    const totalUsers = await User.countDocuments();
    const totalSummaries = await Summary.countDocuments();
    const totalAPIUsage = await APIUsage.countDocuments();

    // Active users (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({ updatedAt: { $gte: sevenDaysAgo } });

    // Summaries created (last 7 days)
    const recentSummaries = await Summary.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // API usage stats
    const apiUsageByProvider = await APIUsage.aggregate([
      { $group: { _id: '$apiProvider', count: { $sum: 1 }, totalTokens: { $sum: '$tokensUsed.total' } } }
    ]);

    // Subscription breakdown
    const subscriptionBreakdown = await User.aggregate([
      { $group: { _id: '$subscriptionPlan', count: { $sum: 1 } } }
    ]);

    return sendSuccess(res, {
      totalUsers,
      totalSummaries,
      totalAPIUsage,
      activeUsers,
      recentSummaries,
      apiUsageByProvider,
      subscriptionBreakdown,
    });

  } catch (error) {
    logger.error(`Dashboard analytics error: ${error.message}`);
    next(error);
  }
};

// ============================================
// Get API Usage Statistics
// ============================================
export const getAPIUsageStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Total API calls
    const totalCalls = await APIUsage.countDocuments(query);

    // Successful vs failed
    const callStatus = await APIUsage.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // API usage by provider
    const usageByProvider = await APIUsage.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$apiProvider',
          calls: { $sum: 1 },
          totalTokens: { $sum: '$tokensUsed.total' },
          avgResponseTime: { $avg: '$responseTime' },
        }
      }
    ]);

    // Daily usage trend
    const dailyTrend = await APIUsage.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          calls: { $sum: 1 },
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    return sendSuccess(res, {
      totalCalls,
      callStatus,
      usageByProvider,
      dailyTrend,
    });

  } catch (error) {
    logger.error(`API usage stats error: ${error.message}`);
    next(error);
  }
};

// ============================================
// Get User Management Data
// ============================================
export const getUsersData = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const skip = (page - 1) * limit;
    let query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User
      .find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    return sendSuccess(res, {
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      }
    });

  } catch (error) {
    logger.error(`Get users data error: ${error.message}`);
    next(error);
  }
};

// ============================================
// Update User Subscription
// ============================================
export const updateUserSubscription = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { subscriptionPlan, apiUsageLimit } = req.body;

    if (!subscriptionPlan || !['free', 'pro', 'enterprise'].includes(subscriptionPlan)) {
      return sendError(res, 'Invalid subscription plan', null, 400);
    }

    // Fetch current user first so we can fall back to existing apiUsageLimit
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return sendError(res, 'User not found', null, 404);
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        subscriptionPlan,
        apiUsageLimit: apiUsageLimit || existingUser.apiUsageLimit,
        apiUsageCount: 0, // Reset count on plan change
        apiUsageResetDate: new Date(),
      },
      { new: true }
    );

    logger.info(`User subscription updated: ${userId} to ${subscriptionPlan}`);

    return sendSuccess(res, user, 'Subscription updated successfully');

  } catch (error) {
    logger.error(`Update subscription error: ${error.message}`);
    next(error);
  }
};

// ============================================
// Deactivate User
// ============================================
export const deactivateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );

    logger.info(`User deactivated: ${userId}`);

    return sendSuccess(res, user, 'User deactivated successfully');

  } catch (error) {
    logger.error(`Deactivate user error: ${error.message}`);
    next(error);
  }
};

// ============================================
// Get Summary Statistics
// ============================================
export const getSummaryStats = async (req, res, next) => {
  try {
    const totalSummaries = await Summary.countDocuments();

    // Summaries by content type
    const byContentType = await Summary.aggregate([
      { $group: { _id: '$contentType', count: { $sum: 1 } } }
    ]);

    // Summaries by AI model
    const byAIModel = await Summary.aggregate([
      { $group: { _id: '$aiModel', count: { $sum: 1 } } }
    ]);

    // Average word count
    const stats = await Summary.aggregate([
      {
        $group: {
          _id: null,
          avgWordCount: { $avg: '$wordCount' },
          maxWordCount: { $max: '$wordCount' },
          minWordCount: { $min: '$wordCount' },
        }
      }
    ]);

    return sendSuccess(res, {
      totalSummaries,
      byContentType,
      byAIModel,
      statistics: stats[0] || {},
    });

  } catch (error) {
    logger.error(`Summary stats error: ${error.message}`);
    next(error);
  }
};
