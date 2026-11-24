const logger = require('../utils/logger');
const { failure } = require('../utils/ApiResponse');

function notFoundHandler(req, res, next) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}`, errors: [] });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.isApiError ? err.statusCode : err.statusCode || 500;
  const message = err.isApiError ? err.message : statusCode === 500 ? 'Internal server error' : err.message;
  const errors = err.errors || [];

  if (statusCode >= 500) {
    logger.error(err.message, { stack: err.stack, path: req.originalUrl, method: req.method });
  } else {
    logger.warn(err.message, { path: req.originalUrl, method: req.method, statusCode });
  }

  return failure(res, { message, errors, statusCode });
}

module.exports = { notFoundHandler, errorHandler };
