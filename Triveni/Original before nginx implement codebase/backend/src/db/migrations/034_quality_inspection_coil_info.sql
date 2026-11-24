-- Coil identity snapshot on the inspection report - mirrors machine_planning's own coil_no/
-- grade/coil_size/coil_wt (captured earlier via the operator app's Coil Info popup, migration
-- 022) so the client's Slitting Line Production cum Inspection Report can show Coil No, Grade,
-- Coil Size and Coil Wt without a join back to machine_planning (same denormalized-snapshot
-- reasoning as order_no/lot_no/item_code already on this table - a later edit to the source row
-- must never rewrite this report's history).

ALTER TABLE quality_inspections
  ADD COLUMN coil_no   VARCHAR(50)   NULL AFTER quantity_produced,
  ADD COLUMN grade     VARCHAR(50)   NULL AFTER coil_no,
  ADD COLUMN coil_size VARCHAR(50)   NULL AFTER grade,
  ADD COLUMN coil_wt   DECIMAL(10,2) NULL AFTER coil_size;
