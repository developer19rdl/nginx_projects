import { io } from 'socket.io-client';

let socket = null;

/**
 * One shared Socket.IO connection for the whole app (created lazily, on first use) - the
 * Operator Machine Planning screen's live Produced Qty/Status/Timer updates ride on this instead
 * of polling (see useProductionSocket in pages/ShiftPlan.jsx).
 *
 * `auth` is a function, not a static value, so every (re)connection attempt reads the *current*
 * accessToken from localStorage rather than closing over a token that might since have been
 * refreshed or replaced by a fresh login - socket.io calls it fresh each time.
 * Reconnection is handled entirely by socket.io itself (on by default); this module doesn't need
 * to implement any retry logic of its own.
 */
export function getSocket() {
  if (!socket) {
    socket = io('/', {
      path: '/socket.io',
      auth: (cb) => cb({ token: localStorage.getItem('accessToken') }),
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    socket.on('connect_error', (err) => {
      // eslint-disable-next-line no-console
      console.warn('WebSocket connection error:', err.message);
    });
  }
  return socket;
}
