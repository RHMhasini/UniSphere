import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyBookings, cancelBooking } from "../../../services/bookingService";
import "../../../styles/bookingPagesCSS/MyBookingsPage.css";

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: "bg-[#fef9c3] text-[#ca8a04]",
    APPROVED: "bg-[#dcfce7] text-[#16a34a]",
    REJECTED: "bg-[#fee2e2] text-[#dc2626]",
    CANCELLED: "bg-[#f3f4f6] text-[#6b7280]",
  };
  return (
    <span className={`px-3 py-1 font-bold text-[11px] rounded uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  );
};

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking(id);
        fetchBookings();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to cancel booking');
      }
    }
  };

  if (loading) return <div className="p-12 text-center text-[#64748b]">Loading bookings...</div>;

  return (
    <div className="mb-container">
      <main className="mb-main">
        
        {/* Header Section */}
        <div className="mb-header-wrapper">
          <div>
            <h4 className="mb-dept-label">
              Campus Resource Management
            </h4>
            <h1 className="mb-title">
              My Bookings
            </h1>
            <p className="mb-desc">
              Manage your active reservations for lab equipment, auditorium spaces, and collaborative study zones across the smart campus network.
            </p>
          </div>
          <div className="mb-toggle-group">
            <button className="mb-toggle-active">
              Upcoming
            </button>
            <button className="mb-toggle-inactive">
              Past History
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-summary-grid">
          <div className="mb-card-dark">
            <div>
              <p className="mb-card-dark-title">Active Reservations</p>
              <h2 className="mb-card-dark-value">
                {bookings.filter(b => b.status === "APPROVED" || b.status === "PENDING").length.toString().padStart(2, '0')}
              </h2>
            </div>
            <div className="mb-card-dark-icon">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2ac88c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
            </div>
          </div>
          <div className="mb-card-light">
             <p className="mb-card-light-title">Pending Approval</p>
             <h2 className="mb-card-light-value">
               {bookings.filter(b => b.status === "PENDING").length.toString().padStart(2, '0')}
             </h2>
          </div>
          <div className="mb-card-light">
             <p className="mb-card-light-title">Facility Access</p>
             <h2 className="mb-card-light-value">94%</h2>
          </div>
        </div>

        {/* Table Headers */}
        <div className="mb-table-header">
           <div className="mb-th-large">Resource / Facility</div>
           <div className="mb-th-medium">Date & Time</div>
           <div className="mb-th-small">Location</div>
           <div className="mb-th-small mb-th-center">Status</div>
           <div className="mb-th-right">Actions</div>
        </div>

        {/* List Areas */}
        <div className="mb-list-wrapper">
          {bookings.length === 0 ? (
             <div className="mb-empty-state">
               No bookings found. Try creating one!
             </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="mb-list-item">
                
                {/* Resource Info */}
                <div className="col-span-4 flex items-center gap-4 w-full">
                  <div className="mb-img-wrapper">
                     <div className="mb-img-mock"></div>
                  </div>
                  <div>
                    <Link to={`/bookings/${booking.id}`} className="mb-resource-name">
                      {booking.resourceName}
                    </Link>
                    <p className="mb-resource-desc">
                      Desc: {booking.purpose || 'General Booking'}
                    </p>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="col-span-3 w-full">
                  <p className="mb-date-text">
                    {new Date(booking.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="mb-time-text">
                    {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Location */}
                <div className="col-span-2 w-full flex items-center">
                  <div className="mb-location-badge">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span className="text-[10px] font-bold text-[#4a5568]">Campus Hub</span>
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-2 w-full lg:text-center">
                  <StatusBadge status={booking.status} />
                </div>

                {/* Actions */}
                <div className="col-span-1 w-full flex justify-end">
                  {booking.status === "APPROVED" ? (
                    <button onClick={() => handleCancel(booking.id)} className="mb-action-cancel">
                      Cancel
                    </button>
                  ) : booking.status === "REJECTED" ? (
                    <Link to={`/bookings/${booking.id}`} className="mb-action-details">
                      Details
                    </Link>
                  ) : booking.status === "CANCELLED" ? (
                    <Link to={`/booking/create?resourceId=${booking.resourceId}`} className="mb-action-rebook">
                      Rebook
                    </Link>
                  ) : (
                    <Link to={`/bookings/${booking.id}`} className="text-gray-400 hover:text-gray-900">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                    </Link>
                  )}
                </div>

              </div>
            ))
          )}
        </div>

        {/* Bottom Banner Cards */}
        <div className="mb-bottom-grid">
          <div className="mb-policy-card">
             <div className="mb-policy-icon">
               <span className="text-[#2ac88c] font-serif text-xl">?</span>
             </div>
             <h4 className="mb-policy-title">Booking Policies</h4>
             <p className="mb-policy-desc">
               Review resource-specific guidelines and cancellation windows.
             </p>
          </div>
          <div className="mb-support-card">
             <div className="mb-support-icon">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
             </div>
             <h4 className="mb-support-title">Support Center</h4>
             <p className="mb-support-desc">
               Need help with complex facility requirements? Talk to a coordinator.
             </p>
          </div>
          <div className="mb-insight-card">
             <div className="mb-insight-icon">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#064e3b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
             </div>
             <h4 className="mb-insight-title">Usage Insights</h4>
             <p className="mb-insight-desc">
               View your monthly facility utilization and efficiency metrics.
             </p>
          </div>
        </div>

        {/* Floating FAB for Mobile or Bottom Right */}
        <div className="fixed bottom-10 right-10 z-50">
           <Link to="/booking/create" className="mb-fab">
             <span className="text-xl leading-none mt-[-2px]">+</span> Create New Booking
           </Link>
        </div>

      </main>
    </div>
  );
};

export default MyBookingsPage;
