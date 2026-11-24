-- Adds Device ID and Slave ID to Machines - identifiers for the physical data-collection device
-- and its Modbus slave address, so a machine record can be tied to the device that reports its
-- live data. Both optional free-form fields, no other module depends on them yet.

ALTER TABLE machines
  ADD COLUMN device_id VARCHAR(50) NULL AFTER machine_type,
  ADD COLUMN slave_id INT UNSIGNED NULL AFTER device_id;
