-- Migration: link meters/utility_meters to meter_type_master by id, not by copied string.
--
-- Problem: meters.meterType and utility_meters.meterType were plain strings, copied once
-- from meter_type_master at allocation time. Renaming a type in the Meter Type CRUD
-- (MeterTypeController.js) only updated the master row -- every already-allocated meter
-- kept showing the old string forever, because nothing linked back to the master row's id.
--
-- Fix: add a meterTypeId FK column to both tables, backfill it once by matching the
-- current meterType string, then read the live label going forward via
-- COALESCE(meter_type_master.meterType, <table>.meterType) wherever it's displayed
-- (EnergyDashBoardEnergyTrendController.js#meterDataOnOffStatus, UtilityMeterController.js#show).
--
-- IMPORTANT: the raw meterType string columns are left untouched on purpose. Many other
-- queries hardcode-match exact strings against them for structural roles / hierarchy
-- (e.g. meterType = 'Asset', 'Distributors', 'Feeder', 'Electric board (incomer)', 'Solar')
-- or utility filtering (Water.js, PlantOverviewConsumptionPanel.js, MeterBindingDialog.js
-- match meterType = 'Water' directly). Do not repoint those at meterTypeId/meter_type_master.
--
-- Already applied to the local/dev DB (lenovo_final) on 2026-09-22. Run this against any
-- other environment (staging/prod) that hasn't had it applied yet.

-- ── meters (Energy Meters) ──────────────────────────────────────────────────
ALTER TABLE meters
  ADD COLUMN meterTypeId INT NULL AFTER meterType;

UPDATE meters m
JOIN meter_type_master mtm ON mtm.meterType = m.meterType
SET m.meterTypeId = mtm.id
WHERE m.meterTypeId IS NULL;

-- Sanity check before adding the FK -- should return 0 rows.
-- SELECT id, meterType FROM meters WHERE meterTypeId IS NULL;

ALTER TABLE meters
  ADD CONSTRAINT meters_meterTypeId_fk FOREIGN KEY (meterTypeId) REFERENCES meter_type_master(id);

-- ── utility_meters (Utility Meters: Water/Gas/Fuel/... + env sensors) ──────
ALTER TABLE utility_meters
  ADD COLUMN meterTypeId INT NULL AFTER meterType;

UPDATE utility_meters um
JOIN meter_type_master mtm ON mtm.meterType = um.meterType
SET um.meterTypeId = mtm.id
WHERE um.meterTypeId IS NULL;

-- Sanity check before adding the FK -- should return 0 rows.
-- SELECT id, meterType FROM utility_meters WHERE meterTypeId IS NULL;

ALTER TABLE utility_meters
  ADD CONSTRAINT utility_meters_meterTypeId_fk FOREIGN KEY (meterTypeId) REFERENCES meter_type_master(id);

-- Note: any row whose meterType string doesn't match a current meter_type_master row
-- (e.g. it was allocated before that type existed, or the type was since deleted) is left
-- with meterTypeId = NULL and keeps showing its raw meterType string -- this is the
-- intended fallback (see COALESCE usage above), not an error.
