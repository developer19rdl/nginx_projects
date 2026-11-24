-- Adds a STOPPED status distinct from COMPLETED - clicking Stop now means "manually halted before
-- reaching the planned quantity", not "done". Only actually reaching the planned quantity (via a
-- Produced Qty save or an MQTT reading) marks a row COMPLETED; see poDetail.repository.js.
ALTER TABLE machine_planning
  MODIFY COLUMN production_status ENUM('NOT_STARTED', 'RUNNING', 'STOPPED', 'COMPLETED') NOT NULL DEFAULT 'NOT_STARTED';
