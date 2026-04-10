import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landingPage/LandingPage";
import TicketDashboard from "./pages/tickets/TicketDashboard";
import CreateTicket from "./pages/tickets/CreateTicket";
import TicketDetails from "./pages/tickets/TicketDetails";
import PageLayout from "./components/common/PageLayout/PageLayout";
import { AuthProvider } from "./context/AuthContext";
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
      <BrowserRouter>
        <PageLayout theme={theme} toggleTheme={toggleTheme}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/tickets" element={<TicketDashboard />} />
            <Route path="/tickets/create" element={<CreateTicket />} />
            <Route path="/tickets/:id" element={<TicketDetails />} />
          </Routes>
        </PageLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
