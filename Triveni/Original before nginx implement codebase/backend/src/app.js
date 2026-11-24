const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const env = require('./config/env');
const routesV1 = require('./routes/v1');
const requestLogger = require('./middleware/requestLogger');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(env.apiPrefix, apiLimiter);

app.get('/health', (req, res) => res.json({ success: true, message: 'OK', data: { uptime: process.uptime() } }));

app.use(env.apiPrefix, routesV1);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
