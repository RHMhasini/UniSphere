import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyBookings, cancelBooking } from "../services/bookingService";

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    CANCELLED: "bg-gray-100 text-gray-800",
  };
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>
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
        fetchBookings(); // Refresh the list
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to cancel booking');
      }
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500">Loading bookings...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <Link to="/booking/create?resourceId=res_123" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
          New Booking
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center text-gray-500">
          No bookings found. Create one to get started!
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {bookings.map((booking) => (
              <li key={booking.id}>
                <div className="block hover:bg-gray-50 flex justify-between items-center px-4 py-4 sm:px-6">
                  <div className="flex flex-col flex-grow">
                    <Link to={`/bookings/${booking.id}`} className="text-indigo-600 font-medium hover:underline text-lg truncate">
                      {booking.resourceName}
                    </Link>
                    <div className="mt-2 text-sm text-gray-500 flex flex-col sm:flex-row sm:space-x-4">
                      <span>
                        <span className="font-semibold text-gray-700">From:</span> {new Date(booking.startTime).toLocaleString()}
                      </span>
                      <span>
                        <span className="font-semibold text-gray-700">To:</span> {new Date(booking.endTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2">
                       <StatusBadge status={booking.status} />
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                     <Link to={`/bookings/${booking.id}`} className="text-gray-500 hover:text-indigo-600 font-medium text-sm border px-3 py-1 rounded">View</Link>
                     {booking.status === 'APPROVED' && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 font-medium text-sm border border-red-200 px-3 py-1 rounded"
                        >
                          Cancel
                        </button>
                      )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
