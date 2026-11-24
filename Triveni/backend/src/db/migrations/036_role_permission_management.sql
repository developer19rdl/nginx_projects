-- Role & Permission Management: a dedicated permission gating the new admin screen for creating/
-- editing roles and assigning permissions to them - kept separate from user.manage (creating/
-- editing/deactivating individual user accounts) since changing what an entire role can do has a
-- much bigger blast radius than managing one account, and an admin might reasonably want to grant
-- one without the other.
INSERT INTO permissions (permission_code, module)
VALUES ('role.manage', 'role')
ON DUPLICATE KEY UPDATE module = VALUES(module);

-- Only the Administrator role gets it by default - mirrors how every other permission the ADMIN
-- role holds was granted (seed.js gives ADMIN every permission in the catalog); this INSERT exists
-- because seed.js only runs once per fresh database, so an already-deployed database needs this
-- new permission granted via migration instead.
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.role_code = 'ADMIN' AND p.permission_code = 'role.manage';
