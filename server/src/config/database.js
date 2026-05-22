// ============================================
// Database Configuration
// ============================================
// Establishes MongoDB connection using Mongoose

import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    logger.info(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    
    // Retry connection after 5 seconds
    setTimeout(() => {
      logger.info('Retrying MongoDB connection...');
      connectDB();
    }, 5000);
  }
};

export default connectDB;
