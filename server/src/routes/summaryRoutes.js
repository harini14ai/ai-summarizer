// ============================================
// Summary Routes
// ============================================

import express from 'express';
import * as summaryController from '../controllers/summaryController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All summary routes require authentication
router.use(authMiddleware);

// ── Static routes FIRST (before /:id wildcards) ──────────────────────
router.post('/text',          summaryController.createTextSummary);  // POST /api/summaries/text
router.get('/',               summaryController.getSummaries);        // GET  /api/summaries
router.get('/search/query',   summaryController.searchSummaries);     // GET  /api/summaries/search/query

// ── Dynamic :id routes AFTER static routes ───────────────────────────
router.get('/:id',            summaryController.getSummaryById);      // GET  /api/summaries/:id
router.put('/:id',            summaryController.updateSummary);       // PUT  /api/summaries/:id
router.delete('/:id',         summaryController.deleteSummary);       // DELETE /api/summaries/:id
router.patch('/:id/bookmark', summaryController.toggleBookmark);      // PATCH /api/summaries/:id/bookmark

export default router;
