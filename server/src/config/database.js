// ============================================
// Database Configuration
// ============================================

import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    logger.error('FATAL: MONGODB_URI environment variable is not set.');
    logger.error('Go to Render dashboard → Environment → add MONGODB_URI');
    process.exit(1); // crash immediately with a clear message
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000, // 30s — Atlas needs time on cold start
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
    });

    logger.info(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    logger.error('Check: 1) MONGODB_URI is correct  2) Atlas IP whitelist allows 0.0.0.0/0');

    // Retry with backoff
    const retryDelay = 5000;
    logger.info(`Retrying MongoDB connection in ${retryDelay / 1000}s...`);
    setTimeout(connectDB, retryDelay);
  }
};

export default connectDB;
