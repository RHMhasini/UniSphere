import "./Features.css";

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <line x1="9" y1="15" x2="9" y2="15" strokeWidth="3"/>
        <line x1="15" y1="15" x2="15" y2="15" strokeWidth="3"/>
      </svg>
    ),
    title: "Facility & Asset Bookings",
    desc: "Reserve lecture halls, labs, meeting rooms, and equipment with conflict detection and an admin approval workflow.",
    tag: "",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
    title: "Maintenance & Incident Ticketing",
    desc: "Submit fault reports with image evidence, track resolution progress, and assign technicians — all in one place.",
    tag: "",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    title: "Real-time Notifications",
    desc: "Stay updated with instant alerts for booking approvals, ticket status changes, and new comments — direct in your dashboard.",
    tag: "",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
    title: "Secure Role-Based Access",
    desc: "Enable sign-in with granular roles to provide tailored access and permissions.",
    tag: "",
  },
];

function Features() {
  return (
    <section className="features" id="features">
      <div className="container">
        <div className="features__header">
          <p className="features__label">What We Offer</p>
          <h2 className="features__title">Everything campus operations need</h2>
          <p className="features__sub">
            Four tightly integrated modules that cover the full lifecycle of campus
            resource management and incident resolution.
          </p>
        </div>

        <div className="features__grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="feature-card__icon">{f.icon}</div>
              <div className="feature-card__tag">{f.tag}</div>
              <h3 className="feature-card__title">{f.title}</h3>
              <p className="feature-card__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
