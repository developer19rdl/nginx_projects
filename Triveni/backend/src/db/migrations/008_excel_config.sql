-- Configurable Excel column mapping for the Production Plan import template,
-- so column headers/order can change without redeploying code.

CREATE TABLE IF NOT EXISTS excel_column_mappings (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  template_code VARCHAR(50) NOT NULL DEFAULT 'PRODUCTION_PLAN',
  field_key     VARCHAR(50) NOT NULL COMMENT 'internal field name, e.g. item_code',
  column_header VARCHAR(100) NOT NULL COMMENT 'expected Excel header text',
  display_order INT UNSIGNED NOT NULL DEFAULT 0,
  data_type     ENUM('string','number','date','enum') NOT NULL DEFAULT 'string',
  is_required   TINYINT(1) NOT NULL DEFAULT 1,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_template_field (template_code, field_key),
  UNIQUE KEY uq_template_header (template_code, column_header)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO excel_column_mappings (template_code, field_key, column_header, display_order, data_type, is_required) VALUES
  ('PRODUCTION_PLAN', 'order_number',      'Order Number',       1, 'string', 1),
  ('PRODUCTION_PLAN', 'item_code',         'Item Code',          2, 'string', 1),
  ('PRODUCTION_PLAN', 'item_name',         'Item Name',          3, 'string', 0),
  ('PRODUCTION_PLAN', 'customer_code',     'Customer',           4, 'string', 0),
  ('PRODUCTION_PLAN', 'required_quantity', 'Required Quantity',  5, 'number', 1),
  ('PRODUCTION_PLAN', 'uom',               'UOM',                6, 'string', 0),
  ('PRODUCTION_PLAN', 'required_date',     'Required Date',      7, 'date',   1),
  ('PRODUCTION_PLAN', 'priority',          'Priority',           8, 'enum',   0),
  ('PRODUCTION_PLAN', 'machine_group_code','Machine Group',      9, 'string', 0),
  ('PRODUCTION_PLAN', 'production_type',   'Production Type',   10, 'string', 0),
  ('PRODUCTION_PLAN', 'remarks',           'Remarks',           11, 'string', 0)
ON DUPLICATE KEY UPDATE column_header = VALUES(column_header);
