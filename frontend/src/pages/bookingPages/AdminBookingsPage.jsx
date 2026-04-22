import { useState, useEffect } from "react";
import { getAllBookings, approveBooking, rejectBooking } from "../../services/bookingService";
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
    const reason = window.prompt("Please provide a reason for rejection:");
    if (reason !== null) {
      if (reason.trim() === '') {
         alert("Rejection reason is required.");
         return;
      }
      try {
        await rejectBooking(id, reason);
        fetchBookings();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to reject booking');
      }
    }
  };

  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
  
  // Apply both Status Tab filter and Search Term filter
  const filteredBookings = bookings.filter(b => {
    const matchesStatus = filter === "ALL BOOKINGS" || b.status === filter;
    const matchesSearch = 
      (b.userName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
      (b.resourceName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (b.purpose?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) return <div className="p-12 text-center text-[#64748b]">Loading admin data...</div>;

  return (
    <div className="ab-container">
      <main className="ab-main">
        
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
              <button 
                onClick={() => {setSearchTerm(""); setShowFilters(false);}}
                className="mt-5 text-sm text-gray-400 hover:text-gray-600 font-medium"
              >
                Clear
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
                    <div className="ab-col-actions">
                       {booking.status === "PENDING" && (
                         <>
                           <button onClick={() => handleApprove(booking.id)} className="ab-action-approve">
                             Approve
                           </button>
                           <button onClick={() => handleReject(booking.id)} className="ab-action-reject">
                             Reject
                           </button>
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

        {/* Bottom Intel Cards */}
        <div className="ab-bottom-grid">
          
          <div className="ab-insight-card" style={{ background: "linear-gradient(135deg, #2b3245 0%, #3e475f 100%)" }}>
             <h3 className="ab-insight-title">Operational Efficiency Insight</h3>
             <p className="ab-insight-desc">
               Your facility utilization is up 14% this month. Bio-Core Lab B2 is reaching peak capacity on Tuesday mornings.
             </p>
             
             <div className="ab-insight-metrics-grid">
               <div className="ab-insight-metric-box">
                 <p className="ab-insight-metric-label">Most Popular Space</p>
                 <h4 className="ab-insight-metric-value">Innovation Center</h4>
               </div>
               <div className="ab-insight-metric-box">
                 <p className="ab-insight-metric-label">Avg. Response Time</p>
                 <h4 className="ab-insight-metric-value">4.2 Hours</h4>
               </div>
             </div>
          </div>

          <div className="ab-logs-card">
            <h3 className="ab-logs-title">Recent System Logs</h3>
            <ul className="ab-logs-list">
              <li className="ab-log-item">
                <span className="ab-log-dot-green"></span>
                <div>
                  <p className="ab-log-title">Auto-approved 5 recurring lab bookings</p>
                  <p className="ab-log-desc">System • 12 mins ago</p>
                </div>
              </li>
              <li className="ab-log-item">
                <span className="ab-log-dot-red"></span>
                <div>
                  <p className="ab-log-title">Smart Lock offline: Wing C Corridor</p>
                  <p className="ab-log-desc">Hardware • 45 mins ago</p>
                </div>
              </li>
              <li className="ab-log-item">
                <span className="ab-log-dot-blue"></span>
                <div>
                  <p className="ab-log-title">New booking request: Auditorium</p>
                  <p className="ab-log-desc">Staff Portal • 1 hour ago</p>
                </div>
              </li>
            </ul>
            <button className="ab-logs-link">
              View All System Audits <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>

        </div>

      </main>
    </div>
  );
};

export default AdminBookingsPage;
