-- Drop everything the application no longer stores to or fetches from:
--
-- 1. The entire legacy Excel-import/production-plan/machine-plan model, fully superseded by
--    production_order + machine_planning (+ their own sequence/import tables):
--      production_plans, production_orders, production_plan_items, production_plan_imports,
--      production_plan_import_errors, order_plan_sequences, machine_plans, production_schedule
-- 2. Tables that were scaffolded for a feature with no UI ever wired to read or write them:
--      customers (Customer is now free text on machine_planning, not a master lookup),
--      machine_item_mapping, machine_maintenance, machine_breakdowns
--
-- FK checks are disabled for the duration since these tables reference each other and a few
-- tables being kept (machines, items, users) in ways that make a strict drop order fragile.

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS production_plan_import_errors;
DROP TABLE IF EXISTS production_plan_imports;
DROP TABLE IF EXISTS production_schedule;
DROP TABLE IF EXISTS machine_plans;
DROP TABLE IF EXISTS production_orders;
DROP TABLE IF EXISTS production_plan_items;
DROP TABLE IF EXISTS production_plans;
DROP TABLE IF EXISTS order_plan_sequences;

DROP TABLE IF EXISTS machine_maintenance;
DROP TABLE IF EXISTS machine_breakdowns;
DROP TABLE IF EXISTS machine_item_mapping;
DROP TABLE IF EXISTS customers;

SET FOREIGN_KEY_CHECKS = 1;
