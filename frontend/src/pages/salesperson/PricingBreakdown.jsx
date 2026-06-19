import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { configurationApi } from '../../services/configurationApi';
import { pricingApi } from '../../services/pricingApi';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { formatCurrency, formatDateTime, getCategoryBadge, getErrorMessage } from '../../utils/formatters';
import toast from 'react-hot-toast';

/**
 * Salesperson: Pricing breakdown for a selected configuration
 * Auto-recalculates whenever configuration changes
 */
const PricingBreakdown = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [configurations, setConfigurations] = useState([]);
  const [selectedId, setSelectedId] = useState(searchParams.get('id') || '');
  const [breakdown, setBreakdown] = useState(null);
  const [loadingConfigs, setLoadingConfigs] = useState(true);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);

  // Load all configurations for the dropdown
  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const res = await configurationApi.getAll({ limit: 100 });
        setConfigurations(res.data.data || []);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoadingConfigs(false);
      }
    };
    fetchConfigs();
  }, []);

  // Auto-load breakdown when selectedId changes
  const fetchBreakdown = useCallback(async () => {
    if (!selectedId) { setBreakdown(null); return; }
    setLoadingBreakdown(true);
    try {
      const res = await pricingApi.getBreakdown(selectedId);
      setBreakdown(res.data.data);
      // Update URL param
      setSearchParams({ id: selectedId });
    } catch (err) {
      toast.error(getErrorMessage(err));
      setBreakdown(null);
    } finally {
      setLoadingBreakdown(false);
    }
  }, [selectedId, setSearchParams]);

  useEffect(() => { fetchBreakdown(); }, [fetchBreakdown]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="page-title">Pricing Breakdown</h1>
        <p className="page-subtitle">Select a configuration to see the full component cost breakdown.</p>
      </div>

      {/* Configuration Selector */}
      <div className="card p-5">
        <label className="label" htmlFor="configSelect">Select Configuration</label>
        {loadingConfigs ? (
          <div className="h-9 bg-slate-800 rounded-lg animate-pulse" />
        ) : (
          <select
            id="configSelect"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="select max-w-lg"
          >
            <option value="">-- Choose a configuration --</option>
            {configurations.map((config) => (
              <option key={config._id} value={config._id}>
                {config.configurationName}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Breakdown */}
      {loadingBreakdown ? (
        <Loader text="Calculating pricing..." />
      ) : !selectedId ? (
        <EmptyState
          title="No configuration selected"
          description="Choose a configuration above to view its pricing breakdown."
        />
      ) : !breakdown ? null : (
        <div className="space-y-4">
          {/* Config Info */}
          <div className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">{breakdown.configurationName}</h2>
                {breakdown.description && (
                  <p className="text-sm text-slate-400 mt-0.5">{breakdown.description}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  Created by {breakdown.createdBy?.name} · Calculated {formatDateTime(breakdown.calculatedAt)}
                </p>
              </div>
              <button
                onClick={fetchBreakdown}
                className="btn-ghost text-xs"
                title="Refresh pricing with latest component prices"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {/* Components Table */}
          {breakdown.components.length === 0 ? (
            <EmptyState title="No components" description="This configuration has no components assigned." />
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Component</th>
                    <th>Category</th>
                    <th className="text-center">Quantity</th>
                    <th className="text-right">Unit Price</th>
                    <th className="text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.components.map((comp) => (
                    <tr key={comp._id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-200">{comp.name}</span>
                          {comp.isMandatory && (
                            <span className="badge-red text-xs">Required</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={getCategoryBadge(comp.category)}>{comp.category}</span>
                      </td>
                      <td className="text-center">
                        <span className="font-mono text-slate-300">{comp.quantity}</span>
                      </td>
                      <td className="text-right">
                        <span className="font-mono text-slate-300">{formatCurrency(comp.unitPrice)}</span>
                      </td>
                      <td className="text-right">
                        <span className="font-mono font-semibold text-slate-200">{formatCurrency(comp.subtotal)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-800/60">
                    <td colSpan={4} className="px-4 py-4 text-right text-sm font-semibold text-slate-300">
                      Grand Total
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-xl font-bold text-primary-400 font-mono">
                        {formatCurrency(breakdown.totalPrice)}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PricingBreakdown;
