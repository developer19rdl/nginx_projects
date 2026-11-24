import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ permission }) {
  const { user, hasPermission } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (permission && !hasPermission(permission)) return <Navigate to="/plan" replace />;

  return <Outlet />;
}
