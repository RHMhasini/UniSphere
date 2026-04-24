import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyBookings, cancelBooking } from "../../services/bookingService";
import BookingTabs from "../../components/common/BookingTabs";
import "../../styles/bookingPagesCSS/MyBookingsPage.css";

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
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

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

  const handleCancelClick = (id) => {
    setCancelBookingId(id);
  };

  const confirmCancel = async () => {
    if (!cancelReason) {
      alert("Please select a reason for cancellation.");
      return;
    }
    try {
      await cancelBooking(cancelBookingId);
      setCancelBookingId(null);
      setCancelReason("");
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const isToday = (dateString) => {
    const today = new Date();
    const d = new Date(dateString);
    return today.toDateString() === d.toDateString();
  };

  const todayBooking = bookings.find(b => isToday(b.startTime) && b.status === "APPROVED");

  if (loading) return <div className="p-12 text-center text-[#64748b]">Loading bookings...</div>;

  return (
    <div className="mb-container">
      <main className="mb-main w-full max-w-[1200px] mx-auto">
        <BookingTabs />
        
        {/* Today's Reminder Alert */}
        {todayBooking && (
          <div className="mb-8 p-5 bg-[#fef2f2] border-2 border-[#fecaca] rounded-2xl flex items-center justify-between shadow-md animate-pulse">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-[#dc2626] rounded-xl flex items-center justify-center text-white text-2xl shadow-sm">
                ⏰
              </div>
              <div>
                <h4 className="text-[16px] font-black text-[#991b1b] uppercase tracking-tight">You have a booking TODAY!</h4>
                <p className="text-[13px] font-bold text-[#b91c1c] opacity-90">
                  {todayBooking.resourceName} — {new Date(todayBooking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(todayBooking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <Link to={`/bookings/${todayBooking.id}`} className="px-4 py-2 bg-[#dc2626] text-white text-[11px] font-black rounded-lg uppercase tracking-widest hover:bg-red-700 transition-colors shadow-sm">
              View Details
            </Link>
          </div>
        )}

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
                <div className="col-span-1 w-full flex justify-end gap-4 items-center">
                  {(booking.status === "APPROVED" || booking.status === "PENDING") && (
                    <Link to={`/dashboard/bookings/${booking.id}/edit`} className="p-2 text-[#2563eb] hover:bg-[#eff6ff] rounded-lg transition-colors flex items-center justify-center" title="Update Booking">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </Link>
                  )}
                  
                  {(booking.status === "APPROVED" || booking.status === "PENDING") ? (
                    <button onClick={() => handleCancelClick(booking.id)} className="mb-action-cancel">
                      Cancel
                    </button>
                  ) : booking.status === "REJECTED" ? (
                    <Link to={`/dashboard/bookings/${booking.id}`} className="mb-action-details">
                      Details
                    </Link>
                  ) : booking.status === "CANCELLED" ? (
                    <Link to={`/dashboard/bookings/create?resourceId=${booking.resourceId}`} className="mb-action-rebook">
                      Rebook
                    </Link>
                  ) : null}
                </div>

              </div>
            ))
          )}
        </div>

        {/* Bottom Banner Cards */}
        <div className="mb-bottom-grid">
          <Link to="/dashboard/bookings/policies" className="mb-policy-card hover:border-[#2ac88c] transition-all">
             <div className="mb-policy-icon">
               <span className="text-[#2ac88c] font-serif text-xl">?</span>
             </div>
             <h4 className="mb-policy-title">Booking Policies</h4>
             <p className="mb-policy-desc">
               Review resource-specific guidelines and cancellation windows.
             </p>
          </Link>
          <Link to="/dashboard/bookings/support" className="mb-support-card hover:border-[#2563eb] transition-all">
             <div className="mb-support-icon">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
             </div>
             <h4 className="mb-support-title">Support Center</h4>
             <p className="mb-support-desc">
               Need help with complex facility requirements? Talk to a coordinator.
             </p>
          </Link>
          <Link to="/dashboard/bookings/insights" className="mb-insight-card hover:border-[#064e3b] transition-all">
             <div className="mb-insight-icon">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#064e3b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
             </div>
             <h4 className="mb-insight-title">Usage Insights</h4>
             <p className="mb-insight-desc">
               View your monthly facility utilization and efficiency metrics.
             </p>
          </Link>
        </div>

        {/* Floating FAB for Mobile or Bottom Right */}
        <div className="fixed bottom-10 right-10 z-50">
           <Link to="/dashboard/bookings/create" className="mb-fab">
             <span className="text-xl leading-none mt-[-2px]">+</span> Create New Booking
           </Link>
        </div>

        {/* Cancellation Reason Modal */}
        {cancelBookingId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
              <h3 className="text-xl font-bold text-[#1e293b] mb-2">Why are you cancelling?</h3>
              <p className="text-sm text-[#64748b] mb-6">Your feedback helps us optimize campus resource allocation.</p>
              
              <div className="space-y-3 mb-8">
                {["Change of plans", "Wrong time selected", "Resource not needed", "Other"].map(reason => (
                  <button 
                    key={reason}
                    onClick={() => setCancelReason(reason)}
                    className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition-all ${
                      cancelReason === reason 
                        ? "border-[#2563eb] bg-[#eff6ff] text-[#2563eb]" 
                        : "border-gray-100 hover:bg-gray-50 text-[#64748b]"
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {setCancelBookingId(null); setCancelReason("");}}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-[#4a5568] text-sm font-bold rounded-xl transition-colors"
                >
                  Keep Booking
                </button>
                <button 
                  onClick={confirmCancel}
                  className="flex-1 py-3 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-bold rounded-xl shadow-lg transition-colors"
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default MyBookingsPage;
