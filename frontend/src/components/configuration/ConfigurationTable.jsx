import EmptyState from '../common/EmptyState';
import Pagination from '../common/Pagination';
import { formatDate, getCategoryBadge } from '../../utils/formatters';

/**
 * Table displaying bicycle configurations
 */
const ConfigurationTable = ({
  configurations,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
  onViewPricing,
  loading,
}) => {
  if (!loading && configurations.length === 0) {
    return (
      <EmptyState
        title="No configurations yet"
        description="Create your first bicycle configuration using the builder."
      />
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Configuration Name</th>
            <th>Description</th>
            <th>Created By</th>
            <th>Created</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j}><div className="h-4 bg-slate-800 rounded animate-pulse w-3/4" /></td>
                  ))}
                </tr>
              ))
            : configurations.map((config) => (
                <tr key={config._id}>
                  <td>
                    <span className="font-medium text-slate-200">{config.configurationName}</span>
                  </td>
                  <td>
                    <span className="text-slate-400 text-sm truncate max-w-xs block">
                      {config.description || '—'}
                    </span>
                  </td>
                  <td>
                    <span className="text-slate-400">{config.createdBy?.name || '—'}</span>
                  </td>
                  <td>
                    <span className="text-slate-400">{formatDate(config.createdAt)}</span>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onViewPricing(config)}
                        className="btn-ghost text-xs py-1 px-2 text-primary-400 hover:text-primary-300"
                        aria-label={`View pricing for ${config.configurationName}`}
                      >
                        Pricing
                      </button>
                      <button
                        onClick={() => onEdit(config)}
                        className="btn-ghost text-xs py-1 px-2"
                        aria-label={`Edit ${config.configurationName}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(config)}
                        className="btn-ghost text-xs py-1 px-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        aria-label={`Delete ${config.configurationName}`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
      {pagination && <Pagination pagination={pagination} onPageChange={onPageChange} />}
    </div>
  );
};

export default ConfigurationTable;
