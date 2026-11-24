/** Shared 🟢/🟡/🔴 health-color convention for the Machine Details dashboard's KPI tiles and OEE
 * breakdown - "healthy" (success), "warning", or "critical" (error), so every color-coded tile on
 * the page reads against the same thresholds instead of each component inventing its own. `null`
 * (no data yet, e.g. no shift covering right now) is its own neutral "default" state, never forced
 * into one of the three colors.
 *
 * higherIsBetter(value, {warn, good}): >= good -> success, >= warn -> warning, else error.
 * lowerIsBetter(value, {warn, critical}): <= warn -> success, <= critical -> warning, else error. */
export function higherIsBetter(value, { warn = 60, good = 85 } = {}) {
  if (value == null) return 'default';
  if (value >= good) return 'success';
  if (value >= warn) return 'warning';
  return 'error';
}

export function lowerIsBetter(value, { warn = 30, critical = 120 } = {}) {
  if (value == null) return 'default';
  if (value <= warn) return 'success';
  if (value <= critical) return 'warning';
  return 'error';
}
