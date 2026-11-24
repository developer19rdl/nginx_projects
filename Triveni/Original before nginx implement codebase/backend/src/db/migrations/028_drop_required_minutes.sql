-- Machine Planning never surfaces required_minutes anywhere (no screen in either the web or
-- operator app displays it) - it was only ever a derived-and-stored value (quantity run at the
-- assigned machine's production_rate), computed at Excel-import time and recomputed on manual
-- assignment. Dropping it outright rather than leaving unused write-only columns/code around.

ALTER TABLE machine_planning
  DROP COLUMN required_minutes;
