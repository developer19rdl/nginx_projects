const { pool } = require('../config/database');

async function findActiveMapping(templateCode = 'PRODUCTION_PLAN') {
  const [rows] = await pool.query(
    `SELECT * FROM excel_column_mappings WHERE template_code = :templateCode AND is_active = 1 ORDER BY display_order`,
    { templateCode }
  );
  return rows;
}

module.exports = { findActiveMapping };
