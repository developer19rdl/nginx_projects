const mysql = require('mysql2/promise');
const env = require('./env');
const logger = require('../utils/logger');

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.database,
  user: env.db.user,
  password: env.db.password,
  waitForConnections: true,
  connectionLimit: env.db.connectionLimit,
  queueLimit: 0,
  dateStrings: true, // return DATE/DATETIME as strings, avoids JS Date/timezone drift
  decimalNumbers: false, // keep DECIMAL as string to avoid float precision loss; callers parseFloat where needed
  namedPlaceholders: true,
});

pool.on('connection', () => {
  logger.debug('New MariaDB connection established in pool');
});

/**
 * Run a callback inside a transaction. The callback receives a connection
 * that MUST be used for every query it issues (never the shared pool),
 * otherwise the queries would run outside the transaction.
 */
async function withTransaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function checkConnection() {
  const conn = await pool.getConnection();
  try {
    await conn.query('SELECT 1');
  } finally {
    conn.release();
  }
}

module.exports = { pool, withTransaction, checkConnection };
