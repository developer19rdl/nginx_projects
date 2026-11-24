-- Adds an "Operator" column to the Production Order Excel template (right after Machine), and a
-- matching operator_name column on machine_planning to store it. Free text, same treatment as
-- Item/Priority - no operators-master validation (the Operators master exists but is currently
-- empty and unmanaged from any screen, so requiring a match against it would block every upload).

ALTER TABLE machine_planning ADD COLUMN operator_name VARCHAR(100) NULL AFTER machine_id;

-- Shift every existing PRODUCTION_PLAN column after Machine (display_order >= 2) down one slot,
-- then insert Operator at display_order 2 - i.e. immediately after Machine.
UPDATE excel_column_mappings
SET display_order = display_order + 1
WHERE template_code = 'PRODUCTION_PLAN' AND display_order >= 2;

INSERT INTO excel_column_mappings (template_code, field_key, column_header, display_order, data_type, is_required)
VALUES ('PRODUCTION_PLAN', 'operator_name', 'Operator', 2, 'string', 0);
