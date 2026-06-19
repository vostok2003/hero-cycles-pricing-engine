import { useState, useEffect } from 'react';
import { componentApi } from '../../services/componentApi';
import { formatCurrency } from '../../utils/formatters';

/**
 * Form to select a component and update its price
 */
const PriceUpdateForm = ({ onSubmit, loading = false }) => {
  const [components, setComponents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [errors, setErrors] = useState({});
  const [fetchingComponents, setFetchingComponents] = useState(true);

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const res = await componentApi.getAllNoPagination();
        setComponents(res.data.data || []);
      } catch {
        // silent
      } finally {
        setFetchingComponents(false);
      }
    };
    fetchComponents();
  }, []);

  const selectedComponent = components.find((c) => c._id === selectedId);

  const validate = () => {
    const errs = {};
    if (!selectedId) errs.component = 'Please select a component';
    if (newPrice === '' || isNaN(newPrice) || Number(newPrice) < 0)
      errs.price = 'Valid price is required';
    if (selectedComponent && Number(newPrice) === selectedComponent.currentPrice)
      errs.price = 'New price must differ from current price';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit({ componentId: selectedId, newPrice: Number(newPrice) });
    setSelectedId('');
    setNewPrice('');
    setErrors({});
  };

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-200 mb-4">Update Component Price</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Component selector */}
        <div>
          <label className="label" htmlFor="componentSelect">Select Component</label>
          {fetchingComponents ? (
            <div className="h-9 bg-slate-800 rounded-lg animate-pulse" />
          ) : (
            <select
              id="componentSelect"
              value={selectedId}
              onChange={(e) => { setSelectedId(e.target.value); setErrors({}); }}
              className={`select ${errors.component ? 'border-red-500' : ''}`}
            >
              <option value="">-- Choose a component --</option>
              {components.map((comp) => (
                <option key={comp._id} value={comp._id}>
                  {comp.componentName} ({comp.category})
                </option>
              ))}
            </select>
          )}
          {errors.component && <p className="text-red-400 text-xs mt-1">{errors.component}</p>}
        </div>

        {/* Current price display */}
        {selectedComponent && (
          <div className="bg-slate-800/60 rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">Current Price</span>
            <span className="font-mono font-semibold text-slate-200">
              {formatCurrency(selectedComponent.currentPrice)}
            </span>
          </div>
        )}

        {/* New price */}
        <div>
          <label className="label" htmlFor="newPrice">New Price (₹)</label>
          <input
            id="newPrice"
            type="number"
            min="0"
            step="0.01"
            value={newPrice}
            onChange={(e) => { setNewPrice(e.target.value); setErrors({}); }}
            className={`input ${errors.price ? 'border-red-500' : ''}`}
            placeholder="Enter new price"
          />
          {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
        </div>

        <button type="submit" className="btn-primary w-full justify-center" disabled={loading || fetchingComponents}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Updating...
            </span>
          ) : (
            'Update Price'
          )}
        </button>
      </form>
    </div>
  );
};

export default PriceUpdateForm;
