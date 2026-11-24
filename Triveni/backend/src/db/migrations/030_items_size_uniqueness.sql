-- Items are now unique by (Item Code + Size), not item_code alone - a Production Order upload
-- carries both as separate columns (see excel_column_mappings 'PRODUCTION_PLAN'), and the same
-- item code at a different size is a genuinely different SKU, not a duplicate of the same item.
-- size defaults to '' (not NULL) so the composite unique key actually enforces "one row per
-- item_code+size" even when a row's Size column was left blank - MariaDB treats NULL as distinct
-- from itself in a unique index, which would otherwise let blank-size duplicates through.

ALTER TABLE items ADD COLUMN size VARCHAR(50) NOT NULL DEFAULT '' AFTER item_name;

-- Existing rows already satisfy uq_items_code (item_code alone was unique), so backfilling
-- size = '' can't collide with anything - safe to just drop the old key and add the new one.
ALTER TABLE items DROP INDEX uq_items_code;
ALTER TABLE items ADD UNIQUE KEY uq_items_code_size (item_code, size);
