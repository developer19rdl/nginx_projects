const path = require('path');
const fs = require('fs');

// In packaged executable mode (process.pkg), load .env located next to the .exe.
// Otherwise fallback to project working directory for standard dev mode.
const appRoot = process.pkg ? path.dirname(process.execPath) : process.cwd();
const envPath = path.join(appRoot, '.env');

if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  require('dotenv').config();
}

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function normalizeBrokerUrl(value) {
  const trimmed = (value || '').trim();
  if (!trimmed) return '';
  return trimmed.includes('://') ? trimmed : `mqtt://${trimmed}`;
}

function parseCorsOrigin(value) {
  const trimmed = (value || '').trim();
  if (!trimmed || trimmed === '*') return '*';
  if (trimmed.includes(',')) {
    return trimmed.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return trimmed;
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  corsOrigin: parseCorsOrigin(process.env.CORS_ORIGIN || 'http://localhost:5173'),

  db: {
    host: required('DB_HOST', 'localhost'),
    port: parseInt(process.env.DB_PORT || '3306', 10),
    database: required('DB_NAME'),
    user: required('DB_USER'),
    password: process.env.DB_PASSWORD || '',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  },

  jwt: {
    secret: required('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    refreshSecret: required('JWT_REFRESH_SECRET'),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxSizeMb: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '25', 10),
  },

  seedAdmin: {
    email: process.env.SEED_ADMIN_EMAIL || 'admin@tiveni.local',
    password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '300', 10),
  },

  coilLookup: {
    url: process.env.COIL_LOOKUP_API_URL || '',
    apiKey: process.env.COIL_LOOKUP_API_KEY || '',
    timeoutMs: parseInt(process.env.COIL_LOOKUP_API_TIMEOUT_MS || '8000', 10),
  },

  // Where the frontend actually lives - used to build the reset-password link in the forgot-
  // password email. Falls back to CORS_ORIGIN (already the frontend's origin in every env this
  // app runs in) so nothing new needs setting just to get a correct link.
  frontendUrl: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Optional feature, same pattern as coilLookup/mqtt above - if SMTP_HOST isn't set, mailer
  // .service.js just logs the message instead of sending it (fine for local dev, where a
  // console-logged reset link is more useful than a real inbox anyway).
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    fromAddress: process.env.SMTP_FROM || 'Triveni Steel ERP <no-reply@triveni.local>',
  },

  // Optional feature, same pattern as coilLookup above - if MQTT_BROKER_URL isn't set, the app
  // just skips connecting instead of failing to start (useful for local dev without a broker).
  mqtt: {
    // The mqtt package requires a URL with a protocol (mqtt://, mqtts://, ws://...) and throws
    // synchronously if it's missing - a bare host/IP (as copied from a broker's connection
    // details, or another MQTT client's config) is a very easy mistake, so default a schemeless
    // value to plain mqtt:// rather than letting it crash the server at startup.
    brokerUrl: normalizeBrokerUrl(process.env.MQTT_BROKER_URL),
    username: process.env.MQTT_USERNAME || undefined,
    password: process.env.MQTT_PASSWORD || undefined,
    clientId: process.env.MQTT_CLIENT_ID || `tiveni-backend-${Math.random().toString(16).slice(2, 10)}`,
    productionTopic: process.env.MQTT_PRODUCTION_TOPIC || 'tiveni/production',
    qos: parseInt(process.env.MQTT_QOS || '1', 10),
    reconnectPeriodMs: parseInt(process.env.MQTT_RECONNECT_PERIOD_MS || '5000', 10),
  },
};

module.exports = env;
