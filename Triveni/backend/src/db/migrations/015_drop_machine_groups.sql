-- Machine Group has no UI left anywhere (the Machine Groups tab was already removed, leaving the
-- New/Edit Machine form's "Machine Group" field as the last place it was used) - retire the whole
-- concept: drop the column/FK/index off machines, then drop the now fully unused machine_groups
-- table itself.

ALTER TABLE machines DROP FOREIGN KEY fk_machines_group;
ALTER TABLE machines DROP INDEX idx_machines_group;
ALTER TABLE machines DROP COLUMN machine_group_id;

DROP TABLE IF EXISTS machine_groups;
