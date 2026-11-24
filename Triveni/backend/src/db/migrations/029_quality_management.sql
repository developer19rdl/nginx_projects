-- Quality Management module, Phase 1: inspection plans (configurable parameters per item),
-- a defect catalog, the inspection report itself (one row per machine_planning lot, reopened
-- for rework rather than duplicated), CAPA, a dedicated status-history trail, a generic
-- attachments table (first of its kind in this repo - see quality_attachments below), and a
-- minimal receipt-only inventory ledger fed only by Approved releases.
--
-- The unit of work is one machine_planning row (a lot/batch), not lot_no (no uniqueness
-- constraint exists on it) and not production_order (spans many items/lots). A "completed lot
-- pending inspection" is simply produced_qty >= quantity with no quality_inspections row yet -
-- nothing is added to machine_planning itself.

CREATE TABLE quality_inspection_plans (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  item_code       VARCHAR(100) NULL COMMENT 'NULL = generic/default plan applying to any item; a specific item_code overrides it',
  plan_name       VARCHAR(150) NOT NULL,
  inspection_type ENUM('INCOMING','IN_PROCESS','FINAL') NOT NULL,
  sample_size     INT UNSIGNED NOT NULL DEFAULT 1,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_by      INT UNSIGNED NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by      INT UNSIGNED NULL,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_qip_created_by FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_qip_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_qip_item_code ON quality_inspection_plans(item_code);

CREATE TABLE quality_inspection_plan_parameters (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plan_id            INT UNSIGNED NOT NULL,
  display_order      INT UNSIGNED NOT NULL DEFAULT 0,
  parameter_name     VARCHAR(150) NOT NULL,
  parameter_category ENUM('DIMENSION','WEIGHT','SURFACE_FINISH','VISUAL','HARDNESS','COLOR','THREAD_CHECK','FUNCTIONAL_TEST','CUSTOM') NOT NULL,
  specification      VARCHAR(200) NULL,
  tolerance          VARCHAR(100) NULL,
  unit_of_measure    VARCHAR(30) NULL,
  is_mandatory       TINYINT(1) NOT NULL DEFAULT 1,
  is_active          TINYINT(1) NOT NULL DEFAULT 1,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_qipp_plan FOREIGN KEY (plan_id) REFERENCES quality_inspection_plans(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- No cascade delete, no hard delete from the app either - a parameter is only ever
-- soft-deactivated, since quality_inspection_parameter_results references it by id and must
-- stay valid forever, same rule as checklist_template_questions.

CREATE INDEX idx_qipp_plan ON quality_inspection_plan_parameters(plan_id, display_order);

CREATE TABLE quality_defect_catalog (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  defect_code VARCHAR(30) NOT NULL,
  defect_name VARCHAR(150) NOT NULL,
  category    ENUM('CRITICAL','MAJOR','MINOR') NOT NULL,
  description VARCHAR(300) NULL,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_by  INT UNSIGNED NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by  INT UNSIGNED NULL,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_qdc_code (defect_code),
  CONSTRAINT fk_qdc_created_by FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_qdc_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Per-server-date inspection-number counter, same locked-counter-row pattern as
-- production_order_no_sequences (see productionOrderNoGenerator.js / qualityInspectionNoGenerator.js).
CREATE TABLE quality_inspection_no_sequences (
  sequence_date DATE PRIMARY KEY,
  last_number   INT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE quality_inspections (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  inspection_no        VARCHAR(30) NOT NULL,
  machine_planning_id  INT UNSIGNED NOT NULL COMMENT 'the lot/batch this report is for - one active report per lot',
  -- Denormalized snapshot of the lot as it stood when the inspection was started, so a later
  -- edit to the source machine_planning row (or a machine/operator reassignment) never rewrites
  -- this report's history - same reasoning as checklist_submissions storing its own machine_id.
  order_no             VARCHAR(30) NOT NULL,
  lot_no               VARCHAR(50) NULL,
  item_code            VARCHAR(100) NOT NULL,
  item_name            VARCHAR(150) NULL,
  customer_name        VARCHAR(150) NOT NULL,
  machine_id           INT UNSIGNED NOT NULL,
  operator_name        VARCHAR(100) NULL,
  shift_id             INT UNSIGNED NULL,
  quantity_produced    DECIMAL(14,2) NOT NULL,
  inspection_plan_id   INT UNSIGNED NULL COMMENT 'the plan matched at start time (by item_code, else the generic plan), if any',
  inspection_type      ENUM('INCOMING','IN_PROCESS','FINAL') NOT NULL,
  sample_size          INT UNSIGNED NOT NULL DEFAULT 1,
  inspection_datetime  DATETIME NOT NULL,
  inspector_id         INT UNSIGNED NULL,
  attempt_no           INT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'incremented each time a REWORK_REQUIRED report is reopened',
  status               ENUM('UNDER_INSPECTION','APPROVED','APPROVED_WITH_DEVIATION','REWORK_REQUIRED','REJECTED','HOLD') NOT NULL DEFAULT 'UNDER_INSPECTION',
  quantity_accepted    DECIMAL(14,2) NULL,
  quantity_rejected    DECIMAL(14,2) NULL,
  rejection_reason     VARCHAR(300) NULL,
  root_cause           VARCHAR(300) NULL,
  corrective_action    VARCHAR(300) NULL,
  preventive_action    VARCHAR(300) NULL,
  remarks              VARCHAR(500) NULL,
  released_to_inventory TINYINT(1) NOT NULL DEFAULT 0,
  released_at          DATETIME NULL,
  released_by          INT UNSIGNED NULL,
  created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_qi_inspection_no (inspection_no),
  UNIQUE KEY uq_qi_machine_planning (machine_planning_id),
  CONSTRAINT fk_qi_machine_planning FOREIGN KEY (machine_planning_id) REFERENCES machine_planning(id),
  CONSTRAINT fk_qi_plan FOREIGN KEY (inspection_plan_id) REFERENCES quality_inspection_plans(id),
  CONSTRAINT fk_qi_machine FOREIGN KEY (machine_id) REFERENCES machines(id),
  CONSTRAINT fk_qi_shift FOREIGN KEY (shift_id) REFERENCES shifts(id),
  CONSTRAINT fk_qi_inspector FOREIGN KEY (inspector_id) REFERENCES users(id),
  CONSTRAINT fk_qi_released_by FOREIGN KEY (released_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_qi_status ON quality_inspections(status);
CREATE INDEX idx_qi_item_code ON quality_inspections(item_code);
CREATE INDEX idx_qi_customer ON quality_inspections(customer_name);
CREATE INDEX idx_qi_machine ON quality_inspections(machine_id);
CREATE INDEX idx_qi_inspector ON quality_inspections(inspector_id);

CREATE TABLE quality_inspection_parameter_results (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  inspection_id      INT UNSIGNED NOT NULL,
  attempt_no         INT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'keeps a rework re-measurement separate from the first attempt',
  plan_parameter_id  INT UNSIGNED NULL COMMENT 'NULL for an ad-hoc parameter not from a plan',
  parameter_name     VARCHAR(150) NOT NULL,
  parameter_category ENUM('DIMENSION','WEIGHT','SURFACE_FINISH','VISUAL','HARDNESS','COLOR','THREAD_CHECK','FUNCTIONAL_TEST','CUSTOM') NOT NULL,
  specification      VARCHAR(200) NULL,
  tolerance          VARCHAR(100) NULL,
  unit_of_measure    VARCHAR(30) NULL,
  actual_value       VARCHAR(255) NULL,
  result             ENUM('PASS','FAIL') NULL,
  remarks            VARCHAR(300) NULL,
  CONSTRAINT fk_qipr_inspection FOREIGN KEY (inspection_id) REFERENCES quality_inspections(id) ON DELETE CASCADE,
  CONSTRAINT fk_qipr_plan_parameter FOREIGN KEY (plan_parameter_id) REFERENCES quality_inspection_plan_parameters(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_qipr_inspection ON quality_inspection_parameter_results(inspection_id, attempt_no);

CREATE TABLE quality_inspection_defects (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  inspection_id    INT UNSIGNED NOT NULL,
  attempt_no       INT UNSIGNED NOT NULL DEFAULT 1,
  defect_catalog_id INT UNSIGNED NOT NULL,
  quantity_rejected DECIMAL(14,2) NOT NULL,
  notes            VARCHAR(300) NULL,
  created_by       INT UNSIGNED NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_qid_inspection FOREIGN KEY (inspection_id) REFERENCES quality_inspections(id) ON DELETE CASCADE,
  CONSTRAINT fk_qid_defect FOREIGN KEY (defect_catalog_id) REFERENCES quality_defect_catalog(id),
  CONSTRAINT fk_qid_created_by FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_qid_inspection ON quality_inspection_defects(inspection_id, attempt_no);

CREATE TABLE quality_capa (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  inspection_id     INT UNSIGNED NOT NULL,
  corrective_action VARCHAR(500) NOT NULL,
  preventive_action VARCHAR(500) NULL,
  owner_id          INT UNSIGNED NULL,
  due_date          DATE NULL,
  status            ENUM('OPEN','IN_PROGRESS','CLOSED') NOT NULL DEFAULT 'OPEN',
  closed_at         DATETIME NULL,
  closed_by         INT UNSIGNED NULL,
  created_by        INT UNSIGNED NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by        INT UNSIGNED NULL,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_qcapa_inspection FOREIGN KEY (inspection_id) REFERENCES quality_inspections(id) ON DELETE CASCADE,
  CONSTRAINT fk_qcapa_owner FOREIGN KEY (owner_id) REFERENCES users(id),
  CONSTRAINT fk_qcapa_closed_by FOREIGN KEY (closed_by) REFERENCES users(id),
  CONSTRAINT fk_qcapa_created_by FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_qcapa_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- "CAPA overdue" (Phase 2) is simply status != 'CLOSED' AND due_date < CURDATE() - no extra flag.

CREATE INDEX idx_qcapa_status_due ON quality_capa(status, due_date);

CREATE TABLE quality_inspection_status_history (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  inspection_id INT UNSIGNED NOT NULL,
  from_status   VARCHAR(30) NULL,
  to_status     VARCHAR(30) NOT NULL,
  changed_by    INT UNSIGNED NULL,
  changed_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  remarks       VARCHAR(300) NULL,
  CONSTRAINT fk_qish_inspection FOREIGN KEY (inspection_id) REFERENCES quality_inspections(id) ON DELETE CASCADE,
  CONSTRAINT fk_qish_changed_by FOREIGN KEY (changed_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
-- This is the "Approval History"/"Rework History" traceability trail; audit_logs separately
-- records every mutation as usual (module 'quality_inspection' etc.), unchanged pattern.

CREATE INDEX idx_qish_inspection ON quality_inspection_status_history(inspection_id, changed_at);

-- Generic attachment store - the first of its kind in this repo. fileUpload.js's multer
-- instance is hard-locked to .xlsx/.xls, and no route anywhere serves an uploaded file back;
-- both are added fresh alongside this table (see qualityUpload.js middleware and the
-- GET /quality-attachments/:id/file route).
CREATE TABLE quality_attachments (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  entity_type     ENUM('INSPECTION','DEFECT','CAPA') NOT NULL,
  entity_id       INT UNSIGNED NOT NULL,
  attachment_type ENUM('PHOTO','TEST_CERTIFICATE','MEASUREMENT_REPORT','CALIBRATION_CERTIFICATE','OTHER') NOT NULL,
  file_name       VARCHAR(255) NOT NULL,
  file_path       VARCHAR(500) NOT NULL,
  mime_type       VARCHAR(100) NOT NULL,
  file_size_bytes INT UNSIGNED NOT NULL,
  uploaded_by     INT UNSIGNED NULL,
  uploaded_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_qatt_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_qatt_entity ON quality_attachments(entity_type, entity_id);

-- Minimal receipt-only inventory ledger - not a full inventory module. On-hand balance per item
-- is SUM(quantity) GROUP BY item_code computed on read (append-only, same convention as
-- audit_logs - no mutable balance column to drift). Exactly one row is inserted per inspection,
-- only when it is released from an Approved/Approved-with-Deviation state.
CREATE TABLE inventory_stock_ledger (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  item_code           VARCHAR(100) NOT NULL,
  quantity            DECIMAL(14,2) NOT NULL,
  source_type         ENUM('QUALITY_RELEASE') NOT NULL DEFAULT 'QUALITY_RELEASE',
  inspection_id       INT UNSIGNED NOT NULL,
  machine_planning_id INT UNSIGNED NOT NULL,
  lot_no              VARCHAR(50) NULL,
  received_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  received_by         INT UNSIGNED NULL,
  UNIQUE KEY uq_isl_inspection (inspection_id),
  CONSTRAINT fk_isl_inspection FOREIGN KEY (inspection_id) REFERENCES quality_inspections(id),
  CONSTRAINT fk_isl_machine_planning FOREIGN KEY (machine_planning_id) REFERENCES machine_planning(id),
  CONSTRAINT fk_isl_received_by FOREIGN KEY (received_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_isl_item_code ON inventory_stock_ledger(item_code);
