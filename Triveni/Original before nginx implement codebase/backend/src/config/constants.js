const ROLES = {
  ADMIN: 'ADMIN',
  PLANNER: 'PLANNER',
  SUPERVISOR: 'SUPERVISOR',
  OPERATOR: 'OPERATOR',
  VIEWER: 'VIEWER',
  QUALITY: 'QUALITY',
};

const PERMISSIONS = {
  PRODUCTION_PLAN_VIEW: 'production_plan.view',
  PRODUCTION_PLAN_IMPORT: 'production_plan.import',
  PRODUCTION_PLAN_MANAGE: 'production_plan.manage',
  MACHINE_MANAGE: 'machine.manage',
  MACHINE_VIEW: 'machine.view',
  SHIFT_MANAGE: 'shift.manage',
  SHIFT_VIEW: 'shift.view',
  PLANNING_AUTO: 'planning.auto',
  PLANNING_MANUAL: 'planning.manual',
  PLANNING_CONFIRM: 'planning.confirm',
  PLANNING_VIEW: 'planning.view',
  PLANNING_PRODUCE: 'planning.produce',
  DASHBOARD_VIEW: 'dashboard.view',
  USER_MANAGE: 'user.manage',
  ROLE_MANAGE: 'role.manage',
  AUDIT_VIEW: 'audit.view',
  DOWNTIME_VIEW: 'downtime.view',
  DOWNTIME_LOG: 'downtime.log',
  DOWNTIME_MANAGE: 'downtime.manage',
  CHECKLIST_VIEW: 'checklist.view',
  CHECKLIST_LOG: 'checklist.log',
  CHECKLIST_MANAGE: 'checklist.manage',
  QUALITY_VIEW: 'quality.view',
  QUALITY_INSPECT: 'quality.inspect',
  QUALITY_MANAGE: 'quality.manage',
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_MANAGE: 'inventory.manage',
};

const MACHINE_STATUS = {
  AVAILABLE: 'Available',
  RUNNING: 'Running',
  MAINTENANCE: 'Maintenance',
  BREAKDOWN: 'Breakdown',
  INACTIVE: 'Inactive',
};

module.exports = { ROLES, PERMISSIONS, MACHINE_STATUS };
