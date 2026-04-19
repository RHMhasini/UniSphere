import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResourcesByType } from '../../services/resourceService';
import { meetingRoomImages } from '../../assets/facilityImages';
import '../../styles/facilitiesPagesCSS/CategoryPage.css';
import '../../styles/facilitiesPagesCSS/MeetingRooms.css';

const getRoomImage = (resource) => {
  const key = (resource.name || resource.id || '').replace(/\s+/g, '').toUpperCase();
  return meetingRoomImages[key] || meetingRoomImages.default;
};

export default function MeetingRooms() {
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
        const response = await getResourcesByType('MEETING_ROOM');
        const data = response.data || [];
        setResources(data);
        setFiltered(data);
      } catch {
        setError('Failed to load meeting room resources. Please make sure the backend is running.');
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
    <div className="mr-page">
      <div className="cat-header" style={{ '--cat-accent': '#4facfe' }}>
        <button className="cat-back-btn" onClick={() => navigate('/categories')}>
          ← Back
        </button>
        <div className="cat-header__inner">
          <div>
            <h1 className="cat-title">Meeting Rooms</h1>
            <p className="cat-subtitle">Browse available meeting rooms and find a booking that fits your needs.</p>
          </div>
        </div>
      </div>

      <div className="cat-toolbar">
        <div className="cat-search-wrap">
          <input
            id="search-meeting-rooms"
            type="text"
            className="cat-search"
            placeholder="Search meeting rooms by name, location, or capacity…"
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

      <div className="mr-content">
        {loading && (
          <div className="cat-loading">
            <div className="cat-spinner" />
            <p>Loading meeting rooms…</p>
          </div>
        )}

        {error && (
          <div className="cat-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="cat-empty">
            <div className="cat-empty__icon">🤝</div>
            <p>No meeting rooms found{search ? ' matching your search' : ''}.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="mr-grid">
            {filtered.map((resource) => (
              <article key={resource.id} className="mr-card">
                <div
                  className="mr-card__image"
                  style={{ backgroundImage: `url(${getRoomImage(resource.name)})` }}
                >
                  <div className="mr-card__overlay" />
                  <span className={`mr-card__status ${resource.status === 'ACTIVE' ? 'active' : 'oos'}`}>
                    {statusLabel(resource.status)}
                  </span>
                </div>
                <div className="mr-card__body">
                  <div>
                    <h2 className="mr-card__title">{resource.name || 'Untitled Room'}</h2>
                    <p className="mr-card__location">{resource.location || 'Location not specified'}</p>
                  </div>
                  <div className="mr-card__details">
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
