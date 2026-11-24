-- Machine, Machine Group, Machine-Item compatibility, Shift masters

CREATE TABLE IF NOT EXISTS machine_groups (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  group_code  VARCHAR(50)  NOT NULL,
  group_name  VARCHAR(150) NOT NULL,
  description VARCHAR(255) NULL,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_machine_group_code (group_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS machines (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  machine_code      VARCHAR(50)  NOT NULL,
  machine_name      VARCHAR(150) NOT NULL,
  machine_group_id  INT UNSIGNED NOT NULL,
  machine_type      VARCHAR(50)  NULL,
  production_rate   DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT 'default units per hour',
  capacity_per_day  DECIMAL(12,2) NULL,
  location          VARCHAR(150) NULL,
  status            ENUM('Available','Running','Maintenance','Breakdown','Inactive') NOT NULL DEFAULT 'Available',
  is_active         TINYINT(1)   NOT NULL DEFAULT 1,
  created_by        INT UNSIGNED NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by        INT UNSIGNED NULL,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_machines_code (machine_code),
  CONSTRAINT fk_machines_group FOREIGN KEY (machine_group_id) REFERENCES machine_groups(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_machines_status ON machines(status);
CREATE INDEX idx_machines_group ON machines(machine_group_id);

CREATE TABLE IF NOT EXISTS machine_item_mapping (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  machine_id        INT UNSIGNED NOT NULL,
  item_id           INT UNSIGNED NOT NULL,
  production_rate_override DECIMAL(12,2) NULL COMMENT 'overrides machine.production_rate for this item',
  is_active         TINYINT(1)   NOT NULL DEFAULT 1,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_machine_item (machine_id, item_id),
  CONSTRAINT fk_mim_machine FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE,
  CONSTRAINT fk_mim_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_mim_item ON machine_item_mapping(item_id);

CREATE TABLE IF NOT EXISTS shifts (
  id                     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  shift_code             VARCHAR(20)  NOT NULL,
  shift_name             VARCHAR(100) NOT NULL,
  start_time             TIME NOT NULL,
  end_time               TIME NOT NULL,
  crosses_midnight       TINYINT(1) NOT NULL DEFAULT 0,
  break_duration_minutes INT UNSIGNED NOT NULL DEFAULT 0,
  total_working_hours    DECIMAL(5,2) NOT NULL,
  is_active              TINYINT(1) NOT NULL DEFAULT 1,
  created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_shifts_code (shift_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS machine_maintenance (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  machine_id    INT UNSIGNED NOT NULL,
  start_datetime DATETIME NOT NULL,
  end_datetime   DATETIME NOT NULL,
  reason        VARCHAR(255) NULL,
  status        ENUM('Scheduled','Ongoing','Completed','Cancelled') NOT NULL DEFAULT 'Scheduled',
  created_by    INT UNSIGNED NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_maint_machine FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_maint_machine_window ON machine_maintenance(machine_id, start_datetime, end_datetime);

CREATE TABLE IF NOT EXISTS machine_breakdowns (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  machine_id    INT UNSIGNED NOT NULL,
  start_datetime DATETIME NOT NULL,
  end_datetime   DATETIME NULL COMMENT 'NULL while breakdown ongoing',
  reason        VARCHAR(255) NULL,
  reported_by   INT UNSIGNED NULL,
  status        ENUM('Open','Resolved') NOT NULL DEFAULT 'Open',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_breakdown_machine FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_breakdown_machine_window ON machine_breakdowns(machine_id, start_datetime, end_datetime);
