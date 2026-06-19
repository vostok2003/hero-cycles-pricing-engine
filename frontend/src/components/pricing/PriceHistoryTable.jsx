import EmptyState from '../common/EmptyState';
import Pagination from '../common/Pagination';
import { formatCurrency, formatDateTime, getCategoryBadge } from '../../utils/formatters';

/**
 * Table showing price change history
 */
const PriceHistoryTable = ({ history, pagination, onPageChange, loading }) => {
  if (!loading && history.length === 0) {
    return <EmptyState title="No price history" description="Price updates will be tracked here." />;
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Component</th>
            <th>Category</th>
            <th>Old Price</th>
            <th>New Price</th>
            <th>Change</th>
            <th>Updated By</th>
            <th>Effective Date</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j}><div className="h-4 bg-slate-800 rounded animate-pulse w-3/4" /></td>
                  ))}
                </tr>
              ))
            : history.map((item) => {
                const diff = item.newPrice - item.oldPrice;
                const isIncrease = diff > 0;
                return (
                  <tr key={item._id}>
                    <td>
                      <span className="font-medium text-slate-200">
                        {item.componentId?.componentName || '—'}
                      </span>
                    </td>
                    <td>
                      <span className={getCategoryBadge(item.componentId?.category)}>
                        {item.componentId?.category || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono text-slate-400">{formatCurrency(item.oldPrice)}</span>
                    </td>
                    <td>
                      <span className="font-mono text-slate-200">{formatCurrency(item.newPrice)}</span>
                    </td>
                    <td>
                      <span className={`font-mono text-sm font-medium ${isIncrease ? 'text-red-400' : 'text-emerald-400'}`}>
                        {isIncrease ? '+' : ''}{formatCurrency(diff)}
                      </span>
                    </td>
                    <td>
                      <span className="text-slate-400">{item.updatedBy?.name || '—'}</span>
                    </td>
                    <td>
                      <span className="text-slate-400 text-xs">{formatDateTime(item.effectiveDate)}</span>
                    </td>
                  </tr>
                );
              })}
        </tbody>
      </table>
      {pagination && <Pagination pagination={pagination} onPageChange={onPageChange} />}
    </div>
  );
};

export default PriceHistoryTable;
