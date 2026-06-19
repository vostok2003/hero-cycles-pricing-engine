import { useState, useEffect } from 'react';
import { componentApi } from '../../services/componentApi';
import { formatCurrency, getCategoryBadge } from '../../utils/formatters';

const MANDATORY_CATEGORIES = ['Frame', 'Tyre', 'Gear Set'];
const OPTIONAL_CATEGORIES = ['Seat', 'Brake'];
const ALL_CATEGORIES = [...MANDATORY_CATEGORIES, ...OPTIONAL_CATEGORIES];

/**
 * Component selector for configuration builder
 * Groups components by category, enforces mandatory rules
 */
const ComponentSelector = ({ selectedComponents, onChange }) => {
  const [componentsByCategory, setComponentsByCategory] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const res = await componentApi.getAllNoPagination();
        const all = res.data.data || [];
        const grouped = {};
        ALL_CATEGORIES.forEach((cat) => {
          grouped[cat] = all.filter((c) => c.category === cat);
        });
        setComponentsByCategory(grouped);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchComponents();
  }, []);

  // Get selected component for a category (there can only be one per category)
  const getSelectedForCategory = (category) => {
    return selectedComponents.find((sc) => {
      const comp = sc.componentData || sc.componentId;
      return comp?.category === category;
    });
  };

  const handleComponentChange = (category, componentId) => {
    const comp = componentsByCategory[category]?.find((c) => c._id === componentId);
    if (!comp) {
      // Remove category from selection
      const updated = selectedComponents.filter((sc) => {
        const c = sc.componentData || sc.componentId;
        return c?.category !== category;
      });
      onChange(updated);
      return;
    }

    const existing = getSelectedForCategory(category);
    let updated;
    if (existing) {
      // Replace
      updated = selectedComponents.map((sc) => {
        const c = sc.componentData || sc.componentId;
        if (c?.category === category) {
          return { componentId: comp._id, componentData: comp, quantity: sc.quantity || 1 };
        }
        return sc;
      });
    } else {
      // Add
      updated = [...selectedComponents, { componentId: comp._id, componentData: comp, quantity: 1 }];
    }
    onChange(updated);
  };

  const handleQuantityChange = (category, qty) => {
    const updated = selectedComponents.map((sc) => {
      const c = sc.componentData || sc.componentId;
      if (c?.category === category) {
        return { ...sc, quantity: Math.max(1, parseInt(qty) || 1) };
      }
      return sc;
    });
    onChange(updated);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {ALL_CATEGORIES.map((cat) => (
          <div key={cat} className="h-16 bg-slate-800 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {ALL_CATEGORIES.map((category) => {
        const isMandatory = MANDATORY_CATEGORIES.includes(category);
        const options = componentsByCategory[category] || [];
        const selected = getSelectedForCategory(category);
        const selectedId = selected?.componentId?._id || selected?.componentId || '';

        return (
          <div key={category} className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className={getCategoryBadge(category)}>{category}</span>
              {isMandatory && (
                <span className="text-xs text-red-400 font-medium">* Required</span>
              )}
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <select
                  value={selectedId}
                  onChange={(e) => handleComponentChange(category, e.target.value)}
                  className="select text-sm"
                  disabled={isMandatory && options.length === 0}
                >
                  {!isMandatory && <option value="">-- None --</option>}
                  {isMandatory && <option value="">-- Select {category} --</option>}
                  {options.map((comp) => (
                    <option key={comp._id} value={comp._id}>
                      {comp.componentName} — {formatCurrency(comp.currentPrice)}
                    </option>
                  ))}
                </select>
              </div>
              {selected && (
                <div className="w-24">
                  <input
                    type="number"
                    min="1"
                    value={selected.quantity || 1}
                    onChange={(e) => handleQuantityChange(category, e.target.value)}
                    className="input text-sm text-center"
                    title="Quantity"
                  />
                </div>
              )}
            </div>

            {options.length === 0 && (
              <p className="text-xs text-slate-500 mt-2">No components in this category. Add them first.</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ComponentSelector;
