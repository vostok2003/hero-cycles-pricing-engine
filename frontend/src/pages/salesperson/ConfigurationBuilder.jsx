import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { configurationApi } from '../../services/configurationApi';
import ConfigurationTable from '../../components/configuration/ConfigurationTable';
import ConfigurationForm from '../../components/configuration/ConfigurationForm';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { getErrorMessage } from '../../utils/formatters';
import toast from 'react-hot-toast';

/**
 * Salesperson: Configuration Builder - create and manage bicycle builds
 */
const ConfigurationBuilder = () => {
  const navigate = useNavigate();
  const [configurations, setConfigurations] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchConfigurations = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const res = await configurationApi.getAll(params);
      setConfigurations(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchConfigurations(), 300);
    return () => clearTimeout(timeout);
  }, [fetchConfigurations]);

  useEffect(() => { setPage(1); }, [search]);

  // Load full configuration data (with components) before editing
  const handleEditClick = async (config) => {
    try {
      const res = await configurationApi.getById(config._id);
      setEditData(res.data.data);
      setFormOpen(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleCreate = async (data) => {
    setFormLoading(true);
    try {
      await configurationApi.create(data);
      toast.success('Configuration created successfully');
      setFormOpen(false);
      fetchConfigurations();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    setFormLoading(true);
    try {
      await configurationApi.update(editData._id, data);
      toast.success('Configuration updated successfully');
      setFormOpen(false);
      setEditData(null);
      fetchConfigurations();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await configurationApi.delete(deleteTarget._id);
      toast.success('Configuration deleted');
      setDeleteTarget(null);
      fetchConfigurations();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewPricing = (config) => {
    navigate(`/sales/pricing?id=${config._id}`);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title">Configuration Builder</h1>
          <p className="page-subtitle">Build and manage bicycle configurations.</p>
        </div>
        <button onClick={() => { setEditData(null); setFormOpen(true); }} className="btn-primary flex-shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Configuration
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search configurations..."
          className="input pl-9"
        />
      </div>

      {/* Table */}
      <ConfigurationTable
        configurations={configurations}
        pagination={pagination}
        onPageChange={setPage}
        onEdit={handleEditClick}
        onDelete={setDeleteTarget}
        onViewPricing={handleViewPricing}
        loading={loading}
      />

      {/* Form Modal */}
      <ConfigurationForm
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
        title="Delete Configuration"
        message={`Delete "${deleteTarget?.configurationName}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleteLoading}
      />
    </div>
  );
};

export default ConfigurationBuilder;
