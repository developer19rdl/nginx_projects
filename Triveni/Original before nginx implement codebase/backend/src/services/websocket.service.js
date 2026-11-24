const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const logger = require('../utils/logger');
const { PERMISSIONS } = require('../config/constants');

let io = null;

function machineRoom(machineId) {
  return `machine:${machineId}`;
}

/**
 * Starts the Socket.IO server on top of the same HTTP server Express listens on (one port, no
 * separate WS server to run/deploy) and replaces the Operator Machine Planning screen's polling:
 * clients join a room per machine they're viewing, and whichever service mutates a
 * machine_planning row (Start/Stop/Reset/Produced Qty save, or an MQTT reading) calls
 * emitProductionUpdate() straight after, pushing the fresh row to everyone watching that machine.
 *
 * Auth mirrors the REST API: the same JWT (env.jwt.secret) is required on the handshake, and a
 * client can only join a machine's room if its token carries PLANNING_VIEW - an unauthenticated or
 * under-permissioned socket is rejected rather than silently allowed to listen in on production
 * data.
 */
function init(httpServer) {
  io = new Server(httpServer, {
    path: '/socket.io',
    cors: { origin: env.corsOrigin, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));
    try {
      socket.user = jwt.verify(token, env.jwt.secret);
      next();
    } catch (err) {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    logger.info('WebSocket client connected', { socketId: socket.id, userId: socket.user?.id });

    socket.on('join-machine', (machineId) => {
      if (!socket.user?.permissions?.includes(PERMISSIONS.PLANNING_VIEW)) {
        socket.emit('error', { message: 'Not permitted to view production updates' });
        return;
      }
      if (!machineId) return;
      socket.join(machineRoom(machineId));
      logger.debug('WebSocket client joined machine room', { socketId: socket.id, machineId });
    });

    socket.on('leave-machine', (machineId) => {
      if (!machineId) return;
      socket.leave(machineRoom(machineId));
      logger.debug('WebSocket client left machine room', { socketId: socket.id, machineId });
    });

    socket.on('disconnect', (reason) => {
      logger.info('WebSocket client disconnected', { socketId: socket.id, reason });
    });

    socket.on('error', (err) => {
      logger.error('WebSocket socket error', { socketId: socket.id, error: err.message });
    });
  });

  io.engine.on('connection_error', (err) => {
    logger.error('WebSocket connection error', { error: err.message, code: err.code });
  });

  logger.info('WebSocket server started', { path: '/socket.io' });
  return io;
}

/** Pushes a machine_planning row (same shape the REST list/detail endpoints return) to every
 * client currently watching that row's machine. A no-op, logged, if called before init() (should
 * never happen once the server has started) or for a row with no machine_id yet (unassigned). */
function emitProductionUpdate(row) {
  if (!row?.machine_id) return;
  if (!io) {
    logger.warn('emitProductionUpdate called before the WebSocket server was initialized', { rowId: row.id });
    return;
  }
  io.to(machineRoom(row.machine_id)).emit('production:update', row);
}

module.exports = { init, emitProductionUpdate };
