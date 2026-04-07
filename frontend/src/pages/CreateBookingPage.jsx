import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { createBooking, getResourceById } from "../services/bookingService";

const CreateBookingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resourceId = searchParams.get('resourceId') || 'DEFAULT_RESOURCE_ID';
  
  const [formData, setFormData] = useState({
    resourceId: resourceId,
    resourceName: "",
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: 1,
  });

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const data = await getResourceById(resourceId);
        setResource(data);
        setFormData(prev => ({ 
          ...prev, 
          resourceName: data.name 
        }));
      } catch (err) {
        // Optional: Handle error silently or log
      } finally {
        setPageLoading(false);
      }
    };

    fetchResource();
  }, [resourceId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        setError('Already booked. ' + (err.response.data.message || ''));
      } else {
        setError(err.response?.data?.message || err.response?.data || "An error occurred while creating booking.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <div className="p-12 text-center text-slate-500">Loading resource...</div>;

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e]">
      <main className="max-w-7xl mx-auto px-12 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold mb-2">
            Create New Asset Booking
          </h1>
          <p className="text-slate-500 text-lg">
            Reserve smart campus resources, labs, and equipment for your upcoming sessions.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl">
            ✅ {success} 
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            ❌ {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Form Section */}
          <section className="lg:col-span-7 bg-white p-10 rounded-2xl shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Resource */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-500 ml-1">
                    Resource ID
                  </label>
                  <input
                    type="text"
                    name="resourceId"
                    value={formData.resourceId}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border-none rounded-xl p-4 text-slate-900 focus:ring-2 focus:ring-blue-200 transition-all pointer-events-none opacity-70"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-500 ml-1">
                    Resource Name
                  </label>
                  <input
                    type="text"
                    name="resourceName"
                    value={formData.resourceName}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border-none rounded-xl p-4 text-slate-900 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-500 ml-1">
                  Booking Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border-none rounded-xl p-4 text-slate-900 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              {/* Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-500 ml-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border-none rounded-xl p-4 text-slate-900 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-500 ml-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border-none rounded-xl p-4 text-slate-900 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
              </div>

              {/* Attendees */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-500 ml-1">
                  Expected Attendees
                </label>
                <input
                  type="number"
                  name="expectedAttendees"
                  value={formData.expectedAttendees}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full bg-slate-50 border-none rounded-xl p-4 text-slate-900 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              {/* Purpose */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-500 ml-1">
                  Purpose of Booking
                </label>
                <textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  required
                  placeholder="Briefly describe the session..."
                  rows="4"
                  className="w-full bg-slate-50 border-none rounded-xl p-4 text-slate-900 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="pt-6 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg disabled:opacity-50"
                >
                  {loading ? "Confirming..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          </section>

          {/* Right Side Info */}
          <aside className="lg:col-span-5 space-y-8">
            {/* Info Card */}
            <div
              className="p-8 rounded-2xl text-white relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #222a3e 0%, #384055 100%)",
              }}
            >
              <h3 className="text-2xl font-bold mb-2">Booking Guidelines</h3>
              <ul className="space-y-4 mt-4">
                <li className="flex gap-3 items-start">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  <p className="text-slate-300 text-sm">
                    Cancellations must be made 24 hours in advance.
                  </p>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  <p className="text-slate-300 text-sm">
                    Bookings are subject to admin approval.
                  </p>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  <p className="text-slate-300 text-sm">
                    Make sure the time slot is available before submitting.
                  </p>
                </li>
              </ul>
            </div>
            {resource && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h4 className="text-lg font-bold mb-4 text-slate-800">Resource Details</h4>
                <div className="space-y-2">
                  <p className="text-sm"><span className="font-semibold text-slate-600">Name:</span> {resource.name}</p>
                  <p className="text-sm"><span className="font-semibold text-slate-600">Type:</span> {resource.type}</p>
                  <p className="text-sm"><span className="font-semibold text-slate-600">Capacity:</span> {resource.capacity}</p>
                </div>
              </div>
            )}
           </aside>
        </div>
      </main>
    </div>
  );
};

export default CreateBookingPage;