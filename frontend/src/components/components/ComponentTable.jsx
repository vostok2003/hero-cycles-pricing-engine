import EmptyState from '../common/EmptyState';
import Pagination from '../common/Pagination';
import { formatCurrency, formatDate, getCategoryBadge } from '../../utils/formatters';

/**
 * Table displaying bicycle components with edit/delete actions
 */
const ComponentTable = ({ components, pagination, onPageChange, onEdit, onDelete, loading }) => {
  if (!loading && components.length === 0) {
    return (
      <EmptyState
        title="No components found"
        description="Try adjusting your search or filters, or add a new component."
      />
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Component Name</th>
            <th>Category</th>
            <th>Current Price</th>
            <th>Mandatory</th>
            <th>Last Updated</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j}>
                      <div className="h-4 bg-slate-800 rounded animate-pulse w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            : components.map((comp) => (
                <tr key={comp._id}>
                  <td>
                    <span className="font-medium text-slate-200">{comp.componentName}</span>
                  </td>
                  <td>
                    <span className={getCategoryBadge(comp.category)}>{comp.category}</span>
                  </td>
                  <td>
                    <span className="font-mono text-slate-200">{formatCurrency(comp.currentPrice)}</span>
                  </td>
                  <td>
                    {comp.isMandatory ? (
                      <span className="badge-green">Mandatory</span>
                    ) : (
                      <span className="badge-slate">Optional</span>
                    )}
                  </td>
                  <td>
                    <span className="text-slate-400">{formatDate(comp.lastUpdatedDate)}</span>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(comp)}
                        className="btn-ghost text-xs py-1 px-2"
                        aria-label={`Edit ${comp.componentName}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(comp)}
                        className="btn-ghost text-xs py-1 px-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        aria-label={`Delete ${comp.componentName}`}
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

export default ComponentTable;
