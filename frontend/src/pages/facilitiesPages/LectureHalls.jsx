import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResourcesByType } from '../../services/resourceService';
import { lectureHallImages } from '../../assets/facilityImages';
import '../../styles/facilitiesPagesCSS/CategoryPage.css';
import '../../styles/facilitiesPagesCSS/LectureHalls.css';

const getRoomImage = (resource) => {
  const key = (resource.name || resource.id || '').replace(/\s+/g, '').toUpperCase();
  return lectureHallImages[key] || lectureHallImages.default;
};

export default function LectureHalls() {
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
        const res = await getResourcesByType('LECTURE_HALL');
        setResources(res.data || []);
        setFiltered(res.data || []);
      } catch {
        setError('Failed to load lecture halls. Please check the backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      resources.filter(
        (resource) =>
          resource.name?.toLowerCase().includes(q) ||
          resource.location?.toLowerCase().includes(q) ||
          String(resource.capacity).includes(q)
      )
    );
  }, [search, resources]);

  const statusLabel = (status) =>
    status === 'ACTIVE' ? 'Available' : 'Out of Service';

  return (
    <div className="lh-page">
      <div className="cat-header" style={{ '--cat-accent': '#667eea' }}>
        <button className="cat-back-btn" onClick={() => navigate('/dashboard/resources')}>
          ← Back
        </button>
        <div className="cat-header__inner">
          <div>
            <h1 className="cat-title">Lecture Halls</h1>
            <p className="cat-subtitle">Browse all lecture hall resources available for booking.</p>
          </div>
        </div>
      </div>

      <div className="cat-toolbar">
        <div className="cat-search-wrap">
          <input
            id="search-lecture-halls"
            type="text"
            className="cat-search"
            placeholder="Search lecture halls by name, location, or capacity…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="cat-search-clear" onClick={() => setSearch('')}>
              ✕
            </button>
          )}
        </div>
        <button type="button" className="lh-page__book-btn" onClick={() => navigate('/dashboard/bookings/create')}>
          Book Resource
        </button>
      </div>

      <div className="lh-content">
        {loading && (
          <div className="cat-loading">
            <div className="cat-spinner" />
            <p>Loading lecture halls…</p>
          </div>
        )}

        {error && (
          <div className="cat-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="cat-empty">
            <div className="cat-empty__icon">🎓</div>
            <p>No lecture halls found{search ? ' matching your search' : ''}.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="lh-grid">
            {filtered.map((resource) => (
              <article key={resource.id} className="lh-card">
                <div
                  className="lh-card__image"
                  style={{ backgroundImage: `url(${getRoomImage(resource)})` }}
                >
                  <div className="lh-card__overlay" />
                  <span className={`lh-status-badge ${resource.status === 'ACTIVE' ? 'active' : 'oos'}`}>
                    {statusLabel(resource.status)}
                  </span>
                </div>
                <div className="lh-card__body">
                  <h2 className="lh-card__name">{resource.name || 'Unnamed Hall'}</h2>
                  <p className="lh-card__location">{resource.location || 'Location unknown'}</p>
                  <div className="lab-card__details">
                    <span>Capacity: {resource.capacity ?? '—'}</span>
                    <span>
                      {resource.availabilityWindows?.[0] || 'No time window assigned'}
                    </span>
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
