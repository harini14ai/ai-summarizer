// ============================================
// Summary Controller
// ============================================

import Summary from '../models/Summary.js';
import User from '../models/User.js';
import * as openaiService from '../services/openaiService.js';
import * as geminiService from '../services/geminiService.js';
import * as claudeService from '../services/claudeService.js';
import * as mockAIService from '../services/mockAIService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { handleAIError } from '../utils/aiErrorHandler.js';
import logger from '../utils/logger.js';

// Map AI services
const AI_SERVICES = {
  openai: openaiService,
  gemini: geminiService,
  claude: claudeService,
};

// Check if running in demo mode (no valid API keys)
const isDemoMode = () => process.env.DEMO_MODE === 'true';

// ============================================
// Create Summary from Text
// ============================================
export const createTextSummary = async (req, res, next) => {
  try {
    // Default to gemini — it has a free tier
    const {
      content,
      title,
      aiModel = 'gemini',
      summaryTypes = ['short', 'detailed', 'bulletPoints'],
    } = req.body;

    // Input validation
    if (!content || !title) {
      return sendError(res, 'Content and title are required', null, 400);
    }
    if (content.trim().length < 20) {
      return sendError(res, 'Content must be at least 20 characters', null, 400);
    }
    if (title.trim().length < 2) {
      return sendError(res, 'Title must be at least 2 characters', null, 400);
    }

    // Check API usage limit
    const user = await User.findById(req.userId);
    if (!user) return sendError(res, 'User not found', null, 404);

    if (user.apiUsageCount >= user.apiUsageLimit) {
      return sendError(
        res,
        `Monthly API limit of ${user.apiUsageLimit} reached. Upgrade your plan to continue.`,
        { used: user.apiUsageCount, limit: user.apiUsageLimit },
        429
      );
    }

    // Validate AI model
    const service = isDemoMode() ? mockAIService : AI_SERVICES[aiModel];
    if (!service) {
      return sendError(res, `Invalid AI model "${aiModel}". Choose: openai, gemini, or claude`, null, 400);
    }
    const effectiveModel = isDemoMode() ? 'demo' : aiModel;

    // Parse summaryTypes — frontend may send JSON string or array
    let types = summaryTypes;
    if (typeof summaryTypes === 'string') {
      try { types = JSON.parse(summaryTypes); } catch { types = ['short']; }
    }
    if (!Array.isArray(types) || types.length === 0) types = ['short'];

    logger.info(`Creating ${effectiveModel} summary for user ${req.userId} | types: ${types.join(',')}`);

    // Generate summaries
    const summaries = {};
    let totalTokens = 0;

    for (const type of types) {
      try {
        const result = await service.generateSummary(content, type, req.userId);
        summaries[type] = result.summary;
        totalTokens += result.tokens || 0;
      } catch (err) {
        const handled = handleAIError(err, aiModel, res);
        if (handled) return;
        throw err; // unhandled — bubble to global error handler
      }
    }

    // Analyze content (non-fatal — fallback on error)
    let analysis = { topics: [], keywords: [], sentiment: 'neutral' };
    try {
      analysis = await service.analyzeContent(content, req.userId);
    } catch (err) {
      logger.warn(`Analysis failed (non-fatal): ${err.message}`);
    }

    // Save to DB
    const summary = new Summary({
      userId: req.userId,
      title: title.trim(),
      originalContent: content,
      contentType: 'text',
      wordCount: content.split(/\s+/).filter(Boolean).length,
      summaries,
      aiModel: effectiveModel === 'demo' ? aiModel : effectiveModel,
      tokensUsed: { total: totalTokens },
      analysis,
    });

    await summary.save();

    // Increment usage counter
    user.apiUsageCount += 1;
    await user.save();

    logger.info(`Summary created: ${summary._id} | user: ${req.userId} | model: ${aiModel} | tokens: ${totalTokens}`);

    return sendSuccess(res, summary, 'Summary created successfully', 201);

  } catch (error) {
    logger.error(`Create summary error: ${error.message}`);
    next(error);
  }
};

// ============================================
// Get All Summaries (paginated)
// ============================================
export const getSummaries = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, sortBy = 'createdAt' } = req.query;
    const skip = (page - 1) * limit;
    let query = { userId: req.userId };

    if (search) {
      query.$text = { $search: search };
    }

    const summaries = await Summary
      .find(query)
      .sort({ [sortBy]: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Summary.countDocuments(query);

    return sendSuccess(res, {
      summaries,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error(`Get summaries error: ${error.message}`);
    next(error);
  }
};

// ============================================
// Get Single Summary
// ============================================
export const getSummaryById = async (req, res, next) => {
  try {
    const summary = await Summary.findById(req.params.id);
    if (!summary) return sendError(res, 'Summary not found', null, 404);
    if (summary.userId.toString() !== req.userId)
      return sendError(res, 'Unauthorized', null, 403);
    return sendSuccess(res, summary);
  } catch (error) {
    logger.error(`Get summary error: ${error.message}`);
    next(error);
  }
};

// ============================================
// Update Summary
// ============================================
export const updateSummary = async (req, res, next) => {
  try {
    const { title, tags, isBookmarked } = req.body;
    const summary = await Summary.findById(req.params.id);
    if (!summary) return sendError(res, 'Summary not found', null, 404);
    if (summary.userId.toString() !== req.userId)
      return sendError(res, 'Unauthorized', null, 403);

    if (title) summary.title = title;
    if (tags) summary.tags = tags;
    if (typeof isBookmarked === 'boolean') summary.isBookmarked = isBookmarked;

    await summary.save();
    return sendSuccess(res, summary, 'Summary updated');
  } catch (error) {
    logger.error(`Update summary error: ${error.message}`);
    next(error);
  }
};

// ============================================
// Delete Summary
// ============================================
export const deleteSummary = async (req, res, next) => {
  try {
    const summary = await Summary.findById(req.params.id);
    if (!summary) return sendError(res, 'Summary not found', null, 404);
    if (summary.userId.toString() !== req.userId)
      return sendError(res, 'Unauthorized', null, 403);

    await Summary.findByIdAndDelete(req.params.id);
    logger.info(`Summary deleted: ${req.params.id}`);
    return sendSuccess(res, {}, 'Summary deleted');
  } catch (error) {
    logger.error(`Delete summary error: ${error.message}`);
    next(error);
  }
};

// ============================================
// Search Summaries
// ============================================
export const searchSummaries = async (req, res, next) => {
  try {
    const { query, limit = 10 } = req.query;
    if (!query) return sendError(res, 'Search query is required', null, 400);

    const results = await Summary
      .find(
        { userId: req.userId, $text: { $search: query } },
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit))
      .lean();

    return sendSuccess(res, results);
  } catch (error) {
    logger.error(`Search summaries error: ${error.message}`);
    next(error);
  }
};

// ============================================
// Toggle Bookmark
// ============================================
export const toggleBookmark = async (req, res, next) => {
  try {
    const summary = await Summary.findById(req.params.id);
    if (!summary) return sendError(res, 'Summary not found', null, 404);
    if (summary.userId.toString() !== req.userId)
      return sendError(res, 'Unauthorized', null, 403);

    summary.isBookmarked = !summary.isBookmarked;
    await summary.save();
    return sendSuccess(res, summary, 'Bookmark toggled');
  } catch (error) {
    logger.error(`Toggle bookmark error: ${error.message}`);
    next(error);
  }
};
