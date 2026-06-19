import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';

/**
 * ProtectedRoute - Redirects to login if not authenticated
 * Optionally restricts access by role
 */
const ProtectedRoute = ({ requiredRole = null }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader fullPage />;

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on role
    const fallback = user.role === 'admin' ? '/admin/dashboard' : '/sales/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
