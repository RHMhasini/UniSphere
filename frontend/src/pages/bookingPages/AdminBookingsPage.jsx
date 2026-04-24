import { useState, useEffect } from "react";
import { getAllBookings, approveBooking, rejectBooking } from "../../services/bookingService";
import BookingTabs from "../../components/common/BookingTabs";
import "../../styles/bookingPagesCSS/AdminBookingsPage.css";

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: "text-gray-400 bg-transparent", 
    APPROVED: "text-[#2ac88c] bg-transparent",
    REJECTED: "text-[#dc2626] bg-transparent",
    CANCELLED: "text-[#64748b] bg-transparent",
  };
  
  const dots = {
    PENDING: "bg-gray-300", 
    APPROVED: "bg-[#2ac88c]",
    REJECTED: "bg-[#dc2626]",
    CANCELLED: "bg-[#64748b]",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`}></span>
      {status}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const styles = {
    HIGH: "bg-[#eff6ff] text-[#3b82f6]",
    CRITICAL: "bg-[#e0e7ff] text-[#4f46e5]",
    NORMAL: "bg-[#f3f4f6] text-[#6b7280]",
    MEDIUM: "bg-[#f3f4f6] text-[#6b7280]",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${styles[priority]}`}>
      {priority}
    </span>
  );
};

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL BOOKINGS");
  const [rejectionId, setRejectionId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await getAllBookings();
      setBookings(data);
    } catch (error) {
      console.error("Error fetching all bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveBooking(id);
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve booking');
    }
  };

  const handleReject = async (id) => {
    if (!rejectionReason.trim()) {
       alert("Rejection reason is required.");
       return;
    }
    try {
      await rejectBooking(id, rejectionReason);
      setRejectionId(null);
      setRejectionReason("");
      fetchBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject booking');
    }
  };

  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleExportData = () => {
    if (bookings.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = ["ID", "User", "Resource", "Start Time", "End Time", "Status", "Purpose"];
    const csvRows = [
      headers.join(","),
      ...bookings.map(b => [
        b.id,
        b.userName || b.userId || "Unknown",
        b.resourceName,
        b.startTime,
        b.endTime,
        b.status,
        `"${(b.purpose || "").replace(/"/g, '""')}"`
      ].join(","))
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", `bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleAdvancedFilters = () => {
    setShowFilters(!showFilters);
  };

  const tabs = ["ALL BOOKINGS", "PENDING", "APPROVED", "REJECTED", "CANCELLED"];
  
  // Apply Status Tab, Search Term, and Date Range filters
  const filteredBookings = bookings.filter(b => {
    const matchesStatus = filter === "ALL BOOKINGS" || b.status === filter;
    const matchesSearch = 
      (b.userName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
      (b.resourceName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (b.purpose?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    const bookingDate = new Date(b.startTime).toISOString().split('T')[0];
    const matchesFrom = !fromDate || bookingDate >= fromDate;
    const matchesTo = !toDate || bookingDate <= toDate;

    return matchesStatus && matchesSearch && matchesFrom && matchesTo;
  });

  if (loading) return <div className="p-12 text-center text-[#64748b]">Loading admin data...</div>;

  return (
    <div className="ab-container">
      <main className="ab-main w-full max-w-[1400px] mx-auto">
        <BookingTabs />
        
        {/* Header Section */}
        <div className="ab-header-wrapper">
          <div>
            <h1 className="ab-title">
              Campus Logistics
            </h1>
            <p className="ab-subtitle">
              Global management of all facility reservations and smart access tokens.
            </p>
          </div>
          <div className="ab-header-actions">
            <button onClick={handleExportData} className="ab-btn-ghost">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export CSV
            </button>
            <button onClick={handleAdvancedFilters} className={`ab-btn-ghost ${showFilters ? 'bg-gray-100' : ''}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              {showFilters ? 'Hide Filters' : 'Advanced Filters'}
            </button>
          </div>
        </div>

        {/* Advanced Filter Panel (Search) */}
        {showFilters && (
          <div className="mb-6 p-4 bg-white border border-gray-100 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Search Bookings</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  </span>
                  <input 
                    type="text" 
                    placeholder="Search by student name, resource, or purpose..." 
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2ac88c] focus:border-transparent transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="w-1/4">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">From Date</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2ac88c] transition-all"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>

              <div className="w-1/4">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">To Date</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2ac88c] transition-all"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>

              <button 
                onClick={() => {setSearchTerm(""); setFromDate(""); setToDate(""); setShowFilters(false);}}
                className="mt-5 text-sm text-gray-400 hover:text-gray-600 font-medium whitespace-nowrap"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Metric Cards Row */}
        <div className="ab-metric-row">
          <div className="ab-metric-card-green">
             <p className="ab-metric-label">Total Active</p>
             <h2 className="ab-metric-value">{bookings.filter(b => b.status === "APPROVED").length}</h2>
             <p className="ab-metric-desc-green">
               <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
               +12% from last week
             </p>
          </div>
          <div className="ab-metric-card-blue">
             <p className="ab-metric-label">Pending Approval</p>
             <h2 className="ab-metric-value">{bookings.filter(b => b.status === "PENDING").length}</h2>
             <p className="ab-metric-desc">Requires immediate action</p>
          </div>
          <div className="ab-metric-card-gray">
             <p className="ab-metric-label">Today's Check-ins</p>
             <h2 className="ab-metric-value">315</h2>
             <p className="ab-metric-desc">Peak occupancy at 2:00 PM</p>
          </div>
          <div className="ab-metric-card-red">
             <p className="ab-metric-label">Cancellations</p>
             <h2 className="ab-metric-value">{bookings.filter(b => b.status === "CANCELLED").length}</h2>
             <p className="ab-metric-desc-red">
               <span className="ab-alert-icon">!</span>
               2 high-priority spaces
             </p>
          </div>
        </div>

        {/* Table Section */}
        <div className="ab-table-container">
          
          {/* Tabs */}
          <div className="ab-tabs-wrapper">
            <div className="ab-tabs-list">
              {tabs.map(tab => (
                <button 
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={filter === tab ? "ab-tab-btn-active" : "ab-tab-btn-inactive"}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="ab-tab-results">
              Showing {filteredBookings.length} results
            </div>
          </div>

          {/* Table Headers */}
          <div className="ab-table-header-row">
             <div className="ab-th-large">Requester / Project</div>
             <div className="ab-th-large">Facility & Resource</div>
             <div className="ab-th-medium">Schedule</div>
             <div className="ab-th-small">Priority</div>
             <div className="ab-th-center">Status</div>
             <div className="ab-th-right">Actions</div>
          </div>

          {/* Table Rows */}
          <div className="ab-table-body">
            {filteredBookings.length === 0 ? (
               <div className="ab-table-empty">No reservations found in this category.</div>
            ) : (
              filteredBookings.map((booking) => {
                const priorities = ["NORMAL", "HIGH", "CRITICAL", "MEDIUM"];
                const priority = priorities[booking.id?.length % 4 || 0] || "NORMAL";
                const initials = (booking.userName || "Unknown User").split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase();

                return (
                  <div key={booking.id} className="ab-table-row">
                    
                    {/* Requester */}
                    <div className="ab-col-requester">
                      <div className="ab-avatar">{initials}</div>
                      <div>
                        <div className="ab-requester-name">{booking.userName || booking.userId || 'Guest User'}</div>
                        <div className="ab-requester-desc">{booking.purpose || 'General Use'}</div>
                      </div>
                    </div>

                    {/* Facility */}
                    <div className="ab-col-facility">
                      <div className="ab-facility-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                      </div>
                      <div>
                        <div className="ab-facility-name">{booking.resourceName}</div>
                        <div className="ab-facility-badge">Resource Active</div>
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="ab-col-schedule">
                      <div className="ab-schedule-date">
                        {new Date(booking.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="ab-schedule-time">
                         {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {/* Priority */}
                    <div className="ab-col-priority">
                      <PriorityBadge priority={priority} />
                    </div>

                    {/* Status */}
                    <div className="ab-col-status">
                      <StatusBadge status={booking.status} />
                    </div>

                    {/* Actions */}
                    <div className="ab-col-actions relative">
                       {booking.status === "PENDING" && (
                         <>
                           {rejectionId === booking.id ? (
                             <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-gray-200 shadow-xl rounded-xl p-3 z-50 w-64 animate-in fade-in zoom-in-95 duration-200">
                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Specify Reason</p>
                               <div className="flex flex-wrap gap-1.5 mb-3">
                                 {["Maintenance", "Capacity", "Priority Event", "Incomplete"].map(r => (
                                   <button 
                                     key={r}
                                     onClick={() => setRejectionReason(r)}
                                     className="text-[9px] font-bold px-2 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors"
                                   >
                                     {r}
                                   </button>
                                 ))}
                               </div>
                               <input 
                                 autoFocus
                                 type="text"
                                 placeholder="Type reason..."
                                 className="w-full px-3 py-1.5 bg-gray-50 border border-gray-100 rounded text-xs mb-3 focus:outline-none focus:ring-1 focus:ring-red-500"
                                 value={rejectionReason}
                                 onChange={(e) => setRejectionReason(e.target.value)}
                               />
                               <div className="flex gap-2">
                                 <button onClick={() => {setRejectionId(null); setRejectionReason("");}} className="flex-1 py-1.5 text-[10px] font-bold text-gray-400 hover:text-gray-600">Cancel</button>
                                 <button onClick={() => handleReject(booking.id)} className="flex-1 py-1.5 bg-red-500 text-white text-[10px] font-bold rounded shadow-sm hover:bg-red-600">Submit</button>
                               </div>
                             </div>
                           ) : (
                             <div className="flex gap-2">
                               <button onClick={() => handleApprove(booking.id)} className="ab-action-approve">
                                 Approve
                               </button>
                               <button onClick={() => setRejectionId(booking.id)} className="ab-action-reject">
                                 Reject
                               </button>
                             </div>
                           )}
                         </>
                       )}
                    </div>

                  </div>
                );
              })
            )}
          </div>
          
          {/* Pagination Footer */}
          <div className="ab-pagination-wrapper">
            <div className="ab-page-nums">
              <span className="ab-page-num-active">1</span>
              <span className="ab-page-num-inactive">2</span>
              <span className="ab-page-dots">...</span>
            </div>
            <div className="ab-page-nav-wrapper">
               <button className="ab-page-nav-btn">&lt; Previous</button>
               <button className="ab-page-nav-btn">Next &gt;</button>
            </div>
          </div>

        </div>

        {/* Analytics Dashboard */}
        <div className="ab-analytics-grid">
          
          {/* Chart 1: Daily Demand (Line Chart) */}
          <div className="ab-chart-card">
            <h3 className="ab-chart-title">Demand Velocity</h3>
            <p className="ab-chart-subtitle">Daily reservation volume (Last 7 Days)</p>
            <div className="ab-chart-container">
              <svg width="100%" height="80" viewBox="0 0 400 80" className="overflow-visible">
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2ac88c" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#2ac88c" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,70 Q50,40 100,55 T200,30 T300,45 T400,10 L400,80 L0,80 Z" fill="url(#lineGrad)" />
                <path d="M0,70 Q50,40 100,55 T200,30 T300,45 T400,10" fill="none" stroke="#2ac88c" strokeWidth="2.5" strokeLinecap="round" />
                {[0, 100, 200, 300, 400].map(x => (
                  <circle key={x} cx={x} cy={x === 200 ? 30 : x === 400 ? 10 : 60} r="3" fill="#2ac88c" stroke="white" strokeWidth="1.5" />
                ))}
              </svg>
              <div className="ab-chart-labels">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                  <span key={day} className="text-[9px] text-gray-400 font-bold uppercase">{day}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 2: Resource Mix (Bar Chart) */}
          <div className="ab-chart-card">
            <h3 className="ab-chart-title">Resource Utilization</h3>
            <p className="ab-chart-subtitle">Most active facilities this month</p>
            <div className="ab-chart-bars">
              {[
                { n: 'Main Hall', p: 88, c: '#1e293b' },
                { n: 'Innovation Lab', p: 65, c: '#2ac88c' },
                { n: 'Physics Lab', p: 40, c: '#48536f' }
              ].map(res => (
                <div key={res.n} className="ab-bar-row">
                  <div className="flex justify-between text-[10px] font-bold mb-1 uppercase tracking-tight">
                    <span className="text-gray-600">{res.n}</span>
                    <span className="text-gray-400">{res.p}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${res.p}%`, backgroundColor: res.c }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 3: Approval Confidence (Gauge) */}
          <div className="ab-chart-card flex flex-col items-center">
            <h3 className="ab-chart-title w-full">System Trust Score</h3>
            <p className="ab-chart-subtitle w-full">Request Approval Performance</p>
            <div className="relative w-32 h-32 mt-2">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="16" fill="none" stroke="#2ac88c" strokeWidth="3.5" strokeDasharray="85, 100" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-[#1e293b]">92%</span>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Efficiency</span>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default AdminBookingsPage;
