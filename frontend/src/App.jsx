import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import LandingPage from "./pages/landingPage/LandingPage";
import Login from "./pages/Authentication/Login";
import Register from "./pages/Authentication/Register";
import OAuth2RedirectHandler from "./pages/Authentication/OAuth2RedirectHandler";
import RegisterDetails from "./pages/Authentication/RegisterDetails";
import RegisterPending from "./pages/Authentication/RegisterPending";
import RegisterRejected from "./pages/Authentication/RegisterRejected";
import Dashboard from "./pages/dashboard/Dashboard";
import DashboardHome from "./pages/dashboard/Home/DashboardHome";
import UserManagement from "./pages/dashboard/UserManagement/UserManagement";
import UserDetailPage from "./pages/dashboard/UserManagement/UserDetailPage";
import NotificationsPage from "./pages/dashboard/Notifications/NotificationsPage";
import Profile from "./pages/dashboard/Profile/Profile";
import Analytics from "./pages/dashboard/Analytics/Analytics";
import ResourcesPage from "./pages/dashboard/Resources/ResourcesPage";
import LectureHalls from "./pages/facilitiesPages/LectureHalls";
import Labs from "./pages/facilitiesPages/Labs";
import MeetingRooms from "./pages/facilitiesPages/MeetingRooms";
import Equipment from "./pages/facilitiesPages/Equipment";
import AdminResourceForm from "./pages/facilitiesPages/AdminResourceForm";

import SettingsPage from "./pages/dashboard/Settings/SettingsPage";
import AccessDenied from "./pages/error/AccessDenied";
import InactiveDashboard from "./pages/dashboard/InactiveDashboard";
import ProtectedRoute from "./components/common/ProtectedRoute";

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
            
            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard theme={theme} toggleTheme={toggleTheme} />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardHome />} />
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
              <Route
                path="bookings"
                element={
                  <ProtectedRoute roles={['STUDENT', 'LECTURER', 'ADMIN']}>
                    <div>Bookings (Coming Soon)</div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="resources"
                element={
                  <ProtectedRoute roles={['STUDENT', 'LECTURER', 'ADMIN']}>
                    <ResourcesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="resources/lecture-halls"
                element={
                  <ProtectedRoute roles={['STUDENT', 'LECTURER', 'ADMIN']}>
                    <LectureHalls />
                  </ProtectedRoute>
                }
              />
              <Route
                path="resources/labs"
                element={
                  <ProtectedRoute roles={['STUDENT', 'LECTURER', 'ADMIN']}>
                    <Labs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="resources/meeting-rooms"
                element={
                  <ProtectedRoute roles={['STUDENT', 'LECTURER', 'ADMIN']}>
                    <MeetingRooms />
                  </ProtectedRoute>
                }
              />
              <Route
                path="resources/equipment"
                element={
                  <ProtectedRoute roles={['STUDENT', 'LECTURER', 'ADMIN']}>
                    <Equipment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="resources/manage"
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <AdminResourceForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="tickets"
                element={
                  <ProtectedRoute roles={['TECHNICIAN', 'ADMIN']}>
                    <div>Service Tickets (Coming Soon)</div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="mytickets"
                element={
                  <ProtectedRoute roles={['STUDENT', 'LECTURER']}>
                    <div>My Tickets (Coming Soon)</div>
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;