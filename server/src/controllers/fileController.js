// ============================================
// File Controller
// ============================================

import Summary from '../models/Summary.js';
import User from '../models/User.js';
import * as fileParsingService from '../services/fileParsingService.js';
import * as urlService from '../services/urlService.js';
import * as openaiService from '../services/openaiService.js';
import * as geminiService from '../services/geminiService.js';
import * as claudeService from '../services/claudeService.js';
import * as mockAIService from '../services/mockAIService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { handleAIError } from '../utils/aiErrorHandler.js';
import { validateFile } from '../utils/fileValidator.js';
import logger from '../utils/logger.js';
import fs from 'fs/promises';
import path from 'path';

const AI_SERVICES = { openai: openaiService, gemini: geminiService, claude: claudeService };
const isDemoMode = () => process.env.DEMO_MODE === 'true';
const getService = (aiModel) => isDemoMode() ? mockAIService : (AI_SERVICES[aiModel] || null);

// ============================================
// Upload and Process File
// ============================================
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, 'No file provided', null, 400);

    validateFile(req.file);

    // Default to gemini
    let { aiModel = 'gemini', summaryTypes = ['short', 'detailed'] } = req.body;
    if (typeof summaryTypes === 'string') {
      try { summaryTypes = JSON.parse(summaryTypes); } catch { summaryTypes = ['short']; }
    }

    const user = await User.findById(req.userId);
    if (user.apiUsageCount >= user.apiUsageLimit) {
      await fs.unlink(req.file.path).catch(() => {});
      return sendError(res, 'API usage limit exceeded', null, 429);
    }

    const fileExtension = path.extname(req.file.originalname).slice(1).toLowerCase();

    let content;
    try {
      content = await fileParsingService.parseFile(req.file.path, fileExtension);
    } catch (error) {
      await fs.unlink(req.file.path).catch(() => {});
      return sendError(res, `Failed to parse file: ${error.message}`, null, 400);
    }

    if (!content || content.trim().length < 20) {
      await fs.unlink(req.file.path).catch(() => {});
      return sendError(res, 'File content is too short to summarize', null, 400);
    }

    const service = getService(aiModel);
    if (!service) {
      await fs.unlink(req.file.path).catch(() => {});
      return sendError(res, 'Invalid AI model', null, 400);
    }

    const summaries = {};
    let totalTokens = 0;

    for (const type of summaryTypes) {
      try {
        const result = await service.generateSummary(content, type, req.userId);
        summaries[type] = result.summary;
        totalTokens += result.tokens || 0;
      } catch (err) {
        await fs.unlink(req.file.path).catch(() => {});
        const handled = handleAIError(err, aiModel, res);
        if (handled) return;
        throw err;
      }
    }

    let analysis = { topics: [], keywords: [], sentiment: 'neutral' };
    try {
      analysis = await service.analyzeContent(content, req.userId);
    } catch (err) {
      logger.warn(`File analysis failed (non-fatal): ${err.message}`);
    }

    const summary = new Summary({
      userId: req.userId,
      title: req.body.title || req.file.originalname,
      originalContent: content,
      contentType: fileExtension,
      wordCount: content.split(/\s+/).filter(Boolean).length,
      summaries,
      aiModel,
      tokensUsed: { total: totalTokens },
      analysis,
    });

    await summary.save();
    user.apiUsageCount += 1;
    await user.save();
    await fs.unlink(req.file.path).catch(() => {});

    logger.info(`File processed: ${req.file.originalname} | user: ${req.userId}`);
    return sendSuccess(res, summary, 'File processed successfully', 201);

  } catch (error) {
    logger.error(`Upload file error: ${error.message}`);
    if (req.file) fs.unlink(req.file.path).catch(() => {});
    next(error);
  }
};

// ============================================
// Process URL Content
// ============================================
export const processURL = async (req, res, next) => {
  try {
    const { url, title, aiModel = 'gemini', summaryTypes = ['short', 'detailed'] } = req.body;

    if (!url) return sendError(res, 'URL is required', null, 400);

    // Basic URL validation
    try { new URL(url); } catch {
      return sendError(res, 'Invalid URL format', null, 400);
    }

    const user = await User.findById(req.userId);
    if (user.apiUsageCount >= user.apiUsageLimit)
      return sendError(res, 'API usage limit exceeded', null, 429);

    let content, metadata;
    try {
      [content, metadata] = await Promise.all([
        urlService.extractFromURL(url),
        urlService.extractMetadataFromURL(url),
      ]);
    } catch (error) {
      return sendError(res, `Failed to fetch URL: ${error.message}`, null, 400);
    }

    if (!content || content.trim().length < 20)
      return sendError(res, 'URL content is too short or could not be extracted', null, 400);

    const service = getService(aiModel);
    if (!service) return sendError(res, 'Invalid AI model', null, 400);

    let types = summaryTypes;
    if (typeof summaryTypes === 'string') {
      try { types = JSON.parse(summaryTypes); } catch { types = ['short']; }
    }

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
        throw err;
      }
    }

    let analysis = { topics: [], keywords: [], sentiment: 'neutral' };
    try {
      analysis = await service.analyzeContent(content, req.userId);
    } catch (err) {
      logger.warn(`URL analysis failed (non-fatal): ${err.message}`);
    }

    const summary = new Summary({
      userId: req.userId,
      title: title || metadata.title || 'URL Summary',
      originalContent: content,
      contentType: 'url',
      sourceUrl: url,
      wordCount: content.split(/\s+/).filter(Boolean).length,
      summaries,
      aiModel,
      tokensUsed: { total: totalTokens },
      analysis,
    });

    await summary.save();
    user.apiUsageCount += 1;
    await user.save();

    logger.info(`URL processed: ${url} | user: ${req.userId}`);
    return sendSuccess(res, summary, 'URL summarized successfully', 201);

  } catch (error) {
    logger.error(`Process URL error: ${error.message}`);
    next(error);
  }
};
