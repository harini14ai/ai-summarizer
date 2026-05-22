// ============================================
// Gemini AI Service — with retry + token optimization
// ============================================
import { GoogleGenerativeAI } from "@google/generative-ai";
import logger from "../utils/logger.js";
import APIUsage from "../models/APIUsage.js";
import { retryWithBackoff } from "../utils/retryWithBackoff.js";

let _genAI = null;
const getGenAI = () => {
  if (!_genAI) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key.startsWith("placeholder")) throw new Error("GEMINI_API_KEY not configured");
    _genAI = new GoogleGenerativeAI(key);
  }
  return _genAI;
};

// Gemini free tier: ~32k tokens context. Cap at 5000 words for safety.
const truncateContent = (content, maxWords = 5000) => {
  const words = content.trim().split(/\s+/);
  if (words.length <= maxWords) return content;
  logger.warn(`Gemini: truncating content from ${words.length} to ${maxWords} words`);
  return words.slice(0, maxWords).join(" ") + "\n\n[Content truncated]";
};

const parseJSONFromLLM = (text) => {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
  return JSON.parse(cleaned);
};

const PROMPTS = {
  short: "Provide a brief, concise summary (2-3 sentences):",
  detailed: "Provide a comprehensive detailed summary:",
  bulletPoints: "Create a bullet-point summary. Start each point with a dash (-):",
  highlights: "Extract key highlights:",
  topics: "Identify main topics:",
  keywords: "Extract important keywords:",
};

// Gemini model with fallback chain
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

const getModel = (genAI) => {
  const modelName = process.env.GEMINI_MODEL || GEMINI_MODELS[0];
  return genAI.getGenerativeModel({ model: modelName });
};

export const generateSummary = async (content, summaryType = "short", userId) => {
  const truncated = truncateContent(content);
  const prompt = PROMPTS[summaryType] || PROMPTS.short;
  const startTime = Date.now();

  const result = await retryWithBackoff(
    async () => {
      const model = getModel(getGenAI());
      return model.generateContent(`${prompt}\n\n${truncated}`);
    },
    { maxRetries: 3, baseDelay: 2000, label: `Gemini ${summaryType}` }
  );

  const response = await result.response;
  const responseTime = Date.now() - startTime;
  const estimatedTokens = Math.ceil((truncated.length + response.text().length) / 4);

  if (userId) {
    await APIUsage.create({ userId, apiProvider: "gemini", endpoint: "generateContent", tokensUsed: { total: estimatedTokens }, responseTime, status: "success" }).catch(() => {});
  }

  logger.info(`Gemini ${summaryType} | ~tokens: ${estimatedTokens} | ${responseTime}ms`);
  return { summary: response.text(), tokens: estimatedTokens, model: process.env.GEMINI_MODEL || GEMINI_MODELS[0] };
};

export const analyzeContent = async (content, userId) => {
  try {
    const truncated = truncateContent(content, 2000);
    const result = await retryWithBackoff(
      async () => {
        const model = getModel(getGenAI());
        return model.generateContent(
          `Return ONLY valid JSON (no markdown) with keys "topics" (string array max 5), "keywords" (string array max 8), "sentiment" ("positive"|"negative"|"neutral").\n\nContent: ${truncated}`
        );
      },
      { maxRetries: 2, baseDelay: 1000, label: "Gemini analyze" }
    );
    const response = await result.response;
    return parseJSONFromLLM(response.text());
  } catch (err) {
    logger.warn(`Gemini analyzeContent failed (non-fatal): ${err.message}`);
    return { topics: [], keywords: [], sentiment: "neutral" };
  }
};

export const streamSummary = async (content, summaryType = "short") => {
  const truncated = truncateContent(content);
  const prompt = PROMPTS[summaryType] || PROMPTS.short;
  const model = getModel(getGenAI());
  return model.generateContentStream(`${prompt}\n\n${truncated}`);
};
