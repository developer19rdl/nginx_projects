import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Read .env/.env.local here too (Vite only auto-loads env into import.meta.env for app code,
  // not into this config file) so the proxy target comes from one place - see .env.example.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      port: 5180,
      // Bind all interfaces, not just localhost, so other devices on the same network can reach
      // this dev server at this machine's LAN IP (e.g. http://192.168.1.18:5180) - '/api' below is
      // still proxied to the backend on this same machine's localhost, so no CORS/host changes are
      // needed on the backend side for this to work.
      host: true,
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_ORIGIN || 'http://localhost:5050',
          changeOrigin: true,
        },
        // Same-origin WebSocket for live production updates (see src/lib/socket.js) - proxied the
        // same way as /api so the browser never needs a separate cross-origin/CORS setup for it.
        '/socket.io': {
          target: env.VITE_BACKEND_ORIGIN || 'http://localhost:5050',
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
});
