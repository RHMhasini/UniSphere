import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBookingById, approveBooking, rejectBooking, cancelBooking } from "../../../services/bookingService";
import { useAuth } from "../../../context/AuthContext";
import "../../../styles/bookingPagesCSS/BookingDetailPage.css";

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

const BookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchBooking = async () => {
    try {
      const data = await getBookingById(id);
      setBooking(data);
    } catch (error) {
      console.error("Error fetching booking details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await approveBooking(id);
      fetchBooking(); 
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve booking');
    }
  };

  const handleReject = async () => {
    const reason = window.prompt("Please provide a reason for rejection:");
    if (reason !== null) {
      if (reason.trim() === '') {
        alert("A reason is required to reject a booking.");
        return;
      }
      try {
        await rejectBooking(id, reason);
        fetchBooking();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to reject booking');
      }
    }
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking(id);
        fetchBooking(); 
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to cancel booking');
      }
    }
  };

  if (loading) return <div className="p-12 text-center text-[#64748b]">Loading details...</div>;
  if (!booking) return <div className="p-12 text-center text-[#dc2626]">Booking not found.</div>;

  const isAdmin = user.role === 'ADMIN';
  const isOwner = user.id === booking.userId;

  return (
    <div className="bd-container">
      <div className="bd-back-nav">
        <button onClick={() => navigate(-1)} className="bd-back-btn">
          ← Back
        </button>
      </div>

      <div className="bd-card">
        <div className="bd-card-header">
          <div>
            <h3 className="bd-card-title">
              Booking Details
            </h3>
            <p className="bd-card-desc">
              Complete information regarding this resource reservation.
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>
        <div className="bd-card-body">
          <dl>
            <div className="bd-row-gray">
              <dt className="bd-label">Resource Name</dt>
              <dd className="bd-value-bold">{booking.resourceName}</dd>
            </div>
            <div className="bd-row-white">
              <dt className="bd-label">Booked By</dt>
              <dd className="bd-value">{booking.userName}</dd>
            </div>
            <div className="bd-row-gray">
              <dt className="bd-label">Time Slot</dt>
              <dd className="bd-value">
                {new Date(booking.startTime).toLocaleString()} — {new Date(booking.endTime).toLocaleString()}
              </dd>
            </div>
            <div className="bd-row-white">
              <dt className="bd-label">Purpose</dt>
              <dd className="bd-value">{booking.purpose}</dd>
            </div>
            <div className="bd-row-gray">
              <dt className="bd-label">Attendees expected</dt>
              <dd className="bd-value">{booking.expectedAttendees}</dd>
            </div>
            {booking.adminReason && (
              <div className="bd-row-red">
                <dt className="bd-label-red">Rejection Reason</dt>
                <dd className="bd-value-red">{booking.adminReason}</dd>
              </div>
            )}
            <div className="bd-row-gray">
              <dt className="bd-label">Timestamps</dt>
              <dd className="bd-value text-gray-500">
                Created on: {new Date(booking.createdAt).toLocaleString()} <br/>
                Last Updated: {new Date(booking.updatedAt).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
        
        {/* Actions Section based on Role and Status */}
        <div className="bd-card-footer">
           <div className="bd-action-group">
             {isAdmin && booking.status === 'PENDING' && (
                <>
                  <button onClick={handleReject} className="bd-btn-reject">
                    Reject Request
                  </button>
                  <button onClick={handleApprove} className="bd-btn-approve">
                    Approve Request
                  </button>
                </>
             )}

             {isOwner && booking.status === 'APPROVED' && (
                <button onClick={handleCancel} className="bd-btn-cancel">
                  Cancel Booking
                </button>
             )}
             
             {!isAdmin && booking.status === 'PENDING' && (
                <span className="bd-status-text">Waiting for admin approval...</span>
             )}
             
           </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;
