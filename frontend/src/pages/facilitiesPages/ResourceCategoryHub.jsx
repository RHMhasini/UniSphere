import { useNavigate } from 'react-router-dom';
import '../../styles/facilitiesPagesCSS/ResourceCategoryHub.css';

const lectureBg = 'https://www.sliit.lk/wp-content/uploads/2017/12/sliit-career-guidance-and-counseling-img-6.jpg';
const labsBg = 'https://www.sliit.lk/wp-content/uploads/2018/03/sliit-engineering-department-of-Computer-engineering-1.jpg';
const meetingBg = 'https://static.sliit.lk/wp-content/uploads/2019/04/03084037/A-discussions-on-academic-collaboration-between-SLIIT-Business-School-and-QUT-1.jpg';
const equipmentBg = 'https://static.sliit.lk/wp-content/uploads/2017/11/Controls-and-Automation-Lab-1.jpg';

const categories = [
  {
    id: 'lecture-halls',
    label: 'Lecture Halls',
    path: '/categories/lecture-halls',
    emoji: '🎓',
    description: 'Book large teaching spaces & auditoriums',
    gradient: 'linear-gradient(135deg, rgba(102,126,234,0.88) 0%, rgba(118,75,162,0.88) 100%)',
    type: 'LECTURE_HALL',
    image: lectureBg,
  },
  {
    id: 'labs',
    label: 'Labs',
    path: '/categories/labs',
    emoji: '🔬',
    description: 'Reserve computer labs & science facilities',
    gradient: 'linear-gradient(135deg, rgba(240,147,251,0.88) 0%, rgba(245,87,108,0.88) 100%)',
    type: 'LAB',
    image: labsBg,
  },
  {
    id: 'meeting-rooms',
    label: 'Meeting Rooms',
    path: '/categories/meeting-rooms',
    emoji: '🤝',
    description: 'Schedule collaborative workspaces',
    gradient: 'linear-gradient(135deg, rgba(79,172,254,0.88) 0%, rgba(0,242,254,0.88) 100%)',
    type: 'MEETING_ROOM',
    image: meetingBg,
  },
  {
    id: 'equipment',
    label: 'Equipment',
    path: '/categories/equipment',
    emoji: '🖥️',
    description: 'Borrow projectors, cameras & gear',
    gradient: 'linear-gradient(135deg, rgba(67,233,123,0.88) 0%, rgba(56,249,215,0.88) 100%)',
    type: 'EQUIPMENT',
    image: equipmentBg,
  },
];

export default function ResourceCategoryHub() {
  const navigate = useNavigate();

  return (
    <div className="hub-page">
      <div className="hub-hero">
        <h1 className="hub-hero__title">Campus Resource Hub</h1>
        <p className="hub-hero__sub">
          Browse and book university facilities. Select a category below to explore available resources.
        </p>
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
