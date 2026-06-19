import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi } from '../../services/dashboardApi';
import { configurationApi } from '../../services/configurationApi';
import DashboardCard from '../../components/dashboard/DashboardCard';
import RecentUpdates from '../../components/dashboard/RecentUpdates';
import { formatDate, getErrorMessage } from '../../utils/formatters';
import toast from 'react-hot-toast';

const configIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
  </svg>
);

/**
 * Salesperson Dashboard Page
 */
const SalesDashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recentConfigs, setRecentConfigs] = useState([]);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, configsRes, updatesRes] = await Promise.all([
          dashboardApi.getSummary(),
          configurationApi.getAll({ page: 1, limit: 5 }),
          dashboardApi.getRecentPriceUpdates(),
        ]);
        setSummary(summaryRes.data.data);
        setRecentConfigs(configsRes.data.data || []);
        setRecentUpdates(updatesRes.data.data || []);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Sales Dashboard</h1>
        <p className="page-subtitle">Welcome, {user?.name}. Manage configurations and pricing.</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DashboardCard
          title="Total Configurations"
          value={summary?.totalConfigurations}
          subtitle="Bicycle builds created"
          icon={configIcon}
          color="green"
          loading={loading}
        />
        <DashboardCard
          title="Price Updates (7d)"
          value={summary?.recentPriceUpdates}
          subtitle="Recent component price changes"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          color="amber"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Configurations */}
        <div className="card">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">Recent Configurations</h3>
            <Link to="/sales/configurations" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
              View all →
            </Link>
          </div>
          {recentConfigs.length === 0 && !loading ? (
            <div className="px-5 py-8 text-center">
              <p className="text-slate-500 text-sm">No configurations yet.</p>
              <Link to="/sales/configurations" className="text-primary-400 text-sm hover:underline mt-1 inline-block">
                Create one
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {(loading ? Array.from({ length: 3 }) : recentConfigs).map((config, i) => (
                <div key={config?._id || i} className="px-5 py-3 flex items-center justify-between">
                  {loading ? (
                    <div className="h-4 bg-slate-800 rounded animate-pulse w-3/4" />
                  ) : (
                    <>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{config.configurationName}</p>
                        <p className="text-xs text-slate-500">{formatDate(config.createdAt)}</p>
                      </div>
                      <Link
                        to={`/sales/pricing?id=${config._id}`}
                        className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        View pricing
                      </Link>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Price Updates */}
        <RecentUpdates updates={recentUpdates} loading={loading} />
      </div>
    </div>
  );
};

export default SalesDashboard;
