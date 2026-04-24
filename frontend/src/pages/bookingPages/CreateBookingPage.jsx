import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { createBooking, getResourceById, getAllBookings } from "../../services/bookingService";
import BookingTabs from "../../components/common/BookingTabs";
import "../../styles/bookingPagesCSS/CreateBookingPage.css";

const CreateBookingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resourceId = searchParams.get('resourceId') || '';
  
  const [formData, setFormData] = useState({
    resourceId: resourceId,
    resourceName: "Advanced Robotics Lab",
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: 25,
  });

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [conflict, setConflict] = useState(null);

  const [resources, setResources] = useState([]);
  
  // Fetch all resources for dropdown
  useEffect(() => {
    const fetchAllResources = async () => {
      try {
        const { default: api } = await import("../../services/resourceService.js");
        const res = await api.get('/resources');
        setResources(res.data || []);
      } catch (err) {
        console.error("Failed to load resources catalog:", err);
      }
    };
    fetchAllResources();
  }, []);

  useEffect(() => {
    const fetchResource = async () => {
      if (!resourceId) return;
      try {
        const data = await getResourceById(resourceId);
        setResource(data);
        setFormData(prev => ({ 
          ...prev, 
          resourceName: data.name 
        }));
      } catch (error) {
        console.error("Error fetching resource:", error);
      }
    };

    fetchResource();
  }, [resourceId]);

  // Conflict Checking Logic
  useEffect(() => {
    const checkConflicts = async () => {
      if (!formData.date || !formData.startTime || !formData.endTime) {
        setConflict(null);
        return;
      }

      try {
        const all = await getAllBookings();
        const start = new Date(`${formData.date}T${formData.startTime}:00`);
        const end = new Date(`${formData.date}T${formData.endTime}:00`);

        const overlapping = all.find(b => {
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

    const timer = setTimeout(checkConflicts, 500); // Debounce
    return () => clearTimeout(timer);
  }, [formData.date, formData.startTime, formData.endTime, formData.resourceId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

      const handleSubmit = async (e) => {
    e.preventDefault();
    if (conflict) {
      setError("Please resolve the scheduling conflict before proceeding.");
      return;
    }
    setLoading(true);
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

      await createBooking(bookingPayload);

      setSuccess("Booking created successfully! Status: PENDING");
      setTimeout(() => {
        navigate('/my-bookings');
      }, 2000);
      
    } catch (err) {
      if (err.response && err.response.status === 400) {
        // Typically validation errors or conflict
        setError(err.response.data.message || err.response.data || 'Validation failed. Please check your inputs.');
      } else {
        setError(err.response?.data?.message || err.response?.data || "An error occurred while creating booking.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cb-container">
      <main className="cb-main w-full max-w-[1200px] mx-auto">
        <BookingTabs />
        
        {/* Page Header */}
        <div className="cb-header-wrapper">
          <h1 className="cb-title">
            Create New Asset Booking
          </h1>
          <p className="cb-subtitle">
            Reserve smart campus resources, labs, and equipment for your upcoming sessions.
          </p>
        </div>

        {/* Status Messages */}
        {success && (
          <div className="cb-alert-success">
             {success} 
          </div>
        )}

        {error && (
          <div className="cb-alert-error">
             {error}
          </div>
        )}

        {conflict && (
          <div className="cb-alert-warning mb-6 p-4 bg-[#fff7ed] border border-[#ffedd5] rounded-xl flex items-center gap-4 text-[#9a3412] animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="flex-shrink-0 w-8 h-8 bg-[#fb923c] text-white rounded-full flex items-center justify-center font-bold">!</div>
            <div className="flex-1 text-[#9a3412]">
              <h4 className="text-sm font-bold text-[#9a3412]">Booking Conflict Detected</h4>
              <p className="text-[11px] font-medium opacity-80 mt-0.5">This resource is already reserved from {conflict.start} to {conflict.end} on this date. Please select a different time slot.</p>
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="cb-layout-grid">
          
          {/* Form Section */}
          <section className="cb-form-section">
            <form onSubmit={handleSubmit} className="cb-form">
              
              <div className="cb-form-group">
                <label className="cb-label">
                  Select Resource
                </label>
                <select
                  name="resourceId"
                  value={formData.resourceId}
                  onChange={(e) => {
                    const selectedRes = resources.find(r => r.id === e.target.value);
                    handleChange(e);
                    if (selectedRes) {
                      setFormData(prev => ({ ...prev, resourceId: selectedRes.id, resourceName: selectedRes.name }));
                    }
                  }}
                  required
                  className="cb-input cb-input-active p-3 bg-white"
                >
                  <option value="" disabled>-- Select a building or lab --</option>
                  {resources.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="cb-form-group">
                <label className="cb-label">
                  Booking Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="cb-input cb-input-active"
                  />
                </div>
              </div>

              <div className="cb-form-row">
                <div className="cb-form-group">
                  <label className="cb-label">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                    className="cb-input cb-input-active"
                  />
                </div>
                <div className="cb-form-group">
                  <label className="cb-label">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                    className="cb-input cb-input-active"
                  />
                </div>
              </div>

              <div className="cb-form-group">
                <label className="cb-label">
                  Expected Attendees
                </label>
                <input
                  type="number"
                  name="expectedAttendees"
                  value={formData.expectedAttendees}
                  onChange={handleChange}
                  required
                  min="1"
                  className="cb-input cb-input-active"
                />
              </div>

              <div className="cb-form-group">
                <label className="cb-label">
                  Purpose of Booking
                </label>
                <textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                  placeholder="Briefly describe the session or project requirements..."
                  rows="3"
                  className="cb-textarea"
                />
              </div>

              <div className="cb-btn-wrapper">
                <button
                  type="submit"
                  disabled={loading || !!conflict}
                  className={`cb-btn-submit ${(loading || !!conflict) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? "Confirming..." : "Confirm Booking"}
                </button>
                <button
                  type="button"
                  className="cb-btn-draft"
                >
                  Save as Draft
                </button>
              </div>
            </form>
          </section>

          {/* Right Side Info */}
          <aside className="cb-aside-section">
            
            {/* Dark Capacity Card */}
            <div className="cb-card-dark">
               <div className="cb-card-dark-inner">
                 <div className="cb-insight-header">
                   <div className="cb-insight-icon-box">
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                   </div>
                   <span className="cb-insight-label">Resource Insight</span>
                 </div>
                 
                 <h3 className="cb-card-title">Real-time Capacity</h3>
                 <p className="cb-card-desc">
                   The Robotics Wing currently shows 85% availability for the selected dates. Early booking recommended.
                 </p>

                 <div className="cb-stat-list">
                   <div className="cb-stat-row">
                     <span className="cb-stat-label">Network Speed</span>
                     <span className="cb-stat-value">10 Gbps</span>
                   </div>
                   <div className="cb-stat-row">
                     <span className="cb-stat-label">Smart Sensors</span>
                     <span className="cb-stat-value">Online</span>
                   </div>
                 </div>
               </div>
            </div>

            {/* Light Guidelines Card */}
            <div className="cb-card-light">
              <h4 className="cb-card-light-title">Booking Guidelines</h4>
              <ul className="cb-bullet-list">
                <li className="cb-bullet-item">
                  <div className="cb-bullet-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <p className="cb-bullet-text">
                    Cancellations must be made 24 hours in advance to avoid asset idling penalties.
                  </p>
                </li>
                <li className="cb-bullet-item">
                  <div className="cb-bullet-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <p className="cb-bullet-text">
                    All equipment usage must be logged through the local IoT terminal.
                  </p>
                </li>
                <li className="cb-bullet-item">
                  <div className="cb-bullet-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <p className="cb-bullet-text">
                    Technical support can be requested during the 'Purpose' description.
                  </p>
                </li>
              </ul>
            </div>

            {/* Lab Image Placeholder */}
            <div className="cb-image-placeholder">
              <div className="cb-image-overlay"></div>
              <div className="cb-image-content">
                <span className="cb-image-text">Equipment Setup<br/>Reference Image</span>
              </div>
            </div>

           </aside>
        </div>
      </main>
    </div>
  );
};

export default CreateBookingPage;
