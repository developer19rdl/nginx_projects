-- Adds a Priority field to Machine Planning: a free-text row priority code (P1, P2, P3, ...)
-- entered per-row on the Production Order Excel template, right after Machine.

ALTER TABLE machine_planning ADD COLUMN priority VARCHAR(20) NULL AFTER customer_name;

UPDATE machine_planning SET priority = 'P1' WHERE priority IS NULL;

ALTER TABLE machine_planning MODIFY COLUMN priority VARCHAR(20) NOT NULL;

-- Add PRIORITY to the template, right after Machine - shift every later column's display_order.
UPDATE excel_column_mappings SET display_order = display_order + 1
WHERE template_code = 'PRODUCTION_PLAN' AND field_key <> 'machine_code';

INSERT INTO excel_column_mappings (template_code, field_key, column_header, display_order, data_type, is_required) VALUES
  ('PRODUCTION_PLAN', 'priority', 'PRIORITY', 2, 'string', 1);
