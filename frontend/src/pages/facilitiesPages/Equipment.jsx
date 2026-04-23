import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResourcesByType } from '../../services/resourceService';
import { equipmentImages } from '../../assets/facilityImages';
import '../../styles/facilitiesPagesCSS/CategoryPage.css';
import '../../styles/facilitiesPagesCSS/Equipment.css';

const getResourceImage = (resource) => {
  const key = (resource.name || resource.id || '').replace(/\s+/g, '').toUpperCase();
  return equipmentImages[key] || equipmentImages.default;
};

export default function Equipment() {
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
        const response = await getResourcesByType('EQUIPMENT');
        const data = response.data || [];
        setResources(data);
        setFiltered(data);
      } catch {
        setError('Failed to load equipment resources. Please make sure the backend is running.');
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
    <div className="eq-page">
      <div className="cat-header" style={{ '--cat-accent': '#43e97b' }}>
        <button
          className="cat-back-btn"
          onClick={() => navigate('/dashboard/resources')}
        >
          Back
        </button>
        <div className="cat-header__inner">
          <div>
            <h1 className="cat-title">Equipment</h1>
            <p className="cat-subtitle">
              Browse available equipment resources and find exactly what you need.
            </p>
          </div>
        </div>
      </div>

      <div className="cat-toolbar">
        <div className="cat-search-wrap">
          <input
            id="search-equipment"
            type="text"
            className="cat-search"
            placeholder="Search equipment by name, location, or capacity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="cat-search-clear" onClick={() => setSearch('')}>
              x
            </button>
          )}
        </div>
        <button type="button" className="eq-page__book-btn">
          Book Resource
        </button>
      </div>

      <div className="eq-content">
        {loading && (
          <div className="cat-loading">
            <div className="cat-spinner" />
            <p>Loading equipment...</p>
          </div>
        )}

        {error && (
          <div className="cat-error">
            <span>!</span> {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="cat-empty">
            <div className="cat-empty__icon">Eq</div>
            <p>No equipment found{search ? ' matching your search' : ''}.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="eq-grid">
            {filtered.map((resource) => (
              <article key={resource.id} className="eq-card">
                <div
                  className="eq-card__image"
                  style={{ backgroundImage: `url(${getResourceImage(resource.name)})` }}
                >
                  <div className="eq-card__overlay" />
                  <span
                    className={`eq-card__status ${
                      resource.status === 'ACTIVE' ? 'active' : 'oos'
                    }`}
                  >
                    {statusLabel(resource.status)}
                  </span>
                </div>
                <div className="eq-card__body">
                  <div>
                    <h2 className="eq-card__title">
                      {resource.name || 'Untitled Equipment'}
                    </h2>
                    <p className="eq-card__location">
                      {resource.location || 'Location not specified'}
                    </p>
                  </div>
                  <div className="eq-card__details">
                    <span>Capacity: {resource.capacity ?? '-'}</span>
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
