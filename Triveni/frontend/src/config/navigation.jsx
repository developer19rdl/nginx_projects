import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SecurityIcon from '@mui/icons-material/Security';
import { PERMISSIONS } from '../constants';

/**
 * Single source of truth for the sidebar's nav items, grouped into sections, AND for the
 * header's "Triveni Steel | {page}" breadcrumb label (see Header.jsx) - both read from the same
 * flattened `NAV_ITEMS` list rather than maintaining two separate copies of "which path maps to
 * which label."
 *
 * Only 3 groups (not the design brief's 4) - there's nothing to put under an "ANALYTICS" group
 * yet (no Reports module exists), and an empty group heading would read as a bug rather than a
 * deliberate scope decision. Re-add it once a real analytics/reports module exists.
 */
export const NAV_GROUPS = [
  {
    label: 'OPERATIONS',
    items: [
      { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', permission: PERMISSIONS.DASHBOARD_VIEW },
      { label: 'Production Plans', icon: <AssignmentIcon />, path: '/production-plans', permission: PERMISSIONS.PRODUCTION_PLAN_VIEW },
      { label: 'Machines', icon: <PrecisionManufacturingIcon />, path: '/machines', permission: PERMISSIONS.MACHINE_VIEW },
      { label: 'Machine Planning', icon: <CalendarViewWeekIcon />, path: '/planning', permission: PERMISSIONS.PLANNING_VIEW },
    ],
  },
  {
    label: 'QUALITY & INVENTORY',
    items: [
      { label: 'Quality', icon: <FactCheckIcon />, path: '/quality', permission: PERMISSIONS.QUALITY_VIEW },
      { label: 'Inventory', icon: <WarehouseIcon />, path: '/inventory', permission: PERMISSIONS.INVENTORY_VIEW },
    ],
  },
  {
    label: 'ADMINISTRATION',
    items: [
      { label: 'Users', icon: <PeopleAltIcon />, path: '/users', permission: PERMISSIONS.USER_MANAGE },
      { label: 'Configuration', icon: <SettingsIcon />, path: '/configuration', permission: PERMISSIONS.DOWNTIME_VIEW },
    ],
  },
];

/**
 * Routes that exist and are reachable (e.g. via a button elsewhere in the app) but are
 * deliberately left out of the sidebar - kept here only so `currentNavLabel` still resolves a
 * breadcrumb for them. Roles & Permissions is reached from the Users page's "Roles & Permissions"
 * button instead of its own sidebar entry, to keep it visually scoped under user administration.
 */
const HIDDEN_NAV_ITEMS = [{ label: 'Roles & Permissions', icon: <SecurityIcon />, path: '/roles', permission: PERMISSIONS.ROLE_MANAGE }];

export const NAV_ITEMS = [...NAV_GROUPS.flatMap((g) => g.items), ...HIDDEN_NAV_ITEMS];

/** The current page's nav label for the header breadcrumb - exact match first, then the longest
 * matching path prefix (so a detail/nested route like `/production-plans/:id` still resolves to
 * "Production Plans" instead of showing nothing). */
export function currentNavLabel(pathname) {
  const exact = NAV_ITEMS.find((item) => item.path === pathname);
  if (exact) return exact.label;
  const prefixMatches = NAV_ITEMS.filter((item) => pathname.startsWith(item.path)).sort((a, b) => b.path.length - a.path.length);
  return prefixMatches[0]?.label;
}
