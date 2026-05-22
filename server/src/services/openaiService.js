// ============================================
// OpenAI AI Service — with retry + token optimization
// ============================================
import OpenAI from "openai";
import logger from "../utils/logger.js";
import APIUsage from "../models/APIUsage.js";
import { retryWithBackoff } from "../utils/retryWithBackoff.js";

// Lazy-init — never instantiate at module load time
let _openai = null;
const getOpenAI = () => {
  if (!_openai) {
    const key = process.env.OPENAI_API_KEY;
    if (!key || key.startsWith("sk-placeholder") || key.startsWith("placeholder")) {
      throw new Error("OPENAI_API_KEY not configured. Add your real key to server/.env");
    }
    _openai = new OpenAI({ apiKey: key });
  }
  return _openai;
};

// Truncate content to stay within token budget
// gpt-4o-mini: 128k context, but we cap at ~6000 words (~8000 tokens) for cost
const truncateContent = (content, maxWords = 6000) => {
  const words = content.trim().split(/\s+/);
  if (words.length <= maxWords) return content;
  logger.warn(`OpenAI: truncating content from ${words.length} to ${maxWords} words`);
  return words.slice(0, maxWords).join(" ") + "\n\n[Content truncated for token optimization]";
};

const parseJSONFromLLM = (text) => {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
  return JSON.parse(cleaned);
};

const PROMPTS = {
  short: "Provide a brief, concise summary (2-3 sentences) of the following content:",
  detailed: "Provide a comprehensive detailed summary of the following content:",
  bulletPoints: "Create a bullet-point summary. Return each point on a new line starting with a dash (-):",
  highlights: "Extract the key highlights from the following content:",
  topics: "Identify the main topics covered in the following content:",
  keywords: "Extract the most important keywords from the following content:",
  sentiment: "Analyze the sentiment of the following content:",
};

// Token budgets per summary type
const MAX_TOKENS = {
  short: 200,
  detailed: 800,
  bulletPoints: 500,
  highlights: 400,
  topics: 200,
  keywords: 150,
  sentiment: 100,
};

export const generateSummary = async (content, summaryType = "short", userId) => {
  const truncated = truncateContent(content);
  const prompt = PROMPTS[summaryType] || PROMPTS.short;
  const maxTokens = MAX_TOKENS[summaryType] || 500;

  const startTime = Date.now();

  const response = await retryWithBackoff(
    () => getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert content summarizer. Be concise and accurate." },
        { role: "user", content: `${prompt}\n\n${truncated}` },
      ],
      temperature: 0.4,
      max_tokens: maxTokens,
    }),
    { maxRetries: 3, baseDelay: 2000, label: `OpenAI ${summaryType}` }
  );

  const responseTime = Date.now() - startTime;

  if (userId) {
    await APIUsage.create({
      userId, apiProvider: "openai", endpoint: "chat.completions",
      tokensUsed: { input: response.usage.prompt_tokens, output: response.usage.completion_tokens, total: response.usage.total_tokens },
      responseTime, status: "success",
    }).catch(() => {});
  }

  logger.info(`OpenAI ${summaryType} | tokens: ${response.usage.total_tokens} | ${responseTime}ms`);
  return { summary: response.choices[0].message.content, tokens: response.usage.total_tokens, model: "gpt-4o-mini" };
};

export const analyzeContent = async (content, userId) => {
  try {
    const truncated = truncateContent(content, 2000);
    const response = await retryWithBackoff(
      () => getOpenAI().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Return ONLY valid JSON. No markdown, no explanation." },
          { role: "user", content: `Analyze and return JSON with keys "topics" (string array, max 5), "keywords" (string array, max 8), "sentiment" ("positive"|"negative"|"neutral").\n\nContent: ${truncated}` },
        ],
        temperature: 0.2,
        max_tokens: 200,
      }),
      { maxRetries: 2, baseDelay: 1000, label: "OpenAI analyze" }
    );
    return parseJSONFromLLM(response.choices[0].message.content);
  } catch (err) {
    logger.warn(`OpenAI analyzeContent failed (non-fatal): ${err.message}`);
    return { topics: [], keywords: [], sentiment: "neutral" };
  }
};

export const generateMultiLanguageSummary = async (content, targetLanguages = ["en", "es", "fr"], userId) => {
  const truncated = truncateContent(content, 2000);
  const languageNames = { en: "English", es: "Spanish", fr: "French", de: "German", it: "Italian", pt: "Portuguese", ru: "Russian", ja: "Japanese", zh: "Chinese" };
  const summaries = {};
  for (const lang of targetLanguages) {
    const response = await retryWithBackoff(
      () => getOpenAI().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `Summarize in ${languageNames[lang] || lang}.` },
          { role: "user", content: `Summarize in ${languageNames[lang] || lang} (2-3 sentences):\n\n${truncated}` },
        ],
        max_tokens: 300,
      }),
      { maxRetries: 2, baseDelay: 1000, label: `OpenAI multilang ${lang}` }
    );
    summaries[lang] = response.choices[0].message.content;
  }
  return summaries;
};

export const streamSummary = async (content, summaryType = "short") => {
  const truncated = truncateContent(content);
  const prompt = PROMPTS[summaryType] || PROMPTS.short;
  return getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are an expert content summarizer." },
      { role: "user", content: `${prompt}\n\n${truncated}` },
    ],
    stream: true,
    max_tokens: MAX_TOKENS[summaryType] || 500,
  });
};
