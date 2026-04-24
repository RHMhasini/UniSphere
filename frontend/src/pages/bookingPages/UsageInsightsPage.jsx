import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyBookings } from "../../services/bookingService";
import "../../styles/bookingPagesCSS/UsageInsightsPage.css";

const UsageInsightsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMyBookings();
        setBookings(data);
      } catch (error) {
        console.error("Error fetching insights:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-12 text-center text-[#64748b]">Analyzing usage data...</div>;

  // Derive Statistics
  const total = bookings.length;
  const approved = bookings.filter(b => b.status === 'APPROVED').length;
  const rejected = bookings.filter(b => b.status === 'REJECTED').length;
  const cancelled = bookings.filter(b => b.status === 'CANCELLED').length;
  const upcoming = bookings.filter(b => new Date(b.startTime) > new Date() && b.status !== 'CANCELLED').length;

  // Find most booked resource
  const counts = {};
  bookings.forEach(b => {
    counts[b.resourceName] = (counts[b.resourceName] || 0) + 1;
  });
  const mostBooked = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, "No bookings yet");

  // Mock bar chart data (last 5 months)
  const months = ["JAN", "FEB", "MAR", "APR", "MAY"];
  const barHeights = ["h-12", "h-24", "h-16", "h-32", "h-20"];

  return (
    <div className="ui-container">
      <main className="ui-main">
        <button onClick={() => navigate(-1)} className="ui-back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Bookings
        </button>

        <header className="ui-header">
          <h1 className="ui-title">Usage Insights</h1>
          <p className="ui-subtitle">Personal diagnostics and campus facility utilization metrics.</p>
        </header>

        {/* Top Summary Stats */}
        <div className="ui-stats-row">
          <div className="ui-stat-card">
            <p className="ui-stat-label">Total Reservations</p>
            <h2 className="ui-stat-value">{total || '00'}</h2>
            <p className="ui-stat-footer ui-stat-footer-neutral">Lifetime bookings</p>
          </div>
          <div className="ui-stat-card">
            <p className="ui-stat-label">Approved Slots</p>
            <h2 className="ui-stat-value">{approved || '00'}</h2>
            <p className="ui-stat-footer ui-stat-footer-up">
              {total > 0 ? Math.round((approved/total)*100) : 0}% success rate
            </p>
          </div>
          <div className="ui-stat-card">
            <p className="ui-stat-label">Upcoming</p>
            <h2 className="ui-stat-value">{upcoming || '00'}</h2>
            <p className="ui-stat-footer ui-stat-footer-neutral">Active reservations</p>
          </div>
          <div className="ui-stat-card">
            <p className="ui-stat-label">Cancellations</p>
            <h2 className="ui-stat-value">{cancelled || '00'}</h2>
            <p className="ui-stat-footer text-red-500">
              {rejected} system rejections
            </p>
          </div>
        </div>

        <div className="ui-grid">
          {/* Chart Section */}
          <div className="ui-chart-box">
            <h3 className="ui-section-title">Booking Distribution (Monthly)</h3>
            <div className="ui-chart-placeholder">
              <div className="ui-chart-bar-container">
                {barHeights.map((h, i) => (
                  <div key={i} className={`ui-chart-bar ${h}`}></div>
                ))}
              </div>
            </div>
            <div className="ui-label-row">
              {months.map(m => <span key={m}>{m}</span>)}
            </div>
          </div>

          {/* Side Info */}
          <div className="ui-history-box">
             <h3 className="ui-section-title">Efficiency Analytics</h3>
             <div className="mb-6 p-4 bg-[#1e293b] rounded-xl text-white">
                <p className="text-[10px] font-bold text-[#a6b0cf] uppercase tracking-widest mb-1">Most Utilized Resource</p>
                <p className="text-sm font-bold truncate">{mostBooked}</p>
             </div>

             <h3 className="ui-section-title">Recent History</h3>
             <div className="ui-history-list">
               {bookings.slice(0, 4).map(b => (
                 <div key={b.id} className="ui-history-item">
                   <div className="ui-history-icon">
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2ac88c" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                   </div>
                   <div>
                     <p className="ui-history-name">{b.resourceName}</p>
                     <p className="ui-history-date">{new Date(b.startTime).toLocaleDateString()}</p>
                   </div>
                 </div>
               ))}
               {bookings.length === 0 && <p className="text-xs text-[#64748b]">No clear history yet.</p>}
             </div>

             <div className="mt-8 p-4 border border-[#2ac88c] border-dashed rounded-xl">
               <p className="text-xs font-medium text-[#4a5568]">Tip: Booking project zones during mid-week (Tues-Wed) has a 20% higher approval rate.</p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UsageInsightsPage;
