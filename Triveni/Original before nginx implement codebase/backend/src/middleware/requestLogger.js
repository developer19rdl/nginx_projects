const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  const startedAt = Date.now();
  res.on('finish', () => {
    logger.info('request', {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      user: req.user?.id,
      ip: req.ip,
    });
  });
  next();
}

module.exports = requestLogger;
