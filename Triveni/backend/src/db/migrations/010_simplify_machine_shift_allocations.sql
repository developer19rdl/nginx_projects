-- Simplify Machine Shift Allocation down to exactly what's needed: Date, Machine, Shift, Operator.
-- Available Hours / Status / Remarks are dropped - machine maintenance/breakdown tracking already
-- lives in its own tables (machine_maintenance, machine_breakdowns), so a separate status flag here
-- was redundant, and the new Machine Planning model doesn't consume capacity-hours from this table.

ALTER TABLE machine_shift_allocations
  DROP COLUMN available_hours,
  DROP COLUMN status,
  DROP COLUMN remarks;
