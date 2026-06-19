import { useState, useEffect, useCallback } from 'react';
import { pricingApi } from '../../services/pricingApi';
import PriceHistoryTable from '../../components/pricing/PriceHistoryTable';
import { getErrorMessage } from '../../utils/formatters';
import toast from 'react-hot-toast';

/**
 * Admin: Full price history page with pagination
 */
const PriceHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pricingApi.getAllHistory({ page, limit: 15 });
      setHistory(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Price History</h1>
        <p className="page-subtitle">Complete log of all component price changes.</p>
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200">All Price Updates</h3>
          {pagination && (
            <span className="text-xs text-slate-500">
              {pagination.total} total records
            </span>
          )}
        </div>
        <PriceHistoryTable
          history={history}
          pagination={pagination}
          onPageChange={setPage}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default PriceHistoryPage;
