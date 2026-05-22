// ============================================
// URL Scraping Service
// ============================================
// Extracts content from URLs

import axios from 'axios';
import logger from '../utils/logger.js';

// ============================================
// Extract Text from URL
// ============================================
const extractFromURL = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    // Simple HTML text extraction (remove HTML tags)
    const text = response.data
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return text;
  } catch (error) {
    logger.error(`URL extraction error: ${error.message}`);
    throw new Error(`Failed to extract content from URL: ${error.message}`);
  }
};

// ============================================
// Extract Metadata from URL
// ============================================
const extractMetadataFromURL = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    // Extract title
    const titleMatch = response.data.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : 'Unknown Title';

    // Extract meta description
    const descriptionMatch = response.data.match(/<meta\s+name="description"\s+content="(.*?)"/i);
    const description = descriptionMatch ? descriptionMatch[1] : '';

    return { title, description, url };
  } catch (error) {
    logger.error(`Metadata extraction error: ${error.message}`);
    throw error;
  }
};

export { extractFromURL, extractMetadataFromURL };
