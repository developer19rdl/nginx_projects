-- Records produced_qty on machine_planning as a tracked migration - the column already exists on
-- this dev database (added directly, outside the migration system), so this uses IF NOT EXISTS
-- purely so a fresh database also ends up with it. Tracks how much of the row's quantity has
-- actually been produced on the shop floor; no code writes to it yet.

ALTER TABLE machine_planning ADD COLUMN IF NOT EXISTS produced_qty DECIMAL(14,2) NOT NULL DEFAULT 0 AFTER quantity;
