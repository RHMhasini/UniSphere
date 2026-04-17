import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import LandingPage from "./pages/landingPage/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OAuth2RedirectHandler from "./pages/OAuth2RedirectHandler";
import RegisterDetails from "./pages/RegisterDetails";
import RegisterPending from "./pages/RegisterPending";
import RegisterRejected from "./pages/RegisterRejected";
import Dashboard from "./pages/dashboard/Dashboard";
import DashboardHome from "./pages/dashboard/Home/DashboardHome";
import UserManagement from "./pages/dashboard/UserManagement/UserManagement";
import NotificationsPage from "./pages/dashboard/Notifications/NotificationsPage";
import Profile from "./pages/dashboard/Profile/Profile";
import Analytics from "./pages/dashboard/Analytics/Analytics";
import SimulatorPage from "./pages/dashboard/Simulator/SimulatorPage";
import SettingsPage from "./pages/dashboard/Settings/SettingsPage";
import AccessDenied from "./pages/error/AccessDenied";
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
            
            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardHome />} />
              <Route path="users" element={
                <ProtectedRoute roles={['ADMIN']}>
                  <UserManagement />
                </ProtectedRoute>
              } />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="analytics" element={
                <ProtectedRoute roles={['ADMIN']}>
                  <Analytics />
                </ProtectedRoute>
              } />
              <Route path="simulator" element={
                <ProtectedRoute roles={['ADMIN']}>
                  <SimulatorPage />
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
                  <ProtectedRoute roles={['STUDENT', 'ADMIN']}>
                    <div>Facilities (Coming Soon)</div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="classes"
                element={
                  <ProtectedRoute roles={['LECTURER', 'ADMIN']}>
                    <div>Classes (Coming Soon)</div>
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
                path="inventory"
                element={
                  <ProtectedRoute roles={['TECHNICIAN', 'ADMIN']}>
                    <div>Asset Inventory (Coming Soon)</div>
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
