import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, LayoutGrid, List as ListIcon, AlertCircle, FileDown } from 'lucide-react';
import TicketCard from '../../components/tickets/TicketCard/TicketCard';
import Button from '../../components/common/Button/Button';
import '../../styles/ticketingPagesCSS/TicketDashboard.css';
import { ticketingApi } from '../../services/ticketingApi';
import { useAuth } from '../../context/AuthContext';

function TicketDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Normalise role — the real JWT payload uses user.role as a plain string (e.g. 'ADMIN').
  const role = user?.role || '';
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering & Search states
  const [filter, setFilter] = useState('ALL'); 
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketingApi.get('/tickets');
      const ticketsArray = data.value || data;
      setTickets(Array.isArray(ticketsArray) ? ticketsArray : []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    setExportLoading(true);
    try {
      const data = await ticketingApi.get('/tickets/stats/full-register');
      const list = Array.isArray(data) ? data : [];
      const { downloadTicketsCsv } = await import('../../utils/ticketReportCsv');
      downloadTicketsCsv(list);
    } catch (err) {
      alert(err.message || 'Could not download CSV report. Ensure you are signed in as an administrator.');
    } finally {
      setExportLoading(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesStatus = filter === 'ALL' || t.status === filter;
    const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesCategory && matchesSearch;
  });

  // Group stats
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter(t => t.status === 'RESOLVED').length,
  };

  const isAdmin = role === 'ADMIN';
  const isTech = role === 'TECHNICIAN';
  const isStudent = role === 'STUDENT' || role === 'LECTURER';
  // Base path for this user's ticket section
  const basePath = (isAdmin || isTech) ? '/dashboard/tickets' : '/dashboard/mytickets';

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Tickets & Maintenance</h1>
          <p className="dashboard-subtitle">Manage campus facility, software, and hardware requests.</p>
        </div>
        <div className="dashboard-actions">
          {isAdmin && (
            <Button variant="outline" onClick={handleExportCsv} disabled={exportLoading}>
              <FileDown size={18} /> {exportLoading ? 'Preparing CSV…' : 'Download CSV report'}
            </Button>
          )}
          <Button variant={showAdvancedFilters ? "primary" : "outline"} onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
            <Filter size={18} /> {showAdvancedFilters ? 'Hide Filters' : 'Filter'}
          </Button>
          {(isStudent || isAdmin) && (
            <Button variant="primary" onClick={() => navigate(`${basePath}/create`)}>
              <Plus size={18} /> New Ticket
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters Bar */}
      {showAdvancedFilters && (
        <div className="advanced-filters-bar">
          <div className="filter-group">
            <label>Category:</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="ALL">All Categories</option>
              <option value="HARDWARE">Hardware</option>
              <option value="SOFTWARE">Software</option>
              <option value="FACILITY">Facility</option>
            </select>
          </div>
          <Button variant="ghost" size="sm" onClick={() => {setCategoryFilter('ALL'); setFilter('ALL'); setSearchQuery('');}}>
            Reset All
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => setFilter('ALL')}>
          <h3>Total Requests</h3>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card stat-open" onClick={() => setFilter('OPEN')}>
          <h3>Open</h3>
          <div className="stat-value">{stats.open}</div>
        </div>
        <div className="stat-card stat-progress" onClick={() => setFilter('IN_PROGRESS')}>
          <h3>In Progress</h3>
          <div className="stat-value">{stats.inProgress}</div>
        </div>
        <div className="stat-card stat-resolved" onClick={() => setFilter('RESOLVED')}>
          <h3>Resolved</h3>
          <div className="stat-value">{stats.resolved}</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-content">
        <div className="content-toolbar">
          <div className="search-bar">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Search tickets by title..."
              aria-label="Search tickets by title" 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="view-toggles">
            <button className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><LayoutGrid size={20} /></button>
            <button className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><ListIcon size={20} /></button>
          </div>
        </div>

        {/* Tickets Grid */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading tickets...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <AlertCircle size={48} />
            <h3>Connection Error</h3>
            <p>{error}</p>
            <Button variant="outline" onClick={fetchTickets}>Try Again</Button>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="empty-state">
            <img src="https://illustrations.popsy.co/amber/student-going-to-school.svg" alt="No tickets" />
            <h3>No tickets found</h3>
            <p>You don't have any tickets matching your criteria.</p>
            <Button variant="primary" onClick={() => setFilter('ALL')}>View All Tickets</Button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "tickets-grid" : "tickets-list"}>
            {filteredTickets.map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TicketDashboard;
