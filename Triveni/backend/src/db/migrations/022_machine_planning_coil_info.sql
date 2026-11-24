-- Coil Info: operator-entered details for a machine plan row (coil number, grade, size, weight),
-- captured via a popup on the operator app's Machine Planning screen. All nullable - a row can sit
-- with no coil info until an operator fills it in.

ALTER TABLE machine_planning
  ADD COLUMN coil_no   VARCHAR(50)  NULL AFTER produced_qty,
  ADD COLUMN grade     VARCHAR(50)  NULL AFTER coil_no,
  ADD COLUMN coil_size VARCHAR(50)  NULL AFTER grade,
  ADD COLUMN coil_wt   DECIMAL(10,2) NULL AFTER coil_size;
