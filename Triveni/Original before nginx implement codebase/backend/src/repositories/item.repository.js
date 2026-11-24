const { pool } = require('../config/database');

async function findByCode(itemCode, size = '', connection = pool) {
  const [rows] = await connection.query(`SELECT * FROM items WHERE item_code = :itemCode AND size = :size`, {
    itemCode,
    size: size || '',
  });
  return rows[0] || null;
}

async function findCodesMap(itemCodes, connection = pool) {
  if (!itemCodes.length) return new Map();
  const [rows] = await connection.query(`SELECT * FROM items WHERE item_code IN (:itemCodes)`, { itemCodes });
  return new Map(rows.map((r) => [r.item_code, r]));
}

async function findAll({ search, limit, offset }) {
  const conditions = ['is_active = 1'];
  const params = {};
  if (search) {
    conditions.push('(item_code LIKE :search OR item_name LIKE :search OR size LIKE :search)');
    params.search = `%${search}%`;
  }
  const where = `WHERE ${conditions.join(' AND ')}`;
  const [rows] = await pool.query(
    `SELECT * FROM items ${where} ORDER BY item_code, size LIMIT :limit OFFSET :offset`,
    { ...params, limit, offset }
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM items ${where}`, params);
  return { rows, total };
}

/** Manual create/edit from the Items master screen - identity is (item_code, size), so editing an
 * existing item's name/uom means resubmitting the same item_code+size pair. */
async function upsert({ itemCode, size, itemName, uom, defaultProductionRate }, connection = pool) {
  const normalizedSize = size || '';
  await connection.query(
    `INSERT INTO items (item_code, size, item_name, uom, default_production_rate)
     VALUES (:itemCode, :size, :itemName, :uom, :defaultProductionRate)
     ON DUPLICATE KEY UPDATE item_name = VALUES(item_name), uom = VALUES(uom), default_production_rate = VALUES(default_production_rate)`,
    {
      itemCode,
      size: normalizedSize,
      itemName: itemName || itemCode,
      uom: uom || 'PCS',
      defaultProductionRate: defaultProductionRate ?? null,
    }
  );
  return findByCode(itemCode, normalizedSize, connection);
}

/**
 * Auto-provisions items master rows from a Production Order upload: one INSERT IGNORE per unique
 * (item_code, size) pair in the batch, so a combination that already exists is left completely
 * untouched (unlike upsert(), which intentionally overwrites - this path only fills in what's
 * missing, since the Excel row has no item_name/uom to safely overwrite an existing item with).
 * Callers should already have deduped `items` to one entry per (itemCode, size).
 */
async function ensureExist(items, connection = pool) {
  if (!items.length) return;
  const values = items.map((i) => [i.itemCode, i.size || '', i.itemName || i.itemCode]);
  await connection.query(`INSERT IGNORE INTO items (item_code, size, item_name) VALUES ?`, [values]);
}

module.exports = { findByCode, findCodesMap, findAll, upsert, ensureExist };
