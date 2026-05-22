// ============================================
// Admin Routes
// ============================================

import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Analytics and dashboard
router.get('/analytics/dashboard', adminController.getDashboardAnalytics);
router.get('/analytics/api-usage', adminController.getAPIUsageStats);
router.get('/analytics/summaries', adminController.getSummaryStats);

// User management
router.get('/users', adminController.getUsersData);
router.put('/users/:userId/subscription', adminController.updateUserSubscription);
router.put('/users/:userId/deactivate', adminController.deactivateUser);

export default router;
