-- The imported Item is no longer validated against (or resolved from) the items master - the
-- Excel importer just stores whatever text is in the "Item" column straight onto the
-- machine_planning row. Convert item_id (FK to items) into a free-text item_code column,
-- backfilling existing rows from the items table before the FK/join is dropped.

ALTER TABLE machine_planning ADD COLUMN item_code VARCHAR(100) NULL AFTER customer_name;

UPDATE machine_planning mpd
JOIN items i ON i.id = mpd.item_id
SET mpd.item_code = i.item_code;

ALTER TABLE machine_planning DROP FOREIGN KEY fk_mpd_item;
ALTER TABLE machine_planning DROP INDEX idx_mpd_item;
ALTER TABLE machine_planning DROP COLUMN item_id;

ALTER TABLE machine_planning MODIFY COLUMN item_code VARCHAR(100) NOT NULL;
