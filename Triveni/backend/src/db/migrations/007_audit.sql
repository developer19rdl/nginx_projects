-- Audit trail

CREATE TABLE IF NOT EXISTS audit_logs (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NULL,
  action      VARCHAR(50)  NOT NULL COMMENT 'CREATE, UPDATE, DELETE, IMPORT, CONFIRM, CANCEL, LOGIN, etc.',
  module      VARCHAR(50)  NOT NULL,
  record_id   VARCHAR(50)  NULL,
  old_value   JSON NULL,
  new_value   JSON NULL,
  remarks     VARCHAR(500) NULL,
  ip_address  VARCHAR(45)  NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_audit_module_record ON audit_logs(module, record_id);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
