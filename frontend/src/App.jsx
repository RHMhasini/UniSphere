import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from "./pages/landingPage/LandingPage";
import CreateBookingPage from './pages/bookingPages/CreateBookingPage';
import MyBookingsPage from './pages/bookingPages/MyBookingsPage';
import BookingDetailPage from './pages/bookingPages/BookingDetailPage';
import AdminBookingsPage from './pages/bookingPages/AdminBookingsPage';

import "./index.css";

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-transparent transition-colors duration-300">
          <Navbar />
          <main>
            <Routes>
              {/* Root route is the Landing Page */}
              <Route path="/" element={<LandingPage theme={theme} toggleTheme={toggleTheme} />} />
              
              <Route path="/booking/create" element={
                <ProtectedRoute>
                  <CreateBookingPage />
                </ProtectedRoute>
              } />
              
              <Route path="/my-bookings" element={
                <ProtectedRoute>
                  <MyBookingsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/bookings/:id" element={
                <ProtectedRoute>
                  <BookingDetailPage />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/bookings" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminBookingsPage />
                </ProtectedRoute>
              } />

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
