// ============================================
// In-Memory Summary Cache
// ============================================
// Prevents duplicate AI calls for identical content.
// Uses a simple LRU-style Map with TTL eviction.

import logger from './logger.js';
import crypto from 'crypto';

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ENTRIES = 200;

const cache = new Map(); // key → { result, expiresAt }

/**
 * Build a deterministic cache key from content + model + types.
 */
export const buildCacheKey = (content, aiModel, summaryTypes) => {
  const normalized = content.trim().toLowerCase().replace(/\s+/g, ' ');
  const raw = `${aiModel}:${[...summaryTypes].sort().join(',')}:${normalized}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
};

export const getFromCache = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  logger.info(`Cache HIT for key ${key.substring(0, 12)}...`);
  return entry.result;
};

export const setInCache = (key, result) => {
  // Evict oldest entry if at capacity
  if (cache.size >= MAX_ENTRIES) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, { result, expiresAt: Date.now() + CACHE_TTL_MS });
  logger.info(`Cache SET for key ${key.substring(0, 12)}...`);
};

export const clearCache = () => cache.clear();

// Periodic cleanup of expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of cache.entries()) {
    if (now > v.expiresAt) cache.delete(k);
  }
}, 5 * 60 * 1000);
