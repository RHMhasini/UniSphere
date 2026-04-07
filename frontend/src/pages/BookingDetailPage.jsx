import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBookingById, approveBooking, rejectBooking, cancelBooking } from "../services/bookingService";
import { useAuth } from "../context/AuthContext";

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    CANCELLED: "bg-gray-100 text-gray-800",
  };
  return (
    <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full shadow-sm ${styles[status]}`}>
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

  if (loading) return <div className="p-12 text-center text-slate-500">Loading details...</div>;
  if (!booking) return <div className="p-12 text-center text-red-500">Booking not found.</div>;

  const isAdmin = user.role === 'ADMIN';
  const isOwner = user.id === booking.userId;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center">
          ← Back
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
          <div>
            <h3 className="text-xl leading-6 font-bold text-gray-900">
              Booking Details
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Complete information regarding this resource reservation.
            </p>
          </div>
          <StatusBadge status={booking.status} />
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Resource Name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-semibold">{booking.resourceName}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Booked By</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{booking.userName}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Time Slot</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(booking.startTime).toLocaleString()} — {new Date(booking.endTime).toLocaleString()}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Purpose</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{booking.purpose}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Attendees expected</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{booking.expectedAttendees}</dd>
            </div>
            {booking.adminReason && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-l-4 border-red-400">
                <dt className="text-sm font-medium text-red-500">Rejection Reason</dt>
                <dd className="mt-1 text-sm text-red-800 font-semibold sm:mt-0 sm:col-span-2">{booking.adminReason}</dd>
              </div>
            )}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Timestamps</dt>
              <dd className="mt-1 text-sm text-gray-500 sm:mt-0 sm:col-span-2">
                Created on: {new Date(booking.createdAt).toLocaleString()} <br/>
                Last Updated: {new Date(booking.updatedAt).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
        
        {/* Actions Section based on Role and Status */}
        <div className="bg-white px-4 py-5 sm:px-6 border-t border-gray-200">
           <div className="flex justify-end gap-4 space-x-3">
             {isAdmin && booking.status === 'PENDING' && (
                <>
                  <button onClick={handleReject} className="bg-red-50 hover:bg-red-100 text-red-700 font-bold py-2 px-6 rounded border border-red-200">
                    Reject Request
                  </button>
                  <button onClick={handleApprove} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded shadow">
                    Approve Request
                  </button>
                </>
             )}

             {isOwner && booking.status === 'APPROVED' && (
                <button onClick={handleCancel} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded border border-gray-300">
                  Cancel Booking
                </button>
             )}
             
             {!isAdmin && booking.status === 'PENDING' && (
                <span className="text-sm text-gray-500 italic">Waiting for admin approval...</span>
             )}
             
           </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;
