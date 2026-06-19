import { useState, useEffect, useCallback } from 'react';
import { pricingApi } from '../../services/pricingApi';
import PriceUpdateForm from '../../components/pricing/PriceUpdateForm';
import PriceHistoryTable from '../../components/pricing/PriceHistoryTable';
import { getErrorMessage } from '../../utils/formatters';
import toast from 'react-hot-toast';

/**
 * Admin: Price management - update prices and view recent history
 */
const PriceManagementPage = () => {
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await pricingApi.getAllHistory({ page, limit: 10 });
      setHistory(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handlePriceUpdate = async (data) => {
    setUpdateLoading(true);
    try {
      await pricingApi.updatePrice(data);
      toast.success('Price updated successfully');
      fetchHistory();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="page-title">Price Management</h1>
        <p className="page-subtitle">Update component prices. All changes are tracked automatically.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Update Form */}
        <div className="lg:col-span-1">
          <PriceUpdateForm onSubmit={handlePriceUpdate} loading={updateLoading} />
        </div>

        {/* Recent History */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="px-5 py-4 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-200">Recent Price Changes</h3>
            </div>
            <PriceHistoryTable
              history={history}
              pagination={pagination}
              onPageChange={setPage}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceManagementPage;
