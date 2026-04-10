import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landingPage/LandingPage";
import TicketDashboard from "./pages/tickets/TicketDashboard";
import PageLayout from "./components/common/PageLayout/PageLayout";
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
    <BrowserRouter>
      <PageLayout theme={theme} toggleTheme={toggleTheme}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/tickets" element={<TicketDashboard />} />
        </Routes>
      </PageLayout>
    </BrowserRouter>
  );
}

export default App;
