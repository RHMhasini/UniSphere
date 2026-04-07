import "./HowItWorks.css";

const steps = [
  {
    num: "01",
    title: "Sign In with Google",
    desc: "Authenticate securely via OAuth 2.0. Your role is assigned automatically based on your university account.",
  },
  {
    num: "02",
    title: "Browse & Book Resources",
    desc: "Search the facility catalogue by type, capacity, or location. Submit a booking request and get notified once it's reviewed by an admin.",
  },
  {
    num: "03",
    title: "Report & Resolve Issues",
    desc: "Spotted a broken projector? Raise a maintenance ticket, attach photos, and track it from OPEN to RESOLVED — all in real time.",
  },
];

function HowItWorks() {
  return (
    <section className="hiw" id="how-it-works">
      <div className="container">
        <div className="hiw__header">
          <p className="hiw__label">Simple by Design</p>
          <h2 className="hiw__title">Up and running in three steps</h2>
        </div>

        <div className="hiw__steps">
          {steps.map((s, i) => (
            <div className="hiw__step" key={i}>
              <div className="hiw__step-num">{s.num}</div>
              {i < steps.length - 1 && (
                <div className="hiw__connector" aria-hidden="true">
                  <svg viewBox="0 0 100 2" preserveAspectRatio="none">
                    <line x1="0" y1="1" x2="100" y2="1" stroke="var(--border)" strokeWidth="2" strokeDasharray="6 4"/>
                  </svg>
                </div>
              )}
              <div className="hiw__step-body">
                <h3 className="hiw__step-title">{s.title}</h3>
                <p className="hiw__step-desc">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
