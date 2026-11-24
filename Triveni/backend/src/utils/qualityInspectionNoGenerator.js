const { toDateOnlyString } = require('./dateTime');

/**
 * Generates the next Quality Inspection No for today, e.g. QIR-20260827-0001. Mirrors
 * productionOrderNoGenerator.js's generateOrderNo exactly: MUST be called with a connection
 * already inside an open transaction, since it locks a per-date counter row with
 * SELECT ... FOR UPDATE so two inspections starting at the same instant never collide.
 */
async function generateInspectionNo(connection) {
  const dateStr = toDateOnlyString(new Date());
  const compactDate = dateStr.replace(/-/g, '');

  await connection.query(
    `INSERT INTO quality_inspection_no_sequences (sequence_date, last_number)
     VALUES (:sequenceDate, 0)
     ON DUPLICATE KEY UPDATE sequence_date = sequence_date`,
    { sequenceDate: dateStr }
  );

  const [rows] = await connection.query(
    `SELECT last_number FROM quality_inspection_no_sequences WHERE sequence_date = :sequenceDate FOR UPDATE`,
    { sequenceDate: dateStr }
  );
  const nextNumber = (rows[0]?.last_number || 0) + 1;

  await connection.query(
    `UPDATE quality_inspection_no_sequences SET last_number = :nextNumber WHERE sequence_date = :sequenceDate`,
    { nextNumber, sequenceDate: dateStr }
  );

  return `QIR-${compactDate}-${String(nextNumber).padStart(4, '0')}`;
}

module.exports = { generateInspectionNo };
