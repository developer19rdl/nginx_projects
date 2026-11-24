-- Simplified Production Order / Machine Planning model.
-- One Excel upload = one Production_Order (master). Every data row in the file
-- becomes one Machine_Planning (detail) row under that order, initially unassigned
-- to any machine. A planner later assigns detail rows to a machine on the Machine
-- Planning screen; assignment appends the row to that machine's cumulative queue
-- and computes which 440-minute "shift window" it falls into.

CREATE TABLE IF NOT EXISTS production_order_no_sequences (
  sequence_date DATE PRIMARY KEY COMMENT 'system upload date, NOT the manually-entered order_date',
  last_number   INT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- One row per calendar date (server "today" at upload time), locked with SELECT ... FOR UPDATE
-- so concurrent uploads on the same day never produce duplicate order numbers.

CREATE TABLE IF NOT EXISTS production_order_priority_sequence (
  id            TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
  last_priority INT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- Single global counter: every new Production_Order gets priority = last_priority + 1
-- ("previous priority + 1"), regardless of order_date.
INSERT INTO production_order_priority_sequence (id, last_priority)
VALUES (1, 0)
ON DUPLICATE KEY UPDATE id = id;

CREATE TABLE IF NOT EXISTS production_order (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_no         VARCHAR(30)  NOT NULL,
  order_date       DATE NOT NULL COMMENT 'entered manually by the uploader at confirm time',
  priority         INT UNSIGNED NOT NULL COMMENT 'auto-assigned: previous order''s priority + 1',
  source_file_name VARCHAR(255) NULL,
  total_rows       INT UNSIGNED NOT NULL DEFAULT 0,
  total_quantity   DECIMAL(14,2) NOT NULL DEFAULT 0,
  status ENUM('Imported','Assigning','Assigned','Cancelled') NOT NULL DEFAULT 'Imported',
  created_by  INT UNSIGNED NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by  INT UNSIGNED NULL,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_production_order_no (order_no),
  CONSTRAINT fk_po_created_by FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_po_priority ON production_order(priority);
CREATE INDEX idx_po_order_date ON production_order(order_date);
CREATE INDEX idx_po_status ON production_order(status);
CREATE INDEX idx_po_created_at ON production_order(created_at);

CREATE TABLE IF NOT EXISTS machine_planning (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id         INT UNSIGNED NOT NULL,
  customer_name    VARCHAR(150) NOT NULL,
  item_id          INT UNSIGNED NOT NULL,
  product_type     VARCHAR(50)  NULL,
  size             VARCHAR(50)  NULL,
  lot_no           VARCHAR(50)  NULL,
  quantity         DECIMAL(14,2) NOT NULL,
  required_minutes DECIMAL(10,2) NOT NULL COMMENT 'Excel "Required Hours" column, stored as minutes',
  machine_id       INT UNSIGNED NULL COMMENT 'assigned later on the Machine Planning screen',
  sequence_no      INT UNSIGNED NULL COMMENT '1-based position within machine_id''s queue',
  start_minute     DECIMAL(12,2) NULL COMMENT 'cumulative offset within the machine queue',
  end_minute       DECIMAL(12,2) NULL,
  shift_no         INT UNSIGNED NULL COMMENT 'floor(start_minute/440)+1 -> 1=Shift A, 2=Shift B, ...',
  source_row_no    INT UNSIGNED NULL COMMENT 'original Excel row number, for traceability',
  status ENUM('Unassigned','Assigned') NOT NULL DEFAULT 'Unassigned',
  assigned_by  INT UNSIGNED NULL,
  assigned_at  DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_mpd_order FOREIGN KEY (order_id) REFERENCES production_order(id) ON DELETE CASCADE,
  CONSTRAINT fk_mpd_item FOREIGN KEY (item_id) REFERENCES items(id),
  CONSTRAINT fk_mpd_machine FOREIGN KEY (machine_id) REFERENCES machines(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_mpd_order ON machine_planning(order_id);
CREATE INDEX idx_mpd_machine_seq ON machine_planning(machine_id, sequence_no);
CREATE INDEX idx_mpd_machine_shift ON machine_planning(machine_id, shift_no);
CREATE INDEX idx_mpd_item ON machine_planning(item_id);
CREATE INDEX idx_mpd_status ON machine_planning(status);

CREATE TABLE IF NOT EXISTS production_order_imports (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id            INT UNSIGNED NULL COMMENT 'set once the order is actually created on confirm',
  file_name           VARCHAR(255) NOT NULL,
  file_size_bytes     INT UNSIGNED NULL,
  total_rows          INT UNSIGNED NOT NULL DEFAULT 0,
  valid_rows          INT UNSIGNED NOT NULL DEFAULT 0,
  invalid_rows        INT UNSIGNED NOT NULL DEFAULT 0,
  imported_rows       INT UNSIGNED NOT NULL DEFAULT 0,
  failed_rows         INT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('Validating','Validated','ValidationFailed','Importing','Completed','Failed') NOT NULL DEFAULT 'Validating',
  staged_payload_path VARCHAR(500) NULL,
  uploaded_by  INT UNSIGNED NULL,
  uploaded_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  CONSTRAINT fk_poimport_order FOREIGN KEY (order_id) REFERENCES production_order(id),
  CONSTRAINT fk_poimport_user FOREIGN KEY (uploaded_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_poimport_status ON production_order_imports(status);
CREATE INDEX idx_poimport_uploaded_at ON production_order_imports(uploaded_at);

CREATE TABLE IF NOT EXISTS production_order_import_errors (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  import_id     INT UNSIGNED NOT NULL,
  row_no        INT UNSIGNED NOT NULL,
  column_name   VARCHAR(100) NULL,
  error_message VARCHAR(500) NOT NULL,
  raw_data      JSON NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_poie_import FOREIGN KEY (import_id) REFERENCES production_order_imports(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_poie_import ON production_order_import_errors(import_id);

-- Replace the Excel column mapping for the (now simplified) Production Order template.
DELETE FROM excel_column_mappings WHERE template_code = 'PRODUCTION_PLAN';

INSERT INTO excel_column_mappings (template_code, field_key, column_header, display_order, data_type, is_required) VALUES
  ('PRODUCTION_PLAN', 'customer_name',     'Customer Name',    1, 'string', 1),
  ('PRODUCTION_PLAN', 'item_code',         'Item Code',        2, 'string', 1),
  ('PRODUCTION_PLAN', 'item_name',         'Item Name',        3, 'string', 0),
  ('PRODUCTION_PLAN', 'product_type',      'Product Type',     4, 'string', 0),
  ('PRODUCTION_PLAN', 'size',              'Size',             5, 'string', 0),
  ('PRODUCTION_PLAN', 'lot_no',            'Lot No',           6, 'string', 0),
  ('PRODUCTION_PLAN', 'quantity',          'Quantity',         7, 'number', 1),
  ('PRODUCTION_PLAN', 'required_minutes',  'Required Hours',   8, 'number', 1);
