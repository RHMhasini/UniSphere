import { useNavigate } from "react-router-dom";
import "../../styles/bookingPagesCSS/BookingPoliciesPage.css";

const BookingPoliciesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bp-container">
      <main className="bp-main">
        <button onClick={() => navigate(-1)} className="bp-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Bookings
        </button>

        <header className="bp-header">
          <h1 className="bp-title">Resource Booking Policies</h1>
          <p className="bp-subtitle">
            Ensuring fair access and optimal utilization of smart campus facilities for all students and staff.
          </p>
        </header>

        {/* Cancellation Section */}
        <section className="bp-section">
          <div className="bp-section-title">
            <div className="bp-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            Cancellation & Modification
          </div>
          <div className="bp-rule-list">
            <div className="bp-rule-item">
              <span className="bp-bullet"></span>
              <p className="bp-rule-text"><strong>24-Hour Notice:</strong> Cancellations must be submitted at least 24 hours before the scheduled start time to allow others to reserve the slot.</p>
            </div>
            <div className="bp-rule-item">
              <span className="bp-bullet"></span>
              <p className="bp-rule-text"><strong>Short-Notice Penalty:</strong> Repeated cancellations with less than 24 hours notice may lead to a temporary suspension of booking privileges.</p>
            </div>
            <div className="bp-rule-item">
              <span className="bp-bullet"></span>
              <p className="bp-rule-text"><strong>Modifications:</strong> Time slots can be adjusted up to 6 hours before the start time, provided the resource is available.</p>
            </div>
          </div>
        </section>

        {/* Booking Rules Section */}
        <section className="bp-section">
          <div className="bp-section-title">
            <div className="bp-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            Booking Constraints
          </div>
          <div className="bp-rule-list">
            <div className="bp-rule-item">
              <span className="bp-bullet"></span>
              <p className="bp-rule-text"><strong>Max Duration:</strong> Single bookings are capped at 4 hours for standard labs and 8 hours for project zones.</p>
            </div>
            <div className="bp-rule-item">
              <span className="bp-bullet"></span>
              <p className="bp-rule-text"><strong>Advance Booking:</strong> Resources can be reserved up to 14 days in advance.</p>
            </div>
            <div className="bp-rule-item">
              <span className="bp-bullet"></span>
              <p className="bp-rule-text"><strong>Concurrent Limits:</strong> Users may have a maximum of 3 active (upcoming) bookings at any given time.</p>
            </div>
          </div>
          <div className="bp-stat-grid">
            <div className="bp-stat-card">
              <p className="bp-stat-label">Max Active</p>
              <p className="bp-stat-value">03 Bookings</p>
            </div>
            <div className="bp-stat-card">
              <p className="bp-stat-label">Advance Limit</p>
              <p className="bp-stat-value">14 Days</p>
            </div>
          </div>
        </section>

        {/* Usage Guidelines Section */}
        <section className="bp-section">
          <div className="bp-section-title">
            <div className="bp-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            On-Site Guidelines
          </div>
          <div className="bp-rule-list">
            <div className="bp-rule-item">
              <span className="bp-bullet"></span>
              <p className="bp-rule-text"><strong>Check-in Requirement:</strong> You must check in at the resource terminal within 15 minutes of the start time, or the booking will be auto-cancelled.</p>
            </div>
            <div className="bp-rule-item">
              <span className="bp-bullet"></span>
              <p className="bp-rule-text"><strong>Cleanup:</strong> Ensure the facility is left in its original state. Report any hardware issues immediately via the Support Center.</p>
            </div>
            <div className="bp-rule-item">
              <span className="bp-bullet"></span>
              <p className="bp-rule-text"><strong>Safety First:</strong> Adhere to all safety protocols specific to the lab or facility you are using.</p>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="bp-section">
          <div className="bp-section-title">
            <div className="bp-icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
            </div>
            Approval Status Info
          </div>
          <div className="bp-rule-list">
            <div className="bp-rule-item">
              <p className="bp-rule-text"><strong>Approved:</strong> Your reservation is confirmed. You will receive a smart-access token via the UniSphere app 15 minutes before the session starts.</p>
            </div>
            <div className="bp-rule-item">
              <p className="bp-rule-text"><strong>Rejected:</strong> Your request was declined. Common reasons include maintenance scheduling or conflicting departmental events. A reason will be provided in the booking details.</p>
            </div>
          </div>
        </section>

        <div className="bp-contact-box">
          <h2 className="bp-contact-title">Still have questions?</h2>
          <p className="bp-contact-desc">Our administrative team is here to help with complex scheduling needs.</p>
          <button onClick={() => navigate('/booking/support')} className="bp-contact-btn">
            Contact Support
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </div>
      </main>
    </div>
  );
};

export default BookingPoliciesPage;
