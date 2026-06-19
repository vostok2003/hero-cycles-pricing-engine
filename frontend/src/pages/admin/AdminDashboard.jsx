import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi } from '../../services/dashboardApi';
import DashboardCard from '../../components/dashboard/DashboardCard';
import RecentUpdates from '../../components/dashboard/RecentUpdates';
import { getErrorMessage } from '../../utils/formatters';
import toast from 'react-hot-toast';

const icons = {
  components: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  configurations: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
    </svg>
  ),
  updates: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

/**
 * Admin Dashboard Page
 */
const AdminDashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingUpdates, setLoadingUpdates] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, updatesRes] = await Promise.all([
          dashboardApi.getSummary(),
          dashboardApi.getRecentPriceUpdates(),
        ]);
        setSummary(summaryRes.data.data);
        setRecentUpdates(updatesRes.data.data || []);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoadingSummary(false);
        setLoadingUpdates(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.name}. Here's your system overview.</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardCard
          title="Total Components"
          value={summary?.totalComponents}
          subtitle="Across all categories"
          icon={icons.components}
          color="blue"
          loading={loadingSummary}
        />
        <DashboardCard
          title="Total Configurations"
          value={summary?.totalConfigurations}
          subtitle="Bicycle builds created"
          icon={icons.configurations}
          color="green"
          loading={loadingSummary}
        />
        <DashboardCard
          title="Price Updates (7d)"
          value={summary?.recentPriceUpdates}
          subtitle="Changes in the last week"
          icon={icons.updates}
          color="amber"
          loading={loadingSummary}
        />
      </div>

      {/* Category Breakdown */}
      {summary?.categoryBreakdown && summary.categoryBreakdown.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Components by Category</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {summary.categoryBreakdown.map((cat) => (
              <div key={cat.category} className="bg-slate-800/40 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-slate-100">{cat.count}</p>
                <p className="text-xs text-slate-500 mt-1">{cat.category}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Price Updates */}
      <RecentUpdates updates={recentUpdates} loading={loadingUpdates} />
    </div>
  );
};

export default AdminDashboard;
