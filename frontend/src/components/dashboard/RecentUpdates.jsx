import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import { formatCurrency, formatDate } from '../../utils/formatters';

/**
 * Recent price updates table for dashboards
 */
const RecentUpdates = ({ updates = [], loading = false }) => {
  if (loading) return <Loader size="sm" />;

  return (
    <div className="card">
      <div className="px-5 py-4 border-b border-slate-800">
        <h3 className="text-sm font-semibold text-slate-200">Recent Price Updates</h3>
      </div>
      {updates.length === 0 ? (
        <EmptyState title="No price updates yet" description="Price changes will appear here." />
      ) : (
        <div className="divide-y divide-slate-800">
          {updates.map((update) => (
            <div key={update._id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-800/30 transition-colors">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {update.componentId?.componentName || 'Unknown Component'}
                </p>
                <p className="text-xs text-slate-500">
                  {update.componentId?.category} · Updated by {update.updatedBy?.name || 'Unknown'}
                </p>
              </div>
              <div className="text-right ml-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 line-through">{formatCurrency(update.oldPrice)}</span>
                  <span className="text-sm font-semibold text-emerald-400">{formatCurrency(update.newPrice)}</span>
                </div>
                <p className="text-xs text-slate-500">{formatDate(update.effectiveDate)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentUpdates;
