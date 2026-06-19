/**
 * Metric card for dashboards
 */
const DashboardCard = ({ title, value, subtitle, icon, color = 'blue', loading = false }) => {
  const colors = {
    blue: 'bg-blue-900/30 text-blue-400 border-blue-800/50',
    green: 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50',
    amber: 'bg-amber-900/30 text-amber-400 border-amber-800/50',
    purple: 'bg-purple-900/30 text-purple-400 border-purple-800/50',
    red: 'bg-red-900/30 text-red-400 border-red-800/50',
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-20 bg-slate-800 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-slate-100">{value ?? '—'}</p>
          )}
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;
