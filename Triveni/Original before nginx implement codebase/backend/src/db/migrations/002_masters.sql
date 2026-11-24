-- Item / Customer master data

CREATE TABLE IF NOT EXISTS customers (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_code VARCHAR(50)  NOT NULL,
  customer_name VARCHAR(150) NOT NULL,
  contact_person VARCHAR(100) NULL,
  phone         VARCHAR(30)  NULL,
  email         VARCHAR(150) NULL,
  address       VARCHAR(255) NULL,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_customers_code (customer_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS items (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  item_code          VARCHAR(50)  NOT NULL,
  item_name          VARCHAR(150) NOT NULL,
  uom                VARCHAR(20)  NOT NULL DEFAULT 'PCS',
  item_group         VARCHAR(50)  NULL,
  default_production_rate DECIMAL(12,2) NULL COMMENT 'units per hour, fallback if machine mapping has none',
  is_active          TINYINT(1)   NOT NULL DEFAULT 1,
  created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_items_code (item_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_items_item_code ON items(item_code);

CREATE TABLE IF NOT EXISTS operators (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  operator_code VARCHAR(50)  NOT NULL,
  full_name     VARCHAR(150) NOT NULL,
  skill_group   VARCHAR(50)  NULL,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_operators_code (operator_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
