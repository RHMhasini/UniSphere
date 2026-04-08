import { useNavigate } from 'react-router-dom';
import './ResourceCategoryHub.css';

const categories = [
  {
    id: 'lecture-halls',
    label: 'Lecture Halls',
    path: '/categories/lecture-halls',
    emoji: '🎓',
    description: 'Book large teaching spaces & auditoriums',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    type: 'LECTURE_HALL',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 'labs',
    label: 'Labs',
    path: '/categories/labs',
    emoji: '🔬',
    description: 'Reserve computer labs & science facilities',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    type: 'LAB',
    image: 'https://images.unsplash.com/photo-1581093458791-9f3c3250a8b0?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 'meeting-rooms',
    label: 'Meeting Rooms',
    path: '/categories/meeting-rooms',
    emoji: '🤝',
    description: 'Schedule collaborative workspaces',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    type: 'MEETING_ROOM',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: 'equipment',
    label: 'Equipment',
    path: '/categories/equipment',
    emoji: '🖥️',
    description: 'Borrow projectors, cameras & gear',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    type: 'EQUIPMENT',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60',
  },
];

export default function ResourceCategoryHub() {
  const navigate = useNavigate();

  return (
    <div className="hub-page">
      <div className="hub-hero">
        <div className="hub-hero__badge">🏛️ UniSphere</div>
        <h1 className="hub-hero__title">Campus Resource Hub</h1>
        <p className="hub-hero__sub">
          Browse and book university facilities. Select a category below to explore available resources.
        </p>
        <button className="hub-admin-btn" onClick={() => navigate('/admin/resources')}>
          + Register New Resource
        </button>
      </div>

      <div className="hub-grid">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className="hub-card"
            onClick={() => navigate(cat.path)}
            aria-label={`Navigate to ${cat.label}`}
          >
            <div
              className="hub-card__img"
              style={{ backgroundImage: `url(${cat.image})` }}
            >
              <div className="hub-card__overlay" style={{ background: cat.gradient }} />
              <span className="hub-card__emoji">{cat.emoji}</span>
            </div>
            <div className="hub-card__content">
              <h2 className="hub-card__title">{cat.label}</h2>
              <p className="hub-card__desc">{cat.description}</p>
              <span className="hub-card__arrow">Explore →</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
