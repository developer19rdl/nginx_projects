-- Excel imports are no longer tracked in the database at all. A pending import (uploaded and
-- validated, not yet confirmed) now lives only as a staged JSON file on disk, keyed by a
-- generated UUID; once the Production Order is created, the staged file is deleted. There is
-- no lasting record of the import itself - only the resulting production_order/machine_planning
-- rows remain.

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS production_order_import_errors;
DROP TABLE IF EXISTS production_order_imports;

SET FOREIGN_KEY_CHECKS = 1;
