// ============================================
// Main Server Entry Point
// ============================================

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { mkdirSync } from 'fs';

// Load .env FIRST — before any other imports that read process.env
dotenv.config();

import connectDB from './config/database.js';
import logger from './utils/logger.js';
import authRoutes from './routes/authRoutes.js';
import summaryRoutes from './routes/summaryRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import errorHandler from './middleware/errorHandler.js';

// Ensure uploads directory exists
try { mkdirSync('uploads', { recursive: true }); } catch {}

const app = express();
const PORT = process.env.PORT || 5000;
const IS_DEV = process.env.NODE_ENV !== 'production';

// ============================================
// Security
// ============================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      scriptSrc:  ["'self'"],
      imgSrc:     ["'self'", 'data:', 'https:'],
    },
  },
}));

// ============================================
// CORS
// ============================================
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors()); // pre-flight for all routes

// ============================================
// Rate Limiting — AI routes get a tighter limit
// ============================================
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again in 15 minutes.' },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,          // 1 minute window
  max: 10,                       // max 10 AI calls per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many AI requests. Please wait a moment and try again.' },
  skip: () => process.env.DEMO_MODE === 'true', // no limit in demo mode
});

app.use(globalLimiter);

// ============================================
// Body Parsing
// ============================================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============================================
// Compression
// ============================================
app.use(compression());

// ============================================
// Request Logger (dev only)
// ============================================
if (IS_DEV) {
  app.use((req, _res, next) => {
    logger.info(`→ ${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// Database
// ============================================
connectDB();

// ============================================
// Health & Test Routes (no auth required)
// ============================================
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the AI Content Summarizer API!',
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    mode: process.env.DEMO_MODE === 'true' ? 'demo' : 'live',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      test: '/api/test'
    }
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    mode: process.env.DEMO_MODE === 'true' ? 'demo' : 'live',
    version: '1.0.0',
  });
});

app.get('/api/test', (_req, res) => {
  res.json({
    success: true,
    message: 'Backend is connected and working!',
    routes: {
      auth:      ['POST /api/auth/signup', 'POST /api/auth/login', 'GET /api/auth/me', 'PUT /api/auth/profile', 'PUT /api/auth/change-password'],
      summaries: ['POST /api/summaries/text', 'GET /api/summaries', 'GET /api/summaries/:id', 'DELETE /api/summaries/:id', 'PATCH /api/summaries/:id/bookmark', 'GET /api/summaries/search/query'],
      files:     ['POST /api/files/upload', 'POST /api/files/url'],
      admin:     ['GET /api/admin/analytics/dashboard', 'GET /api/admin/analytics/api-usage', 'GET /api/admin/users'],
      aliases:   ['POST /api/summarize  →  /api/summaries/text'],
    },
  });
});

// ============================================
// API Routes
// ============================================
app.use('/api/auth',      authRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/summaries', summaryRoutes);
app.use('/api/files',     fileRoutes);
app.use('/api/admin',     adminRoutes);

// ── Convenience aliases so /api/summarize also works ──────────────────
app.use('/api/summarize', aiLimiter, summaryRoutes);
app.use('/api/auth/register', (req, res, next) => {
  // alias: /api/auth/register → /api/auth/signup
  req.url = '/signup';
  authRoutes(req, res, next);
});

// ============================================
// 404 — catch-all for unknown routes
// ============================================
app.use((req, res) => {
  logger.warn(`404 → ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    hint: 'Check GET /api/test for a full list of available routes.',
  });
});

// ============================================
// Global Error Handler
// ============================================
app.use(errorHandler);

// ============================================
// Start Server
// ============================================
app.listen(PORT, () => {
  logger.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  logger.info(` AI Summarizer API  —  port ${PORT}`);
  logger.info(` Mode: ${process.env.DEMO_MODE === 'true' ? 'DEMO (mock AI)' : 'LIVE (real AI)'}`);
  logger.info(` Env:  ${process.env.NODE_ENV || 'development'}`);
  logger.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  logger.info(` Routes:`);
  logger.info(`   GET  /api/health`);
  logger.info(`   GET  /api/test`);
  logger.info(`   POST /api/auth/signup`);
  logger.info(`   POST /api/auth/login`);
  logger.info(`   POST /api/auth/register  (alias)`);
  logger.info(`   GET  /api/auth/me`);
  logger.info(`   POST /api/summaries/text`);
  logger.info(`   POST /api/summarize      (alias)`);
  logger.info(`   GET  /api/summaries`);
  logger.info(`   POST /api/files/upload`);
  logger.info(`   POST /api/files/url`);
  logger.info(`   GET  /api/admin/analytics/dashboard`);
  logger.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received — shutting down gracefully');
  process.exit(0);
});
