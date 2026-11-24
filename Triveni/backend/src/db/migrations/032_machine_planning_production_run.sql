-- Tracks the actual production run on a machine_planning row (Start button on the Operator
-- Machine Planning screen), separate from the scheduling concept dropped in
-- 013_simplify_machine_planning.sql - this is "is the shop floor physically producing this order
-- right now", not "is this row scheduled".
ALTER TABLE machine_planning
  ADD COLUMN production_status ENUM('NOT_STARTED', 'RUNNING', 'COMPLETED') NOT NULL DEFAULT 'NOT_STARTED' AFTER produced_qty,
  ADD COLUMN production_start_at DATETIME NULL AFTER production_status,
  ADD COLUMN production_end_at DATETIME NULL AFTER production_start_at;

-- Backs the "only one row can be RUNNING per machine at a time" check (poAssignment.service.js) -
-- a partial-style lookup, but MySQL/MariaDB doesn't support a partial index, so this just indexes
-- the pair; the service still filters production_status = 'RUNNING' itself.
CREATE INDEX idx_mpd_machine_production_status ON machine_planning(machine_id, production_status);
