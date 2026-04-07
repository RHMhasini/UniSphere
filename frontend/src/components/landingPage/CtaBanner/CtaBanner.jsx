import "./CtaBanner.css";

function CtaBanner() {
  return (
    <section className="cta-banner" id="contact">
      <div className="container cta-banner__inner">
        <div className="cta-banner__text">
          <h2 className="cta-banner__title">Ready to modernise your campus?</h2>
          <p className="cta-banner__sub">
            Join UniSphere and bring order to bookings, assets, and maintenance -
            all under one secure roof.
          </p>
        </div>
        <div className="cta-banner__actions">
          <a href="/register" className="cta-btn cta-btn--white">
            Get Started Free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
          <a href="/login" className="cta-btn cta-btn--ghost">Log In</a>
        </div>
      </div>
    </section>
  );
}

export default CtaBanner;
