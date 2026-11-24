-- Checklist redesign: replaces the flat single-list-of-items model (migration 025) with named,
-- reusable templates that can be assigned to one or more machines, each with typed questions
-- (Yes/No, OK/Not OK, Pass/Fail, Value, Text, Dropdown, Checkbox) and a Daily/Weekly/Monthly
-- frequency. Shift is dropped entirely from checklists - submissions are scoped by Machine+Date
-- only. Only this session's own throwaway test data existed under the old schema, so it is
-- dropped rather than migrated.

DROP TABLE IF EXISTS checklist_submission_items;
DROP TABLE IF EXISTS checklist_submissions;
DROP TABLE IF EXISTS checklist_items;

CREATE TABLE checklist_templates (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  department  VARCHAR(100) NULL,
  frequency   ENUM('DAILY','WEEKLY','MONTHLY') NOT NULL,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_by  INT UNSIGNED NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by  INT UNSIGNED NULL,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_checklist_template_title (title),
  CONSTRAINT fk_ct_created_by FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_ct_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE checklist_template_questions (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  template_id      INT UNSIGNED NOT NULL,
  display_order    INT UNSIGNED NOT NULL DEFAULT 0,
  question_text    VARCHAR(300) NOT NULL,
  response_type    ENUM('YES_NO','OK_NOT_OK','PASS_FAIL','VALUE','TEXT','DROPDOWN','CHECKBOX') NOT NULL,
  dropdown_options JSON NULL COMMENT 'array of option strings - only meaningful when response_type=DROPDOWN',
  is_mandatory     TINYINT(1) NOT NULL DEFAULT 1,
  is_active        TINYINT(1) NOT NULL DEFAULT 1,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ctq_template FOREIGN KEY (template_id) REFERENCES checklist_templates(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_ctq_template ON checklist_template_questions(template_id, display_order);

CREATE TABLE checklist_machine_assignments (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  template_id INT UNSIGNED NOT NULL,
  machine_id  INT UNSIGNED NOT NULL,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_by  INT UNSIGNED NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by  INT UNSIGNED NULL,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cma_template_machine (template_id, machine_id),
  CONSTRAINT fk_cma_template FOREIGN KEY (template_id) REFERENCES checklist_templates(id),
  CONSTRAINT fk_cma_machine FOREIGN KEY (machine_id) REFERENCES machines(id),
  CONSTRAINT fk_cma_created_by FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_cma_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE checklist_submissions (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  template_id     INT UNSIGNED NOT NULL,
  machine_id      INT UNSIGNED NOT NULL,
  schedule_date   DATE NOT NULL,
  period_key      VARCHAR(20) NOT NULL COMMENT 'DAILY=YYYY-MM-DD, WEEKLY=GGGG-Www, MONTHLY=YYYY-MM',
  overall_status  ENUM('OK','NOT_OK') NOT NULL,
  inspector_id    INT UNSIGNED NULL,
  supervisor_name VARCHAR(150) NULL,
  comments        VARCHAR(500) NULL,
  submitted_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_checklist_submission (template_id, machine_id, period_key),
  CONSTRAINT fk_cs_template FOREIGN KEY (template_id) REFERENCES checklist_templates(id),
  CONSTRAINT fk_cs_machine FOREIGN KEY (machine_id) REFERENCES machines(id),
  CONSTRAINT fk_cs_inspector FOREIGN KEY (inspector_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE checklist_submission_responses (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  submission_id INT UNSIGNED NOT NULL,
  question_id   INT UNSIGNED NOT NULL,
  response_value VARCHAR(255) NULL,
  remarks       VARCHAR(500) NULL,
  CONSTRAINT fk_csr_submission FOREIGN KEY (submission_id) REFERENCES checklist_submissions(id) ON DELETE CASCADE,
  CONSTRAINT fk_csr_question FOREIGN KEY (question_id) REFERENCES checklist_template_questions(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_csr_submission ON checklist_submission_responses(submission_id);
