// ============================================
// API Response Utility
// ============================================
// Standardized response format for all API endpoints

class APIResponse {
  constructor(statusCode, data, message = 'Success', success = true) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = success;
  }
}

const sendResponse = (res, statusCode, data, message = 'Success', success = true) => {
  const response = new APIResponse(statusCode, data, message, success);
  return res.status(statusCode).json(response);
};

const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return sendResponse(res, statusCode, data, message, true);
};

const sendError = (res, message = 'Internal server error', data = null, statusCode = 500) => {
  return sendResponse(res, statusCode, data, message, false);
};

export { APIResponse, sendResponse, sendSuccess, sendError };
