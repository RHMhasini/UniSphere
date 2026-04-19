import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResourcesByType, deleteResource, updateResource } from '../../services/resourceService';
import '../../styles/facilitiesPagesCSS/CategoryPage.css';

export default function CategoryPage({ type, title, emoji, accentColor }) {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (msg, kind = 'success') => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getResourcesByType(type);
      setResources(res.data);
      setFiltered(res.data);
    } catch {
      setError('Failed to load resources. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      resources.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.location?.toLowerCase().includes(q) ||
          String(r.capacity).includes(q)
      )
    );
  }, [search, resources]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await deleteResource(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
      showToast('Resource deleted successfully');
    } catch {
      showToast('Failed to delete resource', 'error');
    }
  };

  const handleStatusUpdate = async (resource) => {
    try {
      const payload = {
        name: resource.name,
        type: resource.type,
        capacity: resource.capacity,
        location: resource.location,
        availabilityWindows: resource.availabilityWindows,
        status: editStatus,
      };
      const res = await updateResource(resource.id, payload);
      setResources((prev) => prev.map((r) => (r.id === resource.id ? res.data : r)));
      setEditingId(null);
      showToast('Status updated!');
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const statusBadge = (status) => (
    <span className={`status-badge status-badge--${status === 'ACTIVE' ? 'active' : 'oos'}`}>
      {status === 'ACTIVE' ? '● Available' : '○ Out of Service'}
    </span>
  );

  return (
    <div className="cat-page">
      {toast && <div className={`toast toast--${toast.kind}`}>{toast.msg}</div>}

      {/* Header */}
      <div className="cat-header" style={{ '--cat-accent': accentColor }}>
        <button className="cat-back-btn" onClick={() => navigate('/categories')}>← Back</button>
        <div className="cat-header__inner">
          <span className="cat-emoji">{emoji}</span>
          <div>
            <h1 className="cat-title">{title}</h1>
            <p className="cat-subtitle">{filtered.length} resource{filtered.length !== 1 ? 's' : ''} found</p>
          </div>
        </div>
        <a className="cat-add-btn" href="/admin/resources">+ Add Resource</a>
      </div>

      {/* Search */}
      <div className="cat-toolbar">
        <div className="cat-search-wrap">
          <span className="cat-search-icon">🔍</span>
          <input
            id={`search-${type.toLowerCase()}`}
            type="text"
            className="cat-search"
            placeholder={`Search ${title} by name, location, or capacity…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="cat-search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="cat-table-wrap">
        {loading && (
          <div className="cat-loading">
            <div className="cat-spinner" />
            <p>Loading resources…</p>
          </div>
        )}

        {error && (
          <div className="cat-error">
            <span>⚠️</span> {error}
            <button onClick={fetchResources} className="cat-retry-btn">Retry</button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="cat-empty">
            <div className="cat-empty__icon">{emoji}</div>
            <p>No {title} found{search ? ' matching your search' : ''}.</p>
            {!search && (
              <a href="/admin/resources" className="cat-empty-link">Register the first one →</a>
            )}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <table className="cat-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Resource Name</th>
                <th>Capacity</th>
                <th>Location</th>
                <th>Time Windows</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr key={r.id} className="cat-table__row">
                  <td className="cat-table__num">{idx + 1}</td>
                  <td className="cat-table__name">{r.name || '—'}</td>
                  <td>
                    <span className="cat-capacity">{r.capacity}</span>
                  </td>
                  <td className="cat-table__location">{r.location}</td>
                  <td>
                    <span className="cat-windows-badge">{r.availabilityWindowCount ?? 0} window{r.availabilityWindowCount !== 1 ? 's' : ''}</span>
                    {r.availabilityWindows?.length > 0 && (
                      <div className="cat-windows-detail">
                        {r.availabilityWindows.map((w, i) => (
                          <span key={i} className="cat-window-chip">{w}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td>
                    {editingId === r.id ? (
                      <div className="cat-inline-edit">
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          className="cat-status-select"
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="OUT_OF_SERVICE">Out of Service</option>
                        </select>
                        <button className="cat-save-btn" onClick={() => handleStatusUpdate(r)}>Save</button>
                        <button className="cat-cancel-btn" onClick={() => setEditingId(null)}>✕</button>
                      </div>
                    ) : (
                      <button
                        className="cat-status-btn"
                        onClick={() => { setEditingId(r.id); setEditStatus(r.status); }}
                        title="Click to change status"
                      >
                        {statusBadge(r.status)}
                      </button>
                    )}
                  </td>
                  <td>
                    <button className="cat-delete-btn" onClick={() => handleDelete(r.id)} title="Delete resource">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
