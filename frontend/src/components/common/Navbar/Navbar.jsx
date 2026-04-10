import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./Navbar.css";

function Navbar({ theme, toggleTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { currentUser, switchUser, MOCK_USERS } = useAuth(); // Global simulated state

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ensure hash links work if on landing page, otherwise direct to landing
  const isLanding = location.pathname === "/";
  const getHref = (hash) => (isLanding ? hash : `/${hash}`);

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">◈</span>
          <span className="navbar__logo-text">UniSphere</span>
        </Link>

        {/* Desktop nav links */}
        <ul className="navbar__links">
          <li><a href={getHref("#features")}>Features</a></li>
          <li><Link to="/tickets">Tickets Dashboard</Link></li>
        </ul>

        {/* Right side actions */}
        <div className="navbar__actions">
          {/* Theme toggle */}
          <button
            className="navbar__theme-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? (
              /* Sun icon */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              /* Moon icon */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {/* Dev Mode Role Switcher */}
          <div className="auth-switcher">
            <span className="auth-switcher-label">Act as:</span>
            <select 
              value={currentUser.id} 
              onChange={(e) => switchUser(e.target.value)}
              className="auth-switcher-select"
            >
              {MOCK_USERS.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>

          {/* Mobile hamburger */}
          <button
            className="navbar__hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="navbar__mobile-menu">
          <a href={getHref("#features")} onClick={() => setMenuOpen(false)}>Features</a>
          <Link to="/tickets" onClick={() => setMenuOpen(false)}>Tickets</Link>
          
          <div className="mobile-auth-switcher">
            <label>Role:</label>
            <select 
              value={currentUser.id} 
              onChange={(e) => switchUser(e.target.value)}
            >
              {MOCK_USERS.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
