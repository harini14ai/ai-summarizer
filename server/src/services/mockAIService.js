// ============================================
// Mock AI Service — Demo Mode
// ============================================
// Used when no valid API keys are available.
// Generates realistic-looking summaries locally
// so the full app flow can be tested end-to-end.

import logger from '../utils/logger.js';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ============================================
// Generate Summary (mock)
// ============================================
export const generateSummary = async (content, summaryType = 'short', userId) => {
  await delay(600); // simulate network latency

  const words = content.trim().split(/\s+/);
  const wordCount = words.length;
  const firstSentence = content.split(/[.!?]/)[0]?.trim() || content.substring(0, 100);

  let summary;

  switch (summaryType) {
    case 'short':
      summary = `[DEMO] ${firstSentence}. This content covers ${wordCount} words and discusses key concepts related to the provided text. A real AI model would generate a precise 2-3 sentence summary here.`;
      break;

    case 'detailed':
      summary = `[DEMO] **Overview**\n\n${firstSentence}.\n\n**Key Points**\n\nThe content spans ${wordCount} words and touches on several important themes. The author presents arguments supported by evidence and examples throughout the text.\n\n**Conclusion**\n\nThis is a demo summary. Connect a real OpenAI, Gemini, or Claude API key to get actual AI-generated summaries.`;
      break;

    case 'bulletPoints':
      summary = `- [DEMO] Main topic: ${firstSentence.substring(0, 60)}\n- Content length: ${wordCount} words\n- Key theme identified from opening paragraph\n- Multiple supporting arguments present\n- Conclusion drawn from available evidence\n- Add a real API key for actual AI bullet points`;
      break;

    case 'highlights':
      summary = `[DEMO] Key highlight: ${firstSentence}. Additional highlights would be extracted by a real AI model from the full ${wordCount}-word content.`;
      break;

    default:
      summary = `[DEMO] Summary of ${wordCount}-word content: ${firstSentence}.`;
  }

  logger.info(`Mock summary generated | type: ${summaryType} | words: ${wordCount}`);

  return {
    summary,
    tokens: Math.ceil(wordCount * 1.3), // rough estimate
    model: 'demo-mock',
  };
};

// ============================================
// Analyze Content (mock)
// ============================================
export const analyzeContent = async (content, userId) => {
  await delay(300);

  // Extract simple keywords from content
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'this', 'that', 'these', 'those', 'it', 'its', 'from', 'as', 'not', 'no', 'so', 'if', 'than', 'then', 'when', 'where', 'which', 'who', 'what', 'how', 'all', 'each', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over', 'under', 'again', 'further', 'once']);

  const words = content.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const freq = {};
  words.forEach((w) => {
    if (!stopWords.has(w)) freq[w] = (freq[w] || 0) + 1;
  });

  const keywords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w);

  // Simple sentiment heuristic
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'best', 'success', 'improve', 'benefit', 'positive', 'growth', 'innovation', 'advance', 'progress'];
  const negativeWords = ['bad', 'poor', 'terrible', 'worst', 'fail', 'problem', 'issue', 'risk', 'danger', 'negative', 'decline', 'loss', 'crisis', 'threat'];

  const lower = content.toLowerCase();
  const posCount = positiveWords.filter((w) => lower.includes(w)).length;
  const negCount = negativeWords.filter((w) => lower.includes(w)).length;
  const sentiment = posCount > negCount ? 'positive' : negCount > posCount ? 'negative' : 'neutral';

  // Extract topics from first few sentences
  const sentences = content.split(/[.!?]/).filter((s) => s.trim().length > 20).slice(0, 3);
  const topics = sentences.map((s) => s.trim().substring(0, 50) + '...').slice(0, 3);

  return { topics, keywords, sentiment };
};

// ============================================
// Stream Summary (mock — returns async iterator)
// ============================================
export const streamSummary = async (content, summaryType = 'short') => {
  const result = await generateSummary(content, summaryType);
  // Return a simple async iterator that yields the full text in chunks
  const chunks = result.summary.match(/.{1,20}/g) || [result.summary];
  return {
    [Symbol.asyncIterator]: async function* () {
      for (const chunk of chunks) {
        await delay(30);
        yield { text: () => chunk };
      }
    },
  };
};
