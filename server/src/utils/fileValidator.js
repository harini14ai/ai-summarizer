// ============================================
// File Validation Utility
// ============================================
// Validates file types and sizes

const ALLOWED_TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/plain': 'txt',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10485760; // 10MB

const validateFile = (file) => {
  if (!file) {
    throw new Error('No file provided');
  }

  // Check file type
  if (!ALLOWED_TYPES[file.mimetype]) {
    throw new Error(`File type ${file.mimetype} is not allowed. Allowed types: ${Object.keys(ALLOWED_TYPES).join(', ')}`);
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  return true;
};

export { validateFile, ALLOWED_TYPES, MAX_FILE_SIZE };
