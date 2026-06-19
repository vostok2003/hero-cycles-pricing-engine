import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layout
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from '../components/layout/ProtectedRoute';

// Auth
import Login from '../pages/auth/Login';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ComponentsPage from '../pages/admin/ComponentsPage';
import PriceManagementPage from '../pages/admin/PriceManagementPage';
import PriceHistoryPage from '../pages/admin/PriceHistoryPage';

// Salesperson pages
import SalesDashboard from '../pages/salesperson/SalesDashboard';
import ConfigurationBuilder from '../pages/salesperson/ConfigurationBuilder';
import PricingBreakdown from '../pages/salesperson/PricingBreakdown';

import Loader from '../components/common/Loader';

/**
 * Root redirect based on user role
 */
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <Loader fullPage />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/sales/dashboard'} replace />;
};

/**
 * Application routes definition
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Admin routes */}
      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/components" element={<ComponentsPage />} />
          <Route path="/admin/prices" element={<PriceManagementPage />} />
          <Route path="/admin/price-history" element={<PriceHistoryPage />} />
        </Route>
      </Route>

      {/* Salesperson routes */}
      <Route element={<ProtectedRoute requiredRole="salesperson" />}>
        <Route element={<DashboardLayout />}>
          <Route path="/sales/dashboard" element={<SalesDashboard />} />
          <Route path="/sales/configurations" element={<ConfigurationBuilder />} />
          <Route path="/sales/pricing" element={<PricingBreakdown />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
