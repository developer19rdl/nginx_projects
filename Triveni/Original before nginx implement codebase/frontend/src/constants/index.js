// Simplified filter shown on the Production Orders list - maps to the underlying
// Imported/Assigning/Assigned statuses on the backend (Cancelled only shows under "All").
export const PLAN_STATUSES = ['Pending', 'Completed'];

export const STATUS_COLORS = {
  Imported: 'info',
  Assigning: 'warning',
  Assigned: 'success',
  Cancelled: 'error',
  Unassigned: 'default',
  Available: 'success',
  Running: 'info',
  Maintenance: 'warning',
  Breakdown: 'error',
  Active: 'success',
  Inactive: 'default',
  Locked: 'error',
  Blocked: 'error',
  // Quality inspection status - StatusBadge uses the label text itself as both the display
  // string and the color lookup key, so these are keyed by the human label (see
  // QUALITY_STATUS_LABELS below), matching how 'Assigned'/'Imported'/'Cancelled' already work.
  'Pending Inspection': 'info',
  'Under Inspection': 'info',
  Approved: 'success',
  'Approved with Deviation': 'success',
  'Partially Accepted': 'warning',
  'Rework Required': 'warning',
  Rejected: 'error',
  Hold: 'warning',
  // Defect severity / CAPA status
  Critical: 'error',
  Major: 'warning',
  Minor: 'info',
  Open: 'warning',
  'In Progress': 'info',
  Closed: 'success',
};

// Maps the backend's SCREAMING_SNAKE_CASE enum values to the human label StatusBadge displays
// (NEW has no backend enum of its own - it's the "no inspection row yet" pending_reason).
export const QUALITY_STATUS_LABELS = {
  UNDER_INSPECTION: 'Under Inspection',
  APPROVED: 'Approved',
  APPROVED_WITH_DEVIATION: 'Approved with Deviation',
  PARTIALLY_ACCEPTED: 'Partially Accepted',
  REWORK_REQUIRED: 'Rework Required',
  REJECTED: 'Rejected',
  HOLD: 'Hold',
  NEW: 'Pending Inspection',
};

export const CAPA_STATUS_LABELS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  CLOSED: 'Closed',
};

export const DEFECT_CATEGORY_LABELS = {
  CRITICAL: 'Critical',
  MAJOR: 'Major',
  MINOR: 'Minor',
};

export const PARAMETER_CATEGORIES = [
  'DIMENSION',
  'WEIGHT',
  'SURFACE_FINISH',
  'VISUAL',
  'HARDNESS',
  'COLOR',
  'THREAD_CHECK',
  'FUNCTIONAL_TEST',
  'CUSTOM',
];

export const MACHINE_STATUSES = ['Available', 'Running', 'Maintenance', 'Breakdown', 'Inactive'];

// Mirrors backend/src/config/constants.js#ROLES - only ADMIN is actually referenced client-side
// (Role & Permission Management guards editing/deactivating it, matching the backend's own guard
// in role.service.js), but kept as the same shape as the backend's ROLES rather than a bare string
// in case another role code needs referencing here later.
export const ROLES = {
  ADMIN: 'ADMIN',
  PLANNER: 'PLANNER',
  SUPERVISOR: 'SUPERVISOR',
  OPERATOR: 'OPERATOR',
  VIEWER: 'VIEWER',
  QUALITY: 'QUALITY',
};

export const PERMISSIONS = {
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
  DASHBOARD_VIEW: 'dashboard.view',
  USER_MANAGE: 'user.manage',
  ROLE_MANAGE: 'role.manage',
  AUDIT_VIEW: 'audit.view',
  DOWNTIME_VIEW: 'downtime.view',
  DOWNTIME_MANAGE: 'downtime.manage',
  CHECKLIST_VIEW: 'checklist.view',
  CHECKLIST_MANAGE: 'checklist.manage',
  QUALITY_VIEW: 'quality.view',
  QUALITY_INSPECT: 'quality.inspect',
  QUALITY_MANAGE: 'quality.manage',
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_MANAGE: 'inventory.manage',
};
