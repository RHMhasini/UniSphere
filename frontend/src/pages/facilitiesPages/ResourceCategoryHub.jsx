import { useNavigate } from 'react-router-dom';
import {
  lectureHallImages,
  labImages,
  meetingRoomImages,
  equipmentImages,
} from '../../assets/facilityImages';
import '../../styles/facilitiesPagesCSS/ResourceCategoryHub.css';

const lectureBg = lectureHallImages.Lecture_Halls_main;
const labsBg = labImages.Labs_Main;
const meetingBg = meetingRoomImages.Meeting_rooms_main;
const equipmentBg = equipmentImages.equipment_main;

const categories = [
  {
    id: 'lecture-halls',
    label: 'Lecture Halls',
    path: '/dashboard/resources/lecture-halls',
    description: 'Book large teaching spaces and auditoriums',
    gradient:
      'linear-gradient(135deg, rgba(102,126,234,0.88) 0%, rgba(118,75,162,0.88) 100%)',
    image: lectureBg,
  },
  {
    id: 'labs',
    label: 'Labs',
    path: '/dashboard/resources/labs',
    description: 'Reserve computer labs and science facilities',
    gradient:
      'linear-gradient(135deg, rgba(240,147,251,0.88) 0%, rgba(245,87,108,0.88) 100%)',
    image: labsBg,
  },
  {
    id: 'meeting-rooms',
    label: 'Meeting Rooms',
    path: '/dashboard/resources/meeting-rooms',
    description: 'Schedule collaborative workspaces',
    gradient:
      'linear-gradient(135deg, rgba(79,172,254,0.88) 0%, rgba(0,242,254,0.88) 100%)',
    image: meetingBg,
  },
  {
    id: 'equipment',
    label: 'Equipment',
    path: '/dashboard/resources/equipment',
    description: 'Borrow projectors, cameras and gear',
    gradient:
      'linear-gradient(135deg, rgba(67,233,123,0.88) 0%, rgba(56,249,215,0.88) 100%)',
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
          Browse and book university facilities. Select a category below to
          explore available resources.
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
              <div
                className="hub-card__overlay"
                style={{ background: cat.gradient }}
              />
            </div>
            <div className="hub-card__content">
              <h2 className="hub-card__title">{cat.label}</h2>
              <p className="hub-card__desc">{cat.description}</p>
              <span className="hub-card__arrow">Explore -&gt;</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
