import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/bookingPagesCSS/SupportCenterPage.css";

const SupportCenterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would be an API call
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", message: "" });
    }, 3000);
  };

  const faqs = [
    {
      q: "How long does the approval process take?",
      a: "Most requests are reviewed by the department administrator within 12-24 hours. Peak times may take slightly longer."
    },
    {
      q: "Can I book a resource for recurring sessions?",
      a: "Yes, you can select recurring dates in the advanced booking section, or contact support for semester-long reservations."
    },
    {
      q: "What should I do if the equipment is damaged?",
      a: "Report it immediately via the contact form below or call the technical hotline at +1 (555) 0199."
    },
    {
      q: "Is there a limit on how many labs I can book?",
      a: "Currently, users are limited to 3 active bookings at a time to ensure fair access for everyone."
    }
  ];

  return (
    <div className="sc-container">
      <main className="sc-main">
        <button onClick={() => navigate(-1)} className="sc-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Bookings
        </button>

        <header className="sc-header">
          <div>
            <h1 className="sc-title">Support Center</h1>
            <p className="sc-subtitle">Get help with your campus facility reservations and technical needs.</p>
          </div>
        </header>

        <div className="sc-grid">
          {/* Left Column: FAQ and Contact */}
          <div className="sc-left-col">
            <section className="sc-card">
              <h2 className="sc-card-title">Frequently Asked Questions</h2>
              <div className="sc-faq-list">
                {faqs.map((faq, i) => (
                  <div key={i} className="sc-faq-item">
                    <div className="sc-faq-question">
                      {faq.q}
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                    <p className="sc-faq-answer">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="sc-card">
              <h2 className="sc-card-title">Direct Message</h2>
              {submitted ? (
                <div className="bg-[#eff6ff] border border-[#2563eb] text-[#1d4ed8] p-4 rounded-xl font-bold text-center">
                  Message Sent! We will get back to you shortly.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="sc-form-group">
                      <label className="sc-label">Your Name</label>
                      <input 
                        className="sc-input" 
                        type="text" 
                        placeholder="John Doe" 
                        required 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="sc-form-group">
                      <label className="sc-label">Email Address</label>
                      <input 
                        className="sc-input" 
                        type="email" 
                        placeholder="john@unisphere.edu" 
                        required 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="sc-form-group">
                    <label className="sc-label">Message</label>
                    <textarea 
                      className="sc-textarea" 
                      rows="4" 
                      placeholder="Describe your issue or request..." 
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    ></textarea>
                  </div>
                  <button type="submit" className="sc-submit-btn">Send Message</button>
                </form>
              )}
            </section>
          </div>

          {/* Right Column: Support Team and Links */}
          <div className="sc-right-col">
            <div className="sc-team-card">
              <h3 className="sc-team-title">Campus Support Team</h3>
              <div className="sc-team-contact">
                <div className="sc-team-item">
                  <svg className="sc-team-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  <span>+1 (555) 0122 (Extension 104)</span>
                </div>
                <div className="sc-team-item">
                  <svg className="sc-team-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  <span>support@unisphere.edu</span>
                </div>
                <div className="sc-team-item">
                  <svg className="sc-team-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  <span>Mon-Fri, 8 AM - 6 PM</span>
                </div>
              </div>
            </div>

            <section className="sc-card">
              <h3 className="sc-card-title">Department Links</h3>
              <div className="sc-link-list">
                <a href="#" className="sc-link-item">
                  <span className="sc-link-name">Engineering & Robotics Hub</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                </a>
                <a href="#" className="sc-link-item">
                  <span className="sc-link-name">Smart Campus Infrastructure</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                </a>
                <a href="#" className="sc-link-item">
                  <span className="sc-link-name">Central Administration Pool</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupportCenterPage;
