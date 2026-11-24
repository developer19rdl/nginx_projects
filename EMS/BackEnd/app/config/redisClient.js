const redis = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const isRedisDisabled = !process.env.REDIS_URL || process.env.REDIS_URL.toLowerCase() === 'none';

let client = null;
let isReady = false;

if (!isRedisDisabled) {
    client = redis.createClient({
        url: redisUrl
    });

    client.on('connect', () => {
        console.log('[Redis] Connecting...');
    });

    client.on('ready', () => {
        isReady = true;
        console.log('[Redis] Client ready and connected.');
    });

    client.on('error', (err) => {
        isReady = false;
        console.warn('[Redis] Client error:', err.message);
    });

    client.on('end', () => {
        isReady = false;
        console.log('[Redis] Connection closed.');
    });

    // Auto-connect on module load
    (async () => {
        try {
            await client.connect();
        } catch (err) {
            console.warn(`[Redis] Start connection failed: ${err.message}. Caching will fall back to in-memory.`);
        }
    })();
} else {
    console.log('[Redis] Cache client is disabled (REDIS_URL=none). Caching is running in local in-memory fallback mode.');
}

module.exports = {
    isReady: () => isReady,
    get: async (key) => {
        if (!isReady || !client) return null;
        return await client.get(key);
    },
    set: async (key, val, ttlSec) => {
        if (!isReady || !client) return null;
        if (ttlSec) {
            return await client.set(key, val, { EX: ttlSec });
        }
        return await client.set(key, val);
    },
    del: async (key) => {
        if (!isReady || !client) return null;
        return await client.del(key);
    }
};
