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
        <Route path="/tickets" element={<TicketDashboard />} />
        <Route path="/tickets/create" element={<CreateTicket />} />
        <Route path="/tickets/:id" element={<TicketDetails />} />
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
