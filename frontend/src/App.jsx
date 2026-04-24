import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";

// Components & Layout
import LandingPage from "./pages/landingPage/LandingPage";
import Dashboard from "./pages/dashboard/Dashboard";
import DashboardHome from "./pages/dashboard/Home/DashboardHome";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Authentication Pages
import Login from "./pages/Authentication/Login";
import Register from "./pages/Authentication/Register";
import OAuth2RedirectHandler from "./pages/Authentication/OAuth2RedirectHandler";
import RegisterDetails from "./pages/Authentication/RegisterDetails";
import RegisterPending from "./pages/Authentication/RegisterPending";
import RegisterRejected from "./pages/Authentication/RegisterRejected";

// User & Admin Pages
import UserManagement from "./pages/dashboard/UserManagement/UserManagement";
import UserDetailPage from "./pages/dashboard/UserManagement/UserDetailPage";
import NotificationsPage from "./pages/dashboard/Notifications/NotificationsPage";
import Profile from "./pages/dashboard/Profile/Profile";
import Analytics from "./pages/dashboard/Analytics/Analytics";
import SettingsPage from "./pages/dashboard/Settings/SettingsPage";

// Resource Management Pages
import ResourcesPage from "./pages/facilitiesPages/ResourceCategoryHub";
import LectureHalls from "./pages/facilitiesPages/LectureHalls";
import Labs from "./pages/facilitiesPages/Labs";
import MeetingRooms from "./pages/facilitiesPages/MeetingRooms";
import Equipment from "./pages/facilitiesPages/Equipment";
import AdminResourceForm from "./pages/facilitiesPages/AdminResourceForm";

// Booking Hub Pages
import CreateBookingPage from './pages/bookingPages/CreateBookingPage';
import EditBookingPage from './pages/bookingPages/EditBookingPage';
import MyBookingsPage from './pages/bookingPages/MyBookingsPage';
import BookingDetailPage from './pages/bookingPages/BookingDetailPage';
import AdminBookingsPage from './pages/bookingPages/AdminBookingsPage';
import BookingPoliciesPage from './pages/bookingPages/BookingPoliciesPage';
import SupportCenterPage from './pages/bookingPages/SupportCenterPage';
import UsageInsightsPage from './pages/bookingPages/UsageInsightsPage';

import AccessDenied from "./pages/error/AccessDenied";
import InactiveDashboard from "./pages/dashboard/InactiveDashboard";

import "./index.css";

const GOOGLE_CLIENT_ID = "625444495391-kea4ugn1uhhn8m78c3o6ptjujk42bi8e.apps.googleusercontent.com";

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
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
            
            <Route path="/register/details" element={
              <ProtectedRoute>
                <RegisterDetails />
              </ProtectedRoute>
            } />
            <Route path="/register/pending" element={
              <ProtectedRoute>
                <RegisterPending />
              </ProtectedRoute>
            } />
            <Route path="/register/rejected" element={<RegisterRejected />} />
            <Route path="/access-denied" element={<AccessDenied />} />
            
            <Route path="/dashboard/inactive" element={
              <ProtectedRoute>
                <InactiveDashboard />
              </ProtectedRoute>
            } />
            
            {/* Main Integrated Dashboard */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard theme={theme} toggleTheme={toggleTheme} />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardHome />} />
              
              {/* User & Admin Tools */}
              <Route path="users" element={
                <ProtectedRoute roles={['ADMIN']}>
                  <UserManagement />
                </ProtectedRoute>
              } />
              <Route path="users/:id" element={
                <ProtectedRoute roles={['ADMIN']}>
                  <UserDetailPage />
                </ProtectedRoute>
              } />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="analytics" element={
                <ProtectedRoute roles={['ADMIN']}>
                  <Analytics />
                </ProtectedRoute>
              } />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<SettingsPage />} />

              {/* Resource Management Bundle */}
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="resources/lecture-halls" element={<LectureHalls />} />
              <Route path="resources/labs" element={<Labs />} />
              <Route path="resources/meeting-rooms" element={<MeetingRooms />} />
              <Route path="resources/equipment" element={<Equipment />} />
              <Route path="resources/manage" element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminResourceForm />
                </ProtectedRoute>
              } />

              {/* Integrated Booking Hub Routes (Replacement for Coming Soon) */}
              <Route path="bookings" element={<MyBookingsPage />} />
              <Route path="bookings/create" element={<CreateBookingPage />} />
              <Route path="bookings/:id/edit" element={<EditBookingPage />} />
              <Route path="bookings/:id" element={<BookingDetailPage />} />
              <Route path="bookings/admin" element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminBookingsPage />
                </ProtectedRoute>
              } />
              <Route path="bookings/policies" element={<BookingPoliciesPage />} />
              <Route path="bookings/support" element={<SupportCenterPage />} />
              <Route path="bookings/insights" element={<UsageInsightsPage />} />

              {/* Service Desk Placeholders */}
              <Route path="tickets" element={
                <ProtectedRoute roles={['TECHNICIAN', 'ADMIN']}>
                  <div className="p-10 font-bold text-gray-400">Service Tickets (Coming Soon)</div>
                </ProtectedRoute>
              } />
              <Route path="mytickets" element={
                <ProtectedRoute roles={['STUDENT', 'LECTURER']}>
                  <div className="p-10 font-bold text-gray-400">My Tickets (Coming Soon)</div>
                </ProtectedRoute>
              } />
            </Route>

            {/* Legacy Redirects for backwards compatibility */}
            <Route path="/my-bookings" element={<Navigate to="/dashboard/bookings" replace />} />
            <Route path="/booking/create" element={<Navigate to="/dashboard/bookings/create" replace />} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;