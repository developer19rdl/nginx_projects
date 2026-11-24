-- Unassigning a row now clears its Schedule Date + Shift (takes it off the plan) instead of
-- clearing its Machine - the machine assignment is kept. Both columns need to become nullable to
-- allow that.

ALTER TABLE machine_planning
  MODIFY COLUMN schedule_date DATE NULL,
  MODIFY COLUMN shift_id INT UNSIGNED NULL;
