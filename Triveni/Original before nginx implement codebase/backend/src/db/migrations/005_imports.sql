-- Excel import tracking

CREATE TABLE IF NOT EXISTS production_plan_imports (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  production_plan_id  INT UNSIGNED NULL COMMENT 'set once the plan is actually created on confirm',
  file_name           VARCHAR(255) NOT NULL,
  file_size_bytes     INT UNSIGNED NULL,
  total_rows          INT UNSIGNED NOT NULL DEFAULT 0,
  valid_rows          INT UNSIGNED NOT NULL DEFAULT 0,
  invalid_rows        INT UNSIGNED NOT NULL DEFAULT 0,
  imported_rows       INT UNSIGNED NOT NULL DEFAULT 0,
  failed_rows         INT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('Validating','Validated','ValidationFailed','Importing','Completed','Failed') NOT NULL DEFAULT 'Validating',
  staged_payload_path VARCHAR(500) NULL COMMENT 'temp JSON of validated rows awaiting confirm-import',
  uploaded_by  INT UNSIGNED NULL,
  uploaded_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  CONSTRAINT fk_ppimport_plan FOREIGN KEY (production_plan_id) REFERENCES production_plans(id),
  CONSTRAINT fk_ppimport_user FOREIGN KEY (uploaded_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_ppimport_status ON production_plan_imports(status);
CREATE INDEX idx_ppimport_created_at ON production_plan_imports(uploaded_at);

CREATE TABLE IF NOT EXISTS production_plan_import_errors (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  import_id     INT UNSIGNED NOT NULL,
  row_no        INT UNSIGNED NOT NULL,
  column_name   VARCHAR(100) NULL,
  error_message VARCHAR(500) NOT NULL,
  raw_data      JSON NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ppie_import FOREIGN KEY (import_id) REFERENCES production_plan_imports(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_ppie_import ON production_plan_import_errors(import_id);
