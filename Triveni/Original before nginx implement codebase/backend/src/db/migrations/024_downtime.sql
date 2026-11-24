-- Downtime tracking: a manageable master list of reasons (like Machines/Shifts), and a log of
-- actual downtime events per machine. Starting downtime opens a row with started_at set and
-- ended_at NULL; only one such "active" (ended_at IS NULL) row may exist per machine at a time -
-- enforced in application code, not a DB constraint, since MariaDB has no partial/filtered unique
-- index to express "unique while ended_at IS NULL".

CREATE TABLE IF NOT EXISTS downtime_reasons (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reason_name VARCHAR(100) NOT NULL,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_by  INT UNSIGNED NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by  INT UNSIGNED NULL,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_downtime_reason_name (reason_name),
  CONSTRAINT fk_dtr_created_by FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_dtr_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS downtime_logs (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  machine_id  INT UNSIGNED NOT NULL,
  reason_id   INT UNSIGNED NOT NULL,
  started_at  DATETIME NOT NULL,
  ended_at    DATETIME NULL,
  started_by  INT UNSIGNED NULL,
  ended_by    INT UNSIGNED NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_dtl_machine FOREIGN KEY (machine_id) REFERENCES machines(id),
  CONSTRAINT fk_dtl_reason FOREIGN KEY (reason_id) REFERENCES downtime_reasons(id),
  CONSTRAINT fk_dtl_started_by FOREIGN KEY (started_by) REFERENCES users(id),
  CONSTRAINT fk_dtl_ended_by FOREIGN KEY (ended_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_dtl_machine_active ON downtime_logs(machine_id, ended_at);

-- A standard starting set of reasons so the operator app's dropdown isn't empty on day one -
-- editable/extendable afterwards from the Downtime Reasons master screen.
INSERT INTO downtime_reasons (reason_name) VALUES
  ('Machine Breakdown'),
  ('Material Shortage'),
  ('Changeover / Setup'),
  ('Planned Maintenance'),
  ('Power Outage'),
  ('Quality Issue'),
  ('Other');
