import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBookingById, updateBooking, getAllBookings } from "../../services/bookingService";
import BookingTabs from "../../components/common/BookingTabs";
import "../../styles/bookingPagesCSS/CreateBookingPage.css"; // Reuse same styling

const EditBookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    resourceId: "",
    resourceName: "",
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: 25,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [conflict, setConflict] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await getBookingById(id);
        const start = new Date(data.startTime);
        const end = new Date(data.endTime);
        
        setFormData({
          resourceId: data.resourceId,
          resourceName: data.resourceName,
          date: start.toISOString().split('T')[0],
          startTime: start.toTimeString().slice(0, 5),
          endTime: end.toTimeString().slice(0, 5),
          purpose: data.purpose,
          expectedAttendees: data.expectedAttendees,
        });
      } catch (err) {
        setError("Failed to load booking details.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  // Conflict Checking Logic
  useEffect(() => {
    const checkConflicts = async () => {
      if (!formData.date || !formData.startTime || !formData.endTime || !formData.resourceId) {
        setConflict(null);
        return;
      }

      try {
        const all = await getAllBookings();
        const start = new Date(`${formData.date}T${formData.startTime}:00`);
        const end = new Date(`${formData.date}T${formData.endTime}:00`);

        const overlapping = all.find(b => {
          if (b.id === id) return false; // Exclude itself
          if (b.resourceId !== formData.resourceId) return false;
          if (b.status === 'REJECTED' || b.status === 'CANCELLED') return false;
          
          const bStart = new Date(b.startTime);
          const bEnd = new Date(b.endTime);
          
          return (start < bEnd && end > bStart);
        });

        if (overlapping) {
          setConflict({
            start: new Date(overlapping.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            end: new Date(overlapping.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        } else {
          setConflict(null);
        }
      } catch (err) {
        console.error("Conflict check failed:", err);
      }
    };

    const timer = setTimeout(checkConflicts, 500); 
    return () => clearTimeout(timer);
  }, [formData.date, formData.startTime, formData.endTime, formData.resourceId, id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (conflict) {
      setError("Please resolve the scheduling conflict before proceeding.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const startTime = `${formData.date}T${formData.startTime}:00`;
      const endTime = `${formData.date}T${formData.endTime}:00`;

      const bookingPayload = {
        resourceId: formData.resourceId,
        resourceName: formData.resourceName,
        startTime,
        endTime,
        purpose: formData.purpose,
        expectedAttendees: parseInt(formData.expectedAttendees),
      };

      await updateBooking(id, bookingPayload);

      setSuccess("Booking updated successfully!");
      setTimeout(() => {
        navigate('/dashboard/bookings');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || "An error occurred while updating booking.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center">Loading booking details...</div>;

  return (
    <div className="cb-container">
      <main className="cb-main w-full max-w-[1200px] mx-auto">
        <BookingTabs />
        
        <div className="cb-header-wrapper">
          <h1 className="cb-title">Update Your Booking</h1>
          <p className="cb-subtitle">Modify the time, capacity, or purpose for your reservation at {formData.resourceName}.</p>
        </div>

        {success && <div className="cb-alert-success">{success}</div>}
        {error && <div className="cb-alert-error">{error}</div>}

        {conflict && (
          <div className="cb-alert-warning mb-6 p-4 bg-[#fff7ed] border border-[#ffedd5] rounded-xl flex items-center gap-4 text-[#9a3412]">
            <div className="flex-shrink-0 w-8 h-8 bg-[#fb923c] text-white rounded-full flex items-center justify-center font-bold">!</div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-[#9a3412]">Booking Conflict Detected</h4>
              <p className="text-[11px] font-medium opacity-80">This resource is already reserved from {conflict.start} to {conflict.end} on this date.</p>
            </div>
          </div>
        )}

        <div className="cb-layout-grid">
          <section className="cb-form-section">
            <form onSubmit={handleSubmit} className="cb-form">
              
              <div className="cb-form-group">
                <label className="cb-label">Resource</label>
                <input type="text" value={formData.resourceName} readOnly className="cb-input opacity-70 bg-gray-100 cursor-not-allowed" />
              </div>

              <div className="cb-form-group">
                <label className="cb-label">Booking Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required className="cb-input cb-input-active" />
              </div>

              <div className="cb-form-row">
                <div className="cb-form-group">
                  <label className="cb-label">Start Time</label>
                  <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required className="cb-input cb-input-active" />
                </div>
                <div className="cb-form-group">
                  <label className="cb-label">End Time</label>
                  <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required className="cb-input cb-input-active" />
                </div>
              </div>

              <div className="cb-form-group">
                <label className="cb-label">Expected Attendees</label>
                <input type="number" name="expectedAttendees" value={formData.expectedAttendees} onChange={handleChange} required min="1" className="cb-input cb-input-active" />
              </div>

              <div className="cb-form-group">
                <label className="cb-label">Purpose of Booking</label>
                <textarea name="purpose" value={formData.purpose} onChange={handleChange} required rows="3" className="cb-textarea" />
              </div>

              <div className="cb-btn-wrapper">
                <button type="submit" disabled={saving || !!conflict} className="cb-btn-submit">
                  {saving ? "Updating..." : "Update Booking"}
                </button>
                <button type="button" onClick={() => navigate('/dashboard/bookings')} className="cb-btn-draft">
                  Cancel
                </button>
              </div>
            </form>
          </section>

          <aside className="cb-aside-section">
             <div className="cb-card-light">
               <h4 className="cb-card-light-title">Note on Updates</h4>
               <p className="text-sm text-gray-500 leading-relaxed">
                 Updating the time slot of an approved booking will reset its status to **PENDING** for administrative re-review. 
                 Changes to capacity or purpose also require confirmation.
               </p>
             </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default EditBookingPage;
