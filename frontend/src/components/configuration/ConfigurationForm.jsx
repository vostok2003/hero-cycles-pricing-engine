import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import ComponentSelector from './ComponentSelector';

const MANDATORY_CATEGORIES = ['Frame', 'Tyre', 'Gear Set'];

const initialForm = { configurationName: '', description: '' };

/**
 * Form modal for creating/editing configurations
 */
const ConfigurationForm = ({ isOpen, onClose, onSubmit, editData = null, loading = false }) => {
  const [form, setForm] = useState(initialForm);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editData) {
      setForm({
        configurationName: editData.configurationName || '',
        description: editData.description || '',
      });
      // Map existing components
      const existing = (editData.components || []).map((c) => ({
        componentId: c.componentId,
        componentData: c.componentId,
        quantity: c.quantity || 1,
      }));
      setSelectedComponents(existing);
    } else {
      setForm(initialForm);
      setSelectedComponents([]);
    }
    setErrors({});
  }, [editData, isOpen]);

  const validate = () => {
    const errs = {};
    if (!form.configurationName.trim()) errs.name = 'Configuration name is required';

    const presentCategories = selectedComponents.map((sc) => {
      const comp = sc.componentData || sc.componentId;
      return comp?.category;
    });

    const missing = MANDATORY_CATEGORIES.filter((cat) => !presentCategories.includes(cat));
    if (missing.length > 0) {
      errs.components = `Missing mandatory categories: ${missing.join(', ')}`;
    }

    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const components = selectedComponents.map((sc) => ({
      componentId: sc.componentId?._id || sc.componentId,
      quantity: sc.quantity || 1,
    }));

    onSubmit({ ...form, components });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? 'Edit Configuration' : 'New Configuration'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* Name */}
        <div>
          <label className="label" htmlFor="configName">Configuration Name</label>
          <input
            id="configName"
            type="text"
            value={form.configurationName}
            onChange={(e) => setForm({ ...form, configurationName: e.target.value })}
            className={`input ${errors.name ? 'border-red-500' : ''}`}
            placeholder="e.g., Mountain Bike Pro"
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="label" htmlFor="configDesc">Description (optional)</label>
          <textarea
            id="configDesc"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input resize-none"
            rows={2}
            placeholder="Brief description of this configuration..."
          />
        </div>

        {/* Components */}
        <div>
          <p className="label mb-2">Components</p>
          {errors.components && (
            <p className="text-red-400 text-xs mb-2">{errors.components}</p>
          )}
          <ComponentSelector
            selectedComponents={selectedComponents}
            onChange={setSelectedComponents}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
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
              editData ? 'Update Configuration' : 'Create Configuration'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ConfigurationForm;
