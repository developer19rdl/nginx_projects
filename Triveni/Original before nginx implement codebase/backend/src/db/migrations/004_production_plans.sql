-- Production Plan (Order Plan) header + line items + sequence generator

CREATE TABLE IF NOT EXISTS order_plan_sequences (
  plan_date   DATE PRIMARY KEY,
  last_number INT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- One row per calendar date. Number generation locks the row (SELECT ... FOR UPDATE)
-- inside a transaction so concurrent uploads on the same day never collide.

CREATE TABLE IF NOT EXISTS production_plans (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_plan_no      VARCHAR(30)  NOT NULL,
  plan_date          DATE NOT NULL,
  source_file_name   VARCHAR(255) NULL,
  total_orders       INT UNSIGNED NOT NULL DEFAULT 0,
  total_items        INT UNSIGNED NOT NULL DEFAULT 0,
  total_quantity     DECIMAL(14,2) NOT NULL DEFAULT 0,
  planned_quantity   DECIMAL(14,2) NOT NULL DEFAULT 0,
  remaining_quantity DECIMAL(14,2) NOT NULL DEFAULT 0,
  status ENUM(
    'Draft','Imported','Pending Planning','Partially Planned',
    'Planned','Confirmed','In Production','Completed','Cancelled'
  ) NOT NULL DEFAULT 'Draft',
  created_by  INT UNSIGNED NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by  INT UNSIGNED NULL,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_production_plans_order_plan_no (order_plan_no),
  CONSTRAINT fk_pp_created_by FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_pp_status ON production_plans(status);
CREATE INDEX idx_pp_plan_date ON production_plans(plan_date);
CREATE INDEX idx_pp_created_at ON production_plans(created_at);

-- Item-level rollup per plan (used by list/summary screens without re-aggregating orders every time)
CREATE TABLE IF NOT EXISTS production_plan_items (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  production_plan_id INT UNSIGNED NOT NULL,
  item_id            INT UNSIGNED NOT NULL,
  required_quantity  DECIMAL(14,2) NOT NULL DEFAULT 0,
  planned_quantity   DECIMAL(14,2) NOT NULL DEFAULT 0,
  remaining_quantity DECIMAL(14,2) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_plan_item (production_plan_id, item_id),
  CONSTRAINT fk_ppi_plan FOREIGN KEY (production_plan_id) REFERENCES production_plans(id) ON DELETE CASCADE,
  CONSTRAINT fk_ppi_item FOREIGN KEY (item_id) REFERENCES items(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_ppi_item ON production_plan_items(item_id);

-- Individual order lines imported from Excel (one row per Excel data row)
CREATE TABLE IF NOT EXISTS production_orders (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  production_plan_id  INT UNSIGNED NOT NULL,
  order_number        VARCHAR(50)  NOT NULL,
  item_id             INT UNSIGNED NOT NULL,
  customer_id         INT UNSIGNED NULL,
  required_quantity   DECIMAL(14,2) NOT NULL,
  planned_quantity    DECIMAL(14,2) NOT NULL DEFAULT 0,
  remaining_quantity  DECIMAL(14,2) NOT NULL,
  uom                 VARCHAR(20) NOT NULL,
  required_date       DATE NOT NULL,
  priority             ENUM('Low','Medium','High','Urgent') NOT NULL DEFAULT 'Medium',
  order_priority_rank  INT UNSIGNED NULL COMMENT 'lower = higher priority, from Excel if provided',
  machine_group_id    INT UNSIGNED NULL,
  production_type     VARCHAR(50) NULL,
  remarks              VARCHAR(500) NULL,
  status ENUM('Pending','Partial','Planned','In Production','Completed','Cancelled') NOT NULL DEFAULT 'Pending',
  source_row_no       INT UNSIGNED NULL COMMENT 'original Excel row number, for traceability',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_plan_order_item (production_plan_id, order_number, item_id),
  CONSTRAINT fk_po_plan FOREIGN KEY (production_plan_id) REFERENCES production_plans(id) ON DELETE CASCADE,
  CONSTRAINT fk_po_item FOREIGN KEY (item_id) REFERENCES items(id),
  CONSTRAINT fk_po_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
  CONSTRAINT fk_po_machine_group FOREIGN KEY (machine_group_id) REFERENCES machine_groups(id),
  CONSTRAINT chk_po_planned_le_required CHECK (planned_quantity <= required_quantity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_po_plan ON production_orders(production_plan_id);
CREATE INDEX idx_po_item ON production_orders(item_id);
CREATE INDEX idx_po_status ON production_orders(status);
CREATE INDEX idx_po_required_date ON production_orders(required_date);
CREATE INDEX idx_po_order_number ON production_orders(order_number);
