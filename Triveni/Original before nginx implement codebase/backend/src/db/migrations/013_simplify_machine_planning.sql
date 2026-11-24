-- Flatten Machine Planning assignment down to "assigned to a machine, or not" - drop the
-- 440-minute shift-window bucketing (sequence_no, start_minute, end_minute, shift_no), the
-- separate status flag (redundant with machine_id being NULL/NOT NULL), the Excel row-number
-- traceability column, and the assignment audit columns (already covered by audit_logs).

-- Create the replacement single-column index first - the fk_mpd_machine foreign key needs some
-- index covering machine_id at all times, and it's currently backed by idx_mpd_machine_seq.
CREATE INDEX idx_mpd_machine ON machine_planning(machine_id);

ALTER TABLE machine_planning
  DROP INDEX idx_mpd_machine_seq,
  DROP INDEX idx_mpd_machine_shift,
  DROP INDEX idx_mpd_status;

ALTER TABLE machine_planning
  DROP COLUMN sequence_no,
  DROP COLUMN start_minute,
  DROP COLUMN end_minute,
  DROP COLUMN shift_no,
  DROP COLUMN source_row_no,
  DROP COLUMN status,
  DROP COLUMN assigned_by,
  DROP COLUMN assigned_at;
