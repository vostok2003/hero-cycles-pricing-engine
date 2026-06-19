import { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const CATEGORIES = ['Frame', 'Tyre', 'Gear Set', 'Seat', 'Brake'];

const initialForm = {
  componentName: '',
  category: 'Frame',
  currentPrice: '',
  isMandatory: false,
};

/**
 * Form modal for creating/editing a component
 */
const ComponentForm = ({ isOpen, onClose, onSubmit, editData = null, loading = false }) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setForm({
        componentName: editData.componentName || '',
        category: editData.category || 'Frame',
        currentPrice: editData.currentPrice ?? '',
        isMandatory: editData.isMandatory || false,
      });
    } else {
      setForm(initialForm);
    }
    setErrors({});
  }, [editData, isOpen]);

  const validate = () => {
    const errs = {};
    if (!form.componentName.trim()) errs.componentName = 'Component name is required';
    if (form.currentPrice === '' || isNaN(form.currentPrice) || Number(form.currentPrice) < 0)
      errs.currentPrice = 'Valid price is required';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit({ ...form, currentPrice: Number(form.currentPrice) });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? 'Edit Component' : 'Add New Component'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Component Name */}
        <div>
          <label className="label" htmlFor="componentName">Component Name</label>
          <input
            id="componentName"
            type="text"
            value={form.componentName}
            onChange={(e) => setForm({ ...form, componentName: e.target.value })}
            className={`input ${errors.componentName ? 'border-red-500' : ''}`}
            placeholder="e.g., Aluminium Frame"
          />
          {errors.componentName && <p className="text-red-400 text-xs mt-1">{errors.componentName}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="label" htmlFor="category">Category</label>
          <select
            id="category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="select"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div>
          <label className="label" htmlFor="currentPrice">Current Price (₹)</label>
          <input
            id="currentPrice"
            type="number"
            min="0"
            step="0.01"
            value={form.currentPrice}
            onChange={(e) => setForm({ ...form, currentPrice: e.target.value })}
            className={`input ${errors.currentPrice ? 'border-red-500' : ''}`}
            placeholder="0.00"
          />
          {errors.currentPrice && <p className="text-red-400 text-xs mt-1">{errors.currentPrice}</p>}
        </div>

        {/* Mandatory */}
        <div className="flex items-center gap-3">
          <input
            id="isMandatory"
            type="checkbox"
            checked={form.isMandatory}
            onChange={(e) => setForm({ ...form, isMandatory: e.target.checked })}
            className="w-4 h-4 rounded border-slate-600 text-primary-600 bg-slate-800 focus:ring-primary-500"
          />
          <label htmlFor="isMandatory" className="text-sm text-slate-300 cursor-pointer">
            Mark as mandatory component
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              editData ? 'Update Component' : 'Create Component'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ComponentForm;
