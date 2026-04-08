import BackgroundSlider from "../BackgroundSlider/BackgroundSlider";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero">
      {/* Ken Burns background slider */}
      <BackgroundSlider />

      <div className="container hero__content">
        <div className="hero__left">
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
            ticketing into a single, secure, role-driven hub - built for modern
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Role-based access
            </div>
            <div className="hero__trust-divider" aria-hidden="true" />
            <div className="hero__trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              OAuth 2.0 secured
            </div>
            <div className="hero__trust-divider" aria-hidden="true" />
            <div className="hero__trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Real-time notifications
            </div>
          </div>
        </div>


      </div>

      {/* Scroll indicator */}
      <div className="hero__scroll-hint" aria-hidden="true">
        <div className="hero__scroll-mouse">
          <div className="hero__scroll-wheel" />
        </div>
      </div>
    </section>
  );
}

export default Hero;
