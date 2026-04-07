import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import CreateBookingPage from './pages/CreateBookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import BookingDetailPage from './pages/BookingDetailPage';
import AdminBookingsPage from './pages/AdminBookingsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              {/* Redirect root to my bookings */}
              <Route path="/" element={<Navigate to="/my-bookings" replace />} />
              
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
              <Route path="*" element={<Navigate to="/my-bookings" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;