import "./Hero.css";

function Hero() {
  return (
    <section className="hero">
      {/* Decorative background grid */}
      <div className="hero__grid-bg" aria-hidden="true"></div>

      <div className="container hero__content">
        {/* Badge */}
        <div className="hero__badge">
          <span className="hero__badge-dot"></span>
          Smart Campus Operations
        </div>

        {/* Headline */}
        <h1 className="hero__headline">
          One Platform.<br />
          <span className="hero__headline-accent">Total Campus Control.</span>
        </h1>

        {/* Subheadline */}
        <p className="hero__sub">
          UniSphere brings facility bookings, asset management, and maintenance
          ticketing into a single, secure, role-driven hub — built for modern
          universities.
        </p>

        {/* CTA buttons */}
        <div className="hero__cta">
          <a href="/register" className="hero__btn hero__btn--primary">
            Get Started Free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
          <a href="#features" className="hero__btn hero__btn--ghost">
            Explore Features
          </a>
        </div>

        {/* Trust bar */}
        <div className="hero__trust">
          <div className="hero__trust-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Role-based access
          </div>
          <div className="hero__trust-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            OAuth 2.0 secured
          </div>
          <div className="hero__trust-item">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Real-time notifications
          </div>
        </div>

        {/* Dashboard preview mockup */}
        <div className="hero__mockup" aria-hidden="true">
          <div className="hero__mockup-bar">
            <span></span><span></span><span></span>
            <div className="hero__mockup-url">unisphere.edu/dashboard</div>
          </div>
          <div className="hero__mockup-body">
            <div className="hero__mockup-sidebar">
              <div className="hero__mock-item hero__mock-item--active">Dashboard</div>
              <div className="hero__mock-item">Bookings</div>
              <div className="hero__mock-item">Facilities</div>
              <div className="hero__mock-item">Tickets</div>
              <div className="hero__mock-item">Users</div>
            </div>
            <div className="hero__mockup-main">
              <div className="hero__mock-stat-row">
                <div className="hero__mock-stat">
                  <div className="hero__mock-stat-num">24</div>
                  <div className="hero__mock-stat-label">Bookings Today</div>
                </div>
                <div className="hero__mock-stat">
                  <div className="hero__mock-stat-num">8</div>
                  <div className="hero__mock-stat-label">Open Tickets</div>
                </div>
                <div className="hero__mock-stat">
                  <div className="hero__mock-stat-num">142</div>
                  <div className="hero__mock-stat-label">Resources</div>
                </div>
              </div>
              <div className="hero__mock-table">
                <div className="hero__mock-row hero__mock-row--head">
                  <span>Resource</span><span>Status</span><span>Time</span>
                </div>
                {[
                  { name: "Lab A-101", status: "APPROVED", color: "#16a34a" },
                  { name: "Board Room 3", status: "PENDING", color: "#d97706" },
                  { name: "Projector #07", status: "APPROVED", color: "#16a34a" },
                  { name: "Lecture Hall B", status: "REJECTED", color: "#dc2626" },
                ].map((r, i) => (
                  <div className="hero__mock-row" key={i}>
                    <span>{r.name}</span>
                    <span style={{ color: r.color, fontWeight: 600, fontSize: "0.75rem" }}>{r.status}</span>
                    <span>09:{String(i * 15).padStart(2, "0")} AM</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
