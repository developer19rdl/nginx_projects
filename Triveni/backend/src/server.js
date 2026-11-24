const path = require('path');

// When running as a packaged standalone executable, synchronize working directory
// to the folder containing the .exe so uploads and logs are created next to the executable.
if (process.pkg) {
  process.chdir(path.dirname(process.execPath));
}

const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const { checkConnection } = require('./config/database');
const mqttClientService = require('./services/mqttClient.service');
const websocketService = require('./services/websocket.service');

async function start() {
  try {
    await checkConnection();
    logger.info('Database connection verified');
  } catch (err) {
    logger.error('Failed to connect to database on startup', { error: err.message });
    process.exit(1);
  }

  const server = app.listen(env.port, () => {
    logger.info(`Triveni backend listening on port ${env.port} [${env.nodeEnv}]`);
  });

  websocketService.init(server);
  mqttClientService.start();

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', { reason: reason?.message || reason });
  });
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    mqttClientService.stop();
    server.close(() => process.exit(0));
  });
}

start();
