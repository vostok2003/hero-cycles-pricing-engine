import { useState, useEffect, useCallback } from 'react';
import { componentApi } from '../../services/componentApi';
import ComponentTable from '../../components/components/ComponentTable';
import ComponentForm from '../../components/components/ComponentForm';
import ComponentSearch from '../../components/components/ComponentSearch';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { getErrorMessage } from '../../utils/formatters';
import toast from 'react-hot-toast';

/**
 * Admin: Full CRUD for bicycle components
 */
const ComponentsPage = () => {
  const [components, setComponents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search/filter state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);

  // Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchComponents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      const res = await componentApi.getAll(params);
      setComponents(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchComponents(), 300);
    return () => clearTimeout(timeout);
  }, [fetchComponents]);

  // Reset to page 1 on search/filter change
  useEffect(() => { setPage(1); }, [search, category]);

  const handleCreate = async (data) => {
    setFormLoading(true);
    try {
      await componentApi.create(data);
      toast.success('Component created successfully');
      setFormOpen(false);
      fetchComponents();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    setFormLoading(true);
    try {
      await componentApi.update(editData._id, data);
      toast.success('Component updated successfully');
      setFormOpen(false);
      setEditData(null);
      fetchComponents();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await componentApi.delete(deleteTarget._id);
      toast.success('Component deleted');
      setDeleteTarget(null);
      fetchComponents();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Components</h1>
          <p className="page-subtitle">Manage bicycle components and their pricing.</p>
        </div>
        <button onClick={() => { setEditData(null); setFormOpen(true); }} className="btn-primary flex-shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Component
        </button>
      </div>

      {/* Search / Filter */}
      <ComponentSearch
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
      />

      {/* Table */}
      <ComponentTable
        components={components}
        pagination={pagination}
        onPageChange={setPage}
        onEdit={(comp) => { setEditData(comp); setFormOpen(true); }}
        onDelete={setDeleteTarget}
        loading={loading}
      />

      {/* Form Modal */}
      <ComponentForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditData(null); }}
        onSubmit={editData ? handleUpdate : handleCreate}
        editData={editData}
        loading={formLoading}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Component"
        message={`Are you sure you want to delete "${deleteTarget?.componentName}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleteLoading}
      />
    </div>
  );
};

export default ComponentsPage;
