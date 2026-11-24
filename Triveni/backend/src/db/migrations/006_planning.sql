-- Machine/Shift allocation, machine planning (draft) and production schedule (confirmed)

CREATE TABLE IF NOT EXISTS machine_shift_allocations (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  machine_id        INT UNSIGNED NOT NULL,
  shift_id          INT UNSIGNED NOT NULL,
  allocation_date   DATE NOT NULL,
  operator_id       INT UNSIGNED NULL,
  available_hours   DECIMAL(5,2) NOT NULL,
  status ENUM('Available','Blocked','Maintenance') NOT NULL DEFAULT 'Available',
  remarks           VARCHAR(255) NULL,
  created_by INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by INT UNSIGNED NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_machine_shift_date (machine_id, shift_id, allocation_date),
  CONSTRAINT fk_msa_machine FOREIGN KEY (machine_id) REFERENCES machines(id),
  CONSTRAINT fk_msa_shift FOREIGN KEY (shift_id) REFERENCES shifts(id),
  CONSTRAINT fk_msa_operator FOREIGN KEY (operator_id) REFERENCES operators(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_msa_date ON machine_shift_allocations(allocation_date);
CREATE INDEX idx_msa_machine ON machine_shift_allocations(machine_id);
CREATE INDEX idx_msa_shift ON machine_shift_allocations(shift_id);

-- Working / draft allocations produced by Auto-Plan or manual edits, before confirmation.
CREATE TABLE IF NOT EXISTS machine_plans (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  production_plan_id  INT UNSIGNED NOT NULL,
  production_order_id INT UNSIGNED NOT NULL,
  machine_id          INT UNSIGNED NOT NULL,
  shift_id            INT UNSIGNED NOT NULL,
  plan_date           DATE NOT NULL,
  planned_quantity    DECIMAL(14,2) NOT NULL,
  production_rate     DECIMAL(12,2) NOT NULL,
  required_hours      DECIMAL(6,2) NOT NULL,
  start_time          DATETIME NOT NULL,
  end_time            DATETIME NOT NULL,
  sequence_no         INT UNSIGNED NOT NULL DEFAULT 1,
  plan_source         ENUM('Auto','Manual') NOT NULL DEFAULT 'Auto',
  status ENUM('Draft','Validated','Confirmed','Cancelled') NOT NULL DEFAULT 'Draft',
  created_by INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by INT UNSIGNED NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_mp_plan FOREIGN KEY (production_plan_id) REFERENCES production_plans(id) ON DELETE CASCADE,
  CONSTRAINT fk_mp_order FOREIGN KEY (production_order_id) REFERENCES production_orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_mp_machine FOREIGN KEY (machine_id) REFERENCES machines(id),
  CONSTRAINT fk_mp_shift FOREIGN KEY (shift_id) REFERENCES shifts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_mp_machine_date ON machine_plans(machine_id, plan_date);
CREATE INDEX idx_mp_shift ON machine_plans(shift_id);
CREATE INDEX idx_mp_order ON machine_plans(production_order_id);
CREATE INDEX idx_mp_plan ON machine_plans(production_plan_id);
CREATE INDEX idx_mp_status ON machine_plans(status);
CREATE INDEX idx_mp_production_date ON machine_plans(plan_date);

-- Confirmed, locked schedule - created from machine_plans rows on "Confirm Planning".
CREATE TABLE IF NOT EXISTS production_schedule (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  machine_plan_id INT UNSIGNED NOT NULL,
  production_order_id INT UNSIGNED NOT NULL,
  machine_id      INT UNSIGNED NOT NULL,
  shift_id        INT UNSIGNED NOT NULL,
  plan_date       DATE NOT NULL,
  scheduled_quantity DECIMAL(14,2) NOT NULL,
  start_time      DATETIME NOT NULL,
  end_time        DATETIME NOT NULL,
  status ENUM('Confirmed','In Production','Completed','Cancelled') NOT NULL DEFAULT 'Confirmed',
  confirmed_by INT UNSIGNED NULL,
  confirmed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_schedule_machine_plan (machine_plan_id),
  CONSTRAINT fk_ps_machine_plan FOREIGN KEY (machine_plan_id) REFERENCES machine_plans(id),
  CONSTRAINT fk_ps_order FOREIGN KEY (production_order_id) REFERENCES production_orders(id),
  CONSTRAINT fk_ps_machine FOREIGN KEY (machine_id) REFERENCES machines(id),
  CONSTRAINT fk_ps_shift FOREIGN KEY (shift_id) REFERENCES shifts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_psched_machine_date ON production_schedule(machine_id, plan_date);
CREATE INDEX idx_psched_status ON production_schedule(status);
CREATE INDEX idx_psched_shift ON production_schedule(shift_id);
