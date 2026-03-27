import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <a href="/" className="footer__logo">
            <span className="footer__logo-icon">◈</span>
            UniSphere
          </a>
          <p className="footer__tagline">Smart Campus Operations Hub</p>
        </div>

        <nav className="footer__nav">
          <div className="footer__nav-group">
            <h4 className="footer__nav-head">Platform</h4>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="/login">Log In</a>
          </div>
          <div className="footer__nav-group">
            <h4 className="footer__nav-head">Modules</h4>
            <a href="#">Facility Bookings</a>
            <a href="#">Maintenance Tickets</a>
            <a href="#">Notifications</a>
          </div>
        </nav>
      </div>

      <div className="footer__bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} UniSphere · SLIIT IT3030 Assignment · All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
