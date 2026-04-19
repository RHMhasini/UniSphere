import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import LandingPage from './pages/landingPage/LandingPage';
import AdminResourceForm from './pages/facilitiesPages/AdminResourceForm';
import ResourceCategoryHub from './pages/facilitiesPages/ResourceCategoryHub';
import LectureHalls from './pages/LectureHalls';
import Labs from './pages/Labs';
import MeetingRooms from './pages/MeetingRooms';
import Equipment from './pages/Equipment';
import './index.css';

function NavBar({ theme, toggleTheme }) {
  const navigate = useNavigate();
  return (
    <nav className="top-nav">
      <button className="top-nav__logo" onClick={() => navigate('/')}>🏛️ UniSphere</button>
      <div className="top-nav__links">
        <button onClick={() => navigate('/categories')}>Resources</button>
        <button onClick={() => navigate('/admin/resources')}>Admin</button>
        <button className="top-nav__theme" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </nav>
  );
}

function AppLayout({ theme, toggleTheme, children }) {
  return (
    <>
      <NavBar theme={theme} toggleTheme={toggleTheme} />
      <main>{children}</main>
    </>
  );
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((p) => (p === 'light' ? 'dark' : 'light'));

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page – full screen, no nav bar */}
        <Route path="/" element={<LandingPage theme={theme} toggleTheme={toggleTheme} />} />

        {/* Admin */}
        <Route
          path="/admin/resources"
          element={
            <AppLayout theme={theme} toggleTheme={toggleTheme}>
              <AdminResourceForm />
            </AppLayout>
          }
        />

        {/* Resource Hub */}
        <Route
          path="/categories"
          element={
            <AppLayout theme={theme} toggleTheme={toggleTheme}>
              <ResourceCategoryHub />
            </AppLayout>
          }
        />

        {/* Category Detail Pages */}
        <Route
          path="/categories/lecture-halls"
          element={
            <AppLayout theme={theme} toggleTheme={toggleTheme}>
              <LectureHalls />
            </AppLayout>
          }
        />
        <Route
          path="/categories/labs"
          element={
            <AppLayout theme={theme} toggleTheme={toggleTheme}>
              <Labs />
            </AppLayout>
          }
        />
        <Route
          path="/categories/meeting-rooms"
          element={
            <AppLayout theme={theme} toggleTheme={toggleTheme}>
              <MeetingRooms />
            </AppLayout>
          }
        />
        <Route
          path="/categories/equipment"
          element={
            <AppLayout theme={theme} toggleTheme={toggleTheme}>
              <Equipment />
            </AppLayout>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
