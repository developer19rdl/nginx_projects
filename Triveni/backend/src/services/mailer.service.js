const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../utils/logger');

// Optional feature, same "just no-op without config" pattern as coilLookup/mqtt in env.js - most
// deployments of this internal ERP won't have SMTP set up, so rather than fail loudly this falls
// back to logging the email's content (which, for a reset link, is exactly what you'd want in
// dev anyway - no inbox required to test the flow end to end).
let transporter = null;
if (env.smtp.host) {
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    // nodemailer's auth object requires the key `pass`, not `password` - using the latter (which
    // matches this app's own env.smtp.password field name, but not nodemailer's expected shape)
    // silently produced an auth object with no password at all, surfacing as "Missing credentials
    // for PLAIN" the moment the transporter tried to authenticate.
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.password } : undefined,
  });
}

/**
 * Sends an email if SMTP is configured; otherwise logs it (at warn level in production, so a
 * misconfigured deployment is visible in the logs rather than silently failing to deliver
 * anything). Never throws - a failed/unsent email must not break the caller's business logic
 * (mirrors audit.service.js's "record" swallow-and-log convention).
 */
async function sendMail({ to, subject, text, html }) {
  if (!transporter) {
    const logLevel = env.nodeEnv === 'production' ? 'warn' : 'info';
    logger[logLevel]('SMTP not configured - email not sent, logging content instead', { to, subject, text });
    return { sent: false };
  }

  try {
    await transporter.sendMail({ from: env.smtp.fromAddress, to, subject, text, html });
    return { sent: true };
  } catch (err) {
    logger.error('Failed to send email', { to, subject, error: err.message });
    return { sent: false };
  }
}

module.exports = { sendMail };
