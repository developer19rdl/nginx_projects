const winston = require('winston');
const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'tiveni-backend' },
  transports: [
    new winston.transports.File({ filename: path.join('logs', 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join('logs', 'combined.log') }),
  ],
});

if (!isProd) {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    })
  );
}

module.exports = logger;
