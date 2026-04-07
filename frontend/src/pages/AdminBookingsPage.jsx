import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllBookings, approveBooking, rejectBooking } from "../services/bookingService";

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

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchBookings(filter);
  }, [filter]);

  const fetchBookings = async (statusFilter) => {
    setLoading(true);
    try {
      const data = await getAllBookings(statusFilter || null);
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveBooking(id);
      fetchBookings(filter); 
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve booking');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Please provide a reason for rejection:");
    if (reason !== null) {
      if (reason.trim() === '') {
        alert("A reason is required to reject a booking.");
        return;
      }
      try {
        await rejectBooking(id, reason);
        fetchBookings(filter);
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to reject booking');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">All Bookings (Admin View)</h1>
        
        <div className="flex items-center space-x-2">
           <label className="text-sm font-medium text-gray-700">Filter Status:</label>
           <select 
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
             className="border border-gray-300 rounded-md py-1 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
           >
             <option value="">All</option>
             <option value="PENDING">PENDING</option>
             <option value="APPROVED">APPROVED</option>
             <option value="REJECTED">REJECTED</option>
             <option value="CANCELLED">CANCELLED</option>
           </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading bookings...</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Slot</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3 justify-end flex"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No bookings found.</td></tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.resourceName}</div>
                      <div className="text-sm text-gray-500 overflow-hidden text-ellipsis w-32" title={booking.purpose}>{booking.purpose || 'No purpose'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.userName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(booking.startTime).toLocaleString()}</div>
                      <div className="text-sm text-gray-500">to {new Date(booking.endTime).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                       <Link to={`/bookings/${booking.id}`} className="text-indigo-600 hover:text-indigo-900 border border-indigo-200 px-2 py-1 rounded">View</Link>
                       {booking.status === 'PENDING' && (
                         <>
                           <button onClick={() => handleApprove(booking.id)} className="text-green-600 hover:bg-green-50 px-2 py-1 border border-green-200 rounded">Approve</button>
                           <button onClick={() => handleReject(booking.id)} className="text-red-600 hover:bg-red-50 px-2 py-1 border border-red-200 rounded">Reject</button>
                         </>
                       )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPage;
