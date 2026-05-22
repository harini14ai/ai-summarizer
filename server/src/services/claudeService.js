import Anthropic from "@anthropic-ai/sdk";
import logger from "../utils/logger.js";
import APIUsage from "../models/APIUsage.js";

let _anthropic = null;
const getAnthropic = () => {
  if (!_anthropic) {
    const key = process.env.CLAUDE_API_KEY;
    if (!key || key.startsWith("placeholder")) throw new Error("CLAUDE_API_KEY not configured");
    _anthropic = new Anthropic({ apiKey: key });
  }
  return _anthropic;
};

const parseJSONFromLLM = (text) => {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
  return JSON.parse(cleaned);
};

const PROMPTS = {
  short: "Provide a brief, concise summary (2-3 sentences) of the following content:",
  detailed: "Provide a comprehensive detailed summary of the following content:",
  bulletPoints: "Create a bullet-point summary. Start each point with a dash:",
  highlights: "Extract the key highlights from the following content:",
  topics: "Identify the main topics covered in the following content:",
  keywords: "Extract the most important keywords from the following content:",
};

export const generateSummary = async (content, summaryType = "short", userId) => {
  try {
    const anthropic = getAnthropic();
    const prompt = PROMPTS[summaryType] || PROMPTS.short;
    const startTime = Date.now();
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [{ role: "user", content: `${prompt}\n\n${content}` }],
    });
    const responseTime = Date.now() - startTime;
    if (userId) {
      await APIUsage.create({ userId, apiProvider: "claude", endpoint: "messages.create", tokensUsed: { input: response.usage.input_tokens, output: response.usage.output_tokens, total: response.usage.input_tokens + response.usage.output_tokens }, responseTime, status: "success" }).catch(() => {});
    }
    return { summary: response.content[0].text, tokens: response.usage.input_tokens + response.usage.output_tokens, model: "claude-3-5-sonnet-20241022" };
  } catch (error) {
    logger.error(`Claude summarization error: ${error.message}`);
    if (userId) await APIUsage.create({ userId, apiProvider: "claude", status: "failed", errorMessage: error.message }).catch(() => {});
    throw error;
  }
};

export const analyzeContent = async (content, userId) => {
  try {
    const anthropic = getAnthropic();
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 512,
      messages: [{ role: "user", content: `Return ONLY valid JSON (no markdown) with keys "topics" (array), "keywords" (array), "sentiment" (positive/negative/neutral).\n\nContent: ${content.slice(0, 3000)}` }],
    });
    return parseJSONFromLLM(response.content[0].text);
  } catch (error) {
    logger.error(`Claude analysis error: ${error.message}`);
    return { topics: [], keywords: [], sentiment: "neutral" };
  }
};

export const streamSummary = async (content, summaryType = "short") => {
  try {
    const anthropic = getAnthropic();
    const prompt = PROMPTS[summaryType] || PROMPTS.short;
    return anthropic.messages.stream({ model: "claude-3-5-sonnet-20241022", max_tokens: 1024, messages: [{ role: "user", content: `${prompt}\n\n${content}` }] });
  } catch (error) {
    logger.error(`Claude streaming error: ${error.message}`);
    throw error;
  }
};
