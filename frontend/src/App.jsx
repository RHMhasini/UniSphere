import { useState, useEffect } from "react";
import LandingPage from "./pages/landingPage/LandingPage";
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

  return <LandingPage theme={theme} toggleTheme={toggleTheme} />;
}

export default App;
