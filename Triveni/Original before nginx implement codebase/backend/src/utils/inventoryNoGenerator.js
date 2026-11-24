const { toDateOnlyString } = require('./dateTime');

/**
 * Generates the next document number for today under a given prefix, e.g. generateNo(cn, 'INV')
 * -> 'INV-20260829-0001'. One shared per-date-per-prefix counter table (inventory_no_sequences)
 * backs every inventory document type (INV/TRF/ADJ/HLD) instead of one table per type - mirrors
 * qualityInspectionNoGenerator.js's generateInspectionNo, generalized to a prefix parameter.
 * MUST be called with a connection already inside an open transaction: it locks the counter row
 * with SELECT ... FOR UPDATE so two documents starting at the same instant never collide.
 */
async function generateNo(connection, prefix) {
  const dateStr = toDateOnlyString(new Date());
  const compactDate = dateStr.replace(/-/g, '');

  await connection.query(
    `INSERT INTO inventory_no_sequences (sequence_date, prefix, last_number)
     VALUES (:sequenceDate, :prefix, 0)
     ON DUPLICATE KEY UPDATE sequence_date = sequence_date`,
    { sequenceDate: dateStr, prefix }
  );

  const [rows] = await connection.query(
    `SELECT last_number FROM inventory_no_sequences WHERE sequence_date = :sequenceDate AND prefix = :prefix FOR UPDATE`,
    { sequenceDate: dateStr, prefix }
  );
  const nextNumber = (rows[0]?.last_number || 0) + 1;

  await connection.query(
    `UPDATE inventory_no_sequences SET last_number = :nextNumber WHERE sequence_date = :sequenceDate AND prefix = :prefix`,
    { nextNumber, sequenceDate: dateStr, prefix }
  );

  return `${prefix}-${compactDate}-${String(nextNumber).padStart(4, '0')}`;
}

module.exports = { generateNo };
