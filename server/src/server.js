// ============================================
// Main Server Entry Point — Production Ready
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
// Validate required env vars on startup
// ============================================
const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  logger.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
  logger.error('Add them to server/.env and restart.');
  process.exit(1);
}

// ============================================
// Security — Helmet
// ============================================
app.use(helmet());

// ============================================
// CORS — supports multiple origins (comma-separated)
// ============================================
const parseOrigins = (val) =>
  (val || '').split(',').map((s) => s.trim()).filter(Boolean);

const allowedOrigins = [
  ...parseOrigins(process.env.CLIENT_URL),
  ...parseOrigins(process.env.FRONTEND_URL),
  ...(IS_DEV ? ['http://localhost:5173', 'http://127.0.0.1:5173'] : []),
];

logger.info(`CORS allowed origins: ${allowedOrigins.join(', ') || '(none set)'}`);

const corsOptions = {
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    logger.warn(`CORS blocked: ${origin}`);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // handle pre-flight for all routes

// ============================================
// Rate Limiting
// ============================================
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again in 15 minutes.' },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many AI requests. Please wait a moment.' },
  skip: () => process.env.DEMO_MODE === 'true',
});

app.use(globalLimiter);

// ============================================
// Body Parsing + Compression
// ============================================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(compression());

// ============================================
// Request Logger
// ============================================
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.originalUrl} — ${req.ip}`);
  next();
});

// ============================================
// Database
// ============================================
connectDB();

// ============================================
// Root — welcome response (fixes "Route not found: GET /")
// ============================================
app.get('/', (_req, res) => {
  res.json({
    success: true,
    name: 'AI Content Summarizer API',
    version: '1.0.0',
    status: 'running',
    mode: process.env.DEMO_MODE === 'true' ? 'demo' : 'live',
    docs: '/api/test',
    health: '/api/health',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// Health Check
// ============================================
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'running',
    mode: process.env.DEMO_MODE === 'true' ? 'demo' : 'live',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()) + 's',
  });
});

// ============================================
// Route Map (useful for debugging)
// ============================================
app.get('/api/test', (_req, res) => {
  res.json({
    success: true,
    message: 'Backend is connected and working!',
    routes: {
      public:    ['GET /', 'GET /api/health', 'GET /api/test'],
      auth:      ['POST /api/auth/signup', 'POST /api/auth/register (alias)', 'POST /api/auth/login', 'GET /api/auth/me', 'PUT /api/auth/profile', 'PUT /api/auth/change-password', 'POST /api/auth/logout'],
      summaries: ['POST /api/summaries/text', 'POST /api/summarize/text (alias)', 'GET /api/summaries', 'GET /api/summaries/:id', 'PUT /api/summaries/:id', 'DELETE /api/summaries/:id', 'PATCH /api/summaries/:id/bookmark', 'GET /api/summaries/search/query'],
      files:     ['POST /api/files/upload', 'POST /api/files/url'],
      users:     ['GET /api/users/me/stats'],
      admin:     ['GET /api/admin/analytics/dashboard', 'GET /api/admin/analytics/api-usage', 'GET /api/admin/analytics/summaries', 'GET /api/admin/users'],
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

// Aliases
app.use('/api/summarize', aiLimiter, summaryRoutes);
app.use('/api/auth/register', (req, res, next) => {
  req.url = '/signup';
  authRoutes(req, res, next);
});

// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
  logger.warn(`404 ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    hint: 'Visit GET /api/test for a full list of available routes.',
  });
});

// ============================================
// Global Error Handler
// ============================================
app.use(errorHandler);

// ============================================
// Start
// ============================================
app.listen(PORT, '0.0.0.0', () => {
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logger.info(` AI Summarizer API  —  port ${PORT}`);
  logger.info(` Mode : ${process.env.DEMO_MODE === 'true' ? 'DEMO' : 'LIVE'}`);
  logger.info(` Env  : ${process.env.NODE_ENV || 'development'}`);
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

process.on('SIGTERM', () => { logger.info('SIGTERM — shutting down'); process.exit(0); });
process.on('uncaughtException',  (e) => { logger.error(`Uncaught: ${e.message}`); process.exit(1); });
process.on('unhandledRejection', (e) => { logger.error(`Unhandled: ${e}`); });
