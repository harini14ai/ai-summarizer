// ============================================
// Summary Model
// ============================================
// Defines summary document schema with AI results

import mongoose from 'mongoose';

const summarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  originalContent: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    enum: ['text', 'pdf', 'docx', 'txt', 'url'],
    required: true,
  },
  sourceUrl: {
    type: String,
    default: null,
  },
  wordCount: {
    type: Number,
    required: true,
  },
  summaries: {
    short: String,
    detailed: String,
    bulletPoints: [String],
    keyHighlights: [String],
  },
  aiModel: {
    type: String,
    enum: ['openai', 'gemini', 'claude'],
    required: true,
  },
  tokensUsed: {
    input: Number,
    output: Number,
    total: Number,
  },
  analysis: {
    topics: [String],
    keywords: [String],
    sentiment: String, // positive, negative, neutral
    language: String,
  },
  isBookmarked: {
    type: Boolean,
    default: false,
  },
  tags: [String],
  exportFormats: {
    pdf: {
      generated: Boolean,
      url: String,
    },
    txt: {
      generated: Boolean,
      url: String,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Add text index for search functionality
summarySchema.index({ title: 'text', originalContent: 'text', tags: 'text' });
summarySchema.index({ userId: 1, createdAt: -1 });

const Summary = mongoose.model('Summary', summarySchema);

export default Summary;
