import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ permission }) {
  const { user, hasPermission } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  // `permission` may be a single code or an array - hasPermission(...codes) already treats
  // multiple codes as "any of", so a route (like /configuration, shared by several modules'
  // tabs) can require any one of several permissions instead of just one.
  if (permission) {
    const required = Array.isArray(permission) ? permission : [permission];
    if (!hasPermission(...required)) return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
