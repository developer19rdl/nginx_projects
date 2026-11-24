-- Retire machine/shift allocation entirely. The Machine Planning "Shift" dropdown no longer
-- looks up which shifts are allocated to a machine on a date - every active shift (Shift Master)
-- now applies globally, in start_time order, for every machine (see poAssignment.service.js).
-- Nothing else references this table, so it can be dropped outright.

DROP TABLE IF EXISTS machine_shift_allocations;

-- allocation.manage / allocation.view no longer exist in code - remove them (role_permissions
-- rows granting them cascade-delete automatically via fk_rp_permission).
DELETE FROM permissions WHERE permission_code IN ('allocation.manage', 'allocation.view');
