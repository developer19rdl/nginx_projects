-- Machine Planning is now scheduled directly onto a Date + Shift chosen once on the Production
-- Order upload screen and stamped onto every row it creates, instead of being derived after the
-- fact by slicing a machine's whole queue into fixed 440-minute windows. A machine's plan for a
-- given date+shift becomes a direct SQL filter (machine_id, schedule_date, shift_id) - no more
-- in-memory window math.

ALTER TABLE machine_planning
  ADD COLUMN schedule_date DATE NULL AFTER quantity,
  ADD COLUMN shift_id INT UNSIGNED NULL AFTER schedule_date;

-- Backfill existing rows: schedule_date from the parent order's order_date, shift_id to the
-- earliest shift by start_time - there's no better historical signal for either.
UPDATE machine_planning mpd
JOIN production_order po ON po.id = mpd.order_id
SET mpd.schedule_date = po.order_date
WHERE mpd.schedule_date IS NULL;

UPDATE machine_planning
SET shift_id = (SELECT id FROM shifts ORDER BY start_time LIMIT 1)
WHERE shift_id IS NULL;

ALTER TABLE machine_planning
  MODIFY COLUMN schedule_date DATE NOT NULL,
  MODIFY COLUMN shift_id INT UNSIGNED NOT NULL,
  ADD CONSTRAINT fk_mpd_shift FOREIGN KEY (shift_id) REFERENCES shifts(id);

CREATE INDEX idx_mpd_machine_schedule ON machine_planning(machine_id, schedule_date, shift_id);
