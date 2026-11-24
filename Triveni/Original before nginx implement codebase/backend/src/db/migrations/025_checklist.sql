-- Shift checklist: a manageable master list of items (like Downtime Reasons), and one submission
-- per Machine + Date + Shift recording an OK/Not OK/N-A response (+ optional remark) per item.
-- A submission is a sign-off record once created - there is no update endpoint, matching the
-- "locked after submit" behaviour agreed for this feature.

CREATE TABLE IF NOT EXISTS checklist_items (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  item_text     VARCHAR(200) NOT NULL,
  display_order INT UNSIGNED NOT NULL DEFAULT 0,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_by    INT UNSIGNED NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by    INT UNSIGNED NULL,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_checklist_item_text (item_text),
  CONSTRAINT fk_ci_created_by FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_ci_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS checklist_submissions (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  machine_id    INT UNSIGNED NOT NULL,
  shift_id      INT UNSIGNED NOT NULL,
  schedule_date DATE NOT NULL,
  submitted_by  INT UNSIGNED NULL,
  submitted_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_checklist_submission (machine_id, shift_id, schedule_date),
  CONSTRAINT fk_cs_machine FOREIGN KEY (machine_id) REFERENCES machines(id),
  CONSTRAINT fk_cs_shift FOREIGN KEY (shift_id) REFERENCES shifts(id),
  CONSTRAINT fk_cs_submitted_by FOREIGN KEY (submitted_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS checklist_submission_items (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  submission_id     INT UNSIGNED NOT NULL,
  checklist_item_id INT UNSIGNED NOT NULL,
  response          ENUM('OK','NOT_OK','NA') NOT NULL,
  remarks           VARCHAR(500) NULL,
  CONSTRAINT fk_csi_submission FOREIGN KEY (submission_id) REFERENCES checklist_submissions(id) ON DELETE CASCADE,
  CONSTRAINT fk_csi_item FOREIGN KEY (checklist_item_id) REFERENCES checklist_items(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_csi_submission ON checklist_submission_items(submission_id);

-- A standard starting set so the operator app's checklist isn't empty on day one - editable/
-- extendable afterwards from the Checklist Items master screen.
INSERT INTO checklist_items (item_text, display_order) VALUES
  ('Machine guards in place', 1),
  ('Oil / coolant level checked', 2),
  ('Emergency stop tested', 3),
  ('Work area clean (5S)', 4),
  ('PPE worn', 5);
