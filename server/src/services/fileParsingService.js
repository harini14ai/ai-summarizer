// ============================================
// File Parsing Service
// ============================================
// Extracts text from various file types

import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs/promises';
import logger from '../utils/logger.js';

// ============================================
// Parse PDF File
// ============================================
const parsePDF = async (filePath) => {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const data = await pdfParse(fileBuffer);
    return data.text;
  } catch (error) {
    logger.error(`PDF parsing error: ${error.message}`);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
};

// ============================================
// Parse DOCX File
// ============================================
const parseDOCX = async (filePath) => {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  } catch (error) {
    logger.error(`DOCX parsing error: ${error.message}`);
    throw new Error(`Failed to parse DOCX: ${error.message}`);
  }
};

// ============================================
// Parse TXT File
// ============================================
const parseTXT = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    logger.error(`TXT parsing error: ${error.message}`);
    throw new Error(`Failed to parse TXT: ${error.message}`);
  }
};

// ============================================
// Generic Parse Function
// ============================================
const parseFile = async (filePath, fileType) => {
  switch (fileType.toLowerCase()) {
    case 'pdf':
      return await parsePDF(filePath);
    case 'docx':
      return await parseDOCX(filePath);
    case 'txt':
      return await parseTXT(filePath);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
};

export { parsePDF, parseDOCX, parseTXT, parseFile };
