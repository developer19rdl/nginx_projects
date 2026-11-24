import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PERMISSIONS } from '../constants';

/** Where "/" lands right after login. Dashboard is the preferred default, but not every role can
 * see it (the seeded Operator role, for one, has neither dashboard.view nor production_plan.view)
 * - landing someone on a route their own ProtectedRoute immediately bounces them back from would
 * loop forever (ProtectedRoute's own fallback for a denied route is this same "/"), so this walks
 * down a priority list to the first module the signed-in user actually has permission for, rather
 * than a single hardcoded target. Falls back to /login in the unlikely case a role has no view
 * permission at all. */
export default function DefaultRoute() {
  const { hasPermission } = useAuth();

  if (hasPermission(PERMISSIONS.DASHBOARD_VIEW)) return <Navigate to="/dashboard" replace />;
  if (hasPermission(PERMISSIONS.PRODUCTION_PLAN_VIEW)) return <Navigate to="/production-plans" replace />;
  if (hasPermission(PERMISSIONS.PLANNING_VIEW)) return <Navigate to="/planning" replace />;
  if (hasPermission(PERMISSIONS.MACHINE_VIEW)) return <Navigate to="/machines" replace />;
  if (hasPermission(PERMISSIONS.QUALITY_VIEW, PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.DOWNTIME_VIEW, PERMISSIONS.CHECKLIST_VIEW)) {
    return <Navigate to="/configuration" replace />;
  }
  if (hasPermission(PERMISSIONS.USER_MANAGE)) return <Navigate to="/users" replace />;
  return <Navigate to="/login" replace />;
}
