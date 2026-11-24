/** Normalizes a header cell value for tolerant matching against configured column_header. */
function normalizeHeader(value) {
  return String(value ?? '').trim().toLowerCase();
}

function parseQuantity(value) {
  const num = typeof value === 'number' ? value : parseFloat(String(value ?? '').replace(/,/g, ''));
  return Number.isFinite(num) ? num : null;
}

module.exports = { normalizeHeader, parseQuantity };
