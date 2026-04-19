import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./pages/landingPage/LandingPage";
import TicketDashboard from "./pages/tickets/TicketDashboard";
import CreateTicket from "./pages/tickets/CreateTicket";
import TicketDetails from "./pages/tickets/TicketDetails";
import MockLogin from "./pages/login/MockLogin";
import PageLayout from "./components/common/PageLayout/PageLayout";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppRoutes({ theme, toggleTheme }) {
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  if (isLogin) {
    return <MockLogin />;
  }

  return (
    <PageLayout theme={theme} toggleTheme={toggleTheme}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tickets" element={
          <ProtectedRoute><TicketDashboard /></ProtectedRoute>
        } />
        <Route path="/tickets/create" element={
          <ProtectedRoute><CreateTicket /></ProtectedRoute>
        } />
        <Route path="/tickets/:id" element={
          <ProtectedRoute><TicketDetails /></ProtectedRoute>
        } />
      </Routes>
    </PageLayout>
  );
}

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
      <BrowserRouter>
        <AppRoutes theme={theme} toggleTheme={toggleTheme} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
