import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResourcesByType } from '../../services/resourceService';
import '../../styles/facilitiesPagesCSS/CategoryPage.css';
import '../../styles/facilitiesPagesCSS/Labs.css';

const getRoomImage = (name) => {
  const seed = encodeURIComponent(name?.replace(/\s+/g, '-').toLowerCase() || 'lab-room');
  return `https://images.unsplash.com/seed/${seed}/900x600?auto=format&fit=crop&q=80`;
};

export default function Labs() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getResourcesByType('LAB');
        const data = response.data || [];
        setResources(data);
        setFiltered(data);
      } catch {
        setError('Failed to load lab resources. Please make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  useEffect(() => {
    const query = search.trim().toLowerCase();
    setFiltered(
      resources.filter((resource) =>
        resource.name?.toLowerCase().includes(query) ||
        resource.location?.toLowerCase().includes(query) ||
        String(resource.capacity).includes(query)
      )
    );
  }, [search, resources]);

  const statusLabel = (status) =>
    status === 'ACTIVE' ? 'Available' : 'Out of Service';

  return (
    <div className="lab-page">
      <div className="cat-header" style={{ '--cat-accent': '#f093fb' }}>
        <button className="cat-back-btn" onClick={() => navigate('/categories')}>
          ← Back
        </button>
        <div className="cat-header__inner">
          <span className="cat-emoji">🔬</span>
          <div>
            <h1 className="cat-title">Labs</h1>
            <p className="cat-subtitle">Browse available lab resources and find a space that fits your schedule.</p>
          </div>
        </div>
      </div>

      <div className="cat-toolbar">
        <div className="cat-search-wrap">
          <span className="cat-search-icon">🔍</span>
          <input
            id="search-labs"
            type="text"
            className="cat-search"
            placeholder="Search labs by name, location, or capacity…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="cat-search-clear" onClick={() => setSearch('')}>
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="lab-content">
        {loading && (
          <div className="cat-loading">
            <div className="cat-spinner" />
            <p>Loading labs…</p>
          </div>
        )}

        {error && (
          <div className="cat-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="cat-empty">
            <div className="cat-empty__icon">🔬</div>
            <p>No labs found{search ? ' matching your search' : ''}.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="lab-grid">
            {filtered.map((resource) => (
              <article key={resource.id} className="lab-card">
                <div
                  className="lab-card__image"
                  style={{ backgroundImage: `url(${getRoomImage(resource.name)})` }}
                >
                  <div className="lab-card__overlay" />
                  <span className={`lab-card__status ${resource.status === 'ACTIVE' ? 'active' : 'oos'}`}>
                    {statusLabel(resource.status)}
                  </span>
                </div>
                <div className="lab-card__body">
                  <div>
                    <h2 className="lab-card__title">{resource.name || 'Untitled Lab'}</h2>
                    <p className="lab-card__location">{resource.location || 'Location not specified'}</p>
                  </div>
                  <div className="lab-card__details">
                    <span>Capacity: {resource.capacity ?? '—'}</span>
                    <span>{resource.availabilityWindows?.[0] || 'No time window set'}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
