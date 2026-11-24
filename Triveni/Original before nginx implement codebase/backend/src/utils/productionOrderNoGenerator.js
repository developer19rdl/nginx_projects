const { toDateOnlyString } = require('./dateTime');

/**
 * Generates the next Order No for today, e.g. ORD-20260820-0001. Mirrors
 * orderPlanNumberGenerator.js: MUST be called with a connection already inside an
 * open transaction, since it locks a per-date counter row with SELECT ... FOR UPDATE
 * so concurrent uploads never collide. Uses the server's current date, independent of
 * whatever Order Date the uploader manually enters.
 */
async function generateOrderNo(connection) {
  const dateStr = toDateOnlyString(new Date());
  const compactDate = dateStr.replace(/-/g, '');

  await connection.query(
    `INSERT INTO production_order_no_sequences (sequence_date, last_number)
     VALUES (:sequenceDate, 0)
     ON DUPLICATE KEY UPDATE sequence_date = sequence_date`,
    { sequenceDate: dateStr }
  );

  const [rows] = await connection.query(
    `SELECT last_number FROM production_order_no_sequences WHERE sequence_date = :sequenceDate FOR UPDATE`,
    { sequenceDate: dateStr }
  );
  const nextNumber = (rows[0]?.last_number || 0) + 1;

  await connection.query(
    `UPDATE production_order_no_sequences SET last_number = :nextNumber WHERE sequence_date = :sequenceDate`,
    { nextNumber, sequenceDate: dateStr }
  );

  return `ORD-${compactDate}-${String(nextNumber).padStart(4, '0')}`;
}

/**
 * Returns the next priority value: the previous order's priority + 1. Also locked with
 * SELECT ... FOR UPDATE on a single counter row so concurrent uploads never hand out the
 * same priority twice.
 */
async function generateNextPriority(connection) {
  const [rows] = await connection.query(
    `SELECT last_priority FROM production_order_priority_sequence WHERE id = 1 FOR UPDATE`
  );
  const nextPriority = (rows[0]?.last_priority || 0) + 1;
  await connection.query(`UPDATE production_order_priority_sequence SET last_priority = :nextPriority WHERE id = 1`, {
    nextPriority,
  });
  return nextPriority;
}

module.exports = { generateOrderNo, generateNextPriority };
