// ============================================
// API Usage Model
// ============================================
// Tracks API calls and token consumption

import mongoose from 'mongoose';

const apiUsageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  summaryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Summary',
  },
  apiProvider: {
    type: String,
    enum: ['openai', 'gemini', 'claude'],
    required: true,
  },
  endpoint: String,
  tokensUsed: {
    input: Number,
    output: Number,
    total: Number,
  },
  cost: {
    type: Number,
    default: 0,
  },
  responseTime: Number, // in milliseconds
  status: {
    type: String,
    enum: ['success', 'failed', 'partial'],
    default: 'success',
  },
  errorMessage: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, { timestamps: true });

// Add index for queries
apiUsageSchema.index({ userId: 1, createdAt: -1 });
apiUsageSchema.index({ apiProvider: 1 });

const APIUsage = mongoose.model('APIUsage', apiUsageSchema);

export default APIUsage;
