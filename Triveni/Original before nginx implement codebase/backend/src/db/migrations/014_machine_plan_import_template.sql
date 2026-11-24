-- Rework the Production Order Excel import to the shop-floor "machine plan" format: the
-- uploader now names the target Machine directly per row (Machine, Customer, Item, Size, Qty,
-- Lot No, Div), so a row is planned - already assigned to a machine - the moment it's imported,
-- instead of sitting unassigned until a planner manually assigns it later. required_minutes is
-- no longer typed in by hand; it's derived at import time from the row's quantity and the
-- resolved machine's production_rate (see poExcelImport.service.js).

-- "div" is a reserved word in MariaDB (the integer-division operator), so the column is named
-- "division" internally; the Excel header (and field_key below) is still the short "Div" the
-- business uses.
ALTER TABLE machine_planning CHANGE COLUMN product_type division VARCHAR(50) NULL;

DELETE FROM excel_column_mappings WHERE template_code = 'PRODUCTION_PLAN';

INSERT INTO excel_column_mappings (template_code, field_key, column_header, display_order, data_type, is_required) VALUES
  ('PRODUCTION_PLAN', 'machine_code',  'Machine',  1, 'string', 1),
  ('PRODUCTION_PLAN', 'customer_name', 'Customer', 2, 'string', 1),
  ('PRODUCTION_PLAN', 'item_code',     'Item',     3, 'string', 1),
  ('PRODUCTION_PLAN', 'size',          'Size',     4, 'string', 0),
  ('PRODUCTION_PLAN', 'quantity',      'Qty',      5, 'number', 1),
  ('PRODUCTION_PLAN', 'lot_no',        'Lot No',   6, 'string', 0),
  ('PRODUCTION_PLAN', 'division',      'Div',      7, 'string', 0);
