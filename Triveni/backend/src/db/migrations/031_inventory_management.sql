-- Inventory Management (Phase 1): real Warehouse/Location modeling, a maintained Finished Goods
-- balance (Available/Reserved/Hold), and a generalized transaction ledger that supersedes the
-- old receipt-only inventory_stock_ledger - see the "Inventory Management - Quality-to-Store
-- Integration" plan. Quality's decision/release flow (qualityInspection.service.js) is extended
-- to snapshot Size, capture a Rework quantity, and post through this new ledger.

-- 1. Quality Inspections gets the two fields it was missing for this integration -----------------

ALTER TABLE quality_inspections
  ADD COLUMN size VARCHAR(50) NOT NULL DEFAULT '' AFTER item_code,
  ADD COLUMN quantity_rework DECIMAL(14,2) NULL AFTER quantity_accepted;

-- Backfill size for existing reports from their source machine_planning row - the same
-- denormalized-snapshot reasoning already used for item_code/lot_no/etc.
UPDATE quality_inspections qi
JOIN machine_planning mp ON mp.id = qi.machine_planning_id
SET qi.size = COALESCE(mp.size, '')
WHERE qi.size = '';

ALTER TABLE quality_inspections
  MODIFY COLUMN status ENUM('UNDER_INSPECTION','APPROVED','APPROVED_WITH_DEVIATION','PARTIALLY_ACCEPTED','REWORK_REQUIRED','REJECTED','HOLD')
    NOT NULL DEFAULT 'UNDER_INSPECTION';

-- 2. Warehouse / Location masters -----------------------------------------------------------------

CREATE TABLE warehouses (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  warehouse_code VARCHAR(30)  NOT NULL,
  warehouse_name VARCHAR(150) NOT NULL,
  is_active      TINYINT(1)   NOT NULL DEFAULT 1,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_warehouse_code (warehouse_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE warehouse_locations (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  warehouse_id  INT UNSIGNED NOT NULL,
  location_code VARCHAR(50)  NOT NULL,
  location_name VARCHAR(150) NULL,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_wl_code (warehouse_id, location_code),
  CONSTRAINT fk_wl_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO warehouses (warehouse_code, warehouse_name) VALUES ('FG', 'Finished Goods Warehouse');
INSERT INTO warehouse_locations (warehouse_id, location_code, location_name)
  SELECT id, 'DEFAULT', 'Default Location' FROM warehouses WHERE warehouse_code = 'FG';

-- 3. Finished Goods balance - maintained (not just computed from the ledger) so Available/
--    Reserved/Hold can be checked and updated atomically under a row lock. Rework/Rejected
--    quantities are deliberately NOT tracked here - they must stay out of FG stock and are
--    already captured on quality_inspections itself. -------------------------------------------

CREATE TABLE finished_goods_inventory (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  item_code     VARCHAR(100) NOT NULL,
  size          VARCHAR(50)  NOT NULL DEFAULT '',
  lot_no        VARCHAR(50)  NOT NULL DEFAULT '' COMMENT '\'\' = pooled/non-batch-tracked stock',
  warehouse_id  INT UNSIGNED NOT NULL,
  location_id   INT UNSIGNED NOT NULL,
  available_qty DECIMAL(14,2) NOT NULL DEFAULT 0,
  reserved_qty  DECIMAL(14,2) NOT NULL DEFAULT 0,
  hold_qty      DECIMAL(14,2) NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_fgi_key (item_code, size, lot_no, warehouse_id, location_id),
  CONSTRAINT chk_fgi_available CHECK (available_qty >= 0),
  CONSTRAINT chk_fgi_reserved CHECK (reserved_qty >= 0),
  CONSTRAINT chk_fgi_hold CHECK (hold_qty >= 0),
  CONSTRAINT fk_fgi_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
  CONSTRAINT fk_fgi_location FOREIGN KEY (location_id) REFERENCES warehouse_locations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_fgi_item ON finished_goods_inventory(item_code, size);

-- 4. Generalized transaction ledger - supersedes inventory_stock_ledger ---------------------------

CREATE TABLE inventory_transactions (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  transaction_no        VARCHAR(30) NOT NULL,
  transaction_type      ENUM('QUALITY_ACCEPTANCE','DISPATCH','TRANSFER_OUT','TRANSFER_IN','ADJUSTMENT_IN','ADJUSTMENT_OUT','HOLD','RELEASE') NOT NULL,
  item_code             VARCHAR(100) NOT NULL,
  size                  VARCHAR(50)  NOT NULL DEFAULT '',
  lot_no                VARCHAR(50)  NOT NULL DEFAULT '',
  quantity              DECIMAL(14,2) NOT NULL COMMENT 'always positive - direction is transaction_type',
  warehouse_id          INT UNSIGNED NOT NULL,
  location_id           INT UNSIGNED NOT NULL,
  production_order_id   INT UNSIGNED NULL,
  quality_inspection_id INT UNSIGNED NULL COMMENT 'the Quality Report this receipt came from, if any',
  machine_id            INT UNSIGNED NULL,
  reference_type        ENUM('QUALITY_INSPECTION','STOCK_TRANSFER','STOCK_ADJUSTMENT','STOCK_HOLD') NULL,
  reference_id          INT UNSIGNED NULL COMMENT 'points at stock_transfers/stock_adjustments/stock_holds.id',
  remarks               VARCHAR(500) NULL,
  created_by            INT UNSIGNED NULL,
  created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_it_no (transaction_no),
  -- Idempotency: at most one transaction per Quality Report. MariaDB allows unlimited NULLs in a
  -- unique key, so this only constrains QUALITY_ACCEPTANCE rows (which set this column) and never
  -- blocks dispatch/transfer/adjustment/hold rows (which leave it NULL).
  UNIQUE KEY uq_it_quality_inspection (quality_inspection_id),
  CONSTRAINT fk_it_production_order FOREIGN KEY (production_order_id) REFERENCES production_order(id),
  CONSTRAINT fk_it_quality_inspection FOREIGN KEY (quality_inspection_id) REFERENCES quality_inspections(id),
  CONSTRAINT fk_it_machine FOREIGN KEY (machine_id) REFERENCES machines(id),
  CONSTRAINT fk_it_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
  CONSTRAINT fk_it_location FOREIGN KEY (location_id) REFERENCES warehouse_locations(id),
  CONSTRAINT fk_it_created_by FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_it_item ON inventory_transactions(item_code, size, lot_no);
CREATE INDEX idx_it_type_date ON inventory_transactions(transaction_type, created_at);

-- Per-date, per-prefix numbering for every inventory document type (INV-/TRF-/ADJ-/HLD-),
-- mirroring quality_inspection_no_sequences but generalized to one shared table/generator
-- instead of four near-identical ones.
CREATE TABLE inventory_no_sequences (
  sequence_date DATE NOT NULL,
  prefix        VARCHAR(10) NOT NULL,
  last_number   INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (sequence_date, prefix)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Carry forward any existing receipts, then retire the old table.
INSERT INTO inventory_transactions
  (transaction_no, transaction_type, item_code, size, lot_no, quantity, warehouse_id, location_id,
   quality_inspection_id, created_by, created_at)
SELECT
  CONCAT('INV-LEGACY-', LPAD(isl.id, 6, '0')),
  'QUALITY_ACCEPTANCE',
  isl.item_code,
  '',
  COALESCE(isl.lot_no, ''),
  isl.quantity,
  (SELECT id FROM warehouses WHERE warehouse_code = 'FG'),
  (SELECT id FROM warehouse_locations WHERE location_code = 'DEFAULT' LIMIT 1),
  isl.inspection_id,
  isl.received_by,
  isl.received_at
FROM inventory_stock_ledger isl;

INSERT INTO finished_goods_inventory (item_code, size, lot_no, warehouse_id, location_id, available_qty)
SELECT item_code, '' , '', (SELECT id FROM warehouses WHERE warehouse_code = 'FG'),
       (SELECT id FROM warehouse_locations WHERE location_code = 'DEFAULT' LIMIT 1), SUM(quantity)
FROM inventory_stock_ledger
GROUP BY item_code
ON DUPLICATE KEY UPDATE available_qty = available_qty + VALUES(available_qty);

DROP TABLE inventory_stock_ledger;

-- 5. Stock actions: Transfer / Adjustment / Hold ---------------------------------------------------

CREATE TABLE stock_transfers (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  transfer_no         VARCHAR(30) NOT NULL,
  item_code           VARCHAR(100) NOT NULL,
  size                VARCHAR(50)  NOT NULL DEFAULT '',
  lot_no              VARCHAR(50)  NOT NULL DEFAULT '',
  quantity            DECIMAL(14,2) NOT NULL,
  from_warehouse_id   INT UNSIGNED NOT NULL,
  from_location_id    INT UNSIGNED NOT NULL,
  to_warehouse_id     INT UNSIGNED NOT NULL,
  to_location_id      INT UNSIGNED NOT NULL,
  remarks             VARCHAR(500) NULL,
  created_by          INT UNSIGNED NULL,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_transfer_no (transfer_no),
  CONSTRAINT fk_st_from_warehouse FOREIGN KEY (from_warehouse_id) REFERENCES warehouses(id),
  CONSTRAINT fk_st_from_location FOREIGN KEY (from_location_id) REFERENCES warehouse_locations(id),
  CONSTRAINT fk_st_to_warehouse FOREIGN KEY (to_warehouse_id) REFERENCES warehouses(id),
  CONSTRAINT fk_st_to_location FOREIGN KEY (to_location_id) REFERENCES warehouse_locations(id),
  CONSTRAINT fk_st_created_by FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE stock_adjustments (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  adjustment_no VARCHAR(30) NOT NULL,
  item_code     VARCHAR(100) NOT NULL,
  size          VARCHAR(50)  NOT NULL DEFAULT '',
  lot_no        VARCHAR(50)  NOT NULL DEFAULT '',
  warehouse_id  INT UNSIGNED NOT NULL,
  location_id   INT UNSIGNED NOT NULL,
  quantity      DECIMAL(14,2) NOT NULL,
  direction     ENUM('IN','OUT') NOT NULL,
  reason        VARCHAR(500) NOT NULL,
  created_by    INT UNSIGNED NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_adjustment_no (adjustment_no),
  CONSTRAINT fk_sa_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
  CONSTRAINT fk_sa_location FOREIGN KEY (location_id) REFERENCES warehouse_locations(id),
  CONSTRAINT fk_sa_created_by FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE stock_holds (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  hold_no          VARCHAR(30) NOT NULL,
  item_code        VARCHAR(100) NOT NULL,
  size             VARCHAR(50)  NOT NULL DEFAULT '',
  lot_no           VARCHAR(50)  NOT NULL DEFAULT '',
  warehouse_id     INT UNSIGNED NOT NULL,
  location_id      INT UNSIGNED NOT NULL,
  quantity         DECIMAL(14,2) NOT NULL,
  status           ENUM('ON_HOLD','RELEASED') NOT NULL DEFAULT 'ON_HOLD',
  reason           VARCHAR(500) NOT NULL,
  held_by          INT UNSIGNED NULL,
  held_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  released_by      INT UNSIGNED NULL,
  released_at      DATETIME NULL,
  release_remarks  VARCHAR(500) NULL,
  UNIQUE KEY uq_hold_no (hold_no),
  CONSTRAINT fk_sh_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
  CONSTRAINT fk_sh_location FOREIGN KEY (location_id) REFERENCES warehouse_locations(id),
  CONSTRAINT fk_sh_held_by FOREIGN KEY (held_by) REFERENCES users(id),
  CONSTRAINT fk_sh_released_by FOREIGN KEY (released_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_sh_status ON stock_holds(status);
